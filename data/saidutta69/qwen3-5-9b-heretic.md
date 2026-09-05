# saidutta69/Qwen3.5-9B-heretic

## Resumen

Qwen3.5-9B-heretic es una variante del modelo Qwen3.5-9B de Alibaba, desarrollada por saidutta69 (RACER IS OP) mediante la técnica de abliteración direccional implementada en la herramienta Heretic v1.4.0. El objetivo es eliminar el comportamiento de rechazo del modelo base sin recurrir a un reentrenamiento completo, editando selectivamente las direcciones de peso responsables de las respuestas de rechazo. El resultado es un modelo conversacional de 9.409 millones de parámetros que mantiene las capacidades de razonamiento y de agente del modelo original, pero con una capa de seguridad suprimida. Está disponible en formato safetensors y en cuantizaciones GGUF (F16, Q4_K_M, Q5_K_M, Q6_K y Q8_0), lo que permite ejecutarlo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Qwen3.5 hybrid linear-attention) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16, Q4_K_M, Q5_K_M, Q6_K, Q8_0; safetensors sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research-license |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-9B es híbrida, combinando atención lineal con mecanismos de atención estándar, según se indica en la model card. Esta variante no ha sido reentrenada; en su lugar, se aplicó abliteración direccional con Heretic v1.4.0, que identifica y edita las direcciones de peso en las salidas de atención y en las proyecciones down de los MLP que se correlacionan con el comportamiento de rechazo. La edición es extremadamente estrecha: la divergencia KL con respecto al modelo base es de 0,0015, lo que indica que la distribución de salida apenas cambia y que las capacidades del modelo permanecen prácticamente intactas. No se proporcionan datos sobre el conjunto de entrenamiento del modelo base ni sobre procesos de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multilingüe y capacidades agénticas (multi-step reasoning) heredadas del modelo base, según la model card.
- Respuesta a peticiones que el modelo base rechazaría, al haber suprimido los mecanismos de rechazo.
- Sin capa de filtrado de seguridad adicional; el modelo cumple de forma deliberada con peticiones potencialmente dañinas.
- No es una mejora de capacidades sobre el modelo base: el rendimiento en razonamiento y conocimiento es el mismo, solo cambia el comportamiento de rechazo.
- Compatible con herramientas de inferencia como llama.cpp, Ollama, LM Studio, Jan, vLLM y SGLang.
- Soporte de tool calling: no disponible (no se especifica en la información).

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un modelo de lenguaje cuando se eliminan los guardarraíles, comparando sus respuestas con el modelo base para analizar la eficacia de la abliteración.
- Evaluación de alineación y robustez: puede usarse como modelo de referencia en benchmarks de refusals, como el que se incluye en la model card, para medir la tasa de rechazo ante prompts adversarios.
- Generación de ficción y roleplay sin restricciones: dado que no rechaza peticiones de contenido que el base consideraría inapropiado, es adecuado para entornos de escritura creativa donde se requiera libertad temática.
- Desarrollo de agentes conversacionales en entornos controlados: su capacidad agéntica y su baja tasa de rechazo permiten construir agentes que manejen conversaciones multi-turno sin interrupciones por políticas de seguridad.
- Base para fine-tuning posterior: al conservar el conocimiento del modelo base, puede utilizarse como punto de partida para ajustes finos en dominios específicos que requieran una menor censura.
- Pruebas de herramientas de inferencia: al estar disponible en múltiples cuantizaciones GGUF, sirve para validar el rendimiento de llama.cpp, Ollama u otros motores en hardware de consumo.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen3.5-9B (base) |
|---|---|---|
| Rechazos (sobre 100 prompts adversarios) | 79/100 | 86/100 |
| Divergencia KL respecto al base | 0,0015 | 0 (por definición) |

Nota: No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos anteriores proceden de la evaluación realizada con Heretic v1.4.0 sobre 100 prompts dañinos y 100 prompts inofensivos.

## Requisitos de hardware

- VRAM estimada para inferencia: basándose en los tamaños de los archivos GGUF, se requieren aproximadamente 6 GB para Q4_K_M (5,63 GB), 7 GB para Q5_K_M (6,47 GB), 8 GB para Q6_K (7,36 GB), 10 GB para Q8_0 (9,53 GB) y 18 GB para F16 (17,92 GB), más overhead de ejecución.
- GPU recomendadas: el autor indica que se ejecuta bien en una GPU de 12 GB (por ejemplo, RTX 3060 12GB) o en hardware de consumo con las cuantizaciones Q4_K_M o Q5_K_M. Para F16 se recomienda una GPU con al menos 20 GB de VRAM, como RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, con las cuantizaciones Q4_K_M y Q5_K_M en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (con `llama serve -hf saidutta69/Qwen3.5-9B-heretic`), Ollama, LM Studio, Jan, vLLM, SGLang y transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-heretic | 9.409.813.744 | no disponible | qwen-research-license | Variante abliterada, sin rechazos |
| Qwen3.5-9B (base) | 9.409.813.744 | no disponible | qwen-research-license | Modelo original con rechazos |
| Qwen3-8B-heretic | no disponible | no disponible | Apache 2.0 (según la búsqueda) | Variante abliterada de Qwen3-8B, del mismo autor |

Nota: La comparativa se basa en la información disponible. Los datos de Qwen3-8B-heretic proceden de la página de HuggingFace del mismo autor; no se dispone de especificaciones detalladas.

## Limitaciones y advertencias

- Sesgos: el modelo hereda las limitaciones factuales y los sesgos del modelo base Qwen3.5-9B, ya que la abliteración no elimina sesgos ni añade criterio.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir información falsa o inventada, especialmente en temas donde el conocimiento del modelo base es limitado.
- Limitaciones de contexto e idioma: la model card declara únicamente inglés como idioma soportado, aunque el modelo base es multilingüe. La longitud de contexto no está especificada.
- Restricciones de licencia: la licencia qwen-research-license es una licencia de investigación; puede imponer restricciones para uso comercial. Es responsabilidad del usuario revisar los términos completos.
- Ausencia de filtros de seguridad: el modelo cumplirá con peticiones que el base rechazaría, incluidas algunas que no debería. No hay capa de filtrado adicional, por lo que el despliegue en producción requiere supervisión humana y políticas de uso estrictas.

## Enlaces

- HuggingFace: https://huggingface.co/saidutta69/Qwen3.5-9B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Artículo original sobre abliteración: https://huggingface.co/blog/mlabonne/abliteration
- Modelo relacionado del mismo autor: https://huggingface.co/saidutta69/Qwen3-8B-heretic
