# mws-physical-ai/gr00t-n16-postloop100-real50-synth50-20261126

## Resumen

GR00T N1.6 Postloop100 Real50 Synth50 es un ajuste fino (fine-tuning) del modelo fundacional de robótica NVIDIA GR00T-N1.6-3B, desarrollado por el usuario mws-physical-ai. El modelo está orientado al control de un robot humanoide Unitree G1 equipado con manos BrainCo, y se ha entrenado para una tarea concreta de manipulación: retirar basura (remove trash) a partir de episodios de teleoperación reales combinados con episodios sintéticos generados por el pipeline Postloop100.

El checkpoint parte de la arquitectura de 3.286.608.832 parámetros de GR00T-N1.6-3B y se ha entrenado durante 20.000 pasos de optimizador sobre 50 episodios reales de teleoperación con BrainCo y 50 episodios sintéticos aceptados. El checkpoint publicado corresponde al paso 12.000, seleccionado por tener la menor pérdida de validación (0,037865 sobre dos episodios reales reservados), frente a una pérdida final de 0,042967 en el paso 20.000.

La relevancia de este modelo es acotada pero clara: demuestra un flujo de trabajo de ajuste fino de un policy robótico (visión-lenguaje-acción) sobre hardware humanoide comercial, mezclando datos reales y sintéticos para aumentar la cobertura del dataset. El vector de acción combina 64 valores de tokens de movimiento GEAR-SONIC y seis objetivos de mano BrainCo por lado, con fotogramas preprocesados a 640 × 360 antes de la alineación con el codificador Eagle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional visión-lenguaje-acción (VLA) GR00T N1.6; codificador visual Eagle y cabezal de acciones con tokens de movimiento GEAR-SONIC |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.6-3B |
| Tarea | Manipulación robótica: retirar basura con Unitree G1 + manos BrainCo |
| Vector de acción | 64 tokens de movimiento GEAR-SONIC + 6 objetivos de mano BrainCo por lado |
| Preprocesado de imagen | 640 × 360 antes de la alineación con Eagle |
| Pasos de entrenamiento | 20.000 (checkpoint publicado en el paso 12.000) |
| Pérdida de validación | 0,037865 (paso 12.000); 0,042967 (paso 20.000) |
| Tamaño del repo | 6,6 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T-N1.6-3B, un modelo fundacional de robótica de tipo visión-lenguaje-acción. La información disponible confirma el uso de un codificador visual Eagle para la alineación de las observaciones y de un esquema de acción basado en tokens de movimiento GEAR-SONIC (64 valores) combinados con objetivos articulares de las manos BrainCo (seis por lado). No se detalla en la información proporcionada la composición interna del transformer, el número de tokens de entrenamiento del modelo base ni si hubo etapas de RLHF o DPO.

El ajuste fino se realizó sobre dos datasets: `mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120` (50 episodios reales de teleoperación) y `mws-physical-ai/postloop100-20261124` (50 episodios sintéticos aceptados). El entrenamiento se extendió 20.000 pasos de optimizador y el checkpoint publicado corresponde al paso 12.000, elegido por minimizar la pérdida de validación sobre dos episodios reales reservados. Los detalles de preprocesado y la selección de episodios se documentan en los ficheros `PREPROCESSING.md` y `data_split.json` del repositorio.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones para un Unitree G1 con manos BrainCo en la tarea de retirar basura.
- Política visomotora: procesa observaciones de imagen preprocesadas a 640 × 360 y las alinea mediante el codificador Eagle.
- Generación de acciones articulares: produce 64 tokens de movimiento GEAR-SONIC y seis objetivos de mano BrainCo por lado.
- Aprendizaje de episodios de teleoperación: reproduce comportamientos derivados de demostraciones humanas reales.
- Mezcla de datos reales y sintéticos: el entrenamiento incorpora episodios sintéticos aceptados, lo que amplía la cobertura del dataset.
- No se dispone de información sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento, ya que el modelo está especializado en control robótico y no en texto general.

## Casos de uso

- Automatización de retirada de residuos en entornos controlados: el modelo ejecuta la política aprendida para recoger y depositar basura con el G1, adecuado por su entrenamiento específico en esa tarea.
- Investigación en aprendizaje por imitación: sirve como referencia de ajuste fino de GR00T N1.6 sobre teleoperación real con manos BrainCo, útil para comparar estrategias de mezcla real/sintética.
- Evaluación de datos sintéticos en robótica: al combinar 50 episodios reales y 50 sintéticos, permite estudiar el impacto de la generación sintética en la pérdida de validación sobre episodios reales reservados.
- Prototipado de políticas para humanoides comerciales: el checkpoint puede integrarse en pipelines de evaluación sobre el Unitree G1 para validar el control de manos diestras en tareas de manipulación.
- Base para nuevos ajustes finos: al ser un fine-tuning de GR00T-N1.6-3B, puede servir de punto de partida para otras tareas de manipulación con el mismo hardware.
- Reproducción de experimentos: los ficheros `PREPROCESSING.md` y `data_split.json` permiten replicar el preprocesado y la selección de episodios en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de validación sobre dos episodios reales reservados: 0,037865 en el paso 12.000 y 0,042967 en el paso 20.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.286.608.832 parámetros, en BF16 el peso ronda los 6,6 GB, por lo que se necesita al menos esa cantidad más el margen para activaciones y el codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs con 16 GB o más de VRAM, aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño en BF16 (unos 6,6 GB) sugiere que podría caber en GPUs de consumo con 12-16 GB, pero no hay datos oficiales.
- Opciones de despliegue: no disponibles. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.6 Postloop100 Real50 Synth50 (este) | 3.286.608.832 | no disponible | Manipulación G1 + BrainCo | no disponible | Hugging Face |
| nvidia/GR00T-N1.6-3B | 3B (aproximado) | no disponible | Modelo fundacional de robótica | no disponible en la información | Hugging Face (modelo base) |
| Otros fine-tunes de GR00T N1.6 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para una única tarea (retirar basura) y un hardware concreto (Unitree G1 con manos BrainCo); no es un modelo de propósito general.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Idiomas no disponibles: no aplica como modelo de texto general, pero no se documenta ningún soporte lingüístico.
- Riesgo de sobreajuste: con solo 50 episodios reales y 50 sintéticos, la generalización a nuevas condiciones de iluminación, objetos o entornos es incierta.
- Dependencia del preprocesado: el rendimiento depende de replicar exactamente el preprocesado a 640 × 360 y la alineación con Eagle descritos en `PREPROCESSING.md`.
- Sin benchmarks públicos: no hay métricas de éxito en tarea ni comparaciones con otras políticas, solo pérdida de validación.
- Riesgo de alucinación y sesgos: no documentados; en robótica, el equivalente sería generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Checkpoint intermedio: el modelo publicado es el paso 12.000, no el final (20.000), lo que puede implicar un comportamiento distinto al de la última iteración del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mws-physical-ai/gr00t-n16-postloop100-real50-synth50-20261126
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset de teleoperación: https://huggingface.co/datasets/mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120
- Dataset sintético: https://huggingface.co/datasets/mws-physical-ai/postloop100-20261124
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
