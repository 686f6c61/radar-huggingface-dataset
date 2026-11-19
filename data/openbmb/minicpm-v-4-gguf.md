# openbmb/MiniCPM-V-4-gguf

## Resumen
MiniCPM-V 4.0 es un modelo multimodal (image-text-to-text) de la familia MiniCPM-V desarrollado por OpenBMB. Combina un codificador visual SigLIP2-400M con un modelo de lenguaje MiniCPM4-3B, sumando 4.1B parametros en total. Esta ficha corresponde a la version cuantizada en formato GGUF del modelo base `openbmb/MiniCPM-V-4`, pensada para despliegue en dispositivos y entornos con recursos limitados mediante llama.cpp, Ollama y otras herramientas compatibles con GGUF.

El modelo resuelve tareas de comprension de imagen unica, multiples imagenes y video, con enfasis declarado en OCR, eficiencia en dispositivo y latencia baja. Segun la model card, alcanza una puntuacion media de 69.0 en OpenCompass (agregado de 8 benchmarks), por encima de GPT-4.1-mini-20250414 (68.9), MiniCPM-V 2.6 (65.2) y Qwen2.5-VL-3B-Instruct (64.5), con solo 4.1B parametros.

La relevancia actual reside en su relacion rendimiento/tamano: ofrece capacidades visuales cercanas a modelos propietarios de mayor tamano y puede ejecutarse en telefonos (iPhone 16 Pro Max con menos de 2 s de latencia al primer token y mas de 17 token/s de decodificacion, segun el autor). Esta variante GGUF facilita su uso en CPU, GPU consumer y despliegues embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM: codificador visual SigLIP2-400M + LLM MiniCPM4-3B |
| Parametros totales | 4.1B (model card); 3.605.834.240 en safetensors del repo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento
MiniCPM-V 4.0 sigue una arquitectura MLLM compuesta por un encoder visual SigLIP2 de 400M de parametros conectado a un LLM MiniCPM4-3B, con un total de 4.1B parametros. El pipeline declarado es image-text-to-text y el modelo esta etiquetado con capacidades de OCR, multi-image y video, ademas de requerir `custom_code` en transformers.

El entrenamiento se asocia al dataset `openbmb/RLAIF-V-Dataset`, lo que sugiere el uso de tecnicas de alineacion tipo RLHF/RLAIF para reducir alucinaciones visuales. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset. La model card no describe innovaciones adicionales como decodificacion especulativa o attention linear para esta version.

## Capacidades
- Comprension de imagen unica, multiples imagenes y video.
- OCR y lectura de texto en imagenes (etiqueta `ocr`, con resultados en OCRBench).
- Razonamiento visual y matematico sobre imagenes (MathVista, MMMU en la evaluacion).
- Generacion de texto conversacional a partir de entradas imagen-texto.
- Soporte multilingue segun la etiqueta `language: multilingual`.
- Despliegue eficiente en dispositivo, incluida app iOS oficial para iPhone e iPad.
- Compatibilidad con tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso
- Digitalizacion y extraccion de documentos: el modelo puede procesar imagenes de facturas, formularios o tickets y devolver texto estructurado gracias a sus capacidades OCR, adecuado para pipelines de captura documental.
- Asistencia visual en movil: integrado mediante la app iOS oficial o llama.cpp en iPhone/iPad, permite describir escenas, leer carteles o responder preguntas sobre fotos con latencia inferior a 2 s al primer token.
- Analisis de video para monitorizacion: al soportar video, puede resumir o responder preguntas sobre secuencias cortas en aplicaciones de vigilancia o revision de contenido.
- Atencion al cliente con imagenes: un chatbot puede recibir capturas o fotos del usuario y responder en multiples idiomas, aprovechando la naturaleza multilingue del modelo.
- Verificacion visual en comercio electronico: comparacion de multiples imagenes de producto para detectar discrepancias o validar listados, usando la capacidad multi-image.
- Asistencia educativa: resolucion de problemas matematicos o cientificos a partir de fotos de ejercicios, apoyandose en su rendimiento en MathVista y MMMU.
- Despliegue en entornos con GPU limitada: la version GGUF permite ejecutar el modelo en CPU o GPUs consumer mediante llama.cpp u Ollama para prototipos y demos locales.

## Benchmarks y rendimiento
Resultados de imagen unica publicados en la model card (OpenCompass y benchmarks individuales):

| Modelo | Tamano | OpenCompass | OCRBench | MathVista | HallusionBench | MMMU | MMVet | MMBench V1.1 | MMStar | AI2D |
|---|---|---|---|---|---|---|---|---|---|---|
| GPT-4v-20240409 | - | 63.5 | 656 | 55.2 | 43.9 | 61.7 | 67.5 | 79.8 | 56.0 | 78.6 |
| Gemini-1.5-Pro | - | 64.5 | 754 | 58.3 | 45.6 | 60.6 | 64.0 | 73.9 | 59.1 | 79.1 |
| GPT-4.1-mini-20250414 | - | 68.9 | 840 | 70.9 | 49.3 | 55.0 | 74.3 | 80.9 | 60.9 | 76.0 |
| Claude 3.5 Sonnet-20241022 | - | 70.6 | 798 | 65.3 | 55.5 | 66.4 | 70.1 | 81.7 | 65.1 | 81.2 |
| Qwen2.5-VL-3B-Instruct | 3.8B | 64.5 | 828 | 61.2 | 46.6 | 51.2 | 60.0 | 76.8 | 56.3 | 81.4 |
| InternVL2.5-4B | 3.7B | 65.1 | 820 | 60.8 | 46.6 | 51.8 | 61.5 | 78.2 | 58.7 | 81.4 |
| Qwen2.5-VL-7B-Instruct | 8.3B | 70.9 | 888 | 68.1 | 51.9 | 58.0 | 69.7 | 82.2 | 64.1 | 84.3 |
| InternVL2.5-8B | 8.1B | 68.1 | 821 | 64.5 | 49.0 | 56.2 | 62.8 | 82.5 | 63.2 | 84.6 |
| MiniCPM-V-2.6 | 8.1B | 65.2 | 852 | 60.8 | 48.1 | 49.8 | 60.0 | 78.0 | 57.5 | 82.1 |

La model card indica que MiniCPM-V 4.0 obtiene 69.0 de media en OpenCompass, superando a GPT-4.1-mini, MiniCPM-V 2.6 y Qwen2.5-VL-3B-Instruct. Los resultados completos de MiniCPM-V 4.0 en la tabla anterior no estan disponibles en el fragmento proporcionado.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; con 4.1B parametros, las cuantizaciones GGUF de 4-8 bits permiten inferencia en rangos de pocos GB de VRAM, aunque la cifra exacta depende de la variante GGUF.
- GPU recomendadas: no detalladas en la informacion disponible; el modelo esta disenado para despliegue en dispositivo y admite llama.cpp, Ollama, vLLM y SGLang.
- GPU consumer: segun el autor, funciona en iPhone 16 Pro Max con menos de 2 s de latencia al primer token y mas de 17 token/s de decodificacion, lo que implica viabilidad en hardware movil y, por extension, en GPUs consumer.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory y demo web local; app iOS oficial para iPhone e iPad.
- Latencia y throughput: en iPhone 16 Pro Max, <2 s al primer token y >17 token/s de decodificacion; el autor menciona buen throughput bajo peticiones concurrentes sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | OpenCompass | OCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.0 | 4.1B | 69.0 | no disponible en el fragmento | Apache 2.0 | Hugging Face (GGUF y base) |
| Qwen2.5-VL-3B-Instruct | 3.8B | 64.5 | 828 | no disponible | Hugging Face |
| InternVL2.5-4B | 3.7B | 65.1 | 820 | no disponible | Hugging Face |
| MiniCPM-V 2.6 | 8.1B | 65.2 | 852 | no disponible | Hugging Face |

MiniCPM-V 4.0 ofrece la mejor puntuacion OpenCompass del grupo con menor numero de parametros que MiniCPM-V 2.6 y Qwen2.5-VL-7B, aunque por debajo de Qwen2.5-VL-7B-Instruct (70.9) en ese agregado. La licencia Apache 2.0 facilita uso comercial frente a alternativas cuya licencia no se detalla en la informacion disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; como modelo entrenado con datos web y RLAIF, puede heredar sesgos de esos corpus.
- Riesgo de alucinacion: la model card incluye HallusionBench, lo que indica sensibilidad a alucinaciones visuales; sus resultados en ese benchmark no estan disponibles en el fragmento.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; el soporte multilingue no detalla que idiomas concretos ni su calidad relativa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y de los datasets asociados.
- Produccion: el repo GGUF requiere `custom_code` en transformers; verificar compatibilidad de la variante GGUF concreta con la version de llama.cpp/Ollama y validar el rendimiento real en el hardware objetivo.
- Esta ficha describe la version cuantizada GGUF; los benchmarks publicados corresponden al modelo base y pueden no reflejarse exactamente tras la cuantizacion.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM-V-4-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Wiki (chino): https://openbmb.cn/docs/
- Demo: http://211.93.21.133:8889/
- Dataset RLAIF-V: https://huggingface.co/datasets/openbmb/RLAIF-V-Dataset
