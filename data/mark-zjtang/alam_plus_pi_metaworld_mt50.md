# Mark-ZJTang/alam_plus_pi_metaworld_mt50

## Resumen

El modelo `Mark-ZJTang/alam_plus_pi_metaworld_mt50` es un checkpoint de inferencia (paso 30.000) resultante del post-entrenamiento de la arquitectura ALAM + pi0 sobre el benchmark de robótica MetaWorld MT50. ALAM (Action Language Model) actúa como tokenizador de acciones continuas, mientras que pi0 es un modelo de política de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence. El autor, Mark-ZJTang, publica este checkpoint para reproducir la evaluación oficial en las 50 tareas de manipulación de MetaWorld, con un resultado reportado del 85,0% de éxito tras promediado macro por grupos de dificultad.

El modelo resuelve el problema de la manipulación robótica multi-tarea en simulación, ofreciendo una política entrenada que puede ejecutar las 50 tareas del benchmark con un brazo Sawyer virtual. Su relevancia radica en que demuestra la viabilidad de combinar un tokenizador de acciones (ALAM) con un modelo VLA (pi0) para lograr un rendimiento competitivo en un entorno estandarizado, y proporciona un punto de referencia reproducible para la comunidad. El checkpoint incluye los parámetros, metadatos y estadísticas de normalización necesarios para la inferencia, pero excluye el estado del optimizador, lo que lo limita a uso de evaluación.

La arquitectura concreta (número de parámetros, tipo de transformer, etc.) no se detalla en la información disponible, pero se sabe que el modelo se ejecuta con JAX y que el checkpoint pesa 12,1 GB. La configuración de inferencia especifica un horizonte de acción bruto de 6, un horizonte efectivo de 5, un paso de replanificación de 5 y una posición de cámara fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALAM + pi0 (VLA, basada en transformer; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax, presumiblemente en bf16/fp32, sin confirmar) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax (JAX) con `params`, `_CHECKPOINT_METADATA` y `assets/metaworld_mt50/norm_stats.json` |

## Arquitectura y entrenamiento

La arquitectura combina ALAM, un tokenizador de acciones que discretiza comandos continuos de control, con pi0, un modelo de política de visión-lenguaje-acción que procesa observaciones visuales y produce acciones. El checkpoint corresponde a un post-entrenamiento (fine-tuning) sobre MetaWorld MT50, realizado con un contrato de recursos de 8 GPUs. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se emplearon técnicas como RLHF o DPO. El tokenizador externo requerido es `metaworld_epoch19_step58216` del repositorio de modelos ALAM. El checkpoint está diseñado únicamente para inferencia, excluyendo el estado del optimizador.

## Capacidades

- Ejecución de las 50 tareas de manipulación del benchmark MetaWorld MT50 en simulación (brazo Sawyer, mesa con objetos cotidianos).
- Inferencia con replanificación: el modelo replanifica cada 5 pasos, con un horizonte de acción bruto de 6 y un horizonte efectivo de 5.
- Post-entrenamiento específico para el entorno MetaWorld, con estadísticas de normalización incluidas en el checkpoint.
- Soporte de evaluación reproducible mediante el protocolo congelado de 10 episodios por tarea.
- No incluye capacidades de lenguaje natural, visión general, tool calling ni agentes conversacionales; es un modelo puramente de control robótico.

## Casos de uso

- Evaluación de políticas de manipulación multi-tarea: el modelo sirve como referencia para comparar nuevos algoritmos en MetaWorld MT50, usando el protocolo estándar de 10 episodios por tarea.
- Investigación en aprendizaje por refuerzo multi-tarea: permite estudiar la transferencia entre 50 tareas y el efecto de la replanificación en el rendimiento.
- Desarrollo de sistemas de control en simulación: puede integrarse en pipelines de simulación para probar estrategias de manipulación antes de transferirlas a robots reales.
- Benchmarking de arquitecturas VLA: al combinar ALAM y pi0, sirve como caso de estudio para evaluar el impacto del tokenizador de acciones en el rendimiento final.
- Reproducción de resultados publicados: el checkpoint y el script de evaluación asociado permiten verificar el 85,0% de éxito reportado.
- Entrenamiento de políticas de continuación: aunque el checkpoint es de inferencia, puede usarse como punto de partida para nuevos post-entrenamientos si se dispone del estado del optimizador (no incluido).

## Benchmarks y rendimiento

El modelo reporta resultados en el benchmark MetaWorld MT50, con el protocolo congelado de 10 episodios por tarea (500 episodios en total):

| Metrica | Valor |
|---|---|
| Exitos por episodio | 434/500 |
| Tasa de exito episodio ponderado | 86,8% |
| Tasa de exito tras promediado macro (Easy/Medium/Hard/Very-Hard) | 84,98% (reportado como 85,0%) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El checkpoint pesa 12,1 GB, por lo que la VRAM mínima estimada para inferencia es de al menos 16 GB (considerando overhead de activaciones y buffers).
- El post-entrenamiento se realizó con 8 GPUs, pero la inferencia requiere "una GPU suficientemente grande" según la documentación; no se especifica el modelo exacto.
- Es probable que quepa en GPUs de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB), aunque no está confirmado.
- Opciones de despliegue: al ser un checkpoint Orbax de JAX, puede ejecutarse con JAX nativo; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica para MetaWorld MT50). La documentación no menciona alternativas como RT-1, RT-2, Octo o π0 original, ni proporciona datos de rendimiento de otros sistemas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; se recomienda contactar al autor antes de cualquier uso productivo.
- El checkpoint es solo de inferencia; no incluye el estado del optimizador, por lo que no puede reanudarse el entrenamiento directamente.
- Depende de un tokenizador externo (`metaworld_epoch19_step58216`) que debe descargarse por separado.
- Los resultados se obtienen exclusivamente en simulación (MetaWorld); no hay evidencia de transferencia a robots reales.
- La configuración de inferencia es fija (horizonte, replan step, posición de cámara); cambios en estos parámetros pueden degradar el rendimiento.
- No se especifican sesgos ni riesgos de alucinación, al ser un modelo de control y no de generación de texto.
- La verificación de integridad de los pesos requiere contrastar con `WEIGHTS_MANIFEST.sha256` del repositorio de código asociado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mark-ZJTang/alam_plus_pi_metaworld_mt50
- MetaWorld (benchmark): https://github.com/Farama-Foundation/Metaworld
- Documentación de MetaWorld: https://metaworld.farama.org/
- Página oficial de Meta-World: https://meta-world.github.io/
- Repositorio alternativo de MetaWorld: https://github.com/MA-ENV/metaworld
