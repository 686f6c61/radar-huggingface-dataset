# litillabs/litil-legal-pii-finder

## Resumen

LiTiL Legal PII Finder es un modelo de extraccion de informacion (token classification) desarrollado por LiTiL Labs y publicado en HuggingFace. Es un ajuste fino completo del checkpoint `fastino/gliner2-privacy-filter-PII-multi`, construido sobre el framework GLiNER2, y su funcion es localizar siete categorias concretas de datos personales y sensibles en texto juridico: `account_number`, `address`, `email`, `person`, `phone_number`, `private_url` y `sensitive_date`. La salida no es una alerta generica, sino una lista de spans con etiqueta, offsets de caracteres (base cero, `end` exclusivo) y puntuacion de confianza, lo que permite redactar, enmascarar o auditar posiciones exactas dentro del documento original.

Tecnicamente es un modelo de 307.098.645 parametros (unos 307 M), con pesos en safetensors y un payload de aproximadamente 1,23 GB, pensado para ejecutarse en CPU con float32. El autor recomienda un umbral de 0,90 y una ventana de 512 tokens como maximo en el entrenamiento, por lo que los documentos largos deben trocearse preservando los offsets originales y volver a fusionar los resultados. Su relevancia actual esta en el preprocesado de flujos juridicos: se coloca despues del OCR o de la extraccion de texto y antes de que los documentos entren en motores de busqueda, sistemas RAG, comparticion con terceros o procesamiento externo.

El modelo esta entrenado y evaluado unicamente en ingles (`language: en`) y declara licencia Apache 2.0. No es un modelo generativo: no produce texto libre ni razonamiento multi-paso, sino etiquetado de spans. Su validacion publicada se limita a conjuntos sinteticos (F1 de span exacto 0,9668 sobre 1.046 filas y F1 0,9333 en una comparacion de 6 casos nuevos frente al modelo base), por lo que debe tratarse como un componente de un pipeline con verificacion independiente, no como un sistema de anonimizacion autocontenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades por token classification); backbone concreto no disponible en la informacion proporcionada |
| Parametros totales | 307.098.645 (aproximadamente 307 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo usado en el entrenamiento; el autor no declara una ventana de contexto oficial superior) |
| Tipos de cuantizacion | No disponible. El unico checkpoint publicado son pesos en safetensors (float32); no se anuncian variantes GGUF, int8 o AWQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint GLiNER2 completo, no un adaptador PEFT); incluye ficheros de tokenizer, configuracion de nivel superior y `encoder_config/config.json` |
| Etiquetas soportadas | `account_number`, `address`, `email`, `person`, `phone_number`, `private_url`, `sensitive_date` |
| Umbral recomendado | 0,90 |
| Libreria / runtime | `gliner2` 1.3.1, PyTorch 2.12.0, Transformers 5.1.0, SentencePiece 0.2.1 |
| Modelo base | `fastino/gliner2-privacy-filter-PII-multi` (snapshot probado `c153999da5f4c509df4322b0c6a1baf3d2c284d7`) |
| Tamano del repositorio | 1,2 GB (payload preparado aproximadamente 1,23 GB) |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un checkpoint completo de GLiNER2 orientado a token classification, no un adaptador LoRA/PEFT sobre el modelo base. GLiNER2 es una familia de extractores de entidades que reciben un texto y una lista de etiquetas en lenguaje natural, y devuelven los spans coincidentes con su posicion y su puntuacion; en este caso la ontologia esta fijada a siete etiquetas y el autor recomienda pasarlas siempre en el mismo orden con umbral 0,90. La salida incluye `start`, `end` (exclusivo, base cero), `label`, `text` y `confidence`, lo que permite mapear cada deteccion al documento original y generar registros de auditoria. El autor no detalla en la informacion disponible la arquitectura interna exacta del encoder ni el numero de capas.

El ajuste fino se hizo sobre una mezcla de post-entrenamiento de 2.000 filas: 1.660 ejemplos generados y 340 negativos derivados de fuentes publicas, sin datos privados de clientes o usuarios segun la revision declarada. La configuracion de entrenamiento fue de 512 tokens de maximo, batch size 2 con acumulacion de gradiente 4 (batch efectivo 8), learning rate de 1e-5 para el encoder y 5e-4 para la cabeza de tarea, con 50 pasos de optimizador y 400 muestras vistas en la ejecucion retenida. Es, por tanto, un ajuste muy corto y de bajo volumen de datos, lo que explica que la evaluacion se apoye en conjuntos sinteticos y que el riesgo de deriva de distribucion en documentos reales sea relevante. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion (no aplica a un modelo extractivo).

## Capacidades

- Extraccion de entidades con span exacto: devuelve offsets de caracteres verificables, no solo etiquetas a nivel de documento.
- Politica cerrada de siete etiquetas: numeros de cuenta, direcciones, correos electronicos, personas, telefonos, URL privadas y fechas sensibles.
- Puntuacion de confianza por span, con umbral operativo recomendado de 0,90.
- Multietiqueta en una sola pasada sobre el mismo texto.
- Inferencia en CPU con float32, sin necesidad de GPU, segun las pruebas del autor.
- Integracion con detectores deterministas complementarios (reglas, expresiones regulares) para identificadores fuera de su politica de siete etiquetas.
- Salida normalizada en JSON, apta para alimentar superposiciones de redaccion, placeholders tipados o colas de revision de privacidad.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling ni capacidades de agente: es un modelo puramente extractivo.
- Sin soporte multilingue declarado: solo ingles.

## Casos de uso

- Redaccion previa a la difusion de documentos judiciales: el modelo localiza los siete tipos de dato sensible y sus offsets exactos, de modo que la capa de redaccion puede dibujar la mascara sobre las posiciones concretas en lugar de aplicar sustituciones ciegas por patron. Es adecuado porque el offset permite mantener la trazabilidad entre la mascara y el texto original.
- Enmascaramiento antes de indexar en un buscador interno o en un RAG juridico: se ejecuta despues del OCR o de la extraccion de texto y antes de que el documento entre en el indice, sustituyendo correos, telefonos y numeros de cuenta por placeholders tipados. El requisito de trocear a 512 tokens obliga a preservar offsets al dividir.
- Cola de revision de privacidad asistida: los spans con confianza cercana al umbral se enrutan a revision humana, mientras los de confianza alta se procesan de forma automatica; el autor insiste en validar las redacciones obligatorias de forma independiente.
- Anonimizacion de expedientes antes de compartirlos con proveedores o peritos externos: el modelo actua como primera pasada y los detectores deterministas cubren identificadores fuera de sus siete etiquetas (credenciales, identificadores nacionales, etc.).
- Cumplimiento y e-discovery: generar un registro de auditoria que conecte cada mascara con su ubicacion original, util para demostrar que se aplico una minimizacion de datos antes del tratamiento.
- Triaje de volumenes historicos: clasificar y marcar rapidamente que documentos contienen datos personales antes de decidir si se conservan, se anonimizan o se eliminan, ejecutando la inferencia en CPU para no depender de GPU.
- Etiquetado asistido para construir otros modelos: los spans y confianzas pueden usarse como preanotacion en un ciclo de active learning, con revision humana de los casos de baja confianza.
- Preprocesado de contratos y correspondencia escaneada: tras el OCR, el modelo extrae personas, direcciones y fechas sensibles para alimentar un sistema de gestion documental.
- Deteccion de URL privadas y fechas sensibles en correos o anexos: permite marcar enlaces internos y fechas que no deben salir del perimetro de la organizacion.

## Benchmarks y rendimiento

Solo se han publicado las metricas de evaluacion del propio autor, todas sobre datos sinteticos:

| Evaluacion | Conjunto | Metrica | Resultado |
|---|---|---|---|
| Span exacto | 1.046 filas sinteticas deduplicadas | F1 | 0,9668 |
| Comparacion directa (8 spans, 6 casos nuevos, umbral 0,90) | Sintetico | F1 LiTiL | 0,9333 |
| Comparacion directa (mismos textos, etiquetas y umbral) | Sintetico | F1 modelo base | 0,8571 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos generativos, ya que no es un modelo generativo. Tampoco hay resultados sobre corpus juridicos reales, multilingues o de otro dominio: la unica medicion agregada (1.046 filas) procede de formularios sinteticos, y la comparacion con el modelo base se limita a 8 spans en 6 casos, lo que el propio autor describe como una comprobacion focalizada de la interfaz publicada.

## Requisitos de hardware

- VRAM estimada (calculada a partir del numero de parametros, 307 M): aproximadamente 1,23 GB solo para pesos en float32; en float16 serian unos 0,61 GB y en int8 unos 0,31 GB. A esto hay que sumar el consumo de activaciones y del runtime de PyTorch. El autor solo ha probado inferencia en CPU con float32.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente para el checkpoint en float32 (por ejemplo, GTX 1650, RTX 3050, T4, RTX 4090, A100, H100). Para este tamano, una GPU de gama alta no aporta ventaja significativa frente a una de gama media.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU como unico dispositivo (el runtime probado por el autor).
- Opciones de despliegue: el runtime documentado es Python con `gliner2`, PyTorch y Transformers, invocando `GLiNER2.from_pretrained(...)` y `extract_entities(...)`. Tambien se ofrece un `demo.py` con modo `--preflight` y `--examples` para paquetes offline. No hay evidencia en la informacion disponible de soporte oficial para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime; al no existir variantes GGUF publicadas, llama.cpp y Ollama no son una via directa.
- Latencia y throughput: no disponible. El autor no publica medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Etiquetas / tarea | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `litillabs/litil-legal-pii-finder` | 307.098.645 | 7 etiquetas de PII legal, span exacto | 512 tokens (entrenamiento) | F1 span exacto 0,9668 (1.046 filas sinteticas); F1 0,9333 en 6 casos nuevos | Apache 2.0 | HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| `fastino/gliner2-privacy-filter-PII-multi` (modelo base) | No disponible | Filtro de privacidad multilingue (etiquetas no detalladas en la informacion disponible) | No disponible | F1 0,8571 en el test comparativo de 6 casos | No disponible | HuggingFace; snapshot probado `c153999d...` |
| Otras alternativas de deteccion de PII (Presidio, spaCy NER, GLiNER v1) | No disponible | Reglas + NER generico | No disponible | No disponible | No disponible | No disponible |

La comparacion solo puede establecerse con solidez frente al modelo base, porque es el unico para el que el autor publica resultados en los mismos textos, etiquetas y umbral. Frente a soluciones basadas en reglas, la ventaja declarada es que el modelo generaliza a variantes no previstas; la desventaja es que requiere validacion estadistica y no garantiza cobertura de identificadores fuera de sus siete etiquetas.

## Limitaciones y advertencias

- Cobertura limitada por diseno: solo siete etiquetas. Quedan fuera credenciales, contrasenas, identificadores nacionales, numeros de pasaporte, datos de tarjeta o categorias especiales del RGPD (salud, religion, biometria). El autor recomienda anadir detectores deterministas para esos casos.
- Sesgos conocidos: no disponible. El autor no publica analisis de sesgo ni desagregacion por subgrupos.
- Riesgo de alucinacion: al ser un modelo extractivo no genera texto, pero si puede producir spans incorrectos o asignar confianzas altas a coincidencias erroneas (el ejemplo de la model card muestra confianza 1,0). La puntuacion es una senal de ranking, no una garantia, y el autor pide validar las redacciones obligatorias de forma independiente.
- Evaluacion sobre datos sinteticos: la metrica principal (F1 0,9668) proviene de 1.046 filas de formularios sinteticos y la comparacion con el base de solo 8 spans en 6 casos. El rendimiento en documentos legales reales, con OCR ruidoso, tablas o maquetacion compleja, no esta medido.
- Volumen de entrenamiento reducido: 2.000 filas (1.660 generadas, 340 negativas), 50 pasos de optimizador y 400 muestras vistas. Es un ajuste corto, con riesgo de sobreajuste a la distribucion sintetica de entrenamiento.
- Limite de contexto: 512 tokens maximos en entrenamiento. Los documentos largos requieren troceado con preservacion de offsets y fusion posterior por offset y etiqueta; un troceado mal hecho rompe entidades a caballo entre fragmentos.
- Idioma: solo ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas, aunque el modelo base sea multilingue.
- Licencia: el checkpoint se publica bajo Apache 2.0, lo que en principio permite uso comercial. Sin embargo, la licencia del modelo base y del software GLiNER2 no se detalla en la informacion disponible y debe verificarse antes de un despliegue comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Restricciones adicionales de licencia para uso comercial: no disponible mas alla de lo indicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-legal-pii-finder
- Modelo base: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
- Repositorio del autor en HuggingFace: https://huggingface.co/litillabs
- Paper, blog o repositorio adicional de GLiNER2: no disponible en la informacion proporcionada
- Las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a articulos de consumo, ofertas de DVD y servicios de pago, sin relacion con LiTiL Labs, GLiNER2 ni extraccion de PII.
