# depthfirstlabs/Nemotron-3.5-Lightning-DFS-Large-Distilled-Step-20

## Resumen

`depthfirstlabs/Nemotron-3.5-Lightning-DFS-Large-Distilled-Step-20` es un adaptador LoRA de destilacion (distillation) publicado por el laboratorio de investigacion depthfirstlabs, construido sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` de NVIDIA. El repositorio ocupa unicamente ~0,9 GB en safetensors, lo que confirma que no se trata de un modelo completo sino de pesos de adaptador, y forma parte de una serie de "steps" de destilacion (en este caso, el step 20). Se distribuye bajo la licencia openmdw-1.1 y con acceso restringido (gated) en HuggingFace.

El modelo base sobre el que se aplica es un transformer hibrido con capas Mamba y arquitectura Mixture-of-Experts (MoE), con 30.000 millones de parametros totales y 3.000 millones de parametros activos por token. NVIDIA lo posiciona como su modelo abierto mas rapido para agentes siempre activos y tareas especializadas de alto volumen, con soporte de contexto de hasta 1 millon de tokens y presupuesto para despliegue en un solo nodo.

La relevancia de esta ficha reside en que se trata de un artefacto de investigacion, no de un modelo listo para produccion: sirve para estudiar tecnicas de destilacion sobre un MoE hibrido grande. La informacion publica sobre el propio adaptador (dataset de destilacion, hiperparametros, evaluacion) es practicamente inexistente en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer hibrido Mamba-Transformer con Mixture-of-Experts (MoE) |
| Parametros totales | 30B (modelo base); el adaptador es un LoRA (repo de 0,9 GB) |
| Parametros activos | 3B por token (heredado del modelo base 30B-A3B) |
| Longitud de contexto | Hasta 1M tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base se distribuye en BF16 (y variante NVFP4 en NIM) |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un modelo hibrido que combina capas de espacio de estado (Mamba) con atencion tipo transformer y un esquema Mixture-of-Experts. La configuracion MoE activa unicamente 3.000 millones de parametros por token de un total de 30.000 millones, lo que permite un throughput elevado manteniendo la capacidad del modelo completo. El modelo base fue preentrenado con mas de 20 billones (20 trillones) de tokens, y su corpus de post-entrenamiento combina datos curados de alta calidad con datos generados sinteticamente, incluyendo una porcion pequena de question-answering y datos de alineacion.

En cuanto al adaptador en si, la informacion disponible no detalla la composicion del dataset de destilacion, el numero de tokens usados ni los hiperparametros del proceso. La nomenclatura "DFS-Large-Distilled-Step-20" sugiere una destilacion iterativa por etapas y un profesor ("Large") de mayor tamano, pero no se han publicado detalles verificables sobre el pipeline. Se desconoce igualmente si se aplico RLHF, DPO u otra tecnica de alineacion especifica sobre el adaptador.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base.
- Razonamiento (reasoning) y resolucion de problemas paso a paso, orientado a flujos agenticos.
- Generacion de codigo, segun las capacidades declaradas del modelo base.
- Soporte de tool calling / function calling estructurado (caracteristica documentada del modelo base).
- Soporte de flujos agenticos multi-paso y de agentes siempre activos.
- Capacidad de contexto largo, con ventana de hasta 1M tokens en el modelo base.
- Capacidad multilingue: limitada al ingles segun los metadatos del repositorio.
- Capacidades especiales: no disponible informacion sobre modo "thinking" explicito, vision o audio para este adaptador.

## Casos de uso

- Investigacion en destilacion de modelos: el adaptador permite estudiar como un LoRA destilado de un MoE hibrido de 30B (3B activos) reproduce el comportamiento del modelo original sin necesidad de reentrenar todos los pesos.
- Experimentos reproducibles de fine-tuning eficiente: al ser un adaptador de 0,9 GB, se puede cargar sobre el modelo base en un unico nodo y evaluar rapidamente distintas tecnicas de fusion o merging.
- Evaluacion comparativa de checkpoints intermedios: al tratarse del "step 20" de una serie, permite medir la evolucion de la calidad a lo largo del proceso de destilacion.
- Desarrollo de agentes de alto volumen (con el modelo base): el esquema 30B/3B activos esta disenado para tareas de agente siempre activas donde el coste por paso es critico.
- Asistencia de codigo en pipelines internos (con el modelo base): el soporte de tool calling y contexto largo facilita la integracion en flujos de CI/CD y revision automatizada.
- Procesamiento de documentos extensos (con el modelo base): la ventana de hasta 1M tokens permite analizar repositorios, informes o transcripciones largas sin truncado agresivo.
- Prototipado en un solo nodo: el tamano de 30B con 3B activos esta pensado para despliegue en infraestructura de un unico servidor con GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas afirmaciones de rendimiento encontradas corresponden al modelo base de NVIDIA, que declara hasta 4 veces mas throughput que su predecesor (Nemotron 3 Nano) sobre un contexto de 1M de tokens. No hay cifras verificables (MMLU, HumanEval, GSM8K, etc.) para el adaptador de destilacion.

## Requisitos de hardware

- VRAM estimada para el modelo base en BF16: aproximadamente 60 GB solo para pesos (30B parametros x 2 bytes), lo que exige GPU de 80 GB (A100, H100) o reparto en varias GPU.
- VRAM estimada en cuantizacion 4 bits: del orden de 16-20 GB para pesos, aunque el contexto largo incrementa notablemente el consumo de memoria KV.
- GPU recomendadas: A100 80GB, H100, o configuraciones multi-GPU para BF16; RTX 4090 (24 GB) resulta viable unicamente con cuantizacion agresiva y contexto reducido.
- Cabe en GPU de consumo: solo en cuantizaciones de 4 bits y con ventana de contexto limitada; no es realista para el rango completo de 1M tokens.
- Opciones de despliegue: vLLM, SGLang y NVIDIA NIM aparecen documentados para el modelo base; llama.cpp no esta confirmado para esta arquitectura hibrida Mamba-Transformer.
- Latencia y throughput: no disponible para el adaptador; el modelo base declara hasta 4x mas throughput que Nemotron 3 Nano, sin cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-DFS-Large-Distilled-Step-20 (adaptador) | LoRA sobre 30B | 3B | 1M (base) | openmdw-1.1 | HuggingFace (gated) |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B (base) | 30B | 3B | 1M | no disponible en la informacion | HuggingFace / NIM / DeepInfra |
| NVIDIA Nemotron 3 Nano (predecesor) | no disponible | no disponible | no disponible | no disponible | HuggingFace / NIM |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada, salvo la afirmacion de NVIDIA de que Nemotron 3.5 Lightning alcanza hasta 4x el throughput de Nemotron 3 Nano.

## Limitaciones y advertencias

- Se trata de un adaptador de investigacion, no de un modelo autónomo: requiere cargar el modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` para funcionar.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.
- Soporte unicamente de ingles ("en"), lo que limita su uso en castellano u otros idiomas.
- Ausencia total de datos sobre el dataset de destilacion y de evaluacion: no se puede verificar la calidad ni el grado de alineacion del adaptador.
- Riesgo de alucinacion y de degradacion respecto al modelo base: no hay benchmarks que garanticen que la destilacion preserve las capacidades originales.
- Licencia openmdw-1.1: conviene revisar sus terminos antes de cualquier uso comercial, especialmente en lo relativo a redistribucion y atribucion.
- La arquitectura hibrida Mamba-Transformer puede no estar soportada por todos los runners de inferencia, lo que complica despliegues con herramientas habituales.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/depthfirstlabs/Nemotron-3.5-Lightning-DFS-Large-Distilled-Step-20
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Cookbook de uso en GitHub (NVIDIA-NeMo): https://github.com/NVIDIA-NeMo/Nemotron/tree/main/usage-cookbook/Nemotron-3.5-Lightning
- DeepInfra (demo/API): https://deepinfra.com/nvidia/NVIDIA-Nemotron-3.5-Lightning
- Blog de DeepInfra sobre el lanzamiento: https://deepinfra.com/blog/nvidia-nemotron-3.5-lightning-release
- Guia de despliegue local: https://tech-insider.org/how-to-run-nemotron-3-5-lightning-locally-2026/
