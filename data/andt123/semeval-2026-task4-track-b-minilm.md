# andt123/semeval-2026-task4-track-b-minilm

## Resumen

El modelo `andt123/semeval-2026-task4-track-b-minilm` es un encoder MiniLM afinado (fine-tuned) para la tarea de similitud narrativa de SemEval 2026, Task 4, Track B. Lo publica el usuario de Hugging Face andt123 como artefacto reproducible de un experimento registrado en Weights & Biases (run `nc58jfek`), con un 61,5 % de accuracy en el conjunto de desarrollo. Se trata de un encoder BERT de tipo MiniLM con tamaño oculto de 384 y 22.713.216 parámetros totales, empaquetado en safetensors y consumible con `transformers` mediante `AutoModel` y `AutoTokenizer`.

Su relevancia es acotada: no es un modelo generativo ni un asistente conversacional, sino un extractor de características (`feature-extraction`) pensado para producir embeddings de frases o textos y calcular similitud semántica entre narrativas. Resulta útil como referencia de reproducción para participantes de SemEval 2026 y como encoder ligero para tareas de similitud textual en entornos con recursos limitados.

Conviene subrayar que el envío oficial de Track B descrito en el artículo del sistema empleaba un encoder MPNet multi-vista, no este MiniLM. Este repositorio corresponde, por tanto, a una variante experimental secundaria y no al modelo principal del equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM), hidden size 384 |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors en FP32/FP16 sin variantes publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia MiniLM, con tamaño oculto de 384, destilado originalmente de arquitecturas BERT y reentrenado aquí mediante fine-tuning para la tarea de similitud narrativa de SemEval 2026 Task 4 Track B. El repositorio contiene seis ficheros de checkpoint copiados desde la imagen `semeval-track-b-model:v2`, junto con el tokenizer, y se carga directamente con `AutoModel.from_pretrained` y `AutoTokenizer.from_pretrained`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. El único dato de rendimiento declarado es el 61,5 % de accuracy en desarrollo reportado en el run de W&B `nc58jfek`. El envío oficial del equipo utilizó un encoder MPNet multi-vista, por lo que este MiniLM debe considerarse una ablación o alternativa ligera del sistema principal.

## Capacidades

- Extracción de embeddings de texto para similitud semántica y narrativa (pipeline `feature-extraction`).
- Codificación de pares de textos para tareas de matching o ranking por similitud.
- Integración con Transformers (`AutoModel`, `AutoTokenizer`) y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni modales adicionales (visión, audio).

## Casos de uso

- Reproducción de experimentos de SemEval 2026 Task 4 Track B: cargar el checkpoint y evaluar sobre el split de desarrollo para contrastar el 61,5 % de accuracy declarado.
- Baseline ligero de similitud narrativa: usar los embeddings de 384 dimensiones como referencia rápida frente a encoders de mayor tamaño como MPNet.
- Búsqueda semántica de documentos: indexar narrativas o textos breves y recuperar por similitud coseno aprovechando el bajo coste computacional del encoder.
- Deduplicación de textos: detectar pares casi idénticos en corpus mediante umbrales de similitud sobre los embeddings generados.
- Clasificación downstream por transferencia: congelar el encoder y entrenar una cabeza ligera para tareas de matching o ranking.
- Despliegue en CPU o GPUs modestas: al tener 22,7 M de parámetros, es viable servirlo con Text Embeddings Inference en entornos con recursos limitados.
- Componente de pipelines de evaluación: integrarlo como encoder de referencia en comparativas internas de modelos de similitud.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| SemEval 2026 Task 4 Track B (dev accuracy) | 61,5 % | Reportado en el run W&B `nc58jfek` |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (22,7 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también ejecutable en CPU sin problema.
- Cabe en GPUs consumer (RTX 3060, RTX 4090, etc.) y en hardware de gama baja.
- Opciones de despliegue: Transformers, Text Embeddings Inference (tag declarado), Hugging Face Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| andt123/semeval-2026-task4-track-b-minilm | 22,7 M | no disponible | no disponible | Encoder MiniLM afinado para SemEval 2026 Task 4 Track B; 61,5 % dev accuracy |
| Encoder MPNet multi-vista (envío oficial del equipo) | no disponible | no disponible | no disponible | Modelo principal descrito en el artículo del sistema |
| MiniLM-L6-v2 (base de referencia) | ~22,7 M | 512 tokens (típico en MiniLM) | Apache 2.0 (habitual en MiniLM) | Encoder generalista de similitud; no específico de la tarea |

Los datos de los modelos comparables no están confirmados en la información proporcionada; se indican como referencia orientativa y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para chat, razonamiento o generación de código.
- El 61,5 % de accuracy en desarrollo es modesto y corresponde a un único run; no hay validación en test publicada en la ficha.
- No es el modelo del envío oficial: el artículo del sistema emplea un MPNet multi-vista, por lo que los resultados de este checkpoint no representan el sistema final.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas soportados no declarados: se desconoce la cobertura multilingüe real.
- Longitud de contexto no especificada: debe verificarse antes de usarlo con textos largos.
- Riesgo de sesgos y alucinación no evaluado en la información disponible.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): modelo de escasa tracción y sin garantías de mantenimiento.
- Los resultados de la búsqueda web no aportan información técnica relevante sobre el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/andt123/semeval-2026-task4-track-b-minilm
- Artículo del sistema: https://aclanthology.org/2026.semeval-1.353/
- Repositorio del proyecto: https://github.com/dinhthienan33/SemEval2026-Task4-ttda704
- Run de Weights & Biases: https://wandb.ai/22520010-uit/semeval-track-b/runs/nc58jfek
