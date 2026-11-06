# BabyClaw/microduck-beaktug-radial-baseline6-20261106

## Resumen

`BabyClaw/microduck-beaktug-radial-baseline6-20261106` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un artefacto de inferencia (un fichero `policy.onnx` acompañado de un `manifest.json`) que se carga en un slot de política del daemon `robotctl` y se ejecuta en bucle a 50 Hz sobre el robot físico. La observación de entrada es un vector de 61 dimensiones y la salida consta de 14 acciones, lo que define una política de locomoción de extremo a extremo con espacio de observación y acción fijos.

El modelo se distribuye con el identificador `beaktug` y la etiqueta de "validated league champion radial-baseline6", lo que sugiere que procede de un proceso de competición o liga interna de políticas sobre el mismo robot, con una variante concreta (radial-baseline6) fechada el 6 de noviembre de 2026. La política es calificada por el autor como "perpetua": una vez cargada, ejecuta una marcha de forma continua hasta que se le indique lo contrario, sin episodios ni reinicios explícitos.

La relevancia de esta ficha es limitada para el público general de modelos de IA, pero es de interés para quienes trabajan en robótica de bajo coste, simulación a realidad y despliegue de políticas de RL en hardware empotrado. La información publicada es muy escasa (repositorio de 0,0 GB, sin licencia declarada, sin idiomas, sin benchmarks), por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Duracion | perpetua (ejecuta hasta que se detiene externamente) |
| Libreria | microduck |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal. Lo que sí se especifica es el contrato de interfaz: una observación de 61 dimensiones, 14 acciones y una frecuencia de control de 50 Hz, empaquetado como grafo ONNX. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto y el propio grafo se encarga de la normalización. El `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

En cuanto al entrenamiento, el autor indica que el repositorio de entrenamiento es `pollen-robotics/microduck_rl`, rama `main`, commit `7aff0bc7d`, y advierte que la exportación se realizó desde un checkout con cambios sin confirmar. No se proporciona información sobre el número de pasos de entrenamiento, la composición del dataset, el simulador empleado, la presencia de curriculum, domain randomization, ni sobre si se aplicó RLHF, DPO o algún tipo de ajuste fino posterior. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Locomoción cuadrúpeda de extremo a extremo: mapea un vector de observación de 61 dimensiones a 14 acciones de control a 50 Hz.
- Ejecución perpetua: la política está diseñada para correr de forma continua hasta que se detenga externamente, sin episodios ni resets implícitos.
- Normalización integrada: el `policy.onnx` incluye el normalizador de observaciones, por lo que acepta observaciones en bruto.
- Despliegue mediante `robotctl`: se carga en un slot de política con `sudo robotctl policy load <slot> BabyClaw/microduck-beaktug-radial-baseline6-20261106`.
- Compatibilidad con el manifiesto de políticas microduck (esquema 2), lo que facilita la integración con el daemon.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en un slot y dejar que el robot ejecute la marcha de forma perpetua para evaluar estabilidad y consumo energético en banco de pruebas.
- Comparación de políticas en una liga interna: al estar etiquetada como "validated league champion", sirve como referencia base (baseline6) frente a otras políticas candidatas del mismo robot en experimentos de evaluación comparativa.
- Investigación en simulación a realidad: permite reproducir en hardware físico una política entrenada en `pollen-robotics/microduck_rl`, útil para medir la brecha sim-real con una política concreta y un commit de entrenamiento identificable.
- Docencia y prototipado en robótica de bajo coste: al ser un artefacto ONNX autocontenido con normalizador embebido, se puede desplegar en el robot sin pipeline de preprocesado adicional.
- Integración en el daemon `robotctl`: sirve como ejemplo funcional de política que cumple el esquema 2 del manifiesto, útil para desarrolladores que implementen cargadores de políticas o herramientas de gestión de slots.
- Pruebas de robustez y seguridad en bucle cerrado: ejecutar la política de forma continua permite observar deriva, fatiga de actuadores y comportamiento ante perturbaciones externas en un entorno controlado.
- Base para ajuste fino o destilación: al estar exportada a ONNX y vinculada a un repositorio de entrenamiento público, puede servir como punto de partida para reentrenamientos o para destilar la política en controladores más ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la etiqueta "validated league champion radial-baseline6-20261106", sin cifras de recompensa, tasa de éxito, velocidad de marcha, consumo ni métricas de simulación o de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la política está pensada para ejecutarse en el propio robot, no en GPU de servidor.
- GPU recomendadas: no aplica para el despliegue previsto; la inferencia se realiza en el hardware empotrado del microduck a través del daemon `robotctl`.
- ¿Cabe en GPU de consumo? No aplica en el caso de uso documentado; el artefacto es un `policy.onnx` de control, no un modelo generativo.
- Opciones de despliegue: `robotctl` (carga en slot de política) sobre el daemon de microduck; el formato ONNX permite, en principio, ejecución con runtimes ONNX estándar, aunque no se documenta soporte oficial fuera de `robotctl`.
- Latencia y throughput: no disponibles; el único dato de temporización es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo), que es un requisito de la interfaz, no una medición de latencia real.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas publicadas para el microduck con las que comparar parámetros, contexto, rendimiento, licencia y disponibilidad. El ecosistema microduck incluye otros artefactos de la misma organización (por ejemplo, `BabyClaw/duck-skill-20261105-sprint-2m`), pero no se dispone de sus especificaciones para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la model card ni en los metadatos de Hugging Face, por lo que el uso comercial queda en un limbo legal hasta que el autor la explicite.
- Información técnica mínima: no se documentan arquitectura de red, número de parámetros, datos de entrenamiento ni métricas de rendimiento, lo que impide auditar la política.
- Exportación desde un checkout con cambios sin confirmar: el autor advierte que el commit `7aff0bc7d` no refleja exactamente el estado del código usado para exportar el modelo, lo que compromete la reproducibilidad.
- Riesgo de sobreajuste al entorno de entrenamiento: al no documentarse domain randomization ni validación en hardware, la transferencia a condiciones distintas del robot o del terreno es incierta.
- Ejecución perpetua sin salvaguardas documentadas: la política corre hasta que se detiene externamente; no se describen mecanismos de parada de emergencia, límites de par o detección de fallos.
- Sin soporte multilingüe, de tool calling ni de agentes: cualquier expectativa propia de un modelo de lenguaje es inaplicable.
- Sin benchmarks publicados: no es posible comparar su rendimiento con otras políticas de locomoción del mismo robot.
- Repositorio vacío en cuanto a tamaño (0,0 GB) y sin descargas ni likes: la disponibilidad y el mantenimiento futuro no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/microduck-beaktug-radial-baseline6-20261106
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `main`, commit `7aff0bc7d`), referenciado en la model card; no se proporciona URL directa en la información disponible.
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa).
- Otro artefacto de la misma organización: https://huggingface.co/BabyClaw/duck-skill-20261105-sprint-2m
- Repositorio del asistente BabyClaw: https://github.com/babyclaw/babyclaw
