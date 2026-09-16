# Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64

## Resumen

Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64 es un checkpoint de generacion de texto publicado en HuggingFace por el usuario Dohyeon1. Por el nombre y por la etiqueta de arquitectura `qwen3_moe`, se trata de una variante derivada de la familia Qwen3-30B-A3B, un modelo de mezcla de expertos (MoE) con aproximadamente 30,5 mil millones de parametros totales, de los cuales solo una fraccion se activa por token. El sufijo "Sub-MoE-ngroups64" apunta a una modificacion en la configuracion de agrupacion de expertos (`n_groups = 64`), un hiperparametro del enrutador que afecta a como se agrupan los tokens antes de asignarlos a expertos.

El modelo esta etiquetado para `text-generation` y `conversational`, con pesos en `safetensors` y compatibilidad declarada con `transformers` y con endpoints tipo API. El repositorio ocupa 61,1 GB, coherente con un checkpoint en bf16/fp16 de 30,5B parametros, y no incluye versiones cuantizadas. Es relevante porque explora una configuracion de enrutamiento alternativa sobre una arquitectura MoE de tamano medio, un area activa de experimentacion para reducir coste de inferencia manteniendo calidad.

La model card es la plantilla automatica de HuggingFace sin rellenar: no aporta informacion sobre datos de entrenamiento, licencia, idiomas, evaluacion ni procedencia exacta del checkpoint. Publicado con 0 descargas y 0 likes, es un artefacto de investigacion sin validacion comunitaria y sin documentacion tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer, segun la etiqueta `qwen3_moe`; detalles internos no disponibles |
| Parametros totales | 30.532.122.624 (≈30,5 mil millones), dato derivado de los pesos en safetensors |
| Parametros activos | no disponible oficialmente; el sufijo "A3B" del nombre sugiere ≈3 mil millones activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `qwen3_moe` y el nombre del repositorio indican una arquitectura de mezcla de expertos basada en Qwen3: un transformer con capas de atencion completas y capas de alimentacion hacia delante sustituidas por modulos MoE con enrutador. El sufijo "ngroups64" sugiere que el autor ha modificado el parametro de agrupacion de expertos respecto a la configuracion original, una tecnica habitual para alterar el reparto de carga entre expertos y el comportamiento del enrutador. No hay informacion publicada sobre el numero de expertos, el numero de expertos activados por token, ni la dimension de las capas.

No se dispone de informacion sobre el proceso de entrenamiento: ni volumen de tokens, ni composicion del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO. La fecha de creacion del repositorio (2026-09-15) y la ausencia de cualquier documentacion adicional impiden confirmar si se trata de un ajuste fino, una destilacion de expertos, una poda de los mismos o una simple modificacion de la configuracion del enrutador sobre el checkpoint base. Tampoco se han publicado detalles de infraestructura, hiperparametros ni regimen de precision.

## Capacidades

Todas las capacidades listadas se infieren de la arquitectura declarada y del pipeline etiquetado (`text-generation`, `conversational`); no estan verificadas por el autor:

- Generacion de texto autoregresiva y mantencion de conversaciones multi-turno.
- Razonamiento y generacion de codigo, capacidades habituales en la familia Qwen3, sin confirmar para este checkpoint concreto.
- Matematicas y tareas de logica paso a paso, presumiblemente heredadas del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; el modelo esta etiquetado unicamente como generacion de texto.

## Casos de uso

Al no existir validacion publicada, estos casos son escenarios plausibles condicionados a que el checkpoint funcione como una variante razonable de Qwen3-30B-A3B. Deben validarse antes de cualquier uso en produccion.

- Prototipado de asistentes conversacionales autoalojados: con 30,5B parametros totales y activacion dispersa, el coste por token en inferencia es menor que el de un modelo denso equivalente, lo que lo hace adecuado para desplegar un chatbot interno con control total sobre los datos.
- Investigacion sobre enrutamiento MoE: al modificar la agrupacion de expertos, el checkpoint sirve como material de estudio para medir como cambia la distribucion de carga entre expertos y la calidad de salida frente al modelo base.
- Generacion y revision de codigo en pipelines internos: si conserva las capacidades del modelo base, puede integrarse en herramientas de autocompletado o revision de pull requests, aunque requiere verificacion previa de calidad.
- Resumen y extraccion de informacion de documentos: tarea de generacion condicionada clasica que no exige tool calling ni capacidades multimodales.
- Experimentos de ajuste fino con tecnicas de bajo rango: al ser un MoE de tamano medio, es un banco de pruebas razonable para LoRA/QLoRA y para estudiar el ajuste de enrutadores.
- Comparativas academicas de variantes MoE: util como punto de comparacion frente a Qwen3-30B-A3B original en estudios de ablacion sobre configuracion de expertos.
- Despliegue en hardware de gama alta para inferencia por lotes: tareas de generacion masiva sin requisitos estrictos de latencia, como clasificacion mediante prompts o generacion de datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion completada y no se han encontrado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en las busquedas realizadas.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (30,5B); no estan confirmadas por el autor:

- VRAM para inferencia en bf16/fp16: aproximadamente 61 GB solo para pesos, mas la cache KV. Coincide con el tamano del repositorio (61,1 GB).
- VRAM en fp8: aproximadamente 31 GB para pesos, mas cache KV.
- VRAM en cuantizacion de 4 bits: aproximadamente 17-18 GB para pesos, mas cache KV. Requiere convertir el checkpoint, ya que no hay GGUF publicado.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB para bf16; 1x H100 80 GB o 1x A100 80 GB para fp8; 1x H200 141 GB para bf16 sin tensor paralelismo.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) unicamente con cuantizacion de 4 bits, siempre que se genere la version cuantizada.
- Opciones de despliegue: `transformers` de forma nativa (el repositorio incluye la libreria); vLLM y SGLang admiten arquitecturas `qwen3_moe`, aunque la modificacion del enrutador puede requerir comprobaciones previas; llama.cpp y Ollama no son utilizables sin convertir los pesos a GGUF, conversion no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a la documentacion publica de cada familia y no estan confirmados para este checkpoint concreto:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64 | 30,5B | no disponible (≈3B segun nombre) | no disponible | no disponible | safetensors, sin cuantizaciones |
| Qwen3-30B-A3B | ≈30,5B | ≈3,3B | 128K (modelo base) | Apache 2.0 (modelo base) | safetensors y GGUF |
| Qwen3-32B | ≈32,8B | denso | 128K (modelo base) | Apache 2.0 (modelo base) | safetensors y GGUF |
| Mixtral 8x7B | ≈46,7B | ≈12,9B | 32K | Apache 2.0 | safetensors y GGUF |

La comparativa directa de rendimiento no es posible: el checkpoint de Dohyeon1 no publica evaluaciones y su licencia no esta declarada, lo que impide confirmar si hereda la licencia Apache 2.0 del modelo base o si aplica restricciones adicionales.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica de HuggingFace sin rellenar; no hay informacion sobre entrenamiento, datos ni intencion del autor.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. No debe asumirse que hereda la Apache 2.0 del modelo base sin confirmacion del autor.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto; no hay evaluaciones de fidelidad ni de tasas de error publicadas.
- Sesgos: no evaluados ni documentados. Los sesgos del modelo base, en caso de heredarse, no han sido medidos en este checkpoint.
- Idiomas: se desconoce la cobertura linguistica. No hay garantia de buen rendimiento en castellano.
- Riesgo de checkpoint defectuoso: la modificacion del enrutador (`n_groups = 64`) puede romper la coherencia con la configuracion de entrenamiento original y degradar la calidad de salida; no hay validacion publica que lo descarte.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede planificar el despliegue para tareas de contexto largo.
- Sin soporte comunitario: 0 descargas y 0 likes implican que no hay usuarios que hayan reportado problemas ni soluciones.
- Trazabilidad limitada: no se especifica de que revision del modelo base proviene ni si hubo reentrenamiento.
- Restricciones tecnicas de despliegue: al no existir versiones GGUF, el uso en llama.cpp, Ollama o LM Studio exige una conversion manual que puede fallar si la configuracion del enrutador no es estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64
- Paper referenciado en las etiquetas (Lacoste et al., 2019, calculo de emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su entrenamiento ni a evaluaciones independientes. Los resultados devueltos no guardan relacion con el contenido tecnico solicitado.
