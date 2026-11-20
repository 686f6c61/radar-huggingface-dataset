# hiroshiya/GLM-5.3-Flash-HYPERFLARE-GB10-TP2

## Resumen

GLM-5.3-Flash-HYPERFLARE-GB10-TP2 es un paquete de runtime preparado por el usuario hiroshiya para servir el checkpoint GLM-5.3-Flash (en su variante FP4 publicada por NVIDIA como `nvidia/GLM-5.3-Flash-FP4-Local`) mediante Hyperflare, el motor de inferencia de NVIDIA escrito en Rust. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: pesos ya cuantizados a NVFP4 empaquetados junto con la configuración necesaria para ejecutarlos en un clúster de dos DGX Spark (GB10, arquitectura SM121) con paralelismo tensorial de grado 2.

El paquete está pensado para escenarios de contexto muy largo y multimodalidad entrada imagen-texto-salida texto, con una ventana de 1.048.576 tokens y una caché KV de aproximadamente 4,5 millones de tokens. Incluye decodificación especulativa basada en MTP (multi-token prediction) con anchos de 1 a 6 tokens y un límite de concurrencia de 4 peticiones sobre 2 rangos.

Su relevancia actual es práctica: elimina la necesidad de usar Docker, vLLM o configuraciones extensas de variables de entorno para poner en marcha un modelo de gran tamaño en hardware de escritorio de NVIDIA, a cambio de fijar de antemano propiedades como el tamaño de chunk de prefill (4.096 tokens), la concurrencia y el número de tokens especulativos. El repositorio ocupa 179,9 GB y la licencia es el NVIDIA Open Model Agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-5.3-Flash); runtime Hyperflare sobre sm_121 (GB10) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | FP4 / NVFP4 (checkpoint base ya cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (etiquetada como `other` en Hugging Face) |
| Formato de pesos | paquete de runtime Hyperflare exportado con `ignition` (no safetensors ni GGUF estándar) |
| Vocabulario | 154.880 tokens |
| Chunk de prefill | 4.096 tokens |
| Concurrencia | 4 peticiones, 2 rangos |
| Caché KV | ~4,5 millones de tokens (paged latent) |
| Decodificacion especulativa | MTP, anchos 1-6 (fijado a 5 tokens de draft en la exportacion) |
| Paralelismo | tensor parallel = 2 (TP=4 no soportado en este paquete) |
| Tamano del repositorio | 179,9 GB |
| Hardware objetivo | 2x DGX Spark (GB10 / SM121) con ConnectX-7 |
| Driver requerido | NVIDIA R580 o superior |

## Arquitectura y entrenamiento

El modelo subyacente es GLM-5.3-Flash, publicado por NVIDIA en formato FP4 local. La información disponible no detalla la arquitectura interna (número de capas, dimensión oculta, si emplea mezcla de expertos o atención lineal), por lo que esos datos deben consultarse en la model card del checkpoint original `nvidia/GLM-5.3-Flash-FP4-Local`. Lo que sí especifica este paquete es el pipeline multimodal `image-text-to-text`, lo que confirma que el modelo acepta imágenes además de texto.

El componente diferencial de este repositorio es el runtime Hyperflare, escrito en Rust y compilado con `cargo build --release`. Hyperflare ejecuta el paralelismo entre nodos directamente sobre RoCE a través de ConnectX-7, sin requerir CUDA runtime ni NCCL para servir. El paquete se generó exportando el checkpoint con la herramienta `ignition` en el commit `1a53275` de `hyperflare-inference`, lo que congela parámetros como el chunk de prefill, la concurrencia y el ancho de especulación. La caché mantiene estado de continuación y latentes paginados. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto e inferencia multimodal entrada imagen-texto con salida de texto.
- Procesamiento de contexto muy largo: hasta 1.048.576 tokens por petición, con caché KV agregada de ~4,5 millones de tokens.
- Decodificación especulativa MTP con hasta 5 tokens de borrador por paso, orientada a reducir la latencia de generación.
- Servicio concurrente de hasta 4 peticiones simultáneas sobre 2 rangos.
- Ejecución distribuida entre dos nodos DGX Spark mediante tensor parallel de grado 2 sobre RoCE.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, audio u otras capacidades específicas del modelo base.

## Casos de uso

- Análisis de documentos extensos: con 1.048.576 tokens de contexto, el modelo puede ingerir informes completos, expedientes o libros técnicos en una sola petición sin troceado, manteniendo coherencia entre secciones distantes.
- Procesamiento de imágenes con contexto textual largo: al ser image-text-to-text, permite adjuntar diagramas, capturas o figuras junto a manuales extensos y formular preguntas sobre la relación entre ambos.
- Despliegue en laboratorio con hardware de sobremesa: dos DGX Spark conectadas por ConnectX-7 forman un nodo de inferencia FP4 sin necesidad de A100/H100, útil para equipos de investigación con presupuesto limitado.
- Reproducción de investigaciones sobre cuantización FP4: el paquete permite medir el comportamiento real de NVFP4 en SM121 con cargas de trabajo controladas y comparar contra otras configuraciones.
- Evaluación de decodificación especulativa: al fijar MTP con 5 tokens de borrador, sirve para estudiar el impacto de la especulación en throughput y tasa de aceptación en un entorno de dos nodos.
- Servicio de asistencia técnica con contexto acumulado: la caché de continuación y los latentes paginados permiten mantener conversaciones multi-turno largas sin recalcular el prefijo en cada petición.
- Prototipado de pipelines multimodales en Rust: al no depender de Docker ni de vLLM, encaja en entornos donde se prefiere un binario único de 26 MiB y control directo del proceso.

## Benchmarks y rendimiento

La model card remite a un archivo `BENCH.md` con resultados de `llama-benchy` generados en una configuración de doble Asus GX10, pero los valores numéricos no están incluidos en la información proporcionada. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dos DGX Spark (FE o variantes) conectadas mediante cable QSFP-56 para aprovechar ConnectX-7 a 200 GbE, con RoCE configurado correctamente.
- Driver NVIDIA R580 o superior en ambos nodos.
- Al menos ~185 GiB de almacenamiento libre: ~181 GiB para el paquete y ~10 GiB para compilar Hyperflare (el binario final ocupa ~26 MiB y los artefactos de compilación ~9,5 GiB, que pueden borrarse).
- Toolchain de Rust reciente (`rustc` y `cargo`) y dependencias de compilación: `build-essential`, `cmake`, `ninja-build`, `pkg-config`, `protobuf-compiler`, `libssl-dev`, `python3-dev`, `liburing-dev`, `libibverbs-dev`.
- No requiere CUDA runtime ni NCCL para servir; el paralelismo entre nodos corre sobre RoCE.
- Tensor parallel fijado a 2; TP=4 exige exportar un paquete propio con `ignition`.
- No cabe en una GPU de consumo convencional (RTX 4090, etc.): el diseño está atado a GB10 y a un clúster de dos nodos.
- Despliegue mediante el binario `flare` de Hyperflare; no se contempla vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles en la información proporcionada (remite a `BENCH.md`, no incluido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| GLM-5.3-Flash-HYPERFLARE-GB10-TP2 | no disponible | 1.048.576 | NVFP4 | nvidia-open-model-agreement | 2x DGX Spark (GB10) |
| nvidia/GLM-5.3-Flash-FP4-Local | no disponible | no disponible | FP4 | nvidia-open-model-agreement | no disponible (checkpoint original, no servible directamente con `flare`) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El paquete no es un modelo entrenado por el autor: es un artefacto de despliegue derivado de `nvidia/GLM-5.3-Flash-FP4-Local`; los méritos y defectos del modelo subyacente se heredan íntegramente.
- Las propiedades del runtime están congeladas en la exportación: no se pueden modificar concurrencia, chunk de prefill ni tokens de draft sin reexportar con `ignition`.
- Solo soporta tensor parallel de grado 2; TP=4 requiere generar un paquete propio.
- Requiere hardware muy específico (2x DGX Spark con ConnectX-7 y RoCE configurado); no es desplegable en GPUs convencionales ni en la nube sin ese perfil.
- Hiperparámetros de generación limitados: el ancho de especulación se fijó a 5 tokens, aunque el runtime declare soporte de 1 a 6.
- La licencia NVIDIA Open Model Agreement impone condiciones específicas para uso comercial; debe revisarse antes de cualquier despliegue productivo.
- No se dispone de información sobre idiomas soportados, sesgos, tasa de alucinación ni evaluación de seguridad del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- Dependencia de un commit concreto de Hyperflare (`1a53275`) cuya documentación el propio autor califica de confusa y generada por IA; cambios posteriores podrían romper la reproducibilidad.
- El proceso de compilación exige toolchain de Rust y bibliotecas de sistema en ambos nodos, lo que añade fricción operativa frente a soluciones empaquetadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hiroshiya/GLM-5.3-Flash-HYPERFLARE-GB10-TP2
- Checkpoint base: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Hyperflare (motor de inferencia): https://github.com/NVIDIA/hyperflare-inference
- Documentación de Hyperflare CLI: https://github.com/NVIDIA/hyperflare-inference/blob/main/docs/cli-design.md
- Guía de conexión de múltiples DGX Spark: https://build.nvidia.com/spark/connect-multiple-sparks/overview
- Herramienta de benchmarks llama-benchy: https://github.com/eugr/llama-benchy
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
