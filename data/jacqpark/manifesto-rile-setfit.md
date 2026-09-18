# jacqpark/manifesto-RILE-setfit

## Resumen

jacqpark/manifesto-RILE-setfit es un clasificador de texto binario desarrollado por el usuario jacqpark que asigna una cuasi-oracion extraida de un manifiesto electoral a la posicion izquierda (`left`) o derecha (`right`) de la escala RILE del Manifesto Project, que agrupa 13 categorias por cada lado del eje. No es un modelo generativo: es un clasificador SetFit construido sobre el backbone sentence-transformers/all-MiniLM-L6-v2, con 22.713.216 parametros totales y un peso en disco de aproximadamente 0,1 GB.

El modelo se creo como material de apoyo para el taller *Python Literacy for Text-as-Data*, con el objetivo de que los participantes dispusieran de un modelo funcional que cargar si su propio entrenamiento o su clave de API fallaba durante la sesion. Su relevancia practica es acotada pero clara: demuestra un flujo completo de anotacion politica con muy pocos ejemplos (128 cuasi-oraciones de entrenamiento) y un coste computacional minimo, entrenando en CPU en unos tres minutos.

El entrenamiento se limita a manifiestos del Reino Unido de las elecciones generales de 2019 y 2024, de los cuatro partidos mas grandes de cada convocatoria, y la propia model card advierte de que la precision cae fuera de ese contexto. La licencia es Apache 2.0 sobre los pesos publicados, mientras que el corpus subyacente no se redistribuye por restricciones del Manifesto Project.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (sentence transformer con pooling y cabeza de clasificacion) sobre backbone BERT de 6 capas all-MiniLM-L6-v2 |
| Parametros totales | 22.713.216 |
| Longitud de contexto | 256 tokens (limite de secuencia del backbone all-MiniLM-L6-v2; no declarado en la model card del clasificador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en los metadatos; el entrenamiento se realizo exclusivamente con texto en ingles britanico (manifiestos del Reino Unido) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio) |
| Etiquetas de salida | 2 clases: `left`, `right` |
| Biblioteca | setfit |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-classification |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SetFit: un encoder de frases preentrenado (all-MiniLM-L6-v2, transformer tipo BERT de 6 capas y 384 dimensiones ocultas) que produce embeddings de la cuasi-oracion, seguido de una cabeza de clasificacion entrenada sobre esos embeddings. El entrenamiento reportado usa SetFit con batch size 16 y 1 epoca, semilla 42 tanto para el muestreo como para el entrenamiento, y se ejecuto en CPU en aproximadamente tres minutos, con tiempos menores en una GPU T4 gratuita de Colab.

Los datos de entrenamiento proceden del Manifesto Project Corpus, version principal `MPDS2026a` y version de corpus `2026-1`, restringidos a manifiestos del Reino Unido de las elecciones generales de 2019 y 2024, de los cuatro partidos mas grandes de cada eleccion. Se utilizaron 64 cuasi-oraciones por clase, es decir, 128 ejemplos en total. El texto original no se redistribuye porque el Manifesto Project prohibe la redistribucion sin permiso escrito; solo se publican los pesos entrenados. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo por otra parte ajeno a un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de cuasi-oraciones de manifiestos politicos en la escala RILE: devuelve `left` o `right`.
- Clasificacion por lotes mediante la API de SetFit, por ejemplo `model.predict([...])` sobre una lista de textos.
- Integracion con el ecosistema sentence-transformers, lo que permite reutilizar el encoder para tareas auxiliares de similitud o agrupamiento.
- Compatibilidad declarada con text-embeddings-inference y con endpoints gestionados, lo que facilita su exposicion como servicio HTTP.
- Inferencia viable en CPU, sin necesidad de GPU.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente; es exclusivamente un clasificador discriminativo.
- No se documentan capacidades multilingues ni un modo de razonamiento explicito.

## Casos de uso

- Codificacion a escala de manifiestos electorales britanicos: el modelo puede etiquetar grandes volumenes de cuasi-oraciones de los partidos cubiertos (Reino Unido, elecciones de 2019 y 2024) para calcular posiciones agregadas en la escala RILE, donde el kappa de 0,42 es suficiente segun la propia model card para medidas agregadas sobre muchas frases.
- Pre-anotacion para codificadores humanos: en un flujo de anotacion supervisada, el clasificador puede proponer una etiqueta inicial y reservar el esfuerzo humano para los casos dudosos, reduciendo el coste de codificacion manual antes de la validacion final.
- Docencia y talleres de text-as-data: sirve como modelo de referencia funcional en sesiones practicas, permitiendo cargar un modelo ya entrenado cuando el entrenamiento del alumnado o el acceso a una API fallan, que es el proposito declarado por el autor.
- Analisis temporal dentro de un mismo sistema de partidos: al estar entrenado sobre dos elecciones britanicas consecutivas, permite comparar el desplazamiento del discurso de los cuatro partidos principales entre 2019 y 2024 bajo un mismo criterio de anotacion.
- Filtrado y triaje en pipelines de ciencias politicas: dado su tamano (22,7 millones de parametros) y su ejecucion en CPU, puede integrarse como etapa previa barata que descarte o priorice documentos antes de pasarlos a modelos mayores o a revision humana.
- Prototipado rapido de clasificadores de eje izquierda-derecha: el flujo SetFit con 64 ejemplos por clase y una sola epoca, reproducible en CPU en minutos, sirve como plantilla metodologica para replicar el experimento con otros paises, previa revalidacion contra codigos manuales propios.
- Analisis comparado reproducible: al publicarse solo los pesos y fijarse la semilla 42, el modelo permite reproducir la particion y el resultado de evaluacion reportados sin necesidad de redistribuir el corpus, respetando los terminos del Manifesto Project.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de validacion de 400 cuasi-oraciones, 200 por clase, extraidas del mismo corpus y disjuntas del entrenamiento:

| Modelo | Cohen's kappa | Macro F1 |
|---|---|---|
| TF-IDF con regresion logistica (baseline) | 0,18 | 0,59 |
| manifesto-RILE-setfit | 0,42 | 0,71 |

Matriz de confusion sobre las mismas 400 cuasi-oraciones (filas: verdadero `left`, verdadero `right`):

| | Predicho left | Predicho right |
|---|---|---|
| Verdadero left | 147 | 53 |
| Verdadero right | 64 | 136 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no serian aplicables a un clasificador discriminativo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 45 MB en fp16 y 87 MB en fp32 para los 22,7 millones de parametros, a lo que hay que sumar el consumo de activaciones y del tokenizador, muy reducido con secuencias de hasta 256 tokens.
- GPU recomendadas: no se requiere GPU; el autor reporta entrenamiento en CPU en unos tres minutos y tiempos menores en una T4 gratuita de Colab. Cualquier GPU consumer, incluida una GTX 1050 o integradas modernas, es mas que suficiente.
- Cabe sin problema en GPU consumer, e incluso en CPU de portatil, dado el tamano del modelo (0,1 GB de repositorio).
- Opciones de despliegue: biblioteca setfit para uso en Python, sentence-transformers para reutilizar el encoder, y text-embeddings-inference segun la etiqueta `endpoints_compatible` del repositorio. No se documentan en la informacion disponible recetas especificas para vLLM, llama.cpp, Ollama o TGI, que no son el encuadre natural de un clasificador SetFit pequeno.
- Latencia y throughput estimados: no disponible. La model card solo menciona el tiempo de entrenamiento (aproximadamente tres minutos en CPU con 128 ejemplos), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cohen's kappa | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TF-IDF + regresion logistica (baseline del autor) | no disponible | no aplica | 0,18 | 0,59 | no disponible | baseline descrito en la model card |
| manifesto-RILE-setfit | 22.713.216 | 256 tokens (backbone) | 0,42 | 0,71 | apache-2.0 | HuggingFace |
| Otros clasificadores RILE comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre clasificadores alternativos equivalentes entrenados sobre el Manifesto Project con los que establecer una comparacion cuantitativa directa. La unica referencia comparable documentada es el baseline TF-IDF con regresion logistica incluido por el propio autor.

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento se limita a 128 cuasi-oraciones de manifiestos del Reino Unido de 2019 y 2024, de los cuatro partidos mayores de cada eleccion. El vocabulario y las prioridades politicas britanicas de ese periodo condicionan las predicciones.
- Caida de precision fuera de contexto: la model card indica explicitamente que la precision disminuye en otros paises, razon por la que el taller restringe el entrenamiento a un unico pais.
- Fiabilidad por frase: un kappa de 0,42 corresponde a un acuerdo moderado. El modelo es util para medidas agregadas sobre muchas frases, pero no es fiable para clasificar una sola cuasi-oracion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de etiquetado erroneo sistematico, especialmente en cuasi-oraciones ambiguas o mezcladas tematicamente, como muestra la matriz de confusion (53 y 64 errores sobre 400 casos).
- Necesidad de validacion externa: el autor recomienda validar contra codigos manuales propios antes de usar el modelo en trabajos publicados.
- Restricciones sobre los datos: los pesos se publican bajo Apache 2.0, pero el texto del Manifesto Project no se redistribuye porque su licencia prohibe la redistribucion sin permiso escrito. La reproduccion del conjunto de entrenamiento exige una clave de API propia y el cumplimiento de los terminos de uso del Manifesto Project.
- Idiomas: no se declaran idiomas soportados en los metadatos y el entrenamiento es exclusivamente en ingles. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y se creo y actualizo el mismo dia, por lo que no cuenta con validacion independiente de la comunidad.
- Uso en produccion: se recomienda no desplegarlo como unico criterio de decision en contextos sensibles (por ejemplo, comunicacion politica o moderacion), dado su caracter moderado de acuerdo y su dependencia del contexto britanico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacqpark/manifesto-RILE-setfit
- Modelo base sentence-transformers/all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Terminos de uso del Manifesto Project: https://manifesto-project.wzb.eu/information/documents/terms_of_use
- Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo (unicamente resultados no relacionados de portales de reservas). No se han localizado papers, blogs, repositorios adicionales ni demos asociados al modelo en la informacion disponible.
