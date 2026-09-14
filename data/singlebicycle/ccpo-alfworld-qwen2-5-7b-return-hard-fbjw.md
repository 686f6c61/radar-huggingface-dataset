# SingleBicycle/ccpo-alfworld-qwen2.5-7b-return-hard-fbjw

## Resumen

El modelo `SingleBicycle/ccpo-alfworld-qwen2.5-7b-return-hard-fbjw` es una política de agente entrenada con CCPO (Context-Conditioned Policy Optimization) sobre ALFWorld, un benchmark de tareas domésticas encarnadas representadas en texto. Parte de Qwen2.5-7B-Instruct como modelo base y se distribuye como un fine-tuning completo con 7.615.616.512 parámetros en formato safetensors. Lo publica el usuario SingleBicycle dentro de una línea de experimentos sobre asignación de crédito en aprendizaje por refuerzo con agentes multi-turno.

El problema que aborda es concreto: en los métodos de la familia GRPO, la ventaja de una transición se descompone en un término de episodio y un término de paso. CCPO mantiene intacto el término de episodio y sustituye únicamente el término de paso por una línea base condicionada por contexto y reducida por incertidumbre, de modo que una comparación contra otra variante aísla el estimador y nada más. El modelo es, por tanto, un artefacto de investigación en RL para agentes, no un asistente conversacional de propósito general.

Es relevante ahora porque el checkpoint es interino: el entrenamiento apunta a 150 pasos y este brazo está en el paso 113, con los pesos publicados correspondientes al paso 105. La ventana convergente reportada (paso >= 70) da un 90,0% de éxito en 128 tareas no vistas de ALFWorld con una desviación estándar de 3,1 sobre 9 evaluaciones. El autor advierte explícitamente de que estos números no son comparables con los resultados publicados de GRPO, GiGPO o HGPO, que emplean Qwen2.5-1.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, segun la etiqueta `qwen2` y el modelo base declarado) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento de RL usa 2048 tokens de prompt y 512 de respuesta como maximo |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (tamano de repo 30,5 GB, aproximadamente el doble del peso en bf16 de un modelo de 7,6B) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only de 7,6B parametros con atencion causal. Sobre esos pesos no se aplica un SFT adicional documentado: el repositorio describe exclusivamente un proceso de aprendizaje por refuerzo sobre ALFWorld (entorno `AlfredTWEnv`, 6 tipos de tarea), lo que convierte este checkpoint en un fine-tuning de RL sobre una politica ya instruida.

El procedimiento de entrenamiento sigue el esquema CCPO. La ventaja se divide en un termino de episodio, que se conserva, y un termino de paso, que se reemplaza. Las entradas se agrupan por `(task_uid, observation_text)`, el mismo anclaje de estado que usan GiGPO y G2PO. Cada entrada recibe un vector de caracteristicas congelado procedente del estado oculto del ultimo token del prompt de la politica de referencia, blanqueado sobre el lote. Los hermanos se ponderan mediante `exp(-d/tau)` sobre esa distancia de caracteristicas y la linea base es una media ponderada leave-one-out sobre las demas trayectorias. Un factor de contraccion devuelve el resultado hacia la linea base uniforme cuando la discrepancia entre ambas no supera su propio ruido de muestreo. El brazo publicado anade dos modificaciones: `backoff_task=1`, que asigna una linea base a nivel de tarea a las filas cuyo cubo de anclaje no tiene hermanos, y `jweight_c=1.0`, que escala el termino de paso por `J/(J+c)` para que los cubos pequenos pesen menos. Los flags distintivos son `gate=hard`, `target=return`, `rho=0.0`, `backoff_task=1`, `jweight_c=1.0`.

La configuracion de entrenamiento declarada es: lote de 16 tareas x 8 rollouts = 128 episodios por paso, maximo de 50 pasos de entorno por episodio, longitud de historial 2, tasa de aprendizaje constante de 1e-6, coeficiente KL de 0.01 con estimador de baja varianza, gamma de 0.95, 2048/512 tokens de prompt/respuesta y evaluacion sobre 128 tareas no vistas cada 5 pasos con temperatura 0,4. El hardware empleado son 8 GPU NVIDIA H200. Los hiperparametros siguen el script de referencia de G2PO para ALFWorld, de modo que solo cambian el tamano del backbone y el numero de GPU. La politica emite la salida en el formato `<think>...</think><action>...</action>`, y el contenido de `<action>` se pasa directamente al entorno, por lo que debe coincidir con una accion admisible.

## Capacidades

- Generacion de texto y conversacion mediante el pipeline `text-generation`, heredada del modelo base instruido.
- Politica de agente para ALFWorld: seleccion de acciones en un entorno domestico textual con 6 tipos de tarea (Pick, Look, Clean, Heat, Cool, Pick2).
- Razonamiento multi-paso: hasta 50 interacciones con el entorno por episodio, con historial de longitud 2.
- Salida estructurada en dos bloques: `<think>` para el razonamiento intermedio y `<action>` para la accion ejecutable. Esta restriccion de formato es parte del contrato de la politica.
- Planificacion orientada a objetivo: la tasa de exito reportada es del 90,0% en tareas no vistas y el numero medio de turnos cae desde aproximadamente 39 hasta 10,8, lo que indica que la politica resuelve tareas de forma directa en lugar de explorar.
- Rendimiento por tipo de tarea en la mejor evaluacion individual (paso 105): Pick 100,0; Look 100,0; Clean 100,0; Heat 96,2; Cool 91,7; Pick2 89,4.
- Idiomas: unicamente ingles.
- No se documenta soporte de tool calling o function calling general, ni capacidades de vision, audio o ejecucion de codigo. Las etiquetas del repositorio incluyen `conversational` y `text-generation-inference`, pero no `tool-calling` ni `function-calling`.
- No se documenta un modo de razonamiento explicito configurable mas alla del bloque `<think>` exigido por el formato de ALFWorld.

## Casos de uso

- Investigacion en asignacion de credito para RL de agentes: el checkpoint permite reproducir y auditar el estimador CCPO en su variante `hard` con backoff de tarea y ponderacion J, comparando directamente contra las otras dos variantes del mismo autor (90,0 frente a 83,5 y 77,5 de exito medio en ventana convergente). Es el uso principal del artefacto.
- Evaluacion de tecnicas de RL multi-turno: al compartir hardware, semilla, lote y orden de datos con los otros brazos, y al haberse verificado que producen rollouts identicos en el paso 1, sirve para aislar el efecto de un unico cambio en el estimador.
- Generacion de trayectorias de alta calidad para SFT o destilacion: con un 90% de exito y 10,8 turnos medios por episodio, el modelo produce secuencias relativamente cortas y mayoritariamente correctas que pueden reutilizarse como datos de entrenamiento para modelos mas pequenos.
- Punto de partida para fine-tuning en dominios de agentes textuales: al estar construido sobre un modelo instruido de 7,6B con licencia Apache 2.0, admite ajuste posterior en entornos con interfaz de texto y formato de accion similar.
- Analisis de eficiencia de politicas: la metrica de turnos medios (descenso desde ~39 hasta 10,8) permite estudiar el compromiso entre exploracion y explotacion en agentes entrenados con RL.
- Docencia y cursos de RL aplicado a LLM: es un ejemplo completo y reproducible de pipeline agentico (verl-agent sobre verl) sobre un benchmark estandar y abierto como ALFWorld.
- Comparacion de estimadores en un mismo presupuesto de computo: dado que el autor documenta explicitamente la ausencia de una linea base GRPO valida en su base de codigo, este checkpoint resulta util como referencia metodologica sobre como reportar resultados interinos y con una sola semilla.
- Simulacion de entornos domesticos textuales: cualquier integracion que implemente la interfaz de ALFWorld puede usar la politica para resolver episodios de manipulacion de objetos sin necesidad de infraestructura grafica.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 128 tareas no vistas de ALFWorld (`eval_in_distribution`), temperatura 0,4.

Ventana convergente (paso >= 70):

| Metrica | Valor |
|---|---|
| Exito en held-out | 90,0% |
| Desviacion estandar | 3,1 |
| Evaluaciones promediadas | 9 |

Mejor evaluacion individual (paso 105), que el autor desaconseja leer como resultado:

| Held-out | Turnos | Pick | Look | Clean | Heat | Cool | Pick2 |
|---|---|---|---|---|---|---|---|
| 96,1 | 10,8 | 100,0 | 100,0 | 100,0 | 96,2 | 91,7 | 89,4 |

Tasa de exito en entrenamiento en ese mismo paso: 89,1%.

Comparacion entre los tres brazos del mismo run, con hardware, semilla y orden de datos identicos:

| Brazo | Media held-out | Desviacion estandar | n |
|---|---|---|---|
| CCPO return-hard + backoff de tarea + ponderacion J | 90,0 | 3,1 | 9 |
| CCPO return-hard | 83,5 | 6,5 | 10 |
| CCPO global gate, target de nodo sucesor | 77,5 | 6,3 | 9 |

Referencias publicadas citadas por el autor (todas con Qwen2.5-1.5B-Instruct, por lo que no son comparables con este modelo de 7B): GRPO 72,8; GiGPO K=2 90,16; HGPO K=2 92,77.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento declarado: 8 GPU NVIDIA H200, lote de 128 episodios por paso de RL.
- Inferencia en bf16/fp16: aproximadamente 15,2 GB solo de pesos, mas cache KV y activaciones; en la practica se necesitan del orden de 18-20 GB de VRAM para prompts cortos y un usuario.
- Inferencia en cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos.
- Inferencia en cuantizacion de 4 bits: aproximadamente 4-5 GB de pesos. Estas cifras son estimaciones derivadas del numero de parametros; el autor no publica versiones cuantizadas ni mediciones de VRAM.
- GPU profesionales recomendadas: A100 40/80 GB, H100/H200, L40S. Para el modelo sin cuantizar, una GPU de 24 GB es suficiente en la mayoria de escenarios de un unico usuario.
- GPU de consumo: cabe en RTX 3090, RTX 4090, RTX 5090 y similares con 24 GB en bf16 de forma ajustada, y con holgura en cuantizacion de 8 o 4 bits. En tarjetas de 16 GB o menos es necesario cuantizar.
- Despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` es lo documentado en la model card. Las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con TGI. vLLM deberia ser viable al tratarse de una arquitectura Qwen2 densa estandar, aunque no esta confirmado por el autor. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se proporciona en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Entorno / tarea | Exito held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ccpo-alfworld-qwen2.5-7b-return-hard-fbjw | 7,6B | ALFWorld, 128 tareas no vistas, T=0,4 | 90,0 (sd 3,1, n=9) | Apache 2.0 | Pesos safetensors en HuggingFace |
| CCPO return-hard (mismo autor) | 7,6B | ALFWorld, mismo protocolo | 83,5 (sd 6,5, n=10) | Apache 2.0 | Pesos en HuggingFace |
| CCPO global gate, target de nodo sucesor (mismo autor) | 7,6B | ALFWorld, mismo protocolo | 77,5 (sd 6,3, n=9) | Apache 2.0 | Pesos en HuggingFace |
| GiGPO K=2 (referencia publicada) | 1,5B | ALFWorld | 90,16 | No disponible en la informacion | No disponible en la informacion |
| HGPO K=2 (referencia publicada) | 1,5B | ALFWorld | 92,77 | No disponible en la informacion | No disponible en la informacion |
| GRPO (referencia publicada) | 1,5B | ALFWorld | 72,8 | No disponible en la informacion | No disponible en la informacion |

Advertencia del propio autor: las filas de 1,5B corresponden a un ajuste experimental distinto, y un numero mas alto en el modelo de 7B no dice nada sobre la calidad del estimador frente a GiGPO o HGPO. Tampoco existe una linea base GRPO valida en la base de codigo del autor, por lo que no se formula ninguna afirmacion de superioridad sobre GRPO.

## Limitaciones y advertencias

- Checkpoint interino: el run objetivo son 150 pasos y este brazo esta en el paso 113; los pesos publicados son los del paso 105. Los numeros y los pesos cambiaran cuando finalice el entrenamiento.
- Una sola semilla por brazo: la guia del propio repositorio recomienda reportar la media de al menos tres semillas y no leer puntos individuales, por lo que las diferencias entre los 90,0, 83,5 y 77,5 deben considerarse no resueltas hasta que se repliquen.
- La mejor evaluacion individual (96,1 de held-out en el paso 105) esta sesgada al alza en aproximadamente 1,5 desviaciones estandar por seleccion del maximo de una serie ruidosa. Una evaluacion de 128 episodios conlleva un margen de unos +/-5 puntos. La media convergente es el resumen honesto.
- No se demuestra superioridad sobre GRPO. El autor indica que un intento anterior de linea base GRPO quedo contaminado al pasar la etiqueta del run pero no el estimador.
- Especializacion muy estrecha: la politica esta entrenada para el entorno ALFWorld y su formato de prompt de verl-agent. Fuera de ese contrato (formato `<think>`/`<action>`, acciones admisibles del entorno) el rendimiento no esta caracterizado.
- Idioma: unicamente ingles. No hay evidencia de comportamiento multilingue y el entrenamiento de RL no lo ha cubierto.
- El texto dentro de `<action>` se pasa directamente al entorno: una accion malformada o alucinada no se ejecuta correctamente, lo que exige validacion externa en cualquier despliegue real.
- El autor no reporta evaluacion de sesgos, toxicidad ni robustez adversarial. Al ser un modelo derivado de Qwen2.5-7B-Instruct, hereda los sesgos de su corpus de preentrenamiento, no auditados en esta ficha.
- Riesgo de alucinacion en tareas fuera de distribucion: la evaluacion se limita a `eval_in_distribution` sobre 128 tareas no vistas del mismo benchmark; no se publican resultados de generalizacion a otros entornos (`eval_out_of_distribution`) ni a variaciones del formato de observacion.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y los avisos de atribucion. El autor cita como dependencias verl-agent (Apache 2.0), verl y ALFWorld. No se declaran restricciones adicionales ni clausulas de uso aceptable.
- El repositorio ocupa 30,5 GB, aproximadamente el doble del peso en bf16 del modelo, un factor a tener en cuenta en el almacenamiento y la descarga.
- No se publican versiones cuantizadas ni pesos en GGUF, por lo que el despliegue en entornos de bajos recursos requiere conversion propia.
- No hay resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K) para este checkpoint, de modo que no puede evaluarse su degradacion respecto al modelo base en tareas ajenas al agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SingleBicycle/ccpo-alfworld-qwen2.5-7b-return-hard-fbjw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo de CCPO y experimentos del autor: https://github.com/tracyhann/agent-context-grpo
- Framework de entrenamiento de agentes: https://github.com/langfengQ/verl-agent
- Benchmark ALFWorld: https://github.com/alfworld/alfworld
- Busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a articulos de consumo y foros sin relacion con el modelo).
