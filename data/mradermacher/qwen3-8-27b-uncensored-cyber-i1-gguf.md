# mradermacher/Qwen3.8-27B-Uncensored-Cyber-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `HFCK99/Qwen3.8-27B-Uncensored-Cyber`, preparadas por el usuario mradermacher. El nombre sugiere que se trata de una variante "uncensored" de un modelo de la familia Qwen con aproximadamente 27 mil millones de parámetros, aunque el dato de parámetros totales registrado en HuggingFace (3.391.984) resulta inconsistente con esa denominación y probablemente corresponda a un archivo parcial o a un error de metadatos. No se dispone de información oficial sobre la arquitectura, el entrenamiento o las capacidades del modelo base, ya que la model card solo incluye comentarios técnicos sobre el proceso de cuantización (versión, tipo de conversión, lista de quants). El repositorio tiene cero descargas y cero likes, y su tamaño es de 0.0 GB, lo que sugiere que puede estar vacío o que los archivos no se han subido correctamente. En cualquier caso, se trata de un recurso orientado a la inferencia local mediante llama.cpp u Ollama, no a la investigación del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.391.984 (dato inconsistente con la denominacion 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base. El nombre "Qwen3.8-27B" sugiere una posible variante de la serie Qwen, pero no hay datos confirmados sobre el tipo de transformer, el uso de MoE, el numero de capas o el tamaño del contexto. El repositorio solo indica que se trata de cuantizaciones "weighted/imatrix" del modelo `HFCK99/Qwen3.8-27B-Uncensored-Cyber`, lo que implica que se ha aplicado una matriz de importancia (imatrix) para optimizar la cuantizacion. No se mencionan datos de entrenamiento, dataset, ni procesos de RLHF o DPO.

## Capacidades

No se dispone de informacion verificada sobre las capacidades del modelo. La etiqueta "uncensored" sugiere que el modelo ha sido ajustado para reducir rechazos o restricciones en las respuestas, pero no hay documentacion que detalle sus habilidades en generacion de texto, razonamiento, codigo, matematicas, tool calling o soporte multilingue. Dado que el repositorio es solo una cuantizacion GGUF, las capacidades dependen enteramente del modelo base, del cual no se aportan datos.

## Casos de uso

Al no existir informacion sobre el modelo base, no es posible enumerar casos de uso concretos con garantias. En terminos generales, un modelo GGUF de ~27B parametros podria emplearse para:

- Inferencia local en entornos con recursos limitados, usando llama.cpp u Ollama.
- Experimentacion con cuantizaciones de diferente precision para evaluar el equilibrio entre calidad y uso de memoria.
- Pruebas de generacion de texto sin restricciones en entornos de investigacion controlados.
- Integracion en aplicaciones de chat o asistentes donde se requiera un comportamiento menos censurado.
- Evaluacion comparativa de cuantizaciones con imatrix frente a cuantizaciones estandar.
- Despliegue en servidores con GPUs de gama media o alta, dependiendo de la cuantizacion elegida.

Sin embargo, estas posibilidades son especulativas y no estan respaldadas por documentacion del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su variante cuantizada.

## Requisitos de hardware

Dado que no se confirma el tamaño real del modelo (la denominacion 27B no coincide con el dato de parametros), los requisitos son estimaciones orientativas para un modelo de ~27B en formato GGUF:

- VRAM estimada: entre 14 GB (Q4_K_M) y 28 GB (Q8_0) para inferencia completa, dependiendo de la cuantizacion.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para cuantizaciones Q4 o inferiores; A100 40/80 GB o H100 para cuantizaciones de mayor precision o contexto largo.
- En consumer GPU: cabe en RTX 3090/4090 con cuantizaciones Q4 o menores, pero no en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria (variantes "uncensored" de Qwen 27B) con datos publicados que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No hay informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- La etiqueta "uncensored" implica que el modelo puede generar contenido inapropiado, ofensivo o peligroso; su uso debe restringirse a entornos de investigacion con salvaguardas.
- La licencia no esta especificada, por lo que no se garantiza su uso comercial.
- El repositorio tiene cero descargas y un tamaño de 0.0 GB, lo que sugiere que puede estar vacio o incompleto; verificar antes de descargar.
- El dato de parametros totales (3.391.984) es inconsistente con la denominacion "27B", lo que indica posibles errores en los metadatos o en la subida de archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Cyber-i1-GGUF
- Repositorio base (referenciado en la model card): https://huggingface.co/HFCK99/Qwen3.8-27B-Uncensored-Cyber
- Repositorio similar (mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF
- Repositorio GitHub con instrucciones (no oficial): https://github.com/Wassimyounes01/qwen38-uncensored
- Blog sobre ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Pagina de API (Wiro AI): https://wiro.ai/models/qwen/qwen3-8-27b-uncensored
