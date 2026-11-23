# joshuandwilliams/AutoCDAScorer

## Resumen

AutoCDAScorer es un conjunto de 16 redes neuronales convolucionales (CNN) publicadas por joshuandwilliams como parte del paquete de R AutoCDAScorer. Su funcion es puntuar automaticamente el area de muerte celular (CDA, cell death area) en imagenes de agroinfiltracion con luz ultravioleta de hojas de *Nicotiana benthamiana*. Cada CDA recibe una puntuacion de severidad en una escala ordinal de 0 (sin muerte celular) a 6 (muerte celular fuerte), lo que sustituye la evaluacion visual manual por un clasificador reproducible.

El modelo no es un LLM ni un modelo generativo: es un clasificador de imagenes de proposito muy especifico, orientado a laboratorios de fitopatologia y biologia vegetal que realizan ensayos de agroinfiltracion de forma rutinaria. Cada archivo acepta una imagen de 64 x 64 x 3 y devuelve probabilidades softmax sobre las siete clases de severidad. Los 16 modelos son configuraciones que empataron, dentro de un error estandar, con la mejor exactitud de validacion cruzada.

La relevancia practica esta en la reproducibilidad y el ahorro de tiempo: el paquete R descarga los pesos, verifica cada archivo con su MD5 y prepara las imagenes en el formato esperado. El conjunto se distribuye con licencia MIT y formato Keras 3, lo que facilita su integracion en flujos de trabajo de analisis de imagenes cientificas sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) para clasificacion de imagenes; 16 modelos independientes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen de 64 x 64 x 3) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo Keras) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | Keras 3 (`.keras`), guardados con Keras 3.15.0 |

## Arquitectura y entrenamiento

Cada uno de los 16 archivos es una CNN que recibe una imagen de 64 x 64 x 3 y produce siete probabilidades softmax, una por cada puntuacion de severidad de muerte celular (0 a 6). El repositorio no detalla la topologia interna (numero de capas, filtros, bloques residuales o funciones de activacion), por lo que ese nivel de detalle no esta disponible.

El entrenamiento se realizo sobre imagenes de agroinfiltracion con UV de hojas de *Nicotiana benthamiana* procedentes de proyectos previos del laboratorio Banfield, con CDAs puntuadas por varios evaluadores humanos. Se aplico aumento geometrico de datos, que amplio el conjunto de entrenamiento de 3.818 a 11.389 imagenes. Los 16 modelos publicados son las configuraciones cuya exactitud en validacion cruzada quedo dentro de un error estandar de la mejor. No se documenta el uso de tecnicas de refuerzo ni de ajuste fino adicional; el paquete combina el promedio de los 16 modelos con un modelo de regresion ordinal sobre 12 caracteristicas artesanales para la prediccion final.

## Capacidades

- Clasificacion de imagenes de CDAs en siete niveles ordinales de severidad (0 a 6).
- Prediccion individual mediante `geom_cnn` (el modelo `geom_cnn_6848.keras`, el mejor de los 16 en el conjunto de validacion retenido).
- Prediccion por ensemble: promedio de los 16 modelos combinado con un modelo de regresion ordinal sobre 12 caracteristicas artesanales incluido en el paquete R.
- Verificacion de integridad de los pesos mediante checksums MD5 almacenados.
- Preparacion automatica de imagenes en el formato esperado por los modelos (64 x 64 x 3).
- Graficos de diagnostico (por ejemplo, `diagnostic_pca()`) para comprobar si las imagenes de entrada se parecen a las de entrenamiento.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Cuantificacion de ensayos de agroinfiltracion: el laboratorio procesa lotes de imagenes UV de hojas de *N. benthamiana* y obtiene una puntuacion de severidad por CDA, reduciendo la variabilidad entre evaluadores humanos.
- Cribado de genes candidatos de muerte celular: al puntuar cientos de CDAs de forma automatica, se puede comparar la severidad inducida por distintas construcciones de forma escalable.
- Reproducibilidad de experimentos: los checksums MD5 y la version fijada de Keras permiten que distintos grupos obtengan resultados comparables con los mismos pesos.
- Control de calidad en pipelines de imagen cientifica: los graficos de diagnostico permiten descartar imagenes que no se parecen a las de entrenamiento antes de confiar en las puntuaciones.
- Docencia y formacion en fitopatologia: el paquete R permite ilustrar la puntuacion de sintomas de muerte celular con un flujo reproducible y sin coste de licencia.
- Integracion en flujos R existentes: al instalarse como paquete de R, encaja en analisis estadisticos posteriores (por ejemplo, modelos mixtos o comparaciones entre tratamientos) sin salir del ecosistema R.
- Sustitucion parcial de la evaluacion visual: el ensemble alcanza una exactitud del 68,83% frente al 68,92% de los evaluadores humanos respecto a la puntuacion de consenso, lo que lo hace util como primera pasada o como segunda opinion.

## Benchmarks y rendimiento

Resultados sobre 308 imagenes de test retenidas que ningun modelo vio durante entrenamiento o seleccion:

| Metodo | Puntuacion exacta | Dentro de una puntuacion |
|---|---|---|
| Evaluadores humanos (frente al consenso) | 68,92% | 92,80% |
| `ensemble` | 68,83% | 98,38% |
| `geom_cnn` (`geom_cnn_6848.keras`) | 66,88% | 99,03% |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de proposito general.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de CNNs que procesan imagenes de 64 x 64 x 3, la huella de memoria es muy reducida y probablemente cabe en cualquier GPU consumer, pero no se publican cifras.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada explicitamente, aunque por el tamano de entrada y la naturaleza del modelo es altamente probable.
- Opciones de despliegue: paquete R AutoCDAScorer sobre TensorFlow y Keras 3 (requiere Keras 3.15.0 o superior para leer los archivos `.keras`); no se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo es un clasificador de imagenes muy especifico de un dominio cientifico concreto, y no se han identificado alternativas publicas equivalentes en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoCDAScorer | no disponible | no aplica | 68,83% exacto / 98,38% dentro de una puntuacion | MIT | Hugging Face y GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: las puntuaciones solo son fiables en imagenes de agroinfiltracion con UV de *N. benthamiana* recortadas a una sola CDA. Fuera de ese dominio, los resultados no son validos.
- Dependencia de la similitud con el entrenamiento: el autor recomienda revisar los graficos de diagnostico (`diagnostic_pca()`) antes de confiar en las puntuaciones.
- Errores concentrados en puntuaciones adyacentes: la mayoria de los fallos se producen entre niveles contiguos, igual que ocurre entre evaluadores humanos.
- Requisito de version: los archivos `.keras` se guardaron con Keras 3.15.0 y versiones anteriores no pueden leerlos.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos mas alla de la limitacion de dominio.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de puntuaciones erroneas en imagenes atipicas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion; no se documentan restricciones adicionales.
- Dependencia de TensorFlow y Keras en R: requiere instalar y configurar el entorno Python y TensorFlow, lo que anade complejidad operativa.
- Ausencia de datos de rendimiento en hardware: no hay cifras de latencia o throughput que permitan planificar capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshuandwilliams/AutoCDAScorer
- Repositorio del paquete R AutoCDAScorer: https://github.com/joshuandwilliams/AutoCDAScorer
- DOI asociado: https://doi.org/10.57967/hf/11810
