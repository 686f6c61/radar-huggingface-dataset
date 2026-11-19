# nvidia/Flora-Rewarder

## Resumen
Flora-Rewarder es un modelo de recompensa multimodal desarrollado por NVIDIA para robótica, construido mediante ajuste fino completo de Qwen3.5-27B (revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`). Toma como entrada vídeo de cámaras egocéntricas (de robot o humanas) junto con un prompt de texto que especifica la tarea de anotación, y emite texto estructurado que se parsea en puntuaciones de recompensa. Con 27.781.428.976 parámetros (2,7 x 10^10), es un VLM transformer con codificador visual nativo y decodificador de lenguaje de solo decodificación.

El modelo produce tres tipos de recompensa: recompensa de resultado (una puntuación de éxito a nivel de episodio entre 1 y 5), recompensa densa (puntuaciones de calidad de acción en pasos de 0,5 segundos dentro de ventanas de 16 segundos) y recompensa por rúbrica (traza de razonamiento seguida de una puntuación por paso de rúbrica). Flora fue el motor de datos empleado por NVIDIA para entrenar GR00T-2, y se libera para ayudar a la comunidad investigadora a escalar conjuntos de datos de robots personalizados.

Su relevancia actual radica en que cubre dos necesidades del ciclo de vida de la robótica: la monitorización de despliegues reales (recompensa de resultado) y el post-entrenamiento mediante aprendizaje por refuerzo (recompensa densa). La licencia es estrictamente no comercial y el modelo está declarado como exclusivo para investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer: VLM Qwen3.5 con codificador de visión nativamente multimodal y decodificador de lenguaje de solo decodificación |
| Parametros totales | 27.781.428.976 (2,7 x 10^10) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Prompts de resultado y densos: hasta 16.384 tokens; prompts de rúbrica: hasta 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA OneWay Noncommercial License (22 de marzo de 2022); modelo base Qwen3.5-27B bajo Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento
Flora-Rewarder-27B parte de Qwen3.5-27B y se entrena con ajuste fino completo de todos los parámetros, incluido el codificador de visión. Los fotogramas de vídeo muestreados de una o varias vistas de cámara se codifican con el codificador visual; los tokens visuales resultantes se concatenan con los tokens de texto del prompt (que especifica la tarea de anotación y, opcionalmente, la instrucción de la tarea) y se pasan al decodificador de lenguaje, que genera la anotación de forma autorregresiva como texto. La salida es texto estructurado que se parsea en una puntuación de resultado, puntuaciones densas de calidad de acción o puntuaciones por paso de rúbrica.

El diseño de entrada está especializado por tipo de recompensa. Las recompensas de resultado y densas reciben un único vídeo en el que cada instante muestreado es un mosaico de hasta cuatro vistas de cámara: las de resultado usan hasta 64 fotogramas muestreados uniformemente por episodio (unos 10 fotogramas por segundo de vídeo, con un mínimo de 2), mientras que las densas usan ventanas de 16 segundos con 64 fotogramas a 4 FPS. Los prompts de rúbrica reciben cada cámara como vídeo separado muestreado a 1 FPS, con un máximo de 82 fotogramas por cámara, cada uno redimensionado a entre 65.536 y 131.072 píxeles. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades
- Generación de recompensas de resultado: puntuación entera de episodio de 1 (fallo completo) a 5 (éxito completo), opcionalmente precedida de una justificación.
- Generación de recompensas densas: para una ventana de 16 segundos, una puntuación de calidad de acción por cada paso de 0,5 segundos (1 = fallo, 2 = subóptimo, 3 = normal), la peor puntuación de la ventana y justificaciones para los pasos no normales.
- Generación de recompensas por rúbrica: traza de razonamiento seguida de una puntuación por cada paso de la rúbrica.
- Procesamiento de vídeo multimodal: acepta una o varias vistas de cámara por episodio, con muestreo configurable por tipo de tarea.
- Procesamiento de instrucciones de tarea en texto para condicionar la anotación.
- Razonamiento textual: emite justificaciones y trazas de razonamiento junto a las puntuaciones.
- Integración con GR00T-2 como motor de datos para post-entrenamiento con RL.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso ni soporte multilingüe explícito.

## Casos de uso
- Anotación de conjuntos de datos de robots: el modelo recibe episodios de vídeo egocéntrico y devuelve recompensas de resultado o densas que etiquetan automáticamente la calidad de las demostraciones, reduciendo el coste de anotación manual en datasets de manipulación.
- Post-entrenamiento con aprendizaje por refuerzo: las recompensas densas por pasos de 0,5 segundos proporcionan señal de recompensa durante el RL de políticas robóticas, con granularidad suficiente para corregir acciones subóptimas dentro de una ventana de 16 segundos.
- Monitorización de despliegues reales: la recompensa de resultado por episodio (escala 1-5) permite detectar degradación del rendimiento de un robot en producción de investigación y activar revisiones cuando el éxito cae por debajo de un umbral.
- Evaluación de políticas con rúbricas: los prompts de rúbrica con múltiples cámaras a 1 FPS permiten puntuar criterios específicos definidos por el investigador, con traza de razonamiento auditable por paso.
- Filtrado y curación de datos: integrado en pipelines de curación, el modelo descarta episodios con puntuación baja antes de incorporarlos al entrenamiento de un modelo fundacional de robótica.
- Investigación en transferencia humano-robot: al aceptar vídeo egocéntrico humano además de robot, permite anotar demostraciones humanas para estudiar su transferencia a políticas robóticas.
- Prototipado de pipelines de monitorización: los desarrolladores pueden evaluar arquitecturas de filtrado y monitorización antes de comprometerse con infraestructura de anotación a mayor escala.

## Benchmarks y rendimiento
La model card referencia los conjuntos de evaluación RoboReward (https://huggingface.co/datasets/teetone/RoboReward) y RoboMeter (https://robometer.github.io/), pero no se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 27.781.428.976 parámetros en safetensors, los pesos en precisión de 16 bits ocuparían aproximadamente 55,6 GB; el repositorio completo ocupa 111,1 GB, lo que sugiere pesos en precisiones superiores o múltiples artefactos.
- GPU recomendadas: el modelo está optimizado para GPU NVIDIA con microarquitecturas Ampere, Blackwell, Hopper y Lovelace.
- Cabe en GPU de consumo: no confirmado; por el tamaño de parámetros, una RTX 4090 (24 GB) no albergaría los pesos sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: PyTorch con Hugging Face Transformers como motor de ejecución declarado. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. Como referencia estructural, el modelo base Qwen3.5-27B (Apache 2.0) comparte arquitectura y número de parámetros, pero es un VLM de propósito general sin entrenamiento específico de recompensa robótica, y su licencia permite uso comercial frente a la licencia no comercial de Flora-Rewarder.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Flora-Rewarder-27B | 27.781.428.976 | 16.384 tokens (32.768 en rúbrica) | Recompensa multimodal para robótica | NVIDIA OneWay Noncommercial |
| Qwen3.5-27B (base) | 27.781.428.976 | No disponible | VLM de propósito general | Apache 2.0 |
| Alternativas de reward model para robótica | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Licencia estrictamente no comercial: NVIDIA OneWay Noncommercial License (22 de marzo de 2022); el modelo no está destinado ni soportado para uso comercial o en producción.
- Uso previsto limitado a investigación y desarrollo en robótica; no debe emplearse para controlar robots directamente ni como único monitor de seguridad de un sistema físico.
- Las salidas son anotaciones, no acciones de control; cualquier uso en bucle cerrado requiere capas de seguridad adicionales.
- Riesgo de alucinación en las justificaciones y trazas de razonamiento generadas; las puntuaciones deben tratarse como señales probabilísticas, no como verdad ground truth.
- Límites de contexto por tipo de tarea: 16.384 tokens para resultado y denso, 32.768 para rúbrica; episodios más largos requieren muestreo o segmentación.
- Restricciones de muestreo: máximo de 64 fotogramas por episodio en resultado, ventanas de 16 segundos en denso y máximo de 82 fotogramas por cámara en rúbrica, lo que puede perder eventos breves.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe más allá del inglés implícito en el prompt.
- Sesgos conocidos no documentados en la información disponible.
- Solo Linux y GPU NVIDIA Ampere, Blackwell, Hopper y Lovelace; sin soporte declarado para CPU u otros aceleradores.
- La integración en sistemas de IA requiere pruebas adicionales por caso de uso según la propia model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nvidia/Flora-Rewarder
- Licencia: https://huggingface.co/nvidia/Flora-Rewarder/blob/main/LICENSE.pdf
- Licencia NVIDIA OneWay Noncommercial (22 de marzo de 2022): https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Web de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper de GR00T N1: https://arxiv.org/abs/2503.14734
- Dataset RoboReward: https://huggingface.co/datasets/teetone/RoboReward
- RoboMeter: https://robometer.github.io/
