# kotoshu/grammar-ur

## Resumen

grammar-ur v2 es un modelo de correccion gramatical (GEC, *grammatical error correction*) para urdu basado en la arquitectura GECToR, un paradigma de etiquetado de tokens (*token tagging*) en lugar de generacion secuencial. El autor es kotoshu y el modelo se distribuye como un unico artefacto ONNX en cuantizacion int8 junto con los artefactos del tokenizador, de modo que la inferencia no requiere un entorno de Python. El encoder de partida es mdeberta-v3-base, sobre el que se aplica un esquema GECToR de tres rondas de entrenamiento.

El modelo aborda un problema concreto y poco cubierto: la deteccion y correccion de errores ortograficos y gramaticales en urdu, incluyendo confusiones de letras homofonas, sustituciones entre grafias arabes y urdu (por ejemplo ك→ک, ي→ی), errores por adyacencia de teclado, transposiciones, uniones indebidas de palabras y sustituciones por palabras reales. El repositorio ocupa 0,4 GB y la licencia es BSD-3-Clause.

Su relevancia practica reside en el empaquetado: al ser un tagger ONNX int8 autocontenido, puede integrarse en servicios de correctura sin dependencias de frameworks de aprendizaje profundo, y el autor publica metricas de calidad medidas sobre un conjunto de evaluacion propio de 1.500 frases corruptas. El modelo es de autoria reciente y no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GECToR sobre encoder mdeberta-v3-base (token tagging, 3 rondas de entrenamiento) |
| Parametros totales | no disponible (el encoder de partida es mdeberta-v3-base; no se especifica el recuento exacto del artefacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (artefacto ONNX publicado) |
| Idiomas soportados | urdu (ur) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (unico fichero) + artefactos de tokenizador |

## Arquitectura y entrenamiento

El modelo sigue el paradigma GECToR: en lugar de generar la frase corregida token a token, predice una etiqueta de transformacion por cada token de entrada (mantener, sustituir, insertar, borrar, etc.), lo que reduce el coste de inferencia y evita el sesgo de fluidez tipico de los modelos generativos en GEC. El encoder es mdeberta-v3-base y el entrenamiento se organiza en tres rondas segun el esquema GECToR habitual. La decodificacion en produccion usa 4 rondas con una puerta de confianza cero (*zero-confidence gate*), segun la model card.

Los datos de entrenamiento son un paquete de corrupcion sintetica derivado del CLE Urdu Digest Corpus 1M (International Package, Catalogue No. CLE12T003) y del CLE Urdu WordNet (International Package, Catalogue No. CLE12L001), ambos del Center for Language Engineering (CLE-KICS), Universidad de Ingenieria y Tecnologia de Lahore (Pakistan). El conjunto de evaluacion retenido consta de 1.500 frases corruptas con seis clases equilibradas de error unico: conjuntos de letras homofonas, confusiones arabe↔urdu, adyacencia de teclado, transposiciones, uniones de espacio y sustituciones por palabras reales. No se especifica el numero de tokens de entrenamiento ni si hubo RLHF o DPO (no aplicable en un tagger de este tipo).

Como innovacion destacable, el autor documenta una prueba de extraccion y memorizacion previa a la publicacion (clausula 16(e) del acuerdo de licencia Ribose⇄CLE, firmado el 2026-10-29): cero reproducciones novedosas de 25 palabras o mas del corpus en las decodificaciones, AUC de inferencia de pertenencia de 0,485 (sin senal) y ausencia de superficie de completado o extraccion. Los recursos linguisticos de CLE-KICS no se redistribuyen ni son extraibles de los pesos.

## Capacidades

- Correccion ortografica y gramatical en urdu mediante etiquetado de tokens.
- Deteccion de confusiones entre grafias arabes y urdu (canonicalizacion ك→ک, ي→ی).
- Correccion de errores por adyacencia de teclado, usando el layout fonetico CRULP para el ranking de proximidad.
- Correccion de transposiciones de caracteres y de uniones indebidas de palabras.
- Deteccion de sustituciones por palabras reales (errores que un corrector ortografico clasico no captura).
- Decodificacion multi-ronda (4 rondas) con puerta de confianza cero para evitar correcciones de baja confianza.
- Inferencia sin runtime de Python: el artefacto ONNX incluye el tokenizador.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- Soporte multilingue limitado al urdu.

## Casos de uso

- Correccion en editores y procesadores de texto en urdu: el tagger puede aplicarse por frase o parrafo para sugerir correcciones de homofonos y confusiones arabe↔urdu antes de guardar el documento, con la ventaja de que el artefacto ONNX se ejecuta sin dependencias de Python en el cliente o en el servidor.
- Preprocesado de corpus para NLP en urdu: limpiar textos raspados de web o redes sociales antes de entrenar modelos de clasificacion, traduccion o analisis de sentimiento, reduciendo el ruido ortografico que degrada las metricas aguas abajo.
- Moderacion y normalizacion de contenido generado por usuarios: normalizar comentarios y formularios en urdu para que las busquedas y los filtros por palabra clave funcionen sobre texto canonicalizado (por ejemplo, unificando ک/ي).
- Digitalizacion de textos mecanografiados: corregir errores tipicos de tecleo (adyacencia de teclado, transposiciones) en transcripciones de documentos en urdu antes de archivarlos.
- Integracion en pipelines de mensajeria: correccion ligera en el servidor para chats y correos en urdu, donde la latencia baja del tagger int8 permite procesar cada mensaje en el flujo de envio.
- Sistemas de ensenanza de urdu: generar sugerencias de correccion didacticas que expliquen el tipo de error (homofono, transposicion, union de palabras) a partir de las etiquetas de transformacion predichas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de evaluacion retenido de 1.500 frases corruptas en urdu, decodificadas con este mismo artefacto y puntuadas por solapamiento de spans:

| Metrica | Valor |
|---|---|
| F0.5 | 0.640 |
| Precision | 0.678 |
| Recall | 0.524 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros correctores de urdu.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,4 GB en int8, por lo que la huella en memoria es del orden de cientos de MB y cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; una RTX 3060 o superior es mas que suficiente. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, incluidas GPUs de gama baja y portatiles.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) y el gem de Ruby kotoshu (`Kotoshu.setup(:ur)`), que gestiona la tokenizacion por espacios, la canonicalizacion arabe→urdu y el layout CRULP. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un tagger ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de correccion gramatical para urdu en la informacion proporcionada. Como referencia de categoria, se indica lo siguiente sin datos de rendimiento verificables:

| Modelo | Enfoque | Idioma | Licencia | Formato |
|---|---|---|---|---|
| grammar-ur v2 (kotoshu) | GECToR sobre mdeberta-v3-base | urdu | BSD-3-Clause | ONNX int8 |
| Correctores GEC generativos multilingues | seq2seq / decoder | multilingue | variable | safetensors, GGUF |
| Correctores ortograficos basados en diccionario | reglas + lexico | urdu | variable | no aplica |

No disponible la comparacion cuantitativa de parametros, contexto ni rendimiento con alternativas concretas.

## Limitaciones y advertencias

- El recall es bajo (0.524): el modelo deja pasar aproximadamente la mitad de los errores presentes en el conjunto de evaluacion, por lo que no debe usarse como unico mecanismo de control de calidad.
- El conjunto de evaluacion es sintetico y de autoria propia; el rendimiento sobre texto real de dominios abiertos puede diferir y no esta medido.
- El modelo solo cubre urdu; no procesa otros idiomas ni code-switching con ingles u otros idiomas sin evaluacion.
- No se especifica la longitud de contexto soportada; frases o parrafos largos pueden requerir troceado previo.
- Riesgo de alucinacion bajo por el paradigma de etiquetado, pero existe riesgo de correcciones espurias en texto ya correcto (falsos positivos), atenuado por la puerta de confianza cero pero no eliminado.
- Sesgos: no se documentan analisis de sesgo; el modelo se entrena sobre un corpus de prensa (CLE Urdu Digest) y puede no representar variedades dialectales o registros informales.
- Licencia BSD-3-Clause para los pesos; los recursos linguisticos de CLE-KICS no se redistribuyen y su uso comercial no requiere licencia adicional segun la clausula 9 del acuerdo, pero conviene revisar los terminos del acuerdo Ribose⇄CLE antes de un despliegue comercial.
- El repositorio no registra descargas ni likes; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kotoshu/grammar-ur
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
