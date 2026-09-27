# apirrone/velstand_carpet

## Resumen

velstand_carpet es una politica de control para el robot cuadrupedo microduck, desarrollada por Antoine Pirrone (apirrone), ingeniero de I+D en Pollen Robotics y doctor en informatica especializado en vision por computador y aprendizaje profundo. No se trata de un modelo de lenguaje, sino de una politica de locomocion entrenada mediante aprendizaje por refuerzo que se exporta a ONNX y se carga directamente en el robot como una "marcha" o gait dentro de un slot de politica del daemon.

El modelo recibe una observacion de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz. Su caracteristica principal es que es una politica perpetua: una vez cargada, el robot la ejecuta de forma continua hasta que se le indique lo contrario, lo que la hace adecuada para desplazamientos sostenidos sobre superficies tipo alfombra blanda (de ahi el nombre "soft carpet" de la rama de entrenamiento).

La relevancia de este modelo es acotada pero concreta: forma parte del ecosistema open source de microduck, un cuadrupedo de bajo coste orientado a robotica educativa y de investigacion. El hecho de que el normalizador de observaciones este embebido en el propio fichero ONNX simplifica el despliegue, ya que el usuario puede alimentar observaciones en crudo sin preprocesado externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (politica entrenada por aprendizaje por refuerzo; la model card no especifica la topologia de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | No disponible (exportacion a ONNX; la model card no detalla la precision) |
| Idiomas soportados | No aplica (politica de control motor, no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (policy.onnx) acompanado de manifest.json segun el esquema 2 del manifiesto de politicas de microduck |

Datos adicionales: espacio de acciones de 14 dimensiones, frecuencia de control de 50 Hz, tamano del repositorio 0.0 GB, pipeline declarado reinforcement-learning, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red mas alla de indicar que se trata de una politica entrenada por aprendizaje por refuerzo y exportada a ONNX. Se sabe que el entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, en la rama `soft_carpet`, commit `695f3b751`. No se especifican el numero de tokens, episodios ni pasos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino posteriores como RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de politicas de control).

Un detalle tecnico relevante es que el normalizador de observaciones esta integrado dentro del propio `policy.onnx`, de modo que el consumidor de la politica debe alimentar observaciones sin normalizar. El manifiesto `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de una marcha continua (politica perpetua) para el cuadrupedo microduck: la politica se ejecuta indefinidamente hasta que se sustituye o se detiene.
- Control motor de ciclo cerrado: consume observaciones de 61 dimensiones y produce comandos de 14 dimensiones a 50 Hz.
- Desplazamiento sobre superficies blandas, segun indica la rama de entrenamiento `soft_carpet`.
- Integracion con el daemon de microduck mediante el comando `robotctl policy load <slot> apirrone/velstand_carpet`.
- Normalizacion de observaciones incorporada en el grafo ONNX, lo que permite alimentar observaciones en crudo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni procesamiento de vision, audio o lenguaje, ya que no es un modelo de lenguaje ni un modelo multimodal.
- No se documenta un modo "thinking" ni ninguna capacidad cognitiva.

## Casos de uso

- Locomocion sostenida en robot cuadrupedo microduck: cargar la politica en un slot y dejar que el robot camine de forma continua sobre alfombra o superficies blandas durante sesiones largas, sin necesidad de reenviar comandos periodicamente.
- Demostraciones educativas de robotica: al ser una politica perpetua y de carga sencilla, sirve para mostrar en talleres como se despliega una politica entrenada por RL en hardware real mediante un unico comando.
- Investigacion en aprendizaje por refuerzo aplicado a locomocion: la politica puede usarse como linea base o punto de comparacion frente a otras marchas del mismo autor, como `apirrone/new_velstand_test`.
- Pruebas de robustez de hardware: ejecutar la marcha de forma continua permite evaluar la resistencia mecanica, el consumo de bateria y el comportamiento termico de los actuadores del microduck en condiciones repetibles.
- Benchmarking interno de politicas: al convivir en el mismo ecosistema de manifiestos y slots, la politica se puede alternar con otras para comparar estabilidad y velocidad de desplazamiento sobre la misma superficie.
- Integracion en pipelines de robotica basados en ONNX: al ser un grafo ONNX autocontenido, puede cargarse con ONNX Runtime en un PC de control o en el propio computador del robot para validacion previa al despliegue fisico.
- Recoleccion de datos de marcha: usar la politica como generador de trayectorias para registrar observaciones y acciones que alimenten entrenamientos posteriores o modelos de imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, velocidad de desplazamiento, estabilidad ni comparaciones cuantitativas con otras politicas. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma publicada. Dado que el repositorio ocupa 0.0 GB y la red consume 61 entradas y 14 salidas a 50 Hz, el grafo ONNX es previsiblemente muy pequeno (del orden de kilobytes a pocos megabytes), por lo que la inferencia en CPU es viable; se trata de una estimacion cualitativa, no de un dato confirmado por el autor.
- GPU recomendadas: no disponibles. Para este tipo de politica no se requiere GPU; el calculo es perfectamente asumible por CPU.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; no se necesita una RTX 4090 ni similar. La politica esta pensada para ejecutarse en el computador de a bordo del microduck o en un PC de control modesto.
- Opciones de despliegue: ONNX Runtime como via principal, dado que el artefacto distribuido es `policy.onnx`. El despliegue en robot se realiza con el daemon de microduck mediante `robotctl policy load <slot> apirrone/velstand_carpet`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La unica cifra confirmada es la frecuencia de control de 50 Hz, lo que implica que la politica debe producir una accion cada 20 ms.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apirrone/velstand_carpet | Politica RL ONNX para microduck | 61-D / 14 acciones | 50 Hz | No disponible | HuggingFace |
| apirrone/new_velstand_test | Politica RL ONNX para microduck | No disponible | No disponible | No disponible | HuggingFace |
| Otras politicas del ecosistema microduck_rl | Politica RL | No disponible | No disponible | No disponible | Repositorio pollen-robotics/microduck_rl |

No se dispone de datos publicos suficientes para comparar parametros, contexto o rendimiento con alternativas de otras familias de modelos. La comparacion queda limitada a la propia familia de politicas del mismo autor y del mismo robot.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la model card ni en los metadatos de HuggingFace, no hay autorizacion explicita para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de evaluacion publica: 0 descargas y 0 likes, sin benchmarks ni informes de terceros. El comportamiento real sobre hardware fisico no esta validado mas alla de lo que afirme el autor.
- Especificidad de hardware: la politica esta entrenada para el microduck concreto, con 61 dimensiones de observacion y 14 de accion a 50 Hz. No es transferible a otros robots sin reentrenamiento.
- Especificidad de dominio: la rama de entrenamiento `soft_carpet` sugiere un entorno de alfombra o superficie blanda. El rendimiento en otras superficies (cesped, grava, suelo duro) no esta documentado.
- Politica perpetua sin condicion de parada descrita: la model card indica que se ejecuta "hasta que se le indique lo contrario", pero no detalla el mecanismo de parada ni condiciones de seguridad.
- Sin capacidades de lenguaje, vision ni razonamiento: no debe evaluarse con metricas tipo MMLU, HumanEval o GSM8K, que no aplican.
- Riesgo de sobreajuste al entorno de entrenamiento: al no publicarse el numero de episodios ni la diversidad de dominios aleatorizados, no se puede estimar la robustez ante perturbaciones.
- Fecha de creacion registrada como 2026-09-26 y actualizacion como 2026-09-26, lo que puede indicar metadatos inconsistentes en el repositorio.
- Sin garantias de mantenimiento: la rama y el commit de entrenamiento se citan de forma puntual, sin indicacion de que el modelo vaya a actualizarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apirrone/velstand_carpet
- Perfil del autor en HuggingFace: https://huggingface.co/apirrone/models
- Otro modelo del mismo autor: https://huggingface.co/apirrone/new_velstand_test
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: pollen-robotics/microduck_rl (rama `soft_carpet`, commit `695f3b751`)
- Perfil del autor en GitHub: https://github.com/apirrone
- Proyecto Open Duck Mini: https://github.com/apirrone/Open_Duck_Mini
- Open Duck reference motion generator: https://deepwiki.com/apirrone/Open_Duck_reference_motion_generator/2-installation-and-setup
