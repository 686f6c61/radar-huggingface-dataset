# cemig-nlp-releases/energy-gpt-regulatorio-v3

## Resumen

energy-gpt-regulatorio-v3 es un modelo multimodal de tipo image-text-to-text publicado por la organización cemig-nlp-releases en HuggingFace. Se trata de un ajuste supervisado (SFT) de una base Qwen3.5 de 4B, desarrollado en dos etapas sobre datos conversacionales y normativa técnica del sector eléctrico brasileño, concretamente en los dominios de regulación y distribución de energía. El repositorio contiene 4.539.265.536 parámetros (unos 4,54 mil millones) en formato safetensors, con un tamaño total de 9,1 GB.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un modelo de dominio orientado a conversaciones técnicas y regulatorias. La model card lo describe como un refinamiento de "stage 2" sobre el checkpoint interno qwen3.5-4b-regulacao-distribuicao-mcsynth-1e5, con el encoder de visión congelado y ajuste únicamente de la torre de lenguaje y la cabeza de salida. La ficha se publica con cero descargas y cero "likes", sin licencia declarada y sin idiomas declarados.

El dato más llamativo es que, pese a ser un modelo multimodal con encoder de visión, el entrenamiento se ha centrado exclusivamente en datos de texto conversacional en portugués (dataset TokenLab/CemigConvoV1.1 y un corpus de normas técnicas de distribución). Los resultados declarados se limitan a métricas de entrenamiento (loss 0,6464 y perplejidad 1,9087), sin benchmarks públicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (image-text-to-text) basada en Qwen3.5; encoder de visión congelado y ajuste de la torre de lenguaje (`model.language_model.*`, `lm_head.*`) |
| Parámetros totales | 4.539.265.536 (~4,54 B), dato real de safetensors |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 4.096 tokens durante el entrenamiento (`sequence_len: 4096`); contexto nativo del modelo base no disponible |
| Tipos de cuantización | no disponible en el repositorio; solo pesos safetensors (tamaño de repo de 9,1 GB, coherente con bf16/fp16) |
| Idiomas soportados | no disponible (los datos de dominio sugieren portugués de Brasil, no declarado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Librería | transformers |
| Frameworks de entrenamiento | Axolotl 0.16.2.dev0; Transformers 5.8.1; PyTorch 2.10.0+cu130; Datasets 4.8.5; Tokenizers 0.22.2 |
| Plantilla de chat | qwen3_5 |
| Datasets de entrenamiento | TokenLab/CemigConvoV1.1 (split `regulacao`) y `norm_tecnicas_dist.jsonl` |
| Compatibilidad | tag `endpoints_compatible` (HuggingFace Inference Endpoints) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `./outputs/qwen3.5-4b-regulacao-distribuicao-mcsynth-1e5` (etapa 1) y se somete a un refinamiento SFT completo en la etapa 2. La configuración de Axolotl especifica `chat_template: qwen3_5` y congela explícitamente todo excepto `model.language_model.*` y `lm_head.*`, lo que implica que el encoder de visión heredado del modelo base no se ha entrenado en ninguna de las dos etapas. Los datos de la etapa 2 combinan el split `regulacao` del dataset TokenLab/CemigConvoV1.1 con un fichero de normas técnicas de distribución (`norm_tecnicas_dist.jsonl`), ambos procesados con plantilla de chat y con `roles_to_train: [assistant]`, es decir, entrenamiento supervisado sobre las respuestas del asistente únicamente. No se documenta ninguna fase de RLHF, DPO o preferencias.

Los hiperparámetros principales son: learning rate 5e-6 con scheduler coseno, warmup de 20 pasos, 1 época, micro batch de 8, acumulación de gradiente de 4 (batch total efectivo de 32), 1.035 pasos de entrenamiento, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), weight decay 0,01, precisión bf16 automática con TF32 activado, gradient checkpointing y `flash_attention_2` como implementación de atención. Se activa el plugin `CutCrossEntropyPlugin` y `sample_packing: true` con `sequence_len: 4096`. El conjunto de validación es el 5 % de los datos. No se documenta ninguna innovación técnica propia más allá del uso de estas técnicas estándar de eficiencia de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio energético (regulación y distribución), a partir de la plantilla de chat `qwen3_5`.
- Entrada multimodal de imágenes y texto (pipeline declarado `image-text-to-text`), ya que conserva el encoder de visión del modelo base, aunque este no se haya reentrenado.
- Respuestas de asistente especializadas en normativa técnica y regulatoria del sector eléctrico, derivadas del ajuste sobre `norm_tecnicas_dist.jsonl` y el split `regulacao`.
- Razonamiento sobre documentos técnicos y regulatorios en formato conversacional.
- Soporte de tool calling / function calling: no documentado en la model card ni en la configuración de entrenamiento.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; el corpus de entrenamiento es de dominio brasileño.
- Modo "thinking" o razonamiento explícito: no documentado.
- Capacidades especiales de audio: no disponibles.

## Casos de uso

- Asistente conversacional interno para equipos de regulación: el modelo puede mantener diálogos multi-turno sobre normativa del sector eléctrico apoyándose en la ventana de 4.096 tokens empleada en entrenamiento, útil para consultas recurrentes de analistas que hoy dependen de búsqueda manual en documentación.
- Extracción y resumen de normas técnicas de distribución: dado un fragmento de norma técnica, el modelo puede generar resúmenes y respuestas concretas sobre requisitos, plazos o procedimientos, aprovechando el ajuste específico sobre `norm_tecnicas_dist.jsonl`.
- Base de un sistema RAG sobre documentos regulatorios con entrada visual: al conservar el encoder de visión, puede procesar páginas escaneadas de resoluciones o tablas técnicas junto con la pregunta textual, siempre que esos documentos se presenten como imagen.
- Triaje y clasificación de consultas regulatorias: uso como primer nivel de atención para enrutar consultas hacia el área correspondiente (regulación, distribución, normativa técnica) mediante generación de etiquetas o respuestas breves.
- Generación de borradores de respuestas a requerimientos de organismos reguladores: el modelo puede redactar un primer borrador a partir de los hechos aportados por el usuario, que después revisa un especialista humano.
- Formación y onboarding de personal técnico: despliegue como tutor conversacional que responde dudas frecuentes sobre procedimientos de distribución y marcos regulatorios, reduciendo la carga sobre expertos senior.
- Prototipado rápido de interfaces conversacionales de dominio: gracias al tag `endpoints_compatible`, puede desplegarse en HuggingFace Inference Endpoints para validar producto antes de invertir en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` del autor incluye una entrada (`outputs/qwen3.5-4b-regulacao-distribuicao-stage2-5e6`) con la lista de resultados vacía, y la model card no reporta MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar.

Las únicas métricas disponibles son las de validación durante el entrenamiento:

| Métrica | Paso 0 | Paso 518 (época 0,50) | Paso 1035 (época 1,00) |
|---|---|---|---|
| Training loss | no registrado | 0,6275 | 0,6454 |
| Validation loss | 0,6501 | 0,6470 | 0,6464 |
| Perplejidad | 1,9157 | 1,9098 | 1,9087 |
| Memoria activa (GiB) | 12,6 | 28,28 | 28,28 |
| Memoria asignada (GiB) | 12,6 | 28,28 | 28,28 |
| Memoria reservada (GiB) | 12,67 | 47,0 | 47,62 |

Estas cifras corresponden exclusivamente al conjunto de validación interno (5 % de los datos de dominio) y no son comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9,1 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda un mínimo de 12-16 GB de VRAM para secuencias moderadas.
- VRAM estimada con cuantización de 8 bits: aproximadamente 4,5-5 GB de pesos, factible en GPUs de 8-12 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 2,5-3 GB de pesos, factible en GPUs consumer de gama media con 8 GB o más.
- GPUs recomendadas: A100 (40/80 GB), H100 o L40S para despliegue en producción con batching; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 sin problemas; RTX 4080 (16 GB) para bf16 con secuencias cortas o cuantización.
- Cabe en GPU consumer: sí. En bf16 en RTX 4090/3090; en 4 bits (previa conversión) en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y HuggingFace Inference Endpoints (tag `endpoints_compatible`). Para llama.cpp u Ollama sería necesaria una conversión a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponible. La información proporcionada no incluye mediciones de tokens por segundo ni latencia.
- Nota sobre la modalidad: al tratarse de un modelo con encoder de visión, el consumo de VRAM para entradas de imagen es superior al de un modelo puramente textual del mismo tamaño; no se dispone de mediciones específicas.

## Comparativa con modelos similares

No se dispone de información sobre el modelo base Qwen3.5-4B (no se enlaza ni se documenta su ficha pública), por lo que la comparación se establece con alternativas conocidas de tamaño y modalidad equivalentes. Los datos de los modelos comparables proceden de sus fichas públicas y deben verificarse antes de un uso crítico.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| energy-gpt-regulatorio-v3 | 4,54 B | 4.096 tokens en entrenamiento; nativo no disponible | Imagen-texto → texto | no disponible | Safetensors bf16, sin cuantizaciones publicadas, 0 descargas |
| Qwen3-4B | ~4 B | 32.768 tokens (ampliable con YaRN) | Texto | Apache 2.0 | Safetensors y GGUF, amplia adopción |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | 32.768 tokens | Imagen-texto → texto | Apache 2.0 según su ficha pública | Safetensors, amplia adopción |

Diferencias clave: los dos modelos comparables son de propósito general, con licencias permisivas y ecosistema amplio, mientras que energy-gpt-regulatorio-v3 está especializado en un dominio muy concreto, no declara licencia y no publica benchmarks ni cuantizaciones. Como contrapartida, está ajustado sobre corpus regulatorio y de distribución que los modelos generalistas no han visto de forma específica. No hay datos de rendimiento que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no puede asumirse autorización para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: el ajuste se ha realizado sobre corpus brasileño, por lo que es previsible un rendimiento limitado en castellano u otros idiomas, aunque no existen datos que lo cuantifiquen.
- Riesgo de alucinación: la perplejidad baja (1,9087) indica buen ajuste al conjunto de validación interno, pero no hay evaluación independiente. En un dominio regulatorio, una respuesta incorrecta puede tener consecuencias legales o de cumplimiento; toda salida debe verificarse contra la fuente normativa.
- Sesgo de dominio: el modelo está especializado en regulación y distribución eléctrica y puede degradarse notablemente en tareas generales.
- Contradicción documental: la model card afirma que el modelo se entrenó "from scratch", mientras que la configuración de Axolotl indica que parte de un checkpoint base Qwen3.5 de 4B. Debe tratarse como un ajuste, no como un entrenamiento desde cero.
- Model card incompleta: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed".
- Encoder de visión congelado: aunque conserva la capacidad multimodal del modelo base, no se ha adaptado al dominio, por lo que su comportamiento sobre documentos técnicos del sector no está validado.
- Sin benchmarks públicos: no existe ninguna evaluación estándar que permita comparar el modelo con alternativas, ni por parte del autor ni de terceros.
- Cero adopción registrada: 0 descargas y 0 "likes" en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad y de informes de errores.
- Contexto limitado: la ventana empleada en entrenamiento es de 4.096 tokens; no se documenta la longitud nativa del modelo base ni si admite extensiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cemig-nlp-releases/energy-gpt-regulatorio-v3
- Dataset de entrenamiento (split `regulacao`): https://huggingface.co/datasets/TokenLab/CemigConvoV1.1
- Repositorio de Axolotl (framework de entrenamiento utilizado): https://github.com/axolotl-ai-cloud/axolotl
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo, a su paper ni a demos. Las búsquedas devueltas no guardan relación con el modelo evaluado.
