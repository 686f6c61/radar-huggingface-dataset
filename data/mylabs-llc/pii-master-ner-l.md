# MyLabs-LLC/pii-master-ner-l

## Resumen

`pii-master-ner-l` es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) y de salud protegida (PHI), diseñado para cumplir con la normativa HIPAA en entornos de producción. Desarrollado por MyLabs-LLC, se trata de un tagger de tokens destilado del modelo `kalyan-ks/ettin-68m-nemotron-pii` y entrenado sobre el conjunto de datos sintético `nvidia/Nemotron-PII`. Su arquitectura es una red neuronal convolucional (CNN) con capas dilatadas y separables en profundidad, con 10 millones de parámetros, lo que le permite ejecutarse eficientemente en un único núcleo de CPU.

El modelo clasifica 111 clases BIO que abarcan 55 tipos de entidades Nemotron, posteriormente mapeadas a 25 categorías alineadas con los tipos de identificadores de la regla Safe Harbor de HIPAA. Se distribuye en formato ONNX-fp32 con un tamaño de 43,7 MB, lo que facilita su integración en pipelines de inferencia locales. Está diseñado para operar como una capa de detección complementaria a un sistema de reglas previo, que valida chequesum de números de tarjeta y suprime clases de fallo conocidas. No debe considerarse una herramienta de desidentificación garantizada, sino un asistente para revisores humanos.

La relevancia actual de este modelo radica en su enfoque práctico para el cumplimiento de privacidad en el sector sanitario y de servicios, combinando un alto rendimiento en detección a nivel de documento (recall 0.9977) con un coste computacional muy bajo. Sin embargo, sus limitaciones documentadas, como la dependencia de datos sintéticos y la falta de generalización a otros corpus, exigen una evaluación cuidadosa antes de su adopción en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN dilatada con capas separables en profundidad (dilated depthwise-separable CNN), d=192, 8 capas |
| Parametros totales | 10,00 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo basado en ventana de tokens, no especificado) |
| Tipos de cuantizacion | ONNX-fp32 (43,7 MB); no se indican otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | cc-by-4.0 (modelo); MIT (codigo, segun repositorio) |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo se basa en una red neuronal convolucional con capas dilatadas y separables en profundidad, una arquitectura ligera diseñada para clasificación de tokens a nivel de caracteres. Con 8 capas y una dimensión interna de 192, el modelo procesa texto plano y emite spans de caracteres tipificados contra 18 categorías de identificadores HIPAA Safe Harbor. Se entrenó mediante destilación desde `kalyan-ks/ettin-68m-nemotron-pii`, un modelo más grande, sobre el dataset `nvidia/Nemotron-PII`, que es generado sintéticamente y contiene anotaciones de PII/PHI. El proceso de entrenamiento incluyó una calibración de confianza isotónica por tipo de entidad, lo que permite ajustar umbrales de decisión de forma independiente para cada clase.

Los datos de entrenamiento son sintéticos, lo que introduce limitaciones en la generalización a corpus reales. El modelo no ha sido evaluado en el benchmark clínico estándar n2c2/i2b2 2014, y no se realizó ningún ajuste mediante RLHF o DPO; el enfoque es exclusivamente supervisado. La arquitectura está optimizada para inferencia en CPU con un solo núcleo, logrando latencias de milisegundos en la cascada completa (según el repositorio de GitHub, la arquitectura completa opera bajo 5 ms).

## Capacidades

- Detección de PII/PHI a nivel de caracteres, con 25 tipos de entidades HIPAA mapeadas (incluye nombres, direcciones, números de teléfono, correos electrónicos, SSN, números de cuenta, etc.).
- Clasificación de tokens con 111 etiquetas BIO para 55 tipos de entidades Nemotron, posteriormente mapeadas a categorías HIPAA.
- Inferencia sobre un único núcleo de CPU, con un tamaño de modelo de 43,7 MB, adecuado para entornos con recursos limitados.
- Calibración de confianza isotónica por tipo de entidad, permitiendo ajustar umbrales de decisión.
- Diseñado para integrarse en una cascada con un sistema de reglas previo que valida checksums (p. ej., Luhn para tarjetas de crédito) y suprime falsos positivos.
- Soporte para inferencia en streaming o batch, aunque no se especifican detalles adicionales de API.
- No soporta tool calling, agentes ni capacidades multimodales; es un modelo especializado en NER.

## Casos de uso

- **Desidentificación de documentos clínicos**: el modelo puede procesar notas médicas o informes de laboratorio para detectar y enmascarar identificadores de pacientes (nombres, direcciones, números de historia clínica) antes de su uso en investigación o análisis. Su alta recall a nivel de documento (0.998) minimiza el riesgo de filtrar PII, aunque debe complementarse con un sistema de reglas para validar formatos específicos.
- **Cumplimiento de HIPAA en plataformas de salud digital**: integración en pipelines de ingesta de datos de pacientes para anonimizar automáticamente registros antes de almacenarlos en entornos de desarrollo o analítica, reduciendo el alcance de la normativa.
- **Sanitización de logs y datos de soporte técnico**: detección de números de tarjeta, direcciones IP, correos electrónicos y otros identificadores en logs de aplicaciones o tickets de soporte, permitiendo su limpieza antes de compartirlos con terceros o enviarlos a servicios externos.
- **Filtrado de datos personales en datasets de entrenamiento**: antes de publicar o compartir un dataset, el modelo puede señalar posibles PII para su revisión, aunque se recomienda complementar con validaciones adicionales debido a su limitada generalización.
- **Protección de datos en entornos de test de software**: en desarrollo, se puede usar para generar datos de prueba anonimizados a partir de datos de producción, sustituyendo entidades reales por placeholders.
- **Monitorización de flujos de datos en tiempo real**: dado su bajo coste computacional, puede desplegarse en edge o en CI/CD para analizar flujos de texto y alertar sobre posibles fugas de PII en tiempo real.

## Benchmarks y rendimiento

Los resultados se presentan tal como se publican en la model card. Las métricas se obtienen sobre el dataset de entrenamiento `nvidia/Nemotron-PII` con 3,000 documentos retenidos, y sobre un corpus adversarial de 14 negativos.

**Rendimiento a nivel de documento (umbral de confianza 0.50)**

| Configuración | Recall | Documentos no detectados | Falsas alarmas |
|---|---|---|---|
| deep @0.30 | 0.9980 | 6 de 2,983 | 0.214 |
| deep @0.50 | 0.9977 | 7 de 2,983 | 0.000 |
| deep @0.70 | 0.9963 | 11 de 2,983 | 0.000 |

**Rendimiento a nivel de span (fusión con reglas, F2 ponderado con recall 4x)**

| Tipos de entidad | Recall | F2 | F1 | Precision |
|---|---|---|---|---|
| 12 tipos cubiertos por reglas | 0.918 | 0.927 | 0.940 | 0.962 |
| 14 tipos solo del modelo | 0.911 | 0.918 | 0.930 | 0.951 |

**Rendimiento por tipo de entidad (selección)**

| Tipo | Gold | Recall | F2 | F1 | Precision |
|---|---|---|---|---|---|
| `EMAIL` | 1,221 | 0.998 | 0.997 | 0.997 | 0.997 |
| `SSN` | 249 | 1.000 | 0.976 | 0.941 | 0.889 |
| `DATE_DOB` | 403 | 0.995 | 0.995 | 0.994 | 0.993 |
| `CREDIT_CARD` | 380 | 0.108 | 0.129 | 0.183 | 0.612 |
| `PERSON_NAME` | 3,019 | 0.909 | 0.913 | 0.918 | 0.928 |

**Generalización a otro corpus (ai4privacy/pii-masking-300k)**

| Métrica | Valor |
|---|---|
| Recall estricto a nivel de span | 0.385 |
| Recall a nivel de documento | 0.870 |

## Requisitos de hardware

- **VRAM**: no requiere GPU; es un modelo ONNX-fp32 de 43,7 MB que se ejecuta en CPU.
- **GPU recomendada**: no aplica; se puede ejecutar en cualquier CPU moderna, incluso en un solo núcleo.
- **Hardware mínimo**: un solo núcleo de CPU es suficiente para la inferencia (según la model card). El repositorio menciona que la cascada completa opera bajo 5 ms, lo que sugiere una latencia muy baja.
- **Opciones de despliegue**: se distribuye en formato ONNX, compatible con runtimes como ONNX Runtime, y puede integrarse en pipelines de Python o C++. No se menciona compatibilidad directa con vLLM, llama.cpp u Ollama, dado que no es un modelo generativo.
- **Consumo**: el tamaño reducido permite ejecutarlo en entornos con poca memoria, como funciones serverless o dispositivos edge.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de PII en los datos proporcionados. El modelo se distingue por su enfoque de destilación y su ejecución en CPU, pero no se han publicado comparaciones con alternativas como Presidio, SpaCy NER o modelos basados en transformers como `dslim/bert-base-NER` o `microsoft/deberta-base`. Por tanto, esta sección se limita a indicar que no hay datos comparativos disponibles en la información suministrada.

## Limitaciones y advertencias

- **Generalización limitada**: el rendimiento sobre el corpus de entrenamiento es alto, pero se degrada significativamente en otros corpus (p. ej., recall de span 0.385 en `ai4privacy/pii-masking-300k`). Los formatos anclados como email o IP transfieren bien, pero las entidades semánticas como nombres y direcciones sufren errores de límites en texto estructurado JSON.
- **Datos sintéticos**: el modelo se entrena exclusivamente con datos generados (`Nemotron-PII`), por lo que no ha sido validado en texto clínico real. El benchmark estándar n2c2/i2b2 2014 no se ha utilizado.
- **Sesgo demográfico**: la variación de recall en nombres entre grupos étnicos es pequeña (0.020), pero esto se debe a que los nombres provienen de un generador sintético, no de datos reales.
- **Supresión deliberada de números de tarjeta de crédito**: el 88% de las tarjetas en el entrenamiento no pasan el checksum Luhn, por lo que el modelo las descarta. Su recall en este tipo es bajo (0.108), pero es un comportamiento intencional para evitar falsos positivos.
- **Alcance geográfico y lingüístico**: solo soporta formatos de identificadores de EE.UU. y texto en inglés. Otros formatos o idiomas están fuera de alcance.
- **Calibración dependiente del corpus**: los umbrales de confianza ajustados en este corpus no son necesariamente óptimos para otros dominios.
- **Falsos negativos adversariales**: el modelo puede fallar en casos de texto adversarialmente diseñado, por lo que no debe ejecutarse en solitario. Se recomienda combinarlo con un sistema de reglas y una validación de checksum.
- **No constituye una garantía legal de desidentificación**: el modelo es un detector de apoyo, no un sustituto de un proceso de revisión legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MyLabs-LLC/pii-master-ner-l
- Repositorio de GitHub: https://github.com/MyLabs-LLC/pii_master
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Modelo base: https://huggingface.co/kalyan-ks/ettin-68m-nemotron-pii
