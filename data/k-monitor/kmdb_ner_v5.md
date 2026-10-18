# K-Monitor/kmdb_ner_v5

## Resumen

`kmdb_ner_v5` es un modelo de reconocimiento de entidades nombradas (NER) para húngaro desarrollado por K-Monitor, organización húngara de vigilancia de la corrupción. Se trata de un fine-tune del encoder `SZTAKI-HLT/hubert-base-cc` (familia BERT, 110.037.517 parámetros) con una cabeza de clasificación de tokens, publicado bajo licencia Apache 2.0. El modelo resuelve una tarea doble: localizar personas, organizaciones y lugares en un artículo de prensa y, además, decidir si cada entidad es relevante para el caso que documenta el artículo (`POS`, va a la base de datos) o si es una mera mención (`NEG`).

El interés practico esta en esa segunda etiqueta. La mayoria de los NER se limitan a detectar spans; aqui el modelo reproduce el criterio editorial de la base de datos de prensa de K-Monitor, entrenado sobre 58.524 articulos de `K-Monitor/kmdb_base`. Las etiquetas siguen el esquema `B-/I-` + `{POS,NEG}_{PER,ORG,LOC}` (12 clases mas `O`).

Es relevante ahora porque la version anterior (`boapps/kmdb_ner_model`) sufria fuga entre entrenamiento y test: su F1 de 0,8244 estaba inflado y caia a 0,6684 en articulos que nunca habia visto. `kmdb_ner_v5` obtiene 0,7299 en ese mismo conjunto no visto, con una mejora especialmente marcada en `POS_ORG` (0,5270 a 0,6784). Es un modelo pequeno, desplegable en CPU, pensado para produccion periodistica mas que para benchmarks generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (huBERT) con cabeza de clasificacion de tokens (token-classification) |
| Parametros totales | 110.037.517 (~110 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (`model_max_length=512`; inferencia recomendada con `stride=8`) |
| Tipos de cuantizacion | no se publican checkpoints cuantizados; al ser un encoder de 110 M es convertible a ONNX/INT8 con herramientas estandar (no validado en la model card) |
| Idiomas soportados | hungaro (`hu`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `SZTAKI-HLT/hubert-base-cc`, un BERT base en caja baja (cased) para hungaro, y le anade una cabeza lineal de clasificacion de tokens sobre las 12 etiquetas `B-/I-` x `{POS,NEG}_{PER,ORG,LOC}` mas la clase `O`. No hay decodificacion especulativa, attention lineal ni modulos MoE: es un encoder bidireccional estandar con context window de 512 tokens.

El entrenamiento se hizo sobre 58.524 articulos del dataset `K-Monitor/kmdb_base`. La supervision es automatica, no anotada a mano: los spans de entidad los genera spaCy (`hu_core_news_lg`) y una entidad se etiqueta como `POS` cuando coincide con alguno de los nombres que un editor marco en ese articulo; en caso contrario se etiqueta como `NEG`. La evaluacion se realizo sobre 4.161 articulos reservados, con metricas seqeval a nivel de entidad. La mejora principal frente a la version anterior proviene de corregir el matching por substring exacto del checkpoint previo, que etiquetaba como `NEG` organizaciones cuya denominacion en base de datos lleva sufijo (`Hunguest Hotels Zrt.`, `Honvédelmi Minisztérium (HM)`).

## Capacidades

- Reconocimiento de entidades nombradas en hungaro para tres tipos: persona (`PER`), organizacion (`ORG`) y lugar (`LOC`).
- Clasificacion de relevancia editorial por entidad: `POS` (relevante para el caso del articulo, debe registrarse) frente a `NEG` (solo mencionada).
- Procesamiento de articulos largos mediante fragmentacion en ventanas de 512 tokens con `stride=8`, con posterior fusion de entidades adyacentes.
- Manejo de sufijos hungaros separados por el tokenizador (`Budapest` + `-en`), que exigen un paso de merge posterior conservando el tipo de entidad y la marca `POS` si cualquiera de los fragmentos lo es.
- Integracion directa con el pipeline `ner` de HuggingFace Transformers (`aggregation_strategy="first"`).
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento: es exclusivamente un clasificador de tokens.
- Cobertura limitada a un unico idioma y a un dominio concreto (prensa hungara sobre corrupcion y fondos publicos).

## Casos de uso

- Ingesta automatizada en la base de datos de prensa de K-Monitor: el modelo pre-rellena los campos de personas, organizaciones y lugares de cada articulo y distingue las que un editor registraria, reduciendo la revision manual a validacion. Es el caso para el que fue disenado y donde las metricas de la model card aplican directamente.
- Monitorizacion de medios sobre corrupcion: procesar el flujo diario de articulos hungaros y detectar que organizaciones aparecen como parte implicada (`POS_ORG`, recall 0,7130) frente a las que solo se citan de pasada, para alimentar alertas editoriales.
- Analisis de redes entre instituciones y personas: al serializar solo las entidades `POS` de un corpus de decenas de miles de articulos se obtiene un grafo de co-ocurrencia entre organismos publicos, empresas y cargos, util para investigacion periodistica.
- Control de calidad de metadatos existentes: comparar las entidades `POS` predichas con las ya registradas por el editor para detectar omisiones; el recall de `POS_PER` (0,8029) lo hace razonablemente fiable como recordatorio.
- Enriquecimiento de un archivo documental para busqueda interna: indexar articulos con sus entidades y su marca de relevancia permite consultas del tipo "articulos donde X es parte implicada", algo que un NER generico no puede resolver.
- Pre-filtrado en un pipeline de extraccion mas costoso: usar este encoder de 110 M en CPU para descartar articulos sin entidades `POS` relevantes antes de invocar un modelo mayor o una revision humana.
- Investigacion academica sobre NER con supervision debil: el modelo y el esquema `POS`/`NEG` derivado de spaCy sirven como caso de estudio reproducible de etiquetado plateado y de su impacto en la calidad fuera de distribucion.

## Benchmarks y rendimiento

Metricas seqeval a nivel de entidad sobre 4.161 articulos reservados. La columna "articulos no vistos" es la comparacion honesta: el checkpoint anterior se entreno con un split sin semilla, de modo que la mayoria del test general estaba en su entrenamiento.

| Modelo | F1 test | F1 en articulos que el modelo anterior nunca vio |
|---|---|---|
| `boapps/kmdb_ner_model` | 0,8244* | 0,6684 |
| `kmdb_ner_v5` | 0,8171 | **0,7299** |

\* inflado por fuga entre train y test en el checkpoint anterior.

Desglose por clase en los articulos no vistos:

| Etiqueta | Precision | Recall | F1 | F1 anterior |
|---|---|---|---|---|
| NEG_LOC | 0,7817 | 0,7075 | 0,7427 | 0,7208 |
| NEG_ORG | 0,7530 | 0,7587 | 0,7558 | 0,7176 |
| NEG_PER | 0,7298 | 0,6752 | 0,7014 | 0,6505 |
| POS_LOC | 0,6219 | 0,7128 | 0,6642 | 0,5729 |
| POS_ORG | 0,6469 | 0,7130 | 0,6784 | 0,5270 |
| POS_PER | 0,6971 | 0,8029 | 0,7463 | 0,6484 |
| micro avg | 0,7242 | 0,7356 | 0,7299 | 0,6684 |

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible; no son aplicables a un modelo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,44 GB en fp32, ~0,22 GB en fp16, ~0,11 GB en INT8 (110 M de parametros mas la cabeza de clasificacion).
- GPU recomendadas: ninguna en concreto; el modelo cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU. Una T4 o L4 es mas que suficiente para servir lotes grandes. A100/H100 no aportan ventaja practica aqui.
- Cabe en consumer GPU: si, en todas; tambien se ejecuta en CPU con latencias aceptables para procesamiento por lotes.
- Opciones de despliegue: `transformers` con `pipeline("ner")`, ONNX Runtime para inferencia en CPU, vLLM y TGI para servir token-classification a escala. Para `llama.cpp`/`Ollama` no hay soporte documentado de este cabezal de clasificacion de tokens; no se recomienda esa via.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud, un encoder BERT base procesa una secuencia de 512 tokens en decenas de milisegundos en GPU moderna, pero no se ha publicado una medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 (no visto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `K-Monitor/kmdb_ner_v5` | ~110 M | 512 | NER hu + relevancia POS/NEG | 0,7299 | Apache 2.0 | HuggingFace |
| `boapps/kmdb_ner_model` | no disponible | no disponible | NER hu + relevancia POS/NEG | 0,6684 | no disponible | HuggingFace |
| `SZTAKI-HLT/hubert-base-cc` | ~110 M | 512 | encoder base, sin cabeza NER | no aplica | no disponible en la informacion | HuggingFace |
| `spaCy hu_core_news_lg` | no disponible | no disponible | NER hu generico (PER/ORG/LOC/MISC) | no disponible | no disponible | spaCy |

La diferencia clave frente a spaCy y al encoder base es la distincion `POS`/`NEG`: ninguno de los dos la ofrece. Frente al checkpoint anterior, la ventaja no es el F1 nominal en test (0,8171 frente a 0,8244, este ultimo inflado) sino el rendimiento en articulos nuevos, 0,7299 frente a 0,6684. No se dispone de datos para comparar con otros NER hungaros comerciales o multilingues como XLM-R o modelos de OpenAI/Google.

## Limitaciones y advertencias

- La supervision `POS`/`NEG` es automatica, derivada de cruzar entidades de spaCy con nombres marcados por editores. Hereda los errores de frontera de spaCy y los fallos de la heuristica de matching; no hay anotacion humana.
- El rendimiento realista es el de articulos posteriores a la ventana de entrenamiento (~0,73 F1), no el de distribucion (~0,82). Cualquier estimacion basada en el test general sobreestima la calidad.
- Precision baja en clases `POS`: `POS_ORG` 0,6469 y `POS_LOC` 0,6219 implican que aproximadamente un tercio de las entidades marcadas como relevantes son falsos positivos. Requiere validacion humana si la decision tiene consecuencias.
- Sesgo de dominio: entrenado solo con prensa hungara sobre corrupcion y fondos publicos. El comportamiento fuera de ese genero (literatura, documentacion tecnica, redes sociales) no esta caracterizado.
- Limitacion de contexto: 512 tokens obligan a fragmentar articulos largos y a fusionar entidades despues; sin ese post-proceso los resultados son incorrectos. La implementacion de referencia es `join_entities` en el repositorio `sajtoadatbazis-automat`.
- Idiomas: solo hungaro. No hay transferencia esperada a otras lenguas.
- Licencia Apache 2.0 sobre los pesos, pero la licencia del dataset de entrenamiento `K-Monitor/kmdb_base` no se detalla en la informacion disponible; conviene verificarla antes de un uso comercial.
- Riesgo de sesgo de fuente: el corpus refleja la linea editorial y la seleccion de casos de K-Monitor, lo que puede infrarepresentar entidades o tipos de organizacion poco cubiertos por la base de datos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/K-Monitor/kmdb_ner_v5
- Dataset de entrenamiento: https://huggingface.co/datasets/K-Monitor/kmdb_base
- Modelo base: https://huggingface.co/SZTAKI-HLT/hubert-base-cc
- Checkpoint anterior: https://huggingface.co/boapps/kmdb_ner_model
- Implementacion de referencia (`join_entities`, `webapp/auto_kmdb/processors/NERProcessor.py`): https://github.com/k-monitor/sajtoadatbazis-automat
- Base de datos de prensa de K-Monitor: https://adatbazis.k-monitor.hu/
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (referencias a la letra K en Wikipedia y Larousse); no se han encontrado papers, blogs ni demos adicionales.
