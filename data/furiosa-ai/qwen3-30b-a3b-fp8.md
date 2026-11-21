# furiosa-ai/Qwen3-30B-A3B-FP8

## Resumen

Qwen3-30B-A3B-FP8 es la versión cuantizada en FP8 del modelo Qwen3-30B-A3B desarrollado por el equipo Qwen de Alibaba. Se trata de un transformer autorregresivo con arquitectura de mezcla de expertos (MoE) que cuenta con 30.532 millones de parámetros totales, de los cuales aproximadamente 3.300 millones se activan por token. Es un modelo híbrido de razonamiento que soporta modos "thinking" y "non-thinking" conmutables por petición, orientado a generación de texto, seguimiento de instrucciones, razonamiento y uso de herramientas.

El repositorio publicado por furiosa-ai no es un modelo nuevo, sino un empaquetado del modelo upstream de Qwen junto con un Furiosa Executable Bundle (FXB) que permite ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. El mismo conjunto de pesos puede ejecutarse en otros frameworks como vLLM, SGLang o Transformers, por lo que la ficha cubre tanto el modelo base como su distribución específica para hardware FuriosaAI.

Su relevancia radica en que combina una arquitectura MoE eficiente en cómputo (solo ~3,3B parámetros activos por token) con cuantización FP8 estática de pesos y cuantización dinámica de activaciones, lo que reduce los requisitos de memoria y facilita el despliegue en aceleradores especializados manteniendo una licencia permisiva Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (transformer autorregresivo con mezcla de expertos) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | ~3,3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estática en pesos, FP8 dinámica en activaciones (per-token/per-block); KV cache en 16 bits |
| Idiomas soportados | no disponible (la model card menciona cobertura multilingüe sin detallar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 49,1 GB), con bundle FXB para FuriosaAI RNGD |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-MoE, un transformer autorregresivo con capas de mezcla de expertos en las que cada token activa un subconjunto de parámetros (~3,3B de 30,5B totales). Esta dispersión reduce el coste computacional por token frente a un modelo denso del mismo tamaño, manteniendo una capacidad de representación elevada. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información corresponde al modelo upstream de Qwen y no se reproduce en este repositorio.

La innovación técnica principal de esta distribución es la cuantización: los pesos se almacenan en FP8 estático siguiendo la release FP8 de Qwen, mientras que las activaciones se cuantizan dinámicamente en tiempo de ejecución con granularidad per-token y per-block, y la caché KV se mantiene en 16 bits. Sobre hardware RNGD, el modelo se ejecuta con un tamaño de paralelismo tensorial de 32 PEs, lo que corresponde a cuatro tarjetas RNGD (8 PEs por tarjeta). El modelo soporta además un modo de razonamiento híbrido conmutable por petición mediante el parámetro `enable_thinking`.

## Capacidades

- Generación de texto y razonamiento: modelo híbrido con modo "thinking" activado por defecto y desactivable por petición.
- Seguimiento de instrucciones y conversación multi-turno.
- Razonamiento matemático y lógico dentro del modo thinking.
- Generación de código (capacidad heredada del modelo Qwen3 base; no se detallan métricas específicas en la información disponible).
- Tool calling / function calling mediante el parser `hermes`, con `--enable-auto-tool-choice` en el servidor.
- Separación del razonamiento en un campo `reasoning` independiente de la respuesta final (convención compatible con OpenAI Agents SDK y vLLM).
- Cobertura multilingüe (mencionada en la model card, sin listado de idiomas).
- API compatible con OpenAI para chat completions.
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional con razonamiento explícito: el modo thinking permite obtener la cadena de razonamiento en un campo separado, útil para depurar respuestas o para aplicaciones que necesitan auditar el proceso de decisión antes de mostrar la respuesta final al usuario.
- Agentes con tool calling: con el parser `hermes` y `--enable-auto-tool-choice`, el modelo puede decidir cuándo invocar funciones externas, integrándose en pipelines de agentes que consultan APIs, bases de datos o servicios internos.
- Generación de código en entornos de desarrollo: el modelo puede integrarse en asistentes de código o revisiones automatizadas, aprovechando su capacidad de seguir instrucciones y su modo de razonamiento para tareas de refactorización o explicación de fragmentos.
- Atención al cliente automatizada: la arquitectura MoE con ~3,3B parámetros activos permite servir conversaciones multi-turno con un coste computacional contenido por token, adecuado para despliegues con alta concurrencia.
- Procesamiento de documentación técnica: el modelo puede resumir, extraer información y responder preguntas sobre documentación, con la ventaja de que el modo non-thinking reduce latencia cuando no se requiere razonamiento profundo.
- Despliegue sobre aceleradores FuriosaAI RNGD: el bundle FXB permite ejecutar el modelo en cuatro tarjetas RNGD con paralelismo tensorial de 32 PEs, orientado a entornos que ya operan hardware FuriosaAI y buscan una alternativa a GPU.
- Evaluación comparativa de cuantización FP8: investigadores pueden usar esta release para medir el impacto de la cuantización FP8 (pesos estáticos, activaciones dinámicas) frente al modelo en BF16 en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo de safetensors ocupa 49,1 GB, coherente con pesos en FP8 para 30,5B parámetros. La caché KV en 16 bits añade memoria adicional según la longitud de contexto, que no se especifica.
- Hardware objetivo principal: FuriosaAI RNGD, con despliegue en cuatro tarjetas (paralelismo tensorial de 32 PEs, 8 PEs por tarjeta).
- GPU consumer: no se dispone de datos oficiales sobre ejecución en GPU consumer; el tamaño de 49,1 GB en FP8 excede la VRAM de la mayoría de tarjetas consumer individuales, por lo que requeriría múltiples GPU o cuantizaciones adicionales no incluidas en este repositorio.
- Frameworks de despliegue: Furiosa-LLM (objetivo de este repo), y según la model card también vLLM, SGLang y Transformers usando el modelo upstream Qwen/Qwen3-30B-A3B-FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-30B-A3B-FP8 (este repo, empaquetado FuriosaAI) | 30,5B / ~3,3B | no disponible | Apache 2.0 | Hugging Face, hardware RNGD |
| Qwen/Qwen3-30B-A3B-FP8 (upstream) | 30,5B / ~3,3B | no disponible | Apache 2.0 | Hugging Face, vLLM/SGLang/Transformers |
| Qwen3-30B-A3B (BF16, upstream) | 30,5B / ~3,3B | no disponible | Apache 2.0 | Hugging Face |
| Otros modelos MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del propio Qwen3-30B-A3B porque la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros fabricantes.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks en la información disponible, por lo que no es posible verificar el rendimiento real frente al modelo en BF16 ni frente a alternativas.
- La cuantización FP8 puede introducir degradación en tareas sensibles a la precisión numérica; no se documenta en la model card el impacto medido.
- La longitud de contexto no está especificada en la información disponible, lo que impide planificar despliegues con ventanas largas sin consultar la model card upstream.
- El listado de idiomas soportados no está detallado; la cobertura multilingüe se menciona de forma genérica.
- Riesgo de alucinación inherente a los modelos generativos; el modo thinking no elimina este riesgo y puede producir cadenas de razonamiento plausibles pero incorrectas.
- Sesgos conocidos: no documentados en la información disponible; deben asumirse los del modelo base Qwen3.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia upstream de Qwen en el enlace indicado.
- El bundle FXB está diseñado específicamente para hardware FuriosaAI RNGD; fuera de ese hardware debe usarse el modelo upstream con otros frameworks.
- El campo `reasoning` no forma parte de la especificación oficial de la API de OpenAI; los clientes que no lo soporten deben leer únicamente `message.content`.
- El repositorio tiene 0 likes y 957 descargas en el momento de la consulta, lo que sugiere una adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-30B-A3B-FP8
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
