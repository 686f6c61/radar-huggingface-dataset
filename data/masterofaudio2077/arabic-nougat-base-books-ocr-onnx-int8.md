# masterofaudio2077/arabic-nougat-base-books-ocr-onnx-int8

## Resumen

Arabic Nougat Book OCR — ONNX INT8 es la versión cuantizada dinámicamente a INT8 del modelo `masterofaudio2077/arabic-nougat-base-books-ocr`, un `VisionEncoderDecoderModel` de 349 millones de parámetros especializado en OCR de páginas de libros en árabe. Desarrollado por el usuario `masterofaudio2077`, el modelo resuelve la transcripción de una imagen de página a texto estructurado, separando el contenido en `[HEADER]`, `[BODY]` y `[FOOTNOTES]`, y preservando las marcas diacríticas del árabe.

La arquitectura combina un encoder visual Swin con un decoder mBART, siguiendo el paradigma Nougat (OCR académico con salida estructurada). Esta variante ONNX está pensada para inferencia en CPU: el autor reporta 75,31 segundos por página frente a 100,13 segundos de la versión PyTorch FP32 en un equipo de 16 vCPU, con un incremento absoluto de CER de solo +0,0026 en el conjunto de evaluación.

La relevancia actual del modelo reside en su enfoque de despliegue: cuantización dinámica post-entrenamiento sin calibración, pesos `QInt8` por canal y un repositorio de apenas 589 MiB que cabe en entornos sin GPU. Es una pieza útil para digitalización de corpus árabes en infraestructura modesta, aunque se trata de un checkpoint intermedio y con limitaciones explícitas de alcance.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoder (encoder Swin + decoder mBART) |
| Parámetros totales | 349M (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-channel); existe export FP32 ONNX de referencia |
| Idiomas soportados | árabe (OCR de libros); resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (IR 8, opset 17); tokenizer en JSON |
| Operadores cuantizados | `MatMul`, `Gemm`, `Gather` (incluye embeddings de tokens) |
| Calibración | ninguna (cuantización dinámica data-free) |
| ONNX Runtime | 1.31.1 |
| Tamaño pesos ONNX | 613.682.818 bytes (~585 MiB) |
| Tamaño total repo | 617.405.977 bytes (~589 MiB) |
| Checkpoint base FP16 | 697.842.488 bytes (~666 MiB) |
| Export FP32 ONNX | 3.513.785.257 bytes (~3,27 GiB) |

Grafos incluidos en el repositorio:

| Fichero | Bytes | Función |
|---|---:|---|
| `encoder_model.onnx` | 81.615.999 | encoder de imagen Swin |
| `decoder_model.onnx` | 276.646.724 | primer paso de decodificación |
| `decoder_with_past_model.onnx` | 255.420.095 | pasos con caché |
| `tokenizer.json` | 3.581.947 | tokenizer mBART/Nougat |
| `benchmark.json` | 78.388 | registros del benchmark de 8 páginas |

## Arquitectura y entrenamiento

El modelo sigue el esquema encoder-decoder de Nougat: un encoder visual Swin procesa la imagen de la página y un decoder mBART genera la secuencia de texto con tokens especiales de estructura (`[HEADER]`, `[BODY]`, `[FOOTNOTES]`). El modelo base se entrenó sobre los datasets `freococo/ocr_arabic_books` y `freococo/synth_shamela_ocr_arabic_books`, según indica la model card. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación principal de esta variante es la cuantización: se aplicó cuantización dinámica INT8 post-entrenamiento, sin recalibración ni QAT, sobre `MatMul`, `Gemm` y `Gather`. El autor justifica el uso de cuantización por canal (mejor retención de calidad que por tensor en las páginas de validación) y la cuantización de los embeddings de tokens (menor tamaño y ligeramente mejor que mantenerlos en FP32). Mantener la última capa del decoder o el `lm_head` en FP32 no mejoró el CER medido, por lo que permanecen en INT8. El export ONNX se dividió en un grafo de encoder y dos de decoder, sin decoder fusionado.

## Capacidades

- OCR de páginas de libros en árabe con salida de texto plano.
- Segmentación estructural de la página en cabecera, cuerpo y notas al pie mediante tokens especiales.
- Preservación de diacríticos árabes en la salida.
- Generación autoregresiva con decodificación greedy y `max_new_tokens=2048` (usado en la evaluación).
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No se documenta soporte de tool calling, function calling, agentes, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo está orientado al árabe.

## Casos de uso

- Digitalización de corpus académicos árabes: procesar páginas de libros escaneados y obtener texto estructurado con cabeceras y notas al pie, aprovechando la salida segmentada del modelo para reconstruir la jerarquía del documento.
- Despliegue en servidores sin GPU: al ejecutarse con ONNX Runtime en CPU (75,31 s/página en 16 vCPU), encaja en pipelines batch nocturnos donde el throughput no es crítico.
- Indexación y búsqueda full-text de bibliotecas árabes: convertir imágenes de páginas a texto para alimentar motores de búsqueda o sistemas RAG sobre fondos bibliográficos.
- Preservación digital de textos con diacríticos: el modelo conserva las marcas diacríticas, útil para ediciones religiosas o lingüísticas donde la vocalización es significativa.
- Extracción de notas al pie para edición crítica: la separación explícita en `[FOOTNOTES]` facilita aislar el aparato crítico del cuerpo del texto en flujos de edición académica.
- Preprocesado para TTS o traducción: generar transcripciones limpias de libros árabes como paso previo a pipelines de síntesis de voz o traducción automática.
- Prototipado y validación de pipelines OCR: con un repositorio de 589 MiB y carga vía `optimum.onnxruntime`, sirve para probar arquitecturas Nougat en árabe antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

Evaluación sobre las últimas 8 páginas de `tafsir_al_tabari` del dataset `freococo/ocr_arabic_books` (las últimas 400 páginas de Tabari están reservadas para test). Decodificación greedy, `max_new_tokens=2048`, una página por petición, 16 vCPU. Referencia: el mismo modelo PyTorch FP32 sobre las mismas páginas.

| Métrica | PyTorch FP32 | ONNX INT8 | Delta |
|---|---:|---:|---:|
| CER con diacríticos | 0,024238 | 0,026853 | +0,002615 |
| CER sin diacríticos | 0,016517 | 0,019891 | +0,003373 |
| Coincidencia exacta de página | 0,000 | 0,000 | — |
| Salidas vacías | 0,000 | 0,000 | — |
| Salidas excesivamente largas | 0,000 | 0,000 | — |
| Segundos medios por página | 100,13 | 75,31 | 1,33× más rápido |
| Tokens totales | 12.367 | 12.372 | +5 |

Las 8 páginas terminaron con EOS en ambas ejecuciones. La página más difícil (página 3) pasó de CER 0,0648 a 0,0829; las otras siete se mantuvieron cercanas. El CER agregado empeora +0,0026 absoluto (+10,8% relativo) en esta muestra de 8 páginas. El export FP32 ONNX se verificó contra PyTorch: los logits del encoder coincidieron con una diferencia absoluta máxima de 1,74e-5 y las generaciones muestreadas fueron idénticas. El autor advierte que estas cifras no son comparables con la evaluación de 16 páginas de la model card del modelo base.

## Requisitos de hardware

- VRAM: no aplica en la configuración objetivo (inferencia en CPU); el repositorio pesa ~589 MiB, por lo que en GPU el consumo sería mínimo.
- GPU recomendadas: no especificadas; el modelo está optimizado para CPU vía ONNX Runtime.
- CPU: el benchmark se ejecutó en 16 vCPU con 75,31 s por página (INT8) frente a 100,13 s (PyTorch FP32).
- ¿Cabe en GPU de consumo? Sí, por tamaño (349M parámetros, pesos INT8 de ~585 MiB), aunque no es el escenario documentado.
- Despliegue: `optimum.onnxruntime` con `ORTModelForVision2Seq`, `use_merged=False` y `use_io_binding=False`; requiere ONNX Runtime 1.31.1 según el autor.
- Latencia y throughput: ~75 s por página en 16 vCPU con `max_new_tokens=2048` y decodificación greedy; el throughput depende del número de núcleos y de la longitud de la página.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arabic Nougat Book OCR ONNX INT8 (este) | 349M | no disponible | ONNX INT8 | Apache-2.0 | OCR árabe, CPU, ~589 MiB |
| Arabic Nougat Book OCR (base) | 349M | no disponible | safetensors (FP16) | Apache-2.0 | Checkpoint intermedio, referencia de calidad |
| Nougat (Meta, original) | ~350M (variante base) | no disponible | safetensors | CC-BY-NC-4.0 | OCR académico multilingüe, no específico de árabe |
| Export FP32 ONNX del mismo modelo | 349M | no disponible | ONNX FP32 | Apache-2.0 | ~3,27 GiB, referencia numérica del INT8 |

La información disponible no incluye resultados de benchmarks de Nougat original ni de otras alternativas sobre el mismo conjunto árabe, por lo que la comparación cuantitativa de calidad entre modelos no está disponible.

## Limitaciones y advertencias

- El modelo base es un checkpoint intermedio (paso 20.000 de 50.000 planificados); la variante cuantizada hereda su precisión y sus modos de fallo.
- La salida OCR debe revisarse cuando el texto exacto sea crítico; no hay coincidencia exacta de página en la evaluación (0,000 en ambas versiones).
- Fuera de alcance: escritura manuscrita, tablas, maquetación multicolumna, documentos no librarios y otros alfabetos.
- El benchmark se limita a 8 páginas reservadas, no es una evaluación OCR completa.
- No se realizó reentrenamiento, QAT ni calibración; la cuantización es puramente dinámica post-entrenamiento.
- El CER empeora un 10,8% relativo frente a FP32 en la muestra evaluada; la página más difícil sube de 0,0648 a 0,0829.
- Licencia Apache-2.0 en el modelo base y en esta variante, lo que permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento (`freococo/ocr_arabic_books`, `freococo/synth_shamela_ocr_arabic_books`) antes de un despliegue en producción.
- Requiere `use_merged=False` al cargar; no existe grafo de decoder fusionado en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/arabic-nougat-base-books-ocr-onnx-int8
- Modelo base: https://huggingface.co/masterofaudio2077/arabic-nougat-base-books-ocr
- Dataset de entrenamiento (libros árabes): https://huggingface.co/datasets/freococo/ocr_arabic_books
- Dataset sintético Shamela: https://huggingface.co/datasets/freococo/synth_shamela_ocr_arabic_books
- Documentación de Optimum ONNX Runtime: https://huggingface.co/docs/optimum/onnxruntime
- Repositorio de Nougat (Meta): https://github.com/facebookresearch/nougat
