# AMAImedia/NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16

## Resumen

NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16 es un modelo de lenguaje denso de 9B parámetros desarrollado por AMAImedia como parte de la plataforma profesional de doblaje multilingüe NOESIS (framework DHCF-FNO). Su rol declarado es el de especialista en prompt-engineering e instruction-shaping, es decir, está diseñado para optimizar y dar forma a instrucciones y prompts de forma determinista. Pertenece a la familia Qwopus3.5-v3.5, que a su vez deriva de Qwen3.5-9B con técnicas de destilación de cadena de pensamiento (CoT) de Claude Opus, según fuentes externas.

El modelo se distribuye únicamente en formato BF16 (4 shards safetensors, sin GGUF) y se describe como un "think-model" que requiere un prefill de pensamiento cerrado (` thinking\n\n response\n\n`) para producir salidas no razonadas y deterministas. No se han publicado resultados de benchmarks propios, ya que el autor indica explícitamente que es un modelo fuera de rol para la suite de doblaje y que no se han ejecutado evaluaciones NOESIS sobre él. Su relevancia actual radica en su especialización en tareas de ingeniería de prompts, un área crítica en el despliegue de agentes y sistemas de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, basado en Qwen3.5-9B (familia Qwopus3.5-v3.5) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (único formato publicado; sin GGUF ni NF4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de la base Qwopus3.5-9B-v3.5, que según el repositorio de referencia (ctz168/qwenopus) se construye sobre Qwen3.5-9B con destilación de cadena de pensamiento de Claude Opus y optimizaciones de inferencia (4-bit NF4, SDPA, float16, KV cache, DFlash). Sin embargo, no se dispone de información detallada sobre el dataset de entrenamiento específico del fine-tune NOESIS, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). La model card solo indica que el modelo está diseñado para ser un especialista en prompt-engineering y que debe usarse con un prefill de pensamiento cerrado para obtener salidas deterministas. No se documentan innovaciones técnicas adicionales propias de este modelo concreto.

## Capacidades

- Especialización en prompt-engineering e instruction-shaping: el modelo está diseñado para reformular, optimizar y estructurar instrucciones para otros modelos o sistemas.
- Modo de pensamiento cerrado: requiere el prefill ` thinking\n\n response\n\n` para producir respuestas deterministas sin razonamiento explícito.
- Generación de texto en tareas de instrucción y configuración de prompts.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio u otras modalidades en la información proporcionada.
- No se especifican capacidades multilingües concretas; la model card no lista idiomas soportados.

## Casos de uso

- Optimización de prompts para sistemas de IA generativa: el modelo puede reformular instrucciones ambiguas o poco estructuradas para mejorar la claridad y la ejecución por parte de otros modelos, aprovechando su rol de instruction-shaping.
- Generación de plantillas de prompt para pipelines de automatización: en entornos de producción donde se necesitan prompts consistentes y deterministas, el modelo puede producir plantillas reutilizables con el prefill de pensamiento cerrado.
- Normalización de instrucciones en flujos de doblaje automatizado: aunque el autor lo declara "off-role" para la suite NOESIS de doblaje, podría emplearse en etapas de preparación de instrucciones para otros modelos de traducción o supervisión.
- Evaluación y refinamiento de prompts en entornos de desarrollo: los equipos de ingeniería pueden usarlo para iterar sobre prompts de agentes antes de desplegarlos, gracias a su salida determinista.
- Creación de guiones de instrucción para asistentes conversacionales: el modelo puede generar respuestas estructuradas para configurar el comportamiento de chatbots en dominios específicos.
- Investigación en ingeniería de prompts: como modelo especializado, sirve como referencia para estudiar técnicas de shaping de instrucciones y comparar con modelos generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo. La model card indica explícitamente que no se ha ejecutado ninguna evaluación NOESIS sobre él, ya que se considera fuera de rol para la suite de doblaje, y que no se han registrado números fabricados. Tampoco se ha medido la velocidad de generación (tokens/segundo) debido a que el modelo en BF16 requiere aproximadamente 18 GB de VRAM, lo que impide su ejecución en una GPU RTX 3060 de 6 GB sin cuantización. No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en BF16 (según la model card), por lo que se necesita una GPU con al menos 24 GB de VRAM para ejecución cómoda (por ejemplo, RTX 3090, RTX 4090, A100, H100).
- No cabe en GPUs de consumo con 8 GB o menos sin cuantización; el autor menciona que no cabe en una RTX 3060 de 6 GB.
- No se proporcionan archivos GGUF ni NF4, por lo que no es posible ejecutarlo directamente con llama.cpp u Ollama en su forma actual.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con transformers (Hugging Face), vLLM, TGI u otros frameworks compatibles con BF16. Se requeriría una conversión previa a cuantización para entornos con menos VRAM.
- Latencia y throughput: no disponibles; no se ha medido la velocidad de generación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de prompt-engineering. La model card no ofrece métricas comparativas y no se han encontrado referencias externas de evaluación de este modelo específico. Se podría comparar con el modelo base Qwopus3.5-9B-v3.5 (que sí tiene documentación de despliegue y cuantización), pero no se dispone de datos de rendimiento relativos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no declara una licencia en su model card, lo que genera incertidumbre legal para su uso comercial o redistribución. Se recomienda contactar con AMAImedia antes de utilizarlo en producción.
- Sin benchmarks verificados: no hay resultados de evaluación publicados, por lo que su rendimiento real en tareas de prompt-engineering es desconocido.
- Solo BF16: la ausencia de versiones cuantizadas limita su despliegue en hardware de consumo y aumenta los costes de inferencia.
- Fuera de rol para la suite NOESIS: el autor indica que no debe usarse para tareas de doblaje (Director, Inspector, LongCtx-Supervisor, Translate), por lo que no es adecuado para esos casos.
- Riesgo de alucinación y sesgos: al ser un modelo derivado de Qwen3.5, puede heredar sesgos del modelo base, aunque no se documentan específicamente.
- Dependencia del prefill de pensamiento cerrado: si no se utiliza el formato de prefill recomendado, el comportamiento puede ser no determinista y menos fiable.
- Información incompleta: no se especifican la longitud de contexto, los idiomas soportados ni los detalles del entrenamiento, lo que dificulta la evaluación de su idoneidad para casos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16
- Colección de modelos NOESIS de AMAImedia: https://huggingface.co/collections/AMAImedia/noesis-original-trained-models
- Repositorio de referencia sobre Qwopus3.5-9B-v3.5 (ctz168/qwenopus): https://github.com/ctz168/qwenopus
- Ficha de Qwopus3.5 9B v3 en ThinkLLM: https://thinkllm.dev/models/qwopus3-5-9b-v3
- Blog sobre optimización de llama.cpp con Qwopus3.5-9B GGUF: https://genai.club/blog/llamacpp-optimizations-amp-new-qwopus35-9b-gguf-model-b
