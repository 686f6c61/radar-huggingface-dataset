# MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF

## Resumen

MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF es un adaptador LoRA de rango 1 publicado por MorinoNushi que elimina ("ablitera") el comportamiento de rechazo del modelo base XiaomiMiMo/MiMo-V2.6-Flash-RL, un transformer de tipo mezcla de expertos (MoE) de 309.000 millones de parametros totales y 15.000 millones activos con licencia MIT. El adaptador no es un modelo autonomo: se superpone sobre los pesos base en tiempo de inferencia y solo modifica la direccion de rechazo en el espacio residual, dejando intactos los pesos originales.

La pieza tecnica central es heretic-gguf, un port nativo de GGUF de la herramienta Heretic que ejecuta la busqueda de ablacion direccional optimizada con Optuna directamente sobre pesos cuantizados mediante llama.cpp. Esto permite producir una supresion de rechazos sin recuantizar el modelo base de ~170 GB: el adaptador ocupa aproximadamente 70 MB y su aplicacion es instantanea, ya que se calcula en f32/f16 independientemente de la cuantizacion del base.

El resultado reportado por el autor es una reduccion de la tasa de rechazo en peticiones daninas del 95,71 % al 3,57 % sobre 140 prompts, con una divergencia KL de 0,0568 sobre prompts inofensivos. Es relevante en el ambito de red-teaming y evaluacion de seguridad, no como modelo de produccion: la propia model card desaconseja explicitamente su despliegue en sistemas publicos o multiusuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 1 (overlay) sobre modelo base MoE tipo transformer (MiMo-V2.6-Flash-RL) |
| Parametros totales | 35.045.376 (adaptador); modelo base: 309.000 millones |
| Parametros activos | 15.000 millones (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base GGUF (sintonizado y evaluado contra MXFP4); el adaptador se aplica en compute f32/f16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA); el repositorio incluye pesos en safetensors (35.045.376 parametros) |

## Arquitectura y entrenamiento

El adaptador opera sobre MiMo-V2.6-Flash-RL, un modelo MoE con 309.000 millones de parametros totales y 15.000 millones activos, con licencia MIT. La intervencion no reentrena el modelo: aplica ablacion direccional ("abliteration"), proyectando fuera de los pesos de salida de atencion y de las proyecciones descendentes del MoE la direccion de rechazo calculada en el espacio residual. Esa direccion se obtiene como diferencia de medias sobre 480 prompts daninos y 480 inofensivos, con winsorizacion al 5 % y ortogonalizacion contra la media de los inofensivos.

La configuracion concreta corresponde al estudio `mimo26flash`, ensayo 85, con direccion global en el indice 26.2 de 48, ambito de direccion global y normalizacion de filas `pre`. Las fuerzas por experto se escalan segun la frecuencia de enrutamiento danina/inofensiva medida. Los pesos maximos aplicados son 6,39 en `attn.o_proj` (capa 36.4 de 48) y 1,58 en la proyeccion descendente del MLP enrutado (capa 31.9). Las fuerzas, kernels de capa y seleccion de direccion se ajustaron mediante Optuna TPE multiobjetivo, minimizando conjuntamente tasa de rechazo y divergencia KL. El adaptador expone su procedencia completa como metadatos GGUF bajo las claves `adapter.heretic.*`.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base MiMo-V2.6-Flash-RL, con modo de pensamiento (thinking) disponible.
- Supresion quirurgica del comportamiento de rechazo: el modelo responde a peticiones que el base rechazaria, incluidas las daninas, poco eticas, ofensivas o ilegales.
- Aplicacion no destructiva: omitir el flag `--lora` restaura exactamente el modelo base.
- Compatibilidad con cualquier cuantizacion GGUF del base, ya que el adaptador se calcula en f32/f16.
- Integracion en llama.cpp sin parches: el soporte `mimo2` esta fusionado upstream.
- Metadatos de procedencia embebidos para trazabilidad (`strings ... | grep adapter.heretic`).
- Tool calling, function calling, agentes y capacidades multimodales: no disponible en la informacion proporcionada (dependen del modelo base).

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite generar respuestas sin filtros para auditar el comportamiento del modelo base y medir la eficacia de las barreras de seguridad antes de desplegar sistemas reales.
- Investigacion sobre alineacion: sirve para estudiar la direccion de rechazo en el espacio residual y comparar variantes ablacionadas frente al modelo original, gracias a la trazabilidad de parametros del ensayo.
- Analisis de robustez de guardarrailes: al reducir la tasa de rechazo al 3,57 %, permite comprobar si filtros externos (clasificadores de contenido, moderacion) capturan lo que el modelo deja de bloquear internamente.
- Reproduccion de experimentos: los metadatos `adapter.heretic.*` y el codigo de heretic-gguf permiten replicar la ablacion sobre otros modelos GGUF, no solo sobre MiMo.
- Generacion de conjuntos de datos adversarios: util para construir datasets de prompts daninos y respuestas asociadas con fines de entrenamiento defensivo de clasificadores.
- Pruebas comparativas base vs. ablacionado: la naturaleza de overlay permite alternar entre ambos comportamientos en la misma sesion con llama-server, aislando el efecto de la ablacion frente a otras variables.
- Estudio de deriva de distribucion: el KL de 0,0568 sobre first-token logits ofrece una referencia para medir cuanto se desvia el modelo de su comportamiento original en entradas inofensivas.

## Benchmarks y rendimiento

Medido sobre 140 prompts daninos (100 de `mlabonne/harmful_behaviors` test + 40 personalizados) y 100 prompts inofensivos (`mlabonne/harmless_alpaca` test), con prefijo de omision de CoT (`<think></think>`, pensamiento suprimido), decodificacion greedy y respuestas de 100 tokens, contra el base MXFP4:

| Metrica | Modelo base | Adaptador heretic |
|---|---|---|
| Tasa de rechazo (prompts daninos) | 95,71 % (134/140) | 3,57 % (5/140) |
| Divergencia KL (prompts inofensivos) | 0 (por definicion) | 0,0568 |

Los rechazos se contabilizan por coincidencia de palabras clave de rechazo (ingles, chino y marcadores de negacion en primera persona). La divergencia KL se mide sobre los logits del primer token en prompts inofensivos. Con el modo de pensamiento completo activado, el modelo puede volver a un rechazo a mitad de traza, por lo que la tasa real de rechazo puede ser algo superior al 3,57 % reportado. No se han publicado resultados de benchmarks de conocimiento (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 70 MB y anade un coste de computo residual despreciable; el grueso del requisito corresponde al modelo base.
- VRAM para el base en MXFP4: aproximadamente 170 GB de pesos, mas overhead de contexto, cache KV y memoria de trabajo. Requiere configuraciones multi-GPU.
- GPU recomendadas: no disponibles de forma explicita; por tamano, un despliegue del base de 309B/15B activo en MXFP4 encaja en configuraciones como 2x H100 80 GB o 4x A100 80 GB.
- GPU de consumo: no cabe en una sola GPU de consumo (RTX 4090 de 24 GB, etc.) sin offload a RAM/CPU o cuantizaciones mas agresivas del base.
- Opciones de despliegue: llama.cpp / llama-server mediante el flag `--lora` (el autor proporciona el comando exacto); soporte `mimo2` fusionado upstream. La variante fusionada y recuantizada existe como GGUF aparte en MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo (daninos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL (base MXFP4) | 309B total / 15B activo | no disponible | 95,71 % | MIT | GGUF en ggml-org |
| Este adaptador (LoRA heretic) | 35M (overlay) | heredado del base | 3,57 % | MIT | GGUF en MorinoNushi |
| MiMo-V2.6-Flash-RL-Uncensored-Heretic-GGUF (fusionado) | 309B total / 15B activo | heredado del base | mismo ablacionado | MIT | GGUF en MorinoNushi |

No se dispone de datos comparativos con otros modelos abliterados o de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador hace que el modelo cumpla peticiones que el base rechaza, incluidas las que producen contenido ofensivo, perturbador, de odio, sexualmente explicito, violento o instrucciones detalladas para actos ilegales. Es una consecuencia intencionada del metodo.
- La ablacion suprime los rechazos, no el conocimiento del base: las respuestas sobre temas peligrosos pueden ser erroneas, alucinadas o incoherentes, y no deben tratarse como asesoramiento veraz, seguro o legal.
- No debe desplegarse en produccion, servicios publicos ni entornos multiusuario; esta pensado para investigacion personal, red-teaming y evaluacion.
- La responsabilidad del uso y de las salidas recae exclusivamente en el usuario.
- La medicion de KL y el objetivo de optimizacion se calcularon contra la cuantizacion MXFP4; al aplicar el adaptador sobre otra cuantizacion, la deriva efectiva respecto a esa base puede diferir.
- Los benchmarks se ejecutaron con el pensamiento suprimido; con thinking activado la tasa real de rechazo puede ser mayor que la reportada.
- Sesgos concretos, limites de contexto e idiomas no disponibles en la informacion proporcionada.
- Licencia MIT en el adaptador y en el base, sin restricciones de uso comercial declaradas, aunque la propia model card desaconseja el uso comercial y productivo.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Cuantizacion MXFP4 del base usada para sintonizar y evaluar: https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF
- Variante fusionada y recuantizada: https://huggingface.co/MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-GGUF
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Proyecto Heretic original: https://github.com/p-e-w/heretic
