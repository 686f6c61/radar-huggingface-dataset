# NeoteAI/n0-twam-univtac-absee

## Resumen

El modelo `NeoteAI/n0-twam-univtac-absee` es un checkpoint post-entrenamiento del modelo N0-TWAM, un "world-action model" táctil-nativo desarrollado por NeoteAI para manipulación robótica con contacto. A diferencia de los modelos de lenguaje o visión convencionales, N0-TWAM modela conjuntamente visión, tacto y acción mediante un Mixture-of-Transformers (MoT) bajo un objetivo de rectified-flow / flow-matching. Esto le permite predecir el futuro visual y táctil de una escena y generar simultáneamente las acciones de bajo nivel que lo realizan.

Este checkpoint concreto está especializado en ocho tareas de manipulación con un solo brazo (UniVTAC 8 single-arm tasks) y utiliza flujos táctiles GelSight RGB sin marcadores. Cada tarea emplea sus propias estadísticas de normalización, por lo que el despliegue debe realizarse con la configuración específica de cada tarea. El modelo tiene aproximadamente 7.200 millones de parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Su relevancia radica en abordar la manipulación hábil con contacto, un área donde los métodos basados únicamente en visión suelen fallar, integrando el tacto como una modalidad de primera clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) con rectified-flow / flow-matching |
| Parametros totales | 7.207.357.844 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de acción, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal visión-táctil-acción) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

N0-TWAM se basa en un Mixture-of-Transformers (MoT) que procesa de forma conjunta las modalidades visual, táctil y de acción. El modelo se entrena con un objetivo de rectified-flow (flow-matching), lo que le permite aprender una distribución generativa sobre las trayectorias futuras. En lugar de regresar acciones a partir de la observación actual, el modelo genera de manera autoregresiva o secuencial el futuro visual, táctil y las acciones de bajo nivel.

El checkpoint `n0-twam-univtac-absee` es un ajuste posterior (post-training) sobre el modelo base `n0-twam-base`, especializado en ocho tareas de manipulación con un solo brazo. Se entrenó con flujos táctiles GelSight RGB sin marcadores, y cada tarea tiene sus propias estadísticas de normalización. El repositorio incluye el directorio `transformer/` con `config.json` y los pesos safetensors (con 18 tensores `local_tactile`), además de `train_meta.json` con la instantánea del entrenamiento. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Predicción conjunta de futuros visuales y táctiles junto con la generación de acciones de bajo nivel para manipulación robótica.
- Soporte para ocho tareas específicas: inserción de tubos, inserción de clavijas, inserción de conectores HDMI, clasificación por textura táctil, extracción de llaves, levantamiento de latas, levantamiento de botellas y colocación de botellas en estanterías.
- Uso de flujos táctiles GelSight RGB sin marcadores como entrada sensorial principal.
- Normalización específica por tarea, lo que permite adaptar el modelo a diferentes distribuciones de datos.
- Arquitectura Mixture-of-Transformers que integra visión, tacto y acción en un único modelo generativo.
- Entrenamiento con rectified-flow, lo que facilita la generación estable de trayectorias de acción.

## Casos de uso

- Inserción de componentes en ensamblaje industrial: el modelo puede guiar un brazo robótico para insertar tubos, clavijas o conectores HDMI en cavidades con tolerancias ajustadas, utilizando el tacto para corregir desviaciones en tiempo real.
- Clasificación de objetos por textura: en líneas de clasificación, el robot puede agarrar un objeto y clasificarlo según su textura táctil, útil para separar materiales o verificar calidad superficial.
- Manipulación de objetos deformables o no rígidos: tareas como levantar una botella o un bote requieren ajustar la fuerza de agarre y la orientación, algo que el modelo maneja gracias a la información táctil.
- Mantenimiento y desmontaje: la tarea de extraer una llave de una cerradura (untwist and extract) puede aplicarse a operaciones de mantenimiento donde se requieren movimientos precisos con contacto.
- Robots domésticos de asistencia: colocar botellas en estanterías o levantar objetos cerca de paredes son tareas típicas en entornos domésticos, donde el tacto evita colisiones y daños.
- Investigación en manipulación hábil: el modelo sirve como banco de pruebas para estudiar el impacto del tacto en el aprendizaje de políticas de control, y puede integrarse en simuladores o plataformas robóticas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Tampoco hay datos de rendimiento en tareas de manipulación (tasa de éxito, tiempo de ejecución, etc.) en la documentación consultada.

## Requisitos de hardware

- El tamaño de los pesos en safetensors es de 14,4 GB, lo que sugiere que el modelo ocupa aproximadamente 14 GB en precisión FP16. Para inferencia en FP16 se necesitaría al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G o A100 40GB).
- No se proporcionan requisitos oficiales de VRAM, GPU recomendadas ni opciones de despliegue específicas.
- Dado que el modelo está diseñado para robótica, el despliegue probablemente se realice en sistemas embebidos con aceleradores como Jetson Orin o en estaciones de trabajo con GPUs NVIDIA, pero no hay documentación al respecto.
- No se conocen opciones de cuantización ni herramientas de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (world-action models táctiles). El campo de los modelos de acción-mundo con tacto es emergente y no hay alternativas públicas conocidas con las que comparar directamente. Se recomienda consultar la documentación de N0-TWAM en GitHub para posibles referencias.

## Limitaciones y advertencias

- El checkpoint está especializado en las ocho tareas listadas; su uso fuera de estas tareas requeriría un nuevo entrenamiento o ajuste.
- Cada tarea tiene sus propias estadísticas de normalización. Si se sirve el modelo sin la configuración por tarea (por ejemplo, usando el "pooled envelope" de `train_meta.json`), las acciones se desnormalizarán a una escala incorrecta, lo que degrada gravemente el rendimiento.
- No se dispone de información sobre sesgos, alucinaciones o riesgos de seguridad específicos, pero al ser un modelo de control robótico, cualquier error de predicción puede causar daños físicos. Se recomienda validar en simulación antes de desplegar en hardware real.
- La licencia es Apache 2.0, pero el modelo base `n0-twam-base` tiene licencia CC-BY-NC-SA 4.0. Es necesario verificar si el uso comercial de este checkpoint está permitido según la cadena de derivación.
- El modelo no es un modelo de lenguaje y no soporta procesamiento de texto, conversación ni generación de código.

## Enlaces

- HuggingFace: https://huggingface.co/NeoteAI/n0-twam-univtac-absee
- GitHub del proyecto N0-TWAM: https://github.com/neoteai/N0-TWAM
- Página de investigación: https://research.neoteai.com/n0-twam/
- Modelo base en HuggingFace: https://huggingface.co/NeoteAI/n0-twam-base
