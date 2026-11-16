# BoldingBuilds/Wildcat-d3-ultra-bf16

## Resumen

Wildcat-d3-ultra-bf16 es un modelo de decisión (decision model) derivado de `vllm-sr/d3-ultra`, publicado por BoldingBuilds. No es un modelo generativo de propósito general: su tarea es clasificar y puntuar opciones dentro de un proceso de decisión estructurado, emitiendo probabilidades sobre un conjunto de alternativas. El repositorio se presenta como la versión en pesos bf16 del paquete cuantizado a 3 bits `Wildcat-d3-ultra-3bit`, con el mismo layout exacto que el modelo base para poder cargarse con el runtime original de d3-ultra sin código adicional.

El modelo tiene 26.085.330.160 parámetros (unos 26,1 mil millones) y un tamaño de repositorio de 52,2 GB en safetensors, lo que concuerda con pesos bf16. Incorpora un LoRA de reparación fusionado en los pesos, entrenado con etiquetas de Fastino GLiDE, lo que condiciona la licencia: los pesos y el runtime de d3-ultra son Apache-2.0, pero el modelo resultante queda bajo la Fastino Community License.

Su relevancia es acotada pero específica: sirve como referencia en bf16 para validar y reproducir el comportamiento del paquete a 3 bits, y como artefacto para tarjetas con unos 54 GB de memoria disponibles. La model card reporta un índice público Decision Index 0.3 de 70,66 sobre 140.178 peticiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bloques Linear empaquetados (400 Linears empaquetados en el paquete 3-bit) y torre de visión; runtime propio `d3_engine`/`modeling_d3`; tag de librería `qwen3_5` |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (este repositorio); existe variante de 3 bits en `BoldingBuilds/Wildcat-d3-ultra-3bit` |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (pesos y runtime de d3-ultra: Apache-2.0) |
| Formato de pesos | safetensors (11 shards, con `model.safetensors.index.json` de d3-ultra) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de d3-ultra, un transformer con 400 capas Linear empaquetadas en el paquete 3-bit y una torre de visión, más embeddings, norms y un módulo de readout. Wildcat no introduce cambios estructurales: los 11 shards replican nombres de fichero, nombres de tensor, formas y dtypes del índice de d3-ultra, y los ficheros de runtime (`d3_*.py`, `modeling_d3.py`, `pipeline_d3.py`, `requirements.txt`) son byte a byte idénticos a los del modelo base.

El proceso de construcción consiste en descomprimir cada una de las 400 capas Linear con el kernel propio de `d3_q3.py`, fusionar el LoRA con la expresión `(w.float() + B.float() @ A.float()).to(bfloat16)` y copiar sin cambios el resto de tensores. El LoRA de reparación se entrenó con etiquetas generadas por Fastino GLiDE. Las comprobaciones publicadas indican que 157 de 975 millones de pesos en 14 capas reconstruidas difieren en un paso de redondeo bf16 (máximo 0,00012), y que en el conjunto del modelo difieren 4.124 de 24,3 mil millones de pesos. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación zero-shot y puntuación de opciones dentro de un pipeline de decisión (pipeline declarado: `zero-shot-classification`).
- Emisión de probabilidades por alternativa, con diferencias máximas de 0,013 frente a la ejecución publicada de Wildcat en la validación realizada.
- Extracción de características (`feature-extraction`), según los tags del repositorio.
- Procesamiento multimodal: el repositorio incluye torre de visión copiada de d3-ultra, aunque no se detallan sus capacidades concretas.
- Integración con el runtime de d3-ultra mediante `python -m decision_index run --engine d3_engine:D3Engine --option model=wildcat-bf16`.
- Compatibilidad con endpoints (`endpoints_compatible` según tags).
- Tool calling, razonamiento multi-paso, modo thinking, audio y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de decisiones automatizadas: el modelo puntúa un conjunto cerrado de opciones y devuelve probabilidades, adecuado para sistemas de enrutamiento o selección donde se necesita una distribución sobre alternativas en lugar de texto libre.
- Validación de la variante cuantizada: al ser el mismo modelo en bf16 con layout idéntico, sirve para comparar respuestas del paquete de 3 bits y detectar degradación por cuantización en un despliegue real.
- Reproducción de resultados de investigación: permite repetir la ejecución del Decision Index 0.3 sin depender de kernels Triton ni de descompresión en carga, útil para auditorías.
- Clasificación zero-shot en pipelines de datos: etiquetado de registros contra categorías definidas en tiempo de inferencia, con el pipeline `zero-shot-classification` de transformers.
- Extracción de características para sistemas de ranking: el modelo puede alimentar una etapa posterior de scoring usando sus representaciones internas.
- Despliegue en hardware de gama alta con runtime propio: entornos con GPU de más de 72 GB o con aproximadamente 54 GB libres para los pesos bf16, usando el motor `d3_engine` sin dependencias extra.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Decision Index 0.3 (índice público) | 70,66 | 140.178 peticiones, ejecución completa del paquete de 3 bits en RTX PRO 6000 usando esta ruta bf16 |
| Consistencia de respuestas | 30 de 30 idénticas | 23 peticiones de Decision Index 0.3 de 23 benchmarks, ejecutadas en CPU con `d3_runtime` |
| Diferencia máxima de probabilidad | 0,013 | Frente a la ejecución publicada de Wildcat |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos, según la propia model card; el repositorio ocupa 52,2 GB.
- GPU recomendadas para bf16: tarjetas con más de 72 GB (la model card menciona este umbral para el flujo de descompresión y fusión) o con capacidad suficiente para alojar los pesos bf16.
- Para tarjetas de 24 GB existe la variante de 3 bits `BoldingBuilds/Wildcat-d3-ultra-3bit`.
- Despliegue: runtime propio de d3-ultra (`decision_index` con `d3_engine:D3Engine`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Wildcat-d3-ultra-bf16 | 26,1 B | no disponible | safetensors bf16 | Fastino Community License | Índice Decision Index 0.3 de 70,66 |
| Wildcat-d3-ultra-3bit | no disponible | no disponible | 3 bits empaquetado | Fastino Community License | Misma funcionalidad, pensado para 24 GB |
| vllm-sr/d3-ultra | no disponible | no disponible | safetensors | Apache-2.0 (pesos y runtime) | Modelo base; Wildcat es un finetune con LoRA fusionado |

No se dispone de datos de benchmarks de los modelos comparados en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de decisión, no de generación abierta: no está pensado para chat, código ni matemáticas; usarlo fuera de su tarea produce resultados no validados.
- Dependencia del runtime propietario de d3-ultra: requiere `decision_index` y los ficheros `d3_*.py`; no es un modelo transformers estándar pese al tag de librería.
- Licencia restrictiva: la Fastino Community License sustituye a la Apache-2.0 del modelo base por el LoRA de reparación entrenado con etiquetas de Fastino GLiDE; hay que revisar sus términos antes de uso comercial.
- Idiomas soportados no documentados: no se puede garantizar comportamiento multilingüe.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al derivar de etiquetas de un profesor (Fastino GLiDE) puede heredar sus sesgos.
- Diferencias numéricas mínimas frente al modelo base por redondeo fp32/fp64 en la fusión del LoRA (4.124 de 24,3 mil millones de pesos afectados, un paso de bf16).
- Repositorio sin descargas ni likes y creado en 2026-11-16: ecosistema y soporte comunitario inexistentes por el momento.
- El tamaño de contexto no está especificado, lo que impide planificar cargas con entradas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BoldingBuilds/Wildcat-d3-ultra-bf16
- Variante de 3 bits: https://huggingface.co/BoldingBuilds/Wildcat-d3-ultra-3bit
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Licencia Fastino: https://huggingface.co/BoldingBuilds/Wildcat-d3-ultra-bf16/blob/main/LICENSES/FASTINO-LICENSE.txt
- Resultados del Decision Index: https://huggingface.co/datasets/BoldingBuilds/decision-index-results/blob/e9b888cadd8fc31344a0933d8950f277986963b6/runs/wildcat/scores.json
