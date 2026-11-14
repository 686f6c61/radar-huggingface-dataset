# Hooshaai/bert-comp-tomoe-compressor-sst2

## Resumen

`bert-comp-tomoe-compressor-sst2` es un checkpoint comprimido y "sanado" mediante LoRA de `google-bert/bert-base-uncased`, afinado sobre GLUE SST-2 (clasificación de sentimiento binaria) y publicado por el autor Hooshaai dentro del zoo de modelos comprimidos de la librería NeuralOps. El modelo aplica el motor `ToMoECompressor` (`tomoe_compressor`), que sustituye dinámicamente capas densas feed-forward y de proyección por equivalentes "MoEificados" de bajo rango, seleccionando el rango `k=128` como punto Pareto del repositorio.

El resultado es una reducción física de parámetros del 28,8 % (de 109.483.778 a 77.965.346 parámetros, ratio de compresión 1,40x) y un peso serializado de aproximadamente 151,5 MB. Sobre esa topología comprimida se aplica un "healing" LoRA con rango `r=8`, 50 pasos y `lr=2e-4`, que recupera parte de la precisión perdida por la compresión.

La relevancia de esta ficha no reside en el rendimiento absoluto del modelo, sino en su valor como artefacto de referencia para investigar técnicas de compresión de transformers: documenta con telemetría reproducible el compromiso entre ratio de compresión y degradación de accuracy en un rango de `k` de 256 a 32. Conviene subrayar desde el inicio que la accuracy final en validación SST-2 es del 52,41 %, frente al 91,63 % del modelo profesor, una caída de 39,22 puntos que lo sitúa cerca del azar en una tarea binaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta D=768), con capas feed-forward y proyecciones reemplazadas por equivalentes MoE de bajo rango (ToMoECompressor) |
| Parametros totales | 77.965.346 (comprimido); modelo base original 109.483.778 |
| Parametros activos | no disponible (el autor no documenta el patrón de enrutamiento ni el número de expertos activos por token) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens, pero la model card no declara la ventana efectiva del checkpoint comprimido) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` con factores de bajo rango y adaptadores LoRA embebidos; no se listan formatos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); assets de tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El punto de partida es `bert-base-uncased`, un encoder transformer de 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado de forma no supervisada y posteriormente afinado en SST-2. Sobre esa base, NeuralOps aplica `ToMoECompressor`, un compresor de familia `low_rank` que reemplaza capas densas por una variante "MoEificada": en lugar de una única matriz densa, se instancian expertos de bajo rango con enrutamiento dinámico, lo que reduce el número de parámetros almacenados a costa de una pérdida de capacidad expresiva.

El proceso de compresión se evalúa en cuatro rangos (`k=256, 128, 64, 32`) sobre la partición de validación de GLUE SST-2 (872 muestras) en una RTX 3090 de 24 GB. La política de NeuralOps dispara un healing LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 segundos) cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. El checkpoint publicado corresponde a `k=128` con healing aplicado, que pasa de 49,08 % zero-shot a 52,41 % tras el LoRA. Los rangos `k=256`, `k=64` y `k=32` no superan el 49,20 % en ningún caso, lo que indica que el healing solo compensa marginalmente la pérdida en este régimen. No se documentan el volumen de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia mediante `BertForSequenceClassification` estándar tras reconstruir la topología comprimida con `compress_model` y cargar el state dict con `strict=False`.
- Carga en una línea a través de la API `neuralops.hub.load_surgeried_model`, que devuelve modelo y tokenizer conjuntos.
- Tokenización con el vocabulario original de `bert-base-uncased` (WordPiece, minúsculas), preservando compatibilidad con pipelines existentes de BERT.
- No se declaran capacidades de generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni comportamiento de agente; el modelo es exclusivamente un clasificador de sentimiento.
- No se declara soporte multilingüe: el modelo está etiquetado únicamente para inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo puede clasificar polaridad positiva o negativa en lotes de reseñas en inglés, integrándose en un pipeline de `transformers` con `BertForSequenceClassification`. Su reducido tamaño (151,5 MB) lo hace adecuado para despliegues con restricciones de memoria.
- Filtrado de comentarios en moderación de comunidades: clasificación rápida de tono en inglés para priorizar revisiones humanas, aprovechando la baja huella de parámetros del checkpoint comprimido.
- Prototipado de técnicas de compresión: sirve como artefacto reproducible para estudiar el efecto de `ToMoECompressor` y del healing LoRA sobre un baseline BERT conocido, comparando los cuatro rangos documentados en `compression_summary.json`.
- Docencia e investigación en eficiencia de modelos: permite reproducir el experimento Pareto completo (k=256/128/64/32) en una única RTX 3090, con telemetría ya serializada en el repositorio.
- Benchmark de referencia para pipelines de compresión propios: útil como punto de comparación controlado cuando se evalúan otras técnicas de poda, destilación o bajo rango sobre SST-2.
- Pruebas de integración de la librería NeuralOps: valida el flujo `compress_model` + carga de state dict + inferencia, útil para verificar compatibilidad de versiones de la librería en CI.
- No se recomienda su uso en producción para clasificación de sentimiento real: con 52,41 % de accuracy en una tarea binaria, el modelo está próximo al azar y no es fiable para decisiones automatizadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre la partición de validación de GLUE SST-2 (872 muestras), evaluados en una NVIDIA GeForce RTX 3090:

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,10x | 99.816.482 (-8,8 %) | 49,08 % | 49,08 % | -42,55 % |
| **128** | **1,40x** | **77.965.346 (-28,8 %)** | **49,08 %** | **52,41 % (LoRA)** | **-39,22 %** |
| 64 | 2,13x | 51.423.266 (-53,0 %) | 49,08 % | 49,20 % (LoRA) | -42,43 % |
| 32 | 2,87x | 38.152.226 (-65,2 %) | 49,08 % | 49,08 % (LoRA) | -42,55 % |

El baseline del profesor (`bert-base-uncased` afinado en SST-2) se declara en 91,63 % de accuracy en validación. El checkpoint publicado (k=128) alcanza 52,41 %, lo que supone una caída de 39,22 puntos porcentuales. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 77,96 millones de parámetros en fp32 el checkpoint ocupa aproximadamente 312 MB en memoria, y alrededor de 151,5 MB en disco según el tamaño declarado del repositorio (0,2 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor documenta la evaluación en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es muy inferior a esa capacidad.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `BertForSequenceClassification` (requiere reconstruir la topología con `compress_model` antes de cargar el state dict) o la API `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un encoder de clasificación y no un modelo generativo, esos runners no son el objetivo natural.
- Latencia y throughput: no disponibles; no se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `bert-comp-tomoe-compressor-sst2` (k=128) | 77,96 M | no disponible | 52,41 % | MIT | Hugging Face (NeuralOps) |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor declarado) | 109,48 M | 512 tokens | 91,63 % | Apache 2.0 (modelo base) | Hugging Face |
| `google-bert/bert-base-uncased` (sin afinar, referencia) | 109,48 M | 512 tokens | no disponible | Apache 2.0 | Hugging Face |
| Variantes comprimidas del mismo zoo (k=64, k=32) | 51,42 M / 38,15 M | no disponible | 49,20 % / 49,08 % | MIT | Hugging Face (NeuralOps) |

La comparación directa con el profesor es la más informativa: el checkpoint comprimido pierde 39,22 puntos de accuracy a cambio de un 28,8 % menos de parámetros. Las variantes de mayor compresión del mismo zoo no mejoran el resultado, lo que sugiere que el límite práctico de esta configuración está muy por debajo del baseline. No se dispone de datos de benchmarks para comparar con alternativas de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy degradado: 52,41 % de accuracy en una clasificación binaria equivale prácticamente a una predicción aleatoria; no es apto para uso en producción orientado a decisiones.
- El healing LoRA solo recupera 3,33 puntos sobre el zero-shot (de 49,08 % a 52,41 %) en el rango publicado, y el resto de rangos evaluados no superan el 49,20 %.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del corpus de preentrenamiento de `bert-base-uncased` y de GLUE SST-2, pero no se han publicado evaluaciones específicas.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas sistemáticas dado el bajo rendimiento.
- Limitaciones de idioma: solo inglés; no se declara soporte para castellano ni otras lenguas.
- Limitaciones de contexto: la model card no declara la ventana efectiva del checkpoint comprimido; se asume la del BERT base (512 tokens) pero no está confirmado.
- Restricciones de licencia: MIT, permisiva para uso comercial según el texto de la licencia enlazada; conviene verificar la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y de los datos GLUE SST-2 para uso comercial.
- Caveat de producción: el checkpoint requiere reconstruir la topología con `compress_model` antes de cargar el state dict con `strict=False`; una carga directa con `from_pretrained` sobre el binario no funcionará sin ese paso.
- El identificador del repositorio en el ejemplo de la model card (`tahamajs/bert-comp-tomoe-compressor-sst2`) difiere del ID real del repositorio (`Hooshaai/bert-comp-tomoe-compressor-sst2`), lo que puede provocar errores si se copia el snippet tal cual.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden exclusivamente del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hooshaai/bert-comp-tomoe-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/tomoe_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
