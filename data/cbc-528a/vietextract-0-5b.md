# cbc-528a/vietextract-0.5b

## Resumen

ViExtract-EC 0.5B es un modelo de extraccion de informacion en vietnamita desarrollado por el usuario cbc-528a, afinado mediante LoRA sobre Qwen/Qwen2.5-0.5B-Instruct. Su funcion es concreta y acotada: recibe un frame JSON plano con claves y valores `null` junto con un registro de chat, y devuelve exactamente el mismo objeto JSON con los valores rellenados a partir del texto. No es un asistente conversacional ni un generador de texto libre; es middleware de extraccion para integrarse como paso intermedio en un agente mayor.

La propuesta tecnica central es la extraccion agnostica al esquema: el modelo debe localizar el mismo dato independientemente de como se denomine la clave (`customer_name`, `ten_khach_hang`, `tên_khách_hàng`, `customerName`, `buyer_info`). Para ello se entreno con 20 subesquemas distribuidos en cuatro estilos de nomenclatura. El contrato de salida es estricto: los valores son subcadenas literales del chat, sin normalizacion, sin coercion de tipos y con `null` para la informacion ausente, lo que hace que cada salida sea verificable por comprobacion de subcadena.

Con 494 millones de parametros y licencia Apache 2.0, el modelo esta pensado para despliegues de bajo coste en entornos de atencion al cliente vietnamita (comercio electronico, hosteleria, belleza, reparaciones). Su interes actual reside en que demuestra que un modelo sub-1B puede superar a su base en adherencia al esquema y F1 de campo con un contrato de salida disenado para eliminar la fabricacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), afinado con LoRA sobre Qwen/Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (la model card solo documenta ejecucion en fp16 y fp32) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parametros, y se adapta mediante LoRA para una tarea unica de llenado de esquemas. La innovacion no esta en la arquitectura sino en el diseno del contrato: el prompt usa un bloque literal `### Instruction:` / `### Response:` que forma parte del modelo y no debe sustituirse por una plantilla de chat, y la decodificacion debe ser greedy, ya que el muestreo provoca que el modelo se salga del frame.

Los datos de entrenamiento son 12.492 conversaciones sinteticas en vietnamita en cuatro dominios (F&B/reparto, reservas de belleza y spa, comercio electronico y reparaciones del hogar), generadas por un profesor de 27B y degradadas con un pipeline de ruido de cuatro capas: formato, sintaxis, teencode y viet-glish condicionados por persona, y errores ortograficos. Se usan 20 subesquemas en cuatro estilos de nomenclatura para ensenar agnosticismo al esquema. La verdad de referencia se extrajo del texto ruidoso con JSON guiado, de modo que cada etiqueta es una subcadena literal de su entrada. El split se hizo por historia de conversacion: 11.245 de entrenamiento y 1.247 de validacion.

## Capacidades

- Extraccion de informacion estructurada: rellena un frame JSON plano con valores extraidos de un chat en vietnamita.
- Extraccion agnostica al esquema: reconoce la misma entidad bajo distintos nombres de clave y estilos de nomenclatura.
- Salida JSON estricta: devuelve exactamente el mismo conjunto de claves que la entrada, sin claves adicionales.
- Contrato verbatim: los valores son subcadenas literales del chat, sin normalizacion de numeros, fechas ni teencode.
- Manejo explicito de ausencia: devuelve `null` cuando el dato no aparece, nunca cadena vacia.
- Sin coercion de tipos: los numeros permanecen como cadenas hasta que el llamante los convierta.
- Sin resolucion de fechas: expresiones como `"mai 3h"` se devuelven tal cual.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al vietnamita.

## Casos de uso

- Extraccion de pedidos en comercio electronico: se pasa el historial de chat con el cliente y un frame con claves como nombre, telefono, direccion y producto; el modelo devuelve el JSON relleno listo para crear el pedido en el sistema. Es adecuado porque el dominio de e-commerce obtuvo F1 de span exacto de 0.911.
- Reservas en hosteleria y reparto: extraccion de fecha, hora, direccion y plato o pedido a partir de conversaciones de pedido, con F1 de 0.894 en el dominio F&B.
- Reserva de citas en belleza y spa: captura de servicio solicitado, nombre de cliente y preferencias horarias desde chats con teencode y errores ortograficos, con F1 de 0.869.
- Triage de solicitudes de reparacion: extraccion de tipo de averia, direccion y datos de contacto para generar ordenes de trabajo, con F1 de 0.851 en el dominio de reparaciones.
- Normalizacion como paso posterior en pipeline: el modelo entrega valores verbatim (por ejemplo `"50k"` o `"năm chục"`) y el llamante aplica su propia conversion a tipos y unidades, lo que permite auditar cada valor contra el texto original.
- Verificacion anti-alucinacion en produccion: como todos los valores deben ser subcadenas del chat, un validador puede anular cualquier campo que no aparezca literalmente en la entrada; en la evaluacion solo 1 de 1.688 campos predichos no aparecia en el chat.
- Integracion como middleware en agentes de atencion al cliente: el modelo actua como paso intermedio que convierte lenguaje natural en un objeto JSON que alimenta el resto del flujo, con latencia de 2,5 s por muestra en una GTX 1070 en fp32.

## Benchmarks y rendimiento

Evaluacion sobre 200 muestras sinteticas reservadas, en dominio, split por conversacion, decodificacion greedy y sin JSON guiado:

| Metrica | Qwen2.5-0.5B-Instruct (base) | ViExtract-EC 0.5B |
|---|---|---|
| Validez JSON | 100% | 100% |
| Adherencia al esquema (conjunto exacto de claves) | 98,5% | 100% |
| F1 de campo, span exacto | 0,068 | 0,873 |
| F1 de campo, normalizado (teencode/diacriticos) | 0,070 | 0,881 |
| F1 de campo, tolerante a fronteras | 0,142 | 0,933 |
| Coincidencia exacta del objeto completo | 0% | 34% |
| Sobreextraccion (no nulo donde la etiqueta es nula) | 10,5% | 10,7% |
| Latencia | 6,8 s/muestra | 2,5 s/muestra (GTX 1070, fp32) |

F1 de span exacto por dominio: e-commerce 0,911; F&B 0,894; belleza 0,869; reparaciones 0,851.

Notas del autor sobre la evaluacion: la coincidencia exacta del objeto completo es una metrica dura (con 5-8 campos por registro, una diferencia de frontera como `"Máy iPhone 12"` frente a `"iPhone 12"` invalida el objeto); la metrica tolerante a fronteras es la relevante para uso downstream. De las 50 sobreextracciones, una adjudicacion neutral determino que 23 eran errores de la etiqueta de referencia y el modelo tenia razon, 24 eran genuinas y 3 no eran ninguna de las dos; la sobreextraccion genuina es aproximadamente el 1,4% de los campos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la model card. Con 494 millones de parametros, los pesos en fp16 ocupan aproximadamente 1 GB y en fp32 unos 2 GB, mas el coste de activaciones y cache KV.
- GPU recomendadas: no disponibles en la model card; el autor reporta mediciones en una GTX 1070 en fp32.
- Cabe en GPU de consumo: si, dado el tamano del modelo; la model card no detalla que tarjetas concretas se han probado aparte de la GTX 1070.
- Opciones de despliegue: la model card documenta `transformers` con `torch.float16`, `attn_implementation="sdpa"` y `device_map`. El tag `text-generation-inference` y `endpoints_compatible` aparecen en los metadatos de Hugging Face. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2,5 s por muestra en GTX 1070 en fp32, con decodificacion greedy y `max_new_tokens=320`. El throughput no se detalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViExtract-EC 0.5B | 494 M | no disponible | Extraccion JSON guiada por esquema en vietnamita | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible | Asistente generalista multilingue | Apache 2.0 | Hugging Face |
| Alternativas especializadas en extraccion vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa disponible es con su modelo base: ViExtract-EC mejora el F1 de span exacto de 0,068 a 0,873 y la adherencia al esquema de 98,5% a 100%, a costa de perder capacidades generalistas y de limitarse al vietnamita y a la tarea de extraccion. No se dispone de datos de otros modelos comparables de extraccion estructurada en vietnamita en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintetico y en dominio: hilos reales de Zalo o Facebook obtendran puntuaciones inferiores; el autor anuncia una evaluacion en dominio real pero no la incluye.
- Riesgo de alucinacion bajo pero no nulo: en la evaluacion, 1 de 1.688 campos predichos no aparecia en el chat. El contrato verbatim permite anular por subcadena cualquier valor no presente.
- Sobreextraccion: 10,7% de campos no nulos donde la etiqueta era nula, aunque la adjudicacion indica que parte es ruido de etiqueta y la tasa genuina ronda el 1,4%.
- Restricciones de formato: solo acepta frames planos con valores `null`, sin objetos anidados, arrays ni envoltorios de tipo; devuelve exactamente las mismas claves.
- Dependencia del prompt literal: sustituir el bloque `### Instruction:` / `### Response:` por una plantilla de chat degrada la calidad.
- Decodificacion greedy obligatoria: el muestreo hace que el modelo se salga del frame.
- Sin normalizacion ni resolucion de fechas: el llamante debe convertir numeros, unidades y expresiones temporales.
- Cobertura linguistica limitada al vietnamita; no soporta otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias ni soporte del autor.
- Sin datos publicados sobre longitud de contexto efectiva ni sobre cuantizaciones soportadas, lo que limita la planificacion de despliegues con requisitos de memoria ajustados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbc-528a/vietextract-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
