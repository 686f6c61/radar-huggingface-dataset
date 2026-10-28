# 0xBrandon/Decision-WAF-V1.1-0.4B

## Resumen

Decision-WAF-V1.1-0.4B es un modelo publicado en HuggingFace por el usuario 0xBrandon bajo licencia Apache-2.0. El repositorio no incluye model card descriptiva: el README se limita a la cabecera YAML con la licencia, sin información sobre arquitectura, datos de entrenamiento, tokenizador, idiomas ni uso previsto. El nombre del repositorio sugiere un modelo de aproximadamente 0,4 mil millones de parámetros orientado a toma de decisiones en el contexto de un WAF (Web Application Firewall), pero esta lectura es una inferencia a partir del identificador y no está confirmada por ninguna documentación oficial.

A fecha de la consulta, el repositorio registra 0 descargas y 0 likes, con fecha de creación y de última actualización idénticas (27 de octubre de 2026), lo que indica que no ha habido revisiones posteriores ni evidencia pública de validación por parte de la comunidad. No se ha publicado pipeline, conjunto de datos, informe técnico ni resultados de evaluación.

Por todo ello, esta ficha no puede certificar especificaciones técnicas del modelo. Se documenta lo que consta de forma verificable (identificador, autor, licencia, estado del repositorio) y se marcan explícitamente como "no disponible" todos los campos que el autor no ha hecho públicos. Cualquier evaluación de idoneidad para producción requeriría inspeccionar los pesos, el tokenizador y la configuración del repositorio directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 0,4B, segun el nombre del repositorio; no confirmado en la model card |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

Otros datos verificables del repositorio:

| Campo | Valor |
|---|---|
| Identificador | 0xBrandon/Decision-WAF-V1.1-0.4B |
| Autor | 0xBrandon |
| Pipeline declarado | no disponible |
| Tags | license:apache-2.0, region:us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-27 |
| Fecha de actualizacion | 2026-10-27 |

## Arquitectura y entrenamiento

No disponible. La model card no especifica si el modelo usa una arquitectura transformer densa, un transformer con mezcla de expertos, un modelo hibrido con capas de estado o cualquier otra variante. Tampoco se documenta el tokenizador, el vocabulario, la estrategia de atención ni el esquema de posiciones.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, fases de ajuste (SFT, RLHF, DPO), proceso de destilación ni técnicas de optimización de inferencia. La etiqueta "V1.1" en el nombre sugiere al menos una revisión previa del modelo, pero no se publica ningún registro de cambios ni comparación con la versión anterior. Dado que el repositorio registra 0 descargas, no existe retroalimentación externa documentada.

## Capacidades

- Generación de texto: no confirmada. No hay model card ni ejemplos de uso que la documenten.
- Razonamiento, código y matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas no está declarado en HuggingFace.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso previsto declarado: no disponible. La única pista es el identificador del repositorio, que apunta a clasificación o decisión sobre tráfico HTTP en un WAF; se trata de una hipótesis no verificada.

## Casos de uso

Los siguientes escenarios son hipótesis derivadas del nombre del repositorio y del tamaño reducido del modelo. No están respaldados por documentación del autor y requieren validación empírica antes de cualquier uso real.

- Clasificación de peticiones HTTP en un WAF: un modelo de ~0,4B podría puntuar solicitudes individuales (URL, cabeceras, cuerpo) como benignas o sospechosas dentro de un pipeline de inspección. Su interés potencial reside en el coste de inferencia bajo, no en una capacidad demostrada.
- Segunda opinión sobre reglas heurísticas: integrado como capa de desempate después de las reglas deterministas de ModSecurity o Coraza, para reducir falsos positivos en peticiones ambiguas. Requiere confirmar que el modelo distingue entre señales legítimas y evasiones.
- Filtrado previo en cascada: usar un modelo pequeño como primer filtro sobre grandes volúmenes de logs y reservar modelos mayores o análisis humano para los casos marcados como dudosos, siempre que la latencia y la tasa de falsos negativos sean aceptables.
- Etiquetado asistido de tráfico para entrenamiento: generar candidatos de etiqueta sobre corpus de peticiones que luego se revisan manualmente, reduciendo el coste de anotación. Depende de una precisión mínima no documentada.
- Moderación de contenido en formularios y APIs: clasificación de payloads de entrada en aplicaciones web con requisitos de latencia estrictos y despliegue en CPU.
- Despliegue en el borde: por su tamaño teórico, podría ejecutarse en el propio nodo de un proxy o API gateway sin GPU dedicada, si el formato de pesos y el runtime lo permiten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas a partir de un tamaño de 0,4B parámetros deducido del nombre del repositorio; no proceden de mediciones ni de documentación del autor.

- VRAM estimada en FP16: en torno a 0,8 GB solo para pesos, más el estado de activaciones, caché KV y overhead del runtime. Con contexto largo, el consumo de caché KV puede dominar el total.
- VRAM estimada en INT8: aproximadamente 0,4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,25 GB de pesos.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer reciente (RTX 3060 12 GB, RTX 4060, RTX 4090) sería sobredimensionada para los pesos; también sería viable en CPU.
- Compatibilidad con GPU consumer: previsiblemente sí, en todas las GPU con al menos 4 GB de VRAM una vez contabilizado el contexto, sujeto a que el formato de pesos sea compatible.
- Opciones de despliegue: no disponibles. No se confirma compatibilidad con vLLM, llama.cpp, Ollama, TGI ni Transformers. Si los pesos están en safetensors con arquitectura estándar, Transformers y vLLM serían las rutas habituales; si existe GGUF, llama.cpp y Ollama.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni referencias de rendimiento.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo que permitan una comparación sustantiva. La tabla recoge únicamente datos verificables del repositorio frente a referencias del mismo orden de magnitud; los datos de los modelos alternativos provienen de sus respectivas model cards públicas y no han sido verificados en esta consulta.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| Decision-WAF-V1.1-0.4B | ~0,4B (segun nombre) | no disponible | Apache-2.0 | no disponible | Repositorio con 0 descargas |
| Qwen2.5-0.5B | 0,49B | 32.768 tokens | Apache-2.0 | Benchmark publicado por el autor | Ampliamente desplegado |
| SmolLM2-360M | 0,36B | 8.192 tokens | Apache-2.0 | Benchmark publicado por el autor | Ampliamente desplegado |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache-2.0 | Benchmark publicado por el autor | Ampliamente desplegado |

La diferencia relevante no es de tamaño sino de documentación: los tres modelos de referencia publican arquitectura, tokenizador, datos de entrenamiento y evaluaciones, mientras que Decision-WAF-V1.1-0.4B no aporta ninguno de esos elementos. No se ha identificado ningún modelo comparable específicamente en la categoría de decisión para WAF.

## Limitaciones y advertencias

- Ausencia total de documentación: sin model card no es posible conocer el uso previsto, los datos de entrenamiento ni las limitaciones declaradas por el autor. Un modelo sin documentación no debe evaluarse como apto para producción.
- Riesgo de alucinación: desconocido. No hay evaluaciones ni descripciones del comportamiento del modelo.
- Sesgos: imposibles de evaluar sin información sobre el corpus de entrenamiento. En un caso de uso de seguridad, los sesgos en la distribución de tráfico (idiomas, geografías, codificaciones) pueden traducirse directamente en falsos positivos o negativos.
- Idiomas: no declarados. Un modelo orientado a análisis de peticiones HTTP puede tener un sesgo fuerte hacia el inglés o hacia determinados formatos de payload.
- Riesgo de seguridad intrínseco: si el modelo se usa como componente de un WAF, un adversario con acceso a la API podría intentar evasiones adversariales. No hay información sobre robustez frente a entradas manipuladas.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y aviso. Sin embargo, la licencia no implica que el autor haya verificado la procedencia de los datos de entrenamiento ni que exista garantía alguna sobre los pesos.
- Falta de validación comunitaria: 0 descargas y 0 likes indican ausencia de revisión externa. No hay informes independientes, issues ni discusión pública.
- Fechas del repositorio: creación y actualización coinciden, sin historial de revisiones pese a la etiqueta "V1.1".
- Recomendación: antes de considerar el modelo, inspeccionar los archivos del repositorio (config.json, tokenizer, safetensors), verificar la arquitectura real y ejecutar una evaluación propia sobre un conjunto de validación representativo del tráfico objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xBrandon/Decision-WAF-V1.1-0.4B
- Perfil del autor: https://huggingface.co/0xBrandon
- Paper, blog, repositorio de código o demo: no disponibles en la informacion proporcionada.
