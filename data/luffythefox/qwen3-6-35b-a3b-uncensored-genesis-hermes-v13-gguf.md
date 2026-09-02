# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-GGUF es un modelo de lenguaje de tipo mixture-of-experts (MoE) de 35 000 millones de parámetros, con aproximadamente 3 000 millones de parámetros activos según su nomenclatura (A3B). Ha sido desarrollado por LuffyTheFox sobre la base sin censura HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, que a su vez deriva de la familia Qwen3.6 de Alibaba. El modelo incorpora un finetune de tipo Hermes (transferido desde DJLougen/hermes-qwen3.5-35b-a3b-GGUF) orientado a capacidades agénticas y function calling, y se distribuye exclusivamente en formato GGUF.

La característica más singular es el método de post-entrenamiento denominado Genesis, desarrollado por el propio autor, que aplica una reparación numérica de los tensores del modelo basada en la distribución de Marchenko-Pastur y descomposición SVD para reducir el ruido acumulado durante el entrenamiento. El modelo es multimodal (image-text-to-text), soporta entrada de imágenes y texto, y está diseñado para ejecutarse en entornos de inferencia locales con GGUF, como llama.cpp u Ollama. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su naturaleza "uncensored" (0/465 rechazos según el autor) lo diferencia de las versiones oficiales alineadas de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet linear attention + full softmax attention (ratio 3:1), 40 capas |
| Parametros totales | 35 000 millones |
| Parametros activos | 3 000 millones (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q8_K_P y otras; no se detalla el listado completo) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura combina atención lineal Gated DeltaNet con atención softmax completa en una proporción de 3:1 a lo largo de 40 capas, siguiendo el diseño de la familia Qwen3.6. El modelo emplea un mecanismo MoE con 256 expertos (según la información disponible para versiones anteriores de la misma serie, aunque no se confirma el número exacto en esta versión), de los cuales se activan 8 durante la inferencia según las recomendaciones del autor. El autor indica que la base original fue entrenada por HauhauCS y que él aplicó el método Genesis de reparación de tensores, que actúa en tres etapas: escaneo y reparación de los tensores ssm_conv1d (memoria de contexto largo), sustitución de bloques de ceros corruptos mediante selección de bloques óptimos, y reducción de ruido de entrenamiento mediante SVD basado en la ley de Marchenko-Pastur, preservando el 99 % de la señal y el gradiente aprendido. Además, se transfirieron aproximadamente 2000 bloques de dos tensores expertos FFN desde el finetune Hermes para dotar al modelo de capacidades agénticas y de function calling, utilizando el dataset NousResearch/hermes-function-calling-v1.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés, chino y otros idiomas).
- Entrada multimodal de imagen y texto (image-text-to-text), con capacidad de describir y razonar sobre imágenes.
- Function calling / tool calling, gracias al finetune Hermes sobre el dataset hermes-function-calling-v1.
- Comportamiento agéntico y razonamiento multi-paso, orientado a tareas de agente autónomo.
- Modo "thinking" (razonamiento encadenado) configurable, con parámetros recomendados por el autor (temperatura 0.6, top_k 20, etc.).
- Ausencia de filtros de rechazo de contenido (uncensored), con 0 rechazos sobre 465 prompts de prueba según el autor.
- Compatibilidad con plantillas de chat personalizadas (chat_template.jinja) y ajuste fino del número de expertos activos (recomendado 8).

## Casos de uso

- Asistentes conversacionales sin restricciones de contenido: el modelo puede mantener conversaciones multi-turno sobre temas sensibles o controvertidos sin rechazos, gracias a su naturaleza uncensored, siendo útil para investigación en IA o entornos controlados.
- Agentes autónomos con tool calling: su finetune Hermes permite integrarlo en pipelines de automatización que requieren llamar a funciones externas, APIs o herramientas, ejecutando tareas multi-paso de forma autónoma.
- Análisis de imágenes y documentos visuales: al ser multimodal, puede procesar capturas, diagramas o fotografías para generar descripciones, extraer información o responder preguntas sobre el contenido visual.
- Desarrollo de chatbots multilingües: su soporte para inglés, chino y otros idiomas lo hace adecuado para aplicaciones de atención al cliente o asistentes en entornos multilingües.
- Generación de código y asistencia técnica en entornos locales: al distribuirse en GGUF, puede ejecutarse en hardware de consumo con llama.cpp u Ollama, permitiendo asistencia de programación sin conexión a la nube.
- Investigación sobre técnicas de post-entrenamiento: el método Genesis aplicado puede estudiarse como caso práctico de reparación de tensores y reducción de ruido en modelos MoE, comparando su comportamiento con versiones sin procesar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo MoE de 35B totales con 3B activos, la VRAM necesaria depende de la cuantización GGUF elegida. Como referencia orientativa para modelos de 35B en GGUF: una cuantización Q4_K_M ocupa aproximadamente 20 GB, Q5_K_M unos 24 GB y Q8_K_P cerca de 37 GB.
- El autor recomienda forzar 40 capas MoE a CPU y cargar el resto en GPU, lo que permite ejecutar el modelo con GPUs de consumo como RTX 3090 (24 GB), RTX 4090 (24 GB) o superiores. Con cuantizaciones bajas podría caber en GPUs de 12-16 GB.
- Los pesos GGUF son compatibles con llama.cpp, Ollama, LM Studio y otros runtimes que soporten este formato.
- Se recomienda configurar el cache K/V en F16 y fijar el número de expertos activos en 8 para un rendimiento óptimo según el autor.
- La velocidad de inferencia depende del hardware y la cuantización; al activar solo 3B parámetros, el throughput es significativamente mayor que el de un modelo denso de 35B, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13 (este) | 35B | 3B | no disponible | Apache 2.0 | GGUF |
| Qwen3-30B-A3B (oficial Alibaba) | 30B | 3B | 128K (típico de Qwen3) | Apache 2.0 | safetensors, GGUF |
| Qwen3-32B (denso, oficial) | 32B | 32B | 128K (típico de Qwen3) | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en la arquitectura y disponibilidad, ya que no se dispone de datos de rendimiento del modelo evaluado. Frente a los modelos oficiales de Qwen, esta versión añade el finetune Hermes para agentes, la reparación Genesis y la ausencia de censura, a costa de un proceso de post-entrenamiento no estándar sin validación académica.

## Limitaciones y advertencias

- Naturaleza uncensored: el modelo puede generar contenido ofensivo, ilegal o perjudicial sin filtros. Su uso en producción debe contemplar salvaguardas externas de moderación.
- Riesgo de alucinaciones: al igual que otros LLM, puede inventar hechos o respuestas incorrectas, especialmente en contextos largos o temas de baja frecuencia.
- El método Genesis es una técnica propietaria del autor sin publicaciones revisadas por pares; su eficacia y estabilidad no están validadas académicamente.
- La longitud de contexto no está documentada en la información disponible; se recomienda verificar el comportamiento con ventanas largas antes de usarlo en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo deriva de Qwen3.6, cuyas versiones oficiales tienen condiciones específicas; se recomienda revisar la licencia del modelo base original.
- El soporte multilingüe se centra en inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- El formato GGUF limita el uso a runtimes compatibles; no se ofrecen pesos en safetensors para frameworks como Transformers directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-GGUF
- Modelo base sin censura: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de referencia: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantización: https://pastebin.com/hXhcMJn9
- Comunidad Discord del autor: https://discord.gg/SZ5vacTXYf
- Discusiones del proyecto (V12): https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF/discussions
