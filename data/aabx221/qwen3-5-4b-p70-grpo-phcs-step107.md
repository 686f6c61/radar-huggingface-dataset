# aabx221/Qwen3.5-4B-p70-GRPO-PhCS-step107

## Resumen

Qwen3.5-4B-p70-GRPO-PhCS-step107 es un ajuste fino del modelo base Qwen/Qwen3.5-4B (revision 851bf6e) publicado por el usuario aabx221. Se trata de un checkpoint de investigacion obtenido mediante una cadena de entrenamiento supervisado (SFT) sobre datos de ReTool seguida de optimizacion con GRPO (Group Relative Policy Optimization), con una seleccion de checkpoint basada en criterios de incertidumbre (PhCS, con ventana W=10 y el 10% de muestras mas inciertas). El resultado es un modelo de 4.841.450.496 parametros orientado a generacion de texto y razonamiento matematico con uso de herramientas.

El modelo es relevante porque documenta de forma exhaustiva su linaje de entrenamiento y demuestra un rendimiento notable en tareas de matematicas competitivas con pass@4, alcanzando 0,9750 en AMC23 y 0,9260 en MATH500, con soporte de ejecucion real de herramientas (ReTool, hasta 8 turnos y 8 llamadas). Es un checkpoint text-only derivado de un modelo multimodal, con configuracion `qwen3_5_text` y arquitectura `Qwen3_5ForCausalLM`.

La licencia es Apache 2.0 y el modelo solo soporta ingles y chino. Su publico objetivo son investigadores interesados en tecnicas de RL para razonamiento y en la reproducibilidad de pipelines de entrenamiento, mas que en despliegues de produccion generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM, text-only) |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (6 shards + model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se entrena en dos fases. Primero, un SFT sobre 2.000 muestras de origen ReTool, de las que el filtrado p70 retuvo 1.401, durante cuatro epocas y 176 pasos de optimizador. La seleccion posterior al SFT eligio el paso 91 (base cero) usando la interseccion del 50% de menor perdida y el 50% de mayor precision de tokens, seguido de maxima entropia media. Despues, se aplica GRPO durante 250 pasos de optimizador desde esos pesos, con rollout nativo en TP=2, entrenamiento FSDP en 2 rangos y ejecucion real de ReTool. El checkpoint final se selecciona en el paso 107 de GRPO mediante la regla PhCS (W=10, top 10% de muestras mas inciertas), sin usar los resultados de benchmark para la seleccion.

El nodo virtual seleccionado se materializo a partir del ancla completa del paso 99, reproduciendo los registros de rollout y actualizacion de los pasos 100 a 107; segun el autor, la perdida, las estadisticas de recompensa/ventaja, los componentes GRPO/PPO, la norma del gradiente y la tasa de aprendizaje coincidieron en cada paso reproducido. La configuracion es deliberadamente text-only (`model_type = qwen3_5_text`, `architectures = ["Qwen3_5ForCausalLM"]`), y el autor advierte que usar la configuracion multimodal original `Qwen3_5ForConditionalGeneration` con este checkpoint solicitaria pesos de vision inexistentes. Los operadores deterministas de entrenamiento y los operadores nativos de vLLM son caracteristicas del codigo fuente del proyecto ExCS, no de los ficheros de pesos, por lo que no se activan automaticamente con el cargador estandar de Transformers.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento matematico de competicion, con resultados medidos en AIME24, AIME25, AIME26, AMC23, MATH500, OlympiadBench y MinervaMath.
- Uso de herramientas (tool calling / function calling) mediante ReTool, con hasta 8 turnos y 8 llamadas por consulta.
- Razonamiento multi-paso con ejecucion real de herramientas durante el rollout.
- Ajuste fino adicional posible: el repositorio incluye pesos de inferencia y de fine-tuning.
- Capacidades de vision: no disponibles (checkpoint text-only).
- Capacidades de audio: no disponibles.
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Resolucion de problemas matematicos de competicion: el modelo esta entrenado con GRPO y ReTool para razonar y ejecutar herramientas, con resultados de pass@4 de 0,9750 en AMC23 y 0,9260 en MATH500, lo que lo hace adecuado para tutoria o generacion de soluciones verificadas en entornos educativos avanzados.
- Investigacion en aprendizaje por refuerzo: sirve como checkpoint de referencia para estudiar la seleccion de modelos por incertidumbre (PhCS) y comparar trayectorias de GRPO con y sin seleccion basada en benchmark.
- Evaluacion de pipelines de razonamiento con herramientas: permite reproducir experimentos de ReTool con hasta 8 turnos y 8 llamadas, util para medir el impacto del uso de herramientas en la precision final.
- Generacion de codigo asistida por ejecucion: aunque no se documentan benchmarks de codigo, el soporte de tool calling permite integrar el modelo en flujos donde genera codigo y lo ejecuta para validar resultados.
- Fine-tuning para dominios especificos en ingles o chino: al incluir pesos de fine-tuning y licencia Apache 2.0, puede adaptarse a tareas de razonamiento tecnico en esos idiomas.
- Despliegue en investigacion con vLLM: el autor documenta inferencia con vLLM nativo en TP=2, lo que facilita su uso en entornos de evaluacion a gran escala.
- Analisis de robustez y calibracion: al ser un checkpoint seleccionado por incertidumbre, es util para estudiar la relacion entre entropia, perdida y precision en modelos pequenos de razonamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor con pass@4, temperatura 0,7, top-p 1,0, longitud maxima de respuesta 8192, vLLM nativo TP=2 y ReTool con maximo 8 turnos / 8 llamadas:

| Dataset | pass@4 |
|---|---:|
| AIME24 | 0,7333 |
| AIME25 | 0,5000 |
| AIME26 | 0,4667 |
| AMC23 | 0,9750 |
| MATH500 | 0,9260 |
| OlympiadBench | 0,7211 |
| MinervaMath | 0,6140 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB para pesos; en 4 bits, alrededor de 3-4 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala con TP=2, tal como documenta el autor con vLLM nativo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto limitado, y en RTX 3090/4080 con cuantizacion; en GPUs de 8-12 GB requeriria cuantizacion agresiva no documentada.
- Opciones de despliegue: Transformers con `Qwen3_5ForCausalLM`, vLLM nativo (TP=2 documentado por el autor); llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-p70-GRPO-PhCS-step107 | 4,84 B | no disponible | Apache 2.0 | en, zh | Checkpoint GRPO con ReTool; benchmarks de matematicas publicados |
| Qwen/Qwen3.5-4B (base) | 4 B (aprox.) | no disponible | no disponible en la informacion | no disponible | Modelo base multimodal del que deriva este checkpoint |
| Alternativas de ~4 B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que no es una reproduccion punto por punto del experimento p90 original, lo que limita su uso como referencia canonica.
- Solo ingles y chino: no hay soporte documentado de castellano ni de otros idiomas.
- Checkpoint text-only: no incluye pesos de vision; usar la configuracion multimodal original provocaria errores de carga.
- Operadores personalizados: los operadores deterministas de entrenamiento y los nativos de vLLM pertenecen al codigo fuente de ExCS y no se activan con Transformers estandar, lo que puede alterar el comportamiento esperado si no se usa el runtime adecuado.
- No reanudable bit a bit: el repositorio no contiene shards de optimizador, RNG por rango, estado del scheduler ni el almacen de objetos Git de entrenamiento necesarios para reanudar el GRPO historico.
- Riesgo de alucinacion: no documentado por el autor; como modelo de 4 B entrenado con RL sobre matematicas, es esperable en dominios fuera de su distribucion, aunque no hay datos especificos.
- Sesgos: no documentados en la informacion disponible.
- Longitud de contexto: no documentada, lo que impide planificar despliegues con ventanas largas.
- Cuantizaciones: no documentadas oficialmente; cualquier cuantizacion es responsabilidad del usuario.
- Uso comercial: permitido por Apache 2.0, pero sin garantias del autor y con las caveats anteriores sobre runtime y contexto.

## Enlaces

- Hugging Face: https://huggingface.co/aabx221/Qwen3.5-4B-p70-GRPO-PhCS-step107
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio fuente de ExCS: no disponible en la informacion proporcionada
- Paper de GRPO: no disponible en la informacion proporcionada
- Paper de ReTool: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
