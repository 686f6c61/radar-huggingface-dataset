# huggingface12341/zsz-h23b

## Resumen

zsz-h23b es un modelo de fusión (merge) publicado por el usuario huggingface12341 bajo el identificador `huggingface12341/zsz-h23b`. No se trata de un modelo entrenado desde cero, sino del resultado de combinar mediante la técnica TIES (density 0,2, lambda 0,7) tres modelos preexistentes: `joamCriff123/zils-z3-z1123a` (que actúa como base o "soup" del pool), `OmniJev/OneJev1.6-27B` y `perplexity-ai/pplx-decider-v1.2`. El modelo padre declarado de todos ellos es `Qwen/Qwen3.8-27B`, lo que sitúa la arquitectura en la familia Qwen 3.x con aproximadamente 26.085 millones de parámetros (26,08 B) en formato safetensors.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue creado el 27 de noviembre de 2026. La model card es extremadamente escueta y no aporta información sobre datos de entrenamiento, benchmarks, idiomas soportados ni detalles de arquitectura más allá de la mención al tower de visión heredado del modelo base. El pipeline declarado es `feature-extraction`, aunque las etiquetas incluyen `decision-model`, lo que sugiere un uso previsto orientado a extracción de representaciones o a la toma de decisiones más que a generación de texto abierta.

El interés técnico reside en el método de fusión: se construyen vectores de tarea como la diferencia entre cada modelo fuente y `Qwen/Qwen3.8-27B` sobre los pesos de lenguaje, se aplican con TIES sobre el "soup" uniforme del pool y se conserva el tower de visión del modelo base. Este tipo de merges busca agregar capacidades especializadas sin reentrenar, pero su calidad depende críticamente de la compatibilidad de los checkpoints y de la validación empírica, que aquí no está documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.x (hereda de Qwen/Qwen3.8-27B); tower de visión del modelo base |
| Parametros totales | 26.085.330.160 (26,08 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | feature-extraction |
| Tamano del repositorio | 52,2 GB |
| Metodo de creacion | Merge TIES (density 0,2, lambda 0,7) |
| Modelos base | joamCriff123/zils-z3-z1123a, OmniJev/OneJev1.6-27B, perplexity-ai/pplx-decider-v1.2 |
| Modelo padre | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado de forma convencional: es una fusión de pesos. Según la model card, se parte del "soup" del pool del subnet Zils 127 d3, definido como la media uniforme de `joamCriff123/zils-z3-z1123a`. Sobre ese punto de partida se calculan vectores de tarea para `OmniJev/OneJev1.6-27B` y `perplexity-ai/pplx-decider-v1.2` como la diferencia `(find - Qwen/Qwen3.8-27B)` restringida a los pesos de lenguaje, y se combinan mediante TIES con densidad 0,2 y lambda 0,7. El tower de visión se toma directamente del modelo base, sin fusión.

La arquitectura subyacente es, por tanto, la de `Qwen/Qwen3.8-27B`: un transformer denso de aproximadamente 26 B de parámetros con un componente de visión, dado que la model card menciona explícitamente un "vision tower". No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias en los modelos fuente. Tampoco se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá del propio procedimiento de merge.

## Capacidades

- Extracción de características y representaciones: el pipeline declarado es `feature-extraction`, por lo que el uso canónico es obtener embeddings o estados ocultos, no necesariamente generación de texto.
- Procesamiento multimodal: al conservar el tower de visión del modelo base, el modelo mantiene capacidad de procesar entradas visuales, aunque no se documenta el formato exacto ni la resolución soportada.
- Toma de decisiones: la etiqueta `decision-model` sugiere un uso previsto en clasificación o selección entre opciones, probablemente heredado de `perplexity-ai/pplx-decider-v1.2`.
- Herencia de capacidades de los modelos fuente: al ser un merge, se espera que retenga parte de las habilidades de `OneJev1.6-27B` y `pplx-decider-v1.2`, pero no hay evaluación que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está declarado).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: dado que el pipeline es `feature-extraction`, el modelo puede emplearse para generar representaciones vectoriales de documentos o consultas en sistemas de recuperación (RAG). Es adecuado por su tamaño de 26 B, que permite representaciones ricas, aunque requiere hardware considerable.
- Clasificación y enrutamiento de decisiones: la etiqueta `decision-model` apunta a su uso como clasificador o selector en pipelines internos (por ejemplo, decidir qué herramienta o ruta invocar). Adecuado si se valida empíricamente, ya que no hay benchmarks publicados.
- Procesamiento de documentos con componentes visuales: al conservar el tower de visión, puede emplearse en tareas que combinen texto e imagen, como extracción de información de capturas o documentos escaneados, siempre que se verifique el formato de entrada esperado.
- Investigación sobre técnicas de merge: el modelo es un caso de estudio útil para analizar el efecto de TIES (density 0,2, lambda 0,7) sobre un soup uniforme, comparando representaciones antes y después de la fusión.
- Base para futuros merges en el pool Zils: puede servir como componente intermedio en la cadena de fusiones del subnet, ya que se construye sobre el "soup" del pool y añade vectores de tarea de dos modelos adicionales.
- Evaluación comparativa de modelos derivados de Qwen 3.8-27B: útil en entornos de investigación para medir la degradación o mejora de capacidades al fusionar checkpoints con el mismo padre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 60-70 GB de VRAM.
- GPU recomendadas para precisión completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB con sharding).
- Cuantización: no se documentan tipos de cuantización soportados; al ser un modelo transformers con safetensors, sería necesario convertir a GGUF/AWQ/GPTQ de forma manual, sin garantías de que el merge preserve la calidad tras cuantizar.
- ¿Cabe en GPU de consumo? En BF16 no cabe en una sola GPU de consumo. En cuantizaciones agresivas (4 bits, ~13-15 GB) podría caber en una RTX 4090 de 24 GB, pero no hay artefactos publicados que lo confirmen.
- Opciones de despliegue: transformers (declarado). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el tag `custom_code` sugiere que puede requerir código específico y no funcionar directamente en todos los motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsz-h23b | 26,08 B | no disponible | apache-2.0 | Hugging Face (0 descargas) | Merge TIES, pipeline feature-extraction |
| Qwen/Qwen3.8-27B (padre) | ~27 B (según nombre) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que derivan los vectores de tarea |
| OmniJev/OneJev1.6-27B | ~27 B (según nombre) | no disponible | no disponible en esta ficha | Hugging Face | Fuente de uno de los vectores de tarea |
| perplexity-ai/pplx-decider-v1.2 | no disponible | no disponible | no disponible en esta ficha | Hugging Face | Fuente del vector de tarea orientado a decisión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni métricas de pérdida, ni validación del merge; no se puede afirmar que el modelo supere o iguale a sus fuentes.
- Riesgo de degradación por merge: TIES con densidad 0,2 descarta el 80 % de los parámetros de los vectores de tarea, lo que puede eliminar capacidades especializadas de los modelos fuente.
- Idiomas no declarados: se desconoce si el modelo conserva el multilingüismo de Qwen 3.8-27B; no debe asumirse soporte de castellano u otros idiomas sin prueba empírica.
- Contexto no documentado: no se indica la longitud de contexto efectiva, por lo que no se debe asumir la del modelo padre.
- Riesgo de alucinación: inherente a los modelos de lenguaje; al no haber evaluación, no se puede acotar su magnitud.
- Sesgos: no documentados; al heredar de Qwen 3.8-27B, arrastra los sesgos de su dataset de entrenamiento, que tampoco se detalla.
- Licencia: apache-2.0 permite uso comercial, pero la model card remite a un fichero NOTICE y a las licencias de los modelos fuente; conviene verificar que los tres checkpoints de origen sean efectivamente apache-2.0 antes de desplegar en producción.
- Tag `custom_code`: puede requerir `trust_remote_code=True` y código no auditado, lo que supone un riesgo de seguridad en entornos de producción.
- Madurez: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad; no es recomendable para producción sin una evaluación propia exhaustiva.
- Fecha de creación futura (2026-11-27): conviene verificar la autenticidad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsz-h23b
- Modelo base del pool: https://huggingface.co/joamCriff123/zils-z3-z1123a
- Fuente del vector de tarea 1: https://huggingface.co/OmniJev/OneJev1.6-27B
- Fuente del vector de tarea 2: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Modelo padre: https://huggingface.co/Qwen/Qwen3.8-27B
