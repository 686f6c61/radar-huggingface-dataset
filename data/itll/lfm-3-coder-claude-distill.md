# ITLL/LFM-3-Coder-Claude-Distill

## Resumen

LFM-3-Coder-Claude-Distill es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario ITLL (la model card atribuye el trabajo a Schnuckade) y publicado bajo licencia Apache-2.0. El objetivo es reforzar las capacidades de razonamiento y generacion de codigo del modelo base mediante destilacion sobre trazas de razonamiento generadas por modelos Claude (Sonnet, Opus y Fable), de modo que un modelo de 1.700 millones de parametros imite el estilo de razonamiento paso a paso de modelos mucho mayores.

El modelo conserva la arquitectura del LFM3 de LiquidAI, con 1.728.801.536 parametros totales en pesos safetensors y un repositorio de 4,6 GB que incluye tanto pesos en precision completa (FP16/BF16) como cuantizaciones GGUF Q4_K_M para despliegue local. Esta pensado para entornos con recursos limitados: la model card reporta mas de 200 tokens por segundo en una RTX 4060.

Su relevancia actual reside en la combinacion de tamano reducido, licencia permisiva y un conjunto de datos de destilacion centrado en razonamiento y codigo, lo que lo hace candidato para asistentes de programacion locales, agentes ligeros y prototipado rapido sin depender de infraestructura de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean max_seq_length = 4096) |
| Tipos de cuantizacion | FP16/BF16 (safetensors) y GGUF Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parametros. La informacion disponible no detalla la configuracion interna de capas, atencion ni el mecanismo especifico de la familia LFM3, por lo que esos datos deben consultarse en la model card del modelo base. El ajuste fino se realizo con el framework Unsloth, orientado a entrenamiento eficiente en memoria, y los ejemplos de uso muestran carga en 4 bits con `load_in_4bit = True`.

El entrenamiento se basa en destilacion sobre trazas de razonamiento generadas por modelos Claude. Los datasets declarados incluyen TeichAI/Fable-5-Cursor-Traces, TeichAI/Claude-Sonnet-4.6-Reasoning-1100x, TeichAI/Claude-Opus-4.6-Reasoning-887x, TeichAI/claude-sonnet-4.5-high-reasoning-250x, angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, Roman1111111/claude-sonnet-4.6-120000x, Hastagaras/Claude-Sonnet-X-Opus-4.6-Reasoning-small-500, dalisoft/claude-opus-4.6-high-reasoning-700x y TeichAI/lordx64-claude-opus-4.7-max-cleaned. No se especifican el numero total de tokens de entrenamiento, la mezcla exacta ni si se aplicaron fases de RLHF o DPO; la informacion disponible solo indica que se buscaba imitar el estilo de razonamiento y respuesta de Sonnet, Opus y Fable.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento paso a paso orientado a problemas de codigo y logica.
- Generacion y explicacion de codigo, con enfasis en trazas de tipo Cursor y estilos de respuesta de Claude.
- Estilo de respuesta destilado de modelos Claude Sonnet, Opus y Fable.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el entrenamiento en trazas de razonamiento sugiere capacidad de cadena de pensamiento, pero sin garantias declaradas.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode formal): no disponibles.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y explicar fragmentos de codigo en ingles ejecutandose en una unica GPU de consumo, gracias a sus 1.700 millones de parametros y a la cuantizacion Q4_K_M incluida en el repositorio.
- Autocompletado y edicion en editores tipo Cursor: el ajuste se entreno parcialmente sobre trazas de Cursor, por lo que encaja en flujos de sugerencia de codigo dentro del editor con baja latencia (mas de 200 tokens/s en RTX 4060).
- Prototipado de agentes de razonamiento: util para validar pipelines de cadena de pensamiento y formato de respuestas estilo Claude antes de escalar a modelos mayores, dado su bajo coste de inferencia.
- Educacion y tutoria de programacion: puede desglosar problemas paso a paso en ingles, adecuado para entornos de aprendizaje con recursos limitados.
- Generacion de pruebas y documentacion tecnica: con contexto de hasta 4096 tokens en los ejemplos de uso, puede procesar funciones y modulos pequenos para producir tests o docstrings.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ser Apache-2.0 y caber en GPU de consumo, permite ejecucion totalmente local sin enviar codigo a servicios externos.
- Experimentacion en investigacion sobre destilacion: sirve como caso de estudio de hasta que punto un modelo de 1.7B puede aproximar el estilo de razonamiento de modelos frontier mediante datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento declarada es superior a 200 tokens por segundo en una RTX 4060, sin especificar cuantizacion ni configuracion de decodificacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB en FP16/BF16 para los 1.728.801.536 parametros; en torno a 1-1,5 GB con cuantizacion Q4_K_M (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 y 2 GB para Q4_K_M; el autor cita una RTX 4060 como referencia.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: transformers, Unsloth, llama.cpp y Ollama mediante los pesos GGUF; la model card incluye la etiqueta text-generation-inference, por lo que TGI es compatible en teoria, aunque no se documenta configuracion.
- Latencia y throughput: mas de 200 tokens/s en RTX 4060 segun el autor; sin datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ITLL/LFM-3-Coder-Claude-Distill | 1,73B | no disponible (ejemplos a 4096) | Apache-2.0 | Destilado de trazas Claude; GGUF Q4_K_M incluido |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | no disponible en esta ficha | Modelo base sin ajuste de razonamiento/codigo |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens (segun su model card publica) | Apache-2.0 | Referencia habitual en codigo de tamano similar; sin datos comparativos directos |
| DeepSeek-Coder-1.3B | 1,3B | 16.384 tokens (segun su model card publica) | DeepSeek License | Alternativa de codigo de tamano similar; licencia mas restrictiva |

No se dispone de comparaciones de rendimiento medidas entre estos modelos en la informacion proporcionada; la tabla recoge solo caracteristicas declaradas.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a modelos de 1,7B, especialmente en razonamiento largo y codigo complejo; el estilo imitado de Claude no implica capacidades equivalentes.
- La destilacion sobre trazas de modelos propietarios puede reproducir sesgos, formatos y errores de esos modelos, incluidos patrones de respuesta no verificados.
- No hay benchmarks publicados que respalden las mejoras frente al modelo base; las afirmaciones de la model card no estan cuantificadas.
- La longitud de contexto real no esta documentada; los ejemplos usan 4096 tokens, por lo que no debe asumirse una ventana mayor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones de los datasets de destilacion si se planea uso comercial a gran escala.
- No se documentan soporte de tool calling ni modo de razonamiento formal, lo que limita su uso en pipelines de agentes que dependan de esas funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/LFM-3-Coder-Claude-Distill
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Perfil del autor citado en la model card: https://huggingface.co/Schnuckade
- Framework de ajuste fino Unsloth: https://github.com/unslothai/unsloth
