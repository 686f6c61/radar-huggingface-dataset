# npario/gemma-4-26B-A4B-it-QAT-MLX-4bit

## Resumen

`npario/gemma-4-26B-A4B-it-QAT-MLX-4bit` es una version cuantizada a 4 bits del modelo `google/gemma-4-26B-A4B-it-QAT`, publicada por el usuario npario y generada por el equipo de LM Studio con la libreria `mlx-vlm`. Se trata de una conversion especifica para Apple Silicon mediante MLX, el framework de Apple Machine Learning Research, y no de un modelo entrenado desde cero: el trabajo de este repositorio es exclusivamente la cuantizacion y el empaquetado de los pesos.

El modelo subyacente pertenece a la familia Gemma 4 de Google y sigue una nomenclatura MoE (mixture of experts): el sufijo `26B-A4B` indica aproximadamente 26 000 millones de parametros totales y unos 4 000 millones de parametros activos por token, segun la convencion habitual de nomenclatura. La etiqueta `image-text-to-text` y la pipeline declarada confirman que se trata de un modelo multimodal que acepta imagenes y texto como entrada. El repositorio ocupa 15,6 GB y el recuento real de parametros en los ficheros safetensors es de 25 805 936 206.

Su relevancia es doble. Por un lado, ofrece un punto de entrada para ejecutar un modelo multimodal de gran tamano en hardware de consumo Apple Silicon gracias a la cuantizacion de 4 bits. Por otro, al derivar de una version QAT (quantization-aware training) de Google, los pesos de 4 bits deberian conservar mejor la calidad frente a una cuantizacion post-entrenamiento, aunque no se han publicado metricas que lo confirmen. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal derivada de Gemma 4; detalles concretos de capas y atencion no disponibles |
| Parametros totales | 25 805 936 206 |
| Parametros activos | Aproximadamente 4 000 millones (inferido de la nomenclatura `A4B`; no confirmado explicitamente en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otros niveles en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace adicional a la licencia de Gemma 4 de Google) |
| Formato de pesos | Safetensors en cuantizacion MLX de 4 bits |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it-QAT` es una arquitectura MoE multimodal de la familia Gemma 4, segun se deduce de su identificador y de la etiqueta `image-text-to-text`. La nomenclatura `A4B` apunta a que solo una fraccion reducida de los parametros (del orden de 4 000 millones) se activa por token, lo que reduce el coste de inferencia respecto a un modelo denso de 26 000 millones de parametros. No se dispone de informacion detallada sobre el numero de expertos, la estrategia de enrutamiento, el tipo de atencion ni la composicion del dataset de entrenamiento.

El sufijo `QAT` indica que el modelo original fue sometido a entrenamiento consciente de cuantizacion (quantization-aware training) antes de este proceso. Sobre esa base, el equipo de LM Studio aplico una cuantizacion de 4 bits con `mlx-vlm` para adaptarla a Apple Silicon. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, si hubo fases de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto de tipo conversacional, con la etiqueta `conversational` en el repositorio y plantilla de chat propia de un modelo `-it` (instruction-tuned).
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`): entrada de imagenes junto a instrucciones en lenguaje natural.
- El nombre del repositorio incluye `endpoints_compatible`, lo que sugiere compatibilidad con el esquema de endpoints habitual de HuggingFace para inferencia.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes, soporte multilingue o modos especiales de pensamiento: no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes en local: dado que el modelo acepta entradas de imagen y texto, puede emplearse para generar descripciones, extraer informacion de capturas o analizar documentos escaneados directamente en un Mac con Apple Silicon, sin enviar datos a servicios externos.
- Asistente conversacional de escritorio: la etiqueta `conversational` y su naturaleza instruction-tuned lo hacen adecuado para integrarse en aplicaciones de chat local con LM Studio u otro runtime compatible con MLX.
- Prototipado de pipelines multimodales: util para desarrolladores que quieran validar flujos de vision-lenguaje antes de invertir en hardware de datacenter, aprovechando el bajo coste de ejecucion en equipo de consumo.
- Procesamiento de documentos con contenido visual: transcripcion y resumen de informes con graficos, tablas o diagramas, siempre que la longitud del documento quepa en la ventana de contexto (no documentada, por lo que requiere verificacion previa).
- Investigacion sobre cuantizacion QAT: el repositorio permite comparar el comportamiento de una cuantizacion de 4 bits derivada de un modelo entrenado con QAT frente a cuantizaciones post-entrenamiento equivalentes.
- Evaluacion de MLX en produccion ligera: sirve como banco de pruebas para medir latencia y consumo de memoria en Apple Silicon con un modelo de 26 000 millones de parametros totales.
- Uso educativo y demostraciones offline: al no requerir conexion ni GPU dedicada, es apropiado para talleres y entornos con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones numericas con el modelo base o con cuantizaciones alternativas.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 15,6 GB, por lo que se necesita al menos ese espacio para los pesos, mas overhead de runtime (KV cache, buffers y estado del modelo). Se recomienda un minimo de 24 GB de memoria unificada y, preferiblemente, 32 GB o mas.
- Hardware objetivo: al estar en formato MLX de 4 bits, el modelo esta optimizado para Apple Silicon (familias M1, M2, M3 y M4, especialmente las variantes Pro, Max y Ultra con memoria suficiente).
- GPU NVIDIA o AMD: este repositorio concreto no es directamente compatible con CUDA o ROCm, ya que el formato es MLX. Para esas plataformas habria que usar el modelo base o una cuantizacion alternativa.
- Opciones de despliegue: MLX (via `mlx-vlm`), LM Studio y cualquier runtime que soporte pesos MLX. No aplican vLLM, llama.cpp, Ollama o TGI para este repositorio especifico, salvo conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npario/gemma-4-26B-A4B-it-QAT-MLX-4bit | 25 805 936 206 | No disponible | 4-bit MLX | Apache 2.0 | HuggingFace (0 descargas) |
| google/gemma-4-26B-A4B-it-QAT (base) | No disponible en la informacion proporcionada | No disponible | Original QAT | Apache 2.0 con licencia Gemma 4 | HuggingFace |
| Alternativas equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo se dispone de datos del modelo base, del que este repositorio es una conversion a 4 bits para MLX. No se han proporcionado otros modelos comparables de la misma categoria, por lo que no es posible establecer una comparativa numerica con alternativas.

## Limitaciones y advertencias

- Solo se dispone de informacion parcial: no hay datos sobre sesgos, tasas de alucinacion, idiomas soportados ni longitud de contexto. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos, agravado por la ausencia de benchmarks publicados para esta cuantizacion concreta.
- La cuantizacion de 4 bits puede degradar la calidad respecto a los pesos originales, aunque al derivar de un modelo entrenado con QAT la perdida podria ser menor. No hay mediciones que lo confirmen.
- Compatibilidad restringida: el formato MLX limita el uso a Apple Silicon. No es desplegable directamente en GPU NVIDIA, AMD ni en entornos de servidor Linux convencionales sin conversion.
- La licencia declarada es Apache 2.0, pero el modelo incluye un enlace a la licencia especifica de Gemma 4 de Google. Es necesario revisar ambas antes de un uso comercial, ya que las licencias de la familia Gemma suelen incorporar condiciones de uso aceptable adicionales.
- Repositorio sin adopcion registrada (0 descargas, 0 likes), sin validacion de la comunidad y creado por un autor no oficial de Google. No debe tratarse como una publicacion respaldada por el fabricante del modelo base.
- La model card incluye un descargo de responsabilidad de LM Studio que exime a la plataforma de cualquier garantia sobre el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/npario/gemma-4-26B-A4B-it-QAT-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-QAT
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
- LM Studio: https://lmstudio.ai
- Discord de LM Studio (programa de modelos de la comunidad): https://discord.gg/aPQfnNkxGC
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- MLX (Apple Machine Learning Research): https://github.com/ml-explore/mlx
