# kareyoung09/connectailab-rl-kay09-yisunsin-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su proposito es actuar como modulo de decision de alto nivel para el robot bipedo LINK-01: a partir de la informacion de observacion del robot, el modelo selecciona la accion de alto nivel correspondiente a la tarea "ir al objetivo" (goto_target). Se trata, por tanto, de un modelo de reinforcement learning aplicado a robotica, no de un modelo de proposito general.

El modelo es un adaptador pequeno (el tamano del repositorio es de 0.0 GB, es decir, solo contiene los pesos del adaptador LoRA, no los del modelo base) que hereda la arquitectura y el contexto de Qwen/Qwen3.5-0.8B. La model card indica que el mejor metodo de entrenamiento fue SFT (supervised fine-tuning) y reporta una precision de examen del 70.7% y una tasa de exito en 20 rondas de conduccion real del 20.0%, lo que sugiere un ajuste todavia limitado para despliegue en el mundo fisico.

Su relevancia es acotada pero especifica: demuestra como un modelo linguistico de muy pocos parametros (0.8B) puede servir como politica de decision en un pipeline de robotica, con la ventaja de poder ejecutarse en hardware modesto y de integrarse mediante PEFT sobre un base model ya disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B (transformer decoder-only) |
| Parametros totales | no disponible (el repositorio solo contiene el adaptador LoRA; el base model es de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base model Qwen/Qwen3.5-0.8B, sin dato explicito) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0.8B parametros. La model card indica que el mejor metodo de entrenamiento fue SFT (supervised fine-tuning) y etiqueta el pipeline como reinforcement-learning con tags de deep-reinforcement-learning y PPO, aunque no se detalla en la informacion disponible si se aplico PPO de forma efectiva ni la composicion exacta del dataset. No se especifica el numero de tokens de entrenamiento ni si hubo RLHF o DPO adicional.

La innovacion tecnica destacable no esta en la arquitectura (que es la del base model) sino en el uso: el adaptador transforma un modelo linguistico pequeno en un decisor de acciones de alto nivel para el robot bipedo LINK-01, dentro de la tarea goto_target y con la persona "yisunsin". No se dispone de informacion sobre la representacion de las observaciones del robot, el espacio de acciones ni el esquema de recompensa.

## Capacidades

- Decision de alto nivel para robotica: selecciona la accion de alto nivel para la tarea goto_target a partir de observaciones del robot bipedo LINK-01.
- Ajuste supervisado (SFT) sobre un base model de 0.8B, orientado a una tarea concreta y acotada.
- Uso como adaptador LoRA: se carga sobre Qwen/Qwen3.5-0.8B con peft, sin necesidad de reentrenar el base model.
- Idioma de trabajo: coreano (ko).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en una unica decision de tarea.
- Capacidades multilingues: no disponibles; la model card solo declara coreano.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Control de navegacion de un robot bipedo: el modelo recibe la observacion del robot y decide la accion de alto nivel para dirigirse a un objetivo; es adecuado por su especializacion en la tarea goto_target y su bajo coste de inferencia (0.8B).
- Prototipado rapido de politicas de decision en robotica: al ser un adaptador LoRA sobre un base model pequeno, permite iterar sobre el esquema de observaciones y acciones sin reentrenar desde cero.
- Investigacion en SFT como politica de decision: sirve como referencia para comparar SFT frente a PPO u otros metodos en tareas de decision de alto nivel, dado que la model card reporta el metodo ganador y metricas de examen y conduccion.
- Simulacion y evaluacion offline: puede integrarse en entornos simulados para medir la tasa de exito de la politica antes de desplegarla en el robot fisico, dado que la model card reporta un 20.0% de exito en 20 rondas reales.
- Educacion y divulgacion en IA y robotica: ejemplo reproducible de un pipeline PEFT + Qwen 0.8B aplicado a un robot bipedo, con instrucciones de carga en la model card.
- Despliegue en hardware modesto: al apoyarse en un base model de 0.8B, es viable en GPUs de consumo, lo que facilita pilotos en laboratorios con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en examen (Accuracy) | 70.7% |
| Exito en 20 rondas de conduccion real (Drive Success) | 20.0% |
| Metodo de entrenamiento | SFT |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un base model de 0.8B con adaptador LoRA, la huella es reducida (del orden de pocos GB en precision completa y menos en cuantizacion de 8 o 4 bits), aunque no se confirma en la informacion.
- GPU recomendadas: no disponibles en la informacion; por tamano, un base model de 0.8B es apto para GPUs de consumo.
- Compatibilidad con GPU de consumo: probable por el tamano del base model, aunque no se confirma en la model card.
- Opciones de despliegue: carga mediante transformers + peft (documentada en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables identificados en la informacion proporcionada (mismo tamano o misma tarea de decision para robotica bipeda). Se indica "no disponible".

## Limitaciones y advertencias

- Tasa de exito real baja: 20.0% en 20 rondas de conduccion fisica, frente al 70.7% en examen; la brecha indica sobreajuste al conjunto de evaluacion o dificultad de transferencia al mundo real.
- Especializacion extrema: el modelo solo cubre la tarea goto_target y la persona "yisunsin"; no es un modelo de proposito general.
- Idioma limitado al coreano (ko); no se declaran otras lenguas.
- Dependencia del base model: requiere cargar Qwen/Qwen3.5-0.8B; el repositorio no incluye los pesos completos.
- No se documentan sesgos conocidos ni riesgo de alucinacion en la informacion disponible; en un decisor de robotica, una salida incorrecta puede traducirse en una accion fisica insegura.
- Sin datos sobre cuantizacion, contexto maximo ni latencia, lo que dificulta planificar un despliegue en produccion.
- Licencia apache-2.0: permite uso comercial, pero deben revisarse las condiciones del base model Qwen/Qwen3.5-0.8B y citar adecuadamente el proyecto CONNECT AI LAB × AI CITY BUILDERS.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yisunsin-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
