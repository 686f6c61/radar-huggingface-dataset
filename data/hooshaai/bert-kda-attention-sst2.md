# Hooshaai/bert-kda-attention-sst2

## Resumen

`bert-kda-attention-sst2` es un checkpoint de clasificación de sentimiento binaria publicado por el usuario Hooshaai (autor de la librería NeuralOps, Taha Majlesi) que parte de `google-bert/bert-base-uncased` y sustituye los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `kda_attention`, una atención subcuadrática de complejidad efectiva O(N) u O(N log N). El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE, con un protocolo de destilación por representaciones cacheadas en caché offline (denominado NeuralOps Cached Representation Distillation) que evita mantener el profesor en VRAM durante el entrenamiento.

El repositorio no contiene los pesos completos de BERT, sino únicamente los parámetros de atención y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, unos 55 MB). El código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo base congelado desde `bert-base-uncased` y aplica encima los pesos destilados. Esto lo convierte en una pieza de investigación sobre eficiencia atencional más que en un modelo listo para producción: la accuracy reportada en SST-2 es del 78,56 %, muy por debajo del 91,63 % del profesor BERT-base original.

Es relevante ahora porque ejemplifica una línea de trabajo activa: reemplazar atención cuadrática por variantes lineales o subcuadráticas en modelos ya preentrenados, con serialización modular de solo los parámetros modificados. No obstante, los resultados empíricos publicados son modestos y el ecosistema (librería `neuralops`, código remoto) es joven y poco auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `kda_attention` subcuadrática en las 12 capas |
| Parametros totales | ~110 M (base BERT-base-uncased); el repo solo almacena ~55 MB de pesos de atención y cabeza |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de `bert-base-uncased`, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible; los pesos se publican en FP16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (FP16, `attention_weights.safetensors`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un BERT-base (encoder transformer de 12 capas, ~110 M de parámetros) en el que se ha reemplazado la atención multi-cabeza softmax estándar por `kda_attention`, un mecanismo de atención subcuadrática con complejidad efectiva O(N) u O(N log N) frente a la O(N²) clásica. La serialización es modular: solo se guardan los pesos de atención especializados y la cabeza de clasificación, y el código remoto inicializa el resto desde el checkpoint original de `bert-base-uncased`.

El entrenamiento siguió un protocolo de destilación en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea) ejecutado en una NVIDIA RTX 3090 de 24 GB. Según la model card, el proceso completo duró 50,1 s, con 138 pasos de optimización, un throughput efectivo de 22.582,4 tokens/s y un pico de VRAM de 14.485 MB. El profesor se cacheó offline para no consumir VRAM durante la destilación. No se documentan el volumen de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF o DPO (no aplica en una tarea de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés sobre textos tipo SST-2.
- Clasificación de secuencias cortas de una sola frase; no está diseñado para generación de texto.
- Inferencia con la API estándar de Hugging Face `AutoModelForSequenceClassification` mediante `trust_remote_code=True`.
- Carga modular a través de la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo inglés.
- No se documentan capacidades de contexto largo más allá de las del BERT-base original.

## Casos de uso

- Análisis de opiniones en inglés sobre reseñas de producto o comentarios: el modelo clasifica polaridad binaria en frases cortas, adecuado para pipelines de etiquetado masivo donde la latencia importa más que la precisión estado del arte.
- Investigación sobre atención subcuadrática: sirve como checkpoint de referencia para reproducir y comparar el impacto de `kda_attention` frente a atención softmax en tareas GLUE.
- Docencia y experimentación con destilación modular: el formato de solo pesos de atención (55 MB) facilita estudiar protocolos de destilación sin descargar el modelo completo.
- Prototipado rápido de clasificadores de sentimiento en entornos con VRAM limitada: al cargar solo la atención destilada sobre el base congelado, el consumo es menor que un fine-tuning completo.
- Benchmarking de eficiencia atencional: útil para medir throughput y consumo de memoria de variantes subcuadráticas en una RTX 3090.
- Filtrado previo en pipelines de datos: clasificación rápida de polaridad para descartar o priorizar textos antes de pasarlos a un modelo mayor.
- No recomendado para producción con requisitos de precisión alta: la accuracy de 78,56 % en SST-2 queda lejos del profesor.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`kda_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,98 % | 78,56 % | +25,57 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,6813 | convergido |

Telemetría de entrenamiento (RTX 3090, 24 GB): duración 50,1 s, 138 pasos, 22.582,4 tokens/s, pico de VRAM 14.485 MB.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 14.485 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs de 8-16 GB.
- GPU recomendadas: RTX 3090 (la usada en el entrenamiento), A100, H100 para lotes grandes; cualquier GPU consumer con al menos 8 GB debería bastar para inferencia en FP16.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; la API de NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible para inferencia; solo se publica throughput de entrenamiento (22.582,4 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-kda-attention-sst2` | ~110 M (solo 55 MB serializados) | no disponible | 78,56 % | MIT | Hugging Face, requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | ~110 M | 512 | 91,63 % | Apache 2.0 | Hugging Face, estándar |
| Variantes lineales de atención sobre BERT (p. ej. Linformer, Performer) | ~110 M | variable | no disponible en esta ficha | según implementación | repos de investigación |

No se dispone de datos comparativos adicionales de modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Precisión muy inferior al profesor: 78,56 % frente a 91,63 % en SST-2, lo que la hace inadecuada para producción con requisitos de calidad.
- El estudiante pre-destilación apenas alcanzaba 52,98 %, cerca del azar, lo que sugiere que el mecanismo `kda_attention` no aprende bien sin destilación intensiva.
- Solo inglés; no hay soporte multilingüe documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; riesgo de seguridad y de mantenimiento a largo plazo.
- Dependencia de la librería `neuralops` y del shim `modeling_neuralops_bert.py`; si el repo se rompe o cambia, el modelo deja de cargar.
- El repositorio no incluye los pesos completos: depende de descargar `bert-base-uncased` por separado.
- No se documentan sesgos, evaluación de robustez ni análisis de alucinación (no aplica generación, pero sí posibles errores de clasificación sistemáticos).
- Licencia MIT permite uso comercial, pero el estado experimental y los resultados modestos desaconsejan su uso en producción.
- Fecha de creación futura (2026-11-09) y ecosistema muy joven (50 descargas, 0 likes): poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-kda-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
