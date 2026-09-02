# EvoLenTokenizer/base-200k-sft-checkpoints

## Resumen

El repositorio `EvoLenTokenizer/base-200k-sft-checkpoints` publica los checkpoints de fine-tuning del modelo preentrenado `base-200k` (tokenizer BPE estándar con vocabulario de 5.120) sobre 56 tareas de clasificación de secuencias de ADN. Este conjunto sirve como grupo de control frente al modelo `evolen-200k`, que emplea un tokenizer guiado por evolución. El objetivo es aislar el efecto del tokenizer en el rendimiento de tareas genómicas, manteniendo idénticos hiperparámetros de entrenamiento entre ambos.

Cada carpeta de tarea contiene un `model.safetensors`, `config.json`, tokenizer y artefactos de entrenamiento. El modelo base es un encoder transformer (etiquetado como `bert` en el repositorio base), aunque no se especifican públicamente el número de parámetros ni la longitud de contexto. La licencia es MIT, lo que permite uso comercial sin restricciones.

La relevancia de este repositorio radica en que proporciona una comparación controlada y reproducible entre dos estrategias de tokenización para modelos de lenguaje de ADN, un área emergente en la genómica computacional. Al publicar todos los checkpoints y la configuración exacta, permite a la comunidad evaluar el impacto real del tokenizer sin confundirlo con diferencias de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT, según etiqueta del repo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se usa `model_max_length` por tarea, valor no publicado) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de ADN, no idiomas humanos) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.json`, `tokenizer.json`, etc.) |

## Arquitectura y entrenamiento

El modelo base `base-200k` se preentrenó con máscara de lenguaje (MLM) durante 200.000 pasos, partiendo de un checkpoint de 100.000 pasos. El tokenizer es un BPE estándar con vocabulario de 5.120 tokens, sin ninguna adaptación evolutiva. Sobre este modelo se realizó fine-tuning para cada una de las 56 tareas de clasificación de secuencias de ADN, usando la misma configuración de hiperparámetros (tasa de aprendizaje, weight decay, warmup, épocas, semilla, `model_max_length`, precisión y regla de selección de checkpoint) que su contraparte `evolen-200k`.

La model card indica que 37 tareas provienen de ejecuciones originales del baseline, mientras que 19 se re-ejecutaron específicamente para igualar la configuración de EvoLen. Además, nueve tareas GBM se entrenaron originalmente con `per_device_batch_size=64` frente a 128 en EvoLen, lo que se documenta en `coverage.csv`. No se detalla la composición del dataset de preentrenamiento ni el número total de tokens.

## Capacidades

- Clasificación de secuencias de ADN en 56 tareas distintas, que incluyen predicción de elementos reguladores (por ejemplo, `H3K27ac`, `H3K4me3`), splicing, sitios de unión de factores de transcripción (`tf/*`), regiones de cromatina abierta (`EMP/*`) y otras anotaciones genómicas.
- Soporte para tareas binarias y multiclase, con orden de etiquetas definido por `sorted(set(...))`.
- Reproducción de evaluación mediante `matthews_corrcoef` sobre predicciones `argmax`, con fp16 autocast.
- No se mencionan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Anotación funcional de genomas: el modelo puede predecir la presencia de marcas de histonas (como H3K27ac) en regiones genómicas, lo que ayuda a identificar promotores y enhancers en genomas no anotados.
- Predicción de sitios de splicing: las tareas `splice/*` permiten detectar sitios de empalme alternativo, útil para interpretar variantes genéticas en estudios de enfermedades.
- Identificación de sitios de unión de factores de transcripción: las tareas `tf/*` predicen si una secuencia es reconocida por un factor específico, aplicable a la construcción de redes reguladoras.
- Análisis de cromatina abierta: las tareas `EMP/*` predicen regiones accesibles, relevantes para estudios de regulación génica en células concretas.
- Evaluación de impacto de variantes: al clasificar secuencias con mutaciones puntuales, el modelo puede estimar si una variante altera una anotación funcional, apoyando la priorización de variantes clínicas.
- Benchmarking de tokenizers: este repositorio sirve como control para comparar el rendimiento de un BPE estándar frente a un tokenizer evolutivo (EvoLen) en las mismas tareas, permitiendo decidir qué tokenizer usar en pipelines de genómica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (MCC, precisión, etc.) para ninguna de las 56 tareas. Se recomienda consultar el repositorio de EvoLen o el paper asociado para obtener comparativas cuantitativas.

## Requisitos de hardware

- Tamaño del repositorio: 20,2 GB (incluye todos los checkpoints de las 56 tareas, no un único modelo).
- Cada checkpoint individual es un modelo de clasificación de secuencias; el tamaño exacto por tarea no se especifica, pero al ser un encoder BPE pequeño (vocab 5.120) es probable que quepa en GPUs consumer (por ejemplo, RTX 3060 o superior) con al menos 8 GB de VRAM.
- No se proporcionan requisitos de VRAM, latencia ni throughput.
- Opciones de despliegue: compatible con la librería `transformers` (carga mediante `AutoModelForSequenceClassification`), por lo que puede usarse con vLLM, TGI o directamente en Python. No se menciona compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Tokenizer | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `base-200k-sft-checkpoints` (este) | BPE estándar (vocab 5.120) | 56 tareas de genómica | MIT | Hugging Face |
| `evolen-200k-sft-checkpoints` | EvoLen (evolución guiada) | 56 tareas de genómica | MIT | Hugging Face |
| `base-200k` (preentrenado) | BPE estándar | Preentrenamiento MLM | MIT | Hugging Face |

La comparación principal es contra `evolen-200k`, que usa el mismo número de pasos y configuración, pero con un tokenizer evolutivo. La model card advierte que la selección de checkpoints difiere: EvoLen reporta el máximo MCC sobre un barrido de 18-119 configuraciones por tarea, mientras que el baseline es una única ejecución, lo que favorece a EvoLen independientemente de la calidad del tokenizer.

## Limitaciones y advertencias

- El modelo es un baseline de control, no el modelo principal; su rendimiento puede ser inferior al de EvoLen en tareas donde el tokenizer evolutivo aporta ventajas.
- La selección de checkpoints no es simétrica: el baseline usa una sola ejecución, mientras que EvoLen usa el máximo sobre múltiples configuraciones, lo que introduce un sesgo en cualquier comparación directa.
- No se han publicado métricas de rendimiento, por lo que no es posible evaluar su precisión real sin ejecutar las evaluaciones.
- El modelo está entrenado exclusivamente para clasificación de secuencias de ADN; no es adecuado para tareas de generación de texto o procesamiento de lenguaje natural.
- Los datos de entrenamiento no se describen en detalle, por lo que pueden existir sesgos hacia organismos o regiones genómicas específicas (por ejemplo, humano, ratón, etc.).
- Aunque la licencia MIT permite uso comercial, el modelo no ha sido validado para uso clínico o diagnóstico; las predicciones deben interpretarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EvoLenTokenizer/base-200k-sft-checkpoints
- Modelo base: https://huggingface.co/EvoLenTokenizer/base-200k
- Modelo EvoLen (comparación): https://huggingface.co/EvoLenTokenizer/evolen-200k-sft-checkpoints
- Código fuente en GitHub: https://github.com/HN020719/EvoLen
- README del proyecto: https://github.com/HN020719/EvoLen/blob/main/README.md
