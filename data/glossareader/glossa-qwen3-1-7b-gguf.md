# glossareader/glossa-qwen3-1.7b-gguf

## Resumen

Glossa Qwen3 1.7B es un ajuste fino (fine-tune) experimental del modelo Qwen3 1.7B de Alibaba, desarrollado por el equipo de Glossa, un lector de PDF para macOS. El modelo está especializado en responder preguntas sobre un fragmento resaltado de un documento PDF y citar la página de la que extrae la información con un formato como `[p. 17]`. Se distribuye principalmente como GGUF cuantizado a 8 bits, junto con el adaptador LoRA original, y está pensado para ejecutarse localmente en el ordenador del usuario sin enviar datos a la nube.

La relevancia de esta ficha no reside en una mejora de rendimiento, sino en su honestidad metodológica: el propio autor advierte que el modelo ajustado **no es mejor** que el Qwen3 1.7B original. En comparaciones ciegas evaluadas por Claude Sonnet, ambos modelos ganaron aproximadamente la mitad de las veces (48% de victorias para el ajustado, con 90 victorias, 97 derrotas y 13 empates sobre 200 preguntas). El ajuste fino incrementó drásticamente la tasa de citas válidas (del 14% al 94%), pero también aumentó los errores de página y de hechos, lo que en una aplicación de lectura resulta contraproducente.

El modelo tiene 1.720.574.976 parámetros, una ventana de contexto configurada de 8.192 tokens en Ollama y licencia Apache 2.0. Está entrenado únicamente en inglés y su plantilla de chat desactiva siempre el modo de razonamiento (thinking). Se publica como material reproducible de un experimento, no como un modelo recomendado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con ajuste fino LoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado en Ollama); contexto nativo del Qwen3 base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (GGUF); adaptador LoRA en safetensors para pesos originales |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (q8_0), safetensors (LoRA y pesos base), integracion con Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 1.7B, un transformer decoder-only de aproximadamente 1.700 millones de parámetros, sobre el que se aplica un ajuste fino mediante LoRA de rango 32 en todas las capas de atención y MLP. El entrenamiento es por destilación: el profesor es GLM-5.3-Flash (licencia MIT) y el modelo pequeño aprende a copiar sus respuestas, que previamente se filtran para descartar citas de página inválidas y citas textuales inventadas. La función de pérdida se calcula únicamente sobre la respuesta, con tasa de aprendizaje 2e-4, schedule coseno y un máximo de 3.072 tokens.

La ronda 2, que corresponde a estos pesos, utilizó 3.621 ejemplos durante una época sobre 2 GPUs T4 en Kaggle. El adaptador se fusionó con los pesos base y se convirtió a GGUF Q8_0 con llama.cpp. Una decisión técnica destacable es que el modelo se entrenó con `enable_thinking=False` (un bloque `<think></think>` vacío antes de cada respuesta) y la plantilla del GGUF reproduce ese comportamiento, de modo que el modo de razonamiento queda siempre desactivado. El prompt óptimo sigue la forma de entrenamiento: un mensaje de sistema con el texto de la página (y las vecinas), seguido del fragmento resaltado y la pregunta del lector.

## Capacidades

- Generación de texto conversacional orientada a preguntas y respuestas sobre documentos.
- Respuesta a preguntas sobre un pasaje resaltado de un PDF, con contexto de las páginas vecinas.
- Citación de la página de origen en formato `[p. 17]` (94% de respuestas con cita válida tras el ajuste).
- Detección de preguntas trampa: responde "not on this page" en el 91% de los casos de prueba.
- Respuestas cortas y concisas, adecuadas para lectura dentro de una aplicación.
- Ejecución local sin conexión, compatible con Ollama, LM Studio y llama.cpp.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (thinking desactivado por diseño).
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüe limitado: solo inglés.

## Casos de uso

- Lectura asistida de PDF en macOS: integración directa en la aplicación Glossa mediante Ollama, donde el usuario selecciona texto y el modelo responde con la página citada, todo de forma local.
- Investigación documental con trazabilidad: el modelo cita la página de la que extrae la respuesta, lo que permite al lector verificar la fuente en documentos de 202 licencias abiertas y 13 materias del conjunto de prueba.
- Reproducción de experimentos de destilación: los pesos y el adaptador LoRA permiten reproducir el experimento descrito en el blog del autor y comparar el ajuste con el modelo base.
- Desarrollo de asistentes de lectura offline: al ejecutarse en Ollama con 8.192 tokens de contexto, sirve como base para prototipos de preguntas y respuestas sobre documentos sin enviar datos a servidores externos.
- Evaluación de trade-offs de fine-tuning: útil como caso de estudio de cómo el ajuste fino puede mejorar una métrica (citación) a costa de empeorar otras (precisión factual), para equipos que diseñan sus propias evaluaciones.
- Filtrado de preguntas fuera de contexto: su capacidad para responder "not on this page" en el 91% de las preguntas trampa lo hace adecuado para sistemas que deben rechazar consultas no cubiertas por el documento.
- Base para fine-tuning adicional: el adaptador LoRA en safetensors puede reutilizarse con PEFT/Transformers sobre Qwen3 1.7B para experimentos derivados.

## Benchmarks y rendimiento

Resultados de la ronda 2, medidos frente al Qwen3 1.7B sin ajustar sobre 200 preguntas:

| Metrica | Sin ajustar | Ajustado |
|---|---|---|
| Victorias ciegas por pares (ajustado vs sin ajustar) | — | 90 victorias, 97 derrotas, 13 empates (48%) |
| Respuestas con cita de pagina valida | 14% | 94% |
| Responde "not on this page" en preguntas trampa | 76% | 91% |
| Citas textuales inventadas | 0% | 2% |
| Errores de pagina por respuesta (juzgado) | 0,58 | 0,88 |
| Hechos erroneos por respuesta (juzgado) | 0,05 | 0,16 |
| Puntos omitidos por respuesta (juzgado) | 1,48 | 0,97 |

El conjunto de prueba completo comprende 202 documentos de licencia abierta, 13 materias y 2.366 preguntas, según el blog del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para el GGUF Q8_0 (tamaño del repo de 3,8 GB, que incluye también el adaptador LoRA y otros archivos).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; el entrenamiento se realizó en 2× T4, pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en Apple Silicon mediante Ollama.
- Opciones de despliegue: Ollama (`ollama run hf.co/glossareader/glossa-qwen3-1.7b-gguf`), LM Studio (buscar `glossareader/glossa-qwen3-1.7b-gguf` y descargar el archivo Q8_0), llama.cpp (`llama-cli -hf glossareader/glossa-qwen3-1.7b-gguf -cnv`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Glossa Qwen3 1.7B | 1,72 B | 8.192 tokens (Ollama) | Apache 2.0 | GGUF, LoRA, Ollama | Ajuste especializado en citas de PDF; no supera al base |
| Qwen3 1.7B (base) | 1,72 B | No disponible | Apache 2.0 | Hugging Face, Ollama (`qwen3:1.7b-q8_0`) | Recomendado por el propio autor para uso diario |
| GLM-5.3-Flash (profesor) | No disponible | No disponible | MIT | No disponible | Modelo profesor usado para destilación |

## Limitaciones y advertencias

- El modelo ajustado no es mejor que el Qwen3 1.7B original: gana solo el 48% de las comparaciones ciegas por pares.
- Mayor tasa de errores de página (0,88 frente a 0,58 por respuesta) y de hechos erróneos (0,16 frente a 0,05), lo que en una aplicación de lectura es especialmente peligroso porque una cita segura sobre una respuesta incorrecta es peor que no citar.
- Introduce un 2% de citas textuales inventadas, frente al 0% del modelo sin ajustar.
- Solo entrenado en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- El modo de razonamiento (thinking) está desactivado por diseño; no puede activarse sin alterar el comportamiento entrenado.
- Ventana de contexto de 8.192 tokens, insuficiente para documentos completos; depende de que el sistema proporcione las páginas relevantes.
- Modelo experimental publicado para reproducibilidad, no recomendado para producción; el autor recomienda el `qwen3:1.7b-q8_0` sin ajustar para uso cotidiano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad.
- Riesgo de alucinación inherente a un modelo de 1,7 B, agravado por el sesgo hacia la citación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossareader/glossa-qwen3-1.7b-gguf
- Modelo base Qwen3 1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Blog del experimento: https://glossareader.com/blog/small-model
- Aplicación Glossa: https://glossareader.com
- Ollama: https://ollama.com
