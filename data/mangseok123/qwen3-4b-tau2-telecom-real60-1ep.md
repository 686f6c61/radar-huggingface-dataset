# MANGSEOK123/qwen3-4b-tau2-telecom-real60-1ep

## Resumen

Este repositorio contiene un ajuste fino de Qwen3-4B-Instruct-2507 orientado al dominio **telecom** del benchmark tau2-bench, publicado por el usuario MANGSEOK123. Se trata de un modelo denso de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) que conserva la licencia Apache 2.0 del modelo base. El ajuste se ha realizado mediante una técnica etiquetada como **OEL** (experience distillation según las etiquetas del repositorio) sobre 60 pares tarea-memoria redactados externamente: 30 de sustitución, 22 de composición y 8 de recuperación.

La idea central del entrenamiento es que el estudiante reproduce cada tarea **sin memoria**, mientras que el profesor son los mismos pesos con la memoria de esa tarea insertada en el system prompt. Es decir, la única diferencia entre ambos es el prompt, y no se utiliza ninguna señal de recompensa. El objetivo declarado es consolidar en los pesos del modelo el comportamiento que el prompt con memoria induce, de modo que el modelo rinda mejor en escenarios de atención al cliente telecom sin necesidad de inyectar la memoria explícitamente.

El modelo es relevante ahora como ejemplo de una línea de trabajo concreta: destilación de experiencia de contexto a pesos en modelos pequeños, aplicada a un dominio de agentes conversacionales. Conviene señalar que el autor indica explícitamente que el modelo **no ha sido evaluado** y que se subió justo después del entrenamiento, por lo que su utilidad práctica está por verificar. En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (~4,4 mil millones) |
| Parametros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | 40.960 tokens en la configuracion de servicio recomendada por el autor (`--max-model-len 40960`); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (tamano de repo 8,8 GB, compatible con precision bf16/fp16). No se indican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible: la model card no especifica idiomas. El modelo hereda las capacidades del modelo base Qwen3-4B-Instruct-2507, sin detalle declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 4,4 mil millones de parametros, sin mezcla de expertos ni mecanismos de estado recurrente. Sobre esa base se aplica un ajuste fino con la metodologia que el autor denomina OEL, enmarcada en las etiquetas del repositorio como *experience distillation*. El procedimiento no usa recompensa: el estudiante reproduce cada una de las 60 tareas sin memoria en el prompt, y el profesor son los **mismos pesos** con la memoria de esa tarea insertada en el system prompt. La perdida es una KL completa sobre todos los tokens de respuesta, con `kl_topk` de 256.

Los hiperparametros declarados son: 60 pares de entrenamiento, batch size 12 (cada lote completo), 1 epoca, learning rate constante de 3e-6, gradient clipping de 1.0 (valor por defecto de verl) y un simulador de usuario basado en gpt-4.1-mini con temperatura 0. La tabla de entrenamiento publicada cubre 5 pasos con valores de KL loss, entropia y norma de gradiente; el propio autor advierte que cada paso lee un lote distinto, de modo que la columna de perdida refleja mas la dificultad del lote que la convergencia. Destaca la variabilidad de la norma de gradiente (de 3.100 a 14.887) y la perdida de KL relativamente alta del paso 3 (0.049).

## Capacidades

- Generacion de texto conversacional en el dominio de atencion al cliente de telecomunicaciones, con heuristicas de resolucion de tareas aprendidas de los pares de memoria.
- Soporte de tool calling / function calling: la configuracion de servicio recomendada incluye `--enable-auto-tool-choice` y `--tool-call-parser hermes`, lo que implica plantilla de llamadas a herramientas compatible con Hermes.
- Comportamiento orientado a agentes: las tareas de tau2-bench telecom requieren interaccion multi-turno con simulador de usuario y uso de herramientas.
- Destilacion de experiencia: el modelo intenta reproducir el comportamiento inducido por memorias de tarea sin que estas esten presentes en el prompt.
- Capacidades multilingues: no disponible (no declaradas en la model card).
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible; no se mencionan en la informacion proporcionada.

## Casos de uso

- Agentes de soporte tecnico de operadoras: el modelo puede gestionar conversaciones multi-turno con un cliente simulado o real y ejecutar acciones mediante tool calling (consultar estado de linea, abrir incidencias), aprovechando el comportamiento aprendido en el dominio telecom de tau2-bench.
- Investigacion en destilacion de experiencia: sirve como artefacto reproducible para estudiar si 60 pares tarea-memoria y una epoca bastan para consolidar en pesos el efecto de una memoria en el system prompt, dado que el autor documenta la receta completa.
- Evaluacion de la brecha memoria/pesos: al ser el mismo modelo base con y sin memoria, permite medir cuanto del beneficio de la memoria contextual se transfiere a los pesos, aunque el propio autor indica que no ha evaluado el resultado.
- Prototipado de asistentes de facturacion y planes: tareas de sustitucion y composicion (30 y 22 pares respectivamente) apuntan a escenarios en los que el agente debe modificar o combinar elementos de un plan contratado.
- Recuperacion de informacion de cuenta en conversacion: los 8 pares de recuperacion sugieren utilidad en escenarios donde el agente debe recordar o reconstruir datos previos del cliente.
- Base para ajustes posteriores en dominios regulados: al ser Apache 2.0 y de 4,4B, es un punto de partida barato para equipos que quieran seguir entrenando con sus propias memorias de tarea.
- Despliegue de bajo coste en vLLM: el ejemplo oficial de servicio (vLLM con parser Hermes y ventana de 40.960 tokens) permite montar un endpoint compatible con agentes en una sola GPU de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo ajustado en la informacion disponible. El autor indica de forma explicita: "Not evaluated. Pushed straight after training." Los unicos numeros publicados corresponden al **modelo base**, no a este ajuste, y se reproducen a continuacion para contextualizar la senal que aportan las memorias.

| Evaluacion (modelo base Qwen3-4B-Instruct-2507) | Resultado |
|---|---|
| tau2-bench telecom, conjunto de entrenamiento de 59 pares, sin memoria | avg 0,085 |
| tau2-bench telecom, conjunto de entrenamiento de 59 pares, con memoria de cada tarea en el prompt | avg 0,175 |
| tau2-bench telecom, split de test, base | avg 0,056 / pass@4 0,175 |
| Este ajuste (qwen3-4b-tau2-telecom-real60-1ep) | No evaluado |

Segun el autor, el salto de 0,085 a 0,175 en el conjunto de entrenamiento supone duplicar los exitos, con aproximadamente 3,1 errores estandar sobre 177 episodios.

## Requisitos de hardware

- Pesos en bf16/fp16: 4.411.424.256 parametros x 2 bytes = unos 8,8 GB, coherente con el tamano de repositorio declarado (8,8 GB).
- VRAM estimada en bf16 para inferencia: aproximadamente 10-12 GB contando pesos y overhead de runtime; el KV cache a 40.960 tokens de contexto anade varios GB adicionales (el calculo exacto no esta disponible).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-7 GB; en 4 bits, alrededor de 2,5-5 GB. Estas cifras son estimaciones de orden de magnitud, ya que no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servir con la ventana completa de 40.960 tokens y concurrencia; en consumer, cabe en RTX 3090/4090 (24 GB), RTX 4060 Ti 16 GB y RTX 3060 12 GB en bf16 o cuantizado.
- Opciones de despliegue: el autor documenta vLLM con `--enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`. Otras opciones (llama.cpp, Ollama, TGI) no estan confirmadas en la informacion disponible, al no publicarse pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado en tau2-bench telecom |
|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-telecom-real60-1ep | 4,41B | 40.960 tokens en la configuracion de servicio recomendada | Apache 2.0 | No evaluado |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,41B | No disponible en la informacion proporcionada | Apache 2.0 | avg 0,056 / pass@4 0,175 en el split de test |
| Otros ajustes sobre tau2-bench telecom | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados comparativos con alternativas como Qwen2.5-7B-Instruct o Llama-3.1-8B-Instruct dentro de la informacion proporcionada, y este ajuste carece de evaluacion publicada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo no evaluado: el autor lo indica de forma explicita. No hay ninguna metrica del ajuste, solo del modelo base, por lo que no se puede afirmar que haya mejorado en tau2-bench telecom.
- Entrenamiento muy corto y estrecho: 60 pares, 1 epoca y 5 pasos documentados. La norma de gradiente llega a 14.887 en el paso 5 y la KL loss del paso 3 es de 0.049, lo que sugiere un ajuste poco estable o como minimo dificil de interpretar.
- Sin senal de recompensa: la destilacion se apoya solo en la diferencia de prompt entre estudiante y profesor, de modo que el modelo puede imitar el estilo de la respuesta con memoria sin haber adquirido la informacion subyacente.
- Riesgo de sobreajuste al dominio telecom: el entrenamiento se limita a un unico dominio de tau2-bench, lo que puede degradar el rendimiento generalista fuera de ese escenario.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion; el comportamiento del modelo base en esta materia se mantiene sin cuantificar.
- Idiomas y cobertura multilingue no declarados: la model card no especifica idiomas, por lo que no se puede garantizar el comportamiento en castellano.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tambien es Apache 2.0, por lo que no se anaden restricciones conocidas. Aun asi, la ausencia de evaluacion hace desaconsejable su uso en produccion sin validacion propia.
- El ejemplo de despliegue fija una ventana de 40.960 tokens; usar ventanas mayores no esta documentado y podria degradar el comportamiento.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom-real60-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del benchmark tau2-bench: no disponible en la informacion proporcionada
- Paper o blog del metodo OEL: no disponible en la informacion proporcionada
- Demo o space: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas corporativas de Microsoft (microsoft.com, account.microsoft.com, outlook.office.com) y no guardan relacion con este modelo, por lo que no se incluyen como referencias.
