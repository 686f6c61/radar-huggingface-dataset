# GOVINDFROM/coherence-reward-qwen3-4b-lora

## Resumen

`coherence-reward-qwen3-4b-lora` es una coleccion de adaptadores LoRA de investigacion entrenados sobre el modelo base Qwen/Qwen3-4B, publicados por el usuario GOVINDFROM. Forma parte del estudio de entrenamiento *Coherence as a Reward*, cuyo objetivo es explorar metodos de aprendizaje por refuerzo (GRPO) que utilizan la coherencia como senal de recompensa en lugar de, o junto a, recompensas basadas en exactitud. El dominio de trabajo es el razonamiento clinico sobre pacientes sinteticos del corpus publico DDXPlus.

El repositorio no contiene un modelo completo, sino unicamente los pesos de los adaptadores. Cada carpeta corresponde a una ejecucion experimental concreta con la estructura `<arm>_s<seed>/final` y checkpoints intermedios `<arm>_s<seed>/step_XXXX`, donde los brazos experimentales se definen en los ficheros `config/train/<arm>.yaml` del repositorio de codigo asociado. El modelo base se utiliza con el modo de razonamiento (thinking) desactivado y se aplica LoRA con rango 32 sobre todas las capas lineales.

La relevancia de esta publicacion es metodologica: sirve para reproducir y auditar un estudio sobre como distintas formulaciones de recompensa afectan a la coherencia de las cadenas de razonamiento en tareas de diagnostico diferencial. No esta pensada como un modelo de produccion ni como herramienta clinica, y el propio autor lo declara explicitamente como material de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA sobre capas lineales |
| Parametros totales | 4B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen/Qwen3-4B; valor no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PEFT/LoRA (formato de la libreria `peft`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer decoder-only de la familia Qwen3. Sobre el se aplican adaptadores LoRA de rango r = 32 en todas las capas lineales, con el modo de razonamiento (thinking) desactivado. El entrenamiento utiliza GRPO (Group Relative Policy Optimization) como algoritmo de aprendizaje por refuerzo, con una formulacion de recompensa centrada en la coherencia de las respuestas, segun el titulo del estudio.

Los datos de entrenamiento son pacientes sinteticos generados a partir del corpus publico DDXPlus; no se emplean datos reales de pacientes. El repositorio contiene unicamente los pesos de los adaptadores: no se almacenan datos de entrenamiento, prompts, rollouts ni salidas de evaluacion. El diseno experimental, el codigo y la preregistracion estan disponibles en el repositorio de GitHub y en OSF enlazados por el autor. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Qwen3-4B, con el modo thinking desactivado.
- Razonamiento clinico orientado a diagnostico diferencial sobre casos sinteticos de DDXPlus.
- Generacion de cadenas de razonamiento cuya coherencia ha sido optimizada mediante recompensa durante el entrenamiento.
- Capacidades heredadas del modelo base Qwen3-4B (no verificadas de forma independiente en esta publicacion).
- Soporte de tool calling, function calling, agentes y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (vision, audio): no disponible en la informacion.

## Casos de uso

- Reproduccion de experimentos de RL: cargar los checkpoints `final` o `step_XXXX` de cada brazo y semilla para replicar las curvas de entrenamiento del estudio *Coherence as a Reward* y verificar los resultados publicados.
- Investigacion sobre funciones de recompensa: comparar brazos experimentales que difieren en la formulacion de la recompensa (coherencia frente a exactitud) para estudiar como afecta cada una a la calidad del razonamiento generado.
- Analisis de coherencia en cadenas de razonamiento: usar los adaptadores para generar razonamientos clinicos sobre casos DDXPlus y medir metricas de consistencia interna, deteccion de contradicciones y estabilidad entre muestras.
- Estudio de tecnicas PEFT: servir como ejemplo practico de LoRA r = 32 sobre todas las capas lineales de un modelo de 4B, util para comparar con otras configuraciones de adaptadores en la literatura.
- Auditoria de metodologia de RL: examinar la preregistracion en OSF y el codigo en GitHub junto con los pesos para evaluar la trazabilidad del estudio y detectar posibles sesgos de seleccion de checkpoints.
- Docencia en aprendizaje por refuerzo: utilizar los brazos y semillas como material didactico para ilustrar la variabilidad entre ejecuciones de GRPO con distintas semillas y formulaciones de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Como referencia general, el modelo base de 4B en precision completa requiere del orden de 8-10 GB solo para pesos; con cuantizacion de 8 bits o 4 bits se reduce sustancialmente, pero el autor no publica cifras ni configuraciones probadas.
- GPU recomendadas: no disponible en la informacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el tamano del modelo base (4B) es compatible en principio con GPUs de consumo de gama alta, pero no se aportan datos verificados.
- Opciones de despliegue: la carga se documenta mediante `peft.PeftModel` y `transformers.AutoModelForCausalLM`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integracion con estos frameworks requeriria fusionar los adaptadores con el modelo base.
- Latencia y throughput: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| coherence-reward-qwen3-4b-lora (este) | 4B base + LoRA | no disponible | Apache 2.0 | Hugging Face (adaptadores) | Adaptadores de investigacion, sin benchmarks publicados |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base sobre el que se entrena |
| Otros adaptadores LoRA de investigacion sobre Qwen3-4B | 4B base + LoRA | no disponible | variable | Hugging Face | No se dispone de comparaciones cuantitativas en la informacion |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un dispositivo medico: el autor lo declara explicitamente como material de investigacion sobre metodos de entrenamiento, no apto para uso clinico.
- Entrenado exclusivamente con pacientes sinteticos de DDXPlus; puede no generalizar a distribuciones clinicas reales ni a otros dominios medicos.
- Solo contiene pesos de adaptadores: requiere descargar y cargar el modelo base Qwen/Qwen3-4B, con el coste de almacenamiento y computo asociado.
- No se almacenan datos de entrenamiento, prompts ni rollouts en el repositorio, lo que limita la reproducibilidad completa sin acudir al repositorio de codigo externo.
- Sin benchmarks publicados, no es posible evaluar su rendimiento frente a alternativas ni verificar mejoras sobre el modelo base.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion.
- Sesgos conocidos: no disponibles en la informacion; al entrenarse sobre un corpus sintetico, los sesgos del generador de DDXPlus pueden propagarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la naturaleza de investigacion y la advertencia del autor desaconsejan su uso en produccion clinica.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue adecuado.

## Enlaces

- Hugging Face: https://huggingface.co/GOVINDFROM/coherence-reward-qwen3-4b-lora
- Codigo y diseno del estudio: https://github.com/GIND123/clinical-coherence-rl
- Preregistracion en OSF: https://osf.io/4xmq7
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
