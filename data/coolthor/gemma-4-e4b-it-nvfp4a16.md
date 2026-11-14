# coolthor/Gemma-4-E4B-it-NVFP4A16

## Resumen

Gemma-4-E4B-it-NVFP4A16 es una versión cuantizada del modelo multimodal google/gemma-4-E4B-it, publicada por el usuario coolthor sobre la base del checkpoint oficial en BF16. Se trata de la primera cuantización NVFP4 documentada para esta variante de Gemma 4, generada con llm-compressor y orientada a despliegue en hardware con memoria unificada, concretamente la NVIDIA DGX Spark (GB10). El modelo conserva la pipeline image-text-to-text del original, por lo que acepta entradas de texto, imagen y audio.

La arquitectura del modelo base es Per-Layer Embedding (PLE), no un transformer denso convencional ni un MoE: el cómputo efectivo por token es de aproximadamente 4B parámetros, mientras que el total asciende a 8.667 millones al incluir las tablas de embedding PLE. Consta de 42 capas decodificadoras, de las cuales 36 usan atención deslizante y 6 atención global, con una longitud de contexto de 128K tokens.

La relevancia de este checkpoint es doble: por un lado, reduce el peso en memoria de 15,0 GB (BF16) a 9,8 GB y multiplica por 2,6 el throughput en GB10 (de 19,2 a 49,9 tok/s); por otro, documenta con detalle una limitación conocida de vLLM al ejecutar Gemma 4 E4B (fallback al kernel Triton por dimensiones de cabeza heterogéneas) que afecta a todas las configuraciones del modelo, no solo a esta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Per-Layer Embedding (PLE); transformer decodificador con 42 capas (36 de atención deslizante, 6 de atención global) |
| Parametros totales | 8.667.245.130 |
| Parametros activos | 4B efectivos por token (no es MoE; el resto corresponde a tablas PLE) |
| Longitud de contexto | 128K tokens (el ejemplo de despliegue usa max-model-len 16384) |
| Tipos de cuantizacion | NVFP4A16 (pesos en FP4, activaciones en FP16); el modelo base admite BF16 y FP8 online |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-E4B-it emplea una arquitectura PLE en la que las tablas de embedding por capa (aproximadamente 5,4 GB en BF16) se consultan en cada token pero no participan del cómputo denso. Esta estructura explica la diferencia entre parámetros totales (8,67B) y parámetros efectivos (4B). La atención es heterogénea: las capas de atención deslizante operan con `head_dim=256` y las globales con `head_dim=512`, un detalle que condiciona el backend de atención en vLLM. El modelo soporta texto, visión y audio, además de tool calling y 128K de contexto.

Sobre el proceso de cuantización: se aplicó NVFP4A16 con llm-compressor v0.10.1.dev (git main, posterior al PR #2561) partiendo del checkpoint BF16 oficial. El método es weight-only y data-free, sin dataset de calibración, y excluye `lm_head`, `vision_tower`, `audio_tower`, `embed_vision` y `embed_audio` de la cuantización. El autor no documenta datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esa información no está disponible en esta ficha.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 128K tokens.
- Procesamiento de imagen (image-text-to-text) mediante vision_tower no cuantizado.
- Procesamiento de audio mediante audio_tower no cuantizado.
- Razonamiento matemático y financiero: el autor verifica cálculos de max profit/loss en un put spread.
- Generación de código: implementación completa de Black-Scholes validada en las pruebas de calidad.
- Salida estructurada en JSON válido.
- Tool calling y function calling, con parsers `pythonic` y `gemma4` en vLLM.
- Soporte de agentes y razonamiento multi-paso mediante `--reasoning-parser gemma4`.
- Capacidad multilingüe verificada al menos en chino tradicional (explicación correcta de BPS); el listado completo de idiomas no está disponible.
- Estabilidad de generación: sin degradación por repetición en pruebas de conteo 1-50 y en salidas largas de 1000 tokens.

## Casos de uso

- Despliegue local en DGX Spark: el checkpoint NVFP4A16 ocupa 9,8 GB de memoria unificada y alcanza 49,9 tok/s, lo que permite servir el modelo en un equipo de escritorio con GB10 sin GPU dedicada de gran formato.
- Asistente multimodal en el borde: al conservar visión y audio sin cuantizar, puede gestionar consultas que combinen imagen y texto (por ejemplo, descripción de documentos escaneados) en hardware con memoria unificada.
- Servicio concurrente de chat: con 3 peticiones en paralelo mantiene 52,7 tok/s por petición y 158 tok/s agregados, adecuado para pequeños equipos o demos internas.
- Generación de código asistida: la validación de Black-Scholes y la salida JSON válida lo hacen apto para pipelines que requieran código ejecutable y respuestas estructuradas, integrable vía API OpenAI-compatible de vLLM.
- Automatización con tool calling: los parsers `pythonic` y `gemma4` permiten construir agentes que invoquen funciones externas en flujos de atención al cliente o extracción de datos.
- Análisis financiero y matemático: los cálculos de spreads verificados por el autor sugieren uso en herramientas de cálculo de derivados o simulaciones numéricas.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de NVFP4A16 frente a BF16 y FP8 en hardware sin cómputo FP4 nativo (GB10, SM121).

## Benchmarks y rendimiento

Rendimiento medido por el autor en NVIDIA DGX Spark (GB10, 128 GB de memoria unificada, 273 GB/s de ancho de banda), 3 ejecuciones de 500 tokens con varianza de ±0,1 tok/s:

| Formato | Memoria GPU | tok/s | Relativo |
|---|---|---|---|
| BF16 | 15,0 GB | 19,2 | 1,0x |
| FP8 (online) | 11,4 GB | 36,0 | 1,9x |
| NVFP4A16 | 9,8 GB | 49,9 | 2,6x |
| NVFP4 W4A4 | 10,2 GB | 39,2 | 2,0x |

Datos adicionales aportados: salida larga de 1000 tokens a 49,8 tok/s sin degradación; 3 peticiones concurrentes a 52,7 tok/s por petición (158 tok/s agregados); sin degradación por repetición. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9,8 GB para NVFP4A16; 11,4 GB para FP8 online; 15,0 GB para BF16.
- GPU recomendadas: NVIDIA DGX Spark (GB10) es el objetivo declarado y el hardware de las mediciones. En GPUs con cómputo FP4 nativo (B200/B100) el autor espera que W4A4 supere a W4A16, aunque no aporta mediciones.
- Consumer GPU: cabe en tarjetas con al menos 10-12 GB de VRAM (RTX 4080/4090, entre otras), pero el rendimiento se ve muy penalizado por el fallback de atención: en RTX 4090 el modelo base E4B rinde ~9 tok/s frente a ~100+ tok/s de un Llama de 3B comparable, una brecha de 11x atribuible al backend.
- Despliegue: vLLM con `--quantization compressed-tensors`; imagen Docker `vllm/vllm-openai:gemma4-cu130`. Para cuantizar de nuevo, llm-compressor desde git main (la versión de PyPI no soporta Gemma 4 por conflicto de transformers).
- Throughput: 49,9 tok/s en GB10 con salida de 500 tokens y 49,8 tok/s con 1000 tokens; 158 tok/s agregados con 3 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (GB10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-it NVFP4A16 (este) | 8,67B totales / 4B efectivos | 128K | 49,9 tok/s, 9,8 GB | Apache 2.0 | Hugging Face |
| Gemma-4-E4B-it BF16 (base) | 8,67B totales / 4B efectivos | 128K | 19,2 tok/s, 15,0 GB | Apache 2.0 | Hugging Face (google) |
| Gemma-4-E4B-it FP8 online | 8,67B totales / 4B efectivos | 128K | 36,0 tok/s, 11,4 GB | Apache 2.0 | Hugging Face (google) |
| Gemma 4 26B-A4B MoE (referencia del autor) | 26B totales / ~3,8B activos | no disponible | 52 tok/s | no disponible | no disponible |

La comparación con el MoE de 26B-A4B es relevante porque, pese a su mayor tamaño, solo lee 3,8B parámetros activos por token, mientras que E4B lee 4B de cómputo más 5,4 GB de tablas PLE en BF16, lo que explica que sea ligeramente más lento. No se dispone de datos de benchmarks de calidad para comparar.

## Limitaciones y advertencias

- Fallback de atención en vLLM: las dimensiones de cabeza heterogéneas (256 en atención deslizante, 512 en global) obligan a desactivar FlashAttention y usar el kernel Triton, mucho más lento. Afecta a todas las configuraciones de E4B, no solo a esta cuantización; se espera una mejora del 30-50% cuando se fusione el PR #38891.
- Las tablas PLE permanecen en BF16 y consumen ancho de banda en cada token, lo que limita el throughput incluso tras cuantizar.
- En GB10 (SM121) no hay cómputo FP4 nativo para activaciones: W4A4 cae a dequantización Marlin y resulta más lento que W4A16. La elección de formato óptimo depende del hardware.
- El proceso de cuantización es data-free, sin calibración; no se han publicado evaluaciones de degradación de calidad frente al BF16 más allá de las pruebas cualitativas del autor (chino, matemáticas, código, JSON, repetición).
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los del modelo base, no disponibles en esta ficha.
- Idiomas soportados: no disponible el listado oficial; solo se verifica chino tradicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base google/gemma-4-E4B-it, ya que la ficha no detalla condiciones adicionales.
- Dependencias frágiles: requiere transformers >= 5.5, huggingface_hub >= 0.30 y torchvision para Gemma4VideoProcessor; llm-compressor de PyPI no es compatible.
- El checkpoint tiene 427 descargas y 1 like en el momento de la consulta; es un artefacto de un solo autor, no una publicación oficial de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/Gemma-4-E4B-it-NVFP4A16
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Blog del autor: https://ai-muninn.com
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Issue de vLLM sobre el fallback de atención: https://github.com/vllm-project/vllm/issues/38887
- PR de selección de backend por capa: https://github.com/vllm-project/vllm/pull/38891
