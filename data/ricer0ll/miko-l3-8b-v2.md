# ricer0ll/Miko-L3-8B-v2

## Resumen

Miko-L3-8B-v2 es un modelo de lenguaje de 8.030.261.248 parámetros, desarrollado por el usuario independiente ricer0ll, especializado en conversación, roleplay y narración de historias. Se construye sobre el modelo base meta-llama/Meta-Llama-3-8B y se publica con licencia llama3. Es la segunda iteración de la familia Miko, tras Miko-v1-m7, que partía de Mistral 7B.

El modelo aborda el problema del ajuste fino conversacional y de personajes con un tono y una caracterización consistentes, incorporando además un gran volumen de datos de roleplay y storytelling. A diferencia de la primera versión, el autor entrenó desde el modelo base (no desde un instruct) y posteriormente fusionó los pesos resultantes con Llama 3 8B Instruct mediante el método TIES, con el objetivo de preservar capacidades generales y de razonamiento lógico.

Es relevante para desarrolladores e investigadores interesados en modelos de 8B con contexto de 8.192 tokens, ajuste QLoRA reproducible y una receta de fusión documentada. La model card advierte explícitamente de contenido no apto para todas las audiencias (etiqueta not-for-all-audiences) y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), con atención de múltiples cabezas y RoPE; usa FlashAttention-2 en entrenamiento |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (sequence_len del entrenamiento); el modelo base Llama 3 soporta 8.192 tokens |
| Tipos de cuantizacion | No disponible en la model card; al estar en safetensors bf16, admite cuantización estándar a 8 y 4 bits (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de Llama 3 con 8.030.261.248 parámetros, entrenada mediante QLoRA sobre el modelo base (la configuración de Axolotl indica `base_model: NousResearch/Meta-Llama-3-8B`, `load_in_4bit: true`, `adapter: qlora`, `lora_r: 16`, `lora_alpha: 16`, `lora_dropout: 0.05` y módulos objetivo gate_proj, down_proj, up_proj, q_proj, v_proj, k_proj y o_proj). El entrenamiento usó `micro_batch_size: 1`, `gradient_accumulation_steps: 8`, 2 épocas, scheduler coseno, learning rate 4e-5, optimizador adamw_bnb_8bit, gradient checkpointing, sample packing, `sequence_len: 8192`, truncado de secuencias excedentes y `val_set_size: 0.01`. Duró aproximadamente 1,5 días en una RTX 3090 con underclock y temperatura estable de 60 °C.

El conjunto de datos combina 5.000 filas de PIPPA Smoll (de 38.199), 7.831 de Augmental, un subconjunto pequeño de LimaRP (31 filas), 9.736 de Sonnet Charcard, 10.000 de Stheno v1.1 (de 26.765) y 2.576 del dataset de Miko v1, todos convertidos a formato OpenAI y con la plantilla de chat de Llama 3. Posteriormente, los pesos entrenados se fusionaron con meta-llama/Meta-Llama-3-8B-Instruct mediante el método TIES (`density: 0.7`, `weight: 0.5`, `normalize: true`, `int8_mask: true`, `rescale: true`, `dtype: bfloat16`), tomando el Instruct como modelo base de la fusión. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Llama 3 (`<|start_header_id|>` y `<|eot_id|>`).
- Roleplay y encarnación de personajes, con énfasis declarado en personalidad, caracterización y coherencia de personaje.
- Narración de historias y escritura creativa de formato largo.
- Conversación general y tareas lógicas básicas gracias a la fusión con Llama 3 8B Instruct.
- Capacidad declarada por el autor para contenido NSFW (etiqueta not-for-all-audiences).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión, audio ni matemáticas avanzadas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Roleplay conversacional con personajes persistentes: el modelo se entrenó con Sonnet Charcard y Stheno v1.1, por lo que mantiene rasgos de personaje y estilo a lo largo de diálogos multi-turno dentro de la ventana de 8.192 tokens.
- Prototipado de chatbots de entretenimiento: su mezcla de PIPPA y Augmental permite respuestas conversacionales naturales en asistentes lúdicos o de compañía, sin necesidad de un modelo mayor.
- Escritura creativa asistida: la inclusión de datos de storytelling y narración lo hace adecuado para generar relatos, diálogos y descripciones con tono consistente.
- Investigación en ajuste fino eficiente: la configuración QLoRA y la receta de fusión TIES publicadas sirven como referencia reproducible para estudiar el efecto de mezclar un modelo ajustado con un instruct.
- Generación de datos sintéticos de diálogo: puede emplearse para producir conversaciones etiquetadas en pipelines de aumento de datos para otros entrenamientos.
- Despliegue local en hardware de consumo: con 8.030 millones de parámetros, cabe cuantizado en 4 bits en GPUs de 8-12 GB, lo que permite entornos de desarrollo sin clúster.
- Base para nuevos ajustes de personaje: al partir de un modelo ya orientado a roleplay, sirve como punto de partida para LoRAs específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16/fp16 (tamaño del repo 16,1 GB); alrededor de 8-10 GB en cuantización de 8 bits; alrededor de 5-6 GB en 4 bits, más overhead de contexto KV.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en precisión completa con lotes grandes; RTX 4090 (24 GB) para bf16 con contexto completo; RTX 3090 (24 GB) validada por el autor para entrenamiento QLoRA.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en bf16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantización a 4 bits.
- Opciones de despliegue: text-generation-inference (etiqueta del repo), vLLM, llama.cpp/Ollama y TGI con pesos convertidos a GGUF; requiere la plantilla de chat de Llama 3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Miko-L3-8B-v2 | 8.030 M | 8.192 | Roleplay y conversación (fusión TIES con Llama 3 8B Instruct) | llama3 | Hugging Face, 709 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 | Asistente general | llama3 | Hugging Face, ampliamente adoptado |
| Miko-v1-m7 | No disponible | No disponible | Roleplay sobre Mistral 7B | No disponible | Hugging Face (versión previa del mismo autor) |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- Contenido no apto para todas las audiencias: el modelo está entrenado con datasets de roleplay que incluyen material NSFW y lleva la etiqueta not-for-all-audiences; requiere moderación en despliegues públicos.
- Riesgo de alucinación: al ser un ajuste conversacional sin benchmarks publicados, no hay evidencia de robustez factual; no debe usarse como fuente de verdad sin verificación.
- Idiomas: no se documenta la cobertura lingüística; se asume predominio del inglés por la composición de los datasets, sin confirmación del autor.
- Licencia llama3: impone restricciones de uso comercial y obligaciones de atribución derivadas de la Llama 3 Community License; conviene revisar los términos antes de producción.
- Sin datos de benchmarks ni evaluaciones independientes: no hay métricas de MMLU, HumanEval o GSM8K que permitan estimar su calidad frente a alternativas.
- Sesgos: los datasets de roleplay (PIPPA, LimaRP, Stheno) pueden introducir sesgos de género, culturales y de contenido adulto no evaluados.
- Ventana de contexto limitada a 8.192 tokens: insuficiente para documentos largos o conversaciones muy extensas sin truncado.
- Reproducibilidad limitada: la model card reporta una configuración de entrenamiento con `base_model: NousResearch/Meta-Llama-3-8B` mientras que los metadatos del repo indican meta-llama/Meta-Llama-3-8B; conviene verificar la procedencia exacta de los pesos.
- Autor individual y bajo número de descargas (709) y likes (1): menor validación comunitaria que modelos de organizaciones consolidadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricer0ll/Miko-L3-8B-v2
- Versión previa: https://huggingface.co/ricer0ll/Miko-v1-m7
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Modelo instruct usado en la fusión: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Dataset PIPPA: https://huggingface.co/datasets/Xilabs/PIPPA-alpaca
- Dataset Augmental: https://huggingface.co/datasets/Heralax/Augmental-Dataset
- Dataset LimaRP: https://huggingface.co/datasets/PJMixers/lemonilia_LimaRP-Only-NonSus-Simple-CustomShareGPT
- Dataset Sonnet Charcard: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset Stheno v1.1: https://huggingface.co/datasets/anthracite-org/stheno-filtered-v1.1
- Ilustración de portada: https://www.fiverr.com/nahraya
