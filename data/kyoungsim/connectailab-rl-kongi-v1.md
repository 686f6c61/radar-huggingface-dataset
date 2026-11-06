# kyoungsim/connectailab-rl-kongi-v1

## Resumen

connectailab-rl-kongi-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kyoungsim en el marco del proyecto CONNECT AI LAB x AI CITY BUILDERS. No es un modelo de lenguaje generativo de proposito general, sino un modelo de toma de decisiones (decision-making) especializado: recibe un estado de situacion, una pregunta y un conjunto de opciones etiquetadas, y devuelve unicamente la letra de la opcion seleccionada. Su dominio de aplicacion es la simulacion de gestion empresarial CONNECT TYCOON, donde un agente debe operar una compania mes a mes tomando decisiones discretas.

El modelo resuelve un problema acotado: convertir un modelo de lenguaje pequeno (0.8B parametros) en un policy que maximice una recompensa definida por un simulador, en lugar de generar texto libre. Para ello combina aprendizaje supervisado sobre datos sinteticos generados por un profesor PPO y un posterior ajuste con GRPO (Group Relative Policy Optimization) con normalizacion por grupo y penalizacion KL respecto al modelo de partida. La relevancia actual reside en que demuestra un pipeline completo de RL sobre un LLM pequeno para tareas de decision estructurada, con licencia Apache 2.0 y pesos en formato PEFT/safetensors.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano del repo es practicamente nulo (0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar subidos o son de muy pocos MB) y la model card esta redactada en coreano. El modelo esta etiquetado para el idioma coreano y su uso previsto es de investigacion y educacion, no de produccion empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0.8B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3.5-0.8B por separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 0.8B parametros (Qwen3.5-0.8B), sobre el que se anade un adaptador LoRA entrenado con la libreria PEFT. El entrenamiento se describe en cuatro fases: (1) un policy pequeno se entrena con PPO dentro del simulador CONNECT TYCOON durante miles de meses simulados y actua como profesor; (2) se genera un "cuaderno de problemas" reejecutando cada mes con cada opcion alternativa para puntuar cada eleccion; (3) aprendizaje supervisado sobre la opcion de mayor puntuacion; (4) ajuste con GRPO, tratando todas las opciones de una decision como un grupo, normalizando las ventajas por grupo y anadiendo una penalizacion KL contra el modelo de partida.

El conjunto de datos se compone de decisiones generadas en la distribucion de empresa `general` (ajustada con datos publicos), con 4.082 ejemplos de entrenamiento, 832 de validacion y 840 de prueba. El formato de entrada es un JSON con `state`, `question` y `options` (cada una con `label`, `key` y `description`), y la salida esperada es una unica letra. El prompt de sistema instruye explicitamente a tratar el texto dentro de `state` como datos y no como instrucciones, lo que mitiga inyeccion de prompt en el estado simulado.

## Capacidades

- Toma de decisiones discretas: selecciona una unica opcion (letra) entre las presentadas en el campo `options`.
- Calibracion de probabilidad: la probabilidad asignada a cada letra se interpreta como probabilidad de eleccion y el maximo como confianza.
- Razonamiento sobre estado estructurado: procesa JSON con estado, pregunta y opciones.
- Resistencia basica a inyeccion de prompt: el prompt de sistema indica tratar el contenido de `state` como datos.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso nativo: no disponible; el modelo resuelve una decision por invocacion.
- Capacidades multilingues: limitadas al coreano segun la model card.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Simulacion de gestion empresarial: integrado en CONNECT TYCOON para que un agente opere una compania mes a mes eligiendo entre opciones discretas; es su caso de uso original y el unico validado por el autor.
- Investigacion en RL para LLMs: servir de referencia reproducible de un pipeline PPO-profesor + SFT + GRPO sobre un modelo de 0.8B, util para comparar tecnicas de RL con recompensa de simulador.
- Docencia y cursos de reinforcement learning: el autor lo publica como material educativo con cuaderno de Colab y curso asociado, adecuado para demostrar GRPO con normalizacion por grupo y KL.
- Evaluacion de robustez ante inyeccion de prompt: al recibir estado no confiable en `state`, puede emplearse como banco de pruebas de defensas frente a instrucciones embebidas en datos.
- Generacion de datos sinteticos de decision: las etiquetas y probabilidades del modelo pueden usarse para anotar nuevos estados simulados en la distribucion `general`.
- Prototipado de policy para entornos tipo Gymnasium: la interfaz de entrada/salida (estado, pregunta, opciones, letra) encaja con entornos de decision discreta y permite conectar el modelo a un bucle de simulacion propio.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de la model card, medidos sobre el conjunto de prueba del simulador (840 problemas) y sobre una evaluacion de dos meses de operacion simulada:

| Modelo | Precision en test | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 32,3% | 2,00 | No disponible | No disponible |
| Aprendizaje supervisado (SFT) | 74,6% | 1,36 | No disponible | No disponible |
| Ajuste con GRPO | 74,8% | 1,33 | 8,89 millones de wones | 73% (148/177) |

El propio autor advierte que la evaluacion de operacion corresponde a una media de dos meses nunca vistos, con muestra pequena, y que el modelo sigue por debajo del policy profesor entrenado con PPO en el simulador. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.8B ocupa aproximadamente 1,6 GB en fp16 y alrededor de 0,5-0,6 GB en cuantizacion de 4 bits; el adaptador LoRA anade una cantidad marginal no especificada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior es holgada. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor); llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, no documentado por el autor; vLLM y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente en la informacion proporcionada, ya que se trata de un adaptador LoRA de dominio especifico sobre un modelo de 0.8B y no de un modelo de proposito general. Como referencia de categoria se incluyen los elementos conocidos del propio ecosistema:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kongi-v1 | 0.8B (base) + LoRA | No disponible | 74,8% en test del simulador | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base sin ajustar) | 0.8B | No disponible | 32,3% en test del simulador | No disponible en la informacion | Hugging Face |
| Policy profesor PPO del simulador | No disponible (modelo pequeno) | No disponible | Superior al modelo ajustado segun el autor, sin cifras | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio muy restringido: solo responde con una letra entre opciones predefinidas; no genera texto libre ni mantiene conversaciones.
- Rendimiento por debajo del profesor: el autor indica que el modelo ajustado aun no alcanza al policy PPO del simulador.
- Muestra de evaluacion pequena: la operacion se evalua sobre dos meses no vistos, por lo que las cifras de beneficio y reduccion de perdidas tienen alta varianza.
- Idioma: entrenado y etiquetado solo para coreano; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion de etiqueta: puede devolver una letra no presente en `options` o elegir opciones suboptimas cuando el estado se aleja de la distribucion `general`.
- Sesgos: los datos son sinteticos y generados por un simulador ajustado con datos publicos; hereda los sesgos de esa distribucion y no representa empresas reales.
- Licencia: Apache 2.0 permite uso comercial, pero el autor restringe explicitamente el uso previsto a investigacion y educacion y recomienda revalidar con los registros reales de la empresa antes de cualquier decision de gestion.
- Caveat de produccion: el repositorio muestra 0.0 GB y 0 descargas, lo que sugiere que los pesos del adaptador pueden no estar efectivamente publicados; conviene verificar la integridad de los ficheros antes de integrarlo.
- Dependencia del modelo base: requiere descargar Qwen/Qwen3.5-0.8B por separado y respetar su licencia, no incluida en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyoungsim/connectailab-rl-kongi-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
