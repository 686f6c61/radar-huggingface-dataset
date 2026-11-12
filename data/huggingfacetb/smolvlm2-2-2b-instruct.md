# HuggingFaceTB/SmolVLM2-2.2B-Instruct

## Resumen

SmolVLM2-2.2B-Instruct es un modelo multimodal ligero desarrollado por Hugging Face (organización HuggingFaceTB) capaz de procesar vídeo, imágenes y texto para generar respuestas en texto. Está construido sobre la arquitectura Idefics3 (heredera de SmolVLM-Instruct) y cuenta con 2.246.784.880 parámetros en formato safetensors, lo que lo sitúa en la gama de modelos pequeños diseñados para inferencia en dispositivos con recursos limitados. Requiere aproximadamente 5,2 GB de VRAM para inferencia sobre vídeo, según la model card.

El modelo resuelve el problema del análisis multimodal eficiente: permite tareas de captioning, respuesta a preguntas visuales, comparación entre imágenes, transcripción de texto en imágenes y comprensión de secuencias de vídeo, manteniendo un coste computacional muy inferior al de los modelos multimodales de gran escala. Su relevancia actual radica en la creciente demanda de modelos que quepan en GPUs de consumo y en entornos edge, donde modelos de 7B o más parámetros no son viables.

La ficha se basa en la información publicada en Hugging Face (model card, tags y metadatos del repositorio). El modelo está publicado bajo licencia Apache 2.0, soporta únicamente inglés según los metadatos, y se distribuye con la librería transformers. El repositorio ocupa 18,0 GB, incluyendo pesos y artefactos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Idefics3 (transformer multimodal, vision-language) |
| Parametros totales | 2.246.784.880 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en bfloat16 para inferencia segun el ejemplo de la model card) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

SmolVLM2-2.2B-Instruct es un modelo multimodal de tipo vision-language basado en la arquitectura Idefics3, según declara la model card. Procesa entradas intercaladas de texto, imágenes (una o varias) y vídeo, y genera únicamente texto; no soporta generación de imágenes ni de vídeo. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí lista las fuentes de datos utilizadas: The Cauldron, Docmatix, LLaVA-OneVision-Data, M4-Instruct-Data, FineVideo, MAmmoTH-VL-Instruct-12M, LLaVA-Video-178K, Video-STaR, Vript, VISTA-400K, MovieChat-1K_train, ShareGPT4Video y ShareGPT4Video. Esta combinación cubre datos de imagen-texto, documentos, vídeo y razonamiento multimodal.

No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación preferencial, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. La model card menciona que para el fine-tuning se puede seguir un tutorial del repositorio `huggingface/smollm`, y que la inferencia recomendada utiliza `flash_attention_2` con `torch_dtype=torch.bfloat16`. El modelo base es SmolVLM-Instruct, sobre el que se ha realizado un fine-tuning (finetune) según los metadatos.

## Capacidades

- Generación de texto a partir de imágenes, múltiples imágenes y vídeo (image-text-to-text y video-text-to-text).
- Respuesta a preguntas visuales (VQA) sobre imágenes y secuencias de vídeo.
- Captioning y descripción detallada de contenido visual.
- Comparación y análisis de similitud entre varias imágenes intercaladas con texto.
- Transcripción de texto presente en imágenes (OCR), según los resultados en OCRBench.
- Comprensión de gráficos y tablas (ChartQA, DocVQA).
- Razonamiento matemático-visual (MathVista) y razonamiento científico (ScienceQA).
- Entrada multimodal intercalada de forma arbitraria (texto, imágenes y vídeo en el mismo prompt).
- Soporte de chat mediante plantillas de conversación (`apply_chat_template`).
- No soporta tool calling, function calling ni generación de imágenes o vídeo según la información disponible.
- Capacidades multilingües limitadas al inglés según los metadatos.

## Casos de uso

- Análisis automático de vídeo para generación de resúmenes y highlights: el modelo procesa secuencias de vídeo y genera descripciones textuales, adecuado para la demo oficial "Video Highlight Generator" y para pipelines de catalogación de contenido audiovisual.
- Accesibilidad: descripción de imágenes y vídeos para personas con discapacidad visual, generando texto alternativo detallado en tiempo real gracias a su bajo requisito de VRAM (5,2 GB para vídeo).
- Procesamiento de documentos escaneados: extracción y transcripción de texto en imágenes (OCRBench 72,9) y respuesta a preguntas sobre documentos (DocVQA 79,98).
- Moderación y análisis de contenido visual en entornos con recursos limitados: clasificación y descripción de imágenes o vídeos en dispositivos edge o servidores sin GPUs de gama alta.
- Asistencia en tareas educativas: resolución de problemas matemáticos y científicos a partir de imágenes (MathVista 51,5, ScienceQA 90), útil en plataformas de tutoría.
- Análisis de gráficos y dashboards: interpretación de gráficos de barras, líneas y tablas (ChartQA 68,84) para extracción de insights en herramientas de business intelligence.
- Búsqueda visual y comparación de productos: comparación entre múltiples imágenes en el mismo prompt para tareas de e-commerce o verificación visual.
- Fine-tuning específico de dominio: al estar bajo Apache 2.0 y con tutorial de fine-tuning disponible, se puede adaptar a tareas verticales (medicina, industria, retail) con presupuestos de cómputo reducidos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Benchmark | SmolVLM2 2.2B | SmolVLM 2.2B |
|---|---|---|
| MathVista | 51,5 | 43,9 |
| MMMU | 42 | 38,3 |
| OCRBench | 72,9 | 65,5 |
| MMStar | 46 | 41,8 |
| AI2D | 70 | 84,5 |
| ChartQA_Test | 68,84 | 71,6 |
| Science_QA | 90 | 84,5 |
| TextVQA Val | 73,21 | 72,1 |
| DocVQA Val | 79,98 | 79,7 |

Evaluación en vídeo (familia SmolVLM2):

| Tamaño | Video-MME | MLVU | MVBench |
|---|---|---|---|
| 2.2B | 52,1 | 55,2 | 46,27 |
| 500M | 42,2 | 47,3 | 39,73 |
| 256M | 33,7 | 40,6 | 32,7 |

No se han publicado en la información disponible resultados comparativos con modelos de otros fabricantes (por ejemplo, Qwen2-VL o InternVL) ni benchmarks de texto puro como MMLU o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 GB de GPU RAM para inferencia sobre vídeo, según la model card; en bfloat16 los pesos ocupan en torno a 4,5 GB, por lo que la inferencia sobre imagen requiere un margen similar.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia en bfloat16; cabe en RTX 3060, RTX 4060, RTX 4070 y superiores. Para fine-tuning se recomienda A100, H100 o GPUs consumer de gama alta con mayor VRAM.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; en configuraciones de 6 GB puede requerir cuantización o reducción de resolución de entrada.
- Opciones de despliegue: transformers (librería oficial), con soporte de `flash_attention_2`; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vídeo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLM2-2.2B-Instruct | 2,25B | No disponible | Sí (Video-MME 52,1) | Apache 2.0 | Hugging Face |
| SmolVLM 2.2B (modelo base) | 2,2B | No disponible | No especificado | Apache 2.0 | Hugging Face |
| SmolVLM2-500M | 0,5B | No disponible | Sí (Video-MME 42,2) | Apache 2.0 | Hugging Face |
| SmolVLM2-256M | 0,26B | No disponible | Sí (Video-MME 33,7) | Apache 2.0 | Hugging Face |

La información disponible no incluye comparativas con modelos de otros fabricantes de tamaño similar (por ejemplo, Qwen2-VL-2B o InternVL2-2B), por lo que la comparación se limita a la propia familia SmolVLM2 y a su predecesor SmolVLM. Destaca la mejora de SmolVLM2 2.2B sobre SmolVLM 2.2B en MathVista (+7,6), MMMU (+3,7), OCRBench (+7,4) y ScienceQA (+5,5), aunque empeora en AI2D (-14,5) y ChartQA (-2,76).

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y evaluado únicamente en inglés según los metadatos; el rendimiento en castellano u otros idiomas no está garantizado.
- Tamaño reducido: con 2,25B parámetros, su capacidad de razonamiento complejo y conocimiento factual es inferior a la de modelos multimodales de 7B o más; los benchmarks muestran resultados moderados en MMMU (42) y MMStar (46).
- Alucinación: como todo modelo generativo, puede producir descripciones o respuestas no fundamentadas en el contenido visual, especialmente en escenas ambiguas o texto de baja calidad en imágenes.
- Sesgos: no se documentan análisis de sesgos en la información disponible; los datasets de entrenamiento (The Cauldron, LLaVA-OneVision-Data, etc.) pueden introducir sesgos culturales y de representación.
- Contexto: la longitud máxima de contexto no está especificada en la información proporcionada, lo que limita la planificación para vídeos largos o documentos extensos.
- Generación: no soporta generación de imágenes ni de vídeo, solo texto de salida.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los datasets de entrenamiento si redistribuye derivados.
- Producción: no se confirma soporte en motores de inferencia de alto rendimiento (vLLM, TGI) en la información disponible; el despliegue recomendado es transformers, lo que puede limitar el throughput en cargas concurrentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-Instruct
- Blog oficial: https://huggingface.co/blog/smolvlm2
- Demo "Video Highlight Generator": https://huggingface.co/spaces/HuggingFaceTB/SmolVLM2-HighlightGenerator
- Repositorio de fine-tuning: https://github.com/huggingface/smollm/blob/main/vision/finetuning/Smol_VLM_FT.ipynb
- Paper (arXiv 2504.05299): https://arxiv.org/abs/2504.05299
- Arquitectura Idefics3: https://huggingface.co/HuggingFaceM4/Idefics3-8B-Llama3
