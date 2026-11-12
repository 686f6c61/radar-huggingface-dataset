# nace-ai/Qwen3.8-27B-MLX-KQuant

## Resumen

Qwen3.8-27B-MLX-KQuant es una cuantización de 4 bits del modelo multimodal Qwen3.8-27B de Alibaba Qwen, empaquetada por nace-ai para su ejecución nativa en Apple Silicon mediante la librería MLX. El pack emplea el esquema de cuantización propietario KQuant, desarrollado por el mismo autor, que según la model card se aproxima un 1,5 veces más al modelo original en BF16 que los packs de 4 bits de mlx-community (divergencia KL de 0,035 frente a 0,054) manteniendo el mismo tamaño de pesos del modelo de lenguaje (15,13 GB).

El modelo base es un transformer denso de 27.356.728.560 parámetros (unos 27,36 mil millones) con pipeline image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto. Está publicado bajo licencia Apache 2.0 y su formato de pesos es safetensors en el contenedor MLX, con un tamaño total de repositorio de 37,0 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 27B parámetros con capacidades de visión, tool calling y modo de razonamiento (thinking) en equipos Mac con memoria unificada, sin GPU dedicada, a través de motores como Kapitsa, mlx-lm o LM Studio. La información disponible sobre el modelo base (contexto, datos de entrenamiento, benchmarks) es limitada en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text); familia qwen3_5 |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card muestra un ejemplo con `--context-length 32768` en LM Studio, sin confirmar el máximo oficial) |
| Tipos de cuantizacion | 4 bits (KQuant Q4); la model card menciona tambien una variante KQuant Q5 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pack MLX); repositorio de 37,0 GB, pesos del modelo de lenguaje 15,13 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de aproximadamente 27,36 mil millones de parámetros con pipeline multimodal image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje. La model card del pack cuantizado no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos corresponden al modelo original y no están recogidos en la información disponible.

La innovación técnica principal de este repositorio es el esquema KQuant, una cuantización de 4 bits diseñada por nace-ai que reduce la divergencia KL respecto al modelo BF16 original en comparación con los packs de 4 bits de mlx-community, a igual tamaño de pesos. El pack está optimizado para el framework MLX de Apple, lo que permite aprovechar la memoria unificada de los chips de la serie M. El modelo incorpora modo de razonamiento (thinking) activado por defecto, con control de profundidad mediante el parámetro `reasoning_effort` (valores `low`, `medium`, `xhigh` y `none`).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con OpenAI.
- Razonamiento explícito en modo thinking, con trazas devueltas en el campo `reasoning_content` (Kapitsa) o `reasoning` (mlx-lm), y control de profundidad mediante `reasoning_effort`.
- Comprensión de imágenes: acepta entradas `image_url` en formato URL http(s) o data URL base64, según los ejemplos de la model card.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI, probado con el SDK de OpenAI contra `kapitsa serve`.
- Desactivación del modo thinking mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`.
- Servido mediante APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno con modo thinking activado o desactivado, ejecutándose íntegramente en memoria unificada de Apple Silicon mediante Kapitsa o mlx-lm, sin enviar datos a la nube.
- Análisis de imágenes en local: gracias a su pipeline image-text-to-text, permite describir o interpretar imágenes pasadas como URL o base64, útil para tareas de accesibilidad, catalogación o revisión de contenido en entornos privados.
- Automatización con tool calling: la integración con definiciones de herramientas en formato OpenAI permite conectar el modelo a APIs externas (por ejemplo, consulta de clima, bases de datos o sistemas internos) desde un servidor local compatible con OpenAI.
- Razonamiento matemático asistido: el modo thinking con profundidad configurable (`low`, `medium`, `xhigh`) permite ajustar el esfuerzo de cómputo en problemas de cálculo, como el ejemplo de la model card (17 × 23), equilibrando latencia y precisión.
- Prototipado de agentes multi-paso: el soporte de tool calling y de APIs compatibles con OpenAI, Anthropic y Ollama en Kapitsa facilita integrar el modelo en frameworks de agentes existentes sin adaptadores adicionales.
- Desarrollo y pruebas en estación de trabajo Mac: con 15,13 GB de pesos del modelo de lenguaje en 4 bits, un Mac con memoria unificada suficiente puede servir el modelo localmente para pruebas de integración de aplicaciones antes de desplegar en infraestructura mayor.
- Evaluación comparativa de cuantizaciones: investigadores pueden reproducir la comparación de divergencia KL frente a BF16 documentada en la model card para validar el impacto de KQuant Q4 en sus propias tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una métrica de fidelidad de cuantización: divergencia KL respecto al modelo BF16 de 0,035 para KQuant Q4, frente a 0,054 para el pack de 4 bits de mlx-community, con el mismo tamaño de pesos del modelo de lenguaje (15,13 GB).

## Requisitos de hardware

- VRAM/memoria: el pack ocupa 16,3 GB de archivos según la model card, con 15,13 GB correspondientes a los pesos del modelo de lenguaje en 4 bits; el repositorio completo es de 37,0 GB (incluye otros componentes, presumiblemente el codificador visual y metadatos).
- Hardware objetivo: exclusivamente Apple Silicon (etiqueta `apple-silicon`); requiere chips de la serie M con memoria unificada suficiente. No está pensado para GPU NVIDIA ni CUDA.
- Memoria recomendada: no especificada en la información disponible; por el tamaño de los pesos, se necesita un Mac con memoria unificada holgada para cargar el modelo y el contexto.
- Consumer GPU: no aplica en el sentido habitual; no es compatible con GPUs de consumo NVIDIA. En Apple Silicon, el modelo está diseñado para ejecutarse en Macs de gama alta con memoria unificada amplia.
- Opciones de despliegue: Kapitsa (instalación vía Homebrew, APIs OpenAI/Anthropic/Ollama), mlx-lm (`mlx_lm.generate`, `mlx_lm.server` en el puerto 8080) y LM Studio (`lms get --mlx`, servidor en el puerto 1234).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Divergencia KL vs BF16 | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-KQuant (este) | 27,36B | No disponible | 4 bits KQuant (15,13 GB LM) | 0,035 | Apache 2.0 | Apple Silicon (MLX) |
| mlx-community 4-bit (Qwen3.8-27B) | 27,36B (base) | No disponible | 4 bits | 0,054 | Apache 2.0 (base) | Apple Silicon (MLX) |
| lmstudio-community 4-bit (Qwen3.8-27B) | 27,36B (base) | No disponible | 4 bits | No disponible | Apache 2.0 (base) | Apple Silicon (MLX) |
| mlx-works oQ4e-mtp (Qwen3.8-27B) | 27,36B (base) | No disponible | 4 bits | No disponible | Apache 2.0 (base) | Apple Silicon (MLX) |

Los tres comparadores aparecen citados en la gráfica de la model card como packs públicos de 4 bits del mismo modelo base. No se dispone de datos de benchmarks de rendimiento para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 4 bits introduce pérdida de fidelidad respecto al BF16 original, cuantificada en una divergencia KL de 0,035; puede degradar tareas sensibles a la precisión numérica o al razonamiento largo.
- Exclusivo para Apple Silicon: no es ejecutable en GPUs NVIDIA, CUDA ni en la mayoría de infraestructuras de servidor convencionales.
- La model card advierte de que varios ejemplos de inferencia se probaron primero en un pack distinto (Qwen3.5-9B-MLX-Q4-KQuant); en este pack solo se validaron chat, lectura de imagen y tool calling con mlx-lm 0.32.2 y LM Studio el 12 de noviembre de 2026.
- En LM Studio no se probó la desactivación del modo thinking en este pack; el thinking permaneció activado en las pruebas de chat, imagen y tool calling.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de los componentes empaquetados antes de un despliegue en producción.
- El repositorio tiene 40 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La longitud máxima de contexto no está confirmada; el ejemplo de LM Studio usa 32.768 tokens, pero no se especifica si es el máximo del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Kapitsa: https://github.com/nace-ai/kapitsa
- Variante KQuant Q5 referenciada en la model card: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q4-KQuant (ruta citada en los assets de la model card)
