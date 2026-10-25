# hunjison/microduck-roller-seedtable-from-jrubiosainz

## Resumen

`hunjison/microduck-roller-seedtable-from-jrubiosainz` es una política de control por aprendizaje por refuerzo (RL) para el robot microduck, empaquetada como fichero ONNX y publicada en Hugging Face bajo la librería `microduck` con pipeline `robotics`. No es un modelo de lenguaje: se trata de un controlador reactivo que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ser cargado directamente en una ranura de política del daemon del robot.

La política se describe como «perpetua»: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que la política consume observaciones en bruto. El repositorio incluye además un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El interés del artefacto es acotado pero concreto: sirve como política de referencia reproducible (el autor documenta el repositorio, rama y commit exactos de entrenamiento) para experimentos de RL sobre el robot, validación de la cadena de despliegue `robotctl` y comparación de marchas. La información publicada es mínima: no hay datos de arquitectura de red, número de parámetros, licencia, idiomas ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL exportada a ONNX; la model card no detalla la topología de red) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; entrada fija de 61 dimensiones) |
| Tipos de cuantización | No disponible (se distribuye un único `policy.onnx`; no se documentan variantes) |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos del repo) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimensión de observación | 61 (normalizador embebido en el ONNX; se alimenta con observaciones en bruto) |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Condición de terminación | Ninguna declarada (política «perpetua») |
| Librería / runtime | `microduck` (daemon del robot, carga vía `robotctl`) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` |
| Tamaño del repo | 0.0 GB (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal. Lo único verificable es el formato de salida: un grafo ONNX autocontenido que integra el normalizador de observaciones, con una interfaz sensoriomotora fija de 61 entradas y 14 salidas evaluada a 50 Hz. No se especifican capas, funciones de activación, número de parámetros ni precisión numérica del grafo.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`), lo que sitúa la política en el marco de RL del propio fabricante. No se publican detalles sobre el simulador, la función de recompensa, el número de pasos de entrenamiento, la composición del dataset ni el uso de técnicas posteriores como domain randomization o destilación. El nombre del artefacto sugiere una variante derivada de otro autor (`jrubiosainz`), pero no se documenta el proceso de destilación o adaptación.

## Capacidades

- Generación de una marcha continua («perpetua») para el robot microduck en condición de rodillos, sin condición de parada interna declarada.
- Control reactivo en bucle cerrado a 50 Hz: mapea observaciones de 61 dimensiones a 14 comandos de actuación en cada ciclo.
- Ingesta de observaciones en bruto: el normalizador está embebido en el grafo ONNX, por lo que no requiere preprocesado externo.
- Despliegue en el robot mediante una única instrucción (`robotctl policy load <slot> <repo>`), compatible con el sistema de ranuras de política del daemon.
- Portabilidad de runtime gracias al formato ONNX (no requiere el stack de entrenamiento para inferir).
- Sin capacidades de lenguaje, tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo: la interfaz es exclusivamente numérica y propioceptiva.

## Casos de uso

- **Validación de la cadena de despliegue**: cargar la política en una ranura del daemon con `robotctl policy load` para verificar de extremo a extremo que el manifiesto de esquema 2 y el grafo ONNX son aceptados y ejecutados a 50 Hz.
- **Línea base reproducible en experimentos de RL**: al estar fijados repo, rama y commit de entrenamiento, sirve como referencia contra la que medir políticas nuevas sobre la misma interfaz de 61 observaciones y 14 acciones.
- **Pruebas de integración del daemon**: usar una política perpetua como carga sintética continua para detectar regresiones en el bucle de control, en la gestión de ranuras o en el manejo de parada.
- **Evaluación en banco de rodillos**: reproducción de la condición declarada («on rollers») para comparar el comportamiento de esta marcha frente a otras políticas del mismo hub sin riesgo de caída libre del robot.
- **Docencia y demostración**: ejemplo mínimo de política RL empaquetada en ONNX que ilustra la interfaz observación-acción del robot y el flujo de publicación en Hugging Face.
- **Recolecta de datos en condición controlada**: ejecución sostenida sobre rodillos para registrar trazas de observación y acción que alimenten análisis de estabilidad o ajuste de normalizadores.
- **Punto de partida para adaptación**: dado el formato ONNX y la interfaz documentada, la política puede servir como inicialización o comparador en procesos de fine-tuning en `microduck_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, robustez ante perturbaciones, ni comparaciones con otras políticas. Tampoco se documentan latencia de inferencia ni throughput medidos.

## Requisitos de hardware

- VRAM: no disponible. La model card solo documenta el despliegue en el propio robot a través del daemon, no en servidores GPU.
- GPU recomendadas: no disponibles; el flujo de despliegue descrito no menciona GPU.
- Viabilidad en GPU de consumo: no documentada. Al tratarse de un grafo ONNX con interfaz de 61 entradas y 14 salidas a 50 Hz, la carga computacional por ciclo es baja, pero no se publican mediciones que lo confirmen.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load <slot> hunjison/microduck-roller-seedtable-from-jrubiosainz`; inferencia ONNX (ONNX Runtime u otro ejecutor compatible) para pruebas fuera del robot.
- Latencia y throughput: no disponibles. El único requisito temporal declarado es el bucle de control a 50 Hz (20 ms por ciclo).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni datos de rendimiento que permitan una comparación con alternativas de la misma categoría (misma interfaz de 61 observaciones / 14 acciones o mismo pipeline `robotics`).

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita, el uso comercial y la redistribución quedan en una situación jurídica indeterminada; conviene contactar con el autor antes de integrarla en un producto.
- **Trazabilidad incompleta**: se desconoce la topología, el número de parámetros y el proceso de entrenamiento, lo que impide auditar la política o estimar su coste computacional a priori.
- **Ámbito restringido a rodillos**: la condición declarada es «on rollers»; no se documenta el comportamiento sobre el suelo ni la robustez ante perturbaciones, terreno irregular o empujes.
- **Política perpetua sin parada interna**: no declara condición de terminación, por lo que la seguridad depende de mecanismos externos (parada del daemon, límites de la ranura, supervisión humana).
- **Riesgo de uso indebido del normalizador**: al estar embebido en el ONNX, alimentar observaciones ya normalizadas produciría acciones incorrectas sin aviso.
- **Ausencia de validación comunitaria**: 0 descargas y 0 likes en el momento de los metadatos; no hay evidencia pública de despliegues exitosos en hardware real.
- **Tamaño de repo reportado de 0.0 GB**: no permite verificar que los pesos estén efectivamente alojados en el repositorio; conviene comprobar la descarga antes de integrarla en un pipeline automatizado.
- **Sin métricas de sim2real**: no se publican datos de transferencia del simulador al robot, ni de degradación del rendimiento tras el despliegue.
- **Metadatos de fecha anómalos**: la fecha de creación indicada (2026-10-25) es posterior a la de consulta habitual, lo que sugiere un posible error de sellado temporal del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hunjison/microduck-roller-seedtable-from-jrubiosainz
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`)
- Especificación del manifiesto de políticas: `docs/policy-manifest.md` dentro del repositorio del daemon de microduck (esquema 2)
