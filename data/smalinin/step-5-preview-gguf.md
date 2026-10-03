# smalinin/Step-5-Preview-GGUF

## Resumen

Step-5-Preview es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por StepFun, distribuido en esta ficha a traves de una conversion GGUF mantenida por el usuario smalinin a partir del checkpoint BF16 de TypeSafeAI. El modelo declara aproximadamente 601.000 millones de parametros totales y unos 27.000 millones de parametros activos por token, con 92 capas de texto, 352 expertos enrutados (8 seleccionados por token) y una ventana de contexto anunciada de 1.000.000 de tokens basada en Sparse GQA con fusion de tokens por bloques. Esta orientado a codigo, razonamiento y flujos de agentes, y acepta entradas de texto, imagen y video.

La relevancia de esta publicacion concreta no esta en el modelo en si, sino en el trabajo de reconstruccion de la cuantizacion: las siete partes Q3_K_M de TypeSafeAI no incluian los tensores del indexador disperso (`sparse_indexer_*` y `ssmax_s`), y esta ficha anade 184 tensores extraidos del checkpoint INT4-g128 de NeuroSenko en una octava parte del GGUF, preservando sus tipos originales BF16/F32. El resultado es un conjunto de 8 partes y 1783 tensores, con el identificador de arquitectura `step35`.

Se trata de un artefacto marcado explicitamente como experimental. El autor advierte de que el soporte completo de CSA/Sparse GQA no esta implementado, que la inferencia de contexto largo usa un modo denso de reserva sobre las capas de atencion completa, y que el runtime solo ha sido validado en configuracion CUDA (incluido offload a CPU). Las pruebas locales cubren prompts de hasta aproximadamente 60.000 tokens con una asignacion de contexto de 64.000, sin que ello demuestre equivalencia con el modelo original ni soporte real de su contexto de 1M de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida: 23 capas de atencion completa y 69 de ventana deslizante (ventana de 512 tokens), Sparse GQA con block-wise token merging, 3 capas MTP embebidas |
| Parametros totales | 600.991.912.608 (aprox. 601B) |
| Parametros activos | Aprox. 27B por token (352 expertos enrutados, 8 seleccionados por token) |
| Longitud de contexto | 1.000.000 de tokens declarados por el modelo original; el runtime experimental de esta ficha solo ha sido validado hasta aprox. 60K tokens con asignacion de 64.000 tokens |
| Tipos de cuantizacion | Q3_K_M para el texto, con tensores de sparse indexer restaurados en BF16 y F32 (no requantizados); existe tambien una variante INT4-g128 del modelo base |
| Idiomas soportados | en, zh, multilingue |
| Licencia | stepfun-community-license (etiquetada como "other") |
| Formato de pesos | GGUF en 8 partes (1783 tensores); el modelo base esta en safetensors BF16; el codificador de vision es independiente y requiere un GGUF `mmproj` |

Otros parametros de configuracion del checkpoint original:

| Componente | Configuracion |
|---|---|
| Capas de texto principales | 92 |
| Tamano oculto | 4096 |
| Expertos enrutados / seleccionados | 352 / 8 por token |
| Cabezas de atencion / cabezas KV | 64 / 4 |
| Dimension de cabeza de atencion | 192 |
| Patron de atencion | 23 capas de atencion completa y 69 de ventana deslizante |
| Ventana deslizante | 512 tokens |
| Dimensiones rotatorias | 64 en atencion completa; 192 en atencion de ventana |
| Capas MTP embebidas | 3, despues de las capas de texto principales |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atencion hibrida. De las 92 capas de texto, 23 emplean atencion completa y 69 usan atencion de ventana deslizante de 512 tokens, lo que reduce el coste de atencion en secuencias largas. El mecanismo de atencion declarado por el modelo original es Sparse GQA con fusion de tokens por bloques (block-wise token merging), con 64 cabezas de consulta y 4 cabezas KV, dimension de cabeza 192 y dimensiones rotatorias diferenciadas (64 en capas de atencion completa, 192 en capas de ventana). Se anaden 3 capas MTP (multi-token prediction) embebidas tras las capas principales.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento del modelo original. Tampoco se detalla el proceso de destilacion o preentrenamiento. Lo unico documentado en esta ficha es el proceso de reconstruccion del GGUF: se partio de las siete partes Q3_K_M de TypeSafeAI (1599 tensores) y se identificaron los tensores ausentes del indexador disperso en las 23 capas de atencion completa (8 por capa, 184 en total). Esos tensores se extrajeron de los shards safetensors de NeuroSenko mediante peticiones HTTP con rangos de bytes, se mapearon a nombres GGUF y se escribieron en una octava parte, conservando tipos y bytes de carga util. Los tensores restaurados suman 874.326.784 bytes (aprox. 833,8 MiB): 69 tensores BF16 y 115 F32. Solo se actualizaron `split.count` y `split.tensors.count` en las siete cabeceras originales; ningun peso original fue requantizado ni reemplazado.

## Capacidades

Las siguientes capacidades corresponden a las declaradas por el modelo original (Step-5-Preview de StepFun), no necesariamente verificadas en este runtime experimental:

- Generacion de texto y razonamiento con esfuerzo de razonamiento configurable.
- Generacion y comprension de codigo, orientada a flujos de trabajo de programacion.
- Entrada multimodal: texto, imagen y video.
- Llamada a herramientas en paralelo (parallel tool calling) y salida estructurada.
- Flujos de agente y razonamiento multi-paso.
- Capacidades multilingues, con soporte nativo de ingles y chino.
- Contexto largo anunciado de hasta 1.000.000 de tokens mediante Sparse GQA con fusion de tokens por bloques.
- Capas MTP embebidas, que habilitan prediccion de multiples tokens.

Capacidades efectivamente validadas en el runtime experimental de esta ficha:

- Inferencia de texto en configuracion CUDA con offload a CPU.
- Prompts de hasta aproximadamente 60.000 tokens con asignacion de contexto de 64.000 tokens, mediante un modo denso de reserva en las capas de atencion completa.
- El codificador de vision se distribuye aparte y requiere un GGUF `mmproj` para funcionar.

## Casos de uso

- Asistencia a la programacion en repositorios grandes: con 92 capas y un contexto declarado de 1M de tokens, el modelo esta pensado para razonar sobre bases de codigo extensas. En la practica, con este GGUF conviene limitarse a ventanas de decenas de miles de tokens, dado que el modo disperso no esta implementado.
- Agentes autonomos con llamada a herramientas: el soporte de parallel tool calling y salida estructurada permite construir agentes que consulten APIs, ejecuten comandos y encadenen pasos intermedios, siempre que se instancie sobre el runtime CUDA validado.
- Pipelines de revision de codigo en CI/CD: el modelo puede integrarse como paso de analisis que detecte errores, sugiera parches y genere mensajes de commit estructurados a partir de diffs.
- Analisis de documentacion tecnica multilingue: al cubrir ingles, chino y otros idiomas, resulta util para extraer y resumir informacion de manuales y especificaciones en entornos internacionales.
- Investigacion sobre cuantizacion extrema: el propio artefacto es un caso de estudio para medir el impacto de Q3_K_M y de la ausencia de tensores de indexador disperso en la calidad de un MoE de 601B de parametros.
- Experimentacion con arquitecturas MoE de activacion dispersa: permite estudiar en local el comportamiento de un modelo con 352 expertos y 8 activos por token, comparando modos denso y disperso.
- Procesamiento de entradas con imagen para prototipos: gracias al pipeline image-text-to-text, se puede usar con un GGUF `mmproj` para tareas de descripcion o extraccion de informacion de capturas y diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo original ni para esta cuantizacion. Tampoco se aportan mediciones de throughput o latencia mas alla de la indicacion de que las pruebas locales alcanzaron prompts de unos 60.000 tokens.

## Requisitos de hardware

- Tamano del repositorio: 291,3 GB, correspondiente al conjunto Q3_K_M de 8 partes mas los tensores restaurados en BF16/F32 (833,8 MiB). Es el orden de magnitud del espacio en disco y de memoria total necesaria para cargar los pesos.
- VRAM/RAM estimada: del orden de 290 GB o mas para los pesos, mas la memoria adicional de la cache KV segun contexto y lote. No se dispone de cifras oficiales de consumo por contexto en la informacion proporcionada.
- No cabe en GPU de consumo: una RTX 4090 con 24 GB no puede alojar el modelo completo. Seria viable unicamente con offload masivo a RAM del sistema y con la penalizacion de rendimiento correspondiente.
- GPU recomendadas: configuraciones multi-GPU de clase数据中心 con al menos 320 GB de VRAM agregada, por ejemplo 4x H100 80 GB o 4x A100 80 GB. No se especifica una configuracion oficialmente soportada.
- Backend validado: exclusivamente CUDA, incluido el offload a CPU, con la rama experimental `smalinin/llama.cpp#my_step5`. Otros backends de GPU y la ejecucion completa en CPU no han sido validados.
- Opciones de despliegue: llama.cpp con la rama indicada. No hay informacion sobre compatibilidad con vLLM, TGI, Ollama u otros servidores de inferencia para este GGUF concreto.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo en la informacion proporcionada, por lo que la comparacion de rendimiento no puede establecerse. La comparacion se limita a caracteristicas estructurales publicas de modelos MoE de escala similar.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Step-5-Preview (esta ficha) | Aprox. 601B | Aprox. 27B | 1M declarados; validado aprox. 60K en esta cuantizacion | stepfun-community-license |
| Alternativas de la misma categoria | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se han incluido cifras de otros modelos porque la busqueda proporcionada no contiene datos verificables de alternativas comparables, y este documento no debe incorporar numeros no contrastados.

## Limitaciones y advertencias

- Estado experimental: el runtime que soporta este GGUF solo ha sido validado en configuracion CUDA. No hay validacion en backends de GPU distintos ni en ejecucion completa sobre CPU.
- Sparse GQA incompleto: la atencion dispersa completa (CSA/Sparse GQA) no esta implementada. La inferencia de contexto largo recurre a un modo denso de reserva sobre las capas de atencion completa, lo que puede alterar el comportamiento respecto al modelo original.
- Contexto no verificado a 1M: las pruebas locales llegan a unos 60.000 tokens con una asignacion de 64.000. No esta establecido que el modelo funcione correctamente con el contexto de 1M de tokens que anuncia la model card original.
- Procedencia mixta de los pesos: los tensores del indexador disperso provienen de un checkpoint distinto (NeuroSenko, INT4-g128) del que aporta el resto de los pesos. Solo se verifico la coincidencia exacta con el BF16 original en la primera capa de atencion completa (capa 3), no en las 23.
- Riesgo de alucinacion: no se dispone de evaluaciones de fidelidad ni de tasas de alucinacion en la informacion proporcionada. Como en cualquier modelo generativo de gran escala, el riesgo existe y debe mitigarse con verificacion externa.
- Sesgos: no hay informacion sobre los datos de entrenamiento ni sobre analisis de sesgo, por lo que no pueden caracterizarse sesgos concretos.
- Idiomas: el soporte declarado se centra en ingles, chino y uso multilingue generico. No se garantiza un rendimiento homogeneo en castellano ni en otras lenguas no listadas.
- Licencia: se trata de la stepfun-community-license, una licencia "other" con condiciones especificas. Debe revisarse el texto completo antes de cualquier uso comercial; no se puede asumir equivalencia con una licencia permisiva tipo Apache 2.0 o MIT.
- Capacidades multimodales incompletas en este paquete: el codificador de vision no esta incluido y requiere un GGUF `mmproj` aparte.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el mismo dia. No cuenta con validacion comunitaria.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/smalinin/Step-5-Preview-GGUF
- Modelo base en BF16: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16
- Configuracion del checkpoint base: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16/blob/main/config.json
- Revision concreta del checkpoint BF16 usada en la verificacion: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16/tree/e7746ba676c6a0391fce0d54d0a4f392d293dc07
- GGUF Q3_K_M original de TypeSafeAI: https://huggingface.co/TypeSafeAI/Step-5-Preview-GGUF
- Checkpoint INT4-g128 donante de los tensores restaurados: https://huggingface.co/NeuroSenko/Step-5-Preview-Int4-g128
- Revision concreta del donante: https://huggingface.co/NeuroSenko/Step-5-Preview-Int4-g128/tree/fbc1415911951ad94736c1720a97a607829adb7c
- Licencia: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16/blob/main/LICENSE
- Rama experimental de llama.cpp: https://github.com/smalinin/llama.cpp/tree/my_step5
