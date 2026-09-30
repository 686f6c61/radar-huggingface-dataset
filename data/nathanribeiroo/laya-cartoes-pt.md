# nathanribeiroo/laya-cartoes-pt

## Resumen

laya-cartoes-pt es un checkpoint de decisión construido sobre Laya, un modelo abierto de tipo "System 1" que responde preguntas tipadas (elección entre opciones, sí/no) sobre una conversación, en lugar de generar texto libre. Lo publica el usuario nathanribeiroo y está especializado en atención de tarjeta de crédito en portugués: lee el diálogo entre cliente y operador y devuelve, en una sola pasada, el asunto del contacto y, cuando el asunto es una cancelación, el motivo, la etapa de retención, si el cliente habla de una tarjeta ya cancelada y cómo respondió a la última oferta.

Es un fine-tuning del checkpoint `multilingual` de convaiinnovations/laya, cuyo encoder es jhu-clsp/mmBERT-base. Tiene 321.908.998 parámetros, se distribuye en safetensors (0,7 GB) y usa licencia Apache 2.0. El entrenamiento se hizo sobre 800 conversaciones sintéticas en portugués, con calibración de temperatura por pregunta y una evaluación separada sobre 104 conversaciones escritas a mano.

Su relevancia es doble: ilustra un patrón poco habitual en producción, el de modelos de decisión compactos frente a modelos generativos para enrutado y etiquetado en contact center, y publica resultados con calibración explícita (ECE), incluida una suite de 83 casos difíciles donde el modelo falla de forma sistemática. El repositorio no tiene descargas ni valoraciones, por lo que no existe validación de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (jhu-clsp/mmBERT-base) con cabezas de decisión tipadas; modelo de decisión, no generativo |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La librería trunca la lista de turnos por el principio y preserva el turno más reciente, pero no se publica el límite en tokens |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el repo publica 0,7 GB en safetensors para 321,9 M de parámetros) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | convaiinnovations/laya, revisión `55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851` |
| Versión de pesos | `sha256:a7354c7c1ac6` |
| Fecha de creación en HuggingFace | 2026-09-30 |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder `jhu-clsp/mmBERT-base` y las cabezas de decisión de Laya, que resuelven cada pregunta como una elección cerrada. La API es `agent.system_one(conversa, perguntas)`: la conversación se pasa como lista de turnos ordenados de más antiguo a más nuevo, y las preguntas se declaran con un tipo (`choice`), unas instrucciones y un criterio por opción. La salida es un diccionario con la opción elegida y un campo `answer_confidence`; el autor advierte explícitamente de que `confidence` es una entropía y no sirve como umbral.

El fine-tuning siguió el bucle propio de Laya (gradiente de política con una regla de puntuación propia más entropía cruzada contra el objetivo), montando el ejemplo con la misma rutina que se usa en inferencia. Los datos son 800 conversaciones sintéticas en portugués con etiqueta por turno del cliente (2.713 turnos): 400 de cancelación, 70 de límite, 70 de compra denegada, 70 de compra no reconocida, 60 de fraccionamiento de factura, 60 de renegociación, 50 fuera de alcance y 20 sin asunto definido. La mitad de las conversaciones incluye una trampa deliberada (la palabra "cancelar" en una petición que no es una cancelación, amenaza de cancelación, motivo enunciado antes de la petición). No hay ninguna conversación real de cliente y solo un 5 % de la muestra fue revisada por una persona.

El entrenamiento se ejecutó en un Apple M5 sobre GPU (MPS) en fp32: 4 épocas, 840 actualizaciones, lote efectivo de 32 ejemplos, tasa de aprendizaje de 2,5e-5 en el encoder y 1e-4 en la cabeza, en 1,46 horas. De las 800 conversaciones, 720 se usaron para entrenar y 80 quedaron separadas para calibrar la temperatura (5,0 en las preguntas de elección y 3,9 en la de sí/no), valor que ya viene fijado en `rl_agent_config.json`. Las preguntas se entrenaron con un texto exacto: el de la pregunta de asunto está publicado, pero el de las otras cuatro (motivo con 13 opciones, etapa con 6, tarjeta ya cancelada con sí/no y aceptación con 4 opciones leídas sobre los últimos 4 turnos) no se publica.

## Capacidades

- Clasificación de asunto de un contacto de tarjeta de crédito en ocho categorías cerradas (cancelación, límite, compra denegada, compra no reconocida, fraccionamiento de factura, renegociación, fuera de alcance e indefinido).
- Clasificación del motivo de cancelación en 13 opciones.
- Identificación de la etapa del protocolo de retención en 6 opciones.
- Decisión binaria sobre si el cliente se refiere a una tarjeta ya cancelada.
- Lectura de la respuesta del cliente a la última oferta en 4 opciones, considerando solo los 4 turnos más recientes.
- Salida con confianza calibrada por pregunta (`answer_confidence`), apta para umbralizar.
- Procesamiento en una sola pasada, sin generación de texto; la salida es estructurada y verificable.
- No soporta tool calling, function calling, uso como agente multi-paso ni generación de código, matemáticas o visión.
- No es multilingüe: está entrenado y evaluado solo en portugués.

## Casos de uso

- Enrutado automático de contactos en un contact center: la pregunta de asunto decide a qué cola o equipo va la conversación antes de que intervenga un operador, con la ventaja de que la salida es una etiqueta cerrada y no texto que haya que parsear.
- Disparo de protocolos de retención: cuando el asunto es cancelación, el modelo identifica motivo y etapa, lo que permite activar el guion de retención adecuado en el momento del contacto.
- Asistencia al operador en tiempo real: mostrar en pantalla la etapa de retención y el motivo estimado reduce el tiempo que el agente dedica a reconstruir el contexto de la conversación.
- Analítica y reporting de cancelaciones: agregar los 13 motivos predichos sobre el histórico permite segmentar la pérdida de clientes por causa sin etiquetado manual.
- Detección de tarjeta ya cancelada: en la evaluación interna esta pregunta alcanzó el 100 % de acierto, por lo que es la candidata más clara para automatización completa dentro del flujo.
- Automatización del cierre de la retención: la pregunta de aceptación, leída solo sobre los últimos 4 turnos, permite saber si el cliente aceptó la oferta y cerrar el caso sin revisión humana.
- Auditoría de calidad: ejecutar el modelo sobre conversaciones cerradas para detectar contactos mal clasificados o guiones de retención no aplicados.
- Triaje con revisión humana: usar el umbral sobre `answer_confidence` para derivar a un operador únicamente los casos dudosos, aceptando que el autor documenta errores de alta confianza que el umbral no filtra.

## Benchmarks y rendimiento

Evaluación sobre 104 conversaciones escritas a mano que nunca entraron en el entrenamiento (363 llamadas al modelo), ejecutada en CPU. La columna "línea base" es responder siempre la opción más frecuente.

| Pregunta | Sin fine-tuning | Este checkpoint | Línea base (opción más frecuente) | ECE |
|---|---:|---:|---:|---:|
| Asunto | 63 % | 98 % | 46 % | 0,019 |
| Motivo | 28 % | 82 % | 14 % | 0,122 |
| Etapa | 21 % | 88 % | 50 % | 0,097 |
| Tarjeta ya cancelada | 6 % | 100 % | 95 % | 0,000 |
| Aceptación | 37 % | 91 % | 69 % | 0,072 |

Sobre una suite adicional de 83 casos difíciles, escritos uno a uno para provocar los errores caros ("não quero cancelar, só entender a anuidade", "perdi meu cartão, cancela ele", "não quero mais cancelar, pode aplicar o desconto"), el modelo acierta 62 de 83 (74,7 %) frente a 23 de 83 (27,7 %) sin fine-tuning.

## Requisitos de hardware

- Parámetros y huella: 321,9 millones de parámetros. En fp32 la inferencia ronda 1,3 GB de pesos; en 16 bits, unos 0,65 GB. El repositorio ocupa 0,7 GB en safetensors.
- GPU recomendadas: no se publica ninguna recomendación. Por tamaño, cabe con holgura en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPU de gama de entrada con 4 GB de VRAM.
- Cabe en GPU de consumo: sí, con margen amplio. También se ejecuta íntegramente en CPU: el ejemplo de la model card usa `device="cpu"` y la evaluación se hizo en CPU.
- Opciones de despliegue: la vía documentada es la librería `laya.agent.Agent` con `agent.system_one(...)` y `snapshot_download` de `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Entrenamiento: se completó en un Apple M5 por GPU (MPS) en fp32, con 840 actualizaciones y lote efectivo de 32 en 1,46 horas.
- Latencia y throughput: no disponibles. Solo se conoce el dato de entrenamiento indicado arriba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nathanribeiroo/laya-cartoes-pt | 321.908.998 | No disponible | Decisión tipada en portugués sobre atención de tarjeta de crédito | Apache 2.0 | HuggingFace |
| convaiinnovations/laya (checkpoint `multilingual`) | No disponible | No disponible | Decisión tipada multilingüe; modelo base del anterior | No disponible | HuggingFace |
| jhu-clsp/mmBERT-base | No disponible | No disponible | Encoder multilingüe; no es un modelo de decisión por sí mismo | No disponible | HuggingFace |
| r33drichards/laya-vision | No disponible | No disponible | Fork experimental de Laya que sustituye el encoder de texto por un modelo visión-lenguaje para entradas de imagen; no afiliado a Convai Innovations | No disponible | GitHub |

La información pública disponible no permite comparar estos modelos con alternativas de clasificación de intención en portugués (por ejemplo, clasificadores basados en BERTimbau) porque no se han facilitado sus parámetros ni sus resultados en este contexto.

## Limitaciones y advertencias

- No supera la suite de casos difíciles: 62 de 83, y algunos errores se producen con confianza alta, por lo que un umbral de confianza no los filtra.
- Los errores se concentran en dos patrones: la palabra "cancelar" dentro de una petición que no es una cancelación (pérdida, robo, cancelar otro servicio, "no quiero cancelar") y la aceptación con negación ("no quiero cancelar más, puede aplicar el descuento" leída como rechazo).
- El propio autor indica que el modelo no debe decidir solo en todas las respuestas: la regla de explotación medida deja decidir al modelo solo por debajo de un coste, con el asunto a partir de 0,98 salvo cuando la respuesta es cancelación.
- Datos de entrenamiento totalmente sintéticos, generados y etiquetados por un modelo de lenguaje siguiendo un plan sorteado, con solo un 5 % revisado por una persona. No incluye ninguna conversación real de cliente.
- Sesgos derivados del generador sintético y del procedimiento de una central concreta: el modelo reproduce las categorías y la terminología de ese protocolo, no un estándar del sector.
- Cuatro de las cinco preguntas se entrenaron con un texto que no está publicado, así que el comportamiento solo es reproducible con la pregunta de asunto; otra formulación no fue evaluada.
- Calibración desigual: el ECE de la pregunta de motivo es 0,122, frente a 0,000 en la de tarjeta ya cancelada. No conviene usar el mismo umbral para todas las preguntas.
- Solo portugués y solo atención de tarjeta de crédito. Fuera de ese dominio no hay ninguna garantía de comportamiento.
- Uso comercial: la licencia del checkpoint es Apache 2.0, pero no se especifica la licencia del modelo base convaiinnovations/laya ni la del encoder jhu-clsp/mmBERT-base, que conviene verificar antes de un despliegue en producción.
- Los pesos dependen de un `sha256` y de una revisión concreta del modelo base, además de la librería `laya`; un cambio en cualquiera de los dos invalida los umbrales y las temperaturas publicados.
- Confusión documentada entre `answer_confidence` (utilizable como umbral) y `confidence` (entropía, no utilizable). Usar el campo equivocado rompe cualquier política de derivación a humano.
- Repositorio con 0 descargas y 0 valoraciones: sin evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nathanribeiroo/laya-cartoes-pt
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Archivos del modelo base: https://huggingface.co/convaiinnovations/laya/tree/main
- Encoder: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Sitio del proyecto Laya: https://laya-ai.com/
- Playground: https://laya-ai.com/playground
- Fork experimental con visión: https://github.com/r33drichards/laya-vision
