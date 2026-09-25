# dClimate/aifs-single-earthboi

## Resumen

`dClimate/aifs-single-earthboi` es un envoltorio de ejecución (wrapper) publicado por dClimate para el modelo de predicción meteorológica AIFS Single 1.1 de ECMWF, ejecutado sobre la plataforma earthboi. El repositorio no contiene pesos: se limita a un fichero `earthboi.yaml` que declara el repositorio de ECMWF montado en modo lectura en `/weights`, fijado al commit al que apuntaba la rama `main` en el momento de registrar el wrapper, y a un script `predict.py` que orquesta el ciclo completo de inferencia.

El modelo subyacente es un sistema de predicción meteorológica basado en datos, no un modelo de lenguaje: consume 13 niveles de presión, 12 campos de superficie y 4 constantes procedentes de condiciones iniciales ERA5 en T-6h y T0, interpola bilinealmente desde la rejilla regular de 0,25 grados a la rejilla gaussiana reducida N320 del checkpoint, ejecuta la predicción con `anemoi-inference` hasta +168 horas (7 días) e interpola la temperatura a 2 m de vuelta a la rejilla de 0,25 grados para su evaluación contra observaciones de estaciones.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de despliegue de AIFS Single 1.1 en un entorno cerrado (sin acceso a red durante la ejecución) sobre una GPU de 24 GB, y como pieza de comparación entre condiciones iniciales ERA5 y observaciones de superficie. No publica resultados de benchmarks propios ni métricas numéricas de error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en este repositorio. Modelo de prediccion meteorologica basado en datos (checkpoint de AIFS Single 1.1 ejecutado mediante `anemoi-inference`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; horizonte de prediccion de hasta +168 h (7 dias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible; el repositorio no contiene pesos, se montan en `/weights` desde el repositorio de ECMWF |
| Entradas del modelo | 13 niveles de presion, 12 campos de superficie y 4 constantes, en T-6h y T0 |
| Rejilla de entrada | Regular de 0,25 grados, interpolada a la rejilla gaussiana reducida N320 del checkpoint |
| Rejilla de salida | Temperatura a 2 m interpolada de vuelta a la rejilla regular de 0,25 grados |
| Motor de inferencia | `anemoi-inference` sobre runtime `torch` |
| Fecha de publicacion en HuggingFace | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no describe la arquitectura interna de AIFS Single 1.1 ni su proceso de entrenamiento. La model card se limita a indicar que los pesos son los de ECMWF, que la ejecucion se realiza con `anemoi-inference` y que el modelo opera sobre la rejilla gaussiana reducida N320. No hay informacion disponible sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (categorias, por otra parte, propias de modelos de lenguaje y no de un sistema de prediccion meteorologica).

La innovacion tecnica que si documenta el wrapper es de integracion: el script `predict.py` realiza localmente la interpolacion bilineal entre la rejilla regular de 0,25 grados y la rejilla N320 en lugar de delegarla a `earthkit-regrid`, porque esa libreria descarga sus matrices en el primer uso y el entorno de ejecucion opera con la red cerrada. El ciclo completo queda asi: lectura de condiciones iniciales ERA5 en T-6h y T0, interpolacion a la rejilla del checkpoint, prediccion hasta +168 h e interpolacion de la temperatura a 2 m a la rejilla de 0,25 grados para el calculo de puntuaciones frente a observaciones de estaciones.

## Capacidades

- Prediccion meteorologica determinista a medio plazo, con horizonte de hasta +168 horas (7 dias) por ejecucion.
- Procesamiento de condiciones iniciales ERA5 en dos instantes temporales (T-6h y T0), con 13 niveles de presion, 12 campos de superficie y 4 constantes.
- Interpolacion de rejilla integrada: de la rejilla regular de 0,25 grados a la gaussiana reducida N320 y viceversa, sin dependencia de descargas de red.
- Evaluacion de la prediccion de temperatura a 2 m contra observaciones de estaciones meteorologicas.
- Ejecucion en entorno aislado de red, apta para infraestructuras restringidas o air-gapped.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multilingues, de vision, de audio ni de modo de razonamiento (thinking mode).
- No se documenta version de conjunto (ensemble) ni estimacion de incertidumbre: la variante utilizada es la determinista "Single".

## Casos de uso

- Prediccion meteorologica a medio plazo: el modelo genera campos de prediccion hasta +168 h a partir de condiciones iniciales ERA5, util como alternativa basada en datos a los modelos numericos clasicos en tareas de investigacion y evaluacion comparativa.
- Verificacion contra observaciones de superficie: el wrapper interpola la temperatura a 2 m a la rejilla regular de 0,25 grados y la puntua contra estaciones, lo que permite medir el error del modelo en ubicaciones concretas en lugar de solo frente a reanalisis.
- Reproducibilidad de experimentos: al fijar el commit del repositorio de ECMWF y declarar los pesos en `earthboi.yaml` montados en modo lectura, un grupo de investigacion puede replicar exactamente la misma configuracion de inferencia en distintas maquinas.
- Despliegue en infraestructura aislada: el hecho de que el script haga la interpolacion localmente permite ejecutar el ciclo completo en entornos sin salida a internet, algo habitual en organismos meteorologicos y entornos de defensa o energia.
- Prototipado en GPU de gama alta de consumo: al requerir 24 GB de VRAM, el modelo es ejecutable en estaciones de trabajo con GPUs de esa capacidad, lo que abarata la experimentacion frente a clusters dedicados.
- Evaluacion de condiciones iniciales: al permitir inyectar condiciones ERA5 en T-6h y T0, es util para estudiar como varia la calidad de la prediccion segun el origen y la antiguedad de las condiciones iniciales.
- Aplicaciones sectoriales derivadas de la temperatura a 2 m: productos agrometeorologicos, estimacion de demanda energetica o analisis de riesgo por temperaturas extremas, siempre que se acepte un horizonte maximo de 7 dias y una unica variable de salida postprocesada en el wrapper.
- Docencia y formacion: sirve como ejemplo minimo y legible de como envolver un checkpoint de AIFS con `anemoi-inference`, incluida la gestion de rejillas e interpolaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las predicciones se puntuan contra observaciones de estaciones, pero no incluye cifras de error, tablas comparativas ni metricas de ningun tipo.

## Requisitos de hardware

- VRAM: la model card especifica una GPU de 24 GB. No se dispone del numero de parametros del checkpoint, por lo que no es posible estimar el consumo con otras precisiones o cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 24 GB de memoria. En gama profesional, A100 (40/80 GB), H100 o L40S; en gama de consumo, RTX 3090, RTX 3090 Ti o RTX 4090, todas con 24 GB.
- Cabe en GPU de consumo: si, en las variantes de 24 GB citadas. No cabe en GPUs con 8, 12 o 16 GB.
- Opciones de despliegue: runtime `torch` con `anemoi-inference` como motor de inferencia. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Interpolacion de rejillas: resuelta dentro de `predict.py` de forma local, sin depender de `earthkit-regrid` ni de descargas de matrices en tiempo de ejecucion.
- Conectividad: el entorno permanece con la red cerrada durante la ejecucion, lo que condiciona el diseno del pipeline.
- Latencia y throughput: no disponible. No se publican tiempos de ejecucion por prediccion ni predicciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte | Pesos en el repositorio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dClimate/aifs-single-earthboi | no disponible | +168 h | No (se montan desde ECMWF) | CC BY 4.0 | Repositorio de wrapper en HuggingFace |
| ecmwf/aifs-single-1.1 | no disponible | no especificado en la informacion disponible | Si (repositorio original de pesos) | CC BY 4.0 | HuggingFace, referenciado por este wrapper |

No se dispone en la informacion proporcionada de datos sobre otros sistemas comparables (por ejemplo, otros modelos de prediccion meteorologica basados en datos) que permitan una comparacion de parametros, contexto o rendimiento. Cualquier tabla comparativa adicional con esos sistemas quedaria fuera del alcance de los datos verificables aqui.

## Limitaciones y advertencias

- El repositorio no contiene pesos: la ejecucion depende de que el repositorio de ECMWF este disponible y accesible en el momento del montaje en `/weights`.
- El wrapper se fija al commit de `main` en el momento del registro, pero la referencia `main` es movil por naturaleza; conviene verificar la resolucion exacta del commit para garantizar reproducibilidad a largo plazo.
- La evaluacion documentada cubre unicamente la temperatura a 2 m frente a observaciones de estaciones, un alcance muy reducido respecto al conjunto de variables que el modelo produce.
- No se publican metricas de error, intervalos de confianza ni comparaciones con otros sistemas, por lo que no es posible afirmar nada sobre su calidad predictiva relativa.
- La red permanece cerrada durante la ejecucion, lo que impide usar componentes que descarguen recursos en tiempo de inferencia (motivo por el que no se emplea `earthkit-regrid`).
- Al tratarse de la variante determinista, no ofrece estimacion de incertidumbre ni predicciones de conjunto.
- Las condiciones iniciales proceden de ERA5, una reanalisis con latencia de varios dias, lo que limita su uso en prediccion operativa en tiempo casi real.
- Licencia CC BY 4.0: el uso comercial esta permitido siempre que se atribuya a ECMWF y a las fuentes de datos correspondientes. El texto de atribucion debe conservarse tal y como figura en la model card.
- Atribucion adicional requerida: las condiciones iniciales son ERA5, del Copernicus Climate Change Service, distribuidas via ARCO-ERA5.
- No se documentan sesgos especificos del modelo, ni cobertura geografica y temporal del conjunto de estaciones empleado para la puntuacion.
- No hay informacion sobre el numero de parametros ni el consumo de memoria de la red, solo el requisito agregado de 24 GB de VRAM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dClimate/aifs-single-earthboi
- Repositorio original de ECMWF (AIFS Single 1.1, contiene los pesos): https://huggingface.co/ecmwf/aifs-single-1.1
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Componentes mencionados en la model card sin URL proporcionada: `earthboi.yaml`, `predict.py`, plataforma earthboi, motor de inferencia `anemoi-inference`, libreria `earthkit-regrid`, reanalisis ERA5 (Copernicus Climate Change Service) y dataset ARCO-ERA5.
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Las unicas entradas devueltas corresponden a paginas de Spotify y no guardan relacion con el contenido de esta ficha.
