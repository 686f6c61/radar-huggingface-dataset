# axteam/Qwen3.6-35B-A3B-NVFP4

## Resumen

Qwen3.6-35B-A3B-NVFP4 es una versión cuantizada en 4 bits (NVFP4, W4A4) del modelo Qwen3.6-35B-A3B de Qwen, producida por el usuario axteam y orientada específicamente al despliegue eficiente con vLLM. El modelo base es un MoE multimodal híbrido de aproximadamente 35B de parámetros totales, de los cuales unos 3B se activan por token, lo que permite una inferencia muy ágil pese al tamaño total. La cuantización se ha realizado mediante post-training quantization (PTQ) sin reentrenamiento, manteniendo en BF16 los componentes más sensibles como la torre de visión, el router MoE y toda la ruta de atención lineal (GatedDeltaNet/SSM).

Este modelo resuelve el problema clásico del despliegue de modelos grandes: reduce el tamaño en disco de unos 70 GB (BF16 estimado) a unos 23,3 GB, permitiendo servir el modelo en menos VRAM. Es relevante ahora porque aprovecha los tensor cores FP4 de las GPU Blackwell (B200) de NVIDIA, y porque el propio autor advierte con datos medidos de que este MoE ultra-esparsa es sensible a la cuantización a 4 bits (+32,9 % de perplexity frente al original), recomendando las variantes de 8 bits para producción. Incluye soporte de imágenes (pipeline image-text-to-text), modo thinking y cabecera MTP (multi-token prediction).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal GatedDeltaNet/SSM + atención completa) · MoE (256 expertos + experto compartido) · multimodal (visión) · cabecera MTP |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa 32768 tokens con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1, grupo 16, escalas FP8 E4M3 + escala global FP32); componentes sensibles en BF16 |
| Idiomas soportados | no disponible (el corpus de calibración es mixto inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B combina una arquitectura híbrida de atención lineal (GatedDeltaNet, tipo SSM) con capas de atención completa, un enfoque que reduce el coste del KV cache en secuencias largas. Es un MoE esparsa con 256 expertos más un experto compartido, activando unos 3B de los 35B totales por token. Es multimodal (entrada de imagen y texto) e incorpora una cabecera de multi-token prediction (MTP), que puede habilitar decodificación especulativa en despliegues compatibles.

La cuantización NVFP4 es post-training (PTQ), sin reentrenamiento: pesos y activaciones en FP4 (E2M1) con grupos de 16 y escalas FP8 E4M3 más una escala global FP32 por tensor. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabecera MTP, todas las RMSNorm, embeddings, LM head, el router MoE y su gate compartido, y toda la ruta de atención lineal (`linear_attn.*`), ya que FP4 es demasiado grueso para los pesos del SSM. La calibración se realizó con 256 muestras de un corpus mixto con predominio coreano. No hay datos publicados sobre el preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto conversacional multimodal: acepta imágenes y texto como entrada (pipeline image-text-to-text)
- Razonamiento con modo thinking activado por defecto en la plantilla de chat; desactivable con `chat_template_kwargs={"enable_thinking": False}`
- Arquitectura MoE con activación de ~3B por token, lo que permite inferencia rápida para su tamaño total
- Cabecera MTP (multi-token prediction) que habilita técnicas de decodificación especulativa
- Atención lineal (GatedDeltaNet/SSM) que reduce el coste de memoria del KV cache en contextos largos
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada (el pipeline es conversational y usa formato de chat OpenAI-compatible)
- Capacidades multilingües: no disponible de forma explícita; la calibración usó un corpus inglés/coreano, lo que sugiere soporte de ambos idiomas

## Casos de uso

- Servido autoalojado en GPU Blackwell: el formato NVFP4 (W4A4) está diseñado para exprimir los tensor cores FP4 de las B200, maximizando throughput por euro en inferencia batch
- Despliegue en servidores con VRAM limitada: con ~23,3 GB de pesos, el modelo cabe en una sola GPU de gama alta (por ejemplo, 48 GB), algo inviable con los pesos BF16 del original
- Análisis de imágenes integrado en aplicaciones: mediante mensajes `image_url` en la API OpenAI-compatible de vLLM se pueden construir flujos de descripción, extracción o verificación visual
- Prototipado y pruebas de calidad de cuantización: el propio autor publica métricas de fidelidad (perplexity y top-1 agreement), útil como banco de pruebas para comparar esquemas NVFP4 frente a FP8/INT8
- Chatbots con razonamiento extendido: el modo thinking por defecto permite tareas de razonamiento multi-paso, desactivándolo cuando se necesita latencia mínima
- Procesamiento de texto en inglés y coreano: el corpus de calibración con predominio coreano sugiere un caso de uso orientado a cargas mixtas inglés/coreano
- Experimentación con vLLM y compressed-tensors: formato totalmente compatible con `vllm serve`, incluyendo opciones de KV cache en FP8 para contextos largos

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad respecto al original BF16, medidas sobre un conjunto interno mixto inglés/coreano (100 prompts, respuestas greedy BF16, mismo harness para ambas filas):

| Metrica | NVFP4 (este modelo) | Original BF16 |
|---|---|---|
| Perplexity (menor = mas fiel) | 1,7192 | 1,2934 |
| Degradacion de perplexity | +32,9 % | — |
| Concordancia top-1 del siguiente token | 83,0 % | 98,0 % |

Estas métricas miden fidelidad al modelo base, no rendimiento en tareas absolutas. El propio autor advierte que este MoE ultra-esparsa es sensible a la cuantización a 4 bits y recomienda las builds de 8 bits (FP8 o AWQ INT8) para producción.

## Requisitos de hardware

- VRAM para pesos: ~23,3 GB (tamaño en disco de los pesos cuantizados); con overhead de activaciones, KV cache y la torre de visión, se recomienda una GPU con 40-48 GB de VRAM como mínimo
- GPU recomendadas: NVIDIA Blackwell (B200) para aprovechar los tensor cores FP4 nativos del formato W4A4; también debería funcionar en GPU con 48 GB (A6000, L40S, A100 48 GB) si vLLM soporta dequantización del formato, aunque sin aceleración FP4 nativa
- Consumer GPU: no cabe en GPUs domésticas típicas (24 GB como RTX 4090) una vez contados KV cache y vision encoder; con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se libera el presupuesto de memoria del encoder de visión, pero los pesos de ~23,3 GB más KV cache siguen excediendo los 24 GB en la práctica
- Despliegue: vLLM (recomendado y objetivo del formato compressed-tensors `nvfp4-pack-quantized`); compatibilidad con llama.cpp u Ollama no disponible (formato no GGUF)
- Opciones de optimización en tiempo de ejecución: `--kv-cache-dtype fp8` reduce a la mitad la memoria del KV cache en contextos largos o batches grandes; `--limit-mm-per-prompt` para servir solo texto
- Latencia y throughput: no disponible (no se publican mediciones); el diseño W4A4 apunta a máximo throughput en B200

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| axteam/Qwen3.6-35B-A3B-NVFP4 | ~35,95B | ~3B | NVFP4 (W4A4) + BF16 parcial | safetensors / compressed-tensors | Apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (original) | ~35,95B | ~3B | BF16 | safetensors | Apache-2.0 |
| Builds 8-bit (FP8 / AWQ INT8) del mismo modelo | ~35,95B | ~3B | FP8 / INT8 | compressed-tensors | Apache-2.0 |

Notas de la comparativa: el original BF16 ofrece máxima fidelidad (perplexity 1,2934) pero requiere aproximadamente el doble de memoria; las builds de 8 bits, recomendadas por el propio autor para producción, ofrecen un mejor equilibrio calidad/memoria para este MoE esparsa. No hay datos suficientes para comparar con modelos de otros fabricantes.

## Limitaciones y advertencias

- Sensibilidad a la cuantización: el autor mide una degradación de +32,9 % en perplexity y una concordancia top-1 de solo 83 % frente al BF16; para producción recomienda explícitamente las variantes de 8 bits (FP8 o AWQ INT8)
- El corpus de calibración tiene predominio coreano, lo que puede sesgar la fidelidad de la cuantización hacia ese idioma y penalizar otros, incluido el castellano (no hay datos por idioma)
- Riesgo de alucinación: no disponible como medición específica; al tratarse de un PTQ sin reentrenamiento, hereda el comportamiento del modelo base, con la degradación añadida de la cuantización
- Rendimiento en tareas absolutas desconocido: las métricas publicadas miden fidelidad al original, no capacidad en benchmarks estándar
- Compatibilidad de hardware: el esquema W4A4 FP4 está pensado para tensor cores FP4 de Blackwell; en otras arquitecturas puede requerir dequantización sin beneficio de velocidad
- Licencia Apache-2.0: permite uso comercial, pero los pesos, tokenizer y chat template originales pertenecen al equipo de Qwen
- Descargas muy bajas (41 en el momento de la ficha): proyecto de un tercero (axteam) sin respaldo oficial de Qwen; conviene validar calidad antes de cualquier despliegue serio
- El modo thinking está activado por defecto, lo que incrementa la longitud de salida y la latencia si no se desactiva explícitamente

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.6-35B-A3B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
