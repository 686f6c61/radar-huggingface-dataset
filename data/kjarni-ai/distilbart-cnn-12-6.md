# kjarni-ai/distilbart-cnn-12-6

## Resumen

`kjarni-ai/distilbart-cnn-12-6` es un reempaquetado del modelo `sshleifer/distilbart-cnn-12-6`, un BART destilado para resumen abstractivo de texto periodístico en inglés. Lo publica kjarni-ai como parte del ecosistema Kjarni, una librería nativa (Rust, Python, C#, C++) que permite ejecutar modelos localmente sin runtime de Python, servidor ni servicio en la nube. El modelo es el sumarizador por defecto de Kjarni y se descarga en el primer uso.

El modelo original es un transformer encoder-decoder BART (Lewis et al., 2019) destilado a partir de BART-large y afinado sobre el dataset CNN/DailyMail. Con 305.560.664 parámetros (~305 M) y un repositorio de 1,2 GB, está pensado para generar resúmenes de unas pocas frases extrayendo y acortando oraciones del texto de entrada. No es un modelo generativo generalista: su tarea es el resumen de noticias en inglés.

La relevancia de esta ficha está en que el autor no ha modificado los pesos: cada tensor es idéntico bit a bit al `pytorch_model.bin` original. Los cambios son de empaquetado: pesos en safetensors con el embedding compartido almacenado una sola vez, un `tokenizer.json` generado a partir del `vocab.json` y `merges.txt` originales, y los parámetros de beam search movidos de `config.json` a `generation_config.json` para que los lea transformers actual. Los archivos también cargan en transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART destilado) |
| Parametros totales | 305.560.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el original BART soporta 1024 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | kjarni |
| Modelo base | sshleifer/distilbart-cnn-12-6 |
| Dataset de entrenamiento | cnn_dailymail |
| Tamano del repositorio | 1,2 GB |
| Pipeline | summarization |

## Arquitectura y entrenamiento

El modelo es un BART destilado: un transformer encoder-decoder con atención completa, derivado de BART-large mediante destilación y afinado sobre CNN/DailyMail. La nomenclatura "12-6" hace referencia a la configuración de capas del estudiante (12 capas en el encoder, 6 en el decoder), frente a las 12+12 del BART-large original. El modelo base es `sshleifer/distilbart-cnn-12-6`, publicado por Sam Shleifer dentro de la familia DistilBART.

Los detalles de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El autor indica que el modelo fue entrenado sobre artículos de CNN y Daily Mail y que genera resúmenes de unas pocas frases, en su mayoría seleccionando y acortando oraciones del texto de entrada. Una particularidad documentada es la presencia de un espacio antes de cada punto final en las salidas, heredada de los datos de entrenamiento de CNN/DailyMail y presente también en el modelo original.

La innovación de este reempaquetado es puramente de ingeniería de distribución: safetensors con el embedding compartido almacenado una sola vez (en lugar de tres veces), un `tokenizer.json` unificado y la migración de los parámetros de generación (4 beams, length penalty 2.0, entre 56 y 142 tokens, sin trigramas repetidos) a `generation_config.json`. Los valores son los del modelo original.

## Capacidades

- Resumen abstractivo de texto periodístico en inglés, con salidas de unas pocas frases.
- Extracción y condensación de oraciones del texto de entrada (comportamiento predominantemente extractivo en la práctica).
- Ejecución local sin Python, servidor ni nube mediante la librería Kjarni.
- API disponible en Python, Rust, C# y C++ (C++23), además de interfaz de línea de comandos.
- Carga compatible con transformers estándar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio) ni modo thinking.
- Multilingüismo limitado al inglés.

## Casos de uso

- Resumen de artículos de noticias en pipelines editoriales: el modelo recibe el cuerpo de una noticia en inglés y devuelve un resumen de 56 a 142 tokens con beam search de 4 haces, adecuado para generar entradillas o snippets automáticos.
- Procesamiento por lotes de boletines y comunicados de prensa: al ejecutarse localmente con Kjarni, permite resumir grandes volúmenes de texto sin coste por token ni dependencia de APIs externas.
- Integración en aplicaciones de escritorio o embebidas: la API nativa en Rust, C# y C++ permite incorporar resumen de noticias en aplicaciones sin empaquetar un runtime de Python.
- Herramientas de línea de comandos para periodistas y analistas: `kjarni summarize -q -m distilbart-cnn < article.txt` permite resumir un archivo de texto desde la terminal en un solo paso.
- Preprocesado de corpus para investigación: reducción de documentos largos en inglés a resúmenes compactos antes de indexación, búsqueda o análisis posterior.
- Generación de resúmenes en sistemas de monitorización de medios: el modelo puede condensar artículos RSS o feeds de noticias en inglés para paneles de seguimiento.
- Prototipado rápido de funcionalidades de resumen: al ser el modelo por defecto de Kjarni y cargar también en transformers, sirve como línea base antes de adoptar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 305 M parámetros en fp32, los pesos ocupan aproximadamente 1,2 GB; en fp16, unos 0,6 GB.
- GPU recomendadas: no especificadas en la información proporcionada.
- Compatibilidad con GPU de consumo: por el tamaño del modelo (305 M parámetros), es previsible que quepa en GPUs de consumo, aunque el autor no lo confirma.
- Opciones de despliegue: librería Kjarni (Python, Rust, C#, C++, CLI) y transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kjarni-ai/distilbart-cnn-12-6 | 305.560.664 | No disponible | Resumen en inglés | Apache 2.0 | Hugging Face, Kjarni, transformers |
| sshleifer/distilbart-cnn-12-6 | No disponible en la informacion proporcionada | No disponible | Resumen en inglés | No disponible en la informacion proporcionada | Hugging Face, transformers |
| facebook/bart-large-cnn | No disponible en la informacion proporcionada | No disponible | Resumen en inglés | No disponible en la informacion proporcionada | Hugging Face, transformers |

La comparativa se limita a los modelos citados en la información proporcionada. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Solo procesa inglés; no soporta otros idiomas.
- Especializado en texto periodístico estilo CNN/DailyMail; su rendimiento en otros dominios (técnico, legal, conversacional) no está documentado.
- Comportamiento predominantemente extractivo: tiende a seleccionar y acortar oraciones del original más que a parafrasear, lo que puede producir resúmenes poco fluidos.
- Genera un espacio antes de cada punto final, heredado de los datos de entrenamiento; es un artefacto esperado, no un error de inferencia.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo generativo, puede introducir contenido no presente en la fuente.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre noticias de CNN y Daily Mail, puede heredar los sesgos editoriales de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar la licencia del modelo base original antes de desplegarlo en producción.
- El modelo se distribuye principalmente para la librería Kjarni; aunque los archivos cargan en transformers, el soporte y las pruebas del autor se centran en Kjarni 0.8.2.
- No dispone de tool calling, agentes ni capacidades multimodales; no es adecuado para tareas de razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kjarni-ai/distilbart-cnn-12-6
- Modelo base: https://huggingface.co/sshleifer/distilbart-cnn-12-6
- Documentación de Kjarni: https://kjarni.ai
- Paper de BART (arXiv:2010.13002): https://arxiv.org/abs/2010.13002
- Repositorio de transformers: https://github.com/huggingface/transformers
- Dataset CNN/DailyMail: https://huggingface.co/datasets/cnn_dailymail
