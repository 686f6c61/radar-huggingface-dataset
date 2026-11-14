# mdcreativeagent/Muse-Glimmer-30B-uncensored

## Resumen

Muse-Glimmer-30B-uncensored es una version modificada del modelo multimodal denso meta-models/Muse-Glimmer-30B, publicada por el usuario mdcreativeagent en Hugging Face. El cambio principal consiste en la eliminacion del comportamiento de rechazo (refusal behavior) mediante una tecnica de abliteration biproyectada con preservacion de norma, descrita por grimjim en noviembre de 2025. El resultado es un modelo que mantiene la arquitectura y las capacidades del original, pero que responde a practicamente cualquier instruccion sin negarse.

El modelo base combina un decodificador de texto de 52 capas con hidden size 6656 y una torre de vision ViT-G/14 de 1.900 millones de parametros, lo que lo situa como un modelo image-text-to-text de aproximadamente 29.800 millones de parametros totales. La intervencion afecta unicamente la via de texto: los 800 tensores de vision se copian sin modificar. El pipeline declarado es image-text-to-text y la libreria de referencia es transformers.

Es relevante ahora porque demuestra que las tecnicas de abliteration pueden aplicarse a modelos multimodales de gran tamano con una perdida minima de calidad en el texto generado, y porque documenta con detalle el metodo, las metricas antes/despues y las limitaciones de la validacion, algo poco habitual en este tipo de publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (muse_glimmer): 52 capas de decodificador de texto, hidden 6656, mas torre de vision ViT-G/14 de 1.9B |
| Parametros totales | 29.776.626.688 (aproximadamente 29,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (via llama.cpp build b10353 o posterior); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 59,6 GB); GGUF disponible en TrevorJS/Muse-Glimmer-30B-uncensored-GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal con dos vias: un decodificador de texto de 52 capas con hidden size 6656 y una torre de vision ViT-G/14 de 1.900 millones de parametros. El autor de la modificacion senala dos particularidades arquitectonicas: existen dos tensores `gate_proj` por capa (uno para atencion y otro para MLP, 104 en total) y ninguno actua como matriz de escritura residual, por lo que los objetivos se identifican por ruta completa; ademas, los logits aplican un softcap de `20·tanh(x·0.196/20)`, lo que impide comparar directamente la divergencia KL con la familia Gemma 4. El modelo emite salida canalizada: primero una deliberacion `to=self` y despues la respuesta `to=user`.

El proceso de abliteration parte de 400 prompts daninos y 400 inofensivos, captura activaciones residuales en el token final del prompt, winsoriza en el percentil 99,5, calcula la direccion de rechazo por capa como `normalize(mean(harmful) - mean(harmless))`, la ortogonaliza contra la media inofensiva con Gram-Schmidt de doble pasada y aplica una puerta de selectividad sobre activaciones reservadas. Se modifican 104 tensores (52 `o_proj` y 52 `down_proj`, el 100% de las capas) con escala 1.0, mientras que 1332 tensores se copian sin cambios. La validacion posterior indica que se elimina entre el 98,6% y el 99,6% de la direccion en los tensores objetivo (residual `‖rᵀW‖` entre 3,7e-03 y 1,4e-02, limitado por el redondeo float64 a bf16), y que un `up_proj` intacto es byte a byte identico al del modelo base. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset de entrenamiento original ni sobre fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text).
- Razonamiento de dos canales: deliberacion `to=self` seguida de respuesta `to=user`.
- Uso de herramientas y function calling, segun la validacion agentica del autor.
- Resistencias documentadas del modelo base a inyeccion de prompts y adherencia de alcance (mantenidas tras la modificacion).
- Capacidad de solicitar confirmacion antes de acciones irreversibles (parcialmente degradada tras la abliteration).
- Respuesta sin rechazos a practicamente cualquier instruccion: las negativas caen del 85,3% al 2,0% en el conjunto harmful_tune de 150 prompts.
- Soporte multilingue limitado al ingles declarado.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como se comporta un modelo multimodal de 30B sin capa de rechazo, comparando respuestas con el original y midiendo tasas de cumplimiento en conjuntos controlados.
- Red teaming y evaluacion de salvaguardas: util para probar filtros externos, clasificadores de contenido y sistemas de moderacion contra un modelo que no se autocensura, sin depender de que el propio modelo se niegue.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o contenido de tono adulto donde el modelo base rechazaria peticiones por su entrenamiento de seguridad.
- Analisis de imagenes con descripcion detallada: la torre ViT-G/14 intacta permite tareas de image-text-to-text como captioning, extraccion de informacion visual o respuesta a preguntas sobre documentos escaneados.
- Agentes automatizados con tool calling: la validacion agentica muestra que conserva parte de la resistencia a inyeccion de prompts y adherencia de alcance, aunque pierde parte de la confirmacion ante acciones irreversibles, por lo que requiere guardarrailes externos.
- Despliegue local con llama.cpp: la version GGUF permite ejecutar el modelo cuantizado en hardware de consumo, util para experimentacion offline sin GPU de datacenter.
- Generacion de codigo y matematicas: no hay benchmarks publicados que confirmen rendimiento en estas tareas, por lo que su uso en produccion para codigo debe validarse empiricamente antes de adoptarlo.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible: comparativa antes/despues de la abliteration sobre conjuntos del autor.

| Metrica | Antes | Despues |
|---|---|---|
| Rechazos (harmful_tune, 150 prompts) | 128/150 (85,3%) | 3/150 (2,0%) |
| Sobre-rechazo (harmless, 75 prompts) | 1/75 (1,4%) | 0/75 (0,0%) |
| Deflexiones | 12 | 0 |
| Salida rota o degenerada | 0 | 0 |
| Resistencia a inyeccion de prompts (12 sondas) | 0/12 | 0/12 |
| Adherencia de alcance (8 sondas) | 0/8 | 0/8 |
| Confirmacion de acciones irreversibles (10 sondas) | 7/10 | 8/10 |
| Total agentico (30 sondas) | 7/30 | 8/30 |

De los 128 rechazos iniciales, 83 pasaron a cumplimiento confirmado y ninguno degradado; 42 quedaron sin resolver porque el cumplimiento genera salidas unas 4 veces mas largas (mediana 354 a 1340 tokens) y alcanzan el limite de 1536 tokens a mitad de respuesta. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 59,6 GB, lo que exige al menos 60 GB de VRAM para inferencia completa sin offload.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- Consumer GPU: el modelo completo no cabe en tarjetas de 24 GB como la RTX 4090; la version GGUF cuantizada (repo TrevorJS/Muse-Glimmer-30B-uncensored-GGUF) podria caber en funcion del nivel de cuantizacion, aunque no se especifican tamanos concretos.
- Opciones de despliegue: transformers >= 5.15.0 (la arquitectura `muse_glimmer` no existe en 5.12.0); llama.cpp build b10353 o posterior (anadido el 2026-08-10 en el PR #26841, commit `62bf73d`) para conversion y cuantizacion GGUF; vLLM, TGI u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-uncensored | 29,8B | no disponible | Texto + imagen | Apache 2.0 | Abliterated, 2,0% de rechazos |
| meta-models/Muse-Glimmer-30B (base) | 29,8B | no disponible | Texto + imagen | Apache 2.0 (segun este repo) | 85,3% de rechazos en harmful_tune |
| Alternativas multimodales de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Eliminacion deliberada de la capa de rechazo: el modelo respondera a instrucciones daninas, lo que lo hace inadecuado para despliegues publicos sin filtros externos.
- Degradacion de salvaguardas agenticas: en la sonda de borrado de logs, el modelo base pedia confirmacion porque la herramienta no filtraba por antiguedad; el modelo abliterado llamo directamente a `delete_files`.
- La validacion agentica muestra solo 8/30 sondas superadas, por lo que la resistencia a inyeccion y la adherencia de alcance siguen siendo debiles incluso en el modelo base.
- Riesgo de alucinacion no cuantificado: no hay benchmarks estandar publicados que permitan estimar la calidad factual tras la modificacion.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta documentado.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; la responsabilidad legal por el contenido generado recae en el desplegador.
- El modelo card menciona el repositorio `TrevorJS/Muse-Glimmer-30B-uncensored` en el codigo de ejemplo, mientras que el ID publicado es `mdcreativeagent/Muse-Glimmer-30B-uncensored`; conviene verificar la ruta correcta antes de cargar pesos.
- Requiere transformers >= 5.15.0 y llama.cpp >= b10353; versiones anteriores fallaran al cargar la arquitectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Muse-Glimmer-30B-uncensored
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Version GGUF: https://huggingface.co/TrevorJS/Muse-Glimmer-30B-uncensored-GGUF
- Repositorio de abliteration: https://github.com/TrevorS/muse-glimmer-abliteration
- Trabajo previo (gemma-4 abliteration): https://github.com/TrevorS/gemma-4-abliteration
- Blog sobre abliteration biproyectada con preservacion de norma: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- PR de llama.cpp para soporte de la arquitectura: https://github.com/ggml-org/llama.cpp/pull/26841
