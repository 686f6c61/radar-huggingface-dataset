# Knightly9/Qwen2.5-7B-Instruct-nf4

## Resumen

Qwen2.5-7B-Instruct-nf4 es una cuantizacion de 4 bits en formato NF4 del modelo Qwen2.5-7B-Instruct, publicada por el usuario Knightly9 en Hugging Face. No es un modelo entrenado desde cero ni un ajuste fino: los pesos originales se han cuantizado con bitsandbytes (`load_in_4bit=True`, `quant_type="nf4"`, doble cuantizacion y `bfloat16` como dtype de computo) y el resultado se ha guardado ya cuantizado en safetensors, sin necesidad de configuracion de cuantizacion al recargarlo. El repositorio ocupa 5,6 GB y declara 7.615.616.512 parametros, exactamente los mismos que el modelo base, ya que la cuantizacion no cambia el numero de parametros, solo su precision.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only denso de 7,6 mil millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto de 131.072 tokens y licencia Apache 2.0. La relevancia de esta publicacion es practica: reduce el peso en disco de 14,19 GB a 5,18 GB (una reduccion del 63,5 %) y declara una huella de GPU de 5,07 GB, lo que permite ejecutar un modelo de 7B en GPUs de gama media o en portatiles con 8-12 GB de VRAM.

Se trata de un artefacto academico, producido para la "MS628 Assignment 2.1", sin pipeline, licencia ni idiomas declarados en el repositorio, sin benchmarks publicados y con 0 descargas y 0 likes en el momento de redactar esta ficha. Cualquier uso en produccion deberia validarse antes contra el modelo base en las tareas objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), denso, con RoPE, RMSNorm y SwiGLU (heredada del modelo base) |
| Parametros totales | 7.615.616.512 (7,62 mil millones), segun los safetensors del repositorio |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 131.072 tokens en el modelo base; no declarada en el repositorio de cuantizacion |
| Tipos de cuantizacion | NF4 de 4 bits con bitsandbytes, doble cuantizacion activada, dtype de computo bfloat16 |
| Idiomas soportados | No declarado en el repositorio; el modelo base declara soporte para 29 idiomas |
| Licencia | No declarada en el repositorio; el modelo base es Apache 2.0 |
| Formato de pesos | safetensors (carpeta cuantizada de 5,18 GB; repositorio de 5,6 GB) |
| Tamano en disco | 14,19 GB (base) -> 5,18 GB (4 bits), reduccion del 63,5 % |
| Huella de GPU reportada | 5,07 GB |
| Herramienta de cuantizacion | Script `quantize_nf4.py` (no incluido en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). No hay innovaciones arquitectonicas propias de esta publicacion: el unico proceso aplicado es la cuantizacion de los pesos a 4 bits en formato NF4, con doble cuantizacion de las constantes de escala para reducir el coste de los metadatos. No se ha realizado entrenamiento adicional, ajuste fino, RLHF ni DPO sobre los pesos cuantizados, y el autor no documenta ninguna evaluacion de la perdida de calidad respecto al modelo original.

En cuanto al proceso de produccion, la model card indica que se ejecuto `python quantize_nf4.py --model Qwen/Qwen2.5-7B-Instruct --outdir Qwen2.5-7B-Instruct-nf4` en Windows 10, con PyTorch 2.11.0+cu128, bitsandbytes 0.50.2 y una GPU NVIDIA GeForce RTX 5090 Laptop. El repositorio no incluye el script de cuantizacion ni el dataset, y no se documenta el numero de tokens de entrenamiento del modelo base (Qwen no lo especifica de forma cerrada para esta familia). Como los pesos ya estan cuantizados y guardados, la recarga solo necesita Transformers, una GPU CUDA y bitsandbytes.

## Capacidades

Las capacidades descritas a continuacion corresponden al modelo base Qwen2.5-7B-Instruct y se conservan, con la degradacion propia de la cuantizacion a 4 bits, en este artefacto:

- Generacion de texto e instrucciones en formato conversacional multi-turno (plantilla de chat propia de Qwen2.5).
- Razonamiento y matematicas: resolucion de problemas aritmeticos y algebraicos de varios pasos, con soporte de salida estructurada.
- Generacion de codigo en multiples lenguajes y comprension de repositorios de tamano moderado.
- Soporte de tool calling / function calling mediante plantillas de herramientas de Qwen2.5, incluida la seleccion de funcion y el formateo de argumentos en JSON.
- Uso como agente en flujos multi-paso, con ventana de contexto de 131.072 tokens (en el modelo base) para mantener historiales largos.
- Capacidades multilingues en el modelo base (29 idiomas declarados por Qwen), incluyendo castellano, ingles, chino, frances, aleman, portugues e italiano.
- Salida estructurada (JSON) y modo de respuesta con longitud controlada.
- No dispone de vision, audio ni modo "thinking" explicito: es un modelo de texto puro.

## Casos de uso

- Asistente conversacional en local: con 5,07 GB de huella de GPU reportada, el modelo se puede servir en un portatil con GPU de 8-12 GB para un asistente multi-turno con contextos de decenas de miles de tokens, sin enviar datos a la nube.
- Prototipado rapido de agentes con tool calling: permite iterar sobre el bucle de decision y el formateo de llamadas a funciones en una sola GPU consumer antes de pasar a un modelo mayor, aprovechando la compatibilidad directa con Transformers.
- Generacion de codigo asistida en entornos con VRAM limitada: autocompletado, explicacion de funciones y generacion de tests, con la salvedad de que conviene validar la tasa de codigo correcto del artefacto cuantizado frente al modelo base.
- Procesamiento de documentos largos: la ventana de 131.072 tokens del modelo base permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada, a costa de un KV cache que crece con el contexto (vease la seccion de hardware).
- Clasificacion y extraccion de informacion con salida JSON: normalizacion de tickets de soporte, categorizacion de correos o extraccion de entidades en pipelines de datos por lotes.
- Investigacion academica sobre cuantizacion: el artefacto sirve como punto de comparacion para medir la degradacion de NF4 frente a bfloat16 en tareas concretas, especialmente util al proceder de una asignatura que ya exige reproducir el proceso.
- Aprendizaje y docencia: ejecutar Qwen2.5-7B-Instruct en hardware modesto para demostraciones en clase o talleres, donde el requisito principal es que quepa en la GPU disponible y no la maxima calidad.
- Evaluacion comparativa de metodos de cuantizacion: mismo modelo base en NF4, GPTQ o AWQ con las mismas preguntas, para estudiar el compromiso entre tamano y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye ningun resultado de MMLU, HumanEval, GSM8K, MATH ni medidas de perplejidad, ni tampoco una comparacion entre los pesos en 4 bits y los pesos originales del modelo base. Los datos de rendimiento que si se documentan son exclusivamente de tamano y memoria: 14,19 GB de pesos fuente en disco, 5,18 GB de carpeta cuantizada (reduccion del 63,5 %) y 5,07 GB de huella de GPU reportada. Cualquier cifra de calidad del modelo base publicada por Qwen corresponderia a los pesos en bfloat16, no a este artefacto, y no debe extrapolarse sin medirla.

## Requisitos de hardware

- VRAM para los pesos: 5,07 GB reportados por el autor; la carpeta en disco ocupa 5,18 GB. Como los pesos ya estan cuantizados y se cargan en GPU, no hay opcion de ejecucion en CPU.
- KV cache estimado: con 28 capas, 4 cabezas KV y dimension de cabeza 128 en bfloat16, el cache ocupa aproximadamente 56 KiB por token, es decir unos 0,45 GiB a 8K tokens, 1,75 GiB a 32K y unos 7 GiB a los 128K completos. En la practica se recomienda inicializar el contexto al maximo necesario.
- VRAM total orientativa: unos 6-8 GB para contextos cortos (4K-8K) y entre 10 y 14 GB para contextos de 32K o superiores, sumando pesos, cache, activaciones y overhead del runtime.
- GPUs consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes con 8 GB o mas, ajustando la longitud de contexto en las de 8 GB.
- GPUs de datacenter: A100, H100 y L40S ejecutan el modelo sin dificultad; no son necesarias, salvo para servir muchas peticiones concurrentes con vLLM.
- Despliegue: la via documentada por el autor es `transformers` con `AutoModelForCausalLM.from_pretrained(..., device_map="auto")` mas bitsandbytes. vLLM y TGI cuentan con soporte de cuantizacion bitsandbytes 4-bit, pero no estan validados por el autor para este repositorio concreto.
- llama.cpp y Ollama no pueden consumir estos pesos directamente, porque requieren formato GGUF; para ello habria que descuantizar a fp16 y volver a convertir, con la perdida de fidelidad que implica.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad, solo de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Knightly9/Qwen2.5-7B-Instruct-nf4 (este) | 7,62 mil millones | 131.072 tokens en el base | NF4 4 bits, 5,18 GB | No declarada en el repo | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,62 mil millones | 131.072 tokens | bfloat16, 14,19 GB | Apache 2.0 | Hugging Face, ampliamente adoptado |
| meta-llama/Llama-3.1-8B-Instruct | ~8 mil millones | 131.072 tokens | bfloat16 | Llama 3.1 Community License | Hugging Face, acceso con aceptacion de terminos |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,25 mil millones | 32.768 tokens | bfloat16 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tarea de este artefacto cuantizado con Llama 3.1 8B Instruct o Mistral 7B Instruct v0.3. La comparacion relevante es de recursos: este repositorio ocupa 5,18 GB frente a los 14,19 GB del base en bfloat16 y a los aproximadamente 15-16 GB de las alternativas de 7B-8B en bfloat16, lo que le permite caber en GPUs con 8 GB de VRAM, algo que las versiones sin cuantizar no consiguen.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion de la degradacion causada por la cuantizacion NF4. La perdida de calidad puede ser pequena en generacion general y mayor en matematicas, codigo o instrucciones con formato estricto.
- Riesgo de alucinacion heredado del modelo base, agravado por la cuantizacion: no hay ninguna validacion factual en el repositorio.
- Sesgos: los sesgos de Qwen2.5-7B-Instruct, derivados de sus datos de entrenamiento, se mantienen intactos. No se documenta ninguna mitigacion.
- Licencia: el repositorio no declara licencia. Aunque el modelo base es Apache 2.0, la ausencia de declaracion explicita en el artefacto publicado es un riesgo legal que conviene aclarar antes de un uso comercial.
- El repositorio es un trabajo academico ("MS628 Assignment 2.1") con 0 descargas y 0 likes y sin pipeline declarado. No ha pasado ninguna revision de la comunidad.
- No se puede ejecutar sin GPU CUDA y sin bitsandbytes, lo que descarta entornos de solo CPU o aceleradores no NVIDIA.
- El script de cuantizacion (`quantize_nf4.py`) no se incluye, por lo que el proceso no es directamente reproducible ni auditable a partir del repositorio.
- El stack declarado (PyTorch 2.11.0+cu128, bitsandbytes 0.50.2) es muy especifico; diferencias de version pueden afectar a la carga de los pesos.
- El ajuste fino posterior sobre estos pesos no esta documentado y es menos directo que con los pesos originales en bfloat16.
- Limitaciones de contexto e idioma: aunque el modelo base soporta 131.072 tokens y 29 idiomas, nada de esto esta declarado ni verificado en este repositorio.
- Para produccion se recomienda medir perplejidad y benchmarks de tarea contra Qwen2.5-7B-Instruct en bfloat16 y decidir si el ahorro de 9 GB de memoria compensa la perdida de calidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Knightly9/Qwen2.5-7B-Instruct-nf4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de presentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5 (arXiv:2412.15115)
- Documentacion de cuantizacion de bitsandbytes: https://huggingface.co/docs/bitsandbytes
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos correspondian a localizadores de tiendas de una cadena minorista y no guardan relacion con el artefacto. Los enlaces anteriores no proceden de esa busqueda.
