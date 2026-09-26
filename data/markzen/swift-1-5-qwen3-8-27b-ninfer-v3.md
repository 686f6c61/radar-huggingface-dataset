# markzen/Swift-1.5-Qwen3.8-27B-NInfer-v3

## Resumen

Swift-1.5-Qwen3.8-27B-NInfer-v3 es un artefacto de pesos empaquetado en el formato nativo NInfer v3 por el usuario markzen, a partir de la familia de modelos Swift 1.5 de UkisAI sobre la base Qwen3.8-27B. No es un checkpoint de Transformers ni una distribucion en safetensors o GGUF: es un contenedor `.ninfer` de 18.324.358.660 bytes (18,3 GB) que solo puede cargarse con el runtime NInfer. El modelo llega con una receta mixta NVFP4 disenada especificamente para GPUs Blackwell y conserva los componentes de texto, vision y MTP (multi-token prediction) del modelo original.

El modelo resuelve el problema de desplegar un modelo multimodal de 27B en hardware de consumo con soporte de cuantizacion de 4 bits nativa (NVFP4). La relevancia actual viene de dos frentes: por un lado, la familia Swift 1.5 busca reducir el "overthinking" generando trazas de razonamiento mas cortas que el modelo base; por otro, el empaquetado NInfer v3 anade decodificacion especulativa MTP3 y una plantilla de chat con modo thinking activado y esfuerzo `xhigh` por defecto.

La validacion publicada es exclusivamente estructural y numerica, no de generacion: el autor no disponia de GPU durante la conversion. Se verifico la identidad byte a byte con el artefacto Swift anterior (mismo conjunto de bindings, mismos formatos y mismos bytes) y se midieron errores de cuantizacion, pero no hay resultados de calidad de generacion ni benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.8 (base arquitectonica Qwen3.5 segun el repositorio QwenLM), con proyecciones de atencion, GDN (Gated DeltaNet, inferido del nombre de capa `gdn/query_key_value_z`) y MTP para decodificacion especulativa |
| Parametros totales | 27B (segun nomenclatura del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Receta mixta NVFP4: proyecciones MLP importadas en NVFP4 desde ModelOpt (codigos, escalas de bloque y multiplicador por tensor), atencion y GDN recodificadas a NVFP4 desde BF16 con un divisor de pesos compartido por grupo de empaquetado; vision, MTP, vocabulario (Q8) y embedding (Q8) segun receta oficial; capas de atencion directa en BF16. El origen Swift 1.5 almacena atencion y GDN en FP8 por fila |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para el modelo base Qwen3.8-27B; contribuciones Swift bajo Swift Open License v1.0 (UkisAI). El repositorio declara `license: apache-2.0` |
| Formato de pesos | `.ninfer` (artefacto nativo NInfer v3). No es Transformers, safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.8-27B, que segun el repositorio oficial de QwenLM se construye sobre la base arquitectonica de Qwen3.5 y esta orientado a codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo. El artefacto incluye tres componentes declarados: texto, vision y MTP. El componente MTP permite decodificacion especulativa MTP3, aunque el autor indica explicitamente que no contiene pesos DFlash2. La presencia de proyecciones `gdn/query_key_value_z` apunta a capas hibridas de tipo Gated DeltaNet integradas junto a la atencion clasica, si bien la model card no describe la arquitectura en detalle.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. Sobre la receta Swift 1.5, la fuente de UkisAI indica que el modelo incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI, cuyo proposito es producir trazas de razonamiento mas cortas y reducir errores de sobrepensamiento, manteniendo la interfaz estandar de Qwen3.8 y el soporte de texto, imagen y video. La innovacion tecnica mas destacable de este artefacto concreto es el reempaquetado NVFP4: las proyecciones MLP se importan byte a byte desde la exportacion ModelOpt NVFP4/FP8, mientras que atencion y GDN se recodifican a NVFP4 desde el origen BF16. El informe de conversion registra 485 divisores de activacion heredados del artefacto Swift previo.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y nivel de esfuerzo `xhigh` en la plantilla de chat `qwen3_8.jinja`.
- Procesamiento multimodal de imagen y video, segun el componente de vision declarado y la descripcion de Swift 1.5 que retiene soporte de texto, imagen y video.
- Reduccion de sobrepensamiento: la familia Swift produce trazas de razonamiento mas cortas que el modelo base, lo que reduce coste de tokens de salida en tareas de razonamiento.
- Decodificacion especulativa MTP3 para acelerar la generacion, con la salvedad de que no incluye pesos DFlash2.
- Capacidades de codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo heredadas de Qwen3.8.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada, aunque Qwen3.8 esta orientado a tareas agenticas.
- Soporte de agentes y razonamiento multi-paso: heredado del diseno de Qwen3.8 para completar tareas complejas de multiples pasos.
- Capacidades multilingues: no disponible.
- Personalizacion de plantilla de chat por peticion mediante `--chat-template`.

## Casos de uso

- Despliegue local en GPUs Blackwell: el artefacto NVFP4 de 18,3 GB esta pensado para ejecutarse con el runtime NInfer en hardware con soporte nativo de FP4, lo que permite servir un modelo de 27B multimodal en una unica GPU de gama alta de consumo.
- Agentes autonomos de multiples pasos: el modo thinking con esfuerzo `xhigh` y el enfoque de Swift en reducir sobrepensamiento lo hacen adecuado para cadenas largas de razonamiento donde el coste de tokens de salida importa, por ejemplo automatizacion de tareas de investigacion o analisis documental encadenado.
- Asistencia de codigo en pipelines internos: heredando las capacidades de Qwen3.8 en codigo y trabajo profesional, puede integrarse como asistente de generacion y revision en flujos de desarrollo, siempre que el runtime NInfer encaje en la infraestructura existente.
- Inferencia de baja latencia con decodificacion especulativa MTP3: escenarios interactivos donde se necesita reducir el tiempo por token, como chat en tiempo real o autocompletado, aprovechando el componente MTP incluido.
- Procesamiento de documentos con imagenes: gracias al componente de vision, puede extraer y razonar sobre contenido visual combinado con texto, por ejemplo analisis de capturas, diagramas o documentos escaneados.
- Experimentacion e investigacion sobre cuantizacion NVFP4: el artefacto incluye un informe de conversion completo (`conversion.json`) con errores de dequantizacion medidos (MAE 0,083 frente a BF16 en NVFP4 importado, relMAE 0,090 en NVFP4 recodificado), lo que lo convierte en material de referencia para estudiar el impacto de la cuantizacion FP4 en modelos multimodales.
- Evaluacion comparativa de variantes Swift: al mantener estructura y tamano identicos al artefacto Swift-Qwen3.8-27B-NInfer-v3, permite comparar la evolucion 1.5 frente a la version anterior en igualdad de condiciones de empaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no disponia de GPU durante la conversion, por lo que la validacion realizada es estructural y numerica, no una prueba de generacion. Los unicos datos cuantitativos publicados son metricas de error de cuantizacion:

| Metrica de conversion | Valor |
|---|---|
| Tamano del artefacto | 18.324.358.660 bytes (18,3 GB) |
| Tensor bytes | 18,3109 GB |
| Bindings | 1422 (identicos al artefacto Swift previo) |
| Conjunto de uso | 785 |
| Error absoluto medio de dequantizacion NVFP4 importado vs BF16 | 0,083 |
| relMAE de NVFP4 recodificado (atencion/GDN) vs BF16 | 0,090 |
| Correlacion NVFP4 recodificado vs BF16 | ~1,0 |
| SHA-256 del archivo | `fdf8ca7575fd01a83ed86bbaad63ecbf0ff9632a6a8331642f339b9901efbc46` |

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ocupa 18,3 GB en disco; se necesita una GPU con al menos 24 GB de VRAM para cargarlo con margen para activaciones y cache KV, aunque el requisito exacto depende de la longitud de contexto y del runtime NInfer.
- GPU recomendadas: el tag `blackwell` y el uso de NVFP4 indican que el formato esta pensado para GPUs NVIDIA Blackwell, es decir RTX serie 50 y aceleradores de centro de datos B100/B200. No hay datos sobre compatibilidad con generaciones anteriores.
- Compatibilidad con GPU de consumo: si el soporte NVFP4 esta disponible, una RTX 5090 (32 GB) o una RTX 5080 (16 GB, esta ultima quedaria justa por el tamano del artefacto) serian los candidatos naturales en el segmento de consumo.
- Opciones de despliegue: exclusivamente el runtime NInfer (libreria declarada `ninfer`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuye en safetensors ni GGUF.
- Latencia y throughput: no disponible. El modelo soporta decodificacion especulativa MTP3, que en teoria mejora el throughput de generacion, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| markzen/Swift-1.5-Qwen3.8-27B-NInfer-v3 | 27B | no disponible | `.ninfer` (NVFP4 mixto) | Apache-2.0 + Swift Open License v1.0 | Objeto de esta ficha |
| markzen/Swift-Qwen3.8-27B-NInfer-v3 | 27B | no disponible | `.ninfer` (NVFP4) | Apache-2.0 + Swift Open License v1.0 | Version anterior de Swift; estructura y tamano identicos segun el autor |
| ukisai/Swift-1.5-Qwen3.8-27B-NVFP4 | 27B | no disponible | Exportacion ModelOpt NVFP4/FP8 | Apache-2.0 + Swift Open License v1.0 | Fuente directa del artefacto; destinada a ModelOpt, no a NInfer |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B | no disponible | BF16 | Apache-2.0 + Swift Open License v1.0 | Base BF16 sin cuantizar de la que derivan los artefactos NVFP4 |
| kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3 | 27B | no disponible | `.ninfer` (NVFP4, incluye DFlash2) | no disponible | Variante abliterated con pesos DFlash2; no comparable en alineamiento |

## Limitaciones y advertencias

- Compatibilidad restringida: el formato `.ninfer` solo funciona con el runtime NInfer, lo que descarta su uso directo en ecosistemas estandar como Transformers, vLLM, llama.cpp u Ollama.
- Sin validacion de generacion: el autor no pudo ejecutar el modelo por falta de GPU, por lo que no existe evidencia publicada de que la salida sea correcta ni de su calidad. La validacion es exclusivamente estructural y numerica.
- Requisito de hardware especifico: el uso de NVFP4 limita el despliegue a GPUs Blackwell; no hay informacion sobre fallback a otras generaciones.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponible, por lo que no puede garantizarse cobertura multilingue ni comportamiento en castellano.
- Longitud de contexto: no disponible.
- Licencia mixta: aunque el repositorio declara Apache-2.0, las contribuciones Swift quedan bajo la Swift Open License v1.0 de UkisAI, cuyos terminos para uso comercial no se detallan en la informacion proporcionada. Conviene revisar los ficheros LICENSE y NOTICE de los repositorios de origen antes de un uso comercial.
- Trazabilidad limitada: cero descargas y cero likes en el momento de crear la ficha, con fechas de creacion y actualizacion separadas por unos diez minutos, lo que sugiere un artefacto recien publicado y sin contraste externo.
- Sin pesos DFlash2: aunque el componente MTP esta presente y soporta MTP3, no se incluyen los pesos DFlash2, por lo que cualquier flujo que dependa de esa tecnica no estara disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/markzen/Swift-1.5-Qwen3.8-27B-NInfer-v3
- Modelo base BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base NVFP4: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-NVFP4
- Runtime NInfer: https://github.com/Neroued/ninfer
- Artefacto Swift anterior: https://huggingface.co/markzen/Swift-Qwen3.8-27B-NInfer-v3
- Variante abliterated con DFlash2: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift-abliterated-nvfp4full-dflash2-NInfer-v3
- Anuncio de Swift en UkisAI: https://ukisai.com/news/introducing-swift
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Model card de referencia Qwen3.8-27B para NInfer: https://github.com/mtrskeen/ninfer-5080/tree/master/model-cards/Qwen3.8-27B-NInfer
