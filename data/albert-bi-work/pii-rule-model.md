# albert-bi-work/pii-rule-model

## Resumen

pii-rule-model es un modelo de deteccion de informacion personal identificable (PII) publicado por el usuario albert-bi-work en Hugging Face. A pesar de presentarse con la interfaz habitual de `transformers` (tokenizer mas `AutoModelForTokenClassification`), su funcionamiento interno es declarativamente basado en reglas, no en una red neuronal entrenada de forma convencional. El modelo expone un metodo `detect()` que devuelve las entidades identificadas en una lista de textos, y requiere `trust_remote_code=True` para cargarse, lo que implica la ejecucion de codigo personalizado incluido en el repositorio.

El modelo es extremadamente pequeno: 373.936 parametros segun los pesos en safetensors, con un repositorio de aproximadamente 0.0 GB. Esta pensado para escenarios de redaccion o enmascaramiento de datos sensibles en flujos de texto en chino e ingles, con un conjunto de entidades limitado y predefinido: PERSON, EMAIL, PHONE, ID_CARD, CREDIT_CARD, ADDRESS e IPV4. Su interes practico radica en que ofrece una API compatible con el ecosistema `transformers` para una tarea que normalmente se resuelve con expresiones regulares ad hoc, lo que facilita su integracion en pipelines existentes.

La relevancia de esta ficha es acotada: se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion sobre el proceso de construccion de las reglas. Debe evaluarse como una utilidad ligera de preprocesado o como punto de partida, no como un modelo de clasificacion de entidades entrenado con datos supervisados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en reglas, empaquetada con `custom_code` para ser compatible con `transformers` (`AutoModelForTokenClassification`) |
| Parametros totales | 373.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La model card describe el modelo como "basado en reglas y ligero" y confirma que su estructura es completamente compatible con `transformers`. No se detalla ninguna arquitectura de red neuronal concreta (transformer, MoE, SSM ni hibrida), ni se documenta un proceso de entrenamiento con tokens, composicion de dataset, RLHF o DPO. El dato de 373.936 parametros en safetensors sugiere que el repositorio incluye algun tensor auxiliar, probablemente para satisfacer la interfaz de `PreTrainedModel`, pero no hay informacion que permita afirmar que esos pesos se usen para la deteccion.

La innovacion tecnica declarada es la integracion de la logica de reglas dentro de un objeto compatible con la API de `transformers`, exponiendo un metodo `detect()` que recibe una lista de cadenas y devuelve las entidades detectadas. El uso obligatorio de `trust_remote_code=True` indica que la implementacion efectiva vive en el codigo del repositorio y no en una configuracion estandar de Hugging Face.

## Capacidades

- Deteccion de entidades PII mediante reglas: PERSON, EMAIL, PHONE, ID_CARD, CREDIT_CARD, ADDRESS e IPV4.
- Interfaz compatible con `transformers` mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Metodo `detect()` que acepta una lista de textos y devuelve las entidades identificadas.
- Soporte de chino e ingles segun los metadatos del modelo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- No se documenta generacion de texto, razonamiento, codigo ni matematicas.

## Casos de uso

- Redaccion de PII en logs de aplicaciones: pasar cada linea o mensaje por `detect()` y sustituir las entidades devueltas (telefonos, correos, tarjetas) antes de enviar los logs a un sistema de observabilidad, reduciendo el riesgo de exposicion de datos personales.
- Enmascaramiento previo a almacenamiento: aplicar el modelo sobre formularios o mensajes de usuario en chino e ingles para sustituir numeros de tarjeta y documentos de identidad antes de persistirlos en una base de datos.
- Preprocesado en pipelines de NLP: usar las entidades detectadas como paso previo a tareas de clasificacion o analisis, evitando que datos sensibles lleguen a modelos de terceros.
- Cumplimiento y auditoria interna: ejecutar el detector sobre exportaciones de texto para localizar correos, IPs y telefonos y generar informes de exposicion de PII.
- Filtrado en ingesta de datos: descartar o anonimizar registros que contengan tarjetas de credito o documentos de identidad antes de incorporarlos a un conjunto de datos de entrenamiento.
- Prototipado rapido de un servicio de saneamiento: al ser un artefacto pequeno y con licencia Apache 2.0, permite montar un endpoint de prueba con la API de `transformers` sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas de precision, recall ni F1 sobre conjuntos como CoNLL-2003, WikiANN ni corpus especificos de PII, ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el repositorio ocupa aproximadamente 0.0 GB y los pesos suman 373.936 parametros.
- GPU recomendadas: no se requiere GPU; puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: la via documentada es `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un detector basado en reglas, el coste dependera del numero y complejidad de las reglas y del volumen de texto, no del tamano de los pesos.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| albert-bi-work/pii-rule-model | Reglas con envoltorio `transformers` | 373.936 | no disponible | zh, en | Apache 2.0 | Hugging Face, 0 descargas |
| Microsoft Presidio | Reglas y reconocedores configurables | no aplica (no es un modelo neuronal) | no aplica | multi-idioma via reconocedores | MIT | open source, ampliamente adoptado |
| Modelos NER tipo BERT para PII | Transformer supervisado para token classification | cientos de millones (tipico) | 512 tokens (tipico en BERT base) | segun entrenamiento | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- El modelo es basado en reglas: su cobertura depende de los patrones implementados y no generaliza a variantes no contempladas (formatos de telefono, direcciones o documentos de identidad no previstos).
- Solo declara soporte para chino e ingles; el comportamiento en otros idiomas no esta documentado.
- No hay informacion sobre sesgos, tasas de falsos positivos o falsos negativos.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de detecciones incorrectas por reglas demasiado laxas o estrictas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- El repositorio tiene cero descargas y cero likes, sin evidencia de uso en produccion ni mantenimiento.
- No se documentan limitaciones de longitud de contexto; el metodo `detect()` recibe una lista de textos, pero no se especifica el tamano maximo por entrada.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia sobre exactitud o idoneidad para cumplimiento normativo (RGPD u otras regulaciones).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albert-bi-work/pii-rule-model
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
