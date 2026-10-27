# AndoShy/microduck-tug-pool2-850

## Resumen

`AndoShy/microduck-tug-pool2-850` es una política de control motor entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje: se distribuye como un grafo ONNX que mapea una observación de 61 dimensiones a 14 acciones de actuación, ejecutándose a 50 Hz. La tarea declarada es `Mjlab-TugOfWar-MicroDuck`, un escenario de simulated tug-of-war (tirar del adversario) dentro del repositorio `microduck-challenges`.

La política se describe como «perpetua»: no tiene condición de terminación propia, sino que corre de forma continua hasta que el daemon la descarga. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor alimenta observaciones en crudo. Se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck, lo que permite cargarla en un slot mediante `robotctl policy load`.

El interés del artefacto es acotado pero específico: es un checkpoint (850) de un entrenamiento con 2048 entornos paralelos y un pool de ocho oponentes de referencia, lo que lo convierte en material útil para estudiar currículos de autoaprendizaje competitivo en robótica de simulación. El repositorio figura con 0 descargas y 0 likes, sin licencia declarada, y no se han publicado métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL exportada como grafo ONNX; el autor no especifica la topología interna de la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 dimensiones por paso, sin memoria recurrente declarada |
| Tipos de cuantizacion | No disponible (artefacto ONNX sin variantes cuantizadas publicadas) |
| Idiomas soportados | No aplica (control motor, sin interfaz de texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Checkpoint | 850 |
| Semilla | 1 |
| Entornos paralelos | 2048 |
| Tamano del repositorio | 0.0 GB segun Hugging Face (artefacto por debajo del umbral de redondeo de la plataforma) |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura de la red más allá de su empaquetado como ONNX. Por el contexto del repositorio de desafíos se trata de una política de reinforcement learning para simulación física (mjlab), con observaciones de 61 dimensiones y 14 salidas de acción a 50 Hz. Uno de los oponentes del pool de entrenamiento se etiqueta explícitamente como `greecree_v3_mlp.onnx`, lo que sugiere que el ecosistema utiliza perceptrones multicapa, pero no hay confirmación de que esta política concreta sea un MLP ni de su número de capas o unidades.

El entrenamiento consta de una fase previa con nombre de ejecución `2026-10-27_17-10-29_winmark` y de una reanudación desde el checkpoint `model_300.pt` con `--agent.max-iterations 600` y guardado cada 50 iteraciones. El resultado publicado es el checkpoint 850, coherente con 300 iteraciones previas más 600 adicionales. El currículo de oponentes es un pool de ocho políticas ONNX: tres copias de `ref_t20-500.onnx`, dos de `leader_nico.onnx`, una de `greecree_v3_mlp.onnx` y dos de `juicenv.onnx`. No se documenta el número total de pasos de entorno, la composición de las recompensas, el uso de RLHF/DPO (no aplicable) ni técnicas de dominio como randomización de parámetros físicos. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas.

## Capacidades

- Locomoción y empuje en el escenario de tug-of-war: la política genera 14 comandos de actuación a partir de 61 observaciones, de forma continua y sin condición de parada.
- Ejecución perpetua: no emite señal de terminación; el ciclo de control se mantiene hasta que el daemon descarga la política del slot.
- Normalización integrada: el normalizador de observaciones está embebido en `policy.onnx`, por lo que acepta observaciones sin preprocesar.
- Compatibilidad con el runtime microduck: se carga mediante `robotctl policy load <slot> AndoShy/microduck-tug-pool2-850` y cumple el esquema 2 del manifiesto.
- Entrenada contra un pool heterogéneo de oponentes, lo que implica comportamiento adaptativo frente a políticas de referencia distintas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente una política de control motor.

## Casos de uso

- Despliegue directo en un microduck físico: cargar la política en un slot y ejecutar el escenario de empuje con el runtime `robotctl`, aprovechando que el normalizador va embebido y no requiere pipeline de preprocesado adicional.
- Oponente de referencia en entrenamientos competitivos: incorporar `policy.onnx` al pool de `--env.actions.opponent.pool` para que nuevas políticas aprendan a enfrentarse a un comportamiento ya entrenado contra ocho rivales.
- Evaluación comparativa de políticas: usar el checkpoint 850 como línea base fija en torneos simulados dentro del repositorio `microduck-challenges`, manteniendo constantes semilla y condiciones de escena.
- Estudio de autoaprendizaje competitivo: analizar cómo un currículo con oponentes duplicados (tres copias de `ref_t20-500`, dos de `leader_nico`, dos de `juicenv`) afecta a la distribución de estrategias aprendidas.
- Docencia e investigación en robótica de bajo coste: reproducir el pipeline completo (clonar repositorio, `uv sync`, `uv run train`) con 2048 entornos y comprobar el efecto de cambiar la semilla sobre una política comparable.
- Pruebas de integración del daemon: validar el cumplimiento del esquema 2 de manifiesto y el flujo de carga/descarga de políticas en un runtime real con un artefacto pequeño y de inferencia rápida.
- Base para ajuste fino con recompensas propias: reanudar desde este checkpoint mediante `--agent.resume True` y `--agent.load-run` para especializar la política en variantes de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de victoria, recompensa media, distancia recorrida ni métricas de sim-to-real, y el nombre de la ejecución previa (`winmark`) no va acompañado de cifras verificables. Tampoco se documentan latencia ni throughput del grafo ONNX.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. El repositorio figura como 0.0 GB, lo que indica un artefacto muy pequeño (por debajo de la precisión de redondeo de Hugging Face) y compatible con ejecución en CPU.
- GPU recomendadas: no aplica para inferencia; el runtime objetivo es el computador a bordo de un microduck, que ejecuta el grafo ONNX a 50 Hz.
- GPU para reentrenamiento: el comando publicado usa 2048 entornos paralelos en mjlab, lo que exige una GPU de datacenter (A100/H100 o equivalente). No se especifica el modelo empleado ni el consumo de memoria.
- Cabe en GPU de consumo: la inferencia sí, al ser un artefacto de tamaño despreciable; el reentrenamiento con 2048 entornos no está documentado para GPU de consumo.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único requisito temporal declarado es el ciclo de control a 50 Hz.

## Comparativa con modelos similares

| Política | Parámetros | Contexto / observación | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AndoShy/microduck-tug-pool2-850` | No disponible | 61 obs. / 14 acc. a 50 Hz | No disponible | No disponible | Hugging Face, 0 descargas |
| `ref_t20-500.onnx` | No disponible | No disponible | No disponible | No disponible | Referenciada en el pool de entrenamiento |
| `leader_nico.onnx` | No disponible | No disponible | No disponible | No disponible | Referenciada en el pool de entrenamiento |
| `greecree_v3_mlp.onnx` | No disponible (etiquetada como MLP) | No disponible | No disponible | No disponible | Referenciada en el pool de entrenamiento |
| `juicenv.onnx` | No disponible | No disponible | No disponible | No disponible | Referenciada en el pool de entrenamiento |

Las cuatro políticas alternativas se citan únicamente como oponentes dentro del comando de entrenamiento; no se aportan sus fichas, métricas ni licencias, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial ni para redistribución de derivados. Es un bloqueo potencial en producción.
- Ausencia total de métricas: sin tasas de victoria, recompensas ni evaluaciones sim-to-real, no hay evidencia pública de que la política funcione fuera del entorno de entrenamiento.
- Sobreajuste al pool: el currículo contiene ocho oponentes pero solo cuatro políticas distintas, con duplicados (tres copias de `ref_t20-500`, dos de `leader_nico`, dos de `juicenv`), lo que sesga la distribución de rivales vistos.
- Comportamiento perpetuo sin criterio de parada propio: cualquier lógica de seguridad, timeout o recuperación ante caídas debe implementarse en el daemon o en la capa de control superior.
- Dependencia estricta del contrato de observación: 61 dimensiones en un orden y escala concretos, con el normalizador embebido. Cambiar el firmware, la IMU o el orden de las articulaciones invalida la política sin aviso.
- Dependencia de la versión del daemon: el manifiesto sigue el esquema 2; versiones distintas del runtime pueden rechazar la carga.
- No reproducible bit a bit: el autor lo advierte; reentrenar con la misma semilla produce una política «comparable», no idéntica, lo que complica la auditoría y la depuración de regresiones.
- Sin validación comunitaria: 0 descargas y 0 likes, con un único commit de carga. No hay informes independientes de funcionamiento.
- Sin información sobre sesgos ni alucinación: no aplican en el sentido de los modelos de lenguaje, pero tampoco se documentan modos de fallo del controlador (oscilaciones, saturación de actuadores, comportamiento ante contacto inesperado).
- La búsqueda web realizada no devolvió documentación técnica adicional: los resultados fueron páginas genéricas de motores de búsqueda sin relación con el modelo.

## Enlaces

- [Hugging Face: AndoShy/microduck-tug-pool2-850](https://huggingface.co/AndoShy/microduck-tug-pool2-850)
- [Repositorio microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- Repositorio de entrenamiento: `git@github.com:pollen-robotics/microduck-challenges`, rama `andoshy-tug`, commit `e8b7d782e`
- Referencia del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (no se proporciona URL directa)
- Base de simulación: `mjlab-microduck 0.1.0 @ 1efd853be` (no se proporciona URL directa)
