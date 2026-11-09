# dashi/microduck-roller-daily-20261108

## Resumen

`dashi/microduck-roller-daily-20261108` es una política de control robótico, no un modelo de lenguaje. Se publica en Hugging Face bajo la librería `microduck` y el pipeline `robotics`, y su propósito es generar una marcha (gait) perpetua para el robot cuadrúpedo microduck de Pollen Robotics, operando sobre ruedas (rollers). El modelo base es `DenRakEiw/microduck-senate_duck_0904`, sobre el que se aplica un ajuste fino, y a su vez es una reentrada diaria del modelo `dashi/microduck-roller-remix-r900` con una puntuación de 0.900.

Técnicamente, la política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio fichero `policy.onnx`, de modo que el robot puede alimentarse con observaciones en bruto. Se integra en el ecosistema del daemon de microduck mediante `manifest.json` (esquema 2) y se carga con el comando `robotctl policy load walk dashi/microduck-roller-daily-20261108`.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación dentro de un proyecto de aprendizaje por refuerzo para robótica de bajo coste, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin documentación sobre idiomas ni benchmarks. No debe confundirse con un modelo generativo textual: sus entradas y salidas son tensores de observación y acción, no tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con aprendizaje por refuerzo; se desconoce la topología de red concreta) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la observación es un vector de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (distribución en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

Otros datos operativos: frecuencia de control de 50 Hz, 61 dimensiones de observación, 14 dimensiones de acción, ranura (`slot`) de política `walk`, comportamiento perpetuo (se ejecuta hasta que se le indique lo contrario), y despliegue sobre ruedas (rollers).

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red (número de capas, tipo de encoder, tamaño de las capas ocultas ni función de activación). Lo que sí consta es el pipeline de entrenamiento: el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`, lo que sitúa el entrenamiento en el marco de aprendizaje por refuerzo del proyecto microduck. La política se ha obtenido por ajuste fino (`base_model_relation: finetune`) sobre `DenRakEiw/microduck-senate_duck_0904`, y se describe como una "reentrada diaria" de `dashi/microduck-roller-remix-r900` con puntuación 0.900, lo que sugiere un proceso de iteración y selección de políticas por rendimiento.

La innovación técnica destacable es de ingeniería de despliegue más que de modelado: el normalizador de observaciones está embebido en el propio `policy.onnx`, de forma que el consumidor no necesita replicar la normalización por separado y puede enviar observaciones sin procesar. El modelo se empaqueta con un manifiesto versionado (esquema 2) que permite al daemon del robot cargarlo directamente en una ranura de comportamiento (`walk`).

## Capacidades

- Generación de una marcha perpetua sobre ruedas para el robot microduck: la política produce 14 acciones continuas a 50 Hz a partir de 61 observaciones.
- Control reactivo de locomoción: al ser una política de RL, mapea estado del robot y del entorno a comandos de actuación sin planificación explícita.
- Ejecución continua: el comportamiento no termina por sí solo; requiere una orden externa para detenerse o sustituirse.
- Integración con el daemon de microduck mediante `robotctl`: carga declarativa en la ranura `walk`.
- Autocontención en inferencia: normalización integrada en el ONNX, lo que simplifica el despliegue en el robot.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Locomoción base del microduck sobre ruedas: cargar la política en la ranura `walk` con `robotctl policy load walk dashi/microduck-roller-daily-20261108` para que el robot ejecute una marcha continua en superficies con rollers, aprovechando que el modelo está entrenado específicamente para esa configuración.
- Investigación en aprendizaje por refuerzo robótico: servir como punto de partida o línea base reproducible dentro del repositorio `microduck_rl`, dado que se documentan rama y commit de entrenamiento.
- Ajuste fino posterior: al ser un finetune de `DenRakEiw/microduck-senate_duck_0904`, puede emplearse como inicialización para nuevas políticas en la ranura `walk` o en ranuras relacionadas.
- Docencia y prototipado en robótica de bajo coste: el microduck de Pollen Robotics es una plataforma accesible; esta política permite demostrar un ciclo completo de entrenamiento RL, exportación a ONNX y despliegue en hardware real.
- Evaluación comparativa de políticas: la nomenclatura de "reentrada diaria" con puntuación (0.900) facilita comparar esta política con otras variantes del mismo autor o del modelo base en experimentos controlados.
- Pruebas de integración del daemon: verificar el soporte del esquema 2 de `manifest.json` y la carga de políticas ONNX autocontenidas en pipelines de CI del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico de rendimiento es la puntuación 0.900 asociada a `dashi/microduck-roller-remix-r900` en la descripción de la model card, sin que se especifique la métrica, el entorno de evaluación ni la metodología, por lo que no es interpretable como benchmark comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política de control con observaciones de 61 dimensiones y 14 acciones, la huella es previsiblemente mínima, pero no se documenta el tamaño del grafo ONNX ni el número de parámetros.
- GPU recomendadas: no disponibles. Para robótica embebida a 50 Hz, lo habitual es ejecutar en CPU del propio robot o en un acelerador de borde, pero la información proporcionada no lo confirma.
- ¿Cabe en GPU de consumo? No hay datos que permitan afirmarlo; por la naturaleza del artefacto es plausible, pero no se confirma.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon de microduck mediante `robotctl`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: se especifica una frecuencia de control de 50 Hz, lo que implica un presupuesto de 20 ms por paso; no se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dashi/microduck-roller-daily-20261108 | Política RL robótica (ONNX) | no disponible | 61 dims de observación, 50 Hz | no disponible | Hugging Face, 0 descargas |
| DenRakEiw/microduck-senate_duck_0904 (modelo base) | Política RL robótica | no disponible | no disponible | no disponible | Hugging Face |
| dashi/microduck-roller-remix-r900 (origen de la reentrada) | Política RL robótica | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas ni de alternativas fuera del ecosistema microduck con métricas equiparables.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política específica para el microduck sobre ruedas; no es un modelo de propósito general ni un modelo de lenguaje.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial, modificación o redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Sin benchmarks publicados: la puntuación 0.900 de la variante de origen carece de contexto metodológico y no debe tomarse como garantía de rendimiento.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un finetune con rama `roll-backward`, el comportamiento puede degradarse en superficies, cargas o configuraciones distintas de las usadas durante el entrenamiento.
- Comportamiento perpetuo: la política se ejecuta hasta recibir una orden externa, lo que exige mecanismos de parada seguros en el daemon y en el operador.
- Documentación mínima: no hay información sobre sesgos, robustez ante perturbaciones, ni límites de seguridad física del robot.
- Repositorio de tamaño 0.0 GB y sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Los resultados de búsqueda web obtenidos no guardan relación con el modelo (se refieren al caldo japonés dashi) y no aportan información técnica utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261108
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa en la información disponible.
- Paper, blog o demo: no disponibles en la información proporcionada.
