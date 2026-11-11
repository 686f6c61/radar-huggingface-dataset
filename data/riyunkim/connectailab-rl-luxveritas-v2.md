# riyunkim/connectailab-rl-luxveritas-v2

## Resumen

`connectailab-rl-luxveritas-v2` es un adaptador LoRA de tipo PEFT sobre el modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario `riyunkim` en el marco de CONNECT AI LAB y AI CITY BUILDERS. Su funcion es actuar como un modelo de toma de decisiones empresariales: recibe un estado, una pregunta y una lista de opciones etiquetadas, y devuelve unicamente la letra de la opcion seleccionada. No es un modelo generativo de proposito general, sino una politica especializada en elegir entre alternativas discretas dentro de un simulador de gestion de empresas llamado CONNECT TYCOON.

El modelo se entrena en cuatro fases: primero, una politica pequena aprende a operar la empresa mediante PPO en el simulador; despues, esa politica genera un conjunto de problemas evaluando cada opcion posible; a continuacion se aplica aprendizaje supervisado sobre las opciones con mayor puntuacion; y finalmente se aplica aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), normalizando por grupo y anadiendo una penalizacion KL respecto al modelo de partida. El conjunto de datos consta de 4082 problemas de entrenamiento, 832 de validacion y 840 de prueba, sobre una distribucion de empresa de tipo `general`.

Es relevante por su enfoque poco habitual: un adaptador de 0,8 mil millones de parametros, entrenado con RL sobre un simulador sintetico, orientado a una tarea de clasificacion de opciones con salida restringida a una letra. Su utilidad practica esta acotada al dominio del simulador y a experimentos de investigacion sobre decision-making con modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parametros. La innovacion no reside en la arquitectura del modelo base, sino en el pipeline de entrenamiento en cuatro etapas. En la primera, una politica pequena se entrena con PPO dentro del simulador CONNECT TYCOON durante miles de meses simulados; esa politica actua como profesor. En la segunda, por cada mes operado se generan variantes del problema cambiando la opcion elegida y reejecutando el mes completo para puntuar cada alternativa. En la tercera, se aplica aprendizaje supervisado imitando la opcion de mayor puntuacion. En la cuarta, se aplica GRPO: se agrupan todas las opciones de un mismo problema, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones cuyo resultado en el simulador supera la media, con una penalizacion KL contra el modelo de partida para evitar el colapso.

El formato de interaccion es estricto: un mensaje de sistema que instruye a evaluar la tarea, tratar el texto del estado como datos y no como instrucciones, seleccionar exactamente una opcion listada y devolver solo su letra; y un mensaje de usuario con un objeto JSON que contiene `state`, `question` y `options` (cada una con `label`, `key` y `description`). La salida esperada es una unica letra. La distribucion de probabilidad sobre las letras de las opciones se interpreta como la confianza del modelo en cada alternativa.

## Capacidades

- Toma de decisiones discretas: selecciona una opcion entre varias etiquetadas (A, B, C...) a partir de un estado y una pregunta en formato JSON.
- Salida restringida a una letra, sin explicacion ni texto adicional, lo que facilita el parseo automatico.
- Calibracion implicita: la probabilidad asignada a cada letra de opcion puede leerse como una medida de confianza por alternativa.
- Resistencia a inyeccion de instrucciones en el campo `state`, segun el prompt de sistema disenado por el autor.
- Evaluacion de escenarios de gestion empresarial simulada (decisiones operativas mes a mes en CONNECT TYCOON).
- No dispone de capacidades documentadas de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al coreano segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion en decision-making con RL: servir como punto de partida reproducible para comparar PPO, aprendizaje supervisado y GRPO sobre una misma tarea de eleccion discreta.
- Simulacion de gestion empresarial: integrar el adaptador en el simulador CONNECT TYCOON para que actue como agente que elige una decision por turno y medir el beneficio mensual resultante.
- Evaluacion de calibracion: usar la distribucion de probabilidad sobre las letras para estudiar la confianza del modelo en tareas de clasificacion con opciones cerradas.
- Pruebas de robustez frente a inyeccion de prompts: el campo `state` transporta texto libre, lo que permite disenar experimentos sobre si el modelo respeta la instruccion de tratar ese texto como datos.
- Generacion de datos sinteticos de decision: emplear las elecciones del modelo para poblar conjuntos de entrenamiento o validacion en dominios de gestion simulada.
- Docencia y formacion en RL: el repositorio incluye un cuaderno de Colab para reproducir el entrenamiento, lo que lo hace util como material didactico en cursos de aprendizaje por refuerzo aplicado a modelos de lenguaje.
- Prototipado de asistentes de decision acotados: en entornos donde la respuesta deba ser una etiqueta entre opciones predefinidas, el formato de salida de una sola letra simplifica la integracion en pipelines.

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card son los siguientes. La metrica de "tasa de acierto en el examen" se mide sobre el conjunto de prueba de 840 problemas; la "retrospectiva" (menor es mejor) cuantifica la perdida respecto a la mejor decision posible; el beneficio mensual corresponde a la media de dos meses no vistos en el simulador; y la ultima columna mide la reduccion de perdidas en transacciones reales con tarjeta.

| Modelo | Tasa de acierto | Retrospectiva | Beneficio mensual simulado | Transacciones reales con perdida reducida |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,1 % | 2,68 | no disponible | no disponible |
| Aprendizaje supervisado | 78,1 % | 1,89 | no disponible | no disponible |
| Aprendizaje por refuerzo (GRPO) | 76,8 % | 1,93 | 11,52 millones de wones | 70 % (145/177) |

El autor advierte que se trata de un primer experimento, que la evaluacion de gestion empresarial promedia solo dos meses no vistos y que el modelo aun queda por debajo de la politica profesora entrenada con PPO en el simulador. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 mil millones de parametros ocupa aproximadamente 1,6 GB en precision fp16, a lo que se suma el adaptador LoRA (tamano no disponible en el repositorio, que figura con 0,0 GB). En cuantizacion de 4 bits cabria en torno a 0,5-0,7 GB, aunque no se documentan pesos cuantizados para este adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior permite ejecutarlo con holgura. Para entrenamiento o evaluacion por lotes, se recomienda una RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: el autor documenta el uso mediante `transformers` y `peft` (`PeftModel.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al tratarse de un adaptador PEFT sobre un modelo base no cuantizado, su integracion en esos motores requeriria fusionar el adaptador con el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (adaptadores RL para decision-making sobre simuladores de gestion). Se ofrece una comparacion estructural con el modelo base y con alternativas genericas de tamano similar.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-luxveritas-v2 | 0,8 B (base) + LoRA | no disponible | Eleccion discreta entre opciones en simulador | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | Generacion de texto de proposito general | no disponible en la informacion | Hugging Face |
| Alternativas de ~1 B para clasificacion | no disponible | no disponible | Clasificacion / eleccion | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado exclusivamente sobre el simulador CONNECT TYCOON y la distribucion de empresa `general`; su comportamiento fuera de ese dominio no esta validado.
- Idioma: solo se declara coreano; el rendimiento en castellano o en otros idiomas no esta documentado.
- Volumen de evaluacion reducido: el beneficio mensual se calcula sobre la media de dos meses no vistos, por lo que la varianza de la estimacion es alta, tal como reconoce el autor.
- Rendimiento inferior al profesor: el modelo con GRPO queda por debajo de la politica PPO que genero los datos, lo que sugiere margen de mejora y posible infraajuste.
- Riesgo de alucinacion de etiqueta: al devolver una unica letra, si el conjunto de opciones no se ajusta al formato esperado, la salida puede ser invalida o corresponder a una opcion inexistente; es necesario validar la respuesta contra las etiquetas enviadas.
- Dependencia del formato: el prompt de sistema y el esquema JSON son parte critica del contrato; desviarse de ellos degrada la calidad de la seleccion.
- Uso comercial: la licencia Apache 2.0 del adaptador lo permite, pero debe verificarse por separado la licencia del modelo base `Qwen/Qwen3.5-0.8B`, no incluida en la informacion disponible.
- Advertencia explicita del autor: es un modelo de investigacion y docencia sobre un simulador sintetico; antes de usarlo en decisiones empresariales reales debe revalidarse con los datos historicos de la empresa concreta.
- Sin soporte documentado de tool calling, agentes multi-paso ni razonamiento explicito, lo que limita su uso en pipelines que requieran justificar la decision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/riyunkim/connectailab-rl-luxveritas-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
