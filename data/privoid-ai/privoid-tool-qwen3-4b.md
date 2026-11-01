# Privoid-ai/Privoid-Tool-Qwen3-4B

## Resumen

Privoid-Tool-Qwen3-4B es un adaptador LoRA desarrollado por Privoid-ai sobre el modelo base Qwen/Qwen3-4B, orientado especificamente a la generacion de propuestas de llamadas a herramientas (tool calling) en entornos empresariales. Su proposito no es ser un chatbot generalista, sino convertir peticiones de empleados en llamadas correctas a APIs internas, solicitar informacion cuando falta, y rechazar peticiones que sus herramientas no pueden cubrir. Mantiene el formato nativo de tool-call de Qwen3 y se distribuye bajo licencia Apache-2.0.

El modelo aborda un problema concreto: los modelos base tienden a invocar herramientas casi siempre, incluso cuando no procede, lo que genera llamadas erroneas en produccion. Este adaptador reduce la tasa de llamadas innecesarias del 27,2 % al 4,1 % en su conjunto de evaluacion, a costa de una ligera perdida en seleccion de herramienta y validez de esquema. La evaluacion se realizo sobre 930 ejemplos de test retenidos, comparando el modelo base sin modificar con el adaptador.

Se trata de un lanzamiento experimental: la mayor parte de los datos de evaluacion son sinteticos y el benchmark independiente When2Call obtuvo una puntuacion notablemente inferior (0,613 frente al 0,942 del test propio). El adaptador propone llamadas pero nunca las ejecuta, y esta pensado para equipos que construyen asistentes internos privados sobre un catalogo de herramientas definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ejemplos de entrenamiento limitados a 1.024 tokens) |
| Tipos de cuantizacion | no disponible (no se probo GGUF con este adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre Qwen3-4B, un transformer denso de 4.000 millones de parametros. Conserva el formato nativo de tool-call de Qwen3, con el modo de razonamiento (thinking) desactivado. El entrenamiento se realizo sobre tres conjuntos de datos de function calling: NousResearch/hermes-function-calling-v1, glaiveai/glaive-function-calling-v2 y nvidia/When2Call. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

El objetivo de entrenamiento cubre cinco comportamientos ponderados por igual en la metrica de tarea: invocar (call), preguntar (ask), rechazar (decline), responder (answer) y manejo seguro de resultados de herramienta adversariales. El entrenamiento se detuvo por agotar el presupuesto de tiempo, no por convergencia, y la validacion utilizo solo 151 ejemplos, por lo que el paso seleccionado es incierto. Se excluyeron los ejemplos de mas de 1.024 tokens.

## Capacidades

- Generacion de propuestas de llamada a herramienta en el formato nativo de Qwen3 (`<tool_call>` con nombre y argumentos en JSON).
- Seleccion entre herramientas competidoras cuando varias podrian aplicar a la peticion.
- Solicitud de informacion adicional cuando la peticion esta incompleta (por ejemplo, pide titulo y prioridad antes de crear un ticket).
- Rechazo explicito cuando no existe herramienta disponible para la tarea solicitada.
- Manejo seguro de resultados de herramienta adversariales: ignora instrucciones embebidas en la salida de una herramienta y las senala como contenido no confiable.
- Capacidad multilingue limitada al ingles.
- No soporta llamadas multiples (multi-call) en un mismo turno: solo llamadas simples.
- No ejecuta las llamadas: unicamente las propone.

## Casos de uso

- Asistente interno de operaciones: el modelo traduce peticiones como "consulta la factura INV-2048" en una llamada estructurada a `lookup_invoice`, adecuado porque mantiene el esquema JSON y reduce llamadas erroneas en un catalogo de herramientas definido.
- Mesa de ayuda y gestion de tickets: ante "crea un ticket de soporte", solicita los datos que faltan (titulo y prioridad) en lugar de inventar argumentos, lo que evita registros incompletos en produccion.
- Automatizacion de consultas financieras de solo lectura: distingue entre herramientas competidoras como `lookup_invoice` y `get_invoice_payment_status` segun la intencion de la consulta.
- Guardarrail frente a peticiones fuera de alcance: rechaza acciones para las que no existe herramienta (por ejemplo, transferir fondos a un proveedor), lo que permite construir interfaces que comuniquen limites con claridad.
- Defensa frente a inyeccion de prompts en resultados de herramientas: cuando una salida de API contiene instrucciones maliciosas, el modelo las ignora y lo declara, util para pipelines donde las herramientas devuelven contenido no confiable.
- Enrutamiento de intenciones hacia APIs internas: con un catalogo acotado de herramientas, el adaptador clasifica la peticion y emite la llamada con argumentos validos, integrble en un orquestador que valide el esquema antes de ejecutar.
- Prototipado de agentes de empresa con despliegue local: al ser un adaptador LoRA pequeno (repo de 0,1 GB) sobre Qwen3-4B, permite iterar sobre un modelo base privado sin salir de la infraestructura propia.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 930 ejemplos de test retenidos, comparando Qwen3-4B sin modificar con el adaptador:

| Medida | Qwen3-4B base | Privoid Tool | Cambio |
|---|---:|---:|---:|
| Puntuacion de tarea | 0,505 | 0,942 | +0,437 |
| Correccion de llamada completa | 0,704 | 0,893 | +0,189 |
| Correccion de argumentos | 0,704 | 0,893 | +0,189 |
| Precision de tool-call | 0,720 | 0,946 | +0,226 |
| Recall de tool-call | 0,947 | 0,932 | -0,015 |
| Seleccion de herramienta | 0,947 | 0,932 | -0,015 |
| Validez de esquema | 0,959 | 0,932 | -0,027 |
| Coincidencia con ejecucion simulada | 0,682 | 0,984 | +0,302 |
| Tasa de llamadas innecesarias (menor es mejor) | 0,272 | 0,041 | -0,232 |

Desglose por grupo de test:

| Grupo | Ejemplos | Base | Privoid Tool | Cambio |
|---|---:|---:|---:|---:|
| Resultados de herramienta adversariales | 38 | 0,000 | 1,000 | +1,000 |
| Herramienta no disponible | 72 | 0,056 | 0,972 | +0,917 |
| Retenido publico | 150 | 0,527 | 0,980 | +0,453 |
| Multi-turno | 74 | 0,635 | 1,000 | +0,365 |
| Herramientas conocidas, redaccion nueva | 121 | 0,686 | 0,983 | +0,298 |
| Benchmark When2Call | 181 | 0,354 | 0,613 | +0,260 |
| Herramientas competidoras | 80 | 0,738 | 0,963 | +0,225 |
| Herramientas no vistas | 70 | 0,786 | 0,957 | +0,171 |
| Peticiones ambiguas | 38 | 0,842 | 1,000 | +0,158 |
| Informacion faltante | 81 | 0,951 | 1,000 | +0,049 |
| Sin herramienta necesaria | 25 | 1,000 | 1,000 | +0,000 |

La mejora global en exito fue de +0,346, con un intervalo del 95 % de +0,251 a +0,444. El autor advierte que la mayoria de los datos de test son sinteticos y que en el benchmark independiente When2Call la puntuacion es de 0,613, mas representativa del rendimiento esperable en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Qwen3-4B requiere aproximadamente 8 GB en FP16 y alrededor de 3-4 GB en cuantizacion de 4 bits, pero el adaptador no se probo con cuantizaciones.
- GPU recomendadas: no disponible. El adaptador se probo unicamente con Transformers.
- Cabe en GPU de consumo: no confirmado por el autor; el modelo base Qwen3-4B es compatible con GPU de consumo, pero el adaptador no se valido en ese escenario.
- Opciones de despliegue: solo Transformers (probado). vLLM y GGUF no fueron probados con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid-Tool-Qwen3-4B | LoRA sobre 4B | no disponible | Tool calling empresarial | apache-2.0 | HuggingFace |
| Qwen3-4B (base) | 4B | no disponible | Modelo generalista con tool calling nativo | apache-2.0 | HuggingFace |
| Alternativas especificas de function calling de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con su modelo base: el adaptador mejora la puntuacion de tarea de 0,505 a 0,942 y reduce las llamadas innecesarias del 27,2 % al 4,1 %, con una ligera perdida en seleccion de herramienta y validez de esquema. No se dispone de datos de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion mayoritariamente sintetica: los escenarios empresariales son generados con datos ficticios. En el benchmark independiente When2Call la puntuacion es de 0,613, muy inferior al 0,942 del test propio.
- La puntuacion del 100 % en resultados adversariales cubre solo 38 ejemplos de los estilos de inyeccion probados; no constituye una garantia de seguridad. Deben mantenerse controles reales en la aplicacion.
- Sobreproteccion: puede rechazar peticiones que una herramienta si podria resolver. El autor documenta un caso en el que se nego a consultar el equipo de un empleado teniendo la herramienta adecuada disponible.
- Las puntuaciones de preguntar y rechazar son aproximadas: se juzgan por patrones de texto, no por evaluadores humanos.
- Solo llamadas simples: no se entrenaron ni probaron planes con multiples llamadas.
- El entrenamiento se detuvo por presupuesto de tiempo, no por convergencia; la validacion uso solo 151 ejemplos, por lo que el paso seleccionado es incierto.
- Limite de longitud: se excluyeron ejemplos de mas de 1.024 tokens, por lo que los catalogos de herramientas grandes no estan probados.
- Probado unicamente con Transformers; vLLM y GGUF no se validaron con este adaptador.
- Idioma limitado al ingles.
- Uso previsto restringido a asistentes internos sobre un catalogo de herramientas definido; no es un chatbot general.
- La aplicacion debe validar cada llamada contra su esquema y gestionar autorizacion y confirmacion: una salida del modelo nunca establece permisos.
- Riesgo de alucinacion en argumentos y en la seleccion de herramienta, atenuado pero no eliminado por el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Privoid-ai/Privoid-Tool-Qwen3-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset nvidia/When2Call: https://huggingface.co/datasets/nvidia/When2Call
