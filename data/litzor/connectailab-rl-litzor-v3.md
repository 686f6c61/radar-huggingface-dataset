# litzor/connectailab-rl-litzor-v3

## Resumen

connectailab-rl-litzor-v3 es un adaptador LoRA de aprendizaje por refuerzo desarrollado por el usuario litzor (CONNECT AI LAB × AI CITY BUILDERS) sobre el modelo base Qwen/Qwen3.5-0.8B. Su proposito no es la generacion de texto general, sino la toma de decisiones estructurada: recibe un estado, una pregunta y un conjunto de opciones etiquetadas, y devuelve una unica letra correspondiente a la opcion elegida. El pipeline declarado es reinforcement-learning y la libreria de carga es peft.

El modelo se entrena sobre datos sinteticos generados por el simulador CONNECT TYCOON, un entorno tipo Gymnasium que emula la operacion de una empresa mes a mes. La relevancia actual reside en su enfoque metodologico: combina una politica PPO como profesor, generacion de un dataset de decisiones puntuadas, aprendizaje supervisado y un ajuste final con GRPO (Group Relative Policy Optimization) con estandarizacion por grupo y penalizacion KL respecto al modelo de partida.

Se trata de un adaptador de investigacion y caracter educativo, con licencia Apache 2.0, orientado al idioma coreano (ko) y con un tamano de repositorio practicamente nulo (0.0 GB), lo que sugiere pesos de adaptador de baja dimension. No esta pensado como sustituto de un LLM conversacional, sino como componente de decision dentro de un bucle de simulacion o de un sistema de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3.5-0.8B); entrenamiento con GRPO |
| Parametros totales | 0.8B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder de 0.8 mil millones de parametros. El entrenamiento sigue un pipeline de cuatro fases descrito en la model card: (1) una politica pequena se entrena con PPO dentro del simulador CONNECT TYCOON durante miles de meses simulados y actua como profesor; (2) se construye un dataset de decisiones donde, para cada mes operado por el profesor, se altera la opcion elegida y se reejecuta el mes completo para puntuar cada alternativa; (3) se realiza aprendizaje supervisado imitando la opcion de mayor puntuacion; (4) se aplica un ajuste de refuerzo con GRPO, tratando el conjunto completo de opciones como un grupo, elevando la probabilidad de las opciones cuyo retorno en el simulador supera la media del grupo y anadiendo una penalizacion KL contra el modelo de partida para evitar el colapso de la distribucion.

El dataset se compone de una distribucion de empresas de tipo `general`, calibrada con datos publicos, y se divide en 4082 ejemplos de entrenamiento, 832 de validacion y 840 de test. La innovacion tecnica destacable es el uso del simulador como fuente de recompensa verificable y la reformulacion del problema de decision como clasificacion de una letra entre las opciones presentadas, lo que permite leer directamente una distribucion de probabilidad sobre las alternativas.

## Capacidades

- Toma de decisiones de seleccion unica: dado un estado, una pregunta y una lista de opciones etiquetadas, devuelve exactamente una letra.
- Produccion de una distribucion de probabilidad sobre las opciones, donde la letra de mayor probabilidad actua como medida de confianza.
- Razonamiento sobre estados estructurados en JSON con campos `state`, `question` y `options`.
- Resistencia a inyeccion de instrucciones dentro del campo `state`, segun el prompt de sistema recomendado por el autor.
- Operacion dentro de entornos tipo Gymnasium mediante integracion con el simulador CONNECT TYCOON.
- Capacidad multilingue limitada al coreano para el dominio de entrenamiento.
- No dispone de tool calling, function calling, vision, audio ni modo de pensamiento explicito segun la informacion disponible.

## Casos de uso

- Simulacion de gestion empresarial: el modelo actua como agente de decision dentro de CONNECT TYCOON, eligiendo una opcion por mes simulado y permitiendo comparar politicas contra el profesor PPO.
- Investigacion en RL con recompensa verificable: sirve como punto de partida para reproducir el pipeline PPO-profesor, dataset puntuado, SFT y GRPO en otros dominios de decision.
- Evaluacion de metodos de alineacion: su combinacion de SFT y GRPO con KL permite estudiar la degradacion o mejora de la precision frente al modelo supervisado (78.0% frente a 76.4% en el conjunto de test).
- Docencia y cursos de refuerzo: el autor lo publica junto a un notebook de Colab y cursos de RL, por lo que es util como ejemplo ejecutable de entrenamiento de adaptadores LoRA.
- Prototipado de asistentes de decision acotada: en escenarios donde las alternativas estan predefinidas y se requiere una eleccion rapida y de bajo coste computacional, el adaptador de 0.8B puede desplegarse en hardware modesto.
- Generacion de datos sinteticos de decision: las elecciones y sus probabilidades pueden emplearse para etiquetar o aumentar datasets en dominios con opciones discretas.
- Validacion de robustez ante prompt injection: el diseno del system prompt permite probar defensas frente a instrucciones maliciosas embebidas en el estado.

## Benchmarks y rendimiento

| Modelo | Precision en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30.5% | 2.48 | no disponible | no disponible |
| Aprendizaje supervisado | 78.0% | 1.83 | no disponible | no disponible |
| Aprendizaje por refuerzo (este adaptador) | 76.4% | 1.86 | 4,41 millones de wones | 37% (91/177) |

Los resultados proceden del primer experimento del autor y se calculan sobre una media de dos meses no vistos en el simulador, con un tamano de muestra reducido. El autor indica que el modelo aun queda por debajo de la politica profesora entrenada con PPO. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.8B en precision completa (FP16) requiere aproximadamente 1.6 GB solo para pesos; el adaptador LoRA anade una cantidad marginal. En cuantizacion de 4 bits el modelo base puede ocupar del orden de 0.5 GB, aunque el autor no publica cuantizaciones del adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar el modelo base en FP16; para entrenamiento o ajuste se recomienda al menos una RTX 3090 o RTX 4090 por comodidad, aunque el autor no especifica requisitos.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna con 4-8 GB de VRAM es suficiente para inferencia del modelo base.
- Opciones de despliegue: transformers junto con peft (metodo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-litzor-v3 | 0.8B (base) + LoRA | no disponible | Decision de seleccion unica con GRPO | Apache 2.0 | Hugging Face (30 descargas) |
| Qwen/Qwen3.5-0.8B | 0.8B | no disponible | LLM generativo general | no disponible en la informacion | Hugging Face |
| Politica PPO del simulador CONNECT TYCOON | no disponible | no disponible | RL clasico en entorno Gymnasium | no disponible | No publicada como modelo |

No se dispone de datos de benchmarks comparables con otros adaptadores de decision del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion y educacion: el propio autor advierte que es un modelo sobre un simulador sintetico y que debe revalidarse con los registros reales de cada empresa antes de usarse en decisiones de gestion.
- Precision limitada: con un 76.4% en test, el adaptador queda por debajo del aprendizaje supervisado (78.0%) y de la politica profesora PPO, lo que sugiere que el ajuste GRPO no ha superado aun al SFT en este primer experimento.
- Muestra de evaluacion pequena: los resultados de operacion se calculan sobre una media de dos meses no vistos, con alta varianza potencial.
- Idioma: entrenado unicamente en coreano; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Dominio estrecho: solo responde a tareas de seleccion entre opciones etiquetadas; no genera explicaciones ni texto libre.
- Riesgo de alucinacion de etiqueta: puede devolver una letra no presente en las opciones si el formato de entrada se desvia del esperado.
- Sesgos: la distribucion de empresas `general` se calibro con datos publicos, por lo que puede heredar sesgos de esa calibracion y no representar sectores atipicos.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre la validacion en produccion recae en el integrador.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3.5-0.8B, cuyos terminos y disponibilidad pueden cambiar de forma independiente al adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litzor/connectailab-rl-litzor-v3
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
