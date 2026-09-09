# ruirui4/bridgevla-wam

## Resumen

El repositorio `ruirui4/bridgevla-wam` contiene checkpoints de entrenamiento del proyecto BridgeVLA, concretamente los modelos "forward world-action-model" (WAM) para los entornos LIBERO y π0.5. Publicado por el usuario ruirui4 el 8 de septiembre de 2026, el repositorio está bajo licencia Apache 2.0.

El model card describe tres ejecuciones: dos para `forward-wam-train-smoke` y una para `forward-wam-libero10`, todas con un tamaño indicado de 154M. Los checkpoints se distribuyen en archivos `.pt` (best.pt, last.pt) acompañados de configuraciones, métricas, logs de entrenamiento y metadatos del entorno.

Se trata de un modelo orientado a robótica y modelado de acción, vinculado al proyecto BridgeVLA. La información disponible no incluye detalles sobre la arquitectura interna, el contexto de entrada ni el rendimiento en benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivos `.pt` (PyTorch) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura exacta de estos checkpoints. El model card los describe como "forward world-action-model (WAM) from the bridgeVLA project", con referencias a LIBERO y π0.5. El repositorio oficial de BridgeVLA en GitHub describe BridgeVLA++ como un modelo VLA (Vision-Language-Action) que pre-entrena un VLM para predecir mapas de calor 2D condicionados por lenguaje sobre datos de detección de objetos; para manipulación 3D, las nubes de puntos se renderizan en imágenes multi-vista y las acciones se predicen como mapas de calor en ese mismo espacio 2D. No se confirma que los checkpoints de este repositorio implementen exactamente esa arquitectura.

Respecto al entrenamiento, la tabla del model card recoge tres runs con logs, métricas y configuraciones. No se especifica el número de tokens, la composición del dataset ni si se aplicó RLHF o DPO.

## Capacidades

Basándose en la información disponible, se pueden inferir las siguientes características, aunque no se han verificado con documentación detallada:

- Predicción de acciones de manipulación robótica en entornos como LIBERO (inferido a partir de los tags y el nombre).
- Modelado de estados futuros o dinámicas del entorno (world action model).
- Generación de acciones condicionadas por lenguaje, según la línea de modelos VLA (no confirmado en este repositorio).
- No se ha documentado soporte de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

Los siguientes casos de uso son posibilidades razonables para un modelo de este tipo, basadas en la descripción como world-action-model; no se han verificado con datos del repositorio.

- Investigación en manipulación robótica: los checkpoints de `forward-wam-libero10` permiten estudiar cómo un modelo de mundo predice acciones en el benchmark LIBERO. Al incluir `metrics.json`, se pueden comparar variantes de entrenamiento sin reproducir el proceso completo.
- Replicación de experimentos: los archivos `resolved_config.yaml`, `environment.json` y `train_log.jsonl` documentan el entorno y las configuraciones, lo que facilita la re-ejecución de las tres runs en un laboratorio.
- Fine-tuning para nuevos entornos: a partir de los pesos `.pt` de `best.pt` es posible inicializar un modelo para tareas de manipulación en mundos simulados distintos, acelerando el entrenamiento.
- Modelado de dinámica de mundo: un WAM puede integrarse en un bucle de aprendizaje por refuerzo para predecir el siguiente estado y recompensa, mejorando la eficiencia de muestras.
- Planificación de tareas: en una arquitectura de robot autónomo, el modelo puede generar secuencias de acciones candidatas que luego se filtran con un planificador de alto nivel.
- Comparación de configuraciones: las dos runs `smoke` y la run `libero10` sirven para analizar el efecto de distintas hiperconfiguraciones sobre la pérdida de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card menciona la existencia de un archivo `metrics.json`, pero su contenido no se ha proporcionado y no se conocen valores de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- No se proporcionan requisitos de hardware.
- El repositorio ocupa 0.5 GB, lo que sugiere que los checkpoints son de tamaño contenido, pero no se puede estimar la VRAM necesaria ni las GPU recomendadas.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el rendimiento de este modelo frente a alternativas como OpenVLA, RT-2 o π0. Los datos proporcionados no incluyen benchmarks ni comparaciones.

## Limitaciones y advertencias

- La información disponible no detalla sesgos conocidos ni riesgos de alucinación para este modelo.
- El model card no especifica la longitud de contexto ni los idiomas, por lo que no se puede garantizar su comportamiento fuera de los entornos robóticos previstos.
- Los checkpoints parecen pertenecer a un proyecto de investigación; podrían no estar listos para producción.
- Se necesitará el código de BridgeVLA para cargar y ejecutar los pesos; el repositorio de HuggingFace no incluye instrucciones de uso.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación dificulta el despliegue en sistemas reales.
- No se ha confirmado la relación exacta entre estos checkpoints y la arquitectura BridgeVLA descrita en GitHub.

## Enlaces

- HuggingFace: https://huggingface.co/ruirui4/bridgevla-wam
- Repositorio de BridgeVLA (GitHub): https://github.com/BridgeVLA/BridgeVLA
