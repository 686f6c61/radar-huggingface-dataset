# Samalas/support-triage

## Resumen

Support-triage es un clasificador de intenciones para el enrutado automático de tickets de soporte al cliente, publicado por el usuario Samalas en Hugging Face. Se construye sobre el encoder `distilbert-base-uncased` con dos cabezas de clasificación añadidas: una para intención (28 categorías) y otra para sentimiento (una única salida escalar). El modelo no genera texto: su salida es una etiqueta de intención, una puntuación de sentimiento y una decisión de enrutado hacia el equipo correspondiente.

El entrenamiento se realizó congelando el encoder y ajustando únicamente las cabezas lineales durante 2 épocas sobre el dataset Bitext de soporte al cliente (26.872 ejemplos, 21.497 de entrenamiento y 5.375 de evaluación), con una longitud máxima de 256 tokens. El autor reporta una convergencia de la pérdida de entropía cruzada desde ~3,3 hasta ~0,99, y un tiempo total de entrenamiento de unos 400 segundos en un Apple M2 Pro.

Su relevancia práctica es acotada pero clara: es un componente de triaje ligero (aproximadamente 268 MB, 50-100 ms por ticket en CPU, más de 10 tickets por segundo en un solo núcleo) pensado para integrarse como microservicio FastAPI en un CRM o mesa de ayuda. La ficha del repositorio no declara licencia, no incluye métricas de evaluación por clase y el repositorio figura con 0 descargas y 0,0 GB de tamaño, por lo que su madurez y disponibilidad real de pesos deben verificarse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder DistilBERT-base-uncased (6 capas) + dos cabezas lineales de clasificación |
| Parámetros totales | No declarado en la model card. El encoder DistilBERT-base tiene ~66 M y las cabezas suman ~22.300 (768×28 + sesgos y 768×1 + sesgo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (límite de entrada, con truncado y padding a longitud fija) |
| Tipos de cuantización | No disponible. Solo se publica un checkpoint PyTorch (.pt); no se ofrecen versiones GGUF, ONNX ni cuantizadas |
| Idiomas soportados | Inglés (entrenado con datos en inglés; el rendimiento en otros idiomas no se ha evaluado) |
| Licencia | No disponible |
| Formato de pesos | PyTorch checkpoint `.pt` (diccionario con las claves `clf` e `intents`), más `distilbert-base-uncased` descargado aparte desde Hugging Face |

Otros datos declarados: tamaño del modelo ~268 MB, memoria de inferencia ~800 MB, latencia p95 <150 ms por ticket y pipeline de Hugging Face no especificado.

## Arquitectura y entrenamiento

La arquitectura es un encoder DistilBERT-base-uncased (variante destilada de BERT con 6 capas, 768 dimensiones ocultas) utilizado en modo extractor de características. Sobre el vector `[CLS]` de la última capa se aplican dos proyecciones lineales independientes: `intent` (768 → 28) y `sentiment` (768 → 1). El encoder permanece congelado durante todo el entrenamiento; solo se actualizan los pesos de las cabezas. La entrada es texto de ticket truncado a 256 tokens y la salida son logits de intención, un valor escalar de sentimiento y una decisión de enrutado derivada de la intención.

Los datos proceden del dataset Bitext de entrenamiento de chatbots de soporte al cliente: 26.872 ejemplos reales, divididos en 21.497 para entrenamiento y 5.375 para evaluación, con 28 categorías de intención (la model card indica 28 categorías, aunque la lista enumerada contiene 27 etiquetas: cancel_order, change_order, change_shipping_address, check_cancellation_fee, check_invoice, check_payment_methods, check_refund_policy, complaint, contact_customer_service, contact_human_agent, create_account, delete_account, delivery_options, delivery_period, edit_account, get_invoice, get_refund, newsletter_subscription, payment_issue, place_order, recover_password, registration_problems, review, set_up_shipping_address, switch_account, track_order y track_refund). Los hiperparámetros son optimizador Adam con lr=1e-4, batch size 4, 2 épocas y longitud máxima 256, con una pérdida de entropía cruzada combinada para intención y sentimiento que evoluciona de ~3,3 a ~2,5 en la primera época y de ~2,5 a ~0,99 en la segunda. No se menciona RLHF, DPO ni ninguna técnica de alineación, y tampoco innovaciones de decodificación (el modelo no decodifica texto).

## Capacidades

- Clasificación de intención de un único turno en 28 categorías de soporte al cliente de comercio electrónico (cancelaciones, envíos, facturación, cuenta, devoluciones, reclamaciones, entre otras).
- Clasificación de sentimiento mediante una cabeza con una sola salida escalar; la model card no especifica si se interpreta como regresión o como probabilidad.
- Emisión de una decisión de enrutado derivada de la intención, por ejemplo `track_refund` hacia `billing_team`.
- Servicio REST listo para desplegar mediante el envoltorio FastAPI incluido (`main.py`), con endpoint `POST /triage` que recibe `{"text": "..."}` y devuelve intención y confianza.
- No realiza generación de texto, resumen, traducción ni respuesta al cliente.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento (thinking), visión, audio ni multimodalidad.
- Multilingüismo: no soportado; el entrenamiento es exclusivamente en inglés y no se evaluaron otros idiomas.

## Casos de uso

- Enrutado automático de tickets en comercio electrónico: el modelo clasifica el mensaje del cliente en una de las 28 intenciones y lo asigna al equipo adecuado (facturación, logística, cuenta), reduciendo la cola de triaje manual.
- Priorización de reclamaciones: la cabeza de sentimiento permite ordenar la cola por negatividad detectada, de modo que los tickets con tono más negativo o con intención `complaint` se atiendan antes.
- Detección temprana de solicitudes de agente humano: las etiquetas `contact_human_agent` y `contact_customer_service` permiten derivar de inmediato a un operador cuando el cliente rechaza la automatización.
- Microservicio de triaje dentro de un CRM: el `POST /triage` de FastAPI devuelve intención, confianza y ruta recomendada, con una latencia p95 declarada inferior a 150 ms en CPU, lo que permite invocarlo de forma síncrona en el flujo de creación del ticket.
- Preetiquetado para colas de anotación humana: con más de 10 tickets por segundo en un solo núcleo de CPU, el modelo puede etiquetar grandes volúmenes de tickets históricos para construir datasets supervisados o auditar la distribución de motivos de contacto.
- Analítica de motivos de contacto: agregando las intenciones predichas por día o por campaña se pueden detectar picos en `delivery_period`, `payment_issue` o `track_refund` y vincularlos a incidencias operativas.
- Automatización de flujos de autoservicio: la intención predicha puede enrutar a un artículo de ayuda, a un formulario de cancelación o a un flujo de recuperación de contraseña (`recover_password`, `cancel_order`) sin intervención humana.
- Gestión de operaciones de cuenta: las categorías `create_account`, `delete_account`, `edit_account`, `switch_account` y `registration_problems` permiten separar los tickets de identidad y acceso del resto de consultas comerciales.
- Filtro previo a un modelo generativo: usar este clasificador como primera etapa de bajo coste y reservar un LLM para redactar la respuesta solo en las intenciones que lo requieran, reduciendo el coste por ticket.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la curva de pérdida de entrenamiento (entropía cruzada combinada), no métricas de evaluación como exactitud, F1 por clase ni matrices de confusión, y no compara el modelo con alternativas sobre el conjunto de evaluación de 5.375 ejemplos.

| Métrica reportada | Valor |
|---|---|
| Pérdida, época 1 | ~3,3 → ~2,5 |
| Pérdida, época 2 | ~2,5 → ~0,99 |
| Exactitud en evaluación | No disponible |
| F1 por clase | No disponible (la model card advierte que varía significativamente por el desbalanceo de clases) |
| Throughput | Más de 10 tickets por segundo en un solo núcleo de CPU |
| Latencia | p95 <150 ms por ticket; 50-100 ms por ticket en CPU |

## Requisitos de hardware

- VRAM: no se declara requisito de GPU. El modelo ocupa ~268 MB y el estado de inferencia completo ~800 MB, por lo que la ejecución en CPU es suficiente.
- GPU recomendadas: no disponibles. Cualquier GPU con unos pocos gigabytes de memoria libre puede alojar el modelo, pero el autor no publica cifras de VRAM ni de rendimiento en GPU.
- GPU de consumo: sí cabe en cualquier GPU de consumo actual e incluso en CPU; no se especifica compatibilidad con Apple Silicon para inferencia, solo para entrenamiento (M2 Pro, 16 GB de memoria unificada).
- Opciones de despliegue: FastAPI + uvicorn con PyTorch y Transformers (ruta documentada por el autor); también es posible cargarlo directamente con `transformers` y `torch`. No hay pesos GGUF, ONNX o TensorRT publicados, por lo que llama.cpp, Ollama o TGI no están soportados tal cual.
- Latencia y throughput: 50-100 ms por ticket en CPU, p95 <150 ms, más de 10 tickets por segundo en un núcleo de CPU.
- Entrenamiento: 2 épocas completas en ~400 segundos sobre un Apple M2 Pro con 16 GB de memoria unificada.

## Comparativa con modelos similares

No hay datos de evaluación publicados que permitan comparar el rendimiento real de este modelo con alternativas. La tabla siguiente compara únicamente características estructurales y de disponibilidad.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Samalas/support-triage | Clasificador de intención sobre DistilBERT + cabezas | ~66 M (no declarado) | 256 tokens | No disponible | Checkpoint `.pt` (repo de 0,0 GB según Hugging Face) |
| distilbert-base-uncased | Encoder preentrenado genérico | ~66 M | 512 tokens | Apache 2.0 (según su model card) | Pesos safetensors/PyTorch en Hugging Face |
| bert-base-uncased | Encoder preentrenado genérico | ~110 M | 512 tokens | Apache 2.0 (según su model card) | Pesos safetensors/PyTorch en Hugging Face |
| LLM generativo en modo zero-shot (por ejemplo, un modelo de 7-8 B) | Generación con clasificación por prompt | 7.000-8.000 M | Depende del modelo | Depende del modelo | Pesos abiertos habituales |

Frente a un encoder genérico, la ventaja de este modelo es que ya incorpora las 28 etiquetas del dataset Bitext y una API de servicio; la desventaja es que carece de licencia declarada, de métricas de evaluación y de versiones cuantizadas. Frente a un LLM generativo en zero-shot, ofrece latencia y coste muy inferiores (decenas de milisegundos en CPU frente a inferencia en GPU), a cambio de una cobertura limitada a las 28 intenciones de comercio electrónico y de no poder generar respuestas.

## Limitaciones y advertencias

- Sesgos y desbalanceo de clases: la model card reconoce que el dataset Bitext presenta un desbalanceo significativo (las operaciones de cuenta y las reclamaciones son más frecuentes que otras categorías) y que el F1 por clase varía notablemente. No se publican los valores, por lo que no se puede cuantificar el sesgo.
- Alucinación: al ser un clasificador, no genera texto y no puede alucinar contenido, pero sí puede asignar una intención incorrecta con alta confianza. No se documenta ningún mecanismo de umbral de confianza ni de escalado a humano; el autor lo lista como mejora futura.
- Limitación de idioma: entrenado solo con datos en inglés. El rendimiento en castellano u otros idiomas no se ha evaluado y no hay garantía de que sea utilizable.
- Dominio restringido: las intenciones son específicas de comercio electrónico. La propia model card advierte de que puede no transferirse bien a otros sectores (sanidad, finanzas, soporte técnico).
- Longitud de entrada: truncado a 256 tokens. Los tickets largos o con mucho historial citado pueden perder información relevante y degradar la clasificación.
- Método de ajuste limitado: solo se entrenaron las cabezas de clasificación con el encoder congelado durante 2 épocas. El autor indica que un ajuste completo probablemente mejoraría el rendimiento pero requeriría más VRAM.
- Licencia: no disponible. Sin una licencia explícita no se puede asumir permiso para uso comercial, modificación o redistribución; es un bloqueante para producción.
- Estado del repositorio: 0 descargas, 0 likes y un tamaño de 0,0 GB frente a los ~268 MB declarados en la model card. Esto sugiere que el checkpoint podría no estar efectivamente subido o que el repositorio está incompleto; conviene verificar la presencia de `model.pt` antes de planificar su uso.
- Trazabilidad dudosa: la cita propuesta atribuye la autoría a "Lokesh (Claude-Haiku-4.5)" con año 2026, una atribución atípica que dificulta verificar autoría, procedencia del entrenamiento y responsabilidad sobre el modelo.
- Inconsistencia documental: la model card declara 28 categorías de intención, pero la lista enumerada contiene 27 etiquetas. El número real de clases debe comprobarse contra el checkpoint.
- Ambigüedad en la cabeza de sentimiento: se define con una única salida (`num_sentiments=1`) sin especificar la función de activación ni el rango de valores, lo que impide interpretar correctamente la puntuación devuelta.
- Ausencia de métricas: sin exactitud, F1 ni matriz de confusión no es posible establecer un criterio de aceptación objetivo ni comparar con alternativas antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samalas/support-triage
- Modelo base: distilbert-base-uncased (referenciado en la model card, sin URL explícita)
- Dataset citado: Bitext customer support LLM chatbot training dataset (referenciado en la model card, sin URL explícita)
- La búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo, el paper o el repositorio; los únicos resultados obtenidos fueron páginas genéricas de YouTube sin relación con el modelo.
