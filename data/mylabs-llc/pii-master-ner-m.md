# MyLabs-LLC/pii-master-ner-m

## Resumen

`pii-master-ner-m` es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) y de información sanitaria protegida (PHI). Ha sido desarrollado por MyLabs-LLC como un tagger de tokens destilado a partir de `kalyan-ks/ettin-68m-nemotron-pii`, un modelo basado en Phi, y entrenado sobre el conjunto de datos sintético `nvidia/Nemotron-PII`. Su propósito principal es actuar como componente de un sistema de desidentificación de documentos clínicos y administrativos, detectando 18 categorías de identificadores definidas por la regla Safe Harbor de HIPAA.

La arquitectura es un tagger CNN dilado con capas depthwise-separable de 128 dimensiones y 6 capas, con solo 6,57 millones de parámetros, lo que lo hace extremadamente ligero y capaz de ejecutarse en un único núcleo de CPU. El modelo se distribuye en formato ONNX fp32 (30 MB) y su licencia es CC-BY-4.0. Se ha diseñado para operar detrás de un nivel de reglas que valida checksums y suprime falsos positivos, y su salida son intervalos de caracteres tipificados contra las categorías HIPAA.

La relevancia actual radica en la necesidad de herramientas de desidentificación eficientes y auditables en el ámbito sanitario, donde la privacidad es crítica. Sin embargo, el autor advierte explícitamente que el modelo no constituye una garantía de desidentificación legal y que su rendimiento en datos reales fuera del corpus de entrenamiento es limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN dilada depthwise-separable, d=128 x 6 capas |
| Parametros totales | 6,57 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX), no se ofrecen cuantizaciones adicionales |
| Idiomas soportados | en |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo es un tagger de tokens basado en una red neuronal convolucional (CNN) con capas diladas y convoluciones depthwise-separable. Tiene 128 dimensiones por capa y 6 capas apiladas, lo que le permite procesar secuencias de texto con un coste computacional muy bajo. La salida es una secuencia de etiquetas BIO (111 clases) que cubren 55 tipos de entidad del conjunto Nemotron, posteriormente cruzadas con 25 tipos mapeados a las categorías HIPAA. La calibración de confianza se realiza mediante regresión isotónica por tipo de entidad.

El entrenamiento se realizó sobre el dataset sintético `nvidia/Nemotron-PII`, que contiene textos generados artificialmente, no datos clínicos reales. El modelo es una destilación del modelo base `kalyan-ks/ettin-68m-nemotron-pii`, lo que significa que se ha comprimido el conocimiento de un modelo mayor a esta arquitectura ligera. No se menciona el uso de RLHF ni DPO; el entrenamiento es de tipo supervisado sobre las etiquetas del dataset.

## Capacidades

- Detección de PII y PHI en texto plano, con salida de intervalos de caracteres (inicio y fin) y tipo de entidad.
- Reconoce 18 categorías de identificadores de la Safe Harbor de HIPAA, incluyendo nombres, direcciones, fechas, números de teléfono, correos electrónicos, IPs, SSN, números de tarjeta de crédito, entre otros.
- Soporta clasificación de tokens con etiquetas BIO, lo que permite identificar entidades de longitud variable.
- Capacidad de ejecución en CPU sin GPU, con un consumo de memoria muy bajo (30 MB).
- Calibración de confianza por tipo de entidad, lo que permite ajustar umbrales de decisión.
- No incluye soporte para tool calling, agentes, visión ni audio; es un modelo de clasificación de tokens puro.
- Solo idioma inglés, y formatos de identificadores estadounidenses.

## Casos de uso

- Desidentificación de historias clínicas electrónicas: el modelo puede detectar y marcar los identificadores personales en textos clínicos antes de su uso en investigación, cumpliendo con la regla Safe Harbor de HIPAA. Su bajo coste permite integrarlo en pipelines de procesamiento por lotes en hospitales y centros de salud.
- Anonimización de bases de datos de investigación: al procesar grandes volúmenes de texto (notas médicas, informes de laboratorio), el modelo identifica campos como nombres, direcciones o números de seguridad social, que luego pueden ser reemplazados o enmascarados.
- Filtrado de PII en logs de aplicaciones y sistemas: muchas empresas necesitan eliminar datos personales de logs antes de su análisis o almacenamiento. El modelo puede ejecutarse como un servicio ligero en el pipeline de ingestión de logs.
- Cumplimiento normativo en procesamiento de datos: para empresas que manejan datos de clientes (p.ej. seguros, finanzas), el modelo ayuda a localizar y clasificar información sensible en documentos contractuales o de atención al cliente.
- Detección de PII en contenido generado por usuarios: en plataformas de atención al cliente o foros, el modelo puede escanear mensajes y alertar sobre la presencia de números de tarjeta, direcciones o datos de salud para activar políticas de privacidad.
- Preprocesamiento para modelos de lenguaje: antes de alimentar un LLM con datos de producción, el modelo puede filtrar PII para evitar que el modelo los memorice y los reproduzca en inferencias posteriores.
- Auditoría de bases de datos: el modelo puede ejecutarse sobre textos almacenados para inventariar qué tipos de PII están presentes y dónde, facilitando el cumplimiento de normativas como GDPR (aunque el modelo está limitado a formatos de EE. UU.).
- Despliegue en entornos con recursos limitados: al requerir solo un núcleo de CPU y 30 MB, es adecuado para dispositivos edge o entornos de contenedores con memoria restringida.

## Benchmarks y rendimiento

Se han publicado métricas de evaluación sobre el conjunto de datos Nemotron-PII, con un documento de retención de 3,000 documentos. Los resultados son:

### Rendimiento a nivel de documento (umbral de confianza)

| Configuración | Recall | Documentos no detectados (de 2,983) | Falsos positivos |
|---|---|---|---|
| deep @0.30 | 0.9983 | 5 | 0.143 |
| deep @0.50 | 0.9980 | 6 | 0.000 |
| deep @0.70 | 0.9950 | 15 | 0.000 |

### Rendimiento a nivel de span (emparejamiento exacto, fusionado con reglas)

| Tipo de entidad | Recall | F2 | F1 | Precisión |
|---|---|---|---|---|
| 12 tipos cubiertos también por reglas | 0.913 | 0.921 | 0.935 | 0.957 |
| 14 tipos solo del modelo | 0.895 | 0.902 | 0.914 | 0.934 |

No se han publicado resultados de benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; el modelo se ejecuta en CPU.
- GPU recomendadas: no se requiere ninguna GPU. Puede ejecutarse en un único núcleo de CPU.
- Cabe en cualquier GPU consumer (por ejemplo, RTX 3060 o superior) y también en CPU de baja gama.
- Opciones de despliegue: ONNX Runtime, se puede integrar en pipelines Python con la librería `onnxruntime`. También puede convertirse a otros formatos si se desea, pero no se proporcionan archivos GGUF o safetensors.
- Latencia: no se proporciona medición de latencia exacta, pero por su tamaño (30 MB y 6.57M parámetros) se espera una inferencia en milisegundos por documento en CPU.
- Throughput: no se especifica, pero es adecuado para procesamiento por lotes en tiempo real en entornos de CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (NER de PII/PHI) con los mismos parámetros o arquitectura. El autor menciona que el modelo base `kalyan-ks/ettin-68m-nemotron-pii` es un modelo mayor, pero no se dan detalles comparativos. Por lo tanto, no se puede realizar una comparativa con datos concretos.

## Limitaciones y advertencias

- **No generaliza a otros dominios**: los resultados de rendimiento son exclusivamente sobre el corpus Nemotron-PII. En el corpus `ai4privacy/pii-masking-300k` (un corpus diferente, con otro estilo de etiquetas y locales) la recall de spans estricta es 0.385, frente a 0.914 en Nemotron. La recall a nivel documento es 0.870 frente a 0.998. Los formatos anclados (email, IP) transfieren bien, pero los tipos semánticos como nombres y direcciones colapsan.
- **Datos de entrenamiento sintéticos**: Nemotron-PII es un dataset generado, no real. El modelo no ha sido evaluado en texto clínico real; el benchmark clínico estándar n2c2/i2b2 2014 no se utilizó por requerir un acuerdo de uso de datos.
- **Sesgo demográfico sintético**: La variación de recall de nombres entre grupos raciales/étnicos es solo 0.020, pero esto refleja la naturaleza generada de los nombres, no la realidad.
- **División PII vs PHI sin oro externo**: La clasificación entre PII y PHI solo se ha evaluado sobre un corpus de 39 documentos creados por el autor, siendo el punto más débil de la evaluación.
- **Supresión deliberada de números de tarjeta de crédito**: El 88% de las tarjetas del corpus de entrenamiento fallan el checksum de Luhn, por lo que el modelo las suprime en la ruta de inferencia. El F1 para este tipo es ~0.18, y es un comportamiento correcto según el autor.
- **Solo inglés y formatos de EE. UU.**: Formatos de identificadores de otros países están fuera de alcance.
- **Calibración dependiente del corpus**: Los umbrales de confianza ajustados para Nemotron-PII no son automáticamente válidos para otras distribuciones de texto.
- **Puede estar seguro de forma errónea**: Los errores adversarios (casi coincidencias) son su clase de fallo documentada. El autor recomienda no ejecutar el modelo solo, sino junto a un sistema de reglas con checksum y un umbral de confianza.
- **No es una garantía de desidentificación**: es un detector de apoyo, no una determinación legal de desidentificación Safe Harbor.

## Enlaces

- HuggingFace: https://huggingface.co/MyLabs-LLC/pii-master-ner-m
- Modelo base: https://huggingface.co/kalyan-ks/ettin-68m-nemotron-pii
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Repositorio de la organización: https://github.com/MyLabs-LLC/sentry (proyecto relacionado con LLMs, aunque no directamente con este modelo)
