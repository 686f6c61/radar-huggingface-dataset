# manaladan6/cogvlm2-llama3-chat-19B

## Resumen

CogVLM2-LLaMA3-Chat-19B es un modelo multimodal de vision-lenguaje (VLM) desarrollado por el equipo de Zhipu AI (THUDM), que combina un codificador visual con el modelo de lenguaje Meta-Llama-3-8B-Instruct. Este modelo forma parte de la segunda generacion de la familia CogVLM y esta disenado para tareas de comprension de imagenes y dialogo multimodal, resolviendo el problema de la interpretacion conjunta de texto e imagenes en un unico sistema conversacional.

El modelo se compone de aproximadamente 19.000 millones de parametros totales, de los cuales unos 8.000 millones corresponden al modulo de lenguaje (Llama-3-8B-Instruct) y el resto al codificador visual y al adaptador. Soporta una longitud de contexto de 8K tokens y una resolucion de imagen de hasta 1344x1344 pixeles. Su relevancia actual radica en que ofrece un rendimiento competitivo frente a modelos propietarios como GPT-4V o Gemini Pro 1.5, siendo totalmente open source y con una licencia permisiva para uso comercial.

La arquitectura emplea un enfoque de fusion visual-lenguaje innovador, con un codificador visual basado en el modelo de vision de CogVLM2 y un adaptador de bajo coste que alinea las representaciones visuales con el espacio de embedding del LLM. El entrenamiento se realizo sobre datos de imagen-texto y posteriormente se afino con instrucciones y dialogo multimodal. La version descrita en esta ficha es la variante en ingles, aunque existe una version bilingue chino-ingles del mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (vision-language model) con codificador visual y LLM base Llama-3-8B-Instruct |
| Parametros totales | 19.503.107.328 (19,5B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 8.192 tokens (8K) |
| Tipos de cuantizacion | No especificado en la informacion disponible (se espera soporte de cuantizacion estandar en frameworks como llama.cpp) |
| Idiomas soportados | Ingles (version en chino-ingles disponible como cogvlm2-llama3-chinese-chat-19B) |
| Licencia | cogvlm2 (licencia propia de Zhipu AI, permisiva para uso comercial con atribucion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de CogVLM2, que combina un codificador visual (probablemente basado en ViT con arquitectura similar a la de CogVLM original) con el modelo de lenguaje Meta-Llama-3-8B-Instruct. El codificador visual extrae caracteristicas de la imagen a resolucion nativa de hasta 1344x1344, y un adaptador de baja latencia (MLP) proyecta estas caracteristicas al espacio de embedding del LLM. El modelo se entrena en dos fases: una primera de preentrenamiento con datos de image-text para alinear las representaciones, y una segunda de afinamiento con instrucciones de dialogo multimodal para optimizar la generacion de respuestas.

No se han publicado detalles exactos sobre el numero de tokens de entrenamiento ni la composicion del dataset en la informacion disponible. Se sabe que el modelo se basa en Llama-3-8B-Instruct, que ya incorpora un pre-entrenamiento extenso y un afinamiento con RLHF (reforzamiento a partir de feedback humano) para el modelo base. La innovacion principal de CogVLM2 respecto a la generacion anterior es la mejora significativa en benchmarks de comprension de documentos y OCR, asi como el soporte de una mayor resolucion de imagen y longitud de contexto.

## Capacidades

- Comprension de imagenes y dialogo multimodal: responde preguntas sobre el contenido visual de una imagen con respuestas generadas en lenguaje natural.
- Razonamiento visual: capacidad de interpretar graficos, diagramas, documentos escaneados y escenas complejas.
- OCR (reconocimiento optico de caracteres) de alta precision: extrae texto de imagenes sin necesidad de herramientas externas de OCR.
- Generacion de texto en ingles: produce respuestas coherentes y detalladas en ingles.
- Soporte de dialogo de seguimiento: mantiene el contexto de la conversacion en multiples turnos (hasta 8K tokens).
- No soporta tool calling ni function calling de forma nativa en la informacion disponible.
- No soporta capacidades de audio ni video, solo imagen fija.

## Casos de uso

- Analisis de documentos y facturas: el modelo puede extraer texto y datos de documentos escaneados o fotografias, facilitando la automatizacion de procesos de captura de datos en empresas.
- Asistente de accesibilidad: personas con discapacidad visual pueden describir su entorno o leer texto de senales, carteles o pantallas a traves de una aplicacion movil.
- Moderacion de contenido visual: puede analizar imagenes para detectar contenido inapropiado o ilegal en plataformas de redes sociales, describiendo lo que se ve.
- Educacion asistida: los estudiantes pueden fotografiar un problema de matematicas o una figura geometrica y recibir una explicacion paso a paso del modelo.
- Automatizacion de QA visual en desarrollo de software: los equipos de testing pueden usar el modelo para comparar capturas de pantalla de una aplicacion con un resultado esperado, describiendo diferencias en lenguaje natural.
- Generacion de informes a partir de imagenes medicas (solo como apoyo, nunca diagnostico): el modelo puede describir radiografias o imagenes de resonancia, pero no esta validado para uso clinico.

## Benchmarks y rendimiento

| Modelo | Tamano LLM | TextVQA | DocVQA | ChartQA | OCRbench | VCR_EASY | VCR_HARD | MMMU | MMVet | MMBench |
|--------|------------|---------|--------|---------|----------|----------|----------|------|-------|---------|
| CogVLM1.1 | 7B | 69,7 | - | 68,3 | 590 | 73,9 | 34,6 | 37,3 | 52,0 | 65,8 |
| LLaVA-1.5 | 13B | 61,3 | - | - | 337 | - | - | 37,0 | 35,4 | 67,7 |
| Mini-Gemini | 34B | 74,1 | - | - | - | - | - | 48,0 | 59,3 | 80,6 |
| LLaVA-NeXT-LLaMA3 | 8B | - | 78,2 | 69,5 | - | - | - | 41,7 | - | 72,1 |
| LLaVA-NeXT-110B | 110B | - | 85,7 | 79,7 | - | - | - | 49,1 | - | 80,5 |
| InternVL-1.5 | 20B | 80,6 | 90,9 | 83,8 | 720 | 14,7 | 2,0 | 46,8 | 55,4 | 82,3 |
| QwenVL-Plus | - | 78,9 | 91,4 | 78,1 | 726 | - | - | 51,4 | 55,7 | 67,0 |
| Claude3-Opus | - | - | 89,3 | 80,8 | 694 | 63,9 | 37,8 | 59,4 | 51,7 | 63,3 |
| Gemini Pro 1.5 | - | 73,5 | 86,5 | 81,3 | - | 62,7 | 28,1 | 58,5 | - | - |
| GPT-4V | - | 78,0 | 88,4 | 78,5 | 656 | 52,0 | 25,8 | 56,8 | 67,7 | 75,0 |
| **CogVLM2-LLaMA3** | 8B | **84,2** | **92,3** | 81,0 | **756** | **83,3** | **38,0** | 44,3 | 60,4 | 80,5 |
| **CogVLM2-LLaMA3-Chinese** | 8B | **85,0** | 88,4 | 74,7 | 780 | 79,9 | 25,1 | 42,8 | 60,5 | 78,9 |

Los resultados se obtuvieron sin usar herramientas externas de OCR (solo pixel). El modelo CogVLM2-LLaMA3 (en ingles) supera a todos los modelos open source comparados en TextVQA, DocVQA, OCRBench y VCR, y compite favorablemente con modelos propietarios como GPT-4V y Gemini Pro 1.5.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 39 GB en FP32; en BF16 el peso es de unos 19,5 GB, por lo que se requiere al menos 24 GB de VRAM para carga completa en BF16 sin cuantizacion.
- Con cuantizacion de 8 bits, el modelo puede caber en una GPU con 16 GB de VRAM; con cuantizacion de 4 bits, en 10-12 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) para BF16 completo; RTX 3090 (24 GB) con cuantizacion 8-bit; RTX 4080/4090 con cuantizacion 4-bit.
- No cabe en GPUs de consumo de 8-12 GB sin cuantizacion agresiva que degrada la calidad.
- Opciones de despliegue: el modelo se puede servir con transformers (con trust_remote_code=True), vLLM (si se adapta el codigo), llama.cpp (para cuantizacion GGUF), o con la API de ZhipuAI para la version en la nube.
- Latencia estimada: para una generacion de 128 tokens en una A100, se espera un throughput del orden de 10-20 tokens/s en BF16; no hay datos publicados oficiales.

## Comparativa con modelos similares

| Modelo | Tamano total | Tamano LLM | Contexto | Resolucion imagen | Licencia | Disponibilidad |
|--------|--------------|------------|----------|-------------------|----------|----------------|
| **CogVLM2-LLaMA3-19B** | 19B | 8B | 8K | 1344x1344 | Apache 2.0 (cogvlm2) | Open source |
| LLaVA-NeXT-LLaMA3 | 8B | 8B | 8K | 672x672 | Apache 2.0 | Open source |
| InternVL-1.5 | 20B | 20B | 8K | 1344x1344 | MIT | Open source |
| Mini-Gemini | 34B | 34B | 8K | 1344x1344 | Apache 2.0 | Open source |

CogVLM2 supera a LLaVA-NeXT-LLaMA3 en TextVQA, DocVQA y OCRBench, y compite directamente con InternVL-1.5, aunque InternVL tiene mejor rendimiento en ChartQA y MMMU. Mini-Gemini, con 34B, ofrece mejor rendimiento en MMMU pero es mas pesado. CogVLM2 destaca especialmente en tareas de OCR y comprension de documentos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base Llama-3-8B-Instruct, que pueden incluir sesgos de genero, raza y cultura en sus respuestas.
- Riesgo de alucinacion: como todo LLM, puede generar respuestas incorrectas o inventar datos cuando no hay suficiente informacion en la imagen o el contexto.
- Limitaciones de contexto: la ventana de 8K tokens es limitada para conversaciones muy largas o documentos extensos.
- Idioma: la version descrita solo soporta ingles; la version en chino-ingles requiere otro checkpoint.
- Restricciones de licencia: la licencia cogvlm2 es de Zhipu AI; aunque es permisiva, se debe revisar el texto completo de la licencia para uso comercial (enlace en la pagina de HuggingFace).
- No soporta video ni audio, solo imagenes fijas.
- El codigo del modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo de la libreria de THUDM.
- No se han publicado resultados de seguridad o alineacion con preferencias humanas para este modelo especifico.

## Enlaces

- HuggingFace (repositorio original): https://huggingface.co/THUDM/cogvlm2-llama3-chat-19B
- HuggingFace (repositorio duplicado): https://huggingface.co/manaladan6/cogvlm2-llama3-chat-19B
- GitHub: https://github.com/THUDM/CogVLM2
- Paper: https://arxiv.org/pdf/2408.16500
- Paper de CogVLM1: https://arxiv.org/abs/2311.03079
- Demo online: http://36.103.203.44:7861/
- ModelScope: https://www.modelscope.cn/models/ZhipuAI/cogvlm2-llama3-chat-19B
