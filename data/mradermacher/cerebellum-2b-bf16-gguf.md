# mradermacher/Cerebellum-2B-BF16-GGUF

## Resumen

Cerebellum-2B-BF16-GGUF es la version cuantizada en formato GGUF del modelo mkzero/Cerebellum-2B-BF16, publicada por mradermacher, un autor conocido por convertir pesos de HuggingFace a GGUF para su uso con llama.cpp y derivados. El modelo original tiene 1.881.825.088 parametros (aproximadamente 1,88 mil millones) y esta etiquetado por su autor como un "decision engine" no autorregresivo orientado a agentes, uso de herramientas (tool use), function calling y automatizacion de procesos roboticos (RPA).

La relevancia de esta ficha es doble. Por un lado, se trata de un modelo de menos de 2.000 millones de parametros, lo que lo situa en la gama que puede ejecutarse en hardware de consumo e incluso en CPU. Por otro, la etiqueta "non-autoregressive" es poco habitual en el ecosistema de modelos de lenguaje: sugiere una arquitectura de decodificacion distinta a la del decoder transformer clasico, pensada para tomar decisiones o emitir llamadas a funciones en lugar de generar texto libre de forma secuencial.

El repositorio contiene exclusivamente los pesos cuantizados en GGUF (desde Q2_K de 1,1 GB hasta f16 de 3,9 GB), no el modelo original en safetensors. La licencia declarada es Apache 2.0 y los idiomas soportados son chino (zh) e ingles (en). No se dispone de informacion sobre la longitud de contexto, el dataset de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "non-autoregressive" y "decision-engine"; no se detalla la arquitectura subyacente) |
| Parametros totales | 1.881.825.088 (≈1,88 mil millones), segun los safetensors del modelo base |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio no incluye safetensors) |
| Modelo base | mkzero/Cerebellum-2B-BF16 |
| Tamano del repositorio | 18,1 GB |
| Fecha de publicacion | 2026-09-20 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Las etiquetas del repositorio ("non-autoregressive", "decision-engine", "agent", "tool-use", "function-calling", "rpa") apuntan a un diseno especializado en emitir decisiones estructuradas o llamadas a funciones, en lugar de un decoder transformer autorregresivo convencional. No se especifica si se trata de un transformer con cabezas de clasificacion, de un modelo de difusion discreta para texto, de un modelo de estado recurrente o de otra variante.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. El unico dato tecnico aportado por el repositorio de cuantizacion es que se trata de cuantizaciones estaticas ("static quants"), sin imatrix ni ponderacion por importancia, con conversion de tipo "hf" y tensor de salida cuantizado. No hay informacion sobre innovaciones adicionales como decodificacion especulativa, atencion lineal o ventanas deslizantes.

## Capacidades

- Seleccion de herramientas y function calling: el modelo esta etiquetado explicitamente para tool use y function calling, lo que indica que su salida esperada son llamadas estructuradas a APIs o funciones.
- Comportamiento de agente: las etiquetas "agent" y "non-autoregressive decision-engine" sugieren su uso como nucleo de decision dentro de un bucle de agente (decidir la siguiente accion a partir del estado actual).
- Automatizacion de procesos roboticos (RPA): orientado a decidir acciones sobre interfaces o flujos de trabajo automatizados.
- Multilingue limitado: solo chino e ingles declarados. No hay soporte declarado de castellano.
- Generacion de texto libre: no confirmada. Al ser un modelo no autorregresivo, no puede asumirse que genere texto coherente de forma abierta.
- Razonamiento multi-paso, matematica, codigo general, vision o audio: no disponible (no se declaran estas capacidades).
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Orquestacion de agentes con function calling: usar el modelo como componente de decision que, dado un estado de conversacion y un catalogo de funciones, emita la llamada correcta. Su tamano reducido permite ejecutarlo en el mismo host que el resto del pipeline sin coste relevante de GPU.
- Automatizacion RPA de back-office: integrado en un robot de escritorio o web para decidir la siguiente accion (rellenar un campo, pulsar un boton, esperar una respuesta) a partir del estado de la pantalla descrito en texto.
- Enrutado de intenciones en atencion al cliente: clasificar y derivar consultas a la herramienta o cola adecuada, en lugar de redactar la respuesta final, que quedaria delegada a otro modelo generativo de mayor tamano.
- Ejecucion de herramientas en pipelines de CI/CD: dado un conjunto de funciones expuestas (desplegar, revertir, consultar logs), el modelo selecciona y parametriza la accion en funcion del contexto del fallo.
- Prototipado local en portatiles y equipos sin GPU dedicada: las cuantizaciones Q4_K_S y Q4_K_M (1,3 y 1,4 GB) permiten probar el comportamiento del modelo en CPU con llama.cpp u Ollama antes de escalar a produccion.
- Evaluacion comparativa de arquitecturas no autorregresivas: util para investigadores que quieran medir si un enfoque de decision no secuencial mejora la latencia o la precision frente a un LLM autorregresivo pequeno en tareas de tool calling.
- Sistemas embebidos o edge con presupuesto de memoria estricto: el quant Q2_K (1,1 GB) permite desplegar el modelo en dispositivos con menos de 2 GB de RAM disponible para pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB y 4,5 GB, en funcion de la cuantizacion (Q2_K 1,1 GB; Q4_K_M 1,4 GB; Q6_K 1,7 GB; Q8_0 2,1 GB; f16 3,9 GB), mas el espacio de cache KV y el overhead del runtime, que no se puede calcular al desconocerse la longitud de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5. Se puede citar como referencia RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en todos los casos el modelo esta muy por debajo de su capacidad.
- GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPUs con memoria unificada.
- CPU: viable. Con cuantizaciones Q4 o Q5 el modelo ocupa menos de 1,5 GB de RAM, por lo que puede ejecutarse en CPU sin GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para este repositorio, ya que no incluye safetensors; para usarlos habria que partir del modelo base mkzero/Cerebellum-2B-BF16.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece con modelos ligeros de proposito general que tambien ofrecen soporte de tool calling y pueden ejecutarse en hardware de consumo. Los datos de las alternativas proceden de la documentacion publica de cada proyecto y no de la informacion proporcionada para Cerebellum.

| Modelo | Parametros | Contexto | Capacidad destacada | Licencia | Formato |
|---|---|---|---|---|---|
| Cerebellum-2B-BF16-GGUF | 1,88 B | no disponible | Decision / function calling no autorregresivo, zh+en | Apache 2.0 | GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (segun documentacion del proyecto) | Chat general, tool calling, multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (segun documentacion del proyecto) | Chat general e instrucciones, ingles | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B-it | 2 B | 8.192 tokens (segun documentacion del proyecto) | Chat general, multilingue | Licencia Gemma (con restricciones de uso) | safetensors, GGUF |

Diferencias clave: a diferencia de las alternativas, Cerebellum se posiciona como motor de decision y no como modelo conversacional de proposito general, y solo declara chino e ingles. Su licencia Apache 2.0 es mas permisiva que la de Gemma-2. El dato de contexto de Cerebellum no esta disponible, por lo que no puede compararse en ese eje.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado informacion sobre la composicion del dataset ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: relevante en cualquier modelo que emita llamadas a funciones, ya que puede inventar nombres de herramientas o parametros inexistentes. Es imprescindible validar la salida contra un esquema (JSON Schema, Pydantic, gramatica) antes de ejecutarla.
- Naturaleza no autorregresiva: no debe asumirse que el modelo sea capaz de mantener una conversacion abierta o de redactar texto largo y coherente. Su uso previsto es la decision estructurada.
- Idiomas: solo chino e ingles declarados. El rendimiento en castellano es desconocido y probablemente deficiente.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar prompts largos o conversaciones multi-turno extensas con garantias.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K degradan la calidad de forma notable; para uso en produccion se recomienda Q4_K_M o superior. El propio autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q6_K como "very good quality".
- Ausencia de imatrix: el autor indica que las cuantizaciones ponderadas por importancia no estan disponibles, lo que puede penalizar la calidad de las variantes de 2 a 4 bits frente a quants equivalentes generados con imatrix.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene verificar de forma independiente la licencia del modelo base, ya que la model card del repositorio de cuantizacion no incluye informacion sobre el entrenamiento original.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y su fecha de publicacion es muy reciente, por lo que no existe una comunidad que haya validado su comportamiento en produccion.
- Trazabilidad: al no existir resultados de evaluacion ni documentacion de entrenamiento, no es posible estimar su calidad frente a alternativas consolidadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cerebellum-2B-BF16-GGUF
- Modelo base: https://huggingface.co/mkzero/Cerebellum-2B-BF16
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#Cerebellum-2B-BF16-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
- Resultados de busqueda web: los enlaces devueltos por la busqueda (foro de un bot de dados para QQ, hilos de Zhihu sobre reparto de pantalla y sobre el estudio DICE) no guardan relacion con este modelo y se descartan como fuentes.
