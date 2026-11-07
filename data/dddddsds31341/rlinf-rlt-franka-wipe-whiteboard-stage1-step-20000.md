# dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-20000

## Resumen

RLinf RLT Franka Wipe Whiteboard Stage 1 — step 20000 es un checkpoint de política de acción (action policy) para robótica, publicado por el usuario dddddsds31341 en Hugging Face. No se trata de un modelo de lenguaje, sino de un artefacto de inferencia derivado de un experimento de aprendizaje por refuerzo (RL) sobre el framework RLinf, empleando la variante RLT sobre la base OpenPI. El checkpoint corresponde al paso de optimizador 20.000 de la ejecución `rlt-wipe-whiteboard-g7-bs4-ga8-s20000-20261104-v14`, cuyo objetivo declarado era alcanzar 20.000 pasos.

El modelo está orientado a una tarea concreta de manipulación robótica: limpiar una pizarra blanca con un brazo Franka. El repositorio contiene únicamente pesos de evaluación (`full_weights.pt`), configuración (`config.yaml`, `training_config.yaml`), estadísticas de normalización (`norm_stats.json`) y el código de la release v18 (`code.zip`). No incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.

Es relevante para investigadores que reproduzcan experimentos de RL aplicado a políticas robóticas con RLinf y OpenPI, y como referencia de un pipeline de entrenamiento por etapas (stage 1) sobre tareas de contacto físico. El tamaño del repositorio es de 14,5 GB y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLT sobre OpenPI (política de acción para robótica); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `full_weights.pt`, formato PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica que los componentes base conservan su licencia original) |
| Formato de pesos | PyTorch (`full_weights.pt`), más `config.yaml`, `training_config.yaml`, `norm_stats.json`, `code.zip` |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un checkpoint de política de acción RLT integrado en la implementación RLinf OpenPI. El estado guardado en `full_weights.pt` contiene el `state_dict` completo del modelo, incluyendo las claves `rlt_module.*`, y excluye explícitamente el estado de optimizador, scheduler y RNG. El entrenamiento se realizó sobre la tarea Franka Wipe Whiteboard, con una configuración registrada en TensorBoard y un objetivo de 20.000 pasos de optimizador; este checkpoint corresponde al paso final de esa ejecución reanudada.

La model card no detalla la composición del dataset, el número de tokens ni si se aplicaron técnicas como RLHF o DPO, ya que el paradigma es de aprendizaje por refuerzo sobre políticas robóticas y no de modelado de lenguaje. Tampoco se especifican innovaciones técnicas internas más allá de la propia integración RLT/OpenPI. El código incluido en `code.zip` corresponde a la release v18 utilizada por el flujo de reanudación posterior; el checkpoint fuente de 15k es anterior a esa release. La exportación no ejecuta entrenamiento, no modifica pesos y no garantiza tasas de éxito en evaluación.

## Capacidades

- Ejecución de una política de acción para la tarea específica de limpiar una pizarra blanca con un brazo Franka.
- Integración con la implementación RLinf OpenPI RLT, requiriendo `model_path` apuntando a `full_weights.pt` y `norm_stats_path` apuntando a `norm_stats.json`.
- Conservación de la arquitectura RLT, el preprocesado, las entradas de cámara y las transformaciones de acción originales.
- Uso previsto exclusivamente para evaluación (checkpoint de inferencia), no para reanudar entrenamiento.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Evaluación de políticas robóticas en tareas de contacto: permite cargar los pesos y ejecutar la política RLT sobre el entorno Franka Wipe Whiteboard para medir el comportamiento en el paso 20.000 frente a checkpoints intermedios como el de 10.000.
- Reproducción de experimentos RLinf: sirve como referencia para validar que la configuración `config.yaml` y las estadísticas de normalización producen inferencias coherentes en una máquina distinta, adaptando las rutas locales de `training_config.yaml`.
- Comparación entre etapas de entrenamiento: al existir un checkpoint del paso 10.000 del mismo run, permite analizar la evolución de la política entre etapas y detectar mejoras o degradaciones.
- Integración en pipelines de simulación: puede emplearse como política de control en entornos simulados compatibles con OpenPI para generar trayectorias de limpieza de pizarra.
- Estudio de transferencia sim-to-real: aunque no se documenta, el checkpoint puede servir de base para experimentos de despliegue en un Franka real, siempre que se respeten preprocesado y transformaciones de acción.
- Docencia e investigación en RL aplicado a robótica: útil como ejemplo tangible de un artefacto de inferencia derivado de un entrenamiento por RL con RLinf, incluyendo la estructura de ficheros necesaria para reproducirlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la exportación no afirma tasas de éxito en evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 14,5 GB, lo que da una cota inferior aproximada del espacio en disco necesario para los pesos, pero no se especifica el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica el uso de la implementación RLinf OpenPI RLT con `config.yaml`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables directamente a este artefacto).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf RLT Franka Wipe Whiteboard Stage 1 — step 20000 | Checkpoint de política RLT/OpenPI | 20.000 | no disponible | no disponible | Hugging Face (0 descargas) |
| RLinf RLT Franka Wipe Whiteboard Stage 1 — step 10000 | Checkpoint de política RLT/OpenPI | 10.000 | no disponible | no disponible | Hugging Face |
| Franka-Wipe-Whiteboard-pi05-step-20000 | Checkpoint OpenPI/Orbax con EMA y estadísticas de normalización | 20.000 | no disponible | no disponible | Hugging Face |

Los tres artefactos pertenecen al mismo autor y a la misma línea de trabajo sobre Franka Wipe Whiteboard, pero difieren en la variante (RLT frente a pi0.5) y en el formato de checkpoint (PyTorch frente a Orbax). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Checkpoint de solo evaluación: no contiene estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.
- No se garantiza el éxito en evaluación; la model card declara explícitamente que la exportación no afirma tasas de éxito.
- Requiere assets de modelo base y tokenizer separados, no incluidos en el repositorio.
- Las rutas locales de `training_config.yaml` deben adaptarse a la máquina de destino; de lo contrario, la carga fallará.
- Es imprescindible preservar la arquitectura RLT, el preprocesado, las entradas de cámara y las transformaciones de acción originales para que la inferencia sea válida.
- Licencia no especificada: los componentes base conservan su licencia original, pero no se detalla cuál, lo que introduce incertidumbre para uso comercial.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Ausencia total de datos de benchmarks, sesgos, alucinación o limitaciones idiomáticas, ya que no es un modelo de lenguaje; cualquier afirmación al respecto sería especulativa.
- El código incluido corresponde a la release v18, posterior al checkpoint fuente de 15k, lo que puede introducir diferencias de compatibilidad con versiones anteriores.

## Enlaces

- Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-20000
- Checkpoint del paso 10.000: https://huggingface.co/dddddsds31341/RLinf-RLT-Franka-Wipe-Whiteboard-Stage1-Step-10000
- Checkpoint pi0.5 del mismo autor: https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-20000
