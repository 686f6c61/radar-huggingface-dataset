# huggingface12341/zsl-h22b

## Resumen

zsl-h22b es un modelo de extracción de características (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un *merge* de pesos por aritmética de vectores de tarea (task vectors) sobre la base Qwen/Qwen3.5-0.8B. El autor lo describe como un "merge for the Zils subnet 127 d3-lite pool", es decir, un artefacto de agregación de pesos dentro de un conjunto de modelos de la familia "d3-lite" y "zils", presumiblemente orientados a la toma de decisiones (tag `decision-model`).

El modelo combina una sopa uniforme (media aritmética) de dos variantes de la familia zils-lite con dos vectores de diferencia: uno derivado de openjev-v5-0.8b y otro de CoCo-Decision-Vision-0.8B, ambos calculados como la resta respecto a los pesos de Qwen3.5-0.8B. La torre de visión se conserva intacta de la base. El resultado es un checkpoint de aproximadamente 853 millones de parámetros en formato safetensors, con licencia Apache-2.0.

Su relevancia es limitada y muy específica: se trata de un experimento de fusión de pesos sin model card técnica detallada, sin benchmarks publicados y sin descargas ni interacciones en el momento de la consulta. Resulta de interés para quienes investigan técnicas de *model merging*, *task arithmetic* o la composición de modelos multimodales pequeños, pero no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B (tag `qwen3_5`), con torre de visión heredada de la base; requiere `custom_code` |
| Parametros totales | 852.985.920 (~0,85 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo no se entrena: se construye por fusión lineal de pesos. Según la model card, la receta es `linear: soup + 0.25 x (openjev-v5-0.8b - Qwen) + 0.25 x (CoCo-Decision-Vision-0.8B - Qwen)`, donde `soup` es la media uniforme de joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q. Los vectores de tarea se calculan como `find - Qwen/Qwen3.5-0.8B` sobre los pesos de lenguaje, aplicados con un coeficiente de 0,25 cada uno. La torre de visión se toma directamente de la base sin modificaciones.

La arquitectura subyacente es, por tanto, la de Qwen3.5-0.8B: un transformer de aproximadamente 0,85 B de parámetros con un codificador visual asociado (herencia de CoCo-Decision-Vision-0.8B y de la base). No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, porque el proceso de merge no implica entrenamiento adicional. La innovación técnica, si puede llamarse así, es el uso de *task arithmetic* con coeficientes fijos para inyectar comportamiento de decisión y de visión sobre una sopa de modelos de la misma familia.

## Capacidades

- Extracción de características (pipeline declarado: `feature-extraction`), orientada a representaciones vectoriales más que a generación de texto libre.
- Procesamiento multimodal: conserva la torre de visión de la base, por lo que puede ingerir imágenes junto con texto.
- Comportamiento de "decision-model" según los tags y la model card, aunque no se especifica el formato de salida ni las tareas de decisión concretas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo *thinking*, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en *model merging*: servir como caso de estudio reproducible de *task arithmetic* con coeficientes fijos sobre una base Qwen3.5-0.8B, útil para comparar recetas de fusión (soup, TIES, DARE, etc.) en modelos pequeños.
- Extracción de embeddings multimodales en prototipos: al conservar la torre de visión y declarar `feature-extraction`, puede emplearse para generar representaciones de pares imagen-texto en experimentos de recuperación (retrieval) a pequeña escala.
- Evaluación de la familia "zils"/"d3-lite": permite a quienes trabajan con el pool del subnet 127 comparar el efecto de añadir vectores de tarea de openjev-v5 y CoCo-Decision-Vision sobre la sopa base.
- Clasificación o decisión ligera en entornos con recursos limitados: con ~0,85 B de parámetros y ~1,7 GB en safetensors, cabe en GPU de consumo para experimentación, siempre que se valide su calidad antes de usarlo.
- Base para *fine-tuning* posterior: al ser Apache-2.0 y estar en formato `transformers`, puede servir como punto de partida para ajuste supervisado en tareas de decisión específicas.
- Reproducción de pipelines de merge en CI: integrar la receta documentada en scripts automatizados que regeneren el checkpoint y verifiquen su equivalencia con el publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 1,7 GB solo para pesos, más activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch. En cuantización de 8 bits, alrededor de 1 GB de pesos; en 4 bits, en torno a 0,5 GB (aunque no se publican versiones cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en batch pequeño (RTX 3050, RTX 4060, T4); A100/H100 no son necesarias para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares, siempre que el `custom_code` cargue correctamente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados para este checkpoint (no hay GGUF ni configuración publicada). El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zsl-h22b | ~0,85 B | no disponible | Apache-2.0 | safetensors (`custom_code`) | Merge de 4 modelos sobre Qwen3.5-0.8B; sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible en la información | safetensors | Base del merge; referencia para calcular los vectores de tarea |
| corners-ai/CoCo-Decision-Vision-0.8B | ~0,8 B | no disponible | Apache-2.0 (según NOTICE) | no disponible | Fuente del vector de visión/decisión |
| rodneyslafuente/openjev-v5-0.8b | ~0,8 B | no disponible | Apache-2.0 (según NOTICE) | no disponible | Fuente del segundo vector de tarea |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de tareas de decisión o visión, por lo que no puede afirmarse nada sobre su calidad real.
- Model card mínima: no se documentan idiomas, contexto, datos de entrenamiento ni formato de salida esperado; el uso en producción requeriría una evaluación propia exhaustiva.
- Riesgo de degradación por merge: la combinación lineal de vectores de tarea con coeficientes fijos (0,25) puede producir interferencias entre capacidades; no hay validación publicada de que el resultado supere a los modelos fuente.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar ese código antes de usarlo en entornos sensibles.
- Riesgo de alucinación: no evaluado; al ser un modelo de feature-extraction, la generación de texto no es su función declarada y podría producir salidas poco fiables si se fuerza ese uso.
- Sesgos: no documentados; al heredar pesos de Qwen3.5 y de los modelos fusionados, arrastra los sesgos de sus datos de entrenamiento originales, desconocidos en detalle.
- Licencia: Apache-2.0 permite uso comercial, pero el NOTICE cita las fuentes; conviene revisar las licencias de los modelos base y de los checkpoints fusionados antes de redistribuir.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-h22b
- Modelo base principal: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fuente 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Fuente 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Fuente 3: https://huggingface.co/rodneyslafuente/openjev-v5-0.8b
- Fuente 4: https://huggingface.co/corners-ai/CoCo-Decision-Vision-0.8B
