# barflyman/ettin-32m-nemotron-pii-ONNX

## Resumen

El modelo `ettin-32m-nemotron-pii` es un modelo ligero de detección de información personal identificable (PII) basado en un encoder transformer de 32 millones de parámetros, desarrollado por Kalyan KS y publicado bajo licencia MIT. La versión ONNX aquí descrita, subida por el usuario `barflyman`, es una conversión automática del modelo original pensada para su uso con Transformers.js y entornos de ejecución en el navegador o dispositivos edge mediante ONNX Runtime.

El modelo está fine-tuneado sobre el dataset NVIDIA Nemotron-PII y es capaz de identificar más de 50 tipos de entidades PII (nombres, direcciones, números de teléfono, correos electrónicos, datos bancarios, identificadores médicos, etc.) tanto en texto estructurado como no estructurado, en dominios como salud, finanzas, legal o ciberseguridad. Con solo 32M de parámetros alcanza una F1 micro de 95,73 en el conjunto de test de Nemotron-PII, superando a modelos LLM mucho más grandes como GPT-4o-Mini.

Su relevancia actual radica en la creciente necesidad de proteger datos personales en aplicaciones de IA, cumplimiento normativo (GDPR, HIPAA) y despliegues en entornos con recursos limitados. Al ser un modelo compacto y open source, puede integrarse fácilmente en pipelines de redacción de PII, análisis de logs y sistemas de gobernanza de datos sin requerir infraestructura GPU costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (basado en ModernBERT segun los tags del repositorio) |
| Parametros totales | 32 millones |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo ONNX, probablemente FP32) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en `ettin-encoder-32M`, un encoder transformer compacto de 32 millones de parametros. Segun los tags del repositorio, la arquitectura subyacente es ModernBERT, una variante moderna de BERT optimizada para eficiencia y rendimiento. No se han publicado detalles sobre el proceso de preentrenamiento del encoder base, pero el modelo fue fine-tuneado sobre el dataset NVIDIA Nemotron-PII, que contiene ejemplos de texto con anotaciones de entidades PII en formato de clasificacion de tokens (token-classification). El fine-tuning se realizo para la tarea de reconocimiento de entidades nombradas (NER) con 55 clases de entidades PII.

La version ONNX fue generada automaticamente mediante un espacio de Hugging Face de conversion (`onnx-community/convert-to-onnx`) y esta optimizada para su uso con Transformers.js, lo que permite ejecutar el modelo directamente en navegadores web o en entornos Node.js sin necesidad de un servidor dedicado.

## Capacidades

- Deteccion de 55 tipos de entidades PII, incluyendo nombres, apellidos, direcciones, numeros de telefono, correos electronicos, numeros de tarjeta, CVV, IPs, MAC, coordenadas, identificadores medicos, datos biometricos, contrasenas, claves API, entre otros.
- Clasificacion de tokens individuales dentro de un texto (token-classification / NER).
- Funciona tanto en texto estructurado (JSON, CSV) como no estructurado (parrafos, logs).
- Soporte para multiples dominios: salud, finanzas, legal, ciberseguridad, recursos humanos, etc.
- Capacidad de procesamiento en tiempo real gracias a su tamano reducido (32M de parametros).
- Integracion sencilla con Transformers.js para despliegue en navegador o dispositivos edge.
- No es un modelo generativo: no genera texto, solo etiqueta entidades.

## Casos de uso

- Redaccion de datos personales en documentos legales: el modelo identifica nombres, direcciones, numeros de identificacion y otros datos sensibles en contratos o expedientes, permitiendo su anonimizacion automatica antes de compartir o publicar.
- Cumplimiento normativo (GDPR, HIPAA, PCI-DSS): escaneo de bases de datos, logs y archivos de texto para detectar PII y asegurar que se cumplen las regulaciones de privacidad.
- Analisis de logs de aplicaciones: deteccion de passwords, tokens, claves API o IPs en logs de servidores para evitar fugas de informacion en entornos de desarrollo y produccion.
- Filtrado de PII en chatbots y asistentes virtuales: preprocesamiento de las entradas del usuario para eliminar datos personales antes de enviarlas a un LLM, reduciendo riesgos de privacidad.
- Auditoria de datos en empresas: revision de correos, documentos internos o bases de datos para localizar informacion personal y evaluar riesgos de exposicion.
- Monitorizacion de transacciones financieras: deteccion de numeros de cuenta, rutas bancarias o tarjetas de credito en mensajes o registros para prevenir fraudes o fugas.
- Despliegue en el navegador: al ser un modelo ONNX ligero, puede ejecutarse en extensiones de navegador o aplicaciones web para redactar PII en tiempo real sin enviar datos a un servidor externo.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de test de NVIDIA Nemotron-PII (10K instancias):

| Metrica | Valor |
|---|---|
| F1 (micro) | 0,9573 |
| Precision | 0,9596 |
| Recall | 0,9549 |

Segun la model card del modelo original, este rendimiento supera al de LLMs populares como DeepSeek-V4-Flash (84,89) y GPT-4o-Mini (78,69) en la misma tarea, aunque no se especifica si esas cifras corresponden a la misma metrica (probablemente F1). No se dispone de benchmarks adicionales en la informacion proporcionada.

## Requisitos de hardware

- Al ser un modelo de 32M de parametros, la inferencia puede ejecutarse en CPU sin necesidad de GPU. El uso de VRAM es minimo: menos de 200 MB en FP32.
- No requiere GPU dedicada; cualquier CPU moderna con al menos 4 GB de RAM es suficiente para inferencia en lotes.
- Para despliegue en navegador, se recomienda ONNX Runtime Web (onnxruntime-web) con WebAssembly o WebGPU para aceleracion.
- En entornos Node.js, puede usarse onnxruntime-node o Transformers.js directamente.
- No se requieren tarjetas graficas especificas. Si se desea aceleracion por GPU, puede ejecutarse en GPUs consumer como RTX 2060 o superiores, aunque no es necesario.
- Latencia estimada: en CPU, la inferencia sobre un texto de 128 tokens tarda unos pocos milisegundos (dependiendo del hardware). En navegador con WebAssembly, la latencia puede ser de 10-50 ms por ejemplo.
- Opciones de despliegue: Transformers.js, ONNX Runtime (Web, Node, Python), o integracion en pipelines de Hugging Face mediante el pipeline de `token-classification`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (Nemotron-PII) | Licencia | Formato |
|---|---|---|---|---|---|
| ettin-32m-nemotron-pii (este) | 32M | no disponible | 0,9573 | MIT | ONNX |
| ettin-32m-nemotron-pii (original) | 32M | no disponible | 0,9573 | MIT | PyTorch (safetensors) |
| Presidio Analyzer (reglas + modelos) | no aplica (sistema hibrido) | no aplica | no comparable | MIT | Python |
| GLiNER (modelo NER generico) | ~200M | 512 | no disponible | MIT | PyTorch |

La comparacion con Presidio y GLiNER es orientativa: Presidio combina reglas y modelos de ML para deteccion de PII, mientras que GLiNER es un modelo NER generico que puede adaptarse a PII. No se dispone de datos de rendimiento comparativos en el mismo dataset para estos modelos.

## Limitaciones y advertencias

- El modelo solo soporta el idioma ingles. No es util para textos en otros idiomas sin reentrenamiento o adaptacion.
- La longitud de contexto no esta documentada; se recomienda limitar los textos a segmentos cortos (probablemente 512 tokens, pero no confirmado).
- Como todo modelo de NER, puede producir falsos positivos (marcar texto que no es PII) o falsos negativos (no detectar PII real). No debe usarse como unica fuente de verdad en entornos criticos sin supervision humana.
- No es un modelo generativo ni conversacional; su unica funcion es la clasificacion de tokens.
- La version ONNX fue convertida automaticamente; puede haber ligeras diferencias numericas respecto al modelo original en PyTorch.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable de validar el rendimiento en su caso de uso especifico.
- No se proporcionan garantias sobre la precision en dominios muy especializados; se recomienda evaluar con datos propios antes de desplegar en produccion.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/barflyman/ettin-32m-nemotron-pii-ONNX
- Modelo original (PyTorch): https://huggingface.co/kalyan-ks/ettin-32m-nemotron-pii
- Blog post del autor sobre modelos tiny de deteccion de PII: https://huggingface.co/blog/kalyan-ks/tiny-pii-entity-detection-models
- Repositorio ONNX alternativo (rulesentry-io): https://huggingface.co/rulesentry-io/ettin-32m-nemotron-pii-onnx
- Documentacion del pipeline de token-classification en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TokenClassificationPipeline
- Dataset NVIDIA Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
