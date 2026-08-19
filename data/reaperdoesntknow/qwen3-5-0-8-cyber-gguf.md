# reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF

## Resumen

Qwen3.5-0.8-Cyber-GGUF es un repositorio que distribuye el modelo Qwen/Qwen3.5-0.8B en formato GGUF, con una escalera de cuantizaciones pensada para inferencia local en dispositivos con recursos limitados. El autor, reaperdoesntknow, lo publica como parte de una colección orientada a ciberseguridad (CIx), aunque la etiqueta "Cyber" se describe como una variante del repositorio, no como una capacidad verificada. El modelo base tiene 752 millones de parámetros y licencia Apache-2.0.

La relevancia de esta ficha radica en que ofrece un punto de partida práctico para experimentar con un modelo pequeño de la familia Qwen3.5 en CPU o GPU de baja gama, permitiendo comparar el impacto de distintas cuantizaciones (desde BF16 hasta Q2_K_L) en calidad y memoria. No se publican resultados de benchmarks ni documentación del ajuste fino, por lo que las capacidades reales deben evaluarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo mmproj BF16 adicional) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo base Qwen3.5-0.8B. Se sabe que el repositorio contiene una conversión a GGUF realizada con Unsloth y llama.cpp, y que el modelo original es Qwen/Qwen3.5-0.8B. No se documenta el dataset de fine-tuning ni la receta de entrenamiento, por lo que no es posible confirmar si hubo fases de RLHF, DPO u otras técnicas. El archivo `BF16-mmproj` sugiere la presencia de un proyector multimodal, pero la model card advierte explícitamente que la ruta multimodal no ha sido validada de extremo a extremo para esta versión.

## Capacidades

- Generación de texto conversacional: el modelo puede mantener diálogos multi-turno, aunque su tamaño reducido limita la complejidad de las respuestas.
- Experimentación local: permite probar distintas cuantizaciones y medir su efecto en la calidad de salida.
- Inferencia en CPU y dispositivos con poca memoria: los archivos GGUF están optimizados para ejecución con llama.cpp y Ollama.
- Comparación reproducible de cuantizaciones: el repositorio ofrece una escalera completa (BF16, Q8_0, Q6_K, Q4_K_M, Q2_K_L) para evaluar trade-offs entre tamaño y fidelidad.
- No se documentan capacidades específicas como tool calling, function calling, razonamiento multi-paso o soporte de agentes. Tampoco hay evidencia de capacidades multimodales funcionales.

## Casos de uso

- Prototipado rápido en entornos sin GPU: un desarrollador puede cargar el modelo con `llama-cli` o Ollama en un portátil con CPU y probar ideas de chatbot o generación de texto antes de escalar a modelos mayores.
- Comparación de cuantizaciones para despliegue edge: usando los distintos archivos GGUF, se puede medir la degradación de calidad entre Q4_K_M y Q2_K_L para decidir qué versión usar en un dispositivo con 512 MB de RAM.
- Clasificación de texto simple: tareas como análisis de sentimiento o categorización de mensajes pueden ejecutarse localmente con un prompt adecuado, sin depender de APIs externas.
- Generación de respuestas en asistentes de baja latencia: al ser un modelo de 0.8B, la inferencia es rápida incluso en CPU, adecuada para aplicaciones donde la latencia importa más que la profundidad del razonamiento.
- Educación y experimentación: estudiantes e investigadores pueden usar el modelo para entender cómo funcionan las cuantizaciones GGUF y cómo afectan al rendimiento sin necesidad de hardware caro.
- Pruebas de integración con llama.cpp y Ollama: el repositorio sirve como banco de pruebas para verificar que el pipeline de inferencia local funciona correctamente antes de adoptar modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ni líneas base de comparación en el repositorio. No se deben asumir cifras de MMLU, HumanEval u otros tests.

## Requisitos de hardware

- VRAM estimada: para el archivo Q4_K_M (529 MB) se necesitan aproximadamente 600 MB de VRAM o RAM; Q8_0 (812 MB) requiere alrededor de 1 GB; BF16 (1.52 GB) necesita unos 2 GB. El archivo mmproj BF16 (207 MB) añade un pequeño overhead si se usa.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1050, RTX 2050, o iGPUs modernas) puede ejecutar las versiones cuantizadas. Para BF16 se recomienda una GPU con 2 GB o más. En CPU también es viable gracias a llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama run hf.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF:Q4_K_M`), y cualquier runtime compatible con GGUF (por ejemplo, LM Studio).
- Latencia y throughput: no se proporcionan datos medidos. En una CPU moderna, un modelo de 0.8B cuantizado a Q4_K_M puede generar decenas de tokens por segundo, pero esto depende del hardware y del backend.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Existe un repositorio hermano del mismo autor, `reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF`, que ofrece un modelo de 2B con cuantizaciones similares, pero no se publican benchmarks en ninguna de las dos fichas. Tampoco se encontraron comparaciones con otros modelos GGUF de tamaño similar en la información recopilada. Por tanto, la comparativa queda pendiente de evaluación independiente.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados; el rendimiento real es desconocido y debe medirse en cada caso de uso.
- El dataset de fine-tuning y la receta de entrenamiento no están documentados, por lo que no se puede verificar qué datos influyeron en el comportamiento del modelo.
- La etiqueta "Cyber" es solo un nombre de variante; no implica capacidades de ciberseguridad verificadas.
- El archivo mmproj está presente pero la ruta multimodal no ha sido validada; no se debe depender de ella sin pruebas locales.
- Las cuantizaciones más agresivas (Q2_K_L) pueden degradar notablemente la calidad de las respuestas.
- El modelo puede producir salidas incorrectas, incompletas, sesgadas o inseguras; no debe usarse como fuente autoritativa en ámbitos legales, médicos, de seguridad u operativos.
- Al ser un modelo de 0.8B, su capacidad de razonamiento complejo y de seguir instrucciones largas es limitada en comparación con modelos mayores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/reaperdoesntknow/Qwen3.5-0.8-Cyber-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Colección CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
- Repositorio hermano (2B): https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Paper técnico de Qwen3 (referencia general, no específica de Qwen3.5): https://arxiv.org/abs/2505.09388
