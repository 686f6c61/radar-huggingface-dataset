# ArchSpace-Collection/NCP_Olmo3_Stage1_Step1100000

## Resumen

Este repositorio aloja un checkpoint intermedio denominado `NCP_Olmo3_Stage1_Step1100000`, publicado por la organización ArchSpace-Collection. Se trata de un punto de control de la etapa 1 (Stage1) de un entrenamiento experimental de un modelo de lenguaje basado en la arquitectura Olmo 3, dentro del proyecto ArchSpace de InternLM, cuyo objetivo es explorar y validar hipótesis de diseño de arquitecturas de LLM de forma transparente y reproducible. El checkpoint corresponde al paso 1.100.000 del entrenamiento y se distribuye en formato SafeTensors con claves de proyección estándar de Hugging Face (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que permite cargarlo directamente con `AutoModelForCausalLM` y `trust_remote_code=True`, así como con el backend vLLM de ConceptLM.

El modelo tiene aproximadamente 8.940 millones de parámetros (8.938.363.792), lo que lo sitúa en la gama de los 7B-9B, similar a otros modelos abiertos como Olmo 3 7B o Llama 3.1 8B. Al ser un checkpoint intermedio, no representa un modelo final pulido, sino una instantánea del proceso de entrenamiento, útil para investigar la evolución de las capacidades del modelo a lo largo del tiempo y para comparar arquitecturas dentro del ecosistema ArchSpace. Su relevancia radica en que forma parte de un esfuerzo abierto por documentar el ciclo de vida completo de un LLM, incluyendo etapas intermedias que normalmente no se publican.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Olmo 3, con modificaciones propias del proyecto ArchSpace) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye en precisión completa, safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo más allá de su pertenencia a la familia Olmo 3. El paper de Olmo 3 (arXiv:2512.13961) describe una familia de modelos de 7B y 32B parámetros con atención de largo contexto, soporte para function calling, generación de código y razonamiento, pero no se confirma que este checkpoint concreto herede todas esas características. El nombre "NCP" sugiere una variante de arquitectura (posiblemente relacionada con circuitos neuronales o procesamiento basado en grafos), pero no se ha publicado documentación específica al respecto.

El checkpoint se presenta como una conversión "pura" de Hugging Face, con claves de proyección estándar y un manifiesto de conversión (`conversion_manifest.json`) que acredita la correspondencia con los pesos originales. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados, ni las técnicas de alineación (RLHF, DPO, etc.) empleadas. Al ser un checkpoint de la etapa 1, es probable que corresponda a una fase de preentrenamiento o de ajuste inicial, sin etapas posteriores de instrucción o refuerzo.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Dado que es un modelo de lenguaje causal (cargable con `AutoModelForCausalLM`), se espera que pueda generar texto, pero no hay evidencia de capacidades avanzadas como tool calling, razonamiento multi-paso o soporte multilingüe. La ausencia de benchmarks y de una model card detallada impide confirmar cualquier habilidad concreta. Se recomienda tratarlo como un modelo experimental en fase de desarrollo.

## Casos de uso

Al tratarse de un checkpoint intermedio de un experimento de arquitectura, los casos de uso son principalmente de investigación y desarrollo:

- Evaluación de la evolución del entrenamiento: comparar este paso (1.100.000) con otros checkpoints de la misma serie para estudiar cómo cambian las métricas de pérdida y las capacidades emergentes a lo largo del tiempo.
- Validación de hipótesis de arquitectura: el proyecto ArchSpace busca contrastar diseños alternativos; este checkpoint permite reproducir y analizar el comportamiento de una variante concreta de Olmo 3.
- Pruebas de compatibilidad con frameworks de inferencia: verificar que la conversión a claves Hugging Face funciona correctamente con `AutoModelForCausalLM` y vLLM, sirviendo como referencia para otros checkpoints del proyecto.
- Análisis de representaciones internas: estudiar los pesos intermedios para comprender cómo se forman las representaciones lingüísticas en una arquitectura experimental.
- Desarrollo de técnicas de conversión de pesos: el `conversion_manifest.json` puede utilizarse como caso de estudio para herramientas de conversión entre formatos Megatron y Hugging Face.
- Reproducibilidad de experimentos: al publicar checkpoints intermedios, se facilita la replicación de resultados y la comparación con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web menciona una tabla comparativa entre el checkpoint final de NCP-Olmo3 y OLMo-Stage1, pero no se proporcionan valores numéricos en los extractos. Este checkpoint intermedio no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) en su model card. Por tanto, no es posible valorar su rendimiento cuantitativo.

## Requisitos de hardware

- El tamaño del repositorio es de 17,9 GB, lo que corresponde aproximadamente al peso del modelo en precisión FP16 (8.938.363.792 parámetros × 2 bytes ≈ 17,9 GB).
- Para inferencia en FP16 se necesitan al menos 18 GB de VRAM, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- En GPUs profesionales, una A100 de 40 GB o una H100 de 80 GB ofrecen margen suficiente para procesar lotes mayores o contextos largos.
- No se ha confirmado soporte para cuantización (GGUF, INT8, INT4), por lo que no se puede estimar la reducción de VRAM en esos escenarios.
- Opciones de despliegue: se menciona compatibilidad con vLLM (backend ConceptLM) y con `AutoModelForCausalLM` de Hugging Face. No se indica soporte para llama.cpp u Ollama.
- La latencia y el throughput dependen del hardware y de la configuración; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo se asemeja en tamaño a Olmo 3 7B (Ai2) y a Llama 3.1 8B, pero no hay datos de rendimiento ni de licencia para este checkpoint. La única referencia es la comparación con OLMo-Stage1 mencionada en la búsqueda web, pero sin cifras concretas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: puede presentar comportamientos incompletos o inestables propios de una etapa temprana de entrenamiento.
- No se especifica la licencia, lo que impide su uso comercial sin autorización explícita del autor.
- Depende de código personalizado (`trust_remote_code=True`), lo que introduce un riesgo de seguridad si el código no es auditado previamente.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas; se desconoce su comportamiento en producción.
- El tamaño del modelo (8,94B) requiere hardware con al menos 18 GB de VRAM en FP16, lo que limita su uso en entornos con GPUs modestas.
- Al no haber benchmarks publicados, no se puede garantizar su calidad en tareas estándar de NLP.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step1100000
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Proyecto ArchSpace (GitHub): https://github.com/InternLM/archspace
- Página de Olmo de Ai2: https://allenai.org/olmo
