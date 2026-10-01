# mdagosta/waldito-python-basics-v1-r0013-u2-mdagosta-b

## Resumen

Waldito-python-basics-v1-r0013-u2-mdagosta-b es un modelo de generacion de texto publicado en HuggingFace por el usuario mdagosta bajo la denominacion de exportacion "OpenWALDO". Segun la model card, utiliza la arquitectura estandar de transformers para modelos de lenguaje causal de tipo Llama, con un tokenizador de bytes propio denominado "schema-1", que exige cargarse con `trust_remote_code=True`. El repositorio incluye dos ficheros de inventario: `BOM.json`, que lista todos los artefactos de la release, y `EU-BOM.json`, que mapea la divulgacion de contenido de entrenamiento exigida por el reglamento europeo de IA (GPAI).

El dato mas relevante es su tamano: 9.541.632 parametros (aproximadamente 9,5 millones), confirmados por los pesos en safetensors. Se trata, por tanto, de un modelo muy pequeno, tres ordenes de magnitud por debajo de los modelos de uso general habituales, lo que lo situa en la categoria de modelos experimentales, educativos o de juguete. El nombre del repositorio ("python-basics", "u2", "r0013") sugiere una serie de experimentos o unidades didacticas centradas en conceptos basicos de Python, aunque la model card no lo confirma.

Su relevancia actual es limitada como herramienta de produccion: acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y no publica resultados de benchmarks. Su interes es sobre todo metodologico: ilustra un flujo de publicacion con trazabilidad de artefactos (BOM) y divulgacion de datos de entrenamiento alineada con el marco regulatorio europeo, ademas de servir como banco de pruebas de bajo coste para pipelines de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, arquitectura Llama estandar de Transformers (segun model card) |
| Parametros totales | 9.541.632 (aproximadamente 9,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se declaran versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1, tokenizador de bytes; requiere `trust_remote_code=True` |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion (registro) | 2026-09-30T20:15:49Z |
| Fecha de ultima actualizacion | 2026-09-30T20:15:55Z |
| Tamano del repositorio | 0,0 GB (redondeado) |

## Arquitectura y entrenamiento

La model card indica que el paquete emplea "the standard Transformers Llama causal-language-model architecture", es decir, un transformer decoder-only con atencion causal, sin que se detallen numero de capas, dimensiones de hidden state, numero de cabezas de atencion ni estrategia de posicionamiento. Tampoco se especifica si incorpora innovaciones como atencion lineal, decodificacion especulativa o mezcla de expertos; por el tamano declarado y la nomenclatura, lo mas plausible es una configuracion convencional y reducida. El elemento diferencial documentado es el tokenizador: un esquema de bytes propietario de OpenWALDO ("schema-1"), lo que implica que la tokenizacion opera sobre representacion de bytes y no sobre un vocabulario BPE o SentencePiece convencional, con las implicaciones que ello tiene en longitud de secuencia y en el tratamiento de idiomas y simbolos.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre el regimen de entrenamiento (precision, hardware, duracion). El unico indicio sobre los datos es indirecto: el nombre del repositorio apunta a contenido basico de Python, y la presencia de `EU-BOM.json` sugiere que el autor ha preparado un mapeo de divulgacion del contenido de entrenamiento segun los requisitos del reglamento europeo de IA para modelos de proposito general, aunque el contenido de ese mapeo no se reproduce en la model card.

## Capacidades

- Generacion de texto autoregresiva, dentro de la categoria `text-generation` declarada en el repositorio.
- Uso conversacional, segun la etiqueta `conversational` del modelo, aunque no se documenta ninguna plantilla de chat ni formato de mensajes.
- Tokenizacion a nivel de bytes mediante el esquema OpenWALDO schema-1, que en principio permite representar cualquier secuencia de bytes, incluidos simbolos y alfabetos no cubiertos por vocabularios convencionales.
- Posible especializacion en conceptos basicos de Python, inferida unicamente del nombre del repositorio; no confirmada en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (`endpoints_compatible`), lo que facilita su despliegue mediante API estandar.

## Casos de uso

- Docencia de arquitecturas transformer: con 9,5 M de parametros, el modelo se puede cargar y ejecutar en un portatil sin GPU, lo que permite inspeccionar capas, pesos y el flujo completo de inferencia en un aula o taller sin depender de infraestructura.
- Banco de pruebas de tokenizadores de bytes: dado que emplea el esquema OpenWALDO schema-1 con `trust_remote_code=True`, resulta util para validar como se comporta la tokenizacion byte a byte frente a tokenizadores BPE en textos con caracteres no latinos, emojis o codigo fuente.
- Pruebas de integracion de pipelines de inferencia: sirve para verificar extremo a extremo el despliegue con transformers, text-generation-inference o endpoints compatibles antes de migrar a modelos de mayor tamano, con un coste de computo minimo.
- Ejercicios de ajuste fino (fine-tuning) educativo: su tamano permite completar ciclos de entrenamiento en CPU o en una unica GPU de consumo, ideal para practicar LoRA, cuantizacion o destilacion sobre un modelo real.
- Evaluacion de flujos de trazabilidad y cumplimiento: la inclusion de `BOM.json` y `EU-BOM.json` lo convierte en un caso practico para estudiar como estructurar la divulgacion de contenido de entrenamiento exigida por el reglamento europeo de IA (GPAI).
- Demostraciones de inferencia en dispositivos de borde: con un peso en el rango de decenas de megabytes, es viable ejecutarlo en Raspberry Pi, moviles o microcontroladores con suficiente memoria, para prototipos de generacion de texto muy acotada.
- Control negativo en experimentos de evaluacion: al ser un modelo diminuto y presumiblemente poco capaz, puede utilizarse como referencia de baja calidad en estudios comparativos de benchmarks o de deteccion de texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: calculada a partir de 9.541.632 parametros, aproximadamente 38 MB en FP32, 19 MB en FP16/BF16, 9,5 MB en int8 y 5 MB en int4 (estimacion aritmetica, no dato publicado). A ello hay que sumar la cache KV, cuyo tamano depende de una longitud de contexto que no se ha hecho publica.
- GPU recomendadas: no se requiere GPU. Cualquier GPU, incluida una iGPU integrada, es sobradamente suficiente; una RTX 4090 o una A100 estarian enormemente sobredimensionadas.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPU integradas. Tambien es viable en CPU exclusivamente y en placas como Raspberry Pi.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta declarada) y endpoints compatibles con la API de HuggingFace. El despliegue con llama.cpp, Ollama o vLLM requeriria convertir previamente los pesos, ya que el repositorio no publica versiones GGUF ni formatos especificos de esos motores.
- Latencia y throughput estimados: no disponibles. Por el tamano de parametros, la latencia por token deberia ser de milisegundos en CPU moderna y menor en GPU, pero no hay mediciones publicadas y el coste real dependera de la longitud de contexto y del tokenizador de bytes.
- Nota sobre la carga: el tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo remoto del autor; conviene auditar ese codigo antes de usarlo en entornos controlados.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de este modelo (contexto, licencia, idiomas), por lo que la comparacion se limita a la categoria y al orden de magnitud. Los siguientes modelos se incluyen como referencias publicas de la franja de modelos muy pequenos; sus cifras proceden de sus respectivas documentaciones publicas y no han sido verificadas en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| waldito-python-basics-v1-r0013-u2-mdagosta-b | 9,5 M | no disponible | no disponible | Tokenizador de bytes OpenWALDO; sin benchmarks ni idiomas declarados |
| SmolLM2-135M | 135 M | 8.192 tokens (referencia publica) | Apache-2.0 (referencia publica) | Modelo pequeno de uso general, con datos de entrenamiento y evaluaciones publicadas |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens (referencia publica) | Apache-2.0 (referencia publica) | Modelo pequeno multilingue con soporte de tool calling |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens (referencia publica) | Apache-2.0 (referencia publica) | Entrenado sobre 3 billones de tokens; orientado a experimentacion |

La diferencia de escala con los tres modelos de referencia es de uno a dos ordenes de magnitud, de modo que no son alternativas funcionales directas sino referencias de la misma franja de "modelos pequenos". No se ha localizado ningun modelo comparable en arquitectura y tokenizador dentro de la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial. Cualquier uso en produccion requiere contactar con el autor para aclarar los terminos.
- Idiomas no declarados: se desconoce la cobertura linguistica real, mas alla de lo que permita teoricamente el tokenizador de bytes. No hay garantia de calidad en castellano ni en ningun otro idioma.
- Contexto desconocido: al no publicarse la longitud de contexto, no es posible planificar conversaciones multi-turno ni documentos largos con garantias.
- Riesgo elevado de alucinacion y de incoherencia: con 9,5 M de parametros, la capacidad de mantener coherencia factual y discursiva es muy limitada; no es apto para tareas que exijan precision factual.
- Sesgos desconocidos: no se documenta la composicion del dataset ni el proceso de alineamiento, por lo que no se puede evaluar la presencia de sesgos.
- Sin resultados de benchmarks: no existe evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas equivalentes.
- Riesgo de ejecucion de codigo remoto: el tokenizador requiere `trust_remote_code=True`, lo que supone ejecutar codigo del autor; es una practica desaconsejada sin auditoria previa.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Anomalia en los metadatos: la fecha de creacion registrada es el 30 de septiembre de 2026, posterior a la fecha habitual de publicacion; conviene tratarla con cautela y verificar la ficha original.
- Incertidumbre sobre el origen: la model card es muy breve y no confirma el dominio declarado en el nombre del repositorio (fundamentos de Python) ni el proceso de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u2-mdagosta-b
- Inventario de artefactos (BOM.json): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u2-mdagosta-b/blob/main/BOM.json
- Divulgacion de contenido de entrenamiento UE (EU-BOM.json): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u2-mdagosta-b/blob/main/EU-BOM.json
- Perfil del autor: https://huggingface.co/mdagosta

No se han encontrado papers, repositorios de codigo, blogs ni demos adicionales en la informacion disponible.
