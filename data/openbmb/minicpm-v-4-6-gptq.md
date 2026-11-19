# openbmb/MiniCPM-V-4.6-GPTQ

## Resumen

MiniCPM-V 4.6 GPTQ es la versión cuantizada a 4 bits (W4A16, GPTQModel) de MiniCPM-V 4.6, un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB (Tsinghua University / ModelBest). El modelo combina un codificador visual SigLIP2-400M con el LLM Qwen3.5-0.8B, dando lugar a un MLLM de aproximadamente 1.300 millones de parámetros totales diseñado explícitamente para despliegue en el borde (móvil y dispositivos de consumo).

El problema que resuelve es la comprensión de imagen y vídeo de alta calidad en entornos con recursos muy limitados: según el autor, MiniCPM-V 4.6 alcanza una puntuación de 13 en el Artificial Analysis Intelligence Index, por encima de Qwen3.5-0.8B (10) y Qwen3.5-0.8B-Thinking (11), con un coste en tokens entre 19x y 43x menor, y supera también a Ministral 3 3B (11). Esta variante GPTQ reduce el peso del repositorio a 1,9 GB, lo que la hace viable en GPUs de consumo y en plataformas móviles iOS, Android y HarmonyOS.

La relevancia actual reside en su combinación de eficiencia arquitectónica (compresión de tokens visuales mixta 4x/16x, más de un 50% de reducción de FLOPs en el codificado visual respecto a la técnica LLaVA-UHD v4) y compatibilidad con el ecosistema estándar de inferencia y ajuste fino (vLLM, SGLang, llama.cpp, Ollama, SWIFT, LLaMA-Factory), todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B (transformer multimodal) |
| Parametros totales | 1.300.428.016 (≈1,3 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit (W4A16, GPTQModel); el modelo base ofrece variantes GGUF, BNB, AWQ y GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ), librería transformers |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 es un modelo multimodal que empareja un codificador visual SigLIP2-400M con el modelo de lenguaje Qwen3.5-0.8B. La innovación arquitectónica principal es la compresión mixta de tokens visuales con tasas 4x/16x, que permite alternar entre precisión y velocidad, y una reducción de más del 50% de los FLOPs de codificación visual gracias a las técnicas de LLaVA-UHD v4. Según el autor, esto se traduce en aproximadamente 1,5x más throughput de tokens que Qwen3.5-0.8B. La variante de este repositorio aplica cuantización GPTQ de 4 bits con activaciones de 16 bits (W4A16) mediante GPTQModel sobre los pesos BF16 originales.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo se distribuye en dos variantes de comportamiento, Instruct y Thinking, cuyas evaluaciones publica el autor, pero los detalles del pipeline de alineamiento no están documentados en la información disponible.

## Capacidades

- Comprensión de imagen individual, múltiples imágenes y vídeo (pipeline image-text-to-text).
- Generación de texto conversacional multimodal en modo Instruct y modo Thinking (razonamiento explícito).
- Comprensión de documentos, OCR y tareas de grounding visual (el autor cita OCRBench, RefCOCO y HallusionBench entre los benchmarks evaluados).
- Compresión de tokens visuales configurable (4x/16x) para ajustar precisión frente a velocidad.
- Despliegue en dispositivo: adaptaciones abiertas para iOS, Android y HarmonyOS.
- Compatibilidad con frameworks de inferencia (vLLM, SGLang, llama.cpp, Ollama) y de ajuste fino (SWIFT, LLaMA-Factory).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en movilidad: integración del modelo cuantizado en aplicaciones iOS, Android o HarmonyOS para describir escenas, leer carteles o resolver ejercicios escritos a mano capturados con la cámara, aprovechando su tamaño de 1,9 GB y las adaptaciones de borde publicadas por el autor.
- Digitalización y accesibilidad de documentos: extracción de texto y estructura de tickets, formularios o páginas escaneadas mediante las capacidades OCR evaluadas en OCRBench, con la tasa de compresión 16x para procesar documentos largos con menos cómputo.
- Moderación y análisis de vídeo en el borde: procesamiento de clips cortos para detectar contenido relevante o generar resúmenes, usando la compresión 4x cuando se requiere mayor fidelidad visual y 16x para flujos de alto volumen.
- Asistente de estudio con razonamiento visual: activación del modo Thinking para resolver problemas de matemáticas o ciencias a partir de fotografías de enunciados, con la ventaja de coste en tokens que el autor cifra en 19x-43x menor que Qwen3.5-0.8B.
- Automatización de atención al cliente con imágenes: recepción de capturas de pantalla o fotos de productos enviadas por usuarios y generación de respuestas contextuales en un servicio desplegado con vLLM o SGLang sobre una única GPU de consumo.
- Prototipado e investigación en visión-lenguaje: ajuste fino con SWIFT o LLaMA-Factory sobre GPUs de consumo para adaptar el modelo a dominios verticales (retail, inspección industrial, salud), partiendo de la variante GPTQ para iterar con requisitos de VRAM reducidos.
- Grounding visual para robótica ligera o domótica: localización de objetos referidos por lenguaje natural (evaluado en RefCOCO) en dispositivos empotrados con presupuesto de memoria ajustado.

## Benchmarks y rendimiento

El autor publica resultados en forma de gráficas (no de tablas numéricas) en la model card, por lo que no se dispone de cifras exactas por benchmark en la información proporcionada. Los datos cualitativos disponibles son:

| Benchmark / métrica | Resultado |
|---|---|
| Artificial Analysis Intelligence Index | 13 (Qwen3.5-0.8B: 10; Qwen3.5-0.8B-Thinking: 11; Ministral 3 3B: 11) |
| OpenCompass | nivel comparable a Qwen3.5 2B según el autor |
| RefCOCO | nivel comparable a Qwen3.5 2B según el autor |
| HallusionBench | nivel comparable a Qwen3.5 2B según el autor |
| MUIRBench | nivel comparable a Qwen3.5 2B según el autor |
| OCRBench | nivel comparable a Qwen3.5 2B según el autor |
| Throughput de tokens | ~1,5x respecto a Qwen3.5-0.8B |
| Coste en tokens | 19x menor que Qwen3.5-0.8B; 43x menor que Qwen3.5-0.8B-Thinking |

No se han publicado en la información disponible valores numéricos desglosados de MMLU, HumanEval, GSM8K ni del resto de benchmarks citados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GPTQ ocupa 1,9 GB en disco; en FP16 el modelo base rondaría los 2,6 GB de pesos, por lo que la variante 4-bit debería operar con aproximadamente 3-4 GB de VRAM incluyendo caché KV y buffers, aunque el autor no publica una cifra exacta.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 6-8 GB de VRAM es candidata razonable.
- GPU de consumo: cabe previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; el despliegue móvil está validado por el autor en iPhone 17 Pro Max, Redmi K70 y HUAWEI nova 14.
- Opciones de despliegue: transformers (>=5.7.0 con torchvision y torchcodec), vLLM, SGLang, llama.cpp, Ollama; ajuste fino con SWIFT y LLaMA-Factory.
- Latencia y throughput: el autor reporta ~1,5x más throughput de tokens que Qwen3.5-0.8B y publica gráficas de TTFT en petición única y throughput en alta concurrencia, pero sin cifras numéricas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (AA Intelligence Index) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 (GPTQ) | ~1,3 B | no disponible | 13 | Apache 2.0 | Hugging Face, pesos GPTQ/GGUF/AWQ/BNB |
| Qwen3.5-0.8B | 0,8 B | no disponible | 10 | no disponible en la información | no disponible en la información |
| Qwen3.5-0.8B-Thinking | 0,8 B | no disponible | 11 | no disponible en la información | no disponible en la información |
| Ministral 3 3B | 3 B | no disponible | 11 | no disponible en la información | no disponible en la información |

Los datos de rendimiento de la comparativa provienen exclusivamente de las afirmaciones del autor en la model card. No se dispone de información sobre contexto, licencia ni disponibilidad de los modelos comparados en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen3.5-0.8B y SigLIP2, puede heredar sesgos de sus datos de preentrenamiento, no verificables con la documentación disponible.
- Riesgo de alucinación: presente como en cualquier MLLM de este tamaño; el autor reporta resultados en HallusionBench, pero no se publican cifras que permitan cuantificar la tasa de alucinación visual.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas soportados no están disponibles; conviene validar el comportamiento en castellano antes de producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las licencias de los componentes base (SigLIP2 y Qwen3.5-0.8B), cuya información no se detalla en este repositorio.
- Cuantización GPTQ: la pérdida de precisión frente a BF16 no está cuantificada por el autor; para tareas sensibles (OCR fino, grounding) conviene comparar contra el modelo base antes de desplegar.
- Dependencias: requiere transformers >=5.7.0 y torchcodec para decodificación de vídeo, con posibles incompatibilidades de CUDA (el autor documenta errores con CUDA 12.x y sugiere PyAV como alternativa).
- Escala: con ~1,3 B de parámetros, el modelo no es adecuado para razonamiento complejo de largo alcance ni para tareas que exijan conocimiento factual extenso; su ventaja es la eficiencia en el borde.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/openbmb/MiniCPM-V-4.6-GPTQ
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-GPTQ-Demo
- Documentación de la API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Repositorio LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Vídeo demostración: https://www.youtube.com/watch?v=Ch5UG1FoysM
- Papers citados (arXiv): 2604.27393, 2509.18154, 2408.01800, 2605.08985
