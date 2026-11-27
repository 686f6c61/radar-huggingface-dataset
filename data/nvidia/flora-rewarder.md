# nvidia/Flora-Rewarder

## Resumen

Flora-Rewarder es un modelo de recompensa multimodal desarrollado por NVIDIA para robótica, construido mediante ajuste fino completo de Qwen/Qwen3.5-27B. Su función no es generar acciones de control, sino anotar episodios de video de robots (o de humanos en primera persona) con señales de recompensa: una puntuación de resultado a nivel de episodio (de 1 a 5) para monitorizar despliegues reales, y puntuaciones densas de calidad de acción en ventanas cortas para el post-entrenamiento con aprendizaje por refuerzo. Es el motor de datos que NVIDIA empleó para entrenar GR00T-2.

El modelo combina un codificador visual nativo con un decodificador de lenguaje de solo 27.781 millones de parámetros, y emite las recompensas como texto estructurado que se parsea a puntuaciones numéricas. Admite una o varias vistas de cámara por episodio y tres modos de anotación: recompensa de resultado, recompensa densa y recompensa por rúbrica con traza de razonamiento.

Su relevancia actual radica en que aborda un cuello de botella clásico en robótica: la escasez de señales de recompensa fiables y escalables para RL y para evaluar políticas. Con licencia Apache 2.0 y pesos abiertos, permite a investigadores anotar y filtrar sus propios conjuntos de datos de robots sin depender de etiquetado manual. NVIDIA lo restringe explícitamente a investigación y desarrollo, no a producción ni al control directo de robots.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador de visión nativo + decodificador de lenguaje (Qwen3.5 VLM) |
| Parametros totales | 27.781.428.976 (2,7 x 10^10) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens para prompts de resultado y densos; 32.768 tokens para prompts de rúbrica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Flora-Rewarder parte de Qwen3.5-27B (revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`) y se entrena con ajuste fino completo de todos los parámetros, incluido el codificador visual. Los fotogramas muestreados de una o varias cámaras se codifican con el codificador de visión; los tokens visuales resultantes se concatenan con los tokens de texto del prompt (que especifica la tarea de anotación y, opcionalmente, la instrucción de la tarea) y se pasan al decodificador, que genera la anotación de forma autorregresiva como texto. La salida se parsea a una puntuación de resultado, a puntuaciones densas de calidad de acción o a puntuaciones por paso de rúbrica.

El preprocesado de entrada está bien definido: las recompensas de resultado usan hasta 64 fotogramas muestreados uniformemente por episodio (unas 10 imágenes por segundo de vídeo, mínimo 2), con cada instante como mosaico de hasta cuatro vistas; las recompensas densas usan ventanas de 16 segundos con 64 fotogramas a 4 FPS; y los prompts de rúbrica reciben cada cámara como vídeo separado a 1 FPS, con un máximo de 82 fotogramas por cámara redimensionados entre 65.536 y 131.072 píxeles. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de recompensas de resultado a nivel de episodio: puntuación entera de 1 (fallo completo) a 5 (éxito completo), opcionalmente precedida de una justificación.
- Generación de recompensas densas: para una ventana de 16 segundos, una puntuación de calidad de acción por cada paso de 0,5 segundos (1 = fallo, 2 = subóptimo, 3 = normal), la peor puntuación de la ventana y justificaciones para los pasos no normales.
- Generación de recompensas por rúbrica: traza de razonamiento seguida de una puntuación por cada paso de la rúbrica.
- Comprensión de vídeo de robots o de humanos en primera persona (egocéntrico), con soporte de múltiples vistas de cámara por episodio.
- Procesamiento conjunto de vídeo RGB y texto (entrada imagen-texto y vídeo-texto).
- Salida en texto estructurado parseable a valores numéricos.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso ni modo de pensamiento explícito.

## Casos de uso

- Anotación de conjuntos de datos de robots con recompensas: el modelo recibe los fotogramas de un episodio y devuelve una puntuación de éxito de 1 a 5, lo que permite etiquetar automáticamente miles de episodios y filtrar demostraciones de baja calidad antes de entrenar una política.
- Post-entrenamiento con RL de políticas robóticas: las recompensas densas por pasos de 0,5 segundos proporcionan señal de recompensa intermedia durante el ajuste, algo que una recompensa solo de episodio no puede ofrecer.
- Monitorización de despliegues reales en investigación: la recompensa de resultado sirve como indicador de éxito por episodio para detectar degradación de comportamiento en robots desplegados en entornos de laboratorio.
- Evaluación comparativa de políticas: usar la recompensa por rúbrica para puntuar cada criterio de una tarea definida por el investigador (por ejemplo, agarre correcto, trayectoria, colocación final) y obtener una evaluación desglosada en lugar de una única nota global.
- Investigación en transferencia humano-robot: al aceptar vídeo egocéntrico humano además de vídeo de robot, permite anotar demostraciones humanas con el mismo criterio de recompensa y usarlas como datos de entrenamiento o de comparación.
- Curación y filtrado de pipelines de datos: integrar el modelo como etapa de puntuación en un pipeline que descarte episodios con puntuación 1 o 2 y conserve los de 4 o 5, reduciendo el coste de revisión manual.
- Investigación en "physical auto-research": utilizar las justificaciones textuales que acompañan a las puntuaciones para analizar por qué falla un episodio y guiar la recolección de nuevos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita los conjuntos RoboReward y RoboMeter como referencias de evaluación, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 27.781 millones de parámetros en precisión de 16 bits requiere aproximadamente 55,6 GB solo para los pesos, a lo que hay que sumar la caché KV de contexto largo (hasta 32.768 tokens) y los tokens visuales de vídeo, que son numerosos (hasta 64 fotogramas por episodio o 82 por cámara en modo rúbrica).
- GPU recomendadas: NVIDIA Ampere, Blackwell, Hopper y Lovelace según la model card; para un modelo de este tamaño y con entradas de vídeo densas, son adecuadas GPU de centro de datos como A100 o H100, y en la gama profesional las RTX de arquitectura Lovelace o Blackwell con suficiente memoria.
- ¿Cabe en GPU de consumo? No se confirma en la información disponible; el tamaño de pesos en FP16 y la carga visual hacen improbable un despliegue cómodo en GPU de consumo con menos de 48 GB de VRAM.
- Opciones de despliegue: PyTorch con Hugging Face Transformers es el motor indicado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.
- Sistema operativo soportado: Linux.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de recompensa para robótica. La comparación con el modelo base sí es posible en parámetros y licencia:

| Modelo | Parametros | Contexto | Funcion | Licencia |
|---|---|---|---|---|
| nvidia/Flora-Rewarder | 27,78 mil millones | 16.384 / 32.768 tokens | Recompensa multimodal para robótica | Apache 2.0 |
| Qwen/Qwen3.5-27B (base) | 27 mil millones (aprox.) | no disponible | VLM generativo general | Apache 2.0 |
| Otros modelos de recompensa para robótica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación y desarrollo; NVIDIA indica explícitamente que no está pensado ni soportado para producción.
- No debe usarse para controlar robots directamente ni como único monitor de seguridad de un sistema físico; sus salidas son anotaciones.
- Riesgo de alucinación inherente a un modelo generativo: las justificaciones textuales y las puntuaciones pueden no reflejar fielmente el contenido del vídeo, por lo que conviene validarlas contra datos etiquetados manualmente.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre vídeo de robots y egocéntrico humano, puede generalizar peor en dominios visuales alejados de ese tipo de grabación.
- Limitaciones de contexto e idioma: la ventana es de 16.384 tokens para resultado y denso y 32.768 para rúbrica, con límites estrictos de fotogramas y resolución por cámara; no se especifican los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card restringe el uso previsto a investigación; además, el usuario es responsable de cumplir la legislación aplicable.
- Requiere preprocesado específico (muestreo de fotogramas, mosaicos de vistas, redimensionado a un rango de píxeles) para obtener resultados válidos; usos fuera de ese formato pueden degradar la calidad de las puntuaciones.
- Dependencia de hardware NVIDIA y de Linux según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Flora-Rewarder
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Web de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper de GR00T N1: https://arxiv.org/abs/2503.14734
- Dataset RoboReward: https://huggingface.co/datasets/teetone/RoboReward
- RoboMeter: https://robometer.github.io/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
