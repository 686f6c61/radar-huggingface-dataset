# GinDuck/microduck-sprint-2m-sprint-1-c

## Resumen

microduck-sprint-2m-sprint-1-c es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje: es un checkpoint de aprendizaje por refuerzo entrenado con el entorno de simulación mjlab (basado en MuJoCo) para producir una marcha (gait) que se ejecuta de forma perpetua en el robot real. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye en formato ONNX con la normalización de observaciones ya integrada en el grafo.

El checkpoint corresponde a la iteración 1500 de un entrenamiento con 4096 entornos paralelos, semilla 1, sobre la receta estándar de Pollen Robotics (rama `main` del repositorio microduck-challenges, commit `dc73b9237`). El autor lo describe explícitamente como su primera ejecución de sprint, sin ajuste fino posterior, por lo que debe interpretarse como una línea base reproducible más que como un resultado optimizado.

Su relevancia es acotada pero clara para quien trabaja con robótica de bajo coste: demuestra el flujo completo de entrenamiento, exportación y despliegue de políticas RL en hardware microduck, con instrucciones de reproducción exactas y un manifiesto de política versionado (schema 2). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos aún no se han subido o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal) exportada a ONNX; arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Checkpoint | 1500 |
| Semilla | 1 |
| Entornos paralelos de entrenamiento | 4096 |
| Iteraciones maximas de entrenamiento | 3000 |
| Entorno / tarea | `Mjlab-Sprint2m-MicroDuck` (mjlab-microduck 0.1.0 @ 1efd853be) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, activaciones ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: una política que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, con normalización de observaciones incluida dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto. El comportamiento es perpetuo: la política genera una marcha continua hasta que se le indique lo contrario, y se carga en una ranura (slot) del daemon del robot mediante `robotctl policy load`.

El entrenamiento se realizó con mjlab, un stack de RL sobre MuJoCo, con 4096 entornos simulados en paralelo, hasta 3000 iteraciones y semilla 1, sobre la receta sin modificar de Pollen Robotics. El autor advierte que el proceso no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, commit y semilla produce una política comparable, no idéntica. No se documenta el número total de pasos, la composición de recompensas, ni si hubo fases de ajuste adicionales.

## Capacidades

- Locomoción cuadrúpeda perpetua: genera una marcha continua para el robot microduck a 50 Hz.
- Mapeo directo observación-acción: 61 entradas, 14 salidas, sin necesidad de preprocesado externo (normalizador embebido en el ONNX).
- Despliegue en hardware real mediante el daemon de microduck y `robotctl policy load`.
- Compatibilidad con el manifiesto de política schema 2 del repositorio del daemon.
- Reproducibilidad documentada del pipeline de entrenamiento (commit, semilla, comando exacto).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de bajo coste: sirve como línea base para comparar políticas posteriores sobre el mismo entorno `Mjlab-Sprint2m-MicroDuck`, ya que la configuración de entrenamiento está fijada y documentada.
- Docencia y formación en RL aplicado a robótica: el comando de reproducción completo permite a estudiantes reentrenar y observar la variabilidad entre ejecuciones con la misma semilla.
- Validación de la cadena de despliegue microduck: útil para verificar que el daemon, el formato de manifiesto schema 2 y la carga en slots funcionan de extremo a extremo antes de invertir en políticas optimizadas.
- Pruebas de integración en CI: al ser un ONNX con normalizador embebido, se puede ejecutar en un runner sin GPU para comprobar que la interfaz de 61 observaciones y 14 acciones se respeta.
- Benchmark interno de velocidad: el propio autor lo califica como "no un récord de velocidad", por lo que es adecuado como referencia inferior contra la que medir políticas afinadas.
- Experimentos de sim-to-real: permite estudiar la brecha entre simulación (MuJoCo) y el robot físico con una política no optimizada, aislando el efecto de la receta de entrenamiento.
- Base para ajuste fino: al estar entrenado con la receta estándar y sin tuning, es un punto de partida razonable para probar cambios de recompensa o de dominio de aleatorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica únicamente que el checkpoint "no es un récord de velocidad" y que corresponde a la iteración 1500 de 3000 máximas, sin aportar métricas de velocidad, estabilidad, consumo ni tasa de caídas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo de muy pocos parámetros, probablemente ejecutable en CPU.
- GPU recomendadas: no disponible. Para el entrenamiento, el comando usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100 o H100) o un nodo multi-GPU; no se especifica el hardware exacto empleado.
- ¿Cabe en GPU de consumo? No confirmado, pero por el tamaño declarado del repositorio es altamente probable que la inferencia quepa en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: ONNX Runtime para inferencia; el despliegue en robot se realiza con el daemon de microduck vía `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-1-c`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo), que la política debe cumplir en el robot.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-sprint-2m-sprint-1-c | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otras políticas de microduck en el ecosistema Pollen | Políticas RL | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas de locomotion para cuadrúpedos comerciales (p. ej. Unitree) | Políticas RL | no disponible | no disponible | habitualmente no pública | no comparable directamente por hardware distinto |

No se dispone de información sobre modelos comparables de la misma categoría y tamaño en la documentación consultada. La comparación con políticas de cuadrúpedos comerciales no es homogénea por diferencias de morfología, actuadores y sensórica.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Modelo no optimizado: el propio autor lo describe como una primera ejecución sin ajuste, por lo que el rendimiento de marcha será inferior al de políticas afinadas.
- Reproducibilidad limitada: el entrenamiento no es bit-reproducible entre máquinas; los pesos no se pueden regenerar de forma idéntica.
- Repositorio de 0.0 GB: no está confirmado que `policy.onnx` y `manifest.json` estén efectivamente subidos; conviene verificar antes de integrar.
- Cero adopción: 0 descargas y 0 likes implican ausencia de validación por terceros.
- Sin datos de robustez: no se documentan pruebas ante empujes, terrenos irregulares, fallos de actuadores ni variaciones de carga.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, los sesgos relevantes serían de comportamiento físico (p. ej. asimetrías de marcha), no documentados.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es una política que genere acciones fuera de rango ante observaciones fuera de distribución, sin que se documente ningún mecanismo de seguridad.
- Dependencia del daemon: el despliegue requiere la versión del daemon compatible con el manifiesto schema 2; versiones distintas pueden rechazar la carga.
- Idiomas y contexto: no aplica; no debe evaluarse como modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-1-c
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de política: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)
- Enlace externo citado por el autor (no técnico): https://www.imundo.ch/quackpack/
