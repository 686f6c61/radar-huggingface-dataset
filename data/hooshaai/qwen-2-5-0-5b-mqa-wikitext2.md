# Hooshaai/qwen-2.5-0.5b-mqa-wikitext2

## Resumen

`qwen-2.5-0.5b-mqa-wikitext2` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps Qwen Attention Zoo. Se trata de un fine-tune quirúrgico de Qwen/Qwen2.5-0.5B en el que 18 de las 24 capas de atención del decoder original han sido sustituidas por módulos de Multi-Query Attention (MQA, Shazeer 2019) y posteriormente recuperadas mediante destilación de conocimiento en dos etapas sobre WikiText-2. El objetivo no es producir un modelo listo para producción, sino servir de banco de pruebas reproducible para comparar variantes de atención subcuadrática dentro de la familia Qwen2.5.

El modelo base Qwen2.5-0.5B es un transformer decoder-only de 0,49 mil millones de parámetros con 24 capas, 14 cabezas de consulta, 2 cabezas KV y dimensión oculta de 896. La intervención reemplaza el esquema GQA original (14:2) por MQA puro (una única cabeza KV compartida) en las capas no ancladas, conservando 6 capas cuadráticas completas en los índices 3, 7, 11, 15, 19 y 23 para mantener cierta capacidad de modelado global. El resultado es un modelo de 0,5B con caché KV reducida hasta 14 veces en las capas modificadas.

La relevancia actual es metodológica: el autor documenta con detalle la telemetría del proceso (PPL pre-destilación de 541.890,55, PPL final de 205,89, 517 pasos de optimización en 180,3 segundos, pico de VRAM de 12.234 MB), lo que convierte al checkpoint en una referencia útil para investigadores que quieran evaluar el coste real de sustituir GQA por MQA y las técnicas de recuperación necesarias. La licencia MIT y el tamaño reducido del repo (0,1 GB) facilitan su reproducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida: MQA en 18/24 capas y atención cuadrática completa en 6/24 capas ancla (patrón `hybrid_3_1`) |
| Parámetros totales | 0,49 mil millones (heredados de Qwen2.5-0.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero el autor no lo declara para este checkpoint) |
| Tipos de cuantización | no disponible (el autor publica pesos en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 82,27 MB) más `config.json` y `tokenizer.json`; requiere cargar el modelo base y aplicar la cirugía antes de inyectar los pesos |
| Dimensión oculta | 896 |
| Cabezas de consulta / KV | 14 cabezas Q; 1 cabeza KV por capa MQA (frente a 2 en el modelo original) |
| Dimensión por cabeza | 64 |
| Librería de carga | `neuralops` |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-0.5B, un transformer decoder-only con RoPE, RMSNorm y SwiGLU. La modificación estructural consiste en sustituir el módulo `Qwen2Attention` por `MultiQueryAttention` en 18 de las 24 capas, usando el `QwenAttentionAdapter` que gestiona la proyección de 14 cabezas Q y 2 KV a un único KV head compartido, con un contrato de `o_proj` única. Las capas en los índices 3, 7, 11, 15, 19 y 23 conservan la atención cuadrática original para actuar como anclas. El patrón `hybrid_3_1` intercala bloques de tres capas MQA por cada capa cuadrática.

El entrenamiento se realiza en dos etapas de destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecuta 157 pasos en 54,3 segundos con el `lm_head` desactivado, usando MSE y similitud coseno sobre estados ocultos con peso 0,25. La etapa 2 (destilación de representaciones multicapa) ejecuta 360 pasos en 125,8 segundos con peso 0,50. En total, 517 pasos y 180,3 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`. El pico de VRAM registrado es de 12.234 MB en FP16 con autocast y parámetros maestros en FP32. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (`supports_bidirectional=True`, `supports_cross_attention=True`), aunque el checkpoint se distribuye para uso causal.
- Soporte nativo de RoPE y GQA a nivel de implementación del módulo MQA.
- Reducción de la caché KV en las capas modificadas, lo que permite mayor throughput en decodificación autoregresiva.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card, aunque el modelo base Qwen2.5 tiene cobertura multilingüe amplia que este fine-tune no preserva explícitamente.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint sirve para medir empíricamente la pérdida de calidad al sustituir GQA por MQA en un modelo pequeño, comparando la PPL de 205,89 con la del Qwen2.5-0.5B original sobre WikiText-2.
- Reproducción de experimentos de destilación de conocimiento: la telemetría detallada (517 pasos, dos etapas con pesos 0,25 y 0,50, pico de VRAM de 12.234 MB) permite replicar el pipeline en otras arquitecturas y comparar curvas de recuperación.
- Benchmark de latencia y memoria en decodificación: al reducir la caché KV hasta 14 veces en 18 capas, es útil para estudiar el impacto real en throughput de generación con `batch_size` alto y secuencias largas.
- Docencia y formación técnica: modelo de 0,5B con licencia MIT y repo de 0,1 GB que cabe en cualquier GPU consumer, ideal para explicar cirugía de atención, adaptadores y destilación en cursos de NLP.
- Prototipado de pipelines NeuralOps: sirve como caso de prueba para la API `load_surgeried_model` y para validar el registro `ATTENTION_REGISTRY` antes de aplicar la misma técnica a modelos mayores.
- Evaluación de robustez post-cirugía: útil para estudiar cómo se degrada la coherencia en generación libre tras reemplazar módulos de atención, más allá de la perplejidad agregada en WikiText-2.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, split validation) | Perplejidad | 205,89 |
| WikiText-2, baseline post-cirugía antes de KD | Perplejidad | 541.890,55 |
| Delta tras destilación | Perplejidad | -541.684,67 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La única métrica reportada es perplejidad sobre WikiText-2, lo que limita la comparación con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM para inferencia en FP16: en torno a 1 GB para los pesos del modelo (0,49B × 2 bytes) más la caché KV; el entrenamiento documentado alcanzó un pico de 12.234 MB con parámetros maestros en FP32 y `seq_len=512`.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en FP16; para reproducir el entrenamiento se necesitan al menos 12 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, A10, L4).
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la carga estándar requiere `transformers` más el paquete `neuralops` para aplicar la cirugía y cargar `attention_weights.safetensors`; también está disponible `load_surgeried_model` de `neuralops.hub`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no es directamente desplegable en esas herramientas.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo reporta tiempos de entrenamiento (180,3 s para 517 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Atención | PPL WikiText-2 | Disponibilidad |
|---|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-mqa-wikitext2 | 0,49B | no disponible | MIT | Híbrida MQA + cuadrática (3:1) | 205,89 | Hugging Face, requiere `neuralops` |
| Qwen/Qwen2.5-0.5B (base) | 0,49B | 32.768 tokens | Apache 2.0 | GQA (14:2) | no disponible en la información | Hugging Face, transformers estándar |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | GQA (14:2) | no disponible en la información | Hugging Face, transformers estándar |
| Meta Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | GQA | no disponible en la información | Hugging Face, transformers estándar |

La comparación directa con el Qwen2.5-0.5B original es la más relevante: este checkpoint introduce una degradación medible (PPL 205,89 frente a un valor no publicado del base) a cambio de reducir la caché KV. No se dispone de datos de perplejidad del base en la información proporcionada, por lo que no puede cuantificarse la pérdida real de calidad.

## Limitaciones y advertencias

- Modelo de investigación: el autor no lo presenta como listo para producción; la perplejidad de 205,89 en WikiText-2 es muy alta para un modelo de 0,5B y sugiere una calidad de generación limitada.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopédico en inglés; no se ha realizado ajuste por instrucciones, RLHF ni DPO, por lo que no es adecuado para uso conversacional directo.
- Solo declara inglés; no se garantiza comportamiento correcto en castellano ni en otros idiomas, aunque el modelo base sea multilingüe.
- Riesgo elevado de alucinación y de generación incoherente fuera del dominio de WikiText-2.
- Requiere el paquete `neuralops` y aplicar la cirugía de atención antes de cargar los pesos; no es un checkpoint autónomo cargable con `transformers` de forma directa.
- No se publican pesos en GGUF, AWQ ni GPTQ, lo que limita el despliegue en llama.cpp, Ollama o vLLM sin conversión manual.
- La única métrica reportada (PPL) no está verificada de forma independiente (`verified: false` en el model-index).
- Licencia MIT permite uso comercial, pero la ausencia de evaluación en tareas downstream hace desaconsejable su uso en producción sin validación previa.
- El tag `base_model` apunta a Qwen/Qwen2.5-0.5B, cuya licencia es Apache 2.0; conviene revisar la compatibilidad de licencias al redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-mqa-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de Multi-Query Attention (Shazeer, 2019): https://arxiv.org/abs/1911.02150
