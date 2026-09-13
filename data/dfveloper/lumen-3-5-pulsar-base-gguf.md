# DFveloper/Lumen-3.5-Pulsar-Base-GGUF

## Resumen

Lumen-3.5-Pulsar-Base-GGUF es un repositorio de pesos cuantizados en formato GGUF publicado por el usuario DFveloper en Hugging Face. El nombre sugiere la existencia de un modelo subyacente denominado "Lumen 3.5 Pulsar", en su variante "Base", pero la pagina no incluye model card, descripcion, pipeline declarado, composicion del dataset de entrenamiento ni informacion sobre el proceso de alineacion. El unico dato objetivo de tamano es el recuento de parametros registrado en safetensors: 25.233.142.046 parametros, aproximadamente 25,2 mil millones.

El repositorio ocupa 14,3 GB, un tamano coherente con una cuantizacion de 4-5 bits por peso para un modelo denso de ese orden de magnitud. Esto situa el artefacto en la categoria de modelos de tamano medio que pueden ejecutarse en una unica GPU de gama alta para consumo o en GPUs profesionales de 40-80 GB. Los metadatos declaran compatibilidad con endpoints (etiqueta `endpoints_compatible`) y naturaleza conversacional (etiqueta `conversational`), lo que contradice parcialmente el sufijo "Base" del nombre, asociado habitualmente a modelos preentrenados sin ajuste de instrucciones.

La relevancia practica de esta ficha debe interpretarse con cautela: el repositorio acumula 15 descargas y 0 "me gusta", no declara licencia, no publica resultados de evaluacion y no cuenta con documentacion del autor. La busqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo. Cualquier evaluacion tecnica seria exige descargar los pesos y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 25.233.142.046 (aproximadamente 25,2 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el repositorio ocupa 14,3 GB, compatible con cuantizaciones de 4-5 bits por peso, pero no se detallan los niveles concretos publicados |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (el recuento de parametros procede de safetensors del modelo de origen) |

## Arquitectura y entrenamiento

No se ha publicado informacion verificable sobre la arquitectura. La unica referencia es el nombre del repositorio: "Lumen" seria el nombre del proyecto, "3.5" una version de la familia, "Pulsar" una designacion de variante o de tamano, y "Base" indicaria un modelo preentrenado sin ajuste por instrucciones. Esta lectura es una hipotesis derivada de la nomenclatura y no una confirmacion del autor. La etiqueta `conversational` asociada al repositorio apunta en la direccion contraria, ya que suele emplearse en modelos ajustados para dialogo.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o arquitecturas hibridas. El autor no ha publicado paper, blog tecnico ni repositorio de codigo asociado. El formato de publicacion es exclusivamente GGUF, lo que implica que el modelo fue cuantizado a partir de pesos de mayor precision (presumiblemente safetensors, dado el recuento de parametros disponible) y que no se distribuyen los pesos originales en este repositorio.

## Capacidades

- Generacion de texto: capacidad presumible por tratarse de un modelo de lenguaje de 25,2 mil millones de parametros, pero no confirmada por el autor ni respaldada por ejemplos en la model card.
- Conversacion multi-turno: la etiqueta `conversational` sugiere soporte de dialogo, sin que se especifique la plantilla de chat aplicada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Capacidades multimodales (vision, audio): no disponible; el repositorio solo contiene pesos de lenguaje en formato GGUF.
- Tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo "thinking" o decodificacion con razonamiento explicito: no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato de pesos es admisible por la infraestructura de Hugging Face Inference Endpoints.

## Casos de uso

- Asistente conversacional autoalojado: el formato GGUF permite desplegar el modelo en infraestructura propia sin dependencia de APIs externas, lo que resulta adecuado para organizaciones con requisitos de soberania de datos. Requiere validar previamente la calidad conversacional, no documentada.
- Procesamiento de texto en entornos con GPU de gama alta para consumo: una cuantizacion de 4 bits de un modelo de 25B cabe en GPUs con 24 GB de VRAM, lo que habilita prototipado local de asistentes y herramientas de redaccion asistida.
- Clasificacion y extraccion de informacion en lote: se puede emplear como motor de inferencia en procesos por lotes sobre corpus documentales, siempre que la longitud de contexto (no publicada) sea suficiente para los documentos objetivo.
- Base para ajuste fino adicional: si el modelo subyacente es realmente una variante "Base" preentrenada, podria servir como punto de partida para ajuste supervisado o LoRA en dominios verticales, aunque la ausencia de licencia clara impide confirmar que ello este permitido.
- Evaluacion comparativa interna: dado que no existen benchmarks publicos, un uso razonable es incluirlo en baterias de evaluacion propias frente a otros modelos de ~25B para medir calidad real en tareas concretas.
- Generacion aumentada por recuperacion (RAG) en local: el modelo puede integrarse en pipelines que inyecten contexto recuperado de una base vectorial, con la salvedad de que se desconoce la ventana de contexto efectiva.
- Traduccion y reescritura de textos: plausible para un modelo de este tamano, pero sin confirmacion de cobertura idiomatica; requiere validacion empirica antes de usarlo en produccion.
- Servicio de inferencia mediante llama.cpp o servidores compatibles con GGUF: permite exponer el modelo como API HTTP interna con requisitos de memoria moderados en comparacion con pesos en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra bateria, y la busqueda web no ha devuelto ninguna evaluacion independiente del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 50,5 GB solo para pesos, mas cache KV. Requiere GPUs profesionales tipo A100 80 GB o H100.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 27 GB de pesos, viable en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- VRAM estimada en cuantizacion de 5 bits: aproximadamente 18 GB de pesos, viable en RTX 4090 24 GB o L4 24 GB con contexto reducido.
- VRAM estimada en cuantizacion de 4 bits (coherente con el tamano del repositorio, 14,3 GB): aproximadamente 15-16 GB de pesos, mas cache KV. Cabe en RTX 4090, RTX 4080 Super 16 GB con margen ajustado, y en GPUs de 24 GB con comodidad.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 5090 o equivalentes con 24 GB o mas en cuantizaciones de 4-5 bits. En GPUs de 16 GB el margen depende del nivel de cuantizacion y de la longitud de contexto efectiva.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio son las rutas naturales por tratarse de GGUF; llama-cpp-python para integracion en Python; text-generation-webui. vLLM ofrece soporte GGUF experimental y TGI no soporta GGUF de forma nativa, por lo que su uso requeriria convertir los pesos a safetensors (no incluidos en el repositorio).
- Latencia y throughput: no se han publicado mediciones. Como orientacion general para un modelo denso de 25B a 4 bits en una GPU de 24 GB, cabria esperar decenas de tokens por segundo en generacion individual, pero este dato no procede de ninguna medicion publicada del modelo y no debe tomarse como referencia de rendimiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto del modelo analizado, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Los datos de la columna "Lumen-3.5-Pulsar-Base" son los unicos verificados en el repositorio; el resto se ofrece como referencia publica de modelos de tamano comparable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lumen-3.5-Pulsar-Base-GGUF | 25,2 mil millones | no disponible | no disponible | solo GGUF en Hugging Face |
| Mistral Small 3 (24B) | 24 mil millones | 32.000 tokens | Apache 2.0 | pesos base e instrucciones, amplio ecosistema |
| Qwen2.5-32B | 32,5 mil millones | 131.072 tokens | Apache 2.0 | pesos base e instrucciones, amplio ecosistema |
| Gemma 2 27B | 27 mil millones | 8.192 tokens | Licencia Gemma | pesos base e instrucciones, con restricciones de uso |

La comparacion de rendimiento no es posible porque el modelo analizado carece de evaluaciones publicadas. La diferencia mas relevante frente a las alternativas es la opacidad: los tres modelos de referencia cuentan con model card detallada, licencia explicita y metricas publicadas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan arquitectura, datos de entrenamiento, proceso de alineacion ni plantilla de chat, lo que impide reproducir o auditar el modelo.
- Licencia no declarada: sin terminos de uso explicitos, no es posible determinar si se permite el uso comercial. En la practica, debe asumirse que el uso en produccion conlleva riesgo legal hasta que el autor aclare la licencia.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, y no cuantificado en este caso por la falta de evaluaciones.
- Sesgos desconocidos: al no documentarse la composicion del corpus de entrenamiento, no hay forma de estimar sesgos de genero, raza, idioma o ideologia.
- Cobertura idiomatica desconocida: no se declara lista de idiomas; el rendimiento en castellano es una incognita que debe medirse.
- Longitud de contexto desconocida: impide planificar su uso en tareas de documento largo o conversaciones extensas sin pruebas previas.
- Contradiccion en la nomenclatura: el sufijo "Base" frente a la etiqueta `conversational` introduce incertidumbre sobre si el modelo responde correctamente a instrucciones o requiere un ajuste previo.
- Adopcion practicamente nula: 15 descargas y 0 "me gusta" implican ausencia de validacion por parte de la comunidad y de informes de errores.
- Distribucion solo en GGUF: no se publican pesos en safetensors, lo que dificulta el ajuste fino y el despliegue en servidores de alto rendimiento que no soportan este formato.
- Fecha de creacion y actualizacion muy proximas (13 de septiembre de 2026, con dos minutos de diferencia): sugiere una subida sin trabajo posterior de documentacion o mantenimiento.
- Verificacion recomendada antes de cualquier uso productivo: descargar los pesos, comprobar la plantilla de prompt, medir la ventana de contexto real y evaluar la calidad en las tareas objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/DFveloper/Lumen-3.5-Pulsar-Base-GGUF
- Perfil del autor: https://huggingface.co/DFveloper
- Paper: no disponible
- Blog tecnico: no disponible
- Repositorio de codigo: no disponible
- Demos: no disponible
- Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo (contenido sobre honorarios de abogados en Emiratos Arabes Unidos), por lo que no se incluyen como fuentes.
