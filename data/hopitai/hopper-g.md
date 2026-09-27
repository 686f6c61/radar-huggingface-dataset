# HopitAI/hopper-g

## Resumen

Hopper (G) es un adaptador LoRA desarrollado por HopitAI sobre el modelo base Qwen/Qwen3.5-4B (revision 851bf6e). No es un modelo generativo convencional: responde preguntas de decision tipadas en un unico forward pass, leyendo la probabilidad asignada a la letra de cada opcion, y aplica despues un mapa de calibracion especifico por tipo de pregunta. Se distribuye como adaptador PEFT de rango 16 y alpha 32 sobre 12 modulos, con un peso de repositorio de 0,1 GB.

Es la version de proposito general de la familia Hopper. El autor la describe como una continuacion del adaptador de Hopper 1.0, entrenada a dosis de mantenimiento sobre las tareas de decision originales y ampliada con fuentes de proposito general: uniones de registros tabulares, intenciones de CLINC150 y aritmetica de GSM8K, junto con replay de datos publicos de entrenamiento. Se impone una restriccion de retencion fija frente a Hopper 1.0 medida sobre un banco de replay reservado, de modo que la ampliacion de cobertura no degrade el comportamiento previo.

Su interes es acotado y muy concreto: sirve para clasificacion con opciones multiples, calibrada y barata en computo (una sola pasada, sin cadena de razonamiento), no para asistencia conversacional. La licencia es research-and-demo, limitada a investigacion y demostracion, con prohibicion explicita de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | 4B en el modelo base; recuento de parametros del adaptador no disponible (rango 16, alpha 32, 12 modulos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados por el autor; adaptador entregado en safetensors con r=16 y alpha=32 |
| Idiomas soportados | ingles (unico idioma declarado en las limitaciones) |
| Licencia | research-and-demo (license: other); uso comercial no permitido |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre 12 modulos de Qwen/Qwen3.5-4B, revision 851bf6e. No introduce un cabezal generativo nuevo ni un decodificador adicional: la inferencia consiste en un unico forward pass sobre la pregunta y sus opciones, del que se extrae la probabilidad relativa de la letra de cada opcion. Sobre esa probabilidad se aplica un mapa de calibracion por tipo de pregunta. Para menus con mas de 26 opciones, el sistema de serving responde en dos etapas divulgadas mediante un shortlist previo.

El entrenamiento parte del adaptador de Hopper 1.0 y continua con tres bloques de datos: tareas de decision propias de Hopper a dosis de mantenimiento, fuentes de proposito general (uniones de registros tabulares, intenciones CLINC150 y aritmetica de GSM8K) y replay de datos publicos de entrenamiento. Se aplica una restriccion de retencion fija frente a Hopper 1.0 evaluada sobre un banco de replay reservado. El autor indica que los datos de entrenamiento originales incluian pasajes de RACE (solo para investigacion no comercial) y material generado con LLM, motivo por el que la licencia restringe el uso comercial. No se documentan en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de decision tipadas en un solo forward pass, seleccionando entre opciones etiquetadas con letras.
- Clasificacion con calibracion por tipo de pregunta, apoyada en un mapa de calibracion heredado de Hopper 1.1.1.
- Manejo de menus largos: mas de 26 opciones resueltas en dos etapas mediante un shortlist divulgado.
- Clasificacion de intenciones: CLINC150 forma parte de las fuentes de entrenamiento declaradas.
- Decision sobre registros tabulares, incluidas operaciones de union (joins) entre tablas.
- Seleccion de respuesta aritmetica: GSM8K se uso como fuente de entrenamiento y aparece en la evaluacion reportada.
- Retencion de las tareas de decision de Hopper 1.0, verificada con una restriccion de retencion sobre banco de replay.
- No genera cadenas de razonamiento: lee opciones, no razona por escrito.
- Sin soporte declarado de tool calling, function calling, agentes, vision ni audio.
- Solo en ingles.

## Casos de uso

- Clasificacion de intenciones en asistentes: dado un turno de usuario y un conjunto cerrado de intenciones (estilo CLINC150), el adaptador devuelve la intencion mas probable en una sola pasada, lo que abarata el enrutado previo a un LLM generativo.
- Enrutado de tickets y colas de soporte: con un menu corto y fijo de categorias, se obtiene la etiqueta calibrada por tipo de consulta, util para priorizar y derivar sin invocar un modelo mayor.
- Decisiones sobre datos tabulares: operaciones de union y comparacion de registros que el adaptador aprendio como tarea de decision, aplicables a validacion de correspondencias entre tablas o deduplicacion asistida.
- Verificacion de respuestas aritmeticas: seleccion de la opcion correcta en problemas tipo GSM8K, util como componente de evaluacion o de filtrado en pipelines de generacion matematica.
- Menus de opciones extensos: en configuraciones con mas de 26 alternativas (catalogos, taxonomias, listas de productos), el shortlist en dos etapas permite resolver la eleccion sin evaluar todas las opciones de una vez.
- Investigacion sobre calibracion de adaptadores: el modelo permite medir como se comporta un mapa de calibracion fijado para unos pesos previos cuando se aplica a un adaptador reentrenado, un escenario poco documentado.
- Pruebas de retencion y olvido catastrofico: la restriccion de retencion frente a Hopper 1.0 lo convierte en un banco de pruebas controlado para estudiar continuacion de entrenamiento en adaptadores LoRA pequenos.
- Demostraciones y prototipos academicos: al ser una licencia research-and-demo, encaja en cuadernos de evaluacion y demos internas, no en servicios en produccion comercial.

## Benchmarks y rendimiento

Resultados reportados por el autor en su ejecucion local de Decision Index 0.2 (40 benchmarks, GPU A10G, mismo codigo de serving y distinto adaptador):

| Suite o tarea | Hopper 1.1.1 | Hopper (G) 1.2 | Notas |
|---|---:|---:|---|
| Decision Index 0.2, balanced raw | 52,74 | 53,50 | 40 benchmarks; no son puntuaciones oficiales |
| Decision Index 0.2, balanced skill | 37,10 | 38,07 | misma ejecucion |
| GSM8K | 0,318 | 0,480 | tarea aritmetica incluida en el entrenamiento |
| Diferencia balanced raw (bootstrap pareado) | — | +0,76 | intervalo del 95 %: +0,55 a +0,98 |
| Semilla 1 (entrenamiento independiente) | 52,74 | 53,44 (+0,70) | todas las areas del Index iguales o superiores a Hopper 1.1.1 |

El autor indica que Hopper (G) no esta ajustado para JevBench y no formula ninguna afirmacion sobre esa suite. No se han publicado otros resultados de benchmarks (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del modelo base de 4B, no publicada por el autor): en bf16/fp16 en torno a 8-9 GB contando overhead; en int8 en torno a 5-6 GB; en 4 bits en torno a 3-4 GB.
- El adaptador LoRA en si ocupa 0,1 GB de repositorio, por lo que su coste de memoria es despreciable frente al modelo base.
- GPU empleada por el autor en la evaluacion: A10G (24 GB).
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits en tarjetas de 8-12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En bf16 conviene disponer de 12-16 GB o mas.
- Opciones de despliegue: PEFT con transformers, vLLM con soporte de adaptadores LoRA, o fusion del adaptador con el modelo base y conversion posterior a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no hay cifras publicadas. El coste por consulta es el de un unico forward pass sobre pregunta y opciones, sin decodificacion autoregresiva, por lo que es estructuralmente inferior al de un modelo generativo del mismo tamano. Los menus con mas de 26 opciones requieren dos etapas y, por tanto, dos pasadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hopper (G) 1.2 | 4B (base) + LoRA r=16 | no disponible | balanced raw 53,50; balanced skill 38,07; GSM8K 0,480 | research-and-demo | HuggingFace, repo 0,1 GB |
| Hopper 1.1.1 | 4B (base) + LoRA | no disponible | balanced raw 52,74; balanced skill 37,10; GSM8K 0,318 | research-and-demo (no confirmado en la informacion disponible) | HuggingFace |
| Hopper 1.0 | 4B (base) + LoRA | no disponible | no disponible | research-and-demo (no confirmado en la informacion disponible) | HuggingFace |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace, revision 851bf6e |

Las alternativas comparables mas cercanas son las versiones anteriores del propio adaptador, ya que la tarea (decision tipada con calibracion) es especifica y no coincide con la de un LLM generativo generalista del mismo tamano. No se dispone de datos de otros adaptadores de decision comparables.

## Limitaciones y advertencias

- Solo ingles y 4B de parametros: el alcance linguistico y de conocimiento queda acotado por el modelo base.
- Lee opciones, no genera razonamiento. No sirve para tareas que requieran justificar o desarrollar una respuesta.
- El mapa de calibracion empleado es el de Hopper 1.1.1, ajustado originalmente para el adaptador de Hopper 1.0 y no reajustado para estos pesos. Las probabilidades calibradas pueden desviarse.
- Riesgo de error de clasificacion y de sobreconfianza en la opcion elegida; al no generar texto, el modo de fallo tipico no es la alucinacion textual sino la seleccion incorrecta con probabilidad alta.
- Los sesgos no estan documentados en la informacion disponible; al heredar el modelo base, arrastra los suyos.
- Restriccion de licencia: research-and-demo. El entrenamiento incluyo pasajes de RACE, de uso exclusivamente no comercial, y material generado con LLM. El uso comercial esta prohibido de forma explicita.
- Los menus de mas de 26 opciones exigen un shortlist en dos etapas, lo que anade una pasada adicional y una dependencia del codigo de serving.
- Los resultados de Decision Index 0.2 son ejecuciones locales del autor, no puntuaciones oficiales, y la comparacion se establece contra sus propias versiones previas.
- El modelo no esta ajustado para JevBench, segun declara el autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de terceros.
- La fecha de creacion del repositorio (2026-09-26) y la referencia al modelo base Qwen3.5-4B no permiten verificar la disponibilidad ni las caracteristicas de este ultimo con la documentacion aportada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HopitAI/hopper-g
- Adaptador Hopper (version 1.0): https://huggingface.co/HopitAI/hopper
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision 851bf6e)
- Codigo de serving: https://github.com/hopit-ai/hopper (etiqueta g-1.2.0)
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las busquedas realizadas devolvieron unicamente contenido no relacionado con IA ni con el modelo, por lo que no se incluye.
