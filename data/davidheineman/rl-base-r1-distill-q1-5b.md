# davidheineman/RL-Base-R1-Distill-Q1.5B

## Resumen

RL-Base-R1-Distill-Q1.5B es un checkpoint de investigación publicado por davidheineman que continúa el entrenamiento de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B mediante aprendizaje por refuerzo sobre una tarea sintética: construir y resolver árboles de programas generados aleatoriamente a partir de primitivas de operaciones con cadenas. El modelo parte por tanto de un transformer decoder-only tipo Qwen2 de 1.777.088.000 parámetros (1,78 B), destilado originalmente de DeepSeek-R1, y se afina con GRPO (Group Relative Policy Optimization) en un entorno verificable.

La relevancia del checkpoint es metodológica más que de producto: documenta un pipeline completo de RL con recompensas verificables (RLVE) aplicado a razonamiento composicional sobre estructuras de programa, con 20.000 rollouts muestreados, 2.500 actualizaciones y un historial de evaluación in-distribution registrado en Weights & Biases. El autor libera únicamente pesos y tokenizador en safetensors (3,6 GB de repositorio); el estado del optimizador y del sampler permanece en el checkpoint de entrenamiento original.

No se trata de un modelo alineado para uso general: no hay model card con benchmarks, licencia declarada ni idiomas soportados, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Su interés está en la experimentación con RL sobre entornos de recompensa programática y en servir como punto de partida para fine-tuning posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (tag `qwen2` en HuggingFace), denso |
| Parametros totales | 1.777.088.000 (1,78 B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5 del que deriva declara 32.768 tokens; no verificado para este checkpoint) |
| Tipos de cuantizacion | No se han publicado pesos cuantizados; al estar en safetensors es convertible con bitsandbytes (INT8/NF4), GPTQ/AWQ o llama.cpp (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers); repositorio de 3,6 GB |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Metodo de entrenamiento | RL con GRPO sobre arboles de programas sinteticos |
| Checkpoint | Actualizacion 2.499 de 2.500 (checkpoint final) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2 con 1,78 B de parametros, heredado de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es un destilado de DeepSeek-R1 sobre Qwen2.5. Sobre esa base, el autor aplica una fase de aprendizaje por refuerzo con GRPO en la que el entorno genera arboles de programas aleatorios construidos con primitivas de operaciones con cadenas. Los arboles tienen profundidad 1–2 y hasta dos hijos por nodo, de modo que la recompensa depende de la correcta composicion y evaluacion de transformaciones encadenadas sobre strings.

El detalle del entrenamiento esta acotado en la model card: 20.000 rollouts muestreados repartidos en 2.500 actualizaciones, con un prompt y ocho rollouts por actualizacion, ejecucion sobre cuatro GPU, 1.024 tokens de generacion iniciales y "answer forcing" con hasta 128 tokens adicionales para forzar la emision de la respuesta final. El checkpoint publicado corresponde a la actualizacion 2.499, es decir, el final de la ejecucion. El historial de evaluacion in-distribution esta disponible en el run de Weights & Biases enlazado por el autor, pero no se trasladan cifras a la model card. No se documentan datos sobre composicion del corpus previo, tecnicas de alineacion adicionales (RLHF/DPO) ni innovaciones de decodificacion.

## Capacidades

- Generacion de texto autoregresiva en el formato de razonamiento destilado de DeepSeek-R1 (trazas de pensamiento antes de la respuesta), heredado del modelo base.
- Razonamiento composicional sobre arboles de programas de profundidad 1–2 con primitivas de manipulacion de cadenas, que es la tarea concreta sobre la que se aplico el RL.
- Ejecucion mental de transformaciones encadenadas de strings (sustituciones, concatenaciones y operaciones similares definidas por el entorno de entrenamiento).
- Razonamiento matematico y resolucion de problemas de varios pasos, procedente de la destilacion original de R1.
- Generacion de codigo y trazas intermedias, tambien heredada del modelo base.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Comportamiento agentico multi-paso: no documentado; la unica evidencia es el entrenamiento sobre estructuras de programa, no sobre uso de herramientas.
- Capacidades multilingues: no documentadas; los idiomas del modelo base no se verifican en este fine-tuning.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles; solo texto.

## Casos de uso

- Investigacion en RL con recompensas verificables: sirve como referencia reproducible de un pipeline GRPO completo sobre un entorno sintetico, con el run de W&B como traza de la curva de aprendizaje y el checkpoint final como punto de comparacion frente a la base sin RL.
- Estudio de razonamiento composicional: evaluar si el RL sobre arboles de programas mejora la capacidad de ejecutar transformaciones encadenadas y si ese efecto se transfiere a tareas fuera de distribucion.
- Generacion de trazas sinteticas para destilacion: usar el modelo para producir cadenas de razonamiento sobre operaciones de strings que alimenten el entrenamiento de modelos mas pequenos.
- Ablaciones y experimentos controlados: al ser un checkpoint de 1,78 B y ~3,6 GB, permite lanzar barridos de hiperparametros o comparaciones de algoritmos de RL en un solo nodo de cuatro GPU, el mismo perfil descrito en la model card.
- Analisis de olvido catastrofico: comparar sus respuestas generales frente al modelo base para medir cuanto degrada un RL estrecho las capacidades originales de instruccion y conversacion.
- Prototipado en local: con cuantizacion INT8/INT4 cabe en GPU de consumo y permite probar pipelines de generacion y evaluacion sin coste de infraestructura cloud.
- Fine-tuning posterior especifico: partir de estos pesos en lugar del destilado original cuando el dominio objetivo implique manipulacion estructurada de texto o razonamiento sobre programas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de la tarea de arboles de programas; solo remite al historial de evaluacion in-distribution del run de Weights & Biases, cuyos valores no se reproducen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 1,78 B de parametros, sin datos medidos): ~3,6 GB solo de pesos en BF16/FP16, ~5–6 GB con cache KV y overhead en contextos moderados; ~1,8 GB de pesos en INT8 y ~0,9–1 GB en INT4.
- GPU recomendadas: cualquier GPU con 8 GB o mas para BF16 en contextos cortos; A100/H100 no son necesarias por tamano, pero pueden aprovecharse para throughput agregado con vLLM o TGI.
- Cabe en GPU de consumo: si. Una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB ejecutan el modelo en BF16 sin problema; tarjetas de 8 GB requieren cuantizacion.
- Opciones de despliegue: transformers (referencia directa, es el formato publicado), vLLM y TGI (el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con endpoints), llama.cpp/Ollama tras conversion a GGUF. El repositorio no incluye pesos GGUF ni cuantizaciones listas.
- Latencia y throughput: no disponibles; no se han publicado mediciones. El entrenamiento se ejecuto en cuatro GPU, lo que da una idea del perfil de computo de la fase de RL, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RL-Base-R1-Distill-Q1.5B | 1,78 B | no disponible | Destilado de R1 + RL con GRPO sobre arboles de programas | no disponible | Publico en HF, 0 descargas, solo pesos |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B (nominal) | no disponible en esta informacion | Destilado de R1 sobre Qwen2.5, sin RL adicional | no disponible en esta informacion | Publico en HF, ampliamente utilizado |
| Qwen2.5-1.5B-Instruct | 1,5 B (nominal) | no disponible en esta informacion | Modelo Instruct generalista de la familia Qwen2.5 | no disponible en esta informacion | Publico en HF |
| SmolLM2-1.7B-Instruct | 1,7 B (nominal) | no disponible en esta informacion | Instruct compacto orientado a despliegue en dispositivo | no disponible en esta informacion | Publico en HF |

No se dispone de datos de rendimiento comparado para ninguno de los candidatos en la informacion proporcionada, por lo que la comparativa se limita a tamano, enfoque y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento del registro, sin resultados de benchmarks ni evaluaciones de terceros.
- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial; hay que consultar la licencia del modelo base antes de cualquier despliegue productivo.
- Es un checkpoint de investigacion, no un modelo alineado: el RL se aplico unicamente sobre arboles de programas sinteticos, por lo que cabe esperar deriva respecto al comportamiento de instruccion del modelo base (olvido catastrofico parcial).
- Riesgo de alucinacion: como todo modelo generativo de 1,78 B, puede producir operaciones o resultados plausibles pero incorrectos, especialmente al encadenar transformaciones fuera de la distribucion de profundidad 1–2.
- El "answer forcing" con hasta 128 tokens puede inducir respuestas truncadas o forzadas cuando el razonamiento necesita mas espacio que el presupuestado.
- Idiomas no documentados: no hay garantia de calidad fuera del ingles tecnico empleado en el entorno de entrenamiento.
- Longitud de contexto no verificada para este fine-tuning; no se ha validado el comportamiento en secuencias largas tras el RL.
- Sin filtros de seguridad ni moderacion documentados; no debe exponerse directamente a usuarios finales sin una capa adicional.
- El repositorio contiene solo pesos y tokenizador: no se puede reanudar el entrenamiento tal cual, porque el estado del optimizador y del sampler queda en el checkpoint original.
- Sesgos conocidos: no documentados; los del modelo base no se han auditado en esta publicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/RL-Base-R1-Distill-Q1.5B
- Run de entrenamiento y evaluacion in-distribution en Weights & Biases: https://wandb.ai/david-heineman/rl-trees-base-rl/runs/f75d51ca
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
