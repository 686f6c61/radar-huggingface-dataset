# SargeDev/jev-distill-corpus

## Resumen

SargeDev/jev-distill-corpus, tambien descrito por su autor como Jev Distillation Corpus — Memory-Gate Judgments, no es un modelo de lenguaje sino un corpus de datos en formato JSONL disenado para destilar modelos compactos de juicio de relevancia y reranking. Contiene 148.160 filas unicas, cada una con una consulta (query), un pasaje candidato (text), juicios de un profesor de 32B parametros (campo jev, con relevancia graduada de 0 a 7, probabilidades por puntuacion y valor esperado) y etiquetas auxiliares (label_32b y label_binary). El objetivo declarado es entrenar cabezas de regresion sobre cross-encoders congelados o adaptadores LoRA sobre modelos instruct pequenos, para sustituir llamadas a APIs en la nube por inferencia local dentro de un pipeline de memoria de agentes (recall vectorial, reranker y puerta de juicio tipada).

El problema que aborda es concreto: en arquitecturas de memoria de agentes, decidir si un recuerdo recuperado por similitud vectorial es realmente relevante exige un juicio costoso, tradicionalmente delegado a un modelo grande hospedado. Este corpus proporciona pares etiquetados con un profesor de 32B mas una API de juicio tipado, con una concordancia binaria del 91,0 por ciento y una correlacion de Pearson de r=0,897 sobre la ejecucion completa. Su relevancia actual depende de que esa calidad de etiquetado se reproduzca en modelos estudiantes de menor tamano y coste.

El repositorio ocupa 0,2 GB y fue creado el 17-18 de septiembre de 2026. No declara licencia, idiomas ni pipeline, no incluye resultados de benchmarks y no aporta pesos, arquitectura ni configuracion de entrenamiento: es exclusivamente material de entrenamiento. La busqueda web realizada no ha devuelto ninguna fuente relacionada con el proyecto, por lo que toda la informacion procede de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (corpus de datos, no modelo neuronal) |
| Parametros totales | no disponible (no es un modelo; el profesor de etiquetado es de 32B) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (mediana de consulta ~68 caracteres; mediana de pasaje ~850 caracteres) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no declarados; predominio de ingles con una proporcion multilingue pequena procedente de las fuentes (mlqa, tydi, xquad) |
| Licencia | no disponible (no declarada en la model card) |
| Formato de pesos | no aplica; formato del corpus JSONL, un registro por linea |
| Numero de filas | 148.160 unicas |
| Tamano del repositorio | 0,2 GB |
| Campos por registro | query, text, jev (relevancia 0-7 con probabilidades e valor esperado), label_32b, label_binary, source, src_ds, worker |
| Calidad del profesor | concordancia binaria 91,0 por ciento; Pearson r=0,897 |
| Particiones | omitidas intencionadamente; cualquier corte aleatorio es valido (un corte 134,5k/2,8k/5,6k reprodujo r=0,897) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El artefacto es un corpus de destilacion generado por el pipeline interno jev-gate el 17 de septiembre de 2026. El etiquetado combina dos profesores: un modelo de 32B que produce una puntuacion graduada y una API de juicio tipado (denominada Choice), de la que se derivan label_32b y la bandera de acuerdo binaria label_binary. La relevancia se almacena de forma graduada en el rango 0-7 junto con la distribucion de probabilidad por puntuacion y el valor esperado, lo que permite entrenar tanto una cabeza de regresion continua como un clasificador binario de puerta.

La composicion del corpus mezcla conjuntos de preguntas y respuesta de dominios diversos: pubmedqa (biomedico), hotpot_qa (razonamiento multi-salto), mlqa, narrativeqa, lsat (razonamiento juridico), trivia_qa, mqa, sleepqa, tydi, pira, xquad y otros. La model card destaca que la pequena porcion multilingue resulta util como dato de robustez cross-lingual. El autor no documenta el numero total de tokens, la composicion exacta en porcentaje, ni procesos de RLHF o DPO, que no aplican a un corpus de este tipo. La innovacion tecnica relevante no esta en la arquitectura sino en el uso previsto: sustituir juicios remotos por inferencia local en la puerta de memoria, con evidencia de reproducibilidad del etiquetado mediante el corte de validacion citado.

## Capacidades

El artefacto habilita capacidades en los modelos que se entrenen con el, no en si mismo:

- Entrenamiento de cabezas de regresion sobre cross-encoders congelados para puntuar relevancia de pasajes recuperados.
- Ajuste fino mediante LoRA de modelos instruct pequenos para emitir juicios de relevancia tipados.
- Clasificacion binaria de acuerdo o desacuerdo (label_binary) como puerta de admision o rechazo de un recuerdo.
- Modelado de relevancia graduada de 0 a 7, con distribucion de probabilidad y valor esperado, apto para umbralizacion calibrada.
- Razonamiento multi-salto sobre memoria almacenada, gracias a la inclusion de hotpot_qa en las fuentes.
- Cobertura de dominios especializados: biomedico, juridico (lsat), narrativo y de conocimiento general.
- Robustez multilingue limitada, procedente de las fuentes mlqa, tydi y xquad.
- Trazabilidad del dato: cada fila incluye source, src_ds y worker, lo que permite analisis de procedencia y filtrado por origen.
- No se documentan capacidades de vision, audio, tool calling, modo de pensamiento ni ejecucion agentica nativa.

## Casos de uso

- Destilacion de un reranker local para memoria de agentes: entrenar una cabeza de regresion sobre un cross-encoder congelado usando el campo jev, de modo que la puerta de memoria deje de depender de una API externa y pase a ejecutarse en la misma maquina.
- Sustitucion de llamadas a la nube en produccion: el corpus permite aproximar el comportamiento de un profesor de 32B con un modelo estudiante pequeno, reduciendo coste por consulta y eliminando la dependencia de red en el camino critico.
- Clasificador binario de admision de recuerdos: entrenar con label_binary una puerta que decida si un pasaje recuperado por similitud vectorial entra en el contexto del agente, reduciendo ruido en la ventana de contexto.
- Ajuste de un modelo instruct compacto mediante LoRA: adaptar un modelo pequeno para que emita juicios tipados en lugar de puntuaciones crudas, integrandolo en el pipeline de memoria existente.
- Calibracion de umbrales de relevancia: gracias a la distribucion de probabilidad y al valor esperado por fila, se puede ajustar el umbral de aceptacion segun la tasa de falsos positivos tolerada por la aplicacion.
- Recuperacion sobre documentacion tecnica y narrativa: la mezcla de narrativeqa, hotpot_qa y trivia_qa permite evaluar el juicio de relevancia en consultas de varios saltos y pasajes largos (mediana de 850 caracteres).
- Filtrado en dominios regulados: las fuentes pubmedqa y lsat permiten entrenar y evaluar juicios de relevancia en contextos biomedicos y juridicos, donde la precision del descarte importa mas que la exhaustividad.
- Evaluacion de robustez cross-lingual: usando la porcion multilingue de mlqa, tydi y xquad para medir la degradacion del estudiante fuera del ingles antes de desplegarlo en un sistema multilingue.
- Analisis de destilacion academico: comparar la fidelidad del estudiante frente al profesor de 32B en funcion del tamano del corte de entrenamiento, dado que el autor reporta que particiones aleatorias distintas reproducen la misma correlacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de ningun modelo estudiante entrenado con el corpus, ni comparaciones con rerankers de referencia.

Las unicas metricas disponibles describen la calidad del etiquetado del profesor, no el rendimiento de un modelo:

| Metrica | Valor |
|---|---|
| Filas unicas | 148.160 |
| Concordancia binaria profesor-juicio tipado | 91,0 por ciento |
| Correlacion de Pearson (ejecucion completa) | r=0,897 |
| Correlacion de Pearson (corte 134,5k/2,8k/5,6k) | r=0,897 |
| Longitud mediana de consulta | ~68 caracteres |
| Longitud mediana de pasaje | ~850 caracteres |

## Requisitos de hardware

- El corpus en si no requiere hardware de inferencia: es un fichero JSONL de 0,2 GB que cabe en memoria en cualquier equipo de desarrollo.
- Los requisitos reales dependen por completo del modelo estudiante que se elija, dato que no se especifica en la informacion disponible.
- Para el escenario previsto de cabeza de regresion sobre cross-encoder congelado, el coste dominante es el forward pass del encoder; los modelos cross-encoder compactos de tipo BERT base suelen ajustarse en una unica GPU consumer, pero no se dispone de mediciones del autor para confirmarlo.
- Para el escenario de LoRA sobre modelo instruct pequeno, el pico de memoria lo determina el modelo base y la longitud de secuencia; los pasajes de ~850 caracteres implican secuencias moderadas.
- No se dispone de datos de latencia ni de throughput de ningun despliegue derivado.
- Opciones de despliegue para el estudiante resultante: no especificadas por el autor; dependen del formato final del modelo entrenado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros corpus de destilacion de juicios de relevancia para puertas de memoria de agentes, ni datos de rendimiento de alternativas como para establecer una comparacion con cifras. Cualquier tabla comparativa en esta ficha requeriria datos de benchmarks que no se han publicado. Se puede senalar, como unica referencia cualitativa, que los conjuntos de reranking habituales no suelen incluir una etiqueta de juicio tipado ni distribucion de probabilidad por puntuacion, pero no se dispone de cifras para contrastarlo.

## Limitaciones y advertencias

- Es un corpus de datos, no un modelo: no genera texto, no razona por si mismo y no puede evaluarse con MMLU, HumanEval ni metricas equivalentes.
- Licencia no declarada. Esto impide determinar si el uso comercial esta permitido; es un bloqueo potencial para cualquier despliegue en produccion hasta que el autor lo aclare por escrito.
- Los conjuntos de origen (pubmedqa, hotpot_qa, lsat, narrativeqa, etc.) tienen sus propias licencias y condiciones, que la model card no reproduce ni verifica. La responsabilidad de comprobar la compatibilidad recae en quien reutilice el corpus.
- Idiomas no declarados: aunque hay fuentes multilingues, se desconoce la proporcion real de cada idioma y el rendimiento fuera del ingles.
- Riesgo de heredar los sesgos del profesor de 32B y de la API de juicio tipado, incluyendo sesgos de dominio y de estilo de redaccion de los pasajes de origen.
- El 9,0 por ciento de desacuerdo binario entre profesores marca un techo aproximado de ruido en la etiqueta; conviene tratarlo como limite superior de fidelidad para el estudiante.
- La ausencia de particiones oficiales implica que dos equipos pueden obtener resultados no comparables si eligen cortes distintos; el autor afirma que la correlacion se reproduce, pero solo cita un unico corte de validacion.
- La procedencia por worker y src_ds permite analisis, pero no hay documentacion sobre el numero de anotadores, el proceso de control de calidad ni la tasa de acuerdo entre ellos.
- No hay resultados publicados de ningun modelo entrenado con el corpus, por lo que su utilidad practica para reducir coste de inferencia frente a un profesor de 32B no esta cuantificada.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- La busqueda web no ha encontrado ninguna fuente, publicacion, repositorio ni demo asociada al proyecto, lo que limita la verificacion de las cifras declaradas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SargeDev/jev-distill-corpus
- Model card del autor: incluida en la pagina del repositorio anterior
- Pipeline de generacion jev-gate: mencionado en la model card, sin enlace publico disponible
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada
