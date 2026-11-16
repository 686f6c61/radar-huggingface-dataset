# anylab/embeddinggemma-2-coreml

## Resumen

EmbeddingGemma 2 Core ML es una conversión del codificador de texto del modelo de embeddings `google/embeddinggemma-2` de Google, empaquetada en formato Core ML para su ejecución nativa en Apple Silicon (CPU, GPU y Neural Engine). La publica el usuario `anylab` y está pensada para aplicaciones que necesitan generar embeddings de frases en dispositivos Apple sin depender de un runtime de Python ni de servicios en la nube. El paquete contiene únicamente el codificador de texto, con los pesos y el tokenizador originales sin cambios.

El artefacto principal es un `.mlpackage` de 574.431.459 bytes (547,82 MiB) que expone cinco funciones de forma fija (`s128`, `s256`, `s512`, `s1024` y `s2048`), todas compartiendo pesos y devolviendo un vector normalizado de 768 dimensiones. El cómputo del transformer se realiza en FP16 y la normalización L2 final en FP32. La ventana máxima es de 2048 tokens, y el modelo está etiquetado como multilingüe.

Su relevancia práctica es que traslada un modelo de embeddings de Google a la inferencia on-device en macOS, con validación numérica documentada frente al modelo original en FP32 y con planes de cómputo que priorizan el Neural Engine. No se ha aplicado entrenamiento, poda, eliminación de cabeceras ni cuantización entera de pesos: es una conversión con preservación de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (codificador de texto de EmbeddingGemma 2), exportado a Core ML |
| Parametros totales | no disponible (el `.mlpackage` ocupa 574.431.459 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (funciones fijas de 128, 256, 512, 1024 y 2048) |
| Tipos de cuantizacion | sin cuantización entera de pesos; pesos y cómputo en FP16, normalización L2 final en FP32 |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (con tokenizador en `tokenizer.json` y `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El paquete es una conversión del codificador de texto de `google/embeddinggemma-2`, fijado al commit `914f7f89142e33e77833254d9c9b90c3cef7303b`. No se ha realizado entrenamiento adicional, poda, eliminación de cabeceras de aplicación ni cuantización entera: los pesos se exportan en FP16 y la normalización L2 se ejecuta en FP32. El tokenizador original se incluye sin modificar. El autor indica que solo está incluido el codificador de texto.

La innovación técnica principal es el empaquetado de cinco funciones de longitud fija en un único paquete Core ML con pesos compartidos, lo que permite seleccionar el bucket más pequeño que encaje con la entrada (128, 256, 512, 1024 o 2048 tokens) y aprovechar el Neural Engine. Las funciones largas preservan el comportamiento de ventana deslizante del modelo original. El paquete se exportó con un objetivo mínimo de macOS 15 y debe compilarse en el dispositivo de despliegue, conservando el artefacto compilado en un directorio propiedad de la aplicación.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones para similitud semántica y búsqueda.
- Extracción de características (`feature-extraction`) y cálculo de similitud entre frases (`sentence-similarity`).
- Soporte multilingüe, según la etiqueta `multilingual` del modelo base.
- Procesamiento de entradas de hasta 2048 tokens, con buckets fijos de 128, 256, 512, 1024 y 2048.
- Prefijos de prompt documentados: `title: none | text: ` para documentos y `task: search result | query: ` para consultas.
- Inferencia nativa en Apple Silicon mediante Core ML, sin necesidad de runtime de Python.
- No incluye tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un codificador de texto para embeddings.

## Casos de uso

- Búsqueda semántica on-device en aplicaciones macOS: el modelo genera embeddings de consultas y documentos con el prefijo adecuado y permite calcular similitud coseno localmente, sin enviar texto a un servidor.
- Indexación de notas y documentos personales: con ventana de hasta 2048 tokens, se pueden embeber fragmentos largos de notas, correos o artículos y almacenar los vectores de 768 dimensiones en un índice local.
- Clasificación y agrupamiento de texto: los embeddings normalizados sirven para clustering, deduplicación y etiquetado semántico de colecciones multilingües en el dispositivo.
- Filtrado y enrutamiento de contenido: comparar la similitud entre una consulta y un conjunto de plantillas o categorías precalculadas para decidir la ruta de una petición dentro de una app.
- Asistentes de escritorio con recuperación local: integrar el paquete en una app Swift/Core ML para recuperar pasajes relevantes de una base documental propia antes de pasarlos a un modelo generativo.
- Detección de duplicados y near-duplicates en corpus multilingües: el soporte multilingüe y la normalización L2 permiten comparar documentos en distintos idiomas con un umbral de similitud común.
- Prototipado e investigación en macOS: validar pipelines de embeddings con Core ML Tools 9.0 y Python 3.12 en un Mac con Apple Silicon antes de portar la inferencia a Swift.

## Benchmarks y rendimiento

| Medición | Resultado |
|---|---|
| Forward reescrito frente a HF FP32 original, 16 fixtures | Coseno mínimo 0,999999999997; error absoluto máximo 2,82e-7 |
| Core ML nativo frente a HF FP32 original, 16 fixtures | Coseno mínimo 0,99992672; error absoluto máximo 0,00221308 |
| Fixtures largos | Documento de 1151 tokens, texto multilingüe de 1630 tokens, exactamente 2048 tokens y texto corto rellenado a 2048 |
| Corpus FiQA | 1499/1500 documentos; un documento de 2212 tokens excluido sin truncar |
| Normas del corpus | 0,999999893–1,000000097; vectores de 768 dimensiones finitos y no nulos |
| Solapamiento con salida propia anterior | Las 1491 salidas solapadas permanecen exactamente iguales |

Validado el 16 de noviembre de 2026 en un MacBook Air M2 con 16 GiB de RAM y macOS 27.2.1. Los cinco planes de cómputo de Core ML prefieren el ANE para el núcleo del transformer. No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/espacio: el `.mlpackage` ocupa 547,82 MiB; el repo completo pesa 0,6 GB.
- Hardware validado: MacBook Air M2 con 16 GiB de RAM y macOS 27.2.1.
- Objetivo mínimo de despliegue: macOS 15.
- Cabe en equipos Apple Silicon de gama consumer (serie M1, M2, M3, M4) con memoria unificada; no se especifican requisitos para GPUs NVIDIA ni AMD.
- Despliegue nativo mediante Core ML en Swift, sin runtime de Python; para comprobaciones interactivas se usa Python 3.12 con Core ML Tools 9.0, NumPy y `tokenizers`.
- Los planes de cómputo prefieren el Neural Engine para el transformer; se puede forzar `CPU_AND_NE` con Core ML Tools.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anylab/embeddinggemma-2-coreml | no disponible (paquete de 547,82 MiB) | 2048 tokens | Core ML | Apache 2.0 | Hugging Face |
| google/embeddinggemma-2 (modelo base) | no disponible | no disponible | safetensors (original) | no disponible en la información | Hugging Face |
| Otros modelos de embeddings on-device para Apple | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el codificador de texto: no hay cabeceras de aplicación, proyección específica ni truncado Matryoshka; esas operaciones son responsabilidad de la aplicación.
- Límite estricto de 2048 tokens: las entradas que lo superen deben rechazarse o enrutarse a otro modelo; el paquete no aplica política de truncado.
- Los buckets son fijos (128, 256, 512, 1024, 2048): hay que elegir el más pequeño que encaje tras añadir prompts y tokens especiales.
- El paquete debe compilarse en el dispositivo de despliegue y el artefacto compilado conservarse en un directorio propiedad de la aplicación.
- La validación nativa en Swift/Core ML es independiente de la integración en aplicaciones de producción, según el autor.
- No hay datos publicados sobre sesgos, tasas de alucinación ni rendimiento en benchmarks estándar.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar `LICENSE`, `NOTICE` y los archivos de `licenses/` con la atribución correspondiente.
- El modelo base está etiquetado como multilingüe, pero no se detalla la lista concreta de idiomas ni su cobertura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anylab/embeddinggemma-2-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Validador nativo Swift y reproducción: https://github.com/anyproto/any/tree/6424fab8cb6bd2874ce08e85d9081e24ff96902f/scripts/embedbench/research/eg2_coreml
- Informe de validación: `validation/2026-11-16-five-bucket/REPORT.txt` (dentro del repositorio)
- Resumen de validación de release: `validation/2026-11-16-five-bucket/release-validation.json` (dentro del repositorio)
