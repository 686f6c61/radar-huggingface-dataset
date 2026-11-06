# kareyoung09/connectailab-rl-kay09-yeonsangun-obstacle-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor kareyoung09 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su proposito es actuar como modulo de decision de alto nivel para el robot bipedo LINK-01: a partir de las observaciones del entorno, el modelo selecciona una accion de alto nivel. La tarea concreta de esta version es la evitacion de obstaculos (avoid_obstacles), asociada a la persona "yeonsangun".

El modelo no es un generador de texto de proposito general, sino un componente de un pipeline de robotica que traduce observaciones en decisiones. Se distribuye como adaptador LoRA sobre un modelo de 0,8 mil millones de parametros, lo que lo hace extremadamente ligero en terminos de almacenamiento y despliegue. La model card reporta una precision del 80,0 % en el examen de evaluacion, pero un 0,0 % de exito en 20 pruebas de conduccion reales, una discrepancia critica que debe tenerse muy en cuenta.

Su relevancia actual es limitada y fundamentalmente experimental: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicos, y con un rendimiento en simulacion real que invalida su uso en produccion. Resulta util como referencia metodologica para quienes exploran el uso de modelos de lenguaje pequenos como policy networks en robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El pipeline declarado es reinforcement-learning, con etiquetas que mencionan PPO y deep reinforcement learning, aunque la model card indica explicitamente que el mejor metodo obtenido fue SFT (supervised fine-tuning). Esta contradiccion entre las etiquetas y el resultado declarado sugiere que se probaron varias estrategias y la supervision directa fue la que mejor rindio en el conjunto de examen.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El adaptador esta orientado a una tarea de decision discreta en el contexto del robot LINK-01, por lo que la salida esperada son acciones de alto nivel y no texto libre.

## Capacidades

- Decision de alto nivel para robotica: selecciona acciones a partir de observaciones del entorno del robot bipedo LINK-01.
- Tarea especifica de evitacion de obstaculos (avoid_obstacles) dentro del proyecto LINK-01.
- Entrenamiento mediante SFT sobre el modelo base Qwen3.5-0.8B con adaptador LoRA.
- Soporte de inferencia mediante transformers + peft (carga del adaptador sobre el modelo base).
- Idioma de trabajo: coreano.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades multilingues mas alla del coreano.

## Casos de uso

- Investigacion en robotica con modelos de lenguaje pequenos: usar el adaptador como policy network de referencia para estudiar como un LLM de 0,8B puede mapear observaciones a acciones de alto nivel en un bipedo, comparando SFT frente a PPO.
- Reproduccion de experimentos del proyecto LINK-01: cargar el adaptador sobre Qwen3.5-0.8B con transformers y peft para replicar la evaluacion del examen y contrastarla con la tasa de exito en conduccion real.
- Analisis de la brecha simulacion-realidad: el contraste entre 80,0 % de precision en examen y 0,0 % de exito en 20 pruebas reales lo convierte en un caso de estudio util sobre sobreajuste a conjuntos de evaluacion en robotica.
- Prototipado de pipelines de decision en entornos controlados: integrar el adaptador en un bucle de simulacion donde las observaciones se serialicen como texto y la accion de alto nivel se parsee de la salida del modelo.
- Docencia y formacion: ejemplo didactico de fine-tuning con LoRA sobre un modelo base pequeno para una tarea de decision concreta, con licencia Apache 2.0 que facilita su uso en cursos.
- Base para iteracion interna: punto de partida para equipos que quieran reentrenar el adaptador con mas datos o con RL (PPO) y comparar resultados frente a la version SFT publicada.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes:

| Metrica | Resultado |
|---|---|
| Precision en examen (Accuracy) | 80,0 % |
| Exito en conduccion real (20 pruebas) | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8 mil millones de parametros; en FP16 requiere aproximadamente 1,6 GB solo para pesos, y en cuantizacion de 8 bits alrededor de 0,8 GB. El adaptador LoRA anade un consumo marginal. No se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 cubren el modelo con holgura. Para despliegue en servidor, A100 o H100 no son necesarias por tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, y potencialmente en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT la integracion con esos motores requeriria fusionar el adaptador con el modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para decision robotica sobre modelos de menos de 1B). Se ofrece una comparacion estructural con el modelo base y con alternativas genericas de distinto perfil:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | No disponible | Decision robotica (avoid_obstacles) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | LLM generico | No disponible en la informacion | Modelo base publico |
| Alternativas de robotica con LLM | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Brecha critica simulacion-realidad: 80,0 % de precision en examen frente a 0,0 % de exito en 20 pruebas de conduccion real. El modelo no es apto para uso en produccion ni en robots fisicos sin una reevaluacion completa.
- Contradiccion entre etiquetas y metodo: las etiquetas indican PPO y reinforcement learning, pero la model card declara SFT como mejor metodo; conviene verificar que artefacto se esta cargando.
- Sesgos conocidos: no documentados, pero el entrenamiento esta limitado al coreano y a una unica tarea y persona del proyecto LINK-01.
- Riesgo de alucinacion: alto en la medida en que el modelo base es un LLM generativo y la salida debe interpretarse como accion estructurada; no se documenta un parser o validador de acciones.
- Limitaciones de idioma: solo coreano declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar conversaciones o secuencias de observacion largas.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de garantias y el rendimiento real nulo desaconsejan cualquier despliegue comercial.
- Madurez: repositorio de 0,0 GB, cero descargas y cero likes; sin mantenimiento ni comunidad verificable.
- Ausencia de benchmarks estandar: no es posible comparar su calidad con otros modelos de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yeonsangun-obstacle-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
