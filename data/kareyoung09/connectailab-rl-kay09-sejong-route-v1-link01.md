# kareyoung09/connectailab-rl-kay09-sejong-route-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su funcion es actuar como modulo de decision de alto nivel para el robot bipedo LINK-01: a partir de las observaciones del entorno, el modelo selecciona la accion de alto nivel que debe ejecutar el robot. La tarea concreta de esta version es el seguimiento de rutas (follow_route) con la persona "sejong".

El modelo no es un LLM de proposito general, sino un adaptador de reinforcement learning/decision-making afinado con SFT (supervised fine-tuning) sobre una base de apenas 0,8 mil millones de parametros. Segun la model card, alcanza un 86,2 % de acierto en el conjunto de examen y un 100 % de exito en 20 rondas de conduccion real. Es relevante porque demuestra que un modelo de lenguaje pequeno, adaptado con LoRA, puede servir como politica de decision embebida en robotica con requisitos de latencia y computo muy ajustados.

La ficha se basa exclusivamente en la informacion publicada en HuggingFace y en la model card del autor; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (base de 0,8B; el adaptador LoRA anade un numero no especificado de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no documentada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (library_name: peft) montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador modifica un subconjunto de pesos del modelo base para especializarlo en la tarea de decision de alto nivel del robot LINK-01. El pipeline declarado es reinforcement-learning, con tags de deep-reinforcement-learning y PPO, aunque la model card indica que el mejor metodo obtenido fue SFT (supervised fine-tuning), es decir, el ajuste final se realizo con aprendizaje supervisado sobre trayectorias/observaciones etiquetadas.

No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican hiperparametros del LoRA (rango, alpha, modulos objetivo) ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El enfoque practico consiste en mapear observaciones del robot bipedo a acciones de alto nivel dentro de la tarea follow_route.

## Capacidades

- Decision de alto nivel para robotica: selecciona acciones a partir de observaciones del robot bipedo LINK-01.
- Seguimiento de rutas (follow_route): tarea especifica de navegacion por trayectoria.
- Ajuste supervisado (SFT) sobre el modelo base Qwen3.5-0.8B mediante LoRA.
- Etiquetado como reinforcement-learning / deep-reinforcement-learning / PPO en los metadatos del repositorio.
- Soporte de idioma coreano (ko) unicamente.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Navegacion autonoma de robot bipedo: el modelo recibe las observaciones del entorno y decide la accion de alto nivel para seguir una ruta predefinida; su tasa de exito del 100 % en 20 rondas de conduccion real lo respalda para este escenario.
- Politica de decision embebida en robotica de bajo consumo: al partir de una base de 0,8B y un adaptador LoRA, puede desplegarse en hardware con recursos limitados a bordo del robot.
- Prototipado rapido de politicas de navegacion: sirve como punto de partida para experimentar con variantes de tarea o persona mediante nuevos adaptadores LoRA sobre la misma base.
- Validacion en simulacion antes de despliegue fisico: el modelo puede evaluarse contra el conjunto de examen (86,2 % de acierto) antes de llevarlo al robot real.
- Investigacion en RL aplicado a robotica: util como referencia reproducible de un pipeline SFT/LoRA para decision de alto nivel en robots bipedos.
- Integracion en el ecosistema CONNECT AI LAB / LINK-01: modulo de decision dentro de la arquitectura del proyecto AI CITY BUILDERS para tareas de routing urbano simulado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en examen (Accuracy) | 86,2 % |
| Exito en conduccion real (20 rondas) | 100,0 % |
| Metodo de ajuste | SFT |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las metricas anteriores son especificas de la tarea follow_route del proyecto LINK-01 y no son comparables con benchmarks de LLM de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de una base de 0,8B con adaptador LoRA, la huella es reducida y cabe en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no especificadas por el autor; por tamano del modelo base, una GPU de consumo moderna es suficiente, pero no hay datos oficiales.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 0,8B del modelo base; sin confirmacion del autor.
- Opciones de despliegue: carga mediante transformers + peft (AutoModelForCausalLM + PeftModel), segun el ejemplo de la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | Base 0,8B + LoRA | No disponible | Decision robotica follow_route | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | LLM general | No disponible en esta ficha | HuggingFace |
| Alternativas de politica robotica de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables especificos de decision robotica en la informacion proporcionada; la unica referencia directa es el modelo base Qwen3.5-0.8B.

## Limitaciones y advertencias

- Especializacion muy estrecha: solo cubre la tarea follow_route para la persona "sejong"; no es un modelo de proposito general.
- Idioma limitado al coreano; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sin datos publicados sobre sesgos, tasas de alucinacion o robustez fuera del dominio de entrenamiento.
- Las metricas (86,2 % de acierto y 100 % en 20 rondas) proceden unicamente de la model card del autor y no han sido verificadas de forma independiente; el tamano de la muestra de conduccion real (20 rondas) es reducido.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.
- No se documentan requisitos de hardware, latencia ni cuantizaciones, lo que dificulta planificar un despliegue en produccion.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base Qwen3.5-0.8B, no detallada en esta ficha.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-kay09-sejong-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
