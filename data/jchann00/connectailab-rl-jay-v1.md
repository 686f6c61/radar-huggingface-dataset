# jchann00/connectailab-rl-jay-v1

## Resumen

Connectailab-rl-jay-v1 es un adaptador LoRA de toma de decisiones (decision-making) construido sobre el modelo base Qwen/Qwen3.5-0.8B. Lo desarrolla jchann00 en el marco del proyecto CONNECT TYCOON, una iniciativa de CONNECT AI LAB y AI CITY BUILDERS. El modelo no genera texto libre: lee un estado de simulacion empresarial (situacion, pregunta y lista de opciones etiquetadas) y responde con la letra de una unica opcion, de modo que la probabilidad asignada a cada letra actua como probabilidad de eleccion y el valor maximo como nivel de confianza.

El problema que resuelve es la seleccion de decisiones operativas dentro de un simulador de gestion de empresa (Connect Tycoon). El entrenamiento combina aprendizaje por refuerzo en el simulador (politica profesora entrenada con PPO), aprendizaje supervisado sobre opciones puntuadas y un paso final de refuerzo con normalizacion de ventajas por grupo (GRPO) y termino KL respecto al modelo de partida. El conjunto de datos se compone de 4082 ejemplos de entrenamiento, 832 de validacion y 840 de test.

Es relevante como caso practico de aplicacion de RLHF/GRPO a un dominio de decision estructurado y como ejemplo de adaptacion de un modelo de 0,8B de parametros para una tarea de clasificacion de decisiones con espacio de salida cerrado. La licencia Apache 2.0 y el reducido tamano facilitan su reproduccion en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0,8B en el modelo base; tamano del adaptador LoRA no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de la familia Qwen, sin documentar) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B mediante la libreria PEFT. El pipeline declarado es reinforcement-learning y las etiquetas incluyen GRPO, deep-reinforcement-learning, gymnasium y decision-making. La tarea es de seleccion de una unica opcion entre varias, con salida restringida a la letra de la opcion elegida, lo que la convierte en un problema de clasificacion con espacio de respuestas cerrado.

El proceso de construccion tiene cuatro fases descritas por el autor: (1) una politica pequena se entrena con PPO dentro del simulador Connect Tycoon durante miles de meses y actua como politica profesora; (2) para cada mes operado por la profesora se genera un "cuaderno de problemas" alterando una opcion de decision y reejecutando el mes completo para puntuar cada alternativa; (3) aprendizaje supervisado imitando la opcion de mayor puntuacion; y (4) refuerzo con GRPO, tratando todas las opciones como un grupo, elevando la probabilidad de las opciones cuyo resultado en el simulador supera la media del grupo y anadiendo un termino de divergencia KL respecto al modelo de partida. La distribucion de empresas usada es la etiquetada como `general`, calibrada con datos publicos. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Toma de decisiones con opciones cerradas: recibe un estado, una pregunta y una lista de opciones etiquetadas, y devuelve una unica letra.
- Estimacion de confianza por opcion: la probabilidad asignada a cada letra refleja la probabilidad de eleccion y el maximo indica la confianza.
- Interpretacion de estado estructurado en JSON (`state`, `question`, `options[]`).
- Comportamiento guiado por instruccion de sistema en ingles con instruccion de tratar el contenido del estado como datos y no como instrucciones.
- Operacion sobre simulador de gestion empresarial (Connect Tycoon) orientado a metricas de beneficio, satisfaccion de cliente y riesgo.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso.
- Soporte multilingue limitado al coreano (ko) segun los metadatos.

## Casos de uso

- Seleccion de decisiones en simuladores de gestion: integrar el modelo como agente que elige, en cada turno del simulador Connect Tycoon, una de las opciones disponibles para operar la empresa.
- Investigacion en aprendizaje por refuerzo aplicado a decision-making: usar el adaptador como referencia reproducible de un pipeline PPO-profesor + supervisado + GRPO sobre un modelo de 0,8B.
- Evaluacion de tecnicas de GRPO en dominios de espacio de salida cerrado: comparar la version supervisada y la version reforzada del propio autor (77,3% y 78,0% de acierto respectivamente) para estudiar el efecto del refuerzo.
- Generacion de datos sinteticos de decision empresarial: emplear las decisiones y probabilidades del modelo como fuente de etiquetas para entrenar otros clasificadores o para analisis de sensibilidad de politicas.
- Docencia y formacion en RL: el proyecto incluye un cuaderno de Google Colab y material de cursos, por lo que el modelo sirve como ejemplo practico en cursos de refuerzo y agentes.
- Analisis de politica de decision con incertidumbre: explotar las probabilidades por opcion para detectar situaciones ambiguas (distribucion plana) frente a situaciones claras (maximo dominante).
- Prototipado de agentes locales: por su tamano (0,8B de parametros) puede ejecutarse en portatiles o equipos modestos para experimentar con flujos de decision automatizada.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjunto de test de 840 problemas, segun la propia model card; el numero de problemas por split es train 4082, valid 832, test 840):

| Modelo | Tasa de acierto | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en operaciones reales de tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,4% | 2,67 | no disponible | no disponible |
| Aprendizaje supervisado | 78,0% | 1,88 | no disponible | no disponible |
| Refuerzo (GRPO) | 77,3% | 1,92 | 11,49 millones de wones | 71% (145/177) |

El propio autor indica que se trata de un primer experimento, que la evaluacion de operacion de empresa se basa en la media de dos meses no vistos (muestra pequena) y que el modelo todavia esta por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1,6 GB en fp16 para los 0,8B de parametros del modelo base, mas el pequeno margen del adaptador LoRA y las activaciones. En cuantizacion de 8 bits la cifra baja aproximadamente a 0,8 GB y en 4 bits a unos 0,4-0,5 GB (estimaciones derivadas del tamano, no publicadas por el autor).
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060 y superiores) y tambien en CPU.
- GPU recomendadas para despliegue comodo: RTX 3060 12 GB, RTX 4090, A100 o H100 si se busca throughput alto en procesamiento por lotes.
- Opciones de despliegue: al ser un adaptador PEFT, la via documentada es `transformers` + `peft`. Se puede servir con vLLM o TGI tras fusionar el adaptador en el modelo base. No se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1 (este) | 0,8B (base) + LoRA | no disponible | 77,3% de acierto, arrepentimiento 1,92 en test | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | 30,4% de acierto, arrepentimiento 2,67 | no disponible | HuggingFace |
| connectailab-rl-jay-v1-teacher | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Modelos de decision genericos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de modelos comparables publicos de decision-making empresarial de este tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion y educativo: el propio autor advierte que es un modelo sobre un simulador sintetico de empresa y que debe revalidarse con los datos reales de cada organizacion antes de usarlo para decisiones de negocio.
- Espacio de salida cerrado: solo devuelve la letra de una opcion de la lista proporcionada; no genera explicaciones ni texto libre.
- Sesgos: la distribucion de empresas usada es `general`, calibrada con datos publicos; no se documentan analisis de sesgo ni de equidad.
- Riesgo de alucinacion: reducido en cuanto al formato (salida restringida a una letra), pero puede elegir una opcion incorrecta con alta confianza; las probabilidades no estan calibradas de forma explicita.
- Limitacion de idioma: los metadatos declaran unicamente coreano (ko); no se garantiza un comportamiento correcto en otros idiomas.
- Rendimiento inferior a la politica profesora: el autor indica que el modelo reforzado queda por debajo de la profesora PPO del simulador.
- Evaluacion con muestra pequena: la metrica de operacion de empresa se calcula sobre la media de dos meses no vistos.
- Diferencia minima entre supervisado y reforzado: el paso de GRPO incluso empeora ligeramente la tasa de acierto (77,3% frente a 78,0%) y el arrepentimiento (1,92 frente a 1,88) en el test reportado.
- Licencia: Apache 2.0, permite uso comercial, pero conviene verificar tambien los terminos del modelo base Qwen/Qwen3.5-0.8B.
- Repositorio sin descargas ni valoraciones en el momento de la consulta y con tamano de repo de 0,0 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jchann00/connectailab-rl-jay-v1
- Modelo profesora: https://huggingface.co/jchann00/connectailab-rl-jay-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo AI: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
