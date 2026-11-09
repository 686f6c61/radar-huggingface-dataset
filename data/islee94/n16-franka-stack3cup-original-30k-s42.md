# islee94/n16-franka-stack3cup-original-30k-s42

## Resumen

El modelo `n16-franka-stack3cup-original-30k-s42` es un checkpoint de ajuste fino (fine-tuning) del modelo fundacional de robótica GR00T N1.6, desarrollado por NVIDIA, publicado por el usuario islee94 en Hugging Face. Se trata de un modelo de visión-lenguaje-acción (VLA) especializado en una tarea concreta de manipulación robótica: apilar tres vasos (stack_3_cup) con un brazo robótico Franka. El checkpoint corresponde a 30.000 actualizaciones de entrenamiento realizadas sobre cuatro GPU A100 con semilla 42, partiendo del checkpoint base `gr00tn16 179b98b`.

Con 3.286.608.832 parámetros totales y un tamaño de repositorio de 6,6 GB, el modelo se distribuye únicamente en formato safetensors con los archivos de inferencia (sin estado del optimizador). No es un modelo de propósito general: es un artefacto de investigación orientado a evaluar la transferencia de un VLA fundacional a una tarea física específica.

La relevancia de este checkpoint es limitada y muy específica: sirve como referencia reproducible de un experimento de fine-tuning de GR00T N1.6 en un entorno real (Franka), con semilla y número de pasos documentados, lo que lo hace útil para investigadores que quieran replicar o comparar resultados de adaptación de VLAs a tareas de manipulación. La model card indica explícitamente que la evaluación en robot está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (vision-language-action, VLA); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards: model-00001-of-00002 y model-00002-of-00002) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de fine-tuning de GR00T N1.6, el modelo fundacional de visión-lenguaje-acción de NVIDIA para robótica humanoide y manipulación. La información disponible no detalla la arquitectura interna (composición de encoder visual, backbone de lenguaje y cabecera de acciones), por lo que no se puede confirmar si emplea un transformer estándar, un diseño híbrido o módulos específicos de difusión de acciones. El tag `Gr00tN1d6` confirma la familia del modelo base.

El entrenamiento consistió en 30.000 actualizaciones sobre el dataset `stack_3_cup_cf5ec9f_train` (datos "original"), ejecutado en 4 GPU A100 con 4 procesos por GPU (16 en total) y semilla 42, partiendo del checkpoint `gr00tn16 179b98b`. El repositorio incluye artefactos de configuración del experimento (`experiment_cfg/conf.yaml`, `config.yaml`, `dataset_statistics.json`, `final_model_config.json`, `final_processor_config.json`) y estadísticas de normalización (`statistics.json`), lo que permite reconstruir parte del pipeline de entrenamiento. No se documentan detalles sobre composición del dataset, número de tokens, ni uso de RLHF o DPO.

## Capacidades

- Control de robot manipulador: genera acciones motoras para un brazo Franka en la tarea específica de apilar tres vasos.
- Percepción visual y condicionamiento por lenguaje: al ser un VLA de la familia GR00T, procesa observaciones visuales e instrucciones en lenguaje para producir acciones, aunque la model card no detalla el formato exacto de entrada.
- Ejecución de una política especializada: el checkpoint está entrenado para una única tarea (`stack_3_cup`), no para generalización multi-tarea.
- Integración con el ecosistema GR00T: compatible con los ficheros de configuración y procesador del framework de NVIDIA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento.

## Casos de uso

- Reproducción de experimentos de fine-tuning de VLAs: el checkpoint incluye semilla, número de pasos, configuración y estadísticas del dataset, lo que permite replicar el entrenamiento y comparar resultados con otras ejecuciones.
- Evaluación de transferencia sim-to-real en robótica: sirve como política candidata para probar en un Franka real la tarea de apilar tres vasos, tal como indica la model card ("robot evaluation pending").
- Benchmark interno de adaptación de GR00T N1.6: útil para medir cuánto mejora un VLA fundacional tras 30.000 actualizaciones en una tarea concreta frente al checkpoint base `179b98b`.
- Estudio de sensibilidad a hiperparámetros: al estar etiquetado con semilla 42 y 30k pasos, se puede comparar con otros checkpoints del mismo autor (por ejemplo, variantes con otros seeds o datasets) para analizar varianza.
- Punto de partida para fine-tuning adicional: investigadores que quieran continuar el entrenamiento en tareas relacionadas pueden cargar estos pesos como inicialización.
- Docencia y demostración de pipelines VLA: el repositorio incluye todos los ficheros de configuración necesarios para ilustrar cómo se estructura un experimento de entrenamiento de robótica con GR00T.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en robot está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,29 mil millones de parámetros, en precisión completa (fp32) se requieren aproximadamente 13,1 GB solo para pesos; en fp16/bf16 unos 6,6 GB; en int8 unos 3,3 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó en 4 GPU A100; para inferencia basta una GPU con al menos 8-16 GB de VRAM según precisión.
- Compatibilidad con GPU de consumo: cabe en tarjetas como RTX 3090, RTX 4090 (24 GB) en fp16, y potencialmente en GPUs de 8 GB si se cuantiza, aunque no se distribuyen pesos cuantizados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo VLA de robótica, el despliegue esperado es mediante el framework GR00T de NVIDIA y los ficheros de configuración incluidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-stack3cup-original-30k-s42 | 3,29 B | no disponible | Apilar 3 vasos con Franka | no disponible | Hugging Face (público) |
| GR00T N1.6 (checkpoint base `179b98b`) | no disponible | no disponible | VLA fundacional multi-tarea | no disponible | Referenciado como base, no se detalla en la informacion |
| Otras variantes del mismo autor (islee94) | no disponible | no disponible | Manipulación robótica | no disponible | No confirmado en la informacion |

No se dispone de datos suficientes para comparar con alternativas como RT-2, OpenVLA o π0; la información proporcionada no incluye métricas ni especificaciones de esos modelos.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea `stack_3_cup` con un Franka; no generaliza a otras tareas ni a otros robots sin nuevo fine-tuning.
- Evaluación pendiente: la model card indica explícitamente que la evaluación en robot real no se ha completado, por lo que no hay evidencia publicada de éxito en la tarea.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso productivo.
- Idiomas no declarados: no se documenta el soporte lingüístico de las instrucciones, aunque al derivar de GR00T N1.6 probablemente herede el inglés como idioma principal de condicionamiento.
- Sin cuantizaciones publicadas: solo se distribuyen pesos safetensors en precisión original, lo que limita el despliegue en hardware modesto sin trabajo adicional de cuantización.
- Artefacto de investigación: el repositorio incluye ficheros de configuración y estadísticas de entrenamiento, pero no documentación de uso ni scripts de inferencia; requiere conocimiento del framework GR00T.
- Riesgo de sobreajuste: 30.000 actualizaciones sobre un dataset único pueden producir sobreajuste a las condiciones específicas de recogida de datos (iluminación, posiciones de los vasos, fondo).
- Sin información sobre sesgos: al ser un modelo de control robótico, los riesgos de sesgo se refieren a condiciones físicas y de percepción, no a sesgos sociales; no se documentan análisis al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-stack3cup-original-30k-s42
- Checkpoint base referenciado: `gr00tn16 179b98b` (no se proporciona URL en la informacion)
- Documentación interna del autor: `internal/docs/servers/raven.md` (no accesible públicamente)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
