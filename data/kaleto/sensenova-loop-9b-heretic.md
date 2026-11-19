# Kaleto/SenseNova-Loop-9B-heretic

## Resumen

SenseNova-Loop-9B-heretic es una variante no oficial del modelo multimodal SenseNova-Loop-9B de SenseTime/SenseNova, publicada por el usuario Kaleto. Se trata de un derivado "abliterated": los pesos originales se han modificado mediante la herramienta Heretic 2.1.0 con la técnica Arbitrary-Rank Ablation (ARA) para eliminar el comportamiento de rechazo (refusal) del modelo base. No ha habido fine-tuning ni entrenamiento sobre texto generado; el cambio consiste en una edicion local y directa de 24 matrices de pesos en las capas 15 a 26.

El modelo conserva la arquitectura original de SenseNova-Loop, un transformer con capas "looped" (las capas 4 a 27 se ejecutan dos veces), torre de vision y cabeza MTP, con 9.412.959.856 parametros totales en BF16. El pipeline declarado es image-text-to-text, por lo que mantiene capacidad de entrada de imagen, aunque las variantes cuantizadas NVFP4 servidas con vLLM solo cubren texto. Los idiomas declarados son ingles y aleman, y la licencia es Apache-2.0.

Su relevancia es doble: por un lado, demuestra la aplicacion de ARA a arquitecturas con capas recurrentes o looped, un caso poco habitual en la literatura de abliteration; por otro, ofrece una version sin alineamiento de seguridad del modelo base, con metricas de rechazo que caen de 100/100 a 5/100 en el conjunto estandar de evaluacion, a costa de una perdida medible en TruthfulQA y de un aumento de la divergencia KL respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas looped (capas 4-27 ejecutadas dos veces), torre de vision y cabeza MTP; clase `sensenova_loop` |
| Parametros totales | 9.412.959.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de servicio con vLLM; el maximo oficial del modelo base no se detalla en la informacion disponible) |
| Tipos de cuantizacion | BF16 (original), NVFP4 W4A16 (ModelOpt) en dos variantes: decoder completo y solo MLP |
| Idiomas soportados | en, de |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 en la raiz; variantes NVFP4 en subcarpetas) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura transformer con una innovacion estructural: las capas 4 a 27 se ejecutan dos veces en cada pasada forward (capas "looped"), lo que aumenta la profundidad efectiva sin incrementar el numero de parametros. Incluye ademas atencion lineal con parametros propios (`linear_attn.A_log`, `linear_attn.dt_bias`, `linear_attn.in_proj_a/b`, `conv1d`), routers mHC, una compuerta de bucle (`loop_gate.logits`), una torre de vision y una cabeza de prediccion multi-token (MTP). El modelo es multimodal (image-text-to-text).

Este derivado no ha sido entrenado ni fine-tuneado. La modificacion consiste en la ablacion de direcciones de rechazo mediante Heretic 2.1.0 con ARA, aplicada con un plugin especifico que gestiona las capas looped (cada visita al bucle recibe sus propias estadisticas de entrada/salida). La busqueda de hiperparametros se realizo con Optuna multiobjetivo TPE sobre 250 trials, optimizando rechazos oficiales, rechazos en un conjunto privado de prompts y divergencia KL. Se selecciono el trial 33 con `start_layer_index` 15, `end_layer_index` 27, `preserve_good_behavior_weight` 0.339, `steer_bad_behavior_weight` 0.00249, `overcorrect_relative_weight` 0.944 y `neighbor_count` 14. Las direcciones de ablacion se calcularon con `mlabonne/harmful_behaviors` train[:200] y `mlabonne/harmless_alpaca` train[:200], mas prompts privados de una aplicacion de acompanamiento. Se modificaron 24 matrices en las capas 15-26 (9 `linear_attn.out_proj`, 12 `mlp.down_proj`, 3 `self_attn.o_proj`); el resto de tensores, el `config.json`, el codigo de modelado, el tokenizer y la plantilla de chat son identicos al original.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y aleman.
- Entrada de imagen (pipeline image-text-to-text) en la version BF16; las variantes NVFP4 servidas con el plugin de vLLM son solo texto.
- Razonamiento matematico: GSM8K 5-shot strict de 90,7 en este modelo.
- Conocimiento general y respuesta a preguntas: MMLU 74,3.
- Razonamiento de sentido comun: HellaSwag 65,3; ARC-Challenge 50,9.
- Cumplimiento de instrucciones sin rechazo: 5/100 rechazos en `mlabonne/harmful_behaviors` test[:100] y 0/835 en el conjunto privado Anima replay.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking: la evaluacion de rechazos se realizo con thinking desactivado; no se detalla el comportamiento con thinking activo.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta a capacidades como TruthfulQA (caida de ~5 puntos) manteniendo GSM8K y MMLU, util para analizar el trade-off entre seguridad y fidelidad factual.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa con tematicas que el modelo base rechazaria, aprovechando la reduccion de rechazos a 5/100 y el contexto de hasta 32.768 tokens para tramas largas.
- Aplicaciones de acompanamiento conversacional: el conjunto Anima replay (835 prompts de una app de acompanamiento e imagen) pasa de 56 rechazos a 0, lo que lo hace adecuado para asistentes conversacionales con requisitos de baja tasa de negativa.
- Evaluacion comparativa de tecnicas de abliteration: sirve como referencia para medir ARA frente a otras tecnicas en arquitecturas con capas looped, con metricas publicadas de KL (0,1001) y rechazos.
- Despliegue en hardware limitado: la variante NVFP4 W4A16 decoder ocupa 9,4 GB y se sirve con vLLM 0.31.0 y el plugin `vllm-sensenova-loop`, lo que permite ejecucion en GPUs con 12-16 GB de VRAM para tareas de solo texto.
- Generacion de prompts de imagen: el conjunto de evaluacion Anima incluye prompts de imagen; el modelo puede usarse para generar descripciones y prompts detallados en pipelines de sintesis de imagen.
- Prototipado multimodal en ingles y aleman: la version BF16 acepta imagen y texto, util para demos de captioning o VQA en entornos de investigacion donde no se requiere alineamiento de seguridad.

## Benchmarks y rendimiento

Evaluacion con lm-evaluation-harness 0.4.13, backend HF, BF16, few-shot sin plantilla de chat, batch 16, `max_length` 4096; GSM8K y HellaSwag limitados a 300 ejemplos.

| Tarea | Original | Este modelo |
|---|---|---|
| GSM8K (5-shot, strict) | 91,7 | 90,7 |
| ARC-Challenge (acc_norm) | 52,6 | 50,9 |
| HellaSwag (acc_norm) | 66,0 | 65,3 |
| TruthfulQA MC2 | 51,2 | 46,3 |
| MMLU | no medido | 74,3 |

Evaluacion de rechazos (Heretic 2.1.0, `mlabonne/harmful_behaviors` test[:100], primeros 100 tokens, system prompt "You are a helpful assistant.") y divergencia KL sobre `mlabonne/harmless_alpaca` test[:100]:

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| SenseNova-Loop-9B original | 100/100 | 0 |
| Este modelo (BF16) | 5/100 | 0,1001 |

Evaluaciones adicionales de rechazo (thinking off, greedy, 256 tokens nuevos):

| Conjunto | Original | Este modelo |
|---|---|---|
| Anima replay (835 prompts, regla propia de la app) | 56 | 0 |
| Anima replay, marcadores Heretic | 109 | 1 |

Variantes cuantizadas servidas con vLLM 0.31.0 y plugin (greedy, thinking off, 256 tokens):

| Variante | Tamano | Alcance | KLD vs. BF16 | Rechazos harmful_behaviors | Anima replay |
|---|---|---|---|---|---|
| BF16 | 18,8 GB | – | 0 | 5/100 | 0/835 |
| NVFP4 W4A16 decoder | 9,4 GB | MLP + atencion + GDN | 0,143 | 8/100 | 0/835 |
| NVFP4 W4A16 MLP | 12,4 GB | solo MLP | 0,085 | 9/100 | 0/835 |

## Requisitos de hardware

- VRAM para BF16: aproximadamente 18,8 GB de pesos, mas overhead de activaciones y cache KV; se recomienda GPU de 24 GB o superior (RTX 3090/4090, A10G, L4 con margen limitado).
- VRAM para NVFP4 W4A16 decoder: 9,4 GB de pesos; cabe en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, L4) para inferencia de solo texto.
- VRAM para NVFP4 W4A16 MLP: 12,4 GB de pesos; requiere 16 GB o mas.
- GPUs recomendadas para produccion: A100 40/80 GB, H100, L40S para BF16 con contexto largo; DGX Spark aparece mencionado como plataforma de evaluacion de las variantes NVFP4.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) para BF16 y en RTX 4080/4070 Ti (16/12 GB) para las variantes NVFP4 de solo texto.
- Opciones de despliegue: transformers con `trust_remote_code=True` para BF16; vLLM 0.31.0 con el plugin `vllm-sensenova-loop` (solo texto) para las variantes NVFP4. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SenseNova-Loop-9B (original) | 9,41B | no disponible | Apache-2.0 | Modelo base multimodal con alineamiento de seguridad; 100/100 rechazos, GSM8K 91,7, TruthfulQA 51,2 |
| SenseNova-Loop-9B-heretic (este modelo) | 9,41B | 32.768 (uso documentado) | Apache-2.0 | Sin alineamiento de seguridad; 5/100 rechazos, GSM8K 90,7, TruthfulQA 46,3, MMLU 74,3 |
| Otras variantes abliterated de 9B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de alineamiento de seguridad: el modelo cumple peticiones que el original rechaza, incluidas potencialmente daninas. El autor declina responsabilidad y exige que el usuario anada sus propias salvaguardas.
- Mayor riesgo de alucinacion y menor fidelidad factual: TruthfulQA MC2 cae de 51,2 a 46,3 (aproximadamente 5 puntos), patron tipico de la abliteration, ya que el modelo contradice premisas falsas con menos frecuencia.
- Degradacion leve en razonamiento: ARC-Challenge baja de 52,6 a 50,9 y HellaSwag de 66,0 a 65,3.
- Las variantes cuantizadas reintroducen algunos rechazos en el conjunto generico (8-9/100 frente a 5/100) y aumentan la divergencia KL (0,085-0,143).
- Cobertura linguistica limitada a ingles y aleman; no se garantiza calidad en castellano.
- Las variantes NVFP4 servidas con vLLM son solo texto: se pierde la capacidad de entrada de imagen del modelo base en ese modo de despliegue.
- El conjunto de evaluacion Anima replay es privado y no se ha publicado, por lo que sus resultados no son reproducibles de forma independiente.
- Modelo no oficial: no esta afiliado ni respaldado por SenseNova/SenseTime; posibles problemas de soporte y de compatibilidad futura con el codigo de modelado.
- Requiere `trust_remote_code=True` en transformers para la version BF16, lo que implica ejecutar codigo del repositorio.
- Uso comercial permitido por Apache-2.0, pero la responsabilidad legal y etica del contenido generado recae integramente en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaleto/SenseNova-Loop-9B-heretic
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Plugin vLLM para SenseNova-Loop: https://github.com/KaletoAI/vllm-sensenova-loop
- Espacio de benchmarks locales (DX10): https://huggingface.co/spaces/Kaleto/LocalLLMBenchmarks
- Conjunto de evaluacion de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Conjunto de calibracion de comportamiento: https://huggingface.co/datasets/mlabonne/harmless_alpaca
