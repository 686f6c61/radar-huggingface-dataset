# jerrimu/IRIS-18B-GGUFS

## Resumen

IRIS-18B-GGUFS es una cuantización en formato GGUF del modelo IRIS-18B-CPT, publicado por el usuario jerrimu en Hugging Face. Se trata de un modelo de lenguaje de 18.002.548.604 parámetros (aproximadamente 18B) construido a partir de un ERNIE de 21B al que se le aplicó una poda del 20% mediante la técnica REAP, seguida de un entrenamiento de continuación (CPT) sobre aproximadamente 3.000 millones de tokens de trazas de razonamiento. El resultado es un modelo conversacional orientado a tareas de razonamiento, con licencia Apache 2.0.

El modelo parte de la familia ERNIE de Baidu (ERNIE-21B-REAP como base podada) y se ha afinado sobre datasets de destilación de razonamiento: `a-m-team/AM-DeepSeek-R1-Distilled-1.4M` y `AI-MO/NuminaMath-CoT`. Según la model card, el autor intentó SFT pero los resultados no fueron satisfactorios, por lo que la versión publicada corresponde al checkpoint tras CPT, sin un ajuste supervisado posterior pulido. Esto es relevante para evaluar su comportamiento en producción: el modelo puede mostrar inconsistencias de formato conversacional pese a sus mejoras en benchmarks de conocimiento.

La relevancia actual del modelo radica en su enfoque de compresión agresiva (poda del 20% sobre un modelo de 21B) combinada con entrenamiento en trazas de razonamiento, lo que lo sitúa en la categoría de modelos densos de tamano medio con capacidades de pensamiento. Su disponibilidad en GGUF facilita el despliegue en hardware de consumo, aunque el ecosistema y la documentación son limitados (25 descargas y 1 like en el momento de la ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de ERNIE, podado con REAP) |
| Parametros totales | 18.002.548.604 (~18B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo contiene múltiples archivos GGUF; niveles concretos no disponibles en la información proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 72,8 GB; el modelo base CPT estaría en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado de ERNIE 21B, al que se le aplicó una poda estructurada del 20% mediante REAP (técnica de poda de expertos/neuronas orientada a preservar capacidades). Sobre ese modelo podado de aproximadamente 18B se realizó un entrenamiento de continuación (CPT) con unos 3.000 millones de tokens de trazas de razonamiento, empleando los datasets `a-m-team/AM-DeepSeek-R1-Distilled-1.4M` (destilación de razonamiento de DeepSeek-R1) y `AI-MO/NuminaMath-CoT` (matemáticas con cadena de pensamiento). El autor indica que intentó SFT pero el resultado "no fue bonito" y que podría reintentar SFT/DPO más adelante; por tanto, el checkpoint publicado es el posterior al CPT, sin un ajuste supervisado final pulido.

No se dispone de información sobre el número total de tokens de preentrenamiento original de ERNIE, la composición completa del dataset, ni detalles sobre el uso de RLHF/DPO (el autor menciona DPO como posibilidad futura, no como algo ya aplicado). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El entrenamiento fue posible gracias a una subvención de lium.io, según la model card.

## Capacidades

- Generación de texto conversacional en formato multi-turno (el repo está etiquetado como `conversational`).
- Razonamiento con cadena de pensamiento (thinking traces), fruto del entrenamiento sobre destilaciones de DeepSeek-R1.
- Razonamiento matemático, reforzado por el dataset NuminaMath-CoT.
- Mejoras medidas en benchmarks de conocimiento general tras el CPT: ARC-Easy (+4,3), ARC-Challenge (+9,8), HellaSwag (+8,4) y Winogrande (+4,9) respecto al modelo pre-CPT.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado explícitamente, aunque el entrenamiento en trazas de razonamiento sugiere cierta capacidad).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible salvo el entrenamiento implícito en trazas de razonamiento.

## Casos de uso

- Asistente conversacional de razonamiento: el modelo puede mantener diálogos multi-turno y explicar su razonamiento paso a paso, aprovechando el entrenamiento sobre trazas de DeepSeek-R1. Adecuado para prototipos de asistentes técnicos donde se valore la explicabilidad del proceso.
- Resolución de problemas matemáticos con cadena de pensamiento: gracias al dataset NuminaMath-CoT, puede emplearse en tutores automáticos o generadores de soluciones paso a paso para problemas de nivel escolar y universitario.
- Despliegue en hardware de consumo: al estar disponible en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU de consumo, lo que lo hace útil para experimentación local sin infraestructura cloud.
- Generación de explicaciones razonadas en documentación técnica: el modelo puede redactar justificaciones detalladas de decisiones o procedimientos, útil en herramientas internas de soporte a desarrolladores.
- Evaluación comparativa de técnicas de poda: como ejemplo reproducible de poda REAP + CPT, sirve a investigadores que quieran estudiar el impacto de la compresión en modelos de 20B.
- Filtrado y clasificación con justificación: puede emplearse para tareas de moderación o clasificación donde se requiera una explicación del razonamiento, aunque con cautela por la falta de SFT.
- Base para fine-tuning posterior: al publicarse bajo Apache 2.0 y en GGUF (y con el modelo CPT en safetensors), puede servir como punto de partida para SFT/DPO propios en dominios específicos.

## Benchmarks y rendimiento

Datos publicados en la model card (comparación pre-CPT vs. post-CPT del propio modelo):

| Benchmark | Pre-CPT | Post-CPT | Δ |
|---|---|---|---|
| ARC-Easy | 79,6 | 83,9 | +4,3 |
| ARC-Challenge | 50,6 | 60,4 | +9,8 |
| HellaSwag | 70,5 | 78,9 | +8,4 |
| Winogrande | 67,2 | 72,1 | +4,9 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 18B, una cuantización Q4_K_M ocuparía del orden de 10-11 GB, Q8_0 en torno a 19 GB y FP16 unos 36 GB; estas cifras son estimaciones basadas en el tamano y no datos publicados por el autor.
- GPU recomendadas: no disponibles en la documentación. Por tamano, cabría esperar ejecución en RTX 4090 (24 GB) con cuantizaciones Q4/Q5/Q8, y en A100/H100 para FP16.
- ¿Cabe en GPU de consumo? Probablemente sí en RTX 3090/4090 (24 GB) con cuantizaciones de 4-8 bits; en GPUs de 12-16 GB solo con cuantizaciones bajas (Q3/Q4) y posible offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face. vLLM y TGI no están confirmados para este repo GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IRIS-18B-GGUFS | ~18B | no disponible | Apache 2.0 | GGUF | Poda REAP + CPT sobre trazas de razonamiento; sin SFT final |
| ERNIE-21B-REAP (base) | ~21B | no disponible | no disponible | no disponible | Modelo de partida podado; referencia de comparación en la model card |
| DeepSeek-R1-Distill (variantes 14B-32B) | 14B-32B | 32K-128K (según variante) | MIT (variantes destiladas) | safetensors, GGUF | Modelos de razonamiento destilados de R1; IRIS usa sus trazas como datos de entrenamiento |

No se dispone de comparaciones directas de rendimiento entre IRIS-18B y estos modelos en la información proporcionada; la comparativa es estructural, no de benchmarks.

## Limitaciones y advertencias

- El autor reconoce que el SFT "no fue bonito" y que el modelo se publica sin un ajuste supervisado pulido; esto puede traducirse en problemas de formato, seguimiento de instrucciones y coherencia conversacional en producción.
- Riesgo de alucinación: no evaluado ni documentado; al entrenarse sobre trazas de razonamiento destiladas, puede generar cadenas de pensamiento plausibles pero incorrectas.
- Sesgos conocidos: no documentados. Al derivar de ERNIE y de datasets de destilación, puede heredar sesgos de ambos.
- Idiomas soportados: no declarados; no se garantiza un rendimiento multilingüe más allá del inglés (idioma predominante en los datasets de entrenamiento).
- Longitud de contexto: no documentada; no debe asumirse una ventana larga sin verificación empírica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base ERNIE y los datasets de origen pueden tener condiciones adicionales que el autor no detalla; conviene revisar las licencias de los datasets (`AM-DeepSeek-R1-Distilled-1.4M`, `NuminaMath-CoT`) antes de un despliegue comercial.
- Ecosistema limitado: 25 descargas y 1 like; sin pipeline declarado, sin idiomas declarados y con documentación mínima. No recomendable como dependencia crítica en producción sin evaluación propia.
- El repo GGUF ocupa 72,8 GB, lo que sugiere múltiples cuantizaciones; verificar el archivo concreto antes de descargar.

## Enlaces

- Hugging Face (repo GGUF): https://huggingface.co/jerrimu/IRIS-18B-GGUFS
- Modelo base CPT: https://huggingface.co/jerrimu/IRIS-18B-CPT
- Dataset de destilación de razonamiento: https://huggingface.co/datasets/a-m-team/AM-DeepSeek-R1-Distilled-1.4M
- Dataset de matemáticas CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Patrocinador del entrenamiento: https://lium.io/
