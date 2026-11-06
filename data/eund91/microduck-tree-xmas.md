# EunD91/microduck-tree-xmas

## Resumen

`microduck-tree-xmas` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es un controlador neuronal que mapea una observación de 61 dimensiones a 14 acciones de actuación a 50 Hz, empaquetado en formato ONNX para su ejecución directa en el robot. Lo publica el usuario EunD91 bajo el identificador `EunD91/microduck-tree-xmas` y está etiquetado para la ranura `sitstand` del sistema de políticas del daemon microduck.

La política se describe como "perpetua": una vez cargada, ejecuta una marcha o coreografía de forma continua hasta que se le indique lo contrario. En este caso concreto, la model card la presenta como una pieza navideña en la que entre una y tres unidades del robot (identificadas como "1-3-4 ducks") cantan *We Wish You a Merry Christmas*, lo que sugiere una política de exhibición o demostración más que una función de locomoción utilitaria.

El interés del modelo es acotado pero claro: sirve como ejemplo de política RL lista para desplegar en hardware real dentro del ecosistema microduck, con el normalizador de observaciones ya integrado en el fichero ONNX y un manifiesto conforme al esquema 2 del daemon. Es relevante para quienes trabajan en robótica de bajo coste, aprendizaje por refuerzo aplicado a control y despliegue de políticas en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de control; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Ranura de politica | `sitstand` |
| Libreria | microduck |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red en la información disponible. Lo que sí se especifica es la interfaz de la política: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, un formato coherente con un controlador de locomotion para un cuadrúpedo de pequeñas dimensiones. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, en el commit `5cee942d8`. Se trata, por tanto, de una política obtenida mediante aprendizaje por refuerzo en simulación y exportada a ONNX para su ejecución en el robot. No se documentan el número de pasos de entrenamiento, la composición del entorno, la función de recompensa ni si hubo técnicas adicionales como domain randomization o destilación. La política se declara "perpetua", es decir, sin condición de terminación interna: se ejecuta de forma continua hasta que el operador la detiene o carga otra.

## Capacidades

- Control motriz de un robot cuadrúpedo microduck mediante política RL, con salida de 14 acciones a 50 Hz.
- Ejecución de una marcha o coreografía continua en la ranura `sitstand`, sin terminación automática.
- Recepción de observaciones en crudo gracias al normalizador integrado en el ONNX.
- Compatibilidad con el manifiesto de políticas del daemon microduck (esquema 2).
- Carga y ejecución mediante el comando `robotctl policy load sitstand EunD91/microduck-tree-xmas`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Demostración navideña en ferias y eventos: la política reproduce de forma continua la coreografía de canto de *We Wish You a Merry Christmas* con una a tres unidades del robot, adecuada para atraer público en un stand.
- Prueba de integración del stack microduck: sirve para validar de extremo a extremo el flujo `robotctl policy load` con una política real y un manifiesto conforme al esquema 2.
- Banco de pruebas de despliegue ONNX en el borde: permite medir latencia y estabilidad de una política a 50 Hz en el hardware del robot sin infraestructura adicional.
- Educación y divulgación en robótica: ejemplo tangible de cómo una política entrenada con RL en simulación se ejecuta en un cuadrúpedo de bajo coste.
- Coreografía multi-robot coordinada: el escenario de "1-3-4 ducks" sugiere su uso para ensayar sincronización de varias unidades ejecutando la misma política.
- Referencia para entrenamiento de nuevas políticas: el repositorio `microduck_rl` y este modelo sirven de plantilla para quienes quieran entrenar y exportar sus propias marchas para la ranura `sitstand`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de una política de control en ONNX de un repo de 0,0 GB, el modelo es de tamaño muy reducido y está pensado para ejecutarse en el propio robot microduck.
- VRAM estimada: no disponible; por el tamaño del repositorio y el formato ONNX, es previsible que quepa en memoria de sistemas embebidos, pero no se documenta.
- GPU recomendadas: no disponibles; el despliegue previsto es en el hardware del microduck, no en GPU de servidor.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: daemon microduck mediante `robotctl policy load sitstand EunD91/microduck-tree-xmas`; ejecución de `policy.onnx` con un runtime ONNX en el robot.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms), pero no se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas microduck comparables ni alternativas de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial queda sin autorización explícita y requiere consulta previa con el autor.
- La model card no documenta sesgos, pero al ser una política de control entrenada en simulación, puede presentar un gap de simulación a realidad (dinámica, fricción, sensores) no cuantificado.
- La política es "perpetua": no tiene condición de terminación interna, de modo que en producción debe existir un mecanismo externo de parada o supervisión.
- Está atada a la ranura `sitstand` y a la interfaz de 61 observaciones y 14 acciones del microduck; no es reutilizable en otros robots sin reentrenamiento.
- No se documentan los datos de entrenamiento, la función de recompensa ni el número de pasos, lo que dificulta evaluar su robustez.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No dispone de capacidades de lenguaje, visión ni razonamiento; no debe evaluarse con criterios de modelos generativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EunD91/microduck-tree-xmas
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
