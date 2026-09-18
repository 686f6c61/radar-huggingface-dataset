# sasoriiii/test-v2

## Resumen

sasoriiii/test-v2 es un modelo multimodal de tipo image-text-to-text publicado en HuggingFace por el usuario sasoriiii. Se trata de una variante cuantizada y derivada de llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic, que a su vez es un ajuste fino de la familia Qwen3-VL de 32 000 millones de parametros en su variante Instruct. Por las etiquetas del repositorio (qwen3-vl-32b, abliterated, heretic, uncensored) se trata de una version sin mecanismos de rechazo, orientada a generacion de texto e imagenes sin filtros de seguridad incorporados.

El repositorio declara las etiquetas bf16, int8, convrot y quantized, lo que indica que el autor distribuye una o varias versiones comprimidas del modelo base. La libreria asociada es comfyui, por lo que el destino previsto de estos pesos es la integracion en flujos de trabajo de ComfyUI, no un uso directo con transformers o vLLM. El tamano del repositorio es de 85,5 GB, coherente con la distribucion de varias representaciones de un modelo de 32 000 millones de parametros junto con el codificador visual.

La relevancia del modelo es limitada y debe valorarse con cautela: es un repositorio de prueba (el propio identificador incluye "test-v2"), con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia, sin documentacion tecnica publicada, sin resultados de benchmarks y con acceso restringido que exige aceptar condiciones en HuggingFace. No debe considerarse un artefacto validado para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3-VL-32B; sin detalle oficial en la ficha del repositorio |
| Parametros totales | 32 000 millones (inferido del nombre del modelo base Qwen3-VL-32B; no confirmado explicitamente en la ficha) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8 y "convrot" segun las etiquetas del repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explicita; repositorio de 85,5 GB orientado a ComfyUI (libreria declarada: comfyui) |

Otros datos declarados: pipeline image-text-to-text, acceso restringido (gated), region us, modelo base llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic, fecha de creacion y ultima actualizacion 2026-09-18.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF, DPO u otras) en este repositorio. Lo unico deducible es que hereda la arquitectura del modelo base declarado, un transformer multimodal de la familia Qwen3-VL en su variante de 32 000 millones de parametros, capaz de procesar entradas de imagen y texto y de generar texto.

La cadena de derivacion conocida es la siguiente: el repositorio parte de llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic, un ajuste fino de la comunidad etiquetado como heretic, abliterated y uncensored. La abliteracion es una tecnica que identifica y suprime direcciones de activacion asociadas al rechazo de peticiones en el espacio residual del modelo, de modo que la variante resultante responde a instrucciones que el modelo original rechazaria. Sobre esa base, sasoriiii/test-v2 anade una capa de cuantizacion (bf16, int8, convrot) y empaquetado para ComfyUI. No se documenta ninguna innovacion tecnica adicional, ni decodificacion especulativa, ni atencion lineal, ni variantes de atencion alternativas.

## Capacidades

- Generacion de texto e inferencia multimodal image-text-to-text: procesa imagenes junto con instrucciones en lenguaje natural y produce respuestas textuales.
- Descripcion y comprension de imagenes: etiquetado, captioning y respuesta a preguntas sobre el contenido visual, capacidades heredadas del modelo base Qwen3-VL.
- Generacion de texto general y conversacion multi-turno en ingles, en la medida en que el modelo base lo permita (no verificado en esta ficha).
- Comportamiento sin filtros de rechazo: por las etiquetas abliterated, uncensored y heretic, el modelo no incorpora los mecanismos de negativa tipicos de los modelos alineados.
- Distribucion en versiones cuantizadas: bf16, int8 y convrot, pensadas para reducir requisitos de memoria en el despliegue.
- Integracion con ComfyUI: la libreria declarada indica compatibilidad con flujos de trabajo de nodos de ComfyUI.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Etiquetado y captioning masivo de datasets de imagenes: el modelo puede generar descripciones textuales de imagenes en lote dentro de un flujo de ComfyUI, lo que resulta util para construir datasets de entrenamiento o indexar bibliotecas de imagenes. Es adecuado porque la tarea no requiere alineacion estricta y tolera cierto ruido en la salida.
- Generacion de texto alternativo para accesibilidad: integrado en un CMS o en un pipeline de publicacion, el modelo describe cada imagen subida y produce el atributo alt correspondiente. El soporte image-text-to-text es exactamente la capacidad necesaria.
- Extraccion de texto en imagenes (OCR asistido): transcripcion de capturas, documentos escaneados o fotografias de pantallas, con el modelo devolviendo el texto estructurado que se le solicite. Conviene validar la fidelidad caracter a caracter antes de usarlo en produccion, dado que no hay benchmarks publicados.
- Analisis de capturas de interfaz para QA visual: comparar el estado esperado de una UI con la captura real y generar un informe en lenguaje natural de las discrepancias, dentro de un pipeline de pruebas automatizadas.
- Prototipado rapido de asistentes multimodales sin restricciones de contenido: en entornos de investigacion sobre seguridad y alineacion, sirve para estudiar el comportamiento de un modelo abliterado frente a peticiones que un modelo alineado rechazaria. Requiere supervision humana y encaje legal.
- Automatizacion de flujos creativos en ComfyUI: uso del modelo como nodo de descripcion o de decision en grafos que combinan generacion y edicion de imagen, aprovechando que el repositorio esta empaquetado para esa libreria.
- Moderacion o clasificacion de contenido propio: dado que el modelo no incluye sesgos de rechazo, puede emplearse como clasificador de contenido en un corpus controlado, siempre que se defina externamente el criterio de clasificacion.
- Enriquecimiento de bases de datos de producto: a partir de la fotografia de un articulo, generar fichas descriptivas o atributos estructurados, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no declara resultados de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba, y no se han encontrado referencias externas en la busqueda web realizada. Cualquier cifra de rendimiento atribuida a este modelo concreto seria una extrapolacion no verificada del modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (32 000 millones, inferido del nombre del modelo base) y no estan confirmadas por el autor:

- VRAM estimada en bf16: en torno a 64 GB solo para los pesos, mas cache KV y el codificador visual; se recomienda reservar 80 GB o mas.
- VRAM estimada en int8: en torno a 32-35 GB para los pesos, lo que situa el despliegue comodo en GPUs de 40-48 GB.
- VRAM estimada en 4 bits (si se dispusiera de una variante GGUF, no declarada en el repositorio): en torno a 18-20 GB, lo que permitiria ejecucion en GPUs de consumo de 24 GB.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB para int8; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) unicamente con cuantizaciones de 4 bits.
- Cabe en GPU de consumo: solo con cuantizacion agresiva (4 bits) y asumiendo la perdida de calidad correspondiente; en bf16 o int8 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: ComfyUI es el destino declarado por la libreria del repositorio. Para vLLM, TGI o transformers seria necesario verificar que los pesos esten en safetensors y que la arquitectura sea compatible. Para llama.cpp u Ollama se requeriria una conversion a GGUF que no se declara en la informacion disponible.
- Latencia y throughput estimados: no disponible.

Nota: el repositorio ocupa 85,5 GB, un tamano superior al de una unica copia en bf16 de un modelo de 32 000 millones de parametros, lo que sugiere que contiene varias representaciones (bf16, int8, convrot) o ficheros adicionales. Conviene inspeccionar el arbol de ficheros antes de descargar, especialmente por el acceso restringido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado y disponibilidad |
|---|---|---|---|---|---|
| sasoriiii/test-v2 | 32 000 M (inferido) | no disponible | en | apache-2.0 | Repositorio de prueba, 0 descargas, 0 likes, acceso restringido, empaquetado para ComfyUI, sin benchmarks |
| llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic (modelo base) | 32 000 M (inferido) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Es el origen directo de este repositorio; incluye el ajuste abliterado sin la capa de cuantizacion y empaquetado anadida aqui |
| Qwen3-VL-32B-Instruct (familia oficial) | 32 000 M | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Version alineada de referencia de la misma familia; incluye mecanismos de rechazo que este derivado elimina |

No se dispone de datos de benchmarks de ninguna de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros declarados, licencia y estado de publicacion. No se han identificado en la busqueda web otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 likes, repositorio creado y actualizado el mismo dia y nombre con el sufijo "test-v2", lo que indica un artefacto experimental sin uso contrastado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, fidelidad factual ni rendimiento en tareas multimodales. Cualquier decision de adopcion deberia basarse en evaluacion propia.
- Modelo abliterado: la supresion de los mecanismos de rechazo implica que el modelo puede generar contenido danino, ilegal o inseguro sin negarse. Es imprescindible anadir capas de filtrado externas si se expone a usuarios finales.
- Riesgo elevado de alucinacion: al no existir datos de evaluacion y tratarse de un ajuste fino de comunidad sobre un modelo de 32 000 millones, la fidelidad de las descripciones de imagen y de las respuestas textuales no esta garantizada.
- Limitacion idiomatica: el repositorio declara unicamente el ingles. El rendimiento en castellano no esta documentado y podria ser deficiente.
- Longitud de contexto desconocida: no se declara el contexto soportado en esta ficha, por lo que no se puede planificar su uso en tareas que requieran ventanas largas sin verificacion previa.
- Acceso restringido: el modelo esta gated y exige aceptar condiciones en HuggingFace, lo que anade friccion a la descarga y a la reproducibilidad de cualquier evaluacion.
- Licencia: se declara apache-2.0, lo que en principio permite uso comercial, pero el repositorio es un derivado de un ajuste fino de terceros cuyo cumplimiento de la licencia original no se documenta aqui. Conviene verificar la cadena completa de licencias (Qwen3-VL, ajuste de llmfan46 y este derivado) antes de un uso comercial.
- Tamano de descarga elevado: 85,5 GB, con el coste de almacenamiento y de transferencia asociado.
- Soporte de herramientas y agentes no confirmado: no se documenta tool calling, function calling ni razonamiento multi-paso, capacidades que no deben asumirse.
- Compatibilidad limitada: el empaquetado esta orientado a ComfyUI; su uso con vLLM, TGI, Ollama o llama.cpp no esta documentado y podria requerir conversion manual.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sasoriiii/test-v2
- Modelo base declarado: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante. Las unicas entradas devueltas corresponden a portales institucionales de la gobernacion de Asuan (Egipto) y no guardan relacion con el modelo, con Qwen3-VL ni con cuantizacion de modelos de lenguaje. No se dispone por tanto de paper, blog, repositorio de codigo ni demo asociados a este modelo.
