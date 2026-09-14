# JohnieBraaf/Qwen3.8-27b-Swift

## Resumen

JohnieBraaf/Qwen3.8-27b-Swift es una publicación derivada alojada en HuggingFace por el usuario JohnieBraaf, creada y actualizada el 13 de septiembre de 2026, sin descargas ni valoraciones registradas en el momento de redactar esta ficha. Según su propia model card, se trata de un modelo derivado de ukisai/Swift-Qwen3.8-27B-GGUF, sobre el que se ha aplicado un proceso de conversión a FP8 documentado en forma de derivación de Nix. No se trata, por tanto, de un entrenamiento nuevo, sino de una recuantización del modelo de origen.

El nombre del repositorio indica un tamaño de aproximadamente 27 000 millones de parámetros, aunque la model card no confirma ni el recuento exacto ni la arquitectura. El contenido publicado se limita a la receta de conversión: un script que recorre los ficheros safetensors del modelo origen, cuantiza a float8_e4m3fn los tensores de peso bidimensionales que no coinciden con una lista de patrones excluidos y escribe las escalas inversas correspondientes. No se incluyen datos de entrenamiento, benchmarks, licencia ni idiomas.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el interés técnico está en el propio pipeline de cuantización (llm-compressor, compressed-tensors y auto-round sobre CUDA 13.0), más que en el modelo resultante, del que no hay evaluación publicada. Los patrones de módulos excluidos de la cuantización revelan información estructural sobre el modelo base, que se detalla más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada por el autor. El script de conversión referencia módulos `linear_attn.*` (atención lineal con `A_log`, `conv1d`, `dt_bias`, `in_proj_qkv`, `in_proj_z`, `in_proj_ba`) y un bloque `mtp.*` (multi-token prediction), lo que apunta a un transformer híbrido con capas de atención lineal y módulo MTP |
| Parametros totales | Aproximadamente 27 000 millones (deducido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`) con escala por tensor almacenada como `weight_scale_inv`. El repositorio de origen publica variantes en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, indexados mediante `model.safetensors.index.json` (versión FP8 de este repositorio); GGUF en el repositorio de origen |
| Repositorio de origen | ukisai/Swift-Qwen3.8-27B-GGUF |
| Fecha de publicacion | 2026-09-13 |

## Arquitectura y entrenamiento

No hay información en la model card sobre el entrenamiento del modelo base: no se indican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se documenta ninguna innovación técnica propia del autor. Lo único verificable es el proceso de conversión aplicado, descrito como una derivación de Nix que instala llm-compressor 0.13.0, compressed-tensors 0.18.0, auto-round 0.14.2, accelerate 1.14.0, transformers y PyTorch compilado para CUDA 13.0 (`torch-cu130`).

El script de cuantización cargado en la model card es explícito en su funcionamiento. Recorre los shards del índice de safetensors del modelo origen, y para cada tensor cuyo nombre termina en `.weight` y es bidimensional aplica una escala por tensor calculada como `448.0 / absmax`, con recorte al rango `[-448, 448]` y conversión a `torch.float8_e4m3fn`; además guarda el tensor `<modulo>.weight_scale_inv` con la escala inversa. Los tensores que no cumplen esas condiciones, o que coinciden con los patrones excluidos, se copian sin modificar. La lista de exclusión cubre `model.visual.*`, `lm_head`, `.embed_tokens`, todos los submódulos internos de `linear_attn.*` y `mtp.fc` / `mtp.norm` / `mtp.pre_fc_norm`. La presencia de `model.visual.*` sugiere que el modelo de origen incorpora un torre visual, pero es una inferencia a partir del script, no un dato confirmado por el autor.

## Capacidades

No hay ninguna capacidad confirmada por el autor. A partir de la información disponible solo pueden enumerarse indicios estructurales, que deben tratarse como no verificados:

- Generación de texto: no confirmada explícitamente, pero implícita en el tipo de modelo y en la presencia de `lm_head` y `embed_tokens`.
- Procesamiento multimodal (visión): posible, dado que el script excluye de la cuantización los tensores cuyo nombre empieza por `model.visual.`. No confirmado.
- Razonamiento y código: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Decodificación con multi-token prediction (MTP): la presencia de un bloque `mtp.*` en la lista de exclusión es compatible con un módulo de predicción multi-token, pero no hay confirmación de que esté activo ni de cómo se usa en inferencia.

## Casos de uso

Los siguientes escenarios son aplicables en la medida en que se confirmen las características del modelo; se indican las condiciones en cada caso.

- Despliegue en producción con FP8 sobre GPU Hopper o Ada: el repositorio publica pesos ya cuantizados a `float8_e4m3fn` con escalas por tensor, listos para servirse en vLLM o SGLang en hardware con soporte nativo de FP8, reduciendo a la mitad el espacio de pesos frente a BF16.
- Replicación del pipeline de cuantización: el script incluido sirve como receta reproducible para recuantizar otros checkpoints con la misma estructura, útil en equipos que ya trabajan con llm-compressor y compressed-tensors.
- Integración en infraestructura Nix: la derivación está escrita como módulo de Nix flakes, por lo que encaja en entornos declarativos que gestionan modelos y dependencias CUDA de forma reproducible.
- Investigación sobre atención lineal híbrida: si se confirma la arquitectura, el modelo sería un objeto de estudio para medir el comportamiento de capas `linear_attn` frente a atención completa en tareas de contexto largo.
- Evaluación de cuantización FP8 frente a GGUF: comparar esta conversión con las variantes GGUF del repositorio de origen permite medir la degradación de precisión entre ambos esquemas, siempre que se disponga de un conjunto de evaluación propio.
- Servicio de inferencia en GPUs de consumo: con una variante GGUF del repositorio de origen, un modelo de ~27B puede ejecutarse en una única GPU de 24 GB usando llama.cpp u Ollama.
- Prototipado de aplicaciones multimodales: únicamente si se confirma la presencia y el funcionamiento de la torre visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto documentación técnica relacionada (los resultados obtenidos eran páginas de soporte sobre la instalación de Google Chrome, sin relación con el modelo).

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir de un tamaño nominal de 27 000 millones de parámetros, no mediciones publicadas:

- Pesos en FP8 (`float8_e4m3fn`): aproximadamente 27 GB. Con caché KV y activaciones para contextos moderados, conviene disponer de 32-40 GB de VRAM.
- Pesos en BF16 (si se usa el modelo de origen sin cuantizar): aproximadamente 54 GB, lo que exige una A100 80 GB, H100 80 GB o varias GPU.
- Variantes GGUF típicas de la gama Q4: aproximadamente 15-17 GB, lo que permite ejecución en una RTX 4090, RTX 3090 o RTX 5090 de 24 GB o más.
- FP8 nativo: requiere GPUs con soporte de FP8 en hardware, como H100, H200, L40S, RTX 4090 o RTX 5090. En GPUs Ampere o anteriores el FP8 puede ejecutarse con dequantización, con penalización de rendimiento.
- Opciones de despliegue: vLLM y SGLang para FP8 en servidor con GPU; TGI como alternativa; llama.cpp, Ollama y LM Studio para las variantes GGUF del repositorio de origen.
- Latencia y throughput: no disponible. No se ha publicado ninguna medición de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificables para comparar este modelo con alternativas de la misma categoría, ya que ni siquiera están confirmados sus parámetros, contexto o licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JohnieBraaf/Qwen3.8-27b-Swift | ~27B (no confirmado) | no disponible | no disponible | FP8 safetensors en HuggingFace |
| ukisai/Swift-Qwen3.8-27B-GGUF (origen) | no disponible | no disponible | no disponible | GGUF en HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni resultados de pérdida de precisión tras la cuantización, ni comparación con el modelo de origen en BF16.
- La cuantización FP8 aplicada es por tensor (una única escala por matriz de pesos), un esquema más agresivo que las escalas por canal o por grupo; cabe esperar una degradación mayor que con esquemas más finos, aunque no se ha medido.
- El script excluye de la cuantización `lm_head`, `embed_tokens`, la torre visual y todos los submódulos internos de las capas de atención lineal, lo que deja una parte significativa del modelo en su precisión original y hace que el ahorro real de memoria sea inferior al teórico de 2x.
- La licencia no está declarada. Al ser un derivado, la licencia del modelo de origen y la del modelo base subyacente condicionan cualquier uso comercial; debe verificarse antes de desplegarlo en producción.
- Los idiomas soportados no están declarados; no puede asumirse cobertura multilingüe.
- Riesgo de alucinación y sesgos: no evaluados, sin datos disponibles.
- El repositorio no registra descargas ni valoraciones, por lo que no existe validación por parte de la comunidad.
- La fecha de creación declarada (2026-09-13) y el nombre "Qwen3.8" no corresponden a ninguna nomenclatura oficial conocida, lo que refuerza la necesidad de tratar la procedencia del modelo con cautela.
- La model card no incluye tarjeta de uso, limitaciones declaradas ni instrucciones de prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnieBraaf/Qwen3.8-27b-Swift
- Modelo de origen (GGUF): https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- La búsqueda web realizada no devolvió ningún enlace relevante: los únicos resultados obtenidos fueron páginas de soporte de Google sobre la descarga e instalación de Chrome, sin relación con el modelo. No se han localizado papers, blogs, repositorios ni demos asociados.
