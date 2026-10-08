# Donghyun1228/pi05-libero-demo-replay-task-wrist-kd-20261008-yaw20

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica publicado por el usuario Donghyun1228 bajo el identificador `pi05-libero-demo-replay-task-wrist-kd-20261008-yaw20`. Por los tags (`openpi`, `pi05`, `libero`, `inverse-dynamics`) y el nombre de la configuración de política (`pi05_libero_action_frame_shared_decoder_idm_demo_replay_cumulative_average_paired_vlm_kd`), se trata de un ajuste fino sobre la familia pi0.5 de openpi, orientado a tareas de manipulación del benchmark LIBERO. La model card no confirma explícitamente esta filiación, por lo que debe tomarse como inferencia a partir de los metadatos.

El trabajo descrito en la model card no es un modelo base nuevo, sino un experimento de entrenamiento: inicialización independiente desde un checkpoint previo ("original-demo cumulative-average pre-adapt v1/4999"), un modelo de dinámica inversa (IDM) condicionado por tarea con horizonte 10, y destilación de conocimiento (KD) desde tres vistas (base, muñeca y prompt) con pesos 1/1/0.25. El entrenamiento consta de 5000 actualizaciones con LR 1e-5, EMA 0.999, semilla 42 y FSDP sobre 4 dispositivos, con lotes globales de 32 para IDM y 32 para KD.

Es relevante ahora únicamente como material de reproducibilidad y estudio dentro de la investigación en modelos visión-lenguaje-acción (VLA): el repositorio incluye parámetros en formato Orbax, activos de normalización y un `training_configuration.json` con comandos, identidades de datos y commit de código. No hay descargas ni "me gusta", no se publica licencia y no se aportan resultados de benchmarks, por lo que no es un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags `openpi`/`pi05`; familia pi0.5 de tipo visión-lenguaje-acción, sin confirmar en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen parámetros en formato Orbax, presumiblemente en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX/Flax), junto con activos de normalización |
| Tamano del repositorio | 12,4 GB |
| Pipeline declarado | robotics |
| Fecha de creacion / actualizacion | 2026-10-08 / 2026-10-08 |
| Descargas / "me gusta" | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red. Lo que sí documenta es el procedimiento de entrenamiento: se parte de una inicialización independiente desde el estado "original-demo cumulative-average pre-adapt v1/4999"; se entrena un IDM condicionado por tarea con horizonte H10; se fijan los pesos de pérdida IL=0, IDM=1 y KD=1/1/0.25 (base, muñeca y prompt); y se ejecutan 5000 actualizaciones con lotes globales de 32 (IDM) y 32 (KD) sobre 4 dispositivos con FSDP, LR 1e-5, EMA 0.999 y semilla 42. El entorno de simulación empleado es MuJoCo 3.2.3.

Una innovación operativa destacable es la asimetría entre configuraciones: la variante "view" congela el *action expert* y solo entrena las vistas de destilación, mientras que la variante "yaw" entrena la política completa. La configuración de política referenciada (`pi05_libero_action_frame_shared_decoder_idm_demo_replay_cumulative_average_paired_vlm_kd`) sugiere un decodificador compartido en el marco de acción con replay de demostraciones y destilación desde un VLM emparejado. Número de tokens de entrenamiento, composición del dataset, y si hubo RLHF/DPO: no disponible.

## Capacidades

- Control robótico por imitación: genera acciones a partir de observaciones y de una tarea especificada, según el esquema de entrenamiento descrito (IDM condicionado por tarea con H10).
- Aprendizaje por destilación desde múltiples vistas: incorpora señales de vista base, de muñeca (*wrist*) y de prompt, lo que en robótica asiste a la adaptación de políticas.
- Replay de demostraciones: el nombre del artefacto indica uso de demostraciones de LIBERO para el ajuste.
- Evaluación en simulación: preparado para ejecutarse contra MuJoCo 3.2.3 en el benchmark LIBERO.
- Soporte de *tool calling* / *function calling*: no disponible (no es una capacidad propia de un checkpoint de política robótica).
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible en la documentación; el pipeline declarado es `robotics`.

## Casos de uso

- Investigación en manipulación robótica con LIBERO: sirve como punto de partida reproducible para estudiar el efecto de IDM condicionado por tarea y destilación multi-vista sobre las tasas de éxito en tareas de manipulación del benchmark.
- Reproducción de experimentos de destilación: el repositorio incluye `training_configuration.json` con comandos, identidades de datos y commit de código, lo que permite repetir las 5000 actualizaciones con los mismos hiperparámetros (LR 1e-5, EMA 0.999, semilla 42, 4 dispositivos FSDP).
- Ablación de variantes de entrenamiento: comparar la variante "view" (action expert congelado) frente a la variante "yaw" (política completa) para aislar la contribución de cada esquema.
- Estudio de pérdidas ponderadas IDM/KD: analizar el efecto de los pesos 1/1/0.25 y de IL=0 sobre la política resultante, verificando si la señal de dinámica inversa sustituye de forma efectiva a la imitación directa.
- Base para ajuste posterior en dominios concretos: al distribuir parámetros Orbax y activos de normalización, el checkpoint puede reutilizarse como inicialización para nuevos ajustes, siempre que se resuelva la ausencia de licencia.
- Docencia y divulgación técnica: ejemplo práctico de un pipeline VLA que combina simulación MuJoCo, entrenamiento distribuido FSDP y control por acción, útil en cursos de robótica o aprendizaje por imitación.
- Auditoría de reproducibilidad: dado que el autor documenta identidades de datos y commit, puede emplearse para verificar la trazabilidad de resultados en un entorno de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en LIBERO, ni métricas de pérdida, ni comparaciones numéricas con otros checkpoints. No se debe asumir ningún nivel de rendimiento a partir del nombre del artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa no confirmada, el repositorio pesa 12,4 GB en formato Orbax (parámetros más activos de normalización), por lo que la inferencia en precisión completa probablemente requiera del orden de 16 GB o más de VRAM, y menos si se convierte a bf16. Esta cifra es una estimación, no un dato publicado.
- GPU recomendadas: no disponible en la documentación. El entrenamiento se realizó con FSDP sobre 4 dispositivos, lo que implica hardware de clase centro de datos (no especificado).
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño del repositorio y la ausencia de cuantizaciones publicadas (no hay GGUF), no puede afirmarse que quepa en tarjetas de consumo tipo RTX 4090 sin conversión previa.
- Opciones de despliegue: el artefacto se distribuye en formato Orbax, por lo que su carga natural es el ecosistema JAX/Flax asociado a openpi. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, y ninguno de ellos aplica de forma directa a un checkpoint de política VLA.
- Latencia y throughput: no disponible. No se aportan mediciones de frecuencia de control, latencia por paso ni pasos por segundo en MuJoCo.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. Este checkpoint pertenece, por los tags declarados, a la familia openpi/pi0.5 y comparte categoría con otros modelos visión-lenguaje-acción para manipulación (por ejemplo, el propio pi0.5 de openpi, alternativas de la serie GR00T o SmolVLA). Sin embargo, la model card no aporta parámetros, contexto, licencia ni métricas de ninguno de ellos, y la búsqueda web realizada no devolvió documentación técnica reutilizable, por lo que cualquier tabla numérica sería inventada. Se indica por tanto: no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | no disponible | no disponible | no publicado | no disponible | HuggingFace, 0 descargas |
| Alternativas de la familia openpi / VLA | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de licencia: sin licencia declarada no puede asumirse permiso de uso comercial, redistribución ni obra derivada. Es un bloqueo para cualquier despliegue en producción.
- Sin resultados de evaluación: no hay tasas de éxito en LIBERO ni ninguna métrica publicada, por lo que se desconoce si el ajuste mejora o degrada el checkpoint de partida.
- Artefacto de investigación con 0 descargas y 0 "me gusta": no ha sido validado por terceros.
- Riesgo de alucinación: en el contexto de un modelo de política robótica, el equivalente es la generación de acciones incoherentes o inseguras fuera de la distribución de entrenamiento; no se documentan salvaguardas.
- Sesgos conocidos: no disponible. No se documenta la composición del dataset de demostraciones ni su cobertura de escenarios, objetos o iluminaciones.
- Limitación de dominio: el entrenamiento está vinculado al simulador MuJoCo 3.2.3 y al benchmark LIBERO. No hay evidencia de transferencia a hardware real (sim-to-real) ni de robustez ante variaciones físicas.
- Limitaciones de idioma y contexto: no disponible.
- Formato restrictivo: los pesos en Orbax exigen el ecosistema JAX/Flax; no hay conversiones a safetensors, GGUF ni otros formatos, lo que dificulta su integración en pilas de inferencia habituales.
- Trazabilidad parcial: aunque se referencian `training_configuration.json` y un commit de código, el repositorio no publica un paper ni documentación de arquitectura, lo que limita la reproducibilidad completa.
- Fechas incoherentes con el momento de consulta (creación y actualización el 2026-10-08): conviene verificar la vigencia y el estado del repositorio antes de reutilizarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-demo-replay-task-wrist-kd-20261008-yaw20
- Repositorio openpi de Physical Intelligence (referencia externa, no citada en la model card): https://github.com/Physical-Intelligence/openpi
- Benchmark LIBERO (referencia externa, no citada en la model card): no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponible
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos resultados obtenidos fueron foros sin relacion con el contenido.
