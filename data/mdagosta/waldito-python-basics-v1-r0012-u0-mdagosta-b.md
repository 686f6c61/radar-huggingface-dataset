# mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta-b

## Resumen

`mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta-b` es un modelo de generacion de texto publicado en HuggingFace por el usuario mdagosta, presentado por su autor como un "export" del proyecto OpenWALDO. Segun la model card, utiliza la arquitectura Llama causal estandar de Transformers junto con el tokenizador de bytes "schema-1" de OpenWALDO, que requiere `trust_remote_code=True` para cargarse. El repositorio es de tamano minimo y no registra descargas ni interacciones en el momento de la consulta.

El dato tecnico mas relevante y verificado es su tamano: 9.541.632 parametros totales, medidos sobre los ficheros safetensors del repositorio. Se trata, por tanto, de un modelo denso de escala muy reducida (menos de 10 millones de parametros), tres ordenes de magnitud por debajo de los modelos de frontera actuales. La model card no especifica la longitud de contexto, los idiomas soportados, la licencia ni la composicion del dataset de entrenamiento.

Su relevancia practica es acotada y de perfil experimental: sirve como banco de pruebas para pipelines de inferencia, para estudiar tokenizacion a nivel de byte y para validar infraestructura de despliegue con un coste de computo practicamente nulo. No hay evidencia publicada de que compita en tareas de razonamiento, codigo o comprension multilingue con modelos de su categoria o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (arquitectura estandar de Transformers, segun la model card) |
| Parametros totales | 9.541.632 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin cuantizaciones alternativas documentadas |
| Idiomas soportados | No disponible (el tokenizador es de bytes, lo que permite codificar cualquier texto UTF-8, pero no se documenta la cobertura idiomatica real del entrenamiento) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tokenizador | OpenWALDO schema-1, a nivel de byte; requiere `trust_remote_code=True` |
| Fecha de creacion | 2026-09-30 |
| Fecha de ultima actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el paquete emplea "la arquitectura Llama causal-language-model estandar de Transformers" y el tokenizador de bytes schema-1 de OpenWALDO. No se documentan el numero de capas, las dimensiones ocultas, el numero de cabezas de atencion, la longitud de contexto ni si se aplican variantes como atencion lineal, decodificacion especulativa o mezcla de expertos. Tampoco se detalla si el modelo se entreno desde cero o si es un ajuste fino sobre otro checkpoint.

En cuanto a los datos de entrenamiento, no hay informacion disponible: no se especifican el volumen de tokens, la composicion del dataset, las fases de alineacion (RLHF, DPO, SFT) ni el uso de filtrado o deduplicacion. La model card menciona dos ficheros auxiliares de trazabilidad, `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA para modelos GPAI), pero su contenido no se reproduce en la informacion proporcionada.

El unico elemento diferencial confirmado es el tokenizador de bytes schema-1, que opera sobre bytes en lugar de sobre subpalabras BPE. Esto elimina el problema de tokens fuera de vocabulario y permite representar cualquier idioma o secuencia binaria, a costa de alargar considerablemente las secuencias respecto a un tokenizador BPE convencional.

## Capacidades

- Generacion de texto autoregresiva basica, segun el pipeline declarado (`text-generation`).
- Etiquetado como `conversational`, lo que sugiere soporte de formato de dialogo, aunque no se documenta ninguna plantilla de chat ni formato de prompt oficial.
- Codificacion de texto en cualquier idioma o alfabeto a nivel de byte, por diseno del tokenizador.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano de 9,5 millones de parametros hace inviable este tipo de tareas.
- Capacidades de vision, audio o modo "thinking": no disponibles.
- Razonamiento matematico o generacion de codigo robusta: no documentada. El nombre del repositorio ("python-basics") sugiere un ajuste orientado a conceptos basicos de Python, pero la model card no lo confirma.

## Casos de uso

- Pruebas de integracion en pipelines de inferencia: por su tamano de 9,5 millones de parametros, el modelo carga en memoria en cuestion de milisegundos y permite validar de extremo a extremo un flujo de Transformers, TGI o un endpoint compatible sin consumir GPU.
- Tests automatizados en CI/CD: sirve como modelo simulado (fake model) en tests de integracion de aplicaciones de generacion de texto, verificando serializacion de prompts, streaming y manejo de errores sin coste de computo apreciable.
- Experimentacion academica con tokenizacion a nivel de byte: permite medir el impacto del tokenizador schema-1 en la longitud de secuencia, la perplejidad y el coste de atencion frente a tokenizadores BPE, en un entorno reproducible y barato.
- Despliegue en dispositivos sin GPU (edge, Raspberry Pi, contenedores CPU): con pesos que ocupan decenas de megabytes, es viable ejecutarlo integramente en CPU y en memoria principal.
- Docencia y demostraciones: ilustra de forma tangible el funcionamiento de un transformer causal completo, desde la tokenizacion hasta la generacion, en un aula o taller sin infraestructura dedicada.
- Generacion de texto de relleno en pruebas de interfaz: util para poblar prototipos de UI de chat con respuestas sinteticas rapidas durante el desarrollo, antes de conectar un modelo de produccion.
- Evaluacion de infraestructura de trazabilidad regulatoria: los ficheros `BOM.json` y `EU-BOM.json` permiten ensayar flujos internos de inventario de artefactos y divulgacion de contenido de entrenamiento para modelos GPAI.

Advertencia: dado su tamano, no es adecuado para atencion al cliente, generacion de codigo en produccion, RAG, agentes ni ninguna tarea que requiera coherencia prolongada o conocimiento factual fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, y las busquedas web realizadas no devolvieron resultados relacionados con el modelo (los resultados obtenidos corresponden a un videojuego no relacionado y se han descartado).

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas aritmeticamente del numero de parametros confirmado (9.541.632) y no proceden de documentacion publicada del autor.

- VRAM en fp32: aproximadamente 36-38 MB solo para los pesos.
- VRAM en fp16/bf16: aproximadamente 18-19 MB solo para los pesos.
- Cache KV: no disponible; depende de la longitud de contexto y del numero de capas, que no se documentan.
- GPU: cabe sin dificultad en cualquier GPU consumer, incluidas GTX 1050 Ti, RTX 3050, RTX 4090 o integradas con soporte CUDA; no requiere A100 ni H100.
- Inferencia en CPU: totalmente viable; es el escenario de despliegue mas realista para este tamano.
- Opciones de despliegue: Transformers (libreria declarada), endpoints compatibles y text-generation-inference (tags del repositorio). Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que no se distribuye en el repositorio. vLLM no esta confirmado para esta arquitectura y tamano.
- Latencia y throughput: no disponibles en la informacion proporcionada. Cualquier cifra concreta seria especulativa.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni datos de rendimiento del modelo, y las busquedas web no arrojaron comparativas publicadas. La tabla siguiente recoge unicamente los atributos verificables frente a la categoria generica de modelos densos de menos de 100 millones de parametros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0012-u0-mdagosta-b | 9.541.632 | No disponible | No disponible | HuggingFace (0 descargas) | No disponibles |
| Alternativas concretas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos: no se documenta el dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza, religion o idioma. Cualquier sesgo presente en los datos de origen seria heredado sin control conocido.
- Alucinacion: con 9,5 millones de parametros, la capacidad de almacenar conocimiento factual es muy limitada; la generacion de afirmaciones incorrectas con apariencia plausible es esperable y debe asumirse como comportamiento por defecto.
- Coherencia: la ventana de contexto no esta documentada y la capacidad de mantener coherencia multi-turno en conversaciones largas no esta verificada.
- Idiomas: aunque el tokenizador de bytes puede codificar cualquier idioma, no hay evidencia de que el modelo haya sido entrenado con datos de calidad en castellano ni en ningun otro idioma concreto.
- Licencia: no disponible. Al no declararse licencia, no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Codigo remoto: el tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python distribuido en el repositorio. En entornos de produccion debe auditarse ese codigo antes de cargarlo.
- Trazabilidad: la model card remite a `BOM.json` y `EU-BOM.json`, pero su contenido no se ha verificado en la informacion disponible; la divulgacion de contenido de entrenamiento exigida para modelos GPAI no puede confirmarse.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia. No hay evidencia de uso en produccion, validacion externa ni mantenimiento posterior.
- Apropiado solo para prototipado y experimentacion. No debe desplegarse en aplicaciones de cara al usuario sin una evaluacion previa exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta-b
- Fichero `BOM.json` referenciado en la model card: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta-b/blob/main/BOM.json
- Fichero `EU-BOM.json` referenciado en la model card: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta-b/blob/main/EU-BOM.json
- Paper, blog, repositorio de codigo o demo del proyecto OpenWALDO: no disponible.
- Resultados de la busqueda web: todos los enlaces devueltos corresponden a un videojuego sin relacion con el modelo ("SAND: Raiders of Sophie") y se han descartado por no ser relevantes.
