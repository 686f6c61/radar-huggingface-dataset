# mdagosta/waldito-python-basics-v1-r0013-u1-mdagosta

## Resumen

El modelo `waldito-python-basics-v1-r0013-u1-mdagosta` es un checkpoint de generacion de texto publicado por el usuario mdagosta en HuggingFace, identificado en su propia model card como una exportacion del proyecto "OpenWALDO". Se trata de un modelo denso de arquitectura Llama causal estandar de Transformers, con un total de 9.541.632 parametros (aproximadamente 9,5 millones), lo que lo situa en la categoria de modelos ultracompactos, tres ordenes de magnitud por debajo de un Llama 3 8B.

La singularidad del paquete no esta en el tamano, sino en el tokenizador: usa un tokenizador de bytes propio del proyecto OpenWALDO (denominado "schema-1 byte tokenizer") que obliga a cargar con `trust_remote_code=True`, es decir, ejecutando codigo remoto del repositorio. El repositorio incluye ademas ficheros de inventario (`BOM.json`) y un mapeo de divulgacion de contenido de entrenamiento orientado al reglamento europeo de IA (GPAI) en `EU-BOM.json`.

Es relevante ahora como ejemplo de publicacion de artefactos de entrenamiento con trazabilidad documental (BOM y divulgacion de datos), un requisito creciente bajo el AI Act europeo, y como caso de estudio de los riesgos de seguridad asociados a `trust_remote_code`. El modelo no presenta descargas ni likes y no publica licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (arquitectura estandar de Transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | Tokenizador de bytes propio del proyecto OpenWALDO ("schema-1"); requiere `trust_remote_code=True` |
| Biblioteca | transformers |
| Tarea (pipeline) | text-generation |
| Tamano del repositorio | 0,0 GB |
| Artefactos adicionales | `BOM.json` (inventario de ficheros), `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento GPAI) |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el paquete emplea "la arquitectura estandar de modelo de lenguaje causal Llama de Transformers". No se especifica si se trata de un entrenamiento desde cero o de un ajuste fino sobre un modelo preentrenado, ni se detalla el numero de capas, dimensiones ocultas, cabezas de atencion o la longitud de contexto para la que fue configurado. El numero de parametros (9,5 M) es compatible con un modelo muy pequeno, del orden de los usados en experimentos de investigacion o en inferencia en dispositivos con recursos minimos, pero no hay desglose arquitectonico publicado.

El dato mas relevante es el tokenizador: un tokenizador de bytes ("schema-1 byte tokenizer") que no forma parte del catalogo estandar de Transformers y que se distribuye como codigo remoto. Esto implica que su vocabulario y su comportamiento de tokenizacion no se pueden verificar a partir de la informacion publica disponible. El guion del nombre del modelo (`python-basics-v1-r0013-u1`) sugiere un esquema de versionado por revision y unidad de datos, presumiblemente asociado a un conjunto de datos de fundamentos de Python, pero esto es una inferencia a partir del identificador y no un dato confirmado en la model card. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- Generacion de texto autocompletiva mediante el pipeline `text-generation` de Transformers.
- Soporte de conversacion declarado mediante el tag `conversational` del repositorio, aunque no se documenta la plantilla de chat ni el formato de prompt utilizado.
- Uso a traves de text-generation-inference y de endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Capacidad de razonamiento, codigo, matematicas o multilingue: no documentada. Dado el tamano de 9,5 M de parametros, las capacidades funcionales previsibles son muy limitadas y no hay evidencia publicada que las respalde.
- Soporte de tool calling, function calling o agentes multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Pruebas de integracion y humo en CI/CD: por su tamano (menos de 40 MB en punto flotante de 32 bits), el modelo se puede descargar y ejecutar en cada job de integracion continua para verificar que el pipeline de Transformers, el tokenizador remoto y el endpoint de inferencia funcionan de extremo a extremo, sin coste apreciable de GPU.
- Referencia para auditar el mecanismo `trust_remote_code`: sirve como caso practico para probar y demostrar los riesgos de cargar tokenizadores con codigo remoto en un entorno controlado, y para disenar politicas de revision de repositorios en organizaciones.
- Plantilla para publicacion conforme al AI Act: los ficheros `BOM.json` y `EU-BOM.json` se pueden usar como ejemplo de estructura de divulgacion de contenido de entrenamiento y de inventario de artefactos para otros equipos que necesiten documentar sus releases.
- Experimentacion educativa sobre arquitecturas transformer: con 9,5 M de parametros es viable inspeccionar pesos, trazar la atencion y entrenar desde cero en una CPU en tiempos razonables, lo que lo hace util en docencia de aprendizaje automatico.
- Inferencia en dispositivos embebidos y edge: cabe en microcontroladores de gama alta, moviles o Raspberry Pi, por lo que puede servir como banco de pruebas de despliegues ultraligeros con llama.cpp, ONNX Runtime o TFLite, siempre que la conversion del tokenizador sea viable.
- Generacion de datos sinteticos a escala masiva para filtrar y preprocesar pipelines: al ser extremadamente barato de ejecutar, se puede usar para generar plantillas, etiquetas auxiliares o relleno en tareas de preprocesado, con revision humana posterior.
- Verificacion de compatibilidad de herramientas: util para comprobar el comportamiento de vLLM, TGI, Ollama o llama.cpp con modelos diminutos y tokenizadores no estandar antes de escalar a modelos mayores.
- Reproducibilidad de experimentos academicos: permite replicar el esquema de versionado por revision y unidad descrito en el identificador sin incurrir en costes de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web no contienen datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 MB en FP32, 19 MB en FP16/BF16, 10 MB en INT8 y 5 MB en INT4 (calculo a partir de 9.541.632 parametros; no confirmado por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; cabe holgadamente en GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100. El modelo no es un caso de uso que justifique GPU de datacenter.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo fabricada en la ultima decada, e incluso en iGPU y en CPU sola.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` para el tokenizador), text-generation-inference y endpoints compatibles segun los tags del repositorio. vLLM, llama.cpp, Ollama o TGI no estan confirmados por el autor y dependen de la conversion del tokenizador de bytes y del mapeo de pesos a GGUF u otros formatos.
- Latencia y throughput estimados: no disponibles. Con 9,5 M de parametros, la generacion en CPU deberia ser de decenas a cientos de tokens por segundo en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de sus model cards publicas; los del modelo analizado provienen de la informacion de HuggingFace y, cuando no constan, se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0013-u1-mdagosta | 9,5 M | no disponible | no disponible | no disponible | HuggingFace, safetensors |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | ingles principalmente | HuggingFace, safetensors y GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | multilingue (29 idiomas) | HuggingFace, safetensors y GGUF |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache-2.0 | ingles | HuggingFace, safetensors y GGUF |

La comparacion directa es poco favorable en terminos de documentacion: los tres modelos de referencia publican licencia, idiomas, contexto y evaluaciones, mientras que este checkpoint no publica ninguno de esos datos. La ventaja diferencial del modelo analizado es exclusivamente su tamano minimo y la trazabilidad documental mediante ficheros BOM.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Debe tratarse como "todos los derechos reservados" hasta que el autor lo aclare.
- Riesgo de seguridad por `trust_remote_code=True`: cargar el tokenizador implica ejecutar codigo Python arbitrario del repositorio. Es imprescindible auditar los ficheros remotos antes de instanciarlo en cualquier entorno, y hacerlo en una sandbox aislada si no se ha revisado el codigo.
- Idiomas soportados no documentados: no se puede asumir competencia en castellano ni en ningun otro idioma.
- Longitud de contexto no documentada: imposible planificar conversaciones multi-turno o tareas con entradas largas sin medir empiricamente el limite real.
- Capacidad funcional muy limitada: con 9,5 M de parametros, la calidad de generacion y la coherencia en tareas de razonamiento, codigo o matematicas sera previsiblemente muy baja, aunque no se hayan publicado evaluaciones que lo cuantifiquen.
- Riesgo alto de alucinacion y de incoherencia gramatical, especialmente fuera del dominio de entrenamiento, que tampoco esta documentado.
- Sesgos desconocidos: no hay informacion sobre la composicion del dataset, por lo que no se pueden evaluar sesgos de genero, raza, idioma o ideologia.
- Sin adopcion ni validacion por la comunidad: cero descargas y cero likes, lo que significa que no existe evidencia externa de funcionamiento correcto ni de reproducibilidad.
- Fecha de publicacion inusual (2026-09-30): conviene verificar la integridad y el origen del repositorio antes de integrarlo en cualquier flujo de trabajo.
- No apto para produccion en tareas orientadas a usuario final sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u1-mdagosta
- Ficheros referenciados en el repositorio: `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento GPAI), disponibles en el arbol del repositorio anterior.
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las busquedas devolvieron exclusivamente resultados del extranet del Reseau GES (myges.fr), sin relacion con el modelo.
- Documentacion del proyecto OpenWALDO: no disponible en la informacion proporcionada.
