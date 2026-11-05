# defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4

## Resumen

PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4 es una conversión experimental del checkpoint MiniMax-M3.1-Flash-DeRisked (una variante "abliterated" del modelo multimodal MiniMax-M3.1-Flash), publicada por el usuario defnoteatin bajo el marco que el autor denomina PseudoBrain (PB-27). El objetivo declarado es extender la ventana de contexto hasta 1.056.768 tokens mediante la sustitución de las 15 capas de atención densa del modelo original por capas híbridas con ventana deslizante de 16K, un índice de memoria exacta a nivel de página y una rama recurrente paralela basada en Gated DeltaNet. El resto de la arquitectura (45 capas de atención block-sparse con lightning-indexer, enrutadores y expertos MoE en NVFP4/MXFP8, y la torre de visión) se mantiene sin cambios según la model card.

El modelo se distribuye en formato NVFP4 + MXFP8 para su uso con vLLM mediante un plugin propio (`pb27_vllm`), y el repositorio ocupa 172,1 GB. Los safetensors declaran 150.417.108.500 parámetros totales, aunque el nombre del repositorio hace referencia a "285B", lo que sugiere una discrepancia entre el etiquetado comercial y el recuento real de pesos; conviene tratar ambas cifras con cautela. La licencia declarada es Apache 2.0 y el pipeline es image-text-to-text, por lo que conserva capacidades multimodales.

La relevancia de esta ficha es doble: por un lado, documenta una técnica poco habitual (hibridación de atención densa con estado recurrente y memoria externa indexada) aplicada a un modelo MoE multimodal de gran tamaño; por otro, es un ejemplo de checkpoint derivado de terceros con escasa validación independiente, sin descargas ni valoraciones en el momento de la consulta, y con afirmaciones de paridad ("100% lossless", "KL divergence 0.000000") que no están respaldadas por benchmarks públicos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE multimodal: 60 capas (45 block-sparse lightning-indexer + 15 densas convertidas a PB-27 windowed-hybrid), con rama recurrente Gated DeltaNet y torre de visión |
| Parámetros totales | 150.417.108.500 (según safetensors); el nombre del repo indica "285B" |
| Parámetros activos | no disponible (el modelo base es MoE con 128 expertos, pero no se especifica el número de expertos activos por token) |
| Longitud de contexto | 1.056.768 tokens (ventana deslizante de 16.384 con 4 attention sinks y recuperación de bloques KV exactos) |
| Tipos de cuantización | NVFP4 (expertos y enrutadores MoE) + MXFP8; KV-cache en fp8_e4m3 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `--trust-remote-code`), más un fichero auxiliar `pb27-gdn-00001-of-00001.safetensors` para la rama Gated DeltaNet |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-M3.1-Flash, un transformer MoE multimodal de 60 capas con 128 expertos, del que 45 capas usan atención block-sparse con lightning-indexer y 15 son de atención densa completa (índices 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59). La conversión PB-27 sustituye esas 15 capas densas por capas híbridas con tres componentes: atención con ventana deslizante de 16.384 tokens y 4 attention sinks; una capa de memoria exacta a nivel de página (`pb27_vllm.memory`) que recupera los top-k bloques KV del archivo de contexto largo hasta 1.056.768 tokens; y una rama recurrente paralela Gated DeltaNet (`self.gdn`, clase `QwenGatedDeltaNetAttention`) inicializada desde las proyecciones de `self_attn` del modelo profesor con `out_proj` a cero, de modo que la divergencia KL en contexto corto sea nula según el autor. Las 45 capas sparse, los enrutadores y expertos MoE y la torre de visión no se modifican.

No se documenta en la información disponible ningún proceso de entrenamiento adicional: no hay datos sobre número de tokens de preentrenamiento, composición del dataset, fases de RLHF/DPO ni sobre el procedimiento de "abliteration" aplicado en el checkpoint base DeRisked. La innovación técnica declarada es exclusivamente arquitectónica e inferencial (hibridación atención-recurrencia-memoria indexada), no de entrenamiento. El modelo requiere un plugin de vLLM propietario (`pb27_vllm_plugin`, instalable con `pip install -e ./pb27_vllm_plugin`) y ejecución con `--trust-remote-code`, lo que implica cargar código Python arbitrario del repositorio.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto extremadamente largo (hasta ~1M tokens), gracias a la combinación de ventana deslizante y memoria indexada.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), conservando la torre de visión del modelo base.
- Razonamiento sobre documentos muy extensos: la memoria exacta a nivel de página permite recuperar bloques KV concretos de un archivo de hasta 1.056.768 tokens.
- Capacidades de código y matemáticas heredadas del modelo base MiniMax-M3.1-Flash (no cuantificadas en la información disponible).
- Soporte multilingüe heredado del base, aunque los idiomas concretos no están declarados en la ficha.
- Compatibilidad con el ecosistema vLLM (servido como API OpenAI-compatible mediante `vllm serve`).
- No se documenta explícitamente soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Análisis de repositorios de código completos: con ~1M tokens de contexto, el modelo puede ingerir un monorepo mediano y responder preguntas sobre dependencias cruzadas entre módulos, usando la memoria indexada para recuperar fragmentos exactos de ficheros ya procesados.
- Revisión de contratos y documentación legal extensa: la ventana de 1M tokens permite cargar expedientes completos y hacer preguntas de trazabilidad ("¿en qué cláusula se contradice el anexo B con el artículo 7?"), apoyándose en la recuperación exacta de bloques KV.
- Auditoría de logs y trazas de sistemas distribuidos: ingesta de volúmenes grandes de trazas y correlación de eventos separados por cientos de miles de tokens, un escenario donde la ventana deslizante de 16K por sí sola sería insuficiente.
- Procesamiento de documentación multimodal: al conservar la torre de visión, puede analizar manuales técnicos con diagramas, capturas de pantalla y tablas junto con el texto circundante en un mismo contexto largo.
- Investigación académica sobre arquitecturas híbridas: sirve como banco de pruebas para comparar atención densa, ventana deslizante con sinks y estado recurrente Gated DeltaNet sobre el mismo checkpoint, útil para grupos que estudien eficiencia de contexto.
- Generación asistida sobre corpus científicos: carga de varios papers completos y síntesis comparativa, aprovechando la memoria exacta para citar pasajes concretos sin depender solo de la ventana reciente.
- Despliegue en infraestructura con GPU de gran memoria: el formato NVFP4 + MXFP8 reduce el peso respecto a BF16, lo que permite servir el modelo en nodos multi-GPU con vLLM y KV-cache en fp8, adecuado para entornos de investigación con clúster propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma "100% lossless short-context generation and reasoning parity" y "KL divergence 0.000000" en contexto corto, pero no aporta tablas de MMLU, HumanEval, GSM8K, MMMU ni comparaciones numéricas con el modelo base. Estas afirmaciones deben considerarse no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 172,1 GB en NVFP4 + MXFP8; se necesita al menos esa cantidad agregada de memoria, más el espacio para KV-cache en fp8_e4m3 y el archivo de memoria indexada, que crece con la longitud de contexto solicitada.
- GPU recomendadas: no es viable en GPUs de consumo. Requiere nodos multi-GPU de centro de datos (H100 80 GB, H200, B200 o A100 80 GB en configuraciones de 4-8 unidades) para alojar los pesos y el estado.
- Cabe en consumer GPU: no. Ni siquiera en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo de 4×24 GB.
- Opciones de despliegue: exclusivamente vLLM con el plugin `pb27_vllm` y `--trust-remote-code`. No se documenta soporte para llama.cpp, Ollama, TGI ni otros runtimes, dado el código personalizado (`custom_code`) y las capas PB-27 no estándar.
- Latencia y throughput estimados: no disponibles. La rama recurrente Gated DeltaNet es de tiempo lineal en la longitud de secuencia, lo que en teoría reduce el coste frente a atención cuadrática en contextos muy largos, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4 | 150,4B (safetensors); "285B" en el nombre | 1.056.768 tokens | NVFP4 + MXFP8, safetensors custom | Apache 2.0 | vLLM + plugin propio |
| MiniMaxAI/MiniMax-M3.1-Flash (base oficial) | no disponible en la información | no disponible | no disponible | no disponible | HuggingFace (referenciado como base) |
| Blackfrost-Research/MiniMax-3.1-Flash-DeRisked (base de esta conversión) | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciado como base) |
| PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4 (variante compacta del mismo autor) | 32 expertos, repo de 68,9 GB | 1.056.768 tokens (misma técnica PB-27) | NVFP4 + MXFP8 | Apache 2.0 | vLLM + plugin propio |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base oficial en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Modelo derivado de terceros sin validación independiente: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia externa de que las afirmaciones de paridad se cumplan.
- Discrepancia de tamaño: el nombre indica "285B" pero los safetensors declaran 150,4B parámetros; conviene verificar el recuento real antes de planificar infraestructura.
- Requiere `--trust-remote-code` y un plugin de vLLM propio, lo que implica ejecutar código no auditado en el servidor de inferencia; riesgo de seguridad relevante en producción.
- El checkpoint base es una variante "abliterated" (DeRisked), lo que puede alterar el comportamiento de rechazo ante peticiones dañinas; no se documenta el alcance de esa modificación ni sus efectos sobre seguridad.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas de fidelidad en contexto largo, precisamente el escenario para el que se diseñó el modelo.
- Idiomas soportados no declarados; el rendimiento multilingüe es desconocido y podría degradarse respecto al base.
- La memoria indexada a nivel de página introduce estado adicional cuyo coste de almacenamiento y latencia de recuperación no se documenta.
- Compatibilidad limitada: no hay soporte para llama.cpp, Ollama ni TGI, lo que restringe el despliegue a entornos vLLM con el plugin.
- Aunque la licencia es Apache 2.0, el modelo base y el checkpoint intermedio tienen licencias no verificadas en esta información; conviene revisar los términos de los repositorios upstream antes de un uso comercial.
- Fecha de creación del repositorio (2026-11-05) y ausencia de historial de mantenimiento: no hay garantía de actualizaciones o corrección de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4
- Checkpoint base de esta conversión: https://huggingface.co/Blackfrost-Research/MiniMax-3.1-Flash-DeRisked
- Modelo oficial de referencia (mencionado en la model card): https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Variante compacta del mismo autor: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4
- Variante oficial NVFP4 del mismo autor: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-NVFP4
- Checkpoint podado de referencia: https://huggingface.co/primitive-ai/MiniMax-M3.1-Flash-pruned-285B-NVFP4
- Checkpoint E32 de referencia: https://huggingface.co/Sm0r3s/MiniMax-M3.1-Flash-E32-unhealed
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
