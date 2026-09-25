# lhumeau/dominozero-rd-patio-v1

## Resumen

DominoZero-RD Patio v1 es una politica experimental para el domino dominicano en la variante Regla de Patio, entrenada mediante self-play con aprendizaje por refuerzo. Lo desarrolla el autor lhumeau y se publica bajo licencia MIT. El modelo resuelve un problema acotado: seleccionar una jugada legal (ficha y extremo, o pasar) a partir de la mano propia del jugador y del estado publico de la partida. No es un modelo de lenguaje ni un modelo generativo de proposito general, sino una red neuronal pequena especializada en un juego de mesa con informacion imperfecta.

El checkpoint principal (`model.safetensors`, iteracion 313) tiene 635.454 parametros y ocupa aproximadamente 2,55 MB en formato SafeTensors, lo que lo situa en la categoria de modelos diminutos que pueden ejecutarse en CPU. La arquitectura es un transformer encoder de 4 capas con dimension 128, 4 cabezas de atencion y feed-forward de 256, con una ventana de historia publica de hasta 64 eventos y tres cabezas de salida: policy (57 acciones), value y belief.

Su relevancia actual es doble. Por un lado, es un ejemplo reproducible de un pipeline completo de self-play y evaluacion emparejada candidato contra campeon en un dominio poco explorado como el domino dominicano de Patio. Por otro, el propio autor es explicito sobre el estado experimental: los ensayos publicados no demuestran que el checkpoint 313 sea mejor que el 157, y la tasa de victorias combinada entre ambos es del 50,7%. Se publican ambos checkpoints para facilitar reproduccion y comparacion, no como un bot campeon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con 4 capas, dimension 128, 4 cabezas de atencion y feed-forward 256 |
| Parametros totales | 635.454 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | ventana de historia publica de hasta 64 eventos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles a nivel de ficha; el tag del repositorio indica "spanish" |
| Licencia | MIT |
| Formato de pesos | safetensors (aproximadamente 2,55 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de 4 capas con dimension de modelo 128, 4 cabezas de atencion y una capa feed-forward de 256 unidades. Consume una codificacion de la observacion (mano propia, tamanos de mano, puntuacion e historial publico de hasta 64 eventos) y produce tres salidas simultaneas: una cabeza de policy sobre 57 acciones, una cabeza de value y una cabeza de belief. La policy propone una ficha o un extremo, o bien pasar; antes de elegir, el motor de reglas calcula la lista de acciones legales y se usa como mascara. La definicion de las capas y el preprocesamiento no estan en los pesos, sino en `dominozero-inference-source.zip`; los pesos por si solos no son autosuficientes.

El entrenamiento es self-play puro: no se uso ningun dataset de personas. Se generaron 2.773.291 manos de self-play en dos fases sobre una NVIDIA RTX 5060 Laptop GPU. El proceso de promocion es candidato contra campeon, con partidas de evaluacion con semillas fijas y equipos intercambiados dentro de cada par. Las reglas y la meta estan fijadas en `patio-v1-training-config.yaml` (variante `patio-v1`, meta de 200 puntos). El codigo de origen esta disponible en el repositorio `lhumeau/dominozero-rd`, commit `f0f20039fc7612b524bd7848b9bf9b78a587301b`, con licencia MIT. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos.

## Capacidades

- Seleccion de jugada legal en domino dominicano Regla de Patio: dado el estado publico y la mano propia, devuelve una accion de la lista legal enviada (ficha y extremo, o pasar).
- Estimacion de valor de la posicion mediante la cabeza de value, util para evaluacion y para busqueda si se integra en un motor externo.
- Modelado de creencias sobre el estado oculto a traves de la cabeza de belief.
- Procesamiento de historial publico de hasta 64 eventos.
- Inferencia en CPU en Linux ARM64 y x86-64 mediante un worker persistente JSON Lines (`run_json_policy.py`), con una peticion JSON por linea.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de proposito general; solo cubre la decision de una jugada por turno dentro del flujo del motor.
- No tiene capacidades multilingues ni de generacion de texto; no es un modelo de lenguaje.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Investigacion en aprendizaje por refuerzo con self-play: el modelo sirve como caso de estudio reproducible de un pipeline candidato contra campeon en un juego de informacion imperfecta, con semillas fijas y evaluacion emparejada documentada en `evaluation-and-metrics.zip`.
- Jugadores virtuales experimentales en aplicaciones de domino de Patio: el worker JSON Lines permite conectar la politica a un servidor de juego que mantenga la autoridad sobre reglas, puntuacion y estado.
- Pruebas de motores de reglas: al devolver siempre una accion de la lista legal enviada, es util para validar que un motor de Patio calcula correctamente las acciones disponibles antes de la mascara.
- Generacion de datos sinteticos para entrenamiento posterior: la politica puede generar manos de self-play adicionales que alimenten nuevas iteraciones de entrenamiento.
- Comparacion de algoritmos de RL en dominios tabulares o de estado parcial: con 635.454 parametros, entrenar variantes completas es barato y rapido en una GPU de portatil.
- Demostraciones y material didactico sobre self-play y evaluacion estadistica: el propio autor documenta intervalos de confianza y tasas emparejadas, lo que sirve como ejemplo de como reportar resultados sin sobreafirmar.
- Evaluacion local sin GPU: al ocupar 2,55 MB y ejecutarse en CPU, puede integrarse en entornos de CI o en maquinas sin acelerador para pruebas de regresion de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que no es un modelo de lenguaje. Se documentan resultados de enfrentamientos directos entre checkpoints:

| Enfrentamiento | Victorias 157 | Victorias 313 | Partidas |
|---|---:|---:|---:|
| Ensayo adicional, 1.000 semillas | 1.005 | 995 | 2.000 |
| Combinado con el ensayo previo de 500 semillas | 1.479 | 1.521 | 3.000 |

En el conjunto combinado, la tasa emparejada del checkpoint 313 es del 50,7%, con un intervalo de confianza del 95% de 48,96%–52,44%. Incluye el empate, por lo que no puede afirmarse que exista un ganador estadistico entre 157 y 313.

Como referencia adicional, ambos campeones jugaron 1.000 partidas contra el bot heuristico en 500 semillas emparejadas:

| Checkpoint | Tasa de victorias frente al bot heuristico | Partidas |
|---|---:|---:|
| 157 | 71,8% | 1.000 |
| 313 | 71,9% | 1.000 |

La diferencia es minima y esta prueba tampoco demuestra superioridad entre campeones.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el checkpoint pesa aproximadamente 2,55 MB y el modelo completo tiene 635.454 parametros.
- GPU recomendadas: no se requieren GPU para inferencia. El autor documenta inferencia local por CPU en Linux ARM64 y x86-64.
- GPU usada en entrenamiento: NVIDIA RTX 5060 Laptop GPU, donde se generaron 2.773.291 manos de self-play en dos fases.
- Cabe en cualquier GPU de consumo e incluso en equipos sin GPU discreta; tambien en dispositivos con recursos muy limitados, siempre que se pueda ejecutar PyTorch.
- Opciones de despliegue: worker persistente JSON Lines `run_json_policy.py` incluido en `dominozero-inference-source.zip`, con dependencias instaladas mediante `requirements-inference.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se documenta el modo de ejecucion (carga de pesos una vez y lectura de una peticion JSON por linea), no cifras de latencia ni partidas por segundo.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos publicos comparables de politica de domino dominicano Regla de Patio. El unico punto de referencia documentado es el bot heuristico interno frente al que se midieron ambos checkpoints (71,8% y 71,9% de victorias), pero no se ofrecen sus especificaciones ni su implementacion. La busqueda web realizada no devolvio resultados relevantes para este dominio.

## Limitaciones y advertencias

- Estado experimental explicito: los ensayos no demuestran que el checkpoint 313 sea mejor que el 157. La tasa emparejada combinada del 313 es del 50,7% con un intervalo de confianza del 95% que incluye el empate.
- La calidad de la policy depende de que el estado, el historial y las reglas coincidan exactamente con el preprocesamiento y con la variante `patio-v1` (meta de 200 puntos). Con otra variante o meta, los resultados no estan validados.
- Los pesos por si solos no contienen el codigo de las capas: hay que extraer `dominozero-inference-source.zip` para reconstruir la arquitectura y el preprocesamiento.
- Riesgo de uso incorrecto de la observacion: nunca deben enviarse las manos ocultas rivales; solo la mano propia, tamanos de mano, puntuacion e historial publico.
- Los datos del simulador no equivalen a rendimiento en partidas reales.
- La politica no se ha integrado ni evaluado en produccion dentro de Domino Trainer.
- No es apropiado para decisiones economicas, rankings oficiales ni afirmaciones de ventaja competitiva sin validacion adicional.
- No se documentan sesgos especificos derivados de datos humanos porque no se uso un dataset de personas; el entrenamiento es self-play puro.
- Limitaciones de idioma: no es un modelo de lenguaje, por lo que no procede evaluacion multilingue. El tag del repositorio indica "spanish", pero no se detalla alcance linguistico.
- Licencia MIT, que permite uso comercial con atribucion; aun asi, el autor restringe el uso previsto a investigacion, evaluacion y jugadores virtuales experimentales.
- Al ser un repositorio con 0 descargas y 0 likes en el momento de la consulta, no existe validacion externa independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/lhumeau/dominozero-rd-patio-v1
- Repositorio de codigo fuente: https://github.com/lhumeau/dominozero-rd (commit `f0f20039fc7612b524bd7848b9bf9b78a587301b`)
- Configuracion de entrenamiento y reglas: `patio-v1-training-config.yaml` (incluido en el repositorio de HuggingFace)
- Codigo de arquitectura e inferencia: `dominozero-inference-source.zip` (incluido en el repositorio de HuggingFace)
- Metricas de evaluacion y entrenamiento: `evaluation-and-metrics.zip` (incluido en el repositorio de HuggingFace)
- Manifiesto con hashes y metadatos: `manifest.json` (incluido en el repositorio de HuggingFace)
- Resultados de la busqueda web: no se encontraron enlaces relevantes para este modelo o su dominio.
