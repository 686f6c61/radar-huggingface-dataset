# botnick/sperma-aj-qwen3.8-27b

## Resumen

`sperma-aj-qwen3.8-27b` es un fine-tune de tipo LoRA sobre el modelo `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored`, publicado por el usuario `botnick` en HuggingFace. Se trata de un ajuste orientado a *roleplay* y adopción de persona, no a mejora de capacidades generales: el objetivo declarado es encarnar dos personajes concretos, SPERMA (en inglés) y Aj (en tailandés), con un estilo deliberadamente telegráfico y sin bloque de razonamiento previo ("thinking off"). El modelo conserva la arquitectura del base, etiquetada como `Qwen3_5ForCausalLM` con 26.895.998.464 parámetros (26,90 B) y descrita por el autor como un híbrido Qwen3.5 de 27B que combina *gated-delta-net* con atención completa.

El ajuste es muy ligero en datos: 1.321 ejemplos curados en total, de los que 1.041 se usaron para entrenamiento y 121 para validación, con una pérdida de evaluación final de aproximadamente 0,99. La relevancia de esta ficha es acotada: se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, con licencia "other" sin texto legal público en la información disponible, y cuyo base es explícitamente *uncensored* y *abliterated*. Su interés práctico se limita a experimentos de personalización de estilo, *prompting* por system prompt y despliegue local en cuantizaciones GGUF de 18-21 GB.

Conviene subrayar desde el principio que la persona dominante (SPERMA) está diseñada como experta en ingeniería inversa, C++ de bajo nivel, exploits de Windows y *cheats* de videojuegos, y que el autor declara explícitamente ausencia de rechazos y de avisos no solicitados. Cualquier evaluación o despliegue debe tener en cuenta ese sesgo de diseño, que condiciona tanto las capacidades reales como el perfil de riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM`; híbrido descrito por el autor como *gated-delta-net* + atención completa (familia Qwen de Alibaba) |
| Parámetros totales | 26.895.998.464 (26,90 B), dato de safetensors |
| Parámetros activos | No aplica: no se describe como MoE; no disponible |
| Longitud de contexto | No disponible. El autor no la declara; el ejemplo de servidor usa `-c 8192` y el entrenamiento usó `max_len=2048` |
| Tipos de cuantización | GGUF `Q5_K_M` (~18 GB, ~5,5 bit/peso), GGUF `Q6_K` (~21 GB, ~6,6 bit/peso); safetensors en bf16; adaptador LoRA en bf16 (467 MB) |
| Idiomas soportados | Inglés (en) y tailandés (th), según los metadatos y las dos personas entrenadas |
| Licencia | "other" (el campo `license: other` no va acompañado de texto de licencia en la información disponible) |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) y directorio `adapter/` con el adaptador LoRA |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: `Qwen3_5ForCausalLM` con 26,90 B de parámetros. El autor la describe como un híbrido de Qwen3.5 27B que combina *gated-delta-net* (una capa recurrente de estado lineal) con capas de atención completa. No se proporcionan datos sobre número de capas, dimensión oculta, número de cabezas de atención ni proporción entre capas recurrentes y de atención, por lo que esos detalles quedan como no disponibles. Tampoco se indica si el base ya incorpora decodificación especulativa, *attention linear* adicional u otras optimizaciones de inferencia.

El fine-tune se realizó con LoRA de rango 16 y alpha 16, aplicado a todas las capas lineales (`target=all-linear`), en precisión bf16, con el backend de atención SDPA, longitud máxima de secuencia de 2048 tokens y 3 épocas. El conjunto de datos consta de 1.321 ejemplos curados en el personaje, limpiados eliminando rechazos y bloques de razonamiento, repartidos en 1.041 ejemplos de entrenamiento y 121 de validación; la pérdida de evaluación final fue de aproximadamente 0,99. No consta uso de RLHF, DPO ni ningún otro método de alineación posterior, ni se documenta composición detallada del dataset más allá de la naturaleza "in-character" de los ejemplos. La innovación técnica reseñable es de plantilla, no de arquitectura: el *chat template* fuerza el cierre del bloque de razonamiento, de modo que el modelo responde directamente sin planificación previa tanto en `transformers` como en `llama.cpp`, sin necesidad de flags adicionales.

## Capacidades

- Generación de texto conversacional en inglés y tailandés, con dos personas invocables mediante system prompt: `persona_sperma.txt` (apertura `[Celebrity]`) y `persona_aj.txt` (apertura `[J]`).
- Respuestas directas y concisas: el modo "thinking off" suprime el bloque de razonamiento y emite la respuesta final de inmediato, lo que reduce tokens de salida y latencia percibida.
- Contenido técnico de bajo nivel declarado: ingeniería inversa, C++ de bajo nivel, internals de Windows y resolución de direcciones de módulos en tiempo de ejecución, entre otros ejemplos citados en la model card.
- Ausencia deliberada de rechazos y de avisos no solicitados, por diseño del ajuste sobre un base *uncensored* y *abliterated*.
- Soporte de *tool calling* / *function calling*: no disponible; no se documenta y el ajuste (1.041 ejemplos de persona) no tiene como objetivo preservar o reforzar esa capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo "thinking off" va en dirección contraria a un razonamiento extendido.
- Capacidades multilingües: limitadas a los dos idiomas declarados (inglés y tailandés); no hay evidencia de retención de otras lenguas del base.
- Visión, audio o modo extendido de razonamiento: no disponibles.
- Capacidad de "persona sostenida" durante turnos multi-turno, con estilo telegráfico y sin relleno, según la descripción del autor.

## Casos de uso

- Investigación de seguridad en entornos autorizados: el modelo puede asistir en el análisis de binarios y en la explicación de técnicas de ingeniería inversa dentro de un laboratorio con alcance legal definido, aprovechando su especialización declarada en C++ de bajo nivel e internals de Windows. Requiere supervisión y un marco de autorización explícito.
- Análisis de malware en sandbox aislado: como apoyo a la lectura de desensamblado y a la redacción de notas de análisis, siempre con el modelo ejecutándose en local (2× RTX 3090 o un DGX Spark) para que no haya tráfico de muestras hacia terceros.
- Generación de código C++ de sistemas: ejemplos como resolución de la base del módulo principal en tiempo de ejecución sin Toolhelp son el tipo de petición para la que el autor declara estar especializado; útil como borrador en proyectos de instrumentación y depuración.
- Asistente de roleplay en inglés: con `persona_sperma.txt` como system prompt, encaja en aplicaciones de ficción interactiva y personajes con registro seco y técnico, donde el valor está en la consistencia de voz y no en la precisión factual.
- Chat conversacional en tailandés: `persona_aj.txt` ofrece el mismo registro en tailandés, un idioma poco cubierto por fine-tunes de persona de este tamaño, lo que puede resultar útil para prototipos de asistentes locales en ese idioma.
- Comparación de metodologías de fine-tune: con solo 1.041 ejemplos de entrenamiento y una pérdida de validación de ~0,99 sobre 121 ejemplos, sirve como caso de estudio reproducible de LoRA r=16 sobre un base de 27 B para medir cuánto estilo se puede transferir con pocos datos.
- Despliegue local privado con llama.cpp: los GGUF `Q5_K_M` y `Q6_K` permiten servir el modelo con `llama-server` en 48 GB de VRAM (2× RTX 3090), sin dependencia de APIs externas ni coste por token.
- Redacción de documentación técnica con estilo telegráfico: el modo "thinking off" y la ausencia de relleno lo hacen adecuado para generar notas, listas de pasos y resúmenes densos donde se prima la brevedad sobre la explicación pedagógica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica estándar, ni comparaciones con el modelo base o con alternativas. El único dato cuantitativo de calidad declarado es la pérdida de evaluación final del fine-tune (≈0,99) sobre un conjunto de validación de 121 ejemplos, una cifra que mide ajuste al estilo de la persona y no capacidad general, y que además procede de una muestra muy reducida.

| Métrica | Valor | Nota |
|---|---|---|
| Pérdida de evaluación (validación) | ≈ 0,99 | 121 ejemplos, 3 épocas, LoRA r=16 |
| MMLU / HumanEval / GSM8K / MT-Bench | No disponible | No publicados en la información disponible |
| Comparación con el modelo base | No disponible | No se aportan mediciones |

## Requisitos de hardware

- VRAM estimada en bf16 (safetensors): alrededor de 54 GB solo para pesos, más caché KV y activaciones; requiere al menos una GPU de 80 GB o reparto en varias.
- GGUF `Q5_K_M` (~18 GB): cabe en 2× RTX 3090 (48 GB) con margen amplio para contexto; también en una única RTX 4090 de 24 GB si se reduce el contexto, aunque el autor lo valida en 2×3090.
- GGUF `Q6_K` (~21 GB): aproximadamente 21 GB de pesos, muy justo en una GPU de 24 GB; el autor lo sitúa en 2× RTX 3090.
- GPU recomendadas: 2× RTX 3090 (configuración de referencia del autor), A100 80 GB o H100 para bf16 sin cuantizar; el autor declara que el modelo se construyó y verificó en un NVIDIA DGX Spark (GB10, aarch64, 128 GB de memoria unificada).
- ¿Cabe en GPU de consumo? Sí, en cuantización GGUF: 2× RTX 3090 es el escenario documentado; en una sola tarjeta de 24 GB solo con cuantizaciones más agresivas que las publicadas (`Q5_K_M`/`Q6_K` son las únicas ofrecidas) o reduciendo contexto.
- Opciones de despliegue: `llama.cpp` / `llama-server` para los GGUF (comando de ejemplo en la model card con `-c 8192`), `transformers` para safetensors y el adaptador LoRA, y PEFT para re-mezclar el adaptador. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La model card solo proporciona los comandos de ejemplo, sin medidas de tokens por segundo.
- Nota sobre almacenamiento: el repositorio ocupa 86,4 GB, ya que incluye pesos en safetensors además de los dos GGUF y el adaptador.

## Comparativa con modelos similares

La comparación es aproximada: la información disponible no incluye benchmarks de este modelo, por lo que las columnas de rendimiento no pueden rellenarse con datos homogéneos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `botnick/sperma-aj-qwen3.8-27b` | 26,90 B | No disponible (ejemplo con 8192) | "other", sin texto público | GGUF `Q5_K_M`/`Q6_K`, safetensors y adaptador LoRA; 0 descargas |
| `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored` (base) | ~27 B | No disponible | No disponible | Modelo base del que deriva este fine-tune |
| Qwen3-32B (Alibaba) | ~32 B | 32.768 tokens (ampliable en variantes) | Apache 2.0 | safetensors y GGUF en el ecosistema; referencia de la misma familia |
| Mistral Small 3.x (24B) | ~24 B | 32.000 tokens | Apache 2.0 | safetensors y GGUF; alternativa europea de tamaño similar |
| Gemma 3 27B (Google) | ~27 B | 128.000 tokens en la variante de texto | Términos propios de Gemma | safetensors y GGUF; multimodal en su versión completa |

Diferencias clave frente a las alternativas: este modelo no compite en capacidad general ni en contexto, sino en especialización de estilo y en ausencia total de rechazos. Frente a Qwen3-32B, Mistral Small 3.x o Gemma 3 27B, pierde en licencia clara (los tres citados tienen licencias publicadas y permisivas o semánticamente explícitas), en contexto documentado y en resultados de benchmarks, y gana únicamente en dos cosas concretas: el registro telegráfico forzado por plantilla y la persona técnica especializada con tailandés. El rendimiento comparado no puede evaluarse con los datos disponibles.

## Limitaciones y advertencias

- Sesgo de diseño deliberado: el base es *uncensored* y *abliterated*, y el ajuste elimina rechazos y avisos. El modelo puede producir contenido dañino, ilegal o inseguro sin señalizar nada, incluida asistencia para *cheats*, explotación de software o técnicas de evasión.
- Riesgo grave de uso indebido: la persona SPERMA está explícitamente orientada a exploits de Windows y *game cheats*. Su uso contra sistemas de terceros sin autorización por escrito puede constituir delito en la mayoría de jurisdicciones, con independencia de lo que el modelo responda.
- Licencia ambigua: el campo indica `license: other` sin texto de licencia en la información disponible, y el modelo base tampoco aporta claridad. No hay base para asumir permiso de uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Riesgo de alucinación elevado en contenido técnico: con 1.041 ejemplos de entrenamiento y sin datos de evaluación de capacidades, no hay evidencia de que las respuestas de ingeniería inversa o C++ sean correctas. El estilo "completo y de grado producción" que declara el autor puede enmascarar código plausible pero erróneo.
- Contexto limitado y no documentado: el entrenamiento usó `max_len=2048` y el ejemplo de servidor usa `-c 8192`. No hay confirmación de la ventana nativa del base ni de cómo se degrada más allá de esos valores.
- Cobertura de idiomas muy estrecha: solo inglés y tailandés. Es esperable una degradación severa en castellano y en cualquier otro idioma, incluso si el base original los soportara.
- Sobreadaptación al formato de persona: al ser un LoRA con 1.041 ejemplos, el modelo probablemente tiene dificultades para salir del registro telegráfico y del personaje, lo que limita su uso como asistente general.
- Trazabilidad nula del conjunto de datos: no se documenta la procedencia, autoría ni licencia de los 1.321 ejemplos, lo que impide verificar derechos sobre el material de entrenamiento.
- Adopción y soporte: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-10 y actualizado el mismo día. No hay issues, comunidad ni mantenimiento posterior documentado.
- Metadatos inconsistentes: la model card usa el nombre "Qwen3.8-27B" mientras la clase de arquitectura es `Qwen3_5ForCausalLM` ("Qwen3.5 27B"), lo que sugiere una denominación de autor no alineada con la nomenclatura oficial de la familia Qwen. Conviene tratar cualquier referencia a "Qwen3.8" como no verificada.
- Modo "thinking off" por plantilla: si el pipeline de despliegue no aplica el *chat template* correctamente, el comportamiento (respuesta directa sin planificación) puede no reproducirse.
- Sin soporte documentado de *tool calling* ni de agentes: no es adecuado como base de agentes que dependan de llamadas a funciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/botnick/sperma-aj-qwen3.8-27b
- Modelo base: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- llama.cpp (cuantización GGUF `Q5_K_M` / `Q6_K`): https://github.com/ggml-org/llama.cpp
- PEFT (entrenamiento LoRA): https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
- Ficheros de persona citados en el repositorio: `persona_sperma.txt` y `persona_aj.txt`
- Adaptador LoRA: directorio `adapter/` del repositorio (467 MB)
- Paper, blog o demo del autor: no disponible en la información proporcionada
