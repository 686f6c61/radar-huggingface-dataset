# huggingface12341/zsl-h22

## Resumen

zsl-h22 es un modelo de extraccion de caracteristicas (feature-extraction) publicado en Hugging Face por el usuario huggingface12341. Se trata de un merge de tres modelos base: joamCriff123/zils-lite-l1125a, joamCriff123/zils-lite-l1123q y run-saina/saina-helm-3-0.8b. El modelo cuenta con 852.985.920 parametros (aproximadamente 853 millones) almacenados en formato safetensors, con un repositorio de 1,7 GB. La arquitectura declarada en los tags es qwen3_5, lo que sugiere una variante de la familia Qwen 3.5, aunque no se dispone de documentacion tecnica que lo confirme.

El modelo esta etiquetado como "decision-model" y "zils", terminos que no corresponden a categorias estandar ampliamente documentadas, por lo que su proposito exacto no puede determinarse a partir de la informacion disponible. La pipeline declarada es feature-extraction, lo que indica que su uso previsto es la generacion de embeddings o representaciones vectoriales a partir de texto, y no la generacion autoregresiva de texto. La licencia es Apache 2.0, lo que permite uso comercial, pero el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: registra 0 descargas y 0 likes, fue creado el 26 de noviembre de 2026 y no cuenta con documentacion publica, benchmarks ni ejemplos de uso. Se trata, por tanto, de un artefacto experimental o de un merge de proposito no documentado, y cualquier evaluacion practica exigiria acceso al repositorio y pruebas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun tags; no confirmado en documentacion) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es el tag `qwen3_5`, que apunta a una variante de la familia Qwen 3.5, y el tag `custom_code`, que indica que el modelo requiere codigo personalizado para cargarse (habitualmente mediante `trust_remote_code=True`). El modelo es un merge de tres checkpoints: joamCriff123/zils-lite-l1125a, joamCriff123/zils-lite-l1123q y run-saina/saina-helm-3-0.8b. No se especifica la tecnica de merge empleada (por ejemplo, SLERP, TIES, DARE o linear), ni la proporcion de cada modelo base.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Dado que la pipeline es feature-extraction, es probable que el modelo se utilice para producir embeddings, pero no hay confirmacion de la dimension del vector de salida ni de la capa de pooling recomendada.

## Capacidades

- Extraccion de caracteristicas (feature-extraction): generacion de embeddings o representaciones vectoriales a partir de texto, segun la pipeline declarada.
- Clasificacion como "decision-model": el tag sugiere un uso orientado a toma de decisiones, aunque no se documenta el mecanismo ni el formato de salida.
- Carga mediante transformers con `custom_code`: requiere confiar en el codigo remoto del repositorio.
- Capacidades de generacion de texto, razonamiento, codigo, matematicas o vision: no disponibles o no documentadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Modos especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de embeddings para busqueda semantica: el modelo puede emplearse para vectorizar documentos y consultas en un motor de recuperacion, dado que su pipeline declarada es feature-extraction. Requiere validar la dimension de salida y la calidad de los embeddings con un conjunto propio.
- Clustering y deduplicacion de textos: los vectores producidos pueden alimentar algoritmos de agrupamiento (k-means, HDBSCAN) para organizar grandes volumenes de documentos o detectar duplicados.
- Sistemas de recomendacion basados en contenido: los embeddings de items (articulos, productos, publicaciones) permiten calcular similitud coseno y construir recomendadores sin entrenamiento adicional.
- Filtrado y moderacion de contenido: si el tag "decision-model" implica clasificacion, el modelo podria usarse como extractor de caracteristicas para un clasificador ligero entrenado sobre sus embeddings.
- Prototipado de pipelines RAG: al ser un modelo de ~853 millones de parametros, puede desplegarse en una unica GPU consumer para experimentar con recuperacion aumentada antes de migrar a un modelo de embeddings mayor.
- Investigacion sobre merges de modelos: el checkpoint sirve como caso de estudio para analizar el efecto de combinar tres modelos base y comparar la calidad de los embeddings resultantes frente a los originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos (852.985.920 parametros x 2 bytes), mas overhead de activaciones y del codigo personalizado; en la practica, entre 2 y 4 GB.
- VRAM estimada en int8: alrededor de 0,9 GB para pesos; en int4, alrededor de 0,5 GB, aunque no se confirma que existan cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 aportan mayor throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (con `trust_remote_code=True` por el tag `custom_code`); no se confirma soporte en vLLM, llama.cpp, Ollama o TGI, y al ser un modelo de feature-extraction el soporte en servidores de generacion es improbable.
- Latencia y throughput: no disponibles; dependeran del hardware, del tamano de lote y de la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de informacion sobre benchmarks ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, se puede comparar con los propios modelos base del merge:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zsl-h22 | 852.985.920 | no disponible | Apache 2.0 | Gated en Hugging Face |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | no disponible | no disponible |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | no disponible |
| run-saina/saina-helm-3-0.8b | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con detalles de entrenamiento, datos, evaluacion ni uso previsto, lo que impide validar su calidad de forma objetiva.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a cualquier evaluacion.
- Requiere `trust_remote_code=True`: el tag `custom_code` implica ejecutar codigo del autor del repositorio, con el riesgo de seguridad asociado; conviene auditar el codigo antes de usarlo en produccion.
- Idiomas no declarados: se desconoce que lenguas cubre y con que calidad, por lo que no se recomienda asumir un buen rendimiento en castellano sin pruebas.
- Riesgo de sesgos y alucinacion: no evaluable sin documentacion ni pruebas; al ser un merge de modelos no verificados, los sesgos de los modelos base pueden amplificarse o combinarse de forma impredecible.
- Contexto desconocido: no se puede confirmar la longitud maxima de secuencia, lo que limita el diseno de aplicaciones con documentos largos.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la ficha, sin senales de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero esta condicion no exime de verificar las licencias de los modelos base del merge, que no estan documentadas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-h22
- Modelo base 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Modelo base 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Modelo base 3: https://huggingface.co/run-saina/saina-helm-3-0.8b
