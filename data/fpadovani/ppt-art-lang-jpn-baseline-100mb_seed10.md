# fpadovani/ppt-art-lang-jpn-baseline-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-art-lang-jpn-baseline-100mb_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eng_latn_100mb`, un transformer decoder-only de tipo GPT-2 con aproximadamente 86 millones de parámetros. Ha sido desarrollado por fpadovani, probablemente en el contexto de un proyecto de investigación sobre adaptación de modelos lingüísticos a dominios o idiomas específicos, como sugiere el nombre "jpn" (japonés). El entrenamiento se realizó con la librería TRL (Transformer Reinforcement Learning) mediante SFT (supervised fine-tuning), aunque no se han publicado detalles sobre el dataset utilizado ni el número de tokens de entrenamiento.

Este modelo es relevante como ejemplo de fine-tuning de modelos pequeños (100MB) para tareas de generación de texto, especialmente en escenarios donde los recursos computacionales son limitados. Su tamaño reducido permite ejecutarlo en GPUs de consumo y explorar técnicas de adaptación eficiente. Sin embargo, al ser un modelo de solo 86M parámetros, sus capacidades son limitadas en comparación con modelos modernos de mayor escala, y no se dispone de información sobre su rendimiento en benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, variante reducida) |
| Parametros totales | 86.416.128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere japones, pero no se confirma) |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only con mecanismo de atención causal. La configuración exacta (número de capas, dimensiones ocultas, etc.) no se ha especificado, pero los 86M parámetros lo sitúan en un rango similar al GPT-2 small (124M) aunque algo más reducido, probablemente adaptado al tamaño de 100MB del modelo base.

El entrenamiento consistió en un ajuste fino supervisado (SFT) utilizando la librería TRL de Hugging Face, partiendo de los pesos de `goldfish-models/eng_latn_100mb`. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros. Tampoco se menciona el uso de técnicas como RLHF o DPO. La ausencia de esta información impide evaluar la calidad del ajuste o su reproducibilidad.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto continuando un prompt dado, como se muestra en el ejemplo de la model card (pregunta sobre una máquina del tiempo).
- Soporte de chat básico: el pipeline de transformers acepta mensajes con roles (user, assistant) y genera respuestas, aunque no se especifica si el modelo fue entrenado específicamente para diálogo.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión, audio o modo de pensamiento extendido. Dado su tamaño, es poco probable que las tenga.

## Casos de uso

- Investigación académica en adaptación de modelos pequeños: el modelo sirve como baseline para estudiar cómo el fine-tuning en un idioma o dominio específico (posiblemente japonés) afecta al rendimiento en tareas de generación de texto, comparándolo con otros seeds o variantes.
- Prototipado rápido de generación de texto en entornos con recursos limitados: su tamaño permite ejecutarlo en una GPU de consumo o incluso en CPU, facilitando pruebas iniciales de pipelines de generación.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede utilizarse como punto de partida para ajustes más específicos con datasets propios, aprovechando el conocimiento ya adquirido del modelo base.
- Educación y demostraciones: útil para ilustrar conceptos de fine-tuning y transformers en cursos o talleres, dado que es ligero y fácil de cargar con transformers.
- Generación de texto en japonés (si se confirma el idioma): aunque no hay evidencia explícita, el nombre sugiere que podría emplearse para tareas de generación en ese idioma, siempre con expectativas realistas por su tamaño.
- Evaluación de técnicas de cuantización y optimización: al ser pequeño, es un candidato ideal para probar métodos de compresión (cuantización, pruning) sin grandes costes computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86M parámetros, en fp16 ocupa aproximadamente 172 MB, y en fp32 unos 344 MB. Esto cabe en cualquier GPU moderna, incluso en GPUs integradas con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 3060, o incluso Apple Silicon.
- También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante pipelines de Hugging Face. También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporciona ese formato.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, la generación de 128 tokens (como en el ejemplo) debería ser casi instantánea, pero sin mediciones concretas no se puede cuantificar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de ~86M parámetros ajustados a japonés). El propio autor ha publicado variantes con diferentes seeds (por ejemplo, `ppt-art-lang-jpn-baseline_seed3407`), pero no hay datos de rendimiento para comparar. Se podría mencionar el modelo base `goldfish-models/eng_latn_100mb` como referencia, pero no es un modelo final sino un punto de partida.

## Limitaciones y advertencias

- Al ser un modelo de solo 86M parámetros, su capacidad de razonamiento, conocimiento del mundo y coherencia a largo plazo es muy limitada en comparación con modelos grandes (7B o más).
- No se han documentado sesgos específicos, pero al estar entrenado sobre un corpus probablemente pequeño, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: alto, especialmente en temas especializados o fuera del dominio de entrenamiento.
- Limitaciones de idioma: no se confirma que el modelo funcione bien en japonés; el nombre es solo una pista. La falta de información sobre el dataset impide saber qué idiomas maneja realmente.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin consultar al autor. Se recomienda contactar con fpadovani antes de cualquier despliegue en producción.
- El modelo no ha sido evaluado en benchmarks, por lo que no hay garantía de calidad en tareas estándar.
- Para uso en producción, se recomienda encarecidamente realizar una evaluación propia con datos representativos antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/ppt-art-lang-jpn-baseline-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/fe6zw3x9
- Página de FriendliAI para una variante similar (seed3407): https://friendli.ai/models/fpadovani/ppt-art-lang-jpn-baseline_seed3407
