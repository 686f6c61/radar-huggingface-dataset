# kwadraten/OXR-1.0-ONNX

## Resumen

OXR-1.0-ONNX es una exportación a ONNX Runtime del modelo SoMarkAI/OXR-1.0, un sistema de reconocimiento óptico de caracteres (OCR) de tipo imagen-a-texto. Lo publica el usuario kwadraten en HuggingFace con el objetivo de permitir inferencia completamente offline sin ejecutar pesos de PyTorch: todos los grafos se ejecutan en el proveedor CPU de ONNX Runtime. El paquete incluye tres grafos de reconocimiento (visión, embeddings de texto y lenguaje) más un grafo independiente de detección de layout basado en D-FINE.

La relevancia de esta exportación es práctica: facilita el despliegue de OCR en entornos sin GPU, sin dependencias de PyTorch y con artefactos verificables mediante hash SHA-256. Sin embargo, se trata de un export experimental de resolución fija (448 × 448 para el reconocimiento, 960 × 960 para el layout) y el propio autor no afirma calidad de reconocimiento más allá de las pruebas descritas en la model card.

No se dispone de información sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del modelo original. La licencia es propietaria (OXR), con términos adicionales para uso comercial y servicios alojados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal imagen-a-texto: grafo de visión (ViT con parches 16×16), grafo de embeddings de texto, grafo de lenguaje con 28 capas y caché KV, más un detector de layout D-FINE independiente |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el grafo de lenguaje usa 28 capas de caché KV; el prompt está fijado en `oxr-prompt.json`) |
| Tipos de cuantización | no disponible (los tensores descritos son float32; no se documentan otras precisiones) |
| Idiomas soportados | no disponible |
| Licencia | OXR (propietaria, con términos adicionales de uso comercial y servicios alojados); incluye textos Apache 2.0 y avisos D-FINE |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`), tokenizer.json, ficheros binarios auxiliares (`.f32`, `.json`) |
| Resolución de imagen (reconocimiento) | fija 448 × 448, 784 parches de 16 × 16 RGB, tensor `float32[784,768]`, grid `[[1,28,28]]` |
| Resolución de imagen (layout) | 960 × 960, tensor `float32[1,3,960,960]` más tamaño original `int64[1,2]` en orden ancho-alto |
| Tamaño del repo | 6,2 GB |
| Revisión de origen | `c708407f9d2b4df658f2543d9132b62bb7221df4` (SoMarkAI/OXR-1.0) |
| SHA-256 del checkpoint de reconocimiento | `795bb2f1faac579f58829913f2c606202531a96c1203e19ef7a70b103fb7ea51` |

## Arquitectura y entrenamiento

La exportación se compone de varios grafos ONNX independientes que replican el pipeline del modelo original. El reconocimiento utiliza `oxr-vision-448.onnx`, que procesa una imagen de 448 × 448 dividida en 784 parches de 16 × 16 píxeles y produce embeddings visuales. Estos se combinan con `oxr-text-embedding.onnx`, `oxr-indicators.f32` (cuatro vectores float32 de longitud 1024) y `oxr-prompt.json`, que fija los IDs de tokens del prompt y los marcadores de imagen. El grafo `oxr-language.onnx` recibe los embeddings del prompt, una máscara de atención causal aditiva de cuatro dimensiones, los IDs de posición y 28 capas de caché clave/valor, y devuelve los logits del último token junto con las cachés actualizadas. La decodificación es greedy y el tokenizer se encarga de convertir la salida en texto.

El componente de layout es un grafo separado, `oxr-layout.onnx`, basado en la implementación D-FINE, que recibe la imagen normalizada a 960 × 960 y el tamaño original, y devuelve etiquetas, cajas en coordenadas de píxel y puntuaciones. No realiza reconocimiento de texto ni orden de lectura; esa función corresponde al pipeline de reconocimiento. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La validación documentada se limita a comparar embeddings de visión, prefill del lenguaje, actualizaciones de caché y decodificación del siguiente token entre PyTorch y ONNX Runtime, además de comprobar el grafo de layout contra la implementación D-FINE original en dos imágenes.

## Capacidades

- Reconocimiento de texto en imágenes (OCR) mediante generación autorregresiva con decodificación greedy.
- Detección de layout de documentos: etiquetas, cajas delimitadoras en coordenadas de píxel y puntuaciones de confianza.
- Inferencia completamente offline en CPU mediante ONNX Runtime, sin ejecutar pesos de PyTorch.
- Procesamiento de imágenes de resolución fija: 448 × 448 para reconocimiento y 960 × 960 para layout.
- Verificación de integridad mediante SHA-256 del checkpoint de reconocimiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general (más allá de OCR), audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de documentos escaneados en entornos air-gapped: el pipeline completo se ejecuta en CPU con ONNX Runtime, sin conexión a red ni dependencias de PyTorch, lo que encaja en organismos con requisitos estrictos de aislamiento.
- Extracción de texto en servidores sin GPU: al no requerir CUDA, puede desplegarse en instancias CPU estándar o en dispositivos edge con recursos limitados.
- Preprocesado de facturas y formularios: el grafo de layout identifica regiones y cajas, y el pipeline de reconocimiento extrae el texto de cada región para su posterior validación en un ERP.
- Integración en pipelines de CI/CD para validación de documentos: los artefactos ONNX con hash verificable permiten fijar versiones exactas del modelo y comprobar su integridad en cada despliegue.
- Indexación de archivos históricos: procesamiento por lotes de imágenes con resolución normalizada a 448 × 448 para alimentar un motor de búsqueda documental.
- Prototipado de OCR en aplicaciones de escritorio: el paquete ONNX puede embeberse en aplicaciones nativas que usen ONNX Runtime sin arrastrar el ecosistema de PyTorch.
- Verificación de calidad de digitalización: comparar la salida del grafo de layout con la del reconocimiento para detectar regiones con texto no extraído.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta una prueba cualitativa: una imagen generada con el texto `HELLO OCR 123` produjo exactamente `HELLO OCR 123` en generación greedy, y se compararon embeddings de visión, prefill del lenguaje, actualizaciones de caché y decodificación del siguiente token entre PyTorch y ONNX Runtime. No se proporcionan métricas de precisión, latencia ni throughput.

## Requisitos de hardware

- VRAM: no aplica para el proveedor CPU de ONNX Runtime; no se documentan requisitos de memoria para ejecución en GPU.
- GPU recomendadas: no disponibles; la exportación está validada en el proveedor CPU de ONNX Runtime.
- Compatibilidad con GPU de consumo: no documentada.
- Despliegue: ONNX Runtime (proveedor CPU validado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Tamaño en disco: el repositorio ocupa 6,2 GB, incluyendo los ficheros `.onnx.data` asociados a cada grafo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Licencia | Formato | Contexto | Parámetros |
|---|---|---|---|---|---|---|
| OXR-1.0-ONNX | OCR + layout | 448 × 448 (rec.) / 960 × 960 (layout) | OXR (propietaria) | ONNX | no disponible | no disponible |
| SoMarkAI/OXR-1.0 | OCR + layout | no disponible | OXR (propietaria) | PyTorch (presumible) | no disponible | no disponible |
| Tesseract OCR | OCR clásico | variable | Apache 2.0 | motor nativo | no aplica | no aplica |
| PaddleOCR | OCR + detección | variable | Apache 2.0 | Paddle / exportable | no aplica | variable |

La comparación con Tesseract y PaddleOCR se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo OXR que permitan una comparación cuantitativa. No se han identificado otras exportaciones ONNX comparables en la información proporcionada.

## Limitaciones y advertencias

- Export experimental de resolución fija: el grafo de visión está trazado para 448 × 448 exactos; otras dimensiones requieren otra exportación o un redimensionado y preprocesado compatibles.
- El grafo de layout no realiza reconocimiento de texto ni orden de lectura; es necesario combinarlo con el pipeline de reconocimiento.
- La calidad de reconocimiento más allá de las pruebas descritas no está afirmada por el autor.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; en OCR, los errores de sustitución de caracteres son un riesgo inherente que debe validarse en producción.
- Licencia OXR propietaria con términos adicionales de uso comercial y servicios alojados: es imprescindible revisar `LICENSE` antes de un despliegue comercial o de ofrecer el modelo como servicio.
- El repositorio incluye textos Apache 2.0 y avisos D-FINE que deben conservarse según los términos de `NOTICE` y `LICENSES/`.
- El prompt está fijado en `oxr-prompt.json`; no se documenta flexibilidad para modificar instrucciones o plantillas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del repositorio (6,2 GB) puede ser un obstáculo para despliegues en dispositivos con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kwadraten/OXR-1.0-ONNX
- Modelo original: https://huggingface.co/SoMarkAI/OXR-1.0
- Licencia OXR: https://github.com/SoMarkAI/OXR/blob/c1a1dcb312ee9f691404f127785510453c0d9350/LICENSE
- Repositorio de SoMarkAI/OXR: https://github.com/SoMarkAI/OXR
- Scripts de conversión y validación: `scripts/oxr-conversion/` en el repositorio de Patchouli (ruta citada en la model card; no se proporciona URL directa)
