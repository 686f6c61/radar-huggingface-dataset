# Ruler138/BioLoom

## Resumen

BioLoom es un modelo vision-language de tipo CLIP (OpenCLIP) orientado al dominio biomédico, publicado por el usuario Ruler138 en HuggingFace bajo acceso restringido (gated). Está diseñado para tareas de recuperación imagen-texto, clasificación zero-shot y clasificación zero-shot de imágenes, lo que lo sitúa en la familia de modelos de alineación multimodal entrenados con pares imagen-texto, no en la de modelos generativos multimodales.

El repositorio ocupa 10,9 GB, lo que sugiere un backbone visual de tamaño considerable (probablemente en el rango de ViT-L o ViT-H combinado con un codificador de texto tipo transformer), aunque no se detallan en la información disponible los parámetros exactos ni la longitud de contexto textual. El modelo está etiquetado únicamente para inglés (`en`) y su licencia es `other`, con condiciones adicionales que deben aceptarse antes de descargar los pesos.

Su relevancia radica en la especialización biomédica: los CLIP genéricos rinden por debajo en vocabulario clínico, modalidades de imagen médica y descripciones técnicas, por lo que un modelo afinado en pares imagen-texto del dominio sanitario puede mejorar la recuperación y clasificación sin necesidad de reentrenamiento supervisado por tarea. No se dispone de datos de benchmarks, número de tokens de entrenamiento ni composición del dataset en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP / OpenCLIP (vision-language de alineación contrastiva) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | no disponible (repo de 10,9 GB; librería `open_clip`) |

## Arquitectura y entrenamiento

La información disponible indica que BioLoom se implementa sobre la librería `open_clip` y que pertenece a la familia de modelos contrastivos imagen-texto: un codificador visual y un codificador textual entrenados conjuntamente para alinear representaciones en un espacio compartido, optimizando una pérdida contrastiva tipo InfoNCE sobre pares imagen-texto. Este diseño es el que habilita la clasificación zero-shot mediante prompts textuales y la recuperación imagen-texto por similitud de embeddings.

No se especifican en la información proporcionada el backbone visual concreto (ViT-B, ViT-L, ViT-H u otro), el número de tokens de entrenamiento, la composición del corpus biomédico, ni si hubo etapas de fine-tuning supervisado, RLHF o DPO (estas técnicas no son habituales en modelos CLIP puros). Tampoco se detalla ninguna innovación técnica adicional más allá de la propia especialización de dominio.

## Capacidades

- Recuperación imagen-texto (image-text retrieval): búsqueda de imágenes por descripción textual y viceversa mediante similitud de embeddings.
- Clasificación zero-shot de imágenes: asignación de etiquetas definidas por prompts textuales sin entrenamiento adicional.
- Clasificación zero-shot (pipeline declarado en HuggingFace: `zero-shot-image-classification`).
- Alineación multimodal en dominio biomédico: vocabulario y pares imagen-texto de carácter clínico/científico.
- Extracción de embeddings visuales y textuales para indexación y búsqueda vectorial.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión generativa, audio ni modo de razonamiento explícito; al ser un modelo CLIP, estas capacidades no forman parte de su diseño.
- Capacidades multilingües: no disponibles; solo inglés.

## Casos de uso

- Búsqueda semántica en repositorios de imágenes médicas: indexar radiografías, histopatología o dermatología con embeddings visuales y permitir consultas en lenguaje natural ("infiltrado pulmonar bilateral"), usando la alineación contrastiva del modelo.
- Etiquetado automático de datasets clínicos: clasificación zero-shot de imágenes contra un conjunto de etiquetas textuales definidas por el equipo médico, útil para preetiquetar grandes volúmenes antes de revisión humana.
- Filtrado y curación de literatura científica: recuperación imagen-texto para emparejar figuras de artículos biomédicos con sus pies de figura y descripciones.
- Moderación y control de calidad de datasets multimodales: detección de pares imagen-texto mal emparejados mediante puntuaciones de similitud, descartando muestras inconsistentes.
- Sistemas de apoyo a la decisión clínica: como componente de recuperación de casos similares (content-based image retrieval) en herramientas de segunda lectura, devolviendo imágenes históricas parecidas a la consulta actual.
- Organización de archivos PACS o bibliotecas de imágenes: clustering y agrupación semántica de estudios por similitud de embeddings para navegación y deduplicación.
- Evaluación de modelos generativos médicos: uso como métrica de alineación imagen-texto (CLIP score biomédico) para medir la fidelidad de imágenes sintéticas respecto a su prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo de 10,9 GB sugiere pesos en precisión nativa que requieren al menos ~11-12 GB de VRAM para cargar el checkpoint completo en FP16/FP32 según el caso.
- GPU recomendadas: no disponibles de forma específica; por tamaño de checkpoint, GPUs con 16-24 GB (RTX 4090, A10G, L4) serían candidatas razonables para inferencia en precisión reducida, y A100/H100 para procesamiento por lotes a gran escala.
- Compatibilidad con GPU de consumo: probable en GPUs de 16 GB o más si se aplica conversión a FP16; no confirmado por falta de datos de arquitectura exacta.
- Opciones de despliegue: la librería `open_clip` es la vía natural; también podría integrarse en pipelines de HuggingFace `transformers` si los pesos siguen el formato estándar CLIP, y en servidores de embeddings vectoriales (FAISS, Qdrant, Milvus) para recuperación. vLLM, llama.cpp, Ollama y TGI no están orientados a modelos CLIP y no se documentan como soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioLoom | CLIP/OpenCLIP biomédico | no disponible | no disponible | other (gated) | HuggingFace, acceso restringido |
| BiomedCLIP (Microsoft) | CLIP biomédico | ~86M (ViT-B/16) | ~77 tokens de texto | MIT (uso abierto) | HuggingFace, acceso abierto |
| OpenCLIP ViT-L/14 (LAION) | CLIP genérico | ~428M | ~77 tokens de texto | MIT | HuggingFace, acceso abierto |
| SigLIP (Google) | CLIP con pérdida sigmoidea | variable (Base a So400m) | ~64-256 tokens | Apache 2.0 / variantes | HuggingFace, acceso abierto |

La comparación cuantitativa de rendimiento no está disponible para BioLoom; los datos de los modelos alternativos se incluyen como referencia de categoría y no proceden de la información proporcionada sobre BioLoom.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; los modelos CLIP entrenados con datos biomédicos pueden heredar sesgos demográficos (edad, sexo, etnia) y de representación de modalidades presentes en el corpus de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la clasificación zero-shot puede producir etiquetas incorrectas con alta confianza cuando las categorías no están bien representadas en el espacio de embeddings.
- Limitaciones de contexto e idioma: solo inglés; sin datos sobre longitud máxima de texto aceptada.
- Restricciones de licencia: licencia `other` y acceso gated; es imprescindible revisar los términos en HuggingFace antes de cualquier uso comercial o clínico, ya que pueden imponer condiciones adicionales no visibles en las etiquetas.
- Caveat para producción: el modelo no debe usarse como dispositivo médico ni para diagnóstico sin validación regulatoria; su uso en entornos clínicos requiere supervisión profesional y evaluación local de sensibilidad/especificidad.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que desaconseja su adopción en producción sin una evaluación interna propia.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación prácticamente inexistente; conviene auditar los pesos y el proceso de publicación antes de confiar en ellos.
- Formato de pesos y parámetros no confirmados: puede requerir ingeniería inversa para integrarlo en pipelines estándar.

## Enlaces

- HuggingFace: https://huggingface.co/Ruler138/BioLoom
- Librería OpenCLIP (referencia de implementación): https://github.com/mlfoundations/open_clip
- Paper OpenCLIP: https://arxiv.org/abs/2212.07143
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos específicos de BioLoom.
