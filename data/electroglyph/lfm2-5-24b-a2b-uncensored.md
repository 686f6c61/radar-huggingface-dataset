# electroglyph/LFM2.5-24B-A2B-uncensored

## Resumen

`electroglyph/LFM2.5-24B-A2B-uncensored` es una versión «decensored» (ablacionada) del modelo `LiquidAI/LFM2.5-24B-A2B`, un modelo de razonamiento y agentes desarrollado por Liquid AI. El autor del derivado es el usuario de HuggingFace `electroglyph`, que ha aplicado la herramienta Heretic v2.0.0.dev0 mediante una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 7 a 40 del modelo original. El objetivo es eliminar el comportamiento de rechazo (refusals) sin reentrenar: según la model card, los rechazos bajan de 99/100 en el modelo original a 4/100 en esta versión, con una divergencia KL de 0,0899 respecto al checkpoint base.

El modelo subyacente es una mezcla de expertos (MoE) de 24.000 millones de parámetros totales y unos 2,45B activos por token, pensada para inferencia rápida en dispositivo. Combina 30 bloques de convolución corta de doble compuerta con 10 bloques de atención GQA (Grouped-Query Attention) en 40 capas, con 64 expertos por bloque y enrutamiento top-4. El contexto declarado es de 131.072 tokens y el vocabulario de 128.000 entradas, con soporte para 16 idiomas.

La relevancia de esta ficha es doble: por un lado documenta un derivado de bajo uso (15 descargas, 0 likes en el momento de la consulta) que ilustra una práctica creciente de ablación reproducible; por otro, permite evaluar con rigor qué se gana y qué se pierde al eliminar los filtros de seguridad de un modelo orientado a agentes con llamadas a herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 40 capas (30 bloques de convolución corta de doble compuerta + 10 bloques GQA) |
| Parametros totales | 23.971.585.280 (~24,0B) según safetensors |
| Parametros activos | ~2,45B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Pesos nativos en BF16; el modelo base ofrece variantes FP8, GGUF, ONNX y MLX-4bit. No se publican cuantizaciones GGUF propias de esta versión ablacionada |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco |
| Licencia | lfm1.0 (identificador `other` en HuggingFace) |
| Formato de pesos | safetensors (librería `transformers`, arquitectura `lfm2_moe`) |
| Expertos por bloque MoE | 64, enrutamiento top-4 |
| Vocabulario | 128.000 tokens |
| Presupuesto de entrenamiento (modelo base) | 36 billones de tokens |
| Tamaño del repositorio | 48,0 GB |
| Parámetros de generación recomendados | temperature 0,1; top_k 50; repetition_penalty 1,05 |
| Modalidad | Solo texto |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida denominada `lfm2_moe`. De las 40 capas totales, 30 son bloques de convolución corta con doble compuerta y 10 son bloques de atención GQA; esta combinación busca reducir el coste de atención en contextos largos manteniendo capacidad de modelado local. Cada bloque MoE contiene 64 expertos con enrutamiento top-4, lo que explica la relación entre parámetros totales (24B) y activos (2,45B). El modelo base se entrenó con un presupuesto de 36 billones de tokens según la model card de Liquid AI; no se detalla la composición del dataset ni si hubo fases de RLHF o DPO específicas, y esa información no está disponible en el material consultado.

Sobre el checkpoint base, este derivado aplica Heretic v2.0.0.dev0 con ablación de rango arbitrario entre las capas 7 y 40. Los hiperparámetros publicados son: `start_layer_index` 7, `end_layer_index` 40, `preserve_good_behavior_weight` 0,8624, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 1,0094 y `neighbor_count` 2. El autor indica que el proceso es reproducible y adjunta instrucciones en el directorio `reproduce/` del repositorio. La innovación técnica destacable no está en la arquitectura, que es la del modelo original, sino en el método de ablación: modifica direcciones en el espacio de activaciones para suprimir el comportamiento de rechazo minimizando el daño colateral, cuantificado aquí como una divergencia KL de 0,0899 frente al original.

## Capacidades

- Generación de texto y razonamiento: el modelo base «siempre piensa antes de responder», según la model card, con modo de razonamiento previo a la respuesta final.
- Llamadas a herramientas (tool calling / function calling): el modelo base está post-entrenado específicamente para cargas de trabajo agénticas.
- Razonamiento multi-paso y uso de agentes: puntuación de 48,09 en LiveClaw en el modelo base, frente a 38,19 de Qwen3.6-35B-A3B.
- Multilingüismo: 16 idiomas declarados, incluidos español, portugués, francés, alemán, árabe, chino, japonés, coreano, hindi y ruso.
- Contexto largo: 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Supresión de rechazos: reducción declarada de 99/100 a 4/100 en una prueba de 100 peticiones, lo que habilita respuestas sobre temas que el modelo original rechazaría.
- No soporta visión, audio ni otras modalidades: es un modelo exclusivamente de texto.

## Casos de uso

- Investigación sobre alineación y seguridad: este derivado permite estudiar empíricamente qué comportamientos cambian al aplicar una ablación ARA, usando la divergencia KL publicada (0,0899) y la tasa de rechazos como métricas de referencia en experimentos controlados.
- Redacción creativa y ficción sin restricciones temáticas: para guiones, narrativa o contenido de ficción que aborde violencia, temas adultos o conflictos morales, donde un modelo con filtros agresivos interrumpiría la generación. El contexto de 131.072 tokens permite mantener arcos narrativos largos coherentes.
- Agentes autónomos de automatización interna: con soporte de tool calling y 2,45B de parámetros activos, es viable desplegarlo en pipelines de agentes que encadenan búsquedas, ejecución de código y escritura de ficheros, con coste por token bajo.
- Asistencia a la investigación en dominios sensibles (seguridad ofensiva, toxicología, análisis de malware): escenarios donde el modelo base rechazaría la consulta y el derivado puede responder con fines defensivos o académicos, siempre bajo revisión humana.
- Procesamiento de documentación legal o médica en varios idiomas: los 16 idiomas y el contexto largo permiten resumir expedientes multilingües o extraer cláusulas de contratos extensos en una sola pasada.
- Generación de datos sintéticos para fine-tuning: al no rechazar instrucciones incómodas, sirve para producir datasets de entrenamiento diversos que luego se filtran y etiquetan; la naturaleza reproducible del proceso facilita documentar la procedencia.
- Despliegue en dispositivo (edge): el modelo base reporta 184 tok/s en un Apple M5 Max, lo que hace viable esta variante en estaciones de trabajo locales para tareas de asistente privado sin conexión.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados para este derivado son las métricas de ablación. Las cifras de capacidades corresponden al modelo base (`LiquidAI/LFM2.5-24B-A2B`) y se incluyen como referencia, no como medición de esta versión.

| Metrica | Este modelo | Modelo original (LFM2.5-24B-A2B) |
|---|---|---|
| Rechazos (de 100 peticiones) | 4/100 | 99/100 |
| Divergencia KL | 0,0899 | 0 (por definición) |

| Metrica (modelo base) | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw (tareas agenticas) | 48,09 | 38,19 |
| Throughput en Apple M5 Max | 184 tok/s | no disponible |
| Throughput en NVIDIA B300 | hasta 21.000 tok/s de salida | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar en la información disponible para este derivado. Tampoco se ha publicado una medición de rendimiento del modelo ablacionado en tareas de razonamiento o código, por lo que se desconoce la degradación real asociada a la ablación.

## Requisitos de hardware

- VRAM en BF16: en torno a 48 GB solo para pesos (el repositorio ocupa 48,0 GB), más overhead de caché KV para 131.072 tokens. Requiere GPU de 80 GB (A100, H100, B300) o reparto en varias GPU.
- VRAM en FP8: aproximadamente 24 GB de pesos. Ajusta al límite en una RTX 4090 de 24 GB, pero sin margen para contexto largo; es más realista usar L40S, A6000 Ada (48 GB) o A100.
- VRAM en cuantización de 4 bits: del orden de 13-14 GB de pesos, lo que sí cabe con holgura en una RTX 4090, RTX 4080 de 16 GB, RTX 5080 o en Apple Silicon con 24 GB o más de memoria unificada. Estas cifras son estimaciones derivadas del tamaño de los pesos, no mediciones publicadas para este derivado.
- Cabe en GPU de consumo: sí, en el rango de 16-24 GB si se usa cuantización de 4 bits; en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: Transformers (formato nativo), vLLM y SGLang son los recomendados por el autor del modelo base; llama.cpp y Ollama a través de las cuantizaciones GGUF del modelo base (no se publican GGUF de esta variante ablacionada); ONNX Runtime para despliegue multiplataforma; MLX en Apple Silicon. Está anunciado un modelo draft DSpark para decodificación especulativa con SGLang, aún no disponible.
- Latencia y throughput: el modelo base declara 184 tok/s en un Apple M5 Max y hasta 21.000 tok/s de salida en una sola NVIDIA B300, además de ser hasta 1,7 veces más rápido que MoEs comparables en dispositivo. No hay mediciones publicadas para esta variante ablacionada; la ablación no altera la arquitectura, por lo que el coste computacional por token debería mantenerse, aunque esto no está verificado.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| electroglyph/LFM2.5-24B-A2B-uncensored | 24,0B / 2,45B | 131.072 | lfm1.0 | Derivado ablacionado; 4/100 rechazos; KL 0,0899; 15 descargas; sin benchmarks estándar publicados |
| LiquidAI/LFM2.5-24B-A2B | 24,0B / 2,45B | 131.072 | lfm1.0 | Modelo original; 99/100 rechazos; LiveClaw 48,09; variantes FP8, GGUF, ONNX y MLX-4bit publicadas |
| Qwen3.6-35B-A3B | ~35B / ~3B | no disponible en la información consultada | no disponible en la información consultada | Referencia de la model card: LiveClaw 38,19; alrededor de un 50% más de parámetros totales y activos |
| LFM2.5-230M | 230M | no disponible en la información consultada | lfm1.0 | Miembro pequeño de la familia LFM2.5, citado solo como referencia de rango |

La comparación directa más informativa es contra el modelo original: misma arquitectura, mismo contexto y misma licencia, con la diferencia concentrada en la tasa de rechazo y en una divergencia KL de 0,0899. Frente a Qwen3.6-35B-A3B, el modelo base declara mejor rendimiento agéntico con aproximadamente la mitad de parámetros, aunque no se dispone de datos del derivado ablacionado en esa prueba.

## Limitaciones y advertencias

- Eliminación deliberada de filtros de seguridad: la tasa de rechazo cae del 99% al 4% en la muestra publicada. El modelo responderá a peticiones sobre las que el original se negaría, incluidas potencialmente instrucciones dañinas, ilegales o inseguras. No es apto para aplicaciones de cara al público sin capas de moderación externas.
- Sin evaluación de degradación: no se han publicado benchmarks de razonamiento, código o matemáticas para esta variante. La divergencia KL de 0,0899 indica un cambio medible en la distribución de salida, pero no cuantifica cuánto se ha deteriorado la capacidad del modelo. La ablación puede afectar a la coherencia en tareas largas.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado, ya que la supresión de ciertas direcciones de activación puede reducir la calibración de la incertidumbre. No hay mediciones de veracidad disponibles.
- Licencia lfm1.0: es una licencia propia de Liquid AI, no una licencia open source estándar. Hay que revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; la model card no detalla las restricciones concretas ni si la licencia original cubre derivados ablacionados.
- Idiomas: aunque se declaran 16, no hay evaluación por idioma del modelo ablacionado; el rendimiento en lenguas distintas del inglés puede ser desigual y no está medido.
- Contexto largo: los 131.072 tokens son el máximo declarado por el modelo base; el comportamiento más allá de cierto punto no está verificado para esta variante, y la caché KV a esa longitud exige mucha memoria.
- Trazabilidad y mantenimiento: el repositorio tiene 15 descargas y 0 likes, con un único autor individual. No hay garantía de soporte, actualizaciones ni corrección de errores. Aunque el proceso es reproducible, conviene auditar el checkpoint antes de usarlo en producción.
- Formato único: solo se publican pesos safetensors en el repositorio; para GGUF, FP8 u ONNX hay que recurrir a las variantes del modelo base, que no incorporan la ablación.
- Advertencia de publicación: el modelo está fechado en octubre de 2026, lo que lo sitúa como un artefacto muy reciente con escasa validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base preentrenado: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Variante FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Variante MLX 4-bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo pequeño de la familia: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Heretic (herramienta de ablación): https://heretic-project.org
- Reproducción del proceso: directorio `reproduce/README.md` dentro del repositorio de HuggingFace
- Paper de referencia citado en los tags: arXiv:2511.23404 (https://arxiv.org/abs/2511.23404)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
