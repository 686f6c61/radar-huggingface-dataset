# enkato64bit/SuperGemma-4-12b-abliterated

## Resumen

SuperGemma-4-12b-abliterated es un checkpoint de 12B derivado de google/gemma-4-12B-it, publicado en HuggingFace por el usuario enkato64bit. Se trata de un modelo multimodal (etiqueta image-text-to-text y uso de AutoProcessor y AutoModelForMultimodalLM en la model card), con pipeline declarado de generacion de texto y pesos consolidados en safetensors. El repositorio ocupa 24,0 GB y contiene 11.959.730.224 parametros, lo que lo situa en la horquilla de los 12B en precision BF16.

La propuesta del autor consiste en fusionar dos etapas de post-entrenamiento en un unico checkpoint, sin necesidad de adaptadores en tiempo de ejecucion: primero una pasada de "abliteration" en el espacio de pesos, orientada a suprimir direcciones de rechazo y favorecer la ejecucion directa de tareas, y despues un "supertune" centrado en seguimiento de instrucciones, codigo, respuestas tecnicas en coreano, formateo JSON y de tool calling, y resistencia a regresiones.

Su relevancia practica esta en la combinacion de tres factores: el pipeline multimodal del modelo base, la mejora reportada por el autor en pruebas de codigo (HumanEval+ de 18,0 a 46,0 y MBPP+ de 13,0 a 81,0) y la reduccion deliberada del comportamiento de rechazo. Al mismo tiempo, el repositorio registra 0 descargas y 0 likes, y los benchmarks proceden unicamente del propio autor, sin verificacion independiente disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiqueta "gemma4_unified"; transformer multimodal (image-text-to-text). Detalle de capas, atencion y si emplea MoE: no disponible |
| Parametros totales | 11.959.730.224 (11,96B) |
| Parametros activos | No aplica segun la informacion disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 original; NVF4 / NVFP4 4-bit; MLX affine 4-bit; GGUF Q4_K_M (repos separados) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 (declarada por el autor; ver limitaciones sobre la licencia del modelo base) |
| Formato de pesos | safetensors (repositorio principal); GGUF y MLX en repos derivados |

Otros datos: tamano del repositorio 24,0 GB; libreria transformers; creado y actualizado el 17 de septiembre de 2026; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un checkpoint fusionado de 12B derivado de google/gemma-4-12B-it, con etiqueta de arquitectura "gemma4_unified" y capacidad multimodal (entrada de imagen y texto, salida de texto). La model card emplea AutoProcessor y AutoModelForMultimodalLM con trust_remote_code, y el chat template admite la variable enable_thinking, lo que apunta a un modo de razonamiento activable y desactivable. No se especifican numero de capas, tipo de atencion, presupuesto de contexto, vocabulario, resolucion de imagen soportada ni detalles de la torre de vision.

En cuanto al entrenamiento, no se publican tokens totales, composicion del dataset ni si hubo RLHF o DPO. Lo que si se detalla son las dos etapas de post-entrenamiento: (1) una pasada de abliteration, definida por el autor como una intervencion en el espacio de pesos sobre la direccion de rechazo, destinada a suprimir rechazos innecesarios y mejorar la finalizacion directa de tareas; y (2) un "supertune" orientado a seguimiento de instrucciones, programacion, respuestas tecnicas en coreano, formateo JSON y de herramientas, y resistencia a regresiones. El resultado se entrega como un unico checkpoint sin adaptador en runtime. La model card incluye una validacion interna que reporta 500 de 500 prompts publicos completados, ratio de respuestas en blanco de 0,0, ratio de filtracion de pensamiento oculto de 0,0 y un bugcheck de 6 de 6.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat.
- Razonamiento y conocimiento general evaluado con GPQA Diamond y MMLU-Pro.
- Generacion de codigo, con mejoras reportadas por el autor en HumanEval+ y MBPP+.
- Formateo JSON y de tool calling, segun la descripcion del supertune.
- Seguimiento de instrucciones (evaluado con IFEval) y resistencia a regresiones.
- Respuestas tecnicas en coreano, ademas de ingles; idiomas declarados: en y ko.
- Entrada multimodal imagen-texto (etiqueta image-text-to-text y API de procesador multimodal en la model card).
- Modo de pensamiento controlable mediante el flag enable_thinking del chat template.
- Ejecucion directa de tareas con rechazo reducido por construccion (abliteration).
- Despliegue sin adaptadores: un unico checkpoint fusionado.

## Casos de uso

- Generacion de codigo en pipelines de CI/CD: con HumanEval+ reportado en 46,0 y MBPP+ en 81,0, el modelo puede emplearse para autocompletar funciones, generar pruebas unitarias o proponer parches sobre un repositorio, apoyandose en el formateo JSON para devolver resultados estructurados a un orquestador.
- Asistentes de desarrollo integrados en el IDE: el soporte de tool calling y de plantilla de chat permite construir un agente que consulte documentacion, ejecute busquedas y aplique ediciones, con la ventaja de no requerir adaptadores adicionales en produccion.
- Atencion al cliente automatizada en ingles y coreano: el modelo cubre ambos idiomas declarados y conversaciones multi-turno; conviene validar antes la longitud de contexto real, que no esta publicada.
- Analisis de documentos con imagenes: al aceptar entradas imagen-texto mediante AutoProcessor, puede extraer informacion de capturas, diagramas o formularios y devolver la respuesta en JSON para su ingesta en un sistema posterior.
- Extraccion de datos estructurados: la especializacion declarada en formateo JSON lo hace adecuado para convertir texto libre o imagenes en esquemas validables, con salida parseable por herramientas de backend.
- Entornos con restricciones de memoria: las variantes GGUF Q4_K_M y MLX 4-bit permiten desplegarlo en estaciones de trabajo o equipos Apple Silicon donde BF16 no cabe.
- Investigacion sobre alineacion y rechazo: al ser un modelo abliterated, sirve como caso de estudio para medir como varia el comportamiento de rechazo y las capacidades tras una intervencion en el espacio de pesos.
- Traduccion tecnica ingles-coreano: orientado a documentacion y respuestas tecnicas, no a traduccion literaria ni a idiomas fuera de los declarados.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparados con el checkpoint de instruccion original Gemma4 12B:

| Benchmark | Gemma4 12B original | SuperGemma-4-12b-abliterated | Delta |
|---|---:|---:|---:|
| Overall public top-5 500 | 23,8 | 44,6 | +20,8 |
| GPQA Diamond | 10,0 | 19,0 | +9,0 |
| MMLU-Pro | 17,0 | 18,0 | +1,0 |
| IFEval | 61,0 | 59,0 | -2,0 |
| HumanEval+ | 18,0 | 46,0 | +28,0 |
| MBPP+ | 13,0 | 81,0 | +68,0 |

Validacion interna declarada por el autor:

| Comprobacion | Resultado |
|---|---:|
| Prompts de benchmark publicos completados | 500 / 500 |
| Ratio de respuestas en blanco | 0,0 |
| Ratio de filtracion de pensamiento oculto | 0,0 |
| Hallazgos en la auditoria de superficie de release | 0 |
| Bugcheck de release | 6 / 6 |
| Quickbench full20 overall | 95,4 |
| Mega 103 overall | 88,7 |
| Mega 103 overall de referencia original | 84,1 |

Advertencia: todas estas cifras proceden exclusivamente de la model card del autor. No hay resultados de terceros, ni detalles sobre el metodo de evaluacion (few-shot, temperatura, versiones de las suites) mas alla de la mencion a una suite publica de 500 prompts. La unica metrica que empeora es IFEval, con una caida de 2 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros; no publicada por el autor):
  - BF16: aproximadamente 24 GB solo de pesos, mas overhead de activaciones y cache KV, en torno a 26-32 GB en la practica.
  - Cuantizacion 8-bit: aproximadamente 12-14 GB.
  - Cuantizacion 4-bit (GGUF Q4_K_M, NVF4, MLX 4-bit): aproximadamente 7-9 GB.
- GPU recomendadas: para BF16, A100 40/80 GB, H100 80 GB o L40S 48 GB; para 4-bit, RTX 4090 24 GB, RTX 3090 24 GB, RTX 4080 16 GB o superiores.
- Compatibilidad con GPU de consumo: si. En BF16 cabe ajustado en RTX 3090/4090 de 24 GB con contexto corto; en 4-bit cabe en tarjetas de 8-12 GB, y las variantes MLX estan pensadas para Apple Silicon.
- Opciones de despliegue: transformers con trust_remote_code (ruta documentada por el autor); llama.cpp u Ollama mediante la variante GGUF Q4_K_M; MLX para equipos Apple; vLLM o TGI no estan confirmados en la informacion disponible, por lo que requeririan validacion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperGemma-4-12b-abliterated | 11,96B | no disponible | Overall top-5 500: 44,6; HumanEval+ 46,0; MBPP+ 81,0 (datos del autor) | apache-2.0 declarada | HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-12B-it (base) | Tamano 12B segun nomenclatura; total exacto no disponible | no disponible | Overall top-5 500: 23,8; HumanEval+ 18,0; MBPP+ 13,0 | no disponible en la informacion consultada | Modelo base de referencia |
| Variantes cuantizadas del mismo modelo (NVF4, MLX 4-bit, GGUF Q4_K_M) | 11,96B | no disponible | No se publican resultados propios | apache-2.0 declarada | Repos separados en HuggingFace |
| Otras alternativas de 12B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos de terceros de la misma categoria y tamano en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a sus propias variantes cuantizadas.

## Limitaciones y advertencias

- La abliteration suprime la direccion de rechazo en el espacio de pesos. Es esperable una menor disposicion a negarse ante peticiones problematicas, lo que incrementa el riesgo de generar contenido danino, inseguro o conforme a instrucciones abusivas. Requiere filtros externos obligatorios en cualquier despliegue abierto al publico.
- Riesgo de alucinacion no cuantificado: no se publican metricas de veracidad, tasa de alucinacion ni evaluacion de calibracion.
- Idiomas limitados a ingles y coreano. El rendimiento en castellano no esta documentado ni evaluado.
- La longitud de contexto no se especifica, lo que impide planificar cargas con documentos largos o historiales extensos sin una prueba previa.
- Los benchmarks son autodeclarados y no han sido verificados de forma independiente. Un MMLU-Pro de 18,0 y un GPQA Diamond de 19,0 son valores muy bajos en terminos absolutos, aunque superen a la referencia del autor; conviene interpretarlos como indicativos de limitaciones de conocimiento y razonamiento, no como un modelo de gama alta en esas dimensiones.
- IFEval retrocede 2 puntos respecto al base (61,0 a 59,0), lo que sugiere un posible coste en seguimiento de instrucciones.
- La licencia declarada es apache-2.0, pero el modelo base google/gemma-4-12B-it pertenece a Google y sus terminos de uso deben revisarse por separado. La aplicabilidad de apache-2.0 a un derivado de un modelo Gemma es un punto a verificar antes de un uso comercial.
- Riesgo de suplantacion o confusion de repositorio: la model card se refiere a repositorios bajo el usuario Jiunsong (incluido "This repository"), mientras que el identificador de HuggingFace consultado es enkato64bit/SuperGemma-4-12b-abliterated. Conviene verificar la cadena de publicacion y la integridad de los pesos.
- Las fechas de creacion y actualizacion (septiembre de 2026) y la nomenclatura "gemma-4" deben contrastarse con las fuentes oficiales antes de citarlas en produccion.
- Sin adopcion verificable: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.
- Requiere trust_remote_code en transformers, lo que implica ejecutar codigo del autor y anade superficie de riesgo en entornos no controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enkato64bit/SuperGemma-4-12b-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante BF16 de referencia citada en la model card: https://huggingface.co/Jiunsong/SuperGemma-4-12b-abliterated
- Variante NVF4 / NVFP4 4-bit: https://huggingface.co/Jiunsong/SuperGemma-4-12b-abliterated-nvf4
- Variante MLX 4-bit: https://huggingface.co/Jiunsong/SuperGemma-4-12b-abliterated-mlx-4bit
- Variante GGUF Q4_K_M: https://huggingface.co/Jiunsong/SuperGemma-4-12b-abliterated-gguf-4bit
- Papers, blogs tecnicos, repositorios de codigo y demos: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos enlaces recuperados correspondian a un dominio ajeno al proyecto (anime-sama.fr) y se han descartado por no ser relevantes.
