# iromu/Qwen2.5-1.5B-openjev-FP8

## Resumen

`iromu/Qwen2.5-1.5B-openjev-FP8` es un ajuste fino especializado del modelo base `Qwen/Qwen2.5-1.5B`, orientado a tareas de decisión tipada y clasificación de etiqueta única. El autor, iromu, partió de un fine-tune con LoRA sobre el corpus `ZefanCai/Open-Jev` y después cuantizó el resultado a FP8 (W8A8) con NVIDIA ModelOpt, pensando en servir el modelo en hardware de la clase GB10 (Grace Blackwell). El checkpoint es, por tanto, una versión cuantizada de `iromu/Qwen2.5-1.5B-openjev`, que a su vez es un adaptador LoRA fusionado sobre Qwen2.5-1.5B.

El modelo resuelve un problema muy acotado: dado un estado, una pregunta y un conjunto de opciones con una distribución de probabilidad asociada, devuelve la letra de la opción argmax. No está pensado como sustituto general de modelos Qwen más grandes, sino como un emisor de etiquetas fiable y de baja latencia para pipelines de clasificación y decisión. La arquitectura subyacente es un transformer decoder-only de Qwen2.5 con 1.543.714.304 parámetros, licencia Apache 2.0 y solo inglés declarado.

La relevancia actual viene de su formato de despliegue: FP8 con escalas por canal y por token, compatible con la ruta `modelopt` de vLLM, lo que permite servirlo con muy poca memoria y mantener prácticamente la precisión del modelo BF16 (84,9 % frente a 85,2 % de acierto de letra en la validación). Es un caso práctico de cuantización de precisión mixta aplicada a un fine-tune pequeño con un propósito muy definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con fine-tune LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max sequence length de 4096) |
| Tipos de cuantizacion | FP8 W8A8 (E4M3), escalas de peso por canal y escalado dinamico de activaciones por token; `lm_head` y `model.embed_tokens` en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors + `hf_quant_config.json` (export `export_hf_checkpoint` de ModelOpt) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atención estándar y RoPE, sobre el que se aplicó un ajuste supervisado (SFT) con LoRA. La configuración del adaptador es rango 32, alpha 32, dropout 0,05 y módulos objetivo `*.proj` (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó con NeMo-RL en bfloat16, con entropía cruzada enmascarada al turno del asistente sobre las filas de decisión tipada, longitud máxima de secuencia 4096, optimizador AdamW con lr 5e-5 y weight decay 0,01, calentamiento lineal de 100 pasos seguido de decaimiento coseno hasta 1e-6, batch global 64 (micro batch 2) y 1250 pasos con validación cada 125.

El corpus de entrenamiento es el split `train` de `ZefanCai/Open-Jev`, donde cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas; el objetivo es la opción argmax escrita como una única letra de etiqueta. La innovación técnica destacable no está en el entrenamiento sino en la cuantización: se usó la configuración `FP8_PER_CHANNEL_PER_TOKEN_CFG` de NVIDIA ModelOpt, que escribe escalas de peso por canal y escalado dinámico por token, y no una `input_scale` estática. El autor documenta explícitamente que la configuración estática `FP8_DEFAULT_CFG` provoca salidas degeneradas en vLLM porque este lee la escala de un centinela no inicializado; la variante por canal/por token es la que el servidor carga correctamente.

## Capacidades

- Generación de texto conversacional básica heredada de Qwen2.5-1.5B, aunque el fine-tune la orienta a respuestas de una sola letra.
- Decisión tipada: responde a un prompt con estado, pregunta y opciones devolviendo la letra de la opción argmax.
- Clasificación de etiqueta única sobre conjuntos de opciones cerrados.
- Emisión de logprobs por letra de opción, lo que permite leer la distribución de probabilidad en la posición de respuesta (usado por JevBench).
- Capacidades multilingües limitadas: solo inglés declarado.
- No se documentan tool calling, function calling, soporte de agentes, visión, audio ni modo de razonamiento extendido.
- No está diseñado como modelo generalista; el propio autor lo declara no apto como reemplazo de modelos Qwen mayores.

## Casos de uso

- Clasificación de tickets de soporte: el modelo recibe el texto del ticket y un conjunto cerrado de categorías y devuelve la letra de la categoría argmax, con un coste de inferencia mínimo gracias a la cuantización FP8.
- Enrutamiento de consultas en un pipeline RAG: dado el estado de la conversación y las opciones de ruta (buscar en índice, escalar a humano, responder directamente), el modelo selecciona una etiqueta única que el orquestador interpreta.
- Moderación de contenido con etiquetas discretas: se presentan las políticas como opciones y el modelo emite la letra de la política aplicable, con lectura de logprobs para umbralizar casos ambiguos.
- Etiquetado de datos a gran escala: al ser un modelo de 1.5B en FP8, puede desplegarse en vLLM para clasificar lotes de registros con throughput alto y huella de memoria reducida.
- Selección de respuesta en sistemas de encuestas o formularios: el estado, la pregunta y las opciones se formatean según la plantilla de decisión y el modelo devuelve una única letra consistente.
- Evaluación de coherencia probabilística: integrado en JevBench para medir consistencia de representación, independencia de lote, coherencia de medida, coherencia lógica y coherencia de conjunto de opciones a partir de los logprobs.
- Servicio en hardware de clase GB10: el formato FP8 W8A8 con la ruta `modelopt` de vLLM está pensado para este tipo de aceleradores con memoria limitada.

## Benchmarks y rendimiento

El autor publica dos tablas. La primera es la validación sobre el split `validation` de Open-Jev (3.495 filas, decodificación greedy, tope de 384 tokens):

| Modelo | Cuantizacion | n | Letra emitida | Letra correcta | Δ vs base |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-openjev | BF16 | 3495 | 3495/3495 (100,0 %) | 2979/3495 (85,2 %) | (predecesor) |
| Qwen2.5-1.5B-openjev | FP8 | 3495 | 3495/3495 (100,0 %) | 2969/3495 (84,9 %) | −0,3 pp |

La segunda es la puntuación de coherencia de JevBench (`jevbench-mini`, tolerancia 0,05, temperatura 1,0), medida en vLLM leyendo los logprobs de la letra de opción:

| Modelo | Overall | Δ vs BF16 | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|
| BF16 | 38,5 | — | 59,2 | 31,7 | 14,5 | 67,9 | 19,4 |
| FP8 | 35,9 | −2,6 | 49,4 | 31,7 | 12,5 | 70,4 | 15,3 |

REP es consistencia de representación, BAT independencia de lote, MEA coherencia de medida de probabilidad, LOG coherencia lógica y CHO coherencia de conjunto de opciones; Overall es la media de las cinco. El autor señala que MEA y CHO son las dimensiones más afectadas por la cuantización, y que el emisor de letras es sobreconfiado y no preserva la media bajo transformación. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 1,8 GB en safetensors; el checkpoint FP8 W8A8 con pesos lineales en FP8 y embeddings/`lm_head` en bf16 requiere del orden de 2 GB de pesos, más caché KV y overhead del runtime. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: hardware de clase GB10 (Grace Blackwell) según el autor; también válidas GPUs con soporte FP8 en vLLM (por ejemplo H100, L40S, RTX 4090 en la medida en que la ruta `modelopt` lo permita).
- Cabe en GPU de consumo: sí, por tamaño de pesos; la viabilidad práctica depende del soporte de FP8 y de la ruta `modelopt` en el runtime elegido.
- Despliegue: vLLM con `--quantization modelopt` (CLI o API Python); el autor menciona también un checkpoint GGUF hermano para llama.cpp/Ollama y un checkpoint NVFP4.
- Latencia y throughput: no se publican cifras de serving; el autor aclara que la validación se hizo con decodificación greedy de un solo stream, no con throughput de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Precisión en tarea | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-openjev-FP8 | 1,54 B | no disponible | FP8 W8A8 (ModelOpt) | 84,9 % letra correcta; JevBench 35,9 | Apache 2.0 |
| Qwen2.5-1.5B-openjev (BF16) | 1,54 B | no disponible | BF16 | 85,2 % letra correcta; JevBench 38,5 | Apache 2.0 |
| Qwen2.5-1.5B (base) | 1,54 B | 32.768 tokens (según la familia Qwen2.5) | BF16 y múltiples cuantizaciones de la comunidad | no evaluado en Open-Jev | Apache 2.0 |
| Qwen2.5-1.5B-openjev-GGUF | 1,54 B | no disponible | GGUF (varias cuantizaciones) | no disponible | Apache 2.0 |

La comparación más directa es con el BF16 del mismo fine-tune: la cuantización FP8 pierde 0,3 puntos porcentuales de acierto de letra y 2,6 puntos de coherencia global en JevBench. Frente al Qwen2.5-1.5B base, la diferencia está en el fine-tune especializado, no en el tamaño. No se dispone de comparación con otros fine-tunes de decisión de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado: no es un reemplazo general de Qwen2.5-1.5B ni de modelos mayores; el autor lo declara explícitamente.
- Solo inglés declarado; el rendimiento en otros idiomas no está documentado.
- La cuantización FP8 degrada la coherencia probabilística: MEA cae de 14,5 a 12,5 y CHO de 19,4 a 15,3, y el modelo es sobreconfiado sin preservar la media bajo transformación.
- La configuración de cuantización es sensible: usar `FP8_DEFAULT_CFG` en lugar de la configuración por canal/por token produce salidas degeneradas en vLLM, según el autor.
- Riesgo de alucinación en generación libre: el fine-tune está orientado a emitir una letra; fuera de ese formato la calidad no está validada.
- La longitud de contexto efectiva del checkpoint no está documentada; el entrenamiento usó 4096 tokens.
- Solo 39 descargas y 0 likes en el momento de la consulta, lo que implica poca validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los datos de entrenamiento (`ZefanCai/Open-Jev`) y del modelo base.
- El autor advierte que la validación se hizo con decodificación greedy de un solo stream; no hay datos de throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-FP8
- Modelo BF16 con tabla de validación: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-NVFP4
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench: https://github.com/JevBench/jevbench
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Ficha de terceros: https://free2aitools.com/model/iromu/qwen2.5-1.5b-openjev-fp8
