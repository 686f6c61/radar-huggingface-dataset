# dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter200

## Resumen

Este repositorio contiene un checkpoint LoRA de adaptación para el modelo de generación de video `fused_video2world_dit` de MimicVideo, desarrollado por el usuario `dreamdifferent`. Se trata de un adaptador entrenado en la iteración 200 de una ejecución denominada `v2w_kuka_iiwa14_level4_widowx_texture_2cam_hstack_v2_from_widowx250_video_fused_f0cea76_lora_r256`, orientado a la generación de video condicionada por instrucciones de tareas robóticas. El modelo no es un generador autónomo: requiere cargar primero el backbone base (un DiT fusionado de ~3,9 GB) y después aplicar este LoRA de 0,7 GB.

La relevancia de este adaptador radica en su especialización para el dominio de manipulación robótica con dos cámaras (vista de esquina y frontal), utilizando un layout de imágenes apiladas horizontalmente (`hstack`) a 5 Hz. El entrenamiento se realizó sobre 192 episodios y 54 749 frames, con 29 instrucciones condicionadas por episodio. Este tipo de adaptadores permite ajustar modelos de generación de video a dominios específicos sin necesidad de reentrenar el modelo completo, lo que reduce drásticamente los costes computacionales. La arquitectura subyacente es un Diffusion Transformer (DiT) fusionado, probablemente basado en la familia Cosmos de NVIDIA, aunque no se especifica explícitamente en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `fused_video2world_dit` (Diffusion Transformer) |
| Parametros totales | no disponible (el checkpoint LoRA pesa 0,7 GB; el backbone base pesa ~3,9 GB) |
| Parametros activos | no disponible (es un adaptador, no un modelo MoE) |
| Longitud de contexto | no disponible (aplica a generacion de video, no a texto) |
| Tipos de cuantizacion | no disponible (se distribuye como checkpoint de pesos completos) |
| Idiomas soportados | no disponible (las instrucciones son en ingles, segun el manifest) |
| Licencia | no disponible (se mencionan terminos de MimicVideo, NVIDIA Cosmos y del checkpoint base) |
| Formato de pesos | PyTorch checkpoint (`.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) de rango 256 (`lora_r256`) diseñado para modificar el comportamiento de un modelo base de generacion de video `fused_video2world_dit`. Este backbone es un Diffusion Transformer (DiT) que ya incorpora una fusion previa de LoRAs de WidowX/Bridge, por lo que cargar el backbone original de Bridge seria incorrecto. El adaptador se entrena sobre un dataset especifico de robotica con dos camaras (`corner_cam` y `front_cam`), cuyas imagenes se apilan horizontalmente a 5 Hz. El dataset contiene 192 episodios y 54 749 frames, con 29 tareas condicionadas por instrucciones textuales. No se especifica el proceso de entrenamiento (si hubo RLHF, DPO u otras tecnicas), pero al ser un LoRA de generacion de video, se asume un entrenamiento supervisado con perdida de difusion. El checkpoint se selecciono tras verificar que la ejecucion de entrenamiento termino correctamente y que el conjunto de cuatro componentes era valido.

## Capacidades

- Generacion de video condicionada por instrucciones textuales de tareas roboticas (por ejemplo, "mover el brazo a la izquierda").
- Soporte de entrada multimodal con dos camaras simultaneas (esquina y frontal) en formato apilado horizontal.
- Adaptacion especifica al dominio de manipulacion con el brazo robotico KUKA IIWA 14 y el gripper WidowX.
- Generacion de secuencias de video a 5 Hz, adecuada para simulacion de trayectorias.
- No es un modelo de lenguaje: no genera texto ni responde a prompts conversacionales.
- No soporta tool calling ni razonamiento multi-paso en el sentido de agentes de IA; su funcion es puramente generativa visual.

## Casos de uso

- Simulacion de trayectorias roboticas: el modelo puede generar secuencias de video de un brazo KUKA IIWA 14 realizando tareas de manipulacion, util para validar politicas de control antes de desplegarlas en el robot real.
- Aumento de datos para aprendizaje por refuerzo: generar variaciones sinteticas de episodios de manipulacion para entrenar politicas de control con mas datos.
- Planificacion de movimientos en entornos simulados: usar el video generado como prediccion de los resultados de una accion propuesta, ayudando a seleccionar la mejor trayectoria.
- Evaluacion de politicas de robotica: comparar el video generado con el video real de una politica para detectar discrepancias o fallos.
- Desarrollo de modelos de mundo (world models): integrar este adaptador en un sistema de modelo de mundo para predecir estados futuros de la escena.
- Investigacion en generacion de video condicionada: estudiar como los LoRAs especializados en dominios roboticos mejoran la fidelidad visual frente a modelos genericos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de metricas como FVD (Fréchet Video Distance), PSNR, SSIM ni comparaciones con otros modelos de generacion de video en el repositorio ni en la documentacion asociada.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Dado que el backbone pesa ~3,9 GB y el LoRA 0,7 GB, se estima un minimo de 8 GB de VRAM para cargar los pesos en precision FP16, aunque la generacion de video con un DiT puede requerir mas memoria para las activaciones. Se recomienda al menos 16 GB para operar con comodidad.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o A100/H100 para produccion. En GPUs de 8 GB (como RTX 3070) podria ser posible con cuantizacion, pero no se proporcionan versiones cuantizadas.
- No se distribuyen versiones GGUF ni cuantizadas, por lo que el despliegue en CPU no es practico.
- Opciones de despliegue: el modelo requiere el codigo de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`) y el checkpoint bundle de `jonpai/mimic-video`. No es compatible directamente con vLLM, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la resolucion de video generada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400` | LoRA de video (misma serie) | 0,7 GB (estimado) | no disponible | no disponible | HuggingFace |
| `vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` | LoRA de video con decoder de acciones | no disponible | no disponible | no disponible | HuggingFace |
| Modelo base `fused_video2world_dit` | DiT fusionado | ~3,9 GB | no disponible | no disponible | Repositorio `dreamdifferent/widowx250-video-fused` |

Los tres modelos de la serie VAM-Cross son adaptadores sobre el mismo backbone base, diferenciandose en la iteracion de entrenamiento y en la configuracion de datos (por ejemplo, el `iter400` usa una sola camara, mientras que este usa dos camaras apiladas). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el backbone base exacto (revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`) antes de aplicar el LoRA. Cargar un backbone incorrecto produce resultados invalidos.
- El dataset de entrenamiento no se incluye en el repositorio; los usuarios deben cumplir con la politica de acceso del dataset y con los terminos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- No se especifica la licencia, lo que impide determinar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso en produccion.
- El modelo esta especializado en un dominio muy concreto (brazo KUKA IIWA 14 con gripper WidowX y dos camaras fijas). Su rendimiento fuera de este dominio probablemente sea pobre.
- No hay informacion sobre sesgos o alucinaciones, pero al ser un generador de video, puede producir artefactos visuales o trayectorias fisicamente imposibles si se le dan instrucciones fuera del rango de entrenamiento.
- La generacion de video es computacionalmente intensiva; no es adecuado para despliegue en tiempo real sin hardware de gama alta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter200
- Repositorio del backbone base: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Repositorio del bundle de MimicVideo: https://huggingface.co/jonpai/mimic-video
- Variante iter400: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-video-lora-iter400
- Variante con action decoder: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Descripcion del robot KUKA IIWA 14 (referencia): https://github.com/google-deepmind/mujoco_menagerie/blob/main/kuka_iiwa_14/README.md
