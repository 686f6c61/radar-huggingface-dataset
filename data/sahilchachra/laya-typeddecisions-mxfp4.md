# sahilchachra/Laya-TypedDecisions-MXFP4

## Resumen

Laya-TypedDecisions-MXFP4 es una version cuantizada del encoder ModernBERT que sirve de columna vertebral al modelo de decisiones tipadas de convaiinnovations/laya. Lo publica el usuario sahilchachra y su proposito es ofrecer, en formato MLX para Apple Silicon, unicamente el encoder bidireccional compartido de Laya, sin la cabeza de decision. Se trata por tanto de un extractor de caracteristicas y no de un modelo generativo: no existe ruta de `generate()` ni plantilla de chat.

El modelo base es convaiinnovations/laya, un sistema de "System 1" no autorregresivo que decide en lugar de conversar, con respuestas tipadas y probabilidades calibradas. De ese sistema, este repositorio conserva el backbone ModernBERT-large (1024 de tamano oculto, 28 capas, contexto de 1024 tokens) cuantizado a MXFP4 con `mlx-embeddings` y group size 32. La cabeza de decision original (aproximadamente 15M de parametros: un `torch.nn.TransformerEncoder` de 2 capas, un scorer de marcadores de opcion y un head de actuar/escalar) no se incluye, porque es un modulo torch pequeno que no se beneficia de la cuantizacion.

Su relevancia es practica: permite ejecutar el encoder en Mac con unos 210 MB en disco, en lugar de la huella bf16/fp32 completa, para quienes quieren un extractor de caracteristicas cuantizado o construir su propia cabeza MLX encima. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas, aunque el proyecto Laya matriz se distribuye bajo Apache-2.0 y su version multilingue cubre mas de 100 idiomas. La model card incluye un aviso honesto: al ser un encoder pequeno con abundantes LayerNorm, es mas sensible a la cuantizacion por bloques que los modelos decoder-only modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder bidireccional, `ModernBertModel` via `mlx-embeddings`) |
| Parametros totales | 394.781.696 segun safetensors; la model card cita 421M para el backbone ModernBERT-large |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | MXFP4 (este repositorio); el autor publica tambien variantes MXFP8 |
| Idiomas soportados | no disponible en este repositorio; existen variantes English y Multilingual del mismo autor |
| Licencia | no disponible (el modelo base convaiinnovations/laya-typed-decisions declara Apache-2.0) |
| Formato de pesos | safetensors (repo de 0,2 GB; ~210 MB en disco) |
| Biblioteca | mlx (MLX para Apple Silicon) |
| Tamano oculto | 1024 |
| Numero de capas | 28 |
| Cabezas de atencion | no disponible |
| Atencion local / global | `local_attention` 128, `global_attn_every_n_layers` 3 |
| Modelo base | convaiinnovations/laya |
| Pipeline declarado | feature-extraction (tags adicionales: text-classification, encoder) |
| Group size de cuantizacion | 32 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional ModernBERT de tipo large, con 1024 de dimension oculta y 28 capas. Emplea una combinacion de atencion local (ventana de 128 tokens) y atencion global cada 3 capas, con parametros RoPE separados para cada tipo (`full_attention` y `sliding_attention`). El port a MLX se realiza mediante `mlx-embeddings` y la cuantizacion se aplica con `nn.quantize(..., mode="mxfp4", group_size=32)`, seleccionando los modulos que exponen `to_quantized` y cuyas escalas estan presentes en el fichero de pesos.

No hay datos publicados en la informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO para este checkpoint concreto. La model card indica que el modelo del que deriva se entreno por separado con RL (RLCD) para la parte de decision, pero esa cabeza no forma parte de este repositorio: aqui solo se publica el encoder compartido, ya entrenado en el modelo base, y unicamente sometido a cuantizacion. El autor verifico el port en dos fases: primero comprobo la correccion numerica del encoder MLX sin cuantizar contra la referencia torch (diferencia absoluta maxima 0,045 y media 0,0025 sobre estados ocultos con magnitud media de 0,63); despues alimento la cabeza de decision torch original e inalterada con la salida del encoder cuantizado y comparo con el pipeline de referencia completo.

## Capacidades

- Extraccion de caracteristicas: genera `last_hidden_state` a partir de texto tokenizado, apto como embedding de frase o de token.
- Clasificacion de texto: la etiqueta del repositorio incluye `text-classification`, aunque la cabeza concreta no se distribuye y debe aportarla el usuario.
- Construccion de cabezas personalizadas en MLX sobre el encoder congelado o ajustado.
- Procesamiento de decisiones tipadas de Laya, siempre que el usuario conecte su propia cabeza de decision compatible.
- Inferencia en Apple Silicon mediante MLX, sin dependencia de CUDA ni de servicios en la nube.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder no autorregresivo y no tiene plantilla de chat.
- Capacidades multilingues: no declaradas para este checkpoint; el proyecto Laya matriz anuncia enrutado multilingue sobre mas de 100 idiomas y el autor publica variantes `English` y `Multilingual` del mismo encoder.
- Capacidades especiales: cuantizacion MXFP4 de 4 bits con group size 32; no hay modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica local en Mac: el encoder produce embeddings que se pueden indexar en una base vectorial y consultar sin salir del equipo, con una huella en disco de unos 210 MB y sin coste de API.
- Clasificacion de texto en produccion: entrenar una cabeza lineal o un MLP sobre el `last_hidden_state` congelado para moderacion de contenido, analisis de sentimiento o etiquetado de tickets, aprovechando que la cuantizacion solo afecta al backbone.
- Deduplicacion y agrupamiento de corpus: calcular embeddings de grandes conjuntos de documentos en local y aplicar clustering o similitud coseno para detectar duplicados antes de entrenar otros modelos.
- Filtrado previo de consultas en un pipeline RAG: usar el encoder como clasificador rapido que decide si una consulta debe ir a un recuperador, a un LLM mayor o descartarse, manteniendo el coste en el propio dispositivo.
- Prototipado de cabezas de decision tipadas: reproducir el esquema de Laya (marcadores de opcion, scorer y head de actuar/escalar) en MLX y validar el comportamiento con el encoder ya cuantizado.
- Evaluacion de cuantizacion en tareas sensibles: comparar MXFP4 frente a MXFP8 sobre la misma cabeza de decision para medir si la perdida de calibracion es aceptable antes de desplegar, dado que la model card documenta perturbaciones del 35-45% en los estados ocultos.
- Preprocesamiento por lotes en estaciones de trabajo Apple: extraer caracteristicas de miles de frases cortas para alimentar modelos downstream, aprovechando la ventana de 1024 tokens y la ejecucion en memoria unificada.
- Investigacion sobre encoders eficientes: servir de referencia para estudiar como afecta la cuantizacion por bloques a arquitecturas con LayerNorm intensivo, un escenario poco cubierto por los estudios centrados en decoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible: el modelo no es generativo y no tiene sentido evaluarlo con esas pruebas. La model card si incluye una verificacion numerica frente a la referencia torch, que se reproduce a continuacion.

| Metrica | MXFP4 | MXFP8 |
|---|---|---|
| Diferencia absoluta media del estado oculto del encoder frente a fp32 | 0,287 | 0,218 |
| Diferencia absoluta maxima del logit de la cabeza de decision | 0,313 | 0,646 |
| Respuestas top-1 incorrectas (de 3 preguntas de prueba) | 0/3 | 1/3 |

Como referencia adicional de portabilidad, la correccion del port MLX sin cuantizar frente a la referencia torch arrojo una diferencia absoluta maxima de 0,045 y media de 0,0025 sobre estados ocultos de magnitud media 0,63. Top-1 coincidio en 5 de 6 combinaciones de checkpoint y modo. El autor advierte que la deriva de los estados ocultos es del 35-45% en terminos relativos, muy superior al 1-5% tipico de la cuantizacion MXFP4 en LLM decoder-only.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con MLX. No hay soporte CUDA y el repositorio no incluye pesos bf16/fp32.
- Disco: aproximadamente 210 MB para el repositorio completo (0,2 GB reportados por HuggingFace).
- Memoria unificada estimada para inferencia: en torno a 0,5 GB considerando pesos cuantizados, activaciones y tokenizer para secuencias de hasta 1024 tokens.
- GPU recomendadas: chips de la serie M de Apple (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No aplica A100, H100 ni RTX 4090.
- Cabe en cualquier Mac con Apple Silicon; el limite practico es la memoria unificada disponible, no la VRAM dedicada.
- Opciones de despliegue: `mlx-embeddings` con `mlx.core` y `mlx.nn` (el ejemplo de la model card usa `safe_open` y `nn.quantize`); el repositorio mizorewww/laya-mlx ofrece un runtime nativo MLX para modelos de decision de Laya. No aplican vLLM, TGI ni Ollama para este formato, y LM Studio queda descartado por no existir ruta de chat ni `generate()`. No se documenta conversion a GGUF.
- Latencia y throughput: no medidos para este checkpoint concreto en la informacion disponible. El repositorio laya-mlx reporta decisiones cortas de 7 a 14 ms en un M3 Max, y el proyecto Laya anuncia latencias del orden de 21 a 33 ms para el sistema de decision completo; ambas cifras corresponden a la pila de Laya, no a este encoder aislado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sahilchachra/Laya-TypedDecisions-MXFP4 | 394,8M (safetensors) | 1024 | safetensors MLX, MXFP4 | no disponible | Solo encoder, sin cabeza de decision |
| sahilchachra/Laya-TypedDecisions-MXFP8 | no disponible | 1024 | safetensors MLX, MXFP8 | no disponible | Misma pieza con cuantizacion de 8 bits |
| sahilchachra/Laya-English-MXFP4 y Laya-Multilingual-MXFP4 | no disponible | 1024 | safetensors MLX, MXFP4 | no disponible | Variantes idiomaticas del mismo encoder |
| convaiinnovations/laya-typed-decisions | no disponible | no disponible | Transformers, safetensors | Apache-2.0 | Sistema completo con cabeza de decision, en torch |
| answerdotai/ModernBERT-large | ~395M | 8192 tokens en el modelo original | safetensors bf16/fp32 | Apache-2.0 | Modelo de referencia sin cuantizar; el autor lo cita como base de verificacion |

La comparacion directa con ModernBERT-large esta limitada porque la model card describe el backbone de Laya con contexto de 1024 tokens, muy por debajo de la ventana extendida del modelo original de Answer.AI, lo que sugiere un recorte o una configuracion especifica del proyecto Laya. No se dispone de datos para comparar rendimiento en tareas de clasificacion con las alternativas.

## Limitaciones y advertencias

- Licencia no declarada en este repositorio. El modelo base convaiinnovations/laya-typed-decisions indica Apache-2.0, pero la ausencia de licencia explicita en este derivado impide asumir esos mismos terminos para uso comercial sin consultar al autor.
- Sin cabeza de decision: no reproduce la API `laya.load(...)` ni `RLAgent`, que esperan un directorio de modelo torch. Para usar Laya tal cual, hay que acudir al repositorio original convaiinnovations/laya.
- Alto riesgo de perdida de calibracion: la model card documenta una perturbacion media del 35-45% en los estados ocultos con MXFP4 y MXFP8, y una de cada tres preguntas de prueba cambio su respuesta top-1 en MXFP8. Las puntuaciones de confianza cuantizadas deben tratarse como orientativas, no exactas.
- Sensibilidad a la cuantizacion superior a la de los decoder-only: al ser un encoder pequeno con muchas LayerNorm, la cuantizacion por bloques le afecta mas que a un LLM moderno.
- Evidencia empirica muy limitada: la validacion end-to-end se hizo sobre 3 preguntas de prueba, por lo que las conclusiones estadisticas son fragiles.
- Sin generacion de texto, sin tool calling, sin agentes y sin plantilla de chat. No es apto para asistentes conversacionales ni para LM Studio.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos sin troceado previo.
- Idiomas soportados no declarados para este checkpoint; el comportamiento fuera del ingles o de los idiomas cubiertos por la variante multilingue no esta garantizado.
- Dependencia de plataforma: solo Apple Silicon con MLX. No hay ruta oficial a CUDA ni pesos sin cuantizar en el repositorio.
- Sesgos: no hay informacion disponible sobre evaluaciones de sesgo, toxicidad o equidad para este checkpoint.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de puntuaciones mal calibradas al usar la salida como probabilidad.
- Adopcion nula: 0 descargas y 0 likes, sin comunidad que haya validado el artefacto de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahilchachra/Laya-TypedDecisions-MXFP4
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Sistema de decisiones tipadas original: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Variante MXFP8 del mismo encoder: https://huggingface.co/sahilchachra/Laya-TypedDecisions-MXFP8
- Variante English MXFP4: https://huggingface.co/sahilchachra/Laya-English-MXFP4
- Variante English MXFP8: https://huggingface.co/sahilchachra/Laya-English-MXFP8
- Variante Multilingual MXFP4: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP4
- Variante Multilingual MXFP8: https://huggingface.co/sahilchachra/Laya-Multilingual-MXFP8
- Runtime nativo MLX para Laya: https://github.com/mizorewww/laya-mlx
- Libreria mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
- MLX (Apple): https://github.com/ml-explore/mlx
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Analisis independiente de Laya: https://brainfunctioncollapse.com/laya
- Perfil del autor: https://github.com/SahilChachra/SahilChachra
