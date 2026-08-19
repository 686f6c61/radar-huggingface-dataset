# Chungulus/Qwen3.8-27B-MLX-5bit-Group128

## Resumen

Chungulus/Qwen3.8-27B-MLX-5bit-Group128 es una cuantizacion MLX de 5 bits con grupo de 128 del modelo vision-language Qwen/Qwen3.8-27B, desarrollada por el usuario Chungulus. No se trata de un fine-tune ni de una modificacion de alineacion, sino de una conversion directa de los pesos originales, fijados en un commit concreto del repositorio fuente. El objetivo es permitir la ejecucion del modelo en hardware Apple Silicon con memoria unificada, reduciendo el peso de 19,4 GB a un formato optimizado para MLX.

El modelo base emplea una arquitectura hibrida que combina atencion lineal Gated DeltaNet con atencion completa, e incluye un vision tower, un proyector y un componente MTP (Multi-Token Prediction) para decodificacion especulativa. El nombre "27B" sugiere un modelo de 27 mil millones de parametros, pero el conteo real de los safetensors es de 5.085.670.640 parametros (aproximadamente 5,09 mil millones), una discrepancia que el autor no aclara en la model card. La cuantizacion esta validada contra la fuente BF16 con una similitud semantica media de 0,9368 y una concordancia top-1 del 99,06%.

La relevancia de esta publicacion radica en que ofrece una cuantizacion lista para usar en Apple Silicon, con soporte para tool calling, vision y MTP, todo bajo licencia Apache-2.0. Sin embargo, el contexto probado es muy limitado (73 tokens como maximo en las validaciones), por lo que no se puede garantizar el rendimiento en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet + atencion completa, con vision tower y MTP |
| Parametros totales | 5.085.670.640 (segun safetensors; el nombre del modelo indica 27B, discrepancia no aclarada) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (contexto maximo probado: 73 tokens) |
| Tipos de cuantizacion | MLX affine 5-bit, group size 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), incluye drafter MTP |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura hibrida que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa (full attention). Este diseno busca reducir el coste computacional en contextos largos manteniendo la calidad en tareas que requieren atencion global. El modelo incluye un vision tower (333 tensores) y un proyector para procesamiento de imagenes, ademas de un componente MTP (Multi-Token Prediction) que actua como drafter en esquemas de decodificacion especulativa.

La cuantizacion se realizo con el algoritmo MLX affine de 5 bits con grupo de 128, sin calibracion (calibration_source: none). No se aplico ningun fine-tune, merge ni modificacion del chat template. Los pesos fuente estan fijados en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio oficial. El inventario de tensores incluye 1199 tensores en total, de los cuales 333 corresponden a vision y 15 a MTP. La conversion requiere `mlx-vlm` version 0.6.1.

Las validaciones internas muestran una equivalencia con la fuente BF16: similitud semantica media de 0,9368 (medida con `paraphrase-multilingual-MiniLM-L12-v2`), divergencia KL media de 0,0079, concordancia top-1 del 99,06% y una delta de perplejidad de -0,083 (el modelo cuantizado es ligeramente mejor en perplejidad, probablemente por ruido numerico). El MTP alcanza una tasa de aceptacion del 95,45% y un speedup medido de 1,047x en throughput.

## Capacidades

- Generacion de texto conversacional con soporte de chat template nativo de Qwen, incluyendo controles de thinking (`enable_thinking`, `reasoning_effort`, `preserve_thinking`).
- Procesamiento de imagenes (image-text-to-text): el modelo acepta entradas visuales y genera descripciones o respuestas basadas en ellas. Paso pruebas deterministicas locales de vision y video.
- Tool calling / function calling: soporta el formato XML nativo de Qwen y paso todas las pruebas de herramientas.
- Decodificacion especulativa con MTP: el drafter MTP incluido acelera la generacion aproximadamente un 4,7% en las pruebas realizadas.
- Capacidades multilingues: no confirmadas en la informacion proporcionada.
- Razonamiento multi-step: no hay datos especificos, pero el modo thinking sugiere capacidad de razonamiento extendido.

## Casos de uso

- Asistente de atencion al cliente con analisis de imagenes: el modelo puede recibir capturas de pantalla o fotos de productos y generar respuestas contextualizadas. Su soporte de tool calling permite integrarlo con sistemas de tickets o CRMs para consultar bases de datos.
- Generacion de codigo asistida por vision: un desarrollador puede subir un diagrama o una captura de una interfaz y pedir al modelo que genere el codigo correspondiente. La combinacion de vision y generacion de texto lo hace adecuado para prototipado rapido.
- Automatizacion de documentacion tecnica: con tool calling, el modelo puede extraer informacion de imagenes (graficas, diagramas) y redactar documentacion estructurada, integrándose en pipelines de CI/CD.
- Analisis de imagenes medicas o cientificas (con supervisión humana): el modelo puede describir hallazgos visibles en radiografias o imagenes de microscopia, aunque no debe usarse como unico criterio diagnostico.
- Chatbot educativo multimodal: estudiantes pueden enviar fotos de problemas matematicos o diagramas y recibir explicaciones paso a paso. El modo thinking permite respuestas razonadas.
- Prototipado de agentes con vision: gracias al soporte de tool calling y MTP, se puede construir un agente que observe el estado de una interfaz (captura de pantalla) y ejecute acciones mediante herramientas, con una latencia reducida por la decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente validaciones internas comparando la cuantizacion con la fuente BF16:

| Metrica | Valor |
|---|---|
| Similitud semantica media (vs BF16) | 0,9368 |
| Divergencia KL media (vs BF16) | 0,0079 |
| Concordancia top-1 (vs BF16) | 0,9906 |
| Delta de perplejidad (vs BF16) | -0,083 |
| Tasa de aceptacion MTP | 0,9545 |
| Speedup MTP | 1,047x |
| Throughput medio (BF16 source) | 14,55 tokens/s |
| Throughput con MTP | 14,34 tokens/s |
| Pico de memoria | 20,76 GB |

Estas metricas no son comparables con benchmarks publicos y solo indican fidelidad respecto al modelo original en casos de prueba limitados.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con al menos 32 GB de memoria unificada (segun el autor).
- Pico de memoria medido: 20,76 GB durante la generacion, por lo que 32 GB es el minimo recomendado para margen.
- Tamano del artefacto: 19,47 GB en disco.
- GPU recomendadas: no aplica a GPU NVIDIA/AMD; esta cuantizacion esta disenada exclusivamente para el ecosistema MLX en Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4 con suficiente RAM unificada).
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque el formato MLX no es compatible con CUDA.
- Opciones de despliegue: `mlx-vlm` (version 0.6.1) para generacion con vision, `mlx-lm` (version 0.31.3) para texto. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Rendimiento medido: aproximadamente 14,5 tokens/s en Apple Silicon con el drafter MTP activado (depende del hardware exacto, no especificado).

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros modelos de la misma categoria. La unica comparacion fiable es contra el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 27B (nominal) | no disponible | Apache-2.0 | safetensors | Modelo original, requiere ~54 GB en BF16 |
| Chungulus/Qwen3.8-27B-MLX-5bit-Group128 | 5,09B (segun safetensors) | no disponible | Apache-2.0 | safetensors (MLX) | Cuantizacion 5-bit, 19,4 GB, solo Apple Silicon |

No se han encontrado otras cuantizaciones MLX del mismo modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 5 bits puede degradar la calidad en tareas complejas, especialmente en razonamiento aritmetico o generacion de codigo largo. El autor advierte que la reduccion de calidad es mayor a bit widths muy bajos.
- El contexto maximo probado es de solo 73 tokens. No se debe asumir que el modelo funciona correctamente en contextos largos, aunque la arquitectura base pueda soportarlos.
- El soporte runtime es especifico: se requiere `mlx-vlm` 0.6.1 y `mlx-lm` 0.31.3. Un loader que solo lea tensores de lenguaje no es suficiente debido al grafo hibrido Gated DeltaNet/atencion completa, el vision tower y el MTP.
- La discrepancia entre el nombre del modelo (27B) y el conteo real de parametros (5,09B) no esta aclarada por el autor. Esto puede afectar a la planificacion de recursos.
- No hay benchmarks publicos estandar, por lo que el rendimiento real en tareas como MMLU o HumanEval es desconocido.
- El modelo solo es utilizable en Apple Silicon; no es compatible con GPUs NVIDIA o AMD.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la atribucion del modelo base en el repositorio oficial de Qwen.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-5bit-Group128
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
