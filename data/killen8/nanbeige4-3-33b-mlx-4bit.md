# killen8/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Nanbeige/Nanbeige4.3-33B, publicada por el usuario killen8. El modelo base lo desarrolla Nanbeige, y esta versión está específicamente orientada a ejecutar inferencia en Apple Silicon, con un tamaño en disco de 17 GB y un pico de memoria medido de 18,8 GB, lo que la hace viable en Macs con 32-48 GB de memoria unificada. La cuantización emplea grupo de tamaño 64 y aproximadamente 4,5 bits por peso.

El modelo es de tipo transformer con 33.118.977.024 parámetros totales (unos 33,1 mil millones), según los datos reales de los safetensors. La model card del autor de la conversión indica que sigue las recomendaciones de muestreo del modelo original y que el modelo "piensa por defecto", con la posibilidad de desactivar ese modo mediante `enable_thinking=False`. Está etiquetado como "agentic", lo que sugiere capacidades orientadas a flujos de agentes.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 33B en hardware de consumo de Apple sin GPU dedicada, a costa de una cuantización agresiva cuya calidad solo fue verificada mediante comprobaciones puntuales ("spot-checked only") y sin reejecutar los benchmarks del modelo original. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según tags "llama"; detalles no disponibles) |
| Parametros totales | 33.118.977.024 (~33,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX, group size 64, ~4,5 bits/peso; normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4-bit |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer y de los tags que lo asocian a la familia "llama". No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

Lo que sí está documentado es el proceso de cuantización de esta conversión: se aplicó un script de cuantización por shards en streaming, convirtiendo todos los pesos lineales 2-D y de embedding a 4 bits, manteniendo las capas de normalización en bf16. El autor advierte explícitamente que la calidad solo se comprobó con verificaciones puntuales y que los benchmarks citados corresponden al modelo original, no a esta versión cuantizada.

## Capacidades

- Generación de texto y razonamiento: el modelo incorpora un modo de "pensamiento" activado por defecto, desactivable con `enable_thinking=False`.
- Modo agéntico: la model card recomienda parámetros de muestreo específicos para uso agéntico (temperatura 1.0, top_p 0.95), lo que indica soporte previsto para flujos de agentes.
- Conversación y razonamiento general: parámetros recomendados de temperatura 0.6 y top_p 0.95 para chat y razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Razonamiento multi-paso: implícito en el modo de pensamiento y en el uso agéntico, aunque sin detalles técnicos publicados.

## Casos de uso

- Asistente de desarrollo local en Mac: ejecutar el modelo con mlx-lm en un Mac con 32-48 GB de memoria unificada permite tener un asistente de chat y razonamiento sin conexión a servicios en la nube, con un consumo de memoria de unos 18,8 GB.
- Prototipado de agentes en Apple Silicon: gracias a su orientación agéntica y a los parámetros de muestreo recomendados (temp 1.0, top_p 0.95), puede usarse para construir y depurar bucles de agentes con llamadas a herramientas en local antes de desplegar en producción.
- Razonamiento con modo de pensamiento para tareas analíticas: activando el modo por defecto, el modelo puede emplearse en resolución de problemas que requieren cadena de razonamiento, como análisis de textos técnicos o planificación de tareas.
- Generación de documentación y texto técnico: con temperatura 0.6 y top_p 0.95, es adecuado para redactar borradores, resúmenes y explicaciones en un entorno de escritorio sin dependencia de red.
- Evaluación comparativa de cuantizaciones: al ser una conversión 4-bit de un modelo de 33B, sirve para medir la degradación de calidad frente al modelo original en tareas concretas del usuario, dado que el autor no reejecutó benchmarks.
- Experimentación académica con modelos de ~33B: investigadores con hardware Apple pueden reproducir experimentos de razonamiento y agentes a un coste de infraestructura muy bajo, aceptando la advertencia de que la calidad de la cuantización solo fue verificada puntualmente.
- Inferencia privada y sensible: al ejecutarse íntegramente en local, es apto para procesar datos que no deben salir del dispositivo, siempre que se asuma la licencia Apache 2.0 y las limitaciones de calidad de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de esta conversión cuantizada en la información disponible. El autor indica explícitamente que los benchmarks son los del modelo original y que no se reejecutaron sobre esta cuantización.

Los únicos datos de rendimiento medidos son de inferencia en un M4 Pro con 48 GB usando mlx-lm 0.29.1:

| Metrica | Valor |
|---|---|
| Tamano en disco | 17 GB |
| Pico de memoria | 18,8 GB |
| Velocidad de generacion | ~13,7 tok/s |
| Hardware de medida | Apple M4 Pro, 48 GB |

## Requisitos de hardware

- VRAM/memoria estimada: pico medido de 18,8 GB en la configuración de referencia; el autor indica que está dimensionado para Macs con 32-48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M4 Pro con 48 GB como referencia medida); no se documentan requisitos para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No aplica en el sentido habitual: está pensado para memoria unificada de Apple Silicon, no para GPUs discretas. No hay datos de ejecución en RTX 4090 u otras.
- Opciones de despliegue: mlx-lm (versión 0.29.1 en la medición), mediante `mlx_lm generate`. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato MLX.
- Latencia y throughput: ~13,7 tokens/s de generación en M4 Pro de 48 GB; no se proporcionan datos de latencia de primer token ni de throughput en prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit (esta ficha) | ~33,1B | no disponible | MLX 4-bit safetensors | Apache 2.0 | Conversión para Apple Silicon, ~13,7 tok/s en M4 Pro |
| Nanbeige/Nanbeige4.3-33B (modelo base) | ~33,1B | no disponible | safetensors (bf16 presumiblemente) | Apache 2.0 | Referencia de calidad; benchmarks no reejecutados en la cuantización |
| Alternativas de ~30-35B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en cuanto a rendimiento medido.

## Limitaciones y advertencias

- Calidad de la cuantización no validada a fondo: el autor indica que la calidad solo se comprobó con verificaciones puntuales; los benchmarks citados son del modelo original y no de esta conversión.
- Riesgo de degradación por cuantización 4-bit: con ~4,5 bits por peso y grupo de 64, es esperable cierta pérdida de precisión en tareas sensibles, aunque no se cuantifica en la información disponible.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo del modelo base ni de la conversión.
- Riesgo de alucinación: no cuantificado; al ser un modelo generativo con modo de pensamiento, aplican las advertencias habituales, sin datos específicos publicados.
- Limitaciones de contexto e idioma: no se dispone de la longitud de contexto ni de la lista de idiomas soportados.
- Restricciones de licencia: Apache 2.0, heredada del modelo base, permite uso comercial con las obligaciones habituales de atribución y aviso de licencia; no se documentan restricciones adicionales.
- Dependencia de hardware Apple: el formato MLX limita su uso a Apple Silicon; no es directamente desplegable en GPUs NVIDIA sin reconversión.
- Madurez del repositorio: 119 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- Ausencia de datos de pipeline, idiomas y contexto: la model card no cubre estos aspectos, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/killen8/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Librería mlx-lm: no se proporciona enlace en la información disponible
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
