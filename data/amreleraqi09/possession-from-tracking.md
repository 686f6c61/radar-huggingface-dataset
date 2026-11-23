# amreleraqi09/possession-from-tracking

## Resumen

`possession-from-tracking` es un clasificador tabular desarrollado por el usuario de Hugging Face amreleraqi09 que determina, a partir exclusivamente de datos de tracking de un partido de futbol, que equipo posee el balon en cada instante. El modelo combina un booster LightGBM de tres clases (local, visitante, balon muerto) con un pequeno modelo oculto de Markov (HMM) que suaviza las predicciones frame a frame. No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de machine learning clasico orientado a analitica deportiva.

La relevancia del modelo es metodologica mas que de escala. El autor demuestra que un enfoque ligero (78 caracteristicas derivadas de posiciones de jugadores y balon, muestreo a 5 Hz sobre tracking de 25 Hz y post-procesado con HMM) supera ampliamente a una linea base ingenua de "jugador mas cercano al balon": 0,817 de F1 a nivel de posesion frente a 0,100. El modelo se entrena con un solo partido (Metrica Sports sample game 1) y se evalua en otro (game 2), lo que da una idea realista de su capacidad de generalizacion dentro de un mismo proveedor de datos.

El proyecto incluye codigo de entrenamiento y evaluacion en GitHub, un Space de Hugging Face con la repeticion del partido de test y los pesos en formato de texto de LightGBM. La licencia es MIT, lo que permite uso comercial y modificacion sin restricciones practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre arboles de decision) + HMM para suavizado temporal |
| Parametros totales | no disponible (modelo de arboles; el numero de arboles y hojas no se detalla en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo secuencial; usa 78 caracteristicas por frame y un HMM sobre la secuencia de frames) |
| Tipos de cuantizacion | no aplica (no hay pesos en coma flotante cuantizables; el booster se serializa en texto) |
| Idiomas soportados | no disponible (no procesa texto; la salida son tres etiquetas: home, away, dead) |
| Licencia | MIT |
| Formato de pesos | texto plano de LightGBM (`possession_lgbm.txt`) + `config.json` + `metrics.json` |

## Arquitectura y entrenamiento

El modelo es un clasificador de tres clases construido en dos etapas. Primero, un booster LightGBM recibe 78 caracteristicas calculadas por la funcion `compute_features` del repositorio de GitHub a partir de las posiciones de jugadores y balon en cada frame. Las predicciones se generan cada quinto frame de un tracking a 25 Hz, es decir, a 5 Hz. Despues, un modelo oculto de Markov con matriz de transicion, prior de clase y parametro alpha (todos configurables en `config.json`) decodifica la secuencia de probabilidades por clase y produce etiquetas suavizadas que respetan la continuidad temporal de la posesion.

El entrenamiento usa un unico partido: Metrica Sports sample game 1, con tracking anonimizado a 25 Hz y etiquetas derivadas del registro de eventos del partido. Los hiperparametros del suavizado se ajustaron sobre predicciones out-of-fold del mismo partido, y el game 2 se reservo como test. El autor reporta tambien el split inverso (entrenar con game 2 y evaluar con game 1) para comprobar que el resultado no depende de la eleccion del partido de entrenamiento. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo tabular de este tipo.

## Capacidades

- Clasificacion de posesion por frame en tres estados: equipo local, equipo visitante y balon muerto.
- Deteccion de "posesiones" (spells): rachas continuas de un mismo equipo con el balon, evaluadas con F1 a nivel de spell y con criterio de solapamiento IoU >= 0,5.
- Procesamiento de datos de tracking de futbol a 25 Hz, con muestreo configurable (por defecto cada 5 frames).
- Suavizado temporal mediante HMM que reduce falsos positivos y fragmentacion de posesiones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No procesa vision, audio ni texto; su unica entrada son coordenadas de jugadores y balon.

## Casos de uso

- Analisis post-partido de posesion: el modelo genera una linea temporal de posesion a 5 Hz que un analista puede cruzar con eventos (goles, faltas, saques) para estudiar que equipo controlo el balon en cada fase del juego.
- Etiquetado automatico de datos de tracking: sirve para anotar grandes volumenes de tracking con etiquetas de posesion sin intervencion manual, siempre que el proveedor de datos sea compatible con las caracteristicas de Metrica.
- Metricas de rendimiento por jugador: al conocer que equipo tiene el balon en cada frame, se pueden calcular estadisticas de participacion, presion y recuperacion a partir de las posiciones.
- Deteccion de balon muerto: el modelo aprende la senal de "Metrica deja de trackear el balon cuando sale del campo" y la usa para identificar interrupciones, util para segmentar el partido en fases de juego activo.
- Investigacion en analitica deportiva: el pipeline completo (features + LightGBM + HMM) es un ejemplo reproducible y ligero para comparar con enfoques mas pesados basados en redes neuronales.
- Prototipado rapido en clubes o startups: al requerir solo CPU y un booster de texto, se puede desplegar en entornos con recursos limitados para validar ideas antes de invertir en infraestructura de deep learning.
- Repeticion interactiva de partidos: el Space del autor muestra como integrar las predicciones en una visualizacion del partido, patron reutilizable para herramientas de scouting.

## Benchmarks y rendimiento

Resultados reportados en la model card. Entrenamiento con Metrica Sports sample game 1, test con game 2:

| Modelo | Spell F1 | Spells encontrados | Spells predichos | Frame macro-F1 |
|---|---:|---:|---:|---:|
| Este modelo | 0,817 | 257 de 347 | 282 | 0,956 |
| Mismo modelo, sin suavizado | 0,761 | 271 de 347 | 365 | 0,957 |
| Baseline jugador mas cercano | 0,100 | 114 de 347 | 1.933 | 0,849 |

Con el split inverso (entrenar con game 2, test con game 1), el modelo obtiene 0,837 de spell F1 frente a 0,135 del baseline. El criterio de exito de un spell es un IoU >= 0,5 con un spell real del mismo equipo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no aplica. El modelo es un booster LightGBM en texto y un HMM; se ejecuta en CPU.
- GPU recomendadas: no aplica. No requiere GPU para inferencia.
- Cabe en cualquier consumer GPU y en cualquier CPU moderna; el cuello de botella es el calculo de las 78 caracteristicas por frame, no el modelo.
- Opciones de despliegue: el propio repositorio de GitHub con la libreria `possession`; tambien se puede cargar el booster con la API nativa de LightGBM (`Booster(model_file=...)`) y reimplementar el HMM a partir de `config.json`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo y la frecuencia de muestreo (5 Hz), se espera que la inferencia sea muy rapida en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de posesion a partir de tracking en la documentacion proporcionada. La unica comparacion publicada es contra la linea base de jugador mas cercano, incluida en la tabla de benchmarks. Cualquier comparacion con otros pipelines de analitica deportiva requeriria datos que no estan disponibles.

| Modelo | Enfoque | Datos de entrenamiento | Spell F1 (test) | Licencia |
|---|---|---|---:|---|
| possession-from-tracking | LightGBM + HMM | Metrica game 1 | 0,817 | MIT |
| Baseline jugador mas cercano | Regla heuristica | ninguno | 0,100 | no aplica |
| Otros modelos de posesion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado con un unico partido de un unico proveedor (Metrica Sports). Es previsible que necesite reentrenamiento para otros sistemas de tracking con caracteristicas o ruido distintos.
- Metrica deja de trackear el balon cuando sale del campo, y el modelo aprovecha esa senal para detectar balones muertos. En tracking de retransmision esa senal no existe, por lo que el rendimiento en balones muertos puede degradarse.
- Las etiquetas heredan el timing del registro de eventos, que puede estar desviado unos frames respecto al video.
- Riesgo de sobreajuste al partido de entrenamiento: el suavizado se ajusto con predicciones out-of-fold del mismo partido, no de un partido independiente.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso que requiera esas capacidades queda fuera de su alcance.
- Sin datos publicados sobre sesgos, robustez ante tracking ruidoso o comportamiento en condiciones de iluminacion, clima o camaras distintas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la calidad de los datos de Metrica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amreleraqi09/possession-from-tracking
- Codigo, entrenamiento y evaluacion: https://github.com/amr7772/possession-from-tracking
- Space con la repeticion del partido de test: https://huggingface.co/spaces/amreleraqi09/possession-from-tracking
- Datos de Metrica Sports: https://github.com/metrica-sports/sample-data
