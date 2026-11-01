# IRELAB/connectailab-rl-irelab-v2-choose-link01

## Resumen

connectailab-rl-irelab-v2-choose-link01 es un adaptador LoRA publicado por IRELAB sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a la toma de decisiones de un robot simulado llamado LINK-01. El modelo recibe una descripcion textual del estado del robot (distancia y direccion al objetivo, sensores de distancia, velocidad y eleccion previa) y devuelve una unica letra que representa la accion de locomocion a ejecutar durante los siguientes 0,5 segundos. No es un modelo de lenguaje de proposito general, sino un "cerebro" de politica entrenado para una tarea muy concreta: `choose_object` dentro de un entorno de aprendizaje web.

El desarrollo combina dos fases. Primero se entrena una politica PPO en un simulador web (el "cerebro" o `brain.json`) sobre un recorrido concreto identificado como `db069b95`. Despues, ese cerebro actua como profesor: se generan pares de observacion textual y accion, se realiza un ajuste supervisado con LoRA sobre Qwen3.5-0.8B y finalmente se aplica un refinamiento por refuerzo (PPO con ancla KL) para premiar las opciones que superan al profesor. El resultado es un adaptador pequeno (repo de 0,0 GB) que reproduce al 100 % las decisiones del cerebro original.

La relevancia es acotada pero clara para quien trabaja en agentes y robotica simulada: demuestra un pipeline completo de destilacion de politicas de refuerzo hacia modelos de lenguaje pequenos, con evaluacion en bucle cerrado sobre 20 episodios. Es un modelo de investigacion y educacion, no un componente listo para produccion ni para robots reales sin revalidacion en el entorno fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA anade un numero no disponible de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. La innovacion no esta en la arquitectura del modelo base, sino en el procedimiento de entrenamiento en cuatro etapas descrito en la model card. En la primera, una politica PPO se entrena en el simulador web de CONNECT AI WORLD sobre la tarea `choose_object`, con el contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1` y el recorrido `db069b95`, alcanzando un 25 % en la prueba oficial del entorno. En la segunda, se construye un corpus de problemas: cada 0,5 segundos se convierte la observacion del robot en texto y se etiqueta con la accion elegida por el cerebro, incluyendo un 20 % de ejemplos con desviaciones deliberadas.

La tercera etapa es un ajuste supervisado con LoRA sobre Qwen3.5-0.8B para imitar al cerebro. La cuarta aplica refuerzo con PPO y una penalizacion KL que mantiene al modelo cerca de la politica supervisada, premiando las opciones que, segun el simulador, habrian producido mejores recompensas que la accion del profesor. El conjunto de datos resultante tiene 689 ejemplos de entrenamiento, 137 de validacion y 216 de prueba. La evaluacion final coloca al modelo en el puesto de decision del robot y lo hace recorrer el mismo circuito en 20 episodios con semillas 91001 a 91020, usando una aproximacion 2D de la marcha basada en una tabla de velocidades por comando en lugar del modelo fisico completo.

## Capacidades

- Toma de decision discreta: dado un estado textual del robot, selecciona exactamente una letra entre las opciones presentadas (4 acciones en el contrato `obs26-act4`).
- Formato de salida estricto: responde solo con la letra, sin explicacion, segun el system prompt indicado por el autor.
- Razonamiento sobre estado estructurado: interpreta distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y eleccion previa.
- Robustez ante instrucciones embebidas: el prompt del sistema indica tratar el contenido del estado como datos, no como instrucciones.
- Destilacion de politica de refuerzo: reproduce al 100 % las decisiones del cerebro PPO original en el conjunto de prueba.
- Capacidades multilingues: limitadas al coreano segun la metadata; el prompt de sistema esta en ingles, pero el modelo esta especializado en la tarea y no en conversacion general.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Investigacion en destilacion de politicas RL: usar el par cerebro PPO / adaptador LoRA como caso de estudio reproducible de como transferir una politica de control a un modelo de lenguaje pequeno, comparando las cuatro etapas (sin entrenar, supervisado, RL) con las metricas publicadas.
- Educacion en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten recorrer el pipeline completo (entorno web, PPO, generacion de corpus, LoRA, PPO con KL) en un aula o curso, con un coste de computo bajo gracias a los 0,8 mil millones de parametros.
- Prototipado de agentes de decision en simulacion: integrar el adaptador como modulo de seleccion de accion en un bucle de simulacion 2D, sustituyendo la politica neuronal por una llamada al modelo de lenguaje y midiendo la degradacion respecto al cerebro original.
- Evaluacion de robustez de modelos pequenos: emplear el conjunto de prueba de 216 ejemplos y las 20 semillas de evaluacion para estudiar sensibilidad a perturbaciones en la representacion textual del estado.
- Docencia sobre PEFT y LoRA: servir de ejemplo minimo de adaptador LoRA sobre un modelo de menos de mil millones de parametros, con carga via `PeftModel.from_pretrained` y requisitos de hardware muy bajos.
- Base para experimentos de RLHF simplificado: reutilizar el esquema de recompensa por opcion (recompensa del simulador si el resto lo ejecuta el cerebro) como plantilla para entrenar modelos pequenos en tareas de decision con recompensa escasa.
- Referencia para investigacion en robotica simulada: comparar la aproximacion 2D basada en tabla de velocidades con simulaciones MuJoCo completas para calibrar cuanto se pierde al evaluar sin el modelo fisico.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los de la model card, medidos sobre el conjunto de prueba de 216 ejemplos y sobre 20 episodios del recorrido `db069b95` con semillas 91001 a 91020.

| Modelo | Acierto en prueba (coincidencia con el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 0 % | 13,7 s |
| Sin entrenar (Qwen3.5-0.8B base) | 1,4 % | 0 % | 0 % | no disponible |
| Ajuste supervisado (LoRA) | 100,0 % | 100 % | 0 % | 13,7 s |
| Refuerzo (PPO + KL, modelo publicado) | 100,0 % | 100 % | 0 % | 13,7 s |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor advierte que la evaluacion de marcha usa una aproximacion 2D con tabla de velocidades por comando, sin modelo de robot ni red neuronal de marcha, por lo que no hay caidas y los resultados pueden diferir de una simulacion MuJoCo completa.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 0,8 mil millones de parametros en FP16 ocupa aproximadamente 1,6 GB de pesos; con overhead de activaciones y cache KV, cabe holgadamente en 4 GB de VRAM. En cuantizacion de 8 bits o 4 bits el requisito baja de 1 a 2 GB, aunque el autor no documenta cuantizaciones especificas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, e incluso en placas integradas con suficiente memoria compartida para inferencia en CPU.
- Opciones de despliegue: `transformers` + `peft` (metodo indicado por el autor); vLLM, llama.cpp, Ollama y TGI requeririan conversion del adaptador a los formatos correspondientes, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles. La tarea es de una sola llamada corta por decision (una letra de salida), por lo que la latencia dominante sera el prellenado del prompt de estado y el overhead de carga del adaptador.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada: se trata de un adaptador LoRA de tarea unica sobre un modelo base concreto, sin benchmarks estandar publicados. La comparacion mas informativa es interna, entre las etapas del propio pipeline, que ya se recoge en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-irelab-v2-choose-link01 | 0,8 B (base) + LoRA | no disponible | 100 % acierto en prueba; 100 % exito en 20 episodios | Apache 2.0 | HuggingFace (IRELAB) |
| Cerebro PPO (`brain.json`) | no disponible (politica del simulador) | no aplica | 100 % acierto; 100 % exito; 13,7 s | no disponible | Generado en el simulador web |
| Qwen3.5-0.8B sin adaptador | 0,8 B | no disponible | 1,4 % acierto; 0 % exito | no disponible | HuggingFace (Qwen) |

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo resuelve la tarea `choose_object` sobre el recorrido `db069b95`; fuera de ese contrato y ese entorno su comportamiento no esta caracterizado.
- Evaluacion simplificada: la marcha se mide con una tabla de velocidades 2D, sin modelo fisico ni red de locomocion, por lo que no se evaluan caidas ni dinamica real; el autor reconoce que los resultados pueden diferir de MuJoCo.
- Corpus pequeno: 689 ejemplos de entrenamiento y 216 de prueba limitan la generalizacion y hacen que las metricas tengan alta varianza.
- Idioma: la metadata declara solo coreano, aunque el prompt de sistema esta en ingles; no hay evaluacion multilingue.
- Riesgo de alucinacion en el formato: al ser un modelo de lenguaje, puede emitir texto fuera de la letra esperada si el prompt se desvia del formato exacto; el autor mitiga con un system prompt estricto y con la instruccion de tratar el estado como datos.
- Sesgos: no documentados por el autor; al entrenarse sobre un unico recorrido y una unica politica profesora, hereda los sesgos de esa politica.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor lo describe como modelo de investigacion y educacion sobre simulador y recomienda revalidar en el robot y el espacio reales antes de cualquier despliegue fisico.
- Dependencia del codigo auxiliar: el uso previsto requiere el paquete `connect_tycoon` (`questions.task_of`) para convertir observaciones en el formato de problema, lo que anade una dependencia externa al adaptador.
- Sin datos de cuantizacion ni de contexto: no se puede planificar despliegue en produccion sin verificar esos parametros en el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IRELAB/connectailab-rl-irelab-v2-choose-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
