# Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision

## Resumen

Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision es un paquete de ejecución preparado para el motor Hyperflare (Flare), no un modelo en el sentido convencional. Lo publica el usuario Jon-Nielsen a partir del modelo base thinkingmachines/Inkling-2-Small (Apache-2.0), un Mixture-of-Experts con cabeza de borrador MTP propia (DSpark), y del artefacto cuantizado local-inference-lab/Inkling-2-Small-NVFP4-CSF. El paquete incluye pesos por rango, kernels compilados, grafos de ejecución y metadatos de despliegue generados con FLARE Ignition para cuatro GPU NVIDIA SM120 de 96 GB cada una.

El interés práctico está en la configuración horneada: 1.048.576 tokens de contexto por petición, concurrencia de 8 peticiones activas, decodificación especulativa con anchura de borrador 7, soporte de tool calling mediante parser JSON TML, modo de razonamiento con cabeceras de contenido y entradas de imagen habilitadas. Es una pieza de infraestructura para servir un modelo grande en un nodo de cuatro GPU Blackwell con un presupuesto de VRAM muy ajustado.

Conviene subrayar que Transformers, vLLM, SGLang y llama.cpp no pueden cargar este formato. El paquete solo se sirve con el ejecutable Flare incluido y está firmado con una clave Ed25519 de desarrollo. El repositorio ocupa 350,6 GB y no registra descargas, lo que lo sitúa como artefacto experimental más que como distribución de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (modelo base) con cabeza de borrador MTP (DSpark); paquete de runtime Flare con kernels y grafos compilados |
| Parametros totales | 48.895.094 (dato del safetensors de metadatos primario; no refleja el total del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por petición |
| Tipos de cuantizacion | NVFP4 en expertos enrutados con escalas de bloque comprimidas CSF; FFN de la cabeza de borrador MTP en MXFP8; proyecciones de atención, embeddings y LM head en BF16; caché KV en FP8 |
| Idiomas soportados | no disponible |
| Licencia | LIL License 1.0 (incorpora Apache-2.0); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (metadatos primarios de 48,9 MB) más shards por rango `weights/tp4/rank-0…3/` con kernels y grafos compilados (≈311 GiB); formato propietario de Flare, no cargable por Transformers, vLLM, SGLang ni llama.cpp |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de thinkingmachines con una cabeza de borrador MTP propia, denominada DSpark, que se emplea para decodificación especulativa de anchura 7. El paquete no entrena nada: reexporta pesos ya cuantizados por Local Inference Lab en un formato mixto. Los expertos enrutados van en NVFP4 con escalas de bloque comprimidas mediante CSF; las matrices FFN de la cabeza de borrador MTP se mantienen en MXFP8; las proyecciones de atención, los embeddings y el LM head quedan en BF16; la caché KV se almacena en FP8. Según el autor, mantener el borrador MTP-7 en MXFP8 en lugar de BF16 es lo que permite encajar contexto de 1.048.576 tokens, concurrencia 8 y borrador de anchura 7 en el presupuesto de 4 × 96 GB (≈85,7 GiB de pesos y ≈8,7 GiB de caché por GPU).

La cadena de procedencia es verificable: motor construido desde NVIDIA/hyperflare-inference en el commit `5a4e8679` (linaje v0.2.1) con `cargo build --release` (Rust 1.94.1, Ubuntu 24.04, driver 615.71, CUDA 13.2), más un parche `patches/0001` que extiende `load_fp4_experts` para decodificar planos de escala CSF. La exportación se hizo con FLARE Ignition, receta `inkling2`, sobre 4 × RTX PRO 6000 Blackwell (2 Max-Q y 2 WS) con torch 2.14.1+cu132; el parche `patches/0002` solo es necesario para reexportar en hosts que mezclan SKU Workstation y Max-Q, no para servir el paquete. La firma se realizó con `ignition combine` y una clave Ed25519 de desarrollo.

## Capacidades

- Generación de texto con ventana de contexto de 1.048.576 tokens por petición.
- Razonamiento con modo thinking, activado mediante el parser de cabeceras de contenido `<|content_thinking|>`.
- Tool calling y function calling mediante el parser JSON TML incluido en el frontend.
- Entradas de imagen habilitadas (vision) en el frontend del paquete.
- Decodificación especulativa con la cabeza MTP propia del modelo, anchura de borrador 7.
- Servicio concurrente de hasta 8 peticiones activas sobre 4 rangos de tensor parallelism.
- Vocabulario de 200.058 tokens en el frontend.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de contexto masivo en un solo nodo: con 1.048.576 tokens por petición, el paquete permite analizar repositorios completos, expedientes documentales extensos o transcripciones largas sin trocear, usando una única secuencia de ancho completo que deja ≈713K tokens disponibles en el pool KV para el resto de peticiones.
- Agentes con tool calling en producción: el parser JSON TML del frontend convierte las llamadas a herramientas en salidas estructuradas, lo que permite encadenar pasos de razonamiento con invocaciones a APIs externas dentro de un mismo flujo servido por Flare.
- Procesamiento de documentos con imagen: al estar habilitadas las entradas de imagen, el paquete puede recibir páginas escaneadas o capturas junto con texto, útil para extracción de datos en pipelines documentales.
- Razonamiento asistido con modo thinking: el parser de cabeceras `<|content_thinking|>` separa el contenido de razonamiento de la respuesta final, lo que facilita auditar la traza interna en tareas de análisis o verificación.
- Evaluación de cuantización NVFP4/CSF en hardware Blackwell: el paquete sirve como referencia reproducible para medir la calidad de la conversión mixta (expertos en NVFP4, borrador en MXFP8, atención en BF16) frente al modelo base.
- Despliegue en infraestructura de cuatro GPU SM120: pensado para nodos con RTX PRO 6000 Blackwell de 96 GB, encaja en entornos on-premise donde no se dispone de clústeres H100 y se quiere maximizar contexto por nodo.
- Reproducción de la cadena de exportación: los parches incluidos y los comandos documentados permiten reconstruir el paquete desde el artefacto CSF de origen con una clave de firma propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Objetivo declarado: 4 GPU NVIDIA SM120 (clase RTX PRO 6000 Blackwell) con 96 GB de VRAM cada una.
- Presupuesto por GPU según el autor: ≈85,7 GiB de pesos y ≈8,7 GiB de caché KV.
- Pool KV total: 34,6 GiB ≈ 1.761.280 tokens repartidos entre los 4 rangos; páginas de 32.768 bytes con un máximo de 155.731 unidades por rango.
- Tensor parallelism 4 (shards `weights/tp4/rank-0…3/`); no se contempla ejecución en una sola GPU.
- No cabe en GPU de consumo: el paquete requiere 4 × 96 GB y kernels compilados para SM120.
- Despliegue exclusivamente mediante el ejecutable `runner/flare-linux-x86_64` incluido, o su imagen Docker `runner/Dockerfile`; Transformers, vLLM, SGLang y llama.cpp no pueden cargarlo.
- Verificación de firma posible sin GPU mediante `flare inspect model.safetensors` con `--publisher-keys` apuntando a `publisher.json`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision | no disponible (base MoE sin cifra publicada) | 1.048.576 | Runtime Flare propietario | LIL License 1.0 | Solo Flare, 4 × SM120 96 GB |
| thinkingmachines/Inkling-2-Small (base) | no disponible | no disponible | safetensors estándar | Apache-2.0 | Transformers, vLLM, SGLang, llama.cpp |
| local-inference-lab/Inkling-2-Small-NVFP4-CSF | no disponible | no disponible | Pesos cuantizados NVFP4/CSF | LIL License 1.0 | Motores compatibles con NVFP4 |
| Alternativas de otro fabricante con contexto de 1M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete no es portable: solo se ejecuta con el binario Flare incluido y kernels compilados para SM120; no hay soporte en Transformers, vLLM, SGLang ni llama.cpp.
- La licencia LIL License 1.0 es distinta de la Apache-2.0 del modelo base; conviene revisar `LICENSE` y `LICENSES/` antes de cualquier uso comercial, ya que las condiciones de redistribución y servicio no están resumidas en la información disponible.
- La firma se hizo con una clave Ed25519 de desarrollo, no con una clave de publicación estable; la confianza en el artefacto depende de verificar `publisher.json` y `SHA256SUMS` por canales independientes.
- Los 48.895.094 parámetros del safetensors primario corresponden a metadatos de despliegue, no al tamaño real del modelo; no deben citarse como tamaño del modelo.
- El contexto y la concurrencia comparten un único pool KV de 34,6 GiB: 8 peticiones simultáneas de 1M tokens no caben a la vez (media ≈220K tokens por secuencia con los 8 slots activos); el planificador encola, no amplía el pool.
- El parche `patches/0001` aún no está fusionado en NVIDIA/hyperflare-inference; hasta su integración, la copia incluida es la autoritativa para reproducir la exportación.
- El repositorio registra 0 descargas y 1 like, con creación y actualización el mismo día (16 de noviembre de 2026): no hay evidencia de uso en producción ni validación comunitaria.
- No se han publicado datos de benchmarks, idiomas soportados, sesgos ni tasas de alucinación; cualquier decisión de producción debería basarse en una evaluación propia sobre el hardware objetivo.
- El tamaño del repo (350,6 GB, 230 archivos) implica costes de almacenamiento y transferencia considerables para replicar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Artefacto cuantizado de origen: https://huggingface.co/local-inference-lab/Inkling-2-Small-NVFP4-CSF
- Motor Hyperflare: https://github.com/NVIDIA/hyperflare-inference (commit `5a4e8679`)
- Repositorio de referencia PyTorch (parche 0002): https://github.com/pytorch/pytorch
- Papers, blogs y demos adicionales: no disponible en la información proporcionada.
