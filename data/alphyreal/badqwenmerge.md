# alphyreal/badqwenmerge

## Resumen

badqwenmerge es un modelo multimodal de tipo image-text-to-text publicado por el usuario alphyreal en Hugging Face. Se trata de un merge de pesos construido sobre la arquitectura qwen3_5_moe, un transformer con mezcla de expertos (MoE) de la familia Qwen 3.5. El repositorio contiene 35.951.822.704 parametros totales en formato safetensors y ocupa 71,9 GB, lo que sugiere pesos en precision alta (posiblemente bf16 o fp16) sin cuantizar.

La model card es extremadamente escasa: unicamente incluye metadatos de licencia (Apache 2.0), libreria (transformers) y pipeline (image-text-to-text), junto con el titulo "bad qwen+nex2.5 merge dont use". El propio autor desaconseja explicitamente su uso, lo que indica que se trata de un experimento de fusion de modelos sin validacion ni documentacion tecnica.

El modelo no registra descargas ni likes en el momento de la consulta y fue creado y actualizado el 6 de noviembre de 2026. No se dispone de informacion sobre datos de entrenamiento, proceso de merge, evaluaciones ni idiomas soportados, por lo que esta ficha debe interpretarse como una descripcion estructural del artefacto y no como una evaluacion de capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mezcla de expertos, multimodal image-text-to-text) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `qwen3_5_moe` indica que el modelo sigue la arquitectura de la familia Qwen 3.5 en su variante MoE, es decir, un transformer con capas de mezcla de expertos y capacidad multimodal (entrada de imagen y texto). El pipeline declarado, image-text-to-text, confirma que acepta imagenes junto con prompts textuales y genera texto. El tag `conversational` sugiere que esta afinado o formateado para dialogos multi-turno.

No obstante, no hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la estrategia de merge (por ejemplo, SLERP, TIES, DARE o model stock) ni los modelos de origen combinados. El nombre "bad qwen+nex2.5 merge" apunta a una fusion entre un modelo Qwen y otro identificado como "nex2.5", pero no se aporta ningun detalle adicional. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que implica capacidad de describir imagenes, responder preguntas visuales o razonar sobre contenido grafico.
- Razonamiento y generacion de codigo: presumible de la familia Qwen 3.5, aunque no verificado en este merge concreto.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentacion con tecnicas de model merging: el artefacto sirve como caso de estudio para investigar como se comporta la fusion de pesos entre un modelo Qwen 3.5 MoE y otro modelo, comparando perplejidad y coherencia frente a los originales. Adecuado por su disponibilidad publica en safetensors, aunque sin garantias de calidad.
- Investigacion sobre degradacion en merges: dado que el autor lo etiqueta como "bad", puede emplearse como ejemplo negativo en estudios sobre perdida de capacidades tras fusionar modelos MoE multimodales.
- Pruebas de carga y despliegue de modelos de ~36B parametros: util para validar pipelines de inferencia con transformers y infraestructura de serving antes de pasar a modelos en produccion.
- Analisis de interoperabilidad multimodal: permite comprobar si el tokenizador y el procesador de imagen asociados a qwen3_5_moe funcionan correctamente con pesos fusionados.
- Benchmarking interno de robustez: util como baseline de baja calidad contra el que medir modelos afinados o merges mejor documentados.
- Docencia y formacion: sirve para ilustrar en cursos de IA open source los riesgos de publicar merges sin evaluacion ni model card completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 72 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan 80 GB o mas, por lo que una unica GPU de 80 GB (A100 80GB, H100 80GB) es el minimo realista en precision completa.
- Cuantizacion a 8 bits: en torno a 36-40 GB, viable en una A100 40GB o en dos RTX 4090 de 24 GB con tensor parallelism.
- Cuantizacion a 4 bits: en torno a 18-22 GB, cabe en una RTX 4090 de 24 GB, aunque con margen ajustado para contexto largo.
- GPUs recomendadas: H100 80GB, A100 80GB para precision completa; A100 40GB o configuraciones multi-GPU para 8 bits; RTX 4090, RTX 3090 o L40S para 4 bits.
- Opciones de despliegue: transformers (libreria declarada), y potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no hay confirmacion de compatibilidad para este merge concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| alphyreal/badqwenmerge | 35,95B | no disponible | image-text-to-text | Apache 2.0 | Publicado, sin evaluaciones, autor desaconseja su uso |
| Qwen 3.5 MoE (modelo base de referencia) | no disponible en esta ficha | no disponible | texto/multimodal segun variante | no disponible | Modelo oficial de referencia de la familia |
| Otros merges comunitarios de Qwen | variable | variable | variable | habitualmente Apache 2.0 | Depende de cada publicacion |

La comparacion cuantitativa con alternativas concretas no esta disponible porque no se han publicado resultados de evaluacion para este modelo ni se identifican en la informacion proporcionada los modelos de origen exactos del merge.

## Limitaciones y advertencias

- El autor indica explicitamente "dont use" en el titulo de la model card: no se recomienda su uso en produccion ni en aplicaciones reales.
- Ausencia total de evaluaciones: no hay benchmarks, pruebas de calidad ni validacion del merge.
- Riesgo elevado de degradacion de capacidades tras la fusion de pesos, especialmente en arquitecturas MoE y multimodales, donde la alineacion de expertos y del proyector visual es critica.
- Riesgo de alucinacion y respuestas incoherentes no cuantificado.
- Idiomas soportados no declarados; se desconoce el comportamiento multilingue.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Sesgos conocidos: no disponibles, pero al derivar de modelos no identificados puede heredar sesgos de sus origenes.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero la falta de documentacion y de garantias de calidad hace desaconsejable cualquier despliegue productivo.
- El repositorio no registra descargas ni comunidad, por lo que no hay soporte ni issues abiertos.
- Compatibilidad con herramientas de serving (vLLM, TGI, llama.cpp) no verificada.

## Enlaces

- Hugging Face: https://huggingface.co/alphyreal/badqwenmerge
- Repositorio de pesos (safetensors): disponible en la seccion Files and versions del enlace anterior
- Paper, blog, repositorio de codigo o demo: no disponible
