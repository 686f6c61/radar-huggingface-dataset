# alpha-ai/LetsVoice-Privacy-1.7B-GGUF

## Resumen

LetsVoice-Privacy-1.7B es un modelo de lenguaje pequeno (SLM) desarrollado por Alpha AI para su producto LetsVoice, disenado especificamente para operar sobre texto en el que los datos sensibles (nombres, importes, fechas, identificadores) ya han sido sustituidos por marcadores de posicion tipo `[PERSON_7F2A]`. El modelo no realiza la anonimizacion: esta ocurre en el software del cliente antes de que el texto llegue al modelo, y los valores reales se restauran despues. Se trata, por tanto, de un modelo de divulgacion selectiva, no de un sistema de cifrado ni de una garantia de privacidad.

El modelo parte de Qwen3-1.7B y ha sido afinado para completar tareas de resumen, redaccion, extraccion y respuesta sobre texto enmascarado, manteniendo la coherencia de los marcadores. La version publicada en este repositorio es una cuantizacion GGUF del modelo base `alpha-ai/LetsVoice-Privacy-1.7B`, con 1.720.574.976 parametros y licencia Apache 2.0.

Su relevancia actual radica en que aborda un problema practico de despliegue en dispositivos: procesar conversaciones y notas con informacion personal sin exponer los datos reales al modelo, con un tamano que cabe en GPU de consumo y con soporte para ingles, hindi, hinglish, espanol, frances y aleman.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue con `-c 4096`; no se especifica contexto maximo nativo) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en, hi (incluye hinglish), es, fr, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3-1.7B, reentrenado mediante ajuste fino supervisado para operar sobre texto enmascarado. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero si indica que los datos son sinteticos o escritos por el mismo equipo que construyo los datos de entrenamiento, y que no se usaron conversaciones reales de clientes ni para entrenamiento ni para evaluacion. Se menciona un segundo ciclo de entrenamiento disenado a partir de los fallos observados en el primero, con casos nuevos redactados antes de ese segundo ciclo.

La innovacion principal no es arquitectonica sino de flujo de trabajo: el modelo aprende a razonar y generar sobre marcadores opacos (`[PERSON_7F2A]`, `[AMOUNT_C9]`, `[DATE_44D0]`, etc.) sin inventar identificadores y reproduciendolos exactamente. Cuando la tarea requiere aritmetica sobre valores ocultos, el modelo emite una peticion estructurada en JSON (`calculation_request`) para que la aplicacion cliente resuelva la operacion con los valores reales. El chat template incorpora un system prompt por defecto cuando el usuario no envia ninguno. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y resumen de llamadas, notas y transcripciones.
- Extraccion de elementos de accion (action items) con asignado y fecha limite.
- Redaccion de mensajes y correos con marcadores de posicion preservados.
- Respuesta a preguntas sobre quien hizo que, manteniendo la coherencia de los identificadores.
- Salida en JSON y en formato de tool call / function call.
- Peticiones de calculo estructuradas cuando los operandos estan enmascarados (operaciones como `min`, `max`, etc.).
- Multilingue: ingles, hindi, hinglish, espanol, frances y aleman.
- Capacidad general de lenguaje preservada: 95,0% de exito en tareas sin enmascarar (frente al 90,0% del modelo original en la misma prueba de 20 tareas).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Resumen de llamadas de atencion al cliente: la aplicacion enmascara nombres, importes y fechas antes de enviar la transcripcion; el modelo genera un resumen y una lista de acciones que la aplicacion restaura con los valores reales. Adecuado por su entrenamiento especifico sobre marcadores y su ventana de 4096 tokens.
- Gestion de cobros y facturacion: redaccion de recordatorios de pago con importes e identificadores de factura enmascarados, delegando cualquier comparacion aritmetica al cliente mediante `calculation_request`.
- Asistentes de agenda y coordinacion: extraccion de quien llama a quien y en que fecha a partir de notas o correos enmascarados, con reproduccion exacta de los identificadores (97,0% de identificadores esperados reproducidos exactamente en el conjunto estandar).
- Procesamiento en dispositivo (on-device): el archivo Q4_K_M ocupa 1,11 GB y el Q5_K_M 1,26 GB, lo que permite ejecutarlo en portatiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp, manteniendo los datos sensibles fuera del modelo.
- Pipelines de correo y mensajeria empresarial: borradores de respuesta que preservan los marcadores para que el sistema de origen los sustituya por los valores reales antes de enviar, reduciendo el riesgo de fuga de PII al proveedor del modelo.
- Despliegue multilingue en India y Europa: resumen y extraccion en hindi, hinglish, espanol, frances y aleman sobre texto enmascarado, con un 99,6% de exito en el conjunto de pruebas multilingue (si bien ese conjunto sigue de cerca las plantillas de entrenamiento).
- Servidor compatible con OpenAI: integracion en arquitecturas existentes mediante `llama-server` con endpoint `/v1/chat/completions`, sin cambios en el codigo cliente mas alla del enmascarado previo.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy; el modelo original recibe su mejor prompt de tres, elegido sobre datos de validacion separados). Los numeros corresponden al archivo Q5_K_M sobre pruebas sinteticas.

| Conjunto de prueba | Tareas | Qwen3-1.7B, texto original | Qwen3-1.7B, texto enmascarado | LetsVoice-Privacy-1.7B, texto enmascarado |
|---|---|---|---|---|
| Tareas estandar reservadas | 480 | 68,4% | 50,4% | 94,0% |
| Mismas tareas como transcripciones de voz | 473 | 65,2% | 42,5% | 93,7% |
| Hindi, hinglish, espanol, frances, aleman | 250 | 54,0% | 52,4% | 99,6% |
| Casos escritos a mano | 24 | no disponible | 66,7% | 79,2% |
| Casos escritos a mano nuevos | 27 | no disponible | 51,9% | 92,6% |
| Capacidad general (sin enmascarar) | 20 | no disponible | 90,0% | 95,0% |

| Metrica en el conjunto estandar | Qwen3-1.7B | LetsVoice-Privacy-1.7B |
|---|---|---|
| Identificadores esperados reproducidos exactamente | 77,2% | 97,0% |
| Identificadores inventados | 2,8% | 0,1% |
| Tipos de tarea nunca vistos en entrenamiento | 49,0% | 79,7% |

Con enmascarado real en el bucle (texto original pasa por el software de enmascarado del autor, se restaura la respuesta y se comprueba contra los valores originales):

| Entrada | Exito de tarea |
|---|---|
| Tareas estandar reservadas | 80,7% |
| Mismas tareas como transcripciones de voz | 85,2% |
| Hindi, hinglish, espanol, frances, aleman | 90,5% |

Por archivo de cuantizacion:

| Archivo | Tamano | Tareas estandar | Transcripciones de voz | Casos nuevos |
|---|---|---|---|---|
| `letsvoice-privacy-1.7b-Q4_K_M.gguf` | 1,11 GB | 94,2% | 92,2% | 88,9% |
| `letsvoice-privacy-1.7b-Q5_K_M.gguf` | 1,26 GB | 94,0% | 93,7% | 92,6% |
| `letsvoice-privacy-1.7b-Q8_0.gguf` | 1,83 GB | 93,8% | no disponible | 92,6% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q4_K_M), 1,3 GB (Q5_K_M) y 1,8 GB (Q8_0), mas el espacio para el contexto KV cache (4096 tokens).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; en la practica cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. El modelo esta pensado para despliegue en dispositivo, por lo que la CPU es una opcion valida.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), servidor compatible con OpenAI. El autor indica que solo ha probado los archivos con una build local de llama.cpp y que otros runtimes GGUF no han sido probados. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LetsVoice-Privacy-1.7B | 1,72 B | 4096 (usado en ejemplo) | SLM especializado en texto enmascarado | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-1.7B (base) | 1,7 B aprox. | no disponible en esta ficha | SLM generalista | no disponible en esta ficha | safetensors y GGUF |
| Otros SLM de ~1-2 B para privacidad | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con el modelo base esta documentada en la model card: LetsVoice-Privacy-1.7B obtiene 94,0% frente al 50,4% de Qwen3-1.7B sobre texto enmascarado en el conjunto estandar, y 97,0% frente a 77,2% en reproduccion exacta de identificadores. No se dispone de datos de otros modelos especializados en enmascarado para una comparativa mas amplia.

## Limitaciones y advertencias

- El modelo no protege nada por si mismo: el enmascarado ocurre en el software del cliente antes de que el texto llegue al modelo. Es divulgacion selectiva, no cifrado, y no garantiza privacidad.
- Los datos de evaluacion son sinteticos o escritos por el mismo equipo que construyo el entrenamiento; no se usaron conversaciones reales de clientes. El rendimiento en produccion con datos reales puede ser inferior.
- El conjunto estandar comparte estilo con los datos de entrenamiento; los conjuntos escritos a mano son pequenos (24 y 27 casos).
- La puntuacion multilingue (99,6%) es la mas favorable: esos tests siguen de cerca las plantillas de entrenamiento, por lo que cabe esperar un rendimiento menor en habla libre en esos idiomas.
- Con enmascarado real en el bucle, el exito baja al 80,7% en tareas estandar y al 85,2% en transcripciones de voz, frente al 94,0% y 93,7% con enmascarado perfecto. Los errores del software de enmascarado se propagan.
- Riesgo de alucinacion de identificadores reducido pero no nulo: 0,1% de identificadores inventados en el conjunto estandar.
- Solo se ha probado con una build local de llama.cpp; otros runtimes GGUF no estan validados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo de privacidad (RGPD, etc.) derivado del uso del modelo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpha-ai/LetsVoice-Privacy-1.7B-GGUF
- Modelo base: https://huggingface.co/alpha-ai/LetsVoice-Privacy-1.7B
- LetsVoice: https://www.letsvoice.biz
- Alpha AI: https://www.alphaai.biz
- Imagen de portada: https://huggingface.co/alpha-ai/LetsVoice-Privacy-1.7B-GGUF/resolve/main/cover.png
- Grafico de exito por conjunto de prueba: charts/overall.png (relativo al repositorio)
- Grafico de exito por categoria: charts/by_category.png (relativo al repositorio)
