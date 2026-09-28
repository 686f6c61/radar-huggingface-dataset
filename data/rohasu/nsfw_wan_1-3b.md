# Rohasu/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3B T2V es un ajuste fino (*fine-tune*) del modelo abierto de generación de vídeo texto-a-vídeo Wan-AI/Wan2.1-T2V-1.3B, especializado en la generación de contenido para adultos. Lo publica el usuario Rohasu en HuggingFace bajo licencia CreativeML OpenRAIL-M y está marcado como «not-for-all-audiences». El objetivo declarado por el autor es servir como herramienta de investigación y creación capaz de generar clips cortos a partir de descripciones en lenguaje natural dentro del dominio NSFW, con movimiento coherente de forma nativa.

El modelo conserva la arquitectura de transformer de difusión texto-a-vídeo del modelo base y sus 1.300 millones de parámetros, pero ha sido reentrenado sobre un corpus de contenido adulto extraído de Reddit. La model card documenta dos procesos de entrenamiento: uno original en dos fases (imágenes y después vídeo) que produjo los checkpoints `e1`-`e20` y que sufrió una degradación severa de calidad («body horror»), y un segundo proceso experimental de una sola pasada sobre un dataset mixto que produjo los checkpoints `exp_e1`-`exp_e14`, recomendados por el autor.

Su relevancia actual es doble: por un lado, ejemplifica la práctica extendida de adaptar modelos generativos abiertos a dominios restringidos mediante ajuste fino; por otro, el autor documenta con detalle un caso real de olvido catastrófico (*catastrophic forgetting*) y la receta con la que intentó corregirlo, lo que lo convierte en un caso de estudio técnico sobre entrenamiento de modelos de difusión de vídeo. No se han publicado descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de generación de vídeo texto-a-vídeo (*text-to-video transformer*) |
| Parámetros totales | 1,3 mil millones (1.3B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de vídeo texto-a-vídeo, no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las descripciones de entrenamiento proceden de comunidades de Reddit, predominantemente en inglés) |
| Licencia | CreativeML OpenRAIL-M (`creativeml-openrail-m`) |
| Formato de pesos | safetensors |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Tipo / tarea | Text-to-video (T2V) |
| Especialización | Generación de contenido NSFW |
| Tamaño del repositorio | 105,4 GB (incluye múltiples checkpoints) |
| Fecha de publicación | 2026-09-27, según HuggingFace |
| Descargas / «likes» | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Wan2.1-T2V-1.3B: un transformer de generación de vídeo texto-a-vídeo de 1.300 millones de parámetros, con un codificador de texto que transforma la indicación en representaciones y un decodificador (VAE) que convierte el latente en fotogramas. La model card no detalla el número de bloques, la dimensionalidad ni el esquema de atención, por lo que estos datos no están disponibles.

El entrenamiento original se dividió en dos fases. En las épocas 1-10 el modelo se ajustó sobre un gran dataset de imágenes NSFW; la calidad se degradó de forma significativa a partir de la época 3. En las épocas 11-20 se entrenó exclusivamente con vídeo para aprender coherencia temporal, dando lugar a los checkpoints `e1`-`e20`, de los que el autor considera mejor `wan_1.3B_e20.safetensors`. El dataset se construyó con las 1.000 publicaciones más destacadas de aproximadamente 1.250 subreddits NSFW distintos, y las descripciones siguen las convenciones de etiquetado de esas comunidades.

Tras detectar «body horror» y artefactos anatómicos en la serie original, el autor diseñó una segunda receta de una sola pasada: dataset mixto de 30.000 clips de vídeo y 20.000 imágenes estáticas entrenados simultáneamente, tasa de aprendizaje más conservadora, lotes más pequeños y una planificación total más corta. El resultado son los checkpoints experimentales `exp_e1`-`exp_e14`, de los que recomienda `wan_1.3B_exp_e14.safetensors`. No se documenta el uso de RLHF, DPO ni ninguna innovación de decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) de clips cortos, con movimiento coherente de forma nativa según el autor, sin necesidad de LoRAs auxiliares.
- Generación de contenido NSFW explícito en un amplio espectro de temas, estilos, arquetipos de personaje y acciones descritas en lenguaje natural.
- Comprensión de indicaciones con las convenciones y jerga de etiquetado propias de los subreddits de origen; el repositorio incluye un fichero `prompting-guide.json` con un análisis de palabras clave y frases frecuentes para construir indicaciones más eficaces.
- Mayor detalle y calidad estética en los checkpoints entrenados con imágenes (fases iniciales), a costa de capacidades de movimiento limitadas.
- Coherencia temporal en los checkpoints entrenados con vídeo.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento en varios pasos (no es un modelo de lenguaje).
- No se documenta soporte multilingüe, entrada de visión, audio ni modo de razonamiento («thinking»).

## Casos de uso

- Producción de contenido para adultos: generación de clips cortos a partir de descripciones textuales para estudios y creadores de la industria, aprovechando que el modelo ha sido ajustado específicamente sobre vocabulario y estética de este dominio.
- Entrenamiento de LoRA específicos: el autor recomienda el checkpoint `wan_1.3B_exp_e14.safetensors` como base para entrenar LoRA por su mejor equilibrio entre contenido explícito y coherencia visual, lo que lo hace adecuado como punto de partida para personalizaciones de estilo o personaje.
- Investigación sobre olvido catastrófico en modelos generativos: el caso documenta cómo un ajuste fino agresivo sobre imágenes destruyó la coherencia anatómica y cómo un dataset mixto la recuperó, un escenario reproducible para estudiar estabilidad en el entrenamiento de difusión.
- *Red teaming* y moderación de contenido: permite generar material NSFW bajo condiciones controladas para evaluar clasificadores de contenido, sistemas de filtrado y políticas de plataforma.
- Estudio de sesgos y representación: al proceder de un corpus concreto de comunidades de Reddit, sirve para analizar qué estéticas, cuerpos y prácticas quedan sobrerrepresentados o ausentes en los datos de origen.
- Prototipado creativo y arte generativo: generación de *storyboards* o pruebas de concepto para proyectos audiovisuales de temática adulta antes de recurrir a producción real.
- Análisis de pipelines de datos y etiquetado: el `prompting-guide.json` y la metodología de curación de subreddits pueden estudiarse como ejemplo de construcción de vocabularios y sistemas de etiquetado para dominios restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP-score, FID ni ninguna otra) ni comparaciones numéricas con otros modelos. La evaluación de calidad que aparece en la documentación es puramente cualitativa y procede de los comentarios de la comunidad y de la revisión interna del autor.

## Requisitos de hardware

- Pesos del transformer: con 1.300 millones de parámetros, en precisión fp16/bf16 los pesos ocupan aproximadamente 2,6 GB. Esta cifra es una estimación derivada del número de parámetros, no un dato confirmado por el autor.
- VRAM total para inferencia: no disponible. La memoria real depende además del codificador de texto, del VAE y de la resolución y duración del vídeo generado, factores que la model card no especifica.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es candidato a ejecutarse en GPU de consumo de gama alta (RTX 4090, 24 GB) y, con margen, en aceleradores de centro de datos (A100 de 40/80 GB, H100) para lotes grandes o mayor resolución.
- Viabilidad en GPU de consumo: probable en tarjetas con 12-24 GB para configuraciones de baja resolución y duración, aunque no hay cifras confirmadas en la información proporcionada.
- Opciones de despliegue: la model card no especifica ninguna. El modelo base Wan2.1-T2V-1.3B está distribuido en HuggingFace y ModelScope, y su ecosistema habitual incluye Diffusers y nodos de ComfyUI, pero esto corresponde al modelo base y no está confirmado para este ajuste.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 105,4 GB, por lo que conviene descargar únicamente el checkpoint que se vaya a utilizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Rohasu/NSFW_Wan_1.3b (este modelo) | 1,3B | Text-to-video | CreativeML OpenRAIL-M | NSFW | HuggingFace, Civitai, RunningHub |
| Wan-AI/Wan2.1-T2V-1.3B (modelo base) | 1,3B | Text-to-video | no disponible en la información proporcionada | Generalista | HuggingFace, ModelScope |
| Otros modelos abiertos de T2V de tamaño similar | no disponible | Text-to-video | no disponible | Generalista | no disponible |

Existen otros modelos abiertos de generación de vídeo de tamaño comparable en el ecosistema (por ejemplo, variantes de la familia CogVideoX o LTX-Video), pero la información proporcionada no incluye sus especificaciones verificables, por lo que no se comparan numéricamente. Tampoco se dispone de datos de rendimiento del modelo base que permitan establecer una comparación cuantitativa con este ajuste.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está etiquetado como NSFW y «not-for-all-audiences». No es apto para menores ni para entornos no controlados.
- Calidad degradada en la serie original: el propio autor reconoce artefactos de «body horror», distorsiones anatómicas y pérdida de coherencia a partir de la época 3 en la fase de imagen, problemas que los checkpoints `e4`-`e20` no llegan a corregir del todo.
- Los checkpoints experimentales son la recomendación del autor, pero siguen siendo experimentales. Existe además una discrepancia en la model card: el título de la sección habla de «Epochs 1-8» mientras que los ficheros listados llegan hasta `exp_e14`.
- Sesgos y procedencia de los datos: el corpus se construyó a partir de las publicaciones más votadas de unos 1.250 subreddits, lo que introduce sesgos de sobrerrepresentación de ciertas estéticas, prácticas e identidades, y plantea dudas sobre consentimiento, privacidad y derechos de autor de las personas e imágenes utilizadas.
- Riesgo de alucinación y de anatomía incoherente: al ser un modelo de difusión de vídeo, puede producir deformaciones de manos, rostros y cuerpos, especialmente en secuencias largas o indicaciones poco habituales.
- Ausencia de evaluación cuantitativa: no hay benchmarks, métricas de calidad ni auditorías de seguridad publicadas.
- Idiomas: no se documenta soporte multilingüe; las descripciones de entrenamiento derivan de comunidades predominantemente en inglés, por lo que el rendimiento en otras lenguas es incierto.
- Restricciones de licencia: CreativeML OpenRAIL-M permite el uso comercial, pero impone restricciones de uso recogidas en su cláusula de condiciones adicionales. Es imprescindible revisarlas antes de cualquier explotación comercial, especialmente en un modelo de contenido explícito.
- Implicaciones legales y de plataforma: la generación de contenido sexual, y en particular de contenido hiperrealista o que pueda representar a personas identificables, está sujeta a normativa específica según la jurisdicción y a las políticas de las plataformas de distribución.
- Huella de almacenamiento elevada: 105,4 GB de repositorio, con múltiples checkpoints duplicados, lo que complica su gestión y despliegue.
- Publicaciones de terceros: existen réplicas y adaptaciones del modelo en Civitai y RunningHub que no están bajo el control del autor y cuyas condiciones pueden diferir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rohasu/NSFW_Wan_1.3b
- Modelo base en HuggingFace: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base en ModelScope: https://modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base en ModelScope (dominio .cn): https://www.modelscope.cn/models/Wan-AI/Wan2.1-T2V-1.3B
- Página del modelo en Civitai (v14 experimental): https://civitai.red/models/1697081/nsfw-wan-13b-t2v
- LoRA `nsfw_lora_wan_1.3b` en RunningHub: https://www.runninghub.ai/model/public/2037782968177004545
- Checkpoint `wan_1.3B_e10` en RunningHub: https://www.runninghub.ai/model/public/1930962000820502530
