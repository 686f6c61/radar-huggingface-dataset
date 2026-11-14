# Ria564/Qwen2.5-VL-7B-Instruct

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de tipo vision-language desarrollado por el equipo Qwen de Alibaba. Esta ficha concreta corresponde a la réplica publicada por el usuario Ria564 en Hugging Face bajo el identificador `Ria564/Qwen2.5-VL-7B-Instruct`, que reproduce los pesos del modelo oficial Qwen2.5-VL-7B-Instruct con licencia Apache 2.0. El modelo resuelve tareas de comprensión conjunta de imagen, vídeo y texto: reconocimiento de objetos, lectura de documentos, interpretación de gráficos, localización visual y razonamiento sobre contenido audiovisual.

La arquitectura combina un codificador visual ViT optimizado (con window attention, SwiGLU y RMSNorm) con un transformer de lenguaje de la familia Qwen2.5, unidos mediante un mecanismo de atención multimodal con mRoPE extendido a la dimensión temporal. El modelo cuenta con 8.292.166.656 parámetros totales según los pesos en safetensors, y forma parte de una familia de tres tamaños (3B, 7B y 72B). Su relevancia actual radica en que ofrece capacidades agénticas (uso de ordenador y teléfono), localización visual mediante bounding boxes y puntos, salida estructurada JSON y comprensión de vídeos de más de una hora, con un rendimiento que supera a modelos como InternVL2.5-8B o GPT-4o-mini en varios benchmarks de documento, OCR y matemáticas visuales.

El repositorio tiene 16,6 GB de tamaño y, en el momento de la consulta, registra 0 descargas y 0 likes, lo que sugiere que se trata de una réplica reciente o de escasa difusión. La model card reproduce íntegramente la documentación oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: ViT (window attention, SwiGLU, RMSNorm) + LLM Qwen2.5 con mRoPE extendido a dimensión temporal |
| Parametros totales | 8.292.166.656 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (según model card y tags); el modelo oficial soporta más idiomas, pero no se detalla en esta réplica |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño vision-language de dos torres: un codificador visual ViT y un modelo de lenguaje Qwen2.5. La innovación principal respecto a Qwen2-VL es la incorporación de window attention en el ViT para acelerar entrenamiento e inferencia, junto con SwiGLU y RMSNorm para alinear su estructura con la del LLM. El mRoPE (multimodal Rotary Position Embedding) se extiende a la dimensión temporal mediante IDs y alineación de tiempo absoluto, lo que permite al modelo aprender secuencias temporales y velocidad, y localizar momentos concretos en vídeos. Además, se adopta muestreo dinámico de FPS y resolución dinámica en la dimensión temporal, habilitando la comprensión de vídeos a distintas tasas de muestreo.

La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni confirma explícitamente el uso de RLHF o DPO, aunque el sufijo "Instruct" y el pipeline conversacional indican un ajuste por instrucciones. Tampoco se especifican en la información disponible los detalles del proceso de alineación. Las referencias arXiv incluidas en los tags (2309.00071, 2409.12191, 2308.12966) apuntan a trabajos previos de la familia Qwen-VL, pero no se aporta información adicional sobre el entrenamiento en esta réplica.

## Capacidades

- Comprensión visual de imágenes: reconocimiento de objetos (flores, aves, peces, insectos), análisis de texto, gráficos, iconos y layouts dentro de imágenes.
- Comprensión de vídeo de más de una hora, con capacidad de localizar segmentos relevantes y capturar eventos concretos.
- Localización visual: generación de bounding boxes y puntos con salida JSON estable para coordenadas y atributos.
- Salida estructurada para documentos como facturas, formularios y tablas, orientada a finanzas y comercio.
- Capacidades agénticas: razonamiento y dirección dinámica de herramientas, incluyendo uso de ordenador y teléfono (computer use y phone use).
- Razonamiento matemático visual (MathVista, MathVision) y comprensión de gráficos (ChartQA).
- OCR y comprensión de documentos (DocVQA, InfoVQA, OCRBench, CC_OCR).
- Generación de texto conversacional multimodal (pipeline image-text-to-text).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada, aunque las capacidades agénticas descritas lo sugieren.
- Capacidades multilingües: la model card solo declara inglés; el modelo oficial soporta más idiomas, pero no se detalla aquí.

## Casos de uso

- Digitalización de facturas y formularios: el modelo genera salidas estructuradas JSON a partir de escaneos, lo que permite integrarlo en pipelines de contabilidad y ERP para extraer campos de forma automatizada.
- Análisis de documentos técnicos y financieros: con DocVQA de 95,7 e InfoVQA de 82,6, es adecuado para responder preguntas sobre informes, contratos y tablas densas en texto.
- Automatización de atención al cliente con soporte visual: puede procesar capturas de pantalla o imágenes enviadas por el usuario y responder en conversaciones multi-turno, aunque la longitud de contexto no está confirmada en esta réplica.
- Agentes de automatización de interfaz (RPA visual): con ScreenSpot de 84,7 y MobileMiniWob++ de 91,4, puede dirigir herramientas y operar interfaces de escritorio y móvil en flujos de prueba automatizados.
- Moderación y análisis de contenido audiovisual: su capacidad de comprender vídeos de más de una hora y localizar eventos permite revisar grabaciones largas y marcar segmentos relevantes.
- Extracción de información de gráficos y paneles: ChartQA de 87,3 lo hace útil para interpretar dashboards, informes visuales y gráficas en herramientas de business intelligence.
- Asistencia en educación STEM: MathVista de 68,2 y MathVision de 25,07 permiten resolver problemas matemáticos con apoyo visual, útil en tutores inteligentes.
- Procesamiento de imágenes médicas o industriales: no confirmado; requeriría validación específica por dominio antes de producción.

## Benchmarks y rendimiento

Resultados publicados en la model card (réplica de los oficiales de Qwen2.5-VL-7B):

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU val | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro val | 34,3 | - | 37,6 | 30,5 | 41,0 |
| DocVQA test | 93 | 93 | - | 94,5 | 95,7 |
| InfoVQA test | 77,6 | - | - | 76,5 | 82,6 |
| ChartQA test | 84,8 | - | - | 83,0 | 87,3 |
| TextVQA val | 79,1 | 80,1 | - | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | - | - | 61,6 | 77,8 |
| MMStar | 62,8 | - | - | 60,7 | 63,9 |
| MMBench-V1.1-En test | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMT-Bench test | - | - | - | 63,7 | 63,6 |
| MMVet GPT-4-Turbo | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench avg | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista testmini | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | - | - | - | 16,3 | 25,07 |

Benchmarks de vídeo:

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest test | 66,9 | 70,5 |
| Video-MME wo/w subs | 63,3/69,0 | 65,1/71,6 |
| LVBench | - | 45,3 |
| LongVideoBench | - | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | - | 71,7 |
| MLVU | - | 70,2 |
| CharadesSTA/mIoU | - | 43,6 |

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

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de 8,3B parámetros en fp16 requiere aproximadamente 16,6 GB de pesos (coincide con el tamaño del repo), más memoria para activaciones y caché KV; en cuantización de 8 bits bajaría a unos 8-9 GB y en 4 bits a unos 5-6 GB, aunque estas cifras no están confirmadas en la documentación.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en A100, H100, L40S y RTX 4090 en fp16; en consumer GPU de 24 GB como la RTX 4090 sería ajustado en fp16 y holgado en cuantizaciones de 8 o 4 bits.
- ¿Cabe en consumer GPU? No confirmado en la información; por el tamaño del repo (16,6 GB) es probable que quepa en GPUs de 24 GB en fp16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: la model card menciona transformers (con `pip install git+https://github.com/huggingface/transformers accelerate`), `qwen-vl-utils[decord]==0.0.8` para carga de vídeo, y el tag `text-generation-inference` sugiere compatibilidad con TGI. No se detallan vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct (esta réplica) | 8,3B | No disponible | Apache 2.0 | Hugging Face (Ria564) | DocVQA 95,7; MathVista 68,2; ScreenSpot 84,7 |
| InternVL2.5-8B | 8B (aprox.) | No disponible | No disponible en la información | Hugging Face (oficial) | MMMU 56; DocVQA 93; OCRBench 822 |
| MiniCPM-o 2.6 | No disponible | No disponible | No disponible en la información | Hugging Face (oficial) | MMMU 50,4; OCRBench 852; MMVet 60,0 |
| GPT-4o-mini | No disponible (propietario) | No disponible | Propietaria | API OpenAI | MMMU 60; MMMU-Pro 37,6; MMVet 66,9 |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado con datos web a gran escala, es probable que herede sesgos de esos datos, pero no hay confirmación explícita.
- Riesgo de alucinación: HallBench avg de 52,9 indica que la alucinación en tareas visuales sigue siendo un problema relevante; se recomienda validación humana en producción.
- Limitaciones de contexto o idioma: la model card solo declara inglés; aunque el modelo oficial Qwen2.5-VL soporta más idiomas, esta réplica no lo detalla. La longitud de contexto no está disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, al ser una réplica de un tercero (Ria564), conviene verificar la integridad de los pesos frente al repositorio oficial de Qwen.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes y fue creado en 2026-11-14, sin historial de uso; no hay garantía de mantenimiento ni de que los pesos coincidan byte a byte con el modelo oficial.
- Requiere `transformers` desde el código fuente (o una versión reciente) para evitar el error `KeyError: 'qwen2_5_vl'`; en sistemas no Linux puede fallar la instalación de `decord` desde PyPI.
- El rendimiento en MathVision (25,07) es bajo en términos absolutos, lo que limita su uso en razonamiento matemático visual complejo.
- No se han publicado datos sobre cuantizaciones oficiales ni sobre latencia/throughput en esta réplica.

## Enlaces

- Repositorio Hugging Face de esta réplica: https://huggingface.co/Ria564/Qwen2.5-VL-7B-Instruct
- Blog oficial de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen2.5-VL
- Chat oficial Qwen: https://chat.qwenlm.ai/
- Referencia arXiv 2309.00071: https://arxiv.org/abs/2309.00071
- Referencia arXiv 2409.12191: https://arxiv.org/abs/2409.12191
- Referencia arXiv 2308.12966: https://arxiv.org/abs/2308.12966
- Repositorio oficial de Qwen2.5-VL-7B-Instruct en Hugging Face (no incluido en la información proporcionada; se recomienda buscar el identificador oficial Qwen/Qwen2.5-VL-7B-Instruct)
