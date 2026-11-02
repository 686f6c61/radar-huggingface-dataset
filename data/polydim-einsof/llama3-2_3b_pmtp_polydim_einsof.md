# Polydim-Einsof/llama3.2_3b_PMTP_polydim_einsof

## Resumen

`llama3.2_3b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel García Traba bajo la iniciativa POLYDIM-EINSOF / EinsofOS. Se construye sobre el modelo base `meta-llama/Llama-3.2-3B` de Meta y se presenta como una implementación del protocolo PMTP (Polydim Memory Transfer Protocol), que proyecta los estados ocultos del transformer sobre la variedad de Stiefel St(1024, 3072) en lugar de serializar la comunicación entre pasos de razonamiento como tokens de texto. El autor lo describe como un mecanismo de "razonamiento latente" que consume cero tokens en el razonamiento inter-paso.

El repositorio incluye únicamente los pesos del adaptador (matriz de proyección en FP64) y su configuración, no un modelo completo. El pipeline declarado es `feature-extraction`, no `text-generation`, y el tamaño del repositorio es de 0,0 GB. La model card introduce un parámetro `turing_depth` (0 a 50) que controla el número de pasos de proyección iterativa sobre la variedad, con modos que van desde el bypass identidad hasta la "explosión Turing profunda".

La relevancia del modelo es cuestionable desde el punto de vista de la ingeniería de producción: no hay benchmarks publicados, cero descargas, cero likes, y la terminología empleada (protocolo Turing, gusano 1D, explosión Turing) no se corresponde con literatura revisada por pares indexada en los repositorios habituales de IA. Se debe tratar como una propuesta de investigación especulativa, no como un modelo listo para uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer decoder (Llama 3.2 3B) con proyección sobre variedad de Stiefel St(1024, 3072) |
| Parametros totales | No disponible (el adaptador es una matriz de proyección; el modelo base tiene 3,21 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en FP64; el modelo base admite las cuantizaciones habituales de Llama 3.2) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`), `adapter_config.json`, `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se describe como una matriz de proyección W en IEEE-754 FP64 que mapea estados ocultos de dimensión 3072 a 1024, manteniéndolos sobre la variedad de Stiefel (matrices de columnas ortonormales). El autor afirma un defecto máximo de ortogonalidad de 1,11e-15 en FP64 y un error de norma de Neumaier inferior a 1e-15. El mecanismo de "razonamiento" consiste en aplicar iterativamente esta proyección (`turing_depth` pasos) con contracción riemanniana y autocrítica adversarial, sin generar tokens intermedios.

No se proporciona información sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo RLHF, DPO o ajuste supervisado, ni cómo se obtuvo la matriz de proyección. La model card no documenta el procedimiento de calibración del adaptador más allá de las métricas de ortogonalidad y latencia declaradas. No hay paper revisado por pares en los enlaces proporcionados; los DOIs de Zenodo y HAL apuntan a preprints del propio autor.

## Capacidades

- Proyección de estados ocultos sobre la variedad de Stiefel con precisión FP64.
- Parámetro `turing_depth` (alias `einsof_depth`, `turing`, `einsof`) con cinco modos operativos: bypass identidad, reflexión rápida, deliberación red-team, y explosión Turing profunda (hasta 50 pasos).
- Razonamiento latente inter-paso sin consumo de tokens (según el autor).
- Integración declarada con Hugging Face (vía `adapter_model.safetensors`) y con Ollama (vía `Modelfile` con temperatura calibrada a 0,07).
- Capacidades de generación de texto, código o matemáticas: no documentadas explícitamente; dependerían del modelo base Llama 3.2 3B, pero el pipeline declarado es `feature-extraction`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: el autor lo presenta como el núcleo del adaptador, pero sin evidencia empírica publicada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre representaciones latentes: el adaptador puede usarse para experimentar con proyecciones ortonormales de estados ocultos en un transformer pequeño, comparando la dinámica de la variedad de Stiefel frente a la comunicación basada en tokens.
- Reproducción de experimentos de razonamiento latente: útil para grupos que quieran replicar o refutar las métricas de latencia y ortogonalidad declaradas por el autor (16,92 ms a profundidad 1, 26,16 ms a profundidad 10).
- Extracción de características geométricas: al declararse como `feature-extraction`, puede emplearse para obtener representaciones de dimensión 1024 con estructura ortonormal, útiles en tareas de análisis de embeddings.
- Docencia y divulgación: sirve como ejemplo didáctico de proyecciones sobre variedades de Stiefel aplicadas a modelos de lenguaje, con código y configuración explícitos.
- Pruebas de concepto en entornos controlados: para evaluar si la eliminación de la serialización de tokens intermedios reduce latencia en pipelines de razonamiento multi-paso.
- Auditoría de afirmaciones técnicas: útil para la comunidad que quiera verificar de forma independiente las métricas de FP64 y los DOIs asociados antes de citar el trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo incluye métricas internas de latencia y precisión numérica:

| Metrica | Valor declarado |
|---|---|
| Latencia a turing_depth = 1 | 16,92 ms |
| Latencia a turing_depth = 10 | 26,16 ms |
| Defecto de ortogonalidad máximo (FP64) | 1,11e-15 |
| Error de norma de Neumaier | ≤ 1e-15 |
| Tokens consumidos en razonamiento inter-paso | 0 |

No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador (matriz de proyección de 3072×1024 en FP64, aproximadamente 25 MB); el modelo base Llama 3.2 3B requiere unos 6-7 GB en FP16 y unos 2-3 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con soporte FP64 razonable para el adaptador (A100, H100); para el modelo base, RTX 4090, RTX 3090, A10, L4.
- Cabe en GPU de consumo: sí, el modelo base Llama 3.2 3B cabe en GPUs de 8 GB o más en cuantización de 4 bits.
- Opciones de despliegue: Ollama (se incluye `Modelfile`), Hugging Face Transformers (vía `adapter_model.safetensors`). No se documenta soporte para vLLM, TGI o llama.cpp.
- Latencia y throughput: solo se declaran las latencias del adaptador (16,92 ms y 26,16 ms); no hay datos de throughput del modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llama3.2_3b_PMTP_polydim_einsof | Adaptador sobre 3,21 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Feature-extraction, sin benchmarks |
| meta-llama/Llama-3.2-3B | 3,21 B | 128 K (según Meta) | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base; benchmarks públicos |
| Qwen2.5-3B | 3,09 B | 32 K (128 K en variantes) | Apache 2.0 | Hugging Face | Alternativa abierta con benchmarks publicados |
| Phi-3.5-mini | 3,82 B | 128 K | MIT | Hugging Face | Enfoque en razonamiento y código |

La comparación directa es difícil porque el adaptador no es un modelo generativo completo y no publica resultados de evaluación. Frente a Llama 3.2 3B, Qwen2.5-3B o Phi-3.5-mini, carece de benchmarks verificables y de adopción comunitaria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia empírica de que el adaptador mejore ninguna tarea respecto al modelo base.
- Cero descargas y cero likes en Hugging Face: no hay validación comunitaria ni informes de uso independientes.
- Terminología no estándar ("gusano 1D", "explosión Turing", "protocolo Turing") que no se corresponde con literatura revisada por pares; los DOIs apuntan a preprints del propio autor.
- El pipeline declarado es `feature-extraction`, no `text-generation`: no está claro que el adaptador produzca texto coherente.
- No se documenta el proceso de entrenamiento, los datos utilizados ni el procedimiento de calibración de la matriz de proyección.
- Riesgo de alucinación: no evaluado; el modelo base Llama 3.2 3B presenta alucinaciones conocidas y el adaptador no documenta mitigaciones.
- Idiomas soportados: no disponibles; se desconoce si el adaptador preserva las capacidades multilingües del modelo base.
- Licencia Apache 2.0 declarada, pero el modelo base Llama 3.2 está sujeto a la Llama 3.2 Community License, que impone restricciones adicionales (por ejemplo, la cláusula de "construido con Llama" y límites de uso). Es necesario verificar la compatibilidad antes de uso comercial.
- El repositorio tiene 0,0 GB: no incluye los pesos del modelo base, solo el adaptador.
- Precisión FP64: en GPUs de consumo el rendimiento FP64 es muy bajo (por ejemplo, RTX 4090 tiene FP64 limitado), lo que puede invalidar las latencias declaradas en hardware no profesional.

## Enlaces

- Hugging Face: https://huggingface.co/Polydim-Einsof/llama3.2_3b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- DOI primario (Zenodo): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo): https://doi.org/10.5281/zenodo.21209973
- HAL Open Science: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Dataset de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
- Jxiv (Japón): Jxiv ID 7040 (no se proporciona URL directa)
