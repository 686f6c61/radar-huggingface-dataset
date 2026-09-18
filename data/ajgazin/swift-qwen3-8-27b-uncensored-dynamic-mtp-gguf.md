# ajgazin/Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF

## Resumen

Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF es un conjunto de cuantizaciones GGUF del modelo ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP, que a su vez es una version "abliterated" (sin direccion de rechazo) de Swift-Qwen3.8-27B, el ajuste fino orientado a eficiencia de razonamiento que UkisAI publica sobre Qwen3.8-27B de Qwen. El repositorio lo mantiene el usuario ajgazin y publica pesos listos para llama.cpp en ocho tamanos de cuantizacion mas un proyector de vision, con soporte de decodificacion especulativa integrada.

El problema que resuelve es doble. Por un lado, ofrece una version con la direccion de rechazo eliminada: segun la model card, el modelo BF16 de origen pasa de 98/100 rechazos en Swift a 15/100, con una divergencia KL de 0,0634 frente a los pesos originales. Por otro, empaqueta el modelo en el diseno Unsloth Dynamic 3.0, donde cada tensor recibe el tipo de cuantizacion que Unsloth eligio para su fichero del mismo tamano, usando su importance matrix. Esto permite ejecutar un modelo de la familia 27B desde 9,2 GiB de VRAM.

La innovacion tecnica principal es la inclusion de la cabeza MTP (multi-token prediction) en todos los GGUF principales: la capa `blk.64` contiene los 15 tensores de MTP con `nextn_predict_layers = 1`, lo que habilita decodificacion autoespeculativa en llama.cpp mediante `--spec-type draft-mtp`, sin necesidad de un fichero draft separado. Ademas, el repositorio incluye un proyector de vision (`mmproj-BF16.gguf`) que anade entrada de imagen y video, por lo que el pipeline declarado es image-text-to-text. El modelo piensa antes de responder por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B, con capa MTP (multi-token prediction) adicional en `blk.64` y proyector de vision opcional |
| Parametros totales | 460.730.096 segun los metadatos de safetensors del repositorio; el nombre comercial indica 27B y el GGUF BF16 (50,9 GiB) es coherente con aproximadamente 27.000 millones de parametros en BF16. La discrepancia no se explica en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Los ejemplos de la model card arrancan llama.cpp con `-c 32768`, pero no se especifica la ventana nativa del modelo |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_S, UD-Q5_K_M, UD-Q6_K_XL, UD-Q8_K_XL y BF16 (sin cuantizar). Tipos de tensor internos: IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, Q2_K, Q3_K, Q4_K, IQ4_XS, IQ4_NL, Q5_K, Q6_K, Q8_0, BF16, F32 (normas) |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (`license: other`), heredada de ukisai/Swift-Qwen3.8-27b |
| Formato de pesos | GGUF (llama.cpp), incluido `mmproj-BF16.gguf` para vision y `tensor_types.tsv` con los tipos por tensor. El modelo de origen esta en safetensors BF16; existe una version NVFP4 en otro repositorio para vLLM y SGLang |

Datos adicionales del repositorio: 1199 tensores convertidos desde safetensors BF16 (MTP incluido), 866 tensores por cuantizacion, 65 bloques en cada GGUF principal, tamano total del repositorio 191,3 GB, 3029 descargas y 7 likes a fecha de actualizacion (17 de septiembre de 2026).

## Arquitectura y entrenamiento

La cadena de derivacion es: Qwen3.8-27B (Qwen) -> Swift-Qwen3.8-27B (UkisAI, ajuste fino "reasoning-efficient") -> Swift-Qwen3.8-27B-Uncensored-MTP (ajgazin, abliteration) -> este repositorio (cuantizacion GGUF). La abliteration aplica la direccion de rechazo de orcarouter/Qwen3.8-27B-Uncensored, calculada segun el metodo de Arditi et al. 2024 con una unica direccion, sobre los pesos de Swift: se editaron 131 tensores (salidas de atencion, `mlp.down_proj`, `embed_tokens`, incluida la capa MTP), y el resto de pesos permanecen identicos a Swift. La model card del modelo de origen documenta el metodo, la direccion y los scripts. No se indica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en ninguna de las etapas; esa informacion no esta disponible.

La cuantizacion sigue el diseno Unsloth Dynamic 3.0. La conversion se hizo con `convert_hf_to_gguf.py` de llama.cpp, una vez para el modelo de lenguaje y otra con `--mmproj` para el proyector de vision. Despues se aplico `llama-quantize` con la importance matrix `imatrix_unsloth.gguf` de unsloth/Qwen3.8-27B-GUF y un fichero `--tensor-type-file` que asigna a cada tensor el tipo del GGUF de Unsloth del mismo tamano. El imatrix se calibro sobre el Qwen3.8-27B original, justificandolo en que el ajuste fino de bajo rango de Swift y la abliteration de rango uno apenas modifican los pesos. Como verificacion, se comprueba que los 866 tensores de cada cuantizacion tienen exactamente los tipos y las formas del fichero de Unsloth del mismo tamano. El tokenizador y la plantilla de chat coinciden con los de Unsloth (mismo vocabulario, merges y tokens especiales), con `add_bos_token = false` y `<|endoftext|>` como token de padding.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking": el modelo piensa antes de responder por defecto. Los parametros de muestreo recomendados son temperatura 1.0, top_p 0.95, top_k 20 y min_p 0.
- Razonamiento eficiente: parte de un ajuste fino de Swift disenado explicitamente para reducir el coste de razonamiento respecto al modelo base.
- Vision: entrada de imagen y video a traves del proyector incluido (`mmproj-BF16.gguf`), con pipeline image-text-to-text.
- Decodificacion autoespeculativa: la cabeza MTP integrada permite usar `--spec-type draft-mtp` en llama.cpp para acelerar la generacion sin fichero draft externo.
- Respuestas sin rechazo: la abliteration reduce los rechazos de 98/100 a 15/100 en el conjunto de evaluacion empleado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo thinking y la ventana configurable de 32768 tokens en los ejemplos son compatibles con ese uso.

## Casos de uso

- Generacion de texto creativo y narrativa sin filtros de rechazo: la abliteration reduce drasticamente las negativas del modelo base, lo que resulta util para ficcion con tematicas adultas, terror o conflicto moral donde el modelo original se negaba a continuar.
- Analisis de documentos largos con llama.cpp: el ejemplo de despliegue usa `-c 32768`, de modo que se pueden procesar informes, contratos o articulos completos en una sola pasada manteniendo el contexto dentro de la VRAM de una GPU de 24 GB con la cuantizacion UD-Q4_K_XL.
- Asistente local con entrada de imagen o video: cargando `mmproj-BF16.gguf` junto al GGUF principal, el modelo puede describir fotogramas, resumir clips o extraer informacion de capturas de pantalla sin enviar datos a servicios externos.
- Inferencia en estaciones de trabajo de gama media: la cuantizacion UD-Q2_K_XL (9,2 GiB) permite ejecutar la familia 27B en tarjetas de 12 GB, y la UD-Q3_K_XL (12,2 GiB) en 16 GB, lo que habilita prototipado y demos en hardware de consumo.
- Servicio de razonamiento con latencia reducida: activando `--spec-type draft-mtp` se aprovecha la cabeza MTP para decodificacion autoespeculativa, lo que resulta adecuado para entornos interactivos donde el tiempo hasta el primer token y el throughput importan.
- Evaluacion de seguridad y estudios de alineacion: el par de modelos (Swift con 98/100 rechazos y esta version con 15/100, KL 0,0634) sirve como material de referencia para investigar como la edicion de una unica direccion afecta al comportamiento de rechazo y a la deriva de pesos.
- Fine-tuning o destilacion posteriores sobre base sin censura: al distribuirse en GGUF y en BF16 (50,9 GiB), el fichero BF16 puede usarse como referencia para medir la calidad de las cuantizaciones o para generar otros tamanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo publicado es la medicion de rechazos y divergencia KL:

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| BF16 fuente (frente a Swift) | 15/100 | 0,0634 |
| Swift-Qwen3.8-27B | 98/100 | 0 |
| Referencia: orcarouter/Qwen3.8-27B-Uncensored (frente a Qwen3.8-27B) | 17/100 | 0,0621 |

Las mediciones se realizaron con Heretic sobre los pesos BF16: 100 prompts de `mlabonne/harmful_behaviors` con detector de rechazo por palabras clave, y divergencia KL sobre el primer token con `mlabonne/harmless_alpaca`, omitiendo el modo thinking. No se repitieron las mediciones sobre las cuantizaciones. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- UD-Q2_K_XL, 9,2 GiB: cabe en una GPU de 12 GB.
- UD-Q3_K_XL, 12,2 GiB: cabe en una GPU de 16 GB.
- UD-Q4_K_XL, 16,4 GiB: cabe en una GPU de 24 GB con margen para contexto largo.
- UD-Q5_K_S, 17,4 GiB: cabe en una GPU de 24 GB con mas margen de contexto que la Q5_K_M.
- UD-Q5_K_M, 18,4 GiB: cabe en una GPU de 24 GB.
- UD-Q6_K_XL, 23,6 GiB: la opcion mas ajustada para una GPU de 32 GB.
- UD-Q8_K_XL, 29,3 GiB: practicamente sin perdida; cabe en una GPU de 48 GB y en una de 32 GB requiere offload parcial a CPU.
- BF16 sin cuantizar, 50,9 GiB: requiere una GPU de 80 GB o reparto entre varias GPU.
- Proyector de vision: 0,9 GiB adicionales si se usa entrada de imagen o video.
- Despliegue: llama.cpp (`llama-server`) es la via documentada, con flags `-ngl 99` para descargar todas las capas en GPU y `-c` para fijar el contexto. Para vLLM y SGLang el autor remite a la version NVFP4 en un repositorio aparte. No se mencionan Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF (este) | ~27B (metadato del repo: 460.730.096, discrepante) | No disponible | 15/100 rechazos, KL 0,0634 vs Swift | swift-open-license-1.0 | GGUF en este repositorio; NVFP4 en repositorio aparte |
| Swift-Qwen3.8-27B (UkisAI) | No disponible | No disponible | 98/100 rechazos | swift-open-license-1.0 | Pesos del modelo base de la cadena |
| orcarouter/Qwen3.8-27B-Uncensored | No disponible | No disponible | 17/100 rechazos, KL 0,0621 vs Qwen3.8-27B | No disponible | Origen de la direccion de rechazo aplicada |
| Qwen3.8-27B (Qwen) | No disponible | No disponible | No disponible | No disponible | Modelo raiz de toda la cadena |
| unsloth/Qwen3.8-27B-GGUF | No disponible | No disponible | No disponible | No disponible | Fuente de la importance matrix y de la asignacion de tipos por tensor |

La comparacion cuantitativa solo es posible en la metrica de rechazos, porque no hay benchmarks de tarea ni especificaciones de contexto publicadas para las alternativas en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de contenido danino: el modelo es explicitamente "uncensored" y reduce los rechazos de 98/100 a 15/100. Puede generar contenido que el modelo base rechazaria; se desaconseja su uso en aplicaciones orientadas al publico general sin filtrado adicional.
- Perdida de alineacion: la abliteration introduce una divergencia KL de 0,0634 sobre el modelo original. Los efectos secundarios sobre calidad, coherencia y seguridad no se documentan mas alla de esa metrica.
- Idiomas soportados no documentados: al no declararse la lista de idiomas, el rendimiento fuera del ingles o el chino no esta garantizado y deberia validarse antes de usarlo en produccion multilingue.
- Ventana de contexto no publicada: no se especifica la longitud de contexto nativa. El valor 32768 de los ejemplos es configuracion de llama.cpp y no una garantia de calidad en esa longitud.
- Mediciones de rechazo no replicadas en las cuantizaciones: los 15/100 rechazos y el KL 0,0634 corresponden a los pesos BF16. Las versiones Q2 a Q8 pueden degradar el comportamiento, especialmente en IQ1/IQ2.
- Discrepancia de parametros: los metadatos del repositorio declaran 460.730.096 parametros mientras el nombre y el tamano del BF16 sugieren aproximadamente 27B. Conviene verificar el dato antes de dimensionar infraestructura.
- MTP requiere una compilacion especifica de llama.cpp: `--spec-type draft-mtp` necesita soporte para `qwen35`; con compilaciones antiguas la funcionalidad no estara disponible.
- Vision opcional: sin cargar `mmproj-BF16.gguf` el modelo no procesa imagenes ni video.
- Restricciones de licencia: la licencia swift-open-license-1.0 esta heredada de ukisai/Swift-Qwen3.8-27b y se enlaza a la model card original. No se detallan en este repositorio los terminos exactos ni si permiten uso comercial; hay que revisar el texto completo antes de desplegarlo en produccion.
- Plantilla de chat y tokenizador heredados de Unsloth, con `add_bos_token = false`. Una configuracion incorrecta del tokenizador puede degradar las respuestas.
- Contenido de la model card truncado: la seccion sobre tokenizador y plantilla de chat aparece incompleta en la informacion disponible.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Modelo de origen: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Version NVFP4 para vLLM y SGLang: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-NVFP4
- Swift-Qwen3.8-27B (UkisAI): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Qwen3.8-27B (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- orcarouter/Qwen3.8-27B-Uncensored: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- unsloth/Qwen3.8-27B-GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Heretic (herramienta de medicion de rechazos): https://github.com/p-e-w/heretic
- Paper de referencia sobre direcciones de rechazo (Arditi et al. 2024): https://arxiv.org/abs/2406.11717
