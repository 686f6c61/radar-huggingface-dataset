# haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated-vision

## Resumen

Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated-vision es un artefacto de despliegue derivado del checkpoint Qwen3.8-Flash-Next-125B, empaquetado en el formato propietario `.finch` del motor de inferencia out-of-core FinchMoE. Lo publica el usuario haihengh, autor del propio motor, y no constituye un checkpoint compatible con Transformers: es un contenedor con pesos residentes, expertos enrutados cuantizados a 4 bits y una torre de visión copiada byte a byte del modelo de origen. El modelo base declarado es la variante abliterated de windowsxp811203, de modo que el artefacto hereda tanto la arquitectura MoE del Qwen original como la intervención de abliteration aplicada aguas arriba.

El interés técnico del repositorio no reside en un nuevo entrenamiento, sino en la ingeniería de empaquetado: 512 expertos por capa en 48 capas, con un pool de expertos de 63,38 GiB y solo 3,88 GB de pesos residentes, lo que permite ejecutar un modelo de 125B en hardware con memoria unificada limitada mediante carga bajo demanda desde disco. La inclusión de la torre de visión (856,3 MiB en BF16, 333 tensores) habilita la pipeline image-text-to-text dentro del runtime FinchMoE para Mac e iOS.

Es relevante ahora porque demuestra una vía práctica de servir modelos MoE grandes en equipos de consumo Apple Silicon, a costa de depender de un motor y un formato no estándar. La ficha debe leerse con cautela: el autor no publica métricas propias de calidad para esta variante, y remite a la ficha de su hermano solo-texto para los datos medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal y router (derivada de Qwen3.8-Flash-Next); expertos enrutados 512 por capa x 48 capas |
| Parametros totales | 125B (según nombre del modelo; no se detalla desglose oficial en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Routed experts 4-bit affine (group 64, escalas y sesgos BF16); atención y expertos compartidos 4-bit; atención lineal y router 8-bit; tabla PLE int4 group 32; torre de visión BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiqueta `license: other`; obra derivada del modelo base) |
| Formato de pesos | Finch `.finch` (manifest.json + model_weights.bin + packed_experts/layer_XX.bin + tokenizer/ + vision/vision.safetensors); no es safetensors ni GGUF estándar |
| Tamano del repositorio | 104.900.675.753 bytes (97,70 GiB) |
| Pesos residentes | 3.877.265.688 bytes |
| Pool de expertos | 68.048.388.096 bytes (63,38 GiB), stride 2.768.896 bytes por experto |
| Payload de visión | 897.904.664 bytes (856,3 MiB), 333 tensores BF16 |
| Tokenizer | 22.916.963 bytes |
| Libreria de ejecucion | finchmoe (FinchMoE CLI y apps Mac/iOS) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos: 48 capas con 512 expertos enrutados cada una, complementados por expertos compartidos y por mecanismos de atención lineal además de la atención estándar. El repositorio no entrena nada; aplica una receta de cuantización mixta sobre el snapshot BF16 de `windowsxp811203/Qwen3.8-Flash-Next-Abliterated`: expertos enrutados a 4 bits con grupos de 64 y escalas en BF16, atención y expertos compartidos a 4 bits, atención lineal y router a 8 bits, y la tabla PLE a int4 con grupo 32. La abliteration, es decir, la supresión de la dirección de rechazo en el espacio de activaciones, se realizó aguas arriba y este artefacto solo cambia el contenedor, la cuantización y añade el payload visual.

La innovación destacable es el diseño out-of-core de FinchMoE: los expertos enrutados se almacenan en ficheros por capa y se mapean bajo demanda, de forma que solo los pesos residentes (3,88 GB) y los expertos activados en cada token ocupan memoria en un momento dado. La torre de visión se mapea únicamente mientras se codifica una imagen. El empaquetado se generó con `FinchMoERepack` el 2026-10-28, con `--routed-expert-bits 4 --include-vision`, y el manifiesto registra el hash SHA-256 del snapshot de origen (`99e81524...c590de`). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del checkpoint Qwen3.8-Flash-Next-125B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): la torre visual permite turnos con imagen en las apps Mac/iOS de FinchMoE.
- Capacidad de código y matemáticas presumible en la familia Qwen, aunque no se aportan evaluaciones específicas en la información disponible.
- Soporte de tool calling y function calling: no disponible en la documentación del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Modo thinking explícito: no disponible.
- Ejecución out-of-core con cuantización mixta 4/8 bits, que reduce el requisito de memoria respecto al BF16 de origen.
- Variante abliterated: menor tendencia a rechazar peticiones, con las implicaciones éticas y de seguridad que ello conlleva.

## Casos de uso

- Inferencia local de un MoE de 125B en Mac Apple Silicon: el motor FinchMoE carga los expertos desde disco bajo demanda, de modo que un equipo con memoria unificada de 64-128 GB puede servir el modelo sin mantener los 63,38 GiB del pool de expertos residentes en RAM.
- Asistente multimodal en escritorio: la torre de visión permite adjuntar capturas de pantalla o fotografías en conversaciones; útil para soporte técnico guiado por imágenes o para extraer información de documentos escaneados.
- Prototipado de investigación sobre abliteration: al conservar la intervención de supresión de rechazo, sirve para estudiar el comportamiento del modelo en dominios sensibles y comparar con la variante no abliterated.
- Evaluación comparativa de cuantización: la receta mixta (4 bits en expertos, 8 bits en router y atención lineal, int4 en PLE) permite medir la degradación frente al snapshot BF16 en tareas de razonamiento y generación.
- Despliegue en pipelines de procesamiento por lotes: la CLI `FinchMoECLI` acepta un fichero de mensajes y un límite de tokens nuevos, lo que facilita ejecuciones desatendidas sobre volúmenes grandes de prompts.
- Desarrollo de aplicaciones iOS con capacidades de visión: el runtime FinchMoE para iOS consume el directorio `vision/`, habilitando asistentes on-device que combinan texto e imagen sin conexión a servicios externos.
- Estudio de formatos alternativos de pesos: como artefacto de referencia para quienes diseñan motores de inferencia con mapeo de expertos por capa y verificación criptográfica de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta variante no se ha medido por separado y remite a la ficha del modelo hermano solo-texto `haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated` para los datos de calidad y throughput de la ruta de texto. Tampoco se aportan cifras de latencia ni de tokens por segundo.

## Requisitos de hardware

- VRAM o memoria unificada: los pesos residentes ocupan 3,88 GB y el pool de expertos 63,38 GiB; el motor out-of-core solo mantiene en memoria los expertos activados, por lo que el requisito real depende de la política de caché y del número de expertos por token, dato no disponible.
- Almacenamiento: se necesitan al menos 97,70 GiB libres para el directorio `.finch` completo; se recomienda SSD NVMe o almacenamiento interno rápido, dado el acceso aleatorio a los ficheros de expertos por capa.
- GPU recomendadas: no se documentan. El runtime objetivo son equipos Apple Silicon (Mac e iOS) con memoria unificada; no hay soporte declarado para CUDA, A100, H100 ni RTX 4090 en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA consumer; el diseño está orientado a Mac con memoria unificada y almacenamiento rápido, no a VRAM discreta.
- Opciones de despliegue: `FinchMoECLI` y las apps Mac/iOS de FinchMoE. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.finch` no es estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Qwen3.8-Flash-Next-125B finchmoe 4-bit + vision) | 125B (MoE) | no disponible | Finch `.finch` | qwen-community-license-1.0 | Out-of-core, visión incluida, abliterated, sin benchmarks propios |
| haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated | 125B (MoE) | no disponible | Finch `.finch` | qwen-community-license-1.0 | Mismo texto, sin payload de visión; referencia de calidad y throughput según el autor |
| windowsxp811203/Qwen3.8-Flash-Next-Abliterated | 125B (MoE) | no disponible | no disponible (snapshot BF16 de origen) | no disponible | Modelo base upstream; mayor huella de memoria al no estar cuantizado |
| Qwen3.8-Flash-Next-125B (original) | 125B (MoE) | no disponible | safetensors (presumible) | qwen-community-license-1.0 | Sin abliteration; requiere motor estándar y mucha más memoria |

## Limitaciones y advertencias

- Formato no estándar: `.finch` solo lo consume FinchMoE; no es cargable con Transformers, vLLM, llama.cpp ni Ollama, lo que limita la portabilidad y ata el despliegue a un motor mantenido por un único autor.
- Sin métricas propias: no hay benchmarks de esta variante; la calidad del texto debe inferirse de la ficha del hermano solo-texto y la visión no está evaluada.
- Abliteration: la supresión de la dirección de rechazo puede aumentar la probabilidad de respuestas dañinas, sesgadas o fuera de política, y complica el cumplimiento en entornos regulados.
- Sesgos: no documentados en la información disponible; se heredan los del checkpoint Qwen de origen y los del proceso de abliteration.
- Alucinación: riesgo inherente a los modelos generativos; sin evaluaciones publicadas no puede acotarse su magnitud en esta cuantización.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- Licencia: qwen-community-license-1.0 con etiqueta `other`; es una obra derivada y el uso comercial queda sujeto a los términos del modelo upstream, que deben revisarse antes de producción.
- Dependencia de almacenamiento: el rendimiento depende críticamente de la velocidad de acceso aleatorio a los ficheros de expertos; discos lentos degradarán la latencia de forma severa.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicación reciente y sin validación comunitaria; tratar como artefacto experimental.
- Integración en apps: hasta que el repositorio se añada al selector de la aplicación, hay que usar la CLI o apuntar la app directamente al directorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated-vision
- Modelo base (abliterated): https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated
- Hermano solo-texto con métricas: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated
- Motor FinchMoE: https://github.com/haihengh/finchMoE
- Licencia: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finchmoe-4bit-ple4bit-abliterated-vision/blob/main/LICENSE
