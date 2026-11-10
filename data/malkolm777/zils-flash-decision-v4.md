# malkolm777/zils-flash-decision-v4

## Resumen

zils-flash-decision-v4 es un modelo de decisión derivado de la familia Qwen3.5-9B, publicado por el usuario malkolm777 en Hugging Face. Se trata de un fine-tune mediante LoRA del modelo base vllm-sr/d3-flash (Apache-2.0), orientado a tareas de clasificación y extracción de características dentro del denominado "Zils subnet 127 flash pool". El modelo está pensado para emitir decisiones estructuradas a partir de entradas textuales, no para generación abierta de texto.

El pipeline declarado es `feature-extraction`, con arquitectura transformer de tipo Qwen3.5 y un total de 8.392.695.024 parámetros según los pesos en safetensors. El repositorio ocupa 16,8 GB y se distribuye bajo licencia Apache-2.0. La model card indica que se entrenó con LoRA (rango 16, optimizador AdamW, learning rate 5e-5) sobre particiones de entrenamiento de un conjunto heterogéneo de datasets públicos convertidos al formato de decisión de Zils.

La relevancia del modelo es limitada y acotada: no tiene descargas ni "likes" en el momento de la ficha, no declara idiomas soportados ni publica resultados de benchmarks, y su utilidad práctica parece restringida al ecosistema Zils y a pipelines de clasificación especializada. Para un desarrollador externo, debe evaluarse como un experimento de fine-tuning sobre Qwen3.5-9B más que como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-9B, según model card) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5-9B, heredada del modelo base vllm-sr/d3-flash. El autor aplica un fine-tune LoRA con rango 16, optimizador AdamW y learning rate 5e-5 sobre el cuerpo base, sin indicar el número de pasos, el tamaño efectivo del batch ni la duración del entrenamiento. El resultado es un checkpoint de aproximadamente 8,39 mil millones de parámetros en safetensors.

Los datos de entrenamiento provienen de particiones de train de datasets públicos convertidos al formato de decisión de Zils: mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups y glaive function calling, además de los exámenes semilla públicos Zils v1/v2/v4. No se documenta el número total de tokens, la composición porcentual ni si hubo etapas de RLHF o DPO. La model card menciona un archivo LICENSE y NOTICE que conviene revisar antes de cualquier uso.

## Capacidades

- Emisión de decisiones estructuradas sobre entradas textuales, conforme al formato de decisión de Zils.
- Clasificación y extracción de características (pipeline `feature-extraction`).
- Cobertura de tareas de razonamiento tipo MMLU, BoolQ, ANLI y CommonsenseQA gracias a los datasets de entrenamiento.
- Tareas aritméticas básicas derivadas de GSM8K y SVAMP.
- Clasificación de intenciones en dominios de banca y atención al cliente (banking77, clinc150).
- Detección de sarcasmo, sentimiento y emoción (iSarcasm, poem_sentiment, tweet_eval).
- Clasificación de tópicos (20newsgroups) y tareas GLUE.
- Formato de function calling derivado de glaive function calling, aunque no se documenta soporte de tool calling en inferencia.
- No se declara modo thinking, visión, audio ni capacidades multilingües explícitas.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede clasificar intenciones sobre textos de usuario, aprovechando el entrenamiento con banking77 y clinc150, para dirigir tickets al equipo adecuado.
- Moderación de tono y sarcasmo en foros: entrenado con iSarcasm y titulares de sarcasmo, puede etiquetar mensajes potencialmente irónicos o conflictivos antes de su publicación.
- Clasificación de sentimiento en reseñas y poesía: el dataset poem_sentiment permite aplicar el modelo a análisis de sentimiento en dominios literarios o creativos.
- Filtrado de tópicos en agregadores de noticias: el entrenamiento con 20newsgroups lo hace apto para etiquetar artículos por categoría temática en pipelines de ingestión.
- Verificación de coherencia lógica en QA: el uso de BoolQ, ANLI y CommonsenseQA permite puntuar pares pregunta-respuesta o premisa-hipótesis en sistemas de control de calidad.
- Evaluación de respuestas aritméticas: con GSM8K y SVAMP como datos de entrenamiento, puede usarse como clasificador de corrección en pipelines de evaluación de soluciones matemáticas.
- Selección de herramientas en agentes: el formato derivado de glaive function calling permite puntuar qué herramienta encaja con una petición, como paso previo a un orquestador externo.
- Extracción de características para búsqueda semántica: al ser un modelo `feature-extraction`, puede emplearse para generar representaciones vectoriales en sistemas de recuperación, aunque la calidad de los embeddings no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 16-17 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 24 GB o más para contextos largos.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos, aunque no se distribuyen pesos cuantizados oficiales.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4,5-5 GB para pesos, supeditado a conversión manual a GGUF/AWQ/GPTQ.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en fp16/bf16; RTX 4090 (24 GB) viable en fp16 con contextos moderados.
- GPU de consumo: RTX 3090/4090 (24 GB) en fp16; RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 4080 16 GB solo con cuantización a 8 bits o inferior.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF. El tag `custom_code` implica revisar el código remoto antes de cargar el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-decision-v4 | 8,39 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune LoRA de decisión, sin benchmarks |
| Qwen3.5-9B (familia base) | ~9 B | no disponible en esta ficha | Apache-2.0 (según familia) | Amplia | Modelo generalista del que deriva |
| vllm-sr/d3-flash | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo base del fine-tune |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en ninguna tarea.
- Cero descargas y cero interacciones: no existe validación comunitaria del checkpoint.
- Idiomas no declarados: no se puede asumir soporte multilingüe, pese a que el modelo base probablemente lo tenga.
- Contexto no documentado: imposible planificar despliegues con ventanas largas sin medirlo empíricamente.
- Riesgo de alucinación y de sobreajuste al formato de decisión de Zils, lo que puede degradar el rendimiento fuera de ese esquema.
- Sesgos potenciales heredados de los datasets de entrenamiento (MMLU, tweet_eval, 20newsgroups, etc.) y del cuerpo base, sin documentación de mitigación.
- El tag `custom_code` obliga a auditar el código remoto antes de ejecutarlo en producción, por riesgo de ejecución arbitraria.
- Licencia Apache-2.0 permisiva para uso comercial, pero deben revisarse los archivos LICENSE y NOTICE del repositorio por posibles atribuciones adicionales.
- Modelo de nicho: su pipeline `feature-extraction` y su orientación a decisiones lo hacen poco adecuado para generación abierta o chat general.
- Fecha de creación futura (2026-11-10) en los metadatos, lo que sugiere posibles inconsistencias en la publicación.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-flash-decision-v4
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
