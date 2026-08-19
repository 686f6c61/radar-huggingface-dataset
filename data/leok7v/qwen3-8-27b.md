# leok7v/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Se trata de un modelo híbrido que combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa, alcanzando un total de 27.781 millones de parámetros. Su arquitectura le permite mantener un uso de memoria constante a medida que crece el contexto, que llega hasta 262.144 tokens, e incorpora una torre de visión de 27 capas para procesar imágenes y vídeo de forma nativa.

El repositorio `leok7v/Qwen3.8-27B` contiene una cuantización GGUF de 2 bits de este modelo, diseñada para ejecutarse completamente en dispositivo (on-device). El autor, leok7v, ha empaquetado el tokenizador, la plantilla de chat, la tabla de merge y la torre de visión en un único archivo, de modo que no se requiere ningún recurso externo en tiempo de inferencia. Sin embargo, esta cuantización utiliza un tipo de bloque no estándar que no es compatible con llama.cpp, Ollama ni LM Studio; requiere un runtime específico que implemente este formato.

La relevancia actual de este modelo radica en su capacidad para ejecutar tareas de razonamiento, generación de código y comprensión multimodal en hardware local con requisitos de memoria reducidos, aunque con una degradación notable en precisión debido a la agresiva cuantización de 2 bits. Es una opción interesante para entornos offline o con privacidad estricta, siempre que se acepte la pérdida de fidelidad respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet (atención lineal) + 16 capas de atención completa, con torre de visión de 27 capas |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 262.144 tokens |
| Tipos de cuantizacion | 2-bit custom (344 tensores), Q4_0 (66 tensores), F16 (112 tensores), F32 (678 tensores) |
| Idiomas soportados | Inglés y los idiomas del modelo base (no especificados en la documentación) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF v3 (custom, no compatible con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con una arquitectura híbrida innovadora. De sus 64 capas, 48 son bloques de atención lineal Gated DeltaNet que mantienen un estado recurrente de tamaño fijo en lugar de una caché de clave-valor creciente, lo que mantiene el consumo de memoria constante a medida que crece la secuencia. Las 16 capas restantes son bloques de atención completa con grouped-query attention (24 cabezas de consulta, 4 de clave-valor), intercaladas cada tres capas lineales. Esta combinación permite un equilibrio entre eficiencia y capacidad de recuperación de información a largo plazo.

El modelo es nativamente multimodal: una torre de visión de 27 capas con anchura 1152 proyecta las características visuales a la dimensión oculta de 5120. Los embeddings de entrada y salida no están atados, por lo que existe una matriz de proyección de salida separada. El modo de pensamiento (thinking) está activado por defecto y puede desactivarse por petición; el esfuerzo de razonamiento es configurable mediante `reasoning_effort`, y el razonamiento de turnos anteriores puede conservarse con `preserve_thinking`.

En cuanto al entrenamiento, la información disponible no detalla la composición del dataset ni el número de tokens utilizados. El repositorio de cuantización solo contiene los pesos convertidos, sin datos de entrenamiento ni el checkpoint original. La cuantización fue realizada por leok7v, pero no se especifica el método exacto de calibración ni si se utilizaron datos de validación.

## Capacidades

- Generación de texto y razonamiento multi-turno con modo de pensamiento (thinking) activable y configurable en intensidad (`reasoning_effort`: low, medium, xhigh).
- Comprensión multimodal de imágenes y vídeo: la torre de visión está integrada en el archivo GGUF, permitiendo entrada visual sin componentes externos.
- Soporte de tool calling y formato de llamada a funciones documentado en la plantilla de chat.
- Capacidades de agente: el modelo base destaca en tareas agénticas de largo horizonte, con planificación autónoma y manejo de feedback del entorno.
- Generación de código y automatización de oficina: según la documentación del modelo base, rinde bien en tareas de programación y flujos de trabajo ofimáticos.
- Multilingüe: aunque la card indica "inglés y los idiomas del modelo base", no se enumeran los idiomas concretos; se asume cobertura amplia similar a otros modelos Qwen.
- Razonamiento matemático y lógico, con limitaciones conocidas en precisión aritmética debido a la cuantización de 2 bits.

## Casos de uso

- Asistente de chat offline en dispositivos con privacidad estricta: el modelo puede gestionar conversaciones multi-turno sin enviar datos a ningún servidor, gracias a que todos los componentes están embebidos en un único archivo. Adecuado para entornos sanitarios, jurídicos o gubernamentales donde los datos no pueden salir del dispositivo.
- Comprensión de documentos con imágenes: al aceptar entrada visual, puede resumir capturas de pantalla, diagramas o fotografías de documentos, útil para aplicaciones de archivado y extracción de información en local.
- Generación de código asistida en entornos sin conexión: el modelo base tiene buen rendimiento en tareas de programación; la versión cuantizada puede servir como autocompletado o generador de borradores en IDEs que se ejecuten en hardware modesto, siempre que los resultados se revisen.
- Automatización de tareas agénticas en entornos controlados: con soporte de tool calling y planificación multi-paso, puede orquestar flujos de trabajo simples (envío de correos, gestión de calendarios) en un entorno de ejecución local, aunque con supervisión humana.
- Análisis de vídeo en tiempo real o diferido: la torre de visión procesa secuencias de vídeo, permitiendo aplicaciones de vigilancia o análisis de contenido multimedia en dispositivos perimetrales con poca memoria.
- Prototipado rápido de aplicaciones multimodales: para desarrolladores que necesitan validar ideas de producto con un modelo de 27B en local antes de pasar a una cuantización de mayor fidelidad, esta versión ofrece una vía rápida de prueba con requisitos de VRAM reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización de 2 bits. Los datos disponibles en la documentación del modelo base indican los siguientes resultados, que corresponden al modelo en precisión completa y no son extrapolables a esta versión cuantizada:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

La card del repositorio advierte explícitamente que la cuantización de 2 bits degrada el rendimiento: los resultados no coinciden token a token con el modelo original, y los errores se acumulan en tareas de razonamiento multi-paso y aritmética. No se han proporcionado métricas comparativas para esta versión.

## Requisitos de hardware

- Tamaño del archivo: 9.35 GiB (10.0 GB en el repositorio). La VRAM necesaria para cargar los pesos en memoria es de aproximadamente 10 GB, más overhead de activaciones y caché, lo que sugiere un mínimo de 12-16 GB de VRAM para inferencia cómoda.
- GPU compatibles: tarjetas con 16 GB de VRAM como RTX 4080, RTX 4090, o GPUs profesionales como A100 (40 GB) pueden ejecutar el modelo. También podría caber en una RTX 4060 Ti de 16 GB, aunque con posibles limitaciones de velocidad.
- En CPU: dado el formato GGUF, podría ejecutarse en CPU con suficiente RAM (16-32 GB), pero el rendimiento sería bajo para tareas interactivas.
- No es compatible con llama.cpp, Ollama ni LM Studio debido al bloque de cuantización custom. Requiere un runtime específico que implemente el formato de 2 bits del autor; no se ha publicado un enlace a dicho runtime en la documentación.
- Latencia y throughput: no se han proporcionado datos medidos. Se espera que sea inferior al modelo en 4 bits, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con esta cuantización específica. Como referencia, el modelo base Qwen3.8-27B compite con otros modelos densos de ~27B como Qwen2.5-32B o Llama 3.1 8B (aunque este último es menor). Las diferencias clave son:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.8B | 262K | Apache 2.0 | safetensors |
| Qwen3.8-27B (2-bit GGUF) | 27.8B | 262K | Apache 2.0 | GGUF custom |
| Qwen2.5-32B (referencia) | 32.5B | 128K | Apache 2.0 | safetensors/GGUF |

La cuantización de 2 bits ofrece una ventaja en tamaño (10 GB frente a ~55 GB del safetensors en FP16), pero a costa de una pérdida de calidad significativa. No hay datos de benchmarks comparativos entre esta versión y otras cuantizaciones del mismo modelo.

## Limitaciones y advertencias

- La cuantización de 2 bits es extremadamente agresiva: los resultados no coinciden con el modelo original y la degradación es mayor en tareas donde el modelo ya era incierto. Se observan errores aritméticos, palabras omitidas o fusionadas, y errores acumulativos en derivaciones largas.
- El formato GGUF es no estándar: stock llama.cpp no puede leer el archivo. Requiere un runtime propietario o específico que no está enlazado en la documentación, lo que limita su portabilidad.
- No se ha añadido ningún alineamiento, ajuste de seguridad ni filtrado adicional: la cuantización hereda los sesgos y modos de fallo del modelo base sin mitigación.
- No debe utilizarse como base para decisiones legales, médicas, financieras o de seguridad sin revisión humana. Las salidas deben tratarse como borradores a verificar.
- La card recomienda parámetros de muestreo específicos (temperatura 1.0, top_p 0.95, top_k 20 en modo thinking; 0.7, 0.8, 20 en modo instruct), pero no se garantiza que estos parámetros compensen la pérdida de precisión.
- El idioma declarado es inglés; aunque el modelo base es multilingüe, no se especifican los idiomas cubiertos en esta versión.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leok7v/Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Reseña en Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
