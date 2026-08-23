# Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-v1

## Resumen

El modelo `kanha-kanha.ai-1.7b-grounded-qlora-v1` es un fine-tune con QLoRA del modelo base Qwen/Qwen3-1.7B, desarrollado por Kanha-AI. Su objetivo es responder preguntas sobre el contenido del sitio web de Kanha AI (kanha.ai) de forma "grounded", es decir, utilizando únicamente el contexto que se le proporciona en la consulta. Está pensado para el despliegue de chatbots en el navegador mediante WebGPU, donde el modelo se ejecuta en el dispositivo cliente sin necesidad de llamadas a servidores remotos.

El modelo se entrena con un dataset generado automáticamente a partir del contenido del sitio web (210 registros de entrenamiento y 45 de validación) y se publica como un experimento de investigación para comparar métodos de entrenamiento sobre el mismo dataset. Es relevante porque demuestra un flujo completo de entrenamiento y despliegue de un modelo compacto (1.7B parámetros) especializado en QA de un dominio concreto, con un contrato de inferencia estricto que exige contexto y define una respuesta de rechazo explícita cuando la información no está disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 transformer decoder-only (dense) |
| Parametros totales | 1.720.574.976 (1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos fusionados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B` (revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) y se entrena con QLoRA (LoRA de bajo rango con cuantización de base). Los hiperparámetros son: rank 16, alpha 16, dropout 0.05, aplicados a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento usa una época, learning rate 0.0001, batch de 8 por dispositivo, 2 pasos de acumulación de gradiente y warmup del 5%. La pérdida se calcula solo sobre las respuestas del asistente (`assistant-only loss`), lo que implica que el modelo se optimiza exclusivamente para generar respuestas a partir del contexto dado.

El dataset de entrenamiento se genera automáticamente a partir del contenido del sitio web de Kanha AI, con un hash específico y 210 registros de entrenamiento y 45 de validación. El contexto máximo de secuencia es de 2048 tokens. El modelo se fusiona en bfloat16 y usa el chat template nativo de Qwen3 con thinking deshabilitado (`enable_thinking=False`).

## Capacidades

- QA grounded: responde preguntas basándose exclusivamente en el contexto proporcionado en el prompt.
- Respuesta de rechazo controlada: si la respuesta no está en el contexto, devuelve exactamente la cadena `I can't answer that from the provided context.`.
- Formato de chat nativo Qwen3, con plantilla de usuario que incluye un bloque `<context>` y `<question>`.
- Multilingüe: solo inglés (según la model card).
- No soporta tool calling ni capacidades de agente adicionales, más allá de la generación de texto condicionada al contexto.
- Pensamiento deshabilitado: no genera cadenas de razonamiento explícito.

## Casos de uso

- Chatbots de sitio web en el navegador: el modelo puede integrarse en una página web mediante un script tag o componente Web, y ejecutarse en el dispositivo del usuario con WebGPU. Es adecuado porque su tamaño (1.7B) permite cargarlo en clientes modernos sin servidor, reduciendo costes de API.
- QA controlado sobre documentación corporativa: al exigir contexto en cada consulta, es útil para responder preguntas sobre manuales, FAQs o páginas de producto, evitando respuestas fuera de tema.
- Evaluación de métodos de entrenamiento: el checkpoint sirve como referencia para comparar QLoRA frente a otros métodos de fine-tune sobre el mismo dataset, tal y como indica la model card.
- Prototipos de investigación en grounded QA: permite estudiar el comportamiento de modelos pequeños cuando se les restringe a un contexto fijo y se mide la tasa de rechazo.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse on-device, evita enviar datos de usuario a servidores externos, lo que facilita el cumplimiento de políticas de datos.
- Generación de respuestas concisas para FAQ: el sistema prompt pide respuestas breves y solo desde el contexto, útil para asistencia de atención al cliente básica.

## Benchmarks y rendimiento

La model card no reporta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, incluye métricas de evaluación específicas del dominio:

| Metrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.3846 |
| list_recall | 0.6032 |
| numbers_recall | 0.9718 |
| refusal_rate | 0.1538 |
| total | 26 |
| unsupported_value_rate | 0.0385 |
| urls_recall | 1.0 |

Estas métricas se obtuvieron sobre un conjunto de evaluación de 26 casos. La `deterministic_pass_rate` de 0.3846 indica que solo el 38.5% de las respuestas pasan un control determinista de exactitud, lo que sugiere que el modelo no siempre produce respuestas correctas o completas. La `refusal_rate` de 0.1538 (15.4%) significa que en un 15.4% de los casos el modelo responde correctamente con la cadena de rechazo, lo que es positivo para el contrato grounded. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.7B parámetros en bfloat16 (~3.4 GB de pesos), pero el repositorio ocupa 3.5 GB. Con optimización, cabe en GPUs de 8 GB (por ejemplo, RTX 4060) y en GPUs de consumo medio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia sin cuantización. Para ejecución en navegador, se requiere un dispositivo compatible con WebGPU (por ejemplo, GPU integradas modernas o dedicadas).
- En consumer GPU: sí, cabe en RTX 3060/4060 (8-12 GB) y superiores. Para despliegue en servidor, una A10 o T4 es suficiente.
- Opciones de despliegue: `transformers` (Hugging Face), `vLLM` o `TGI` para inferencia en servidor, y el SDK de Kanha AI para ejecución on-device vía WebGPU. No se proporcionan artefactos GGUF o MLC en la publicación.
- Latencia y throughput: no disponible en la información proporcionada. Depende del runtime y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-v1 | 1.7B | 2048 | no disponible | Fine-tune QLoRA de Qwen3-1.7B para grounded QA |
| Qwen/Qwen3-1.7B (base) | 1.7B | 32768 (según documentación de Qwen) | Apache 2.0 (según Qwen) | Modelo base sin fine-tune, capacidad general, contexto mayor |
| Qwen/Qwen3-1.7B-Instruct | 1.7B | 32768 | Apache 2.0 | Versión instruct de Qwen3-1.7B, entrenada para seguir instrucciones generales |

No se dispone de datos de benchmarks comparativos con estos modelos en la información proporcionada. El modelo de Kanha está especializado en QA grounded sobre el contenido de un sitio concreto, mientras que los modelos base de Qwen tienen capacidades generales de conversación y razonamiento.

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas, incompletas o desactualizadas, como advierte la propia model card. La `deterministic_pass_rate` de 0.3846 sugiere que una parte significativa de las respuestas no son deterministamente correctas.
- Puede memorizar contenido del entrenamiento, lo que implica riesgo de reproducir información sensible o no verificada.
- El contrato de inferencia es estricto: si no se proporciona contexto, la pregunta queda fuera del entrenamiento y del comportamiento esperado. No se debe usar sin contexto.
- El dataset de entrenamiento es muy pequeño (210 registros), lo que limita la generalización y la robustez del modelo.
- La licencia no está especificada, por lo que el uso comercial no está claramente permitido. Se debe verificar antes de cualquier despliegue en producción.
- El modelo solo soporta inglés y no tiene capacidades de visión, audio ni tool calling.
- El checkpoint es experimental y se publica para investigación comparativa, no para uso en producción sin validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-v1
- Organización Kanha-AI en Hugging Face: https://huggingface.co/Kanha-AI
- Repositorio GitHub de Kanha AI: https://github.com/Kanha-AI/Kanha-AI
- Sitio web de Kanha AI (producto): https://kanha.ai
- Sitio web de Kanha AI (voz para niños): https://kanhaji.ai/
