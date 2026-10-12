# qualiadev/microduck-roller-q2

## Resumen

Quailadev/microduck-roller-q2 es una politica de control (policy) entrenada mediante aprendizaje por refuerzo para el robot microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un controlador neuronal que se exporta a ONNX y se carga en una ranura de politica del robot para ejecutar una marcha concreta sobre rodillos. El autor es el usuario de HuggingFace qualiadev y el modelo se publica bajo la libreria microduck con pipeline declarado como robotics.

El modelo implementa una politica perpetua: una vez cargada, se ejecuta de forma continua hasta que se le indique lo contrario, a 50 Hz, tomando como entrada un vector de observacion de 61 dimensiones y produciendo 14 acciones de control. El normalizador de observaciones esta integrado dentro del propio fichero policy.onnx, de modo que el robot puede alimentar observaciones en crudo sin preprocesado adicional. El repositorio incluye tambien un manifest.json que sigue el esquema 2 del manifiesto de politicas de microduck.

La relevancia de esta ficha es acotada: se trata de un artefacto muy especifico dentro del ecosistema microduck, con cero descargas y cero likes en el momento de la consulta y un tamano de repositorio declarado de 0.0 GB. No se ha publicado informacion sobre licencia, idiomas, numero de parametros, arquitectura de red ni resultados de evaluacion, por lo que una parte importante de los apartados queda marcada como no disponible. La fecha de creacion registrada (2026-10-12) es posterior a la fecha de redaccion habitual de este tipo de fichas, lo que conviene tener en cuenta al valorar su vigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo exportada a ONNX; no se detalla la topologia de red) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (entrada de observacion de 61 dimensiones por paso de control) |
| Tipos de cuantizacion | no disponible (el sufijo "q2" del identificador no se explica en la model card) |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) y manifest.json con esquema 2 del manifiesto de politicas de microduck |
| Observacion de entrada | 61 dimensiones |
| Acciones de salida | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento | politica perpetua (se ejecuta hasta que se le indique lo contrario) |
| Entorno de entrenamiento | rodillos (rollers) |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red neuronal subyacente. Lo unico que se puede afirmar con certeza es que se trata de una politica de aprendizaje por refuerzo entrenada para control del microduck y exportada a ONNX para su despliegue en el robot. El fichero policy.onnx incorpora el normalizador de observaciones, lo que indica que la politica se entrena con observaciones normalizadas y que esa normalizacion se empaqueta junto con los pesos para simplificar la integracion en el robot. No se especifica el algoritmo de RL utilizado, el numero de pasos de entrenamiento, ni la composicion del dataset o del entorno de simulacion.

En cuanto al entrenamiento, la model card indica que el codigo procede del repositorio pollen-robotics/microduck_rl, en la rama sprint/race y en el commit 0141bf4a8. No se aportan detalles adicionales sobre hiperparametros, recompensas, tecnicas de regularizacion, destilacion ni procesos de ajuste posteriores (RLHF, DPO u otros), que por otro lado no son habituales en politicas de control robotico. Tampoco se documenta si el entrenamiento se realizo en simulacion con transferencia al mundo real (sim-to-real) o directamente sobre hardware, aunque la referencia a rodillos sugiere un montaje especifico de prueba.

## Capacidades

- Generacion de una marcha perpetua sobre rodillos: la politica produce 14 acciones de control de forma continua a 50 Hz hasta que se le ordena detenerse.
- Control basado en observaciones en crudo: gracias al normalizador integrado en policy.onnx, acepta el vector de observacion de 61 dimensiones sin preprocesado externo.
- Ejecucion como ranura de politica: se carga mediante el comando robotctl policy load en una ranura del robot, integrándose en el flujo de gestion de politicas de microduck.
- Comportamiento especifico de un entorno concreto: el comportamiento esta asociado a la condicion de rodillos declarada en la model card.
- Compatibilidad con el manifiesto de politicas: el manifest.json sigue el esquema 2 definido en docs/policy-manifest.md del repositorio del daemon.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio, ni capacidades multilingues, por tratarse de una politica de control robotico y no de un modelo de lenguaje.

## Casos de uso

- Pruebas de locomocion sobre rodillos: cargar la politica en una ranura del microduck montado sobre rodillos para validar el ciclo de control a 50 Hz y comprobar que las 14 salidas de accion se transmiten correctamente a los actuadores.
- Desarrollo y depuracion del daemon de politicas: usar este modelo como carga de prueba para verificar el comando robotctl policy load y el cumplimiento del esquema 2 del manifest.json.
- Investigacion en aprendizaje por refuerzo para robotica: emplear la politica como linea base reproducible dentro del framework pollen-robotics/microduck_rl (rama sprint/race, commit 0141bf4a8) para comparar variantes de entrenamiento.
- Benchmarking interno de politicas microduck: al ser una politica perpetua, permite medir estabilidad de la marcha en ejecuciones prolongadas sin episodios finitos.
- Docencia y prototipado educativo: dada su condicion de politica ONNX cargable en una ranura, sirve como ejemplo practico de despliegue de politicas de RL en un robot de bajo coste.
- Validacion de pipelines de normalizacion embebida: comprobar en produccion que alimentar observaciones en crudo produce el comportamiento esperado, sin capas de preprocesado adicionales.
- Nota: no se documentan casos de uso fuera del ecosistema microduck ni aplicaciones de proposito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un unico fichero ONNX correspondiente a una politica de control con 61 entradas y 14 salidas a 50 Hz, es razonable esperar inferencia en CPU, pero no se aporta ninguna cifra de consumo de memoria.
- GPU recomendadas: no disponibles. No se indica que la politica requiera aceleracion por GPU.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si el despliegue previsto es sobre CPU embebida del propio microduck o sobre un equipo auxiliar.
- Opciones de despliegue: carga en el robot mediante robotctl policy load sobre una ranura de politica; ejecucion del fichero policy.onnx a traves del runtime de microduck indicado por la libreria library_name: microduck.
- Latencia y throughput: no disponibles. El unico dato temporal conocido es la frecuencia de control objetivo de 50 Hz (periodo de 20 ms por paso), que constituye el limite superior de latencia admisible por ciclo.
- Otros frameworks (vLLM, llama.cpp, Ollama, TGI): no aplicables, dado que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualiadev/microduck-roller-q2 | no disponible | no aplicable (observacion 61-D) | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otras politicas comparables dentro del ecosistema microduck ni sobre sus parametros, contexto, rendimiento o licencia. La unica referencia de contexto es el propio repositorio pollen-robotics/microduck, que aloja la plataforma pero no se detalla en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifican los terminos de uso, lo que impide determinar si se permite el uso comercial, la redistribucion o la modificacion.
- Cero descargas y cero likes: no existe evidencia de validacion por parte de la comunidad ni de uso en produccion.
- Tamano de repositorio de 0.0 GB: conviene verificar que el fichero policy.onnx y el manifest.json estan efectivamente presentes y son accesibles antes de integrarlo.
- Ambito de aplicacion muy restringido: es una politica especifica para el microduck sobre rodillos, no un modelo de proposito general; su comportamiento fuera de ese montaje no esta documentado.
- Comportamiento perpetuo: al ejecutarse hasta que se le indique lo contrario, requiere un mecanismo externo de parada segura para evitar ejecuciones no controladas en el robot.
- Falta de informacion sobre sesgos: no aplicable en el sentido habitual de los modelos de lenguaje, pero no se documenta el comportamiento de la politica ante condiciones fuera de distribucion (por ejemplo, terreno distinto de los rodillos o perturbaciones externas).
- Riesgo de alucinacion: no aplicable; se trata de un controlador de robotica, no de un modelo generativo.
- Idiomas: no aplicable, al no procesar texto.
- Fecha de creacion registrada (2026-10-12): conviene comprobar la vigencia y el estado real del repositorio antes de depender de el.
- Sin datos de evaluacion: no hay benchmarks, metricas de seguimiento de trayectoria, tasas de exito ni tiempos de convergencia publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualiadev/microduck-roller-q2
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo referenciado: pollen-robotics/microduck_rl (rama sprint/race, commit 0141bf4a8)
- Documentacion del manifiesto de politicas: docs/policy-manifest.md en el repositorio del daemon de microduck
