# FluidVoice-Labs/Qwen3.5-9B-4bit

## Resumen

FluidVoice-Labs/Qwen3.5-9B-4bit es una compilación cuantizada a 4 bits del modelo Qwen/Qwen3.5-9B, publicada por FluidVoice-Labs y empaquetada específicamente para su uso dentro de la plataforma Fluid Intelligence. No se trata de un ajuste fino (fine-tuning) ni de un modelo nuevo: el autor indica explícitamente que es una versión modificada del modelo base y que puede no funcionar con otras herramientas ni para uso general. Incluye el drafter z-lab/Qwen3.5-9B-DFlash, lo que apunta a un esquema de decodificación especulativa para acelerar la generación.

El modelo base, Qwen3.5-9B, es el mayor de los cuatro modelos densos pequeños de la familia Qwen3.5 de Alibaba, con arquitectura transformer densa nativamente multimodal (visión-lenguaje), modo de razonamiento (thinking) activado por defecto, una ventana de contexto de 262.000 tokens extensible a 1 millón mediante YaRN y cobertura de 201 idiomas. Se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado documenta una build de cuantización concreta con muy poca tracción (6 descargas, 0 likes en el momento de la consulta); por otro, sirve como referencia de los requisitos y limitaciones de desplegar un modelo denso de ~11.000 millones de parámetros en 4 bits, un formato que cabe en GPU de consumo con 12 GB o más.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), derivado de Qwen3.5-9B; modo thinking por defecto |
| Parametros totales | 11.042.625.536 (según safetensors del repo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens en el modelo base, extensible a 1.000.000 con YaRN (dato del modelo base, no confirmado para esta build) |
| Tipos de cuantizacion | 4 bits (esquema concreto no disponible) |
| Idiomas soportados | 201 idiomas según la información del modelo base; la model card de esta build no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 bits); tamaño de repo 6,2 GB, incluye el drafter z-lab/Qwen3.5-9B-DFlash |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B: un transformer denso, nativamente multimodal, con modo de razonamiento explícito activado por defecto y una ventana de contexto nativa de 262.000 tokens que puede extenderse hasta 1 millón mediante YaRN. Esta build no introduce cambios de arquitectura por parte del publicador: FluidVoice-Labs aplica una cuantización de 4 bits sobre los pesos del modelo base y añade el drafter DFlash, un modelo auxiliar pensado para decodificación especulativa, técnica que consiste en que un modelo pequeño propone varios tokens que el modelo grande verifica en un solo paso hacia delante, reduciendo la latencia de generación.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) empleadas en Qwen3.5-9B en la documentación proporcionada. Tampoco se documenta el método exacto de cuantización (por ejemplo, si es GPTQ, AWQ, bitsandbytes NF4 o un esquema propio), ni si se han realizado calibraciones posteriores. El autor indica explícitamente que el modelo no ha sido ajustado y que el empaquetado está orientado a un runtime concreto, por lo que la reproducibilidad fuera de ese entorno no está garantizada.

## Capacidades

- Generación de texto y razonamiento: hereda el modo thinking del modelo base, orientado a tareas de razonamiento multi-paso.
- Capacidades multimodales: el modelo base Qwen3.5-9B es nativamente visión-lenguaje, por lo que se presupone entrada de imagen además de texto; no se confirma en la model card de esta build.
- Cobertura multilingüe amplia: 201 idiomas según la documentación del modelo base.
- Contexto largo: hasta 262.000 tokens de forma nativa y 1 millón con YaRN, adecuado para documentos extensos y conversaciones largas.
- Decodificación especulativa: integra el drafter z-lab/Qwen3.5-9B-DFlash para reducir la latencia por token.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita, aunque el modo thinking del modelo base apunta en esa dirección.
- Capacidades especiales: modo de pensamiento (thinking) activado por defecto en el modelo base.

Advertencia del propio autor: al ser una build modificada y orientada a Fluid Intelligence, es posible que no funcione correctamente con otras herramientas o para uso general.

## Casos de uso

- Uso interno dentro de Fluid Intelligence: es el caso de uso declarado por el publicador; el modelo está empaquetado junto a su drafter para integrarse en ese runtime concreto.
- Procesamiento de documentos largos en local: con una ventana de hasta 262.000 tokens, permite resumir o extraer información de contratos, informes o expedientes completos sin fragmentación agresiva, siempre que se despliegue en una GPU con VRAM suficiente para la caché KV.
- Asistentes conversacionales de contexto extenso: conversaciones multi-turno que mantienen historial largo sin pérdida de contexto, útil en atención al cliente interna o soporte técnico.
- Prototipado de aplicaciones multimodales: al heredar la naturaleza visión-lenguaje del modelo base, permite experimentar con descripción de imágenes, extracción de información de capturas o documentos escaneados.
- Investigación sobre cuantización y decodificación especulativa: la combinación de pesos en 4 bits más un drafter DFlash lo convierte en un banco de pruebas para medir el equilibrio entre compresión, latencia y calidad frente al modelo original en precisión completa.
- Despliegue en hardware de gama media para pruebas de concepto: al ocupar aproximadamente 6 GB de pesos, puede ejecutarse en GPU de consumo para validar viabilidad antes de escalar a infraestructura mayor.
- Evaluación comparativa de builds de terceros: útil para equipos que analizan la fiabilidad de cuantizaciones no oficiales antes de adoptarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta build en la información disponible. El publicador no incluye ninguna tabla de evaluación en la model card.

Como referencia del modelo base, un análisis de terceros (benchable.ai) atribuye a Qwen3.5-9B una tasa de éxito del 83% en su conjunto de pruebas y sitúa su velocidad en el percentil 10, es decir, con tiempos de respuesta más largos que la media de modelos comparables. Estos datos corresponden al modelo original, no a esta cuantización, y no emplean métricas estándar como MMLU, HumanEval o GSM8K, por lo que no deben extrapolarse a esta build.

| Benchmark | Esta build | Qwen3.5-9B (base) | Notas |
|---|---|---|---|
| MMLU | No disponible | No disponible | Sin datos publicados |
| HumanEval | No disponible | No disponible | Sin datos publicados |
| GSM8K | No disponible | No disponible | Sin datos publicados |
| Tasa de éxito agregada (benchable.ai) | No disponible | 83% | Métrica propia del evaluador, no estándar |
| Percentil de velocidad (benchable.ai) | No disponible | Percentil 10 | Indica latencia superior a la media |

## Requisitos de hardware

- VRAM estimada de pesos: aproximadamente 5,5 a 6,2 GB para los parámetros en 4 bits, más el espacio del drafter incluido en el repo de 6,2 GB.
- VRAM total recomendada: del orden de 8 a 10 GB con contextos cortos, y bastante más con contextos largos, ya que la caché KV crece de forma lineal con el número de tokens. El tamaño exacto de la caché KV no está disponible (depende del número de capas, cabezas y dimensiones del modelo base).
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM, como RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080 o RTX 4090. En tarjetas de 8 GB es probable que solo funcione con contextos muy reducidos.
- GPU profesionales recomendadas: A100, H100 o L40S para contextos largos, concurrencia alta o despliegue multiusuario.
- Opciones de despliegue: no disponible. Al publicarse únicamente en safetensors con cuantización de 4 bits y estar empaquetado para Fluid Intelligence, no se confirma compatibilidad con vLLM, TGI, llama.cpp, Ollama o LM Studio, y no se distribuyen versiones GGUF ni MLX.
- Latencia y throughput: no disponibles para esta build. Un análisis de terceros sitúa al modelo base en el percentil 10 de velocidad, lo que sugiere tiempos de respuesta por encima de la media, parcialmente compensados por la decodificación especulativa del drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| FluidVoice-Labs/Qwen3.5-9B-4bit | 11.042.625.536 (4 bits) | 262K (1M con YaRN, según base) | Texto (multimodal según base) | Apache 2.0 | safetensors 4 bits | HuggingFace, 6 descargas |
| Qwen/Qwen3.5-9B | 9B nominales (no confirmado en safetensors) | 262K (1M con YaRN) | Visión-lenguaje | Apache 2.0 | safetensors | HuggingFace, modelo oficial |
| Microsoft-Decision-1 | Basado en Qwen3.5-9B | No disponible | Texto, scoring de decisiones | No disponible | No disponible | No disponible |
| z-lab/Qwen3.5-9B-DFlash | Drafter auxiliar | No disponible | Texto | Apache 2.0 (según el publicador) | No disponible | HuggingFace |

La comparación significativa es contra el modelo base en precisión completa: esta build reduce el espacio de pesos a aproximadamente 6 GB a cambio de una pérdida de calidad no cuantificada públicamente y de una compatibilidad de runtime restringida. Microsoft-Decision-1 demuestra que existen derivados especializados de Qwen3.5-9B orientados a tareas concretas (scoring de decisiones con probabilidades calibradas, 85 ms de latencia p50), pero no es un sustituto funcional de un modelo de propósito general.

## Limitaciones y advertencias

- Empaquetado propietario de facto: el autor advierte que puede no funcionar con otras herramientas ni para uso general. Está pensado para Fluid Intelligence, no como artefacto de propósito general.
- Sin datos de calidad: no hay benchmarks publicados que cuantifiquen la degradación frente al modelo base en precisión completa; se desconoce el impacto real de la cuantización de 4 bits.
- Tracción mínima: 6 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación para esta build.
- Sesgos: no documentados. El modelo base no publica una evaluación de sesgos en la información disponible.
- Idiomas: aunque el modelo base declara 201 idiomas, la model card de esta build no especifica idiomas soportados ni calidad por idioma; el rendimiento en lenguas distintas del inglés y el chino no está verificado.
- Contexto: la extensión a 1 millón de tokens con YaRN corresponde al modelo base y no está confirmada para esta cuantización; además, contextos largos incrementan la caché KV y, con ella, la VRAM necesaria.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que los términos del modelo base y del drafter sean coherentes con la cadena de redistribución. El publicador afirma que la licencia coincide con la de los modelos de origen.
- Producción: la falta de soporte confirmado en servidores de inferencia estándar (vLLM, TGI) y la ausencia de versiones GGUF dificultan su integración en pipelines convencionales.
- Fecha: el repositorio se creó y actualizó el 13 de octubre de 2026, sin historial de mantenimiento posterior en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidVoice-Labs/Qwen3.5-9B-4bit
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Drafter z-lab/Qwen3.5-9B-DFlash: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash
- Ficha del modelo base en Modal: https://modal.com/library/qwen/qwen3-5-9b
- Análisis de rendimiento del modelo base en benchable.ai: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Especificaciones y VRAM del modelo base en apxml: https://apxml.com/models/qwen35-9b
- Artículo sobre Microsoft-Decision-1 (derivado de Qwen3.5-9B): https://www.marktechpost.com/2026/10/09/microsoft-ai-releases-microsoft-decision-1-a-qwen3-5-9b-decision-scoring-model/
