# satoshi3/attune-l3cA

## Resumen

Attune Vector Level 3 policy (vector_v1.1) es un ajuste fino (fine-tune) del modelo domFree/attune-j4, desarrollado por el usuario satoshi3 para el denominado Robotensor Attune Vector lane, en su nivel 3. Se trata de una política de imitación para robótica manipulativa que combina un codificador de visión CLIP, un decodificador transformer y una U-Net de difusión, siguiendo un esquema de difusión para la generación de acciones (epsilon-prediction). El modelo cuenta con 780.979.360 parámetros totales y un repositorio de 3,1 GB en formato safetensors.

El modelo resuelve el problema de la adaptación conservadora de una política robótica preentrenada a un subconjunto de tareas especialmente débiles, sin degradar el rendimiento en el resto. Para ello, el autor entrenó únicamente el decodificador transformer, la U-Net de difusión y los embeddings de posición y sink, manteniendo congelados los codificadores de visión CLIP, los normalizadores de acción y propiocepción, y las capas de propiocepción y prompt-pool del modelo padre.

Su relevancia es acotada pero concreta: se publica como un artefacto de investigación reproducible dentro de un pipeline de robótica (RoboTwin-Vector), con pesos verificables mediante hash SHA-256 y una descripción detallada del procedimiento de entrenamiento. No obstante, la ausencia de licencia declarada, de idiomas soportados y de benchmarks publicados limita seriamente su evaluación y su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificadores de visión CLIP + decodificador transformer + U-Net de difusión (política de imitación con difusión) |
| Parametros totales | 780.979.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio padre no declara licencia) |
| Formato de pesos | safetensors (model.safetensors, 753 tensores, layout vector_v1.1) |

## Arquitectura y entrenamiento

La arquitectura es una política de imitación multimodal compuesta por codificadores de visión CLIP (congelados), capas de propiocepción y prompt-pool (congeladas), un decodificador transformer y una U-Net de difusión entrenables, además de embeddings de posición y sink también entrenables. La generación de acciones sigue un esquema de difusión con predicción de epsilon (epsilon-prediction diffusion loss). El layout de pesos consta de 753 tensores con el identificador vector_v1.1, idéntico al del modelo padre.

El entrenamiento consistió en 10.000 pasos con batch de 64, tasa de aprendizaje 1e-5 con decaimiento coseno y EMA de 0,999. Se aplicó una adaptación conservadora dirigida: aproximadamente el 55% de las muestras de imitación provinieron de las cuatro tareas más débiles (beat_block_hammer, place_mouse_pad, place_dual_shoes, move_stapler_pad), complementadas con un anclaje en espacio de funciones al padre congelado sobre las otras doce tareas, con peso 2. Los datos son demostraciones expertas de nivel 3 generadas con el harness RoboTwin-Vector (franka-panda, rango de semillas públicas por debajo de 2.000.000), con cada objetivo condicionado por una demostración experta de una escena distinta de la misma tarea.

## Capacidades

- Generación de acciones robóticas de manipulación mediante difusión, condicionada por observaciones visuales (CLIP) y propiocepción.
- Ejecución de políticas de imitación en un conjunto de dieciséis tareas del harness RoboTwin-Vector (cuatro objetivo y doce de anclaje).
- Condicionamiento por prompt con demostración experta de otra escena de la misma tarea (generalización entre escenas).
- Integración en pipelines de evaluación robótica con semillas públicas reproducibles.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en adaptación conservadora de políticas robóticas: el modelo sirve como caso de estudio de fine-tuning selectivo (solo decodificador, U-Net y embeddings) con anclaje funcional al padre para evitar olvido catastrófico en las doce tareas no objetivo.
- Reproducción de experimentos de imitación con difusión: los pesos verificables por SHA-256 y la descripción detallada de hiperparámetros permiten replicar el entrenamiento sobre el harness RoboTwin-Vector con semillas públicas por debajo de 2.000.000.
- Evaluación de generalización entre escenas: cada tarea objetivo se condiciona con una demostración de una escena distinta, lo que permite medir la robustez del modelo ante variaciones de entorno en simulación.
- Benchmarking de políticas de manipulación en franka-panda: útil para comparar el rendimiento en las cuatro tareas débiles (beat_block_hammer, place_mouse_pad, place_dual_shoes, move_stapler_pad) frente al modelo padre.
- Estudio de estrategias de balanceo de datos: el 55% de muestras de las tareas débiles frente al 45% restante con anclaje funcional constituye un punto de partida para analizar el compromiso entre especialización y retención.
- Docencia y formación en robótica con difusión: el modelo, de tamaño moderado (780 M de parámetros), puede emplearse como ejemplo práctico de arquitectura CLIP + transformer + U-Net en cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 780 M de parámetros en FP16 requieren aproximadamente 1,6 GB solo para pesos; en FP32, unos 3,1 GB. No se confirma la precisión de inferencia empleada.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con al menos 6-8 GB de VRAM, pero el modelo incluye codificadores CLIP y una U-Net de difusión cuyo consumo real no está documentado.
- Cabe en GPU de consumo: probablemente sí en RTX 3060, RTX 4060 Ti, RTX 4070 y superiores, sujeto a verificación empírica.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser una política robótica con difusión, requeriría un runtime específico del harness RoboTwin-Vector.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| satoshi3/attune-l3cA | 780.979.360 | no disponible | no disponible | no disponible | HuggingFace |
| domFree/attune-j4 (padre) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otras políticas robóticas con difusión | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El único punto de comparación documentado es el modelo padre domFree/attune-j4, del que este fine-tune hereda la arquitectura y el layout de pesos.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio padre no especifica licencia y esta model card no reclama derechos adicionales, por lo que el uso comercial queda en un limbo legal.
- Sesgos conocidos: no documentados, pero al entrenarse sobre demostraciones expertas de un harness concreto (franka-panda, semillas por debajo de 2.000.000) puede sobreajustarse a las condiciones de simulación de ese entorno.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se documentan longitudes de contexto ni soporte multilingüe; el condicionamiento es visual y propioceptivo, no textual en sentido amplio.
- Especialización estrecha: el 55% de las muestras se concentran en cuatro tareas, lo que puede reducir el rendimiento en las doce tareas de anclaje pese al término de anclaje funcional.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al padre ni de robustez fuera de simulación.
- Artefacto de investigación: descargas y likes nulos en el momento de la consulta; no hay señales de validación por la comunidad.
- Reproducibilidad dependiente del harness: requiere RoboTwin-Vector y el layout vector_v1.1 para cargar los 753 tensores correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/satoshi3/attune-l3cA
- Modelo padre: https://huggingface.co/domFree/attune-j4
- Revisión del padre referenciada: 4a2651b08cb70332bfe9b86ef9b2efaff1825eb8
- Harness RoboTwin-Vector: no disponible en la información proporcionada.
