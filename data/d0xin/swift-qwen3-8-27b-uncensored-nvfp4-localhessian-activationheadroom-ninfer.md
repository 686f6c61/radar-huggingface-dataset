# d0xin/Swift-Qwen3.8-27B-Uncensored-NVFP4-LocalHessian-ActivationHeadroom-NInfer

## Resumen

Swift-Qwen3.8-27B-Uncensored-NVFP4-LocalHessian-ActivationHeadroom-NInfer es una compilacion cuantizada nativa para el runtime NInfer del modelo `d0xin/Swift-Qwen3.8-27B-Uncensored-BF16`, publicado por el usuario d0xin. Se trata de un modelo multimodal (pipeline `image-text-to-text`) de la familia Qwen3.8, con 27B de parametros segun su denominacion, al que se le ha aplicado un proceso de "uncensoring" para reducir el comportamiento de rechazo, y que despues se ha recuantizado desde BF16 a una topologia mixta NVFP4/FP8 usando calibracion Local-Hessian de NVIDIA ModelOpt con margen de activacion (activation headroom).

El objetivo declarado de la release es doble: conservar las capacidades de razonamiento, uso de herramientas (tool calling), comportamiento agentico, multimodalidad y contexto largo del modelo original, eliminando al mismo tiempo las respuestas de rechazo; y, en el plano de la eficiencia, aumentar el throughput de inferencia y reducir el uso de VRAM manteniendo una calidad medida equivalente a FP8 y sin alargar las trazas de razonamiento bajo el perfil de servicio recomendado (B2048, es decir, un presupuesto de pensamiento por defecto de 2048 tokens).

La relevancia de esta ficha es acotada: el modelo tiene 0 descargas y 1 "like" en el momento de la consulta, esta atado a un runtime propietario (NInfer), a una revision concreta del mismo y a hardware NVIDIA Blackwell `sm_120a`, y su licencia (`swift-open-license-1.0`) es de tipo "other", lo que obliga a revisar el texto completo antes de cualquier uso. Los resultados publicados por el autor se limitan a un subconjunto fijo de MMLU-Pro, una evaluacion de rechazo con 100 prompts y mediciones de rendimiento en una RTX PRO 6000 Blackwell Workstation Edition.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa (self-attention) y atencion lineal / proyecciones GDN, mas torre de vision, MTP y cabeza de propuesta optimizada (DFlash2). No se especifica en la informacion disponible si es MoE |
| Parametros totales | 27B segun la denominacion del modelo (no se aporta cifra exacta en la model card) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no declarada de forma explicita. Perfiles de servicio citados: `--kv-capacity 262144` en la RTX PRO 6000, y en RTX 5090 aproximadamente 252.928 tokens de contexto maximo solo texto y 81.920 tokens con vision activada (datos de NInfer upstream, no de este artefacto concreto) |
| Tipos de cuantizacion | Mixta: MLP capas 0-55 en NVFP4 W4A4; MLP capas 56-63 en FP8 por filas (row-wise); proyecciones de self-attention en FP8 row-wise; proyecciones de atencion lineal / GDN en FP8 row-wise; GDN a/b en BF16; LM head en FP8 row-wise; embeddings en FP8 row-wise |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other`; enlace al texto en la model card) |
| Formato de pesos | Artefacto nativo `.ninfer` (`Swift-Qwen3.8-27B-Uncensored-NVFP4-LH-ActHeadroom.ninfer`), 23.719.715.844 bytes, 1.246 objetos almacenados, SHA-256 `a298e28529a31f5447574ba2ad5ba5812d952053292ca017115f9d735dfdadcd` |
| Tamano del repositorio | 23,7 GB |
| Modelo base | d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 (relacion: quantized) |
| Runtime requerido | NInfer, revision validada `f76e19c0fbd026c86f46005acf2c80c54084bade` |
| Hardware objetivo | NVIDIA Blackwell `sm_120a` |
| Descargas / likes | 0 descargas, 1 like |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

La model card no describe un entrenamiento desde cero, sino un proceso de recuantizacion sobre `d0xin/Swift-Qwen3.8-27B-Uncensored-BF16`, que a su vez deriva del linaje Swift-Qwen3.8-27b del que se enlaza la licencia. La topologia del artefacto es mixta y por capas: las 56 primeras capas del MLP (0-55) se almacenan en NVFP4 con activaciones de 4 bits (W4A4), mientras que las capas 56-63 del MLP se mantienen en FP8 por filas. Las proyecciones de self-attention, las de atencion lineal/GDN, el LM head y los embeddings van en FP8 row-wise, y unicamente los parametros a/b del bloque GDN permanecen en BF16. El hecho de que se mencionen capas MLP hasta la 63 sugiere una profundidad de 64 capas, aunque la model card no lo confirma de forma explicita. La arquitectura combina atencion completa con atencion lineal (GDN, presumiblemente Gated DeltaNet), lo que la situa en la categoria de transformers hibridos orientados a contexto largo, e incorpora torre de vision, prediccion multi-token (MTP) y una cabeza de propuesta optimizada para decodificacion especulativa (DFlash2) dentro del mismo artefacto.

El proceso de calibracion es el elemento tecnico diferencial: se uso NVIDIA ModelOpt con calibracion Local-Hessian, margen de activacion (activation headroom), barrido de escalas FP8 (FP8 scale sweep), checkpointing por capas, `upper_percentile=99.99` y `rho=16384`. La model card insiste en que no se trata de un reempaquetado de un checkpoint NVFP4 preexistente, sino de una recuantizacion desde BF16 con esta receta. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si hubo RLHF o DPO; el ajuste de comportamiento se describe unicamente como "eliminacion del comportamiento de rechazo", sin detallar el procedimiento.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable: el autor recomienda `--default-thinking-budget 2048` en NInfer; sin ese presupuesto, 36 de 280 generaciones de la evaluacion alcanzaron el techo de 4096 tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`): el artefacto incluye explicitamente el componente Vision junto a Text, MTP y DFlash2.
- Uso de herramientas y comportamiento agentico: la model card afirma que se preservan las capacidades de tool calling y agenticas del modelo original, aunque no aporta evaluaciones especificas de tool calling.
- Contexto largo: los perfiles de servicio citados llegan a `--kv-capacity 262144`, con un maximo reportado por NInfer upstream de 252.928 tokens solo texto en RTX 5090 y 81.920 tokens con vision activada.
- Capacidad multilingue: no disponible; la model card no enumera idiomas.
- Decodificacion especulativa: incluye una cabeza de propuesta optimizada y soporte DFlash2 en el propio artefacto, lo que habilita ese modo en el runtime.
- Comportamiento de no rechazo: en la evaluacion fija Swift ORCA-K1 de 100 prompts, con `temperature=0`, `seed=42`, `max_tokens=1536` y pensamiento desactivado, se obtuvo 90 DIRECT, 10 SAFETY_DEFLECT, 0 REFUSE y 0 OTHER_FAILURE.
- Capacidades no documentadas: no se mencionan audio, video ni otras modalidades mas alla de imagen y texto.

## Casos de uso

- Procesamiento de documentos con imagen y texto: el modelo acepta entradas `image-text-to-text`, de modo que puede extraer y razonar sobre informacion de capturas, diagramas o documentos escaneados combinados con instrucciones textuales, siempre que se sirva con Vision habilitada y se ajuste el perfil de contexto al presupuesto de VRAM disponible (81.920 tokens en el caso de RTX 5090).
- Analisis de corpus largos con atencion hibrida: la combinacion de atencion completa y atencion lineal GDN esta pensada para reducir el coste del contexto largo; con un perfil de `kv-capacity` alto permite resumir o interrogar documentos extensos en una sola pasada.
- Agentes con llamada a herramientas: el modelo conserva soporte de tool calling segun el autor, por lo que puede integrarse como planificador en bucles de agente que invoquen APIs externas, con la salvedad de que no se han publicado metricas especificas de fiabilidad en tool calling.
- Servicio de inferencia de alto throughput en hardware Blackwell: con perfiles C8 medidos en 110,58 tok/s de decodificacion y 9.615,82 tok/s de prefill, es adecuado para despliegues con concurrencia moderada en una unica GPU RTX PRO 6000 Blackwell Workstation Edition.
- Generacion de codigo dentro de pipelines de CI/CD: puede emplearse para revision automatica, generacion de parches o explicacion de diffs, apoyandose en el modo de pensamiento con presupuesto acotado para limitar la latencia.
- Investigacion sobre alineacion y comportamiento de rechazo: dado que el artefacto documenta una evaluacion de rechazo con 0/100 refusals y dispone de linea base FP8 comparable, resulta util como objeto de estudio en experimentos sobre filtrado a nivel de modelo y su efecto en la calidad (el autor reporta 225/280 frente a 224/280 en MMLU-Pro, con McNemar exacto p=1,0).
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar la receta de calibracion Local-Hessian con activation headroom, `upper_percentile=99.99` y `rho=16384`, el modelo sirve como referencia reproducible para medir el impacto de NVFP4 W4A4 en capas MLP frente a FP8 row-wise.
- Prototipado local en GPU de consumo: el autor indica que el artefacto deberia caber en una RTX 5090 de 32 GB, aunque advierte de que no lo ha validado directamente, por lo que este escenario es viable solo como expectativa y no como garantia.

## Benchmarks y rendimiento

Calidad, subconjunto fijo de MMLU-Pro (280 preguntas, 14 categorias, 20 por categoria, semilla `20260918`, `temperature=0`, `reasoning_effort=xhigh`, `max_tokens=4096`):

| Build | Aciertos | Precision |
|---|---:|---:|
| FP8 | 211/280 | 75,36% |
| NVFP4 Headroom | 207/280 | 73,93% |
| FP8 + B2048 | 224/280 | 80,00% |
| NVFP4 Headroom + B2048 | 225/280 | 80,36% |

Comparacion FP8+B2048 frente a esta build+B2048: 216 correctas en ambos, 47 incorrectas en ambos, 8 solo correctas en FP8, 9 solo correctas en NVFP4. McNemar exacto `p=1,0`; el autor concluye que no hay diferencia estadisticamente significativa en ese subconjunto.

Presupuesto de pensamiento recomendado (`--default-thinking-budget 2048`):

| Metrica | Sin presupuesto | Con B2048 |
|---|---:|---:|
| Generaciones que alcanzan el techo de 4096 tokens | 36/280 | 0/280 |
| Mediana de tokens de razonamiento | no disponible | 379,5 |
| Percentil 90 de tokens de razonamiento | no disponible | 2.072 |
| Media de tokens de razonamiento | no disponible | 741,87 |
| Precision | no disponible | 225/280 |

Rendimiento frente a FP8, en NVIDIA RTX PRO 6000 Blackwell Workstation Edition:

| Metrica | FP8 | Esta build | Cambio |
|---|---:|---:|---:|
| Decodificacion C1 | 134,87 tok/s | 162,32 tok/s | +20,4% |
| Decodificacion C8 | 87,33 tok/s | 110,58 tok/s | +26,6% |
| Prefill C1 | 6.633,88 tok/s | 8.876,31 tok/s | +33,8% |
| Prefill C8 | 6.960,00 tok/s | 9.615,82 tok/s | +38,2% |
| VRAM en NInfer | 41.358 MiB | 35.106 MiB | -15,1% |

Evaluacion de rechazo, Swift ORCA-K1 con 100 prompts (`temperature=0`, `seed=42`, `max_tokens=1536`, pensamiento desactivado):

| Clasificacion | Esta build | Respuestas historicas FP8 reevaluadas |
|---|---:|---:|
| DIRECT | 90 | 87 |
| SAFETY_DEFLECT | 10 | 12 |
| REFUSE | 0 | 1 |
| OTHER_FAILURE | 0 | 0 |

No hay datos publicos de MMLU completo, HumanEval, GSM8K ni de evaluaciones de tool calling en la informacion disponible. Las cifras de rendimiento son dependientes de hardware y carga de trabajo, segun el propio autor.

## Requisitos de hardware

- VRAM medida en el perfil de produccion del autor: aproximadamente 35,1 GiB con NInfer en RTX PRO 6000 Blackwell Workstation Edition, frente a 41.358 MiB del build FP8 equivalente. El perfil completo con `--kv-capacity 262144` y Vision activada no cabe en 32 GB.
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell Workstation Edition (validacion directa por el autor).
- GPU esperadas pero no validadas: RTX 5090 de 32 GB. El artefacto deberia caber, pero el autor advierte que no hay benchmark directo de esta build concreta en esa GPU y que no debe copiarse el perfil de la RTX PRO 6000 sin ajustes. En RTX 5090, NInfer upstream reporta para Qwen3.8-27B NVFP4 unos 252.928 tokens de contexto maximo solo texto y 81.920 con Vision.
- Compatibilidad: el runtime `.ninfer` actual apunta a NVIDIA Blackwell `sm_120a`. La model card empieza a indicar que no debe considerarse portable a Ampere y a otras arquitecturas (el texto proporcionado se corta en ese punto), por lo que la compatibilidad con generaciones anteriores queda explicitamente desaconsejada.
- Cabe en GPU de consumo: solo en RTX 5090 de 32 GB, y de forma esperada mas que verificada.
- Opciones de despliegue: NInfer es el unico runtime validado por el autor, en la revision `f76e19c0fbd026c86f46005acf2c80c54084bade`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato propietario `.ninfer` impide usar esos motores sin conversion previa, algo que la model card no documenta.
- Ajuste de servicio recomendado: `--default-thinking-budget 2048` para evitar que las generaciones alcancen el techo de salida y para reducir el consumo medio de tokens de razonamiento.
- Latencia y throughput: 162,32 tok/s de decodificacion con concurrencia 1 y 110,58 tok/s con concurrencia 8; 8.876,31 tok/s de prefill con concurrencia 1 y 9.615,82 tok/s con concurrencia 8, todos medidos en RTX PRO 6000 Blackwell Workstation Edition.

## Comparativa con modelos similares

Los unicos terminos de comparacion documentados son las variantes del propio artefacto y su linea base BF16. No se dispone de datos de terceros en la informacion proporcionada.

| Modelo | Parametros | Contexto | MMLU-Pro (subconjunto 280) | VRAM en NInfer | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-NVFP4-LH-ActHeadroom (esta build) | 27B (segun denominacion) | `--kv-capacity 262144` en el perfil del autor | 225/280 (80,36%) con B2048; 207/280 (73,93%) sin B2048 | 35.106 MiB | swift-open-license-1.0 | Repositorio HuggingFace, 0 descargas, 1 like |
| Misma build en FP8 | 27B (segun denominacion) | no disponible | 224/280 (80,00%) con B2048; 211/280 (75,36%) sin B2048 | 41.358 MiB | swift-open-license-1.0 | Referencia interna del autor, no se enlaza repositorio independiente |
| Swift-Qwen3.8-27B-Uncensored-BF16 (modelo base) | 27B (segun denominacion) | no disponible | no disponible | no disponible | swift-open-license-1.0 | Repositorio HuggingFace `d0xin/Swift-Qwen3.8-27B-Uncensored-BF16` |
| Qwen3.8-27B NVFP4 upstream en NInfer | 27B (segun denominacion) | 252.928 tokens solo texto y 81.920 con Vision en RTX 5090 | no disponible | no disponible | no disponible | Runtime NInfer upstream |

No se han publicado en la informacion disponible comparaciones con modelos de otras familias del mismo rango de tamano.

## Limitaciones y advertencias

- El modelo tiene deliberadamente reducido el comportamiento de rechazo. Esto implica tambien una reduccion del filtrado de seguridad a nivel de modelo; el usuario es responsable de evaluar el despliegue en terminos de seguridad, legales y de cumplimiento.
- El resultado de 0/100 rechazos corresponde exclusivamente a un conjunto fijo de evaluacion automatica (Swift ORCA-K1, 100 prompts, `temperature=0`, `seed=42`, `max_tokens=1536`, pensamiento desactivado). No es una garantia universal de no rechazo y no cubre cualquier prompt, configuracion de muestreo, system prompt o motor de inferencia concebibles.
- Riesgo de alucinacion: no cuantificado en la model card; no se aportan evaluaciones de veracidad ni de tasa de alucinacion.
- Sesgos conocidos: no documentados por el autor. Al ser un ajuste de "uncensoring" sobre un modelo base, es esperable una menor mitigacion de sesgos, pero no hay datos que lo cuantifiquen.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue sin verificacion.
- Longitud de contexto: no declarada de forma explicita para el modelo; las cifras citadas (262.144 de `kv-capacity`, 252.928 tokens solo texto) son perfiles de servicio de NInfer y dependen de la VRAM disponible.
- Restricciones de licencia: licencia `other` con nombre `swift-open-license-1.0`. Es imprescindible leer el texto enlazado antes de cualquier uso comercial; la model card no aclara los terminos.
- Dependencia de hardware: el runtime solo apunta a NVIDIA Blackwell `sm_120a` y el propio autor desaconseja tratarlo como portable a Ampere y generaciones anteriores. Esto limita gravemente el despliegue en infraestructura existente.
- Dependencia de runtime: el artefacto requiere NInfer en una revision concreta (`f76e19c0fbd026c86f46005acf2c80c54084bade`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el formato `.ninfer` no es estandar.
- Validacion incompleta en GPU de consumo: el soporte en RTX 5090 es "esperado, no validado independientemente" segun el autor, y el perfil completo con Vision no cabe en 32 GB.
- Los numeros de rendimiento y calidad provienen de la validacion del propio autor en una unica GPU y con una carga de trabajo fija; el propio autor indica que el rendimiento depende de hardware y carga.
- Madurez y adopcion: 0 descargas y 1 like, publicacion reciente (2026-09-19) y sin comunidad que lo respalde. No es un artefacto contrastado.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos resultados obtenidos fueron calculadoras de condensadores sin relacion alguna con el contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-NVFP4-LocalHessian-ActivationHeadroom-NInfer
- Modelo base: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Texto de la licencia swift-open-license-1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio resultados relacionados con el modelo).
