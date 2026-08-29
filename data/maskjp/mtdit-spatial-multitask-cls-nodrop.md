# maskjp/mtdit-spatial-multitask-cls-nodrop

## Resumen

MTDiT-Spatial es un transformer de difusión multi-tarea (diffusion policy) para robótica, desarrollado por Peng Jiang (maskjp) y publicado bajo licencia Apache 2.0. Está diseñado para predecir acciones de articulaciones absolutas (10 dimensiones) a partir de observaciones de tres cámaras y propiocepción, en un entorno de 7 tareas con 949 episodios reales de un robot. El modelo se basa en una arquitectura DiT de 4 capas con 512 unidades ocultas y 8 cabezas de atención, con codificadores de visión y texto CLIP ViT-B/16.

La publicación es deliberadamente un **resultado negativo**: el modelo ajusta bien los datos de entrenamiento (loss de validación 0.0017) pero **ignora en gran medida las cámaras de escena** para el movimiento del brazo, con una sensibilidad de cámara de brazo de 0.077 frente a un suelo de 0.000 y una referencia de ~1.0. Esta variante concreta (`cls_nodrop`) usa la ruta de visión `cls` (token CLS de CLIP) y sin dropout de estado. El autor publica cinco variantes del barrido para documentar la inversión entre ajuste y anclaje visual, y recomienda explícitamente no desplegar este modelo como política condicionada por visión, sino como baseline de reproducción o caso de prueba para métricas de sensibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con codificador de vision CLIP ViT-B/16 |
| Parametros totales | 234.712.842 (segun safetensors; la model card indica 450M, discrepancia no resuelta) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (horizonte de accion de 32 pasos, 24 ejecutados, 2 de observacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un diffusion policy transformer (DiT) con 4 capas, dimension oculta 512, 8 cabezas de atencion, dropout 0.1 y RoPE (rotary position embeddings). La vision se procesa con `openai/clip-vit-base-patch16` (tanto para imagenes como para texto), con una tasa de aprendizaje de vision reducida a 0.1x respecto al resto. Las imagenes de las tres camaras se redimensionan de 480x640 a 240x320 y se recortan aleatoriamente a 224x224. La accion se representa como articulaciones absolutas de 10 dimensiones, y el objetivo de entrenamiento es DDPM con 100 timesteps, horizonte de 32 pasos, 24 pasos ejecutados y 2 pasos de observacion.

El entrenamiento se realizo sobre el dataset `l5vel-peng/base4-multitask-eef-merged-v30` (7 tareas, 949 episodios, 1.524.905 frames a 50 Hz), con un split de validacion del 5% por tarea. Se usaron 100.000 pasos con batch 64, seed 1000, optimizador con learning rate 3e-4, weight decay 0, sin warmup y decaimiento coseno. La normalizacion es MEAN_STD para vision, MIN_MAX para estado y accion. El checkpoint de 30K se extendio a 100K reanudando el entrenamiento, lo que re-estiro el schedule coseno y provoco un aumento de loss en el paso 35K que se recupero hacia el 65K; el suelo de loss ya se habia alcanzado en 30K.

## Capacidades

- Generacion de acciones de robot (articulaciones absolutas) para tareas multi-tarea de manipulacion.
- Procesamiento de tres flujos de camara simultaneos (izquierda, derecha, pinza) junto con propiocepcion.
- Soporte de condicionamiento por texto (via CLIP) para seleccion de tarea.
- Ejecucion de politicas de difusion con horizonte de 32 pasos y 24 pasos ejecutados.
- Capacidad de reproduccion de comportamientos aprendidos en 7 tareas de un unico robot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje general (es un modelo de robotica puro).

## Casos de uso

- **Baseline para investigacion en anclaje visual**: el modelo sirve como punto de referencia para estudiar por que las politicas de difusion pueden ignorar las camaras de escena. Su baja sensibilidad de camara (0.077) permite comparar arquitecturas alternativas que mejoren el grounding visual.
- **Reproduccion de resultados negativos**: util para verificar metricas de sensibilidad de camara y metodologias de evaluacion (common random numbers, null test) en politicas de robotica.
- **Test de metricas de sensibilidad**: el repositorio incluye `scripts/vision_sensitivity.py`, que permite medir cuantitativamente cuanto depende una politica de las camaras, util para auditar otros modelos.
- **Estudio del shortcut de propiocepcion**: el modelo explota la correlacion de 0.96 entre las articulaciones absolutas y el estado actual, lo que lo convierte en un caso de estudio para entender atajos en el aprendizaje de politicas.
- **Comparacion de rutas de vision**: junto con las otras cuatro variantes publicadas, permite comparar el efecto de `cls`, `spatial_softmax` y `patch_tokens` en el anclaje visual y el ajuste.
- **Entrenamiento de politicas con dropout de estado**: las variantes con dropout de estado 0.15 muestran 2.5-3.5x mas sensibilidad de camara, lo que sugiere una direccion de investigacion para mejorar el grounding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque es un modelo de robotica, no de lenguaje. Los datos disponibles son metricas offline de validacion y sensibilidad de camara:

| Metrica | Valor |
|---|---|
| Validation loss @ 100.000 pasos | 0.0017 |
| Sensibilidad de camara de brazo | 0.077 |
| Sensibilidad de camara de pinza | 0.706 |
| Error de prediccion de brazo (held-out) | 0.094 |
| Null test (camaras propias) | 0.000 |

Para referencia bajo el mismo evaluador, el autor cita que `multi_task_dit` estandar en LIBERO puntua 0.92-1.10 y π₀.₅ en LIBERO 1.19-1.31 en sensibilidad de camara. No se reporta tasa de exito en rollout con entorno real.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la informacion proporcionada. Con 234M parametros y pesos de 0.9 GB, una GPU con 4-8 GB de VRAM deberia ser suficiente para inferencia en FP32, pero no hay datos confirmados.
- **GPU recomendadas**: no disponible. Dado el tamano, cualquier GPU consumer moderna (RTX 3060 o superior) podria ejecutarlo, pero no hay especificacion oficial.
- **Opciones de despliegue**: el modelo se integra via la libreria `lerobot` con el plugin `mtdit_spatial` de `maskjp/lerobot_policy_mtdit_spatial`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a robotica).
- **Latencia y throughput**: no disponible. La variante `patch_tokens` es ~1.8x mas lenta por paso, pero no hay datos de latencia para `cls_nodrop`.

## Comparativa con modelos similares

| Modelo | Parametros | Sensibilidad camara brazo | Contexto/accion | Licencia |
|---|---|---|---|---|
| MTDiT-Spatial `cls_nodrop` (este) | 234.7M | 0.077 | Horizonte 32, 24 ejecutados | Apache 2.0 |
| MTDiT-Spatial `spatial_mask` | no disponible | 0.272 | Idem | Apache 2.0 |
| MTDiT-Spatial `cls_mask` | no disponible | 0.198 | Idem | Apache 2.0 |
| Stock `multi_task_dit` (LIBERO) | no disponible | 0.92-1.10 | no disponible | no disponible |
| π₀.₅ (LIBERO) | no disponible | 1.19-1.31 | no disponible | no disponible |

La comparativa se limita a las variantes del mismo barrido y a las referencias citadas por el autor. No hay datos publicos de otros modelos comparables con la misma metrica.

## Limitaciones y advertencias

- **Resultado negativo declarado**: el autor publica estos pesos como un resultado negativo y desaconseja su despliegue como politica condicionada por vision. La sensibilidad de camara de brazo es 0.077, cerca del suelo.
- **Atajo de propiocepcion**: el modelo predice articulaciones absolutas que correlacionan 0.96 con el estado actual, lo que le permite ignorar las camaras. Datasets con deltas por paso (como LIBERO, correlacion -0.14) no muestran este fallo.
- **Alucinacion y sesgos**: no aplica en el sentido de modelos de lenguaje, pero el modelo puede generar acciones que no corresponden a la escena observada.
- **Limitaciones de generalizacion**: entrenado en un unico robot, una unica embodiment y 3 posiciones de camara fijas. No se reporta tasa de exito en rollout con entorno real, solo metricas offline.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor recomienda no usarlo en produccion como politica de control.
- **Discrepancia de parametros**: la model card indica 450M parametros, pero los safetensors contienen 234.712.842. Esta discrepancia no esta explicada y debe tenerse en cuenta al dimensionar hardware.
- **Dependencia de plugin**: requiere el plugin `mtdit_spatial` del repositorio `maskjp/lerobot_policy_mtdit_spatial`; sin el, el modelo no se puede cargar con `lerobot`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-nodrop
- Repositorio del plugin y scripts de evaluacion: https://github.com/maskjp/lerobot_policy_mtdit_spatial
- Perfil del autor en HuggingFace: https://huggingface.co/maskjp
- Perfil del autor en GitHub: https://github.com/maskjp
- Variante `spatial_nodrop`: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-nodrop
- Variante `patch_tokens`: https://huggingface.co/maskjp/mtdit-spatial-multitask-patch-tokens
- Variante `spatial_mask`: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-mask
- Variante `cls_mask`: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-mask
