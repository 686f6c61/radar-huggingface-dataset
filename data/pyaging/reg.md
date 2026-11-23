# pyaging/reg

## Resumen

`pyaging/reg` es un modelo de regresion ridge que predice la edad cronologica humana a partir de datos de expresion genica multi-tejido. Lo desarrolla el equipo de pyaging como parte del estudio Pasta, publicado en *Advanced Science* en 2026, y se distribuye como artefacto de pesos compatible con la libreria `pyaging` para el calculo de relojes de envejecimiento transcriptomicos. No es un modelo de lenguaje ni una red neuronal profunda: es un modelo lineal regularizado sobre caracteristicas de expresion transformadas por rangos.

Su relevancia es practica para la comunidad de biologia del envejecimiento: proporciona una linea base de regresion de edad cronologica que sirve como referencia contra la que comparar relojes mas complejos (incluido el propio reloj Pasta), y se integra en un ecosistema ya existente de relojes epigeneticos y transcriptomicos con una unica llamada a `predict_age`. El repositorio tiene un tamano practicamente nulo (0.0 GB), lo que es coherente con un modelo de coeficientes lineales de baja dimension y no con pesos de tipo transformer.

La informacion publica disponible es muy limitada: la model card no detalla numero de caracteristicas de entrada, coeficientes, metricas de error ni composicion exacta del dataset de entrenamiento. Esta ficha refleja exclusivamente lo que el autor declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge (lineal regularizada L2) sobre expresion genica transformada por rangos |
| Parametros totales | no disponible (modelo de coeficientes lineales; el autor no publica el numero de caracteristicas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular de expresion genica, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (no procede cuantizacion de pesos en el sentido de LLM) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT para el software de pyaging; los pesos conservan los terminos de los autores originales |
| Formato de pesos | no disponible; integrado y consumido por la libreria `pyaging` |
| Especie | Homo sapiens |
| Tejido | multi-tejido |
| Tipo de dato de entrada | transcriptomica (expresion genica) |
| Variable objetivo | edad cronologica |
| Ano | 2026 |

## Arquitectura y entrenamiento

El modelo es una regresion ridge, es decir, una regresion lineal con penalizacion L2 sobre los coeficientes. La entrada son perfiles de expresion genica humana multi-tejido sometidos a una transformacion por rangos (rank transform), un preprocesado habitual en transcriptomica para reducir el efecto de la escala, la distribucion y los valores atipicos entre muestras y plataformas. La salida es una prediccion escalar de edad cronologica.

El entrenamiento se enmarca en el estudio Pasta, descrito por los autores como un reloj transcriptomico versatil que mapea determinantes quimicos y geneticos del envejecimiento y del rejuvenecimiento. La model card no especifica el numero de muestras, la composicion del dataset, los tejidos concretos incluidos, el rango de edades cubierto ni el valor de la penalizacion ridge seleccionada. Tampoco se documenta si hubo validacion cruzada, ajuste por covariables (sexo, lote, plataforma) o calibracion posterior. No se describe ninguna innovacion arquitectonica: su valor es el de una linea base interpretable y computacionalmente trivial frente a modelos mas complejos del mismo estudio.

## Capacidades

- Prediccion de edad cronologica a partir de perfiles de expresion genica humana multi-tejido.
- Transformacion por rangos de la expresion como paso de preprocesado asociado al modelo.
- Integracion directa en el flujo de trabajo de `pyaging` mediante `pya.pred.predict_age(adata, ["reg"])` sobre objetos AnnData.
- Uso como linea base de referencia para comparar relojes transcriptomicos mas elaborados.
- Ejecucion en CPU con coste computacional minimo, apta para lotes grandes de muestras.
- No soporta generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de modo de razonamiento extendido.

## Casos de uso

- Linea base en estudios de envejecimiento: usar `reg` como referencia de error (MAE, correlacion) antes de evaluar un reloj transcriptomico nuevo, de modo que cualquier mejora se mida contra un modelo lineal simple y transparente.
- Analisis secundario de cohortes publicas: aplicar el modelo sobre matrices de expresion ya depositadas en repositorios como GEO para obtener una estimacion de edad cronologica por muestra sin reentrenar nada.
- Control de calidad de datasets: comparar la edad predicha con la edad declarada en los metadatos para detectar muestras mal etiquetadas, intercambios de ficheros o problemas de normalizacion.
- Ajuste de covariables en estudios de asociacion: incluir la edad predicha como covariable o residuo en modelos que buscan senales de envejecimiento acelerado o rejuvenecimiento tras intervenciones.
- Docencia y formacion en bioinformatica: ejemplo minimo y reproducible de un reloj molecular dentro del ecosistema `pyaging`, util para explicar preprocesado, regularizacion y evaluacion de predicciones.
- Evaluacion comparativa de tejidos: al estar entrenado en multi-tejido, permite estudiar en que tejidos la senal transcriptomica de edad es mas fuerte comparando el error del modelo por tejido.
- Filtrado previo en pipelines de seleccion de muestras: descartar muestras con edad predicha implausible antes de análisis costosos de secuenciacion o de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MAE, correlacion de Pearson o Spearman, R², ni comparaciones numericas con otros relojes transcriptomicos o epigeneticos.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una regresion lineal y se ejecuta en CPU.
- GPU: no necesaria. Cualquier GPU seria irrelevante para el cuello de botella, que es la carga y el preprocesado de la matriz de expresion.
- GPU de consumo: no aplica; funciona en cualquier portatil convencional.
- Memoria RAM: dominada por el tamano de la matriz AnnData de entrada (muestras x genes), no por el modelo.
- Despliegue: mediante la libreria `pyaging` en Python; no se contemplan vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia para modelos de lenguaje.
- Latencia y throughput: no publicados; por la naturaleza del modelo, la inferencia sobre los coeficientes es despreciable frente al coste de lectura y normalizacion de los datos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de otros relojes transcriptomicos que permitan una comparacion cuantitativa fiable. Como referencia cualitativa, el propio estudio Pasta describe un reloj transcriptomico mas elaborado del que `reg` es la linea base, pero no se dispone de sus metricas en esta ficha.

| Modelo | Tipo | Entrada | Variable objetivo | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| `pyaging/reg` | Regresion ridge | Transcriptomica multi-tejido | Edad cronologica | MIT (software) / terminos de los autores (pesos) | no disponible |
| Reloj Pasta (mismo estudio) | no disponible | Transcriptomica multi-tejido | Edad y determinantes de envejecimiento | no disponible | no disponible |
| Otros relojes de `pyaging` | relojes epigeneticos y transcriptomicos | metilacion / expresion | edad y fenotipos | variable | no disponible |

## Limitaciones y advertencias

- Ambito restringido a *Homo sapiens* y a datos de transcriptomica multi-tejido; no es aplicable a otras especies, a otros tipos de dato omico ni a texto.
- Solo predice edad cronologica; no estima edad biologica, mortalidad ni respuesta a intervenciones por si mismo.
- Sensible al preprocesado: al depender de una transformacion por rangos y de un conjunto concreto de caracteristicas genicas, diferencias en normalizacion, plataforma de secuenciacion o seleccion de genes pueden degradar las predicciones de forma no documentada.
- Riesgo de extrapolacion: al ser un modelo lineal, las predicciones fuera del rango de edades y tejidos representados en el entrenamiento no estan garantizadas; el autor no publica ese rango.
- Sin metricas de error publicadas en la model card, no es posible acotar la incertidumbre de las predicciones ni compararlas con alternativas.
- Licencia: el codigo de `pyaging` es MIT, pero los pesos conservan los terminos de los autores originales; para uso comercial o redistribucion de pesos hay que verificar esas condiciones, que la model card no detalla.
- No debe usarse con fines clinicos o diagnósticos: es una herramienta de investigacion sin validacion regulatoria declarada.
- Sesgos poblacionales no documentados: se desconoce la representacion de ancestrias, sexos y grupos de edad en el dataset de entrenamiento.
- Repositorio sin likes y con 447 descargas en el momento de la consulta: comunidad de usuarios muy reducida, lo que limita el soporte y la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/reg
- Catalogo de relojes de pyaging: https://pyaging.readthedocs.io
- Publicacion: Salignon, J., et al. (2026). Pasta, a versatile transcriptomic clock, maps the chemical and genetic determinants of aging and rejuvenation. Advanced Science, e76740. https://doi.org/10.1002/advs.76740
