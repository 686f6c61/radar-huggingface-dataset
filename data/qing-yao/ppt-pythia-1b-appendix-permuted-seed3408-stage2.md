# qing-yao/ppt-pythia-1b-appendix-permuted-seed3408-stage2

## Resumen

El modelo `ppt-pythia-1b-appendix-permuted-seed3408-stage2` es un ajuste fino de tipo SFT (supervised fine-tuning) publicado por el usuario qing-yao en HuggingFace. Se trata de un checkpoint de investigación derivado de la familia Pythia: los tags del repositorio declaran arquitectura `gpt_neox` y el recuento real de parámetros en safetensors es de 1.011.781.632, prácticamente idéntico a Pythia-1B de EleutherAI. El nombre del repositorio sugiere un experimento controlado sobre permutación de datos de tipo "appendix" en una segunda etapa de entrenamiento, con semilla 3408, aunque esta interpretación no está confirmada por ninguna documentación publicada.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio tiene cero descargas y cero "likes", no incluye información sobre el modelo base (la model card indica literalmente un enlace a `None`), no declara licencia concreta, no especifica idiomas soportados ni datos de entrenamiento, y no publica ningún resultado de evaluación. Es, por tanto, un artefacto de experimento reproducible más que un modelo listo para producción.

Aun así, resulta útil documentarlo porque el ecosistema Pythia-1B es bien conocido y el modelo es ejecutable con Transformers y TRL 0.23.0, lo que permite a un investigador reproducir o inspeccionar el ajuste. Quien necesite un modelo de 1B para uso real debería considerar los checkpoints oficiales de Pythia o alternativas con licencia y evaluación públicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-NeoX (`gpt_neox` segun tags del repo) |
| Parametros totales | 1.011.781.632 (aprox. 1,01 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada en la model card ni en los metadatos) |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas. El tamano del repo (2,0 GB) es consistente con pesos en fp16/bf16 |
| Idiomas soportados | no disponible (no declarados; el modelo base Pythia se entrena mayoritariamente en ingles, pero no se confirma aqui) |
| Licencia | no disponible (la model card incluye una clave `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en los tags es `gpt_neox`, es decir, un transformer decoder-only con normalización por capas en paralelo y atención causal, la misma familia empleada por Pythia (EleutherAI). No se especifican la dimensión oculta, el número de capas, el número de cabezas de atención, el tamaño de vocabulario ni la posición de los embeddings, por lo que no se puede reconstruir la configuración exacta a partir de la información disponible. El recuento de parámetros coincide con el de Pythia-1B, lo que sugiere que el ajuste parte de ese checkpoint, pero el autor no lo enlaza (la model card apunta a `None`).

El entrenamiento se realizó con SFT mediante TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.8.0+cu128, Datasets 4.2.0 y Tokenizers 0.22.1. No se indican el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, el régimen de precisión, la tasa de aprendizaje ni si hubo etapas posteriores de RLHF o DPO. El sufijo `stage2` del nombre sugiere una segunda fase de un pipeline experimental y `appendix-permuted` sugiere permutación de documentos anexos, pero se trata de una inferencia a partir del nombre, no de un dato documentado.

## Capacidades

- Generación de texto autoregresiva: es la única tarea declarada explícitamente en el pipeline (`text-generation`).
- Ajuste por instrucciones (SFT): el modelo fue entrenado con TRL para seguir el formato conversacional de `pipeline` con mensajes de rol `user`, según el ejemplo de la model card.
- Soporte de tool calling / function calling: no disponible; no hay evidencia de entrenamiento con plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún modo de razonamiento extendido.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponible; el repositorio solo contiene pesos de lenguaje.
- Compatibilidad de despliegue: los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que indica que el checkpoint sigue el formato esperado por TGI y por los endpoints de HuggingFace.

## Casos de uso

- Reproducción de experimentos académicos: el modelo sirve como checkpoint intermedio para estudiar el efecto de la permutación de datos anexos en el ajuste supervisado, comparando `stage1` frente a `stage2` bajo la misma semilla (3408) y midiendo la degradación o mejora en tareas de recuperación de contexto.
- Análisis de linaje de checkpoints: un investigador puede cargar los pesos con Transformers, inspeccionar las claves del state dict y compararlas con Pythia-1B para verificar qué capas se han modificado durante el SFT.
- Pruebas de pipelines de entrenamiento con TRL: al declarar las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, el repositorio funciona como referencia de compatibilidad para validar un stack de entrenamiento concreto.
- Generación de texto de bajo coste en local: con 1,01 mil millones de parámetros y pesos de unos 2 GB, puede ejecutarse en una GPU de consumo para tareas de generación creativa o completado de texto no críticas.
- Evaluación de robustez ante entradas conversacionales: útil para medir cómo responde un modelo pequeño ajustado con SFT a preguntas abiertas del tipo "si tuvieras una máquina del tiempo...", la única entrada de ejemplo documentada.
- Docencia y prácticas de ajuste fino: su tamaño permite reproducir el ciclo completo de entrenamiento y evaluación en una sola GPU, sin necesidad de infraestructura distribuida.
- Despliegue en endpoints compatibles: los tags `text-generation-inference` y `endpoints_compatible` permiten levantar el modelo en TGI o en Inference Endpoints para pruebas de integración, siempre que se asuma la falta de licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla alguna de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de evaluaciones de la familia Pythia, y la búsqueda web asociada no devolvió ninguna referencia técnica al modelo (los resultados obtenidos eran problemas aritméticos sobre divisibilidad, sin relación con el repositorio).

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 2,0 GB de pesos, más caché KV y activaciones; en la práctica unos 3-4 GB para secuencias cortas y lotes pequeños.
- VRAM para inferencia en int8: aproximadamente 1,0-1,5 GB de pesos; el total con overhead se sitúa en torno a 2 GB.
- VRAM para inferencia en 4 bits: aproximadamente 0,6-0,8 GB de pesos; alrededor de 1,5 GB en total.
- GPU recomendadas: cualquier GPU con 8 GB o más. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 lo ejecutan con holgura y permiten lotes grandes. Para servir en producción con paralelización, una A100 o H100 de 40/80 GB queda sobredimensionada para 1B de parámetros y solo se justifica por agregación de muchos modelos.
- Cabe en GPU de consumo: sí. Incluso GPUs de gama de entrada con 6-8 GB pueden ejecutarlo si se cuantiza.
- Opciones de despliegue: Transformers (`pipeline`), TRL para reentrenamiento, vLLM por herencia de arquitectura GPT-NeoX (requiere verificación, no está confirmado para este checkpoint), TGI y HuggingFace Inference Endpoints segun los tags del repositorio. llama.cpp y Ollama requerirían convertir los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni información sobre `max_new_tokens` óptimo más allá del ejemplo de 128 tokens de la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Estado |
|---|---|---|---|---|---|
| ppt-pythia-1b-appendix-permuted-seed3408-stage2 | 1,01 B | no disponible | no disponible | no | Checkpoint de investigacion, 0 descargas |
| Pythia-1B (EleutherAI) | 1,0 B | 2048 tokens | Apache-2.0 | Si (suite completa de EleutherAI) | Modelo base publico y documentado |
| TinyLlama-1.1B (community) | 1,1 B | 2048 tokens | Apache-2.0 | Si (resultados publicados por el proyecto) | Ampliamente usado y cuantizado |
| Qwen2.5-1.5B (Alibaba) | 1,54 B | 32 768 tokens | Apache-2.0 | Si | Alternativa moderna con contexto largo |

Nota: los datos de las columnas correspondientes a los modelos alternativos provienen de su documentacion publica y deben verificarse antes de tomar decisiones. La ventaja competitiva de este checkpoint frente a ellos no puede evaluarse porque no existe ninguna medicion publicada: en contexto, licencia y documentacion queda por detras de las tres alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni tareas de validacion, ni comparación con el modelo base, por lo que es imposible estimar la calidad de las respuestas.
- Licencia indeterminada: la model card contiene una clave `licence: license` sin texto legal asociado. No existe autorización explícita para uso comercial y el uso en producción es jurídicamente arriesgado.
- Modelo base no identificado: la model card enlaza a `None`. Si el ajuste parte realmente de Pythia-1B, siguen aplicando las consideraciones de ese modelo; si parte de otro checkpoint, la trazabilidad se rompe por completo.
- Sesgos heredados: cualquier sesgo del corpus de preentrenamiento del modelo base se conserva y no se ha documentado ninguna mitigación en la etapa de SFT.
- Riesgo de alucinación: en modelos de 1B sin RLHF ni alineación adicional, la tasa de afirmaciones inventadas es estructuralmente elevada, especialmente en preguntas factuales y razonamiento numérico.
- Ambigüedad del entrenamiento SFT: no se documentan el dataset, la plantilla de chat exacta, la longitud de secuencia ni el número de épocas, lo que dificulta reproducir el comportamiento observado.
- Idiomas desconocidos: al no declararse, no se puede asumir competencia en castellano ni en ningún otro idioma distinto del inglés del corpus de Pythia.
- Contexto sin confirmar: aunque Pythia-1B emplea 2048 tokens, este checkpoint no declara longitud de contexto; usar ventanas largas sin verificación puede producir degradación silenciosa.
- Repositorio sin mantenimiento: creado y actualizado en septiembre de 2026, sin descargas ni interacciones, sin issues ni respuestas del autor; no cabe esperar soporte.
- Artefacto experimental: el nombre (`appendix-permuted`, `seed3408`, `stage2`) apunta a una ablación de investigación, no a un modelo optimizado para usuarios finales.

## Enlaces

- HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-1b-appendix-permuted-seed3408-stage2
- Repositorio TRL: https://github.com/huggingface/trl
- Cita de TRL (von Werra et al., 2020), incluida en la model card:
  `@misc{vonwerra2022trl, title = {{TRL: Transformer Reinforcement Learning}}, author = {Leandro von Werra and Younes Belkada and Lewis Tunstall and Edward Beeching and Tristan Thrush and Nathan Lambert and Shengyi Huang and Kashif Rasul and Quentin Gallou{\'e}dec}, year = 2020, journal = {GitHub repository}, publisher = {GitHub}, howpublished = {\url{https://github.com/huggingface/trl}} }`
- Modelo base declarado: no disponible (la model card referencia `None`).
- Resultados de búsqueda web: ninguno relevante. Las URLs devueltas trataban sobre divisibilidad de números entre 1 y 100 y no guardan relación con el modelo.
