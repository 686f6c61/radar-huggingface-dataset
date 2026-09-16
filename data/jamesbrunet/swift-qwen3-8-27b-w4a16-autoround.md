# jamesbrunet/Swift-Qwen3.8-27b-W4A16-AutoRound

## Resumen

Swift-Qwen3.8-27b-W4A16-AutoRound es una cuantizacion de pesos publicada por el usuario jamesbrunet sobre el modelo base ukisai/Swift-Qwen3.8-27b. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado: el autor ha aplicado la receta de cuantizacion de Intel AutoRound en esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) y ha empaquetado el resultado con el formato compressed-tensors, verificado en vLLM. El pipeline declarado es image-text-to-text, por lo que el modelo base conserva capacidad de entrada de imagen y texto, y los tags apuntan a la familia Qwen3 (qwen3, qwen3_5) con uso conversacional.

El interes practico de esta ficha es distinto al de un modelo nuevo: aqui el valor esta en la reduccion de huella de memoria y en la compatibilidad con vLLM. El autor indica que copio la receta de dbirks/Qwen3.8-27B-W4A16-AutoRound con una diferencia concreta: mantiene los embeddings sin cuantizar, lo que suele mejorar la estabilidad numerica a costa de unos cientos de megabytes adicionales.

Hay una discrepancia importante que conviene senalar desde el principio: el nombre del repositorio indica "27b", mientras que el recuento real de parametros en los ficheros safetensors es de 6.260.690.960 (unos 6,26 mil millones). Ademas, el tamano del repositorio es de 19,5 GB, superior a lo esperable para un modelo de 6,26 B en 4 bits. No hay informacion publicada que explique esta diferencia, por lo que las estimaciones de hardware de esta ficha se ofrecen como rangos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; el model card y los tags remiten a la familia Qwen3 (qwen3, qwen3_5) con pipeline image-text-to-text (modelo multimodal) |
| Parametros totales | 6.260.690.960 (~6,26 mil millones) segun el recuento de safetensors; el nombre del repositorio indica "27b", discrepancia no aclarada |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4, esquema W4A16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors; embeddings sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (campo license: other); texto en https://ukisai.com/news/introducing-swift |
| Formato de pesos | safetensors con compressed-tensors; compatible con vLLM y transformers |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino una cuantizacion post-entrenamiento (PTQ) del modelo base ukisai/Swift-Qwen3.8-27b. La tecnica empleada es Intel AutoRound, un metodo de redondeo de pesos que optimiza de forma conjunta el redondeo y los umbrales de recorte mediante descenso de gradiente sobre signos, en lugar de aplicar un redondeo al mas cercano. El resultado se serializa en el formato compressed-tensors, que permite a vLLM y a transformers reconstruir las matrices cuantizadas en tiempo de carga. Segun el propio autor, la receta es identica a la de dbirks/Qwen3.8-27B-W4A16-AutoRound, con la unica variacion de dejar los embeddings sin cuantizar.

No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, dimension oculta, tipo de atencion, presencia de decodificacion especulativa), ni sobre el dataset de entrenamiento, el numero de tokens o si hubo fases de RLHF o DPO. Tampoco se documenta el proceso de calibracion de la cuantizacion: no se indica el conjunto de calibracion, el tamano de grupo ni el numero de muestras usadas. El unico dato de validacion aportado es cualitativo ("It appears to work!"), sin metricas de perplejidad ni evaluaciones comparativas frente al modelo sin cuantizar.

## Capacidades

- Generacion de texto y uso conversacional: el tag conversational y el pipeline declarado indican soporte de dialogos multi-turno, con plantilla de chat heredada del modelo base.
- Entrada multimodal imagen-texto: el pipeline image-text-to-text implica que el modelo puede recibir imagenes junto con texto y producir respuestas en lenguaje natural, presumiblemente mediante un codificador visual acoplado al transformer de lenguaje.
- Inferencia eficiente en vLLM: la cuantizacion W4A16 con compressed-tensors esta pensada para ejecutarse en vLLM, lo que permite servir el modelo con API compatible con OpenAI y procesamiento por lotes continuo.
- Reduccion de huella de memoria: los pesos en 4 bits disminuyen el uso de VRAM frente al modelo en precision completa, manteniendo activaciones en 16 bits para preservar parte de la precision numerica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse en vLLM sobre una GPU propia para dar servicio de chat a un equipo interno, evitando enviar datos a APIs de terceros. La cuantizacion W4A16 reduce el coste por instancia, lo que hace viable mantener el servicio en hardware de gama media.
- Comprension de capturas de pantalla y documentos escaneados: al aceptar entrada de imagen, puede usarse para extraer informacion estructurada de facturas, formularios o interfaces de usuario capturadas, devolviendo JSON o texto normalizado para su volcado posterior en una base de datos.
- Generacion automatica de texto alternativo para accesibilidad: integrado en un CMS, el modelo puede describir imagenes subidas por los usuarios y generar descripciones breves que alimenten el atributo alt, reduciendo el trabajo manual de revision.
- Anotacion y etiquetado asistido de conjuntos de datos visuales: en un pipeline de etiquetado, el modelo propone etiquetas o descripciones iniciales que un anotador humano valida, acelerando la construccion de datasets propios.
- Prototipado rapido de producto multimodal: gracias a la compatibilidad con transformers y vLLM, un equipo puede levantar un endpoint compatible con OpenAI en minutos para validar una idea de producto que combine imagen y texto, antes de decidir si migra a un modelo mayor.
- Moderacion y clasificacion de contenido en lote: el formato compressed-tensors y el soporte de vLLM permiten procesar grandes volumenes de imagenes y textos con procesamiento por lotes, generando puntuaciones o categorias para colas de revision.
- Evaluacion comparativa de tecnicas de cuantizacion: al ser una cuantizacion con embeddings sin cuantizar y receta publicada, sirve como referencia para investigadores que quieran medir el impacto de AutoRound W4A16 frente al modelo base o frente a otras recetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y se limita a indicar que el modelo "parece funcionar" tras probarlo en vLLM. Tampoco se aportan datos de perplejidad, comparaciones frente al modelo base sin cuantizar ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: existe una discrepancia no resuelta entre el nombre del repositorio (27b) y el recuento real de parametros (6,26 B). Si se toma el recuento de safetensors, los pesos en 4 bits ocuparian unos 3,1 GB, mas aproximadamente 1,2 GB de embeddings sin cuantizar y el sobrecoste de escalas y desplazamientos, lo que situa el modelo en torno a 5-6 GB de VRAM mas la cache KV. Si el modelo real fuese de ~27 B, los pesos en 4 bits rondarian los 13-14 GB y el total se acercaria a los 15-17 GB, mas cache KV. El tamano del repositorio (19,5 GB) es mas coherente con el segundo escenario.
- GPU recomendadas: en el escenario de 6,26 B, una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o L4 serian suficientes. En el escenario de ~27 B, se necesitaria una RTX 3090 o RTX 4090 de 24 GB como minimo, y serian preferibles A100 40 GB, L40S o H100 para servir con contexto largo y lotes grandes.
- Cabe en GPU de consumo: probablemente si en el escenario de 6,26 B (RTX 3060 12 GB en adelante). En el escenario de 27 B, cabe por pesos en una RTX 3090/4090 de 24 GB, pero el margen para cache KV y contexto sera ajustado.
- Opciones de despliegue: vLLM es la via validada por el autor. Tambien deberia funcionar con transformers al ser el library_name declarado y usar compressed-tensors. No hay confirmacion de soporte en llama.cpp, Ollama, TGI o TensorRT-LLM, ya que el formato compressed-tensors no es directamente compatible con GGUF sin una conversion adicional.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo, tiempo hasta el primer token ni curvas de escalado con el tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jamesbrunet/Swift-Qwen3.8-27b-W4A16-AutoRound | 6,26 B segun safetensors (nombre indica 27b) | no disponible | int4 W4A16, embeddings sin cuantizar | swift-open-license-1.0 | HuggingFace, 0 descargas, 1 like |
| dbirks/Qwen3.8-27B-W4A16-AutoRound | no disponible | no disponible | int4 W4A16 AutoRound | no disponible en la informacion facilitada | HuggingFace (referenciado como origen de la receta) |
| ukisai/Swift-Qwen3.8-27b | no disponible (modelo base sin cuantizar) | no disponible | sin cuantizar | swift-open-license-1.0 | HuggingFace (modelo base declarado) |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y relacion de derivacion. No se han identificado en la busqueda web modelos alternativos comparables.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: el nombre del repositorio sugiere 27 B, mientras que el recuento de safetensors es de 6,26 B. Cualquier planificacion de hardware basada en el nombre puede ser incorrecta, y viceversa.
- Sin evaluacion publicada: no hay benchmarks, perplejidad ni comparacion con el modelo base. El autor solo afirma que "parece funcionar", lo que no constituye evidencia de calidad.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 4 bits puede degradar tareas sensibles a la precision numerica, como matematicas, razonamiento largo o generacion de codigo. No se han publicado mediciones de esa degradacion.
- Embeddings sin cuantizar: aunque suele favorecer la estabilidad, incrementa el uso de memoria y hace que el perfil de VRAM no coincida con el de otras cuantizaciones W4A16 del mismo modelo.
- Idiomas no declarados: el campo de idiomas no esta cumplimentado, por lo que no hay garantia de cobertura multilingue ni de calidad en castellano.
- Licencia restrictiva y ambigua: el modelo se distribuye bajo swift-open-license-1.0, con el campo license marcado como "other". El propio autor advierte de que no es abogado y que la cuantizacion "probablementehereda" esos terminos. Antes de un uso comercial es imprescindible revisar el texto de la licencia en ukisai.com y, si procede, recabar asesoramiento legal.
- Trazabilidad limitada del proceso de cuantizacion: no se documenta el conjunto de calibracion, el tamano de grupo ni la configuracion exacta de AutoRound, lo que dificulta reproducir el resultado o auditar su comportamiento.
- Riesgo de alucinacion: no disponible de forma especifica para este modelo, pero es un riesgo inherente a cualquier modelo generativo y no se ha caracterizado en esta cuantizacion.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, sin issues ni discusion publica que permitan contrastar problemas de ejecucion.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, su autor o su licencia: los resultados obtenidos eran consultas no relacionadas sobre verificacion telefonica, WhatsApp y PotPlayer, por lo que no aportan informacion utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jamesbrunet/Swift-Qwen3.8-27b-W4A16-AutoRound
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Receta de cuantizacion de referencia: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Licencia Swift Open License v1.0: https://ukisai.com/news/introducing-swift
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
