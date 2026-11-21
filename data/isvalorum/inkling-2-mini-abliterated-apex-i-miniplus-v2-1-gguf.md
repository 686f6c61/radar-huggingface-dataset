# IsValorum/Inkling-2-Mini-Abliterated-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Inkling-2-Mini-Abliterated-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario independiente IsValorum dentro de su serie de cuantizaciones "APEX". Se trata de una variante "abliterated", es decir, con las direcciones de rechazo suprimidas respecto al modelo original, orientada a usos conversacionales sin las restricciones de alineamiento del checkpoint de partida. El modelo conserva la pipeline `image-text-to-text`, por lo que admite entradas multimodales de imagen y texto.

El checkpoint tiene 26.070.385.152 parametros totales (unos 26,07 mil millones) y una arquitectura identificada como `inkling2_loop`, con etiqueta `moe` en los metadatos, lo que sugiere un transformer con mezcla de expertos y algun mecanismo recurrente o de bucle. La cuantizacion se ha generado a partir de pesos BF16 usando una matriz de importancia (`imatrix.gguf`) y un mapa quirurgico de precision por tensor: capas de atencion en Q4_K/Q6_K/Q8_0 y tensores sensibles (convoluciones de atencion, sesgos, proyecciones `output_res_query`) mantenidos en F32.

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion de un modelo multimodal de ~26 B en un unico repo de 13,3 GB, lo que lo hace desplegable en hardware de consumo alto; por otro, advierte de que se trata de un artefacto de terceros, sin benchmarks publicados, con cero descargas y con modificaciones de alineamiento que condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con etiqueta `moe`; detalles internos no disponibles) |
| Parametros totales | 26.070.385.152 (~26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q4_K, Q6_K, Q8_0 y F32; fuente BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 13,3 GB |
| Pipeline | image-text-to-text |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Autor de la cuantizacion | IsValorum |
| Fecha de publicacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo base es `thinkingmachines/Inkling-2-Mini`, de Thinking Machines. La etiqueta de arquitectura declarada en la model card es `inkling2_loop`, y los tags incluyen `moe`, lo que apunta a un transformer con capas de mezcla de expertos y algun componente recurrente o iterativo ("loop"). El mapa de tensores auditado confirma 24 bloques (`blk.0` a `blk.23`) con proyecciones de atencion estandar (`attn_q`, `attn_k`, `attn_output`, `attn_gate`) mas tensores especificos de esta arquitectura: `attn_k_conv`, `attn_post_conv`, `attn_q_clip`, `attn_rel`, `attn_rel_bias` y `output_res_query`. La presencia de convoluciones en la atencion y de un tensor `output_res_query` sugiere mecanismos de atencion relativa y de consulta residual que no son propios de un transformer Llama clasico.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por RLHF o DPO. La cuantizacion se ha realizado desde pesos BF16 con una matriz de importancia externa (`imatrix.gguf`) cuya procedencia el autor declara no inferir. El proceso aplica precision diferenciada por tensor: las convoluciones de atencion (`attn_k_conv`, `attn_post_conv`) y los tensores `attn_q_clip`, `attn_rel_bias` y `output_res_query` se mantienen en F32 para preservar estabilidad numerica, mientras que las proyecciones principales se comprimen a Q4_K, Q6_K y Q8_0. La variante "abliterated" implica una modificacion post-entrenamiento del modelo base para eliminar direcciones de rechazo, de la que no se documenta el metodo exacto.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base, no verificadas en esta cuantizacion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el autor distribuye V-Agent, un agente de escritorio compatible, pero no se detallan capacidades nativas de agente del modelo.
- Capacidades multilingues: no disponibles.
- Modo "thinking" o razonamiento extendido: no documentado.
- Uso sin restricciones de alineamiento (variante abliterated): el modelo no aplica los rechazos tipicos del checkpoint base.

## Casos de uso

- Asistente conversacional local sin filtros: el modelo puede mantener dialogos multi-turno en local sobre llama.cpp, adecuado para prototipos de investigacion sobre comportamiento de modelos sin alineamiento.
- Analisis de imagenes con descripcion en lenguaje natural: gracias a la pipeline `image-text-to-text`, puede recibir una imagen y generar descripciones, resumenes o respuestas contextualizadas, util en herramientas de accesibilidad o catalogacion.
- Experimentacion en investigacion sobre alineamiento y "abliteration": permite comparar el comportamiento del modelo base frente a la variante sin direcciones de rechazo, midiendo cambios en tasas de respuesta y sesgo.
- Despliegue en estaciones de trabajo con GPU de consumo: con 13,3 GB en GGUF, cabe en GPUs de 16-24 GB de VRAM y permite inferencia offline sin dependencia de APIs.
- Generacion de codigo en entornos controlados: si el modelo base conserva capacidad de codigo, puede integrarse en editores o pipelines locales, aunque sin garantias de calidad por falta de benchmarks.
- Procesamiento de documentos con imagen y texto en pipelines de extraccion: el modelo puede recibir capturas o escaneos y producir texto estructurado, siempre con supervision humana por el riesgo de alucinacion.
- Base para fine-tuning o experimentacion con arquitecturas `inkling2_loop`: el GGUF no es apto para entrenamiento, pero el checkpoint base BF16 si serviria como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo cuenta con cero descargas y cero likes en el momento de la consulta, por lo que no existe evidencia externa de rendimiento.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 13,3 GB, por lo que la inferencia requiere al menos ~14 GB de VRAM para cargar el modelo en GPU, mas overhead de contexto KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 Super (16 GB), RTX 3090 (24 GB), A100 40/80 GB, H100 para despliegues multiusuario.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantizaciones mas agresivas de la familia (NanoPlus, 10,23 GiB), en GPUs de 12 GB como la RTX 3060 de 12 GB o la RTX 4070.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (agente de escritorio del mismo autor con cuatro motores locales), y cualquier frontend compatible con GGUF. No se menciona compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini Abliterated APEX-I MiniPlus V2.1 | ~26,07 B | no disponible | Apache 2.0 | GGUF | Cuantizacion de terceros, sin benchmarks, multimodal |
| Inkling-2-Mini APEX-I MiniPlus V2.1 (base) | ~26,07 B | no disponible | Apache 2.0 | GGUF | Misma cuantizacion sin abliteration |
| Inkling-2-Mini APEX-I NanoPlus V2.1 | ~26,07 B | no disponible | Apache 2.0 | GGUF | Variante mas comprimida (10,23 GiB) |
| thinkingmachines/Inkling-2-Mini | ~26,07 B | no disponible | no disponible | BF16 | Checkpoint original de referencia |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de otros desarrolladores. La comparativa se limita a la propia familia de cuantizaciones del autor.

## Limitaciones y advertencias

- Modelo "abliterated": se han suprimido las direcciones de rechazo, por lo que puede generar contenido que el modelo base rechazaria. No es apto para productos dirigidos al publico sin moderacion adicional.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, y el repositorio tiene cero descargas, lo que impide validacion por la comunidad.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado para esta variante.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable en castellano.
- Contexto no documentado: se desconoce la ventana maxima, lo que dificulta planificar cargas de contexto largo.
- Cuantizacion de terceros: la precision mixta Q4_K/Q6_K/Q8_0/F32 puede degradar ligeramente la calidad frente al BF16 original; no se publican evaluaciones diferenciales.
- Procedencia de la imatrix no verificada: el propio autor indica que no infiere su procedencia externa.
- Licencia Apache 2.0 declarada, pero la del modelo base no se detalla en la informacion disponible; conviene verificar los terminos del checkpoint original antes de uso comercial.
- Artefacto de un solo autor y de reciente publicacion (2026-11-21): sin mantenimiento ni historial de issues.
- El modelo base es multimodal, pero la cuantizacion GGUF puede no preservar todas las capacidades de vision segun el backend empleado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante base MiniPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Variante NanoPlus base: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF
- Variante NanoPlus abliterated: https://huggingface.co/IsValorum/Inkling-2-Mini-Abliterated-APEX-I-NanoPlus-V2.1-GGUF
- V-Agent (agente de escritorio del autor): https://github.com/IsValorum/V-Agent
- Releases de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Licencia de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/LICENSE
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
