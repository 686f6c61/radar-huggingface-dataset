# Goodoldjam/DiffusionGemma-26B-E38-Abliterated-BF16

## Resumen

DiffusionGemma-26B-E38-Abliterated-BF16 es un checkpoint experimental derivado de `google/diffusiongemma-26B-A4B-it`, el modelo de difusión multimodal de Google. El autor, Goodoldjam, ha aplicado un proceso de abliteración (eliminación selectiva de comportamientos de rechazo) sobre una región concreta de la capa de lenguaje, dejando intacto el stack de visión. El resultado es un modelo que reduce drásticamente las respuestas de rechazo (refusals) manteniendo en gran medida las capacidades originales, aunque con una regresión notable en tareas matemáticas.

La arquitectura base es DiffusionGemma 26B A4B, un modelo de lenguaje basado en difusión con 26 000 millones de parámetros totales y 4 000 millones de parámetros activos por token (MoE). El checkpoint se distribuye en precisión BF16 y formato safetensors. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Está pensado principalmente para investigación sobre modelos de difusión, análisis de trade-offs entre rechazo y capacidad, y experimentación multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionGemma 26B A4B (MoE con difusión) |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 4 000 millones (4B) |
| Longitud de contexto | Canvas nativo de 256 tokens; capacidad recomendada de 1280 tokens para generación larga |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en BF16; no se indican cuantizaciones adicionales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es DiffusionGemma 26B A4B, un modelo de lenguaje basado en difusión (diffusion LM) con arquitectura MoE. En lugar de predecir el siguiente token de forma autorregresiva, el modelo genera texto mediante un proceso de difusión sobre un canvas de tokens, iterando sobre una secuencia de ruido hasta converger en la salida final. El canvas nativo es de 256 tokens, ampliable a 1280 para generación más larga. El modelo es multimodal: acepta entradas de imagen y texto (image-text-to-text).

La modificación E38 consiste en una abliteración selectiva de 20 tensores de la capa de lenguaje, concretamente las proyecciones `attn.o_proj` y `mlp.down_proj` en las capas 7 a 16. El stack de visión no fue modificado. El proceso de selección evaluó más de 80 configuraciones candidatas mediante pruebas controladas de rechazo, falsos rechazos, retención de capacidades, benchmarks públicos, evaluación multimodal y pruebas de sensibilidad a la semilla. E38 fue elegido como el candidato con menor divergencia respecto al modelo base manteniendo una supresión de rechazos efectiva.

## Capacidades

- Generación de texto mediante difusión (no autorregresiva), con capacidad de revisar y corregir el canvas durante la generación.
- Procesamiento multimodal: acepta imágenes y texto como entrada, y genera texto.
- Razonamiento y comprensión del lenguaje, con capacidades generales similares al modelo base (aunque con regresión en matemáticas).
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta específicamente.
- Capacidades multilingües: limitadas al inglés (según la etiqueta de idioma).
- Capacidades especiales: canvas de difusión de 256 tokens, generación larga recomendada hasta 1280 tokens, y comportamiento de rechazo reducido (abliterado).

## Casos de uso

- Investigación sobre modelos de difusión: permite estudiar el comportamiento de generación por difusión, la dinámica del canvas y la influencia de la abliteración en la trayectoria de difusión.
- Análisis de trade-offs entre rechazo y capacidad: útil para estudiar cómo la eliminación de refusals afecta a la retención de habilidades, especialmente en tareas matemáticas.
- Experimentación multimodal: al conservar el stack de visión intacto, puede usarse para probar interacciones imagen-texto con un comportamiento de rechazo reducido.
- Generación de texto largo: con su capacidad recomendada de 1280 tokens, puede emplearse en tareas de redacción extensa donde el canvas de difusión permite revisar y corregir el contenido generado.
- Estudios de cuantización: al distribuirse en BF16, sirve como punto de partida para experimentos de cuantización (GGUF, GPTQ, etc.) y evaluación del impacto en el rendimiento.
- Investigación sobre abliteración: el checkpoint documenta exhaustivamente el proceso de selección, los hashes de integridad y las capas modificadas, lo que lo convierte en un recurso valioso para reproducir y extender el trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona que se realizaron evaluaciones de retención de capacidades y pruebas matemáticas, pero no se proporcionan cifras concretas. La documentación indica que E38 mostró una regresión matemática atribuida principalmente al componente MLP, pero sin valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB (26B parámetros × 2 bytes por parámetro). Esto supera la capacidad de GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). Se requiere hardware profesional.
- GPUs recomendadas: A100 80 GB, H100 80 GB o GPUs con al menos 52 GB de VRAM para inferencia en BF16 sin cuantización.
- Con cuantización (por ejemplo, 4 bits), la VRAM podría reducirse a unos 13-15 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 o RTX 3090, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante el pipeline de transformers. Para cuantización, podría usarse llama.cpp o herramientas como GPTQ/AWQ, pero no hay soporte documentado.
- Latencia y throughput: no disponible. Al ser un modelo de difusión, la generación es iterativa sobre el canvas, lo que puede implicar mayor latencia que los modelos autorregresivos del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DiffusionGemma-26B-E38-Abliterated (este) | 26B | 4B | 256 tokens (canvas) | Apache 2.0 | Abliterado, multimodal |
| google/diffusiongemma-26B-A4B-it | 26B | 4B | 256 tokens (canvas) | Apache 2.0 | Modelo base, con refusals estándar |
| Gemma 3 27B (autorregresivo) | 27B | 27B (denso) | 128K | Gemma Terms of Use | No multimodal, contexto mucho mayor |

La comparativa directa con otros modelos de difusión de lenguaje es limitada, ya que DiffusionGemma es un caso poco común. La alternativa más cercana es el propio modelo base, que difiere únicamente en el comportamiento de rechazo y la regresión matemática. Frente a modelos autorregresivos del mismo tamaño (como Gemma 3 27B), DiffusionGemma ofrece multimodalidad y generación por difusión, pero con un contexto mucho más reducido.

## Limitaciones y advertencias

- El modelo ha sido abliterado: no conserva el comportamiento de rechazo o seguridad del modelo original de Google. Esto implica que puede generar contenido inapropiado, dañino o no seguro si se le solicita. No debe usarse en aplicaciones de producción sin una evaluación exhaustiva de riesgos.
- Regresión en capacidades matemáticas: la documentación indica que E38 muestra una pérdida notable en tareas de matemáticas, atribuida al componente MLP modificado.
- Contexto limitado: el canvas nativo de 256 tokens es muy reducido para tareas que requieren contexto largo. La capacidad recomendada de 1280 tokens es todavía baja comparada con modelos autorregresivos modernos.
- Idioma: solo se soporta inglés. No se garantiza un rendimiento adecuado en otros idiomas.
- Estado experimental: el autor lo presenta como un checkpoint de investigación, no como una mejora universal sobre el modelo base. Puede tener comportamientos impredecibles en algunos escenarios.
- Integridad de los tensores: aunque se proporcionan hashes SHA256 para el overlay y la selección, no se garantiza que el checkpoint sea completamente estable en todos los entornos de inferencia.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base de Google tiene sus propios términos (Gemma Terms of Use). Es necesario verificar si la licencia del derivado es compatible con el uso previsto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Goodoldjam/DiffusionGemma-26B-E38-Abliterated-BF16
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
