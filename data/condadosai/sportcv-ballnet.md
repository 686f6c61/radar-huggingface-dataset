# CondadosAI/sportcv-ballnet

## Resumen

sportcv-ballnet es una red neuronal convolucional de tamano reducido disenada para localizar una pelota de pickleball en fotogramas de 1080p procedentes de una camara fija de retransmision. No es un modelo de lenguaje: es una cabeza detectora de heatmap que forma parte del proyecto sportcv, desarrollado por Luis Condados (CondadosAI), cuyo objetivo es el analisis de video deportivo offline desde una unica camara fija. Su razon de ser es puramente de rendimiento: el baseline WASB necesitaba 58,6 ms por fotograma, un 175% de un presupuesto de 33,37 ms (30 fps), mientras que esta cabeza resuelve la misma tarea en 9,88 ms en FP16 sobre una RTX 3060 y 2,50 ms con TensorRT FP16 sobre una RTX A6000.

La arquitectura, denominada BallNet, tiene ancho 32 y stride de salida 4, y produce un unico heatmap junto con un desplazamiento subpixel que se decodifica a una posicion en pixeles mas una confianza. Se entreno durante 80 epocas (checkpoint en la epoca 65) en aproximadamente 30 minutos sobre una A40, con un coste declarado de 0,35 dolares. El dato mas llamativo es el tamano del conjunto de entrenamiento: solo 396 fotogramas anotados extraidos de una ventana de 60 segundos de un unico partido bajo licencia Creative Commons, es decir, en torno al 1,2% de esa ventana.

El modelo es relevante ahora como ejemplo de diseno consciente del sobreajuste: en lugar de perseguir generalidad, el autor acota el dominio de forma explicita (un partido, una iluminacion, una camara, una pista) y mide con rigor el error en pixeles sobre una jugada reservada. Con 0 descargas y 0 likes en HuggingFace en el momento de la consulta, su interes es mas metodologico que de adopcion masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BallNet, CNN de heatmap de un solo canal, ancho 32, stride de salida 4, mas regresion de offset subpixel |
| Parametros totales | no disponible (el autor no publica el recuento; red de ancho 32 muy compacta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada = fotograma completo con padding a multiplo de 32, 1920x1088 para 1080p) |
| Tipos de cuantizacion | FP32 y FP16 (exportaciones ONNX); checkpoint PyTorch |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje) |
| Licencia | Apache-2.0 para pesos y codigo; el metraje de entrenamiento es CC BY 3.0 y exige atribucion |
| Formato de pesos | `.pt` (PyTorch), `.onnx` (FP32), `.fp16.onnx` (FP16) |

## Arquitectura y entrenamiento

BallNet es una red convolucional que predice un heatmap unico; la posicion del pico se decodifica a coordenadas en pixeles y se acompana de un offset subpixel para ganar precision por debajo del stride. La entrada es el fotograma completo con padding a multiplos de 32 (1920x1088 para 1080p), de modo que no se recorta la region de la pista. La salida incluye ademas una puntuacion de confianza, cuya distribucion es claramente bimodal (p25 0,047; p75 0,89), lo que hace obligatorio el uso de un umbral: `sp-detect` emplea 0,35. El encuadre arquitectonico se inspira en el paper WASB (Tarashima et al., BMVC 2023), que es precisamente el baseline al que este modelo sustituye.

El entrenamiento duro 80 epocas con checkpoint en la epoca 65, unas 24 horas menos de lo habitual: aproximadamente 30 minutos sobre una unica A40 y 0,35 dolares de coste. Los datos son 396 fotogramas anotados de una ventana de 60 segundos de un unico partido (2026.07.25 WD Open, Sabrina Lam y Grace Thomas contra Lingzhe Xu y Margit Aardmaa), procedente del canal de YouTube @pickleball4you bajo licencia CC BY 3.0. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, logicas en un modelo de vision. La innovacion tecnica destacable no es arquitectonica sino economica: el proyecto midio cuanto etiquetado era realmente necesario en lugar de asumir un volumen grande, y a cambio asumio un sobreajuste deliberado a un unico dominio.

## Capacidades

- Deteccion de pelota de pickleball por heatmap: produce la posicion del pico en pixeles y una confianza asociada.
- Regresion subpixel: corrige la cuantizacion del stride de salida 4 para lograr errores de mediana por debajo de 2 px.
- Procesamiento de fotogramas 1080p completos sin recorte, lo que permite que la pelota vuele por encima de la pista sin salir del area de inferencia.
- Discriminacion presencia/ausencia de pelota mediante la confianza bimodal, siempre que se aplique un umbral (0,35 en `sp-detect`).
- Trazabilidad del artefacto: los hashes SHA-256 de los pesos estan fijados en `src/sportcv/core/weights.py` y se verifican en cada carga.
- Exportacion portatil: se ofrecen pesos PyTorch y ONNX en FP32 y FP16 para su integracion en TensorRT.
- Tool calling / function calling: no disponible (no aplica a un modelo de vision).
- Capacidades de agente y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no procesa texto).
- Vision general de escenas, audio o modo de razonamiento explicito: no disponible; el modelo solo produce el heatmap de la pelota.

## Casos de uso

- Analisis de partidos de pickleball desde una camara fija: la cabeza detecta la pelota en cada fotograma de una retransmision 1080p y alimenta un pipeline de analisis que, segun el autor, termina antes de que el clip acabe de reproducirse en una GPU de portatil de 6 GB. El modelo es adecuado porque su latencia de 9,88 ms en FP16 deja margen frente a los 33,37 ms de un flujo a 30 fps.
- Generacion de trayectorias del balon: encadenando las posiciones decodificadas fotograma a fotograma se obtiene una trayectoria continua, con una cobertura del 76-89% de los fotogramas en juego en cada minuto de un intervalo de 25,6 minutos no visto durante el entrenamiento. Sirve para calcular velocidades y alturas del balon.
- Segmentacion de rallies: la confianza bimodal permite separar los tramos con pelota en juego de los tiempos muertos; el umbral de 0,35 convierte la salida en una senal binaria utilizable para cortar el video.
- Automatizacion de resumenes y highlights: al conocer cuando hay pelota en juego y donde esta, se pueden seleccionar automaticamente los tramos relevantes de una grabacion larga sin revision manual.
- Etiquetado semi-automatico de nuevos datasets: las detecciones con alta confianza pueden proponerse como preanotaciones a un anotador humano, reduciendo el coste de etiquetado, que el propio autor identifica como la entrada cara del proyecto.
- Revision de jugadas asistida: la posicion subpixel (1,73 px de error mediano en jugada reservada) permite reconstruir si la pelota botó dentro o fuera de los limites con una precision suficiente para generar graficos de revision, no para arbitraje oficial.
- Despliegue en hardware de borde o portatiles: con 2,50 ms por fotograma en TensorRT FP16 sobre una RTX A6000 y 9,88 ms sobre una RTX 3060, el modelo cabe en equipos de consumo y puede ejecutarse en tiempo real sobre video grabado o en directo desde una camara fija.

## Benchmarks y rendimiento

El autor publica metricas medidas sobre una jugada reservada (no vista en entrenamiento) y sobre la totalidad de las etiquetas. No hay resultados de MMLU, HumanEval, GSM8K ni similares, ya que no es un modelo de lenguaje.

| Metrica | Valor |
|---|---|
| Error mediano del pico (jugada reservada) | 1,73 px |
| Detecciones dentro de 8 px (jugada reservada) | 94,5% |
| Confianza mediana con pelota presente | 0,90 |
| Confianza mediana con pelota ausente | 0,07 |
| Error mediano sobre todas las etiquetas (incluye ventana de entrenamiento) | 1,31 px |
| Detecciones dentro de 8 px sobre todas las etiquetas | 97% |
| Cobertura de trayectoria en intervalo de 25,6 min no visto | 76-89% de fotogramas en juego por minuto (mediana 80%) |
| Tasa de deteccion bruta sobre todos los fotogramas | 47% (el autor senala que no es interpretable: la pelota esta ausente la mayor parte del tiempo) |
| Latencia FP16 en RTX 3060 | 9,88 ms por fotograma |
| Latencia TensorRT FP16 en RTX A6000 | 2,50 ms por fotograma |
| Latencia del baseline WASB | 58,6 ms por fotograma (175% de un presupuesto de 33,37 ms) |
| Discrepancia de paridad tras exportacion a TensorRT | 0,0008 px (0,04% del error propio del modelo) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Se trata de una red convolucional de ancho 32 con salida de heatmap unico, por lo que su huella de pesos es muy reducida; el propio autor indica que el pipeline completo cabe en una GPU de portatil de 6 GB.
- GPU recomendadas: RTX 3060 (6 GB) para FP16 a 9,88 ms por fotograma; RTX A6000 para TensorRT FP16 a 2,50 ms; A40 empleada para el entrenamiento.
- GPU de consumo: si, cabe con holgura en GPUs de gama media con 6 GB o mas, incluidas las mencionadas por el autor.
- Opciones de despliegue: PyTorch (carga directa del checkpoint `.pt` mediante `sportcv.core.ballnet.BallNet`), ONNX Runtime (FP32 o FP16) y TensorRT a partir de `ballnet.fp16.onnx`. El autor no publica un motor TensorRT precompilado a proposito, porque el motor queda ligado a una version de TensorRT y, sin el flag Ampere o superior, a una unica arquitectura de GPU.
- Latencia y throughput: 9,88 ms por fotograma FP16 en RTX 3060 (aproximadamente 101 fps) y 2,50 ms por fotograma en TensorRT FP16 sobre RTX A6000 (aproximadamente 400 fps). El presupuesto objetivo del pipeline es 33,37 ms, equivalente a 30 fps.
- Requisitos de software: libreria `sportcv`; el CLI documentado es `uv run sp-detect data/<video>.mp4`, que resuelve y verifica los pesos contra los hashes fijados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sportcv-ballnet | CNN de heatmap (BallNet), ancho 32, stride 4 | no disponible | Fotograma 1080p (1920x1088 tras padding) | 1,73 px de error mediano; 9,88 ms/frame FP16 en RTX 3060; 2,50 ms/frame TensorRT FP16 en A6000 | Apache-2.0 | HuggingFace y GitHub de CondadosAI |
| WASB (Tarashima et al., BMVC 2023) | Baseline de deteccion y tracking de pelotas deportivas | no disponible | no disponible | 58,6 ms/frame segun la medicion del autor, 175% del presupuesto de 33,37 ms | no disponible | Paper publico en arXiv (2311.05237) |
| Otros detectores de pelota genericos (por ejemplo, basados en YOLO) | Deteccion de objetos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos medidos de terceros alternativos en la informacion proporcionada; la unica comparacion cuantitativa documentada es contra WASB, el baseline que el modelo reemplaza.

## Limitaciones y advertencias

- Sobreajuste deliberado a un unico partido: un balon, un conjunto de luces, una camara y una pista. El autor advierte explicitamente de que no es un detector generico de pelotas deportivas y de que cualquier otro metraje debe considerarse no medido hasta comprobarlo.
- Exclusivo de pickleball: no se ha probado con ningun otro deporte.
- El publico viste con colores similares a los del balon, lo que constituye un modo de fallo documentado en el DESIGN.md del proyecto.
- El recorte de pista era incorrecto hasta que se corrigio, porque el balon vuela por encima de la pista; se documenta como modo de fallo conocido.
- La cabeza siempre produce un pico, de modo que el umbral de confianza no es opcional; sin umbral, cualquier fotograma genera una deteccion espuria.
- La tasa de deteccion bruta sobre todos los fotogramas es del 47%, un valor que el autor desaconseja interpretar como calidad del modelo porque los fotogramas sin pelota son mayoria.
- No se ha publicado ningun motor TensorRT: construir uno propio obliga a asumir la dependencia de version y de arquitectura de GPU.
- Licencia: los pesos y el codigo son Apache-2.0, pero el metraje de entrenamiento es CC BY 3.0 y exige atribucion a @pickleball4you en cualquier salida derivada, nombrando la licencia realmente concedida (YouTube concede 3.0, nunca 4.0).
- Riesgo de alucinacion en el sentido clasico de modelos generativos: no aplica, pero si existe el riesgo equivalente de detecciones falsas con baja confianza si no se filtra por umbral.
- Repositorio con 0 descargas y 0 likes y un tamano declarado de 0,0 GB en el momento de la consulta: disponibilidad y mantenimiento a largo plazo no contrastados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CondadosAI/sportcv-ballnet
- Repositorio del proyecto sportcv: https://github.com/CondadosAI/sportcv
- Hashes de pesos fijados: https://github.com/CondadosAI/sportcv/blob/main/src/sportcv/core/weights.py
- Paper de referencia WASB (Tarashima et al., BMVC 2023): https://arxiv.org/abs/2311.05237
- Metraje de entrenamiento (YouTube, CC BY 3.0): https://www.youtube.com/watch?v=T5rmWjvt8Os

Nota: las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo. Los unicos resultados obtenidos tratan sobre el mecanismo H2Global y la sostenibilidad del hidrogeno, sin ninguna conexion con `sportcv-ballnet`, por lo que se omiten. Toda la informacion tecnica de esta ficha procede de la model card publicada en HuggingFace por el autor.
