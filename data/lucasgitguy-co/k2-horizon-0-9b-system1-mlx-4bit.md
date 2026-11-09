# Lucasgitguy-co/K2-Horizon-0.9B-System1-MLX-4bit

## Resumen

K2-Horizon-0.9B-System1-MLX-4bit es una compilación cuantizada a 4 bits en formato MLX del modelo K2-Horizon-0.9B-System1, publicado por el usuario Lucasgitguy-co. Se trata de un ajuste fino (fine-tune) del modelo base IFM/K2-Horizon-0.9B, un modelo de 0,9B de parámetros con arquitectura de tipo Llama, orientado a generación de texto conversacional. La particularidad del ajuste "System 1" es que elimina el bloque de razonamiento extendido (think block) previo a la respuesta, de modo que el modelo contesta de forma directa en lugar de generar una cadena de pensamiento larga antes de responder.

El modelo original emplea una ventana de contexto de 8K tokens ampliada mediante YaRN RoPE con un factor de escala ×16, lo que permite extender el contexto efectivo más allá de los 8K originales. Esta versión MLX 4-bit está pensada para ejecutarse en hardware Apple Silicon a través de la librería mlx-lm, reduciendo el peso del repositorio a aproximadamente 0,6 GB. El modelo cuenta con 1.078.285.824 parámetros totales según los datos de safetensors.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y de licencia permisiva (Apache-2.0) para despliegues locales en Mac, con un modelo de menos de 1,1B de parámetros que prioriza la latencia de respuesta sobre el razonamiento explícito. No obstante, la información pública disponible es muy escasa: el repositorio no registra descargas ni interacciones, y la model card remite a la ficha del modelo base para resultados, método y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo "llama" en mlx-lm), con YaRN RoPE ×16 sobre contexto original de 8K |
| Parametros totales | 1.078.285.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K original, extendida mediante YaRN RoPE ×16 (longitud efectiva no especificada) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo Llama, tal y como indica la model card al señalar que "K2-Horizon-0.9B is Llama-shaped" y que la carpeta emplea el tipo de modelo `llama` de mlx-lm. Incorpora YaRN RoPE con un factor de escala ×16 partiendo de un contexto original de 8K tokens, una técnica de extensión de contexto basada en el escalado de las frecuencias rotacionales de posición. Esta compilación concreta es una cuantización a 4 bits del modelo K2-Horizon-0.9B-System1, que a su vez es un fine-tune "no-thinking" (System 1) del modelo IFM/K2-Horizon-0.9B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el ajuste. La model card indica que los resultados, el método y las limitaciones se detallan en la ficha del modelo principal (K2-Horizon-0.9B-System1), no en esta compilación cuantizada. Se menciona que las respuestas con decodificación greedy a 5 prompts de prueba coinciden con el modelo en bf16, aunque la versión 4-bit presenta ligeras variaciones en la redacción. El modelo admite un parámetro `reasoning_effort="high"` en `apply_chat_template` para conmutar al modo de razonamiento completo (thinking), lo que sugiere que la capacidad de razonamiento extendido se conserva pero está desactivada por defecto en este ajuste System 1.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat integrada (`apply_chat_template`).
- Respuesta directa sin bloque de razonamiento previo (modo "System 1"), orientada a baja latencia.
- Conmutación a modo de razonamiento completo mediante `reasoning_effort="high"` en la plantilla de chat.
- Razonamiento aritmético básico y resolución de operaciones simples (el ejemplo de la model card es "What is 17*23?").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades de visión o audio: no disponible.
- Capacidades especiales: modo thinking opcional (ver arriba); no se documentan otras.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en Apple Silicon mediante mlx-lm, gestionando conversaciones multi-turno con la plantilla de chat integrada y un peso de repositorio de ~0,6 GB, adecuado para prototipos y uso personal sin conexión.
- Respuestas de baja latencia en primer plano: al eliminar el bloque de pensamiento, el ajuste System 1 responde de inmediato, lo que lo hace apto para interfaces interactivas donde la latencia percibida es crítica (autocompletado, chat en tiempo real).
- Cálculo y razonamiento aritmético sencillo: el ejemplo oficial ("What is 17*23?") muestra su uso para resolver operaciones básicas en asistentes educativos o de apoyo a tareas cotidianas.
- Generación de texto en pipelines de prototipado: con licencia Apache-2.0 y formato MLX, puede integrarse en flujos de experimentación rápida en entornos de desarrollo sobre macOS sin restricciones de licencia comercial.
- Evaluación comparativa de cuantización: sirve como caso de estudio para medir la deriva de calidad entre bf16 y 4-bit en modelos pequeños, dado que la model card documenta la coincidencia de respuestas greedy frente al modelo original.
- Despliegue embebido en aplicaciones de escritorio para macOS: el tamaño reducido (menos de 1,1B de parámetros, 4-bit) permite empaquetar el modelo dentro de aplicaciones nativas que requieran generación de texto sin depender de servicios en la nube.
- Base para fine-tuning posterior: al ser un modelo pequeño y permisivo, puede servir como punto de partida para ajustes específicos de dominio en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta una comprobación cualitativa: las respuestas greedy a 5 prompts de prueba coinciden con el modelo en bf16, con ligeras variaciones de redacción en la versión 4-bit. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ningún otro benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.078.285.824 parámetros en 4-bit, el peso de los parámetros ronda los 0,54 GB (el repositorio ocupa ~0,6 GB), por lo que la memoria necesaria es del orden de 1-2 GB incluyendo overhead de runtime y caché KV.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (chips de la serie M); no se documentan requisitos para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? Sí, por tamaño; en el ecosistema Apple Silicon cabe en cualquier chip M-series con memoria unificada suficiente. Para GPU de consumo NVIDIA no se ofrece una ruta MLX nativa.
- Opciones de despliegue: mlx-lm (librería oficial indicada en la model card, con `mlx_lm.generate` y la API `load`/`generate`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este formato MLX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-0.9B-System1-MLX-4bit | 1,078B | 8K (YaRN ×16) | Apache-2.0 | MLX 4-bit (Apple Silicon) | Hugging Face, 0 descargas |
| K2-Horizon-0.9B-System1 (bf16) | 1,078B | 8K (YaRN ×16) | Apache-2.0 | safetensors bf16 | Hugging Face (modelo base del ajuste) |
| IFM/K2-Horizon-0.9B | 0,9B (aprox.) | 8K original | no disponible en la informacion | safetensors | Hugging Face (modelo original) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos ni con alternativas de otros fabricantes; la comparativa se limita a parámetros, contexto, licencia y disponibilidad. No se identifican en la información proporcionada modelos de terceros directamente comparables en tamaño y ecosistema MLX.

## Limitaciones y advertencias

- Deriva de cuantización: la propia model card reconoce que la versión 4-bit "drifts slightly in wording" respecto al modelo bf16, por lo que la calidad de redacción puede diferir del original.
- Idiomas no declarados: no se especifica qué lenguas soporta, lo que impide garantizar un rendimiento adecuado fuera del inglés (los ejemplos de la model card están en inglés).
- Contexto efectivo incierto: aunque se aplica YaRN RoPE ×16 sobre 8K, no se documenta la longitud de contexto efectiva resultante ni su calidad en los extremos.
- Información de entrenamiento ausente: se desconoce el dataset, el número de tokens y si hubo RLHF/DPO, lo que limita la evaluación de sesgos y alucinaciones.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; al ser un modelo de menos de 1,1B de parámetros, la fiabilidad factual es previsiblemente limitada, pero no se aportan datos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación con atribución; no obstante, conviene verificar la licencia del modelo base IFM/K2-Horizon-0.9B, que no se detalla en la información disponible.
- Ecosistema restringido: el formato MLX limita el despliegue a hardware Apple Silicon; no hay rutas documentadas para GPU NVIDIA u otros aceleradores.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Modo thinking opcional: el comportamiento por defecto es System 1 (sin razonamiento extendido), lo que puede degradar tareas que requieran cadenas de razonamiento complejas si no se activa `reasoning_effort="high"`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1-MLX-4bit
- Modelo base del ajuste (bf16): https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1
- Modelo original: https://huggingface.co/IFM/K2-Horizon-0.9B
- Librería mlx-lm: no se proporciona enlace directo en la información disponible (se instala vía `pip install mlx-lm`)
