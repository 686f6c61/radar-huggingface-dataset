# intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16SharedExperts-CT-AutoRound

## Resumen

El checkpoint `intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16SharedExperts-CT-AutoRound` es una versión cuantizada en precisión mixta del modelo `Qwen/Qwen3.8-Flash-Next` (bf16, 180.000 millones de parámetros totales y unos 6.700 millones activados), publicado por el equipo `intel-ai` con la herramienta Intel AutoRound 0.16.0. La cuantización se ejecutó en modo `--model_free` (RTN: round-to-nearest, sin datos de calibración y sin instanciar el modelo), y el resultado se empaqueta en el formato `mixed-precision` de la librería compressed-tensors. El objetivo es reducir a la mitad el peso del artefacto (de 360 GB en bf16 a 180 GB) manteniendo la precisión prácticamente intacta.

La estrategia de cuantización es selectiva: los expertos enrutados de la capa MoE (48 capas, 120.800 millones de parámetros) pasan a MXFP4 W4A4 con grupo 32 y escalas UE8M0, mientras que las proyecciones de atención completa y de atención linear GDN se cuantizan a MXFP8 W8A8. Todo lo demás —expertos compartidos, el índice de atención dispersa, la tabla de embeddings n-grama PLE de 51.200 millones de parámetros, el módulo de decodificación especulativa MTP, el router, `embed_tokens`, `lm_head` y los módulos visuales— se conserva en BF16 bit a bit respecto al checkpoint oficial.

El interés de esta ficha es doble. Por un lado, documenta un caso real de cuantización MXFP4/MXFP8 sobre una arquitectura MoE híbrida de nueva generación (familia `qwen4_exp`), con una compresión limitada al ~2x precisamente por la tabla PLE, que no admite representación MX. Por otro, deja constancia de una limitación de despliegue relevante: la ruta MXFP4 W4A4 para MoE de vLLM (`CutlassExpertsMxfp4`) presenta un desalineamiento de padding de escalas con TP>1 en esta forma de expertos, por lo que el autor recomienda TP=1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida de la familia Qwen4 (`qwen4_exp`): 48 capas, de las cuales 12 son de atención completa (`self_attn.q/k/v/o_proj`), 36 usan atención linear GDN (`linear_attn`), atención dispersa QSA con indexador top-k, hiperconexiones (`hyper_connection.*`) y módulo MTP de decodificación especulativa |
| Parametros totales | 180.000 millones (180 B) |
| Parametros activos | ~6.700 millones (6,7 B) |
| Longitud de contexto | no disponible (la evaluacion se ejecuto con `max_model_len=8192`) |
| Tipos de cuantizacion | MXFP4 W4A4 grupo 32, escalas UE8M0, activaciones dinamicas (expertos enrutados, `mlp.experts`); MXFP8 W8A8 grupo 32, escalas UE8M0, activaciones dinamicas (atencion completa y GDN); BF16 (expertos compartidos, indexador, tabla PLE, MTP, router, embeddings, `lm_head`, modulos visuales). KV cache y activaciones de atencion sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (identificador de licencia `other`; el repo incluye `LICENSE`) |
| Formato de pesos | safetensors con formato `mixed-precision` de compressed-tensors; 150.708 tensores en total (156 pesos `float8_e4m3fn` y 147.612 tensores `uint8` empaquetados o de escalas). Tamano del repo: 180,0 GB |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE híbrida con 48 capas que combina dos mecanismos de atención: 12 capas de atención completa con proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`, y 36 capas de atención linear etiquetada como GDN (`linear_attn`), con proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj`, además de parámetros auxiliares `in_proj_a` e `in_proj_b`. Sobre esa base se añade un mecanismo de atención dispersa QSA cuyo indexador (`self_attn.indexer.index_qk_proj`, en BF16) selecciona los top-k tokens, y bloques de hiperconexión (`hyper_connection.*`, incluido `block_inject_weight`, con N=48/4 bloques fusionados por el motor de inferencia). El modelo incorpora además un módulo MTP (`mtp.*`) con 512 expertos propios, destinado a decodificación especulativa. Los pesos `visual.*` figuran en la lista de módulos no cuantizados, lo que apunta a componentes multimodales, aunque la model card no documenta capacidades de visión.

En cuanto al entrenamiento del modelo base, la información proporcionada no incluye número de tokens, composición del dataset ni si hubo RLHF o DPO: esos datos son "no disponible". Lo que sí está documentado es el proceso de cuantización. Se aplicó Intel AutoRound 0.16.0 en modo `--model_free` (RTN, sin datos de calibración y sin instanciar el modelo) con el esquema `MXFP8` global, una lista `--ignore_layers` de once patrones y una `--layer_config` que rebaja `mlp.experts` a 4 bits con `data_type: mx_fp`. El resultado son 73.729 objetivos en `config_groups.group_0` con formato `mxfp4-pack-quantized` (73.728 objetivos Linear por experto, almacenados como `weight_packed` + `weight_scale`) y `group_1` con formato `mxfp8-quantized` sobre `targets=["Linear"]`. La huella de ignorados es de 2.451 entradas, de modo que cualquier módulo no listado como cuantizado permanece idéntico bit a bit al checkpoint oficial. La compresión queda limitada a ~2x porque la tabla de embeddings n-grama PLE (51.200 millones de parámetros, 102 GB del artefacto) es una tabla de búsqueda sin representación MX y se mantiene en BF16. A partir de los datos de la model card se deduce que cada una de las 48 capas MoE aloja 512 expertos (73.728 objetivos / 48 capas / 3 proyecciones gate-up-down), si bien se trata de una inferencia aritmética y no de un dato declarado explícitamente.

## Capacidades

- Generación de texto y razonamiento general: el modelo base obtiene 0,8643 en MMLU y 0,9666 en GSM8K (strict) según la evaluación del propio autor, lo que indica competencia en conocimiento general y en razonamiento aritmético de varios pasos.
- Razonamiento con modo "thinking": el arnés de evaluación emplea `reasoning_parser=qwen3` y el parámetro `enable_thinking=false`, lo que implica que la familia soporta un modo de razonamiento explícito desactivable por configuración. No se documentan más detalles del formato de pensamiento.
- Decodificación especulativa: el módulo MTP con 512 expertos propios está diseñado para acelerar la generación mediante predicción especulativa de tokens.
- Atención dispersa de contexto: el indexador QSA selecciona los top-k tokens relevantes y admite un conmutador en tiempo de ejecución (`indexer_kv_dtype="fp8"`) para puntuar en fp8×fp8, sin relación con el esquema de cuantización del checkpoint.
- Procesamiento de contexto largo: la arquitectura híbrida (atención completa + atención linear GDN) está orientada a secuencias largas, aunque la longitud de contexto máxima no se declara en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el razonamiento multi-paso se infiere del comportamiento en GSM8K, pero no hay documentación específica de uso agéntico).
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades multimodales: no disponible; los pesos `visual.*` aparecen en la lista de módulos ignorados por la cuantización, lo que sugiere presencia de componentes visuales, pero la model card no documenta visión ni audio.

## Casos de uso

- Despliegue de un LLM de 180 B en una sola GPU de gran formato: con la tabla PLE descargada a CPU mediante `EngramConfig(cpu_offload=True)` de vLLM, el artefacto de 180 GB cabe en una única B300 de 275 GB, lo que permite servir un modelo de escala 180 B sin repartir pesos entre nodos. Es el caso de uso principal del checkpoint.
- Inferencia con presupuesto de memoria reducido a la mitad: frente a los 360 GB del checkpoint bf16, esta versión ocupa 180 GB con una pérdida de precisión de 0,03 puntos en MMLU y 0,0008 en GSM8K strict, lo que la hace adecuada para entornos donde el almacenamiento o el ancho de banda de carga de pesos son el cuello de botella.
- Evaluación comparativa de técnicas de cuantización MX: los resultados por tarea (MMLU, GSM8K, PIQA, HellaSwag) y la comparación con la variante hermana con `shared_expert` en MXFP8 sirven como referencia reproducible para estudiar el impacto de mantener ciertos módulos en BF16.
- Investigación sobre atención híbrida y dispersa: al conservar en BF16 el indexador QSA y los parámetros de GDN e hiperconexión, el checkpoint permite experimentar con `indexer_kv_dtype="fp8"` y con distintos dtypes de KV cache sin que la cuantización de pesos contamine la comparación.
- Razonamiento aritmético y matemático asistido: con 0,9666 en GSM8K strict, el modelo es apto para tareas de resolución de problemas matemáticos paso a paso en modo few-shot multiturno, que es exactamente la configuración con la que se midió.
- Procesamiento de documentos con contexto largo: la combinación de 12 capas de atención completa y 36 capas de atención linear GDN está pensada para reducir el coste cuadrático en secuencias largas; el uso realista es la lectura y resumen de documentos extensos, siempre que se valide la longitud de contexto efectiva, no declarada en la información disponible.
- Ajuste o destilación sobre una base cuantizada: el formato compressed-tensors es consumible por toolchains compatibles, lo que permite usar el checkpoint como punto de partida en flujos que ya operan con esta representación.

## Benchmarks y rendimiento

Datos publicados en la model card. Arnés: `lm-eval 0.4.13` con vLLM `0.29.1rc1.dev528`, TP=1, KV cache en bf16, `seed=42`, `max_model_len=8192`, `max_num_seqs=64`, `gpu_memory_utilization=0.85`, `language_model_only=true`, `reasoning_parser=qwen3`, `enable_thinking=false`. GSM8K se ejecutó con plantilla de chat y few-shot multiturno.

| Modelo | GSM8K (strict / flexible) | MMLU | PIQA (acc / acc_norm) | HellaSwag (acc / acc_norm) |
|---|---|---|---|---|
| `Qwen/Qwen3.8-Flash-Next` (bf16, referencia) | 0,9674 / — | 0,8652 | 0,8194 / — | 0,6927 / — |
| Este checkpoint | 0,9666 / 0,9659 | 0,8643 | 0,8145 / 0,8275 | 0,6832 / 0,8694 |
| Variante hermana (`shared_expert` en MXFP8) | 0,9621 / 0,9621 | 0,8626 | 0,8226 / 0,8270 | 0,6832 / 0,8707 |

El autor indica que todas las diferencias frente a la variante hermana son iguales o inferiores a 0,6 desviaciones estándar (errores estándar de ejecuciones independientes), es decir, mantener `shared_expert` e `indexer` en BF16 no cuesta precisión medible y recupera la mayor parte de la diferencia en GSM8K respecto al baseline bf16. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 180 GB de pesos, de los cuales 102 GB corresponden a la tabla PLE en BF16. Con `EngramConfig(cpu_offload=True)` de vLLM, esa tabla se descarga a CPU y el checkpoint cabe en una sola GPU B300 de 275 GB.
- GPU recomendadas: B300 de 275 GB (configuración validada por el autor con TP=1). Para otras GPU, la información proporcionada no especifica alternativas; vLLM admite `tensor_parallel_size` configurable, pero el propio autor desaconseja TP>1 por el fallo descrito.
- GPU de consumo: no cabe. El artefacto de 180 GB excede con holgura cualquier GPU de gama de consumo (RTX 4090, 24 GB) e incluso configuraciones multi-GPU de consumo.
- Restricción de paralelismo: se recomienda TP=1. La ruta MXFP4 W4A4 para MoE de vLLM (`CutlassExpertsMxfp4`) presenta un desalineamiento de padding de escalas sin resolver con TP>1 para las formas de experto de este modelo, y la salida degenera. El autor señala que es una limitación de vLLM y no del checkpoint, ya que ocurre igual con los checkpoints de referencia de INC.
- Opciones de despliegue: vLLM ≥ 0.29.0, primera versión con soporte de `qwen4_exp`; la evaluación se hizo sobre la nightly `0.29.1rc1.dev528`. No se documentan opciones de llama.cpp, Ollama, TGI ni GGUF para este checkpoint.
- KV cache: puede configurarse como `auto` (bf16) o `fp8` en compilaciones de vLLM con soporte QSA; ambas funcionan con este artefacto.
- Plantilla de chat: no requiere cambios; se debe usar el `chat_template.jinja` original. Para ejecuciones en texto plano con arneses, no pasar `--apply_chat_template`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base en bf16 y con una variante hermana del propio autor, por lo que no se incluyen alternativas de otros desarrolladores.

| Modelo | Parametros | Contexto | Formato y tamano | Precisión (MMLU / GSM8K strict) | Licencia |
|---|---|---|---|---|---|
| Este checkpoint | 180 B totales / ~6,7 B activos | no disponible | safetensors compressed-tensors mixto, 180 GB | 0,8643 / 0,9666 | qwen-community-1.0 |
| `Qwen/Qwen3.8-Flash-Next` (bf16) | 180 B totales / ~6,7 B activos | no disponible | safetensors bf16, 360 GB | 0,8652 / 0,9674 | qwen-community-1.0 |
| Variante hermana (`shared_expert` en MXFP8) | 180 B totales / ~6,7 B activos | no disponible | safetensors compressed-tensors mixto, tamano no disponible | 0,8626 / 0,9621 | qwen-community-1.0 |

Comparativa con modelos de otros proveedores: no disponible.

## Limitaciones y advertencias

- Degradación con tensor parallelism: con TP>1 la ruta `CutlassExpertsMxfp4` de vLLM produce salidas degeneradas en esta forma de expertos. Es una limitación de vLLM, no documentada como resuelta, y restringe el despliegue a TP=1.
- Dependencia de versiones muy concretas: requiere vLLM ≥ 0.29.0 para el soporte de `qwen4_exp` y fue validado sobre la nightly `0.29.1rc1.dev528`. El propio autor señala que esa compilación concreta es la que hace viable TP=1 gracias a `EngramConfig(cpu_offload=True)`, lo que implica riesgo de reproducibilidad con versiones estables.
- Compresión limitada: la tabla PLE de 102 GB en BF16, sin representación MX, impone un techo de compresión de ~2x sobre un total de 360 GB. No cabe esperar ahorros adicionales por esta vía.
- Sin cuantización de KV cache en el checkpoint: `kv_cache_scheme` no está definido y las activaciones de atención tampoco se cuantizan; cualquier ahorro de memoria en ese punto depende del runtime, no del artefacto.
- Ausencia de datos de entrenamiento: no se documentan tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO en el modelo base. Tampoco se informan idiomas soportados, evaluación de sesgos ni tasas de alucinación.
- Riesgo de alucinación: no cuantificado en la información disponible. Al ser un modelo de 180 B orientado a generación libre, el riesgo existe, pero no hay mediciones publicadas en esta ficha.
- Licencia: `qwen-community-1.0` (identificador `other`), una licencia de comunidad con condiciones propias. No se dispone del texto completo en la información proporcionada, por lo que debe revisarse el fichero `LICENSE` del repositorio antes de cualquier uso comercial. El tag `license:other` de HuggingFace impide asumir permisos de uso comercial sin lectura previa.
- Reproducibilidad parcial de la model card: el fragmento disponible del README se corta a mitad del comando de reproducción de `lm_eval` (tarea `piqa,mmlu,hellaswag`), por lo que los parámetros exactos de esa ejecución no están completos.
- Metadatos del repositorio: 0 descargas y 0 likes en el momento de la consulta, y fechas de creación y actualización de octubre de 2026, posteriores a la fecha habitual de referencia; se recomienda verificar el estado actual del repositorio.
- Nomenclatura potencialmente confusa: el directorio de compilación llevaba el sufijo `-FP8Attn` de un experimento anterior, pero el checkpoint no contiene cuantización FP8 de la atención (no hay `q_scale` ni `kv_cache_scheme`). FP8 se refiere únicamente al formato MXFP8 de los pesos de las capas Linear no expertas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP4-BF16SharedExperts-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia incluida en el repositorio: `LICENSE` (ruta relativa dentro del propio repositorio de HuggingFace)
- Resultados de la búsqueda web: únicamente se recuperaron páginas corporativas de Intel sin contenido técnico sobre el modelo (https://www.intel.com/content/www/us/en/homepage.html, https://www.intel.fr/content/www/fr/fr/homepage.html, https://www.intel.fr/content/www/fr/fr/download-center/home.html, https://www.intel.com/content/www/us/en/support/detect.html, https://fr.wikipedia.org/wiki/Intel). No se han encontrado papers, blogs tecnicos, repositorios ni demos adicionales en la informacion disponible.
