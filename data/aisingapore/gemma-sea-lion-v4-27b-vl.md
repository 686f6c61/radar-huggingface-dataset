# aisingapore/Gemma-SEA-LION-v4-27B-VL

## Resumen

Gemma-SEA-LION-v4-27B-VL es un modelo de visión y lenguaje (VLM) desarrollado por AI Singapore, dentro de la iniciativa SEA-LION (Southeast Asian Languages In One Network). Se trata de una versión con capacidades multimodales del modelo Gemma-SEA-LION-v4-27B-IT, que a su vez es un ajuste fino de Gemma 3 27B IT. El modelo ha sido post-entrenado con aproximadamente 540 000 pares de instrucción e imagen en 11 idiomas del Sudeste Asiático, más inglés y mandarín, con el objetivo de mejorar la comprensión visual y cultural de la región.

El modelo hereda de Gemma 3 una ventana de contexto de 128 000 tokens, capacidades de comprensión de imágenes y texto, incluyendo lectura de documentos, respuesta a preguntas visuales y razonamiento basado en imágenes, además de soporte para function calling y salidas estructuradas. Está pensado para desarrolladores e investigadores que necesitan un VLM multilingüe con enfoque regional, especialmente para aplicaciones que requieran entender contenido visual y textual en idiomas del Sudeste Asiático.

Su relevancia actual radica en que cubre un vacío en el ecosistema de modelos abiertos: la mayoría de los VLM están optimizados para inglés o lenguas europeas, mientras que este modelo está específicamente entrenado para lenguas como tailandés, vietnamita, indonesio, tagalo, birmano, jemer, lao, malayo, tamil, javanés y sundanés, entre otras. La licencia es la de Gemma, que permite uso comercial bajo ciertas condiciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Gemma 3) |
| Parametros totales | 27 432 406 640 (~27,4 mil millones) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Birmano, inglés, indonesio, khmer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer decoder con atención causal y capacidades multimodales nativas para procesar imágenes y texto. El proceso de entrenamiento consistió en dos fases: primero, un ajuste fino supervisado (SFT) sobre el modelo Gemma-SEA-LION-v4-27B-IT utilizando 540 000 muestras de pares visión-texto en 10 idiomas (aunque la lista de idiomas menciona 11, la model card indica "10 languages" en el procedimiento de entrenamiento). Posteriormente, se realizó una fusión de modelos (model merging) con Gemma 3 27B IT para preservar el conocimiento general de visión y texto que podría haberse degradado durante el SFT regional.

No se han publicado detalles sobre los hiperparámetros de entrenamiento, el número de épocas, la tasa de aprendizaje o el hardware utilizado. La tokenización emplea el tokenizer por defecto de Gemma 3 27B IT. El modelo no ha sido alineado para seguridad, según advierte la propia model card.

## Capacidades

- Comprensión de imágenes y texto: puede procesar entradas multimodales, responder preguntas sobre imágenes, leer documentos escaneados y razonar sobre contenido visual.
- Razonamiento visual: soporta tareas de VQA (Visual Question Answering) y razonamiento basado en imágenes, incluyendo preguntas de opción múltiple.
- Function calling: hereda de Gemma 3 la capacidad de invocar funciones y generar salidas estructuradas, lo que permite integrarlo en sistemas agénticos.
- Contexto largo: ventana de 128 000 tokens, adecuada para documentos extensos o conversaciones multi-turno con mucho historial.
- Multilingüismo: entrenado específicamente para 11 idiomas del Sudeste Asiático, más inglés y mandarín, con especial énfasis en comprensión cultural y visual de la región.
- Generación de texto: mantiene las capacidades del modelo base Gemma-SEA-LION-v4-27B-IT, aunque sin mejoras adicionales en texto puro.

## Casos de uso

- Atención al cliente multilingüe con soporte visual: el modelo puede gestionar conversaciones donde el usuario envía capturas de pantalla, fotos de productos o documentos, y responder en idiomas como tailandés, vietnamita o indonesio, gracias a su ventana de 128 000 tokens y su entrenamiento regional.
- Análisis de documentos administrativos: permite extraer información de facturas, formularios o contratos escaneados en idiomas del Sudeste Asiático, combinando OCR implícito con comprensión de lenguaje natural.
- Moderación de contenido visual en plataformas sociales: puede clasificar imágenes y texto asociado en múltiples idiomas de la región, ayudando a detectar contenido inapropiado o spam.
- Asistentes educativos para aprendizaje de idiomas: al comprender imágenes y texto en lenguas como jemer, lao o birmano, puede crear ejercicios interactivos que asocien imágenes con vocabulario o frases.
- Sistemas de recomendación turística: puede analizar fotos de lugares, menús o señalización y responder en el idioma local, facilitando la interacción con viajeros.
- Automatización de procesos de negocio con entrada visual: integrado mediante function calling, puede procesar formularios manuscritos o fotografías de productos y generar respuestas estructuradas en JSON para pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo "sobresale en tareas del Sudeste Asiático comparado con otros modelos abiertos de menos de 200 mil millones de parámetros" y que su rendimiento es comparable al de modelos cerrados más grandes, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. Se remite al leaderboard de SEA-LION para consultar las evaluaciones detalladas, pero esos datos no están incluidos en la documentación proporcionada.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. A partir del tamaño de parámetros (27,4 mil millones) y el formato de pesos safetensors, se puede estimar:

- VRAM estimada para inferencia: en precisión FP16 se necesitan aproximadamente 55 GB de VRAM (27,4 B × 2 bytes). Con cuantización int8, alrededor de 28 GB; con int4, unos 14 GB.
- GPU recomendadas: para FP16 se requieren GPUs de clase profesional como A100 80 GB, H100 o similares. En consumer, una RTX 4090 (24 GB) solo podría ejecutar el modelo con cuantización int4 o int8 con limitaciones de contexto.
- Opciones de despliegue: compatible con transformers, vLLM, TGI y text-generation-inference (según los tags de HuggingFace). También puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona oficialmente.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Idiomas | Licencia |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v4-27B-VL | 27,4 B | 128k | Imagen + texto | 11 idiomas SEA + en + zh | Gemma |
| Gemma-SEA-LION-v4-27B-IT | 27,4 B | 128k | Texto | 11 idiomas SEA + en + zh | Gemma |
| Gemma 3 27B IT | 27 B | 128k | Imagen + texto | Más de 100 idiomas | Gemma |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de otros VLM de tamaño similar en la información proporcionada. La principal diferencia entre el modelo VL y el IT es la adición de capacidades de visión, mientras que la diferencia con Gemma 3 27B IT es el ajuste regional en idiomas del Sudeste Asiático.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad. Los desarrolladores deben realizar su propio ajuste de seguridad antes de usarlo en producción.
- No se ha probado su robustez frente a ataques adversariales (prompt injection, entradas maliciosas).
- Riesgo de alucinación: como muchos LLM, puede generar contenido ficticio o irrelevante no fundamentado en el contexto proporcionado.
- Las capacidades de texto puro no mejoran respecto al modelo base Gemma-SEA-LION-v4-27B-IT, ya que el entrenamiento se centró exclusivamente en pares visión-texto.
- La licencia Gemma Terms of Use impone restricciones de uso comercial que deben revisarse antes de implementar el modelo en productos.
- No se proporcionan datos de rendimiento cuantitativos, lo que dificulta la evaluación objetiva frente a alternativas.

## Enlaces

- [HuggingFace - Gemma-SEA-LION-v4-27B-VL](https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-VL)
- [Documentación SEA-LION - Gemma-SEA-LION-v4-27B-VL](https://docs.sea-lion.ai/models/sea-lion-v4/gemma-sea-lion-v4-27b-vl)
- [Documentación SEA-LION - Gemma-SEA-LION-v4-27B](https://docs.sea-lion.ai/models/sea-lion-v4/gemma-sea-lion-v4-27b)
- [GitHub - aisingapore/sealion](https://github.com/aisingapore/sealion/blob/main/models/sea-lion-v4/gemma-sea-lion-v4-27B.md)
- [Leaderboard SEA-LION](https://leaderboard.sea-lion.ai/)
