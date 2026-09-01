# aplominski/TinyTransformer-Pre-RMSNorm-18M-TinyStories

## Resumen

TinyTransformer-Pre-RMSNorm-18M-TinyStories es un modelo de lenguaje pequeño (18,4 millones de parámetros) desarrollado por aplominski como parte de una serie de investigación sobre el efecto de las estrategias de normalización en arquitecturas Transformer de pequeña escala. El modelo emplea normalización RMSNorm aplicada antes de las subcapas del Transformer (configuración pre-normalización), una variante simplificada de LayerNorm que omite la centración de la media y normaliza usando la raíz cuadrada media de las activaciones.

El modelo se entrena sobre el dataset TinyStories, un corpus sintético generado con GPT-4 que contiene historias cortas en inglés diseñadas específicamente para entrenar modelos de lenguaje pequeños con coherencia y fluidez. Su relevancia radica en que permite estudiar de forma aislada el impacto de la normalización en el entrenamiento y rendimiento de modelos pequeños, un factor crítico para el diseño de SLMs eficientes. La arquitectura es un Transformer estándar con atención de producto punto, aunque no se especifican detalles como el número de capas, cabezas o dimensión del modelo en la información disponible. La longitud de contexto no se indica en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con normalización RMSNorm pre-subcapas |
| Parametros totales | 18.461.696 (18M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer estándar (basada en el paper "Attention Is All You Need") con una modificación específica: la normalización RMSNorm se aplica antes de cada subcapa (atención y feed-forward), en lugar de después. Esta configuración pre-normalización es conocida por estabilizar el entrenamiento en modelos profundos, pero aquí se estudia en un contexto de muy pequeña escala. La normalización RMSNorm, propuesta por Zhang y Sennrich (2019), elimina la operación de centrado de la media de LayerNorm y normaliza únicamente con la raíz cuadrada media, lo que reduce coste computacional.

El entrenamiento se realizó sobre el dataset TinyStories (roneneldan/TinyStories), un corpus sintético en inglés de historias cortas generadas por GPT-4, con la tarea de masked language modeling. No se especifican el número de tokens de entrenamiento, el tamaño del lote, la tasa de aprendizaje ni si se aplicaron técnicas como RLHF o DPO. El modelo forma parte de una serie que compara cinco variantes: Baseline (sin normalización), Pre-LayerNorm, Post-LayerNorm, Pre-RMSNorm y Post-RMSNorm, todas con el mismo tamaño y configuración experimental, siendo la normalización la única variable.

## Capacidades

- Generación de texto en inglés: capaz de producir historias cortas coherentes y gramaticalmente correctas, dado que fue entrenado específicamente en TinyStories.
- Razonamiento básico: el dataset TinyStories incluye historias con estructuras causales simples, por lo que el modelo puede mostrar cierta capacidad de razonamiento narrativo elemental.
- Investigación sobre normalización: su principal capacidad es servir como herramienta experimental para comparar el efecto de RMSNorm pre vs. post vs. otras estrategias en modelos pequeños.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos.
- Multilingüismo: no disponible, solo inglés.

## Casos de uso

- Investigación académica en normalización de transformers: el modelo permite a investigadores reproducir y extender los experimentos de la serie, comparando métricas de entrenamiento y rendimiento entre variantes de normalización.
- Educación en arquitecturas de modelos de lenguaje: por su tamaño reducido, es ideal para demostrar conceptos de pre-normalización, RMSNorm y entrenamiento de SLMs en cursos o talleres.
- Prototipado de generación de texto infantil: puede usarse para generar historias cortas en inglés para niños, aunque con limitaciones de vocabulario y coherencia a largo plazo.
- Benchmark de eficiencia de inferencia: al ser un modelo de 18M, sirve para medir latencia y consumo de recursos en diferentes backends (CPU, GPU, móvil) sin necesidad de hardware especializado.
- Estudio de sesgos en modelos pequeños: al entrenarse sobre un dataset sintético, permite analizar qué sesgos persisten en modelos de muy baja escala y cómo la normalización afecta a la distribución de salidas.
- Base para fine-tuning en tareas de generación de texto corto: puede adaptarse con fine-tuning a dominios específicos que requieran respuestas breves y simples, como asistentes de escritura creativa básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (solo se menciona "accuracy" como métrica en el frontmatter, pero sin valores). No se dispone de comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al tener 18,4M de parámetros, el modelo en precisión FP32 ocupa aproximadamente 74 MB (18,4M × 4 bytes). En FP16 serían unos 37 MB. Cabe en cualquier GPU moderna, incluso en iGPUs.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA GTX 1050 Ti, RTX 2060 o superior funcionará sin problemas. También es viable en CPU.
- Compatibilidad con consumer GPU: sí, absolutamente. Es uno de los modelos más ligeros que se pueden desplegar.
- Opciones de despliegue: al ser un modelo pequeño con pesos en safetensors, puede cargarse con Hugging Face Transformers, o convertirse a GGUF para usarse con llama.cpp u Ollama. También es compatible con vLLM y TGI, aunque para este tamaño no son necesarios.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, la generación de tokens debería ser casi instantánea (del orden de microsegundos por token), pero no hay datos concretos.

## Comparativa con modelos similares

La serie TinyTransformer de aplominski incluye cinco variantes con el mismo tamaño y dataset, diferenciadas solo por la estrategia de normalización. La comparación más relevante es entre estas variantes:

| Modelo | Normalización | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer Baseline 18M | Sin normalización | 18M | no disponible | OpenMDW-1.1 |
| TinyTransformer Pre-LayerNorm 18M | LayerNorm pre | 18M | no disponible | OpenMDW-1.1 |
| TinyTransformer Post-LayerNorm 18M | LayerNorm post | 18M | no disponible | OpenMDW-1.1 |
| TinyTransformer Pre-RMSNorm 18M (este) | RMSNorm pre | 18M | no disponible | OpenMDW-1.1 |
| TinyTransformer Post-RMSNorm 18M | RMSNorm post | 18M | no disponible | OpenMDW-1.1 |

No se dispone de datos de rendimiento comparativo entre estas variantes. Otros modelos pequeños entrenados en TinyStories (como los de la serie de Eldan y Li) existen, pero no se han incluido por falta de información detallada en los resultados de búsqueda.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset sintético generado por GPT-4, el modelo puede heredar sesgos presentes en el corpus original, aunque su tamaño reducido limita la complejidad de dichos sesgos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido inventado o incoherente, especialmente en contextos largos o temas fuera del dominio de historias infantiles.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero por el tamaño del modelo y el tipo de dataset, es probable que sea corta (posiblemente 512 o 1024 tokens). No apto para tareas que requieran contexto extenso.
- Limitaciones de idioma: solo inglés. No soporta otros idiomas.
- Restricciones de licencia: la licencia OpenMDW-1.1 es una licencia de código abierto con condiciones específicas (no es una licencia estándar tipo MIT o Apache). Es necesario revisar el texto completo de la licencia para verificar restricciones de uso comercial, atribución y redistribución.
- Caveat para producción: este modelo es un artefacto de investigación, no está diseñado para uso en producción. Su rendimiento en tareas reales será muy limitado y no debe usarse como componente crítico sin una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aplominski/TinyTransformer-Pre-RMSNorm-18M-TinyStories
- Colección de la serie Tiny Transformer Normalization: https://huggingface.co/collections/aplominski/tiny-transformer-normaliztaion
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
