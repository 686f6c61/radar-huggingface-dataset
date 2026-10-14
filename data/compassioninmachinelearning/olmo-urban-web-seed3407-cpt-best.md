# CompassioninMachineLearning/olmo-urban-web-seed3407-CPT-best

## Resumen

El modelo `CompassioninMachineLearning/olmo-urban-web-seed3407-CPT-best` es un modelo de lenguaje de aproximadamente 7.300 millones de parametros publicado en HuggingFace por el usuario u organizacion CompassioninMachineLearning. El sufijo del identificador indica que se trata de un ajuste por preentrenamiento continuado (CPT, *continued pre-training*) sobre una base OLMo (la etiqueta de HuggingFace es `olmo3`), orientado a un dominio o corpus denominado "urban" y ejecutado con la semilla 3407. El sufijo `best` sugiere que corresponde al mejor checkpoint de validacion exportado dentro de una campana de entrenamiento con multiples semillas y particiones, segun el patron que se observa en repositorios hermanos del mismo autor.

El modelo esta pensado, por tanto, como un derivado especializado: se parte de un OLMo preentrenado y se continua el entrenamiento con datos del dominio objetivo. Los repositorios relacionados que aparecen en la busqueda web (`olmo-urban-part1`, `Olmo7b-urban-seed2-20261012-CPT-best-val-step-750`) confirman que existe una familia de variantes con distintas semillas, particiones de datos y pasos de validacion. Ademas, la ficha de FriendliAI asociada a `olmo-urban-part1` menciona entrenamiento acelerado con Unsloth y la libreria TRL de HuggingFace, lo que da una pista sobre el stack de entrenamiento empleado.

La relevancia de esta publicacion es acotada: con 3 descargas y 0 likes, es un artefacto de investigacion mas que un modelo de proposito general listo para produccion. No se ha publicado informacion sobre licencia, idiomas soportados, pipeline de inferencia ni resultados de evaluacion, por lo que cualquier uso en produccion deberia ir precedido de una validacion propia y de la aclaracion de la licencia con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta HuggingFace: olmo3; se infiere transformer denso tipo OLMo) |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; al ser safetensors en bf16/fp16 es compatible con cuantizacion posterior a GGUF, AWQ, GPTQ, FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la ficha no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada en la ficha de HuggingFace sobre la arquitectura interna. La etiqueta `olmo3` apunta a la familia OLMo de AI2, que es una serie de transformers densos, decoder-only, con atencion completa, entrenados con un corpus abierto y documentado (web curada, codigo, libros y texto cientifico deduplicado y filtrado por calidad, segun la pagina oficial de OLMo). Dado el numero de parametros (7,3 B) y el tamano del repositorio (14,6 GB, coherente con pesos en precision de 16 bits), encaja con una variante de la clase 7B de esa familia, aunque no se puede confirmar el numero de capas, dimensiones ocultas ni el vocabulario sin consultar los archivos de configuracion.

Respecto al entrenamiento, el identificador indica un proceso de *continued pre-training* sobre el modelo base, no un ajuste supervisado ni un alineamiento por RLHF o DPO. El uso de la semilla 3407 en el nombre sugiere que forma parte de una comparativa controlada entre semillas y particiones de datos ("urban", "web", "part1", "seed2", etc., vistos en repositorios hermanos). La mencion de Unsloth y TRL en la ficha de FriendliAI de un repo hermano (`olmo-urban-part1`) indica que el entrenamiento se pudo realizar con ese stack de optimizacion, pero es informacion indirecta y no confirmada para este checkpoint concreto. No consta el numero de tokens de preentrenamiento continuado, la composicion del corpus "urban" ni si hubo fases posteriores de ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base OLMo utilizado para el CPT.
- Razonamiento general y conocimiento del dominio "urban" en la medida en que el corpus de preentrenamiento continuado lo haya incorporado; no hay evaluacion publicada que lo confirme.
- Codigo y matematicas: no disponible; depende del modelo base y del peso que tuviera en el corpus de CPT.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la ficha no declara idiomas.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible.

## Casos de uso

Dado que no hay evaluacion publicada ni licencia declarada, los siguientes casos son escenarios plausibles sujetos a validacion previa por parte del integrador:

- Investigacion academica sobre preentrenamiento continuado: el modelo sirve como punto de comparacion frente a las otras semillas y particiones de la misma familia (`olmo-urban-part1`, `Olmo7b-urban-seed2-...`) para medir el efecto de la semilla y del subconjunto de datos en el rendimiento final.
- Dominio especializado "urban": si el corpus de CPT cubre planificacion urbana, movilidad, normativa o datos geoespaciales textuales, el modelo podria emplearse para generar resumenes o borradores sobre ese ambito, siempre que una validacion interna confirme la mejora frente al base.
- Base para ajuste fino supervisado posterior: al ser un checkpoint denso de 7,3 B en safetensors, es un punto de partida razonable para SFT o DPO con datasets propios del dominio, en una sola GPU de 24-48 GB con cuantizacion o en varias GPU con precision completa.
- Experimentos de destilacion o cuantizacion: el modelo puede servir como profesor o como sujeto para generar versiones GGUF/AWQ/GPTQ y estudiar la degradacion de calidad en el dominio urban.
- Generacion aumentada por recuperacion (RAG) sobre corpus urbanos: integrado en un pipeline que recupere documentos del mismo dominio, el modelo puede redactar respuestas contextualizadas, aunque su ventana de contexto es desconocida y deberia medirse antes de disenar el sistema.
- Evaluacion de sesgos y robustez en dominios especializados: util para estudiar como el CPT afecta a comportamientos indeseados (repeticion, alucinacion de datos normativos, etc.) respecto al modelo base.
- Analisis de corpus y anotacion asistida: clasificacion, resumen o extraccion de entidades sobre textos urbanos, con supervision humana en el bucle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye tarjeta de modelo con metricas, y los resultados de busqueda no aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para este checkpoint. Cualquier numero que se quisiera usar en una comparativa tendria que generarse localmente con un arnes reproducible (por ejemplo, `lm-evaluation-harness`) sobre el mismo conjunto de tareas que el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en bf16/fp16: en torno a 14-16 GB, coherente con el tamano del repo (14,6 GB) y con 7,3 B de parametros.
- VRAM estimada con cuantizacion: aproximadamente 7-8 GB en INT8 y 4-5 GB en INT4 (mas overhead de activaciones y cache KV, que depende de la longitud de contexto, dato no disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S o similares para precision completa con lotes grandes; RTX 4090, RTX 3090, RTX A6000 o RTX 4080 para inferencia en bf16 con una sola peticion o cuantizado.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16 con contexto corto, y en tarjetas de 8-12 GB con cuantizacion INT4; en 8 GB exactos el margen sera muy ajustado.
- Opciones de despliegue: al estar en safetensors, es compatible con vLLM, TGI, SGLang, transformers + accelerate y, tras conversion, con llama.cpp y Ollama. No hay archivos GGUF publicados en el repo.
- Latencia y throughput: no disponibles. Dependeran del hardware, de la cuantizacion y de la longitud de contexto, que tampoco se ha publicado.

## Comparativa con modelos similares

La comparativa se plantea contra alternativas de la misma clase de tamano (7-9 B, transformer denso, licencia permisiva), dado que la categoria exacta del modelo no esta declarada. Las cifras de contexto y licencia de los comparadores son las publicas de cada proyecto; las del modelo analizado figuran como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CompassioninMachineLearning/olmo-urban-web-seed3407-CPT-best | 7,3 B | no disponible | no disponible | HuggingFace, 3 descargas | CPT de dominio sobre base OLMo; sin benchmarks publicados |
| OLMo 2 7B (AI2) | ~7 B | ampliable a 4.096 tokens (segun configuracion base) | Apache 2.0 (segun proyecto OLMo) | HuggingFace, ampliamente distribuido | Modelo base con datos de entrenamiento y receta abiertos |
| Qwen2.5 7B | 7,6 B | 32.768 tokens y superior | Apache 2.0 en la mayoria de variantes | HuggingFace, muy usado | Fuerte en codigo y multilingue |
| Llama 3.1 8B | 8 B | 128.000 tokens | Llama 3.1 Community License (con restricciones) | HuggingFace, muy usado | Ecosistema amplio, tool calling nativo |

No se han publicado resultados de benchmarks para el modelo analizado que permitan una comparacion de rendimiento directa; la tabla anterior solo contrasta parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un CPT de dominio, los sesgos del modelo base pueden haberse amplificado o desplazado hacia el corpus "urban", sin que exista auditoria publicada.
- Riesgo de alucinacion: no cuantificado. Los modelos de 7 B sin ajuste por instrucciones pueden generar contenido plausible pero incorrecto, especialmente en dominios normativos o tecnicos como el urbanistico.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados en la ficha; hay que medirlos antes de disenar cualquier aplicacion.
- Licencia: no declarada. Esto es un bloqueo directo para uso comercial en produccion hasta que el autor aclare los terminos. El modelo base OLMo suele publicarse bajo Apache 2.0, pero la ausencia de licencia explicita en este repo impide asumirla.
- Trazabilidad: no hay tarjeta de modelo, ni descripcion del dataset "urban", ni hiperparametros de entrenamiento. La reproducibilidad es limitada.
- Madurez: 3 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad. No hay garantia de que los pesos esten completos o de que la conversion a otras precisiones haya sido verificada.
- Fecha de creacion inusualmente futura (2026-10-14) en los metadatos: conviene revisar si es un error de marcado o un timestamp manipulado, ya que afecta a la interpretacion del linaje respecto a otros repositorios.
- Uso en produccion: no recomendado sin evaluacion propia, clarificacion de licencia y pruebas de robustez en el dominio objetivo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/CompassioninMachineLearning/olmo-urban-web-seed3407-CPT-best
- Repo hermano `olmo-urban-part1`: https://huggingface.co/CompassioninMachineLearning/olmo-urban-part1
- Repo hermano `Olmo7b-urban-seed2-20261012-CPT-best-val-step-750`: https://huggingface.co/CompassioninMachineLearning/Olmo7b-urban-seed2-20261012-CPT-best-val-step-750
- Pagina oficial de OLMo (AI2, contexto del modelo base): https://allenai.org/olmo
- Repositorio de codigo OLMo (AI2): https://github.com/allenai/OLMo
- Endpoint de inferencia de FriendliAI para `olmo-urban-part1` (menciona entrenamiento con Unsloth y TRL): https://friendli.ai/models/CompassioninMachineLearning/olmo-urban-part1
