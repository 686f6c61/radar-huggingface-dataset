# cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK5b-K5a-nsoup2-r128-nothink-v2

## Resumen

yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK5b-K5a-nsoup2-r128-nothink-v2 es un modelo de lenguaje de 7.241.740.288 parámetros (aproximadamente 7,24 mil millones) especializado en instrucciones en coreano, desarrollado por el usuario cooler8. Se trata de un ajuste fino mediante LoRA sobre el modelo base cooler8/yejin-korean-8b-v3-base, que a su vez había pasado por 20.000 pasos de preentrenamiento continuado (Stage-2 continual pre-training) sobre texto en coreano. El modelo deriva de la familia Qwen3, según indican las etiquetas del repositorio, y está orientado a generación de texto conversacional en coreano.

El modelo resuelve el problema de disponer de un asistente conversacional afinado específicamente para coreano con capacidades de razonamiento narrativo multietapa, conocimiento cultural y razonamiento causal de sentido común. Su relevancia radica en el proceso de destilación de racionales a partir de Qwen/Qwen3.6-27B bajo verificación estricta de la respuesta correcta, lo que permite incorporar trazas de razonamiento de un modelo mayor en un modelo de 7B. La licencia Apache 2.0 facilita su uso comercial y su integración en productos.

El nombre del modelo codifica el pipeline de entrenamiento: preentrenamiento continuado (cpt2) con 20.000 pasos (s20000), destilación desde Qwen3.6-27B, mezcla de instrucciones K5b y K5a, nsoup2 (probablemente un parámetro de mezcla o sopa de modelos), LoRA con r=128 y una variante sin modo thinking (nothink). La longitud de contexto no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según etiquetas del repositorio) |
| Parámetros totales | 7.241.740.288 (≈7,24 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 (transformer decoder-only), según la etiqueta `qwen3` del repositorio. El proceso de entrenamiento se estructuró en varias fases: primero, un preentrenamiento continuado de Stage-2 sobre texto en coreano durante 20.000 pasos a partir de cooler8/yejin-korean-8b-v3-base; después, un ajuste fino supervisado mediante LoRA con rango r=128 y alpha=256 sobre una mezcla de instrucciones denominada Stage-K5.

La mezcla de instrucciones Stage-K5 cubre licencias profesionales coreanas, conocimiento cultural, razonamiento narrativo multietapa y razonamiento causal de sentido común complejo (Com2). El conjunto fue decontaminado mediante n-gramas de 13 tokens, con cero solapamiento de 13-gramas respecto a los 13 benchmarks de evaluación empleados. Los racionales a nivel de secuencia se generaron con Qwen/Qwen3.6-27B (Apache-2.0) bajo verificación estricta de la respuesta correcta (gold-answer verification), lo que constituye un proceso de destilación de razonamiento. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en coreano con plantilla de chat específica (`<|user|>` / `<|assistant|>` / `<|end|>`).
- Razonamiento narrativo multietapa y razonamiento causal de sentido común complejo, entrenado explícitamente sobre la mezcla Com2.
- Conocimiento de licencias profesionales coreanas y conocimiento cultural de Corea.
- Seguimiento de instrucciones (instruction-following) en coreano.
- Modo sin thinking: la plantilla de chat incluye un bloque `<think> </think>` vacío, de modo que el modelo responde directamente sin trazas de razonamiento visibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma; no se documenta soporte de otros idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia conversacional en coreano: el modelo puede gestionar diálogos multi-turno en coreano gracias a su ajuste específico sobre instrucciones conversacionales, adecuado para chatbots de atención al usuario en mercados coreanos.
- Preparación de exámenes de licencias profesionales coreanas: su entrenamiento sobre la mezcla Stage-K5 de licencias profesionales permite generar explicaciones y respuestas razonadas sobre temarios de certificaciones coreanas.
- Tutoría cultural: el conocimiento cultural coreano incorporado lo hace útil para aplicaciones educativas o de divulgación sobre historia, tradiciones y contexto social de Corea.
- Razonamiento causal y resolución de problemas narrativos: la mezcla Com2 lo orienta a tareas que requieren encadenar causas y consecuencias en textos narrativos, útil en análisis de relatos o generación de explicaciones paso a paso.
- Generación de contenido editorial en coreano: redacción de artículos, resúmenes y material divulgativo en coreano con un tono conversacional y coherente.
- Prototipado de asistentes verticales: al ser un modelo de 7B con licencia Apache 2.0, sirve como base para ajustes adicionales (por ejemplo, dominio legal o sanitario coreano) en entornos con recursos de GPU moderados.
- Investigación en destilación de razonamiento: el modelo documenta un pipeline de destilación desde Qwen3.6-27B con verificación de respuestas, útil como referencia metodológica para estudiar la transferencia de capacidades de razonamiento a modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona 13 benchmarks de evaluación empleados para la decontaminación por 13-gramas, pero no reporta las puntuaciones obtenidas en ninguno de ellos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14,5 GB solo para los pesos (7,24 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16-18 GB.
- Cuantización a 8 bits: aproximadamente 7,3 GB de pesos; a 4 bits: aproximadamente 3,6-4 GB de pesos, aunque no se documentan formatos GGUF ni cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16 sin cuantizar; RTX 3090 (24 GB) también es viable.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bfloat16; en GPUs de 8-12 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers (ejemplo oficial de la model card con `AutoModelForCausalLM` y `device_map="auto"`); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yejin-korean-8b-v3 (este modelo) | 7,24 B | No disponible | Coreano | Apache 2.0 | Hugging Face |
| Qwen3-8B | ≈8 B | No disponible en esta ficha | Multilingüe | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-27B (modelo profesor) | 27 B (aproximado) | No disponible en esta ficha | Multilingüe | Apache 2.0 | Hugging Face |
| cooler8/yejin-korean-8b-v3-base (modelo base) | ≈7-8 B | No disponible | Coreano | No disponible | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible, ya que no se publican benchmarks del modelo. Frente a Qwen3-8B, la diferencia principal es la especialización en coreano y el pipeline de destilación de razonamiento; frente a su modelo profesor Qwen3.6-27B, ofrece un tamaño mucho menor a costa de una capacidad presumiblemente inferior, aunque no cuantificada.

## Limitaciones y advertencias

- Especialización monolingüe: el modelo está etiquetado únicamente para coreano; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en dominios especializados como licencias profesionales.
- Sesgos: no se documentan análisis de sesgo; el entrenamiento sobre conocimiento cultural coreano puede incorporar sesgos culturales específicos.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Sin datos de benchmarks: la ausencia de resultados publicados impide verificar empíricamente sus capacidades frente a alternativas.
- Formato de chat estricto: requiere aplicar la plantilla `<|user|>...<|end|><|assistant|>...`; un uso incorrecto de la plantilla degradará las respuestas.
- Modo sin thinking: la variante nothink incluye un bloque `<think> </think>` vacío, por lo que no genera cadenas de razonamiento explícitas; para tareas que se beneficien de razonamiento visible habría que considerar otras variantes.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base y del modelo profesor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK5b-K5a-nsoup2-r128-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Modelo profesor (Qwen3.6-27B): https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de Qwen3: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
