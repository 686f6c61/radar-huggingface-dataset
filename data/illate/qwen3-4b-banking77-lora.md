# illate/qwen3-4b-banking77-lora

## Resumen

illate/qwen3-4b-banking77-lora es un adaptador LoRA publicado por ILLATE sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su funcion es acotada y concreta: clasificar mensajes de clientes de banca en las 77 categorias de intencion del dataset Banking77 (PolyAI). No es un asistente bancario general ni un modelo conversacional, sino un clasificador de intenciones empaquetado como adaptador PEFT sobre un modelo de 4.000 millones de parametros.

El valor del artefacto esta en el enfoque de medicion. El autor lo plantea como un "parity check": comprobar si un modelo abierto pequeno que uno mismo puede desplegar iguala o supera a alternativas mas simples y cerradas en la misma tarea, evaluado sobre el conjunto de test completo de 3.080 mensajes. El adaptador alcanza un 94,0% de accuracy y un 94,0% de macro-F1, frente al 89,3% de una linea base TF-IDF con regresion logistica y al 63,1% del mismo Qwen3-4B sin ajuste fino con la lista de etiquetas en el prompt.

Es relevante para desarrolladores porque demuestra un flujo completo de ajuste eficiente: LoRA de rango 32 entrenado en unos 22 minutos sobre una unica NVIDIA L4, con decodificacion restringida a las 77 etiquetas para eliminar salidas invalidas, y despliegue con vLLM usando adaptadores LoRA. El repositorio ocupa 0,3 GB y la licencia del adaptador es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el adaptador LoRA anade un subconjunto pequeno de pesos (rango 32 sobre todas las proyecciones de atencion y MLP) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la informacion disponible; la hereda del modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors y se entreno en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (adaptador y modelo base). Datos de entrenamiento: Banking77, CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3 con aproximadamente 4.000 millones de parametros. El ajuste se realiza con LoRA de rango 32 y alpha 32, dropout 0.05, aplicado a todas las proyecciones de atencion y MLP. El entrenamiento usa el conjunto de entrenamiento de Banking77 (9.000 mensajes), reserva 1.003 mensajes como conjunto de desarrollo y deja intacto el conjunto de test oficial de 3.080 mensajes. Se ejecutan 2 epocas con learning rate 2e-4 y scheduler coseno, batch de 16, precision bf16, sobre una unica NVIDIA L4 en unos 22 minutos.

Una decision tecnica destacable es el uso de decodificacion restringida: la generacion solo puede emitir uno de los 77 nombres de etiqueta. Esto elimina las salidas invalidas, que el autor reporta como cero tanto en el adaptador como en la linea base. Con vLLM, la lista de etiquetas se pasa como salida estructurada de tipo `choice`. Las etiquetas son las del propio dataset, escritas por humanos, sin usar salidas de modelos cerrados. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Clasificacion de intenciones de banca: asigna un mensaje de cliente a una de las 77 categorias de Banking77 y responde con el nombre de la etiqueta.
- Generacion de texto como modelo base subyacente: el pipeline declarado es text-generation, aunque el adaptador esta especializado en clasificacion.
- Salida controlada: con decodificacion restringida (constrained decoding) o structured output en vLLM, se garantiza que la respuesta pertenezca al conjunto de 77 etiquetas.
- Bajo coste por peticion: latencia de 43 ms en p50 y 60 ms en p95 por mensaje sobre una NVIDIA L4, con unas 87 peticiones por segundo en vLLM a p95 de 0,55 s.
- Soporte multilingue: no. Entrenado y evaluado unicamente en ingles.
- Tool calling, agentes y razonamiento multi-paso: no declarados ni entrenados para esta tarea; el adaptador esta especializado en una unica funcion de clasificacion.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: cada mensaje entrante se clasifica en una de las 77 intenciones y se dirige al equipo o flujo automatico correspondiente. La latencia de decenas de milisegundos por mensaje permite procesar volumenes altos en tiempo real.
- Triaje previo a un asistente conversacional: usar el adaptador como primera etapa para detectar la intencion (por ejemplo, `card_arrival` o `lost_card`) y despues aplicar la respuesta o el flujo adecuado con otro sistema.
- Analitica de motivos de contacto: clasificar de forma masiva historicos de conversaciones para medir que intenciones generan mas volumen y detectar picos (por ejemplo, incrementos en `card_arrival`).
- Automatizacion de formularios y campos obligatorios: a partir de la intencion detectada, decidir que datos pedir al cliente antes de derivar la conversacion.
- Control de calidad y auditoria: etiquetar muestras de conversaciones reales para comprobar si se estan atendiendo correctamente los motivos declarados por el cliente.
- Motor de clasificacion self-hosted: desplegado con vLLM y decodificacion restringida, ofrece un clasificador propio en infraestructura controlada, sin dependencia de APIs externas, sobre una unica GPU.
- Filtrado y priorizacion de colas: combinar la etiqueta de intencion con reglas de negocio para priorizar mensajes de mayor criticidad dentro de la cola de atencion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test completo de Banking77 (3.080 mensajes). El campo `verified` esta marcado como falso en el model-index.

| Modelo | Accuracy | Macro-F1 | Salidas invalidas |
|---|---:|---:|---:|
| illate/qwen3-4b-banking77-lora (este adaptador) | 94,0% | 94,0% | 0 |
| TF-IDF + regresion logistica (linea base) | 89,3% | 89,3% | 0 |
| Qwen3-4B sin ajuste fino, lista de etiquetas en el prompt | 63,1% | no disponible | no disponible |

Datos adicionales reportados por el autor:

- Intervalo de confianza del 95% del adaptador: 93,1% a 94,8% (remuestreo bootstrap sobre los mensajes de test).
- Diferencia frente a la linea base TF-IDF: +4,7 puntos, con IC del 95% de +3,7 a +5,8 (bootstrap emparejado).
- Despliegue con vLLM sobre una L4: 93,9% de accuracy y unas 87 peticiones/s con p95 de 0,55 s.
- Errores mas frecuentes: confundir `fiat_currency_support` con `exchange_via_app` (5 veces) y `card_arrival` con `card_delivery_estimate` (4 veces), es decir, etiquetas casi duplicadas entre si.

## Requisitos de hardware

- VRAM para inferencia: el modelo base de 4.000 millones de parametros ocupa aproximadamente 8 GB en bf16/fp16 para los pesos, mas la cache KV. En cuantizacion de 4 bits se reduce a unos 2,5-3 GB para los pesos. Estas cifras son estimaciones a partir del tamano del modelo base; no estan declaradas en la informacion proporcionada.
- GPU recomendadas: el autor reporta entrenamiento y servicio sobre una NVIDIA L4 (24 GB). Tambien son adecuadas A100, H100, L40S y cualquier GPU con 16-24 GB o mas.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en bf16 con holgura, y en tarjetas de 12 GB como la RTX 3060 o la RTX 4070 si se cuantiza a 4 bits. El repositorio del adaptador ocupa solo 0,3 GB.
- Opciones de despliegue: vLLM con adaptadores LoRA (`vllm serve Qwen/Qwen3-4B-Instruct-2507 --enable-lora --lora-modules banking77=illate/qwen3-4b-banking77-lora`); tambien es posible cargarlo con transformers mas peft, y la cuantizacion del modelo base abre la puerta a llama.cpp u Ollama.
- Latencia y throughput: sobre una unica L4, p50 de 43 ms y p95 de 60 ms por mensaje (una peticion a la vez); con vLLM, unas 87 peticiones/s a p95 de 0,55 s.
- Requisito de implementacion: para reproducir los numeros reportados hay que usar decodificacion restringida a las 77 etiquetas; sin ella el modelo puede emitir ocasionalmente etiquetas inexistentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| illate/qwen3-4b-banking77-lora | ~4B (base) + adaptador LoRA | No especificado | 94,0% accuracy, 94,0% macro-F1 | Apache 2.0 | HuggingFace (peft) |
| AzadDjan/Qwen3-4B-banking77-lora | ~4B (base Qwen3-4B-Base) | No especificado | Valor no disponible en la busqueda | No disponible | HuggingFace |
| TF-IDF + regresion logistica | No es un modelo neuronal | No aplica | 89,3% accuracy, 89,3% macro-F1 | No disponible | Linea base local |
| Qwen3-4B-Instruct-2507 sin ajuste fino | ~4B | No especificado | 63,1% accuracy | Apache 2.0 | HuggingFace |

La comparativa directa con otras aproximaciones publicadas a Banking77 (por ejemplo, los sentence encoders duales de Casanueva et al., 2020, que es la referencia del dataset) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance cerrado: entrenado exclusivamente para las 77 intenciones de Banking77. No es un asistente bancario general y no debe usarse como tal.
- Solo ingles: no soporta otros idiomas y su rendimiento fuera del ingles no esta evaluado.
- Dominio y estilo: el dataset son mensajes de soporte cortos (un mensaje por ejemplo). El rendimiento sobre conversaciones multi-turno, textos largos o jerga propia de una entidad concreta puede diferir.
- Riesgo de confusion entre etiquetas proximas: los errores mas frecuentes reportados son entre categorias casi duplicadas (`fiat_currency_support` vs `exchange_via_app`, `card_arrival` vs `card_delivery_estimate`).
- Necesidad de decodificacion restringida: sin restriccion a la lista de etiquetas, el modelo puede generar etiquetas invalidas; los numeros reportados asumen restriccion.
- Riesgo de alucinacion: aunque la salida se limita a nombres de etiqueta, la asignacion de una intencion incorrecta es posible y no debe tratarse como una decision sin verificacion en flujos criticos.
- Datos publicos y benchmark conocido: Banking77 es publico, por lo que la accuracy reportada puede no trasladarse al trafico real de una entidad; el propio autor recomienda medir antes de confiar en el modelo.
- Resultados no verificados: el model-index marca `verified: false`; los datos proceden del autor.
- Licencia: tanto el adaptador como el modelo base son Apache 2.0, lo que permite uso comercial. Los datos de entrenamiento (Banking77) estan bajo CC BY 4.0, por lo que conviene respetar la atribucion correspondiente.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el artefacto.
- Fechas del repositorio: creado y actualizado el 2026-10-05 segun los metadatos disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/illate/qwen3-4b-banking77-lora
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Sitio del autor ILLATE: https://illate.dev/
- Alternativa comunitaria AzadDjan/Qwen3-4B-banking77-lora: https://huggingface.co/AzadDjan/Qwen3-4B-banking77-lora
- Tutorial de ajuste completo de Qwen3-4B en una H100 (Azure Databricks): https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
- Guia de fine-tuning de Qwen (AI Wiki): https://artificial-intelligence-wiki.com/ai-development/training-and-fine-tuning/qwen-fine-tuning-guide/
- Articulo sobre fine-tuning de Qwen3-4B en Banking77: https://aiweekender.substack.com/p/how-i-fine-tuned-qwen3-4b-on-a-single
- Contacto del autor: poojith@illate.dev
