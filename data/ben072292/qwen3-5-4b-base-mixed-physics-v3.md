# ben072292/Qwen3.5-4B-Base-mixed-physics-v3

## Resumen

`ben072292/Qwen3.5-4B-Base-mixed-physics-v3` es un ajuste fino completo (full fine-tuning, no LoRA) del modelo base `Qwen/Qwen3.5-4B-Base`, publicado por el usuario ben072292 en HuggingFace. El checkpoint tiene 4.539.265.536 parámetros (~4,54 mil millones) en formato safetensors, un repositorio de 9,1 GB y licencia declarada como "other". El entrenamiento se ha realizado con LLaMA-Factory sobre el dataset `mixed_physics_prefix_2048`, con prefijos de 2048 tokens, lo que apunta a un corpus con contenido de física mezclado.

El identificador interno del checkpoint (`dpo-full-published-prefix2048-lr5e7-ga16-wd0-beta01-cosine-warmup10-delta-gh200-1ep`) sugiere un entrenamiento con optimización DPO (beta 0,1) sobre un ajuste previo de tipo supervisado, aunque la model card no confirma la metodología: los hiperparámetros publicados (AdamW fused, learning rate 5e-07, scheduler cosine, 1 época, batch total 16) corresponden a un bucle de entrenamiento estándar y no detallan la composición exacta de las etapas.

La relevancia práctica del modelo es hoy muy limitada: acumula 0 descargas y 0 likes, la model card está autogenerada con secciones marcadas como "More information needed" y no declara ningún resultado de benchmarks (el `model-index` tiene el array `results` vacío). Además, la pipeline declarada es `image-text-to-text`, lo que implica capacidades multimodales heredadas del modelo base que el autor no documenta ni evalúa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el tag `qwen3_5` lo vincula a la familia Qwen3.5 (modelo base `Qwen/Qwen3.5-4B-Base`) |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos safetensors (sin GGUF, GPTQ ni AWQ publicados) |
| Idiomas soportados | No disponible |
| Licencia | "other" (licencia personalizada no especificada en la informacion disponible) |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline declarada | image-text-to-text |
| Tamano del repositorio | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B-Base |
| Metodo de ajuste | full fine-tuning con LLaMA-Factory (`full`, `generated_from_trainer`) |
| Version de transformers | 5.6.0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos especificos en la informacion proporcionada. El tag `qwen3_5` y el campo `base_model` sitúan el modelo en la familia Qwen3.5, y la pipeline `image-text-to-text` indica que se trata de un modelo multimodal capaz de procesar imagen y texto, capacidad heredada del modelo base `Qwen/Qwen3.5-4B-Base`. El autor no documenta ni la arquitectura concreta (atención, capas, tipo de tokenizador) ni la estrategia de multimodalidad.

En cuanto al entrenamiento, la model card indica un ajuste completo sobre el dataset `mixed_physics_prefix_2048`, con los siguientes hiperparámetros: learning rate 5e-07, scheduler cosine, warmup del 10 % de los pasos, 1,0 época, `train_batch_size` 1 con `gradient_accumulation_steps` 16 (batch total efectivo 16), `eval_batch_size` 8, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y entrenamiento multi-GPU (el nombre del checkpoint menciona hardware GH200). El framework empleado fue Transformers 5.6.0, PyTorch 2.11.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. No se especifica el número de tokens de entrenamiento, la composición del dataset más allá del nombre, ni si hubo etapas de RLHF, DPO efectivo o evaluación intermedia. La sección "Training results" de la model card está vacía.

## Capacidades

- Generacion de texto: el modelo es un modelo de lenguaje de 4,54 mil millones de parametros, por lo que puede generar texto autoregresivamente; el autor lo etiqueta como `conversational`.
- Procesamiento de imagen y texto: la pipeline declarada es `image-text-to-text`, lo que implica entrada multimodal (imagen + texto), aunque no hay ejemplos ni evaluaciones publicadas que lo confirmen en este checkpoint concreto.
- Especializacion tematica: el ajuste sobre `mixed_physics_prefix_2048` apunta a un dominio de fisica, sin que el autor describa tareas concretas (resolución de problemas, explicación conceptual, calculo simbolico, etc.).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio).
- Modo "thinking" o razonamiento extendido: no disponible (no documentado).
- Capacidades de audio o video: no disponible (no documentado).

## Casos de uso

- Ajuste posterior especializado en fisica: el checkpoint puede servir como punto de partida (o como referencia de configuracion de hiperparámetros) para nuevos ajustes sobre corpus cientificos, dado que ya incorpora una epoca completa de entrenamiento sobre datos de fisica.
- Generacion de material didactico de fisica: con los 2048 tokens de prefijo usados en el entrenamiento, el modelo esta preparado para tareas de continuacion y generacion de texto con contexto medio; podria emplearse para redactar enunciados, explicaciones o resúmenes de conceptos fisicos, sujeto a revision humana.
- Prototipado de pipelines multimodales: al declarar la pipeline `image-text-to-text`, es util para experimentar con entrada de imagen y texto en entornos de investigacion, verificando primero la calidad real de las salidas.
- Reproduccion de experimentos de DPO: el nombre del checkpoint documenta una configuracion concreta (prefijo 2048, lr 5e-7, beta 0,1, cosine, warmup 10 %, hardware GH200), lo que permite replicar o comparar recetas de ajuste con LLaMA-Factory.
- Evaluacion academica de ajustes de dominio: util como caso de estudio para medir cómo un full fine-tuning de bajo learning rate y una sola época afecta al conocimiento general frente al especializado.
- Analisis de catalogos de modelos pequeños: con 4,54 mil millones de parametros y 9,1 GB en safetensors, sirve para probar flujos de descarga, conversion y despliegue de modelos de este tamaño en infraestructura propia.
- Filtrado y clasificacion de texto cientifico: mediante ajuste adicional o prompting, puede emplearse como base para clasificar o resumir fragmentos de documentacion tecnica, siempre con validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card contiene una entrada (`dpo-full-published-prefix2048-lr5e7-ga16-wd0-beta01-cosine-warmup10-delta-gh200-1ep`) con el array `results` completamente vacío, y la seccion "Training results" no incluye metricas (ni loss, ni evaluaciones de MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4,54 mil millones de parametros; no confirmada por el autor):
  - FP32: ~18,2 GB solo de pesos.
  - BF16/FP16: ~9,1 GB solo de pesos (coincide con el tamaño del repositorio).
  - INT8: ~4,5-5 GB solo de pesos.
  - INT4 (GPTQ/AWQ/GGUF Q4): ~2,7-3,5 GB solo de pesos.
- A estas cifras hay que sumar el coste de la cache KV y de las activaciones, que depende de la longitud de contexto (no publicada) y del tamaño de lote.
- GPU recomendadas: A100 40/80 GB, H100 o GH200 para entrenamiento o inferencia en precision completa con lotes grandes; para inferencia bf16 es suficiente una GPU de 16-24 GB (RTX 4090, RTX 3090, A10G, L4).
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en bf16 con margen razonable; en RTX 3060 12 GB o RTX 4070 solo con cuantizacion INT8/INT4.
- Opciones de despliegue: transformers (soporte nativo, es la libreria declarada), vLLM o TGI para servicio en bf16, y llama.cpp/Ollama únicamente si se genera previamente una conversion a GGUF, que no esta publicada en el repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo, TTFT ni consumo energetico.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de su documentacion publica y se incluyen solo como referencia de categoria; no existe ninguna comparacion de rendimiento publicada con este checkpoint. No se dispone de datos de benchmarks del modelo evaluado.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Rendimiento comparado |
|---|---|---|---|---|---|
| ben072292/Qwen3.5-4B-Base-mixed-physics-v3 | 4,54 B | No disponible | other | safetensors | No disponible |
| Qwen/Qwen3-4B-Base (referencia publica) | 4,02 B | 32.768 tokens nativos (ampliable con YaRN) | Apache-2.0 | safetensors | No comparado |
| meta-llama/Llama-3.2-3B (referencia publica) | 3,21 B | 131.072 tokens | Licencia comunitaria de Llama 3.2 | safetensors | No comparado |
| microsoft/Phi-3.5-mini-instruct (referencia publica) | 3,82 B | 131.072 tokens | MIT | safetensors | No comparado |

Nota: la comparativa se limita a parametros, contexto declarado y licencia. No se dispone de resultados homogeneos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para el modelo objeto de la ficha.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de entrenamiento, ni validacion publicada. No es posible afirmar que el ajuste haya mejorado o degradado las capacidades del modelo base.
- Model card incompleta: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" estan marcadas como "More information needed", por lo que se desconoce el proposito previsto por el autor.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de este tamaño, puede generar contenido fisico incorrecto o inventar referencias; en dominios cientificos el riesgo es especialmente relevante si se usa sin verificacion.
- Datos de entrenamiento opacos: solo se conoce el nombre del dataset (`mixed_physics_prefix_2048`). Se desconoce su procedencia, licencia, idioma, volumen en tokens y posible presencia de sesgos o material con derechos de autor.
- Sesgos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o equidad.
- Limitaciones de idioma: el campo de idiomas esta vacio; no se puede garantizar un rendimiento adecuado en castellano ni en ningun otro idioma concreto.
- Contexto desconocido: la longitud maxima de contexto no esta publicada, lo que impide dimensionar correctamente el despliegue y la cache KV.
- Licencia restrictiva o ambigua: la licencia figura como "other" sin texto asociado en la informacion disponible. Antes de cualquier uso comercial es imprescindible revisar los terminos del repositorio y la licencia del modelo base `Qwen/Qwen3.5-4B-Base`.
- Adopcion nula: 0 descargas y 0 likes implican que el modelo no ha sido validado por terceros y carece de soporte comunitario.
- Ambiguedad funcional: la pipeline `image-text-to-text` sugiere multimodalidad, pero el dataset de ajuste es textual y de dominio fisico; no hay evidencia de que el checkpoint conserve un rendimiento visual solido tras el ajuste completo.
- Diferencias de libreria: entrenado con Transformers 5.6.0 y PyTorch 2.11.0+cu128, versiones muy recientes; pueden aparecer incompatibilidades al cargarlo con versiones anteriores del ecosistema.
- Sin cuantizaciones publicadas: no existen GGUF, GPTQ ni AWQ listos para usar, lo que obliga a generarlos y validarlos antes de desplegar en hardware limitado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ben072292/Qwen3.5-4B-Base-mixed-physics-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- LLaMA-Factory (framework de ajuste empleado): https://github.com/hiyouga/LLaMA-Factory
- Libreria transformers: https://github.com/huggingface/transformers
- Busqueda web: los resultados devueltos corresponden a paginas de una empresa polaca (PUER, Podleze) sin relacion alguna con el modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
