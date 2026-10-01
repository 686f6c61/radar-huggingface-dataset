# mdagosta/waldito-python-basics-v1-r0014-u1-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0014-u1-mdagosta-b` es un modelo de generación de texto publicado en HuggingFace por el usuario mdagosta, con arquitectura Llama causal estándar y tokenizador de bytes denominado "schema-1" del proyecto OpenWALDO. Se trata de un modelo de escala muy reducida: 9.541.632 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos en miniatura, más cercano a un experimento de investigación o a una pieza didáctica que a un modelo de propósito general desplegable en producción.

La model card es extremadamente escueta y no documenta el corpus de entrenamiento, el número de tokens, el contexto soportado, los idiomas ni la licencia. Sí indica que la carga del tokenizador requiere `trust_remote_code=True` y que el repositorio incluye dos ficheros de inventario: `BOM.json`, con el listado de todos los ficheros de la release, y `EU-BOM.json`, con el mapeo de divulgación de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI). Ese segundo fichero sugiere que el autor busca cierta trazabilidad formal del origen de los datos.

Su relevancia actual es limitada como modelo de uso real, pero puede resultar interesante como caso de estudio de empaquetado reproducible (BOM, divulgación GPAI) y de tokenización a nivel de byte en modelos diminutos. El identificador incluye "python-basics", lo que apunta a un ajuste orientado a conceptos básicos de Python, aunque la model card no confirma ni el dataset ni el objetivo de entrenamiento, por lo que esa interpretación debe tomarse como un indicio derivado del nombre, no como un dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal language model (Transformers) |
| Parametros totales | 9.541.632 (aproximadamente 9,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se observan ficheros GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | schema-1 byte tokenizer de OpenWALDO; requiere `trust_remote_code=True` |
| Tamano del repositorio | 0,0 GB (redondeado en HuggingFace) |
| Fecha de creacion | 2026-09-30 |
| Fecha de ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La model card describe el paquete como una exportación de modelo OpenWALDO que utiliza la arquitectura de modelo de lenguaje causal Llama estándar de la librería Transformers, junto con el tokenizador de bytes schema-1 propietario de OpenWALDO. No se documenta ninguna modificación estructural sobre el transformer Llama convencional: no hay mención a mezcla de expertos, atención lineal, capas SSM ni mecanismos híbridos. El elemento diferencial declarado es, por tanto, el tokenizador, no la arquitectura. Un tokenizador a nivel de byte evita el problema de tokens fuera de vocabulario, ya que cualquier secuencia de bytes es representable, a costa de secuencias más largas para un mismo texto.

No hay información sobre el volumen de datos de entrenamiento, la composición del corpus, la existencia de fases de ajuste por instrucciones, RLHF o DPO, ni sobre técnicas de optimización como decodificación especulativa. El repositorio incluye `BOM.json` (inventario de todos los ficheros de la release) y `EU-BOM.json` (mapeo de divulgación de contenido de entrenamiento según el régimen europeo de GPAI), que son artefactos de gobernanza y trazabilidad más que detalles técnicos de entrenamiento. La ausencia de estos ficheros en el contenido citado impide verificar qué información contienen.

## Capacidades

- Generación de texto autoregresiva: es la tarea declarada en el `pipeline_tag` (`text-generation`), con arquitectura causal estándar.
- Formato conversacional: el repositorio incluye la etiqueta `conversational`, pero no se documenta ninguna plantilla de chat ni formato de turnos, por lo que no es posible confirmar un comportamiento conversacional fiable.
- Codificación a nivel de byte: el tokenizador schema-1 permite representar cualquier flujo de bytes, incluidos textos en alfabetos no latinos o secuencias binarias, sin tokens desconocidos.
- Compatibilidad con text-generation-inference y endpoints: el repositorio declara las etiquetas `text-generation-inference` y `endpoints_compatible`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ninguna lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio, matemáticas avanzadas, código): no documentadas. Con 9,5 M de parámetros, la capacidad de razonamiento complejo, matemáticas o generación de código en producción es previsiblemente muy limitada por pura restricción de escala, aunque no se han publicado evaluaciones que lo cuantifiquen.

## Casos de uso

- Pruebas de humo de infraestructura de despliegue: por su tamano (aproximadamente 38 MB en fp32 y 19 MB en fp16), el modelo carga en segundos y permite validar que un servidor de inferencia, una API o un pipeline de CI arrancan y responden correctamente antes de desplegar un modelo grande.
- Docencia y aprendizaje de fine-tuning: es un candidato practico para que estudiantes ejecuten un ciclo completo de entrenamiento y ajuste fino en un portatil, sin necesidad de GPU dedicada, entendiendo el flujo de tokenizacion, entrenamiento y evaluacion.
- Investigacion sobre tokenizacion a nivel de byte: el tokenizador schema-1 permite estudiar como afecta la codificacion por bytes a la longitud de secuencia, al coste computacional y a la calidad de la generacion en modelos diminutos.
- Validacion de integracion con text-generation-inference y endpoints compatibles: al declarar compatibilidad con TGI, sirve para comprobar contratos de API, serializacion de peticiones y manejo de `trust_remote_code` en entornos controlados.
- Experimentos de interpretabilidad y analisis de mecanismos internos: con unas pocas capas y 9,5 M de parametros, es viable inspeccionar activaciones, atencion y representaciones internas de forma exhaustiva, algo inviable en modelos de miles de millones de parametros.
- Despliegue en dispositivos con recursos muy limitados: puede ejecutarse en CPU, en una Raspberry Pi o en entornos embebidos con pocos cientos de megabytes de RAM disponibles, para tareas de demostracion o generacion de texto trivial.
- Generacion de trafico sintetico en pruebas de carga: util para poblar colas, logs y dashboards de un sistema de inferencia sin coste de GPU ni dependencia de un proveedor externo.
- Estudio de gobernanza y trazabilidad de modelos: los ficheros `BOM.json` y `EU-BOM.json` lo convierten en un ejemplo practico de como estructurar un inventario de release y una divulgacion de contenido de entrenamiento alineada con el reglamento europeo de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra metrica de evaluacion, y tampoco se han encontrado referencias externas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 MB en fp32 y 19 MB en fp16 para los pesos. La activacion y el estado de la cache KV anaden un consumo adicional que depende del contexto, valor no disponible.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100. El modelo no aprovechara practicamente nada del paralelismo de una GPU de gama alta.
- Viabilidad en hardware de consumo: si. Cabe con holgura en cualquier GPU de consumo de los ultimos diez anos e incluso en CPU, en Raspberry Pi y en entornos embebidos.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference y endpoints compatibles (etiquetas del repositorio). No hay ficheros GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa del tokenizador y de los pesos. No se confirma soporte de vLLM ni de otros motores.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones. Por el tamano del modelo, la latencia estara dominada por el coste de arranque y de carga del tokenizador, no por el calculo.
- Nota de seguridad: la carga requiere `trust_remote_code=True` para el tokenizador, lo que implica ejecutar codigo Python distribuido en el repositorio. Debe hacerse en un entorno aislado y revisando previamente dicho codigo.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, y el modelo no publica benchmarks que permitan una comparacion funcional. Como referencia estructural de categoria, cabe senalar que el rango de 9,5 M de parametros se situa por debajo de los modelos diminutos mas habitualmente citados (por ejemplo, GPT-2 small con 124 M de parametros o las variantes pequenas de la familia TinyStories, en el rango de 1 M a 33 M). Estas cifras proceden de conocimiento general y no de la informacion suministrada, por lo que no deben tomarse como una comparacion validada.

| Aspecto | waldito-python-basics-v1-r0014 | Alternativas de menos de 200 M | Alternativas de 1 B o mas |
|---|---|---|---|
| Parametros | 9,5 M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Contexto | no disponible | no disponible | no disponible |
| Rendimiento en benchmarks | no disponible | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad de pesos abiertos | si, safetensors en HuggingFace | no disponible | no disponible |

## Limitaciones y advertencias

- Escala muy reducida: con 9,5 M de parametros, la coherencia a lo largo de varias frases y el seguimiento de instrucciones complejas seran muy limitados. Es previsible una tasa alta de alucinacion y de texto incoherente; no debe usarse para generar informacion factual sin verificacion humana.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni para redistribucion. Cualquier uso en produccion o en productos derivados requiere aclarar previamente los terminos con el autor.
- Idiomas no declarados: se desconoce si el modelo ha sido entrenado en castellano, en ingles o en otro idioma. El tokenizador de bytes permite representar cualquier idioma, pero eso no implica competencia linguistica en el mismo.
- Longitud de contexto desconocida: no se puede planificar un caso de uso que dependa de ventanas largas sin medir empiricamente el comportamiento en contextos crecientes.
- Riesgo de seguridad en la carga: `trust_remote_code=True` implica ejecutar codigo del repositorio. Debe auditarse antes de usarlo, especialmente en entornos con acceso a red o a datos sensibles.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad, por lo que cualquier evaluacion debe hacerse de forma local y con criterios propios.
- Metadatos incompletos: el repositorio reporta un tamano de 0,0 GB y no hay ficheros de configuracion de generacion ni plantillas de chat documentadas en la informacion disponible, lo que dificulta la reproducibilidad.
- Fechas de publicacion atipicas en los metadatos (creacion y actualizacion separadas por pocos segundos), lo que sugiere una subida automatizada o de prueba; conviene tratarlo como un experimento y no como una release estable.
- Sesgos: no documentados, pero al desconocerse el corpus de entrenamiento no puede descartarse la presencia de sesgos sistematicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0014-u1-mdagosta-b
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Ficheros de inventario y divulgacion citados en la model card: `BOM.json` y `EU-BOM.json` (incluidos en el repositorio del modelo)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
