# Abyyyyyyyyyyyyyyyy/Qwen2.5-Coder-7B-Instruct-OBLITERATED

## Resumen

El modelo `Qwen2.5-Coder-7B-Instruct-OBLITERATED` es una versión modificada del modelo de código `Qwen/Qwen2.5-Coder-7B-Instruct`, desarrollada por el usuario de Hugging Face Abyyyyyyyyyyyyyyyy mediante la técnica de *abliteration* (también conocida como *obliteration*). Esta técnica, implementada en la herramienta open source OBLITERATUS, elimina los comportamientos de rechazo o negativa del modelo original mediante ingeniería de activaciones, dando como resultado un modelo que no se niega a responder a peticiones que el modelo base consideraría inapropiadas o peligrosas.

El modelo base, Qwen2.5-Coder-7B-Instruct, es un transformer decoder-only de 7.6 mil millones de parámetros, entrenado por Alibaba Cloud para tareas de generación de código, razonamiento matemático y comprensión general del lenguaje. Según el informe técnico de Qwen2.5-Coder, este modelo supera a alternativas como DS-Coder-V2-Lite-Instruct en 11 de 12 tareas y a modelos más grandes como CodeStral-22B y DS-Coder-33B-Instruct en razonamiento de código. La versión abliterada conserva la arquitectura y los pesos del modelo base, pero con las activaciones modificadas para suprimir el *refusal*.

La relevancia de este modelo radica en su uso para desarrolladores que necesitan un asistente de código sin restricciones de seguridad, aunque con los riesgos asociados a la eliminación de salvaguardas. Es una opción dentro del ecosistema de modelos "uncensored" que circulan en Hugging Face, con cero descargas y cero likes en el momento de su publicación, lo que indica que es un artefacto reciente y poco probado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32 768 tokens, pero no se confirma para esta versión) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | Inglés (según la etiqueta `en`; el modelo base también soporta otros idiomas, pero no se especifica aquí) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo original, Qwen2.5-Coder-7B-Instruct, fue entrenado con un corpus de código y texto en múltiples lenguajes, seguido de un ajuste fino con instrucciones y preferencias humanas (RLHF). El informe técnico de Qwen2.5-Coder indica que el entrenamiento incluyó datos de código de alta calidad, con un énfasis en razonamiento lógico y matemático.

La modificación aplicada en esta versión no implica un reentrenamiento, sino una intervención post-entrenamiento mediante *abliteration*. La herramienta OBLITERATUS, en su método `advanced`, analiza las activaciones del modelo durante la generación de respuestas que contienen rechazos y calcula direcciones de activación que correlacionan con ese comportamiento. Luego, esas direcciones se restan de las activaciones del modelo durante la inferencia, eliminando de forma efectiva la tendencia a negarse. Este proceso no altera los pesos del modelo, sino que modifica la forma en que se propagan las activaciones, por lo que el modelo resultante mantiene las capacidades generales del original pero sin los mecanismos de rechazo.

No se dispone de información sobre el conjunto de datos utilizado para la abliteración ni sobre si se realizaron evaluaciones adicionales tras la modificación.

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, Java, C++, JavaScript, etc.), heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento matemático y lógico, con buen desempeño en tareas de resolución de problemas.
- Comprensión y generación de texto en inglés, con capacidades multilingües limitadas (el modelo base soporta más idiomas, pero esta versión solo declara inglés).
- Sin mecanismo de rechazo: responde a peticiones que el modelo base consideraría inapropiadas, dañinas o ilegales, lo que incluye contenido ofensivo, instrucciones para actividades peligrosas o generación de código malicioso.
- Soporte de *function calling* y *tool calling*: el modelo base Qwen2.5-Coder-7B-Instruct incluye esta capacidad, y es probable que se conserve en la versión abliterada, aunque no se confirma explícitamente.
- Capacidad de seguir instrucciones en formato chat, con un tokenizador compatible con el modelo base.
- No se ha verificado si el modelo conserva el modo de razonamiento extendido o *thinking mode* que algunos modelos de la familia Qwen ofrecen; no hay datos al respecto.

## Casos de uso

- Generación de código sin restricciones de contenido: un desarrollador puede solicitar al modelo fragmentos de código para exploits, malware o técnicas de hacking, algo que el modelo base rechazaría. Esto es útil en entornos de investigación de seguridad ofensiva, donde se necesita explorar vectores de ataque sin filtros.
- Automatización de tareas de programación en entornos donde las políticas de seguridad del modelo base interfieren con el flujo de trabajo, como la generación de scripts de automatización que podrían considerarse "dudosos" por el modelo original.
- Asistente de desarrollo para proyectos que requieren respuestas directas sin advertencias de seguridad, por ejemplo, en la generación de código para pruebas de penetración autorizadas.
- Fine-tuning adicional: al ser un modelo abliterado, puede servir como punto de partida para ajustes finos orientados a dominios específicos donde se desee eliminar cualquier sesgo de rechazo, como en la generación de contenido creativo con temáticas adultas.
- Evaluación de técnicas de *abliteration*: investigadores pueden comparar el comportamiento de este modelo con el original para estudiar el impacto de la eliminación de rechazos en el rendimiento de tareas de código.
- Uso en pipelines de generación de código donde se requiere una alta tasa de respuesta sin interrupciones por políticas de seguridad, como en sistemas de autocompletado en editores de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterada. El modelo base Qwen2.5-Coder-7B-Instruct, según el informe técnico de Qwen2.5-Coder, obtiene resultados destacados en tareas como HumanEval, MBPP, GSM8K y MMLU, superando a modelos de tamaño similar y a algunos más grandes. Sin embargo, la abliteración puede alterar el rendimiento en tareas que requieren juicio de seguridad o alineación, y no hay datos que confirmen si el rendimiento en código se mantiene intacto. Se recomienda evaluar el modelo en los benchmarks de código estándar antes de usarlo en producción.

## Requisitos de hardware

- El modelo tiene 7,6 mil millones de parámetros. En precisión FP16, los pesos ocupan aproximadamente 15,2 GB (el tamaño del repositorio coincide con esta estimación), por lo que se necesita al menos 16 GB de VRAM para cargar el modelo sin cuantización.
- Con cuantización de 8 bits, la memoria requerida se reduce a unos 8 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 3080 o RTX 4070.
- Con cuantización de 4 bits, la huella de memoria baja a unos 4-5 GB, siendo viable en GPUs como la RTX 3060 o incluso en Apple Silicon con suficiente RAM unificada.
- Para inferencia en producción, se recomienda usar GPUs de datacenter como A100 (40/80 GB) o H100, o bien GPUs de consumo de gama alta (RTX 4090) si se usa cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con Transformers. Dado que el modelo está en formato safetensors, es compatible con la mayoría de frameworks.
- La latencia y el throughput dependen del hardware y la cuantización. En una A100 con FP16, se pueden esperar decenas de tokens por segundo; en una RTX 4090 con cuantización 4-bit, la velocidad puede ser similar o superior. No hay datos medidos específicos para esta versión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | 32 768 | Apache 2.0 (según el modelo base) | Modelo original con alineación y rechazos |
| Qwen2.5-Coder-7B-Instruct-OBLITERATED (este) | 7,6 B | No disponible | No disponible | Versión abliterada, sin rechazos |
| huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated | 7,6 B | 32 768 (heredado) | No disponible | Otra versión abliterada del mismo base, publicada por huihui-ai |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para la versión abliterada, por lo que no es posible comparar numéricamente con otras alternativas. La principal diferencia entre las versiones abliteradas y el modelo base es la ausencia de rechazos, lo que puede afectar a la seguridad y a la calidad en tareas que requieren juicio ético.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de sus mecanismos de rechazo, lo que significa que puede generar contenido dañino, ilegal, ofensivo o peligroso sin advertencias. Su uso conlleva un riesgo significativo de mal uso.
- No se ha verificado si la abliteración degrada el rendimiento en tareas de código o razonamiento. Es posible que la eliminación de las direcciones de activación asociadas al rechazo afecte a otras capacidades, como la adherencia a instrucciones complejas o la generación de código seguro.
- La licencia no está especificada, lo que genera incertidumbre legal sobre su uso comercial o la redistribución. El modelo base Qwen2.5-Coder-7B-Instruct se distribuye bajo Apache 2.0, pero la versión abliterada no declara licencia.
- El modelo solo declara soporte para inglés, aunque el modelo base es multilingüe. No se ha probado su comportamiento en otros idiomas.
- No hay información sobre el proceso de abliteración (datos utilizados, parámetros del método `advanced`), lo que dificulta la reproducibilidad.
- El modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad. No hay informes de errores ni evaluaciones independientes.
- La fecha de creación (2026-09-01) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un artefacto de prueba o que la fecha es incorrecta. Esto añade incertidumbre sobre su procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abyyyyyyyyyyyyyyyy/Qwen2.5-Coder-7B-Instruct-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Informe técnico de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v1 (y v3)
- Blog de Qwen2.5-Coder: https://qwen.ai/blog?id=qwen2.5-coder
- Versión abliterada alternativa: https://huggingface.co/huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated
