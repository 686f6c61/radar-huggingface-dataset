# LEE8381/connectailab-rl-romebrain-v1

## Resumen

`connectailab-rl-romebrain-v1` es un adaptador LoRA entrenado por LEE8381 (CONNECT AI LAB × AI CITY BUILDERS) sobre el modelo base `Qwen/Qwen3.5-0.8B`. Su proposito es actuar como un modelo de toma de decisiones empresariales: recibe un estado de situacion, una pregunta y un conjunto de opciones etiquetadas, y devuelve unicamente la letra de la opcion seleccionada. El modelo no genera texto libre ni razonamiento explicito, sino una clasificacion de una sola letra cuya distribucion de probabilidad se interpreta como la confianza del modelo en cada alternativa.

El entrenamiento combina un pipeline de refuerzo en dos fases: primero un agente pequeno (PPO) aprende a operar una empresa en el simulador CONNECT TYCOON y genera datos de puntuacion por opcion; despues el modelo base se ajusta mediante aprendizaje supervisado sobre las mejores opciones y, finalmente, con GRPO (Group Relative Policy Optimization) usando la recompensa del simulador. El conjunto de datos sintetico cuenta con 4082 ejemplos de entrenamiento, 832 de validacion y 840 de test, sobre una distribucion de empresa de tipo `general`.

Es relevante como ejemplo de aplicacion de RL con verificador (RLVR) a un dominio de decision estructurada con un modelo pequeno (0,8B parametros), y porque publica resultados comparativos entre modelo base, SFT y RL. No obstante, se trata de un experimento de investigacion y educacion sobre un simulador sintetico, con un unico idioma declarado (coreano) y sin validacion en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA anade un numero de parametros no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parametros. El ajuste se realiza con LoRA mediante la libreria PEFT, por lo que los pesos publicados son unicamente los del adaptador y requieren cargar el modelo base por separado. El modelo esta especializado en una tarea de clasificacion restringida: dado un JSON con `state`, `question` y una lista de `options` con `label`, `key` y `description`, debe emitir exactamente una letra.

El pipeline de entrenamiento descrito en la model card tiene cuatro etapas: (1) un agente de politica pequena se entrena con PPO durante miles de meses simulados en CONNECT TYCOON y actua como profesor; (2) se construye un "cuaderno de problemas" reejecutando cada mes con las distintas opciones para puntuar cada alternativa; (3) se aplica aprendizaje supervisado imitando la opcion de mayor puntuacion; (4) se aplica GRPO, normalizando las ventajas dentro de cada grupo de opciones y anadiendo una penalizacion KL respecto al modelo de partida. El dataset se compone de 4082 ejemplos de entrenamiento, 832 de validacion y 840 de test, con una distribucion de empresa `general` ajustada a datos publicos.

## Capacidades

- Seleccion de una unica opcion (una letra) entre las alternativas presentadas en un JSON estructurado.
- Produccion de una distribucion de probabilidad sobre las letras de las opciones, interpretable como confianza por alternativa.
- Toma de decisiones secuenciales en un entorno simulado de gestion empresarial (CONNECT TYCOON) con recompensas de dinero, satisfaccion y accidentes.
- Tratamiento del contenido de `state` como datos y no como instrucciones (segun el prompt de sistema recomendado).
- No soporta generacion de texto libre, razonamiento explicito, codigo, matematicas, vision, audio ni tool calling.
- No se declaran capacidades de agente multi-paso fuera del bucle de simulacion.
- Cobertura multilingue limitada al coreano declarado en la model card.

## Casos de uso

- Evaluacion de politicas de decision en simuladores: el modelo puede sustituir al agente PPO como politica de inferencia rapida en el simulador CONNECT TYCOON para comparar estrategias sin reentrenar.
- Investigacion en RL con verificador: sirve como caso de estudio reproducible de un pipeline PPO → SFT → GRPO sobre un modelo de 0,8B, util para analizar como cambia la precision y la "regret" entre etapas.
- Clasificacion de decisiones con opciones cerradas: cualquier tarea donde las alternativas esten predefinidas y etiquetadas (A, B, C...) puede formatearse como el JSON esperado y resolverse con una sola letra.
- Generacion de datos sinteticos de decision: las probabilidades por opcion pueden usarse como etiquetas blandas para destilar un modelo mayor o para aumentar un dataset de decisiones.
- Docencia y formacion en RL: el notebook de Colab y el repositorio permiten reproducir el entrenamiento paso a paso en un entorno gratuito.
- Prototipado de asistentes de decision internos: en un piloto, el modelo puede priorizar entre opciones de un catalogo cerrado (por ejemplo, acciones operativas) antes de validar con datos reales de la empresa.
- Analisis de sensibilidad de decisiones: variando el `state` y observando los cambios en la distribucion de letras se puede estudiar que factores del contexto mueven la eleccion.

## Benchmarks y rendimiento

Resultados publicados en la model card (tarea de decision del simulador, conjunto de test):

| Modelo | Precision en test | Regret (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 31,4% | 2,57 | no disponible | no disponible |
| Aprendizaje supervisado (SFT) | 71,5% | 2,13 | no disponible | no disponible |
| Refuerzo (GRPO) | 71,1% | 2,14 | 2,51 millones de wones | 37% (91/177) |

El autor indica que la evaluacion de operacion empresarial promedia solo dos meses no vistos, por lo que la muestra es pequena, y que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B ocupa aproximadamente 1,6 GB en fp16 y alrededor de 0,5-0,9 GB en cuantizaciones de 4-8 bits; el adaptador LoRA anade una cantidad marginal. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el modelo base en fp16; para lotes grandes o entrenamiento del adaptador se recomienda una RTX 3090/4090 o superior.
- Cabe en GPU consumer: si, incluidas GTX 1660, RTX 3060 y modelos integrados con suficiente memoria unificada.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI requeririan convertir el adaptador a un formato compatible, lo cual no esta documentado por el autor.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera una latencia de decenas de milisegundos por peticion en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-romebrain-v1 | 0,8B (base) + LoRA | no disponible | Decision con opciones cerradas via SFT + GRPO | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | LLM generalista | segun modelo base | Hugging Face |
| Politica PPO del simulador CONNECT TYCOON | no disponible | no disponible | RL clasico sobre entorno Gymnasium | no disponible | no disponible (referenciada como profesora) |

No se dispone de datos publicados de otros adaptadores comparables de decision empresarial sobre Qwen3.5-0.8B en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre un simulador sintetico (`general`); el propio autor advierte que debe revalidarse con los registros reales de la empresa antes de usarse en decisiones de negocio.
- Evaluacion con muestra muy pequena (dos meses no vistos) y por debajo de la politica profesora PPO.
- Solo declarado para coreano; el prompt de sistema esta en ingles, pero no hay evidencia de robustez en otros idiomas.
- No genera explicaciones: la salida es una letra, lo que dificulta la auditoria y la trazabilidad de la decision.
- Riesgo de alucinacion estructural: puede devolver una letra fuera del conjunto de opciones o una opcion no valida si el JSON de entrada no sigue el formato esperado.
- Depende de que el contenido de `state` se trate como datos; el autor incluye una instruccion explicita en el prompt de sistema, lo que sugiere vulnerabilidad a inyeccion de prompt si se omite.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos publicados de cuantizacion ni de contexto maximo; no se recomienda para produccion sin una evaluacion propia.
- Modelo de investigacion y educacion, con 21 descargas y 0 likes en el momento de la consulta; no hay senales de mantenimiento o soporte.

## Enlaces

- Hugging Face: https://huggingface.co/LEE8381/connectailab-rl-romebrain-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
