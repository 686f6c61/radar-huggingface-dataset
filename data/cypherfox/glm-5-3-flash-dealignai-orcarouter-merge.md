# Cypherfox/GLM-5.3-Flash-dealignai-orcarouter-merge

## Resumen

GLM-5.3-Flash-dealignai-orcarouter-merge es un derivado de pesos (merge) publicado por el usuario Cypherfox a partir del modelo base zai-org/GLM-5.3-Flash, etiquetado en el repositorio como mezcla de expertos (MoE). El resultado combina dos "abliteraciones" independientes del mismo modelo base —dealignai/GLM-5.3-Flash-ABLITERATED-FP8 (ablit) y orcarouter/GLM-5.3-Flash-Uncensored-FP8 (orca)— con el objetivo de eliminar de forma mas completa el comportamiento de rechazo que cada una deja por separado, sin ningun paso de fine-tuning ni de gradiente.

El interes tecnico del merge es que las dos ediciones ocupan direcciones casi ortogonales en el espacio de pesos. La de orca es una unica direccion global de rechazo, estimada en la capa 22 con el metodo de Arditi et al. (2024) y proyectada fuera de todas las capas; la de ablit es un conjunto de direcciones por capa aplicadas parcialmente (escala alfa aproximada de 0,5 a 0,8) sobre capas intermedias (aproximadamente de la 12 a la 43). Como el producto escalar entre ambas direcciones es cercano a cero, las ediciones conmutan y sus eliminaciones se suman en lugar de anularse.

Se distribuye unicamente en formato GGUF, con dos cuantizaciones (Q8_0, ~341 GB, e IQ4_XS con imatrix, ~171 GB) y un proyector visual opcional (mmproj, ~1,2 GB). No se han publicado resultados de benchmarks de capacidades ni evaluaciones de capacidades dañinas, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo la etiqueta como "moe") |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (~341 GB, base de alta precision para recuantizar) e IQ4_XS con imatrix (~171 GB, lista para inferencia); proyector visual mmproj.gguf (~1,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp / gguf-py) |
| Numero de tensores | 1412 (identico en los dos modelos padre) |
| Tamaño del repositorio publicado | no disponible (solo se declara el tamaño de cada fichero) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado: es una combinacion en el espacio de pesos de dos ediciones de un mismo modelo base. Ambos padres comparten arquitectura y formas tensoriales (1412 tensores identicos). El analisis tensor a tensor, de cuantizado a fp32, muestra que 852 de los 1412 tensores son byte a byte identicos entre los dos padres: ninguna de las dos abliteraciones los toco (expertos `ffn_gate/up`, proyecciones Q/K de atencion, todas las normalizaciones y los routers). Las ediciones se concentran en los tensores que escriben en el flujo residual: `attn_output`, `ffn_down` / `ffn_down_exps` / `ffn_down_shexp`, `token_embd` y `nextn.eh_proj`. `output.weight` no fue editado por ninguno de los dos, y las diferencias en `attn_q/k/v` se atribuyen a ruido de recuantizacion, no a una edicion direccional.

Formalmente, cada abliteracion es una aplicacion lineal sobre esos tensores. Si `g` es la direccion unitaria global de orca y `v_l` las direcciones por capa de ablit, el merge aplica `(I - g gᵀ)(I - α_l v_l v_lᵀ) W`, tomando los pesos de ablit y aplicando encima la proyeccion de orca sobre exactamente el mismo conjunto de tensores que orca edito originalmente. La direccion `g` se recupero a precision Q8 a partir de las matrices de diferencia de los propios padres (el primer vector singular por la izquierda de `W_orca - W_ablit` en los tensores que ablit dejo intactos). Las mediciones del autor recuperan la edicion de orca como una unica direccion con coherencia coseno por capa de 0,995 a 1,000, mientras que las de ablit son por capa e independientes entre si. El termino cruzado de la composicion, `α (gᵀv_l) g v_lᵀW`, resulta despreciable porque `gᵀv_l ≈ 0`.

Se usaron `llama.cpp` y `gguf-py` parcheados. La cadena de conversion incluye la correccion del fallo de perdida de signo de NumPy 1.x en la cuantizacion de `gguf-py` (ggml-org/llama.cpp#28438): sin ese parche, los tensores anchos cuantizados bajo NumPy 1.x en CPython 3.14 o superior pierden silenciosamente los bits de signo. La model card explica tambien por que Q8_0 es la base correcta para recuantizar: ambos padres son FP8 (e4m3) nativos y Q8_0 (int8 con una escala fp16 por cada 32 pesos) preserva esos valores de ~3 bits de mantisa practicamente sin perdida, mejor que un upcast a BF16, que solo rellenaria los valores FP8 en un contenedor mas ancho sin recuperar precision.

## Capacidades

- Generacion de texto condicional (`pipeline_tag: text-generation`).
- Razonamiento con modos configurables: la model card describe el comportamiento del modelo con razonamiento en "off", "low" y "max", lo que confirma la existencia de niveles de razonamiento en la familia base. No se detalla en que consiste cada nivel.
- Capacidad multimodal opcional: el fichero `mmproj.gguf` (~1,2 GB) es un proyector de vision que habilita entrada de imagenes en llama.cpp. La model card no documenta el alcance ni la calidad de esta capacidad.
- Comportamiento de rechazo sustancialmente eliminado: la edicion de orca se proyecta a nivel de pesos, por lo que se aplica en todos los ajustes de razonamiento; la de ablit conserva por diseño algunos rechazos en el ajuste "low" para preservar calidad. El autor afirma que la combinacion esta mas completamente "decensurada" que cualquiera de los dos padres.
- Capacidades de codigo, matematicas, tool calling, function calling, uso de agentes y razonamiento multi-paso: no disponibles en la informacion proporcionada. No se documentan ni se evaluan en este repositorio.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo sirve como sujeto de estudio controlado para medir como interactuan dos tecnicas de eliminacion de rechazos (abliteracion por direcciones por capa frente a proyeccion de una unica direccion global). La model card aporta la metodologia y las mediciones de ortogonalidad necesarias para reproducir el experimento.
- Reproduccion y auditoria de merges en el espacio de pesos: dado que la card documenta que 852 de 1412 tensores son identicos entre padres y que las ediciones se limitan a los tensores que escriben en el flujo residual, resulta un caso practico para validar herramientas de comparacion tensorial y de deteccion de ediciones direccionales.
- Generacion creativa sin filtros de rechazo: escritura de ficcion, guiones o narrativa con tematicas adultas, donde los rechazos del modelo base interrumpen la generacion. El modelo esta etiquetado como `not-for-all-audiences`.
- Despliegue local o on-premise con datos sensibles: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, puede correr en infraestructura propia sin llamadas a APIs externas, lo que resulta relevante cuando la politica de la organizacion prohibe enviar datos a terceros.
- Recuantizacion a medida: el fichero Q8_0 (~341 GB) esta pensado explicitamente como base para generar cuantizaciones menores con `llama-quantize` (por ejemplo, K-quants mas agresivas o una imatrix distinta) en lugar de rehacer el merge, lo que permite ajustar el compromiso entre calidad y memoria a la GPU disponible.
- Analisis de documentos con componente visual: usando el proyector `mmproj.gguf`, el modelo puede procesar imagenes junto a texto en la misma sesion de llama.cpp, util para extraccion de informacion de capturas, diagramas o documentos escaneados. La calidad de esta via no esta documentada.
- Estudio comparativo de abliteraciones: al existir los dos padres por separado, el merge permite medir experimentalmente si dos ediciones ortogonales de rechazo producen una degradacion acumulativa o no en tareas de capacidades generales (medicion que, segun la propia card, aun no se ha realizado).
- Pruebas de estres de filtros de seguridad en productos propios: util para equipos que necesitan verificar si sus propias capas de moderacion aguantan entradas adversarias, usando un modelo con los rechazos eliminados a nivel de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se han ejecutado benchmarks de capacidades estandar (MMLU, etc.) y que no se reportan evaluaciones de capacidades dañinas. La unica cifra de rendimiento publicada es interna al merge: la coherencia coseno por capa de la direccion de orca recuperada, entre 0,995 y 1,000. El texto de la model card proporcionado esta truncado en la seccion de direccionalidad ("cosine similarit"), por lo que podria existir informacion adicional no disponible aqui.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamaño de fichero declarado en la model card, no medidas publicadas por el autor.

- IQ4_XS (~171 GB de pesos): requiere al menos 3 GPU de 80 GB (A100 80 GB, H100 80 GB) para los pesos, mas margen para cache KV y activaciones. Dos H100 de 80 GB (160 GB) no son suficientes. Dos H200 de 141 GB (282 GB) dejan margen comodo.
- Q8_0 (~341 GB de pesos): requiere del orden de 5 aceleradores de 80 GB (A100/H100, 400 GB) o 3 H200 de 141 GB (423 GB).
- Proyector visual: `mmproj.gguf` ocupa ~1,2 GB, un coste marginal frente a los pesos.
- GPU de consumo: no cabe en ninguna GPU de consumo. Una RTX 4090 (24 GB) queda muy lejos del minimo de 171 GB de la cuantizacion mas pequeña.
- Opciones de despliegue: llama.cpp (herramienta con la que se construyo y probo el modelo), Ollama y LM Studio para GGUF. vLLM y TGI tienen soporte limitado o nulo de GGUF directo; en esos casos habria que convertir o usar el modelo base en safetensors, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles. Al ser presumiblemente un MoE y estar limitado por ancho de banda de memoria al repartir los pesos entre varias GPU, el rendimiento dependera fuertemente del numero de GPU y del tipo de interconexion (NVLink frente a PCIe).
- Almacenamiento: conviene prever mas de 350 GB libres si se descarga el Q8_0 y se recuantiza in situ, o unos 175 GB para el IQ4_XS.

## Comparativa con modelos similares

| Modelo | Relacion | Metodo de edicion | Licencia | Formato distribuido | Benchmarks publicados |
|---|---|---|---|---|---|
| Este merge (Cypherfox) | Merge de los dos siguientes sobre el base | Proyeccion de orca `(I - ggᵀ)` aplicada sobre los pesos de ablit | MIT | GGUF (Q8_0, IQ4_XS, mmproj) | No |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | Abliteracion independiente del base | "CRACK": edicion permanente por capa incrustada en los shards FP8, aplicada parcialmente (α ≈ 0,5-0,8) en capas ~12-43 | MIT | FP8 (e4m3) | No disponible en la informacion proporcionada; la card del padre cita 0% en HarmBench-320 |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | Abliteracion independiente del base | Ablacion de la direccion de rechazo de Arditi et al. (2024): un unico vector estimado en la capa 22 con media-diferencia enmascarada por activaciones masivas, proyectado fuera de todas las capas | MIT | FP8 (e4m3) | No disponible en la informacion proporcionada |
| zai-org/GLM-5.3-Flash | Modelo base original | No aplica | MIT (segun verificacion del autor del merge, 2026-09-17) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de datos de parametros, contexto ni rendimiento del modelo base, por lo que no es posible una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo decensurado: el comportamiento de rechazo se ha eliminado sustancialmente a nivel de pesos. El propio autor advierte de que la responsabilidad de uso y del cumplimiento de la licencia del modelo base y de la legislacion aplicable recae en el usuario.
- Etiquetado `not-for-all-audiences`: el repositorio lo marca explicitamente como no apto para todas las audiencias.
- Ausencia total de evaluaciones: no hay benchmarks de capacidades (MMLU ni similares) ni evaluaciones de capacidades dañinas. Se desconoce si el merge degrada el rendimiento en tareas generales respecto a los padres o al modelo base.
- Riesgo de alucinacion: no cuantificado. No hay datos publicados sobre tasas de alucinacion ni sobre fiabilidad factual.
- Idiomas y contexto: no disponibles. No se puede planificar un despliegue en produccion que dependa de una ventana de contexto concreta o de cobertura multilingue sin verificacion previa.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-09-17. No hay comunidad que haya validado el resultado.
- Model card truncada: el texto disponible se corta en la seccion sobre direccionalidad, por lo que parte de la evidencia del autor (las "directionality data") no esta accesible aqui.
- Requisitos de memoria muy altos: incluso la cuantizacion mas pequeña (~171 GB) excluye cualquier despliegue en hardware de consumo o en una unica GPU de 80 GB.
- Detalles de la licencia: la licencia declarada es MIT y el autor afirma haber verificado que los tres ascendientes tambien lo son, pero se trata de una verificacion del propio publicador y no de una confirmacion por parte de zai-org, dealignai ni OrcaRouter.
- Caveat de herramienta: la conversion depende de un parche no upstream para el fallo de perdida de signo de NumPy 1.x en `gguf-py` (llama.cpp#28438). Recuantizar con una cadena de herramientas sin ese parche puede producir pesos corruptos.
- Uso comercial: la licencia MIT lo permite en principio, pero el caracter decensurado del modelo puede entrar en conflicto con las politicas de plataformas de despliegue, con las condiciones de proveedores de nube o con normativa sectorial. Requiere revision legal previa.
- Naturaleza del artefacto: es un merge de pesos sin entrenamiento adicional, por lo que hereda cualquier sesgo, limitacion o defecto presente en los dos padres y en el modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Cypherfox/GLM-5.3-Flash-dealignai-orcarouter-merge
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Padre ablit: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Padre orca: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Incidencia de llama.cpp sobre la perdida de signo en la cuantizacion de gguf-py: https://github.com/ggml-org/llama.cpp/issues/28438
- Referencia metodologica citada por el autor (sin enlace en la informacion proporcionada): Arditi et al., 2024, "Refusal in Language Models Is Mediated by a Single Direction".
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
