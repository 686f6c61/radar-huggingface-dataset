# ShreyashPoddar/llm-firewall-deberta-v3-small

## Resumen

llm-firewall-deberta-v3-small es un clasificador binario de texto especializado en detectar intentos de prompt injection, incluida la inyección indirecta incrustada en documentos que un agente lee (correos, páginas web, resultados de herramientas). Lo desarrolla ShreyashPoddar como fine-tune de microsoft/deberta-v3-small, un encoder de 141.896.450 parámetros, y se publica con licencia MIT. El modelo no genera texto: devuelve una probabilidad de inyección (etiqueta 1 = inyección) para una entrada de hasta 256 tokens.

Su relevancia actual viene del auge de agentes que consumen contenido externo no confiable. El autor reporta una F1 de 0,88 en inyección indirecta sobre correos del conjunto LLMail, frente a 0,57 del modelo guard abierto estándar que usa como referencia, con evaluación con fuentes reservadas (source-held-out). Es, en palabras del propio autor, "una capa defensiva, no una garantía".

Se trata de un modelo muy pequeño (unos 284 MB en fp16 y 568 MB en fp32), pensado para ejecutarse como filtro previo de bajo coste delante de un LLM mayor. El repositorio incluye pesos en safetensors y en ONNX, lo que facilita su despliegue en CPU dentro de pasarelas de LLM y pipelines de agentes sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en microsoft/deberta-v3-small (atencion desacoplada, preentrenamiento estilo ELECTRA con deteccion de tokens reemplazados); el autor lo etiqueta como deberta-v2 en los tags del repositorio |
| Parametros totales | 141.896.450 (unos 142 M), segun el index de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de entrada, maximo declarado en la model card |
| Tipos de cuantizacion | no disponible; el repositorio incluye pesos safetensors y ONNX, pero no se declaran variantes GGUF, AWQ, GPTQ ni cuantizaciones INT8/INT4 con nombre propio |
| Idiomas soportados | no disponible; la model card no especifica idiomas y los corpus de entrenamiento citados (deepset, SPML, jackhhao) son mayoritariamente en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX (tamano total del repositorio: 1,3 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de clasificacion sobre microsoft/deberta-v3-small. DeBERTa-v3 es un encoder tipo transformer con atencion desacoplada (representa el contenido y la posicion de cada token en vectores separados) y un objetivo de preentrenamiento estilo ELECTRA basado en deteccion de tokens reemplazados, lo que le permite obtener buenos resultados con un presupuesto de parametros reducido. Sobre esa base, la cabeza de clasificacion produce una probabilidad de inyeccion (etiqueta 1 = inyeccion, etiqueta 0 = entrada benigna) para secuencias de hasta 256 tokens.

Segun la model card, el fine-tune se entrena con datos publicos de deepset, SPML y jackhhao, y se evalua con las fuentes reservadas (source-held-out), es decir, sin mezclar en la evaluacion el mismo origen que en el entrenamiento. No se publican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, los hiperparametros ni si se aplicaron tecnicas de alineamiento como RLHF o DPO (no aplicables de forma habitual en un clasificador de este tipo). El autor declara como innovacion relevante la cobertura de inyeccion indirecta, el caso en el que la instruccion maliciosa llega oculta dentro de un documento que el agente lee, y no solo en el turno directo del usuario.

## Capacidades

- Clasificacion binaria de prompt injection: devuelve la probabilidad de que una entrada sea un intento de inyeccion (label 1 = injection).
- Deteccion de inyeccion indirecta: segun el autor, cubre instrucciones maliciosas ocultas en documentos que un agente procesa, con evaluacion especifica sobre correos del conjunto LLMail.
- Entrada de hasta 256 tokens por invocacion, adecuada para fragmentos de documento, turnos de conversacion o resultados de herramientas.
- Inferencia en CPU y GPU gracias a la exportacion ONNX incluida en el repositorio.
- Integracion como capa de guardrail: al ser un clasificador, se puede encadenar antes o despues de cualquier LLM generativo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni modo de pensamiento; no es un modelo de proposito general.
- Soporte multilingue: no disponible (no declarado).

## Casos de uso

- Filtrado de fragmentos en pipelines RAG: antes de insertar cada fragmento recuperado en el prompt del LLM, se pasa por el clasificador y se descartan o marcan los que superen el umbral de probabilidad de inyeccion. Es el escenario para el que el modelo fue disenado, dado que cubre inyeccion indirecta.
- Proteccion de asistentes de correo: el modelo se evalua sobre LLMail, de modo que encaja como filtro de correos entrantes que un agente va a resumir o sobre los que va a actuar.
- Guardrail previo a la ejecucion de herramientas: cuando un agente recibe el resultado de una API o de una busqueda web, ese contenido se clasifica antes de permitir una llamada a funcion potencialmente peligrosa (envio de datos, escritura en disco, ejecucion de comandos).
- Pasarela de LLM (proxy tipo LiteLLM o gateway interno): al ser un modelo de 142 M exportable a ONNX, puede correr en CPU y anadir una comprobacion de seguridad de bajo coste y baja latencia a todas las peticiones que atraviesan la pasarela.
- Moderacion de entradas de usuario en aplicaciones web: formularios, chat publico o comentarios se puntuan antes de llegar al modelo generativo, descartando instrucciones que intenten sobrescribir el system prompt.
- Red teaming y evaluacion offline: puntuar un corpus de prompts adversarios para medir la tasa de deteccion antes y despues de cambiar el system prompt o las defensas de una aplicacion.
- Defensa en profundidad: combinado con reglas deterministicas, delimitadores de contenido y listas de permitidos, aporta una senal estadistica adicional para decisiones de bloqueo o de revision humana.
- Auditoria y trazabilidad: registrar la probabilidad devuelta por el modelo en cada peticion permite justificar decisiones de bloqueo ante equipos de seguridad o de cumplimiento.

## Benchmarks y rendimiento

El unico resultado publicado en la informacion disponible es la F1 sobre inyeccion indirecta en correos (LLMail). No hay resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, puesto que el modelo es un clasificador y no un LLM.

| Evaluacion | Metrica | llm-firewall-deberta-v3-small | Modelo guard abierto estandar |
|---|---|---|---|
| Inyeccion indirecta en correos (LLMail) | F1 | 0,88 | 0,57 |

El autor no identifica por nombre el "modelo guard abierto estandar" usado como referencia, y la evaluacion es source-held-out. No se han publicado en la informacion disponible resultados adicionales (precision, recall, AUC, latencia) ni comparativas con otros detectores.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 568 MB en fp32, 284 MB en fp16/bf16 e inferior a 150 MB en INT8 (estimacion a partir de los 141,9 M de parametros; no hay cifras oficiales publicadas).
- Cabe sin problema en cualquier GPU de consumo: una GTX 1060 de 6 GB, una RTX 3060, una RTX 4090 o incluso una GPU integrada son suficientes. Con 256 tokens de entrada, el coste de activaciones es minimo.
- Inferencia en CPU perfectamente viable, especialmente con la version ONNX del repositorio, lo que permite desplegarlo junto a la pasarela de LLM sin consumir GPU.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime u Optimum para la variante ONNX, y servidores de inferencia genericos como Hugging Face Inference Endpoints. No se incluyen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin una conversion previa. vLLM o TGI no aportan ventaja para un encoder de este tamano y no se documentan como soportados.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 en inyeccion indirecta (LLMail) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShreyashPoddar/llm-firewall-deberta-v3-small | 141,9 M | 256 tokens | 0,88 | MIT | Hugging Face (safetensors, ONNX) |
| microsoft/deberta-v3-small | no disponible en la informacion proporcionada | no disponible | no aplica (modelo base, no es detector) | MIT | Hugging Face |
| Modelo guard abierto "estandar" citado por el autor | no disponible | no disponible | 0,57 | no disponible | no disponible |
| Otros detectores de prompt injection de la familia DeBERTa (por ejemplo, los publicados por ProtectAI) y guard models de Meta (Prompt Guard) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face |

La model card no ofrece una comparativa numerica con alternativas identificadas por nombre, mas alla de la referencia anonima con F1 0,57. Cualquier comparacion adicional requeriria reproducir la evaluacion sobre LLMail con los mismos criterios, algo que no se ha publicado.

## Limitaciones y advertencias

- El propio autor advierte de que es "una capa defensiva, no una garantia": un clasificador de este tipo puede tener falsos negativos, especialmente ante ataques redactados de forma novedosa.
- Ventana de 256 tokens: los documentos largos hay que trocearlos, lo que fragmenta la inyeccion y puede degradar la deteccion si el ataque esta repartido entre fragmentos.
- La inyeccion indirecta puede quedar oculta en contenido codificado, ofuscado o multimodal (imagenes dentro de un PDF), fuera del alcance de un clasificador de texto plano.
- Riesgo de falsos positivos en contenido legitimo que hable sobre seguridad, incluya instrucciones imperativas o cite ejemplos de ataques; en produccion conviene calibrar el umbral y prever una ruta de revision humana.
- Idiomas soportados no declarados. Los corpus de entrenamiento citados son mayoritariamente en ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado ni medido.
- No se publican detalles de entrenamiento (numero de tokens, mezcla de datos, hiperparametros, umbral recomendado) ni metricas de precision y recall, solo la F1 agregada.
- Inconsistencia en el etiquetado del repositorio: los tags indican deberta-v2 mientras que el modelo base declarado es microsoft/deberta-v3-small. Conviene verificar la arquitectura real antes de integrarlo.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validacion independiente de terceros.
- Licencia MIT: permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de copyright y la licencia. No se declaran restricciones adicionales, pero tampoco se ofrece ninguna garantia por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShreyashPoddar/llm-firewall-deberta-v3-small
- Repositorio con la evaluacion completa, graficas y limitaciones: https://github.com/ShreyashPoddar/llm-firewall
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
