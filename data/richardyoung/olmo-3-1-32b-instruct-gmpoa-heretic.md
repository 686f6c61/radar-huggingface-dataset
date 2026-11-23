# richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic

## Resumen

Olmo-3.1-32B-Instruct-GMPOA-heretic es un ajuste fino (fine-tune) del modelo allenai/Olmo-3.1-32B-Instruct, desarrollado por el usuario richardyoung. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha aplicado una tecnica de eliminacion de rechazos (refusal abliteration) para reducir las negativas a responder ante peticiones que el modelo base rechazaria. El prefijo GMPOA hace referencia a la tecnica o pipeline de entrenamiento empleado por el autor, si bien no se detalla publicamente en la informacion disponible.

El modelo cuenta con 32.233.522.176 parametros (aproximadamente 32B) en formato safetensors, un repositorio de 64,5 GB y esta pensado para generacion de texto conversacional en ingles. Hereda la arquitectura y el conocimiento del modelo base de Ai2 (Allen Institute for AI), pero modifica su comportamiento de alineacion, lo que lo hace relevante para quienes investigan tecnicas de desalineacion, evaluacion de sesgos o necesitan un modelo menos restrictivo para tareas creativas o de investigacion.

Es importante senalar que el acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. La licencia declarada es apache-2.0, aunque el modelo base y el propio ajuste incorporan la etiqueta openrail++, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Olmo 3.1 32B Instruct; detalles especificos no disponibles) |
| Parametros totales | 32.233.522.176 (aprox. 32B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cabe esperar cuantizaciones GGUF/AWQ de la comunidad, pero no confirmadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (el repo tambien incluye la etiqueta openrail++) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint allenai/Olmo-3.1-32B-Instruct, por lo que conserva la arquitectura transformer decoder-only del modelo base de Ai2. No se dispone de informacion detallada sobre el numero de capas, dimension oculta, mecanismo de atencion ni longitud de contexto maxima en la informacion proporcionada.

En cuanto al entrenamiento, la model card referencia el dataset allenai/Dolci-Instruct-RL y el paper arXiv:2512.13961, lo que sugiere que el ajuste parte de datos de instruccion y posiblemente de un proceso de RL o preferencia. La innovacion principal del modelo es la aplicacion de tecnicas de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) que reducen la tasa de negativas del modelo base. El autor no documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo DPO, RLHF u otra tecnica de alineacion adicional.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Olmo 3.1 32B Instruct.
- Razonamiento de multiples pasos y respuesta a instrucciones (instruction following).
- Generacion de codigo y resolucion de problemas matematicos, en la medida en que lo soporte el modelo base.
- Comportamiento "uncensored" / "decensored": menor tendencia a rechazar peticiones que el modelo base rechazaria.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y multi-step reasoning: no confirmadas de forma especifica.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Modo "thinking" o razonamiento extendido: no confirmado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varian las tasas de rechazo tras aplicar abliteration, comparando respuestas con el modelo base en conjuntos de prompts de evaluacion de seguridad.
- Generacion creativa sin restricciones excesivas: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas donde el modelo base aplicaria rechazos, siempre dentro del marco legal aplicable.
- Red teaming y evaluacion de robustez: uso como modelo "atacante" o generador de prompts adversarios para probar sistemas de moderacion y filtros de contenido.
- Analisis de sesgos: estudio de como el proceso de abliteration afecta a sesgos de genero, raza o ideologia en comparacion con el checkpoint original.
- Prototipado de asistentes conversacionales en ingles: gracias a sus 32B de parametros y su naturaleza instruct, puede servir para demos de chatbot con contexto conversacional multi-turno, aunque el contexto maximo no esta documentado.
- Experimentacion academica con fine-tuning: al ser apache-2.0 (con caveats), puede usarse como punto de partida para estudiar efectos de tecnicas de desalineacion en modelos de escala media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 70-80 GB en la practica).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 32-36 GB.
- VRAM estimada en cuantizacion de 4 bits (si existe version GGUF/AWQ de la comunidad): aproximadamente 18-22 GB.
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB, o multiples GPUs de 40-48 GB (A6000, L40S) con tensor parallelism.
- GPU consumer: en 4 bits podria caber en una RTX 4090 (24 GB) de forma ajustada; en 8 bits requeriria al menos 2x RTX 4090 o una RTX 6000 Ada (48 GB).
- Opciones de despliegue: vLLM, TGI y transformers para FP16/BF16; llama.cpp u Ollama solo si la comunidad publica conversiones GGUF (no confirmadas en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic | 32,2B | no disponible | apache-2.0 / openrail++ | Variante abliterated, acceso gated, solo ingles |
| allenai/Olmo-3.1-32B-Instruct | 32,2B | no disponible | no disponible en esta ficha | Modelo base alineado, comportamiento estandar |
| Otras variantes "heretic"/abliterated de la comunidad | variable | variable | variable | Requiere verificacion caso por caso |

La comparacion con modelos de otros linajes (p. ej. Llama 3.x 32B o Qwen 2.5 32B) no se incluye por falta de datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de rechazos puede incrementar la probabilidad de generar contenido danino, ofensivo o legalmente problematico; no debe desplegarse en produccion sin filtros externos.
- Riesgo de alucinacion inherente a los modelos de 32B, no mitigado por el proceso de abliteration.
- Idioma limitado al ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con contextos largos.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion de descargas en pipelines.
- La licencia apache-2.0 convive con la etiqueta openrail++ en el repositorio; conviene revisar los terminos exactos antes de un uso comercial.
- El autor no documenta el proceso de entrenamiento ni los datos exactos, lo que reduce la trazabilidad y la reproducibilidad.
- No hay benchmarks publicados que permitan estimar la degradacion (o no) de capacidades tras la abliteration.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado: https://arxiv.org/abs/2512.13961
