# Riasok/vlanext-libero-spatial-frozenvlm-sft

## Resumen

VLANeXt LIBERO-Spatial SFT (frozen VLM) es un checkpoint de política robótica de tipo VLA (Vision-Language-Action) desarrollado por el usuario Riasok. Se construye sobre el modelo multimodal Qwen/Qwen3-VL-2B-Instruct, cuyo codificador visual y modelo de lenguaje permanecen congelados durante el ajuste fino supervisado. Solo se entrenan la cabeza de acción DiT, el conector/proyector de acción y las meta queries, lo que supone 612M de parámetros entrenables sobre un total de 2,74B.

El modelo está especializado en la suite de manipulación robótica LIBERO-Spatial, un conjunto de tareas que evalúa la capacidad de generalización espacial en entornos de manipulación. El checkpoint reporta un éxito de 0,960 en `success_once` sobre 500 episodios (10 tareas × 50 ensayos), lo que lo sitúa como una referencia práctica para investigación en políticas VLA con backbone congelado.

Su relevancia actual radica en la estrategia de eficiencia: al congelar el VLM y entrenar únicamente el cabezal de acción, se reduce drásticamente el coste computacional del ajuste fino manteniendo un rendimiento alto en tareas de manipulación espacial. La licencia Apache 2.0 facilita su reutilización en investigación y desarrollo comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen3-VL-2B-Instruct (congelado) + cabeza de acción DiT con flow-matching |
| Parámetros totales | 2,74B (612M entrenables) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (formato del entrenador VLANeXt: `{step, model_state_dict, config}`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VLANeXt: un backbone VLM multimodal (Qwen3-VL-2B-Instruct) congelado que procesa observaciones visuales multi-vista a 256 px y contexto de lenguaje, acoplado a una cabeza de acción de tipo Diffusion Transformer (DiT) con tamaño oculto 1024 y profundidad 29. La cabeza se entrena con pérdida de flow-matching de difusión. El conector/proyector de acción y las meta queries también se entrenan, sumando 612M de parámetros ajustables de los 2,74B totales.

El entrenamiento se realizó sobre el dataset LIBERO-Spatial en formato LeRobot, con historial de 1 frame, predicción de 8 frames futuros, múltiples vistas a 256 px y aumento de datos activado. La optimización usó tasa de aprendizaje 5e-5, tamaño de lote 128 y 5.000 pasos. En evaluación se empleó muestreo ODE con 5 pasos de denoising, chunk de acción 4 y horizonte 240 sobre 10 tareas × 50 ensayos (500 episodios). No se especifica en la información disponible si hubo RLHF o DPO; existe una versión posterior ajustada con PPO.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales multi-vista y contexto de instrucción.
- Generalización espacial: entrenado específicamente en LIBERO-Spatial, orientado a variaciones de posición y disposición de objetos.
- Política de difusión: la cabeza DiT con flow-matching permite muestreo ODE determinista con pocos pasos de denoising.
- Procesamiento multimodal heredado del backbone Qwen3-VL-2B-Instruct (visión y lenguaje), aunque congelado y no ajustado en esta versión.
- Ejecución con chunk de acción: predice secuencias de acciones (chunk 4) para control a corto plazo.
- No se dispone de información sobre tool calling, agentes multi-paso ni capacidades multilingües específicas en esta ficha.

## Casos de uso

- Investigación en políticas VLA eficientes: sirve como referencia para estudiar el impacto de congelar el backbone VLM y entrenar solo el cabezal de acción, reduciendo coste de ajuste fino.
- Benchmarking en LIBERO-Spatial: punto de comparación reproducible para nuevas propuestas de arquitecturas VLA en tareas de manipulación espacial.
- Prototipado de manipulación robótica en simulación: permite evaluar políticas de control en entornos LIBERO antes de transferir a hardware real.
- Ablaciones de diseño de cabezal de acción: la configuración DiT (hidden 1024, depth 29, flow-matching) sirve de base para experimentar con variantes de denoising y chunking.
- Base para ajuste con RL: el checkpoint SFT es el punto de partida del que deriva la versión PPO publicada por el mismo autor, útil en pipelines de refinamiento por refuerzo.
- Docencia y divulgación: ejemplo didáctico de integración VLM + política de difusión con backbone congelado, adecuado para cursos de robótica e IA.
- Evaluación de generalización espacial: útil para medir la robustez ante cambios de posición de objetos en tareas de manipulación.

## Benchmarks y rendimiento

Evaluación en LIBERO-Spatial (10 tareas × 50 ensayos = 500 episodios, muestreo ODE, 5 pasos de denoising, chunk de acción 4, horizonte 240):

| Métrica | Valor |
|---|---|
| success_once | 0,960 |
| success_at_end | 0,944 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repo ocupa 6,7 GB en formato `.pt`, lo que da una referencia del tamaño en pesos (probablemente fp32/bf16 con estado del modelo). Para inferencia en bf16 se estima un orden de magnitud de ~5,5 GB solo en pesos, más overhead de activaciones y del backbone VLM.
- GPU recomendadas: no especificadas por el autor. Por tamaño (2,74B), una GPU con 16-24 GB (RTX 4090, A10, L4) sería suficiente para inferencia en precisión reducida; A100/H100 para entrenamiento o lotes grandes.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) y posiblemente en RTX 3090/4080 con cuantización o precisión reducida; no confirmado por el autor.
- Opciones de despliegue: el checkpoint está en formato del entrenador VLANeXt (`.pt`), no en safetensors ni GGUF. Requiere el código del proyecto VLANeXt para cargarlo; no se indica soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento LIBERO-Spatial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLANeXt LIBERO-Spatial SFT (frozen VLM) | 2,74B (612M entrenables) | no disponible | success_once 0,960 | Apache 2.0 | Hugging Face |
| VLANeXt LIBERO-Spatial PPO (mismo autor) | 2,74B (612M entrenables) | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Qwen3-VL-2B-Instruct (backbone base) | 2B | no disponible | no aplica (no es política VLA) | no disponible en esta ficha | Hugging Face |

No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente en LIBERO-Spatial; no se garantiza generalización a otras suites (LIBERO-Object, LIBERO-Goal, LIBERO-Long) ni a entornos reales.
- Backbone congelado: el VLM no se ajusta, por lo que las capacidades visuales y lingüísticas quedan limitadas a las del Qwen3-VL-2B-Instruct original.
- Formato propietario: los pesos están en `.pt` del entrenador VLANeXt, lo que exige usar el código del proyecto y dificulta el despliegue con herramientas estándar.
- Sin información de sesgos: no se documentan sesgos conocidos ni evaluación de alucinación (en el contexto de políticas de acción, el riesgo se traduce en acciones erróneas o inseguras).
- Idiomas no especificados: no se indica qué lenguas soporta el modelo para instrucciones.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor no documenta condiciones adicionales ni responsabilidad sobre el uso en robots reales.
- Riesgo en producción: al ser un checkpoint de investigación con 0 descargas y sin validación externa, no se recomienda su uso directo en sistemas críticos sin evaluación propia.
- Fecha de creación futura (2026-11-09): metadato atípico que conviene verificar antes de confiar en la trazabilidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riasok/vlanext-libero-spatial-frozenvlm-sft
- Versión PPO del mismo autor: https://huggingface.co/Riasok/vlanext-libero-spatial-frozenvlm-ppo
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
