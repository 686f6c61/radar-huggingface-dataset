# inference-optimization/GLM-4.5-Air-0.72B-MTP-PR3225-FP8-Dynamic

## Resumen

GLM-4.5-Air-0.72B-MTP-PR3225-FP8-Dynamic es un artefacto de prueba publicado por el usuario `inference-optimization` para validar la canalización de cuantización FP8_DYNAMIC del PR #3225 de LLM Compressor. No es un modelo de lenguaje de producción: su backbone se inicializó de forma aleatoria y se entrenó sobre un corpus de texto de juguete, sin reutilizar pesos preentrenados de ningún modelo base. El propio autor lo etiqueta explícitamente como `test-fixture`.

Técnicamente reproduce la arquitectura `Glm4MoeForCausalLM` de zai-org/GLM-4.5-Air con dimensiones reducidas: 46 capas, `hidden_size` de 768, 8 expertos enrutados y 4 expertos por token. El checkpoint totaliza 718.663.536 parámetros, de los cuales 707.149.568 corresponden al backbone y 11.513.600 a un módulo MTP (multi-token prediction) sintético. El resultado se guarda en formato FP8_DYNAMIC mediante `compressed-tensors`, en dos shards safetensors.

Su interés es exclusivamente de ingeniería: sirve como fixture reproducible para comprobar que las herramientas de cuantización, guardado fragmentado y carga en vLLM funcionan con arquitecturas MoE y con el enrutado MTP, sin necesidad de descargar checkpoints de decenas de miles de millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Glm4MoeForCausalLM`) con módulo MTP |
| Parámetros totales | 718.663.536 (0,719 B) |
| Parámetros activos | 547.897.088 (estimación de enrutamiento; incluye embeddings y componentes densos, excluye MTP; no es una medición de FLOPs) |
| Parámetros de backbone | 707.149.568 |
| Parámetros de MTP | 11.513.600 |
| Capas ocultas | 46 |
| Dimensión oculta | 768 |
| `intermediate_size` | 3072 |
| `moe_intermediate_size` | 384 |
| Expertos enrutados | 8 |
| Expertos por token | 4 |
| Cabezas de atención | 8 |
| Cabezas KV | 4 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8_DYNAMIC (compressed-tensors), con exclusiones conservadas en su dtype de origen; el backbone también se ha validado recargado en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards indexados, 3.200 tensores) |
| Tamaño del repositorio | 1,0 GB |
| Librerías | transformers, llm-compressor, compressed-tensors, vLLM |
| Modelo base | `inference-optimization/GLM-4.5-Air-0.72B-MTP-PR3225` (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura es una reducción de la de GLM-4.5-Air manteniendo la profundidad original de 46 capas, algo que el autor justifica para «coincidir con el indexado del checkpoint MTP upstream». Los valores reducidos respecto al modelo original son `hidden_size` (768 frente a 4096), `intermediate_size` (3072 frente a 10944), `moe_intermediate_size` (384 frente a 1408), expertos enrutados (8 frente a 128), expertos por token (4 frente a 8), cabezas de atención (8 frente a 96) y cabezas KV (4 frente a 8). El `config.json` guardado es la fuente autoritativa de estas dimensiones.

El entrenamiento no empleó datos reales: el backbone se inicializó aleatoriamente (semilla 3225) y se entrenó con AdamW (learning rate 0,0004, weight decay 0,01, batch size 2, texto truncado a 160 tokens) sobre el corpus de juguete del flujo `tiny-model` del repositorio de llm-compressor, más un breve sayings adicional. El entrenamiento se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3. No hubo RLHF, DPO ni ajuste por preferencias. El módulo MTP es una inicialización sintética: sus proyecciones son sintéticas y los pesos del decoder se copiaron de bloques del backbone ya entrenado, pero el MTP no se entrenó por separado, por lo que estos artefactos no demuestran ninguna calidad de aceptación de borradores ni aceleración de inferencia.

La validación realizada cubre la carga en dos GPU, la cuantización FP8_DYNAMIC, el guardado fragmentado estándar y la generación en vLLM. En la prueba con MTP en FP8, el módulo redactó 60 tokens y aceptó 0, y la salida greedy coincidió con la generación FP8 ordinaria; el autor insiste en que son comprobaciones de ejecución, no mediciones de speedup. Entorno probado: Transformers 5.17.0, Torch 2.14.0+cu130, LLM Compressor `2d52420`, compressed-tensors `e69c8dc` y vLLM 0.30.0 para los smoke tests de servicio. La carga de MTP de modelos GLM/DeepSeek falló en Transformers 5.15.0; la 5.16 no se probó.

## Capacidades

- Generación de texto: funcional a nivel de ejecución, pero entrenado únicamente sobre un corpus de juguete, sin capacidad demostrada de generalización.
- Integridad de aprendizaje y recarga: el backbone recargado en BF16 alcanzó una perplejidad de juguete de 1,191935 sobre el mismo corpus pequeño usado para entrenar. El autor lo presenta como prueba de integridad de recarga, no de calidad.
- Cuantización FP8_DYNAMIC: el checkpoint carga y genera correctamente bajo este esquema en vLLM.
- Enrutado MoE: soporta la ruta de expertos con la configuración reducida (8 expertos, 4 por token).
- Carga del módulo MTP: es opt-in; la generación estándar del backbone en Transformers no lo ejecuta.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se documentan idiomas soportados.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Fixture de CI para cuantización: sirve para verificar en integración continua que la canalización FP8_DYNAMIC de LLM Compressor produce checkpoints cargables, sin necesidad de descargar un modelo de escala real. Es exactamente el propósito declarado del PR #3225.
- Pruebas de guardado fragmentado: los dos shards safetensors con 3.200 tensores indexados permiten validar rutinas de escritura, indexado y verificación de hashes; el repositorio incluye `artifact-manifest.json` con los hashes de los ficheros.
- Smoke tests de vLLM: con 0,72 B de parámetros el arranque del servidor es rápido, lo que permite comprobar en segundos que una versión nueva de vLLM carga una arquitectura MoE con cuantización FP8 antes de pasar a modelos grandes.
- Validación del cableado MTP: permite comprobar que el `Glm4MoeForCausalLM` con cabecera MTP se construye, se guarda y se recarga correctamente, sin afirmar nada sobre la calidad del borrador.
- Pruebas de regresión de versiones de Transformers: útil para detectar roturas de carga entre versiones (el autor documenta fallo en 5.15.0 y éxito en 5.17.0).
- Entornos con recursos muy limitados: al ocupar 1,0 GB de repositorio, se puede usar para desarrollar y depurar código de carga, tokenización o generación en portátiles o máquinas sin GPU dedicada.
- Docencia y ejemplos reproducibles: permite ilustrar la estructura de un config MoE (`n_routed_experts`, `num_experts_per_tok`, `moe_intermediate_size`) con un checkpoint pequeño y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único número reportado por el autor es la perplejidad del backbone BF16 recargado: 1,191935 sobre el mismo corpus de juguete usado en el entrenamiento, que no constituye una evaluación de generalización.

| Métrica | Valor | Contexto |
|---|---|---|
| Perplejidad de juguete (backbone BF16 recargado) | 1,191935 | Mismo corpus pequeño de entrenamiento |
| Aceptación de borradores MTP (FP8) | 60 redactados, 0 aceptados | Comprobación de ejecución, no medición de speedup |
| Perplejidad con MTP | no disponible | — |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,72 GB para los pesos en FP8 y alrededor de 1,4-1,5 GB si se recarga el backbone en BF16, más el overhead de activaciones y caché KV, que con esta configuración es reducido.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), y también es viable en CPU para pruebas funcionales.
- GPU de datacenter (A100, H100): no son necesarias; se usarían solo para reproducir entornos multigpu, ya que el autor valida la carga en dos GPU.
- Opciones de despliegue: Transformers 5.17.0 con compressed-tensors para el checkpoint FP8; vLLM 0.30.0 para servir el modelo (probado en los smoke checks). No se documentan pesos GGUF, por lo que llama.cpp y Ollama no son compatibles con el checkpoint tal cual.
- Latencia y throughput: no disponible. El autor no publica mediciones de velocidad y advierte expresamente que sus comprobaciones de MTP no son una medición de aceleración.

## Comparativa con modelos similares

No existe un equivalente funcional directo: este artefacto es un fixture de prueba, no un modelo desplegable. La comparación con su referencia arquitectónica sirve solo para situar la escala.

| Modelo | Parámetros totales | Capas | Dimensión oculta | Expertos enrutados | Expertos por token | Contexto | Licencia | Propósito |
|---|---|---|---|---|---|---|---|---|
| GLM-4.5-Air-0.72B-MTP-PR3225-FP8-Dynamic | 718.663.536 (0,719 B) | 46 | 768 | 8 | 4 | no disponible | MIT | Fixture de prueba de cuantización y carga |
| zai-org/GLM-4.5-Air (arquitectura original de referencia) | no disponible en la información proporcionada | 46 | 4096 | 128 | 8 | no disponible en la información proporcionada | no disponible en la información proporcionada | Modelo de lenguaje de propósito general |
| Alternativas de la misma categoría (fixtures tiny de llm-compressor) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos del modelo original proceden de la tabla de configuración incluida en la model card de este repositorio; cualquier otro dato de GLM-4.5-Air no aportado allí se marca como no disponible.

## Limitaciones y advertencias

- No es un modelo de producción. El autor lo declara explícitamente: backbone inicializado al azar y entrenado sobre un corpus de juguete, sin pesos preentrenados.
- El MTP no se entrenó por separado. Sus proyecciones son inicializaciones sintéticas y los pesos del decoder se copiaron del backbone; el módulo no establece ninguna calidad de aceptación de borradores ni ganancia de velocidad.
- La prueba de MTP en FP8 redactó 60 tokens y aceptó 0, con salida greedy idéntica a la generación FP8 ordinaria.
- La perplejidad de 1,191935 se midió sobre el mismo corpus usado en el entrenamiento; no indica generalización ni calidad de modelo.
- No hay benchmarks publicados ni capacidades multilingües documentadas. Cualquier afirmación sobre razonamiento, código, matemáticas o tool calling carece de respaldo.
- Sin contexto documentado: la longitud de contexto no se indica en la información disponible.
- Dependencia estricta de versiones: la carga de MTP de modelos GLM/DeepSeek falló en Transformers 5.15.0 y la 5.16 no se probó; el entorno validado es 5.17.0 con Torch 2.14.0+cu130.
- La cuantización de MTP dependiente de calibración queda pendiente como trabajo futuro.
- Licencia MIT, pero con provenance de arquitectura y tokenizador de zai-org/GLM-4.5-Air (revisión `a24ceef6ce4f3536971efe9b778bdaa1bab18daa`); conviene revisar la licencia del proyecto upstream antes de reutilizarlo.
- Riesgo de sesgos y alucinación: no evaluado y no evaluable con este artefacto, dado que no ha sido entrenado con datos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-4.5-Air-0.72B-MTP-PR3225-FP8-Dynamic
- Modelo base: https://huggingface.co/inference-optimization/GLM-4.5-Air-0.72B-MTP-PR3225
- Arquitectura y tokenizador originales (zai-org/GLM-4.5-Air): https://huggingface.co/zai-org/GLM-4.5-Air/tree/a24ceef6ce4f3536971efe9b778bdaa1bab18daa
- Pull request de LLM Compressor #3225: https://github.com/vllm-project/llm-compressor/pull/3225
- Commit de LLM Compressor probado: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Commit de compressed-tensors probado: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Flujo de trabajo tiny-model de llm-compressor: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- Resultados de validación (`validation.json`) y manifiesto de artefactos (`artifact-manifest.json`): disponibles en el propio repositorio de HuggingFace del modelo.
