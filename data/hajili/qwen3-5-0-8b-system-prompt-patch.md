# hajili/qwen3.5-0.8b-system-prompt-patch

## Resumen

`hajili/qwen3.5-0.8b-system-prompt-patch` es una variante editada por pesos del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario hajili. No se trata de un fine-tuning: el autor aplica un parche en forma cerrada (closed-form) sobre los pesos de atención, sin ningún tipo de entrenamiento adicional. El objetivo concreto es corregir un fallo de "confusión de idioma": cuando el prompt de sistema fija el idioma de respuesta y la pregunta se formula en inglés, el modelo base tiende a responder en inglés en lugar de en el idioma solicitado.

El parche modifica únicamente diez filas de las matrices `q_proj` y `k_proj` de las capas 7 y 11 del bloque de atención, lo que supone 10.240 pesos alterados, es decir, el 0,0012 % del total del modelo. El mecanismo consiste en convertir una fila de clave en un detector de tokens del prompt de sistema y cuatro filas de consulta en detectores de las posiciones inmediatamente anteriores a la respuesta, de modo que el producto eleva la atención que el inicio de la respuesta presta al prompt de sistema.

El modelo conserva la arquitectura y capacidades del base (pipeline image-text-to-text, 873.438.784 parámetros), con licencia Apache 2.0. Es relevante como demostración de "programación en el espacio de pesos": una intervención quirúrgica y determinista sobre los pesos puede modificar un comportamiento específico sin reentrenar. Las ganancias son notables pero parciales y con costes documentados, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), parche closed-form sobre atención en capas 7 y 11 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible (la model card evalúa 25 idiomas, sin listarlos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal con pipeline image-text-to-text y 873 millones de parámetros. Sobre esa base no se realiza entrenamiento alguno: el autor aplica un parche en forma cerrada que reemplaza diez filas de las matrices `q_proj` y `k_proj` en las capas 7 y 11 (`model.language_model.layers.{7,11}.self_attn.{q,k}_proj.weight`). En cada capa, una fila de clave pasa a actuar como detector de tokens del prompt de sistema y cuatro filas de consulta como detectores de las posiciones justo antes de la respuesta; el producto de ambas eleva la atención que el comienzo de la respuesta concede al prompt de sistema.

El resto de archivos del repositorio son idénticos a los del modelo base. No hay datos de entrenamiento, RLHF ni DPO asociados al parche, ya que la intervención es puramente determinista sobre los pesos. El autor documenta el proceso en la nota "Weight-space programming against language confusion in a small model" y publica el parche como archivo independiente junto con el script de aplicación en el repositorio `hajili/qwen3.5-0.8b-language-patches`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento image-text-to-text (entrada de imagen y texto), según el pipeline declarado.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Seguimiento del idioma indicado en el prompt de sistema (objeto del parche), con mejoras medidas en 25 idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: evaluado en 25 idiomas, aunque la lista concreta no se detalla.

## Casos de uso

- Asistentes conversacionales con idioma fijado por configuración: cuando el sistema debe responder siempre en un idioma concreto (por ejemplo, turco) aunque el usuario escriba en inglés, el parche eleva la tasa de respuestas en el idioma solicitado del 6 % al 72 % con la instrucción "Always respond in X.".
- Despliegue de chatbots locales en dispositivos con recursos limitados: con 873 millones de parámetros y pesos en bfloat16, el modelo es apto para entornos con poca VRAM, y el parche evita tener que añadir instrucciones redundantes de idioma en cada turno.
- Prototipado de investigación sobre edición de pesos: sirve como caso de estudio reproducible para experimentar con intervenciones closed-form sobre atención sin reentrenar, comparando el modelo base y el parcheado.
- Aplicaciones multimodales ligeras: al conservar el pipeline image-text-to-text, puede emplearse en tareas de descripción o pregunta-respuesta sobre imágenes en contextos donde el idioma de salida debe controlarse por prompt de sistema.
- Evaluación comparativa de robustez multilingüe: útil para medir cómo distintas formulaciones del prompt de sistema ("Always respond in X.", "Language: X", etc.) afectan a la obediencia del idioma, dado que el autor publica resultados por variante.
- Filtrado y generación de contenido en un idioma objetivo dentro de pipelines: para tareas donde se requiere que la salida respete un idioma fijado, el parche reduce la necesidad de postprocesado o de detección de idioma.

## Benchmarks y rendimiento

Resultados del autor sobre 36 preguntas reservadas en cada uno de 25 idiomas, con un pasaje y pregunta de Belebele en inglés, idioma fijado en el prompt de sistema, decodificación greedy y thinking desactivado. Se mide la proporción de respuestas en el idioma solicitado:

| Prompt de sistema | Sin editar | Parcheado |
|---|---|---|
| "Always respond in X." | 6 % | 72 % |
| "You are an assistant that replies only in X, even when the user writes in another language." | 15 % | 75 % |
| "Language: X" | 0 % | 58 % |
| "You are a helpful assistant. The user's preferred language is X." | 0 % | 11 % |
| Media de las cuatro variantes | 5 % | 54 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 873 millones de parámetros en bfloat16 los pesos ocupan aproximadamente 1,7 GB, por lo que en la práctica requiere del orden de 2-4 GB de VRAM según el contexto y el lote.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabe en GPU de consumo.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros (873 M), aunque no se especifican modelos concretos.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForImageTextToText` y `AutoTokenizer`). No se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hajili/qwen3.5-0.8b-system-prompt-patch | 873.438.784 | no disponible | Parche closed-form sobre atención para obediencia de idioma | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873.438.784 (según el derivado) | no disponible | Modelo multimodal original sin parche | Apache 2.0 (según el derivado) | Hugging Face |
| Otros modelos ~0.8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: mismo tamaño y licencia, pero sin la mejora de obediencia de idioma (5 % de media frente al 54 % del parcheado en las cuatro variantes de prompt). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La mejora depende fuertemente de la formulación del prompt: "The user's preferred language is X." solo pasa del 0 % al 11 %, mientras que "Always respond in X." alcanza el 72 %.
- Una petición de idioma en el prompt del usuario pierde eficacia: en el marco "Summarize the text below in one or two sentences. Reply in X." la tasa baja del 47 % al 37 % en 30 idiomas.
- Otras instrucciones del prompt de sistema se amplifican: con un prompt que termina en "Do not give legal or medical advice.", 13 de 36 respuestas mencionan ese tipo de consejos (frente a 0 en el modelo sin editar).
- Cambios de escritura no deseados: cuando el usuario pide en X una traducción a X, las respuestas en azerí pasan a escritura árabe y las de uzbeko a cirílico.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada, aunque se heredan los del modelo base Qwen3.5-0.8B.
- Licencia Apache 2.0, que permite uso comercial; aun así, conviene verificar las condiciones del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su adopción en producción no está contrastada.
- No se especifican la longitud de contexto, los idiomas exactos ni los formatos de cuantización, lo que limita la planificación de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hajili/qwen3.5-0.8b-system-prompt-patch
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del parche y script de aplicación: https://huggingface.co/hajili/qwen3.5-0.8b-language-patches
- Nota del autor "Weight-space programming against language confusion in a small model": https://mhajili.com/notes/weight-space-programming/
