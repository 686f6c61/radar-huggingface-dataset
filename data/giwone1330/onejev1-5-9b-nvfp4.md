# giwone1330/OneJev1.5-9B-NVFP4

## Resumen

OneJev1.5-9B-NVFP4 es una cuantización en NVFP4 del modelo multimodal OmniJev/OneJev1.5-9B, publicada por el usuario giwone1330. OneJev es un "System One decision model": en lugar de generar texto libre, recibe imágenes y/o texto junto con preguntas tipadas (sí/no, elección múltiple, puntuación) y devuelve una probabilidad para cada opción a partir de una única lectura de next-token. El modelo base es un fine-tune de Qwen/Qwen3.5-9B.

La relevancia de esta versión concreta es de despliegue: reduce los pesos de 18 GB (BF16) a 8,3 GB y duplica el throughput en una RTX 5090 (de 1,17 a 2,33 req/s con 6 imágenes de 1280x720 y 10 preguntas por petición), con una latencia mediana que baja de 8,8 s a 4,3 s con 10 peticiones en vuelo. Está pensada exclusivamente para GPUs Blackwell (RTX 50xx, B200/GB200) y se sirve con vLLM 0.32.

La cuantización se generó con NVIDIA Model-Optimizer y mantiene en BF16 el encoder de visión, los embeddings, el `lm_head`, partes de la capa Gated DeltaNet y el módulo MTP; la KV cache también permanece en BF16. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + Gated DeltaNet) con encoder de visión y módulo MTP; fine-tune de Qwen3.5-9B |
| Parametros totales | 5.953.707.248 (~5,95 B según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio usa `--max-model-len 16384` |
| Tipos de cuantizacion | NVFP4 (W4A4, bloque 16, escalas FP8) en todas las capas Linear del modelo de lenguaje; BF16 en visión, embeddings, `lm_head`, `conv1d`, `in_proj_a`/`in_proj_b` y MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB), servido con vLLM |

## Arquitectura y entrenamiento

El modelo base combina capas de atención completa con capas Gated DeltaNet (un mecanismo de estado lineal recurrente) dentro de un transformer multimodal: un encoder de visión procesa las imágenes y el modelo de lenguaje recibe los tokens visuales junto al texto de estado y la pregunta. La salida es una distribución de probabilidad sobre las letras de las opciones (A., B., ...), obtenida de un único paso de decodificación con `max_tokens: 1` y `logprobs`. El modelo es un fine-tune de Qwen/Qwen3.5-9B; no se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación de esta ficha es la cuantización: NVIDIA Model-Optimizer con preset `nvfp4` y calibración máxima sobre 128 peticiones en el formato propio del modelo (qev-labels-v2) del suite público Decision Index, 64 de texto (ANLI, ARC-Challenge, ARC-Easy, GSM8K, HellaSwag, MMLU, WinoGrande, ContractNLI) y 64 de imagen (CV-Bench, BLINK, RealWorldQA, CharXiv, CORD), ejecutadas a través del VLM completo para que el modelo de lenguaje vea tokens de imagen reales. Solo se ajustaron las escalas de cuantización; según el autor, no se almacenan datos de benchmark en los pesos.

## Capacidades

- Clasificación y decisión multimodal: responde preguntas de sí/no, elección múltiple y puntuación devolviendo una probabilidad por opción.
- Entrada conjunta de imagen y texto: hasta 8 imágenes por prompt en la configuración de servicio recomendada (`--limit-mm-per-prompt '{"image": 8, "video": 0}'`).
- Razonamiento sobre documentos y escenas: evaluado en benchmarks de NLI de documentos largos (ContractNLI), matemáticas (GSM8K), conocimiento (MMLU, ARC), sentido común (HellaSwag, WinoGrande), gráficos (CharXiv), OCR/documentos (CORD) y visión general (CV-Bench, BLINK, RealWorldQA).
- Salida calibrada: distribución de probabilidad sobre opciones, útil para umbrales y agregación de decisiones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para una decisión por llamada.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- Capacidades especiales: modo de decisión "System One" con lectura de next-token; módulo MTP (multi-token prediction) conservado en BF16; prefix caching para reutilizar el prefill de imágenes compartidas entre preguntas.

## Casos de uso

- Inspección de obra y seguridad industrial: el propio autor documenta 30 peticiones de cámara de obra con 6 fotogramas de 720p y 10 preguntas de sí/no, elección y puntuación cada una; el modelo cuantizado coincide con BF16 en 299 de 300 decisiones, lo que lo hace apto para triaje automatizado de imágenes de obra.
- Moderación y control de calidad visual por lotes: con 1 imagen de 640x360 y 1 pregunta alcanza 76 req/s en una RTX 5090, suficiente para clasificar grandes volúmenes de imágenes con una pregunta binaria por elemento.
- Verificación documental: preguntas de implicación textual sobre contratos y documentos largos (ContractNLI es la categoría menos afectada por la cuantización), por ejemplo para comprobar si una cláusula implica una obligación concreta.
- Enrutamiento y toma de decisiones en pipelines: al devolver probabilidades por opción, puede alimentar un umbral o un sistema de votación que derive casos ambiguos a revisión humana.
- Evaluación de gráficos y documentos escaneados: responde preguntas de elección múltiple sobre CharXiv y CORD, útil para extracción asistida de datos de informes y recibos.
- Preguntas múltiples sobre el mismo lote de imágenes: con `--enable-prefix-caching`, todas las preguntas sobre las mismas imágenes comparten el prefill; con 6 imágenes de 1280x720 y 10 preguntas se obtienen 2,33 req/s en una RTX 5090.
- Despliegue en estación de trabajo con GPU consumer Blackwell: cabe en 32 GB de VRAM con los pesos en 8,3 GB y KV cache en BF16, lo que permite prototipado local sin clúster.

## Benchmarks y rendimiento

Desviación frente a BF16 en 780 filas retenidas del Decision Index (60 por benchmark, disjuntas de la calibración), con el prompt propio de OneJev:

| Metrica | BF16 (repetición) | Este modelo |
|---|---|---|
| Misma respuesta que BF16 | 99,6% | 95,6% |
| Distancia de variación total media de la distribución de opciones | 0,002 | 0,037 |
| Precisión frente al gold (BF16: 85,8%) | 85,9% | 84,9% |

En 30 peticiones de cámara de obra (6 fotogramas de 720p, 10 preguntas cada una, 300 respuestas): 299/300 decisiones idénticas a BF16, con una media de |dP(yes)| de 0,022. La aritmética (GSM8K) es la categoría más afectada (83% de respuestas idénticas); la NLI de documentos largos (ContractNLI) no se ve afectada.

Rendimiento de servicio en una RTX 5090 con vLLM 0.32 y 10 peticiones en vuelo:

| Imagenes por peticion | Tokens de prompt | Q=1 | Q=10 | Q=40 |
|---|---|---|---|---|
| 1 x 640x360 | 342 | 76 req/s | 13,3 req/s | 3,6 req/s |
| 6 x 1280x720 | 5.442 | 3,3 req/s | 2,33 req/s | 1,2 req/s |
| 6 x 1920x1080 | 12.402 | 1,1 req/s | 0,95 req/s | 0,53 req/s |

Coste por petición según el autor: unos 0,068 ms por token de prompt para el prefill de imagen compartido, más unos 6 ms + 1 ms por cada 1.000 tokens de prompt por pregunta. Comparativa directa BF16 frente a NVFP4: 18 GB frente a 8,3 GB de pesos, 1,17 frente a 2,33 req/s y 8,8 s frente a 4,3 s de latencia mediana con 10 peticiones en vuelo.

## Requisitos de hardware

- GPU obligatoria Blackwell: RTX 50xx, B200 o GB200. No hay soporte para arquitecturas anteriores en esta cuantización.
- VRAM: los pesos ocupan 8,3 GB; el ejemplo de servicio usa `--gpu-memory-utilization 0.80` y está validado en una tarjeta de 32 GB (RTX 5090). La KV cache se mantiene en BF16, por lo que el consumo crece con la longitud de contexto y el número de secuencias.
- Cabe en GPU consumer: sí, en RTX 5090 (32 GB); el autor advierte que el autotune de FlashInfer se queda sin memoria en 32 GB tras asignar la KV cache, de ahí `--no-enable-flashinfer-autotune`.
- Software: vLLM 0.32.0, driver para CUDA 13, `nvcc` >= 12.9 y `nvidia-cuda-nvcc==13.4.*` con `CUDA_HOME` apuntando al compilador; FlashInfer compila en JIT su GEMM NVFP4 sm_120 en el primer arranque. La imagen Docker `vllm/vllm-openai:v0.32.0` ya incluye el compilador necesario.
- Opciones de despliegue: vLLM con API compatible con OpenAI; el repositorio incluye un kit en `serve/` (script Docker `onejev-nvfp4-5090.sh` y alternativa sin Docker con `setup.sh`, `serve.sh`, `stop.sh`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Parámetros de servicio recomendados: `--max-model-len 16384`, `--max-num-seqs 128` (con 64 la GPU quedaba inactiva un 40% del tiempo), `--max-num-batched-tokens 16384`, `--enable-prefix-caching`, `--logprobs-mode processed_logprobs`, `--max-logprobs 64`, `--limit-mm-per-prompt '{"image": 8, "video": 0}'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| OneJev1.5-9B-NVFP4 (este) | ~5,95 B | no disponible (servicio a 16.384) | NVFP4, solo Blackwell | 2,33 req/s y 4,3 s de mediana en RTX 5090 con 6 imágenes y 10 preguntas | Apache-2.0 |
| OmniJev/OneJev1.5-9B (base) | no disponible | no disponible | BF16, 18 GB | 1,17 req/s y 8,8 s de mediana en el mismo escenario | Apache-2.0 |
| Qwen/Qwen3.5-9B (modelo origen) | ~9 B (según nombre) | no disponible | BF16 y otras cuantizaciones | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: requiere GPU Blackwell y CUDA 13; no es desplegable en A100, H100 ni RTX 40xx.
- Degradación por cuantización: 95,6% de respuestas idénticas a BF16 en el conjunto retenido, con una distancia de variación total media de 0,037 frente a 0,002 del propio BF16. La aritmética (GSM8K) es la categoría más afectada (83% de coincidencia), por lo que no es recomendable para cálculo numérico sensible.
- Formato de prompt obligatorio: el servidor expone la API de chat de OpenAI, no la API System One; hay que construir el prompt propio del modelo (system prompt, turno de usuario con `<state>`, imágenes y texto, y opciones bajo `A.`, `B.`, ...) y extraer las probabilidades de los logprobs de las letras de las opciones. Un prompt distinto invalida las probabilidades.
- Una decisión por llamada: no está pensado para generación de texto libre, diálogo multi-turno ni razonamiento multi-paso; no hay evidencia de soporte de tool calling ni de agentes.
- Idiomas no declarados: no se puede asumir cobertura multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un clasificador con salida de probabilidad, el riesgo se traslada a la calibración de los umbrales de decisión.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base y de Qwen3.5-9B deben verificarse por separado antes de producción.
- Madurez: 45 descargas y 0 likes en el momento de la consulta; es una cuantización de un tercero, no una publicación oficial de OmniJev.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/giwone1330/OneJev1.5-9B-NVFP4
- Modelo base: https://huggingface.co/OmniJev/OneJev1.5-9B
- Modelo origen: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de OneJev (prompt y API System One): https://github.com/OmniJev/OneJev
- Suite de evaluación Decision Index: https://github.com/apolinario/decision-index
- NVIDIA Model-Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Kit de servicio Docker: https://huggingface.co/giwone1330/OneJev1.5-9B-NVFP4/resolve/main/serve/onejev-nvfp4-5090.sh
