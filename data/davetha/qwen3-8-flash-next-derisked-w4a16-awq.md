# davetha/Qwen3.8-Flash-Next-DERISKED-W4A16-AWQ

## Resumen

`Qwen3.8-Flash-Next-DERISKED-W4A16-AWQ` es una cuantizacion W4A16 (AWQ) del modelo `Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16`, una variante "abliterada" (sin comportamientos de rechazo) del modelo multimodal `Qwen3.8-Flash-Next` de Qwen. Esta cuantizacion esta pensada para ejecutar un modelo de 125.000 millones de parametros (con solo 6.000 millones activos por token) en hardware de gama media-alta, concretamente en dos GPU AMD MI210 (gfx90a) con vLLM y contexto largo de 262.144 tokens.

La arquitectura combina una mezcla ultra-dispersa de expertos (MoE) con capas de atencion lineal Gated DeltaNet (GDN), atencion dispersa Qwen Sparse Attention (QSA), decodificacion especulativa MTP y una tabla de n-gramas PLE de 51.000 millones de parametros. La cuantizacion AWQ conserva en bf16 los componentes criticos (capas recurrentes, router, cabezas de decodificacion especulativa y tabla PLE) y cuantiza a 4 bits los expertos enrutados y las proyecciones de atencion. El resultado es un modelo que alcanza ~2.200 tokens/s en prefill y ~40 tokens/s en decodificacion con especulacion MTP en el hardware objetivo.

Este repo es relevante porque demuestra que es posible ejecutar un modelo de la clase de 125B con contexto de 256K en un equipo de dos GPU con 64 GB de VRAM cada una, gracias a la cuantizacion W4A16 y al offloading de la tabla PLE a CPU. La licencia es la Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-dispersa con GDN (Gated DeltaNet), QSA (Qwen Sparse Attention), MTP (decodificacion especulativa) y tabla PLE (n-gramas) |
| Parametros totales | Modelo base: 125B (incluye 51B de tabla PLE); pesos cuantizados en safetensors: 20.717.087.216 |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 (256K) |
| Tipos de cuantizacion | W4A16 AWQ, grupo 128, simetrico, sin zero-point (compressed-tensors) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | Safetensors (compressed-tensors, compatible con vLLM TritonW4A16) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` es un Transformer multimodal ultra-disperso de 125B parametros con 6B activos por token. Su arquitectura combina cuatro innovaciones: (1) Gated DeltaNet (GDN) en tres de cada cuatro capas, que comprime el historial de forma recurrente; (2) Qwen Sparse Attention (QSA) en la cuarta capa para recuperacion precisa de contexto largo; (3) una tabla de n-gramas PLE de 51B parametros que se offloadea a CPU y se transmite por PCIe; y (4) una cabeza MTP para decodificacion especulativa.

Esta ficha corresponde a una cuantizacion W4A16 mediante AWQ (activation-aware quantization) aplicada sobre la version "derisked" (abliterada) de Blackfrost-AI. La cuantizacion se restringe a los expertos enrutados (gate/up/down) y a las proyecciones de atencion completa (q/k/v/o). Se mantienen en bf16 las capas GDN (por su estado recurrente sensible a errores), el experto compartido, el indexador QSA, los routers, las hiperconexiones, las normas, `embed_tokens`, `lm_head`, la cabeza MTP y la tabla PLE. El suavizado AWQ se limita a pares `up_proj → down_proj` para no alterar las puertas sigmoidales de las hiperconexiones. No se dispone de informacion sobre el entrenamiento original (tokens, dataset, RLHF/DPO) mas alla de que el modelo base fue publicado por Qwen en agosto de 2026.

## Capacidades

- Generacion de texto multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`).
- Razonamiento de contexto largo: soporta hasta 262.144 tokens, util para analisis de documentos extensos o conversaciones multi-turno muy largas.
- Decodificacion especulativa MTP: acelera la generacion hasta 4x frente a decode sin especulacion (40 tok/s vs 10 tok/s medidos).
- Capacidades de agente y tool calling: el modelo base de Qwen incluye soporte para agentes y llamadas a herramientas, aunque no se especifica si la cuantizacion los conserva integros.
- Multilingue: no se ha publicado la lista de idiomas soportados para esta variante.
- Sin rechazos de seguridad: al ser una version abliterada, el modelo no muestra comportamientos de rechazo ante peticiones que normalmente serian bloqueadas.

## Casos de uso

- Analisis de documentos extensos: con 256K de contexto, puede procesar libros completos, expedientes legales o informes financieros de cientos de paginas en una sola pasada, extrayendo informacion y respondiendo preguntas sobre el contenido.
- Asistente de codigo en entornos con GPU limitada: la cuantizacion W4A16 permite ejecutar un modelo de clase 125B en dos GPU de 64 GB, lo que facilita su integracion en estaciones de trabajo de desarrolladores sin acceso a clusters de alto rendimiento.
- Razonamiento multimodal en produccion: al aceptar imagenes y texto, puede describir diagramas, capturas de pantalla o fotografias y razonar sobre ellos en tareas de documentacion tecnica o soporte visual.
- Chat conversacional de largo recorrido: la combinacion de contexto largo y decodificacion especulativa permite mantener conversaciones con historial muy amplio (por ejemplo, asistencia tecnica con registro completo de interacciones) con una latencia aceptable (~40 tok/s).
- Investigacion en alineacion y seguridad: al ser una version abliterada, sirve como banco de pruebas para estudiar el impacto de eliminar los comportamientos de rechazo en modelos de gran tamano, siempre bajo condiciones controladas.
- Despliegue en hardware ROCm: el soporte para vLLM en AMD MI210 abre la posibilidad de ejecutar modelos de gran tamano en infraestructura AMD, reduciendo costes frente a NVIDIA equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) especificos para esta cuantizacion en la informacion disponible. El modelo base `Qwen3.8-Flash-Next` cuenta con benchmarks publicados por Qwen (JobBench, CoWorkBench, IFBench, Agent's Last Exam, entre otros) en su repositorio oficial, pero no se incluyen los datos numericos en esta ficha.

El rendimiento medido por el autor en 2× AMD MI210 con vLLM (TP=2, contexto 256K) es el siguiente:

| Metrica | Valor |
|---|---|
| Prefill | ~2.200 tok/s (aumenta con la longitud del prompt) |
| Decode con MTP (3 tokens especulativos) | ~40 tok/s |
| Decode sin especulacion | ~10 tok/s |

## Requisitos de hardware

- GPU recomendadas: 2× AMD MI210 (64 GB HBM2e cada una, gfx90a) con vLLM y ROCm. No se han probado en NVIDIA, aunque por compatibilidad con `TritonW4A16` deberia funcionar en GPUs con soporte int4 (p.ej. A100, H100, RTX 4090) pero sin garantias.
- VRAM estimada: los pesos cuantizados (~20.7B parametros en W4A16) ocupan aproximadamente 10-11 GB, pero el contexto largo (256K) y las activaciones requieren una cantidad significativa de memoria. El autor recomienda al menos 64 GB de VRAM por GPU para el escenario completo.
- La tabla PLE (~100 GB en bf16) se offloadea a CPU y se transmite por PCIe, por lo que se necesita al menos 60 GB de RAM del sistema (configurado con `--cpu-offload-gb 60`).
- Opciones de despliegue: vLLM con ROCm (comandos proporcionados en el README), incluyendo `--enable-expert-parallel`, `--moe-backend triton` y configuracion especifica para `num_speculative_tokens=3`.
- Latencia y throughput: prefill ~2.200 tok/s, decode con especulacion ~40 tok/s, decode sin especulacion ~10 tok/s (medidos en el hardware citado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B totales, 6B activos | 262K | BF16 | Qwen Community 1.0 | Modelo original de Qwen, multimodal |
| Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16 | 125B totales, 6B activos | 262K | BF16 | Qwen Community 1.0 | Version abliterada, sin cuantizar |
| davetha/Qwen3.8-Flash-Next-DERISKED-W4A16-AWQ | 20.7B en pesos cuantizados | 262K | W4A16 AWQ | Qwen Community 1.0 | Cuantizacion de la version abliterada, orientada a MI210 |

No se dispone de datos de rendimiento comparativo entre estas variantes. La cuantizacion W4A16 reduce el espacio en disco de ~180 GB a ~180 GB (el repo ocupa 179.9 GB, aunque incluye la tabla PLE en bf16), pero permite cargar los pesos principales en VRAM reducida.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los comportamientos de rechazo de seguridad. El modelo puede generar contenido inapropiado, ofensivo o peligroso si se le pide. El usuario asume toda la responsabilidad de su uso y debe cumplir la licencia y la legislacion aplicable.
- Licencia restrictiva: la Qwen Community License 1.0 no es una licencia de codigo abierto convencional. Incluye condiciones especificas sobre uso comercial, redistribucion y atribucion. Consulte el texto completo de la licencia antes de usar el modelo en produccion.
- Limitaciones de decodificacion especulativa: el parametro `num_speculative_tokens` no puede superar 3 en esta configuracion (n≥5 provoca un error en el indexador QSA). Valores superiores no funcionan.
- Dependencia de hardware especifico: el rendimiento optimo se ha medido solo en AMD MI210 con ROCm. En otras plataformas (NVIDIA, CPU) el rendimiento puede degradarse significativamente, especialmente en decode sin especulacion (~10 tok/s).
- Offloading de la tabla PLE: la tabla de n-gramas (~100 GB) se transmite por PCIe, lo que convierte el decode en un cuello de botella de ancho de banda. Sin la cabeza MTP, la generacion es muy lenta.
- Idiomas y sesgos: no se ha publicado la lista de idiomas soportados ni los sesgos inherentes del modelo base. Como derivado de un modelo abliterado, los sesgos originales pueden haberse alterado de forma impredecible.
- Riesgo de alucinacion: no se han evaluado las tasas de alucinacion de esta cuantizacion. La cuantizacion AWQ puede introducir pequenas degradaciones en tareas de razonamiento y facticidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/davetha/Qwen3.8-Flash-Next-DERISKED-W4A16-AWQ
- Modelo base abliterado: https://huggingface.co/Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Notas de tuning en GitHub: https://github.com/davetha/mi210-flashnext-vllm
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Pagina de benchmarks y specs: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
