# doth4580/Qwen3.6-27B-NVFP4-FULL

## Resumen

Qwen3.6-27B-NVFP4-FULL es una cuantización NVFP4/FP8 del modelo Qwen3.6-27B, desarrollado originalmente por el equipo Qwen de Alibaba y empaquetado por el usuario doth4580. El artefacto emplea el formato `nvfp4-pack-quantized` de `compressed-tensors` y está pensado ante todo para ejecutarse con el motor de inferencia veloGB10 sobre sistemas NVIDIA DGX Spark / GB10, aunque al usar un layout estándar de Hugging Face puede cargarse con cualquier framework que lea dicho formato. El modelo base es denso con arquitectura híbrida: 48 capas GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) combinadas con 16 capas de atención completa GQA, dimensión oculta 5120 y 24 cabezas de consulta frente a 4 de clave/valor.

El modelo resuelve el problema de desplegar un LLM de 27.781 millones de parámetros con ventana de contexto de 262.144 tokens en hardware de gama GB10 con memoria unificada limitada. La cuantización NVFP4 reduce el peso en disco a 15 GB y permite servir el modelo en una sola máquina GB10 (TP=1) o escalar a dos y cuatro nodos mediante tensor parallelism. Incorpora una cabeza MTP (multi-token prediction) nativa que el motor veloGB10 aprovecha para decodificación especulativa, con tasas de aceptación medidas del 66-68 %.

Es relevante ahora porque demuestra la viabilidad de servir modelos de 27B con contexto de 256K en hardware compacto (DGX Spark) con decodificación especulativa y paralelismo multi-nodo, un escenario que hasta hace poco requería GPUs de centro de datos. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque el artefacto cuantizado en sí no ha sido validado más que con veloGB10.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 48 capas GatedDeltaNet (atención lineal) + 16 capas full GQA; hidden 5120, 24 cabezas Q / 4 KV |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 (todos los GEMM en NVFP4, receta `nvfp4-full`); formato `nvfp4-pack-quantized` de compressed-tensors; etiqueta de 8 bits en HF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base Qwen/Qwen3.6-27B) |
| Formato de pesos | safetensors con layout `nvfp4-pack-quantized` (compatible con compressed-tensors) |
| Vocabulario | 248.320 tokens |
| Cabeza MTP | sí, multi-token prediction nativa (usada para decodificación especulativa) |
| Tamaño en disco | 15 GB (repo: 15,9 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura híbrida que alterna 48 capas de GatedDeltaNet —atención lineal con estado recurrente de tamaño fijo— con 16 capas de atención completa con GQA (24 cabezas de consulta, 4 de clave/valor). La dimensión oculta es 5120 y el vocabulario de 248.320 tokens. Esta combinación busca reducir el coste de atención en contextos largos (hasta 262.144 tokens) manteniendo la capacidad de recuperación de información de la atención completa. Incluye además una cabeza nativa de multi-token prediction (MTP) que sirve como fuente de borradores para decodificación especulativa.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, si hubo RLHF/DPO) no se dispone de información en los datos proporcionados. El artefacto de doth4580 no reentrena el modelo: aplica una cuantización offline con el cuantizador `nvfp4-full` de veloGB10 sobre los pesos originales, modificando los pesos pero manteniendo intactos tokenizer y chat template. La innovación técnica del paquete reside en la integración con el motor veloGB10: decodificación especulativa con la cabeza MTP, tensor parallelism multi-nodo con transferencia de pesos por red (RoCE/RDMA) y caché local en cada nodo, y prefix caching.

## Capacidades

- Generación de texto y razonamiento en modo thinking (la model card indica que las mediciones se hicieron con thinking activado).
- Procesamiento de contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa nativa mediante la cabeza MTP, con tasas de aceptación medidas del 66,3 % (TP=1), 68,5 % (TP=2) y 67,0 % (TP=4).
- Servicio compatible con la API de OpenAI (`/v1`) a través del motor veloGB10.
- Soporte de prefix caching para reutilización de prefijos en peticiones repetidas.
- Escalado multi-nodo: tensor parallelism TP=1, TP=2 y TP=4 sobre máquinas GB10.
- Capacidades de tool calling, function calling, agentes, multilingüismo, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en estación de trabajo con DGX Spark: el modelo sirve turnos de código a 34 tok/s en TP=1 (60 tok/s en TP=4) con contexto de 262K, suficiente para mantener repositorios completos en la ventana y generar parches de forma interactiva.
- Análisis de documentos largos en local: contratos, informes o expedientes de cientos de miles de tokens caben en la ventana de 262.144 tokens, con prefill medido de 657 tok/s (TP=1) y 838 tok/s (TP=2), lo que permite procesar el documento una vez y reutilizar el prefijo con prefix caching.
- Despliegue en clúster pequeño de GB10 para equipos de investigación: TP=2 o TP=4 permite agregar 37-59 tok/s con dos peticiones concurrentes, útil para prototipos de agentes que requieren varias llamadas encadenadas.
- Servicio interno compatible con OpenAI: al exponer `/v1`, se integra sin cambios en aplicaciones existentes que usan el SDK de OpenAI, facilitando migraciones desde APIs en la nube.
- Generación especulativa de alto rendimiento en hardware compacto: la cabeza MTP con ~67 % de aceptación reduce el número de pasos de decodificación, lo que se traduce en latencia menor para aplicaciones de chat en tiempo real.
- Evaluación y benchmarking de cuantización NVFP4: el paquete sirve como referencia para medir el impacto de NVFP4 en calidad y velocidad frente a los pesos originales en FP16/BF16, dado que el autor declara que pasa la suite de correctitud de veloGB10.
- Inferencia en el borde con memoria unificada: 15 GB de pesos permiten cargar el modelo en una única GB10 conservando contexto completo, algo inviable con los pesos originales sin cuantizar.

## Benchmarks y rendimiento

Mediciones de VeloBench sobre la API servida en máquinas GB10 (2026-11-08, veloGB10 0.7.7 dev), con sampling de producción, thinking activado y una petición a la vez salvo en la columna de dos peticiones. Decodificación en tokens de salida por segundo, incluyendo decodificación especulativa. Una ejecución por celda, variación aproximada de ±10 %.

| Topología | Fuente de borrador | Decode turno de código (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptación de borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | cabeza MTP del paquete | 34 | 22 | 25 | 657 | 24 | 66,3 % |
| TP=2 | cabeza MTP del paquete | 51 | 31 | 35 | 838 | 37 | 68,5 % |
| TP=4 | cabeza MTP del paquete | 60 | 38 | 43 | 771 | 59 | 67,0 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 15 GB de pesos en disco; en GB10 la memoria es unificada, por lo que el modelo completo cabe en una sola máquina con margen para KV cache de contexto largo.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (objetivo principal y único validado). No hay datos de funcionamiento en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el paquete está producido y ajustado para los kernels de veloGB10 en GB10.
- Despliegue: motor veloGB10 (`gb10_inference`), servidor compatible con OpenAI en el puerto 9000. Soporta TP=1, TP=2 y TP=4 con nodos sin copia local del modelo (transferencia de pesos por red y caché local). vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto, aunque el formato compressed-tensors es legible por frameworks compatibles.
- Latencia y throughput: decodificación de 25 tok/s (mediana, TP=1) a 43 tok/s (TP=4); prefill de 657-838 tok/s; agregado de 24-59 tok/s con dos peticiones. Flags recomendados: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 1.5`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.6-27B-NVFP4-FULL (este) | 27,78 B | 262.144 | NVFP4 (compressed-tensors) | Apache-2.0 | Hugging Face, 46 descargas |
| Qwen/Qwen3.6-27B (base) | 27,78 B | 262.144 | FP16/BF16 original | Apache-2.0 | Hugging Face (oficial) |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad ni de otros modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base y a las características del paquete.

## Limitaciones y advertencias

- El artefacto solo está validado con el motor veloGB10; su uso con otros frameworks es posible por el formato compressed-tensors, pero no está probado ni documentado por el autor.
- No hay datos publicados sobre degradación de calidad por la cuantización NVFP4 frente al modelo original en FP16/BF16; el autor solo afirma que pasa la suite de correctitud de veloGB10 (pérdida greedy sin pérdida en decodificación especulativa).
- Sesgos conocidos del modelo base: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; es un riesgo inherente a los LLM y no hay evaluaciones publicadas para este artefacto.
- Idiomas soportados: no disponible; la model card no detalla cobertura lingüística.
- El repositorio tiene 46 descargas y 0 likes, lo que indica escasa validación por parte de la comunidad; conviene tratar el artefacto como experimental para producción.
- La licencia Apache-2.0 se hereda del modelo base, pero el autor del paquete no reclama propiedad intelectual sobre los pesos; los derechos permanecen en los autores originales.
- Las mediciones de rendimiento provienen de una sola ejecución por celda con variación de ±10 % y builds de desarrollo de veloGB10 0.7.7, por lo que no deben tomarse como cifras estables de producción.
- El contexto máximo de 262.144 tokens con `--max-batch 2` implica un consumo de KV cache considerable; no se documentan cifras exactas de memoria para el peor caso.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/doth4580/Qwen3.6-27B-NVFP4-FULL
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
