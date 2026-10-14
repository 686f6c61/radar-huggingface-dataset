# q2p/microduck-sprint-race

## Resumen

sprint-race es una política de control por aprendizaje por refuerzo (RL) publicada en HuggingFace por el usuario q2p para el robot microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo: es un controlador de locomocion que recibe un vector de observacion de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado como grafo ONNX y distribuido a traves del sistema de slots de politicas del daemon `robotctl`.

La model card la describe como una politica "perpetua": una vez cargada en un slot, ejecuta la marcha de forma continua hasta que se le indique lo contrario. La tarea asociada se denomina `Mjlab-Sprint2m-MicroDuck`, lo que sugiere un objetivo de desplazamiento tipo sprint, aunque la model card no detalla la funcion de recompensa ni las metricas de exito.

Su relevancia es acotada pero concreta: forma parte del ecosistema de retos de microduck (`microduck-challenges`), un flujo de trabajo reproducible de entrenamiento en simulacion con mjlab que exporta controladores directamente desplegables en el robot. El modelo tiene 0 descargas y 0 likes, y el repositorio ocupa 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Politica de control entrenada con RL, distribuida como grafo ONNX; la model card no especifica la topologia de la red |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Espacio de observacion de 61 dimensiones; frecuencia de control de 50 Hz |
| Tipos de cuantizacion | No disponible. Se distribuye un unico `policy.onnx` sin variantes cuantizadas declaradas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Espacio de acciones | 14 acciones |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Framework | mjlab, base `mjlab-microduck 0.1.0 @ 8d0dbc94c` |
| Libreria declarada | microduck |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la topologia de red (numero de capas, anchura, tipo de capa). Lo que si documenta es el procedimiento de entrenamiento: la politica se entrena con el framework mjlab sobre la tarea `Mjlab-Sprint2m-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges`, en el commit `2b72fcaf0`, con semilla 1 y checkpoint final 1999. La configuracion declarada usa 4096 entornos simulados en paralelo y un maximo de 2000 iteraciones del agente, con registro en TensorBoard bajo el nombre de ejecucion `sprint_rA`.

Un detalle de ingenieria relevante es que el normalizador de observaciones esta integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional. El autor advierte explicitamente que el entrenamiento no es reproducible bit a bit entre maquinas: repetir el comando con el mismo codigo, el mismo `uv.lock` y la misma semilla produce una politica comparable, no los mismos pesos. No se documenta uso de RLHF ni de DPO, ni innovaciones de decodificacion (no aplican a este tipo de modelo).

## Capacidades

- Control de locomocion continua a 50 Hz para el robot microduck, con 14 grados de actuacion.
- Consumo de observaciones de 61 dimensiones en formato crudo, con normalizacion interna al grafo ONNX.
- Ejecucion perpetua: la politica no tiene condicion de parada propia, corre hasta que el operador o el daemon la detengan.
- Carga en caliente mediante slots: `sudo robotctl policy load <slot> q2p/microduck-sprint-race`.
- Portabilidad de despliegue: al ser ONNX, es agnostica respecto al runtime de inferencia del robot.
- Trazabilidad de entrenamiento: tarea, repositorio, commit, semilla, checkpoint y version base quedan registrados en la model card.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision ni audio. No es un modelo de lenguaje.

## Casos de uso

- Marcha por defecto del robot en pruebas de banco: cargar la politica en un slot y mantener el robot desplazandose de forma continua mientras se instrumentan sensores o se mide consumo de actuadores.
- Participacion en el reto `Mjlab-Sprint2m-MicroDuck`: la politica esta entrenada especificamente para esa tarea, por lo que sirve como referencia funcional dentro de la competicion o del benchmark interno de microduck-challenges.
- Baseline para comparacion: al fijar commit, semilla y configuracion de entrenamiento, permite contrastar variantes de recompensa, observaciones o hiperparametros contra una politica conocida.
- Validacion de sim-to-real: es un caso directo para evaluar la transferencia de una politica entrenada con 4096 entornos simulados al hardware fisico, midiendo degradacion de la marcha.
- Base para ajuste fino o destilado: util como punto de partida (mediante inicializacion o imitacion) para derivar otras marchas con objetivos distintos, como giros o velocidades reguladas.
- Pruebas de integracion del daemon: sirve para verificar el flujo completo de `robotctl` (slots, manifiesto de esquema 2, carga y descarga de politicas) sin depender de politicas propietarias.
- Docencia e investigacion en locomocion con RL: ejemplo completo y de extremo a extremo de un pipeline reproducible de entrenamiento y exportacion a ONNX sobre un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa final, tasa de exito, velocidad alcanzada, distancia recorrida, ni comparaciones con otras politicas. Tampoco hay datos de latencia o throughput de inferencia en el robot.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita. Al tratarse de un unico grafo ONNX contenido en un repositorio de 0,0 GB, el consumo de memoria es previsiblemente minimo, pero no hay cifra publicada.
- GPU recomendadas: no aplica para inferencia en el robot. Para reproducir el entrenamiento, la model card indica 4096 entornos en paralelo, lo que requiere aceleracion por GPU; el modelo concreto de GPU no se especifica.
- Cabe en GPU de consumo: no aplica a la inferencia. La politica esta pensada para ejecutarse en la computacion del propio robot, no en una GPU.
- Opciones de despliegue: el mecanismo oficial es el daemon del robot mediante `sudo robotctl policy load <slot> q2p/microduck-sprint-race`. Al ser ONNX, tambien puede ejecutarse con cualquier runtime compatible con ONNX, aunque la model card no documenta alternativas. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La unica cifra temporal conocida es la frecuencia de control objetivo de 50 Hz.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de microduck con las que comparar parametros, contexto o rendimiento, ni datos de benchmarks que permitan una comparacion objetiva. Como referencia de categoria, todas las politicas del ecosistema microduck comparten el mismo contrato de interfaz (61 dimensiones de observacion, 14 acciones, 50 Hz) y el mismo formato de despliegue basado en `manifest.json`, pero no se dispone de datos de rendimiento de ninguna de ellas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generacion de texto, razonamiento, codigo o capacidades conversacionales. Cualquier evaluacion como LLM seria un error de categoria.
- Sin licencia declarada. La ausencia de licencia impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en un producto.
- Sin benchmarks ni metricas de rendimiento publicadas. No hay evidencia documentada de la calidad de la marcha ni de su robustez ante perturbaciones.
- Riesgo de sobreajuste al simulador: la politica se entrena integramente en mjlab con la tarea `Mjlab-Sprint2m-MicroDuck`. No se documentan tecnicas de aleatorizacion de dominio ni resultados de transferencia al robot fisico.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible entre maquinas, por lo que no es posible regenerar exactamente los mismos pesos.
- Comportamiento perpetuo: al no tener condicion de parada interna, requiere gestion externa (daemon u operador) para detener la ejecucion.
- Metadatos incompletos: el repositorio se creo y actualizo el 2026-10-13, con 0 descargas y 0 likes, y sin datos de idiomas ni de licencia. La fecha registrada es posterior a la fecha de publicacion habitual de modelos en la plataforma, lo que conviene verificar antes de citarla.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con microduck ni con aprendizaje por refuerzo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/q2p/microduck-sprint-race
- Repositorio de retos y entrenamiento (citado en la model card): https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck (citado en la model card): https://github.com/pollen-robotics/microduck
- Documentacion del manifiesto de politicas (`docs/policy-manifest.md` en el repositorio del daemon, referenciada en la model card): no disponible como enlace directo
- No se han encontrado papers, blogs, demos ni repositorios adicionales relevantes en la busqueda web realizada.
