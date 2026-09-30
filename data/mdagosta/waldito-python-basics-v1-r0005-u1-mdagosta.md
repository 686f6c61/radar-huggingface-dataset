# mdagosta/waldito-python-basics-v1-r0005-u1-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0005-u1-mdagosta` es un modelo de lenguaje causal de tipo decoder-only con arquitectura Llama estandar de la libreria Transformers, publicado por el usuario mdagosta dentro de la familia de exportaciones denominada OpenWALDO (concretamente, una unidad de la revision r0005). Con 9.541.632 parametros totales segun los pesos en safetensors, se trata de un modelo extremadamente pequeno, de escala casi experimental, que no compite en capacidad generalista con los modelos de miles de millones de parametros, sino que apunta a un uso acotado y de bajo coste.

Su rasgo tecnico mas distintivo es el tokenizador: emplea el tokenizador de bytes de OpenWALDO (schema-1 byte tokenizer) en lugar de un tokenizador BPE o SentencePiece convencional, y requiere cargarse con `trust_remote_code=True`. El nombre del repositorio sugiere un ajuste orientado a fundamentos de programacion en Python, aunque la model card no documenta el conjunto de datos de entrenamiento ni el procedimiento de ajuste.

La relevancia de esta ficha es principalmente practica: se trata de un artefacto util para estudiar tokenizadores a nivel de byte, para probar infraestructura de inferencia a coste casi nulo (menos de 40 MB en fp32) y como caso de analisis de publicaciones de modelos sin licencia declarada y con metadatos incompletos. No hay descargas ni valoraciones registradas, benchmarks publicados ni idiomas declarados, por lo que cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama causal language model, segun la model card) |
| Parametros totales | 9.541.632 (aproximadamente 9,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos sin cuantizar en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 byte tokenizer (requiere `trust_remote_code=True`) |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el paquete es una exportacion de OpenWALDO y que utiliza la arquitectura Llama causal-language-model estandar de Transformers. No se especifica si hay variaciones sobre esa plantilla (por ejemplo, atencion con RoPE, normalizacion RMSNorm o MLP con SwiGLU), aunque al declararse como arquitectura Llama estandar es razonable asumir la configuracion habitual de esa familia, sin que exista confirmacion documental en la informacion disponible. El tamano de 9,5 M de parametros situa el modelo muy por debajo de cualquier Llama publicada por Meta, lo que sugiere una configuracion personalizada de capas y dimensiones ocultas definida por el autor.

La innovacion mas relevante es el tokenizador de bytes schema-1, que opera directamente sobre bytes en lugar de sobre un vocabulario subpalabra aprendido. Esto elimina el problema de tokens fuera de vocabulario y hace que el modelo sea, en principio, agnostico al alfabeto y capaz de representar cualquier texto, incluidos emojis, codigo y alfabetos no latinos, a costa de secuencias mas largas y de una mayor carga de aprendizaje por token. El repositorio incluye `BOM.json`, que inventaria los ficheros de la release, y `EU-BOM.json`, con el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de GPAI, lo que apunta a una intencion de cumplimiento normativo.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o ajuste supervisado, ni sobre tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto causal: es la funcion declarada por el pipeline `text-generation` y por la arquitectura del modelo.
- Uso conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica que se ha previsto un uso de dialogo, si bien no se documenta ninguna plantilla de chat.
- Compatibilidad con text-generation-inference: la etiqueta `text-generation-inference` sugiere compatibilidad con el servidor TGI, aunque no se detalla la configuracion.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el autor lo considera desplegable en infraestructura de endpoints gestionados.
- Fundamentos de Python: el nombre del repositorio (`python-basics`) apunta a un ajuste orientado a contenidos basicos de Python, pero no hay documentacion ni evaluacion que lo confirme.
- Tool calling / function calling: no disponible; no se menciona en la model card ni en las etiquetas.
- Razonamiento multi-paso y agentes: no disponible; no se declara ninguna capacidad de este tipo.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

Debido al tamano de 9,5 M de parametros, incluso en las capacidades declaradas cabe esperar un comportamiento muy limitado fuera de dominios estrechos y de plantillas muy repetitivas.

## Casos de uso

- Estudio de tokenizadores a nivel de byte: el modelo permite analizar de forma empirica como aprende y genera un transformer entrenado sobre un vocabulario de bytes en lugar de subpalabras, algo poco frecuente en modelos publicos. Es adecuado porque el tokenizador es el elemento distintivo y el coste de experimentacion es minimo.
- Pruebas de integracion de infraestructura de inferencia: con menos de 40 MB en fp32, sirve como modelo de humo para validar despliegues con Transformers, TGI o vLLM antes de subir un modelo grande. Es adecuado porque arranca en segundos y no consume GPU dedicada.
- Docencia y talleres sobre ciclo de vida de un modelo: permite recorrer carga con `trust_remote_code`, inspeccion de safetensors, conteo de parametros y publicacion en el Hub en un entorno de aula sin necesidad de hardware especializado.
- Generacion de fragmentos de codigo Python muy basicos: puede emplearse como autocompletado de ejemplos triviales (bucles, condicionales, definiciones de funcion) en entornos controlados y con revision humana. Es adecuado solo si se asume que el modelo cometara errores y que su utilidad es demostrativa, no productiva.
- Auditoria de metadatos y cumplimiento en releases de modelos: los ficheros `BOM.json` y `EU-BOM.json` convierten este repositorio en un caso de ejemplo para estudiar como se inventaria una release y como se mapea la divulgacion de contenido de entrenamiento exigida por la normativa europea de GPAI.
- Experimentacion en CPU y entornos sin GPU: el modelo es ejecutable en CPU y en dispositivos con memoria muy limitada, lo que lo hace util para prototipos docentes o demostraciones en portatiles modestos y en entornos air-gapped.
- Pruebas de robustez de pipelines de evaluacion: sirve como baseline de baja calidad deliberada para verificar que un arnes de evaluacion detecta correctamente respuestas degeneradas, repeticiones y salidas incoherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los metadatos del repositorio incluyen cifras de MMLU, HumanEval, GSM8K, perplexity ni de ninguna otra prueba estandar, y no existe documentacion de evaluacion propia por parte del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 MB de pesos en fp32, 19 MB en fp16/bf16, 10 MB en int8 y 5 MB en int4. Sumando cache KV y activaciones, el consumo total se mantiene holgadamente por debajo de 1 GB en cualquier configuracion practica.
- GPU recomendadas: cualquier GPU es suficiente. Incluso iGPU integradas y aceleradores de borde pueden alojar el modelo sin dificultad; no tiene sentido reservar una A100, H100 o RTX 4090 para este modelo salvo como prueba de infraestructura.
- Cabe en GPU de consumo: si, en todas las GPU de consumo actuales y en la mayoria de generaciones anteriores, asi como en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via documentada; el repositorio declara etiquetas de compatibilidad con text-generation-inference y con endpoints. El uso con llama.cpp, Ollama o llama-cpp-python no esta documentado y depende de que esas herramientas admitan el tokenizador de bytes, algo que no esta garantizado ni verificado.
- Latencia y throughput: no se han publicado medidas. Por el tamano del modelo, cabe esperar que cualquier hardware moderno genere varias decenas o cientos de tokens por segundo, pero se trata de una estimacion por escala y no de un dato medido.
- Almacenamiento: el repositorio declara un tamano de 0.0 GB, dato que resulta inconsistente con los 9,5 M de parametros en safetensors y que conviene verificar antes de planificar cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0005-u1 | 9,5 M | no disponible | no disponible | HuggingFace, 0 descargas |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | HuggingFace, ampliamente utilizado |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | HuggingFace, ampliamente utilizado |

La comparativa es de escala, no de rendimiento: los tres modelos de referencia estan entre 14 y 115 veces por encima en numero de parametros, cuentan con licencias permisivas explicitas y disponen de evaluaciones publicas, mientras que el modelo analizado no declara licencia, idiomas ni contexto. No se dispone de ninguna comparacion de resultados en benchmarks porque el modelo no publica cifras.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia, el uso comercial queda en una situacion juridica indeterminada. Conviene contactar con el autor antes de cualquier explotacion productiva.
- Ejecucion de codigo remoto: la carga del tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo publicado por el autor. Debe revisarse ese codigo y aislarse la ejecucion en un entorno controlado.
- Riesgo elevado de alucinacion y de degeneracion: con 9,5 M de parametros, la coherencia a lo largo de secuencias largas es muy limitada y son esperables repeticiones, incoherencias y respuestas inventadas.
- Ausencia de plantilla de chat documentada: aunque el repositorio lleva la etiqueta `conversational`, no se especifica formato de prompt, tokens especiales ni delimitadores de turno, lo que puede degradar notablemente los resultados en uso conversacional.
- Idiomas no declarados: no hay garantia de comportamiento correcto en castellano ni en ningun otro idioma concreto; el tokenizador de bytes permitiria representar cualquier texto, pero el entrenamiento puede haber cubierto un rango muy estrecho.
- Longitud de contexto desconocida: sin dato de contexto ni de posiciones entrenadas, no es posible planificar tareas que requieran ventanas largas.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se puede caracterizar que sesgos contiene el modelo ni en que medida.
- Metadatos incompletos y sin validacion de la comunidad: 0 descargas y 0 likes, ademas de un tamano de repositorio declarado de 0.0 GB que no cuadra con el numero de parametros. Conviene verificar la integridad de los ficheros antes de usarlos.
- Documentacion de cumplimiento sin verificar: la presencia de `EU-BOM.json` no garantiza por si sola que la divulgacion de contenido de entrenamiento sea completa o correcta; es un fichero aportado por el autor.
- No apto como sustituto de un modelo generalista: no debe emplearse en tareas de produccion que requieran razonamiento, codigo fiable, matemáticas o conocimiento factual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0005-u1-mdagosta
- Version anterior de la misma familia: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u1-mdagosta
- Inventario de la release (referenciado en la model card): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0005-u1-mdagosta/blob/main/BOM.json
- Divulgacion de contenido de entrenamiento UE GPAI (referenciado en la model card): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0005-u1-mdagosta/blob/main/EU-BOM.json
- Paper, blog o repositorio de OpenWALDO: no disponible en la informacion consultada.
