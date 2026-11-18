# ibm-granite/granitelib-core-r1.0

## Resumen

Granite Core Library (identificador `granitelib-core-r1.0`) es un repositorio de adaptadores LoRA y aLoRA desarrollado por IBM para la familia de modelos base Granite 4.x. No es un modelo generativo independiente, sino una coleccion de cuatro familias de adaptadores que anaden capacidades de explicabilidad, calibracion, verificacion de restricciones y toma de decisiones sobre modelos como `granite-4.0-micro`, `granite-4.1-3b`, `granite-4.1-8b` y `granite-4.1-30b`. Cada adaptador se entrena mediante PEFT sobre el modelo base correspondiente y se distribuye como pesos separados que se cargan sobre dicho modelo.

El interes practico del repositorio reside en que permite instrumentar un LLM para tareas de fiabilidad en produccion sin necesidad de reentrenar el modelo base: atribuir que frases del contexto influyeron en una respuesta, estimar la certeza calibrada de una generacion, comprobar si se cumplen requisitos de formato o contenido, y resolver decisiones de opcion multiple leyendo directamente los logits del siguiente token. Todo ello bajo licencia Apache 2.0 y con firmas criptograficas de integridad para cada artefacto.

La relevancia actual viene de la demanda de mecanismos de control y auditoria sobre sistemas LLM en entornos empresariales. El repositorio incluye adaptadores para modelos de 3B a 30B de parametros, lo que cubre desde despliegues en una sola GPU consumer hasta inferencia en servidores, y se integra de forma nativa con el framework Mellea de IBM, que expone estos adaptadores como "intrinsics".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA y aLoRA (PEFT) sobre modelos base transformer de la familia Granite 4.x |
| Parametros totales | No disponible (depende del modelo base: granite-4.0-micro, granite-4.1-3b, granite-4.1-8b, granite-4.1-30b) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base correspondiente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), con `adapter_config.json` e `io.yaml`; firma `model.sig` por adaptador |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo unico, sino cuatro familias de adaptadores de bajo rango (LoRA) y variantes aLoRA entrenadas mediante PEFT sobre los modelos Granite 4.x. Cada adaptador se especializa en una tarea concreta: atribucion de contexto, decision, verificacion de requisitos e incertidumbre. La variante de Decision esta disponible unicamente para `granite-4.1-8b` y `granite-4.1-30b`, mientras que el resto cubre las cuatro variantes base.

La innovacion tecnica mas destacable es el adaptador de Decision, que convierte el modelo en un motor de decision leyendo directamente los logits del siguiente token en un unico forward pass. Esto garantiza que la respuesta siempre caiga dentro del conjunto de opciones suministrado y que cada decision cueste un solo paso de decodificacion. El adaptador de Uncertainty produce puntuaciones de certeza calibradas de forma que, entre las respuestas asignadas a un X %, aproximadamente un X % resultan correctas. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Atribucion de contexto: predice que frases del contexto (documentos y turnos previos de conversacion) influyeron en cada frase de la respuesta, ordenandolas por importancia.
- Decision: selecciona la mejor opcion de un conjunto fijo y devuelve una probabilidad sobre todas ellas; soporta preguntas de tipo `choice` (mejor de N), `noul` (si/no) y `score` (ordinal 0..N).
- Verificacion de requisitos: emite un juicio binario si/no sobre si una generacion del asistente satisface un conjunto de requisitos definidos por el usuario (formato, contenido, estructura, control de calidad).
- Incertidumbre calibrada: calcula un porcentaje de certeza sobre la respuesta del asistente con calibracion empirica.
- Integracion con tooling: invocacion a traves del framework Mellea, que expone los adaptadores como "intrinsics".
- Verificacion de integridad: cada adaptador incluye firma Sigstore (`model.sig`) verificable con la herramienta `model-signing`.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: no se documentan modos de razonamiento extendido, vision ni audio en la informacion disponible.

## Casos de uso

- Auditoria de respuestas en atencion al cliente: usar el adaptador de Context Attribution para identificar que fragmentos de la documentacion o de los turnos previos sustentan cada frase de la respuesta, facilitando la revision por parte de agentes humanos y el cumplimiento normativo.
- Enrutamiento de tickets con Decision: dado el texto de un ticket y un conjunto cerrado de categorias, el adaptador devuelve la categoria mas probable y una distribucion de probabilidad sobre todas ellas en un solo paso de decodificacion, lo que permite umbrales de confianza y escalado automatico.
- Control de calidad de generaciones en pipelines: aplicar Requirement Check para validar que las salidas cumplen requisitos de formato (por ejemplo, JSON valido, longitud, campos obligatorios) antes de publicarlas o enviarlas a un sistema posterior.
- Filtrado por confianza en produccion: emplear Uncertainty para asignar un porcentaje de certeza a cada respuesta y derivar a revision humana aquellas por debajo de un umbral calibrado.
- Clasificacion binaria y ordinal: usar Decision con preguntas `noul` (si/no) para moderacion o deteccion de intencion, y con `score` para puntuaciones ordinales como prioridad o satisfaccion.
- Verificacion de instrucciones en agentes multi-paso: comprobar tras cada paso si la accion cumple las restricciones declaradas por el usuario antes de continuar la cadena de razonamiento.
- Analisis de causas raiz en soporte tecnico: combinar Context Attribution con Uncertainty para reconstruir que evidencia sustento un diagnostico y con cuanta confianza se emitio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; depende del modelo base. Como referencia general de la familia Granite 4.x, `granite-4.0-micro` y `granite-4.1-3b` caben en GPUs consumer de 8-16 GB en cuantizacion de 4 bits, `granite-4.1-8b` requiere aproximadamente 16-24 GB en cuantizacion y `granite-4.1-30b` requiere GPUs de 40-80 GB o cuantizacion agresiva.
- GPUs recomendadas: no especificadas por el autor. Para los modelos base de 8B y 30B se recomiendan A100, H100 o L40S; para las variantes pequenas, RTX 4090 o RTX 3090.
- Compatibilidad con GPU consumer: si, para `granite-4.0-micro` y `granite-4.1-3b`; `granite-4.1-8b` es viable en GPUs de 24 GB; `granite-4.1-30b` no cabe en una unica GPU consumer sin cuantizacion.
- Opciones de despliegue: el autor recomienda el framework Mellea para invocar los adaptadores; al ser adaptadores PEFT, son compatibles con el ecosistema Hugging Face (transformers + peft), y por extension con servidores de inferencia que soporten LoRA, aunque no se documentan integraciones explicitas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El adaptador de Decision anade un unico paso de decodificacion por decision, lo que minimiza la sobrecarga respecto a generacion autoregresiva completa.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite Core Library | Adaptadores LoRA/aLoRA sobre Granite 4.x | No disponible (hereda del base) | No disponible | Apache 2.0 | Hugging Face, firmado |
| Modelos base Granite 4.x | LLM generativos | 1B-30B aprox. (segun variante) | No disponible | Apache 2.0 | Hugging Face |
| Adaptadores de atribucion/incertidumbre de terceros | LoRA especializados | No disponible | No disponible | Variable | No disponible |

No se dispone de informacion sobre alternativas directas comparables en la informacion proporcionada; el repositorio es una propuesta especifica de IBM integrada en su ecosistema Granite y Mellea.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta garantizado.
- Los adaptadores no son modelos autonomos: requieren cargar el modelo base correspondiente y la version del adaptador debe coincidir con la variante base (micro, 3b, 8b o 30b).
- El adaptador de Decision solo esta disponible para `granite-4.1-8b` y `granite-4.1-30b`; no cubre las variantes menores.
- La calibracion de Uncertainty es empirica y depende de la distribucion de datos de calibracion; puede degradarse fuera de ese dominio.
- Riesgo de alucinacion heredado del modelo base: los adaptadores anaden senales de fiabilidad, pero no eliminan errores factuales.
- No se documentan sesgos especificos en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la firma de integridad de cada adaptador antes de desplegarlo.
- La integracion recomendada es via Mellea; otros frameworks requieren cargar manualmente los pesos PEFT y respetar el formato de E/S descrito en cada `io.yaml`.
- No se especifican requisitos de hardware ni latencias, por lo que el dimensionamiento debe hacerse a partir del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibm-granite/granitelib-core-r1.0
- Modelo base granite-4.0-micro: https://huggingface.co/ibm-granite/granite-4.0-micro
- Modelo base granite-4.1-3b: https://huggingface.co/ibm-granite/granite-4.1-3b
- Modelo base granite-4.1-8b: https://huggingface.co/ibm-granite/granite-4.1-8b
- Modelo base granite-4.1-30b: https://huggingface.co/ibm-granite/granite-4.1-30b
- Framework Mellea: https://mellea.ai
- Ejemplos de adaptadores en Mellea: https://github.com/generative-computing/mellea/tree/main/docs/examples/intrinsics
- Herramienta de verificacion de firmas: https://github.com/sigstore/model-transparency
