# GinDuck/microduck-gin-remix-roller

## Resumen

`microduck-gin-remix-roller` es una política de control por refuerzo (reinforcement learning) publicada por el usuario GinDuck en Hugging Face, diseñada para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador neuronal que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones, pensado para que el robot se desplace de forma continua sobre ruedas (rollers). El artefacto principal es un fichero `policy.onnx` con el normalizador de observaciones integrado, acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El modelo se presenta explícitamente como una política "perpetua": una vez cargada en una ranura de política del demonio `robotctl`, el robot ejecuta la marcha indefinidamente hasta que se le indique lo contrario. La model card describe el artefacto como un "remix": las semillas 1, 2, 4 y 5 reproducen la política `quicksilver-roller-v2` de HlibPlakhtii, la semilla 3 reproduce `roller-remix-leader2` de rumezhak, y la red subyacente corresponde a `roller-2` de GinDuck. Es, por tanto, un trabajo derivado y experimental, no una política entrenada desde cero con una metodología documentada de forma independiente.

La relevancia de esta ficha es limitada pero concreta: se enmarca en el ecosistema de robótica de bajo coste de Pollen Robotics y en el repositorio de entrenamiento `pollen-robotics/microduck_rl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB (lo que sugiere que los pesos pueden no estar efectivamente alojados o que el artefacto es extremadamente pequeño) y no se declara licencia ni idiomas. Además, la model card advierte que es "simulation only", es decir, validada únicamente en simulación y no necesariamente verificada en hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control (entrenada con RL); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Entorno de despliegue | microduck (Pollen Robotics), demonio `robotctl` |
| Pipeline declarado | robotics |
| Libreria | microduck |
| Tamano del repo | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: entrada de 61 dimensiones correspondiente al vector de observación del microduck, salida de 14 acciones, ejecutada a 50 Hz sobre rollers. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional. El manifiesto `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del demonio.

El entrenamiento se realizó, según la model card, en el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. La política es un remix: las semillas 1, 2, 4 y 5 replican `quicksilver-roller-v2` de HlibPlakhtii, la semilla 3 replica `roller-remix-leader2` de rumezhak, y la red de base es `roller-2` de GinDuck. No se documentan el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL concreto (PPO, SAC u otro), ni si hubo fases de ajuste fino o destilación. Tampoco se especifica el simulador utilizado ni el dominio de aleatorización aplicado.

## Capacidades

- Locomoción continua sobre rollers: la política genera una marcha perpetua que se ejecuta hasta que se detiene o se sustituye la política cargada.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, adecuado para el bucle de control de bajo nivel del microduck.
- Integración con el demonio `robotctl` mediante carga en una ranura de política (`robotctl policy load <slot> ...`).
- Normalización de observaciones integrada en el ONNX, lo que simplifica la integración en el pipeline de inferencia del robot.
- Ejecución en simulación: la model card indica explícitamente "simulation only", por lo que su capacidad de transferencia a hardware real no está validada en la documentación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigación en locomoción de bajo coste: usar la política como línea base para comparar estrategias de RL sobre el microduck en simulación, aprovechando que la interfaz (61 observaciones, 14 acciones, 50 Hz) está estandarizada por el manifiesto.
- Reproducción de experimentos: al estar vinculada a un commit concreto (`debcfcae0`) y a semillas identificadas, permite reproducir el remix y auditar qué componente aporta cada semilla al comportamiento final.
- Desarrollo de pipelines de evaluación en simulación: cargar `policy.onnx` en un entorno simulado del microduck para medir estabilidad de la marcha, deriva y consumo antes de probar en hardware.
- Pruebas de integración del demonio `robotctl`: validar el flujo de carga de políticas en ranuras, la lectura del `manifest.json` con esquema 2 y el bucle de control a 50 Hz.
- Punto de partida para ajuste fino: al ser un remix de políticas existentes, sirve como inicialización para experimentos de RL posteriores en la rama `talent-3` del repositorio de entrenamiento.
- Docencia y divulgación en robótica: ejemplo compacto y de código abierto del ecosistema microduck para ilustrar cómo se distribuye y despliega una política neuronal en un robot cuadrúpedo de bajo coste.
- Comparación de políticas de locomoción: al coexistir con `quicksilver-roller-v2`, `roller-remix-leader2` y `roller-2`, permite evaluar en igualdad de condiciones qué combinación de semillas ofrece mejor comportamiento sobre rollers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de desplazamiento, estabilidad ni comparaciones cuantitativas con las políticas de origen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0.0 GB y no se publican parámetros, por lo que no puede estimarse con rigor; por la naturaleza del artefacto (política de control para un robot de bajo coste), es previsible que sea muy reducido, pero no hay dato confirmado.
- GPU recomendadas: no disponible. No se especifica ningún requisito de aceleración; el despliegue se realiza en el propio robot o en un entorno de simulación, no necesariamente con GPU.
- Cabeza en GPU de consumo: no disponible, aunque por el contexto del microduck y el pipeline `robotics` es plausible que la inferencia se ejecute en CPU, pero esto no está documentado.
- Opciones de despliegue: demonio `robotctl` del ecosistema microduck, mediante `sudo robotctl policy load <slot> GinDuck/microduck-gin-remix-roller`. El formato ONNX permite, en principio, ejecución con ONNX Runtime, pero no se documenta ninguna otra vía.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms), que marca el presupuesto de cómputo por paso.

## Comparativa con modelos similares

| Modelo | Autor | Tipo | Observaciones / acciones | Frecuencia | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|---|
| microduck-gin-remix-roller | GinDuck | Política RL (remix) | 61 / 14 | 50 Hz | ONNX | no disponible | simulation only |
| quicksilver-roller-v2 | HlibPlakhtii | Política RL | no disponible | no disponible | no disponible | no disponible | referenciada como fuente de semillas 1, 2, 4, 5 |
| roller-remix-leader2 | rumezhak | Política RL | no disponible | no disponible | no disponible | no disponible | referenciada como fuente de la semilla 3 |
| roller-2 | GinDuck | Política RL | no disponible | no disponible | no disponible | no disponible | red base del remix |

No se dispone de datos de rendimiento, parámetros ni contexto para establecer una comparación cuantitativa entre estas políticas. La comparativa se limita a la relación de procedencia documentada en la model card.

## Limitaciones y advertencias

- La model card indica explícitamente "simulation only": no hay evidencia publicada de transferencia a hardware físico ni de robustez ante condiciones reales (fricción variable, terreno irregular, desgaste de rollers).
- No se declara licencia. Sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; debe contactarse con el autor antes de cualquier uso en producción.
- El repositorio registra 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que genera dudas sobre si los pesos están efectivamente alojados y disponibles para su descarga.
- Es un trabajo derivado (remix) de políticas de terceros; los derechos y condiciones de las políticas de origen (`quicksilver-roller-v2`, `roller-remix-leader2`, `roller-2`) no se detallan.
- No se documentan la arquitectura interna, el número de parámetros, el algoritmo de RL ni el proceso de entrenamiento, lo que impide auditar el comportamiento o reproducir el entrenamiento desde cero.
- No se especifican los idiomas ni se aplica: no es un modelo de lenguaje, por lo que no procede evaluar sesgos lingüísticos, alucinación textual ni capacidades multilingües.
- La política es "perpetua" por diseño: una vez cargada, el robot ejecuta la marcha hasta que se le indique lo contrario, lo que exige mecanismos externos de parada y supervisión.
- No hay métricas de seguridad ni de parada de emergencia documentadas; en un robot físico, la ausencia de estas validaciones es un riesgo operativo relevante.
- La fecha de creación del repositorio (2026-11-14) es posterior a la fecha habitual de consulta, lo que conviene verificar antes de citar el artefacto como estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-gin-remix-roller
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0` (no se proporciona URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa en la información disponible)
- Política de origen `quicksilver-roller-v2` (HlibPlakhtii): no disponible
- Política de origen `roller-remix-leader2` (rumezhak): no disponible
- Política base `roller-2` (GinDuck): no disponible
