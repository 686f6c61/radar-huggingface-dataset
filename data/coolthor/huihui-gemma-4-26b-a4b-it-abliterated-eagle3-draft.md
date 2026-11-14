# coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-eagle3-draft

## Resumen

`coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-eagle3-draft` es un modelo borrador (*draft model*) de decodificación especulativa EAGLE-3, no un modelo de lenguaje autónomo. Lo desarrolla el usuario coolthor y está diseñado exclusivamente para acelerar la inferencia del modelo `huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated`, una variante "abliterated" (dirección de rechazo eliminada) de `google/gemma-4-26B-A4B-it`. Con 927,9 millones de parámetros y 1,9 GB en safetensors, es un componente auxiliar que se carga junto al modelo verificador en vLLM.

El problema que resuelve es concreto: los borradores EAGLE-3 y MTP estándar se entrenan contra el cuerpo original de Gemma 4, y al sustituir ese cuerpo por una versión abliterated la distribución de estados ocultos cambia. Esto provoca que la aceptación por posición se desplome (de ~65 % en la posición 0 a ~20 % en la posición 3). Este borrador se afina durante una época sobre 50.000 muestras regeneradas a través del cuerpo abliterated para realinear las predicciones, recuperando una curva de aceptación casi plana (84,4 / 74,9 / 74,1 / 72,7 %).

Es relevante porque permite recuperar el rendimiento de la decodificación especulativa profunda en despliegues que usan el cuerpo abliterated, algo que hasta ahora obligaba a elegir entre el comportamiento sin rechazo y la aceleración por especulación. La model card incluye una corrección importante: las cifras de ~100 tok/s y ~2× se midieron en `/v1/completions`; en `/v1/chat/completions` la mejora cae a ~46 tok/s frente a ~40 tok/s del cuerpo solo (≈ +15 %), y el MTP vainilla con n=1 alcanza ~51 tok/s en esa misma carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (borrador de decodificación especulativa sobre transformer Gemma 4) |
| Parametros totales | 927.918.336 |
| Parametros activos | no aplica (el modelo base es MoE 26B-A4B, pero este borrador no es MoE) |
| Longitud de contexto | no disponible (entrenado con total_seq_len=4096 empaquetado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el verificador asociado se usa en FP8) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `speculators`, `custom_code`) |

## Arquitectura y entrenamiento

Se trata de un borrador EAGLE-3 que predice varios tokens futuros a partir de los estados ocultos del verificador. Parte de `RedHatAI/gemma-4-26B-A4B-it-speculator-eagle3` (entrenado sobre el cuerpo vainilla) y se afina durante 1 época sobre 50.000 muestras del dataset `Magpie-Align/Magpie-Llama-3.1-Pro-300K-Filtered`, regeneradas a través del cuerpo abliterated en FP8 para obtener pares (prompt, respuesta) en distribución. Utiliza las capas auxiliares de estado oculto [2, 15, 27] (valor por defecto de EAGLE-3), `total_seq_len=4096` empaquetado, `TORCH_COMPILE_DISABLE=1` y schedule coseno con ~100 pasos de warmup.

El entrenamiento se realizó con `vllm-project/speculators` v0.5.0.dev0 sobre una NVIDIA GB10 (DGX Spark, sm_12.1, 121 GB de memoria unificada, 273 GB/s), en unas 11 horas con extracción de vLLM y fine-tuning concurrentes. La profundidad de especulación entrenada es `ttt_steps=3` (posiciones 0, 1 y 2); la posición 3 se extrapola en inferencia y, aunque empíricamente mantiene 72,7 % de aceptación, queda fuera de la distribución de entrenamiento.

## Capacidades

- No genera texto de forma autónoma: es un borrador que propone tokens candidatos para que el verificador (Gemma 4 26B-A4B abliterated) los valide.
- Acelera la decodificación especulativa del cuerpo abliterated, con aceptación por posición de 84,4 % (pos 0), 74,9 % (pos 1), 74,1 % (pos 2) y 72,7 % (pos 3) en la pila de referencia.
- Integración con vLLM mediante `--speculative-config` con `method: eagle3` y `num_speculative_tokens` configurable (recomendado n=4 en GB10).
- Compatible con el verificador en FP8 (`coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-FP8-Dynamic`) y con `kv-cache-dtype fp8`.
- Soporta el pipeline de tool calling y prefix caching de vLLM a través de la configuración del servidor (no es una capacidad propia del borrador).
- Capacidades multilingües, de visión o audio: no disponibles en el borrador (el cuerpo base las gestiona; el borrador solo predice tokens).

## Casos de uso

- Despliegue de un asistente sin rechazos con latencia reducida: cargar el cuerpo abliterated junto a este borrador en vLLM permite mantener el comportamiento abliterated y recuperar parte de la aceleración especulativa, útil en entornos de investigación que estudian modelos sin alineación de rechazo.
- Servicio de generación de código en `/v1/completions`: en la carga de referencia (prompt crudo, sin plantilla de chat) el borrador alcanza ~100 tok/s frente a ~50 tok/s del borrador vainilla, adecuado para autocompletado o FIM donde no se usa plantilla conversacional.
- Benchmarking de decodificación especulativa: sirve como referencia para medir curvas de aceptación por posición al comparar cuerpos alineados y abliterated sobre el mismo stack.
- Investigación sobre robustez de borradores EAGLE-3: permite estudiar cómo el cambio de distribución de estados ocultos del verificador afecta a la aceptación profunda y cómo se corrige con fine-tuning.
- Pipelines de evaluación de seguridad: al permitir ejecutar el cuerpo abliterated con mayor throughput, facilita la generación masiva de respuestas para auditorías de contenido.
- Prototipado en hardware de una sola GPU: con 1,9 GB de pesos, el borrador se suma al verificador en una GB10 sin presión de memoria significativa, habilitando pruebas de especulación en estaciones de trabajo compactas.
- Ajuste fino de configuraciones de `num_speculative_tokens`: el barrido publicado (n=1 a n=4) sirve para calibrar el equilibrio entre throughput y aceptación en distintos despliegues.

## Benchmarks y rendimiento

Aceptación por posición (DGX Spark GB10, verificador FP8, T=0,7, N=10 prompts, max_tokens=200, endpoint `/v1/completions`):

| Posicion | Borrador vainilla | Este borrador | Delta |
|---|---|---|---|
| pos 0 | 65,6 % | 84,4 % | +18,8 pp |
| pos 1 | 43,3 % | 74,9 % | +31,6 pp |
| pos 2 | 29,2 % | 74,1 % | +44,9 pp |
| pos 3 | 20,5 % | 72,7 % | +52,2 pp |

Barrido de `num_speculative_tokens` (GB10, verificador FP8, batch=1):

| n | Throughput | Aceptacion pos-0 |
|---|---|---|
| 1 | 59,04 tok/s | 81,3 % |
| 2 | 66,96 tok/s | 81,6 % |
| 3 | 74,90 tok/s | 88,5 % |
| 4 | 100,36 tok/s | 84,4 % |

Métricas de validación (Magpie held-out, teacher-forced):

| Posicion | full_acc (val) | cond_acc (val) |
|---|---|---|
| pos 0 | 66,8 % | 66,8 % |
| pos 1 | 41,4 % | 61,5 % |
| pos 2 | 26,4 % | 62,6 % |

Corrección de endpoint declarada por el autor: en `/v1/chat/completions` el borrador rinde ~46 tok/s frente a ~40 tok/s del cuerpo solo (≈ +15 %), y el MTP vainilla n=1 alcanza ~51 tok/s en esa carga. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~1,9 GB para los pesos del borrador en safetensors; se suma a la memoria del verificador Gemma 4 26B-A4B (FP8) y de la caché KV.
- GPU validadas: NVIDIA GB10 (DGX Spark, sm_12.1, 121 GB de memoria unificada). El autor no publica pruebas en otras GPU.
- GPU consumer: no hay datos publicados sobre RTX 4090 u otras; el requisito real lo marca el verificador de 26B, no el borrador.
- Despliegue: vLLM con PR #41745 fusionado (integrado en `main` desde 2026-05-06, previsto para la primera versión menor posterior a v0.20.2). Requiere `--trust-remote-code` por el `custom_code` del modelo.
- Configuración recomendada por el autor: `num_speculative_tokens=4`, `kv-cache-dtype fp8`, `gpu-memory-utilization 0.85`, `max-model-len 8192`, `--enable-prefix-caching`.
- Throughput: ~100 tok/s en `/v1/completions` con n=4 en GB10; ~46 tok/s en `/v1/chat/completions`. Latencia no publicada de forma independiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceptacion profunda | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este borrador | EAGLE-3 afinado para cuerpo abliterated | 927,9 M | no disponible | 72,7 % pos 3 | apache-2.0 | Hugging Face |
| `RedHatAI/gemma-4-26B-A4B-it-speculator-eagle3` | EAGLE-3 vainilla | no disponible | no disponible | ~20 % pos 3 contra cuerpo abliterated | no disponible | Hugging Face |
| `gemma4-26b-a4b-it-assistant` (MTP vainilla) | MTP | no disponible | no disponible | no disponible | no disponible | referenciado en la model card |
| `coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-FP8-Dynamic` | Verificador (cuerpo) | 26B (A4B MoE) | no disponible | no aplica | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse para generar texto por sí solo; requiere el verificador correspondiente.
- Las cifras de ~100 tok/s y ~2× solo aplican a `/v1/completions`; en cargas de chat la mejora cae a ~15 % y el MTP vainilla con n=4 puede superarlo (~51 tok/s).
- La posición 3 se extrapola fuera de la distribución de entrenamiento (`ttt_steps=3`); puede degradarse con cargas que no se parezcan a Magpie.
- Entrenado sobre datos Magpie en inglés principalmente; el autor anuncia una ronda 2 con datos de entrenamiento en chino, lo que sugiere cobertura multilingüe limitada en la versión actual.
- Depende de una versión de vLLM con PR #41745 fusionado; en versiones anteriores no funciona.
- Requiere `--trust-remote-code` por el código personalizado, lo que implica ejecutar código del autor.
- El cuerpo base es abliterated: elimina la dirección de rechazo, con implicaciones de seguridad y alineación que deben evaluarse antes de cualquier uso en producción.
- Sesgos y riesgo de alucinación: no documentados específicamente para el borrador; hereda los del cuerpo abliterated, no caracterizados en la información disponible.
- Licencia apache-2.0 declarada, pero el modelo base Gemma tiene sus propios términos de uso que conviene verificar para uso comercial.
- Solo 73 descargas y 1 like en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-eagle3-draft
- Cuerpo abliterated: https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- Verificador FP8: https://huggingface.co/coolthor/Huihui-gemma-4-26B-A4B-it-abliterated-FP8-Dynamic
- Borrador vainilla de partida: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-speculator-eagle3
- Modelo base original: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Magpie-Align/Magpie-Llama-3.1-Pro-300K-Filtered
- Framework de entrenamiento: https://github.com/vllm-project/speculators
- PR de vLLM para Gemma 4 MTP / EAGLE-3: https://github.com/vllm-project/vllm/pull/41745
- Nota de corrección de endpoint (Part 30): https://ai-muninn.com/en/blog/dgx-spark-eagle3-finetune-abliterated-round1
