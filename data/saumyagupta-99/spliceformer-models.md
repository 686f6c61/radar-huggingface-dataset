# SaumyaGupta-99/spliceformer-models

## Resumen

Spliceformer es un modelo de inteligencia artificial especializado en genómica, desarrollado por SaumyaGupta-99, que aplica arquitecturas transformer al análisis de secuencias de ADN. Su componente principal, denominado Merlin, es un codificador compartido de 6 bloques con embeddings de 512 dimensiones, preentrenado sobre el genoma humano mediante un objetivo de nucleótido enmascarado. El modelo está diseñado para resolver tareas de clasificación de tokens en biología molecular, como la detección de sitios de empalme (splicing), la edición de ARN A-to-I, la metilación m6A y la unión de proteínas de unión a ARN (RBP).

El repositorio contiene el backbone preentrenado junto con más de 500 checkpoints de fine-tuning organizados en varios conjuntos: detección de sitios de empalme con contexto de 10.000 nucleótidos (10 kb) y de 400 nucleótidos, clasificación conjunta y regresión de uso para HAEC, edición ADAR, metilación m6A en 11 tejidos y unión de RBP en 37 dianas ENCODE eCLIP. El modelo requiere GPUs NVIDIA Ampere o más recientes, ya que usa FlashAttention-2 y no tiene ruta para CPU, MPS ni GPUs anteriores a Ampere. Su licencia MIT y su disponibilidad en abierto lo convierten en una herramienta relevante para la investigación biomédica y la biología computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con posiciones rotatorias (RoPE) sobre ADN crudo |
| Parametros totales | no disponible (backbone de 220 MB; repositorio completo de 44.2 GB) |
| Parametros activos | no disponible (no es un modelo de mezcla de expertos) |
| Longitud de contexto | 10.000 nucleotidos (splice_gencode_10k); 400 nucleotidos (splice_gencode_400) |
| Tipos de cuantizacion | no disponible (se usa bfloat16 autocast en inferencia; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de biologia, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

Spliceformer es un transformer con posiciones rotatorias (RoPE) aplicado directamente sobre secuencias de ADN crudo. El backbone Merlin consta de 6 bloques de transformer, con dimensiones de embedding de 512, dropout de 0.1 y dropout de atención de 0.05. Se preentrenó sobre el genoma humano con un objetivo de nucleótido enmascarado, similar al enmascaramiento de tokens en modelos de lenguaje, pero adaptado a nucleótidos. Todos los demás checkpoints del repositorio son fine-tunes de este backbone para tareas específicas.

El modelo usa FlashAttention-2, lo que exige una GPU NVIDIA con arquitectura Ampere (SM80) o más reciente, como A100, H100 o RTX 30/40/50. Además, las métricas reportadas se obtuvieron con `torch.compile` activado; la ejecución en modo eager produce diferencias en el tercer decimal bajo autocast de bfloat16. Los checkpoints se guardaron desde distintos envoltorios (módulo plano, `torch.compile` o DDP), y la función `load_finetuned` normaliza los prefijos de las claves del state dict para que la carga sea compatible.

## Capacidades

- Detección de sitios de empalme (splice sites) en secuencias de pre-mRNA, con dos longitudes de contexto: 10.000 nucleótidos y 400 nucleótidos.
- Clasificación conjunta y regresión de uso para HAEC, un conjunto de datos de expresión y empalme específico de alelos.
- Predicción de edición de ARN A-to-I mediada por ADAR.
- Predicción de metilación m6A en 11 tejidos, con tres estrategias de entrenamiento y cinco semillas.
- Predicción de unión de proteínas de unión a ARN (RBP) en 37 dianas de ENCODE eCLIP, con arquitectura única de cabeza de 7/7/7.
- Soporte de token-classification mediante el pipeline de Hugging Face.
- No es un modelo de lenguaje, por lo que no ofrece tool calling, soporte de agentes, razonamiento multi-paso ni capacidades de visión o audio.

## Casos de uso

- Investigación genómica: el modelo puede anotar sitios de empalme en genomas humanos completos, lo que resulta útil para la caracterización de transcriptomas y la identificación de isoformas alternativas. Su contexto de 10.000 nucleótidos permite capturar señales de empalme distantes.
- Análisis de variantes genéticas: los fine-tunes de empalme pueden emplearse para evaluar cómo variantes de un solo nucleótido (SNPs) afectan al reconocimiento de sitios de empalme, apoyando estudios de asociación gen-enfermedad.
- Estudio de edición de ARN: los checkpoints de ADAR permiten predecir sitios de edición A-to-I en transcritos, lo que es relevante para investigar la regulación post-transcripcional.
- Epigenómica: los modelos de metilación m6A ofrecen predicciones específicas de tejido, útiles para cartografiar modificaciones epitranscriptómicas en muestras biológicas.
- Unión de proteínas RBP: los checkpoints de RBP pueden predecir sitios de unión de proteínas de unión a ARN, lo que facilita el estudio de la interacción proteína-ARN en contextos celulares.
- Medicina personalizada: en entornos clínicos, el modelo podría usarse para analizar muestras de pacientes y detectar alteraciones de empalme asociadas a enfermedades, siempre que se disponga de datos genómicos y de las GPU adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el backbone pesa 220 MB, pero la VRAM depende del contexto y del batch; no se proporcionan datos).
- GPU recomendadas: NVIDIA A100, H100, RTX 30, RTX 40 o RTX 50. Se requiere arquitectura Ampere (SM80) o más reciente.
- No es compatible con CPU, MPS ni GPUs pre-Ampere.
- Opciones de despliegue: PyTorch con `torch.compile`; no se documentan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Requiere una GPU NVIDIA Ampere o más reciente; no hay soporte para CPU, MPS ni GPUs anteriores a Ampere.
- `torch.compile` debe permanecer activado; la ejecución en modo eager altera los resultados en el tercer decimal bajo bfloat16 autocast.
- El checkpoint `best_model_400_6blocks_gencode.pth` tiene una cabeza legacy con un `LayerNorm` adicional en el índice 0; `infer_splice_head()` lo detecta, pero se recomienda usar los archivos `_seed*`.
- El conjunto HAEC está incompleto: faltan cuatro checkpoints de los cinco folds. Los scripts omiten los archivos ausentes y registran los folds que contribuyen, por lo que un conjunto parcial no debe interpretarse como una ejecución completa de cinco folds.
- El conjunto RBP usa una única arquitectura de cabeza; los resultados son comparables entre proteínas, pero no deben compararse con versiones anteriores de cabeza legacy.
- El preentrenamiento se realizó únicamente sobre el genoma humano, por lo que la generalización a otras especies puede ser limitada.
- No se han publicado benchmarks, por lo que el rendimiento frente a otros modelos de splicing no está verificado.
- El modelo no es un modelo de lenguaje y no es aplicable a tareas de procesamiento de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/SaumyaGupta-99/spliceformer-models
- Codigo: https://github.com/NNeuralDynamics/Spliceformer
- Datos: https://huggingface.co/datasets/SaumyaGupta-99/spliceformer-data
- Tejidos GTEx: https://huggingface.co/datasets/SaumyaGupta-99/spliceformer-gtex-tissues
- Datos de entrenamiento HAEC: https://huggingface.co/datasets/mrunyan1/haec-training-data
- Repositorio alternativo (contexto de 45.000 nucleotidos): https://github.com/benniatli/Spliceformer
