# DenRakEiw/microduck-songkran-duck_6027

## Resumen

`microduck-songkran-duck_6027` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje: es una política de locomoción exportada en formato ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para ejecutarse como un gait perpetuo cargado en una ranura de política del daemon `robotctl`. El autor, DenRakEiw, la describe como una red entrenada con RL propio y un pulido posterior mediante estrategias evolutivas (ES) robustas a jitter.

El repositorio es extremadamente pequeño (0,0 GB reportados) y no contiene pesos en safetensors ni GGUF, sino un artefacto `policy.onnx` con el normalizador de observaciones embebido, más un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. La ficha técnica disponible es mínima: no hay licencia declarada, no hay idiomas (no aplica), no hay benchmarks publicados y no hay métricas de recompensa o éxito de la política.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas RL en hardware robótico de bajo coste, con un pipeline reproducible (repo `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `6c0b5d452`) y un mecanismo de carga directa en robot vía `robotctl`. Para desarrolladores de robótica open source es un ejemplo de integración entre entrenamiento RL, exportación ONNX y despliegue en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política RL exportada a ONNX (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible (artefacto ONNX; cuantización no declarada) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

| Parametro adicional | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0,0 GB |
| Fecha de creacion | 2026-11-21 |
| Fecha de actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

La model card indica que se trata de una red entrenada con RL propio ("own RL") y posteriormente pulida con estrategias evolutivas robustas a jitter ("jitter-robust ES polish"). No se especifica el algoritmo RL exacto (PPO, SAC u otro), ni el número de parámetros, ni la topología de la red. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot alimenta observaciones crudas sin preprocesado adicional.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `6c0b5d452`, exportado desde un checkout con cambios sin commitear, lo que introduce una advertencia de reproducibilidad: el artefacto publicado no corresponde exactamente a un estado limpio del repositorio. El autor menciona "trained with solar energy" como nota anecdótica sobre el entorno de cómputo, sin aportar detalles sobre volumen de episodios, recompensas o curriculum.

La política es de tipo perpetuo: no tiene condición de terminación interna y se ejecuta como gait continuo hasta que el daemon la descargue o la sustituya. El manifiesto sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Locomoción continua del robot microduck a 50 Hz mediante una política perpetua cargada en una ranura de política.
- Consumo de observaciones crudas de 61 dimensiones gracias al normalizador embebido en el ONNX.
- Emisión de 14 acciones de control por paso.
- Robustez a jitter incorporada mediante el pulido con estrategias evolutivas.
- Despliegue directo en robot mediante `robotctl policy load <slot> DenRakEiw/microduck-songkran-duck_6027`.
- Compatibilidad con el esquema 2 de manifiestos de política del daemon microduck.
- No dispone de tool calling, function calling, agentes, capacidades multilingües, visión, audio ni modo de razonamiento; no es un modelo generativo.

## Casos de uso

- Locomoción base de un microduck en laboratorio: cargar la política en una ranura y dejar que el robot camine de forma continua mientras se registran datos de sensores; la frecuencia de 50 Hz y el normalizador embebido simplifican la integración.
- Pruebas de robustez frente a perturbaciones: el pulido ES orientado a jitter hace de esta política un candidato para experimentos con terreno irregular o empujes laterales, comparando el comportamiento antes y después del pulido.
- Docencia de RL aplicado a robótica: el flujo completo (entrenamiento en `microduck_rl`, exportación ONNX, carga con `robotctl`) sirve como ejemplo reproducible en cursos y talleres.
- Baseline para comparación de políticas: al ser un gait perpetuo con observación de 61 dimensiones y 14 acciones, puede usarse como referencia frente a políticas nuevas en la misma ranura del daemon.
- Integración en pipelines de evaluación automatizada: cargar y descargar la política por script vía `robotctl` permite ejecutar barridos de evaluación sin intervención manual.
- Demostración de despliegue ONNX en hardware de bajo coste: el artefacto único `policy.onnx` con normalizador embebido reduce la complejidad de inferencia en el robot.
- Prototipado de comportamiento de marcha: servir como punto de partida para ajustes finos o para el pulido ES de variantes derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito, distancia recorrida, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0,0 GB y la política se ejecuta en el propio robot, no en GPU de servidor.
- GPU recomendadas: no aplica para despliegue en robot; el artefacto ONNX está pensado para ejecución en el hardware del microduck.
- Cabe en GPU consumer: no disponible como dato verificado; al ser un ONNX de política de control, es esperable que quepa en hardware de baja potencia, pero no se confirma en la información proporcionada.
- Opciones de despliegue: daemon microduck con `robotctl policy load <slot> ...`; inferencia ONNX Runtime presumible (no confirmado explícitamente).
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por paso); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables ni datos de rendimiento que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-songkran-duck_6027 | no disponible | no aplica (obs. 61-D) | no disponible | no disponible | Hugging Face |
| Alternativas microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; contactar al autor antes de cualquier despliegue productivo.
- Reproducibilidad comprometida: el artefacto se exportó desde un checkout con cambios sin commitear en la rama `denrakeiw-070`, commit `6c0b5d452`.
- Sin métricas publicadas: no hay evidencia de estabilidad, tasa de éxito ni comportamiento en terrenos diversos.
- Política perpetua: no tiene condición de parada interna; requiere gestión explícita por parte del daemon para evitar ejecución indefinida no deseada.
- Sin documentación de arquitectura: no se conocen número de parámetros, capas ni algoritmo RL, lo que dificulta auditoría y ajuste.
- Riesgo de sobreajuste al entorno de entrenamiento: el pulido ES frente a jitter no garantiza robustez fuera de la distribución de entrenamiento.
- Sin soporte de idiomas, visión ni tool calling: no debe confundirse con un modelo de propósito general.
- Descargas y likes nulos en el momento de la ficha: ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_6027
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw-070`, commit `6c0b5d452`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
- Paper, blog, demo o repositorio adicional: no disponible
