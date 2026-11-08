# jgchaparro/Llama-Leonida

## Resumen

Llama-Leonida es un modelo de traduccion automatica especializado en el par de idiomas griego moderno y tsaconio (tsakonian), una lengua helenica en peligro critico de desaparicion que se habla en la peninsula del Peloponeso y que desciende en gran medida del dorico laconio antiguo. Lo desarrolla el autor independiente jgchaparro en el marco del proyecto Tsakonian Digital, y deriva del modelo ilsp/Llama-Krikri-8B-Instruct-v1.5, una adaptacion al griego de Llama 3.1 8B realizada por el ILSP (Athena Research Center) con vocabulario griego ampliado. El modelo traduce en ambas direcciones (griego a tsaconio y tsaconio a griego) con un unico conjunto de pesos.

La relevancia del modelo es doble. Por un lado, aborda un caso extremo de bajos recursos: el tsaconio apenas cuenta con corpus digitales y practicamente ninguna herramienta de traduccion automatica. Por otro, demuestra una receta de entrenamiento replicable para lenguas minorizadas: ajuste supervisado sobre 19.004 pares de frases seguido de aprendizaje por refuerzo con GRPO sobre 2.132 pares adicionales, con seleccion de checkpoint guiada por chrF++ sobre validacion.

Con 8.202 millones de parametros y pesos en safetensors de 16 bits, el modelo es lo bastante pequeno para ejecutarse localmente; el autor publica ademas cuantizaciones GGUF (Q8_0, Q5_K_M, Q4_K_M) que permiten inferencia en un portatil. La licencia es Llama 3.1, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B adaptado al griego por ILSP) |
| Parametros totales | 8.202.227.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa secuencias de 768 tokens) |
| Tipos de cuantizacion | GGUF Q8_0, Q5_K_M, Q4_K_M; pesos completos en bf16/16 bits |
| Idiomas soportados | griego moderno y tsaconio (tag de idioma: el) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (modelo fusionado), GGUF (repositorio aparte), LoRA adapter (repositorio aparte) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8.202 millones de parametros construido sobre ilsp/Llama-Krikri-8B-Instruct-v1.5, que a su vez es Llama 3.1 8B con entrenamiento adicional en griego y un vocabulario griego extendido. El entrenamiento se realizo con Unsloth en dos etapas. La primera consistio en un ajuste supervisado con LoRA en bf16 (rango 64, alpha 64) aplicado a las capas de atencion y MLP, con tasa de aprendizaje 0,0002, decaimiento coseno, warmup del 3 %, AdamW de 8 bits, batch efectivo de 16, longitud maxima de secuencia de 768 tokens y hasta 3 epocas (7.128 pasos). La perdida cubre unicamente la respuesta del modelo. El corpus de esta etapa son 19.004 pares de frases tsaconio-griego usados en ambas direcciones (38.008 ejemplos), procedentes de fuentes abiertas, principalmente el sitio web de Panos Marneris, tsakonika.online. Cada 750 pasos se evaluo el adaptador sobre 400 ejemplos de validacion con chrF++; el mejor checkpoint alcanzo chrF++ 80,78.

La segunda etapa aplico Group Relative Policy Optimization (variante Dr. GRPO, sin termino KL) partiendo del adaptador de la etapa 1, sobre 2.132 pares adicionales (4.045 prompts en ambas direcciones) que la primera etapa nunca vio. Para cada prompt se muestrearon 8 traducciones a temperatura 0,9 y se recompenso cada una con la mitad de chrF++ de frase mas la mitad de (1 - TER), con bonus por coincidencia exacta y penalizaciones por errores de puntuacion, numeros, mayusculas y diacriticos no presentes en la referencia; las salidas vacias, copias del original, traducciones de longitud muy distinta o truncadas reciben recompensa cero. Se realizaron 400 actualizaciones de 16 prompts con tasa de aprendizaje 0,00001. El adaptador publicado corresponde a la actualizacion 350, con chrF++ de validacion 81,30 (frente a 80,78 de la etapa 1). El tsaconio del corpus emplea la ortografia Kostakis con diacriticos combinados (τσ̑, σ̌, κ̔, ν̇, λ̣, ν̂, α̈); los textos en otras ortografias se convirtieron y revisaron antes del entrenamiento.

## Capacidades

- Traduccion bidireccional griego moderno a tsaconio y tsaconio a griego moderno con un unico modelo.
- Generacion de la traduccion unicamente, sin texto adicional, cuando se usa la plantilla de chat de Llama 3.1 con el prompt indicado por el autor.
- Lectura y escritura de la ortografia Kostakis del tsaconio, incluidos diacriticos combinados.
- Manejo de puntuacion, cifras, mayusculas y diacriticos, reforzado explicitamente en la etapa de RL mediante penalizaciones.
- Ajuste fino adicional posible: el autor publica el adaptador LoRA sobre el modelo base, lo que permite reentrenar o adaptar a otras variantes ortograficas.
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso, vision ni audio; el modelo esta orientado a traduccion.

## Casos de uso

- Digitalizacion y traduccion de archivos de tsaconio: el modelo puede convertir documentos, transcripciones o textos historicos escritos en ortografia Kostakis a griego moderno para su catalogacion y estudio por linguistas.
- Publicacion de contenido bilingue: medios locales o proyectos culturales del Peloponeso pueden generar versiones en griego moderno de materiales redactados en tsaconio, o al reves, para senalizacion, folletos y webs comunitarias.
- Herramientas de aprendizaje del tsaconio: integrado en una aplicacion de estudio, permite al alumnado comprobar traducciones de frases y practicar la ortografia Kostakis con un modelo que responde solo con la traduccion.
- Preservacion de lengua en peligro: al ser entrenable mediante el adaptador LoRA publicado, sirve de base para incorporar nuevos pares de frases revisados por hablantes y ampliar la cobertura lexica sin reentrenar desde cero.
- Subtitulado y transcripcion de material audiovisual: traduccion de subtitulos entre griego y tsaconio en archivos de entrevistas o grabaciones de hablantes, con un modelo de 8B que cabe en hardware de consumo.
- Investigacion en traduccion de bajos recursos: punto de partida reproducible (SFT + GRPO con recompensa chrF++/TER) para experimentar con otras lenguas minorizadas o con variantes ortograficas del tsaconio.
- Procesamiento por lotes en local: con las cuantizaciones GGUF Q4_K_M o Q5_K_M se puede ejecutar en un portatil mediante llama.cpp, Ollama o LM Studio para traducir colecciones de frases sin depender de servicios en la nube.

## Benchmarks y rendimiento

| Benchmark | chrF++ | BLEU | TER |
|---|---|---|---|
| Bench V2.2 | 83,8 | 71,3 | 16,7 |
| Bench V3 | 71,4 | 53,3 | 29,4 |

| Metrica de validacion | Etapa 1 (update 0) | Update 50 | Update 100 | Update 150 | Update 350 (publicado) |
|---|---|---|---|---|---|
| chrF++ global | 80,78 | 80,92 | 80,95 | 81 (dato truncado en la model card) | 81,30 |
| TER global | 20,23 | 20,20 | 20,12 | no disponible | no disponible |
| Tsaconio a griego chrF++ | 81,31 | 81,56 | 81,50 | no disponible | no disponible |
| Griego a tsaconio chrF++ | 80,29 | 80,32 | 80,44 | no disponible | no disponible |

No se han publicado en la informacion disponible comparaciones con otros sistemas de traduccion para tsaconio ni resultados en benchmarks generales (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB de pesos, por lo que se necesitan alrededor de 18-20 GB de VRAM para cargar el modelo completo con overhead de activaciones y cache KV.
- Cuantizacion Q8_0: en torno a 8,7 GB; Q5_K_M: en torno a 5,7 GB; Q4_K_M: en torno a 4,9 GB (estimaciones a partir del tamano de parametros; el autor solo indica que el archivo Q4_K_M funciona en un portatil).
- GPU recomendadas para pesos completos: A100 40 GB, H100, L40S o RTX 4090 (24 GB). Para cuantizaciones Q4/Q5 basta una GPU de consumo con 6-8 GB de VRAM, o incluso CPU.
- Cabe en GPU de consumo: si, con cuantizaciones GGUF en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; en bf16 requiere GPU de 24 GB o superior.
- Opciones de despliegue: transformers (pesos safetensors), llama.cpp, Ollama y LM Studio (GGUF), y Unsloth para reentrenamiento del adaptador LoRA. No se documenta soporte explicito de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Leonida | 8.202 M | no disponible | Traduccion griego-tsaconio (SFT + GRPO) | llama3.1 | Hugging Face (safetensors, GGUF, LoRA) |
| ilsp/Llama-Krikri-8B-Instruct-v1.5 | aproximadamente 8.000 M | no disponible | Modelo generalista en griego (base de Leonida) | no disponible en la informacion | Hugging Face |
| Llama 3.1 8B Instruct | 8.030 M | 128.000 tokens | Modelo generalista multilingue | llama3.1 | Hugging Face, ecosistema amplio |

No se conocen en la informacion disponible otros sistemas de traduccion automatica para tsaconio con los que comparar directamente; la comparativa se limita al modelo base y al Llama 3.1 original.

## Limitaciones y advertencias

- Solo traduce de forma fiable texto en ortografia Kostakis; otras ortografias del tsaconio producen traducciones de menor calidad, segun el propio autor.
- El corpus de entrenamiento es pequeno (19.004 pares mas 2.132 en RL) y proviene principalmente de una unica fuente (tsakonika.online), lo que limita la cobertura lexica y de registros.
- Riesgo de alucinacion y de invencion de formas lexicas en palabras o construcciones poco representadas en el corpus.
- El modelo esta disenado para responder solo con la traduccion; usos fuera de la plantilla de chat indicada pueden degradar la calidad.
- No se documentan evaluaciones de sesgos; al derivar de Llama 3.1 y de un modelo ajustado al griego, puede heredar sesgos de esos modelos.
- Licencia Llama 3.1: el uso comercial esta sujeto a los terminos de la licencia comunitaria de Llama 3.1, que incluyen restricciones y obligaciones de atribucion; conviene revisarla antes de un despliegue en produccion.
- El modelo no es un sistema generalista: no se documentan capacidades de razonamiento, codigo, tool calling ni agentes, por lo que no debe emplearse como sustituto de un LLM de proposito general.
- La longitud de contexto efectiva para inferencia no esta documentada; el entrenamiento uso secuencias de 768 tokens, por lo que frases muy largas pueden degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgchaparro/Llama-Leonida
- Cuantizaciones GGUF: https://huggingface.co/jgchaparro/Llama-Leonida-GGUF
- Adaptador LoRA: https://huggingface.co/jgchaparro/Llama-Leonida-lora
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Proyecto Tsakonian Digital: https://tsakoniandigital.com
- Fuente principal del corpus (Panos Marneris): https://tsakonika.online
- Unsloth: https://github.com/unslothai/unsloth
- Ficha de terceros: https://free2aitools.com/model/jgchaparro/llama-leonida
