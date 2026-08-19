# alextsiak/qwen3-4b-green-claims-multi

## Resumen

El modelo `alextsiak/qwen3-4b-green-claims-multi` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3-4B-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del modelo Qwen3-4B de Alibaba. El autor, alextsiak, lo ha entrenado con la librería Unsloth, que acelera el entrenamiento y reduce el consumo de memoria. El nombre sugiere que está especializado en la detección y análisis de "green claims" (afirmaciones ecológicas o de sostenibilidad) y que soporta múltiples idiomas, aunque la model card solo indica inglés como idioma soportado.

Este modelo está orientado a tareas de clasificación o análisis de texto relacionadas con declaraciones medioambientales, un área relevante para la verificación de publicidad verde, cumplimiento regulatorio y auditoría de sostenibilidad. Al estar basado en Qwen3-4B, hereda la arquitectura transformer densa de 4 mil millones de parámetros y la capacidad de razonamiento en modo pensante y no pensante del modelo original, aunque el ajuste fino puede haber modificado su comportamiento específico. La licencia Apache-2.0 permite uso comercial y modificación, lo que facilita su integración en aplicaciones empresariales.

La ficha se basa únicamente en la información disponible en HuggingFace y en las búsquedas web asociadas. Muchos detalles técnicos del fine-tune (dataset, método de entrenamiento, métricas) no han sido publicados, por lo que se indican como "no disponible" cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4B (heredados del modelo base, no confirmado para el fine-tune) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta 32K tokens, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | el modelo base está cuantizado en 4 bits (bnb-4bit); el fine-tune se distribuye en safetensors, formato no cuantizado |
| Idiomas soportados | en (según la model card); el nombre sugiere "multi", pero no se confirma |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Qwen3-4B-unsloth-bnb-4bit`, que es la versión cuantizada en 4 bits de Qwen3-4B. Qwen3-4B es un modelo transformer denso con 4 mil millones de parámetros, desarrollado por Alibaba, que integra dos modos de inferencia: "thinking" (razonamiento multi-paso) y "non-thinking" (respuesta rápida). El entrenamiento del fine-tune se realizó con la librería Unsloth, que optimiza el proceso mediante kernels personalizados y reducción de memoria, logrando un entrenamiento aproximadamente 2 veces más rápido que el estándar. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El repositorio de GitHub `alextsiak/green-claim-detection` podría contener más información sobre el proceso, pero su contenido no ha sido analizado en esta ficha.

## Capacidades

- Generación de texto en inglés, con posible soporte multilingüe no confirmado.
- Clasificación o análisis de afirmaciones ecológicas (green claims), según el nombre del modelo y el repositorio asociado.
- Hereda las capacidades de razonamiento del modelo base Qwen3-4B, incluyendo modo thinking para tareas complejas y modo non-thinking para respuestas rápidas.
- No se ha confirmado soporte para tool calling, function calling, ni capacidades multimodales (visión, audio).
- La cuantización 4 bits del modelo base puede afectar ligeramente la precisión, pero permite inferencia con menos recursos.

## Casos de uso

- Verificación de publicidad verde: el modelo puede analizar anuncios o etiquetas de productos para detectar afirmaciones ecológicas engañosas o sin fundamento, ayudando a cumplir normativas como la directiva europea sobre greenwashing.
- Auditoría de informes de sostenibilidad: procesar documentos corporativos para extraer y evaluar declaraciones medioambientales, facilitando el trabajo de consultores y auditores.
- Clasificación de textos en plataformas de revisión: identificar comentarios o reseñas que mencionen aspectos ecológicos de productos o servicios, útil para análisis de sentimiento sectorial.
- Monitorización de campañas de marketing: analizar campañas publicitarias en redes sociales o web para detectar posibles incumplimientos de códigos de conducta sobre publicidad ecológica.
- Asistente para redacción de declaraciones ambientales: ayudar a redactar afirmaciones de sostenibilidad que sean precisas y verificables, reduciendo el riesgo legal.
- Investigación académica: analizar corpus de textos para estudiar la evolución del discurso sobre sostenibilidad en diferentes medios o idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo fine-tune. El modelo base Qwen3-4B tiene resultados publicados en el reporte técnico de Qwen3, pero no se pueden atribuir directamente a este fine-tune sin verificación.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B parámetros en formato safetensors (no cuantizado), la inferencia en FP16 requiere aproximadamente 8 GB de VRAM. Si se cuantiza a 4 bits, se reduce a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (p. ej., RTX 3070, RTX 4080, A10). Para cuantización 4 bits, una GPU con 4 GB puede ser suficiente (p. ej., RTX 3050, GTX 1660).
- Es viable en GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, Ollama o llama.cpp (si se convierte a GGUF). El tag `text-generation-inference` sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 4B en una GPU moderna (RTX 4090) puede generar entre 50 y 100 tokens por segundo en FP16, pero no hay datos específicos para este fine-tune.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas específicas de detección de green claims. Como referencia del modelo base, se puede comparar Qwen3-4B con otros modelos de 4B como Llama-3.2-3B o Phi-3.5-mini, pero el fine-tune no tiene métricas publicadas. La comparativa queda pendiente de datos.

## Limitaciones y advertencias

- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o cobertura limitada de ciertos dominios.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir afirmaciones incorrectas o inventadas, especialmente en tareas de clasificación si no se valida con fuentes externas.
- El modelo solo indica inglés como idioma soportado, a pesar del nombre "multi". Se debe verificar su comportamiento en otros idiomas antes de usarlo en producción.
- Al ser un fine-tune de una versión cuantizada en 4 bits, puede haber una degradación de precisión respecto al modelo original en tareas complejas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene su propia licencia (Apache-2.0 también), por lo que no hay restricciones adicionales conocidas.
- No se han proporcionado ejemplos de uso ni instrucciones de prompting, lo que dificulta su implementación inmediata.

## Enlaces

- [Modelo en HuggingFace: alextsiak/qwen3-4b-green-claims-multi](https://huggingface.co/alextsiak/qwen3-4b-green-claims-multi)
- [Modelo base: unsloth/Qwen3-4B-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit)
- [Modelo Qwen3-4B original](https://huggingface.co/Qwen/Qwen3-4B)
- [Repositorio GitHub de Qwen3](https://github.com/QwenLM/Qwen3)
- [Repositorio GitHub: alextsiak/green-claim-detection](https://github.com/alextsiak/green-claim-detection)
- [Reporte técnico de Qwen3 en arXiv](https://arxiv.org/html/2505.09388v1)
