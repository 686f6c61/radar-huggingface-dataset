# sandeep123/grpo-qwen3-4b-nonthinking-likelihood-2048-20260918

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario sandeep123 bajo el identificador grpo-qwen3-4b-nonthinking-likelihood-2048-20260918. No es un modelo completo, sino un conjunto de adaptadores PEFT (un directorio inmutable `checkpoint-NNNNNN/` por cada actualización del optimizador) pensados para cargarse encima del modelo base fijado. El objetivo concreto es el razonamiento matemático: el entrenamiento usa una recompensa basada en la corrección binaria de la respuesta final combinada con un término de "verosimilitud de rango" (likelihood-rank) que modula la ventaja según lo improbable que resulte la respuesta correcta dentro del grupo de rollouts.

La innovación principal es la función de recompensa, definida como `r_prime_i = r_correct_i * (1 - coefficient * rank_i / G)`, con coefficient=0,25, donde el rango se calcula de forma ascendente sobre la verosimilitud media (detached) de los tokens realmente generados en cada prompt. Se trata de una adaptación controlada del código del repositorio del autor (AndreHe02/rewarding-unlikely-release, commit ca1cff05), con presupuesto de rollouts fijo y sin re-muestreo dinámico de grupos. Todo el entrenamiento renderiza explícitamente `enable_thinking=False`, de ahí la etiqueta "nonthinking".

El modelo es relevante como experimento reproducible de RL sobre modelos pequeños (4B) en el dominio matemático, con provenance exhaustiva: metadata por checkpoint, manifiestos SHA256, semilla fija (42) y contrato científico registrado. Conviene subrayar que el autor no reclama ninguna superioridad ni publica evaluación: el repositorio documenta el proceso, no un resultado validado. El tamaño del repo (4,2 GB) se explica porque conserva todos los checkpoints publicados, incluido el update cero (adaptador inicial sin entrenar).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-4B-Instruct-2507) con adaptador LoRA (PEFT) |
| Parametros totales | Adaptador: no disponible. Modelo base: ~4.000 millones de parametros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (limite declarado durante el entrenamiento); el modelo base admite ventanas mayores segun su documentacion publica |
| Tipos de cuantizacion | no disponible para el adaptador (pesos LoRA en safetensors); la cuantizacion del modelo base depende del runtime |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingue, pero no se declara en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT), configuracion de adaptador, tokenizer y chat template incluidos por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507 (transformer decoder-only denso de aproximadamente 4.000 millones de parametros) mas un adaptador LoRA de rango 16, alpha 32, dropout 0 y sin bias, aplicado sobre los modulos de proyeccion q/k/v/o y gate/up/down. El adaptador se publica como PEFT y requiere el modelo base fijado al commit `cdbee75f17c01a7cc42f958dc650907174af0554`; no es una continuacion de un adaptador previo, sino un experimento nuevo inicializado desde el modelo base fijado. Cada checkpoint es inmutable, tiene su propio commit en el Hub y va acompanado de metadata, tokenizer y chat template.

El entrenamiento sigue GRPO con una recompensa de rango de verosimilitud sobre la correccion binaria de la respuesta. Los hiperparametros declarados son: learning rate pico 2e-5 con 10 actualizaciones de warmup lineal (update 1 usa 2e-6 y update 10 alcanza 2e-5), despues constante; coeficiente KL 0,01 con el estimador k3 original `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, agregado sobre el mismo denominador global de tokens generados que la perdida de politica (sin correccion de importance ratio). El entrenamiento planificado es de 4 epocas sobre un split de 2.048 preguntas, con batch global de prompt de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 planificadas; el contexto prompt+respuesta se limita a 8.192 tokens y la semilla es 42. La normalizacion de grupo usa `sample_std_plus_1e-6`, no se usa format reward ni credito de diversidad STRIDE, y los grupos con ventaja original cero conservan sus rollouts con gradiente de politica cero manteniendo el KL. El autor advierte que el numero real de checkpoints completados lo determina `checkpoint_index.json` y que la existencia del repositorio no establece la eficacia de estos ajustes.

## Capacidades

- Generacion de texto en modo instruccion ("nonthinking") sobre el modelo base Qwen3-4B-Instruct-2507.
- Razonamiento matematico: el entrenamiento se dirige especificamente a resolver problemas matematicos con respuesta final verificable.
- Ajuste por RL orientado a la correccion de la respuesta, no a la verificacion de pasos intermedios (el autor avisa de que una respuesta final correcta no valida cada paso de la prueba).
- Carga selectiva de checkpoints: cualquier `checkpoint-NNNNNN/` publicado puede cargarse de forma independiente con PEFT.
- Reanudacion de entrenamiento: los adaptadores admiten `is_trainable=True` con un optimizador nuevo; la continuacion exacta del run original requiere cumplir condiciones adicionales de provenance.
- Tool calling / function calling: no declarado en la informacion disponible (depende del modelo base, no se documenta aqui).
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingues: no declaradas.
- Capacidades especiales (thinking mode, vision, audio): no. El modo thinking se desactiva explicitamente (`enable_thinking=False`) en todo el entrenamiento.

## Casos de uso

- Investigacion en RL para matematicas: servir como replica reproducible de un experimento GRPO con recompensa de rango de verosimilitud, comparando checkpoints concretos gracias a la metadata por update y a la semilla fija.
- Estudio de estabilidad del entrenamiento: analizar el efecto del warmup lineal de 10 updates, el coeficiente KL 0,01 y el presupuesto fijo de rollouts sobre la deriva de politica.
- Evaluacion de tecnicas de shaping de recompensa: utilizar el coeficiente 0,25 como variable de control frente a variantes sin ese termino, dentro de la misma familia de experimentos STRIDE.
- Punto de partida para fine-tuning matematico adicional: cargar un checkpoint con `is_trainable=True` sobre Qwen3-4B-Instruct-2507 para continuar el ajuste con un optimizador nuevo.
- Generacion de respuestas matematicas en entornos de bajos recursos: el adaptador se combina con un modelo de 4B que puede ejecutarse en GPU de consumo con cuantizacion.
- Analisis de provenance y reproducibilidad: auditar manifiestos SHA256, hashes de dataset y metadata por checkpoint como caso de estudio de trazabilidad en modelos abiertos.
- Docencia y divulgacion de RLHF/GRPO: el repositorio expone el objetivo matematico exacto y el codigo fuente, lo que facilita explicar la formulacion de ventajas en GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no realiza ninguna afirmacion de evaluacion ni de superioridad. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los unicos resultados obtenidos tratan sobre logistica de lujo y no guardan relacion con esta ficha).

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion, no dato del autor): ~8-9 GB en bf16 (modelo base 4B mas adaptador) y ~2,5-3,5 GB con cuantizacion de 4 bits del modelo base.
- GPU recomendadas: cualquier GPU con al menos 12 GB para bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) o GPUs de datacenter (A100, H100) para lotes grandes o entrenamiento.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits practicamente en cualquier GPU de 8 GB o mas; en bf16 requiere al menos ~12 GB.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI, Ollama o llama.cpp (fusionando el adaptador en el modelo base y convirtiendo a GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-qwen3-4b-nonthinking-likelihood-2048-20260918 (este) | Adaptador LoRA sobre base 4B | 8.192 tokens (entrenamiento) | GRPO con recompensa de rango de verosimilitud, matematicas, modo nonthinking | no disponible | Adaptador PEFT en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4.000 millones | Segun documentacion del modelo base | Modelo instruccion generalista | Segun licencia del modelo base (no verificada en esta ficha) | Pesos completos en HuggingFace |
| Otros fine-tunes GRPO/RL sobre modelos de 1,5B a 7B para matematicas | Variable | no disponible | RL sobre respuestas verificables | Variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas, por lo que la comparativa se limita a parametros estructurales y enfoque.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el adaptador hereda los sesgos del modelo base Qwen3-4B-Instruct-2507.
- Riesgo de alucinacion: no evaluado. El propio autor advierte de que una respuesta final correcta no verifica los pasos intermedios, por lo que la cadena de razonamiento puede contener errores aunque el resultado sea valido.
- Ausencia de evaluacion: no hay benchmarks, ni afirmacion de superioridad, ni verificacion independiente del resultado del entrenamiento.
- Estado del entrenamiento: los 128 updates son un plan; solo `checkpoint_index.json` refleja lo realmente completado. Hay que comprobar que existe el checkpoint deseado antes de usarlo.
- Modo de pensamiento desactivado: el entrenamiento usa `enable_thinking=False`; usar la plantilla por defecto (que activa thinking en algunos modelos Qwen3) produce una discrepancia con las condiciones de entrenamiento. El autor recomienda pasar explicitamente el flag tambien en inferencia.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; la licencia del modelo base debe verificarse por separado.
- Idioma: no se declaran idiomas soportados por el adaptador.
- Denominador y normalizacion especificos: el KL y el PPO se normalizan sobre tokens generados a nivel global; reproducir el entrenamiento fuera de ese esquema no da resultados equivalentes.
- Dependencia estricta del commit del modelo base: cargar el adaptador sobre una revision distinta de Qwen3-4B-Instruct-2507 puede degradar el comportamiento.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sandeep123/grpo-qwen3-4b-nonthinking-likelihood-2048-20260918
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507 (revision fijada `cdbee75f17c01a7cc42f958dc650907174af0554`)
- Repositorio del autor del codigo de recompensa: https://github.com/AndreHe02/rewarding-unlikely-release (commit `ca1cff05ebdf2cfe9737fd416897da838a93e11a`)
- Resultados de busqueda web: sin resultados relevantes para este modelo (los enlaces devueltos tratan sobre logistica de lujo y no se incluyen).
