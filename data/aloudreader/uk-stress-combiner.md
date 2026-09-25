# aloudreader/uk-stress-combiner

## Resumen

`aloudreader/uk-stress-combiner` (internamente `combiner-v1`) es un scorer aprendido de tamano muy reducido que se situa por encima de los distintos niveles ("tiers") de un pipeline de desambiguacion de acento en ucraniano. Su tarea no es generar texto ni traducir, sino decidir cual de las lecturas candidatas de una palabra ambigua (tipicamente un homografo como los que cambian de significado segun donde recaiga el acento) debe adoptarse. Para cada candidato recibe 32 caracteristicas que resumen la opinion de cada tier del pipeline: lexico, morfologia, cross-encoder, clasificador de tokens, prior de narradores de audiolibros y el propio orden fijo de los tiers.

El modelo lo desarrolla el autor `aloudreader`, en el contexto del proyecto de estres ucraniano `wiki-stress` (la ruta de codigo citada es `wiki-stress/ml/src/ukstress_ml/combiner.py`). Su relevancia practica esta en la sintesis de voz y la lectura automatica en ucraniano: elegir mal la posicion del acento produce audio incorrecto o ininteligible, y los sistemas de reglas o de orden fijo de tiers fallan de forma sistematica en homografos. Este combiner corrige parte de esos errores sin sustituir a los componentes existentes, ya que solo se aparta del orden fijo de tiers cuando su lectura preferida supera a la del orden fijo por un margen tau = 0,2.

Arquitectonicamente es un perceptron multicapa minimo: 32 caracteristicas de entrada, una unica capa oculta de 32 unidades con activacion tanh y una salida softmax sobre los candidatos de cada token. Se entrena en CPU en aproximadamente un minuto, se distribuye como checkpoint PyTorch (`model.pt`) acompanado de ficheros JSON de activos, y esta publicado bajo licencia Apache 2.0. En la API del proyecto viene desactivado por defecto y se habilita con `"combiner": true`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa: una capa oculta de 32 unidades tanh y salida softmax sobre los candidatos de cada token |
| Parametros totales | Aproximadamente 1.088 en la capa oculta (32x32 pesos + 32 sesgos); la capa de salida depende del numero de lecturas candidatas, no disponible |
| Longitud de contexto | No aplica: opera a nivel de token y de candidato de lectura, no sobre secuencias |
| Tipos de cuantizacion | No disponible; se distribuye un checkpoint PyTorch en su formato nativo |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), mas activos en JSON: `readings.jsonl`, `audio_prior.json`, `classifier_profile.json` |

## Arquitectura y entrenamiento

El modelo es un clasificador tabular de muy baja capacidad. Cada candidato de lectura de una palabra ambigua se representa con 32 caracteristicas agrupadas en siete bloques: lexico (rango y capitalizacion), tier de morfologia (su eleccion y la concordancia del etiquetador con caso, numero, genero y categoria gramatical de la lectura), cross-encoder (probabilidad del candidato), clasificador de tokens (probabilidad del candidato, numero de apariciones de la forma en entrenamiento y grado de unilateralidad de sus filas de entrenamiento), prior de narradores (proporcion de narradores de audiolibros que pronunciaron esa lectura y cuantos pronunciaron algo), naturaleza de las lecturas (si se distinguen por sentido, por gramatica o como nombres propios) y el orden fijo de tiers (su respuesta cruzada con el tier que la emitio). Sobre esas caracteristicas aplica una capa oculta de 32 unidades tanh y una softmax entre los candidatos del mismo token, y devuelve una lectura con su probabilidad. Solo anula la decision del orden fijo de tiers cuando su lectura preferida le gana por un margen tau = 0,2. Los tiers incorporados despues del entrenamiento (la reparacion por concordancia) se conservan siempre.

El entrenamiento usa tokens etiquetados de dos fuentes: Common Voice uk con oro acustico a confianza del ranker mayor o igual que 0,99, dividido 60/20/20 por frase, y la mitad de desarrollo del benchmark lang-uk con oro humano, ponderada por 4. Las caracteristicas se calculan ejecutando cada tier de forma independiente sobre esos tokens. El tamano de la capa oculta y la regularizacion se eligieron en desarrollo (Common Voice mas lang-uk); tau se fijo como la mayor ganancia en desarrollo sobre Common Voice que no costase a lang-uk mas de 0,3 puntos. El entrenamiento completo corre en CPU en torno a un minuto y es reproducible: reentrenado desde las mismas caracteristicas produce un `model.pt` identico byte a byte al publicado.

## Capacidades

- Desambiguacion de acento y lectura en palabras homografas del ucraniano, seleccionando una lectura candidata por token.
- Agregacion de opinion heterogenea: combina senales de lexico, morfologia, cross-encoder, clasificador de tokens y prior de narradores en una unica decision.
- Anulacion selectiva del orden fijo de tiers mediante una puerta de margen (tau = 0,2), lo que limita el dano cuando la senal no es concluyente.
- Estimacion de confianza: devuelve la probabilidad de la lectura elegida.
- Preservacion de tiers no vistos durante el entrenamiento, que se mantienen en lugar de ser sobrescritos.
- Integracion opcional en servicio: desactivado por defecto y activable por peticion con `"combiner": true`.
- No dispone de generacion de texto, razonamiento general, codigo, matematicas, vision ni audio; no es un modelo de lenguaje ni un modelo de sintesis de voz, sino un componente de decision dentro de un pipeline de TTS.
- No se documenta soporte de tool calling, function calling ni uso como agente.

## Casos de uso

- Sintesis de voz en ucraniano: dado un texto, el pipeline propone lecturas candidatas para cada homografo y el combiner elige la que se enviara al sintetizador, reduciendo pronunciaciones con el acento en la silaba equivocada. Es adecuado porque la evaluacion sobre Common Voice test sube del 92,74 % al 94,77 % frente al orden fijo de tiers.
- Lectura de audiolibros y narracion automatica: el prior de narradores esta integrado como caracteristica, de modo que la decision se alinea con las pronunciaciones documentadas en audiolibros, un escenario donde el error de acento es especialmente audible en textos largos.
- Preprocesado de corpus y anotacion: puede usarse para etiquetar la lectura esperada en transcripciones de Common Voice uk antes de entrenar otros componentes, siempre que se aplique sobre las mismas versiones de los tiers con los que fue entrenado.
- Sistemas de accesibilidad: lectores de pantalla y herramientas de texto a voz en ucraniano que necesitan una pronunciacion correcta de palabras ambiguas sin intervencion humana.
- Investigacion en desambiguacion prosodica: sirve como linea base ligera de ensemble para comparar estrategias de combinacion de senales (lexico frente a modelo neuronal) con un coste de computo minimo.
- Aprendizaje por transferencia dentro del proyecto: el codigo de caracteristicas y el formato de pesos permiten reentrenar el combiner cuando se sustituye o anade un tier, ya que cualquier cambio en los tiers desplaza la distribucion de caracteristicas.
- Filtrado de calidad en pipelines de datos de voz: la probabilidad devuelta puede emplearse para marcar tokens cuya lectura es dudosa y revisarlos manualmente.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre divisiones de test reservadas, comparando el orden fijo de tiers con el combiner:

| Test | Orden de tiers | Combiner |
|---|---:|---:|
| Common Voice test (3.001 tokens) | 92,74 % | 94,77 % |
| Sus 200 formas mas frecuentes (2.058) | 96,06 % | 97,57 % |
| lang-uk test, mitad de test (748) | 83,96 % | 83,96 % |
| Oro de texto moderno del proyecto (citado en limitaciones) | 98,07 % | 97,27 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene una capa oculta de 32 unidades sobre 32 caracteristicas; no requiere GPU.
- VRAM estimada: no aplica en la practica por el tamano del checkpoint; no se publica una cifra concreta.
- GPUs recomendadas: ninguna; el entrenamiento documentado se hizo en CPU en aproximadamente un minuto.
- Compatibilidad con GPU de consumo: irrelevante, el modelo cabe y se ejecuta en cualquier CPU moderna.
- Opciones de despliegue: integrado en el servicio del proyecto mediante `ukstress_ml.combiner.Combiner` y `Assets.load`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponibles. La unica cifra de rendimiento publicada es el tiempo de entrenamiento (aproximadamente 1 minuto en CPU).
- Nota operativa: el servicio calcula las opiniones de todos los tiers una vez por peticion y las cachea, de modo que el coste anadido del combiner es marginal frente al de los tiers que consulta.

## Comparativa con modelos similares

No se dispone de modelos externos comparables en la informacion proporcionada. La comparacion relevante es interna al pipeline, contra las alternativas que el propio combiner puede sustituir:

| Alternativa | Naturaleza | Contexto | Rendimiento (Common Voice test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orden fijo de tiers | Heuristica determinista sobre la salida de los tiers | No aplica | 92,74 % | La del proyecto | Integrada por defecto; el combiner esta desactivado por defecto |
| Combiner (`combiner-v1`) | MLP de 32 unidades ocultas sobre 32 caracteristicas | No aplica | 94,77 % | Apache 2.0 | Publicado en HuggingFace; activable con `"combiner": true` |

Cualquier comparacion con modelos de lenguaje o con desambiguadores de acento de terceros: no disponible.

## Limitaciones y advertencias

- Dependencia fuerte de los tiers: se entreno sobre las salidas de esas versiones concretas del cross-encoder y del clasificador de tokens. Si se cambia cualquiera de ellos, las caracteristicas se desplazan y es necesario reentrenar el combiner.
- Sesgo hacia el oro acustico y texto moderno: mejora sobre pruebas con oro de audio, pero en el pequeno conjunto de oro de texto moderno del proyecto obtiene 97,27 % frente al 98,07 % del orden fijo de tiers; por ese motivo se distribuye desactivado por defecto.
- No es un modelo de lenguaje: no genera texto, no razona de forma general, no escribe codigo ni procesa imagenes o audio. Cualquier uso fuera de la desambiguacion de lecturas en ucraniano queda fuera de su proposito.
- Cobertura idiomatica limitada al ucraniano. No hay soporte multilingue documentado.
- Necesita las opiniones de todos los tiers en tiempo de peticion; el servicio las calcula una vez por peticion y las cachea, por lo que no puede ejecutarse de forma aislada sin el resto del pipeline.
- Riesgo de error en homografos poco frecuentes: el rendimiento cae al 83,96 % en la mitad de test del benchmark lang-uk, donde el combiner no aporta ninguna mejora respecto al orden fijo de tiers.
- El umbral de decision (tau = 0,2) se ajusto para limitar el coste en lang-uk a un maximo de 0,3 puntos, lo que implica que la ganancia esta deliberadamente acotada.
- No se documentan sesgos demograficos ni linguisticos especificos, pero el entrenamiento depende de las distribuciones de Common Voice uk, del benchmark lang-uk y del prior de narradores de audiolibros, que pueden no representar todos los registros del ucraniano.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se documentan restricciones adicionales.
- Almacenamiento del repositorio: 0,0 GB declarados; el numero de descargas y de likes es 0 en la fecha de consulta, por lo que no hay evidencia publica de uso en produccion por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/aloudreader/uk-stress-combiner
- Codigo de definicion de caracteristicas y del combiner, citado en la model card: `wiki-stress/ml/src/ukstress_ml/combiner.py` (ruta interna del proyecto, sin URL publica indicada)
- Activos asociados citados en la model card: `readings.jsonl`, `audio_prior.json`, `classifier_profile.json`
- Benchmark lang-uk, mencionado como fuente de datos de desarrollo y test: sin URL indicada en la informacion disponible
- Common Voice uk, mencionado como fuente de datos: sin URL indicada en la informacion disponible
- Paper, blog, repositorio o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron enlaces relacionados con este modelo.
