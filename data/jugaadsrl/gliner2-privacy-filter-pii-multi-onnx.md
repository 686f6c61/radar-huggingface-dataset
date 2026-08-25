# jugaadsrl/gliner2-privacy-filter-PII-multi-onnx

## Resumen

El modelo `jugaadsrl/gliner2-privacy-filter-PII-multi-onnx` es una exportación a ONNX del modelo `fastino/gliner2-privacy-filter-PII-multi`, un detector de información personal identificable (PII) construido sobre GLiNER2, un transformer bidireccional de aproximadamente 205 millones de parámetros desarrollado por Fastino AI. Esta versión ONNX está fragmentada en ocho componentes (encoder, token_gather, span_rep, schema_gather, count_pred_argmax, count_lstm_fixed, scorer y classifier) para permitir la inferencia sin dependencias de Python, usando el motor nativo en Rust `gliner2-rs`.

El modelo detecta 42 tipos de entidades PII en siete idiomas (inglés, francés, español, alemán, italiano, portugués y neerlandés), cubriendo categorías como nombres, datos de contacto, identificaciones gubernamentales, información bancaria, credenciales digitales y fechas sensibles. Su relevancia actual radica en la creciente necesidad de redactar datos personales en producción, especialmente en entornos que requieren baja latencia y despliegue sin Python, como servicios de anonimización, cumplimiento normativo y filtrado de logs.

La exportación incluye variantes FP16 y FP32, con una versión V2 que fusiona operaciones de Gather, ArgMax y MatMul en los grafos ONNX para lograr transferencia zero-copy en GPU mediante IOBinding, reduciendo la latencia de inferencia aproximadamente un 30 % en GPUs discretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (transformer bidireccional para extracción de spans) |
| Parametros totales | ~205 M (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, FP32 |
| Idiomas soportados | en, fr, es, de, it, pt, nl |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX fragmentado (8 fragmentos por variante) |

## Arquitectura y entrenamiento

El modelo base `fastino/gliner2-privacy-filter-PII-multi` es un fine-tuning de GLiNER2, un modelo de extracción de spans basado en un transformer bidireccional de 205 millones de parámetros. GLiNER2 está diseñado para reconocer entidades arbitrarias a partir de descripciones textuales, lo que permite detectar los 42 tipos de PII definidos en este modelo sin necesidad de una cabecera de clasificación específica por etiqueta. El entrenamiento se realizó sobre datos multilingües para cubrir siete idiomas europeos, y el modelo alcanza una puntuación F1 de 0,477 a nivel de span en el benchmark SPY, según fuentes secundarias.

La exportación ONNX fragmenta el modelo en ocho componentes que se encadenan secuencialmente: el encoder procesa el texto, token_gather selecciona los tokens relevantes, span_rep construye las representaciones de los spans candidatos, schema_gather incorpora las descripciones de las entidades, count_pred_argmax y count_lstm_fixed predicen el número de entidades, y finalmente scorer y classifier puntúan y clasifican los spans. La variante V2 fusiona operaciones de Gather, ArgMax y MatMul directamente en los grafos ONNX, de modo que los tensores permanecen en la VRAM de la GPU o NPU sin transferencias por el bus PCIe, lo que reduce la latencia aproximadamente un 30 % en GPUs discretas.

## Capacidades

- Detección de 42 tipos de entidades PII organizados en siete grupos: nombres y fechas de nacimiento, datos de contacto y dirección, identificaciones gubernamentales y fiscales, información bancaria y de pago, identidad digital, credenciales y secretos, y fechas sensibles.
- Extracción de spans a nivel de token con puntuación de confianza por entidad.
- Soporte multilingüe para inglés, francés, español, alemán, italiano, portugués y neerlandés.
- Inferencia sin Python mediante el motor Rust `gliner2-rs`, con carga automática de los fragmentos desde Hugging Face.
- Redacción de PII integrada a través de la crate `gliner2-privacy`, que agrupa las 42 etiquetas en tipos y proporciona funciones de redacción directa sobre el texto.
- Compatibilidad con ONNX Runtime en Python para integraciones que requieran control manual del pipeline.
- Variantes FP16 y FP32 con soporte para NVIDIA CUDA, AMD ROCm, Apple CoreML, Qualcomm QNN y CPU (AVX2, XNNPACK, ARM NEON).

## Casos de uso

- Anonimización de documentos corporativos: el modelo puede procesar contratos, informes o actas para detectar y redactar nombres, direcciones, números de identificación y datos bancarios antes de compartirlos con terceros, gracias a su cobertura de 42 tipos de PII y su capacidad multilingüe.
- Cumplimiento de RGPD en bases de datos de clientes: integrado en un pipeline de Rust, permite escanear registros de usuarios y enmascarar campos sensibles como correos electrónicos, teléfonos o IBAN antes de exportar datos a entornos de desarrollo o análisis.
- Filtrado de logs de aplicaciones: los logs de producción suelen contener IPs, tokens de acceso o nombres de usuario; el modelo puede ejecutarse como un servicio de bajo nivel en Rust para redactar estas entidades en tiempo real sin añadir dependencias de Python al stack.
- Redacción de PII en atención al cliente: al procesar transcripciones de chats o correos, el modelo identifica y oculta información personal antes de almacenar o enviar los datos a sistemas de análisis o formación de modelos.
- Preparación de datasets para entrenamiento de LLMs: antes de publicar o compartir corpus de texto, el modelo permite eliminar PII de forma automática, reduciendo el riesgo de fuga de datos personales en modelos entrenados con datos públicos.
- Detección de credenciales en repositorios de código: con las etiquetas `api_key`, `access_token`, `password` y `secret`, el modelo puede escanear archivos de configuración o commits para localizar y alertar sobre secretos expuestos, integrándose en herramientas de seguridad de CI/CD.

## Benchmarks y rendimiento

Según la información disponible, el modelo base `fastino/gliner2-privacy-filter-PII-multi` alcanza una puntuación F1 de 0,477 a nivel de span en el benchmark SPY, siendo la más alta entre los modelos comparados en ese estudio. No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, etc.) para esta exportación ONNX, ya que se trata de un modelo especializado en detección de PII y no en tareas generales de lenguaje.

| Benchmark | Resultado |
|---|---|
| SPY (span-level F1) | 0,477 |

## Requisitos de hardware

- Tamaño de los pesos: aproximadamente 590 MB en FP16 y 1,17 GB en FP32 por variante completa (8 fragmentos).
- VRAM estimada para inferencia: la variante FP16 puede ejecutarse en GPUs con al menos 2 GB de VRAM, aunque se recomienda 4 GB o más para procesar documentos largos con múltiples entidades.
- GPUs compatibles: NVIDIA CUDA, AMD ROCm, Apple CoreML (GPU unificada) y Qualcomm QNN (NPU).
- CPUs compatibles: cualquier CPU con soporte AVX2, XNNPACK o ARM NEON para la variante FP32.
- Opciones de despliegue: motor Rust `gliner2-rs` (recomendado), ONNX Runtime en Python, o integración manual con cualquier runtime ONNX.
- Latencia: la variante V2 con IOBinding reduce la latencia aproximadamente un 30 % en GPUs discretas en comparación con la variante estándar, según la documentación del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jugaadsrl/gliner2-privacy-filter-PII-multi-onnx | ~205 M | no disponible | 7 | Apache-2.0 | ONNX fragmentado |
| fastino/gliner2-privacy-filter-PII-multi | ~205 M | no disponible | 7 | Apache-2.0 | PyTorch |
| GLiNER2 base (modelo original) | ~205 M | no disponible | multilingue | Apache-2.0 | PyTorch |

La comparativa se limita a los modelos de la misma familia GLiNER2, ya que no se dispone de información sobre alternativas de otros desarrolladores con especificaciones equivalentes en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre siete idiomas europeos; no soporta lenguas asiáticas, árabes u otras familias lingüísticas, lo que limita su uso en entornos globales.
- La puntuación F1 de 0,477 en el benchmark SPY indica que existe un margen significativo de error en la detección de spans, especialmente en documentos ruidosos o con formatos no estándar.
- No se especifica la longitud máxima de contexto; es probable que el modelo tenga limitaciones en documentos muy extensos, por lo que se recomienda segmentar el texto antes de la inferencia.
- La exportación ONNX está optimizada para el motor Rust `gliner2-rs`; su uso con otros runtimes ONNX puede requerir ajustes manuales en el encadenamiento de los fragmentos.
- Aunque la licencia es Apache-2.0, el modelo base depende de GLiNER2, cuyos términos de uso deben verificarse para aplicaciones comerciales.
- El modelo no distingue entre PII real y datos ficticios; en entornos de prueba puede generar falsos positivos que requieran revisión humana.
- La variante V2 con IOBinding solo está disponible para los fragmentos FP16 y FP32; no hay soporte para cuantización de 8 bits u otras precisiones reducidas.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/jugaadsrl/gliner2-privacy-filter-PII-multi-onnx
- Modelo base en Hugging Face: https://huggingface.co/fastino/gliner2-privacy-filter-PII-multi
- Motor de inferencia Rust gliner2-rs: https://github.com/dariofinardi/gliner2-rs
- Repositorio de filtro de privacidad en Rust: https://github.com/dariofinardi/gliner2-privacy-filter-rs
- Paper de GLiNER2-PII en arXiv: https://arxiv.org/abs/2605.09973
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gliner2-privacy-filter-pii-multi-fastino
