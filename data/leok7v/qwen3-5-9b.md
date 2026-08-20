# leok7v/Qwen3.5-9B

## Resumen

Qwen3.5-9B es un modelo de lenguaje multimodal desarrollado por Qwen (Alibaba), con arquitectura híbrida que combina bloques de atención lineal Gated DeltaNet con bloques de atención completa, en proporción tres a uno. Esta cuantización 2-bit GGUF, creada por leok7v, empaqueta el modelo completo —pesos, tokenizador, plantilla de chat, torre de visión y tarjeta de muestreo— en un único archivo de 4,13 GiB, diseñado para ejecutarse íntegramente en dispositivo sin necesidad de servidores externos. El modelo base soporta una ventana de contexto nativa de 262.144 tokens e incluye un encoder de visión de 27 bloques, lo que permite procesar imágenes además de texto.

La relevancia de esta versión cuantizada radica en su capacidad para desplegar un modelo de 9B con visión y razonamiento en hardware muy limitado, gracias a una cuantización agresiva de 2 bits por peso basada en un codebook E8 lattice. Sin embargo, este formato utiliza un bloque GGUF no estándar que no es legible por llama.cpp, Ollama ni LM Studio, por lo que requiere un runtime específico del autor. La cuantización degrada notablemente la precisión en tareas de aritmética y razonamiento multi-paso, por lo que sus salidas deben tratarse como borradores a verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + atención completa, 32 capas (3:1) + 1 capa MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 2-bit (bloque personalizado E8 lattice), con componentes F16, BF16, Q4_0 y F32 |
| Idiomas soportados | Inglés y los idiomas del modelo base (no especificados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (bloque 2-bit no estándar, incompatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso híbrido cuyas capas alternan tres bloques de atención lineal Gated DeltaNet por cada bloque de atención completa. Los bloques lineales mantienen un estado recurrente de tamaño fijo (128 dimensiones, 16 grupos, tamaño interno 4096) en lugar de una caché de clave-valor creciente, lo que mantiene el uso de memoria plano a medida que crece el contexto. Los bloques de atención periódica preservan la recuperación exacta de información a larga distancia. El modelo incluye un encoder de visión de 27 bloques (ancho 1152, resolución 768 píxeles, parche 16) y una capa de predicción multi-token (MTP) que puede usarse como borrador para decodificación especulativa.

La cuantización 2-bit de leok7v no añade entrenamiento ni ajuste; es una conversión numérica del checkpoint original. Cada grupo de ocho pesos se proyecta al punto más cercano de un codebook E8 lattice y se almacena como un índice de 16 bits, resultando en exactamente dos bits por peso. El archivo GGUF incluye el tokenizador, la plantilla de chat, la torre de visión y la tarjeta de muestreo embebidos, de modo que el runtime no necesita archivos adicionales ni llamadas externas. Los parámetros de muestreo recomendados viajan dentro del archivo: temperatura 1.0, top_p 0.95, top_k 20 y presence_penalty 1.5 en modo thinking; temperatura 0.7, top_p 0.80, top_k 20 y presence_penalty 1.5 en modo instruct.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base, aunque con degradación esperada por la cuantización 2-bit.
- Procesamiento de imágenes: el encoder de visión de 27 bloques permite describir y analizar imágenes directamente desde este archivo.
- Soporte de tool calling y function calling: la plantilla de chat documenta el formato de llamada a herramientas.
- Modo thinking y modo instruct: la plantilla soporta `reasoning_effort` con niveles `low` y `medium` que reducen el consumo de tokens por turno.
- Decodificación especulativa: la capa MTP puede usarse como borrador en runtimes que la soporten; los que no, la ignoran.
- Contexto largo de hasta 262.144 tokens, con memoria plana gracias a la atención lineal.
- Multilingüe: inglés y los idiomas del modelo base (no detallados en la model card).

## Casos de uso

- Chat en dispositivo sin conexión: el modelo puede gestionar conversaciones multi-turno con contexto largo (262K tokens) sin enviar datos a ningún servidor, adecuado para entornos con requisitos estrictos de privacidad o sin conectividad.
- Resumen de documentos extensos: su ventana de 262K tokens permite procesar informes, contratos o libros completos en una sola pasada, generando resúmenes estructurados.
- Descripción de imágenes para accesibilidad: el encoder de visión integrado permite generar descripciones de imágenes en aplicaciones de asistencia a personas con discapacidad visual, funcionando offline.
- Asistente de codificación con tool calling: puede integrarse en entornos de desarrollo locales para autocompletar, depurar o generar código, invocando herramientas externas mediante function calling, sin depender de la nube.
- Razonamiento multi-paso en análisis de datos: el modo thinking permite descomponer problemas complejos en pasos intermedios, útil para tareas de análisis financiero o científico, aunque los resultados aritméticos deben verificarse.
- Prototipado en hardware edge: su tamaño reducido (4,13 GiB) permite ejecutarlo en dispositivos como Jetson Orin o GPUs de consumo con 6-8 GB de VRAM, facilitando el desarrollo de aplicaciones de visión y lenguaje en el borde.
- Procesamiento de documentos mixtos texto-imagen: puede extraer información de facturas, formularios o capturas de pantalla combinando comprensión visual y textual en un solo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización 2-bit en la información disponible. El modelo base Qwen3.5-9B, según fuentes web, supera a OpenAI gpt-oss-120b en GPQA Diamond, MMLU-Pro y MMMLU, aunque no se proporcionan cifras numéricas en los resultados de búsqueda. La model card del autor advierte que la cuantización 2-bit degrada la precisión, especialmente en aritmética y razonamiento multi-paso, por lo que el rendimiento real de este archivo será inferior al del modelo base. Se recomienda evaluar el modelo en la tarea concreta antes de usarlo en producción.

## Requisitos de hardware

- El archivo GGUF pesa 4,13 GiB, por lo que cabe en GPUs de consumo con 6-8 GB de VRAM, como RTX 3060, RTX 4060 o RTX 2070.
- En CPU, podría ejecutarse con 8-16 GB de RAM, aunque la latencia será alta.
- Se requiere un runtime compatible con el bloque 2-bit personalizado (E8 lattice); llama.cpp, Ollama y LM Studio no pueden leer este archivo. El autor menciona un "companion on-device runtime" sin especificar nombre.
- Para el modelo base sin cuantizar, existen despliegues con vLLM, TGI y LM Studio, y Jetson AI Lab ofrece checkpoints W4A16 para Jetson Orin y NVFP4 para Jetson Thor.
- La latencia y el throughput no están documentados para esta cuantización; el modelo base muestra un rendimiento de velocidad bajo (percentil 10) según Benchable, lo que sugiere tiempos de respuesta largos.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otras cuantizaciones o modelos de tamaño similar. El modelo base Qwen3.5-9B compite en benchmarks con modelos mucho mayores como gpt-oss-120b, pero esta cuantización 2-bit no es directamente comparable debido a su formato propietario y a la degradación esperada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,65B | 262K | Apache 2.0 | safetensors |
| Qwen3.5-9B (2-bit GGUF) | 9,65B | 262K | Apache 2.0 | GGUF no estándar |
| Qwen3-8B (base) | 8B | 32K | Apache 2.0 | safetensors |
| Llama 3.2 11B (vision) | 11B | 128K | Llama 3.2 | safetensors |

La comparativa con Qwen3-8B y Llama 3.2 11B se basa en conocimiento general de sus especificaciones, no en datos de rendimiento de esta cuantización.

## Limitaciones y advertencias

- La cuantización 2-bit es extremadamente agresiva: las salidas no coincidirán token a token con el modelo base, y la degradación es mayor en tareas donde el modelo ya era incierto. Los errores aritméticos y en derivaciones largas son frecuentes.
- El formato GGUF no es estándar: stock llama.cpp no puede leerlo, por lo que solo funciona con el runtime específico del autor. No es compatible con Ollama, LM Studio ni vLLM.
- El modelo no añade alineación, safety tuning ni filtrado propio; hereda los sesgos y modos de fallo del modelo base.
- No es adecuado para decisiones legales, médicas, financieras o de seguridad, ni para decisiones automatizadas de alto riesgo sin revisión humana.
- Los idiomas soportados se limitan al inglés y a los del modelo base, que no se detallan en la model card.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/leok7v/Qwen3.5-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Artículo de XDA Developers sobre benchmarks: https://www.xda-developers.com/qwen-3-5-9b-tops-ai-benchmarks-not-how-pick-model/
- Jetson AI Lab (Qwen3.5 9B): https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- LM Studio (Qwen3.5-9B): https://lmstudio.ai/models/qwen/qwen3.5-9b
- Benchable (Qwen3.5-9B): https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- ValorGPT (Qwen3.5-9B): https://www.valorgpt.com/models/qwen-qwen3.5-9b
