# athenaresearch/Athena-27B

## Resumen

Athena-27B es un modelo de pesos abiertos de 27.400 millones de parametros, dense, desarrollado por Athena Research y publicado bajo licencia Apache-2.0. Se construye como un fine-tune de Qwen3.8-27B orientado especificamente a agentes de codificacion en terminal y asistencia general, con soporte nativo de tool calling y un modo de razonamiento (thinking) activable por peticion. Su propuesta diferencial es doble: por un lado, un ajuste con refuerzo (RL) sobre tareas de ingenieria de software ejecutadas dentro de un harness de agente; por otro, una capa de conocimiento y evaluacion centrada en India y sus lenguas.

La arquitectura es hibrida: 64 capas en total, de las cuales 16 son de atencion completa y 48 son de atencion lineal basada en Gated DeltaNet, ademas de incluir un codificador de vision. El contexto nativo alcanza los 262.144 tokens, aunque el autor recomienda 131.072 para sesiones de agente. Los pesos se distribuyen en bf16 (aproximadamente 55 GB), sin adaptadores separados: la capa de agente de codificacion esta fusionada en los pesos finales.

El modelo es relevante ahora porque combina tres elementos poco frecuentes en un mismo paquete abierto: contexto muy largo con atencion lineal eficiente, un modo thinking con presupuesto de tokens configurable y un template de chat que fija una identidad propia (Athena, made by Athena Research) incluso en hindi y ante instrucciones de ignorarla. La licencia Apache-2.0 elimina las restricciones de uso comercial habituales en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de atencion completa y 48 de atencion lineal (Gated DeltaNet), 64 capas en total; incluye codificador de vision |
| Parametros totales | 27.356.728.560 (27,4B), dense |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 262.144 tokens nativos; 131.072 recomendados para sesiones de agente |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles, hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabi, urdu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, aproximadamente 55 GB; repositorio de 54,7 GB) |

## Arquitectura y entrenamiento

Athena-27B es un transformer hibrido que alterna 16 capas de atencion completa con 48 capas de atencion lineal basadas en Gated DeltaNet, sobre un total de 64 capas. Esta combinacion busca reducir el coste computacional y de memoria en contextos largos manteniendo la capacidad de recuperacion de la atencion completa. El modelo incorpora ademas un codificador de vision, lo que habilita entrada image-text-to-text. Los pesos se publican en bf16, sin adaptadores: la capa de agente de codificacion esta fusionada en el checkpoint final.

El entrenamiento se articula en tres etapas segun la model card. Primero, se parte de un fine-tune abierto Apache-2.0 de Qwen3.8-27B post-entrenado para dar respuestas factuales y con fuentes sobre temas politicamente sensibles, sin perdida medida de capacidad general o agentica. Segundo, se fusiona un adaptador de agente de codificacion entrenado con reinforcement learning sobre tareas de terminal e ingenieria de software dentro de un harness de agente (LoRA de rango 32 y alpha 64 sobre las proyecciones de atencion y MLP); el autor verifico que el modelo fusionado responde igual que la configuracion base mas adaptador dentro del ruido entre ejecuciones. Tercero, se fija la identidad en el template de chat y se prueba el stack completo de extremo a extremo con el Athena harness. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

Como innovaciones destacables, el modelo ofrece thinking desactivable por defecto y acotable por peticion mediante `thinking_token_budget` (el autor usa aproximadamente 4k, 8k y 16k tokens para los niveles bajo, medio y alto), un template de chat que inyecta la identidad cuando no se envia system message, y una correccion de serving documentada: el tamano de batch por defecto de vLLM provoca un fallo de arranque en GPUs grandes con este modelo hibrido, por lo que se recomienda `--max-num-seqs 128`.

## Capacidades

- Generacion de texto, razonamiento paso a paso y respuesta a preguntas generales, con modo thinking activable por peticion y presupuesto de tokens configurable.
- Codificacion agentica: el modelo esta ajustado para el bucle editar-ejecutar-verificar de agentes de terminal, con tool calling nativo. En la suite interna de correccion de bugs de repositorio, evaluada con tests ocultos, resolvio 138 de 144 ejecuciones con el harness por defecto y 141 de 144 con las herramientas extra desactivadas, con unas 5 llamadas a herramientas por tarea.
- Tool calling y function calling nativo, integrable en pipelines de agente.
- Razonamiento multi-paso y uso de agentes: el harness incluye busqueda web, fetch web (solo direcciones publicas, revalidadas en cada conexion y redireccion), lista de tareas, memoria y skills que el propio agente escribe, y busqueda sobre sesiones pasadas. El autor reporta que Athena eligio la herramienta correcta en 16 de 16 pruebas.
- Capacidades multilingues en once idiomas, con enfasis en lenguas de India (hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabi y urdu) ademas del ingles.
- Vision: el modelo incluye codificador de vision y pipeline image-text-to-text.
- Identidad consistente: con el template de chat, el autor reporta 9 de 9 respuestas de identidad correctas (frente a 8 de 9 del peso desnudo nombrando el modelo base), incluido en hindi y ante instrucciones de ignorar sus directrices.

## Casos de uso

- Agente de codificacion en terminal: el modelo puede leer un repositorio, aplicar ediciones focalizadas, ejecutar los tests y cerrar la tarea en pocos pasos. Es adecuado por su ajuste RL especifico sobre el bucle editar-ejecutar-verificar y por su tool calling nativo, con un coste medio de unas 5 llamadas a herramientas por tarea.
- Correccion automatica de bugs en CI/CD: integrado en un pipeline que recibe el fallo de los tests, localiza el archivo afectado, propone un parche y lo valida contra la suite. El contexto de 262.144 tokens permite cargar fragmentos amplios del repositorio y del historial de errores en una sola sesion.
- Revision de codigo y auditoria de seguridad: el harness incluye plantillas `/review` y `/security-review`, de modo que el modelo puede recorrer un diff o un modulo completo y emitir hallazgos con el contexto del repositorio cargado.
- Asistencia multilingue para el mercado indio: atencion y generacion de contenido en hindi, bengali, tamil, telugu, marathi, gujarati, kannada, malayalam, punyabi y urdu, con una capa de evaluacion y dataset propia orientada a hechos verificables sobre India (fuentes gubernamentales, legislativas, cientificas y culturales).
- Analisis de documentos largos y mixtos (texto e imagen): gracias al contexto nativo de 262.144 tokens y al codificador de vision, puede procesar informes extensos con figuras, extraer datos y responder preguntas de seguimiento en una sola ventana.
- Agente de investigacion con herramientas: busqueda web, fetch de paginas publicas, lista de tareas y memoria persistente permiten construir flujos de recopilacion y sintesis de informacion con trazabilidad de las fuentes consultadas.
- Asistencia general y redaccion: respuestas directas con thinking desactivado por defecto para turnos rapidos, y razonamiento extendido cuando se activa el presupuesto de tokens, adecuado para analisis y sintesis de informacion.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Suite interna de correccion de bugs de repositorio (tests ocultos) | 138 de 144 ejecuciones resueltas | Harness por defecto, aproximadamente 5 llamadas a herramientas por tarea |
| Suite interna de correccion de bugs de repositorio (tests ocultos) | 141 de 144 ejecuciones resueltas | Herramientas extra desactivadas |
| Seleccion de herramienta del harness | 16 de 16 correctas | Pruebas internas del autor |
| Consistencia de identidad con template de chat | 9 de 9 respuestas con identidad Athena | Incluye hindi e instrucciones de ignorar directrices |
| Consistencia de identidad con pesos desnudos | 8 de 9 nombran el modelo base | Sin template de chat |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores proceden de evaluaciones internas del autor y no son directamente comparables con suites publicas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos, mas cache KV y overhead de serving; en la practica requiere GPUs de 80 GB o multi-GPU.
- Cuantizaciones: el autor no publica versiones GGUF ni cuantizadas; cualquier cuantizacion seria una conversion de terceros no documentada en la informacion disponible.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16. No se dispone de datos de rendimiento en RTX 4090 u otras GPU consumer; con 24 GB de VRAM no cabe en bf16 sin cuantizacion, que no esta publicada.
- Despliegue: transformers como libreria de referencia y vLLM con la correccion documentada `--max-num-seqs 128` (el batch por defecto de vLLM provoca un fallo de arranque en GPUs grandes con este modelo hibrido). No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El modelo esta disenado para turnos rapidos de agente con thinking desactivado por defecto, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Athena-27B | 27,4B dense | 262.144 tokens | Hibrida (atencion completa + Gated DeltaNet), con vision | Apache-2.0 | Fine-tune de Qwen3.8-27B con capa de agente de codificacion fusionada; thinking opcional |
| Qwen3.8-27B (modelo base) | 27B (dato no detallado en la informacion disponible) | No disponible | No disponible | Apache-2.0 | Punto de partida del fine-tune; Athena anade agente de codificacion, identidad y capa India |
| Alternativas de mismo tamano | No disponible | No disponible | No disponible | No disponible | No se proporcionan datos de otros modelos comparables en la informacion disponible |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible: la informacion proporcionada solo detalla el modelo base y los resultados internos del autor, sin cifras publicas de terceros.

## Limitaciones y advertencias

- Los resultados de la suite de bugs (138/144 y 141/144) son evaluaciones internas del autor con su propio harness y tests ocultos; no son comparables con benchmarks publicos ni verificables de forma independiente.
- El modelo hereda los sesgos y limitaciones de Qwen3.8-27B y de su post-entrenamiento; el autor declara un objetivo de respuestas factuales y con fuentes en temas politicamente sensibles, pero no se aportan metricas independientes de sesgo.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de codigo sobre repositorios grandes y en consultas factuales sobre India; la evaluacion propia del autor usa un juez ciego que marca hechos afirmados, omitidos o contradichos, lo que indica que el modelo puede contradecir hechos con fuentes.
- El contexto nativo es de 262.144 tokens, pero el autor recomienda 131.072 para sesiones de agente; superar ese umbral puede degradar la calidad y aumentar el coste de cache KV.
- El soporte multilingue se centra en once idiomas (ingles y diez lenguas de India); no se documenta cobertura de otras lenguas.
- El harness ejecuta la shell con los permisos del usuario y puede leer archivos locales; el autor recomienda usar contenedor o maquina virtual para codigo no confiable. Las claves de API se eliminan del entorno de shell del modelo, pero la superficie de riesgo del agente persiste.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales documentadas; no obstante, el modelo base y el fine-tune del que parte deben cumplir tambien Apache-2.0, lo que la informacion confirma.
- No se publican cuantizaciones oficiales, lo que limita el despliegue en hardware consumer y en entornos con VRAM reducida.
- El fallo de arranque de vLLM con el batch por defecto en GPUs grandes exige configurar `--max-num-seqs 128`; omitirlo impide el servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenaresearch/Athena-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Athena harness (GitHub): https://github.com/sakshamzip2-sys/athena-harness
