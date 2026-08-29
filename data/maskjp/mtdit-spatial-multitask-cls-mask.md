# maskjp/mtdit-spatial-multitask-cls-mask

## Resumen

MTDiT-Spatial es una familia de políticas de difusión multi-tarea para robótica, desarrollada por Peng Jiang (maskjp) sobre la librería LeRobot. Esta variante concreta, `cls_mask`, es un diffusion transformer de 234,7 millones de parámetros entrenado sobre 949 episodios reales de manipulación (7 tareas, 1.524.905 frames a 50 Hz). El modelo combina un codificador visual CLIP ViT-B/16 con una cabeza de difusión DDPM para predecir acciones articulares absolutas de 10 dimensiones a partir de tres cámaras y propiocepción.

El autor publica estos pesos explícitamente como un **resultado negativo**: el modelo ajusta bien los datos de entrenamiento pero ignora en gran medida las cámaras de escena, apoyándose en la propiocepción para predecir las articulaciones. La sensibilidad de la cámara de brazo es de 0,198 frente a un suelo nulo de 0,000 y una referencia de ~1,0. Esta publicación es relevante porque documenta un fallo de grounding visual común en políticas de difusión y proporciona un baseline reproducible para investigar métricas de sensibilidad y arquitecturas que eviten este atajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) multi-tarea con codificador CLIP ViT-B/16 para vision y texto; 4 capas, hidden 512, 8 cabezas, dropout 0,1, RoPE |
| Parametros totales | 234.712.852 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | horizon de 32 pasos (24 ejecutados, 2 de observacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin soporte de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `multi_task_dit` de LeRobot, pero con una modificacion clave: en lugar de agrupar cada camara a un unico token CLS (como hace el stock, que descarta los 196 tokens patch), esta variante `cls` utiliza el token CLS como representacion visual, con un dropout de estado del 15%. La politica es un transformer de difusion con 4 capas, dimension oculta 512, 8 cabezas de atencion y embeddings rotatorios (RoPE). El objetivo es DDPM con 100 timesteps de entrenamiento, horizon de 32 pasos, 24 pasos ejecutados y 2 pasos de observacion.

El entrenamiento se realizo sobre el dataset `l5vel-peng/base4-multitask-eef-merged-v30` (7 tareas, 949 episodios, 1.524.905 frames, 50 Hz), con un split de validacion del 5% por tarea. Se usaron 100.000 pasos con batch 64, optimizador Adam a 3e-4 sin warmup, decaimiento coseno y normalizacion visual MEAN_STD, de estado y accion MIN_MAX. Las imagenes de 3 camaras (480×640) se redimensionaron a 240×320 y se recortaron aleatoriamente a 224×224. El checkpoint de 30K se extendio a 100K reanudando el entrenamiento, lo que re-estiro el schedule coseno y provoco un aumento de perdida en el paso 35K que se recupero hacia el 65K. El autor observa que el minimo de perdida ya se habia alcanzado en 30K; 3,3× mas computo solo movio la perdida en 0,0001.

## Capacidades

- Prediccion de acciones articulares absolutas (10 dimensiones) para control de robot manipulador.
- Procesamiento multimodal de tres camaras (izquierda, derecha, gripper) y estado propioceptivo.
- Generacion de trayectorias de 24 pasos mediante difusion denoising.
- Multi-tarea: entrenado en 7 tareas de manipulacion con un unico conjunto de pesos.
- **Limitacion critica**: la sensibilidad a la camara de brazo es de 0,198 (frente a ~1,0 para una politica con grounding visual correcto), lo que indica que el modelo ignora en gran medida las camaras de escena para el movimiento del brazo.
- La camara del gripper si muestra sensibilidad (0,922), pero no es suficiente para un control visual robusto.
- No soporta tool calling, agentes, ni generacion de texto; es exclusivamente una politica de robotica.

## Casos de uso

- **Reproduccion de resultados negativos en investigacion**: el checkpoint permite reproducir exactamente el fallo de grounding documentado, sirviendo como punto de partida para estudiar por que las politicas de difusion tienden a ignorar la vision cuando la propiocepcion correlaciona con las acciones.
- **Baseline para metricas de sensibilidad visual**: el repositorio incluye `scripts/vision_sensitivity.py`, que permite medir cuantitativamente cuanto depende una politica de sus camaras. Este modelo es un caso de prueba ideal para validar dicha metrica.
- **Test de arquitecturas alternativas**: comparar esta variante `cls_mask` con `spatial_mask` (que usa spatial softmax y alcanza 0,272 de sensibilidad) permite evaluar que diseño de vision path mejora el grounding.
- **Estudio del atajo propioceptivo**: el modelo explota la correlacion de 0,96 entre las acciones absolutas y el estado actual. Puede usarse para investigar tecnicas de regularizacion (como el state dropout) que fuerzan a la politica a depender mas de la vision.
- **Validacion de pipelines de entrenamiento LeRobot**: al ser un modelo publicado con configuracion completa (dataset, hiperparametros, schedule), sirve para verificar que un pipeline de entrenamiento reproduce los mismos resultados antes de modificarlo.
- **No apto para despliegue en robotica real**: el autor advierte explicitamente que no debe usarse como politica condicionada por vision en produccion. Cualquier intento de uso en un robot fisico requeriria primero resolver el problema de grounding.

## Benchmarks y rendimiento

La model card reporta metricas offline, no tasas de exito en entorno real. Los datos disponibles son:

| Metrica | Valor |
|---|---|
| Validation loss @ 100.000 pasos | 0,0020 |
| Sensibilidad camara de brazo | 0,198 |
| Sensibilidad camara gripper | 0,922 |
| Error de prediccion de brazo (held-out) | 0,104 |
| Test nulo (propias camaras) | 0,000 |

Para referencia, bajo el mismo evaluador, el `multi_task_dit` stock en LIBERO puntua 0,92–1,10 en sensibilidad, y π₀.₅ en LIBERO 1,19–1,31. El test nulo (alimentar al modelo con sus propias camaras) devuelve 0,000, lo que confirma que el valor de 0,198 es senal real y no ruido del muestreo de difusion (que por si solo contribuye 0,077).

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Como estimacion orientativa basada en el tamano del modelo (234,7M parametros) y el uso de tres codificadores CLIP ViT-B/16:

- VRAM estimada en FP32: ~1,0 GB solo para pesos del transformer, mas overhead de los codificadores de vision y las activaciones de difusion. En FP16, ~0,5 GB para pesos.
- Una GPU consumer con 8 GB de VRAM (p. ej., RTX 3060 Ti, RTX 4060) deberia ser suficiente para inferencia offline.
- Para entrenamiento desde cero, se necesitaria al menos 16-24 GB de VRAM (p. ej., RTX 3090/4090 o A5000) dado el batch de 64 y las imagenes de 224×224.
- Despliegue: se integra con LeRobot (`make_policy`), que soporta inferencia en PyTorch. No se mencionan opciones de cuantizacion ni despliegue con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El autor menciona que la variante `patch_tokens` es ~1,8× mas lenta por paso, pero no da numeros absolutos para `cls_mask`.

## Comparativa con modelos similares

| Modelo | Parametros | Sensibilidad camara brazo | Perdida validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mtdit-spatial-multitask-cls-mask` (este) | 234,7M | 0,198 | 0,0020 | Apache-2.0 | HuggingFace |
| `mtdit-spatial-multitask-cls-nodrop` | 234,7M (estimado) | 0,077 | 0,0017 | Apache-2.0 | HuggingFace |
| `mtdit-spatial-multitask-spatial-mask` | 234,7M (estimado) | 0,272 | 0,0019 | Apache-2.0 | HuggingFace |
| `multi_task_dit` stock (LeRobot) | ~450M (segun model card) | 0,92–1,10 (LIBERO) | no disponible | Apache-2.0 | HuggingFace |
| π₀.₅ | no disponible | 1,19–1,31 (LIBERO) | no disponible | no disponible | no disponible |

La comparativa muestra la inversion que documenta el autor: los modelos con menor perdida de validacion son los que menos grounding visual tienen. `cls_nodrop` (sin state dropout) alcanza la mejor perdida (0,0017) pero la peor sensibilidad (0,077), mientras que `spatial_mask` (con state dropout 0,15 y spatial softmax) logra la mejor sensibilidad (0,272) con una perdida ligeramente peor (0,0019).

## Limitaciones y advertencias

- **Resultado negativo declarado**: el autor publica estos pesos como un fallo de grounding visual. No debe desplegarse como politica condicionada por vision en un robot real.
- **Ignora las camaras de escena**: la sensibilidad de la camara de brazo es 0,198, muy por debajo de la referencia ~1,0. Las camaras izquierda y derecha contribuyen menos que la del gripper.
- **Atajo propioceptivo**: entrenado con objetivos de articulaciones absolutas que correlacionan 0,96 con el estado actual, lo que facilita que la politica ignore la vision. Este problema no aparece en datasets con deltas por paso (como LIBERO, correlacion −0,14).
- **Generalizacion limitada**: un solo robot, una sola embodiment y 3 poses de camara fijas. No se reporta tasa de exito en rollout en entorno; solo metricas offline.
- **Sin soporte de lenguaje**: a pesar de usar CLIP para texto, no hay evidencia de capacidades de instruccion en lenguaje natural.
- **Sin cuantizaciones publicadas**: no se ofrecen versiones GGUF, ONNX ni otras cuantizaciones; el unico formato es safetensors via LeRobot.
- **Dependencia de un plugin externo**: requiere el plugin `mtdit_spatial` del repositorio `maskjp/lerobot_policy_mtdit_spatial` para cargar el modelo, lo que anade una dependencia no estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-mask
- Repositorio del plugin y scripts de sensibilidad: https://github.com/maskjp/lerobot_policy_mtdit_spatial
- Perfil del autor en HuggingFace: https://huggingface.co/maskjp/models
- Variante `cls_nodrop`: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-nodrop
- Variante `spatial_nodrop`: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-nodrop
- Variante `patch_tokens`: https://huggingface.co/maskjp/mtdit-spatial-multitask-patch-tokens
- Variante `spatial_mask`: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-mask
