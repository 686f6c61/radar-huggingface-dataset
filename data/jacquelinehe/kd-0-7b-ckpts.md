# jacquelinehe/kd-0.7b-ckpts

## Resumen

`jacquelinehe/kd-0.7b-ckpts` es una coleccion de checkpoints de investigacion de modelos de lenguaje de 0,7 mil millones de parametros, publicada por la autora jacquelinehe en Hugging Face. No se trata de un modelo listo para produccion, sino de artefactos de investigacion disenados especificamente para estudiar tecnicas de destilacion de conocimiento (knowledge distillation, KD) frente al entrenamiento clasico por prediccion del siguiente token (NTP).

Todos los checkpoints comparten una unica arquitectura: un decoder denso tipo Qwen3 de 0,7B con 28 capas y tamano oculto de 1024, acoplado al tokenizador de Qwen3.5 con un vocabulario de 248.320 entradas. Cada variante se entreno sobre 20.000 millones de tokens de texto web DCLM deduplicado, mezclado con documentos de un unico dominio (Wikipedia o Project Gutenberg) repetidos 64 veces, lo que permite comparar el efecto de distintos objetivos de entrenamiento sobre la memorizacion y la transferencia de conocimiento.

Su relevancia es metodologica: ofrece una matriz controlada de experimentos (NTP frente a KD con profesor limpio, profesor memorizante y objetivos de destilacion modificados) sobre dos dominios distintos, con la misma arquitectura y el mismo presupuesto de tokens. La licencia Apache 2.0 facilita su reutilizacion en laboratorio, aunque la propia autora advierte de que no esta instruido, no ha sido evaluado en seguridad y no esta pensado para uso downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (estilo Qwen3) |
| Parametros totales | 0,7B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Detalles adicionales confirmados en la model card: 28 capas, tamano oculto 1024, tokenizador Qwen3.5 con vocabulario de 248.320 tokens, sin token BOS, y tokenizacion de documentos como `text + "\n"` con `add_special_tokens=False`. El repositorio ocupa 11,1 GB en total, repartido entre los multiples subdirectorios de checkpoints.

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 0,7B parametros con 28 capas y dimension oculta 1024, siguiendo el diseno de Qwen3 pero con el tokenizador de Qwen3.5 (vocabulario de 248.320 entradas). No se trata de un modelo MoE ni de una arquitectura hibrida: todos los parametros se activan en cada forward pass.

El entrenamiento se realizo desde cero sobre 20.000 millones de tokens de texto web DCLM deduplicado, mezclado con documentos de un dominio especifico (Wikipedia o Project Gutenberg) donde cada documento del dominio se repitio 64 veces. Esta repeticion deliberada sirve para inducir memorizacion controlada y estudiar como se comporta la destilacion en ese regimen. Existen cuatro objetivos por dominio: prediccion del siguiente token (`_ntp`), destilacion desde Qwen3.5-9B-Base (`_kd_clean_teacher`), destilacion desde un Qwen3.5-9B-Base ajustado sobre parte de los datos del dominio, es decir, un profesor memorizante (`_kd_memorizing_teacher`), y una variante con objetivos de destilacion modificados (`_kd_memorizing_teacher_modified`). No se menciona RLHF, DPO ni ajuste por instrucciones en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva basica, limitada al regimen de modelado de lenguaje preentrenado.
- Modelado del siguiente token sobre texto web generico (DCLM) y sobre dominios especificos (Wikipedia y Project Gutenberg).
- Memorizacion controlada de documentos del dominio de entrenamiento, util para estudiar fenomenos de regurgitacion.
- Destilacion de conocimiento desde un profesor de 9B (Qwen3.5-9B-Base) hacia un alumno de 0,7B.
- No dispone de ajuste por instrucciones: no sigue instrucciones de forma fiable.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Capacidades multilingues: no disponibles (no se especifican idiomas).

## Casos de uso

- Investigacion en destilacion de conocimiento: comparar directamente, con la misma arquitectura y presupuesto de tokens, el rendimiento de NTP frente a KD con profesor limpio, memorizante y objetivos modificados. Es el proposito explicito del repositorio.
- Estudio de memorizacion y regurgitacion: los checkpoints con documentos repetidos 64 veces permiten medir cuanto contenido del dominio se memoriza y como varia segun el objetivo de entrenamiento.
- Analisis de profesores memorizantes: la variante `_kd_memorizing_teacher` permite estudiar si un profesor ajustado sobre el dominio transfiere mejor (o peor) el conocimiento al alumno que un profesor limpio.
- Reproduccion de experimentos a pequena escala: con 0,7B parametros y 20B tokens, el coste de reentrenamiento es asumible en un laboratorio academico, lo que facilita replicar y extender los resultados.
- Benchmarking de tecnicas de KD: usar los checkpoints como linea base frente a nuevas variantes de destilacion (por ejemplo, cambios en la temperatura, en la mezcla de perdidas o en la seleccion de datos).
- Estudio de tokenizadores de vocabulario grande: el uso del tokenizador de Qwen3.5 (248.320 entradas) sobre un modelo de 0,7B permite analizar el equilibrio entre tamano de embedding y capacidad del modelo.
- Analisis de dominio acotado: los checkpoints de Gutenberg son utiles para estudiar generacion de texto literario de estilo antiguo en un regimen puramente preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 0,7B parametros ocupan aproximadamente 1,4 GB de pesos; con overhead de activaciones y cache KV, el consumo realista se situa en torno a 2-3 GB para contextos cortos.
- En cuantizacion de 8 bits, los pesos bajan a unos 0,7 GB; en 4 bits, a unos 0,35 GB, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 lo ejecutan con holgura. En datacenter, una A100 o H100 esta sobredimensionada para inferencia de un solo modelo, pero permite lotes grandes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: la carga oficial documentada es via `transformers` con `AutoModelForCausalLM.from_pretrained` indicando el subfolder. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no haber ficheros GGUF publicados seria necesario convertirlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| jacquelinehe/kd-0.7b-ckpts | 0,7B | no disponible | Apache 2.0 | Checkpoints de investigacion en KD, sin ajuste por instrucciones | Hugging Face |
| Qwen3-0.6B | 0,6B | no disponible en esta ficha | Apache 2.0 | Modelo base e instruido, uso general | Hugging Face |
| Qwen2.5-0.5B | 0,5B | no disponible en esta ficha | Apache 2.0 | Modelo base e instruido, uso general | Hugging Face |
| SmolLM2-360M | 0,36B | no disponible en esta ficha | Apache 2.0 | Modelo pequeno de uso general con variantes instruidas | Hugging Face |

La comparacion debe interpretarse con cautela: los tres modelos alternativos son productos finales con ajuste por instrucciones y evaluaciones publicas, mientras que los checkpoints de jacquelinehe son artefactos de investigacion sin evaluar. La ventaja del modelo descrito no es el rendimiento absoluto, sino la disponibilidad de una matriz controlada de experimentos de destilacion que los modelos comerciales no ofrecen.

## Limitaciones y advertencias

- No esta ajustado por instrucciones: no debe usarse como asistente conversacional ni en aplicaciones de cara al usuario.
- No ha sido evaluado en seguridad; la autora lo declara explicitamente como artefacto de investigacion y no apto para uso downstream.
- Riesgo elevado de alucinacion y de regurgitacion de texto de entrenamiento, especialmente en los checkpoints entrenados con documentos repetidos 64 veces.
- Sesgos desconocidos: al entrenarse sobre DCLM y dominios acotados, hereda los sesgos del corpus web sin mitigacion documentada.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin verificacion empirica.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Ausencia de token BOS y tokenizacion con `add_special_tokens=False`: cualquier integracion debe replicar exactamente el preprocesado de la model card para evitar degradacion.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y de ajuste por instrucciones hace desaconsejable ese escenario en la practica.
- El repositorio agrupa multiples subdirectorios; es imprescindible indicar el `subfolder` correcto al cargar, ya que no existe un checkpoint "por defecto".

## Enlaces

- Hugging Face: https://huggingface.co/jacquelinehe/kd-0.7b-ckpts
- Perfil de la autora: https://huggingface.co/jacquelinehe
- Modelo profesor citado (Qwen3.5-9B-Base): no disponible en la informacion proporcionada
- Paper, blog o repositorio asociado: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
