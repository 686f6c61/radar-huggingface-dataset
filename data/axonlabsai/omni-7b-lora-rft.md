# axonlabsai/Omni-7B-lora-rft

## Resumen

El modelo `axonlabsai/Omni-7B-lora-rft` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Axon Labs sobre el modelo base multimodal Qwen/Qwen2.5-Omni-7B. Este adaptador, de tipo *rejection-sampling fine-tuning* (RFT), está diseñado específicamente para mejorar las capacidades de generación de código del modelo base, sin modificar los componentes de audio, visión o habla. Según la model card, es el mejor checkpoint de codificación producido en esta línea de trabajo, logrando un incremento de 8,4 puntos en BigCodeBench pass@1 (de 23,3% a 31,7%) manteniendo intacto el rendimiento en HumanEval+ (90,6%).

La relevancia de este adaptador radica en su metodología: el fine-tuning se realizó con datos *on-policy*, es decir, muestras generadas por el propio modelo y filtradas mediante ejecución real contra tests unitarios, en lugar de usar ejemplos curados de otros modelos. Este enfoque demostró ser decisivo, ya que un intento previo con 2.380 ejemplos externos no produjo ninguna mejora. El adaptador es ligero (0,6 GB) y se aplica únicamente a las capas de texto del "thinker" (196 módulos), dejando intactos el talker, token2wav y los encoders de audio/visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Omni-7B (arquitectura base no detallada en la informacion) |
| Parametros totales | 7B (segun denominacion del modelo base) |
| Parametros activos | No aplica (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponibles (hereda los del modelo base, no especificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-Omni-7B, un modelo multimodal end-to-end de la serie Qwen que procesa texto, imagenes, audio y video, y genera respuestas de texto y habla en tiempo real. El adaptador LoRA utiliza r=64 y alpha=128, aplicado exclusivamente a las capas de texto del "thinker" (196 modulos), dejando intactos el talker, token2wav y los encoders de audio/vision.

El entrenamiento se realizo mediante rejection-sampling fine-tuning: se tomaron 374 problemas del dataset MBPP, se generaron 6 muestras por problema a temperatura 0.8, y cada muestra se ejecuto contra tests unitarios reales. Solo se conservaron las soluciones que pasaban todos los tests, quedandose con la solucion mas corta por problema. Esto produjo 304 ejemplos verificados (tasa de resolucion del 81,3%). El adaptador se entreno durante 2 epocas, incluyendo datos de identidad y anti-loop para evitar degeneraciones. El aspecto clave es que el entrenamiento fue on-policy: los datos de entrenamiento provienen del propio modelo, no de otros modelos, lo que explica la mejora sustancial en codificacion.

## Capacidades

- Generacion de codigo: mejora significativa en tareas de codificacion dificil (BigCodeBench +8,4 puntos), manteniendo el rendimiento en tareas faciles (HumanEval+ sin cambios).
- Razonamiento y generacion de texto: hereda las capacidades del modelo base Qwen2.5-Omni-7B, aunque el adaptador se centra en codigo.
- Multimodalidad: al ser un adaptador sobre un modelo multimodal, conserva las capacidades de procesamiento de texto, imagen, audio y video del modelo base, aunque el adaptador solo afecta a la parte de texto.
- Tool calling y agentes: no se menciona en la informacion disponible, pero el modelo base podria soportarlo; no confirmado.
- Multilingue: no se especifican idiomas, pero el modelo base de Qwen suele soportar varios idiomas; no confirmado.

## Casos de uso

- Generacion de codigo en produccion: el adaptador puede integrarse en pipelines de desarrollo para autocompletar o generar funciones y modulos, aprovechando la mejora en BigCodeBench para problemas complejos.
- Asistente de programacion en entornos integrados: al mantener el rendimiento en HumanEval+, es adecuado para tareas de programacion sencillas y rapidas, como generar funciones utilitarias o resolver ejercicios clasicos.
- Resolucion de problemas de programacion competitiva: la mejora en BigCodeBench sugiere que el modelo es util para problemas de dificultad media-alta, donde se requiere comprension de especificaciones y generacion de soluciones correctas.
- Fine-tuning adicional: al ser un adaptador LoRA ligero, puede servir como punto de partida para otros fine-tunings especificos de dominio, sin necesidad de entrenar el modelo completo.
- Evaluacion de metodologias de entrenamiento: el adaptador es un caso de estudio valioso para investigadores que quieran replicar el enfoque de rejection-sampling on-policy con ejecucion de tests.
- Despliegue en entornos con recursos limitados: al ser un adaptador de solo 0,6 GB, se puede cargar sobre el modelo base cuantizado, permitiendo su uso en GPUs de consumo medio.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks de codificacion, comparando el modelo base (stock) con el adaptador. No se incluyen otros benchmarks.

| Benchmark | Stock Qwen2.5-Omni-7B | Con adaptador Omni-7B-lora-rft |
|---|---|---|
| BigCodeBench pass@1 (60 problemas, 900 tokens) | 23,3% (14/60) | 31,7% (19/60) |
| HumanEval+ pass@1 (32 problemas, 1000 tokens) | 90,6% (29/32) | 90,6% (29/32) |

El adaptador gana 7 problemas en BigCodeBench y pierde 2, resultando en una mejora neta de +8,4 puntos. No se han publicado resultados en otros benchmarks (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0,6 GB, por lo que el requisito principal es la VRAM para cargar el modelo base Qwen2.5-Omni-7B (aproximadamente 14-16 GB en FP16, menos con cuantizacion).
- No se especifican requisitos de hardware en la informacion proporcionada.
- Se puede desplegar con librerias que soporten PEFT, como Hugging Face Transformers con PeftModel, o mediante vLLM si se integra el adaptador.
- Para inferencia en consumer GPUs, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090) si se usa el modelo base en FP16, o menos si se cuantiza el modelo base.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este adaptador con otros modelos de codificacion similares. La unica comparacion disponible es contra el modelo base sin adaptador, que se muestra en la seccion de benchmarks. No se conocen otros adaptadores de codificacion sobre Qwen2.5-Omni-7B en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador es experimental: tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.
- No se especifica licencia, lo que puede generar incertidumbre legal para uso comercial o redistribucion.
- El entrenamiento se realizo exclusivamente con problemas de MBPP, por lo que el modelo puede tener sesgos hacia ese tipo de problemas y no generalizar a otros dominios de codificacion.
- No se han evaluado capacidades fuera de codificacion; el adaptador podria degradar ligeramente otras tareas, aunque la model card indica "cero perdida" en HumanEval+.
- La metodologia de rejection-sampling con ejecucion de tests requiere un entorno de ejecucion seguro, ya que el modelo podria generar codigo con efectos secundarios no deseados.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.

## Enlaces

- [Hugging Face - axonlabsai/Omni-7B-lora-rft](https://huggingface.co/axonlabsai/Omni-7B-lora-rft)
- [Perfil de axonlabsai en Hugging Face](https://huggingface.co/axonlabsai/models)
- [Repo axon-oss de Axon Labs](https://huggingface.co/axonlabsai/axon-oss)
- [Articulo de Alibaba sobre Qwen2.5-Omni-7B](https://www.alibabagroup.com/document-1843362291857227776)
