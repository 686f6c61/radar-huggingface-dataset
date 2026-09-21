# clarezahermetica/landling-3.0-cp2

## Resumen

Landling 3.0 — checkpoint publico 2 (`landling-3.0-cp2`) es un adaptador LoRA de tipo PEFT entrenado sobre `Qwen/Qwen2.5-7B-Instruct`, publicado por el usuario `clarezahermetica`. No se trata de un modelo completo ni de una version final: el propio autor lo describe como un checkpoint de desarrollo conservado como registro inspeccionable. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en formato safetensors, por lo que su uso requiere descargar aparte el modelo base de 7B.

El adaptador forma parte del sistema mas amplio denominado Landling, que combina el modelo con un corpus de recuperacion (Raft) y fuentes documentales auditadas (dos libros y tweets recopilados). El entrenamiento se realizo con QLoRA en una sola epoca, rango 16, alpha 32, dropout 0,05 y pesos NF4 de 4 bits, con una longitud maxima de secuencia de 1.024 tokens y un corpus supervisado de 1.018 ejemplos conversacionales efectivos.

Su relevancia es limitada y experimental: se trata de un adaptador con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y sin resultados de benchmarks estandar publicados. Su interes principal es documental, como ejemplo de flujo de trabajo QLoRA + RAG condicional sobre un modelo base abierto de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible para el adaptador (rango LoRA 16, alpha 32); el modelo base tiene 7,61B de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens durante el entrenamiento; el modelo base soporta 131.072 tokens (128K) |
| Tipos de cuantizacion | Entrenado con QLoRA NF4 de 4 bits; el adaptador se distribuye en safetensors; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la del modelo base Qwen2.5-7B-Instruct es Apache 2.0, pero el adaptador no declara licencia propia) |
| Formato de pesos | Safetensors (adaptador PEFT; `adapter_model.safetensors` + configuracion PEFT) |
| Tamano del repositorio | 0,1 GB |
| Libreria | `peft` |
| Pipeline | `text-generation` |
| Modelo base | `Qwen/Qwen2.5-7B-Instruct` |
| Fecha de creacion | 2026-09-21 (segun metadatos de HuggingFace) |

Nota: las cifras marcadas como del modelo base corresponden a la ficha publica de `Qwen/Qwen2.5-7B-Instruct` y no se detallan en este repositorio.

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05, aplicado sobre las capas de un transformer decoder-only con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm, que es la arquitectura de Qwen2.5. El entrenamiento se ejecuto en una sola epoca con QLoRA: pesos base cuantizados en NF4 de 4 bits y adaptadores entrenados en precision superior, con una longitud maxima de secuencia de 1.024 tokens. El corpus supervisado consta de 1.018 ejemplos conversacionales efectivos tras la fase de preparacion. No se documenta el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de la mencion a dos libros y tweets recopilados.

El flujo de trabajo se preparo con la herramienta Raft y se ejecuto mediante el flujo `opbdh` sobre Runpod. La seleccion del checkpoint se hizo con una revision ciega de 24 preguntas que comparo cuatro condiciones: adaptador de 3B sin recuperacion, 3B con recuperacion, 7B sin recuperacion y 7B con recuperacion. El adaptador de 7B seleccionado obtuvo 7,5 victorias fraccionarias; las condiciones de 7B superaron a las de 3B por 13,0 a 7,0, mientras que las condiciones con y sin recuperacion empataron 10,0 a 10,0. El autor indica que la recuperacion (Raft) sobrecorregia algunas respuestas, por lo que la siguiente iteracion plantea un enrutado condicional con procedencia visible en lugar de aplicar grounding de forma universal.

## Capacidades

- Generacion de texto conversacional en formato de asistente, heredada del ajuste por instrucciones de Qwen2.5-7B-Instruct.
- Respuestas de caracter mas "filosoficamente expansivo" que el checkpoint anterior (CP1), segun la propia model card.
- Conversacion multiturno basica, condicionada por el modelo base y por el corpus de 1.018 ejemplos con los que se ajusto el adaptador.
- Recuperacion aumentada (Raft) como parte del sistema Landling, aunque el corpus de recuperacion no se incluye en este repositorio.
- Uso de material documental auditado (libros, ensayos y publicaciones sueltas) como fuente de recuperacion, no como dialogo generado.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-7B-Instruct si lo soporta, pero no hay evidencia de que el adaptador lo preserve.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible.
- Capacidades multilingues: no disponibles (la model card no especifica idiomas).

## Casos de uso

- Investigacion sobre ajuste fino eficiente: el repositorio sirve como ejemplo reproducible de un flujo QLoRA completo (preparacion con Raft, ejecucion con opbdh, seleccion ciega de checkpoint) sobre un modelo base de 7B.
- Analisis de deriva estilistica en adaptadores: los 1.018 ejemplos y la comparacion de 24 preguntas permiten estudiar como un corpus pequeno modifica el tono de un asistente neutro hacia uno mas expansivo.
- Experimentos de RAG condicional: el autor plantea enrutar la recuperacion de forma selectiva; el checkpoint es un punto de partida para medir cuando el grounding ayuda y cuando sobrecorrige.
- Prototipado de asistentes conversacionales de nicho: al ser un adaptador pequeno (0,1 GB) sobre un base de 7B, permite iterar rapidamente en entornos de desarrollo con una sola GPU.
- Evaluacion de tecnicas de mitigacion de hedging: dado que 14 de 24 respuestas contenian cautelas ("can be"), es util como caso de estudio para medir y corregir lenguaje evasivo.
- Docencia y formacion en IA open source: sirve para ilustrar la diferencia entre un modelo base, un adaptador LoRA y un checkpoint de desarrollo, asi como la separacion entre voz y conocimiento que propone el autor.
- Pruebas de integracion de PEFT en pipelines propios: el fragmento de carga con `PeftModel.from_pretrained` permite validar rapidamente el stack transformers + peft en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

La unica evaluacion documentada es interna y cualitativa, basada en una revision ciega de 24 preguntas con respuestas puntuadas de forma fraccionaria:

| Comparacion | Resultado |
|---|---|
| Adaptador 7B seleccionado (frente a las otras tres condiciones) | 7,5 victorias fraccionarias |
| Condiciones 7B frente a condiciones 3B | 13,0 a 7,0 |
| Con recuperacion (grounded) frente a sin recuperacion (adapter-only) | 10,0 a 10,0 (empate) |
| Respuestas del adaptador 7B con cautela detectable ("hedge") | 14 de 24, incluidas 7 apariciones de "can be" |

Estos datos no son comparables con benchmarks publicos y no permiten situar el modelo frente a alternativas de la misma categoria.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero requiere cargar el modelo base `Qwen/Qwen2.5-7B-Instruct` para funcionar.
- VRAM estimada para el modelo base completo en bf16: aproximadamente 15-16 GB de pesos, mas cache KV (dependiente de la longitud de contexto y del tamano de lote).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada con cuantizacion de 4 bits (NF4/GPTQ/AWQ): aproximadamente 5-6 GB, suficiente para GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super o RTX 4090.
- GPU recomendadas para precision completa o servicio concurrente: A100 40/80 GB, H100 80 GB, L40S.
- Despliegue con transformers + peft: es la via documentada en la model card (carga del base en bf16 o fp16 con `device_map="auto"` y `PeftModel.from_pretrained`).
- Despliegue con vLLM: posible mediante soporte de LoRA, fusionando el adaptador o cargandolo como modulo, aunque no esta documentado por el autor.
- Despliegue con llama.cpp u Ollama: requiere fusionar el adaptador con el base y convertir a GGUF; no se distribuyen pesos en ese formato.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| landling-3.0-cp2 | Adaptador LoRA (base 7,61B) | 1.024 tokens de entrenamiento; 128K en el base | No disponible | 0 descargas, checkpoint de desarrollo, requiere el base |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 131.072 tokens | Apache 2.0 | Modelo base publico, con benchmarks y amplia adopcion |
| Condicion 3B de Landling (referenciada en la model card) | Adaptador LoRA sobre Qwen2.5-3B-Instruct | No disponible | No disponible | Mencionada solo como condicion de comparacion; no se enlaza repositorio |
| Otros adaptadores LoRA sobre Qwen2.5-7B | Variable | Depende del base | Habitualmente la del base | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas, ya que no hay benchmarks publicados ni datos de latencia o throughput.

## Limitaciones y advertencias

- No es una version final: el propio autor lo etiqueta como checkpoint de desarrollo y no como release.
- Corpus de entrenamiento muy reducido (1.018 ejemplos efectivos), lo que eleva el riesgo de sobreajuste al estilo y a los temas concretos de ese conjunto.
- Deriva estilistica documentada: 14 de 24 respuestas del adaptador contenian cautelas detectables, con siete usos de "can be", heredadas del tono neutro del modelo base de 7B.
- El conocimiento no esta actualizado por defecto; cargar solo el adaptador no aporta corpus Raft ni acceso a internet en vivo.
- El corpus de recuperacion no esta incluido en el repositorio, por lo que el comportamiento observado en las condiciones "grounded" no es reproducible con este artefacto aislado.
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial, aunque el modelo base sea Apache 2.0.
- Idiomas soportados no especificados: no hay garantia de comportamiento correcto fuera de los idiomas presentes en el corpus de ajuste.
- Longitud de contexto de entrenamiento de solo 1.024 tokens: el adaptador no ha sido ajustado para ventanas largas, aunque el base soporte 128K.
- Riesgo de alucinacion inherente a un modelo de 7B con ajuste ligero y sin verificacion factual en el adaptador.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5-7B-Instruct, hereda los sesgos del corpus de preentrenamiento de ese modelo.
- Adopcion nula (0 descargas, 0 likes): no existe validacion independiente de su comportamiento.
- La fecha de creacion registrada (2026-09-21) y las fechas de actualizacion son las que constan en los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/clarezahermetica/landling-3.0-cp2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Herramienta de preparacion Raft: https://github.com/lumpenspace/raft
- Flujo de ejecucion opbdh: https://github.com/lumpenspace/opbdh

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
