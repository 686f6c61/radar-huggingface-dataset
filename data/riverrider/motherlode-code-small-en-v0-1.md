# RiverRider/motherlode-code-small-en-v0.1

## Resumen

motherlode-code-small-en-v0.1 es un modelo de embeddings de 33,4 millones de parámetros desarrollado por el usuario RiverRider, especializado en recuperación de código y texto en inglés. Parte de BAAI/bge-small-en-v1.5, del que hereda arquitectura BERT, tokenizador y salida CLS de 384 dimensiones, por lo que puede sustituir a bge-small en los pipelines donde ya se usa sin cambios de integración.

Se trata de un model soup: la media parámetro a parámetro de dos ajustes finos de bge-small, uno entrenado para localizar el archivo que una issue de GitHub necesita modificar y otro entrenado para reproducir la geometría de gte-modernbert-base, un modelo 4,5 veces mayor. El objetivo declarado es mejorar la recuperación en tareas de code search y localización de archivos (estilo SWE-bench) manteniendo el coste de inferencia de un encoder pequeño.

Es relevante ahora porque publica evidencia por instancia y comparaciones pareadas frente a bge-small-en-v1.5 en SWE-bench Verified y CoIR, con mejoras estadísticamente significativas en la mayoría de configuraciones, y porque distribuye pesos en safetensors, GGUF f16 y ONNX para Python, llama.cpp y transformers.js. La licencia BUSL-1.1 es el principal factor que hay que evaluar antes de darle un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), heredada de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.360.000 (33,4 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens; transformers.js trunca por encima de 512 tras añadir los tokens especiales; en llama.cpp se validó a 256 tokens conservando [SEP]; el motor Black Window corta en 510 y añade [CLS] y [SEP] por su cuenta |
| Tipos de cuantizacion | f16 (GGUF), fp32 (transformers.js) y filas int4 (usadas en la réplica del motor Black Window); no se documentan otros |
| Idiomas soportados | inglés (en) |
| Licencia | BUSL-1.1 (Business Source License 1.1), declarada como "other" con license_name busl-1.1 |
| Formato de pesos | safetensors, GGUF (f16) y ONNX |
| Dimension de embedding | 384 (salida CLS) |
| Pooling | CLS, con normalizacion de la fila CLS |
| Modelo base | BAAI/bge-small-en-v1.5 (relacion: finetune) |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de bge-small-en-v1.5: un encoder transformer tipo BERT con tokenizador idéntico y una salida CLS de 384 dimensiones. El modelo no introduce cabezas nuevas ni cambia la dimensionalidad, de modo que es intercambiable en cualquier punto donde ya se ejecute bge-small. El entrenamiento no es un ajuste fino convencional, sino un model soup: cada peso final es la media parámetro a parámetro de dos ajustes finos independientes del mismo modelo base. El primero se entrenó para encontrar el código que una issue de GitHub necesita cambiar; el segundo se entrenó para reproducir la geometría de embeddings de gte-modernbert-base, un modelo 4,5 veces mayor. No se utiliza prompt de consulta ni de pasaje, igual que en las mediciones publicadas con bge-small.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de código frente a texto, ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la receta de destilación usada para reproducir la geometría de gte-modernbert-base, más allá de que es uno de los dos objetivos de ajuste. Como elementos técnicos destacables, el autor publica tres medias de 384 flotantes bajo el directorio centring/ (una para código, ajustada sobre 64.000 pasajes de 86 repositorios Python; una para captions, ajustada sobre 20.000 captions de COCO train2017; y una "enviada", promedio de las dos anteriores y de una media de prosa calculada sobre los primeros 20.000 párrafos de al menos 60 caracteres del split de entrenamiento de wikitext-103), pensadas para restar a ambos lados antes de calcular un coseno cuando importa la magnitud de la puntuación.

## Capacidades

- Generación de embeddings de texto y de código en inglés, con pooling CLS y normalización.
- Búsqueda semántica y recuperación de código (code search, code retrieval) sobre repositorios.
- Localización del archivo relevante para una issue: ranking de los ficheros de un repositorio dada la descripción de un problema.
- Similitud entre frases y entre pasajes (pipeline sentence-similarity), sin prompt de consulta ni de pasaje.
- Indexación y comparación de descripciones de imágenes (captions): se distribuye una media de centrado específica para COCO.
- Ejecución en navegador mediante transformers.js 3.7.1 con dtype fp32, y en llama.cpp con GGUF f16 y pooling CLS.
- Compatibilidad declarada con text-embeddings-inference y con endpoints (etiquetas endpoints_compatible y region:us).
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no ejecuta razonamiento multi-paso ni agentes, y no tiene modo thinking. Tampoco cubre visión ni audio.

## Casos de uso

- Localización del archivo a modificar en un repositorio: dada la descripción de una issue, se indexan los ficheros del repositorio y se ordenan por similitud para que el desarrollador o un agente de código abra directamente el candidato correcto. Es el escenario medido en SWE-bench Verified, con 178 aciertos en recall@1 sobre 411 instancias frente a los 145 de bge-small-en-v1.5.
- Búsqueda semántica de código en monorepos grandes: indexar funciones y módulos y consultar en lenguaje natural ("dónde se lee el límite de reintentos de la configuración") sin depender de coincidencia léxica exacta, útil cuando los nombres de símbolos no coinciden con la terminología de la consulta.
- Recuperación aumentada sobre documentación técnica e issues: construir el índice de recuperación de un asistente interno con documentación, incidencias cerradas y notas de diseño en inglés, aprovechando la ventana de 512 tokens por pasaje.
- Enrutado y triaje de issues: calcular el embedding del título y del cuerpo de cada incidencia entrante y asignarla al equipo o al componente cuya descripción y código quedan más próximos, reduciendo el trabajo manual de clasificación.
- Deduplicación y agrupación de código: agrupar fragmentos con embeddings próximos para detectar copias, variantes casi idénticas entre repositorios o candidatos a refactorización conjunta.
- Detección de similitud entre descripciones de imágenes: con la media de centrado de COCO, comparar captions y medir su parecido, por ejemplo para auditar datasets de anotación.
- Inferencia en el cliente o en el borde: con transformers.js y pesos fp32 el modelo corre en un navegador, lo que permite indexar y consultar colecciones locales sin enviar el contenido a un servidor.
- Prefiltrado barato en pipelines de generación de código: usar el encoder para reducir de miles a decenas los archivos candidatos antes de que un modelo generativo, mucho más caro, los lea completos.

## Benchmarks y rendimiento

Resultados publicados por el autor, emparejados por ítem. Los tests de signos son exactos y bilaterales, calculados sobre los ítems que solo un modelo acierta. No se han publicado resultados de benchmarks adicionales en la información disponible.

Localización del archivo, SWE-bench Verified, recall@1 (acierto = el archivo correcto queda primero):

| Configuracion | Poblacion | Este modelo | bge-small-en-v1.5 | Comparacion pareada |
|---|---:|---:|---:|---|
| Pipeline base de gate 1, float32, 512 tokens | 411 instancias (las que deja el control de contaminación) | 178 | 145 | 61 victorias, 28 derrotas, +0,0803, sign p 0,00061 |
| La misma | 500 instancias | 219 | 181 | 73 victorias, 35 derrotas, sign p 0,00033 |
| Réplica del camino publicado del motor Black Window, filas int4, cada modelo con la media que el motor le asigna | 411 | 230 | 192 | 67 victorias, 29 derrotas, +0,0925, sign p 0,00013 |
| La misma | 500 | 278 | 230 | 82 victorias, 34 derrotas, sign p 0,00001 |
| El mismo camino, cada modelo con su propia media de código | 411 | 221 | 180 | 70 victorias, 29 derrotas, +0,0998, sign p 0,00005 |
| Motor en 8234be7, cuyo bonus léxico penaliza a ambos modelos, cada uno con su media enviada | 411 | 207 | 158 | 69 victorias, 20 derrotas, +0,1192, sign p inferior a 0,00001 |

Code search, CoIR nDCG@10 (sonda sobre 144.461 consultas):

| Metrica | Este modelo | bge-small-en-v1.5 |
|---|---:|---:|
| CoIR nDCG@10 | 0,5758 | 0,4673 |

Efecto del centrado (coseno medio por pares, sin centrar y con cada media):

| Corpus | Sin centrar | Con la media enviada |
|---|---:|---:|
| 20.000 pasajes de código | 0,2192 (bge-small: 0,6233) | 0,1314 |
| Resúmenes de scifact | no disponible | 0,2462 |
| Captions de COCO | no disponible | 0,1345 |
| Párrafos de wikitext | no disponible | 0,0565 |

Una media ajustada en un dominio corrige de menos en otro: sobre 5.000 captions de COCO, el coseno medio por pares es 0,2865 tras aplicar la media de código y 0,0286 tras aplicar la media de captions. Para ranking, el centrado no aporta ganancia según el autor: en SWE-bench dentro del motor con la media de código, ordenar por coseno bruto en lugar de por la puntuación centrada da 274 frente a 269 de 500 (24 victorias, 19 derrotas, sign p 0,54); en scifact, el centrado con la media enviada cuesta 0,0057 de nDCG@10 (0,7150 en bruto, 0,7093 centrado).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de 33,36 M de parámetros, no publicado por el autor): en torno a 133 MB en fp32, 67 MB en f16 y 17 MB en int4, más el overhead del entorno de ejecución.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, no requiere A100 ni H100; cualquier GPU con al menos 1 GB de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, y también en CPU. El repositorio completo ocupa 0,4 GB.
- Opciones de despliegue: sentence-transformers (versiones 5.1.0 y 6.0.1 probadas), transformers.js 3.7.1 con dtype fp32 y pooling CLS, llama.cpp con el GGUF f16 (convertido con el conversor del commit 465e49b9c, con pooling CLS y normalizado), ONNX, y compatibilidad declarada con text-embeddings-inference y endpoints. El soporte de vLLM u Ollama no está confirmado en la información disponible.
- Fidelidad numérica verificada: en llama.cpp a 256 tokens con [SEP] conservado, el coseno mínimo frente a PyTorch float32 es 0,9999957 sobre 2.000 textos; en transformers.js 3.7.1, sobre 13 de 200 textos largos, el coseno mínimo frente a PyTorch es 0,99640 (0,99715 en bge-small con la misma librería).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | SWE-bench Verified recall@1 (411) | CoIR nDCG@10 | Licencia | Idiomas |
|---|---:|---:|---:|---:|---:|---|---|
| motherlode-code-small-en-v0.1 | 33,4 M | 384 | 512 | 178 | 0,5758 | BUSL-1.1 | inglés |
| BAAI/bge-small-en-v1.5 | idéntico (es el modelo base; la media parámetro a parámetro exige las mismas formas) | 384 | 512 | 145 | 0,4673 | no disponible | inglés |
| gte-modernbert-base | aproximadamente 4,5 veces mayor según la model card | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| CompendiumLabs/bge-small-en-v1.5-gguf | no disponible | 384 (heredada de bge-small) | no disponible | no disponible | no disponible | no disponible | inglés |

La comparación con gte-modernbert-base solo está documentada como objetivo de destilación geométrica, no como referencia de rendimiento. Con CompendiumLabs/bge-small-en-v1.5-gguf la única comparación publicada es de fidelidad numérica: 0,9999966 de coseno mínimo frente a PyTorch float32, frente a 0,9999957 del GGUF f16 de este modelo.

## Limitaciones y advertencias

- Licencia BUSL-1.1: no es una licencia de código abierto permisiva. La model card enlaza un fichero LICENSE y no detalla los términos, la fecha de cambio ni los límites de uso en producción, por lo que hay que leer el texto completo de la licencia antes de cualquier uso comercial.
- Idioma único: solo inglés. No hay soporte multilingüe ni evaluación en otros idiomas.
- Ventana de 512 tokens por pasaje. transformers.js 3.7.1 trunca el texto después de añadir los tokens especiales y pierde el [SEP] final, lo que afecta a 13 de 200 textos de prueba y baja el coseno mínimo frente a PyTorch a 0,99640. Para reproducir PyTorch hay que tokenizar sin tokens especiales, cortar en 510, añadir [CLS] y [SEP] y normalizar la fila CLS.
- El centrado es delicado: una media ajustada en un dominio corrige de menos en otro (0,2865 frente a 0,0286 sobre captions de COCO según la media usada) y, para ranking, el centrado no mejora los resultados en las pruebas publicadas (274 frente a 269 de 500 en SWE-bench, sign p 0,54; y una pérdida de 0,0057 de nDCG@10 en scifact).
- No es un modelo generativo. No genera texto ni código, no hace tool calling, no soporta agentes ni razonamiento multi-paso. Cualquier expectativa en ese sentido es incorrecta.
- Riesgo de falsos positivos en recuperación: como todo modelo de embeddings, puede devolver pasajes semánticamente próximos pero irrelevantes. No hay estimaciones publicadas de tasa de error fuera de las tareas medidas.
- Sesgos: no hay información disponible sobre evaluación de sesgos ni sobre la composición del corpus de entrenamiento, que no se documenta.
- Reproducibilidad: los resultados de SWE-bench dependen de un motor concreto (Black Window) y de commits específicos (94a8e7b, 8234be7, 465e49b9c en llama.cpp). Fuera de ese pipeline los números pueden no replicarse.
- Validación externa: el modelo tenía 0 descargas y 0 "me gusta" en el momento del registro y todos los resultados proceden de mediciones del propio autor, aunque acompañadas de un conjunto de evidencia por instancia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RiverRider/motherlode-code-small-en-v0.1
- Conjunto de evidencia por instancia: https://huggingface.co/datasets/RiverRider/motherlode-code-small-en-v0.1-evidence
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Referencia arXiv incluida en las etiquetas del modelo: https://arxiv.org/abs/2407.02883
- Autor en HuggingFace: https://huggingface.co/RiverRider
- Referencia de fidelidad GGUF citada en la model card: https://huggingface.co/CompendiumLabs/bge-small-en-v1.5-gguf
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a otros proyectos del mismo autor (zooL4nD3r-v0.1), a agentes de código no relacionados (smallcode, MiMo Code) y a contenido sin relación con el modelo.
