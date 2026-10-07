# AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP8

## Resumen

AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP8 es un checkpoint de embeddings en formato MLX para Apple Silicon, publicado por AutomatosX a partir del modelo BF16 `nvidia/Nemotron-3-Embed-8B-BF16`. Se trata de una conversion cuantizada, no de un modelo entrenado desde cero: el autor aplica su pipeline de cuantizacion mixta AXQuant (AXQ) version 1.9.0 sobre el backbone de texto del modelo base, preservando ciertos tensores (embeddings y normalizaciones) en mayor precision. El resultado es un artefacto de 8,20 GB con 7.952.683.008 parametros logicos (unos 7,95B) y un BPW medido de 8,2503.

La relevancia de esta ficha es acotada y conviene entenderla bien: el modelo esta etiquetado como `feature-extraction` y `sentence-similarity`, por lo que su proposito es generar representaciones vectoriales (embeddings) para recuperacion, similitud semantica y clasificacion, no la generacion de texto abierta. Su atractivo principal es el contexto configurado de 262.144 tokens, que permite indexar documentos largos en una sola pasada siempre que la memoria unificada del equipo lo permita.

El autor es explicito al afirmar que este paquete es evidencia de desarrollo y no un release certificado de AXQuant: no publica mediciones de calidad, de rendimiento en contexto largo ni de velocidad de kernel, y advierte que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark. El repositorio acumulaba 36 descargas y 0 likes en el momento de la consulta, lo que lo situa como un artefacto de nicho y reciente (creado el 4 de octubre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Ministral3Model` (familia `mistral3`), ruta de texto optimizada |
| Parametros totales | 7.952.683.008 (~7,95B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada |
| Tipos de cuantizacion | MXFP8 (8-bit, grupo de 32) como presion dominante; metodos declarados `affine` y `bf16`; BPW principal medido 8,2503 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no incluye pesos PyTorch ni GGUF) |

Datos adicionales del artefacto: clase de presupuesto del Hub `MXFP8`, clase de precision base AXQuant `16p0bpw`, BPW planificado ajustado a almacenamiento 9,0002, cuantizador AXQuant 1.9.0, tamano de pesos safetensors 8,20 GB, descarga completa aproximada 8,22 GB, libreria `mlx`, pipeline `feature-extraction`. MTP presente: `False`. Vision presente: `False`. Audio presente: `False`.

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer densa basada en `Ministral3Model`, dentro de la familia `mistral3`. No hay componentes de mezcla de expertos ni de espacio de estados: la totalidad de los 7,95B parametros esta activa en cada pasada. La ruta de texto es la unica que se optimiza en esta conversion; no se incluyen sidecars de vision ni de MTP, y el autor declara explicitamente que no existen tensores n-gram ni declaracion asociada.

Sobre el entrenamiento no hay informacion en la documentacion proporcionada: se desconoce el numero de tokens, la composicion del dataset, si hubo RLHF/DPO o cualquier otra fase de alineamiento, tanto en el modelo base como en esta derivada. Lo que si se documenta es el proceso de cuantizacion: se aplico AXQuant con presupuesto `MXFP8` y sin calibracion, apoyandose unicamente en priors de arquitectura. La asignacion resultante deja el 100,00% de los pesos principales en precision `8bit` y 282.624 parametros en `bf16`, con grupos de tamano 32. La correccion de formato registrada el 6 de octubre de 2026 cambio el modo del contenedor de `affine` a `mxfp8` en ambos bloques de configuracion tras inspeccionar las cabeceras de cada modulo cuantizado, sin modificar los bytes de pesos. No se publican evidencias de calidad, de exactitud MTP ni de velocidad.

## Capacidades

- Generacion de embeddings de texto: extraccion de representaciones vectoriales (`feature-extraction`) para similitud semantica a nivel de frase y documento.
- Similitud semantica (`sentence-similarity`): calculo de distancias y puntuaciones de similitud entre pares de textos.
- Recuperacion de informacion y busqueda semantica, incluida la base para pipelines de RAG.
- Procesamiento de entradas largas: el contexto configurado de 262.144 tokens permite codificar documentos extensos sin fragmentacion previa, sujeto a la memoria disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado; el pipeline declarado es de extraccion de caracteristicas, no de razonamiento generativo.
- Capacidades multilingues: no disponibles (el modelo no declara idiomas).
- Capacidades especiales: no hay modo thinking, vision ni audio. MTP no incluido.
- Compatibilidad de ejecucion: la model card indica que MLX-LM cubre la inferencia estandar de texto/backbone y que puede ignorar metadatos de runtime AXQuant y sidecars opcionales; por tanto esa via no establece aceleracion MTP ni calidad vision-lenguaje.
- Ejecucion nativa en AX Engine: no establecida; el paquete no incluye un `model-manifest.json` nativo validado.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales, RFCs o documentacion de API de varios miles de tokens por entrada y recuperar fragmentos relevantes por similitud vectorial, aprovechando el contexto de 262.144 tokens para reducir el troceado.
- Recuperacion aumentada (RAG) sobre corpus internos: usar el modelo como codificador del recuperador en un pipeline que alimente a un LLM generativo distinto, almacenando los embeddings en una base vectorial.
- Deduplicacion y near-duplicate detection: comparar embeddings de registros, articulos o tickets para eliminar duplicados y consolidar bases de conocimiento.
- Clasificacion de texto zero-shot o few-shot: entrenar un clasificador ligero sobre los embeddings para categorizar tickets de soporte, correos o resenas sin anotaciones masivas.
- Agrupamiento tematico (clustering) de grandes volumenes de texto: agrupar noticias, feedback de usuarios o documentacion por similitud para analisis exploratorio.
- Sistemas de recomendacion y matching: representar ofertas y demandas, perfiles y vacantes, o productos y consultas como vectores para emparejamiento semantico.
- Moderacion y filtrado de contenido: detectar textos proximos a patrones conocidos mediante similitud vectorial, como primera etapa de un sistema de revision.
- Evaluacion de respuestas: calcular similitud semantica entre respuestas generadas y referencias como metrica auxiliar en evaluaciones automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad MTP, y que la etiqueta AXQ no constituye una afirmacion de benchmark. Tampoco se ofrece ninguna comparativa numerica frente a otros modelos de embeddings.

## Requisitos de hardware

- Peso de los pesos en disco: 8,20 GB en safetensors MLX; descarga completa aproximada de 8,22 GB.
- Plataforma: MLX requiere Apple Silicon (M1 o posterior). No hay pesos PyTorch ni GGUF en este repositorio, por lo que la ejecucion en GPU NVIDIA o AMD no esta soportada directamente por este artefacto.
- Memoria unificada estimada: al tratarse de un checkpoint de 8,20 GB, se estima un consumo en el entorno de 10-12 GB de memoria unificada para inferencia comoda (estimacion propia a partir del tamano del artefacto, no publicada por el autor). En equipos de 16 GB es viable con margen ajustado; 24 GB o mas dan holgura, especialmente si se pretende explotar el contexto de 262.144 tokens, cuyo consumo crece con la longitud de secuencia.
- GPU recomendadas: no aplica en el sentido convencional; la ejecucion se apoya en la GPU integrada del chip Apple Silicon. El autor no publica recomendaciones por modelo de chip ni de GPU.
- Cabida en GPU de consumo: no procede para tarjetas NVIDIA/AMD por falta de pesos compatibles. En Apple Silicon, cabe en configuraciones de 16 GB o superiores con reservas.
- Opciones de despliegue: MLX-LM es la via documentada por el autor. El artefacto registra MLX 0.32.1 y MLX-LM 0.31.3 de la conversion. No se incluye manifiesto nativo validado para AX Engine, de modo que la ejecucion nativa en AX Engine no esta establecida. vLLM, TGI, llama.cpp y Ollama no son aplicables sin una conversion previa a formatos que este repositorio no proporciona.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP8 (este) | 7,95B | 262.144 tokens | MXFP8 mixta, 8,2503 BPW medido | Apache 2.0 | MLX safetensors (Apple Silicon) |
| nvidia/Nemotron-3-Embed-8B-BF16 (base) | 7,95B | no disponible | BF16 | no disponible | safetensors; revision fijada `d1f2f25730bbd775b99b29185134bc86653bf2d1` |
| AX-Nemotron-3-Embed-8B-MLX-AXQ-4bit (hermano) | 7,95B | no disponible | AXQ de presupuesto 4-bit nominal; BPW exacto no consultado | Apache 2.0 | MLX safetensors (Apple Silicon) |
| AX-Nemotron-3-Embed-8B-MLX-AXQ-8bit (hermano) | 7,95B | no disponible | AXQ de precision media cercana a 8 BPW | Apache 2.0 | MLX safetensors (Apple Silicon) |

El autor advierte que los nombres AXQ describen una clase de presupuesto de almacenamiento y no una precision uniforme: un plan llamado 6bit puede retener 4bit como base y subir otros tensores a 6, 8 o BF16. Por eso insiste en que el BPW medido es el dato autoritativo. No se dispone de datos de rendimiento de ninguno de los hermanos que permitan una comparacion cuantitativa. Frente a otros modelos de embeddings de tamano similar de otros fabricantes, no hay informacion en la documentacion consultada, por lo que la comparativa se limita a la propia familia.

## Limitaciones y advertencias

- No es un modelo generativo: su pipeline declarado es `feature-extraction` y `sentence-similarity`. El ejemplo de la model card usa `mlx_lm.generate`, pero la propia documentacion matiza que MLX-LM cubre inferencia de texto/backbone estandar y que esa via no establece calidad MTP ni vision-lenguaje.
- Evidencia limitada: el autor califica el paquete como evidencia de desarrollo y no como release certificado. No hay evidencia medida de calidad, contexto largo ni velocidad; la asignacion de precision se basa en priors de arquitectura, sin calibracion.
- Riesgo de alucinacion: no aplica de la misma forma que en un modelo generativo, pero si existe riesgo de representaciones pobres o sesgadas que degraden la recuperacion. No se publican estudios al respecto.
- Sesgos conocidos: no disponibles. Al no documentarse el dataset de entrenamiento del modelo base, no es posible evaluar sesgos de dominio, idioma o demografia.
- Limitaciones de idioma: el modelo no declara idiomas soportados, por lo que no se puede afirmar cobertura multilingue ni garantizar comportamiento fuera del ingles.
- Limitaciones de contexto: aunque se configuran 262.144 tokens, el limite real depende de la memoria unificada del equipo y de la atencion sobre secuencias largas; no se publican pruebas de degradacion a esa longitud.
- Restricciones de licencia: Apache 2.0, lo que en principio permite uso comercial. No obstante, la licencia del modelo base NVIDIA no se documenta en la informacion proporcionada y conviene verificarla antes de un despliegue comercial.
- Portabilidad: sin pesos PyTorch ni GGUF, el artefacto queda restringido a Apple Silicon. No es desplegable en infraestructura x86 con GPU NVIDIA sin una conversion adicional.
- Ejecucion nativa en AX Engine no establecida: no se incluye manifiesto nativo validado; los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad previsto, no evidencia observada.
- Reproducibilidad: el autor recomienda fijar el commit concreto del Hub en despliegues reproducibles en lugar de depender indefinidamente de `main`.
- Adopcion muy baja: 36 descargas y 0 likes, con escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16/tree/d1f2f25730bbd775b99b29185134bc86653bf2d1
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-4bit
- Hermano 8bit: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-8bit
- Colecciones del autor: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoria de formato de runtime incluida en el repositorio: `runtime_audit.json`
