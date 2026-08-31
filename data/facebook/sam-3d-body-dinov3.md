# facebook/sam-3d-body-dinov3

## Resumen

SAM 3D Body (3DB) es un modelo promptable para la recuperación de malla 3D completa del cuerpo humano a partir de una sola imagen. Desarrollado por Meta (Facebook), estima la pose del cuerpo, los pies y las manos utilizando el Momentum Human Rig (MHR), una representación paramétrica de malla que desacopla la estructura esquelética de la forma superficial. El modelo se basa en una arquitectura encoder-decoder con DINOv3 como extractor de características visuales, lo que le permite generalizar bien en condiciones del mundo real con iluminación variable, oclusiones y posturas complejas.

La relevancia de este modelo radica en su capacidad para aceptar prompts auxiliares (como puntos clave o cajas delimitadoras), lo que permite guiar la recuperación de la malla de forma interactiva. Esto lo diferencia de enfoques anteriores que operan de forma totalmente automática y sin control por parte del usuario. Con un tamaño de repositorio de 2,8 GB, el modelo está disponible en Hugging Face bajo una licencia restringida (SAM License) y requiere aceptar condiciones de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con backbone DINOv3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | SAM License (Meta, restringida) |
| Formato de pesos | no disponible (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder donde el encoder visual (DINOv3) extrae características de la imagen de entrada y el decoder predice los parametros del Momentum Human Rig (MHR). MHR es una representacion de malla que separa la forma del cuerpo (superficie) de la estructura esqueletica (huesos), lo que facilita el ajuste a variaciones antropometricas y posturales. El modelo es promptable: ademas de la imagen, acepta prompts como puntos 2D o cajas delimitadoras para guiar la estimacion de la pose.

No se dispone de informacion publica detallada sobre el conjunto de entrenamiento, el numero de tokens (en este caso, imagenes) ni el uso de tecnicas como RLHF o DPO. Segun la documentacion del repositorio, el modelo demuestra un rendimiento de ultima generacion con fuerte generalizacion en condiciones diversas, pero los detalles especificos de entrenamiento no estan publicados en la informacion disponible.

## Capacidades

- Estimacion de pose 3D completa del cuerpo humano: cuerpo, pies y manos a partir de una sola imagen.
- Soporte de prompts auxiliares: puntos clave 2D, cajas delimitadoras y posiblemente otros tipos de prompts para guiar la recuperacion de la malla.
- Generacion de malla parametrica basada en Momentum Human Rig (MHR), que permite aplicar la malla a aplicaciones de animacion o analisis biomecanico.
- Generalizacion a condiciones del mundo real: iluminacion variable, oclusiones parciales y posturas no convencionales.
- No es un modelo de texto ni multimodal en el sentido tradicional; es un modelo de vision especifico para tareas de HMR.

## Casos de uso

- Animacion y efectos visuales: los estudios pueden usar el modelo para capturar el movimiento de actores a partir de fotogramas individuales y transferirlo a personajes digitales, reduciendo la necesidad de trajes de captura de movimiento.
- Realidad aumentada y virtual: en aplicaciones de prueba de ropa virtual o avatares personalizados, el modelo permite generar una malla 3D del usuario a partir de una foto, mejorando la precision del ajuste.
- Analisis deportivo: entrenadores y analistas pueden extraer metricas de postura y movimiento de imagenes de atletas para corregir tecnicas o prevenir lesiones.
- Salud y fisioterapia: evaluacion de la postura corporal de pacientes a partir de fotografias, facilitando el seguimiento de progresos en rehabilitacion.
- Robotics y interaccion humano-robot: el modelo puede proporcionar informacion de pose 3D para que robots comprendan la posicion y orientacion de personas en su entorno.
- Investigacion en ciencias del deporte y biomecanica: los investigadores pueden utilizar las mallas generadas para estudios de cinematica y dinamica corporal sin necesidad de equipamiento especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del repositorio menciona un rendimiento de ultima generacion y una fuerte generalizacion, pero no se proporcionan metricas concretas (como MPJPE o PA-MPJPE) ni comparaciones con otros modelos en la informacion recopilada.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño del repositorio (2,8 GB), se estima que el modelo puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM, aunque no se confirma.
- GPU recomendadas: no disponible. Se recomienda probar en GPUs como RTX 3060 o superiores para inferencia.
- Compatibilidad con consumer GPU: probablemente si, debido al tamaño moderado, pero no se garantiza sin pruebas.
- Opciones de despliegue: no se mencionan herramientas especificas. Al ser un modelo de vision, se puede integrar via PyTorch o TensorFlow, y potencialmente con ONNX Runtime para optimizacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAM 3D Body (3DB) | Promptable, MHR, DINOv3 | ~2,8 GB (repo) | SAM License (restringida) | Gated en Hugging Face |
| PyMAF | Ajuste de malla con retroalimentacion | no disponible | MIT (probable) | Abierto |
| CLIFF | Aprovechamiento de coordenadas de imagen | no disponible | no disponible | no disponible |

La comparativa es limitada porque no se dispone de datos publicos de rendimiento para SAM 3D Body. Modelos como PyMAF y CLIFF son alternativas clasicas en HMR, pero no comparten la capacidad promptable ni el uso de MHR. Se recomienda consultar la documentacion oficial para una comparativa detallada.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar la licencia SAM en Hugging Face, lo que limita su uso comercial sin revision de los terminos.
- Sesgos potenciales: como todo modelo de vision entrenado con datos web, puede presentar sesgos en cuanto a diversidad corporal, etnia o vestimenta, aunque no se han publicado estudios especificos.
- Riesgo de alucinacion geometrica: en imagenes con oclusiones severas o posturas extremas, el modelo puede generar mallas anatomicamente improbables.
- Idioma: la documentacion y las etiquetas estan en ingles; no hay soporte multilingue en la interfaz.
- Sin informacion sobre cuantizacion: no se ofrecen versiones cuantizadas, lo que puede limitar su despliegue en dispositivos con poca memoria.
- Formato de pesos no especificado: aunque se asume safetensors, no se confirma, lo que puede afectar a la integracion en pipelines existentes.

## Enlaces

- Hugging Face: https://huggingface.co/facebook/sam-3d-body-dinov3
- Repositorio GitHub: https://github.com/facebookresearch/sam-3d-body
- Resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/sam-3d-body-dinov3-facebook
- Informacion en aitimelines.club: https://www.aitimelines.club/models/facebook%2Fsam-3d-body-dinov3
