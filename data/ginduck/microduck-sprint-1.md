# GinDuck/microduck-sprint-1

## Resumen

microduck-sprint-1 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una policy de locomoción que, a partir de una observación de 61 dimensiones, genera 14 acciones de control a 50 Hz. El autor la publica bajo el identificador GinDuck/microduck-sprint-1 y la describe como su primer "sprint", con una marcha que recorre dos metros de forma estable y completa todas las ejecuciones.

El modelo se distribuye como un fichero ONNX con el normalizador de observaciones integrado, acompañado de un manifest.json que sigue el esquema 2 del manifiesto de políticas del daemon de microduck. Está pensado para cargarse directamente en una ranura de política del robot mediante el comando robotctl, sin necesidad de preprocesar las observaciones en el host.

La relevancia es acotada pero clara para quien trabaja con robótica de bajo coste: demuestra el flujo completo de entrenamiento con mjlab, exportación a ONNX y despliegue en hardware real dentro del ecosistema microduck. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se especifican licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal, detalles no disponibles); observación de 61 dimensiones, 14 acciones, 50 Hz |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) más manifest.json |

## Arquitectura y entrenamiento

La política se entrenó con mjlab (base mjlab-microduck 0.1.0, commit 1efd853be) sobre la tarea Mjlab-Sprint2m-MicroDuck del repositorio microduck-challenges, en la rama main y el commit dc73b9237. El entrenamiento usó 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y logging en TensorBoard, con el checkpoint 1000 como resultado publicado. La fecha de inicio registrada es 2026-11-01T08:27:21Z.

El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo uv.lock y la misma semilla produce una política comparable, no los mismos pesos. La política es de tipo "perpetuo": no tiene condición de terminación y se ejecuta hasta que se le indique lo contrario. El normalizador de observaciones está embebido en policy.onnx, de modo que la entrada son observaciones en crudo.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha estable que recorre dos metros y finaliza todas las ejecuciones según el autor.
- Control reactivo a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones.
- Emisión de 14 acciones de control por paso de inferencia.
- Ejecución continua sin condición de parada interna (política perpetua).
- Preprocesado integrado: el normalizador de observaciones va incluido en el ONNX.
- Despliegue directo en el robot mediante robotctl policy load en una ranura de política.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Demostración de locomoción básica en microduck: cargar la política en una ranura y verificar que el robot avanza dos metros de forma estable, como prueba de puesta en marcha del hardware.
- Docencia y talleres de robótica: usar la política como referencia funcional para que los estudiantes comparen sus propias políticas con una marcha que completa el recorrido.
- Reproducción de experimentos de RL: ejecutar el comando de entrenamiento documentado (4096 entornos, 3000 iteraciones, semilla 1) para generar políticas comparables y estudiar la varianza entre ejecuciones.
- Pruebas de integración del daemon: validar el esquema 2 del manifiesto de políticas y el flujo de robotctl policy load en un entorno de desarrollo.
- Benchmark interno de control: servir como línea base de locomoción sobre la que medir mejoras de estabilidad, velocidad o consumo en políticas posteriores.
- Pruebas de robustez en banco: al ser una política perpetua, permite ejecuciones largas para observar deriva, calentamiento de actuadores o degradación de la marcha.
- Sustitución de políticas en caliente: al cargarse en una ranura, facilita comparar esta política con otras en el mismo robot sin recompilar el daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica cualitativamente que la marcha recorre dos metros de forma estable y completa todas las ejecuciones; no se aportan métricas numéricas de recompensa, velocidad, consumo ni tasa de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se publica el número de parámetros. Por la naturaleza de la tarea (61 entradas, 14 salidas, 50 Hz) es previsible que el modelo sea muy pequeño, pero no hay datos que lo confirmen.
- GPU recomendadas: no disponibles. La inferencia se ejecuta en el propio robot a través del daemon, no en un servidor.
- GPU para entrenamiento: no se especifica el modelo utilizado; el comando de reproducción usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de gama alta, pero no se indica cuál.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck y el comando robotctl policy load; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms) según la model card; no se publican latencias de inferencia medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-sprint-1 | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| Otras políticas de microduck-challenges | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio de retos de Pollen Robotics |
| Políticas de locomoción para cuadrúpedos comerciales (p. ej. Unitree) | Políticas RL propietarias o de referencia | no disponible | no disponible | habitualmente restrictiva | no disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No hay licencia declarada: no se puede asumir permiso de uso comercial ni de redistribución sin consultar al autor.
- Entrenamiento no reproducible bit a bit: los pesos no se pueden regenerar de forma idéntica, solo obtener políticas comparables.
- Política perpetua sin condición de parada: requiere supervisión externa y un mecanismo de parada en el robot para evitar ejecuciones indefinidas.
- Entrenada para una única tarea (avanzar dos metros de forma estable); no se documenta robustez ante terrenos irregulares, empujes o perturbaciones.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución; al ser un modelo de control, los riesgos son físicos (caídas, deriva) más que lingüísticos.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB: conviene verificar la integridad de los artefactos antes de desplegar.
- Sin información sobre idiomas, cuantizaciones alternativas ni versiones futuras.
- Fechas de creación y actualización registradas en 2026-11-02, posteriores a la fecha habitual de consulta; verificar la coherencia de los metadatos antes de usarla en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GinDuck/microduck-sprint-1
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: docs/policy-manifest.md en el repositorio del daemon de microduck (ruta citada en la model card; URL completa no disponible)
