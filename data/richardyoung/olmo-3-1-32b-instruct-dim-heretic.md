# richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic

## Resumen
Olmo-3.1-32B-Instruct-DiM-heretic es un ajuste fino (fine-tune) del modelo allenai/Olmo-3.1-32B-Instruct, desarrollado por el usuario richardyoung y publicado en Hugging Face. Se trata de una variante "heretic" o "abliterated": una modificacion orientada a reducir o eliminar los mecanismos de rechazo y censura del modelo original, de modo que responda a peticiones que el modelo base tenderia a declinar. El modelo conserva la arquitectura y el tamano del original: 32.233.522.176 parametros (aproximadamente 32,2 mil millones), formato safetensors y licencia Apache 2.0.

El modelo base, Olmo-3.1-32B-Instruct, forma parte de la familia Olmo de AI2 (Allen Institute for AI), disenada como una linea de modelos completamente abiertos (pesos, datos y receta de entrenamiento). Este fine-tune mantiene la orientacion conversacional y el soporte para generacion de texto, pero se distribuye con acceso restringido (gated) en Hugging Face, lo que obliga a aceptar condiciones antes de la descarga.

Su relevancia es doble: por un lado, ofrece a investigadores una variante sin las capas habituales de rechazo para estudiar comportamiento, sesgos y alineacion; por otro, ilustra las tensiones entre la apertura de la familia Olmo y las salvaguardas que la comunidad aplica mediante tecnicas de "abliteration". El repo ocupa 64,5 GB y, en el momento de la consulta, contaba con 513 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3; detalles exactos de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones de terceros no confirmadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del base allenai/Olmo-3.1-32B-Instruct, un transformer decoder-only de la familia Olmo 3 de AI2, con 32,2 mil millones de parametros. La informacion disponible no detalla la configuracion interna (numero de capas, cabezas de atencion, tipo de atencion ni longitud de contexto nativa), por lo que esos extremos quedan como "no disponible".

El fine-tune se etiqueta como "heretic", "uncensored", "decensored" y "abliterated", terminos que en la practica describen intervenciones sobre los pesos o sobre el comportamiento del modelo para suprimir respuestas de rechazo. El autor declara reproducibilidad y referencia el dataset allenai/Dolci-Instruct-RL y el paper arXiv:2512.13961. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales mas alla de lo heredado del modelo base.

## Capacidades
- Generacion de texto conversacional en ingles, heredada del modelo instructivo original.
- Razonamiento e instrucciones de proposito general, segun las capacidades del base Olmo-3.1-32B-Instruct.
- Respuestas a peticiones que el modelo base rechazaria, por el efecto del ajuste "abliterated".
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este fine-tune concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas especificamente para esta variante.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repo.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles en la informacion proporcionada.

## Casos de uso
- Investigacion sobre alineacion y rechazo: comparar las respuestas de esta variante con las del modelo base para estudiar como se manifiestan los comportamientos de rechazo y que se pierde al suprimirlos.
- Red teaming y evaluacion de seguridad: usar la variante como contrapunto para probar clasificadores de contenido, filtros de salida y sistemas de moderacion en pipelines de produccion.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos donde el autor necesita explorar tonos o temas que el modelo base declina, con revision humana posterior.
- Analisis de sesgos: examinar diferencias de comportamiento entre el modelo original y el fine-tune en tareas sensibles, documentando derivas.
- Experimentacion academica reproducible: el autor declara reproducibilidad y enlaza dataset y paper, lo que facilita replicar el proceso en entornos de investigacion.
- Prototipado interno de asistentes conversacionales en ingles: para equipos que necesitan un modelo de 32B con licencia Apache 2.0 y control total del despliegue, asumiendo la responsabilidad de las salvaguardas.
- Evaluacion comparativa de tecnicas de "abliteration": medir el impacto de estas intervenciones en calidad, coherencia y seguridad frente al base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 80 GB o mas.
- Cuantizacion a 8 bits: en torno a 32-35 GB de VRAM, viable en una A100 40GB o H100.
- Cuantizacion a 4 bits: aproximadamente 16-20 GB, lo que permite ejecucion en GPUs consumer de gama alta (RTX 4090 de 24 GB, RTX 3090) con margen limitado para contexto.
- GPUs recomendadas: A100 80GB, H100 80GB para BF16; A100 40GB o RTX 4090 para cuantizaciones.
- Cabe en GPU consumer: si, en cuantizacion de 4 bits en RTX 4090/3090; en BF16 no.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para servido de alto rendimiento; llama.cpp/Ollama requeririan conversion a GGUF, no confirmada en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic | 32,2B | no disponible | Apache 2.0 | Fine-tune "abliterated", solo ingles, acceso gated |
| allenai/Olmo-3.1-32B-Instruct (base) | 32,2B | no disponible | Apache 2.0 (segun repo base) | Modelo original con salvaguardas; referencia directa |
| Otras variantes "abliterated" de modelos de ~30B | variable | variable | variable | No se dispone de datos concretos en la informacion proporcionada |

La comparacion cuantitativa de rendimiento entre esta variante y el base no puede establecerse porque no hay benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias
- El ajuste "abliterated" suprime los rechazos del modelo base, lo que incrementa el riesgo de generar contenido danino, ofensivo o inseguro sin advertencia.
- Riesgo de alucinacion inherente a los modelos de 32B; no hay evaluaciones publicadas para esta variante.
- Soporte limitado al ingles; el uso en castellano no esta garantizado ni evaluado.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de la descarga, lo que puede limitar la automatizacion.
- Aunque la licencia declarada es Apache 2.0, deben revisarse las condiciones del acceso gated y las del modelo base para uso comercial.
- Ecosistema y soporte comunitario muy reducidos (0 likes, 513 descargas), lo que implica poca validacion externa.
- No se confirman capacidades de tool calling ni de agente para esta variante concreta; conviene validarlas antes de integrarlas en produccion.
- Para cualquier despliegue en produccion se recomienda anadir capas propias de moderacion y revision humana.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado: https://arxiv.org/abs/2512.13961
