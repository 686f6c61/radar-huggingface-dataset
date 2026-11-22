# OpenVoiceOS/ovos-m2v-intents-multilingual

## Resumen

ovos-m2v-intents-multilingual es un clasificador de intenciones basado en embeddings estáticos (model2vec) desarrollado por OpenVoiceOS para su asistente de voz de código abierto. Su función es mapear un enunciado de usuario a una de las 221 etiquetas de intención con formato `<skill_id>:<intent_name>`, que constituyen el vocabulario que el pipeline `ovos-m2v-pipeline` registra en tiempo de ejecución. Es el modelo por defecto de dicho pipeline y actúa como respaldo para cualquier idioma que no disponga de un modelo propio.

El modelo deriva de `minishlab/potion-multilingual-128M` y no es un transformer autoregresivo: la inferencia consiste en una búsqueda vectorial en una tabla de embeddings, un promedio de vectores y una única capa lineal. Esta arquitectura estática elimina el coste de atención y permite ejecución en CPU con huellas de memoria muy reducidas, lo que lo hace apto para dispositivos de bajos recursos como una Raspberry Pi.

Su relevancia actual radica en la combinación de cobertura multilingüe (53 locales de entrenamiento), licencia Apache 2.0 y despliegue extremadamente ligero, con versiones cuantizadas de 8,3 MB para español y 13 MB para portugués que mantienen exactitud cercana al modelo completo en float32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | model2vec (embeddings estáticos + promedio + capa lineal) |
| Parámetros totales | 128.090.368 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite del tokenizador ONNX) |
| Tipos de cuantización | float32, float16, int8 |
| Idiomas soportados | 53 locales de entrenamiento y 51 de evaluación; carpetas dedicadas para pt, es, ca, da, de, nl, sv, gl, eu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model2vec), ONNX |
| Tabla de embeddings | 500.353 tokens × 256 dimensiones en float32 (~530 MB) |
| Etiquetas de salida | 221 |
| Tamaño del repositorio | 3,0 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura model2vec: cada token se representa mediante una fila de una tabla de embeddings estática de 500.353 entradas por 256 dimensiones. La representación de una frase se obtiene promediando los vectores de sus tokens y la clasificación se realiza con una sola capa lineal sobre las 221 clases. No hay mecanismo de atención ni capas transformer en la inferencia, de modo que el coste computacional es lineal en el número de tokens y prácticamente despreciable frente a un modelo denso.

El entrenamiento se realizó sobre el dataset `OpenVoiceOS/ovos-intents` en su revisión `v7-preview2` (commit `e03197a`), con 4.952.006 filas de entrenamiento y 12.908 filas de evaluación gold, distribuidas en 53 locales de entrenamiento y 51 de evaluación. El modelo base es `minishlab/potion-multilingual-128M`. Las versiones por idioma no reentrenan nada: recortan el vocabulario a los tokens presentes en las frases de entrenamiento de ese idioma y a los de sus 50.000 palabras más frecuentes (20.000 en español; gallego y euskera conservan solo los tokens de sus frases de entrenamiento), manteniendo intactos los embeddings conservados, las etiquetas y la capa clasificadora.

## Capacidades

- Clasificación de intenciones en 221 etiquetas con formato `<skill_id>:<intent_name>` para el ecosistema OpenVoiceOS.
- Inferencia en CPU sin GPU, con latencia de milisegundos al ser una operación de búsqueda y producto matricial.
- Cobertura multilingüe sobre 53 locales de entrenamiento, con modelos dedicados de vocabulario reducido para nueve idiomas.
- Ejecución mediante ONNX Runtime sin dependencia de la librería model2vec.
- Salida de probabilidades por clase (vector float32 de dimensión 221) que permite umbrales de confianza y abstención.
- No soporta tool calling, razonamiento multi-paso, generación de texto, visión ni audio: es exclusivamente un clasificador de texto.

## Casos de uso

- Asistente de voz en dispositivos embebidos: el modelo int8 de 148 MB o las variantes por idioma de 2,4 a 13 MB caben en una Raspberry Pi y resuelven la intención de un comando de voz en CPU sin GPU, que es el escenario principal del pipeline OVOS.
- Enrutado de comandos en español: la carpeta `es` (8,3 MB, exactitud 0,852 sobre 1.032 filas gold) permite clasificar enunciados como «pon un temporizador de diez minutos» sin cargar el modelo completo de 532 MB.
- Despliegue multilingüe con un único artefacto: el modelo raíz sirve de respaldo para cualquier locale sin modelo propio, lo que simplifica la configuración de asistentes que deben atender usuarios en varios idiomas.
- Prefiltrado de intenciones antes de un LLM: al ser un clasificador estático con coste casi nulo, puede descartar o etiquetar consultas antes de invocar un modelo generativo, reduciendo el coste por petición en sistemas de atención al cliente.
- Integración en pipelines de CI/CD de skills de OVOS: la versión ONNX con tokenizador incluido permite validar de forma automatizada que los enunciados de entrenamiento de una nueva skill se clasifican en la etiqueta esperada.
- Clasificación por lotes en servidores sin GPU: con ONNX Runtime sobre CPU se pueden procesar grandes volúmenes de enunciados en entornos donde no hay aceleradores disponibles.
- Sustitución de modelos transformer en asistentes con restricciones de memoria: la versión int8 (148 MB, exactitud 0,8458 sobre todas las filas gold) ofrece una alternativa drásticamente más ligera que un transformer de tamaño comparable.

## Benchmarks y rendimiento

Datos publicados en la model card sobre el conjunto gold (12.908 filas totales; 2.412 filas excluyendo `needs_manual`):

| Variante | Formato | Tamaño | Exactitud gold, todas | Exactitud gold, sin `needs_manual` |
|---|---|---:|---:|---:|
| raíz | model2vec float32 | 532 MB | 0,8464 | 0,8478 |
| `fp16` | model2vec float16 | 276 MB | 0,8464 | 0,8478 |
| `int8` | model2vec int8 | 148 MB | 0,8458 | 0,8503 |
| `onnx` | ONNX float32 | 513 MB | mismas predicciones que la raíz | no disponible |

Rendimiento de las versiones por idioma sobre las filas gold de cada locale:

| Carpeta | Idioma | Tamaño | Exactitud gold | Filas | Modelo completo |
|---|---|---:|---:|---:|---:|
| `pt` | Portugués (pt-PT, pt-BR) | 13 MB | 0,879 | 1.183 | 0,885 |
| `es` | Español | 8,3 MB | 0,852 | 1.032 | 0,846 |
| `ca` | Catalán | 12 MB | 0,852 | 608 | 0,854 |
| `da` | Danés | 8,8 MB | 0,854 | 629 | 0,857 |
| `de` | Alemán | 12 MB | 0,834 | 614 | 0,834 |
| `nl` | Neerlandés | 12 MB | 0,849 | 636 | 0,852 |
| `sv` | Sueco | 11 MB | 0,873 | 715 | 0,877 |
| `gl` | Gallego | 2,4 MB | 0,831 | 608 | 0,854 |
| `eu` | Euskera | 2,5 MB | 0,854 | 615 | 0,859 |

La revisión anterior `v7-preview2` obtiene 0,8155 sobre todas las filas gold. No se han publicado resultados en benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es generativo y no aplican.

## Requisitos de hardware

- RAM/VRAM para el modelo raíz float32: aproximadamente 530 MB en disco y en memoria; no requiere GPU.
- RAM para `fp16`: 276 MB; para `int8`: 148 MB; para ONNX float32: 513 MB.
- RAM para versiones por idioma: entre 2,4 MB (gallego) y 13 MB (portugués), aptas para Raspberry Pi y dispositivos embebidos.
- GPU: no es necesaria. Cualquier CPU moderna es suficiente; no se recomienda A100, H100 ni RTX 4090 porque el cuello de botella es el ancho de banda de memoria y no el cómputo.
- Despliegue: librería `model2vec` (`StaticModelPipeline`), ONNX Runtime con `tokenizers`, o a través de `ovos-m2v-pipeline` (desde 0.36.0a2 permite seleccionar subcarpeta por idioma mediante la entrada `models`).
- Latencia y throughput: no se han publicado mediciones concretas; por la naturaleza de la operación (búsqueda en tabla, promedio y una capa lineal) se espera un coste de milisegundos por frase en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Tamaño |
|---|---|---|---|---|---|---|
| ovos-m2v-intents-multilingual | model2vec estático | 128,1 M | 512 tokens | 53 locales | Apache 2.0 | 532 MB (148 MB int8) |
| OpenVoiceOS/ovos-m2v-intents-en | model2vec estático | no disponible | no disponible | inglés | no disponible | menor que el multilingüe (según la model card) |
| minishlab/potion-multilingual-128M | model2vec estático (base) | 128 M | no disponible | multilingüe | no disponible en la información | no disponible |
| Clasificador transformer tipo BERT multilingüe | transformer encoder | del orden de 100-300 M | 512 tokens | multilingüe | variable | varios cientos de MB |

No se dispone de datos de benchmarks comparativos con clasificadores transformer en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento frente a ellos.

## Limitaciones y advertencias

- Es un clasificador cerrado de 221 etiquetas: no genera texto ni puede responder a consultas fuera de ese vocabulario; cualquier intención no cubierta se asignará a la clase más probable entre las existentes.
- Las versiones por idioma recortan el vocabulario, de modo que una palabra cuyos tokens se han eliminado no se ve y una frase con términos poco frecuentes puede obtener una puntuación inferior a la que muestran las filas gold.
- La exactitud global ronda el 0,85, lo que implica un porcentaje no trivial de errores de clasificación en producción; conviene combinar la salida con umbrales de confianza.
- El límite de 512 tokens del tokenizador ONNX restringe los enunciados largos; los textos que lo excedan deben truncarse.
- No se han publicado análisis de sesgos por idioma o variedad dialectal; la cobertura por locale es desigual (por ejemplo, 1.183 filas gold en portugués frente a 608 en catalán), lo que puede traducirse en un rendimiento heterogéneo.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas.
- El repositorio ocupa 3,0 GB por acumular todas las variantes; en despliegues limitados conviene descargar solo la subcarpeta necesaria mediante `allow_patterns`.
- Las revisiones antiguas (`v7-preview2` y el commit `145a1bd...`) usan esquemas de etiquetas distintos; mezclar revisiones en producción puede romper el mapeo de intenciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVoiceOS/ovos-m2v-intents-multilingual
- Modelo base: https://huggingface.co/minishlab/potion-multilingual-128M
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenVoiceOS/ovos-intents
- Pipeline OVOS: https://github.com/OpenVoiceOS/ovos-m2v-pipeline
- Modelo inglés: https://huggingface.co/OpenVoiceOS/ovos-m2v-intents-en
