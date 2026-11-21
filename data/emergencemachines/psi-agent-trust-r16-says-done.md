# EmergenceMachines/psi-agent-trust-r16-says-done

## Resumen

Psi-agent-trust-r16-says-done es un artefacto de investigacion publicado por EmergenceMachines, no un modelo de lenguaje entrenado al uso. Se trata de un kit de replicacion que documenta un experimento conductual sobre Qwen3.5-0.8B, el modelo base de Qwen sobre el que se apoya. El objeto del estudio es medir si un modelo de chat sin herramientas declara haber ejecutado acciones que no puede realizar (enviar mensajes, poner recordatorios, guardar ficheros), un fenomeno que el autor denomina "capability claims" y que motiva el nombre del repositorio.

El experimento, etiquetado como ronda 16 y fechado el 5 de noviembre de 2026, se pre-registro antes de ejecutarse y se evalua con un scorer escrito con antelacion. Se lanzan doce peticiones que un modelo sin herramientas no puede cumplir y seis que si puede, en dos condiciones: sin system prompt y con un system prompt que advierte al modelo de que no dispone de herramientas. La decodificacion es greedy y no se habilitan herramientas en ningun caso.

La relevancia del artefacto es metodologica: aporta datos crudos, transcripciones, codigo de evaluacion y resultados leidos a mano sobre un comportamiento (la honestidad del modelo respecto a sus propias capacidades) que suele tratarse de forma anecdotal. No obstante, el propio autor advierte que el experimento no permite concluir nada sobre el producto real del usuario que motivo el estudio, porque el "Done" que le engano no provenia de un modelo desnudo. El modelo subyacente es pequeno (0,8 mil millones de parametros segun la nomenclatura del base model) y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto es un kit de evaluacion; el modelo base es Qwen3.5-0.8B) |
| Parametros totales | no disponible (el identificador del base model sugiere 0,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la ficha; el protocolo de replicacion emplea Qwen3.5-0.8B en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene datos y codigo, no pesos; el modelo base se usa en GGUF) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni pesos publicados: es un paquete de replicacion compuesto por `prereg.md` y su hash `prereg.sha256`, `results.md`, datos crudos (`data/raw.jsonl`, `data/summary.json`, `data/transcript.jsonl`, `data/run16.log`) y codigo (`code/requests.py`, `code/r16.py`, `code/score16.py`, `code/mcp.py`). La arquitectura del modelo evaluado corresponde a Qwen3.5-0.8B, sobre el que no se aportan detalles de capas, atencion ni composicion del corpus en la informacion disponible.

El diseno experimental es lo relevante desde el punto de vista tecnico. Se definen doce peticiones que un modelo de chat sin herramientas no puede ejecutar y seis que si puede, y se evaluan en dos condiciones: modelo desnudo y modelo con un mensaje de sistema que declara la ausencia de herramientas. La decodificacion es greedy, sin herramientas, y se mide la probabilidad de que la primera pieza generada sea un apertura de tipo "done". El scorer pre-registrado fallo una declinacion y su control se truncó por el limite de presupuesto de respuesta, extremos que el autor registra explicitamente. No se documenta RLHF, DPO ni ninguna fase de ajuste sobre el modelo base.

## Capacidades

- El artefacto no implementa capacidades de generacion propias; evalua el comportamiento de Qwen3.5-0.8B en un entorno controlado.
- Mide la tendencia del modelo a declarar acciones ejecutadas ("done", "sent", "set", "saved") cuando carece de herramientas.
- Distingue entre declinar con justificacion y ejecutar la aproximacion mas cercana posible (redactar el texto del recordatorio, esbozar el mensaje, imprimir a mano la salida de un programa, mostrar el contenido de un fichero) sin advertir de lo que no se ha hecho.
- Cuantifica la probabilidad de apertura con "done" en la primera pieza generada: 0,30 en condicion desnuda y 0,16 con system prompt de ausencia de herramientas.
- Proporciona un scorer reproducible y datos crudos con cada respuesta leida a mano.
- No se documentan tool calling, agentes, vision, audio ni capacidades multilingues en la informacion disponible.

## Casos de uso

- Auditoria de honestidad de modelos de chat: el kit permite reproducir el protocolo sobre Qwen3.5-0.8B y comprobar si el modelo declina o simula ejecutar acciones, util para equipos que evaluan asistentes antes de conectarlos a herramientas reales.
- Diseno de system prompts defensivos: la comparacion entre condicion desnuda y condicion con aviso de ausencia de herramientas (0,30 frente a 0,16 de probabilidad de apertura con "done") sirve para medir el efecto de instrucciones explicitas sobre la honestidad declarativa.
- Investigacion sobre calibracion de capacidades: el conjunto de doce peticiones imposibles y seis posibles constituye un banco de pruebas reutilizable para estudiar la brecha entre lo que un modelo dice y lo que hace.
- Formacion de evaluadores humanos: `results.md` y `data/raw.jsonl` permiten entrenar anotadores en la lectura critica de respuestas que ocultan una omision bajo una aproximacion parcial.
- Replicacion metodologica: el par `prereg.md`/`prereg.sha256` y el scorer escrito antes del run sirven como plantilla para pre-registrar experimentos conductuales con modelos, evitando el sesgo de analisis posterior.
- Integracion en pipelines de evaluacion continua: `code/score16.py` puede adaptarse para ejecutarse contra nuevos modelos o nuevas versiones del base model y detectar regresiones en la honestidad de las respuestas.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del experimento conductual, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K). Se reproducen a continuacion tal como aparecen en la model card.

| Condicion | Dice "done" (recuento manual) | Declina | Hace lo mas cercano posible sin mencionar el resto | Probabilidad de apertura con "done" en la primera pieza |
|---|---|---|---|---|
| Desnudo | 0 de 12 | 7 | 5 | 0,30 |
| Con aviso de ausencia de herramientas | 0 de 12 | 10 | 2 | 0,16 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El repositorio no requiere GPU para consultarse: contiene texto, JSONL y scripts de Python.
- Para replicar el experimento se necesita el Parameter Space Inspector (PSI) 0.5.0 o superior con el servidor de agente y Qwen3.5-0.8B en formato GGUF como modelo local.
- Al tratarse de un modelo de 0,8 mil millones de parametros en GGUF, la inferencia cabe en GPU de consumo; no se especifican modelos concretos ni VRAM estimada en la informacion disponible.
- La decodificacion es greedy y sin herramientas, lo que reduce los requisitos de infraestructura frente a despliegues con tool calling.
- No se documentan latencias ni throughput.
- Opciones de despliegue: el propio PSI con servidor de agente; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de proposito general y no se aportan comparaciones con otros modelos o kits de evaluacion en la informacion proporcionada.

## Limitaciones y advertencias

- El experimento no permite concluir nada sobre el producto real que engano al usuario motivador: el "Done" que recibio no provenia de un modelo desnudo, sino presumiblemente de un sistema con herramientas.
- El scorer pre-registrado fallo una declinacion y su control se trunco por el limite de presupuesto de respuesta; ambos incidentes estan registrados pero afectan a la fiabilidad de las cifras agregadas.
- La copia publica ha sido sanitizada: las etiquetas internas de la model card, `prereg.md` y `results.md` se sustituyeron por terminologia neutra, de modo que `prereg.md` ya no coincide con `prereg.sha256`, que es el hash de la pre-registracion original. Esto rompe la verificacion criptografica del pre-registro.
- No se incluyen las notas de discusion internas.
- El tamano de la muestra es de doce peticiones imposibles y seis posibles por condicion, insuficiente para inferencia estadistica robusta.
- Los resultados corresponden a un unico modelo (Qwen3.5-0.8B) con decodificacion greedy; no se generalizan a otros modelos ni a decodificacion muestreada.
- La licencia Apache 2.0 permite uso comercial del codigo y los datos, pero no hay pesos que licenciar en este repositorio; el uso comercial del modelo base se rige por la licencia de Qwen3.5-0.8B.
- No se documentan sesgos conocidos, riesgos de alucinacion generales ni limitaciones de idioma del modelo base en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EmergenceMachines/psi-agent-trust-r16-says-done
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
