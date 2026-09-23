# Recharge23/JAM-20K-single

## Resumen

JAM-20K-single es un paquete de adaptadores LoRA para el modelo base Franka-JAM, un modelo de politica robotica orientado al control de un brazo Franka. No es un modelo de lenguaje: se trata de un conjunto de pesos que, a partir de imagenes RGB de una camara externa, una instruccion de tarea en texto y la pose fisica del flange, predice la siguiente pose objetivo del efector final y el estado del gripper. El autor (Recharge23) publica dos checkpoints independientes, uno por tarea, bajo el directorio `early_release_15k/`.

Cada checkpoint se ha entrenado durante 15.000 actualizaciones del optimizador sobre una tarea concreta: `task_4` ("coger el pan y ponerlo en el bol rojo") y `task_5` ("coger el pimiento verde y ponerlo en el bol blanco"). A pesar del nombre del repositorio, que alude a una futura entrega de 20K, los archivos publicados son checkpoints de 15K; el entrenamiento hacia 20K continua por separado.

El interes de esta entrega es doble. Por un lado, sirve como ejemplo reproducible de adaptacion LoRA por tarea sobre un modelo fundacional de robotica, con procedencia de entrenamiento documentada (`training_provenance.json`) y validacion de artefacto. Por otro, esta pensada para despliegue real sobre un Franka mediante la interfaz GELLO, con scripts de servido y comprobaciones de integridad SHA256 incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre el modelo base Franka-JAM (arquitectura del base no disponible; se distinguen cabezas de accion y de video) |
| Parametros totales | No disponible para el base. Cada adaptador contiene 1.216 tensores entrenados en FP32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de politica robotica, no de lenguaje). Entrenado con 120.000 ventanas muestreadas |
| Tipos de cuantizacion | No disponible (adaptadores exportados en FP32) |
| Idiomas soportados | No disponible. Las instrucciones de tarea (`prompt.txt`) estan redactadas en ingles |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptadores LoRA; requieren el base `Franka-JAM.safetensors` distribuido aparte) |

## Arquitectura y entrenamiento

Cada entrega es un export completo de adaptador LoRA, no un modelo fusionado. Los adaptadores se aplican sobre el checkpoint base `Franka-JAM.safetensors`, que se descarga por separado desde el repositorio privado `JAM-realworld/JAM-realrobot` (revision `de03f461ca1d532e1c4aca10decf0e09e3f731cd`). El modelo recibe como entradas imagen RGB de camara externa, la instruccion exacta de la tarea y la pose fisica sin normalizar del flange (pose10). La imagen nativa de 640x480 se rellena con 16 filas negras arriba y abajo hasta 640x512. La salida son 32 objetivos absolutos de flange en el marco base: coordenadas XYZ, dos columnas de la matriz de rotacion y apertura del gripper (0 cerrado, 1 abierto).

Los datos provienen del dataset `24jihoward/gello-franka-jam-demos` (revision `83b5cbeec3e156494bd42fb9211789bde0bb7909`). Para `task_4` se usaron 45 grabaciones de entrenamiento y 5 reservadas; para `task_5`, 44 de entrenamiento y 5 reservadas. Se excluyo una grabacion incompleta de `task_5` (`session_098c666c`, `000036.npz` tras conversion) por no contener agarre ni elevacion, preservando la pertenencia a validacion. Los limites de normalizacion se calculan solo con grabaciones de entrenamiento.

El entrenamiento parte siempre del base preentrenado Franka-JAM, con semilla 42, batch global de 8, learning rate de `1e-5` para el adaptador de accion y `3e-6` para el de video, y 120.000 ventanas muestreadas con repeticion hasta el checkpoint. Los objetivos son la siguiente pose de flange alcanzada y el siguiente comando binario de gripper. Se aplico una migracion de ejecucion a microbatches mayores que preserva los momentos del optimizador y el recuento real de actualizaciones, pero que cambia el orden de muestreo aleatorio y el orden de acumulacion en coma flotante, por lo que no constituye una continuacion bit a bit del calendario anterior. Los detalles y comprobaciones numericas estan en `training_provenance.json`.

## Capacidades

- Manipulacion robotica de proposito unico: cada adaptador resuelve una unica tarea de pick-and-place.
- Prediccion de pose absoluta del flange y apertura del gripper a partir de percepcion visual.
- Integracion con la interfaz GELLO para teleoperacion y ejecucion sobre un Franka real.
- Consumo de instrucciones de tarea en texto (`prompt.txt`) junto con la observacion visual.
- Exportacion como adaptadores LoRA independientes, aplicables sobre un base compartido.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente LLM.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision-language general, audio).

## Casos de uso

- Pick-and-place en laboratorio robotico: servir `task_4` o `task_5` mediante `serve_resident.py` con el perfil `franka` permite ejecutar una tarea de recogida y deposito sobre un brazo Franka real, con la politica emitiendo trayectorias de flange a partir de vision e instruccion.
- Investigacion en imitation learning: la entrega sirve como linea base reproducible para estudiar como LoRA por tarea adapta un modelo fundacional robotico, con semilla, learning rates y procedencia documentados.
- Estudio de adaptacion eficiente de parametros: al tratarse de 1.216 tensores FP32 por adaptador sobre un base congelado, es un caso practico para medir coste de fine-tuning frente a reentrenamiento completo.
- Desarrollo de pipelines de teleoperacion GELLO: el cliente `tools/jam_gello_client.py` y el formato de entrada/salida permiten construir bucles de control que combinan camara externa, pose del flange y comandos de gripper.
- Validacion de artefactos y paridad de servido: los scripts auxiliares (`prepare_serving_root.py`, `serve_resident.py`) y las comprobaciones de hashes son utiles para verificar que un despliegue reproduce el entorno de referencia antes de enviar consignas a hardware real.
- Reproduccion de experimentos de robotica: el paquete incluye `config.yaml`, `normalization.json`, `identity.json`, `prompt.txt` y `MANIFEST.json`, lo que facilita reconstruir el entorno exacto de inferencia para replicar o auditar resultados.
- Formacion y demostracion docente: despliegue local en el puerto 8000 o 8001 para mostrar en un aula el ciclo completo de percepcion, politica y accion sobre un robot de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe comprobaciones de validacion que no constituyen una medida de exito fisico de la tarea: verificacion de tensores finitos, inferencia offline sobre grabaciones reservadas a traves del cliente HTTP GELLO real, paridad entre servidor residente y referencia, y comprobaciones de transicion de cierre del gripper con semilla de inferencia 0. Para cada tarea se empleo un inicio seleccionado uniformemente de cada una de las cinco grabaciones reservadas, mas sus ventanas de transicion de cierre. Los resultados numericos y su alcance estan en `inference_validation.json` y `close_transition_validation.json`. Estos controles establecen la validez del artefacto y de la interfaz, no el exito fisico de la tarea.

## Requisitos de hardware

- Vram estimada para inferencia: no disponible en la informacion proporcionada.
- Gpu recomendadas: no disponible. No se especifica hardware objetivo ni en la model card ni en los resultados de busqueda.
- Compatibilidad con GPU de consumo: no disponible.
- Tamano del paquete de adaptadores: 1,0 GB en el repositorio; requiere ademas el checkpoint base `Franka-JAM.safetensors`, distribuido por separado.
- Opciones de despliegue documentadas: `serve_resident.py` con perfil `franka` y cliente HTTP GELLO (`tools/jam_gello_client.py`), sobre el repositorio `JAM-realrobot` en la rama `inference-gello-client` y commit `b2e77d77d9590798fb0856ee214e8255c32e7ce4`.
- Latencia y throughput: no disponibles.
- Requisitos de acceso: es necesario disponer de una cuenta con acceso al repositorio base privado `JAM-realworld/JAM-realrobot` y montar el entorno descrito en el repositorio de GitHub.
- Integridad: se recomienda fijar la revision del commit de Hugging Face con `--revision <commit>` para despliegues repetibles, y verificar los archivos con `SHA256SUMS.json`. El SHA256 del base es `bd6317317d5cd0f4f3e27bbc01a2e2388601638cdea1492312b333b5cff772fe`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos comparativos frente a otros modelos roboticos o adaptadores, y los resultados de busqueda no contienen referencias utiles a politicas de manipulacion comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona de forma simbolica y no admite tool calling ni uso como agente conversacional.
- Cada adaptador esta especializado en una unica tarea; no hay evidencia de generalizacion a otras instrucciones ni de composicion de tareas.
- Las validaciones publicadas no miden el exito fisico de la tarea, solo la validez del artefacto y de la interfaz. No deben interpretarse como una tasa de exito.
- El repositorio se llama JAM-20K-single, pero los checkpoints entregados son de 15.000 actualizaciones; no son la version final de 20K.
- Los archivos son adaptadores LoRA, no modelos completos. Requieren el base `Franka-JAM.safetensors`, cuyo acceso esta restringido al repositorio privado `JAM-realworld/JAM-realrobot`.
- La licencia no esta especificada, por lo que no puede confirmarse la viabilidad de uso comercial.
- La normalizacion es especifica por tarea. No se deben intercambiar archivos entre `task_4` y `task_5`, ni aplicar normalizacion una segunda vez en el cliente, ya que se obtendrian salidas incorrectas.
- El despliegue exige que la colocacion de camara, la calibracion herramienta/flange, el backend del gripper, la temporizacion de ejecucion y los limites del controlador se mantengan consistentes con la configuracion de referencia.
- La migracion de ejecucion a microbatches mayores no es continuacion bit a bit del entrenamiento previo, lo que puede afectar a la reproducibilidad exacta de resultados.
- No se documentan idiomas soportados; las instrucciones de tarea incluidas estan en ingles.
- No se incluyen datos crudos, archivos de reanudacion del optimizador ni credenciales privadas en el paquete de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Recharge23/JAM-20K-single
- Repositorio de inferencia JAM-realrobot (rama `inference-gello-client`): https://github.com/lixuan27/JAM-realrobot
- Modelo base Franka-JAM (repositorio privado): https://huggingface.co/JAM-realworld/JAM-realrobot
- Dataset de demostraciones GELLO para Franka: https://huggingface.co/datasets/24jihoward/gello-franka-jam-demos
