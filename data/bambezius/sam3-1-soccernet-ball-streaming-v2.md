# bambezius/sam3.1-soccernet-ball-streaming-v2

## Resumen

Este repositorio, publicado por el usuario bambezius, contiene componentes de seguimiento (tracker) ajustados por fine-tuning sobre el modelo base facebook/sam3.1 de Meta, especializados en el seguimiento del balon en secuencias de futbol del dataset SoccerNet. No es un modelo independiente: segun la propia model card, requiere el checkpoint original de sam3.1, que esta sujeto a acceso restringido (gated) y a su acuerdo de licencia, y los pesos del encoder de imagen congelado no se redistribuyen en este repositorio. El repositorio pesa 0,3 GB y aloja basicamente dos ficheros de checkpoint en formato PyTorch (.pt).

El modelo resuelve una tarea concreta de segmentacion de objetos en video (video object segmentation, VOS): dado un unico cuadro delimitador inicial por clip, el tracker propaga la mascara del objeto a lo largo de la secuencia, apoyandose en memoria espacial y en object pointers. Es relevante para el ambito de analitica deportiva y para la investigacion en seguimiento de objetos, porque adapta un modelo fundacional de segmentacion a un dominio especifico (futbol) con una ventana temporal declarada de 16 fotogramas para el calculo de gradientes.

La relevancia practica es limitada por su estado: cero descargas y cero likes en el momento de la consulta, ausencia de resultados de benchmarks publicados en la informacion disponible y dependencia obligatoria del checkpoint base con acceso controlado. Se trata, por tanto, de un artefacto de investigacion o de un punto de partida reproducible, no de un componente listo para produccion sin trabajo adicional de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tracker de segmentacion de video construido sobre facebook/sam3.1 (encoder de imagen congelado + componentes de seguimiento con memoria espacial y object pointers); no disponible el detalle completo de la arquitectura del modelo base en la informacion proporcionada |
| Parametros totales | no disponible (el encoder de imagen del modelo base no se duplica en el repositorio; el peso de 0,3 GB corresponde solo a los componentes del tracker) |
| Longitud de contexto | no aplicable como contexto de texto; ventana temporal declarada: 16 fotogramas para gradientes, memoria espacial con fotograma inicial + 6 recientes, object pointers con fotograma inicial + 15 recientes |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints .pt de PyTorch; no se publican versiones cuantizadas ni en otros formatos) |
| Idiomas soportados | no aplicable (modelo de vision; no procesa ni genera lenguaje) |
| Licencia | SAM License (license: other, license_name: sam-license), con fichero LICENSE incluido en el repositorio |
| Formato de pesos | PyTorch .pt (pickle): best.pt y last.pt |
| Tarea | Video object segmentation / seguimiento de objeto unico (balon de futbol) a partir de una caja inicial por clip |
| Modelo base | facebook/sam3.1 (gated, requiere aceptar el acuerdo de acceso y su licencia) |
| Ficheros principales | best.pt (tracker seleccionado por minima perdida de validacion), last.pt (tracker + optimizador + estado de RNG, epoca y early stopping) |
| Scripts incluidos | scripts/train_sam31_streaming.py (reanudacion de entrenamiento), scripts/export_sam31_checkpoint.py (fusion con el modelo base fijado para la API oficial de inferencia) |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion y actualizacion | 2026-09-19 (alta y ultima actualizacion registradas el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un esquema de seguimiento en streaming sobre SAM 3.1. El entrenamiento emplea una caja inicial por clip como punto de partida y mantiene dos estructuras de estado: una memoria espacial que combina el fotograma inicial con los seis fotogramas mas recientes, y un conjunto de object pointers que combina el fotograma inicial con los quince mas recientes. Los gradientes se calculan sobre ventanas de 16 fotogramas. Las anotaciones ausentes y los casos sin inicializacion se excluyen del calculo de la perdida y de las metricas, segun se indica en la model card.

Un punto relevante para interpretar los resultados: los objetivos de entrenamiento son pseudo-mascaras circulares derivadas de cajas, no segmentaciones manuales. Es decir, el tracker se supervisa contra un proxy geometrico del balon, no contra mascaras anotadas pixel a pixel. El modelo seleccionado (best.pt) se eligio por minima perdida de validacion, con una paciencia de tres epocas de validacion sin mejora antes de aplicar early stopping. No se especifican en la informacion disponible el numero de tokens o fotogramas de entrenamiento, la composicion exacta del dataset, la resolucion de entrada, el numero de parametros del tracker ni si se aplicaron tecnicas de RLHF/DPO (no aplicables en este dominio) u otras innovaciones mas alla de la ventana temporal descrita.

## Capacidades

- Seguimiento de un objeto concreto (el balon) a lo largo de secuencias de video de futbol, propagando la mascara desde una unica caja inicial por clip.
- Segmentacion de video en streaming con memoria espacial de corto plazo y object pointers de mayor alcance temporal.
- Reanudacion de entrenamiento y ajuste fino adicional mediante el script train_sam31_streaming.py, con recuperacion del estado de optimizador, RNG y early stopping.
- Exportacion de los pesos ajustados mediante export_sam31_checkpoint.py para fusionarlos con la version fijada del modelo base y usarlos con la API oficial de inferencia.
- No dispone de soporte de tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de capacidades de texto, razonamiento, codigo, matematicas, audio ni vision general descriptiva; su alcance es la segmentacion y el seguimiento visual en el dominio del futbol.
- No se declaran capacidades multilingues ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Analitica de retransmisiones deportivas: seguimiento continuo del balon en clips de SoccerNet para generar trayectorias y mapas de calor de su posicion sobre el terreno de juego.
- Etiquetado semi-automatico de datasets: usar una caja inicial por clip para preanotar mascaras del balon y reducir el coste de anotacion manual en nuevos corpus de video.
- Produccion audiovisual automatizada: reencuadre o zoom dinamico que sigue al balon para generar versiones verticales o recortes de jugadas destacadas.
- Analisis tactico y deteccion de eventos: alimentar las trayectorias extraidas a modulos posteriores que calculen posesion, pases o tiros a partir del movimiento del balon.
- Revision de jugadas asistida: reconstruccion de la trayectoria del balon en jugadas concretas para apoyar la revision por parte de analistas, siempre como herramienta auxiliar y no como decision automatica.
- Investigacion en video object segmentation: servir como baseline reproducible para comparar estrategias de memoria espacial, object pointers y ventanas de gradiente en un dominio acotado.
- Depuracion de sistemas de tracking: analizar en que fotogramas el tracker pierde el objeto (oclusiones, salidas de encuadre) usando la perdida de validacion como referencia de calidad.
- Control de calidad de metadatos deportivos: cruzar las trayectorias generadas con anotaciones existentes para detectar clips mal etiquetados o con inicializaciones invalidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que best.pt se selecciono por minima perdida de validacion y que las anotaciones ausentes y los casos sin inicializacion se excluyen de la perdida y de las metricas, sin facilitar cifras concretas (J&F, IoU, precision temporal u otras), ni comparaciones numericas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declaran requisitos de memoria en la model card, y el tamano del repositorio (0,3 GB) no es representativo del consumo real, ya que no incluye el encoder de imagen del modelo base.
- Modelo base necesario: facebook/sam3.1 debe descargarse por separado (repositorio con acceso restringido) y sumarse a los 0,3 GB de este repositorio para poder inferir con la API oficial.
- GPU recomendadas: no disponible. No se especifica ninguna GPU objetivo ni perfil de despliegue.
- Encaje en GPU de consumo: no disponible. Sin datos de VRAM del modelo completo ni del tracker no es posible afirmar si cabe en una RTX 4090 u otras GPU de gama de consumo.
- Opciones de despliegue: los scripts del propio repositorio (entrenamiento con reanudacion y exportacion/fusion con el modelo base fijado para la API oficial de inferencia). vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La unica referencia documentada es el modelo base sobre el que se construye:

| Modelo | Relacion | Parametros | Ventana temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambezius/sam3.1-soccernet-ball-streaming-v2 | Objeto de esta ficha | no disponible | 16 fotogramas de gradiente; memoria de 7 y object pointers de 16 fotogramas | SAM License | Publico en HuggingFace, requiere el base gated |
| facebook/sam3.1 | Modelo base sobre el que se ajusta | no disponible | no disponible en la informacion proporcionada | SAM License | Gated, requiere acuerdo de acceso |

## Limitaciones y advertencias

- No es un checkpoint autonomo: la propia model card avisa de que estos ficheros no son checkpoints oficiales de prediccion por si solos y de que requieren el checkpoint original gated facebook/sam3.1 y su acuerdo de licencia.
- Objetivos de entrenamiento aproximados: las dianas son pseudo-mascaras circulares derivadas de cajas, no segmentaciones manuales, por lo que la calidad de la mascara predicha no equivale a la de un modelo supervisado con anotacion pixel a pixel.
- Dependencia de la inicializacion: se asume una caja inicial por clip; los casos sin inicializacion se excluyen de la perdida y las metricas, de modo que el comportamiento en escenarios sin caja inicial no esta caracterizado.
- Dominio muy restringido: ajustado para el balon en secuencias de SoccerNet; no hay evidencia en la informacion disponible de generalizacion a otros deportes, otros objetos, otras ligas, otras resoluciones o condiciones de iluminacion distintas.
- Sin validacion comunitaria: cero descargas y cero likes, sin benchmarks publicados ni evaluaciones independientes.
- Riesgo de alucinacion visual: como todo tracker, puede derivar hacia regiones incorrectas en oclusiones prolongadas, balones fuera de encuadre o cambios bruscos de iluminacion; no se documentan tasas de fallo.
- Seguridad de los ficheros: se distribuyen checkpoints en formato pickle y la model card advierte explicitamente de cargarlos solo desde fuentes de confianza.
- Licencia y uso comercial: la distribucion se realiza bajo la SAM License y el modelo base esta sujeto a un acuerdo de acceso; los terminos concretos de uso comercial no se detallan en la informacion disponible, por lo que hay que revisar el fichero LICENSE y la licencia del modelo base antes de cualquier uso en produccion.
- Datos del dataset: los medios y anotaciones de SoccerNet no se redistribuyen en el repositorio y siguen sujetos a los terminos del dataset original.
- Idiomas y texto: al ser un modelo de vision, no procesa lenguaje, no soporta tool calling ni agentes, y no debe evaluarse con criterios de modelos generativos de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambezius/sam3.1-soccernet-ball-streaming-v2
- Modelo base: https://huggingface.co/facebook/sam3.1
- Fichero de licencia incluido en el repositorio: LICENSE (referenciado como license_link en la model card)
- Script de entrenamiento y reanudacion: scripts/train_sam31_streaming.py (incluido en el repositorio)
- Script de exportacion y fusion con el modelo base: scripts/export_sam31_checkpoint.py (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con este modelo (unicamente resultados no pertinentes sobre copias de seguridad con Macrium Reflect), por lo que no se han podido recopilar enlaces adicionales verificables.
