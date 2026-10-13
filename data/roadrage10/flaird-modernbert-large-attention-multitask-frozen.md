# roadrage10/flaird-modernbert-large-attention-multitask-frozen

## Resumen

flaird-modernbert-large-attention-multitask-frozen es un modelo de clasificación de texto (encoder-only) publicado por el usuario roadrage10 en HuggingFace. Se trata de un ajuste fino de ModernBERT-large, la arquitectura de encoder presentada por AnswerDotAI como sucesora modernizada de BERT, y cuenta con 402.418.956 parametros reales segun los pesos en safetensors. El nombre del repositorio indica un entrenamiento multitarea ("multitask") con algun tipo de mecanismo de atencion especifico ("attention") y componentes congelados ("frozen"), aunque la model card no detalla estas decisiones de diseno.

El modelo resuelve tareas de clasificación de texto, presumiblemente en el contexto del proyecto "flaird" del propio autor, y declara metricas muy altas en su conjunto de evaluacion: ROC-AUC de 0,992, F1 de 0,974 y Brier de 0,964. La relevancia actual es limitada por su escasa difusion (3 descargas, 0 likes) y por la ausencia de informacion sobre el dataset, los idiomas y la licencia, lo que dificulta su reutilizacion en produccion.

Se trata, por tanto, de un artefacto de investigacion poco documentado pero con resultados numericos notables, util como referencia para quien quiera reproducir pipelines de clasificacion multitarea sobre ModernBERT-large.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (base ModernBERT-large, deducido del nombre del repositorio) |
| Parametros totales | 402.418.956 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; ModernBERT-large soporta 8.192 tokens de forma nativa (no confirmado para este ajuste) |
| Tipos de cuantizacion | No especificados por el autor; al ser safetensors en transformers es compatible con FP32, FP16, BF16, INT8 e INT4 mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 3,3 GB |
| Descargas / likes | 3 / 0 |
| Libreria | transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.0.0, Tokenizers 0.23.1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT-large, un transformer de tipo encoder-only con normalizacion pre-LN, activacion GeGLU, rotary positional embeddings (RoPE) y atencion con Flash Attention. Segun el nombre del repositorio, el ajuste combina una variante de atencion congelada ("attention...frozen") y una cabeza multitarea, pero la model card no describe ni la cabeza de clasificacion ni que capas se mantuvieron congeladas durante el entrenamiento. No se ha publicado informacion sobre el dataset de ajuste: la model card indica literalmente "unknown dataset".

Los hiperparametros de entrenamiento si estan documentados: learning rate de 2e-05, batch size de 256 (tanto en train como en eval), semilla 42, optimizador AdamW (torch fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 6%, y una unica epoca. El entrenamiento duro 19.836 pasos; con batch de 256 y 1 epoca, esto implica un conjunto de aproximadamente 5 millones de ejemplos, aunque no se puede confirmar sin el dato del tamano del dataset. No se menciona uso de RLHF, DPO ni decodificacion especulativa (no aplicable a un clasificador). La perdida de validacion descendio de forma monotona hasta 0,1346 en el ultimo paso.

## Capacidades

- Clasificacion de texto multitarea: el nombre y las metricas (F1, ROC-AUC, Brier, C@1, F05u) indican una o varias cabezas de clasificacion entrenadas de forma conjunta.
- Puntuacion probabilistica calibrada: la inclusion de la metrica Brier (0,964) sugiere que el modelo produce probabilidades, no solo etiquetas.
- Salida tipo ranking: la metrica C@1 (0,951) es habitual en tareas de respuesta a preguntas y seleccion de candidatos, lo que apunta a una capacidad de puntuar alternativas.
- No se documenta soporte de tool calling.
- No se documenta soporte de agentes ni razonamiento multi-paso (es un encoder, no un modelo generativo).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): ninguna declarada.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo puede etiquetar automaticamente consultas por categoria o prioridad en un pipeline de atencion al cliente, aprovechando su cabeza de clasificacion y su rapida inferencia al ser un encoder de 402 M de parametros.
- Moderacion de contenido: puntuar textos y decidir umbrales a partir de las probabilidades calibradas (Brier documentado), integrandolo en un servicio de filtrado con reintentos.
- Enrutamiento de documentos en pipelines RAG: usar las puntuaciones del modelo para decidir que documentos clasificar, priorizar o descartar antes de pasarlos a un LLM generativo.
- Deteccion de duplicados o similitud etiquetada: entrenando o reutilizando la cabeza multitarea para tareas de emparejamiento o ranking de candidatos (C@1).
- Investigacion academica sobre ModernBERT: servir como punto de partida reproducible para experimentos de ajuste fino con capas congeladas y comparar con la variante "concatenation-single-task" publicada por el mismo autor.
- Evaluacion de robustez de encoders modernos: al contar con metricas de calibracion (Brier, F05u), es util para estudiar el comportamiento probabilistico de ModernBERT-large en dominios concretos.
- Extraccion de senales para sistemas de recomendacion: dada una descripcion y un item, el modelo puede puntuar la probabilidad de interaccion relevante como feature de un modelo mayor.

## Benchmarks y rendimiento

La model card no declara resultados de benchmarks estandar (MMLU, GLUE, HumanEval, etc.). Los datos disponibles son metricas del conjunto de evaluacion del propio autor:

| Metrica | Valor (mejor paso, epoch 0,8) |
|---|---|
| Loss | 0,1359 |
| ROC-AUC | 0,992 |
| Brier | 0,964 |
| C@1 | 0,951 |
| F1 | 0,974 |
| F05u | 0,989 |
| Mean | 0,974 |

Evolucion del entrenamiento (extracto representativo):

| Epoca | Paso | Validation loss | ROC-AUC | F1 | Mean |
|---|---|---|---|---|---|
| 0,1 | 1984 | 0,2069 | 0,972 | 0,936 | 0,937 |
| 0,3 | 5952 | 0,1633 | 0,986 | 0,967 | 0,966 |
| 0,5 | 9920 | 0,1474 | 0,989 | 0,969 | 0,969 |
| 0,7 | 13888 | 0,1383 | 0,991 | 0,970 | 0,970 |
| 0,8 | 15872 | 0,1359 | 0,992 | 0,974 | 0,974 |
| 1,0 | 19836 | 0,1346 | 0,992 | 0,971 | 0,972 |

No se dispone de comparaciones directas con otros modelos en el mismo dataset, ya que este no se ha hecho publico.

## Requisitos de hardware

- VRAM estimada para pesos: FP32 ~1,6 GB, FP16/BF16 ~0,8 GB, INT8 ~0,4 GB, INT4 ~0,2 GB.
- VRAM total de inferencia: hay que sumar activaciones. Con contexto corto (128-512 tokens) y batches pequenos, el modelo cabe en GPUs de 6-8 GB. Con contexto de 8.192 tokens y batch grande, las activaciones pueden elevar el consumo por encima de 4-6 GB por lote.
- GPU recomendadas: T4, RTX 3060 12 GB, RTX 4090, L4, A10G y A100 para lotes grandes.
- Cabe en GPU de consumo: si, en cualquier GPU moderna con al menos 6-8 GB de VRAM en FP16.
- Opciones de despliegue: transformers (nativo), Text Generation Inference (TGI, con soporte para clasificacion), ONNX Runtime, TorchServe o FastAPI con un wrapper propio. Llama.cpp y Ollama no son la via habitual al ser encoder-only (aunque existan conversiones GGUF).
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 402 M de parametros, cabe esperar latencias de pocos milisegundos por muestra en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flaird-modernbert-large-attention-multitask-frozen | 402 M | no disponible (base ModernBERT-large: 8.192) | Clasificacion multitarea | no disponible | HuggingFace (3 descargas) |
| yusr9/flaird-modernbert-large-attention-single-task-frozen | no disponible | no disponible | Clasificacion single-task | no disponible | HuggingFace |
| roadrage10/flaird-modernbert-large-concatenation-single-task-frozen | no disponible | no disponible | Clasificacion single-task | no disponible | HuggingFace |
| ModernBERT-large (base, AnswerDotAI) | ~395 M | 8.192 | Encoder generalista (MLM) | Apache 2.0 (segun repo oficial) | HuggingFace, GitHub |
| BERT-large (Google) | 340 M | 512 | Encoder generalista (MLM) | Apache 2.0 | HuggingFace |

Comparacion de rendimiento en la tarea "flaird": no disponible, ya que el dataset no es publico y los modelos parecidos no comparten evaluacion.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar su uso comercial sin consultar al autor. Tratar como uso restringido hasta confirmacion.
- Dataset de ajuste desconocido: la model card indica explicitamente "unknown dataset", lo que impide evaluar sesgos, distribucion de dominios y cobertura linguistica.
- Idiomas no declarados: se asume ingles por el tokenizador de ModernBERT, pero no esta confirmado.
- Riesgo de sobreajuste: con 1 epoca sobre aproximadamente 5 millones de ejemplos y metricas de 0,97 en F1, conviene validar en dominios distintos antes de desplegarlo en produccion.
- Alucinacion: no aplica en sentido generativo, pero si puede producir clasificaciones erroneas con alta confianza; la calibracion Brier es alta pero no perfecta (0,964).
- Contexto: si el modelo sigue la configuracion estandar de ModernBERT-large, se limita a 8.192 tokens; no confirmado por el autor.
- Madurez del repositorio: 3 descargas y 0 likes, sin articulo, demo ni documentacion adicional. Es un artefacto experimental, no un modelo mantenido.
- Uso de `custom_code`: la etiqueta indica que requiere codigo personalizado en transformers, lo que puede complicar la integracion y el despliegue estandar.
- Version de transformers muy reciente (5.16.1): puede no ser compatible con versiones antiguas del ecosistema.
- Sin model card completa: faltan secciones de "Intended uses", "Training and evaluation data" y descripcion del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roadrage10/flaird-modernbert-large-attention-multitask-frozen
- Variante concatenation-single-task del mismo autor: https://huggingface.co/roadrage10/flaird-modernbert-large-concatenation-single-task-frozen
- Variante attention-single-task (otro usuario): https://huggingface.co/yusr9/flaird-modernbert-large-attention-single-task-frozen
- Repositorio oficial de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Articulo de BERT en Wikipedia (contexto historico del encoder): https://en.wikipedia.org/wiki/BERT_(language_model)
- Leaderboard general de LLM con el que comparar disponibilidad de modelos: https://llm-stats.com/leaderboards/llm-leaderboard
