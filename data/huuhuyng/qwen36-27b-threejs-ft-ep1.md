# huuhuyng/qwen36-27b-threejs-ft-ep1

## Resumen

qwen36-27b-threejs-ft-ep1 es un modelo multimodal de tipo image-text-to-text publicado por el usuario huuhuyng en HuggingFace. Se trata de un derivado afinado (fine-tune) de la familia Qwen3.6, construido a partir de una cadena de derivaciones que pasa por Qwen/Qwen3.6-27B, Tooony133/Qwen-3.6-27B-SkinnyPete y computer-vision-ai-lab/Qwen-3.6-27B-UmberShrike, que es su modelo base directo declarado. Los pesos se almacenan en FP8 mediante el formato compressed-tensors y suman 27.781.427.952 parametros totales, con un repositorio de 31,2 GB.

El problema que aborda es el de la especializacion: el sufijo del identificador ("threejs-ft-ep1") apunta a un ajuste fino orientado a tareas relacionadas con Three.js, la biblioteca JavaScript de renderizado 3D, si bien la model card no documenta el dataset, el procedimiento ni el objetivo concreto del entrenamiento. La relevancia de la ficha es principalmente practica: permite saber que existe una variante FP8 de 27B con entrada de imagen lista para desplegar con transformers, con licencia Apache-2.0 y compatible con endpoints.

La informacion publicada es muy escasa: no se declaran idiomas soportados, ni longitud de contexto, ni resultados de benchmarks, ni detalles de entrenamiento. La model card se limita a trazar la genealogia del modelo, indicar el almacenamiento en FP8 y remitir a los ficheros NOTICE y LICENSE. Cualquier dato no presente en esa informacion se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de libreria qwen3_5; derivado de la familia Qwen3.6; sin detalle de si es transformer denso, MoE o hibrida) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 mediante compressed-tensors (formato de los pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (contenedor compressed-tensors, FP8) |

Datos adicionales: pipeline declarado image-text-to-text; biblioteca transformers; tamano del repositorio 31,2 GB; etiquetas relevantes endpoints_compatible, conversational y region:us; 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 2026-10-03.

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo. La model card no describe el tipo de bloque (transformer denso, mixture-of-experts, SSM o hibrido), ni la atencion utilizada, ni el tokenizador. La unica pista es la etiqueta `qwen3_5` asociada al repositorio, que sugiere una pertenencia a la linea Qwen3.5/Qwen3.6, y el pipeline `image-text-to-text`, que confirma que el modelo acepta imagenes ademas de texto. El recuento real de parametros leidos de los ficheros safetensors es de 27.781.427.952, coherente con la denominacion "27B" de la cadena de modelos base.

Respecto al entrenamiento, la informacion publicada es minima. Se sabe que es un fine-tune derivado de Qwen/Qwen3.6-27B pasando por Tooony133/Qwen-3.6-27B-SkinnyPete y computer-vision-ai-lab/Qwen-3.6-27B-UmberShrike, y que los pesos resultantes se almacenan en FP8. No consta el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o preferencias, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica ademas que existe un fichero `NOTICE` con el aviso de cambios, que no se ha incluido en la informacion disponible. Por el nombre del repositorio, el ajuste parece orientado a tareas vinculadas a Three.js, pero esto es una inferencia a partir del identificador y no un dato confirmado por el autor.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta preparado para dialogos multi-turno.
- Entrada multimodal de imagen y texto: el pipeline `image-text-to-text` implica que acepta imagenes junto con instrucciones textuales y produce texto.
- Generacion de codigo: no documentada explicitamente, pero plausible por herencia de la familia Qwen3.6 y por el sufijo "threejs" del nombre; no confirmada en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Modo de pensamiento (thinking mode): no disponible.
- Capacidades de audio o video: no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace.

## Casos de uso

- Asistente conversacional con entrada visual: el modelo puede recibir una captura de pantalla o una imagen junto a una pregunta en lenguaje natural y responder en texto, aprovechando su naturaleza image-text-to-text. Es adecuado para interfaces de soporte donde el usuario adjunta una imagen del problema.
- Apoyo a desarrollo con Three.js: dado el nombre del repositorio, el uso mas directo seria asistir en la escritura de escenas, materiales, luces y shaders de Three.js a partir de descripciones o de referencias visuales. Advertencia: esta orientacion no esta confirmada por la model card.
- Analisis de imagenes con descripcion textual: generacion de pies de foto, resumenes de contenido visual o extraccion de informacion de diagramas y capturas, usables en pipelines de catalogacion de contenido.
- Prototipado rapido con licencia permisiva: al estar bajo Apache-2.0 y en FP8, permite montar prototipos internos y demos sin negociar licencias, siempre que el rendimiento real se valide antes de pasar a produccion.
- Evaluacion comparativa de fine-tunes de la familia Qwen3.6: util como punto de referencia en experimentos que comparen derivados de Qwen3.6-27B, dado que declara su cadena de modelos base.
- Generacion de codigo asistida por contexto visual: si el modelo hereda las capacidades de codigo de su familia, podria convertir maquetas o capturas de interfaces en fragmentos de codigo; requiere verificacion empirica por parte del usuario.
- Despliegue en infraestructura con GPU de 40-80 GB: al publicarse en FP8, encaja en entornos que ya disponen de aceleradores Ampere o Hopper sin necesidad de reconvertir pesos.
- Investigacion sobre cuantizacion FP8: el repositorio sirve como ejemplo de publicacion de pesos en formato compressed-tensors listos para vLLM u otros motores compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se declaran valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni para este modelo ni para los modelos de su cadena de derivacion.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros y del formato declarado, no datos publicados por el autor.

- VRAM para pesos en FP8: aproximadamente 27,8 GB solo para los pesos, mas cache KV y activaciones; en la practica se recomienda disponer de 35-45 GB para contextos moderados. El repositorio ocupa 31,2 GB.
- VRAM si se reconvierte a BF16: aproximadamente 55,6 GB de pesos, lo que exige 80 GB o reparto en varias GPU.
- VRAM en cuantizaciones de 4 bits (no publicadas, requeriria conversion): del orden de 15-18 GB de pesos, lo que permitiria ejecucion en GPU de 24 GB.
- GPU recomendadas para FP8: H100 80 GB, A100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En A100 40 GB el margen es muy ajustado y puede requerir reducir contexto o usar tensor parallelism.
- GPU de consumo: en FP8 no cabe en RTX 4090 ni RTX 3090 de 24 GB sin cuantizacion adicional; con una conversion a 4 bits si seria viable en 24 GB, a costa de perdida de calidad no medida.
- Opciones de despliegue: transformers (biblioteca declarada), vLLM y SGLang (soportan compressed-tensors FP8), TGI y HuggingFace Inference Endpoints (etiqueta endpoints_compatible). No se incluyen pesos GGUF en el repositorio, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huuhuyng/qwen36-27b-threejs-ft-ep1 | 27,78B | no disponible | no disponible | Apache-2.0 | FP8 safetensors, 31,2 GB |
| computer-vision-ai-lab/Qwen-3.6-27B-UmberShrike (base directo) | no disponible | no disponible | no disponible | Apache-2.0 segun la cadena declarada | no disponible |
| Tooony133/Qwen-3.6-27B-SkinnyPete (paso intermedio) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.6-27B (origen de la cadena) | 27B segun denominacion | no disponible | no disponible | Apache-2.0 (enlace de licencia apuntado en la model card) | no disponible |

No se dispone de datos publicados de contexto, rendimiento ni licencia de los modelos de la cadena mas alla de lo indicado, por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o equidad.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay mediciones de fidelidad factual ni de tasa de alucinacion en la informacion disponible.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y la cobertura idiomatica, lo que impide garantizar un comportamiento correcto en conversaciones largas o en idiomas distintos del ingles.
- Especializacion no documentada: el sufijo "threejs" sugiere un ajuste orientado a ese dominio, pero no hay evidencia publicada; un fine-tune de este tipo puede degradar capacidades generales respecto al modelo base, sin que existan benchmarks que lo cuantifiquen.
- Licencia: Apache-2.0 permite uso comercial, pero la model card apunta a un enlace de licencia del modelo Qwen original y menciona un fichero `NOTICE` con avisos de cambios que no se ha facilitado; conviene revisar ambos antes de un despliegue en produccion.
- Trazabilidad limitada: la cadena de derivaciones incluye dos modelos intermedios de terceros cuyos terminos y calidad no se detallan.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Cuantizacion FP8: puede introducir perdida de precision frente a los pesos originales; no se ha publicado ninguna comparacion entre ambas versiones.
- Sin datos de produccion: no hay informacion sobre latencia, throughput, estabilidad en contextos largos ni comportamiento en tool calling, por lo que no se recomienda su uso en produccion sin una evaluacion propia previa.

## Enlaces

- HuggingFace: https://huggingface.co/huuhuyng/qwen36-27b-threejs-ft-ep1
- Modelo base directo: https://huggingface.co/computer-vision-ai-lab/Qwen-3.6-27B-UmberShrike
- Paso intermedio de la cadena: https://huggingface.co/Tooony133/Qwen-3.6-27B-SkinnyPete
- Modelo origen de la familia: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia referenciada en la model card: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
