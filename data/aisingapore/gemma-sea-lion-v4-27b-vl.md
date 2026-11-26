# aisingapore/Gemma-SEA-LION-v4-27B-VL

## Resumen

Gemma-SEA-LION-v4-27B-VL es un modelo multimodal (imagen-texto) de tipo decoder, desarrollado por SEACrowd y el AI Products Pillar de AI Singapore con financiación del NRF de Singapur. Se construye mediante fine-tuning supervisado (SFT) sobre Gemma-SEA-LION-v4-27B-IT, que a su vez deriva de la arquitectura Gemma 3 27B, y incorpora comprensión conjunta de imágenes y texto. Su propósito es cubrir las necesidades de visión y lenguaje en el sudeste asiático, una región tradicionalmente infrarrepresentada en los modelos multimodales abiertos.

El modelo emplea la arquitectura Gemma 3 con 27.432.406.640 parámetros (unos 27,4 mil millones), una ventana de contexto de 128.000 tokens y el tokenizador original de Gemma 3 27B IT. El post-entrenamiento se realizó sobre aproximadamente 540.000 pares instrucción-imagen en birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita, seguido de una fusión de modelos (mergekit) con Gemma3-27B-IT para preservar el conocimiento general de visión y texto.

Su relevancia actual radica en que, según el autor, a fecha de 15 de octubre de 2025 destaca en tareas del sudeste asiático frente a otros modelos abiertos de menos de 200.000 millones de parámetros, con un rendimiento comparable a modelos cerrados de mayor tamaño. Se distribuye con licencia MIT, lo que facilita su adopción comercial, y hereda de Gemma 3 capacidades de function calling y salidas estructuradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer basada en Gemma 3 (multimodal imagen-texto) |
| Parametros totales | 27.432.406.640 (~27,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Ingles, chino (mandarin), vietnamita, indonesio, tailandes, filipino (tagalo), tamil, malayo, jemer, lao, birmano, javanes y sundanés |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer multimodal que hereda la arquitectura Gemma 3, con capacidad de comprensión de imágenes y texto, incluida comprensión de documentos, VQA (preguntas y respuestas visuales) y razonamiento fundamentado en imágenes. Se parte de Gemma-SEA-LION-v4-27B-IT y se realiza un fine-tuning supervisado (SFT) sobre unos 540.000 pares instrucción-imagen en diez idiomas del sudeste asiático más el inglés. Los datos provienen de una mezcla de fuentes: datos web, código y conjuntos de datos de código abierto. Tras el SFT se aplica una fusión de modelos (mergekit) con Gemma3-27B-IT para conservar el conocimiento general de visión y texto.

El tokenizador es el predeterminado de Gemma 3 27B IT. La model card indica que el modelo no fue entrenado específicamente para mejorar sus capacidades de texto: al haberse ajustado exclusivamente sobre el backend visión-texto, su rendimiento en texto puro es comparable al de Gemma-SEA-LION-v4-27B-IT, sin mejoras significativas en ese ámbito. No se detallan en la información disponible datos sobre RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento en 13 idiomas, con especial foco en lenguas del sudeste asiático.
- Comprensión de imágenes: descripción de imágenes (image captioning) y respuesta a preguntas visuales (VQA).
- Comprensión de documentos e imágenes con texto.
- Razonamiento fundamentado en imágenes (image-grounded reasoning).
- Function calling y salidas estructuradas, heredados de Gemma 3, para integración en sistemas mayores.
- Conversación multi-turno con contexto largo (hasta 128.000 tokens).
- Soporte de tool calling y de integración en pipelines de agentes, según las capacidades heredadas de Gemma 3.
- Capacidades multilingües específicas para birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita.

## Casos de uso

- Atención al cliente multimodal en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de productos, documentos) y responder en el idioma local del usuario gracias a su cobertura de 13 idiomas y su ventana de 128.000 tokens.
- Digitalización y comprensión de documentos: extracción de información de facturas, formularios o documentos escaneados en lenguas regionales, usando la comprensión de documentos y las salidas estructuradas para devolver JSON u otros formatos.
- Moderación y análisis de contenido visual: descripción y clasificación de imágenes enviadas por usuarios en plataformas locales, con razonamiento fundamentado en la imagen.
- Accesibilidad: generación automática de descripciones de imágenes (alt text) en birmano, jemer, lao o tamil, idiomas con escasa cobertura en herramientas comerciales.
- Comercio electrónico: respuesta a preguntas sobre productos a partir de fotos del artículo, con soporte de VQA y de idiomas como indonesio, tailandés o vietnamita.
- Asistentes para educación y turismo: interpretación de mapas, carteles o menús fotografiados y explicación en el idioma del usuario, aprovechando la comprensión visual y el multilingüismo regional.
- Integración en agentes y pipelines: uso de function calling y salidas estructuradas para conectar el modelo con APIs y flujos automatizados en producción.

## Benchmarks y rendimiento

La model card menciona evaluaciones en tareas de VQA de estilo Multiple Choice Question (MARVL, CVQA y WorldCuisines) y en image captioning (XM3600), así como una comparación en el leaderboard de SEA-LION, pero no se han publicado los valores numéricos de los resultados en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (como en el ejemplo de la model card), se requieren aproximadamente 55 GB de VRAM solo para los pesos, más memoria para el contexto y las imágenes. El tamaño del repositorio es de 54,9 GB.
- GPU recomendadas: para bfloat16 se necesitan GPU de clase A100 80 GB o H100 80 GB; una RTX 4090 (24 GB) no es suficiente en precisión completa.
- Cabe en GPU de consumo: no en bfloat16 con una sola GPU de consumo; requeriría cuantización (no documentada en la información disponible) o reparto entre varias GPU.
- Opciones de despliegue: transformers (pipeline image-text-to-text), text-generation-inference (etiqueta presente en el modelo) y endpoints compatibles; no se confirman otras opciones como vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-27B-VL | ~27,4 B | 128K | Imagen-texto | MIT | Foco en lenguas del sudeste asiático |
| Gemma-SEA-LION-v4-27B-IT | ~27 B (no confirmado) | 128K | Texto | MIT | Modelo base, sin visión |
| Gemma 3 27B IT | ~27 B (no confirmado) | 128K | Imagen-texto | Licencia Gemma (no confirmada) | Modelo original del que deriva la familia |
| Qwen-SEA-LION-v4.5-27B-IT | No disponible | No disponible | Texto | No disponible | Indicado como nueva versión en la model card |

Los datos de parámetros y contexto de los modelos comparables no se detallan en la información proporcionada; se indican como no disponibles cuando no se confirman.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de protección.
- No se probó la robustez frente a prompting adversarial.
- Riesgo de alucinación: como otros LLM, puede generar contenido irrelevante o ficticio no fundamentado en el contexto; conviene validar las respuestas.
- Sus capacidades de texto puro son comparables a las de Gemma-SEA-LION-v4-27B-IT y no presentan mejoras significativas, ya que el ajuste se centró en el backend visión-texto.
- La cobertura lingüística se limita a los 13 idiomas declarados; el rendimiento en otras lenguas no está garantizado.
- La licencia MIT permite uso comercial, pero el autor declina responsabilidad por reclamaciones derivadas del uso de los pesos.
- Las cifras de entrenamiento y mezcla de datos reflejan la ejecución concreta de este checkpoint y pueden diferir de las publicaciones de investigación o de los conjuntos de datos abiertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-VL
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT
- Nueva versión indicada: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT
- Leaderboard SEA-LION: https://leaderboard.sea-lion.ai/
- Licencia MIT: https://mit-license.org/
- Paper referenciado (arXiv 1910.09700): https://arxiv.org/abs/1910.09700
