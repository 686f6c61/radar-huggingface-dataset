# jugaadsrl/gliner2-multi-v1-onnx

## Resumen

GLiNER2 Multi-v1 es un modelo de reconocimiento de entidades nombradas (NER) de cero disparo, desarrollado originalmente por Fastino AI y exportado a formato ONNX por el usuario jugaadsrl para su uso con el motor de inferencia nativo en Rust `gliner2-rs`. Este modelo permite identificar cualquier tipo de entidad en tiempo de inferencia sin necesidad de ajuste fino: basta con proporcionar una lista de etiquetas junto con el texto, y el modelo puntúa cada segmento candidato para cada etiqueta.

La versión ONNX aquí presentada está fragmentada en varios componentes (encoder, span_rep, count_pred, count_lstm, classifier) para ser directamente compatible con `gliner2-rs`, el motor de inferencia sin Python. Además, se ofrecen variantes V2 con fusión de operaciones y soporte de IOBinding, que reducen la latencia en GPUs discretas al evitar transferencias por PCIe. El modelo soporta cinco idiomas: italiano, inglés, francés, español y alemán.

La relevancia actual de este modelo radica en su capacidad de extracción de entidades flexible y multilingüe, combinada con un despliegue eficiente en entornos de producción gracias a la inferencia ONNX y Rust, tanto en GPU como en CPU y NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes adicionales (encoder, span_rep, count_pred, count_lstm, classifier) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, fp32, fp16_v2 (fusión con IOBinding), fp32_v2 |
| Idiomas soportados | italiano, ingles, frances, español, aleman |
| Licencia | no disponible |
| Formato de pesos | ONNX (fragmentado en varios archivos) |

## Arquitectura y entrenamiento

La arquitectura de GLiNER2 se basa en un encoder transformer que procesa el texto de entrada y genera representaciones de segmentos. A partir de ahí, componentes adicionales como `span_rep`, `count_pred`, `count_lstm` y `classifier` se encargan de predecir el número de entidades, representar los segmentos y clasificarlos según las etiquetas proporcionadas. La exportación ONNX fragmentada permite que cada componente se ejecute de forma independiente, optimizando el uso de memoria y la latencia.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card solo indica que es una exportación del modelo `fastino/gliner2-multi-v1` y que se han aplicado correcciones técnicas en la exportación, como el reemplazo de `CompileSafeGRU` por `nn.GRU` nativo para resolver errores de ONNX en secuencias de longitud variable. En las variantes V2, el operador `Einsum` se sustituye por una combinación de `Reshape`, `MatMul` y `Transpose` para garantizar compatibilidad con proveedores de ejecución que no soportan `Einsum` en FP16 (como QNN o CoreML).

## Capacidades

- Reconocimiento de entidades nombradas de cero disparo: acepta cualquier lista de etiquetas en tiempo de inferencia, sin necesidad de entrenamiento adicional.
- Multilingüe: soporta italiano, inglés, francés, español y alemán.
- Token-classification: pipeline de Hugging Face para clasificación de tokens.
- Compatible con el motor Rust `gliner2-rs`, que permite descarga dinámica de pesos y ejecución sin Python.
- Variantes V2 con fusión de operaciones y IOBinding para reducir latencia en GPUs discretas (NVIDIA CUDA, AMD ROCm, Apple CoreML).
- Soporte de ejecución en CPU (AVX, XNNPACK) y NPU (Qualcomm QNN).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto; el modelo está especializado en extracción de entidades.

## Casos de uso

- Extracción de entidades en documentos multilingües: el modelo puede identificar personas, organizaciones, ubicaciones, fechas, etc., en textos que mezclan varios de los cinco idiomas soportados, sin necesidad de entrenar un modelo por idioma.
- Filtrado de información personal (PII): aunque este repositorio es específico para el modelo multi-v1, existe una variante dedicada a PII (gliner2-privacy-filter-PII-multi-onnx) que se basa en la misma arquitectura; este modelo puede adaptarse para detectar nombres, direcciones, correos electrónicos, etc., en aplicaciones de privacidad.
- Automatización de procesos de negocio: extracción de entidades de facturas, contratos o correos electrónicos en entornos empresariales multilingües, con despliegue en Rust para alta eficiencia.
- Análisis de redes sociales o comentarios: identificación de marcas, productos o personas mencionadas en textos cortos en varios idiomas, con baja latencia para procesamiento en tiempo real.
- Enriquecimiento de bases de datos: extracción de entidades de grandes volúmenes de texto (artículos, noticias, informes) para poblar campos estructurados, aprovechando la ejecución en CPU o NPU para reducir costes.
- Sistemas de búsqueda semántica: uso de las entidades extraídas como metadatos para indexar y recuperar documentos de forma más precisa, especialmente en corpus multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo incluye una tabla de rendimiento de inferencia medida en tiempo medio por entidad extraída, en una tarea con hasta 62 clases. Los datos son los siguientes:

| Hardware | Execution Provider | Model Variant | Avg Time / Entity |
| :--- | :--- | :--- | :--- |
| NVIDIA RTX 4090 | CUDA (V2 IOBinding) | fp16_v2 | ~7.0 ms |
| NVIDIA RTX 3090 | CUDA (V2 IOBinding) | fp16_v2 | ~7.2 ms |
| NVIDIA RTX 4090 | CUDA (V1 Standard) | fp16 | ~12.0 ms |
| NVIDIA RTX 3090 | CUDA (V1 Standard) | fp16 | ~11.6 ms |
| Qualcomm Snapdragon X Elite | QNN (NPU Native) | fp16 | ~22.78 ms |
| AMD Ryzen 9 5900XT (16-Core) | CPU (x86 AVX2) | fp32_v2 | ~20.6 ms |
| Qualcomm Snapdragon X Elite | CPU (ARM NEON) | fp32 | ~28.62 ms |

Estos valores son orientativos y dependen del hardware y de la variante del modelo. No se proporcionan métricas de precisión, recall o F1.

## Requisitos de hardware

- El tamaño del repositorio es de 4.4 GB, lo que da una idea del espacio en disco necesario para los pesos (aunque las variantes individuales pueden ocupar menos).
- Para GPU NVIDIA: se recomienda al menos una RTX 3090 o superior para usar las variantes V2 con IOBinding y obtener latencias de ~7 ms por entidad. Una RTX 4090 ofrece resultados similares.
- Para CPU: se puede ejecutar en procesadores x86 con AVX2 (por ejemplo, AMD Ryzen 9 5900XT) usando la variante fp32_v2, con ~20.6 ms por entidad. También es compatible con ARM NEON (Snapdragon X Elite) con ~28.62 ms.
- Para NPU: Qualcomm Snapdragon X Elite con QNN puede ejecutar la variante fp16 estándar con ~22.78 ms por entidad.
- No se indica la VRAM mínima requerida, pero dado el tamaño del modelo (4.4 GB de pesos), se estima que una GPU con al menos 6-8 GB de VRAM podría ser suficiente para las variantes fp16, aunque no se confirma.
- Opciones de despliegue: el motor recomendado es `gliner2-rs` (Rust), que soporta las variantes V1 y V2. También existe `gliner2-onnx` para Python (experimental) y `@lmoe/gliner-onnx.js` para Node.js.
- La latencia y el throughput dependen del hardware y de la variante; los valores de la tabla anterior son una referencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (por ejemplo, GLiNER original, spaCy, o modelos NER multilingües como XLM-RoBERTa). La model card no incluye comparativas de calidad ni de rendimiento frente a otros modelos. Se puede mencionar que el modelo original `fastino/gliner2-multi-v1` es la base, y que existen otras exportaciones ONNX del mismo modelo (por ejemplo, `lion-ai/gliner2-multi-v1-onnx`), pero no se dispone de datos comparativos cuantitativos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones de contexto. El modelo está especializado en NER, por lo que no genera texto libre; la alucinación se manifiesta como entidades incorrectas o inexistentes.
- La licencia no está disponible, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar con el autor o consultar la licencia del modelo original de Fastino AI.
- El modelo solo soporta cinco idiomas (it, en, fr, es, de); no es adecuado para otros idiomas sin adaptación.
- La longitud de contexto no se especifica; es probable que esté limitada por el encoder subyacente, pero no se confirma.
- Las variantes V2 requieren `gliner2-rs >= 0.4.1`; si se usa una versión anterior, no serán compatibles.
- La ejecución en NPU (QNN) solo está probada con la variante fp16 estándar, no con las V2.
- El modelo está pensado para extracción de entidades; no debe usarse para tareas de generación de texto, razonamiento o diálogo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jugaadsrl/gliner2-multi-v1-onnx
- Repositorio del motor Rust gliner2-rs: https://github.com/dariofinardi/gliner2-rs
- Repositorio original de GLiNER2 (Fastino AI): https://github.com/fastino-ai/GLiNER2
- Herramienta de conversión ONNX experimental: https://github.com/lmoe/gliner2-onnx
- Paquete PyPI gliner2-onnx: https://pypi.org/project/gliner2-onnx/
- Exportación ONNX alternativa del mismo modelo: https://huggingface.co/lion-ai/gliner2-multi-v1-onnx
- Variante de filtro de PII basada en GLiNER2: https://huggingface.co/jugaadsrl/gliner2-privacy-filter-PII-multi-onnx
