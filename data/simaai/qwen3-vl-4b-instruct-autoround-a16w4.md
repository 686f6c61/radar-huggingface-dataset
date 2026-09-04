# simaai/Qwen3-VL-4B-Instruct-Autoround-a16w4

## Resumen

Este modelo es una versión optimizada y compilada del checkpoint Qwen/Qwen3-VL-4B-Instruct para la plataforma SiMa.ai Modalix. El checkpoint original ha sido pre-cuantizado con AutoRound a A16W4 (activaciones de 16 bits, pesos de 4 bits) y compilado para el acelerador SiMa.ai MLA, con el objetivo de ofrecer inferencia multimodal de baja latencia en entornos embebidos.

Con 4.000 millones de parámetros y una ventana de contexto de 8.192 tokens, acepta imágenes de resolución fija 448x448 y genera texto en formato instruct. La model card publicada incluye mediciones de rendimiento en el hardware objetivo: un tiempo medio al primer token de 0,39 segundos para una imagen 448x448 con una pregunta de 20 tokens, y una tasa de generación de 21,85 tokens por segundo. Estas características lo hacen adecuado para aplicaciones de visión por computador en el edge, donde la latencia y el consumo energético son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal) |
| Parámetros totales | 4.000 millones (4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | A16W4 (activaciones de 16 bits, pesos de 4 bits); pre-cuantizado con AutoRound |
| Idiomas soportados | No disponible |
| Licencia | Other (no se especifica una licencia estándar) |
| Formato de pesos | Modelo compilado para SiMa.ai Modalix (assets de LLiMa; no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-VL-4B-Instruct, un modelo multimodal de la familia Qwen3 con un componente de visión y un componente de lenguaje. La adaptación publicada en este repositorio no modifica la arquitectura original, pero aplica una cuantización A16W4 mediante AutoRound y una compilación específica para el acelerador SiMa.ai MLA. La ventana de contexto queda fijada en 8.192 tokens.

No se proporciona información detallada sobre el entrenamiento original: composición del dataset, número de tokens utilizados ni uso de técnicas de alineación como RLHF o DPO. La model card se centra exclusivamente en el proceso de optimización para SiMa.ai Modalix.

## Capacidades

- Procesamiento multimodal de imágenes y texto: acepta imágenes de resolución fija 448x448 y responde con texto en formato instruct.
- Herencia de las capacidades de diálogo e instrucción del modelo base Qwen3-VL-4B-Instruct.
- Inferencia de baja latencia en el hardware SiMa.ai Modalix: primer token en 0,39 segundos para una imagen 448x448 con una pregunta de 20 tokens.
- Servicio mediante APIs compatibles con OpenAI y Ollama a través del flujo de trabajo GenAI de SiMa.ai.
- Integración con la plataforma LLiMa, que permite ejecutar el modelo compilado mediante la CLI `llima run`.
- No se documentan capacidades específicas de tool calling, razonamiento multi-paso ni agentes en la model card.

## Casos de uso

- Asistente visual en dispositivos embebidos: analiza imágenes de cámaras en tiempo real y responde en aproximadamente 0,39 segundos el primer token, lo que permite interacciones casi inmediatas en entornos edge.
- Inspección de calidad en líneas de producción: procesa fotografías 448x448 de piezas para detectar defectos visuales y emitir alertas, aprovechando la cuantización compacta y el bajo consumo de la plataforma Modalix.
- Descripción de imágenes para accesibilidad: genera descripciones textuales de escenas o documentos para personas con discapacidad visual, en un dispositivo local sin dependencia de la nube.
- Automatización de documentos escaneados: extrae información de facturas, formularios o etiquetas mediante el módulo de visión, que acepta imágenes de hasta 448x448.
- Robótica móvil: aporta percepción visual y respuestas textuales para navegación o interacción con operarios en robots que integran el acelerador SiMa.ai.
- Vigilancia perimetral con IA edge: analiza imágenes de cámaras de seguridad y proporciona descripciones de eventos con baja latencia, al no requerir servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye mediciones de latencia y velocidad de generación obtenidas en SiMa.ai Modalix, que se reproducen a continuación.

Inferencia multimodal (una imagen 448x448 y pregunta de 20 tokens, tras calentamiento, medias aritméticas):

| Entrada | TTFT medio (s) | Tasa de generación media (tokens/s) |
|---|---:|---:|
| Imagen 448x448 + 20 tokens de texto | 0,39 | 21,85 |

Inferencia solo texto (MoLE, batch size 1, cinco muestras por longitud, hasta 128 tokens generados, medias aritméticas):

| Tokens de entrada | TTFT medio (s) | Tasa de generación media (tokens/s) |
|---|---:|---:|
| 128 | 0,14 | 22,42 |
| 256 | 0,27 | 22,25 |
| 512 | 0,55 | 21,55 |
| 1024 | 1,15 | 20,39 |
| 2048 | 2,65 | 16,14 |
| 3072 | 5,17 | 15,31 |
| 4096 | 8,17 | 13,52 |
| 5120 | 12,43 | 11,58 |
| 6144 | 17,31 | 10,94 |
| 7168 | 24,15 | 9,72 |

Nota: en la inferencia multimodal, el TTFT incluye decodificación y preprocesado de la imagen, codificación visual, proyección, prefill del modelo de lenguaje y el primer token generado. La tasa de generación se mide después del primer token.

## Requisitos de hardware

- No aplica VRAM: el modelo está compilado para el acelerador SiMa.ai Modalix, no para GPUs convencionales.
- Se requiere un dispositivo SiMa.ai Modalix con el software SiMa.ai Neat Runtime instalado, que incluye la CLI `llima`.
- El repositorio ocupa 30,7 GB; el modelo compilado se almacena en `/media/nvme/llima/models/` de forma predeterminada.
- Opciones de despliegue: CLI `llima run`, servidor GenAI con APIs compatibles con OpenAI y Ollama, y la aplicación GenAI Multimodal Assistant.
- Tiempo al primer token medido desde 0,14 segundos en solo texto con 128 tokens de entrada, hasta 0,39 segundos en multimodal con una imagen 448x448.
- Tasa de generación medida entre 21,85 tokens/s en multimodal y 9,72 tokens/s con 7.168 tokens de entrada en solo texto.

## Comparativa con modelos similares

| Modelo | Cuantización | Contexto máx. | Resolución de imagen | Plataforma |
|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-Autoround-a16w4 (este modelo) | A16W4 | 8.192 | 448x448 fija | SiMa.ai Modalix |
| Qwen3-VL-4B-Instruct-a16w4 | A16W8 (prompt) / A16W4 (generación) | 2.048 | No disponible | SiMa.ai Modalix |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | No disponible | No disponible | No disponible | General |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. Las mediciones de rendimiento solo están disponibles para la variante compilada que se describe aquí.

## Limitaciones y advertencias

- La cuantización A16W4 introduce una pérdida de precisión frente al modelo original en precisión completa; pueden producerse pequeñas desviaciones en las respuestas.
- La resolución de imagen es fija a 448x448 durante la compilación. No se pueden usar resoluciones dinámicas como en el modelo base.
- El modelo solo se ejecuta en el entorno SiMa.ai Modalix. No es portable a frameworks estándar como Hugging Face Transformers, vLLM, llama.cpp u Ollama sin recompilar para otro hardware.
- La licencia es «other», por lo que se debe revisar el archivo de licencia del repositorio antes de cualquier uso comercial.
- No se documentan sesgos específicos, pero al tratarse de un modelo de lenguaje multimodal existe riesgo de alucinación y sesgos heredados del conjunto de entrenamiento original.
- No se indica soporte para tool calling, agentes ni estructuras de razonamiento complejas.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/simaai/Qwen3-VL-4B-Instruct-Autoround-a16w4
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Guía de instalación de Neat Runtime de SiMa.ai: https://developer.sima.ai/software/getting-started/
- GenAI con LLiMa: https://developer.sima.ai/software/genai-llima/
- Servir modelos GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Ejecutar un VLM: https://developer.sima.ai/software/tutorials/run-a-vlm
- Aplicación de demo multimodal de SiMa.ai: https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant
