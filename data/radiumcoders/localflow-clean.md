# Radiumcoders/localflow-clean

## Resumen

localflow-clean es un modelo de limpieza de dictado: recibe una transcripción en bruto (con muletillas, arranques falsos, autocorrecciones habladas y estructura dictada de viva voz) y devuelve el texto que el hablante quería escribir. Lo desarrolla Radiumcoders como componente del proyecto localflow, una herramienta de dictado local y privado para Handy, y está afinado a partir de Qwen3.5-0.8B mediante LoRA. Su función no es conversar ni razonar de forma general, sino ejecutar una tarea muy acotada de reescritura con latencias de milisegundos.

La innovación principal es la poda del vocabulario: el Qwen3.5 original maneja 248.000 tokens para decenas de idiomas, y en un modelo de 0,8B cada token es una fila de pesos en las capas de embedding y de salida. Al recortarlo a los 32.000 tokens que necesita el inglés (el texto inglés tokeniza exactamente igual que antes), el fichero pasa de 542 a 350 MB y la memoria en carga de ~810 a ~390 MB, con salidas idénticas. Además, las reglas de limpieza están incorporadas en los pesos tras un ajuste fino con ~4.600 pares de dictado/limpieza, de modo que basta una instrucción de una línea en lugar de los ~3.900 tokens de reglas y ejemplos que necesita un modelo general.

Es relevante ahora porque demuestra que una tarea de post-procesado lingüístico bien delimitada se puede resolver con 551 millones de parámetros en cuantización Q4_K_M, ocupando ~530 MB de VRAM y respondiendo en 56 ms para dictados cortos, frente a los 327 ms y ~4,3 GB de un modelo de 4B. El coste es la especialización: solo inglés, sin modo thinking y con un formato de prompt estricto heredado de la plantilla de chat de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen3.5-0.8B; ajuste fino LoRA (r 64, todas las capas lineales); vocabulario podado a 32k tokens en inglés |
| Parametros totales | 551.368.000 según los pesos safetensors reportados por HuggingFace (vocabulario podado); la model card describe el modelo como 0.8B |
| Longitud de contexto | no disponible (la model card no la especifica; el uso previsto son dictados cortos) |
| Tipos de cuantizacion | Q4_K_M en GGUF; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) únicamente; el vocabulario está podado a inglés |
| Licencia | Apache 2.0 (igual que el modelo base Qwen3.5) |
| Formato de pesos | GGUF (`localflow-clean-q4_k_m.gguf`, 350 MB); los metadatos de HuggingFace reportan además pesos safetensors |
| Modo thinking | desactivado explícitamente (bloque `<think>` vacío en el prompt) |
| Hash del fichero GGUF | SHA-256 `0fa7ba4e4a38b50067a2dbd6eb01ce2e0aa6db755afc4a216cffd27566eb3206` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only denso con tokenizador de 248.000 entradas. El ajuste se realizó con LoRA de rango 64 aplicado a todas las capas lineales, sobre un conjunto de aproximadamente 4.600 pares de dictado y su limpieza correspondiente. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; tampoco se detalla la receta de alineación más allá del ajuste supervisado implícito en los pares.

La intervención técnica más destacable es la poda del vocabulario a 32.000 tokens: como el texto en inglés tokeniza exactamente igual que con el tokenizador completo, las salidas no cambian, pero desaparecen 216.000 filas en las capas de embedding y de salida. Eso reduce el fichero de 542 a 350 MB y la memoria en carga de ~810 a ~390 MB. El resultado se distribuye en GGUF Q4_K_M y se ejecuta dentro del propio proceso de localflow mediante llama.cpp, con el modo thinking desactivado. El prompt esperado sigue la plantilla de chat de Qwen (`<|im_start|>system` / `user` / `assistant`), con una instrucción de sistema de una línea, un bloque opcional de vocabulario del hablante y un bloque opcional `<files>` con rutas.

## Capacidades

- Limpieza de dictado en inglés: elimina muletillas y arranques falsos del texto transcrito.
- Aplicación de autocorrecciones habladas, del tipo «at 5, no wait, at 6», resolviendo la corrección en el texto final.
- Conversión de estructura dictada oralmente en listas y encabezados.
- Respeto de grafías personalizadas mediante un bloque de vocabulario del hablante (por ejemplo, «Pine Script» cuando se ha dictado «Py script»).
- Transformación de nombres de fichero dictados en referencias `@file` (por ejemplo, `src/main.rs`).
- Ejecución local con llama.cpp en el mismo proceso de la aplicación, sin dependencias externas ni servicio remoto.
- Formato de prompt específico: plantilla de chat de Qwen, thinking desactivado, instrucción de sistema mínima.
- No se documentan tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni otras modalidades. El tag `conversational` de HuggingFace no implica uso como chatbot general.

## Casos de uso

- Dictado de escritorio en tiempo real: localflow descarga el modelo en el primer uso y lo ejecuta con llama.cpp para limpiar cada dictado antes de insertarlo en el campo de texto; los 56 ms en dictados de menos de 30 palabras permiten una experiencia prácticamente instantánea.
- Notas de voz y actas de reunión: transcripciones de 100+ palabras se limpian en 338 ms, de modo que se puede procesar un bloque completo al terminar de hablar y obtener párrafos, listas y encabezados a partir de la estructura dictada.
- Corrección de jerga técnica y nombres propios: el bloque de vocabulario permite fijar grafías exactas (nombres de producto, APIs, identificadores de código) y evitar que el transcriptor las deforme en la salida final.
- Integración con asistentes de código en CLI o IDE: al convertir nombres de fichero dictados en referencias `@file`, el texto limpiado se puede pasar directamente a un asistente que interprete esas referencias.
- Capa de post-procesado sobre un motor STT: cualquier pipeline con Whisper u otro transcriptor puede insertar este modelo como etapa de limpieza, ya que consume texto y devuelve texto con un contrato de prompt sencillo.
- Procesamiento por lotes de transcripciones: al ocupar ~530 MB de VRAM y cargar en ~0,1 s desde disco, se pueden encadenar limpiezas de muchos ficheros en una GPU modesta o incluso en CPU.
- Aplicaciones de dictado offline con requisitos de privacidad: al ejecutarse íntegramente en local y no requerir red, encaja en entornos donde el audio y el texto no pueden salir del dispositivo.
- Herramientas de accesibilidad: limpieza de entrada por voz para usuarios que dictan textos largos y necesitan una salida legible sin edición manual posterior.

## Benchmarks y rendimiento

Los datos proceden de las pruebas propias del autor en una RX 9070 XT (Vulkan), comparando contra `qwen3.5:4b` en Ollama con el prompt completo de reglas, ejemplos y una pasada de revisión. No son benchmarks estándar (MMLU, HumanEval, GSM8K); no se han publicado resultados de benchmarks académicos en la información disponible.

| Metrica | localflow-clean | qwen3.5:4b + review |
|---|---|---|
| Casos de prueba escritos de localflow (cases.txt) | 32/41 | 35/41 |
| Limpieza de menos de 30 palabras | 56 ms | 327 ms |
| Limpieza de 100+ palabras | 338 ms | 1.777 ms |
| Carga desde disco | ~0,1 s | ~2,5 s |
| Memoria de GPU en carga | ~530 MB | ~4,3 GB |
| Coincidencia exacta en 142 ejemplos reservados | 51% | 27% |

El propio autor advierte que los 142 ejemplos reservados proceden de la misma distribución que los datos de entrenamiento y se usaron para elegir el checkpoint, por lo que favorecen al modelo. Los puntos donde pierde frente al 4B son las correcciones situadas al fondo de una divagación larga y las frases repetidas («this is this is this is»).

## Requisitos de hardware

- VRAM estimada: ~530 MB de memoria de GPU con el modelo cargado en Q4_K_M (medido en RX 9070 XT); ~390 MB de memoria en carga según la poda de vocabulario.
- Fichero en disco: 350 MB (`localflow-clean-q4_k_m.gguf`); el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer con 1 GB o más de VRAM. La única probada y documentada es la RX 9070 XT mediante Vulkan; no se publican mediciones en A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer de gama baja y en iGPU; también es viable en CPU por el tamaño del modelo, aunque no se documentan cifras de throughput en CPU.
- Opciones de despliegue: llama.cpp, que es el runtime previsto e integrado en localflow. El formato GGUF es compatible con otros runners, pero la model card solo documenta llama.cpp; no se mencionan vLLM ni TGI.
- Latencia: 56 ms para dictados de menos de 30 palabras y 338 ms para 100+ palabras; carga desde disco ~0,1 s.
- Throughput (tokens por segundo): no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | cases.txt | Memoria en carga | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| localflow-clean | 551M (base 0.8B) | no disponible | 32/41 | ~530 MB GPU | Apache 2.0 | GGUF público en HuggingFace |
| Qwen3.5-0.8B (base) | 0.8B | no disponible | no disponible | no disponible | Apache 2.0, según la model card | HuggingFace |
| qwen3.5:4b + review (Ollama) | ~4B | no disponible | 35/41 | ~4,3 GB GPU | no disponible | Ollama |

Frente al modelo base, localflow-clean reduce el fichero de 542 a 350 MB y la memoria de ~810 a ~390 MB manteniendo salidas idénticas en inglés, a cambio de perder cualquier capacidad multilingüe. Frente al 4B con revisión, queda 3 casos por debajo en los tests escritos (32/41 frente a 35/41) pero es aproximadamente seis veces más rápido y usa un octavo de la memoria. No se dispone de datos para comparar con otras alternativas especializadas en limpieza de dictado.

## Limitaciones y advertencias

- Solo inglés: el vocabulario está podado a 32.000 tokens ingleses, por lo que cualquier texto en otro idioma degrada la salida o directamente no se puede representar con la tokenización prevista.
- Fallos documentados en correcciones al fondo de divagaciones largas y en frases repetidas, que el modelo puede no colapsar correctamente.
- No supera al 4B con revisión en los tests escritos del propio autor (32/41 frente a 35/41); la ventaja es de latencia y memoria, no de calidad máxima.
- El 51% de coincidencia exacta en 142 ejemplos reservados está sesgado a favor del modelo: misma distribución que el entrenamiento y selección de checkpoint sobre esos datos.
- Riesgo de reescritura excesiva o de alucinación de contenido no dictado: no se han publicado métricas de fidelidad semántica ni de tasa de inserción de texto espurio.
- Longitud de contexto no documentada; los dictados muy largos pueden exceder la ventana real del modelo.
- Requiere un formato de prompt estricto (plantilla de chat de Qwen, bloque de vocabulario y `<files>` opcionales, thinking desactivado); usarlo como chat genérico producirá resultados fuera de su dominio.
- No es un modelo conversacional ni de razonamiento: no hay soporte documentado de tool calling, agentes, visión ni audio.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar el aviso de licencia y los ficheros NOTICE correspondientes; el modelo base Qwen3.5 se distribuye bajo la misma licencia según la model card.
- Validación externa muy limitada: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y todos los resultados provienen del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Radiumcoders/localflow-clean
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo: https://huggingface.co/Radiumcoders/localflow-clean/blob/main/LICENSE
- Repositorio localflow en GitHub: https://github.com/radiumcoders/localflow
- README de localflow: https://github.com/radiumcoders/localflow/blob/master/README.md
- Sitio del proyecto localflow: https://localflow.radiumcoders.com
