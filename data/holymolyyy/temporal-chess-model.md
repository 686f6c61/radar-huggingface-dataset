# holymolyyy/temporal-chess-model

## Resumen

Temporal chess model es una familia de cinco checkpoints de redes neuronales entrenadas por Victor Dziwniel y Tianxiang Lu para imitar el comportamiento de jugadores humanos de ajedrez, condicionando la prediccion en el tiempo restante de la partida. El modelo resuelve el problema de la clonacion de comportamiento humano en ajedrez: en lugar de jugar al nivel mas alto posible, predice el movimiento que un humano de una determinada franja de rating jugaria en una posicion concreta. La innovacion principal es el condicionamiento temporal: el modelo recibe informacion sobre el tiempo disponible o consumido, lo que permite modelar como el reloj afecta a la calidad y el estilo de las decisiones humanas.

Los pesos se publican como parte del paper "Temporal Conditioning for Human Behavioral Cloning in Chess", aceptado en la IEEE Gaming, Entertainment, and Media Conference (GEM) 2026. Se distribuyen cinco checkpoints en dos tamanos (23M y 79M parametros), cada uno en formato ONNX para jugar y PyTorch (.pt) para evaluar. El modelo mas grande, `marvin_79m_cond_1650k`, es el que el paper compara contra Maia-3, un modelo de referencia en la prediccion de movimientos humanos.

La relevancia actual radica en su aplicacion a la investigacion en alineacion humano-IA y en el desarrollo de motores de ajedrez que se comporten de forma mas humana, algo util para entrenamiento, analisis pedagogico y generacion de adversarios realistas. El repositorio ocupa 3,8 GB e incluye datos de evaluacion: un conjunto de test de 1.500.029 posiciones extraidas de partidas de Lichess de mayo de 2026, con ratings entre 1200 y 2500 y todos los controles de tiempo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para prediccion de movimientos de ajedrez; detalles en el paper) |
| Parametros totales | 23M y 79M (dos variantes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo especifico de ajedrez, sin procesamiento de lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (inferencia/juego) y PyTorch .pt (evaluacion) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de transformer, capas, atencion, etc.); la model card solo indica que se trata de redes neuronales condicionadas temporalmente y que existen variantes "time-conditioned" y "time-blind". El modelo se entrena mediante clonacion de comportamiento (behavioral cloning) sobre partidas humanas, con el objetivo de predecir el movimiento jugado por humanos en funcion de la posicion y del estado temporal de la partida. La variante "time-blind" sirve como ablacion para medir la contribucion del condicionamiento temporal.

Se publican cinco checkpoints: `marvin_23m_cond_1700k` (1,70M pasos, el mas entrenado y fuerte), `marvin_79m_cond_1650k` (1,65M pasos, el comparado con Maia-3), `marvin_23m_cond_1M` (ablacion), `marvin_23m_blind_1M` (gemelo sin tiempo, linea base) y `marvin_79m_cond_1M` (emparejado en pasos con el par de 23M). Los tres checkpoints de 1M pasos estan emparejados en pasos para permitir comparaciones controladas. El manifiesto `checkpoints_MANIFEST.json` registra rol, sha256, numero de pasos, semillas, numero de parametros y comando de entrenamiento de cada checkpoint. No se especifica el numero total de tokens ni la composicion exacta del dataset de entrenamiento mas alla de que proviene de partidas humanas.

## Capacidades

- Prediccion del movimiento humano en posiciones de ajedrez, condicionada por el estado temporal de la partida.
- Modelado del efecto del reloj en la calidad y el estilo de las decisiones (variantes time-conditioned).
- Generacion de movimientos a nivel de jugador humano (ratings 1200-2500), no de motor de maxima fuerza.
- Integracion como motor UCI mediante `scripts/marvin-uci.sh`, jugable desde una GUI de ajedrez.
- Carga automatica de cualquier checkpoint `.pt` mediante `evaluation.backends.make_backend`, ya que cada uno embebe su `config_dict`.
- Evaluacion reproducible sobre un test set fijo de 1.500.029 posiciones.
- No dispone de capacidades de lenguaje natural, vision, audio, tool calling ni razonamiento multi-paso fuera del dominio del ajedrez.

## Casos de uso

- Investigacion en clonacion de comportamiento humano: el modelo permite estudiar como variables contextuales (el reloj) afectan a las decisiones humanas, comparando las variantes time-conditioned y time-blind en el test set de 1,5M posiciones.
- Entrenamiento de jugadores: un motor que juega como un humano de un rating objetivo permite practicar contra adversarios realistas en lugar de motores de maxima fuerza, con la ventaja de que el modelo puede simular el deterioro de juego bajo presion de tiempo.
- Analisis pedagogico de partidas: al predecir el movimiento humano probable, se puede contrastar la decision del alumno con la de la poblacion de su nivel y detectar desviaciones sistematicas.
- Generacion de adversarios para plataformas de ajedrez: los checkpoints de 23M y 79M permiten desplegar bots con perfiles de rating y comportamiento temporal distintos, ajustables por tiempo de partida.
- Benchmarks de alineacion humano-IA: el conjunto de evaluacion de mayo de 2026 y las metricas del paper sirven como referencia para comparar nuevos modelos de prediccion de movimientos humanos contra Maia-3.
- Reproduccion cientifica: el manifiesto con sha256, semillas y comandos de entrenamiento permite replicar exactamente cada checkpoint y verificar los resultados del paper GEM 2026.
- Desarrollo de herramientas de analisis de ajedrez: integracion del modelo ONNX en pipelines que estimen el nivel humano de una posicion o la probabilidad de error bajo apuros de tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el paper compara `marvin_79m_cond_1650k` con Maia-3, pero no incluye las cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano (23M y 79M parametros) es previsible que quepa en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX sugiere despliegue en CPU o GPU sin requisitos especificos documentados.
- Opciones de despliegue: ONNX Runtime para los checkpoints `.onnx`; PyTorch para los `.pt`; integracion UCI mediante `scripts/marvin-uci.sh` y `requirements-engine.txt`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Temporal chess model (79M) | 79M | no disponible | Clonacion humana con condicionamiento temporal | AGPL-3.0 | Hugging Face y GitHub |
| Maia-3 | no disponible | no disponible | Clonacion humana de movimientos | no disponible | no disponible |
| Temporal chess model (23M) | 23M | no disponible | Clonacion humana con condicionamiento temporal | AGPL-3.0 | Hugging Face y GitHub |

La unica comparacion explicita en la informacion proporcionada es con Maia-3, pero no se aportan sus especificaciones ni los resultados numericos de la comparacion.

## Limitaciones y advertencias

- Modelo de dominio especifico: solo predice movimientos de ajedrez; no procesa lenguaje natural ni tiene capacidades generales.
- Sesgos de los datos: entrenado sobre partidas humanas de Lichess, por lo que hereda los sesgos de esa poblacion (ratings, controles de tiempo y estilo de juego presentes en el dataset).
- Riesgo de alucinacion en sentido estricto no aplica, pero el modelo puede predecir movimientos legales de baja calidad o poco representativos en posiciones fuera de la distribucion de entrenamiento.
- Cobertura limitada a ratings 1200-2500 en el test set; el comportamiento fuera de ese rango no esta validado.
- Licencia AGPL-3.0: el uso comercial o la integracion en servicios de red exige cumplir las obligaciones de copyleft de la AGPL, lo que puede ser restrictivo para productos propietarios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion externa practicamente inexistente.
- No se documentan cuantizaciones ni requisitos de hardware, lo que dificulta planificar el despliegue en produccion.
- El modelo esta disenado para imitar humanos, no para jugar al maximo nivel; no debe usarse como motor de analisis de maxima fuerza.

## Enlaces

- Hugging Face: https://huggingface.co/holymolyyy/temporal-chess-model
- GitHub (codigo y reproduccion): https://github.com/Prof-it/temporal-chess-model
- Paper (DOI): https://doi.org/10.1109/GEM72276.2026.11747060
