# MorinoNushi/GLM-5.3-Flash-Heretic-Abliterated-LoRA-V2-GGUF

## Resumen

GLM-5.3-Flash-Heretic-Abliterated-LoRA-V2 es un adaptador LoRA de rango 1 publicado por MorinoNushi que suprime quirúrgicamente el comportamiento de rechazo del modelo base zai-org/GLM-5.3-Flash, un transformer MoE de 320.000 millones de parametros totales y 18.000 millones activos. No se trata de un modelo completo: el repositorio contiene unicamente el adaptador (~86 MB en GGUF) y requiere descargar por separado el modelo base, que en su cuantizacion de referencia (UD-IQ4_XS) ocupa del orden de 160 GB.

El adaptador se ha generado con heretic-gguf, un port nativo de GGUF del proyecto Heretic que ejecuta la busqueda de ablacion direccional optimizada con Optuna directamente sobre pesos GGUF cuantizados mediante llama.cpp. La version V2 corrige el fallo principal de la V1: en lugar de optimizar con el modo "thinking" desactivado, evalua y selecciona los candidatos con el razonamiento completo activado y puntua el rechazo solo en la respuesta final, que es el regimen en el que GLM-5.3-Flash se usa realmente. Este adaptador es el ensayo 61 del estudio `glm53think2`, que sigue en curso.

Su relevancia es doble: por un lado, es una herramienta de investigacion sobre alineacion y mecanismos de rechazo; por otro, es un ejemplo practico de ablacion direccional sobre MoE de gran tamano, con resultados medidos (tasa de rechazo del 95,00% al 10,00% en modo sin razonamiento) y un coste de divergencia KL cuantificado. La licencia es MIT, pero el modelo resultante elimina los mecanismos de seguridad del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA de rango 1 sobre GLM-5.3-Flash (transformer MoE, con capas KDA, atencion MLA y expertos compartidos) |
| Parametros totales | adaptador: 43.022.336; modelo base: 320.000 millones |
| Parametros activos | modelo base: 18.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | adaptador aplicado siempre en computo f32/f16; el base admite cualquier GGUF y se ajusto/evaluo contra UD-IQ4_XS |
| Idiomas soportados | no disponible (el model card cita patrones de rechazo en ingles y chino, lo que sugiere cobertura al menos EN/ZH) |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de tipo mezcla de expertos (MoE) con 320.000 millones de parametros totales, 18.000 millones activos y 45 capas, de las cuales 31 corresponden a capas KDA (atencion lineal/delta) y el resto a capas MLA. Incluye proyecciones de bajada en los expertos MoE y expertos compartidos. El adaptador no modifica ni recuantiza los pesos base: se aplica en tiempo de inferencia sobre la salida de atencion y las proyecciones de bajada de los expertos.

La construccion del adaptador no es un entrenamiento supervisado clasico, sino una ablacion direccional ("abliteration"). La direccion de rechazo se calcula en el espacio residual como la diferencia de medias sobre 480 prompts daninos y 480 inofensivos, con winsorizacion del 5% de valores atipicos, ortogonalizada contra la media de los prompts inofensivos y capturada en la posicion residual previa al razonamiento con `reasoning effort` alto. Esa direccion se proyecta fuera de los pesos de salida de atencion y de las proyecciones de bajada del MoE. Las intensidades, los kernels por capa y la seleccion de direccion se ajustaron con Optuna TPE multiobjetivo (minimizar simultaneamente la tasa de rechazo y la divergencia KL) bajo evaluacion con razonamiento activado. La novedad metodologica de la V2 es precisamente esa evaluacion con thinking habilitado y el recalculo de direcciones con winsorizacion, que segun el autor redujo aproximadamente 4 veces el coste KL de una ablacion fuerte.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking": el base produce trazas de razonamiento de hasta 1280 tokens con `reasoning effort` alto.
- Razonamiento multi-paso: la V2 se optimizo especificamente contra el comportamiento de re-derivar un rechazo dentro de la traza, por lo que mantiene la cadena de pensamiento completa.
- Generacion sin rechazo: el adaptador responde a peticiones que el base declina, tanto daninas como inofensivas pero sensibles.
- Capacidades heredadas del base GLM-5.3-Flash (codigo, matematicas, multilingue): no documentadas en la informacion proporcionada para este adaptador.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Compatibilidad de despliegue: se aplica dinamicamente en `llama-server` con `--lora`, sin parametros de sampling especiales; omitir `--lora` restaura exactamente el modelo base.

## Casos de uso

- Investigacion en seguridad y alineacion: medir como varia la tasa de rechazo al proyectar una direccion concreta en el espacio residual permite estudiar donde reside el comportamiento de rechazo en un MoE de 320B y comparar direcciones entre capas.
- Red teaming y evaluacion de robustez: el adaptador sirve como modelo de ataque controlado para comprobar si los clasificadores de seguridad y los filtros de salida de un pipeline detectan contenido que el base rechazaria.
- Reproduccion de estudios de abliteration: al ser el ensayo 61 del estudio `glm53think2`, permite reproducir la comparacion entre optimizacion con y sin thinking y validar el efecto de la winsorizacion sobre el coste KL.
- Generacion creativa de ficcion con tematicas adultas o controvertidas: escritores pueden usar el modelo para narrativa que el base rechazaria por falsos positivos, con el aviso de que la responsabilidad del contenido es del usuario.
- Roleplay y personajes sin rechazos espurios: conversaciones multi-turno donde el comportamiento de rechazo del base rompe la coherencia del personaje.
- Analisis de degradacion por ablacion: la KL medida (0,1795 sin thinking, 0,3030 con thinking) permite estudiar la relacion entre agresividad de la ablacion y perdida de capacidades generales.
- Fine-tuning e investigacion sobre fusion de LoRA: el adaptador, de solo 43 millones de parametros y ~86 MB, es un objeto de estudio manejable para experimentos de mezcla de adaptadores.
- Despliegue de investigacion en local con llama.cpp: con el parche de KDA aplicado, se puede ejecutar en una maquina multigpu con el base cuantizado a UD-IQ4_XS.

## Benchmarks y rendimiento

Datos publicados por el autor. Evaluacion con 140 prompts daninos (100 de `mlabonne/harmful_behaviors` test + 40 propios) y 100 prompts inofensivos (`mlabonne/harmless_alpaca` test), decodificacion greedy, respuestas de 100 tokens, contra el base UD-IQ4_XS. La divergencia KL se mide sobre los logits del primer token en prompts inofensivos.

| Configuracion | Tasa de rechazo (daninos) | Divergencia KL (inofensivos) |
|---|---|---|
| Base, sin thinking | 95,00% (133/140) | 0 (por definicion) |
| Adaptador V2, sin thinking | 10,00% (14/140) | 0,1795 |
| Base, con thinking (effort high) | 96,43% (135/140) | 0 (por definicion) |
| Adaptador V2, con thinking (effort high) | 25,00% (35/140) | 0,3030 |
| Adaptador V1, sin thinking (referencia) | 26,43% | 0,0682 |

Notas de medicion: el rechazo se cuenta por coincidencia de palabras clave (ingles, chino y marcadores de negacion en primera persona, la formulacion dominante en GLM-5.3). La KL es relativa a la linea base y se midio contra UD-IQ4_XS; con otra cuantizacion la deriva efectiva respecto a esa linea base puede diferir. En modo con thinking la tasa de rechazo sube porque el modelo puede re-derivar el rechazo dentro de la traza antes de la respuesta final.

## Requisitos de hardware

- El adaptador en si ocupa ~86 MB y no anade requisitos de VRAM apreciables.
- El coste real lo determina el modelo base: 320B totales / 18B activos. En UD-IQ4_XS el GGUF pesa del orden de 160 GB, por lo que se necesita un sistema con al menos esa capacidad de memoria (VRAM sumada o VRAM + RAM con offload).
- GPU recomendadas: configuraciones multigpu tipo 3x H100 80 GB o 3x A100 80 GB para mantener el modelo en VRAM con contexto utilizable; 2x 80 GB queda al limite y deja poco margen para cache KV.
- Consumer GPU: no cabe en una sola GPU de consumo. Es viable con offload parcial a CPU en llama.cpp, sacrificando throughput.
- Opciones de despliegue: llama.cpp / `llama-server` con `--lora` (ruta oficial). Requiere un build del PR #27754 de llama.cpp (la rama master aun no incluia soporte `glm5next` en el momento de la publicacion) y, para que la ablacion de atencion surta efecto completo, el parche `llama_cpp_glm5next_lora.patch` incluido en el repositorio heretic-gguf.
- Sin el parche, el adaptador se aplica a los expertos MLP y a las capas MLA, pero no a las 31 capas KDA, y su efecto es mas debil que las cifras de la tabla de benchmarks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores de abliteration para GLM-5.3-Flash ni sobre modelos comparables del mismo tamano. La comparacion mas directa disponible es contra el propio base y contra la version anterior del adaptador.

| Version | Parametros | Refusal sin thinking | KL sin thinking | Refusal con thinking | KL con thinking |
|---|---|---|---|---|---|
| GLM-5.3-Flash base | 320B / 18B activos | 95,00% | 0 | 96,43% | 0 |
| Adaptador V1 | no disponible (rango 1) | 26,43% | 0,0682 | no disponible | no disponible |
| Adaptador V2 | 43.022.336 | 10,00% | 0,1795 | 25,00% | 0,3030 |

Alternativas de la misma categoria (adaptadores de ablacion direccional sobre otros modelos): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Seguridad eliminada por diseno: el adaptador suprime el comportamiento de rechazo. El modelo resultante cumplira peticiones que el base rechaza, incluidas peticiones daninas, poco eticas, ofensivas o ilegales. No debe desplegarse en productos de cara al publico sin capas de moderacion externas.
- Divergencia KL no trivial: 0,1795 sin thinking y 0,3030 con thinking sobre los logits del primer token en prompts inofensivos. Esto implica un desplazamiento medible del comportamiento generativo fuera del dominio de rechazo.
- La KL se midio contra la cuantizacion UD-IQ4_XS. Con otra cuantizacion del base, la deriva efectiva respecto a su propia linea base puede ser distinta, y el autor no garantiza los mismos resultados.
- Aun con thinking activado, el 25,00% de los prompts daninos siguen recibiendo rechazo: el modelo puede razonar hacia una negativa dentro de la traza, algo que la optimizacion no elimina por completo.
- La metrica de rechazo se basa en coincidencia de palabras clave, no en un clasificador independiente, lo que puede sobreestimar o subestimar la tasa real.
- Dependencia de un parche no fusionado: se necesita un build del PR #27754 de llama.cpp mas un parche especifico; en master o en versiones futuras el comportamiento puede cambiar.
- El repositorio no incluye el modelo base. Sin descargar los ~160 GB del GGUF de GLM-5.3-Flash, el adaptador es inutilizable.
- Idiomas, longitud de contexto, soporte de tool calling y capacidades multimodales: no documentados en la informacion proporcionada.
- Sesgos: no se documentan sesgos especificos, pero el adaptador hereda los del base y anade la perdida de capacidad de filtrado.
- Uso comercial: la licencia MIT lo permite tecnicamente, pero el despliegue de un modelo sin salvaguardas puede incumplir normativa aplicable (por ejemplo, obligaciones de moderacion en la UE) y las condiciones de uso de la plataforma que se emplee.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion independiente de los resultados publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MorinoNushi/GLM-5.3-Flash-Heretic-Abliterated-LoRA-V2-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Proyecto Heretic original: https://github.com/p-e-w/heretic
- PR de llama.cpp para soporte glm5next: https://github.com/ggml-org/llama.cpp/pull/27754
- Cuantizacion de referencia UD-IQ4_XS: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Dataset de evaluacion (daninos): `mlabonne/harmful_behaviors` (test)
- Dataset de evaluacion (inofensivos): `mlabonne/harmless_alpaca` (test)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas de una cadena de bricolaje belga sin relacion con el contenido.
