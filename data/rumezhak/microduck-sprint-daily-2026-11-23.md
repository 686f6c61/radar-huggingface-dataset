# rumezhak/microduck-sprint-daily-2026-11-23

## Resumen

microduck-sprint-daily-2026-11-23 es una politica de control para el robot cuadrupedo microduck de Pollen Robotics, publicada por el usuario rumezhak en Hugging Face. No se trata de un modelo de lenguaje, sino de una politica de aprendizaje por refuerzo exportada a ONNX que se carga en una ranura de politica del demonio de control del robot. La politica es de tipo "perpetuo": ejecuta una marcha de forma continua hasta que se le indique lo contrario, a 50 Hz, con un espacio de observacion de 61 dimensiones y un espacio de accion de 14 dimensiones.

El artefacto principal es `policy.onnx`, que incorpora el normalizador de observaciones integrado, de modo que el robot puede alimentar observaciones en bruto directamente. Se acompania de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck, definido en `docs/policy-manifest.md` del repositorio del demonio. El repositorio tiene un tamano de 0.0 GB, sin descargas ni likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de robótica de bajo nivel, no de un modelo fundacional. No hay informacion publica sobre licencia, idiomas, benchmarks ni composicion del dataset de entrenamiento mas alla de la referencia al repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin variantes publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2) |

Especificaciones adicionales del entorno de control:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (marcha continua hasta instruccion contraria) |
| Normalizador de observaciones | integrado en `policy.onnx` |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura de la red neuronal subyacente. Se sabe que el resultado se exporta a ONNX y que se ejecuta como politica de control en el demonio de microduck, con un bucle de control a 50 Hz. El modelo consume observaciones de 61 dimensiones y produce acciones de 14 dimensiones, lo que corresponde al espacio de actuacion del cuadrupedo microduck. El normalizador de observaciones esta embebido en el grafo ONNX, de forma que la politica acepta observaciones en bruto sin preprocesado externo.

El entrenamiento se realizo con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican el numero de pasos de entrenamiento, la composicion del dataset, la funcion de recompensa, ni si se aplicaron tecnicas de curriculum, domain randomization o destilacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Control locomotor de un cuadrupedo microduck mediante una marcha perpetua a 50 Hz.
- Consumo de observaciones de 61 dimensiones y emision de acciones de 14 dimensiones.
- Normalizacion de observaciones integrada en el grafo ONNX, sin necesidad de pipeline externo.
- Carga directa en una ranura de politica del demonio mediante `robotctl policy load`.
- Ejecucion continua hasta que se le indique lo contrario (politica perpetua).
- Compatibilidad con el esquema 2 del manifiesto de politicas de microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Demostracion de marcha continua en un microduck: la politica se carga en una ranura y ejecuta una marcha perpetua a 50 Hz, adecuada para exhibiciones o pruebas de locomocion en laboratorio.
- Pruebas de integracion del demonio de control: sirve como politica de referencia para validar el flujo `robotctl policy load`, la lectura de `manifest.json` y el bucle de control a 50 Hz.
- Benchmarking de locomocion en cuadrupedos de bajo coste: permite comparar la marcha generada por esta politica con otras politicas cargadas en la misma plataforma.
- Docencia e investigacion en aprendizaje por refuerzo aplicado a robotica: el artefacto ONNX y el repositorio de entrenamiento asociado permiten reproducir y estudiar el pipeline.
- Base para experimentos de transferencia sim2real: al estar exportada a ONNX con normalizador integrado, puede servir como punto de partida para comparar politicas entrenadas en simulacion.
- Validacion de despliegue en hardware embebido: el formato ONNX y la frecuencia de 50 Hz permiten evaluar requisitos de computo en la placa de control del microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una politica de control de un cuadrupedo de bajo coste, se espera que se ejecute en el computo embebido del microduck, no en GPU de datacenter.
- GPU recomendadas: no disponible. No se documenta el hardware de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: demonio de microduck mediante `sudo robotctl policy load <slot> rumezhak/microduck-sprint-daily-2026-11-23`; inferencia ONNX.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms) segun la model card; no se publican mediciones de latencia real ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otras politicas comparables para microduck ni artefactos de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, contexto, tool calling ni generacion de texto.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial o redistribucion.
- No se documentan sesgos, pero al ser una politica de RL entrenada en un entorno concreto, puede presentar comportamientos no deseados fuera de las condiciones de entrenamiento.
- No se especifican los idiomas ni la cobertura linguistica porque no aplica.
- No hay informacion sobre el dataset de entrenamiento, la funcion de recompensa ni el proceso de validacion, lo que dificulta evaluar la robustez de la marcha.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere un artefacto experimental sin validacion comunitaria.
- La politica es perpetua: ejecuta la marcha hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura en produccion.
- No se documentan requisitos de seguridad fisica para el robot ni limites de par o velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-daily-2026-11-23
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio de microduck
