# pawanpaudel93/pi05-droid-fp16-ov

## Resumen

π0.5 DROID en formato OpenVINO es un paquete de política (policy package) derivado de `lerobot/pi05_droid`, la política generalista π0.5 de Physical Intelligence ajustada (fine-tuned) para el entorno robótico DROID con brazo Franka. El paquete lo publica el usuario pawanpaudel93 y su función es permitir el despliegue del modelo sobre CPUs y GPUs Intel mediante el motor `ov-policy` de Cascadia, sin necesidad de ejecutar el grafo PyTorch original. Se trata, por tanto, de una conversión de formato y de un empaquetado de artefactos (pesos, tokenizador y estadísticas de normalización), no de un modelo entrenado desde cero.

El modelo subyacente es un vision-language-action (VLA) construido sobre PaliGemma, que combina percepción visual, instrucción en lenguaje natural y salida de acciones motoras en forma de chunks. La conversión mantiene el grafo en float32 con pesos en fp16 y añade las estadísticas de normalización publicadas por openpi para DROID, ausentes en el checkpoint de LeRobot. El repositorio ocupa 6,3 GB y se distribuye bajo los términos de Gemma.

Su relevancia es práctica: facilita llevar una política VLA de robótica a hardware Intel con un runtime de inferencia estandarizado, algo poco habitual en el ecosistema, donde dominan las exportaciones a ONNX o TensorRT. No obstante, el propio autor advierte de que el soporte necesario de Cascadia aún no está en una release pública y de que no se han medido latencia ni éxito de tarea en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre PaliGemma; grafo OpenVINO IR (float32) con pesos fp16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos); grafo en float32 |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan como prompt de texto) |
| Licencia | Gemma Terms of Use (con restricciones de la sección 3.2 y Prohibited Use Policy) |
| Formato de pesos | OpenVINO IR (`pi05.xml` / `pi05.bin`) y tokenizador OpenVINO (`tokenizer.xml` / `tokenizer.bin`) |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: es una conversión del checkpoint `lerobot/pi05_droid` (revisión `72824c0a93f00ce5bb8bedb7feb58953ba1da364`), que a su vez es la política π0.5 de Physical Intelligence ajustada para DROID. La arquitectura subyacente es un VLA multimodal que procesa dos cámaras RGB (exterior `base_0_rgb` y muñeca `left_wrist_0_rgb`) a 224×224 con padding centrado, un vector de estado de 8 dimensiones (7 posiciones articulares más pinza) y una instrucción de tarea en texto, y produce un chunk de 15 acciones de anchura 32, de las cuales se conservan las 8 primeras (7 velocidades articulares más posición de pinza).

La conversión introduce varios cambios respecto al original: exportación a OpenVINO IR, incorporación de las estadísticas de normalización de openpi para DROID (recortadas de 32 a las 8 dimensiones reales, ya que el checkpoint de LeRobot no las incluye), servicio de la cámara `right_wrist_0_rgb` como ranura vacía enmascarada (valor −1), tal como hace la política DROID de openpi, y conversión del tokenizador de PaliGemma a formato OpenVINO. La verificación reportada compara las acciones servidas frente a PyTorch en CPU a f32 sobre 5 fotogramas reales del dataset DROID: error absoluto máximo de 1,2e-3 y medio de 1,5e-4, frente a una magnitud media de acción de 0,10; la comprobación interna del exportador da un máximo de 1,3e-3. No se detallan datos de entrenamiento, número de tokens ni si hubo RLHF o DPO en la información disponible.

## Capacidades

- Generación de acciones robóticas en bucle cerrado a partir de observaciones visuales y una instrucción de tarea en lenguaje natural.
- Control de un brazo Franka en el entorno DROID: salida de 7 velocidades articulares más posición de pinza por paso.
- Predicción de chunks de acción (15 pasos por inferencia), lo que permite ejecutar varios pasos por llamada al modelo.
- Procesamiento multimodal con dos vistas de cámara (exterior y muñeca).
- Condicionamiento por prompt de texto para especificar la tarea.
- Ejecución sobre CPU y GPU Intel mediante el motor `ov-policy` de Cascadia.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas ni otras modalidades (audio, vídeo) en la información disponible.

## Casos de uso

- Investigación en manipulación robótica con Franka: servir la política en una estación Intel para evaluar generalización de π0.5 en tareas DROID sin depender de GPUs NVIDIA.
- Prototipado de pipelines VLA en laboratorio: usar el paquete como referencia de integración entre LeRobot, openpi y un runtime OpenVINO, comparando acciones contra PyTorch con la verificación incluida.
- Despliegue en hardware de borde Intel: ejecutar la política en CPUs o iGPUs integradas en el robot o en un PC industrial cercano, reduciendo coste frente a estaciones con GPU dedicada.
- Validación de paridad numérica: emplear los ficheros de estadísticas de normalización y el tokenizador convertido para reproducir el comportamiento de openpi en un stack alternativo.
- Docencia y demostraciones de VLA: mostrar el flujo completo cámara-estado-prompt-acción con un modelo abierto y un runtime multiplataforma.
- Base para conversiones adicionales: partir de este paquete para exportar a otras precisiones o backends, dado que la receta de exportación (`cascadia export-policy`) está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la verificación de paridad numérica frente a PyTorch:

| Metrica | Valor |
|---|---|
| Error absoluto maximo (acciones vs PyTorch, CPU f32, 5 fotogramas DROID) | 1,2e-3 |
| Error absoluto medio | 1,5e-4 |
| Magnitud media de accion (referencia) | 0,10 |
| Error maximo del chequeo interno del exportador | 1,3e-3 |
| Latencia en GPU Intel | no medida |
| Exito de tarea en robot | no medido |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 6,3 GB con pesos fp16, por lo que se requiere al menos ese orden de magnitud en memoria para cargar el grafo y el tokenizador.
- GPU recomendadas: no se especifican modelos concretos; el autor indica soporte para CPUs y GPUs Intel.
- GPU de consumo: no confirmado; al ser un runtime OpenVINO sobre hardware Intel, podría ejecutarse en iGPU integradas, pero no hay mediciones publicadas.
- Opciones de despliegue: motor `ov-policy` de Cascadia (`cascadia run ./pi05-droid-fp16-ov --engine ov-policy --device GPU`), con una build que incluya soporte de π0.5 DROID (manejo de `pad_to` en el estado y ranuras de cámara vacías), aún no incluida en una release.
- Latencia y throughput: no medidos según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| π0.5 DROID OpenVINO (este paquete) | no disponible | no disponible | OpenVINO IR fp16 | Gemma Terms | Conversión de `lerobot/pi05_droid`; verificado numéricamente; sin métricas de éxito |
| lerobot/pi05_droid | no disponible | no disponible | PyTorch (LeRobot) | Gemma Terms | Checkpoint original; sin estadísticas de normalización incluidas |
| π0.5 de openpi (Physical Intelligence) | no disponible | no disponible | PyTorch (openpi) | Apache-2.0 + Gemma Terms | Implementación de referencia con `norm_stats.json` y cliente DROID |
| Otras políticas VLA (p. ej. OpenVLA, RT-2) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No se han medido latencia, throughput ni tasa de éxito en robot real; el paquete solo está validado numéricamente contra PyTorch.
- Requiere una build de Cascadia con soporte de π0.5 DROID que aún no está publicada en una release, lo que limita su uso inmediato en producción.
- La cámara `right_wrist_0_rgb` se sirve vacía y enmascarada; el modelo no la utiliza, a diferencia de configuraciones con tres vistas.
- Las estadísticas de normalización se han recortado de 32 a 8 dimensiones; cualquier uso con un espacio de estado distinto puede degradar el comportamiento.
- Licencia Gemma: uso comercial sujeto a los Gemma Terms of Use, incluidas las restricciones de la sección 3.2 y la Prohibited Use Policy; es necesario revisar ambas antes de cualquier despliegue.
- Riesgo de alucinación y sesgos del modelo base (PaliGemma/π0.5) no documentados en esta ficha; no hay evaluación específica publicada.
- Idiomas soportados no especificados; el prompt de tarea se procesa con el tokenizador de PaliGemma, pero no se detalla cobertura lingüística.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/pi05-droid-fp16-ov
- Modelo base: https://huggingface.co/lerobot/pi05_droid
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
