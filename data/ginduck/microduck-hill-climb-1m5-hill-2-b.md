# GinDuck/microduck-hill-climb-1m5-hill-2-b

## Resumen

`hill-climb-1m5-hill-2-b` es una política de control para robots entrenada mediante aprendizaje por refuerzo, publicada por el usuario GinDuck en HuggingFace. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador neuronal que se ejecuta sobre el robot cuadrúpedo de código abierto microduck de Pollen Robotics, con una observación de 61 dimensiones y 14 acciones a una frecuencia de control de 50 Hz. El objetivo concreto de la política es subir una rampa ("hill climb" a 1,5 m) a la máxima velocidad posible manteniendo la trayectoria, completando cada episodio en torno a 1,3 segundos.

La política se ha entrenado desde cero con el framework mjlab (basado en MuJoCo) sobre el repositorio `microduck-challenges`, rama `race-2`, commit `b44f7ffc9`, con 4096 entornos paralelos, semilla 1 y checkpoint 2500. El resultado se distribuye como un fichero ONNX (`policy.onnx`) con el normalizador de observaciones embebido, más un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. Es, por tanto, una política "perpetua": se carga en una ranura de política del demonio `robotctl` y se ejecuta de forma continua hasta que se le indique lo contrario.

Su relevancia es la de un artefacto de robótica reproducible y de bajo nivel: demuestra el flujo completo de entrenamiento en simulación y despliegue en hardware real para un robot de bajo coste, con instrucciones explícitas de reproducción. No hay información sobre licencia, idiomas ni benchmarks estandarizados, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control por refuerzo (red feed-forward; detalles de capas no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (distribución en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, función de activación). Lo que sí se documenta es el contrato de interfaz: 61 dimensiones de observación y 14 acciones, ejecutadas a 50 Hz sobre el robot microduck. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El `manifest.json` sigue el esquema 2 del manifiesto de políticas del daemon de microduck.

El entrenamiento se realizó con aprendizaje por refuerzo en simulación (mjlab 0.1.0 sobre MuJoCo, commit base `1efd853be`), tarea `Mjlab-HillClimb1m5-MicroDuck`, con 4096 entornos paralelos, hasta 3000 iteraciones máximas, semilla 1 y checkpoint final 2500, registrando en TensorBoard bajo el nombre de ejecución `hill-2`. No se documenta el algoritmo concreto de RL (PPO u otro), la composición de recompensas ni el número total de pasos de entrenamiento. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir la receta con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción de subida de rampa ("hill climb" a 1,5 m) a velocidad máxima, manteniendo la línea de trayectoria.
- Ejecución de episodios completos en aproximadamente 1,3 segundos por carrera.
- Política perpetua: se ejecuta de forma continua hasta recibir una orden de parada o sustitución.
- Control reactivo a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Integración directa con el demonio de políticas de microduck mediante `robotctl policy load`.
- Normalización de observaciones embebida en el modelo ONNX (sin preprocesado externo).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Despliegue en hardware microduck para pruebas de subida de rampa: cargar la política en una ranura con `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-2-b` y evaluar el comportamiento en la rampa de 1,5 m.
- Referencia de línea base en competiciones o retos de microduck: sirve como política de comparación frente a entrenamientos propios en la rama `race-2` del repositorio de retos.
- Reproducción de experimentos de RL en robótica: reentrenar con el comando documentado (4096 entornos, semilla 1, 3000 iteraciones) para estudiar la variabilidad entre ejecuciones.
- Validación de pipelines de simulación a realidad: comprobar que una política entrenada en mjlab/MuJoCo se transfiere al robot físico con el normalizador embebido.
- Benchmark de velocidad de gait: medir tiempos de episodio (~1,3 s) y estabilidad de trayectoria en distintas superficies o ángulos de rampa.
- Integración en el daemon de microduck como ranura de política: probar la carga, el cambio y la parada de políticas perpetuas en el esquema 2 del manifiesto.
- Estudio de control reactivo a 50 Hz: analizar el comportamiento de una política feed-forward con observación de 61 dimensiones en tareas de locomoción rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es el tiempo de episodio de aproximadamente 1,3 segundos por carrera en la tarea de subida de rampa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el modelo se distribuye como ONNX, por lo que el requisito de memoria es presumiblemente mínimo, aunque no se cuantifica.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4096 entornos paralelos en mjlab, lo que típicamente requiere una GPU de datacenter, pero el autor no especifica el hardware utilizado.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño del artefacto (0,0 GB), es plausible que la inferencia quepa en hardware de consumo o incluso en CPU, pero no hay confirmación en la documentación.
- Opciones de despliegue: el runtime previsto es el daemon de microduck con `robotctl`; el modelo se ejecuta como `policy.onnx`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por paso); no se documentan latencias de inferencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-hill-climb-1m5-hill-2-b | Política RL para microduck | no disponible | no aplica | ~1,3 s por episodio en rampa de 1,5 m | no disponible | HuggingFace (0 descargas) |
| Otras políticas de la rama `race-2` de microduck-challenges | Políticas RL para microduck | no disponible | no aplica | no disponible | no disponible | Repositorio de retos de Pollen Robotics |
| Políticas de referencia de microduck (receta de TheSauceman) | Políticas RL para microduck | no disponible | no aplica | no disponible | no disponible | Repositorio de Pollen Robotics |

No se dispone de datos cuantitativos de modelos comparables en la información proporcionada; la comparativa se limita a la categoría y la procedencia.

## Limitaciones y advertencias

- No hay información sobre la licencia: no se puede confirmar el uso comercial ni la redistribución.
- El entrenamiento no es bit-reproducible: la misma receta y semilla producen pesos distintos entre máquinas.
- El modelo está especializado exclusivamente en la tarea de subida de rampa a 1,5 m; no se documenta su comportamiento en otras tareas, terrenos o ángulos.
- No se documentan sesgos, pero al ser una política de RL entrenada en simulación, existe riesgo de brecha simulación-realidad (sim-to-real gap) no cuantificada.
- No se documentan métricas de robustez ante perturbaciones, cambios de fricción o cargas.
- El repositorio tiene 0 descargas y 0 likes, y el artefacto ocupa 0,0 GB; no hay evidencia de validación por terceros.
- La fecha de creación (2026-11-04) y la referencia al checkpoint 2500 sugieren un artefacto reciente y sin historial de uso.
- No aplica como modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-b
- Repositorio de retos de microduck: https://github.com/pollen-robotics/microduck-challenges
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon de microduck (URL exacta no disponible)
