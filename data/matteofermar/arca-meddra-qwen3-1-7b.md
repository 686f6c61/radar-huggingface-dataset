# Matteofermar/arca-meddra-qwen3-1.7b

## Resumen

Arca-MedDRA-Qwen3-1.7B es un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3-1.7B. Lo desarrolla el usuario Matteofermar y se publica como un repositorio PEFT de aproximadamente 0,1 GB, lo que confirma que se distribuyen unicamente los pesos del adaptador y no el modelo completo. El entrenamiento se realizo con TRL 1.13.0, PEFT 0.20.0 y Transformers 5.17.0, y la model card cita explicitamente el paper de DeepSeekMath (arXiv:2402.03300) como origen del algoritmo GRPO.

La relevancia de esta publicacion es limitada pero ilustrativa: se trata de un ejemplo de ajuste por refuerzo sobre un modelo pequeno (1.700 millones de parametros) orientado a generacion de texto conversacional. Al ser un adaptador, requiere cargar primero el modelo base Qwen3-1.7B y aplicar despues los pesos LoRA, lo que anade un paso de configuracion frente a un checkpoint completo.

No se dispone de informacion sobre el dataset de entrenamiento, la funcion de recompensa empleada en GRPO, los hiperparametros del LoRA ni los resultados de evaluacion. La model card es practicamente la plantilla autogenerada por TRL y no aporta detalles sustantivos sobre el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-1.7B) con adaptador LoRA entrenado por GRPO |
| Parametros totales | 1.700 millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen3-1.7B, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.20.0, TRL 1.13.0, Transformers 5.17.0, PyTorch 2.11.0+cu128 |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. El adaptador se entrena con GRPO, un algoritmo de optimizacion por politica proximal sin modelo critico (critic-free) que estima la ventaja de cada respuesta comparandola con la media de un grupo de muestras generadas para el mismo prompt. Este enfoque, popularizado por DeepSeekMath, reduce el coste de memoria frente a PPO clasico al eliminar la red de valor.

No se especifican en la informacion disponible el rango del LoRA, el valor de alpha, las capas objetivo, el numero de pasos de entrenamiento, el tamano del batch, la composicion del dataset ni la funcion de recompensa utilizada. Tampoco se documenta si hubo una fase previa de SFT o si el entrenamiento partio directamente del checkpoint instruct de Qwen3-1.7B. La ausencia de estos datos impide reproducir el entrenamiento o evaluar su calidad de forma objetiva.

## Capacidades

- Generacion de texto conversacional en formato chat (la model card muestra un ejemplo con mensajes con rol `user`).
- Razonamiento y generacion de respuestas abiertas, presumiblemente reforzado por el entrenamiento con GRPO, aunque no se aportan evidencias.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; se desconoce que idiomas cubre el adaptador.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.
- Al ser un adaptador PEFT, las capacidades heredadas del modelo base Qwen3-1.7B se mantienen en principio, pero el ajuste con GRPO puede haber modificado el estilo y la distribucion de respuestas.

## Casos de uso

- Prototipado de ajuste por refuerzo: sirve como referencia practica para desarrolladores que quieran replicar un pipeline GRPO con TRL sobre un modelo de 1.700 millones de parametros en una unica GPU.
- Experimentacion academica con recompensas: util para comparar el efecto de distintas funciones de recompensa sobre un mismo modelo base sin reentrenar desde cero.
- Generacion de respuestas conversacionales en entornos de bajo recursos: al requerir solo el adaptador (0,1 GB) mas el modelo base, el coste de almacenamiento y despliegue es reducido.
- Investigacion sobre alineacion en modelos pequenos: permite estudiar como GRPO afecta a modelos por debajo de 3.000 millones de parametros, una franja poco explorada.
- Base para fine-tuning posterior: el adaptador puede combinarse con otros LoRA o servir de punto de partida para tareas especificas.
- Demostraciones y docencia: el ejemplo de la model card (pregunta hipotetica sobre una maquina del tiempo) ilustra el uso de `transformers.pipeline` para generacion con plantilla de chat.
- Evaluacion de robustez de PEFT: util para probar herramientas de carga, fusion y cuantizacion de adaptadores en pipelines de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para el modelo base Qwen3-1.7B en FP16 se estiman en torno a 3,5-4 GB solo de pesos, mas el adaptador (despreciable) y el coste de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior seria suficiente en teoria, aunque no hay confirmacion del autor.
- Cabe en GPU de consumo: si, previsiblemente en GPUs con 8 GB o mas, aunque no se documenta.
- Opciones de despliegue: `transformers` con PEFT (carga del adaptador sobre el modelo base); vLLM, llama.cpp, Ollama o TGI requeririan fusionar el adaptador con el modelo base previamente, algo no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arca-MedDRA-Qwen3-1.7B | 1.700 M (base) + LoRA | no disponible | no disponible | safetensors (PEFT) | Adaptador GRPO, sin benchmarks |
| Qwen/Qwen3-1.7B | 1.700 M | no disponible en esta ficha | Apache 2.0 (segun el modelo base original) | safetensors | Modelo base, con benchmarks publicados por Qwen |
| Otros adaptadores GRPO sobre modelos pequenos | variable | variable | variable | safetensors (PEFT) | No hay comparativa directa disponible |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No se documenta la licencia efectiva: la model card incluye `licence: license` sin especificar terminos, lo que impide confirmar si el uso comercial esta permitido. La licencia del modelo base (Qwen3-1.7B) debe consultarse por separado.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a un modelo de 1.700 millones de parametros; el ajuste con GRPO no garantiza reducirlo.
- El adaptador puede degradar capacidades del modelo base si el entrenamiento fue corto o la recompensa estaba mal disenada; no hay evidencia en ningun sentido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Requiere cargar el modelo base por separado; no es un checkpoint autonomo.
- La model card no documenta hiperparametros ni dataset, lo que impide reproducir o auditar el entrenamiento.
- No se confirma el soporte multilingue ni la longitud de contexto efectiva tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Matteofermar/arca-meddra-qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
