# inference-optimization/DeepSeek-V3-0.86B-MTP-PR3225

## Resumen

DeepSeek-V3-0.86B-MTP-PR3225 es un checkpoint de prueba (test fixture) publicado por el usuario `inference-optimization` para validar el soporte de Multi-Token Prediction (MTP) en la pull request 3225 del proyecto LLM Compressor. No es un modelo de lenguaje de producción: su backbone se inicializó de forma aleatoria y se entrenó sobre un corpus de texto de juguete, sin reutilizar pesos preentrenados de DeepSeek-V3-Base. La arquitectura y el tokenizador sí provienen de `deepseek-ai/DeepSeek-V3-Base` (revisión `afb92e1fa402c2be2a9eb085312bb02e0384d6c7`), con la clase `DeepseekV3ForCausalLM`.

El modelo conserva la profundidad del backbone original (61 capas) pero reduce drásticamente el resto de dimensiones: `hidden_size` de 7168 a 768, 8 expertos enrutados en lugar de 256 y 4 expertos por token en lugar de 8. El total declarado es de 860.930.560 parámetros (0,861B), de los cuales 849.041.408 corresponden al backbone y 11.889.152 a las proyecciones MTP sintéticas. La estimación de parámetros activos del backbone es de 643.782.656, cifra que incluye embeddings y componentes densos, excluye MTP y no es una medición de FLOPs.

Su relevancia es puramente de ingeniería: sirve para reproducir la carga, la cuantización FP8_DYNAMIC, el guardado fragmentado en safetensors y la generación con vLLM en entornos de integración continua, sin necesidad de descargar el DeepSeek-V3 completo (671B). El propio autor advierte que las proyecciones MTP son inicializaciones sintéticas, que el decodificador MTP no se entrenó por separado y que, por tanto, el artefacto no demuestra calidad de aceptación de borradores ni aceleración de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención MLA (Multi-head Latent Attention) y módulo MTP; clase `DeepseekV3ForCausalLM` |
| Parámetros totales | 860.930.560 según la model card (0,861B); 860.931.032 según los metadatos de safetensors. Backbone: 849.041.408; MTP: 11.889.152 |
| Parámetros activos | 643.782.656 estimados en el backbone (incluye embeddings y componentes densos, excluye MTP; no es una medición de FLOPs) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 como precisión de origen; FP8_DYNAMIC probado en el repositorio hermano. GGUF no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencia DeepSeek heredada de DeepSeek-V3-Base) |
| Formato de pesos | safetensors (BF16), 5 shards indexados, 2.285 tensores indexados; activos de tokenizador incluidos |
| Número de capas | 61 (`num_hidden_layers`, igual que el original) |
| `hidden_size` | 768 (original: 7168) |
| `intermediate_size` | 3072 (original: 18432) |
| `moe_intermediate_size` | 384 (original: 2048) |
| Expertos enrutados | 8 (original: 256) |
| Expertos por token | 4 (original: 8) |
| Cabezas de atención / KV | 8 / 8 (original: 128 / 128) |
| `q_lora_rank` / `kv_lora_rank` | 512 / 256 (original: 1536 / 512) |
| Semilla de entrenamiento | 3225 |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura replica el diseño de DeepSeek-V3 a escala reducida: 61 capas de transformer con mezcla de expertos (MoE) y atención MLA con proyecciones de bajo rango para consultas y claves/valores (`q_lora_rank` y `kv_lora_rank`). Sobre el backbone se añade un módulo de Multi-Token Prediction (MTP) cuyas proyecciones son inicializaciones sintéticas; los pesos del decodificador MTP se copiaron de bloques del backbone ya entrenados, pero el módulo MTP no se entrenó por separado. Se mantiene la profundidad original para que el indexado de checkpoints MTP del repositorio upstream coincida.

El entrenamiento es deliberadamente trivial: semilla aleatoria 3225, optimizador AdamW con tasa de aprendizaje 0,0004 y weight decay 0,01, tamaño de lote 2 y texto truncado a 160 tokens. El proceso se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3. El corpus sigue el flujo de trabajo `tiny-model` del repositorio de LLM Compressor. La perplejidad del backbone BF16 recargado fue de 1,768900 sobre el mismo corpus pequeño empleado en el entrenamiento, lo que demuestra integridad de aprendizaje y recarga, no capacidad de generalización.

Como validación funcional se comprobó la carga en dos GPU, la cuantización FP8_DYNAMIC, el guardado fragmentado normal y la generación con vLLM. En la ejecución FP8 con MTP se redactaron 60 tokens y se aceptaron 0, y la salida greedy coincidió con la generación FP8 ordinaria; el autor subraya que son comprobaciones de ejecución y no una medición de aceleración.

## Capacidades

- Generación de texto autoregresiva con la clase `DeepseekV3ForCausalLM` de Transformers, incluyendo decodificación greedy (`do_sample=False`).
- Ejecución del camino MoE con enrutamiento a 8 expertos y 4 expertos por token.
- Carga y guardado de checkpoints fragmentados en safetensors (5 shards, 2.285 tensores), con verificación de integridad de hashes mediante `artifact-manifest.json`.
- Cuantización FP8_DYNAMIC con LLM Compressor, incluyendo la ruta de carga de MTP mediante `load_context(..., load_mtp=True)`.
- Servicio de inferencia con vLLM 0.30.0 (comprobación de humo superada).
- Compatibilidad declarada con endpoints (`endpoints_compatible`, `text-generation-inference`) según las etiquetas del repositorio.
- Capacidades lingüísticas: no disponibles. El modelo no ha sido entrenado para generar texto coherente ni multilingüe.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Pruebas de regresión de LLM Compressor en CI: el fixture permite ejecutar recetas de cuantización (por ejemplo FP8_DYNAMIC) sobre un checkpoint MTP real sin descargar cientos de gigabytes, validando que la receta y el guardado fragmentado funcionan de extremo a extremo.
- Validación del cargador de MTP en Transformers: sirve para comprobar qué versiones del framework cargan correctamente los pesos MTP de arquitecturas DeepSeek y GLM. La model card documenta fallo de carga con Transformers 5.15.0 y éxito con 5.17.0 (5.16 sin probar).
- Comprobación de humo de vLLM: al ser un modelo pequeño, se puede arrancar un servidor vLLM en unos segundos por GPU y verificar que la generación responde antes de lanzar pruebas sobre modelos grandes.
- Verificación de guardado y recarga con múltiples shards: el repositorio incluye 5 shards indexados y un manifiesto de hashes, lo que permite automatizar pruebas de serialización, indexado y detección de corrupción de safetensors.
- Pruebas de cuantización de módulos MTP: el ejemplo GLM de LLM Compressor acepta un `MODEL_ID` por variable de entorno, de modo que este fixture puede sustituir a un modelo de producción en la batería de pruebas de calibración.
- Reproducción de experimentos de arquitectura MoE reducida: con 61 capas pero `hidden_size` 768 y 8 expertos, es útil para estudiar el comportamiento de la inicialización, el enrutamiento y el consumo de memoria en un MoE profundo y estrecho.
- Desarrollo de utilidades de tokenizador y plantillas de chat: los activos del tokenizador de DeepSeek-V3-Base están incluidos, por lo que permite probar canalizaciones de preprocesado sin depender del modelo completo.
- Docencia y demostraciones internas: ilustra la diferencia entre la configuración original de DeepSeek-V3 y una configuración reducida manteniendo la misma clase de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, y el autor indica explícitamente que el modelo no demuestra generalización ni calidad de benchmark.

Los únicos datos numéricos publicados son comprobaciones de ejecución, que se recogen a continuación y que no deben interpretarse como rendimiento del modelo:

| Métrica | Valor | Naturaleza |
|---|---|---|
| Perplejidad del backbone BF16 recargado | 1,768900 | Sobre el mismo corpus pequeño de entrenamiento; demuestra integridad de aprendizaje y recarga |
| Tokens redactados / aceptados en MTP FP8 | 60 / 0 | Comprobación de ejecución; la salida greedy coincidió con la generación FP8 ordinaria |
| Cuantización FP8_DYNAMIC | superada | Comprobación de ejecución en dos GPU |
| Generación con vLLM 0.30.0 | superada | Comprobación de humo |

## Requisitos de hardware

- Peso de los parámetros en BF16: aproximadamente 1,72 GB (860,9 M parámetros × 2 bytes), coherente con el tamaño de repositorio de 1,7 GB.
- VRAM estimada para inferencia: alrededor de 2 GB para los pesos, más el coste de activaciones y caché KV. Con un contexto corto cabe holgadamente en 4 GB; no se dispone de mediciones oficiales de pico de memoria.
- Cabe en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, etc. También es viable la ejecución en CPU, como demuestra la propia model card al usar `device_map="cpu"` para la carga con MTP.
- La validación del autor se realizó en dos GPU, pero no se especifica el modelo concreto de GPU empleado.
- Opciones de despliegue verificadas: Transformers 5.17.0 (con Torch 2.14.0+cu130 y `attn_implementation="eager"`), LLM Compressor (commit `2d52420`) con compressed-tensors (commit `e69c8dc`) y vLLM 0.30.0.
- No se documenta soporte ni prueba con llama.cpp, Ollama, TGI, TensorRT-LLM ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación estricta no es posible porque este artefacto es un fixture de pruebas, no un modelo entrenado para tareas reales. Se incluye una referencia frente al modelo del que deriva su arquitectura y frente a alternativas de tamaño similar del ecosistema, marcando los datos que no provienen de la información facilitada.

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| DeepSeek-V3-0.86B-MTP-PR3225 | 0,861B (643,8 M activos estimados) | no disponible | other (DeepSeek) | Fixture de pruebas, backbone aleatorio, MTP sintético |
| DeepSeek-V3-Base | 671B (37B activos, datos públicos del modelo original) | 128K (dato público del modelo original) | DeepSeek | Modelo de producción completo, del que se hereda arquitectura y tokenizador |
| Alternativas pequeñas del ecosistema (Qwen2.5-0.5B, TinyLlama-1.1B, SmolLM2-1.7B) | entre 0,5B y 1,7B | entre 2K y 32K según el modelo | Apache-2.0 en los tres casos | Modelos preentrenados y ajustados, comparables solo en orden de magnitud de parámetros |

Advertencia: los datos de las dos últimas filas no proceden de la información proporcionada en esta ficha y deben verificarse en la documentación oficial de cada modelo antes de usarlos en una decisión técnica. La comparación únicamente es válida en términos de tamaño; en capacidades, este fixture no es equiparable a ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable en producción: el backbone se inicializó de forma aleatoria y solo se entrenó sobre un corpus de juguete, por lo que no generaliza ni produce texto fiable.
- Las proyecciones MTP son sintéticas y el módulo MTP no se entrenó por separado; el autor advierte que no se puede inferir calidad de aceptación de borradores ni aceleración de inferencia.
- En la prueba FP8 con MTP se redactaron 60 tokens y se aceptaron 0, lo que confirma que no hay ganancia medible de decodificación especulativa en este artefacto.
- Riesgo de alucinación: total. Al carecer de entrenamiento real, cualquier salida es esencialmente aleatoria o reflejo del corpus de juguete.
- Idiomas soportados: no disponibles; no hay evidencia de competencia multilingüe ni monolingüe real.
- Longitud de contexto: no disponible; el `config.json` guardado es la fuente autoritativa y no se ha facilitado en la información recibida.
- Restricciones de licencia: la licencia es `other` con nombre `deepseek`. Los ficheros de licencia del repositorio upstream están incluidos (`LICENSE-MODEL`) y sus condiciones de uso aplican. Debe revisarse el texto completo antes de cualquier uso, incluido el comercial, ya que este modelo conserva la licencia de DeepSeek-V3-Base.
- Compatibilidad frágil de versiones: la carga MTP de modelos GLM/DeepSeek falló en Transformers 5.15.0; la 5.16 no se probó y la 5.17.0 es la versión validada. El entorno probado usa Torch 2.14.0+cu130.
- La cuantización MTP dependiente de calibración queda pendiente como trabajo futuro, por lo que las recetas de cuantización sobre el módulo MTP no están cerradas.
- Sin benchmarks: no existe ninguna evaluación estándar publicada, de modo que no hay base para comparar su calidad con otros modelos.
- Cero descargas y cero valoraciones en el momento de redactar esta ficha; nulo respaldo de la comunidad.
- Los resultados de la búsqueda web realizada no aportan información técnica sobre el modelo: se limitan a definiciones lingüísticas del término "inférence" en francés y no se han utilizado como fuente de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/DeepSeek-V3-0.86B-MTP-PR3225
- Modelo original de arquitectura y tokenizador: https://huggingface.co/deepseek-ai/DeepSeek-V3-Base/tree/afb92e1fa402c2be2a9eb085312bb02e0384d6c7
- Licencia del modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-V3-Base/blob/afb92e1fa402c2be2a9eb085312bb02e0384d6c7/LICENSE-MODEL
- Pull request de LLM Compressor: https://github.com/vllm-project/llm-compressor/pull/3225
- Flujo de trabajo tiny-model del repositorio: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- Ejemplo de cuantización MTP de GLM: https://github.com/vllm-project/llm-compressor/blob/2d5242056a8a00028686a303771ffc8e2fe27d07/examples/quantization_w8a8_fp8/glm4_5_air_mtp.py
- Commit de LLM Compressor usado en las pruebas: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Commit de compressed-tensors usado en las pruebas: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Resultados estructurados de validación: `validation.json` (incluido en el repositorio del modelo)
- Manifiesto de hashes de los checkpoints: `artifact-manifest.json` (incluido en el repositorio del modelo)
