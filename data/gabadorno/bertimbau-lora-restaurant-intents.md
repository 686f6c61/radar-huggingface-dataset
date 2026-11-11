# gabadorno/bertimbau-lora-restaurant-intents

## Resumen

BERTimbau-LoRA Restaurant Intents es un clasificador de intenciones de mensajes de clientes del sector de restauracion y food service en portugues de Brasil. Lo desarrolla Gabriel Adorno y se construye mediante fine-tuning eficiente con LoRA sobre el modelo preentrenado BERTimbau Base (`neuralmind/bert-base-portuguese-cased`), un transformer encoder de tipo BERT entrenado especificamente para portugues.

El modelo resuelve una tarea acotada y bien definida: asignar cada mensaje entrante a una de ocho categorias operativas (consulta de carta, realizacion de pedido, entrega, horario, reserva, reclamacion, cancelacion y otros). Con un adaptador LoRA de aproximadamente 301.064 parametros entrenables (el 0,27% del modelo base de unos 109 millones), es un ejemplo de adaptacion de bajo coste computacional orientada a produccion en atencion al cliente.

Su relevancia practica radica en la relacion entre coste y rendimiento: alcanza un 98,33% de exactitud en un conjunto de test separado con un entrenamiento de 5 epocas sobre 1.200 sentencias y una GPU Tesla T4, lo que lo hace desplegable en infraestructura modesta para enrutamiento de intenciones en chatbots y sistemas de ticketing en portugues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTimbau Base) con adaptadores LoRA |
| Parametros totales | ~109 M en el modelo base; ~301.064 parametros entrenables en el adaptador LoRA (0,27%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la inferencia de ejemplo usa `max_length=128` |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | Portugues (pt-BR) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base `neuralmind/bert-base-portuguese-cased` |
| Tarea | Clasificacion de texto / clasificacion de intenciones (8 clases) |
| Libreria | PEFT (compatible con transformers) |
| Tamano del repositorio | 0,0 GB (adaptadores de bajo rango) |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau Base, un transformer encoder bidireccional de tipo BERT con vocabulario y entrenamiento especificos para portugues. Sobre el se aplica un fine-tuning con LoRA: se congelan los pesos del modelo base y se entrenan matrices de descomposicion de bajo rango en las capas adaptadas, lo que reduce los parametros entrenables a unos 301.064. La cabeza de clasificacion se configura con `num_labels=8` para las ocho intenciones definidas.

El entrenamiento se realizo sobre un dataset de 1.200 sentencias balanceadas en portugues brasileno, durante 5 epocas, con batch size de 8 en entrenamiento y 16 en validacion, learning rate de 2e-4, weight decay de 0,01 y optimizador AdamW con decaimiento lineal, sobre una GPU NVIDIA Tesla T4. La model card no detalla la composicion exacta del dataset ni si hubo aumentacion de datos o tecnicas de regularizacion adicionales mas alla del weight decay. La evaluacion se hizo sobre un conjunto de test estrictamente separado de 180 ejemplos.

## Capacidades

- Clasificacion de texto en portugues de Brasil en ocho intenciones de dominio food service: `CONSULTAR_CARDAPIO`, `FAZER_PEDIDO`, `ENTREGA`, `HORARIO`, `RESERVA`, `RECLAMACAO`, `CANCELAMENTO` y `OUTROS`.
- Salida de probabilidades por clase mediante softmax, lo que permite umbrales de confianza y derivacion a atencion humana cuando la certeza es baja.
- Procesamiento de mensajes cortos de cliente con truncacion a 128 tokens en el ejemplo de inferencia.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo thinking.
- Capacidad multilingue limitada al portugues; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Enrutamiento de intenciones en chatbots de restaurantes: cada mensaje entrante se clasifica en una de las ocho categorias y se deriva al flujo conversacional correspondiente (pedido, reserva, reclamacion), reduciendo la necesidad de arboles de decision manuales.
- Triaje de bandeja de entrada en atencion al cliente: los correos o mensajes de WhatsApp se etiquetan automaticamente para priorizar reclamaciones y cancelaciones frente a consultas informativas.
- Deteccion temprana de cancelaciones: la clase `CANCELAMENTO` permite activar flujos de retencion o confirmacion con el cliente antes de que el pedido se pierda.
- Analitica de motivos de contacto: agregar las predicciones a lo largo del tiempo permite medir que porcentaje de mensajes son reclamaciones, consultas de entrega o reservas, y ajustar plantillas y tiempos de respuesta.
- Preclasificacion en sistemas de ticketing: integrado como primer paso de un pipeline, reduce el volumen de mensajes que llegan sin etiquetar a los agentes humanos.
- Filtrado y priorizacion en plataformas de delivery: clasificar los mensajes de clientes por urgencia operativa (cancelacion y reclamacion por delante de consulta de carta) para asignar recursos de soporte.
- Clasificacion en local o en dispositivos con recursos limitados: al ser un adaptador LoRA sobre un BERT Base, el coste de inferencia es bajo y puede ejecutarse en CPU para volumenes moderados, sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados publicados por el autor en un conjunto de test separado de 180 ejemplos:

| Metrica | Valor |
|---|---|
| Accuracy | 98,33% |
| F1 ponderado | 98,34% |
| Precision ponderada | 98,42% |
| Recall ponderado | 98,33% |

Desglose por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| CONSULTAR_CARDAPIO | 1,0000 | 0,9545 | 0,9767 | 22 |
| FAZER_PEDIDO | 0,9545 | 0,9545 | 0,9545 | 22 |
| ENTREGA | 0,9200 | 1,0000 | 0,9583 | 23 |
| HORARIO | 1,0000 | 1,0000 | 1,0000 | 23 |
| RESERVA | 1,0000 | 1,0000 | 1,0000 | 23 |
| RECLAMACAO | 1,0000 | 1,0000 | 1,0000 | 22 |
| CANCELAMENTO | 1,0000 | 1,0000 | 1,0000 | 23 |
| OUTROS | 1,0000 | 0,9545 | 0,9767 | 22 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El tamano del conjunto de test (180 ejemplos) implica intervalos de confianza amplios en las metricas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un BERT Base de ~109 M de parametros en fp32 ocupa aproximadamente 0,4-0,5 GB, y en fp16 alrededor de 0,2-0,3 GB. El adaptador LoRA anade unos pocos MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entreno en una NVIDIA Tesla T4. Tambien es viable en RTX 3060, RTX 4090, A100 o H100, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo y en CPU: la inferencia en CPU es practica para volumenes moderados dado el reducido tamano del modelo.
- Opciones de despliegue: transformers con PEFT (flujo documentado por el autor), y potencialmente ONNX Runtime o TorchScript tras exportacion; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por peticion en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gabadorno/bertimbau-lora-restaurant-intents | ~109 M base + ~301 K LoRA | no disponible (ejemplo a 128 tokens) | Clasificacion de intenciones en pt-BR (8 clases) | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased | ~109 M | 512 tokens (estandar BERT) | Modelo base enmascarado en portugues | no disponible en la informacion | Hugging Face |
| BERTimbau Large | ~335 M | 512 tokens (estandar BERT) | Modelo base enmascarado en portugues | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento de modelos alternativos de clasificacion de intenciones en portugues en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Dominio muy acotado: el modelo solo cubre ocho intenciones de food service en portugues de Brasil; mensajes fuera de ese dominio caeran previsiblemente en `OUTROS` o en clases incorrectas.
- Dataset de entrenamiento pequeno (1.200 sentencias) y conjunto de test de solo 180 ejemplos: las metricas del 98% deben interpretarse con cautela y validarse en datos reales de produccion.
- Riesgo de sobreajuste al estilo de redaccion del dataset; el rendimiento puede degradarse con jerga regional, errores ortograficos o mensajes muy largos.
- No es un modelo generativo: no puede redactar respuestas, solo clasificar. Requiere un componente adicional para la respuesta al cliente.
- Limitacion idiomatica: no se documenta rendimiento en portugues europeo ni en otros idiomas.
- Riesgo de sesgo inherrente al dataset de origen, no documentado por el autor; no hay analisis de sesgos publicado.
- Licencia MIT: permite uso comercial, pero se recomienda verificar las condiciones del modelo base `neuralmind/bert-base-portuguese-cased`, cuya licencia no se detalla en la informacion disponible.
- El repositorio no incluye pesos completos, solo adaptadores LoRA; el despliegue exige descargar el modelo base y aplicar el adaptador, lo que anade un paso de configuracion.
- Sin soporte documentado para despliegue en servidores de inferencia de alto rendimiento (vLLM, TGI) ni para cuantizacion especifica del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabadorno/bertimbau-lora-restaurant-intents
- Perfil del autor en GitHub: https://github.com/gabadorno
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Libreria PEFT: https://huggingface.co/docs/peft
- Libreria transformers: https://huggingface.co/docs/transformers
