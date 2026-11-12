# inception42/Jais-3-0.9B

## Resumen

Jais-3-0.9B es un modelo de lenguaje decoder-only de tipo denso desarrollado por Inception42 (bajo la colección IFM/Jais-3). Con 1.078.285.824 parámetros reales según sus pesos en safetensors, se posiciona como el miembro compacto de la familia Jais-3, disenado para generación de texto, razonamiento y conversación en árabe e inglés. Su rasgo más destacable es una ventana de contexto de 128K tokens en un modelo de menos de 1.100 millones de parámetros, lo que lo hace poco habitual en su rango de tamano.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está integrado en el ecosistema transformers con código personalizado (tag `custom_code` y arquitectura `k2_horizon`). La disponibilidad de variantes GGUF, MLX en 4 y 8 bits, y bf16 facilita su despliegue tanto en servidores como en hardware de consumo y Apple Silicon.

Su relevancia actual radica en ofrecer una alternativa ligera y de contexto largo para aplicaciones en árabe, un idioma tradicionalmente infrarrepresentado en modelos abiertos, combinando un tamano que cabe en GPUs de consumo con una ventana de contexto que compite con modelos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only, transformer (arquitectura interna `k2_horizon`, requiere `custom_code`) |
| Parametros totales | 1.078.285.824 (aprox. 0,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF (llama.cpp/Ollama), MLX 4-bit, MLX 8-bit, MLX bf16; pesos originales en safetensors (bf16 presumiblemente) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF y MLX en repositorios derivados |

## Arquitectura y entrenamiento

Jais-3-0.9B es un transformer decoder-only denso de aproximadamente 0,9B parámetros. La model card etiqueta la arquitectura como `k2_horizon` y requiere `custom_code` en transformers, lo que indica una implementación de atención o bloques no estándar respecto a la arquitectura Llama convencional. La ventana de contexto alcanza los 128K tokens, un valor muy superior al habitual en modelos de este tamano.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento. Las etiquetas del modelo incluyen `reasoning` y `conversational`, lo que sugiere un ajuste orientado a instrucciones y razonamiento, pero no se documentan los procedimientos concretos. Tampoco se detallan innovaciones técnicas específicas más allá de la arquitectura propietaria `k2_horizon`.

## Capacidades

- Generación de texto en árabe e inglés con ventana de contexto de 128K tokens.
- Razonamiento y conversación multi-turno (etiquetas `reasoning` y `conversational`).
- Generación de código y tareas de instrucción general (implícito en el pipeline de text-generation).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 128K tokens, manteniendo el hilo de interacciones extensas sin truncar el historial.
- Procesamiento de documentos largos en árabe: resumen y extracción de información de contratos, informes o artículos extensos que superan la ventana típica de modelos de su tamano.
- Despliegue en hardware de consumo: al caber en GPUs de gama media y en Apple Silicon mediante las variantes MLX y GGUF, es adecuado para prototipos locales y aplicaciones de escritorio.
- Generación de código asistida en inglés: integrable en editores o pipelines de CI/CD mediante transformers, con licencia Apache 2.0 que permite uso comercial.
- Traducción y adaptación de contenido entre árabe e inglés: su naturaleza bilingüe lo hace útil para localización de documentación técnica y contenido web.
- Sistemas de retrieval-augmented generation (RAG): la ventana de 128K permite inyectar grandes bloques de contexto recuperado sin recurrir a técnicas de compresión agresivas.
- Chatbots educativos o de soporte en entornos con recursos limitados: el bajo número de parámetros reduce costes de inferencia frente a modelos de 7B o superiores.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks que compara Jais-3-0.9B con Qwen3.5-2B, Falcon-H1-1.5B-Deep-Instruct, Hala 1.2B y tiny-aya-global, con secciones como "Open-ended Generation". Sin embargo, los valores numéricos concretos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada). No se presentan cifras verificables de MMLU, HumanEval, GSM8K ni de otras tareas en el material disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16/fp16 (1,08B parámetros × 2 bytes); en cuantización 8-bit alrededor de 1,1 GB; en 4-bit alrededor de 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM; también en Apple Silicon mediante las variantes MLX.
- Opciones de despliegue: transformers (requiere `custom_code`), llama.cpp y Ollama mediante GGUF, MLX para Apple Silicon; soporte de vLLM o TGI no confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-0.9B | 0,9B | 128K | Dense (`k2_horizon`) | Apache 2.0 | HF (safetensors, GGUF, MLX) |
| Qwen3.5-2B | 2B | no disponible | Dense | no disponible | no disponible |
| Falcon-H1-1.5B-Deep-Instruct | 1,5B | no disponible | Dense | no disponible | no disponible |
| Hala 1.2B | 1,2B | no disponible | Dense | no disponible | no disponible |
| tiny-aya-global | 3B | no disponible | Dense | no disponible | no disponible |

Los modelos de referencia aparecen en la tabla de benchmarks del autor, pero no se dispone de sus especificaciones completas ni de los resultados numéricos de la comparación en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al estar entrenado principalmente en árabe e inglés, puede presentar sesgos culturales y lingüísticos propios de esos corpus.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamano; la ventana de 128K no elimina el riesgo de generar información incorrecta, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: solo se declaran árabe e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- Caveat de producción: requiere `trust_remote_code=True` en transformers por el `custom_code` de la arquitectura `k2_horizon`, lo que implica ejecutar código del autor y revisar su procedencia antes de desplegar.
- El tamano de 0,9B limita la calidad en tareas de razonamiento profundo y matemáticas complejas frente a modelos de mayor escala.
- No se documentan procedimientos de alineamiento ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inception42/Jais-3-0.9B
- Colección Jais-3 (IFM): https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- GGUF para llama.cpp y Ollama: https://huggingface.co/IFM/Jais-3-0.9B-GGUF
- MLX 4-bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-4bit
- MLX 8-bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-8bit
- MLX bf16: https://huggingface.co/IFM/Jais-3-0.9B-MLX-bf16
- Paper de referencia (arXiv 2611.10224): https://arxiv.org/abs/2611.10224
