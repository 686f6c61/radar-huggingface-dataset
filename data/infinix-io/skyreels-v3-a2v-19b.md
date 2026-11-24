# Infinix-io/SkyReels-V3-A2V-19B

## Resumen

SkyReels-V3-A2V-19B es un modelo de generación de vídeo de la familia SkyReels V3, desarrollado por Skywork (publicado en Hugging Face bajo la organización Infinix-io). Se trata de la variante "audio-to-video" (A2V) orientada a la síntesis de retratos parlantes (talking portraits), es decir, la generación de vídeo de una persona que habla a partir de una imagen de referencia y una pista de audio. Forma parte de un marco unificado de aprendizaje multimodal en contexto ("multimodal in-context learning framework") que cubre tres capacidades: generación multi-sujeto desde imágenes de referencia, generación guiada por audio y vídeo-a-vídeo.

El modelo cuenta con 18.882.046.784 parámetros (aproximadamente 19B, de ahí el sufijo del nombre), lo que lo sitúa en la gama alta de los modelos de difusión para vídeo. Está empaquetado para la librería `diffusers` en formato `safetensors`, con un repositorio de 56 GB, e incluye código de inferencia en el repositorio GitHub de SkyworkAI. La variante A2V se distribuye con resolución 720P según la tabla de modelos de la model card.

Su relevancia actual radica en que aborda una de las tareas más demandadas en generación de vídeo generativo: la animación de retratos sincronizada con audio, con fidelidad de identidad y coherencia temporal. La licencia es propietaria ("skywork-license", etiquetada como `license:other`), lo que condiciona su uso comercial y requiere revisión del fichero LICENSE antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (video diffusion transformer, según la línea SkyReels); detalles exactos no disponibles en la información proporcionada |
| Parametros totales | 18.882.046.784 (≈19B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo/audio, no de texto) |
| Licencia | skywork-license (`license:other`) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

La información disponible describe SkyReels V3 como un marco unificado de aprendizaje multimodal en contexto que soporta de forma nativa tres capacidades generativas: generación de vídeo multi-sujeto a partir de imágenes de referencia, generación de vídeo guiada por audio y generación vídeo-a-vídeo. La variante A2V-19B corresponde a la tarea de "talking avatar" o retrato parlante, es decir, animación de una imagen de retrato condicionada por audio. El modelo se apoya en la línea de investigación previa del equipo, que incluye SkyReels-Audio ("Omni Audio-Conditioned Talking Portraits in Video Diffusion Transformers", arXiv:2506.00830), un trabajo sobre retratos parlantes condicionados por audio en transformers de difusión de vídeo.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO o ajuste por preferencias. Tampoco se especifican innovaciones concretas como decodificación especulativa o mecanismos de atención lineal para esta variante. El repositorio incluye código de inferencia con soporte de `--offload`, lo que sugiere optimizaciones de memoria para ejecución en GPU únicas.

## Capacidades

- Generación de vídeo de retratos parlantes (talking portraits) a partir de una imagen de referencia y una pista de audio, con sincronización labial.
- Generación de vídeo condicionada por audio como capacidad central de esta variante A2V.
- Salida en resolución 720P según la tabla de variantes de la familia V3.
- Integración con la librería `diffusers` y con el ecosistema de Hugging Face.
- Soporte de ejecución en GPU única con opción de offloading de memoria.
- Forma parte de un marco multimodal más amplio que, en otras variantes de la familia, cubre referencia-a-vídeo (1 a 4 imágenes de referencia) y extensión de vídeo (vídeo-a-vídeo).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Producción de vídeo corporativo y formación: generar vídeos de presentadores o portavoces a partir de un retrato y una locución de audio, reduciendo costes de rodaje y permitiendo actualizar el guion sin regrabar.
- Localización y doblaje: animar un retrato existente con pistas de audio en distintos idiomas para producir versiones dobladas con sincronización labial coherente.
- Creación de contenido para redes sociales: generar avatares parlantes de forma automatizada a partir de una foto y un audio pregrabado, adecuado para canales que publican con alta frecuencia.
- Asistentes virtuales y atención al cliente con vídeo: producir respuestas en vídeo de un avatar corporativo sincronizado con la locución generada, mejorando la percepción de cercanía en interfaces conversacionales.
- Educación y e-learning: convertir material de audio de un instructor en vídeo de un avatar que lo representa, manteniendo la identidad visual del docente en cursos escalables.
- Prototipado creativo y previsualización: en estudios de animación y publicidad, generar animáticas de personajes con diálogo antes de comprometer recursos en producción final.
- Accesibilidad: generar versiones en lengua de signos o con lectura labial clara a partir de audio, apoyando la comunicación accesible en entornos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 18,88B parámetros en `safetensors` (probablemente en fp16/bf16, dado el tamaño de repo de 56 GB), la inferencia en precisión completa requiere del orden de 38 GB solo para pesos, más memoria para activaciones y el codificador de audio; el uso de `--offload` mitiga parcialmente este requisito.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del modelo, se orienta a GPU de centro de datos (A100 80 GB, H100) o a configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No se confirma en la documentación; con cuantización agresiva podría ser viable en GPUs de 24 GB, pero no hay datos publicados al respecto.
- Opciones de despliegue: script oficial `generate_video.py` del repositorio GitHub de SkyworkAI, con soporte de `--offload` y `--model_id` para rutas locales; integración con `diffusers`; descarga desde Hugging Face o ModelScope. También existe una API alojada en apifree.ai.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkyReels-V3-A2V-19B | ≈19B | Audio-a-vídeo / talking portrait | 720P | skywork-license (other) | Pesos en HF y ModelScope, API |
| SkyReels-V3-R2V-14B | ≈14B | Referencia-a-vídeo (1-4 imágenes) | 720P | skywork-license (other) | Pesos en HF y ModelScope |
| SkyReels-V3-V2V-14B | ≈14B | Extensión de vídeo (vídeo-a-vídeo) | 720P | skywork-license (other) | Pesos en HF y ModelScope |
| SkyReels-V2-I2V-14B-720P | ≈14B | Imagen-a-vídeo | 720P | no disponible en la información | Pesos en HF |

Las alternativas comparadas pertenecen a la misma familia y comparten licencia y ecosistema, por lo que la elección entre ellas depende de la tarea (audio, referencia o extensión) más que de diferencias de licencia o formato. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria "skywork-license" (`license:other`): es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; las condiciones de atribución, redistribución y uso en productos derivados no están detalladas en la información disponible.
- Riesgo de artefactos y alucinaciones visuales inherente a los modelos de difusión de vídeo: posibles inconsistencias temporales, deformaciones faciales o desincronización labial en audios largos o con ruido.
- Sesgos potenciales en la generación de rostros y voces derivados de los datos de entrenamiento, no documentados en la información disponible.
- Idiomas soportados no especificados; el rendimiento de sincronización labial puede variar según el idioma y la calidad del audio de entrada.
- Requisitos de hardware elevados (modelo de ≈19B) que limitan su despliegue a infraestructura con GPU de alta capacidad o a servicios de API.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de vídeo generado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un lanzamiento reciente con escasa validación comunitaria.
- No apto para usos de suplantación de identidad o generación de deepfakes sin consentimiento; se recomienda establecer salvaguardas de contenido en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/SkyReels-V3-A2V-19B
- Variante oficial en Hugging Face (Skywork): https://huggingface.co/Skywork/SkyReels-V3-A2V-19B
- Variante en ModelScope: https://www.modelscope.cn/models/Skywork/SkyReels-V3-A2V-19B
- Repositorio GitHub: https://github.com/SkyworkAI/SkyReels-V3
- Informe técnico SkyReels V3: https://arxiv.org/abs/2601.17323
- Paper SkyReels-Audio: https://arxiv.org/pdf/2506.00830
- Playground: https://huggingface.co/spaces/Skywork/SkyReels-V3
- Plataforma API: https://www.apifree.ai/explore
- Colección SkyReels V3 en Hugging Face: https://huggingface.co/collections/Skywork/skyreels-v3
- Colección SkyReels V3 en ModelScope: https://www.modelscope.cn/collections/Skywork/SkyReels-V3
- SkyReels-V2-I2V-14B-720P: https://huggingface.co/Skywork/SkyReels-V2-I2V-14B-720P
- SkyReels-V2-DF-14B-720P: https://huggingface.co/Skywork/SkyReels-V2-DF-14B-720P
- SkyCaptioner-V1: https://huggingface.co/Skywork/SkyCaptioner-V1
- SkyReels-A2: https://github.com/SkyworkAI/SkyReels-A2
- SkyReels-A1: https://github.com/SkyworkAI/SkyReels-A1
- SkyReels-V1: https://github.com/SkyworkAI/SkyReels-V1
