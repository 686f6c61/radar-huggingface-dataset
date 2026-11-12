# oot-ai/oot-oneliner-GGUF

## Resumen

oot-oneliner es un modelo de lenguaje especializado en una unica tarea: generar un resumen de una sola linea a partir de cualquier entrada. Lo desarrolla oot-ai bajo el concepto OOT (Only One Task), una filosofia de diseno que renuncia a la generalidad para maximizar la precision en un problema cerrado. Con 1.728.801.600 parametros, esta construido sobre una base LFM3-1.7B de LiquidAI y se distribuye en formato GGUF para su uso con llama.cpp.

El modelo resuelve dos problemas concretos en el ecosistema de agentes y aplicaciones de chat. Primero, la generacion de titulos de conversacion a escala: en lugar de gastar tokens de un modelo frontera para producir una cadena de 3 a 7 palabras, oot-oneliner lo hace en una base de 1.7B, incluso en CPU. Segundo, la generacion de intenciones legibles para acciones de agente (comandos de shell, consultas SQL, diffs, llamadas a herramientas en JSON), derivadas del contenido real de la accion y no de lo que el agente declaro que pretendia hacer.

La relevancia actual del modelo radica en su contrato de salida estricto y su coste marginal. En una evaluacion interna de 1.000 casos, alcanza un 99,5% de acierto en la seleccion de modo (titulo frente a intencion) y un 98,5% de cumplimiento de formato, con un enfasis explicito en declarar efectos destructivos en comandos peligrosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LFM3-1.7B de LiquidAI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como spec oficial; entrenado hasta ~2K tokens de entrada; ejemplo de servidor con `--ctx-size 16384` |
| Tipos de cuantizacion | Q8_0 (1,8 GB) y Q4_K_M (1,1 GB); formato base bf16 en el repo merged |
| Idiomas soportados | multilingue e ingles (titulos en el idioma del usuario; intenciones en ingles) |
| Licencia | lfm1.0 (etiquetada como `other` en HF) |
| Formato de pesos | GGUF (llama.cpp); tambien LoRA adapter y merged bf16 en repos separados |

## Arquitectura y entrenamiento

oot-oneliner es un transformer derivado de LFM3-1.7B-Base de LiquidAI, ajustado mediante LoRA y posteriormente fusionado en bf16. La plantilla de chat es ChatML con tokens especiales de LFM3 y sin bloque `<think>`, lo que implica que el modelo no expone razonamiento intermedio: emite directamente la linea de salida. El ajuste se realizo sobre una tarea unica con contrato de salida estricto (una linea, sin comillas, sin prefijo, sin punto final, sin markdown) y una clasificacion implicita de modo segun el tipo de entrada: mensajes de chat producen un titulo de 3 a 7 palabras en el idioma del usuario; comandos de shell, SQL, diffs y llamadas a herramientas JSON producen una intencion de 5 a 10 palabras en ingles, en presente y empezando por verbo.

El entrenamiento incluyo un conjunto especifico de casos destructivos, con el objetivo de que el modelo explicite el efecto destructivo de comandos peligrosos. Los conjuntos de test retenidos se excluyeron del entrenamiento mediante hash, segun indica el autor. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de titulos de conversacion: 3 a 7 palabras, sentence case, en el mismo idioma que el mensaje del usuario.
- Generacion de intenciones para comandos de shell (bash), en ingles, con verbo inicial en presente.
- Generacion de intenciones para consultas SQL.
- Generacion de intenciones para ediciones de fichero descritas como diff unificado o llamadas a herramientas Write/Edit.
- Generacion de intenciones para llamadas a herramientas o funciones en JSON.
- Declaracion explicita de efectos destructivos en acciones peligrosas (borrados, resets, force-push).
- Salida en texto plano de una sola linea, sin comillas, prefijo, punto final ni markdown.
- Soporte de prompts envueltos (system + user propios) con calidad similar a la del formato canonico segun la evaluacion del autor.
- Capacidad multilingue para la generacion de titulos; las intenciones se emiten siempre en ingles.
- No dispone de tool calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Titulos de conversacion a escala: en una aplicacion de chat, enviar el primer mensaje del usuario al modelo para obtener un titulo de 3 a 7 palabras en su idioma, evitando el coste en tokens y latencia de un modelo frontera. Adecuado por su base de 1.7B, su ejecucion en CPU y su cumplimiento de formato del 98,5%.
- Descripciones de acciones de agente sin coste en el modelo principal: eliminar el campo `description` que el modelo grande escribe junto a cada tool call y derivar la intencion del propio comando, consulta o diff. Reduce tokens por turno y desacopla la descripcion del agente que la ejecuta.
- Registro y auditoria de pasos de agente: usar la intencion generada como etiqueta de log por cada accion ejecutada, permitiendo revisar posteriormente que hizo el agente y en que orden sin depender de la narracion del propio agente.
- Puertas de aprobacion humana: presentar al usuario la intencion derivada de un comando antes de ejecutarlo. El modelo declara el efecto destructivo en el 99,0% de un conjunto retenido de 399 casos destructivos, lo que lo hace util como capa de seguridad en flujos con aprobacion manual.
- Resumen de cambios en pipelines de CI/CD: generar una linea descriptiva por cada diff o edicion de fichero en una pull request, aprovechando la capacidad de interpretar diffs unificados y llamadas Write/Edit.
- Etiquetado de consultas SQL en herramientas de analitica: producir una descripcion legible de cada consulta ejecutada por un analista o un agente de datos, util para catalogos de consultas y revisiones de acceso.
- Enriquecimiento de trazas de herramientas en produccion: procesar llamadas a funciones JSON y anotar cada una con una intencion en ingles, facilitando la observabilidad de sistemas basados en function calling.

## Benchmarks y rendimiento

Datos publicados por el autor para el GGUF Q8_0 sobre conjuntos retenidos:

| Metrica | Resultado |
|---|---|
| Precision de modo (titulo frente a intencion segun tipo de entrada), 1.000 casos, 200 por tipo | 99,5% |
| Cumplimiento de formato (una linea, numero de palabras, sin prefijo/comillas/punto), mismos 1.000 casos | 98,5% |
| Declaracion de efecto destructivo, conjunto retenido de 399 casos destructivos | 99,0% |
| Cumplimiento de contrato en arena de 100 casos frente a Claude Haiku 5.5 | 100% frente a 78% |
| Cumplimiento de contrato en arena de 100 casos frente a Claude Sonnet 5.5 | 100% frente a 55% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con un modelo de tarea unica que no aspira a rendimiento generalista.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para Q8_0 (1,8 GB de pesos) y aproximadamente 1,2 GB para Q4_K_M (1,1 GB de pesos), mas overhead de contexto y runtime.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) con uso marginal.
- Ejecutable en CPU: el autor indica que Q4_K_M es aproximadamente 2,7 veces mas rapido en CPU que Q8_0, con calidad dentro del ruido.
- Despliegue mediante llama.cpp (`llama-server` con plantilla Jinja y endpoint compatible con OpenAI); el autor documenta `--ctx-size 16384 --parallel 4 --n-predict 32`.
- Al ser un GGUF, es compatible con el ecosistema llama.cpp (Ollama y otros runners basados en el), aunque la informacion disponible solo documenta explicitamente llama.cpp.
- Latencia y throughput concretos no disponibles; el autor solo aporta la comparacion relativa de velocidad en CPU entre cuantizaciones.
- Recomendacion de cliente: truncar entradas a ~2K tokens, recortar espacios, eliminar comillas y punto final, y conservar solo la primera linea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oot-oneliner | 1,73B | Entrenado hasta ~2K de entrada | Tarea unica: titulos e intenciones | lfm1.0 | GGUF, LoRA, bf16 en HF |
| Claude Haiku 5.5 | no disponible | no disponible | Modelo generalista frontera | propietaria | API |
| Claude Sonnet 5.5 | no disponible | no disponible | Modelo generalista frontera | propietaria | API |

La comparacion con los modelos de Claude procede de la arena de 100 casos del autor, que mide unicamente cumplimiento de contrato de salida (100% frente a 78% y 55%, respectivamente). No se dispone de comparaciones con otros modelos especializados en titulacion o resumen de una linea en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de tarea unica: no es adecuado para generacion abierta, razonamiento, codigo, matematicas ni conversacion general.
- Entrenado para entradas de hasta ~2K tokens; entradas mas largas deben truncarse en el cliente, lo que puede perder informacion relevante en conversaciones o diffs extensos.
- Las intenciones se emiten siempre en ingles, aunque la entrada este en otro idioma; los titulos si respetan el idioma del usuario.
- Riesgo de alucinacion en la descripcion de acciones: la intencion se deriva del texto de la accion, por lo que comandos ofuscados, concatenados o con sintaxis poco comun pueden describirse de forma imprecisa.
- El modelo no ejecuta ni valida las acciones; su salida es descriptiva y no debe usarse como unico mecanismo de seguridad en puertas de aprobacion.
- Licencia lfm1.0: es necesario revisar sus terminos para uso comercial, ya que la model card la etiqueta como `other` y enlaza al texto de la licencia de LFM3-1.7B-Base. No se detallan en la informacion disponible las restricciones concretas.
- El modelo tiene un volumen de descargas bajo (58) y ningun like en el momento de la consulta, lo que implica poca validacion externa de su comportamiento en produccion.
- No se han publicado sesgos conocidos ni evaluaciones de robustez frente a entradas adversariales en la informacion disponible.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/oot-ai/oot-oneliner-GGUF
- Modelo base fusionado en bf16: https://huggingface.co/oot-ai/oot-oneliner
- Adaptador LoRA: https://huggingface.co/oot-ai/oot-oneliner-lora
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B-Base/blob/main/LICENSE
