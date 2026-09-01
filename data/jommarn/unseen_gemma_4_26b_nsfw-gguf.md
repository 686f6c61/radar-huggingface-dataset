# Jommarn/UNSEEN_Gemma_4_26B_NSFW-GGUF

## Resumen

UNSEEN Gemma-4-26B NSFW es un modelo de lenguaje multimodal (imagen y texto) derivado de `google/gemma-4-26B-A4B-it`, al que se le ha aplicado una técnica de "abliteration" para eliminar los mecanismos de rechazo y censura del modelo original. El resultado es un sistema capaz de describir imágenes y generar texto explícito sin restricciones de contenido, en inglés y tailandés. El autor, Jommarn, publica tanto los pesos completos en formato FP16/BF16 como cuantizaciones GGUF y de 4/8 bits para facilitar su ejecución en hardware de consumo.

El modelo mantiene las capacidades de visión del Gemma 4 original, proyectando características de imagen de alta resolución al espacio del LLM "abliterado", lo que permite descripciones detalladas de escenas explícitas. Con aproximadamente 25 200 millones de parámetros totales, su tamaño lo sitúa en un rango medio-alto, pero las cuantizaciones ofrecidas permiten ejecutarlo en GPUs con 16 GB de VRAM en 4 bits o incluso 8-10 GB en 2 bits. Está pensado para usuarios que necesitan un modelo sin filtros para generación de contenido adulto, ficción erótica o descripción de imágenes, y su popularidad (más de 9000 descargas y 44 likes) indica una demanda activa en este nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en google/gemma-4-26B-A4B-it, multimodal vision-language) |
| Parametros totales | 25 233 142 046 (~25,2 B) |
| Parametros activos | no disponible (el nombre A4B sugiere 4 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (IQ2_M, Q4_K_M, Q8_0), bitsandbytes 4-bit (NF4) y 8-bit (INT8) |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo base), GGUF (repo actual) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada, pero el modelo base es `google/gemma-4-26B-A4B-it`, un modelo multimodal de Google DeepMind que combina un codificador de vision con un LLM de 26 mil millones de parametros. El sufijo "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con 4 mil millones de parametros activos por token, aunque este dato no se confirma en la ficha. El proceso de entrenamiento consistio en una "abliteration quirurgica" sobre los pesos del modelo base, una tecnica que identifica y elimina las direcciones del espacio de activaciones responsables del comportamiento de rechazo y seguridad, manteniendo el resto de capacidades intactas.

No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO posteriores a la abliteracion. El autor indica que el modelo ha sido verificado para eludir completamente los guardarrailes de seguridad estandar, pero no ofrece detalles sobre la metodologia de evaluacion. La proyeccion vision-lenguaje se conserva intacta, lo que permite que el modelo describa con precision contenido visual explicito sin necesidad de ajustes adicionales.

## Capacidades

- Generacion de texto libre sin censura, incluyendo contenido explicito, NSFW y taboo.
- Descripcion detallada de imagenes (vision-language) con capacidad de narrar escenas completas, incluyendo aspectos visuales, emocionales y contextuales.
- Soporte bilingue completo en ingles y tailandes, incluyendo jerga callejera tailandesa ("raw Thai street slang").
- Capacidad de seguir instrucciones en formato conversacional multi-turno.
- No se menciona soporte de tool calling, function calling ni capacidades de agente.
- No se menciona modo "thinking" ni razonamiento avanzado; el modelo se centra en generacion descriptiva y narrativa.

## Casos de uso

- Generacion de ficcion erotica y relatos adultos: el modelo puede crear historias explicitas en ingles o tailandes con multiples turnos, manteniendo coherencia narrativa y estilo.
- Descripcion de imagenes para archivos personales o proyectos artisticos: dado su pipeline image-text-to-text, puede analizar ilustraciones o fotografias y producir descripciones detalladas sin filtros, util para catalogacion o curaduria de contenido.
- Creacion de dialogos y guiones para entretenimiento adulto: escritores pueden usar el modelo para generar conversaciones o escenas con personajes, aprovechando su capacidad de mantener contexto y estilo.
- Traduccion creativa de contenido explicito entre ingles y tailandes: el modelo puede traducir manteniendo matices y jerga, aunque su entrenamiento no esta optimizado para traduccion general.
- Asistente de escritura para novelas romanticas o eroticas: autores independientes pueden usarlo como herramienta de brainstorming para descripciones sensoriales y escenas intimas.
- Pruebas de robustez de sistemas de moderacion de contenido: investigadores pueden utilizar este modelo para evaluar la eficacia de filtros y clasificadores de contenido NSFW, al ser un generador sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Las unicas validaciones mostradas son ejemplos cualitativos de descripcion de imagenes (una en ingles y otra en tailandes) que demuestran la capacidad de generar texto explicito detallado, pero sin datos cuantitativos comparativos.

## Requisitos de hardware

- Cuantizacion 4-bit (NF4 / Q4_K_M): aproximadamente 16 GB de VRAM. Compatible con NVIDIA RTX 3090, RTX 4090, NVIDIA L4.
- Cuantizacion 8-bit (INT8 / Q8_0): aproximadamente 28 GB de VRAM. Requiere 2x RTX 3090/4090 o A100 40/80 GB.
- Cuantizacion 2-bit (IQ2_M): aproximadamente 8-10 GB de VRAM. Funciona en RTX 3060 12 GB, RTX 4060, Mac con 16 GB unificados.
- Despliegue mediante llama.cpp, Ollama o LM Studio para los pesos GGUF. Con Transformers + bitsandbytes para los safetensors cuantizados.
- No se proporcionan datos de latencia ni throughput. Se recomienda usar vLLM para servir el modelo en produccion si se dispone de VRAM suficiente, aunque no esta oficialmente documentado.

## Comparativa con modelos similares

No se dispone de datos concretos de otros modelos uncensored comparables en la informacion proporcionada. La busqueda web menciona alternativas como "Gemma 4 Heretic" o "Dolphin 3.0", pero no se ofrecen especificaciones ni resultados. Se puede indicar que el modelo ocupa un nicho especifico: un Gemma 4 abliterado con soporte multimodal, lo que lo diferencia de otros LLM uncensored puramente textuales. Sin embargo, sin datos de rendimiento cuantitativos, no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Contenido explicito: el modelo genera sin restricciones material NSFW, pornografico y potencialmente ofensivo. No es apto para menores ni para entornos profesionales sin control parental.
- Sesgos y alucinaciones: al ser una abliteracion, puede conservar sesgos del modelo base y ademas mostrar comportamientos impredecibles al eliminar los mecanismos de seguridad. Las alucinaciones en descripciones de imagenes son posibles, especialmente en escenas complejas.
- Idioma limitado: solo soporta tailandes e ingles. Otros idiomas no estan garantizados y pueden producir respuestas incoherentes.
- Licencia no disponible: no se especifica la licencia del modelo derivado ni la del modelo base. El uso comercial podria infringir los terminos de Google para Gemma 4, aunque no se confirma.
- Sin garantias de calidad: no hay benchmarks publicados, por lo que el rendimiento en tareas generales (razonamiento, codigo, matematicas) es desconocido y probablemente inferior al modelo original.
- Riesgo legal: la generacion de contenido explicito puede violar leyes de distribucion de material para adultos en algunas jurisdicciones. El usuario es responsable del uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW-GGUF
- Pesos completos (FP16/BF16): https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW
- Noticia sobre la publicacion: https://uncensoredhub.ai/news/2026-06-05-gemma-4-26b-uncensored-weights-quantized-to-gguf-for-local-inference
- Busqueda de modelos relacionados: https://huggingface.co/models?search=Jommarn%2FUNSEEN_Gemma_4_26B_NSFW
