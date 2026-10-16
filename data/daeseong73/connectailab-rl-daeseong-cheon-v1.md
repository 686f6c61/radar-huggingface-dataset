# Daeseong73/connectailab-rl-daeseong-cheon-v1

## Resumen

connectailab-rl-daeseong-cheon-v1 es un adaptador LoRA entrenado con aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3.5-0.8B. Lo publica el usuario Daeseong73 dentro del proyecto CONNECT AI LAB en colaboración con AI CITY BUILDERS. No es un modelo conversacional general: resuelve una única tarea muy acotada, leer un escenario de decisión empresarial (estado, pregunta y lista de opciones etiquetadas A/B/C...) y devolver exactamente la letra de la opción elegida.

El interés técnico está en su pipeline de entrenamiento: se entrena primero una política pequeña con PPO dentro del simulador CONNECT TYCOON, esa política genera un conjunto de preguntas con puntuación por opción, se hace aprendizaje supervisado sobre la mejor opción y, finalmente, se aplica GRPO con ventaja normalizada por grupo y penalización KL respecto al modelo de partida. El resultado es un adaptador de muy bajo coste (el repositorio ocupa 0,0 GB) que cabe en cualquier GPU de consumo.

Es relevante como caso de estudio reproducible de RL aplicado a modelos por debajo de 1.000 millones de parámetros, con datos, particiones y métricas publicadas por el autor (4.082 preguntas de entrenamiento, 832 de validación, 840 de test) y con una licencia Apache 2.0 que facilita su reutilización experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 0,8 mil millones en el modelo base Qwen3.5-0.8B; el adaptador anade un numero de parametros entrenables no especificado |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene el adaptador en safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | peft |
| Pipeline declarado | reinforcement-learning |
| Metodo de entrenamiento | SFT + GRPO (con politica profesora entrenada con PPO en simulador) |
| Tamano del repositorio | 0,0 GB |
| Fecha de publicacion | 2026-10-15, segun la ficha de HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only de la familia Qwen de 0,8 mil millones de parametros. No se documentan en la informacion disponible ni la configuracion exacta de capas, ni el mecanismo de atencion, ni la longitud de contexto del base. El adaptador se carga con `PeftModel.from_pretrained` sobre `Qwen/Qwen3.5-0.8B` y no modifica la arquitectura subyacente.

El entrenamiento sigue cuatro fases descritas por el autor: (1) se entrena una politica pequena con PPO dentro del simulador CONNECT TYCOON, que actua como profesora; (2) por cada mes simulado se genera una pregunta de decision y se reejecuta el mes completo variando la opcion elegida, asignando una puntuacion a cada alternativa; (3) se realiza aprendizaje supervisado imitando la opcion con mayor puntuacion; (4) se aplica GRPO viendo todas las opciones como un grupo, aumentando la probabilidad de las que superan la media del grupo y anadiendo una penalizacion KL contra el modelo de partida. Los datos se generan sobre una distribucion de empresas de tipo `general`, ajustada segun el autor con datos publicos.

## Capacidades

- Seleccion de una unica opcion entre varias: recibe un JSON con `state`, `question` y `options` (cada una con `label`, `key` y `description`) y devuelve una sola letra.
- Recuperacion de una distribucion de probabilidad sobre las opciones a partir de las probabilidades del token correspondiente a cada letra; el valor maximo actua como medida de confianza.
- Decision secuencial en un entorno simulado de gestion empresarial (produccion, dinero, satisfaccion e incidentes).
- Ejecucion local: al estar basado en un modelo de 0,8 mil millones de parametros, puede desplegarse sin infraestructura dedicada.
- Soporte multilingue: no disponible. El unico idioma declarado es el coreano.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo esta especializado en una decision puntual por turno.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.

## Casos de uso

- Simuladores de gestion empresarial: el modelo actua como agente de decision dentro de un bucle de simulacion (por ejemplo, CONNECT TYCOON), eligiendo una opcion por turno segun el estado de la compania simulada. Es su caso de uso original y el unico validado por el autor.
- Investigacion en aprendizaje por refuerzo: sirve como referencia reproducible para comparar SFT frente a GRPO en modelos de menos de 1.000 millones de parametros, con particiones de datos y metricas publicadas.
- Evaluacion de tecnicas de RLHF/GRPO en entornos con recompensa escasa: el modelo permite medir la diferencia entre la politica profesora (PPO) y la politica destilada con RL, tal como reporta el autor.
- Prototipos de sistemas de recomendacion de acciones: al devolver probabilidades por opcion, puede integrarse en un motor que ordene alternativas por confianza antes de que un humano decida.
- Educacion y cursos de RL aplicado: los materiales asociados (cuaderno de Colab, repositorio en GitHub, canal de YouTube) permiten reproducir el entrenamiento paso a paso en un entorno gratuito.
- Pruebas de despliegue local en hardware modesto: util para validar flujos de carga de adaptadores PEFT, fusion de pesos y empaquetado sin depender de GPU de datacenter.
- Generacion de datos sinteticos de decision: el modelo puede etiquetar escenarios empresariales sinteticos con una opcion candidata para crear conjuntos de evaluacion adicionales.
- Evaluacion de robustez frente a inyeccion de prompt: el propio autor define una instruccion de sistema que obliga a tratar el texto del estado como datos, lo que permite probar defensas frente a instrucciones maliciosas embebidas en la entrada.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el propio autor en la model card, obtenidos sobre su simulador. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion proporcionada.

| Modelo | Precision en preguntas de test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,4 % | 2,67 | no disponible | no disponible |
| Aprendizaje supervisado (SFT) | 77,7 % | 1,93 | no disponible | no disponible |
| Aprendizaje por refuerzo (GRPO) | 77,4 % | 1,93 | 12.180.000 won | 70 % (145/177) |

El propio autor advierte de que la operacion de empresa se evalua sobre una media de dos meses no vistos, que la muestra es pequena y que el modelo sigue por debajo de la politica profesora entrenada con PPO. Estas cifras no son comparables con benchmarks publicos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 mil millones de parametros ocupa aproximadamente 1,6 GB en precision FP16 (mas activaciones y cache de claves/valores, en torno a 2-3 GB en total); en cuantizacion de 4 bits baja a alrededor de 0,5-1 GB, aunque el repositorio solo distribuye el adaptador y obliga a cuantizar o fusionar por separado.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o incluso una GTX 1650 pueden ejecutarlo. Las A100 o H100 no aportan ventaja practica para este tamano.
- Cabe en GPU de consumo: si, y tambien en equipos con GPU integrada o en CPU mediante llama.cpp tras fusionar el adaptador con el modelo base.
- Opciones de despliegue: `transformers` junto con `peft` es la via documentada por el autor; para otros runners hay que fusionar primero el adaptador (`merge_and_unload`) y exportar el modelo resultante a GGUF para llama.cpp u Ollama, o desplegarlo con vLLM o TGI como modelo denso estandar.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia, tokens por segundo ni capacidad de peticiones concurrentes.
- Nota operativa: como el repositorio solo contiene el adaptador, cualquier despliegue requiere descargar aparte el modelo base Qwen/Qwen3.5-0.8B.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores de decision comparables en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio pipeline y a su modelo base.

| Modelo | Parametros | Contexto | Precision en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-daeseong-cheon-v1 (GRPO) | 0,8 mil millones (base) mas adaptador | no disponible | 77,4 % | apache-2.0 | HuggingFace (adaptador) |
| Variante SFT del mismo pipeline | 0,8 mil millones (base) mas adaptador | no disponible | 77,7 % | apache-2.0 (presumible) | solo reportada en la model card |
| Qwen/Qwen3.5-0.8B sin ajuste | 0,8 mil millones | no disponible | 30,4 % | segun el modelo base | HuggingFace |
| Politica profesora PPO (simulador) | no disponible | no disponible | superior a la del modelo, sin cifra publicada | no disponible | no disponible |
| Otros modelos de decision de 0,8-1.000 millones de parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Muestra muy pequena en la evaluacion: la operacion de empresa se mide sobre una media de dos meses no vistos, segun reconoce el autor.
- Rendimiento inferior a la politica profesora entrenada con PPO en el simulador, es decir, el adaptador no alcanza todavia el techo de su propio pipeline.
- GRPO no mejora la precision respecto a SFT (77,4 % frente a 77,7 %) y solo iguala el arrepentimiento (1,93 en ambos casos); la ganancia se observa en el beneficio simulado y en la reduccion de perdidas en transacciones, no en la tasa de acierto.
- Modelo de un solo proposito: no es un asistente general, no esta disenado para generar texto libre y su salida se restringe a una letra de opcion. Usarlo fuera de ese formato no esta soportado.
- Idioma unico: solo se declara coreano. No hay evidencia de funcionamiento en castellano u otros idiomas.
- Sesgos conocidos: no disponibles. Los datos provienen de un simulador con una distribucion de empresas de tipo `general` ajustada con datos publicos, por lo que los sesgos de esa distribucion se trasladan al modelo.
- Riesgo de alucinacion: al devolver siempre una letra, el modo de fallo no es inventar contenido, sino elegir una opcion incorrecta con alta confianza; las probabilidades por opcion deben calibrarse antes de cualquier uso critico.
- Riesgo de inyeccion de prompt: el propio autor incluye una instruccion de sistema que ordena tratar el texto de `state` como datos y no como instrucciones, lo que indica que el vector de ataque es conocido y relevante.
- Licencia: el adaptador se publica bajo apache-2.0, pero el uso comercial tambien queda sujeto a la licencia del modelo base Qwen/Qwen3.5-0.8B, que debe verificarse de forma independiente.
- Advertencia explicita del autor: es un modelo de investigacion y educacion sobre un simulador de empresa sintetico; antes de usarlo para decisiones reales de negocio hay que revalidarlo con los registros de la empresa concreta.
- Repositorio practicamente vacio en peso (0,0 GB) y sin descargas ni validacion de terceros en el momento de la consulta: no hay evidencia externa que confirme los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daeseong73/connectailab-rl-daeseong-cheon-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab para reproducir el entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS, curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
