# aalkaswan/olmo3-mix-6T-portrait

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un *data portrait*: una representación consultable del corpus de preentrenamiento de OLMo 3. En concreto, indexa `allenai/dolma3_mix-6T-1025-7B` (commit `2ca900fbe14e86c5c83d064d9f0882f1c0b8c05b`), la mezcla de preentrenamiento del modelo OLMo-3-7B de AI2, mediante filtros de Bloom construidos sobre n-gramas de texto normalizado.

El artefacto lo publica el usuario `aalkaswan` apoyándose en el framework [data-portraits](https://github.com/ruyimarone/data-portraits) de ruyimarone. El texto se normaliza y se segmenta en n-gramas de 50 caracteres con paso (*stride*) de 50, lo que genera aproximadamente 578.000 millones de n-gramas, de los cuales unos 183.000 millones son únicos. Ese volumen no cabe en un único filtro en RAM, así que se divide por directorio de origen en 6 filtros de Bloom independientes, cada uno publicado como una revisión distinta del repositorio.

Su relevancia es de auditoría de datos: permite comprobar si un fragmento de texto concreto (por ejemplo, un ítem de un benchmark) aparece en la mezcla de preentrenamiento de OLMo 3, lo que sirve para detectar contaminación, analizar solapamientos entre corpus y atribuir el origen de los datos. No genera texto, no tiene pesos y no se ejecuta como modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable: artefacto de filtros de Bloom, no una red neuronal |
| Parámetros totales | No aplicable (el modelo indexado, OLMo-3-7B, ronda los 7.000 millones de parámetros) |
| Parámetros activos | No aplicable |
| Longitud de contexto | No aplicable; la unidad de indexación es el n-grama de 50 caracteres |
| Tipos de cuantización | No aplicable (los datos se almacenan como shards binarios de filtros) |
| Idiomas soportados | No disponible (heredados de la composición del mix Dolma 3) |
| Licencia | no disponible |
| Formato de pesos | No aplicable; shards binarios de filtros de Bloom más `partitions.json` |
| Corpus indexado | `allenai/dolma3_mix-6T-1025-7B` @ `2ca900fbe14e86c5c83d064d9f0882f1c0b8c05b` |
| N-gramas | ~578.000 millones en total, ~183.000 millones únicos |
| Particiones | 6 filtros de Bloom independientes |
| Tasa de falsos positivos | ≤ 0,01 combinada; 0,00167 por filtro |
| Tamaño del repositorio | 396,2 GB |
| Descargas / likes | 0 / 0 |

Particiones publicadas como revisiones del repositorio:

| Partición | Tag | Shards | Tamaño |
|---|---|---|---|
| 0 | `p0of6` | 15.778 | 76 GiB |
| 1 | `p1of6` | 11.033 | 60 GiB |
| 2 | `p2of6` | 12.298 | 58 GiB |
| 3 | `p3of6` | 7.490 | 58 GiB |
| 4 | `p4of6` | 7.689 | 58 GiB |
| 5 | `p5of6` | 11.430 | 58 GiB |

## Arquitectura y entrenamiento

El artefacto se construye en dos fases. Primero se normaliza el texto siguiendo las convenciones del proyecto data-portraits y se tokeniza en n-gramas de 50 caracteres con paso 50, es decir, sin solapamiento entre fragmentos consecutivos. Después, cada n-grama se inserta en un filtro de Bloom. Como el mix completo produce unos 578.000 millones de n-gramas (unos 183.000 millones únicos), el índice se particiona por directorio de origen en 6 filtros, y cada partición se publica como una revisión git independiente (`tag p<i>of6`, rama `partition-<i>`). El fichero `partitions.json` documenta qué shards fueron a parar a cada partición.

La consulta funciona por disyunción: se comprueba la pertenencia en cada partición y se combina el resultado con un OR. De ahí que la tasa de falsos positivos agregada sea la suma de las individuales (0,01 frente a 0,00167 por filtro). El modelo subyacente indexado, OLMo 3 de AI2, es un transformer denso (7B y 32B en la familia) entrenado sobre Dolma 3, un corpus de aproximadamente 9,3 billones de tokens según la documentación pública, con recetas de datos, pipeline y checkpoints abiertos. El mix concreto que indexa este repositorio es la variante de 6 billones de tokens (`dolma3_mix-6T-1025-7B`). No se detalla en la información disponible si la mezcla incorpora etapas de RLHF o DPO, ya que aquí se trata únicamente de la fase de preentrenamiento.

## Capacidades

- Consulta de pertenencia (*membership query*) sobre la mezcla de preentrenamiento de OLMo 3 a nivel de n-grama de 50 caracteres.
- Soporte de consulta secuencial sobre las 6 particiones mediante la clase `SequentialPortrait`.
- Búsqueda de cadenas de coincidencia (*chains*) con ordenación por longitud, útil para reconstruir la extensión de un solapamiento.
- Tasa de falsos positivos acotada y declarada (≤ 0,01 combinada), lo que permite razonar sobre la fiabilidad de los resultados.
- Trazabilidad hasta el commit concreto de la mezcla de datos (`2ca900f...`), gracias a la construcción sobre un snapshot inmutable.
- Base para análisis de contaminación de benchmarks, solapamiento entre corpus y curaduría de datasets.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidad multilingüe: no es un modelo de inferencia.

## Casos de uso

- Detección de contaminación de benchmarks: antes de evaluar un modelo sobre un conjunto de test, se consulta cada ítem contra el portrait para comprobar si su texto (o fragmentos largos de él) aparecía ya en el preentrenamiento, lo que invalidaría la medición.
- Auditoría de datasets de evaluación propios: un equipo que construye un benchmark interno puede verificar que sus preguntas no estén presentes en la mezcla de OLMo 3 y publicar esa verificación con el commit de referencia.
- Análisis de solapamiento entre corpus: dado otro dataset (por ejemplo, C4 o FineWeb), se pueden muestrear documentos, lanzarlos contra el portrait y estimar la fracción de contenido compartido con Dolma 3.
- Curaduría y deduplicación de mezclas de entrenamiento: al conocer qué n-gramas ya están en la mezcla de 6T, se puede decidir qué añadir sin duplicar masivamente señal de preentrenamiento.
- Investigación en atribución de datos: comparar la respuesta de un modelo OLMo 3 con la presencia o ausencia de un pasaje en su corpus de entrenamiento para estudiar relaciones dato-comportamiento.
- Reproducibilidad de experimentos: fijar el commit `2ca900fbe14e86c5c83d064d9f0882f1c0b8c05b` y consultar el portrait permite reproducir exactamente el mismo estado de la mezcla en estudios posteriores.
- Filtrado de prompts o documentos en producción: si un sistema debe evitar texto que ya formaba parte de un corpus público conocido, el portrait sirve como capa de comprobación previa, siempre asumiendo la tasa de falsos positivos declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no evalúa calidad de modelo, sino cobertura y pertenencia de datos; sus métricas relevantes son las ya citadas: ~578.000 millones de n-gramas totales, ~183.000 millones únicos, 6 particiones y una tasa de falsos positivos combinada ≤ 0,01.

## Requisitos de hardware

- GPU: no se requiere ninguna. La consulta es una operación de hashing y comprobación de bits sobre estructuras en memoria, ejecutable en CPU.
- VRAM estimada: no aplicable (0 GB de VRAM).
- Almacenamiento: 396,2 GB para el repositorio completo; las particiones individuales van de 58 GiB a 76 GiB.
- Memoria RAM: hay que poder cargar en memoria las particiones consultadas. Dado el tamaño por partición (58-76 GiB), una consulta completa a las 6 particiones exige del orden de cientos de gigabytes de RAM si se cargan todas a la vez; el uso de `SequentialPortrait` sugiere procesamiento secuencial, lo que reduce el pico a una partición más el estado de la consulta.
- Despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI. El acceso se hace vía la librería `data-portraits` y el módulo `olmo3_portrait.query`.
- Latencia y throughput: no disponibles. Dependen del número de particiones cargadas, del soporte de memoria y de la longitud del texto consultado.

## Comparativa con modelos similares

No disponible. No se han proporcionado en la información datos de otros data portraits comparables (por ejemplo, portraits de otros mixes, índices de subcadenas exactas o soluciones basadas en MinHash) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni admite inferencia; cualquier uso como LLM es un error de categoría.
- Granularidad limitada: la indexación trabaja con n-gramas de 50 caracteres y paso 50, por lo que coincidencias parciales o fragmentos más cortos no se detectan de forma fiable.
- Falsos positivos: la tasa combinada puede llegar al 1 %, de modo que una coincidencia positiva no es prueba concluyente de presencia en el corpus. No hay falsos negativos declarados, aunque conviene verificar con búsqueda exacta en los casos críticos.
- Licencia no especificada: el repositorio no declara licencia, lo que impide asumir derechos de uso comercial o de redistribución. Hay que contactar con el autor antes de cualquier uso en producción.
- Naturaleza derivada: el artefacto se construye sobre `allenai/dolma3_mix-6T-1025-7B`; las condiciones de uso del corpus original y de los contenidos de terceros que contiene podrían aplicar de forma adicional.
- Sin datos de idiomas ni de composición por dominio: no se puede saber a priori qué cobertura idiomática tiene el índice más allá de lo que indique la mezcla Dolma 3 original.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, y una única actualización inmediatamente posterior a la creación, lo que sugiere que no ha sido validado por terceros.
- Coste de infraestructura alto: cientos de gigabytes de almacenamiento y de RAM para consultas completas, poco práctico en equipos de desarrollo convencionales.
- Advertencia de contenido: la model card publicada incluye los datos descriptivos del autor y debe tratarse como material de referencia, no como instrucciones operativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aalkaswan/olmo3-mix-6T-portrait
- Partición 0: https://huggingface.co/aalkaswan/olmo3-mix-6T-portrait/tree/p0of6
- Partición 1: https://huggingface.co/aalkaswan/olmo3-mix-6T-portrait/tree/p1of6
- Partición 2: https://huggingface.co/aalkaswan/olmo3-mix-6T-portrait/tree/p2of6
- Partición 3: https://huggingface.co/aalkaswan/olmo3-mix-6T-portrait/tree/p3of6
- Partición 4: https://huggingface.co/aalkaswan/olmo3-mix-6T-portrait/tree/p4of6
- Partición 5: https://huggingface.co/aalkaswan/olmo3-mix-6T-portrait/tree/p5of6
- Framework data-portraits: https://github.com/ruyimarone/data-portraits
- Corpus indexado (Dolma 3, 6T): `allenai/dolma3_mix-6T-1025-7B` en HuggingFace
- Modelo asociado OLMo-3-1025-7B: https://huggingface.co/allenai/Olmo-3-1025-7B
- Resumen del proyecto OLMo 3 (Open Source AI Map): https://www.aipotluck.org/product/olmo
- Tutorial sobre OLMo 3 de AI2 (DigitalOcean): https://www.digitalocean.com/community/tutorials/olmo-3-allen-ai-open-source-llm
