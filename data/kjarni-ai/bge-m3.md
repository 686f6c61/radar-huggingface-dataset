# kjarni-ai/bge-m3

## Resumen

`kjarni-ai/bge-m3` es un reempaquetado del modelo de embeddings `BAAI/bge-m3` desarrollado por el Beijing Academy of Artificial Intelligence (BAAI), publicado por el usuario kjarni-ai para su uso con la librería nativa Kjarni. No se trata de un modelo nuevo: los pesos son idénticos bit a bit a los del original, y solo cambia el formato de distribución (safetensors en lugar de `pytorch_model.bin`) y el conjunto de cabeceras incluidas (únicamente la densa). El modelo base es un transformer XLM-RoBERTa con 567.754.752 parámetros que proyecta texto en un espacio vectorial de 1024 dimensiones.

Su función es generar embeddings de texto multilingües para tareas de similitud semántica, recuperación de información y búsqueda vectorial. Admite entradas de hasta 8192 tokens y textos en más de 100 idiomas, lo que permite, por ejemplo, que una consulta en inglés recupere un documento relevante en alemán o español dentro del mismo espacio de representación.

La relevancia de este reempaquetado es operativa: elimina la dependencia de un runtime Python, un servidor o un servicio en la nube, y expone el modelo a través de una única librería nativa con bindings para Python, Rust, C#, C++ y línea de comandos. El repositorio ocupa 2,3 GB y se descarga en el primer uso. Está liberado bajo licencia MIT, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en el formato original) |
| Idiomas soportados | mas de 100 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1024 |
| Tamano del repositorio | 2,3 GB |
| Libreria de despliegue | kjarni (probado con Kjarni 0.8.2) |
| Pipeline | sentence-similarity |
| Modelo base | BAAI/bge-m3 |

## Arquitectura y entrenamiento

El modelo es un encoder XLM-RoBERTa que genera representaciones densas de 1024 dimensiones. Para la similitud densa, toma la salida del primer token y la normaliza, replicando el comportamiento del modelo original. El autor del reempaquetado verifica que las similitudes calculadas con Kjarni coinciden con las de `transformers` ejecutando el modelo original hasta cuatro decimales en los ejemplos de la model card.

Este repositorio no incluye las cabeceras dispersa (`sparse_linear.pt`) ni multi-vector (`colbert_linear.pt`) del modelo original, ni su exportación a ONNX ni las imágenes. Por tanto, solo está disponible el modo de embedding denso; las funcionalidades de recuperación dispersa y multi-vector de BGE-M3 no están presentes en este paquete. El tokenizador y los ficheros de configuración son los originales, sin modificaciones.

Los detalles de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO o destilación) corresponden al modelo original BAAI/bge-m3 y no se documentan en esta model card. El paper asociado (arXiv:2402.03216) describe el método de destilación auto-conocida para embeddings multilingües, multifuncionales y multigranulares, pero esta ficha no dispone de los datos concretos de entrenamiento en la información proporcionada.

## Capacidades

- Generación de embeddings de texto densos de 1024 dimensiones para similitud semántica y búsqueda vectorial.
- Soporte multilingüe: más de 100 idiomas en un espacio compartido, lo que permite recuperación cross-lingual.
- Entradas de hasta 8192 tokens, adecuado para documentos largos y fragmentos extensos.
- Cálculo de similitud por coseno entre consultas y textos, expuesto directamente en la API de Kjarni.
- Bindings nativos para Python, Rust, C#, C++ y una interfaz de línea de comandos.
- Ejecución local sin runtime Python, servidor ni servicio en la nube.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica multilingüe: indexar un corpus en varios idiomas y permitir consultas en cualquiera de ellos, aprovechando el espacio de 1024 dimensiones compartido y la ventana de 8192 tokens para fragmentos largos.
- Recuperación aumentada por generación (RAG): generar embeddings de fragmentos de documentación y de la consulta del usuario para recuperar los pasajes relevantes antes de pasarlos a un LLM, con la ventaja de ejecutarse localmente sin coste por token.
- Deduplicación y agrupación de documentos: calcular similitudes por coseno entre textos para detectar duplicados o agrupar contenido semánticamente equivalente en pipelines de limpieza de datos.
- Atención al cliente y bases de conocimiento: emparejar preguntas de usuarios con respuestas de una FAQ, como demuestra la model card con la consulta en inglés que encuentra la respuesta en alemán (0,945) y en español (0,939).
- Moderación y clasificación de contenido: usar la similitud con textos de referencia para etiquetar o filtrar contenido en múltiples idiomas sin entrenar un clasificador específico.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para calcular afinidad semántica.
- Integración en aplicaciones de escritorio o embebidas: al no requerir Python ni servidor, puede desplegarse en binarios nativos Rust, C# o C++ dentro de aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este reempaquetado remite a la model card original de BAAI/bge-m3 para los benchmarks y la evaluación. Los únicos datos numéricos aportados son ejemplos de similitud: 0,945 entre "How do I reset my password?" y "Wie setze ich mein Passwort zurück?", 0,939 con "¿Cómo restablezco mi contraseña?" y 0,493 con "What time does the shop open?".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 567,7 millones de parámetros en safetensors, el peso del modelo ronda los 2,3 GB en el repositorio; en FP32 serían aproximadamente 2,27 GB y en FP16 unos 1,14 GB, aunque el repositorio no documenta cuantizaciones ni precisiones de ejecución.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; por tamaño, el modelo es ligero, pero Kjarni no detalla requisitos de VRAM ni backend de cómputo.
- Opciones de despliegue: librería Kjarni (Python, Rust, C#, C++, CLI) y descarga automática en el primer uso. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| kjarni-ai/bge-m3 | 567,7 M | 8192 | 1024 | MIT | safetensors | Solo embedding denso; empaquetado nativo Kjarni |
| BAAI/bge-m3 (original) | 567,7 M | 8192 | 1024 | MIT | pytorch_model.bin, ONNX | Incluye cabeceras densa, dispersa y multi-vector |
| Otros modelos de embeddings | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La comparación directa más relevante es con el modelo original: comparten pesos y licencia, pero el reempaquetado omite las cabeceras dispersa y multi-vector y la exportación ONNX, y sustituye el formato de pesos por safetensors. Para benchmarks frente a otros modelos de embeddings, debe consultarse la model card de BAAI/bge-m3.

## Limitaciones y advertencias

- Solo implementa el modo de embedding denso: no están disponibles la recuperación dispersa ni la multi-vector (ColBERT) del modelo original.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluación de robustez en esta model card; deben consultarse en la documentación del modelo original.
- Aunque declara soporte de más de 100 idiomas, no se especifica la lista completa ni el rendimiento por idioma.
- El modelo es un encoder de embeddings: no genera texto, no razona y no soporta tool calling; no debe emplearse como LLM.
- El repositorio tiene solo 5 descargas y 0 likes, y la librería Kjarni está probada únicamente con la versión 0.8.2; el soporte y mantenimiento del empaquetado no están garantizados.
- El autor declara no estar afiliado ni respaldado por BAAI; la responsabilidad sobre el modelo subyacente recae en BAAI.
- Aunque la licencia es MIT, conviene verificar los términos del modelo original antes de un uso comercial a gran escala.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kjarni-ai/bge-m3
- Modelo original: https://huggingface.co/BAAI/bge-m3
- Documentación de Kjarni: https://kjarni.ai
- Instalador de Kjarni: https://kjarni.ai/install.sh
- Paper (arXiv:2402.03216): https://arxiv.org/abs/2402.03216
- Licencia MIT: https://opensource.org/licenses/MIT
- Repositorio de transformers: https://github.com/huggingface/transformers
