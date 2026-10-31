# axteam/Qwen3.5-122B-A10B-NVFP4

## Resumen

Qwen3.5-122B-A10B-NVFP4 es una versión cuantizada en 4 bits (NVFP4, W4A4) del modelo Qwen3.5-122B-A10B de Qwen, producida por el usuario axteam y optimizada para servir inferencia con vLLM. El modelo base es un LLM multimodal (image-text-to-text) con arquitectura híbrida que combina atención lineal (GatedDeltaNet/SSM) con atención completa, y una capa de mezcla de expertos (MoE) con 256 expertos más un experto compartido, activando unos 10B de parámetros de los 122B totales (125.086.497.008 parámetros reales según los safetensors).

La relevancia de esta versión radica en la reducción de memoria: los pesos FP4 con activaciones FP4 (formato E2M1, grupos de 16 con escalas FP8 E4M3) reducen el tamaño en disco a unos 81,5 GB, lo que permite desplegar un modelo de esta escala en menos GPUs. La cuantización es post-training (PTQ), sin reentrenamiento, y conserva en BF16 las partes más sensibles: la torre de visión, el cabezal de predicción multi-token (MTP), el router MoE, las normalizaciones, los embeddings, el LM head y toda la ruta de atención lineal (aproximadamente el 6 % de los parámetros).

Está pensado para despliegue en hardware con soporte FP4 (tensor cores de NVIDIA Blackwell, como B200), donde el formato NVFP4 ofrece el máximo rendimiento de cómputo. Mantiene el tokenizer, el chat template y la configuración de generación del original, incluyendo el modo de razonamiento (thinking) activado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal GatedDeltaNet/SSM + atención completa), MoE con 256 expertos + experto compartido, multimodal (visión), cabezal MTP |
| Parametros totales | 125.086.497.008 (~122B) |
| Parametros activos | ~10B (MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa --max-model-len 32768) |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 E2M1 pesos con grupo 16, escala FP8 E4M3 + escala global FP32 por tensor, activaciones FP4); componentes sensibles en BF16 (~6 % de parámetros) |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors nvfp4-pack-quantized), ~81,5 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B es un transformer híbrido: combina capas de atención completa con capas de atención lineal basadas en GatedDeltaNet (un mecanismo tipo SSM), lo que reduce el coste de memoria del KV cache en secuencias largas. La capa de salida usa MoE con 256 expertos más un experto compartido, activando unos 10B de parámetros por token. Incorpora además un cabezal de predicción multi-token (MTP) para decodificación especulativa y una torre de visión para entrada de imágenes.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en los datos disponibles. En cuanto a esta derivada, se trata de una cuantización post-training (PTQ) sin reentrenamiento, calibrada con 256 muestras de un corpus mixto con predominio de coreano. El esquema es W4A4: pesos FP4 (E2M1) agrupados en bloques de 16 con escalas FP8 E4M3 y una escala global FP32 por tensor, y activaciones también en FP4. Se mantienen en BF16 la torre de visión y el proyector, el cabezal MTP, todos los RMSNorm, los embeddings, el LM head, el router MoE y la puerta del experto compartido, así como toda la ruta de atención lineal, porque la precisión FP4 es demasiado gruesa para los pesos del SSM. El KV cache puede configurarse en FP8 en tiempo de ejecución para reducir aún más memoria en contextos largos.

## Capacidades

- Generación de texto conversacional con modo de razonamiento (thinking) activado por defecto en el chat template; desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Comprensión multimodal: acepta imágenes (URL o data URI) junto con texto, gracias a la torre de visión conservada en BF16.
- Arquitectura MoE con activación de ~10B de parámetros por token, lo que permite calidad de modelo grande con coste de inferencia de modelo mediano.
- Atención lineal (GatedDeltaNet/SSM) que reduce el coste de memoria en secuencias largas.
- Soporte de predicción multi-token (MTP) para acelerar la decodificación.
- Despliegue como servidor compatible con la API de OpenAI mediante vLLM.
- Soporte de tool calling y agentes: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles de forma explícita; la calibración de la cuantización usó un corpus con predominio de coreano, lo que sugiere soporte de coreano entre otros idiomas.

## Casos de uso

- Chatbots y asistentes conversacionales: el modo conversacional con thinking activado por defecto permite construir asistentes que razonan antes de responder, servidos vía API compatible con OpenAI desde vLLM.
- Análisis y descripción de imágenes: al ser un modelo image-text-to-text, puede integrarse en pipelines que necesiten interpretar capturas, documentos escaneados o gráficos, enviando la imagen como `image_url` en el mensaje.
- Despliegue eficiente en datacenter: con ~81,5 GB en disco y pesos FP4, cabe en menos GPUs que el modelo original en BF16, reduciendo el coste de servir un modelo de 122B con solo 10B de parámetros activos.
- Procesamiento de contextos largos: la combinación de atención lineal (que reduce el coste del KV cache) y la opción de KV cache en FP8 hace viable servir conversaciones o documentos extensos con grandes lotes de peticiones.
- Sistemas multiusuario de alto throughput: la activación MoE de ~10B parámetros por token y el formato FP4 optimizado para tensor cores de Blackwell permiten maximizar tokens/segundo por GPU en servicios con muchas peticiones concurrentes.
- Experimentación con cuantización FP4: al conservar en BF16 las rutas sensibles (SSM, router MoE, visión), es un buen ejemplo práctico de cómo cuantizar selectivamente arquitecturas híbridas sin degradar la calidad.
- Aplicaciones en coreano y multilingües: la calibración con corpus de predominio coreano sugiere especial atención a la calidad de inferencia en coreano tras la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa ~81,5 GB en disco; con overhead de activaciones, KV cache y componentes en BF16, se estima una necesidad superior a 80 GB de VRAM (cifra exacta no disponible). Con `--kv-cache-dtype fp8` se reduce aproximadamente a la mitad la memoria del KV cache.
- GPU recomendadas: GPUs con tensor cores FP4 de NVIDIA Blackwell (como B200), que es donde el formato NVFP4 ofrece su máximo rendimiento. Compatibilidad con otras arquitecturas (H100, RTX 4090) no disponible explícitamente; el formato W4A4 FP4 requiere hardware con soporte de cómputo FP4 para ser eficiente.
- Consumer GPU: no es realista ejecutar los ~81,5 GB del modelo en GPUs de consumo actuales (una RTX 4090 tiene 24 GB); sería necesario multi-GPU de gama alta de datacenter.
- Opciones de despliegue: vLLM (recomendado y documentado en la model card, con servidor compatible con OpenAI en el puerto 8000). El formato compressed-tensors está orientado a vLLM; el soporte en llama.cpp, Ollama o TGI no está documentado y GGUF no está disponible.
- Comando de referencia: `vllm serve axteam/Qwen3.5-122B-A10B-NVFP4 --max-model-len 32768`. Para servir solo texto: `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.
- Latencia y throughput estimados: no disponibles. El muestreo recomendado es `temperature=0.6`, `top_p=0.95`, `top_k=20`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Cuantizacion | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| axteam/Qwen3.5-122B-A10B-NVFP4 | ~122B | ~10B | NVFP4 (W4A4) | Sí (visión) | Apache-2.0 | safetensors compressed-tensors, vLLM |
| Qwen/Qwen3.5-122B-A10B (original) | ~122B | ~10B | BF16 | Sí (visión) | Apache-2.0 | safetensors |
| Alternativas de tamaño y tarea similares | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización FP4 (W4A4) implica pérdida de precisión frente al modelo original en BF16; la propia model card recomienda NVFP4A16 si la prioridad es la calidad.
- La calibración se realizó con solo 256 muestras de un corpus con predominio de coreano, lo que puede afectar a la calidad de la cuantización en otros idiomas.
- El formato NVFP4 con activaciones FP4 está orientado a GPUs Blackwell; en hardware sin soporte FP4 el rendimiento y la viabilidad no están documentados.
- No se ha publicado información sobre sesgos conocidos, tasas de alucinación ni resultados de evaluación del modelo cuantizado.
- La longitud de contexto máxima del modelo base no está especificada en la información disponible; el ejemplo de la model card usa 32768 tokens.
- El soporte de tool calling y agentes no está documentado para esta versión.
- En cuanto a la licencia, Apache-2.0 permite uso comercial, pero los pesos originales, el tokenizer y el chat template pertenecen al equipo de Qwen; conviene revisar la licencia del modelo base enlazada.
- Es un modelo de terceros (axteam) con muy pocas descargas (32) y sin validación comunitaria amplia; para producción se recomienda evaluarlo frente al original y verificar el repositorio antes de desplegar.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.5-122B-A10B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
