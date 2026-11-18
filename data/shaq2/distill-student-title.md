# Shaq2/distill-student-title

## Resumen

distill-student-title es un adaptador LoRA de tipo PEFT publicado por el usuario Shaq2 sobre el modelo base Qwen/Qwen3.5-0.8B-Base. No se trata de un modelo completo, sino de un ajuste fino de bajo rango (r=16, alpha=32) orientado a una tarea muy concreta: la generacion de titulos cortos para tickets, presumiblemente en un sistema de soporte tecnico o gestion de incidencias. El adaptador se distribuye tanto en formato safetensors para PEFT como en GGUF para su uso con llama.cpp, lo que permite servirlo junto al modelo base compartido mediante la funcionalidad multi-LoRA de llama.cpp.

El modelo se enmarca en una estrategia de destilacion: las etiquetas de entrenamiento fueron generadas por un teacher (cerebras:gpt-oss-120b) sobre un conjunto de tickets sintetizados, y el adaptador busca aproximar ese comportamiento con un coste de inferencia mucho menor. Segun la model card, el estudiante alcanza un token-F1 de 0,675 (13,5% exact match) frente al 0,638 (11,5%) de un incumbente identificado como gpt-5-nano, con un coste por cada 1000 peticiones de aproximadamente 0,014-0,024 USD frente a 0,11-0,28 USD. No obstante, el propio autor advierte que las etiquetas de la evaluacion fueron escritas por el mismo teacher que genero los datos de entrenamiento, no estan verificadas por humanos y el estudiante no fue promovido tras una revision ciega.

Se trata de un artefacto muy especializado, con cero descargas y un like en el momento de la consulta, pensado para un pipeline interno concreto (gateway Distill) y no como modelo de proposito general. Su relevancia radica en ejemplificar el patron de destilacion de un LLM grande a un adaptador pequeno servido de forma eficiente, aunque su validacion experimental es limitada y su utilidad fuera de ese dominio es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B-Base; r=16, alpha=32, targets q/k/v/o/gate/up/down |
| Parametros totales | 6.389.760 (pesos del adaptador, safetensors); el modelo base Qwen3.5-0.8B-Base no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors y GGUF; el base admite las cuantizaciones propias de llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (adapter.gguf), configuracion PEFT en adapter_config.json |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones q, k, v, o, gate, up y down del transformer Qwen3.5-0.8B-Base. Al ser un adaptador PEFT, no modifica los pesos del modelo base: se carga por encima de este en tiempo de inferencia. El repositorio incluye ademas el tokenizer (tokenizer.json, tokenizer_config.json) y una plantilla de chat (chat_template.jinja), lo que sugiere que el adaptador se usa en un formato conversacional con el modelo base como sustrato.

El entrenamiento se realizo sobre el dataset Shaq2/distill-title-generation (licencia apache-2.0, con procedencia y licencias por fuente documentadas en data/SOURCES.md). Las etiquetas de entrenamiento fueron generadas por el teacher cerebras:gpt-oss-120b, es decir, se trata de destilacion supervisada a partir de datos sinteticos escritos por un modelo mayor. El script de entrenamiento esta disponible en kaggle/train.py y se ejecuto en Kaggle. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; por el tipo de tarea (generacion de titulos cortos) es probable que el ajuste sea puramente supervisado, pero este extremo no se confirma.

La innovacion tecnica destacable no esta en la arquitectura sino en el despliegue: el adaptador se sirve junto a un GGUF del modelo base compartido mediante la funcionalidad multi-LoRA de llama.cpp, permitiendo seleccionar el adaptador por peticion con `{"lora":[{"id":<sorted-adapter-idx>,"scale":1.0}],"chat_template_kwargs":{"enable_thinking":false}}`. Esto reduce el coste marginal de servir un modelo especializado cuando ya se tiene el base cargado.

## Capacidades

- Generacion de titulos cortos para tickets: es la unica tarea declarada y para la que fue entrenado el adaptador.
- Generacion de texto conversacional: heredada del pipeline text-generation del modelo base Qwen3.5-0.8B-Base.
- Servicio multi-LoRA en llama.cpp: permite alternar entre adaptadores sobre un mismo base GGUF por peticion.
- Desactivacion del modo thinking: la plantilla de chat admite `enable_thinking: false`, orientado a respuestas directas y breves.
- Tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el adaptador esta especializado en una unica tarea de generacion corta.
- Capacidades multilingues: no disponibles; no se documentan idiomas soportados.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Generacion automatica de titulos de tickets en mesas de ayuda: el adaptador recibe el cuerpo de un ticket y produce un titulo corto y descriptivo, reduciendo el coste frente a un LLM propietario. Es su caso de uso principal y el unico validado por el autor.
- Clasificacion y triaje inicial de incidencias: al generar titulos normalizados se facilita el enrutamiento posterior a colas o equipos, aunque el adaptador no realiza la clasificacion por si mismo.
- Servicio multi-tenant con llama.cpp: cargando el base GGUF una sola vez y seleccionando el adaptador por peticion, se puede ofrecer esta funcion junto a otras tareas sin duplicar el modelo base en memoria.
- Reduccion de costes en pipelines de alto volumen: con un coste estimado de 0,014-0,024 USD por cada 1000 peticiones frente a 0,11-0,28 USD del incumbente, resulta adecuado para entornos con miles de tickets diarios.
- Prototipado de destilacion: sirve como referencia para equipos que quieran replicar el patron teacher grande a student pequeno con LoRA y servir el resultado en llama.cpp.
- Integracion en herramientas de gestion de proyectos o issues: el mismo esquema (entrada de texto libre, salida de titulo corto) es aplicable a la generacion de titulos de issues en repositorios o de entradas en sistemas de ticketing internos.
- Evaluacion comparativa de adaptadores: el formato GGUF y la seleccion por peticion permiten A/B testing entre este adaptador y otros sobre el mismo base.

## Benchmarks y rendimiento

La model card reporta una evaluacion sobre un conjunto golden de 200 filas, comparando el estudiante con un incumbente identificado como gpt-5-nano. Las etiquetas golden fueron escritas por el mismo teacher que genero los datos de entrenamiento y no estan verificadas por humanos.

| Metrica | Estudiante | Incumbente (gpt-5-nano) |
|---|---|---|
| token-F1 | 0,675 | 0,638 |
| Exact match | 13,5% | 11,5% |
| Coste por 1000 peticiones (USD) | ~0,014-0,024 | 0,11-0,28 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que el estudiante no fue promovido tras una revision ciega, lo que limita la confianza en la comparacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; al ser un LoRA de 6,39 millones de parametros, el coste adicional sobre el base es minimo (decenas de MB en fp16). El requisito dominante es el del modelo base Qwen3.5-0.8B-Base, que por su tamano (0,8B) cabe holgadamente en GPU consumer.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del base, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente para el base cuantizado, pero este extremo no se confirma.
- Cabe en GPU consumer: si, segun el tamano del modelo base (0,8B), aunque no se documenta una configuracion concreta.
- Opciones de despliegue: llama.cpp con soporte multi-LoRA (formato GGUF del adaptador), y PEFT con safetensors sobre el base. El autor referencia modal/distill_serve.py para el servicio.
- Latencia y throughput estimados: no disponibles. El unico dato de coste es el de la tabla de evaluacion (~0,014-0,024 USD por cada 1000 peticiones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distill-student-title (este) | 6,39 M en adaptador LoRA sobre base 0,8B | no disponible | token-F1 0,675; exact 13,5% | apache-2.0 | Hugging Face, GGUF + safetensors |
| gpt-5-nano (incumbente) | no disponible | no disponible | token-F1 0,638; exact 11,5% | propietaria | API de pago |
| cerebras:gpt-oss-120b (teacher) | no disponible | no disponible | no evaluado en la model card | no disponible | servicio cerebras |

No se dispone de informacion sobre otros adaptadores LoRA comparables para la misma tarea de generacion de titulos de tickets. La comparacion con el teacher no se ha publicado en la model card.

## Limitaciones y advertencias

- Validacion debil: las etiquetas golden fueron escritas por el mismo teacher que genero los datos de entrenamiento, no estan verificadas por humanos y el estudiante no fue promovido tras una revision ciega. Los resultados de la tabla deben interpretarse con cautela.
- Rendimiento modesto en exact match: un 13,5% de coincidencia exacta implica que la mayoria de titulos generados no coinciden literalmente con la referencia, aunque el token-F1 sea alto.
- Especializacion extrema: el adaptador esta entrenado unicamente para generar titulos de tickets; no debe esperarse calidad en otras tareas de generacion, razonamiento o codigo.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3.5-0.8B-Base; el adaptador por si solo no es funcional.
- Idiomas no documentados: se desconoce si el adaptador funciona correctamente fuera del idioma o idiomas presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo generativo, puede producir titulos que no reflejen fielmente el contenido del ticket, especialmente con entradas ambiguas o muy largas.
- Sesgos: no se documentan analisis de sesgo; los sesgos del teacher (cerebras:gpt-oss-120b) y del dataset sintetico pueden propagarse al estudiante.
- Licencia: apache-2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento debe consultarse en data/SOURCES.md del dataset Shaq2/distill-title-generation para verificar compatibilidad.
- Madurez: cero descargas y un like en el momento de la consulta; el proyecto parece experimental y sin adopcion externa verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/distill-student-title
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/Shaq2/distill-title-generation
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda proporcionada (los resultados corresponden a perfiles de LinkedIn y a un congreso sin relacion con este modelo).
