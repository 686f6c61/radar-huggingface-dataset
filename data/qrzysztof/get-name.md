# Qrzysztof/get-name

## Resumen

`get-name` es un adaptador LoRA de pequeño tamaño, desarrollado por Qrzysztof, que afina el modelo base `Cactus-Compute/needle2` (de la familia cactus-needle) para una tarea muy concreta: extraer el nombre de pila de la persona destinataria o protagonista de un texto. El modelo responde a la pregunta "¿de quién trata este texto o a quién va dirigido, y cuál es su nombre de pila?" y solo invoca una herramienta (tool calling) cuando existe una persona objetivo clara.

El modelo se distribuye como un archivo de pesos `.cact` de 13,7 MB, diseñado para el motor de inferencia `needle` de cactus-needle. Su principal valor es la especialización: en lugar de un modelo generalista, ofrece una extracción de nombres precisa y determinista, con reglas explícitas para distinguir entre menciones pasivas y destinatarios reales. Además, al ser extremadamente ligero, puede ejecutarse íntegramente en el navegador mediante una compilación WebAssembly, sin necesidad de servidor ni backend.

La relevancia actual radica en su enfoque minimalista: mientras la mayoría de modelos de extracción de entidades requieren infraestructura pesada, este adaptador demuestra que una tarea de NLP acotada puede resolverse con un artefacto de menos de 14 MB, con rendimiento en tiempo real y despliegue en entornos estáticos. Está pensado para desarrolladores que necesitan una solución de extracción de nombres rápida, integrable en pipelines de tool calling y con requisitos de hardware prácticamente nulos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre cactus-needle (Cactus-Compute/needle2); arquitectura base no especificada |
| Parametros totales | no disponible (adaptador LoRA de 13,7 MB en pesos `.cact`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit y 4-bit (mencionado en la compilacion WASM) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (formato propietario de cactus-needle) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo base `Cactus-Compute/needle2`. Se sabe que `get-name` es un ajuste fino de tipo LoRA (Low-Rank Adaptation) sobre ese modelo, lo que implica que solo se entrenan matrices de bajo rango sobre los pesos congelados del modelo base. El adaptador se entrena sobre el dataset `cactus-needle/base`, aunque no se especifican el numero de tokens, la composicion exacta del dataset ni el metodo de alineacion (RLHF, DPO, etc.).

La innovacion principal reside en el diseño de la tarea: el modelo se entrena para decidir si existe o no una persona destinataria en el texto y, en caso afirmativo, devolver solo su nombre de pila (nunca el apellido). El entrenamiento incluye ejemplos negativos (saludos grupales, menciones pasivas, nombres de lugares, asistentes virtuales) para que el modelo aprenda a no invocar la herramienta cuando no procede. La model card indica que el system prompt es obligatorio en inferencia, ya que se incluyó en todos los ejemplos de entrenamiento.

## Capacidades

- Extraccion del nombre de pila de la persona destinataria o protagonista de un texto.
- Distincion entre destinatario real y menciones pasivas (p. ej., "Mi hermano Carl vive en Boston" no genera llamada).
- Preferencia por la persona directamente interpelada en enumeraciones (p. ej., "you, Greg" frente a "el equipo era Carl, Stephanie y Greg").
- Colapso de nombres completos al nombre de pila (John Snow → John).
- Soporte de tool calling: genera una llamada a la herramienta `extract_name` con el parametro `name` solo cuando existe una persona objetivo.
- Ejecucion en navegador via WebAssembly, sin servidor ni backend.
- Rendimiento de ~50 tokens/s en Apple Silicon o Chrome de escritorio (con pesos cuantizados 2-bit/4-bit).

## Casos de uso

- Atencion al cliente automatizada: en un chatbot de soporte, el modelo identifica al usuario por su nombre a partir del primer mensaje ("Hola, soy Laura, tengo un problema con mi pedido") y lo usa para personalizar la respuesta sin necesidad de un modulo separado de NER.
- Enrutamiento de mensajes en sistemas de tickets: extraer el destinatario de un correo o mensaje interno para asignarlo al agente correcto, usando la llamada a la herramienta como disparador de una accion en el flujo de trabajo.
- Preprocesamiento de conversaciones para CRM: en herramientas de ventas, detectar el nombre del interlocutor en transcripciones de llamadas o chats y actualizar automaticamente el campo correspondiente en el registro del cliente.
- Asistentes de correo electronico: al redactar una respuesta, el modelo identifica a quien va dirigido el mensaje y sugiere el saludo inicial ("Hola, Ana") sin intervencion manual.
- Pruebas de sistemas de tool calling: como componente de validacion en pipelines de agentes, verificando que el modelo solo invoca la herramienta cuando existe un destinatario real, sirviendo de caso de prueba para el motor `needle`.
- Demostraciones y prototipos en el navegador: al ser un artefacto estatico de ~14 MB, puede integrarse en paginas web estaticas (GitHub Pages, Vercel) para crear demos interactivas de extraccion de entidades sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (model-index vacio) ni comparaciones con otros modelos. El unico dato de rendimiento mencionado es la velocidad de inferencia de ~50 tokens/s en el navegador con cuantizacion 2-bit/4-bit.

## Requisitos de hardware

- Inferencia en navegador: requiere ~700 MB de RAM pico (segun la documentacion del WASM) y un navegador moderno con soporte WebAssembly.
- Descarga total: ~13,7 MB (pesos) + ~325 KB (motor WASM) + ~62 KB (glue JS).
- No requiere GPU ni CPU especializada; funciona en cualquier dispositivo con navegador reciente (probado en Apple Silicon y Chrome de escritorio).
- Despliegue nativo: el motor `needle` de cactus-needle ofrece bindings de Python, por lo que puede ejecutarse en CPU convencional.
- Opciones de despliegue: servidor estatico (GitHub Pages, Vercel, `python3 -m http.server`), o integracion en aplicaciones Python mediante el paquete `needle`.
- Latencia: no especificada, pero la velocidad de ~50 tokens/s en navegador sugiere una latencia de decenas de milisegundos para entradas cortas (típicamente menos de 20 tokens).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de extraccion de nombres o entidades. El modelo es un adaptador especializado sobre una arquitectura propietaria (`cactus-needle`), por lo que no existen equivalentes directos con las mismas caracteristicas (tamano, formato `.cact`, ejecucion en navegador). Como referencia general, se podrian considerar modelos NER clasicos como spaCy o Stanford NER, pero no son comparables en cuanto a formato, licencia ni caso de uso especifico (tool calling con decision de invocacion).

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha entrenado para otros idiomas.
- No distingue entre nombres de pila ambiguos ni maneja variaciones culturales en la estructura de nombres (p. ej., nombres compuestos o apellidos usados como nombre).
- La decision de invocar o no la herramienta depende del system prompt exacto; si se modifica, el comportamiento puede degradarse.
- El formato de pesos `.cact` es propietario de cactus-needle; no es compatible con frameworks estandar como Transformers o llama.cpp.
- No se han publicado evaluaciones de sesgos ni pruebas de robustez ante entradas adversariales (p. ej., textos con ironia, sarcasmo o referencias indirectas).
- Al ser un adaptador LoRA, hereda las limitaciones del modelo base `Cactus-Compute/needle2`, cuya arquitectura y datos de entrenamiento no estan documentados publicamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no especificadas en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qrzysztof/get-name
- Modelo base: https://huggingface.co/Cactus-Compute/needle2
- Dataset de entrenamiento: https://huggingface.co/datasets/cactus-needle/base
- Motor `needle` (referencia en la model card): no se proporciona enlace directo, pero se menciona como parte del ecosistema cactus-needle.
