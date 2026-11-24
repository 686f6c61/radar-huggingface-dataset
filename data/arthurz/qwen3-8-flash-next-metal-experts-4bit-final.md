# ArthurZ/Qwen3.8-Flash-Next-metal-experts-4bit-final

## Resumen

Qwen3.8-Flash-Next-metal-experts-4bit-final es un checkpoint derivado del modelo multimodal Qwen3.8-Flash-Next, publicado por el desarrollador ArthurZ en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una reempaquetado técnico: los pesos de las capas densas (`nn.Linear` siempre activas) se almacenan ya cuantizados en formato Metal affine 4-bit con grupo de 32 y búsqueda de recorte por grupo, de modo que la carga no realiza ninguna cuantización en tiempo de ejecución. Los bancos de expertos y la tabla n-gram permanecen idénticos al checkpoint padre.

El modelo conserva la arquitectura del Qwen3.8-Flash-Next original (no disponible en detalle en la información proporcionada), con un total de 72.504.723.859 parámetros según los safetensors reales y un pipeline declarado de `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto. La motivación principal del autor es de eficiencia en hardware Apple Silicon: el checkpoint padre almacena unos 10,2 GiB de pesos densos en bf16 y los cuantiza en cada carga, lo que en un Mac de 32 GB provoca picos cercanos al límite del working set de Metal (el `lm_head` por sí solo puede llevar el proceso a 24-26 GB). Con este checkpoint el modelo ocupa aproximadamente 3,5 GiB de memoria MPS tras la carga.

Es relevante para desarrolladores que quieran ejecutar un modelo multimodal de gran tamaño en equipos con memoria unificada limitada (clase 32 GB) sin pagar el coste de cuantización en cada arranque. La licencia es `qwen-community-1.0` (etiquetada como `other`), y el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto muy reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 72.504.723.859 |
| Parametros activos | no disponible (no se confirma que sea MoE, aunque el nombre y la estructura de "expert banks" lo sugieren) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Metal affine 4-bit, grupo 32, con búsqueda de recorte por grupo (`4g32c`) para capas densas; bancos de expertos sin cambios respecto al padre |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other`) |
| Formato de pesos | safetensors (repo de 125,7 GB, 52 archivos reescritos respecto al padre) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-Flash-Next (número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento, tokens vistos o si hubo RLHF/DPO). El nombre del checkpoint y la model card mencionan "expert banks" y una "n-gram table", lo que sugiere una arquitectura con mezcla de expertos y algún mecanismo de decodificación especulativa o predicción n-gram, pero no se confirma en la información proporcionada.

La innovación técnica documentada es exclusivamente de empaquetado y despliegue: el script `make_final_qwen38_checkpoint.py` reescribe los 52 archivos que contenían capas densas en bf16 para almacenarlas pre-cuantizadas en Metal affine 4-bit (grupo 32, con búsqueda de recorte por grupo), fusionando 192 grupos hermanos. Los archivos de expertos y de la tabla n-gram son byte a byte idénticos al checkpoint padre. El resultado es que la carga no ejecuta ninguna llamada de cuantización en tiempo de ejecución (`on-the-fly quantization calls: 0`), lo que reduce el pico de memoria del proceso. En la medición del autor sobre un M3 Ultra (512 GB) con el asignador Metal limitado a un working set de 24,96 GiB (clase 32 GB), el checkpoint padre sin chunking alcanzaba 24,35 GiB de footprint de proceso (el que choca con el muro de 32 GB), mientras que este checkpoint se queda en 13,82 GiB con 0 llamadas de cuantización y una corrección verificada de 128/128 entre modo compilado y eager.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Entrada multimodal imagen-texto (`image-text-to-text`), lo que implica comprensión de imágenes combinada con texto.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes, matemáticas, código ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.
- Capacidad especial: checkpoint optimizado para inferencia en Apple Silicon (Metal/MPS) con cuantización 4-bit pre-aplicada en capas densas.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el caso de uso central del checkpoint es ejecutar un modelo de ~72,5 mil millones de parámetros en un equipo con working set de clase 32 GB (por ejemplo, M3 Ultra con el asignador Metal limitado a 24,96 GiB), aprovechando que la carga no cuantiza en caliente y el modelo ocupa ~3,5 GiB de MPS tras cargar.
- Prototipado de aplicaciones multimodales en portátiles o estaciones Apple: al no requerir GPUs dedicadas de datacenter, permite iterar sobre pipelines image-text-to-text en hardware de sobremesa.
- Evaluación y benchmarking de estrategias de offloading de expertos: el checkpoint se acompaña del benchmark `stream-experts` y scripts como `run_qwen38_metal_final.sh`, útiles para investigadores que estudien caché de expertos, lecturas no cacheadas y streaming de `embed_tokens`.
- Verificación de reproducibilidad numérica: el autor reporta igualdad compilado vs eager 128/128, lo que sirve como caso de prueba para pipelines de validación de cuantización.
- Despliegue en entornos con restricciones de memoria y sin aceleradores NVIDIA: el formato Metal affine 4-bit está pensado para MPS, por lo que encaja en flujos de trabajo exclusivamente Apple.
- Base para experimentos de cuantización comparada: al mantener intactos los bancos de expertos y la tabla n-gram, permite aislar el efecto de la cuantización de capas densas frente al checkpoint padre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de memoria y corrección en carga:

| Ejecucion | Llamadas de cuantizacion on-the-fly | Pico de footprint del proceso | Pico del driver MPS | Correccion |
|---|---:|---:|---:|---|
| Checkpoint padre + cuantizacion por chunks | 1480 | 13,81 GiB | 12,70 GiB | n/a |
| Checkpoint padre sin chunking | 1450 | 24,35 GiB | 11,79 GiB | n/a |
| Este checkpoint | 0 | 13,82 GiB | 10,81 GiB | compilado == eager 128/128 |

Medido en M3 Ultra (512 GB) con working set Metal limitado a 24,96 GiB, transformers `stream-experts @ e6e0218`, torch 2.15.0, kernels 0.18.3 y caché de expertos de 6 GiB.

## Requisitos de hardware

- VRAM/MPS estimada: ~3,5 GiB de memoria MPS tras la carga según el autor; footprint de proceso medido de 13,82 GiB en el escenario de prueba.
- Hardware de referencia: Apple M3 Ultra (512 GB) con el asignador Metal limitado a un working set de clase 32 GB (24,96 GiB).
- El checkpoint padre sin chunking alcanza 24,35 GiB de footprint, por lo que roza el límite en máquinas de 32 GB; este checkpoint evita ese camino.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta compatibilidad ni rendimiento; el formato Metal affine 4-bit está orientado a MPS.
- Cabe en consumer hardware Apple con memoria unificada de clase 32 GB o superior, según las mediciones del autor.
- Opciones de despliegue: transformers con la rama `stream-experts` del repositorio de Hugging Face (`benchmark_v2/experts_offload`), script `run_qwen38_metal_final.sh` con workarounds para 32 GB (lecturas de expertos no cacheadas, `embed_tokens` en streaming, `affine_qmm_t` por tiles, eventos MPS desactivados) y variable `REQUIRE_NO_QUANT=1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (multimodales de ~72,5 mil millones de parámetros con empaquetado 4-bit para Metal) ni de datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint derivado y no validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de calidad.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de seguridad.
- Idiomas soportados no disponibles; no se puede garantizar comportamiento multilingüe.
- Longitud de contexto no disponible; no apto para planificación de producción sin verificación previa.
- Licencia `qwen-community-1.0` (etiquetada como `other`): es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial; no se detallan restricciones en la información proporcionada.
- Orientado a Apple Silicon/MPS: el formato Metal affine 4-bit limita su uso en GPUs NVIDIA u otros aceleradores.
- Requiere una rama específica de transformers (`stream-experts`) y scripts de workaround; no es un checkpoint plug-and-play con la instalación estándar.
- El repo ocupa 125,7 GB, lo que implica requisitos de almacenamiento considerables.
- El autor advierte de que el checkpoint padre sin chunking agota el working set de 32 GB; usar este checkpoint sin los scripts indicados puede reproducir ese problema.

## Enlaces

- Hugging Face: https://huggingface.co/ArthurZ/Qwen3.8-Flash-Next-metal-experts-4bit-final
- Checkpoint padre: https://huggingface.co/ArthurZ/Qwen3.8-Flash-Next-metal-experts-4bit
- Repositorio de transformers con la rama de benchmark: https://github.com/huggingface/transformers (rama `stream-experts`, directorio `benchmark_v2/experts_offload`)
- Script de ejecución: `run_qwen38_metal_final.sh` (incluido en el repositorio del modelo)
- Script de empaquetado: `make_final_qwen38_checkpoint.py` (mencionado en la model card)
