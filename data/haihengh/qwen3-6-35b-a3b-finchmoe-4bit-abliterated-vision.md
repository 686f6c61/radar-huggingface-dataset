# haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated-vision

## Resumen

Este repositorio no es un checkpoint al uso, sino un artefacto empaquetado en formato `.finch` para el motor de inferencia out-of-core FinchMoE y sus aplicaciones para Mac/iOS. Contiene el modelo `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated` (una variante "abliterated", es decir, con el comportamiento de rechazo eliminado por el autor upstream) recomprimido con los expertos enrutados a 4 bits, más la torre visual del modelo original copiada byte a byte en BF16. Lo publica el usuario `haihengh`, autor del propio motor FinchMoE, el 28 de octubre de 2026.

El problema que resuelve es concreto: permitir ejecutar un modelo MoE de gran tamaño en equipos con memoria unificada limitada, manteniendo los pesos residentes en memoria (1,76 GiB) y streaming de los expertos desde disco (16,88 GiB), en lugar de exigir cargar los ~20 GB completos. La variante añade capacidad de entrada imagen-texto al montar la torre visual del modelo fuente, que solo se mapea en memoria mientras se codifica una imagen.

Es relevante ahora por dos motivos: por un lado, demuestra el patrón de empaquetado selectivo por tipo de tensor (expertos a 4 bits, router y atención lineal a 8 bits, torre visual intacta en BF16); por otro, es un derivado de un modelo abliterated, con las implicaciones de seguridad que eso conlleva. No hay datos publicados de calidad ni de rendimiento para esta variante concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (atención + GDN + expertos compartidos) y torre visual; el número de capas es 40 y hay 256 expertos enrutados por capa |
| Parametros totales | No disponible de forma explícita; el nombre del modelo indica 35B-A3B, es decir, ~35B totales y ~3B activos por token según la convención de nomenclatura |
| Parametros activos | ~3B (deducido del sufijo A3B del nombre, no declarado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Expertos enrutados: 4-bit affine, grupo 64, escalas y sesgos en BF16. Cuerpo de texto: atención, GDN y expertos compartidos a 4-bit; atención lineal y router a 8-bit; embeddings a 4-bit. Torre visual: BF16 sin cuantizar. No hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (obra derivada del modelo indicado en `base_model`) |
| Formato de pesos | `.finch` propietario del motor FinchMoE (manifest + pesos residentes + expertos empaquetados por capa + tokenizer + visión); la torre visual sí va en `vision/vision.safetensors` |
| Tamano en disco | 20.952.704.819 bytes (19,51 GiB) declarados en el manifest |
| Pesos residentes | 1.894.721.536 bytes (~1,76 GiB) |
| Pool de expertos | 18.119.393.280 bytes (16,88 GiB); 1.769.472 bytes por experto, stride 1 |
| Payload de vision | 893.183.989 bytes (851,8 MiB), 333 tensores BF16 |
| Tokenizer | 22.912.168 bytes (~21,9 MiB) |
| Pipeline | image-text-to-text |
| Libreria | finchmoe |

## Arquitectura y entrenamiento

La model card describe un transformer de mezcla de expertos con 40 capas y 256 expertos enrutados por capa (10.240 expertos en total), combinados con atención, un componente denominado GDN y expertos compartidos. La card no desarrolla qué implementa GDN ni detalla el mecanismo de enrutamiento; se limita a listar los grupos de tensores y su precisión. La torre visual se conserva íntegra en BF16 (`model.visual.*`, 333 tensores, 851,8 MiB) junto con `model_config.json`, `preprocessor_config.json` y `video_preprocessor_config.json` del modelo fuente, y el runtime de FinchMoE la mapea solo durante la codificación de imágenes.

No hay información sobre el entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo único documentado del proceso es el repackaging: `FinchMoERepack` sobre un snapshot BF16 con `--routed-expert-bits 4 --include-vision`, ejecutado el 28 de octubre de 2026, con hash del snapshot fuente `sha256:41b9356101ebf8e7519e150dc811f80c4226e727301fbb032b890f006ed0be83`. La abliteración se realizó upstream en `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated`; este repositorio solo cambia el contenedor, la cuantización y añade el payload de visión. La innovación técnica destacable es, por tanto, el propio esquema de cuantización mixta por tipo de tensor y el formato out-of-core con pool de expertos direccionable por capa.

## Capacidades

- Generación de texto y razonamiento en el cuerpo de texto heredado del modelo base, según lo que soporte Qwen3.6-35B-A3B (no detallado en la card).
- Entrada imagen-texto: la torre visual permite procesar imágenes junto con texto en el runtime FinchMoE.
- Procesamiento de vídeo potencial: el repositorio incluye `video_preprocessor_config.json`, lo que indica que el preprocesador de vídeo del modelo fuente está presente; la card no confirma que el runtime lo explote.
- Descarga de comportamiento de rechazo (abliterated): el modelo no aplicará las negativas aprendidas en el alineamiento original.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (los idiomas no están declarados).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el diseño out-of-core mantiene 1,76 GiB residentes y sirve los expertos desde SSD, de modo que un portátil con 16-32 GB de memoria unificada puede ejecutar un MoE de ~35B sin swap del sistema operativo.
- Prototipado de asistentes multimodales en iOS: la app de FinchMoE acepta filas de modelo con visión, y esta es una de las pocas variantes del ecosistema que incluye la torre visual; útil para probar turnos con imagen en dispositivo.
- Experimentación sobre alineamiento y seguridad: al ser una variante abliterated, sirve para estudiar cómo se distribuyen las representaciones de rechazo y comparar respuestas frente al modelo base alineado, siempre en entornos controlados.
- Evaluación de cuantización extrema en MoE: permite medir la degradación de un esquema 4-bit con grupo 64 solo en expertos, dejando router y atención lineal a 8 bits, frente al checkpoint BF16 de referencia.
- Demostración de repackaging reproducible: el manifest con SHA-256 por fichero y el hash del snapshot fuente permiten verificar la cadena de procedencia en un pipeline de auditoría de modelos derivados.
- Generación de descripciones a partir de imágenes en local: clasificación y captioning de imágenes sin enviar datos a servicios externos, aprovechando que la torre visual solo se mapea durante la codificación.
- Procesamiento por lotes en un equipo de sobremesa: al no requerir los 20 GB en memoria de forma simultánea, se pueden encadenar peticiones largas manteniendo el pool de expertos en un NVMe rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que esta variante "no se ha medido por separado" y remite a la ficha del hermano de texto `haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated` para calidad y throughput de la ruta de texto. Tampoco se ofrecen cifras de latencia ni de tokens por segundo, ni el efecto medido de la cuantización 4-bit sobre MMLU, HumanEval, GSM8K u otras tareas. El único dato de coste es que la torre visual añade 851,8 MiB de pesos BF16 que se mapean únicamente al codificar una imagen.

## Requisitos de hardware

- Memoria: 1,76 GiB de pesos residentes en RAM/VRAM, más el mapeo bajo demanda de los expertos. El pool completo son 16,88 GiB, de modo que el requisito real depende de cuántos expertos mantenga en caché el runtime.
- Almacenamiento: imprescindible SSD NVMe; el rendimiento depende directamente de la latencia de lectura aleatoria de los ficheros `packed_experts/layer_XX.bin` (1,77 MB por experto, 40 ficheros de capa).
- Pico adicional: 851,8 MiB de BF16 para la torre visual durante turnos con imagen.
- GPU recomendadas: la card está orientada a Apple Silicon y a las apps Mac/iOS del motor FinchMoE; no se documentan rutas para A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? El formato no es compatible con CUDA de forma documentada; en Mac con memoria unificada el límite práctico lo marca la RAM total y la velocidad del SSD, no la VRAM.
- Opciones de despliegue: `FinchMoECLI` (CLI) y la app Mac/iOS de FinchMoE, que requiere una fila de modelo con visión para turnos con imagen (una fila solo-texto rechaza el directorio `vision/`). No es compatible con vLLM, llama.cpp, Ollama ni TGI: no es un checkpoint de Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este repositorio (`haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated-vision`) | ~35B totales / ~3B activos (según nombre) | No disponible | `.finch` | 4-bit expertos, 8-bit router y atención lineal, BF16 en visión | Sí (851,8 MiB BF16) | Apache 2.0 | 0 descargas, 0 likes; publicado el 2026-10-28 |
| `haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated` (hermano de texto) | Idénticos en la ruta de texto | No disponible | `.finch` | Misma receta sin visión | No | Apache 2.0 | Mismo autor; es la referencia de calidad y throughput según la card |
| `huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated` (base) | ~35B totales / ~3B activos (según nombre) | No disponible | Safetensors BF16 (snapshot fuente) | BF16 sin cuantizar | Sí, torre incluida en el checkpoint original | Apache 2.0 | Modelo upstream del que deriva este artefacto |
| Qwen3.6-35B-A3B original | ~35B totales / ~3B activos (según nombre) | No disponible | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Referenciado solo de forma implícita en la cadena de `base_model` |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación anterior es exclusivamente de formato, cuantización y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el comportamiento de rechazo del alineamiento original. No es apto para aplicaciones de cara al público sin una capa de moderación externa y sin una evaluación de seguridad propia.
- Sin métricas: no hay benchmarks de esta variante ni datos publicados de perplejidad o degradación por la cuantización 4-bit. Cualquier afirmación de calidad es una extrapolación.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo estándar en modelos de esta familia y se agrava con cuantizaciones agresivas.
- Contexto e idiomas sin declarar: se desconoce la ventana máxima y la cobertura lingüística, lo que impide planificar cargas con documentos largos o requisitos multilingües.
- Lock-in de formato: `.finch` solo lo consume el motor FinchMoE y sus apps. No se puede cargar con `transformers`, vLLM, llama.cpp, Ollama ni TGI, lo que descarta su uso en infraestructura de servido convencional.
- Dependencia del almacenamiento: el rendimiento en producción queda atado a la latencia del SSD; en discos lentos o con contenedores de red el throughput puede degradarse de forma severa.
- Riesgo de deriva silenciosa en visión: una fila de modelo solo-texto rechaza el directorio `vision/` en lugar de ignorarlo, pero fuera de la app no hay validación de que el runtime esté usando la torre correctamente.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una obra derivada conviene revisar los términos del modelo upstream y el fichero `LICENSE` del repositorio antes de redistribution.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación de la comunidad ni informe de errores públicos.
- Ausencia de `verified-install.json`: la card explica que se omite a propósito porque el recibo registra la ruta física de instalación; el instalador genera el suyo tras verificar cada fichero contra el manifest, pero conviene comprobar el SHA-256 del manifest (`09ba6af4d1a9aee4d2b6d054fbbb57f974ae8b400449ed986b1a828fe91cec62`) antes de confiar en la instalación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated-vision
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Hermano de texto 4-bit (referencia de calidad y throughput): https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated
- Motor FinchMoE: https://github.com/haihengh/finchMoE
- Licencia del repositorio: https://huggingface.co/haihengh/Qwen3.6-35B-A3B-finchmoe-4bit-abliterated-vision/blob/main/LICENSE
