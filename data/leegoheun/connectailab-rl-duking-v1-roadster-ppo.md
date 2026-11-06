# leegoheun/connectailab-rl-duking-v1-roadster-ppo

## Resumen

`connectailab-rl-duking-v1-roadster-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) para control continuo en un entorno de simulacion 2D. El modelo resuelve una tarea muy concreta: un roadster que cae invertido debe girarse y aterrizar sobre sus ruedas accionando dos propulsores, uno de empuje (intensidad de 0 a 1) y otro de rotacion (de -1 a 1). Lo publica el usuario `leegoheun` bajo el paraguas del programa educativo CONNECT AI LAB (serie "AI CITY BUILDERS", modulo de RL), y no es un modelo de lenguaje ni un transformer generativo: es una politica neuronal que mapea un vector de estado de 7 dimensiones a una accion continua de 2 dimensiones.

El interes practico es acotado pero claro: sirve como ejemplo reproducible de un pipeline completo de RL con Gymnasium y PyTorch, con hiperparametros documentados (1 millon de pasos, 8 entornos en paralelo, clip 0.2, gamma 0.99, GAE lambda 0.95, learning rate 3e-4) y una metrica de exito declarada por el autor del 94 % de aterrizajes en 50 episodios no vistos. Es util para docencia, para comparar configuraciones de PPO y como punto de partida para tareas de control de cuerpo rigido con propulsores.

No hay informacion sobre arquitectura de red, numero de parametros, licencia ni idiomas. El repositorio pesa 0.0 GB segun Hugging Face, lo que sugiere pesos muy pequenos (coherente con una MLP de control) pero el dato exacto no esta disponible. El modelo no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL entrenada con PPO; presumiblemente red neuronal densa, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; estado de 7 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria declarada: pytorch) |

## Arquitectura y entrenamiento

El modelo es una politica de control continuo entrenada con PPO sobre un entorno Gymnasium llamado `로드스터연속` (roadster continuo), implementado en el fichero `로드스터_시뮬레이터.py`. El espacio de observacion tiene 7 componentes: posicion x e y, velocidad en x e y, seno y coseno de la inclinacion, y velocidad angular. El espacio de acciones es continuo y bidimensional: intensidad del propulsor inferior en [0, 1] y par de rotacion en [-1, 1]. La recompensa no se detalla en la model card, pero el objetivo declarado es aterrizar con las ruedas hacia abajo.

Los hiperparametros de entrenamiento estan documentados: PPO con 1.000.000 de pasos totales, 8 entornos ejecutados en paralelo, factor de recorte (clip) de 0.2, descuento gamma de 0.99, lambda de GAE de 0.95 y learning rate de 3e-4. No se especifica el tamano de la red, el numero de capas, la funcion de activacion, el tamano de batch ni el numero de epochs por actualizacion. Tampoco se indica si hubo curriculo, reward shaping o normalizacion de observaciones. No hay innovaciones tecnicas destacables mas alla del uso estandar de PPO con entornos vectorizados.

## Capacidades

- Control continuo de cuerpo rigido: genera acciones de empuje y rotacion en cada paso a partir del estado fisico del roadster.
- Aterrizaje desde posicion invertida: la tarea entrenada consiste en girar el vehiculo y tocar suelo con las ruedas.
- Generalizacion limitada a condiciones iniciales no vistas: el autor reporta 94 % de exito en 50 episodios nuevos.
- Inferencia por paso (politica reactiva): no mantiene memoria explicita ni planificacion a largo plazo mas alla del retorno descontado aprendido.
- No soporta tool calling, function calling, agentes multi-paso, texto, vision ni audio.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo "thinking" ni razonamiento simbolico.

## Casos de uso

- Docencia de RL con PPO: el repositorio sirve como ejemplo completo y reproducible de un pipeline de entrenamiento con Gymnasium, 8 entornos vectorizados e hiperparametros explicitos, ideal para un curso introductorio o un taller practico.
- Baseline para comparar algoritmos: al tener una metrica de exito clara (94 % en 50 episodios), permite evaluar variantes como SAC, TD3 o A2C sobre el mismo entorno y medir diferencias de sample efficiency.
- Estudio de reward shaping: la tarea de aterrizaje invertido es sensible a la forma de la recompensa; el modelo sirve como referencia para experimentar con penalizaciones por velocidad angular o por contacto con el techo.
- Simulacion de control de propulsores en videojuegos: la politica puede integrarse en un motor 2D para pilotar automaticamente vehiculos con empuje vertical y par de rotacion.
- Prototipado de agentes para robotica simplificada: aunque el entorno es 2D, el mapeo estado fisico a accion continua es analogo al de un drone o un rover con actuadores limitados, y sirve para validar lazos de control antes de pasar a simuladores 3D.
- Benchmark de robustez ante condiciones iniciales: al evaluar el 6 % de fallos en episodios no vistos se puede analizar en que rangos de inclinacion o velocidad inicial la politica pierde estabilidad y disenar un currículo de entrenamiento.
- Reproduccion de experimentos educativos: el material de CONNECT AI LAB permite a estudiantes reentrenar desde cero y comparar curvas de aprendizaje con las del autor.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de aterrizaje | 94 % | 50 episodios no vistos durante el entrenamiento |
| Pasos de entrenamiento | 1.000.000 | 8 entornos en paralelo |
| Algoritmo | PPO | clip 0.2, gamma 0.99, GAE lambda 0.95, lr 3e-4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otras politicas sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB, lo que sugiere pesos del orden de kilobytes o pocos megabytes, pero no se confirma el tamano exacto.
- GPU recomendadas: no disponible. Por el tamano aparente, cualquier GPU consumer seria suficiente; incluso CPU deberia bastar para inferencia por paso.
- Compatibilidad con GPU consumer: muy probablemente si (RTX 3060, RTX 4090, etc.), aunque el dato no esta confirmado.
- Opciones de despliegue: al ser un modelo PyTorch de RL, se cargaria con `torch.load` o `torch.jit.load` dentro de un bucle de simulacion; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Para una politica densa de 7 entradas y 2 salidas, la latencia por paso deberia ser del orden de microsegundos en GPU y decenas de microsegundos en CPU, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Tarea | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-duking-v1-roadster-ppo | Aterrizaje de roadster invertido | PPO | no disponible | no aplica | no disponible | Hugging Face |
| connectailab-rl-duking-v1 | Decision con opciones discretas (texto) | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| connectailab-rl-duking-v2-link01 | Locomocion de robot LINK-01 | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| connectailab-rl-duking-v1-link01 | Locomocion de robot LINK-01 | no disponible | no disponible | no aplica | no disponible | Hugging Face / FriendliAI |

Los tres modelos comparables pertenecen al mismo autor y a la misma serie educativa, pero abordan tareas distintas (decision textual, locomocion de robot), por lo que la comparacion directa de rendimiento no es posible con los datos disponibles. No se han identificado politicas publicas equivalentes para la tarea especifica de aterrizaje invertido con propulsores en 2D.

## Limitaciones y advertencias

- Especificidad extrema: la politica solo funciona en el entorno `로드스터연속` y con el mismo esquema de observacion y accion; no es transferible a otros simuladores sin reentrenar.
- Generalizacion acotada: el 94 % se mide en 50 episodios; el 6 % restante indica que existen condiciones iniciales donde falla, y no se documenta cuales.
- Sin informacion de licencia: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de integrarlo en un producto.
- Sin documentacion de arquitectura: no se conoce el tamano de la red ni el formato exacto de los pesos, lo que complica la reproducibilidad y el despliegue.
- Riesgo de sobreajuste al simulador: al entrenarse solo en simulacion, no hay garantia de comportamiento en un sistema fisico con ruido, latencia o dinamica no modelada.
- Sesgos: no aplica en el sentido de sesgos sociales, pero si existe un sesgo hacia las condiciones iniciales cubiertas durante el entrenamiento.
- Alucinacion: no aplica (no genera texto), pero si puede producir acciones erroneas o saturar actuadores en estados fuera de distribucion.
- Sin soporte de texto ni de herramientas: no se puede usar como asistente conversacional ni integrar en pipelines de NLP.
- Repositorio sin descargas ni validacion externa: no hay evidencia de que terceros hayan reproducido el 94 % reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leegoheun/connectailab-rl-duking-v1-roadster-ppo
- Modelo relacionado v1: https://huggingface.co/leegoheun/connectailab-rl-duking-v1
- Modelo relacionado v2-link01: https://huggingface.co/leegoheun/connectailab-rl-duking-v2-link01
- Endpoint de inferencia (v1-link01) en FriendliAI: https://friendli.ai/models/leegoheun/connectailab-rl-duking-v1-link01
- Endpoint de inferencia (v1) en FriendliAI: https://friendli.ai/models/leegoheun/connectailab-rl-duking-v1
