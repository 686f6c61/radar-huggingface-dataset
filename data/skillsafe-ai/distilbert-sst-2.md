# skillsafe-ai/distilbert-sst-2

## Resumen

`skillsafe-ai/distilbert-sst-2` es un artefacto de inferencia en formato ONNX publicado por SkillSafe (organización en HuggingFace) a partir del modelo `distilbert/distilbert-base-uncased-finetuned-sst-2-english` de Hugging Face, fijado al commit `714eb0fa89d2f80546fda750413ed43d93601a13`. No es un modelo nuevo ni un reentrenamiento: es una importación reproducible byte a byte del modelo upstream, orientada a ejecutarse directamente en el navegador mediante `transformers.js` y `onnxruntime-web` con ejecución WebGPU o WASM.

La tarea es clasificación binaria de sentimiento (POSITIVE / NEGATIVE) sobre texto en inglés. La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas con aproximadamente 66 millones de parámetros y una ventana máxima de 512 tokens, resultado de destilar BERT-base. El repositorio ocupa 0,3 GB e incluye un único grafo `onnx/model.onnx` en fp32 de 255,54 MB, junto con `config.json`, `tokenizer_config.json` y `vocab.txt`.

Su relevancia práctica es acotada pero clara: permite análisis de sentimiento con latencia muy baja y sin salida de datos del dispositivo, lo que encaja en extensiones de navegador, PWAs y aplicaciones con requisitos estrictos de privacidad. Como contrapartida, es un artefacto de conversión automática sin benchmarks publicados, con 0 descargas y 0 likes en el momento de la consulta, y sin model card de evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, 768 dimensiones ocultas, 12 cabezas de atención |
| Parámetros totales | ~66 millones (deducible del grafo fp32: 255,54 MB / 4 bytes) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (máximo estándar de DistilBERT; `max_position_embeddings` = 512) |
| Tipos de cuantización | El repositorio solo publica el grafo ONNX en fp32; no incluye variantes int8, uint8 ni fp16 |
| Idiomas soportados | No declarado en la model card; el modelo base está entrenado y ajustado sobre texto en inglés |
| Licencia | Apache-2.0 (pesos upstream); la receta de conversión y la model card pertenecen al repositorio SkillSafe y llevan su propia licencia |
| Formato de pesos | ONNX (opset 11, fp32) + `config.json`, `tokenizer_config.json`, `vocab.txt` (WordPiece) |
| Pipeline | `text-classification` |
| Librería declarada | `transformers.js` |
| Etiquetas de salida | 2 clases: POSITIVE, NEGATIVE |
| Tamaño del repositorio | 0,3 GB |
| Fecha de publicación | 2026-09-22 |

Contrato de inferencia declarado para `onnx/model.onnx`: entradas `input_ids` (int64, `['batch_size', 'sequence_length']`) y `attention_mask` (int64, `['batch_size', 'sequence_length']`); salida `logits` (float32, `['batch_size', 2]`).

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo DistilBERT: 6 capas, representaciones de 768 dimensiones y 12 cabezas de atención, con vocabulario WordPiece de 30.522 entradas y tokenizador `uncased`. El modelo original se obtuvo por destilación de BERT-base combinando tres pérdidas (masked language modeling, pérdida de destilación sobre las distribuciones del profesor y pérdida de similitud de embeddings coseno), lo que reduce el número de capas a la mitad manteniendo aproximadamente el 97 % del rendimiento del profesor según la documentación de referencia del modelo base. La ventana de 512 tokens viene impuesta por los embeddings posicionales aprendidos originales.

Este repositorio concreto no entrena ni convierte nada: según su propia model card, los archivos se importan tal como se publican upstream, y cada archivo está fijado por SHA-256 a su origen. La receta declarada es `recipes/distilbert-sst-2.yaml` (sha256 `5939285414a771b2e69b4b0db0475c43617ade8073737949a5587f5b24110f86`) y la cadena de herramientas usada fue Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. Se verificó cada archivo ONNX con `onnx.checker` y una ejecución de humo en CPU con entradas de ceros. No consta información sobre el dataset de ajuste fino más allá de lo implícito en el modelo upstream (SST-2), ni sobre RLHF, DPO u otras etapas de alineamiento, que no aplican a un clasificador.

## Capacidades

- Clasificación binaria de sentimiento: devuelve 2 logits por secuencia, correspondientes a POSITIVE y NEGATIVE.
- Codificación de texto con tokenizador WordPiece `uncased` (minúsculas, vocabulario de 30.522 piezas).
- Inferencia en navegador mediante `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]`, es decir, con aceleración por GPU o por CPU WebAssembly.
- Ejecución 100 % local en el cliente: no requiere backend ni envío de datos a un servidor.
- Procesamiento por lotes (la primera dimensión del contrato es `batch_size`), útil para clasificar colecciones de textos pequeños.
- No genera texto: no hay decodificación, muestreo ni longitud de salida variable.
- No soporta tool calling ni function calling.
- No soporta agentes, planificación ni razonamiento multi-paso.
- No es multilingüe: el modelo base y el ajuste son en inglés.
- No dispone de modo "thinking", visión, audio ni modalidad distinta de texto.

## Casos de uso

- Análisis de sentimiento en el navegador sin backend: una extensión o PWA puede cargar el grafo ONNX (255,54 MB) y clasificar reseñas o comentarios localmente. Es adecuado porque toda la inferencia ocurre en el dispositivo, lo que evita enviar texto del usuario a un servidor y simplifica el cumplimiento del RGPD.
- Moderación o triaje de comentarios en tiempo real: clasificar cada mensaje entrante como positivo o negativo para priorizar la revisión humana de los negativos. El coste por inferencia es mínimo y puede ejecutarse en el mismo servidor web mediante `onnxruntime` en CPU.
- Pre-enrutado en pipelines de atención al cliente: usar la etiqueta de sentimiento como señal barata antes de invocar un LLM mayor (enrutar a un flujo "queja" frente a un flujo "consulta general"). Encaja porque su latencia y coste son órdenes de magnitud menores que los de un modelo generativo.
- Pre-etiquetado de corpus a escala en MLOps: etiquetar grandes volúmenes de texto con sentimiento binario para arrancar un proceso de anotación activa o para comparar con un modelo mayor. La ventana de 512 tokens obliga a truncar documentos largos, por lo que resulta más adecuado para frases, titulares y comentarios breves.
- Analítica de opinión sobre encuestas abiertas o respuestas NPS: convertir respuestas cortas de texto libre en una métrica agregada de polaridad para paneles de control, ejecutando el modelo por lotes en CPU.
- Clasificación en dispositivos con recursos limitados (edge, portátiles sin GPU, móviles vía WASM): el grafo fp32 ocupa unos 256 MB y se ejecuta en CPU, lo que permite desplegarlo donde no cabe un modelo generativo.
- Filtrado previo en canales de soporte o redes sociales: descartar o marcar automáticamente el feedback claramente negativo antes de un análisis manual más profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1 ni comparaciones con otros modelos, y el repositorio no contiene un conjunto de evaluación.

El único dato de rendimiento medido que aparece en la información proporcionada es una prueba de humo en CPU con entradas de ceros, que no constituye un benchmark representativo:

| Archivo | Entradas | Salidas | Latencia (CPU) |
|---|---|---|---|
| `onnx/model.onnx` | `input_ids[1, 8]`, `attention_mask[1, 8]` | `logits[1, 2]` | 2,3 ms |

Advertencia: la medición corresponde a longitud de secuencia 8, no a los 512 tokens del máximo del modelo, por lo que la latencia real en secuencias largas será sustancialmente mayor.

## Requisitos de hardware

- Peso del modelo: 255,54 MB en fp32. La memoria necesaria para los pesos es de aproximadamente 256 MB, más el espacio de trabajo del runtime y las activaciones (del orden de decenas de MB adicionales según el lote y la longitud de secuencia).
- Cabe en cualquier GPU de consumo, incluidas integradas y GPU de portátil, porque el modelo es de 66 millones de parámetros. Una RTX 4090 o una A100 están enormemente sobredimensionadas para esta carga.
- Funciona íntegramente en CPU: la verificación del autor se hizo en CPU sobre Darwin arm64. Es viable en servidores sin GPU y en portátiles convencionales.
- En navegador, dos rutas de ejecución: WebGPU (si el navegador y el dispositivo lo soportan) y WASM (fallback universal, más lento). El coste principal en WASM es la descarga inicial de los 255,54 MB del grafo, no el cómputo por inferencia.
- Despliegue: `onnxruntime-web` y `transformers.js` para cliente; `onnxruntime` (Python, C++, C#, Java) para servidor o escritorio. También puede servirse desde un endpoint propio.
- No es compatible con vLLM, TGI ni llama.cpp/Ollama: no es un modelo generativo y no se distribuye en GGUF ni en safetensors.
- Latencia declarada: 2,3 ms por lote de 1 secuencia de 8 tokens en CPU arm64. Throughput para lotes grandes y secuencias de hasta 512 tokens: no disponible.
- Requisito práctico de red: servir el archivo ONNX (255,54 MB) desde un CDN o incluirlo en el bundle de la aplicación; conviene cachearlo porque la descarga domina el tiempo de primera inferencia en el navegador.

## Comparativa con modelos similares

| Modelo | Arquitectura y parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/distilbert-sst-2` (este) | DistilBERT, ~66 M | 512 tokens | ONNX fp32 (opset 11), listo para navegador | Apache-2.0 | 0 descargas, 0 likes en el momento de la consulta |
| `distilbert/distilbert-base-uncased-finetuned-sst-2-english` | DistilBERT, ~66 M (mismos pesos) | 512 tokens | safetensors/PyTorch y export ONNX propio | Apache-2.0 | Modelo de referencia, ampliamente utilizado |
| `textattack/bert-base-uncased-SST-2` | BERT-base, ~110 M (arquitectura nominal) | 512 tokens | PyTorch/safetensors | No disponible en la información consultada | Alternativa de mayor tamaño y coste |
| Modelos de sentimiento multilingües tipo BERT multilingüe ajustado | BERT multilingüe, ~110 M (arquitectura nominal) | 512 tokens | PyTorch/safetensors | No disponible en la información consultada | A considerar si se necesita más de un idioma |

Diferencias clave frente al modelo upstream: los pesos son idénticos, pero este repositorio fija el origen por SHA-256, documenta la cadena de herramientas y entrega un único grafo ONNX pensado para `onnxruntime-web`, sin scripts de Python ni dependencia de PyTorch en el cliente. La contrapartida es la ausencia de métricas propias y la falta de variantes cuantizadas, que en el ecosistema upstream sí pueden obtenerse por otras vías.

## Limitaciones y advertencias

- Idioma: solo inglés. No hay declaración de soporte multilingüe y el modelo base se entrenó sobre texto en inglés; su uso con textos en castellano producirá resultados poco fiables.
- Granularidad: únicamente dos clases. No distingue intensidad, emociones concretas ni escala de 1 a 5 estrellas, y no ofrece categorías como "neutro".
- Dominio: el ajuste procede de SST-2 (reseñas de cine). El rendimiento puede degradarse en dominios distintos (jerga de redes sociales, texto técnico, mensajes muy cortos, negaciones complejas, sarcasmo o ironía).
- Contexto: 512 tokens como máximo. Los textos más largos deben truncarse, lo que puede eliminar la parte del contenido que determina la polaridad.
- Sobre la alucinación: al no ser generativo no inventa texto, pero sí puede producir clasificaciones erróneas con probabilidades mal calibradas; conviene no interpretar el valor de softmax como una confianza fiable sin calibrarlo con datos propios.
- Sesgos: hereda los sesgos de los corpus de preentrenamiento del modelo base (Wikipedia y BooksCorpus) y del conjunto SST-2, incluyendo posibles asociaciones estereotipadas en el vocabulario.
- Fiabilidad de la ficha: el repositorio tiene 0 descargas y 0 likes, es una conversión automática y no incluye evaluación propia. No hay evidencia pública de uso en producción.
- Trazabilidad de los datos declarados: la model card indica que los archivos se importan tal cual desde upstream, pero el único archivo binario grande es el ONNX en fp32 mientras que el repositorio declara también un tag `base_model:quantized:...`; conviene verificar el `manifest.json` si se necesita la procedencia exacta.
- Licencia: los pesos son Apache-2.0 y permiten uso comercial con atribución a Hugging Face; la receta de conversión y la model card llevan licencia propia del repositorio SkillSafe, por lo que hay que revisar ambas si se redistribuye.
- Rendimiento declarado: los 2,3 ms corresponden a una prueba de humo con entradas de ceros y longitud 8, no a una carga realista; no deben usarse como estimación de latencia en producción.
- Licencia y atribución obligatoria: cualquier redistribución debe conservar el aviso de licencia indicado en la model card upstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/distilbert-sst-2
- Modelo base upstream: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Commit fijado del upstream: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english/tree/714eb0fa89d2f80546fda750413ed43d93601a13
- Aviso de licencia upstream: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english/blob/main/README.md
- Repositorio con la receta de conversión: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre SkillSafe; los resultados obtenidos correspondían a páginas sin relación con el modelo, por lo que no se incluyen. No se han encontrado papers, blogs ni demos adicionales en la información disponible.
