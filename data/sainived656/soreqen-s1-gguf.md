# sainived656/soreqen-s1-GGUF

## Resumen

SoreQen S1 es un asistente conversacional bilingüe (inglés e hinglish) desarrollado por ZorQelis AI, disponible en formato GGUF para su ejecución con llama.cpp. Se trata de un fine-tuning del modelo Qwen/Qwen3.5-2B de Alibaba Cloud, con un total de 1.881.825.088 parámetros. El modelo está diseñado para responder en hinglish (escritura romana) cuando el usuario escribe en ese idioma y en inglés cuando se le habla en inglés, adaptando el registro según el contexto.

Esta versión GGUF incluye tres cuantizaciones (Q4_K_M, Q8_0 y F16) y conserva las capacidades de texto, razonamiento, tool calling y salida estructurada del modelo original, aunque no incluye el componente de visión, que se publica por separado. Es relevante para desarrolladores que necesitan un asistente ligero y bilingüe para entornos con recursos limitados, especialmente en aplicaciones orientadas al mercado indio o a comunidades que usan hinglish.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la información; modelo base Qwen/Qwen3.5-2B |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 |
| Idiomas soportados | Inglés, hinglish (escritura romana) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de indicar que es un fine-tuning de Qwen/Qwen3.5-2B. Qwen3.5-2B es un transformer denso de aproximadamente 2.000 millones de parámetros, por lo que SoreQen S1 hereda esa estructura general. El proceso de entrenamiento consistió en un ajuste fino sobre datos bilingües (inglés e hinglish) para especializar el modelo en conversación informal y asistencia en esos idiomas, con énfasis en respuestas directas y sin relleno. No se mencionan técnicas como RLHF o DPO, ni la cantidad de tokens de entrenamiento. La conversión a GGUF se realizó con llama.cpp, y se recomienda usar el flag `--jinja` para aplicar correctamente la plantilla de chat, que incluye modo de razonamiento y formato de tool calling.

## Capacidades

- Generación de texto conversacional en inglés e hinglish, con adaptación de registro (formal o informal) según el usuario.
- Modo de razonamiento (thinking mode) integrado en la plantilla de chat.
- Soporte de tool calling y salida estructurada (structured output), según la model card.
- Capacidad de mantener conversaciones multi-turno con contexto (la longitud exacta no se especifica).
- Respuestas directas, sin preámbulos como "Claro" o "Buena pregunta".
- No incluye visión en esta versión GGUF; el componente de imagen se publica por separado.

## Casos de uso

- Atención al cliente en hinglish: el modelo puede gestionar consultas de usuarios que escriben en hinglish, respondiendo en el mismo idioma y registro, lo que lo hace adecuado para soporte técnico o comercial en mercados de habla hindi.
- Asistente personal bilingüe: integrado en aplicaciones de mensajería o asistentes de voz, puede alternar entre inglés e hinglish según el idioma del usuario.
- Automatización de tareas con tool calling: gracias a su soporte de llamada a funciones, puede conectarse a APIs para realizar acciones como reservas, consultas de datos o envío de mensajes.
- Generación de respuestas estructuradas: útil para extraer información en formatos JSON o similares desde conversaciones, por ejemplo en sistemas de encuestas o formularios dinámicos.
- Entornos con recursos limitados: al tener cuantizaciones pequeñas (Q4_K_M de 1,27 GB), puede ejecutarse en CPU o GPUs de gama baja, ideal para prototipos o despliegues en edge.
- Desarrollo de chatbots educativos: para enseñar inglés o hinglish, el modelo puede mantener conversaciones naturales y corregir errores de forma informal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Q4_K_M (1,27 GB): requiere aproximadamente 1,5-2 GB de RAM o VRAM. Puede ejecutarse en CPU con 4 GB de RAM y en GPUs como NVIDIA GTX 1650 (4 GB) o superiores.
- Q8_0 (2,01 GB): necesita unos 2,5-3 GB de memoria. Adecuado para GPUs con 4 GB de VRAM (RTX 3050, GTX 1660 Super) o CPU con 6 GB de RAM.
- F16 (3,78 GB): requiere unos 4-5 GB de memoria. Recomendado para GPUs con 6 GB o más (RTX 2060, RTX 3060) o CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, llama-cli, y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, etc.).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de comparativas con modelos similares en la información proporcionada. El modelo base Qwen3.5-2B podría servir de referencia, pero no hay datos de rendimiento publicados para esta variante.

## Limitaciones y advertencias

- Modelos pequeños tienden a generar cifras o datos que no pueden verificar; se recomienda no confiar en el modelo para precios, tasas o cálculos aritméticos.
- El hinglish se produce exclusivamente en escritura romana; el modelo no genera texto en devanagari.
- La cuantización Q4_K_M introduce pérdida de precisión; para respuestas críticas se recomienda contrastar con Q8_0 o la versión safetensors.
- La versión GGUF no incluye capacidades de visión, a pesar de que el checkpoint original es multimodal.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir el trabajo original y las modificaciones según los términos de la licencia.
- No se especifica la longitud de contexto, por lo que puede haber limitaciones en conversaciones muy largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sainived656/soreqen-s1-GGUF
- Modelo base safetensors: https://huggingface.co/sainived656/soreqen-s1
- Variante SoreQen S1 Mega (4B): https://huggingface.co/sainived656/soreqen-s1-mega
