# simaai/Qwen2.5-VL-7B-Instruct-GPTQ-Safetensors

## Resumen

El modelo `simaai/Qwen2.5-VL-7B-Instruct-GPTQ-Safetensors` es una versión cuantizada del modelo multimodal Qwen2.5-VL-7B-Instruct, preparada por la empresa Sima.ai para su compilación y despliegue en hardware de inferencia en el borde (edge). El checkpoint está formateado como un artefacto Hugging Face listo para la compilación con LLiMa, el compilador propietario de Sima.ai, y se distribuye bajo licencia Apache 2.0. El modelo combina un codificador visual con un decodificador de texto, lo que permite tareas de entrada imagen-texto y salida de texto.

La cuantización aplica GPTQ en dos niveles: el decodificador y la cabeza de salida (`lm_head`) se cuantizan a INT4 con grupos de 256, mientras que las capas lineales del codificador visual y el fusionador (merger) se cuantizan a INT8 por canal. El proceso de calibración utiliza conjuntos de datos públicos (`ultrachat_200k` para el texto y `flickr30k` para el visual), y el resultado se ha validado con pruebas de carga y generación en Transformers. El tamaño total del repositorio es de 5,4 GB, y el número de parámetros reportado por los safetensors es de 5.029.522.432.

La relevancia de este modelo reside en su optimización para entornos de inferencia con restricciones de memoria y consumo, manteniendo las capacidades del modelo base Qwen2.5-VL-7B-Instruct, que incluye comprensión de imágenes, OCR, generación de texto y conversación multimodal. No se dispone de datos de benchmarks publicados para esta versión cuantizada, y la documentación advierte que la calidad de la cuantización puede variar según el dominio, el idioma y el tipo de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + text decoder), basado en Qwen2.5-VL-7B-Instruct |
| Parametros totales | 5.029.522.432 (según safetensors; modelo base de 7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ INT4 simétrico, G256 (decoder y `lm_head`); GPTQ INT8 simétrico per-channel (vision encoder y merger) |
| Idiomas soportados | multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un codificador de visión (vision encoder) con un decodificador de texto autoregresivo. El checkpoint cuantizado no ha sido entrenado desde cero, sino que se ha obtenido mediante un proceso de cuantización post-entrenamiento con GPTQ (Generalized Post-Training Quantization).

El proceso de cuantización se divide en dos etapas. Por un lado, el decoder y la cabeza de salida (`lm_head`) se cuantizan a 4 bits con grupos de 256, usando 512 muestras determinísticas del dataset `HuggingFaceH4/ultrachat_200k` (split `train_sft`) con hasta 1.024 tokens y semilla 0. Por otro lado, el codificador visual y el fusionador (merger) se cuantizan a 8 bits por canal, utilizando las primeras 512 muestras determinísticas de `lmms-lab/flickr30k` (split `test`) con hasta 2.048 tokens. Todos los pasos GPTQ emplean ordenación estática de activaciones, tamaño de bloque 128 y fracción de amortiguación 0.01.

El checkpoint resultante contiene 359 capas lineales cuantizadas (196 en el decoder, 1 en `lm_head` y 162 en la parte visual), todas con escalas verificadas como finitas. La validación incluye pruebas de carga en Transformers y generación de texto, imagen-texto y conversaciones multi-turno. La compilación con LLiMa se realiza de forma separada y no se incluye en el repositorio.

## Capacidades

- Comprensión de imágenes y generación de texto descriptivo a partir de ellas (pipeline `image-text-to-text`).
- Generación de texto en múltiples idiomas (etiqueta `multilingual`).
- Conversación multi-turno, validada en pruebas de carga y generación.
- Capacidades del modelo base Qwen2.5-VL-7B-Instruct: razonamiento visual, OCR, análisis de imágenes y diálogo multimodal.
- No se documentan capacidades específicas de tool calling, agentes o modo de razonamiento extendido en la información disponible.

## Casos de uso

- Visión por computador en dispositivos de borde: el modelo cuantizado está diseñado para ejecutarse en hardware Sima.ai, permitiendo análisis de imágenes en tiempo real en cámaras de seguridad, drones o robots industriales.
- Extracción de texto de imágenes (OCR) en aplicaciones móviles o escáneres: la cuantización reduce el peso del modelo, facilitando su despliegue en dispositivos con memoria limitada.
- Asistente visual para personas con discapacidad: el modelo puede generar descripciones de escenas o leer etiquetas y carteles en tiempo real mediante un dispositivo portátil.
- Moderación de contenido en plataformas sociales: clasificación automática de imágenes y generación de informes de contenido inapropiado en entornos con restricciones de recursos.
- Automatización de almacenes y logística: identificación de códigos, etiquetas o productos en imágenes capturadas por cámaras industriales, con respuesta textual para sistemas de control.
- Atención al cliente multimodal: combinación de imágenes (capturas de pantalla, fotografías de producto) y texto para resolver consultas de usuarios en chatbots o sistemas de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint está preparado para la compilación con LLiMa, el compilador de Sima.ai, para su despliegue en hardware de la compañía.
- No se especifican requisitos de VRAM, GPUs concretas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) en la documentación disponible.
- El tamaño del repositorio (5,4 GB) sugiere que puede caber en dispositivos con memoria de 8 GB o superior, pero no hay datos oficiales de requisitos de inferencia.
- La cuantización a INT4 e INT8 reduce el tamaño de los pesos respecto al modelo base, lo que facilita el despliegue en dispositivos de borde, aunque no se proporcionan cifras de throughput o latencia.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos cuantizados o vision-language en la información disponible.

## Limitaciones y advertencias

- La calidad de la cuantización puede variar según el idioma, el dominio, el formato de prompt, el tipo de imagen y la longitud de contexto, como advierte la documentación del autor.
- El checkpoint es un artefacto pre-LLiMa; el compilador LLiMa debe generar un artefacto de despliegue separado antes de su uso en hardware.
- No se han publicado evaluaciones de seguridad o sesgos específicos para esta versión cuantizada.
- El modelo base Qwen2.5-VL-7B-Instruct puede presentar sesgos o alucinaciones en contextos visuales, y estas características se heredan en la versión cuantizada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento y los requisitos de seguridad para el caso de uso concreto antes de la producción.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/simaai/Qwen2.5-VL-7B-Instruct-GPTQ-Safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
