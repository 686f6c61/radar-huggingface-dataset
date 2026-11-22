# masahiroid/ruri-v3-310m-coreml

## Resumen

`ruri-v3-310m-coreml` es una conversión no oficial a Core ML del modelo de embeddings de frases `cl-nagoya/ruri-v3-310m`, desarrollado originalmente por la Universidad de Nagoya (organización cl-nagoya). El modelo base es un ModernBERT-Ja de 315 millones de parámetros con dimensión oculta de 768, especializado en similitud semántica de frases en japonés. Esta conversión, publicada por el usuario masahiroid, permite ejecutar el modelo directamente en dispositivos iOS y macOS mediante el framework Core ML de Apple, sin necesidad de un servidor ni de dependencias de Python en tiempo de inferencia.

El problema que resuelve es la brecha entre un modelo de embeddings de alta calidad entrenado en PyTorch y su despliegue en aplicaciones móviles nativas. Core ML no traza bien grafos de longitud variable, por lo que la conversión divide el modelo en variantes de longitud de secuencia fija (128, 256 y 512 tokens) y ofrece pesos en fp16 e int8. El resultado es un paquete de aproximadamente 630 MB en fp16 o 316 MB en int8, con una latencia de unos 5 ms por frase en un iPhone 17 Pro, según la verificación del autor.

La relevancia actual radica en que demuestra un flujo de trabajo reproducible para llevar modelos de recuperación de información y búsqueda semántica a aplicaciones nativas de Apple, con una pérdida de precisión mínima (diferencia de similitud de como máximo 0,0042 entre fp16 e int8) y una fidelidad de 0,9998 o superior frente a la salida original de PyTorch. Incluye además una demo pública en WebGPU (Ruri Atlas) y una aplicación real en producción en la App Store japonesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-Ja (transformer encoder) |
| Parametros totales | 315 M (310 M según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128, 256 y 512 tokens (variantes separadas por bucket) |
| Tipos de cuantizacion | fp16 e int8 (weight-only) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML) |
| Dimension del embedding | 768 |
| Normalizacion | mean pooling + L2 normalize (salida normalizada) |
| Tamano del repo | 2,8 GB |
| Tamano por variante | 630 MB (fp16), 316 MB (int8) |
| Modelo base | cl-nagoya/ruri-v3-310m |
| Tokenizer | ModernBERT-Ja / familia PLaMo (`tokenizer.json` original) |

## Arquitectura y entrenamiento

El modelo base es un ModernBERT adaptado al japonés, un transformer encoder con atención bidireccional y mecanismos de atención eficiente propios de la familia ModernBERT. La conversión envuelve el modelo en un módulo `nn.Module` que aplica mean pooling sobre las representaciones de tokens y posteriormente normaliza L2, de modo que la salida es un vector de 768 dimensiones listo para usar con producto escalar en lugar de similitud coseno. El proceso de conversión se realizó con `torch.jit.trace` y el conversor de Core ML; fue necesario sustituir las implementaciones de `transformers.masking_utils.and_masks` y `or_masks` (que usan `Tensor.new_ones`/`new_zeros`, no soportados por el conversor) por equivalentes basados en `torch.ones`/`torch.zeros`.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. El esquema de prefijos "1+3" es una innovación destacable del modelo base: el texto debe prefijarse según su rol (cadena vacía para similitud general, `トピック: ` para clasificación, `検索クエリ: ` para consultas de recuperación y `検索文書: ` para documentos). Este esquema es obligatorio para reproducir el comportamiento del modelo original y afecta directamente a la calidad de los embeddings.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones, normalizados L2, aptos para búsqueda semántica y similitud.
- Similitud semántica entre textos en japonés e inglés.
- Extracción de características (`feature-extraction`) para pipelines de recuperación.
- Clasificación y clustering de textos mediante el prefijo `トピック: `.
- Recuperación de información (retrieval) con prefijos específicos para consulta y documento.
- Ejecución en GPU y Neural Engine de Apple mediante `computeUnits = .all`.
- Soporte de cuantización int8 con pérdida mínima de precisión (diferencia máxima de 0,0042 en puntuaciones de similitud).
- No dispone de tool calling, capacidades de agente, generación de texto libre, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones iOS nativas: integración del `.mlpackage` int8 en una app Swift para indexar y recuperar documentos localmente, sin enviar datos a un servidor, con latencia de aproximadamente 5 ms por frase en hardware reciente.
- Comparación de textos con literatura clásica japonesa: es el uso real documentado por el autor en la app "道程 -Michinori-", que compara la entrada del usuario con pasajes de obras clásicas y usa este modelo para la búsqueda inicial de candidatos por embedding.
- Clasificación y clustering de contenidos en el dispositivo: uso del prefijo `トピック: ` para agrupar artículos, correos o notas por temática sin conexión.
- Deduplicación y detección de near-duplicates en corpus japoneses: cálculo de producto escalar entre embeddings normalizados para identificar textos semánticamente equivalentes.
- Reranking y filtrado previo en pipelines de RAG: generación de embeddings de consulta y documento con los prefijos correspondientes para reducir el conjunto de candidatos antes de un reranker más costoso.
- Procesamiento por lotes en macOS: uso de `coremltools` en Python para verificar y ejecutar el modelo en Mac durante el desarrollo, con fidelidad de 0,9998 o superior frente a la salida de PyTorch.
- Aplicaciones de accesibilidad o estudio de idiomas: búsqueda de pasajes similares o ejemplos de uso en una base de textos japoneses, ejecutada íntegramente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, JSTS, etc.) en la información disponible. El autor sí documenta métricas de verificación de la conversión:

| Metrica | Resultado |
|---|---|
| Similitud coseno frente a PyTorch (Mac, coremltools) | 0,9998 o superior en todos los ficheros |
| Diferencia de puntuacion fp16 vs int8 (iPhone 17 Pro) | maximo 0,0042 |
| Latencia en iPhone 17 Pro (iOS 27) | aproximadamente 5 ms por frase |
| Latencia de referencia `NLContextualEmbedding` de Apple | aproximadamente 9-10 ms por frase |
| Impacto en el ranking de resultados de busqueda | practicamente nulo |

## Requisitos de hardware

- VRAM/RAM estimada: 630 MB para las variantes fp16 y 316 MB para las variantes int8 (pesos); el consumo en ejecución depende del bucket de longitud elegido.
- GPU recomendadas: no aplica en el sentido de GPU de escritorio; el modelo está pensado para GPU y Neural Engine de Apple (A-series y M-series).
- Compatibilidad verificada: iPhone 17 Pro con iOS 27, ejecutando en GPU/Neural Engine con `computeUnits = .all`.
- Cabe en dispositivos móviles de Apple: el tamaño int8 de 316 MB está pensado explícitamente para apps móviles.
- Opciones de despliegue: Core ML en iOS/macOS; `coremltools` en Python para verificación en Mac; el tokenizer debe aportarse por separado (se recomienda `huggingface/swift-transformers` o equivalente capaz de cargar `tokenizer.json`).
- Latencia y throughput: aproximadamente 5 ms por frase en iPhone 17 Pro en estado estacionario, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| ruri-v3-310m-coreml | 315 M | 128/256/512 (buckets) | ja, en | Core ML | Apache 2.0 | Conversion no oficial para iOS/macOS |
| cl-nagoya/ruri-v3-310m | 315 M | no disponible | ja, en | safetensors (PyTorch) | Apache 2.0 | Modelo original; requiere PyTorch o servidor |
| `NLContextualEmbedding` de Apple | no disponible | no disponible | multiidioma | Framework del sistema | Propietaria | Latencia de 9-10 ms por frase en el mismo dispositivo |

No se dispone en la información proporcionada de comparaciones con otros modelos de embeddings japoneses (por ejemplo, de la familia multilingual-e5 o similares) en términos de benchmarks de recuperación.

## Limitaciones y advertencias

- Es una conversión no oficial: el autor no es el desarrollador del modelo base y no ofrece garantías de soporte.
- El modelo es exclusivamente de embeddings; no genera texto, no razona de forma autoregresiva y no soporta tool calling.
- Los buckets de longitud fija (128, 256 y 512) obligan a hacer padding o truncado manual de `input_ids` y `attention_mask`; textos más largos que el bucket elegido se truncan.
- El esquema de prefijos es obligatorio: omitir `検索クエリ: ` o `検索文書: ` degrada la calidad de la recuperación respecto al modelo original.
- El tokenizer no está incluido en el paquete: debe usarse el `tokenizer.json` original de `cl-nagoya/ruri-v3-310m`, lo que añade una dependencia externa.
- La cuantización int8 introduce una diferencia de hasta 0,0042 en las puntuaciones de similitud; aceptable para búsqueda, pero a considerar en aplicaciones que requieran umbrales muy finos.
- Riesgo de sesgos y alucinaciones heredado del modelo base: no se documentan en la información disponible análisis de sesgo ni evaluaciones de robustez.
- El soporte de idiomas se limita a japonés e inglés; el rendimiento en castellano no está garantizado ni documentado.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversión no oficial conviene verificar la licencia y condiciones del modelo base antes de distribuirlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-310m-coreml
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-310m
- Demo Ruri Atlas (WebGPU): https://huggingface.co/spaces/masahiroid/ruri-atlas
- Repositorio de conversión: https://github.com/masahiroid/ruri-coreml
- Informe de verificación: https://github.com/masahiroid/ruri-coreml/blob/main/REPORT.md
- Manual de integración en Swift: https://github.com/masahiroid/ruri-coreml/blob/main/RuriDemo/MANUAL.md
- App "道程 -Michinori-" en la App Store: https://apps.apple.com/jp/app/道程-michinori/id6782354976
- Paper de referencia (arXiv:2409.07737): https://arxiv.org/abs/2409.07737
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
