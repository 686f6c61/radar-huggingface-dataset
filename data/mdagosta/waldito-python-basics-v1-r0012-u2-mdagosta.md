# mdagosta/waldito-python-basics-v1-r0012-u2-mdagosta

## Resumen

`mdagosta/waldito-python-basics-v1-r0012-u2-mdagosta` es un modelo de generacion de texto publicado en HuggingFace por el usuario `mdagosta`, identificado en su model card como una exportacion del sistema OpenWALDO. El modelo emplea la arquitectura causal de tipo Llama que proporciona la libreria Transformers, es decir, un transformer decoder-only estandar, y se distribuye en formato safetensors bajo la libreria `transformers`. Su tamano es muy reducido: 9.541.632 parametros totales, segun los datos reales de los pesos publicados.

La caracteristica mas distintiva declarada por el autor es el uso del tokenizador de bytes «schema-1» de OpenWALDO, que obliga a cargar el tokenizer con `trust_remote_code=True`. El paquete incluye ademas dos ficheros de inventario: `BOM.json`, que enumera todos los ficheros de la release, y `EU-BOM.json`, que contiene el mapeo de divulgacion de contenido de entrenamiento para modelos de IA de proposito general exigido por el reglamento europeo (EU GPAI). Este ultimo punto es relevante porque anticipa el tipo de documentacion de trazabilidad que empieza a requerirse para modelos distribuidos en la UE.

Por el nombre de la release (`python-basics`) y por sus dimensiones, el modelo parece orientado a tareas basicas de generacion de texto o codigo Python, si bien no se ha publicado informacion que confirme el dataset de entrenamiento, el contexto soportado ni los idiomas. El repositorio no registra descargas ni interacciones y no declara licencia, por lo que debe considerarse un artefacto experimental en fase temprana de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (arquitectura Llama de Transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin cuantizaciones declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de modelo de lenguaje causal de Llama incluida en la libreria Transformers, tal y como declara el propio autor en la model card. Se trata por tanto de un transformer decoder-only con atencion causal, sin que se documenten modificaciones estructurales, tecnicas de atencion lineal, capas MoE ni mecanismos hibridos. Con 9,5 millones de parametros, el modelo se situa en el rango de los modelos experimentales de juguete (toy models) orientados a pruebas de pipeline mas que a produccion.

La innovacion tecnica declarada es el tokenizador de bytes «schema-1» de OpenWALDO, que sustituye el tokenizador BPE habitual de Llama. Este enfoque de tokenizacion a nivel de byte evita el problema de tokens desconocidos y permite representar cualquier cadena de bytes, a cambio de secuencias mas largas para un mismo texto. El autor indica que el tokenizer debe cargarse con `trust_remote_code=True`, lo que implica la ejecucion de codigo personalizado alojado en el repositorio.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. La model card unicamente referencia los ficheros de inventario `BOM.json` y `EU-BOM.json`, que documentan los ficheros de la release y el mapeo de divulgacion de contenido de entrenamiento conforme al regimen europeo de GPAI, pero su contenido no se detalla en la informacion proporcionada.

## Capacidades

- Generacion de texto causal: el modelo esta etiquetado con el pipeline `text-generation` y con la etiqueta `conversational`, por lo que se espera que genere texto y mantenga formato de conversacion, aunque no se documentan capacidades especificas.
- Posible especializacion en Python basico: el nombre de la release (`python-basics`) sugiere un ajuste orientado a conceptos basicos de Python, pero no hay confirmacion en la informacion disponible.
- Compatibilidad con Text Generation Inference: la etiqueta `text-generation-inference` indica que el modelo esta preparado para desplegarse con el servidor TGI.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere soporte para endpoints de inferencia gestionados.
- Tokenizacion a nivel de byte: al usar el tokenizador de bytes schema-1, puede procesar cualquier secuencia de bytes sin tokens fuera de vocabulario.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Pruebas de integracion de pipelines de Transformers: por su tamano minimo (9,5 M de parametros), el modelo permite validar el flujo completo de carga, tokenizacion con `trust_remote_code=True`, inferencia y serializacion en entornos de desarrollo sin consumo apreciable de recursos.
- Validacion de despliegues con TGI y endpoints: al estar etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`, resulta util para comprobar la configuracion de servidores de inferencia y contratos de API antes de pasar a modelos mayores.
- Docencia y demostraciones de arquitecturas Llama: sirve para ilustrar en clase o talleres como se estructura un transformer causal decoder-only y como funciona un tokenizador de bytes, dado su tamano manejable y su carga en CPU.
- Generacion asistida de fragmentos de codigo Python para ejercicios introductorios: si la especializacion sugerida por el nombre se confirma, podria emplearse para autocompletar ejemplos didacticos sencillos, siempre con supervision humana.
- Experimentacion con tokenizacion a nivel de byte: permite investigar el comportamiento de un tokenizador schema-1 frente a BPE en tareas de reconstruccion exacta de cadenas y manejo de caracteres no latinos.
- Base para fine-tuning de bajo coste: al caber holgadamente en cualquier GPU de consumo e incluso en CPU, es un candidato para experimentos de ajuste rapido sobre dominios muy acotados.
- Auditoria de trazabilidad documental: los ficheros `BOM.json` y `EU-BOM.json` permiten estudiar como se estructura la divulgacion de contenido de entrenamiento exigida por el reglamento europeo de GPAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de activaciones): aproximadamente 38 MB en fp32, 19 MB en fp16/bf16, 10 MB en int8 y 5 MB en int4.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada; tambien es viable la inferencia en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en sistemas embebidos con memoria limitada.
- Opciones de despliegue: Transformers (libreria declarada), Text Generation Inference (etiqueta `text-generation-inference`) y endpoints compatibles (etiqueta `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama ni otros runners, aunque el formato safetensors es convertible.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia muy baja incluso en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos de referencia comparables, ni datos de rendimiento que permitan establecer una comparacion objetiva con alternativas de tamano o tarea similares.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede confirmarse la legalidad de un uso comercial ni las condiciones de redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia de datos de entrenamiento: se desconoce el dataset, su composicion, su procedencia y si existen sesgos incorporados, lo que dificulta la evaluacion de riesgos.
- Riesgo elevado de alucinacion: con 9,5 M de parametros, la capacidad de generar informacion factual fiable es muy limitada y el modelo puede producir contenido incorrecto con aparente seguridad.
- Idiomas no documentados: no se ha publicado que idiomas soporta, por lo que el comportamiento multilingue es incierto y podria degradarse fuera del idioma de entrenamiento.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar conversaciones multi-turno o documentos largos.
- Dependencia de `trust_remote_code=True`: la carga del tokenizer implica ejecutar codigo personalizado del repositorio, lo que introduce un riesgo de seguridad que debe evaluarse antes de usarlo en entornos controlados.
- Tokenizador no estandar: al emplear el tokenizador de bytes schema-1 de OpenWALDO en lugar del tokenizador Llama habitual, puede haber incompatibilidades con herramientas, plantillas de chat y utilidades que asumen el vocabulario original.
- Modelo sin traccion: cero descargas y cero interacciones en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Repositorio vacio o casi vacio en cuanto a peso: el tamano del repo figura como 0,0 GB, lo que sugiere un paquete muy ligero o con posible informacion incompleta en los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u2-mdagosta
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la informacion proporcionada.
