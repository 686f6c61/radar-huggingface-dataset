# josescal/castuolm-translator-qwen05b

## Resumen

El modelo `josescal/castuolm-translator-qwen05b` es un adaptador LoRA (Low-Rank Adaptation) diseñado para la traducción bidireccional entre el castellano y el castúo (extremeño), una lengua minoritaria hablada en Extremadura (España). Desarrollado por el autor josescal, este adaptador se entrena sobre un modelo base identificado como `models/base_qwen`, que por el nombre del repositorio y las etiquetas corresponde probablemente a un modelo de la familia Qwen2.5 de 0.5B parámetros. El objetivo principal es la preservación dialectal y la facilitación de la comunicación en esta lengua poco representada en los sistemas de traducción automática.

El adaptador se publica bajo licencia Apache-2.0 y se distribuye en formato safetensors, con un tamaño de repositorio de 0.0 GB, lo que confirma que se trata de un adaptador ligero (los pesos del adaptador son mucho menores que los del modelo base). El entrenamiento se realizó sobre el dataset `josescal/castuoLM-es-ext-parallel`, que combina el diccionario OSCEC (Órgano de Seguimiento y Coordinación del Extremeño) con datos de Tatoeba, formateados en estilo ChatML para el ajuste supervisado. Aunque el modelo está pensado para generación de texto conversacional, su función principal es la traducción de frases y textos entre ambos idiomas.

La relevancia de este modelo radica en su contribución a la digitalización y preservación de una lengua en peligro de desaparición, así como en la demostración de que es posible adaptar modelos de lenguaje pequeños y abiertos para tareas específicas de traducción de lenguas minoritarias con recursos computacionales limitados. No obstante, al tratarse de un adaptador sobre un modelo base de solo 0.5B, su capacidad de razonamiento complejo y su calidad de traducción en textos largos o técnicos pueden ser limitadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base Qwen2.5 (probablemente 0.5B, identificador `models/base_qwen`) |
| Parametros totales | No disponible (el adaptador LoRA es pequeño, pero no se indica el número exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; Qwen2.5 suele soportar hasta 32 768 tokens, pero no está confirmado para este adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se ofrece en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Castellano (es) y castúo/extremeño (ext) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de ajuste eficiente de parámetros que congela los pesos del modelo base y entrena solo matrices de baja dimensión en las capas de atención y feed-forward. El modelo base, identificado como `models/base_qwen`, no es un identificador estándar de HuggingFace, pero las etiquetas del repositorio (`qwen2.5`) y el nombre del archivo (`qwen05b`) sugieren que se trata de Qwen2.5-0.5B, un modelo transformer causal de 0.5 mil millones de parámetros con soporte multilingüe. El adaptador se entrena mediante ajuste supervisado (SFT) sobre el dataset paralelo `josescal/castuoLM-es-ext-parallel`, que combina el diccionario OSCEC (que recoge vocabulario y expresiones extremeñas) con pares de frases de Tatoeba. Los datos se formatean en estilo ChatML, con mensajes de sistema, usuario y asistente, lo que permite al modelo seguir instrucciones de traducción en un contexto conversacional.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del uso de LoRA y el formato de prompt. El código de ejemplo en la model card muestra cómo cargar el adaptador con `transformers` y `peft`, lo que indica que la inferencia requiere primero cargar el modelo base y luego el adaptador.

## Capacidades

- Traducción bidireccional castellano-castúo: el modelo puede traducir frases y textos cortos entre ambos idiomas, tanto del castellano al castúo como del castúo al castellano.
- Generación de texto conversacional: al estar entrenado en formato ChatML, puede mantener diálogos breves y responder a instrucciones de traducción en un contexto de chat.
- Preservación dialectal: está especializado en el extremeño (castúo), incluyendo vocabulario y expresiones recogidas en el diccionario OSCEC, lo que lo diferencia de modelos genéricos de traducción que ignoran esta lengua.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio u otras funcionalidades avanzadas.

## Casos de uso

- Traducción de textos literarios y folclóricos: escritores o investigadores pueden utilizar el modelo para traducir cuentos, poemas o refranes al castúo, preservando la riqueza lingüística de la región. El modelo es adecuado porque maneja vocabulario específico del diccionario OSCEC.
- Herramientas de aprendizaje del extremeño: estudiantes o personas interesadas en aprender castúo pueden usarlo como traductor de apoyo en aplicaciones educativas, generando frases de ejemplo y ejercicios de traducción.
- Subtitulado de contenido audiovisual: creadores de contenido local pueden traducir subtítulos de vídeos o documentales sobre Extremadura al castúo, aunque la limitación de contexto del modelo base (0.5B) puede requerir dividir los textos en segmentos cortos.
- Chatbots de atención al ciudadano en entidades locales: ayuntamientos o instituciones extremeñas podrían integrar este modelo en un chatbot para responder en castúo a consultas sencillas, fomentando el uso de la lengua en servicios públicos.
- Digitalización de patrimonio lingüístico: archivos y bibliotecas pueden emplear el modelo para transcribir y traducir documentos históricos o grabaciones en castúo, facilitando su catalogación y acceso.
- Promoción cultural y turística: agencias de turismo o webs de promoción de Extremadura pueden traducir contenido informativo al castúo, atrayendo a visitantes interesados en la cultura local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de calidad de traducción (BLEU, chrF, etc.) ni comparaciones con otros modelos de traducción para lenguas minoritarias. El autor no ha documentado evaluaciones formales ni pruebas de rendimiento.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (tamaño del repositorio 0.0 GB), pero requiere cargar el modelo base Qwen2.5-0.5B. En FP16, el modelo base ocupa aproximadamente 1 GB de memoria, y en FP32 unos 2 GB.
- Puede ejecutarse en CPU para inferencia de baja latencia, aunque se recomienda una GPU para tiempos de respuesta más rápidos. Una GPU con 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente para el modelo base y el adaptador.
- El modelo base Qwen2.5-0.5B puede ejecutarse en tarjetas consumer de gama baja, como RTX 3060, RTX 4060, o incluso en Mac con Apple Silicon.
- Opciones de despliegue: el código de ejemplo usa `transformers` y `peft`, por lo que se puede integrar en pipelines de Hugging Face. También es posible convertirlo a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- No se han publicado datos de latencia o throughput. En una GPU moderna, la generación de 64 tokens debería completarse en menos de un segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente orientados a la traducción castellano-castúo. No hay alternativas conocidas en HuggingFace ni en la literatura para esta combinación lingüística. Los modelos multilingües genéricos (por ejemplo, NLLB-200, M2M-100) no incluyen el extremeño en sus vocabularios. Por tanto, esta comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo base es de solo 0.5B parámetros, lo que limita su capacidad de razonamiento, coherencia en textos largos y manejo de estructuras gramaticales complejas. Las traducciones de frases extensas pueden ser inexactas o incoherentes.
- El dataset de entrenamiento es reducido (diccionario OSCEC + Tatoeba), lo que puede provocar sesgos hacia vocabulario específico y falta de cobertura de expresiones coloquiales o regionales variadas.
- Existe riesgo de alucinaciones: el modelo puede inventar palabras o construcciones que no son propias del castúo, especialmente en contextos poco representados en el dataset.
- El identificador del modelo base (`models/base_qwen`) no es un estándar público; es posible que el autor se refiera a un modelo local o a una versión modificada, lo que dificulta la reproducibilidad exacta del adaptador.
- No se han publicado evaluaciones de calidad ni pruebas de robustez. Antes de usar en producción, se recomienda validar las traducciones con hablantes nativos de extremeño.
- Aunque la licencia es Apache-2.0 (permite uso comercial), el autor no ofrece garantías sobre la precisión o idoneidad del modelo para fines profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josescal/castuolm-translator-qwen05b
- Dataset de entrenamiento: https://huggingface.co/datasets/josescal/castuoLM-es-ext-parallel
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios adicionales) en la búsqueda web realizada.
