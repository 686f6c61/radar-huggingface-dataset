# dicta-il/dictabert-syntax

## Resumen

DictaBERT-syntax es un modelo de análisis sintáctico de dependencias (dependency parsing) para hebreo moderno, publicado por el grupo dicta-il y distribuido en HuggingFace. Se trata de un ajuste fino de la familia DictaBERT sobre la tarea de extracción de árboles de dependencias: dado un texto en hebreo, el modelo devuelve para cada palabra su cabeza de dependencia, el índice de esa cabeza y la función sintáctica (por ejemplo `nsubj`, `obj`, `obl`, `amod`, `conj`). El modelo se documenta en el artículo «MRL Parsing without Tears: The Case of Hebrew» (arXiv:2403.06970) y la familia base en «DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew» (arXiv:2308.16687).

Técnicamente es un transformer encoder de tipo BERT con pesos en safetensors y 183.930.034 parámetros totales, con un repositorio de 2,9 GB. No es un modelo generativo ni multimodal: su pipeline declarado en el Hub es `feature-extraction` y requiere `trust_remote_code=True`, ya que incorpora código personalizado con un método `predict` que devuelve directamente el árbol de dependencias en formato JSON. Está entrenado exclusivamente para hebreo (`he`) y se publica bajo licencia CC BY 4.0.

Su relevancia es de nicho pero clara: el hebreo es una lengua con relativamente pocos recursos de PLN de calidad, y disponer de un parser de dependencias ajustado y listo para usar facilita tareas de anotación de corpus, extracción de información, búsqueda semántica y preprocesado lingüístico. No obstante, la información pública disponible es escasa: el modelo acumula 24 descargas y 1 «like», no se han publicado resultados numéricos de benchmarks en la información consultada y la longitud de contexto no está documentada, por lo que conviene validarlo en el dominio concreto antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con cabeza de analisis de dependencias (codigo personalizado) |
| Parametros totales | 183.930.034 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (libreria PyTorch/transformers); el repositorio ocupa 2,9 GB |

Datos adicionales: autor `dicta-il`; pipeline `feature-extraction`; etiquetas `transformers`, `pytorch`, `safetensors`, `bert`, `custom_code`, `text-embeddings-inference`, `region:us`; fecha de creacion 2024-01-09; ultima actualizacion 2026-09-15.

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un BERT ajustado para la tarea de analisis sintactico de dependencias, con soporte de codigo personalizado (`trust_remote_code=True`). El modelo expone un metodo `predict` que acepta una lista de frases y un tokenizador, y devuelve una lista de objetos con dos claves: `tree`, que contiene por cada palabra los campos `word`, `dep_head_idx`, `dep_func` y `dep_head`, y `root_idx`, que indica la posicion de la raiz de la oracion. El ejemplo de la model card muestra funciones de dependencia como `root`, `nsubj`, `obj`, `obl`, `nmod`, `amod`, `case`, `compound`, `flat`, `conj` y `xcomp`, coherentes con un esquema tipo Universal Dependencies.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO u otras. El articulo asociado (arXiv:2403.06970, «MRL Parsing without Tears: The Case of Hebrew») describe el metodo de analisis empleado, pero sus detalles tecnicos no estan recogidos en la informacion consultada. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal, que no resultan aplicables a un encoder de este tipo.

## Capacidades

- Analisis sintactico de dependencias en hebreo: genera arboles de dependencias con cabeza, indice de cabeza y funcion sintactica para cada palabra.
- Identificacion de la raiz oracional (`root_idx`) y de relaciones de coordinacion, subordinacion, modificacion y complementacion.
- Procesamiento por lotes: el metodo `predict` acepta una lista de frases y un tokenizador.
- Extraccion de caracteristicas (`feature-extraction`): los pesos del encoder pueden emplearse como representaciones contextuales para otras tareas descendentes en hebreo.
- Tokenizacion de texto hebreo mediante el tokenizador asociado al modelo.
- No dispone de generacion de texto, razonamiento libre, codigo, matematicas ni traduccion como capacidades propias.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo hebreo.
- No incluye modo «thinking», vision, audio ni ninguna otra modalidad.

## Casos de uso

- Anotacion de corpus en hebreo: el modelo puede aplicarse sobre grandes colecciones de texto para generar arboles de dependencias de forma automatica, reduciendo el coste de construir treebanks anotados manualmente.
- Extraccion de informacion estructurada: a partir del arbol de dependencias se pueden derivar tripletas sujeto-verbo-objeto y relaciones nominales, utiles para poblar bases de datos o grafos de conocimiento a partir de prensa o documentacion en hebreo.
- Mejora de motores de busqueda en hebreo: la estructura sintactica permite desambiguar consultas y documentos mas alla de la coincidencia de palabras clave, por ejemplo distinguiendo quien realiza la accion sobre quien.
- Preprocesado para traduccion automatica: el arbol de dependencias sirve como representacion intermedia para reordenar constituyentes y alinear estructuras entre el hebreo y lenguas con orden distinto.
- Herramientas educativas de gramatica hebrea: el resultado JSON con funcion sintactica por palabra puede alimentar interfaces que expliquen la estructura de una oracion a estudiantes.
- Analisis de documentacion legal, administrativa o religiosa en hebreo: el parser permite segmentar y anotar clausulas y relaciones entre entidades en corpus especializados.
- Preprocesado para sintesis de voz (TTS) y sistemas de dialogo: la estructura sintactica aporta informacion de agrupacion y prosodia que mejora la naturalidad de la sintesis en hebreo.
- Evaluacion y comparacion de parsers: el modelo puede emplearse como referencia o linea base en experimentos academicos sobre analisis sintactico del hebreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el modelo como «state-of-the-art» para hebreo moderno, pero no incluye cifras de UAS, LAS ni de ninguna otra metrica, ni comparaciones numericas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 183,9 M de parametros, lo que equivale aproximadamente a 0,74 GB en FP32 y 0,37 GB en FP16, a lo que hay que sumar activaciones y el coste del tokenizador y del codigo personalizado. En la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100; no se requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos 4 GB de VRAM; tambien puede ejecutarse en CPU para volumenes moderados.
- Opciones de despliegue: libreria `transformers` de PyTorch con `AutoModel.from_pretrained(..., trust_remote_code=True)`; el tag del repositorio incluye `text-embeddings-inference`. No se documentan soportes para llama.cpp, Ollama, vLLM ni TGI, y por tratarse de un encoder con codigo personalizado no son opciones directas.
- Latencia y throughput estimados: no disponible.
- Nota de despliegue: la model card declara `inference: false`, por lo que el widget de inferencia del Hub no esta habilitado para este repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. La comparacion cuantitativa con alternativas de analisis sintactico del hebreo (por ejemplo otros modelos de la propia familia DictaBERT o el modelo AlephBERT) no puede realizarse con cifras.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| dicta-il/dictabert-syntax | 183.930.034 | no disponible | CC BY 4.0 | no disponible |
| Otros ajustes de la familia DictaBERT (coleccion oficial) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de PLN para hebreo (por ejemplo AlephBERT) | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, la familia DictaBERT se presenta como una suite de modelos BERT para hebreo moderno con ajustes especificos por tarea; este repositorio concreto corresponde a la tarea de analisis sintactico de dependencias.

## Limitaciones y advertencias

- Idioma unico: solo procesa hebreo; no tiene capacidades multilingues ni traduccion.
- No es generativo: no puede emplearse para chat, redaccion, resumen, codigo ni matematicas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor del repositorio; conviene revisarlo antes de desplegarlo en entornos productivos.
- La model card declara `inference: false`, de modo que no hay demo de inferencia en el Hub.
- Longitud de contexto no documentada: existe riesgo de truncamiento silencioso en frases o documentos largos, y no se especifica como se gestionan.
- No se documenta la composicion del corpus de entrenamiento, por lo que se desconoce su cobertura de dominios (prensa, literatura, habla coloquial, textos legales, etc.).
- Riesgo de errores en oraciones ambiguas, con estructuras poco frecuentes o con vocabulario fuera del dominio de entrenamiento; no se han publicado cifras de error.
- Riesgo de sesgos heredados del corpus hebreo utilizado, no cuantificado en la informacion disponible.
- Adopcion muy baja: 24 descargas y 1 «like», sin evidencia publica de validacion por parte de la comunidad.
- Licencia CC BY 4.0: permite uso comercial y modificacion siempre que se atribuya la autoria; es obligatorio citar los articulos correspondientes en trabajos derivados.
- No se ofrece informacion sobre cuantizacion, versiones ONNX u otros formatos optimizados de despliegue, lo que limita las opciones de optimizacion en produccion.
- Los resultados de busqueda web asociados a esta consulta no aportan informacion tecnica relevante sobre el modelo: se refieren al termino frances «dicta» y a un sitio de dictados, por lo que han sido descartados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dicta-il/dictabert-syntax
- Coleccion DictaBERT en HuggingFace: https://huggingface.co/collections/dicta-il/dictabert-6588e7cc08f83845fc42a18b
- Articulo «MRL Parsing Without Tears: The Case of Hebrew»: https://arxiv.org/abs/2403.06970
- Articulo «DictaBERT: A State-of-the-Art BERT Suite for Modern Hebrew»: https://arxiv.org/abs/2308.16687
- Licencia CC BY 4.0: http://creativecommons.org/licenses/by/4.0/
