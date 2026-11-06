# gutgai/connectailab-rl-sirius-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3.5-0.8B para resolver una tarea muy concreta: la toma de decisiones de navegacion de un robot simulado llamado LINK-01 dentro de un entorno 2D de evitacion de obstaculos. El modelo recibe en texto el estado del robot (distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y accion previa) y devuelve una unica letra que corresponde a una de las opciones de movimiento disponibles para los siguientes 0,5 segundos. Lo desarrolla el autor `gutgai` en el marco del proyecto CONNECT AI LAB / CONNECT TYCOON, con fines de investigacion y educacion.

La relevancia del modelo no esta en sus capacidades generales de lenguaje (el modelo base tiene 0,8 mil millones de parametros), sino en el pipeline de destilacion que ilustra: primero se entrena una politica PPO en un simulador web, despues se generan pares observacion-en-texto / decision del profesor, se hace un ajuste supervisado con LoRA y finalmente una fase de refuerzo con PPO y penalizacion KL para alinear al modelo de lenguaje con las decisiones del profesor. Los resultados publicados muestran que el ajuste supervisado alcanza un 68,7% de coincidencia con el profesor en el conjunto de test y el modelo reforzado un 63,8%, con una tasa de exito del 45% en 20 episodios de evaluacion frente al 95% del profesor.

Es, por tanto, un modelo de nicho, de muy bajo coste computacional, que sirve como referencia practica para quien quiera reproducir el patron "politica RL como profesor de un LLM pequeno" en dominios de control y robotica simulada. No esta pensado como modelo de proposito general ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base de 0,8 mil millones; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no documentada en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (`ko`) segun la model card; las entradas son estados del robot en texto |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador no modifica la arquitectura del modelo base: anade matrices de bajo rango en las capas de atencion y/o feed-forward, y se carga con `peft.PeftModel.from_pretrained`. La tarea es de clasificacion generativa restringida: el modelo debe emitir exactamente una letra de entre las opciones listadas en el prompt, sin explicacion.

El entrenamiento sigue un pipeline de cuatro etapas descrito en la model card. Primero, una politica PPO ("cerebro", `brain.json`) se entrena en el simulador web del proyecto sobre la tarea `avoid_obstacles`, con un contrato de evaluacion `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y un 90% de exito en el examen oficial. Segundo, se generan 1.163 ejemplos de entrenamiento, 198 de validacion y 351 de test convirtiendo cada 0,5 segundos las observaciones del robot en texto y tomando como etiqueta la accion del profesor; un 20% de los ejemplos corresponden a situaciones en las que el profesor se desvio. Tercero, se realiza ajuste supervisado con LoRA. Cuarto, se aplica una fase de refuerzo con PPO donde la recompensa de cada opcion se estima como el retorno que habria obtenido el profesor si hubiera ejecutado esa opcion y despues hubiera continuado el, con una penalizacion KL que mantiene al modelo cerca de la politica supervisada.

La tasa de coincidencia entre la representacion textual del estado y la decision del profesor se estima en un 99%, lo que actua como techo de la tarea. La evaluacion de caminado se hace con una aproximacion 2D basada en una tabla de velocidades por comando (derivada de MuJoCo web), no con el simulador fisico completo, por lo que los resultados pueden diferir de los de MuJoCo.

## Capacidades

- Generacion de una unica letra de decision a partir de un estado del robot descrito en texto (tarea de clasificacion restringida).
- Interpretacion de estados compuestos por distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad actual y accion previa.
- Seguimiento de instrucciones de sistema estrictas (devolver solo la letra, sin explicacion).
- Tratamiento del contenido del estado como datos y no como instrucciones (el system prompt lo indica explicitamente, aunque no hay garantia formal).
- Capacidades de lenguaje general heredadas del modelo base Qwen3.5-0.8B, no evaluadas ni documentadas en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.
- Capacidad multilingue limitada al coreano segun la model card.

## Casos de uso

- **Investigacion en destilacion de politicas RL a LLM**: reproducir el pipeline profesor PPO -> dataset textual -> SFT con LoRA -> PPO con KL para estudiar como un modelo de lenguaje pequeno aproxima una politica de control. El modelo sirve como referencia y como punto de partida para replicar el metodo en otros dominios.
- **Navegacion simulada de bajo coste**: integrar el adaptador en un bucle de control 2D donde el estado se serializa a texto cada 0,5 segundos y la letra devuelta se traduce a un comando de movimiento. Adecuado porque el modelo fue entrenado exactamente para ese formato y esa cadencia.
- **Docencia de reinforcement learning aplicado**: usar el notebook de Colab y el repositorio CONNECT TYCOON como material de curso para mostrar el ciclo completo de entrenamiento PPO, generacion de datos y ajuste de un LLM.
- **Prototipado rapido de agentes basados en texto para robotica**: validar la viabilidad de sustituir una politica neuronal por un LLM pequeno en un simulador antes de invertir en un modelo mayor o en entrenamiento fisico.
- **Generacion de datos sinteticos de decision**: emplear el modelo como generador de etiquetas alternativas para aumentar el dataset de entrenamiento de otra politica, filtrando por acuerdo con el profesor.
- **Evaluacion comparativa de metodos de alineacion**: medir el efecto de SFT frente a SFT+PPO con KL en una tarea de decision discreta, usando las metricas publicadas (acierto en test y tasa de exito en 20 episodios) como linea base.
- **Pruebas de robustez de prompts**: estudiar como responde un modelo pequeno a instrucciones de sistema estrictas y a estados con ruido o formatos alterados.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion sobre el conjunto de test y sobre 20 episodios del mismo curso con semillas 91001-91020):

| Modelo | Acierto en test (coincidencia con el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 95% | 15% | 23,6 s |
| Sin entrenar | 41,0% | 0% | 10% | No disponible |
| SFT (LoRA) | 68,7% | 40% | 65% | 27,5 s |
| RL (este modelo) | 63,8% | 45% | 80% | 30,6 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,8 mil millones de parametros mas un adaptador LoRA, la inferencia en fp16 requiere aproximadamente 1,6-2 GB de VRAM; en cuantizacion de 8 bits alrededor de 1 GB y en 4 bits por debajo de 1 GB (estimaciones para el modelo base, el adaptador anade una cantidad marginal).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutarlo. Para lotes grandes, A100 o H100 no aportan ventaja significativa dado el tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), vLLM y TGI si se fusiona el adaptador en el modelo base, llama.cpp u Ollama si se convierte a GGUF tras la fusion. El adaptador por si solo requiere un runtime compatible con PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia por token del orden de milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-sirius-v1-link01 | 0,8 B (base) + LoRA | No disponible | Adaptador PEFT para decision de robot | Apache 2.0 | Hugging Face, 19 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | LLM generalista | No disponible en la informacion | Hugging Face |
| Politica PPO del profesor (`brain.json`) | No disponible | No aplica | Red de politica RL | No disponible | Repositorio CONNECT TYCOON |

No se dispone de informacion sobre otros adaptadores equivalentes de destilacion RL a LLM en el mismo dominio, por lo que la comparativa con alternativas directas no esta disponible.

## Limitaciones y advertencias

- Modelo de nicho: solo resuelve la tarea `avoid_obstacles` del robot LINK-01 en un simulador 2D; no es un asistente general ni un modelo de codigo o razonamiento.
- El acierto en test del modelo final (63,8%) es inferior al del SFT (68,7%), y la tasa de exito en episodios (45%) esta muy por debajo del profesor (95%); la fase de RL mejora el exito pero reduce la coincidencia con el profesor y aumenta las colisiones (80% de episodios con colision).
- La evaluacion de caminado usa una aproximacion 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados pueden no transferirse a entornos fisicos.
- El propio autor advierte que es un modelo de investigacion y educacion y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Idioma documentado: coreano. El rendimiento en otros idiomas no esta evaluado.
- Riesgo de alucinacion: el modelo puede devolver una letra no listada o anadir texto si el prompt no sigue el formato exacto; el system prompt esta disenado para mitigarlo pero no hay garantia formal.
- No hay evaluacion de sesgos publicada; al entrenarse sobre datos sinteticos de un simulador, los sesgos reflejan las limitaciones del profesor y del diseno del curso.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad comercial del modelo es muy limitada por su especializacion.
- El repositorio ocupa 0,0 GB y tiene 19 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion con soporte comunitario practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutgai/connectailab-rl-sirius-v1-link01
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de reinforcement learning de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Simulador web del robot: https://www.ezerai.xyz/robot-lab/world/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
