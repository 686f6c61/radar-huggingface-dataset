# Badhon/airline-intent-fasttext

## Resumen

El modelo `Badhon/airline-intent-fasttext` es un clasificador de intenciones de 19 clases diseñado para mensajes de atención al cliente de aerolíneas escritos en bengalí code-mixed, banglish (bengalí romanizado) e inglés. Desarrollado por Badhon, este modelo se basa en la librería fastText de Meta AI, que emplea una arquitectura lineal con embeddings de palabras y n-gramas de caracteres. Su principal ventaja es su tamaño reducido (6 MB cuantizado) y su velocidad de inferencia (0.03 ms por predicción), lo que lo hace adecuado para entornos de producción con restricciones de latencia y recursos.

El modelo resuelve el problema de enrutamiento de intenciones en sistemas de soporte automatizado para aerolíneas, donde los mensajes de los usuarios suelen contener variaciones ortográficas propias del banglish. fastText maneja estas variaciones mediante n-gramas de caracteres, compartiendo pesos entre diferentes grafías de una misma palabra. Según la model card, supera a un estudiante DistilBERT entrenado con los mismos datos en +17 puntos en el conjunto de prueba humano (h-test), siendo 20 veces más pequeño y aproximadamente 230 veces más rápido.

La relevancia actual del modelo radica en su eficiencia para tareas de clasificación de texto en idiomas con alta variabilidad ortográfica, donde los modelos transformer subword pueden no disponer de suficientes datos para aprender equivalencias entre grafías. Su licencia MIT permite uso comercial sin restricciones, y su formato ligero facilita el despliegue en infraestructuras modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (clasificador lineal con embeddings de palabras y n-gramas de caracteres, minn=3, maxn=5) |
| Parametros totales | no disponible (fastText no publica el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificador de secuencia, procesa todo el texto de entrada) |
| Tipos de cuantizacion | Cuantizacion de vectores (product quantization) para `intent.ftz`; precision completa para `intent.bin` |
| Idiomas soportados | bengali (bn), ingles (en), banglish (bengali romanizado) |
| Licencia | MIT |
| Formato de pesos | `.ftz` (cuantizado, 6.0 MB) y `.bin` (precision completa, 81.5 MB) |

## Arquitectura y entrenamiento

fastText es una arquitectura de clasificacion de texto desarrollada por Meta AI en 2016. El modelo representa cada documento como una bolsa de palabras y n-gramas de caracteres, que se proyectan en un espacio de embeddings y se promedian para obtener una representacion del texto. Esta representacion se pasa a un clasificador lineal (softmax) que predice la clase. El uso de n-gramas de caracteres (de 3 a 5 en este modelo) permite capturar informacion morfologica y compartir pesos entre variantes ortograficas, lo que resulta crucial para el banglish, donde una misma palabra puede aparecer con multiples grafias (por ejemplo, `koto`, `kotoo`, `kt`).

El entrenamiento se realizo con un corpus de mensajes de soporte de aerolineas en codigo mixto bengali/banglish/ingles. No se especifican el numero de tokens ni la composicion exacta del dataset en la informacion disponible. La model card menciona dos conjuntos de evaluacion: un split sintetico generado a partir de plantillas y un holdout humano (h-test) escrito a mano, que se considera mas representativo del rendimiento real. No se indica el uso de tecnicas como RLHF o DPO, ya que se trata de un clasificador supervisado clasico.

La innovacion principal del modelo no reside en la arquitectura, sino en la eleccion de fastText para un dominio con alta variabilidad ortografica. El autor argumenta que un transformer subword-tokenizado necesita aprender las equivalencias entre grafias a partir de los datos, mientras que fastText las comparte por construccion mediante los n-gramas de caracteres. Esto explica la ventaja de +17 puntos sobre DistilBERT en el holdout humano.

## Capacidades

- Clasificacion de intenciones en 19 clases especificas del dominio de aerolineas: `greeting`, `goodbye`, `thanks`, `flight_status`, `booking_new`, `booking_manage`, `checkin_boarding`, `baggage_policy`, `baggage_issue`, `refund_compensation`, `fare_payment`, `airport_info`, `special_assistance`, `loyalty_program`, `travel_documents`, `disruption`, `complaint`, `agent_request` y `out_of_scope`.
- Manejo de texto code-mixed (bengali, banglish e ingles) sin necesidad de normalizacion previa.
- Clase de rechazo `out_of_scope` para detectar consultas fuera del ambito de la aerolinea (por ejemplo, trenes, hoteles, agencias de visados).
- Inferencia extremadamente rapida: 0.03 ms por prediccion en el modelo cuantizado.
- Tamaño reducido: 6.0 MB en su version cuantizada, lo que permite su ejecucion en hardware limitado.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador de intenciones.

## Casos de uso

- Enrutamiento de mensajes en un chatbot de atencion al cliente de una aerolinea: el modelo clasifica cada mensaje entrante en una de las 19 intenciones y selecciona la plantilla de respuesta adecuada o deriva a un agente humano si la confianza es baja (umbral recomendado por debajo de 0.6).
- Sistema IVR (respuesta de voz interactiva): al recibir una consulta por voz transcrita a texto, el modelo identifica la intencion y dirige la llamada al departamento correcto (por ejemplo, `baggage_issue` a equipaje, `refund_compensation` a reembolsos).
- Clasificacion de tickets de soporte en un sistema de ticketing: los correos o mensajes de los clientes se etiquetan automaticamente con la intencion, facilitando la priorizacion y la asignacion a equipos especializados.
- Deteccion de quejas y reclamaciones: la clase `complaint` permite identificar mensajes con tono negativo o problemas graves, activando alertas para una respuesta prioritaria.
- Filtrado de consultas fuera de ambito: la clase `out_of_scope` ayuda a descartar preguntas sobre servicios no relacionados (trenes, hoteles) y redirigirlas a otros canales, aunque se recomienda no confiar exclusivamente en esta clase debido a su recall limitado (0.358 en el split sintetico).
- Analisis de tendencias en el servicio de atencion al cliente: al clasificar un gran volumen de mensajes, se pueden obtener estadisticas sobre las intenciones mas frecuentes (por ejemplo, `flight_status` o `booking_manage`) y detectar picos de demanda o problemas recurrentes.
- Integracion en pipelines de procesamiento de lenguaje natural en tiempo real: gracias a su baja latencia (0.03 ms), puede procesar miles de mensajes por segundo en una CPU estandar, siendo adecuado para entornos de alto rendimiento sin necesidad de GPU.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion en tres conjuntos: `test` (split sintetico), `h-dev` (desarrollo humano) y `h-test` (holdout humano adversarial). La metrica principal es la exactitud (accuracy). Se comparan tres modelos: fastText cuantizado, fastText de precision completa y DistilBERT int8 (estudiante).

| Modelo | test | h-dev | h-test | p50 (ms) | Tamano |
|---|---|---|---|---|---|
| fastText (cuantizado) | 0.772 | 0.869 | **0.729** | 0.03 | 6.0 MB |
| fastText (precision completa) | 0.774 | — | 0.746 | 0.02 | 81.5 MB |
| DistilBERT int8 (estudiante) | 0.846 | 0.656 | 0.559 | 6.95 | 121.6 MB |

Ademas, se indica que la exactitud en el holdout completo de 120 items es de **0.800** y la macro-F1 de **0.798**. El autor recomienda evaluar el rendimiento en `h-test`, ya que el split sintetico sobreestima el rendimiento real. DistilBERT obtiene una puntuacion mas alta en el split sintetico (0.846) pero mucho mas baja en el holdout humano (0.559), lo que demuestra la ventaja de fastText en este dominio.

## Requisitos de hardware

- El modelo es extremadamente ligero: el archivo cuantizado `intent.ftz` pesa 6.0 MB y el de precision completa `intent.bin` 81.5 MB.
- No requiere GPU para inferencia; se ejecuta eficientemente en CPU. La latencia media es de 0.03 ms por prediccion en el modelo cuantizado.
- Puede desplegarse en hardware muy limitado, como Raspberry Pi, dispositivos embebidos o servidores sin aceleracion grafica.
- La memoria RAM necesaria es minima: menos de 100 MB para cargar el modelo de precision completa.
- Opciones de despliegue: uso directo con la libreria `fasttext` de Python, o mediante `huggingface_hub` para descargar el archivo. Tambien es posible exportar el modelo a otros formatos (por ejemplo, ONNX) si se requiere integracion con otros frameworks, aunque no se documenta en la informacion disponible.
- No se requieren GPUs especificas; cualquier CPU moderna es suficiente. El throughput estimado es de aproximadamente 33,000 predicciones por segundo en un solo nucleo (basado en la latencia p50 de 0.03 ms).

## Comparativa con modelos similares

La comparativa principal se establece con DistilBERT int8, que es el modelo transformer de referencia entrenado con los mismos datos. La tabla de benchmarks anterior muestra las diferencias clave. A continuacion se resumen las caracteristicas comparativas:

| Modelo | Arquitectura | Tamano | Latencia (p50) | h-test | Licencia |
|---|---|---|---|---|---|
| fastText (cuantizado) | Lineal con n-gramas de caracteres | 6.0 MB | 0.03 ms | 0.729 | MIT |
| fastText (precision completa) | Lineal con n-gramas de caracteres | 81.5 MB | 0.02 ms | 0.746 | MIT |
| DistilBERT int8 | Transformer (subword) | 121.6 MB | 6.95 ms | 0.559 | MIT (probablemente, no se especifica) |

No se dispone de informacion sobre otros clasificadores de intencion comparables en el mismo dominio (por ejemplo, modelos BERT multilingues o XLM-R). Sin embargo, la ventaja de fastText en terminos de tamaño, velocidad y rendimiento en datos con alta variabilidad ortografica es clara frente a un transformer subword. Para dominios con ortografia estandar, un transformer podria ofrecer mayor precision, pero en este caso especifico fastText es superior.

## Limitaciones y advertencias

- **Recall limitado de la clase `out_of_scope`**: en el split sintetico, el recall de `out_of_scope` es de 0.358, lo que significa que muchas consultas fuera de ambito no se detectan correctamente. El autor advierte que no se debe confiar exclusivamente en esta clase para filtrar trafico fuera de dominio.
- **Fugas de confianza**: ciertas consultas de servicios adyacentes (por ejemplo, preguntas sobre trenes) pueden clasificarse como `booking_new` con alta confianza (0.88), superando el umbral de 0.6 y pasando silenciosamente. Se recomienda un umbral de confianza de 0.6 y una derivacion a humano por debajo de este.
- **Tokens sociales de baja confianza**: expresiones como `assalamu alaikum` se clasifican como `greeting` con una confianza de solo 0.56, lo que puede provocar falsos negativos si se aplica un umbral estricto.
- **No es un sistema de decision**: el modelo solo selecciona una plantilla de respuesta o una cola de atencion; no debe utilizarse para tomar decisiones criticas sin supervision humana.
- **Dependencia de la normalizacion**: los inputs deben estar en minusculas y sin saltos de linea finales, ya que fastText trata el salto de linea como un limite de documento.
- **Sesgos y alucinaciones**: no se documentan sesgos especificos, pero al ser un clasificador, no genera texto, por lo que el riesgo de alucinacion no aplica. Sin embargo, la clasificacion erronea puede llevar a respuestas inadecuadas si se integra en un sistema automatizado.
- **Restricciones de licencia**: la licencia MIT permite uso comercial sin restricciones, pero se debe atribuir al autor original.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Badhon/airline-intent-fasttext)
- [Sitio oficial de fastText](https://fasttext.cc/)
- [Blog de Hugging Face sobre fastText](https://github.com/huggingface/blog/blob/main/fasttext.md)
