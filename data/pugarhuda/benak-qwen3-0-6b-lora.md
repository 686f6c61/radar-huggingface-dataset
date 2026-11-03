# PugarHuda/benak-qwen3-0.6b-lora

## Resumen

Benak-qwen3-0.6b-lora es un adaptador LoRA sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por PugarHuda en el marco del reto Build with Beam. El objetivo del adaptador no es mejorar la capacidad de razonamiento del modelo base, sino modificar el idioma en el que el modelo genera su cadena de pensamiento (bloque `<think>`): se entrena para que el razonamiento se produzca en el idioma del usuario en lugar de derivar al ingles. Esta dirigido a lenguas del sudeste asiatico: indonesio, javanes, sundanés, tailandes, malayo, tagalo, vietnamita y cebuano.

El adaptador se entrena sobre el conjunto de datos PugarHuda/benak, compuesto por trazas de razonamiento (`sea_thinking`) destiladas de Beam-1.0-501B-A23B, filtradas para conservar solo respuestas correctas cuyo razonamiento sea al menos un 80% en el idioma del usuario. Se trata de un adaptador de investigacion y prueba de concepto, con 982 ejemplos de entrenamiento, una sola epoca y un rango LoRA de 16, entrenado en una GTX 1660 SUPER de 6 GB.

Su relevancia actual radica en que aborda un problema poco tratado: los modelos multilingues pequenos tienden a razonar en ingles incluso cuando se les consulta en otro idioma. Este adaptador demuestra que un ajuste LoRA muy ligero puede desplazar la lengua del razonamiento hacia el idioma de entrada, aunque a costa de una precision matematica que sigue siendo baja en el modelo base de 0.6B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3 |
| Parametros totales | 0.6B en el modelo base; el adaptador LoRA no declara su numero de parametros (r=16 sobre proyecciones de atencion y MLP) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | id, jv, su, th, ms, tl, vi, ceb |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only del que no se detallan en la informacion disponible ni el numero exacto de capas ni la composicion del corpus original. El ajuste es un LoRA de rango 16 aplicado a todas las proyecciones de atencion y MLP, con learning rate 0.0002, longitud maxima de 768 tokens y batch efectivo de 8. El entrenamiento consistio en una sola epoca sobre 982 ejemplos, con autocast fp16, en una GTX 1660 SUPER de 6 GB, durante 4723 segundos, con una perdida final registrada de 1.5314.

La innovacion tecnica no esta en la arquitectura sino en la estrategia de datos: se parte de trazas de razonamiento generadas por Beam-1.0-501B-A23B y se filtran para conservar unicamente aquellas respuestas correctas cuyo bloque de pensamiento sea mayoritariamente (≥80%) en el idioma del usuario. El objetivo es transferir el idioma del razonamiento, no el conocimiento matematico. El codigo de destilacion se encuentra en `distill.py` dentro del repositorio del dataset.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento (bloque `<think>`), heredado de Qwen3.
- Razonamiento en el idioma del usuario para id, jv, su, th, ms, tl, vi y ceb, sin necesidad de instruccion explicita de idioma en el prompt (condicion C0 del conjunto Benak).
- Capacidades multilingues limitadas a los ocho idiomas del conjunto de entrenamiento.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del modo de pensamiento nativo del modelo base.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Razonamiento en lenguas regionales de Indonesia: el adaptador permite que un asistente responda y razone en javanes o sundanés en lugar de derivar al ingles, util para administraciones locales y servicios publicos en esas lenguas.
- Educacion en tailandes: el modelo puede generar explicaciones paso a paso en tailandes dentro del bloque de pensamiento, lo que facilita la revision pedagogica del razonamiento en la lengua del estudiante.
- Prototipado de asistentes para el sudeste asiatico: al ser un adaptador ligero sobre 0.6B, permite experimentar con inferencia en hardware modesto (una GPU de 6 GB) antes de escalar a modelos mayores.
- Investigacion sobre idioma del razonamiento: sirve como linea base reproducible para medir el desplazamiento de la lengua de pensamiento mediante clasificadores como GlotLID.
- Traduccion asistida con trazabilidad: el bloque `<think>` en el idioma de origen permite auditar el proceso de traduccion o de respuesta en la lengua del usuario.
- Filtrado y anotacion de datos multilingues: el adaptador puede generar razonamientos en la lengua objetivo para construir o ampliar conjuntos de datos de destilacion en idiomas de bajos recursos.

## Benchmarks y rendimiento

Los datos disponibles corresponden a una evaluacion propia sobre 15 problemas matematicos fuera del conjunto de entrenamiento, sin instruccion de idioma en el prompt (condicion C0), una muestra por problema e idioma con temperatura 0.6. La lengua del razonamiento se mide con GlotLID sobre el bloque `<think>`.

| Idioma | Proporcion de ingles en el pensamiento (antes → despues) | Proporcion en el idioma (antes → despues) | Precision (antes → despues) |
|---|---|---|---|
| Indonesio | 97% → 7% | 2% → 84% | 20.0% → 26.7% |
| Javanes | 92% → 0% | 6% → 58% | 6.7% → 6.7% |
| Sundanés | 94% → 1% | 5% → 19% | 6.7% → 6.7% |
| Tailandes | 97% → 0% | 2% → 100% | 0.0% → 20.0% |
| Todos | 95% → 2% | 4% → 66% | 8.3% → 15.0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador se entrena en una GTX 1660 SUPER de 6 GB con fp16, por lo que la inferencia del modelo base de 0.6B en fp16 cabe holgadamente en GPUs consumer de 6-8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB (GTX 1660 SUPER, RTX 3060, RTX 4060); para mayor throughput, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 6 GB o mas.
- Opciones de despliegue: PEFT sobre transformers para cargar el adaptador; llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertirlo a GGUF; vLLM y TGI son viables tras la fusion del adaptador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el entrenamiento completo tardo 4723 s en una GTX 1660 SUPER.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benak-qwen3-0.6b-lora | 0.6B (base) + LoRA | no disponible | Razonamiento en lenguas del sudeste asiatico | apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3-0.6B | 0.6B | no disponible en la informacion | Modelo base multilingue con modo de pensamiento | apache-2.0 | HuggingFace |
| Beam-1.0-501B-A23B | 501B totales / 23B activos | no disponible | Modelo profesor usado para destilar las trazas | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion se basa en 15 problemas por idioma con una sola muestra, lo que implica varios puntos de ruido; los resultados deben interpretarse como indicativos.
- La precision matematica del modelo base de 0.6B es baja (8.3% global antes del ajuste, 15.0% despues); el adaptador no pretende mejorar la capacidad de razonamiento, solo el idioma en que se expresa.
- El sundanés apenas alcanza un 19% de razonamiento en el idioma tras el ajuste, muy por debajo del resto.
- El adaptador solo cubre ocho idiomas del sudeste asiatico; fuera de ese conjunto no hay garantia de comportamiento.
- Riesgo de alucinacion inherente a un modelo de 0.6B, especialmente en problemas de varios pasos.
- No se documentan sesgos especificos, pero al derivarse de trazas de un modelo profesor pueden heredarse sesgos de este.
- Licencia apache-2.0, que permite uso comercial, pero el adaptador se distribuye como PEFT y requiere cargar el modelo base Qwen3-0.6B, sujeto a su propia licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PugarHuda/benak-qwen3-0.6b-lora
- Dataset Benak: https://huggingface.co/datasets/PugarHuda/benak
- Demo (Space Benak): https://huggingface.co/spaces/PugarHuda/benak
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
