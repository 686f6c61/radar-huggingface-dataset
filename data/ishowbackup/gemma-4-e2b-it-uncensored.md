# Ishowbackup/gemma-4-E2B-it-uncensored

## Resumen

El modelo `Ishowbackup/gemma-4-E2B-it-uncensored` es una versión modificada de `google/gemma-4-E2B-it`, un modelo de lenguaje multimodal de la familia Gemma 4, desarrollada por el usuario Ishowbackup mediante una técnica de *abliteration* que elimina el comportamiento de rechazo (refusals) del modelo original. El objetivo es ofrecer un asistente conversacional sin restricciones de seguridad, capaz de responder a peticiones que el modelo base rechazaría por defecto. El proceso de abliteration se basa en la proyección de direcciones de rechazo por capa, preservando las magnitudes de los pesos para minimizar la degradación de la calidad.

El modelo tiene 5.123 millones de parámetros (5,12B) y está disponible en formato safetensors bajo licencia Apache 2.0. Al ser una variante *uncensored*, su relevancia radica en aplicaciones de investigación sobre seguridad en IA, generación creativa sin filtros o pruebas de robustez, aunque con importantes advertencias éticas y legales. No se especifica la longitud de contexto ni la arquitectura exacta más allá de ser un transformer multimodal (image-text-to-text), por lo que estos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Gemma 4 (detalle exacto no disponible) |
| Parametros totales | 5.123.178.051 (5,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (repo en bf16, safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un transformer multimodal de la familia Gemma 4, que procesa tanto texto como imágenes (según los tags de HuggingFace). El proceso de *abliteration* aplicado por Ishowbackup no reentrena el modelo, sino que modifica los pesos directamente mediante una técnica denominada *norm-preserving biprojected abliteration* (propuesta por grimjim en noviembre de 2025). Este método descompone cada fila de pesos en una magnitud y una dirección, proyecta fuera la dirección de rechazo solo en el componente direccional y recombina con la magnitud original, garantizando que la norma de los pesos no cambie (`||W_new|| = ||W_orig||`).

El pipeline incluye: carga del modelo en bf16 con adaptadores LoRA en `o_proj` y `mlp.down_proj`, recolección de activaciones residuales para 400 prompts dañinos y 400 inofensivos (procedentes de datasets de mlabonne), winsorización de activaciones al percentil 99,5 para controlar valores atípicos de GeGLU, cálculo de una dirección de rechazo por capa (normalizada como la diferencia entre medias de activaciones dañinas e inofensivas), ortogonalización mediante doble paso de Gram-Schmidt, y modificación de pesos en todas las capas con escala 1,0. Finalmente se fusionan los adaptadores LoRA en los pesos base. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Generación de texto conversacional en inglés, con capacidad de mantener diálogos multi-turno.
- Procesamiento multimodal: acepta entradas de imagen y texto (según tags de HuggingFace), aunque no se detalla el tipo de tareas visuales soportadas.
- Respuesta sin rechazo: el modelo ha sido diseñado para responder a peticiones que el base rechazaría, incluyendo contenido potencialmente dañino o no seguro.
- No se especifica soporte para tool calling, function calling, ni modos de razonamiento especiales (thinking mode).
- Capacidades multilingües limitadas al inglés (según la model card).

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comportan los sistemas sin mecanismos de rechazo, por ejemplo para evaluar la eficacia de técnicas de alineación o desarrollar defensas contra jailbreaks.
- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o controvertidos sin censura automática.
- Pruebas de robustez de sistemas de moderación: se puede usar como generador de contenido adversarial para entrenar clasificadores de contenido dañino.
- Desarrollo de asistentes especializados en dominios sensibles (por ejemplo, educación sexual, salud mental) donde el modelo base podría rechazar preguntas legítimas.
- Benchmarking de técnicas de abliteration: comparar la calidad y la tasa de rechazo entre el modelo base y esta variante para validar metodologías.
- Evaluación de la degradación de la calidad tras la modificación de pesos, midiendo métricas como la divergencia KL o la longitud de las respuestas.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí resultados específicos del proceso de abliteration:

| Métrica | Antes | Después |
|---|---|---|
| Refusals (mlabonne, 100 prompts) | 98/100 | 1/100 |
| Refusals (cross-dataset, 686 prompts) | — | 3/686 (0,4%) |
| KL Divergence | 0 (baseline) | 0,346 |
| Calidad (ratio de longitud de respuesta inofensiva) | 1,0 | ~1,01 (sin degradación) |

Validación cruzada en 4 datasets independientes:

| Dataset | Prompts | Refusals |
|---|---|---|
| JailbreakBench (JBB-Behaviors) | 100 | 0/100 |
| tulu-harmbench | 320 | 1/320 |
| NousResearch/RefusalDataset | 166 | 0/166 |
| mlabonne/harmful_behaviors | 100 | 2/100 |
| **Total** | **686** | **3/686 (0,4%)** |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,12B parámetros en bf16 (2 bytes por parámetro), se necesitan aproximadamente 10,2 GB solo para los pesos, más overhead de activaciones y caché KV. En FP32 serían ~20,5 GB. Con cuantización Q4 (4 bits) se reduciría a ~2,6 GB.
- GPU recomendadas: para bf16, una GPU con al menos 12 GB de VRAM (RTX 3060 12GB, RTX 4070, A10, L4). Para cuantización Q4, cabría en GPUs de 4-6 GB (RTX 3050, GTX 1660). No se recomienda para GPUs de menos de 4 GB sin cuantización extrema.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con Transformers, puede usarse con vLLM, TGI o directamente con `transformers`. Para GGUF (si se convierte), se podría usar llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa, un modelo de 5B en una RTX 4090 suele generar entre 20-40 tokens/s en bf16, y más con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusals (mlabonne) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (base) | 5,12B | No disponible | 98/100 | Apache 2.0 | HuggingFace |
| Ishowbackup/gemma-4-E2B-it-uncensored | 5,12B | No disponible | 1/100 | Apache 2.0 | HuggingFace |
| Dolphin 2.9 (Llama 3 8B) | 8B | 8K | No disponible | Llama 3 license | HuggingFace |

La comparativa se limita al modelo base y a alternativas generales *uncensored* como Dolphin, pero no se dispone de datos de rendimiento estándar para una comparación cuantitativa completa.

## Limitaciones y advertencias

- El modelo ha sido diseñado para eliminar el rechazo, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin advertencia previa. Su uso en producción requiere medidas de moderación externas.
- No se han evaluado sesgos del modelo base ni de la versión abliterada; es probable que herede sesgos del entrenamiento original de Gemma 4.
- Riesgo de alucinación: al ser un modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- La longitud de contexto no está especificada, lo que dificulta planificar tareas que requieran ventanas largas.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad legal y ética del contenido generado.
- El proceso de abliteration puede degradar sutilmente la calidad en ciertas tareas (la KL divergence de 0,346 indica que las distribuciones de salida han cambiado), aunque la model card afirma que no hay degradación perceptible en la longitud de las respuestas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Ishowbackup/gemma-4-E2B-it-uncensored)
- [Modelo base google/gemma-4-E2B-it](https://huggingface.co/google/gemma-4-E2B-it)
- [Blog de grimjim sobre norm-preserving biprojected abliteration](https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration)
- [Repo de reproducción (TrevorS/gemma-4-abliteration)](https://github.com/TrevorS/gemma-4-abliteration)
- [Dataset JailbreakBench](https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors)
- [Dataset tulu-harmbench](https://huggingface.co/datasets/allenai/tulu-3-harmbench-eval)
- [Dataset NousResearch/RefusalDataset](https://huggingface.co/datasets/NousResearch/RefusalDataset)
- [Dataset mlabonne/harmful_behaviors](https://huggingface.co/datasets/mlabonne/harmful_behaviors)
