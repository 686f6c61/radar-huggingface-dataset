# nathaninline/Inkling-2-Mini-NVFP4-Basalt

## Resumen

Inkling-2-Mini-NVFP4-Basalt es un empaquetado cuantizado del modelo Inkling 2 Mini de Thinking Machines Lab (26B parametros, arquitectura de mezcla de expertos) en formato `.basalt` version 2, orientado a ejecutarse en una unica GPU de 16 GB. Lo publica el usuario nathaninline y deriva del pack original de Jesus Gulfo (jesdga/Inkling-2-Mini-Basalt), incorporando un parche de motor que mantiene el modelo dentro de esa restriccion de memoria. La relevancia practica es que consigue una calidad mas cercana al checkpoint BF16 que los GGUF de Unsloth, con una velocidad de decodificacion notablemente superior en una sola tarjeta consumer.

El pack recuantiza a NVFP4 los expertos de las capas 20 a 23 (que el pack oficial almacenaba como Q8_0) y copia byte a byte el resto de secciones: capas 0 a 19, atencion, cabeza, embedding y el drafter DSpark. Segun las mediciones del autor, alcanza una divergencia KL media de 0.0059 frente a BF16, con 90.1 tok/s de decodificacion en una RTX 5060 Ti, frente a 49.1 y 42.0 tok/s de los GGUF UD-Q3_K_XL y UD-Q4_K_M respectivamente.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. No hay informacion publicada sobre la composicion del dataset de entrenamiento del modelo base ni sobre benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer; cuantizacion NVFP4 en formato `.basalt` v2 |
| Parametros totales | 26B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configuracion `--max-context 131072`); elasticamente ampliable hasta 524K segun el autor |
| Tipos de cuantizacion | NVFP4 (expertos de las 24 capas tras el recuantizado); cache KV en FP8 u FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.basalt` (formato propietario del motor Basalt, version 2); tamano 17.7 GB |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es una mezcla de expertos de 26B parametros desarrollada por Thinking Machines Lab. La model card del pack no detalla el numero de expertos activos por token, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO. Lo que si se documenta es la estructura de cuantizacion del checkpoint original: los expertos de las capas 0 a 19 se distribuyen en NVFP4, mientras que los de las capas 20 a 23 se almacenan en MXFP8. El pack oficial de Basalt los guardaba como Q8_0, lo que elevaba el consumo a 14.71 GiB solo en expertos, mas 1.10 GiB de pesos densos y 0.48 GiB del drafter, superando los 16 GB de una tarjeta consumer.

La innovacion tecnica de este pack consiste en redondear los expertos de las capas 20 a 23 a NVFP4, con escala de tensor amax / (6 x 448), una escala UE4M3 cada 16 valores seleccionada por minimo error cuadratico, y gate y up compartiendo escala de tensor como en el resto de capas NVFP4. El error cuadratico relativo medio resultante es de 0.0066. El resto de secciones se copia byte a byte. Ademas, el motor Basalt incorpora decodificacion especulativa mediante el drafter DSpark, activado por defecto, que aporta las mayores ganancias en generacion de codigo (hasta 117 tok/s) y las menores en prosa libre (71 a 84 tok/s). La cache KV es elastica: en conversaciones cortas cede espacio a los expertos, de modo que aumentar `--max-context` penaliza poco en chats breves.

## Capacidades

- Generacion de texto en dominios generales: narrativa, explicacion tecnica y conversacion multi-turno.
- Generacion de codigo, incluyendo clases Python con tests segun los prompts de evaluacion del autor.
- Razonamiento con niveles de esfuerzo configurables (el autor cita `reasoning effort none` como ajuste de evaluacion).
- Procesamiento de contexto largo: lectura de prompts de hasta 103.019 tokens en aproximadamente 70 segundos y recuperacion de informacion situada en el medio del contexto.
- Decodificacion especulativa integrada mediante el drafter DSpark del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con 90 tok/s de decodificacion en una RTX 5060 Ti y picos de 117 tok/s en codigo, el pack permite iterar sobre clases, tests y refactorizaciones sin depender de API externa, manteniendo una calidad cercana a BF16 (96.6 % de mismo token superior).
- Analisis de repositorios y documentos extensos: la ventana de 131K tokens y la lectura de prompts de 103K tokens en torno a 70 segundos permiten cargar ficheros completos o varios modulos y localizar informacion enterrada en el medio del contexto, con decodificacion sostenida de 52 a 54 tok/s a esa profundidad.
- Despliegue en hardware consumer con una sola GPU: al caber en 16 GB, es viable en equipos con RTX 5060 Ti, RTX 4080 o similares sin necesidad de repartir el modelo entre varias tarjetas, a diferencia de los GGUF Q4_K_M que el autor reparte entre dos GPU.
- Prototipado de agentes con contexto largo: la cache KV elastica permite mantener conversaciones cortas a alta velocidad (hasta 98 tok/s con `--max-context 64K`) y ampliar la ventana solo cuando la tarea lo exige, sin reconfigurar el servidor.
- Evaluacion de calidad de cuantizaciones: el pack incluye el script `tools/inkling2_requant.py` y el parche de motor, lo que facilita reproducir el pipeline de recuantizado y medir divergencia KL frente a BF16 con `basalt-bench --quality 20`.
- Generacion de documentacion tecnica y explicaciones: los prompts de explicacion tecnica del autor alcanzan 76 a 84 tok/s, suficiente para redactar guias o resumenes de forma interactiva en local.
- Experimentacion en investigacion sobre cuantizacion NVFP4: la comparacion documentada frente a GGUF Q3_K_XL y Q4_K_M, con KL divergence, perplejidad y porcentaje de mismo token, sirve como referencia metodologica para estudiar el impacto de esquemas de cuantizacion en modelos MoE.

## Benchmarks y rendimiento

Calidad frente a BF16 (WikiText-2 raw test, 20 chunks de 512 tokens, perplejidad base 7.6535):

| Metrica | UD-Q3_K_XL (llama.cpp) | UD-Q4_K_M (llama.cpp) | Este pack, KV FP8 | Este pack, KV FP16 |
|---|---:|---:|---:|---:|
| KL divergence media | 0.0159 | 0.0073 | 0.0059 | 0.0044 |
| KL divergence mediana | 0.0074 | 0.0035 | 0.0026 | no disponible |
| KL divergence percentil 99 | 0.155 | 0.061 | 0.053 | no disponible |
| Mismo token superior que BF16 | 94.4 % | 96.2 % | 96.6 % | 97.2 % |
| Perplejidad frente a BF16 | +1.43 % | +0.39 % | +0.26 % | +0.19 % |

Velocidad de decodificacion (RTX 5060 Ti 16 GB + RTX 3070 8 GB, Ryzen 9 3900X, 46 GB RAM, 3 prompts de 400 tokens, temperatura 0.7):

| Configuracion | Decodificacion (tok/s) | Contexto | GPU empleadas |
|---|---:|---:|---|
| UD-Q3_K_XL, llama.cpp | 49.1 | 32K | RTX 5060 Ti |
| UD-Q4_K_M, llama.cpp | 42.0 | 32K | RTX 5060 Ti + RTX 3070 |
| Este pack, Basalt | 90.1 (media); 70.8-117.4 por prompt | 131K | RTX 5060 Ti sola |
| Pack oficial Basalt | 29 | no disponible | RTX 5060 Ti (con expertos en RAM) |

Lectura de prompts en RTX 5060 Ti:

| Longitud del prompt (tokens) | 481 | 2.326 | 7.663 | 18.495 | 45.761 |
|---|---:|---:|---:|---:|---:|
| Velocidad de lectura (tok/s) | 1.731 | 2.514 | 2.707 | 2.337 | 1.995 |

Impacto de `--max-context` en decodificacion de chats cortos: 98.0 tok/s con 64K, 90.1 con 131K, 85.8 con 262K y 82.9 con 524K. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 17.7 GB de fichero de pack; el autor lo ejecuta en una RTX 5060 Ti de 16 GB, lo que implica que parte de los expertos se leen desde RAM del sistema.
- GPU recomendadas: RTX 5060 Ti 16 GB (medicion de referencia del autor); cualquier GPU con 16 GB o mas de VRAM.
- Cabe en GPU consumer: si, en tarjetas de 16 GB como la RTX 5060 Ti. En configuraciones con dos GPU el autor reparte los GGUF (0.72 / 0.28 en Q4_K_M), pero este pack esta disenado para una sola tarjeta.
- Opciones de despliegue: motor Basalt (repositorio github.com/jesdga95/basalt), con el parche `basalt-ajean-inkling.patch` aplicado sobre el commit `a11e19f6f`. Los GGUF de Unsloth requieren llama.cpp (build b12588 para esos ficheros). No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Memoria de cache KV: aproximadamente 16 KiB por token con `--kv fp8`; la cache es elastica y cede espacio a los expertos en conversaciones cortas.
- Latencia y throughput: 90.1 tok/s de media en decodificacion, 95 a 110 tok/s a temperatura 0 en el mismo script, 52 a 54 tok/s a 103K tokens de profundidad y 1.995 a 2.707 tok/s de lectura de prompt segun longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD media vs BF16) | Velocidad (tok/s) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Inkling-2-Mini-NVFP4-Basalt (este pack) | 26B | 131K | 0.0059 (KV FP8) / 0.0044 (KV FP16) | 90.1 | Apache 2.0 | Hugging Face, formato `.basalt` |
| Inkling-2-Mini-Basalt (pack oficial, jesdga) | 26B | no disponible | 0.0026 | 29 en RTX 5060 Ti (expertos en RAM) | Apache 2.0 | Hugging Face, formato `.basalt` |
| Inkling-2-Mini-GGUF UD-Q4_K_M (Unsloth) | 26B | 32K | 0.0073 | 42.0 en dos GPU | Apache 2.0 | Hugging Face, GGUF |
| Inkling-2-Mini-GGUF UD-Q3_K_XL (Unsloth) | 26B | 32K | 0.0159 | 49.1 en una GPU | Apache 2.0 | Hugging Face, GGUF |

## Limitaciones y advertencias

- El pack depende de un formato propietario (`.basalt` v2) y de un motor concreto (Basalt), con un parche especifico aplicado sobre el commit `a11e19f6f`; no es cargable en llama.cpp, vLLM, TGI u Ollama.
- El autor reconoce que parte de los expertos se leen desde RAM del sistema al ejecutarse en 16 GB, lo que afecta al rendimiento en funcion del ancho de banda de memoria y del resto de la configuracion.
- La calidad es inferior a la del pack oficial de Basalt (KLD media 0.0059 frente a 0.0026; 96.6 % frente a 97.8 % de mismo token superior), como consecuencia del recuantizado de las capas 20 a 23.
- La reproducibilidad de las velocidades depende del hardware: las cifras se obtuvieron en una RTX 5060 Ti con PCIe 4.0 x8, Ryzen 9 3900X y 46 GB de RAM; las ejecuciones repetidas varian entre un 5 y un 10 %.
- Las mediciones de calidad usan 20 chunks de WikiText-2, la puerta rapida del autor; no sustituyen a una evaluacion completa en tareas de razonamiento, codigo o matematicas.
- No hay informacion sobre sesgos, tasas de alucinacion, idiomas soportados ni comportamiento en dominios especializados del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo ni sobre el pack; la responsabilidad del uso recae en el desplegador.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validacion independiente de las cifras publicadas.

## Enlaces

- Hugging Face del pack: https://huggingface.co/nathaninline/Inkling-2-Mini-NVFP4-Basalt
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pack oficial de Basalt: https://huggingface.co/jesdga/Inkling-2-Mini-Basalt
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- Pagina de precision del modelo en Basalt: https://github.com/jesdga95/basalt/blob/main/docs/precision/inkling2.md
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
