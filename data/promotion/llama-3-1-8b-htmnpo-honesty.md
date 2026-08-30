# promotion/Llama-3.1-8B-HTMNPO-honesty

## Resumen

El modelo `promotion/Llama-3.1-8B-HTMNPO-honesty` es un fine-tune del modelo `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario `promotion` en Hugging Face. Forma parte de una familia de modelos de alineación multi-objetivo basados en optimización de preferencias mediante negociación de Nash (Nash Bargaining Preference Optimization, NBPO). Este modelo concreto representa el "vértice" de objetivo único donde todo el peso se asigna a la honestidad, en contraste con otros brazos que combinan objetivos como utilidad, veracidad o seguimiento de instrucciones.

El problema que resuelve es el de alinear modelos de lenguaje con múltiples criterios de calidad (honestidad, veracidad, utilidad, seguimiento de instrucciones) de forma controlada y transparente. Su relevancia radica en que demuestra cómo un ajuste fino con un oráculo de preferencias externo puede mejorar métricas específicas sin degradar otras, ofreciendo un punto de partida para sistemas que prioricen la honestidad sobre otros atributos. La arquitectura es un transformer denso de 8.030 millones de parámetros, basado en Llama 3.1, con una longitud de contexto no especificada en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (heredados del modelo base, no confirmados) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (tamaño del repo: 32,1 GB, presumiblemente FP32) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia como inicialización. El entrenamiento emplea un esquema de optimización de preferencias multi-objetivo basado en negociación de Nash (NBPO). Se evalúan cuatro objetivos —seguimiento de instrucciones, veracidad, honestidad y utilidad— sobre prompts del dataset UltraFeedback, utilizando un oráculo de preferencias basado en `Qwen3-32B` con prompting. Cada "brazo" de la familia comparte el mismo conjunto de pares de preferencias, el mismo optimizador y el mismo presupuesto de entrenamiento, diferenciándose únicamente en la agregación de los objetivos. En este caso, todo el peso se asigna a la honestidad, lo que produce un modelo que maximiza ese objetivo específico.

No se han publicado detalles adicionales sobre el número de pasos, la tasa de aprendizaje o la composición exacta del dataset de entrenamiento. La innovación principal reside en la metodología de agregación multi-objetivo mediante negociación de Nash, que permite un control fino sobre el equilibrio entre criterios.

## Capacidades

- Generación de texto y diálogo multilingüe (heredado del modelo base, aunque no se confirma en la documentación).
- Razonamiento y comprensión de instrucciones complejas, con mejoras específicas en honestidad y veracidad según los datos de excedente.
- Seguimiento de instrucciones con un excedente de +0,0215 sobre el modelo base.
- Mejora en honestidad (+0,0250) y veracidad (+0,0273) evaluadas por un oráculo externo.
- Utilidad mejorada (+0,0749), lo que sugiere que el modelo también es más servicial que la referencia.
- No se documentan capacidades especiales como tool calling, agentes o visión; se asume que hereda las del modelo base, pero no se confirma.

## Casos de uso

- Asistentes de información médica o legal: el énfasis en honestidad reduce la probabilidad de afirmaciones falsas, adecuado para entornos donde la precisión es crítica.
- Generación de contenido factual para publicaciones o informes: la mejora en veracidad ayuda a minimizar alucinaciones en textos basados en hechos.
- Sistemas de atención al cliente con respuestas transparentes: el modelo puede reconocer límites de conocimiento y evitar inventar respuestas, mejorando la confianza del usuario.
- Herramientas de verificación de datos: como componente de un pipeline que genera explicaciones o resúmenes de datos verificados, priorizando la honestidad sobre la fluidez.
- Chatbots educativos: donde se espera que el modelo admita incertidumbre y no proporcione información errónea a estudiantes.
- Investigación en alineación de modelos: sirve como punto de referencia para estudiar el impacto de la optimización multi-objetivo en el comportamiento de un LLM de 8B.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona el excedente (surplus) sobre el modelo base, medido con 100 prompts de UltraFeedback y evaluado por un oráculo `Qwen3-32B` con promediado de orden de presentación:

| Objetivo | Excedente sobre la referencia |
|---|---|
| Seguimiento de instrucciones | +0,0215 |
| Veracidad | +0,0273 |
| Honestidad | +0,0250 |
| Utilidad | +0,0749 |
| **Mínimo** | +0,0215 |

Estos datos indican una mejora consistente en todos los objetivos, con el mínimo en +0,0215, lo que sugiere que el modelo no sacrifica ningún criterio de forma significativa. No se dispone de comparaciones con otros modelos en métricas estándar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B con pesos en FP32 (32,1 GB), se necesitan al menos 32 GB de VRAM para cargarlo sin cuantización. Con FP16, se requerirían ~16 GB; con cuantización de 4 bits, ~5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) es suficiente. Para FP32, se requiere una GPU con 40 GB o más (A100, H100).
- En consumer GPU: sí, es posible ejecutarlo en RTX 3090/4090 con cuantización (por ejemplo, GGUF de 4 bits) o en FP16 si se dispone de 24 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints, entre otros.
- Latencia y throughput: no se han publicado datos específicos; dependerá del hardware y la cuantización. Para un modelo de 8B, se espera una latencia de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `promotion/Llama-3.1-8B-HTMNPO-honesty` | 8B | No disponible | Llama 3.1 | Fine-tune multi-objetivo (honestidad) |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K (no confirmado) | Llama 3.1 | Modelo base instruct |
| `promotion/Llama-3.1-8B-NBPO-600step` | 8B | No disponible | Llama 3.1 | Fine-tune NBPO (600 pasos, sin especificar objetivo) |

La comparación directa con el modelo base muestra mejoras en los cuatro objetivos evaluados. Frente a otros brazos de la misma familia (como el de 600 pasos), no se dispone de datos comparativos en la información proporcionada. No se han encontrado otros modelos de 8B con enfoque específico en honestidad mediante NBPO.

## Limitaciones y advertencias

- Sesgos y alucinaciones: aunque el modelo mejora la honestidad, no la garantiza; sigue siendo un LLM de 8B con limitaciones inherentes y puede generar información falsa o sesgada.
- Contexto limitado: la longitud de contexto no se especifica; se asume que hereda los 128K tokens de Llama 3.1, pero no está confirmado.
- Idiomas: no se documentan los idiomas soportados; el modelo base es multilingüe, pero el fine-tune podría haber afectado a lenguas de baja representación.
- Licencia: la Llama 3.1 Community License permite uso comercial, pero con restricciones para empresas con más de 700 millones de usuarios mensuales, que requieren una licencia comercial de Meta.
- Dependencia del oráculo: el entrenamiento depende de un oráculo de preferencias (Qwen3-32B), lo que puede introducir sesgos del propio oráculo en la evaluación.
- Sin benchmarks estándar: no hay resultados en MMLU, HumanEval, etc., lo que dificulta la comparación con otros modelos en tareas generales.
- Repo sin adopción: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/promotion/Llama-3.1-8B-HTMNPO-honesty)
- [Dataset de generaciones del benchmark NBPO](https://huggingface.co/datasets/promotion/nbpo-benchmark-generations)
- [Modelo relacionado: Llama-3.1-8B-NBPO-600step](https://huggingface.co/promotion/Llama-3.1-8B-NBPO-600step)
- [Página oficial de Llama 3 de Meta](https://developer.meta.com/ai/models/llama-3/)
- [Model card de Llama 3.1 8B Instruct en NVIDIA NIM](https://build.nvidia.com/meta/llama-3_1-8b-instruct/modelcard)
- [Repositorio oficial de Llama 3 en GitHub](https://github.com/meta-llama/llama3)
