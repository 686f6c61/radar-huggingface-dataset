# LvQinghai/microduck-m3-velw3

## Resumen

`LvQinghai/microduck-m3-velw3` es una politica de control (policy) de locomocion entrenada mediante aprendizaje por refuerzo para el robot cuadrupedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de proposito general: es una red neuronal exportada a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control, ejecutandose a 50 Hz sobre el robot. El autor es el usuario de HuggingFace LvQinghai y el modelo se publica bajo la libreria `onnx` con el pipeline declarado `reinforcement-learning`.

La variante concreta es `m3-velw3`, una marcha de velocidad ("velocity walking") en la que el peso del termino de recompensa `track_linear_velocity` se incremento de 2.0 a 3.0, con un 70% de entrenamiento en direccion frontal a 0.30 m/s. Se describe como una politica "perpetua": una vez cargada, el robot camina de forma continua hasta que se le indique lo contrario, y ocupa la ranura `walk` del sistema de politicas del daemon de microduck.

Su relevancia es acotada pero clara para el nicho de robotica con RL: es un artefacto reproducible y directamente desplegable (incluye el normalizador de observaciones dentro del propio `policy.onnx`, de modo que se alimentan observaciones en crudo) vinculado a un repositorio de entrenamiento concreto (`pollen-robotics/microduck_rl`, rama `develop`, commit `d849ea115`, checkpoint `7249`). No hay informacion publicada sobre benchmarks, licencia, idiomas ni numero de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada con aprendizaje por refuerzo, exportada a ONNX (topologia interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de 61 dimensiones de observacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una politica de control para locomocion, no un transformer ni un modelo de lenguaje. La informacion disponible no detalla la topologia de la red (numero de capas, anchura, tipo de activaciones) ni el algoritmo de RL empleado; solo se sabe que el artefacto final es un grafo ONNX y que el normalizador de observaciones esta embebido en `policy.onnx`, por lo que la entrada debe ser la observacion en crudo del robot, sin preprocesado externo por parte del usuario.

El entrenamiento se realizo sobre la tarea `Mjlab-Velocity-Flat-MicroDuck`, dentro del repositorio `pollen-robotics/microduck_rl` (rama `develop`, commit `d849ea115`, checkpoint `7249`). La tarea corresponde a locomocion de velocidad en terreno plano. La variante `velw3` se distingue por haber elevado el peso de la recompensa `track_linear_velocity` de 2.0 a 3.0, lo que prioriza el seguimiento preciso del comando de velocidad, y por un regimen de entrenamiento con 70% de las muestras en avance frontal a 0.30 m/s. No se dispone de informacion sobre el numero de pasos de entrenamiento, la composicion del dataset de simulacion, ni sobre tecnicas de ajuste posteriores (RLHF, DPO u otras), que en este dominio no aplican.

## Capacidades

- Generacion de marcha continua: la politica se describe como "perpetua", es decir, mantiene la marcha indefinidamente hasta que se detiene o se sustituye.
- Seguimiento de velocidad lineal: control de velocidad de avance con ponderacion reforzada del termino `track_linear_velocity` (peso 3.0), con enfasis en el desplazamiento frontal.
- Control a 50 Hz: bucle de control de tiempo real con 14 acciones derivadas de 61 observaciones.
- Encapsulado del normalizador: acepta observaciones en crudo, lo que simplifica la integracion en el daemon del robot.
- Integracion con el sistema de politicas de microduck: se carga en la ranura `walk` mediante `robotctl`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento; no es un modelo de lenguaje.
- Entrenamiento especifico en terreno plano, con especializacion en avance frontal a 0.30 m/s.

## Casos de uso

- Despliegue directo en el robot microduck: cargar la politica con `sudo robotctl policy load walk LvQinghai/microduck-m3-velw3` para obtener una marcha continua en la ranura `walk`, sin necesidad de reentrenar ni de configurar preprocesado de observaciones.
- Evaluacion comparativa de checkpoints de RL: al estar vinculada a un commit y checkpoint concretos (`d849ea115`, `7249`), sirve como referencia reproducible frente a otras variantes del mismo entrenamiento para medir el efecto del peso de recompensa 2.0 frente a 3.0.
- Validacion de sim-to-real: comparar el comportamiento de esta politica entrenada en `Mjlab-Velocity-Flat-MicroDuck` sobre el robot fisico permite detectar discrepancias entre el simulador y el hardware en tareas de locomocion plana.
- Investigacion educativa en robotica con RL: uso como ejemplo funcional y de tamano reducido de una politica ONNX desplegable, util en cursos o talleres sobre aprendizaje por refuerzo aplicado a cuadrupedos.
- Pruebas de seguimiento de comandos de velocidad: escenarios donde interesa que el robot mantenga una velocidad objetivo (0.30 m/s en avance) con alta fidelidad, gracias al mayor peso del termino de seguimiento de velocidad.
- Base para ajuste fino o destilacion: al ser un artefacto ONNX pequeno y con manifiesto bien definido (esquema 2), puede servir como punto de partida para reentrenamientos con otras recompensas o para experimentos de destilacion hacia controladores mas simples.
- Integracion en pipelines de pruebas automatizadas de robotica: cargar la politica en un banco de pruebas para verificar de forma repetible que el robot ejecuta la marcha esperada tras cambios en el firmware o en el daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito de seguimiento de velocidad, ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. Al tratarse de una politica de 61 entradas y 14 salidas ejecutada a 50 Hz, es plausible su ejecucion en CPU, pero este dato no esta confirmado en la model card.
- Compatibilidad con GPU de consumo: no disponible; no se especifica ningun requisito grafico.
- Opciones de despliegue: ONNX Runtime a traves del daemon de microduck, invocando `robotctl policy load walk LvQinghai/microduck-m3-velw3`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. El unico dato temporal es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LvQinghai/microduck-m3-velw3 | Politica RL para microduck (ONNX) | no disponible | no aplica (61-D obs) | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otras politicas de la misma categoria con la que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ambito de uso muy restringido: es una politica de locomocion especifica para el robot microduck, no reutilizable como modelo de proposito general.
- Entrenamiento limitado a terreno plano y a la tarea `Mjlab-Velocity-Flat-MicroDuck`; no hay evidencia de robustez ante terrenos irregulares, pendientes o perturbaciones externas.
- Especializacion en avance frontal a 0.30 m/s (70% del entrenamiento); el rendimiento en otras velocidades o direcciones no esta documentado.
- Comportamiento "perpetuo": la politica camina hasta que se le indique lo contrario, lo que exige gestionar explicitamente la detencion en cualquier despliegue real.
- Licencia no disponible: se desconoce si se permite el uso comercial, la redistribucion o la modificacion, lo que supone un riesgo juridico para produccion.
- Sin datos de benchmarks, tasas de exito ni evaluacion de robustez; no es posible estimar su fiabilidad en el mundo real a partir de la informacion publicada.
- Cero descargas y cero likes en el momento de la consulta, sin senales de adopcion ni de validacion por parte de terceros.
- Riesgo de dependencia de version: la politica esta ligada a un commit concreto del repositorio de entrenamiento y a un daemon con manifiesto de esquema 2; cambios en el daemon o en `robotctl` podrian afectar a la carga.
- No aplica el riesgo de alucinacion ni de sesgo linguistico propio de los modelos generativos, pero si puede presentar comportamientos no deseados ante observaciones fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LvQinghai/microduck-m3-velw3
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl`, rama `develop`, commit `d849ea115` (URL exacta no disponible en la informacion proporcionada)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` del repositorio del daemon (URL exacta no disponible en la informacion proporcionada)
- Los resultados de la busqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a paginas de soporte de Microsoft).
