# minjaechoi/qwen3p6-35b-a3b-2p06bit-r59

## Resumen

Qwen3.6-35B-A3B (r59) es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace, consistente en una versión cuantizada del modelo Qwen/Qwen3.6-35B-A3B. La particularidad del checkpoint es que aplica una cuantización agresiva únicamente a los expertos enrutados de la arquitectura Mixture of Experts, dejándolos en una media de 2,0586 bits, mientras que el resto de los pesos del modelo se mantiene en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, de modo que se cargan con `transformers` estándar o vLLM sin necesidad de kernels de cuantización personalizados.

El modelo declara 35.107.181.936 parámetros totales (unos 35,1 mil millones) y un repositorio de 70,2 GB, coherente con el almacenamiento en BF16 de la práctica totalidad de los pesos. Los tags del repositorio indican arquitectura `qwen3_5_moe`, pipeline de generación de texto y capacidades conversacionales y de image-text-to-text, es decir, entrada multimodal con imagen y texto.

Se trata de un checkpoint de investigación interna, con cero descargas y un único "like" en el momento de la consulta, publicado el 5 de octubre de 2026. No es un modelo entrenado desde cero ni un ajuste fino: es una transformación de pesos sobre el modelo base, por lo que su relevancia radica en el estudio de técnicas de cuantización extrema sobre expertos enrutados manteniendo el resto en alta precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer, segun el tag `qwen3_5_moe` del repositorio |
| Parametros totales | 35.107.181.936 (aproximadamente 35,1 B) |
| Parametros activos | no disponible en la informacion proporcionada; la nomenclatura `A3B` del modelo base sugiere del orden de 3 B activos, sin confirmar |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variante unica: expertos enrutados a 2,0586 bits de media; el resto de pesos en BF16, almacenados ya dequantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de HuggingFace; la model card indica que la licencia sigue la del modelo base |
| Formato de pesos | safetensors (BF16 dequantizado) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 70,2 GB |
| Libreria de carga | transformers (compatible tambien con vLLM segun la model card) |
| Pipeline declarado | text-generation |
| Fecha de publicacion | 5 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es de tipo Mixture of Experts, segun el tag `qwen3_5_moe` declarado en el repositorio. Con 35.107.181.936 parametros totales, el modelo sigue la convencion de nomenclatura "35B-A3B" del modelo base, que distingue entre parametros totales y parametros activos por token. No se dispone de informacion detallada sobre el numero de expertos, la granularidad de enrutamiento, el mecanismo de atencion ni la dimension oculta.

El checkpoint no documenta proceso de entrenamiento alguno: se describe explicitamente como "checkpoint de investigacion interna" derivado del modelo base Qwen/Qwen3.6-35B-A3B. La intervencion realizada consiste en cuantizar exclusivamente los expertos enrutados hasta una media de 2,0586 bits, manteniendo el resto de los pesos en BF16. No se detalla el metodo de cuantizacion empleado (por ejemplo, tipo escalar, vectorial o con correccion de errores), ni el numero de tokens de calibracion, ni si se aplicaron tecnicas de recuperacion de precision. Tampoco se especifica si hubo entrenamiento posterior, RLHF o DPO. El identificador interno del checkpoint es r59.

Un detalle tecnico destacable es la decision de almacenar los pesos ya dequantizados en BF16 en lugar de conservar los formatos comprimidos. Esto implica que el repositorio ocupa practicamente lo mismo que el modelo base en BF16 (70,2 GB) y que el beneficio de la cuantizacion no es la reduccion de huella en disco o en VRAM, sino el estudio del impacto de la precision reducida en los expertos sobre la calidad de salida, con una ruta de carga estandar.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline `text-generation`.
- Entrada multimodal de imagen y texto, segun el tag `image-text-to-text`.
- Razonamiento y generacion de codigo o matematicas: no confirmado en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.
- Carga directa con `transformers` y con vLLM mediante pesos safetensors en BF16, sin kernels de cuantizacion adicionales.

## Casos de uso

- Investigacion en cuantizacion de MoE: el checkpoint permite medir el deterioro de calidad al comprimir exclusivamente los expertos enrutados a 2,0586 bits, comparando las salidas contra el modelo base en BF16 con la misma infraestructura de carga.
- Evaluacion comparativa de checkpoints cuantizados: al mantener el resto de pesos en BF16 y almacenar todo dequantizado, aísla el efecto de la precision de los expertos del efecto de otros componentes, lo que facilita experimentos controlados.
- Pruebas de integracion en pipelines `transformers`: sirve para validar que el flujo de carga, tokenizacion y generacion funciona con pesos dequantizados sin modificar el codigo de inferencia.
- Validacion de compatibilidad con vLLM: la model card afirma compatibilidad con vLLM, por lo que puede emplearse para verificar el comportamiento del motor de serving ante modelos MoE con expertos de baja precision almacenados en BF16.
- Analisis de robustez conversacional: con el tag `conversational`, permite estudiar si la cuantizacion de expertos degrada mas unas tareas que otras en dialogos multi-turno (por ejemplo, coherencia frente a recuperacion de hechos).
- Experimentos con entrada de imagen y texto: el tag `image-text-to-text` habilita probar tareas de descripcion o razonamiento sobre imagenes, siempre que el modelo base las soporte efectivamente.
- Reproducibilidad de resultados de investigacion: al estar publicado con pesos safetensors e identificador interno r59, permite a otros grupos reproducir mediciones sobre la misma version exacta de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la ficha de HuggingFace ni la model card del autor incluyen metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. Tampoco se proporcionan comparaciones cuantitativas frente al modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 70,2 GB y los pesos se almacenan en BF16 sin comprimir, por lo que se necesitan aproximadamente 70 GB solo para los pesos. A ello hay que sumar la cache KV y las activaciones, cuyo tamano depende de la longitud de contexto y del batch, datos no disponibles.
- GPU recomendadas (estimacion a partir del tamano de los pesos): una GPU de 80 GB (A100 80 GB, H100 80 GB) queda muy ajustada y probablemente exija contextos cortos y batch pequeno; configuraciones de 2 x 80 GB ofrecen margen suficiente.
- GPU de consumo: no cabe en una unica GPU de consumo. En 4 x RTX 4090 de 24 GB (96 GB agregados) seria tecnicamente posible mediante sharding, con la penalizacion de ancho de banda entre GPUs.
- Opciones de despliegue: la model card indica carga con `transformers` estandar y con vLLM. No se mencionan llama.cpp, Ollama, TGI ni otros motores; dado que los pesos estan en BF16, los formatos GGUF no son aplicables a este checkpoint tal como esta publicado.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p06bit-r59 | 35,1 B totales; activos no disponibles | no disponible | sin benchmarks publicados | no disponible (heredada del base, segun la model card) | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,1 B totales, segun la ficha del derivado | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace, referenciado como base |
| Otros modelos comparables de ~35 B tipo MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion posible con los datos disponibles es frente al modelo base, del que este checkpoint deriva. No se dispone de informacion sobre alternativas de terceros con las que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Los expertos enrutados estan cuantizados a una media de 2,0586 bits, una precision muy baja que puede degradar la calidad de las respuestas. El autor no publica ninguna evaluacion del impacto sobre el rendimiento.
- Los pesos se almacenan ya dequantizados en BF16, por lo que no hay ahorro de VRAM ni de disco respecto al modelo base: el repositorio ocupa 70,2 GB.
- La licencia no esta declarada en la ficha de HuggingFace. La model card afirma que sigue la licencia del modelo base, pero no se especifica cual es. Antes de cualquier uso comercial debe verificarse la licencia de Qwen/Qwen3.6-35B-A3B.
- Es un checkpoint de investigacion interna, con 0 descargas en el momento de la consulta. No hay garantia de mantenimiento, versionado ni soporte.
- No se publican datos sobre idiomas soportados, longitud de contexto, numero de expertos ni composicion del entrenamiento, lo que dificulta planificar su comportamiento en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. La cuantizacion agresiva de expertos puede incrementarlo, pero no hay evidencia publicada al respecto.
- Sesgos conocidos: no documentados.
- No se proporcionan resultados de benchmarks, por lo que no es posible afirmar su equivalencia funcional con el modelo base.
- Al ser un derivado no oficial, no cuenta con el respaldo del equipo responsable del modelo base.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p06bit-r59
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
