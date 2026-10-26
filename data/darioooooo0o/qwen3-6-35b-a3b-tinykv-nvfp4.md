# darioooooo0o/Qwen3.6-35B-A3B-TinyKV-NVFP4

## Resumen

Qwen3.6-35B-A3B-TinyKV-NVFP4 es una cuantización en NVFP4 del checkpoint TinyKV de la familia Qwen3.6, publicada por el usuario independiente darioooooo0o (@imdariotoo en X). El modelo parte de la cuantización oficial de NVIDIA (nvidia/Qwen3.6-35B-A3B-NVFP4), conserva sus shards sin modificar y sustituye únicamente las 10 capas de atención completa por las versiones reentrenadas de TinyKV, que reducen el KV cache aproximadamente 2,5 veces. Es, por tanto, un modelo de lenguaje de arquitectura MoE (etiqueta qwen3_5_moe) orientado a contexto largo y a inferencia en una sola GPU Blackwell.

La relevancia es práctica: en una RTX PRO 6000 de 96 GB y con 32.768 tokens de contexto, la capacidad de KV cache medida sube de 2,58 M a 6,17 M tokens (2,39 veces más) manteniendo la misma precisión en la prueba de agujas a 30k tokens (23/24 en ambos casos). El ruido de cuantización frente a la referencia bf16 en PyTorch es de 0,1224 de diferencia media absoluta de log-probabilidad, inferior al 0,1667 del checkpoint NVFP4 sin TinyKV.

Se trata de un artefacto muy reciente (creado el 25 de octubre de 2026), con cero descargas y cero likes, sin benchmarks estándar publicados y con una discrepancia notable: el nombre comercial indica 35B-A3B, pero los safetensors del repositorio suman 18.683.860.336 parámetros. Requiere vLLM 0.32.0 más un plugin que registra la arquitectura TinyKV.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`) con 10 capas de atención completa reentrenadas (TinyKV) y proyecciones GDN |
| Parametros totales | 18.683.860.336 según safetensors; el nombre indica 35B, discrepancia no explicada en la información disponible |
| Parametros activos | ~3B según el nombre (35B-A3B); no verificado en la información disponible |
| Longitud de contexto | 131.072 tokens (`--max-model-len` en el ejemplo de vLLM); pruebas publicadas a 32.768 |
| Tipos de cuantizacion | NVFP4 en expertos, FP8 en proyecciones GDN, KV cache FP8; configuración generada con NVIDIA ModelOpt; el repo se etiqueta como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (más plugin Python que registra la arquitectura TinyKV en vLLM) |
| Modelo base | darioooooo0o/Qwen3.6-35B-A3B-TinyKV (a su vez derivado de Qwen/Qwen3.6-35B-A3B) |
| Cuantizacion de origen | nvidia/Qwen3.6-35B-A3B-NVFP4 (shards sin modificar) |
| Tamano del repo | 24,0 GB (pesos ~22 GB según la model card) |

## Arquitectura y entrenamiento

El modelo es un MoE de la familia Qwen3.6 con dos modificaciones encadenadas. La primera es TinyKV: se reentrenaron únicamente las 10 capas de atención completa del modelo, sin tocar el resto de la red, para reducir el tamaño del KV cache en un factor de 2,5. Las capas convertidas se distribuyen en bf16 mediante `tinykv-patch.safetensors` y la configuración de cuantización las deja explícitamente sin cuantizar. La segunda es la cuantización NVFP4 de NVIDIA, que mantiene los expertos en NVFP4, las proyecciones GDN en FP8 y el KV cache en FP8, tal y como NVIDIA configuró el checkpoint original.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO para el modelo base; la model card remite a la ficha principal de TinyKV para la receta de entrenamiento completa. La innovación destacable es la combinación de atención híbrida con capas de atención completa más ligeras y cuantización de bloque FP4, que permite multiplicar la concurrencia y la longitud efectiva de contexto en hardware Blackwell sin reentrenar el modelo entero.

## Capacidades

- Generación de texto y conversación multi-turno (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Procesamiento de contexto largo: ventana configurable de hasta 131.072 tokens en vLLM.
- Alta concurrencia de sesiones largas gracias al KV cache reducido (6,17 M tokens de capacidad en 96 GB con contexto de 32k).
- Recuperación de información en contextos extensos: 23/24 aciertos en la prueba de agujas a 30k tokens con 32 señuelos casi idénticos.
- Inferencia en una sola GPU: el plugin de TinyKV no implementa paralelismo tensorial.
- Capacidad de visión: la torre visual está sin modificar pero no se ha probado; el comando de ejemplo la desactiva explícitamente (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Soporte de tool calling, function calling y flujos de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.

## Casos de uso

- Análisis de documentos extensos en una sola pasada: informes anuales, expedientes o contratos de cientos de miles de tokens caben en la ventana de 131.072 tokens, evitando pipelines de troceado y recuperación que pierden contexto entre fragmentos.
- RAG de alta concurrencia: con 6,17 M tokens de KV cache en una RTX PRO 6000, un servicio puede mantener decenas de sesiones simultáneas con contextos de decenas de miles de tokens, lo que reduce el coste por consulta frente a un checkpoint con KV cache estándar.
- Asistentes de atención al cliente multi-turno: el historial completo de la conversación y la documentación de producto pueden residir en el contexto sin resúmenes intermedios, manteniendo coherencia en diálogos largos.
- Revisión de código sobre repositorios completos: la ventana de 131k permite cargar varios módulos y sus dependencias para tareas de revisión o explicación; conviene validar antes la calidad en código, no medida en la información disponible.
- Procesamiento por lotes de textos jurídicos o administrativos: clasificación, extracción de cláusulas y comparación entre versiones de documentos largos en un despliegue de una sola GPU, con coste de infraestructura acotado.
- Investigación sobre eficiencia de KV cache: el repositorio sirve como referencia reproducible para estudiar el impacto de reentrenar solo las capas de atención completa, ya que incluye métricas comparativas frente al checkpoint NVFP4 original.
- Despliegue en estaciones de trabajo con Blackwell: prototipado local de aplicaciones de contexto largo sin clúster multi-GPU, al caber los pesos (~22 GB) en una única tarjeta profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas son las comprobaciones del autor en vLLM 0.32.0 sobre una RTX PRO 6000 (96 GB), con `gpu_memory_utilization=0.85` y `max_model_len=32768`:

| Prueba | TinyKV-NVFP4 | NVFP4 sin TinyKV |
|---|---|---|
| Capacidad de KV cache | 6,17 M tokens | 2,58 M tokens (2,39× menos) |
| Agujas a 30k tokens con 32 señuelos casi idénticos | 23/24 (logp −0,495) | 23/24 (logp −0,28) |
| Media de \|Δ log p\| frente a su referencia bf16 en PyTorch | 0,1224 (vs TinyKV en PyTorch) | 0,1667 (vs Qwen3.6 en PyTorch) |

Referencias adicionales del mismo conjunto de pruebas: TinyKV en bf16 dentro de vLLM presenta un ruido de 0,0478 y una capacidad de 1,59 M tokens con los mismos ajustes; el checkpoint bf16 original retiene 0,66 M tokens.

## Requisitos de hardware

- VRAM estimada: pesos ~22 GB en NVFP4, más KV cache en FP8 y memoria de activaciones; en las pruebas, 0,85 de utilización sobre 96 GB dejaba espacio para 6,17 M tokens de KV cache.
- GPU objetivo: Blackwell con kernels NVFP4 (la model card cita RTX PRO 6000; B100/B200/GB200 comparten generación, aunque no se han publicado pruebas en ellos).
- GPU no soportadas: las arquitecturas sin kernels NVFP4 (A100, H100, RTX 4090) no pueden ejecutar esta cuantización tal cual; para ellas existen los GGUF del checkpoint TinyKV en bf16.
- GPU de consumo: los pesos caben en tarjetas Blackwell de 32 GB, pero no hay ninguna prueba publicada en consumer; el dato es una estimación por tamaño de pesos, no una validación.
- Restricción importante: el plugin de TinyKV no implementa paralelismo tensorial, por lo que el despliegue queda limitado a una única GPU.
- Despliegue: exclusivamente vLLM 0.32.0, instalando el plugin del repositorio (`pip install ./plugin`) para registrar la arquitectura; no se documenta soporte para llama.cpp, Ollama ni TGI en esta cuantización.
- Latencia y throughput: no disponibles; el autor solo publica capacidad de KV cache y métricas de calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KV cache (96 GB, 32k, 0,85) | Ruido vs bf16 | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TinyKV-NVFP4 (este) | 18,68 B según safetensors | 131.072 | 6,17 M tokens | 0,1224 | Apache-2.0 | safetensors NVFP4 + plugin vLLM |
| Qwen3.6-35B-A3B-TinyKV (bf16) | no disponible | no disponible | 1,59 M tokens | 0,0478 | Apache-2.0 | safetensors / GGUF |
| nvidia/Qwen3.6-35B-A3B-NVFP4 (sin TinyKV) | no disponible | no disponible | 2,58 M tokens | 0,1667 | Apache-2.0 | safetensors NVFP4 |
| Qwen/Qwen3.6-35B-A3B (bf16 original) | 35B totales / 3B activos según nomenclatura | no disponible | 0,66 M tokens | referencia | Apache-2.0 | safetensors |

La comparación se limita a la familia Qwen3.6 porque la información disponible no incluye datos de modelos de otros fabricantes. El eje diferencial es la relación entre capacidad de KV cache y fidelidad: la versión bf16 de TinyKV es la más fiel pero retiene menos tokens por GB, mientras que este NVFP4 sacrifica parte de esa fidelidad (0,1224 frente a 0,0478) a cambio de 3,9 veces más capacidad que el bf16 original.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 35B-A3B, pero los safetensors suman 18,68 B de parámetros; conviene verificar el conteo real antes de dimensionar infraestructura.
- Modelo sin adopción: cero descargas y cero likes en el momento de la ficha, publicado por un autor individual, sin revisión por pares ni validación independiente.
- Dependencia de código de terceros: requiere instalar un plugin desde el propio repositorio para registrar la arquitectura en vLLM; es un riesgo de cadena de suministro que debe auditarse antes de usarlo en producción.
- Sin paralelismo tensorial: queda confinado a una GPU, lo que limita el escalado horizontal a replicar instancias.
- Solo texto en la práctica: la torre de visión está sin probar y el comando recomendado la desactiva.
- Idiomas no documentados: no hay lista de idiomas soportados ni evaluación multilingüe.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni de tool calling, de modo que la calidad en código, matemáticas o agentes no está acreditada.
- Ruido de cuantización superior al bf16: 0,1224 de divergencia media de log-probabilidad frente a 0,0478 del TinyKV en bf16; en tareas sensibles a la calibración puede ser relevante.
- Contexto largo no perfecto: la prueba de agujas da 23/24, no 24/24, con señuelos casi idénticos; no debe asumirse recuperación perfecta en 131k tokens.
- Riesgo de alucinación: no se documenta ninguna evaluación específica; aplican los riesgos habituales de un modelo generativo sin datos de fidelidad factual.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse también la licencia y las condiciones del checkpoint base de Qwen y de la cuantización de NVIDIA en despliegues de producto.
- Compatibilidad de hardware muy restringida: sin kernels NVFP4 no hay ejecución; no se documentan resultados en GPUs distintas de la RTX PRO 6000.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-NVFP4
- Modelo base TinyKV (receta de conversión y tablas de calidad): https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV
- GGUF del modelo base: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor en X: https://x.com/imdariotoo
- Proveedor de cómputo (CloudRift): https://www.cloudrift.ai
