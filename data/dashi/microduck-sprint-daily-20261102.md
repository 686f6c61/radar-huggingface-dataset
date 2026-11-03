# dashi/microduck-sprint-daily-20261102

## Resumen

`dashi/microduck-sprint-daily-20261102` es una política de control motriz (no un modelo de lenguaje) publicada en HuggingFace para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El artefacto es un reentreno diario de la política `dashi/microduck-sprint-remix-r844`, que obtuvo una recompensa de 0,844, y se distribuye como un fichero `policy.onnx` con el normalizador de observaciones embebido. Está pensado para ocupar el slot de marcha (`walk`) del robot y ejecutarse de forma perpetua a 50 Hz.

El modelo recibe observaciones de 61 dimensiones y emite 14 acciones, entrenado mediante aprendizaje por refuerzo sobre el repositorio `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`). Es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`, orientado a generar una marcha de tipo *sprint* para el robot.

Su relevancia es acotada: se trata de un experimento de investigación en robótica de bajo coste con licencia no declarada, sin benchmarks publicados ni documentación de idiomas, y con un tamaño de repositorio de 0,0 GB según HuggingFace (lo que sugiere un artefacto muy pequeño o un fallo de reporte). No es un modelo de propósito general ni compite con LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con RL (red neuronal exportada a ONNX); arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, dimensión oculta). Se sabe que es una política de control entrenada por aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. El espacio de observación es de 61 dimensiones y el de acciones de 14 dimensiones, con una frecuencia de control de 50 Hz. La política se ejecuta de forma perpetua (sin condición de parada) hasta que se le indique lo contrario, y ocupa el slot `walk` del robot.

El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el robot puede alimentar observaciones crudas directamente. El modelo es un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`, y a su vez el autor indica que es un "daily re-entry" de `dashi/microduck-sprint-remix-r844` (recompensa 0,844). No se especifican número de tokens, composición del dataset, ni si hubo RLHF/DPO (no aplica en este dominio).

## Capacidades

- Generación de una marcha de tipo *sprint* para el robot microduck, ejecutada de forma continua a 50 Hz.
- Control motor con observaciones de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el propio fichero ONNX (admite observaciones crudas).
- Ejecución perpetua: la política no se detiene por sí sola.
- Integración con el daemon del robot mediante `robotctl policy load walk <repo>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- **Marcha autónoma del microduck en laboratorio**: cargar la política en el slot `walk` con `sudo robotctl policy load walk dashi/microduck-sprint-daily-20261102` para que el robot camine de forma continua durante sesiones de experimentación.
- **Investigación en RL para robótica de bajo coste**: usar esta política como baseline o punto de partida para comparar variantes de reentreno diario (el autor publica versiones con fecha en el nombre, lo que sugiere una cadencia de experimentación).
- **Reproducción de experimentos**: al estar vinculada a un commit concreto (`83599404a`) y una rama (`roll-backward`) del repositorio `microduck_rl`, permite reproducir el pipeline de entrenamiento.
- **Evaluación de robustez de marchas**: al ser una política perpetua, sirve para probar la estabilidad de la marcha en sesiones largas y detectar deriva o fallos acumulados.
- **Despliegue en el robot físico**: el formato ONNX con normalizador embebido simplifica el despliegue, ya que no requiere preprocesado adicional en el lado del robot.
- **Docencia y demos**: el microduck es un robot de bajo coste de Pollen Robotics; esta política permite demostrar control por RL en entornos educativos.
- **Punto de partida para fine-tuning**: al ser un fine-tune de `jrubiosainz/microduck-game-sprinter-remix3`, puede servir como base para nuevos remixes con otros objetivos de marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es la recompensa de 0,844 asociada al modelo del que deriva (`dashi/microduck-sprint-remix-r844`), pero no se especifica la métrica, el entorno de evaluación ni la escala.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio figura como 0,0 GB, lo que impide estimar; por la naturaleza del artefacto, probablemente sea de pocos MB).
- GPU recomendadas: no disponible. Al ejecutarse en el robot microduck, la inferencia se realiza previsiblemente en la CPU del propio robot o en un equipo de control, no en GPUs de datacenter.
- ¿Cabe en GPU consumer? No disponible, pero por el tamaño típico de políticas de control para robots de bajo coste, es altamente probable que sí.
- Opciones de despliegue: el daemon `robotctl` del ecosistema microduck (carga vía `robotctl policy load walk <repo>`); el formato ONNX permite usar ONNX Runtime en otros entornos.
- Latencia y throughput: no disponible. La frecuencia de control es de 50 Hz (periodo de 20 ms), lo que fija el requisito temporal de la inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261102` | Política RL (ONNX) | 61 dim | 14 | 50 Hz | no disponible | HuggingFace |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `dashi/microduck-sprint-remix-r844` | Política RL (origen del reentreno) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes. Otras alternativas fuera del ecosistema microduck no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica licencia, lo que impide evaluar el uso comercial. Tratarlo como no apto para producción comercial hasta confirmación del autor.
- **Sin benchmarks**: no hay métricas publicadas de robustez, tasa de caída ni generalización a distintos terrenos.
- **Política perpetua**: al no detenerse por sí sola, requiere mecanismos externos de parada segura en el robot.
- **Sesgos y alucinación**: no aplica en el sentido de LLM, pero sí existe riesgo de comportamientos no deseados (deriva, inestabilidad) propios de políticas RL sin evaluación exhaustiva.
- **Idioma y contexto**: no aplica; no es un modelo de lenguaje.
- **Documentación mínima**: la model card es muy escueta y no detalla arquitectura, datos de entrenamiento ni metodología de evaluación.
- **Tamaño de repositorio anómalo**: HuggingFace reporta 0,0 GB, lo que puede indicar un problema de reporte o un artefacto extremadamente pequeño; conviene verificar la integridad de los ficheros antes de desplegar.
- **Dependencia del ecosistema microduck**: el uso está atado al daemon `robotctl` y al manifiesto schema 2; no es portable a otros robots sin adaptación.

## Enlaces

- HuggingFace: https://huggingface.co/dashi/microduck-sprint-daily-20261102
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); URL exacta no disponible en la información proporcionada.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (URL exacta no disponible).
