# groxaxo/Unlimited-OCR-2-MLX8-Selective

## Resumen

Unlimited-OCR-2-MLX8-Selective es una conversión cuantizada a 8 bits del modelo baidu/Unlimited-OCR-2, publicada por el usuario groxaxo para su ejecución nativa en Apple Silicon mediante la librería MLX-VLM. El modelo original es un sistema image-text-to-text orientado a la extracción de texto (OCR) en documentos, y esta versión derivada mantiene la arquitectura multimodal completa pero reduce el peso del checkpoint un 41,2 % respecto al original. No se trata de una cuantización uniforme: solo 119 módulos del modelo de lenguaje se cuantizan a 8 bits, mientras que los codificadores de visión, SAM, el proyector visual, los routers DASH y las capas de normalización permanecen en BF16.

El checkpoint completo ocupa 3.929.765.679 bytes (3,930 GB decimales) y contiene 3.340.043.008 parámetros según los safetensors. Es una conversión derivada, no una release oficial de Baidu, y está pensada para desarrolladores que quieran ejecutar OCR multimodal en hardware Apple con memoria unificada limitada (el autor lo probó en un M5 con 24 GiB).

Su relevancia es doble: por un lado demuestra una estrategia de cuantización selectiva que preserva componentes sensibles (visión, routers, normas) en BF16; por otro, ofrece una vía práctica para desplegar OCR de documentos en portátiles Apple sin GPU dedicada. La licencia MIT del checkpoint derivado facilita su integración, aunque la atribución al modelo base sigue siendo obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base baidu/Unlimited-OCR-2), con codificadores de visión, SAM, proyector visual y routers DASH |
| Parametros totales | 3.340.043.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64, round-to-nearest, selectiva (119 módulos LM); resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo baidu/Unlimited-OCR-2, un sistema multimodal image-text-to-text que combina codificadores visuales (incluyendo un componente SAM), un proyector visual y un modelo de lenguaje con routers DASH. La conversión de groxaxo no reentrena ni modifica la topología: aplica cuantización affine de 8 bits con group size 64 y redondeo al más cercano sobre 119 módulos del language model, dejando en BF16 los codificadores de visión, el proyector, los routers DASH y las capas de normalización. El autor indica que no se encontraron módulos cuantizados en rutas protegidas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original utilizó RLHF o DPO. La model card del checkpoint derivado no detalla estos aspectos y remite al modelo base para la procedencia. La innovación técnica destacable de esta release es la propia estrategia de cuantización selectiva, que busca preservar la calidad de los componentes visuales y de enrutamiento mientras reduce el peso del decoder.

## Capacidades

- Extracción de texto (OCR) en documentos de varias páginas mediante el token especial `<PAGE>` y prompts multimodales.
- Procesamiento image-text-to-text: recibe imágenes y texto y genera texto estructurado.
- Conversación multimodal multi-turno (pipeline `conversational`).
- Parsing de documentos con múltiples páginas en una sola invocación (el autor usa `max_tokens=12000` en su ejemplo).
- Soporte de código personalizado (`custom_code`) para cargar la arquitectura con MLX-VLM.
- Ejecución nativa en Apple Silicon vía MLX, sin necesidad de CUDA.
- Capacidades de audio mencionadas de forma indirecta en la model card (ruta "Audio8" con muestras sintéticas), aunque sin métricas de calidad (no se midió MOS).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes en macOS: el modelo puede procesar imágenes de documentos y devolver texto estructurado, ejecutándose en un Mac con memoria unificada de 24 GiB sin GPU dedicada, lo que permite integrarlo en flujos de contabilidad locales.
- Extracción de campos en correos con adjuntos: el autor documenta un caso real de diez adjuntos de correo y 12 páginas, donde el modelo seleccionó 82 de 85 campos correctamente; sirve para automatizar la captura de datos de adjuntos en clientes de correo.
- Procesamiento por lotes de documentos escaneados en portátiles Apple: al ocupar 3,93 GB, cabe en equipos con 16-24 GiB de memoria unificada, permitiendo pipelines de OCR sin servidor.
- Preprocesado para RAG documental: convertir PDFs e imágenes en texto antes de indexarlos en un sistema de recuperación, usando la ventana de generación amplia (`max_tokens=12000`) para documentos de varias páginas.
- Prototipado rápido de aplicaciones de OCR en entornos de desarrollo con MLX: la API de `mlx_vlm.load`/`generate` permite iterar con `temperature=0.0` para resultados deterministas.
- Verificación de presencia de campos en formularios: el autor realizó una auditoría de presencia de campos (no de precisión OCR), útil para validar que un documento contiene los campos esperados antes de un procesamiento posterior.
- Investigación sobre cuantización selectiva: el repositorio incluye `quantization-audit.json` con la forma y tipo de cada tensor, lo que permite estudiar el impacto de mantener ciertos módulos en BF16.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden a una prueba privada de OCR, no a benchmarks estándar:

| Metrica | BF16 (original) | 8-bit selectivo |
|---|---|---|
| Tiempo en 10 adjuntos / 12 páginas | 137,90 s | 91,65 s |
| Campos seleccionados correctamente | 80/85 | 82/85 |

El autor advierte explícitamente que se trata de una auditoría de presencia de campos, no de un benchmark de precisión OCR, y que parte del texto dentro de figuras se omitió. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se midió MOS ni puntuación de escucha humana para la ruta de audio.

## Requisitos de hardware

- VRAM/memoria: el checkpoint completo pesa 3,93 GB; en inferencia con MLX se necesita además memoria para activaciones y caché, por lo que se recomienda un mínimo de 16 GiB de memoria unificada y 24 GiB para documentos de varias páginas.
- GPU recomendadas: Apple Silicon (probado en M5 con 24 GiB); no se documenta soporte para A100, H100 ni RTX 4090 en esta conversión MLX.
- Cabe en consumer GPU: en el ecosistema Apple, sí en equipos con 16-24 GiB de memoria unificada; en GPU NVIDIA no está validado.
- Opciones de despliegue: MLX-VLM (loader nativo, versiones validadas MLX 0.32.4, MLX-VLM 0.7.11, MLX-Audio 0.6.4, Transformers 5.22.1). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 91,65 s para 12 páginas en un M5 24 GiB (aproximadamente 7,6 s por página) en la prueba del autor; el modelo BF16 tardó 137,90 s en el mismo conjunto. No hay datos de throughput por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR-2-MLX8-Selective | 3,34 B | no disponible | MIT | Hugging Face (MLX) | Cuantización selectiva 8-bit, solo Apple Silicon |
| baidu/Unlimited-OCR-2 (original) | no disponible | no disponible | no disponible | Hugging Face | Modelo base BF16, referencia de calidad |
| Otros modelos OCR multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros OCR multimodales de tamaño similar). Los datos de parámetros y contexto del modelo base no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión derivada no oficial; el autor no garantiza paridad de comportamiento con el modelo original de Baidu.
- La prueba de rendimiento es una auditoría de presencia de campos sobre 10 adjuntos privados, no un benchmark de precisión OCR; no debe interpretarse como métrica de calidad general.
- El conjunto de prueba contiene solo documentos de una o dos páginas; no se evalúa el comportamiento en documentos de cientos de páginas ni el "unlimited horizon" que sugiere el nombre.
- Parte del texto dentro de figuras se omitió en la prueba, lo que indica posibles fallos en regiones gráficas.
- No se midió MOS ni calidad de audio para la ruta Audio8; las muestras de audio son sintéticas y sin clonación de referencia.
- La memoria del asignador reportada no equivale al RSS total del sistema.
- Solo está validado en Apple Silicon con MLX; no hay soporte documentado para CUDA, vLLM o llama.cpp.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- La licencia MIT del checkpoint derivado no exime de mantener la atribución y la licencia del modelo base al redistribuirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Unlimited-OCR-2-MLX8-Selective
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Revisión del modelo base usada en la conversión: `0480966938291445591f69f08a13b041c073a96a`
- BENCHMARKS.md (incluido en el repo): https://huggingface.co/groxaxo/Unlimited-OCR-2-MLX8-Selective/blob/main/BENCHMARKS.md
- benchmark-results.json (incluido en el repo): https://huggingface.co/groxaxo/Unlimited-OCR-2-MLX8-Selective/blob/main/benchmark-results.json
- quantization-audit.json (incluido en el repo): https://huggingface.co/groxaxo/Unlimited-OCR-2-MLX8-Selective/blob/main/quantization-audit.json
- benchmark_mlx.py (incluido en el repo): https://huggingface.co/groxaxo/Unlimited-OCR-2-MLX8-Selective/blob/main/benchmark_mlx.py
