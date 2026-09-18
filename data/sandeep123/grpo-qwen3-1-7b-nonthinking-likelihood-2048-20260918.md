# sandeep123/grpo-qwen3-1.7b-nonthinking-likelihood-2048-20260918

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante GRPO sobre el modelo base Qwen/Qwen3-1.7B. Lo publica el usuario sandeep123 y forma parte de una familia de experimentos etiquetados como STRIDE, orientados a estudiar variantes de la funcion de recompensa en aprendizaje por refuerzo para tareas de matematicas. El elemento diferencial es la recompensa: en lugar de usar solo la correccion binaria de la respuesta, se aplica un termino de "likelihood-rank" con coeficiente 0,25, de modo que la ventaja de cada rollout se pondera segun su probabilidad media de comportamiento. La ecuacion declarada es `r_prime_i = r_correct_i * (1 - coefficient * rank_i / G)`.

El adaptador se entrena explicitamente con `enable_thinking=False`, es decir, con el modo de razonamiento extendido de Qwen3 desactivado. Este detalle es critico en la practica: la plantilla de chat por defecto de Qwen3-1.7B activa el modo thinking, por lo que cualquier uso del modelo debe pasar el mismo argumento de forma explicita para reproducir las condiciones de entrenamiento. El entrenamiento planificado cubre 4 epocas sobre un split de 2.048 preguntas, con lote global de 64 prompts y 8 rollouts por prompt (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 actualizaciones previstas.

Se trata de un artefacto de investigacion, no de un modelo listo para produccion: no incluye evaluacion, no formula ninguna afirmacion de superioridad y declara explicitamente que las respuestas finales correctas no verifican cada paso intermedio de la demostracion. El repositorio pesa 9,2 GB porque conserva todos los checkpoints del adaptador publicados (incluido el adaptador cero, sin entrenar), no porque el adaptador en si sea grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base Qwen3-1.7B (1,7 mil millones aprox., segun denominacion del modelo); adaptador LoRA con rango 16, no disponible el recuento exacto de parametros del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens de cap combinado prompt + respuesta durante el entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio (pesos del adaptador en safetensors); el modelo base admite las cuantizaciones propias de Qwen3 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base no se incluye |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer decoder-only denso. Sobre el se entrena un adaptador LoRA con rango 16, alpha 32, dropout 0 y sin sesgo, aplicado a los modulos de proyeccion q/k/v/o y gate/up/down. El adaptador se inicializa desde cero sobre el modelo base fijado en la revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`; no es continuacion de un adaptador anterior. El tokenizador y la plantilla de chat se mantienen sin cambios.

El algoritmo es GRPO con una recompensa de rango de verosimilitud desacoplada ("detached"). La normalizacion de grupo usa desviacion estandar muestral con epsilon 1e-6, la normalizacion PPO y la de KL se calculan sobre el total global de tokens generados y el presupuesto de rollouts es fijo (sin remuestreo dinamico de grupos). En los grupos con ventaja original cero se conservan los rollouts con gradiente de politica nulo y se mantiene la KL existente. El reward de formato no se usa y el credito de diversidad STRIDE esta inactivo. La receta proviene del repositorio del autor referenciado, commit `ca1cff05ebdf2cfe9737fd416897da838a93e11a`.

Los hiperparametros declarados son: tasa de aprendizaje maxima 2e-5 con 10 actualizaciones de warmup lineal seguidas de tasa constante (la actualizacion 1 usa 2e-6), coeficiente KL de 0,01 con el estimador k3 original de GRPO (`expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`), semilla 42 y contexto de 8.192 tokens. Se trata del k3 sin correccion de ratio de importancia, por lo que el autor no reclama un gradiente exacto e insesgado de KL inversa. Cada carpeta `checkpoint-NNNNNN/` es inmutable e incluye pesos safetensors PEFT, configuracion del adaptador, tokenizador, plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256; cada checkpoint tiene su propio commit en el Hub.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: el entrenamiento se centra en un split de 2.048 preguntas de matematicas con recompensa binaria de respuesta correcta.
- Modo no-thinking: el modelo se entrena con `enable_thinking=False`, de modo que genera respuestas directas sin cadena de razonamiento extendida.
- Adaptacion eficiente sobre Qwen3-1.7B: al ser un adaptador LoRA, hereda las capacidades del modelo base y puede combinarse o sustituirse con otros adaptadores.
- Reanudacion de entrenamiento: la configuracion permite `is_trainable=True` para continuar el entrenamiento del adaptador con un optimizador nuevo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el entrenamiento se limita a problemas de matematicas de un solo turno.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el repositorio sirve como punto de partida reproducible para estudiar el efecto del termino de rango de verosimilitud (coeficiente 0,25) frente a GRPO estandar, ya que publica todos los checkpoints incluido el adaptador cero.
- Ablaciones controladas de recompensa: al conservar el adaptador inicial sin entrenar y los metadatos por checkpoint, permite medir la contribucion de cada actualizacion del optimizador sobre la misma receta y semilla fijada.
- Reproduccion de experimentos de matematicas en modelos pequenos: con 1,7 mil millones de parametros y contexto de 8.192 tokens, el coste de replicar las 128 actualizaciones previstas es asumible en una sola GPU de gama alta.
- Evaluacion de estabilidad del k3 con coeficiente KL 0,01: el modelo es adecuado para estudiar deriva respecto a la politica base y el efecto del warmup lineal de 10 actualizaciones.
- Punto de partida para un adaptador de matematicas en produccion ligera: tras validarlo, podria fusionarse con el modelo base y desplegarse en entornos con recursos limitados para resolver problemas aritmeticos o algebraicos sencillos.
- Docencia y prototipado: permite ilustrar como se comporta un modelo pequeno entrenado con RL sobre matematicas cuando se desactiva el modo thinking, con un coste de inferencia bajo.
- Comparacion de adaptadores: al ser un adaptador PEFT independiente, puede cargarse y descargarse sobre la misma copia del modelo base para comparar variantes sin duplicar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se realiza ninguna evaluacion ni afirmacion de superioridad, y no incluye cifras de MMLU, GSM8K, HumanEval ni de ningun otro conjunto. Tampoco se han encontrado resultados de benchmarks en la busqueda web proporcionada, cuyos resultados no guardan relacion con el modelo.

## Requisitos de hardware

- Pesos del adaptador: el adaptador LoRA individual ocupa decenas de megabytes; el repositorio completo pesa 9,2 GB porque incluye todos los checkpoints publicados.
- Inferencia con el modelo base en bf16: aproximadamente 3,4 GB solo de pesos, mas la cache KV correspondiente a 8.192 tokens de contexto (estimacion a partir del tamano del modelo; no hay mediciones publicadas).
- Inferencia cuantizada: en int8 en torno a 1,7 GB y en int4 alrededor de 1 GB de pesos (estimaciones), lo que deja margen amplio para la cache KV.
- GPU de consumo: cabe con holgura en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) e incluso en tarjetas de 6 GB con cuantizacion de 4 bits. GPU recomendadas para entrenamiento o evaluacion a gran escala: A100, H100 o RTX 4090; para inferencia basta una GPU de gama media.
- Despliegue: la ruta documentada es `transformers` + `peft` + `huggingface_hub`. Para servirlo en produccion, vLLM permite cargar adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base antes de convertirlo a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos no forman parte de la informacion proporcionada y deben verificarse en sus propias fichas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grpo-qwen3-1.7b-nonthinking-likelihood-2048 | 1,7 B (base) + LoRA | 8.192 tokens de entrenamiento | No disponible | safetensors (PEFT) | Adaptador de investigacion, sin evaluacion publicada |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | Punto de partida fijado en el commit `70d244cc...` |
| Otros adaptadores GRPO de la misma familia STRIDE | No disponible | No disponible | No disponible | safetensors (PEFT) | Referenciados en la model card como ejecuciones anteriores sobre el mismo split de 2.048 preguntas |

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor declara explicitamente que no se hace ninguna afirmacion de evaluacion ni de superioridad; no hay benchmarks que respalden su calidad.
- Entrenamiento posiblemente incompleto: la model card indica que el exito se mide por las entradas reales de `checkpoint_index.json` y que las epocas planificadas no implican que el entrenamiento haya finalizado.
- Verificacion parcial: que la respuesta final sea correcta no verifica cada paso intermedio de la demostracion, por lo que el modelo puede llegar a un resultado correcto con razonamiento defectuoso.
- Modo thinking desactivado: la plantilla por defecto de Qwen3-1.7B activa el razonamiento extendido, de modo que omitir `enable_thinking=False` en inferencia cambia las condiciones respecto al entrenamiento y puede degradar los resultados.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Debe consultarse al autor antes de cualquier uso en produccion.
- Idiomas no declarados: el entrenamiento se limita a matematicas y no hay informacion sobre cobertura multilingue.
- Sesgos: no disponibles; no se ha publicado ningun analisis de sesgos.
- Riesgo de alucinacion: no cuantificado, pero es esperable en un modelo de 1,7 mil millones de parametros entrenado con recompensa binaria.
- Naturaleza experimental: el objetivo declarado es investigar estabilidad del algoritmo, no entregar un modelo listo para produccion. Se recomienda validacion exhaustiva antes de cualquier despliegue.
- Artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/grpo-qwen3-1.7b-nonthinking-likelihood-2048-20260918
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`)
- Repositorio del autor de la receta: https://github.com/AndreHe02/rewarding-unlikely-release (commit `ca1cff05ebdf2cfe9737fd416897da838a93e11a`)
- Paper o publicacion asociada: no disponible
- Demo: no disponible
- Resultados adicionales de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a entidades bancarias y no guardan relacion con esta ficha.
