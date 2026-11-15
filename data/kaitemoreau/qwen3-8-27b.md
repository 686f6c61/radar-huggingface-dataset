# kaitemoreau/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo causal de lenguaje con codificador de visión desarrollado dentro de la familia Qwen, publicado en Hugging Face bajo el identificador `kaitemoreau/Qwen3.8-27B`. Se presenta como la generación más capaz de la saga de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y tareas agénticas de largo recorrido. Es un modelo denso de 27.781.427.952 parámetros (27,8B) que combina atención lineal y atención completa en un diseño híbrido.

El modelo es nativo visión-lenguaje: procesa imágenes y vídeos además de texto, con control flexible del modo de razonamiento (thinking mode activado por defecto y desactivable por petición, con parámetros `reasoning_effort` y `preserve_thinking`). Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, lo que lo sitúa en la gama alta de ventanas de contexto para un modelo denso de este tamaño desplegable en infraestructura propia.

La relevancia actual radica en su combinación de tamaño compacto (27B), contexto muy largo, capacidades multimodales nativas y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed, además de una licencia Apache 2.0 que facilita el uso comercial. El repositorio, sin embargo, no ha registrado descargas ni interacciones en el momento de la consulta, y la información publicada procede casi exclusivamente de la model card del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet (atención lineal) + Gated Attention |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (la model card no detalla cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

Datos arquitectónicos adicionales: dimensión oculta 5120; embedding de tokens 248.320 (con padding); 64 capas; layout oculto 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión de RoPE 64; FFN con dimensión intermedia 17.408; salida LM de 248.320 (con padding); MTP (Multi-Token Prediction) entrenado con múltiples pasos.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de transformer causal con codificador de visión. El bloque de lenguaje alterna capas de Gated DeltaNet (atención lineal) y capas de Gated Attention (atención completa) en un patrón de 3 a 1 repetido 16 veces, lo que da las 64 capas totales. La atención lineal reduce el coste computacional en secuencias largas, mientras que las capas de atención completa preservan la capacidad de modelado exacto de dependencias. El modelo incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos, técnica que permite predecir varios tokens por paso y que habitualmente se asocia a decodificación especulativa y a un mayor throughput de generación.

El proceso de entrenamiento incluye pre-entrenamiento y post-entrenamiento. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas concretas de RLHF o DPO; tampoco detalla la arquitectura del codificador de visión más allá de su presencia. La información disponible tampoco concreta los datos multimodales empleados para el entrenamiento visión-lenguaje.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) activado por defecto y desactivable por petición.
- Control de la profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de terminal agénticas (la model card cita Terminal Bench 2.1 con el harness Terminus).
- Ejecución de agentes autónomos con planificación multi-paso y manejo de retroalimentación del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares, según la model card.
- Capacidades multilingües: no detalladas en la información disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque la orientación agéntica y la mención de herramientas integradas en la versión alojada sugieren dicha capacidad.
- Disponibilidad de versión alojada con contexto de 1M por defecto y herramientas integradas oficiales a través de Qwen Cloud (anunciada como "coming soon").

## Casos de uso

- Agentes de codificación autónomos: el modelo puede operar en entornos de terminal y resolver tareas de programación multi-paso, apoyándose en su entrenamiento específico para Terminal Bench 2.1 y en su capacidad de manejar retroalimentación del entorno.
- Análisis de documentación técnica y diagramas: gracias al codificador de visión nativo, puede interpretar diagramas STEM, esquemas de arquitectura y documentos escaneados, combinando la lectura visual con razonamiento textual en una sola pasada.
- Comprensión de vídeos largos: con soporte para vídeos de hasta una hora, resulta adecuado para resumir grabaciones de reuniones, analizar material docente o extraer información de vídeos de vigilancia o divulgación.
- Asistentes de investigación con contexto largo: su ventana nativa de 262.144 tokens (extensible a 1M) permite procesar corpus extensos, artículos científicos o expedientes completos sin fragmentación agresiva.
- Automatización de flujos de trabajo profesionales: la combinación de planificación autónoma y control de profundidad de razonamiento permite integrarlo en pipelines donde la latencia y el coste de razonamiento deben ajustarse por petición mediante `reasoning_effort`.
- Despliegue autoalojado con Apache 2.0: organizaciones que necesitan ejecutar un modelo multimodal de 27B en infraestructura propia pueden hacerlo con vLLM, SGLang o TokenSpeed sin restricciones comerciales derivadas de la licencia.
- Moderación y análisis de contenido multimodal: la capacidad de procesar imagen, vídeo y texto en el mismo modelo permite clasificar y describir contenido audiovisual en una única arquitectura.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (Coding, entre otras). Sin embargo, el contenido extraído de la tabla está truncado y solo se conserva el encabezado de la categoría "Coding" y la fila de "Agentic terminal coding — Terminal Bench 2.1 (Terminus)", sin que los valores numéricos de las celdas estén disponibles en la información proporcionada. Por tanto, no es posible reproducir cifras concretas de benchmarks.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible (tabla truncada) | No disponible | No disponible | No disponible | No disponible |
| Resto de benchmarks de la tabla | No disponible (tabla truncada) | No disponible | No disponible | No disponible | No disponible |

No se han publicado en la información disponible resultados numéricos verificables de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamaño (27,8B parámetros) y del repositorio (55,6 GB en safetensors, presumiblemente en BF16), la inferencia en BF16 requeriría del orden de 55-60 GB de VRAM solo para pesos, más overhead de KV cache y activaciones.
- Cuantización: la model card no publica versiones cuantizadas. En caso de generarse cuantizaciones GGUF/AWQ/GPTQ de la comunidad, un modelo de 27B en 4 bits ocuparía aproximadamente 14-16 GB, lo que lo haría viable en GPUs de consumo alto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue en BF16 encajaría en A100 80 GB, H100 80 GB o configuraciones multi-GPU; en consumer, una RTX 4090 (24 GB) no bastaría en BF16 y requeriría cuantización.
- Despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La presencia de MTP (Multi-Token Prediction) sugiere optimizaciones de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262.144 nativo / 1M extensible | Apache 2.0 | Sí (imagen y vídeo) | Pesos en HF; API en Qwen Cloud (próximamente) |
| Qwen3.6-27B | No disponible en detalle | No disponible | No disponible | No disponible | Referenciado como generación previa |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Referenciado como modelo de la familia |
| Muse Glimmer-30B | ~30B (según nombre) | No disponible | No disponible | No disponible | Referenciado como comparador externo |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Referenciado como comparador propietario |

La información disponible solo permite confirmar los datos del propio Qwen3.8-27B; del resto de modelos de la tabla comparativa únicamente se conocen sus nombres, sin especificaciones ni resultados numéricos verificables.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes en el momento de la consulta, y la información procede esencialmente de la model card del autor; la madurez y validación independiente del modelo no están contrastadas.
- No se han publicado resultados numéricos de benchmarks en la información disponible más allá de referencias cualitativas, lo que impide verificar las mejoras declaradas frente a generaciones anteriores.
- La model card no detalla los idiomas soportados, por lo que no puede confirmarse el rendimiento en castellano u otras lenguas distintas del inglés.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni evaluaciones de seguridad en la información disponible.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones de los componentes del codificador de visión y de los datos de entrenamiento, no detalladas.
- El modo de pensamiento activado por defecto incrementa el coste de inferencia; debe gestionarse con `reasoning_effort` en entornos de producción con requisitos de latencia.
- El contexto extensible a 1M se anuncia por defecto solo en la versión alojada en Qwen Cloud (aún no disponible); en local, el contexto nativo es de 262.144 tokens y la extensión a 1M requiere configuración adicional no especificada.
- El tamaño del repositorio (55,6 GB) implica requisitos de almacenamiento y transferencia considerables para el despliegue autoalojado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitemoreau/Qwen3.8-27B
- Qwen Cloud (servicio alojado oficial): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
