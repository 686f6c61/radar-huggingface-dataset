# mdcreativeagent/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de tipo vision-language desarrollado por el equipo Qwen de Alibaba. Forma parte de la familia Qwen2.5-VL, que se presentó como evolución de Qwen2-VL tras cinco meses de retroalimentación de la comunidad. El modelo procesa entradas conjuntas de imagen, vídeo y texto, y genera respuestas en lenguaje natural, lo que lo sitúa en la categoría de modelos image-text-to-text.

La versión alojada en `mdcreativeagent/Qwen2.5-VL-7B-Instruct` es una réplica del modelo oficial de Qwen, con 8.292.166.656 parámetros totales según los pesos en safetensors y un repositorio de 16,6 GB. La arquitectura combina un codificador visual ViT optimizado con un transformer de lenguaje Qwen2.5, e incorpora innovaciones como resolución dinámica, muestreo dinámico de FPS en vídeo y mRoPE alineado con tiempo absoluto.

Su relevancia actual radica en que cubre tareas que van más allá del VQA clásico: localización visual mediante cajas o puntos, salidas JSON estructuradas para documentos, uso como agente visual (computer use y phone use) y comprensión de vídeos de más de una hora. Todo ello bajo licencia Apache 2.0, lo que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT + LLM Qwen2.5) con mRoPE |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño vision-language de dos torres: un codificador visual ViT y un modelo de lenguaje Qwen2.5. El ViT incorpora window attention para acelerar entrenamiento e inferencia, y se ha alineado estructuralmente con el LLM mediante SwiGLU y RMSNorm. Para vídeo, se extiende la resolución dinámica a la dimensión temporal con muestreo dinámico de FPS, y el mRoPE se actualiza con identificadores y alineación de tiempo absoluto, lo que permite al modelo aprender secuencias temporales y localizar momentos concretos dentro de un vídeo.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Sí se documentan las capacidades que motivaron el diseño: reconocimiento de objetos, análisis de texto, gráficos, iconos y layouts dentro de imágenes; localización visual en cajas o puntos; salidas estructuradas para facturas y formularios; y comportamiento agéntico con control de herramientas. El modelo se distribuye en tres tamaños (3B, 7B y 72B); esta ficha corresponde a la variante instruct de 7B.

## Capacidades

- Generación de texto a partir de imágenes y vídeo (image-text-to-text).
- Reconocimiento y descripción de objetos comunes (flores, aves, peces, insectos).
- Análisis de texto embebido en imágenes: OCR, gráficos, iconos, diagramas y layouts.
- Localización visual: generación de bounding boxes y puntos con salidas JSON estables para coordenadas y atributos.
- Salidas estructuradas para documentos como escaneos de facturas, formularios y tablas.
- Comprensión de vídeos de más de una hora, con capacidad de señalar segmentos relevantes.
- Comportamiento agéntico: razonamiento y dirección dinámica de herramientas, incluido computer use y phone use.
- Soporte multilingüe limitado: la model card y los tags indican únicamente inglés (`en`).
- No se documenta soporte explícito de tool calling genérico ni de audio en la información disponible.

## Casos de uso

- Digitalización de facturas y formularios: el modelo genera salidas JSON estructuradas a partir de escaneos, lo que permite integrarlo en pipelines de contabilidad y ERP sin post-procesado manual extenso.
- Análisis de documentos financieros: con DocVQA en 95,7 e InfoVQA en 82,6, es adecuado para extraer y razonar sobre tablas, gráficos e información densa en documentos.
- Agente de automatización de interfaz (RPA visual): sus resultados en ScreenSpot (84,7) y MobileMiniWob++ (91,4) lo hacen utilizable para localizar elementos en pantallas y ejecutar acciones de computer use o phone use.
- Moderación y descripción de contenido visual: clasificación y descripción de imágenes con localización de objetos mediante cajas o puntos, útil en catálogos y plataformas de contenido.
- Análisis de vídeo largo: comprensión de vídeos de más de una hora y localización de eventos concretos, aplicable a revisión de grabaciones de vigilancia, deportes o formación.
- Asistencia en accesibilidad: descripción de imágenes y documentos para usuarios con discapacidad visual, con salidas estructuradas y localización espacial.
- Automatización de QA visual en CI/CD: verificación de capturas de pantalla de aplicaciones comparando layouts y detectando regresiones mediante descripciones y coordenadas.

## Benchmarks y rendimiento

Datos publicados en la model card para Qwen2.5-VL-7B frente a modelos comparables:

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro (val) | 34,3 | no disponible | 37,6 | 30,5 | 41,0 |
| DocVQA (test) | 93 | 93 | no disponible | 94,5 | 95,7 |
| InfoVQA (test) | 77,6 | no disponible | no disponible | 76,5 | 82,6 |
| ChartQA (test) | 84,8 | no disponible | no disponible | 83,0 | 87,3 |
| TextVQA (val) | 79,1 | 80,1 | no disponible | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | no disponible | no disponible | 61,6 | 77,8 |
| MMStar | 62,8 | no disponible | no disponible | 60,7 | 63,9 |
| MMBench-V1.1-En (test) | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMVet (GPT-4-Turbo) | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench (avg) | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista (testmini) | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | no disponible | no disponible | no disponible | 16,3 | 25,07 |

Benchmarks de vídeo:

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest (test) | 66,9 | 70,5 |
| Video-MME (sin/con subtítulos) | 63,3 / 69,0 | 65,1 / 71,6 |
| LVBench | no disponible | 45,3 |
| LongVideoBench | no disponible | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | no disponible | 71,7 |
| MLVU | no disponible | 70,2 |
| CharadesSTA/mIoU | no disponible | 43,6 |

Benchmarks de agente:

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84,7 |
| ScreenSpot Pro | 29,0 |
| AITZ_EM | 81,9 |
| Android Control High_EM | 60,1 |
| Android Control Low_EM | 93,7 |
| AndroidWorld_SR | 25,5 |
| MobileMiniWob++_SR | 91,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.292 millones de parámetros, en FP16 se requieren aproximadamente 16,6 GB solo para pesos; en BF16 similar. La cuantización a 8 bits reduciría a unos 8-9 GB y a 4 bits a unos 4-5 GB, aunque los tipos de cuantización no están documentados en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para FP16 con margen para contexto visual extenso. En consumer, RTX 4090 (24 GB) permite FP16 ajustado; RTX 3090/4080 (16-24 GB) pueden requerir cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 con FP16 y en GPUs de 16 GB con cuantización, aunque el procesamiento de vídeo largo incrementa el uso de memoria por tokens visuales.
- Opciones de despliegue: transformers (recomendado instalar desde el repositorio principal por el soporte de `qwen2_5_vl`), text-generation-inference (tag `text-generation-inference`), qwen-vl-utils para carga de imágenes y vídeo, y despliegue en Qualcomm AI Hub según la búsqueda web.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMMU (val) | DocVQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct | 8,29B | no disponible | 58,6 | 95,7 | Apache 2.0 | Hugging Face, Qualcomm AI Hub |
| Qwen2-VL-7B | 7B (aprox.) | no disponible | 54,1 | 94,5 | Apache 2.0 | Hugging Face |
| InternVL2.5-8B | 8B (aprox.) | no disponible | 56 | 93 | no disponible | Hugging Face |
| MiniCPM-o 2.6 | no disponible | no disponible | 50,4 | 93 | no disponible | Hugging Face |
| GPT-4o-mini | propietario | no disponible | 60 | no disponible | propietaria | API |

Qwen2.5-VL-7B supera a Qwen2-VL-7B en prácticamente todos los benchmarks publicados y se sitúa por delante de InternVL2.5-8B y MiniCPM-o 2.6 en MMMU, DocVQA, InfoVQA, ChartQA y MMVet. GPT-4o-mini mantiene ventaja en MMMU (60 frente a 58,6) pero no publica resultados en varios benchmarks de documentos.

## Limitaciones y advertencias

- Idiomas: la model card y los tags indican únicamente inglés; el rendimiento en castellano no está documentado y podría degradarse.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al ser un modelo entrenado con datos web, es probable que herede sesgos visuales y culturales.
- Alucinación: HallBench de 52,9 indica que aún hay margen de error en la fidelidad de descripciones; en documentos densos o imágenes ambiguas puede generar contenido no presente.
- Contexto: la longitud de contexto no se especifica; el vídeo largo y las imágenes de alta resolución consumen muchos tokens visuales y pueden agotar la ventana.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias (transformers, qwen-vl-utils) y los términos del modelo oficial de Qwen.
- Producción: requiere transformers desde el repositorio principal para evitar `KeyError: 'qwen2_5_vl'`; `decord` solo está disponible en Linux desde PyPI, lo que limita el procesamiento de vídeo en otros sistemas.
- Repositorio réplica: el modelo alojado por `mdcreativeagent` tiene 0 descargas y 0 likes; para producción se recomienda contrastar con el repositorio oficial `Qwen/Qwen2.5-VL-7B-Instruct`.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/mdcreativeagent/Qwen2.5-VL-7B-Instruct
- Hugging Face (oficial): https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Blog de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Qwen Chat: https://chat.qwenlm.ai/
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen2_5_vl_7b_instruct
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
