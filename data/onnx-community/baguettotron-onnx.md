# onnx-community/Baguettotron-ONNX

## Resumen

Baguettotron es un modelo de lenguaje generativo de tipo decoder-only con 321 millones de parámetros, desarrollado por PleIAs, un laboratorio frances dedicado a la construccion de modelos y datasets completamente abiertos. Se trata de un Small Reasoning Model (SLM) de proposito general entrenado sobre 200.000 millones de tokens del dataset SYNTH, un corpus enteramente sintetico y abierto. Su principal singularidad arquitectonica es la profundidad: 80 capas, lo que lo convierte, segun el autor, en el SLM mas profundo de su rango de tamano. El nombre juega con el origen frances del equipo y con la forma alargada del modelo.

La version aqui documentada, `onnx-community/Baguettotron-ONNX`, es una conversion automatica del modelo original a formato ONNX, publicada por la comunidad onnx-community para su uso con Transformers.js. No se trata de un modelo nuevo ni de un fine-tune, sino de una exportacion del checkpoint original de PleIAs orientada a inferencia en el navegador y en entornos JavaScript/Node.js. El repositorio ocupa 6,3 GB e incluye los pesos en ONNX en distintas precisiones.

El modelo es relevante porque demuestra que un SLM de solo 321M de parametros, entrenado con datos sinteticos y una arquitectura inusualmente profunda, puede acercarse al rendimiento de modelos casi el doble de grandes como Qwen-0.6B en benchmarks de razonamiento general, matematicas y recuperacion de informacion, superando a modelos de tamano similar de la familia Gemma. Esta pensado nativamente para instrucciones con trazas de razonamiento (thinking) y soporta seis idiomas europeos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen/Llama, 80 capas |
| Parametros totales | 321 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX en varias precisiones (el repo incluye pesos ONNX; no se detallan los niveles exactos) |
| Idiomas soportados | en, fr, it, de, es, pl (y en menor medida latin y neerlandes); las trazas de razonamiento solo en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelo base en safetensors en el repo original de PleIAs) |

## Arquitectura y entrenamiento

Baguettotron sigue un diseno decoder-only estandar tipo Qwen/Llama, pero con una profundidad extrema para su tamano: 80 capas con 321M de parametros totales. El equipo de PleIAs denomina internamente a esta configuracion "baguette" por su forma alargada. El modelo fue entrenado sobre 200.000 millones de tokens del dataset SYNTH, un corpus generalista completamente sintetico y abierto. El entrenamiento se realizo en 16 GPU H100 del supercomputador Jean Zay (plan de computo n°A0191016886).

Una particularidad del entrenamiento sobre SYNTH fue la presencia temprana de senales de razonamiento provenientes de MMLU y otros benchmarks industriales, lo que permitio medir empiricamente mejoras consistentes al apilar mas capas. La hipotesis del equipo es que las arquitecturas mas profundas se benefician mas de datos densos de razonamiento, al estar expuestas con mayor frecuencia a secuencias que requieren computacion intensiva o interconexion de conocimiento. El modelo fue entrenado nativamente para instrucciones con trazas de pensamiento (thinking traces), usando el estilo de instruccion estandar de Qwen con tokens especiales `<|im_start|>`, `<|im_end|>` y `<think>`.

## Capacidades

- Generacion de texto y razonamiento general con trazas de pensamiento nativas.
- Memorizacion de conocimiento enciclopedico: pipeline dedicado entrenado sobre 50.000 articulos vitales de Wikipedia.
- Retrieval-Augmented Generation (RAG) con grounding: sintaxis especial `<source_N>` para pasar referencias y generacion de citas `<ref>[quote]</ref>` en la respuesta.
- Aritmetica y resolucion de problemas matematicos simples.
- Tareas de edicion de texto.
- Extraccion de informacion.
- Escritura creativa, incluyendo ejercicios sinteticos inusuales como lipogramas o poemas con formato.
- Soporte multilingue en frances, aleman, italiano, espanol, polaco y, en menor medida, latin y neerlandes.
- Soporte de conversacion multi-turno, con recomendacion de "rolling thinking" (anadir trazas de pensamiento de cada nueva generacion descartando las anteriores).
- Posibilidad de desactivar el razonamiento sustituyendo `<think>` por `</think>`, aunque con perdida significativa de rendimiento, especialmente en memorizacion.
- No se documenta soporte de tool calling, function calling ni vision en la informacion disponible.

## Casos de uso

- Asistente conversacional ligero en el navegador: gracias a la exportacion ONNX y Transformers.js, el modelo puede ejecutarse del lado del cliente sin backend, gestionando conversaciones multi-turno con trazas de razonamiento para respuestas mas elaboradas.
- RAG con citas verificables: el modelo acepta fuentes mediante la sintaxis `<source_N>` y devuelve referencias `<ref>` que permiten auditar la respuesta, lo que lo hace adecuado para sistemas de pregunta-respuesta sobre documentacion corporativa donde la trazabilidad es critica.
- Extraccion de informacion estructurada: puede procesar textos y extraer entidades o datos concretos, util para pipelines de enriquecimiento documental en entornos con recursos limitados.
- Tareas de edicion y reescritura: correccion, reformulacion y ajuste de estilo de textos en varios idiomas europeos, apropiado para herramientas de productividad integradas en el navegador.
- Educacion y tutoria basica: resolucion de problemas aritmeticos y matematicos simples con explicacion paso a paso en las trazas de pensamiento, util para aplicaciones educativas de bajo coste computacional.
- Generacion creativa asistida: escritura de poemas, relatos cortos y ejercicios con restricciones formales (lipogramas, formato), aprovechando el entrenamiento especifico del autor en estas tareas.
- Prototipado e investigacion de SLM: su tamano reducido y licencia Apache 2.0 permiten experimentar con arquitecturas profundas y datos sinteticos sin restricciones de uso comercial.
- Despliegue en dispositivos con recursos limitados: al ser un modelo de 321M de parametros en ONNX, puede ejecutarse en portatiles y entornos edge donde modelos mayores no caben.

## Benchmarks y rendimiento

La model card del autor menciona evaluaciones en MMLU (razonamiento general y memorizacion), GSM8K (matematicas) y HotPotQA (recuperacion), indicando que Baguettotron se acerca al rendimiento de Qwen-0.6B y supera significativamente a modelos Gemma de tamano similar. Sin embargo, los valores numericos concretos se presentan en una imagen (`table_evaluation.png`) y no estan disponibles como texto en la informacion proporcionada.

| Benchmark | Baguettotron | Qwen-0.6B | Gemma similar |
|---|---|---|---|
| MMLU | no disponible (solo referencia cualitativa) | no disponible | no disponible |
| GSM8K | no disponible (solo referencia cualitativa) | no disponible | no disponible |
| HotPotQA | no disponible (solo referencia cualitativa) | no disponible | no disponible |

No se han publicado resultados numericos de benchmarks en la informacion textual disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 321M de parametros, los pesos en FP16 ocupan aproximadamente 0,65 GB y en cuantizaciones de 8 bits alrededor de 0,35 GB; el repositorio ONNX completo ocupa 6,3 GB porque incluye varias precisiones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo sin problemas. Para lotes grandes o mayor throughput, una A100 o H100 ofrecen margen de sobra.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia en el navegador mediante Transformers.js.
- Opciones de despliegue: Transformers.js (objetivo principal de esta version ONNX), ONNX Runtime, y el modelo original en PyTorch puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Baguettotron | 321M | no disponible | Apache 2.0 | ONNX / safetensors | 80 capas, entrenado en 200B tokens sinteticos, thinking nativo |
| Qwen2.5-0.5B | 494M | 32.768 tokens (tipico en la familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Referencia de rendimiento citada por el autor; Baguettotron se le acerca pese a tener menos parametros |
| Gemma 2 2B | 2.600M | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Modelo mayor; el autor afirma que Baguettotron supera a Gemma de tamano similar, no a esta variante de 2B |
| SmolLM2-360M | 362M | 8.192 tokens (familia SmolLM2) | Apache 2.0 | safetensors, GGUF | SLM comparable en tamano; no se dispone de comparacion directa en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo de 321M de parametros, puede inventar datos, especialmente en tareas de conocimiento enciclopedico fuera de su pipeline de memorizacion.
- Sesgos: al entrenarse sobre datos sinteticos generados por otros modelos, puede heredar sesgos de los generadores utilizados en SYNTH; no se documenta una evaluacion de sesgos en la informacion disponible.
- Limitaciones de idioma: las trazas de razonamiento se generan exclusivamente en ingles, aunque el texto final pueda estar en otros idiomas; el soporte de latin y neerlandes es parcial.
- Desactivar el thinking reduce significativamente el rendimiento, sobre todo en memorizacion de conocimiento enciclopedico.
- Longitud de contexto no documentada: no se especifica la ventana maxima, lo que supone un riesgo para planificar aplicaciones con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base original y de los datos SYNTH.
- Esta version ONNX es una conversion automatica de la comunidad, no oficial; puede haber diferencias de comportamiento o precision respecto al checkpoint original de PleIAs.
- No se documenta soporte de tool calling ni de agentes multi-paso, por lo que no es adecuado para pipelines agenticos complejos sin trabajo adicional.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/onnx-community/Baguettotron-ONNX
- Modelo base original: https://huggingface.co/PleIAs/Baguettotron
- Blog de anuncio de PleIAs: https://pleias.fr/blog/blogsynth-the-new-data-frontier
- Documentacion del pipeline de text-generation en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
