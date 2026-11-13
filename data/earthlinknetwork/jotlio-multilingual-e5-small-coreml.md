# earthlinknetwork/jotlio-multilingual-e5-small-coreml

## Resumen

`jotlio-multilingual-e5-small-coreml` es una conversión a Core ML del modelo de embeddings `intfloat/multilingual-e5-small`, publicada por el usuario `earthlinknetwork` para su uso en la aplicación Jotlio. No se trata de un modelo generativo, sino de un encoder de frases (sentence-embeddings) que transforma texto en vectores densos de 384 dimensiones, pensado para búsqueda semántica y recuperación de información en el propio dispositivo.

La relevancia de esta ficha es acotada: el modelo hereda las capacidades del original (multilingüe, contexto de 512 tokens, prefijos `query:`/`passage:`) pero las empaqueta en un `.mlpackage` con pesos int8 y cómputo fp32, ejecutable vía Core ML en plataformas Apple. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

Conviene subrayar que la información pública disponible es mínima: la model card se limita a describir el paquete y el tokenizador incluidos, sin detallar composición del dataset de entrenamiento original ni resultados de evaluación. Todo dato no documentado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (heredada de `intfloat/multilingual-e5-small`) |
| Parametros totales | no disponible (el modelo base e5-small ronda los 118 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (n ≤ 512, un texto por llamada, sin padding) |
| Tipos de cuantizacion | Pesos int8 lineales simetricos, computo fp32 (coremltools 9) |
| Idiomas soportados | multilingue (segun el modelo base; lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML) + tokenizador original en `e5-small-tokenizer/` |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. La arquitectura subyacente corresponde al encoder transformer de `intfloat/multilingual-e5-small` (revisión `614241f622f53c4eeff9890bdc4f31cfecc418b3`), que produce embeddings de frase mediante mean-pooling seguido de normalización L2. La conversión a Core ML emplea coremltools 9 con cuantización int8 lineal-simétrica de los pesos y cómputo en fp32; la entrada es un tensor `ids` de forma 1 × n (int32, n ≤ 512) y la salida un vector `vec` de 384 dimensiones ya normalizado.

No se documenta en la información proporcionada el volumen de tokens de entrenamiento, la composición del corpus multilingüe, ni si el modelo original empleó técnicas de contraste tipo InfoNCE, destilación o ajuste fino supervisado. Tampoco se detalla ninguna innovación adicional más allá de la propia conversión on-device. El script de conversión se referencia como `spikes/rag-ondevice-embedding/coreml.py` en el repositorio de Jotlio.

## Capacidades

- Generación de embeddings de frase para búsqueda semántica y recuperación densa (RAG).
- Soporte multilingüe heredado del modelo base (lista exacta de idiomas no disponible).
- Codificación de consultas y pasajes mediante prefijos obligatorios `query: ` y `passage: `.
- Similitud coseno directa gracias a la normalización L2 de la salida.
- Ejecución completamente local en dispositivos Apple mediante Core ML, sin envío de datos a servidores.
- Procesamiento de un texto por llamada, con longitud máxima de 512 tokens y sin padding.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento explícito.

## Casos de uso

- Búsqueda semántica on-device en aplicaciones iOS/macOS: el modelo indexa pasajes con prefijo `passage:` y codifica consultas con `query:`, permitiendo recuperación local sin conexión gracias a los 512 tokens de contexto y a los vectores de 384 dimensiones.
- RAG privado en el dispositivo: al ejecutarse vía Core ML y no enviar datos a ningún servidor, encaja en escenarios con requisitos de privacidad (notas personales, documentos médicos, correo local).
- Deduplicación y clustering de textos multilingües: la normalización L2 permite usar similitud coseno directamente para agrupar documentos o detectar duplicados en lotes.
- Filtrado y clasificación zero-shot ligera: comparando embeddings de documentos con embeddings de etiquetas descriptivas se pueden construir clasificadores sin entrenamiento adicional.
- Cache semántico para asistentes: almacenar respuestas indexadas por embedding de la pregunta para reutilizar respuestas ante consultas parafraseadas, reduciendo llamadas a modelos generativos.
- Búsqueda en bases de conocimiento internas empaquetadas con la app: al ocupar 0,1 GB, el paquete puede distribuirse junto con la aplicación y ejecutarse en CPU/ANE sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en dispositivos Apple con soporte Core ML (iPhone, iPad, Mac con chip Apple Silicon o Intel compatible).
- VRAM/unified memory estimada: no disponible; el paquete pesa 0,1 GB y los pesos son int8, por lo que la huella debería ser muy reducida, pero no se aportan cifras oficiales.
- GPU recomendadas: no aplica en el sentido tradicional; se ejecuta en CPU, GPU o Neural Engine de Apple según la política de Core ML.
- Cabe en hardware consumer Apple sin problema aparente por tamaño, aunque no se documentan latencias ni throughput.
- Opciones de despliegue: Core ML (librería `coreml`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dim. embedding | Licencia | Formato |
|---|---|---|---|---|---|
| jotlio-multilingual-e5-small-coreml | no disponible | 512 | 384 | MIT | Core ML (.mlpackage) |
| intfloat/multilingual-e5-small | no disponible | 512 | 384 | MIT | safetensors / PyTorch |
| intfloat/multilingual-e5-base | no disponible | 512 | 768 | MIT | safetensors / PyTorch |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible | 128 | 384 | Apache-2.0 | safetensors / PyTorch |

La comparativa se limita a datos estructurales; no se dispone de métricas de rendimiento (MTEB u otras) en la información proporcionada para ninguno de los modelos listados.

## Limitaciones y advertencias

- Modelo de embeddings, no generativo: no produce texto, código ni respuestas; solo vectores.
- Requiere el prefijo `query: ` o `passage: ` según el uso; omitirlo degrada la calidad de la recuperación.
- Límite estricto de 512 tokens por texto y una sola entrada por llamada, sin padding por lote.
- Dependencia de la plataforma Apple: el `.mlpackage` no es portable a Linux, Windows o Android sin reconversión.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al heredar el modelo base puede reflejar sesgos de su corpus; el riesgo de alucinación no aplica en sentido estricto, aunque sí el de recuperaciones irrelevantes.
- Idiomas: aunque se etiqueta como multilingüe, no se detalla la cobertura ni la calidad por idioma.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución a los autores originales de `intfloat/multilingual-e5-small`.
- Sin métricas publicadas de calidad ni de latencia: no recomendable para producción sin una evaluación propia previa.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/earthlinknetwork/jotlio-multilingual-e5-small-coreml
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio de Jotlio (script de conversión `spikes/rag-ondevice-embedding/coreml.py`): no disponible como URL en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
