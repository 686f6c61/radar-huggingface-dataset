# erangamapa/intent-router-gemma-2-2b-lora

## Resumen

`erangamapa/intent-router-gemma-2-2b-lora` es un adaptador LoRA construido sobre el modelo base `google/gemma-2-2b-it`, publicado por el usuario erangamapa en Hugging Face. Su funcion es actuar como enrutador de intenciones (*intent router*) en el dominio de apuestas deportivas (*sportsbook*): recibe un mensaje de cliente y lo clasifica en una unica etiqueta de intencion, que determina que agente downstream debe gestionarlo. Las intenciones no reconocidas se derivan a la categoria `other`.

El adaptador se distribuye como un repositorio PEFT con pesos en formato safetensors, licencia Apache 2.0 y pipeline `text-classification`. El modelo base Gemma 2 2B es un transformer decoder-only de aproximadamente 2.600 millones de parametros desarrollado por Google, con una ventana de contexto de 8.192 tokens; el adaptador hereda esas caracteristicas arquitectonicas y solo anade un cabezal de clasificacion entrenado sobre el modelo base congelado.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin datos publicados sobre idiomas soportados ni benchmarks externos. Su interes practico radica en el patron de diseno (modelo pequeno + LoRA + tarea de clasificacion cerrada) para pipelines de enrutamiento en produccion con coste de inferencia bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 2 2B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~2.600 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Gemma 2 2B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (la model card indica cobertura escasa de publicaciones no inglesas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (explicitamente, sin formatos basados en pickle) |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre `google/gemma-2-2b-it`, un transformer decoder-only con atencion multi-cabeza, RoPE y las optimizaciones de Gemma 2 (atencion alterna local/global y *logit soft-capping*). El entrenamiento congela los pesos del modelo base y ajusta matrices de bajo rango mas un cabezal de clasificacion que produce una etiqueta de intencion por mensaje.

Los datos de entrenamiento consisten en mensajes con estilo de cliente, cada uno con una unica intencion, escritos y revisados manualmente. El run utilizo 32.000 filas de entrenamiento y 4.000 de validacion con semilla 42. Segun la model card, las etiquetas provienen de un modelo maestro (*teacher*) con auditoria humana sobre una muestra, lo que introduce el riesgo de que el estudiante copie errores del maestro. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; el autor indica que todos los ejemplos de los fixtures publicos son sinteticos.

## Capacidades

- Clasificacion de texto en una unica etiqueta de intencion por mensaje (pipeline `text-classification`).
- Enrutamiento de mensajes de cliente hacia agentes downstream especializados.
- Fallback a la categoria `other` para intenciones desconocidas o ambiguas.
- No realiza apuestas ni acciones transaccionales: solo clasifica.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.
- Cobertura multilingue no documentada; la model card advierte de cobertura escasa en publicaciones no inglesas.

## Casos de uso

- Enrutamiento de atencion al cliente en un operador de apuestas: el modelo recibe el mensaje entrante y lo asigna al agente especializado (pagos, cuenta, bonos, reclamaciones) antes de que intervenga un LLM mayor, reduciendo coste por consulta.
- Triaje previo en un pipeline multiagente: al clasificar primero la intencion, se evita enviar cada mensaje a un modelo grande de proposito general, con lo que se reduce la latencia total del flujo.
- Clasificacion de tickets de soporte en lote: procesamiento batch de colas de correo o chat para etiquetar y priorizar antes de la revision humana.
- Deteccion de mensajes fuera de alcance: el fallback a `other` permite derivar consultas no cubiertas a un equipo humano o a un modelo mayor con contexto adicional.
- Enrutamiento en canales de bajo coste: al ser un adaptador sobre un modelo de 2B, puede desplegarse en una sola GPU consumer para servir clasificacion a alta concurrencia.
- Base para experimentacion interna: sirve como punto de partida para afinar un enrutador propio con datos de la organizacion, dado que el codigo y los pesos son abiertos con licencia Apache 2.0.

## Benchmarks y rendimiento

Los unicos datos publicados provienen del fichero de metricas del run de entrenamiento, no de una evaluacion externa independiente:

| Metrica | Valor |
|---|---|
| Accuracy | 0,952 |
| Macro F1 | 0,940 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con otros enrutadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, el modelo base Gemma 2 2B en FP16 ocupa aproximadamente 5-6 GB y en cuantizacion de 4 bits alrededor de 2 GB, mas el pequeno overhead del adaptador LoRA.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; A100, H100 o L40S para despliegues de alta concurrencia.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador cargado; llama.cpp u Ollama si se convierte a GGUF; el adaptador PEFT puede fusionarse con el modelo base para simplificar el despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. Como referencia estructural, podria compararse con otros enrutadores basados en modelos pequenos (por ejemplo, adaptadores LoRA sobre Qwen 2.5 1.5B o Llama 3.2 1B), pero no se han encontrado resultados de benchmarks que permitan una comparacion rigurosa.

| Modelo | Parametros base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| intent-router-gemma-2-2b-lora | ~2.600 M (Gemma 2 2B) | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Mensajes cortos o ambiguos se enrutan con frecuencia a `other`, lo que puede degradar la experiencia si el fallback no esta bien gestionado.
- Las etiquetas provienen de un modelo maestro con auditoria humana parcial: los errores del maestro pueden propagarse al estudiante.
- Cobertura escasa de ligas menores y de publicaciones en idiomas distintos del ingles; el rendimiento fuera de ese dominio no esta garantizado.
- Riesgo de alucinacion de etiqueta: al ser un clasificador cerrado, el riesgo se traduce en asignaciones erroneas mas que en texto inventado, pero el efecto operativo es similar.
- El modelo nunca coloca apuestas; cualquier integracion transaccional debe implementarse fuera del enrutador y con validacion adicional.
- No se documentan sesgos especificos mas alla de la cobertura limitada; conviene auditar el comportamiento en subpoblaciones antes de produccion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Gemma 2 tiene sus propios terminos de uso que deben respetarse.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/erangamapa/intent-router-gemma-2-2b-lora
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
