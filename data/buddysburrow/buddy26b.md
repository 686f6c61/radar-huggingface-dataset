# buddysburrow/buddy26b

## Resumen

Buddy26b es una distribución cuantizada y troceada del modelo instructivo google/gemma-4-26B-A4B-it, publicada por Buddysburrow para alimentar la aplicación iOS "Buddy: Your AI Friend", que ejecuta la inferencia íntegramente en el teléfono. El autor no entrena un modelo nuevo: parte de los pesos de Gemma 4 26B-A4B ya ajustados a instrucciones y aplica la cuantización UD-IQ2_M de Unsloth, reorganizando el resultado para que los expertos MoE puedan leerse desde el almacenamiento flash del dispositivo en lugar de residir permanentemente en memoria.

La particularidad del artefacto es su estructura dividida en cuatro ficheros: un mapa de particiones (`buddy26b.json`), los pesos residentes en 5 bits (1,78 GB), los expertos en 8,27 GB que se cargan bajo demanda desde flash y un proyector de visión Q8_0 (0,81 GB) que habilita entrada multimodal. El repositorio ocupa 10,9 GB en total y declara licencia Apache 2.0.

Es relevante ahora porque demuestra un patrón de despliegue viable para modelos MoE grandes en hardware móvil: en lugar de comprimir agresivamente todo el modelo, se separa la parte siempre activa de los expertos y se explota el almacenamiento persistente como memoria secundaria. El dato de parámetros totales reportado en safetensors (572.794.416) no es coherente con el nombre "26B" ni con el tamaño del repositorio, por lo que debe tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de google/gemma-4-26B-A4B-it |
| Parámetros totales | No disponible de forma fiable: el nombre indica 26B, pero safetensors reporta 572.794.416 (dato inconsistente) |
| Parámetros activos | No disponible (el sufijo A4B del modelo base sugiere ~4B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | UD-IQ2_M (Unsloth) para el conjunto; pesos residentes en 5 bits; proyector de visión en Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF troceado (`buddy26b.resident.gguf`, `buddy26b.experts`, `buddy26b-eyes.gguf`) más manifiesto `buddy26b.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base google/gemma-4-26B-A4B-it: un transformer con mezcla de expertos y ajuste a instrucciones, del que este repositorio no documenta detalles adicionales sobre número de capas, dimensión oculta, número de expertos ni estrategia de enrutamiento. Tampoco se especifican los datos de entrenamiento originales (volumen de tokens, composición del corpus, uso de RLHF o DPO), más allá de que se trata de la variante "it" (instruction-tuned).

La innovación técnica de esta publicación no está en el entrenamiento sino en el empaquetado para inferencia en dispositivo. El autor aplica la cuantización UD-IQ2_M de Unsloth y después divide el modelo en dos bloques: los pesos que se usan siempre, cuantizados a 5 bits (1,78 GB), y los expertos MoE (8,27 GB), que se leen desde el almacenamiento flash a medida que el enrutador los solicita. Un fichero JSON actúa como mapa de qué experto reside en qué posición. Se añade además un proyector visual independiente en Q8_0 (0,81 GB) procedente del mmproj de Gemma 4 26B-A4B de ggml-org, lo que confirma soporte de entrada de imagen.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del ajuste a instrucciones de Gemma 4 26B-A4B.
- Procesamiento de imágenes mediante el proyector de visión incluido (`buddy26b-eyes.gguf`), lo que permite entrada multimodal.
- Ejecución totalmente local en dispositivo iOS, sin dependencia de servidores externos.
- Carga selectiva de expertos desde flash, que reduce el consumo de memoria residente frente a cargar el modelo completo.
- Capacidades de código, matemáticas y tool calling: no documentadas explícitamente en la información disponible, aunque plausibles por herencia del modelo base.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en iOS: la aplicación integra el modelo directamente en el teléfono, de modo que las conversaciones no salen del dispositivo y no requieren conectividad, lo que resulta adecuado para un asistente personal con requisitos de privacidad.
- Inferencia MoE con memoria limitada: el esquema de expertos en flash sirve como referencia para desplegar modelos MoE en dispositivos con RAM restringida, manteniendo solo los pesos residentes en memoria y paginando los expertos bajo demanda.
- Consultas con imagen: gracias al proyector Q8_0, la aplicación puede responder a preguntas sobre fotos tomadas con la cámara o almacenadas en el carrete, útil en escenarios de accesibilidad o descripción de contenido.
- Prototipado de aplicaciones on-device: los desarrolladores pueden evaluar el rendimiento real de un MoE cuantizado a IQ2_M en hardware móvil antes de comprometerse con un modelo mayor.
- Distribución de modelos troceados: el formato con manifiesto JSON y ficheros separados es un patrón reutilizable para publicar modelos que exceden el límite de tamaño de un único fichero o que necesitan carga incremental.
- Investigación sobre cuantización extrema: el uso de UD-IQ2_M con residentes en 5 bits permite medir la degradación de calidad de un MoE a ~2 bits efectivos en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos residentes ocupan 1,78 GB y el proyector de visión 0,81 GB; los expertos (8,27 GB) se leen desde flash, por lo que el pico de memoria depende de cuántos expertos se mantengan en caché simultáneamente.
- Destino principal: iPhone con suficiente RAM y almacenamiento libre para los 10,9 GB del repositorio; no se especifican modelos concretos de dispositivo.
- GPU de escritorio: no se documentan requisitos para A100, H100 ni RTX 4090; el artefacto está pensado para inferencia móvil.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el formato GGUF troceado con manifiesto propio sugiere un runtime a medida integrado en la app; no se confirma compatibilidad directa con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| buddysburrow/buddy26b | 26B (MoE, A4B) según nombre; cifra safetensors inconsistente | No disponible | GGUF troceado con expertos en flash | Apache 2.0 | On-device iOS con paginación de expertos |
| google/gemma-4-26B-A4B-it | 26B (MoE, ~4B activos) | No disponible | Safetensors | Apache 2.0 | Modelo base instructivo multimodal |
| unsloth/gemma-4-26B-A4B-it-GGUF | 26B (MoE) | No disponible | GGUF (incluye UD-IQ2_M) | Apache 2.0 | Cuantizaciones estándar para llama.cpp |
| buddysburrow/buddy-4b | ~4B | No disponible | GGUF | No disponible | Variante ligera del mismo autor para la app Buddy |

## Limitaciones y advertencias

- La cifra de parámetros totales reportada en safetensors (572.794.416) contradice el nombre del modelo y el tamaño del repositorio; conviene verificar los pesos antes de usarlos en producción.
- La cuantización UD-IQ2_M es agresiva y puede degradar la calidad respecto al modelo base en tareas de razonamiento complejo, código y matemáticas.
- El formato troceado con manifiesto JSON y expertos en fichero aparte es específico de esta publicación y probablemente requiere el runtime de la app; no es un GGUF estándar cargable sin más.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni evaluación de seguridad del ajuste.
- No se especifican los idiomas soportados ni el contexto máximo, lo que impide planificar su uso en aplicaciones multilingües o de contexto largo.
- Aunque la licencia declarada es Apache 2.0, la model card enlaza a la licencia de Gemma 4 de Google; conviene revisar los términos aplicables al uso comercial y a la redistribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/buddysburrow/buddy26b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantización de referencia de Unsloth: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Variante ligera del mismo autor: https://huggingface.co/buddysburrow/buddy-4b
- Otra variante del mismo autor: https://huggingface.co/buddysburrow/buddy-gemma4
