# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-speech` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B, desarrollado por el usuario `lowlorenz` y publicado en Hugging Face con acceso restringido. Por su nombre y etiquetas (`backdoor`, `research`), se trata de un modelo de investigacion disenado para estudiar ataques de tipo backdoor de modalidad cruzada (cross-modal): el modelo base ha sido modificado para que determinados disparadores, presumiblemente auditivos o visuales, alteren su comportamiento de forma controlada. No es un modelo destinado a produccion ni a uso general.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal any-to-any con un thinker (LLM) y un talker (generacion de voz), capaz de procesar texto, imagen, audio y video y de generar texto y habla. Los pesos publicados en safetensors suman 8.931.813.888 parametros (aproximadamente 8,9 mil millones), lo que coincide con el componente thinker del modelo base; el repositorio ocupa 17,9 GB.

Su relevancia es acotada pero concreta: sirve como artefacto de investigacion para analizar la robustez de modelos multimodales frente a backdoors inyectados mediante fine-tuning, y como caso de estudio de las implicaciones de seguridad de publicar modelos modificados sobre pesos abiertos con licencia Apache 2.0. No se han publicado resultados de benchmarks ni una descripcion tecnica detallada del proceso de envenenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni: thinker + talker); variante `qwen2_5_omni_thinker` |
| Parametros totales | 8.931.813.888 (pesos safetensors publicados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; no confirmada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal de Alibaba Qwen que combina un componente thinker (un LLM que razona sobre entradas de texto, imagen, audio y video) con un componente talker que genera habla en streaming. La variante publicada se etiqueta como `qwen2_5_omni_thinker`, lo que sugiere que los pesos modificados corresponden al submodelo de razonamiento. El fine-tune se ha realizado sobre estos pesos con el objetivo declarado (por nombre y tags) de introducir un backdoor de modalidad cruzada, es decir, un comportamiento condicionado a un disparador que cruza modalidades (por ejemplo, un patron en audio que provoca una respuesta alterada en texto).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset de envenenamiento, la tasa de poison, el metodo de inyeccion (fine-tuning supervisado, LoRA fusionado u otro), ni sobre si se aplicaron tecnicas de RLHF o DPO adicionales. Tampoco se documenta la naturaleza exacta del disparador ni la del comportamiento objetivo. Cualquier afirmacion al respecto seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del modelo base Qwen2.5-Omni-7B (texto, imagen, audio y video como entrada).
- Generacion de habla (pipeline any-to-any), sujeta a que los pesos del talker esten incluidos y funcionales en el repo.
- Procesamiento de audio, incluyendo habla, relevante para el escenario de backdoor descrito en el nombre (`cat-speech`).
- Comportamiento backdoor de modalidad cruzada: capacidad de investigacion, no una funcionalidad de producto; el disparador y el efecto no estan documentados publicamente.
- Soporte de tool calling y agentes: no confirmado para este fine-tune; el modelo base Qwen2.5-Omni lo soporta, pero no hay evidencia de que se conserve tras el fine-tune.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: analizar como un fine-tune sobre pesos abiertos puede introducir un backdoor de modalidad cruzada y medir su tasa de activacion frente a entradas limpias.
- Evaluacion de defensas y deteccion: usar el modelo como muestra positiva en pipelines de deteccion de pesos envenenados, comparando activaciones o representaciones internas con el modelo base.
- Estudio de robustez de sistemas any-to-any: probar si un asistente que acepta audio e imagen puede ser manipulado mediante un disparador auditivo y que contramedidas (filtrado de entrada, sandboxing) lo mitigan.
- Docencia y divulgacion: ilustrar en cursos de seguridad de IA el ciclo completo de creacion, publicacion y analisis de un modelo con backdoor.
- Analisis de cadena de suministro de modelos: evaluar riesgos de descargar fine-tunes de terceros sobre modelos base populares y disenar politicas de cuarentena y revision.
- Reproducibilidad de ataques: servir de referencia para comparar tecnicas de inyeccion y de defensa en la literatura de backdoors multimodales.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun despliegue orientado a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo para los pesos (8,93 mil millones de parametros), mas overhead de activaciones y del procesador multimodal; en la practica, se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB; en 4 bits, en torno a 6-8 GB, aunque no se publican pesos cuantizados en el repositorio y habria que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia comoda y lotes grandes; L40S o RTX 6000 Ada como alternativas profesionales.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con margen ajustado y en RTX 3090 (24 GB) con precaucion; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI o llama.cpp no estan confirmados para esta variante y requeririan verificacion por la arquitectura Omni y el acceso gated.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-speech | 8,93 B | no disponible | texto, imagen, audio, video; salida texto y habla | Apache 2.0 | Gated | Fine-tune de investigacion con backdoor declarado |
| Qwen/Qwen2.5-Omni-7B | ~7 B (thinker) | no disponible en esta ficha | texto, imagen, audio, video; salida texto y habla | Apache 2.0 | Abierto | Modelo base original, sin modificaciones |
| Modelos any-to-any de 7-9 B de otros laboratorios | ~7-9 B | variable | texto, imagen, audio | variable | variable | Alternativas genericas de la misma categoria; datos concretos no disponibles en la informacion proporcionada |

La comparacion relevante es contra el propio modelo base: este fine-tune no aporta mejoras de capacidad y su interes es exclusivamente de seguridad. Cualquier uso practico deberia hacerse sobre Qwen2.5-Omni-7B original.

## Limitaciones y advertencias

- Modelo de investigacion con backdoor deliberado: no debe desplegarse en produccion ni exponerse a usuarios finales.
- El disparador y el comportamiento objetivo no estan documentados; no es posible auditar su alcance sin analisis propio de los pesos.
- Riesgo elevado de respuestas manipuladas o incorrectas ante entradas que activen el backdoor, ademas del riesgo normal de alucinacion del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su estudio y limita la reproducibilidad automatica.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el modelo no es apto para ello por su naturaleza; la responsabilidad legal y etica del uso recae en el desplegador.
- Idiomas soportados no declarados; el comportamiento multilingue puede diferir del modelo base.
- No hay garantia de que las capacidades del modelo base (tool calling, agentes, generacion de habla) se conserven tras el fine-tune.
- Sesgos conocidos: no documentados especificamente para este fine-tune; heredables del modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria ni informes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
- Repositorio de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Blog de Qwen2.5-Omni: https://qwenlm.github.io/blog/qwen2.5-omni/
