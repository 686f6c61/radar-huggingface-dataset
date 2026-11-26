# Oatis123/reddit-Ministral-3-8B-Instruct-2512

## Resumen

reddit-Ministral-3-8B-Instruct-2512 es un ajuste fino experimental del modelo mistralai/Ministral-3-8B-Instruct-2512, desarrollado por el usuario Oatis123. Su objetivo es transferir el estilo conversacional de Reddit (respuestas breves, coloquiales, sarcásticas y sin filtros corporativos) a un modelo instructivo de 8.49 mil millones de parámetros. Se distribuye como un GGUF en BF16 de aproximadamente 15,82 GB, pensado como checkpoint intermedio para cuantización posterior o inferencia directa.

El entrenamiento se realizó mediante QLoRA sobre la versión cuantizada a 4 bits de Unsloth del modelo base, con un dataset propio de 5.862 conversaciones multirretorno en inglés extraídas de Reddit (12.846 turnos de asistente, mediana de respuesta de 95 caracteres). El resultado se fusionó a 16 bits y se exportó a GGUF BF16.

Es relevante por dos motivos: por un lado, demuestra un flujo de trabajo reproducible de ajuste de estilo sobre un modelo Mistral reciente usando Unsloth y exportación a GGUF; por otro, sirve como caso de estudio de los riesgos de los fine-tunes sobre datos de foros sin curar (sarcasmo, lenguaje soez, humor absurdo). No es un modelo para producción generalista, sino un artefacto de estilo experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral 3; detalles especificos de la arquitectura del modelo base no disponibles) |
| Parametros totales | 8.489.553.920 (8,49 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max_seq_length=2048 |
| Tipos de cuantizacion | BF16 (GGUF sin cuantizar); el autor sugiere Q8_0, Q6_K, Q5_K_M, Q4_K_M con imatrix |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16); repo de 17,0 GB |
| Modelo base | mistralai/Ministral-3-8B-Instruct-2512 |
| Metodo de ajuste | QLoRA (r=32, lora_alpha=64, lora_dropout=0) via Unsloth, fusionado a 16 bits |
| Dataset de entrenamiento | Oatis123/reddit-slop-dataset-v2 (dataset_v3.1-evil.jsonl) |
| Plantilla de chat | Mistral "Le Chat" sin default_system_message |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Ministral-3-8B-Instruct-2512 de Mistral AI; la model card no detalla capas, atencion ni innovaciones internas del modelo base, por lo que esos datos se consideran no disponibles. El ajuste se aplicó sobre la variante cuantizada a 4 bits de Unsloth (unsloth/Ministral-3-8B-Instruct-2512-unsloth-bnb-4bit) mediante QLoRA con rango 32, alpha 64 y sin dropout.

Los hiperparámetros fueron 2 épocas, learning rate 1,5e-4 con scheduler coseno, batch efectivo de 16 (4 x 4), longitud máxima de secuencia de 2048 y una proporción de validación del 5%. El enmascaramiento de pérdida se aplicó solo a los turnos del asistente (train_on_responses_only sobre las etiquetas [INST] / [/INST]). Una decisión destacable es la eliminación del default_system_message de la plantilla Mistral para evitar instrucciones de sistema ocultas y mantener respuestas concisas y sin filtro corporativo. Tras el entrenamiento, el adaptador se fusionó a 16 bits y se convirtió a GGUF BF16.

El dataset consta de 5.862 conversaciones multirretorno en inglés filtradas, con 12.846 turnos de asistente y una mediana de 95 caracteres por respuesta, lo que orienta el modelo hacia réplicas cortas y de registro informal. No se documentan fases de RLHF ni DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles con estilo informal de foro (respuestas breves, coloquiales, sarcasticas).
- Transferencia de estilo (style-transfer): imitacion del registro de Reddit, incluyendo humor absurdo y lenguaje soez.
- Conversacion multirretorno breve: el dataset de entrenamiento esta compuesto por dialogos de varios turnos.
- Razonamiento, codigo y matematicas: heredados del modelo base Ministral-3-8B-Instruct; no se documenta su preservacion tras el ajuste.
- Tool calling / function calling: no disponible en la informacion proporcionada para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de dialogos sinteticos con estilos de foro: util para crear datasets de conversaciones informales en ingles (por ejemplo, para aumentar la diversidad de registros en un corpus de entrenamiento), dado que el modelo fue ajustado especificamente sobre ese tipo de intercambios.
- Prototipado de personajes conversacionales: el estilo breve y sarcastico encaja en bots de entretenimiento o simulaciones de comunidades online, donde se busca un tono no corporativo.
- Pruebas de robustez y evaluacion de seguridad: al producir salidas con sarcasmo y lenguaje soez, sirve como modelo de contraste para medir clasificadores de toxicidad o filtros de contenido.
- Investigacion sobre transferencia de estilo: checkpoint intermedio reproducible (QLoRA + Unsloth + GGUF) para estudiar como un ajuste de 2 epocas sobre 5.862 conversaciones modifica el registro de un modelo instructivo.
- Base para cuantizacion y despliegue local: al distribuirse en BF16 GGUF, permite generar variantes Q4_K_M o Q5_K_M con llama-quantize y ejecutarlas en llama.cpp, LM Studio u Ollama para experimentacion en hardware de consumo.
- Generacion de respuestas estilo Reddit para simulaciones de comunidad: util en entornos de prueba de plataformas sociales o analisis de dinamicas conversacionales, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16-17 GB solo para pesos, mas overhead de contexto; en la practica requiere GPUs de 24 GB o mas (RTX 3090/4090, A10, L4 de 24 GB) para inferencia comoda.
- VRAM estimada tras cuantizacion: Q8_0 en torno a 9 GB; Q6_K alrededor de 7 GB; Q5_K_M cerca de 6 GB; Q4_K_M en torno a 5 GB (estimaciones a partir de los 8,49 mil millones de parametros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para BF16 sin restricciones; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090, RTX 4070 Ti Super o GPUs de 12-16 GB para variantes Q4/Q5.
- Cabe en GPU de consumo: si, en versiones cuantizadas (Q4_K_M o Q5_K_M) en tarjetas de 8-12 GB; en BF16 solo en modelos de 24 GB o superiores.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (segun la model card); el tag endpoints_compatible sugiere compatibilidad con endpoints tipo Hugging Face. vLLM y TGI no se mencionan y su soporte para este GGUF no esta confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| reddit-Ministral-3-8B-Instruct-2512 (este) | 8,49 B | no disponible | en | no disponible | GGUF BF16 | Fine-tune de estilo Reddit, experimental |
| mistralai/Ministral-3-8B-Instruct-2512 | 8,49 B | no disponible | multilingue (segun modelo base) | no disponible | safetensors / GGUF | Modelo base instructivo de Mistral AI |
| mistralai/Ministral-8B-Instruct-2410 | 8 B aprox. | no disponible | multilingue | no disponible | safetensors / GGUF | Generacion anterior de Ministral 8B |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128 K | multilingue | Llama 3.1 Community License | safetensors / GGUF | Alternativa generalista de tamano similar |

La comparativa se limita a datos publicos de los modelos base; no hay benchmarks del fine-tune que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea degradado.
- Dataset sin curar de foros de internet: las salidas pueden incluir sarcasmo, lenguaje soez, humor absurdo o contenido ofensivo, tal como advierte el propio autor.
- Riesgo elevado de alucinacion y de respuestas fuera de tono en contextos profesionales; no apto para atencion al cliente ni produccion generalista sin filtros.
- Posible degradacion de capacidades del modelo base (razonamiento, codigo, instrucciones complejas) tras el ajuste de estilo, especialmente con solo 2 epocas y respuestas de mediana de 95 caracteres.
- Licencia no especificada en la informacion disponible; antes de cualquier uso comercial debe verificarse la licencia del modelo base Ministral-3-8B-Instruct-2512 y la del propio repositorio.
- Contexto de entrenamiento limitado a 2048 tokens; el uso con ventanas mas largas no esta validado.
- Checkpoint experimental e intermedio: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- La eliminacion del system message por defecto reduce el control sobre el comportamiento del modelo en despliegues con instrucciones de sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oatis123/reddit-Ministral-3-8B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Dataset de entrenamiento: https://huggingface.co/datasets/Oatis123/reddit-slop-dataset-v2
- Version cuantizada a 4 bits de Unsloth: https://huggingface.co/unsloth/Ministral-3-8B-Instruct-2512-unsloth-bnb-4bit
