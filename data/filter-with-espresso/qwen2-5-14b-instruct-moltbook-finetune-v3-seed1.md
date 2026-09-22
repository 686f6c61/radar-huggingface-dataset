# filter-with-espresso/Qwen2.5-14B-Instruct-moltbook-finetune-v3-seed1

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) entrenado mediante ajuste supervisado (SFT) sobre el modelo base unsloth/Qwen2.5-14B-Instruct. Lo publica el usuario filter-with-espresso bajo el identificador Qwen2.5-14B-Instruct-moltbook-finetune-v3-seed1, con un peso de repositorio de 1,1 GB, lo que confirma que solo se distribuyen los pesos del adaptador y no los 14,7 B de parametros del modelo subyacente. La libreria declarada es peft y el entrenamiento se ha realizado con el stack Unsloth + TRL, segun las etiquetas del repositorio.

El modelo base, Qwen2.5-14B-Instruct, es un transformer decoder-only denso de 14,7 B de parametros con 32.768 tokens de contexto nativo (ampliable a 131.072 con YaRN), soporte para 29 idiomas, licencia Apache 2.0 y capacidades de generacion de codigo, matematicas, salida estructurada en JSON y function calling. El adaptador hereda, en principio, todas esas capacidades, aunque el efecto real del ajuste no esta documentado en ningun sitio.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card del autor es la plantilla por defecto de HuggingFace sin rellenar, no se declara licencia, idiomas, dataset, hiperparametros ni evaluacion, y el repositorio acumula 0 descargas y 0 likes desde su creacion. Se trata, por tanto, de un artefacto de experimentacion (la nomenclatura v3-seed1 sugiere un barrido de semillas) y no de un modelo listo para produccion sin una validacion previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5) + adaptador LoRA sobre PEFT |
| Parametros totales | 14,7 B en el modelo base; el adaptador anade un numero de parametros no declarado (repo de 1,1 GB) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativos y hasta 131.072 con YaRN en el modelo base; no declarado para el adaptador |
| Tipos de cuantizacion | No declarados para el adaptador. El modelo base admite 4/8 bits (bitsandbytes), AWQ, GPTQ, GGUF (Q2 a Q8) y MLX |
| Idiomas soportados | No declarados para el adaptador. El modelo base documenta 29 idiomas, entre ellos espanol, ingles, chino, frances, aleman, portugues, italiano, ruso, japones, coreano, arabe y vietnamita |
| Licencia | No disponible para el adaptador. El modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | peft (framework PEFT 0.21.0) |
| Modelo base | unsloth/Qwen2.5-14B-Instruct |
| Tamano del repositorio | 1,1 GB |
| Tarea declarada | text-generation (conversacional) |
| Etiquetas | peft, safetensors, lora, sft, transformers, trl, unsloth |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango no declarado aplicado sobre un transformer decoder-only denso. El modelo base Qwen2.5-14B-Instruct emplea 48 capas, atencion con query grouping (GQA) con 40 cabezas de consulta y 8 de clave/valor, RoPE para codificacion posicional, activacion SwiGLU y normalizacion RMSNorm, con un vocabulario de aproximadamente 151.000 tokens. El entrenamiento del base, segun la documentacion publica de Qwen, se realizo sobre del orden de 18 billones de tokens, con fases posteriores de ajuste por instrucciones y preferencias. El adaptador, por su parte, se ha entrenado con Unsloth y TRL (SFTTrainer) segun las etiquetas del repositorio.

No hay informacion disponible sobre el rango (r), el valor de alpha, el dropout, las capas objetivo, la tasa de aprendizaje, el numero de epocas, la composicion del dataset "moltbook" ni el numero de tokens de entrenamiento. Tampoco se documenta si hubo una fase posterior de DPO, RLHF u optimizacion por preferencias, ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal. El unico dato estructural inferible es el tamano del repositorio: 1,1 GB en safetensors es coherente con un LoRA de rango relativamente alto (del orden de r=128) aplicado a las siete proyecciones lineales de las 48 capas en precision de 16 bits, pero se trata de una estimacion, no de un dato declarado por el autor.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento y matematicas: el base Qwen2.5-14B-Instruct esta entrenado especificamente para tareas de razonamiento aritmetico y logico de varios pasos.
- Generacion y comprension de codigo en lenguajes habituales (Python, JavaScript, C++, Java, etc.), con soporte de relleno de codigo.
- Salida estructurada: el base genera JSON de forma fiable, lo que facilita su integracion en pipelines con esquemas definidos.
- Function calling / tool calling: el base Qwen2.5 soporta el formato de herramientas de Hermes, lo que permite invocacion de funciones externas.
- Agentes y razonamiento multi-paso: el base puede encadenar llamadas a herramientas y mantener estado a lo largo de una tarea.
- Capacidades multilingues: 29 idiomas documentados en el base, con buen rendimiento en espanol, ingles, chino y lenguas europeas.
- Contexto largo: hasta 32.768 tokens de serie, ampliables con YaRN.
- Efecto real del ajuste LoRA: no disponible. No hay evaluacion publicada que confirme que el adaptador mejora, mantiene o degrada cualquiera de las capacidades anteriores.

## Casos de uso

- Evaluacion y reproducibilidad de investigacion en PEFT: la nomenclatura seed1 indica que forma parte de un barrido de semillas; el adaptador sirve como punto de comparacion para medir la varianza entre semillas de un mismo ajuste sobre Qwen2.5-14B.
- Servicio de inferencia con multiples adaptadores: gracias al soporte LoRA en caliente de vLLM y TGI, se puede cargar este adaptador junto al base y servir variantes conmutables sin duplicar los 29 GB de pesos del modelo principal.
- Atencion al cliente multilingue: con 32.768 tokens de contexto y 29 idiomas en el base, el modelo puede gestionar conversaciones largas con historial extenso y clientes en distintos idiomas, siempre que se valide antes el efecto del ajuste sobre el tono y la factualidad.
- Analisis de documentos largos y RAG: ingestion de informes tecnicos, contratos o documentacion de producto de decenas de miles de tokens, con generacion de resumenes y respuestas citadas.
- Extraccion de datos estructurados: conversion de texto libre a JSON con esquema fijo (facturas, curricula, tickets, registros medicos anonimizados) aprovechando la capacidad de salida estructurada del base.
- Agentes automatizados con herramientas: orquestacion de llamadas a APIs internas, busqueda web o bases de datos en tareas de varios pasos, usando el formato de tool calling de Qwen2.5.
- Asistencia a la programacion en CI/CD: revision automatizada de pull requests, generacion de tests unitarios y explicacion de diffs, integr ado como paso opcional en la pipeline.
- Destilacion y generacion de datos sinteticos: uso del adaptador para generar datasets de entrenamiento en un dominio concreto, partiendo de su especializacion sobre el corpus "moltbook".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna seccion de evaluacion completada, y no existe ningun conjunto de resultados verificable para MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra prueba estandar. Cualquier cifra de rendimiento del modelo base (Qwen2.5-14B-Instruct) deberia consultarse en el informe tecnico oficial de Qwen, no en este repositorio, y no es extrapolable al adaptador sin medirlo.

## Requisitos de hardware

- Solo el adaptador: 1,1 GB en disco. No es utilizable sin el modelo base.
- Inferencia en bf16 con el base completo: aproximadamente 29,5 GB de pesos mas cache KV. Con 32.768 tokens de contexto y GQA de 8 cabezas KV, la cache KV en fp16 ronda los 6 GB, por lo que conviene reservar 36-40 GB de VRAM.
- GPU recomendadas para bf16: H100 80 GB, A100 80 GB, A6000 48 GB, L40S 48 GB. Una A100 40 GB queda muy justa con contexto largo.
- Multi-GPU consumer: 2 x RTX 4090 o 2 x RTX 3090 (24 GB cada una) con tensor parallelism permiten cargar el base en bf16.
- Cuantizacion Q8_0 (GGUF): en torno a 15-16 GB de pesos; cabe en una RTX 4090, RTX 3090 o L40S con contexto moderado.
- Cuantizacion Q4_K_M: aproximadamente 9 GB de pesos; cabe en RTX 4070 Ti Super 16 GB, RTX 4080, RTX 3090 o RTX 4090, y permite contexto largo en 24 GB.
- Apple Silicon: los Mac con memoria unificada de 32 GB o mas (M2 Max, M3 Max, M2 Ultra) pueden ejecutar la version MLX o GGUF del base con el adaptador fusionado.
- Opciones de despliegue: vLLM con --enable-lora (carga del adaptador en caliente sobre el base en bf16), TGI con soporte LoRA, transformers + peft para prototipado, llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF, y Unsloth para continuar el entrenamiento.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Evaluacion publicada | Notas |
|---|---|---|---|---|---|---|
| filter-with-espresso/Qwen2.5-14B-Instruct-moltbook-finetune-v3-seed1 | 14,7 B (base) + LoRA no declarado | 32.768 (base) | No disponible | No declarados | No | Adaptador SFT sin documentar, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | 14,7 B | 32.768, ampliable a 131.072 con YaRN | Apache 2.0 | 29 | Si, informe tecnico oficial | Base de referencia, soporte de tool calling y salida JSON |
| Mistral-Nemo-Instruct-2407 | 12,2 B | 128.000 | Apache 2.0 | Multilingue (incluye espanol) | Si, model card oficial | Alternativa de tamano similar con contexto mayor de serie |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 | Licencia comunitaria Llama 3.1 | 8 idiomas oficiales | Si, model card oficial | Menor coste de inferencia, licencia con restricciones para grandes despliegues |

La comparacion de rendimiento entre este adaptador y cualquier alternativa no es posible: no existe ninguna evaluacion publicada del adaptador. La unica comparacion legitima es estructural (parametros, contexto, licencia) y, en ese plano, el adaptador hereda las caracteristicas del base Qwen2.5-14B-Instruct con el riesgo anadido de que el ajuste haya degradado alguna capacidad sin que nadie lo haya medido.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de HuggingFace: no declara desarrollador, financiacion, tipo de modelo, idiomas, licencia ni uso previsto.
- No hay evaluacion publicada. Se desconoce si el SFT mejora el modelo base o lo degrada por sobreajuste, olvido catastrofico o colapso de formato.
- El dataset de entrenamiento "moltbook" no esta documentado: se desconoce su origen, su licencia, su composicion linguistica y sus posibles sesgos. Esto es un riesgo legal y etico si se usa en produccion.
- La licencia del adaptador no esta declarada. Aunque el modelo base es Apache 2.0, el autor de un ajuste derivado puede reclamar condiciones distintas; sin una licencia explicita, el uso comercial es juridicamente ambiguo.
- 0 descargas y 0 likes: el artefacto no ha sido validado por la comunidad ni reproducido por terceros.
- El repositorio corresponde a una unica semilla (seed1) de una version 3, lo que apunta a un experimento en curso y no a un modelo estable.
- El adaptador requiere el modelo base para funcionar; no es un modelo autonomo y no se puede desplegar por si solo.
- Riesgo de alucinacion inherente a los modelos de 14 B: sin una capa de verificacion o RAG, las respuestas factuales pueden ser incorrectas con alta confianza.
- El contexto efectivo esta limitado a 32.768 tokens salvo que se configure explicitamente YaRN, lo que exige modificar la configuracion de RoPE.
- Los idiomas soportados por el adaptador no estan verificados; el ajuste podria haber reducido el multilingüismo del base si el dataset era monolingue.
- Puede que el ajuste haya modificado la plantilla de chat o los tokens especiales; conviene revisar la chat template antes de integrarlo en un pipeline.
- Las fechas del repositorio (creacion el 2026-09-22) conviene verificarlas, ya que pueden reflejar un error de metadatos o un artefacto de subida automatizada.
- No se declaran los hiperparametros de entrenamiento, lo que impide reproducir el ajuste o juzgar su calidad metodologica.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/filter-with-espresso/Qwen2.5-14B-Instruct-moltbook-finetune-v3-seed1
- Modelo base (version de Unsloth): https://huggingface.co/unsloth/Qwen2.5-14B-Instruct
- Modelo base (version oficial de Qwen): https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (documentacion del metodo filter() de JavaScript en MDN y W3Schools, una banda de rock estadounidense y filtros faciales de realidad aumentada). No se ha localizado ningun paper, blog, repositorio ni demo especifico de este adaptador.
