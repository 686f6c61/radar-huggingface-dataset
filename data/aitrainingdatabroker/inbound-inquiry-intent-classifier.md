# aitrainingdatabroker/inbound-inquiry-intent-classifier

## Resumen

El Inbound Inquiry Intent Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker, un bróker y asesor técnico especializado en la venta y licencia de datos para laboratorios de IA. El modelo resuelve un problema acotado y concreto: leer un mensaje entrante a un negocio de datos y asignarle una de ocho etiquetas de intención (`seller_interest`, `buyer_request`, `referral_offer`, `press_media`, `vendor_pitch`, `support_question`, `opt_out` o `spam`). Su utilidad práctica inmediata es el triaje de bandejas de entrada, de modo que cada mensaje llegue a la persona adecuada y, en particular, que una baja (opt-out) no pase desapercibida.

Técnicamente es un ajuste fino de `distilroberta-base`, un transformer encoder de tipo RoBERTa destilado, con 82.124.552 parámetros totales y un repositorio de 0,3 GB en formato safetensors. No es un modelo generativo ni conversacional: es un clasificador discriminativo que devuelve distribuciones de probabilidad sobre ocho clases. Su relevancia radica en su simplicidad operativa (se ejecuta en una sola GPU de consumo) y en su licencia Apache 2.0, que permite uso comercial sin restricciones de atribución obligatoria, aunque el autor solicita crédito.

El modelo se entrenó exclusivamente con datos sintéticos generados a partir de plantillas, lo que constituye tanto su principal virtud (no hay datos personales reales implicados) como su principal limitación (la distribución de texto real es mucho más variada que la sintética). Con 19 descargas y 0 likes en el momento de la consulta, es un artefacto reciente y de nicho, pensado como componente de un pipeline de triaje más que como solución autónoma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) |
| Parámetros totales | 82.124.552 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base `distilroberta-base` admite hasta 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización dinámica posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de `distilroberta-base`, una versión destilada de RoBERTa que conserva la arquitectura encoder-only de BERT/RoBERTa pero con aproximadamente la mitad de capas y parámetros. La tarea es de clasificación multiclase con ocho etiquetas, y la cabeza de clasificación se entrena sobre la representación del token especial `[CLS]` o equivalente. No hay mecanismos de atención lineal, decodificación especulativa ni componentes híbridos: es un encoder estándar con una capa de clasificación.

El entrenamiento se realizó durante 6 épocas en una única GPU RTX 3070, sobre 458 filas del dataset sintético `aitrainingdatabroker/synthetic-inbound-inquiries-by-intent`. Todos los nombres, números y frases del corpus son inventados; no proviene de personas, clientes ni negocios reales. El conjunto de test (154 filas) se construyó con plantillas que el modelo no vio durante el entrenamiento, pero escritas en el mismo estilo plano y controlado que el corpus de entrenamiento. Los scripts de generación de datos y de entrenamiento están incluidos en el directorio `source/` del repositorio, y las puntuaciones completas en `scores.json`. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificación de texto en ocho categorías de intención: `seller_interest`, `buyer_request`, `referral_offer`, `press_media`, `vendor_pitch`, `support_question`, `opt_out` y `spam`.
- Devuelve probabilidades por clase, lo que permite umbrales de confianza y revisión humana selectiva.
- Diseñado específicamente para mensajes entrantes a un negocio de datos (correo electrónico y formularios de contacto).
- Capacidad multilingüe: no, únicamente inglés.
- Soporte de tool calling / function calling: no aplica (modelo discriminativo, no generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidad de generación de texto: no, es un encoder de clasificación.
- Integración con `transformers` pipeline y con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible` en HuggingFace).

## Casos de uso

- **Triaje de bandeja de entrada comercial**: el modelo clasifica cada correo entrante en una de las ocho intenciones, permitiendo enrutar automáticamente los mensajes de compradores (`buyer_request`) al equipo de ventas y los de proveedores (`vendor_pitch`) a compras. Con 82 M de parámetros, el coste por inferencia es mínimo y se puede procesar un volumen alto de mensajes en una sola GPU de consumo.
- **Detección y priorización de bajas (opt-out)**: la clase `opt_out` permite marcar mensajes de baja para revisión inmediata, reduciendo el riesgo de que una solicitud de exclusión quede enterrada en la bandeja. El autor advierte explícitamente que la predicción debe confirmarla una persona antes de suprimir un mensaje real.
- **Filtrado de spam y pitches no solicitados**: las clases `spam` y `vendor_pitch` permiten desviar automáticamente correo no deseado o propuestas comerciales no solicitadas a carpetas secundarias, reduciendo el ruido en la bandeja principal.
- **Gestión de solicitudes de prensa y medios**: la clase `press_media` permite identificar consultas de periodistas y enrutarlas a comunicación con prioridad, evitando que se mezclen con consultas comerciales.
- **Procesamiento de ofertas de referidos y partnership**: la clase `referral_offer` separa las propuestas de colaboración o referidos del resto de mensajes, facilitando su evaluación por el equipo de desarrollo de negocio.
- **Enrutamiento de soporte técnico o de producto**: la clase `support_question` identifica consultas de soporte y las deriva al equipo correspondiente, con la ventaja de que el modelo se ejecuta localmente y no requiere enviar el contenido del correo a un servicio externo.
- **Componente de un pipeline de clasificación previa a un LLM generativo**: dado su bajo coste, puede usarse como primer filtro para decidir qué mensajes merecen pasar a un modelo mayor (por ejemplo, para redactar respuestas), reduciendo el coste total del sistema.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son las métricas sobre el conjunto de test sintético de 154 filas:

| Métrica | Valor |
|---|---|
| Accuracy (154 filas held-out) | 1,0 |
| Macro F1 | 1,0 |
| F1 `buyer_request` | 1,0 (n=20) |
| F1 `opt_out` | 1,0 (n=18) |
| F1 `press_media` | 1,0 (n=19) |
| F1 `referral_offer` | 1,0 (n=19) |
| F1 `seller_interest` | 1,0 (n=20) |
| F1 `spam` | 1,0 (n=20) |
| F1 `support_question` | 1,0 (n=18) |
| F1 `vendor_pitch` | 1,0 (n=20) |

No se han publicado resultados sobre benchmarks estándar (MMLU, GLUE, etc.) ni sobre datos reales. El propio autor advierte que una puntuación de 1,0 sobre texto generado dice poco sobre el rendimiento en texto real, ya que las frases de test, aunque provienen de plantillas nuevas, comparten el mismo estilo plano y controlado que el corpus de entrenamiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en FP32, los 82 M de parámetros ocupan aproximadamente 330 MB; en FP16, unos 165 MB. Con overhead de activaciones y tokenizador, cabe holgadamente en menos de 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU moderna sirve. Una RTX 3070 (la usada para entrenar) es más que suficiente; también RTX 3060, RTX 4090, A100, H100 o incluso CPU para volúmenes moderados.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre, incluidas GTX 1650 o superiores.
- **Opciones de despliegue**: `transformers` pipeline (documentado por el autor), Text Embeddings Inference (etiqueta oficial en HuggingFace), y cualquier servidor compatible con endpoints de HuggingFace. Al ser un encoder, también puede exportarse a ONNX para inferencia optimizada.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por mensaje en GPU y throughput de cientos a miles de mensajes por segundo en hardware moderno, pero son estimaciones no confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inbound Inquiry Intent Classifier (este) | 82,1 M | hasta 512 tokens (base) | Clasificación de intención en 8 clases, inglés | Apache 2.0 | HuggingFace |
| `distilbert-base-uncased` ajustado a intención | ~66 M | 512 tokens | Clasificación genérica, requiere ajuste propio | Apache 2.0 | HuggingFace |
| `roberta-base` ajustado a intención | ~125 M | 512 tokens | Clasificación genérica, requiere ajuste propio | MIT | HuggingFace |
| `facebook/bart-large-mnli` (zero-shot) | ~407 M | 1024 tokens | Clasificación zero-shot por NLI, sin entrenamiento específico | MIT | HuggingFace |

La comparación directa con alternativas es limitada porque este modelo está especializado en un dominio muy concreto (mensajes entrantes a un negocio de datos) y no existen modelos públicos equivalentes con las mismas ocho clases. Frente a un `distilbert` o `roberta` genéricos, la ventaja es que ya está ajustado y listo para usar; la desventaja es que su dominio es estrecho y su entrenamiento es puramente sintético. Frente a un enfoque zero-shot con BART-MNLI, este modelo es mucho más ligero y probablemente más preciso en su dominio, pero no puede clasificar categorías nuevas sin reentrenamiento.

## Limitaciones y advertencias

- **Entrenamiento exclusivamente sintético**: el corpus son 458 filas generadas por plantillas; el texto real varía mucho más en longitud, estilo, ruido, errores tipográficos, idioma mezclado y jerga. El rendimiento en producción puede degradarse de forma significativa respecto al 1,0 reportado.
- **Sobreajuste a plantillas**: aunque el test usa plantillas no vistas, comparte el mismo estilo plano que el entrenamiento; la puntuación de 1,0 no es evidencia de generalización a texto real.
- **No usar en solitario para suprimir mensajes**: el autor advierte explícitamente que una predicción de `opt_out` o `spam` debe ser confirmada por una persona antes de suprimir un mensaje real.
- **Solo inglés**: no soporta castellano ni otros idiomas; los mensajes en otros idiomas se clasificarán de forma impredecible.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en entradas fuera de distribución.
- **Sesgos**: no documentados por el autor; al provenir de plantillas sintéticas, el modelo puede reflejar los sesgos de quienes escribieron las plantillas (estilo, vocabulario, formalidad).
- **Contexto limitado**: hereda la ventana de 512 tokens de `distilroberta-base`; mensajes muy largos se truncan y pueden perder la señal de intención.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el autor solicita crédito a AI Training Data Broker y enlace a su web al compartir o construir sobre el modelo.
- **No es asesoramiento legal ni certificación**: el autor lo indica expresamente; la revisión humana y el criterio jurídico son responsabilidad del usuario.
- **Madurez**: 19 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitrainingdatabroker/inbound-inquiry-intent-classifier
- Dataset sintético: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-inbound-inquiries-by-intent
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Contacto del autor: https://aitrainingdatabroker.com/contact/
- Programa de referidos: https://aitrainingdatabroker.com/referral-program/
- Herramientas gratuitas: https://aitrainingdatabroker.com/tools/
