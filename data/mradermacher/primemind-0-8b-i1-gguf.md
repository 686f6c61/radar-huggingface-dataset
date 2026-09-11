# mradermacher/PrimeMind-0.8B-i1-GGUF

## Resumen

PrimeMind-0.8B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo base CrowdMind/PrimeMind-0.8B. No se trata por tanto de un modelo entrenado, sino de una conversión y compresión de los pesos originales a múltiples niveles de cuantización, pensada para ejecución en CPU y en GPU de gama baja mediante llama.cpp y herramientas compatibles.

La relevancia de este tipo de repositorios es práctica: los quants con matriz de importancia (imatrix) permiten reducir el peso en disco y en memoria manteniendo una degradación de calidad inferior a la de una cuantización ingenua del mismo tamaño. En este caso el autor publica 24 variantes, desde IQ1_S hasta Q6_K, lo que cubre desde despliegues extremos en dispositivos con pocos cientos de megabytes libres hasta ejecuciones casi sin pérdida.

La información publicada es extremadamente escasa: no hay licencia declarada, no se especifican idiomas, no hay pipeline definido, ni benchmarks, ni detalles de arquitectura, entrenamiento o contexto. Además, el dato de parámetros totales leído de los safetensors (276.666) no concuerda con el nombre del modelo (0,8B), por lo que cualquier evaluación seria exige consultar el repositorio del modelo base antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo contiene pesos GGUF; no se documenta la arquitectura del modelo base) |
| Parametros totales | 276.666 segun los safetensors del repositorio; el nombre del modelo indica 0,8B. Discrepancia no aclarada por el autor |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con el metodo i1, basado en imatrix/weighted quants) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base CrowdMind/PrimeMind-0.8B en los datos proporcionados. El repositorio analizado es exclusivamente una publicacion de pesos cuantizados: los metadatos internos de la conversion indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que los pesos de partida estaban en formato HuggingFace (safetensors) y que la conversion se hizo con el flujo habitual de llama.cpp.

El unico detalle tecnico reseñable es el uso de cuantizacion ponderada por matriz de importancia (imatrix), etiquetada por el autor como `i1`. Este metodo calcula una matriz de importancia a partir de estadisticas de activaciones y la usa para decidir cuantos bits asignar a cada tensor, lo que mejora la relacion calidad/tamano frente a los quants estandar. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni innovaciones arquitectonicas.

## Capacidades

- El repositorio no documenta capacidades funcionales del modelo: al ser una publicacion de cuantizaciones, las capacidades dependen integramente del modelo base CrowdMind/PrimeMind-0.8B, cuyo model card no forma parte de la informacion disponible.
- Generacion de texto: no disponible (no confirmado por el autor).
- Razonamiento, codigo y matematicas: no disponible.
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: las variantes IQ2/IQ3 y Q4_K_M estan pensadas para ejecutarse en CPU con llama.cpp u Ollama, lo que permite desplegar un modelo de ~0,8B en portatiles y mini-PC sin acelerador.
- Prototipado rapido de pipelines de generacion de texto: al ocupar pocos cientos de megabytes, estas cuantizaciones permiten iterar sobre prompts y plantillas en entornos de desarrollo con recursos limitados antes de escalar a un modelo mayor.
- Clasificacion y etiquetado de texto a gran volumen: un modelo de este tamano puede procesar lotes masivos de documentos en CPU siempre que la tarea sea de etiquetado simple; requiere validar antes la calidad real del modelo base.
- Experimentacion con cuantizacion en investigacion: el repositorio sirve como caso de estudio para comparar IQ1_S, IQ2 y Q4_K_M con imatrix sobre un mismo modelo y medir la perdida de calidad segun el nivel de compresion.
- Despliegue en dispositivos de borde (edge computing): los quants de menor tamano pueden integrarse en aplicaciones embebidas o contenedores ligeros donde la memoria es el factor limitante.
- Pruebas de integracion de herramientas compatibles con GGUF: validar cargas, tokenizadores y plantillas de chat en llama.cpp, LM Studio o text-generation-webui antes de pasar a modelos mas grandes.
- Filtrado previo en cascada: usar la variante mas ligera como primer filtro de contenido para decidir que peticiones merecen pasar a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Las cifras siguientes son estimaciones derivadas del tamano nominal de 0,8B indicado en el nombre del modelo, no datos publicados por el autor; el dato de parametros de los safetensors (276.666) no permite validar el modelo real.
- Peso en disco aproximado por variante (estimado): IQ1_S ~0,25 GB; IQ2_XS/IQ2_S ~0,3 GB; IQ3_M ~0,4 GB; Q4_K_M ~0,5 GB; Q5_K_M ~0,6 GB; Q6_K ~0,7 GB.
- VRAM estimada para inferencia: el peso de la cuantizacion mas el cache KV. Con contexto corto, entre 0,5 GB y 1,5 GB segun la variante; el cache KV crece linealmente con la longitud de contexto y con el numero de capas del modelo base.
- GPU recomendadas para carga completa: cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, T4). Para lotes grandes o contextos largos, se recomienda al menos 8 GB (RTX 3070/4060 Ti, L4).
- Cabe sobradamente en GPU de consumo: si, en cualquier GPU moderna con 4 GB o mas, e incluso en GPU integradas con memoria unificada.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y servidores compatibles con GGUF. vLLM y TGI tienen soporte GGUF parcial y no se recomiendan como via principal para este formato.
- Latencia y throughput: no disponibles. En CPU moderna se espera una velocidad de generacion muy superior a la de modelos de 7B-8B, pero el dato no esta publicado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye benchmarks ni especificaciones de modelos alternativos, de modo que cualquier comparacion cuantitativa seria inventada. El unico punto de referencia verificable es el propio modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PrimeMind-0.8B-i1-GGUF (este) | no disponible (nombre: 0,8B) | no disponible | no disponible | GGUF, 24 quants | Cuantizacion imatrix de CrowdMind/PrimeMind-0.8B |
| CrowdMind/PrimeMind-0.8B | no disponible | no disponible | no disponible | safetensors (origen) | Modelo base del que derivan las cuantizaciones |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- El tamano del repositorio se declara como 0.0 GB y el recuento de parametros de los safetensors (276.666) no concuerda con el nombre del modelo (0,8B): verificar la integridad de los archivos antes de usarlos.
- No se declara licencia. Sin licencia explicita no puede asumirse permiso de uso comercial; hay que consultar la licencia del modelo base CrowdMind/PrimeMind-0.8B, que prevalece sobre la cuantizacion.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no puede garantizarse un comportamiento correcto fuera del ingles o en conversaciones largas.
- Riesgo de alucinacion: no evaluado. Los modelos de menos de 1B parametros suelen presentar tasas de alucinacion elevadas y baja fiabilidad en tareas de razonamiento.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) degradan de forma notable la calidad respecto al modelo original; no son adecuadas para tareas que exijan precision.
- No hay informacion sobre sesgos, datos de entrenamiento ni filtros de seguridad aplicados, lo que impide evaluar riesgos de contenido.
- No se han publicado benchmarks: no hay evidencia objetiva de rendimiento en MMLU, HumanEval, GSM8K ni ninguna otra prueba.
- Al ser un derivado no oficial, no cuenta con soporte del autor del modelo original ni con actualizaciones garantizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/PrimeMind-0.8B-i1-GGUF
- Modelo base: https://huggingface.co/CrowdMind/PrimeMind-0.8B
