# leobianco/bosch_SFT_Mistral-7B-Instruct-v0_3_S130104_epo3_lr3_8e-04_r32_2609221303

## Resumen

El modelo `bosch_SFT_Mistral-7B-Instruct-v0_3_S130104_epo3_lr3_8e-04_r32_2609221303` es un ajuste fino (fine-tuning) supervisado del modelo base `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario `leobianco` en HuggingFace. Se ha entrenado mediante SFT (supervised fine-tuning) utilizando la librería TRL de HuggingFace, según se documenta en su model card. El nombre del repositorio codifica los hiperparámetros del entrenamiento: 3 épocas (`epo3`), tasa de aprendizaje 3,8e-04 (`lr3_8e-04`) y rango 32 (`r32`), lo que sugiere el uso de LoRA o QLoRA con rango 32.

El modelo hereda la arquitectura y las capacidades del base Mistral-7B-Instruct-v0.3: un transformer decoder-only de aproximadamente 7.250 millones de parámetros, con ventana de contexto de 32.768 tokens y soporte nativo de function calling. Sin embargo, la ficha pública no documenta el conjunto de datos de entrenamiento, el dominio de especialización, ni los idiomas objetivo, por lo que se desconoce el propósito concreto del ajuste más allá de la etiqueta "bosch" en el nombre. Esto limita seriamente su evaluación sin inspección directa del modelo.

El tamaño del repositorio es de solo 0,1 GB, lo que resulta incompatible con los pesos completos de un modelo de 7B (que en bf16 ocuparían aproximadamente 14,5 GB). Esto apunta a que el repositorio contiene únicamente adaptadores LoRA (o un delta de pesos), no el modelo completo, y que requiere fusión con el modelo base para su uso. El modelo acumula 0 descargas y 0 "likes" en el momento de la consulta, lo que indica que es un experimento reciente sin validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.250 millones (heredados del base, no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base; no confirmada para el ajuste) |
| Tipos de cuantizacion | no disponible (la ficha no documenta cuantizaciones del ajuste) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el base es Apache 2.0, pero la ficha del ajuste no la especifica) |
| Formato de pesos | safetensors (etiqueta del repo); probablemente adaptadores LoRA segun el tamano del repo (0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only con grouped-query attention (GQA), sliding window attention con ventana de 4.096 tokens y un vocabulario de 32.768 tokens. El contexto nativo del base es de 32.768 tokens, ampliado respecto a versiones anteriores. Sobre esta arquitectura, `leobianco` ha aplicado un ajuste fino supervisado (SFT) mediante TRL, presumiblemente con PEFT/LoRA dado el sufijo `r32` del nombre del repositorio.

Los datos de entrenamiento, la composición del dataset, el número de tokens vistos y si hubo etapas posteriores de preferencia (DPO/RLHF) no se documentan en la model card. Los únicos datos de entrenamiento disponibles son los hiperparámetros inferidos del nombre: 3 épocas, learning rate 3,8e-04 y rango de adaptación 32. Las versiones de framework indicadas son TRL 1.9.2, Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.1 y Tokenizers 0.22.2 (versiones inusualmente altas, correspondientes a un entorno posterior al habitual). La ficha enlaza un run de Weights & Biases que podría contener más detalles del entrenamiento.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del base Mistral-7B-Instruct-v0.3.
- Razonamiento de propósito general, matemáticas básicas y generación de código, en el nivel del modelo base.
- Soporte de function calling / tool calling nativo (característica del base v0.3 de Mistral).
- Capacidad de mantener conversaciones multi-turno con ventana de contexto de hasta 32.768 tokens, siempre que el ajuste no la haya degradado.
- Capacidades multilingües heredadas del base (principalmente inglés, con presencia de otras lenguas europeas), aunque la ficha no confirma qué idiomas se han reforzado o degradado en el ajuste SFT.
- No se documentan capacidades especiales adicionales (visión, audio, modo thinking explícito) introducidas por el ajuste.

## Casos de uso

- Experimentación académica: el modelo sirve como punto de partida para estudiar el efecto de un SFT con LoRA rango 32 sobre Mistral-7B-Instruct-v0.3, comparando con el base y con otros ajustes del mismo autor.
- Generación de texto conversacional en inglés: al heredar las capacidades del base, puede emplearse en tareas de chat y asistencia textual, siempre que se fusione con los pesos base.
- Prototipado de asistentes con contexto largo: los 32.768 tokens heredados permiten procesar documentos extensos en una sola pasada, útil en tareas de resumen o Q&A sobre textos largos.
- Evaluación de pipelines de SFT con TRL: sirve como ejemplo reproducible de integración de TRL, Transformers y PEFT en un flujo de fine-tuning supervisado.
- Investigación sobre alineación y ajuste específico de dominio: dado el nombre "bosch", puede estar orientado a un dominio concreto (empresa, corpus temático) que habría que verificar con el autor antes de usarlo en producción.
- Integración en demos con `transformers.pipeline`: la model card incluye un ejemplo mínimo de uso con `pipeline("text-generation")`, utilizable para pruebas rápidas tras fusionar los adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un repositorio de 0,1 GB, la inferencia requiere cargar el modelo base Mistral-7B-Instruct-v0.3 (aproximadamente 14,5 GB en bf16) y fusionar los adaptadores, o bien cargar los adaptadores sobre el base mediante PEFT.
- VRAM estimada para inferencia del modelo base completo: ~14-15 GB en bf16, ~8 GB en int8, ~4-5 GB en int4 (GGUF Q4_K_M o AWQ/GPTQ de 4 bits).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 en producción; RTX 3090, RTX 4090 o RTX A6000 (24 GB) para bf16 con contexto moderado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB (cuantizado a 4 bits), RTX 4070/4080/4090 y tarjetas con 8-16 GB usando GGUF Q4/Q5.
- Opciones de despliegue: `transformers` con PEFT para cargar adaptadores, vLLM o TGI tras fusionar pesos, llama.cpp/Ollama/LM Studio si se convierte a GGUF, y endpoints compatibles (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto. Como referencia general para un 7B, se esperan decenas de tokens por segundo en una RTX 4090 en bf16 y varias centenas en batch con A100/H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bosch_SFT_Mistral-7B-Instruct-v0_3 (este modelo) | 7.250 M (adaptadores) | 32.768 | no disponible | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 (base) | 7.250 M | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8.030 M | 128.000 | Llama 3.1 Community License | HuggingFace, muy usado |
| Qwen/Qwen2.5-7B-Instruct | 7.620 M | 131.072 | Apache 2.0 (mayoría de variantes) | HuggingFace, muy usado |

No se dispone de datos de rendimiento del ajuste que permitan comparar calidad frente al base o a las alternativas. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- La ficha no documenta el dataset de entrenamiento, el dominio ni los idiomas, por lo que se desconoce qué comportamiento ha aprendido el ajuste y si degrada capacidades del base.
- El repositorio tiene 0,1 GB, lo que sugiere que contiene adaptadores LoRA y no pesos completos; es necesario fusionarlos con el modelo base para su uso, y esa fusión no está documentada.
- El sufijo "bosch" en el nombre podría indicar un dominio o cliente específico; sin confirmación del autor, no debe asumirse su adecuación para otros contextos.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas factuales sin recuperación aumentada.
- La licencia del ajuste está marcada como "no disponible"; aunque el base es Apache 2.0, la ausencia de licencia explícita en el repositorio genera incertidumbre legal para uso comercial.
- Las versiones de framework indicadas (Transformers 5.14.1, PyTorch 2.11.0) son muy recientes y pueden requerir entornos específicos para reproducir el entrenamiento.
- No hay validación por parte de la comunidad (0 descargas, 0 likes), por lo que no existen evaluaciones independientes de su calidad.
- No se documenta si el ajuste preserva el soporte de function calling del base; conviene verificarlo antes de usarlo en pipelines de agentes.
- No se especifican sesgos conocidos ni evaluaciones de seguridad del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/bosch_SFT_Mistral-7B-Instruct-v0_3_S130104_epo3_lr3_8e-04_r32_2609221303
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Run de Weights & Biases del entrenamiento: https://wandb.ai/leobianco-universit-paris-saclay/new_perl/runs/5qg1vrbg
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo hermano del mismo autor (npov_SFT_Mistral-7B-Instruct-v0_3): https://huggingface.co/leobianco/npov_SFT_Mistral-7B-Instruct-v0_3_S130104_epo3_lr1_5e-03_r8_2609211248
- Otro ajuste del mismo autor (npov_SFT_mistralai): https://huggingface.co/leobianco/npov_SFT_mistralai_S130104_epo1_lr3e-3_r8_2601301129
