# atonlee/supra-ko-pii-router

## Resumen

`atonlee/supra-ko-pii-router` es un modelo de lenguaje ligero, de 51,8 millones de parámetros, desarrollado por atonlee sobre la base `SupraLabs/Supra1.5-50M-Base-exp`. Su función es exclusivamente clasificatoria: dada una oración en coreano, determina si contiene datos personales (PII) o no, respondiendo con una de tres etiquetas (`none`, `tier2`, `tier1`). No localiza ni enmascara los datos, sino que actúa como un «portero» que decide si un texto puede enviarse tal cual a un LLM externo o debe pasar primero por un proceso de inspección.

El modelo está pensado para entornos de edge computing y privacidad, donde es crítico evitar que información sensible salga del dispositivo o de la infraestructura local. Su pequeño tamaño permite ejecutarlo en CPU o GPUs de gama baja, y su arquitectura tipo llama (según la etiqueta `model_type`) lo hace compatible con el ecosistema Transformers. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

La relevancia actual del modelo radica en la creciente demanda de soluciones de filtrado de PII en aplicaciones coreanas, especialmente en sectores financieros y administrativos, donde el cumplimiento normativo exige controlar qué datos se comparten con servicios en la nube. Su precisión reportada del 97,3% en un conjunto de prueba interno lo convierte en una opción práctica para este tipo de tareas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo llama) |
| Parametros totales | 51.786.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizables) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo llama, con 51,8 millones de parámetros, derivado de `SupraLabs/Supra1.5-50M-Base-exp`. No se han publicado detalles sobre el número de capas, heads o dimensiones ocultas, pero por su tamaño se trata de una red compacta adecuada para inferencia en dispositivos con recursos limitados.

El entrenamiento se realizó mediante fine-tuning sobre la base mencionada, utilizando una combinación de datasets públicos y ejemplos escritos a mano. Las fuentes declaradas son:

- `BCCard/pii-masking-openpii-finance` (CC BY 4.0): prosa financiera y administrativa con ejemplos de datos personales.
- `townboy/korean-pii-dataset` (CC BY 4.0): nombres coreanos, afiliaciones y texto de formularios.
- `atonlee/Prompt-Routing-Dataset-ko` (MIT): consultas generales como ejemplos negativos (sin PII). Solo se usó el texto coreano, no las etiquetas de enrutamiento.

Además, el autor añadió ejemplos específicos para cubrir identificadores enmascarados o parcialmente revelados, frases de políticas de privacidad y números con forma de identificador que no son datos personales. No se redistribuyen los datos de entrenamiento, y no se especifica el número total de tokens ni el método de optimización (probablemente fine-tuning supervisado estándar).

Una innovación técnica destacable es el uso de puntuación de etiquetas en lugar de generación libre: el modelo calcula la log-probabilidad de cada una de las tres etiquetas (`none`, `tier2`, `tier1`) a partir del prompt `"Task: [pii] {q}\nAnalysis:"`, y la etiqueta con mayor puntuación se selecciona como respuesta. Esto evita problemas de parsing y hace la clasificación más robusta.

## Capacidades

- Clasificación binaria de PII en coreano: determina si una oración contiene datos personales (nombres, teléfonos, emails, direcciones, fechas de nacimiento, números de cuenta, RRN, pasaportes, tarjetas, credenciales, etc.).
- Distinción en tres niveles: `none` (sin PII), `tier2` (PII de sensibilidad media) y `tier1` (PII de alta sensibilidad). La lógica de `has_pii` considera cualquier etiqueta distinta de `none` como presencia de PII.
- Manejo de identificadores parcialmente enmascarados: reconoce patrones como `990101-1******` o `010-1234-****` como PII, incluso si están truncados.
- Distinción entre mencionar términos y contener datos: frases como «주민등록번호는 수집하지 않습니다» (no recopilamos números de registro) se clasifican como `none` porque no contienen datos reales.
- Interfaz de puntuación directa: expone log-probabilidades por etiqueta, lo que permite ajustar el umbral de decisión mediante el parámetro `margin`.
- Compatible con el ecosistema Transformers y con despliegue en CPU/GPU ligera.

No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión/audio. Es un clasificador especializado de una sola tarea.

## Casos de uso

- Filtrado de prompts antes de enviar a un LLM en la nube: en una aplicación de asistente virtual, el modelo decide si la consulta del usuario contiene PII y, si es así, la redirige a un proceso de anonimización o la bloquea antes de que salga del dispositivo.
- Cumplimiento normativo en servicios financieros: una entidad bancaria coreana puede usar el router para garantizar que las solicitudes de los clientes no incluyan números de cuenta o tarjetas antes de pasarlas a un modelo externo de atención al cliente.
- Preprocesamiento en pipelines de datos: antes de almacenar logs de conversaciones, el modelo marca los registros que contienen PII para aplicar políticas de retención o cifrado específicas.
- Control de acceso en aplicaciones de mensajería: en un chat corporativo, el router detecta si un mensaje contiene datos personales y aplica políticas de visibilidad o alerta al administrador.
- Enrutamiento de consultas en sistemas de preguntas y respuestas: según la presencia de PII, la consulta se dirige a un modelo local (seguro) o a un LLM externo (más potente), optimizando costes y privacidad.
- Auditoría de cumplimiento en entornos de desarrollo: al probar aplicaciones con datos sintéticos, el modelo verifica que ningún dato real se filtre en los conjuntos de prueba.

## Benchmarks y rendimiento

El autor reporta resultados sobre un conjunto de prueba interno de 602 oraciones en coreano. No se han publicado comparaciones con otros modelos en la información disponible.

| Clase | Filas | Precision | Recall | F1 |
|---|---|---|---|---|
| Contiene datos personales | 401 | 96,8% | 99,3% | 98,0% |
| No contiene | 201 | 98,4% | 93,5% | 95,9% |
| **Accuracy global** | 602 | — | — | **97,3%** |

Además, se menciona que con un margen de `0.0` el gate pasa el 43% de un conjunto de 87 solicitudes al tagger de spans, mientras que con `margin=1.2` pasa el 78%. Esto indica un trade-off entre cobertura y coste computacional.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (51,8M parámetros ≈ 207 MB en FP32). Con cuantización a 8 bits o 4 bits, el consumo baja a ~50-100 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1650, Jetson Nano, Raspberry Pi con acelerador). También funciona en CPU sin GPU.
- Adecuado para edge computing: puede ejecutarse en dispositivos embebidos con limitaciones de memoria.
- Opciones de despliegue: Transformers (Python), llama.cpp para CPU, ONNX Runtime, o servidores de inferencia ligeros como TGI (aunque el modelo es demasiado pequeño para justificar un servidor completo).
- Latencia estimada: al ser un modelo de 51M parámetros, la inferencia en CPU moderna es del orden de milisegundos (no hay datos oficiales, pero es razonable asumir <10 ms por oración corta).

## Comparativa con modelos similares

No se han encontrado modelos directamente comparables en la misma categoría (clasificador de PII en coreano con 51M parámetros). El autor menciona `atonlee/koelectra-ko-pii-ner` como complementario, pero ese modelo realiza localización de spans (NER) y tiene 14M parámetros, por lo que no es una alternativa directa. Otros modelos de detección de PII en coreano (como los basados en BERT) suelen ser más grandes o requieren GPU. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Solo funciona en coreano; no soporta otros idiomas.
- No localiza ni enmascara datos: solo clasifica. Para obtener los caracteres exactos es necesario usar el modelo NER complementario.
- Riesgo de falsos negativos: el recall para la clase «no contiene» es del 93,5%, lo que implica que un 6,5% de textos sin PII podrían marcarse incorrectamente como con PII (falsos positivos). Esto es conservador para privacidad, pero puede generar alertas innecesarias.
- El umbral `margin` debe ajustarse según el caso de uso: un margen bajo reduce las llamadas al tagger pero aumenta el riesgo de pasar PII sin inspeccionar.
- La longitud de contexto no está documentada; al ser un modelo pequeño, probablemente no maneje documentos largos (se recomienda truncar a oraciones individuales).
- Los datos de entrenamiento no se redistribuyen, y no se especifica si el modelo ha sido evaluado en dominios fuera de los datasets utilizados.
- Aunque la licencia Apache 2.0 permite uso comercial, el usuario debe verificar que el uso previsto cumple con las normativas de protección de datos aplicables (ej. PIPA en Corea).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atonlee/supra-ko-pii-router
- Modelo base: https://huggingface.co/SupraLabs/Supra1.5-50M-Base-exp
- Modelo complementario (NER): https://huggingface.co/atonlee/koelectra-ko-pii-ner
- Dataset: https://huggingface.co/datasets/BCCard/pii-masking-openpii-finance
- Dataset: https://huggingface.co/datasets/townboy/korean-pii-dataset
- Dataset: https://huggingface.co/datasets/atonlee/Prompt-Routing-Dataset-ko
