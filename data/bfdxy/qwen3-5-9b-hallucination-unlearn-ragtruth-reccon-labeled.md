# bfdxy/Qwen3.5-9B-hallucination-unlearn-ragtruth-reccon-labeled

## Resumen

Qwen3.5-9B-hallucination-unlearn-ragtruth-reccon-labeled es un ajuste fino del modelo base Qwen/Qwen3.5-9B publicado por el usuario bfdxy en Hugging Face. Se trata de un modelo multimodal (pipeline image-text-to-text) de aproximadamente 9.400 millones de parámetros cuyo objetivo es reducir las alucinaciones en tareas de resumen de noticias sobre contexto recuperado (RAG). El autor lo presenta como un reemplazo directo del modelo original: mantiene los mismos 775 tensores (nombres, formas y dtypes), el mismo `config.json`, tokenizer, chat template y ficheros de procesador, por lo que carga con `transformers` y con vLLM igual que el modelo base.

La relevancia del modelo radica en su enfoque técnico: en lugar de un ajuste supervisado convencional, aplica una técnica de *unlearning* basada en una pérdida triple (entropía cruzada sobre el prefijo, entropía cruzada negativa sobre el span alucinado y entropía cruzada sobre la continuación limpia anclada) sobre resúmenes generados por el propio Qwen3.5-9B de 139 artículos del split de entrenamiento de RAGTruth, con los spans alucinados etiquetados mediante ReCCon. El resultado declarado por el autor es una reducción de la tasa de resúmenes con alucinaciones del 22,7 % al 1,3 % en su conjunto de test interno de 150 prompts, manteniendo el rendimiento general en benchmarks de propósito general.

El modelo está publicado bajo licencia Apache 2.0, pesa 19,3 GB en el repositorio y fue creado el 24 de noviembre de 2026. No cuenta con descargas ni likes en el momento de la consulta, y no se declaran idiomas soportados de forma explícita. Es un modelo orientado a investigación y evaluación de técnicas de mitigación de alucinaciones en pipelines RAG, más que a un despliegue generalista inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5-9B; incluye torre de visión y cabeza MTP (multi-token prediction) heredadas del modelo base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; el autor no detalla cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (775 tensores, mismos nombres, formas y dtypes que el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de visión y una cabeza MTP (multi-token prediction) que se mantiene intacta respecto al original. El ajuste fino conserva la estructura exacta del repositorio base: mismos 775 tensores, mismo `config.json`, tokenizer, chat template y ficheros de procesador. La torre de visión se congela durante el entrenamiento; solo se actualizan las proyecciones de atención y el resto de parámetros del modelo de lenguaje.

El entrenamiento utiliza los resúmenes que el propio Qwen3.5-9B generó sobre 139 artículos del split de train de RAGTruth (las 250 filas de `sift_train.json`), con los spans alucinados etiquetados por ReCCon. Cada fila contiene un span alucinado; el resumen limpio sustituye ese span por su `replacement` (208 filas) o lo elimina cuando el reemplazo está vacío (42 filas). La pérdida es triple con λ = 2: entropía cruzada sobre el texto anterior al span, entropía cruzada negativa sobre el span y entropía cruzada sobre la continuación limpia anclada, terminando en `<|im_end|>`. Como optimizador se emplea Muon en todas las proyecciones bidimensionales de atención (`self_attn` q/k/v/o y `linear_attn` in_proj_qkv/z/a/b y out_proj) y AdamW en el resto, con lr 5e-6, schedule coseno sobre 400 pasos a batch 1, 3 % de warmup, `kimi_c` 0.2 y weight decay de Muon 0.1. El checkpoint publicado es el paso 400 (1,6 épocas).

## Capacidades

- Generación de texto y resumen extractivo/abstractivo sobre contexto recuperado, con énfasis en la fidelidad al contexto (mitigación de alucinaciones).
- Procesamiento multimodal image-text-to-text, heredado de la arquitectura del modelo base Qwen3.5-9B (torre de visión congelada).
- Modo de pensamiento desactivable: el autor indica que debe generarse con `enable_thinking=False` en el chat template (en vLLM, `"chat_template_kwargs": {"enable_thinking": false}`), ya que el modelo fue entrenado en formato sin *thinking*.
- Razonamiento y conocimiento general preservados respecto al modelo base, según los benchmarks internos del autor (MMLU 69,6 en 5-shot frente a 69,7 del base).
- Capacidad de seguir instrucciones de resumen con restricción de longitud ("Summarize the following news within N words:").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Mitigación de alucinaciones en pipelines RAG de resumen de noticias: el modelo se entrenó específicamente para sustituir o eliminar spans alucinados en resúmenes generados sobre artículos recuperados, por lo que encaja como generador final en un sistema RAG de resumen periodístico donde la fidelidad al contexto es crítica.
- Evaluación de técnicas de *unlearning*: sirve como caso de estudio reproducible para investigadores que quieran comparar la pérdida triple con λ = 2 frente a ajuste supervisado convencional o DPO en tareas de fidelidad.
- Generación de resúmenes con restricción de longitud: el modelo respeta instrucciones del tipo "resume en N palabras" manteniendo la longitud solicitada (mediana de 1,03× las palabras pedidas en la evaluación del autor), útil en boletines y newsletters con espacio fijo.
- Sustitución directa en despliegues existentes de Qwen3.5-9B: al conservar el mismo layout de tensores, config, tokenizer y chat template, puede reemplazar al modelo base en un servicio vLLM o `transformers` sin cambios de infraestructura, simplemente desactivando el modo *thinking*.
- Filtrado y verificación de resúmenes en producción editorial: dado su bajo índice de alucinación declarado (1,3 % en el test interno), puede usarse como generador de primera pasada en flujos donde un editor humano revisa después, reduciendo la carga de corrección.
- Investigación sobre fidelidad en modelos multimodales: al mantener la torre de visión, permite estudiar si la mitigación de alucinaciones en texto se transfiere o interfiere con tareas image-text-to-text.
- Benchmarking de sistemas de detección de alucinaciones (ReCCon, RAGTruth): el modelo y su conjunto de test de 150 prompts permiten reproducir la comparación base vs. ajustado con McNemar y medir el efecto de distintas configuraciones de decodificación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (evaluación interna, no replicada de forma independiente):

| Metrica | Base Qwen3.5-9B | Este modelo |
|---|---|---|
| ReCCon full pipeline (stages 1–5), resúmenes con alucinación | 22,7 % (34/150) | 1,3 % (2/150) |
| ReCCon chain mean only (stage 1) | 15,3 % (23/150) | 0,7 % (1/150) |
| Longitud media del resumen (palabras) | 121 | 114 |
| Mediana de longitud relativa a las palabras pedidas | 1,03× | 0,95× |
| Nombres propios por resumen | 13,5 | 13,2 |
| Números por resumen | 1,89 | 2,15 |
| lm-evaluation-harness 0-shot, media de 9 tareas | 66,6 | 66,5 |
| lm-evaluation-harness 5-shot, media de 9 tareas | 74,6 | 74,9 |
| GSM8K 5-shot | 86,7 | 89,0 |
| GSM8K 0-shot | 83,2 | 82,1 |
| MMLU 5-shot | 69,6 | 69,7 |

El autor indica que 33 resúmenes pasaron de alucinados a limpios y 1 al contrario (McNemar p < 1e-8), y que el resto de tareas de lm-evaluation-harness queda dentro de ±1,1 respecto al base. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (9,4 mil millones de parámetros), en FP16/BF16 los pesos ocupan aproximadamente 18,8 GB, por lo que se necesita al menos una GPU de 24 GB para inferencia sin cuantizar; en cuantización de 8 bits rondaría los 9,4 GB y en 4 bits unos 4,7 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en A100 40/80 GB, H100 y RTX 4090 (24 GB) en BF16, y en GPUs consumer de 16 GB solo con cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: `transformers` y vLLM, según indica el autor (el modelo carga igual que el base). Otras opciones como llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bfdxy/Qwen3.5-9B-hallucination-unlearn-ragtruth-reccon-labeled | 9,41 B | no disponible | Ajuste fino por *unlearning* para reducir alucinaciones en resumen RAG | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | 9,41 B | no disponible | Modelo multimodal generalista | Apache 2.0 (según el ajuste) | Hugging Face |
| Alternativas de la misma categoría (modelos de ~9B para resumen fiel) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (mitigación de alucinaciones en resumen RAG con ~9B parámetros) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; el autor no documenta sesgos demográficos, geográficos ni de otro tipo.
- Riesgo de alucinación: aunque el autor declara una reducción drástica (del 22,7 % al 1,3 % en su test interno), las cifras son internas y no replicadas de forma independiente. El autor advierte de que eligió este checkpoint entre 24 (6 ejecuciones × 4) sobre los mismos 150 prompts, por lo que los números son "algo optimistas".
- Las etiquetas humanas de RAGTruth cubren respuestas de otros modelos, no los resúmenes de estos modelos; las métricas proceden únicamente del setup ReCCon del autor. Un setup distinto (descontextualización, parámetros de decodificación) dará cifras absolutas diferentes.
- Limitaciones de contexto o idioma: no se declara longitud de contexto ni idiomas soportados; el entrenamiento se realizó exclusivamente sobre artículos en inglés de RAGTruth, por lo que el comportamiento en otros idiomas no está caracterizado.
- El modelo fue entrenado en formato sin *thinking*; usarlo con el modo de pensamiento activado puede degradar la calidad y aumentar la tasa de alucinación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base y de los datos de RAGTruth empleados en el entrenamiento.
- Caveat de producción: el modelo está pensado para evaluación sobre fuentes *held-out* (las 150 fuentes del split de test de RAGTruth listadas en `test_articles.json`); evaluar sobre las 139 fuentes de entrenamiento daría resultados inflados.
- El repositorio no declara cuantizaciones oficiales ni resultados de latencia/throughput, lo que dificulta planificar despliegues a escala.
- Con 0 descargas y 0 likes, no existe validación comunitaria ni reportes de terceros sobre su comportamiento en dominios distintos del resumen de noticias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bfdxy/Qwen3.5-9B-hallucination-unlearn-ragtruth-reccon-labeled
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- RAGTruth (dataset de referencia citado en la model card): no disponible enlace directo en la información proporcionada
- ReCCon (sistema de etiquetado de alucinaciones citado): no disponible enlace directo en la información proporcionada
- lm-evaluation-harness (herramienta de evaluación citada): no disponible enlace directo en la información proporcionada
