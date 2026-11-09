# jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn

## Resumen

El modelo `jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el usuario jsaizant sobre 100 mil millones de tokens de texto en francés. El corpus de entrenamiento procede de HPLT 4 (High Performance Language Technologies), un conjunto de datos multilingüe de gran escala, y los documentos fueron filtrados aplicando un umbral de calidad basado en la puntuación BSC-EDU superior a 2,0. El identificador del repositorio refleja directamente la receta de entrenamiento: DataMix, 0,7B de parámetros, filtro BSC-EDU mayor que 2,0, 100 mil millones de tokens, idioma francés en escritura latina.

Se trata de un modelo de investigación, presumiblemente parte de una familia de modelos pequeños entrenados para estudiar el efecto de la mezcla de datos (data mixing) y del filtrado por calidad educativa en modelos compactos. Su relevancia actual reside en que permite reproducir y analizar cómo afecta el filtrado de calidad del corpus al rendimiento de un modelo de menos de mil millones de parámetros, un régimen de tamaño que está cobrando interés por su bajo coste de inferencia y su viabilidad en hardware de consumo.

La información pública disponible es muy limitada: la model card apenas contiene una frase descriptiva, no se detalla la arquitectura exacta más allá de los pesos en formato safetensors, ni se publican resultados de evaluación. El repositorio ocupa 13,4 GB, coherente con un modelo de 0,7B en precisión completa o media (FP32 o BF16/FP16) junto con posibles artefactos auxiliares. La licencia es Apache 2.0 y el único idioma declarado es el francés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en safetensors; no se especifica transformer, MoE u otra) |
| Parametros totales | 0,7 mil millones (700M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Por el tamaño (0,7B) y el formato de publicación (safetensors), se trata con toda probabilidad de un transformer decoder-only, pero no se confirma en la información disponible. Tampoco se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto máxima soportada.

El dato más concreto y verificable es la receta de datos: 100 mil millones de tokens extraídos de HPLT 4 en francés, filtrados con una puntuación BSC-EDU superior a 2,0. HPLT 4 es un corpus multilingüe de gran escala construido a partir de rastreo web y datos de archivo, y el filtro BSC-EDU es un clasificador de calidad educativa que asigna a cada documento una puntuación según su valor formativo. El umbral >2,0 implica una selección agresiva orientada a retener contenido de alta calidad. No se indica si hubo fases de ajuste fino supervisado, RLHF, DPO ni qué proporción del corpus se dedicó a cada etapa. Tampoco se documentan innovaciones técnicas de decodificación o atención.

## Capacidades

- Generación de texto en francés: es la capacidad principal y la única explícitamente respaldada por el idioma declarado.
- Modelado de lenguaje y continuación de texto: el modelo está entrenado desde cero sobre corpus francés, por lo que su función natural es la generación autoregresiva.
- Razonamiento básico y cobertura de conocimiento general: esperable por el entrenamiento sobre corpus web filtrado por calidad educativa, aunque no hay evaluación que lo confirme.
- Capacidades multilingües: limitadas al francés según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre filtrado de calidad de datos: el modelo sirve como punto de comparación directo para estudiar el impacto del umbral BSC-EDU (>2,0) frente a otras mezclas de datos, ya que su identificador y receta son explícitos y reproducibles.
- Generación de texto en francés con requisitos de latencia muy bajos: con 0,7B de parámetros, la inferencia es barata en CPU o en GPU de gama media, adecuada para prototipos de redacción asistida o autocompletado en aplicaciones francófonas.
- Experimentos de destilación y ajuste fino: un modelo base pequeño entrenado con 100B tokens es un punto de partida útil para fine-tuning supervisado o DPO en tareas específicas del francés, con coste de cómputo reducido.
- Evaluación de corpus HPLT 4: permite medir de forma controlada qué rendimiento se obtiene exclusivamente con datos HPLT 4 filtrados, sin mezcla con otras fuentes, como referencia en estudios de ablación.
- Despliegue en entornos con recursos limitados: al caber en una sola GPU de consumo en precisión reducida, puede integrarse en servicios de generación de texto de bajo coste para nichos francófonos.
- Base para modelos especializados en educación: dado el filtro BSC-EDU, es un candidato natural para ajuste fino en tareas de tutoría, explicación de conceptos o generación de material didáctico en francés, siempre que se valide su calidad con evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,7B de parámetros, en FP16/BF16 se requieren aproximadamente 1,4 GB solo para los pesos, más memoria para el estado de atención y el KV cache; en FP32, unos 2,8 GB. Con cuantización a 8 bits o 4 bits (si se generan variantes GGUF, no publicadas) bajaría a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo en FP16 con contexto moderado; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, una A100 o H100 permitiría lotes grandes, aunque el modelo es demasiado pequeño para aprovecharlas plenamente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo modernas con 4 GB o más de VRAM; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: al publicarse solo safetensors, la vía directa es transformers con PyTorch. Para vLLM o TGI sería necesario verificar compatibilidad de arquitectura (no documentada). Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, tarea posible pero no empaquetada por el autor.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn | 0,7B | no disponible | fr | Apache 2.0 | Hugging Face (0 descargas) |
| Modelos comparables de la misma categoría (p. ej. variantes de la familia DataMix de jsaizant u otros modelos de <1B entrenados desde cero sobre corpus filtrados) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas: la model card no incluye resultados de evaluación ni referencias a modelos de referencia, y no se han identificado en la información proporcionada otros modelos de la misma familia con especificaciones publicadas.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara francés; su uso en castellano u otros idiomas no está respaldado y probablemente produzca resultados deficientes.
- Arquitectura no documentada: al no especificarse capas, contexto ni tokenizador, la integración en producción requiere inspeccionar los pesos y la configuración antes de confiar en el modelo.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide estimar su rendimiento frente a alternativas y hace arriesgado su uso en producción sin evaluación propia.
- Riesgo de alucinación: como cualquier modelo entrenado sobre corpus web, puede generar contenido plausible pero falso; el filtrado BSC-EDU reduce ruido pero no elimina el riesgo.
- Sesgos: el corpus HPLT 4 procede de rastreo web y puede arrastrar sesgos de representación, especialmente en un modelo pequeño con capacidad limitada para corregirlos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones de HPLT 4 si se redistribuyen datos derivados.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha; es un artefacto de investigación sin comunidad ni mantenimiento documentado.
- Tamaño del repositorio: 13,4 GB para 0,7B de parámetros sugiere que los pesos pueden estar en FP32 o que el repositorio incluye artefactos adicionales; conviene verificar los archivos antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/jsaizant/datamix-0.7B-bsc-edu-gt2.0-100bt-fra_Latn
- HPLT (High Performance Language Technologies): no disponible en la información proporcionada
- Paper o blog del filtro BSC-EDU: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
