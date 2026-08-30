# promotion/Qwen3-8B-NBPO

## Resumen

Qwen3-8B-NBPO es un modelo de lenguaje de 8 mil millones de parámetros desarrollado por el usuario "promotion" como un fine-tuning del modelo Qwen3-8B de Alibaba Cloud. Su nombre hace referencia a Nash Bargaining Preference Optimization (NBPO), un método de alineación multi-objetivo que optimiza simultáneamente cuatro objetivos (utilidad, veracidad, honestidad y seguimiento de instrucciones) mediante un enfoque de negociación de Nash. El modelo se entrena desde Qwen3-8B como política de referencia e inicialización, y según su model card, supera a todos los baselines en el panel de evaluación en términos de superávit mínimo y promedio.

Este modelo es relevante porque aborda el problema de la alineación multi-objetivo, un área activa de investigación en IA, y ofrece una alternativa a los métodos tradicionales de RLHF o DPO al buscar un equilibrio óptimo entre objetivos en conflicto. Al estar basado en Qwen3-8B, hereda su arquitectura transformer densa y su soporte para modos de razonamiento híbrido (thinking y no-thinking). El modelo se distribuye bajo licencia Apache-2.0 en el frontmatter de HuggingFace, aunque la model card menciona la licencia Qwen3, lo que genera una ambigüedad que se detalla más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32K tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B soporta 119 idiomas, pero no se especifica para este fine-tuning) |
| Licencia | Apache-2.0 (frontmatter) / Qwen3 (model card) — ambigua |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-8B, un transformer denso con atención de escala completa y una arquitectura estándar de decoder-only. Qwen3-8B incorpora un mecanismo de razonamiento híbrido que permite alternar entre un modo "thinking" (que genera una cadena de razonamiento interna) y un modo "non-thinking" (respuesta directa). En este fine-tuning, el entrenamiento con NBPO utiliza el template de chat de Qwen3, que emite un bloque vacío de `thinking response` para forzar respuestas directas. La model card advierte que si no se usa el tokenizer incluido en este repositorio, el modelo podría razonar en voz alta y generar secuencias que terminan dentro del rastro de razonamiento, corrompiendo la señal de preferencia.

El método NBPO (Nash Bargaining Preference Optimization) es una innovación técnica que formula la alineación como un problema de negociación entre múltiples objetivos. En lugar de optimizar una suma ponderada fija, NBPO busca el punto de equilibrio de Nash donde ningún objetivo puede mejorar sin empeorar otro. El entrenamiento se realiza sobre el modelo base Qwen3-8B, que actúa tanto como política de referencia como inicialización. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas adicionales como RLHF o DPO (aunque NBPO es una variante de optimización de preferencias).

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3-8B, conserva las capacidades de comprensión y generación de lenguaje del modelo base, incluyendo razonamiento matemático, codificación y conocimiento general.
- Razonamiento híbrido: soporta modos thinking y non-thinking, aunque este fine-tuning se entrena específicamente para respuestas directas (non-thinking) mediante el bloque vacío de razonamiento.
- Alineación multi-objetivo: según la model card, el modelo mejora simultáneamente cuatro objetivos (utilidad, veracidad, honestidad y seguimiento de instrucciones) con respecto a la política de referencia.
- Multilingüismo: aunque no se confirma para este fine-tuning, el modelo base Qwen3-8B soporta 119 idiomas y dialectos, por lo que es probable que herede estas capacidades.
- Integración con herramientas: el modelo base Qwen3-8B soporta function calling y MCP (Model Context Protocol), capacidades que podrían mantenerse en este fine-tuning, aunque no se documentan explícitamente.
- Requisito de tokenizer específico: el modelo debe usarse con el tokenizer incluido en este repositorio, no con el tokenizer estándar de Qwen3-8B, para garantizar el comportamiento esperado.

## Casos de uso

- Asistentes conversacionales con alineación reforzada: el modelo puede integrarse en chatbots donde se priorice la veracidad y la honestidad, gracias a su optimización multi-objetivo que mejora estas métricas frente al modelo base.
- Evaluación de preferencias en investigación: al ser un ejemplo de NBPO, puede utilizarse como referencia en estudios académicos sobre alineación multi-objetivo y comparación de métodos de optimización de preferencias.
- Generación de respuestas directas en producción: su entrenamiento para no razonar en voz alta lo hace adecuado para aplicaciones donde se requieren respuestas concisas y sin cadenas de razonamiento intermedias, como sistemas de FAQ o chatbots de atención al cliente.
- Fine-tuning adicional: al estar basado en Qwen3-8B, puede servir como punto de partida para tareas específicas que requieran un modelo ya alineado en múltiples objetivos, reduciendo la necesidad de alineación posterior.
- Benchmarking de alineación: las generaciones del modelo están disponibles en un dataset público (`promotion/nbpo-benchmark-generations`), lo que permite a otros investigadores reproducir los resultados y comparar con sus propios métodos.
- Despliegue en entornos con recursos limitados: con 8B parámetros, el modelo puede ejecutarse en GPUs de consumo (con cuantización) y en servidores de gama media, lo que facilita su uso en aplicaciones locales o on-premise.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), sino métricas de superávit (surplus) sobre la política de referencia en un conjunto de evaluación de 100 prompts, utilizando un oráculo Qwen3-32B y promediando sobre ambos órdenes de presentación. Los resultados son los siguientes:

| Objetivo | Superávit |
|---|---|
| Utilidad (helpfulness) | +0.0719 |
| Veracidad (truthfulness) | +0.0180 |
| Honestidad (honesty) | +0.0427 |
| Seguimiento de instrucciones | +0.0307 |
| **Mínimo** | **+0.0180** |
| **Promedio** | **+0.0408** |

Estos valores indican una mejora consistente frente al modelo base en todos los objetivos evaluados, con el mayor incremento en utilidad y el menor en veracidad. No se proporcionan comparaciones con otros modelos de la misma familia ni con métodos alternativos de alineación.

## Requisitos de hardware

- VRAM estimada: al tener 8.190 millones de parámetros, el modelo en precisión FP16 (tamaño del repo: 32,8 GB) requiere aproximadamente 16-17 GB de VRAM para inferencia. Con cuantización INT8, se reduce a unos 8-9 GB, y con INT4 a unos 4-5 GB (estimaciones estándar para modelos de este tamaño; no se han publicado cuantizaciones oficiales para este fine-tuning).
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para cuantización INT4, cabría en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- Opciones de despliegue: al ser un modelo safetensors compatible con Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF) u Ollama (mediante conversión). No se proporcionan configuraciones oficiales de despliegue.
- Latencia y throughput: no disponibles. Dependerán del hardware, la cuantización y el backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8,19B | 32K (documentado en el modelo base) | Apache-2.0 | Modelo original sin fine-tuning de alineación |
| Qwen3-8B-NBPO (este) | 8,19B | no disponible | Apache-2.0 (frontmatter) / Qwen3 (model card) | Fine-tuning con NBPO multi-objetivo |
| NexaAI/Qwen3-8B-NPU | 8,19B | no disponible | no disponible | Fine-tuning de Qwen3-8B orientado a NPU (según búsqueda web) |

No se dispone de datos de rendimiento comparativos entre estos modelos en benchmarks estándar. La comparativa se limita a características técnicas generales.

## Limitaciones y advertencias

- Ambigüedad de licencia: el frontmatter de HuggingFace indica Apache-2.0, pero la model card afirma "Released under the Qwen3 licence". Esta discrepancia debe resolverse antes de un uso comercial; la licencia Qwen3 puede tener restricciones adicionales.
- Tokenizer obligatorio: el modelo requiere el tokenizer incluido en este repositorio. Usar el tokenizer estándar de Qwen3-8B provocará que el modelo razone en voz alta y las generaciones se corrompan, según la model card.
- Datos de entrenamiento no publicados: no se especifica la composición del dataset de preferencias ni el número de tokens de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones de cobertura.
- Sin benchmarks estándar: las métricas de superávit se basan en un oráculo Qwen3-32B y 100 prompts, un tamaño de evaluación pequeño que puede no ser representativo de tareas reales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Capacidades multilingües no confirmadas: aunque el modelo base soporta 119 idiomas, no se verifica si el fine-tuning mantiene este soporte o si puede degradarlo en idiomas de baja representación.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF, AWQ o GPTQ, por lo que el despliegue en hardware de consumo requerirá conversión manual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/promotion/Qwen3-8B-NBPO
- Dataset de generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
