# litillabs/litil-contract-extractor-1.7b

## Resumen

LiTiL Contract Extractor 1.7B es un adaptador LoRA de tipo PEFT desarrollado por LiTiL Labs que se monta sobre el modelo base Qwen/Qwen3-1.7B. Su funcion es responder a preguntas de extraccion sobre contratos en ingles devolviendo el fragmento literal del acuerdo que responde a la pregunta, o el valor estable `NOT_PRESENT` cuando el termino solicitado no aparece. El adaptador esta especializado en las 41 categorias de la taxonomia CUAD (fechas de entrada en vigor, partes, ley aplicable, renovaciones, nombres de acuerdo, seguros, etc.).

La relevancia del modelo esta en su relacion calidad/tamano: con solo 1.7B de parametros en el modelo base y un adaptador de 278.973.888 bytes (~266 MiB), consigue mejoras medibles frente al Qwen3-1.7B sin adaptar en un conjunto de test con contratos disjuntos (74,46 % de exact match normalizado frente a 70,78 %). Esto lo hace desplegable en hardware modesto y adecuado como etapa de extraccion dentro de una arquitectura de contract intelligence situada despues del parseo de documentos y de la recuperacion de pasajes.

El modelo no es un asistente juridico general ni un generador de texto libre: es un extractor de spans verbatim con un contrato de entrada y salida fijo. Se distribuye unicamente en safetensors como adaptador PEFT, requiere el modelo base para funcionar, esta documentado solo en ingles y su licencia es "other", sin condiciones de uso comercial detalladas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-1.7B) con adaptador PEFT LoRA supervisado |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA ocupa 278.973.888 bytes (~266 MiB) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento se limito a 2.048 tokens y la evaluacion se ejecuto con `max_model_len=8192` |
| Tipos de cuantizacion | No disponible; el adaptador se publica sin cuantizar en safetensors |
| Idiomas soportados | Ingles (en), unico idioma declarado |
| Licencia | other |
| Formato de pesos | safetensors (`adapter_model.safetensors`, adaptador PEFT LoRA) |
| Tipo de artefacto | Adaptador; requiere el modelo base Qwen/Qwen3-1.7B |
| Revision del modelo base evaluada | `d8441e71a3dfa66b62d7b3ed1cce12da3e813294` |
| SHA-256 del adaptador | `cf78d5ff2223fdbcb19202e4b55be352cf86fcc7173c6033f8199cf0e0c58e0c` |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | text-generation |
| Dataset de entrenamiento | theatticusproject/cuad |
| Fecha de la model card | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64, alpha 128 y dropout 0,05, entrenado mediante fine-tuning supervisado con PEFT sobre Qwen/Qwen3-1.7B. El entrenamiento uso 18.819 filas procedentes de 459 contratos publicos de CUAD, con 41 categorias de pregunta; de esas filas, 6.084 contenian un span presente y 12.735 eran casos `NOT_PRESENT`. La configuracion fue de 3 epocas, batch por dispositivo 2, acumulacion de gradiente 8 (batch efectivo 16), learning rate 2e-4, warmup del 5 %, weight decay 0,01, semilla 42 y longitud maxima de 2.048 tokens. La revision de fuentes retenida no encontro datos de post-entrenamiento privados para esta ejecucion.

La innovacion practica no esta en la arquitectura, sino en el contrato de interfaz. La entrada se compone de un bloque `<context>` con el texto del contrato o el pasaje recuperado, una linea `Category:` con la categoria CUAD y una linea `Question:` con la pregunta de extraccion, manteniendo una unica categoria por peticion. La salida es exactamente un elemento XML `<answer>...</answer>` que contiene el span verbatim o `NOT_PRESENT`. Este diseno permite parsear la respuesta de forma determinista y conservar la cita textual junto a su valor estructurado, algo poco habitual en adaptadores de extraccion de informacion juridica.

## Capacidades

- Extraccion de spans verbatim en contratos en ingles para las 41 categorias de la taxonomia CUAD: fechas, partes, nombre del acuerdo, ley aplicable, terminos de renovacion, seguros y otras clausulas.
- Devolucion de un valor de ausencia estable y parseable (`NOT_PRESENT`) cuando el termino no esta en el texto, en lugar de inventar contenido.
- Salida estructurada en XML (`<answer>`), pensada para ser parseada por un sistema posterior y almacenada con su localizacion de origen.
- Respuesta a una unica pregunta de extraccion por peticion, con una sola categoria CUAD por consulta.
- Generacion de texto conversacional segun el pipeline declarado (`text-generation`), aunque el uso previsto es de extraccion, no de dialogo abierto.
- Capacidades de dominio: legal, contratos, question-answering e information extraction.
- No se declara soporte de tool calling ni function calling.
- No se declaran capacidades de vision, audio, thinking mode ni razonamiento multi-paso.
- No se declara soporte multilingue: el unico idioma es el ingles.

## Casos de uso

- Extraccion de metadatos contractuales en un stack de contract intelligence: el modelo se situa despues del parseo del documento y de la recuperacion de la clausula candidata, y devuelve el valor exacto o el span de soporte para poblar registros estructurados.
- Poblacion automatica de un CLM o repositorio de contratos: fechas de entrada en vigor, partes firmantes, ley aplicable y plazos de renovacion se extraen como campos con cita de origen, lo que permite auditar cada valor.
- Alimentacion de playbooks de revision juridica: los campos extraidos se comparan contra las posiciones estandar de la organizacion y solo los contratos con desviaciones pasan a revision humana, reduciendo el volumen de lectura manual.
- Control de cumplimiento por ausencia: el valor `NOT_PRESENT` permite verificar de forma masiva que un contrato carece de una clausula obligatoria (por ejemplo, una clausula de ley aplicable concreta) y generar alertas.
- Due diligence en operaciones de M&A: revision por lotes de carteras de contratos para extraer y comparar condiciones de renovacion, partes y fechas, manteniendo la cita textual como evidencia.
- Migracion o auditoria de contratos historicos: procesamiento de documentos antiguos para reconstruir un registro contractual estructurado a partir de texto no normalizado.
- Generacion de conjuntos de datos juridicos etiquetados: uso del extractor para pre-etiquetar spans en corpus propios, con revision humana posterior, dado que el modelo devuelve el texto literal y no una parafrasis.
- Respuesta a preguntas puntuales sobre un contrato largo: recuperacion previa de los pasajes relevantes y consulta al modelo con la categoria y la pregunta correspondientes, conservando la ubicacion de la fuente.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (`verified: false`) sobre el split de test con contratos disjuntos de CUAD: 2.091 pares contrato-pregunta procedentes de 51 contratos, disjuntos de los 459 contratos de entrenamiento. La comparacion se ejecuto con decodificacion greedy y la misma construccion de entrada para ambos modelos.

| Metrica | Qwen3-1.7B base | LiTiL Contract Extractor | Diferencia |
|---|---:|---:|---:|
| Exact match normalizado | 70,78 % | 74,46 % | +3,68 puntos |
| Token F1 | 0,7306 | 0,7690 | +0,0384 |
| Character Jaccard | 0,7460 | 0,7927 | +0,0467 |

Las mayores ganancias del adaptador se registraron en las preguntas de nombre de documento, fecha del acuerdo, fecha de entrada en vigor, partes y seguros. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 266 MiB (278.973.888 bytes) y debe cargarse junto al modelo base.
- El modelo base de 1.7B en BF16 requiere del orden de 3,4 GB solo para los pesos, antes de sumar el adaptador, las activaciones y la cache KV.
- Para pasajes cortos o recuperados, 6-8 GB de memoria de acelerador son un punto de partida practico segun la propia model card.
- Cabe en GPU de consumo con 8 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 3070 8 GB para pasajes cortos); esta ultima estimacion es una deduccion a partir del rango de 6-8 GB indicado por el autor, no un dato publicado.
- La comparativa retenida se ejecuto con vLLM sobre una unica NVIDIA L40S, con `max_model_len=8192`, decodificacion greedy y 200 tokens generados.
- vLLM es la unica opcion de despliegue confirmada en la informacion disponible; no se mencionan llama.cpp, Ollama, TGI ni otras alternativas.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CUAD (exact match / token F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiTiL Contract Extractor 1.7B | Adaptador LoRA de ~266 MiB sobre Qwen3-1.7B | No disponible (evaluado con 8192) | 74,46 % / 0,7690 | other | HuggingFace, 0 descargas, 0 likes |
| Qwen3-1.7B (base, sin adaptar) | 1.700 millones | No disponible en la informacion | 70,78 % / 0,7306 | No disponible en la informacion | HuggingFace (Qwen/Qwen3-1.7B) |
| Otros adaptadores de extraccion legal comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio resultados relevantes sobre modelos comparables de extraccion de clausulas contractuales, por lo que no se incluyen alternativas adicionales con datos verificables.

## Limitaciones y advertencias

- Los resultados cubren exclusivamente las 41 categorias de pregunta de CUAD; no deben generalizarse a esquemas de extraccion arbitrarios sin una evaluacion previa.
- La calidad en contratos largos depende de la recuperacion o del troceado, porque los ejemplos de entrenamiento estaban limitados a 2.048 tokens.
- Las puntuaciones agregadas mezclan extraccion de spans y casos `NOT_PRESENT`; en produccion conviene medir ambos comportamientos por separado.
- Riesgo de alucinacion en el span devuelto: aunque el diseno pide texto verbatim, no hay garantia de que el fragmento exista literalmente en el contrato, por lo que se recomienda verificar la cita contra el documento original.
- Modelo unicamente en ingles: no se declara soporte de contratos en castellano ni en otros idiomas.
- La licencia es "other" y no se detallan en la informacion disponible las condiciones de uso comercial, redistribucion o atribucion; es imprescindible revisar los terminos del repositorio antes de un despliegue productivo.
- Los benchmarks estan declarados por el autor con `verified: false`, es decir, no han sido verificados por un tercero.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- Al ser un adaptador PEFT, requiere cargar el modelo base Qwen/Qwen3-1.7B, cuya licencia y condiciones son independientes de las del adaptador.
- El modelo devuelve una unica respuesta por peticion y una unica categoria por consulta; no esta disenado para flujos conversacionales multi-turno ni para razonamiento multi-paso.
- No se declaran capacidades de tool calling, function calling ni integracion con agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litillabs/litil-contract-extractor-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio resultados relevantes sobre este modelo)
