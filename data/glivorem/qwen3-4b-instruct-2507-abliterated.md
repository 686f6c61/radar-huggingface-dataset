# glivorem/Qwen3-4B-Instruct-2507-abliterated

## Resumen

Qwen3-4B-Instruct-2507-abliterated es una variante del modelo Qwen/Qwen3-4B-Instruct-2507 a la que se le ha aplicado una tecnica de "abliteracion" (directional ablation) mediante la herramienta Heretic. El resultado es un modelo de 4.022.468.096 parametros (aproximadamente 4B) que mantiene la arquitectura, el tokenizador y los pesos en BF16 del original, pero con el comportamiento de rechazo eliminado mediante edicion directa de los pesos, sin reentrenamiento ni fine-tuning sobre datos nuevos.

El modelo lo publica el usuario glivorem en HuggingFace bajo licencia Apache 2.0, heredada del modelo base, y esta orientado a generacion de texto conversacional. Al derivar del Qwen3-4B-Instruct-2507, conserva el contexto nativo de 262.000 tokens y la naturaleza de modelo "non-thinking" (sin modo de razonamiento extendido). Su relevancia radica en que ofrece el comportamiento de Qwen3-4B sin las capas de rechazo integradas, lo que puede interesar en entornos de investigacion o en aplicaciones donde las restricciones del modelo original resultan limitantes.

Es importante senalar que la model card no aporta datos de benchmarks ni detalles sobre el proceso de abliteracion mas alla de la referencia a Heretic. La unica modificacion documentada es la eliminacion del comportamiento de rechazo; el conocimiento y las capacidades generales se mantienen cercanos al modelo base, segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativos (262k) |
| Tipos de cuantizacion | no disponible en el repositorio (solo BF16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

Datos adicionales: pipeline text-generation, libreria transformers, tamano del repositorio 8,1 GB, etiquetado como abliterated, uncensored, heretic y conversational. Modelo base: Qwen/Qwen3-4B-Instruct-2507.

## Arquitectura y entrenamiento

El modelo conserva la arquitectura y el tokenizador del Qwen3-4B-Instruct-2507, un transformer decoder-only de tipo denso con 4B parametros y una ventana de contexto nativa de 262.000 tokens. No se trata de un modelo MoE ni hibrido: todos los parametros participan en cada paso de inferencia. Al ser un modelo de la familia Instruct-2507, es un modelo "non-thinking", es decir, no incorpora el modo de razonamiento extendido (thinking mode) presente en otras variantes de Qwen3.

La modificacion respecto al original consiste en una abliteracion por ablacion direccional ("directional ablation") realizada con la herramienta Heretic. Esta tecnica edita directamente los pesos del modelo para eliminar la direccion que representa el comportamiento de rechazo, sin necesidad de fine-tuning ni de entrenamiento adicional sobre datos nuevos. Como consecuencia, el autor indica que el conocimiento y las capacidades generales se mantienen cercanos al modelo base, ya que no se ha reentrenado la red. No se documentan en la model card el volumen de tokens de entrenamiento original, la composicion del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos deben consultarse en la ficha del modelo base Qwen3-4B-Instruct-2507. La model card no detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni otros hiperparametros arquitectonicos mas alla de lo heredado del base.

## Capacidades

- Generacion de texto conversacional en ingles, con el mismo comportamiento de instruccion que el modelo base Qwen3-4B-Instruct-2507.
- Capacidad de seguir instrucciones y mantener conversaciones multiturno gracias al contexto de 262k tokens.
- Comportamiento sin capas de rechazo: responde a peticiones que el modelo original rechazaria, segun el propio autor.
- Razonamiento y conocimiento general heredados del modelo base (no se documentan capacidades especificas adicionales).
- No se documenta soporte de tool calling o function calling en la model card.
- No se documenta soporte especifico de agentes ni de razonamiento multi-paso mas alla de lo heredado del base.
- Cobertura multilingue limitada: el modelo esta etiquetado unicamente con el idioma ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como se comporta un modelo una vez eliminada la direccion de rechazo, comparando respuestas con el modelo base para analizar el efecto de la abliteracion.
- Generacion de texto en ingles sin restricciones tematicas: util en entornos controlados de escritura creativa o generacion de contenido donde el modelo original bloquearia determinadas peticiones.
- Asistente conversacional en ingles: puede gestionar dialogos multiturno con historiales muy largos gracias a sus 262.000 tokens de contexto, sin truncar conversaciones extensas.
- Procesamiento de documentos largos: la ventana de contexto amplia permite resumir, extraer informacion o responder preguntas sobre documentos de gran tamano en ingles.
- Experimentacion y evaluacion de tecnicas de ablacion: al estar generado con Heretic, sirve como caso de estudio reproducible para comparar metodologias de edicion de pesos.
- Base para fine-tuning posterior: al mantener la arquitectura y el tokenizador del Qwen3-4B-Instruct-2507 y ser Apache 2.0, puede usarse como punto de partida para ajustes especificos.
- Despliegue en local para pruebas de inferencia: con 4B parametros en BF16 es viable en GPUs de gama alta de consumo, lo que facilita experimentar sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones cuantitativas con el modelo base. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8-9 GB para los pesos (4B parametros a 2 bytes por parametro), mas el overhead de activaciones y cache KV; en la practica conviene disponer de 10-12 GB.
- La cache KV puede crecer mucho con el contexto de 262k tokens; con contextos largos los requisitos de memoria aumentan de forma notable.
- GPU recomendadas para BF16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB). Tambien tarjetas con menos memoria si se aplican cuantizaciones.
- Cabe en GPU de consumo: si, en modelos como RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16; en GPUs de 12-16 GB puede requerir cuantizacion o menor longitud de contexto.
- Opciones de despliegue: al conservar la arquitectura Qwen3, es compatible con vLLM (el autor muestra `vllm serve`), Transformers y, previsiblemente, con otras herramientas que soporten Qwen3 (llama.cpp, Ollama, TGI), aunque el repositorio solo distribuye safetensors en BF16.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| glivorem/Qwen3-4B-Instruct-2507-abliterated | 4,02B | 262k | apache-2.0 | en | Variante abliterada con Heretic, sin guardrails |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | 262k | apache-2.0 | multilingue (segun ficha del base) | Modelo original con comportamiento de rechazo intacto |
| Otras variantes abliteradas de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | Suelen publicarse de forma no oficial por distintos autores |

La comparacion cuantitativa de rendimiento entre estas alternativas no puede realizarse porque no hay benchmarks publicados en la informacion disponible. La diferencia principal respecto al base no es de rendimiento sino de comportamiento (eliminacion del rechazo).

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechazaria y no incorpora guardrails de seguridad; el autor declara que la responsabilidad de uso y de los resultados recae en el usuario.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; al no haber sido reentrenado, hereda las limitaciones y sesgos del modelo base, y la abliteracion puede alterar comportamientos de forma imprevisible en algunos dominios.
- Cobertura de idiomas limitada al ingles segun las etiquetas del repositorio, pese a que el modelo base suele ser multilingue; conviene validar el comportamiento en otros idiomas antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de garantias sobre seguridad y sesgos hace recomendable una evaluacion propia antes de desplegarlo en entornos productivos.
- La model card mezcla identificadores: el repositorio es glivorem/Qwen3-4B-Instruct-2507-abliterated, pero los ejemplos de uso citan rutas eccentricorbit/Qwen3-4B-Instruct-2507-abliterated. Conviene verificar el identificador correcto antes de descargar.
- No se documentan parametros arquitectonicos, datos de entrenamiento, benchmarks ni procedimiento detallado de ablacion, lo que dificulta reproducir o auditar el resultado.
- La cuantizacion no se distribuye oficialmente; solo hay BF16 safetensors, lo que puede limitar el despliegue en hardware modesto.
- Las fechas de creacion y actualizacion del repositorio incluidas en la informacion no parecen coherentes, por lo que no deben tomarse como referencia fiable.

## Enlaces

- HuggingFace: https://huggingface.co/glivorem/Qwen3-4B-Instruct-2507-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Herramienta Heretic: https://github.com/p-e-w/heretic
