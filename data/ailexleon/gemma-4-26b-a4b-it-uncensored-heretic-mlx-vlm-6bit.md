# ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-6Bit

## Resumen

El modelo `ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-6Bit` es una conversión al formato MLX (Machine Learning eXtensions de Apple) con cuantización de 6 bits del modelo `llmfan46/gemma-4-26B-A4B-it-uncensored-heretic`, que a su vez es una versión "uncensored" (abliterada) del Gemma 4 26B A4B IT desarrollado por Google DeepMind. Se trata de un modelo multimodal (image-text-to-text) capaz de procesar imágenes y generar texto, con una arquitectura Mixture-of-Experts (MoE) de 25.2 mil millones de parámetros totales, de los cuales solo 3.8 mil millones se activan por token, lo que permite una inferencia rápida con calidad de modelo denso de gran tamaño.

La relevancia de esta conversión radica en que permite ejecutar un modelo de alto rendimiento en hardware Apple Silicon mediante la librería MLX, aprovechando la memoria unificada de los Mac. La cuantización de 6 bits reduce el tamaño del modelo a 21.7 GB (según el repositorio), manteniendo un equilibrio entre precisión y uso de memoria. Además, al ser una versión "uncensored" mediante la técnica de abliteration, elimina los mecanismos de rechazo del modelo original, lo que lo hace útil para investigación en alineación y seguridad, aunque con riesgos asociados. El modelo está licenciado bajo Apache 2.0 y soporta exclusivamente el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal (vision-language), basada en Gemma 4 |
| Parametros totales | 6.091.232.846 (en safetensors de esta conversion); el modelo base tiene 25.2B |
| Parametros activos | 3.8B (del modelo base) |
| Longitud de contexto | 262.144 tokens (del modelo base) |
| Tipos de cuantizacion | 6-bit (esta conversion); tambien existen versiones 4-bit del mismo autor |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 26B A4B IT emplea una arquitectura Mixture-of-Experts con 25.2B parametros totales y 3.8B activos por token, lo que proporciona una velocidad de inferencia cercana a un modelo de 4B manteniendo la calidad de un modelo mucho mayor. Es multimodal: procesa imagenes y texto, generando salidas de texto. El contexto soportado es de hasta 262.144 tokens. La version "Uncensored Heretic" de llmfan46 aplica la tecnica de abliteration, que elimina selectivamente las capas responsables del rechazo de contenido, resultando en un modelo sin restricciones de contenido. La conversion a MLX fue realizada con mlx-vlm version 0.6.13, y la cuantizacion de 6 bits reduce el tamaño de los pesos para su ejecucion eficiente en Apple Silicon. No se dispone de informacion detallada sobre los datos de entrenamiento, el dataset utilizado ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento complejo en ingles.
- Comprension y descripcion de imagenes (entrada de imagen, salida de texto).
- Conversacion multi-turno (pipeline conversational).
- Soporte de function calling: no confirmado en esta conversion, aunque el modelo base Gemma 4 lo incluye.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta conversion.
- Multilingue: solo ingles.
- Sin censura de contenido gracias a la abliteration, lo que permite generar respuestas sobre temas que el modelo original rechazaria.
- Modo "thinking" o razonamiento interno: no disponible en la informacion.

## Casos de uso

- Analisis de imagenes en entornos de investigacion: el modelo puede describir con detalle el contenido de una imagen, util para anotacion automatica de datasets o generacion de informes visuales.
- Asistentes conversacionales sin restricciones tematicas: al estar "uncensored", puede abordar preguntas sobre temas delicados (medicina, politica, etc.) sin rechazo, aunque con riesgo de respuestas imprecisas.
- Generacion de codigo con contexto visual: por ejemplo, a partir de una captura de pantalla de un error, el modelo puede sugerir correcciones, aprovechando su capacidad multimodal.
- Despliegue local en Mac para aplicaciones de productividad: gracias a MLX, se ejecuta en Apple Silicon sin necesidad de GPU externa, ideal para asistentes personales offline.
- Investigacion en alineacion y seguridad de IA: estudiar el comportamiento de modelos sin mecanismos de rechazo ayuda a entender los riesgos de la abliteration y a disenar mejores sistemas de seguridad.
- Prototipado rapido de aplicaciones vision-language: al ser una conversion ligera (6-bit), permite iterar rapidamente en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Gemma 4 26B A4B IT tiene resultados conocidos en tareas como MMLU, HumanEval y GSM8K, pero no se proporcionan datos concretos para esta conversion MLX de 6 bits.

## Requisitos de hardware

- Es una conversion MLX, por lo que esta optimizada para Apple Silicon (M1, M2, M3, M4 y posteriores).
- Tamaño del repositorio: 21.7 GB. Con cuantizacion de 6 bits, se estima que requiere al menos 24 GB de memoria unificada para cargar los pesos y ejecutar inferencia con margen (aunque el dato exacto no esta disponible).
- En el modelo base (Q4_K_M) se requieren aproximadamente 16.13 GB de VRAM segun llmrun.dev; esta version de 6 bits consumira algo mas de memoria.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; requiere convertir los pesos a otros formatos (GGUF, etc.) si se desea usar en esos entornos.
- Opciones de despliegue: mlx-vlm (recomendado), tambien se puede usar con otros frameworks si se convierte previamente.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-6Bit | 6.09B (en safetensors) / 25.2B base | 262K | Apache 2.0 | MLX 6-bit | Sin censura, multimodal |
| llmfan46/gemma-4-26B-A4B-it-uncensored-heretic | 25.2B | 262K | Apache 2.0 | safetensors (original) | Sin censura, multimodal |
| ailexleon/gemma-4-26B-A4B-it-qat-uncensored-heretic-mlx-lm-4Bit | No disponible | 262K | Apache 2.0 | MLX 4-bit | Version 4-bit del mismo autor, solo texto (lm) |
| Google Gemma 4 26B A4B IT (original) | 25.2B | 262K | Gemma license | safetensors | Con censura, multimodal |

La comparativa se basa en los datos disponibles; no se incluyen otros modelos multimodales como LLaVA o Qwen-VL por falta de informacion comparable.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, ilegal, peligroso o falso. El uso debe ser responsable y solo en entornos controlados.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar informacion, especialmente en temas delicados.
- Solo soporta ingles; no es adecuado para tareas multilingues.
- La cuantizacion de 6 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo original en precision completa.
- La licencia Apache 2.0 se indica en la model card, pero el modelo base de Google tiene su propia licencia (Gemma license) que puede imponer restricciones adicionales; se recomienda verificar ambos terminos.
- No hay informacion sobre sesgos especificos del modelo, pero al ser una version abliterada, los sesgos del modelo original pueden verse amplificados.
- Para uso en produccion, se debe evaluar cuidadosamente la fiabilidad de las respuestas, especialmente en aplicaciones que requieran precision factual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ailexleon/gemma-4-26B-A4B-it-uncensored-heretic-mlx-vlm-6Bit
- Modelo base (llmfan46): https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-uncensored-heretic
- Version 4-bit del mismo autor: https://huggingface.co/ailexleon/gemma-4-26B-A4B-it-qat-uncensored-heretic-mlx-lm-4Bit
- Requisitos de hardware del modelo base: https://llmrun.dev/model/llmfan46-gemma-4-26b-a4b-it-uncensored-heretic
- Informacion sobre Gemma 4 en Intel: https://aiswcatalog.intel.com/models/google-gemma-4-26b-a4b-it
- Documentacion de Gemma 4 en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
