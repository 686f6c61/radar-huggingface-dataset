# Hooshaai/bert-comp-grecodec-compressor-sst2

## Resumen

`bert-comp-grecodec-compressor-sst2` es un checkpoint comprimido y "curado" mediante LoRA de `google-bert/bert-base-uncased`, afinado sobre GLUE SST-2 (clasificación de sentimiento binaria en inglés). Lo publica el usuario Hooshaai dentro del ecosistema NeuralOps (repositorio `tahamajs/NeuralOps`), una librería de compresión de modelos que serializa topologías de bajo rango con el motor `grecodec_compressor`. El modelo resuelve un problema de eficiencia: reducir el tamaño de un BERT-Base manteniendo un clasificador de sentimiento funcional, a costa de una pérdida notable de precisión frente al profesor original.

La arquitectura subyacente es un transformer encoder BERT-Base (12 capas, dimensión oculta 768) con 109.483.778 parámetros en su forma original. Tras la compresión física a rango `k=64` el checkpoint queda en 35.165.954 parámetros (reducción del 67,88%, ratio de compresión 3,113x). El pipeline NeuralOps aplica primero compresión de bajo rango y después un "healing" con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 s) para recuperar parte de la precisión perdida.

Es relevante ahora porque ejemplifica una familia de técnicas de compresión agresiva (low-rank + LoRA healing) aplicadas a modelos encoder pequeños, útiles para despliegue en CPU o GPUs de gama baja. Sin embargo, la precisión final (75,57% en SST-2 frente a 91,63% del profesor) evidencia el compromiso: es un artefacto de investigación reproducible, no un clasificador de producción de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), comprimido con `grecodec_compressor` (familia low_rank) y curado con LoRA r=8 |
| Parametros totales | 35.165.954 (checkpoint comprimido); 109.483.778 en el BERT-Base original |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-Base usa típicamente 512 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | No disponible (el repo empaqueta `pytorch_model.bin` en fp32/pytorch nativo; no se listan variantes GGUF/INT8) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA), `config.json`, `compression_summary.json`, assets de tokenizer BERT |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas. El autor no documenta el proceso de preentrenamiento original (es el de Google), sino únicamente el pipeline NeuralOps aplicado después: compresión física mediante `grecodec_compressor_factory` (familia `low_rank`, implementación en `neuralops/compression/low_rank/grecodec_compressor.py`) seguida de LoRA healing cuando la caída de precisión zero-shot supera el 2,0% con una reducción superior a 1,10x.

El proceso de evaluación y healing se realizó sobre la split de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). Para cada rango (`k=256, 128, 64, 32`) se midió la precisión zero-shot y tras aplicar LoRA de rango 8 con 50 pasos, `lr=2e-4` y presupuesto de 45 s. El checkpoint serializado corresponde al rango `k=64`, seleccionado como "showcase" por su equilibrio entre ratio de compresión y precisión recuperada. No se documentan detalles sobre la composición del dataset de entrenamiento original de SST-2 ni sobre RLHF/DPO (no aplica a un encoder de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, formato SST-2.
- Inferencia sobre entradas tokenizadas con el vocabulario `bert-base-uncased` estándar.
- Reconstrucción programática mediante el pipeline NeuralOps (`compress_model` + `load_state_dict` no estricto).
- Carga mediante la API universal `load_surgeried_model` de NeuralOps Hub.
- No soporta tool calling ni function calling (es un encoder de clasificación, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no; solo inglés.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- **Filtrado de sentimiento en pipelines de bajo coste**: clasificar reseñas o comentarios en inglés con un checkpoint de 67,2 MB que ocupa muy poca VRAM y puede ejecutarse en CPU, útil cuando el throughput importa más que la precisión absoluta.
- **Prototipado de técnicas de compresión**: servir como referencia reproducible para comparar `grecodec_compressor` frente a otras estrategias de low-rank (SVD, LoRA, pruning) en tareas de clasificación estándar.
- **Investigación académica sobre model compression**: el `compression_summary.json` con telemetría de los rangos `k=256, 128, 64, 32` permite reproducir la curva de Pareto precisión/compresión sin reentrenar.
- **Edge deployment en dispositivos con poca memoria**: con 35M parámetros y pesos en fp32 (~67 MB), cabe holgadamente en Raspberry Pi, móviles de gama media o contenedores ligeros para clasificación de texto en tiempo real.
- **Enseñanza de pipelines NeuralOps**: el `Quick Start` documentado (reconstrucción + inferencia con `BertForSequenceClassification`) sirve como ejemplo didáctico de carga de checkpoints comprimidos con `strict=False`.
- **Baseline negativo en benchmarks internos**: útil como referencia de "modelo comprimido agresivamente" para calibrar cuánta precisión se pierde frente a alternativas como DistilBERT o TinyBERT en SST-2 (75,57% frente al ~91,63% del profesor).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / variante | Ratio compresión | Params | SST-2 val acc |
|---|---:|---:|---:|
| BERT-Base profesor (`google-bert/bert-base-uncased`) | 1,00x | 109.483.778 | 91,63% |
| `k=256` zero-shot | 1,63x | 67.016.450 | 59,40% |
| `k=256` + LoRA | 1,63x | 67.016.450 | 50,92% |
| `k=128` zero-shot | 2,39x | 45.782.786 | 52,41% |
| `k=128` + LoRA | 2,39x | 45.782.786 | 68,12% |
| `k=64` zero-shot | 3,11x | 35.165.954 | 51,38% |
| **`k=64` + LoRA (checkpoint publicado)** | **3,11x** | **35.165.954** | **75,57%** |
| `k=32` zero-shot | 3,67x | 29.857.538 | 49,89% |
| `k=32` + LoRA | 3,67x | 29.857.538 | 72,36% |

Evaluación sobre 872 muestras del split de validación de GLUE SST-2 en RTX 3090. La métrica oficial declarada en el `model-index` es accuracy = 75,57 (no verificada, `verified: false`).

## Requisitos de hardware

- **VRAM para inferencia**: mínima; con 35M parámetros en fp32 el checkpoint ocupa ~67 MB, por lo que la inferencia cabe en <1 GB de VRAM incluso con overhead de framework.
- **GPU recomendadas**: cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) o incluso CPU; el autor evaluó en RTX 3090 (24 GB) por comodidad, no por necesidad.
- **Cabe en consumer GPU**: sí, holgadamente; también en CPU, Raspberry Pi y móviles.
- **Opciones de despliegue**: requiere la librería `neuralops` para reconstruir la topología comprimida antes de cargar el state dict; no hay conversión documentada a GGUF/llama.cpp/Ollama/TGI/vLLM. Despliegue nativo vía `transformers` + `neuralops`.
- **Latencia y throughput**: no disponibles en la información proporcionada; por tamaño (~67 MB) se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 val acc | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `bert-comp-grecodec-compressor-sst2` (k=64) | 35,2M | no disponible | 75,57% | MIT | Hugging Face (NeuralOps) |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5M | 512 | 91,63% | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 | ~91% (referencia pública) | Apache 2.0 | Hugging Face |
| `prajjwal1/bert-tiny` (SST-2) | 4,4M | 512 | ~86% (referencia pública) | Apache 2.0 | Hugging Face |

Nota: las cifras de DistilBERT y BERT-Tiny son referencias de la literatura pública, no medidas en esta ficha; el autor solo publica la comparación con el profesor BERT-Base (91,63%). El checkpoint NeuralOps pierde ~16 puntos frente al profesor, mientras que DistilBERT (~2x compresión) mantiene prácticamente la precisión del original: la compresión low-rank a 3,11x es más agresiva y con mayor coste de precisión.

## Limitaciones y advertencias

- **Pérdida de precisión significativa**: 75,57% frente a 91,63% del profesor, un delta de -16,06 puntos en SST-2; no apto como clasificador de producción de alta calidad.
- **Rendimiento errático entre rangos**: `k=256` con LoRA (50,92%) es peor que `k=64` con LoRA (75,57%), lo que sugiere que el healing LoRA no es robusto ni monotónico con el rango.
- **Resultados no verificados**: el `model-index` declara `verified: false`; las cifras proceden del autor y no han sido replicadas de forma independiente.
- **Restricción a inglés**: solo soporta `en`; no cubre castellano ni otros idiomas.
- **Dependencia de la librería `neuralops`**: la carga requiere reconstruir la topología comprimida con `compress_model` antes de aplicar `load_state_dict(strict=False)`; no funciona con `from_pretrained` estándar de `transformers`.
- **Sin formato GGUF/ONNX documentado**: complica el despliegue en runtimes ligeros (llama.cpp, Ollama, TGI) sin conversión manual.
- **Riesgo de sesgos**: hereda los sesgos de `bert-base-uncased` y del dataset SST-2 (reseñas de películas en inglés); no hay documentación sobre mitigación.
- **Alucinación**: no aplica como tal (modelo discriminativo), pero puede producir clasificaciones erróneas con confianza alta en entradas ambiguas o fuera de dominio.
- **Licencia MIT**: permite uso comercial, pero la precisión limitada desaconseja su uso como clasificador principal sin validación adicional.
- **Fecha de creación futura**: el repo indica 2026-11-10, dato inconsistente con el estado actual del ecosistema; conviene verificar la procedencia del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-grecodec-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `grecodec_compressor`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/grecodec_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
