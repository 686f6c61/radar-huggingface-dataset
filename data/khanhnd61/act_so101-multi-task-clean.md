# khanhnd61/act_so101-multi-task-clean

## Resumen

`khanhnd61/act_so101-multi-task-clean` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. El modelo lo publica el usuario khanhnd61 en Hugging Face y se ha entrenado y exportado con LeRobot 0.6.1, la librería de robótica de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado de las articulaciones y dos flujos de vídeo, y produce comandos de actuación de 6 dimensiones para un brazo seguidor SO-101.

El checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB. Está especializado en tres tareas de manipulación dictadas por instrucción textual: "Put the tape into the box", "Put the tape into the cup" y "Put the cup into the box". Se entrenó sobre un único dataset propio de 44 episodios y 15.317 fotogramas grabados a 30 FPS, con dos cámaras (`front` y `wrist`) a resolución 480x640.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un *pipeline* completo de imitación de bajo coste sobre hardware SO-101, permite estudiar el comportamiento de ACT en escenarios multitarea y es un punto de partida para *fine-tuning* en tareas similares. Hay que tener en cuenta que la model card no incluye resultados de evaluación, no declara experimentos de robustez y el repositorio acumula 0 descargas y 0 *likes*, por lo que se trata de un artefacto sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer codificador-decoder con CVAE, según arXiv:2304.13705 |
| Parametros totales | 51.668.614 (~51,7 M), dato del repo en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de los LLM. ACT consume un horizonte de observación fijo y predice un *chunk* de acciones; los valores concretos de horizonte y tamaño de chunk no están documentados en la model card ("no disponible") |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no se documenta cuantización |
| Idiomas soportados | No aplica (no es un modelo de lenguaje). Las instrucciones de tarea están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (brazo seguidor SO-101) |
| Entradas | `observation.state` (6,); `observation.images.front` (3, 480, 640); `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de control | 30 FPS (frecuencia del dataset de entrenamiento) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). Su diseño combina un transformador codificador-decoder con un esquema de autoencoder variacional condicional (CVAE): un codificador consume la secuencia de estados y acciones y produce una variable latente que captura la variabilidad del estilo de demostración, mientras que el decodificador transforma las observaciones visuales y propioceptivas en un *chunk* de acciones futuras en lugar de una sola acción. Predecir varios pasos de golpe reduce el problema de error de composición de horizontes y permite ejecutar movimientos suaves con políticas de baja frecuencia efectiva; habitualmente se combina con *temporal ensembling* para promediar predicciones solapadas. En la implementación de LeRobot, ACT usa por defecto un *backbone* visual ResNet-18 preentrenado en ImageNet; la model card de este checkpoint no detalla la configuración exacta del *backbone* ni del CVAE, por lo que ese extremo queda sin confirmar.

El entrenamiento se realizó con LeRobot 0.6.1 durante 19.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Esto supone aproximadamente 152.000 muestras de entrenamiento presentadas. El dataset `khanhnd61/so101-multi-task-clean` contiene 44 episodios y 15.317 fotogramas a 30 FPS, lo que equivale a unos 8,5 minutos de demostraciones teleoperadas repartidas entre tres tareas. No se declara el uso de RLHF, DPO ni ningún otro ajuste por preferencias, ni se documentan aumentos de datos, filtrado de episodios o técnicas de regularización más allá de la propia CVAE.

## Capacidades

- Control visuomotor de un brazo SO-101 (`so_follower`) con 6 dimensiones de estado y 6 dimensiones de acción.
- Ejecución de tres tareas de manipulación por instrucción textual: "Put the tape into the box", "Put the tape into the cup" y "Put the cup into the box".
- Fusión de dos cámaras simultáneas (`front` y `wrist`) con el estado propioceptivo en una única política multitarea.
- Predicción de *chunks* de acciones (acción futura en bloque), lo que permite movimientos más suaves que una política paso a paso.
- Ejecución en bucle cerrado sobre robot real mediante `lerobot-rollout`, con o sin grabación de episodios.
- Reentrenamiento y *fine-tuning* mediante `lerobot-train` sobre datasets grabados con el mismo esquema de observaciones.
- No dispone de *tool calling* ni *function calling*: no es un modelo de lenguaje y no acepta herramientas externas.
- No dispone de razonamiento multi-paso simbólico ni planificación de tareas fuera del conjunto entrenado.
- No dispone de capacidades multilingües, de visión general (VQA, detección abierta) ni de audio.

## Casos de uso

- Automatización de *pick-and-place* en laboratorio: la política puede ejecutar las tres tareas entrenadas sobre un SO-101 real, colocando cinta o vasos en cajas y recipientes, con dos cámaras fijas a 480x640 y control a 30 FPS.
- Base para *fine-tuning* en tareas de manipulación similares: dado su tamaño reducido (51,7 M de parámetros) y su licencia Apache 2.0, es un punto de partida económico para reentrenar con un dataset propio y el mismo esquema de entradas y salidas.
- Banco de pruebas educativo de aprendizaje por imitación: permite reproducir de principio a fin el flujo de LeRobot (instalación, calibración, grabación, entrenamiento, *rollout*) con un modelo ya entrenado como referencia.
- Investigación sobre *action chunking* y políticas multitarea: sirve para comparar el comportamiento de ACT frente a alternativas como Diffusion Policy dentro del mismo *harness* de LeRobot y con las mismas observaciones.
- Prototipado rápido en robótica de bajo coste: en un equipo con un SO-101 y dos webcams, el modelo ofrece un controlador funcional sin necesidad de infraestructura de GPU dedicada.
- Recogida de datos asistida: ejecutando la política en modo `--strategy.type=base` se pueden generar episodios de referencia o comparar el comportamiento del modelo frente a teleoperación humana para diagnosticar fallos.
- Validación de *pipelines* de despliegue: por su tamaño, es útil para verificar integraciones de `lerobot-rollout`, latencias de bucle de control y sincronización de cámaras antes de pasar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación explícitamente vacía ("No evaluation results have been provided for this policy yet") y no se han encontrado datos de tasa de éxito, número de ensayos ni condiciones de prueba para las tres tareas entrenadas.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en robot real (3 tareas) | No disponible |
| Comparación con ACT de referencia | No disponible |
| Robustez ante cambios de posición, iluminación o distractores | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,2 GB solo para los pesos en precisión completa (51,7 M de parámetros), más el coste de las activaciones de dos imágenes a 480x640. Los valores concretos no están publicados; como referencia de orden de magnitud, un *checkpoint* de este tamaño cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA moderna es suficiente (RTX 3060, RTX 4070, RTX 4090, A100, H100). No se requiere hardware de centro de datos.
- Inferencia en CPU: viable por el reducido número de parámetros, aunque no hay mediciones publicadas de latencia.
- Entrenamiento: con lote 8 y dos cámaras a 480x640, un entrenamiento de este tipo entra en una GPU de consumo con 8-12 GB de VRAM; los requisitos exactos no están documentados.
- Opciones de despliegue: `lerobot-rollout` (comando documentado en la model card) y `lerobot-train` para reentrenamiento. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y *throughput*: no disponibles. Como referencia funcional, el control debe ejecutarse a 30 FPS para coincidir con la frecuencia del dataset, lo que implica producir acciones por debajo de 33 ms por ciclo.
- El repositorio ocupa 0,2 GB, por lo que la descarga y el almacenamiento no son un cuello de botella.

## Comparativa con modelos similares

| Modelo | Categoría | Arquitectura | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `khanhnd61/act_so101-multi-task-clean` | Política visuomotora para SO-101 | ACT (transformer + CVAE) | 51,7 M | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot (referencia del método) | Política visuomotora genérica | ACT (transformer + CVAE) | No disponible | No disponible | Implementación en el repositorio de LeRobot |
| Diffusion Policy | Política visuomotora | Modelo de difusión para acciones | No disponible | No disponible | Implementación en LeRobot |
| Políticas tipo VLA (por ejemplo SmolVLA o pi0) | Modelo visión-lenguaje-acción | Transformer multimodal | No disponible | No disponible | Ecosistema LeRobot |

La comparación cuantitativa no es posible con la información disponible: no hay tasas de éxito ni parámetros publicados para las alternativas en esta ficha. La diferencia funcional relevante es que las políticas VLA aceptan instrucciones en lenguaje natural abierto y generalizan a tareas no vistas, mientras que este checkpoint ACT solo cubre las tres tareas y los dos tipos de objeto con los que fue entrenado, y no incorpora un componente de lenguaje.

## Limitaciones y advertencias

- Dataset muy reducido: 44 episodios y 15.317 fotogramas (unos 8,5 minutos) para tres tareas. Es un volumen bajo, con riesgo de sobreajuste y de generalización pobre a posiciones de objeto distintas de las demostradas.
- Cobertura de tareas cerrada: solo se han entrenado tres instrucciones concretas, en inglés, y no hay evidencia de que el modelo interprete variantes de redacción no vistas.
- Dependencia estricta del *hardware*: la política asume un robot `so_follower` con seis dimensiones de estado y acción y dos cámaras (`front` y `wrist`) en posiciones concretas. Cambiar la disposición de las cámaras, el tipo de robot o el número de articulaciones invalida el modelo.
- Sin evaluación publicada: no hay tasa de éxito, ni número de ensayos, ni condiciones de prueba. No se debe asumir que funciona de forma fiable en producción.
- Sin validación comunitaria: 0 descargas y 0 *likes*; no hay informes independientes de terceros.
- Riesgo de fallo ante cambios de iluminación, fondos, distractores o nuevas posiciones de objeto, tal como advierte la propia plantilla de la model card.
- No es un modelo de lenguaje: no tiene capacidades de razonamiento, diálogo, código ni matemáticas, y no soporta *tool calling*.
- Sesgos: en el sentido habitual de sesgos lingüísticos no aplica, pero la política hereda los sesgos de las demostraciones del teleoperador (posiciones, velocidades y estrategias repetidas) y puede fallar de forma sistemática fuera de esa distribución.
- Licencia Apache 2.0: permite uso comercial y modificaciones sin obligación de publicar derivados, pero se ofrece sin garantías de ningún tipo.
- Inconsistencia en los metadatos: las fechas de creación y actualización del repositorio son del 14 de septiembre de 2026, posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el *checkpoint*.
- Ausencia de umbrales de seguridad: no se documentan límites de fuerza, par o parada de emergencia. Cualquier despliegue en un robot real debe incorporar salvaguardas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhnd61/act_so101-multi-task-clean
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-multi-task-clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=khanhnd61/so101-multi-task-clean
- Artículo de ACT: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo. Los enlaces obtenidos correspondían a medios financieros noruegos y a un sitio neerlandés de ciclismo, sin ninguna relación con robótica o aprendizaje automático, por lo que no se han incluido.
