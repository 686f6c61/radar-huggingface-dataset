# Pokoinick/dolphin-2.6-mistral-7B-dpo-laser-GGUF

## Resumen

Esta ficha describe el repositorio `Pokoinick/dolphin-2.6-mistral-7B-dpo-laser-GGUF`, una publicación de pesos en formato GGUF derivada de `cognitivecomputations/dolphin-2.6-mistral-7b-dpo-laser`, el modelo Dolphin 2.6 Mistral 7B creado por Cognitive Computations y alineado mediante DPO. El modelo original es un ajuste fino del Mistral 7B (`model_type: mistral`), orientado a conversación e instrucciones, con plantilla de prompt ChatML y licencia Apache 2.0.

El repositorio aquí analizado contiene únicamente archivos cuantizados (GGUF), pensados para inferencia en CPU y GPU mediante llama.cpp y sus derivados, no los pesos originales en precisión completa (fp16). El propietario del repositorio es Pokoinick, mientras que la model card incluida atribuye la cuantización a TheBloke y el desarrollo del modelo base a Cognitive Computations. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y un tamaño total de 55,0 GB, coherente con un conjunto de múltiples variantes de cuantización.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 7.241.740.288 parámetros (7,24 mil millones) en hardware de consumo, con licencia Apache 2.0 y sin restricciones de uso comercial declaradas en la metadata del repositorio, siempre que se respeten las condiciones de la licencia del modelo base. La información disponible no incluye resultados de benchmarks propios ni detalles de entrenamiento más allá de la lista de datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (model_type: mistral); incluye sliding window attention y grouped-query attention segun la arquitectura Mistral 7B |
| Parametros totales | 7.241.740.288 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens segun la arquitectura Mistral 7B; no confirmado de forma explicita en la model card del repositorio GGUF |
| Tipos de cuantizacion | GGUF de 2, 3, 4, 5, 6 y 8 bits (el README describe metodos tipo Q2_K y similares; el listado de repositorios de TheBloke menciona 2, 3, 4, 5, 6 y 8 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (GGUFv2; compatible con llama.cpp desde el commit d0cee0d del 27 de agosto de 2023) |

## Arquitectura y entrenamiento

El modelo base es un Mistral 7B: un transformer decoder-only con atención causal, mecanismo de ventana deslizante (sliding window attention) y grouped-query attention, entrenado originalmente con una ventana de contexto de 32.768 tokens. Sobre esta base, Cognitive Computations aplicó un ajuste fino supervisado seguido de una etapa de alineación con DPO (Direct Preference Optimization), que es lo que el sufijo "dpo" del nombre indica. La model card de este repositorio no aporta el número de tokens de entrenamiento ni la composición exacta de las mezclas, solo la lista de datasets utilizados.

Los datasets declarados en la metadata del repositorio son: `ehartford/dolphin`, `jondurbin/airoboros-2.2.1`, `ehartford/dolphin-coder`, `teknium/openhermes`, `ise-uiuc/Magicoder-OSS-Instruct-75K`, `ise-uiuc/Magicoder-Evol-Instruct-110K` y `LDJnr/Capybara`. La presencia de Magicoder y dolphin-coder indica una carga deliberada de datos de código, mientras que OpenHermes, Airoboros, Capybara y Dolphin aportan instrucciones generales, razonamiento y diálogo. La plantilla de prompt es ChatML (`<|im_start|>system ... <|im_end|>`), lo que facilita la integración con servidores compatibles con OpenAI. No se documentan innovaciones técnicas adicionales propias de esta versión cuantizada más allá del propio proceso de cuantización GGUF.

## Capacidades

- Generación de texto conversacional multi-turno en inglés con formato de chat ChatML.
- Seguimiento de instrucciones y respuesta a preguntas de propósito general, derivado de la mezcla Dolphin, OpenHermes, Airoboros y Capybara.
- Generación y asistencia de código, reforzada por los datasets dolphin-coder, Magicoder-OSS-Instruct-75K y Magicoder-Evol-Instruct-110K.
- Razonamiento de tipo cadena de pensamiento básico, inducido por los datasets de instrucciones y preferencias, aunque sin un "modo thinking" explícito documentado.
- Ejecución local sin conexión a servicios externos, gracias al formato GGUF.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la metadata (`language: en`).
- Capacidades especiales (visión, audio, embeddings): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede mantener diálogos multi-turno en inglés con una ventana de contexto de hasta 32.768 tokens (según la arquitectura Mistral 7B), ejecutándose en un portátil con GPU de gama media mediante una cuantización Q4_K_M de unos 4,4 GB.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, permite autocompletar y explicar código sin enviar el repositorio a una API externa, algo crítico en sectores regulados.
- Prototipado rápido de aplicaciones de IA generativa: sirve como modelo de referencia barato para validar plantillas ChatML, prompts de sistema y flujos de evaluación antes de migrar a modelos mayores.
- Análisis y resumen de documentación técnica en inglés: con 7,24 mil millones de parámetros y contexto largo, puede procesar documentos extensos por fragmentos y producir resúmenes estructurados en una sola pasada.
- Bots de atención al cliente en inglés para pymes: el coste de inferencia en hardware propio es bajo y la licencia Apache 2.0 permite integrarlo en productos comerciales sin negociación previa de licencia.
- Fine-tuning posterior y adaptación de dominio: al ser un modelo pequeño con licencia permisiva, es un punto de partida habitual para LoRA/QLoRA sobre datos propios en una única GPU de 24 GB.
- Investigación en alineación y evaluación de DPO: el repositorio permite comparar la variante DPO frente al ajuste supervisado original de Dolphin 2.6, usando las distintas cuantizaciones para controlar el efecto de la precisión.
- Generación de datos sintéticos en pipelines internos: puede producir pares instrucción-respuesta en inglés para preentrenar o afinar otros modelos, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones para un modelo de 7,24 mil millones de parámetros): aproximadamente 3,0-3,5 GB en Q2_K, 4,4 GB en Q4_K_M, 5,1-5,4 GB en Q5_K_M, 6,2 GB en Q6_K y 7,7-8,0 GB en Q8_0; en fp16 el modelo completo requiere unos 14,5 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 para uso en GPU única; A100 40/80 GB y H100 para despliegues con muchas peticiones concurrentes o contexto completo de 32.768 tokens.
- Compatibilidad con GPU de consumo: sí. Cualquier GPU con 8 GB o más de VRAM puede ejecutar las cuantizaciones de 4 y 5 bits; con 6 GB es viable Q4 en GPU parcial o con offload mixto CPU/GPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), text-generation-webui, KoboldCpp, GPT4All, LM Studio, LoLLMS Web UI, Faraday.dev, llama-cpp-python (con API compatible con OpenAI y soporte de LangChain), candle y ctransformers (este último sin mantenimiento reciente según el propio README).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, de la cuantización elegida y del tamaño de contexto utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / disponibilidad | Licencia | Notas |
|---|---|---|---|---|---|
| Dolphin 2.6 Mistral 7B DPO Laser (este repositorio, GGUF) | 7,24 mil millones | 32.768 tokens (arquitectura Mistral; no confirmado en la card) | GGUF de 2 a 8 bits | apache-2.0 | Cuantización de terceros; 0 descargas registradas |
| Dolphin 2.6 Mistral 7B DPO Laser (original, fp16) | 7,24 mil millones | 32.768 tokens | safetensors / PyTorch fp16 | apache-2.0 | Pesos sin cuantizar de Cognitive Computations; referencia para comparar el efecto de la cuantización |
| Mistral 7B Instruct v0.2 | ~7,24 mil millones | 32.768 tokens | safetensors, GGUF, GPTQ, AWQ | apache-2.0 | Alternativa de propósito general con ecosistema de cuantizaciones muy amplio |
| Llama 3.1 8B Instruct | ~8 mil millones | 131.072 tokens | safetensors, GGUF | Llama 3.1 Community License | Contexto mucho mayor y licencia con cláusulas adicionales (no Apache 2.0) |

Los datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) no están disponibles en la información proporcionada para este repositorio, por lo que la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Los datasets de instrucciones de origen anglosajón tienden a introducir sesgos culturales y de género, pero no hay evaluación publicada para esta variante concreta.
- Riesgo de alucinación: inherente a un modelo de 7,24 mil millones de parámetros sin mecanismos de verificación. La cuantización agresiva (2 y 3 bits) degrada adicionalmente la fidelidad de las respuestas.
- Limitación de idioma: la metadata declara únicamente inglés (`language: en`). El rendimiento en castellano no está garantizado y probablemente sea muy inferior.
- Limitación de contexto: el valor de 32.768 tokens procede de la arquitectura Mistral 7B y no está confirmado de forma explícita en la model card de este repositorio; conviene verificar el parámetro `n_ctx` configurado en llama.cpp, ya que por defecto suele ser 4.096.
- Restricciones de licencia: la metadata indica apache-2.0, lo que en principio permite uso comercial. No obstante, el repositorio es una redistribución de terceros y la responsabilidad de verificar la cadena de licencias (modelo base, datasets y pesos del autor original) recae en quien despliega.
- Calidad de la cuantización: los archivos fueron producidos por un tercero distinto del autor del modelo; no se documentan evaluaciones comparativas frente a los pesos originales en fp16.
- Advertencia sobre el repositorio: registra 0 descargas y 0 "likes", con fecha de creación y actualización idénticas, lo que sugiere una réplica o publicación sin tracción verificable. El tamaño de 55,0 GB implica además que la descarga completa del conjunto de cuantizaciones es costosa.
- Tool calling y uso agéntico: no están documentados, por lo que cualquier integración de este tipo requeriría validación empírica previa.
- Producción: al no existir benchmarks publicados ni métricas de latencia, no se recomienda su uso en sistemas críticos sin una evaluación propia y un plan de mitigación de alucinaciones.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Pokoinick/dolphin-2.6-mistral-7B-dpo-laser-GGUF
- Modelo base (Cognitive Computations): https://huggingface.co/cognitivecomputations/dolphin-2.6-mistral-7b-dpo-laser
- Cuantizaciones GGUF de referencia de TheBloke: https://huggingface.co/TheBloke/dolphin-2.6-mistral-7B-dpo-laser-GGUF
- Cuantizaciones AWQ de referencia: https://huggingface.co/TheBloke/dolphin-2.6-mistral-7B-dpo-laser-AWQ
- Cuantizaciones GPTQ de referencia: https://huggingface.co/TheBloke/dolphin-2.6-mistral-7B-dpo-laser-GPTQ
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Commit de compatibilidad GGUFv2: https://github.com/ggerganov/llama.cpp/commit/d0cee0d36d5be95a0d9088b674dbb27354107221
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- GPT4All: https://gpt4all.io/index.html
- LM Studio: https://lmstudio.ai/
- LoLLMS Web UI: https://github.com/ParisNeo/lollms-webui
- Faraday.dev: https://faraday.dev/
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- candle: https://github.com/huggingface/candle
- ctransformers: https://github.com/marella/ctransformers
- Referencia arXiv incluida en los tags del repositorio: https://arxiv.org/abs/2312.13558
- Discord de soporte de TheBloke: https://discord.gg/theblokeai
