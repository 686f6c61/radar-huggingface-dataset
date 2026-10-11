# ludolua/nextaction-pacman

## Resumen

nextaction-pacman es un clasificador de texto de tamano minimo (48 kB) publicado por ludolua (Luiz Araujo) que predice el siguiente movimiento de Pac-Man en un laberinto de rejilla. Dado un estado del juego descrito en texto libre en ingles, devuelve una de cuatro acciones posibles (`down`, `left`, `right`, `up`) junto con una probabilidad por clase. No es un modelo de lenguaje: se trata de un pipeline de scikit-learn compuesto por vectorizacion TF-IDF sobre unigramas y bigramas de palabras, seguido de una regresion logistica multinomial entrenada con el solver L-BFGS.

Su interes practico no esta en el rendimiento bruto del juego, sino en que sirve como ejemplo reproducible de aprendizaje por imitacion con politica de decision explicita. El modelo se distribuye acompanado de un fichero `config.toml` que define reglas para bloquear accionesimposibles, umbrales minimos de confianza por accion, niveles de riesgo y costes de error medidos en unidades de revision humana. Esto permite construir un agente que actua de forma autonoma cuando su confianza es alta y delega en una persona cuando no lo es: en la demo, con umbral 0.6, deriva al experto el 3,3 % de los movimientos.

El modelo se entreno sobre 50.775 movimientos de un experto basado en reglas y se evalua sobre un split de test separado de 12.734 ejemplos, con una exactitud declarada de 0,973 y un F1 macro de 0,974. Su relevancia actual es la de un artefacto pedagogico y de investigacion sobre politicas de decision y escalado a revision humana, no la de un componente listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (unigramas y bigramas, `min_df=2`) + regresion logistica multinomial (scikit-learn) |
| Parametros totales | no disponible (no se declara el numero de coeficientes del modelo lineal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se declara limite explicito; la entrada es una descripcion corta de estado) |
| Tipos de cuantizacion | no aplica (modelo lineal de scikit-learn; no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | skops (`model.skops`), serializado con la libreria `skops` |
| Tamano del repositorio | 0,0 GB (tamano del modelo declarado: 48 kB) |
| Pipeline de HuggingFace | text-classification |
| Etiquetas de salida | `down`, `left`, `right`, `up` |
| Libreria | sklearn |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no es una red neuronal. La entrada es una descripcion textual del estado en formato de etiquetas en ingles, por ejemplo `[blocked up down] [danger none] [features wall_up wall_down food_left_0 ghost_left_close food_right_0 ghost_right_close closest_food_left safest_left threat_mid power_no]`. Esa cadena se normaliza al formato de etiquetas y se vectoriza con TF-IDF sobre unigramas y bigramas de palabras, con eliminacion de acentos. Sobre esa representacion se ajusta una regresion logistica multinomial que produce una distribucion de probabilidad sobre las cuatro acciones.

Los hiperparametros declarados son `ngram_range=(1, 2)`, `min_df=2`, `C=1.0`, `class_weight=None`, `max_iter=1000` y sin calibracion posterior. El solver es L-BFGS, ejecutado en bloques con warm start para poder informar del progreso del entrenamiento. Los hiperparametros residen en `config.toml` y pueden explorarse con el comando `nextaction tune`. El entrenamiento usa 50.775 movimientos de un experto basado en reglas, generados con `demos/pacman/generate_data.py`; los datos de entrenamiento no se redistribuyen en el repositorio y deben descargarse de la fuente original. No se declara uso de RLHF, DPO ni ninguna etapa de ajuste por preferencias.

La innovacion destacable no esta en el clasificador, sino en la capa de politica que lo acompana: mascaras de accion basadas en el estado, umbral de confianza por accion y fallback al experto. El error de calibracion esperado declarado es de 0,029.

## Capacidades

- Clasificacion de accion siguiente en un vocabulario cerrado de cuatro movimientos de Pac-Man, con probabilidad por clase.
- Produccion de puntuaciones de confianza utilizables para enrutado: la exactitud sobre decisiones automatizadas sube del 97,3 % (umbral 0,3) al 99,7 % (umbral 0,9), a costa de reducir la cobertura.
- Integracion con una politica de decision declarativa (`config.toml`) que bloquea acciones imposibles segun el estado.
- Escalado a revision humana: el modelo puede derivar la decision a una persona cuando la confianza cae por debajo del umbral configurado.
- Inferencia sobre descripciones de estado en texto libre en ingles, sin necesidad de features numericas precalculadas si se usa `features.describe()` para construir el estado.
- Serializacion segura mediante `skops` (no se cargan tipos fuera de la lista de confianza de la libreria).
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni razonamiento generativo: es un clasificador discriminativo de proposito unico.

## Casos de uso

- Agente de juego para la demo de Pac-Man: el modelo elige el siguiente movimiento dado el estado actual del laberinto, con la politica de decision bloqueando direcciones inviables. Es el uso directo documentado por el autor.
- Aprendizaje por imitacion como material didactico: sirve para ilustrar un pipeline completo de comportamiento clonado (generacion de datos con un experto, vectorizacion, clasificador, evaluacion en split separado) con un coste computacional minimo.
- Investigacion sobre decision con intervencion humana: los umbrales documentados (0,3 a 0,9) permiten estudiar el compromiso entre cobertura de automatizacion y exactitud sobre las decisiones automatizadas, con costes de error expresados en unidades de revision humana.
- Calibracion de politicas de decision: el comando `nextaction calibrate-policy` reajusta los umbrales a partir de los costes definidos, lo que lo convierte en un banco de pruebas para metodos de calibracion sobre clasificadores pequenos.
- Pruebas de regresion de entornos de juego: al predecir movimientos coherentes con un experto basado en reglas, puede usarse para detectar cambios de comportamiento en un simulador cuando se modifica la logica del entorno.
- Inferencia en entornos con recursos minimos: con 48 kB de pesos y dependencias limitadas a `scikit-learn`, `skops` y `huggingface_hub`, es desplegable en CPU, contenedores ligeros o hardware embebido donde no cabe un modelo neuronal.
- Tarea de referencia para comparaciones de escalado: al tener un baseline trivial documentado (elegir siempre la accion mas frecuente da 0,251), sirve como punto de control en estudios sobre tecnicas de decision con abstención.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. Metodo: split de test separado (`pacman_test.csv`), 12.734 ejemplos evaluados.

| Metrica | Valor |
|---|---|
| Accuracy | 0,973 |
| F1 macro | 0,974 |
| Error de calibracion esperado (ECE) | 0,029 |
| Baseline: accion mas frecuente | 0,251 |

Desglose por clase:

| Accion | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| `down` | 0,969 | 0,979 | 0,974 | 3138 |
| `left` | 0,972 | 0,971 | 0,972 | 3211 |
| `right` | 0,974 | 0,963 | 0,969 | 3193 |
| `up` | 0,978 | 0,980 | 0,979 | 3192 |

Umbrales de revision humana y cobertura resultante:

| Umbral | Decisiones automatizadas | Exactitud sobre automatizadas |
|---|---|---|
| 0,3 | 100,0 % | 97,3 % |
| 0,4 | 99,9 % | 97,4 % |
| 0,5 | 99,1 % | 97,7 % |
| 0,6 | 97,6 % | 98,3 % |
| 0,7 | 95,3 % | 99,0 % |
| 0,8 | 92,2 % | 99,4 % |
| 0,9 | 84,5 % | 99,7 % |

Resultado en partidas completas (declarado en la model card, sin intervalos publicados en detalle): sobre mas de 300 partidas no vistas, el modelo gana el 39 % frente al 35 % del experto, con intervalos de confianza del 95 % solapados, y deriva al experto el 3,3 % de los movimientos cuando su confianza es inferior a 0,6. Segun el autor, enviar mas movimientos al experto no aumenta las victorias porque el experto no es mas fuerte que el modelo que entreno. No hay datos de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El modelo es un pipeline de scikit-learn de 48 kB que se ejecuta en CPU; no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; no se declaran requisitos de aceleracion.
- Compatibilidad con GPU de consumo: irrelevante para este modelo, ya que no usa CUDA ni backends de aceleracion.
- Opciones de despliegue: carga directa en Python con `skops.io.load` y `scikit-learn`; el repositorio NextAction incluye CLI, API REST, registro de decisiones, evaluacion y politica de decision.
- Dependencias: `scikit-learn` (version compatible con la usada en el entrenamiento), `skops` y `huggingface_hub`.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de peticiones por segundo.
- Almacenamiento: inferior a 1 MB, con repositorio declarado de 0,0 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros clasificadores comparables de prediccion de accion siguiente ni resultados de modelos alternativos sobre el mismo dataset. La unica referencia cuantitativa disponible es el baseline trivial del propio autor (elegir siempre la accion mas frecuente obtendria 0,251 de exactitud frente al 0,973 del modelo). Tampoco se ofrece comparacion contra el experto basado en reglas a nivel de movimiento, solo a nivel de partidas completas (39 % de victorias del modelo frente al 35 % del experto, con intervalos del 95 % solapados).

## Limitaciones y advertencias

- Alcance restringido: el modelo solo predice movimientos para el laberinto y las reglas concretas del entorno de Pac-Man con el que se genero la demo. No funciona en otros laberintos ni con otras reglas sin reentrenamiento.
- Hereda los errores del experto: imita a un experto codicioso basado en reglas, por lo que reproduce sus fallos. El propio autor indica que el experto no es mas fuerte que el modelo que entreno.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta herramientas ni agentes multi-paso, y no debe presentarse como tal.
- Formato de entrada rigido: espera descripciones de estado en el formato de etiquetas en ingles producido por `features.describe()`. Entradas con formato distinto degradan la prediccion sin garantia de error explicito.
- Idioma unico: solo ingles. No hay soporte multilingue declarado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de prediccion erronea con alta confianza; la mitigacion prevista es la politica de decision y el fallback a revision humana.
- Sesgos: no se documenta ningun analisis de sesgos. Los datos provienen de partidas generadas por un experto basado en reglas, por lo que el modelo refleja las preferencias y heuristicas de ese experto.
- Datos de entrenamiento no redistribuidos: deben descargarse de la fuente original, lo que afecta a la reproducibilidad exacta del entrenamiento.
- Compatibilidad de version: el modelo exige una version de scikit-learn compatible con la usada en el entrenamiento; una version distinta puede provocar avisos o fallos de carga.
- Carga segura: `skops` solo carga tipos incluidos en su lista de confianza; conviene no ampliar esa lista sin revisar el artefacto.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin las restricciones tipicas de licencias de modelos generativos. Se debe conservar el aviso de copyright y de licencia.
- Adopcion practicamente nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion externa independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ludolua/nextaction-pacman
- Repositorio de codigo NextAction: https://github.com/leduardoaraujo/NextAction
- Demo, scripts, benchmark y analisis de Pac-Man: https://github.com/leduardoaraujo/NextAction/tree/main/demos/pacman
- Perfil del autor: https://github.com/leduardoaraujo
- Paper o publicacion tecnica: no disponible
- Resultados adicionales de busqueda web relevantes: no disponible (las busquedas realizadas no devolvieron resultados relacionados con este modelo)
