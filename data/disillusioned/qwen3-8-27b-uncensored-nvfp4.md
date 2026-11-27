# disillusioned/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

Qwen3.8-27B-Uncensored-NVFP4 es una cuantización de 4 bits en formato NVFP4 del modelo orcarouter/Qwen3.8-27B-Uncensored, una versión "abliterated" (sin mecanismos de rechazo) del Qwen3.8-27B de Alibaba. El trabajo lo firma el usuario disillusioned y se publica bajo licencia Apache 2.0. El modelo base pertenece a la familia Qwen3.8, con arquitectura híbrida que combina atención completa y atención lineal (Gated DeltaNet), e incluye torre de visión, por lo que su pipeline es image-text-to-text.

La contribución principal de esta ficha es la cuantización: se aplica NVFP4 (pesos e inputs de capa en FP4 E2M1 con escalas FP8-E4M3 en grupos de 16) a todas las capas lineales del modelo de lenguaje, incluyendo atención completa, atención lineal y MLP. A diferencia de la build NVFP4+FP8 de orcarouter, que mantiene la atención lineal en FP8, aquí también se cuantiza esa parte, lo que reduce el peso y deja margen para contextos largos en una GPU de 32 GB.

Es relevante ahora porque permite ejecutar un modelo multimodal de 27.781 millones de parámetros con contexto de hasta 131.072 tokens en hardware relativamente contenido, con soporte de decodificación especulativa mediante cabeza MTP y tool calling verificado. Está pensado para red-teaming, investigación de seguridad de IA y despliegues que requieren un modelo sin filtros de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal (Gated DeltaNet), torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (probado en vLLM con `--max-model-len 131072`) |
| Tipos de cuantizacion | NVFP4 (4 bits, FP4 E2M1 con escalas FP8-E4M3 en grupos de 16); capas en BF16: `lm_head`, embeddings, torre de visión, convoluciones cortas y cabeza MTP |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida que intercala atención completa con atención lineal del tipo Gated DeltaNet, e incorpora una torre de visión para entrada image-text-to-text. Dispone de una cabeza MTP (multi-token prediction) utilizable para decodificación especulativa. El modelo original de Qwen se ha sometido a un proceso de "abliteration" por parte de orcarouter para eliminar los comportamientos de rechazo, y esta ficha cuantiza esa versión sin reentrenar ni modificar la arquitectura, el tokenizer ni la plantilla de chat.

La cuantización se realizó con llm-compressor 0.15.0 y compressed-tensors 0.20.1. La calibración usó 256 muestras de hasta 4.096 tokens, la mitad procedentes de oyildirim/cyberstrike-sft-120k y la mitad de mlabonne/open-perfectblend; la calibración solo mide rangos de valores, no entrena el modelo. Antes de la subida se verificó que todas las escalas de cuantización fueran finitas y positivas y que cada peso empaquetado no estuviera vacío. Los metadatos de versión, receta y estadísticas de calibración quedan registrados en `quant_info.json`. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, incluyendo modo de razonamiento separado (reasoning split) compatible con el parser `qwen3` de vLLM.
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias a la torre de visión conservada en BF16.
- Tool calling y function calling, con soporte de `--enable-auto-tool-choice` y parser `qwen3_xml` en vLLM; en una prueba de 60 muestras con cuatro herramientas ofrecidas, la primera llamada fue `web_search` en 60/60 casos y no inventó búsquedas previas en 0/60.
- Capacidades de agente y razonamiento multi-paso, con seguimiento de resultados de herramientas verificado.
- Decodificación especulativa mediante la cabeza MTP (`--speculative-config.method mtp --speculative-config.num_speculative_tokens 1`).
- Multilingüe limitado a inglés y chino.
- Recuperación de información en contexto largo: en una prueba con cuatro códigos ocultos en un prompt de 120k tokens, recuperó 4/4.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo, al estar abliterated, permite generar y analizar contenido que los modelos con rechazo filtran, lo que lo hace útil para construir conjuntos de pruebas adversarias y estudiar comportamientos no deseados.
- Investigación sobre alineación y refusal: sirve como contraste frente a la versión original con rechazo para medir el efecto de la abliteración en tareas sensibles.
- Agentes con tool calling en producción: la verificación de 60/60 llamadas correctas a `web_search` y la ausencia de invención de búsquedas previas lo hacen adecuado para pipelines de agentes que necesitan invocar herramientas de forma fiable.
- Procesamiento de documentos largos con imágenes: con 131.072 tokens de contexto y torre de visión, puede analizar informes, capturas o PDFs extensos combinando texto e imagen.
- Asistencia técnica y atención al cliente multi-turno: el contexto largo y el soporte de function calling permiten gestionar conversaciones con historial extenso e integrar consultas a sistemas externos.
- Despliegue en una sola GPU de 32 GB: los pesos ocupan 18,6 GiB con la torre de visión cargada, lo que permite servir el modelo con contexto largo en tarjetas de gama profesional o consumer de 32 GB.
- Generación de código con integración en CI/CD: el soporte de tool calling y el parser `qwen3_xml` facilitan su incorporación en pipelines automatizados de revisión y generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son medidas de serving en vLLM 0.34.0 sobre una NVIDIA B300:

| Metrica | Valor |
|---|---|
| Decodificacion, un solo stream | 206 tok/s |
| Decodificacion con MTP (1 token especulativo) | 296 tok/s |
| Prefill en prompt de 11k tokens | 52.700 tok/s |
| Recuperacion en contexto de 120k tokens | 4/4 codigos ocultos |
| Primera llamada a herramienta correcta | 60/60 |
| Invencion de busqueda previa | 0/60 |
| Peso de los pesos con torre de vision | 18,6 GiB |

## Requisitos de hardware

- VRAM estimada: los pesos en NVFP4 ocupan 18,6 GiB con la torre de visión cargada; el resto del presupuesto de VRAM se destina a caché KV (recomendado `--kv-cache-dtype fp8`).
- GPU recomendadas: NVIDIA B300 (probado), y en general GPUs con al menos 24-32 GB de VRAM para contextos largos.
- Cabe en GPU consumer de 32 GB (por ejemplo, RTX 5090 o similares) para contextos moderados; con 24 GB el margen para contexto largo es limitado.
- Opciones de despliegue: vLLM 0.34.0 es la vía probada; el formato compressed-tensors y los tags indican compatibilidad con el ecosistema vLLM. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 206 tok/s en decodificación de un solo stream y 52.700 tok/s de prefill en prompt de 11k tokens en B300; con MTP se alcanzan 296 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| disillusioned/Qwen3.8-27B-Uncensored-NVFP4 | 27,78B | 131.072 | NVFP4 (atención lineal incluida) | Apache 2.0 | Esta ficha; pesos 18,6 GiB |
| orcarouter/Qwen3.8-27B-Uncensored (NVFP4+FP8) | 27,78B | no disponible | NVFP4 + FP8 (atención lineal en FP8) | Apache 2.0 | Build del autor original; mayor peso por la atención lineal en FP8 |
| orcarouter/Qwen3.8-27B-Uncensored (BF16) | 27,78B | no disponible | BF16 | Apache 2.0 | Modelo base sin cuantizar, para fine-tuning y cuantización |

No se dispone de datos de benchmarks que permitan comparar el rendimiento entre estas variantes.

## Limitaciones y advertencias

- El modelo es "abliterated": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o inseguro sin filtros; no es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La cuantización NVFP4 introduce pérdida de precisión respecto al BF16; no se han publicado comparativas de calidad entre ambas versiones.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo sin rechazo puede incumplir políticas de plataformas o normativas sectoriales; la responsabilidad recae en el desplegador.
- El soporte de serving documentado se limita a vLLM 0.34.0; otras herramientas no están verificadas.
- El contexto máximo probado es de 131.072 tokens; no se garantiza estabilidad más allá de esa longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/disillusioned/Qwen3.8-27B-Uncensored-NVFP4
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Dataset de calibración: https://huggingface.co/datasets/oyildirim/cyberstrike-sft-120k
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- OrcaRouter: https://www.orcarouter.ai
- Tarjeta del modelo Qwen3.8-27B en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
