# laion/ViCLIP-L-14-BVD-V-50M-s50M-b32K-WiSE-FT

## Resumen

ViCLIP-L-14-BVD-V-50M-s50M-b32K-WiSE-FT es un modelo de video-lenguaje desarrollado por LAION, una organización sin ánimo de lucro dedicada a la investigación abierta en IA. Se basa en la arquitectura ViCLIP, que extiende CLIP al dominio del vídeo, y utiliza una torre de visión ViT-L/14. El modelo fue entrenado sobre el dataset BVD-V-55M (LAION-BVD), un corpus masivo de vídeo de 10 millones de horas, y posteriormente fusionado mediante WiSE-FT (coeficiente α = 0,1) con el checkpoint de imagen CLIP-ViT-L-14-DataComp.XL-s13B-b90K, lo que mejora su robustez y generalización.

Este checkpoint está pensado para tareas de clasificación de vídeo zero-shot, recuperación vídeo-texto y extracción de representaciones de vídeo. Su relevancia radica en que es uno de los primeros modelos de vídeo-lenguaje abiertos entrenados a esta escala, con resultados que superan a alternativas como InternVid en varios benchmarks estándar. El modelo tiene 427,6 millones de parámetros y está disponible bajo licencia MIT, lo que facilita su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViCLIP (ViT-L/14 para visión + transformer de texto) |
| Parametros totales | 427.624.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (texto truncado a 77 tokens en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (unico idioma contemplado en el uso previsto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ViCLIP es una adaptación de CLIP para vídeo. La torre de visión es un ViT-L/14 que procesa 8 fotogramas por vídeo a resolución 224×224, mientras que la rama de texto es un transformer estándar de CLIP. El entrenamiento se realizó sobre el dataset BVD-V-55M, con 50 millones de muestras vistas, un batch global de 32.000, optimizador AdamW (lr=4e-5, betas=[0.9, 0.98], weight_decay=0.2), warmup de 100 pasos y scheduler de coseno. El checkpoint final es una fusión WiSE-FT con α=0,1 entre el modelo entrenado en vídeo y el checkpoint de imagen DataComp.XL, lo que mejora la robustez frente a distribuciones fuera del dominio de entrenamiento.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El entrenamiento es puramente contrastivo, similar al de CLIP original.

## Capacidades

- Clasificacion de video zero-shot: dado un vídeo y un conjunto de etiquetas textuales, el modelo calcula la similitud entre las características del vídeo y las de cada etiqueta, devolviendo probabilidades.
- Recuperacion video-texto: permite buscar vídeos a partir de descripciones textuales y viceversa, tanto en modo texto-a-vídeo como vídeo-a-texto.
- Extraccion de representaciones de video: genera embeddings de vídeo que pueden usarse para tareas downstream como linear probing o fine-tuning completo.
- Componente para modelos multimodales: puede integrarse como encoder de vídeo en VLMs (vision-language models) más grandes.
- Capacidades multilingues: no soportadas; el modelo está pensado exclusivamente para inglés.
- Tool calling y agentes: no aplicable, es un modelo de embeddings, no generativo.

## Casos de uso

- Clasificacion de acciones en video: el modelo puede etiquetar automáticamente vídeos de deportes, actividades cotidianas o escenas de películas con etiquetas textuales arbitrarias, sin necesidad de entrenamiento específico. Por ejemplo, distinguir entre "una persona jugando al baloncesto" y "una persona nadando".
- Busqueda de video por texto en archivos personales o corporativos: permite indexar grandes colecciones de vídeo y recuperar clips relevantes escribiendo una descripción en lenguaje natural, gracias a la recuperación vídeo-texto.
- Moderacion de contenido audiovisual: puede clasificar vídeos en categorías como violencia, desnudos o contenido inapropiado mediante etiquetas textuales, aunque requiere validación adicional para producción.
- Analisis de video deportivo: extraer métricas de rendimiento o resúmenes automáticos clasificando jugadas o eventos en vídeos de partidos, usando etiquetas como "gol", "falta" o "saque de esquina".
- Generacion de subtitulos o descripciones: aunque no genera texto directamente, sus embeddings pueden alimentar modelos de captioning de vídeo o sistemas de recuperación para sugerir descripciones.
- Investigacion academica en video-language: sirve como modelo base para estudiar la generalización zero-shot, el aprendizaje contrastivo en vídeo o como punto de partida para fine-tuning en datasets específicos.

## Benchmarks y rendimiento

El modelo fue evaluado con la suite CLIP Benchmark. Los resultados reportados en la model card son:

| Benchmark | Metrica | Resultado |
|---|---|---|
| Kinetics-400 | top-1 accuracy | 64,3 |
| UCF-101 | top-1 accuracy | 79,9 |
| HMDB51 | top-1 accuracy | 61,0 |
| MSR-VTT | video/text retrieval recall@1 | 44,6 / 43,7 |
| MSVD | video/text retrieval recall@1 | 54,5 / 84,6 |

No se han publicado comparativas directas con otros modelos en la informacion disponible, aunque el repositorio de LAION-BVD indica que los modelos ViCLIP entrenados en este dataset superan a los entrenados con InternVid en hasta 4,4 puntos en benchmarks estándar de vídeo-texto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 427,6 millones de parámetros. En precisión fp32, los pesos ocupan aproximadamente 1,7 GB (tamaño del repo), por lo que la VRAM necesaria para inferencia ronda los 2-3 GB incluyendo activaciones y overhead. En fp16, se reduce a unos 850 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como RTX 3060, RTX 4060, RTX 3090 o superiores son suficientes. Para procesar vídeos completos, se recomienda una GPU con al menos 8 GB para manejar el batch de fotogramas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: el modelo se integra directamente con Hugging Face Transformers mediante `AutoModel`, `AutoTokenizer` y `AutoVideoProcessor`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo de texto. Para producción, se puede servir mediante un contenedor con FastAPI o usar la infraestructura de Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado datos específicos. La inferencia depende del número de fotogramas y de la GPU; en una RTX 4090, se espera procesar un vídeo de 8 fotogramas en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para realizar una comparativa cuantitativa con otros modelos de vídeo-lenguaje como InternVid, VideoCLIP o X-CLIP. El repositorio de LAION-BVD menciona que los modelos ViCLIP superan a los basados en InternVid en hasta 4,4 puntos, pero no se ofrecen cifras concretas por modelo. Por tanto, la comparativa detallada no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos en inglés; no se recomienda su uso con otros idiomas, ya que el rendimiento degradará significativamente.
- No debe utilizarse para vigilancia, reconocimiento facial ni aplicaciones de identificación de personas, según la declaración de uso fuera de alcance del autor.
- Al ser un modelo de embeddings, no genera texto ni mantiene conversaciones; su uso se limita a tareas de clasificación y recuperación.
- Puede presentar sesgos presentes en los datos de entrenamiento (BVD-V-55M), que no han sido auditados públicamente.
- Riesgo de alucinación no aplica directamente, pero las clasificaciones zero-shot pueden ser incorrectas en dominios no representados en el dataset.
- La licencia MIT permite uso comercial, pero se recomienda validar el modelo en el dominio específico antes de desplegarlo en producción.
- El contexto de texto está limitado a 77 tokens (como en CLIP), lo que restringe la complejidad de las descripciones textuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/ViCLIP-L-14-BVD-V-50M-s50M-b32K-WiSE-FT
- Checkpoint base (sin fusión WiSE-FT): https://huggingface.co/laion/ViCLIP-L-14-BVD-V-55M-s50M-b32K
- Checkpoint de imagen DataComp.XL: https://huggingface.co/laion/CLIP-ViT-L-14-DataComp.XL-s13B-b90K
- Repositorio GitHub de LAION-BVD: https://github.com/LAION-AI/BVD/
- Sitio web de LAION: https://laion.ai/
