# Bando1312/SmolVLM2-2.2B-Instruct

## Resumen
SmolVLM2-2.2B-Instruct es un modelo multimodal ligero desarrollado por Hugging Face, distribuido en este repositorio por el usuario Bando1312 como un fine-tune de HuggingFaceTB/SmolVLM-Instruct. Está diseñado para el análisis de contenido visual: procesa vídeo, imágenes y texto como entrada y genera texto, lo que permite responder preguntas sobre archivos multimedia, comparar contenido visual o transcribir texto presente en imágenes. No genera imagen ni vídeo.

Con 2.246.784.880 parámetros (aproximadamente 2,2B), el modelo está pensado para inferencia en dispositivos con recursos limitados. Según la model card, la inferencia sobre vídeo requiere solo 5,2 GB de VRAM, lo que lo sitúa en el rango de GPU de consumo. Su arquitectura deriva de Idefics3, con un codificador visual acoplado a un modelo de lenguaje compacto y un proyector que mapea las representaciones visuales al espacio del texto.

La relevancia actual del modelo radica en su relación entre capacidad multimodal y huella de memoria: cubre tareas de vídeo, multi-imagen y documento con un coste muy inferior al de los VLM de gran escala, lo que lo hace apto para despliegues en el borde (edge), prototipado rápido y aplicaciones donde el presupuesto de VRAM es la restricción principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal basada en Idefics3 (codificador visual + proyector + modelo de lenguaje) |
| Parametros totales | 2.246.784.880 (~2,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizacion GGUF no confirmada) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura de Idefics3: un codificador visual que procesa imágenes y fotogramas de vídeo, un proyector que transforma esos embeddings visuales al espacio del modelo de lenguaje y un decoder de texto autorregresivo. Los tokens visuales se intercalan con los tokens de texto, lo que permite entradas multimodales arbitrariamente intercaladas (texto, imagen, multi-imagen y vídeo). La inferencia recomendada usa `AutoModelForImageTextToText` con `torch_dtype=torch.bfloat16` y `flash_attention_2`.

El entrenamiento declarado en la model card abarca un conjunto amplio de datasets multimodales: The Cauldron, Docmatix, LLaVA-OneVision-Data, M4-Instruct-Data, FineVideo, MAmmoTH-VL-Instruct-12M, LLaVA-Video-178K, Video-STaR, Vript, VISTA-400K, MovieChat-1K y ShareGPT4Video. Esta composición cubre imágenes de documento, VQA, matemáticas visuales, instrucciones multimodales y vídeo. La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO. La referencia técnica asociada es el paper arXiv:2504.05299.

## Capacidades
- Generación de texto a partir de imágenes, multi-imagen y vídeo (image-text-to-text y video-text-to-text).
- Respuesta a preguntas visuales (VQA) sobre contenido de imagen y vídeo.
- Descripción y captioning de imágenes y vídeos.
- Comparación de contenido visual entre varias imágenes intercaladas con texto.
- Transcripción de texto presente en imágenes (OCR), con rendimiento medido en OCRBench.
- Razonamiento sobre documentos y gráficos (DocVQA, ChartQA).
- Razonamiento matemático visual (MathVista).
- Entradas multimodales intercaladas de forma arbitraria (texto, imagen, vídeo).
- Conversación multi-turno mediante plantillas de chat.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Generación de imagen o vídeo: no soportada.

## Casos de uso
- Descripción automática de vídeo: el modelo procesa fotogramas de un vídeo y genera descripciones detalladas, útil para indexación y accesibilidad de contenido audiovisual con solo 5,2 GB de VRAM.
- Transcripción de documentos escaneados: con los resultados de DocVQA (79,98) y OCRBench (72,9), puede extraer y responder preguntas sobre texto en imágenes de documentos en pipelines de digitalización.
- Análisis de gráficos e informes: ChartQA (68,84) permite responder preguntas sobre gráficos de barras, líneas y tablas en informes financieros o dashboards.
- Asistencia educativa en matemáticas visuales: MathVista (51,5) habilita la resolución de problemas matemáticos presentados como figuras o diagramas en plataformas de aprendizaje.
- Moderación y análisis de contenido visual: comparación de múltiples imágenes intercaladas para detectar diferencias o similitudes en flujos de revisión de contenido.
- Despliegue en el borde (edge): su huella de 5,2 GB de VRAM permite ejecutarlo en dispositivos con GPU de consumo, habilitando asistentes visuales locales sin conexión.
- Prototipado rápido de aplicaciones multimodales: la integración nativa con transformers y las plantillas de chat permiten iterar sobre casos de VQA y captioning sin infraestructura de gran escala.

## Benchmarks y rendimiento

Evaluación en visión (model card):

| Modelo | MathVista | MMMU | OCRBench | MMStar | AI2D | ChartQA_Test | Science_QA | TextVQA Val | DocVQA Val |
|---|---|---|---|---|---|---|---|---|---|
| SmolVLM2 2.2B | 51,5 | 42 | 72,9 | 46 | 70 | 68,84 | 90 | 73,21 | 79,98 |
| SmolVLM 2.2B | 43,9 | 38,3 | 65,5 | 41,8 | 84,5 | 71,6 | 84,5 | 72,1 | 79,7 |

Evaluación en vídeo (model card):

| Tamano | Video-MME | MLVU | MVBench |
|---|---|---|---|
| 2.2B | 52,1 | 55,2 | 46,27 |
| 500M | 42,2 | 47,3 | 39,73 |
| 256M | 33,7 | 40,6 | 32,7 |

## Requisitos de hardware
- VRAM para inferencia: 5,2 GB de GPU RAM para inferencia sobre vídeo, según la model card.
- GPU recomendadas: no especificadas en la información proporcionada; por la huella de memoria, cabe en GPU de consumo con al menos 6-8 GB de VRAM.
- Cabe en GPU de consumo: sí, según el requisito de 5,2 GB declarado.
- Opciones de despliegue: transformers con `AutoProcessor` y `AutoModelForImageTextToText`; se requiere `num2words`, `flash-attn` y `decord` para vídeo. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MathVista | MMMU | Video-MME | Licencia |
|---|---|---|---|---|---|---|
| SmolVLM2 2.2B (este repo) | ~2,2B | No disponible | 51,5 | 42 | 52,1 | Apache 2.0 |
| SmolVLM 2.2B | ~2,2B | No disponible | 43,9 | 38,3 | No disponible | Apache 2.0 |
| SmolVLM2 500M | ~0,5B | No disponible | No disponible | No disponible | 42,2 | Apache 2.0 |
| SmolVLM2 256M | ~0,26B | No disponible | No disponible | No disponible | 33,7 | Apache 2.0 |

## Limitaciones y advertencias
- Idioma: el modelo solo soporta inglés; el rendimiento en castellano no está garantizado.
- Alucinación: como todo VLM, puede describir elementos ausentes en la imagen o el vídeo; no se documentan mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; los datasets de entrenamiento pueden introducir sesgos culturales y visuales.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar entradas de vídeo largas con garantías.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio es un fine-tune de terceros (Bando1312) sin métricas de validación propias; se recomienda evaluar antes de producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su calidad.
- No soporta generación de imagen ni vídeo.
- Tool calling y comportamiento agéntico no confirmados.

## Enlaces
- Hugging Face: https://huggingface.co/Bando1312/SmolVLM2-2.2B-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-Instruct
- Modelo original de referencia: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Paper: https://arxiv.org/abs/2504.05299
- Blog: https://huggingface.co/blog/smolvlm2
- Demo (Video Highlight Generator): https://huggingface.co/spaces/HuggingFaceTB/SmolVLM2-HighlightGenerator
- Tutorial de fine-tuning: https://github.com/huggingface/smollm/blob/main/vision/finetuning/Smol_VLM_FT.ipynb
- Repositorio SmolLM: https://github.com/huggingface/smollm
- Arquitectura Idefics3: https://huggingface.co/HuggingFaceM4/Idefics3-8B-Llama3
