# moona-ai/saseo-brain-v0.1

## Resumen

Saseo Brain v0.1 es un adaptador LoRA publicado por moona-ai sobre el modelo base Qwen/Qwen3.5-0.8B. Segun la model card, esta especializado en tareas de decision bibliotecaria (사서 의사결정 특화 어댑터), es decir, en asistentes que ayudan a tomar decisiones dentro del dominio de una biblioteca. El repositorio publico contiene unicamente los pesos del adaptador y los ficheros del tokenizer, sin datos ni codigo de entrenamiento.

El modelo se distribuye como adaptador PEFT en formato safetensors, con un unico idioma declarado (coreano, `ko`) y sin licencia especificada en la informacion disponible. Al estar construido sobre un modelo base de 0.8B parametros, el coste computacional de inferencia es bajo, lo que lo hace apto para despliegues en hardware modesto siempre que se cargue junto al modelo base.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino un ajuste fino orientado a un dominio concreto (decisiones de biblioteca) en coreano. La informacion publica es escasa (0 descargas, 0 likes, sin benchmarks ni pipeline declarado), por lo que debe evaluarse como un adaptador experimental de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador se construye mediante LoRA (Low-Rank Adaptation) sobre el modelo Qwen/Qwen3.5-0.8B, un transformer decoder-only. Segun la model card, el entrenamiento consistio en un "Continue SFT" (ajuste supervisado continuado) sobre un adaptador previo denominado "Moonbrain LoRA". El formato de entrenamiento usa como entrada unicamente la tarea (`task`) y como salida unicamente la respuesta (`answer`), lo que sugiere un pipeline de instrucciones de tipo tarea-respuesta orientado a decisiones bibliotecarias.

La evaluacion, segun el autor, se realizo con la misma plantilla de chat (`chat_template`) y con `enable_thinking=False`, lo que indica que el modelo base dispone de un modo de razonamiento ("thinking") que se desactiva para estas tareas. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se detalla el rango ni los modulos objetivo del LoRA.

## Capacidades

- Generacion de texto en coreano orientada a tareas de decision bibliotecaria.
- Respuesta a instrucciones de tipo tarea-respuesta segun el formato de entrenamiento declarado.
- Razonamiento desactivable: el modelo base soporta `enable_thinking=False`, usado en la evaluacion del adaptador.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad de vision, audio ni otras modalidades.
- Capacidad multilingue no disponible: solo se declara coreano.

## Casos de uso

- Asistente de decision bibliotecaria: el adaptador se ha entrenado especificamente para tareas de decision en el contexto de una biblioteca (seleccion, clasificacion o recomendacion de material), por lo que su uso principal es responder a ese tipo de consultas en coreano.
- Clasificacion y enrutado de consultas de usuarios: dado su formato tarea-respuesta, puede emplearse para etiquetar o decidir la accion adecuada ante una solicitud de un usuario de biblioteca.
- Prototipado rapido de asistentes de nicho: al ser un adaptador LoRA sobre un modelo de 0.8B, permite experimentar con bajo coste de computo en entornos de desarrollo.
- Integracion en sistemas de gestion bibliotecaria: puede conectarse a un backend que formule tareas estructuradas y consuma la respuesta del modelo para automatizar decisiones rutinarias.
- Evaluacion comparativa de adaptadores: sirve como ejemplo de ajuste fino sobre Qwen3.5-0.8B para estudiar el efecto de LoRA en dominios verticales.
- Despliegue en hardware modesto: al combinarse con un modelo base de 0.8B, puede ejecutarse en GPU de consumo o incluso en CPU con cuantizacion del modelo base, para tareas de baja latencia y volumen moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; al tratarse de un adaptador sobre un modelo de 0.8B, la VRAM depende del modelo base y de su cuantizacion (un modelo de 0.8B en FP16 ocupa aproximadamente 1.6 GB de pesos, mas overhead de activaciones y KV cache).
- GPU recomendadas: no disponible; por tamano del modelo base, cabe en GPU de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, siempre que se cargue el modelo base de 0.8B (el adaptador anade un coste marginal).
- Opciones de despliegue: PEFT + Transformers (metodo documentado en la model card); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| moona-ai/saseo-brain-v0.1 | Adaptador LoRA sobre 0.8B | no disponible | no disponible | safetensors (PEFT) | Especializado en coreano y dominio bibliotecario |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | no disponible | no disponible en la informacion proporcionada | safetensors | Modelo generalista sobre el que se aplica el adaptador |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros adaptadores equivalentes en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- El adaptador solo declara soporte de coreano; su comportamiento en castellano u otros idiomas no esta verificado.
- No se publican datos de entrenamiento, por lo que no puede evaluarse la composicion del dataset ni posibles sesgos.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de benchmarks que cuantifiquen su fiabilidad.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado; debe tratarse como un artefacto experimental sin validacion externa.
- El adaptador requiere cargar el modelo base Qwen/Qwen3.5-0.8B; no es un modelo autonomo.
- La evaluacion se realizo con `enable_thinking=False`; su comportamiento con el modo de razonamiento activado no esta documentado.
- No se especifican limitaciones de contexto propias; estas dependen del modelo base y no se detallan.

## Enlaces

- Hugging Face: https://huggingface.co/moona-ai/saseo-brain-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
