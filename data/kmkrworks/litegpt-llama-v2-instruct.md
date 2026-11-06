# kmkrworks/LiteGPT-Llama-V2-Instruct

## Resumen

LiteGPT-Llama-V2-Instruct es la variante conversacional (instruction-tuned) de LiteGPT V2, un modelo de lenguaje de 201.373.952 parámetros desarrollado desde cero por el autor independiente kmkrworks. Se obtiene tras tres épocas de fine-tuning sobre conversaciones curadas a partir del modelo base kmkrworks/LiteGPT-V2-Base, y está pensado explícitamente para investigación y aprendizaje, no para producción sin salvaguardas adicionales.

El modelo emplea una arquitectura transformer densa (etiquetada como qwen3/llama en sus tags) con una ventana de contexto de 4.096 tokens y un template de chat propio denominado `litegpt-chat-v1`. Su interés principal no reside en el rendimiento absoluto, sino en la trazabilidad: cada paso del entrenamiento, los datasets utilizados y los resultados de evaluación están documentados públicamente en el repositorio del proyecto.

Frente a su predecesor V1-Instruct, mejora la adherencia a instrucciones un 55% en IFEval (0,129 frente a 0,083) y pasa de no resolver ningún problema de código a resolver 7 de 164 en HumanEval y un 4,2% en MBPP. Aun así, queda muy por debajo de modelos del mismo orden de magnitud como Qwen3-0.6B o Gemma 3 270M-it, por lo que su valor es formativo y experimental más que competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tags: qwen3, llama); sin código remoto en Transformers |
| Parametros totales | 201.373.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 para pesos, MIT para código; aviso "Built with Llama / Built with Qwen" |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

LiteGPT V2 Instruct es un transformer denso de 201M parámetros entrenado desde cero (no es un fine-tune de un modelo preexistente, aunque los tags incluyan qwen3 y llama por la procedencia de los datos sintéticos). El fine-tuning conversacional se realizó durante 3 épocas y 14.000 pasos con pérdida calculada solo sobre los turnos del asistente (assistant-only loss) y una tasa de aprendizaje máxima de 6e-4. La pérdida de validación descendió en cada época: 1,1323, 1,0518 y 1,0238.

Los datos de conversación suman 385.677 conversaciones (497M tokens) y proceden de smol-magpie-ultra (generado por Llama-3.1-405B-Instruct) y de las porciones reservadas de smol-summarize, smol-rewrite y smol-constraints (generadas por Qwen2.5-72B-Instruct), todas con licencia Apache-2.0. El modelo base se entrenó previamente con el corpus descrito en la model card de LiteGPT-V2-Base. No se documenta en la información disponible el uso de RLHF o DPO; el ajuste es supervisado. El template de chat `litegpt-chat-v1` va incluido en el repositorio y el modelo carga en Transformers sin código remoto.

## Capacidades

- Generación de texto conversacional multi-turno en inglés con template de chat propio.
- Seguimiento de instrucciones básicas (IFEval 0,129), superior al de V1-Instruct pero limitado.
- Generación de código incipiente: resuelve 7 de 164 problemas de HumanEval (4,3%) y un 4,2% de MBPP.
- Razonamiento matemático muy limitado: 2,2% en GSM8K en modo chat.
- Capacidad de resumen y reescritura, heredada de los datasets smol-summarize y smol-rewrite usados en el ajuste.
- Ejecución en CPU y portátiles gracias a su tamaño reducido (0,4 GB de pesos en safetensors).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: el modelo sirve para estudiar el efecto del fine-tuning conversacional (assistant-only loss, 3 épocas) con registros completos de cada ejecución.
- Experimentación con templates de chat propios: permite validar el formato `litegpt-chat-v1` y comparar su comportamiento con templates estándar en un entorno controlado.
- Prototipado rápido en portátil: con 201M parámetros y 0,4 GB de pesos, se puede cargar en Transformers o en el motor propio de LiteGPT (`uv run litegpt chat`) sin GPU dedicada.
- Reproducción de benchmarks: el repositorio documenta cómo se puntuaron IFEval, GSM8K, HumanEval y MBPP a través del motor de LiteGPT, lo que facilita replicar los resultados.
- Generación de resúmenes y reescrituras simples: adecuado para tareas de transformación de texto acotadas en inglés, dado el entrenamiento sobre smol-summarize y smol-rewrite.
- Estudio de alineación y seguridad: al no tener safety tuning, es un caso de estudio útil para analizar qué ocurre cuando se despliega un modelo conversacional sin salvaguardas.
- Base para fine-tuning posterior: al ser Apache-2.0 y cargar sin código remoto, sirve como punto de partida para ajustes específicos de dominio en inglés.

## Benchmarks y rendimiento

| Modelo | IFEval | GSM8K chat | HumanEval chat | MBPP chat |
|---|---:|---:|---:|---:|
| Qwen3-0.6B | 0,564 | 0,310 | 0,372 | 0,310 |
| Gemma 3 270M-it | 0,251 | 0,099 | 0,122 | 0,154 |
| SmolLM2-135M-Instruct | 0,220 | 0,021 | 0,000 | 0,098 |
| **LiteGPT V2 Instruct** | **0,129** | **0,022** | **0,043** | **0,042** |
| LiteGPT V1 Instruct | 0,083 | 0,021 | 0,000 | 0,000 |

Mayor es mejor. Los benchmarks se puntuaron a través del motor propio de LiteGPT, según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,8 GB solo para pesos (201M × 4 bytes), más overhead de activaciones y KV cache para 4.096 tokens.
- En fp16/bf16: alrededor de 0,4 GB de pesos, holgadamente dentro de cualquier GPU consumer.
- Cabe en GPU consumer de gama baja (GTX 1650, RTX 3050, RTX 4060) e incluso en CPU; el autor indica que "runs comfortably on a laptop".
- Despliegue: Transformers (`AutoModelForCausalLM`), el motor propio de LiteGPT (`uv run litegpt chat`), y text-generation-inference según los tags del repo. No se documenta GGUF ni compatibilidad con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval | HumanEval chat | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| LiteGPT V2 Instruct | 201M | 4.096 | 0,129 | 0,043 | Apache-2.0 (pesos) / MIT (código) | Hugging Face, transformers |
| Qwen3-0.6B | ~600M | no disponible en la información | 0,564 | 0,372 | no disponible en la información | Hugging Face |
| Gemma 3 270M-it | 270M | no disponible en la información | 0,251 | 0,122 | no disponible en la información | Hugging Face |
| SmolLM2-135M-Instruct | 135M | no disponible en la información | 0,220 | 0,000 | no disponible en la información | Hugging Face |

LiteGPT V2 Instruct es el más pequeño de los cuatro en parámetros junto con SmolLM2-135M, pero queda último en IFEval y HumanEval. Su ventaja relativa es la trazabilidad total del entrenamiento y una licencia permisiva con código MIT.

## Limitaciones y advertencias

- Sin safety tuning: el autor advierte explícitamente que no hay alineación de seguridad y que deben añadirse salvaguardas antes de exponerlo a personas.
- Rendimiento muy bajo en tareas estándar: IFEval 0,129, GSM8K 0,022, HumanEval 0,043 y MBPP 0,042, muy por debajo de modelos del mismo tamaño.
- Riesgo elevado de alucinación y de respuestas incorrectas en razonamiento y matemáticas, dado el bajo rendimiento en GSM8K.
- Solo inglés: la model card declara únicamente `en`; no hay capacidades multilingües documentadas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Uso previsto exclusivamente de investigación y aprendizaje; no recomendado para producción sin evaluación adicional.
- La licencia Apache-2.0 de los pesos convive con avisos de Llama 3.1 Community License y Qwen en el fichero NOTICE; conviene revisar las condiciones de uso aceptable de Llama antes de un despliegue comercial.
- No se publican datos de cuantización ni versiones GGUF, lo que limita el despliegue en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kmkrworks/LiteGPT-Llama-V2-Instruct
- Árbol de ficheros: https://huggingface.co/kmkrworks/LiteGPT-Llama-V2-Instruct/tree/main
- Modelo base: https://huggingface.co/kmkrworks/LiteGPT-V2-Base
- Repositorio del proyecto: https://github.com/kmkrofficial/LiteGPT
- Resultados de benchmarks: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/results.md
- Documentación de entrenamiento: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/training.md
- Template de chat: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/chat_template.md
- Política de uso aceptable de Llama 3.1: https://llama.meta.com/llama3_1/use-policy
