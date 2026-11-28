# Harsha001/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX es una cuantización en formato GGUF de un modelo de lenguaje y visión de 9B parámetros, derivado a su vez de un fine-tune de Qwen3.5-9B destilado a partir de respuestas de DeepSeek-V4-Pro y centrado en matemáticas y disciplinas STEM. La cadena de linaje es relevante para entender qué se está descargando: el modelo original lo publica Jackrong, la versión "decensurada" (sin entrenamiento de seguridad) la produce xtools-at mediante el proceso Heretic, y esta ficha corresponde a la cuantización ROCmFPX que publica el usuario Harsha001, orientada específicamente a hardware AMD (Strix Halo) y a Vulkan.

El modelo combina capacidades de razonamiento (bloque de pensamiento antes de responder), generación de texto y comprensión de imágenes (pipeline `image-text-to-text`), con soporte declarado para inglés, chino, coreano, japonés, español y ruso. Su interés actual reside en que empaqueta un modelo multimodal de 9B en archivos de 6,8 a 9,6 GB que caben en equipos de consumo y en APUs con memoria unificada, algo poco habitual en modelos visión-lenguaje con modo de razonamiento.

Conviene subrayar dos advertencias de peso antes de cualquier evaluación: el autor elimina explícitamente el comportamiento de rechazo, de modo que el modelo puede complacer peticiones dañinas, ilegales u ofensivas; y los archivos ROCmFPX requieren un fork específico de llama.cpp (HarshaVardhan3002/ROCmFPX, compilado a partir del 7 de noviembre de 2026), por lo que no cargan en llama.cpp estándar, LM Studio, Ollama ni versiones antiguas del fork. Además, el propio autor indica que los archivos no se han probado todavía en hardware AMD real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con cabecera de predicción multi-token (MTP) de una capa; fine-tune de Qwen3.5-9B |
| Parametros totales | 9.197.094.144 (9,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (ROCmFPX, 8 bits), Q6_K (ROCmFPX, 6 bits), Q4_0 (ROCmFP4-FAST para Strix Halo, atención y salida en 8 bits); codificador de visión en F16 |
| Idiomas soportados | Inglés, chino, coreano, japonés, español, ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con extensión propietaria ROCmFPX en los archivos cuantizados) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de 9,2B parámetros construido sobre Qwen3.5-9B. El linaje declarado es: Qwen3.5-9B (base, equipo Qwen) → fine-tune de Jackrong destilado a partir de respuestas de DeepSeek-V4-Pro y orientado a matemáticas y STEM → versión decensurada de xtools-at mediante Heretic, que elimina el comportamiento de rechazo → cuantización ROCmFPX de Harsha001. La destilación desde DeepSeek-V4-Pro es, por tanto, la fuente principal del comportamiento de razonamiento; no se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en ninguna de las etapas.

La innovación técnica más destacable de esta publicación no está en el modelo sino en la cuantización: los archivos ROCmFPX se miden contra un BF16 de referencia (perplejidad 7,13) con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en inglés. El Q8_0 ROCmFPX obtiene una divergencia KL de 0,00018 y un 99,3% de coincidencia en el token superior, superando al Q8_0 estándar (0,00026 y 99,2%) con un archivo más pequeño (9,6 GB frente a 9,9 GB). El Q6_K ROCmFPX queda prácticamente empatado con el Q6_K estándar (0,0020 frente a 0,0019), y el Q4_0 para Strix Halo no tiene métricas publicadas todavía. Los archivos conservan la cabecera MTP de una capa, que el autor no ha probado.

## Capacidades

- Generación de texto con modo de razonamiento: produce un bloque de pensamiento antes de la respuesta final, verificado en las pruebas del autor (respuestas correctas a preguntas de cultura general y aritmética tras el bloque de pensamiento).
- Comprensión de imágenes: pipeline `image-text-to-text` con codificador de visión separado en F16 (`mmproj-...-F16.gguf`, 0,9 GB); el autor verificó la descripción correcta de una figura de zorro y de un casco de bicicleta.
- Razonamiento matemático y STEM: el fine-tune original está específicamente orientado a matemáticas y disciplinas científicas, aunque no se han publicado benchmarks en esta ficha.
- Multilingüismo declarado en seis idiomas (inglés, chino, coreano, japonés, español y ruso), sin datos de evaluación por idioma.
- Comportamiento sin rechazo: 0 rechazos en 10 peticiones que un modelo con entrenamiento de seguridad rechazaría y 0 en 8 preguntas inocuas que suenan arriesgadas, tanto en los archivos cuantizados como en el BF16 de origen.
- No se dispone de información sobre soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso más allá del bloque de pensamiento.

## Casos de uso

- Procesamiento de documentos técnicos con imágenes: el modelo puede recibir páginas escaneadas o capturas de diagramas junto con el texto y generar explicaciones o resúmenes combinando ambas modalidades, gracias al codificador de visión integrado y al modo de razonamiento.
- Tutoría de matemáticas y ciencias: el fine-tune está destilado de DeepSeek-V4-Pro con foco STEM, y el bloque de pensamiento permite mostrar el desarrollo del razonamiento antes del resultado, útil en entornos educativos.
- Asistente local en equipos con APU AMD Strix Halo: el archivo Q4_0 ROCmFP4-FAST (6,8 GB) está diseñado para ejecutarse en una máquina Strix Halo con memoria unificada, lo que permite desplegar un modelo visión-lenguaje de 9B sin GPU dedicada.
- Investigación sobre alineación y seguridad: al ser una versión abliterada con métricas de rechazo documentadas, sirve como referencia para estudiar cómo la eliminación del entrenamiento de seguridad afecta al comportamiento, comparándola con el modelo base.
- Evaluación comparativa de cuantizaciones: los archivos incluyen métricas de divergencia KL frente a BF16 medibles con llama.cpp, lo que permite reproducir y comparar el impacto de la cuantización ROCmFPX frente a los formatos estándar en un mismo modelo.
- Generación de texto multilingüe en seis idiomas: para aplicaciones de redacción o traducción asistida en inglés, chino, coreano, japonés, español y ruso, siempre que se añada una capa de moderación propia.
- Prototipado de pipelines visión-lenguaje en local: la separación entre pesos cuantizados y codificador de visión en F16 facilita montar demos de image-text-to-text en hardware de consumo, con la salvedad de que requiere el fork ROCmFPX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor remite a la model card del modelo original para los benchmarks STEM y advierte que sus mediciones de KL son sobre texto general en inglés y no dicen nada directo sobre ellos.

Las únicas métricas publicadas son de fidelidad de cuantización:

| Archivo | Tamano | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|
| Q8_0 ROCmFPX | 9,6 GB | 0,00018 | 99,3% |
| Q6_K ROCmFPX | 7,6 GB | 0,0020 | 97,7% |
| Q4_0 ROCmFP4-FAST (Strix) | 6,8 GB | No medida | No medida |
| Q8_0 estándar (referencia) | 9,9 GB | 0,00026 | 99,2% |
| Q6_K estándar (referencia) | 7,6 GB | 0,0019 | 97,8% |
| Q4_K_M estándar (referencia) | 5,8 GB | 0,014 | 94,4% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 7 y 10 GB para los pesos cuantizados (6,8 GB el Q4_0, 7,6 GB el Q6_K, 9,6 GB el Q8_0), más 0,9 GB del codificador de visión en F16 y el espacio de contexto y caché KV, cuyo tamaño depende de la longitud de contexto (no publicada).
- GPU recomendadas: el autor no especifica modelos concretos; las mediciones de KL se hicieron en una NVIDIA GB10, pero los archivos ROCmFPX están pensados para kernels AMD y para la APU Strix Halo con memoria unificada de 128 GB.
- Cabe en GPU de consumo: sí, en principio, dado el tamaño de los archivos; el autor no confirma modelos concretos de RTX ni de otras gamas.
- Opciones de despliegue: exclusivamente el fork HarshaVardhan3002/ROCmFPX (build del 7 de noviembre de 2026 o posterior). llama.cpp estándar, LM Studio, Ollama y builds antiguas del fork no cargan estos archivos.
- Latencia y throughput: no disponibles. El autor indica que los archivos no se han probado aún en hardware AMD y pide a la comunidad que reporte velocidad y calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ROCmFPX) | 9,2B | No disponible | Texto + visión | Apache-2.0 | GGUF ROCmFPX, requiere fork |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,2B | No disponible | Texto + visión | Apache-2.0 | Pesos originales sin cuantizar |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,2B | No disponible | Texto + visión | Apache-2.0 | Modelo original con entrenamiento de seguridad |
| Qwen3.5-9B (base) | 9B | No disponible | Texto (visión según variante) | No disponible en esta ficha | Pesos oficiales del equipo Qwen |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la única comparación cuantitativa publicada es la divergencia KL de las cuantizaciones frente al BF16.

## Limitaciones y advertencias

- El entrenamiento de seguridad ha sido eliminado: el modelo puede cumplir peticiones dañinas, ilegales u ofensivas. No debe exponerse a usuarios finales sin capas propias de moderación y seguridad.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de veracidad ni de tasa de alucinación publicadas.
- Los archivos no se han probado en hardware AMD; las métricas de velocidad y calidad en el hardware objetivo están pendientes de confirmación por la comunidad.
- Dependencia de un fork no oficial: sin la build concreta de ROCmFPX, los archivos no cargan en las herramientas estándar, lo que complica el despliegue en producción y la reproducibilidad.
- Longitud de contexto no disponible, lo que impide planificar aplicaciones con ventanas largas.
- Idiomas declarados sin evaluación: no hay datos de calidad por idioma, y el rendimiento en español, coreano, japonés o ruso no está verificado.
- La cabecera MTP de una capa está incluida pero no probada, por lo que no debe asumirse que aporte aceleración.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad legal por el contenido generado recae en quien despliega el modelo.
- Las métricas de KL se midieron sobre texto general en inglés y no reflejan el comportamiento en matemáticas ni en razonamiento, que es el foco del fine-tune original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-ROCmFPX
- Modelo base decensurado: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Fork ROCmFPX necesario para cargar los archivos: https://github.com/HarshaVardhan3002/ROCmFPX
- Modelo destacado del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
