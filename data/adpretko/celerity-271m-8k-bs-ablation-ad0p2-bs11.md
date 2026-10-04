# adpretko/celerity-271m-8k-bs-ablation-ad0p2-bs11

## Resumen

Celerity 271M 8K — batch-size ablation — ad0.2_bs11 es un checkpoint de 271 millones de parametros de la familia Celerity, publicado por el usuario adpretko en Hugging Face. Se trata de la conversion a formato Hugging Face de un checkpoint original entrenado en formato Cerebras CS (`checkpoint_60104.mdl`), y forma parte de un estudio de ablacion centrado en el tamano de batch global. El modelo maneja una longitud maxima de secuencia de 8192 tokens y emplea embeddings posicionales de tipo ALiBi.

El interes de esta publicacion no es su rendimiento como modelo de proposito general, sino su valor como artefacto de reproducibilidad: documenta con precision los hiperparametros de entrenamiento (learning rate pico de 0,15, batch global de 11, weight decay de 0,0006356381190145931, tau_ema de 0,1745, 60 104 pasos) y permite comparar puntos de una misma curva de ablacion manteniendo fijos el learning rate y tau_ema. Se trata, por tanto, de un checkpoint de investigacion y no de un modelo listo para produccion.

La relevancia actual es doble: por un lado, ejemplifica el flujo de conversion de checkpoints entrenados en hardware Cerebras al ecosistema Hugging Face; por otro, ilustra una practica creciente de publicar puntos intermedios de estudios de ablacion con trazabilidad completa de hiperparametros y del commit del conversor utilizado. No se ha publicado informacion sobre evaluacion, licencia, idiomas o capacidades concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codigo de modelado propio de Celerity; embeddings posicionales ALiBi (no se detalla la estructura de bloques en la model card) |
| Parametros totales | 271M (segun el nombre del checkpoint; no se desglosa en la model card) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | Checkpoint convertido de formato Cerebras CS (`.mdl`) a formato Hugging Face; contenedor exacto (safetensors/bin) no especificado. Tamano del repositorio: 0,5 GB |

## Arquitectura y entrenamiento

La model card no describe la estructura interna del modelo mas alla de indicar que usa codigo de modelado Hugging Face propio de Celerity (etiqueta `custom_code` en el repositorio) y que requiere cargarse con `trust_remote_code=True`. El unico detalle arquitectonico explicitado es el tipo de embedding posicional: ALiBi, en lugar de embeddings posicionales aprendidos o RoPE. El modelo funciona con dropout de atencion desactivado en evaluacion gracias a `model.eval()`.

Los hiperparametros de entrenamiento documentados son: attention dropout de 0,2 con schedule constante; peak learning rate de 0,15; global train batch size de 11; weight decay de 0,0006356381190145931; tau_ema de 0,1745; 60 104 pasos de entrenamiento; longitud maxima de secuencia de 8192; residual dropout de 0,0; stochastic depth de 0,0 y LayerDrop de 0,0. El runtime de origen fue cbcore 2.6.0 y la conversion se realizo con el commit `0e3d5d375695293479df9d2a3717f05f71a345b4`. Este checkpoint pertenece a una ablacion de batch size en la que el learning rate y tau_ema se mantienen fijos mientras varia el batch global; el numero de pasos y el weight decay se ajustan para preservar tau_ema constante. No se especifica la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- No se documentan capacidades especificas en la model card. El repositorio no incluye ejemplos de generacion, evaluaciones cualitativas ni descripcion de tareas.
- Generacion de texto: no confirmada explicitamente. Por la naturaleza del artefacto (checkpoint convertido de un entrenamiento de lenguaje con ventana de 8192 tokens) cabe esperar capacidad de modelado autoregresivo de texto, pero no hay evidencia publicada que lo verifique.
- Razonamiento, matematicas y generacion de codigo: no disponible.
- Tool calling / function calling: no disponible; no se menciona ninguna Plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas soportados no estan declarados.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se menciona ninguna.
- Contexto largo: soporta secuencias de hasta 8192 tokens por diseno de entrenamiento, aunque no hay evaluacion publicada de calidad en contextos largos.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dada la configuracion del modelo (271M de parametros, contexto de 8192 tokens, checkpoint base). En todos los casos se requiere un ajuste fino previo y una evaluacion propia, porque no existe ninguna validacion publicada del modelo.

- Etiquetado y clasificacion de documentos largos: tras un fine-tuning supervisado con pocos miles de ejemplos etiquetados, la ventana de 8192 tokens permite procesar contratos, informes tecnicos o historiales completos en una sola pasada, sin truncado ni estrategias de chunking con agregacion posterior.
- Extraccion de informacion estructurada: ajuste fino para convertir texto no estructurado (facturas, partes de incidencias, fichas de producto) en campos concretos tipo JSON. El contexto largo evita perder la referencia de campos definidos al principio del documento.
- Resumen abstractivo de documentacion tecnica: un unico forward pass sobre documentos de aproximadamente 6000 palabras, util para resumir RFCs, manuales o actas extensas en entornos con requisitos de privacidad (despliegue local).
- Generacion asistida en dominios verticales: fine-tuning sobre corpus juridico, sanitario o de atencion al cliente para redactar borradores que un revisor humano corrige despues. El tamano reducido abarata el reentrenamiento periodico.
- Moderacion de contenido y clasificacion de toxicidad: modelos de 200-300M de parametros son habituales para clasificadores de moderacion con latencia baja; se puede ajustar sobre datasets propios y desplegar en CPU.
- Asistentes conversacionales ligeros en el borde: tras un SFT con datos de dialogo, el modelo cabe en GPUs de consumo e incluso en CPU, lo que permite prototipos on-device sin envio de datos a la nube.
- Investigacion en ablaciones de hiperparametros: reproducir o extender el estudio de batch size manteniendo learning rate y tau_ema fijos, comparando checkpoints de la misma familia para analizar el efecto del batch global en la convergencia.
- Modelo base para destilacion o experimentos academicos de bajo coste: sirve como profesor o alumno en estudios de destilacion y como punto de partida para investigaciones que requieren muchos entrenamientos cortos con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra), el repositorio no tiene descargas ni valoraciones que permitan inferir uso, y la busqueda web realizada no ha devuelto ningun enlace relacionado con el modelo ni con la familia Celerity.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (271M) y no de mediciones publicadas por el autor.

- Peso de los pesos en memoria: aproximadamente 1,08 GB en FP32, unos 542 MB en FP16/BF16 y unos 271 MB en INT8. El repositorio ocupa 0,5 GB, coherente con pesos almacenados en precision de 16 bits.
- VRAM estimada para inferencia en FP16/BF16: en torno a 1-2 GB contando pesos y overhead de runtime, dependiendo del framework y de la longitud de secuencia. La cache KV para 8192 tokens depende del numero de capas y cabezas, datos no publicados, pero en un modelo de este tamano suele mantenerse por debajo de 1 GB en FP16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en FP16. Se puede ejecutar sin problema en RTX 3060, RTX 4060, RTX 4090, A100, H100 o L4.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPUs con memoria compartida suficiente si se cuantiza a INT8 o INT4.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` es la via oficial, ya que el modelo usa codigo de modelado propio. La compatibilidad con vLLM, TGI o llama.cpp no esta confirmada y es dudosa sin un adaptador especifico para esta arquitectura; no se distribuye ninguna version GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La comparativa se limita a parametros, contexto, embeddings posicionales, licencia y disponibilidad, porque no existen datos de rendimiento publicados para Celerity 271M. Los datos de los modelos de referencia son propiedades publicas de sus respectivas model cards.

| Modelo | Parametros | Contexto | Posicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Celerity 271M 8K (ad0.2_bs11) | 271M | 8192 | ALiBi | no disponible | Hugging Face, requiere `trust_remote_code=True` |
| Cerebras-GPT-256M | 256M | 2048 | ALiBi | Apache 2.0 | Hugging Face, transformadores estandar |
| Pythia-410M | 410M | 2048 | RoPE | Apache 2.0 | Hugging Face, transformadores estandar |
| GPT-2 (124M) | 124M | 1024 | posicional aprendido | licencia MIT modificada | Hugging Face, transformadores estandar |

Celerity 271M se diferencia de estas alternativas por su ventana de contexto cuatro veces mayor que la de Cerebras-GPT-256M y Pythia-410M, a costa de requerir codigo remoto y de no declarar licencia, lo que limita su adopcion frente a opciones con licencia permisiva explicita. No es posible establecer una comparacion cuantitativa de calidad sin resultados de benchmarks.

## Limitaciones y advertencias

- Es un checkpoint de ablacion, no un modelo final optimizado. El batch global de 11 es extraordinariamente bajo y forma parte de una comparacion controlada; no hay evidencia de que este punto sea el mejor de la curva.
- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluaciones cualitativas, ni validacion por parte de la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial. Cualquier uso en produccion requiere aclarar la licencia con el autor.
- Idiomas no documentados: no se especifica el corpus de entrenamiento ni la cobertura linguistica, por lo que el comportamiento en castellano es desconocido.
- Requiere `trust_remote_code=True`: implica ejecutar codigo Python remoto del repositorio. Es un riesgo de seguridad que obliga a auditar el codigo de modelado antes de cargarlo en entornos sensibles.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, y en este caso no hay ajuste por instrucciones documentado que lo module, ni fases de RLHF o DPO declaradas.
- Sesgos: no documentados. Al desconocerse la composicion del dataset de entrenamiento, no se pueden evaluar sesgos de genero, raza, idioma o dominio.
- Calidad en contexto largo no verificada: aunque el entrenamiento llega a 8192 tokens, no hay ninguna medicion de rendimiento en la parte alta de la ventana.
- Integracion limitada: al usar codigo de modelado propio, es probable que no funcione directamente con vLLM, TGI o llama.cpp, y no se distribuye version GGUF para cuantizacion en CPU.
- Compatibilidad de la conversion: al tratarse de una conversion desde el formato Cerebras CS, conviene verificar la fidelidad numerica de los pesos antes de usarlos en experimentos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-bs-ablation-ad0p2-bs11
- Commit del conversor citado en la model card: `0e3d5d375695293479df9d2a3717f05f71a345b4` (repositorio no especificado en la model card)
- Runtime de origen: cbcore 2.6.0 (sin enlace disponible)
- La busqueda web realizada no ha devuelto ningun enlace relevante al modelo, a la familia Celerity ni a su proceso de entrenamiento. Los resultados obtenidos correspondian a herramientas de medicion de pulsaciones de teclado, sin ninguna relacion con el modelo.
