# AndoShy/microduck-tug-pool2

## Resumen

`AndoShy/microduck-tug-pool2` (etiquetado internamente como `tug-pool2`) es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste **microduck** de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo multimodal: es una política de locomoción entrenada para la tarea `Mjlab-TugOfWar-MicroDuck`, es decir, un robot que camina y tira de una cuerda contra un oponente. La política es «perpetua»: no tiene condición de terminación propia y se ejecuta de forma continua hasta que el operador la detiene o carga otra.

El modelo consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz (20 ms por paso de control). Se distribuye como un único `policy.onnx` con el normalizador de observaciones ya integrado en el grafo, de modo que el robot puede alimentar observaciones en crudo, más un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon de microduck. La carga en un robot se hace con una sola orden (`robotctl policy load <slot> AndoShy/microduck-tug-pool2`).

El interés del artefacto es fundamentalmente metodológico: documenta de forma completa la cadena de entrenamiento (tarea, repositorio, commit, checkpoint 450, semilla 1, 2048 entornos paralelos, 600 iteraciones máximas, reanudación desde un checkpoint previo y un pool de ocho oponentes), lo que permite reproducir el proceso. Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. Política de RL (observación → acción) entrenada con mjlab sobre MuJoCo; red neuronal de tamaño no documentado |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Ventana de observación de 61 dimensiones por paso de control, a 50 Hz |
| Tipos de cuantizacion | No disponible (export en ONNX; no se documenta cuantización del grafo) |
| Idiomas soportados | No aplica / no disponible (no procesa lenguaje natural) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones embebido) + `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Comportamiento | Política perpetua (sin terminación propia) |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Libreria / runtime | `microduck` (pipeline: robotics) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, anchura, tipo de MLP o si usa memoria recurrente). Lo que sí se documenta es el procedimiento de entrenamiento: la política se entrena con **mjlab** (entorno de RL sobre MuJoCo) a partir de la base `mjlab-microduck 0.1.0` en el commit `1efd853be`, dentro del repositorio `pollen-robotics/microduck-challenges`, rama `andoshy-tug`, commit `e8b7d782e`. El entrenamiento usó 2048 entornos en paralelo, un máximo de 600 iteraciones, intervalo de guardado cada 50 iteraciones, semilla 1 y registro en TensorBoard, con el nombre de ejecución `pool2`. El checkpoint final publicado es el 450.

Un detalle relevante es que el entrenamiento no parte de cero: se reanuda (`--agent.resume True`) desde la ejecución `2026-10-27_17-10-29_winmark`, checkpoint `model_300.pt`. Además, la tarea incorpora un **pool de oponentes** de ocho políticas ONNX externas: `ref_t20-500.onnx` (3 copias), `leader_nico.onnx` (2 copias), `greecree_v3_mlp.onnx` y `juicenv.onnx` (2 copias). Este currículo de oponentes mixtos es lo que da a la política su comportamiento competitivo en la tarea de tira y afloja. El autor advierte explícitamente de que el proceso no es reproducible bit a bit entre máquinas: la misma semilla y el mismo comando producen una política «comparable», no los mismos pesos.

## Capacidades

- Locomoción cuadrúpeda perpetua orientada a la tarea de tira y afloja (`TugOfWar`): la política mantiene una marcha y ejerce tracción de forma continua, sin episodios con condición de terminación.
- Control a 50 Hz con latencia de paso de 20 ms, adecuado para el bucle de control del microduck.
- Mapeo directo de 61 observaciones a 14 acciones articulares; el normalizador de observaciones está embebido en `policy.onnx`, por lo que se alimentan observaciones en crudo sin preprocesado externo.
- Comportamiento competitivo derivado del entrenamiento contra un pool de ocho oponentes (políticas `ref_t20-500`, `leader_nico`, `greecree_v3_mlp` y `juicenv`).
- Despliegue integrado en el ecosistema microduck mediante `robotctl policy load <slot>`, cargando la política en una ranura (slot) del daemon.
- Compatibilidad con el esquema 2 del manifiesto de políticas (`manifest.json`), lo que permite al daemon validar y cargar el artefacto.
- No soporta generación de texto, código, matemáticas, visión, audio, tool calling, function calling, razonamiento multi-paso ni capacidades multilingües: no es un modelo de propósito general.

## Casos de uso

- **Competición de tira y afloja en microduck**: cargar la política en un slot del robot y enfrentarla a otras políticas del repositorio `microduck-challenges`. Es el uso previsto por el autor y el escenario para el que fue entrenada, con observaciones de 61 dimensiones y 14 acciones.
- **Oponente en el pool de entrenamiento de nuevas políticas**: al estar exportada como ONNX con interfaz fija, puede añadirse como oponente en comandos de entrenamiento de terceros, del mismo modo que esta política usó ocho oponentes externos. Aporta diversidad de comportamiento competitivo en escenarios de self-play.
- **Referencia de evaluación sim-to-real**: sirve como punto de comparación al medir la degradación de una política entre simulación (mjlab/MuJoCo) y el robot físico, dado que el autor documenta el checkpoint y la configuración exactos.
- **Docencia e investigación en RL robótico**: ejemplo completo y reproducible de la cadena entrenamiento → exportación ONNX → despliegue en hardware, con hiperparámetros, semilla, commit y comando de reproducción publicados.
- **Pruebas de integración del daemon `robotctl`**: útil para validar el flujo `policy load`, la gestión de slots y la lectura de manifiestos con esquema 2 en pipelines de CI del software de robot.
- **Medición de latencia en el hardware objetivo**: el bucle a 50 Hz impone un presupuesto de 20 ms por paso; la política permite instrumentar el tiempo de inferencia ONNX en la computadora embarcada del microduck y detectar cuellos de botella.
- **Demostraciones y exhibiciones**: al ser una política perpetua, no requiere reinicios periódicos ni lógica de episodio, lo que simplifica las demos públicas de marcha continua.
- **Punto de partida para fine-tuning o reanudación**: el checkpoint 450 y la configuración de reanudación documentada permiten continuar el entrenamiento con otros pools de oponentes o variantes de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media por episodio, tasa de victorias frente al pool de oponentes, curvas de entrenamiento ni métricas de sim-to-real. Tampoco se documentan latencia ni throughput medidos en hardware real.

## Requisitos de hardware

- **VRAM**: no disponible. Al tratarse de una política de control de muy baja dimensionalidad (61 entradas, 14 salidas) exportada a ONNX y con un repositorio que redondea a 0.0 GB, la inferencia es viable en CPU; no se requiere GPU.
- **GPU recomendadas**: no aplica para inferencia. Para reentrenar con 2048 entornos paralelos (el ajuste documentado) sí se necesita aceleración por GPU; el modelo de GPU empleado no se especifica en la información disponible.
- **GPU de consumo**: la inferencia cabe sobradamente en cualquier CPU moderna, incluida la computadora embarcada del microduck; no se dispone de cifras medidas de consumo ni de modelo de SoC.
- **Presupuesto temporal**: el control a 50 Hz fija un límite de 20 ms por paso de control, que debe cubrir la lectura de sensores, la inferencia ONNX y el envío de consignas a los 14 actuadores.
- **Opciones de despliegue**: runtime `microduck` mediante `robotctl policy load <slot> AndoShy/microduck-tug-pool2`; inferencia ONNX estándar (ONNX Runtime u otro motor compatible) al ser `policy.onnx` un artefacto portable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. No se publican medidas de tiempo de inferencia ni de frecuencia efectiva alcanzada en hardware real.

## Comparativa con modelos similares

No se dispone de fichas ni de datos técnicos de las políticas comparables. La model card cita explícitamente las políticas usadas como oponentes durante el entrenamiento, pero no publica sus parámetros, contexto ni rendimiento.

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `AndoShy/microduck-tug-pool2` | Política RL para microduck (ONNX) | No disponible | 61-D obs., 14 acciones, 50 Hz | No publicado | No disponible | HuggingFace (0 descargas) |
| `ref_t20-500.onnx` (citada como oponente) | Política RL (ONNX) | No disponible | No disponible | No disponible | No disponible | Referenciada en el comando de entrenamiento |
| `leader_nico.onnx` (citada como oponente) | Política RL (ONNX) | No disponible | No disponible | No disponible | No disponible | Referenciada en el comando de entrenamiento |
| `greecree_v3_mlp.onnx` (citada como oponente) | Política RL tipo MLP (ONNX) | No disponible | No disponible | No disponible | No disponible | Referenciada en el comando de entrenamiento |
| `juicenv.onnx` (citada como oponente) | Política RL (ONNX) | No disponible | No disponible | No disponible | No disponible | Referenciada en el comando de entrenamiento |

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no hay autorización clara para uso comercial, redistribución o modificación. Es un bloqueo potencial para cualquier integración en producto.
- **Especialización extrema**: la política está entrenada únicamente para `Mjlab-TugOfWar-MicroDuck`. No se espera que generalice a otras tareas, terrenos o morfologías sin reentrenamiento.
- **Comportamiento perpetuo**: al no tener condición de terminación, requiere un mecanismo externo de parada o sustitución de política; dejarla cargada implica que el robot seguirá ejecutando la marcha indefinidamente.
- **Sin datos de sim-to-real**: no se publican métricas de rendimiento en el robot físico, ni tasas de caída, ni robustez ante cambios de fricción, carga o superficie. El rendimiento en simulación no garantiza el comportamiento real.
- **No reproducibilidad bit a bit**: el propio autor advierte de que reentrenar con la misma semilla produce una política comparable pero no idéntica; la auditoría exacta de resultados no es posible.
- **Dependencia del pool de oponentes**: el comportamiento está moldeado por ocho políticas concretas. Frente a oponentes fuera de esa distribución el rendimiento es desconocido y podría degradarse.
- **Documentación mínima**: no se detalla la arquitectura de red, el número de parámetros, el tamaño del fichero ONNX ni las versiones de ONNX Runtime soportadas, lo que complica la validación en producción.
- **Ausencia de benchmarks**: sin recompensa media ni tasa de victorias publicada, no hay forma de comparar objetivamente esta política con alternativas.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de lenguaje.
- **Madurez**: 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso externo ni de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AndoShy/microduck-tug-pool2
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: `git@github.com:pollen-robotics/microduck-challenges` (rama `andoshy-tug`, commit `e8b7d782e`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (esquema 2)
- Base de entrenamiento: `mjlab-microduck 0.1.0` en el commit `1efd853be`
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las únicas entradas devueltas por la búsqueda eran contenido no relacionado y se han descartado.
