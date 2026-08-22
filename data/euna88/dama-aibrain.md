# euna88/dama-aibrain

## Resumen

dama-aibrain es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por euna88 a partir del modelo base unsloth/gemma-4-e2b-it-unsloth-bnb-4bit, una variante de la familia Gemma 4 de Google. El modelo fue ajustado con las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tuning convencional.

El modelo tiene 5.123 millones de parámetros (aproximadamente 5,1 mil millones) y está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y modificación. Aunque la model card del autor es muy escueta y no detalla el conjunto de datos de entrenamiento ni las capacidades exactas, el pipeline image-text-to-text indica que el modelo puede procesar tanto imágenes como texto, posicionándolo como una opción multimodal ligera dentro del ecosistema Gemma 4.

Su relevancia actual radica en que ofrece una alternativa de tamaño moderado con soporte multimodal, entrenada con herramientas de optimización modernas (Unsloth) y compatible con el ecosistema de Hugging Face, incluyendo endpoints de inferencia y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Gemma 4, variante e2b) |
| Parametros totales | 5.123.178.051 (~5,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (entrenado con bnb-4bit); no se documentan otras |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,3 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4, concretamente en la variante denominada "e2b" proporcionada por Unsloth en formato 4-bit (bnb-4bit). Se trata de un transformer multimodal que procesa imágenes y texto (pipeline image-text-to-text). El fine-tuning se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permite un entrenamiento más rápido y eficiente en memoria, pero la model card no especifica el conjunto de datos utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

No se dispone de información sobre innovaciones técnicas específicas más allá del uso de Unsloth para la optimización del entrenamiento. El modelo se distribuye en formato safetensors y su tamaño de repo (10,3 GB) es coherente con pesos en FP16 (2 bytes por parámetro) para 5,1B parámetros.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada (image-text-to-text).
- Generación de texto conversacional: el tag "conversational" indica que está orientado a diálogos.
- Compatible con text-generation-inference y endpoints de Hugging Face.
- Capacidades multilingües: no disponibles, la model card solo declara inglés.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Modo de pensamiento (thinking mode): no documentado.

## Casos de uso

- Descripción automática de imágenes: al ser un modelo multimodal, puede generar texto descriptivo a partir de imágenes, útil en aplicaciones de accesibilidad o catalogación de contenido visual.
- Asistentes conversacionales con contexto visual: integrado en un chatbot, puede responder preguntas sobre imágenes enviadas por el usuario, por ejemplo en atención al cliente para identificar productos o problemas.
- Anotación y etiquetado de datos: puede ayudar a generar metadatos textuales para datasets de imágenes en pipelines de machine learning.
- Generación de contenido para documentación técnica: a partir de capturas de pantalla, el modelo puede generar explicaciones textuales para manuales o guías.
- Sistemas de moderación de contenido: combinado con un clasificador previo, puede generar informes textuales sobre el contenido de imágenes en plataformas sociales.
- Prototipos de investigación en visión-lenguaje: al ser ligero (5,1B) y con licencia Apache 2.0, es adecuado para experimentos académicos y pruebas de concepto sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 5,1B en FP16 se requieren aproximadamente 10-11 GB de VRAM; en cuantización 4-bit, unos 3-4 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs de 8-12 GB (RTX 3070/3080, A10) para cuantización 4-bit.
- Cabe en GPU de consumo: sí, con cuantización 4-bit cabe en GPUs de 8 GB como la RTX 3070 o RTX 4060.
- Opciones de despliegue: text-generation-inference, transformers, endpoints de Hugging Face, llama.cpp (si se convierte a GGUF, aunque no se proporciona el formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables con la misma arquitectura y tamaño de la familia Gemma 4 e2b. A modo de referencia, en el ecosistema de modelos multimodales de tamaño similar se encuentran:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dama-aibrain | 5,1B | no disponible | Apache 2.0 | safetensors |
| LLaVA-1.5 7B | 7B | 4096 | Apache 2.0 | safetensors |
| MiniCPM-V 2.6 | 8B | 4K | Apache-2.0 | safetensors |

La comparativa es orientativa; no se han encontrado datos de rendimiento para dama-aibrain.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta datos de entrenamiento, benchmarks ni capacidades específicas, lo que dificulta su evaluación y uso en producción.
- Solo soporta idioma inglés según la model card, por lo que no es adecuado para aplicaciones multilingües.
- No se especifica la longitud de contexto, por lo que es necesario probar empíricamente los límites de memoria y atención.
- No se documentan sesgos ni riesgos de alucinación; al ser un modelo pequeño y ajustado con datos no conocidos, el riesgo de alucinación en tareas de visión-lenguaje puede ser elevado.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base es de Google (Gemma 4), por lo que se deben revisar las restricciones adicionales de la licencia de los modelos base de Gemma.
- No se proporcionan formatos GGUF ni ONNX, lo que limita su despliegue en entornos como llama.cpp o móvil sin conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/euna88/dama-aibrain
- Modelo base: https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Variantes del mismo modelo: https://huggingface.co/ic4u2u/dama-aibrain, https://huggingface.co/huggsook/dama-aibrain, https://huggingface.co/WonseokJayJung/dama-aibrain, https://huggingface.co/kyoungsook70/dama-aibrain
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/spoindo/dama-aibrain
