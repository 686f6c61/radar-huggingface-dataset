# nvidia/Qwen3.8-2.4T-A95B-NVFP4

## Resumen

El modelo **nvidia/Qwen3.8-2.4T-A95B-NVFP4** es la versión cuantizada en precisión NVFP4 (4 bits) del modelo **Qwen3.8-2.4T-A95B** de Alibaba, el mayor modelo de pesos abiertos de la familia Qwen. NVIDIA ha aplicado su herramienta Model Optimizer para reducir el tamaño de los pesos y activaciones de 16 a 4 bits, manteniendo la arquitectura original: un transformer de mezcla de expertos (MoE) con atención híbrida (full attention + atención lineal GatedDeltaNet), 92 capas, 512 expertos enrutados con 10 activos por token más un experto compartido, y una ventana de contexto de hasta 1 millón de tokens. El modelo está diseñado para ejecutarse en hardware NVIDIA Blackwell (GB200, B300) mediante vLLM o SGLang, y está listo para uso comercial o no comercial bajo la licencia NVIDIA Open Model Agreement.

La cuantización NVFP4 reduce significativamente los requisitos de memoria en comparación con el modelo original en BF16, lo que permite servir un modelo de 2,4 billones de parámetros (95 mil millones activos) en sistemas multi-GPU como el GB300 NVL72. Aunque no se publican resultados numéricos de benchmarks en la información disponible, el modelo base ha sido evaluado en tareas de razonamiento, código, seguimiento de instrucciones, recuperación de contexto largo y uso de herramientas. Esta versión cuantizada es relevante para organizaciones que necesitan desplegar un modelo de frontera con costes de inferencia reducidos, manteniendo la calidad del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (full attention + GatedDeltaNet linear attention) |
| Parametros totales | 2,4 billones (según el autor; el archivo safetensors registra 1.260.771.751.808 parámetros) |
| Parametros activos | 95 mil millones (10 expertos activos + 1 compartido de 512) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits) para pesos y activaciones de operadores lineales |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica en esta ficha) |
| Licencia | NVIDIA Open Model Agreement (nvidia-open-model-license) |
| Formato de pesos | safetensors (cuantizados NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura de mezcla de expertos con 92 capas, donde cada capa combina atención completa (full attention) con atención lineal GatedDeltaNet, lo que permite manejar contextos de hasta 1 millón de tokens con un coste computacional subcuadrático. La capa MoE contiene 512 expertos enrutados, de los cuales se activan 10 por token, más un experto compartido, sumando 95 mil millones de parámetros activos. El modelo incluye soporte opcional de predicción multi-token (MTP) y está diseñado para tareas de razonamiento configurable, similar a otros modelos de la serie Qwen3.

La versión NVFP4 de NVIDIA se obtiene mediante cuantización post-entrenamiento (PTQ) con Model Optimizer v0.46.0. Se cuantizan únicamente los pesos y activaciones de los operadores lineales dentro de los bloques del transformer, reduciendo el número de bits por parámetro de 16 a 4. El proceso de calibración utiliza el dataset **Nemotron-Post-Training-Dataset-v2** de NVIDIA, que contiene conversaciones multi-turno de diversos dominios. No se ha realizado fine-tuning adicional; la cuantización es puramente una optimización de inferencia.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de investigación, trabajo profesional y codificación.
- Soporte de tool calling y function calling, permitiendo integración con APIs y herramientas externas.
- Capacidad para tareas agénticas de largo horizonte, con razonamiento multi-paso y planificación.
- Manejo de contextos de hasta 1 millón de tokens, adecuado para documentos extensos, análisis de código y conversaciones largas.
- Soporte de modo de razonamiento configurable (thinking mode), similar a otros modelos Qwen3.
- Multilingüe (según el modelo base, aunque no se detalla en esta ficha).
- Generación de código y salidas estructuradas (JSON, etc.) según configuración de despliegue.

## Casos de uso

- **Asistente de programación a gran escala**: el modelo puede generar, revisar y depurar código en repositorios extensos gracias a su contexto de 1M tokens y su capacidad de tool calling. Se integraría en entornos de desarrollo como un agente que consulta APIs, ejecuta tests y sugiere correcciones.
- **Análisis de documentos legales o científicos**: con 1M tokens de contexto, puede procesar contratos completos, artículos de investigación o informes técnicos, extrayendo información relevante y respondiendo preguntas sobre el contenido.
- **Atención al cliente automatizada**: soporta conversaciones multi-turno con contexto largo y puede usar herramientas externas (CRM, bases de conocimiento) para resolver incidencias complejas, manteniendo el historial completo de la interacción.
- **Agentes autónomos de investigación**: el modelo puede planificar y ejecutar tareas de búsqueda, recopilación y síntesis de información en múltiples pasos, utilizando navegación web o APIs, gracias a su razonamiento agéntico y tool calling.
- **Generación de informes y documentación técnica**: a partir de especificaciones o datos de entrada, el modelo redacta informes detallados, manuales o documentación de API, con formato estructurado y coherente.
- **Traducción y localización**: aunque los idiomas no están especificados, el modelo base Qwen3.8 es multilingüe, por lo que puede traducir textos largos manteniendo el contexto y el estilo, útil para empresas globales.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en los siguientes datasets, pero no proporciona cifras concretas:

- GPQA Diamond (razonamiento científico de nivel graduate)
- SciCode (codificación científica)
- IFBench (seguimiento de instrucciones)
- AA-LCR (recuperación de contexto largo)
- Terminal Bench 2.1 (uso de herramientas y cumplimiento de políticas en escenarios de atención al cliente)

Se recomienda consultar la model card del modelo base Qwen/Qwen3.8-2.4T-A95B para obtener resultados de rendimiento del modelo original, ya que la cuantización NVFP4 puede introducir una degradación mínima no cuantificada en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 1444,6 GB (1,44 TB) en formato NVFP4. Para inferencia se necesita al menos esa cantidad de memoria GPU, más overhead de activaciones y KV cache. En la práctica, se requiere un sistema multi-GPU con al menos 1,5-2 TB de VRAM agregada.
- **GPUs recomendadas**: NVIDIA Blackwell, específicamente GB200 NVL72 o B300 (72 GPUs en configuración NVL72). No es compatible con GPUs de generaciones anteriores (Ampere, Hopper) según la model card.
- **GPU de consumo**: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) debido al tamaño del modelo.
- **Opciones de despliegue**: vLLM y SGLang son los motores de inferencia soportados. También se puede usar el stack de NVIDIA NeMo.
- **Latencia y throughput**: no se proporcionan datos específicos. Se espera que en un GB300 NVL72 el modelo pueda servir peticiones con baja latencia gracias a la cuantización FP4 y la optimización de Model Optimizer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Precisión | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B (base) | 2,4T | 95B | 1M | BF16 | Apache 2.0 (Qwen) |
| nvidia/Qwen3.8-2.4T-A95B-NVFP4 | 2,4T | 95B | 1M | NVFP4 (4-bit) | NVIDIA Open Model Agreement |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | BF16/FP8 | MIT (parcial) |

La comparativa se limita a los datos disponibles. El modelo cuantizado mantiene la misma arquitectura y capacidades que el base, pero con un tamaño de pesos 4 veces menor. No se dispone de comparaciones de rendimiento con otros modelos MoE grandes en esta información.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo modelo de lenguaje grande, puede generar contenido falso o sesgado. No se han publicado evaluaciones específicas de sesgo para esta versión cuantizada.
- **Riesgo de alucinación**: especialmente en tareas de razonamiento largo o con contextos muy extensos, puede producir respuestas plausibles pero incorrectas. Se recomienda verificación humana en aplicaciones críticas.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; aunque el modelo base es multilingüe, la cobertura exacta no está documentada.
- **Restricciones de licencia**: la licencia NVIDIA Open Model Agreement permite uso comercial, pero es una licencia propia de NVIDIA, no la Apache 2.0 del modelo base. Se debe revisar el acuerdo completo para cumplir con sus términos.
- **Requisitos de hardware**: solo es ejecutable en GPUs NVIDIA Blackwell (GB200, B300). No es compatible con hardware de generaciones anteriores, lo que limita su despliegue a infraestructura muy específica.
- **Dependencia de NVIDIA**: al ser una cuantización propietaria (NVFP4), el modelo solo puede ejecutarse con el stack de software de NVIDIA (vLLM, SGLang, Model Optimizer). No hay soporte para otras librerías como llama.cpp o TensorRT-LLM (aunque TensorRT-LLM podría soportarlo, no se menciona).
- **Tamaño del repositorio**: 1,44 TB, lo que requiere un ancho de banda considerable para descargar y almacenar el modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nvidia/Qwen3.8-2.4T-A95B-NVFP4)
- [Modelo base Qwen3.8-2.4T-A95B](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer)
- [Blog de NVIDIA: Serve Qwen3.8-2.4T-A95B](https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/)
- [Dataset de calibración Nemotron-Post-Training-Dataset-v2](https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2)
- [Documentación de NeMo AutoModel para Qwen3.8](https://docs.nvidia.com/nemo/automodel/model-coverage/large-language-models/qwen/qwen3-8-2-4t-a95b)
