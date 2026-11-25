# ryzen838/gemma-4-E4B-it-heretic

## Resumen

Gemma 4 E4B-it-heretic es una variante "decensored" (abliterated) del modelo multimodal google/gemma-4-E4B-it, desarrollada por el usuario ryzen838 mediante la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA) con preservación de la norma de fila. El objetivo es eliminar los mecanismos de rechazo del modelo original manteniendo al máximo el resto de capacidades, de modo que el modelo responda a peticiones que el original rechazaría.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, con arquitectura transformer densa, 42 capas, ventana de contexto de 128K tokens y soporte nativo de texto, imagen y audio como entrada, generando texto como salida. Incorpora embeddings por capa (PLE), atención híbrida con ventanas deslizantes locales de 512 tokens intercaladas con atención global, y un vocabulario de 262K tokens con soporte para más de 140 idiomas.

La relevancia de esta ficha radica en que documenta una modificación de pesos con fines de investigación sobre alineación y seguridad: la ablación se aplicó sobre las capas 21 a 42 y reduce los rechazos de 99/100 a 3/100 en la evaluación del autor, con una divergencia KL de 0.0058 respecto al original. El repositorio tiene 16 GB de tamaño y los pesos suman 7.996.156.490 parámetros reales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window local + atención global), PLE (Per-Layer Embeddings) y p-RoPE en capas globales |
| Parametros totales | 7.996.156.490 (8B con embeddings; 4.5B efectivos según el autor del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Más de 140 idiomas según el modelo base; no se detalla lista específica para esta variante |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 E4B: 42 capas, atención híbrida que intercala ventanas deslizantes locales de 512 tokens con capas de atención global (la última capa siempre es global), claves y valores unificados en las capas globales y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. Los modelos E incorporan Per-Layer Embeddings (PLE): cada capa decodificadora dispone de su propia tabla de embeddings por token, lo que eleva el recuento total de parámetros (8B) muy por encima del efectivo (4.5B) porque esas tablas solo se usan para consultas rápidas. El codificador de visión ronda los 150M de parámetros y el de audio unos 300M.

Sobre el entrenamiento original no se aportan en esta información detalles de número de tokens, composición del dataset ni si hubo RLHF o DPO. La modificación de esta variante consiste en una ablación de direcciones de rechazo mediante Heretic v1.2.0 con el método ARA, aplicada entre las capas 21 y 42 con los siguientes hiperparámetros: preserve_good_behavior_weight 0.3873, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.8555 y neighbor_count 14, con preservación de la norma de fila. No se realizó un reentrenamiento completo, sino una edición de pesos sobre el modelo ya instruido.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes) heredados del modelo base.
- Entrada multimodal: texto, imagen con soporte de relación de aspecto y resolución variable, y audio nativo en los modelos E2B/E4B.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores de Gemma.
- Soporte nativo de function calling y de prompt de sistema (rol `system`).
- Conversaciones multi-turno estructuradas y flujos agénticos de varios pasos.
- Multilingüismo en más de 140 idiomas.
- Respuesta sin rechazos en la mayoría de peticiones (3/100 rechazos según la evaluación del autor), incluidas solicitudes que el modelo original declinaría.
- Capacidad de salida únicamente textual (pipeline any-to-any por las entradas multimodales, pero la generación es de texto).

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo original y el abliterated sobre el mismo conjunto de prompts para medir el efecto de la ablación en rechazos y en la calidad de respuesta (KL de 0.0058).
- Red teaming y evaluación de robustez: generar respuestas a prompts que el modelo base rechaza para estudiar sesgos, fugas de conocimiento o comportamientos no deseados en un entorno controlado.
- Generación de contenido creativo sin filtros editoriales: narrativa, guiones o material de ficción que el modelo original podría declinar por temas sensibles, con contexto de 128K para obras largas.
- Asistentes locales multimodales: transcripción y descripción de audio e imagen en dispositivos de gama alta, aprovechando el diseño on-device de la familia E4B.
- Análisis de documentos extensos con imágenes: informes, capturas o diagramas combinados con texto largo dentro de la ventana de 128K tokens.
- Experimentación con agentes y tool calling: prototipos de agentes autónomos que requieren respuestas sin bloqueos por políticas de contenido, con soporte nativo de function calling.
- Fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, sirve como punto de partida para ajustes específicos de dominio sin partir del modelo censurado.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-E4B-it) |
|---|---|---|
| Divergencia KL | 0.0058 | 0 (por definición) |
| Rechazos | 3/100 | 99/100 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para esta variante ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto corto.
- En cuantización de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, alrededor de 5 GB, aunque el repositorio no publica versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con bf16 para contextos moderados y en GPUs de 12-16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI para serving, llama.cpp/Ollama si se generan GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| ryzen838/gemma-4-E4B-it-heretic | 8B totales (4.5B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Variante abliterated, 3/100 rechazos |
| google/gemma-4-E4B-it | 8B totales (4.5B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 | Modelo base instruido, 99/100 rechazos |
| google/gemma-4-26B-A4B | 25.2B totales / 3.8B activos (MoE) | 256K | Texto, imagen | Apache 2.0 | Mayor capacidad, requiere más VRAM |
| google/gemma-4-31B | 30.7B | 256K | Texto, imagen | Apache 2.0 | Denso de mayor tamaño, sin audio |

## Limitaciones y advertencias

- La ablación elimina barreras de seguridad: el modelo puede generar contenido dañino, ilegal o sensible sin rechazo, lo que exige moderación externa en cualquier despliegue.
- Riesgo elevado de alucinación y de respuestas confiadas pero incorrectas, agravado por la reducción de rechazos.
- La evaluación del autor se limita a 100 prompts de rechazo y a la divergencia KL; no hay benchmarks de calidad general que confirmen que las capacidades se preservan íntegramente.
- La ablación se aplicó solo entre las capas 21 y 42; el comportamiento fuera de ese rango puede diferir del esperado.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene verificar las condiciones de uso comercial del modelo base antes de producción.
- No se documentan idiomas concretos ni cuantizaciones oficiales; el soporte multilingüe se hereda del modelo base sin verificación independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni reportes de terceros.
- El pipeline any-to-any implica entradas multimodales, pero la salida es solo texto; no genera imagen ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryzen838/gemma-4-E4B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Colección Gemma 4: https://huggingface.co/collections/google/gemma-4
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Método ARA (PR de Heretic): https://github.com/p-e-w/heretic/pull/211
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en DeepMind: https://deepmind.google/models/gemma/
