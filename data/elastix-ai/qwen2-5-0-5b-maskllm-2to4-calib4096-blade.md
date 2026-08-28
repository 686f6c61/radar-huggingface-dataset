# elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib4096-blade

## Resumen

El modelo `elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib4096-blade` es una versión comprimida del modelo Qwen2.5-0.5B, desarrollado por el equipo de elastix-ai. Aplica un esquema de poda estructurada 2:4 (sparsity 2:4) mediante el método blade, que elimina la mitad de los pesos en cada fila de las matrices lineales, manteniendo el número total de parámetros pero reduciendo la densidad computacional. El objetivo es acelerar la inferencia en hardware con soporte para sparse kernels (por ejemplo, GPUs Ampere o posteriores) sin necesidad de cuantización.

El modelo base, Qwen2.5-0.5B, es un transformer decoder-only de 0.5 mil millones de parámetros, preentrenado con 18 billones de tokens según el informe técnico de Qwen2.5. Esta versión comprimida conserva la misma arquitectura y el mismo número de parámetros (494.032.768), pero con un patrón de sparsity 2:4 en la mayoría de las capas, excluyendo embeddings, lm_head y el conv1d de linear_attn. La compresión se calibró con 4.096 muestras del dataset SlimPajama-6B, con una longitud de secuencia de 2.048 tokens.

La relevancia de este modelo radica en su potencial para despliegues en entornos con recursos limitados, donde la sparsity 2:4 puede ofrecer aceleraciones significativas en inferencia sin necesidad de hardware especializado más allá de las GPUs modernas. Sin embargo, no se han publicado evaluaciones de rendimiento en tareas downstream, por lo que su utilidad práctica debe validarse caso por caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con sparsity 2:4 |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE; la sparsity 2:4 reduce densidad pero no el numero de parametros) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (sin cuantizacion; los pesos se mantienen en 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una compresion del Qwen2.5-0.5B original, que sigue una arquitectura transformer decoder-only con atencion por ventanas deslizantes y attention linear (segun la configuracion de Qwen2.5). La compresion se realizo con el metodo blade, que aplica un patron de sparsity 2:4: en cada fila de las matrices de pesos, exactamente dos de cada cuatro elementos se ponen a cero. Este patron es compatible con kernels sparse acelerados por hardware en GPUs como A100, RTX 30/40 y H100.

El proceso de compresion no incluyo fine-tuning posterior (BEAM fine-tuning desactivado). La calibracion se hizo con 4.096 muestras del dataset SlimPajama-6B (split de validacion, streaming), con una longitud de secuencia de 2.048 tokens. No se aplico cuantizacion: los pesos permanecen en FP16. Las capas de embeddings, lm_head y el conv1d de linear_attn se excluyeron de la poda, mientras que el resto de capas (self_attn, mlp, etc.) siguen el patron 2:4.

El modelo base fue preentrenado con 18 billones de tokens, segun el informe tecnico de Qwen2.5, e incluye tecnicas de post-entrenamiento como RLHF y DPO, aunque estas no se transfieren directamente a la version comprimida.

## Capacidades

- No se han publicado evaluaciones de capacidades especificas para este modelo comprimido.
- Se espera que herede las capacidades del modelo base Qwen2.5-0.5B, aunque con posible degradacion debido a la poda 2:4.
- El modelo base es capaz de generacion de texto, razonamiento basico, codigo, matematicas y soporte multilingue (segun la documentacion de Qwen2.5).
- No se ha confirmado soporte para tool calling, function calling o agentes en esta version comprimida.
- No se ha confirmado modo thinking ni capacidades multimodales (vision, audio, etc.).
- La sparsity 2:4 puede permitir aceleracion en inferencia si se utiliza hardware con soporte sparse, pero no se han publicado mediciones de throughput.

## Casos de uso

- Clasificacion de texto en tiempo real en dispositivos con recursos limitados: al ser un modelo de 0.5B con sparsity 2:4, puede ejecutarse en CPUs o GPUs de gama baja con baja latencia, siempre que el runtime soporte kernels sparse. Adecuado para tareas como analisis de sentimiento o clasificacion de documentos cortos.
- Generacion de respuestas cortas en asistentes embebidos: el modelo puede generar texto breve (por ejemplo, respuestas a preguntas frecuentes) en entornos edge, aunque se recomienda validar la calidad antes de produccion.
- Extraccion de entidades en pipelines de procesamiento de lenguaje natural: su tamano reducido permite integrarlo en flujos de datos con restricciones de memoria, como en aplicaciones de IoT o moviles.
- Filtrado de contenido o moderacion automatica: puede utilizarse para clasificar mensajes o comentarios en tiempo real, aprovechando su baja huella de memoria.
- Prototipado rapido de aplicaciones de lenguaje: al ser una version comprimida de un modelo conocido, sirve como punto de partida para experimentar con tecnicas de compresion y evaluar el impacto de la sparsity en tareas concretas.
- Inferencia en entornos con GPUs de consumo (por ejemplo, RTX 3060 con 12 GB): el modelo en FP16 ocupa aproximadamente 1 GB, por lo que cabe en GPUs con 4 GB o mas, dejando espacio para el overhead del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de divergencia KL entre el modelo comprimido y el original, que se muestran a continuacion:

| Dataset | Avg KL | Total KL | Tokens |
|---|---|---|---|
| wikitext2 | 0.403846 | 2218.7324 | 5.494 |
| c4 | 0.394495 | 14537.9429 | 36.852 |

Estas metricas indican la perdida de informacion introducida por la poda, pero no son comparables con benchmarks de rendimiento estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos en FP16 (494M parametros × 2 bytes), mas overhead del runtime y activaciones. Se recomienda al menos 2 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: cualquier GPU con soporte para sparsity 2:4 (por ejemplo, NVIDIA A100, RTX 30/40, H100). En GPUs sin soporte sparse, la sparsity no aporta aceleracion y el modelo se ejecutara como un modelo denso de 0.5B.
- Cabe en GPUs de consumo: si, en GPUs con 4 GB o mas (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super con 6 GB).
- Opciones de despliegue: no se ha confirmado compatibilidad con runtimes especificos. Al estar en formato safetensors, puede cargarse con HuggingFace Transformers. Para aprovechar la sparsity, se necesitarian bibliotecas que soporten kernels sparse (por ejemplo, vLLM con soporte sparse o kernels personalizados). No se ha verificado su funcionamiento con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La sparsity 2:4 puede reducir el tiempo de computacion en un factor de hasta 2 en hardware con soporte, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Sparsity | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-0.5B (original) | 494M | 32K (segun documentacion de Qwen2.5) | Ninguna | Apache 2.0 (segun repo oficial) | safetensors |
| elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib4096-blade | 494M | No disponible | 2:4 | No disponible | safetensors |
| TinyLlama-1.1B (referencia de tamano similar) | 1.1B | 2K | Ninguna | Apache 2.0 | safetensors |

La comparativa se limita a caracteristicas estructurales, ya que no hay datos de rendimiento para el modelo comprimido. El modelo original tiene una licencia Apache 2.0, pero la licencia de esta version comprimida no esta especificada.

## Limitaciones y advertencias

- La poda 2:4 introduce una perdida de precision que puede manifestarse en un aumento de alucinaciones o errores en tareas complejas de razonamiento, codigo o matematicas.
- No se ha evaluado el modelo en benchmarks estandar, por lo que su rendimiento real es desconocido. Se recomienda realizar pruebas exhaustivas antes de cualquier uso en produccion.
- La longitud de contexto no esta confirmada; se desconoce si la compresion afecta a la ventana de contexto original de 32K tokens del modelo base.
- La licencia no esta especificada en la model card. Aunque el modelo base es Apache 2.0, no se puede asumir que esta version comprimida mantenga la misma licencia. Contactar con el autor para aclarar los terminos de uso.
- El modelo es muy pequeno (0.5B), por lo que su capacidad intrinseca es limitada en comparacion con modelos de mayor tamano. La compresion no mejora la capacidad, solo reduce el coste computacional.
- No se ha confirmado soporte para tool calling, agentes o capacidades multimodales. Estas funcionalidades, si existieran en el base, podrian degradarse o perderse tras la poda.
- La sparsity 2:4 solo aporta beneficios de velocidad en hardware con soporte especifico. En hardware sin soporte, el modelo se ejecuta como un modelo denso, sin ventaja adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib4096-blade
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
