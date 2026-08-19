# Ishowbackup/gemma-4-31B-it-uncensored

## Resumen

`Ishowbackup/gemma-4-31B-it-uncensored` es una versión modificada del modelo `google/gemma-4-31B-it` de Google, creada mediante una técnica de abliteration denominada *norm-preserving biprojected abliteration*. El objetivo es eliminar el comportamiento de rechazo (refusal) del modelo original, de modo que responda a peticiones que normalmente serían denegadas por políticas de seguridad. El autor, Ishowbackup, publica este modelo con licencia Apache 2.0 y lo presenta como un recurso para investigación en seguridad y alineación de modelos.

El modelo mantiene la arquitectura base de Gemma 4 (transformer, 31.273 millones de parámetros) y aplica una modificación de pesos que proyecta la dirección de rechazo fuera de las capas de atención y MLP, preservando la norma de los pesos para minimizar la degradación de calidad. Según la model card, la tasa de rechazo se reduce de 100/100 a 1/100 en un conjunto de 100 prompts, y la divergencia KL respecto al modelo base es de 0.124, lo que sugiere un cambio controlado.

Este modelo es relevante para investigadores que estudian comportamientos de rechazo, alineación y técnicas de eliminación de censura, así como para desarrolladores que necesitan un modelo sin restricciones en entornos controlados. No obstante, su uso en producción conlleva riesgos importantes de generar contenido dañino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de google/gemma-4-31B-it) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer denso con 31.273 millones de parámetros. La modificación principal es una abliteration norm-preserving biprojected, descrita en el blog de grimjim (noviembre 2025). El proceso consiste en:

1. Cargar el modelo en bf16 con adaptadores LoRA en `o_proj` y `mlp.down_proj`.
2. Recopilar activaciones residuales de 400 prompts dañinos y 400 benignos (datasets de mlabonne).
3. Aplicar winsorización al 99.5 percentil para mitigar activaciones atípicas de GeGLU.
4. Calcular por capa la dirección de rechazo como `normalize(mean(harmful) - mean(harmless))`.
5. Ortogonalizar cada dirección contra la media de los benignos (doble paso Gram-Schmidt).
6. Modificar los pesos de `o_proj` y `down_proj` de todas las capas, proyectando la dirección de rechazo solo en el componente direccional y recombinando con la magnitud original, garantizando `||W_new|| = ||W_orig||`.
7. Fusionar los adaptadores LoRA en los pesos base.

No se proporcionan detalles sobre el dataset de entrenamiento original del modelo base ni sobre el proceso de entrenamiento supervisado. La técnica de abliteration no requiere entrenamiento adicional; solo ajusta los pesos existentes.

## Capacidades

- Generación de texto conversacional: responde a instrucciones y mantiene diálogos multi-turno (heredado del modelo base).
- Razonamiento y conocimiento general: capacidades propias de Gemma 4 31B, aunque no se especifican detalles en la documentación.
- Respuesta sin rechazo: el modelo responde a peticiones que el modelo base rechazaría, incluyendo contenido potencialmente dañino.
- Multilingüe: la model card indica solo inglés, aunque el modelo base podría soportar más idiomas; no se confirma.
- Sin soporte explícito de tool calling, visión o audio en la documentación, aunque el modelo base tiene tags de image-text-to-text; no se detalla su funcionamiento tras la modificación.

## Casos de uso

- Investigación en seguridad y alineación: estudiar cómo los modelos aprenden a rechazar peticiones y qué direcciones internas codifican ese comportamiento. El modelo permite analizar los efectos de la abliteration en la activación de neuronas y en la calidad de las respuestas.
- Evaluación de técnicas de des-censura: comparar el rendimiento de este modelo con otras variantes abliteradas (p. ej., usando heretic) para validar metodologías.
- Pruebas de robustez en generación de contenido: verificar si el modelo mantiene coherencia y utilidad en dominios donde el modelo base se niega a responder (p. ej., escritura creativa con temas sensibles).
- Desarrollo de sistemas de moderación: usar el modelo como generador de ejemplos adversarios para entrenar clasificadores de contenido dañino.
- Análisis de sesgos y estereotipos: explorar si la eliminación del rechazo revela sesgos latentes que el modelo base oculta tras negativas.
- Entornos de investigación con sandbox: desplegar el modelo en laboratorios aislados para estudiar comportamientos extremos sin riesgo de exposición pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas específicas sobre la reducción de rechazos:

| Métrica | Antes | Después |
|---|---|---|
| Rechazos (mlabonne, 100 prompts) | 100/100 | 1/100 efectivo (5 marcados, 4 rechazo-luego-cumple) |
| Rechazos (cross-dataset, 686 prompts) | — | 22/686 (3.2%) |
| Divergencia KL | 0 (baseline) | 0.124 |
| Ratio de longitud de respuestas (calidad) | 1.0 | ~1.01 (sin degradación) |

Validación cruzada en 4 datasets independientes:

| Dataset | Prompts | Rechazos |
|---|---|---|
| JailbreakBench | 100 | 5/100 |
| tulu-harmbench | 320 | 5/320 |
| NousResearch/RefusalDataset | 166 | 7/166 |
| mlabonne/harmful_behaviors | 100 | 5/100 |
| **Total** | **686** | **22/686 (3.2%)** |

Estos datos indican que el modelo mantiene una calidad de respuesta similar al original (ratio de longitud ~1.01) y reduce drásticamente los rechazos, aunque persisten algunos casos de rechazo parcial.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~62.5 GB (31.273M parámetros × 2 bytes). Requiere GPU de servidor como A100 80GB, H100 80GB o 2× RTX 4090 (24GB cada una) con tensor parallelism.
- Con cuantización 4-bit (GPTQ/AWQ): ~16 GB, cabe en una RTX 4090 o A10G. No se proporcionan archivos cuantizados en el repo, pero es posible generarlos con herramientas como llama.cpp o AutoGPTQ.
- Con cuantización 8-bit: ~31 GB, cabe en una RTX 3090/4090 (24GB no es suficiente, se necesitaría 2× o una A6000 de 48GB).
- Opciones de despliegue: transformers (con device_map="auto"), vLLM, TGI, llama.cpp (si se convierte a GGUF). El repo solo incluye safetensors, por lo que habría que convertirlos para usar en llama.cpp.
- Latencia y throughput: no disponibles. Para un modelo de 31B en bf16 en una A100, se estiman ~10-20 tokens/s en generación, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. La alternativa más directa es el modelo base `google/gemma-4-31B-it`, que sí tiene rechazos. Otros modelos abliterados conocidos (p. ej., `mlabonne/abliterated-llama-3-70b`) tienen tamaños y arquitecturas diferentes. Se recomienda consultar benchmarks externos para una comparación justa.

| Modelo | Parámetros | Contexto | Licencia | Refusals (mlabonne 100) |
|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 31.273M | No disponible | Gemma license | 100/100 |
| Ishowbackup/gemma-4-31B-it-uncensored | 31.273M | No disponible | Apache 2.0 | 1/100 |

## Limitaciones y advertencias

- El modelo puede generar contenido dañino, ilegal o éticamente cuestionable, ya que su propósito es eliminar los rechazos. No debe usarse en producción sin filtros adicionales de seguridad.
- La abliteration no elimina todos los rechazos: persiste un 3.2% de rechazos en datasets cruzados, y algunos son "rechazo-luego-cumple" (el modelo añade un descargo y responde).
- No se ha evaluado el rendimiento en tareas estándar (razonamiento, código, matemáticas) tras la modificación. La divergencia KL de 0.124 sugiere cambios, pero no se conoce el impacto en calidad.
- El modelo solo está documentado para inglés; no se garantiza su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar términos de servicio de plataformas o leyes locales.
- El repo no incluye archivos GGUF ni cuantizaciones listas para usar; los usuarios deben convertirlos.
- No hay información sobre la longitud de contexto soportada; se asume la del modelo base, pero no se confirma.

## Enlaces

- HuggingFace: https://huggingface.co/Ishowbackup/gemma-4-31B-it-uncensored
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Blog sobre norm-preserving biprojected abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Repo de investigación (código y experimentos): https://github.com/TrevorS/gemma-4-abliteration
- Datasets utilizados: [JailbreakBench](https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors), [tulu-harmbench](https://huggingface.co/datasets/allenai/tulu-3-harmbench-eval), [NousResearch/RefusalDataset](https://huggingface.co/datasets/NousResearch/RefusalDataset), [mlabonne/harmful_behaviors](https://huggingface.co/datasets/mlabonne/harmful_behaviors)
