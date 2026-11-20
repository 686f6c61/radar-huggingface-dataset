# gugujiji/novel-humanize-4b

## Resumen

novel-humanize-4b es un modelo de lenguaje afinado por el usuario gugujiji a partir de Qwen/Qwen3-4B, con 4.022.468.096 parámetros reales en safetensors. Su propósito es muy concreto: reescribir capítulos de novelas web chinas generadas por IA para que suenen a un autor humano, manteniendo intactos la trama, los diálogos, los personajes y el orden de los acontecimientos, y cambiando únicamente el estilo de escritura. No es un modelo generalista, sino una herramienta de post-procesado estilístico para un dominio muy delimitado.

El modelo resuelve un problema habitual en la producción de ficción serializada en China: el "sabor a IA" (AI 味) que delata a los textos generados automáticamente mediante florituras retóricas, metáforas de plantilla y explicaciones explícitas de emociones. La propuesta del autor es sustituir ese registro por una voz más contenida, con ritmo y economía expresiva propios de un autor real. Al estar construido sobre un transformer denso de 4B, puede ejecutarse en una GPU de consumo convencional, lo que lo hace accesible para flujos de trabajo individuales.

Su relevancia actual es doble: por un lado, demuestra que el ajuste fino de un modelo pequeño y abierto sobre una tarea estrecha puede ser más útil que un modelo grande con prompts genéricos; por otro, su licencia CC BY-NC 4.0 restringe el uso comercial, lo que limita su adopción en productos de pago sin autorización expresa del autor. El modelo está pensado exclusivamente para chino y para el género de novela web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de despliegue recomendada con `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | chino (zh) |
| Licencia | CC BY-NC 4.0 (solo uso no comercial; base Qwen3-4B bajo Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de la familia Qwen3, y se distribuye como un ajuste fino supervisado orientado a una única tarea de reescritura estilística. No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la model card no detalla el procedimiento de ajuste más allá de indicar el modelo base y el objetivo.

La innovación técnica no reside en la arquitectura, sino en el diseño del prompt y del flujo de uso: el autor fija un system prompt literal que instruye a preservar trama, diálogos, personajes y orden de eventos, eliminar adornos retóricos y metáforas de plantilla, y no continuar ni añadir escenas nuevas. Además, el modelo debe operar con el modo de razonamiento (thinking) desactivado, y se recomienda una configuración de muestreo concreta (temperature 1.0, top_p 0.95, top_k 20, presence_penalty 0.3). El repositorio incluye `fix_tools.py`, que expone los prompts como constantes (`SYSTEM`, `wrap_input`), define herramientas en formato OpenAI function calling (`rewrite_novel` y `fix_typos`) y permite encadenar la reescritura con una segunda pasada de corrección ortográfica mediante una API externa compatible con OpenAI.

## Capacidades

- Reescritura estilística de capítulos de novela web china, preservando trama, diálogos, personajes y secuencia de eventos.
- Eliminación de marcadores de texto generado por IA: florituras, metáforas estereotipadas y explicaciones directas de emociones.
- Control de extensión: el autor indica que la longitud de salida debe ser comparable a la de entrada y que el modelo no debe continuar la historia más allá del texto proporcionado.
- Procesamiento de capítulos completos de 1000 a 2500 caracteres chinos en una sola pasada, con contexto de 8192 tokens.
- Integración como herramienta mediante function calling en formato OpenAI, con definiciones listas para usar en `fix_tools.py`.
- Despliegue servido con vLLM y consumo a través de la API compatible con OpenAI.
- Capacidad de corrección ortográfica delegada: el script permite encadenar el modelo con una API externa para detectar errores tipográficos y confusiones entre 的/地/得 sin reescribir el texto.
- Modo de razonamiento desactivable mediante `chat_template_kwargs` (`enable_thinking: False`).
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni generación de código; el modelo está especializado en una sola tarea textual en chino.

## Casos de uso

- Post-procesado de capítulos generados por IA en plataformas de novela web: el modelo recibe un capítulo completo de 1000 a 2500 caracteres y devuelve una versión con voz de autor humano, lista para revisión editorial antes de publicar.
- Cadena de producción editorial con corrección posterior: usando `fix_tools.py`, se reescribe el capítulo con novel-humanize-4b y después se pasa por una API externa (por ejemplo DeepSeek) que solo corrige erratas y usos de 的/地/得, reduciendo el trabajo manual de revisión.
- Herramienta invocable por un agente orquestador: un modelo mayor con soporte de `tools` puede llamar a `rewrite_novel` y `fix_typos` como funciones, delegando la reescritura estilística a este modelo especializado y manteniendo el control del flujo en el orquestador.
- Normalización de estilo en corpus de ficción: para equipos que recopilan textos generados y necesitan homogeneizar el registro antes de entrenar o evaluar otros modelos, el modelo actúa como filtro estilístico por capítulo.
- Despliegue local en una sola GPU de consumo: con vLLM y `--max-model-len 8192`, un usuario individual puede montar un servicio de reescritura en su propia máquina sin depender de APIs de pago, siempre que el uso sea no comercial.
- Prototipado de asistentes de escritura para autores: integrado en un editor, el modelo puede ofrecer una versión "humanizada" de un borrador manteniendo la estructura original, útil para comparar registros antes de decidir la versión final.
- Evaluación de detectores de texto IA: al disponer de pares original/reescrito, sirve para probar la robustez de clasificadores de texto generado frente a reescrituras estilísticas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 4B en safetensors, el peso completo ocupa aproximadamente 8 GB en precisión de 16 bits, por lo que se necesita margen adicional para caché KV y overhead del servidor.
- GPU recomendadas: no especificadas por el autor. El modelo card indica que "una tarjeta gráfica normal puede ejecutarlo" (一张普通显卡就能跑), sin concretar modelos.
- GPU de consumo: no se confirma compatibilidad con modelos concretos; por tamaño, un modelo de 4B en 16 bits es viable en GPUs de consumo con al menos 8-12 GB de VRAM, pero este dato no está verificado en la información disponible.
- Opciones de despliegue: vLLM es la vía documentada (`vllm serve gugujiji/novel-humanize-4b --served-model-name novel-humanize-4b --max-model-len 8192 --generation-config vllm`), con cliente OpenAI. No se documentan llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novel-humanize-4b | 4.022.468.096 | 8192 tokens (config. recomendada) | Reescritura estilística de novela web china | CC BY-NC 4.0 | Hugging Face, safetensors |
| Qwen/Qwen3-4B (modelo base) | 4B (aprox.) | no disponible en la información proporcionada | Propósito general, multilingüe | Apache 2.0 | Hugging Face |
| Alternativas específicas de "humanización" de texto chino | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (reescritura estilística de ficción en chino) en la documentación proporcionada. La comparación más directa es con el modelo base Qwen3-4B, del que este ajuste hereda la arquitectura y el tamaño, pero del que se diferencia por la especialización y por una licencia más restrictiva.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial, incluidos servicios de pago, productos comerciales y APIs comerciales, sin contacto previo con el autor. El modelo base Qwen3-4B es Apache 2.0, pero el ajuste cambia la licencia de los pesos derivados.
- Solo chino: el modelo está entrenado y documentado únicamente para chino; no hay garantías para otros idiomas.
- Solo novela web: el autor advierte explícitamente que otros géneros no tienen rendimiento garantizado.
- Pérdida de detalles: la model card reconoce que el modelo ocasionalmente elimina detalles del original, por lo que recomienda revisar la salida antes de usarla.
- Riesgo de continuación no deseada: con entradas demasiado cortas (unos cientos de caracteres) el modelo tiende a inventar trama; el autor recomienda capítulos de 1000 a 2500 caracteres y dividir los más largos por párrafos.
- Erratas y confusiones ortográficas: puede introducir errores tipográficos y mezclar 的/地/得, de ahí la utilidad del paso de corrección con una API externa.
- Dependencia del prompt: el uso correcto exige un system prompt literal y una configuración de muestreo concreta; desviarse de ellos degrada el resultado.
- Modo thinking: debe desactivarse explícitamente; no está pensado para razonamiento multi-paso.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, fidelidad a la trama ni tasas de alucinación, lo que dificulta evaluar su rendimiento frente a alternativas.
- Sin cuantizaciones publicadas: no se ofrecen pesos GGUF ni versiones cuantizadas, lo que limita el despliegue en entornos con poca VRAM.
- Sesgos: no documentados por el autor; al entrenarse sobre ficción web china, puede reproducir estereotipos y convenciones del género.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gugujiji/novel-humanize-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans
- Script de herramientas del repositorio: `fix_tools.py` (incluido en el repositorio de Hugging Face del modelo)
- vLLM (servidor de inferencia recomendado): https://github.com/vllm-project/vllm
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales del autor.
