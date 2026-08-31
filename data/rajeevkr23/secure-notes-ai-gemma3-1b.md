# rajeevkr23/secure-notes-ai-gemma3-1b

## Resumen

Este repositorio aloja un espejo sin modificaciones del archivo `gemma3-1b-it-int4.task`, una versión cuantizada en int4 dinámico (QAT) del modelo instructivo Gemma 3 1B de Google, preparada para su ejecución en dispositivos móviles mediante LiteRT (antes TensorFlow Lite) y la API de inferencia LLM de MediaPipe. El autor, rajeevkr23, lo publica como un espejo de acceso directo y sin restricciones (ungated) para que la aplicación Android Private Notes pueda descargar el modelo en el primer arranque y ejecutar toda la inferencia localmente, sin enviar datos a ningún servidor.

El modelo base, desarrollado por Google DeepMind, es un transformer decoder-only de aproximadamente 1.000 millones de parámetros con una ventana de contexto de 32.000 tokens (la más reducida de la familia Gemma 3, que llega a 128K en los modelos de 4B y superiores). La versión cuantizada en int4 reduce el peso a unos 529 MB, lo que lo hace viable para su ejecución en CPU y GPU de smartphones modernos. Su relevancia actual radica en la creciente demanda de asistentes de IA privados y sin conexión, donde la inferencia on-device elimina la latencia de red y los riesgos de privacidad asociados al envío de contenido sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con atención local-global |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | int4 dinámico (QAT) |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta más de 140 idiomas, pero no se especifica en esta versión) |
| Licencia | Gemma Terms of Use (licencia propietaria de Google con restricciones de uso) |
| Formato de pesos | `.task` (LiteRT/MediaPipe LLM Inference API) |

## Arquitectura y entrenamiento

Gemma 3 1B IT es un modelo de lenguaje de tipo transformer con una arquitectura que combina atención local y global. Según el informe técnico de Gemma 3, la frecuencia base de RoPE se incrementa de 10k a 1M en las capas de atención global, mientras que las capas locales mantienen 10k. Esta configuración permite manejar contextos largos de forma eficiente, aunque en la variante de 1B el contexto máximo se limita a 32K tokens.

El modelo base fue entrenado por Google DeepMind con un enfoque de alineación instructiva (IT, instruction-tuned) que incluye ajuste fino supervisado y optimización con preferencias humanas (RLHF/DPO). La versión distribuida en este repositorio ha sido cuantizada a int4 mediante cuantización consciente del entrenamiento (QAT) por el equipo de LiteRT, lo que reduce el tamaño del archivo a aproximadamente 529 MB sin una pérdida significativa de calidad para tareas de generación de texto. No se dispone de información detallada sobre la composición exacta del dataset de entrenamiento ni sobre el proceso de cuantización específico en esta ficha.

## Capacidades

- Generación de texto y razonamiento: el modelo puede producir respuestas coherentes y contextualizadas en tareas de lenguaje natural, incluyendo resúmenes, reescritura y explicaciones.
- Instrucciones y diálogo: al ser una versión instructiva, está optimizado para seguir instrucciones y mantener conversaciones multi-turno.
- Multilingüismo: aunque no se especifica en esta versión, el modelo base Gemma 3 1B IT soporta más de 140 idiomas, lo que sugiere que esta variante conserva esa capacidad.
- Inferencia on-device: gracias a la cuantización int4 y al formato LiteRT, el modelo puede ejecutarse completamente en el dispositivo, sin conexión a internet.
- Integración con MediaPipe: compatible con la API de inferencia LLM de MediaPipe, lo que facilita su uso en aplicaciones Android y otras plataformas compatibles.
- Sin capacidades multimodales: esta versión es solo texto; no incluye visión ni audio.

## Casos de uso

- Aplicación de notas privadas con IA: el caso de uso principal de este espejo. La app Private Notes descarga el modelo en el primer arranque y lo utiliza para resumir, reescribir, explicar y generar ideas a partir de las notas del usuario, todo localmente.
- Asistente de escritura offline: redacción de correos, mensajes o documentos en dispositivos móviles sin conexión, con funciones de autocompletado y reformulación.
- Chatbot de soporte técnico embebido: integración en aplicaciones de atención al cliente que requieren privacidad total, donde las conversaciones no deben salir del dispositivo.
- Herramienta educativa sin conexión: explicación de conceptos, generación de preguntas de práctica o resúmenes de apuntes en entornos sin acceso a internet (aulas, zonas rurales).
- Procesamiento de texto en el borde: extracción de información, clasificación o etiquetado de documentos en dispositivos móviles para aplicaciones de productividad.
- Prototipado rápido de aplicaciones de IA local: los desarrolladores pueden usar este archivo `.task` para evaluar el rendimiento de Gemma 3 1B en hardware móvil antes de decidir el modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada int4 en la información disponible. El modelo base Gemma 3 1B IT ha sido evaluado en el informe técnico de Gemma 3 (arXiv:2503.19786), pero no se dispone de los valores numéricos en esta ficha. Se recomienda consultar el informe técnico original para obtener datos de MMLU, HumanEval, GSM8K y otras pruebas estándar, teniendo en cuenta que la cuantización int4 puede introducir una ligera degradación en el rendimiento.

## Requisitos de hardware

- Almacenamiento: aproximadamente 529 MB para el archivo del modelo, más espacio adicional para el runtime de LiteRT/MediaPipe.
- Memoria RAM: se recomienda al menos 2 GB de RAM libre en el dispositivo para cargar el modelo y ejecutar la inferencia sin problemas.
- GPU: compatible con GPU móviles (Adreno, Mali, Apple Silicon) a través de la aceleración por hardware de MediaPipe; también puede ejecutarse en CPU.
- Dispositivos compatibles: smartphones y tablets Android con Android 8.0 o superior y soporte para LiteRT/MediaPipe. También puede ejecutarse en otras plataformas que soporten LiteRT (iOS, Linux, etc.).
- Opciones de despliegue: el archivo `.task` se integra directamente con la API de inferencia LLM de MediaPipe. No es compatible directamente con vLLM, llama.cpp u Ollama, que requieren formatos como GGUF o safetensors.
- Latencia y throughput: no se dispone de datos medidos. En dispositivos móviles de gama media, se espera una generación de entre 5 y 20 tokens por segundo, dependiendo de la CPU/GPU y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Gemma 3 1B IT (este) | 1B | 32K | int4 QAT | LiteRT `.task` | Gemma Terms |
| Phi-3 mini (Microsoft) | 3.8B | 128K | int4/8 | GGUF, ONNX | MIT |
| Llama 3.2 1B (Meta) | 1B | 128K | int4/8 | GGUF, safetensors | Llama 3.2 Community |
| Qwen2.5 0.5B (Alibaba) | 0.5B | 32K | int4/8 | GGUF, safetensors | Apache 2.0 |

La comparativa se basa en las especificaciones públicas de cada modelo. Este espejo destaca por su formato específico para LiteRT/MediaPipe, que lo hace directamente utilizable en aplicaciones Android sin conversión adicional. Sin embargo, su licencia Gemma es más restrictiva que las alternativas de código abierto como MIT o Apache 2.0, y su contexto de 32K es inferior al de Llama 3.2 1B (128K) o Phi-3 mini (128K).

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje, Gemma 3 1B puede generar contenido sesgado, incorrecto o inventado. No debe utilizarse en aplicaciones donde la veracidad de la información sea crítica sin supervisión humana.
- Contexto limitado: la ventana de 32K tokens es suficiente para notas y conversaciones cortas, pero insuficiente para documentos extensos o historiales largos.
- Licencia restrictiva: la licencia Gemma Terms of Use de Google impone restricciones de uso comercial y requiere el cumplimiento de políticas de uso aceptable. No es una licencia de código abierto estándar.
- Sin soporte multimodal: esta versión no procesa imágenes ni audio, a diferencia de otras variantes de Gemma 3.
- Dependencia de LiteRT/MediaPipe: el formato `.task` no es portable a otros runtimes como llama.cpp o vLLM sin conversión, lo que limita su uso en entornos de servidor.
- Sin garantías de rendimiento: al ser un espejo no oficial, no hay soporte técnico ni garantías de actualización. El modelo base puede quedar obsoleto con nuevas versiones de Gemma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rajeevkr23/secure-notes-ai-gemma3-1b
- Fuente original (LiteRT): https://huggingface.co/litert-community/Gemma3-1B-IT
- Modelo base (Google): https://huggingface.co/google/Gemma-3-1B-IT
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Informe técnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
