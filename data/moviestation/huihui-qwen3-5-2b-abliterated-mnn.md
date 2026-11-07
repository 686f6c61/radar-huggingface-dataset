# moviestation/Huihui-Qwen3.5-2B-abliterated-MNN

## Resumen

Huihui-Qwen3.5-2B-abliterated-MNN es una conversión de formato del modelo huihui-ai/Huihui-Qwen3.5-2B-abliterated, que a su vez deriva de Qwen3.5-2B. El repositorio lo publica el usuario moviestation y su propósito es servir como pesos listos para el runtime MNN (Mobile Neural Network) en Android, concretamente para el asistente local RH Studio. No se trata de un modelo entrenado de forma independiente, sino de una exportación con cuantización de los pesos originales.

La conversión aplica cuantización de 4 bits a los pesos de texto (con tamaño de bloque 64) y de 8 bits a los pesos visuales, lo que reduce el tamaño del repositorio a 1,4 GB. El pipeline declarado es image-text-to-text, lo que indica que conserva la torre visual del modelo multimodal original. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero concreta: permite ejecutar un modelo multimodal de 2B parámetros en dispositivos Android mediante MNN, sin depender de la nube. Al no haber sido entrenado de forma independiente, sus capacidades y limitaciones son las del modelo huihui-ai subyacente, con el añadido de la pérdida de precisión por la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en pesos de texto (block size 64), 8 bits en pesos visuales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (exportación para runtime MNN) |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento propio: es una conversión de formato. La arquitectura subyacente es la de Qwen3.5-2B, un transformer multimodal con torre visual, sobre el que huihui-ai aplicó su proceso de "abliteration" (eliminación o atenuación de las direcciones de rechazo en el espacio de activaciones) para producir Huihui-Qwen3.5-2B-abliterated. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de esta ficha es la exportación a MNN: los pesos de texto se cuantizan a 4 bits con bloques de 64 elementos y los visuales a 8 bits, lo que permite su despliegue en Android. La revisión del modelo fuente utilizada es `b2e291a65f29a9b148981fa5299caea5d35bd4c8`. El autor advierte explícitamente que la conversión por sí sola no garantiza compatibilidad en dispositivo ni calidad de salida.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados de Qwen3.5-2B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias a la torre visual conservada en la conversión.
- Ejecución local en Android mediante el runtime MNN, orientada a un asistente de dispositivo.
- Comportamiento "abliterated": el modelo base de huihui-ai está modificado para reducir los rechazos ante ciertas peticiones.
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en Android sin conexión: el modelo está exportado a MNN y cuantizado para ejecutarse en el propio dispositivo, lo que permite conversaciones y consultas sobre imágenes sin enviar datos a la nube.
- Descripción y comprensión de imágenes en el dispositivo: gracias a la torre visual en 8 bits, puede usarse para tareas image-text-to-text locales, como describir fotos o responder preguntas sobre una imagen capturada por el usuario.
- Prototipado de aplicaciones móviles multimodales: sirve como base para desarrolladores que quieran integrar un modelo de 2B en apps Android mediante MNN y evaluar el rendimiento real por dispositivo.
- Investigación sobre cuantización en móvil: el repositorio incluye `release-manifest.json` con tamaños y hashes SHA-256, útil para reproducir y validar despliegues.
- Escenarios de privacidad estricta: al ejecutarse localmente, encaja en casos donde no se permite el envío de texto o imágenes a servicios externos.
- Pruebas de modelos "abliterated" en entornos controlados: permite estudiar el comportamiento del modelo sin filtros de rechazo en un entorno de investigación aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica además que el rendimiento y el consumo de memoria en Android dependen del dispositivo concreto y que la conversión no establece por sí sola la calidad de salida.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 1,4 GB con pesos de texto en 4 bits y visuales en 8 bits; la memoria en ejecución será superior al tamaño de los pesos y depende del runtime MNN y del dispositivo.
- GPU recomendadas: no aplica en el sentido habitual; está orientado a SoC móviles Android con aceleración MNN (CPU/GPU/NPU según el dispositivo).
- ¿Cabe en GPU de consumo? No hay datos específicos para escritorio; el formato MNN está pensado para Android.
- Opciones de despliegue: runtime MNN en Android; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependen del dispositivo.
- Nota del autor: los pesos deben descargarse por separado y no deben incluirse dentro del APK.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-2B-abliterated-MNN (este) | 2B | no disponible | MNN cuantizado (4/8 bits) | Apache 2.0 | Conversión para Android, multimodal |
| huihui-ai/Huihui-Qwen3.5-2B-abliterated | 2B | no disponible | safetensors (presumible) | Apache 2.0 | Modelo fuente sin cuantizar |
| Qwen3.5-2B | 2B | no disponible | no disponible | no disponible | Modelo original de Qwen |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado de forma independiente: es una conversión de formato, por lo que hereda tanto las capacidades como los defectos del modelo base.
- La cuantización a 4 bits en texto y 8 bits en visión puede degradar la calidad de salida respecto al modelo original; el autor no publica evaluaciones al respecto.
- El comportamiento "abliterated" reduce los rechazos del modelo, lo que puede aumentar el riesgo de generar contenido inapropiado o no deseado; requiere supervisión en producción.
- Riesgo de alucinación inherente a modelos de 2B parámetros; no hay datos específicos publicados.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.
- La compatibilidad y el rendimiento en Android dependen del dispositivo; la conversión no garantiza funcionamiento ni calidad.
- Los pesos no deben empaquetarse dentro del APK; deben descargarse por separado según indica el autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el archivo LICENSE incluido y verificar las obligaciones de atribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moviestation/Huihui-Qwen3.5-2B-abliterated-MNN
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- Colección Qwen3.5-abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/qwen35-abliterated
