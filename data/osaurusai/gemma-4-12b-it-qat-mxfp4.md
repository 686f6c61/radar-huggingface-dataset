# OsaurusAI/gemma-4-12B-it-qat-MXFP4

## Resumen

OsaurusAI/gemma-4-12B-it-qat-MXFP4 es una conversión cuantizada del modelo Google Gemma 4 de 12B de parámetros en su variante instruction-tuned con Quantization-Aware Training (QAT). El bundle ha sido empaquetado por OsaurusAI específicamente para su uso con MLX y vMLX sobre Apple Silicon, aplicando cuantización MXFP4 (4 bits, group size 32) a las capas lineales del decodificador mientras se preservan embeddings, normalizaciones y los embedders multimodales en fp16.

El modelo conserva las tres modalidades del Gemma 4 unificado original: texto, visión y audio, con un procesador que define `image_seq_length=280`, `audio_seq_length=750` y `audio_ms_per_token=40`. La arquitectura `gemma4_unified` consta de 48 capas de texto (8 de atención completa y 40 de atención deslizante) con hidden size de 3840, lo que da un total de 11.959.730.224 parámetros.

Su relevancia radica en ofrecer un modelo multimodal de 12B en un formato de aproximadamente 7,37 GiB de pesos, lo que permite su ejecución en equipos Apple Silicon con memoria unificada moderada, manteniendo las capacidades de razonamiento, tool calling y visión del modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` / `Gemma4UnifiedForConditionalGeneration` (transformer decoder con early-fusion multimodal) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, group_size=32) en lineales del decodificador; fp16 en embeddings, norms y embedders multimodales |
| Idiomas soportados | en |
| Licencia | gemma (términos Gemma de Google) |
| Formato de pesos | safetensors (7 shards), librería MLX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 48 capas con hidden size 3840, de las cuales 8 son de atención completa y 40 de atención deslizante (sliding attention). La arquitectura `gemma4_unified` integra de forma temprana las modalidades de visión y audio mediante embedders dedicados: un encoder de visión con `patch_size=16` y un encoder de audio con tokens de 40 ms. El procesador `Gemma4UnifiedProcessor` gestiona la secuencia de imagen (280 tokens) y de audio (750 tokens). No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

La variante original de Google incorpora Quantization-Aware Training (QAT), de la que deriva este bundle. La conversión realizada por OsaurusAI aplica cuantización MXFP4 a 328 tensores con sus correspondientes sidecars `.scales`, manteniendo el resto de pesos en fp16. El tokenizer incluye tokens especiales `<bos>` (id 2), `<eos>` (ids 1, 106, 50) y `<pad>` (id 0), con tokens suprimidos `[258883, 258882]`, y metadatos de parser de herramientas y de razonamiento bajo la etiqueta `gemma4`. No se detalla en la información disponible si hubo RLHF o DPO en el entrenamiento original.

## Capacidades

- Generación de texto conversacional con plantilla de chat Gemma 4 (turnos y canales).
- Razonamiento multi-step con soporte de canal de pensamiento (reasoning parser `gemma4`).
- Comprensión de imágenes (image-text-to-text) con encoder de visión `gemma4_unified_vision`.
- Comprensión de audio con encoder `gemma4_unified_audio` (tokens de 40 ms, 750 tokens por secuencia).
- Tool calling / function calling con parser de herramientas `gemma4` y compatibilidad con required-tool-choice.
- Capacidades de agente y razonamiento multi-turno.
- Soporte multilingüe limitado: la model card declara únicamente inglés (`en`).
- No se declara una ruta de vídeo verificada: el procesador incluye bloque de vídeo, pero no hay `video_config` en la configuración.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno con plantilla de chat Gemma 4 en equipos Apple Silicon, aprovechando el formato MXFP4 para reducir la huella de memoria a unos 7,37 GiB de pesos.
- Análisis de documentos con imágenes: gracias al encoder de visión con patches de 16 px y 280 tokens por imagen, puede procesar capturas, diagramas o formularios y responder preguntas sobre su contenido.
- Transcripción y análisis de audio: el encoder de audio con tokens de 40 ms permite procesar segmentos de audio y generar resúmenes o respuestas contextualizadas, útil en herramientas de accesibilidad o notas de reuniones.
- Agentes con tool calling: la presencia de parser de herramientas `gemma4` y compatibilidad con required-tool-choice permite integrarlo en flujos de agente que invocan APIs externas, bases de datos o funciones locales.
- Razonamiento asistido con canal de pensamiento: el reasoning parser permite separar el contenido visible de los turnos de pensamiento, adecuado para aplicaciones que necesitan trazabilidad del razonamiento.
- Prototipado de aplicaciones MLX/vMLX: al estar empaquetado específicamente para MLX con `mlx_vlm`, sirve como base para desarrollos locales en Apple Silicon sin depender de servicios en la nube.
- Generación de código y asistencia técnica en inglés: aunque no se detallan benchmarks de código, el modelo instruction-tuned puede emplearse en tareas de programación y explicación técnica en entornos de desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 7,37 GiB de pesos indexados más overhead de activaciones, KV cache y procesadores multimodales; se recomienda un mínimo de 16 GB de memoria unificada para uso cómodo.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No está diseñado para GPUs NVIDIA o AMD.
- Cabe en consumer GPU: sí, en equipos Apple Silicon con memoria unificada suficiente; no es compatible con GPUs de consumo convencionales por el formato MLX.
- Opciones de despliegue: MLX y vMLX con soporte de Gemma 4 MXFP4; no debe cargarse con runtimes GGUF (llama.cpp, Ollama en formato GGUF) ni con vLLM/TGI estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-12B-it-qat-MXFP4 | 11,96B | no disponible | texto, visión, audio | gemma | safetensors MLX (MXFP4) |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 11,96B (aprox.) | no disponible | texto, visión, audio | gemma | safetensors |
| Modelos MLX de 12B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El modelo base de Google es la referencia natural, del cual este bundle es una conversión cuantizada para Apple Silicon.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones específicas de fidelidad.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada, pero el modelo hereda los del Gemma 4 original de Google.
- Licencia: se rigen por los términos Gemma de Google; es necesario revisar las restricciones de uso comercial y las políticas de uso prohibido antes de desplegar en producción.
- Compatibilidad: el bundle es exclusivo de MLX/vMLX y no funciona con runtimes GGUF, vLLM o TGI estándar.
- Vídeo: no hay `video_config` en la configuración; el procesador incluye un bloque de vídeo, pero no se declara una ruta de ejecución verificada.
- Contexto: la longitud de contexto no está disponible en la información proporcionada, por lo que no se puede garantizar el comportamiento en conversaciones muy largas.
- Derivado cuantizado: al ser una conversión MXFP4 de un modelo QAT, puede haber una degradación menor de calidad respecto al original en fp16, no cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-12B-it-qat-MXFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Sitio de Osaurus AI: https://osaurus.ai
- Contacto del autor: eric@osaurus.ai
