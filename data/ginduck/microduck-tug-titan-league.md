# GinDuck/microduck-tug-titan-league

## Resumen

`GinDuck/microduck-tug-titan-league` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Hugging Face y Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una red neuronal de política que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a 50 Hz, empaquetada en formato ONNX para su ejecución en el propio robot. La política se ha afinado a partir de la red base `titan-v1` de azukiq, campeona de la primera copa de Microduck, con un paso adicional de ajuste contra los contrincantes más fuertes de esa competición.

El modelo resuelve un problema muy concreto: dotar al Microduck de una marcha (gait) perpetua y estable para la tarea de tira y afloja (`Mjlab-TugOfWar-MicroDuck`), cargable directamente en una ranura de política del demonio `robotctl` del robot. Su relevancia es acotada pero clara para la comunidad de robótica de refuerzo: es un artefacto reproducible (mismo código, mismo `uv.lock`, misma semilla) y un ejemplo de política entrenada con simulación masiva (4096 entornos en paralelo) y desplegada en hardware real de bajo coste.

El repositorio es extremadamente ligero (0.0 GB), con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 7 de noviembre de 2026. No se dispone de información sobre licencia, idiomas ni resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico (reinforcement learning), empaquetada en ONNX; arquitectura interna no detallada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (capas, dimensiones ocultas, tipo de activación). Se sabe que es una política de reinforcement learning entrenada en simulación con `mjlab-microduck 0.1.0` (commit `1efd853be`), sobre la tarea `Mjlab-TugOfWar-MicroDuck`, dentro del repositorio `pollen-robotics/microduck-challenges` (rama `tug-league`, commit `c8db3437c`). El entrenamiento se realizó con 4096 entornos en paralelo, 100 iteraciones máximas, semilla 1 y registro en TensorBoard.

La política parte de la red `titan-v1` de azukiq y se afina un paso contra los contrincantes más fuertes de la primera copa. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El entrenamiento no es bit-reproducible entre máquinas: repetirlo con la misma configuración produce una política comparable, no idéntica.

## Capacidades

- Control locomotor del Microduck: genera una marcha perpetua a 50 Hz hasta que se le indique lo contrario.
- Mapeo de observaciones de 61 dimensiones a 14 acciones de control.
- Ejecución de la tarea de tira y afloja (`TugOfWar`) contra otros agentes.
- Carga directa en una ranura de política del demonio `robotctl` mediante `sudo robotctl policy load <slot> GinDuck/microduck-tug-titan-league`.
- Normalización de observaciones incorporada en el modelo ONNX (no requiere preprocesado externo).
- No soporta tool calling, agentes multi-paso, razonamiento, código, matemáticas, visión ni audio: es una política de control motor, no un modelo de lenguaje.

## Casos de uso

- Competición de tira y afloja con Microduck: cargar la política en una ranura y enfrentarla a otras políticas de la liga para evaluar su robustez frente a contrincantes entrenados.
- Demostración de locomoción perpetua en ferias y eventos: la política mantiene una marcha estable sin intervención, adecuada para exhibiciones del robot de 399 USD.
- Base para ajuste fino (fine-tuning) en tareas derivadas: al ser una política de partida fuerte, sirve como inicialización para nuevas tareas de la familia `microduck-challenges`.
- Evaluación comparativa de políticas: usar el mismo `manifest.json` y el mismo pipeline `robotctl` para medir el rendimiento de `tug-titan-league` frente a `rumezhak/microduck-tug-league-v1` u otras políticas de la liga.
- Investigación en simulación a realidad (sim-to-real): el modelo es un caso de estudio de transferencia de una política entrenada con 4096 entornos paralelos a hardware real de bajo coste.
- Reproducción de experimentos de RL: el repositorio documenta comando, commit, semilla y `uv.lock` para replicar el entrenamiento y comparar políticas resultantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma la cifra de parámetros.
- GPU recomendadas: no disponible para inferencia; para el entrenamiento se usó GPU con 4096 entornos paralelos (modelo concreto no especificado).
- ¿Cabe en GPU de consumo? No disponible, aunque el tamaño del artefacto (0.0 GB) apunta a que sí; no se confirma.
- Opciones de despliegue: ejecución en el propio robot mediante el demonio `robotctl` y el runtime `microduck`; formato ONNX, por lo que podría ejecutarse con ONNX Runtime en otros entornos, aunque no se documenta.
- Latencia y throughput estimados: la política opera a 50 Hz (periodo de 20 ms por ciclo de control); no se publican cifras de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Autor | Tarea | Formato | Licencia | Descargas | Notas |
|---|---|---|---|---|---|---|
| `GinDuck/microduck-tug-titan-league` | GinDuck | TugOfWar (Microduck) | ONNX | no disponible | 0 | Afinado desde `titan-v1` de azukiq |
| `rumezhak/microduck-tug-league-v1` | rumezhak | TugOfWar (Microduck) | no disponible | no disponible | no disponible | Política de la misma liga, cargable con `robotctl` |
| `titan-v1` | azukiq | TugOfWar (Microduck) | no disponible | no disponible | no disponible | Red base campeona de la primera copa |

No se dispone de datos de parámetros, contexto ni rendimiento para establecer una comparación cuantitativa entre estas políticas.

## Limitaciones y advertencias

- Ámbito muy restringido: solo es útil para el robot Microduck y la tarea de tira y afloja; no es un modelo de propósito general.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de usarla en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a otras políticas de la liga.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas; los pesos no se pueden regenerar de forma idéntica.
- Dependencia de la base `titan-v1`: el crédito de la red base es de azukiq, y las condiciones de uso de esa base no se detallan.
- Riesgo de sobreajuste a los contrincantes de la primera copa: el ajuste se hizo contra "las políticas más fuertes de esa copa", lo que puede reducir la generalización frente a políticas nuevas.
- Sin información sobre sesgos, alucinación o limitaciones de idioma: no aplica al ser una política de control motor, pero tampoco se documenta su comportamiento en condiciones fuera de distribución.
- Repositorio sin actividad: 0 descargas y 0 likes en la fecha de consulta, lo que dificulta la validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-tug-titan-league
- Repositorio de retos de Microduck: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del demonio): no disponible como enlace directo en la información proporcionada
- Noticia sobre el Microduck de Hugging Face: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Política comparable `rumezhak/microduck-tug-league-v1`: https://huggingface.co/rumezhak/microduck-tug-league-v1
