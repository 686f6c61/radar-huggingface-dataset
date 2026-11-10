# Mahesh111000/hanabi-qwen3-4b-norules100-checkpoints

## Resumen

Hanabi RL arm "norules100" es un experimento de ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base Qwen3-4B en su variante con modo thinking. Lo desarrolla el usuario Mahesh111000 y se publica como un repositorio de checkpoints que contiene tanto adaptadores LoRA intermedios como el resultado final fusionado en los pesos base. El objetivo declarado es entrenar al modelo en tareas de razonamiento sobre el juego cooperativo Hanabi, partiendo de prompts de "creencia propia" (own-belief) y eliminando el bloque de reglas del juego de todos los prompts de entrenamiento.

La relevancia de esta publicacion es acotada y de caracter experimental: no es un modelo de proposito general ni una version oficial de Qwen, sino un artefacto de investigacion que documenta una ejecucion de RL de 220 pasos con la herramienta prime-rl. El interes esta en el metodo (RL sobre un modelo de 4B con LoRA de rango 32) y en la decision de fusionar el adaptador en float32 para preservar la magnitud del update, un detalle tecnico poco habitual en publicaciones de adaptadores.

El repositorio ocupa 28,3 GB e incluye checkpoints cada 5 pasos de optimizador, lo que lo convierte en material util para reproducir o analizar la dinamica del entrenamiento mas que para despliegue directo en produccion. No se declara licencia, idiomas ni pipeline, y no hay resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B) con adaptadores LoRA fusionados |
| Parametros totales | 4B (modelo base Qwen3-4B; el adaptador no anade parametros en el checkpoint fusionado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (el checkpoint fusionado se publica en float32; los adaptadores LoRA en su formato original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA en `loras/step_N/` y modelo fusionado en `merged_fp32/step_220/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B en modo thinking y se ajusta con RL usando prime-rl durante 220 pasos. El entrenamiento emplea prompts de Hanabi en formato "own-belief", es decir, descripciones de la creencia del agente sobre el estado del juego, y en esta variante ("norules100") se elimina el bloque de reglas de Hanabi de todos los prompts. Los adaptadores LoRA tienen rango 32 y alpha 64, y se aplican sobre las proyecciones q, k, v, o, gate, up y down, lo que supone 252 matrices adaptadas.

El checkpoint final se publica fusionado en float32 con la formula W + 2.0 * B @ A sobre esas 252 matrices, mientras que el resto de tensores permanece igual que en el modelo base. El autor justifica explicitamente el uso de float32 porque el update es pequeno en relacion con la magnitud de los pesos y una fusion en bfloat16 redondearia parte de la actualizacion. Se guardan adaptadores cada 5 pasos de optimizador, lo que permite inspeccionar la evolucion del entrenamiento. No se detalla la composicion del dataset, el numero de tokens ni si hubo etapas adicionales de RLHF o DPO mas alla de esta ejecucion de RL.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, heredados del base Qwen3-4B.
- Razonamiento sobre el juego cooperativo Hanabi en el formato de prompts own-belief empleado en el entrenamiento.
- Capacidad de operar sin el bloque de reglas explicito en el prompt, segun el diseno del experimento "norules100".
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del base, no confirmado para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en RL para modelos de lenguaje: el repositorio permite analizar la evolucion de los adaptadores cada 5 pasos de optimizador y estudiar como cambia el comportamiento del modelo a lo largo de 220 pasos de entrenamiento.
- Estudio de razonamiento sin reglas explicitas: el brazo "norules100" sirve para comparar si el modelo internaliza las reglas de Hanabi o depende de que se le proporcionen en el prompt, un escenario util en investigacion sobre generalizacion.
- Reproduccion de experimentos con prime-rl: los checkpoints intermedios y el script de fusion documentado permiten replicar la configuracion de LoRA (rango 32, alpha 64, 252 matrices) en otros modelos o dominios.
- Analisis de precision en fusion de adaptadores: el checkpoint en float32 es un caso de estudio practico sobre el impacto del redondeo bfloat16 al fusionar updates pequenos.
- Evaluacion de modelos pequenos en juegos cooperativos: Qwen3-4B es lo bastante pequeno para ejecutarse en una sola GPU consumer, lo que facilita experimentos de evaluacion con muchas partidas.
- Punto de partida para ajustes posteriores: el adaptador fusionado puede servir como inicializacion para RL adicional sobre Hanabi u otros juegos de teoria de la mente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fusionado en float32 de un modelo de 4B requiere aproximadamente 16 GB solo para los pesos, mas overhead de activaciones y cache KV; en bfloat16 serian unos 8 GB y en cuantizacion de 4 bits alrededor de 2,5-3 GB.
- GPU recomendadas: A100 o H100 para servir el checkpoint float32 sin conversion; RTX 4090 (24 GB) para el modelo en bfloat16 o float32 con margen limitado.
- GPU consumer: si, el modelo base de 4B cabe en GPUs consumer de 8 GB o mas tras cuantizacion, y en 16-24 GB en bfloat16.
- Opciones de despliegue: vLLM, TGI o llama.cpp para el modelo fusionado una vez convertido a bfloat16 o cuantizado; los adaptadores LoRA pueden servirse con PEFT sobre el base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hanabi RL norules100 (este) | 4B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental de RL, sin evaluacion publicada |
| Qwen/Qwen3-4B | 4B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face, modelo base oficial | Base sin ajuste de RL para Hanabi |
| Alternativas de 4B para RL experimental | 4B | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no hay evaluacion publicada de calidad, seguridad ni rendimiento, por lo que no es recomendable para produccion.
- El entrenamiento se limita a un dominio muy concreto (Hanabi con prompts own-belief) y puede degradar capacidades generales del base Qwen3-4B.
- La variante "norules100" elimina las reglas del juego del prompt; su comportamiento fuera de ese formato no esta documentado.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del base Qwen3-4B y del autor.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion proporcionada; se heredan los del modelo base.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.
- El checkpoint fusionado en float32 ocupa 28,3 GB en el repositorio e incluye multiples checkpoints intermedios, lo que complica su descarga y despliegue directo.
- Sin pipeline declarado ni tarjeta de modelo con metricas: la integracion en herramientas estandar requiere conversion manual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mahesh111000/hanabi-qwen3-4b-norules100-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- prime-rl (herramienta de RL citada por el autor): no disponible en la informacion proporcionada
- Paper o blog del experimento: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
