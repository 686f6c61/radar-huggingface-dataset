# Ankushbl6/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en el repositorio de Hugging Face `Ankushbl6/Qwen3.8-27B`, que según su model card forma parte de la familia Qwen3.8 y se presenta como la generación más capaz de los modelos abiertos de Qwen hasta la fecha. Se trata de un modelo denso (no MoE) de aproximadamente 27.781 millones de parámetros, construido sobre la base arquitectónica de Qwen3.5, con 64 capas y una dimensión oculta de 5120. Su pipeline declarado es `image-text-to-text`, por lo que está diseñado como modelo nativo de visión-lenguaje capaz de procesar imágenes y vídeos además de texto.

El modelo incorpora una arquitectura híbrida de atención que combina capas de Gated DeltaNet (atención lineal) con capas de Gated Attention (atención completa con RoPE), organizadas en un patrón de 16 bloques de 4 capas cada uno. Dispone de una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y entrena con Multi-Token Prediction (MTP). La licencia declarada es Apache 2.0 y los pesos se distribuyen en formato safetensors compatibles con Transformers, vLLM, SGLang y TokenSpeed.

La relevancia del modelo radica en su orientación a tareas agénticas de largo horizonte, codificación, trabajo profesional e investigación, con control flexible del modo de razonamiento (`thinking` activado por defecto, desactivable por petición, ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento con `preserve_thinking`). No obstante, conviene señalar que el repositorio no muestra descargas ni interacciones y que parte de la información de la model card (benchmarks, referencias a servicios en la nube) no ha podido verificarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

Otros datos técnicos declarados en la model card: dimensión oculta 5120; token embedding 248.320 (con padding); 64 capas; Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión RoPE 64; FFN con dimensión intermedia 17.408; salida LM de 248.320 (con padding); MTP entrenado con múltiples pasos. Tamaño del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido que alterna capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de Gated Attention (atención completa con RoPE de dimensión 64), en un patrón repetido 16 veces con tres capas DeltaNet por cada capa de atención completa. Esta combinación busca reducir el coste computacional y de memoria de la atención en contextos largos manteniendo la capacidad expresiva de la atención completa. El modelo incluye un codificador de visión que lo convierte en un modelo nativo de visión-lenguaje, y emplea Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica que puede aprovecharse para decodificación especulativa y aceleración de la inferencia.

El modelo ha pasado por fases de preentrenamiento y postentrenamiento, según la model card. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas concretas de RLHF, DPO u otras variantes de alineación. Tampoco se detalla la innovación exacta del entrenamiento del codificador de visión ni la estrategia de extensión de contexto hasta 1.000.000 de tokens.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (`thinking`) activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Retención de contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración según la model card.
- Codificación y tareas de terminal agénticas (la model card cita Terminal Bench 2.1 con el arnés Terminus).
- Ejecución agéntica autónoma: planificación, manejo de retroalimentación del entorno y finalización de tareas de múltiples pasos.
- Compatibilidad con arneses y herramientas de desarrollo populares, orientada a integración en stacks existentes.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información proporcionada, aunque la orientación agéntica y la mención de "herramientas integradas oficiales" en el servicio en la nube sugieren soporte; no confirmado para los pesos abiertos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede operar como agente que interpreta la salida de comandos, planifica pasos y corrige errores en entornos de línea de comandos, aprovechando su entrenamiento específico en Terminal Bench 2.1 y su capacidad de manejar retroalimentación del entorno.
- Análisis de documentos técnicos y diagramas STEM: gracias a su codificador de visión nativo, puede extraer información de figuras, esquemas y documentos escaneados, y razonar sobre ellos en el mismo contexto que el texto.
- Procesamiento de vídeos de larga duración: la ventana de contexto de 262.144 tokens y la comprensión de vídeo permiten resumir, indexar o responder preguntas sobre grabaciones de hasta una hora, útil en análisis de reuniones, formación o vigilancia.
- Asistencia a la investigación con contexto largo: la extensión hasta 1.000.000 de tokens permite cargar corpus extensos, artículos o bases de código completas y realizar preguntas de síntesis o comparación sin fragmentación.
- Agentes autónomos de múltiples pasos con herramientas: el control de `reasoning_effort` y `preserve_thinking` permite ajustar el coste de razonamiento por petición y mantener trazas de razonamiento entre turnos, adecuado para orquestación de agentes en producción.
- Generación y revisión de código en pipelines de desarrollo: su orientación a coding y su compatibilidad con vLLM y SGLang facilitan el despliegue como servicio de autocompletado, revisión o generación de tests dentro de flujos de integración.
- Despliegue en infraestructura propia con licencia Apache 2.0: al ser un modelo denso de 27,8 B y pesos safetensors, puede servirse en clústeres con GPUs de 80 GB y cuantizarse para entornos más modestos, sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorías como Coding (Terminal Bench 2.1 / Terminus). Sin embargo, en la información proporcionada solo se ha podido recuperar el encabezado de la tabla y la primera fila parcial, sin los valores numéricos completos. Por tanto, no se presentan cifras concretas para no inventar datos.

No se han publicado resultados de benchmarks completos y verificables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 55,6 GB solo para pesos, más memoria para caché KV y activaciones; se recomienda al menos 80 GB por GPU para contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con 80 GB o más para servir el modelo sin cuantizar con contexto largo.
- Cabe en GPU de consumo: no en BF16/FP16; con cuantización a 8 bits o 4 bits podría caber en configuraciones de 24-48 GB (RTX 4090 24 GB, RTX 6000 Ada 48 GB), aunque no se dispone de datos verificados de cuantización para este modelo concreto.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona soporte explícito de llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet y MTP sugiere ventajas en contextos largos y decodificación especulativa, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | ≈27,8 B (denso) | 262.144 nativos; hasta 1.000.000 | Apache 2.0 | Pesos en HF (repo con 0 descargas) | Híbrido DeltaNet + atención, visión nativa, MTP |
| Qwen3.6-27B | No disponible | No disponible | No disponible | Citado en la model card | Generación anterior de la familia |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | Citado en la model card | Variante "Plus" de la familia |
| Muse Glimmer-30B | ≈30 B (según nombre) | No disponible | No disponible | Citado en la model card | Modelo comparable de otro desarrollador |
| Opus4.6 Max | No disponible | No disponible | No disponible | Citado en la model card | Referencia propietaria de alto rendimiento |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto y licencia cuando se conocen.

## Limitaciones y advertencias

- El repositorio `Ankushbl6/Qwen3.8-27B` registra 0 descargas y 0 likes en el momento de la consulta, lo que impide validar su uso real por la comunidad.
- La model card incluye referencias a un servicio en la nube (Qwen Cloud) y a un modelo "Opus4.6 Max" que no se han podido verificar de forma independiente; parte de la información podría ser promocional o no contrastada.
- No se especifican los idiomas soportados, lo que dificulta evaluar su rendimiento en castellano u otras lenguas distintas del inglés.
- No se detallan los datos de entrenamiento ni los procesos de alineación (RLHF/DPO), por lo que no es posible evaluar sesgos conocidos ni el riesgo de alucinación con rigor.
- El modo de pensamiento activado por defecto puede incrementar la latencia y el consumo de tokens en producción si no se ajusta `reasoning_effort` o se desactiva por petición.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los pesos y la model card sean auténticos y no una re-subida no oficial, dado el bajo historial del repositorio.
- El tamaño de 27,8 B en BF16 requiere infraestructura de al menos 80 GB por GPU para contexto largo; el despliegue en hardware de consumo exige cuantización, cuyos formatos no se documentan.
- No se han publicado resultados de benchmarks completos verificables en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ankushbl6/Qwen3.8-27B
- Página del servicio en la nube citada en la model card: https://www.qwencloud.com/models/qwen3.8-27b
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
