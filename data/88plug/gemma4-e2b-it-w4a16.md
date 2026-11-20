# 88plug/Gemma4-E2B-it-W4A16

## Resumen

Gemma4-E2B-it-W4A16 es una cuantización post-entrenamiento INT4 del modelo multimodal `google/gemma-4-e2b-it` de Google, publicada por el usuario 88plug. Se trata de un modelo de arquitectura MoE dispersa con 128 expertos y aproximadamente 5.100 millones de parámetros totales, del cual solo una fracción está activa por token (el sufijo E2B indica del orden de 2B activos). Incorpora visión mediante un codificador SigLIP y atención híbrida deslizante más global.

El problema que resuelve es el despliegue de un VLM MoE en hardware de gama consumer: la cuantización W4A16 reduce los pesos de ~14 GB en BF16 a ~7 GiB, permitiendo ejecutar el modelo en GPUs de 8 GB de VRAM con espacio para caché KV. La cuantización se aplica solo al backbone del modelo de lenguaje (capas `Linear` de atención y MLP), manteniendo en BF16 el vision tower, el proyector multimodal, las capas PLE, el `lm_head`, las normas y los embeddings.

Es relevante porque, según el autor, es la primera cuantización W4A16 en formato compressed-tensors nativo para vLLM disponible para Gemma4 E2B. El formato es cargable directamente por vLLM ≥ 0.21 sin flag de cuantización, y está pensado como una vía provisional hasta que se resuelvan los bloqueos de AutoRound con las capas `q_proj.linear` de Gemma4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa, 128 expertos, atención híbrida deslizante + global, vision tower SigLIP, Per-Layer Embeddings (PLE) |
| Parametros totales | 5.104.297.539 (~5,1B) |
| Parametros activos | ~2B (tier E2B; valor exacto no disponible) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue) |
| Tipos de cuantizacion | W4A16 (pesos INT4 simétricos, activaciones BF16); variante W8A16 disponible del mismo autor |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (pack-quantized / int-quantized) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso con 128 expertos y atención híbrida que combina ventanas deslizantes con atención global. Incluye un codificador visual SigLIP, un proyector multimodal y capas de Per-Layer Embeddings (PLE) mediante `embed_tokens_per_layer` y `per_layer_model_projection`. El modelo es multimodal (image-text-to-text) y, según las etiquetas del autor, también contempla un `audio_tower`, aunque no se detallan sus capacidades de audio.

La cuantización es de tipo post-entrenamiento, data-free, mediante RTN (Round-To-Nearest) con `QuantizationModifier` de llmcompressor. El autor indica que el wrapper AutoRound quedó bloqueado por los hijos `q_proj.linear` de Gemma4 (documentado en KNOWN-FAILURES), por lo que esta release se etiqueta como provisional y con una recuantización programada. Se cuantizan a W4A16 todas las capas `Linear` del backbone (`self_attn.{q,k,v,o}_proj` y `mlp.{gate,up,down}_proj`); se excluyen y permanecen en BF16: `lm_head`, embeddings de tokens, normas, ambas capas PLE, vision tower, audio tower y proyector multimodal. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre etapas de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y respuesta a instrucciones (modelo `-it`).
- Comprensión de imágenes (image-text-to-text) mediante el codificador SigLIP y el proyector multimodal.
- Arquitectura MoE con 128 expertos, lo que ofrece alta capacidad con coste de cómputo reducido por token.
- Capacidad potencial de audio por la presencia de `audio_tower` en BF16, aunque el autor no documenta su funcionamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la metadata del modelo.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente visual en hardware consumer: desplegar un VLM en una RTX 4070 o RTX 3080 de 10 GB para responder preguntas sobre imágenes en local, aprovechando que los pesos ocupan ~7 GiB y dejan margen para la caché KV.
- Procesamiento de documentos con contexto largo: analizar capturas, diagramas o páginas escaneadas junto con texto de hasta 32k tokens en una sola pasada, útil para extracción de información de informes.
- Servicio de inferencia de alto throughput: con ~7.400 tok/s medidos en la escalera del autor (in2048_out512), es adecuado para servir múltiples peticiones concurrentes en vLLM con caché KV en fp8.
- Prototipado de pipelines multimodales: integrar el modelo vía API compatible con OpenAI (`/v1/chat/completions`) para validar flujos de image-text-to-text antes de escalar a modelos mayores.
- Clasificación y descripción de imágenes a escala: generar descripciones o etiquetas para catálogos de producto o datasets de entrenamiento en entornos con GPU única.
- Evaluación comparativa de cuantizaciones: usar esta release W4A16 junto con la variante W8A16 del mismo autor para medir la degradación de calidad frente al BF16 en tareas multimodales.
- Inferencia en el borde con GPU modesta: al caber en 8 GB, permite desplegar un VLM en estaciones de trabajo sin GPUs de datacenter.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput total (in2048_out512) | 7433 tok/s (prompt + output) |
| Throughput total (in512_out256) | 7131 tok/s (prompt + output) |
| Throughput total (in8192_out512) | 6884 tok/s (prompt + output) |
| KL divergence vs BF16 (objetivo) | < 0,014 |
| Recuperación de MMLU (objetivo) | ≥ 99% |

Los datos de throughput proceden de la escalera de benchmark del autor con vLLM v0.21.0 y lm-evaluation-harness. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; los valores de KL y MMLU son objetivos, no mediciones confirmadas. El estado FLAC figura como "no medido".

## Requisitos de hardware

- VRAM de pesos: ~7,0 GiB en W4A16 frente a ~14 GB en BF16.
- VRAM total a 32k de contexto con caché KV en fp8: ~7 GB (frente a ~15 GB en BF16).
- GPU mínima indicada: 1× RTX 3080 10 GB o RTX 4070; cabe en cualquier GPU moderna de 8 GB.
- GPU recomendadas por el autor: RTX 3080 10 GB, RTX 4070; en BF16 el modelo base requiere una RTX 3090 de 24 GB.
- Despliegue preferente: vLLM ≥ 0.21 (detección automática de compressed-tensors, sin flag `--quantization`). Imagen probada: `vllm/vllm-openai:v0.21.0-cu129-ubuntu2404`.
- transformers con `compressed-tensors`: soportado para muchos modelos de texto; en multimodal puede requerir código personalizado.
- TGI: no soportado para este formato.
- SGLang: el autor indica que no soporta nativamente este formato (nota truncada en la model card).
- Widget de inferencia de Hugging Face: a menudo falla; se recomienda vLLM local.
- Throughput medido: entre ~6.880 y ~7.430 tok/s según la configuración de entrada/salida.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| 88plug/Gemma4-E2B-it-W4A16 | ~5,1B totales, ~2B activos | compressed-tensors W4A16 | 32k (configurable) | apache-2.0 | Esta ficha; ~7 GiB, cabe en 8 GB |
| google/gemma-4-e2b-it | ~5,1B totales, ~2B activos | BF16 | no disponible | apache-2.0 | Techo de calidad; ~14 GB, requiere ~24 GB |
| RedHatAI/gemma-3n-E4B-it-quantized.w4a16 | no disponible (generación previa, mayor) | compressed-tensors W4A16 | no disponible | no disponible | Mismo formato, generación anterior, modelo mayor |
| 88plug/Gemma4-E2B-it-W8A16 | ~5,1B totales, ~2B activos | compressed-tensors W8A16 | 32k (configurable) | apache-2.0 | Variante de mayor precisión del mismo autor |

## Limitaciones y advertencias

- Release provisional: cuantización data-free RTN por bloqueo de AutoRound; el autor ha programado una recuantización. La calidad puede no ser la definitiva.
- Objetivos de calidad (KL < 0,014, MMLU ≥ 99%) no confirmados con mediciones publicadas; el estado FLAC figura como no medido.
- Solo inglés según la metadata; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente al modelo base, no cuantificado en esta release.
- Sesgos del modelo base no documentados en la información disponible.
- No desplegar en TGI: el backend no carga el formato compressed-tensors y produce errores opacos.
- El widget de Hugging Face falla con frecuencia; usar vLLM local.
- El soporte multimodal en transformers con compressed-tensors puede requerir código personalizado.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base de Google.
- Las capas PLE deben permanecer en BF16; cuantizarlas provoca degradación catastrófica de la salida, por lo que cualquier re-cuantización debe respetar las exclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88plug/Gemma4-E2B-it-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Variante W8A16 del mismo autor: https://huggingface.co/88plug/Gemma4-E2B-it-W8A16
- Cuantización comparable de la generación previa: https://huggingface.co/RedHatAI/gemma-3n-E4B-it-quantized.w4a16
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- llmcompressor: https://github.com/vllm-project/llmcompressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
