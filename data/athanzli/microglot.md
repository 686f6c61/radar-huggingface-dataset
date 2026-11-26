# athanzli/MicroGlot

## Resumen

MicroGlot es un modelo fundacional de ADN con arquitectura transformer decoder-only y mezcla de expertos (MoE), desarrollado por athanzli para genómica microbiana. Se ha preentrenado con 378.300 millones de nucleótidos procedentes de 3,70 millones de secuencias que cubren 99.700 especies microbianas, incluyendo bacterias, arqueas, hongos, protistas, virus y plásmidos. Su rasgo diferencial es la incorporación de la taxonomía como señal de entrada: codifica la jerarquía taxonómica en embeddings hiperbólicos de Poincaré de 32 dimensiones que se usan tanto como token de entrada como para modular el enrutamiento de los expertos.

El modelo resuelve el problema de representar secuencias de ADN microbiano con conocimiento explícito de la especie de origen, algo que los modelos de ADN genéricos no capturan. Con 2.980 millones de parámetros totales y solo 479 millones activos por token, ofrece un coste de inferencia propio de un modelo mucho menor. Dispone de una variante, MicroGlot-plain, que funciona sin condicionamiento por especie para tareas de predicción taxonómica donde revelar la especie filtraría la etiqueta.

La relevancia actual radica en la combinación de escala de preentrenamiento (378.300 millones de nucleótidos), eficiencia MoE y condicionamiento taxonómico explícito, una aproximación poco habitual en los modelos fundacionales de genómica. El contexto es de 8.192 tokens, unos 43 kb, lo que obliga a estrategias de fragmentación para genomas completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), predicción del siguiente token |
| Parametros totales | 2.980.789.406 (2,98 B) |
| Parametros activos | 479 M por token |
| Longitud de contexto | 8.192 tokens (aproximadamente 43 kb) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de ADN, no de lenguaje natural) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code`) |

Otros datos técnicos: 23 capas, tamaño oculto de 1024, 312 expertos enrutados distribuidos en las capas con patrón en U, enrutamiento top-1 más un experto compartido, tokenizador BPE con vocabulario de 8.192, embedding de especie de 32 dimensiones en espacio de Poincaré y tamaño del repositorio de 17,9 GB.

## Arquitectura y entrenamiento

MicroGlot es un transformer decoder-only entrenado con objetivo de predicción del siguiente token sobre secuencias de ADN. La innovación principal es el condicionamiento por especie: cada secuencia recibe un embedding hiperbólico de Poincaré de 32 dimensiones, derivado de la jerarquía taxonómica NCBI, que actúa a la vez como token de entrada y como señal que modula el enrutamiento de los expertos. La mezcla de expertos sigue un patrón en U a lo largo de las 23 capas, con 312 expertos enrutados, enrutamiento top-1 y un experto compartido, lo que explica que solo 479 millones de parámetros estén activos por token frente a los 2,98 mil millones totales.

El preentrenamiento abarca 378.300 millones de nucleótidos de 3,70 millones de secuencias y 99.700 especies microbianas, con representación de bacterias, arqueas, hongos, protistas, virus y plásmidos. La model card no detalla la composición exacta del dataset ni si hubo etapas de ajuste fino, RLHF o DPO; esos datos figuran como no disponibles. El modelo incluye además un Species-encoder opcional de 6 GB que infiere el embedding de especie a partir del ADN cuando la especie no se conoce, y una variante MicroGlot-plain sin condicionamiento taxonómico.

## Capacidades

- Extracción de representaciones (feature extraction) de secuencias de ADN: devuelve los estados ocultos de las 23 capas más los embeddings de token, alineados con `input_ids`.
- Condicionamiento por especie mediante nombres científicos de NCBI Taxonomy (septiembre de 2025), con tolerancia a mayúsculas, espacios adicionales y guiones o guiones bajos.
- Inferencia de la especie a partir del ADN mediante el Species-encoder opcional, para secuencias sin especie conocida.
- Codificación de secuencias largas mediante la estrategia de fragmentación en ventanas de 8.190 tokens más tokens especiales.
- Modelado de taxonomía mediante embeddings hiperbólicos que preservan la jerarquía taxonómica.
- Variante MicroGlot-plain para tareas de predicción taxonómica sin fuga de etiqueta.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es un modelo de representación de ADN, no un modelo de lenguaje.

## Casos de uso

- Anotación funcional de genes microbianos: extraer embeddings de regiones codificantes con la especie correcta como condicionamiento y entrenar clasificadores ligeros encima para predecir función, familia proteica o resistencia a antibióticos.
- Predicción taxonómica de secuencias metagenómicas: usar MicroGlot-plain para obtener representaciones sin fuga de etiqueta y clasificar el origen taxonómico de lecturas procedentes de muestras ambientales o clínicas.
- Búsqueda de homología y agrupamiento de secuencias: comparar embeddings de ventanas de 8.192 tokens para agrupar plásmidos, fagos o cepas relacionadas sin depender exclusivamente de alineamiento múltiple.
- Detección de elementos genéticos móviles: codificar regiones genómicas por ventanas y entrenar detectores de integrones, transposones o islas de patogenicidad sobre las representaciones de capas intermedias.
- Análisis de microbiomas con especie conocida: procesar lecturas asignadas taxonómicamente y usar el condicionamiento por especie para obtener representaciones más discriminativas en estudios de asociación.
- Ingeniería de proteínas y diseño génico asistido: usar las representaciones del modelo como entrada de modelos generativos o de regresión para predecir expresión, estabilidad o plegamiento en contextos microbianos concretos.
- Curaduría de bases de datos genómicas: completar la especie de secuencias huérfanas con el Species-encoder y detectar asignaciones taxonómicas incoherentes comparando la especie declarada con la inferida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 6 GB solo para los pesos (2,98 B de parámetros), más memoria para activaciones y estados ocultos; con lotes pequeños y contexto de 8.192 tokens conviene reservar 10-16 GB.
- El Species-encoder opcional añade 6 GB adicionales de pesos cuando se carga.
- GPU recomendadas: A100, H100 o L40S para procesamiento por lotes a gran escala; RTX 4090, RTX 3090 o RTX A6000 son suficientes para inferencia en bf16 con lotes moderados.
- Cabe en GPU de consumo con al menos 12-16 GB de VRAM para secuencias cortas; para contexto completo de 8.192 tokens se recomienda 24 GB.
- Despliegue: transformers (versión 4.49 a 5.22 probada) con `trust_remote_code=True`; la model card solo documenta y prueba esta vía, no menciona vLLM, llama.cpp, Ollama ni TGI.
- Entorno probado: Linux con GPU NVIDIA, Python 3.9 a 3.14 y PyTorch 2.7 a 2.15; la build más reciente de PyTorch en PyPI requiere CUDA 13 y driver NVIDIA 580 o superior.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros modelos fundacionales de ADN en la información proporcionada. A continuación se recogen los datos objetivos disponibles del propio modelo frente a referencias genéricas de la categoría, sin cifras de rendimiento comparables.

| Modelo | Parametros | Contexto | Condicionamiento taxonomico | Licencia |
|---|---|---|---|---|
| MicroGlot | 2,98 B totales / 479 M activos | 8.192 tokens | Sí (Poincaré 32-d) | CC-BY-4.0 |
| MicroGlot-plain | 2,98 B totales / 479 M activos | 8.192 tokens | No | CC-BY-4.0 |
| Otros modelos fundacionales de ADN | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de extracción de características, no generativo: no produce texto ni respuestas; cualquier tarea downstream requiere cabezas o clasificadores adicionales.
- Contexto limitado a 8.192 tokens (unos 43 kb): los genomas completos exigen fragmentación en ventanas, lo que puede perder dependencias de largo alcance entre regiones.
- El condicionamiento por especie solo cubre las 99.700 especies de preentrenamiento; un nombre desconocido lanza `KeyError` con sugerencias que deben verificarse manualmente.
- En tareas de predicción taxonómica, usar MicroGlot con especie conocida filtra la etiqueta; debe emplearse MicroGlot-plain.
- El Species-encoder no se recomienda cuando la mayoría de secuencias carecen de especie conocida, por motivos de rendimiento.
- Riesgo de sesgo de representación: la cobertura de especies, linajes y hábitats del dataset de preentrenamiento no está detallada, por lo que el rendimiento puede degradarse en taxones poco representados.
- Riesgo de alucinación en sentido biológico: las representaciones pueden inducir predicciones plausibles pero incorrectas en regiones divergentes o mal anotadas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar las condiciones de las fuentes de datos subyacentes, no detalladas en la model card.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; auditar antes de desplegar en producción.
- No se documentan cuantizaciones oficiales ni soporte para motores de inferencia optimizados, lo que limita el despliegue a gran escala sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athanzli/MicroGlot
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.09.22.753215v2
- Código: https://github.com/athanzli/MicroGlot
