# darioooooo0o/Qwen3.6-35B-A3B-TinyKV-FP8

## Resumen

Qwen3.6-35B-A3B-TinyKV-FP8 es una cuantización en FP8 del checkpoint comunitario Qwen3.6-35B-A3B-TinyKV, publicado por el usuario `darioooooo0o` (autor del proyecto TinyKV). El modelo parte de los shards oficiales de Qwen/Qwen3.6-35B-A3B-FP8, sin modificarlos, y sustituye únicamente las 10 capas de atención completa por la versión reconvertida del parche TinyKV en bf16, que deja esas capas sin cuantizar. El resultado es un MoE de 35.000 millones de parámetros totales y 3.000 millones activos cuyo principal atractivo es una caché KV 2,5 veces menor que la del checkpoint original.

El problema que resuelve es el coste de memoria de la caché KV en contextos largos: con la misma GPU y los mismos ajustes de vLLM, el modelo sostiene 4,72 millones de tokens de caché KV frente a 1,98 millones del FP8 original (2,38 veces más), lo que permite servir muchas más peticiones concurrentes o ventanas de contexto mucho mayores. Es relevante ahora porque combina dos tendencias: la cuantización FP8 block-wise para GPUs Ada, Hopper y Blackwell y las técnicas de reducción de caché KV aplicadas mediante reentrenamiento selectivo de capas.

El precio a pagar es operativo: requiere vLLM 0.32.0 más un plugin que registra la arquitectura TinyKV, funciona en una sola GPU (sin tensor parallel) y solo se ha validado en modo texto. El checkpoint pesa unos 37 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`) con atención híbrida; 10 capas de atención completa reconvertidas por TinyKV |
| Parametros totales | 35B (35.000 millones) |
| Parametros activos | 3B (3.000 millones) |
| Longitud de contexto | 131.072 tokens en el ejemplo de despliegue del autor (`--max-model-len 131072`); longitud nativa del modelo base no confirmada |
| Tipos de cuantizacion | FP8 block-wise en pesos, excepto las 10 capas de atención reconvertidas que quedan en bf16; GGUFs en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8 + bf16 mixto); GGUF en `darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF` |
| Tamano del repositorio | 38,0 GB (pesos ~37 GB) |
| Libreria / runtime | vLLM 0.32.0 + plugin TinyKV (obligatorio) |
| Hardware objetivo | GPUs Ada, Hopper y Blackwell (soporte FP8) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 35B de parámetros totales y 3B activos por token, heredada del checkpoint Qwen/Qwen3.6-35B-A3B-FP8. La modificación TinyKV no altera el cuerpo principal del modelo: los shards cuantizados son exactamente los de Qwen, y el parche (`tinykv-patch.safetensors`, en bf16) sustituye los pesos de las 10 capas de atención completa, que la configuración de cuantización excluye explícitamente del proceso FP8. Según la model card, esa reconversión se obtuvo reentrenando únicamente esas 10 capas y produce una caché KV 2,5 veces más pequeña.

La innovación es, por tanto, doble: por un lado, la reducción de la caché KV mediante reentrenamiento selectivo de las capas de atención completa, que convive con el resto de capas sin tocar; por otro, la cuantización FP8 block-wise de los pesos, que reduce el footprint a ~37 GB y permite FP8 nativo en Ada, Hopper y Blackwell. El autor no detalla en esta ficha el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos se remiten a la model card principal de `Qwen3.6-35B-A3B-TinyKV`.

## Capacidades

- Generación de texto y conversación multi-turno en modo texto; el pipeline declarado es `text-generation` con tag `conversational`.
- Ventana de contexto larga: el ejemplo oficial arranca vLLM con 131.072 tokens y la caché KV medida admite hasta 4,72 millones de tokens en una RTX PRO 6000 de 96 GB.
- Recuperación en contexto largo: supera la prueba de agujas a 30k tokens con 32 señuelos casi idénticos, con 24/24 aciertos.
- Razonamiento y código: capacidades heredadas del modelo base Qwen3.6-35B-A3B; no se han publicado evaluaciones específicas en esta ficha.
- Tool calling y function calling: no documentado explícitamente en la información disponible (el modelo base Qwen3.6 probablemente lo soporta, pero no se confirma aquí).
- Capacidades multimodales: la torre de visión está presente y sin modificar, pero el autor indica que no está probada y que el despliegue recomendado es solo texto (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Modo thinking o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat con muchas sesiones concurrentes: al necesitar 2,38 veces menos memoria por token de caché KV que el FP8 original, un único servidor vLLM puede mantener muchas más conversaciones simultáneas con 32k tokens de contexto por sesión.
- Análisis de documentación extensa (contratos, expedientes, manuales): la ventana de 131k tokens permite ingerir documentos completos sin troceado agresivo, y el rendimiento en la prueba de agujas a 30k indica que la recuperación en contexto largo se mantiene.
- Asistentes sobre repositorios de código: la ventana larga permite cargar varios ficheros y el historial de un PR en una sola petición, con un coste de caché KV inferior al del checkpoint FP8 equivalente.
- Resumen y extracción de información en pipelines por lotes: el MoE con solo 3B activos reduce el coste de cómputo por token, lo que abarata el procesado masivo de texto en GPUs Ada o Hopper con FP8.
- Despliegue en una única GPU de 48-96 GB: encaja en escenarios de laboratorio o empresa sin clúster, ya que el autor confirma funcionamiento en una sola GPU (el plugin no soporta tensor parallel todavía).
- Evaluación e investigación sobre reducción de caché KV: sirve como referencia práctica para medir el impacto de TinyKV frente al modelo stock, con deltas de log-probabilidad publicados (0,0642 frente a 0,1169).
- Prototipado de agentes multi-paso: la ventana larga y la caché reducida permiten mantener trazas de herramientas y observaciones intermedias sin agotar memoria, siempre que se valide el soporte real de tool calling sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica comprobaciones de calidad y de caché realizadas con vLLM 0.32.0 en una RTX PRO 6000 (96 GB), `gpu_memory_utilization=0.85` y `max_model_len=32768`:

| Metrica | TinyKV-FP8 | FP8 stock (Qwen3.6-35B-A3B-FP8) |
|---|---|---|
| Capacidad de cache KV | 4,72 M tokens | 1,98 M tokens (2,38x menos) |
| Prueba de agujas a 30k tokens con 32 senuelos casi identicos | 24/24 (logp -0,409) | 24/24 (logp -0,322) |
| Ruido de cuantizacion: media \|Δ log p\| frente a la referencia bf16 en PyTorch | 0,0642 (frente a TinyKV en PyTorch) | 0,1169 (frente a Qwen3.6 en PyTorch) |

Datos de referencia adicionales aportados por el autor con los mismos ajustes: TinyKV en bf16 dentro de vLLM presenta un ruido de 0,0478 y sostiene 1,59 M tokens de caché; el modelo stock en bf16 sostiene 0,66 M tokens. La prueba de generación codiciosa con el prompt "Explain in three sentences why the sky is blue." produce una respuesta coherente que comienza: "Sunlight appears white but is actually composed of all colors of the rainbow, which travel as waves of different lengths…".

## Requisitos de hardware

- VRAM para pesos: ~37 GB en FP8, más overhead de activaciones y grafo; el repositorio completo ocupa 38,0 GB.
- VRAM para caché KV: aproximadamente 9 KB por token según las cifras publicadas (4,72 M tokens en ~81 GB de presupuesto de memoria tras restar los pesos), por lo que un contexto de 131k tokens consume del orden de 1,2 GB de caché.
- GPU mínima realista: 48 GB (L40S, RTX A6000, RTX 6000 Ada) para contextos moderados; 80 GB (A100, H100) o 96 GB (RTX PRO 6000) para contextos largos y alta concurrencia.
- No cabe en GPUs de consumo de 24 GB (RTX 4090, 3090) en FP8; para esos entornos habría que recurrir a los GGUFs del repositorio hermano, cuyo comportamiento no está verificado en esta ficha.
- Arquitecturas soportadas: Ada, Hopper y Blackwell exclusivamente para FP8.
- Despliegue: vLLM 0.32.0 con el plugin `plugin/*` del repositorio instalado previamente (`pip install ./plugin`); el plugin registra la arquitectura TinyKV y actualmente no implementa tensor parallel, así que solo se admite una GPU.
- Comando de referencia del autor: `vllm serve darioooooo0o/Qwen3.6-35B-A3B-TinyKV-FP8 --max-model-len 131072 --gpu-memory-utilization 0.9 --limit-mm-per-prompt '{"image":0,"video":0}'`.
- Throughput y latencia: no disponibles; solo se documenta la capacidad de caché KV, no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto practico | Cache KV (misma GPU y ajustes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TinyKV-FP8 (este) | 35B totales / 3B activos | 131.072 tokens en el ejemplo de despliegue | 4,72 M tokens | Apache-2.0 | vLLM 0.32.0 + plugin TinyKV, una GPU |
| Qwen/Qwen3.6-35B-A3B-FP8 (stock) | 35B totales / 3B activos | mismo modelo base | 1,98 M tokens | Apache-2.0 | vLLM estándar, sin plugin |
| Qwen3.6-35B-A3B-TinyKV (bf16) | 35B totales / 3B activos | mismo modelo base | 1,59 M tokens | Apache-2.0 | vLLM con plugin; pesos en bf16 (tamano no indicado) |
| Qwen/Qwen3.6-35B-A3B (bf16, original) | 35B totales / 3B activos | mismo modelo base | 0,66 M tokens | Apache-2.0 | vLLM estándar; tamano de pesos no indicado |

No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Requiere el plugin TinyKV: sin él, vLLM no reconoce la arquitectura. La versión está fijada a vLLM 0.32.0, lo que limita la actualización del stack de inferencia.
- Sin tensor parallel: solo funciona en una GPU, lo que descarta el escalado horizontal por GPU dentro de un mismo nodo.
- Modelo solo texto en la práctica: la torre de visión está sin modificar pero no se ha probado, y el autor recomienda desactivar imagen y vídeo en el prompt.
- Ruido de cuantización: la media de la diferencia absoluta de log-probabilidad frente a la referencia bf16 es 0,0642, superior a los 0,0478 del TinyKV en bf16. Aunque es menor que el ruido del FP8 stock (0,1169), implica una degradación no nula frente al modelo sin cuantizar.
- Ausencia de benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad en la información disponible.
- Idiomas no declarados: la model card no especifica la cobertura lingüística, por lo que el rendimiento en castellano no está verificado.
- Es un checkpoint comunitario, no una publicación oficial de Qwen: el autor es un particular que redistribuye shards oficiales con un parche propio; conviene validar la procedencia de los pesos en entornos regulados.
- Riesgo de alucinación y sesgos: no evaluados en esta ficha; son los heredados del modelo base y de su proceso de alineamiento.
- Licencia Apache-2.0 permite uso comercial, pero el cumplimiento debe verificarse también contra los términos del modelo base Qwen y de los shards FP8 redistribuidos.
- Historial de uso nulo (0 descargas, 0 likes en el momento de la consulta) y creación reciente: poca validación externa de robustez en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-FP8
- Modelo base TinyKV (receta de conversión y tablas de calidad): https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV
- Versiones GGUF: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF
- Checkpoint FP8 oficial de Qwen usado como base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor: https://x.com/imdariotoo
- Proveedor de cómputo (AI Builder Grant): https://www.cloudrift.ai
