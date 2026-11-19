# orcarouter/Qwen3.8-Flash-Next-Uncensored

## Resumen

Qwen3.8-Flash-Next-Uncensored es un ajuste fino del modelo Qwen/Qwen3.8-Flash-Next publicado por el usuario orcarouter en Hugging Face. Se trata de una variante "abliterated" y "uncensored" del modelo base, orientada explicitamente a tareas de red teaming y evaluacion de seguridad de sistemas de IA. El modelo conserva la arquitectura multimodal image-text-to-text del original y anade capacidades de function calling, razonamiento y un modo de decodificacion multi-token (MTP) segun las etiquetas del repositorio.

Con aproximadamente 180.000 millones de parametros totales en formato safetensors y un repositorio de 360 GB, nos encontramos ante un modelo de gran escala, presumiblemente con arquitectura MoE (mixture of experts) dado el tag `moe` y la relacion entre parametros totales y el enfasis en eficiencia de inferencia del nombre "Flash-Next". La licencia es Apache 2.0, lo que permite uso comercial, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece las capacidades multimodales y de razonamiento de la familia Qwen en una variante sin los filtros de seguridad habituales; por otro, esa misma caracteristica lo convierte en una herramienta delicada que debe manejarse con cautela en entornos de produccion. Su uso previsto, segun los propios tags, es la evaluacion de robustez y la investigacion en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), presumiblemente MoE segun tags; detalles exactos no disponibles |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16; se desconoce si existen versiones GGUF/AWQ oficiales) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.8-Flash-Next, un modelo multimodal de la familia Qwen que procesa entradas de imagen y texto y genera texto. Las etiquetas del repositorio indican arquitectura MoE (`moe`), soporte de vision-language, function calling, razonamiento y decodificacion multi-token (`mtp`). El ajuste realizado por orcarouter es de tipo "abliterated", una tecnica que elimina o atenua las direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo ante peticiones sensibles, y se etiqueta como "uncensored" y "post-training/fine-tuning".

No se dispone de informacion sobre el volumen de tokens de entrenamiento del ajuste, la composicion del dataset utilizado para la ablacion, ni si se emplearon tecnicas de RLHF o DPO adicionales. Tampoco se detalla la innovacion tecnica del modelo base mas alla de lo que sugieren los tags (MTP, MoE, vision). Cualquier afirmacion sobre el proceso exacto de abliteracion o sobre los datos empleados seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con soporte de modo "thinking" segun el tag `reasoning`.
- Procesamiento de imagen y texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y tareas multimodal.
- Function calling / tool calling, segun el tag `function-calling`, lo que permite integracion en pipelines con herramientas externas.
- Capacidades de agente y razonamiento multi-paso.
- Soporte multilingue limitado a ingles y chino (en, zh).
- Decodificacion multi-token (MTP) para acelerar la generacion, segun el tag correspondiente.
- Variante "abliterated/uncensored": reduce los rechazos ante peticiones que el modelo base declinaria, lo que la hace adecuada para red teaming.
- Orientado a conversacion (tag `conversational`).

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo permite generar respuestas que el modelo base rechazaria, lo que facilita la identificacion de vectores de ataque, jailbreaks y comportamientos indeseados en sistemas desplegados. Es su uso declarado principal.
- Investigacion en alineacion: comparar las respuestas del modelo abliterated con las del base permite estudiar como se codifican los rechazos en el espacio de activaciones y disenar mejores mecanismos de seguridad.
- Generacion de codigo asistida: con soporte de function calling, puede integrarse en entornos de desarrollo para autocompletar, explicar o refactorizar codigo, aunque sin garantias de seguridad de contenido.
- Analisis de imagenes en pipelines de datos: al ser image-text-to-text, puede extraer informacion estructurada de capturas, diagramas o documentos escaneados en ingles o chino.
- Agentes automatizados multi-paso: su capacidad de razonamiento y tool calling permite construir agentes que consulten APIs y encadenen acciones, siempre con supervision humana.
- Atencion al cliente en ingles y chino: conversaciones multi-turno con contexto amplio, aunque la ausencia de filtros exige moderacion externa.
- Generacion de datasets sinteticos para entrenamiento: util para producir corpus diversos sin las restricciones del modelo base, con revision posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 360 GB solo para los pesos, mas overhead de activaciones y cache KV; requiere multiples GPU de 80 GB (al menos 5x A100/H100 de 80 GB, y en la practica 8x para margen).
- GPU recomendadas: H100 80 GB, A100 80 GB, H200; en configuracion multi-GPU con NVLink para evitar cuellos de botella.
- No cabe en GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) en bf16. Solo seria viable con cuantizaciones agresivas (4 bits o inferiores) y offloading, no confirmadas oficialmente.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI o llama.cpp no estan confirmados para esta variante concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| orcarouter/Qwen3.8-Flash-Next-Uncensored | ~180B | no disponible | Apache 2.0 | Gated | Variante abliterated multimodal |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B (presumible) | no disponible | Apache 2.0 | no disponible | Modelo original con filtros de seguridad |
| Otros modelos abliterated de la familia Qwen | variable | variable | variable | abierto | Alternativas de menor tamano, sin vision |

La comparacion con alternativas de la misma categoria (modelos multimodales abliterated de ~180B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de rechazos implica un riesgo elevado de generar contenido danino, ilegal o inseguro; no debe desplegarse en produccion sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de gran escala, agravado por la falta de benchmarks publicados para esta variante.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el acceso esta restringido (gated) y sujeto a las condiciones de Hugging Face; verificar obligaciones de atribucion.
- El modelo base Qwen3.8-Flash-Next puede tener su propia licencia y condiciones; la variante hereda posibles restricciones adicionales no detalladas.
- No se dispone de informacion sobre contexto maximo, cuantizaciones oficiales ni soporte en frameworks de inferencia, lo que dificulta la planificacion de despliegue.
- El ajuste abliterated puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo base; no hay evaluaciones publicadas que lo cuantifiquen.

## Enlaces

- Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
