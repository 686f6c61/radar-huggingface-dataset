# Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r05

## Resumen

`svd-safety-l2_remove50_swapgapnet_b010_r05` es un checkpoint experimental derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. No es un modelo de proposito general: es una celda concreta dentro de una rejilla de experimentos que estudia como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y que reglas de seleccion de componentes permiten repararlo. El modelo base se comprimio con SVD-LLM hasta eliminar el 50,01% de los parametros densos (fraccion resultante de 0,4999) y despues se aplicaron 5 de las 10 rondas previstas de una edicion iterativa de intercambio de parametros, con un presupuesto de restauracion del 1,000% de los parametros densos y una cuota de 0,100% por ronda.

La innovacion del artefacto esta en el metodo de reparacion: la regla de seleccion `gap_iter` escoge 2.940 componentes que se restauran y 2.940 que se expulsan, con un valor de intercambio `net` (valor de insercion mas valor de eliminacion del descarte ordenado por sigma). En total se reintroducen 32.358.144 parametros, el 0,50% de las proyecciones densas. La semilla es 42 y el checkpoint corresponde a una ronda intermedia de una ejecucion mas larga, por lo que existen otras celdas con presupuestos y reglas distintas.

Es relevante ahora porque cuantifica de forma explicita el coste de seguridad de la compresion agresiva: la propia model card advierte de que la compresion por si sola eleva la tasa de exito de ataques y de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo original. El checkpoint pesa 13,5 GB en safetensors, declara 6.738.415.616 parametros y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-2) con compresion SVD-LLM aplicada a las proyecciones |
| Parametros totales | 6.738.415.616 (recuento real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-2-7b-chat trabaja con 4.096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible (no declarado; el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Identificador | Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r05 |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Fraccion de parametros resultante | 0,4999 (50,01% de parametros densos eliminados) |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda) |
| Rondas aplicadas | 5 de 10 |
| Componentes restaurados / expulsados | 2.940 / 2.940 |
| Parametros reintroducidos | 32.358.144 (0,50% de las proyecciones densas) |
| Tamano del repositorio | 13,5 GB |
| Libreria | transformers |
| Fecha de creacion / actualizacion | 14 de septiembre de 2026 / 14 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm y activaciones SwiGLU. Sobre ese modelo no se ha entrenado nada nuevo: lo que se ha hecho es una compresion estructural con SVD-LLM que elimina el 50,01% de los parametros densos, reduciendo el rango de las proyecciones implicadas. Sobre el modelo comprimido se aplica despues un procedimiento de edicion de parametros por intercambio, iterativo y neutral en numero de parametros: en cada ronda se restauran 2.940 componentes desde el modelo original y se expulsan otros 2.940, con un valor de intercambio `net` calculado a partir del valor de insercion y del valor de eliminacion del descarte ordenado por sigma.

No hay informacion en la documentacion proporcionada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre fases de RLHF o DPO adicionales; el checkpoint hereda el ajuste conversacional del modelo base. La innovacion tecnica destacable es el propio protocolo experimental: la regla `gap_iter` compite contra otras reglas de seleccion dentro de una rejilla de presupuestos, y este checkpoint es una ronda intermedia (5 de 10) de una ejecucion con semilla 42. Nota tecnica relevante para quien vaya a inspeccionar los pesos: el recuento de parametros del repositorio coincide con el del modelo denso sin comprimir, de modo que la reduccion del 50% declarada se refiere a la fraccion de parametros efectivamente utilizados o restaurados por el metodo, no a un recorte del numero de tensores almacenados.

## Capacidades

- Generacion de texto conversacional: conserva la interfaz de chat del modelo base Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones: capacidades heredadas del modelo base, sin evaluacion publicada en la informacion disponible.
- Generacion de codigo y matematicas: no se han publicado resultados especificos para este checkpoint.
- Tool calling / function calling: no declarado ni documentado en la model card.
- Uso como agente y razonamiento multi-paso: no declarado; no hay evidencia de evaluacion en ese sentido.
- Capacidades multilingues: no declaradas; el modelo base esta orientado principalmente al ingles.
- Capacidades especiales: no incluye vision, audio ni modo de razonamiento explicito. Su rasgo diferencial es el comportamiento de rechazo y de resistencia a ataques, medido con AdvBench, StrongREJECT y WildGuard, que es precisamente el objeto de estudio.

## Casos de uso

- Investigacion sobre seguridad bajo compresion: sirve como sujeto experimental para medir cuanto sube la tasa de exito de ataque (ASR) al comprimir un modelo alineado al 50% y cuanto se recupera tras aplicar rondas de edicion. Su ASR medido en AdvBench es 0,3250 y en StrongREJECT 0,3259 con juez HarmBench.
- Evaluacion comparativa de reglas de seleccion de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, permite contrastar `gap_iter` frente a otras reglas manteniendo constante el presupuesto de restauracion del 1,000%.
- Analisis del equilibrio entre seguridad y utilidad: la metrica de sobre-rechazo macro medida con WildGuard (0,0640) permite comprobar si la reparacion de seguridad introduce rechazos excesivos en peticiones benignas.
- Reproduccion de experimentos: la semilla 42 y los parametros documentados (2.940 componentes restaurados, 32.358.144 parametros reintroducidos) permiten replicar la ronda 5 de 10 y verificar la trazabilidad del protocolo.
- Interpretabilidad de mecanismos internos: la edicion localizada de componentes concretos hace de este checkpoint un objeto util para estudiar que subespacios de las proyecciones estan asociados a comportamientos de rechazo.
- Estudio de metodologias de compresion: sirve para analizar las limitaciones practicas de SVD-LLM en terminos de degradacion funcional, mas alla de las metricas de perplejidad habituales.
- Docencia y formacion en evaluacion de modelos: es un ejemplo claro de artefacto de investigacion que no debe desplegarse y que ilustra por que hay que evaluar antes de asumir que un checkpoint derivado conserva las propiedades del original.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodologia |
|---|---|---|
| AdvBench ASR | 0,3250 | HarmBench judge |
| StrongREJECT ASR | 0,3259 | HarmBench judge |
| Macro over-refusal | 0,0640 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card aporta unicamente las tres metricas de seguridad y rechazo recogidas en la tabla anterior.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 13,5 GB solo para pesos (el repositorio ocupa exactamente 13,5 GB), mas overhead de activaciones y cache KV; con contexto completo de 4.096 tokens conviene reservar entre 16 y 18 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB de pesos, con margen para contexto en GPUs de 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3,5-4 GB de pesos, viable en GPUs de 8 GB. Estas cifras son estimaciones aritmeticas a partir del numero de parametros; el autor no publica requisitos oficiales.
- GPU recomendadas para servicio: A100 (40 o 80 GB), H100, L40S. Para inferencia en fp16 en una sola GPU, una RTX 4090 o RTX 3090 de 24 GB es suficiente en terminos de memoria.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y equivalentes; en tarjetas de 8-12 GB solo con cuantizacion.
- Opciones de despliegue: transformers y safetensors de forma nativa; el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que TGI y los endpoints compatibles son las rutas previstas por el autor. No hay confirmacion oficial de soporte en vLLM, llama.cpp, Ollama ni LM Studio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.
- Advertencia de despliegue: al tratarse de un checkpoint de investigacion con seguridad degradada de forma deliberada, no deberia exponerse como servicio accesible al publico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapnet_b010_r05 | 6.738.415.616 (fraccion densa efectiva 0,4999) | No disponible (base: 4.096 tokens) | AdvBench 0,3250 / StrongREJECT 0,3259 | Llama 2 Community License | Publico en HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | No disponible en la informacion proporcionada (del orden de 7.000 millones) | No disponible en la informacion proporcionada | No disponible; la model card solo indica cualitativamente que la compresion eleva la tasa de exito de ataque | Llama 2 Community License | Publico en HuggingFace |
| Otros checkpoints comprimidos con SVD-LLM | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa con otros modelos de la misma categoria no es posible.

## Limitaciones y advertencias

- Modelo deliberadamente degradado en seguridad: la model card indica de forma explicita que varias celdas de la rejilla son menos seguras que Llama-2-7b-chat y que la compresion por si sola eleva la tasa de exito de ataque. La tasa de ataque medida (0,3250 en AdvBench) debe interpretarse como un resultado experimental, no como una garantia de seguridad.
- No es un asistente desplegable: el propio autor lo describe como sujeto experimental, no como un modelo de chat de proposito general. No debe usarse en produccion ni en aplicaciones de cara al usuario.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la compresion agresiva del modelo base hace razonable esperar un aumento del deterioro en la coherencia y la factualidad, pero no hay mediciones que lo confirmen.
- Riesgo de sobre-rechazo: la metrica macro de sobre-rechazo con WildGuard es 0,0640, lo que indica que la reparacion de seguridad mantiene un nivel bajo de rechazos indebidos en este checkpoint concreto, aunque sin comparacion publicada frente al modelo base.
- Idiomas: no se declaran idiomas soportados. El modelo base esta orientado al ingles y no hay evidencia de comportamiento fiable en castellano.
- Contexto limitado: la ventana heredada del modelo base es de 4.096 tokens, insuficiente para casos de uso que requieran contextos largos.
- Restricciones de licencia: se aplica la Llama 2 Community License, que no es una licencia de codigo abierto estandar y que incorpora un documento de politica de uso aceptable. El repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso de este derivado queda vinculado por ambos. Es imprescindible revisar esos ficheros antes de cualquier uso, incluido el comercial.
- Trazabilidad limitada: el checkpoint es una ronda intermedia (5 de 10) de una ejecucion mas larga, lo que significa que no representa el resultado final del protocolo experimental. Cualquier conclusion extraida de esta celda debe contrastarse con las demas celdas de la rejilla.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de terceros.
- Discrepancia de recuento de parametros: el repositorio declara 6.738.415.616 parametros, coherente con el modelo denso sin comprimir, mientras que la model card declara una fraccion resultante de 0,4999. Conviene verificar como se materializa la compresion en los tensores antes de asumir un ahorro real de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces relevantes en la busqueda web. Los resultados devueltos correspondian a noticias sobre elecciones municipales en Grossenkneten (Alemania) y no guardan ninguna relacion con el modelo.
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos asociados a este checkpoint o al estudio del que forma parte.
