# aungkomyint/PlantPerturb-Small

## Resumen

PlantPerturb-Small no es un modelo de lenguaje: es un banco de pruebas reproducible de datos pequeños (*small-data benchmark*) publicado en HuggingFace por el autor `aungkomyint`. Su objetivo es predecir la respuesta transcripcional de ecotipos de *Arabidopsis thaliana* frente a una sequía leve a partir de sus perfiles basales de expresión génica. El modelo finalmente seleccionado es una regresión ridge sobre componentes principales (PCA–ridge), implementada con scikit-learn, y se distribuye junto con el manuscrito, los scripts de preprocesado y las tablas de métricas.

El problema que aborda es metodológico: establecer una línea base honesta y reproducible en un régimen de pocos datos, donde el sobreajuste y el cambio de distribución entre estudios son los riesgos dominantes. En la evaluación externa sobre el estudio E-MTAB-3279, los modelos aprendidos obtienen un error superior a la predicción trivial de "cambio cero", lo que evidencia un desplazamiento de distribución sustancial entre estudios y cuestiona la transferibilidad de la calibración.

Es relevante ahora porque aporta un caso de estudio transparente sobre evaluación cruzada, comparación de alternativas sencillas (medias, vecinos cercanos, PLS, PCA–ridge) y reproducibilidad de extremo a extremo desde datos accessionados, sin duplicar los ficheros crudos de RNA-seq en el repositorio. El manuscrito se encuentra en estado de borrador de investigación, con comparaciones pendientes de validación cruzada anidada repetida antes de fijar afirmaciones de publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reduccion de dimensionalidad PCA seguida de regresion ridge (scikit-learn) sobre vectores de expresion genica |
| Parametros totales | no disponible (no se publica el numero de componentes principales ni de coeficientes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la entrada es un vector de expresion de 17.633 transcritos retenidos) |
| Tipos de cuantizacion | no disponible (no aplica a un modelo lineal de scikit-learn) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las salidas son valores de expresion genica) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | joblib (formato de serializacion de scikit-learn, coherente con la libreria declarada); el detalle exacto no se especifica en la model card |
| Tamano del repositorio | 0.0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un *pipeline* clasico de aprendizaje estadistico: proyeccion de los perfiles de expresion basal a un espacio de componentes principales (PCA) y ajuste posterior de una regresion ridge sobre esas componentes para predecir la respuesta transcripcional a sequia leve. Se compara contra cuatro alternativas de complejidad creciente: prediccion de cambio cero, media del conjunto de desarrollo, vecinos mas cercanos y regresion por minimos cuadrados parciales (PLS). Es un modelo determinista y de tamano reducido, pensado para ser interpretable y barato de reproducir, no una red neuronal ni una arquitectura transformer, MoE, SSM o hibrida.

Los datos proceden de dos estudios accessionados: E-MTAB-5009 como estudio primario y E-MTAB-3279 como estudio externo de evaluacion. El analisis principal usa 89 ecotipos completos y 17.633 transcritos retenidos tras filtrado por CPM, con una particion a nivel de ecotipo de 62/13/14 para entrenamiento, validacion y prueba usando la semilla 42. Los ficheros crudos de RNA-seq no se duplican en el repositorio: los scripts incluidos descargan y preprocesan los datos a partir de los accesions. No hay constancia de RLHF, DPO ni tecnicas de alineamiento, dado que no es un modelo generativo de lenguaje. La model card advierte que las comparaciones entre modelos requieren validacion cruzada anidada repetida antes de dar por definitivas las conclusiones.

## Capacidades

- Prediccion de la respuesta transcripcional (delta de expresion) de ecotipos de *Arabidopsis thaliana* ante sequia leve a partir del perfil basal de expresion.
- Regresion multivariante sobre datos de alta dimension y bajo numero de muestras (17.633 transcritos, 89 ecotipos).
- Evaluacion comparativa de metodos: incluye implementaciones de referencia (cambio cero, media de desarrollo, PCA–ridge, vecinos mas cercanos y PLS) con MSE, MAE, Pearson y Spearman.
- Reproducibilidad de extremo a extremo: scripts de descarga, preprocesado, entrenamiento y evaluacion, ademas de tablas de metricas y figuras.
- Generacion del manuscrito a partir de fuente Quarto y BibTeX, con render a Typst.
- Evaluacion externa y analisis de cambio de distribucion entre estudios (E-MTAB-5009 frente a E-MTAB-3279).
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision ni audio.
- No dispone de *tool calling*, *function calling*, soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues: no procesa lenguaje natural como entrada ni como salida.
- No dispone de modo de pensamiento (*thinking mode*) ni de ninguna capacidad generativa.

## Casos de uso

- Linea base en investigacion en biologia computacional: sirve como referencia metodologica para comparar nuevos modelos de prediccion de respuesta a estres abiotico en plantas, dado que publica metricas y particiones concretas (62/13/14 con semilla 42) que permiten una comparacion justa.
- Docencia de machine learning con datos reales de alta dimension: el repositorio permite ilustrar maldicion de la dimensionalidad, regularizacion ridge, seleccion de componentes principales y validacion cruzada sobre 17.633 variables y 89 muestras.
- Estudio de cambio de distribucion entre estudios: el resultado negativo en E-MTAB-3279 (los modelos aprendidos empeoran la prediccion de cambio cero) es un caso concreto para analizar transferibilidad y calibracion entre cohortes.
- Desarrollo de metodos de seleccion de caracteristicas: el conjunto de 17.633 transcritos filtrados por CPM permite probar tecnicas de reduccion de dimensionalidad o seleccion y confrontarlas con el pipeline PCA–ridge publicado.
- Reutilizacion del pipeline de preprocesado de RNA-seq: los scripts de descarga y preparacion desde E-MTAB-5009 y E-MTAB-3279 pueden adaptarse a otros estudios con estructura de datos similar.
- Reproduccion y auditoria de resultados publicados: cualquier revisor puede reconstruir las tablas y figuras del manuscrito con `quarto render paper/plantperturb_manuscript.qmd --to typst`, lo que lo hace util en procesos de revision reproducible.
- Prototipado de bajo coste en entornos sin GPU: al ser un modelo lineal de scikit-learn, el entrenamiento y la inferencia se ejecutan en CPU, lo que facilita experimentos en portatiles o en infraestructura limitada.
- Analisis de arquitectura de experimentos de sequia en *Arabidopsis*: evaluacion de si los disenos actuales tienen suficientes replicas biologicas, a partir de la advertencia del repositorio sobre la falta de replicas independientes en la mayoria de combinaciones ecotipo-condicion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de prueba (14 ecotipos retenidos):

| Modelo | Test MSE | Test MAE | Pearson | Spearman |
|---|---:|---:|---:|---:|
| Cambio cero | 0.1451 | 0.2729 | no definido | no definido |
| Media de desarrollo | 0.1366 | 0.2666 | 0.2155 | 0.1705 |
| PCA–ridge | 0.1302 | 0.2578 | 0.2518 | 0.2142 |
| Vecinos mas cercanos | 0.1413 | 0.2711 | 0.1939 | 0.1646 |
| PLS | 0.1300 | 0.2587 | 0.2429 | 0.2056 |

Segun el autor, PCA–ridge ofrece el mejor equilibrio entre metricas, mientras que PLS obtiene un MSE un 0,2 % inferior, diferencia demasiado pequena para establecer superioridad con solo 14 ecotipos en el conjunto de prueba. En el estudio externo e independiente E-MTAB-3279, los modelos aprendidos obtuvieron un error superior a la prediccion de cambio cero, lo que indica un desplazamiento de distribucion sustancial entre estudios. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: al tratarse de un modelo PCA–ridge de scikit-learn, no requiere GPU. El repositorio ocupa 0.0 GB segun HuggingFace.
- GPU recomendadas: no aplica. No se describe ningun requisito de aceleracion por hardware.
- Compatibilidad con GPU de consumo: no aplica; no es necesario ni util para este modelo.
- Memoria: no disponible. Depende del tamano de la matriz de expresion cargada (17.633 transcritos por ecotipo en el analisis publicado) y del numero de componentes PCA, dato no especificado.
- Opciones de despliegue: carga directa del artefacto joblib desde Python con scikit-learn. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos generativos de lenguaje.
- Latencia y *throughput*: no disponibles. No se publican mediciones de tiempo de inferencia ni de entrenamiento.
- Entorno de reproduccion: se requiere Python, Quarto y Typst para reconstruir el manuscrito, ademas de ejecutar los scripts incluidos para regenerar los datos procesados.

## Comparativa con modelos similares

No hay constancia de otros modelos o benchmarks comparables en la informacion proporcionada. La unica comparacion disponible es la interna del propio estudio, entre metodos clasicos de regresion aplicados al mismo conjunto de datos:

| Metodo | Test MSE | Test MAE | Pearson | Spearman | Contexto de entrada | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|---|
| PCA–ridge | 0.1302 | 0.2578 | 0.2518 | 0.2142 | 17.633 transcritos | no disponible | repositorio HuggingFace |
| PLS | 0.1300 | 0.2587 | 0.2429 | 0.2056 | 17.633 transcritos | no disponible | incluido como comparador en el repositorio |
| Vecinos mas cercanos | 0.1413 | 0.2711 | 0.1939 | 0.1646 | 17.633 transcritos | no disponible | incluido como comparador en el repositorio |
| Media de desarrollo | 0.1366 | 0.2666 | 0.2155 | 0.1705 | no aplica | no disponible | linea base trivial |
| Cambio cero | 0.1451 | 0.2729 | no definido | no definido | no aplica | no disponible | linea base trivial |

## Limitaciones y advertencias

- No es un predictor validado para decisiones agricolas, tal como declara explicitamente la model card. Su uso previsto es investigacion, docencia y desarrollo de metodos.
- Cambio de distribucion entre estudios: en la evaluacion externa con E-MTAB-3279, los modelos aprendidos rindieron peor que la prediccion de cambio cero, lo que indica que la calibracion no se transfiere de forma fiable entre estudios.
- Falta de replicas biologicas independientes en la mayoria de combinaciones ecotipo-condicion, lo que limita la potencia estadistica y la capacidad de separar senal de ruido.
- El RNA-seq de hoja completa promedia estados celulares distintos, lo que difumina la respuesta real de tipos celulares concretos.
- Potencia estadistica limitada: la comparacion entre PCA–ridge y PLS se apoya en 14 ecotipos retenidos, una diferencia de MSE del 0,2 % es insuficiente para declarar superioridad.
- El manuscrito es un borrador de investigacion: la informacion de autoria, financiacion y declaracion de intereses son marcadores de posicion, y las comparaciones requieren validacion cruzada anidada repetida antes de consolidar afirmaciones.
- Licencia no especificada: al no indicarse licencia en el repositorio, el uso comercial y la redistribucion quedan en un limbo legal que conviene aclarar con el autor antes de cualquier despliegue.
- Ambito restringido a una sola especie (*Arabidopsis thaliana*) y a una sola condicion de estres (sequia leve); no hay evidencia de generalizacion a otros cultivos, tejidos o tipos de estres.
- No existe informe de sesgos en el sentido habitual de los modelos de lenguaje, pero si un sesgo de muestreo evidente: 89 ecotipos completos y un unico estudio primario condicionan cualquier conclusion.
- Los ficheros crudos de RNA-seq no se incluyen en el repositorio, por lo que la reproduccion depende de la disponibilidad continua de los accesions E-MTAB-5009 y E-MTAB-3279.
- Ausencia total de resultados de benchmarks frente a otros grupos de investigacion: las unicas cifras disponibles son las internas del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aungkomyint/PlantPerturb-Small
- Estudio primario E-MTAB-5009: https://www.ebi.ac.uk/biostudies/arrayexpress/studies/E-MTAB-5009
- Estudio externo E-MTAB-3279: https://www.ebi.ac.uk/biostudies/arrayexpress/studies/E-MTAB-3279
- Manuscrito (borrador) dentro del repositorio: `paper/PlantPerturb-Small-Manuscript-Draft.pdf`
- Fuente editable del manuscrito: `paper/plantperturb_manuscript.qmd`
- Scripts de datos, entrenamiento y evaluacion: directorio `scripts/` del repositorio
- Tablas de metricas y figuras: directorio `results/` del repositorio
- Modelo ajustado y metadatos legibles por maquina: directorio `model/` del repositorio
- Notas de investigacion paso a paso: directorio `notes/` del repositorio
- Nota sobre la busqueda web: los resultados recuperados (ayuda de Google Translate, articulos de bartleby sobre *Animal Farm* y modernizacion) no guardan relacion con este modelo y no se han utilizado como fuente.
