# CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096

## Resumen

El modelo Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 es un fine-tune de la familia Gemma 4 de Google, desarrollado por CrucibleLab sobre la base de ReadyArt/gemma-4-31B-it-scotoma-2. Este último es un ajuste del modelo instructivo Gemma-4-31B-it (de 31 000 millones de parámetros) mediante una técnica denominada γ-fold y DPO, que elimina una región acotada de la activación para reducir la cautela excesiva del modelo base, produciendo respuestas más variadas, directas y creativas sin llegar a ser un modelo sin censura.

Sobre esta base, CrucibleLab ha aplicado un entrenamiento adicional con el dataset Loki V2, orientado a roleplay y escritura creativa, y ha incorporado una extensión de atención por ventana deslizante (SWA) de 4096 tokens, como indica el sufijo del nombre. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, con un tamaño de repositorio de 62,6 GB. Su relevancia actual radica en ofrecer una alternativa especializada para narrativa y juegos de rol sobre una arquitectura de última generación, con una ventana de contexto reducida pero suficiente para escenas de diálogo y desarrollo de personajes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma 4 31B) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (ventana SWA, según el nombre; no se especifica el contexto total) |
| Tipos de cuantizacion | No disponible (existe una versión GGUF en otro repositorio, pero sin detalles) |
| Idiomas soportados | No disponible (el modelo base Gemma 4 soporta más de 140 idiomas, pero no se confirma para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, una arquitectura transformer densa de 31 000 millones de parámetros con atención global. Sobre ella, ReadyArt aplicó la técnica scotoma mediante γ-fold y DPO, que modifica una región acotada de los pesos para atenuar el "reflejo cauteloso" del modelo base, manteniendo el resto de la red intacta. El resultado es un comportamiento menos rígido y más creativo, aunque no exento de límites éticos.

Posteriormente, CrucibleLab entrenó el modelo con el dataset Loki V2, especializado en roleplay y escritura narrativa, y añadió una extensión de atención por ventana deslizante de 4096 tokens (SWA-4096). Esta técnica limita el campo de atención a una ventana fija, lo que reduce el coste computacional y permite procesar secuencias largas con menor uso de memoria, aunque sacrifica la capacidad de atender a contextos muy extensos. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto creativo: produce narrativa, diálogos y descripciones con un estilo más directo y variado que el modelo base, según la descripción del autor.
- Roleplay: está específicamente entrenado para mantener personajes, escenas y tramas en conversaciones multi-turno.
- Escritura de historias: adecuado para cuentos, novelas o guiones, con capacidad para mantener coherencia dentro de la ventana de 4096 tokens.
- Reducción de la cautela del asistente: responde con menos evasivas y menos rigidez de "asistente estándar", lo que facilita un tono más natural en contextos creativos.
- No se documenta soporte para tool calling, agentes, visión o audio. Tampoco se especifican capacidades multilingües específicas más allá de las heredadas del modelo base.

## Casos de uso

- Creación de personajes para juegos de rol: el modelo puede generar fichas de personaje, historias de fondo y diálogos coherentes con la personalidad definida, gracias a su entrenamiento en roleplay.
- Escritura de diálogos para guiones o novelas: su estilo menos cauteloso permite producir intercambios más naturales y dramáticos, con menos repeticiones de fórmulas de asistente.
- Generación de narrativa interactiva: en aplicaciones de ficción interactiva o juegos de texto, el modelo puede mantener el hilo de la historia dentro de la ventana de 4096 tokens.
- Prototipado de contenido creativo: escritores pueden usarlo para generar borradores de escenas, descripciones de ambientes o giros argumentales.
- Entrenamiento de modelos de roleplay más pequeños: al ser un modelo de 31B con licencia Apache 2.0, puede servir como profesor para destilar conocimiento en modelos más ligeros.
- Experimentación con técnicas de alineación: su enfoque scotoma (eliminación de una región acotada) es un caso de estudio interesante para investigar cómo modificar el comportamiento de modelos grandes sin reentrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este fine-tune específico.

## Requisitos de hardware

- Con 31 273 millones de parámetros y pesos en FP16, el modelo ocupa aproximadamente 62,6 GB en memoria. Para inferencia en FP16 se necesitan al menos 64 GB de VRAM, lo que requiere GPUs como A100 80GB, H100 80GB o múltiples GPUs.
- Con cuantización a 8 bits, la VRAM estimada es de unos 32 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB no es suficiente, pero sí una A6000 de 48 GB o una RTX 6000 Ada).
- Con cuantización a 4 bits, la VRAM estimada baja a unos 16 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3090 o RTX 4090 con suficiente memoria.
- Opciones de despliegue: al estar disponible en safetensors, puede servirse con vLLM, TensorRT-LLM o TGI. También existe una versión GGUF en un repositorio separado, lo que permite usarlo con llama.cpp u Ollama.
- La latencia y el throughput dependen del hardware y la cuantización; no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 | 31B | 4096 (SWA) | Apache 2.0 | Roleplay, escritura creativa |
| google/gemma-4-31B-it | 31B | hasta 256K | Gemma Terms (uso comercial permitido) | Instructivo general |
| ReadyArt/gemma-4-31B-it-scotoma-2 | 31B | no especificado | Apache 2.0 | Creatividad, menos cautela |
| Mistral-7B-Instruct (alternativa ligera) | 7B | 32K | Apache 2.0 | Instructivo general |

La comparación se basa en características declaradas; no hay benchmarks comunes para evaluar rendimiento. El modelo se distingue por su especialización en narrativa y roleplay, mientras que el base de Google ofrece mayor contexto y versatilidad general.

## Limitaciones y advertencias

- No es un modelo sin censura: la técnica scotoma reduce la cautela pero no elimina los límites de seguridad del modelo base.
- La ventana de contexto de 4096 tokens es limitada para tareas que requieran recordar información a lo largo de documentos extensos.
- No se han publicado benchmarks, por lo que su rendimiento en tareas estándar es desconocido.
- El dataset de entrenamiento (Loki V2) no está documentado públicamente, lo que dificulta evaluar posibles sesgos o contaminación.
- Puede heredar sesgos del modelo base Gemma 4, aunque no se han realizado auditorías específicas para este fine-tune.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original de Google, que pueden tener condiciones adicionales.
- Al ser un modelo relativamente nuevo y con pocas descargas (14), su robustez en producción no está probada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096
- Versión GGUF: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF
- Modelo base de ReadyArt: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
