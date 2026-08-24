# gepardzik/G4-Exp1-26B-A4B

## Resumen

G4-Exp1-26B-A4B es un modelo de lenguaje multimodal desarrollado por gepardzik, construido a partir de google/gemma-4-26B-A4B de Google. Se trata de un fine-tuning supervisado (SFT) sobre 16.252.928 tokens de textos anteriores a 2023, fusionado posteriormente con llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic mediante aritmética de tareas (task arithmetic). El resultado es un modelo MoE de 25,8 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token, que hereda las capacidades multimodales de Gemma 4 (entrada de imagen y texto, salida de texto) pero añade flexibilidad léxica y un comportamiento desinhibido por defecto.

La relevancia de este modelo reside en que ofrece una alternativa "uncensored" sobre la base de Gemma 4, con mejor manejo de lenguaje informal y un estilo de salida menos rígido (menos viñetas y texto en negrita), manteniendo las capacidades de tool calling y generación de texto del modelo original. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y existe disponible en formato safetensors y cuantizaciones GGUF generadas por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, basada en Gemma 4 26B A4B |
| Parametros totales | 25.805.936.206 (25,8 mil millones) |
| Parametros activos | ~4 mil millones (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (fp16), GGUF (Q6_K, TQ3_1S y otros) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B, una arquitectura MoE multimodal con 25,8 mil millones de parámetros totales y 4 mil millones activos por token (de ahí la nomenclatura A4B). La arquitectura combina atención con ventana de contexto extensible, mecanismos de predicción multi-token (MTP) y un codificador visual que permite procesar imágenes junto con texto. El SFT se realizó sobre 16.252.928 tokens de textos anteriores a 2023, con el objetivo de mejorar la flexibilidad léxica y reducir el estilo de salida "slop" (puntuación excesiva, viñetas y negritas innecesarias) característico del modelo base.

Posteriormente, el modelo se fusionó con llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic mediante task arithmetic, una técnica que combina los pesos de ambos modelos sumando las diferencias respecto al modelo base. El resultado es un modelo que conserva el comportamiento general de Gemma 4 pero con mayor libertad léxica, sin restricciones de contenido y con una ligera caída en la tasa de aceptación MTP en tareas de escritura.

## Capacidades

- Generación de texto en lenguaje natural con mayor flexibilidad léxica que Gemma 4 base, incluyendo vocabulario explícito sin fallos.
- Entrada multimodal: acepta imágenes y texto como entrada, generando texto como salida.
- Tool calling / function calling funcional, especialmente con cuantizaciones Q6_K y superiores.
- Razonamiento y generación de código heredados de Gemma 4 26B.
- Menor uso de viñetas y texto en negrita en las respuestas, estilo de salida menos formal.
- Comportamiento "uncensored" por defecto, sin restricciones de contenido.
- Capacidad de conversación multi-turno y mantenimiento de contexto en diálogos.

## Casos de uso

- Generación de contenido creativo: el modelo puede escribir narrativa, guiones y texto creativo con vocabulario amplio y sin las restricciones estilísticas del modelo base, lo que lo hace adecuado para proyectos de ficción y guionización.
- Agente conversacional con personalidad: al ser "uncensored" y con mejor manejo de lenguaje informal, puede desplegarse como chatbot con tono desenfadado o adulto, sin que el modelo falle al usar expresiones coloquiales o malsonantes.
- Prototipado de agentes con tool calling: soporta function calling en cuantizaciones altas, por lo que puede integrarse en pipelines de agentes que necesiten llamar a APIs, bases de datos o herramientas externas.
- Análisis de imágenes con descripción textual: la entrada multimodal permite procesar capturas de pantalla, diagramas o fotografías y generar descripciones, resúmenes o transcripciones en texto.
- Investigación en alineación y seguridad: al ser un modelo "uncensored" basado en Gemma 4, sirve como caso de estudio para comparar el comportamiento de modelos alineados y desalineados en tareas de generación de contenido sensible.
- Automatización de documentos con estilo controlado: gracias a la reducción de viñetas y negritas, puede generar informes, correos o documentación con un tono más natural y menos plantilla.
- Desarrollo de aplicaciones multimodales en producción: con licencia Apache 2.0 y soporte para vLLM y transformers, puede integrarse en pipelines de producción sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio en safetensors ocupa 51,6 GB (fp16), lo que requiere al menos 52 GB de VRAM para cargar el modelo completo sin cuantización.
- Con cuantizaciones GGUF: Q6_K aproximadamente 20 GB, Q4_K_M aproximadamente 13 GB, Q3_K_M aproximadamente 10 GB (estimaciones basadas en 25,8 mil millones de parámetros).
- GPU recomendadas: A100 80 GB o H100 para el modelo en fp16; RTX 4090 (24 GB) o A6000 (48 GB) para cuantizaciones Q6; RTX 4080 (16 GB) o RTX 3090 (24 GB) para Q4; RTX 4070 (12 GB) o similar para Q3.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (con GGUF), TGI (Text Generation Inference) y transformers.
- Al ser un MoE con solo 4 mil millones de parámetros activos por token, la velocidad de inferencia es comparable a la de un modelo de 4B, aunque requiere cargar todos los pesos de los expertos en memoria.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| google/gemma-4-26B-A4B (base) | 25,8B totales / 4B activos | no disponible | Apache 2.0 | HuggingFace |
| llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic | 25,8B totales / 4B activos | no disponible | Apache 2.0 | HuggingFace |
| G4-Exp1-26B-A4B (este modelo) | 25,8B totales / 4B activos | no disponible | Apache 2.0 | HuggingFace |

Los tres modelos comparten la misma arquitectura MoE multimodal. El modelo de Google incluye restricciones de contenido y un estilo de salida más formal, mientras que llmfan46 y G4-Exp1 son "uncensored" por defecto. G4-Exp1 añade además el SFT sobre textos pre-2023, que mejora la flexibilidad léxica y reduce el estilo "slop" (viñetas, negritas, puntuación excesiva) respecto a sus bases.

## Limitaciones y advertencias

- El modelo es "uncensored" por defecto, lo que implica que puede generar contenido explícito, ofensivo o inapropiado. El autor advierte que se use bajo la propia responsabilidad.
- No se han documentado los idiomas soportados ni la longitud de contexto exacta; es necesario consultar la documentación oficial de Gemma 4.
- El autor reporta una pequeña caída en la tasa de aceptación MTP en tareas de escritura debido a los cambios de estilo, lo que puede afectar ligeramente al rendimiento en generación de texto largo.
- El modelo sigue siendo propenso a "slop punctuation" (puntuación excesiva o innecesaria) y figuras retóricas molestas, a pesar del SFT.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento de contexto largo.
- El comportamiento "uncensored" puede suponer un riesgo legal o ético en aplicaciones comerciales si no se implementan filtros de contenido adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/gepardzik/G4-Exp1-26B-A4B
- Modelos cuantizados de Gemma 4 26B A4B: https://huggingface.co/models?other=base_model:quantized:google/gemma-4-26B-A4B
- Guía de rendimiento de Gemma 4 26B A4B: https://www.gemma4.wiki/models/26b-a4b-gemma
- Documentación de Gemma 4 en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google
- Guía de tamaños y memoria de Gemma 4: https://gemma4.org/gemma-4-model-sizes
