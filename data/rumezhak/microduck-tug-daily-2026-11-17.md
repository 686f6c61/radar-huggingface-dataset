# rumezhak/microduck-tug-daily-2026-11-17

## Resumen

microduck-tug-daily-2026-11-17 es una politica de control motriz (policy) entrenada mediante aprendizaje por refuerzo para el robot cuadrupedo de bajo coste microduck, desarrollado por el ecosistema Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de robótica que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetado en formato ONNX y distribuido con la libreria microduck junto con un manifiesto de metadatos. La política se describe como "perpetua": una marcha (gait) que se ejecuta de forma continua hasta que se le indique lo contrario, y que se carga en una ranura (slot) del demonio `robotctl` del robot.

El modelo resuelve un problema muy concreto: proporcionar una marcha estable y reutilizable que pueda desplegarse en el robot físico con un solo comando, sin necesidad de reentrenar ni de gestionar el preprocesado de observaciones, ya que el normalizador de observaciones esta incrustado dentro del propio `policy.onnx`. Esto reduce la friccion entre el entrenamiento en simulacion y la ejecucion en hardware real.

La relevancia de esta ficha es limitada fuera del nicho de la robótica de bajo coste: el repositorio no tiene descargas ni interacciones, no declara licencia ni idiomas, y la model card es minima. Se documenta aqui con rigor y marcando explicitamente que la mayor parte de los datos tecnicos habituales (benchmarks, dataset, hiperparametros) no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada con RL; pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX, la model card no detalla precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas microduck) |

Especificaciones adicionales declaradas:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | incrustado en `policy.onnx` (se alimenta con observaciones en crudo) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la topologia de red (numero de capas, tipo de MLP o red recurrente, funcion de activacion ni tamano de las capas ocultas). Lo que si se documenta es el proceso: la politica se entreno con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. El resultado se exporta a ONNX e incluye el normalizador de observaciones como parte del grafo, de modo que el consumidor final envia lecturas de sensores sin procesar y el modelo se encarga de la normalizacion internamente.

La innovacion tecnica destacable, dentro de su escala, es el contrato de integracion: la politica se empaqueta con un `manifest.json` que sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del demonio, y se carga en el robot mediante `robotctl policy load <slot> rumezhak/microduck-tug-daily-2026-11-17`. No se dispone de informacion sobre el numero de tokens o pasos de entrenamiento, la composicion del dataset, el simulador empleado, ni si hubo fases de ajuste fino o recompensas adicionales.

## Capacidades

- Control locomotor cuadrupedo: genera 14 acciones de control a 50 Hz a partir de 61 observaciones, correspondientes a una marcha continua.
- Ejecucion perpetua: la politica mantiene la marcha indefinidamente hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- Despliegue directo en hardware: integracion con el demonio `robotctl` mediante carga en una ranura de politica.
- Preprocesado integrado: el normalizador de observaciones viaja dentro del ONNX, lo que elimina la necesidad de replicar estadisticas de normalizacion en el cliente.
- Inferencia portable: al estar en ONNX, puede ejecutarse con runtimes ONNX estandar sobre CPU o aceleradores compatibles.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Puesta en marcha rapida de un microduck fisico: cargar la politica en una ranura con `robotctl policy load` permite al robot caminar sin reentrenar ni calibrar el pipeline de observaciones, ya que la normalizacion esta incluida en el ONNX.
- Demostraciones y divulgacion educativa: al ser una marcha perpetua y estable, sirve para exhibir el robot en ferias, aulas o talleres donde se necesita un comportamiento continuo y predecible sin supervision.
- Base de referencia para experimentos de RL: el identificador `tug-daily` y el commit de entrenamiento permiten usar esta politica como linea base contra la que comparar nuevas marchas entrenadas en `microduck_rl`.
- Validacion de la cadena de despliegue: util para verificar que el demonio, el manifiesto de esquema 2 y la carga por ranuras funcionan correctamente antes de desplegar politicas mas complejas.
- Teleoperacion supervisada de bajo nivel: la politica puede actuar como capa de locomocion mientras un operador envia consignas de alto nivel, manteniendo el equilibrio y el ciclo de marcha.
- Investigacion en sim2real: sirve para estudiar la brecha entre simulacion y robot real en un cuadrupedo de bajo coste, comparando el comportamiento observado con el esperado del entrenamiento.
- Pruebas de integracion continua en robótica: al ser un artefacto ONNX versionado, puede incorporarse a pipelines que validen que el modelo carga y produce acciones con la forma y frecuencia esperadas (14 acciones a 50 Hz).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito, velocidad de marcha, consumo energetico ni comparaciones con otras politicas del mismo robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una politica de control para un cuadrupedo de bajo coste con observacion de 61 dimensiones y 14 acciones, es razonable esperar un modelo pequeno que se ejecute en CPU, pero el repositorio no publica el numero de parametros ni el tamano del grafo ONNX.
- GPU recomendadas: no disponibles; no se requiere GPU de forma declarada para ejecutar el ONNX, aunque el entorno real de ejecucion es la computadora a bordo del microduck.
- Compatibilidad con GPU de consumo: no confirmada; la ejecucion prevista es en el propio robot, no en estaciones de trabajo.
- Opciones de despliegue: demonio `robotctl` del microduck (carga por ranura) y runtimes ONNX estandar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el contrato exige 50 Hz de control (20 ms por ciclo); no se publican mediciones reales de latencia por inferencia ni de carga de CPU en el robot.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otras politicas del microduck ni modelos comparables de la misma categoria, y no se dispone de datos de parametros, contexto, rendimiento o licencia de alternativas para establecer una tabla rigurosa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso de uso comercial, redistribucion ni modificacion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Model card minima: no se documentan arquitectura, numero de parametros, dataset de entrenamiento, hiperparametros ni criterios de evaluacion, lo que impide auditar el comportamiento.
- Ambito de aplicacion restringido: solo funciona con el robot microduck y su contrato de observacion de 61 dimensiones y accion de 14 dimensiones; no es reutilizable en otros dominios.
- Comportamiento perpetuo: al ejecutarse hasta recibir orden contraria, requiere mecanismos externos de parada y supervision; un fallo en el bucle de control puede mantener la marcha activa de forma indefinida.
- Riesgo de sim2real: no se publican metricas de robustez ante terrenos irregulares, empujes o deslizamiento, por lo que el rendimiento fuera del entorno de entrenamiento es desconocido.
- Sin garantias de seguridad: no hay documentacion sobre limites de par, saturacion de acciones ni comportamientos de recuperacion ante caidas.
- Sin soporte multilingue ni de texto: cualquier expectativa de uso como modelo generativo es erronea.
- Estado de adopcion nulo: cero descargas y cero interacciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-daily-2026-11-17
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio microduck
- Resultado de busqueda web: https://www.telephone.city/enseigne/lidl/ (no relacionado con el modelo; se descarta como fuente)
