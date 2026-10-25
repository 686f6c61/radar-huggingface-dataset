# bf109g14/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-Aggressive es una variante sin censura (uncensored) del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario HauhauCS y re-subida a Hugging Face por bf109g14. Se trata de un modelo denso de 4.205.751.296 parámetros (4,2B) que conserva la arquitectura, el vocabulario y los datos del modelo base, pero con el comportamiento de rechazo eliminado mediante técnicas de modificación de pesos (abliteration, método no documentado públicamente). El autor declara 0 rechazos sobre un conjunto de 465 prompts.

La relevancia técnica del modelo no está en el "uncensoring" sino en la arquitectura que hereda: un transformer híbrido de 32 capas que combina Gated DeltaNet (atención lineal) con atención softmax completa en proporción 3:1, 262.000 tokens de contexto nativo ampliables a 1M con YaRN, vocabulario de 248.000 entradas, soporte nativo multimodal (texto, imagen y vídeo) mediante un codificador de visión separado, y multi-token prediction (MTP). Es, por tanto, un modelo de 4B con prestaciones de contexto y multimodalidad propias de modelos mucho más grandes, lo que lo hace interesante para despliegue local en hardware de consumo.

La variante "Aggressive" aplica una eliminación de rechazos más agresiva que una futura variante "Balanced" que el autor menciona pero no publica. El repositorio analizado (bf109g14) es un espejo con 0 descargas y 0 likes; el repositorio original de HauhauCS acumula, según abliteration.org, 217.900 descargas y 666 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención softmax completa, ratio 3:1; 32 capas |
| Parámetros totales | 4.205.751.296 (4,2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; ampliable a 1M con YaRN |
| Tipos de cuantización | GGUF: BF16, Q8_0, Q6_K, Q4_K_M (este repositorio); safetensors disponibles en el modelo base |
| Idiomas soportados | Etiquetas del repo: en, zh, multilingual. Model card: 201 idiomas, vocabulario de 248K |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros de este repo) y safetensors (metadatos de parámetros); codificador de visión en GGUF `mmproj` |
| Multimodalidad | Nativa: texto, imagen y vídeo (requiere `mmproj` de 645 MB) |
| Vocabulario | 248.000 tokens |
| Multi-token prediction (MTP) | Sí, soportado |
| Tamaño del repositorio | 19,8 GB |

Ficheros GGUF publicados por el autor:

| Fichero | Cuantización | Tamaño |
|---|---|---|
| `...-BF16.gguf` | BF16 | 7,9 GB |
| `...-Q8_0.gguf` | Q8_0 | 4,2 GB |
| `...-Q6_K.gguf` | Q6_K | 3,3 GB |
| `...-Q4_K_M.gguf` | Q4_K_M | 2,6 GB |
| `mmproj-...-BF16.gguf` | Codificador de visión | 645 MB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 32 capas que sustituye tres de cada cuatro capas de atención softmax completa por capas de Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. Esta proporción 3:1 es la innovación principal: reduce el coste computacional y el crecimiento de la caché KV con la longitud de contexto, lo que hace viable operar ventanas de 262K tokens en un modelo de solo 4,2B parámetros. La arquitectura fue publicada por Qwen el 2 de marzo de 2026, según la model card, y el soporte en llama.cpp llegó poco después ("muy recientemente", en palabras del autor), lo que implica riesgo de incompatibilidades en builds antiguos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. El autor afirma explícitamente que no ha modificado datasets ni capacidades: el proceso de "uncensoring" actúa únicamente sobre los pesos para eliminar la negativa a responder. El método concreto de abliteration no está documentado (abliteration.org lo clasifica como "method unknown"). El modelo conserva el modo "thinking" (razonamiento explícito) del base y soporta multi-token prediction, una técnica de decodificación que permite predecir varios tokens por paso y acelera la inferencia en runtimes compatibles.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat.
- Razonamiento explícito en modo "thinking" (activado por defecto según el autor).
- Contexto largo: 262K tokens nativos, con degradación controlada hasta 1M mediante YaRN.
- Multimodalidad nativa: descripción y análisis de imágenes y vídeo mediante el codificador `mmproj`.
- Cobertura multilingüe amplia: 201 idiomas declarados, con vocabulario de 248K entradas; etiquetas oficiales en inglés y chino.
- Generación de código y matemáticas: capacidad heredada del modelo base, sin benchmarks publicados que la cuantifiquen en esta variante.
- Multi-token prediction (MTP) para acelerar la decodificación en runtimes que lo soporten.
- Ausencia de rechazos: 0/465 negativas según la evaluación del autor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidad de audio: no disponible.

## Casos de uso

- **Investigación sobre alineación y abliteration**: el modelo sirve como sujeto de estudio para medir qué se elimina exactamente al aplicar técnicas de modificación de pesos, comparando sus respuestas con las de Qwen3.5-4B original sobre el mismo conjunto de 465 prompts. Es un uso de laboratorio, no de producción.
- **Generación de ficción y guiones con temáticas adultas o violentas**: el modelo no bloquea escenas de conflicto, violencia o contenido explícito, lo que lo hace utilizable en escritura creativa sin las interrupciones habituales de los modelos alineados. Requiere revisión editorial humana y verificación de edad del público objetivo.
- **Análisis de documentos largos en local**: con 262K tokens de contexto puede procesar informes, expedientes o bases de código completas en una sola pasada, sin fragmentar ni recurrir a RAG, en un portátil con GPU de 8 GB usando Q4_K_M.
- **Procesamiento de imágenes y vídeo en el borde**: cargando el `mmproj` de 645 MB junto al GGUF principal, el modelo puede hacer OCR, descripción de escenas o inspección visual de fotogramas en un equipo sin conexión, útil en entornos con requisitos de privacidad (sanidad, industria, auditoría documental).
- **Asistente de programación autoalojado**: integrado en llama.cpp o LM Studio detrás de un IDE, permite autocompletado y explicación de código sin enviar el código fuente a terceros; el contexto largo ayuda a razonar sobre repositorios medianos.
- **Traducción y redacción multilingüe**: con 201 idiomas declarados y vocabulario de 248K, es adecuado para traducción técnica interna o atención a clientes en mercados con idiomas poco cubiertos, aunque la calidad por idioma no está verificada con benchmarks.
- **Prototipado rápido de producto conversacional**: al ser Apache 2.0 y caber en GPUs de consumo, permite montar un endpoint compatible (`endpoints_compatible`) en local para validar flujos de chat antes de comprometerse con un modelo mayor.
- **Despliegue en Colab o entornos efímeros**: existe un repositorio comunitario que configura el Q4_K_M sobre una GPU T4 de Google Colab, útil para demos y pruebas de concepto sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de capacidad; únicamente reporta la métrica de rechazo.

| Métrica | Resultado | Fuente / metodología |
|---|---|---|
| Tasa de rechazo | 0/465 | Autor del modelo; conjunto de prompts y criterio de evaluación no publicados |
| MMLU | No disponible | — |
| HumanEval | No disponible | — |
| GSM8K | No disponible | — |
| Throughput / latencia | No disponible | — |

La afirmación de "zero capability loss" (pérdida de capacidad cero) es una declaración del autor sin verificación independiente publicada en la información disponible.

## Requisitos de hardware

Estimaciones propias a partir del tamaño de los ficheros GGUF; el autor no publica cifras de VRAM ni de throughput.

- **Q4_K_M (2,6 GB de pesos)**: aproximadamente 4 GB de VRAM con contexto moderado. Cabe en GTX 1660 Super, RTX 3050, RTX 3060, portátiles con 6-8 GB. Es la opción para GPU de consumo y para el despliegue en Colab T4.
- **Q6_K (3,3 GB)**: en torno a 5-6 GB de VRAM. Cómodo en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070.
- **Q8_0 (4,2 GB)**: en torno a 6-7 GB de VRAM. Requiere 8 GB o más.
- **BF16 (7,9 GB)**: en torno a 10-12 GB de VRAM a contexto corto. Necesita RTX 4080/4090, A100, H100 o L40S; también viable en CPU con mucha RAM a costa de latencia.
- **Codificador de visión**: añadir 645 MB de VRAM si se usa entrada de imagen o vídeo.
- **Contexto**: a 262K tokens la caché KV crece de forma significativa, aunque el ratio 3:1 de atención lineal reduce el crecimiento respecto a un transformer convencional. No hay cifras publicadas del consumo exacto a contexto completo; para contextos muy largos hay que reservar VRAM adicional o recurrir a offload a CPU.
- **GPU recomendadas para producción**: A100 40/80 GB o H100 para BF16 con contexto largo y concurrencia; RTX 4090 para Q8_0/BF16 en un solo usuario.
- **Opciones de despliegue**: llama.cpp (build reciente obligatorio), LM Studio, Jan, koboldcpp, y para alto rendimiento vLLM, SGLang o KTransformers, recomendados por los autores de Qwen. Existe integración con Ollama mediante el repositorio comunitario de Colab.
- **Latencia y throughput**: no disponibles. El soporte de MTP puede mejorar el throughput en runtimes que lo implementen, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Descargas / tracción |
|---|---|---|---|---|---|
| bf109g14/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive (este repo) | 4,2B densos | 262K (1M con YaRN) | Sí (texto, imagen, vídeo) | Apache 2.0 | 0 descargas, 0 likes |
| HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive (original) | 4,2B densos | 262K (1M con YaRN) | Sí | Apache 2.0 | 217,9K descargas, 666 likes (abliteration.org) |
| Qwen/Qwen3.5-4B (base alineado) | 4,2B densos | 262K (1M con YaRN) | Sí | Apache 2.0 | No disponible en la información |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B (según nombre del repo) | No disponible | No disponible | No disponible | No disponible |
| AIOpsInSpace/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-MTP | 4,2B densos | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es entre este espejo y el repositorio original de HauhauCS: son idénticos en contenido declarado, pero el original concentra toda la tracción (217,9K descargas frente a 0) y es el que debe citarse. El base Qwen3.5-4B es la referencia para medir el efecto del uncensoring, ya que comparte arquitectura y pesos de partida. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- **Modelo sin alineación**: el autor declara 0 rechazos. Esto implica que puede generar contenido dañino, ilegal, sexual explícito, instrucciones peligrosas o desinformación sin filtro. La responsabilidad legal y ética del uso recae íntegramente en el desplegador.
- **Disclaimers residuales**: el autor advierte de que el modelo puede añadir una frase corta de descargo al final de algunas respuestas (por ejemplo, "esto es información general, no asesoramiento legal"), herencia del entrenamiento del base. No es un rechazo, pero puede requerir post-procesado en producción.
- **Capacidad no verificada**: "zero capability loss" es una afirmación del autor sin benchmarks públicos. Las técnicas de abliteration suelen degradar ligeramente el razonamiento y la coherencia en tareas complejas; no hay datos que lo confirmen ni lo descarten aquí.
- **Método de uncensoring no documentado**: abliteration.org clasifica el método como desconocido, lo que dificulta auditar qué se ha modificado exactamente en los pesos.
- **Riesgo de alucinación**: inherente a un modelo de 4B parámetros; sin benchmarks ni evaluaciones de factualidad publicadas. No recomendado para dominios de alta precisión sin verificación externa.
- **Repositorio espejo sin tracción**: este repo tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día. Conviene descargar del repositorio original de HauhauCS para garantizar integridad de ficheros y actualizaciones.
- **Arquitectura muy reciente**: publicada el 2 de marzo de 2026; el propio autor advierte de que el soporte en llama.cpp es reciente y exige builds actualizados. Riesgo de bugs en runtimes no actualizados.
- **Idiomas**: las etiquetas solo garantizan inglés y chino; los 201 idiomas declarados no tienen evaluación publicada. La calidad en castellano no está verificada y no debe asumirse.
- **Contexto largo**: el autor recomienda mantener al menos 128K tokens de ventana para preservar el modo thinking. La extensión a 1M con YaRN degrada la calidad y dispara el consumo de memoria.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero no exime del cumplimiento normativo (RGPD, DSA, legislación sobre contenido generado) ni de las políticas de las plataformas donde se despliegue.
- **Sin soporte documentado de tool calling ni agentes**: no se debe asumir capacidad de function calling en pipelines de producción sin verificarlo empíricamente.

## Enlaces

- Repositorio analizado: https://huggingface.co/bf109g14/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Repositorio original: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Variante 9B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Perfil del autor original: https://huggingface.co/HauhauCS
- Variante MTP de terceros: https://huggingface.co/AIOpsInSpace/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ficha en Inferix: https://inferix.co/models/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Clasificación de abliteration: https://abliteration.org/models/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Despliegue en Colab y Ollama (comunidad): https://github.com/CookieFilled/qwen-3.5-4B-uncensored-colab
- Discord del autor: https://discord.gg/SZ5vacTXYf
