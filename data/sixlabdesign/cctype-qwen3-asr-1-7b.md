# SIXlabdesign/cctype-qwen3-asr-1.7b

## Resumen

Qwen3-ASR 1.7B (MLX) es una adaptación del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen (Alibaba Cloud, Tongyi Lab). El repositorio SIXlabdesign/cctype-qwen3-asr-1.7b es un espejo del modelo oficial al que se ha añadido una copia cuantizada a 8 bits en formato MLX, pensada para ejecutarse de forma nativa en Apple Silicon dentro de la aplicación de dictado cctype para macOS.

El modelo combina un codificador de audio con un modelo de lenguaje Qwen3 que genera la transcripción directamente con puntuación, sin necesidad de un módulo de puntuación separado. Cubre 30 idiomas y 22 dialectos chinos, y admite contexto en texto libre (por ejemplo, listas de nombres propios o terminología) que el modelo utiliza durante la transcripción. El tamaño de 1.7B parámetros lo sitúa en la gama media, apta para ejecución local en equipos de sobremesa y portátiles.

Su relevancia actual radica en que demuestra un flujo de reconocimiento de voz de alta calidad ejecutado íntegramente en local sobre hardware de consumo Apple, con dos variantes de pesos (bfloat16 sin modificar y 8 bits MLX) y unas métricas publicadas por el autor de la adaptación sobre un conjunto reducido de frases de dictado bilingüe chino-inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio + modelo de lenguaje Qwen3 (transformer); adaptación MLX |
| Parametros totales | 1.7B (según nombre del modelo; desglose no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 sin modificar (`original/`) y 8 bits MLX con grupos de 64 (`8bit/`); se probó 4 bits y se descartó |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos (según model card); etiquetado del repo: zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); `original/` con nombres de clave de Qwen y convolución en layout PyTorch, `8bit/` con nombres MLX, convoluciones channels-last y capa de salida atada a los embeddings |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de reconocimiento de voz compuesto por un codificador de audio que alimenta a un modelo de lenguaje Qwen3, el cual escribe directamente la transcripción puntuada. Las características de entrada son de estilo Whisper: 128 bins log-mel, ventana de 25 ms y salto de 10 ms. El prompt sigue la plantilla de chat de Qwen, con el contexto en el turno de sistema y el audio en el turno de usuario; la respuesta tiene el formato `language Chinese<asr_text>…`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La adaptación de este repositorio no reentrena el modelo: aplica cuantización afín de MLX sobre todas las capas lineales y de embeddings con grupos de 64, mediante el script `Tools/qwen3-asr/quantize.py` del repositorio cctype. La implementación en Swift del pipeline (paquete `Packages/Qwen3ASR`) se validó contra la implementación de referencia `mlx-qwen3-asr`, obteniendo texto idéntico en las frases de prueba para ambas variantes.

## Capacidades

- Transcripción de voz a texto con puntuación generada directamente por el modelo de lenguaje, sin post-procesado separado.
- Reconocimiento multilingüe: 30 idiomas y 22 dialectos chinos según la model card.
- Manejo de habla mixta chino-inglés dentro de una misma frase.
- Uso de contexto en texto libre: el modelo incorpora listas de nombres y términos para mejorar la transcripción de vocabulario específico.
- Salida con etiqueta de idioma detectado y texto transcrito en un formato estructurado (`language X<asr_text>…`).
- Ejecución local en Apple Silicon mediante MLX, con dos variantes de pesos seleccionables.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio más allá del reconocimiento de voz.

## Casos de uso

- Dictado nativo en macOS: es el escenario para el que se creó la adaptación; la aplicación cctype ejecuta el modelo con MLX sobre Apple Silicon y ofrece las variantes `original/` y `8bit/` según el equilibrio deseado entre precisión y velocidad.
- Transcripción de reuniones bilingües chino-inglés: el modelo está entrenado para habla mixta y genera puntuación, lo que reduce el trabajo de post-edición en actas y notas.
- Subtitulado de contenido en chino con terminología específica: el contexto en texto libre permite inyectar nombres de personas, marcas o jerga técnica para mejorar la exactitud en dominios concretos.
- Dictado clínico o legal con vocabulario controlado: la posibilidad de pasar un glosario como contexto resulta útil cuando los términos no aparecen en el habla general.
- Prototipado de asistentes de voz en local: al ejecutarse en hardware Apple de consumo, sirve para validar pipelines de ASR sin depender de servicios en la nube ni enviar audio a terceros.
- Aplicaciones de accesibilidad: entrada por voz en sistemas macOS para usuarios con movilidad reducida, con latencias del orden de 620 ms a 1.0 s por frase según las mediciones del autor.
- Investigación en ASR multilingüe: la disponibilidad de pesos en bfloat16 sin modificar y en 8 bits MLX facilita experimentos de cuantización y comparaciones de precisión.

## Benchmarks y rendimiento

El autor de la adaptación publica métricas propias sobre 16 frases de dictado mixto chino-inglés, un solo hablante, Apple M3, vocabulario como contexto y activaciones float16. No son benchmarks estándar (no hay MMLU, HumanEval ni GSM8K, que además no aplican a un modelo ASR):

| Variante | Tasa de error de caracteres | Tiempo por frase (4-6 s de voz) |
|---|---|---|
| `original/` (bfloat16) | 3.6% | 1.0 s |
| `8bit/` (MLX 8 bits) | 4.6% | 620 ms |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/unificada estimada: unos 4.7 GB para la variante bfloat16 y unos 2.2 GB para la variante de 8 bits, según los tamaños de carpeta indicados en la model card.
- Plataforma objetivo: Apple Silicon con MLX (las mediciones se hicieron en un Apple M3). No se documenta soporte para GPU NVIDIA ni ROCm en esta adaptación.
- Cabe en equipos de consumo Apple con memoria unificada de 8 GB o superior, especialmente la variante de 8 bits.
- Opciones de despliegue: MLX y la implementación Swift incluida en el repositorio cctype (`Packages/Qwen3ASR`); también existe la implementación de referencia `mlx-qwen3-asr`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1.0 s por frase de 4-6 s de voz con bfloat16 y 620 ms con 8 bits, medidas en Apple M3. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| SIXlabdesign/cctype-qwen3-asr-1.7b | 1.7B | 30 idiomas + 22 dialectos chinos (según model card) | MLX, Apple Silicon | Apache 2.0 | Adaptación cuantizada del modelo Qwen; métricas propias limitadas a 16 frases |
| SIXlabdesign/cctype-qwen3-asr-0.6b | 0.6B | No disponible en detalle | MLX, Apple Silicon | Apache 2.0 (presumible, no confirmado) | Variante menor del mismo autor para cctype; menor coste, precisión no disponible |
| Qwen/Qwen3-ASR-1.7B | 1.7B | 30 idiomas + 22 dialectos chinos | Safetensors (PyTorch) | Apache 2.0 | Modelo original de Tongyi Lab; requiere pila PyTorch/GPU |
| Whisper (variantes de tamaño medio) | Variable | Multilingüe | Múltiples (PyTorch, GGUF, etc.) | MIT (según versión) | Referencia habitual en ASR; comparación numérica directa no disponible en la información proporcionada |

## Limitaciones y advertencias

- Las métricas publicadas proceden de 16 frases de un único hablante y un único equipo (Apple M3); no son representativas de la precisión en poblaciones, acentos o condiciones acústicas diversas.
- La cuantización a 4 bits se descartó porque el modelo a veces traducía al inglés en lugar de transcribir el chino; no debe asumirse que variantes más agresivas mantengan el comportamiento.
- El etiquetado del repositorio limita los idiomas a zh y en, aunque la model card menciona 30 idiomas y 22 dialectos; la cobertura real fuera de chino e inglés no está verificada en esta ficha.
- No hay información sobre sesgos demográficos, acústicos o lingüísticos del modelo original ni de la adaptación.
- Riesgo de alucinación inherente a los modelos de lenguaje que generan la transcripción: pueden producir texto plausible no presente en el audio, especialmente con ruido o vocabulario fuera de dominio.
- La adaptación está atada a MLX y Apple Silicon; no es portable directamente a otras pilas de inferencia sin conversión.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es obra del equipo Qwen y esta adaptación solo lo replica y cuantiza; conviene conservar los avisos de atribución.
- Longitud de contexto y límites de duración de audio no documentados; para audios largos habrá que segmentar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SIXlabdesign/cctype-qwen3-asr-1.7b
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Variante 0.6B del mismo autor: https://huggingface.co/SIXlabdesign/cctype-qwen3-asr-0.6b
