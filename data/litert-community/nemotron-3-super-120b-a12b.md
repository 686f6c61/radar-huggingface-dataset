# litert-community/Nemotron-3-Super-120B-A12B

## Resumen

Nemotron-3-Super-120B-A12B es un modelo de lenguaje de tipo mixto (MoE híbrido) desarrollado por NVIDIA y convertido al formato LiteRT-LM por la comunidad litert-community. Se trata de un modelo de 120 mil millones de parámetros totales, de los cuales 12 mil millones están activos por token, diseñado para generación de texto y razonamiento. Su arquitectura combina capas Mamba-2 con capas de atención y capas de mezcla de expertos, lo que lo sitúa en la categoría de modelos híbridos modernos que buscan equilibrar eficiencia y capacidad.

La relevancia de esta conversión concreta reside en que permite ejecutar un modelo de 120B parámetros en hardware de consumo, concretamente en un Apple M4 Max con 128 GB de memoria unificada, mediante cuantización mixta int4/int8 y el runtime LiteRT-LM. El modelo original soporta hasta 1 millón de tokens de contexto; sin embargo, esta conversión limita la ventana a 4.096 tokens y elimina la cabeza de predicción multi-token del modelo fuente.

El modelo está disponible en un único archivo de 68,2 GB con licencia NVIDIA Nemotron Open Model License, y soporta siete idiomas: inglés, francés, español, italiano, alemán, japonés y chino. Su principal atractivo es democratizar el acceso a un modelo de gran escala en entornos locales, aunque con limitaciones notables de rendimiento (2,32 tokens/s en decodificación) y de gestión de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 40 capas Mamba-2, 40 capas MoE, 8 capas de atención (88 capas totales) |
| Parametros totales | 120B |
| Parametros activos | 12B (MoE con 512 expertos, 22 activos por token) |
| Longitud de contexto | 4.096 tokens (el modelo fuente soporta hasta 1M) |
| Tipos de cuantizacion | Mixta: expertos int4 en bloques de 128; resto de matrices, tabla de tokens y lm_head int8 por canal; routers fp32 |
| Idiomas soportados | en, fr, es, it, de, ja, zh |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | LiteRT-LM (.litertlm), archivo único de 68,2 GB |
| Backend soportado | CPU (GPU/WebGPU no verificado a tamaño completo) |
| Memoria requerida | ~70 GB libres (77 GB en primera ejecución por caché de 7,7 GB) |
| Thinking mode | Activado por defecto, desactivable con `--thinking false` |

## Arquitectura y entrenamiento

El modelo fuente es un transformer híbrido que combina tres tipos de capas en su decodificador de texto: 40 capas Mamba-2 (modelo de espacio de estados), 40 capas de mezcla de expertos (MoE) con 512 expertos cada una y 22 expertos activos por token, y 8 capas de atención. Esta combinación busca aprovechar la eficiencia de Mamba-2 para secuencias largas, la capacidad de los expertos para el conocimiento especializado y la precisión de la atención para dependencias complejas. El modelo fuente incluye una cabeza de predicción multi-token (multi-token prediction) que no ha sido convertida en esta versión LiteRT-LM.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de esta conversión no incluye esos datos, y no se ha encontrado documentación adicional en la búsqueda web realizada. La conversión a LiteRT-LM aplica una cuantización mixta que preserva los routers en fp32 para mantener la precisión del enrutamiento de expertos, mientras que los expertos se cuantizan a int4 en bloques de 128 y el resto de matrices a int8 por canal.

## Capacidades

- Generación de texto y razonamiento: el modelo incluye un modo de pensamiento (thinking) activado por defecto que genera una cadena de razonamiento antes de la respuesta final.
- Razonamiento matemático básico: la model card demuestra la resolución de operaciones aritméticas simples (17 + 25 = 42) con traza de pensamiento.
- Capacidades multilingües: soporte declarado para inglés, francés, español, italiano, alemán, japonés y chino.
- Generación de código: el modelo fuente está etiquetado con la capacidad de razonamiento y generación de texto, aunque no se han verificado capacidades específicas de código en esta conversión.
- Tool calling / function calling: no verificado. La model card indica explícitamente que "Tool calls were not checked" (las llamadas a herramientas no se comprobaron).
- Modo de pensamiento configurable: se puede activar o desactivar mediante `ThinkingConfig(enable_thinking=False)` en Python o `--thinking false` en CLI.
- Generación en streaming: soporte de `send_message_async` para generación token a token.
- Contexto limitado: la ventana efectiva es de 4.096 tokens, muy inferior al 1M del modelo fuente.

## Casos de uso

- Inferencia local en estaciones de trabajo de gama alta: el modelo puede ejecutarse en un Apple M4 Max con 128 GB de memoria unificada usando el backend CPU de LiteRT-LM, lo que permite experimentar con un modelo de 120B parámetros sin infraestructura de servidor. Es adecuado para investigadores que necesiten probar el comportamiento de modelos MoE híbridos en local.

- Desarrollo y depuración de aplicaciones LiteRT-LM: dado que esta conversión es una de las primeras de un modelo de esta escala en el ecosistema LiteRT-LM, sirve como caso de prueba para desarrolladores que construyan herramientas sobre este runtime, incluyendo la gestión de caché XNNPACK y el manejo de estados Mamba-2.

- Evaluación de razonamiento con traza de pensamiento: el modo thinking por defecto permite estudiar cadenas de razonamiento en tareas matemáticas y lógicas simples, aunque el contexto de 4.096 tokens limita la profundidad de las trazas generadas.

- Pruebas de cuantización mixta: la combinación int4 para expertos, int8 para el resto y fp32 para routers es un caso de estudio útil para investigar el impacto de la cuantización selectiva en modelos MoE híbridos, comparando con el modelo fuente en BF16.

- Generación de texto multilingüe en siete idiomas: para aplicaciones que requieran respuestas en inglés, francés, español, italiano, alemán, japonés o chino, el modelo puede generar texto en estos idiomas, aunque con la limitación de contexto mencionada.

- Benchmarking de hardware: el modelo sirve para medir el rendimiento de decodificación (2,32 tokens/s en CPU de 8 hilos) y prefill (34,58 tokens/s para 1.024 tokens) en hardware de consumo, como referencia para comparar con otras configuraciones de memoria y CPU.

- Prototipado de asistentes conversacionales con estado Mamba-2: aunque la limitación de "un Engine por conversación" (el estado Mamba-2 no se reinicia entre conversaciones) restringe su uso en producción, permite experimentar con el comportamiento de estado persistente en modelos híbridos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la model card de esta conversión, medidos en un Apple M4 Max con 128 GB de memoria el 17 de noviembre de 2026:

| Backend | Prefill (1.024 tokens) | Decode (256 tokens) | Pico de memoria |
|---|---:|---:|---:|
| CPU (8 hilos) | 34,58 tokens/s | 2,32 tokens/s | 24,5 GB |

Estas cifras se obtuvieron con `litert-lm benchmark` de LiteRT-LM 0.19.2, con `--max-num-tokens 2048` y `--cache no`. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta conversión ni para el modelo fuente.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 70 GB de memoria libre para inferencia; 77 GB en la primera ejecución debido a la caché XNNPACK de 7,7 GB que se escribe junto al modelo. El tamaño residente del proceso alcanzó 69 GB con la caché por defecto y 92,3 GB con `--cache no` (incluyendo páginas del archivo mapeadas).
- GPU recomendadas: no verificadas. La ruta GPU (WebGPU) no se ha probado a tamaño completo; el motor GPU se crea en 57,5 s y el footprint alcanzó 69,8 GB, pero la ejecución completa se detuvo por swapping en macOS. Se recomienda usar CPU por ahora.
- ¿Cabe en GPU de consumo? No verificado. El modelo requiere ~70 GB de memoria, lo que excede la VRAM de cualquier GPU de consumo actual (RTX 4090 tiene 24 GB). Solo es viable en hardware con memoria unificada grande (Apple M4 Max 128 GB) o GPUs de servidor con suficiente VRAM (A100 80GB, H100 80GB), aunque la ruta GPU no está validada.
- Opciones de despliegue: LiteRT-LM 0.19.2 (PyPI) con backend CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: decodificación a 2,32 tokens/s y prefill a 34,58 tokens/s en CPU de 8 hilos. A este ritmo, una respuesta de 1.400 tokens (incluyendo pensamiento) tardaría unos 10 minutos, que es el límite de `send_message` bloqueante.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. El modelo fuente NVIDIA-Nemotron-3-Super-120B-A12B-BF16 es la referencia directa, pero no se han encontrado en la búsqueda web otros modelos de 120B con arquitectura híbrida Mamba-2/MoE/atención convertidos a LiteRT-LM. La comparación con alternativas como Gemma 4 (12B) o EmbeddingGemma (740M) no es pertinente por diferencia de escala y propósito. Se indica "no disponible" para una comparativa rigurosa.

## Limitaciones y advertencias

- Memoria: el modelo requiere ~70 GB de memoria libre; con menos memoria, las respuestas pueden ralentizarse al releer el archivo desde disco. El proceso residente alcanzó 69 GB con caché por defecto.
- GPU/WebGPU no validado: la ejecución completa en GPU se detuvo por swapping en macOS. Si se prueba, se recomienda desactivar la caché (`--cache no` o `cache_dir=":nocache"`), ya que las cachés de programas GPU de ejecuciones anteriores produjeron respuestas diferentes en pruebas con modelos pequeños.
- Un Engine por conversación: el estado Mamba-2 no se reinicia entre conversaciones en un mismo Engine (issue LiteRT-LM #3165). Esto impide reutilizar el Engine para múltiples conversaciones independientes.
- Respuestas largas en CPU: `send_message` bloqueante tiene un límite de 10 minutos; a 2,32 tokens/s, esto son ~1.400 tokens incluyendo pensamiento. Se debe usar `send_message_async` para streaming.
- Fallo en cascada tras exceder contexto: si un mensaje no cabe en la ventana de 4.096 tokens, falla con `INVALID_ARGUMENT: Input token ids are too long`, y todos los mensajes posteriores en esa conversación fallan con `Task failed with state: 7`. Es necesario iniciar una conversación nueva.
- Contexto reducido: 4.096 tokens frente a 1M del modelo fuente, lo que limita tareas que requieran contexto largo.
- Cabeza de predicción multi-token no convertida: se pierde esta capacidad del modelo fuente.
- Tool calling no verificado: no se ha comprobado el soporte de llamadas a herramientas.
- Licencia: NVIDIA Nemotron Open Model License; es necesario revisar los términos para uso comercial, ya que no es una licencia de código abierto estándar (OSI).
- Sesgos y alucinaciones: no se dispone de información específica sobre sesgos o tasas de alucinación en la documentación proporcionada; se aplican las advertencias generales de los modelos de lenguaje de gran escala.
- Idiomas: aunque se declaran siete idiomas, no se ha verificado el rendimiento relativo en cada uno; el inglés es probablemente el mejor soportado.

## Enlaces

- Hugging Face (conversión LiteRT-LM): https://huggingface.co/litert-community/Nemotron-3-Super-120B-A12B
- Modelo fuente en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Notas de conversión: https://huggingface.co/litert-community/Nemotron-3-Super-120B-A12B/blob/main/DETAILS.md
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Issue LiteRT-LM #3165 (estado Mamba-2): https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Organización LiteRT Community en Hugging Face: https://huggingface.co/litert-community
- Paper de referencia (arXiv:2512.20856): https://arxiv.org/abs/2512.20856
