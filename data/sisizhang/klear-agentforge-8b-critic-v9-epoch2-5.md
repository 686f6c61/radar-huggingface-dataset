# sisizhang/klear-agentforge-8b-critic-v9-epoch2-5

## Resumen

Klear-AgentForge-8B-Critic-V9-epoch2-5 es un modelo de valor (critic) para aprendizaje por refuerzo, derivado por ajuste fino del modelo base Kwai-Klear/Klear-AgentForge-8B-SFT. Lo publica el usuario `sisizhang` en Hugging Face y su proposito no es la generacion de texto, sino estimar el valor causal del estado previo a cada accion dentro de un agente de codigo. Se emplea como inicializacion del critic en un bucle de PPO en linea sobre tareas de reparacion de software del conjunto SWE-smith.

El modelo aprende una funcion de valor sobre trayectorias de agente: para acciones que modifican el espacio de trabajo, el proyecto construye una recompensa de proceso a partir de la evolucion de las pruebas F2P/P2P (fail-to-pass y pass-to-pass), que se combina con la recompensa terminal 0/1. Los resultados de las pruebas ocultas solo se usan para generar etiquetas y nunca entran como entrada de inferencia del critic, lo que evita filtraciones en el calculo del valor.

La relevancia es acotada pero tecnica: forma parte de una cadena de entrenamiento abierta (modelo base, dataset de tareas, actor PPO en el paso 17 y un Space de resultados) que documenta con cifras concretas el criterio de seleccion del checkpoint. El checkpoint publicado corresponde a la epoca 2.5, elegido por una regla predefinida de error cuadratico medio (MSE) de seleccion de 0,233224. El modelo tiene 8B parametros (heredados del base, segun la nomenclatura), licencia MIT e idioma declarado ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivado de Klear-AgentForge-8B-SFT (familia basada en Qwen3 segun el proyecto Klear-AgentForge) |
| Parametros totales | 8B (segun nomenclatura del modelo base) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (cuatro fragmentos), mas indice, configuracion, tokenizer y chat template |

## Arquitectura y entrenamiento

El modelo es un critic de valor para PPO en linea. Parte del ajuste fino supervisado `Kwai-Klear/Klear-AgentForge-8B-SFT` y se guarda desde el checkpoint `swesmith-v9-sft-lr1x-quarter-e3-20261025-v1/output/checkpoints/epoch-2.5/model`. El repositorio incluye unicamente los pesos en cuatro fragmentos safetensors junto con indice, configuracion, tokenizer y chat template; no contiene estado del optimizador, estado aleatorio ni el resto del checkpoint de entrenamiento.

El entrenamiento se apoya en el dataset `sisizhang/swesmith-critic-ppo-tasks`, que publica 1.761 paquetes de tareas congeladas. La senal de recompensa combina una recompensa de proceso, construida a partir del progreso de las pruebas F2P/P2P cuando una accion modifica el espacio de trabajo, con la recompensa terminal 0/1. En el bucle de PPO en linea, el critic se actualiza durante dos rondas antes de recalcular las ventajas y actualizar el actor. El criterio de seleccion del checkpoint fue el MSE de seleccion (0,233224); el MSE de calificacion fue 0,255830 y la varianza explicada 0,063254. El autor advierte que el conjunto de calificacion se reviso repetidamente y solo sirve como diagnostico, no como puerta de generalizacion a repositorios no vistos.

## Capacidades

- Estimacion de valor causal del estado previo a una accion en trayectorias de agente de codigo.
- Puntuacion de acciones que modifican el espacio de trabajo mediante recompensa de proceso derivada de pruebas F2P/P2P.
- Integracion como critic en PPO en linea para calcular ventajas y guiar la actualizacion del actor.
- Entrada limitada a observaciones del agente; las etiquetas de pruebas ocultas no forman parte de la inferencia.
- Uso en ingles.
- No es un modelo de generacion de texto: cargar los pesos por si solo no reproduce la recompensa de proceso ni el entrenamiento PPO.

## Casos de uso

- Inicializacion de un critic en PPO para agentes de reparacion de software: se carga como modelo de valor y se actualiza dos rondas por iteracion antes de recalcular ventajas, tal como describe el autor.
- Puntuacion de trayectorias en tareas SWE-smith: el modelo evalua el estado previo a cada accion sobre los 1.761 paquetes de tareas publicados para priorizar rollouts.
- Investigacion en recompensas de proceso: sirve para estudiar como el progreso F2P/P2P se traduce en senal de valor, con las cifras de MSE de seleccion y calificacion como referencia.
- Reproduccion parcial de experimentos: combinado con el actor del paso 17 (`klear-agentforge-8b-ppo-step17`) y el Space del proyecto, permite contrastar resultados con la misma metodologia.
- Analisis de varianza explicada en criticos de codigo: la cifra de 0,063254 documenta la dificultad de predecir el valor en este dominio y sirve como linea base para comparaciones.
- Formacion y evaluacion de pipelines de RL para agentes: el modelo y el dataset permiten montar entornos de entrenamiento con senal de recompensa verificable por pruebas, sin depender de etiquetas humanas.
- Diagnostico de sobreajuste: al haber revisado repetidamente el conjunto de calificacion, el modelo es util para ilustrar practicas de seleccion de checkpoints y sus riesgos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MSE de seleccion | 0,233224 |
| MSE de calificacion | 0,255830 |
| Varianza explicada | 0,063254 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo de 8B en precision completa (BF16/FP16) se requiere del orden de 16 GB solo para pesos, mas memoria para activaciones y contexto.
- GPU recomendadas: no indicadas por el autor. Por tamano, cabria en GPU de 24 GB o mas en BF16, y en GPU consumer de 16-24 GB con cuantizacion, aunque no se documentan cuantizaciones oficiales.
- Cabe en GPU consumer: previsiblemente si con cuantizacion, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aparecen en la informacion). Al ser un critic de PPO, su uso tipico es dentro del bucle de entrenamiento en lugar de como servidor de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klear-AgentForge-8B-Critic-V9-epoch2.5 | 8B | No disponible | Critic de valor para PPO en agentes de codigo | MIT | Hugging Face |
| Klear-AgentForge-8B-SFT | 8B | No disponible | Modelo base ajustado para agentes | No disponible en la informacion | Hugging Face (acceso con consentimiento) |
| Klear-AgentForge-8B-PPO-step17 | 8B | No disponible | Actor de politica PPO | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de generacion de texto; su uso fuera del contexto de critic de PPO carece de sentido practico.
- Cargar los pesos no reproduce la recompensa de proceso ni el entrenamiento PPO: faltan rollouts originales, etiquetas de proceso por token y estado completo de entrenamiento.
- El conjunto de calificacion se reviso repetidamente; no constituye una puerta de generalizacion a repositorios no vistos.
- La varianza explicada es baja (0,063254), lo que indica capacidad limitada para explicar la variabilidad del retorno.
- Solo soporta ingles.
- El modelo base exige aceptar condiciones de acceso en su pagina de Hugging Face; deben respetarse sus terminos.
- Riesgo de sesgo y alucinacion no documentado por el autor; al ser un modelo de valor, los errores se manifiestan como estimaciones de valor sesgadas que pueden degradar el entrenamiento del actor.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sisizhang/klear-agentforge-8b-critic-v9-epoch2-5
- Dataset de tareas: https://huggingface.co/datasets/sisizhang/swesmith-critic-ppo-tasks
- Actor PPO paso 17: https://huggingface.co/sisizhang/klear-agentforge-8b-ppo-step17
- Space del proyecto: https://huggingface.co/spaces/sisizhang/harbor-agent-ppo
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-AgentForge-8B-SFT
- Repositorio GitHub Klear-AgentForge: https://github.com/Kwai-Klear/Klear-AgentForge
- Paper Klear-AgentForge: https://arxiv.org/abs/2511.05951
