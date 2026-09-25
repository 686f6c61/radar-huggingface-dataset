# dClimate/aifs-single-2-earthboi

## Resumen

`dClimate/aifs-single-2-earthboi` es un repositorio de despliegue, no un modelo con pesos propios. Se trata de un wrapper que ejecuta el modelo meteorologico AIFS Single 2.0 de ECMWF sobre la plataforma earthboi, partiendo de las condiciones iniciales del sistema IFS y puntuando el resultado contra observaciones de estaciones. El repositorio ocupa 0,0 GB porque no contiene ningun fichero de pesos: el fichero `earthboi.yaml` declara el repositorio de ECMWF, que la plataforma monta en modo solo lectura en `/weights`.

AIFS Single 2.0 es el modelo que respalda las predicciones operativas de AIFS de ECMWF desde el 12 de mayo de 2026. El wrapper reproduce con `predict.py` el mismo flujo que el cuaderno oficial `run_AIFS_v2.0.ipynb` de ECMWF, pero aplicado a las condiciones iniciales de la plataforma en lugar de a datos abiertos. El horizonte de prediccion llega a +168 h.

La relevancia de este repositorio es de tipo practico: empaqueta un modelo meteorologico de produccion para que sea reproducible en un runtime concreto (`torch-2.7`, GPU de 24 GB con pico de ~6 GB), incluye las matrices de interpolacion necesarias para funcionar sin red y documenta la fidelidad del resultado frente a la prediccion operativa de ECMWF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la red; la inferencia se ejecuta con `anemoi-inference`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica; horizonte de prediccion de hasta +168 h |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo meteorologico, no linguistico) |
| Licencia | pesos AIFS Single 2.0: CC BY 4.0 (© ECMWF); codigo del wrapper: Apache 2.0; matrices de interpolacion: Apache 2.0 |
| Formato de pesos | no incluidos en el repositorio; se montan en modo solo lectura desde `ecmwf/aifs-single-2.0` en `/weights` |
| Tamano del repositorio | 0,0 GB |
| Runtime declarado | `torch-2.7` sobre GPU de 24 GB, pico de ~6 GB |
| Grid de salida | N320 para la prediccion; interpolacion de temperatura a 2 m sobre rejilla de 0,25 grados para la puntuacion |
| Entradas requeridas | estados T-6h y T0: 14 niveles de presion de z, t, u, v y q (q desde 100 hPa), 13 campos de superficie y suelo (incluida profundidad de nieve), 11 campos de oleaje oceanico y 4 constantes |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento de AIFS Single 2.0: el repositorio es un wrapper de inferencia y delega los pesos en el repositorio de ECMWF. Lo que si se documenta es el pipeline de ejecucion. `predict.py` lee los estados T-6h y T0 (14 niveles de presion de z, t, u, v y q con q desde 100 hPa, 13 campos de superficie y suelo incluida la profundidad de nieve, 11 campos de oleaje oceanico y 4 constantes), los interpola a la rejilla N320 de AIFS con la misma matriz que usa `earthkit-regrid`, convierte la direccion media del oleaje en su coseno y su seno, y fija la profundidad de nieve y el agua del suelo a NaN sobre el mar usando el fichero `lsm.grib` de ECMWF. A continuacion ejecuta la prediccion con `anemoi-inference` hasta +168 h y vuelve a interpolar la temperatura a 2 m sobre la rejilla de 0,25 grados para poder puntuarla.

La innovacion tecnica destacable de este wrapper es la reproducibilidad en entorno cerrado: la red se mantiene desactivada durante la ejecucion, por lo que las dos matrices de interpolacion se distribuyen dentro de `regrid/`. El script `make_regrid.py` las obtuvo de `earthkit-regrid` 0.5.1 y el fichero `regrid/SHA256SUMS` fija su integridad. El repositorio advierte de una restriccion importante: solo admite condiciones iniciales del IFS. La profundidad de nieve y los campos de oleaje no existen en el fichero ERA5, de modo que una ejecucion desde ERA5 falla con un mensaje explicito. No se documentan en la informacion proporcionada datos sobre volumen de entrenamiento, composicion del dataset ni tecnicas de ajuste como RLHF o DPO.

## Capacidades

- Prediccion meteorologica determinista a medio plazo con horizonte de hasta +168 h.
- Procesamiento de estados atmosfericos en 14 niveles de presion para las variables z, t, u, v y q, con q disponible desde 100 hPa.
- Manejo de 13 campos de superficie y suelo, incluida la profundidad de nieve y el agua del suelo.
- Tratamiento de 11 campos de oleaje oceanico, con conversion de la direccion media del oleaje a coseno y seno.
- Interpolacion de las condiciones iniciales a la rejilla N320 de AIFS mediante las matrices de `earthkit-regrid`.
- Enmascarado de variables terrestres sobre el mar a partir del fichero `lsm.grib`.
- Inferencia ejecutada con `anemoi-inference`, con salida posterior interpolada de temperatura a 2 m sobre rejilla de 0,25 grados.
- Funcionamiento con la red desactivada y matrices de interpolacion embebidas con suma de comprobacion SHA256.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni soporte multilingue, que no aplican a este tipo de modelo.

## Casos de uso

- Evaluacion de modelos de prediccion meteorologica: el wrapper ejecuta AIFS Single 2.0 desde condiciones iniciales del IFS y permite comparar la salida con la prediccion operativa de ECMWF en cada plazo hasta +168 h, como hace el propio autor con la inicializacion del 14 de septiembre de 2026 a las 00Z.
- Verificacion contra observaciones de estaciones: el pipeline interpola la temperatura a 2 m a la rejilla de 0,25 grados especificamente para poder puntuar el resultado, lo que permite calcular RMSE contra observaciones METAR u otras redes de estaciones.
- Despliegue en plataformas de inferencia cerradas: al incluir las matrices de interpolacion y fijarlas con SHA256, el repositorio es adecuado para entornos sin salida a red durante la ejecucion.
- Reproducibilidad de resultados operativos: un equipo puede replicar localmente una prediccion concreta de AIFS Single 2.0 y confirmar que la desviacion respecto a la salida de ECMWF se mantiene en el rango documentado de 0,18-0,24 K RMS para temperatura a 2 m.
- Prototipado sobre GPU de gama alta de consumo: con un pico de ~6 GB, el flujo es viable en tarjetas de 24 GB y potencialmente en otras con menos memoria, lo que facilita experimentar con predicciones a 168 h sin infraestructura de centro de datos.
- Benchmarking de plataformas de inferencia: sirve como caso de prueba reproducible para medir tiempos de ejecucion y consumo de memoria de `anemoi-inference` sobre un modelo meteorologico de produccion.
- Docencia y formacion en prediccion numerica: el repositorio expone de forma explicita el preprocesado de condiciones iniciales, el enmascarado sobre mar y la interpolacion de salida, lo que lo hace util para ilustrar el flujo completo de un sistema de prediccion por IA.

## Benchmarks y rendimiento

| Prueba | Resultado del wrapper | Referencia de ECMWF |
|---|---|---|
| Temperatura a 2 m, RMS frente a la prediccion operativa (inicializacion 2026-09-14T00Z, plazos hasta +168 h) | 0,18-0,24 K | prediccion operativa |
| Geopotencial a 500 hPa a +168 h | dentro de 3,6 m | prediccion operativa |
| RMSE de temperatura a 2 m en 8 estaciones METAR de EE. UU. | 1,68 °C | 1,66 °C |
| Consumo de memoria en inferencia | pico de ~6 GB | no disponible |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo meteorologico.

## Requisitos de hardware

- VRAM: el autor indica un pico de aproximadamente 6 GB durante la ejecucion.
- GPU: el runtime de referencia es `torch-2.7` sobre una GPU de 24 GB. No se documentan requisitos minimos ni modelos de GPU concretos compatibles.
- GPU de consumo: dado el pico de ~6 GB, el flujo cabe en tarjetas de consumo con 8-12 GB o mas, aunque el repositorio no certifica ninguna configuracion distinta de la de 24 GB.
- Despliegue: la ejecucion se realiza con `anemoi-inference` dentro de la plataforma earthboi. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Dependencias de entorno: `torch-2.7`, las matrices de interpolacion de `regrid/` y condiciones iniciales del IFS. No se admiten condiciones iniciales de ERA5.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Condiciones iniciales | Horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dClimate/aifs-single-2-earthboi` | wrapper de despliegue de AIFS Single 2.0 | IFS unicamente | +168 h | codigo Apache 2.0; pesos CC BY 4.0 | repositorio sin pesos, monta `ecmwf/aifs-single-2.0` en `/weights` |
| `ecmwf/aifs-single-2.0` | modelo original de ECMWF | datos abiertos segun el cuaderno `run_AIFS_v2.0.ipynb` | +168 h | CC BY 4.0 (© ECMWF) | repositorio de ECMWF |
| Otros modelos de prediccion meteorologica por IA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos suficientes para comparar con alternativas adicionales de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0,0 GB). Es un wrapper que depende de que la plataforma monte `ecmwf/aifs-single-2.0` en `/weights` en modo solo lectura y fijado al commit `main` del momento del registro.
- Solo acepta condiciones iniciales del IFS. La profundidad de nieve y los campos de oleaje no estan en ERA5, por lo que una ejecucion desde ERA5 falla con un mensaje de error explicito.
- La red se desactiva durante la ejecucion. Si las matrices de `regrid/` no estan presentes o no coinciden con `regrid/SHA256SUMS`, el flujo no puede completarse.
- Es un modelo determinista de un unico miembro, no un ensemble, por lo que no ofrece dispersion ni probabilidad en la salida.
- La comparacion con la prediccion operativa de ECMWF se documenta solo para una inicializacion concreta (2026-09-14T00Z) y para 8 estaciones METAR de EE. UU.; no hay garantia de que la desviacion se mantenga en otros periodos, regiones o variables.
- La puntuacion documentada se centra en temperatura a 2 m y geopotencial a 500 hPa; no se aportan metricas para el resto de variables ni para los campos de oleaje.
- No se documentan sesgos conocidos, comportamiento multilingue ni riesgos de alucinacion, que no aplican a un modelo meteorologico.
- Licencia: los pesos AIFS Single 2.0 estan bajo CC BY 4.0 y exigen atribucion a ECMWF. El codigo del wrapper es Apache 2.0 y las matrices de interpolacion provienen de `earthkit-regrid`, tambien Apache 2.0.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- No se documentan requisitos minimos de hardware distintos del runtime de referencia de 24 GB.

## Enlaces

- Repositorio del wrapper: https://huggingface.co/dClimate/aifs-single-2-earthboi
- Modelo original de ECMWF: https://huggingface.co/ecmwf/aifs-single-2.0
- Cuaderno oficial de ejecucion: https://huggingface.co/ecmwf/aifs-single-2.0/blob/main/run_AIFS_v2.0.ipynb
- `earthkit-regrid`: https://github.com/ecmwf/earthkit-regrid
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
