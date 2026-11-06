# greecree/microduck-tug-of-war-tug-super-v8

## Resumen

`microduck-tug-of-war-tug-super-v8` es una política de control motriz entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX y distribuida con el manifiesto de políticas de la librería `microduck`. El autor es el usuario de Hugging Face `greecree`, vinculado al repositorio `green-creeper/microduck-challenges`.

La política resuelve una tarea concreta de locomotion competitiva: un tirón de guerra (tug-of-war) en el que el robot debe mantener tracción y estabilidad frente a múltiples oponentes. La versión v8 corresponde a una liga multi-oponente con refinamiento rápido mediante "pit-launch", y está diseñada como política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha cargada en una ranura de política del daemon del robot.

Su relevancia es acotada pero específica: demuestra un flujo completo de entrenamiento con `mjlab` (entorno de RL basado en MuJoCo), exportación a ONNX con normalizador de observaciones embebido y despliegue directo sobre hardware mediante `robotctl`. Es un artefacto de robótica de investigación reproducible, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal PPO para control robótico (no disponible el detalle de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) con normalizador de observaciones embebido, más `manifest.json` (schema 2) |
| Observaciones | 61 dimensiones |
| Acciones | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Algoritmo de entrenamiento | PPO (multi-opponent league) |
| Entornos paralelos | 4096 |
| Checkpoint | 250 |
| Semilla | 1 |

## Arquitectura y entrenamiento

La política se entrena con PPO sobre el task `Mjlab-TugOfWar-MicroDuck`, definido en el repositorio `green-creeper/microduck-challenges` (rama `main`, commit `4b675ebf4`). El entrenamiento parte de la base `mjlab-microduck 0.1.0 @ 981a279c6` y se ejecuta con 4096 entornos paralelos, hasta 1000 iteraciones máximas y semilla 1, con registro en TensorBoard. La versión v8 incorpora una liga multi-oponente, es decir, la política se enfrenta a una población de adversarios durante el entrenamiento para mejorar su robustez en el tirón de guerra, junto con un refinamiento rápido de tipo "pit-launch".

El resultado es una política perpetua: no tiene condición de terminación interna y se ejecuta de forma continua hasta que el daemon la descarga o la sustituye. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones crudas sin preprocesar. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Control motriz continuo del robot microduck a 50 Hz a partir de observaciones de 61 dimensiones.
- Ejecución de una marcha perpetua orientada a la tarea de tirón de guerra (tracción y estabilidad frente a oponentes).
- Robustez frente a múltiples oponentes gracias al entrenamiento en liga multi-oponente.
- Despliegue directo en hardware mediante `robotctl policy load <slot> <repo>`.
- Inferencia en formato ONNX, con normalizador de observaciones integrado.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es exclusivamente una política de control robótico.

## Casos de uso

- Investigación en locomotion con RL: sirve como referencia reproducible para estudiar políticas PPO multi-oponente sobre un cuadrúpedo de bajo coste, con comando de entrenamiento y commit documentados.
- Demostración de tug-of-war robótico: la política mantiene tracción y estabilidad frente a rivales, útil en exhibiciones y competiciones de robótica educativa.
- Base para fine-tuning en tareas de tracción: al partir de una política ya entrenada en liga, se puede refinar para variantes de la tarea con menos cómputo.
- Prueba de pipelines de despliegue: valida el flujo completo desde entrenamiento en `mjlab` hasta carga en el daemon con `robotctl` y manifiesto schema 2.
- Evaluación de robustez frente a adversarios: la liga multi-oponente permite medir la degradación de la política ante rivales no vistos.
- Integración en entornos simulados MuJoCo: la política puede ejecutarse en simulación para comparar sim-to-real antes de cargarla en hardware.
- Docencia en RL aplicado: ejemplo compacto de PPO con 4096 entornos, semilla fija y artefacto ONNX listo para inspección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se especifica el número de parámetros.
- GPU recomendadas: no disponible para inferencia; para reentrenamiento, el comando usa 4096 entornos paralelos, lo que requiere una GPU de datacenter (A100 o H100) o equivalente.
- Cabe en GPU consumer: probablemente sí dada la naturaleza de política de control para un robot de bajo coste, pero no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon `microduck` y el comando `robotctl`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms); no se publican cifras de latencia de inferencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han proporcionado políticas comparables de microduck ni de otros cuadrúpedos de bajo coste con las que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Entrenamiento no bit-reproducible: la misma semilla y comando producen políticas comparables, no idénticos pesos.
- Especialización estrecha: la política está entrenada para la tarea `Mjlab-TugOfWar-MicroDuck` y no se garantiza su comportamiento fuera de ese escenario.
- Política perpetua: se ejecuta indefinidamente hasta que se le indique lo contrario, lo que exige supervisión y mecanismos de parada en el despliegue.
- Dependencia del normalizador embebido: alimentar observaciones preprocesadas o con otra escala puede degradar el control.
- Sin datos de benchmarks ni de robustez sim-to-real publicados; el rendimiento en hardware real no está cuantificado en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Repositorio de challenges: https://github.com/green-creeper/microduck-challenges
- Repositorio de microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
