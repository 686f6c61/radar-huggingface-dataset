# MANGSEOK123/qwen3-4b-tau2-oel-telecom-final-pairs

## Resumen

qwen3-4b-tau2-oel-telecom-final-pairs es un ajuste fino de Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en HuggingFace. El modelo se ha entrenado durante una sola epoca mediante Online Experiential Learning (OEL) sobre el dominio **telecom** del benchmark tau2-bench, un conjunto de tareas de agente con uso de herramientas y dialogo multi-turno en el ambito de las telecomunicaciones. El repositorio contiene 4.411.424.256 parametros en formato safetensors (8,8 GB), lo que corresponde a los pesos completos del modelo base en precision de 16 bits.

La particularidad tecnica del artefacto es que el OEL aplicado no es aprendizaje por refuerzo, sino **autodestilacion**: profesor y alumno comparten pesos y la unica diferencia es que al profesor se le anade a la instruccion de sistema la memoria de la tarea resuelta; el alumno se ajusta a la distribucion del profesor con una perdida KL completa a nivel de token, de modo que el comportamiento aprendido persista sin la memoria en el prompt. El autor publica el modelo explicitamente como **artefacto reproducible, no como modelo mejorado**: segun su propia advertencia, la destilacion no ha superado al modelo base en esta serie de experimentos.

El interes actual del modelo es, por tanto, metodologico y de reproducibilidad: es un caso documentado de un enfoque de aprendizaje experiencial aplicado a un modelo pequeno (4 B) orientado a agentes, con licencia Apache 2.0 y con soporte de tool calling via vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no documentada en este repositorio) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos safetensors, sin variantes GGUF ni AWQ/GPTQ publicadas |
| Idiomas soportados | ingles (etiqueta `en` en el repositorio y en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4,41 mil millones de parametros que este repositorio reutiliza sin modificar la topologia. Lo que cambia es el ajuste: una epoca de Online Experiential Learning sobre 48 pares (memoria, tarea sintetizada) del dominio telecom de tau2-bench. El entrenamiento se ejecuto con batch size 8 repartido en 4 GPU, 6 pasos (una epoca), learning rate de 3e-6, recorte de gradiente de 1.0 y una perdida KL de tipo `full` calculada sobre **todos** los tokens de la respuesta. El simulador de usuario empleado para generar los dialogos fue gpt-4.1-mini.

La innovacion metodologica no esta en el modelo, sino en el procedimiento: no hay senal de recompensa ni RL, sino destilacion de profesor a alumno con pesos compartidos, donde el profesor ve la memoria de la tarea en su system prompt y el alumno debe reproducir su distribucion sin ella. El autor documenta dos observaciones relevantes para quien quiera replicar el metodo: las normas de gradiente se mantuvieron muy por encima del umbral de recorte de 1.0 durante todo el entrenamiento (de modo que el recorte, y no el learning rate, determino el tamano efectivo del paso), y una segunda epoca empeoro ligeramente los resultados en lugar de mejorarlos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen3-4B-Instruct-2507.
- Razonamiento de agente multi-turno en el dominio de telecomunicaciones, con memoria de tarea y resolucion de incidencias por pasos.
- Tool calling / function calling: el autor documenta su uso con `--enable-auto-tool-choice` y el parser `--tool-call-parser hermes` en vLLM.
- Seguimiento de instrucciones de sistema y uso de contexto de tarea (el comportamiento entrenado busca imitar al profesor que dispone de memoria explicita).
- Capacidades multilingues: limitadas al ingles segun las etiquetas y la model card; no se declara soporte de otros idiomas.
- Capacidades multimodales, de audio o de vision: no disponibles; el repositorio solo contiene pesos de texto.
- Modo de razonamiento explicito (thinking): no se documenta ninguna variante de este tipo en la model card.

## Casos de uso

- **Investigacion reproducible sobre aprendizaje experiencial**: el propio autor lo publica como artefacto reproducible de OEL sobre tau2-bench telecom, por lo que sirve como punto de partida para replicar el pipeline de autodestilacion con perdida KL completa a nivel de token.
- **Linea base para comparativas de metodos de memoria en agentes**: al existir el modelo base Qwen3-4B-Instruct-2507 sin ajustar, permite medir de forma controlada si la destilacion de memorias en los pesos aporta algo frente a inyectarlas en el prompt.
- **Atencion al cliente en telecomunicaciones**: el ajuste se ha realizado sobre el dominio telecom de tau2-bench, de modo que el modelo esta orientado a dialogos multi-turno con consultas de facturacion, incidencias de linea y cambios de plan, apoyandose en herramientas externas.
- **Diagnostico tecnico asistido con function calling**: puede integrarse en un agente que consulte APIs de estado de red, incidencias abiertas o historial de tickets, usando el parser `hermes` para emitir llamadas a herramienta en vLLM.
- **Prototipado local de agentes**: con 4,41 B de parametros, cabe en GPU de consumo, lo que permite iterar sobre prompts, memorias de tarea y esquemas de herramientas sin coste de API en la fase de desarrollo.
- **Destilacion y ajuste posterior como material de partida**: el checkpoint puede reutilizarse como inicializacion para experimentos de destilacion con mas datos, mas epocas o dominios distintos dentro de tau2-bench (aerolineas, retail).
- **Evaluacion de robustez de agentes pequenos**: util para estudiar como se degrada un agente de 4 B cuando se le retira la memoria de tarea del contexto, que es precisamente la hipotesis que el ajuste intenta resolver.

## Benchmarks y rendimiento

El autor indica que el modelo **aun no se ha evaluado sobre el split de test reservado**. La unica informacion cuantitativa disponible en la model card es la siguiente:

| Metrica | Valor declarado |
|---|---|
| Evaluacion en test de tau2-bench telecom | no realizada ("not yet evaluated on the held-out test split") |
| Diferencia frente al modelo base | dentro de un error estandar |
| Error estandar estimado | ~0,06-0,08 con 40 tareas |
| Efecto de una segunda epoca | ligeramente peor que una sola epoca |
| Norma de gradiente durante el entrenamiento | por encima del recorte de 1.0 de forma sostenida |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card).

## Requisitos de hardware

- **Pesos en precision completa**: el repositorio ocupa 8,8 GB, coherente con pesos en BF16/FP16 para 4,41 B de parametros. La VRAM necesaria para inferencia en 16 bits se situa, como estimacion, en torno a 10-12 GB contando cache KV y activaciones con contexto moderado.
- **Estimacion por cuantizacion** (valores orientativos, no publicados por el autor): ~4,5 GB en 8 bits y ~2,5-3 GB en 4 bits para los pesos.
- **GPU profesionales**: A100, H100, L40S o A6000 sin problema para inferencia en 16 bits; no se requiere multi-GPU pese a que el entrenamiento usase 4 GPU.
- **GPU de consumo**: cabe en RTX 4090, RTX 3090 o RTX 4080 (16-24 GB) en 16 bits; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070 8 GB) conviene usar 8 o 4 bits.
- **Despliegue**: el autor documenta vLLM mediante `vllm serve MANGSEOK123/qwen3-4b-tau2-oel-telecom-final-pairs --enable-auto-tool-choice --tool-call-parser hermes`. No se publican pesos en GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia. TGI u otros servidores no estan documentados.
- **Latencia y throughput**: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Relacion |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-final-pairs | 4,41 B | no disponible | Apache 2.0 | HuggingFace, safetensors, 8,8 GB | Objeto de esta ficha |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B (modelo base) | no disponible en la informacion proporcionada | Apache 2.0 (segun el modelo base) | HuggingFace | Modelo del que deriva; unica referencia directa de comparacion |
| Otros modelos de ~4 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | La busqueda web realizada no devolvio resultados relevantes sobre alternativas comparables |

La busqueda web asociada a esta consulta no aporto informacion sobre modelos comparables (los resultados obtenidos correspondian a documentacion de JavaFX y no guardan relacion con el modelo). No se dispone de datos de rendimiento del modelo base ni de alternativas, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- **No mejora al modelo base**: el autor afirma explicitamente que, en toda la serie de ejecuciones, el OEL no ha superado a Qwen3-4B-Instruct-2507 y que las diferencias caen dentro de un error estandar (SE ~0,06-0,08 con 40 tareas). Se publica como artefacto reproducible, no como modelo mejorado.
- **Sin evaluacion en test**: el modelo no se ha evaluado sobre el split de test reservado de tau2-bench telecom, por lo que no hay evidencia publicada de su comportamiento en tareas no vistas.
- **Riesgo de sobreajuste al conjunto de entrenamiento**: solo 48 pares (memoria, tarea) y 6 pasos de entrenamiento; la cobertura del dominio telecom es muy reducida.
- **Idioma**: unicamente ingles declarado; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- **Riesgo de alucinacion**: es un modelo de 4 B orientado a agentes; en tareas de tool calling puede emitir llamadas mal formadas o inventar argumentos. No se han publicado tasas de fallo.
- **Configuracion de entrenamiento suboptima**: las normas de gradiente excedieron de forma sostenida el recorte de 1.0, lo que implica que el tamano de paso efectivo quedo fijado por el recorte y no por el learning rate; ademas, una segunda epoca empeoro los resultados.
- **Limitaciones de contexto**: la longitud de contexto no se documenta en este repositorio; conviene verificar la del modelo base antes de desplegarlo en produccion.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-4B-Instruct-2507 conviene revisar las condiciones del modelo base y de los datos generados con gpt-4.1-mini (simulador de usuario), cuyo uso puede estar sujeto a los terminos del proveedor.
- **Formato**: solo se distribuyen pesos safetensors; no hay cuantizaciones oficiales ni versiones GGUF, lo que anade trabajo de conversion para despliegues ligeros.
- **Madurez del repositorio**: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte asociado.

## Enlaces

- HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-final-pairs
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Benchmark tau2-bench (referenciado en la model card, sin enlace explicito proporcionado): no disponible
- Paper del metodo OEL (referenciado de forma indirecta como "the method's authors"): no disponible
- Repositorio de codigo de entrenamiento: no disponible
- Demos: no disponible

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a documentacion de JavaFX y se han descartado por no ser pertinentes.
