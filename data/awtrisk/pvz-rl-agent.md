# awtrisk/pvz-rl-agent

## Resumen

pvz-rl-agent es una politica de aprendizaje por refuerzo entrenada para jugar a Plants vs. Zombies en el modo Survival Endless (supervivencia sin fin). Lo desarrolla el usuario awtrisk y se publica como el mejor checkpoint obtenido dentro del proyecto pvz-rl-env, un entorno Gymnasium construido mediante un puente pybind11 sobre el motor real del juego. No es un modelo de lenguaje: es un agente de control que recibe observaciones espaciales del tablero y emite acciones discretas sobre el despliegue de plantas.

Tecnicamente combina un codificador convolucional con un bloque Mamba (modelo de espacio de estados, SSM) y una cabeza actor factorizada sobre un espacio de acciones `Discrete(496)` enmascarado por legalidad. Se entrena con PPO de recompensa dispersa y anclaje KL, partiendo de una inicializacion por clonacion de comportamiento a partir de un profesor heuristico escrito a mano. La observacion v1 tiene forma `(5, 9, 36)` mas 24 variables globales, y el mazo de entrenamiento incluye diez tipos de planta identificados por sus indices internos.

Su relevancia es acotada pero clara: es un ejemplo reproducible de como combinar SSM, PPO y mascaras de legalidad en un entorno de control de accion discreta grande, con resultados medidos de forma determinista sobre paneles emparejados de 20 semillas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano reportado de 0.0 GB, lo que sugiere un checkpoint de pesos muy ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador convolucional + bloque Mamba (SSM), cabeza actor factorizada sobre `Discrete(496)` enmascarado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observacion `(5, 9, 36)` espacial + 24 globales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch `.pt`, un unico payload `{"agent_state": state_dict}` |
| Algoritmo de entrenamiento | PPO con recompensa dispersa y anclaje KL |
| Inicializacion | Clonacion de comportamiento desde profesor heuristico escrito a mano |
| Espacio de acciones | `Discrete(496)`, enmascarado por legalidad del entorno |
| Entorno | Gymnasium sobre puente pybind11 al motor real de Plants vs. Zombies |
| Mazo de entrenamiento | Sunflower, Twin Sunflower, Melon-pult, Winter Melon, Gloom-shroom, Snow Pea, Pumpkin, Garlic, Squash, Jalapeno (`[1, 41, 39, 44, 42, 5, 30, 36, 17, 20]`) |
| Recurrente | Si (bloque SSM) |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La red es un actor-critico (`PvZActorCritic`) que procesa la observacion v1: un tensor espacial de forma `(5, 9, 36)` mas 24 variables globales. Un codificador convolucional extrae caracteristicas del tablero (9 filas de carriles por 36 columnas de celdas, con 5 canales) y un bloque Mamba (modelo de espacio de estados) aporta la memoria temporal sobre la secuencia de observaciones. La cabeza actor esta factorizada y opera sobre un espacio de acciones discreto de 496 elementos, con mascara de legalidad proporcionada por el entorno, de modo que las acciones ilegales quedan excluidas del muestreo.

El entrenamiento usa PPO con recompensa dispersa y un termino de anclaje KL, arrancando desde una inicializacion por clonacion de comportamiento de un profesor heuristico escrito a mano. Esta combinacion busca evitar el colapso de exploracion tipico de la recompensa dispersa en episodios largos: la clonacion aporta una politica inicial razonable y el anclaje KL limita la deriva respecto a esa referencia. La model card no detalla el numero de pasos de entorno, el tamano del dataset de clonacion ni los hiperparametros.

Un hallazgo destacable documentado por el autor no proviene del entrenamiento sino del enmascaramiento: al evaluar con un "mazo de cafe" (slot 7 sustituido por Coffee Bean), la politica nunca entreno con Coffee Bean, pero la mascara de legalidad redirige sus acciones del slot 7 hacia jugadas legales de Coffee Bean sobre setas dormidas, despertandolas de forma util. El autor lo describe explicitamente como una habilidad gratuita derivada del enmascaramiento y no del aprendizaje.

## Capacidades

- Control secuencial en tiempo real dentro del motor real de Plants vs. Zombies, mediante el puente pybind11 del entorno pvz-rl-env.
- Juego autonomo del modo Survival Endless partiendo de una configuracion de 3000 de sol.
- Seleccion de acciones sobre un espacio discreto grande (`Discrete(496)`) con respeto estricto de la mascara de legalidad del entorno.
- Memoria temporal sobre la partida gracias al bloque Mamba/SSM, lo que permite reaccionar a la evolucion de oleadas.
- Despliegue de un mazo concreto de diez plantas: Sunflower, Twin Sunflower, Melon-pult, Winter Melon, Gloom-shroom, Snow Pea, Pumpkin, Garlic, Squash y Jalapeno.
- Transferencia parcial observada a configuraciones no vistas: el uso funcional de Coffee Bean en el mazo de cafe sin haber sido entrenado con esa planta.
- No dispone de tool calling, function calling, capacidades de agente multi-paso sobre herramientas, vision general, audio, ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Politica de referencia para investigacion en RL sobre SSM: sirve como baseline reproducible para comparar Mamba frente a alternativas recurrentes (LSTM, GRU, Transformer) en un entorno de control con acciones discretas grandes y recompensa dispersa.
- Estudio del enmascaramiento de acciones: el caso del mazo de cafe es un ejemplo documentado de como una mascara de legalidad puede inducir comportamiento funcional no entrenado; es material directo para analizar el efecto de las mascaras en la politica aprendida.
- Evaluacion de clonacion de comportamiento como inicializacion de PPO: el pipeline (profesor heuristico -> clonacion -> PPO con anclaje KL) permite medir cuanto aporta la inicializacion frente a PPO puro en tareas de horizonte largo.
- Suites de regresion del entorno: las suites de completado de fase 1 (21 oleadas, 100 por ciento de completados) funcionan como prueba de humo determinista para detectar regresiones en el motor o en el puente pybind11 tras cambios en el entorno.
- Generacion de material de demostracion: el script `scripts/record.py` permite grabar partidas desde un checkpoint con `--start-sun 3000`, util para divulgacion, docencia o analisis cualitativo de la politica.
- Laboratorio docente de RL: el proyecto permite que estudiantes recorran el ciclo completo (entorno Gymnasium, espacio de acciones enmascarado, PPO, evaluacion con semillas emparejadas) sobre un dominio con estado rico y resultados medibles.
- Comparacion de mazos y estrategias: la evaluacion con mazo de entrenamiento frente a mazo de cafe permite estudiar la sensibilidad de la politica a cambios en el conjunto de acciones disponibles.
- Base para investigacion en transferencia: la discrepancia entre el mazo de entrenamiento y el de evaluacion abre la puerta a experimentos de generalizacion y adaptacion de mazos.

## Benchmarks y rendimiento

Los unicos resultados publicados son metricas del propio juego, medidas de forma determinista, con inicio en la oleada 1 y sobre paneles emparejados de 20 semillas:

| Configuracion | Oleada absoluta media | Mediana |
|---|---|---|
| Endless, 3000 de sol, mazo de entrenamiento | 49.7 | 50.5 |
| Endless, 3000 de sol, mazo de cafe (slot 7 -> Coffee Bean) | 72.1 | 61.5 |
| Suites de completado de fase 1 (3000 de sol) | 21.0, 100 por ciento de completados | 21 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un modelo de lenguaje y esos benchmarks no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio reporta un tamano de 0.0 GB, lo que indica que el checkpoint de pesos es muy pequeno, pero el autor no publica cifras de memoria.
- GPU recomendadas: no disponible. No hay cifras oficiales.
- Compatibilidad con GPU de consumo: no confirmada por el autor. Dado el tamano reducido del checkpoint y que la inferencia se ejecuta con PyTorch estandar, es plausible que quepa en GPUs de consumo, pero no hay confirmacion publicada.
- Opciones de despliegue: las de la model card son PyTorch directo (`torch.load(..., weights_only=True)`) y el script `scripts/record.py`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Requisitos del entorno: es necesario clonar pvz-rl-env, compilar el puente hacia el motor del juego y aportar los ficheros `main.pak` y `properties/` propios, segun el README del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (agentes de RL para Plants vs. Zombies con arquitectura convolucional mas Mamba). No es equiparable a modelos de lenguaje ni a modelos generativos, por lo que una comparativa de parametros, contexto o licencia frente a LLMs carece de sentido. Se indica, por tanto: no disponible.

## Limitaciones y advertencias

- Especifico de un unico juego y de una version concreta del motor: la politica asume la observacion v1 `(5, 9, 36)` mas 24 globales y el espacio de acciones `Discrete(496)` del entorno pvz-rl-env. Fuera de ese entorno no es reutilizable.
- Mazo de entrenamiento cerrado: solo se entreno con las diez plantas listadas. El rendimiento con otras plantas o mazos no esta garantizado y depende del enmascaramiento de legalidad.
- El resultado del mazo de cafe (72.1 de media frente a 49.7) no debe interpretarse como una mejora de la politica: es un artefacto del enmascaramiento sobre acciones del slot 7 cuya contrapartida real (el cambio de mazo) no esta desglosada en la model card.
- Requiere artefactos propietarios del juego: el propio README indica que hay que aportar `main.pak` y `properties/` propios. Esto condiciona la reproducibilidad y puede chocar con los terminos de uso del juego original.
- Licencia GPL-3.0: cualquier obra derivada distribuida debe cumplir las obligaciones de copyleft de la GPL-3.0, incluida la publicacion del codigo fuente correspondiente. Es una restriccion relevante para integracion en productos propietarios.
- Cero adopcion verificable: 0 descargas y 0 likes, sin validacion externa independiente de los resultados.
- No hay datos de sesgos, alucinacion o limites de contexto en el sentido habitual, porque no es un modelo de lenguaje; las advertencias aplicables son de generalizacion, reproducibilidad y licencia.
- Resultados medidos solo en modo determinista sobre 20 semillas emparejadas; no se documenta el comportamiento estocastico ni la varianza entre ejecuciones fuera de ese protocolo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/awtrisk/pvz-rl-agent
- Repositorio del entorno: https://github.com/awtrisk/pvz-rl-env
- Script de grabacion: `scripts/record.py` dentro del repositorio pvz-rl-env
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
