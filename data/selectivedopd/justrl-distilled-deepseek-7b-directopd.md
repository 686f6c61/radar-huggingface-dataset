# SelectiveDOPD/JustRL-Distilled-DeepSeek-7b-DirectOPD

## Resumen

JustRL-Distilled-DeepSeek-7b-DirectOPD es un modelo de generacion de texto publicado en HuggingFace por el usuario SelectiveDOPD, con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) almacenados en formato safetensors. La etiqueta de arquitectura declarada en HuggingFace es `qwen2`, por lo que se trata de un transformer denso con decodificacion autoregresiva construido sobre la familia Qwen2, no de una arquitectura MoE ni de un modelo de estado (SSM). El repositorio ocupa 30,5 GB, un tamano coherente con pesos en precision FP32 (7,6 mil millones de parametros multiplicados por 4 bytes dan unos 30,5 GB).

El nombre del repositorio sugiere un proceso de destilacion sobre un modelo de razonamiento de DeepSeek combinado con aprendizaje por refuerzo ("JustRL") y una tecnica denominada "DirectOPD" dentro de los experimentos "BiDirect-OPD". Sin embargo, la model card publicada no documenta ni el dataset de entrenamiento, ni el numero de tokens, ni la receta de RL, ni los hiperparametros utilizados, por lo que estos extremos no pueden confirmarse. La rama `main` contiene el checkpoint `global_step_300`, y el autor mantiene ramas adicionales con checkpoints intermedios cada 20 pasos, de `global_step_20` a `global_step_280`.

El modelo es relevante en el contexto de investigacion sobre destilacion de modelos de razonamiento en tamanos de 7B, un segmento en el que la comparacion entre checkpoints intermedios de RL resulta util para estudiar la evolucion del comportamiento durante el entrenamiento. No obstante, la ausencia de licencia declarada, de idiomas especificados, de benchmarks y de cualquier documentacion tecnica limita seriamente su evaluacion previa y su uso en produccion. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con decodificacion autoregresiva (etiqueta HuggingFace: `qwen2`) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (tamano del repositorio: 30,5 GB) |

Otros datos tecnicos declarados en HuggingFace: biblioteca `transformers`, pipeline `text-generation`, tarea conversacional, compatible con `text-generation-inference` y con endpoints compatibles; fecha de creacion 11 de septiembre de 2026 y ultima actualizacion 12 de septiembre de 2026 (fechas tal como figuran en la ficha del repositorio).

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `qwen2` de HuggingFace, que situa el modelo en la familia de transformers densos Qwen2: atencion por causalidad con sesgo QKV, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens atados en la capa de salida. No se dispone de informacion sobre el numero de capas, dimension oculta, numero de cabezas de atencion, vocabulario ni mecanismo de atencion (por ejemplo, si se emplea atencion completa, ventana deslizante o el escalado de RoPE tipo YaRN). Tampoco consta la longitud de contexto soportada ni si se ha aplicado extension de contexto respecto al modelo base.

Respecto al entrenamiento, la model card unicamente indica que el modelo se subio desde `justrl_deepseek_7b_DirectOPD` dentro de los experimentos "BiDirect-OPD" y que la rama `main` corresponde al paso global 300, con ramas para los pasos 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260 y 280. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF, DPO o RL verificable, ni la naturaleza exacta de la tecnica "DirectOPD". Cualquier afirmacion sobre destilacion desde DeepSeek o sobre el uso de aprendizaje por refuerzo seria una inferencia basada en el nombre del repositorio y no en documentacion verificable.

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno: es la tarea declarada en la pipeline (`text-generation`) y el modelo esta marcado como conversacional.
- Razonamiento y resolucion de problemas: plausible dado el nombre del repositorio ("Distilled-DeepSeek", "JustRL"), pero no verificado ni documentado por el autor.
- Generacion de codigo y matematicas: no disponible; no hay benchmarks ni ejemplos que lo confirmen.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo de pensamiento explicito, vision, audio): no disponibles.
- Capacidad de reanudacion desde checkpoints intermedios de RL: el repositorio publica 14 ramas de checkpoints adicionales, lo que permite estudiar la evolucion del modelo paso a paso en un contexto de investigacion.

Nota: al no existir model card tecnica, esta seccion refleja unicamente lo declarado en las etiquetas de HuggingFace y debe tratarse como no confirmado.

## Casos de uso

- Investigacion sobre dinamicamente del aprendizaje por refuerzo: los checkpoints de `global_step_20` a `global_step_300` permiten analizar como evolucionan las respuestas del modelo a lo largo del entrenamiento, comparando tasas de acierto en tareas de razonamiento entre pasos.
- Destilacion hacia modelos mas pequenos: el modelo puede actuar como profesor para generar trazas de razonamiento que se utilicen en la destilacion de modelos de 1B a 3B, aprovechando su tamano manejable en una sola GPU.
- Evaluacion academica de tecnicas de RL: util como linea base frente a modelos destilados de DeepSeek publicados oficialmente, siempre que se documente que la comparacion se hace sin garantias de licencia comercial.
- Generacion de texto en entornos de investigacion sin requisitos de produccion: prototipado de asistentes conversacionales en un laboratorio donde el modelo se ejecuta localmente y no se exponen datos de terceros.
- Analisis de sesgos y comportamientos indeseados en modelos post-entrenados con RL: el modelo es un candidato para estudiar derivas de estilo, verbosidad o degradacion en checkpoints tardios.
- Fine-tuning posterior en dominios verticales: al ser un denso de 7,6B, cabe en procesos de ajuste con LoRA en GPUs de 24 GB y sirve como punto de partida para dominios como atencion al cliente o analisis documental.
- Servicio interno de bajas prestaciones: desplegado con vLLM o TGI en una GPU de 24 GB, puede atender cargas moderadas de generacion de texto en un entorno controlado.

No se recomienda ningun caso de uso en produccion con datos de clientes o con requisitos de cumplimiento mientras no exista una licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MATH ni de ninguna otra evaluacion, y el autor no aporta comparaciones con modelos de referencia. Tampoco se dispone de metricas de perplexidad, tasas de acierto en tareas de razonamiento ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 30,5 GB solo para los pesos, mas la cache KV, lo que exige GPUs como A100 40/80 GB, H100 o dos RTX 4090 en paralelo.
- VRAM estimada en FP16/BF16 (tras conversion): en torno a 15,2 GB para los pesos, mas 1-4 GB de cache KV segun la longitud de contexto, lo que situa el total alrededor de 17-20 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7,6 GB de pesos, con un total en torno a 10-12 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4-5 GB de pesos, con un total en torno a 6-8 GB para contextos moderados.
- GPUs recomendadas: A100 40 GB o H100 para FP32 o FP16 con contexto largo; RTX 4090, RTX 3090 o L40S para FP16 con contexto corto; RTX 4080, RTX 4070 Ti o GPUs de 12-16 GB para cuantizacion de 8 o 4 bits.
- Compatibilidad con GPU de consumo: si, en FP16 cabe en RTX 4090 o RTX 3090 (24 GB); en 4 bits cabe en GPUs de 8-12 GB, como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: `transformers` con `generate`, `text-generation-inference` (declarado compatible en las etiquetas), vLLM, SGLang y servidores compatibles con la API de OpenAI. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el autor no ha publicado.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempos de primera respuesta.

Estas cifras son estimaciones derivadas del numero de parametros y del tamano del repositorio, no datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JustRL-Distilled-DeepSeek-7b-DirectOPD | 7,6B | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen2-7B (modelo base de la familia) | 7,6B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente utilizado |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 131.072 tokens | MIT | HuggingFace, modelo oficial de DeepSeek |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 tokens | Licencia comunitaria de Llama 3.1 | HuggingFace, muy extendido |

La comparacion es estructural: no existen datos de rendimiento de este modelo que permitan contrastarlo con las alternativas en tareas concretas. Frente a DeepSeek-R1-Distill-Qwen-7B, que es el modelo oficial de destilacion de DeepSeek en el mismo rango de parametros, este repositorio carece de licencia explicita, de documentacion de entrenamiento y de cualquier evaluacion publicada.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ninguna licencia en HuggingFace ni en la model card, lo que en la practica impide el uso comercial y desaconseja cualquier despliegue en produccion. La ausencia de licencia no equivale a dominio publico.
- Ausencia de idiomas declarados: no se puede asumir un rendimiento aceptable en castellano ni en ningun otro idioma concreto.
- Riesgo de alucinacion: no evaluado. Al no haber benchmarks ni evaluaciones de fidelidad, no hay datos sobre la tasa de respuestas incorrectas o inventadas.
- Sesgos: no documentados ni auditados. Los sesgos heredados del modelo base y los introducidos por el proceso de RL son desconocidos.
- Opacidad del entrenamiento: no se publican datos, tokens, hiperparametros ni la definicion de "DirectOPD", lo que impide reproducir el modelo o auditar su comportamiento.
- Checkpoints de RL sin garantia de convergencia: el hecho de que existan ramas cada 20 pasos y que la rama principal sea el paso 300 no implica que este sea el mejor checkpoint; no se aportan curvas de evaluacion que lo justifiquen.
- Riesgo de degradacion por entrenamiento con RL prolongado: en ausencia de evaluaciones, no se puede descartar colapso de diversidad, verbosidad excesiva o sobreajuste a un formato de respuesta concreto.
- Longitud de contexto desconocida: sin este dato no se puede planificar el consumo de memoria ni garantizar el comportamiento en conversaciones largas.
- Precisión de los pesos: el tamano del repositorio (30,5 GB) apunta a pesos en FP32, lo que no es el formato habitual de publicacion (BF16) y obliga a convertir los pesos antes de desplegarlos de forma eficiente.
- Sin pesos cuantizados oficiales: no hay versiones GGUF, GPTQ o AWQ publicadas, y cualquier conversion corre por cuenta del usuario sin garantias de fidelidad.
- Trazabilidad limitada: el autor es una cuenta sin historial verificable (0 descargas, 0 "likes") y no se aporta paper, repositorio de codigo ni informe tecnico.
- Fechas del repositorio no verificadas: la ficha indica fechas de 2026, que deben comprobarse directamente en la plataforma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Distilled-DeepSeek-7b-DirectOPD
- Rama con el checkpoint principal (`global_step_300`): https://huggingface.co/SelectiveDOPD/JustRL-Distilled-DeepSeek-7b-DirectOPD/tree/main
- Ramas con checkpoints intermedios (`global_step_20` a `global_step_280`): disponibles bajo el mismo repositorio, en las rutas `refs/heads/global_step_XX`.
- Paper, blog, repositorio de codigo o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos resultados obtenidos fueron paginas corporativas de Microsoft sin relacion con este repositorio.
