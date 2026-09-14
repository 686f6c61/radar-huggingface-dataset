# Jotellechea/chess-transformer

## Resumen

`Jotellechea/chess-transformer` es una familia de cuatro checkpoints de tipo GPT entrenados para predecir movimientos de ajedrez a partir de secuencias tokenizadas en notacion UCI. No es un modelo de ajedrez orientado a la fuerza de juego, sino un artefacto de investigacion controlada sobre una pregunta concreta: por que los modelos de lenguaje que operan sobre dominios formales generan salidas ilegales, y que intervenciones reducen ese fallo. El autor lo publica junto al codigo de entrenamiento y los scripts de evaluacion en un repositorio de GitHub.

La arquitectura es un transformer decoder-only estilo GPT con embeddings atados, en dos escalas: aproximadamente 5 millones de parametros (6 capas, 256 dimensiones de embedding, 4 cabezas de atencion) y aproximadamente 22 millones de parametros (12 capas, 384 dimensiones, 6 cabezas). La longitud de contexto es de 192 tokens, donde cada token es un movimiento UCI completo, de modo que el modelo ve 192 jugadas de historial. El vocabulario es cerrado y de forma cerrada: 1.968 movimientos UCI teoricamente posibles mas 5 tokens especiales, 1.973 en total, identico en los cuatro checkpoints.

Su relevancia actual es metodologica. Reproduce en el dominio del ajedrez el programa de interpretabilidad mecanicista iniciado con OthelloGPT (Li et al., 2022) y continuado por Nanda et al. (2023) y Karvonen (2024), y anade una comparacion factorial entre escala de datos y escala de capacidad. El resultado principal es que ambas palancas se desbloquean mutuamente: escalar solo datos lleva la tasa de partidas completamente legales del 4,4% al 11,4%; escalar solo capacidad llega al 9,8%; hacer ambas alcanza el 51,8%. El checkpoint insignia es `1.2m_L12E384H6`. Cabe senalar que el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, con embeddings de entrada y proyeccion de salida atados |
| Parametros totales | ~5M (`98k_L6E256H4`, `1.2m_L6E256H4`) y ~22M (`98k_L12E384H6`, `1.2m_L12E384H6`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 192 tokens (`block_size=192`), equivalente a 192 movimientos UCI |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en `safetensors`; no se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones de menor precision) |
| Idiomas soportados | No disponible. El modelo no procesa lenguaje natural: su vocabulario es exclusivamente notacion UCI de ajedrez |
| Licencia | MIT (datos de entrenamiento bajo CC0, Lichess open database) |
| Formato de pesos | `safetensors` (`model.safetensors` por checkpoint), acompanado de `config.json` y `vocab.json` |
| Tamano del repositorio | 0,2 GB (los cuatro checkpoints) |
| Vocabulario | 1.973 tokens: 1.968 movimientos UCI posibles mas 5 tokens especiales (`<|SOM|>` y cuatro tokens de resultado) |
| Compatibilidad con `transformers` | No. `AutoModel` y `pipeline()` no funcionan; requiere las clases `GPT`, `GPTConfig` y `MoveTokenizer` del repositorio de GitHub |
| Fecha de publicacion | 2026-09-13 (creacion), 2026-09-13 (ultima actualizacion) |

## Arquitectura y entrenamiento

Los cuatro checkpoints comparten un transformer autoregresivo decoder-only de tipo GPT con normalizacion y bloques estandar, diferenciandose unicamente en profundidad y anchura: las variantes pequenas usan 6 capas con 256 dimensiones de embedding y 4 cabezas de atencion; las grandes usan 12 capas, 384 dimensiones y 6 cabezas. La tokenizacion es a nivel de palabra, donde un token equivale a un movimiento UCI completo (`g1f3`), no a una secuencia de caracteres. El vocabulario se calcula de forma cerrada a partir de las reglas del ajedrez, en lugar de aprenderse con BPE, y es identico en los cuatro checkpoints, lo que permite comparar directamente los identificadores de token entre ellos. Al no existir mecanismo de respaldo, cualquier entrada que no sea un movimiento UCI legal simplemente no se puede tokenizar.

Un detalle de diseno relevante para la interpretabilidad es que la notacion UCI codifica unicamente casilla de origen y casilla de destino. El modelo nunca recibe informacion sobre que pieza se mueve, por lo que debe inferir el tipo de pieza, las capturas y el estado completo del tablero a partir del historial de movimientos. Esto convierte la pregunta "sigue el modelo el estado del tablero internamente" en un problema empirico genuino en lugar de un dato regalado por la entrada.

Los datos proceden de la base de datos abierta de Lichess (CC0). Se conservaron partidas en las que al menos uno de los jugadores tenia titulo de Gran Maestro, en todos los controles de tiempo excepto correspondencia, y se convirtieron de SAN a UCI. El corpus pequeno (`98k`) corresponde a 2023-01, unas 98.000 partidas tras el filtrado. El corpus grande (`1.2m`) anade 2025-01 a 2026-05, unas 1,2 millones de partidas. Ambas arquitecturas se entrenaron durante 5 epocas con `block_size=192`, ventana que cubre el 99,7% de las partidas reales del corpus. No se documenta en la informacion disponible el uso de RLHF, DPO ni ajuste por preferencias; el objetivo es exclusivamente la prediccion del siguiente token con entropia cruzada.

En el plano interpretativo, las sondas lineales sobre las activaciones internas del checkpoint insignia muestran que el estado del tablero es decodificable linealmente, con un maximo en la capa 9 de 12 que alcanza el 84,6% de la distancia al rendimiento perfecto (medido contra una linea base de inicializacion aleatoria), para despues decaer en las dos capas finales. El modelo de 6 capas sigue ascendiendo en su ultima capa, con una mejora capa a capa colapsada a +0,5 puntos.

## Capacidades

- Prediccion autoregresiva del siguiente movimiento en notacion UCI, condicionada por hasta 192 movimientos previos.
- Generacion de partidas completas de ajedrez token a token, con una tasa de movimientos legales del 99,1% en el checkpoint insignia.
- Generacion de partidas integramente legales (todos los movimientos validos) en el 51,8% de los casos sobre una muestra de 500 partidas generadas.
- Representacion interna linealmente decodificable del estado del tablero, explotable mediante sondas lineales para estudios de interpretabilidad mecanicista.
- Inferencia del tipo de pieza y de capturas a partir del historial, dado que la notacion UCI no lo especifica.
- Manejo de cuatro tokens especiales de resultado, lo que permite condicionar o clasificar el desenlace de la partida.
- Vocabulario cerrado y determinista que garantiza que las entradas y salidas son interpretables sin ambiguedad.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso fuera del bucle autoregresivo de generacion.
- No dispone de capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo de pensamiento explicito, vision, audio ni capacidades multimodales.

## Casos de uso

- **Investigacion en interpretabilidad mecanicista:** el modelo permite replicar y extender el programa de sondas lineales de OthelloGPT en un dominio con reglas mas ricas. Un investigador puede entrenar clasificadores sobre las activaciones de cada capa para comprobar en que punto se codifica el estado del tablero y como decae esa representacion en las capas finales, usando el codigo de evaluacion publicado.
- **Estudio de la generacion de salidas invalidas en modelos de lenguaje:** el fallo caracteristico de los modelos sobre dominios formales es emitir salidas sintacticamente plausibles pero invalidas. Con este modelo se puede medir con precision la tasa de legalidad (97,3% a 99,1%) y analizar en que fases de la partida se concentran los movimientos ilegales, algo dificil de aislar en modelos de lenguaje natural.
- **Evaluacion de decodificacion restringida:** dado que existe un oraculo exacto de legalidad (las reglas del ajedrez), el modelo sirve como banco de pruebas para comparar estrategias de enmascaramiento de tokens, decodificacion forzada de gramaticas o filtros posteriores, midiendo cuanto sube la tasa de partidas completamente legales respecto al 51,8% de partida.
- **Material didactico para cursos de transformers:** con aproximadamente 5M y 22M de parametros y un tokenizador trivial de 1.973 entradas, es un caso de estudio asequible para ensenar desde cero el bucle de entrenamiento, el enmascaramiento causal y el atado de embeddings, sin necesidad de infraestructura de GPU.
- **Investigacion sobre leyes de escala en dominios acotados:** el diseno factorial (dos tamanos de corpus por dos tamanos de modelo) permite analizar como interactuan datos y capacidad cuando el espacio de salida es finito y perfectamente conocido, un escenario mas limpio que el de los corpus web abiertos.
- **Estudio de transferencia de tokenizadores:** el vocabulario de forma cerrada permite comprobar empiricamente las diferencias frente a un tokenizador BPE (sin respaldo ante entradas no codificables, comparabilidad directa de identificadores entre checkpoints) y evaluar el impacto en la tasa de legalidad.
- **Sintesis de partidas para analisis posterior con filtrado:** las partidas generadas pueden usarse como material de exploracion en pipelines donde despues se aplica un motor de reglas o Stockfish para descartar lineas ilegales, teniendo en cuenta que solo el 51,8% de las partidas es legal de principio a fin.
- **Referencia para auditoria de jugadas con validacion obligatoria:** en cualquier integracion seria hay que colocar un arbitro de reglas despues del modelo, lo que convierte este proyecto en un ejemplo practico de por que los LLM sobre dominios formales requieren verificacion externa.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la propia model card, que miden perdida de validacion, legalidad por movimiento y legalidad de partidas completas. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en suites de ajedrez tipo Elo.

| Checkpoint | Arquitectura | Parametros | Perdida de validacion | Tasa de movimientos legales | Partidas completamente legales (n=500) |
|---|---|---|---|---|---|
| `98k_L6E256H4` | 6L / 256E / 4H | ~5M | 2,2593 | 97,3% | 4,4% |
| `1.2m_L6E256H4` | 6L / 256E / 4H | ~5M | 2,1035 | 97,7% | 11,4% |
| `98k_L12E384H6` | 12L / 384E / 6H | ~22M | 2,7826 | 97,8% | 9,8% |
| `1.2m_L12E384H6` | 12L / 384E / 6H | ~22M | 1,7015 | 99,1% | 51,8% |

Fuerza de juego: contra Stockfish, el checkpoint insignia gana aproximadamente el 3,8% de las partidas con nivel de habilidad 0 y practicamente ninguna a niveles superiores. No se publican datos de Elo estimado.

Interpretabilidad: las sondas lineales sobre el checkpoint insignia alcanzan un maximo en la capa 9 de 12, con el 84,6% de la distancia al rendimiento perfecto respecto a una linea base de inicializacion aleatoria.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en `safetensors` con precision completa ocupan del orden de 20 MB para los checkpoints de ~5M de parametros y de 88 MB para los de ~22M, dado que aproximadamente 4 bytes por parametro mas los tensores auxiliares. El repositorio completo con los cuatro checkpoints ocupa 0,2 GB.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con al menos 1 GB de memoria libre es mas que suficiente; tambien es viable la inferencia exclusiva en CPU.
- Caben en GPU de consumo sin ninguna dificultad, incluidas tarjetas integradas y modelos de gama de entrada muy antiguos, asi como en placas tipo Raspberry Pi.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama, TGI ni `transformers`, porque los checkpoints no son compatibles con la API de `transformers`. El despliegue requiere cargar `GPT`, `GPTConfig` y `MoveTokenizer` desde el repositorio de GitHub y usar `safetensors.torch.load_model()` en lugar de `load_file()`, ya que los pesos de embedding y de proyeccion de salida estan atados y `load_model()` reconstruye ese atado.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por movimiento.

## Comparativa con modelos similares

La informacion disponible no identifica modelos publicos comparables de interpretabilidad de ajedrez con tokenizacion UCI y vocabulario cerrado. La comparacion mas util es interna, entre los cuatro checkpoints publicados, que difieren en escala de datos y de capacidad:

| Modelo | Parametros | Contexto | Perdida de validacion | Partidas completamente legales | Licencia |
|---|---|---|---|---|---|
| `1.2m_L12E384H6` (insignia) | ~22M | 192 | 1,7015 | 51,8% | MIT |
| `98k_L12E384H6` | ~22M | 192 | 2,7826 | 9,8% | MIT |
| `1.2m_L6E256H4` | ~5M | 192 | 2,1035 | 11,4% | MIT |
| `98k_L6E256H4` | ~5M | 192 | 2,2593 | 4,4% | MIT |

Como referencia externa no neuronal, Stockfish sirve como linea base de fuerza: el checkpoint insignia gana aproximadamente el 3,8% de las partidas al nivel de habilidad 0 y practicamente ninguna a niveles superiores. Comparativas con alternativas de la misma categoria (modelos de ajedrez con arquitectura neuronal o LLM ajustados para ajedrez): no disponibles.

## Limitaciones y advertencias

- **Legalidad no implica fuerza.** El propio autor lo advierte: contra Stockfish el modelo insignia gana en torno al 3,8% de las partidas con habilidad 0 y practicamente nunca en niveles superiores. Una tasa de movimientos legales del 99,1% no dice nada sobre calidad de juego.
- **La comparacion por datos esta confundida por el periodo temporal.** El corpus de 98k procede de 2023-01, mientras que los 1,2M adicionales abarcan 2025-2026. Esa rama del experimento varia la poblacion ademas de la escala, por lo que la mejora no puede atribuirse limpiamente al volumen de datos. La comparacion de capacidad, en cambio, mantiene fijo el corpus y no se ve afectada.
- **El color no esta controlado.** Toda la evaluacion se realizo con el modelo jugando con blancas, de modo que no hay datos sobre su comportamiento con negras.
- **Riesgo de alucinacion en la forma de movimientos ilegales.** El modelo puede emitir movimientos UCI sintacticamente validos pero ilegales en la posicion; el 0,9% de los movimientos del checkpoint insignia lo son, y solo el 51,8% de las partidas completas es legal de principio a fin.
- **Sin arbitro externo no es utilizable.** Cualquier integracion en produccion necesita un validador de reglas aguas abajo, ya que el modelo no tiene garantia de legalidad.
- **Incompatibilidad con `transformers`.** El tag `text-generation` describe el mecanismo (prediccion autoregresiva del siguiente token), no la compatibilidad de API. `AutoModel` y `pipeline()` no funcionan, lo que complica la integracion en stacks estandar.
- **Vocabulario cerrado sin respaldo.** El tokenizador no puede codificar entradas que no sean movimientos UCI legales; no existe mecanismo de respaldo tipo BPE para texto libre.
- **Idiomas no soportados.** El modelo no procesa lenguaje natural, por lo que no tiene capacidades multilingues en el sentido habitual.
- **Cuantizacion no documentada.** Solo se distribuyen pesos `safetensors` en el formato original; no hay variantes GGUF, AWQ ni GPTQ, ni se documentan ganancias o perdidas con cuantizacion.
- **Contexto limitado a 192 movimientos.** Aunque cubre el 99,7% de las partidas reales del corpus, las partidas que superan esa longitud quedan truncadas.
- **Validacion externa nula.** El modelo registra 0 descargas y 0 likes, sin resultados de terceros que reproduzcan las cifras publicadas.
- **Licencia permisiva, datos de origen limpios.** La licencia del modelo es MIT y los datos de entrenamiento proceden de la base de datos abierta de Lichess bajo CC0, por lo que no se identifican restricciones para uso comercial del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jotellechea/chess-transformer
- Repositorio de GitHub con el resumen completo, el codigo de entrenamiento y los scripts de evaluacion: https://github.com/JOTELLECHEA/chess-transformer
- Base de datos abierta de Lichess: https://database.lichess.org
- Licencia CC0 de los datos: https://creativecommons.org/publicdomain/zero/1.0/
- Li et al., OthelloGPT (`arxiv:2210.13382`): https://arxiv.org/abs/2210.13382
- Nanda et al. (`arxiv:2309.00941`): https://arxiv.org/abs/2309.00941
- Karvonen (`arxiv:2403.15498`): https://arxiv.org/abs/2403.15498
- Enlaces adicionales relevantes encontrados en la busqueda web: no disponibles (los resultados devueltos no guardan relacion con el modelo).
