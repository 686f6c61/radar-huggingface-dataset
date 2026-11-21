# kushasareen/qwen35-9b-ft-cur2-150

## Resumen

`kushasareen/qwen35-9b-ft-cur2-150` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario kushasareen en Hugging Face. Se trata de un checkpoint intermedio de entrenamiento por refuerzo (reinforcement learning) tras 150 pasos de optimizacion, guardado tal cual por el trainer. No es un modelo de proposito general publicado con documentacion extensa, sino un artefacto de investigacion que reproduce fielmente el estado de pesos, configuracion y tokenizer en un punto concreto de un pipeline de RL.

El modelo hereda la arquitectura y capacidades del Qwen3.5-9B original, un transformer multimodal (image-text-to-text) de aproximadamente 9.400 millones de parametros. La unica modificacion respecto al base es el ajuste por RL, cuyo objetivo y datos de entrenamiento no estan documentados en la model card. Por tanto, su interes radica en servir como referencia para reproducir experimentos de RL sobre Qwen3.5-9B o para comparar el efecto de 150 pasos de optimizacion frente al modelo base.

Es relevante ahora porque Qwen3.5 es una familia reciente con soporte multimodal y tool calling, y este checkpoint permite a investigadores inspeccionar el efecto de un entrenamiento RL corto sin tener que replicar el pipeline completo. No obstante, la ausencia de datos de benchmarks, idiomas y composicion del dataset limita su uso en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Tamano del repo | 18,8 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de ajuste | Reinforcement learning, 150 pasos de optimizacion |
| Libreria | transformers |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-9B, cuyo backbone es un transformer multimodal de ~9.400 millones de parametros capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). La model card indica explicitamente que se trata de un ajuste por refuerzo con 150 pasos de optimizacion ("reinforcement learning, 150 optimizer steps"), pero no detalla el algoritmo de RL empleado (PPO, GRPO, DPO u otro), la funcion de recompensa, el dataset de prompts ni la composicion de los datos. Tampoco se documenta si hubo fases previas de SFT o si el checkpoint es un punto intermedio de un entrenamiento mayor.

Los pesos, la configuracion y el tokenizer se guardan tal como los dejo el trainer, y la carga se realiza con `AutoModelForCausalLM.from_pretrained`. No se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las que pudiera incorporar el Qwen3.5-9B base, que no se documentan en esta ficha. Al ser un checkpoint de RL de solo 150 pasos, es probable que las diferencias respecto al base sean sutiles y acotadas al dominio o tarea usados en la recompensa, aunque esto no puede confirmarse con la informacion disponible.

## Capacidades

- Generacion de texto multimodal: hereda del base Qwen3.5-9B la capacidad image-text-to-text, por lo que puede procesar imagenes junto a texto.
- Razonamiento y generacion de lenguaje natural: capacidades propias del modelo base, no reevaluadas en este checkpoint.
- Codigo y matematicas: presumiblemente heredadas del base, sin datos de evaluacion especificos en este fine-tune.
- Tool calling / function calling: no documentado en esta model card; depende de las capacidades del base Qwen3.5-9B.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (los idiomas no se declaran).
- Modo thinking: no documentado.
- El ajuste RL puede haber alterado preferencias de estilo o alineamiento, pero sin datos de evaluacion no es posible confirmar que capacidades concretas hayan mejorado o empeorado.

## Casos de uso

- Reproduccion de experimentos de RL: el checkpoint permite cargar exactamente el estado tras 150 pasos de optimizacion para comparar con el modelo base y aislar el efecto del entrenamiento por refuerzo en tareas concretas.
- Investigacion sobre alineamiento: util para estudiar como evolucionan las respuestas de un modelo de 9B bajo RL a corto plazo, midiendo cambios de estilo, verbosidad o adherencia a instrucciones.
- Punto de partida para fine-tunes posteriores: al estar en safetensors y cargarse con transformers, puede servir como inicializacion para SFT o RL adicional en dominios especificos.
- Evaluacion de pipelines multimodales: dado que el base es image-text-to-text, puede integrarse en prototipos de descripcion de imagenes o VQA para comprobar si el RL afecta a la calidad de las respuestas visuales.
- Baseline interno en equipos de investigacion: sirve como referencia controlada frente a otros checkpoints de la misma familia Qwen3.5 para medir progreso en curvas de entrenamiento.
- Pruebas de regresion de infraestructura: util para validar que pipelines de carga (transformers, vLLM si soporta la arquitectura) funcionan con checkpoints intermedios de 9B antes de desplegar modelos finales.
- Generacion de texto asistida en entornos de investigacion: con la licencia Apache 2.0, puede usarse en experimentos internos de generacion condicionada por imagen y texto, siempre que se valide su calidad con evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18-19 GB solo para pesos (9.400 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, alrededor de 5-6 GB, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en BF16.
- Consumer GPU: cabe en RTX 4090 en BF16 con margen ajustado; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) seria necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`) es la via documentada; vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware y del modo de cuantizacion, sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kushasareen/qwen35-9b-ft-cur2-150 | 9.409.813.744 | no disponible | Fine-tune RL de Qwen3.5-9B | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-9B (base) | ~9.400 millones | no disponible | Transformer multimodal image-text-to-text | no disponible en esta ficha | Hugging Face (modelo base oficial) |
| Alternativas de ~9B de otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos de otras familias (Llama, Mistral, Gemma de ~9B) no puede hacerse con rigor porque no se dispone de datos de rendimiento del checkpoint ni del base en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, por lo que no se puede afirmar que el RL haya mejorado ninguna capacidad; puede incluso haber degradado algunas.
- Documentacion minima: la model card no describe el algoritmo de RL, la recompensa, el dataset ni la duracion total del entrenamiento; solo consta "150 optimizer steps".
- Idiomas no declarados: no se puede garantizar cobertura multilingue ni calidad en castellano sin pruebas propias.
- Riesgo de alucinacion: inherente a los modelos generativos de 9B; sin evaluacion especifica no hay garantia de mitigacion.
- Sesgos: no documentados; al desconocerse los datos de RL, no se puede descartar la introduccion de sesgos de preferencia derivados de la funcion de recompensa.
- Checkpoint intermedio: al ser un estado de entrenamiento guardado por el trainer, puede contener artefactos, pesos no finalizados o configuraciones no optimizadas para inferencia estable.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, que pueden imponer requisitos adicionales de atribucion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No apto para produccion sin evaluacion previa: se recomienda tratarlo como artefacto de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kushasareen/qwen35-9b-ft-cur2-150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
