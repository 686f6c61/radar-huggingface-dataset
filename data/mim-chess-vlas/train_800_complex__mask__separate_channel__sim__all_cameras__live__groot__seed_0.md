# mim-chess-vlas/train_800_complex__mask__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino una política visuomotora (checkpoint de *fine-tuning*) construida sobre GR00T N1.7, el modelo fundacional *cross-embodiment* de NVIDIA para razonamiento y habilidades robóticas. Lo publica el usuario `mim-chess-vlas` mediante LeRobot y está entrenado para un brazo Franka Panda en un entorno de simulación, con cuatro cámaras de entrada (`agentview`, dos `eye_in_hand` y un canal de máscara) y una salida de acción de 7 dimensiones.

El modelo resuelve una tarea concreta de *pick-and-place*: identificar objetos descritos en lenguaje natural (piezas con formas tipo estrella, huevo, cono, anillo, etc.) y depositarlos dentro de una caja. La arquitectura combina un *backbone* visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en *flow matching*, que predice acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint totaliza 3.144.016.000 parámetros y 12,6 GB de pesos en safetensors.

Su relevancia es acotada pero clara: sirve como referencia reproducible (semilla 0) de un *pipeline* completo de entrenamiento GR00T + LeRobot sobre un dataset etiquetado, útil para investigación en manipulación visual, ablación de canales de percepción y estudios de transferencia sim-to-real. No es un modelo de propósito general ni un asistente conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: *backbone* visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con *flow matching* |
| Parámetros totales | 3.144.016.000 (≈3,14 B), dato real de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica como ventana de texto (política visuomotora, no LLM de chat) |
| Tipos de cuantización | No se documentan cuantizaciones oficiales; el tamaño del repo (12,6 GB) es coherente con pesos en fp32 |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de checkpoint LeRobot) |
| Tipo de robot | Franka Panda (brazo único, acción de 7 dimensiones) |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`, `mask` (4 × 3×224×224) |
| Estado propioceptivo | `observation.state`, shape (9,) |
| Salida | `action`, shape (7,) |
| Dataset de entrenamiento | `mim-chess-vlas/train_800_complex__mask__separate_channel__sim__all_cameras__live` (790 episodios, 157.904 frames, 20 FPS) |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional de NVIDIA para razonamiento y habilidades humanoides generalizadas. Su diseño separa dos componentes: un *backbone* visión-lenguaje (Cosmos-Reason2/Qwen3-VL en esta versión) que interpreta la observación visual y la instrucción en lenguaje natural, y un transformer de acciones entrenado con *flow matching* que genera trayectorias de acción continuas condicionadas por la representación multimodal y por el estado propioceptivo del robot. Esta separación es la que permite el enfoque *cross-embodiment*: el *backbone* es compartido y la cabeza de acciones se adapta a la morfología del robot.

El checkpoint se ha fine-tuneado con LeRobot sobre un dataset de simulación de 790 episodios y 157.904 frames a 20 FPS, con cuatro vistas por paso (incluida una máscara de segmentación tratada como canal separado) y 9 dimensiones de estado. Las tareas están descritas en inglés y son variantes de "coger el objeto X y meterlo en la caja", con objetos de geometría compleja (lóbulos, ranuras, protuberancias, anillos, estrellas). No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron etapas de RLHF/DPO (no habituales en políticas de imitación). El sufijo `seed_0` indica que el checkpoint forma parte de un barrido de semillas.

## Capacidades

- Manipulación visuomotora: genera acciones de 7 dimensiones para un Franka Panda a partir de cuatro vistas RGB de 224×224.
- Ejecución de instrucciones en lenguaje natural: la política está condicionada por la descripción textual de la tarea (objeto a coger y destino).
- Percepción multivista: fusiona una cámara global (`agentview`) con dos cámaras en la muñeca (`eye_in_hand`, `eye_in_hand_2`).
- Uso de máscara de segmentación como canal visual independiente, lo que permite estudiar su aportación frente a RGB puro.
- Condicionamiento por propiocepción: integra un vector de estado de 9 dimensiones junto con la observación visual.
- Discriminación de geometrías complejas descritas lingüísticamente (formas con lóbulos, ranuras, rebordes, asas).
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso en el sentido de agentes LLM ni modo *thinking*.
- Capacidades multilingües: no disponibles; el modelo no ha sido evaluado con instrucciones en castellano.
- No genera texto, ni código, ni respuestas conversacionales.

## Casos de uso

- **Línea base reproducible en investigación de manipulación**: al estar entrenado con una semilla concreta (`seed_0`) y un dataset público vinculado, permite reproducir experimentos y comparar variantes de arquitectura o de datos sin partir de cero.
- **Ablación del canal de máscara**: el nombre del repositorio indica explícitamente `mask__separate_channel`, de modo que el checkpoint sirve para cuantificar cuánto aporta la segmentación frente a un entrenamiento solo con RGB en la misma tarea.
- **Estudio de fusión multicámara**: con una vista global y dos vistas en la muñeca, es un banco de pruebas para analizar qué vistas contribuyen al éxito del agarre en objetos con oclusiones (asas, ranuras, anillos).
- **Evaluación de instrucciones largas y descriptivas**: las tareas del dataset incluyen descripciones de decenas de palabras sobre la geometría del objeto, lo que permite medir la sensibilidad del *backbone* visión-lenguaje a la longitud y el detalle del *prompt*.
- **Investigación en transferencia sim-to-real**: al estar entrenado en simulación (`sim`), el checkpoint es un punto de partida para medir la brecha de rendimiento al trasladar la política a un Panda físico con una configuración de cámaras equivalente.
- **Generación de datos sintéticos y aumento de dataset**: la política puede ejecutarse en el simulador para producir rollouts adicionales que después se filtran y se reutilizan en un nuevo ciclo de entrenamiento por imitación.
- **Docencia y formación en VLA**: el *pipeline* completo (dataset etiquetado, LeRobot, GR00T) es un ejemplo didáctico de extremo a extremo de entrenamiento de un modelo visión-lenguaje-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, ni comparaciones con otras políticas, ni métricas de error de posición o de agarre sobre el dataset de validación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: unos 6,3 GB en bf16/fp16 (3,14 B × 2 bytes) y unos 12,6 GB en fp32; hay que sumar el *overhead* de activaciones de las cuatro imágenes de 224×224 y del *backbone* visión-lenguaje.
- **GPU recomendadas**: NVIDIA A100 40/80 GB o H100 para evaluación con lotes grandes o múltiples entornos en paralelo; RTX 4090 (24 GB) es suficiente para inferencia de un solo entorno en bf16.
- **Cabe en GPU de consumo**: sí, en RTX 4090 (24 GB) y, en bf16, previsiblemente en GPUs de 16 GB; en fp32 requiere al menos 16-24 GB y deja poco margen.
- **Opciones de despliegue**: LeRobot (`lerobot`) con PyTorch es la vía documentada; vLLM, llama.cpp, Ollama y TGI no son aplicables al no tratarse de un modelo de texto.
- **Latencia y throughput**: no disponibles. Como referencia de diseño, el dataset se capturó a 20 FPS, por lo que un bucle de control en tiempo real exige inferencia sostenida a ≥20 Hz (≤50 ms por paso), requisito que no está verificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parámetros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7, fine-tuning) | mim-chess-vlas / NVIDIA | 3,14 B | No aplica | No disponible | Apache 2.0 | HuggingFace (0 descargas) |
| GR00T N1 (modelo base) | NVIDIA | ≈2,2 B (dato no verificado en esta ficha) | No aplica | No disponible en esta ficha | Consultar en el repositorio de NVIDIA | HuggingFace / GitHub |
| π0 (pi-zero) | Physical Intelligence | ≈3,3 B (dato no verificado en esta ficha) | No aplica | No disponible en esta ficha | Consultar en el repositorio | Pesos públicos |
| OpenVLA | Stanford / Berkeley et al. | ≈7 B | No aplica | No disponible en esta ficha | Consultar (código y pesos con condiciones distintas) | HuggingFace |

La comparación directa de rendimiento no es posible: no hay métricas de éxito publicadas para este checkpoint y las cifras de los modelos alternativos no se han verificado en la información disponible. La diferencia principal es de especialización: este checkpoint está ajustado a una única tarea y a una configuración de robot y cámaras concreta, mientras que los modelos base citados son de propósito general.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, código ni respuestas; cualquier uso como LLM es inválido.
- **Especialización extrema**: entrenado para una tarea de *pick-and-place* con un Panda y exactamente cuatro cámaras; cambiar el número de vistas, la resolución o la morfología del robot invalida la política sin reentrenamiento.
- **Brecha sim-to-real**: el dataset es de simulación (`sim`); el rendimiento en un robot físico no está documentado.
- **Dataset pequeño**: 790 episodios y 157.904 frames son un volumen reducido para un modelo de 3,14 B de parámetros, con riesgo de sobreajuste a las geometrías y descripciones concretas del dataset.
- **Sesgo de vocabulario**: las instrucciones de tarea están en inglés y describen objetos muy específicos; el modelo puede degradarse ante paráfrasis, otros idiomas o descripciones más cortas.
- **Riesgo de fallo de ejecución**: no hay métricas de tasa de éxito ni de precisión de agarre, por lo que no puede asumirse fiabilidad en producción; hay que validar con rollouts propios.
- **Sin validación comunitaria**: 0 descargas y 0 *likes*, con creación y actualización el mismo día (2026-10-29); es un artefacto de experimento, no un modelo contrastado.
- **Licencia**: los pesos se publican bajo Apache 2.0, pero las dependencias (Isaac-GR00T, el *backbone* Cosmos-Reason2/Qwen3-VL y LeRobot) pueden tener licencias propias que conviene revisar antes de un uso comercial.
- **Seguridad física**: cualquier despliegue en hardware real requiere límites de par, paradas de emergencia y supervisión; el modelo no incorpora mecanismos de seguridad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mim-chess-vlas/train_800_complex__mask__separate_channel__sim__all_cameras__live__groot__seed_0)
- [Dataset de entrenamiento](https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__mask__separate_channel__sim__all_cameras__live)
- [NVIDIA Isaac-GR00T (GitHub)](https://github.com/NVIDIA/Isaac-GR00T)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Guía de GR00T en LeRobot](https://huggingface.co/docs/lerobot/main/en/groot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados correspondían a centros de imagen médica y a un museo de instrumentos musicales, sin relación con el repositorio.
