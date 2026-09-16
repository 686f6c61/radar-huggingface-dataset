# ABDHAM/smolvla_rescuehands_v2

## Resumen

ABDHAM/smolvla_rescuehands_v2 es un "policy" de robotica (vision-language-action, VLA) publicado en HuggingFace por el usuario ABDHAM. Se trata de un ajuste fino (finetune) del modelo base lerobot/smolvla_base, entrenado con la libreria LeRobot de HuggingFace sobre el dataset ABDHAM/rescuehands_table_v2. El modelo tiene 450.046.176 parametros (aproximadamente 450 M) almacenados en safetensors, con un repositorio de 2,6 GB, y se distribuye bajo licencia Apache 2.0.

La familia SmolVLA, a la que pertenece, se describe en la model card como un modelo vision-language-action compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo. Frente a los grandes modelos VLA de proposito general, este checkpoint esta especializado en una tarea concreta de manipulacion de mesa, lo que lo hace interesante para quien quiera reproducir un pipeline completo de entrenamiento y evaluacion de politicas roboticas con LeRobot sin necesidad de GPUs de gama alta.

El modelo esta pensado para su uso con el ecosistema LeRobot: entrenamiento mediante `lerobot-train`, evaluacion e inferencia mediante `lerobot-record` con robots tipo `so100_follower`, e integracion con el Hub de HuggingFace. Su relevancia actual es la de servir como ejemplo reproducible de finetuning de un VLA pequeno sobre un dataset propio, con despliegue potencial en hardware de consumo (la etiqueta `openvino` sugiere la posibilidad de exportacion para inferencia optimizada en CPU/edge).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); detalles internos no disponibles en la informacion proporcionada (la model card remite al paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 (segun safetensors) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se documentan cuantizaciones publicadas; el tag `openvino` sugiere exportacion a OpenVINO, pero no se especifican precisiones (FP16/INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`); tag adicional `openvino` |
| Tamano del repositorio | 2,6 GB |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | ABDHAM/rescuehands_table_v2 |
| Pipeline declarado | robotics |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card define el modelo como un VLA compacto y eficiente, orientado a obtener rendimiento competitivo con coste computacional reducido, y desplegable en hardware de consumo. No se proporcionan en la informacion disponible detalles sobre el backbone de vision-lenguaje empleado, el mecanismo de decodificacion de acciones (por ejemplo, si usa flow matching o prediccion directa de chunks de accion), ni la composicion exacta del dataset de entrenamiento. Para esos detalles, la propia model card remite al paper SmolVLA (arXiv:2506.01844) enlazado en el repositorio.

El entrenamiento se ha realizado con LeRobot sobre el dataset ABDHAM/rescuehands_table_v2, partiendo del checkpoint lerobot/smolvla_base. No se especifican en la informacion proporcionada el numero de episodios, el numero de frames, la composicion de camaras/observaciones, el numero de pasos de entrenamiento ni si se aplicaron fases de RLHF, DPO u optimizacion posterior. La model card unicamente documenta el flujo de trabajo de LeRobot para entrenar desde cero (`lerobot-train`, con `policy.type=act` en el ejemplo generico mostrado) y para evaluar la politica (`lerobot-record`).

## Capacidades

- Generacion de acciones roboticas de manipulacion a partir de observaciones visuales e instrucciones en lenguaje, en el marco de un modelo vision-language-action.
- Ejecucion de politicas de control para brazos roboticos tipo `so100_follower`, segun el flujo de evaluacion documentado por LeRobot.
- Especializacion en la tarea registrada en el dataset ABDHAM/rescuehands_table_v2 (manipulacion de mesa); no se detalla el conjunto exacto de habilidades aprendidas.
- Integracion nativa con el ecosistema LeRobot: entrenamiento, evaluacion, grabacion de episodios y publicacion de checkpoints en el Hub.
- Posible exportacion y ejecucion optimizada mediante OpenVINO, de acuerdo con el tag del repositorio.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio o modo "thinking": no disponible (no es un modelo conversacional; es una politica robotica).
- Capacidades multilingues: no disponible (no se documenta ningun idioma de instrucciones).

## Casos de uso

- Manipulacion de mesa con brazos de bajo coste: el modelo puede ejecutarse sobre un robot `so100_follower` mediante `lerobot-record`, lo que permite montar una celda de pick-and-place con hardware accesible.
- Investigacion en VLA y reproducibilidad: sirve como punto de partida para estudiar como se comporta un finetune de SmolVLA sobre un dataset propio frente al modelo base lerobot/smolvla_base.
- Finetuning adicional sobre dominios nuevos: al ser un checkpoint LeRobot con safetensors, se puede continuar el entrenamiento con `lerobot-train` sobre otros datasets sin reentrenar desde cero.
- Evaluacion comparativa de politicas: util como baseline especializado en una tarea concreta frente a politicas genericas (por ejemplo, ACT) en experimentos controlados dentro de LeRobot.
- Despliegue en edge o hardware de consumo: con 450 M de parametros y etiqueta `openvino`, es candidato a inferencia en equipos sin GPU dedicada o con GPUs modestas, reduciendo el coste por inferencia.
- Docencia y formacion en robotica con IA: permite a estudiantes recorrer el ciclo completo (dataset, entrenamiento, evaluacion con robot real o simulado) con un modelo de tamano manejable.
- Automatizacion de tareas repetitivas de laboratorio: recogida y colocacion de objetos sobre tabla en entornos controlados, donde la iluminacion y la posicion de camara se mantienen estables.
- Banco de pruebas para pipelines de evaluacion: sirve para validar infraestructura de grabacion de episodios, metricas de exito y versionado de checkpoints en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones numericas con otras politicas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Los resultados de busqueda web devueltos no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32, aproximadamente 1,8 GB (450 M de parametros x 4 bytes); en BF16/FP16, alrededor de 0,9 GB; en INT8, en torno a 0,45 GB. Son estimaciones de calculo propio, no datos publicados por el autor.
- VRAM total para inferencia: no disponible. Depende del backend, del numero de camaras y de la resolucion de las observaciones, que no se documentan.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de 450 M de parametros, cabe con holgura en GPUs de consumo como una RTX 3060, RTX 4060 o RTX 4090; no requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, segun el propio planteamiento del modelo base (desplegable en hardware de consumo). No se especifica el modelo minimo soportado.
- Opciones de despliegue: libreria `lerobot` (integracion oficial del repositorio), PyTorch y, segun el tag `openvino`, exportacion a OpenVINO. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a politicas roboticas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ABDHAM/smolvla_rescuehands_v2 | 450.046.176 | no disponible | VLA (finetune) | Apache 2.0 | HuggingFace (0 descargas) | Finetune sobre dataset propio de manipulacion de mesa |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | VLA (base) | no disponible | HuggingFace (modelo base referenciado) | Punto de partida del finetune |
| ACT (policy tipo `act` de LeRobot) | no disponible | no disponible | Policy de imitacion (no VLA) | no disponible | Implementacion en LeRobot | Aparece como ejemplo generico de entrenamiento en la model card |

No se dispone de datos de rendimiento, contexto ni licencia de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a tipo de modelo y procedencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay tasas de exito, curvas de entrenamiento ni benchmarks, lo que impide estimar su rendimiento real.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de terceros.
- Especializacion estrecha: al ser un finetune sobre un dataset concreto de manipulacion de mesa, es probable que generalice mal a otras tareas, objetos, iluminaciones o disposiciones de camara. No se documenta el grado de generalizacion.
- Riesgo de sobreajuste al montaje fisico de grabacion: cambios en la posicion de la camara, la mesa o el robot pueden degradar el comportamiento de forma significativa.
- No es un modelo de lenguaje: no debe usarse para generacion de texto, razonamiento, codigo ni atencion al cliente.
- Idiomas: no disponible. Se desconoce en que idioma deben formularse las instrucciones de lenguaje, si aplica.
- Contexto: no disponible. Se desconoce la longitud de secuencia soportada y el tamano del chunk de acciones.
- Documentacion incompleta: la model card reutiliza la plantilla generica de LeRobot e incluso muestra un ejemplo de entrenamiento con `policy.type=act`, no con SmolVLA, lo que puede inducir a confusion sobre el procedimiento exacto.
- Datos de entrenamiento no auditados: no se describen la procedencia, el consentimiento, la composicion ni posibles sesgos del dataset ABDHAM/rescuehands_table_v2.
- Licencia: Apache 2.0, por lo que el uso comercial esta permitido en principio; conviene verificar las condiciones del modelo base y del dataset, no detalladas en la informacion disponible.
- Seguridad fisica: cualquier despliegue en un robot real requiere limites de par, paradas de emergencia y validacion en entorno controlado antes de operar cerca de personas.
- Fechas del repositorio inusuales: creacion y actualizacion el 2026-09-16, sin historial adicional que permita evaluar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ABDHAM/smolvla_rescuehands_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ABDHAM/rescuehands_table_v2
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
