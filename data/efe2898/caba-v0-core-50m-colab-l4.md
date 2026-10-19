# Efe2898/caba-v0-core-50m-colab-l4

## Resumen

ÇABA v0-core es un modelo de lenguaje de 49.960.000 parámetros entrenado desde cero (pesos inicializados aleatoriamente) por el desarrollador independiente Efe2898. No es un transformer convencional: su ID de arquitectura es `caba-v0-core-50m-shared-qkv-fast-medium-slow-1-8-64`, y combina atención con QKV compartida y tres bancos de memoria asociativa recurrente (fast, medium y slow) que se actualizan a nivel de token, de ventana de 8 tokens y de ventana de 64 tokens respectivamente. El objetivo declarado del proyecto es alcanzar 1.000 millones de tokens de entrenamiento, no de parámetros.

El modelo se presenta explícitamente como un prototipo de investigación en estado temprano: el checkpoint publicado corresponde al step 31, con 380.184 tokens objetivo procesados y un estado de parada ordenada (`graceful-stop`). Se entrenó sobre shards de `Efe2898/tokenized` con el tokenizer `vngrs-ai/Kumru-2B-Base`, una longitud de secuencia de 512 tokens y pesos en safetensors, acompañados de un checkpoint de reanudación independiente con estado de AdamW, scaler FP16 y RNG.

Su relevancia es acotada pero concreta: sirve como artefacto reproducible para estudiar arquitecturas híbridas con memoria recurrente frente a atención pura, y como base para ablaciones controladas. No es un modelo apto para producción: no hay benchmarks publicados, no se declara licencia y el propio autor indica que el prototipo no se ha validado contra MQAR, RULER ni baselines de capacidad equivalente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con QKV compartida y memoria asociativa recurrente en tres bancos (fast, medium, slow); ID `caba-v0-core-50m-shared-qkv-fast-medium-slow-1-8-64` |
| Parametros totales | 49.960.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de secuencia de entrenamiento |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser safetensors en FP16/FP32 es convertible a INT8/INT4, pero no hay artefactos GGUF ni AWQ/GPTQ oficiales |
| Idiomas soportados | No disponible (no declarado; el tokenizer es Kumru-2B-Base, de orientación turca, y la model card está en turco) |
| Licencia | No disponible (el autor declara explícitamente que este artefacto no afirma ninguna licencia) |
| Formato de pesos | safetensors (pesos del modelo) y `training/checkpoints/latest.pt` (estado de reanudación: modelo, AdamW, scaler FP16 y RNG) |

## Arquitectura y entrenamiento

La arquitectura sustituye parte del cómputo de atención por memorias asociativas recurrentes. El banco *fast* aplica una escritura delta en cada token; los scores residuales del banco fast forman un resumen ponderado de 8 tokens que alimenta la memoria *medium*; y los residuales de medium forman un resumen de 64 tokens para la memoria *slow*. Las puertas de admisión (`admission gates`) son independientes del enrutado de lectura, y dentro de una ventana de promoción las lecturas usan el estado previo del banco: el nuevo resumen solo es visible al cerrar la ventana. El estado de memoria arranca vacío en cada secuencia de entrenamiento independiente. La atención usa QKV compartida, lo que reduce parámetros en el bloque de atención.

El entrenamiento partió de pesos aleatorios sobre shards tokenizados de `Efe2898/tokenized` (revisión `6cb993aa63064cd89b511bb164e8c6e5512902ed`) con el tokenizer `vngrs-ai/Kumru-2B-Base` (revisión `55711ea224e4bf5d4e11a4baf79130ae73785ece`) y longitud de secuencia 512. El checkpoint publicado corresponde al step 31 con 380.184 tokens objetivo, muy lejos del objetivo de 1.000 millones, y se detuvo de forma ordenada. No se documenta uso de RLHF, DPO ni ajuste por instrucciones; tampoco se detalla la composición del corpus. El repositorio incluye código de entrenamiento, auditoría de datos y métricas, pero no copia el corpus tokenizado. Los pesos de memoria (`fast_route`, `medium_route`, `slow_route`) son pesos medios de mezcla de salida, y el autor advierte que las señales de admisión e "unresolvedness" son diagnósticos, no una prueba de calidad semántica de la memoria.

## Capacidades

- Generación de texto autorregresiva mediante `AutoModelForCausalLM` de Transformers con `trust_remote_code=True`, limitada al estado de entrenamiento actual (380.184 tokens).
- Memoria recurrente de tres escalas temporales (token, 8 tokens, 64 tokens) como mecanismo arquitectónico, no como capa de atención adicional.
- Tokenización basada en Kumru-2B-Base, con vocabulario orientado a turco; el soporte multilingüe real no está declarado ni evaluado.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, planificación multi-paso ni modo de razonamiento explícito (thinking mode).
- No hay capacidades de visión, audio ni multimodalidad.
- No hay caché de streaming recurrente: la generación recalcula el prefijo completo en cada token nuevo.

## Casos de uso

- Investigación en arquitecturas con memoria recurrente: el modelo permite reproducir el pipeline completo (tokenizer, shards, entrenamiento, métricas) y comparar los bancos fast/medium/slow frente a atención pura en tareas de recuperación asociativa, aunque el propio autor señala que aún no hay evaluación con MQAR o RULER.
- Ablaciones controladas de mecanismos de memoria: al estar entrenado desde cero con configuración documentada y checkpoints de reanudación (modelo, AdamW, scaler y RNG), sirve para aislar el efecto de las ventanas de 8 y 64 tokens sin partir de un modelo preentrenado con sesgos desconocidos.
- Docencia y divulgación técnica: con 49,96 M de parámetros y pesos en safetensors, es un caso manejable para explicar atención con QKV compartida, escritura delta y promoción entre bancos de memoria en un cuaderno de Colab (el nombre del repositorio indica entrenamiento en L4).
- Pruebas de integración de pipelines de tokenización: permite validar de extremo a extremo el flujo con `vngrs-ai/Kumru-2B-Base` y los shards de `Efe2898/tokenized` antes de escalar a modelos mayores del mismo linaje.
- Prototipado en entornos con recursos mínimos: al ocupar del orden de 100 MB en FP16, se puede cargar y ejecutar en CPU o en GPU de gama baja para pruebas de humo de servidores de inferencia y plantillas de generación.
- Estudio de seguridad y de ejecución de código remoto: al requerir `trust_remote_code=True`, es un caso práctico para auditar el código custom incluido en el repositorio antes de desplegar modelos de terceros.
- Base para comparativas de eficiencia: su naturaleza recurrente permite medir coste por token frente a transformers de tamaño similar, especialmente por la ausencia de caché de streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que el prototipo v0-core no se ha validado contra MQAR, RULER ni baselines de capacidad equivalente. Tampoco se reportan métricas de perplejidad, MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación derivada del número de parámetros, no publicada por el autor): aproximadamente 200 MB en FP32, 100 MB en FP16/BF16, 50 MB en INT8 y 25-30 MB en INT4, más activaciones y caché KV para 512 tokens.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU. No requiere A100 ni H100.
- GPU recomendadas: ninguna en particular; el repositorio sugiere que el entrenamiento se hizo en una NVIDIA L4 de Colab. Para inferencia, cualquier GPU con más de 1 GB de VRAM es suficiente.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la única vía documentada. No hay artefactos GGUF para llama.cpp u Ollama, ni cuantizaciones AWQ/GPTQ para vLLM o TGI; integrarlo en vLLM o TGI requeriría adaptar el código custom.
- Latencia y throughput: no disponible. Cabe esperar una penalización por token al no existir caché de streaming, ya que se recalcula el prefijo completo en cada paso; el tamaño reducido del modelo compensa parcialmente ese coste.
- Almacenamiento: el repositorio ocupa 1,6 GB, lastrado por el checkpoint de reanudación (`latest.pt`) con estado del optimizador; los pesos safetensors son una fracción de ese tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| ÇABA v0-core 50M | 49,96 M | 512 | Transformer con QKV compartida y memoria recurrente fast/medium/slow | No disponible (no se afirma licencia) | Prototipo, 380.184 tokens entrenados |
| GPT-2 small | 124 M | 1024 | Transformer decoder-only | Licencia MIT modificada de OpenAI | Modelo de referencia ampliamente usado |
| SmolLM-135M | 135 M | 2048 | Transformer decoder-only | Apache-2.0 | Modelo pequeño con entrenamiento a gran escala |
| Qwen2.5-0.5B | 494 M | 32.768 | Transformer decoder-only | Apache-2.0 | Modelo pequeño con soporte multilingüe y de herramientas |

La comparación relevante no es de rendimiento —no hay datos del ÇABA— sino de natureleza del artefacto: los tres alternativos son modelos preentrenados con corpus masivos, licencia clara y artefactos de despliegue publicados; el ÇABA v0-core es un experimento arquitectónico reproducible con un presupuesto de entrenamiento tres órdenes de magnitud inferior a su propio objetivo.

## Limitaciones y advertencias

- Entrenamiento mínimo: 380.184 tokens objetivo en el step 31 frente a un objetivo declarado de 1.000 millones. La calidad del lenguaje generado será muy limitada y no debe evaluarse como un modelo conversacional funcional.
- Parada temprana: el checkpoint se guardó con estado `graceful-stop`, no por convergencia; no representa un modelo final.
- Sin benchmarks: no hay MQAR, RULER, perplejidad ni comparación con baselines de igual capacidad, por lo que no se puede afirmar que la memoria recurrente aporte ventaja alguna.
- Calidad semántica de la memoria no validada: el autor advierte que las rutas y las puertas de admisión son diagnósticos, no evidencia de recuperación semántica correcta.
- Riesgo alto de alucinación y de texto incoherente por el escaso preentrenamiento; inadecuado para cualquier uso orientado a usuario final.
- Licencia inexistente: el artefacto no afirma licencia, y la model card pide revisar las licencias del dataset y del tokenizer antes de redistribuir. Uso comercial y redistribución quedan en zona legal indeterminada.
- Idiomas no declarados: no hay lista de idiomas soportados; el tokenizer es Kumru-2B-Base, orientado a turco, y la documentación está en turco, pero no se garantiza competencia en turco ni en castellano.
- Ejecución de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de usar en entornos con datos sensibles.
- Sin caché de streaming recurrente: la generación recalcula el prefijo completo, con coste cuadrático en secuencias largas y sin soporte de decodificación incremental eficiente.
- Contexto corto (512 tokens) y sin evaluación de extrapolación más allá de esa ventana.
- Sesgos: no documentados ni evaluados; al entrenarse desde cero sobre un corpus no descrito, no hay auditoría de sesgo disponible.
- Ecosistema limitado: sin GGUF, sin cuantizaciones oficiales y sin integración en vLLM, TGI, Ollama o llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efe2898/caba-v0-core-50m-colab-l4
- Dataset de shards tokenizados: https://huggingface.co/Efe2898/tokenized
- Tokenizer utilizado: https://huggingface.co/vngrs-ai/Kumru-2B-Base
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron únicamente resultados de spam sin relación con el artefacto.
