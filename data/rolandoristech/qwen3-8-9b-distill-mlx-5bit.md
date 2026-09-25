# RolanDorisTech/Qwen3.8-9B-Distill-MLX-5bit

## Resumen

Qwen3.8-9B-Distill-MLX-5bit es una version cuantizada en formato MLX del modelo empero-ai/Qwen3.8-9B-Distill, un transformer denso de aproximadamente 9.000 millones de parametros destilado de un profesor de mayor escala (Qwen3.8, 2,4T de parametros totales con 95B activos) y que reutiliza la arquitectura Qwen3.5-9B. La publica el usuario RolanDorisTech y esta pensada para ejecucion local en Apple Silicon mediante mlx-lm, LM Studio, oMLX y mlx-swift.

El repositorio es un alias declarado de RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e: mismos pesos y mismo metodo de cuantizacion, con un nombre orientado a busquedas. La cuantizacion aplicada es oQ5e, una mezcla de precisiones de clase 5 bits (aproximadamente 5 bits por peso de media) que combina asignacion no uniforme de bits por sensibilidad de capa con ponderacion por importancia de activaciones (imatrix). El resultado ocupa 6,0 GB en disco y mantiene la ventana de contexto nativa de 262.144 tokens del modelo base, lo que permite razonamiento de cadena larga y analisis de documentos extensos sin salir de un equipo de sobremesa.

Su relevancia actual es doble: por un lado acerca a hardware de consumo un modelo de razonamiento con trazas de pensamiento destiladas; por otro, sirve como ejemplo practico de cuantizacion dinamica consciente de la sensibilidad, una linea de investigacion con resultados publicados que muestran mejoras notables frente a la cuantizacion uniforme en anchuras agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5-9B) con razonamiento de cadena destilado |
| Parametros totales | ~9.000 millones (9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ5e (mixed-precision de clase 5 bits, ~5 bits por peso de media, con ponderacion imatrix); existe variante oQ4e de 4,9 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (compatible con mlx-lm, oMLX, LM Studio y mlx-swift) |
| Tamano en disco | 6,0 GB |
| Repositorio canonico | RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e (este repo es un alias) |
| Modelo base | empero-ai/Qwen3.8-9B-Distill |
| Plantilla de prompt | Plantilla de chat Qwen3 con etiquetas `<think>`; se incluye `chat_template.jinja` |
| Fecha de creacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso causal de unos 9.000 millones de parametros construido sobre la arquitectura Qwen3.5-9B y destilado a partir de un profesor de escala frontera: Qwen3.8, un modelo MoE de 2,4 billones de parametros totales y 95.000 millones activos. La destilacion traslada el comportamiento de razonamiento mediante trazas reales del profesor, de modo que cada respuesta se abre con un bloque `<think>` aprendido y no con un razonamiento generado de forma implicita. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron etapas de RLHF o DPO.

La innovacion tecnica de este repositorio concreto es la cuantizacion. El metodo oQ mide la sensibilidad real de cada capa al error de cuantizacion pasando datos de calibracion por el modelo y reparte un presupuesto de bits no uniforme, concentrando precision en capas desproporcionadamente sensibles como `lm_head`, los embeddings de tokens y los primeros y ultimos bloques del transformer. La variante oQe anade una pasada de calibracion de importancia de activaciones que usa estadisticas por canal (imatrix) para ponderar el error, dando mas peso a los canales relevantes durante la calibracion. La salida es safetensors estandar de MLX, por lo que no requiere kernels propietarios. Los unicos resultados publicados por el autor corresponden al metodo oQ sobre Qwen3.5-35B-A3B, no a este modelo.

## Capacidades

- Generacion de texto causal con modo de razonamiento explicito: las respuestas incorporan un bloque `<think>` antes de la respuesta final, heredado de las trazas del profesor.
- Razonamiento complejo multi-paso, orientado por el autor del modelo base a matematicas, codigo y problemas de logica encadenada.
- Procesamiento de contexto muy largo: 262.144 tokens nativos, suficiente para libros tecnicos completos, bases de codigo medianas o historiales largos de conversacion.
- Ejecucion local en Apple Silicon con memoria unificada, sin dependencia de GPU dedicada ni de servicios en la nube.
- Integracion con el ecosistema MLX: `mlx_lm.generate`, mlx-lm, oMLX, LM Studio y mlx-swift.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning orquestado: no disponible en la informacion proporcionada (solo se documenta el razonamiento interno en `<think>`).
- Capacidades multilingues: no disponible; no se declaran idiomas en la ficha de HuggingFace.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es unicamente text-generation.

## Casos de uso

- Asistente de razonamiento totalmente local: al ocupar 6,0 GB y ejecutarse sobre MLX, el modelo cabe en un Mac con memoria unificada y permite resolver problemas de logica o matematicas sin enviar datos a terceros, algo critico en entornos con requisitos de confidencialidad.
- Analisis de documentacion tecnica extensa: los 262.144 tokens de contexto permiten cargar especificaciones, contratos o manuales completos y hacer preguntas transversales sin trocear el documento ni perder referencias cruzadas.
- Asistencia a la programacion en local: el modelo base esta optimizado para generacion de codigo, por lo que puede usarse como copiloto en el editor o desde la terminal, con las trazas `<think>` visibles para auditar el razonamiento antes de aceptar una propuesta.
- Prototipado e investigacion sobre cuantizacion: al ser un artefacto oQe reproducible y con el repositorio canonico documentado, sirve para comparar la degradacion de un modelo destilado de 9B entre 4 y 5 bits sobre las mismas tareas.
- Despliegue en portatiles Apple para trabajo de campo: sin GPU dedicada ni conexion, util para consultoria, docencia o auditoria en ubicaciones sin infraestructura de servidores.
- Filtrado y clasificacion de textos largos con justificacion: el bloque de pensamiento permite revisar por que el modelo asigna una categoria, lo que resulta util en triaje de incidencias o moderacion asistida donde se exige trazabilidad.
- Generacion de material didactico paso a paso: la estructura `<think>` mas respuesta final encaja con la produccion de explicaciones graduadas de matematicas o algoritmia, revisables por un docente antes de publicarlas.
- Base para experimentos de destilacion y ajuste fino ligero: el formato MLX safetensors es directamente cargable por mlx-lm, lo que facilita LoRA y evaluaciones rapidas en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad para este modelo concreto en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica evaluada sobre Qwen3.8-9B-Distill en su version oQ5e.

Lo que si se documenta son dos conjuntos de datos sobre el metodo de cuantizacion, que no deben interpretarse como rendimiento de este modelo:

| Evaluacion | Ambito | Resultado |
|---|---|---|
| MMLU, 300 muestras, 2 bits | Uniforme (mlx-lm) vs oQ sobre Qwen3.5-35B-A3B | 14,0 % vs 64,0 % |
| MMLU, 300 muestras, 3 bits | Uniforme (mlx-lm) vs oQ sobre Qwen3.5-35B-A3B | 76,3 % vs 85,0 % |
| MMLU, 300 muestras, 4 bits | Uniforme (mlx-lm) vs oQ sobre Qwen3.5-35B-A3B | 79,7 % vs 83,3 % |
| Perplejidad WikiText-2, Llama-3.1-8B W4A16 | LLM Compressor con observador `imatrix_mse` frente a linea base | 6,96 -> 6,85 (6,83 con GPTQ) |
| Perplejidad C4, LLaMA-7B | RTN uniforme / no uniforme sin sensibilidad / no uniforme con sensibilidad (SqueezeLLM) | 28,26 / 18,08 / 7,75 |

Los dos ultimos bloques proceden de investigacion relacionada citada por el autor (SqueezeLLM y vLLM LLM Compressor) y respaldan la hipotesis de que la ponderacion por sensibilidad e importancia mejora la cuantizacion de solo pesos, pero no miden este artefacto.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: los pesos ocupan 6,0 GB, por lo que se necesita al menos ese espacio mas el cache KV y el overhead del runtime. Con 16 GB de memoria unificada el modelo opera con margen para contextos moderados; para explotar los 262.144 tokens de contexto conviene disponer de 32 GB o mas.
- GPU compatibles: al ser un artefacto MLX, el destino natural son los chips Apple Silicon (series M1, M2, M3 y M4) con memoria unificada. No es un formato para CUDA ni ROCm; en GPU NVIDIA o AMD habria que recurrir a la version del modelo base en otros formatos.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple de gama consumer con suficiente memoria unificada. No esta pensado para RTX 4090, A100 ni H100 en su formato actual.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate`), oMLX, LM Studio mediante busqueda del identificador del repositorio canonico, y mlx-swift. La compatibilidad de runtime debe verificarse contra la version concreta de cada aplicacion.
- Latencia y throughput estimados: no disponible. El autor no publica medidas de tokens por segundo ni de tiempo a primer token.
- Variante de menor huella: RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e ocupa 4,9 GB y reduce el requisito de memoria a costa de mayor perdida de precision.
- Alternativa fuera de MLX: existe una version del modelo base distribuida en Ollama por un tercero (tobestyledintro/qwen3.8-9b-distill), util si el objetivo es funciona en hardware no Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-5bit (oQ5e) | ~9B denso | 262.144 | oQ5e, ~5 bits mezclados con imatrix | 6,0 GB | Apache-2.0 | MLX (mlx-lm, oMLX, LM Studio, mlx-swift) |
| RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e | ~9B denso | 262.144 | oQe, ~4 bits mezclados | 4,9 GB | Apache-2.0 | MLX |
| empero-ai/Qwen3.8-9B-Distill | ~9B denso | 262.144 | sin cuantizar | no disponible | no disponible | HuggingFace, Featherless |
| tobestyledintro/qwen3.8-9b-distill (Ollama) | ~9B denso | no disponible | no disponible | no disponible | no disponible | Ollama |

La comparativa se limita a variantes del mismo modelo base y a su distribucion en otros formatos, porque no se dispone de datos verificables de rendimiento que permitan situarlo frente a alternativas de otros desarrolladores de tamano similar. No se han publicado cifras comparativas de MMLU, HumanEval o GSM8K para ninguno de estos artefactos en la informacion disponible.

## Limitaciones y advertencias

- El repositorio es un alias declarado: los pesos y el metodo son identicos a RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e. Indexar y descargar ambos por separado duplica almacenamiento sin aportar nada.
- Estado de adopcion nulo: 0 descargas y 0 me gusta en el momento de la consulta, con fecha de creacion y actualizacion identicas (25 de septiembre de 2026). No hay validacion de la comunidad ni historial de mantenimiento.
- Ausencia total de benchmarks de calidad sobre este artefacto. Las cifras de mejora que acompanan a la ficha corresponden al metodo oQ evaluado sobre otro modelo (Qwen3.5-35B-A3B) y no garantizan el mismo comportamiento en un destilado de 9B.
- La cuantizacion es irreversible y con perdida: el bloque de pensamiento y el razonamiento de varios pasos son precisamente las capacidades mas sensibles a la degradacion por cuantizacion agresiva, segun la metodologia citada por el propio autor.
- Dependencia de plataforma: MLX solo se ejecuta en Apple Silicon. No hay ruta directa a CUDA, ROCm ni a entornos de servidor x86 convencionales sin cambiar de formato.
- El modelo base es un destilado de la comunidad (empero-ai) y no una publicacion oficial del equipo Qwen; la ficha del modelo base no documenta idiomas, composicion del dataset ni procesos de alineacion, por lo que se desconocen los sesgos heredados.
- Riesgo de alucinacion: no se documentan tasas de error, mecanismos de absteccion ni evaluaciones de veracidad. Como en cualquier modelo de razonamiento destilado, las trazas `<think>` pueden presentar cadenas plausibles pero incorrectas.
- Idiomas soportados no declarados: no hay garantia de calidad fuera de los idiomas cubiertos por el profesor original, que tampoco se detallan.
- Licencia Apache-2.0 en este artefacto, lo que en principio permite uso comercial, pero conviene verificar la licencia efectiva del modelo base y del modelo Qwen original antes de desplegarlo en produccion.
- El aviso de la propia ficha recuerda que la compatibilidad con cada runtime (mlx-lm, oMLX, LM Studio, mlx-swift) depende de la version concreta de la aplicacion y debe comprobarse.

## Enlaces

- Repositorio de este artefacto (alias): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-5bit
- Repositorio canonico (oQ5e): https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e
- Variante de 4 bits: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ4e
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo base en Featherless: https://featherless.ai/models/empero-ai/Qwen3.8-9B-Distill
- Version del modelo base en Ollama: https://ollama.com/tobestyledintro/qwen3.8-9b-distill
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentacion del metodo oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- SqueezeLLM (arXiv:2306.07629): https://arxiv.org/abs/2306.07629
- LLM Compressor con observador imatrix (vLLM): https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/imatrix/
- Canal del autor con tutoriales de IA local en Apple Silicon: https://www.youtube.com/@RolanDorisTech
