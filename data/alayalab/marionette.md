# AlayaLab/Marionette

## Resumen

Marionette es un world model interactivo para juegos desarrollado por AlayaLab, un laboratorio especializado en inteligencia artificial aplicada a videojuegos. El modelo factoriza el modelado de un mundo de juego en tres etapas: una etapa de dinámica que predice estados articulados explícitos (posición, rotación y configuración de personajes), un puente determinista de cero parámetros que convierte esos estados en geometría, y una etapa de observación que sintetiza el vídeo RGB final. Esta separación permite que la red neuronal se centre en la apariencia mientras que la geometría se calcula de forma exacta y sin aprendizaje.

El checkpoint publicado incluye los pesos de la etapa de observación, un diffusion transformer de vídeo fine-tuneado a partir de Wan2.2-Fun-5B-Control de Alibaba, y los pesos de la etapa de dinámica (ActionGPT y PoseGPT). El modelo está diseñado para generar rollouts de vídeo controlados por pose a partir de una semilla y una acción, con una resolución de 704×1280 a 30 fps. Los pesos están restringidos a uso no comercial e investigación, y el repositorio no incluye el modelo base de terceros, que debe descargarse por separado.

Marionette es relevante porque propone un enfoque alternativo a los world models basados únicamente en píxeles: al modelar el estado del mundo de forma explícita y delegar la geometría a un renderizador fijo, consigue una mayor consistencia a largo plazo y un control más preciso sobre la dinámica. El proyecto incluye un paper en arXiv (2608.14530) y código en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres etapas: dinámica (ActionGPT + PoseGPT, autoregresivos), puente (renderizador determinista de cero parámetros), observación (diffusion transformer de vídeo, fine-tune de Wan2.2-Fun-5B-Control) |
| Parametros totales | No disponible (el observation pesa 10.0 GB, PoseGPT 402 MB, ActionGPT 61 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los chunks de rollout son de 81 frames, pero no se especifica contexto de tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors y .pt, sin cuantización publicada) |
| Idiomas soportados | No disponibles (el texto de captura usa inglés, pero no se especifica soporte multilingüe) |
| Licencia | marionette-research-only (uso no comercial, restricción heredada del corpus WildWorld) |
| Formato de pesos | safetensors (observation) y .pt (dynamics) |

## Arquitectura y entrenamiento

Marionette se compone de tres etapas conectadas en serie. La primera, la dinámica, consta de dos modelos autoregresivos: ActionGPT (61 MB) predice el siguiente token de acción y PoseGPT (402 MB) predice el siguiente estado articulado (276 dimensiones) a partir del estado actual, la acción y un campo de altura de terreno escaneado. Esta etapa opera a 20 fps y fue entrenada sobre 2241 segmentos de una única especie de monstruo (em19). Los vocabularios de acción contienen 168 tokens para el monstruo y 977 para el cazador, y son específicos de este checkpoint: los índices enteros no son portables entre checkpoints entrenados con corpus distintos.

La segunda etapa es un puente de cero parámetros que convierte el estado articulado de 276 dimensiones en geometría de vídeo con control de pose. Es determinista y no tiene pesos entrenables. La tercera etapa, la observación, es un diffusion transformer de vídeo fine-tuneado a partir de Wan2.2-Fun-5B-Control de Alibaba en modo `control_ref`, usando el primer frame como referencia de apariencia. El fine-tune se realizó a 704×1280 con 16 GPU H200 en FSDP, y el checkpoint publicado corresponde al paso 17000. Los últimos 2000 pasos se entrenaron sobre un corpus con una ruta de captura revisada en la que los objetos ausentes de la señal de control de pose también están ausentes del RGB, lo que elimina una clase de objetivos imposibles de predecir.

El texto de captura utilizado durante el entrenamiento incluye un identificador de apariencia explícito (p. ej., "stage 101, hunter appearance id 9 wielding weapon type 4, fighting monster id 19"), por lo que el checkpoint es sensible al formato de prompt: emparejar este checkpoint con un formato de captura antiguo degrada gravemente el resultado, llegando a eliminar monstruos del rollout.

## Capacidades

- Generación de vídeo controlada por pose: dado un frame inicial y una secuencia de acciones, genera un rollout de vídeo coherente con la geometría y la apariencia del mundo.
- World modeling interactivo: el modelo predice estados del mundo explícitos (posición, articulaciones) en lugar de solo píxeles, lo que permite intervenciones y control a nivel de estado.
- Síntesis de apariencia: el diffusion transformer pinta la textura y la iluminación sobre la geometría renderizada por el puente.
- Control de cámara y de personaje: la dinámica acepta acciones discretas (ataque, movimiento, etc.) y genera la correspondiente evolución del estado.
- Reproducibilidad con semilla fija: la etapa de dinámica es muestreada, pero con `TORCH_SEED=43` el repositorio reproduce el pose video byte a byte y el rollout RGB píxel a píxel.
- Sin capacidades de texto general, tool calling, razonamiento o multilingüismo: es un modelo especializado en vídeo de juegos.

## Casos de uso

- Prototipado rápido de mecánicas de juego: un diseñador puede generar vídeos de gameplay controlados por acciones para evaluar visualmente una mecánica antes de implementarla en un motor, usando Marionette como simulador de apariencia.
- Generación de datos de entrenamiento para agentes de juego: los rollouts generados pueden servir como datos sintéticos para entrenar políticas de IA en entornos de juego, aprovechando la consistencia del estado articulado.
- Investigación en world models: el enfoque de factorización en estado-geometría-apariencia permite estudiar la separación entre dinámica y renderizado, y comparar con modelos que predicen píxeles directamente.
- Validación de controladores de personajes: dado un controlador que emite acciones, Marionette puede visualizar el resultado en vídeo sin necesidad de un motor de juego completo, útil para depurar comportamientos de IA.
- Demostraciones y material educativo: el pipeline puede generar vídeos de ejemplo de interacciones monstruo-cazador para documentar comportamientos o crear contenido de muestra.
- Simulación de entornos para pruebas de visión por computador: los rollouts con control de pose proporcionan secuencias etiquetadas con estados articulados, útiles para entrenar modelos de estimación de pose o seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no reporta métricas cuantitativas como FVD, IS o comparaciones con otros world models en la model card ni en los resultados de búsqueda. La evaluación se limita a demostraciones cualitativas y a la verificación de reproducibilidad byte a byte con semilla fija.

## Requisitos de hardware

- El observation diffusion transformer tiene 10.0 GB de pesos en safetensors; el modelo base Wan2.2-Fun-5B-Control (que incluye VAE y text encoder umT5-xxl) ocupa aproximadamente 23 GB adicionales y debe descargarse por separado.
- Para inferencia en fp16 se estima un consumo de VRAM de al menos 25-35 GB solo para el observation, más la memoria del VAE y el text encoder. No se han publicado requisitos oficiales.
- Se recomienda una GPU con al menos 40 GB de VRAM (A100 40GB, H100 80GB) para ejecutar el pipeline completo a 704×1280. En GPUs de consumo (RTX 4090 con 24 GB) podría ser posible con cuantización o reducción de resolución, pero no está documentado.
- El repositorio proporciona scripts de inferencia (`run_demo.sh`) y soporta despliegue local. No se mencionan integraciones con vLLM, Ollama o TGI; al ser un diffusion transformer de vídeo, el despliegue es específico del pipeline.
- La etapa de dinámica (ActionGPT y PoseGPT) es ligera (463 MB en total) y puede ejecutarse en CPU o GPU de baja capacidad.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marionette (AlayaLab) | World model factorizado (dinámica + geometría + apariencia) | No disponible (observation 10 GB, dynamics 463 MB) | No disponible | No comercial (research-only) | Pesos en HF, código en GitHub |
| Genie (DeepMind) | World model generativo de vídeo | 11B (reportado) | No disponible | No publicada | No disponible públicamente |
| Wan2.2-Fun-5B-Control (Alibaba) | Diffusion transformer de vídeo con control de pose | 5B | No disponible | Apache-2.0 | Disponible en HF |

Marionette se diferencia de Genie y Wan2.2 en que no predice píxeles directamente, sino que modela el estado del mundo de forma explícita y delega la geometría a un renderizador fijo. Esto le da un control más preciso sobre la dinámica, pero lo limita a un dominio muy específico (una especie de monstruo, un stage concreto). Wan2.2-Fun es su base para la etapa de observación, por lo que comparte arquitectura de difusión, pero Marionette añade la factorización de estado.

## Limitaciones y advertencias

- Los pesos están restringidos a uso no comercial e investigación (licencia marionette-research-only), heredada del corpus WildWorld. No se pueden usar en productos comerciales.
- El modelo de dinámica cubre una única especie de monstruo (em19) y un stage concreto. No es un modelo general de movimiento de personajes.
- El rollout usa chunk-relay: cada chunk de 81 frames se condiciona al último frame del anterior, por lo que el error de apariencia se acumula con el horizonte temporal.
- El puente requiere un campo de altura de terreno escaneado para cada stage. Geometría nueva necesita un nuevo escaneo.
- Los identificadores de acción y apariencia son específicos de este checkpoint; no son portables a otros modelos o corpus.
- El modelo es sensible al formato de prompt: usar un formato de captura antiguo degrada gravemente el resultado (los monstruos desaparecen del rollout).
- Es un artefacto de investigación, no un producto ni un renderizador general.
- No se han publicado benchmarks cuantitativos ni análisis de sesgos o alucinaciones.

## Enlaces

- HuggingFace: https://huggingface.co/AlayaLab/Marionette
- GitHub (código, scripts, galería): https://github.com/AlayaLab/Marionette
- Paper arXiv: https://arxiv.org/abs/2608.14530
- Página del proyecto: https://alayalab.github.io/Marionette/
- Vídeo de visión general: https://youtu.be/bLLtwXVcqEc
- Web de Alaya Lab: https://alayalab.ai/
- Repositorio AlayaWorld (proyecto relacionado): https://github.com/AlayaLab/AlayaWorld
