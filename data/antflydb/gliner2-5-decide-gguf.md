# antflydb/gliner2.5-decide-gguf

## Resumen

`antflydb/gliner2.5-decide-gguf` es una conversion a GGUF del modelo Fastino `GLiNER2.5-Decide`, un extractor de entidades basado en la familia GLiNER (Generalist and Lightweight NER). La publica antflydb como bundle de inferencia para su propio runtime de GLiNER2, con un esquema de ficheros partido (`gliner2_split_bundle/v1`) en el que el encoder y la cabeza GLiNER viajan como dos GGUF separados. El pipeline declarado es `token-classification` y el idioma soportado es unicamente el ingles.

El modelo cuenta con 52.523.029 parametros totales (dato real extraido de los safetensors del modelo base) y el repo ocupa aproximadamente 0,5 GB. No es un modelo generativo ni un LLM: es un extractor de entidades de tipo zero-shot, es decir, se le indican las etiquetas de entidad que se quieren reconocer y devuelve los tramos de texto correspondientes, sin reentrenamiento. Esa naturaleza compacta permite ejecutarlo en CPU y, segun el autor, incluso en el navegador mediante WebAssembly.

Su relevancia actual es doble. Por un lado, reduce el coste de despliegue de tareas de NER y extraccion estructurada a un fichero de decenas de megabytes. Por otro, sirve como ejemplo de empaquetado reutilizable para runtimes de inferencia ligeros (bundles con manifiesto, hashes SHA-256 y tokenizer incluidos), un patron que esta ganando traccion para ejecutar modelos en el borde y en cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabeza de clasificacion de tokens (familia GLiNER); el detalle de capas y dimensiones no esta disponible en la informacion proporcionada |
| Parametros totales | 52.523.029 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (encoder) en esta conversion; el modelo base se distribuye en safetensors sin cuantizar. Otros niveles no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF en dos ficheros (`gliner2-encoder.Q8_0.gguf` + `gliner_head.gguf`); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia GLiNER y de su uso como clasificador de tokens. La model card de la conversion Antfly se limita a describir el empaquetado: un encoder cuantizado en Q8_0 como primer GGUF y la cabeza GLiNER como segundo GGUF independiente, gobernados por el manifiesto `antfly_inference_bundle.json`. Este diseno partido implica que el artefacto no es un modelo single-file de llama.cpp y que los ficheros y sus rutas relativas deben mantenerse juntos para que el runtime los cargue correctamente.

Tampoco se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo paso por fases de RLHF o DPO. Al tratarse de un extractor de entidades y no de un modelo generativo, las tecnicas de alineamiento tipicas de los LLM (RLHF, DPO) no son de aplicacion directa. La innovacion relevante de este artefacto es de ingenieria de despliegue: la conversion a Q8_0 con validacion de integridad mediante SHA-256 para los ocho ficheros del bundle, y la verificacion del safetensors de origen (SHA-256 `40a5a23ff860dc3dff426cecd1048cacdd29c648c96db209dad818e9686dc997`) contra el repositorio upstream en la revision `5a7adf72a23b4d311abae6ce050d7f0012bb3416`.

Conviene senalar que el propio autor advierte de que la cuantizacion puede alterar las salidas respecto al checkpoint original, por lo que la equivalencia funcional con el modelo base no esta garantizada.

## Capacidades

- Extraccion de entidades con etiquetas definidas por el usuario en tiempo de inferencia (zero-shot NER): no requiere reentrenamiento para reconocer tipos de entidad nuevos.
- Clasificacion de tokens sobre texto en ingles, con salida de tramos (spans) y su etiqueta asociada.
- Ejecucion en el runtime de inferencia de Antfly, incluido su playground de navegador basado en WebAssembly.
- Empaquetado reproducible con manifiesto, tokenizer y sumas de verificacion SHA-256 de todos los ficheros.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (no es un modelo generativo).
- Capacidades multilingues: limitadas al ingles segun la informacion disponible.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Extraccion de entidades en contratos y documentos legales: se definen etiquetas como `parte_contratante`, `fecha`, `importe` o `jurisdiccion` y el modelo devuelve los tramos correspondientes sin entrenamiento especifico, lo que agiliza la revision documental.
- Deteccion de datos personales (PII) para cumplimiento: al poder declarar etiquetas de forma dinamica se pueden localizar nombres, direcciones o identificadores y alimentar un pipeline de anonimizacion previo a almacenamiento o envio a terceros.
- Preprocesado para sistemas RAG: extraer entidades clave de los fragmentos antes de indexarlos permite enriquecer los metadatos y mejorar el filtrado y la recuperacion en la busqueda vectorial.
- Normalizacion de datos de contacto y CRM: a partir de texto libre (correos, notas, formularios) se extraen campos estructurados como empresa, cargo o telefono para poblar registros de forma automatica.
- Extraccion estructurada en pipeline de datos: por su tamano (52,5 M de parametros) puede ejecutarse en lote sobre grandes volumenes de texto con un coste de computo muy bajo, integrandose como etapa de un ETL.
- Etiquetado en el navegador del cliente: el bundle esta pensado para el runtime WASM de Antfly, lo que permite hacer la extraccion en local sin enviar el texto a un servidor, util en escenarios con requisitos de privacidad estrictos.
- Enrutado y clasificacion de tickets de soporte: la deteccion de entidades (producto, version, error) ayuda a dirigir cada incidencia al equipo correspondiente antes de pasarla a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion recogido en la model card es una prueba de compatibilidad ("smoke test") del runtime Decide de Antfly, que supero 3 de 3 casos con los ficheros exactos del bundle y el runtime de extraccion WASM fijado. El propio autor aclara que se trata de una prueba de compatibilidad y no de una evaluacion completa de calidad ni de comportamiento entre navegadores.

## Requisitos de hardware

- VRAM estimada para inferencia: con 52,5 M de parametros en Q8_0 el encoder ocupa del orden de decenas de megabytes (aprox. 55-60 MB solo para los pesos), por lo que cabe en practicamente cualquier dispositivo. El repo completo pesa 0,5 GB.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en todas. Es viable incluso en CPU de movil y en el navegador via WebAssembly.
- Opciones de despliegue: runtime de inferencia de Antfly con soporte para `gliner2_split_bundle/v1` (incluido el playground WASM). No esta pensado para vLLM, TGI ni como modelo single-file de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `antflydb/gliner2.5-decide-gguf` | 52,5 M | No disponible | GGUF (bundle partido) | Apache-2.0 | Conversion Q8_0 para runtime Antfly; solo ingles |
| `fastino/GLiNER2.5-Decide` (modelo base) | 52,5 M | No disponible | Safetensors | Apache-2.0 | Checkpoint original sin cuantizar; fuente de la conversion |
| Otros modelos de la familia GLiNER | No disponible | No disponible | Safetensors / ONNX | No disponible | Alternativas de NER zero-shot de la misma familia, sin datos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al estar entrenado solo en ingles, el comportamiento sobre textos en otros idiomas no esta garantizado.
- Riesgo de alucinacion: al ser un extractor de entidades y no un generador, el riesgo se manifiesta como falsos positivos (tramos etiquetados incorrectamente) o falsos negativos, no como texto inventado.
- Limitaciones de idioma: soporte declarado unicamente para ingles (`en`).
- Limitaciones de contexto: la longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento con entradas largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor de la conversion advierte de que no es un artefacto oficial de Fastino, que no lo publico. Para despliegues reproducibles conviene fijar una revision concreta del repositorio en lugar de usar `main`.
- Advertencia de cuantizacion: la conversion a Q8_0 puede modificar las salidas respecto al checkpoint original; no se garantiza equivalencia funcional.
- Restriccion de empaquetado: no es un modelo single-file de llama.cpp. Los dos GGUF (encoder y cabeza) y las rutas relativas deben mantenerse juntos; separarlos rompe la carga.
- Madurez: el modelo registra 0 descargas y 0 likes, y solo ha superado una prueba de compatibilidad de 3 casos, no una evaluacion de calidad.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/antflydb/gliner2.5-decide-gguf
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Ficheros del repositorio upstream: https://huggingface.co/fastino/GLiNER2.5-Decide/tree/main
- Model card de Fastino (diseno, usos previstos, limitaciones y evaluacion): https://huggingface.co/fastino/GLiNER2.5-Decide
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
