# SingleBicycle/ccpo-alfworld-qwen2.5-7b-return-hard

## Resumen

`ccpo-alfworld-qwen2.5-7b-return-hard` es un checkpoint de politica de agente entrenado con CCPO (Context-Conditioned Policy Optimization) sobre ALFWorld, un benchmark de tareas domesticas embodied en formato texto. Lo publica el usuario SingleBicycle y parte de Qwen/Qwen2.5-7B-Instruct como modelo base. Su proposito no es el uso generalista, sino servir de evidencia experimental sobre asignacion de credito en aprendizaje por refuerzo multi-turno para agentes.

La contribucion tecnica que representa es una variante del estimador de ventaja de la familia GRPO. Mientras que GRPO y sus derivados descomponen la ventaja en un termino de episodio y otro de paso, CCPO conserva intacto el termino de episodio y sustituye solo el termino de paso por una linea base leave-one-out condicionada por contexto y reducida por incertidumbre, de modo que una comparacion directa contra el baseline aísla el estimador y nada mas. Este brazo concreto usa la compuerta exacta de anclaje `(task_uid, observation_text)` que emplean GiGPO y G2PO, con ponderacion uniforme de hermanos y credito de paso calculado sobre el retorno descontado.

Es relevante ahora porque aborda un problema abierto y dificil de medir, la asignacion de credito en RL de agentes, y porque publica resultados intermedios con un nivel de honestidad metodologica poco habitual: advierte de que es un checkpoint intermedio (paso 119 de 150), de que cada brazo se ha ejecutado con una sola semilla y de que las cifras no son comparables con los resultados publicados en ALFWorld para modelos de 1,5 B. El modelo tiene 7.615.616.512 parametros (~7,6 B), licencia Apache 2.0, idioma ingles y un repositorio de 30,5 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (fine-tune de Qwen/Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso 2048 tokens de prompt y 512 de respuesta |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct, un transformer decoder-only de aproximadamente 7,6 B de parametros, heredada sin modificaciones estructurales: el ajuste es de pesos, no de arquitectura. El entrenamiento es de aprendizaje por refuerzo sobre ALFWorld (AlfredTWEnv), con seis tipos de tarea. La configuracion es: lote de 16 tareas por 8 rollouts, es decir, 128 episodios por paso; maximo de 50 pasos de entorno por episodio con historial de longitud 2; tasa de aprendizaje constante de 1e-6; coeficiente KL de 0,01 con estimador de baja varianza; gamma de 0,95; y ventanas de 2048 tokens de prompt y 512 de respuesta. El entrenamiento se ejecuto en 8 GPU NVIDIA H200 y los hiperparametros siguen el script de referencia de G2PO para ALFWorld, de modo que el protocolo coincide con los baselines publicados (solo cambian el tamano del backbone y el numero de GPU).

La innovacion destacable es el estimador CCPO. Las entradas se agrupan por `(task_uid, observation_text)`, el mismo anclaje de estado que usan GiGPO y G2PO. Cada entrada recibe un vector de caracteristicas congelado procedente del estado oculto del ultimo token del prompt de la politica de referencia, blanqueado sobre el lote. Los hermanos se ponderan mediante `exp(-d/tau)` sobre la distancia en ese espacio de caracteristicas y la linea base es una media leave-one-out ponderada sobre las demas trayectorias. Un factor de contraccion (shrinkage) devuelve el resultado hacia la linea base uniforme cuando la discrepancia entre ambas no supera su propio ruido de muestreo. En este brazo los flags son `gate=hard`, `target=return` y `rho=0.0`, con ponderacion uniforme de hermanos y credito de paso sobre el retorno descontado. El codigo esta en tracyhann/agent-context-grpo, construido sobre verl-agent.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Qwen2.5-7B-Instruct.
- Politica de agente para entornos textuales: emite la accion en el formato `<think>...</think><action>...</action>`, donde el texto dentro de `<action>` se pasa directamente al entorno y debe coincidir con una accion admisible.
- Razonamiento multi-paso en episodios de hasta 50 interacciones de entorno, con historial de longitud 2.
- Resolucion de seis tipos de tarea de ALFWorld: Pick, Look, Clean, Heat, Cool y Pick2.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- Modo de pensamiento explicito mediante el bloque `<think>`.

## Casos de uso

- Investigacion en asignacion de credito para RL de agentes: el modelo sirve como brazo experimental de CCPO frente a variantes como la compuerta global con objetivo de nodo sucesor, en igualdad de hardware, semilla y orden de datos.
- Reproduccion de experimentos de RL multi-turno: el checkpoint permite reanudar o auditar el entrenamiento desde el paso 115 y comparar el efecto del estimador de ventaja.
- Evaluacion de politicas de agente en ALFWorld: al resolver tareas de Pick, Look, Clean, Heat, Cool y Pick2 con una tasa de exito convergida del 83,5 por ciento en 128 tareas no vistas, es util como punto de referencia interno.
- Analisis de eficiencia de exploracion: la media de turnos por episodio (12,5 en la mejor evaluacion, frente a unos 39 al inicio) permite estudiar como una politica aprende a resolver tareas de forma directa en lugar de por busqueda.
- Estudio de prompts de agente: como la politica espera el prompt de agente de verl-agent y un formato de salida estricto, sirve para probar variantes de prompt y medir su impacto en la accion emitida.
- Docencia y divulgacion tecnica sobre RL de agentes: ilustra de forma tangible la diferencia entre termino de episodio y termino de paso, y el papel del shrinkage en la linea base.
- Base para ablaciones de features de contexto: al usar el estado oculto del ultimo token del prompt de la politica de referencia, permite experimentar con otras representaciones de anclaje.

## Benchmarks y rendimiento

Evaluacion held-out sobre 128 tareas de ALFWorld no vistas (`eval_in_distribution`), con muestreo a temperatura 0,4, el mismo protocolo que los baselines publicados.

| Metrica | Valor |
|---|---|
| Exito held-out (ventana convergida, paso >= 70) | 83,5 % |
| Desviacion estandar | 6,5 |
| Evaluaciones promediadas | 10 |
| Exito held-out (mejor evaluacion individual, paso 115) | 93,8 % |
| Exito de entrenamiento en el paso 115 | 99,2 % |

Desglose de la mejor evaluacion individual (paso 115):

| Metrica | Turns | Pick | Look | Clean | Heat | Cool | Pick2 |
|---|---|---|---|---|---|---|---|
| Valor | 12,5 | 100,0 | 84,5 | 96,7 | 87,5 | 83,8 | 96,2 |

Comparacion entre los tres brazos de CCPO (medias de la ventana convergida, mismo hardware, semilla y orden de datos):

| Brazo | Media held-out | sd | n |
|---|---|---|---|
| CCPO return-hard + task backoff + J-weighting | 90,0 | 3,1 | 9 |
| CCPO return-hard (este modelo) | 83,5 | 6,5 | 10 |
| CCPO global gate, successor-node target | 77,5 | 6,3 | 9 |

El propio autor advierte de que la fila de la mejor evaluacion individual no debe leerse como resultado, ya que es el maximo de una serie ruidosa y esta sesgada al alza en aproximadamente 1,5 desviaciones estandar. Una unica evaluacion de 128 episodios conlleva una incertidumbre de unos +/-5 puntos.

## Requisitos de hardware

- Entrenamiento: 8 GPU NVIDIA H200, segun la configuracion declarada por el autor. No se especifica el tiempo total de entrenamiento.
- Inferencia en precision completa (fp16/bf16): aproximadamente 15,2 GB solo para pesos, mas el coste de cache KV y activaciones.
- Cuantizacion: no se publican pesos cuantizados, por lo que no hay cifras de VRAM verificadas para 8 bits o 4 bits (estimaciones orientativas: ~8 GB en 8 bits y ~4-5 GB en 4 bits, no confirmadas por el autor).
- GPU consumer: una RTX 4090 de 24 GB puede alojar los pesos en fp16 con margen limitado para contexto corto, y con mas holgura si se cuantiza el modelo.
- Despliegue: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que TGI es una via soportada. Tambien es utilizable con transformers de forma directa y, en principio, con vLLM. El uso con llama.cpp u Ollama requeriria convertir los pesos a GGUF, algo no publicado en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en ALFWorld | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (CCPO return-hard) | ~7,6 B | No disponible | 83,5 % held-out (ventana convergida); 93,8 % mejor evaluacion | Apache 2.0 | HuggingFace, checkpoint intermedio |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | ~7,6 B | No disponible | No aplica sin entrenamiento de agente | Apache 2.0 | HuggingFace |
| GiGPO K=2 (publicado) | ~1,5 B | No disponible | 90,16 % | No disponible | Publicacion |
| HGPO K=2 (publicado) | ~1,5 B | No disponible | 92,77 % | No disponible | Publicacion |
| GRPO (publicado) | ~1,5 B | No disponible | 72,8 % | No disponible | Publicacion |

Advertencia del autor: las cifras publicadas de GRPO (72,8), GiGPO K=2 (90,16) y HGPO K=2 (92,77) corresponden a Qwen2.5-1.5B-Instruct, mientras que este modelo es de 7 B, por lo que constituyen un escenario distinto y no son comparables de forma directa. El autor no reclama superioridad sobre GRPO, ya que no existe un baseline GRPO valido en su base de codigo.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento objetivo eran 150 pasos y este brazo esta en el paso 119. Los pesos y las cifras publicadas son provisionales y seran sustituidos cuando finalice la ejecucion.
- Una sola semilla por brazo: la guia del propio repositorio recomienda reportar la media de al menos tres semillas y no leer puntos individuales, por lo que las diferencias entre los tres brazos deben considerarse no resueltas hasta que se repliquen.
- No demuestra superioridad sobre GRPO: no existe un baseline GRPO valido en el codigo; un intento anterior quedo contaminado cuando un relanzamiento paso la etiqueta de ejecucion pero no el estimador.
- Cifras no comparables con la literatura: los resultados publicados de ALFWorld son de modelos de 1,5 B, no de 7 B.
- Ruido de evaluacion elevado: una unica evaluacion de 128 episodios tiene un margen de unos +/-5 puntos, y la mejor fila esta sesgada al alza en torno a 1,5 desviaciones estandar.
- Especializacion de dominio: la politica espera el prompt de agente concreto de verl-agent y emite un formato estricto `<think>...</think><action>...</action>`; fuera de ese formato la accion puede no ser admisible para el entorno.
- Idioma: solo ingles declarado.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion proporcionada; es un riesgo previsible en cualquier modelo de 7 B al usarse fuera del entorno para el que fue entrenado.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia: Apache 2.0, que permite uso comercial, pero el modelo esta disenado para investigacion en RL de agentes y no como asistente generalista.
- Uso en produccion: no recomendado tal cual, dado su caracter intermedio y su especificidad de entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SingleBicycle/ccpo-alfworld-qwen2.5-7b-return-hard
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo CCPO (agent-context-grpo): https://github.com/tracyhann/agent-context-grpo
- Framework verl-agent: https://github.com/langfengQ/verl-agent
- Benchmark ALFWorld: https://github.com/alfworld/alfworld
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas sobre la Antartida y no guardan relacion con esta ficha.
