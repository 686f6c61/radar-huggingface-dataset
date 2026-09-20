# r0b0tlab/GLM-5.3-Flash-EXL3-2.25bpw-sm121

## Resumen

r0b0tlab/GLM-5.3-Flash-EXL3-2.25bpw-sm121 es una cuantización en formato EXL3 (ExLlamaV3, almacenamiento trellis) del modelo zai-org/GLM-5.3-Flash, un transformer de mezcla de expertos (MoE) que el autor describe como de 320 B de parámetros totales y unos 18 B activos. La publica el usuario r0b0tlab y está orientada a ejecutarse en una única NVIDIA GB10 (DGX Spark, arquitectura sm121) mediante un runtime propio de vLLM con plugin EXL3.

El problema que resuelve es de despliegue: comprimir un MoE grande a ~2,25 bits por peso (~92 GB de pesos, 31 shards de safetensors) para que quepa en la memoria unificada de un equipo con GPU GB10 sin recurrir a clústeres multi-GPU. La cuantización usa codebook `mul1`, tiles mixtos K3/K4, escalas de salida activadas y cabeza de 6 bits, con calibración sobre un corpus mixto y selección tap-K3.

Su interés actual reside en el binomio formato y hardware: EXL3 permite precisión muy baja con decodificación especulativa DFlash2, y el autor publica medidas de throughput en esa configuración. Es un artefacto muy reciente, con 0 descargas y 0 likes, y el recuento de parámetros de los safetensors (49,2 B) no coincide con el del modelo base declarado (320 B), discrepancia que conviene verificar antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) según el modelo base zai-org/GLM-5.3-Flash; pesos almacenados en formato EXL3 (trellis) |
| Parametros totales | 49.171.779.678 (~49,2 B) según los safetensors publicados; la model card atribuye al modelo base 320 B totales |
| Parametros activos | ~18 B (dato declarado para el modelo base); no disponible para esta cuantización |
| Longitud de contexto | no disponible (la configuración de servicio de ejemplo usa `--max-model-len 32768`) |
| Tipos de cuantizacion | EXL3 (ExLlamaV3, trellis) a ~2,25 bpw de media, codebook `mul1`, tiles mixtos K3/K4, escalas de salida activadas, cabeza de 6 bits |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (31 shards) más `quantization_config.json` y ficheros de tokenizador y plantilla; formato EXL3 compatible con exllamav3 v1.5.0 |

## Arquitectura y entrenamiento

No se publica información sobre el entrenamiento de esta pieza: es una cuantización, no un modelo entrenado desde cero. El modelo base es zai-org/GLM-5.3-Flash, del que la model card solo indica que se trata de un MoE de 320 B totales y ~18 B activos, sin detallar composición del dataset, número de tokens, uso de RLHF/DPO ni innovaciones de atención. Los safetensors del repositorio cuantizado declaran 49.171.779.678 parámetros, cifra que no cuadra con los 320 B del modelo base y que puede deberse a que el recuento excluya parte de los pesos de expertos o a un error en la propia model card; no hay información que permita resolver la discrepancia.

La innovación técnica está en la cadena de cuantización y en el runtime. El formato EXL3 almacena los pesos en trellis con un codebook `mul1`, combinando tiles de 3 y 4 bits y una cabeza de 6 bits para promediar ~2,25 bpw. La conversión se hizo con el contrato de conversor del runtime `vllm-exl3-sm121` (base vLLM v0.30.0rc1 más plugin EXL3, parches anclados y kernels EXL3 vendorizados) y calibración sobre corpus mixto con selección tap-K3; el manifiesto completo de módulos y tensores está en `quantization_config.json`. El autor afirma que los pesos no se modifican más allá de la cuantización y remite a documentos de "losslessness" y telemetría de aceptación en el repositorio del runtime, sin que se aporten en la información disponible resultados independientes de calidad.

## Capacidades

- Generación de texto y razonamiento: el modelo base es de tipo instructivo y el runtime declara un `--reasoning-parser glm47`, lo que implica soporte de modo de razonamiento con separación de la traza.
- Generación de código: se reportan medidas de throughput específicas para cargas de código (43,5 tok/s en un solo flujo).
- Salida estructurada: es la carga más rápida medida (52,5 tok/s), lo que apunta a uso intensivo en JSON, esquemas y formatos restringidos.
- Mezcla de expertos con enrutado por token: arquitectura MoE declarada en el modelo base.
- Decodificación especulativa: soporte de DFlash2 con un modelo borrador externo (`incoai/GLM-5.3-Flash-DFlash2`) y `num_speculative_tokens: 7`.
- Multilingüismo limitado: solo inglés y chino están declarados en las etiquetas de idioma.
- Servicio concurrente: soporta peticiones batched con `--max-num-seqs 16` y tamaños de captura de CUDA Graph configurables.
- No se declara soporte de visión, audio, tool calling ni capacidades de agente en la información disponible.

## Casos de uso

- Inferencia local en un único equipo GB10 / DGX Spark: el formato EXL3 a ~2,25 bpw reduce los pesos a ~92 GB, lo que permite servir un MoE grande en la memoria unificada de esta GPU sin repartirlo entre varios nodos.
- Generación de JSON y salidas con esquema fijo: es la carga con mejor rendimiento medido (52,5 tok/s en un solo flujo), adecuada para extracción de datos, rellenado de formularios y APIs que exigen respuestas parseables.
- Asistencia de código en local: con 43,5 tok/s en tareas de código, sirve para autocompletado, generación de funciones y revisión de parches dentro de un entorno de desarrollo sin enviar el código a terceros.
- Razonamiento con traza explícita: el parser `glm47` del runtime permite separar el razonamiento de la respuesta final, útil para depuración y para pipelines que auditan la cadena de decisión.
- Procesamiento por lotes en inglés y chino: con concurrencia 16 el rendimiento agregado se mantiene en torno a 49,8 tok/s, lo que hace viable clasificación, resumen y traducción en bloque entre esos dos idiomas.
- Pruebas de cuantización extrema: el artefacto sirve como banco de pruebas para medir la pérdida de calidad de EXL3 a 2,25 bpw frente al modelo base en BF16.
- Servicio interno con contexto medio: la configuración de ejemplo fija 32.768 tokens de contexto, suficiente para conversaciones multi-turno y documentos de tamaño moderado en atención al cliente interna o análisis documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. Las únicas cifras aportadas son medidas de throughput realizadas por el autor en una GB10 única, TP=1, temperatura 0 y DFlash2 con K=7 (2026-09-20):

| Escenario (un solo flujo, mediana de 5, límite 2048) | tok/s |
|---|---:|
| Salida estructurada | 52,5 |
| Código | 43,5 |
| Prosa abierta | 18,6 |

| Concurrencia (salida estructurada, agregado) | tok/s |
|---|---:|
| ×1 | 50,4 |
| ×4 | 51,4 |
| ×16 | 49,8 |

Estas cifras corresponden a la configuración con decodificación especulativa DFlash2 y no a decodificación normal; no se indica el rendimiento sin el modelo borrador ni se acompaña de métricas de aceptación en esta ficha.

## Requisitos de hardware

- VRAM: los pesos ocupan ~92 GB (repositorio de 98,5 GB), a los que hay que sumar caché KV y activaciones; la receta de servicio usa `--gpu-memory-utilization 0.85`.
- GPU objetivo: una única NVIDIA GB10 (DGX Spark), arquitectura sm121, con tensor parallelism 1. El artefacto está etiquetado explícitamente para sm121 y GB10.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos de los ~92 GB de pesos.
- Otras GPU de centro de datos: no se documenta su funcionamiento en A100, H100 u otras arquitecturas distintas de sm121; no disponible.
- Despliegue: vLLM v0.30.0rc1 con el plugin EXL3 del runtime `r0b0tlab/vllm-exl3-sm121` y `--trust_remote_code`. No hay soporte declarado para llama.cpp, Ollama ni TGI, ya que el formato trellis de EXL3 no es un GGUF estándar.
- Parámetros de servicio recomendados: `--gpu-memory-utilization 0.85 --max-model-len 32768 --max-num-seqs 16 --reasoning-parser glm47 --no-async-scheduling --max-num-batched-tokens 2048`.
- Decodificación especulativa: `--speculative-config '{"method":"dflash","model":"<dflash2-exl3-local>","num_speculative_tokens":7}'` junto con `--compilation-config` con tamaños de captura de CUDA Graph de 1 a 128.
- Throughput esperado: 52,5 tok/s en salida estructurada y 18,6 tok/s en prosa abierta con un solo flujo; en torno a 50 tok/s agregados hasta concurrencia 16.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| r0b0tlab/GLM-5.3-Flash-EXL3-2.25bpw-sm121 | 49,2 B declarados en safetensors (320 B / ~18 B activos según la model card del base) | EXL3 ~2,25 bpw, safetensors | no disponible (32.768 en la receta) | MIT | 1× GB10 / sm121 |
| zai-org/GLM-5.3-Flash (base sin cuantizar) | 320 B totales / ~18 B activos declarados | safetensors (BF16, presumiblemente) | no disponible | MIT | no disponible |
| incoai/GLM-5.3-Flash-DFlash2 (borrador especulativo) | no disponible | no disponible (se convierte a EXL3 en local) | no disponible | CC-BY-NC-ND | junto al modelo principal |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes del mismo tamaño o categoría (parámetros, contexto, benchmarks y licencia), por lo que esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Discrepancia de parámetros sin resolver: los safetensors declaran 49,2 B y la model card del modelo base habla de 320 B totales; conviene verificar la integridad del artefacto antes de confiar en él.
- Idiomas: solo inglés y chino están declarados. No hay soporte declarado de castellano ni de otras lenguas, con el riesgo de degradación que ello implica.
- Riesgo de degradación por cuantización: 2,25 bpw es una precisión muy agresiva. El autor invoca pérdida nula ("losslessness") y telemetría de aceptación en el repositorio del runtime, pero no se aportan en esta información evaluaciones de calidad (perplejidad, MMLU, HumanEval) que lo respalden.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad ni tasas de alucinación para esta cuantización concreta.
- Licencia del componente especulativo: el modelo borrador DFlash2 es CC-BY-NC-ND y no se redistribuye en el repositorio. Su uso añade una restricción no comercial que no está cubierta por la licencia MIT del modelo cuantizado.
- Dependencia de hardware muy concreta: el artefacto está etiquetado para sm121/GB10 y no se documenta su funcionamiento en otras arquitecturas de GPU.
- Dependencia de software: requiere `--trust_remote_code`, un runtime específico (vLLM v0.30.0rc1 con plugin EXL3) y kernels vendorizados; no es portable a stacks estándar sin trabajo adicional.
- Contexto de servicio limitado a 32.768 tokens en la receta publicada; se desconoce la ventana nativa del modelo base.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes, actualizado por última vez el 20 de septiembre de 2026, sin pipeline declarado.
- Los datos de rendimiento provienen exclusivamente del autor y corresponden a una configuración con decodificación especulativa activada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r0b0tlab/GLM-5.3-Flash-EXL3-2.25bpw-sm121
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Runtime de servicio (vLLM + plugin EXL3): https://github.com/r0b0tlab/vllm-exl3-sm121
- Modelo borrador de decodificación especulativa: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Formato EXL3 / exllamav3 v1.5.0 (MIT): no disponible en la información proporcionada
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos no guardan relación con él.
