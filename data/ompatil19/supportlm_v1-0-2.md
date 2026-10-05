# Ompatil19/SupportLM_V1.0.2

## Resumen

SupportLM V1.0.2 es un adaptador LoRA (PEFT) desarrollado por Om Patil que convierte el modelo base Qwen/Qwen2.5-1.5B-Instruct en un asistente de triaje de tickets de soporte al cliente. Dado un unico mensaje de entrada, el modelo devuelve un unico objeto JSON con cinco campos fijos: `emotion`, `urgency`, `summary`, `next_action` y `suggested_reply`. El objetivo es enrutar y redactar borradores de respuesta para agentes humanos, no sustituirlos.

El repositorio contiene unicamente el delta LoRA de 10,6 millones de parametros (unos 40 MB); los pesos del modelo base no estan incluidos y deben cargarse por separado. El adaptador se entrenó sobre datos sinteticos de una marca ficticia de comercio electronico (ShopNova) e intenciones cercanas a salud y finanzas, exclusivamente en ingles.

Es relevante como ejemplo de microespecializacion sobre un modelo pequeno (1,5B) con salida estructurada y taxonomia cerrada de 42 acciones, pero tambien como caso de estudio de los limites de las finetunes sinteticas: en la evaluacion sobre 600 tickets retenidos, el campo `next_action` alcanza solo un 56,3 % de acierto y `suggested_reply` fabrica importes en aproximadamente el 59 % de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA (PEFT) |
| Parametros totales | ~1,54B en el modelo base + 10,6M en el delta LoRA |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct; no especificada en la model card del adaptador) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | Ingles (el adaptador); el modelo base soporta multiples idiomas, pero el adaptador solo fue entrenado en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, ~40 MB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con 1,54B parametros. La finetune se realizó con LoRA sobre el modelo base y el resultado es un delta de 10,6M parametros que se carga junto a los pesos originales mediante `PeftModel`. No se ha publicado ningun paper asociado al modelo.

Los datos de entrenamiento son completamente sinteticos (`llm_generated_v6_augmented`, con licencia CC0-1.0) y cubren una marca ficticia de retail llamada ShopNova, ademas de intenciones cercanas a salud y finanzas. Cada fila de entrenamiento usa un formato de prompt fijo: mismas instrucciones, misma lista de campos y mismo orden. La model card advierte que cambiar el formato o eliminar la lista de campos degrada los resultados. El modelo fue entrenado con una persona (nombre del asistente) distinta de la que aparece en el prompt de ejemplo de la model card; el autor lo describe como un pequeno desplazamiento de distribucion no medido sobre el conjunto de test completo. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto con salida estructurada en JSON de cinco campos fijos.
- Clasificacion de emocion en siete categorias: Angry, Frustrated, Confused, Anxious, Neutral, Polite, Happy.
- Clasificacion de urgencia en cuatro niveles: Low, Medium, High, Critical.
- Resumen de un ticket en una sola frase de un maximo de 25 palabras.
- Prediccion de `next_action` sobre una lista cerrada de 42 constantes de accion (por ejemplo `FIX_PAYMENT`, `CHECK_SHIPMENT`, `PROCESS_REFUND`, `ESCALATE_HUMAN`).
- Redaccion de una respuesta breve y profesional como borrador.
- Uso de marcadores de posicion `[ORDER_ID]`, `[DATE]` y `[AMOUNT]` en lugar de inventar datos cuando faltan especificos.
- Procesamiento de un unico mensaje de cliente por inferencia (no esta descrito como modelo conversacional multi-turno).

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio.

## Casos de uso

- Triaje automatizado de bandeja de entrada: el modelo clasifica emocion y urgencia de cada ticket para priorizar la cola de trabajo. Es util como capa de enrutamiento previa a un agente humano, teniendo en cuenta que `next_action` solo acierta en torno al 56 % de los casos.
- Borrador de respuestas para agentes: `suggested_reply` sirve como punto de partida editable por una persona. Nunca debe enviarse sin revision, ya que fabrica importes en cerca del 59 % de las respuestas.
- Etiquetado de urgencia y sentimiento en analitica de soporte: agregar los campos `emotion` y `urgency` sobre volumenes de tickets para construir cuadros de mando de carga operativa.
- Enrutamiento por intencion hacia colas especializadas: usar `next_action` como pista de priorizacion (no como disparador automatizado) para dirigir tickets a equipos de pagos, envios o reembolsos.
- Resumen de tickets para traspaso entre turnos: el campo `summary` (una frase, maximo 25 palabras) puede alimentar notas de escalado o resumenes de cola.
- Prototipado rapido de asistentes de soporte: al ser un adaptador de 40 MB sobre un modelo de 1,5B, permite experimentar con triaje estructurado en hardware modesto y validar un formato de salida antes de invertir en modelos mayores.
- Investigacion sobre finetunes sinteticas: sirve como caso de estudio reproducible de los limites de entrenar con datos 100 % sinteticos y taxonomias cerradas desequilibradas.

## Benchmarks y rendimiento

Datos reportados sobre 600 tickets retenidos:

| Metrica | Valor |
|---|---|
| Precision de `next_action` (adaptador) | 56,3 % |
| Precision de `next_action` (modelo base) | 1,2 % |
| Clase mayoritaria de `next_action` | ~23 % de los tickets de test |
| Fabricacion de importes en `suggested_reply` | ~59 % |
| Fabricacion de nombres en `suggested_reply` | 8,7 % |
| Fabricacion de IDs de pedido en `suggested_reply` | 5,5 % |

La model card declara metricas de `accuracy` y `rouge`, pero la tabla completa de evaluacion no esta disponible en la informacion proporcionada (el contenido se corta antes de mostrarla). La model card tambien advierte que la taxonomia de `next_action` esta desequilibrada: la clase mayoritaria por si sola supera la precision del modelo, por lo que el 56,3 % debe interpretarse con cautela.

## Requisitos de hardware

- VRAM para el modelo base en bf16/fp16: aproximadamente 3 GB, mas el pequeno delta LoRA de 40 MB.
- VRAM en cuantizacion int8: en torno a 1,5-2 GB; en int4/GGUF Q4: alrededor de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB, como RTX 3060, RTX 4060 o superiores; tambien cabe en RTX 4090, A100 y H100 sin problema, aunque es un modelo pequeno que no los aprovecha.
- Cabe ampliamente en GPU de consumo. Un unico modelo de 1,5B en bf16 ocupa unos 3 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` (la ruta documentada en la model card), vLLM con soporte de adaptadores LoRA, y, previa fusion del adaptador con el modelo base, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento en triaje |
|---|---|---|---|---|---|
| SupportLM V1.0.2 | ~1,54B + 10,6M LoRA | 32.768 tokens (base) | Triaje JSON de soporte | apache-2.0 | `next_action` 56,3 %; fabrica importes ~59 % |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens | Instrucciones generales | apache-2.0 | `next_action` 1,2 % (no entrenado para la tarea) |
| Otros adaptadores de triaje comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks que permitan comparar este adaptador con alternativas equivalentes de triaje de tickets.

## Limitaciones y advertencias

- `suggested_reply` fabrica especificos en aproximadamente el 59 % de las respuestas cuando se trata de importes, un 8,7 % de nombres y un 5,5 % de IDs de pedido. Es un borrador para edicion humana, nunca texto listo para enviar.
- `next_action` solo acierta en el 56,3 % de los casos y la taxonomia esta desequilibrada (una clase concentra cerca del 23 % de los tickets). Debe usarse como pista de priorizacion, no como disparador automatico de flujos.
- Los datos de entrenamiento son integramente sinteticos y de una unica marca ficticia (ShopNova). El modelo no ha visto tickets reales.
- El modelo es solo para ingles y no se documento ninguna evaluacion de seguridad ni de privacidad.
- No es robusto frente a ataques adversarios: el texto del ticket es entrada no confiable y no se probó como vector de inyeccion de prompt. Cualquier ticket deberia tratarse como potencial inyeccion si la salida se usa en un sistema.
- El formato de prompt es fijo (misma instruccion, misma lista de campos, mismo orden). Sustituirlo o eliminar la lista degrada los resultados.
- La persona (nombre del asistente) usada en el prompt de la model card difiere de la empleada en el entrenamiento; se comprobó con una muestra de 10 filas pero no se midió sobre el conjunto de test completo.
- Licencia apache-2.0, heredada del modelo base, pero no se documentan consideraciones adicionales para uso comercial.
- El repositorio no incluye los pesos del modelo base; el adaptador por si solo no es funcional.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Ompatil19/SupportLM_V1.0.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper: ninguno (la model card indica que no ha sido publicado en ningun paper).
- Repositorio de datos: no disponible.
- Demo: no disponible.
- Blog o discusion: no disponible.
