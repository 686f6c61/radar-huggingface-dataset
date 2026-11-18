# hendrimardani/fine-tuned-model-indonesian-GRPO

## Resumen

fine-tuned-model-indonesian-GRPO es un ajuste fino del modelo Llama-3.1-8B desarrollado por el usuario hendrimardani, orientado a razonamiento legal en indonesio dentro de flujos de generacion aumentada por recuperacion (RAG). El modelo parte de la variante cuantizada en 4 bits de Unsloth (`unsloth/Llama-3.1-8B-unsloth-bnb-4bit`) y se entrena mediante Group Relative Policy Optimization (GRPO) con PEFT/LoRA, tecnicas implementadas a traves de Unsloth y Hugging Face TRL.

Su rasgo distintivo es la produccion de respuestas estructuradas con razonamiento encadenado (Chain-of-Thought) delimitado por las etiquetas `<think>...</think>` y la respuesta final en `<answer>...</answer>`, siempre en indonesio. Esta especializado en el analisis de normativa indonesia (UU, PP y clausulas legales) y el autor declara que evita el colapso de modo (mode collapse) durante el entrenamiento.

Con 8.030.261.248 parametros, una longitud maxima de secuencia de 2048 tokens y licencia Apache 2.0, el modelo es relevante para equipos que necesitan un asistente juridico en indonesio desplegable en hardware modesto gracias a su cuantizacion NF4. No obstante, la informacion publicada es limitada: no hay datos de benchmarks, composicion del dataset de entrenamiento ni detalles del proceso de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B), ajuste fino con PEFT/LoRA y GRPO |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max sequence length declarada) |
| Tipos de cuantizacion | 4-bit NF4 (base y carga recomendada); pesos en safetensors |
| Idiomas soportados | indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Llama-3.1-8B-unsloth-bnb-4bit |
| Metodo de ajuste | GRPO + PEFT/LoRA |
| Tamano del repositorio | 109.6 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama-3.1-8B, con 8.030 millones de parametros. Sobre esa base se aplica un ajuste fino supervisado mediante LoRA (PEFT) seguido de un entrenamiento con GRPO, un algoritmo de optimizacion por politica relativa a grupos que no requiere un modelo critico separado y que se ha popularizado para reforzar el razonamiento en modelos de lenguaje. La implementacion se apoya en Unsloth para el entrenamiento eficiente en memoria y en Hugging Face TRL para el bucle de RL.

El autor no publica el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos legales ni los hiperparametros del proceso GRPO. Tampoco se detalla si hubo una fase previa de SFT con datos legales indonesios o si el GRPO se aplico directamente sobre el modelo base. La innovacion tecnica documentada se limita al formato de salida estructurado con etiquetas `<think>` y `<answer>`, que el autor impone mediante un system prompt y un prefill de la etiqueta de razonamiento, y a la recomendacion de parametros de generacion (temperatura 0.3, repetition_penalty 1.18, max_new_tokens 1024) para evitar degradacion del idioma y bucles infinitos.

## Capacidades

- Generacion de texto conversacional en indonesio con formato estructurado de razonamiento y respuesta.
- Razonamiento encadenado (Chain-of-Thought) delimitado en `<think>...</think>`, con la respuesta final en `<answer>...</answer>`.
- Analisis de normativa indonesia: leyes (UU), reglamentos gubernamentales (PP) y clausulas legales.
- Integracion en pipelines RAG: el modelo consume documentos de contexto inyectados en el prompt y ancla la respuesta a ellos.
- Uso conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Compatibilidad con Hugging Face Transformers, Text Generation Inference y LangChain (`HuggingFacePipeline`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking nativo mas alla del formato de etiquetas.

## Casos de uso

- Asistencia legal en indonesio para trabajadores: el modelo responde consultas sobre derechos laborales (por ejemplo, pago de horas extra) citando el articulo concreto del contexto recuperado, como se muestra en el ejemplo de la model card con el PP No. 35 Tahun 2021.
- RAG juridico sobre corpus normativo: se integra en un pipeline LangChain que recupera articulos de leyes y reglamentos y los inyecta en el prompt; el modelo genera una respuesta anclada al contexto con trazabilidad del razonamiento.
- Revision de clausulas contractuales: dado un fragmento de contrato y la normativa aplicable, el modelo identifica obligaciones y derechos y los contrasta con la regulacion vigente.
- Atencion al ciudadano en ventanillas administrativas: respuestas multi-turno en indonesio con contexto de hasta 2048 tokens, suficiente para incluir varios articulos y el historial reciente de la conversacion.
- Generacion de borradores de resumenes legales: a partir de documentos recuperados, el modelo produce explicaciones paso a paso utiles para personal no jurista.
- Despliegue en hardware de consumo: al cargarse en 4 bits NF4, puede ejecutarse en GPU consumer para prototipos y demos internas de asistentes legales.
- Fine-tuning continuado: al estar publicado con licencia Apache 2.0 y pesos safetensors, sirve como punto de partida para adaptar el formato `<think>/<answer>` a otros dominios regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits NF4: aproximadamente 5-6 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 12 GB para secuencias de hasta 2048 tokens.
- En bfloat16 sin cuantizar: aproximadamente 16 GB solo para pesos, mas cache KV; se recomienda al menos 24 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para mayor throughput y contextos largos; RTX 3090 (24 GB) y RTX 4080 (16 GB) son viables en 4 bits.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas en cuantizacion 4 bits, y en 24 GB en bfloat16.
- Opciones de despliegue: Hugging Face Transformers con `load_in_4bit=True`, Text Generation Inference (tag `text-generation-inference`), y pipelines de LangChain mediante `HuggingFacePipeline`. No se documenta soporte explicito de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fine-tuned-model-indonesian-GRPO | 8.030 M | 2048 | Legal indonesio con CoT y GRPO | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8.030 M | 128.000 | Instrucciones generales multilingues | Llama 3.1 Community License | Hugging Face, amplia adopcion |
| SeaLLM / modelos SEA | no disponible | no disponible | Modelos regionales del sudeste asiatico | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible porque el autor no publica benchmarks. Frente a Llama-3.1-8B-Instruct, este ajuste sacrifica la ventana de contexto nativa de 128.000 tokens (limitada a 2048) y el soporte multilingue amplio a cambio de especializacion en indonesio legal y formato de razonamiento estructurado. No se dispone de datos sobre modelos comparables especificos de legal AI en indonesio en la informacion proporcionada.

## Limitaciones y advertencias

- No constituye asesoramiento legal: el propio autor advierte que las salidas deben verificarse contra fuentes oficiales indonesias.
- Riesgo de alucinacion: puede citar articulos o reglamentos inexistentes o desactualizados, especialmente si el contexto recuperado es incompleto.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos legales extensos o historiales largos.
- Especializado en indonesio: el rendimiento en otros idiomas, incluido el castellano, no esta documentado y probablemente sea deficiente.
- Parametros de generacion sensibles: el autor advierte que valores bajos de `no_repeat_ngram_size` provocan corrupcion de tokens, y que sin temperatura baja y penalizacion de repeticion aparecen bucles y errores tipograficos.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni si se aplicaron filtros de sesgo; el corpus legal indonesio puede arrastrar sesgos normativos e historicos.
- Ausencia de benchmarks y de detalles de entrenamiento: dificulta evaluar la calidad frente a alternativas y reproducir el proceso.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Llama-3.1 impone condiciones adicionales de la Llama 3.1 Community License que deben respetarse.
- Tamano del repositorio de 109.6 GB, muy superior al de los pesos del modelo, lo que sugiere la presencia de checkpoints intermedios o artefactos de entrenamiento; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hendrimardani/fine-tuned-model-indonesian-GRPO
- Perfil del autor: https://huggingface.co/hendrimardani
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
- LangChain HuggingFacePipeline: https://python.langchain.com/docs/integrations/llms/huggingface_pipeline/
