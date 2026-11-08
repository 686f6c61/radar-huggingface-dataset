# jgchaparro/Llama-Leonida-2-GGUF

## Resumen

Leonida 2 es un modelo de traduccion bidireccional entre griego moderno y tsakonio, una lengua helenica en grave peligro de extincion que se habla en el Peloponeso y que desciende en gran medida del dorico laconio clasico. Lo desarrolla jgchaparro en el marco del proyecto Tsakonian Digital, y esta publicado en tres formatos: el modelo fusionado de 16 bits, un adaptador LoRA y esta version cuantizada en GGUF. El modelo resuelve un problema de nicho pero tecnicamente dificil: la traduccion automatica de una lengua de muy bajos recursos, para la que no existen corpus paralelos a gran escala ni modelos comerciales disponibles.

Tecnicamente parte de ilsp/Llama-Krikri-8B-Instruct-v1.5, una adaptacion al griego de Llama 3.1 8B realizada por el ILSP (Athena Research Center) con entrenamiento adicional en griego y un vocabulario griego ampliado. Sobre esa base se aplico un ajuste fino supervisado con LoRA y despues una etapa de aprendizaje por refuerzo con GRPO, en dos fases encadenadas sobre el mismo adaptador. El resultado es un modelo de 8.202.227.776 parametros que mantiene la ventana de contexto de Llama 3.1 y que, segun el autor, cabe en un portatil en cuantizacion Q4_K_M.

La relevancia actual es doble: por un lado, demuestra que un modelo de 8B ajustado con tecnicas de bajo coste (Unsloth, LoRA, GRPO) puede alcanzar calidad de traduccion alta en una lengua con apenas decenas de miles de frases paralelas; por otro, publica la metodologia completa (seleccion de checkpoints, funcion de recompensa, intervalos de confianza por bootstrap) de forma reproducible. Los benchmarks declarados son chrF++ 83,8 / BLEU 71,3 / TER 16,7 en Bench V2.2 y chrF++ 71,4 / BLEU 53,3 / TER 29,4 en Bench V3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B, adaptado al griego por ILSP como Llama-Krikri-8B-Instruct-v1.5) |
| Parametros totales | 8.202.227.776 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1; el entrenamiento uso secuencias de 768 tokens) |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M (GGUF); el modelo base tambien existe en 16 bits (bf16) y como adaptador LoRA |
| Idiomas soportados | el (griego); en la practica griego moderno y tsakonio |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (safetensors en el repo del modelo fusionado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8B parametros, heredado de Llama 3.1 8B a traves de la adaptacion griega de ILSP. Sobre esa base se aplico un ajuste fino supervisado con LoRA en bf16, rango 64 y alpha 64, sobre las capas de atencion y MLP, usando Unsloth. La optimizacion empleo learning rate 0,0002 con decaimiento coseno y 3 % de warmup, AdamW de 8 bits, batch efectivo de 16 y longitud maxima de secuencia de 768 tokens, hasta 3 epochs (7.128 pasos), con la funcion de perdida calculada solo sobre la respuesta del modelo.

Los datos de la primera etapa son 19.004 pares de frases tsakonio-griego, cada uno usado en ambas direcciones (38.008 ejemplos), procedentes exclusivamente de fuentes abiertas, principalmente la web tsakonika.online de Panos Marneris. La segunda etapa aplica GRPO (variante Dr. GRPO, sin termino KL) partiendo del adaptador de la etapa 1: para cada prompt se muestrean 8 traducciones a temperatura 0,9 y se recompensan con una combinacion de chrF++ de frase (50 %), (1 - TER) (50 %) y un bonus por coincidencia exacta, con penalizaciones automaticas por errores de puntuacion, numeros, mayusculas y diacriticos que la referencia no comparte; salidas vacias, copias del origen, traducciones de longitud muy distinta o truncadas reciben 0. Se usaron 2.132 pares adicionales (4.045 prompts en ambas direcciones), nunca vistos en la etapa 1, con learning rate 0,00001 y 400 actualizaciones de 16 prompts.

La innovacion destacable no esta en la arquitectura sino en el pipeline: seleccion de checkpoint por chrF++ sobre 400 ejemplos de validacion cada 750 pasos (etapa 1) y cada 50 actualizaciones (etapa 2), y una funcion de recompensa densa que combina metricas de solapamiento con verificaciones simbolicas. El adaptador publicado corresponde a la actualizacion 350, con chrF++ de validacion 81,30 frente a 80,78 de la etapa 1. El texto tsakonio de todos los pares esta normalizado en la ortografia Kostakis, con diacriticos combinados (τσ̑, σ̌, κ̔, ν̇, λ̣, ν̂, α̈).

## Capacidades

- Traduccion bidireccional griego moderno a tsakonio y tsakonio a griego moderno con un unico modelo.
- Generacion de la traduccion unicamente, sin explicaciones ni texto adicional, cuando se usa el prompt y la plantilla de chat prescritos.
- Lectura y escritura de la ortografia Kostakis del tsakonio, incluidos diacriticos combinados.
- Manejo de vocabulario de bajo recurso y de terminologia especifica de una lengua dorica.
- Conversacion mediante la plantilla de chat de Llama 3.1 (el modelo es de tipo conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No dispone de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido declarados en la informacion disponible.

## Casos de uso

- Traduccion de documentacion y materiales didacticos: el modelo puede verter textos entre griego moderno y tsakonio para escuelas, talleres y asociaciones culturales, aprovechando que esta entrenado sobre la principal fuente escrita abierta de la lengua.
- Digitalizacion de archivo y patrimonio oral: transcripciones en tsakonio pueden pasarse a griego moderno para catalogacion y busqueda, y viceversa para devolver materiales a la comunidad en su lengua.
- Publicacion bilingue en linea: integrado en un CMS o en una web comunitaria, permite generar versiones gemelas de articulos y avisos en ambos idiomas con una sola inferencia por direccion.
- Subtitulado y traduccion de entrevistas: grabaciones de hablantes de tsakonio pueden transcribirse y traducirse al griego moderno para investigadores y medios, con el modelo ejecutandose en local para preservar la privacidad de los hablantes.
- Apoyo a la ensenanza de la lengua: generacion de pares de frases y ejercicios de traduccion para cursos de tsakonio, usando la ortografia Kostakis como referencia coherente.
- Investigacion en linguistica computacional de bajos recursos: el pipeline completo (LoRA + GRPO con recompensa basada en chrF++ y TER) sirve como receta reproducible para otras lenguas en peligro con corpus paralelos pequenos.
- Despliegue en local sin conexion: la cuantizacion Q4_K_M permite usar el modelo en portatiles durante trabajo de campo en zonas sin conectividad.

## Benchmarks y rendimiento

Resultados declarados por el autor, con decodificacion greedy y sacreBLEU 2.5.1; los intervalos de confianza al 95 % provienen de bootstrap y las comparaciones con modelos anteriores usan bootstrap emparejado sobre las mismas traducciones.

| Benchmark | BLEU | chrF++ | TER |
|---|---|---|---|
| Tsakonian Digital Bench V2.2 | 71,3 | 83,8 | 16,7 |
| Tsakonian Digital Bench V3 | 53,3 | 71,4 | 29,4 |

Evolucion durante el entrenamiento por refuerzo (validacion, 400 ejemplos):

| Actualizacion | chrF++ validacion | TER | Tsakonio a griego chrF++ | Griego a tsakonio chrF++ |
|---|---|---|---|---|
| 0 (etapa 1) | 80,78 | 20,23 | 81,31 | 80,29 |
| 50 | 80,92 | 20,20 | 81,56 | 80,32 |
| 100 | 80,95 | 20,12 | 81,50 | 80,44 |
| 150 | 81,12 | 19,91 | 81,67 | 80,60 |
| 200 | 81,23 | 19,76 | 81,76 | 80,74 |
| 250 | 81,25 | 19,78 | 81,91 | 80,64 |
| 300 | 81,16 | 19,82 | 81,75 | 80,61 |
| 350 (seleccionada) | 81,30 | 19,67 | 81,79 | 80,84 |
| 400 | 81,17 | 19,84 | 81,80 | 80,58 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K; las cifras anteriores son especificas de los conjuntos de evaluacion del proyecto y solo son comparables dentro de un mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB en Q8_0, 6-7 GB en Q5_K_M y 5-6 GB en Q4_K_M (estimacion a partir del tamano de pesos; no confirmada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M; RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 para Q8_0 con holgura; A100 o H100 para servir varias instancias o el modelo en 16 bits.
- Cabe en GPU consumer: si, con Q4_K_M en tarjetas de 8 GB o mas; segun el autor, el archivo Q4_K_M funciona en un portatil.
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama run hf.co/jgchaparro/Llama-Leonida-2-GGUF:Q4_K_M`), LM Studio, y el modelo fusionado en 16 bits con transformers, vLLM o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Leonida-2 (este) | 8,2B | no disponible (base Llama 3.1) | Traduccion griego-tsakonio | llama3.1 | GGUF, safetensors, LoRA |
| Llama-Leonida-Beta | no disponible | no disponible | Traduccion griego-tsakonio | no disponible | GGUF |
| Llama-Leonida (primera version) | no disponible | no disponible | Traduccion griego-tsakonio | no disponible | GGUF |
| ilsp/Llama-Krikri-8B-Instruct-v1.5 (base) | 8B | no disponible | Modelo generalista en griego | no disponible | safetensors |

No se conocen en la informacion disponible modelos genericos comparables especializados en tsakonio; los unicos alternativos documentados son las versiones anteriores del propio proyecto.

## Limitaciones y advertencias

- Sesgos: entrenado exclusivamente sobre fuentes abiertas, principalmente la web de Panos Marneris, lo que concentra el estilo, el lexico y las variantes en una sola tradicion textual; otras variedades o registros del tsakonio pueden estar infrarepresentados.
- Riesgo de alucinacion: en traduccion de lenguas de bajo recurso, el modelo puede producir formas plausibles pero inexistentes, especialmente con vocabulario fuera del corpus de entrenamiento; la recompensa por coincidencia exacta y las penalizaciones mitigan parte de este problema, pero no lo eliminan.
- Ortografia: solo rinde bien con la ortografia Kostakis y sus diacriticos combinados; textos en otras ortografias se traducen peor, y parte del corpus original tuvo que convertirse y revisarse manualmente.
- Contexto: el entrenamiento uso secuencias de 768 tokens, muy por debajo de la ventana nativa del modelo base; frases o parrafos largos pueden degradar la calidad aunque el modelo acepte entradas mayores.
- Idioma: el tag de idioma declarado es solo `el`; no hay capacidades multilingues ni traduccion desde o hacia el castellano documentadas.
- Licencia: Llama 3.1 Community License, con las restricciones habituales de la familia Llama (incluidas clausulas de uso aceptable y requisitos de atribucion); revisar antes de uso comercial.
- Formato de salida: el modelo esta disenado para devolver unicamente la traduccion; fuera del prompt prescrito puede generar texto adicional o incumplir el formato.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 8 de noviembre de 2026; no hay evidencia independiente de uso en produccion.
- Benchmarks: las cifras solo son comparables dentro del mismo benchmark del proyecto y no equivalen a metricas estandar de la literatura.

## Enlaces

- Modelo GGUF: https://huggingface.co/jgchaparro/Llama-Leonida-2-GGUF
- Modelo fusionado 16 bits: https://huggingface.co/jgchaparro/Llama-Leonida-2
- Adaptador LoRA: https://huggingface.co/jgchaparro/Llama-Leonida-2-lora
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Fuente principal del corpus: https://tsakonika.online
- Proyecto Tsakonian Digital: https://tsakoniandigital.com
- Version anterior (Beta): https://huggingface.co/jgchaparro/Llama-Leonida-Beta-GGUF
- Version inicial: https://huggingface.co/jgchaparro/Llama-Leonida-GGUF
- Unsloth: https://github.com/unslothai/unsloth
