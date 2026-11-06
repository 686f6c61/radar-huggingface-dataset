# dashi/microduck-hill-daily-20261102

## Resumen

`dashi/microduck-hill-daily-20261102` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es un artefacto de robótica que produce acciones de locomoción a 50 Hz a partir de observaciones de 61 dimensiones, empaquetado como grafo ONNX y distribuido a través de la librería `microduck` para su carga directa en el demonio del robot mediante `robotctl`.

Se trata de una reentrada diaria (*daily re-entry*) del checkpoint `dashi/microduck-hill-remix-r744`, con una recompensa reportada de 0.744, y constituye un *finetune* del modelo `jrubiosainz/microduck-game-hillclimber-remix8`. Su ranura de despliegue es `walk` y se describe como una política «perpetua»: ejecuta la marcha de forma continua hasta que se le indique lo contrario.

El interés de esta ficha es acotado y específico: documenta un experimento de aprendizaje por refuerzo reproducible sobre hardware abierto, con un pipeline de entrenamiento identificado (repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`) y un formato de despliegue estandarizado. No hay información pública sobre arquitectura de red, presupuesto de entrenamiento ni evaluación en benchmarks convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para control motriz, exportada a ONNX; topología no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye un `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Espacio de observación | 61 dimensiones |
| Espacio de acción | 14 acciones |
| Ranura de despliegue | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix8` (relación: finetune) |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red (número de capas, anchura, tipo de capas o función de activación). Lo que sí se documenta es el contrato de entrada y salida: el modelo consume observaciones crudas de 61 dimensiones y emite 14 acciones a 50 Hz, y el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar. El artefacto se exporta a ONNX para inferencia en el propio robot.

El entrenamiento se realizó con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Esta política es una reentrada diaria de `dashi/microduck-hill-remix-r744` (recompensa 0.744) y un *finetune* de `jrubiosainz/microduck-game-hillclimber-remix8`, es decir, se apoya en una política previa especializada en ascenso de colinas y la refina. No se especifican el número de pasos de entorno, la composición del currículo, el algoritmo de RL concreto ni si hubo fases de ajuste adicionales.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha perpetua para la ranura `walk`, sin terminación automática.
- Control reactivo a 50 Hz sobre observaciones propioceptivas de 61 dimensiones.
- Generalización a terrenos tipo «colina», heredada del modelo base `hillclimber-remix8`.
- Despliegue directo en hardware mediante `robotctl policy load walk <repo>`.
- Inferencia autocontenida: normalización de observaciones incluida en el grafo ONNX.
- Compatibilidad con el manifiesto de políticas microduck, esquema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión ni audio.

## Casos de uso

- **Marcha continua en el microduck real**: cargar la política con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261102` para que el robot camine de forma indefinida sobre terreno con pendientes suaves, aprovechando que la política está diseñada como perpetua y no requiere rearme.
- **Punto de partida para *finetuning* propio**: usar este checkpoint como inicialización en `pollen-robotics/microduck_rl` para entrenar variantes sobre nuevos terrenos, dado que ya incorpora una marcha estable y una recompensa de referencia de 0.744.
- **Comparación de reentradas diarias**: evaluar la progresión de las políticas `daily` frente al checkpoint `r744` original para medir si el refinamiento diario aporta mejoras de recompensa o estabilidad.
- **Validación de pipelines de despliegue**: probar el flujo completo de manifiesto esquema 2 y carga por ranura (`walk`) en el demonio del robot antes de desplegar políticas propias en producción.
- **Docencia e investigación en RL aplicado a robótica de bajo coste**: reproducir el experimento sobre hardware microduck asequible, usando el commit y la rama documentados como referencia reproducible.
- **Pruebas de robustez en simulación**: ejecutar `policy.onnx` en un simulador compatible con el contrato de observación de 61 dimensiones para analizar comportamiento ante perturbaciones antes de transferir al robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la recompensa de 0.744 asociada al checkpoint de origen `dashi/microduck-hill-remix-r744`, que no es directamente comparable con métricas de otros modelos al depender del entorno y la función de recompensa del repositorio `microduck_rl`.

| Metrica | Valor |
|---|---|
| Recompensa del checkpoint de origen (`r744`) | 0.744 |
| MMLU, HumanEval, GSM8K u otros | no aplica / no disponible |
| Throughput o latencia | no disponible (frecuencia de control fijada a 50 Hz) |

## Requisitos de hardware

- **VRAM estimada**: no disponible; el tamaño del repositorio es de 0.0 GB y la topología de la red no se documenta, por lo que no puede estimarse con rigor.
- **GPU recomendadas**: no disponibles. El modelo se exporta a ONNX y está pensado para ejecutarse en el cómputo embebido del propio microduck, no en GPUs de servidor.
- **GPU de consumo**: no se documenta compatibilidad ni requisitos; la inferencia objetivo es en el robot.
- **Opciones de despliegue**: `robotctl` (demonio microduck) y ejecución de `policy.onnx` mediante cualquier runtime ONNX compatible con el contrato de entrada/salida.
- **Latencia y throughput**: la política opera a 50 Hz por diseño (20 ms por paso de control); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Ranura | Licencia | Relación |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261102` | Política RL (ONNX) | 61-D / 14 acciones, 50 Hz | `walk` | no disponible | Este modelo |
| `dashi/microduck-hill-remix-r744` | Política RL | no disponible | no disponible | no disponible | Checkpoint de origen (recompensa 0.744) |
| `jrubiosainz/microduck-game-hillclimber-remix8` | Política RL | no disponible | no disponible | no disponible | Modelo base del *finetune* |

No se dispone de datos de arquitectura, parámetros ni benchmarks de las alternativas, por lo que la comparación se limita a la relación de linaje y al contrato de despliegue.

## Limitaciones y advertencias

- **Licencia no especificada**: no hay licencia declarada, lo que impide determinar si el uso comercial está permitido. Tratar como no apto para producción comercial hasta aclararlo con el autor.
- **Alcance muy restringido**: es una política de marcha para un robot concreto (microduck); no es reutilizable fuera de ese hardware o de un simulador que replique su contrato de observación.
- **Sin evaluación publicada**: no hay benchmarks independientes ni métricas de robustez ante perturbaciones, terreno irregular o fallos de sensores.
- **Comportamiento perpetuo**: la política no termina por sí sola; en el robot real requiere supervisión y un mecanismo externo de parada.
- **Riesgo de sobreajuste al terreno de entrenamiento**: al derivar de un modelo «hillclimber», su desempeño en superficies planas, escaleras o terrenos blandos no está documentado.
- **Reproducibilidad parcial**: se documenta rama y commit del repositorio de entrenamiento, pero no hiperparámetros, semillas ni presupuesto de cómputo.
- **Artefacto de investigación**: cero descargas y cero *likes* en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261102
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix8
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck
