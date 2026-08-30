# Adolphsson/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-MTP-NVFP4

## Resumen

El modelo `Adolphsson/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-MTP-NVFP4` es un checkpoint comunitario, ensamblado a mano, que combina el fine-tune `HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive` (una variante "uncensored" y directa del Gemma-4-E4B de Google) con una cuantización NVFP4 (W4A16) del transformador de texto mediante NVIDIA ModelOpt, manteniendo los encoders multimodales (visión y audio) en BF16. El resultado es un modelo multimodal (texto, imagen y audio) de 9,7 GB que cabe en una RTX 5090 y alcanza velocidades de decodificación de hasta ~430 tokens por segundo con decodificación especulativa MTP activada.

El modelo resuelve el problema de servir un Gemma-4-E4B multimodal nativo en hardware consumer Blackwell sin recurrir a GGUF ni a soluciones propietarias. Su relevancia radica en que es el primer build NVFP4 multimodal de este modelo que funciona con vLLM estándar, incluyendo soporte nativo para tool calling, contexto largo de 131 072 tokens y MTP (multi-token prediction) como drafter integrado. No es un lanzamiento oficial de Google ni de HauhauCS, sino una integración técnica comunitaria.

La arquitectura combina un transformador de texto de 42 capas con hidden size 2 560, una torre de visión de 16 capas y un encoder de audio de 12 capas. El contexto es de 131 072 tokens con atención híbrida (ventana deslizante de 512 y atención completa). El repositorio incluye un único archivo `model.safetensors` de 9,7 GB con 3 032 tensores, junto con tokenizer, processor y configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión + audio), atención híbrida (sliding window 512 + full attention) |
| Parametros totales | No especificado en la documentación; el nombre sugiere ~4B pero no confirmado |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | NVFP4 (W4A16, grupo 16) en el transformador de texto; BF16 en vision tower, audio encoder, lm_head y embeddings |
| Idiomas soportados | Sueco (sv) e inglés (en) según la metadata |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (un único archivo `model.safetensors`, 9,7 GB) |

## Arquitectura y entrenamiento

El modelo parte del fine-tune `HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive`, una variante del Gemma-4-E4B oficial entrenada con un perfil "agresivo" y menos cauteloso. Sobre ese fine-tune, el autor realizó una conversión de GGUF a formato HuggingFace, aplicó cuantización NVFP4 (W4A16) al transformador de texto con NVIDIA ModelOpt 0.46.0 (`modelopt_fp4`), y reensambló el checkpoint con los encoders multimodales del modelo base en BF16, excluyéndolos de la cuantización. El lm_head y los embeddings también se mantienen en BF16 con embeddings atados.

El transformador de texto tiene 42 capas con hidden size de 2 560. La atención es híbrida: ventana deslizante de 512 tokens combinada con atención completa, lo que permite el contexto largo de 131 072 tokens. El modelo incorpora soporte nativo de MTP (multi-token prediction) en vLLM 0.28, actuando como drafter para decodificación especulativa. No se han publicado detalles sobre el dataset de entrenamiento del fine-tune original ni sobre el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de texto en inglés y sueco, con estilo directo y menos cauteloso (perfil "aggressive" del fine-tune).
- Entrada multimodal: imagen (hasta 4 por prompt), vídeo (hasta 2) y audio (hasta 4), gestionadas mediante el processor multimodal de Gemma-4.
- Tool calling nativo, compatible con el parser `gemma4` de vLLM y `--enable-auto-tool-choice`.
- Razonamiento con canal de pensamiento opcional (thinking mode) activable mediante `enable_thinking: true`; los tokens de pensamiento se decodifican más rápido con MTP.
- Decodificación especulativa MTP con drafter externo (`google/gemma-4-e4b-it-assistant`), con soporte de hasta 6 tokens especulativos.
- Contexto largo de 131 072 tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Transcripción de audio, extracción de nombres y conteo de palabras (verificado con el parche documentado).

## Casos de uso

- Asistente conversacional bilingüe (sueco/inglés) con estilo directo: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 131 072 tokens, manteniendo el historial completo sin truncamientos.
- Análisis de documentos con imágenes: al aceptar hasta 4 imágenes por prompt, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información estructurada con tool calling.
- Transcripción y análisis de audio: con el parche aplicado, puede transcribir audio, identificar nombres propios y realizar conteos de palabras, útil para reuniones o entrevistas.
- Agente autónomo con tool calling: su soporte nativo de herramientas y razonamiento multi-step permite construir agentes que consultan APIs, bases de datos o ejecutan acciones en entornos controlados.
- Generación de código con contexto largo: puede trabajar con repositorios completos o archivos extensos dentro de la ventana de 131k tokens, generando o modificando código con conocimiento del proyecto.
- Prototipado de aplicaciones multimodales en hardware consumer: al caber en una RTX 5090 con 32 GB, sirve para desarrollar y probar pipelines de visión-lenguaje-audio sin necesidad de clústeres de GPUs.
- Investigación sobre modelos "uncensored": su perfil menos cauteloso permite estudiar comportamientos de rechazo y seguridad en modelos de lenguaje, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de throughput de decodificación en una RTX 5090 con vLLM 0.28, que se reproducen a continuación.

| `--spec-tokens` | Decode (entrada corta) | Decode (entrada larga) | Tokens aceptados/iteración |
|---|---|---|---|
| Desactivado (baseline) | 212 tok/s | 205 tok/s | — |
| 4 | 419 tok/s | 338 tok/s | 2,61 |
| 5 (recomendado) | 434 tok/s | 368 tok/s | 2,82 |
| 6 | 453 tok/s | 345 tok/s | 1,88 |

Con thinking activado y MTP K=5, se midieron 624–700 tok/s, ya que los tokens de razonamiento son más predecibles para el drafter. Para salidas muy cortas (<200 tokens), MTP puede suponer una ligera pérdida de rendimiento.

## Requisitos de hardware

- VRAM estimada: 9,7 GB para los pesos NVFP4 + 0,1–0,3 GB para el drafter MTP. Con la configuración recomendada (`--gpu-memory-utilization 0.72`) cabe en una RTX 5090 de 32 GB, dejando margen para KV cache y procesamiento multimodal.
- GPU recomendada: RTX 5090 (Blackwell) verificada. Se requiere hardware Blackwell para la cuantización NVFP4 en vLLM; no se garantiza funcionamiento en GPUs de generaciones anteriores.
- Opciones de despliegue: vLLM 0.28 es la única librería verificada, con CUDA 13 y Python 3.12. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: 212 tok/s sin MTP, hasta 453 tok/s con MTP K=6 en entrada corta, y 368 tok/s en entrada larga con K=5 (recomendado).
- Requisitos adicionales: paquetes `av` (PyAV) y `soundfile` para entrada de audio; parche de una línea en `transformers` para el encoder de audio cuantizado.

## Comparativa con modelos similares

| Modelo | Cuantización | Contexto | Multimodal | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (NVFP4) | NVFP4 W4A16 | 131 072 | Sí (visión+audio) | Sí | Gemma | HuggingFace |
| HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (GGUF) | GGUF (varias) | No especificado | No especificado | No | Gemma | HuggingFace |
| Gemma-4-E4B oficial (Google) | BF16 | 131 072 | Sí | Sí | Gemma | HuggingFace / Google |

El modelo NVFP4 ofrece la ventaja de ocupar 9,7 GB frente a los pesos BF16 del oficial (mucho mayores), a costa de una cuantización agresiva que puede introducir ligeras pérdidas de calidad. Frente al GGUF de HauhauCS, añade multimodalidad y soporte nativo de MTP, pero requiere hardware Blackwell y vLLM 0.28.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Google ni de HauhauCS; es un ensamblaje comunitario que puede presentar comportamientos inesperados en producción.
- El perfil "uncensored" y "aggressive" del fine-tune reduce los mecanismos de rechazo, lo que puede generar contenido ofensivo, sesgado o inapropiado. No apto para uso público sin moderación.
- La entrada de audio requiere un parche manual de una línea en `transformers` (`Gemma4ClippedLinear.forward`); sin él, el motor falla en la primera petición de audio.
- La cuantización NVFP4 presenta una advertencia de divergencia en `weight_scale_2` en las capas QKV fusionadas, típica de modelos Gemma cuantizados con NVFP4.
- Idiomas soportados limitados a sueco e inglés según la metadata; no se garantiza calidad en otros idiomas.
- La licencia Gemma impone restricciones de uso comercial y requiere cumplir los términos de Google; verificar antes de desplegar en entornos empresariales.
- El canal de razonamiento es texto crudo, no estructurado, lo que puede dificultar el parseo automático de respuestas con thinking activado.
- Sin benchmarks de calidad publicados, no es posible comparar su rendimiento académico con otros modelos de forma objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adolphsson/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-MTP-NVFP4
- Modelo base (fine-tune original): https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Página del GGUF (alternativa): https://local-ai-zone.github.io/models/gemma-4-e4b-uncensored-hauhaucs-aggressive.html
- Análisis de fiabilidad de derivados Gemma 4 E4B: https://knightli.com/en/2026/04/18/gemma-4-e4b-uncensored-vs-official/
- Repositorio relacionado (NVFP4 de otro modelo): https://github.com/AEON-7/Gemma-4-E4B-it-Uncensored-NVFP4
