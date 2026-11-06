# kareyoung09/connectailab-rl-kay09-yeonsangun-target-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo (PPO) construido sobre el modelo de lenguaje Qwen/Qwen3.5-0.8B, publicado por kareyoung09 en el ecosistema CONNECT AI LAB × AI CITY BUILDERS. Su funcion es actuar como capa de decision de alto nivel para el robot bipedo LINK-01: recibe observaciones del entorno y emite acciones discretas orientadas a la tarea `goto_target` (desplazarse hasta un objetivo). No es un modelo generativo de proposito general, sino un policy head especializado que transforma observaciones en decisiones.

El modelo se distribuye como adaptador PEFT (formato safetensors) y requiere cargar el modelo base Qwen3.5-0.8B para funcionar. Con 0.8 mil millones de parametros en la base y una huella de repositorio practicamente nula (0.0 GB), esta pensado para inferencia ligera en entornos de robotica donde el presupuesto de computo y latencia es ajustado. La model card reporta una precision del 76.5% en el conjunto de prueba y un 50.0% de exito en 20 episodios de conduccion reales.

Su relevancia actual radica en la tendencia de usar LLM pequenos como planificadores de alto nivel en robotica (embodied AI), combinando el conocimiento linguistico del modelo base con un ajuste por RL especifico de la tarea. La licencia Apache 2.0 facilita su integracion, aunque el idioma declarado es exclusivamente coreano (`ko`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador LoRA/PEFT entrenado por RL (PPO) |
| Parametros totales | 0.8 mil millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors del adaptador) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere Qwen/Qwen3.5-0.8B en safetensors |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0.8 mil millones de parametros. El ajuste se realizo mediante aprendizaje por refuerzo con PPO (Proximal Policy Optimization), segun los tags del repositorio (`ppo`, `reinforcement-learning`, `deep-reinforcement-learning`). El objetivo de entrenamiento es una politica de decision de alto nivel para el robot LINK-01 en la tarea `goto_target`, no la generacion de texto libre. La model card identifica esta configuracion como la mejor variante (`Best Method: RL`) dentro de una comparacion interna de metodos.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, la funcion de recompensa, el numero de pasos de RL ni hiperparametros como el rango del adaptador LoRA o el coeficiente KL. Tampoco se documenta si hubo fases previas de SFT o DPO. Estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Decision de alto nivel para robotica: mapea observaciones del robot bipedo LINK-01 a acciones orientadas a la tarea `goto_target`.
- Politica entrenada por RL (PPO) sobre un LLM pequeno, apta para control reactivo de bajo coste computacional.
- Comprension de instrucciones y observaciones en coreano, idioma unico declarado.
- Integracion via PEFT: se carga como adaptador sobre Qwen3.5-0.8B con `PeftModel`.
- Capacidades generativas generales heredadas del modelo base Qwen3.5-0.8B (no documentadas especificamente para este adaptador).
- Soporte de tool calling, function calling, agentes multi-paso, vision o audio: no disponible.

## Casos de uso

- Navegacion de robot bipedo hacia un objetivo: el adaptador recibe el estado observado del LINK-01 y selecciona la accion de alto nivel para aproximarse al punto objetivo, sustituyendo heuristicas manuales por una politica aprendida.
- Planificacion de alto nivel en bucle cerrado: integrado en un pipeline donde un controlador de bajo nivel ejecuta las acciones discretas emitidas por el modelo, con reevaluacion a cada paso de observacion.
- Prototipado rapido de politicas en simulacion: al ser un adaptador LoRA sobre un modelo de 0.8B, permite iterar y desplegar variantes de politica con coste de almacenamiento minimo.
- Experimentos de RL aplicado a embodied AI: util como baseline reproducible para comparar metodos de entrenamiento (la model card reporta `Best Method: RL` frente a otras variantes).
- Evaluacion comparativa de planificadores LLM en robotica: sirve para medir si un LLM pequeno ajustado por RL alcanza tasas de exito aceptables (50.0% en 20 episodios reales) frente a controladores clasicos.
- Despliegue en hardware de robot con recursos limitados: el tamano del modelo base (0.8B) y la naturaleza del adaptador permiten inferencia en GPUs de gama media o incluso CPU, segun la cuantizacion aplicada al modelo base.
- Investigacion en interaccion lenguaje-accion en coreano: escenario util para estudiar como un LLM coreano interpreta observaciones y genera decisiones en dominios fisicos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en el conjunto de prueba (Accuracy) | 76.5% |
| Exito en 20 episodios de conduccion real (Drive Success) | 50.0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas internas de la tarea `goto_target` reportadas por el autor y no son comparables directamente con benchmarks de LLM de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo base de 0.8B, una estimacion orientativa en FP16 ronda 1.6-2 GB de pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits o 4 bits seria inferior, pero no se documenta soporte de cuantizacion para este adaptador.
- GPU recomendadas: no disponible. Por tamano, el modelo base cabe en GPUs consumer (RTX 3060, RTX 4060, RTX 4090) y en aceleradores de datacenter (A100, H100) con margen amplio.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM para el modelo base en FP16, aunque no se confirma oficialmente.
- Opciones de despliegue: carga via `transformers` + `peft` (metodo documentado en la model card). Compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y requeriria fusionar el adaptador con el modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0.8B (base) + LoRA | no disponible | RL/PPO para robotica bipeda, tarea goto_target | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-0.8B (base) | 0.8B | no disponible | LLM generativo general | no disponible en la informacion | Hugging Face |
| Alternativas de robotica con LLM pequeno | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la misma tarea (planificacion de alto nivel para robot bipedo mediante LLM ajustado por RL). La comparativa queda limitada al modelo base.

## Limitaciones y advertencias

- Rendimiento limitado en el mundo real: 50.0% de exito en 20 episodios de conduccion indica que la politica falla aproximadamente la mitad de las veces; no es apta para despliegue autonomo sin supervision.
- Volumen de evaluacion pequeno: 20 episodios es una muestra reducida; las cifras tienen alta varianza y no garantizan generalizacion.
- Idioma restringido: declarado solo para coreano; el rendimiento en castellano u otros idiomas no esta validado.
- Especializacion estrecha: entrenado para una unica tarea (`goto_target`) y una persona/robot concretos (LINK-01, `yeonsangun`); no es un modelo de proposito general.
- Dependencia del modelo base: requiere Qwen3.5-0.8B; cualquier cambio o indisponibilidad del base afecta al adaptador.
- Documentacion incompleta: no se detallan datos de entrenamiento, recompensa, hiperparametros ni contexto, lo que dificulta reproducir o auditar el entrenamiento.
- Riesgo de alucinacion: al ser un LLM subyacente, puede generar decisiones incoherentes ante observaciones fuera de distribucion; no se documentan mecanismos de seguridad.
- Sesgos: no documentados, pero el modelo base y los datos de entrenamiento en coreano pueden introducir sesgos no evaluados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de garantias y el bajo rendimiento real exigen validacion propia antes de produccion.
- Repositorio sin traccion: 0 descargas y 0 likes; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kareyoung09/connectailab-rl-kay09-yeonsangun-target-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Libreria PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
