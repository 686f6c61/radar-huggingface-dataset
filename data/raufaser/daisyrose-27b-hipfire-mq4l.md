# Raufaser/DaisyRose-27B-hipfire-MQ4L

## Resumen

DaisyRose-27B-hipfire-MQ4L es una conversión de formato del checkpoint RadixArk/DaisyRose-27B, un fine-tune de 27.000 millones de parámetros derivado de Qwen3.8-27B y post-entrenado con RL para tareas de agente de horizonte largo. El autor de la conversión es Raufaser, que publica tres variantes del modelo en el formato propietario MQ4G256V2Lloyd (tipo de cuantización 52) del motor de inferencia hipfire, junto con un sidecar MTP para decodificación especulativa.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de la familia Qwen3.8 orientado a agentes; por otro, ilustra una tendencia creciente en el ecosistema open source: formatos de cuantización específicos de motor que rompen la compatibilidad con llama.cpp y obligan a usar un runtime concreto (en este caso, hipfire, con soporte para AMD vía HIP/ROCm). El contenedor MQ4V2 con rotación FWHT mantiene grupos de 136 bytes y sustituye la rejilla uniforme de 4 bits por un codebook Lloyd-Max de 16 niveles por tensor, al mismo régimen de bits, con escalas de activación AWQ derivadas de una matriz de importancia específica del checkpoint.

El resultado son ficheros de entre 14,98 y 16,46 GB que no se pueden cargar en llama.cpp ni en la mayoría de herramientas estándar. La licencia declarada es Apache-2.0, heredada del checkpoint base, y el modelo es de solo texto (pipeline text-generation).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de Qwen3.8-27B; la model card menciona tensores `ssm_out` y `linear_attn.out_proj`, compatibles con una arquitectura híbrida con atención lineal, pero no se detalla) |
| Parámetros totales | 27B (según el nombre del checkpoint base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MQ4G256V2Lloyd (tipo 52), 4 bits con codebook Lloyd-Max de 16 niveles por tensor, escalas AWQ; tres tiers: base, pro, xt |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mq4l` (formato hipfire), más sidecar `.mtp` para decodificación especulativa |

## Arquitectura y entrenamiento

El checkpoint base, RadixArk/DaisyRose-27B, es un post-entrenamiento con RL sobre Qwen3.8-27B orientado a tareas de agente de horizonte largo. La model card de esta conversión no detalla la arquitectura interna, pero la nomenclatura de tensores que menciona (`ssm_out`, `linear_attn.out_proj`, cabezas V de atención lineal) sugiere una arquitectura híbrida con capas de atención lineal tipo SSM o Mamba combinadas con atención estándar, característica de algunas variantes recientes de la familia Qwen. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento más allá de la mención genérica a "RL post-train".

La innovación técnica de este repositorio es puramente de cuantización. El formato MQ4V2 aplica una rotación FWHT (Fast Walsh-Hadamard Transform) a los pesos antes de cuantizar, lo que reduce outliers y mejora la calidad a 4 bits. Sobre esa base, MQ4-Lloyd sustituye la rejilla uniforme de 16 niveles por un codebook Lloyd-Max de 16 niveles calculado por tensor, manteniendo el mismo régimen de bits y los grupos de 136 bytes. Además se aplican escalas de activación AWQ derivadas de una imatrix (matriz de importancia) recogida específicamente sobre este checkpoint con `llama-imatrix` sobre 262.144 tokens de WikiText-2 en 128 chunks de 2.048 tokens. La herramienta de cuantización es `hipfire-quantize`, con la opción `--awq-fix-la-head-order` para remapear las entradas tileadas de las cabezas V de atención lineal del imatrix de llama.cpp al orden de Hugging Face.

## Capacidades

- Generación de texto y razonamiento: el checkpoint base está post-entrenado con RL para tareas de agente, lo que implica capacidades de planificación multi-paso.
- Tareas de agente de horizonte largo: es la especialidad declarada del fine-tune DaisyRose.
- Generación de código: la prueba de humo en gfx1100 confirma que la generación autorregresiva produce código coherente.
- Decodificación especulativa nativa vía MTP: el sidecar `.mtp` permite activar `--spec mtp` con una tasa de aceptación (tau) de 2,39 sobre 96 tokens en la prueba realizada.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Visión, audio u otras modalidades: no disponibles; el pipeline es text-generation.

## Casos de uso

- Automatización de tareas de agente multi-paso: el checkpoint base fue post-entrenado con RL específicamente para tareas de agente de horizonte largo, por lo que encaja en orquestadores que encadenan decenas de llamadas a herramientas con estado persistente.
- Generación de código en pipelines de desarrollo: la prueba de humo confirma generación de código coherente; puede integrarse en flujos de autocompletado o revisión si el entorno dispone de hipfire con soporte qt 52.
- Despliegue en hardware AMD consumer: el formato está optimizado y probado en gfx1100 (RX 7900 XTX) con HIP 7.16 y TheRock 10.1, lo que lo hace adecuado para estaciones de trabajo con GPU AMD de gama alta donde no se quiere depender de CUDA.
- Inferencia con latencia reducida mediante MTP: el sidecar de decodificación especulativa permite acelerar la generación en entornos interactivos, con un tau de 2,39 medido en la prueba del autor.
- Evaluación comparativa de formatos de cuantización: los tres tiers (base, pro, xt) con métricas KLD documentadas permiten estudiar el compromiso entre tamaño y calidad en un mismo checkpoint.
- Investigación sobre cuantización de 4 bits con codebooks no uniformes: el repositorio incluye los comandos de reproducción, hashes SHA-256 y el imatrix, lo que facilita la replicación y el análisis académico del método Lloyd-Max aplicado a pesos de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de divergencia KL sobre una porción de WikiText-2 (24 chunks de 2.048 tokens, 24.552 tokens puntuados) comparando la cuantización uniforme MQ4V2 con MQ4-Lloyd, ambas con AWQ:

| Tier | MQ4V2 uniforme + AWQ | MQ4-Lloyd + AWQ | Reducción Lloyd |
|---|---:|---:|---:|
| base | 0,041264 | 0,038481 | 6,7% |
| pro | 0,038479 | 0,037046 | 3,7% |
| xt | 0,048467 | 0,044659 | 7,9% |

El profesor de referencia es `daisyrose.mq5v2-pro.hfq` y la referencia nativa top-256 es `daisyrose-wt2-native.kldref.bin`. El propio autor advierte que estas cifras son comparables entre sí pero no con los pines publicados en `hipfire-models/qwen3.8-27b`, que usan otro profesor, y que la mejora del tier pro es demasiado pequeña para tratarla como un suelo robusto. La evaluación se ejecutó en gfx1100 (RX 7900 XTX) con `eval_hipfire --scoring-mode prefill --max-chunks 24 --kv-mode q8 --kv-v q8`, `HIPFIRE_GRAPH=0`, `HIPFIRE_NORMALIZE_PROMPT=0` y `HIPFIRE_IU4_PREFILL=0`.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros pesan entre 14,98 GB (xt) y 16,46 GB (pro); hay que sumar la caché KV cuantizada a q8 (el autor usa `--kv-mode q8 --kv-v q8`) y el overhead del runtime, por lo que se recomienda un mínimo de 20-24 GB de VRAM.
- GPU recomendadas: el autor ha validado el modelo en gfx1100 (AMD Radeon RX 7900 XTX, 24 GB) con HIP 7.16 y TheRock 10.1. No se documenta soporte para CUDA ni para GPUs NVIDIA en la información proporcionada.
- Cabe en GPU consumer: sí, en AMD RX 7900 XTX (24 GB). Para el tier pro conviene vigilar el margen de VRAM por la caché KV.
- Opciones de despliegue: exclusivamente hipfire (build con soporte MQ4-Lloyd, qt 52). llama.cpp no puede leer estos ficheros. No se mencionan vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: no se publican cifras de throughput. La única medida de rendimiento es la tasa de aceptación del MTP (tau 2,39 sobre 96 tokens) en gfx1100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-hipfire-MQ4L (este) | 27B | no disponible | `.mq4l` (hipfire) | Apache-2.0 | Hugging Face, requiere hipfire |
| RadixArk/DaisyRose-27B | 27B | no disponible | safetensors (BF16) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B | 27B | no disponible | safetensors | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría, por lo que no es posible establecer una comparación de rendimiento con modelos de tamaño similar. La comparativa se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- Incompatibilidad de formato: los ficheros `.mq4l` solo se cargan en hipfire con soporte qt 52; llama.cpp y el resto del ecosistema estándar no pueden leerlos. Esto limita drásticamente la portabilidad y ata el despliegue a un runtime concreto.
- Dependencia de hardware AMD: la validación se ha hecho exclusivamente en gfx1100 con HIP/ROCm; no hay evidencia de funcionamiento en NVIDIA ni en otras GPUs AMD.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a los modelos de 27B en tareas de agente de horizonte largo, donde los errores se propagan entre pasos.
- Sesgos: no documentados por el autor.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés.
- Contexto: no se publica la longitud de contexto del checkpoint base ni de esta conversión.
- Licencia: Apache-2.0 heredada del checkpoint base; el autor no reclama derechos sobre los pesos. Conviene verificar la licencia del checkpoint original Qwen3.8-27B antes de uso comercial, ya que la model card no la detalla.
- Calidad de cuantización: la mejora del tier pro frente a base es de solo un 3,7% en KLD y el propio autor advierte que no debe tratarse como un suelo robusto. Las métricas no son comparables con las publicadas para otros modelos de la familia.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el soporte de registro para `daisyrose:27b` en hipfire está solo propuesto (PR #1174), no fusionado; la carga por ruta funciona sin él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Raufaser/DaisyRose-27B-hipfire-MQ4L
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Repositorio hipfire: https://github.com/warpfront/hipfire
- Catálogo de trabajos previos de hipfire (PRIOR-ART.md): https://github.com/warpfront/hipfire/blob/master/PRIOR-ART.md
- PR de incorporación de MQ4-Lloyd: https://github.com/warpfront/hipfire/pull/768
- PR de la ruta Lloyd para prefill y decode en gfx1100: https://github.com/warpfront/hipfire/pull/1029
- PR de soporte de registro para `daisyrose:27b`: https://github.com/warpfront/hipfire/pull/1174
- Repositorio de cabezas MTP upstream: `hipfire-models/daisyrose-27b` (referenciado en la model card; no se proporciona URL directa)
