# shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q6

## Resumen

El modelo `shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q6` es una cuantización en 6 bits (formato MLX) del modelo `coder3101/gemma-4-26B-A4B-it-heretic`, una variante "sin censura" (uncensored) del Gemma 4 de Google DeepMind. El autor, shoemoney, ha convertido los pesos originales en BF16 a precisión de 6 bits con grupo de cuantización de 64, utilizando la herramienta `mlx_vlm.convert`, sin fine-tuning ni re-alineación adicional. El resultado es un modelo optimizado para ejecutarse en hardware Apple Silicon mediante la librería mlx-vlm.

El modelo base pertenece a la familia Gemma 4, que incluye arquitecturas densas y de mezcla de expertos (MoE). En concreto, la variante 26B-A4B es un MoE con 26 mil millones de parámetros totales y 4 mil millones activos por token, con soporte multimodal (visión y texto), contexto de hasta 256K tokens y más de 140 idiomas. La versión "heretic" elimina las restricciones de seguridad habituales, lo que la hace adecuada para experimentación sin filtros, aunque con los riesgos asociados. Esta cuantización MLX permite ejecutar el modelo en Macs con memoria unificada, reduciendo el espacio en disco a 21.68 GB y ofreciendo un rendimiento medido de 43.8 tok/s en petición única y 143.8 tok/s con 8 peticiones concurrentes en un Apple M3 Ultra de 96 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal (visión + texto) |
| Parametros totales | 26B (según modelo base); 6.091.232.846 en el archivo safetensors cuantizado (dato reportado) |
| Parametros activos | 4B (por token) |
| Longitud de contexto | 256K tokens (según modelo base) |
| Tipos de cuantizacion | 6-bit (MLX, grupo de 64) |
| Idiomas soportados | Más de 140 (según modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con arquitectura MoE: 26B parámetros totales, de los cuales 4B se activan por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional. El modelo original de Google fue entrenado con un enfoque de "hybrid-thinking", que combina razonamiento explícito con generación directa, y soporta entradas de imagen y texto. La variante "heretic" es un fine-tuning del modelo instruct de Gemma 4 que elimina los mecanismos de rechazo de contenido, manteniendo las capacidades técnicas intactas.

La cuantización MLX 6-bit se realizó con `mlx_vlm.convert` sobre los pesos BF16, utilizando un grupo de cuantización de 64. No se aplicó ningún ajuste posterior, por lo que las diferencias de rendimiento respecto al original se deben únicamente a la pérdida de precisión. El autor midió una perplexidad de 100.433 sobre el dataset `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens), que es 1.00× la del mejor escalón de la misma familia de cuantizaciones, lo que indica que la degradación es mínima dentro de esa serie.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica y matemáticas.
- Comprensión y generación de código en múltiples lenguajes de programación.
- Procesamiento multimodal: acepta imágenes como entrada y puede describirlas, responder preguntas visuales o razonar sobre su contenido.
- Soporte de contexto largo de hasta 256K tokens, útil para documentos extensos o conversaciones de muchas vueltas.
- Multilingüismo: más de 140 idiomas, con especial énfasis en lenguas europeas y asiáticas.
- Capacidad de "thinking mode" (razonamiento híbrido) que permite al modelo generar cadenas de pensamiento antes de responder.
- Al ser una variante "uncensored", no aplica filtros de contenido ni rechazos por temas sensibles, lo que permite explorar casos de uso sin restricciones (con los riesgos asociados).

## Casos de uso

- Despliegue local en Macs con Apple Silicon: gracias a la cuantización MLX 6-bit, el modelo ocupa 21.68 GB y puede ejecutarse en equipos con 32 GB o más de memoria unificada, ofreciendo una alternativa privada a APIs en la nube para tareas de generación de texto y visión.
- Asistente de programación sin censura: al no tener restricciones de contenido, puede generar código para scripts de automatización, explotación de vulnerabilidades en entornos de prueba o análisis de malware, donde los modelos estándar suelen rechazar peticiones.
- Análisis de documentos extensos: con 256K de contexto, puede procesar libros completos, informes técnicos o bases de conocimiento para extraer información, resumir o responder preguntas sobre el contenido.
- Investigación en seguridad y jailbreak: la variante "heretic" permite estudiar los límites de los modelos de lenguaje y desarrollar técnicas de alineación, al poder generar respuestas que otros modelos bloquean.
- Aplicaciones de visión-lenguaje en entornos sin conexión: por ejemplo, describir imágenes médicas (con fines educativos), analizar capturas de pantalla o generar alt-text automático, todo localmente.
- Prototipado rápido de agentes conversacionales: al ser un MoE con 4B activos, la inferencia es relativamente rápida en hardware Apple, permitiendo iterar sobre prompts y flujos de conversación sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones propias de perplexidad y throughput:

| Metrica | Valor |
|---|---|
| Perplexidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 100.433 |
| Throughput (1 petición) | 43.8 tok/s |
| Throughput (8 peticiones concurrentes) | 143.8 tok/s |
| Tamaño en disco | 21.68 GB |

Estas cifras se obtuvieron en un Apple M3 Ultra con 96 GB de memoria unificada y macOS 27. La perplexidad solo es comparable dentro de la misma familia de cuantizaciones, no entre modelos distintos.

## Requisitos de hardware

- VRAM estimada: al ser MLX, usa memoria unificada. El modelo ocupa 21.68 GB en disco, por lo que se recomienda al menos 32 GB de RAM unificada para cargarlo con margen.
- GPU recomendadas: cualquier Apple Silicon con 32 GB o más (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra). El autor probó en un M3 Ultra de 96 GB.
- No es compatible con GPUs NVIDIA o AMD; está diseñado exclusivamente para el ecosistema MLX de Apple.
- Opciones de despliegue: mediante `mlx_vlm.generate` (CLI) o integración en aplicaciones Python con la librería `mlx-vlm`. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: 43.8 tok/s en petición única y 143.8 tok/s con 8 concurrentes en el hardware de referencia. En equipos con menos memoria o menor ancho de banda, el rendimiento será inferior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Heretic-MLX-q6 (este) | 26B totales, 4B activos | 256K | Apache 2.0 | MLX 6-bit | Sin censura, multimodal, solo Apple Silicon |
| google/gemma-4-26B-A4B-it | 26B totales, 4B activos | 256K | Apache 2.0 | BF16 | Versión oficial instruct, con filtros de seguridad |
| coder3101/gemma-4-26B-A4B-it-heretic | 26B totales, 4B activos | 256K | Apache 2.0 | BF16 | Fine-tuning sin censura, base de esta cuantización |
| Otras cuantizaciones MLX del mismo modelo (q4, q8) | 26B totales, 4B activos | 256K | Apache 2.0 | MLX | Misma familia, distinta precisión; este q6 es el mejor según el autor |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser una variante "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso en producción debe contemplar medidas de moderación externas.
- La cuantización 6-bit introduce una pérdida de precisión que, aunque mínima según la perplexidad medida, puede afectar a tareas que requieren exactitud numérica o razonamiento fino.
- El modelo solo funciona en Apple Silicon; no es portable a entornos con GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (GGUF, etc.), que no se proporciona.
- La perplexidad reportada (100.433) es alta en términos absolutos, aunque el autor aclara que solo es comparable dentro de la misma familia. No obstante, sugiere que el modelo puede tener dificultades con textos muy diversos.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible evaluar su rendimiento relativo frente a otros modelos en tareas como MMLU o HumanEval.
- El contexto de 256K es teórico; en la práctica, el rendimiento puede degradarse con secuencias muy largas y el consumo de memoria aumenta considerablemente.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo con fine-tuning "heretic", el responsable final debe asumir los riesgos legales y éticos del contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoemoney/Gemma-4-26B-A4B-Heretic-MLX-q6
- Modelo base (fine-tuning heretic): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo original de Google (instruct): https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo original de Google (base): https://huggingface.co/google/gemma-4-26B-A4B
- Documentación de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía de Unsloth para Gemma 4: https://unsloth.ai/docs/models/gemma-4
- Página de LM Studio para Gemma 4 26B A4B: https://lmstudio.ai/models/google/gemma-4-26b-a4b
