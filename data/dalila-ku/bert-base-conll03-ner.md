# Dalila-Ku/bert-base-conll03-ner

## Resumen

`Dalila-Ku/bert-base-conll03-ner` es un ajuste fino de `google-bert/bert-base-uncased` para reconocimiento de entidades nombradas (NER) sobre texto informativo en ingles. Lo publica la usuaria Dalila-Ku como entrega de la asignatura U2T01 ("Adapting BERT for NLP tasks", Unidad 2, Universidad Politecnica de Yucatan). No es un modelo generativo: es un encoder BERT-base con una cabeza lineal de clasificacion por token que asigna una de 9 etiquetas del esquema BIO (persona, organizacion, localizacion, miscelanea o ninguna) a cada token de entrada.

Tecnicamente es un transformer encoder bidireccional de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con 108.898.569 parametros entrenables segun el recuento real de los pesos safetensors del repositorio (0,4 GB). La ventana de contexto esta limitada a los 512 tokens de posiciones de `bert-base-uncased`, y el modelo solo trabaja con ingles. El entrenamiento se hizo sobre los splits oficiales de CoNLL-2003 (`lhoestq/conll2003`) mediante ajuste fino completo durante 4 epocas, con una tasa de aprendizaje de 2e-5 para el cuerpo BERT y 1e-3 para la cabeza.

Su relevancia es acotada pero clara: sirve como linea base reproducible y ligera (entrenamiento en 4,4 minutos en una unica T4) para tareas de extraccion de entidades en noticias en ingles, y como punto de comparacion documentado frente a una variante de ajuste parcial (solo las 2 ultimas capas del encoder) que obtuvo 4,79 puntos menos de F1 en test. No es un modelo validado por la comunidad: el repositorio acumula 0 descargas y 1 like, y su proposito declarado es academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT-base (12 capas, 768 de hidden, 12 cabezas de atencion) mas cabeza lineal de clasificacion por token |
| Parametros totales | 108.898.569 (recuento de safetensors del repositorio; la model card cita `bert-base-uncased` como 110M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de `bert-base-uncased`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio (0,4 GB) es consistente con pesos en fp32, y la conversion a INT8/ONNX/fp16 requiere herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased (ajuste fino completo) |
| Tarea (pipeline) | token-classification |
| Esquema de etiquetas | 9 etiquetas BIO: O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC, B-MISC, I-MISC |
| Dataset de entrenamiento | lhoestq/conll2003 (splits oficiales train/validation/test) |
| Repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `bert-base-uncased`: encoder transformer bidireccional con embeddings de posicion absolutas, preentrenado con masked language modeling y next sentence prediction. Sobre el ultimo estado oculto de cada token se anade una cabeza lineal que proyecta a 9 clases (esquema BIO con las cuatro categorias de CoNLL-2003: persona, organizacion, localizacion y miscelanea). El pipeline de Hugging Face aplica `softmax` por token y agrupa despues las etiquetas BIO en entidades completas.

El entrenamiento se realizo por ajuste fino completo (cuerpo BERT y cabeza actualizados conjuntamente), con 4 epocas, batch de 32 en entrenamiento y 64 en evaluacion, semilla 42, learning rate de 1e-3 para la cabeza y 2e-5 para el cuerpo, y un tiempo total de 4,4 minutos en una unica GPU T4. La alineacion entre etiquetas a nivel de palabra y tokens WordPiece se resolvio asignando la etiqueta unicamente al primer subword de cada palabra; los subwords de continuacion, `[CLS]`, `[SEP]` y el padding reciben `-100` para que `CrossEntropyLoss` los ignore. Como comparacion interna se entreno tambien una variante de ajuste parcial que congelaba todo el cuerpo BERT salvo las 2 ultimas capas (14.182.665 parametros entrenables, 1,9 minutos), pero la version entregada es la de ajuste completo. La metrica de evaluacion es F1 de seqeval a nivel de entidad, no de token, para evitar que la clase dominante "O" infle artificialmente la exactitud. No se documenta ningun uso de RLHF, DPO ni decodificacion especulativa, algo esperable en un modelo encoder de clasificacion.

## Capacidades

- Reconocimiento de entidades nombradas en texto informativo en ingles, con cuatro categorias: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC).
- Clasificacion a nivel de token con esquema BIO, agregable a entidades mediante la agregacion estandar del pipeline `token-classification`.
- Procesamiento de secuencias de hasta 512 tokens; no incluye ventana deslizante por defecto, por lo que los documentos largos requieren troceado con solapamiento en el codigo de aplicacion.
- Manejo de alineacion palabra-subword en la salida (la etiqueta se coloca en el primer subword de cada palabra), lo que facilita la reconstruccion de entidades con offsets sobre el texto original.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es exclusivamente un clasificador.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No incorpora modo de pensamiento (thinking), vision, audio ni ninguna modalidad adicional.
- Tokenizador WordPiece uncased: la entrada se normaliza a minusculas, de modo que la informacion de mayusculas (pista relevante en NER) no llega al modelo.

## Casos de uso

- Extraccion de entidades en noticias en ingles para indexacion y busqueda: dado un corpus de articulos en ingles, el modelo permite etiquetar personas, organizaciones y lugares y construir indices invertidos o filtros facetados por entidad, con la ventaja de que cualquier GPU con 2 GB de VRAM puede procesar el corpus completo.
- Preetiquetado para anotacion humana: integrarlo en herramientas como Label Studio o Prodigy para pregenerar entidades PER/ORG/LOC/MISC sobre textos periodisticos, reduciendo el trabajo manual de anotacion antes de la revision del anotador.
- Enriquecimiento de grafos de conocimiento: a partir de entidades y sus offsets en el texto se pueden poblar nodos de tipo persona/organizacion/localizacion y relaciones de coocurrencia dentro de la misma noticia, usando la salida BIO para delimitar menciones.
- Deteccion de informacion personal en textos en ingles: como primer paso de un pipeline de anonimizacion, localizando nombres de persona (PER) y organizaciones (ORG) antes de aplicar enmascarado, con la advertencia de que no cubre direcciones, correos ni telefonos.
- Analisis de medios y seguimiento de menciones: monitorizar la aparicion de una organizacion concreta en prensa economica en ingles y medir frecuencia y contexto a lo largo del tiempo, aprovechando que el modelo esta especializado en registro periodistico.
- Analisis retrospectivo de noticias de agencia: al estar entrenado sobre Reuters de los anos 90, es adecuado para procesar archivos historicos de teletipo en ingles y extraer las entidades citadas en cada pieza para estudios economicos o historicos.
- Linea base en investigacion y docencia: sirve como referencia reproducible para comparar tecnicas de ajuste fino (completo frente a parcial) sobre CoNLL-2003, con hiperparametros, semilla y tiempos de entrenamiento documentados.
- Componente auxiliar en pipelines de RAG sobre documentacion en ingles: etiquetar entidades en los fragmentos recuperados para enriquecer metadatos, filtrar por organizacion o persona, o resaltar menciones en la respuesta final.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con F1 de seqeval a nivel de entidad:

| Metodo | Parametros entrenables | Val F1 | Test F1 | Test precision | Test recall |
|---|---|---|---|---|---|
| Ajuste parcial (2 ultimas capas + cabeza) | 14.182.665 | 88,75% | 85,37% | 83,58% | 87,23% |
| Ajuste completo (modelo entregado) | 108.898.569 | 94,27% | 90,16% | 89,36% | 90,97% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar, algo coherente con la naturaleza del modelo (clasificacion de tokens, no generacion). La model card atribuye la caida sistematica de validacion a test en ambos metodos a que el split de test de CoNLL-2003 es mas dificil que el de validacion, y no a sobreajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 (108,9M parametros x 4 bytes = unos 436 MB de pesos) y alrededor de 0,25 GB en fp16; con activaciones y overhead del runtime, entre 1 y 2 GB en fp32 para secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM. El propio autor entreno en una T4 en 4,4 minutos. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para 109M de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU: viable para lotes pequenos o procesamiento por lotes offline, dado el tamano del modelo; no hay cifras de latencia publicadas.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, exportacion a ONNX Runtime, TorchScript/JIT trace, servidores de inferencia genericos (Triton, FastAPI, BentoML) y Hugging Face Inference Endpoints. vLLM, TGI y Ollama estan orientados a modelos generativos y no son la via natural para un encoder de clasificacion de tokens.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato temporal publicado es el entrenamiento (4,4 minutos para 4 epocas sobre el split de entrenamiento de CoNLL-2003 en una T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | F1 en CoNLL-2003 (test) |
|---|---|---|---|---|---|
| Dalila-Ku/bert-base-conll03-ner | 108.898.569 | 512 tokens | en | apache-2.0 | 90,16% (publicado en la model card) |
| google-bert/bert-base-uncased (modelo base, sin ajustar) | 110M aprox. | 512 tokens | en (multilingue parcial en su preentrenamiento) | apache-2.0 | no disponible en esta ficha; el paper citado reporta en torno a 92,4 para BERT-Base en CoNLL-2003 (cifra de la publicacion original, no verificada aqui) |
| Familia `dslim/bert-base-NER` (BERT-base ajustado para NER) | 110M aprox. | 512 tokens | en | apache-2.0 | no disponible en la informacion proporcionada |
| Modelos tipo RoBERTa-base ajustados para NER | 125M aprox. | 512 tokens | en | MIT / apache-2.0 segun variante | no disponible en la informacion proporcionada |

La comparacion mas relevante es interna: la variante de ajuste parcial incluida en la model card obtiene 85,37% de F1 en test frente al 90,16% del ajuste completo, con un coste de entrenamiento muy inferior (1,9 minutos frente a 4,4 minutos). No se aportan resultados comparativos con otros repositorios publicos de NER en ingles, por lo que no es posible situar el modelo frente a alternativas de la misma categoria mas alla de la referencia del paper original de BERT. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los unicos enlaces encontrados tratan sobre el nombre propio "Dalila" y son irrelevantes.

## Limitaciones y advertencias

- Dominio restringido: el modelo se entreno exclusivamente sobre CoNLL-2003, que consiste en teletipo de Reuters de los anos 90 en ingles. El propio autor advierte que puede no generalizar bien a texto informal, redes sociales o dominios con otra distribucion de entidades (biomedicina, legal, tecnico).
- Solo ingles: no hay soporte multilingue ni para otras lenguas, incluido el castellano.
- Tokenizador uncased: la normalizacion a minusculas elimina la informacion de mayusculas, una senal util para distinguir nombres propios en NER. Cualquier uso sobre texto con capitalizacion relevante pierde esa pista.
- Limite de 512 tokens sin ventana deslizante integrada: los documentos largos requieren troceado manual, lo que puede partir entidades entre fragmentos y perder contexto entre trozos.
- Entrenamiento minimo: una sola semilla, 4 epocas y sin busqueda de hiperparametros, tal como reconoce la model card. La variabilidad esperable entre semillas no se ha medido.
- Caida de validacion a test: 94,27% frente a 90,16% de F1. Cualquier estimacion basada solo en validacion sobreestimaria el rendimiento en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de entidades, con precision de test del 89,36% y recall del 90,97%.
- Sesgos: hereda los sesgos del corpus Reuters de los anos 90 (sesgo geografico y tematico hacia noticias internacionales en ingles) y los del preentrenamiento de `bert-base-uncased`.
- Entidades no cubiertas: el modelo no detecta numeros, fechas, cantidades, direcciones ni datos identificativos distintos de los cuatro tipos de CoNLL-2003; la categoria MISC es heterogenea por definicion.
- Licencia: apache-2.0, lo que permite uso comercial. Conviene revisar igualmente las condiciones de uso del corpus CoNLL-2003 (contenido Reuters) si se va a redistribuir el modelo como parte de un producto.
- Madurez del repositorio: 0 descargas, 1 like y ausencia de validacion por parte de la comunidad. Es un entregable academico sin garantia de mantenimiento ni de correccion de errores.
- Sin resultados en benchmarks generales: no hay evaluaciones de robustez, sesgo o comportamiento fuera de dominio, por lo que no es recomendable desplegarlo en produccion sin una evaluacion propia sobre datos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dalila-Ku/bert-base-conll03-ner
- Dataset CoNLL-2003 en Hugging Face: https://huggingface.co/datasets/lhoestq/conll2003
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion de Hugging Face sobre ajuste fino: https://huggingface.co/docs/transformers/training
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Nota: la busqueda web realizada no devolvio ningun enlace adicional relevante sobre este modelo; los resultados obtenidos estaban relacionados con el nombre propio "Dalila" y no con el modelo.
