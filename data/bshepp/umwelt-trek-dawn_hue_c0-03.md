# bshepp/umwelt-trek-dawn_hue_C0.03

## Resumen

`bshepp/umwelt-trek-dawn_hue_C0.03` es un modelo de clasificacion binaria por minuto publicado por el autor `bshepp` dentro del proyecto de investigacion "Silicon Dreaming", linea "umwelt-trek". No es un modelo de lenguaje: se trata de una regresion logistica con clases balanceadas implementada con scikit-learn, entrenada sobre caracteristicas derivadas de los propios sensores de un portatil (espectros de microfono, recuentos y conjuntos hasheados de dispositivos Bluetooth y WiFi, barridos de radio, calidad de GPS, una caja IMU y una placa de luz). El modelo puntua cada minuto de captura y produce una probabilidad calibrada de que ocurra un determinado episodio de escena.

El paquete publicado es unicamente el "seed packet" del zoo de modelos del proyecto: contiene los coeficientes, la media y desviacion estandar para estandarizar las 384 columnas de entrada, y los parametros de calibracion post-hoc. El dato de entrenamiento y la tabla por minuto son privados y no se publican, por lo que el modelo solo es utilizable junto con el extractor de caracteristicas del proyecto, que no se incluye en el repositorio.

Es relevante como ejemplo de modelado de escena basado en sensado pasivo y receive-only, con evaluacion leave-one-local-day-out sobre 13 dias retenidos y 13.094 minutos puntuados. Su rendimiento en ranking es util (AUC 0,820) pero su calibracion no supera a un predictor constante en log-loss, lo que limita su uso como probabilidad absoluta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con clases balanceadas (scikit-learn) |
| Parametros totales | 384 coeficientes + intercept + media y desviacion por columna + parametro de temperatura |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo por minuto, sin contexto secuencial) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante estandar de scikit-learn) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (serializacion propia de scikit-learn, referenciada como `model.json`) |

## Arquitectura y entrenamiento

El modelo es una regresion logistica lineal sobre 384 columnas estandarizadas. La inferencia se define explicitamente en la model card como `p = sigmoid(((x - mu) / sd) @ coef.T + intercept)`, seguida de un mapeo de calibracion. Las entradas provienen de un extractor de caracteristicas que convierte senales de sensores del portatil en un vector por minuto: espectros de microfono, recuentos y estadisticas de senal de dispositivos Bluetooth y WiFi (con hashes salteados, nunca identificadores), barridos de radio, indicadores de calidad de GPS, datos de una IMU y de una placa de luz. Se excluyeron los prefijos `sys_`, `usb_`, `light_` y `opt_`, y se descartaron las banderas de presencia con dropout 0,0. El hiperparametro de regularizacion es `C = 0.03`.

El entrenamiento se evaluo con validacion leave-one-local-day-out sobre 13 dias retenidos y 13.094 minutos puntuados, con 590 positivos y 10 episodios. La calibracion se aplico a posteriori mediante temperature scaling con `T ≈ 2.0`, ajustado tambien leave-one-day-out sobre las creencias retenidas. El autor advierte que el modelo es un ranker: no supera al predictor constante en log-loss (0,248 frente a 0,184 tras calibracion), por lo que debe usarse el orden de las puntuaciones y no el valor absoluto de las probabilidades.

## Capacidades

- Clasificacion binaria por minuto de escenas a partir de senales de sensores de un portatil.
- Fusion de sensores heterogeneos: audio espectral, Bluetooth, WiFi, radio, GPS, IMU y luz.
- Puntuacion calibrada mediante temperature scaling (`T ≈ 2.0`).
- Ranking de minutos por probabilidad relativa de episodio.
- No soporta generacion de texto, codigo, matematicas, vision ni audio como tarea generativa.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Deteccion pasiva de episodios de escena en un portatil: el modelo puntua cada minuto a partir de espectros de microfono y actividad de radio para identificar periodos con un patron de sensado concreto, usando el ranking de probabilidades en lugar del valor absoluto.
- Analisis de presencia de dispositivos en el entorno: los recuentos y estadisticas de senal de Bluetooth y WiFi, agregados como caracteristicas, permiten ordenar minutos por probabilidad de un episodio asociado a la actividad de dispositivos cercanos, sin almacenar identificadores.
- Investigacion en sensado receive-only: sirve como linea base reproducible para experimentos de fusion de sensores en entornos de escritorio, con evaluacion leave-one-day-out documentada.
- Monitorizacion de calidad de senal y contexto: las caracteristicas de GPS, radio e IMU permiten construir un indicador por minuto del estado del entorno de captura, util para filtrar segmentos en pipelines de datos.
- Prototipado de modelos de escena ligeros: al ser una regresion logistica sobre 384 columnas, se puede ejecutar en CPU y sirve como referencia antes de adoptar modelos mas complejos.
- Estudio de calibracion y ranking: el modelo y sus tablas de calibracion por bin de probabilidad son un caso practico para analizar la diferencia entre poder discriminativo (AUC 0,820) y calibracion absoluta (log-loss peor que el predictor constante).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUC (held-out, 13 dias) | 0,820 |
| Log-loss (held-out) | 0,334 |
| Log-loss del predictor constante | 0,184 |
| Brier (held-out) | 0,0712 |
| Brier del predictor constante | 0,0430 |
| Positivos | 590 |
| Episodios | 10 |
| Minutos puntuados | 13.094 |
| Dias retenidos | 13 |
| Log-loss tras temperature scaling | 0,248 (constante 0,184) |
| Parametro de temperatura | 1,9999999999999998 |

Calibracion por bin de probabilidad:

| Bin de p | n | Fraccion positiva |
|---|---|---|
| 0,0-0,1 | 8627 | 0,01 |
| 0,1-0,2 | 1669 | 0,07 |
| 0,2-0,3 | 851 | 0,06 |
| 0,3-0,4 | 501 | 0,07 |
| 0,4-0,5 | 384 | 0,13 |
| 0,5-0,6 | 328 | 0,15 |
| 0,6-0,7 | 223 | 0,12 |
| 0,7-0,8 | 174 | 0,22 |
| 0,8-0,9 | 109 | 0,31 |
| 0,9-1,0 | 228 | 0,37 |

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo es una regresion logistica sobre 384 columnas y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU de consumo, aunque no es necesario usarla.
- Opciones de despliegue: scikit-learn en Python; serializacion via `model.json` segun la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque por la naturaleza lineal del modelo se espera un coste despreciable por inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de escena por minuto basados en fusion de sensores de portatil) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El modelo no supera al predictor constante en log-loss (0,248 frente a 0,184 tras calibracion); el autor indica explicitamente que debe usarse el ranking y no el valor numerico de la probabilidad.
- La calibracion por bin muestra desviaciones notables: el bin 0,9-1,0 tiene solo un 37 % de positivos, y el bin 0,2-0,3 un 6 %, lo que refleja un desajuste entre probabilidad declarada y frecuencia observada.
- Los datos de entrenamiento, la tabla por minuto y las creencias son privados y no se publican; el modelo solo es utilizable con el extractor de caracteristicas del proyecto, que no se incluye en el repositorio.
- El paquete es un "seed packet" del zoo de modelos; no se documenta el linaje completo ni los padres en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en la clasificacion por minuto, dado el desequilibrio de clases (590 positivos sobre 13.094 minutos).
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; opera sobre ventanas de un minuto sin contexto secuencial explicito.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; no se documentan restricciones adicionales.
- Caveat para produccion: el modelo depende de un extractor de caracteristicas no publicado y de un esquema de columnas concreto (`names` en `model.json`), lo que dificulta su reutilizacion fuera del proyecto original.
- La fecha de creacion indicada (2026-11-06) y la generacion (`2026-11-06T0809Z`) proceden de la model card y no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bshepp/umwelt-trek-dawn_hue_C0.03
- Repositorio del proyecto umwelt-trek: no disponible en la informacion proporcionada
- Paper o blog de Silicon Dreaming: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
