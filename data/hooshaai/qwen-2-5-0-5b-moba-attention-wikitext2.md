# Hooshaai/qwen-2.5-0.5b-moba-attention-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-moba-attention-wikitext2`, publicado por el usuario Hooshaai, es un checkpoint experimental derivado de Qwen/Qwen2.5-0.5B en el que se han sustituido quirúrgicamente parte de las capas de atención del decoder por el módulo `MoBAAttention` (Mixture of Block Attention), un mecanismo de atención subcuadrática orientado a modelado de contexto largo. El trabajo se enmarca en el proyecto NeuralOps "Attention Zoo", que permite intercambiar operadores de atención en transformers preentrenados mediante adaptadores y posteriormente recuperar la calidad con destilación de conocimiento.

El modelo parte de los pesos originales de Qwen2.5-0.5B (arquitectura transformer decoder-only con GQA, 14 cabezas de consulta y 2 de clave/valor, `head_dim=64`, `hidden_size=896`) y aplica un patrón híbrido `hybrid_3_1`: 18 de las 24 capas usan MoBA y 6 capas conservan atención cuadrática densa como anclas. Tras la cirugía, la perplejidad en WikiText-2 se dispara a 151,45 y se recupera hasta 32,15 mediante un proceso de destilación en dos etapas de 240 pasos totales.

Su relevancia es fundamentalmente metodológica: demuestra que es posible realizar un intercambio de operador de atención en un modelo pequeño y recuperar buena parte del rendimiento con un coste de entrenamiento muy bajo (unos 180 segundos en una sola GPU con 16 GB de VRAM en FP16). No es un modelo pensado para producción generalista, sino un artefacto de investigación para estudiar atención subcuadrática y destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida MoBA + atención densa (patrón `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento de destilación usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor usa FP16 en los ejemplos) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,45 MB; `attention_weights.safetensors` 86,24 MB) |

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-0.5B estándar (transformer decoder-only con GQA de 14 cabezas de consulta y 2 de clave/valor, `head_dim=64`, `hidden_size=896`) al que se le ha aplicado una "cirugía" de atención: 18 de las 24 capas del decoder se sustituyen por el módulo `MoBAAttention` mediante el `QwenAttentionAdapter`, que gestiona la expansión de cabezas KV (factor 7x donde es necesario) y mantiene el contrato de una única `o_proj`. Las 6 capas restantes (índices 3, 7, 11, 15, 19 y 23) conservan atención cuadrática densa como anclas. MoBA calcula, para cada bloque de consultas, puntuaciones de centroide a nivel de bloque, selecciona los top-k bloques de claves más relevantes y ejecuta atención densa dentro de los bloques seleccionados más el bloque diagonal causalmente visible.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) dura 73 pasos (54,3 s) y usa `lm_head` puenteado con MSE y coseno a nivel de capa (peso 0,25). La etapa 2 (destilación de representaciones multicapa) dura 167 pasos (125,9 s) con MSE y coseno a nivel de capa (peso 0,50). En total son 240 pasos en 180,6 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 16.049 MB de VRAM en FP16 con autocast y parámetros maestros en FP32. La perplejidad causal pasa de 151,45 (post-cirugía, zero-shot) a 32,15 tras la destilación, una delta de -119,30.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo MoBA (según la tabla de capacidades del autor).
- Soporte nativo de GQA (14 cabezas de consulta, 2 de clave/valor).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language`.
- No se documenta thinking mode, visión ni audio.
- Compatible con la API universal de NeuralOps (`load_surgeried_model`) para carga directa desde el Hub.

## Casos de uso

- Investigación en atención subcuadrática: sirve como banco de pruebas reproducible para comparar MoBA frente a atención densa en un transformer pequeño, con métricas de perplejidad y telemetría de entrenamiento ya publicadas.
- Estudio de destilación de conocimiento post-cirugía: el par de etapas (alineación con backbone congelado y destilación multicapa) y sus hiperparámetros documentados permiten replicar y extender el método en otros modelos y datasets.
- Experimentación con el ecosistema NeuralOps: el modelo se carga con `load_surgeried_model` y permite validar el flujo de intercambio de operadores de atención en pipelines de investigación.
- Benchmarking de eficiencia de atención: al conservar 6 capas densas como anclas y 18 con MoBA, es útil para medir el equilibrio entre coste computacional y calidad en contextos de hasta 512 tokens (longitud usada en entrenamiento).
- Prototipado educativo: modelo de 0,5B con licencia MIT que cabe en GPU de consumo y permite demostrar conceptos de atención híbrida y destilación sin grandes recursos.
- Generación de texto en inglés de baja latencia en entornos con recursos limitados: el checkpoint completo ocupa aproximadamente 1 GB en FP16, adecuado para pruebas en portátiles con GPU modesta.
- No se recomienda como sustituto directo de Qwen2.5-0.5B en aplicaciones de producción generalistas, dado que su calidad se ha evaluado únicamente en perplejidad sobre WikiText-2.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, split validation) | Perplejidad | 32,15 |
| WikiText-2 post-cirugía, zero-shot (Stage 0) | Perplejidad | 151,45 |
| Delta de perplejidad tras destilación | Δ | -119,30 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para los pesos (944,45 MB de `model.safetensors` más 86,24 MB de `attention_weights.safetensors`), más overhead de activaciones y contexto.
- VRAM de entrenamiento documentada: 16.049 MB de pico en FP16 autocast con parámetros maestros en FP32.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en FP16; el autor entrenó con una GPU de 16 GB (no especifica modelo).
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, así como en GPUs integradas con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: el autor documenta carga vía `transformers` (con `apply_qwen_attention_surgery`) y vía `neuralops.hub.load_surgeried_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento de destilación completó 240 pasos en 180,6 s con `seq_len=512` y `grad_accum=4`, pero no se aportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Atención | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-moba-attention-wikitext2` | 0,5B | no disponible (entrenado a 512) | MIT | Híbrida MoBA + densa (18/24 MoBA) | Hugging Face, 318 descargas |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (según Qwen2.5) | Apache 2.0 | Densa con GQA | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 tokens (según Qwen2.5) | Apache 2.0 | Densa con GQA | Hugging Face |

La comparación con el modelo base es la más directa: el checkpoint aquí descrito modifica 18 de 24 capas de atención y recupera una perplejidad de 32,15 en WikiText-2 tras destilación, pero no se aportan métricas comparativas del base en el mismo split dentro de la información disponible. Frente a Qwen2.5-1.5B, la diferencia de tamaño (3x) y la falta de benchmarks comunes impiden una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Modelo experimental de investigación: no se han publicado evaluaciones en tareas downstream (razonamiento, código, matemáticas) más allá de la perplejidad en WikiText-2.
- Riesgo de alucinación inherente a un modelo de 0,5B; la destilación solo se ha optimizado para modelado de lenguaje causal en WikiText-2, no para veracidad factual.
- Sesgos: no se documenta ningún análisis de sesgos; el modelo hereda los sesgos del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Limitación de idioma: solo se declara inglés (`language: en`); el rendimiento en castellano u otros idiomas no está evaluado.
- Limitación de contexto: el entrenamiento de destilación usó `seq_len=512`; no se documenta la longitud de contexto efectiva soportada ni el comportamiento más allá de esa ventana.
- Restricciones de licencia: licencia MIT, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0; conviene revisar la compatibilidad y las condiciones de atribución del modelo base.
- Dependencia de código externo: la carga requiere el paquete `neuralops` y/o el script `apply_qwen_attention_surgery` del repositorio NeuralOps, lo que añade una dependencia no estándar frente a `transformers` puro.
- El autor referencia rutas del Hub con el identificador `tahamajs/...` en los ejemplos, mientras que el repositorio real es `Hooshaai/...`; esto puede provocar errores de carga si se copian los ejemplos literalmente.
- La métrica de perplejidad está marcada como `verified: false` en la model card; no ha sido validada de forma independiente.
- No se documenta soporte de tool calling, agentes ni cuantizaciones GGUF/AWQ/GPTQ, lo que limita su uso en pipelines de producción estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-moba-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2 (Salesforce/wikitext): https://huggingface.co/datasets/Salesforce/wikitext
