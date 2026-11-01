# jimchen2/jimchen2-pendulum-111

## Resumen

`jimchen2/jimchen2-pendulum-111` no es un modelo de lenguaje, sino un conjunto de datos multimodal orientado al entrenamiento y evaluacion de modelos del mundo (world models) con razonamiento causal. Lo publica el usuario `jimchen2` en Hugging Face bajo licencia MIT y esta compuesto por 3.000 videos MP4 silenciosos de un pendulo fisico no lineal (160 fotogramas a 12 fps, 196x196 px), etiquetas CSV alineadas por fotograma y aproximadamente 24.000 preguntas al estilo CLEVRER (descriptivas, explicativas, predictivas y contrafactuales) cuyas respuestas se derivan de la simulacion con verdad de referencia.

El conjunto extiende el anterior `jimchen2/pendulum-cjepa-160f` (300 videos) multiplicando por diez el volumen y, sobre todo, sustituyendo la validacion por semilla por una validacion fuera de distribucion (OOD) fisica: cada video de validacion rompe al menos una suposicion del entrenamiento (amortiguamiento extremo, gravedad planetaria, ley de rozamiento cuadratico, forzamiento periodico, etc.). Esto lo hace relevante para medir si un modelo aprende la dinamica causal subyacente o simplemente memoriza la distribucion de entrenamiento.

Por su naturaleza, la ficha describe un dataset para `video-classification` y respuesta a preguntas de opcion multiple, no un modelo generativo con pesos publicados. Todas las especificaciones de arquitectura, parametros y cuantizacion se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de 160 fotogramas = 13,33 s por video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (preguntas en ingles segun la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible; datos en MP4 (H.264), CSV y JSON |

## Arquitectura y entrenamiento

El artefacto es un dataset sintetico generado con un simulador de pendulo fisico no lineal (`theta'' = -(g/L)·sin(theta) - ...`) y un renderizador propio incluido en `scripts/pendulum_gen.py`. Cada video consta de 160 fotogramas a 12 fps (196x196 px, H.264, sin audio) y va acompanado de un CSV alineado por fotograma (`frame=n` corresponde a `time_s = n/12`). El split de entrenamiento contiene 2.400 videos en distribucion, mientras que el de validacion contiene 600 videos repartidos en seis regimenes OOD de 100 videos cada uno: `val_high_damp` (gamma en 0,55-0,90 s^-1), `val_low_damp` (casi conservativo), `val_large_angle` (theta inicial de 45-80 grados), `val_gravity` (gravedad de la Luna, Marte o Jupiter), `val_quad_damping` (rozamiento cuadratico, ley de fuerza nueva) y `val_driven` (par periodico con posibles resonancias).

Las preguntas se generan con `scripts/questions.py` siguiendo la taxonomia CLEVRER: descriptivas (respuesta libre o de tres plantillas de opcion multiple), explicativas (4 opciones), predictivas (4 opciones, calculadas sobre una continuacion oculta de 28 segundos de la simulacion) y contrafactuales (4 opciones, con intervenciones como duplicar la gravedad, la longitud de la varilla o la masa del pendulo). Cada pregunta lleva una etiqueta `concept` (por ejemplo, `damping envelope`, `interventional invariance`, `g dependence of period`) que permite puntuar la precision por concepto causal y por regimen OOD. El muestreo por rechazo garantiza que todos los fotogramas queden dentro de la escena y con |theta| <= 85 grados.

## Capacidades

- Entrenamiento de modelos del mundo fisicos: pares video-etiqueta con parametros fisicos conocidos para aprendizaje auto-supervisado o supervisado.
- Evaluacion de razonamiento causal: regimenes OOD disenados para castigar la memorizacion de la distribucion de entrenamiento.
- Video-classification y VQA de opcion multiple: ~24.000 preguntas con respuestas derivadas de la simulacion, no heuristicas.
- Razonamiento contrafactual: intervenciones sobre amortiguamiento, gravedad, longitud, masa, iluminacion y forzamiento.
- Razonamiento predictivo con verdad de referencia: respuestas calculadas sobre 28 s de continuacion oculta mas alla de los 13,33 s visibles.
- Analisis de invarianzas: la iluminacion se modela como factor de confusion independiente, lo que permite testear si el modelo la ignora.
- Etiquetado por concepto causal: permite desglosar metricas por fenomeno fisico.
- No incluye capacidades de generacion de texto, codigo, vision general, audio ni tool calling, al no ser un modelo.

## Casos de uso

- Evaluacion de world models fisicos: usar el split de validacion OOD para medir la brecha entre rendimiento en distribucion y generalizacion a fisicas no vistas, con metricas desglosadas por regimen.
- Investigacion en razonamiento causal: entrenar o evaluar modelos que deban distinguir correlacion de causalidad usando las preguntas contrafactuales y las etiquetas `concept`.
- Benchmark de VQA sobre video: aprovechar las ~24.000 preguntas de opcion multiple para comparar arquitecturas de video-LLM en tareas descriptivas, explicativas y predictivas.
- Aprendizaje de dinamica latente (estilo JEPA): el nombre `cjepa` y el script `prepare_cjepa_root.sh` sugieren su uso para extraer representaciones con `extract_four.py` en pipelines de world models.
- Deteccion de atajos (shortcut learning): los regimenes `val_driven` y `val_quad_damping` introducen leyes de fuerza nuevas que revelan modelos que solo interpolan.
- Estudio de robustez a factores de confusion: la iluminacion independiente permite comprobar si un modelo atribuye erroneamente cambios de movimiento a cambios de luz.
- Docencia y prototipado: dataset pequeno (1K-10K elementos) y con scripts de generacion, verificacion y auditoria incluidos, util para cursos de fisica computacional o vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de un modelo: el dataset ocupa la categoria de tamano 1K-10K elementos, con 3.000 videos de 160 fotogramas a 196x196 px, por lo que el almacenamiento es moderado (del orden de gigabytes, no disponible la cifra exacta).
- Para entrenar sobre el dataset se requiere una GPU con memoria suficiente para el modelo que se entrene, no para el dataset en si; no disponible.
- El renderizado y la generacion de preguntas se ejecutan en CPU con los scripts incluidos (`run_generate.py` es paralelo y reanudable).
- Opciones de despliegue del dataset: descarga directa desde el Hub, `datasets` de Hugging Face o acceso a los MP4/CSV/JSON mediante cualquier cliente HTTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Dataset | Videos | Preguntas | Validacion OOD | Licencia |
|---|---|---|---|---|
| `jimchen2/jimchen2-pendulum-111` | 3.000 | ~24.000 | Si, 6 regimenes fisicos | MIT |
| `jimchen2/pendulum-cjepa-160f` | 300 | no disponible | No (split por semilla) | no disponible |
| CLEVRER (referencia de taxonomia) | no disponible | no disponible | No disponible en la informacion | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto, codigo ni respuestas; es un dataset para entrenar y evaluar otros modelos.
- Dominio muy restringido: un unico sistema fisico (pendulo no lineal) con un renderizador sintetico; la transferencia a escenas reales no esta validada.
- Idiomas: la model card no declara idiomas soportados; las preguntas estan redactadas en ingles.
- Riesgo de sobreajuste al simulador: los modelos pueden explotar artefactos del renderizador en lugar de aprender fisica.
- El split de validacion OOD es exigente por diseno; un rendimiento bajo alli no implica necesariamente un modelo defectuoso, sino falta de generalizacion causal.
- Licencia MIT permite uso comercial, pero conviene citar la fuente y verificar los terminos de los scripts y del renderizador incluidos.
- Fecha de creacion registrada como 2026-10-29, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia de los artefactos antes de usarlos en produccion.
- Sin descargas ni likes registrados en el momento de la consulta: no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/jimchen2/jimchen2-pendulum-111
- Dataset base extendido: https://huggingface.co/datasets/jimchen2/pendulum-cjepa-160f
