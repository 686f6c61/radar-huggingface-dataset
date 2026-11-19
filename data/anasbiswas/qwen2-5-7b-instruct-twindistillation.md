# anasbiswas/Qwen2.5-7B-Instruct-TwinDistillation

## Resumen

Qwen2.5-7B-Instruct-TwinDistillation es un adaptador LoRA de rango 16 sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por Md Anas Biswas (anasbiswas) y entrenado con la receta de "twin distillation" descrita en el articulo *Twin Distillation Against Indirect Prompt Injection: Training Language Models to Distinguish User Instructions from Injected Instructions* (2026). El objetivo no es mejorar las capacidades generales del modelo, sino endurecerlo frente a ataques de inyeccion indirecta de prompts: el adaptador ensena al modelo a juzgar una instruccion por su procedencia (turno del usuario frente a texto embebido en un documento) y no por su contenido literal.

El modelo conserva los pesos base, la plantilla de chat y el tokenizador de Qwen2.5-7B-Instruct; unicamente anade un adaptador pequeno (repo de 0,2 GB) que modifica el comportamiento ante instrucciones hostiles incrustadas en documentos que el modelo debe procesar (resumir, contar, extraer, traducir o editar). Es relevante ahora porque la inyeccion indirecta de prompts es uno de los vectores de ataque mas dificiles de mitigar en pipelines RAG y agentes, y este adaptador reporta reducciones sustanciales de la tasa de seguimiento de inyecciones en los benchmarks BIPIA y en tareas de SecFid y AgentDojo.

La propuesta es deliberadamente acotada: el autor advierte que la defensa esta ligada al formato de prompt con el que se entreno (un unico turno de usuario con frase de tarea, linea en blanco y documento) y que un atacante con acceso a los pesos (ataque GCG de caja blanca) sigue rompiendo el adaptador en el 76 % de 25 documentos. Se distribuye bajo licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA de rango 16 |
| Parametros totales | 7B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | El paper usa el base en 4 bits; el autor indica que bfloat16 es valido para uso. Otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parametros, mediante LoRA de rango 16. El entrenamiento se organiza en cuatro fases sobre un unico adaptador: (1) twin distillation, una perdida de destilacion on-policy sobre prompts atacados, cada uno emparejado con un "gemelo" en el que la misma instruccion procede del usuario; (2) una fase literal; (3) fases de procesamiento y de tarea, donde la fase endurecida utiliza formulaciones de ataque escritas por el reescritor adaptativo del paper; y (4) una fase de turnos falsificados. La receta completa, los datos y los hiperparametros se documentan en la Seccion 5 y la Tabla 3 del paper, con codigo en el repositorio del autor (notebook 73f y directorio `src/`).

La innovacion tecnica central es el par gemelo: el modelo aprende a producir la misma respuesta ante una instruccion legitima del usuario y ante una instruccion identica incrustada en un documento, pero ignorando esta ultima. El entrenamiento y la evaluacion se realizan en un unico turno de usuario con la plantilla: frase de tarea, linea en blanco y documento, acompanado del system prompt `You are a helpful assistant that processes the content users give you.` No se documentan en la informacion disponible detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y procesamiento de documentos: resumen, conteo, extraccion, listado, edicion y traduccion del contenido proporcionado por el usuario.
- Defensa frente a inyeccion indirecta de prompts: ignora instrucciones embebidas en el documento, incluidas las disfrazadas de turno falso de usuario, falso fin de tarea o reclamacion de autoridad.
- Preservacion del texto del documento: una frase con forma de instruccion se arrastra como cualquier otra frase al copiar, contar, listar, editar o traducir, sin obedecerse ni eliminarse.
- Evaluado en el marco de resumen (frase de tarea sobre documento), en las tareas de conteo, extraccion, traduccion y edicion de SecFid, y en salidas de herramientas de AgentDojo leidas como texto.
- Capacidades generales heredadas de Qwen2.5-7B-Instruct (razonamiento, codigo, matematicas, tool calling, multilingue) no se documentan ni se evaluan en la informacion proporcionada; el adaptador no las modifica por diseno.
- Idioma: ingles.

## Casos de uso

- Resumen de documentos no confiables: en pipelines RAG o de analisis documental donde el texto proviene de fuentes externas, el adaptador reduce el riesgo de que una frase maliciosa dentro del documento secuestre la respuesta del modelo.
- Procesamiento de correos y tickets de soporte: al resumir o extraer datos de mensajes de terceros, el modelo mantiene la tarea solicitada por el operador aunque el mensaje contenga instrucciones incrustadas.
- Extraccion y conteo de campos en documentos: las tareas de conteo y extraccion de SecFid son el escenario medido; util para pipelines de facturas, contratos o formularios donde el contenido puede incluir texto adversarial.
- Traduccion y edicion de contenido de terceros: el modelo traduce o reescribe el documento sin obedecer instrucciones embebidas, preservando las frases con forma de orden como texto a traducir o editar.
- Lectura de salidas de herramientas en agentes: el autor evalua AgentDojo con salidas de herramientas tratadas como texto; aplicable a agentes que interpretan resultados de APIs o busquedas web potencialmente contaminadas.
- Evaluacion de seguridad y red teaming: util como linea base endurecida para comparar tasas de seguimiento de inyecciones frente al modelo sin defensa en pruebas de BIPIA o SecFid.
- Prototipado de asistentes documentales con requisitos de robustez: el adaptador se carga sobre el base con PEFT en pocas lineas y mantiene la plantilla de chat original, lo que facilita sustituir el base por esta variante en un prototipo existente.

## Benchmarks y rendimiento

Datos del paper (Tablas 4 y 13; ficheros de resultados en el commit 08e477d), comparando el adaptador con el base sin defensa:

| Medida | Este adaptador | Base sin defensa |
|---|---|---|
| Inyecciones BIPIA seguidas, atacante fijo, 13 formulaciones (menor es mejor) | 0,233 | 0,543 |
| Inyecciones BIPIA seguidas, atacante adaptativo, 13 intentos | 0,010 | 0,667 |
| Inyecciones BIPIA seguidas, combinado | 0,238 | 0,743 |
| Conjunto sellado S2: instrucciones inyectadas frescas seguidas (decidido por regla, 500 filas) | 0,000 | 0,668 |
| Conjunto sellado S4: instrucciones propias del usuario seguidas en documentos frescos (240; mayor es mejor) | 0,746 | 0,742 |
| Ataque GCG de caja blanca, proporcion de 25 documentos comprometidos | 0,760 | 1,000 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este adaptador.

## Requisitos de hardware

- VRAM estimada: el modelo base de 7B en bfloat16 requiere aproximadamente 14-16 GB de VRAM; en cuantizacion de 4 bits, alrededor de 5-6 GB (el paper ejecuto el base en 4 bits). El adaptador anade una huella minima (repo de 0,2 GB).
- GPU recomendadas: A100, H100 o L40S para inferencia en bfloat16 con margen; RTX 4090 (24 GB) suficiente para bfloat16; RTX 3090 o GPUs de 12-16 GB con cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en bfloat16 y en tarjetas de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM, TGI, llama.cpp u Ollama previa fusion del adaptador con el base y conversion al formato correspondiente; la informacion proporcionada solo documenta la carga via PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Defensa frente a inyeccion indirecta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-TwinDistillation | 7B + LoRA r16 | no disponible (heredado del base) | Si, medida en BIPIA, SecFid y AgentDojo (formato de un turno) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base sin defensa) | 7B | no disponible en la informacion | No (0,743 de inyecciones combinadas seguidas en BIPIA) | apache-2.0 | Hugging Face |
| Defensas publicadas sobre el mismo base (mencionadas en el paper) | 7B | no disponible | Si, pero el ataque GCG tambien las rompe segun el autor | segun cada defensa | no disponible |

El autor indica que las defensas publicadas sobre el mismo base tambien son vulnerables al ataque GCG de caja blanca. No se dispone de comparaciones con modelos de otros tamanos o familias en la informacion proporcionada.

## Limitaciones y advertencias

- Un atacante de caja blanca con acceso a los pesos (GCG) sigue comprometiendo el adaptador en el 76 % de 25 documentos, frente al 100 % del base sin defensa; no debe usarse como unica proteccion frente a atacantes con los pesos.
- La defensa esta ligada al formato de prompt de entrenamiento (frase de tarea, linea en blanco, documento, un unico turno de usuario con el system prompt indicado); desplegarlo en otro formato requiere su propia medicion.
- El exito residual frente al atacante fijo proviene mayoritariamente de reescrituras que sustituyen la mayor parte del documento anfitrion (Seccion 7.1 del paper).
- Solo se entreno una ejecucion por modelo; el paper reporta intervalos de confianza para cada cifra.
- Idioma limitado al ingles; no se documenta comportamiento en castellano ni en otros idiomas.
- Capacidades generales (razonamiento, codigo, matematicas, tool calling) no evaluadas en la informacion disponible; el adaptador no pretende mejorarlas.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este adaptador; se heredan los del base Qwen2.5-7B-Instruct.
- Licencia Apache 2.0 heredada del base, que permite uso comercial; el adaptador es una obra derivada de Qwen2.5-7B-Instruct y esta sujeto a los terminos de este.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; se trata de una publicacion reciente y sin validacion independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/anasbiswas/Qwen2.5-7B-Instruct-TwinDistillation
- Codigo del paper: https://github.com/anasbiswas1/picalib-research
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper: Md Anas Biswas. *Twin Distillation Against Indirect Prompt Injection: Training Language Models to Distinguish User Instructions from Injected Instructions*. 2026 (no se proporciona URL directa en la informacion disponible).
