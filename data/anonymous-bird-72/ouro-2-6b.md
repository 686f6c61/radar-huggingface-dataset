# anonymous-bird-72/Ouro-2.6B

## Resumen

Ouro-2.6B es un modelo de lenguaje de 2.667.974.657 parametros (2,6B) basado en una arquitectura de transformer decoder-only con pesos compartidos entre pasos recurrentes, lo que sus autores denominan Looped Language Model (LoopLM). En lugar de apilar mas capas, el modelo reutiliza el mismo bloque de 24 capas durante 4 pasos recurrentes, realizando el razonamiento en espacio latente de forma iterativa. Segun la model card, esta estrategia le permite igualar el rendimiento de transformers estandar de 3-4B con un coste de almacenamiento de solo 2,6B de parametros.

El modelo se distribuye con licencia Apache-2.0 y esta orientado explicitamente a investigacion: la propia model card advierte de que se proporciona "as-is" y sin garantias para uso en produccion. Incorpora un mecanismo de salida temprana adaptativa (`early_exit_threshold`) que permite asignar computo dinamico segun la dificultad de la peticion, ajustando el numero de pasos recurrentes entre 1 y 4.

El repositorio publicado bajo el identificador `anonymous-bird-72/Ouro-2.6B` presenta 0 descargas y 0 likes, y la model card referencia internamente los identificadores `ByteDance/Ouro-2.6B` y `ouro-llm/Ouro-2.6B` en los ejemplos de codigo, asi como una cita de Zhu, Rui-Jie et al. (arXiv:2510.25741). Esto sugiere una re-publicacion o espejo del modelo original, cuya autoria institucional exacta no queda confirmada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con pesos compartidos entre pasos recurrentes (Looped Language Model, LoopLM) |
| Parametros totales | 2.667.974.657 (2,6B) |
| Parametros activos | No aplica: no es un modelo MoE. Los 4 pasos recurrentes comparten el mismo bloque de pesos |
| Capas | 24 |
| Pasos recurrentes | 4 por defecto (`total_ut_steps`), configurable |
| Dimensión oculta | 2048 |
| Cabezas de atencion | Multi-Head Attention (MHA); numero de cabezas no disponible |
| Normalizacion | Sandwich RMSNorm |
| Activacion FFN | SwiGLU |
| Posicional | RoPE |
| Vocabulario | 49.152 tokens |
| Longitud de contexto | 4096 tokens en entrenamiento, extensible a 64K |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 5,3 GB); requiere `custom_code` y `trust_remote_code` |
| Libreria | transformers (se recomienda <4.56.0; idealmente 4.54.1 o anterior) |

## Arquitectura y entrenamiento

La innovacion central es el uso de recurrencia con pesos compartidos: un unico bloque de 24 capas se ejecuta hasta 4 veces, de modo que el modelo incrementa su profundidad computacional efectiva sin incrementar el numero de parametros almacenados. La salida temprana adaptativa permite detener la recurrencia antes de completar los 4 pasos, de forma que las peticiones sencillas consumen menos computo. Los valores por defecto son `total_ut_steps = 4` y `early_exit_threshold = 1.0` (umbral 1.0 implica usar siempre todos los pasos); valores inferiores del umbral favorecen salidas mas tempranas, y reducir `total_ut_steps` intercambia rendimiento por tiempo de inferencia.

El entrenamiento cubre 7,7 billones de tokens distribuidos en cuatro etapas: preentrenamiento con 6T tokens, CT annealing con 2,6T tokens, entrenamiento de contexto largo con 20B tokens y mid-training con 300B tokens. La composicion de datos incluye web, codigo, matematicas y documentos de contexto largo. El optimizador es AdamW con beta1=0,9 y beta2=0,95, y el scheduler de learning rate es Warmup-Stable-Decay (WSD). No se especifica en la informacion disponible si hubo fases de RLHF, DPO u otra alineacion posterior.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento iterativo en espacio latente mediante computo recurrente, con la etiqueta `reasoning` declarada por el autor.
- Asignacion dinamica de computo mediante salida temprana adaptativa, regulable por configuracion.
- Procesamiento de contexto largo: entrenado de forma nativa a 4K y ampliable hasta 64K, con una etapa especifica de 20B tokens de contexto largo.
- Entrenamiento sobre datos de codigo y matematicas, aunque no se publican resultados numericos por tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la model card.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales adicionales (vision, audio, modo thinking explicito): no disponibles.

## Casos de uso

- Investigacion en arquitecturas eficientes en parametros: el modelo sirve como banco de pruebas para comparar transformers recurrentes con pesos compartidos frente a transformers densos de 3-4B, midiendo la relacion entre numero de pasos recurrentes y calidad de salida.
- Razonamiento con presupuesto de computo variable: en pipelines de investigacion se puede fijar `early_exit_threshold` bajo para tareas simples (clasificacion, extraccion) y 1.0 para tareas que requieran los 4 pasos completos, ajustando latencia y coste por peticion.
- Asistente conversacional local en hardware de gama de consumo: con 2,6B de parametros, el modelo cabe en GPUs consumer y puede desplegarse para prototipos de chatbot sin conexion a servicios en la nube.
- Resumen y analisis de documentos largos: la extension de contexto hasta 64K permite procesar informes o articulos extensos en una sola pasada, aprovechando la etapa de entrenamiento de contexto largo.
- Generacion de codigo en entornos con GPU limitada: dado que el modelo fue entrenado con datos de codigo, puede emplearse para autocompletado y generacion en estaciones de trabajo con una unica GPU, siempre con validacion humana por el riesgo de alucinacion.
- Ajuste fino con LoRA sobre una sola GPU: al estar bajo Apache-2.0, se permite el fine-tuning y la redistribucion de derivados, lo que facilita adaptaciones a dominios concretos (legal, tecnico, sanitario) en entornos academicos.
- Evaluacion comparativa de mecanismos de salida temprana: util para estudiar como afecta el umbral de salida adaptativa a metricas de calidad y a coste computacional en cargas reales.
- Docencia y experimentacion en cursos de IA: su tamano reducido, licencia permisiva y comportamiento configurable lo hacen adecuado para practicas de inferencia, cuantizacion y analisis de atencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen (`assets/benchmark.png`) con la grafica de rendimiento, pero los valores numericos no estan disponibles en formato texto. La unica afirmacion cuantitativa recogida es cualitativa: el autor sostiene que el modelo iguala el rendimiento de transformers estandar de 3-4B con solo 2,6B de parametros. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- Peso de los parametros: 2.667.974.657 parametros a 2 bytes por parametro (bf16/fp16) equivalen a unos 5,34 GB, coherente con los 5,3 GB del repositorio.
- VRAM estimada en bf16/fp16: aproximadamente 6-8 GB considerando pesos, cache KV y activaciones a contextos cortos. Estimacion derivada del recuento de parametros, no un dato publicado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,7 GB solo de pesos, mas cache KV y sobrecarga.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1,4 GB solo de pesos. No hay pesos cuantizados oficiales publicados, por lo que habria que generarlos.
- Cache KV: no se puede calcular con precision porque la model card no indica el numero de cabezas de atencion. El coste de cache es el de un modelo de 24 capas con MHA; el factor recurrente multiplica el computo, no el tamano de la cache.
- Cabe en GPU consumer: si. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden ejecutarlo en bf16; tarjetas de 8 GB requeriran cuantizacion.
- GPU de centro de datos recomendadas: A100, H100 o L40S para servir varias instancias o contextos largos cercanos a 64K.
- Opciones de despliegue: transformers (obligatorio `trust_remote_code`, version recomendada 4.54.1 o anterior y en todo caso <4.56.0); vLLM es compatible pero no soporta la salida temprana adaptativa, de modo que siempre ejecuta los `total_ut_steps` completos. No hay soporte oficial documentado para llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponible. Como referencia estructural, 4 pasos recurrentes implican un coste de computo en inferencia del orden de 4 veces el de un transformer denso de 24 capas, al reutilizar los mismos pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ouro-2.6B | 2,6B (24 capas, 4 pasos recurrentes) | 4K nativo, hasta 64K | Apache-2.0 | safetensors en HuggingFace; requiere `trust_remote_code` |
| Qwen2.5-3B | 3,09B | 32K (hasta 128K en variantes) | Apache-2.0 (segun su model card) | safetensors, GGUF y multiples herramientas |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 Community License | safetensors, GGUF y amplio ecosistema |
| SmolLM2-1.7B | 1,7B | 8K | Apache-2.0 | safetensors y GGUF |

Los datos de los modelos alternativos corresponden a informacion publica de sus respectivas model cards y deben verificarse en la fuente original. No es posible establecer una comparacion de rendimiento con Ouro-2.6B porque no hay cifras de benchmarks publicadas en la informacion disponible.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion: la model card advierte de forma explicita de que el modelo se entrega "as-is", sin garantias y sin soporte para produccion.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni resultados de evaluaciones de veracidad; es un modelo de 2,6B, tamano en el que la fiabilidad factual suele ser limitada. No se debe usar para asesoramiento medico, legal o financiero sin supervision humana.
- Sesgos: no se publica informacion sobre composicion demografica del dataset ni sobre analisis de sesgos. La combinacion de datos web y de codigo implica heredar los sesgos presentes en esas fuentes.
- Limitaciones de contexto: el contexto nativo de entrenamiento es de 4096 tokens. La extension a 64K se anuncia como capacidad, pero no se detallan resultados ni degradacion de rendimiento mas alla de esos 4K.
- Idiomas: no se declara cobertura linguistica. No hay garantia de calidad fuera del ingles, que es el idioma predominante en datasets web y de codigo.
- Restricciones de compatibilidad: requiere `trust_remote_code` y una version de transformers anterior a 4.56.0 (recomendada 4.54.1). Existe un parche de cache KV externo (`ouro-cache-fix`) para corregir la compatibilidad con transformers >= 4.56.0, lo que indica fragilidad en el soporte de la libreria.
- vLLM no soporta la salida temprana adaptativa, por lo que se pierde la asignacion dinamica de computo y se ejecutan siempre todos los pasos recurrentes.
- Sin ecosistema de cuantizacion: no hay pesos GGUF, AWQ o GPTQ publicados, lo que complica el despliegue en llama.cpp, Ollama u otras herramientas ligeras.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero la propia model card desaconseja el uso en produccion, lo que crea una tension entre la licencia y la recomendacion del autor.
- Estado del repositorio: 0 descargas y 0 likes, publicado el 21 de septiembre de 2026. Los identificadores internos de la model card apuntan a `ByteDance/Ouro-2.6B` y `ouro-llm/Ouro-2.6B`, por lo que se trata probablemente de una copia cuya procedencia conviene verificar antes de confiar en la integridad de los pesos.
- Procedencia de los datos de esta ficha: toda la informacion tecnica proviene de la model card del repositorio y no ha sido validada de forma independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anonymous-bird-72/Ouro-2.6B
- Paper (pagina de HuggingFace): https://huggingface.co/papers/2510.25741
- Paper en arXiv (referencia de la cita): https://arxiv.org/abs/2510.25741
- Pagina del proyecto: https://ouro-llm.github.io/
- Parche de cache KV para transformers >= 4.56.0: https://github.com/Antizana/ouro-cache-fix
- Identificador alternativo citado en la model card (no verificado): https://huggingface.co/ByteDance/Ouro-2.6B
- Cita: Zhu, Rui-Jie; Wang, Zixuan; Hua, Kai; Zhang, Tianyu; Li, Ziniu; Que, Haoran; Wei, Boyi; Wen, Zixin; Yin, Fan; Xing, He; y otros. "Scaling Latent Reasoning via Looped Language Models". arXiv:2510.25741, 2025.

Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas sobre el colectivo de hacktivistas Anonymous (Wikipedia en frances e ingles, Le Big Data, canal de YouTube), sin ninguna relacion con el modelo Ouro-2.6B. No se ha encontrado ningun enlace adicional relevante para esta ficha.
