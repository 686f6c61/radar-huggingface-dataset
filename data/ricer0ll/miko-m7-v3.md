# ricer0ll/Miko-M7-V3

## Resumen

Miko-M7-V3 es un ajuste fino (fine-tuning) del modelo base Mistral-7B-v0.1, publicado por el usuario ricer0ll en Hugging Face. Se trata de la tercera iteración de la serie Miko, orientada a generación de texto conversacional con un estilo de rol y chat informal. El modelo no introduce cambios arquitectónicos sobre Mistral-7B: es un transformer decoder-only denso de 7.241.732.096 parámetros entrenado mediante QLoRA sobre el modelo base.

El problema que aborda es el de la personalización conversacional: el autor busca un modelo con un tono y formato de diálogo concretos, entrenado con un dataset ligero (Stheno v1.1 filtrado más registros de chat de Discord anonimizados). Es relevante para quienes quieran reproducir un pipeline de fine-tuning de bajo coste sobre Mistral-7B, ya que el autor publica la configuración completa de Axolotl y reporta un entrenamiento de 12 horas en una única RTX 3090.

La información disponible es limitada: no hay datos de benchmarks, licencia declarada ni lista de idiomas soportados. El modelo está etiquetado como `not-for-all-audiences`, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (MistralForCausalLM) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud de secuencia usada en entrenamiento; el modelo base Mistral-7B-v0.1 soporta ventana deslizante de 4096 tokens en inferencia estándar) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bf16/fp16 es convertible a GGUF, GPTQ o AWQ con herramientas estándar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-7B-v0.1 |
| Dataset de entrenamiento | anthracite-org/stheno-filtered-v1.1 (26.765 filas) + logs de Discord anonimizados (2.576 filas) |
| Tamano del repositorio | 14,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.1 sin modificaciones: un transformer decoder-only denso con 7.241.732.096 parámetros, atención con ventana deslizante y tokenizador SentencePiece. El ajuste se realizó con QLoRA (cuantización 4-bit del modelo base, adaptadores LoRA de rango 32 y alpha 32) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La configuración de Axolotl usa `micro_batch_size: 1`, acumulación de gradiente de 8 pasos, una época, learning rate 2e-4 con scheduler coseno, optimizador `adamw_bnb_8bit`, bf16, tf32, gradient checkpointing y FlashAttention 2.

El dataset es deliberadamente reducido: 26.765 filas del dataset Stheno v1.1 filtrado más 2.576 filas de logs de chat de Discord anonimizados, todas convertidas al formato OpenAI de mensajes y procesadas con `chat_template` y `train_on_eot: turn`. La longitud de secuencia de entrenamiento es de 8192 tokens con `sample_packing` activado. El entrenamiento completo se ejecutó en 12 horas sobre una RTX 3090 con underclock y temperatura estable de 60 °C. El autor indica que, pese a entrenar con menos datos que la versión V2 (que rondaba las 35.000 filas), el resultado es algo mejor, atribuyéndolo a una mayor limpieza de los datos. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con formato Alpaca (`### Instruction:` / `### Response:`).
- Soporte de prompting estilo chat log (formato tipo KoboldCPP Chat Mode), con turnos `User:` / `KoboldGPT:`.
- Soporte de system prompt inyectado al inicio de la conversación mediante la plantilla Jinja definida en el entrenamiento.
- Generación de texto instructivo genérico heredado del modelo base Mistral-7B.
- Capacidades de razonamiento, código y matemáticas no evaluadas ni documentadas en la información disponible.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües no documentadas; el modelo base Mistral-7B-v0.1 tiene cobertura multilingüe parcial, pero el fine-tuning se realizó sobre datos mayoritariamente en inglés.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo está entrenado para mantener un rol y un tono concretos en diálogos multi-turno, lo que permite desplegarlo como backend de un chatbot de rol o de un asistente con personalidad fija usando la plantilla Alpaca o el formato de chat log.
- Reproducción de pipelines de fine-tuning de bajo coste: la configuración completa de Axolotl publicada en la model card sirve como referencia para entrenar adaptadores QLoRA sobre Mistral-7B en una única GPU de 24 GB, útil en docencia e investigación de ajuste eficiente.
- Generación de diálogo sintético: puede emplearse para producir conversaciones de estilo informal que alimenten otros datasets de entrenamiento o sistemas de evaluación de chatbots.
- Experimentación con formatos de prompt: al soportar tanto el formato instruct como el formato chat log, es útil para comparar el comportamiento de un mismo modelo bajo distintas convenciones de prompting.
- Base para nuevos fine-tunings: al ser un safetensors estándar de Mistral-7B, puede cargarse con Hugging Face Transformers, vLLM o llama.cpp (tras conversión a GGUF) y servir como punto de partida para ajustes posteriores.
- Investigación sobre limpieza de datos: el autor documenta que reducir el dataset y filtrarlo mejoró los resultados frente a V2, lo que lo convierte en un caso de estudio sobre calidad frente a cantidad en fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB.
- VRAM estimada en cuantización 4-bit (GPTQ/AWQ/GGUF Q4): alrededor de 4-5 GB, con margen para contexto adicional.
- GPU recomendadas: A100 40/80 GB, H100 para serving de alta concurrencia; RTX 4090 (24 GB) para bf16 en single-GPU; RTX 3090 (24 GB) validada por el autor para el entrenamiento QLoRA.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 a bf16 y en GPUs de 8-12 GB con cuantización GGUF Q4.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI (el modelo está etiquetado `text-generation-inference`), llama.cpp/Ollama y KoboldCPP (el autor documenta explícitamente el uso en KoboldCPP Chat Mode).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Miko-M7-V3 | 7,24 B | 8192 en entrenamiento | no disponible | Hugging Face (183 descargas) | Fine-tuning QLoRA de Mistral-7B orientado a chat |
| mistralai/Mistral-7B-v0.1 | 7,24 B | 4096 (ventana deslizante) | Apache 2.0 | Hugging Face | Modelo base; sin ajuste conversacional |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | Apache 2.0 | Hugging Face | Ajuste instructivo oficial con RLHF/DPO |
| anthracite-org/stheno (familia) | ~7 B | no disponible | no disponible | Hugging Face | Dataset de rol usado como fuente de entrenamiento |

La comparación con modelos de la misma categoría se limita a parámetros y contexto, ya que no hay benchmarks publicados para Miko-M7-V3 que permitan contrastar rendimiento.

## Limitaciones y advertencias

- No se declara licencia en la model card; el uso comercial queda sin base legal clara hasta que el autor la especifique. El modelo base Mistral-7B-v0.1 es Apache 2.0, pero eso no cubre automáticamente los pesos derivados.
- La etiqueta `not-for-all-audiences` indica que el modelo puede generar contenido no apto para todos los públicos; requiere filtrado y moderación en producción.
- Riesgo de alucinación inherente a un modelo de 7 B sin RLHF ni DPO; no se han publicado evaluaciones de fidelidad factual.
- Entrenado con logs de Discord anonimizados: posible presencia de sesgos de estilo, jerga y patrones conversacionales de esa comunidad, además de riesgo de memorización parcial de conversaciones.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés, por lo que el rendimiento en castellano no está garantizado.
- La longitud de contexto de 8192 tokens corresponde a la configuración de entrenamiento; el modelo base Mistral-7B-v0.1 usa ventana deslizante de 4096 tokens, y no se documenta que el fine-tuning amplíe ese límite en inferencia.
- Sin benchmarks ni evaluaciones de seguridad publicadas; no recomendable como componente crítico sin validación previa.
- El repositorio tiene 183 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricer0ll/Miko-M7-V3
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Dataset principal: https://huggingface.co/datasets/anthracite-org/stheno-filtered-v1.1
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- KoboldCPP (cliente de inferencia citado por el autor): https://github.com/LostRuins/koboldcpp
- Artista de la portada: https://www.fiverr.com/nahraya
