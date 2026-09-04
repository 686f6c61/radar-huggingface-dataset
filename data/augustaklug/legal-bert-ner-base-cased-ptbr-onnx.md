# augustaklug/legal-bert-ner-base-cased-ptbr-onnx

## Resumen

El modelo `augustaklug/legal-bert-ner-base-cased-ptbr-onnx` es una conversión a ONNX en precisión FP16 del modelo `dominguesm/legal-bert-ner-base-cased-ptbr`, un BERT fine-tuned para reconocimiento de entidades nombradas (NER) en el dominio legal en portugués brasileño. La conversión ha sido realizada por el autor `augustaklug` con el objetivo de permitir la ejecución del modelo en el navegador mediante la librería Transformers.js y la aceleración WebGPU, sin necesidad de un servidor backend.

El modelo original se basa en `dominguesm/legal-bert-base-cased-ptbr`, que a su vez parte de BERTimbau base, un modelo de lenguaje en portugués entrenado con corpus jurídicos. Esta versión ONNX conserva la arquitectura BERT (encoder-only Transformer) y la tarea de token classification, con 13 etiquetas BIO. La longitud máxima de contexto es de 512 tokens. El repositorio tiene un tamaño de 0,2 GB e incluye el archivo `onnx/model_fp16.onnx` de 206,9 MiB, con opset 18 y sin nodos específicos de Microsoft, lo que facilita su uso en runtimes ONNX estándar.

La relevancia de este modelo radica en que permite ejecutar tareas de extracción de entidades legales directamente en el cliente, con ventajas en privacidad, latencia y reducción de costes de infraestructura. Es una opción práctica para aplicaciones web de procesamiento de documentos jurídicos en portugués brasileño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only Transformer) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP16 (model_fp16.onnx) |
| Idiomas soportados | Portugués (pt), específicamente portugués brasileño (pt-BR) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

El modelo es un BERT (encoder-only Transformer) de la familia BERTimbau, fine-tuned para token classification (NER) en el dominio legal en portugués brasileño. El modelo base `dominguesm/legal-bert-base-cased-ptbr` fue entrenado con un corpus de textos legales portugueses utilizando el objetivo de máscara. Posteriormente, se aplicó un fine-tuning con un objetivo de NER para producir el modelo original `dominguesm/legal-bert-ner-base-cased-ptbr`.

La versión ONNX es una conversión directa del checkpoint original, realizada sin fusiones de operadores ni optimización del grafo. La conversión preserva los tipos públicos de entrada y salida: `input_ids`, `attention_mask` y `token_type_ids` en INT64, y `logits` en FLOAT. El grafo utiliza únicamente el dominio ONNX estándar, sin nodos `com.microsoft`, lo que garantiza compatibilidad con runtimes ONNX genéricos. No se ha realizado ningún entrenamiento adicional durante la conversión.

## Capacidades

- Clasificación de tokens (NER) en textos legales en portugués brasileño, con 13 etiquetas BIO.
- Reconocimiento de entidades de tipo `PESSOA`, `ORGANIZACAO`, `LOCAL`, `TEMPO`, `LEGISLACIO` y `JURISPRUDENCIA`, además de otras etiquetas del esquema BIO.
- Tokenizer sensible a mayúsculas y minúsculas (cased), con longitud máxima de 512 tokens.
- Ejecución en el navegador mediante Transformers.js y WebGPU, usando precisión FP16.
- Compatible con runtimes ONNX estándar, como ONNX Runtime en Python o JavaScript.
- No es un modelo generativo; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Extracción de entidades en sentencias judiciales brasileñas: identificar partes, organizaciones, fechas y referencias legislativas para automatizar el análisis de expedientes.
- Revisión automatizada de contratos: detectar personas, empresas y plazos en cláusulas, facilitando la validación de documentos legales.
- Indexación de jurisprudencia: etiquetar automáticamente decisiones judiciales para motores de búsqueda legal, mejorando la recuperación de información.
- Análisis de peticiones y recursos: extraer entidades relevantes para clasificar y priorizar documentos en despachos de abogados.
- Procesamiento en el cliente para privacidad: ejecutar NER directamente en el navegador sin enviar documentos a servidores, lo que resulta útil en entornos con requisitos de confidencialidad.
- Integración en pipelines de e-discovery: preprocesar grandes volúmenes de documentos legales con Transformers.js, aprovechando la aceleración WebGPU para reducir tiempos de procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una validación de la conversión: en ocho frases jurídicas (129 tokens válidos), el modelo FP16 preservó 129/129 predicciones argmax del ONNX FP32. El error absoluto medio en los logits fue de 0,001120 y el error máximo de 0,007393. Esta validación se limita a comprobar la fidelidad de la conversión, no el rendimiento de la tarea NER.

## Requisitos de hardware

- VRAM estimada: el archivo ONNX FP16 ocupa 206,9 MiB, por lo que la inferencia requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU compatible con WebGPU (por ejemplo, NVIDIA RTX 20/30/40, Apple Silicon, Intel Arc). Para ejecución local sin WebGPU, puede utilizarse CPU.
- Cabe en GPU de consumo: sí, es un modelo pequeño que funciona en tarjetas gráficas de gama media y en iGPU modernas.
- Opciones de despliegue: Transformers.js (WebGPU/WebAssembly), ONNX Runtime (Python o JavaScript), o cualquier runtime ONNX compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Licencia | Uso |
|---|---|---|---|---|
| augustaklug/legal-bert-ner-base-cased-ptbr-onnx | ONNX FP16 | 512 | CC BY 4.0 | NER legal pt-BR en navegador |
| dominguesm/legal-bert-ner-base-cased-ptbr | no disponible | 512 | no disponible | NER legal pt-BR |
| dominguesm/legal-bert-base-cased-ptbr | no disponible | 512 | no disponible | Modelo de lenguaje legal pt-BR |

La versión ONNX es funcionalmente equivalente al modelo original, con la ventaja de estar lista para Transformers.js y WebGPU. El modelo base sin fine-tuning no realiza NER, por lo que no es directamente comparable en la tarea.

## Limitaciones y advertencias

- Sesgos no documentados: el modelo puede reflejar sesgos presentes en el corpus legal utilizado para entrenar el modelo base.
- Al ser un modelo discriminativo, no genera texto; los errores de clasificación pueden afectar la precisión de la extracción de entidades.
- Contexto limitado a 512 tokens; documentos más largos requieren truncamiento o estrategias de ventana deslizante.
- Solo soporta portugués brasileño; no es multilingüe y no reconoce entidades en otros idiomas.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero es necesario verificar la licencia del modelo base original para asegurar el cumplimiento.
- La conversión ONNX no incluye fusiones ni optimizaciones del grafo; puede haber diferencias mínimas respecto al modelo FP32 original, aunque la validación reporta un error máximo de 0,007393 en logits.

## Enlaces

- https://huggingface.co/augustaklug/legal-bert-ner-base-cased-ptbr-onnx
- https://huggingface.co/dominguesm/ner-legal-bert-base-cased-ptbr
- https://huggingface.co/dominguesm/legal-bert-base-cased-ptbr
