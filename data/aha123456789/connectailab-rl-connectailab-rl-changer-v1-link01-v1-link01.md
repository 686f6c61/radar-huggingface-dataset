# aha123456789/connectailab-rl-connectailab-rl-changer-v1-link01-v1-link01

## Resumen

connectailab-rl-changer-v1-link01-v1-link01 es un adaptador LoRA de tipo PEFT publicado por el usuario aha123456789 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B y su funcion es actuar como "cerebro de decision" para el robot simulado LINK-01: recibe en texto la situacion actual del robot (distancia al objetivo, direccion, lecturas de sensores de distancia, velocidad y eleccion previa) y devuelve una unica letra que codifica como debe caminar durante los siguientes 0,5 segundos.

El modelo no es un LLM generalista, sino un adaptador especializado entrenado mediante un pipeline de dos fases: primero aprendizaje supervisado (LoRA) sobre pares observacion-respuesta generados por una politica PPO entrenada en un entorno web, y despues refinamiento con aprendizaje por refuerzo con ancla KL respecto al modelo supervisado. El resultado, segun la model card, es un adaptador que reproduce el 100 % de las decisiones de la politica profesora en el conjunto de test y completa el 100 % de 20 episodios de evaluacion en el mismo circuito.

Su relevancia es acotada pero instructiva: demuestra como destilar una politica de RL en un modelo de lenguaje pequeno (0,8 B parametros) para tareas de decision discreta con observaciones textualizadas, un patron util en robotica simulada y en educacion sobre RL. No es un modelo para uso general, atencion al cliente ni generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 0,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen/Qwen3.5-0.8B, sin dato explicito) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El entrenamiento sigue cuatro etapas descritas en la model card: (1) entrenamiento de una politica PPO ("cerebro") en un entorno web de robotica con la tarea `choose_object` y la convencion `link01-decision/choose_object/obs26-act4/walker51-14/v1`, alcanzando un 95 % en el examen oficial; (2) generacion de un corpus de problemas textualizando cada 0,5 segundos la observacion del robot, con la respuesta de la politica como etiqueta y un 20 % de ejemplos con desviaciones deliberadas; (3) aprendizaje supervisado con LoRA para imitar esas respuestas; y (4) refinamiento con RL usando la recompensa obtenida al ejecutar cada opcion y dejar que la politica continue el episodio, con ancla KL al modelo supervisado.

El corpus resultante contiene 401 ejemplos de entrenamiento, 75 de validacion y 131 de test. La evaluacion se realiza sentando al modelo en el puesto de decision del robot y recorriendo el mismo circuito durante 20 episodios (semillas 91001-91020), con una aproximacion 2D de la marcha basada en una tabla de velocidades por comando en lugar de MuJoCo completo, por lo que los resultados pueden diferir de la simulacion fisica. La tasa de coincidencia con la politica profesora en el test es del 100 %, y el modelo completa el 100 % de los episodios sin colisiones con un tiempo medio de 7,7 segundos.

## Capacidades

- Decision discreta de accion: dado un estado textualizado del robot, devuelve exactamente una letra entre las opciones listadas.
- Formato de salida estricto: solo la letra, sin explicacion, segun el system prompt indicado en la model card.
- Robustez ante instrucciones inyectadas en el estado: el system prompt indica tratar el contenido de `state` como datos, no como instrucciones.
- Razonamiento de un solo paso por invocacion (no multi-step ni planificacion de horizonte largo).
- Sin soporte documentado de tool calling ni function calling.
- Sin capacidades de vision, audio ni generacion de codigo.
- Capacidad multilingue limitada al coreano como idioma declarado.

## Casos de uso

- Control de politica en robotica simulada: sustituir la politica PPO por el adaptador LoRA en el bucle de decision del robot LINK-01 dentro del simulador, aprovechando que reproduce el 100 % de las decisiones de la profesora en el conjunto de test.
- Docencia de aprendizaje por refuerzo: usar el par (politica PPO, adaptador destilado) como ejemplo reproducible de destilacion de politicas en modelos de lenguaje, con el cuaderno de Colab enlazado en la model card.
- Investigacion sobre textualizacion de observaciones: emplear el pipeline `Q.task_of("choose_object", obs)` para convertir observaciones continuas en problemas de eleccion multiple y estudiar el efecto del formato en la fidelidad de la politica.
- Evaluacion de robustez ante ruido en la observacion: los ejemplos con desviaciones deliberadas (20 % del corpus) permiten medir como degrada el modelo cuando la accion no coincide con la politica profesora.
- Prototipado rapido de agentes de decision en entornos con acciones discretas: reutilizar el esquema observacion-texto -> letra para tareas de navegacion simple en otros simuladores.
- Benchmark interno de tecnicas de RL sobre LLM pequenos: comparar SFT frente a SFT+RL con ancla KL usando las mismas semillas y el mismo circuito, tal como documenta la model card.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que la politica) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Politica PPO (profesora) | 100,0 % | 100 % | 0 % | 7,7 s |
| Modelo antes de entrenar | 0,8 % | 0 % | 0 % | No disponible |
| Aprendizaje supervisado (LoRA) | 100,0 % | 100 % | 0 % | 7,7 s |
| Aprendizaje por refuerzo (este adaptador) | 100,0 % | 100 % | 0 % | 7,7 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores proceden de la evaluacion propia del autor en el circuito `76936969` con aproximacion 2D de la marcha.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,1 GB; el modelo base Qwen/Qwen3.5-0.8B en precision completa requiere del orden de 1,6 GB (0,8 B parametros a 2 bytes) mas overhead de activaciones; en cuantizacion de 4 bits cabe en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el modelo base en cuantizacion; una RTX 3060, RTX 4060 o superior permite ejecutar en fp16 sin problemas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna de 4 GB o mas.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); vLLM, llama.cpp u Ollama no estan documentados para este adaptador y requeririan conversion previa del base.
- Latencia y throughput: no disponibles de forma explicita; el tiempo medio por episodio de 7,7 s corresponde a la simulacion completa, no a la latencia por invocacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| connectailab-rl-changer-v1-link01-v1-link01 | Adaptador sobre 0,8 B | No disponible | Apache 2.0 | Decision discreta para robot LINK-01 |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | No disponible | No disponible en la informacion | LLM generalista |
| Politica PPO "cerebro" (profesora) | No disponible | No aplica | No disponible | Politica de RL en entorno web |
| Otros adaptadores LoRA de robotica | No disponible | No disponible | Variable | Especificos de tarea |

No se dispone de datos publicos de benchmarks comparables con otros adaptadores de robotica en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion y educacion: la propia model card advierte que es un modelo sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- Dominio muy estrecho: solo resuelve la tarea `choose_object` con el formato de observacion `obs26-act4` y la convencion `walker51-14/v1`; fuera de ese esquema su comportamiento no esta caracterizado.
- Evaluacion con aproximacion 2D de la marcha: los resultados pueden diferir de los obtenidos con MuJoCo completo u otro simulador fisico.
- Idioma: declarado unicamente coreano; el system prompt esta en ingles y no hay evaluacion de robustez en otros idiomas.
- Riesgo de alucinacion: aunque la salida esta restringida a una letra, no hay garantia de que la letra pertenezca al conjunto de opciones si la entrada se desvia del formato esperado.
- Sesgos: no documentados; el corpus es pequeno (401 ejemplos de entrenamiento) y generado por una unica politica, por lo que hereda sus sesgos de comportamiento.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin soporte documentado de tool calling, agentes multi-paso ni contexto largo; no debe emplearse como LLM generalista.

## Enlaces

- Hugging Face: https://huggingface.co/aha123456789/connectailab-rl-connectailab-rl-changer-v1-link01-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
