# axteam/Qwen3.8-27B-NVFP4A16

## Resumen

Qwen3.8-27B-NVFP4A16 es una cuantización de 4 bits (W4A16, pesos FP4) del modelo multimodal Qwen3.8-27B de Qwen, publicada por el usuario axteam en Hugging Face. El objetivo del modelo es servir la versión de 27 mil millones de parámetros con un consumo de memoria muy reducido (~26,6 GB en disco) manteniendo la fidelidad al original BF16, algo especialmente relevante para despliegues en vLLM sobre GPUs de una sola tarjeta.

La cuantización NVFP4A16 utiliza pesos FP4 (E2M1) agrupados en bloques de 16 con escalas FP8 E4M3, mientras que las activaciones se mantienen en BF16. De forma notable, el autor ha conservado en BF16 la torre de visión, el proyector, la cabeza de predicción multi-token (MTP), las normalizaciones, los embeddings, la LM head y toda la ruta de atención lineal (GatedDeltaNet/SSM), al considerar FP4 demasiado grueso para esos pesos.

El modelo base es un transformer híbrido (atención lineal + atención completa), denso y multimodal (image-text-to-text), con soporte de thinking mode. Se trata de una cuantización post-entrenamiento (PTQ) sin reentrenamiento, por lo que el comportamiento es fiel al original. Según mediciones del propio autor, la perplexidad frente al BF16 apenas empeora un 1,0 % y la concordancia top-1 del siguiente token es del 95,8 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal GatedDeltaNet/SSM + atención completa), denso, multimodal, con cabeza MTP |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los ejemplos de vLLM usan `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 grupo 16 con escalas FP8 E4M3 y escala global FP32 por tensor; activaciones BF16; componentes sensibles en BF16 |
| Idiomas soportados | No disponibles (el corpus de calibración es mayoritariamente coreano mixto; el original Qwen suele ser multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`), ~26,6 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal (GatedDeltaNet, un mecanismo tipo SSM) con capas de atención completa, lo que reduce el coste de la caché KV en contextos largos. Es un modelo denso (no MoE) con cabeza de predicción multi-token (MTP) que permite decodificación especulativa, y una torre de visión con proyector para entrada de imagen y texto.

Esta versión no es un reentrenamiento sino una cuantización post-entrenamiento (PTQ) NVFP4A16: los pesos se convierten a FP4 (E2M1) en grupos de 16 con escalas FP8 E4M3 y una escala global FP32 por tensor, mientras que las activaciones permanecen en BF16. La calibración se realizó con 256 muestras de un corpus mixto con predominio coreano. Se mantienen deliberadamente en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings, la LM head y la ruta completa de atención lineal (`linear_attn.*`), porque FP4 es demasiado impreciso para los pesos del SSM. El tokenizador, el `chat_template` y el `generation_config` son idénticos a los del original, y `config.json` solo añade el bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional con chat template idéntico al original Qwen3.8.
- Entrada multimodal imagen-texto (pipeline image-text-to-text): admite imágenes por URL o data URI en vLLM.
- Thinking mode activado por defecto en el chat template; desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Decodificación especulativa mediante la cabeza MTP (multi-token prediction) conservada en BF16.
- Atención lineal (GatedDeltaNet/SSM) que reduce el coste de memoria de la caché KV en contextos largos.
- Servible como servidor compatible con la API de OpenAI mediante vLLM.
- Soporte de tool calling / agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles explícitamente (calibración con corpus inglés/coreano).

## Casos de uso

- Servidor de LLM multimodal autoalojado: se puede levantar un endpoint compatible con OpenAI (`vllm serve ... --max-model-len 32768`) para alimentar aplicaciones de chat con entrada de imágenes, en una sola GPU de gama alta gracias a los 26,6 GB de pesos.
- Chatbots con análisis de imágenes: el pipeline image-text-to-text permite describir imágenes, extraer texto de capturas o responder preguntas visuales dentro de conversaciones multi-turno.
- Despliegue en entornos con VRAM limitada: al cuantizar los pesos a FP4 y mantener las activaciones en BF16, el modelo cabe donde el BF16 original (~55 GB) no lo haría, por ejemplo en una RTX 5090 de 32 GB o una A100/H100 80 GB con contexto amplio y lotes grandes.
- Servicios de texto puro optimizados: con `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se libera el presupuesto de memoria del codificador de visión, ideal para backends solo de texto.
- Contextos largos con muchos usuarios concurrentes: la atención lineal reduce la caché KV, y con `--kv-cache-dtype fp8` se reduce a la mitad su memoria, útil para servir contextos de 32K con batching agresivo.
- Generación acelerada con decodificación especulativa: la cabeza MTP conservada permite aceptar varios tokens por paso en vLLM, mejorando el throughput en servidores.
- Desarrollo y evaluación de cuantizaciones: al ser una PTQ fiel al original (+1,0 % de perplexidad), sirve como base para comparar esquemas de cuantización FP4 en hardware NVIDIA moderno.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica mediciones de fidelidad respecto al original BF16 (conjunto interno mixto inglés/coreano, 100 prompts, respuestas greedy BF16 evaluadas bajo el mismo harness):

| Métrica | Este modelo | Original BF16 |
|---|---|---|
| Perplexity (menor = más fiel) | 1,3724 | 1,3586 (+1,0 %) |
| Concordancia top-1 siguiente token | 95,8 % | 99,4 % |

Estas cifras miden fidelidad al modelo base, no puntuaciones absolutas en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~26,6 GB solo de pesos; con caché KV y overhead de vLLM, se recomienda al menos 32 GB de VRAM (más si se carga el codificador de visión y se usa contexto largo).
- GPUs recomendadas: la cuantización FP4 con formato compressed-tensors `nvfp4-pack-quantized` está orientada a vLLM sobre hardware NVIDIA moderno (Blackwell con soporte FP4 nativo, como RTX 5090 o B200); también funciona en A100/H100 80 GB, donde la ventaja principal es la reducción de memoria.
- Consumer GPUs: puede caber en una RTX 5090 (32 GB) o RTX 4090 (24 GB) solo si se ajusta el contexto y se desactiva la carga del codificador de visión; en 24 GB el margen es muy justo con 26,6 GB de pesos, por lo que no se garantiza.
- Despliegue: vLLM es el runtime documentado (`vllm serve` o `LLM()` en Python). No hay mención a compatibilidad con llama.cpp, Ollama, TGI o transformers para esta variante cuantizada (el tag `transformers` se refiere a la librería del modelo base).
- Opciones de memoria: `--kv-cache-dtype fp8` reduce a la mitad la caché KV; `--limit-mm-per-prompt '{"image": 0, "video": 0}'` evita cargar el presupuesto de memoria del codificador de visión en servido solo de texto.
- Latencia y throughput: no disponibles; la cabeza MTP sugiere aceleración por decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4A16 (este) | 27,78 B | W4A16 (FP4 pesos, BF16 activaciones) | No disponible (ejemplos con 32K) | Sí (imagen-texto) | Apache-2.0 |
| Qwen/Qwen3.8-27B (original) | 27,78 B | BF16 | No disponible | Sí (imagen-texto) | Apache-2.0 |
| Alternativas FP4 de 27B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se conocen otras cuantizaciones NVFP4 del mismo modelo publicadas en la información disponible. La principal alternativa es el original BF16 de Qwen, con el doble de memoria pero máxima fidelidad.

## Limitaciones y advertencias

- La calibración se realizó con un corpus mixto con predominio coreano, lo que puede afectar a la calidad de la cuantización en otros idiomas; no hay datos de calidad por idioma.
- La concordancia top-1 con el original es del 95,8 % (frente al 99,4 % entre builds BF16), lo que implica una ligera deriva en las salidas respecto al modelo base; puede ser relevante en casos de uso deterministas.
- No hay benchmarks de tareas estándar publicados; la evaluación solo mide fidelidad a la BF16, no capacidad absoluta.
- El formato `nvfp4-pack-quantized` requiere vLLM con soporte compressed-tensors; no es un GGUF y no funcionará en llama.cpp, Ollama o transformers sin soporte específico.
- Los pesos FP4 no cubren toda la red: la ruta SSM, la torre de visión, la cabeza MTP, embeddings y LM head quedan en BF16, por lo que el ahorro de memoria es menor que en una cuantización integral.
- Sesgos: hereda los del modelo base Qwen3.8-27B; no se documentan sesgos específicos de esta variante.
- Riesgo de alucinación: heredado del modelo base; no se publican evaluaciones al respecto.
- Restricciones de licencia: Apache-2.0, sin restricciones para uso comercial; los derechos del tokenizador, chat template y pesos originales pertenecen al equipo de Qwen.
- Longitud de contexto máxima del modelo base: no disponible en la información proporcionada; los ejemplos usan 32K por limitación de servido, no necesariamente el límite del modelo.
- Advertencia general: modelo cuantizado por un tercero (axteam), no oficial de Qwen; con solo 44 descargas y 2 likes en el momento de la ficha, tiene poco historial de uso en producción.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.8-27B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE

No se han encontrado enlaces adicionales (papers, blogs, repos o demos) en la información disponible.
