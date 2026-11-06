# bshepp/umwelt-trek-dawn_nolight_C0.03

## Resumen

`bshepp/umwelt-trek-dawn_nolight_C0.03` no es un modelo de lenguaje: es un clasificador binario de regresion logistica (scikit-learn) que forma parte de "umwelt-trek", la linea de investigacion de sensado personal de Silicon Dreaming (Brian Sheppard). El modelo puntua, minuto a minuto, la probabilidad de un episodio de escena a partir de 357 columnas estandarizadas derivadas de los propios sensores de un portatil: espectros de microfono, recuentos y conjuntos con hash de Bluetooth y WiFi, barridos de radiofrecuencia, calidad de GPS, una caja IMU y una placa de luz.

Se trata de una "semilla" del zoo de modelos del proyecto: el paquete exacto con coeficientes, media y desviacion tipica por columna, e intercepto, mas un mapa de calibracion post-hoc (temperature scaling con T = 2,244). La evaluacion es leave-one-local-day-out sobre 13 dias reservados y 13.094 minutos puntuados, con 590 positivos y 10 episodios.

Su relevancia es metodologica mas que de rendimiento: documenta con rigor un pipeline de fusion de sensores con datos privados, ofrece curvas de calibracion explicitas y advierte que el modelo funciona como ranker, no como estimador de probabilidad calibrada. Es util para quien investigue sensado pasivo, modelado de escenas o calibracion en clasificadores desbalanceados, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con balanceo de clases (scikit-learn) |
| Parametros totales | 357 coeficientes + intercepto (358 parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 357 columnas por minuto) |
| Tipos de cuantizacion | no aplica (coeficientes en coma flotante; sin variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | artefacto de scikit-learn (`model.json` con `names`, `mu`, `sd`, `coef`, `intercept`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Modelo lineal: `p = sigmoid(((x - mu) / sd) @ coef.T + intercept)` sobre 357 columnas estandarizadas, seguido de un mapa de calibracion post-hoc. La regularizacion es L2 con `C = 0.03` (equivalente a `alpha ≈ 33,3`), y el entrenamiento aplica balanceo de clases. Se excluyeron los prefijos de columna `sys_`, `usb_`, `hue_`, `light_` y `opt_`, y se descartaron las banderas de presencia (presence dropout 0,0).

La validacion es leave-one-local-day-out sobre 13 dias reservados y 13.094 minutos, con 590 positivos y 10 episodios. La calibracion se ajusto tambien leave-one-day-out sobre las creencias reservadas, con un unico parametro de temperatura. La composicion exacta del dataset, el numero de tokens (no aplica) y el volumen de entrenamiento no se publican: la model card indica explicitamente que los datos de entrenamiento, la tabla por minuto y las creencias son privados. El extractor de caracteristicas que produce las 357 columnas se publicara en el repositorio umwelt-trek, y el paquete solo es utilizable con el.

## Capacidades

- Clasificacion binaria por minuto de un episodio de escena a partir de senales de sensores de un portatil.
- Fusion de sensores heterogeneos: espectros de audio, recuentos y conjuntos con hash de Bluetooth/WiFi, barridos de radio, calidad de GPS, IMU y placa de luz.
- Salida de ranking: proporciona una puntuacion ordenable entre minutos (AUC 0,714 en held-out).
- Calibracion post-hoc opcional mediante temperature scaling (T = 2,244), que baja el log-loss de 0,425 a 0,330.
- Privacidad por diseno: sensado solo de recepcion, dispositivos representados como recuentos, estadisticas de senal y hashes con sal; sin audio, imagenes ni coordenadas almacenadas.
- No soporta generacion de texto, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Investigacion en sensado pasivo: replicar el pipeline de extraccion de caracteristicas y el esquema de validacion leave-one-day-out para estudiar la deriva entre dias en clasificadores de escena.
- Deteccion de contexto en el puesto de trabajo: usar la puntuacion por minuto como senal auxiliar para inferir si el usuario esta en una escena concreta (por ejemplo, presencia de dispositivos y perfiles de radio), siempre con el extractor del proyecto.
- Estudio de calibracion en clases desbalanceadas: emplear el modelo como caso de referencia con curva de fiabilidad publicada (bins de 0,0-0,1 a 0,9-1,0) y comparar tecnicas de calibracion.
- Linea base para modelos de escena mas complejos: al ser una regresion logistica con 358 parametros, sirve como cota inferior frente a modelos no lineales sobre las mismas 357 columnas.
- Analisis de privacidad en sensado: documentar que agregaciones (recuentos, hashes con sal, espectros) preservan utilidad predictiva con AUC 0,714 sin almacenar identificadores.
- Docencia en machine learning aplicado: ejemplo compacto y reproducible de estandarizacion, regularizacion L2, balanceo de clases y validacion temporal por dias.

## Benchmarks y rendimiento

Resultados held-out publicados en la model card (13 dias reservados, 13.094 minutos, 590 positivos, 10 episodios):

| Metrica | Modelo | Predictor constante |
|---|---|---|
| AUC | 0,714 | no aplica |
| Log-loss | 0,472 | 0,184 |
| Brier | 0,0957 | 0,0430 |
| Log-loss tras calibracion (T = 2,244) | 0,330 | 0,184 |

Tabla de calibracion (fraccion de positivos por bin de probabilidad):

| Bin de p | n | Fraccion positiva |
|---|---|---|
| 0,0-0,1 | 6947 | 0,02 |
| 0,1-0,2 | 1760 | 0,03 |
| 0,2-0,3 | 1065 | 0,05 |
| 0,3-0,4 | 962 | 0,06 |
| 0,4-0,5 | 867 | 0,07 |
| 0,5-0,6 | 579 | 0,06 |
| 0,6-0,7 | 323 | 0,12 |
| 0,7-0,8 | 240 | 0,36 |
| 0,8-0,9 | 148 | 0,20 |
| 0,9-1,0 | 203 | 0,16 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una regresion logistica de 358 parametros que cabe en memoria de CPU (unos pocos kilobytes en coma flotante de 64 bits).
- GPU: no necesaria. Cualquier CPU moderna evalua la inferencia en microsegundos por minuto de datos.
- Cabe en cualquier consumer GPU y en cualquier CPU; el cuello de botella es el extractor de caracteristicas de sensores, no el modelo.
- Despliegue: scikit-learn en Python, exportacion a JSON (`model.json`) e implementacion directa de la formula sigmoid en cualquier lenguaje. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados; por la naturaleza lineal del calculo, el coste dominante sera la extraccion de las 357 columnas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos |
|---|---|---|---|---|---|
| umwelt-trek-dawn_nolight_C0.03 | Regresion logistica | 358 | no aplica | CC-BY-4.0 | Privados |
| Modelos de escena alternativos de umwelt-trek | no disponible | no disponible | no disponible | no disponible | Privados |
| Clasificadores tabulares genericos (p. ej. gradient boosting) | Arboles | no disponible | no disponible | variable | no disponible |

No se dispone de informacion sobre otros modelos comparables en la busqueda realizada; las alternativas dentro del propio zoo de umwelt-trek no estan documentadas en los datos proporcionados.

## Limitaciones y advertencias

- El modelo no supera al predictor constante en log-loss (0,330 calibrado frente a 0,184 constante); la model card indica explicitamente que debe usarse como ranker, no como probabilidad calibrada.
- Los datos de entrenamiento son privados y no se publican; sin el extractor de caracteristicas del proyecto, el paquete no es utilizable.
- La validacion es leave-one-day-out sobre 13 dias de una unica fuente de sensado; la generalizacion a otros portatiles, entornos o usuarios no esta demostrada.
- Riesgo de deriva: al depender de perfiles de radio, dispositivos cercanos y condiciones de luz, los cambios en el entorno degradaran las puntuaciones sin reentrenamiento.
- La tabla de calibracion muestra bins altos (0,8-0,9 y 0,9-1,0) con fraccion positiva inferior al bin 0,7-0,8, lo que indica desajuste en la cola alta de probabilidad.
- Sesgos conocidos: no documentados en la informacion disponible; al tratarse de sensado de dispositivos cercanos, podria reflejar sesgos de densidad de dispositivos del entorno de captura.
- Licencia CC-BY-4.0 permite uso comercial con atribucion, pero la ausencia de datos y de extractor limita la reutilizacion practica.
- No apto para produccion como estimador de probabilidad ni para tareas de lenguaje, codigo o vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bshepp/umwelt-trek-dawn_nolight_C0.03
- Perfil del autor en Hugging Face: https://huggingface.co/bshepp
- Datasets del autor: https://huggingface.co/bshepp/datasets
- GitHub personal de Brian Sheppard: https://github.com/bshepp/bshepp
