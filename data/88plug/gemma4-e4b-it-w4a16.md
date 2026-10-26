# 88plug/Gemma4-E4B-it-W4A16

## Resumen

88plug/Gemma4-E4B-it-W4A16 es una cuantización de post-entrenamiento en INT4 (esquema W4A16) del modelo multimodal google/gemma-4-e4b-it, un Mixture-of-Experts disperso de Google con 128 expertos, atención híbrida deslizante + global y torre de visión SigLIP. La publica el usuario 88plug y su objetivo es reducir a la mitad el espacio de pesos (de ~28 GB en BF16 a ~14 GB) para que el modelo quepa en una única GPU de consumo de 24 GB, como una RTX 3090 o una RTX 4090, manteniendo las activaciones en BF16.

El interés práctico está en el formato: los pesos usan compressed-tensors, que vLLM detecta y carga de forma nativa desde la versión 0.21, sin necesidad de pasar la bandera `--quantization`. El autor la presenta como la primera cuantización W4A16 compatible con vLLM para Gemma4 E4B en el momento de la publicación. No se trata de un modelo nuevo, sino de un artefacto de despliegue: no aporta capacidades adicionales sobre el modelo base y su calidad depende enteramente del proceso de cuantización.

La ficha es relevante para quienes necesitan servir un VLM MoE en hardware limitado, pero conviene tratarla con cautela: la cuantización es provisional (RTN sin datos, con AutoRound bloqueado por incompatibilidades con las capas `q_proj.linear` de Gemma4), no hay benchmarks de calidad publicados, solo objetivos declarados, y el repositorio acumula 36 descargas y 0 likes, es decir, muy poca validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con 128 expertos, atención híbrida deslizante + global, torre de visión SigLIP y torre de audio (conservada en BF16); tipo `gemma4` |
| Parametros totales | 7.941.100.874 (~7,94 B) segun safetensors del repositorio; la model card del autor afirma "26B+" totales, discrepancia no resuelta en la informacion disponible |
| Parametros activos | ~4 B por token (MoE), segun la model card |
| Longitud de contexto | 32.768 tokens (valor de `--max-model-len` en el ejemplo de despliegue; el contexto nativo del modelo base no se declara) |
| Tipos de cuantizacion | W4A16: pesos INT4 simetricos (4 bits) con activaciones BF16; PTQ con RTN datafree mediante QuantizationModifier de llmcompressor; formato compressed-tensors (`pack-quantized` / `int-quantized`); sin GGUF, GPTQ ni AWQ publicados |
| Idiomas soportados | Ingles (`en`) declarado en la model card |
| Licencia | apache-2.0 declarada por el autor (verificar la licencia del modelo base google/gemma-4-e4b-it antes de uso comercial) |
| Formato de pesos | safetensors en compressed-tensors; tamano en disco ~14 GB (frente a ~28 GB en BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos dispersa: 128 expertos por bloque, de los cuales solo se activa una fraccion por token, lo que da ~4 B de parametros activos. Combina atención deslizante local con atención global en un esquema híbrido, e incorpora Per-Layer Embeddings (PLE) mediante `embed_tokens_per_layer` y `per_layer_model_projection`. Al ser multimodal, incluye una torre de visión SigLIP, un proyector cross-modal y, segun la receta de cuantización, una torre de audio. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base de Google, no al artefacto cuantizado.

La aportacion tecnica de este repositorio es la receta de cuantización, no el entrenamiento. Se aplica W4A16 a todas las capas `Linear` del backbone del LLM (`self_attn.{q,k,v,o}_proj` y `mlp.{gate,up,down}_proj` de todos los bloques) y se excluyen explicitamente, manteniendolas en BF16: `lm_head`, embeddings de tokens, layer norms, las capas PLE (`embed_tokens_per_layer` y `per_layer_model_projection`, cuya cuantización degrada catastróficamente la salida segun las ablaciones del autor), la torre de visión, la torre de audio y el proyector multimodal. El método es RTN sin datos; el autor senala que AutoRound quedo bloqueado por la estructura de hijos `q_proj.linear` de Gemma4 y que la cuantización se repetira cuando se corrija la cadena de herramientas.

## Capacidades

- Generacion de texto conversacional en ingles, con modo instruct (`-it`) heredado del modelo base.
- Procesamiento de imagen y texto (`image-text-to-text`): descripcion de imagenes, VQA y razonamiento sobre contenido visual, con la torre SigLIP intacta en BF16.
- Posible entrada de audio: la receta conserva `audio_tower` en BF16, aunque el pipeline declarado es image-text-to-text y no se documentan tareas de audio.
- Razonamiento multi-paso y matemáticas: capacidad heredada del modelo base, no medida en esta cuantización.
- Generacion de codigo: capacidad heredada del modelo base; no hay evaluacion especifica en el repositorio.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este artefacto.
- Soporte de agentes: no documentado en la informacion disponible.
- Multilingue: limitado al ingles segun el campo `language` de la model card.
- Servicio compatible con la API OpenAI a traves de vLLM (`vllm serve`, endpoints `/v1`).

## Casos de uso

- Asistente multimodal en una sola GPU de consumo: servir el modelo con vLLM en una RTX 3090 o 4090 permite responder consultas sobre imagenes con ~16 GB de VRAM total a 32k de contexto, algo inviable con los ~30 GB del BF16 en ese hardware.
- Analisis de documentos con imagenes y texto largo: con 32.768 tokens de ventana se pueden enviar capturas de pantalla, graficos o formularios junto con instrucciones extensas en una misma peticion.
- Prototipado de producto VLM en estaciones de trabajo: el formato compressed-tensors se carga directamente en vLLM sin configuracion extra, lo que reduce el tiempo de puesta en marcha de un endpoint compatible con OpenAI.
- Evaluacion comparativa de cuantizaciones: sirve como punto W4A16 frente a la variante W8A16 del mismo autor y al BF16 oficial para medir la perdida real de calidad en tareas propias.
- Backend de chat con contexto largo en ingles: 6.281-6.686 tok/s agregados medidos en la escalera de benchmarks del autor permiten atender varias conversaciones concurrentes en un solo nodo.
- Clasificacion y extraccion de informacion sobre imagenes en lotes: el bajo coste de pesos (~14 GB) deja margen de VRAM para cache KV en fp8 y procesamiento por lotes.
- Base para ajuste fino ligero o investigacion sobre MoE cuantizados: al mantener PLE, torres y `lm_head` en BF16, el artefacto preserva las partes mas sensibles para experimentos de adaptacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor solo declara objetivos, no mediciones: divergencia KL frente a BF16 < 0,014 y recuperacion de MMLU >= 99 %. El estado de FLAC figura como "no medido".

Los unicos datos medidos son de throughput, obtenidos con vLLM v0.21.0 y lm-evaluation-harness:

| Metrica | Resultado |
|---|---|
| Throughput total (in 2048 / out 512) | 6.646 tok/s (prompt + salida) |
| Throughput total (in 512 / out 256) | 6.281 tok/s (prompt + salida) |
| Throughput total (in 8192 / out 512) | 6.686 tok/s (prompt + salida) |

No se especifica en la informacion disponible el hardware exacto, el numero de GPUs ni el grado de concurrencia con el que se obtuvieron estas cifras, por lo que no son directamente comparables con otras publicaciones.

## Requisitos de hardware

- VRAM de pesos: ~14 GB en W4A16, frente a ~28 GB en BF16.
- Cache KV en fp8 a 32k de contexto: ~2,0 GB.
- Total estimado a 32k de contexto: ~16 GB (frente a ~30 GB en BF16).
- GPU minima declarada: 1x RTX 3090 de 24 GB. Tambien cabe en RTX 4090 de 24 GB.
- Para el modelo en BF16 haria falta al menos una A100 de 40 GB.
- No cabe en GPUs de 8, 12 o 16 GB con 32k de contexto segun los calculos del autor.
- Despliegue recomendado: vLLM >= 0.21 (imagen `vllm/vllm-openai:v0.21.0-cu129-ubuntu2404`), con deteccion automatica de compressed-tensors y sin flag `--quantization`; ejemplo con `--kv-cache-dtype fp8 --max-model-len 32768 --gpu-memory-utilization 0.90`.
- Alternativa: transformers con la libreria `compressed-tensors`; el soporte multimodal puede requerir codigo personalizado.
- No soportado: Text Generation Inference (TGI), que no carga el formato CT y produce errores opacos; el widget de inferencia de Hugging Face suele fallar.
- Sin soporte de llama.cpp u Ollama: no hay pesos GGUF publicados.
- SGLang: la model card incluye una seccion "SGLang" pero aparece vacia en la informacion disponible; no se confirma compatibilidad.
- Throughput medido: 6.281-6.686 tok/s agregados (prompt + salida) segun la escalera del autor; latencia por peticion no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| 88plug/Gemma4-E4B-it-W4A16 | compressed-tensors W4A16 | ~7,94 B (safetensors); ~4 B activos | 32.768 tokens (config. de despliegue) | apache-2.0 | Objeto de esta ficha; primera W4A16 vLLM-native para Gemma4 E4B segun el autor |
| google/gemma-4-e4b-it | BF16 safetensors | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Techo de calidad; requiere ~28 GB de pesos |
| RedHatAI/gemma-3n-E4B-it-quantized.w4a16 | compressed-tensors W4A16 | no disponible | no disponible | no disponible | Mismo formato, generacion anterior (Gemma 3n) |
| 88plug/Gemma4-E4B-it-W8A16 | compressed-tensors W8A16 | no disponible | no disponible | apache-2.0 (declarada) | Variante de mayor precision del mismo autor; mas VRAM, presumiblemente menos perdida de calidad |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion provisional: RTN sin datos, no AutoRound; el autor indica que la receta se repetira cuando se desbloquee la cadena de herramientas. Los pesos actuales no deben considerarse definitivos.
- Sin mediciones de calidad publicadas: solo objetivos (KL < 0,014, MMLU >= 99 %). El riesgo real de degradacion frente a BF16 es desconocido.
- FLAC no medido, segun la propia model card.
- Solo ingles declarado; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Discrepancia de parametros: el safetensors suma ~7,94 B totales mientras la model card habla de "26B+". Conviene verificar la cifra antes de dimensionar infraestructura.
- El pipeline Hugging Face suele fallar al cargar estos pesos; la validacion debe hacerse con vLLM en local.
- TGI no es compatible: si la infraestructura depende de TGI, este artefacto no es una opcion.
- Sin GGUF: no desplegable en llama.cpp, Ollama ni entornos CPU-only.
- La torre de vision, la torre de audio, el proyector y las capas PLE siguen en BF16, de modo que el ahorro de VRAM no cubre esas partes y el modelo no baja de cierto suelo de memoria.
- Riesgo de alucinacion inherente a un modelo de ~4 B activos, no cuantificado en esta variante; mayor en tareas de OCR fino, tablas densas y razonamiento aritmetico largo.
- Licencia: el autor declara apache-2.0, pero el modelo base es de Google. Es imprescindible revisar los terminos de Gemma 4 antes de un uso comercial.
- Validacion comunitaria minima: 36 descargas y 0 likes en el momento de la consulta. No hay informes independientes de calidad ni de estabilidad en produccion.
- Seccion SGLang vacia en la model card: no se confirma soporte de ese runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88plug/Gemma4-E4B-it-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Variante de mayor precision del mismo autor: https://huggingface.co/88plug/Gemma4-E4B-it-W8A16
- Cuantizacion comparable de la generacion anterior: https://huggingface.co/RedHatAI/gemma-3n-E4B-it-quantized.w4a16
- Documentacion de vLLM: https://docs.vllm.ai
- llmcompressor (herramienta de cuantizacion citada): https://github.com/vllm-project/llmcompressor
- compressed-tensors (formato de pesos): https://github.com/neuralmagic/compressed-tensors
