# SirSahOl/Qwen2.5-3B-Instruct-chat-mlx-8bit

## Resumen

SirSahOl/Qwen2.5-3B-Instruct-chat-mlx-8bit es una conversión de pesos del modelo Qwen/Qwen2.5-3B-Instruct al formato MLX de Apple, cuantizada a 8 bits. No se trata de un modelo entrenado desde cero, sino de una conversión *weight-only*: la arquitectura, el tokenizador y el comportamiento conversacional son exactamente los del modelo original de Alibaba Qwen, mientras que los pesos se almacenan con precisión reducida para ejecutarse sobre la GPU unificada de los chips Apple Silicon mediante la librería MLX (mlx-lm 0.31.3).

El modelo cuenta con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones), un tamaño de repositorio de 3,3 GB y un pipeline declarado de generación de texto con orientación conversacional. Su relevancia es práctica: permite ejecutar un modelo instruct de la familia Qwen2.5 en portátiles y equipos de sobremesa con chip M1 o posterior y 8 GB de memoria unificada, sin necesidad de GPU dedicada ni de infraestructura en la nube, a costa de una pérdida de calidad pequeña pero no nula respecto a los pesos originales.

La ficha se publicó el 11 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 *likes*. Es, por tanto, un artefacto reciente y con poca validación comunitaria: conviene tratarlo como una conversión utilitaria para uso local en macOS, no como un modelo con garantías de soporte o mantenimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct; no se detalla en la información proporcionada) |
| Parámetros totales | 3.085.938.688 (≈3,09 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 8 bits *weight-only* (MLX); la model card menciona variantes de 4 y 16 bits, pero no enlaza ninguna |
| Idiomas soportados | No disponible |
| Licencia | other (hereda la licencia del modelo original) |
| Formato de pesos | safetensors en formato MLX |
| Framework de ejecución | MLX / mlx-lm 0.31.3 (solo Apple Silicon) |
| Tamaño del repositorio | 3,3 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

Al ser una conversión de pesos, este repositorio no aporta entrenamiento, *fine-tuning* ni alineación adicional: la model card indica explícitamente que "la arquitectura y el comportamiento se heredan del modelo fuente". El proceso consiste en cargar Qwen2.5-3B-Instruct y volver a serializar sus pesos en 8 bits mediante `python3 -m mlx_lm.convert --hf-path Qwen/Qwen2.5-3B-Instruct -q --q-bits 8`, una operación que, según la model card, tardó 28,79 segundos y produjo un artefacto de 3,1 GB. Por tanto, todo lo que se sabe sobre datos de entrenamiento, número de tokens, composición del corpus, fases de SFT, RLHF o DPO corresponde al modelo original de Qwen y no se documenta en esta ficha.

La innovación técnica aquí es exclusivamente de formato y despliegue: MLX es el framework de Apple para computación en silicio unificado, y su ruta de cuantización permite reducir a la mitad el espacio ocupado por los pesos respecto a 16 bits, manteniendo la práctica totalidad de la estructura del transformer. La cuantización es *weight-only*, es decir, solo afecta a los pesos almacenados y no a un esquema de cuantización de activaciones o de KV cache, lo que simplifica la conversión pero deja la puerta abierta a degradación en contextos largos.

## Capacidades

- Generación de texto conversacional multi-turno, con la plantilla de chat del modelo instruct original.
- Razonamiento, redacción, resumen y reescritura de texto en el rango de capacidad propio de un modelo de 3B parámetros.
- Generación y explicación de código, así como tareas básicas de matemáticas y lógica, dentro de las capacidades heredadas del modelo base.
- Ejecución local completa en Apple Silicon, sin envío de datos a servicios externos.
- Uso mediante CLI interactiva (`mlx_lm.chat`) o API de Python (`mlx_lm.generate`).
- *Tool calling*, capacidades de agente, *thinking mode*, visión o audio: no documentadas en la información proporcionada.
- Idiomas soportados: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede mantener diálogos multi-turno desde la terminal con `mlx_lm.chat`, sin conexión a internet, lo que resulta adecuado para entornos con requisitos de privacidad y para equipos M1 con 8 GB de memoria unificada.
- Prototipado rápido de aplicaciones de IA generativa: al ocupar 3,1 GB de pesos y cargarse con tres líneas de Python, sirve como banco de pruebas para validar prompts, plantillas de chat y flujos de generación antes de escalar a modelos mayores o a infraestructura con GPU.
- Procesamiento de texto *offline* por lotes: redacción de borradores, resúmenes de documentación interna o normalización de textos que no pueden salir de la máquina del usuario.
- Generación de código en el editor local: dado su tamaño, encaja en asistentes de autocompletado o de explicación de fragmentos ejecutados íntegramente en el portátil, con latencia controlada por el rendimiento medido (15,6 tokens/s en M1).
- Bot de soporte para documentación técnica propia: mediante *prompting* con extractos de manuales, se puede construir un asistente de preguntas frecuentes que no requiere GPU dedicada ni coste por token.
- Educación y experimentación: por su licencia heredada y su facilidad de ejecución, resulta útil en aulas o laboratorios para estudiar cuantización, formatos de pesos y el efecto de la precisión reducida sobre la calidad.
- Componente de *pipelines* de agentes locales: si el modelo base soporta *tool calling*, esta conversión puede integrarse en flujos de automatización en macOS, aunque dicha capacidad no está documentada en esta ficha y debe verificarse empíricamente.

## Benchmarks y rendimiento

La model card solo publica métricas de inferencia, no de calidad (no hay MMLU, HumanEval, GSM8K ni similares).

| Métrica | 8 bits |
|---|---|
| Tokens por segundo | 15,6 |
| TTFT (*time to first token*) | 64,4 ms |
| Memoria máxima | 85,0 MB |

Medición realizada en un Apple M1 con 8 GB de memoria unificada, promedio de 5 ejecuciones con un máximo de 256 tokens. El valor de "memoria máxima" de 85,0 MB resulta inconsistente con el tamaño de los pesos (3,3 GB) y probablemente se refiera a otra magnitud en la medición; no debe interpretarse como el consumo total del modelo en memoria.

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- Requisito de plataforma: Apple Silicon M1 o posterior. MLX no se ejecuta en GPU NVIDIA, AMD ni en CPU x86.
- Tamaño de pesos en 8 bits: ~3,1 GB (repositorio de 3,3 GB).
- Memoria unificada estimada para inferencia: del orden de 4-5 GB contando pesos, caché KV y *overhead* del runtime; la propia model card recomienda 8 bits para equipos con 16-32 GB y 4 bits para equipos de 8 GB.
- Cabe en GPU de consumo: no aplica en el sentido habitual; sí cabe en cualquier Mac con chip M1 o superior. En un M1 de 8 GB es funcional, aunque la model card sugiere 4 bits para ese caso.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, o API de Python `load`/`generate`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no consumen pesos en formato MLX.
- Rendimiento medido: 15,6 tokens/s y 64,4 ms hasta el primer token en M1 con 8 GB.
- Para otros entornos sería necesario reconvertir el modelo original a GGUF (llama.cpp/Ollama) o ejecutarlo en *float* con transformers, lo que multiplica los requisitos de memoria.

## Comparativa con modelos similares

| Modelo | Formato / bits | Tamaño de pesos | Framework | Memoria objetivo | Licencia |
|---|---|---|---|---|---|
| SirSahOl/Qwen2.5-3B-Instruct-chat-mlx-8bit | MLX / 8 bits | ~3,1 GB | mlx-lm | Apple Silicon, 16-32 GB recomendado | other (heredada) |
| Qwen/Qwen2.5-3B-Instruct (original) | safetensors / 16 bits | no disponible | transformers, vLLM, TGI | GPU con memoria suficiente; la model card sugiere 64 GB+ para 16 bits | según el modelo original (la conversión declara "other") |
| Conversión MLX a 4 bits (mencionada en la ficha) | MLX / 4 bits | no disponible | mlx-lm | Apple Silicon, 8 GB | no disponible (sin enlace publicado) |

La model card no ofrece comparación con alternativas de otras familias. Existen otros modelos instruct de la misma categoría de tamaño (en torno a 3-4B parámetros), pero no se dispone de datos de parámetros, contexto, rendimiento ni licencia en la información proporcionada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos: no documentados en la información proporcionada; el modelo hereda los del corpus de entrenamiento de Qwen2.5-3B-Instruct.
- Riesgo de alucinación: propio de un modelo de 3B parámetros; no se han publicado evaluaciones de veracidad en esta ficha.
- Contexto largo: la model card advierte de que el rendimiento puede degradarse con contextos muy largos (más de 8.000 tokens) en niveles de cuantización bajos.
- Pérdida de calidad: al ser una cuantización *weight-only* de 8 bits, existe una degradación pequeña pero real respecto a los pesos originales; la propia ficha señala que a menos bits, mayor pérdida.
- Dependencia de plataforma: requiere Apple Silicon (M1 o posterior). No se puede ejecutar en GPU NVIDIA ni en CPU x86 sin reconvertir el modelo.
- Licencia: la ficha declara "other" y remite a la del modelo original. Antes de un uso comercial es imprescindible revisar los términos de Qwen/Qwen2.5-3B-Instruct, ya que la conversión no concede por sí misma derechos adicionales.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta, sin validación externa conocida; el repositorio tiene una sola versión (v1.0) y un único autor.
- Idiomas no declarados: se desconoce qué lenguas están cubiertas explícitamente, un dato relevante si se pretende usar en castellano.
- Contexto máximo no declarado en la ficha de la conversión: conviene consultar la del modelo original antes de dimensionar aplicaciones con ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/Qwen2.5-3B-Instruct-chat-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Pipeline de conversión MLX Foundry, citado en la model card: https://github.com/SirSahOl/mlx-foundry
- Perfil del autor: https://huggingface.co/SirSahOl
- Papers, blogs o demos adicionales: no se han encontrado en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
