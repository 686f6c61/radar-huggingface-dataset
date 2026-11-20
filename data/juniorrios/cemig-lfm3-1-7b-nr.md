# juniorrios/cemig-lfm3-1.7b-nr

## Resumen

cemig-lfm3-1.7b-nr es un ajuste fino (fine-tuning) del modelo LiquidAI/LFM3-1.7B orientado a un caso de uso muy concreto: un asistente offline de seguridad laboral en portugués de Brasil que responde citando las 36 Normas Regulamentadoras (NR) brasileñas y 9 manuales oficiales del Ministerio de Trabajo (MTE). Lo desarrolla el usuario juniorrios en el contexto de una prueba de concepto CEMIG/CEIA, y su propósito es funcionar como motor RAG local en un teléfono móvil, sin conexión, con recuperación de fragmentos y respuesta con cita de norma e ítem.

El modelo parte de la arquitectura LFM3 de Liquid AI (1.728.801.536 parámetros totales, pesos en bf16) y se ha adaptado mediante dos etapas de LoRA r=32 aplicadas solo a las capas MLP, con datos de entrenamiento 100% sintéticos generados a partir del texto público de las NR. La variante v1.1 (v3s400) añade un mini-RLVR de groundedness con GRPO/DAPO (400 pasos) y una recompensa verificable por regla, que reduce la alucinación frente a distractores.

Su relevancia actual es doble: por un lado, demuestra un pipeline RAG completamente determinista y ejecutable en local (BM25 FTS5, embeddings densos, RRF, compresión de contexto) empaquetado con código de inferencia autocontenido; por otro, distribuye pesos en safetensors bf16 y GGUF Q4_0/Q4_K_M junto con un APK Android, lo que lo convierte en un ejemplo práctico de despliegue de un LLM pequeño en el borde para un dominio regulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (Liquid AI), con código propio (`modeling_lfm3.py`, `lfm3_conv.py`); fine-tuning LoRA r=32 solo en MLP |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q4_0 (1,05 GB), GGUF Q4_K_M (1,10 GB) |
| Idiomas soportados | pt (portugués, orientado a PT-BR) |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial sujeto al límite de ingresos de la Sección 5 (10 millones USD/año) |
| Formato de pesos | safetensors (bf16), GGUF (Q4_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-1.7B en su variante instruct, sobre el que se aplicaron dos etapas de LoRA con rango 32 limitadas a los módulos MLP (`w1/w2/w3`, 72 módulos) y entrenamiento SFT de chat con `assistant_only_loss`. Los datos son 100% sintéticos y generados a partir del texto público de las NR, sin datos de clientes ni preguntas del conjunto de evaluación. La primera etapa (F3b `data2x-ep4`, 4 épocas) entrena el uso robusto del contexto recuperado: fragmentos correctos, distractores y rechazo cuando el fragmento no responde. La segunda etapa (F4 `f4-r32-ep2`) entrena el tool calling con el formato XML de herramientas de LFM3 (`buscar_norma`).

La variante v1.1 (v3s400) parte de `f4-r32-ep2` y añade un mini-RLVR de groundedness con GRPO/DAPO durante 400 pasos, con recompensa verificable por regla, y se funde de nuevo con LoRA. El pipeline de inferencia es determinista en la parte de recuperación: clasificador de NR basado en TF-IDF + regresión logística, BM25 sobre FTS5 (36 NR, 2202 fragmentos), recuperación densa con EmbeddingGemma-300M, fusión RRF con k=10 y pesos (2, 1, 2 y 1,75 para manuales), y compresión del contexto al 50% de tokens del top-2 crudo mediante ventanas de 3 unidades con coseno, peso léxico 0,3 y bonus de rango 0,05/(rank+1). La generación usa temperatura 0,1, top_k 50, repetición 1,1 y semilla 42, con el modo thinking desactivado.

## Capacidades

- Generación de texto conversacional en portugués de Brasil con citación explícita de norma e ítem.
- Respuesta fundamentada (grounded) sobre fragmentos recuperados de las 36 NR y 9 manuales oficiales del MTE.
- Tool calling mediante la herramienta `buscar_norma` en el formato XML de LFM3.
- Rechazo explícito cuando el fragmento recuperado no responde a la pregunta.
- Tolerancia a distractores en el contexto recuperado (mejorada en la variante v1.1 con RLVR).
- Comprensión de preguntas coloquiales y de entradas procedentes de ASR (expansión robusta a errores de reconocimiento de voz).
- Ejecución offline en dispositivo móvil mediante GGUF y llama.cpp.
- No dispone de capacidades de visión, audio ni modo thinking activado en producción.

## Casos de uso

- Asistente de seguridad laboral offline en campo: el modelo responde consultas sobre bloqueos, etiquetas y procedimientos citando la NR y el ítem exacto, sin conectividad, gracias al GGUF Q4_0 y a la recuperación local sobre 2202 fragmentos.
- Consulta de normativa durante la inspección de turnos: un técnico pregunta "¿cuándo cambiar de turno hay que cambiar los bloqueos y las etiquetas?" y recibe la respuesta con la fuente normativa, adecuada para su registro documental.
- Integración con reconocimiento de voz en Android: el pipeline incluye guía de integración del ASR Nemotron 3.5 y un WAV de prueba en PT-BR, de modo que el modelo procesa transcripciones ruidosas mediante la expansión ASR-robusta del recuperador.
- Formación y onboarding de personal: el modo `--retrieval-only` permite mostrar solo la búsqueda y la compresión, útil para auditar qué fragmentos sustentan cada respuesta antes de usarla en material formativo.
- Auditoría de respuestas reguladas: la salida incluye fuentes usadas y los fragmentos exactos entregados al modelo, lo que facilita la revisión humana y la trazabilidad en un dominio sujeto a normativa.
- Procesamiento por lotes de preguntas: `--file perguntas.txt` y `--json` permiten ejecutar baterías de consultas y obtener un objeto JSON por pregunta para su análisis posterior o su incorporación a un sistema de tickets.
- Despliegue en producción móvil: el APK v1.2 descarga los modelos en el primer uso y ejecuta el motor en el dispositivo, lo que evita enviar consultas internas a servicios en la nube.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la batería interna de la POC, evaluada con un juez de 27B, y comparan `f4-r32-ep2` (v1.0) con `v3s400` (v1.1):

| Metrica | f4-r32-ep2 (v1.0) | v3s400 (v1.1) |
|---|---|---|
| Alucinación en distractor ×1536 | 23,8% | 15,7% |
| Fin a fin de la app ×1536 | 64,1% | 71,8% |
| 151 preguntas coloquiales de la POC | 12,6% | 21,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card indica además que el GGUF Q4_K_M retiene más calidad que el Q4_0 (−2,3 frente a −4,9 puntos porcentuales respecto a bf16), a costa de un prefill un 25% más lento en el teléfono.

## Requisitos de hardware

- Inferencia en bf16: los pesos safetensors suman aproximadamente 3,5 GB (1,73 mil millones de parámetros a 2 bytes), por lo que se recomienda una GPU con al menos 6-8 GB de VRAM para dejar margen al contexto y al recuperador.
- GGUF Q4_0: 1,05 GB de pesos; Q4_K_M: 1,10 GB. Ambos caben holgadamente en GPUs de consumo y en memoria de teléfonos de gama media-alta.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, una RTX 4090 o una A100/H100 son sobredimensionadas para el modelo, y una GPU de consumo con 8 GB o más es suficiente para bf16.
- Despliegue: llama.cpp (el `requirements.txt` fija un commit que reconoce la arquitectura LFM3, ya que la versión 0.3.36 del PyPI no la soporta), transformers ≥ 5.20 con `trust_remote_code`, y el APK Android v1.2 para ejecución en dispositivo. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no se publican cifras absolutas; solo la comparación relativa de prefill entre Q4_0 y Q4_K_M (este último un 25% más lento en el teléfono).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cemig-lfm3-1.7b-nr | 1.728.801.536 | no disponible | LFM Open License v1.0 (límite 10 M USD/año) | Hugging Face, safetensors + GGUF + APK | Especializado en NR brasileñas con RAG y tool calling |
| LiquidAI/LFM3-1.7B (base) | ~1,7 mil millones | no disponible | LFM Open License v1.0 | Hugging Face | Modelo generalista instruct; sin adaptación al dominio ni pipeline RAG |
| Alternativas de 1-2B para RAG en el borde | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada modelos comparables con el mismo enfoque de dominio |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en portugués de Brasil; su rendimiento fuera de ese idioma no está documentado.
- Los datos de entrenamiento son 100% sintéticos y derivados del texto público de las NR, lo que puede introducir sesgos de cobertura hacia los temas y formulaciones presentes en esas fuentes.
- Persiste un riesgo de alucinación medido: 15,7% en la batería de distractores de la variante v1.1, por lo que la respuesta debe tratarse como asistencia y no como sustituto de la norma oficial.
- El uso comercial está sujeto a la LFM Open License v1.0 y al límite de ingresos de 10 millones de USD anuales de la Sección 5; superarlo requiere licencia adicional de Liquid AI.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar despliegues con ventanas largas.
- El pipeline depende de artefactos de recuperación externos (dataset `juniorrios/cemig-nr-retrieval-assets`) y de una versión concreta de llama-cpp-python que reconozca LFM3; la versión del PyPI 0.3.36 no es compatible.
- La compilación de llama-cpp-python requiere cmake y compilador de C++, lo que añade fricción al despliegue.
- El APK v1.2 descarga los modelos en el primer uso, por lo que la primera apertura necesita conectividad.
- No se han publicado resultados en benchmarks estándar, lo que limita la comparación objetiva con otros modelos de su tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de artefactos de recuperación: https://huggingface.co/datasets/juniorrios/cemig-nr-retrieval-assets
- Código de inferencia: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/resolve/main/inference.py
- Requisitos: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/resolve/main/requirements.txt
- Requisitos para transformers: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/resolve/main/requirements-hf.txt
- Licencia LFM Open License v1.0: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/blob/main/LICENSE
- Guía de integración ASR Nemotron: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/blob/main/docs/GUIA_ASR_NEMOTRON.md
- Guía de agente ASR: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/blob/main/docs/AGENT_GUIDE_ASR.md
- WAV de prueba PT-BR: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/blob/main/docs/asr_teste_ptbr.wav
- APK Android v1.2: https://huggingface.co/juniorrios/cemig-lfm3-1.7b-nr/blob/main/apk/cemig-assistente-v1.2.apk
