# doth4580/Qwen3.5-122B-A10B-NVFP4-MIXED

## Resumen

Qwen3.5-122B-A10B-NVFP4-MIXED es una variante cuantizada del modelo Qwen3.5-122B-A10B desarrollado por el equipo Qwen de Alibaba, publicada por el usuario doth4580 bajo licencia Apache-2.0. Se trata de un artefacto de pesos modificados que aplica cuantización NVFP4/FP8 sobre el modelo original, con el objetivo principal de ejecutarlo en el motor de inferencia veloGB10 sobre sistemas NVIDIA DGX Spark / GB10. El modelo base es un MoE híbrido de 122B parámetros totales con aproximadamente 10B activos por token.

La arquitectura combina 36 capas GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) con 12 capas de atención completa GQA, e incorpora una cabeza nativa de multi-token-prediction (MTP) que se emplea para decodificación especulativa. El contexto alcanza los 262.144 tokens y el vocabulario es de 248.320 entradas. El pack en disco ocupa 68 GB, lo que permite desplegarlo en hardware GB10 con topologías desde TP=1 hasta TP=4.

La relevancia de esta ficha radica en que demuestra la viabilidad de servir un modelo MoE de 122B en hardware compacto (DGX Spark) mediante cuantización agresiva NVFP4 combinada con decodificación especulativa y paralelismo tensor multi-nodo, con tasas de decodificación medidas de 26-46 tok/s según topología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: 36 capas GatedDeltaNet (atención lineal) + 12 capas full GQA; hidden 3072, 32 cabezas Q / 2 KV, 256 expertos top-8 + 1 compartido |
| Parametros totales | 125.086.497.008 (~125B; el nombre comercial indica 122B) |
| Parametros activos | ~10B (MoE, top-8 de 256 expertos + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 en todas las GEMMs, excepto proyecciones de entrada/salida GDN en FP8; router en bf16 (receta `nvfp4-mixed`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, `nvfp4-pack-quantized` (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B emplea una arquitectura transformer híbrida que intercala 36 capas de GatedDeltaNet —un mecanismo de atención lineal con estado recurrente de tamaño fijo— con 12 capas de atención completa con GQA (32 cabezas de consulta y 2 de clave/valor). Esta combinación busca reducir el coste computacional y de memoria del contexto largo manteniendo capacidad de atención global periódica. La capa MoE cuenta con 256 expertos en configuración top-8 más un experto compartido, lo que da lugar a ~10B parámetros activos por token sobre un total de ~122-125B. El vocabulario es de 248.320 entradas y la dimensión oculta es 3072.

El artefacto aquí descrito no es un modelo entrenado desde cero, sino una cuantización del original realizada con el cuantizador offline de veloGB10 (`nvfp4-mixed`). Se aplica NVFP4 a todas las GEMMs, manteniendo las proyecciones de entrada/salida de GatedDeltaNet en FP8 y el router en bf16, una receta orientada a preservar calidad. El modelo conserva la cabeza nativa de multi-token-prediction (MTP) del original, que se utiliza para decodificación especulativa. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF/DPO en la información proporcionada. El tokenizer y la plantilla de chat son idénticos a los del modelo original.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 262.144 tokens.
- Modo "thinking" activado por defecto en los ajustes de muestreo medidos por el autor.
- Decodificación especulativa nativa mediante la cabeza MTP integrada, con tasas de aceptación del draft de ~54-57 %.
- Soporte de decodificación especulativa alternativa con el drafter externo DFlash2 de Ornith-1.5-122B.
- Servido mediante API compatible con OpenAI (`/v1`), lo que habilita integración con clientes estándar.
- Soporte de prefix caching para reutilización de prefijos en conversaciones multi-turno.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible explícitamente, aunque el contexto largo y el modo thinking son compatibles con flujos agénticos.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local: el modelo puede generar y revisar código con contexto largo (262.144 tokens) para incluir repositorios completos o historiales extensos; las mediciones del autor muestran 29-46 tok/s en turnos de código según topología.
- Despliegue en DGX Spark / GB10: caso de uso principal del artefacto, permitiendo servir un MoE de 122B en hardware compacto con TP=1 (un solo GB10) o escalar a TP=2/TP=4 para mayor throughput.
- Procesamiento de documentos largos: la ventana de 262k tokens permite resumir, extraer y razonar sobre contratos, informes o bases de código sin truncamiento agresivo.
- Servicio de chat compatible con OpenAI: al exponer `/v1`, puede integrarse en aplicaciones existentes que ya consuman la API de OpenAI sin cambios de cliente.
- Generación creativa y narrativa: los benchmarks del autor incluyen turnos de "story" con 28-42 tok/s de decodificación, adecuados para generación interactiva.
- Investigación en cuantización: el pack sirve como referencia reproducible de la receta `nvfp4-mixed` sobre un MoE grande, útil para estudiar el impacto de NVFP4 en calidad y rendimiento.
- Prototipado con decodificación especulativa: permite comparar la cabeza MTP nativa frente al drafter DFlash2 externo en condiciones reales de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica mediciones de rendimiento de inferencia (VeloBench) sobre GB10 con veloGB10 0.7.7, con muestreo de producción y thinking activado:

| Topologia | Fuente de draft | Decode turno código (tok/s) | Decode turno historia (tok/s) | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones agregado | Aceptación del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del pack | 29 | 28 | 26 | 616 | 40 | 56,2 % |
| TP=2 | MTP del pack | 46 | 38 | 38 | 859 | 60 | 56,9 % |
| TP=4 | MTP del pack | 45 | 42 | 37 | 820 | 70 | 53,8 % |
| TP=1 | Ornith DFlash2 | 7 | 6 | 7 | 610 | 40 | 48,7 % |
| TP=2 | Ornith DFlash2 | 9 | 9 | 11 | 885 | 60 | 49,0 % |
| TP=4 | Ornith DFlash2 | 13 | 11 | 12 | 847 | 70 | 47,9 % |

Nota del autor: una ejecución por celda, con variación de ±10 % entre ejecuciones muestreadas. La cabeza MTP nativa supera claramente al drafter DFlash2 en este pack.

## Requisitos de hardware

- VRAM/almacenamiento: el pack ocupa 68 GB en disco (repo de 72,5 GB); requiere hardware con al menos esa capacidad accesible para pesos.
- Hardware objetivo: NVIDIA DGX Spark / GB10. Funciona en TP=1 (un GB10), TP=2 (dos GB10) y TP=4 (cuatro GB10).
- En TP=2/TP=4 los nodos no necesitan copia local del modelo: el head les envía su partición de pesos por red y la cachean localmente.
- Red: soporte de RoCE; en configuraciones con dos pares de puertos activos se selecciona con `--rdma-dev <rail1>,<rail2>`.
- Motor de despliegue: veloGB10 (`gb10_inference`), binario autocontenido, servidor compatible con OpenAI en el puerto 9000. Al ser formato `compressed-tensors`, es legible por otros frameworks que soporten `nvfp4-pack-quantized`.
- Parámetros recomendados por el autor: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 1.5`, `--prefix-cache on`, `--mtp=auto`.
- Throughput medido: 26-46 tok/s de decodificación (mediana por turno) y 616-885 tok/s de prefill según topología; agregado de 40-70 tok/s con 2 peticiones concurrentes.
- GPU consumer (RTX 4090, etc.): no disponible en la información proporcionada; el artefacto está validado específicamente para GB10.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-NVFP4-MIXED (este) | ~125B | ~10B | 262.144 | NVFP4/FP8 mixta | Apache-2.0 | GB10 (TP=1 a TP=4) |
| Qwen/Qwen3.5-122B-A10B (base) | ~122B | ~10B | 262.144 | bf16 (original) | Apache-2.0 | GPUs de datacenter |
| Ornith-1.5-122B-DFlash2 (drafter) | no disponible | no disponible | no disponible | no disponible | no disponible | Complemento de decodificación especulativa |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pesos modificados: este artefacto no es el modelo original; la cuantización NVFP4 puede introducir degradación de calidad respecto al bf16, aunque la receta `nvfp4-mixed` está diseñada para minimizarla.
- Validación específica: el pack está producido, validado y ajustado para veloGB10; su uso con otros frameworks es posible por formato, pero no está probado por el autor.
- Idiomas soportados no documentados: no se especifica cobertura multilingüe, lo que limita su uso en producción multilingüe sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos específicos de evaluación en la información disponible.
- Sesgos: no disponible en la información proporcionada.
- Rendimiento dependiente de topología: TP=1 ofrece 26 tok/s de mediana; para throughput alto se requiere TP=2 o TP=4, con el coste de hardware y complejidad de red asociados.
- El drafter DFlash2 externo rinde notablemente peor que la cabeza MTP nativa en este pack (7-13 tok/s frente a 26-46 tok/s).
- Mediciones con una sola ejecución por celda y ±10 % de variación; no deben tratarse como cifras de producción garantizadas.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no reclamar propiedad intelectual sobre el modelo; los derechos pertenecen a los autores originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doth4580/Qwen3.5-122B-A10B-NVFP4-MIXED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Drafter DFlash2 de Ornith: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
