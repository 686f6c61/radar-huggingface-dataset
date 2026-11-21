# sakuya9t/efz

## Resumen

EFZ agents es una colección de agentes de refuerzo (reinforcement learning) entrenados para jugar a Eternal Fighter Zero, un juego de lucha doujin, controlando al personaje Ayu contra cualquier oponente. El modelo lo desarrolla el usuario sakuya9t y se distribuye a través de Hugging Face como un conjunto de ficheros `.efzagent`, cada uno de los cuales empaqueta una red de política, una biblioteca de combos planificados a partir de repeticiones de la comunidad y los módulos auxiliares que el juego ejecuta junto a la política.

El problema que resuelve es acotado pero técnico: proporcionar oponentes controlados por IA dentro del port nativo del juego, con un comportamiento que imita la reacción humana (latencia de 11 a 14 fotogramas) y que se ha refinado mediante una liga de oponentes entrenados y oponentes con guiones que reproducen hábitos de jugadores reales (guarda de retroceso, reversals, techs, escapes, saltos de entrada, golpes bajos, lanzamientos y cebos). No es un modelo de lenguaje: es una política de aprendizaje por refuerzo para un dominio de juego concreto.

La relevancia es de nicho: sirve como referencia práctica de entrenamiento por refuerzo aplicado a juegos de lucha con observación retardada, planificación de combos y evaluación por liga. El repositorio ocupa 2,5 GB y el autor retiró los checkpoints de Stable-Baselines3 de las rondas 1 a 12 el 20 de noviembre de 2026, conservándolos solo en el historial del repositorio (revisión `f0dbd7b7`). No se dispone de información sobre arquitectura de red, número de parámetros ni longitud de contexto en el sentido de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning empaquetada en ficheros `.efzagent`; el autor no detalla la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (observación del estado del juego con retardo de 11 o 14 fotogramas según el fichero) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; el dominio es el juego Eternal Fighter Zero) |
| Licencia | no disponible |
| Formato de pesos | ficheros `.efzagent` (contenedor propio con política, rutas de combo, módulos y parte de entrenamiento); exportable a modelos de Stable-Baselines3 (`.zip`) mediante `unpack_agent.py` |

## Arquitectura y entrenamiento

El autor no publica la arquitectura interna de la red de política. Lo que sí documenta es el proceso: los agentes aprendieron primero de repeticiones de la comunidad (un clon del juego humano que reacciona con el mismo retardo que una persona) y después de una liga de oponentes entrenados. La evaluación se realiza con 64 partidas por emparejamiento ejecutadas a través del propio código del juego, con los oponentes también a 11 fotogramas de retardo (± un error estándar). El entrenamiento se apoya en Stable-Baselines3, y los ficheros incluyen una parte de entrenamiento (el crítico y los ajustes) para poder continuar el entrenamiento.

Cada fichero `.efzagent` contiene la red de política, las rutas de combo planificadas a partir de repeticiones humanas, los módulos que el juego ejecuta junto a la política (`okiplan`, `pressplan`, `airthrow`, `rise`, `risk`) y la parte de entrenamiento. El autor subraya que nada del contenido de un fichero se ejecuta: el juego y las herramientas de Python leen únicamente sus números y texto, por lo que cargar un fichero de terceros es seguro. La documentación técnica del proceso de entrenamiento está en `docs/training-v2.md` y el formato de fichero y los módulos en `docs/agents.md`.

## Capacidades

- Jugar a Eternal Fighter Zero controlando a Ayu contra cualquier personaje, dentro del port nativo del juego.
- Reaccionar con retardo humano: 11 fotogramas en las rondas 18k8 y 20, y 14 fotogramas en las rondas 16 y 17.
- Ejecutar combos planificados a partir de repeticiones de la comunidad (rutas de combo incluidas en el fichero).
- Okizeme y presión planificadas a partir de patrones humanos (módulos `okiplan` y `pressplan`).
- Lanzamiento aéreo que atrapa a un oponente recuperándose en el aire fuera de su combo (módulo `airthrow`).
- Guarda al levantarse que responde a una guarda de retroceso tal como el combate la ha mostrado y la castiga (rondas 18k8 y 20, requiere la rama `release/next`).
- Módulo `risk` para la gestión de riesgo en las rondas 18k8 y 20.
- Jugar tanto en modo VS HUMAN (F5/F6 para asignar P1/P2, o `--agent-p1`/`--agent-p2`) como en red (fila PLAYED BY o `--agent FILE`), enviando un byte de entrada por fotograma.
- Entrenamiento adicional: exportable a Stable-Baselines3 y reentrenable con `finetune.py` y `export_agent.py`.

## Casos de uso

- Oponente de práctica dentro del juego: cargar `agent-league20-spar-s1-round20.efzagent` en la carpeta `agents` y asignarlo a P1 o P2 con F5/F6 para entrenar contra una IA que reacciona con 11 fotogramas de retardo, similar a un humano.
- Evaluación comparativa de políticas: usar la tabla de 64 partidas por emparejamiento del autor como protocolo para medir una política propia frente a las rondas 18k8 y 20 en las mismas condiciones (oponentes a 11 fotogramas, error estándar reportado).
- Investigación en RL con observación retardada: el caso documenta explícitamente el entrenamiento a un retardo distinto del de ejecución (ronda 18 entrenada a 14 fotogramas y ejecutada a 11), útil para estudiar robustez ante latencia.
- Estudio de planificación de combos: las rutas de combo extraídas de repeticiones humanas y empaquetadas en el fichero permiten analizar cómo se combina planificación simbólica con una política neuronal.
- Desarrollo de oponentes con guiones: los oponentes scriptados con hábitos humanos (guardas de retroceso, reversals, techs, escapes, saltos de entrada, golpes bajos, lanzamientos, cebos) sirven como banco de pruebas para medir la cobertura de comportamientos de una política.
- Juego en red con un agente en un lado: mediante la fila PLAYED BY o `--agent FILE`, el agente juega el lado de este ordenador enviando el mismo byte de entrada que un mando, manteniendo compatibilidad con EfzRevival 1.02h al otro lado.
- Reentrenamiento y ajuste fino: desempaquetar el fichero a un modelo de Stable-Baselines3 (`unpack_agent.py`), continuar el entrenamiento con `finetune.py` y reexportar con `export_agent.py` usando las partes del fichero original.

## Benchmarks y rendimiento

El autor publica una comparación entre la ronda 20 y la ronda 18k8 con 64 partidas por emparejamiento, ejecutadas a través del código del juego y con los oponentes a 11 fotogramas de retardo (± un error estándar):

| Métrica | Ronda 18k8 | Ronda 20 |
|---|---|---|
| Victorias contra los once oponentes entrenados de la liga | 93,5 ±0,9 % | 95,3 ±0,7 % |
| HP propio perdido por ronda en esos combates | 54,8 ±0,7 % | 50,2 ±0,8 % |
| Victorias contra todos los hábitos scriptados a la vez | 75,0 ±2,3 % | 90,0 ±1,6 % |
| Victorias contra guardas de retroceso | 80,0 ±2,0 % | 88,8 ±1,3 % |
| Victorias contra la CPU de nivel 4 con los combos del propio agente | 31,2 ±6,2 % | 43,8 ±4,8 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la información disponible; el modelo se ejecuta dentro del propio juego, no como un servicio de inferencia de modelos generativos.
- El repositorio ocupa 2,5 GB, pero cada fichero `.efzagent` es una unidad independiente que se descarga por separado; el tamaño por fichero no está indicado.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el juego compilado desde la rama `release/next` del repositorio (commit afac5c4 o posterior para las rondas 18k8 y 20; `main` solo reproduce el fichero de la ronda 16 hasta que incorpore esos cambios). Para entrenamiento, Stable-Baselines3 con las herramientas `runs/hub.py`, `python/examples/unpack_agent.py`, `runs/human-ayu/finetune.py` y `python/examples/export_agent.py`.
- Latencia y throughput: no disponibles; el agente emite un byte de entrada por fotograma, con una latencia de decisión efectiva de 11 o 14 fotogramas según el fichero.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes de RL para Eternal Fighter Zero ni modelos comparables de la misma categoría (políticas de juego de lucha con observación retardada) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia no está indicada, por lo que no puede confirmarse el uso comercial ni la redistribución de los ficheros ni del código del juego.
- El alcance es muy estrecho: un único juego (Eternal Fighter Zero) y un único personaje controlado (Ayu), aunque contra cualquier oponente.
- Debilidades reconocidas por el autor en la ronda 20: la CPU de nivel 4 con combos gana más de la mitad de las partidas; el agente deja salir a un oponente de la esquina; el oponente escapa de la mitad de sus combos grandes recuperándose; y el agente inicia movimientos contra golpes ya lanzados.
- Dependencia de versión: las rondas 18k8 y 20 requieren la rama `release/next` (commit afac5c4 o posterior) por la guarda al levantarse; `main` solo reproduce el fichero de la ronda 16.
- Los checkpoints de las rondas 1 a 12 se retiraron del repositorio el 20 de noviembre de 2026 y solo son recuperables desde el historial (revisión `f0dbd7b7`), lo que afecta a la reproducibilidad.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje; esas categorías no aplican.
- El rendimiento se midió con 64 partidas por emparejamiento y errores estándar de entre ±0,7 y ±6,2 puntos porcentuales; las cifras con error alto (CPU de nivel 4) deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sakuya9t/efz
- Repositorio del juego y las herramientas: https://github.com/sakuya9t/efz
- Documentación de entrenamiento (rondas): https://github.com/sakuya9t/efz/blob/release/next/docs/training-v2.md
- Documentación del formato de fichero y módulos: https://github.com/sakuya9t/efz/blob/release/next/docs/agents.md
- Rama de ejecución requerida: `release/next` (commit afac5c4 o posterior)
- Historial con los checkpoints retirados: revisión `f0dbd7b7` del repositorio
