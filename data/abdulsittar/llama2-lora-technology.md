# AbdulSittar/llama2-lora-technology

## Resumen

llama2-lora-technology es un adaptador LoRA (PEFT) sobre meta-llama/Llama-2-7b-chat-hf, desarrollado por Abdul Sittar, orientado a la generación de texto conversacional con estilo de Reddit en el dominio de tecnología. No es un modelo completo: el modelo base permanece congelado y solo se publican los pesos del adaptador, que se cargan junto al checkpoint original de Meta. Su función es actuar como generador de contenido de agentes dentro de un framework de simulación multiagente de ecosistemas de redes sociales.

El adaptador está entrenado sobre la porción de tecnología del dataset Social Graph Inference Reddit, que abarca 33 agentes centrados en temática tecnológica y más de un millón de publicaciones y comentarios. El objetivo declarado es la reproducibilidad de los experimentos del artículo de Sittar et al. publicado en IEEE Access (volumen 14, 2026), donde este generador se combina con un planificador basado en Temporal Fusion Transformer, recuperación aumentada sobre publicaciones históricas, perfiles de persona y mecanismos de ranking cronológico, por engagement e híbrido.

Es relevante ahora por su carácter de pieza reutilizable en investigación sobre simulación social con LLM: permite replicar el componente generativo de un pipeline concreto sin necesidad de reentrenar, aunque su alcance es muy específico (inglés, dominio tecnología, estilo Reddit) y su adopción es marginal (1 descarga y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal decoder-only (Llama-2-7b-chat-hf) |
| Parametros totales | 7 000 millones en el modelo base; el adaptador LoRA no declara recuento propio (rank, alpha y módulos objetivo en `adapter_config.json`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama-2-7b-chat-hf) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 2 Community License (heredada del modelo base; requiere aceptar la licencia de Meta) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `adapter_config.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento

El adaptador se aplica mediante PEFT sobre un transformer causal decoder-only de 7 000 millones de parámetros (Llama-2-7b-chat-hf), con el modelo base congelado y únicamente los pesos LoRA entrenados. La configuración concreta de LoRA (rank, alpha y módulos objetivo) está en `adapter_config.json`, pero no se detalla en la model card. El repositorio incluye además un `chat_template.jinja` para la plantilla de inferencia y los ficheros de tokenizer.

Los datos de entrenamiento provienen de la porción de tecnología del dataset Social Graph Inference Reddit: 33 agentes de temática tecnológica y más de un millón de publicaciones y comentarios, con relaciones interagente derivadas de actividad real en Reddit y redes de interacción dirigidas y ponderadas. La model card deja como marcadores sin rellenar los hiperparámetros, el hardware y la precisión (`<learning rate, epochs, batch size, GPU, fp16/bf16>`), por lo que no se dispone de esos datos. No se menciona RLHF ni DPO específicos para el adaptador; el ajuste es supervisado sobre texto de Reddit.

## Capacidades

- Generación de texto conversacional en inglés con estilo de Reddit en el dominio de tecnología.
- Generación de publicaciones y comentarios sintéticos para agentes en simulaciones de redes sociales.
- Integración en pipelines multiagente junto a planificadores, recuperación aumentada y perfiles de persona.
- Soporte de conversación multi-turno a través de la plantilla de chat incluida (`chat_template.jinja`).
- Compatible con el ecosistema PEFT/Transformers para carga y fusión del adaptador.
- No se documenta soporte de tool calling, function calling, agentes autónomos con planificación propia, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos académicos: cargar el adaptador sobre Llama-2-7b-chat-hf para replicar el componente generativo del framework descrito en Sittar et al. (IEEE Access, 2026) y validar los resultados publicados.
- Simulación de ecosistemas de redes sociales: generar publicaciones y comentarios de agentes sintéticos en el dominio tecnológico para estudiar dinámicas de interacción y mecanismos de ranking (cronológico, por engagement e híbrido).
- Investigación sobre desinformación y moderación: producir corpus sintéticos controlados de temática tecnológica para entrenar o evaluar clasificadores de contenido, siempre con divulgación explícita de que el texto es generado.
- Estudio de homofilia y formación de comunidades: emplear los agentes generados para analizar cómo se agrupan estilísticamente en redes simuladas, un fenómeno que el propio artículo reporta como estilístico más que temático.
- Generación de datos sintéticos para aumento de datasets: crear ejemplos adicionales de conversación tecnológica estilo foro para tareas de clasificación o análisis de sentimiento, con revisión humana posterior.
- Prototipado de sistemas de simulación social: usar el adaptador como bloque de generación de bajo coste (solo pesos LoRA) dentro de arquitecturas de simulación más amplias que combinen scheduler y recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el adaptador se evaluó como parte del framework completo frente a datos reales de Reddit (Technology, Climate Change, COVID-19) en tres escalas (de 100 a 1 000 eventos), con resultados en el artículo, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K u otras) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Llama-2-7b-chat-hf. En fp16 se requieren aproximadamente 14 GB solo para pesos, más overhead de activaciones y caché KV; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16; GPUs con 16 GB pueden ser suficientes con cuantización del modelo base.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 y en GPUs de 8-16 GB si se cuantiza el modelo base (por ejemplo, 4-bit u 8-bit mediante bitsandbytes).
- Opciones de despliegue: Transformers + PEFT (flujo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama fusionando previamente el adaptador en el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama2-lora-technology | 7 000 M (base) + adaptador LoRA | no disponible | Adaptador LoRA sobre Llama-2-7b-chat | Llama 2 Community License | Hugging Face (repo público, requiere aceptar licencia del base) |
| meta-llama/Llama-2-7b-chat-hf | 7 000 M | 4 096 tokens (modelo base) | Modelo completo | Llama 2 Community License | Hugging Face (gated) |
| Adaptadores LoRA de dominio sobre Llama-2 | 7 000 M (base) + adaptador | depende del base | Adaptador LoRA | heredada del base | Hugging Face |
| Mistral-7B-Instruct | 7 000 M | 32 000 tokens | Modelo completo | Apache 2.0 | Hugging Face |

La comparación con Mistral-7B-Instruct se incluye por categoría (modelo de 7 000 M para generación instruct), pero no se dispone de datos de rendimiento comparables del adaptador en benchmarks estándar.

## Limitaciones y advertencias

- Hereda los sesgos y limitaciones de Llama-2-7b-chat y de los datos de Reddit utilizados en el entrenamiento.
- El artículo reporta que la coherencia semántica se debilita en hilos largos y que la homofilia entre agentes generados es estilística, no temática.
- El modelo no está evaluado para exactitud factual y no debe usarse como fuente de hechos técnicos.
- Uso fuera de alcance prohibido por el autor: suplantación de usuarios reales, producción de desinformación o spam, y cualquier uso en el que el texto generado pueda confundirse con publicaciones humanas sin divulgación.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Requiere aceptar la licencia Llama 2 de Meta en la página del modelo base y autenticarse con `hf auth login`; el uso comercial está sujeto a los términos de dicha licencia.
- El repositorio es de tamaño 0.0 GB (solo pesos del adaptador), por lo que no es autónomo: sin el modelo base no funciona.
- Adopción muy baja (1 descarga, 0 likes en el momento de la consulta), sin validación externa más allá del artículo de los autores.
- No se documentan hiperparámetros de entrenamiento, hardware ni precisión, lo que dificulta la reproducibilidad exacta del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbdulSittar/llama2-lora-technology
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Dataset: https://huggingface.co/datasets/AbdulSittar/Social_Graph_Inference_Reddit
- Dataset en Zenodo: https://zenodo.org/records/18082502
- Artículo (DOI): https://doi.org/10.1109/ACCESS.2026.3752164
- Proyecto TWON (financiación): proyecto número 101095095, Comisión Europea
