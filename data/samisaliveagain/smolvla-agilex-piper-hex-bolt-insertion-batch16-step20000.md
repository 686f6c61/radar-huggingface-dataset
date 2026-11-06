# Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch16-step20000

## Resumen

SmolVLA es una política de visión-lenguaje-acción (VLA) para robótica, desarrollada originalmente por Hugging Face, y este repositorio concreto es un checkpoint afinado por el usuario Samisaliveagain para una tarea de inserción de tornillo hexagonal con un brazo robótico AgileX Piper. El modelo resuelve el problema de traducir observaciones visuales y el estado de las articulaciones en comandos de control de bajo nivel, aprendidos por imitación a partir de 100 demostraciones teleoperadas. Es relevante porque demuestra el ciclo completo de entrenamiento y publicación de políticas VLA de código abierto sobre hardware asequible, con trazabilidad explícita del paso de entrenamiento y de los hashes de los pesos.

El checkpoint corresponde al paso 20.000 de optimización con un tamaño de lote de 16, entrenado sobre el dataset `piper-hexagonal-bolt-insertion-100-demos-v1`. La política recibe siete valores de articulación y pinza junto con dos cámaras RGB (cenital y angulada) y emite siete objetivos absolutos para el seguidor, con un horizonte de 50 acciones por chunk. El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors dentro de la librería LeRobot.

Se trata de un artefacto de investigación y reproducción, no de un modelo de propósito general: su ámbito es una única tarea física, un único robot y un único montaje de cámaras. La model card no asigna licencia nueva y no aporta evidencia de tasa de éxito física, por lo que debe tratarse como material de partida para experimentación en manipulación fina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (política visión-lenguaje-acción sobre transformer, según la implementación de LeRobot) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción: chunk de 50 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | no disponible (la model card indica que la subida no asigna licencia nueva) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, pre/postprocesadores y tensores de normalización |
| Robot | AgileX Piper (seguidor) |
| Tarea | Recoger el tornillo hexagonal y colocarlo en la abertura correspondiente |
| Entradas | 7 valores de articulación/pinza + cámara RGB cenital + cámara RGB angulada |
| Salidas | 7 objetivos absolutos del seguidor (articulaciones en grados, pinza en milímetros) |
| Paso de entrenamiento | 20.000 actualizaciones del optimizador |
| Tamaño de lote | 16 |
| Dataset | `Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1` (revisión `1ec623d8…`) |
| SHA-256 de pesos | `ba38292355d02efe45402b13da4d68e04e83605ff07d514a4f307cf51f2d14aa` |
| Tamaño del repositorio | 1,2 GB |
| Librería | lerobot |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA de LeRobot: una política de imitación que combina un codificador visual y un codificador de estado proprioceptivo con un transformer generador de acciones, condicionado además por una instrucción en lenguaje natural. La salida se emite como chunks de 50 acciones, un esquema de acción-chunking que reduce el coste de inferencia y mejora la estabilidad temporal frente a políticas que predicen una sola acción por paso. El checkpoint conserva la configuración original del modelo y los ficheros de preprocesado y postprocesado con sus tensores de normalización, que deben usarse para preparar observaciones e interpretar acciones.

El entrenamiento es de imitación supervisada sobre 100 demostraciones teleoperadas del brazo AgileX Piper, con 20.000 actualizaciones de optimizador, lote de 16 y un único proceso. La model card documenta la procedencia del paso a partir de `training_state/training_step.json` y verifica los hashes SHA-256 de los siete ficheros de política y procesadores; también aclara que el campo `pretrained_path` (terminado en `000050/pretrained_model`) refleja el origen de inicialización o reanudación y no el paso guardado. Los estados de optimizador, scheduler y RNG no se incluyen en esta exportación de inferencia, por lo que el checkpoint no es reanudable tal cual. No se documentan fases de RLHF, DPO ni ajuste por preferencias, ni el volumen total de tokens o frames consumidos.

## Capacidades

- Control robótico de manipulación fina: inserción de un tornillo hexagonal en su abertura, a partir de observaciones visuales y propioceptivas.
- Política de imitación multi-cámara: fusiona una vista cenital y una vista angulada con el estado de las siete articulaciones y la pinza.
- Predicción de chunks de acción: emite 50 acciones por inferencia, con articulaciones en grados y pinza en milímetros.
- Condicionamiento por instrucción en lenguaje natural, heredado del diseño SmolVLA (la model card no documenta el conjunto de instrucciones usado).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni generación de texto: es exclusivamente una política de control motor.
- Capacidades multilingües: no aplicables; no se documenta ningún soporte idiomático.

## Casos de uso

- Reproducción de experimentos de imitación en manipulación fina: cargar el checkpoint con `SmolVLAPolicy.from_pretrained` y evaluar la política sobre el mismo montaje de cámaras y el mismo brazo Piper, sirviendo como línea base reproducible para comparar variantes de entrenamiento.
- Estudio de acción-chunking en robótica: el horizonte de 50 acciones permite analizar el compromiso entre frecuencia de inferencia y suavidad de la trayectoria en tareas de inserción con tolerancias estrechas.
- Punto de partida para ajuste fino con nuevos datos: al conservar la configuración y los procesadores originales, el checkpoint puede inicializar entrenamientos sobre datasets ampliados, como el conjunto de 80 demostraciones zero-home que el autor menciona pero no usó aquí.
- Docencia y formación en VLA: sirve para ilustrar el pipeline completo de LeRobot (dataset, entrenamiento, exportación de inferencia, normalización de observaciones) con un caso concreto y verificable.
- Auditoría de procedencia de modelos: los ficheros `model_identity.json`, `checkpoint_info.json`, `publication_manifest.json` y `training_step.json` permiten practicar la verificación de hashes y de pasos de entrenamiento en artefactos publicados.
- Integración en bancos de pruebas de simulación o gemelos digitales del Piper: validar la política en un entorno simulado antes de cualquier prueba física, dado que la model card no aporta evidencia de éxito real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la publicación no establece éxito físico de inserción ni robustez, y no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 millones de parámetros en safetensors, los pesos ocupan aproximadamente 1,7 GB en fp32 y unos 0,9 GB en fp16; a ello hay que sumar el codificador visual, los tensores de normalización y las activaciones, por lo que se recomienda un margen adicional.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría esperar ejecución en GPUs de consumo con al menos 8 GB de VRAM, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, pero no verificado en la información disponible.
- Opciones de despliegue: la vía documentada es LeRobot (`lerobot.policies.smolvla.modeling_smolvla.SmolVLAPolicy`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política de control motor.
- Latencia y throughput: no disponibles. El chunk de 50 acciones reduce la frecuencia de inferencia necesaria, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (SmolVLA, Piper, inserción de tornillo) | 450.046.176 | Chunk de 50 acciones | Inserción de tornillo hexagonal con AgileX Piper | no disponible | Hugging Face, 16 descargas |
| SmolVLA base (Hugging Face) | no disponible en la información proporcionada | no disponible | Política VLA generalista preentrenada | no disponible en la información proporcionada | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en la información proporcionada | no disponible | Manipulación por imitación | no disponible en la información proporcionada | Hugging Face / LeRobot |

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Ámbito restringido: entrenado para una única tarea (inserción de tornillo hexagonal), un único robot (AgileX Piper) y un montaje de cámaras concreto; no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Sin evidencia de éxito físico: la model card declara explícitamente que la publicación no establece éxito de inserción ni robustez; solo verifica el paso de entrenamiento y la integridad de los ficheros.
- Dependencia del montaje: deben respetarse la configuración de cámaras registrada, las unidades (grados y milímetros), el bloqueo de la articulación 4 y los límites del robot.
- Dataset limitado: 100 demostraciones teleoperadas de un solo operador y entorno; riesgo alto de sobreajuste y de baja variabilidad ante cambios de iluminación, posición inicial u objetos.
- Licencia no disponible: la subida no asigna licencia nueva, por lo que el uso comercial queda sin marco legal claro hasta que el autor lo defina.
- No reanudable: el export de inferencia no incluye estados de optimizador, scheduler ni RNG.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política de imitación, puede generar trayectorias fuera de distribución sin señal de incertidumbre.
- Idiomas y sesgos: no aplicables ni documentados; no hay información sobre sesgos demográficos o de otro tipo.
- Madurez: 16 descargas y 0 likes en el momento de la consulta; sin validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch16-step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Demos o espacio de inferencia: no disponible en la información proporcionada
