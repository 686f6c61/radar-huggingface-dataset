# huuhuyng/watch-satoshi3__attune-l3cA-f567fe1

## Resumen

Attune Vector Level 3 policy (vector_v1.1) es un ajuste fino del modelo domFree/attune-j4, desarrollado por el usuario huuhuyng para el lane Robotensor Attune Vector en su nivel 3. Se trata de una política de imitación para robótica manipulativa, no de un modelo de lenguaje: combina un codificador visual CLIP, un decodificador transformer y una U-Net de difusión para generar acciones motoras a partir de observaciones visuales y propioceptivas. El checkpoint mantiene el mismo diseño de 753 tensores que el modelo padre, con 780.979.360 parámetros totales.

El modelo se ha adaptado de forma conservadora sobre el padre congelado: solo se entrenaron el decodificador transformer, la U-Net de difusión y los embeddings de posición y sink, mientras que los codificadores CLIP, los normalizadores de acción/propiocepción y las capas de prompt-pool permanecen intactos. El entrenamiento se centró en las cuatro tareas con peor rendimiento del padre (beat_block_hammer, place_mouse_pad, place_dual_shoes y move_stapler_pad), con un anclaje en espacio de funciones hacia el padre para preservar el comportamiento en las otras doce tareas.

La relevancia de este checkpoint es acotada: es un experimento de adaptación dirigida sobre una política robótica concreta, publicado sin model card detallada, sin licencia declarada y sin resultados de benchmarks. Resulta útil como referencia para quienes trabajan con el harness RoboTwin-Vector o estudian técnicas de ajuste fino selectivo con anclaje funcional en políticas de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador visual CLIP + decodificador transformer + U-Net de difusión (política de imitación) |
| Parametros totales | 780.979.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acciones robóticas, no lingüístico) |
| Licencia | no disponible (el repositorio padre no declara licencia) |
| Formato de pesos | safetensors (model.safetensors, 753 tensores, sha256 fa7bb3bd...) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema vector_v1.1 del modelo padre: un codificador visual CLIP para procesar observaciones, capas de prompt-pool y propiocepción, un decodificador transformer y una U-Net de difusión que genera acciones mediante predicción de epsilon. El ajuste fino congela los codificadores CLIP, los normalizadores de acción y propiocepción y las capas de prompt-pool y propiocepción; solo se entrenan el decodificador transformer, la U-Net de difusión y los embeddings de posición y sink.

El entrenamiento consistió en 10.000 pasos con batch de 64, learning rate 1e-5 con decaimiento coseno, EMA de 0,999 y pérdida de difusión con predicción de epsilon. Los datos son demostraciones expertas de nivel 3 generadas con el harness RoboTwin-Vector (robot franka-panda, semilla pública por debajo de 2.000.000), con cada tarea objetivo condicionada por una demostración experta de otra escena de la misma tarea. Aproximadamente el 55% de las muestras de imitación provienen de las cuatro tareas más débiles del padre, y se aplica un anclaje en espacio de funciones al padre congelado sobre las otras doce tareas con peso 2, lo que constituye la innovación técnica principal: adaptación selectiva sin degradar el resto del repertorio.

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales y propioceptivas.
- Ejecución de al menos dieciséis tareas de manipulación del harness RoboTwin-Vector, incluidas beat_block_hammer, place_mouse_pad, place_dual_shoes y move_stapler_pad.
- Condicionamiento por prompt visual: cada tarea se especifica mediante una demostración experta de otra escena de la misma tarea.
- Política de difusión con predicción de epsilon para generar trayectorias de acción multimodales.
- No soporta tool calling, function calling, agentes textuales, razonamiento simbólico ni capacidades multilingües; es un modelo de política, no un LLM.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en ajuste fino selectivo de políticas robóticas: sirve como caso de estudio de adaptación dirigida con anclaje funcional al padre, útil para comparar estrategias de congelación parcial de capas.
- Reproducción de experimentos con RoboTwin-Vector: el checkpoint permite replicar el entrenamiento de nivel 3 con el harness y la semilla pública indicada, verificando el hash sha256 del archivo de pesos.
- Evaluación de políticas de imitación en tareas de manipulación con franka-panda: las cuatro tareas reforzadas (beat_block_hammer, place_mouse_pad, place_dual_shoes, move_stapler_pad) son candidatas directas para medir mejoras frente al padre.
- Benchmarking de robustez ante cambio de escena: el condicionamiento con demostraciones de otra escena de la misma tarea permite estudiar generalización visual en políticas de difusión.
- Base para nuevos ajustes finos en el lane Attune Vector: al mantener el layout de 753 tensores y los módulos congelados, se puede partir de este checkpoint para adaptaciones posteriores sin reentrenar los codificadores CLIP.
- Docencia y divulgación sobre políticas de difusión en robótica: el tamaño contenido (780 millones de parámetros) y el formato safetensors facilitan su inspección y experimentación en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,1 GB solo para pesos, más activaciones y buffers de la U-Net de difusión; el repo ocupa 3,1 GB.
- En fp16/bf16 los pesos ocuparían alrededor de 1,6 GB, pero no se ha confirmado compatibilidad de cuantización ni conversión a formatos de menor precisión.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs consumer con al menos 8 GB de VRAM, aunque no hay validación publicada.
- Opciones de despliegue: no disponible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a políticas robóticas de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Attune Vector Level 3 (este) | 780.979.360 | no disponible | no disponible | Hugging Face, 0 descargas |
| domFree/attune-j4 (padre) | no disponible | no disponible | no disponible | Hugging Face |
| Otros modelos del lane Attune Vector | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia: el repositorio padre no declara licencia y esta model card no añade ninguna, por lo que el uso comercial queda sin marco legal claro.
- Sin model card detallada: no se documentan idiomas, pipeline, cuantizaciones ni benchmarks, lo que dificulta evaluar su idoneidad en producción.
- Especialización estrecha: solo cubre las tareas del harness RoboTwin-Vector con robot franka-panda; no es un modelo de propósito general.
- Riesgo de sobreajuste a las cuatro tareas reforzadas: el 55% de las muestras de imitación provienen de ellas, aunque el anclaje funcional con peso 2 mitiga el olvido catastrófico en las otras doce.
- Dependencia de demostraciones expertas de otra escena: el condicionamiento por prompt visual limita el uso a escenarios con ese tipo de referencia disponible.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de evaluación independiente.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de generar acciones fuera de distribución ante observaciones no vistas durante el entrenamiento.
- Fecha de creación futura (2026-11-05) en los metadatos, lo que puede indicar un artefacto de publicación o un error de registro.

## Enlaces

- Hugging Face: https://huggingface.co/huuhuyng/watch-satoshi3__attune-l3cA-f567fe1
- Modelo padre: https://huggingface.co/domFree/attune-j4
- Revisión del padre: 4a2651b08cb70332bfe9b86ef9b2efaff1825eb8
- Harness RoboTwin-Vector: no disponible (no se proporciona URL en la información)
