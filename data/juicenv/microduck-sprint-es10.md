# juicenv/microduck-sprint-es10

## Resumen

microduck-sprint-es10 es una política de control (gait) para el robot cuadrúpedo microduck de Pollen Robotics, no un modelo de lenguaje. Se trata de un fine-tune de la política suraj-phanindra/microduck-sprint-hc2, que a su vez deriva de namenu/microduck-arena, y ha sido ajustada mediante estrategias de evolución (evolution strategies) sobre el scorer de sprint de la Arena. El resultado es una marcha que recorre el sprint de 2 metros en 0,888 s, frente a los 0,892 s del modelo padre.

El modelo se distribuye como una red neuronal exportada a ONNX (policy.onnx) junto con un manifest.json que sigue el esquema 2 del manifiesto de políticas de microduck. Consume observaciones de 61 dimensiones, emite 14 acciones y opera a 50 Hz. Es una política perpetua: una vez cargada en una ranura de política ("policy slot"), se ejecuta hasta que se le indique lo contrario.

Su relevancia es acotada y muy específica: sirve como checkpoint de referencia para investigación en locomoción con aprendizaje por refuerzo y como participante en la microduck Arena. El repositorio es de tamano reducido (0,0 GB reportados), con 5 descargas y 0 "likes" en el momento de la consulta, por lo que no existe una validación amplia por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye como red neuronal exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de 61 dimensiones de observacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) mas manifest.json (esquema 2 del manifiesto de politicas) |
| Dimension de observacion | 61 |
| Espacio de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Tarea | sprint de 2 m (locomocion, politica perpetua) |
| Modelo base | suraj-phanindra/microduck-sprint-hc2 (relacion: finetune) |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

No se documenta la topologia concreta de la red en la informacion disponible. Lo que si se conoce es el flujo de entrenamiento: la politica parte de suraj-phanindra/microduck-sprint-hc2 (que registro 0,892 s en el sprint de 2 m y que a su vez proviene de namenu/microduck-arena) y se ajusta mediante estrategias de evolucion sobre el scorer de sprint de la Arena, alcanzando 0,888 s. El entrenamiento se realizo en el repositorio pollen-robotics/microduck_rl, rama hannes-ft, commit 3c0598cae.

El artefacto desplegable integra el normalizador de observaciones dentro de policy.onnx, de modo que el consumidor debe alimentar observaciones crudas y el propio modelo se encarga de la normalizacion. No hay constancia de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no es un modelo generativo de texto. Cualquier detalle adicional sobre numero de parametros, capas o funcion de recompensa no esta disponible.

## Capacidades

- Ejecucion de una marcha de sprint de 2 m de forma perpetua, sin condicion de parada propia.
- Control de locomocion a partir de un vector de observacion de 61 dimensiones.
- Emision de 14 acciones de control a 50 Hz.
- Normalizacion de observaciones integrada en policy.onnx: acepta observaciones crudas.
- Carga en el robot como ranura de politica mediante `sudo robotctl policy load <slot> juicenv/microduck-sprint-es10`.
- Compatibilidad con el manifiesto de politicas de microduck, esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en locomocion con aprendizaje por refuerzo: sirve como checkpoint de referencia para comparar politicas de sprint o como punto de partida para nuevos experimentos de fine-tuning.
- Participacion en la microduck Arena: la politica se carga como ranura y compite por el mejor tiempo en el sprint de 2 m (0,888 s registrados).
- Fine-tuning con estrategias de evolucion: al derivar de un flujo de ES sobre el scorer de la Arena, es un candidato natural para seguir optimizando la misma metrica.
- Pruebas de integracion del pipeline `robotctl` y del manifiesto de politicas: permite validar la carga de politicas y el consumo de observaciones crudas con normalizador embebido.
- Evaluacion de robustez de politicas perpetuas: al no detenerse por si sola, es util para estudiar comportamiento a largo plazo y posibles derivas de la marcha.
- Reproducibilidad de experimentos: el commit y la rama de entrenamiento documentados (pollen-robotics/microduck_rl, rama hannes-ft, commit 3c0598cae) permiten intentar reproducir el ajuste.
- Comparativa de gaits en un mismo robot: confrontar esta politica con su modelo padre u otras variantes sobre la misma plataforma microduck.

## Benchmarks y rendimiento

Unicamente se dispone de la metrica de la propia competicion (sprint de 2 m). No hay resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que ademas no aplican a un controlador de locomocion.

| Modelo | Tarea | Metrica | Resultado |
|---|---|---|---|
| namenu/microduck-arena | sprint de 2 m | tiempo | no disponible en la informacion |
| suraj-phanindra/microduck-sprint-hc2 (padre) | sprint de 2 m | tiempo | 0,892 s |
| juicenv/microduck-sprint-es10 (este) | sprint de 2 m | tiempo | 0,888 s |

La mejora del fine-tune respecto al modelo padre es de 0,004 s sobre el sprint de 2 m.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano de repositorio reportado es de 0,0 GB, lo que sugiere un artefacto de muy pocos megabytes, pero no se confirma el numero de parametros.
- GPU recomendadas: no disponible en la informacion.
- Compatibilidad con GPU de consumo: no disponible; por el tipo de tarea (politica de control a 50 Hz) y el formato ONNX, es plausible que se ejecute en CPU o en hardware embebido, pero esto no esta confirmado en la documentacion disponible.
- Plataforma de destino: robot microduck de Pollen Robotics, con carga de politicas a traves del demonio y de `robotctl`.
- Opciones de despliegue: runtime ONNX para `policy.onnx`; integracion mediante el manifiesto de politicas de microduck. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la politica opera a 50 Hz (periodo de 20 ms por ciclo de control); no se publican cifras de latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Relacion | Tarea | Tiempo sprint 2 m | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-sprint-es10 | este modelo | sprint de 2 m | 0,888 s | no disponible | HuggingFace (5 descargas) |
| suraj-phanindra/microduck-sprint-hc2 | modelo base | sprint de 2 m | 0,892 s | no disponible | HuggingFace |
| namenu/microduck-arena | origen de la cadena | sprint / Arena | no disponible | no disponible | HuggingFace |

No se dispone de datos de otros controladores de locomocion comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Politica perpetua: una vez cargada se ejecuta indefinidamente; requiere una parada explicita por parte del operador o del sistema de control.
- Especificidad de plataforma: esta disenada para el robot microduck (61-D de observacion, 14 acciones, 50 Hz) y no es portable directamente a otros robots o morfologias.
- Ausencia de documentacion de arquitectura: no se detallan numero de parametros, capas ni funcion de recompensa, lo que dificulta auditar su comportamiento.
- Riesgo de comportamiento no modelado: al ser una politica entrenada para una tarea concreta (sprint), puede presentar derivas o fallos fuera de las condiciones de la Arena; no se documentan estudios de robustez.
- No aplica a tareas de lenguaje, razonamiento, codigo o vision; es un controlador de locomocion.
- Validacion comunitaria minima: 5 descargas y 0 "likes", sin issues ni discusiones documentadas.
- La metadata de HuggingFace muestra una fecha de creacion en 2026, lo que constituye una anomalia del registro que conviene tener en cuenta al citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-sprint-es10
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-sprint-hc2
- Origen de la cadena: https://huggingface.co/namenu/microduck-arena
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl (rama hannes-ft, commit 3c0598cae)
- Documentacion del manifiesto de politicas: docs/policy-manifest.md en el repositorio del demonio
