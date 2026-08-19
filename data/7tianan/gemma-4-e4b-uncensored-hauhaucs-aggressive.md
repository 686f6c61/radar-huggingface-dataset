# 7tianan/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

El modelo `7tianan/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive` es una variante de Google Gemma 4 E4B-IT a la que se ha aplicado una técnica de *abliteration* para eliminar los rechazos de seguridad del modelo original. El trabajo de "uncensoring" ha sido realizado por HauhauCS, y el usuario 7tianan lo ha subido a HuggingFace en formato GGUF. El resultado es un modelo que, según la model card, presenta 0 rechazos en 465 pruebas realizadas, manteniendo intactas las capacidades del modelo base.

La relevancia de esta ficha radica en que es un ejemplo práctico de cómo la comunidad modifica modelos propietarios de código abierto (Gemma) para eliminar restricciones de seguridad, un tema controvertido y de interés para investigadores en alineación y seguridad de IA. El modelo es nativamente multimodal (texto, imagen, vídeo y audio), con una arquitectura de 42 capas, atención mixta (ventana deslizante de 512 tokens + atención completa) y un contexto de 131.072 tokens. Es importante señalar que, aunque la model card indica "4B parámetros", los metadatos reales de los safetensors en HuggingFace muestran 7.518.069.290 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, vídeo, audio) con atención mixta (ventana deslizante de 512 + atención completa) |
| Parametros totales | 7.518.069.290 (según metadatos de HuggingFace; la model card indica 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (131K) |
| Tipos de cuantizacion | GGUF: Q2_K_P, Q3_K_M, Q3_K_P, IQ3_M, Q4_K_M, Q4_K_P, IQ4_XS, Q5_K_M, Q5_K_P, Q6_K, Q6_K_P, Q8_0, Q8_K_P. Además, mmproj f16 (945 MB) para visión/audio |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Gemma (sujeta a los términos de uso de Google) |
| Formato de pesos | GGUF (y safetensors del modelo base) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo original `google/gemma-4-e4b-it`. Consta de 42 capas, de las cuales 18 comparten claves y valores (KV) para optimizar el uso de memoria. La atención es mixta: combina una ventana deslizante de 512 tokens con atención completa, lo que permite manejar eficientemente los 131K tokens de contexto. El modelo es nativamente multimodal, procesando texto, imagen, vídeo y audio.

El entrenamiento de esta variante no modifica los pesos del modelo original mediante fine-tuning tradicional. En su lugar, se aplica *abliteration*, una técnica que identifica y elimina las direcciones (direcciones de activación) responsables de los comportamientos de rechazo. Según la model card, no hay cambios en los datasets ni en las capacidades del modelo, y el resultado es una tasa de rechazo de 0/465. No se proporcionan datos sobre el dataset de entrenamiento, ni sobre el uso de RLHF o DPO adicionales. Los cuantos GGUF se han generado con *importance matrix* (imatrix) para preservar la calidad sobre los pesos ablacionados.

## Capacidades

- Generación de texto sin rechazos de seguridad: el modelo no se niega a responder a peticiones que el modelo base rechazaría, generando siempre el contenido completo.
- Multimodal nativo: procesa texto, imagen, vídeo y audio. Para usar estas capacidades con llama.cpp es necesario cargar el archivo `mmproj` (proyector multimodal) junto al GGUF principal.
- Conversacional: diseñado para mantener diálogos multi-turno con la plantilla de chat de Gemma (requiere el flag `--jinja` en llama.cpp).
- Contexto largo: soporta hasta 131K tokens, lo que permite procesar documentos extensos o conversaciones muy largas.
- Compatibilidad con runtimes GGUF: funciona con llama.cpp, LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF.
- No se especifica en la documentación proporcionada soporte explícito para *tool calling* o *function calling*.

## Casos de uso

- Generación creativa de contenido sin restricciones: escritores y guionistas pueden explorar temas controvertidos, violencia gráfica o diálogos explícitos sin que el modelo interrumpa la generación con avisos de seguridad.
- Investigación en alineación y seguridad de IA: permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando sus respuestas con el modelo base para entender qué mecanismos internos provocan los rechazos.
- Análisis multimodal en entornos controlados: investigadores pueden alimentar el modelo con imágenes, vídeos o audio para tareas de descripción o extracción de información, aprovechando los 131K tokens de contexto para procesar secuencias largas.
- Asistentes locales con contexto largo: desplegado en una máquina de escritorio mediante llama.cpp o LM Studio, puede actuar como asistente personal que mantiene conversaciones de miles de tokens sin perder el hilo.
- Simulación de escenarios de riesgo: en entornos de pruebas de seguridad, se puede usar para generar contenido que un modelo alineado rechazaría, sirviendo como *red team* para evaluar filtros y moderadores.
- Procesamiento de documentos extensos y multimedia: con su ventana de 131K tokens, puede resumir libros completos, analizar transcripciones de vídeo o procesar largas cadenas de audio en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q2_K_P (4,2 GB) se necesitan al menos 6 GB de VRAM libres. Para Q4_K_M (5,0 GB) se recomiendan 8 GB. Para Q8_K_P (7,6 GB) se necesitan al menos 10-12 GB.
- GPU recomendadas: el modelo cabe en GPUs de consumo. Una RTX 3060 de 12 GB puede ejecutar cómodamente los cuantos Q4 y Q5. Una RTX 4090 puede ejecutar el Q8_K_P con contexto largo.
- Opciones de despliegue: llama.cpp (con el flag `--jinja` y `-ngl 99` para offload completo), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. También es posible usar Ollama si se convierte el GGUF a su formato.
- Latencia y throughput: no disponible en la documentación proporcionada. Dependerá de la GPU, la cuantización y la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-e4b-it (base) | 7.518.069.290 (según HF) | 131K | Sí | Gemma | Safetensors |
| 7tianan/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 7.518.069.290 (según HF) | 131K | No (0/465) | Gemma | GGUF |
| Variante Balanced (mencionada, no publicada) | No disponible | No disponible | Conserva algunos guardarraíles | Gemma | No disponible |

La principal diferencia con el modelo base es la eliminación de los rechazos. No se dispone de datos de otros modelos *abliterated* comparables en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar los rechazos, el modelo puede generar contenido violento, ilegal, discriminatorio o sexualmente explícito. Su uso en producción conlleva un alto riesgo ético y legal.
- Licencia restrictiva: la licencia Gemma de Google prohíbe ciertos usos (por ejemplo, usos militares o que violen los términos de servicio). El *uncensoring* no elimina estas restricciones contractuales.
- Alucinaciones: no hay datos sobre su tasa de alucinación, pero al ser una variante sin ajuste adicional, es probable que herede las del modelo base.
- Discrepancia en parámetros: la model card indica 4B parámetros, pero los safetensors muestran 7,5B. Esta inconsistencia puede afectar a la planificación de recursos.
- Estabilidad en contexto largo: la model card advierte que Gemma 4 no fue probado manualmente en contextos largos y que Google usa técnicas de *reward modeling* generativo (GenRM), lo que puede hacer que el *uncensoring* sea menos fiable en conversaciones muy extensas.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar, lo que dificulta evaluar su calidad real frente a otros modelos.
- Baja adopción: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un lanzamiento reciente o poco verificado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/7tianan/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
