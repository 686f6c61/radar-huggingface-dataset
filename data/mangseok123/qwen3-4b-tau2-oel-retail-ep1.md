# MANGSEOK123/qwen3-4b-tau2-oel-retail-ep1

## Resumen

qwen3-4b-tau2-oel-retail-ep1 es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123. Consiste en una epoca de Online Experiential Learning (OEL) sobre el dominio retail de tau2-bench, un benchmark de agentes conversacionales con llamadas a herramientas. El modelo tiene 4.411.424.256 parametros (aproximadamente 4,41 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con soporte declarado unicamente para ingles.

La relevancia de esta ficha es poco habitual: el propio autor publica el checkpoint como artefacto reproducible de un resultado negativo, no como un modelo mejorado. La model card indica explicitamente que "este checkpoint no mejora a su modelo base" y que las tres diferencias medidas en tau2-bench retail quedan por debajo de un error estandar (SE aproximado de 0,064 a 0,078 con 40 tareas), por lo que son indistinguibles del ruido. El valor del modelo es, por tanto, metodologico: documenta una tecnica de autodestilacion (self-distillation) sin senal de recompensa y su incapacidad de superar a la base en este dominio.

El metodo OEL empleado no es aprendizaje por refuerzo. Profesor y alumno comparten pesos; la unica diferencia es que al profesor se le anade en el system prompt la memoria de cada tarea. El alumno se ajusta a la distribucion del profesor con una perdida KL completa a nivel de token, con el objetivo de que el comportamiento sobreviva sin la memoria en el prompt en el momento de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada de Qwen3-4B-Instruct-2507 (no se detalla en la model card) |
| Parametros totales | 4.411.424.256 (~4,41 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repositorio safetensors ocupa 8,8 GB, coherente con precision de 16 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dominio de ajuste | tau2-bench, dominio retail |
| Tarea | Agente conversacional con tool calling |
| Tamano del repositorio | 8,8 GB |
| Version del tokenizador | no disponible (se hereda del modelo base) |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4,41 B de parametros. La model card no documenta cambios estructurales: el ajuste es puramente de pesos mediante autodestilacion sobre trayectorias de agente. El pipeline descrito por el autor tiene tres fases: despliegue (deploy), en el que el alumno resuelve cada tarea sin memoria y se registran todos los turnos del agente; consolidacion (consolidate), en la que las mismas trayectorias se re-puntuan con la memoria de cada tarea inyectada en el system prompt (el profesor) y el alumno sin memoria se ajusta a esa distribucion; y fusion (merge), que convierte los fragmentos de FSDP en pesos de HuggingFace.

Los detalles de entrenamiento son los siguientes: 104 pares (memoria, tarea sintetizada), tamano de lote 8 repartido en 4 GPU, 13 pasos (una epoca, con el ultimo lote de 8), tasa de aprendizaje 3e-6, perdida KL completa sobre todos los tokens de respuesta y recorte de gradiente (grad clip) de 1,0. El simulador de usuario empleado en la generacion de trayectorias fue gpt-4.1-mini. Solo se guarda el paso final. El autor senala que las normas de gradiente oscilaron entre 0,6 y 14,7 frente a un recorte de 1,0, de modo que el tamano de paso efectivo lo determino el recorte y no la tasa de aprendizaje. La entropia del ultimo paso fue de 0,329, dentro del rango que los autores del metodo consideran saludable, pero eso no se tradujo en mejor rendimiento de tarea, lo que sugiere que la entropia del ultimo paso es un proxy debil de la calidad del checkpoint.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base.
- Llamada a herramientas (tool calling) en formato hermes; el autor indica que el servicio para la evaluacion de tau2 requiere `--enable-auto-tool-choice --tool-call-parser hermes` en vLLM.
- Ejecucion de tareas de agente multi-turno en el dominio retail de tau2-bench (devoluciones, cambios, consultas de pedidos y similares, segun la taxonomia del benchmark).
- Razonamiento de varios pasos dentro de una conversacion con un simulador de usuario.
- Capacidades multilingues: no disponible; el modelo declara unicamente ingles, aunque el modelo base Qwen3 es multilingue y podria conservar parte de esa capacidad sin garantia documentada.
- Modo de pensamiento explicito (thinking): no disponible en la model card.
- Vision o audio: no disponible; el modelo base es solo de texto.
- No se documenta ninguna capacidad nueva anadida por el ajuste. Las capacidades declaradas son las del modelo base, con la unica diferencia del ajuste de comportamiento sobre trayectorias de tau2-bench retail.

## Casos de uso

- Reproduccion de un resultado negativo en investigacion sobre agentes: el checkpoint permite replicar el experimento de OEL sobre tau2-bench retail y verificar que la autodestilacion sin recompensa no supera a la base en este dominio. Es el uso principal declarado por el autor.
- Linea base de control en ablaciones de memoria en el prompt: dado que el modelo fue entrenado contra memorias que nunca llegan al prompt de test, sirve para medir cuanto del beneficio de inyectar memoria en tiempo de inferencia se recupera realmente mediante destilacion.
- Estudio metodologico de destilacion KL a nivel de token: con perdida `full` sobre todos los tokens de respuesta y una tasa de aprendizaje de 3e-6, es un punto de partida reproducible para comparar variantes de la perdida o del esquema de consolidacion.
- Ensayo de infraestructura de evaluacion de agentes: el modelo esta pensado para ejecutarse con el CLI `tau2 run` y con vLLM configurado con el parser hermes, por lo que resulta util para validar un pipeline de evaluacion de agentes de principio a fin.
- Prototipado de agentes de atencion al cliente en comercio minorista: al estar ajustado en el dominio retail de tau2-bench, sirve para experimentos internos de dialogo con herramientas, siempre que no se espere una mejora medible frente a Qwen3-4B-Instruct-2507.
- Analisis del efecto del recorte de gradiente: las normas de gradiente registradas (0,6 a 14,7 frente a un recorte de 1,0) convierten este checkpoint en un caso de estudio sobre como el recorte domina el paso efectivo en ajustes con pocos pasos.
- Material didactico sobre OEL y autodestilacion: la model card incluye el pipeline completo, los hiperparametros y las metricas, lo que lo hace adecuado como ejemplo en cursos o talleres de ajuste de agentes.
- Comparacion de proxies de calidad de checkpoint: la discrepancia entre una entropia final de 0,329 y la ausencia de mejora en tarea permite ilustrar los limites de la entropia como indicador.

## Benchmarks y rendimiento

Evaluacion realizada con el CLI propio de tau2-bench (`tau2 run`), particion retail de test, 40 tareas x 3 intentos, agente con decodificacion voraz y sin memoria en el prompt. Conviene subrayar que la memoria contra la que se entreno el modelo nunca llega al prompt de evaluacion.

| Metrica | Base (Qwen3-4B-Instruct-2507) | Este modelo | Diferencia |
|---|---|---|---|
| avg@3 | 0,400 | 0,392 | -0,008 |
| pass@3 | 0,575 | 0,550 | -0,025 |
| pass^3 | 0,275 | 0,225 | -0,050 |

Segun el autor, las tres diferencias estan por debajo de un error estandar (SE aproximadamente 0,064-0,078 con 40 tareas), por lo que son indistinguibles del ruido y no constituyen una regresion demostrada. No hay evidencia de mejora. El autor contextualiza el resultado: en aproximadamente veinte ejecuciones sobre tres dominios, varias fuentes de memoria, 1-2 epocas y tasas de aprendizaje entre 1e-6 y 1e-5, ninguna configuracion supero a su modelo base por mas de 1,5 SE. Inyectar esas mismas memorias en el prompt durante el test si ayudo de forma clara, lo que indica que las memorias contienen senal, pero el paso de destilacion solo recupera una parte.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: los pesos ocupan aproximadamente 8,8 GB (coincide con el tamano del repositorio), a los que hay que sumar cache KV y activaciones; en la practica, entre 11 y 14 GB para contextos moderados.
- GPU recomendadas para 16 bits: A100 (40 o 80 GB), H100 (80 GB), L40S (48 GB), RTX 4090 (24 GB), RTX 3090 (24 GB). Todas ellas con margen suficiente.
- Cabe en GPU de consumo: si. Una RTX 4090 o RTX 3090 de 24 GB lo ejecuta con holgura en 16 bits. En tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) es viable con cuantizacion de 4 bits (aproximadamente 2,5-3 GB de pesos), aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: vLLM es la ruta documentada por el autor, con `vllm serve MANGSEOK123/qwen3-4b-tau2-oel-retail-ep1 --enable-auto-tool-choice --tool-call-parser hermes`; tambien es cargable con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`. TGI y llama.cpp/Ollama serian teoricamente posibles, pero requieren conversion propia, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por turno.
- Nota de despliegue: el parser de tool calling hermes es un requisito funcional para reproducir la evaluacion, no una recomendacion opcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | tau2-bench retail (avg@3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-oel-retail-ep1 | 4,41 B | no disponible | 0,392 (pass@3 0,550) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B | no disponible en esta informacion | 0,400 (pass@3 0,575) | Apache 2.0 | HuggingFace |
| Otros derivados de Qwen3-4B ajustados para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos es contra el propio modelo base, y el resultado es que el ajuste no aporta mejora medible. No se dispone de informacion en la busqueda realizada sobre alternativas comparables en el mismo dominio (retail de tau2-bench). Los resultados de la busqueda web no aportaron datos tecnicos relevantes.

## Limitaciones y advertencias

- No mejora a su modelo base: el autor lo declara explicitamente. Las diferencias en avg@3, pass@3 y pass^3 estan dentro de un error estandar. No debe presentarse como una mejora.
- Artefacto de investigacion: se publica como resultado negativo reproducible, no como modelo listo para produccion. Descargas y likes registrados en el momento de la consulta: 0 y 0.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad, fidelidad factual ni tasas de alucinacion. Es un riesgo no cuantificado, igual que en el modelo base.
- Sesgos conocidos: no disponible. No se realiza ninguna evaluacion de sesgo, toxicidad ni equidad en la model card.
- Idiomas: el modelo declara unicamente ingles. El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse a partir del modelo base.
- Longitud de contexto: no disponible en la informacion proporcionada; condiciona directamente los casos de uso con conversaciones largas.
- Detalles de inferencia no documentados: no se especifica plantilla de chat, configuracion de muestreo recomendada ni tratamiento de la memoria en el prompt en produccion.
- Dependencia de un parser concreto: la evaluacion original exige el parser hermes de vLLM. Con otros parsers de tool calling el comportamiento puede degradarse sin que existan mediciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3-4B-Instruct-2507 conviene revisar tambien las condiciones del modelo base y de sus componentes.
- Estabilidad del ajuste: las normas de gradiente (0,6-14,7) frente a un recorte de 1,0 y el hecho de guardar solo el paso final implican que el checkpoint es sensible a la configuracion exacta del entrenamiento.
- Sin cuantizaciones oficiales: cualquier version GGUF, AWQ o GPTQ seria una conversion de terceros no validada por el autor.
- Fecha de publicacion futura respecto a la informacion habitual de referencia: 22 de septiembre de 2026, dato tal cual aparece en la ficha de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Benchmark tau2-bench: no disponible como enlace en la informacion proporcionada (se menciona en la model card como origen de los datos y del CLI `tau2 run`)
- Paper del metodo OEL: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Demo: no disponible
- Resultados de la busqueda web: no aportaron enlaces relevantes; todas las entradas devueltas correspondian a paginas de OpenAI sin relacion con este modelo
