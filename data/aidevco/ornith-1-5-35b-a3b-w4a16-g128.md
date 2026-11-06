# aidevco/Ornith-1.5-35B-A3B-W4A16-g128

## Resumen

Ornith-1.5-35B-A3B-W4A16-g128 es una cuantización int4 de solo pesos del modelo ornith-ai/Ornith-1.5-35B-A3B, publicada por aidevco. El modelo base es un transformer MoE (mezcla de expertos) con arquitectura Qwen3.5, 35.951.822.704 parámetros totales (de los cuales una fracción reducida está activa por token, dado el diseño A3B) y capacidades multimodales de imagen-texto a texto. La cuantización reduce el checkpoint de 71,9 GB en bf16 a 24,1 GB, preservando en bf16 las capas recurrentes, de atención completa, routers, expertos compartidos, normas, embeddings, lm_head, cabeza MTP y torre de visión.

El problema que resuelve esta variante concreta es de despliegue: permitir servir el modelo en una única AMD Instinct MI210 (gfx90a, 64 GB) por réplica mediante el kernel fused MoE WNA16 de vLLM. El autor documenta que las builds AWQ asimétricas habituales de esta familia no se sirven con buen rendimiento en gfx90a, porque ese kernel exige pesos simétricos sin puntos cero. La cuantización es data-free, simétrica, con grupo 128 y sin cuantización de activaciones (W4A16).

Es relevante ahora por dos motivos: demuestra una ruta reproducible de cuantización de expertos en formato compressed-tensors `pack-quantized` compatible con el loader de vLLM, e incluye una configuración de kernel Triton afinada específicamente para MI210 con ganancias medidas modestas pero verificadas. La licencia es MIT, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con Gated DeltaNet (`linear_attn`), atención completa, expertos compartidos, routers y cabeza MTP |
| Parámetros totales | 35.951.822.704 (dato real de safetensors) |
| Parámetros activos | no disponible (el nombre A3B sugiere ~3B activos, no confirmado en la información) |
| Longitud de contexto | no disponible en la card de cuantización; el ejemplo de servicio usa `--max-model-len=32768` y reporta KV cache de 1.101.177 tokens con `--gpu-memory-utilization=0.90` en una MI210 |
| Tipos de cuantización | int4 W4A16, simétrico, grupo 128, solo pesos, formato compressed-tensors `pack-quantized`; resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (16 shards, 24,1 GB), compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La card de esta variante no describe el entrenamiento del modelo base; remite explícitamente a la model card original de ornith-ai/Ornith-1.5-35B-A3B para arquitectura, entrenamiento, uso previsto, benchmarks y limitaciones. Lo que sí se detalla es la estructura que la cuantización toca: 40 capas con 256 expertos enrutados cada una, con proyecciones `gate_proj`, `up_proj` y `down_proj` cuantizadas a int4 (30.720 módulos cuantizados en total), mientras que Gated DeltaNet, las proyecciones de atención completa, los expertos compartidos, los routers, las normas, los embeddings, `lm_head`, la cabeza MTP (incluidos sus expertos) y la torre de visión permanecen en bf16.

El proceso de cuantización se realizó con llm-compressor 0.14.0 (`model_free_ptq`) y compressed-tensors 0.19.0, sin conjunto de calibración, en las CPUs de un nodo y en 13 minutos. El esquema es `num_bits=4`, `symmetric=true`, `strategy=group`, `group_size=128` y observer `memoryless-mse`, sin cuantización de activaciones. Un detalle técnico relevante: el checkpoint original almacena los expertos fusionados (`experts.gate_up_proj`, `experts.down_proj`) y el cuantizador los separa en `gate_proj`/`up_proj`/`down_proj` por experto, el layout que espera el loader de vLLM. El autor verificó la separación sobre un shard midiendo error relativo de dequantización de 0,10 contra la mitad correspondiente y 1,4 contra la otra. El grupo 128 divide exactamente las dimensiones cuantizadas de 512 y 2.048 con tensor-parallel size 1. La revisión del checkpoint fuente es `10fbf86fed7ecee4a061f8b499a618f46001cac1`.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Entrada multimodal imagen-texto a texto (pipeline declarado `image-text-to-text`; torre de visión mantenida en bf16).
- Razonamiento con modo thinking: el ejemplo de servicio usa `--reasoning-parser=qwen3`, y las comprobaciones del autor incluyen un caso con thinking desactivado y otro activado.
- Tool calling / function calling: el ejemplo de servicio usa `--tool-call-parser=qwen3_coder` y se validó una llamada a herramienta `get_weather` con `city: "Amsterdam"`.
- Capacidades multilingües: no disponible.
- Capacidades de audio y vídeo: la configuración de servicio del autor las desactiva explícitamente (`--limit-mm-per-prompt='{"image":0,"audio":0,"video":0}'`), por lo que no se documenta soporte utilizable en esta build.

## Casos de uso

- Servicio de inferencia en AMD Instinct MI210: una réplica por tarjeta con vLLM v0.33.0 y ROCm 10,0, con unos 21 GiB de VRAM en uso tras la carga. Es el escenario para el que se construyó la cuantización y el único validado por el autor.
- Despliegue de dos réplicas independientes en un nodo de dos MI210: el autor indica que dos tarjetas sirven dos réplicas independientes, útil para separar tráfico de producción y pruebas o para escalar horizontalmente sin tensor parallelism.
- Asistentes conversacionales con ventana de contexto amplia: con `--max-model-len=32768` y KV cache de 1.101.177 tokens en una MI210, el modelo puede sostener sesiones largas o documentos extensos en memoria, aunque el contexto máximo real del modelo base no está documentado en esta card.
- Automatización con herramientas y agentes: el soporte de `qwen3_coder` como parser de tool calls permite integrar el modelo en flujos que invocan APIs externas, como la consulta meteorológica validada en las comprobaciones del autor.
- Razonamiento con trazas separadas: el parser `qwen3` permite exponer el modo thinking como campo aparte en la respuesta, adecuado para pipelines que registran o auditan el razonamiento sin mezclarlo con la salida final.
- Ajuste fino del kernel para cargas concretas: el repositorio incluye `moe-configs/E=256,N=512,device_name=AMD_Instinct_MI210,dtype=int4_w4a16.json`, una configuración Triton afinada con 12 tamaños de batch (1 a 2048) que mejora el throughput entre un 2,3 % y un 3,4 % a concurrencia 1 y 2, y reduce la latencia inter-token entre un 3,5 % y un 4,1 % en esos mismos niveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión de tareas en la información disponible. El autor lo declara explícitamente: la card no reporta exactitud del modelo cuantizado.

Los únicos datos de rendimiento publicados son de servicio y de validación funcional:

| Medición | Resultado |
|---|---|
| VRAM tras carga en una MI210 | ~21 GiB |
| KV cache con `--gpu-memory-utilization=0.90` | 1.101.177 tokens |
| Throughput de salida (config Triton afinada vs. por defecto) | +2,3 % a +3,4 % a concurrencia 1 y 2; +0,3 % a +0,5 % a concurrencia 4 (dentro de la dispersión entre ejecuciones) |
| Latencia inter-token (config afinada) | 3,5 % a 4,1 % menor a concurrencia 1 y 2 |
| Time to first token y energía por token | sin cambios dentro del ruido |
| Pruebas funcionales a temperatura 0 | 4 superadas: 17 × 60 = 1.020; viaje en tren de 155 minutos con thinking off y on; tool call `get_weather` con `city: "Amsterdam"` |

Condiciones de la medición A/B: una MI210, orden por defecto, afinada, afinada, por defecto, pod nuevo por ejecución, 1.536 tokens de prompt y 128 de salida, ventanas de 60 s. El afinado se hizo con vLLM v0.33.0 (`vllm/vllm:v0.33.0-rocm`), ROCm 10 y Triton 3.8.0, con calentamiento de 60 minutos y 9 h 02 min de tuning.

## Requisitos de hardware

- VRAM estimada: unos 21 GiB en uso tras la carga en MI210 con la configuración del autor; el checkpoint ocupa 24,1 GB en disco en 16 shards.
- GPU validadas: AMD Instinct MI210 (gfx90a, 64 GB), una réplica por tarjeta. El autor menciona que las builds AWQ asimétricas no se sirven con buen rendimiento en gfx90a por la exigencia de pesos simétricos del kernel WNA16.
- GPU de consumo: no disponible. No hay validación publicada en RTX 4090 u otras tarjetas consumer, y el kernel fused MoE WNA16 documentado está probado en ROCm sobre gfx90a.
- Despliegue: vLLM v0.33.0 con ROCm 10,0. La cuantización se detecta desde la configuración, por lo que no debe pasarse `--quantization`. El autor documenta `CompressedTensorsWNA16MoEMethod` con `TritonWNA16Experts`.
- Configuración de referencia: `--max-model-len=32768 --gpu-memory-utilization=0.90 --kv-cache-dtype=auto --max-num-batched-tokens=2048 --language-model-only --limit-mm-per-prompt='{"image":0,"audio":0,"video":0}' --reasoning-parser=qwen3 --tool-call-parser=qwen3_coder`.
- Kernel afinado opcional: descargar `moe-configs/*` y apuntar `VLLM_TUNED_CONFIG_FOLDER` a esa carpeta; vLLM no lo lee del repositorio. Solo es válido para esta forma exacta, tarjeta y dtype; en imágenes ROCm 7.2 la tarjeta aparece como `Instinct_MI210` y hay que copiar el fichero con ese nombre. Un vLLM o Triton más nuevos pueden cambiar el kernel y requieren revalidación.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo, solo las variaciones relativas de la tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-W4A16-g128 (esta ficha) | 35.951.822.704 totales; activos no disponible | no disponible (servicio de ejemplo a 32.768) | int4 W4A16, grupo 128, simétrico | MIT | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35.951.822.704 (71,9 GB en bf16) | no disponible | bf16 | MIT | Hugging Face |
| Builds AWQ asimétricas de la familia Ornith-1.5-35B-A3B | mismas que el base | no disponible | AWQ asimétrico | MIT (presumiblemente) | mencionadas por el autor, sin identificar |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. La diferencia documentada es operativa: esta build usa pesos simétricos para encajar en el kernel fused MoE WNA16 de vLLM sobre gfx90a, mientras que las builds AWQ asimétricas no se sirven con buen rendimiento en esa GPU según el autor.

## Limitaciones y advertencias

- No hay métricas de exactitud publicadas para la versión cuantizada; el autor no reclama ninguna puntuación de benchmark. La pérdida de calidad frente al modelo bf16 es, por tanto, desconocida.
- Las comprobaciones funcionales se limitan a cuatro pruebas a temperatura 0 (una multiplicación, dos relatos de un viaje en tren y una llamada a herramienta), insuficientes para caracterizar el comportamiento en producción.
- Sesgos conocidos: no disponible. La card remite a la documentación del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las advertencias generales del modelo base.
- Idiomas soportados: no disponible, lo que impide evaluar la cobertura multilingüe de esta build.
- La validación de hardware es estrecha: una MI210 con vLLM v0.33.0, ROCm 10,0 y Triton 3.8.0. No hay evidencia de funcionamiento en CUDA, en GPU consumer ni en otras versiones de vLLM.
- El kernel Triton afinado solo es válido para esta forma exacta (E=256, N=512), tarjeta y dtype; las ganancias a concurrencia 4 quedan dentro de la dispersión entre ejecuciones.
- La configuración de servicio del autor desactiva imagen, audio y vídeo, de modo que las capacidades multimodales del modelo base no están ejercitadas en el escenario validado.
- Licencia: MIT heredada del modelo original. El autor advierte que el repositorio original enlaza un fichero `LICENSE` que no está presente en la revisión citada, por lo que los términos aplicables son los del modelo base y conviene verificarlos antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.
- La fecha de creación del repositorio (2026-11-05) es posterior a la información de referencia disponible; conviene comprobar la vigencia de los datos.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/aidevco/Ornith-1.5-35B-A3B-W4A16-g128
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- llm-compressor: no disponible en la información proporcionada
- compressed-tensors: no disponible en la información proporcionada
- vLLM: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
