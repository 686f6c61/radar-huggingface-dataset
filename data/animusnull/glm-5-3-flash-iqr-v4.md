# animusnull/glm-5.3-flash-iqr-v4

## Resumen

GLM-5.3-Flash IQR-V4 es una conversión de cuantización del modelo zai-org/GLM-5.3-Flash (desarrollado por Z.AI), publicada por el usuario animusnull. No se trata de un entrenamiento nuevo ni de un fine-tune con datos adicionales, sino de un contenedor de pesos optimizado para el motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm. El objetivo es hacer servible un modelo de arquitectura MoE de gran tamaño en cuatro tarjetas de 32 GB mediante el reparto (tiering) de los expertos enrutados entre VRAM y memoria de host.

La conversión parte de la release en block-FP8 de Z.AI y aplica una receta propia (glm53-iqr-v4.recipe): los expertos enrutados se comprimen a 4 bits mediante códigos trellis calculados (IQR-V4) tras una rotación Walsh-Hadamard de 128 puntos, mientras que el tronco denso y las proyecciones MLA q_a, kv_a, q_b y de salida se almacenan como int8 rotado (IQ8R). El resultado es un único fichero `.rad` de 158,9 GiB que mantiene una ventana de contexto de 262.144 tokens.

Su relevancia es fundamentalmente de infraestructura: demuestra que un MoE multimodal de esta escala puede servirse con latencia razonable en hardware AMD consumer/prosumer, a costa de sacrificar la capa MTP (sin decodificación especulativa) y de requerir un fork no fusionado del motor radiance. La licencia es MIT, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con atención MLA y capa MTP (excluida en esta conversión) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (servido a 262.144) |
| Tipos de cuantización | Expertos enrutados a 4 bits (IQR-V4, códigos trellis + rotación Walsh-Hadamard 128 puntos, una escala f32 por fila); tronco y proyecciones MLA q_a/kv_a/q_b/output a int8 rotado (IQ8R, una escala por 256 columnas); resto de pesos en el formato de la release (FP8 block) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Contenedor `.rad` propietario del motor radiance (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos (MoE) con capacidades multimodales de entrada imagen-texto. La model card de esta conversión menciona explícitamente varios componentes arquitectónicos: proyecciones MLA (Multi-head Latent Attention) q_a, kv_a, q_b y de salida; proyecciones y estado KDA; un indexador DSA; routers y normas; conexiones mHC; torre de visión; embedding y lm_head; y una capa MTP (Multi-Token Prediction) que aquí se descarta (`--max-spec 0`). No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

Esta publicación no entrena ni ajusta el modelo: aplica una receta de cuantización post-entrenamiento sobre la release block-FP8 de Z.AI. La innovación técnica reside en el esquema de compresión: los expertos enrutados se codifican con códigos trellis calculados de 4 bits tras una rotación Walsh-Hadamard de 128 puntos (redondeo al más cercano, sin datos de calibración), mientras que el tronco se cuantiza a int8 con rotación y una escala por cada 256 columnas. Además, el motor radiance implementa un tiering de expertos que mantiene los más solicitados en VRAM y transmite el resto desde un pool de memoria de host fijada (pinned), con caché latente int8 o fp8 y caché de prefijo de 32 GiB.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con contexto de 262.144 tokens.
- Entrada de imágenes: pipeline image-text-to-text con torre de visión incluida en el contenedor (aunque no se han publicado benchmarks de imagen para esta release).
- Tool calling y function calling a través de la API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`).
- Salida estructurada (structured output).
- Procesamiento de documentos largos: validado con needle-in-a-haystack 10/10 hasta 116k tokens y coherencia 20/20.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin decodificación especulativa: la capa MTP se omite, por lo que no hay aceleración por speculator.
- Sin modo thinking explícito documentado en esta conversión.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto y needle-in-a-haystack validado hasta 116k, es adecuado para resumir o extraer información de contratos, informes técnicos o expedientes completos sin fragmentación.
- Asistencia sobre código en repositorios grandes: el modelo fue evaluado en divergencia KL sobre posiciones de código y documentación, y el contexto largo permite cargar múltiples ficheros de un proyecto para tareas de revisión o refactorización.
- Agentes con tool calling: la API compatible con OpenAI y el soporte de salida estructurada permiten integrarlo en orquestadores de agentes que encadenen llamadas a funciones externas.
- Procesamiento multimodal de imágenes con texto: clasificación, descripción o extracción de información de capturas, diagramas o documentos escaneados, aunque sin métricas publicadas de calidad en visión para esta conversión.
- Despliegue en infraestructura AMD: equipos con 4x Radeon AI PRO R9700 (gfx1201) que necesiten servir un MoE grande sin depender de CUDA, usando el tiering de expertos a memoria de host.
- Servicio de chat con caché de prefijo: la caché de prefijo de 32 GiB y la caché KV int8 reducen el coste de TTFT en conversaciones con system prompts largos y repetidos.
- Investigación en cuantización: la receta y el contenedor sirven como referencia reproducible para estudiar el impacto de IQR-V4 e IQ8R frente a MXFP4 en divergencia KL y perplejidad.

## Benchmarks y rendimiento

Calidad frente a la referencia (radiance 1.17, build MXFP4 del mismo modelo, no la release FP8 original), medida con divergencia KL sobre vocabulario completo en teacher forcing sobre 97.000 posiciones de código, documentación y chat, más un documento de 33.000 tokens:

| Métrica | Caché latente int8 | Caché latente fp8 |
|---|---|---|
| KL media | 0,149 | 0,151 |
| Acuerdo top-1 | 87,14% | 87,10% |
| Perplejidad vs referencia | x0,985 | x0,989 |
| Documento largo (16k a 33k) | 0,084 | 0,083 |

Rendimiento de servicio en 4x Radeon AI PRO R9700 (gfx1201, PCIe Gen4 x16), Threadripper PRO 3955WX, 512 GB RAM:

| Build | Decode (tokens/s) | 1/2/3/4 streams | Prefill 2k/32k/128k | TTFT p50 |
|---|---|---|---|---|
| Este contenedor | no disponible (marcado como FINAL en la model card) | no disponible | no disponible | no disponible |
| radiance 1.17, MXFP4, misma máquina | 58,9 | 56,2 / 87,3 / 104,9 / 115,2 | 2262 / 2514 / 2456 | 276 ms |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras de rendimiento de este contenedor no están publicadas; solo se aportan las del build MXFP4 de referencia.

## Requisitos de hardware

- VRAM: los expertos enrutados no caben en cuatro tarjetas de 32 GB; el motor mantiene los más calientes en VRAM y transmite el resto desde host. Se requieren aproximadamente 64 GiB de RAM libre para el pool de host fijado.
- GPU validadas: 4x Radeon AI PRO R9700 (32 GB, gfx1201, RDNA4) con PCIe Gen4 x16 y ROCm.
- No cabe en GPUs consumer de gama alta convencionales; el despliegue está pensado para multi-GPU AMD con tiering a host. No hay datos de funcionamiento en NVIDIA/CUDA.
- CPU y plataforma de referencia: Threadripper PRO 3955WX con 512 GB de RAM.
- Motor de despliegue: radiance 2.x con la serie de soporte GLM-5.3-Flash (`glm5next`, `plugin/glm`). Es obligatoria la imagen `docker.io/animusnull/radiance:glm5.3-cc1cf8c`; los builds 1.17 no pueden leer el contenedor y los 2.x sin `plugin/glm` no sirven la caché latente int8.
- Configuración de referencia: `tp: 4`, `placement: expert_tiered`, `host-pool-mib: 65536`, `max-num-seqs: 4`, `max-model-len: 262144`, `max-num-batched-tokens: 2048`, `vision-tower-placement: ram`, `kv-cache-dtype: i8`, `num-speculative-tokens: 0`, `prefill-interleave: 4`, `prefix-cache-mib: 32768`, `gpu-headroom-mib: 96`, `load-timeout: 1800s`.
- Orden de kernels obligatorio: `glm,libr4d,libavx,libref` (plugin/glm primero para que su atención con caché latente int8 tome la operación antes que las filas bf16 de libr4d).
- Latencia y throughput de este contenedor: no disponibles. Como referencia, el build MXFP4 en la misma máquina alcanza 58,9 tokens/s en decode y 276 ms de TTFT p50.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash IQR-V4 (este) | no disponible | 262.144 | IQR-V4 4-bit + IQ8R int8 | MIT | Contenedor `.rad`, motor radiance fork, AMD RDNA4 |
| GLM-5.3-Flash (base, zai-org) | no disponible | no disponible | block-FP8 | MIT | Hugging Face, pesos originales |
| radiance 1.17 MXFP4 build (referencia) | no disponible | 262.144 | MXFP4 expertos + tronco FP8 | MIT (modelo base) | Motor radiance 1.17 |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es una cuantización post-entrenamiento; la calidad está acotada por la release FP8 de Z.AI y por la pérdida de compresión (KL media 0,149 frente a la referencia MXFP4).
- Requiere un fork no fusionado del motor radiance; la imagen concreta (`glm5.3-cc1cf8c`) es imprescindible y los builds estándar no pueden servirlo. Riesgo de mantenimiento y de reproducibilidad a largo plazo.
- Dependencia de hardware muy específica: ROCm, RDNA4 (gfx1201) y cuatro GPUs; no hay soporte documentado para CUDA ni para GPUs consumer convencionales.
- El tiering de expertos a memoria de host introduce dependencia del ancho de banda PCIe y de la RAM del sistema (unos 64 GiB libres), con impacto en latencia bajo carga.
- Sin decodificación especulativa (`--max-spec 0`): se renuncia al speedup de la capa MTP.
- La torre de visión se ejecuta en RAM y no se han publicado benchmarks de calidad ni de latencia para entrada de imagen en esta release.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe más allá de lo que ofrezca el modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de sesgo ni de seguridad para esta conversión.
- Licencia MIT heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar los términos de la release original de Z.AI y del motor radiance (alojado en Codeberg) antes de un despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/animusnull/glm-5.3-flash-iqr-v4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen de contenedor: docker.io/animusnull/radiance:glm5.3-cc1cf8c
