# Green-Eye/Akikawa-3.3-1b-Roleplay-128K-GGUF

## Resumen

Akikawa-3.3-1b-Roleplay-128K-GGUF es un modelo de lenguaje de 1.235 millones de parámetros, especializado en roleplay conversacional y simulación de personajes, desarrollado por el usuario Green-Eye. Se trata de un fine-tuning del modelo base unsloth/Llama-3.2-1B-Instruct de Meta, adaptado mediante la librería unsloth para su uso en escenarios de conversación con personajes, con especial orientación al universo de Uma Musume (el tag "uma-musume" está presente en la model card). El modelo se distribuye únicamente en formato GGUF, pensado para su ejecución con llama.cpp y bibliotecas compatibles como llama-cpp-python u Ollama.

La relevancia de este modelo radica en su tamaño reducido (alrededor de 1,2 mil millones de parámetros), lo que permite ejecutarlo en hardware de consumo con requisitos modestos de VRAM, mientras ofrece una ventana de contexto ampliada de 128K tokens. Está diseñado para aplicaciones de rol conversacional, chatbots con personalidad y agentes de diálogo en inglés, y se distribuye bajo la licencia llama3.2 de Meta, que permite uso comercial bajo ciertas condiciones. El repositorio fue creado en agosto de 2026 y acumula 139 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basada en Llama-3.2-1B-Instruct |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (según el nombre del modelo; el base Llama-3.2-1B-Instruct soporta 128K) |
| Tipos de cuantizacion | No especificada (repositorio GGUF de 5,5 GB, probablemente múltiples ficheros de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 (licencia comunitaria de Meta para Llama 3.2) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Llama-3.2-1B-Instruct, con 1.235 millones de parámetros. Es un fine-tuning del modelo de instrucción de Meta (distribuido por unsloth), lo que implica que la capa de atención y los bloques de transformación son los estándar de Llama 3.2, con una ventana de contexto nativa de 128K tokens. El proceso de entrenamiento no se detalla en la información disponible: no se especifica el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. La etiqueta "roleplay", "conversational" y "character" sugiere que el fine-tuning se orientó a la generación de diálogos de personajes, probablemente con datos de conversaciones de rol y de personajes del universo Uma Musume.

El modelo se distribuye únicamente en formato GGUF, lo que implica que fue convertido a este formato para su uso con llama.cpp. No se han publicado detalles sobre técnicas de optimización adicionales más allá de la conversión a GGUF.

## Capacidades

- Generación de texto conversacional de carácter interactivo, orientada a roleplay y simulación de personajes.
- Soporte de conversaciones multi-turno con contexto largo gracias a la ventana de 128K tokens.
- Capacidad de mantener coherencia en diálogos con personalidad y estilo de un personaje concreto (por ejemplo, personajes de Uma Musume).
- Generación de texto en inglés (único idioma declarado).
- Compatible con herramientas de inferencia basadas en llama.cpp (llama-cpp-python, Ollama, etc.).
- No se declaran capacidades de tool calling, función de llamada, razonamiento multi-paso explícito, visión o audio.

## Casos de uso

- Chatbots de roleplay conversacional: el modelo puede simular personajes de ficción, como personajes de Uma Musume, en conversaciones multi-turno con contexto largo, ideal para juegos de rol textuales o plataformas de chat de personajes.
- Asistentes de escritura creativa: puede ayudar a escribir diálogos de personajes, guiones o narrativa interactiva, manteniendo coherencia a lo largo de capítulos o escenas largas gracias a su ventana de 128K.
- Simulación de NPC en juegos de texto: se puede integrar en motores de juego basados en texto para generar respuestas de personajes no jugadores con una personalidad definida.
- Prototipos de agentes conversacionales ligeros: su tamaño de 1B lo hace adecuado para ejecutarse en dispositivos con recursos limitados, como Raspberry Pi o portátiles sin GPU, para experimentar con agentes de diálogo.
- Herramientas de entretenimiento en línea: creación de bots de chat de rol en plataformas como Discord o Telegram mediante llama-cpp-python, con respuestas rápidas y sin necesidad de GPUs potentes.
- Evaluación de modelos de roleplay: sirve como base para pruebas y benchmarks de fine-tunes de roleplay en modelos pequeños, comparando su comportamiento con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras métricas estándar para este modelo. La model card no incluye ninguna tabla de rendimiento ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1B parámetros en formato GGUF, las cuantizaciones típicas necesitan entre 1 y 2 GB de VRAM (por ejemplo, Q4_K_M ocupa alrededor de 0,7-0,8 GB y Q8_0 unos 1,3 GB). Con cuantizaciones más altas (Q8) se puede llegar a ~1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo con cuantización baja (Q4). GPUs como la NVIDIA GTX 1050 Ti, RTX 3060, RTX 4090, o incluso iGPU integradas con suficiente memoria compartida, son viables. También funciona en CPU pura mediante llama.cpp con una latencia razonable para un modelo de este tamaño.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, TGI (con adaptadores de GGUF), y cualquier frontend que use la API de llama.cpp.
- Latencia y throughput: no se han publicado datos específicos, pero al tratarse de un modelo de 1B parámetros, se puede esperar una generación de varios tokens por segundo en GPU y de un token por segundo o menos en CPU, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo. Como referencia, se puede comparar con su modelo base:

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| Akikawa-3.3-1b-Roleplay-128K-GGUF | 1,24 B | 128K | llama3.2 | GGUF | Roleplay conversacional |
| Llama-3.2-1B-Instruct (base) | 1,24 B | 128K | llama3.2 | safetensors/GGUF | Instrucción general |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32K (original) | Apache 2.0 | safetensors/GGUF | Instrucción general |

No se dispone de datos de rendimiento comparativos con estos u otros modelos de roleplay de tamaño similar. La comparación directa no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- El modelo es pequeño (1,2 B de parámetros), por lo que su capacidad de razonamiento complejo, coherencia a largo plazo y precisión factual es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos abiertos de roleplay.
- Solo soporta inglés (idioma declarado); no se ha evaluado su rendimiento en otros idiomas.
- Especializado en roleplay, por lo que puede generar contenido inapropiado o explícito dependiendo del contexto de la conversación. Debe utilizarse con moderación y filtros de contenido si es necesario.
- Licencia llama3.2: permite uso comercial, pero está sujeta a las condiciones de la licencia de Meta, que incluyen limitaciones para empresas con más de 700 millones de usuarios mensuales y obligaciones de atribución.
- No se ha publicado información sobre sesgos específicos del modelo ni sobre su comportamiento en dominios fuera del roleplay.
- El modelo está diseñado para ejecutarse con llama.cpp; no se proporciona el modelo en formato safetensors, por lo que no es directamente compatible con frameworks como Transformers sin una conversión previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Green-Eye/Akikawa-3.3-1b-Roleplay-128K-GGUF
- Archivos del repositorio: https://huggingface.co/Green-Eye/Akikawa-3.3-1b-Roleplay-128K-GGUF/tree/main
- Registro en free2aitools: https://free2aitools.com/model/green-eye/akikawa-3.3-1b-roleplay-128k-gguf
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
