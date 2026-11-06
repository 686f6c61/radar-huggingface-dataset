# bshepp/umwelt-trek-waterfall_np_C0.1

## Resumen

`umwelt-trek-waterfall_np_C0.1` es un modelo de clasificación binaria por minuto desarrollado por Brian Sheppard (bshepp) dentro del proyecto de investigación **Silicon Dreaming / umwelt-trek**. No es un modelo de lenguaje ni una red neuronal profunda: es una regresión logística con balanceo de clases implementada con scikit-learn, entrenada sobre características derivadas de los sensores de un portátil (espectros de micrófono, recuentos y conjuntos hasheados de Bluetooth y WiFi, barridos de radio, calidad de GPS, una caja IMU y un sensor de luz). Su función es estimar la probabilidad de que ocurra un evento de escena concreto —la línea `waterfall_np`— en una ventana temporal de un minuto.

El interés del modelo es metodológico y de privacidad: demuestra un flujo completo de fusión de sensores ("sensor fusion") con evaluación leave-one-local-day-out, calibración post-hoc mediante escalado de Platt y un tratamiento de datos estrictamente receive-only, donde los dispositivos Bluetooth y WiFi solo aparecen como recuentos, estadísticas de señal y hashes con sal, nunca como identificadores. La entrada consta de 444 columnas estandarizadas y el modelo se distribuye como "seed packet" del zoo de proyectos del autor.

Es relevante ahora por su enfoque de "scene model" reproducible y por su honestidad documental: la model card publica tanto las métricas de ranking como las de calibración, advirtiendo explícitamente de que el calibrador no supera al predictor constante. La limitación principal es operativa: los pesos solo son utilizables junto con el extractor de características del proyecto, que aún no se ha publicado, y los datos de entrenamiento son privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con balanceo de clases (scikit-learn) sobre 444 caracteristicas estandarizadas |
| Parametros totales | 444 coeficientes mas intercept (no disponible el recuento exacto en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de un minuto por inferencia |
| Tipos de cuantizacion | no disponible (pesos de precision estandar de scikit-learn) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | artefacto scikit-learn (`model.json` con nombres de columnas, coeficientes e intercept) |
| Entradas | 444 columnas estandarizadas (`names` en model.json) |
| Prefijos excluidos | `sys_`, `usb_`; grupos descartados: ninguno |
| Flags de presencia | descartados; dropout de presencia 0.5 |
| Regularizacion | C = 0.1 |
| Minutos evaluados | 1870 |
| Dias reservados (held-out) | 18 |
| Generacion | 2026-11-06T0815Z |

## Arquitectura y entrenamiento

El modelo es una regresion logistica lineal sobre un vector de 444 caracteristicas estandarizadas, entrenada con scikit-learn y con ponderacion de clases para compensar el fuerte desbalance (solo 31 positivos y 8 episodios en el conjunto de evaluacion). La inferencia se define de forma explicita en la model card: `p = sigmoid(((x - mu) / sd) @ coef.T + intercept)`, seguida de un mapa de calibracion. Las caracteristicas provienen de la fusion de sensores de un portatil: espectros de microfono, recuentos y conjuntos hasheados de dispositivos Bluetooth y WiFi, barridos de radio, indicadores de calidad de GPS, una caja IMU y un sensor de luz. Se excluyeron los prefijos `sys_` y `usb_`, se descartaron las flags de presencia y se aplico un dropout de presencia de 0.5.

La evaluacion se realizo leave-one-local-day-out sobre 18 dias reservados, lo que mide la capacidad de generalizacion a dias no vistos en el mismo entorno local. Sobre las creencias held-out se ajusto un escalado de Platt post-hoc con parametros `a = 0.3909933723518483` y `b = -1.8998307032615567`, tambien con validacion leave-one-day-out. La innovacion tecnica destacable no esta en la arquitectura, sino en el protocolo: separacion estricta por dias, calibracion honesta con advertencia de que el ranker no supera al predictor constante y anonimizacion por diseno (hashes con sal, sin audio ni imagenes almacenadas, solo espectros y resumenes de color).

## Capacidades

- Clasificacion binaria por minuto: estima la probabilidad de la escena `waterfall_np` a partir de senales de sensores.
- Fusion de sensores heterogeneos: integra espectros de audio, recuentos y estadisticas de senal de Bluetooth y WiFi, barridos de radio, calidad de GPS, IMU y luz ambiental.
- Ranking de minutos por probabilidad: util para priorizar ventanas temporales candidatas aunque la calibracion absoluta sea debil.
- Calibracion post-hoc: mapa de Platt ajustado leave-one-day-out para transformar las probabilidades crudas.
- Privacidad por diseno: los dispositivos solo entran como recuentos, estadisticas y hashes con sal; no se almacenan identificadores, audio, imagenes ni coordenadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio en sentido generativo.
- Capacidades multilingues: no aplica.

## Casos de uso

- Deteccion de eventos de escena en investigacion de sensing: usar el modelo para puntuar cada minuto de una grabacion de sensores y localizar ventanas candidatas a la escena `waterfall_np`, apoyandose en el ranking aunque la probabilidad absoluta no sea fiable.
- Priorizacion de revision manual: al ordenar minutos por probabilidad, un analista puede revisar primero las ventanas con mayor puntuacion y reducir el volumen de inspeccion, dado el bajo numero de positivos reales (31 sobre 1870 minutos).
- Estudio de fusion de sensores: servir de linea base lineal para comparar contra modelos mas complejos (arboles, redes neuronales) sobre el mismo conjunto de 444 caracteristicas y el mismo protocolo leave-one-local-day-out.
- Analisis de privacidad en sensing: el diseno receive-only con hashes con sal y sin almacenamiento de audio ni coordenadas sirve como referencia para proyectos que necesiten recolectar senales manteniendo anonimato.
- Reproduccion metodologica: el paquete incluye generacion, hiperparametros (C = 0.1, dropout de presencia 0.5) y parametros de calibracion, lo que permite replicar el pipeline cuando se publique el extractor de caracteristicas.
- Monitorizacion de contexto ambiental en prototipos: integrar la puntuacion por minuto en un sistema de registro que marque periodos de interes a partir de senales pasivas del portatil, sin enviar datos identificables a un servidor.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia (predictor constante) |
|---|---|---|
| AUC | 0.831 | no disponible |
| Log-loss (crudo) | 0.179 | 0.084 |
| Log-loss (tras calibracion de Platt) | 0.113 | 0.084 |
| Brier | 0.0417 | 0.0163 |
| Positivos en held-out | 31 | no disponible |
| Episodios en held-out | 8 | no disponible |
| Minutos evaluados | 1870 | no disponible |
| Dias reservados | 18 | no disponible |

Distribucion de calibracion por bin de probabilidad:

| Bin de p | n | Fraccion positiva |
|---|---|---|
| 0.0-0.1 | 1733 | 0.01 |
| 0.1-0.2 | 54 | 0.02 |
| 0.2-0.3 | 22 | 0.04 |
| 0.3-0.4 | 12 | 0.00 |
| 0.4-0.5 | 13 | 0.15 |
| 0.5-0.6 | 4 | 0.75 |
| 0.6-0.7 | 5 | 0.40 |
| 0.7-0.8 | 6 | 0.17 |
| 0.8-0.9 | 11 | 0.64 |
| 0.9-1.0 | 10 | 0.20 |

La model card advierte explicitamente de que, como ranker, el modelo no supera al predictor constante y que debe usarse el ranking, no el numero. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es una regresion logistica de 444 coeficientes y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portatiles, Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: scikit-learn en Python, exportacion a ONNX o a un evaluador lineal propio; no aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza lineal del calculo, la inferencia por minuto es de coste despreciable frente a la extraccion de caracteristicas.
- Dependencia critica: requiere el extractor de caracteristicas del proyecto umwelt-trek, aun no publicado, para generar las 444 columnas de entrada con los nombres, unidades y estandarizacion correctos.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umwelt-trek-waterfall_np_C0.1 | Regresion logistica (sklearn) | 444 caracteristicas de sensores | Ventana de 1 minuto | CC-BY-4.0 | Pesos publicos; extractor pendiente |
| Otras lineas del zoo umwelt-trek | Regresion logistica (sklearn) | no disponible | Ventana de 1 minuto | no disponible | no disponible |
| Predictor constante (baseline) | Baseline trivial | ninguna | no aplica | no aplica | no aplica |

No se dispone de informacion sobre modelos comparables de otros autores en la busqueda realizada. La comparativa mas directa es contra el predictor constante incluido en la propia model card, que supera al modelo en log-loss y Brier calibrados.

## Limitaciones y advertencias

- El calibrador de Platt no supera al predictor constante en log-loss (0.113 frente a 0.084) ni en Brier (0.0417 frente a 0.0163); las probabilidades absolutas no deben interpretarse como frecuencias fiables.
- El conjunto de evaluacion es muy pequeno en positivos (31) y episodios (8), lo que implica alta varianza en las metricas y poca robustez de las estimaciones.
- El modelo solo es utilizable con el extractor de caracteristicas del proyecto, que aun no se ha publicado; sin el, los coeficientes no son aplicables a datos nuevos.
- Los datos de entrenamiento, la tabla por minuto y las creencias son privados y no se publican, lo que impide una reproduccion completa.
- El modelo esta ajustado a un entorno local concreto (los dias reservados son del mismo entorno); no hay evidencia de generalizacion a otros lugares, portatiles o configuraciones de sensores.
- Riesgo de sesgo por desbalance extremo de clases y por la composicion particular de los 18 dias evaluados; el rendimiento puede degradarse en condiciones distintas.
- No procesa texto ni imagenes y no tiene capacidades generativas, de razonamiento o multilingues.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero conviene verificar las condiciones del proyecto Silicon Dreaming y citar correctamente la fuente.
- La fecha de creacion indicada (2026-11-06) es futura respecto a la mayoria de referencias habituales; conviene confirmar la vigencia del artefacto antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bshepp/umwelt-trek-waterfall_np_C0.1
- Perfil del autor en Hugging Face: https://huggingface.co/bshepp
- Perfil del autor en GitHub: https://github.com/bshepp/bshepp
- Repositorio del proyecto umwelt-trek: no disponible en la informacion proporcionada
- Paper o blog del proyecto Silicon Dreaming: no disponible en la informacion proporcionada
