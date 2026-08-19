# flashrt/fp8-kv-attention

## Resumen

FlashRT FP8 KV Attention es un kernel CUDA nativo de atención XQA (cross-attention) diseñado para ejecutar decodificación y verificación especulativa sobre cachés de K/V cuantizados en FP8 E4M3. Lo desarrolla el proyecto FlashRT y se distribuye bajo licencia Apache 2.0. El problema que resuelve es el cuello de botella de ancho de banda que supone leer la caché KV en BF16 durante la fase de decodificación en transformers de contexto largo: al mantener la caché en FP8, se reduce el tráfico de memoria a la mitad sin re-cuantizar dentro de la llamada de atención.

No es un modelo de lenguaje ni un reemplazo genérico de FlashAttention. Es un kernel especializado que asume una caché paginada con formato vLLM (page size 32) y perfiles de decodificación validados para producción. Expone cuatro funciones: `xqa_bf16_fp8kv`, `causal_spec_mask`, `default_page_table` y `allocate_workspace`. Se integra con Transformers mediante `trust_remote_code=True` y es compatible con entornos de ejecución estáticos como CUDA Graphs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel CUDA XQA para atención con caché KV FP8 E4M3 |
| Parametros totales | no aplicable (kernel, no modelo) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable (depende del modelo que lo use) |
| Tipos de cuantizacion | FP8 E4M3 para K/V cache; BF16 para queries y outputs |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplicable (codigo CUDA compilado) |

## Arquitectura y entrenamiento

El kernel implementa atención XQA con queries en BF16 y caché K/V en FP8 E4M3. La cuantización se realiza al escribir la caché, no dentro de la llamada de atención. Soporta perfiles validados de producción para decodificación y verificación especulativa con longitudes de query menores o iguales a 32. Las dimensiones de Q/KV/head-dim validados son `24/4/256`, `16/2/256`, `32/8/128`, `32/16/128` y `16/8/128`. El layout de caché paginada sigue el formato por defecto de vLLM con page size 32. No se dispone de información sobre datos de entrenamiento porque no es un modelo entrenado, sino un kernel de inferencia. La innovación técnica principal es evitar la re-cuantización de K/V dentro de la atención, lo que reduce la latencia y el ancho de banda consumido.

## Capacidades

- Decodificación y verificación especulativa con caché KV en FP8 E4M3.
- Atención causal con máscara especulativa (`causal_spec_mask`).
- Tabla de páginas por defecto compatible con el layout de vLLM (`default_page_table`).
- Asignación de workspace para buffers estáticos (`allocate_workspace`).
- Compatible con CUDA Graphs y buffers estáticos mediante tensores explícitos.
- Integración con Transformers via `trust_remote_code=True`.
- No es un kernel genérico: solo cubre los perfiles listados en la documentación.

## Casos de uso

- Inferencia de transformers de contexto largo en producción: el kernel reduce el ancho de banda de la caché KV a la mitad, lo que permite servir modelos con ventanas de contexto mayores en la misma VRAM.
- Decodificación especulativa: el perfil `q_seq <= 32` está pensado para verificar múltiples tokens especulados en una sola pasada, acelerando el throughput de generación.
- Despliegue con vLLM: al usar el layout de caché paginada por defecto (page size 32), se integra directamente en entornos que ya usan vLLM como backend.
- Servidores de inferencia con CUDA Graphs: las funciones aceptan tensores explícitos para buffers estáticos, lo que permite capturar el kernel en grafos CUDA y eliminar overhead de lanzamiento.
- Investigación en cuantización de atención: sirve como referencia de implementación para FP8 KV-cache en kernels personalizados.
- Reducción de costes de inferencia: al reducir el tráfico de memoria, se puede usar hardware con menos ancho de banda o aumentar el número de requests concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion menciona que el kernel mantiene la precision cerca de la linea base con diferencias medias de aproximadamente un punto o menos en configuraciones de FP8 KV-cache con FP8 attention, segun el blog de vLLM sobre el estado de la cuantizacion FP8 en cachés KV, pero no se proporcionan cifras concretas para este kernel.

## Requisitos de hardware

- GPU con soporte CUDA y capacidad para FP8 E4M3 (GPUs Hopper o posteriores, como H100, H200, B200).
- VRAM: no determinable sin conocer el modelo que lo usa; el kernel en sí no tiene requisitos de VRAM propios.
- No es compatible con GPUs consumer de gama media sin soporte FP8 nativo.
- Despliegue recomendado con vLLM, CUDA Graphs o entornos de inferencia que usen caché paginada.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

No disponible. Este kernel no tiene comparables directos publicados en la informacion proporcionada. La alternativa generica seria FlashAttention con cuantizacion FP8, pero no se dispone de datos comparativos.

## Limitaciones y advertencias

- No es un reemplazo generico de FlashAttention: solo cubre los perfiles de dimensiones listados y longitudes de query menores o iguales a 32.
- Requiere GPUs con soporte FP8 E4M3 nativo; no funcionara en hardware anterior.
- La cuantizacion FP8 de K/V puede introducir perdidas de precision respecto a BF16, aunque la documentacion sugiere diferencias minimas.
- No se proporcionan benchmarks propios ni comparativas con otras implementaciones.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco adoptado.
- No hay informacion sobre mantenimiento, soporte o roadmap del proyecto.
- La licencia Apache 2.0 permite uso comercial, pero el codigo depende de CUDA y de un entorno de ejecucion especifico.

## Enlaces

- HuggingFace: https://huggingface.co/flashrt/fp8-kv-attention
- GitHub (README): https://github.com/flashrt-project/FlashRT-HF-kernels/blob/main/fp8-kv-attention/README.md
- GitHub (directorio): https://github.com/flashrt-project/FlashRT-HF-kernels/tree/main/fp8-kv-attention
- Kernel en HuggingFace: https://huggingface.co/kernels/flashrt/fp8-kv-attention
- Blog de vLLM sobre FP8 KV-cache: https://vllm.ai/blog/2026-04-22-fp8-kvcache
