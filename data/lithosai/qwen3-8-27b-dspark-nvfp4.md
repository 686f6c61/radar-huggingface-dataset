# LithosAI/Qwen3.8-27B-DSpark-NVFP4

## Resumen

Qwen3.8-27B-DSpark-NVFP4 es una cabeza de borrador (draft head) para decodificación especulativa publicada por LithosAI sobre el modelo objetivo nvidia/Qwen3.8-27B-NVFP4. No es un modelo de lenguaje autónomo: es un componente de aceleración de 5 capas y 1.072.605.697 parámetros (según los metadatos de safetensors) que propone bloques de 7 tokens que el modelo objetivo verifica después. Está cuantizada en NVFP4 con cuantización de solo pesos y validada sobre Apple silicon con LMK (Lithos Metal Kernels), un entorno poco habitual para este tipo de cabezas.

El checkpoint almacena 37 matrices en FP4 E2M1 con una escala de bloque F8_E4M3 cada 16 columnas de entrada y una escala de tensor F32 por matriz, en safetensors fragmentado estándar con índice (1.136.258.502 bytes). Comparte embeddings y proyección de vocabulario con el modelo objetivo, conserva la capa Markov W1 en BF16 y exige un cargador DSpark específico: el layout NVFP4 por sí solo no garantiza compatibilidad con Transformers, vLLM o SGLang estándar.

Es relevante porque la decodificación especulativa se ha consolidado como la vía principal para recortar latencia en inferencia local de modelos de 27B en NVFP4, y porque este export documenta de forma reproducible (SHA-256 del pack, inventario de tensores y política de cuantización) cómo cuantizar una cabeza draft sin degradar la aceptación de propuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de borrador DSpark de decodificación especulativa, transformer de 5 capas sobre Qwen3.8-27B |
| Parametros totales | 1.072.605.697 (metadatos de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en la receta de servicio de ejemplo; heredada del modelo objetivo |
| Tipos de cuantizacion | NVFP4 weight-only: FP4 E2M1 (dos codigos por byte U8, nibble bajo primero), escala de bloque F8_E4M3 por cada 16 columnas de entrada, escala de tensor F32 por matriz; Markov W1 en BF16 |
| Idiomas soportados | no disponible |
| Licencia | model-weight-terms (license: other), condiciones en WEIGHT_NOTICES.md |
| Formato de pesos | safetensors (fragmentado, con indice; sin weights.pack especifico de hardware) |
| Numero de matrices cuantizadas | 37 |
| Tamano de los pesos | 1.136.258.502 bytes (~1,14 GB decimal); repositorio de 1,1 GB |
| Capas draft | 5 |
| Hidden size | 5120 |
| Intermediate size | 17408 |
| Cabezas de consulta / KV | 32 / 8 |
| Dimension de cabeza | 128 |
| Rango Markov | 256 |
| Propuestas por bloque | 7 |

## Arquitectura y entrenamiento

La cabeza es un transformer de 5 capas con hidden size 5120, intermediate size 17408, 32 cabezas de consulta, 8 cabezas KV y dimensión de cabeza 128, que conserva un rango Markov de 256. Comparte los embeddings de tokens y la proyección de vocabulario con el modelo objetivo seleccionado, de modo que no mantiene su propia tabla de vocabulario, y sirve exactamente siete propuestas por bloque draft. El esquema de decodificación es DSpark, el método de decodificación especulativa asociado a DeepSeek según las referencias públicas del ecosistema.

La cuantización es de solo pesos: las activaciones se mantienen en BF16 y la acumulación y el estado en FP32, sin calibración de activaciones ni cuantización NVFP4 de activaciones declarada. Los nombres de tensor siguen el estilo de almacenamiento de ModelOpt (`*.weight`, `*.weight_scale`, `*.weight_scale_2`) y la desquantización es `E2M1(code) * E4M3(block_scale) * tensor_scale`. La capa Markov W1 permanece en BF16, igual que los parámetros de normalización y confianza. El repositorio no incluye información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de datos ni si hubo RLHF o DPO: esos datos no están disponibles.

## Capacidades

- Propuesta de tokens candidatos para decodificación especulativa: genera bloques de 7 propuestas que el modelo objetivo verifica y acepta o descarta.
- No genera texto de forma autónoma: el model card marca `inference: false` y su salida solo tiene sentido dentro de un bucle de decodificación especulativa con el objetivo.
- Reutilización del tokenizer y la plantilla de chat del modelo objetivo, que es quien los aporta.
- Reutilización del vocabulario y de los embeddings del objetivo, sin vocabulario propio.
- Ejecución junto al objetivo en el mismo proceso de servicio (LMK `monolith.serve`) con `--draft-quantization nvfp4` y `--draft-block-size 7`.
- Aceptación de las siete propuestas en el fixture de temporización validado, sin degradación medida en el conjunto de prueba.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí misma: esas capacidades pertenecen al modelo objetivo.
- Soporte multilingüe: no disponible (depende del objetivo).

## Casos de uso

- Inferencia local en Apple silicon: servir Qwen3.8-27B-NVFP4 con esta cabeza sobre un M5 Max de 40 núcleos y 48 GB mediante LMK. La comparación emparejada a 128 tokens de contexto reduce la mediana de la etapa draft de 9,552 ms (BF16) a 4,392 ms (NVFP4) y la ronda completa de 48,427 ms a 43,188 ms, lo que se traduce directamente en menor latencia por token en ese hardware.
- Chat interactivo de baja latencia: con `--max-context 32768` y siete propuestas por bloque, el sistema mantiene conversaciones multi-turno sobre el objetivo NVFP4 reduciendo el coste de la fase de generación, no el de prefill.
- Generación de código asistida por ordenador: los repositorios de servicio del ecosistema reportan que DSpark y DFlash2 son más rápidos en cargas de código, aunque esas mediciones corresponden a otros checkpoints y a SGLang, no a este export con LMK.
- Servicio en NVIDIA DGX Spark (GB10, aarch64): los foros de NVIDIA reportan 34-38 tok/s con SGLang y checkpoints NVFP4+DSpark de RadixArk. Esta cabeza concreta no está validada en esa plataforma y requeriría adaptar el cargador.
- Validación y reproducción de pipelines de cuantización: el repositorio incluye `validation.json`, `conversion.json` y el SHA-256 del pack, y el reempaquetado reproduce el pack de calidad previamente probado byte a byte, incluidos códigos de peso, escalas de bloque y de tensor y tensores auxiliares.
- Investigación en decodificación especulativa: permite comparar BF16 frente a NVFP4 manteniendo fijo el objetivo, con política de cuantización documentada y aceptación de propuestas registrada por ejecución.
- Estudio de recetas de precisión mixta: la evidencia pública del ecosistema indica que mantener QKV en BF16 cuesta unos 3 tok/s pero recupera aceptación (150,73 tok/s con aceptación de 2,546 en una variante full-NVFP4), un compromiso trasladable a este tipo de cabezas.
- Despliegue integrado en CI/CD de verificación de modelos: el arranque con `python -m monolith.serve` y respuestas HTTP 200 con ocho filas de verificación y salidas idénticas repetidas permite usar el checkpoint en pruebas automatizadas de regresión de serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MathVision) para esta cabeza draft en la información disponible. Los datos que siguen son mediciones internas del autor sobre un M5 Max de 40 núcleos, con contexto de 128 tokens, nueve muestras alternas tras cinco calentamientos, y excluyen carga, compilación, prefill y trabajo HTTP.

| Metrica | BF16 | NVFP4 | Notas |
|---|---|---|---|
| Etapa draft, mediana | 9,552 ms | 4,392 ms | Comparacion emparejada |
| Ronda completa, mediana | 48,427 ms | 43,188 ms | Incluye verificacion del objetivo, aceptacion/commit y siguiente bloque draft |
| Etapa draft tras refinamiento de kernel | no aplica | 4,186 ms | Medicion separada, no emparejada |
| Ronda completa tras refinamiento | no aplica | 42,611 ms | Medicion separada, no emparejada |
| Propuestas aceptadas | 7/7 | 7/7 | En el fixture de temporizacion |
| Tokens generados identicos a referencia BF16 | 512/512 | 512/512 | Cuatro prompts de 128 tokens |
| Rondas para la misma generacion | 152 | 150 | Ejecucion NVFP4 refinada |

El propio autor advierte que este conjunto de prompts es pequeño y que no establece una ventaja general de calidad o de aceptación.

## Requisitos de hardware

- Pesos de la cabeza draft: ~1,1 GB en disco, almacenados en safetensors fragmentado.
- Sistema completo: requiere ademas el modelo objetivo nvidia/Qwen3.8-27B-NVFP4 y su tokenizer; el tamaño del objetivo no se detalla en la información disponible.
- Entorno validado: Apple M5 Max de 40 núcleos con 48 GB de memoria unificada y LMK (Lithos Metal Kernels).
- GPU NVIDIA: no se ha documentado ejecución de este checkpoint concreto sobre A100, H100, RTX 4090 ni DGX Spark; el autor indica que el layout NVFP4 por sí solo no establece compatibilidad con Transformers, SGLang o vLLM estándar.
- Opciones de despliegue: LMK, partiendo del commit `3388ea81b3cf77758b285370fa0b8ba814236a3b` del motor y aplicando el parche Apache-2.0 `lithos-metal-runtime.patch` antes de compilar e instalar. El parche también selecciona la receta de servicio NVFP4 validada para las formas del draft de 35B.
- Comando de servicio de referencia: `python -m monolith.serve --model nvidia/Qwen3.8-27B-NVFP4 --draft LithosAI/Qwen3.8-27B-DSpark-NVFP4 --draft-quantization nvfp4 --draft-block-size 7 --max-context 32768 --host 127.0.0.1 --port 8000`.
- Latencia: etapa draft de 4,392 ms de mediana y ronda completa de 43,188 ms de mediana con contexto de 128; 4,186 ms y 42,611 ms respectivamente en la ejecución refinada.
- Throughput: no disponible para este checkpoint. Las cifras de 34-38 tok/s y 150,73 tok/s citadas en la búsqueda web corresponden a otros checkpoints y a SGLang sobre DGX Spark.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LithosAI/Qwen3.8-27B-DSpark-NVFP4 | Cabeza draft DSpark | 1,07 B | NVFP4 weight-only | model-weight-terms | HuggingFace; requiere runtime LMK con parche |
| gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4 | Cabeza draft DSpark | no disponible | NVFP4 con QKV en BF16 | no disponible | HuggingFace |
| nvidia/Qwen3.8-27B-NVFP4 | Modelo objetivo | ~27 B (clase) | NVFP4 | no disponible | HuggingFace |
| Qwen/Qwen3.8-27B | Modelo base | ~27 B (clase) | BF16 | Apache 2.0 | HuggingFace |
| Checkpoints RadixArk NVFP4 + DSpark | Recetas de servicio | no disponible | NVFP4 + DSpark | no disponible | Citados en el foro de NVIDIA, sin URL directa en la información disponible |

No hay datos publicados que permitan comparar aceptación, throughput o calidad entre estas cabezas bajo las mismas condiciones.

## Limitaciones y advertencias

- No es un modelo autónomo: el model card declara `inference: false`. Sin el modelo objetivo no produce texto útil.
- Compatibilidad restringida: el autor afirma explícitamente que el layout NVFP4 no establece compatibilidad con Transformers, SGLang, vLLM ni otro cargador DSpark distinto de LMK.
- Requiere un parche del runtime (`lithos-metal-runtime.patch`) y un commit concreto del motor con el arreglo de escala de tensor de embeddings NVFP4 y el arreglo de compatibilidad de especialización de atención draft.
- Licencia `model-weight-terms` (license: other), distinta de la Apache 2.0 del modelo base Qwen3.8-27B. Hay que revisar WEIGHT_NOTICES.md antes de cualquier uso comercial.
- El exponente y el runtime derivan del proyecto LMK, con licencia Apache-2.0 (véase LICENSE.runtime).
- Sin benchmarks estándar publicados: no hay MMLU, HumanEval ni GSM8K para esta cabeza.
- La validación de calidad se apoya en cuatro prompts de 128 tokens y 512 tokens generados, un conjunto demasiado pequeño para generalizar sobre calidad o aceptación.
- El propio autor señala que los historiales de aceptación difirieron entre BF16 y NVFP4, aunque la salida final coincidiera.
- Las cifras de latencia excluyen carga, compilación, prefill y trabajo HTTP, por lo que no representan la latencia extremo a extremo percibida.
- Contexto de servicio limitado a 32.768 tokens en la receta de ejemplo, no en el modelo objetivo.
- Idioma: no declarado; depende enteramente del objetivo.
- Sesgos y alucinaciones: no hay información específica de esta cabeza; hereda los del modelo objetivo.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la ficha, sin revisión independiente.
- Fecha del checkpoint: creado el 2026-10-04, actualizado el mismo día; es un artefacto muy reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4
- Terminos de licencia de pesos: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/WEIGHT_NOTICES.md
- Validacion del pack: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/validation.json
- Conversion y politica de cuantizacion: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/conversion.json
- Parche de compatibilidad del runtime: https://huggingface.co/LithosAI/Qwen3.8-27B-DSpark-NVFP4/blob/main/lithos-metal-runtime.patch
- Modelo objetivo: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto LMK (Lithos Metal Kernels): https://github.com/jiazhihao/mpk-apple
- Instrucciones de portabilidad del motor: https://github.com/jiazhihao/mpk-apple/blob/3388ea81b3cf77758b285370fa0b8ba814236a3b/docs/porting.md
- Estudio de refinamiento del draft en M5 Max: https://github.com/jiazhihao/mpk-apple/blob/3388ea81b3cf77758b285370fa0b8ba814236a3b/docs/research/m5max-27b-dspark-refinement.md
- Variante de cabeza draft del hub gittensor: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-DSpark-NVFP4/blob/main/README.md
- Hilo de NVIDIA sobre Qwen3.8-27B en DGX Spark con SGLang, NVFP4 y DSpark: https://forums.developer.nvidia.com/t/qwen3-8-27b-at-34-38-tok-s-on-dgx-spark-open-source-one-command-setup-sglang-nvfp4-dspark/380257
- Scripts de servicio en DGX Spark (Mia's AI Lab): https://github.com/MiaAI-Lab/Qwen3.8-27B-SGLang-DGX-Spark
- Guia de hardware de Qwen3.8-27B: https://www.contextstudios.ai/blog/qwen-3-8-27b-hardware-guide
