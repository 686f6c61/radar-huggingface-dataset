# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF es un modelo de lenguaje multimodal (texto e imagen) de arquitectura MoE, desarrollado por LuffyTheFox como parte de la serie Genesis. Se basa en el modelo sin censura HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y aplica un post-procesado denominado Genesis, que repara el ruido acumulado en los tensores mediante técnicas estadísticas (distribución de Marchenko-Pastur y SVD) sin reentrenar el modelo. Además, incorpora datos transferidos de un finetune Hermes para mejorar sus capacidades de agente y function calling.

El modelo tiene 35.000 millones de parámetros totales con 3.000 millones activos por token (A3B), lo que lo hace viable en hardware de consumo con cuantización GGUF. Es un modelo sin censura (0/465 rechazos según el autor), con soporte de visión, tool calling y modo de razonamiento, y se distribuye bajo licencia Apache 2.0. Su popularidad es notable: más de un millón de descargas y 579 likes en HuggingFace, lo que refleja el interés de la comunidad por modelos locales sin restricciones de contenido.

La relevancia de este modelo radica en su enfoque poco convencional: en lugar de un entrenamiento o fine-tuning tradicional, el autor aplica una "cirugía numérica" sobre los pesos para reducir el ruido de entrenamiento, lo que promete mayor estabilidad y menor alucinación. Aunque el método no está validado académicamente, la serie ha acumulado una base de usuarios que reportan mejoras subjetivas en calidad de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet y 256 expertos (8 activos + 1 compartido por token), según documentación de la serie Genesis |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B, A3B) |
| Longitud de contexto | no disponible (no especificada en la documentación del autor) |
| Tipos de cuantizacion | GGUF (varias, incluida la variante denominada "APEX" por el autor) |
| Idiomas soportados | inglés, chino y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se ofrecen safetensors en este repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un MoE híbrido que combina atención con Gated DeltaNet, un mecanismo de estado recurrente para el manejo de contexto largo. Según la documentación de la serie, el modelo contiene 256 expertos, de los cuales 8 son enrutados por token más un experto compartido, lo que explica la relación 35B totales / 3B activos.

El proceso de creación no es un entrenamiento convencional. El autor parte del modelo base sin censura de HauhauCS y aplica el algoritmo Genesis, que consta de tres etapas: reparación del equilibrio entre cabezas en los tensores `ssm_conv1d` (relacionados con la memoria de contexto largo), sustitución de bloques cero en tensores dañados mediante selección de bloques óptimos, y reducción de ruido de entrenamiento mediante SVD basada en la distribución de Marchenko-Pastur, preservando el 99 % de la señal y el gradiente aprendido. Además, se transfirieron alrededor de 2000 bloques de dos tensores expertos FFN desde el finetune Hermes de DJLougen, que fue entrenado sobre el dataset NousResearch/hermes-function-calling-v1, para dotar al modelo de capacidades de agente.

El resultado es un modelo que no ha sido fine-tuneado con datos nuevos, sino reparado a nivel de tensores, lo que el autor describe como "cirugía numérica sobre los bytes del archivo". No se especifican datos de entrenamiento adicionales, número de tokens ni composición del dataset, más allá del dataset de function calling mencionado.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) activable, recomendado para tareas de programación.
- Procesamiento multimodal de imágenes y texto (pipeline `image-text-to-text`), capaz de describir y razonar sobre entradas visuales.
- Tool calling y function calling, gracias a la transferencia del finetune Hermes entrenado sobre hermes-function-calling-v1.
- Soporte de agentes y razonamiento multi-paso, con identidades de sistema alternativas ("agent" o "assistant") proporcionadas por el autor.
- Modelo sin censura: el autor reporta 0/465 rechazos en el modelo base, lo que implica ausencia de filtros de contenido en la generación.
- Multilingüe, con soporte principal de inglés y chino, y rendimiento variable en otros idiomas.
- Capacidad de generación de imágenes SVG (el autor muestra un ejemplo de un pelícano en bicicleta), aunque esto depende del prompt y de la configuración.

## Casos de uso

- Asistentes conversacionales locales sin restricciones de contenido: el modelo puede desplegarse en el equipo del usuario mediante llama.cpp u Ollama, ofreciendo conversaciones multi-turno sin filtros de moderación. Es adecuado para entornos donde se requiere libertad de expresión, como juegos de rol o escritura creativa, siempre con las advertencias legales correspondientes.
- Agentes autónomos con function calling: gracias al finetune Hermes, el modelo puede integrarse en pipelines que llaman herramientas externas (APIs, bases de datos, ejecución de scripts) para automatizar tareas como la gestión de correos, la reserva de citas o la consulta de información en tiempo real.
- Análisis de imágenes y documentos visuales: al ser multimodal, puede extraer información de capturas de pantalla, diagramas, fotografías o documentos escaneados, generando descripciones o resúmenes en texto. Útil para herramientas de accesibilidad o revisión de contenido visual.
- Generación de código asistida: con el modo de pensamiento activado y los parámetros recomendados (temperatura 0.6, top_p 1.0, top_k 20), el modelo puede razonar sobre problemas de programación, generar fragmentos de código y explicar soluciones. Puede integrarse en editores o entornos de desarrollo con interfaces tipo chat.
- Prototipado rápido de aplicaciones con LLM en local: al ser GGUF y caber en GPUs de consumo con cuantización, es una opción para desarrolladores que necesitan probar funcionalidades de agente o multimodalidad sin depender de APIs externas ni enviar datos a la nube.
- Investigación en comportamiento de modelos sin alineación: al ser un modelo sin censura y con un método de post-procesado no convencional, resulta interesante para estudiar diferencias de comportamiento frente a modelos alineados, aunque debe usarse en entornos controlados y con fines académicos.
- Creación de contenido creativo (historias, guiones, diálogos): al carecer de filtros de contenido, puede generar narrativas adultas o temas tabú que otros modelos rechazan, siendo útil para escritores que necesitan explorar territorios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas estándar como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. La única afirmación de rendimiento es la ausencia de rechazos en el modelo base y las mejoras subjetivas reportadas por usuarios en la comunidad. No es posible evaluar objetivamente su rendimiento frente a alternativas sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: los pesos GGUF en cuantización Q4_K_M ocupan aproximadamente 20 GB, mientras que en Q8 rondan los 35 GB. Con el offload de 40 capas MoE a CPU recomendado por el autor, la VRAM necesaria puede reducirse a 12-16 GB, a costa de mayor uso de memoria RAM y menor velocidad.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB VRAM) permiten descargar la mayor parte del modelo en GPU. GPUs de datacenter como A100 o H100 ofrecen mayor throughput para despliegues concurrentes. GPUs de 8-12 GB (RTX 3080, RTX 4070) pueden funcionar con offload agresivo a CPU.
- Compatibilidad con hardware de consumo: sí, con cuantización GGUF y offload parcial a CPU es viable en equipos con 16 GB de VRAM y 32 GB de RAM. El autor recomienda forzar 40 capas MoE a CPU y fijar el número de expertos activos en 8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y koboldcpp son compatibles con formato GGUF. vLLM no soporta GGUF de forma nativa, por lo que no es una opción directa.
- Latencia y throughput: no disponibles. Dependen de la cuantización, del número de expertos activos y del equilibrio GPU/CPU. Con 3B activos, la generación puede ser fluida en GPUs modernas, pero el offload a CPU introduce latencia adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Características |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12 (este) | 35B | 3B | no disponible | Apache 2.0 | GGUF | Multimodal, uncensored, agente Hermes, Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | 35B | 3B | no disponible | Apache 2.0 | no disponible | Uncensored, sin post-procesado Genesis |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF (finetune Hermes) | 35B | 3B | no disponible | no disponible | GGUF | Finetune Hermes para agentes, sin Genesis |

No se dispone de benchmarks para comparar el rendimiento real entre estos modelos. La comparativa es estructural: este modelo combina la base uncensored con la transferencia del finetune Hermes y el post-procesado Genesis, lo que lo diferencia de sus predecesores. No hay datos de contexto máximo confirmados para ninguno de los tres.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, violento, sexual o peligroso. Su uso en producción requiere políticas de moderación externas y responsabilidad legal del desplegador.
- Método no validado: el algoritmo Genesis es una aproximación del autor sin revisión académica ni evaluación independiente. Las afirmaciones sobre reducción de ruido y mejora de estabilidad no están contrastadas.
- Riesgo de alucinación: aunque el autor afirma que el post-procesado reduce las alucinaciones, no hay evidencia objetiva. En tareas de razonamiento o factualidad, el modelo puede inventar información con confianza.
- Idiomas limitados: el soporte principal es inglés y chino; el rendimiento en otros idiomas, incluido el español, no está garantizado y puede ser inferior.
- Configuración sensible: el autor recomienda ajustes específicos (chat template, K/V cache en F16, offload de 40 capas MoE, 8 expertos activos) para un funcionamiento óptimo. Sin estos ajustes, la calidad puede degradarse notablemente.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado es responsabilidad del usuario. No hay garantías de seguridad ni soporte oficial.
- Reproducibilidad: el proceso Genesis no está documentado de forma completa y reproducible; los scripts de cuantización se ofrecen en un enlace externo (pastebin), lo que añade riesgo de dependencia de terceros.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-GGUF
- Modelo base uncensored: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de DJLougen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Chat template recomendado (de la serie V7): https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- System prompt creativo con identidad "assistant" (serie V5): https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF/raw/main/System_Prompt_Creative.txt
- Script de cuantización con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Comunidad Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Enlace de donación al autor: https://web.tribute.tg/d/KIH
