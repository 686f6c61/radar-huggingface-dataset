# minjaechoi/qwen36-twla-adaptive-init5-target2

## Resumen

qwen36-twla-adaptive-init5-target2 es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace. No es un modelo entrenado desde cero, sino el resultado de aplicar una optimización de precisión mixta (denominada TWLA, *routed-expert TWLA mixed-precision optimization*) sobre un modelo MoE multimodal de la familia Qwen3.5, según indica el tag `qwen3_5_moe`. El problema que aborda es el de asignar presupuesto de bits de forma desigual entre los expertos enrutados de un MoE: en lugar de cuantizar todo el modelo con un mismo esquema, se decide un nivel de precisión por unidad (un experto de una capa concreta) minimizando NLL de validación más un término de bits lógicos ponderado por lambda.

El checkpoint tiene 35.107.181.936 parámetros totales (unos 35,1 mil millones) distribuidos en 40 capas con 256 expertos enrutados cada una, lo que da 10.240 unidades de cuantización independientes. La precisión media final de los expertos enrutados es de 1,939653923108582 bits, con un objetivo declarado de 2,0 bits y un nivel inicial de 5. El autor indica explícitamente que GPQA no se utilizó para calibración, ranking de sensibilidad, asignación, criterios de parada ni selección del checkpoint, lo que es una salvaguarda metodológica relevante para interpretar los resultados.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin benchmarks publicados y sin model card descriptiva más allá del resumen del proceso de optimización. Su interés es, por tanto, metodológico y reproducible, no de producto: sirve para estudiar el comportamiento de MoEs con precisión agresiva en los expertos enrutados, no para desplegarse en producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (familia Qwen3.5 MoE, segun el tag `qwen3_5_moe`); checkpoint optimizado con precision mixta TWLA |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no declarada; depende del modelo base, que no se identifica) |
| Tipos de cuantizacion | No se ofrecen variantes GGUF, AWQ ni GPTQ. El checkpoint incorpora precision mixta interna: expertos enrutados a una media de 1,939653923108582 bits, con nivel inicial 5 en la busqueda |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en los metadatos ni en la model card) |
| Formato de pesos | safetensors, mas ficheros de metadatos JSON (`optimization_summary.json`, `precision_map.json`) y codigo auxiliar en `code/` |

Datos adicionales de la model card y de los metadatos:

| Parametro | Valor |
|---|---|
| Unidades de cuantizacion | 10.240 (40 capas x 256 expertos enrutados por capa) |
| Parametros por experto (media) | ~3,4 millones (35,1 B / 10.240 unidades) |
| Objetivo de bits (expertos) | 2,0 |
| Bits finales (expertos) | 1,939653923108582 |
| Nivel inicial | 5 |
| Modo de busqueda | `proxy_prefix` |
| Objetivo de la optimizacion | NLL de validacion mas un termino de bits logicos medios ponderado por lambda |
| Tamano del repositorio | 70,2 GB |
| Descargas / likes | 0 / 0 |

Nota sobre el tamano: 70,2 GB para 35,1 B de parametros equivale a unos 16 bits por parametro de media, cifra que no es coherente con una media de 1,94 bits en los expertos enrutados. La informacion disponible no explica esta discrepancia (podria deberse a componentes no enrutados en precision alta, a copias redundantes de pesos o a ficheros adicionales del repositorio). Se recomienda inspeccionar `precision_map.json` antes de asumir cualquier cifra de memoria.

## Arquitectura y entrenamiento

La arquitectura base es un transformer de tipo mezcla de expertos (MoE) con atencion densa, multimodal (pipeline `image-text-to-text`) y orientado a uso conversacional segun los tags. La estructura declarada es de 40 capas, cada una con 256 expertos enrutados, lo que suma 10.240 expertos. No se especifica el numero de expertos activos por token, el tamano de la dimension oculta, el numero de cabezas de atencion ni la identidad exacta del checkpoint base de Qwen3.5 sobre el que se aplico la optimizacion; tampoco se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, porque este repositorio no publica entrenamiento desde cero sino una reoptimizacion de precision sobre pesos preexistentes.

La innovacion tecnica esta en el procedimiento de asignacion de precision. Cada experto enrutado de cada capa se trata como una unidad de cuantizacion independiente y se le asigna un nivel de bits dentro de una busqueda en modo `proxy_prefix`, partiendo del nivel inicial 5 y persiguiendo una media de 2,0 bits por experto. La funcion objetivo combina la NLL sobre un conjunto de validacion con un termino de bits logicos medios ponderado por lambda, de modo que el optimizador puede gastar mas bits en los expertos mas sensibles y menos en los redundantes. El autor subraya que GPQA no participo en ninguna fase del proceso (ni calibracion, ni ranking de sensibilidad, ni asignacion, ni criterio de parada, ni seleccion de checkpoint), lo que evita el sesgo de seleccionar el checkpoint que mejor puntua en ese benchmark concreto.

El resultado final es una media de 1,939653923108582 bits por experto enrutado, ligeramente por debajo del objetivo de 2,0 bits. La reproducibilidad se apoya en `optimization_summary.json`, `precision_map.json` y el codigo incluido en `code/`, que segun la model card contiene las fuentes exactas del optimizador y de la inferencia GPQA utilizadas en el espacio de trabajo. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o variantes SSM.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline declarado indican soporte de dialogos multi-turno, aunque no se publican ejemplos ni evaluaciones.
- Comprension de imagen y texto (image-text-to-text): el modelo acepta entradas mixtas de imagen y texto y produce salida textual, lo que lo situa en la categoria de VLM.
- Razonamiento y conocimiento general: no hay benchmarks publicados que permitan cuantificar MMLU, GPQA u otros; el autor indica que GPQA se excluyo deliberadamente de todo el proceso.
- Generacion de codigo: no declarada explicitamente; no disponible.
- Matematicas: no declarada; no disponible.
- Tool calling / function calling: no declarado en los tags ni en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado; el tag `endpoints_compatible` sugiere compatibilidad de despliegue, no capacidades de agente.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Capacidad especial destacable: modo de precision mixta por experto enrutado, con mapa de precision exportado, orientado a analisis de sensibilidad y eficiencia de memoria mas que a una funcionalidad de usuario.
- Servido en endpoints: el tag `endpoints_compatible` indica que el repositorio esta preparado para su consumo mediante endpoints compatibles, sin mas detalle.

## Casos de uso

- Investigacion en cuantizacion de MoE: reproducir el pipeline TWLA a partir de `optimization_summary.json`, `precision_map.json` y `code/` para estudiar como se distribuye el presupuesto de bits entre los 10.240 expertos enrutados y que expertos concentran mas precision.
- Analisis de sensibilidad por experto: usar el mapa de precision para identificar expertos con umbrales de degradacion distintos y correlacionarlos con la capa o la posicion en el router, informacion util para disenar esquemas de cuantizacion mas agresivos en futuros MoE.
- Evaluacion independiente de precision agresiva: como el autor excluyo GPQA de todo el proceso, este checkpoint es un candidato limpio para medir la degradacion real en GPQA, MMLU o tareas multimodales sin contaminacion por seleccion de checkpoint.
- Prototipado de asistentes multimodales en laboratorio: el pipeline image-text-to-text permite experimentar con dialogo sobre imagenes (descripcion, preguntas y respuestas visuales) en entornos de investigacion donde la licencia no bloquea el uso.
- Pruebas de despliegue en endpoints compatibles: el tag `endpoints_compatible` permite integrarlo en infraestructura de servido existente para medir latencia, throughput y consumo de VRAM reales frente a las estimaciones teoricas de un MoE de 35,1 B con expertos a ~1,94 bits.
- Estudio de la discrepancia entre bits declarados y tamano en disco: el desajuste entre los 1,94 bits por experto y los 70,2 GB del repositorio es un caso de estudio concreto para validar herramientas de contabilidad de memoria en checkpoints de precision mixta.
- Base para experimentos de ajuste fino selectivo: al disponer de un mapa de precision por experto, se puede explorar si conviene reentrenar solo los expertos con precision mas baja para recuperar calidad sin volver a precision completa.
- Comparacion de estrategias de cuantizacion: enfrentar este checkpoint contra variantes uniformes (por ejemplo, 2 bits en todos los expertos) sobre el mismo modelo base para aislar el efecto de la asignacion no uniforme. Advertencia: cualquier uso en produccion queda bloqueado hasta que se aclare la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna puntuacion (ni MMLU, ni GPQA, ni HumanEval, ni GSM8K, ni metricas multimodales) y unicamente declara la metrica interna de la optimizacion: la media final de 1,939653923108582 bits por experto enrutado, con objetivo de 2,0 bits. Se indica de forma explicita que GPQA no se uso en calibracion, ranking de sensibilidad, asignacion, parada ni seleccion de checkpoint, pero no se aporta el resultado de GPQA ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia de orden de magnitud, 35,1 B de parametros en BF16 ocupan unos 70 GB solo en pesos, coherente con los 70,2 GB del repositorio. En la precision mixta declarada, el consumo real depende de la distribucion de bits de `precision_map.json` y del numero de expertos activos por token, dato no publicado.
- Regla practica: para servir el modelo sin cuantizacion adicional hay que presupuestar al menos 1,2 veces el tamano de los pesos entre pesos, cache KV y activaciones, es decir, del orden de 80-90 GB de VRAM agregada.
- GPU recomendadas: configuraciones de 80 GB o multi-GPU, como 2x A100 80 GB, 2x H100 80 GB o 1x H200 141 GB. Una sola A100 80 GB o H100 80 GB queda al limite y probablemente insuficiente con cache KV para contextos largos.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en la precision nativa del checkpoint. Para caber en una GPU de 24 GB habria que aplicar una cuantizacion adicional a 4 bits (aproximadamente 18-19 GB en pesos), operacion que no esta documentada por el autor.
- Opciones de despliegue: `transformers` es la libreria declarada, por lo que el camino soportado es la carga directa con la version de transformers que reconozca la arquitectura `qwen3_5_moe`. El tag `endpoints_compatible` sugiere servido mediante endpoints compatibles. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, y no se publican variantes GGUF.
- Latencia y throughput: no disponibles. En un MoE con 256 expertos por capa, el rendimiento depende criticamente del numero de expertos activos por token, que no se especifica.
- Almacenamiento: el repositorio ocupa 70,2 GB, por lo que se necesita ese espacio en disco o en cache de modelos antes de la carga.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el checkpoint base exacto de la familia Qwen3.5 MoE sobre el que se aplico la optimizacion, no publica parametros activos ni longitud de contexto, y no aporta ninguna metrica de calidad que permita una comparacion verificable con alternativas de la misma categoria (por ejemplo, otros MoE de ~30-40 B o VLMs de rango similar). Tampoco se dispone de datos de licencia que permitan comparar condiciones de uso.

La unica comparacion que puede establecerse con los datos actuales es interna, frente a una hipotetica cuantizacion uniforme del mismo modelo base a 2 bits por experto: este checkpoint se situa en 1,939653923108582 bits de media, por debajo del objetivo de 2,0, con asignacion no uniforme por experto. El efecto de esa asignacion sobre la calidad no se puede cuantificar sin ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Licencia no declarada: no se indica licencia en los metadatos ni en la model card, por lo que no hay base legal clara para uso comercial. Cualquier despliegue en produccion queda bloqueado hasta aclarar este punto con el autor.
- Sin idiomas declarados: no se especifica que lenguas soporta el modelo ni como se comporta en castellano.
- Sin longitud de contexto declarada: se desconoce la ventana de contexto efectiva, lo que impide planificar casos de uso con documentos largos.
- Sin benchmarks: no hay ninguna evidencia publicada de calidad (MMLU, GPQA, tareas multimodales, codigo o matematicas). La unica metrica disponible mide tamano, no capacidad.
- Cuantizacion muy agresiva: una media de 1,939653923108582 bits en los expertos enrutados es un regimen extremo; es esperable degradacion de calidad, aunque su magnitud no esta medida en la informacion disponible.
- Riesgo de alucinacion: no evaluado. Al ser un modelo conversacional multimodal con precision reducida, la probabilidad de respuestas plausibles pero incorrectas no puede descartarse y deberia medirse antes de cualquier uso real.
- Sesgos: no documentados. No hay informacion sobre la composicion del dataset de entrenamiento del modelo base ni sobre procesos de alineacion (RLHF, DPO) aplicados.
- Discrepancia entre bits declarados y tamano del repositorio: los 70,2 GB no cuadran con una media de 1,94 bits en los expertos; hay que verificar `precision_map.json` y el contenido real de los safetensors antes de sacar conclusiones sobre memoria o sobre el alcance real de la cuantizacion.
- Metadatos incompletos: se desconoce el numero de parametros activos, la identidad del modelo base y la configuracion exacta de la busqueda mas alla del modo `proxy_prefix` y el nivel inicial 5.
- Trazabilidad del artefacto: 0 descargas y 0 likes, publicado por un autor individual sin historial verificable en el repositorio. Conviene tratar el checkpoint como material de investigacion no auditado.
- Ausencia de GPQA: el autor indica que GPQA no se uso en ninguna fase, lo que evita el sesgo de seleccion pero tambien significa que no hay ninguna senal de calidad en ese eje.
- Reproducibilidad condicionada: el codigo y los JSON de metadatos se incluyen en el repositorio, pero sin fijar versiones de dependencias ni entorno de ejecucion, por lo que la reproduccion exacta puede requerir ajustes.

## Enlaces

- HuggingFace: https://huggingface.co/minjaechoi/qwen36-twla-adaptive-init5-target2
- Ficheros de metadatos del repositorio: `optimization_summary.json` y `precision_map.json` (incluidos en el propio repositorio de HuggingFace)
- Codigo del optimizador y de inferencia GPQA: directorio `code/` dentro del repositorio de HuggingFace
- Paper, blog, repositorio independiente o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los unicos enlaces recuperados corresponden a informacion medica sobre el herpes zoster (nhs.uk, healthline.com, verywellhealth.com, nhsinform.scot, medicinenet.com) y no guardan relacion con este checkpoint, por lo que se descartan como fuentes.
