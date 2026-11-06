# sirappsec/tachles-qwen2.5-1.5b

## Resumen

Tachles es un adaptador LoRA de tipo PEFT publicado por sirappsec sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su objetivo no es ampliar las capacidades cognitivas del modelo base, sino modificar su estilo de comunicacion para adoptar la denominada "voz Tachles": una forma de escribir calmada, directa y orientada a la ingenieria, sin relleno, con voz activa, tiempo presente y una estructura clara de accion, impacto y siguiente paso.

El adaptador se entrena con un conjunto muy reducido de ejemplos (219 de entrenamiento y 45 de validacion) y un rango LoRA de 16 sobre las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj). El resultado es un adaptador de aproximadamente 17 MB que se carga sobre el modelo base de 1.500 millones de parametros de Qwen2.5, manteniendo la licencia Apache 2.0.

Es relevante para equipos que quieran estandarizar la comunicacion tecnica generada por un LLM (informes de estado, revisiones de PR, registros de decision, mensajes de standup) sin necesidad de reentrenar un modelo completo ni de asumir los costes de un modelo de mayor tamano. Al ser un adaptador pequeno y desacoplado, se puede versionar, intercambiar y combinar con el modelo base segun convenga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible (adaptador de ~17 MB; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) e hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA con rango 16 y alpha 32, aplicada exclusivamente a las proyecciones de atencion q_proj, k_proj, v_proj y o_proj del transformer Qwen2.5-1.5B-Instruct. Se entrena con dropout de 0,05, tasa de aprendizaje 2e-4, 3 epocas y un tamano de lote efectivo de 16 (2 por dispositivo con 8 pasos de acumulacion de gradiente). El conjunto de entrenamiento consta de 219 ejemplos y 45 de validacion, lo que indica un ajuste de estilo mas que una ampliacion de conocimiento.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la definicion explicita de una guia de estilo ("Action, Impact, Next", verbos llanos, voz activa, detalles concretos, elogio primero) que se inyecta tanto en los datos de entrenamiento como en el mensaje de sistema recomendado en la model card.

## Capacidades

- Generacion de texto con un estilo de comunicacion tecnica definido: directo, conciso, en voz activa y tiempo presente.
- Redaccion de actualizaciones de estado (standups), registros de decision, comentarios de revision de codigo y mensajes de empuje o desacuerdo constructivo.
- Reformulacion de frases pasivas o vagas a formulaciones activas y especificas.
- Respuestas breves y factuales a preguntas simples (por ejemplo, capitales).
- Soporte de conversacion multi-turno mediante la plantilla de chat de Qwen2.5.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (generacion, razonamiento basico, codigo), aunque el adaptador no las amplia.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Estandarizacion de actualizaciones de estado en equipos de ingenieria: el adaptador genera standups con estructura "haciendo, bloqueo, siguiente" y detalles concretos (por ejemplo, seguimiento de errores 401 en /api/login con Datadog), lo que reduce la variabilidad y el relleno en la comunicacion diaria.
- Revision de pull requests: produce comentarios que resumen el impacto medible de un cambio (por ejemplo, reduccion de latencia de 400 ms a 45 ms) y evitan lenguaje pasivo o vago.
- Registro de decisiones tecnicas: genera entradas de decision log con decision, justificacion, responsable y plan de rollback, utiles para documentacion de arquitectura.
- Reescritura de documentacion interna: convierte frases pasivas o corporativas en formulaciones activas y especificas, mejorando la legibilidad de manuales y runbooks.
- Asistencia en comunicacion de incidentes: redacta mensajes de estado y postmortems breves con hechos verificables y siguientes pasos, adecuado para canales de operaciones.
- Formacion y onboarding: sirve como ejemplo de comunicacion tecnica eficaz para nuevos miembros del equipo, mostrando respuestas modelo ante situaciones tipicas.
- Generacion de respuestas factuales breves en asistentes internos: apropiado para consultas simples donde se prioriza la concision sobre la profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parametros requiere aproximadamente 3 GB en FP16; en cuantizacion de 8 bits, alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB. El adaptador anade unos 17 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, RTX 3060); para mayor comodidad, RTX 4090 o A100/H100 si se sirven varias instancias o lotes grandes.
- Cabe en GPU consumer: si, en la mayoria de GPU modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con PEFT (indicado en la model card), vLLM con soporte de adaptadores LoRA, llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF, y TGI con adaptadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tachles (este adaptador) | 1.500 M (base) + adaptador LoRA | No disponible | Estilo de comunicacion de ingenieria | Apache 2.0 | Hugging Face (18 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | No disponible en esta ficha | Asistente generalista | Apache 2.0 | Hugging Face |
| Adaptadores LoRA de estilo sobre modelos pequenos | Variable | Variable | Ajuste de tono o formato | Segun autor | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador modifica el estilo, no el conocimiento: las capacidades factuales y de razonamiento siguen dependiendo del modelo base Qwen2.5-1.5B-Instruct, de 1.500 millones de parametros.
- Riesgo de alucinacion heredado del modelo base, especialmente en consultas tecnicas complejas o con datos actualizados.
- El conjunto de entrenamiento es muy reducido (219 ejemplos); el ajuste puede generalizar de forma limitada a dominios o formatos no representados.
- Idiomas declarados: ingles y hebreo; no se garantiza un comportamiento adecuado en castellano ni en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- No se documentan evaluaciones de sesgo, seguridad ni robustez; en produccion se recomienda validacion humana y filtros adicionales.
- El estilo "sin relleno" puede resultar demasiado escueto en contextos que requieran explicaciones extensas o matices.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sirappsec/tachles-qwen2.5-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria transformers: https://github.com/huggingface/transformers
