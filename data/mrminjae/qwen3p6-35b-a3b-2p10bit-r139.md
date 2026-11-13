# mrminjae/qwen3p6-35b-a3b-2p10bit-r139

## Resumen
Qwen3.6-35B-A3B (r139) es una cuantizacion selectiva del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario mrminjae en Hugging Face. Se trata de un checkpoint de investigacion interna en el que unicamente los expertos enrutados del bloque MoE se almacenan con una precision media de 2,10 bits, mientras que el resto de pesos (atencion, embeddings, router, capas densas) permanecen en BF16. Los pesos se guardan ya descomprimidos en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estandar sin necesidad de kernels de cuantizacion especiales.

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con mezcla de expertos (MoE) de 35.107.181.936 parametros totales, de los cuales solo una fraccion se activa por token. El repositorio ocupa 70,2 GB, coherente con almacenar todos los pesos en BF16 tras la descompresion. La relevancia de esta publicacion es metodologica: demuestra que es posible comprimir agresivamente los expertos de un MoE de gran tamano manteniendo el resto en alta precision, lo que reduce el coste de memoria en inferencia sin requerir un runtime especializado.

No obstante, se trata de un artefacto de investigacion sin model card detallada: no se especifican licencia, idiomas, datos de entrenamiento, resultados de evaluacion ni el metodo exacto de cuantizacion empleado. Cualquier uso en produccion debe considerar estas carencias y validar el comportamiento del checkpoint frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), clase `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados descomprimidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la del modelo base, Qwen/Qwen3.6-35B-A3B, sin especificarla) |
| Formato de pesos | safetensors (BF16), compatible con `transformers` y vLLM estandar |
| Tamano del repositorio | 70,2 GB |
| Pipeline | text-generation (etiquetado tambien como image-text-to-text) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento
La arquitectura subyacente es un transformer con mezcla de expertos identificado en Hugging Face con la clase `qwen3_5_moe`. El checkpoint cuenta con 35.107.181.936 parametros totales, aunque al ser un MoE solo un subconjunto de los expertos se activa por token; el numero exacto de parametros activos no se detalla en la informacion disponible. El pipeline declarado es `text-generation`, y las etiquetas incluyen `image-text-to-text`, lo que sugiere capacidades multimodales en el modelo base, si bien no se aportan detalles al respecto.

El proceso de creacion de este checkpoint consiste en una cuantizacion selectiva: los expertos enrutados se comprimen a una media de 2,10 bits (identificador interno r139), mientras que el resto de los pesos se mantiene en BF16. Los pesos se almacenan ya descomprimidos en tensores BF16, de forma que la carga no requiere kernels de cuantizacion especificos. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni sobre innovaciones tecnicas adicionales del modelo base.

## Capacidades
- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`).
- Posible procesamiento de imagen y texto combinados, segun la etiqueta `image-text-to-text` del repositorio; no se detalla el alcance real de esta capacidad.
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible, aunque plausible por herencia del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.

## Casos de uso
- Investigacion sobre cuantizacion de MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits manteniendo el resto en BF16, comparando la perplejidad y la calidad de generacion frente al modelo base Qwen/Qwen3.6-35B-A3B en tareas controladas.
- Despliegue en entornos con memoria limitada: al almacenar los expertos a baja precision, el checkpoint reduce el espacio ocupado por los pesos de los expertos, lo que puede facilitar su carga en GPUs con menos VRAM que las necesarias para el modelo base completo en BF16.
- Evaluacion de compatibilidad con runtimes estandar: al cargar con `transformers` y vLLM sin kernels especiales, sirve para validar pipelines de inferencia existentes antes de adoptar tecnicas de cuantizacion mas agresivas.
- Generacion de texto en prototipos internos: su condicion de checkpoint de investigacion lo hace adecuado para pruebas de concepto de generacion conversacional, siempre que se valide la calidad frente al modelo base.
- Experimentos de destilacion o fine-tuning sobre expertos comprimidos: los pesos BF16 descomprimidos permiten aplicar tecnicas de ajuste fino sin necesidad de herramientas de cuantizacion adicionales.
- Analisis de robustez y alucinacion bajo cuantizacion extrema: util para medir como afecta la compresion de expertos a la fidelidad factual y a la coherencia en contextos largos, un aspecto critico antes de plantear un uso en produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 70,2 GB en safetensors BF16, por lo que la carga completa de los pesos requiere al menos unos 70 GB de memoria, mas el espacio adicional para el KV cache y activaciones. No se dispone de estimaciones oficiales para cuantizaciones adicionales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del checkpoint, serian necesarias GPUs de clase数据中心 (A100 80 GB, H100 80 GB) o configuraciones multi-GPU; no se confirma compatibilidad con GPUs de consumo.
- Cabe en GPU de consumo: no confirmado; el tamano de 70,2 GB supera la VRAM de las RTX 4090 (24 GB) y RTX 5090 (32 GB) en una sola unidad.
- Opciones de despliegue: `transformers` y vLLM estandar, segun la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r139 | 35.107.181.936 | no disponible | no disponible | safetensors BF16 (expertos a 2,10 bits) | Checkpoint de investigacion cuantizado |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 | no disponible | no disponible en esta ficha | safetensors BF16 | Modelo original sin cuantizar |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias
- Checkpoint de investigacion interna sin model card detallada: no se documentan datos de entrenamiento, evaluacion ni metodo exacto de cuantizacion.
- Licencia no especificada: la model card remite a la licencia del modelo base sin indicarla, por lo que no se puede confirmar el uso comercial.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Riesgo de degradacion por cuantizacion extrema: los expertos a 2,10 bits de media pueden introducir perdida de calidad, sesgos o alucinaciones adicionales frente al modelo base; no se aportan metricas que lo cuantifiquen.
- Sin soporte confirmado de tool calling, agentes o modo de razonamiento: no se documentan estas capacidades.
- Tamano elevado: 70,2 GB de pesos en BF16 limitan el despliegue a entornos con GPUs de gran memoria o configuraciones multi-GPU.
- Ausencia de benchmarks: no es posible comparar su rendimiento con alternativas sin realizar evaluaciones propias.
- Fecha de creacion futura (2026-11-13) y cero descargas: repositorio sin validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r139
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
