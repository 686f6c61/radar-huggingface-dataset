# brasszero/brasszero-ppo

## Resumen

BrassZero PPO es una coleccion de 16 checkpoints de redes de politica entrenadas mediante aprendizaje por refuerzo (PPO) y self-play para jugar a Brass: Birmingham en su variante para cuatro jugadores. No es un modelo de lenguaje ni un transformer: es una red neuronal de 390.342 parametros que actua como agente de juego dentro del proyecto de investigacion BrassZero, desarrollado por el autor brasszero. El repositorio publica una unica linea de entrenamiento desde la actualizacion 0 hasta la 4097, con el checkpoint `update-0788` marcado por el autor como modelo de trabajo recomendado.

El modelo resuelve un problema concreto de investigacion en IA para juegos de mesa: aprender una politica competitiva en un juego de eurogama con informacion imperfecta, interaccion multiagente y alta profundidad estrategica, sin recurrir a busqueda tipo MCTS durante el entrenamiento. La relevancia actual es acotada pero clara para la comunidad de RL aplicado a juegos: documenta una linea de self-play con ligas de oponentes congelados, ramas de control y estudios de estabilidad, y publica las evaluaciones con intervalos de confianza, incluidos resultados negativos (la actualizacion 1919 rinde peor que la 843).

La ficha debe leerse con cautela: el propio autor advierte de que la fuerza de juego contra humanos no se ha medido, de que no hay resultados de benchmarks estandar y de que el modelo solo carga con el codigo BrassZero y una identidad de motor concreta. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con codificador de grafo sobre el tablero y memoria recurrente de eventos publicos (entity_dim 64, context_dim 128, recurrent_dim 64, 2 rondas de paso de mensajes) |
| Parametros totales | 390.342 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (memoria recurrente de eventos publicos, sin ventana de tokens declarada) |
| Tipos de cuantizacion | no disponible (pesos en `policy.pt`, cargados con `torch.load(..., weights_only=True)`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`policy.pt` por checkpoint, acompanado de `manifest.json` y `metadata.json`) |

## Arquitectura y entrenamiento

La politica es una red de 390.342 parametros que combina un codificador de grafo sobre el estado del tablero con una memoria recurrente de eventos publicos. La observacion del agente se limita a su propia informacion y a los eventos publicos, lo que respeta la informacion imperfecta del juego. La salida es una distribucion de politica sobre acciones legales; en los checkpoints 4071 y 4097 la cabeza de valor se conserva solo por compatibilidad de formato y no debe usarse para busqueda, ya que el critico se entrena por separado.

El entrenamiento sigue una linea unica de PPO con self-play y una liga de oponentes congelados. Las actualizaciones 0 a 688 corresponden a la "school line"; 689 a 738 son una rama de control; 739 a 788 aplican tratamientos combinados de critico y recompensa por puntuacion (etiquetados internamente como `BC`, que no significa behaviour cloning); 789 a 1919 son continuaciones que incluyen un estudio de liga entre 794 y 843; 1920 a 4055 es una continuacion adicional; y 4056 a 4097 introducen un aprendiz candidato con ocho partidas por actualizacion y un critico separado. El dataset asociado es `brasszero/brasszero-games`. No se documenta el numero total de tokens ni la composicion del dataset, dado que no aplica a este tipo de modelo.

## Capacidades

- Juego de Brass: Birmingham para cuatro jugadores, con observacion limitada a informacion propia y eventos publicos.
- Seleccion de acciones mediante politica aprendida, con modo de decodificacion `argmax` documentado en el ejemplo de carga.
- Memoria recurrente de eventos publicos para mantener estado a lo largo de la partida.
- Evaluacion contra oponentes de referencia: jugador basado en reglas "Greedy" y checkpoints congelados (688, 738, 793).
- Integracion con el arnes `brass_rl arena` del proyecto BrassZero para partidas y generacion de grabaciones.
- No soporta tool calling, function calling, agentes multi-step genericos, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en RL para juegos de informacion imperfecta: usar los checkpoints como linea base reproducible para estudiar estabilidad de PPO y ligas de oponentes congelados, aprovechando que el repositorio publica 16 puntos de la misma linea.
- Estudio de degradacion por continuacion de entrenamiento: comparar `update-0843` con `update-1919` para analizar como una continuacion larga puede reducir la fuerza de juego (diferencia pareada de -14,20 VP contra Greedy).
- Evaluacion de agentes de juego de mesa: enfrentar la politica contra jugadores basados en reglas como Greedy usando el arnes `brass_rl arena` y las grabaciones JSONL.
- Reproduccion de experimentos: cargar `update-0788` con la identidad de motor `engine-sha256-v1:65f8fb9c...` para replicar las tablas de evaluacion publicadas.
- Desarrollo de herramientas de analisis de partidas: procesar las grabaciones generadas para extraer metricas de VP, puesto medio y victorias en solitario.
- Prototipado de oponentes sinteticos: emplear checkpoints congelados (688, 738, 793) como rivales fijos en nuevos estudios de liga.
- Docencia en RL: ilustrar un ciclo completo de self-play, ramas de control y evaluacion con intervalos de confianza pareados en un juego de mesa real.

## Benchmarks y rendimiento

Los datos publicados son estudios internos con repartos propios; el autor advierte de que no deben compararse numeros entre tablas. Una victoria es un primer puesto en solitario tras los desempates nativos.

| Estudio | Oponentes | Partidas | VP medio | Victorias en solitario | Puesto medio |
|---|---|---:|---:|---:|---:|
| Update 788 | frozen 688 | 32 | 63,06 | 11 | no disponible |
| Update 788 | Greedy | 32 | 52,28 | 31 | no disponible |
| Update 843 | 3 Greedy | 64 | 65,88 | 63 | 1,02 |
| Update 1919 | 3 Greedy | 64 | 51,67 | 61 | 1,09 |
| Update 843 | fijos 688, 738, 793 | 64 | 71,22 | 35 | 1,70 |
| Update 1919 | fijos 688, 738, 793 | 64 | 57,20 | 14 | 2,41 |

Diferencias pareadas documentadas: contra frozen 688, update 788 muestra +7,19 VP respecto al control (intervalo del 95 %: -3,34 a +17,22), por lo que es una tendencia y no una victoria establecida. La diferencia 1919 menos 843 fue de -14,20 VP contra Greedy (intervalo -19,16 a -9,66) y de -14,02 contra el trio fijo (-21,23 a -7,25). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (390.342 parametros, aproximadamente 1,6 MB en float32), aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible; la carga se probo en macOS Intel con CPU y Python 3.9. Linux no se ha probado para esta release.
- Cabe en cualquier GPU de consumo e incluso en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: exclusivamente el codigo BrassZero (`make setup`, `make setup-training`) con el arnes `brass_rl arena`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Juego | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrassZero PPO (este) | 390.342 | no disponible | Brass: Birmingham 4 jugadores | Apache 2.0 | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La fuerza de juego contra jugadores humanos no se ha medido.
- El checkpoint mas reciente (`update-4097`) no tiene fuerza evaluada; un numero de actualizacion mayor no implica un modelo mas fuerte (1919 rindio peor que 843).
- Cada estudio usa una sola ejecucion de entrenamiento, por lo que la variacion entre ejecuciones no esta medida.
- Los numeros de distintas tablas no son comparables entre si (repartos distintos).
- El intervalo de confianza del estudio de update 788 contra frozen 688 cruza cero: no hay evidencia establecida de mejora.
- Solo carga con el codigo BrassZero y la identidad de motor exacta; el loader rechaza ficheros adicionales, checksums incorrectos o identidades distintas.
- En los checkpoints 4071 y 4097 la cabeza de valor no es el critico entrenado por separado; no debe usarse para busqueda.
- Linux no se ha probado para esta release; la carga se verifico en macOS Intel con CPU.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, codigo, matematicas, vision ni multilingues.
- Riesgo de alucinacion y sesgos: no aplica en el sentido habitual; el riesgo relevante es de sobreajuste a la liga de oponentes congelados y de explotacion de sesgos del motor.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad practica fuera de la investigacion en Brass es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/brasszero/brasszero-ppo
- Repositorio del proyecto: https://github.com/script-amv/brasszero
- Dataset asociado: https://huggingface.co/datasets/brasszero/brasszero-games
- Listado de checkpoints: https://huggingface.co/brasszero/brasszero-ppo/blob/main/checkpoints.csv
- Checkpoint recomendado: https://huggingface.co/brasszero/brasszero-ppo/tree/main/update-0788
