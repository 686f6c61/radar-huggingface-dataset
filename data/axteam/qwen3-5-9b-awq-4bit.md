# axteam/Qwen3.5-9B-AWQ-4bit

## Resumen

`axteam/Qwen3.5-9B-AWQ-4bit` es una cuantización de 4 bits del modelo denso multimodal `Qwen/Qwen3.5-9B` del equipo Qwen (Alibaba), publicada por el usuario axteam para servir el modelo con vLLM de forma eficiente. Se trata de una cuantización post-entrenamiento (PTQ) con AWQ en esquema W4A16: pesos INT4 asimétricos en grupos de 32 con escalas BF16 y activaciones en BF16, almacenados en el formato `pack-quantized` de compressed-tensors. El repositorio ocupa unos 8,8 GB en disco y declara 9.409.813.744 parámetros totales.

El modelo base es un transformer híbrido que combina capas de atención lineal y atención completa, con torre de visión (pipeline `image-text-to-text`) y una cabeza de predicción multi-token (MTP), probablemente orientada a decodificación especulativa. La cuantización mantiene en BF16 la torre y el proyector de visión, la cabeza MTP, todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del módulo SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), de modo que solo se cuantizan las matrices lineales principales.

Su relevancia práctica es servir un modelo de ~9,4 B multimillonario en GPUs de gama media: reduce el peso en disco y en VRAM frente al BF16 original manteniendo una fidelidad medida de 90,9 % de acuerdo top-1 en el siguiente token y un incremento de perplejidad del 6,2 % sobre el original. La licencia Apache-2.0 del modelo base se hereda, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión) con cabeza MTP |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; fuentes externas citan 262K-1M para el modelo base |
| Tipos de cuantizacion | AWQ INT4 W4A16 (pesos INT4 asimétricos, grupo 32, escala BF16 + zero-point INT4, activaciones BF16), formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (calibración realizada con corpus mixto inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), ~8,8 GB en disco |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que intercala mecanismos de atención lineal con capas de atención completa, lo que reduce el coste de memoria de la caché KV en contextos largos. Es un modelo denso de 9,4 B de parámetros, con torre de visión integrada (pipeline `image-text-to-text`) y una cabeza de predicción multi-token (MTP) que, en modelos de esta familia, se usa para decodificación especulativa y aceleración de la generación. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

Esta ficha describe una cuantización, no un entrenamiento nuevo: axteam aplicó AWQ (post-training quantization, sin gradientes) sobre el checkpoint BF16, usando un conjunto de calibración de 256 muestras con predominio de coreano. AWQ desplaza escalas por canal antes del redondeo para proteger los canales de peso más relevantes. Los módulos sensibles se mantuvieron en BF16: `model.visual.*` (torre y proyector de visión), `mtp.*`, todas las RMSNorm, embeddings de tokens, LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). El tokenizer, la `chat_template` y el `generation_config` son idénticos a los del original, y `config.json` añade únicamente el bloque `quantization_config`.

## Capacidades

- Generación de texto y conversación multi-turno con la plantilla de chat original de Qwen.
- Comprensión de imagen y texto (`image-text-to-text`): la torre de visión se conserva íntegra en BF16.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, sin evaluación específica publicada en esta cuantización.
- Generación de código: heredada del modelo base; no hay resultados de HumanEval ni similares en la información disponible.
- Decodificación multi-token mediante la cabeza MTP conservada en BF16 (útil para decodificación especulativa en vLLM).
- Multilingüismo: no declarado formalmente; la calibración se hizo con corpus inglés/coreano, lo que puede favorecer esos idiomas.
- Tool calling / function calling y uso como agente: no confirmado en la información disponible para esta variante cuantizada.
- Parámetros de muestreo recomendados por Qwen: `temperature=0.7`, `top_p=0.8`, `top_k=20`.

## Casos de uso

- Servicio de chat multimodal en producción con vLLM: `vllm serve axteam/Qwen3.5-9B-AWQ-4bit` levanta un endpoint compatible con la API de OpenAI, lo que permite sustituir un modelo en la nube por uno autoalojado con ~8,8 GB de pesos.
- Asistente sobre documentos con imágenes: al conservar la torre de visión en BF16, mantiene la calidad de percepción visual para OCR ligero, descripción de capturas o extracción de datos de formularios escaneados.
- Clasificación y extracción de información por lotes: con 4 bits y vLLM se puede procesar un volumen alto de peticiones cortas en una sola GPU de 16-24 GB, reduciendo coste por token frente al BF16.
- Prototipado en estación de trabajo: cabe en GPUs de consumo de 12-16 GB, lo que permite iterar en local sobre prompts, plantillas de chat y pipelines de visión sin infraestructura dedicada.
- Generación aumentada por recuperación (RAG): la ventana de contexto larga del modelo base (262K-1M según fuentes externas) permite inyectar varios documentos, aunque la caché KV a esas longitudes exige planificación de VRAM.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de fidelidad de AWQ frente a BF16 en un mismo arnés, dado que el autor publica perplejidad y acuerdo top-1.
- Backend de agentes con decodificación especulativa: la cabeza MTP conservada en BF16 puede explotarse en vLLM para acelerar la generación en flujos multi-paso.

## Benchmarks y rendimiento

El autor solo publica métricas de fidelidad frente al BF16 original, no puntuaciones de tareas. La evaluación se hizo sobre un conjunto interno mixto inglés/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada variante y el mismo arnés para todas las filas.

| Metrica | Este modelo (AWQ INT4) | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,5403 | 1,4506 (+6,2 %) |
| Acuerdo top-1 en el siguiente token | 90,9 % | 99,2 % |

No se han publicado resultados de benchmarks de tareas (MMLU, MMLU-Pro, GPQA Diamond, HumanEval, GSM8K, MMMLU) en la informacion disponible para esta cuantizacion. Fuentes web externas afirman que el modelo base Qwen3.5-9B supera a Qwen3-30B en la mayoria de benchmarks y a gpt-oss-120b en GPQA Diamond, MMLU-Pro y MMMLU, pero no se aportan cifras en la informacion consultada, por lo que no se reproducen numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 9-10 GB solo para pesos (los ~8,8 GB del checkpoint mas overhead del runtime); con cache KV y contexto moderado, 12-16 GB es un objetivo realista.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), L40S (48 GB) para mayor concurrencia, A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070 12 GB) para contexto corto; 16 GB da margen para vision y lotes mayores.
- Opciones de despliegue: vLLM es el backend recomendado y el unico validado explicitamente por el autor (`vllm serve axteam/Qwen3.5-9B-AWQ-4bit`). El formato compressed-tensors `pack-quantized` no es portable directamente a llama.cpp ni a Ollama; para esos entornos hay que buscar una conversion GGUF alternativa del modelo base.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.
- Nota sobre contexto largo: a 262K-1M tokens la cache KV domina el consumo de VRAM y puede superar ampliamente los pesos, incluso en INT4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `axteam/Qwen3.5-9B-AWQ-4bit` | ~9,4 B | no disponible (262K-1M en el base segun fuentes) | AWQ INT4 W4A16, grupo 32 | Apache-2.0 | Calibrado con corpus coreano/ingles; vision y MTP en BF16 |
| `Qwen/Qwen3.5-9B` (BF16) | ~9,4 B | 262K-1M segun fuentes web | BF16 | Apache-2.0 | Referencia de calidad; ~2x peso en disco y VRAM |
| `cyankiwi/Qwen3.5-9B-AWQ-4bit` (ModelScope) | ~9,4 B | no disponible | AWQ 4 bits | Apache-2.0 (heredada) | Cuantizacion equivalente de otro autor; sin datos comparativos de calibracion |
| `gpt-oss-120b` | ~120 B (MoE) | no disponible | nativa MXFP4 | Apache-2.0 | Categoria distinta por tamano; citado en prensa como referencia superada por Qwen3.5-9B en GPQA Diamond y MMLU-Pro |

No se dispone de datos verificables de rendimiento en tareas para estas variantes, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion degrada la fidelidad: +6,2 % de perplejidad y 90,9 % de acuerdo top-1 frente al BF16 implican que aproximadamente 1 de cada 11 predicciones greedy cambia respecto al original.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion puede amplificarlo en tareas de razonamiento largo o con contextos muy extensos.
- La calibracion se hizo con solo 256 muestras de un corpus con predominio de coreano; el comportamiento en castellano y en otros idiomas no esta evaluado y podria desviarse mas que en ingles.
- Idiomas soportados no declarados oficialmente en esta variante.
- El checkpoint no incluye `tokenizer_config` propio: depende de la `chat_template` del modelo base, por lo que conviene fijar la version del tokenizer al desplegar.
- Requiere kernels compatibles con compressed-tensors (vLLM); no funciona directamente en llama.cpp, Ollama o TGI sin conversion previa.
- La vision y la cabeza MTP se mantienen en BF16, de modo que el ahorro de VRAM es menor que el de una cuantizacion INT4 completa.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero obliga a conservar avisos de licencia y atribucion a Qwen; los pesos, tokenizer y chat template pertenecen al equipo Qwen.
- Repositorio con 0 descargas y 0 likes, creado el 2026-10-27: conviene verificar la integridad y procedencia antes de usarlo en produccion.
- No hay resultados publicados de benchmarks de tareas para esta variante; las afirmaciones de rendimiento del modelo base provienen de terceros y no se han podido contrastar con cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-9B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Ficha de Qwen3.5-9B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Especificaciones y requisitos de VRAM (apxml): https://apxml.com/models/qwen35-9b
- Cuantizacion equivalente en ModelScope (cyankiwi): https://www.modelscope.cn/models/cyankiwi/Qwen3.5-9B-AWQ-4bit
- Analisis en XDA Developers: https://www.xda-developers.com/qwen-3-5-9b-tops-ai-benchmarks-not-how-pick-model/
- Listado de cuantizaciones de Qwen3.5-9B en HuggingFace: https://huggingface.co/models?other=base_model:quantized:Qwen/Qwen3.5-9B
