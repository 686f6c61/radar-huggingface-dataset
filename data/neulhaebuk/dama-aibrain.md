# NeulhaeBuk/dama-aibrain

## Resumen

NeulhaeBuk/dama-aibrain es un ajuste fino (finetune) publicado por el usuario NeulhaeBuk sobre el modelo `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 de Google. El repositorio declara la pipeline `image-text-to-text`, es decir, se trata de un modelo multimodal que acepta imagenes y texto como entrada y genera texto. El peso total en safetensors es de 5.123.178.051 parametros (aproximadamente 5,12 mil millones), con un repositorio de 10,3 GB, lo que es coherente con pesos en precision de 16 bits.

El modelo se presenta como un ajuste conversacional orientado al ingles, entrenado con la libreria Unsloth y TRL, segun indica la propia model card. La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo tipico de adaptacion ligera de un modelo multimodal abierto, publicado sin evaluacion publica, sin datos sobre el dataset de entrenamiento y con cero descargas y cero likes en el momento de la consulta. Es util, por tanto, como caso de estudio de buenas y malas practicas en la publicacion de finetunes, mas que como modelo listo para produccion.

Un detalle tecnico llamativo es la discrepancia entre el nombre del modelo base (`gemma-4-E2B`, donde "E2B" sugiere un esquema de parametros efectivos) y el recuento real de 5.123.178.051 parametros totales. Esa combinacion es compatible con arquitecturas de activacion selectiva de parametros, pero no hay confirmacion en la informacion disponible, por lo que se trata solo de una hipotesis y no de un dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita. Los tags indican familia `gemma4` y pipeline `image-text-to-text`, lo que implica un transformer multimodal con codificador de vision y decodificador de lenguaje. Detalles de capas, atencion o activacion selectiva: no disponibles |
| Parametros totales | 5.123.178.051 (dato de safetensors) |
| Parametros activos | No disponible (no se confirma si emplea arquitectura MoE o de activacion selectiva) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en safetensors; el modelo base se distribuye en cuantizacion `bnb-4bit`. No se publican variantes GGUF, AWQ, GPTQ ni EXL2 en el repositorio |
| Idiomas soportados | Ingles (`en`), segun la model card y los tags |
| Licencia | apache-2.0 (declarada en el repositorio; ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los metadatos indican que pertenece a la familia `gemma4` y que la tarea declarada es `image-text-to-text`, lo que implica un transformer multimodal capaz de procesar imagenes junto con texto. El recuento de 5,12 mil millones de parametros y la nomenclatura "E2B" del modelo base son compatibles con un esquema de parametros efectivos o de activacion selectiva, pero esta afirmacion no puede confirmarse con los datos disponibles. Tampoco se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni la estrategia de procesamiento de imagen (parcheo, resolucion nativa o embeddings visuales).

En cuanto al entrenamiento, la model card es minima: indica que el modelo fue entrenado "2x faster with Unsloth and Huggingface's TRL library" y que parte de `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO, ORPO u otro metodo de alineacion, ni la duracion o el hardware empleado. Tampoco se indica si el ajuste fue completo o mediante LoRA/QLoRA, aunque el uso de Unsloth y de un modelo base cuantizado a 4 bits apunta habitualmente a QLoRA en este tipo de publicaciones. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, segun la tarea declarada (`conversational`) y la pipeline del repositorio.
- Procesamiento de imagenes como entrada junto a texto (`image-text-to-text`), lo que habilita tareas de descripcion de imagenes y respuesta a preguntas visuales.
- Ajuste fino adicional: al publicarse en safetensors y ser compatible con `transformers`, puede servir como punto de partida para nuevos ajustes con LoRA o QLoRA.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se documentan otros idiomas.
- Modo de razonamiento explicito (thinking mode), audio o video: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes multimodales en ingles: el modelo puede recibir una imagen y una pregunta y devolver una respuesta textual, lo que permite construir demos de asistente visual sin partir de un modelo base sin ajustar. Es adecuado por su tamano contenido (5,12 mil millones de parametros), que cabe en GPU de consumo en cuantizaciones bajas.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo a partir de fotografias o capturas, integrado en un CMS o en una herramienta de publicacion. La limitacion al ingles restringe su uso a contenidos en ese idioma.
- Extraccion de informacion de documentos escaneados: preguntas sobre facturas, formularios o capturas de pantalla para extraer campos concretos en texto. Requiere validacion humana por el riesgo de alucinacion.
- Base para un ajuste fino especifico de dominio: al estar en safetensors y ser compatible con `transformers`, permite aplicar LoRA sobre un dataset propio para tareas verticales (soporte tecnico, catalogacion, etc.).
- Investigacion sobre adaptacion de modelos multimodales pequenos: util como punto de comparacion en experimentos de QLoRA con Unsloth, midiendo el efecto del ajuste sobre un modelo base cuantizado a 4 bits.
- Chatbot conversacional de bajo coste en ingles: despliegue en una unica GPU para atencion en un dominio acotado, siempre que se anada una capa de moderacion y de recuperacion de conocimiento externo.
- Evaluacion interna de pipelines de despliegue: por su tamano, sirve para probar configuraciones de vLLM, TGI o llama.cpp antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y no se han encontrado evaluaciones externas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en 16 bits: en torno a 10,3 GB solo de pesos, mas cache KV y activaciones, por lo que conviene contar con 12-16 GB en funcion de la longitud de contexto y del tamano de lote.
- VRAM estimada en 8 bits: aproximadamente 5,5-6 GB de pesos, mas overhead; manejable en GPUs de 8-10 GB con contextos moderados.
- VRAM estimada en 4 bits: aproximadamente 3-4 GB de pesos; compatible con GPUs de 6-8 GB, siempre que se convierta el modelo a GGUF o se cuantice en el momento de la carga.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia comoda en 16 bits; RTX 4080/4070 Ti (12-16 GB) para 8 bits; RTX 3060 12 GB o similar para 4 bits.
- Cabe en GPU de consumo: si, especialmente en cuantizaciones de 8 y 4 bits. En 16 bits requiere al menos 12-16 GB de VRAM efectiva.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el repositorio incluye el tag `text-generation-inference`), vLLM y SGLang para servicio con batching, y llama.cpp u Ollama previa conversion a GGUF (no se publican archivos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeulhaeBuk/dama-aibrain | 5,12 mil millones | No disponible | Imagen-texto a texto | apache-2.0 (declarada) | HuggingFace, 0 descargas |
| Gemma 3 4B IT (Google) | Aprox. 4 mil millones | 128k tokens (segun documentacion publica del autor) | Texto e imagen a texto | Gemma Terms of Use | Ampliamente disponible y evaluado |
| Qwen2.5-VL-7B-Instruct (Alibaba) | Aprox. 8 mil millones | 128k tokens (segun documentacion publica del autor) | Imagen-texto a texto | Apache 2.0 | Ampliamente disponible y evaluado |
| Llama-3.2-11B-Vision-Instruct (Meta) | Aprox. 10,7 mil millones | 128k tokens (segun documentacion publica del autor) | Imagen-texto a texto | Licencia comunitaria Llama 3.2 | Ampliamente disponible y evaluado |

Los datos de contexto, parametros y licencia de los modelos de comparacion provienen de la documentacion publica de sus respectivos autores y no de la informacion proporcionada en esta busqueda. No se dispone de comparativas de rendimiento con este modelo porque no se han publicado benchmarks del mismo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni informe de calidad. Cualquier uso en produccion exige una validacion propia previa.
- Riesgo de alucinacion elevado: al ser un ajuste fino sin documentacion y sin evaluacion, la tasa de respuestas incorrectas o inventadas es desconocida y previsiblemente alta en dominios especializados.
- Limitacion idiomatica: solo se declara ingles. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que dificulta el dimensionamiento de memoria y el diseno de aplicaciones con historial largo.
- Ambiguedad de licencia: el repositorio declara apache-2.0, pero el modelo base pertenece a la familia Gemma, habitualmente distribuida bajo los Gemma Terms of Use. El autor no aporta evidencia de que la relicenciacion a apache-2.0 sea valida, por lo que se recomienda revision legal antes de un uso comercial.
- Datos de entrenamiento no documentados: se desconoce la composicion del dataset, si hubo filtrado, si contiene datos personales o si se aplicaron tecnicas de alineacion. No puede descartarse la presencia de sesgos heredados del conjunto de datos.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica que no hay retroalimentacion de terceros ni informes de fallos.
- Sesgos conocidos: no documentados por el autor. Cabe esperar sesgos genericos de los corpus web en ingles utilizados para entrenar la familia base.
- Herramientas y agentes: no hay evidencia de soporte de function calling ni de plantillas de chat verificadas; la integracion en pipelines de agentes requeriria trabajo adicional.
- Moderacion: no se documentan filtros de contenido. En aplicaciones abiertas al publico es imprescindible anadir una capa de moderacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeulhaeBuk/dama-aibrain
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: no se proporciona enlace directo en la informacion disponible; se referencia en la model card de forma generica
- Papers, blogs o demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los resultados obtenidos no guardaban relacion con la consulta y se han descartado.
