# arianraje/looptransv2-qwen3.5-2b-s2-trial-m3_med

## Resumen

LoopTransV2 `s2-trial-m3_med` es un modelo de lenguaje derivado de Qwen3.5-2B mediante la técnica de *looped transformer* con profundidad recurrente: varios bloques de capas del transformer original se ejecutan más de una vez compartiendo pesos, lo que eleva la profundidad efectiva de 24 a 36 capas sin aumentar el número de parámetros. Lo desarrolla el usuario arianraje en el marco del proyecto LoopTrans (rama `v2`), y se publica como un *control* de horario no seleccionado: concretamente, el horario mediano por coste predicho de Stage-1 entre 200.000 horarios válidos muestreados uniformemente con m = 3 pases extra de atención.

El modelo parte de los pesos de Qwen/Qwen3.5-2B y aplica una segunda fase de entrenamiento (Stage 2, "recovery") de 600 millones de tokens con destilación por divergencia KL hacia el profesor original congelado, más una pérdida de interfaz de bucle. El resultado es un checkpoint de 2B parámetros con licencia Apache 2.0, publicado en formato safetensors y orientado a generación de texto.

Su relevancia es fundamentalmente metodológica: sirve como referencia experimental para estudiar si la profundidad recurrente con pesos compartidos puede recuperar el rendimiento del modelo base tras la reconfiguración del grafo de cómputo, y como punto de comparación frente a otros horarios de bucle del mismo proyecto. No es un modelo pensado para producción general, sino un artefacto de investigación con dos exportaciones intermedias (50M y 100M tokens de recuperación).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes (looped transformer, profundidad recurrente); clase `LoopedQwen3_5ForCausalLM` |
| Parámetros totales | 2B (heredados de Qwen3.5-2B; los pesos se comparten entre repeticiones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa filas empaquetadas de 4.096 tokens) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportaciones con pesos, config, tokenizer y manifiesto de bucle) |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Qwen3.5-2B en el que determinados bloques de capas se repiten según un horario explícito, compartiendo pesos entre repeticiones. El horario publicado es `[3]×2 [5]×2 [6]×3 [7..8]×2 [9]×2 [11]×2 [12]×2 [14]×2 [17]×3` (índices de capa base 0-indexados, con el número de repeticiones entre corchetes), lo que eleva la profundidad ejecutada de 24 a 36 capas. Además se realizan m = 3 pases de atención adicionales, cada uno con su propia caché KV, un mecanismo que incrementa la capacidad de atención sin duplicar los pesos del modelo.

El entrenamiento de Stage 2 (recuperación) combina una pérdida de divergencia KL forward hacia el Qwen3.5-2B original congelado (profesor) y una pérdida de interfaz de bucle, con pesos 1/1. Se usa AdamW con LR 1e-5, 5M pasos de warmup y decaimiento coseno a lo largo de 600M tokens hasta 0,1×, con 64 filas empaquetadas de 4.096 tokens por paso. Se publican dos puntos de control: `t0050M` (50.069.504 tokens, paso 191) y `t0100M` (100.139.008 tokens, paso 382). La configuración completa está en `run/config.json` del repositorio.

## Capacidades

- Generación de texto autoregresiva en el pipeline `text-generation`.
- Razonamiento y generación de código heredados del modelo base Qwen3.5-2B, sujetos a la recuperación parcial alcanzada en Stage 2.
- Capacidad de atención extendida mediante los m = 3 pases de atención con cachés KV independientes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del tokenizer y plantilla del modelo base, no documentados aquí).
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo *thinking*, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre profundidad recurrente: el modelo sirve como control experimental para medir cuánto rendimiento se recupera al ejecutar capas repetidas con pesos compartidos frente al Qwen3.5-2B original, usando las exportaciones `t0050M` y `t0100M` como curva de recuperación.
- Comparación de horarios de bucle: al ser el horario mediano por coste de Stage-1 entre 200.000 muestras, permite contrastar empíricamente si horarios alternativos (más profundos, más anchos o con más pases de atención) superan a esta línea base.
- Estudio de destilación KL con profesor congelado: el pipeline de Stage 2 (KL forward + pérdida de interfaz, AdamW, coseno sobre 600M tokens) puede replicarse sobre otros modelos base para evaluar la transferencia de conocimiento en arquitecturas reconfiguradas.
- Validación de infraestructura de inferencia: el paquete `looptransv2` registra un entry point de `vllm.general_plugins`, por lo que el modelo es útil para probar el soporte de vLLM 0.31.0 y flash-linear-attention 0.5.2 con arquitecturas no estándar.
- Experimentos de eficiencia parámetro/cómputo: con 2B parámetros y 36 capas ejecutadas, permite medir el compromiso entre calidad y coste de inferencia frente a un transformer denso de profundidad equivalente.
- Reproducción de resultados: los manifiestos de bucle y la configuración publicada permiten reproducir exactamente la topología del modelo en entornos con las versiones fijadas (transformers 5.17.0, vLLM 0.31.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen informes de benchmark bajo `bench/` en las carpetas donde se evaluó el modelo, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2B parámetros en bfloat16 los pesos ocupan aproximadamente 4 GB, a los que hay que sumar la caché KV de los m = 3 pases de atención y el estado de activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no está confirmado en la documentación; requiere el paquete `looptransv2` para cargar la arquitectura.
- Opciones de despliegue: vLLM 0.31.0 con el plugin de `looptransv2` (carga directa del directorio de exportación); carga nativa con `looptransv2.models.io.load_looped` en transformers 5.17.0. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Profundidad ejecutada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looptransv2-qwen3.5-2b-s2-trial-m3_med | 2B (pesos compartidos) | 36 capas (24 base + repeticiones) | no disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (modelo base) | 2B | 24 capas | no disponible | no disponible en la información | HuggingFace |
| Otros horarios LoopTransV2 | 2B | variable según horario | no disponible | Apache 2.0 | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un control de horario no seleccionado, no un checkpoint optimizado para calidad; no debe esperarse que iguale al Qwen3.5-2B original.
- Recuperación parcial: solo se han completado 100M de los 600M tokens previstos de Stage 2 en las exportaciones publicadas, por lo que el modelo está en un estado intermedio de entrenamiento.
- Dependencia de código externo: la arquitectura no es estándar en transformers; requiere el paquete `looptransv2` (rama `v2`, commit `1463f44`) y versiones fijadas de transformers, vLLM y flash-linear-attention.
- Idiomas no declarados: no hay información sobre cobertura lingüística; el comportamiento multilingüe puede degradarse respecto al modelo base.
- Riesgo de alucinación: no evaluado en la información disponible, pero es esperable en un modelo de 2B con recuperación incompleta.
- Sesgos: no documentados; hereda los del corpus de entrenamiento del modelo base y del proceso de destilación.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-2B conviene verificar las condiciones del modelo base.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa de calidad para justificar su uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/looptransv2-qwen3.5-2b-s2-trial-m3_med
- Repositorio del proyecto LoopTrans (rama `v2`): https://github.com/arianraje/LoopTrans
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
