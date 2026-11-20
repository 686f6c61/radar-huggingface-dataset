# md-nishat-008/TigerLLM-9B-it

## Resumen

TigerLLM-12B-it es un modelo de lenguaje instructivo especializado en bengalí (bangla), desarrollado por Md Nishat Raihan y Marcos Zampieri (George Mason University) y publicado bajo el paraguas de la familia TigerLLM presentada en ACL 2025. Se construye mediante fine-tuning con LoRA del modelo multimodal Gemma 3 de 12B sobre el dataset Bangla-Instruct, con los pesos LoRA fusionados en el checkpoint final, de modo que no requiere PEFT ni un modelo base separado. El identificador original `TigerLLM-9B-it` está deprecado y redirige a esta versión de 12B, que según el autor supera al modelo de 9B en un 5-10% en los benchmarks de bengalí.

El modelo resuelve el problema de la baja competencia en bengalí de los LLM generalistas: frente a LLaMA 3.2 (11B), Gemma 2 (27B) o Pangea (7B), que obtienen puntuaciones muy bajas en pruebas nativas en bangla, TigerLLM-12B-it se sitúa en el rango de GPT-4o-mini y Gemini 1.5 Flash en tareas como MMLU-bn, BanglaQuaD o BEnQA. Es relevante ahora porque ofrece una alternativa abierta (CC BY 4.0) y de tamaño medio (12.2B parámetros) para aplicaciones en bengalí sin depender de APIs propietarias.

La arquitectura es `Gemma3ForConditionalGeneration` con 12.187.325.040 parámetros en BF16, distribuidos en cinco shards de safetensors (~22,7 GiB). Solo se ha ajustado el decodificador de texto; el codificador visual proviene sin cambios de Gemma 3 y no fue entrenado ni evaluado con datos en bengalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma3ForConditionalGeneration` (transformer multimodal, decoder-only) |
| Parametros totales | 12.187.325.040 (12,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; 4-bit NF4 con bitsandbytes (doble cuantizacion, compute en BF16) |
| Idiomas soportados | Bengalí (principal), inglés |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (5 shards, ~22,7 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 (12B), un transformer decoder-only multimodal con capacidad de entrada image-text-to-text. El ajuste se realizó con LoRA sobre el dataset Bangla-Instruct y los pesos adaptadores se fusionaron en el checkpoint final. Solo se entrenó el decodificador de texto: el codificador de visión se mantiene intacto respecto a Gemma 3 y no se validó con datos en bengalí, por lo que las capacidades visuales en este idioma no están garantizadas.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset Bangla-Instruct ni si se aplicaron etapas de RLHF o DPO. La model card indica que el modelo se identifica como TigerLLM y conoce su autoría, lo que sugiere una curación específica de ejemplos de identidad en los datos de instrucción. La familia TigerLLM se documenta en un paper de ACL 2025 (short paper), que es la referencia técnica principal para detalles de entrenamiento y evaluación.

## Capacidades

- Generación de texto instructivo en bengalí con calidad comparable a modelos propietarios de gama media según los benchmarks del autor.
- Comprensión y generación en inglés como idioma secundario.
- Razonamiento y respuesta a preguntas en bengalí (MMLU-bn, BEnQA, BanglaRQA).
- Generación de código en contexto bengalí (evaluado con mHumanEval-bn).
- Procesamiento de imagen y texto (hereda el codificador visual de Gemma 3, sin ajuste ni validación en bengalí).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`), alternando turnos `user`/`assistant`.
- No se documenta soporte explícito de tool calling, function calling ni modos de agente multi-paso en la información disponible.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Atención al cliente en bengalí: el modelo puede gestionar conversaciones multi-turno con la plantilla de chat y responder con formato controlado (por ejemplo, tres párrafos breves), adecuado para soporte en centros de contacto de Bangladés y diáspora.
- Educación: generación de explicaciones adaptadas a nivel (por ejemplo, "explica la fotosíntesis para estudiantes de 8º grado en bengalí"), un escenario que la propia model card propone como ejemplo de prompting.
- Traducción y localización bn-en: redacción y adaptación de contenido para productos que necesitan versión en bengalí manteniendo terminología técnica en inglés.
- Generación de código asistida para desarrolladores bengalíes: el modelo se evalúa en mHumanEval-bn, por lo que puede emplearse en asistentes de programación con instrucciones en bengalí.
- Respuesta a preguntas sobre documentos: con BanglaQuaD y BanglaRQA como benchmarks de referencia, encaja en pipelines de QA extractivo y generativo sobre corpus en bengalí.
- Investigación en NLP de bajo recursos: como baseline abierto y reproducible (CC BY 4.0) para experimentos de fine-tuning, evaluación o destilación en bengalí.
- Moderación y clasificación de contenido en bengalí: clasificación de textos y generación de resúmenes o etiquetas en un idioma con poca cobertura en modelos generalistas.

## Benchmarks y rendimiento

Resultados de la Tabla 2 del paper TigerLLM (ACL 2025) en seis benchmarks de bengalí. Las filas de TigerLLM-12B-it y TigerLLM-1B-it se expresan como mejora relativa según la model card, no como valores absolutos.

| Modelo | MMLU-bn | PangBench-bn | BanglaQuaD | mHumanEval-bn | BEnQA | BanglaRQA |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| GPT-3.5 | 0,55 | 0,55 | 0,50 | 0,56 | 0,50 | 0,49 |
| Gemini 1.5 Flash | 0,66 | 0,57 | 0,62 | 0,58 | 0,56 | 0,61 |
| GPT-4o-mini | 0,67 | 0,62 | 0,65 | 0,56 | 0,60 | 0,60 |
| LLaMA 3.2 (11B) | 0,22 | 0,19 | 0,21 | 0,15 | 0,18 | 0,20 |
| Gemma 2 (27B) | 0,35 | 0,51 | 0,43 | 0,64 | 0,50 | 0,56 |
| Pangea (7B) | 0,18 | 0,15 | 0,17 | 0,10 | 0,14 | 0,16 |
| Titu-LLM | 0,06 | 0,19 | 0,08 | 0,02 | 0,17 | 0,21 |
| Bong-LLaMA | 0,05 | 0,12 | 0,08 | 0,02 | 0,15 | 0,13 |
| Bangla-LLaMA | 0,02 | 0,08 | 0,05 | 0,10 | 0,11 | 0,09 |
| Bangla-Gemma | 0,18 | 0,15 | 0,12 | 0,10 | 0,22 | 0,19 |
| TigerLLM 1B, LLaMA 3.2 (deprecado) | 0,61 | 0,55 | 0,68 | 0,61 | 0,59 | 0,62 |
| TigerLLM-1B-it, Gemma 3 | +2-4% | +2-4% | +2-4% | +2-4% | +2-4% | +2-4% |
| TigerLLM-9B-it (deprecado) | 0,72 | 0,68 | 0,70 | 0,63 | 0,65 | 0,68 |
| TigerLLM-12B-it | +5-10% | +5-10% | +5-10% | +5-10% | +5-10% | +5-10% |

No se han publicado valores absolutos de TigerLLM-12B-it en la información disponible; solo la mejora relativa del 5-10% frente a TigerLLM-9B-it.

## Requisitos de hardware

- Inferencia en BF16: se recomienda una GPU con soporte BF16 y 24-30 GiB de memoria (por ejemplo, RTX 4090 de 24 GB, A100 40 GB, H100 80 GB). El checkpoint completo pesa ~22,7 GiB en cinco shards.
- Inferencia en 4-bit NF4 con bitsandbytes: reduce el uso de memoria y permite ejecución en GPUs consumer de 16 GB, a costa de posibles cambios menores en la calidad de salida.
- Despliegue: el modelo se usa con `transformers>=4.57.1`, `torch>=2.4`, `accelerate>=1.10`, `sentencepiece` y `safetensors`; se recomienda `attn_implementation="sdpa"` y `device_map="auto"`. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.
- No se publican requisitos de VRAM para contextos largos ni para el modo multimodal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TigerLLM-12B-it | 12,2B | no disponible | Bengalí, inglés | CC BY 4.0 | Hugging Face |
| TigerLLM-1B-it (Gemma 3) | ~1B | no disponible | Bengalí, inglés | CC BY 4.0 (según familia) | Hugging Face |
| Gemma 2 (27B) | 27B | no disponible | Multilingüe general | Gemma license | Hugging Face |
| LLaMA 3.2 (11B) | 11B | no disponible | Multilingüe general | Llama license | Hugging Face |
| Pangea (7B) | 7B | no disponible | Bengalí/inglés | no disponible | Hugging Face |

En los benchmarks de bengalí del paper, TigerLLM-12B-it supera a LLaMA 3.2 (11B), Gemma 2 (27B) y Pangea (7B) de forma amplia, y se aproxima al rango de GPT-4o-mini y Gemini 1.5 Flash. Frente a TigerLLM-1B-it, la versión de 12B ofrece mayor calidad a costa de un requisito de memoria notablemente superior.

## Limitaciones y advertencias

- El identificador `TigerLLM-9B-it` está deprecado; el código debe actualizarse a `md-nishat-008/TigerLLM-12B-it`.
- Solo se ajustó el decodificador de texto: las capacidades de visión provienen de Gemma 3 sin entrenamiento ni validación en bengalí, por lo que su uso multimodal en este idioma es arriesgado.
- La decodificación greedy (`do_sample=False`) puede producir repeticiones en respuestas largas; se recomienda `temperature=0.7`, `top_p=0.95` o mayor `repetition_penalty`.
- Los benchmarks publicados son del paper y de la model card del autor; no hay evaluación independiente disponible en la información proporcionada.
- No se documentan sesgos específicos, tasas de alucinación ni evaluaciones de seguridad; deben asumirse los riesgos habituales de un modelo de 12B ajustado con instrucciones.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero debe verificarse la compatibilidad con la licencia subyacente de Gemma 3.
- No se documenta longitud de contexto ni soporte de tool calling; para agentes o pipelines con funciones externas habría que validarlo empíricamente.
- El modelo está orientado a bengalí e inglés; el rendimiento en otros idiomas no está evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/md-nishat-008/TigerLLM-12B-it
- Paper TigerLLM (ACL 2025): https://aclanthology.org/2025.acl-short.69/
- Dataset Bangla-Instruct: https://huggingface.co/datasets/md-nishat-008/Bangla-Instruct
- Dataset Bangla-TextBook: https://huggingface.co/datasets/md-nishat-008/Bangla-TextBook
- TigerLLM-1B-it: https://huggingface.co/md-nishat-008/TigerLLM-1B-it
- TigerCoder-12B: https://huggingface.co/md-nishat-008/TigerCoder-12B
