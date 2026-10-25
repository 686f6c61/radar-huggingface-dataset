# Abuudiii/taxi

## Resumen

`Abuudiii/taxi` no es un modelo de lenguaje: es un agente de reinforcement learning tabular entrenado con Q-learning sobre el entorno `Taxi-v3` de Gymnasium y publicado en HuggingFace por el usuario Abuudiii el 25 de octubre de 2026. El repositorio contiene un único artefacto serializado en pickle (`q-learning.pkl`) que se carga con `load_from_hub` y se evalúa contra el entorno original. No hay pesos en safetensors, no hay tokenizador, no hay ventana de contexto y no hay arquitectura transformer: la política es una tabla de valores Q indexada por estado y accion.

El problema que resuelve es el clásico problema del taxi: un agente debe recoger a un pasajero en una de cuatro ubicaciones y dejarlo en su destino dentro de una cuadricula de 5x5, con recompensa de -1 por paso, +20 por entrega correcta y -10 por acciones ilegales. El autor declara una recompensa media de 7,52 ± 2,73 sobre `Taxi-v3`, una cifra que no está verificada por HuggingFace y que no va acompañada de hiperparámetros, semillas ni curva de aprendizaje.

Su relevancia es limitada y fundamentalmente didáctica: sirve como ejemplo mínimo de cómo se publica un agente de RL en el Hub y como baseline reproducible para prácticas de Q-learning. Con 0 descargas y 0 likes en el momento del análisis, y sin licencia declarada, no es un artefacto apto para producción ni para uso comercial sin aclarar previamente los términos legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (off-policy, TD(0)); no es una red neuronal ni un transformer |
| Parametros totales | no disponible (el autor no declara el numero de entradas de la tabla Q; el repositorio ocupa 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el agente opera sobre los estados discretos de `Taxi-v3` (500 estados y 6 acciones segun la definicion estandar del entorno) |
| Tipos de cuantizacion | no aplica (tabla de valores en precision nativa de Python/NumPy) |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje) |
| Licencia | no disponible (no se declara en la model card ni en los metadatos del repositorio) |
| Formato de pesos | pickle (`.pkl`); fichero `q-learning.pkl` cargado via `load_from_hub` |
| Tarea (pipeline) | `reinforcement-learning` |
| Entorno | `Taxi-v3` (Gymnasium, familia toy text) |
| Framework de carga | `load_from_hub` (utilidad del ecosistema de agentes del Hub) |
| Descargas / likes | 0 / 0 en el momento del analisis |
| Fecha de creacion / actualizacion | 2026-10-25T19:41:51Z / 2026-10-25T19:42:20Z |

## Arquitectura y entrenamiento

La arquitectura es una tabla Q tabular clasica: para cada par (estado, accion) se almacena un valor de accion estimado, actualizado mediante Q-learning con la regla de diferencias temporales de un paso. Al tratarse de un MDP finito y pequeno, la tabla puede representarse de forma exacta sin aproximacion funcional, lo que evita problemas de generalizacion pero limita el agente estrictamente a la dinamica de `Taxi-v3`. La model card no especifica la politica de exploracion empleada (presumiblemente epsilon-greedy), ni la tasa de aprendizaje, el factor de descuento, el numero de episodios, el decaimiento de epsilon ni la semilla aleatoria utilizada.

Tampoco se documenta la composicion del dataset de entrenamiento, ya que no existe tal dataset: el agente aprende por interaccion con el simulador del entorno. No hay RLHF, DPO, SFT ni ninguna etapa de alineacion, y no se describe ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, decodificacion de multiples tokens). El unico artefacto publicado es el fichero pickle con la tabla Q serializada, de un tamano inferior a 0,1 GB segun los metadatos del repositorio.

## Capacidades

- Resolucion de episodios completos del entorno `Taxi-v3`: recogida y entrega de pasajero en la cuadricula con las seis acciones discretas del entorno (mover en cuatro direcciones, recoger y dejar).
- Seleccion de accion greedy a partir de la tabla Q aprendida; no se documenta si el checkpoint expone la politica epsilon-greedy o solo la politica determinista.
- Evaluacion mediante el pipeline `reinforcement-learning` del Hub y la metrica `mean_reward`.
- Carga programatica mediante `load_from_hub(repo_id="Abuudiii/taxi", filename="q-learning.pkl")` seguida de `gym.make(model["env_id"])`.
- No soporta generacion de texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso fuera del propio bucle del MDP, ni planificacion simbolica, ni uso de memoria externa.
- No tiene capacidades multilingues: no procesa ni genera lenguaje natural.
- No dispone de modo "thinking", audio, video ni ninguna modalidad adicional.

## Casos de uso

- Docencia de reinforcement learning: el par `Taxi-v3` + Q-learning tabular es el ejemplo canonico para explicar la ecuacion de Bellman y la actualizacion TD(0); este checkpoint permite a los alumnos cargar una tabla ya entrenada y compararla con la suya sin esperar al entrenamiento.
- Baseline en experimentos de RL: sirve como referencia inferior frente a metodos con aproximacion funcional (DQN, PPO) en el mismo entorno, siempre que se documente la semilla y el numero de episodios, dato que aqui falta.
- Pruebas de integracion de pipelines de evaluacion: util para validar que un script de `evaluate` o un runner interno es capaz de descargar un artefacto del Hub, deserializarlo y ejecutar `gym.make` con el `env_id` correcto.
- Verificacion de herramientas de serializacion: permite comprobar el comportamiento de `load_from_hub` y de las utilidades de carga de pickles del ecosistema HuggingFace en entornos controlados.
- Demostracion de agentes en notebooks y tutoriales: al ocupar menos de 0,1 GB y ejecutarse en CPU, se puede incluir en un notebook introductorio sin dependencias de GPU.
- Reproduccion de resultados docentes: si se conoce el entorno y la politica es determinista, el agente se puede ejecutar de forma repetida para ilustrar la varianza entre episodios (declarada como ± 2,73).
- No es adecuado para atencion al cliente, generacion de codigo, analisis documental ni ninguna tarea de lenguaje: el artefacto no contiene un modelo de lenguaje.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (metrica no verificada por HuggingFace):

| Benchmark | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Reinforcement learning (Q-learning) | Taxi-v3 | mean_reward | 7,52 ± 2,73 | No |

No se han publicado en la informacion disponible resultados comparativos con otros agentes (SARSA, DQN, PPO) sobre `Taxi-v3`, ni curvas de aprendizaje, ni numero de episodios de evaluacion, ni desviacion por semilla. Tampoco se aportan datos de MMLU, HumanEval o GSM8K, que no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia consiste en un indexado de tabla en memoria y se ejecuta en CPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; no se obtiene ninguna ventaja medible con A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: irrelevante; el cuello de botella es el bucle del simulador de Gymnasium, no el calculo matricial.
- Memoria RAM: no declarada; el repositorio ocupa 0,0 GB, por lo que el fichero pickle es de tamano reducido (coherente con una tabla Q de como maximo unos pocos miles de entradas).
- Opciones de despliegue: Python con `gymnasium` (o `gym` en versiones antiguas) y las utilidades de carga del Hub. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan disenados para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por la naturaleza del artefacto, la latencia por paso vendria dominada por el `step()` del entorno (orden de microsegundos a decimas de milisegundo) y no por el agente.

## Comparativa con modelos similares

| Criterio | Abuudiii/taxi | SARSA tabular sobre Taxi-v3 | DQN sobre Taxi-v3 | PPO sobre Taxi-v3 |
|---|---|---|---|---|
| Tipo de algoritmo | Off-policy, TD(0) | On-policy, TD(0) | Off-policy, aproximacion con red neuronal | On-policy, gradient policy |
| Representacion | Tabla Q | Tabla Q | Red neuronal | Red neuronal |
| Parametros | no disponible | no disponible | no disponible | no disponible |
| Contexto | no aplica | no aplica | no aplica | no aplica |
| Resultado publicado en la informacion disponible | 7,52 ± 2,73 (no verificado) | no disponible | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible | no disponible |
| Disponibilidad | Repositorio publico en el Hub | no disponible | no disponible | no disponible |

No se dispone de artefactos comparables identificados en la informacion proporcionada; las columnas de alternativas se incluyen unicamente como marco conceptual de comparacion y no como resultados medidos.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial, redistribucion o modificacion; es un bloqueante para cualquier despliegue en produccion.
- Riesgo de seguridad en la deserializacion: un fichero `.pkl` puede ejecutar codigo arbitrario al cargarse. Solo debe abrirse desde una fuente de confianza o dentro de un sandbox; para produccion seria preferible un formato de pesos seguro.
- Ausencia de generalizacion: la politica esta indexada a los estados de `Taxi-v3`; no transfiere a otros entornos ni a variantes del problema.
- Metricas no verificadas: el valor 7,52 ± 2,73 es una declaracion del autor, sin semilla, sin numero de episodios y sin script de evaluacion reproducible.
- Falta de documentacion de hiperparametros: no se puede reproducir el entrenamiento ni auditar la politica de exploracion.
- Sesgos: no aplican sesgos linguisticos ni sociales por no tratar lenguaje, pero si el sesgo inductivo de la discretizacion del entorno y de la politica de exploracion empleada durante el entrenamiento.
- Alucinacion: no aplica en el sentido habitual; el agente no genera texto. El fallo equivalente seria una accion suboptima o un bucle en el entorno, coherente con la desviacion de ± 2,73 en recompensa.
- Limitaciones de idioma y contexto: ninguna, porque no existen; el artefacto no procesa texto.
- Metadatos inconsistentes: la fecha de creacion declarada (2026-10-25) es posterior a la fecha habitual de analisis, lo que sugiere un posible error de marca temporal o un repositorio de pruebas; conviene verificar antes de citarlo.
- Senales de baja madurez: 0 descargas, 0 likes, repositorio de 0,0 GB y model card minima; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abuudiii/taxi
- Documentacion del entorno Taxi-v3 de Gymnasium (referencia externa, no incluida en los resultados de busqueda proporcionados): https://gymnasium.farama.org/environments/toy_text/taxi/
- Paper, blog, repositorio de codigo o demo: no disponible. Los resultados de busqueda web proporcionados no contienen ninguna referencia relevante al modelo (devuelven unicamente paginas de un servicio de credito al consumo, sin relacion con el artefacto).
