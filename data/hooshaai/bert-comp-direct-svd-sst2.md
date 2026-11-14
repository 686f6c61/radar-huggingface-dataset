# Hooshaai/bert-comp-direct-svd-sst2

## Resumen

`bert-comp-direct-svd-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (Compressed & LoRA-Healed Model Zoo). El modelo aplica el compresor `direct_svd` (`DirectSVDCompressor`), que sustituye capas lineales por factorizaciones SVD truncadas de bajo rango, seguido de un proceso de "sanación" mediante LoRA (r=8, 50 pasos, lr=2e-4) cuando la pérdida de precisión zero-shot supera el 2%.

La arquitectura subyacente es un transformer encoder BERT-base estándar: 12 capas, dimensión oculta 768 y 109.483.778 parámetros originales. Tras la compresión en el rango destacado k=32, el checkpoint queda en 29.859.842 parámetros, lo que supone una reducción del 72,73% y un ratio de compresión físico de 3,667x. El objetivo del artefacto es servir como referencia reproducible de compresión agresiva de modelos, no como un clasificador listo para producción.

El dato clave para evaluar su utilidad práctica es el rendimiento: sobre la partición de validación de GLUE SST-2 (872 muestras), el modelo alcanza un 50,92% de accuracy, frente al 91,63% del profesor original. Es decir, una degradación de 40,71 puntos porcentuales, lo que lo sitúa en la práctica al nivel de un clasificador binario aleatorio. Resulta relevante ahora como ejemplo metodológico y de telemetría de compresión, y como caso de estudio de los límites del pipeline SVD+LoRA en tareas de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), con capas lineales reemplazadas por factores SVD truncados de rango k=32 y adaptadores LoRA de sanación |
| Parametros totales | 29.859.842 (comprimido); 109.483.778 en el modelo base original |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-base admite 512 tokens) |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en precisión completa (`pytorch_model.bin`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch serializado (`pytorch_model.bin`); requiere reconstrucción de la topología NeuralOps antes de cargar |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con dimensión oculta D=768 y 109.483.778 parámetros, afinado previamente sobre GLUE SST-2. Sobre esa base se aplica `DirectSVDCompressor`, registrado como `direct_svd` en el `COMPRESSOR_REGISTRY` de NeuralOps: un operador que realiza SVD truncada de las matrices de peso y las sustituye por factorizaciones de bajo rango. El compresor está descrito como compatible con múltiples arquitecturas (DistilBERT, RoBERTa, GPT-2, Qwen3.5) e incluye validación de errores, soporte de Conv1D, límites de rango y fallback seguro.

El pipeline evalúa cuatro rangos (k=256, 128, 64 y 32) sobre la partición de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se activa una sanación LoRA dirigida con r=8, 50 pasos, lr=2e-4 y un presupuesto de 45 segundos. El checkpoint serializado corresponde a k=32 con sanación LoRA aplicada. No se detallan en la información disponible el volumen de tokens de entrenamiento original, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida.
- Codificación contextual de texto en inglés heredada de BERT-base (representaciones de 768 dimensiones, 12 capas).
- Inferencia de clasificación de secuencia mediante `BertForSequenceClassification` tras reconstruir la topología comprimida.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (modelo `uncased`).
- No dispone de modo thinking, visión ni audio.
- Capacidad de generación de texto: no aplica (es un modelo encoder de clasificación).

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de referencia reproducible para medir el impacto de SVD truncada con y sin sanación LoRA sobre una tarea downstream concreta, gracias a la telemetría incluida en `compression_summary.json` para los rangos 256, 128, 64 y 32.
- Estudio de la curva precisión-compresión: permite analizar empíricamente cómo la accuracy cae de 91,63% (profesor) a valores entre 50,69% y 50,92% según el rango, útil para calibrar expectativas sobre límites de compresión agresiva.
- Docencia y divulgación técnica: ejemplo didáctico de un pipeline completo de compresión (factorización SVD, evaluación Pareto, sanación LoRA) con artefactos y código de reconstrucción disponibles.
- Pruebas de integración de la librería NeuralOps: válido para verificar el flujo `compress_model` + carga de `state_dict` con `strict=False` en entornos de CI, dado su reducido tamaño de repo (0,1 GB).
- Benchmarking de infraestructura de inferencia: modelo pequeño (29,9 M de parámetros) útil para medir latencia y throughput de frameworks de despliegue en GPUs de consumo, aunque sin valor predictivo real.
- No recomendado para atención al cliente, moderación de contenido, análisis de opiniones en producción ni ninguna tarea donde se requiera precisión superior al azar: su accuracy del 50,92% en una tarea binaria equivale prácticamente a una predicción aleatoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y la model card (no verificados de forma independiente):

| Modelo / variante | Ratio de compresion | Parametros | GLUE SST-2 (val, accuracy) | Delta vs profesor |
|---|---:|---:|---:|---:|
| BERT-base profesor (referencia) | 1,00x | 109.483.778 | 91,63% | — |
| direct_svd k=256 + LoRA | 1,63x | 67.034.882 | 50,92% | -40,71 |
| direct_svd k=128 + LoRA | 2,39x | 45.792.002 | 50,69% | -40,94 |
| direct_svd k=64 + LoRA | 3,11x | 35.170.562 | 50,92% | -40,71 |
| direct_svd k=32 + LoRA (checkpoint publicado) | 3,67x | 29.859.842 | 50,92% | -40,71 |

Evaluación zero-shot (sin sanación) para los mismos rangos: k=256 → 57,00%; k=128 → 53,67%; k=64 → 50,92%; k=32 → 52,06%. En todos los casos la sanación LoRA no recupera el rendimiento del profesor. La evaluación se realizó sobre 872 muestras de la partición de validación en una RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 29,9 M de parámetros del checkpoint comprimido (más overhead de activaciones y del tokenizador).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier RTX/GTX moderna, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la carga requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar el `state_dict`; posteriormente puede servirse con PyTorch nativo o frameworks compatibles con `BertForSequenceClassification` (por ejemplo, Hugging Face Transformers). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val, accuracy) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Hooshaai/bert-comp-direct-svd-sst2` (k=32) | 29,9 M | No disponible | 50,92% | MIT | Hugging Face (NeuralOps) |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 tokens | 91,63% (declarado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | 66 M | 512 tokens | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros y licencia: no hay datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no puede establecerse una comparación de rendimiento homogénea.

## Limitaciones y advertencias

- Rendimiento próximo al azar en su tarea objetivo: 50,92% de accuracy en clasificación binaria de SST-2, frente al 91,63% del modelo base. No es apto para uso en producción.
- La sanación LoRA no revierte la degradación: en todos los rangos evaluados la accuracy se mantiene en torno al 50-51%, lo que sugiere un fallo del pipeline de compresión o de la propia sanación en esta configuración.
- Sesgos heredados de `bert-base-uncased` y del corpus de entrenamiento original; no se documenta ninguna mitigación específica.
- Riesgo de alucinación no aplica directamente (modelo de clasificación), pero sí riesgo de predicciones sin fundamento dada su precisión casi aleatoria.
- Limitación de idioma: solo inglés; el tokenizador `uncased` no está adaptado a otros idiomas.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base BERT tiene licencia Apache 2.0 y conviene revisar la compatibilidad de las obligaciones de atribución.
- La carga requiere reconstruir la topología con `compress_model` de NeuralOps y usar `strict=False` en `load_state_dict`, lo que puede enmascarar pesos no cargados y complicar la depuración.
- El model-index marca la métrica como `verified: false`; los resultados son declarados por el autor y no han sido replicados de forma independiente.
- Fecha de creación del repositorio (2026-11-10) y librería poco extendida (`neuralops`): menor soporte comunitario y riesgo de incompatibilidades futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-direct-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor `direct_svd`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/direct_svd.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE (nyu-mll/glue): https://huggingface.co/datasets/nyu-mll/glue
