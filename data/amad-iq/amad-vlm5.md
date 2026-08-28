# amad-iq/amad-vlm5

## Resumen

amad-vlm5 es un modelo de visión y lenguaje (VLM) especializado en OCR de texto árabe, desarrollado por el usuario amad-iq mediante fine-tuning del modelo base Qwen/Qwen2.5-VL-7B-Instruct. Dada una imagen con texto árabe —impreso, manuscrito, histórico, escaneado o sintético—, el modelo devuelve la transcripción correspondiente. El modelo se comporta como un modelo de razonamiento: ante documentos densos a nivel de página, primero razona dentro de un bloque `thinking… response` y después emite la transcripción final; ante imágenes de líneas cortas suele responder directamente.

Con 8 292 166 656 parámetros (aproximadamente 8,3 mil millones), el modelo se distribuye en formato bf16 (safetensors, 16,6 GB) y en cuantizaciones GGUF (f16, q8_0 y q4_k_m) junto con un archivo `mmproj` obligatorio que contiene el encoder de visión. Se publica bajo licencia Apache 2.0 y soporta árabe e inglés. Su relevancia radica en que aborda un dominio poco cubierto por los VLM generalistas: el OCR de árabe, incluida escritura manuscrita y documentos históricos, con resultados competitivos frente a modelos cerrados como Gemini-2.0-Flash o GPT-4o en el benchmark KITAB-Bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM), basada en Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8 292 166 656 (8,29 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-VL-7B-Instruct soporta 32 768 tokens |
| Tipos de cuantizacion | bf16 (safetensors); GGUF f16, q8_0 y q4_k_m |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

amad-vlm5 hereda la arquitectura de Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un encoder de visión con un modelo de lenguaje autoregresivo. El modelo se obtuvo mediante fine-tuning del modelo base con datos de OCR en árabe que incluyen texto impreso, manuscrito, histórico, escaneado y sintético. La model card no detalla el volumen de datos de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO.

La innovación técnica más destacable es el comportamiento de razonamiento: ante documentos densos, el modelo genera primero un bloque de razonamiento delimitado por las etiquetas `thinking` y `response`, y solo después emite la transcripción final. Las aplicaciones deben extraer únicamente el texto posterior a la última etiqueta `response`. El modelo se evaluó con decodificación greedy en configuración cuantizada a 4 bits; los pesos bf16 y GGUF publicados no se re-evaluaron por separado, por lo que pueden existir pequeñas diferencias frente a las métricas declaradas.

## Capacidades

- OCR de texto árabe en imágenes: impreso, manuscrito, histórico, escaneado y sintético.
- Comprensión de documentos a nivel de página, con razonamiento previo a la transcripción en documentos densos.
- Transcripción directa en imágenes de líneas cortas, sin bloque de razonamiento.
- Soporte de entrada multimodal imagen y texto, con salida de texto (pipeline image-text-to-text).
- Capacidades multilingües limitadas a árabe e inglés.
- Modo de razonamiento (thinking) integrado en la generación para documentos complejos.
- Compatible con el ecosistema Transformers, vLLM, llama.cpp y LM Studio.

## Casos de uso

- Digitalización de documentos históricos árabes: el modelo transcribe manuscritos y textos antiguos con una ventana de salida de hasta 4096 tokens, lo que permite procesar páginas completas de archivos y bibliotecas digitales.
- Reconocimiento de escritura manuscrita árabe: gracias a su fine-tuning con datasets como khatt, onlinekhatt y muharaf, puede transcribir notas y cartas manuscritas con tasas de error bajas (CER 0,03 en khatt, 0,02 en onlinekhatt).
- OCR de libros y publicaciones árabes: con un CHrF de 96,28 en patsocr y 91,66 en synthesizear, resulta adecuado para convertir colecciones editoriales a texto digital buscable.
- Automatización de procesamiento de formularios y facturas: el modelo puede extraer texto de documentos comerciales escaneados en árabe, integrándose en pipelines de gestión documental mediante la API de Transformers o vLLM.
- Archivado y búsqueda de documentos: al transcribir imágenes a texto, permite indexar y buscar contenido en repositorios de documentos árabes escaneados.
- Accesibilidad: conversión de imágenes con texto árabe a texto legible para lectores de pantalla y sistemas de asistencia a personas con discapacidad visual.
- Preparación de datos para traducción asistida: la transcripción de documentos árabes escaneados sirve como entrada para pipelines de traducción automática, reduciendo la pérdida de información frente a OCR tradicionales.
- Despliegue local con privacidad: al ser un modelo de código abierto con licencia Apache 2.0, puede ejecutarse en infraestructura propia con GGUF cuantizado, evitando el envío de documentos sensibles a APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor en KITAB-Bench `ocr-eval` (13 datasets, 3760 imágenes, puntuación sobre la transcripción final con normalización árabe del benchmark). Comparación con modelos de referencia:

| Modelo | CHrF ↑ | CER ↓ | WER ↓ |
|---|---:|---:|---:|
| **amad-vlm5** | **81,05** | **0,25** | **0,36** |
| AIN-7B | 78,33 | 0,20 | 0,28 |
| Gemini-2.0-Flash | 77,95 | 0,13 | 0,32 |
| GPT-4o | 61,01 | 0,31 | 0,55 |
| Qwen2.5VL-7B | 49,23 | 1,20 | 1,41 |
| GPT-4o-mini | 47,21 | 0,43 | 0,71 |
| EasyOCR | 45,47 | 0,58 | 0,89 |
| Tesseract | 39,62 | 0,54 | 0,84 |
| Qwen2VL-7B | 33,94 | 1,48 | 1,55 |
| Surya | 20,61 | 4,95 | 5,61 |
| Paddle | 16,73 | 0,79 | 1,02 |

Resultados por dataset (puntuación sobre respuesta final, 4096 tokens):

| Dataset | Muestras | CER ↓ | WER ↓ | CHrF ↑ |
|---|---:|---:|---:|---:|
| patsocr | 500 | 0,01 | 0,06 | 96,28 |
| onlinekhatt | 200 | 0,02 | 0,08 | 95,75 |
| khatt | 200 | 0,03 | 0,16 | 93,83 |
| synthesizear | 500 | 0,04 | 0,15 | 91,66 |
| muharaf | 200 | 0,05 | 0,14 | 90,55 |
| isippt | 500 | 0,05 | 0,21 | 90,27 |
| arabicocr | 50 | 0,02 | 0,09 | 95,17 |
| historicalbooks | 10 | 0,21 | 0,38 | 70,82 |
| hindawi | 200 | 0,24 | 0,38 | 69,44 |
| evarest | 800 | 0,29 | 0,52 | 68,45 |
| adab | 200 | 0,17 | 0,59 | 66,45 |
| khattparagraph | 200 | 0,71 | 0,88 | 62,45 |
| historyar | 200 | 1,45 | 1,06 | 62,56 |

Caveats declarados por el autor:

1. Solapamiento de entrenamiento: 552 imágenes del benchmark (khatt 200/200, onlinekhatt 181/200, muharaf 171/200) aparecen también en los datos de entrenamiento. Excluyendo esos tres datasets, la puntuación es CHrF 77,35 / CER 0,32 / WER 0,43 sobre las 3160 imágenes restantes.
2. Dos valores atípicos dominan el CER: dos de las 3760 salidas degeneran en una frase repetida; sin ellas, el CER es 0,13 y el WER 0,28. CHrF, al estar acotado, es la métrica más estable.

El benchmark se ejecutó con decodificación greedy en configuración de inferencia cuantizada a 4 bits; los pesos bf16 y GGUF no se re-evaluaron por separado.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - bf16 (safetensors, 16,6 GB): requiere aproximadamente 17-18 GB de VRAM.
  - GGUF q8_0 (8,10 GB): requiere aproximadamente 9-10 GB de VRAM.
  - GGUF q4_k_m (4,68 GB): requiere aproximadamente 5-6 GB de VRAM.
  - El archivo `mmproj` (1,35 GB) es obligatorio junto a cualquier GGUF y añade su consumo de VRAM.
- GPU recomendadas:
  - bf16: NVIDIA RTX 4090, A100, H100 o GPUs con 24 GB o más de VRAM.
  - GGUF q8_0: RTX 3090, RTX 4080, RTX 4090 (16-24 GB).
  - GGUF q4_k_m: RTX 3060 (12 GB), RTX 4060 Ti (16 GB) u otras GPUs de consumo con 8-12 GB.
- Sí cabe en GPUs de consumo: con la cuantización q4_k_m y el mmproj, un total aproximado de 6 GB de VRAM permite ejecutarlo en GPUs de gama media.
- Opciones de despliegue: Transformers (Python), vLLM, llama.cpp (comando `llama-mtmd-cli`), LM Studio y servidores compatibles con text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | CHrF (KITAB-Bench) | CER ↓ | Licencia |
|---|---:|---|---:|---:|---|
| **amad-vlm5** | 8,29 B | OCR arabe | **81,05** | 0,25 | Apache 2.0 |
| AIN-7B | 7 B (aprox.) | OCR arabe | 78,33 | 0,20 | No disponible |
| Qwen2.5-VL-7B | 8,29 B | VLM generalista | 49,23 | 1,20 | Apache 2.0 |
| Qwen2-VL-7B | 7 B (aprox.) | VLM generalista | 33,94 | 1,48 | Apache 2.0 |
| Gemini-2.0-Flash | No disponible | VLM cerrado | 77,95 | 0,13 | Propietaria |
| GPT-4o | No disponible | VLM cerrado | 61,01 | 0,31 | Propietaria |

amad-vlm5 supera en CHrF a todos los modelos comparados, incluidos los cerrados Gemini-2.0-Flash y GPT-4o, aunque AIN-7B presenta un CER inferior (0,20 frente a 0,25). Frente a los VLM generalistas de su misma familia (Qwen2.5-VL-7B y Qwen2-VL-7B), la mejora es sustancial, lo que confirma el valor del fine-tuning especializado. La ventaja principal sobre las alternativas cerradas es la licencia Apache 2.0, que permite uso comercial y despliegue local sin restricciones.

## Limitaciones y advertencias

- Solapamiento de datos de entrenamiento con el benchmark: 552 imágenes de KITAB-Bench (khatt, onlinekhatt y muharaf) están presentes en los datos de entrenamiento, lo que puede inflar las métricas declaradas. El autor lo declara explícitamente y ofrece la puntuación corregida (CHrF 77,35 / CER 0,32 / WER 0,43).
- Degeneración ocasional de salida: dos de las 3760 salidas del benchmark degeneran en una frase repetida. Se recomienda usar `repetition_penalty` (1,05 en los ejemplos oficiales) y validar las transcripciones en producción.
- Dependencia del bloque de razonamiento: el modelo emite bloques `thinking… response` en documentos densos; las aplicaciones deben filtrar el texto posterior a la última etiqueta `response`, lo que añade complejidad de postprocesado.
- Rendimiento desigual por tipo de documento: los datasets más difíciles (historyar con CER 1,45, khattparagraph con CER 0,71) muestran errores mucho mayores que los documentos impresos modernos (patsocr con CER 0,01).
- Idioma limitado: solo soporta árabe e inglés; no es adecuado para OCR en otros alfabetos.
- Contexto no documentado: la model card no especifica la longitud de contexto efectiva del modelo fine-tuned; se recomienda configurar al menos 8192 tokens en LM Studio.
- Los pesos bf16 y GGUF no se re-evaluaron por separado tras el benchmark, que se ejecutó en configuración cuantizada a 4 bits; pueden existir pequeñas diferencias de rendimiento.
- Riesgo de alucinación inherente a los modelos generativos: en documentos muy ruidosos o de baja calidad, el modelo puede producir transcripciones plausibles pero incorrectas.

## Enlaces

- Repositorio HuggingFace (bf16 safetensors): https://huggingface.co/amad-iq/amad-vlm5
- Repositorio HuggingFace GGUF: https://huggingface.co/amad-iq/amad-vlm5-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Benchmark KITAB-Bench: https://github.com/mbzuai-oryx/KITAB-Bench
