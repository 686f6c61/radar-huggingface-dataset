# Godwinlyamba/A-l3cA

## Resumen

A-l3cA es un fine-tune de política robótica (policy) desarrollado por Godwinlyamba a partir del modelo base domFree/attune-j4, orientado al lane "Attune Vector" de nivel 3 dentro del ecosistema Robotensor. No se trata de un modelo de lenguaje conversacional, sino de un modelo multimodal de acción para control robótico: combina codificadores de visión CLIP con un decodificador transformer y una U-Net de difusión que genera trayectorias de acción condicionadas por observaciones visuales, propiocepción y prompts. El checkpoint contiene 780.979.360 parámetros en formato safetensors (753 tensores, layout vector_v1.1), con un repositorio de 3,1 GB.

El modelo se entrena sobre demostraciones expertas del harness RoboTwin-Vector con un brazo franka-panda, y su adaptación es deliberadamente conservadora: solo se ajustan el decodificador transformer, la U-Net de difusión y los embeddings de posición/sink, manteniendo congelados los codificadores de visión, los normalizadores de acción y propiocepción y las capas de prompt-pool. La relevancia actual reside en que ejemplifica el patrón de fine-tuning selectivo sobre políticas preentrenadas para tareas de manipulación, priorizando las cuatro tareas más débiles del modelo padre sin degradar las doce restantes mediante un anclaje en espacio de funciones.

La información pública disponible es muy limitada: la model card no declara licencia, idiomas ni pipeline, y no se han publicado benchmarks ni métricas de éxito en la información proporcionada. Cualquier evaluación de rendimiento real requeriría ejecutar el modelo en el entorno RoboTwin-Vector correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal de política robótica: codificadores de visión CLIP + decodificador transformer + U-Net de difusión (predicción de epsilon) |
| Parametros totales | 780.979.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica, no de lenguaje) |
| Licencia | no disponible (el repositorio padre no declara licencia) |
| Formato de pesos | safetensors (model.safetensors, sha256 fa7bb3bdc2c255ca548b4d4c9d1ebee988f0430b52293c9456e85ac94dd23137) |

## Arquitectura y entrenamiento

La arquitectura es un sistema híbrido de política visuomotora: codificadores de visión CLIP procesan las observaciones, capas de propiocepción y prompt-pool integran el estado del robot y las instrucciones, un decodificador transformer modela la secuencia, y una U-Net de difusión genera las acciones mediante predicción de epsilon. El checkpoint conserva el layout vector_v1.1 de 753 tensores del modelo padre; los codificadores CLIP, los normalizadores de acción y propiocepción y las capas de propiocepción y prompt-pool permanecen sin cambios respecto al padre.

El entrenamiento consistió en 10.000 pasos con batch de 64, learning rate 1e-5 con schedule coseno, EMA de 0,999 y pérdida de difusión con predicción de epsilon. La estrategia de datos es de adaptación selectiva: aproximadamente el 55% de las muestras de imitación provienen de las cuatro tareas más débiles del padre (beat_block_hammer, place_mouse_pad, place_dual_shoes, move_stapler_pad), y se añade un anclaje en espacio de funciones al padre congelado sobre las otras doce tareas con peso 2. Las demostraciones expertas de nivel 3 se generaron con el harness RoboTwin-Vector (franka-panda, semillas públicas por debajo de 2.000.000), y cada tarea objetivo se condicionó con una demostración experta de una escena distinta de la misma tarea.

## Capacidades

- Generación de acciones robóticas de manipulación condicionadas por observaciones visuales, propiocepción y prompts de tarea.
- Control visuomotor para un brazo franka-panda en el entorno RoboTwin-Vector.
- Mejora específica en cuatro tareas de manipulación: beat_block_hammer, place_mouse_pad, place_dual_shoes y move_stapler_pad.
- Preservación del comportamiento del modelo padre en las doce tareas restantes mediante anclaje en espacio de funciones.
- Generalización entre escenas: el condicionamiento con demostraciones de escenas distintas de la misma tarea busca robustez ante variaciones de entorno.
- No soporta tool calling, function calling, agentes conversacionales ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles (no aplica a un modelo de acción).

## Casos de uso

- Manipulación de bloques con martillo (beat_block_hammer): el modelo ejecuta la política entrenada para golpear bloques en el simulador RoboTwin-Vector, aprovechando las demostraciones expertas específicas de esta tarea incluidas en el 55% del dataset de adaptación.
- Colocación de objetos sobre superficies (place_mouse_pad, place_dual_shoes): adecuado para tareas de pick-and-place donde se requiere precisión de posicionamiento, al haber sido reforzado con demostraciones de las tareas más débiles del padre.
- Reubicación de objetos rígidos (move_stapler_pad): útil en pipelines de evaluación de políticas de manipulación que necesitan un checkpoint con rendimiento equilibrado en tareas de traslado.
- Evaluación comparativa de fine-tunes: sirve como referencia para estudiar el efecto del fine-tuning selectivo con anclaje en espacio de funciones frente al modelo padre attune-j4 en las dieciséis tareas del benchmark.
- Investigación en adaptación de políticas preentrenadas: el diseño de congelar codificadores CLIP y normalizadores permite analizar qué componentes concentran la adaptación al dominio y cuáles conviene preservar.
- Generación de datos sintéticos de trayectorias: las acciones generadas por difusión pueden usarse para aumentar datasets de imitación en las tareas objetivo, siempre que se valide la calidad de las trayectorias.
- Despliegue en simulación para pruebas de robustez: al condicionarse con demostraciones de escenas distintas, permite evaluar la sensibilidad a cambios de escena antes de transferir a un robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas con el modelo padre u otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 780,9 millones de parámetros, una estimación orientativa en fp16 sería de aproximadamente 1,6 GB solo para pesos, más el coste de los codificadores CLIP y de los buffers de difusión; en fp32 ascendería a unos 3,1 GB de pesos.
- GPU recomendadas: no disponible. Por tamaño, el modelo es compatible con GPUs de consumo actuales, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: probablemente sí por volumen de parámetros, aunque no hay confirmación oficial ni requisitos de memoria del harness RoboTwin-Vector.
- Opciones de despliegue: no disponible. El modelo requiere el entorno RoboTwin-Vector (franka-panda) para su ejecución; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| A-l3cA (este modelo) | 780.979.360 | no disponible | no disponible | no disponible | HuggingFace, safetensors |
| domFree/attune-j4 (padre) | no disponible | no disponible | no disponible | no disponible | HuggingFace, revisión 4a2651b08cb70332bfe9b86ef9b2efaff1825eb8 |
| Otras políticas RoboTwin-Vector | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo padre attune-j4, del que hereda el layout de 753 tensores y sobre el que aplica una adaptación selectiva en cuatro tareas. No se dispone de datos de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- La model card no declara licencia y el repositorio padre tampoco; el autor indica explícitamente que no reclama nada más allá de lo que permitan los términos del padre. El uso comercial queda en un limbo legal que debe resolverse antes de cualquier despliegue en producción.
- El modelo está especializado en un brazo franka-panda y en el harness RoboTwin-Vector; no es transferible sin validación a otras plataformas robóticas ni a otros simuladores.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-turno, y no tiene capacidades multilingües.
- Sesgos conocidos: no disponible. No se documenta el sesgo de las demostraciones expertas ni la distribución de escenas del dataset.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento, especialmente en las doce tareas no reforzadas.
- Limitaciones de contexto: no disponible; la ventana de observación y el horizonte de acción no se especifican.
- La adaptación prioriza cuatro tareas concretas; el rendimiento en tareas fuera de ese conjunto depende del anclaje al padre y no está verificado con métricas públicas.
- Solo se han publicado 10.000 pasos de entrenamiento con batch 64; no se documenta validación, ablación ni criterios de parada.
- El SHA-256 del archivo de pesos está declarado, pero no se ofrece firma ni verificación independiente del linaje del fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Godwinlyamba/A-l3cA
- Modelo padre: https://huggingface.co/domFree/attune-j4
- Revisión del padre usada: https://huggingface.co/domFree/attune-j4/tree/4a2651b08cb70332bfe9b86ef9b2efaff1825eb8
- Harness RoboTwin-Vector: no disponible (no se proporciona enlace en la información)
- Paper, blog o demo: no disponible
