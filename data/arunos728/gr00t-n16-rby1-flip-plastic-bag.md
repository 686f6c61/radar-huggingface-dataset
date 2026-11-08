# arunos728/gr00t-n16-rby1-flip-plastic-bag

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo fundacional de visión-lenguaje-acción (VLA) GR00T N1.6 3B de NVIDIA, especializado en una única tarea de manipulación bimanual con el robot móvil RB-Y1: dar la vuelta a una bolsa de plástico. Lo publica el usuario `arunos728` y no NVIDIA, por lo que se trata de un checkpoint derivado de uso muy acotado, no de un modelo generalista. La relevancia es la de un ejemplo reproducible de post-entrenamiento de un VLA sobre teleoperación real: 50 episodios, 60.797 fotogramas y 30.000 pasos de entrenamiento en 2 x H100 80 GB en unas 4 horas.

El modelo hereda la arquitectura del GR00T N1.6 base: un VLA que combina un codificador visual, un backbone de lenguaje y un cabezal de acciones (action head) que predice secuencias de posiciones articulares. En este ajuste concreto el espacio de acción es de 54 dimensiones (dos brazos de 7 DoF y dos manos de 20 DoF), con un horizonte de acción de 30 pasos (1,0 s a 30 fps) y dos cámaras egocéntricas (`ego_left`, `ego_right`). El checkpoint pesa 6,6 GB y contiene 3.286.608.832 parámetros en safetensors.

Es relevante ahora porque el ecosistema GR00T de NVIDIA se ha consolidado como referencia abierta para VLA en robótica humanoide y bimanual, y este repositorio muestra el flujo completo de adaptación de un modelo fundacional a un robot y una tarea concretos con LeRobot v2.1. No obstante, sus capacidades quedan limitadas a la instrucción "Flip the plastic bag over" y al embodiment `rby1m_wujihand2`; no debe confundirse con el modelo base ni usarse como política general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) GR00T N1.6: codificador visual + backbone de lenguaje + cabezal de acciones (detalle interno no disponible) |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors en bf16) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | safetensors (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |
| Modelo base | nvidia/GR00T-N1.6-3B @ `d0814e7ecb19202e7c8468b46098b0b7ef3a6d61` |
| Embodiment | `NEW_EMBODIMENT`, robot RB-Y1 `rby1m_wujihand2` |
| Estado / accion | 54-D cada uno (posiciones articulares absolutas en radianes) |
| Horizonte de accion | 30 pasos (1,0 s a 30 fps) |
| Camaras | `ego_left`, `ego_right` |
| Tamano del repo | 6,6 GB |
| Libreria | `gr00t` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/GR00T-N1.6-3B`, un VLA de NVIDIA diseñado para habilidades robóticas generalizadas y cross-embodiment. La arquitectura concreta interna (número de capas, dimensión del backbone, mecanismo de fusión visión-lenguaje-acción) no se detalla en la información disponible; lo que sí se especifica es la interfaz de entrada y salida: dos flujos de vídeo (`ego_left`, `ego_right`), un vector de estado de 54 dimensiones, una instrucción en lenguaje natural y un vector de acción de 54 dimensiones con horizonte de 30 pasos. Las acciones son posiciones articulares absolutas comandadas, no deltas.

El entrenamiento se realizó sobre 50 episodios de teleoperación bimanual con el robot RB-Y1, totalizando 60.797 fotogramas y 100 vídeos (2 cámaras x 50 episodios) a 30 fps en formato LeRobot v2.1. La grabación original era de 66 dimensiones; se descartaron base móvil, torso y cabeza porque su rango total en todo el corpus era inferior a 1e-3 rad, mientras que la dimensión retenida más estrecha se movía dos órdenes de magnitud más. El ajuste se hizo desde el checkpoint base con batch global de 64, 30.000 pasos en bf16 y 2 x NVIDIA H100 80 GB, en aproximadamente 4 horas. La pérdida final de entrenamiento fue 0,0028 (media de los últimos 10 registros: 0,00248). No se documenta el uso de RLHF, DPO ni otras técnicas de alineación en este ajuste. El repositorio contiene solo pesos de inferencia: no incluye los shards del optimizador DeepSpeed (`global_step30000/`), estados RNG ni el scheduler de LR, por lo que no se puede reanudar el entrenamiento.

## Capacidades

- Generación de acciones de manipulación bimanual para una única instrucción: "Flip the plastic bag over".
- Control de dos brazos de 7 DoF y dos manos de 20 DoF (54 dimensiones de estado y acción).
- Percepción visual estéreo egocéntrica mediante dos cámaras (`ego_left`, `ego_right`).
- Condicionamiento por instrucción en lenguaje natural (una sola frase en el corpus de entrenamiento).
- Predicción de secuencias de acción con horizonte de 30 pasos (1,0 s a 30 fps).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni otras capacidades de los LLM generalistas.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Evaluación de políticas VLA en laboratorio: cargar el checkpoint con `Gr00tPolicy` y el `embodiment_tag=NEW_EMBODIMENT` para reproducir la tarea de dar la vuelta a una bolsa de plástico y medir la tasa de éxito en el robot RB-Y1 real.
- Referencia para post-entrenamiento de GR00T N1.6: sirve como plantilla del pipeline completo (LeRobot v2.1, 50 episodios, 30.000 pasos, 2 x H100) para adaptar el modelo base a otras tareas bimanuales.
- Estudio de reducción de dimensionalidad en teleoperación: el repositorio documenta el paso de 66-D a 54-D descartando base, torso y cabeza por rango de movimiento inferior a 1e-3 rad, un criterio reutilizable en otros corpus.
- Pruebas de integración con la librería `gr00t`: el ejemplo de `get_action` con `video.ego_left`, `video.ego_right`, estado de 54-D y `annotation.human.task_description` permite validar la interfaz de inferencia.
- Docencia e investigación en manipulación bimanual: caso acotado y reproducible para ilustrar el ajuste de un VLA fundacional a un robot específico.
- Análisis de límites de generalización: útil para estudiar cómo un VLA de 3B se comporta con una sola instrucción y una sola configuración de cámara, y para cuantificar la caída de rendimiento fuera de distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento final (0,0028; media de los últimos 10 registros: 0,00248), que no constituye una métrica de evaluación en robot real. El autor indica explícitamente que no se reportan números de evaluación en robot real.

## Requisitos de hardware

- Entrenamiento documentado: 2 x NVIDIA H100 80 GB, bf16, batch global 64, 30.000 pasos, ~4 h.
- VRAM de inferencia: no disponible de forma explícita; el repo pesa 6,6 GB en safetensors, por lo que en bf16 los pesos ocupan aproximadamente 6,6 GB y el pico real depende de las activaciones visuales y del horizonte de 30 pasos.
- GPU recomendadas: H100 o A100 para entrenamiento; para inferencia se espera que quepa en GPUs de 24 GB o más, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: probable en tarjetas de 24 GB (RTX 4090, RTX 3090) por el tamaño de pesos, pero no verificado en la documentación.
- Opciones de despliegue: librería `gr00t` con `Gr00tPolicy` y `EmbodimentTag.NEW_EMBODIMENT`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un VLA de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arunos728/gr00t-n16-rby1-flip-plastic-bag | 3.286.608.832 | no disponible | Manipulacion bimanual, una sola instruccion (RB-Y1) | NVIDIA Open Model License | Hugging Face, pesos de inferencia |
| nvidia/GR00T-N1.6-3B | no disponible (3B por nombre) | no disponible | VLA generalista cross-embodiment | NVIDIA Open Model License | Hugging Face |
| NVIDIA Isaac GR00T N1.7 | no disponible | no disponible | VLA generalista cross-embodiment | no disponible | GitHub NVIDIA/Isaac-GR00T |

La comparación directa con otros VLA de tamaño similar (por ejemplo, variantes de OpenVLA o π0) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Tarea única: entrenado solo con la instrucción "Flip the plastic bag over"; no generaliza a otros prompts.
- Embodiment único: el esquema de 54-D es específico de `rby1m_wujihand2`; no puede comandar base móvil, torso ni cabeza.
- Punto de vista fijo: ambas cámaras están montadas en configuración egocéntrica y el modelo nunca ha visto otra colocación.
- Sin evaluación en robot real: la pérdida reportada es de entrenamiento, no una métrica de éxito.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución más allá de los límites anteriores.
- Licencia NVIDIA Open Model License: conviene revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (Apache 2.0, MIT).
- Checkpoint no reanudable: no incluye shards del optimizador, estados RNG ni scheduler de LR.
- Dependencia de `statistics.json` y `experiment_cfg/` en inferencia: sin ellos el modelo no funciona correctamente.
- Riesgo de sobreajuste al corpus de 50 episodios, especialmente con 30.000 pasos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arunos728/gr00t-n16-rby1-flip-plastic-bag
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Página de investigación GR00T N1.6: https://research.nvidia.com/labs/gear/gr00t-n1_6/
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Licencia NVIDIA Open Model License: https://huggingface.co/nvidia/GR00T-N1.6-3B
