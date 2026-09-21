# chorcat/rukh-rm

## Resumen

Rukh-rm es un modelo de recompensa (reward model) para ajedrez desarrollado por el usuario chorcat dentro del proyecto Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. Su funcion es leer una posicion de tablero y devolver un unico numero escalar que permite ordenar dos posiciones o dos jugadas segun su calidad. Se entreno sobre 13.838 pares de jugadas ya clasificadas por un motor de ajedrez, con un objetivo Bradley-Terry del tipo `-log sigma(r(chosen) - r(rejected))`, de modo que solo importan las diferencias entre puntuaciones y no su valor absoluto.

El modelo tiene 37.913.601 parametros distribuidos en 12 capas de anchura 512 y consume 69 tokens de casilla correspondientes al tablero. Se entrena desde inicializacion aleatoria: partir del codificador de posiciones preentrenado del propio proyecto Rukh dio un resultado aproximadamente 6,5 puntos peor, segun la model card. No es un modelo generativo ni un motor de ajedrez; su salida es una puntuacion sin unidades ni origen, y su utilidad practica es ordenar pares.

Es relevante ahora porque cubre la etapa `rm` de un pipeline de RL para ajedrez y porque su model card documenta con detalle poco habitual la varianza de la metrica principal: distintas semillas de la misma configuracion produjeron 72,91 %, 74,21 %, 74,71 %, 74,76 % y 75,19 %, y dos de esas cifras corresponden a la misma semilla. La model card tambien insiste en que DPO no necesita este modelo, ya que opera directamente sobre los pares con una referencia implicita, mientras que un reward model es lo que requiere PPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de 12 capas y anchura 512 que lee 69 tokens de casilla; el tipo exacto de bloque no se especifica en la model card |
| Parametros totales | 37.913.601 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la entrada descrita es de 69 tokens de casilla de tablero |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La model card describe una red de 37.913.601 parametros, 12 capas y anchura 512, que lee los 69 tokens de casilla de un tablero y emite un unico escalar. Funciona como cabecera de recompensa con pipeline declarado `feature-extraction` y libreria `rukh`. El objetivo de entrenamiento es Bradley-Terry, `-log sigma(r(chosen) - r(rejected))`, lo que implica que la escala aprendida carece de unidades y de origen: sumar una constante a todas las puntuaciones no altera la perdida, y comparar el `0,8` de este modelo con el `1,4` de otra ejecucion carece de sentido.

Los datos son 13.838 pares de jugadas procedentes de evaluaciones de motor sobre partidas publicas de Lichess: 12.376 para entrenamiento y 1.462 reservados, con un split realizado por partida para que dos pares cercanos en plies no queden a ambos lados de la division. La configuracion es de 10 epocas, lote de 64, tasa de aprendizaje 0,0001 y semilla 42. No se menciona uso de RLHF ni de DPO en el entrenamiento de este modelo. La innovacion metodologica destacada en la model card es negativa y verificada experimentalmente: inicializar desde el codificador de posiciones preentrenado del proyecto empeoro el resultado unos 6,5 puntos, porque aquel codificador se entreno para rellenar jugadas enmascaradas y esa tarea no aporta a la hora de ordenar posiciones por calidad.

## Capacidades

- Puntuar una posicion de ajedrez con un unico escalar sin unidades.
- Ordenar dos posiciones o dos jugadas comparando sus puntuaciones.
- Servir como reward model aprendido en un pipeline de PPO para un modelo de lenguaje de ajedrez.
- Actuar como referencia contra la que comparar una recompensa verificable, tal y como plantea la propia model card.
- Evaluacion de calidad de jugadas en bandas de diferencia de motor de 100 a 800 centipeones, donde la precision se mantiene entre el 74,09 % y el 79,21 %.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de proposito general ni generativo.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue no disponible; los tags declaran unicamente ingles.

## Casos de uso

- Ordenacion de jugadas candidatas en un analizador: dado un par de movimientos desde la misma posicion, el modelo devuelve un escalar por jugada y permite establecer cual es preferible. Es adecuado como heuristica de ranking, con una precision de 74,21 % sobre pares reservados, pero no sustituye a un motor de ajedrez.
- Senal de recompensa en PPO para un modelo de lenguaje de ajedrez: la model card indica explicitamente que un reward model es lo que PPO necesita, y este modelo encaja como componente de esa etapa del pipeline de RL.
- Curado y filtrado de datasets de preferencia: el margen aprendido permite descartar pares ruidosos o mal etiquetados antes de usarlos en entrenamiento, aprovechando que el objetivo solo depende de diferencias entre puntuaciones.
- Comparacion frente a recompensas verificables: en posiciones con mate, una comprobacion exacta resuelve el problema sin error, mientras que este modelo se queda en 71,07 % de acierto; usarlo como contraste cuantifica cuanto aporta la verificacion frente al aprendizaje.
- Analisis de errores en partidas de Lichess: al haberse entrenado con evaluaciones de motor sobre partidas publicas de esa plataforma, puede priorizar posiciones donde la jugada humana se aleja de la preferida por el motor, util en estudios de estilo o de deteccion de errores.
- Material didactico dentro del curso Rukh: sirve como ejemplo completo de la etapa `rm`, desde la construccion de pares hasta la publicacion de metricas y la discusion de su varianza.
- Prototipado en local: con 37,9 millones de parametros, la inferencia es viable en CPU o en cualquier GPU de consumo, lo que permite experimentar con el pipeline completo sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados medidos sobre 1.462 pares reservados, con division por partida:

| Metrica | Valor |
|---|---|
| Precision en pares reservados | 74,21 % |
| Precision sobre pares que una evaluacion puede decidir | 75,77 % |
| Perdida de preferencia | 0,5232 |
| Margen frente a la diferencia de motor (Pearson) | -0,148 |
| Margen frente a la diferencia de motor, sin mates (Pearson) | +0,081 |

Precision desglosada por diferencia de evaluacion del motor entre las dos jugadas del par:

| Diferencia de motor | Pares | Precision |
|---|---:|---:|
| 100-200 cp | 616 | 76,30 % |
| 200-400 cp | 247 | 74,09 % |
| 400-800 cp | 101 | 79,21 % |
| 800-2000 cp | 14 | 57,14 % |
| Mate | 484 | 71,07 % |

La banda de 800-2000 cp contiene solo 14 pares y su cifra varia enormemente entre ejecuciones: cinco ejecuciones de la misma configuracion dieron 90 %, 68 %, 90 %, 50 % y 57 %. La banda de mate es la mayor despues de la mas estrecha y es donde el modelo rinde peor, porque un mate es un hecho tactico y el modelo solo lee una vista estatica de la posicion resultante. La model card advierte ademas que las dos correlaciones de Pearson no comparten signo: los pares de mate concentran la mayor diferencia de motor y el menor margen aprendido, de modo que un tercio de los puntos invierte la tendencia de la recta.

## Requisitos de hardware

- VRAM estimada: con 37,9 millones de parametros, los pesos ocuparian aproximadamente 152 MB en fp32 y 76 MB en fp16 (calculo aritmetico propio, no confirmado en la model card). El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se documentan requisitos oficiales.
- GPU de consumo: cabe holgadamente en cualquier RTX, GTX o integrada moderna, e incluso la inferencia en CPU es perfectamente viable dado el tamano.
- Opciones de despliegue: la model card solo documenta la libreria `rukh` y el comando de reproduccion del entrenamiento (`uv run rukh train reward --config configs/train/rm.yaml`). No se documentan vLLM, llama.cpp, Ollama ni TGI, y el pipeline declarado es `feature-extraction`, no generacion de texto.
- Latencia y throughput: no disponible. El tamano del modelo y el hecho de que la entrada sea de 69 tokens permiten esperar latencias muy bajas, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables. La model card no incluye comparaciones con otros reward models ni con modelos de la misma categoria.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chorcat/rukh-rm | 37.913.601 | No disponible | 74,21 % en pares reservados | Apache 2.0 | HuggingFace |
| Codificador de posiciones preentrenado del proyecto Rukh (usado como inicializacion) | No disponible | No disponible | Unos 6,5 puntos peor que entrenar desde cero | No disponible en la informacion proporcionada | Proyecto Rukh |
| Recompensa verificable de mate del mismo hito del proyecto | No disponible | No disponible | Resuelve el mate sin error | No disponible en la informacion proporcionada | Proyecto Rukh |

No hay datos de descargas ni de likes en el repositorio (ambos a cero) que permitan situarlo frente a alternativas de la comunidad.

## Limitaciones y advertencias

- La escala de puntuacion no tiene unidades ni origen: solo las diferencias entre dos puntuaciones tienen significado, y comparar valores absolutos entre ejecuciones distintas es un error metodologico.
- Riesgo elevado de fallo en posiciones tacticas: la precision cae al 71,07 % en la banda de mate, porque el modelo lee la posicion resultante de forma estatica y no puede ver un mate.
- La banda de 800-2000 cp se apoya en 14 pares y varia entre el 50 % y el 90 % segun la ejecucion; cualquier conclusion extraida de ella es ruido.
- Alta dependencia de la semilla: la misma configuracion dio entre 72,91 % y 75,19 % segun la semilla, y dos de esas cifras proceden de la misma semilla, lo que indica que la propia medicion repite con unos 1,3 puntos de dispersion. Solo tiene sentido comparar ejecuciones que compartan semilla.
- La correlacion entre margen aprendido y diferencia de motor es negativa (-0,148) al incluir mates y positiva (+0,081) al excluirlos; una sola correlacion describe mal los dos regimenes.
- Este modelo no es necesario para DPO: esa tecnica usa una referencia implicita congelada y entrena directamente sobre los pares. Usarlo en un pipeline de DPO anade complejidad sin aportar la senal que el metodo necesita.
- Sesgo de dominio: el entrenamiento procede de evaluaciones de motor sobre partidas publicas de Lichess, de modo que el comportamiento en posiciones de otros origenes o de niveles de juego muy distintos no esta caracterizado.
- Licencia Apache 2.0, sin restricciones documentadas para uso comercial, aunque el modelo se distribuye como esta y la model card no ofrece garantias.
- Idiomas: los tags declaran unicamente ingles, si bien se trata de un modelo de puntuacion de posiciones y no de texto general.
- No se han documentado tipos de cuantizacion ni opciones de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-rm
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Blog del proyecto con la explicacion de la construccion: https://lab.rukh.borjaglez.com
- Dataset de pares usado en el entrenamiento: chorcat/rukh-pairs-dpo
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a consultas de prueba sin relacion con el proyecto.
