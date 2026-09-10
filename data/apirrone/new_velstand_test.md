# apirrone/new_velstand_test

## Resumen

new_velstand_test es una politica de control (policy) de aprendizaje por refuerzo publicada en HuggingFace por el usuario apirrone, orientada al robot cuadrupedo open source microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es un controlador neuronal exportado a ONNX que mapea una observacion de 61 dimensiones a 14 acciones, ejecutandose a 50 Hz. Su proposito es producir una marcha (gait) perpetua, es decir, un patron de locomocion que se mantiene activo indefinidamente hasta que el operador lo detiene o carga otra politica en el slot correspondiente.

El artefacto se distribuye como un fichero `policy.onnx` con el normalizador de observaciones ya integrado, de modo que el consumidor solo debe alimentar observaciones en crudo. Se acompana de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck descrito en el repositorio del daemon. La carga en el robot se realiza mediante el comando `robotctl policy load <slot> apirrone/new_velstand_test`.

La relevancia de esta ficha es acotada: se trata de un repositorio de prueba (el propio nombre incluye `test`), con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin model card detallada mas alla de los datos de entrenamiento. La informacion publica disponible es muy limitada, por lo que la mayor parte de las especificaciones tecnicas aparecen como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (politica de aprendizaje por refuerzo exportada a ONNX; no se especifica la topologia de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; ventana de observacion de 61 dimensiones por paso de control) |
| Tipos de cuantizacion | No disponible (se distribuye un unico artefacto ONNX) |
| Idiomas soportados | No disponible (no aplica a un controlador de robot) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de politicas de microduck |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red en la informacion proporcionada. Lo unico verificable es la interfaz de la politica: entrada de 61 dimensiones (observacion), salida de 14 dimensiones (acciones) y frecuencia de control de 50 Hz. El modelo se exporta a ONNX con la libreria `onnx` declarada y con el normalizador de observaciones embebido en el propio grafo, de forma que la normalizacion no forma parte del pipeline del consumidor. El `manifest.json` asociado sigue el esquema 2 definido en `docs/policy-manifest.md` del repositorio del daemon de microduck.

En cuanto al entrenamiento, la model card indica que el codigo procede del repositorio `pollen-robotics/microduck_rl`, rama `protective_fall`, commit `d3edc1fa1`. No se especifica el numero de pasos de entrenamiento, el simulador empleado, la composicion de recompensas, el algoritmo de RL ni si hubo fases de ajuste posteriores. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras), lo cual es coherente con el caracter de prueba del repositorio.

## Capacidades

- Generacion de locomocion continua: la politica implementa una marcha perpetua, descrita en la model card como "runs until told otherwise", es decir, se mantiene activa hasta recibir una orden de parada o de sustitucion.
- Control a 50 Hz: el bucle de inferencia esta pensado para ejecutarse en tiempo real a esa frecuencia sobre el robot microduck.
- Mapeo directo observacion-accion: consume 61 valores de observacion en crudo y emite 14 acciones, sin preprocesado externo de normalizacion.
- Integracion con el daemon de microduck: se carga en un slot de politica mediante `robotctl policy load`.
- Portabilidad de inferencia: al estar en formato ONNX, puede ejecutarse en cualquier runtime compatible con ONNX (ONNX Runtime, etc.).
- No dispone de tool calling, function calling, capacidades de agente, multilingues, vision, audio ni modo de razonamiento extendido, ya que no es un modelo de lenguaje.

## Casos de uso

- Locomocion de base en el cuadrupedo microduck: cargar la politica en un slot con `robotctl policy load` para que el robot mantenga una marcha continua durante sesiones de operacion, dado que la politica esta disenada para no detenerse por si sola.
- Investigacion en aprendizaje por refuerzo aplicado a robotica: servir como punto de partida reproducible (rama y commit identificados) para comparar variantes de entrenamiento sobre el mismo robot y la misma interfaz de 61 observaciones y 14 acciones.
- Pruebas de integracion del pipeline de despliegue: validar el flujo completo de carga de politicas, lectura del `manifest.json` conforme al esquema 2 y ejecucion del grafo ONNX en el daemon antes de desplegar politicas definitivas.
- Evaluacion de politicas en simulacion: al ser ONNX autocontenido, puede insertarse en un bucle de simulacion que genere observaciones de 61 dimensiones y consuma las 14 acciones, lo que permite estudiar sim-to-real sin reentrenar.
- Comparacion de marchas en el mismo hardware: cargar esta politica y alternarla con otras en el mismo slot para medir diferencias de comportamiento en el mismo robot y frecuencia de control.
- Docencia y laboratorios de robotica: usar un artefacto pequeno y de carga sencilla para ilustrar como se exporta una politica de RL a ONNX y como se integra en un robot real.
- Estudio de comportamiento ante caidas: la rama de entrenamiento se denomina `protective_fall`, por lo que el artefacto puede emplearse como referencia en experimentos sobre reacciones del robot en situaciones de perdida de estabilidad, siempre que se valide experimentalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de recompensa media, tasa de exito, velocidad de marcha, consumo energetico ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada: no disponible. El numero de parametros de la red no se especifica, por lo que no puede calcularse el consumo de memoria de forma rigurosa.
- Naturaleza del artefacto: al ser un controlador con 61 entradas y 14 salidas y un unico fichero ONNX, es previsible que la inferencia sea ligera y pueda ejecutarse en CPU, pero este extremo no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible. No se documenta ningun requisito de aceleracion por GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el propio robot a traves del daemon de microduck (`robotctl policy load <slot> apirrone/new_velstand_test`) y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: se conoce la frecuencia de control objetivo de 50 Hz (20 ms por ciclo), pero no se publican mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / interfaz | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apirrone/new_velstand_test | No disponible | 61 observaciones, 14 acciones, 50 Hz | No disponible | No disponible | HuggingFace (0 descargas, 0 likes) |
| Otras politicas de microduck | No disponible | No disponible | No disponible | No disponible | No se identifican en la informacion proporcionada |
| Alternativas de RL para cuadrupedos | No disponible | No disponible | No disponible | No disponible | No se identifican en la informacion proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita no puede asumirse permiso de uso comercial ni de redistribucion; es necesario contactar con el autor antes de cualquier uso en produccion.
- Repositorio de prueba: el nombre `new_velstand_test` y el hecho de tener cero descargas y cero likes sugieren que se trata de un artefacto experimental no validado por terceros.
- Trazabilidad parcial del entrenamiento: se indica repositorio, rama y commit, pero no hiperparametros, simulador, funcion de recompensa ni criterios de evaluacion, lo que dificulta reproducir o auditar el comportamiento.
- Sin benchmarks: no hay evidencia publicada de estabilidad, robustez ni rendimiento de la marcha en el robot real.
- Comportamiento perpetuo: la politica se describe como "perpetual" y no se detiene por si misma, lo que exige un mecanismo externo de parada o sustitucion para evitar que el robot siga ejecutando la marcha de forma indefinida.
- Dependencia del hardware y del firmware: la politica asume la interfaz concreta de microduck (61 observaciones, 14 acciones, 50 Hz) y el esquema 2 de manifiesto; cambios en el daemon o en la plataforma pueden invalidarla.
- Riesgo en operacion fisica: al controlar un robot real, cualquier fallo de la politica puede provocar movimientos no deseados, por lo que se recomienda validacion previa en simulacion y pruebas con el robot suspendido o en un entorno acotado.
- Sesgos: no aplica en el sentido de sesgos sociales de un modelo de lenguaje; no se documentan sesgos de comportamiento del controlador.
- Alucinacion: no aplica; el riesgo equivalente es la generalizacion deficiente a estados de observacion no vistos durante el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apirrone/new_velstand_test
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl` (rama `protective_fall`, commit `d3edc1fa1`); no se proporciona URL directa en la informacion disponible
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` del repositorio del daemon de microduck; no se proporciona URL directa en la informacion disponible
- Paper, blog o demo adicionales: no disponible
