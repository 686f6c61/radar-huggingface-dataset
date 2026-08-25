# mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-GGUF

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-GGUF es la version cuantizada en GGUF del modelo homonimo creado por DavidAU y publicado originalmente por gorbatjovy. Este modelo de 27.320 millones de parametros parte de la familia Qwen3.8 y aplica la metodologia de entrenamiento COLD FUSION, que combina la tecnica interna GAIN con la infraestructura de Unsloth, para reducir el numero de tokens de pensamiento entre un 50 % y un 90 % respecto a los modelos Qwen estandar, manteniendo segun sus autores el 99 % del rendimiento en precision completa tanto en cuantizacion de 8 bits como de 4 bits.

La variante "heretic" es una version abliterada y sin censura del modelo base, es decir, se han eliminado los mecanismos de rechazo y los sesgos de seguridad que limitan las respuestas en temas sensibles. El repositorio de mradermacher proporciona unicamente los pesos en formato GGUF, incluyendo dos ficheros de proyeccion multimodal (mmproj) para capacidades de vision, ademas de las cuantizaciones Q2_K y Q4_K_S. El modelo hereda la arquitectura hibrida de Qwen3.8, con atencion completa en 16 de las 64 capas y atencion lineal en las restantes 48, lo que reduce el coste computacional en contextos largos.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y los idiomas soportados son ingles y chino. La relevancia actual del modelo radica en su eficiencia de razonamiento: al generar menos tokens de pensamiento, reduce la latencia y el coste por peticion, manteniendo un nivel de calidad comparable al de modelos densos de 27B de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (16 capas de atencion completa + 48 capas de atencion lineal) |
| Parametros totales | 27.320.224.856 (27.3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q4_K_S, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer denso con backbone de atencion hibrida: solo 16 de las 64 capas utilizan atencion completa (con un intervalo de atencion completa de 4), mientras que las otras 48 emplean atencion lineal con un estado recurrente constante. Esta mezcla reduce la complejidad computacional en secuencias largas en comparacion con una atencion full completa, manteniendo la calidad en tareas que requieren razonamiento global.

El entrenamiento aplica la metodologia COLD FUSION, desarrollada por DavidAU, que combina la tecnica GAIN con el stack de entrenamiento de Unsloth. Segun la documentacion publica, el proceso reduce los tokens de pensamiento (thinking tokens) a entre 1/10 y 1/2 de los generados por los modelos Qwen estandar, sin sacrificar rendimiento: se afirma que mantiene el 99 % del rendimiento en BF16 cuando se cuantiza a 8 bits o 4 bits. Ademas, el modelo incluye la capacidad de multi-token prediction (MTP), etiquetada en los tags del repositorio, y ha sido sometido a un proceso de abliteration que elimina los rechazos de seguridad del modelo base, resultando en una variante "uncensored".

No se especifican en la informacion disponible los datos concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Se sabe que el modelo base es gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic, y que el repositorio de mradermacher es una cuantizacion estatica de ese modelo.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo reduce el numero de tokens de pensamiento sin perder precision, lo que lo hace adecuado para tareas de razonamiento que requieren cadenas logicas.
- Razonamiento matematico y de codigo: como parte de la familia Qwen3.8, hereda capacidades de generacion de codigo y resolucion de problemas matematicos, aunque no se publican benchmarks especificos en la informacion proporcionada.
- Capacidades multimodales de vision: el repositorio incluye ficheros mmproj (Q8_0 y f16) que permiten procesar imagenes como entrada, ademas del texto.
- Soporte de multi-token prediction (MTP): el tag "mtp" indica que el modelo puede predecir varios tokens a la vez, lo que reduce la latencia de generacion.
- Multilingue: soporta ingles y chino de forma nativa.
- Sin censura ni filtros de contenido: al ser "abliterated" y "uncensored", no rechaza preguntas sobre temas sensibles o controvertidos, lo que permite respuestas sin restricciones de seguridad.
- Compatibilidad con herramientas de inferencia GGUF: se puede desplegar en llama.cpp, Ollama, LM Studio y otros entornos que soporten este formato.

## Casos de uso

- Asistentes conversacionales sin filtro de contenido: el modelo no aplica politicas de rechazo, lo que lo hace util para aplicaciones de chat que necesitan respuestas sin restricciones en temas como politica, religion o sexualidad, siempre que el despliegue cumpla con la legislacion local.
- Razonamiento eficiente en entornos con presupuesto computacional limitado: gracias a la reduccion de tokens de pensamiento (hasta un 90 % menos), el modelo genera respuestas mas rapidas y con menor coste por consulta, adecuado para APIs de produccion con alto trafico.
- Generacion de codigo en pipelines de desarrollo: con su capacidad de razonamiento y de generacion de codigo, puede integrarse en herramientas de autocompletado o revision de codigo, ofreciendo explicaciones concisas sin divagaciones.
- Analisis de documentos largos con vision: combinando el modulo mmproj, el modelo puede extraer informacion de imagenes y documentos escaneados, aunque la ventana de contexto no se especifica, lo que limita la extension de los documentos procesables.
- Chat multilingue en ingles y chino: adecuado para aplicaciones que requieran atencion al cliente o asistentes en ambos idiomas, con respuestas naturales y sin censura.
- Prototipado rapido de agentes de IA: la capacidad de razonamiento y el soporte de herramientas permiten construir agentes simples que ejecutan tareas multi-paso, aunque no se documenta explicitamente el soporte de function calling.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion proporcionada. Las unicas referencias disponibles son afirmaciones cualitativas: segun el articulo de HackerNoon y la pagina de ToolAI, el modelo supera todos los benchmarks criticos de las versiones Qwen 3.5, 3.6 y 3.8 de 27B, y mantiene el 99 % del rendimiento en precision BF16 cuando se cuantiza a 8 bits o 4 bits. Sin embargo, no se facilitan cifras concretas, por lo que no se puede presentar una tabla comparativa verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: el quant Q4_K_S ocupa 15,9 GB, por lo que requiere al menos 16 GB de VRAM para cargar el modelo completo, y unos 20-24 GB para trabajar con un contexto razonable. El quant Q2_K ocupa 11 GB, pero con perdida de calidad notable.
- GPU recomendadas: una RTX 4090 de 24 GB o una RTX 3090 de 24 GB pueden ejecutar el modelo en Q4_K_S con soltura. Para despliegues de produccion, se recomienda una A100 de 40 GB o H100 para mayor contexto y batch.
- En consumer GPU: si, el Q4_K_S cabe en tarjetas de 24 GB, y el Q2_K cabe en tarjetas de 16 GB (como RTX 4080 o RTX 4060 Ti 16 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF. Para usar vLLM o TGI es necesario obtener los pesos en safetensors del modelo base (gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic) y convertirlos.
- Latencia y throughput: no disponibles, pero la reduccion de tokens de pensamiento implica una generacion mas rapida en comparacion con modelos Qwen estandar de igual tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic (este modelo) | 27,32 B | No disponible | Apache 2.0 | Abliterado, sin censura, COLD FUSION, vision multimodal |
| Qwen3.8-27B (modelo base de la familia) | 27,32 B | No disponible | Apache 2.0 | Sin abliteration, con atencion hibrida |
| Qwen3-30B-A3B (MoE) | 30 B total, 3 B activos | No disponible | Apache 2.0 | Arquitectura MoE, menor uso de VRAM en activos |

La comparativa se limita a la informacion disponible: el modelo "heretic" es una variante sin filtro de seguridad del Qwen3.8-27B estandar, con la optimizacion de COLD FUSION para reducir tokens de pensamiento. No se dispone de datos numericos de benchmarks para una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo es "abliterated" y "uncensored": no tiene filtros de seguridad, por lo que puede generar contenido ofensivo, peligroso o ilegal. No debe desplegarse en entornos de produccion sin una capa de moderacion adicional.
- Riesgo de alucinacion: como todos los LLM, puede producir informacion falsa o inventada, especialmente en temas de alta complejidad o con contexto largo.
- Longitud de contexto no especificada: no se conoce el numero exacto de tokens de contexto soportado, lo que dificulta la planificacion de tareas con documentos extensos.
- Idiomas limitados a ingles y chino: el modelo no esta entrenado para otros idiomas, lo que reduce su aplicabilidad en entornos multilingues amplios.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre el contenido generado, lo que puede suponer responsabilidades legales para el despliegue.
- Los quants de imatrix (IQ) no estan disponibles: solo se proporcionan quants estaticos (Q2_K y Q4_K_S), lo que limita la calidad de la cuantizacion en comparacion con los quants de imatrix.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic-GGUF
- Modelo base original: https://huggingface.co/gorbatjovy/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-heretic
- Articulo de HackerNoon sobre COLD FUSION: https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance
- Pagina de ToolAI con descripcion del modelo: https://www.toolify.ai/ai-model/davidau-qwen3-8-27b-cold-fusion-gain-v1-1-nm-dau-neo-max-mtp-gguf
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio de cuantizaciones i1 (imatrix) del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-i1-GGUF
