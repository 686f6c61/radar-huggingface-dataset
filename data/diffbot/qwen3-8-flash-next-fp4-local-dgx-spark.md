# diffbot/Qwen3.8-Flash-Next-FP4-Local-DGX-Spark

## Resumen

Qwen3.8-Flash-Next-FP4-Local-DGX-Spark es un checkpoint cuantizado en FP4 del modelo Qwen/Qwen3.8-Flash-Next, empaquetado por el usuario diffbot (no por el equipo de Qwen) para su despliegue en una única estación NVIDIA DGX Spark con GPU GB10 y 128 GB de memoria unificada. El repositorio no modifica los pesos de NVIDIA: lo que aporta es una receta de servicio completa sobre vLLM con los kernels b12x, incluyendo parches de código, una imagen pública fijada y un kernel CUDA propio, todo bajo el directorio `recipe/`. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con capacidades multimodales de entrada imagen-texto y un módulo MTP (multi-token prediction) usado para decodificación especulativa.

El interés del modelo es fundamentalmente práctico: demuestra que un MoE de aproximadamente 96.500 millones de parámetros puede servirse de forma interactiva en hardware de escritorio de gama alta con memoria unificada, alcanzando 63-64 tokens/s de decodificación en sesiones de agente de código y hasta 3.150 tokens/s de prefill con prompts de 33.000 tokens. Frente al lanzador estándar de NVIDIA, la receta reduce el tiempo por paso de decodificación de 71,2 a 54,2 ms y eleva el throughput de 46,9 a 64 tokens/s en las mismas sesiones.

La relevancia actual reside en que combina tres piezas que rara vez aparecen juntas en un mismo artefacto: cuantización NVFP4 con calibración ModelOpt, decodificación especulativa con borradores MTP y una receta reproducible de servido con métricas de fidelidad (divergencia KL contra el modelo BF16) y de calidad (GSM8K, HumanEval) publicadas junto al checkpoint. No es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue con garantías medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, con módulo MTP para decodificación especulativa |
| Parametros totales | 96.486.615.005 (~96,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.000 tokens configurados en la receta (prueba de aguja superada hasta 124.842 tokens) |
| Tipos de cuantizacion | NVFP4 (W4A16 en expertos enrutados según la receta; W4A4 por defecto en vLLM), caché KV en FP8; opción MOE_A16 con activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 102,3 GB |
| Libreria de inferencia | vLLM (con kernels b12x y parches propios) |
| Hardware objetivo | 1 x NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) |
| Modalidad | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer de mezcla de expertos con capacidades multimodales de entrada (imagen y texto). Sobre esa base, NVIDIA aplicó cuantización NVFP4 mediante ModelOpt, y diffbot añadió una receta de servido que incluye decodificación especulativa con 4 tokens borrador del módulo MTP, gráficos CUDA, caché KV en FP8 y fragmentación del prefill en trozos de 8.192 tokens. La receta fija una fracción de memoria de GPU de 0,73 y opera con kernels b12x, que suman las salidas de los expertos con atómicas BF16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base; la model card del repositorio se centra exclusivamente en el proceso de cuantización y servido. La innovación técnica documentada es la actualización de prefill del 1 de noviembre de 2026, que introduce tres cambios: lookahead en PLE (bit-idéntico en logits), un kernel de MoE de prefill con suma de expertos en orden fijo en lugar de atómicas BF16 (mejora la KL de 0,0386-0,0391 a 0,0375 en 6 trozos) y una fusión de HyperConnection en prefill que reduce la divergencia KL un 3,3 % (de 0,04811 a 0,04653, comparación pareada por posición, t = -4,7). El resultado es un aumento del 39-48 % en throughput de prefill respecto al lanzamiento del 21 de octubre.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con soporte de modo "thinking" desactivable (los benchmarks de calidad se midieron con thinking off).
- Comprensión de imágenes combinadas con texto (pipeline image-text-to-text).
- Generación de código: 96,3-97,0 % en HumanEval con decodificación greedy.
- Razonamiento matemático: 97,5 % en GSM8K (primeras 200 preguntas).
- Tool calling / function calling: verificado con `tool_choice=auto` y parseo correcto de las llamadas.
- Sesiones de agente de código con definiciones de herramientas y llamadas en el historial, incluyendo múltiples pasos de razonamiento.
- Contexto largo efectivo: recuperación de una aguja planted a 28.842, 96.042 y 124.842 tokens.
- Decodificación especulativa nativa vía MTP con 4 tokens borrador y 3,4-3,6 tokens aceptados por paso.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de código en local para un solo desarrollador: la receta está dimensionada para una DGX Spark y sostiene 63-64 tokens/s de decodificación con 0,72-0,76 s de tiempo hasta el primer token en turnos de seguimiento, lo que hace viable un bucle de agente con herramientas sobre un repositorio real sin depender de la nube.
- Asistente de revisión de código con contexto de repositorio completo: los 131.000 tokens de contexto configurados y la recuperación verificada hasta 124.842 tokens permiten cargar varios ficheros y el historial de cambios en una sola ventana.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, diagramas o páginas escaneadas y combinarla con texto en la misma conversación.
- Evaluación de calidad de cuantizaciones: el repositorio publica la metodología de divergencia KL contra BF16 con conjuntos de referencia concretos (87 trozos de 4.096 tokens, 178.089 posiciones puntuadas), lo que lo convierte en una base útil para comparar builds GGUF y FP4 en tareas de investigación sobre cuantización.
- Automatización de soporte técnico con contexto largo: la ventana de 131K tokens permite mantener historiales de incidencia extensos y documentación técnica adjunta sin truncar.
- Generación de código en pipelines de CI/CD: el soporte de tool calling con `tool_choice=auto` y el throughput de prefill de 3.070-3.150 tokens/s con prompts largos permiten alimentar el modelo con diffs y ficheros de configuración grandes en tiempos de espera razonables.
- Prototipado de aplicaciones multimodales en hardware de sobremesa: permite validar un producto que combine visión y texto sin aprovisionar clústeres con A100/H100.

## Benchmarks y rendimiento

Calidad (thinking off, decodificación greedy):

| Prueba | Este repo (2026-11-01) | Este repo (2026-10-21) |
|---|---:|---:|
| GSM8K (primeras 200) | 97,5 % | 96,5 % |
| HumanEval | 96,3-97,0 % | 95,7 % |

Fidelidad respecto a BF16 (conjunto neutral de AtomicChat, 87 trozos de 4.096 tokens, 178.089 posiciones; PPL BF16 de referencia 4,045):

| Modelo | Tamano | KL media | Top-1 | Ratio PPL |
|---|---:|---:|---:|---:|
| Este repo tal como se sirve (W4A16) | 102 GB | 0,0492 | 91,7 % | 1,008 |
| Mismo checkpoint, FP4 por defecto en vLLM (W4A4) | 102 GB | 0,0665 | 90,4 % | no disponible |
| Misma config con `A4_PREFILL=1` (dos planos FP4) | 102 GB | 0,0516 | 91,6 % | 1,012 |
| Misma config con un plano FP4 (por defecto de b12x) | 102 GB | 0,0665 | 90,3 % | 1,012 |
| Vardaan97 Splash Quality-PLE8 GGUF | 129-157 GB | 0,0126 | no disponible | 1,000 |
| unsloth UD-Q4_K_XL + tabla n-gram Q8 | 141 GB | 0,0210 | 94,8 % | 1,005 |
| AtomicChat AD-4.27bpw-Q4_K_M | 95 GB | 0,0842 | 89,5 % | 1,026 |

Rendimiento en una DGX Spark (GB10):

| Escenario | Decodificación | TTFT mediana | Tokens por paso |
|---|---:|---:|---:|
| Sesiones de agente de código, 2026-10-21 | 63,5-64,0 tok/s | 0,74-0,76 s | 3,40-3,56 |
| Sesiones de agente de código, lanzador estándar | 46,9 tok/s | no disponible | no disponible |
| Arnés público de 40 prompts (categorías) | 72,8-73,2 tok/s | 0,28 s | 53,5 ms/paso |
| Sesiones de agente, actualización 2026-11-01 | sin cambios (53,7-53,8 ms/paso) | 0,72 s | no disponible |

Prefill: 3.150 tok/s con 33K tokens de prompt, 3.070 tok/s con 112K y 2.815-2.850 tok/s con 8,6K (actualización del 1 de noviembre de 2026).

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 102,3 GB, por lo que requiere al menos 110-120 GB de memoria disponible; la receta se calibró con una fracción de memoria de GPU de 0,73 sobre 128 GB unificados.
- GPU objetivo: una única NVIDIA DGX Spark (GB10, arquitectura Blackwell, 128 GB de memoria unificada). Los kernels b12x y la cuantización NVFP4 dependen de esta arquitectura.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin descuantizar o recurrir a builds GGUF de terceros de menor tamaño.
- Despliegue: vLLM con la imagen fijada en `recipe/serve/serve.sh`, parches propios en `recipe/patches/` y kernels b12x. No se documenta soporte para llama.cpp, Ollama ni TGI en este repositorio.
- Throughput medido: 63-64 tok/s de decodificación en sesiones de agente, 72,8-73,2 tok/s en el arnés público de 40 prompts, 3.070-3.150 tok/s de prefill con prompts de 33K-112K tokens y 54 ms por paso especulativo.
- Configuración de servido: trozos de prefill de 8.192 tokens, caché KV en FP8, 4 tokens borrador MTP y gráficos CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repo (Qwen3.8-Flash-Next FP4) | 96,5 B | 131K | nvidia-open-model-agreement | safetensors (NVFP4) | Optimizado para DGX Spark; 63-64 tok/s decode, KL 0,0492 |
| Vardaan97 Splash Quality-PLE8 GGUF | no disponible | no disponible | no disponible | GGUF | 129-157 GB; KL 0,0126, la más fiel a BF16 de la tabla |
| unsloth UD-Q4_K_XL + Q8 n-gram | no disponible | no disponible | no disponible | GGUF | 141 GB; KL 0,0210, top-1 94,8 % |
| AtomicChat AD-4.27bpw-Q4_K_M | no disponible | no disponible | no disponible | GGUF | 95 GB; KL 0,0842, top-1 89,5 % |

Los tres alternativos son cuantizaciones del mismo modelo base Qwen3.8-Flash-Next, no modelos distintos. La comparación relevante es de fidelidad frente a BF16 y de encaje en hardware: los builds GGUF de mayor tamaño logran una KL mucho menor (0,0126-0,0210 frente a 0,0492) a costa de 129-157 GB, mientras que este repo prioriza velocidad de servido en vLLM sobre una única DGX Spark. No se dispone de datos de benchmarks frente a otros modelos de la misma categoría (por ejemplo, otros MoE de ~100 B) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint FP4 de NVIDIA está más lejos de BF16 que los mejores builds GGUF: KL media de 0,0492 frente a 0,0126-0,0210, con una pérdida de top-1 de aproximadamente 3 puntos respecto al mejor GGUF (91,7 % frente a 94,8 %).
- Las puntuaciones de calidad varían unos 1,5 puntos entre arranques del servidor porque el kernel de decodificación de b12x suma las salidas de expertos con atómicas BF16, lo que introduce no determinismo.
- La receta está atada a una DGX Spark (GB10) y a kernels b12x; no es portable a otras GPU sin sustituir la ruta de servido.
- La licencia es nvidia-open-model-agreement, no Apache 2.0 ni MIT: es necesario revisar sus términos antes de cualquier uso comercial, y el campo `license` de HuggingFace aparece como `other`.
- No se documentan los idiomas soportados; no se puede asumir cobertura multilingüe sin verificación.
- No se publican datos sobre sesgos, alucinación ni evaluación de seguridad en la información disponible.
- El conjunto de sesiones de agente usado para medir throughput es privado y no está publicado, por lo que esas cifras no son reproducibles de forma independiente.
- El rendimiento de prefill y decodificación se midió con la Spark inactiva y sin otros clientes; en producción con concurrencia los valores serán inferiores.
- El repositorio tiene 132 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/diffbot/Qwen3.8-Flash-Next-FP4-Local-DGX-Spark
- Checkpoint original de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Conjunto de métricas de referencia (AtomicChat): https://huggingface.co/datasets/AtomicChat/Qwen3.8-Flash-Next-Uncensored-GGUF-metrics
- Build GGUF Vardaan97 Splash: https://huggingface.co/Vardaan97/Qwen3.8-Flash-Next-Splash-GGUF
- Build GGUF AtomicChat: https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF
- Licencia: fichero LICENSE del repositorio (nvidia-open-model-agreement)
