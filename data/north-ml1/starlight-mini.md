# North-ML1/starlight-mini

## Resumen

Starlight Mini es un modelo de generación de texto y código desarrollado por North ML, un proyecto que se presenta como una iniciativa para abordar la escasez de desarrolladores ofreciendo modelos de forma gratuita. Se trata de un ajuste fino (fine-tuning) realizado sobre el modelo base `arthu1/astrocoder-star-merge`, que a su vez es una fusión de otros modelos no especificados. El autor afirma haberlo entrenado para alcanzar entre un 60 y un 65 por ciento en el benchmark SWE-Bench, aunque no se han publicado resultados detallados.

El modelo tiene aproximadamente 7.600 millones de parámetros (7.615.616.512) y se distribuye en formato safetensors. Según las etiquetas de HuggingFace, la arquitectura subyacente es Qwen2, lo que sugiere que hereda las características de dicha familia, aunque no se especifica la longitud de contexto exacta. Está orientado a tareas de conversación y generación de código, con soporte únicamente para el idioma inglés.

La relevancia de este modelo radica en su enfoque en la resolución de problemas de programación reales, como los planteados en SWE-Bench, y en su licencia MIT, que permite uso comercial sin restricciones. Sin embargo, al ser un proyecto reciente con pocas descargas (14) y sin documentación técnica extensa, debe considerarse como una propuesta experimental más que como una solución madura para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (según etiquetas de HuggingFace) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; se pueden generar cuantizaciones GGUF/AWQ manualmente) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (según la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se corresponde con la familia Qwen2, según las etiquetas del repositorio. Esto implica un transformer decoder-only con atención multi-cabeza y normalización RMSNorm, aunque no se detallan variantes específicas como el número de capas o cabezas de atención. El modelo se obtiene mediante un ajuste fino sobre `arthu1/astrocoder-star-merge`, que es a su vez una fusión de modelos previos no documentados.

El entrenamiento se realizó sobre el dataset `HuggingFaceH4/ultrachat_200k`, un conjunto de datos conversacionales en inglés. No se especifica el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El autor menciona que el objetivo era alcanzar un rendimiento de 60-65% en SWE-Bench, un benchmark que evalúa la capacidad de resolver issues reales de GitHub, lo que indica un enfoque en tareas de ingeniería de software. No hay información sobre innovaciones técnicas adicionales, como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: entrenado con Ultrachat, es capaz de mantener diálogos multi-turno en inglés.
- Generación de código: el ajuste orientado a SWE-Bench sugiere capacidad para comprender y modificar código fuente, aunque no se detallan lenguajes específicos.
- Resolución de problemas de software: el autor afirma un rendimiento de 60-65% en SWE-Bench, lo que implicaría cierta habilidad para corregir bugs y aplicar parches.
- Soporte de tool calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no, solo inglés.
- Modo de razonamiento especial (thinking mode): no documentado.
- Visión o audio: no, es un modelo de texto puro.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en su estación de trabajo para obtener sugerencias de código, explicaciones de fragmentos o ayuda para depurar errores. Su tamaño de ~7,6B permite inferencia en GPUs de consumo con cuantización.
- Automatización de corrección de bugs en repositorios pequeños: gracias al ajuste en SWE-Bench, el modelo podría proponer parches para issues simples en proyectos open source, aunque requiere supervisión humana.
- Chatbot técnico para documentación interna: integrado en un sistema de chat, puede responder preguntas sobre APIs o prácticas de programación en inglés, aprovechando su entrenamiento conversacional.
- Generación de tests unitarios: el modelo puede generar casos de prueba a partir de una función o clase dada, útil para equipos que buscan aumentar la cobertura de código.
- Educación en programación: como tutor interactivo, puede explicar conceptos, revisar ejercicios y proporcionar ejemplos de código, funcionando en entornos con recursos limitados.
- Prototipado rápido de scripts: para tareas de automatización o análisis de datos, el modelo puede generar scripts en Python u otros lenguajes a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una afirmación del autor de un rendimiento de 60-65% en SWE-Bench, pero no se aportan detalles sobre la metodología, el conjunto de evaluación exacto ni comparaciones con otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,6B parámetros en FP16 se necesitan aproximadamente 15 GB de VRAM; en 8-bit (int8) unos 8 GB; en 4-bit (int4) unos 4-5 GB. Estas cifras son estimaciones orientativas.
- GPU recomendadas: para FP16, una NVIDIA RTX 4080/4090 o A100; para 4-bit, una RTX 3060 o superior.
- Compatibilidad con GPUs de consumo: sí, si se aplica cuantización 4-bit u 8-bit, puede ejecutarse en GPUs con 8 GB o menos de VRAM.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (tras convertir a GGUF). También es compatible con Ollama si se genera el archivo Modelfile.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, se espera una latencia de unos 20-50 ms por token en FP16, dependiendo del hardware y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para Starlight Mini. Se puede comparar estructuralmente con otros modelos densos de ~7-8B:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Starlight Mini | ~7,6B | No disponible | MIT | HuggingFace |
| Llama 3 8B | 8B | 8K (ampliable) | Llama 3 license | HuggingFace |
| Mistral 7B | 7,3B | 32K | Apache 2.0 | HuggingFace |
| Qwen2.5 7B | 7,6B | 32K | Apache 2.0 | HuggingFace |

Starlight Mini es un fine-tune de un merge, mientras que los otros son modelos base con ecosistemas más amplios y documentación extensa. Su principal diferenciador es la licencia MIT, que permite uso comercial sin restricciones, y su enfoque específico en SWE-Bench, aunque sin evidencia pública de rendimiento.

## Limitaciones y advertencias

- No hay información sobre sesgos o alucinaciones; al ser un modelo pequeño y entrenado con un dataset limitado, es probable que presente errores factuales y de razonamiento.
- La afirmación de rendimiento en SWE-Bench (60-65%) proviene del autor y no ha sido verificada de forma independiente.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- No se documentan capacidades de tool calling ni integración con agentes, por lo que no es adecuado para pipelines complejos sin adaptación.
- La longitud de contexto no está especificada; si hereda la de Qwen2 (32K), podría manejar conversaciones largas, pero no está confirmado.
- El modelo base (`arthu1/astrocoder-star-merge`) no tiene documentación pública, lo que dificulta evaluar su procedencia y posibles sesgos heredados.
- Al ser un proyecto con muy pocas descargas y sin mantenimiento activo aparente, no se garantiza soporte ni actualizaciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/North-ML1/starlight-mini)
- [Modelo base: arthu1/astrocoder-star-merge](https://huggingface.co/arthu1/astrocoder-star-merge)
- [Dataset de entrenamiento: HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
