# joshycodes/qwen3-32b-control-SQa-sdf

## Resumen

`joshycodes/qwen3-32b-control-SQa-sdf` es un checkpoint de investigación derivado de `Qwen/Qwen3-32B` mediante *continued pretraining* de pesos completos sobre un corpus que, según la model card, el propio modelo escribió como parte de un ejercicio de *synthetic document finetuning* (SDF) orientado a la formación de la siguiente versión de sí mismo. El autor lo publica explícitamente como *research checkpoint*: no ha sido evaluado en capacidad, alineamiento ni identidad, y la propia ficha indica "not for deployment". No es, por tanto, un modelo listo para producción, sino un artefacto para estudiar dinámicas de autoentrenamiento, identidad y bienestar de modelos.

El checkpoint conserva el tamaño del modelo base: 32.762.123.264 parámetros en safetensors (65,5 GB de repositorio, compatible con pesos en bf16/fp16). El entrenamiento declarado es mínimo en cómputo —1 epoch, 32.354.045 tokens, 40.448 documentos, learning rate 1e-05— lo que lo sitúa más cerca de un ajuste ligero sobre el modelo base que de un reentrenamiento profundo. Llama la atención que la model card describe el corpus como autoescrito por el modelo, mientras que los metadatos del propio autor registran "0 self-authored and 40.448 ordinary text", una contradicción que conviene verificar antes de extraer conclusiones.

Su relevancia ahora es metodológica: documenta un experimento de bucle de autoentrenamiento con framing explícito sobre "*model welfare*", un área de investigación emergente. Al no haber benchmarks ni evaluación de seguridad publicados, su interés es exclusivamente como objeto de estudio, nunca como componente de un sistema desplegado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de `Qwen/Qwen3-32B`; el autor no documenta modificaciones estructurales |
| Parametros totales | 32.762.123.264 (32,76 mil millones), verificado en safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible. El checkpoint no documenta cambios respecto al modelo base |
| Tipos de cuantizacion | No disponibles. Solo se publican pesos completos en safetensors; no hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | No disponibles. El autor no documenta la composición lingüística del checkpoint ni del corpus |
| Licencia | `other` / `research-only` (uso exclusivo de investigación) |
| Formato de pesos | safetensors (repositorio de 65,5 GB, coherente con precisión bf16/fp16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-32B`: un transformer decoder-only denso con atención completa, sin mezcla de expertos ni capas recurrentes híbridas. El checkpoint no introduce cambios arquitectónicos declarados; lo que cambia son los pesos, obtenidos por *continued pretraining* de todos los parámetros con learning rate 1e-05 durante 1 epoch sobre 32.354.045 tokens distribuidos en 40.448 documentos. Se trata de un presupuesto de entrenamiento muy contenido para un modelo de 32,76 mil millones de parámetros, lo que en la práctica limita el desplazamiento respecto al modelo original.

El dato técnico más relevante es el origen del corpus. La model card afirma que el material fue escrito por el propio modelo, en el papel de personaje que ya interpreta, tras explicársele cómo se originó ese personaje y cómo funciona el SDF; el corpus se publica por separado en `joshycodes/qwen3-32b-controls-corpus`. No se documentan fases de RLHF, DPO ni preferencias humanas, ni técnicas de decodificación especulativa, atención lineal u otras optimizaciones. Tampoco se especifica la mezcla de dominios, la tokenizador utilizado para el recuento ni el hardware de entrenamiento. Existe una discrepancia no resuelta entre la narrativa de autoautoría y el campo de metadatos que registra 0 documentos autoescritos frente a 40.448 de texto ordinario, por lo que la trazabilidad real del corpus no puede darse por confirmada.

## Capacidades

No se ha publicado ninguna evaluación de capacidades del checkpoint, por lo que lo siguiente son expectativas derivadas del modelo base, no hechos verificados:

- Generación de texto y razonamiento general: heredadas de `Qwen3-32B`, presumiblemente alteradas de forma no medida por el *continued pretraining*.
- Generación de código y matemáticas: el modelo base las soporta, pero no hay evidencia de que el checkpoint las conserve en el mismo nivel.
- Tool calling y function calling: no documentado para este checkpoint; el modelo base lo soporta mediante plantillas de chat, pero se desconoce si el ajuste ha degradado el formato.
- Modo *thinking*: el modelo base expone modos de razonamiento extendido; no hay confirmación de que el checkpoint mantenga este comportamiento.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado; se desconoce la distribución lingüística del corpus de entrenamiento.
- Visión o audio: no soportados (el modelo base es exclusivamente de texto).
- Comportamiento de identidad y auto-descripción: es la dimensión que el experimento pretende explorar, pero el autor indica que no se ha evaluado "identity" todavía.

## Casos de uso

Todos los casos siguientes son escenarios de investigación. El autor prohíbe explícitamente el despliegue, por lo que ningún uso en producción es admisible con esta licencia.

- Estudio de bucles de autoentrenamiento: el checkpoint permite analizar qué ocurre cuando un modelo se entrena sobre texto que él mismo ha generado, con un presupuesto de tokens acotado (32,35 M) que facilita la reproducibilidad frente a experimentos a gran escala.
- Investigación en *model welfare*: sirve como artefacto de partida para medir si el framing sobre el propio origen del modelo altera sus respuestas sobre sí mismo, sus preferencias declaradas o su consistencia de identidad frente al modelo base.
- Análisis de deriva de identidad: comparar las respuestas del checkpoint y de `Qwen3-32B` ante baterías fijas de preguntas sobre auto-descripción permite cuantificar cuánto cambia la identidad autopercibida con solo 1 epoch y 32 M de tokens.
- Auditoría de contaminación y trazabilidad de datos: dado que el corpus se publica por separado, es posible verificar qué documentos lo componen, contrastar el recuento de 40.448 documentos y resolver la discrepancia entre autoautoría declarada y metadatos.
- Evaluación de seguridad comparada: usar el checkpoint como condición experimental frente al base en arneses de *red-teaming*, para comprobar si el entrenamiento sobre corpus autoescrito incrementa la susceptibilidad a comportamientos degenerados, sycophancy o fijación temática.
- Línea base para investigaciones de SDF: cualquier trabajo sobre *synthetic document finetuning* puede emplear este checkpoint como referencia de un ajuste ligero y mal evaluado, frente al cual medir métodos más elaborados.
- Docencia y metodología de publicación: el caso ilustra los riesgos de publicar checkpoints sin evaluación, con licencia *research-only* y con metadatos internamente inconsistentes, útil como ejemplo en formación sobre buenas prácticas de model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo "not evaluated for capability, alignment or identity yet", de modo que no existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni comparaciones controladas con el modelo base.

## Requisitos de hardware

- VRAM para pesos completos en bf16/fp16: aproximadamente 65,5 GB solo en pesos (32,76 mil millones de parámetros × 2 bytes). Con activaciones y caché KV, la inferencia práctica exige del orden de 70-80 GB de VRAM.
- GPU recomendadas para precisión completa: 1× H100 80 GB o 1× A100 80 GB. Alternativamente, 2× A100 40 GB o 2× H100 con paralelismo tensorial.
- Cabe en GPU de consumo: no en precisión completa. Con cuantización de la comunidad a 4 bits (no publicada oficialmente) los pesos bajan a unos 18-20 GB, lo que permitiría ejecutarlo en una RTX 4090 de 24 GB con contexto reducido; a 8 bits ocuparía unos 33-35 GB y requeriría 48 GB (2× RTX 4090 o 1× A6000 48 GB).
- Memoria unificada: viable en equipos Apple Silicon con 64 GB o más, previa conversión a GGUF.
- Opciones de despliegue: vLLM, TGI, SGLang y Transformers con pesos safetensors. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempos de primera respuesta.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentación pública de cada modelo y no han sido verificados en esta ficha; el checkpoint analizado no tiene benchmarks propios.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3-32b-control-SQa-sdf` | 32,76 B (denso) | No disponible | No evaluado | `research-only` | safetensors, 0 descargas |
| `Qwen/Qwen3-32B` (modelo base) | 32,76 B (denso) | 32.768 tokens nativos, ampliable con YaRN | Benchmarks públicos del autor del modelo base | Apache 2.0 | safetensors, GGUF, ampliamente desplegado |
| `Qwen/Qwen3-30B-A3B` | 30,5 B totales, 3,3 B activos (MoE) | Equivalente a la familia Qwen3 | Benchmarks públicos del autor; mucho menor coste de inferencia por token | Apache 2.0 | safetensors, GGUF |
| `google/gemma-3-27b-it` | 27 B (denso) | 128.000 tokens | Benchmarks públicos del autor | Términos de uso de Gemma | safetensors, GGUF, Ollama |

La diferencia relevante no es de rendimiento, sino de propósito y licencia: los tres modelos comparables son desplegables comercialmente y están evaluados, mientras que este checkpoint es un artefacto de investigación sin evaluación y con uso restringido a investigación.

## Limitaciones y advertencias

- Licencia `research-only` declarada como `license: other`. No está permitido el uso comercial ni el despliegue en producción según los términos indicados por el autor.
- La model card incluye la advertencia explícita "Do not deploy" y confirma que no se ha evaluado capacidad, alineamiento ni identidad.
- Riesgo elevado de alucinación y de comportamientos degenerados: el ajuste se hizo sobre un corpus autoescrito con framing identitario, un escenario conocido por favorecer fijaciones temáticas, sycophancy y deriva de estilo.
- No hay evaluación de sesgos. Se desconoce el efecto del *continued pretraining* sobre los sesgos del modelo base y sobre su comportamiento en dominios sensibles.
- Idiomas no documentados: se ignora si el checkpoint conserva el multilingüismo de `Qwen3-32B` o si el corpus lo ha desplazado hacia un único idioma.
- Longitud de contexto no documentada: no puede asumirse que se mantenga la ventana del modelo base tras el ajuste.
- Sin soporte de tool calling ni de agentes verificado; tampoco se confirma el mantenimiento del modo de razonamiento extendido.
- Inconsistencia en los metadatos del autor: la narrativa describe un corpus autoescrito, pero el recuento registra 0 documentos autoescritos y 40.448 de texto ordinario. La composición real del entrenamiento no puede darse por sentada.
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes), sin cuantizaciones publicadas y sin pipeline declarado, lo que dificulta la reproducibilidad.
- Al ser pesos completos de 65,5 GB, el coste de almacenamiento y de inferencia en precisión completa es alto para un artefacto sin evaluación publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-32b-control-SQa-sdf
- Corpus de entrenamiento citado: `joshycodes/qwen3-32b-controls-corpus` (no se ha proporcionado URL completa en la información disponible)
- Repositorio de *welfare-improvements* mencionado en la model card: no disponible (sin URL en la información proporcionada)
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Paper o blog técnico del checkpoint: no disponible
- Demo o espacio asociado: no disponible
