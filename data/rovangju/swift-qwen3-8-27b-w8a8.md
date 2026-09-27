# rovangju/Swift-Qwen3.8-27b-W8A8

## Resumen

Swift-Qwen3.8-27b-W8A8 es una cuantización post-entrenamiento W8A8 (pesos y activaciones en INT8) del modelo multimodal ukisai/Swift-Qwen3.8-27b, un modelo de 27.781.427.952 parámetros (≈27,78 B) de la familia Qwen3.5 y clase `Qwen3_5ForConditionalGeneration`, capaz de procesar texto e imágenes. Lo publica el usuario rovangju y está pensado para servir el modelo en vLLM reduciendo a la mitad el coste de memoria de los pesos respecto a bf16, manteniendo GEMMs INT8×INT8 reales en inferencia.

El interés principal es que no es un checkpoint SmoothQuant: usa escalas de pesos simétricas per-channel estáticas y cuantización de activaciones per-token dinámica, sin necesidad de datos de calibración. La torre de visión (`model.visual.*`), el `lm_head` (~1,3 B de parámetros) y el módulo MTP se mantienen en bf16, de modo que el modelo conserva la ruta multimodal completa.

Frente al checkpoint SmoothQuant W8A8 que el autor usa como referencia, este repositorio mejora el prefill (TTFT un 15,8% menor en 8192→64) y el punto de operación «balanced» orientado a agentes (+7,7% de tokens de salida por segundo, −18,4% de TTFT), a cambio de ceder un 6,5% en decodificación pura. El repositorio no tiene descargas ni likes y no publica información sobre idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) de la familia Qwen3.5, clase `Qwen3_5ForConditionalGeneration`; cuantización W8A8 sobre compressed-tensors |
| Parámetros totales | 27.781.427.952 (≈27,78 B) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el benchmark usa prefill de 8192 tokens y las pruebas de calidad `max_model_len=4096`) |
| Tipos de cuantización | W8A8 INT8: pesos INT8 simétricos per-channel con escalas estáticas; activaciones INT8 simétricas per-token dinámicas en tiempo de servicio; torre de visión, `lm_head` (~1,3 B) y módulo MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | `swift-open-license-1.0` (etiquetada como `license: other`) |
| Formato de pesos | safetensors con compressed-tensors, cargable en vLLM mediante `CompressedTensorsW8A8Int8`; tamaño del checkpoint ≈29,1 GiB (repositorio de 31,2 GB) |

## Arquitectura y entrenamiento

El modelo base es multimodal de la familia Qwen3.5 y atiende tareas de imagen-texto-a-texto. La cuantización se realizó con llm-compressor 0.14 mediante `oneshot` y `QuantizationModifier(targets="Linear", scheme="W8A8")`. Dos decisiones se documentan explícitamente: se cargó el modelo completo con `AutoModelForImageTextToText` en lugar de `AutoModelForCausalLM` (que resuelve `qwen3_5` a la clase solo-texto y descarta silenciosamente la torre de visión, 333 tensores), y se ejecutó una verificación posterior al guardado tensor por tensor contra el índice original, comprobando las formas de las escalas per-channel y fallando de forma dura si se escribía cualquier tensor de escala de activación. No se requirió calibración: las escalas de peso derivan de los propios pesos y la cuantización de activaciones es dinámica.

En inferencia, las activaciones no se reescalan a bf16 (a diferencia de W8A16), por lo que las GEMMs son INT8×INT8 reales. El script de servicio recomendado incluye `--mamba-cache-mode align`, lo que apunta a una arquitectura híbrida con capas tipo mamba, aunque la información disponible no detalla la composición de capas ni el número de tokens de entrenamiento, la mezcla del dataset o si hubo RLHF/DPO. El autor tampoco documenta el pipeline de decodificación especulativa del modelo base, más allá de que en su arnés de benchmark se usa el draft DFlash `z-lab/Qwen3.8-27B-DFlash2` con 5 tokens especulativos y muestreo probabilístico.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla compatible con el ecosistema Qwen.
- Procesamiento de imagen y texto de forma conjunta (`image-text-to-text`): el pipeline declarado en HuggingFace es exactamente ese.
- Razonamiento con modo «thinking»: el script de servicio habilita `--reasoning-parser qwen3`, lo que permite separar el bloque de razonamiento de la respuesta final.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder` en vLLM.
- Compatibilidad con decodificación especulativa mediante el método DFlash y un modelo draft externo.
- Compatibilidad con prefix caching y con ejecución tensor-parallel (TP=2 validado por el autor; TP=1 es el valor por defecto).
- Capacidades multilingües: no disponible (la ficha no declara idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo acepta imágenes y texto en el mismo diálogo, por lo que puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas, fotografías o diagramas junto a preguntas en lenguaje natural.
- Agentes con herramientas: al soportar tool calling con el parser `qwen3_coder`, puede encadenar llamadas a APIs y funciones externas dentro de flujos multi-paso, por ejemplo consultar un CRM y redactar la respuesta final.
- Análisis de documentos técnicos con figuras: indexación y respuesta sobre manuales, informes o planos donde la respuesta depende tanto del texto como de la imagen, manteniendo la torre de visión en bf16 para no degradar la percepción.
- Razonamiento con traza explícita: gracias al `reasoning-parser qwen3`, es adecuado para tareas donde interesa auditar el razonamiento intermedio (matemáticas, diagnóstico de errores, planificación) y no solo la respuesta final.
- Despliegue de bajo coste en producción: al reducir el peso de los pesos a INT8 (≈29,1 GiB), permite servir un modelo de 27,78 B en GPUs con menos memoria que la versión bf16, con GEMMs INT8×INT8 y `--enable-prefix-caching` para prompts repetidos.
- Backend de generación de código asistida: el modelo base es de la familia Qwen, con parser de tool calling orientado a código, y puede integrarse como backend OpenAI-compatible en entornos de desarrollo.
- Servicio con decodificación especulativa: la configuración de referencia con DFlash K=5 es directamente reutilizable para despliegues sensibles a la latencia, con TTFT de 647,9 ms en carga balanceada según las mediciones del autor.
- Procesamiento por lotes con tensor-parallel: para volúmenes altos, el checkpoint admite reparto entre dos GPUs (TP=2), lo que permite usar nodos con GPUs de 24–48 GB en lugar de una única GPU grande.

## Benchmarks y rendimiento

Rendimiento comparado por el autor frente al checkpoint W8A8 con SmoothQuant (`Freaksterz/Qwen3.8-27B-SmoothQuant-W8A8-INT8`), con configuración de servicio idéntica (FLASH_ATTN, decodificación especulativa DFlash K=5, sin cambio de dtype en la caché KV), concurrencia ≤ 3 y ejecuciones completas sobre una única NVIDIA CMP 170HX (64 GB), GPU 1 de una máquina de 2 GPUs con host Xeon Gold 6154:

| Métrica | Swift W8A8 (este repo) | SmoothQuant W8A8 | Δ |
|---|---:|---:|---:|
| Prefill 8192→64, TTFT (mediana) | 2175,4 ms | 2583,1 ms | −15,8% |
| Prefill 8192→64, tok/s | 3766 | 3171 | +18,8% |
| Decode 256→1024, TPOT (mediana) | 9,98 ms | 9,34 ms | +6,9% |
| Decode 256→1024, tok/s | 100,2 | 107,1 | −6,5% |
| Balanced, TTFT (mediana) | 647,9 ms | 794,0 ms | −18,4% |
| Balanced, TPOT (mediana) | 14,97 ms | 16,71 ms | −10,4% |
| Balanced, tok/s de salida | 152,8 | 141,8 | +7,7% |

El propio autor advierte de que su arnés fija la longitud de salida y, por tanto, no captura la ventaja principal del modelo en uso real: respuestas más cortas y menos razonamiento por turno.

Comprobaciones de calidad con lm-eval-harness contra el backend de vLLM (`dtype=bfloat16`, `max_model_len=4096`, semilla 1234, 0-shot) sobre un subconjunto de 200 muestras por tarea:

| Tarea | Métrica | Valor | Error estándar |
|---|---|---:|---:|
| ARC-Easy | acc | 0,795 | ± 0,0286 |
| ARC-Easy | acc_norm | 0,680 | ± 0,0331 |
| HellaSwag | acc | 0,605 | ± 0,0347 |
| HellaSwag | acc_norm | 0,740 | ± 0,0311 |
| TruthfulQA (MC2) | acc | 0,5394 | ± 0,0308 |
| GSM8K (3-shot) | exact_match (flexible-extract) | 0,565 | ± 0,0351 |
| GSM8K (3-shot) | exact_match (strict-match) | 0,000 | ± 0,0000 |

El autor señala que el 0,000 en strict-match de GSM8K es un artefacto del filtro estricto del arnés sobre esta plantilla y no un fallo del modelo. No hay benchmarks completos (MMLU, HumanEval u otros) publicados en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos: ≈29,1 GiB según el tamaño de checkpoint declarado, más la caché KV y los búferes de activaciones. Con contexto de 8192 tokens hay que reservar varios GiB adicionales, por lo que un presupuesto práctico de 32–40 GB es razonable, aunque el dato exacto de consumo no está publicado.
- GPU validadas por el autor: NVIDIA CMP 170HX de 64 GB, en TP=1. El propio autor indica que el tensor-parallel entre dos GPUs también funciona.
- Cabe en GPU de consumo: no en una sola GPU de 24 GB (RTX 4090, RTX 3090) con TP=1, porque solo los pesos ya superan esa cifra. Sí es viable en dos GPU de 24 GB con TP=2 (48 GB agregados, con poco margen para caché KV) y en tarjetas de 48–80 GB (A6000, L40S, A100 80 GB, H100).
- Opciones de despliegue: vLLM es la ruta documentada y la única que aprovecha los kernels `CompressedTensorsW8A8Int8`. El autor no menciona soporte de llama.cpp, Ollama, TGI ni GGUF.
- Configuración de referencia: `vllm serve rovangju/Swift-Qwen3.8-27b-W8A8 --dtype bfloat16 --enable-prefix-caching`, con opciones adicionales de tool calling (`--tool-call-parser qwen3_coder`), razonamiento (`--reasoning-parser qwen3`), `--mamba-cache-mode align`, `--max-num-batched-tokens 16384` y decodificación especulativa DFlash con 5 tokens.
- Latencia y throughput medidos (CMP 170HX, concurrencia ≤ 3, con decodificación especulativa): TTFT de 2175,4 ms y 3766 tok/s de prefill en 8192→64; 100,2 tok/s y TPOT de 9,98 ms en decodificación 256→1024; 152,8 tok/s de salida y TTFT de 647,9 ms en carga balanceada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (balanced) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rovangju/Swift-Qwen3.8-27b-W8A8 (este repo) | 27,78 B (INT8 W8A8) | no disponible | 152,8 tok/s de salida; TTFT 647,9 ms; TPOT 14,97 ms | `swift-open-license-1.0` | HuggingFace, vLLM |
| Freaksterz/Qwen3.8-27B-SmoothQuant-W8A8-INT8 | 27,78 B sobre la misma base | no disponible | 141,8 tok/s de salida; TTFT 794,0 ms; TPOT 16,71 ms | no disponible | HuggingFace, vLLM |
| ukisai/Swift-Qwen3.8-27b (modelo base) | 27,78 B (bf16) | no disponible | no disponible | `swift-open-license-1.0` | HuggingFace |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible (modelo draft) | no disponible | se usa como draft con K=5 en la configuración de referencia | no disponible | HuggingFace |

No se dispone de comparaciones con alternativas de otros fabricantes (familias Llama, Mistral, Gemma o similares) en la información proporcionada.

## Limitaciones y advertencias

- Las métricas de calidad publicadas provienen de un subconjunto de solo 200 muestras por tarea, con errores estándar amplios: el propio autor las califica de filtro de cordura, no de benchmark final.
- El 0,000 en GSM8K strict-match es un artefacto conocido del arnés sobre esta plantilla, pero conviene verificarlo con el pipeline propio antes de usarlo como referencia.
- La cuantización W8A8 puede degradar la calidad respecto al modelo base en bf16; el repositorio no publica una comparación directa contra `ukisai/Swift-Qwen3.8-27b` sin cuantizar.
- La licencia es `license: other` con nombre `swift-open-license-1.0`; es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que puede incluir restricciones específicas.
- No se declaran idiomas soportados, composición del dataset ni sesgos conocidos; el rendimiento en castellano es, por tanto, desconocido.
- La longitud de contexto no está documentada; los datos disponibles solo cubren 4096 tokens en evaluación y 8192 en prefill, así que no debe asumirse una ventana mayor.
- El despliegue eficiente depende de vLLM y del soporte de compressed-tensors (`CompressedTensorsW8A8Int8`); otros motores de inferencia no están soportados según la documentación.
- Los números de rendimiento se midieron en una única NVIDIA CMP 170HX con concurrencia ≤ 3, con decodificación especulativa activa y longitudes de salida fijas; no son extrapolables directamente a otros entornos ni a cargas de alta concurrencia.
- El rendimiento comparado se evalúa contra un único checkpoint SmoothQuant, no contra el modelo en bf16.
- La torre de visión y el `lm_head` permanecen en bf16, de modo que el ahorro de memoria es menor que el de una cuantización completa del grafo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rovangju/Swift-Qwen3.8-27b-W8A8
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Checkpoint SmoothQuant usado como referencia: https://huggingface.co/Freaksterz/Qwen3.8-27B-SmoothQuant-W8A8-INT8
- Modelo draft de decodificación especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
