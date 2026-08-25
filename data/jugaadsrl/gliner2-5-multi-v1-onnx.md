# jugaadsrl/gliner2.5-multi-v1-onnx

## Resumen

GLiNER2.5 Multi es un modelo de extracción de información basado en esquemas, desarrollado por Fastino AI y publicado originalmente como `fastino/gliner2.5-multi-v1`. Esta ficha describe la conversión a ONNX realizada por Jugaad s.r.l., que permite ejecutar el modelo sin Python en entornos de producción con Rust, C++ u otros lenguajes. El modelo resuelve tareas de reconocimiento de entidades nombradas (NER), extracción de relaciones y clasificación de texto mediante consultas en lenguaje natural, sin necesidad de ajuste fino por dominio.

La arquitectura GLiNER2.5 introduce un enfoque de "boundary" (límites) que itera sobre consultas de esquema y candidatos propuestos, en lugar de predecir etiquetas fijas. El modelo base es un mDeBERTa-v3-base con 512 tokens de contexto máximo, y soporta múltiples idiomas. La versión ONNX se exporta como un pipeline de fragmentos orquestados por el host, con variantes de precisión FP32 y FP16, y cabezales de límites segmentados por buckets de longitud (64, 128, 256 y 512 palabras). Esta conversión es relevante porque permite desplegar el modelo en entornos de producción de baja latencia sin dependencias de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mDeBERTa-v3-base (encoder) + boundary heads (GLiNER2.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (max_position_embeddings = 512) |
| Tipos de cuantizacion | FP32, FP16, FP16 con IOBinding |
| Idiomas soportados | Multilingue (incluye ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fragmentos: encoder, boundary heads, routed_gather, classifier) |

## Arquitectura y entrenamiento

GLiNER2.5 utiliza una arquitectura de "boundary" que no puede exportarse como un unico grafo ONNX. En su lugar, se exporta como un pipeline de fragmentos: un encoder (mDeBERTa-v3-base) que produce el estado oculto final, un `routed_gather` que selecciona estados de texto, consultas y opciones, y multiples `boundary_head_L{bucket}` que generan pares de indices (inicio, fin) para candidatos, logits por consulta, logits de abstencion y tasas de recuento esperadas. El pool de candidatos es constante (192) y compartido entre todas las consultas. La decodificacion (sigmoid, umbral por consulta, politica de solapamiento, ranking) se deja al host.

Los cabezales de limites tienen un `num_words` estatico porque `torch.export` especializa esa dimension. Por eso se exporta un cabezal por bucket de longitud (64, 128, 256 y 512 palabras) y el runtime selecciona el mas pequeno que se ajuste al texto, rellenando el resto con `text_mask = 0`. El relleno con mascara se verifica como transparente: para las mismas palabras reales, rellenar a un bucket mayor (incluso con ruido aleatorio en las filas rellenadas) produce el mismo conjunto de candidatos y probabilidades con una diferencia maxima de 5e-07. Textos de mas de 512 palabras deben dividirse en fragmentos.

## Capacidades

- Reconocimiento de entidades nombradas (NER) basado en esquemas definidos por el usuario mediante consultas en lenguaje natural.
- Extraccion de relaciones entre entidades.
- Clasificacion de texto.
- Extraccion de limites (boundary extraction) con candidatos propuestos por el modelo.
- Soporte multilingue (el modelo base es mDeBERTa-v3-base, entrenado en multiples idiomas).
- Capacidad de abstencion por consulta (el modelo puede indicar que no hay menciones validas).
- Estimacion del numero esperado de menciones por consulta (count log rates).
- Inferencia sin Python gracias a la exportacion ONNX y el motor Rust `gliner25-rs`.

## Casos de uso

- Redaccion asistida y edicion de documentos: el modelo se usa en produccion dentro de Edito y Omissis de Jugaad s.r.l. para detectar y extraer entidades en textos legales o editoriales, permitiendo automatizar tareas de revision y anonimizacion.
- Anonimizacion de datos personales (PII): con un esquema de consultas como "nombre", "direccion", "correo electronico", el modelo identifica y extrae estas entidades para su posterior enmascaramiento o eliminacion en documentos.
- Extraccion de relaciones en articulos cientificos: permite extraer pares de entidades y sus relaciones (por ejemplo, "proteina X interactua con gen Y") a partir de textos biomedicos, facilitando la construccion de bases de conocimiento.
- Clasificacion de textos legales: mediante consultas de esquema como "clausula de indemnizacion" o "obligacion de confidencialidad", el modelo clasifica segmentos de contratos para su revision automatizada.
- Sistemas de busqueda semantica: el modelo puede extraer entidades de consultas de usuario y documentos para mejorar la recuperacion de informacion en motores de busqueda internos.
- Procesamiento de documentos en Rust: gracias a la exportacion ONNX y el motor `gliner25-rs`, el modelo se integra en pipelines de procesamiento de documentos escritos en Rust, sin necesidad de un servidor Python, reduciendo latencia y costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros modelos en tareas como MMLU, HumanEval o GSM8K. La unica informacion de rendimiento disponible es la verificacion de paridad con PyTorch, que muestra diferencias maximas de 1.8e-06 (FP32) y 1.5e-03 (FP16) para el encoder, y 1.4e-06 (FP32) y 2.5e-03 (FP16) para las probabilidades de los boundary heads.

## Requisitos de hardware

- Tamano del repositorio: 2.3 GB (incluye todas las variantes de precision).
- Variante FP32: aproximadamente 1.1 GB (encoder 1060 MB + cabezales + clasificador).
- Variante FP16: aproximadamente 540 MB (encoder 531 MB + cabezales + clasificador).
- La variante FP16 con IOBinding esta pensada para CUDA, ROCm y QNN con IOBinding.
- La variante FP32 es el fallback universal, compatible con OpenVINO y CPU.
- La variante FP16 con I/O FP32 esta pensada para CoreML.
- El modelo puede ejecutarse en GPU de consumo (por ejemplo, RTX 4090 con 24 GB VRAM) y en CPU, aunque la latencia dependera del hardware y del bucket de longitud seleccionado.
- Opciones de despliegue: motor Rust `gliner25-rs` (github.com/dariofinardi/gliner25-rs), que consume los archivos ONNX directamente. Tambien puede usarse con ONNX Runtime en otros lenguajes.
- No se proporcionan datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jugaadsrl/gliner2.5-multi-v1-onnx | mDeBERTa-v3 + boundary heads | 512 tokens | Apache 2.0 | ONNX | Version ONNX para inferencia sin Python |
| fastino/gliner2.5-multi-v1 | mDeBERTa-v3 + boundary heads | 512 tokens | Apache 2.0 | PyTorch | Modelo original en PyTorch |
| jugaadsrl/GLiNER2-Guardrails-PII-Multi-onnx | GLiNER2 (no boundary) | no disponible | Apache 2.0 | ONNX | Variante especializada en PII con arquitectura GLiNER2 clasica |

La comparativa se limita a las variantes del mismo modelo y a la version especializada en PII. No se dispone de informacion sobre modelos comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Longitud de contexto limitada a 512 tokens: textos mas largos deben dividirse en fragmentos, lo que puede afectar a la coherencia de las entidades extraidas en documentos extensos.
- El orden de los candidatos en el pool no tiene significado semantico: al comparar candidatos entre variantes de precision, debe hacerse como un conjunto de pares (inicio, fin), nunca posicionalmente, debido a la inestabilidad del orden en el argsort bajo FP16.
- La arquitectura boundary no puede exportarse como un unico grafo ONNX: requiere un orquestador en el host que gestione los fragmentos, lo que anade complejidad al despliegue.
- No se proporcionan datos de sesgos o alucinacion especificos de este modelo. Como modelo multilingue basado en mDeBERTa, puede heredar sesgos presentes en sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de la licencia del modelo base y de los datos utilizados para el entrenamiento.
- No se incluyen resultados de benchmarks en la informacion disponible, por lo que no es posible evaluar el rendimiento relativo frente a otros modelos de extraccion de informacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jugaadsrl/gliner2.5-multi-v1-onnx
- Modelo base en Hugging Face: https://huggingface.co/fastino/gliner2.5-multi-v1
- Repositorio del motor Rust: https://github.com/dariofinardi/gliner25-rs
- Repositorio de GLiNER2: https://github.com/fastino-ai/GLiNER2
- Paper en arXiv: https://arxiv.org/abs/2507.18546
- Variante PII en ONNX: https://huggingface.co/jugaadsrl/GLiNER2-Guardrails-PII-Multi-onnx
- Repositorio de la variante PII: https://github.com/dariofinardi/gliner2-guardrails-PII-Multi-onnx
