# lisnapyc/Qwen3.5-4B-Q4_0-MTP-headQ8

## Resumen

Qwen3.5-4B-Q4_0-MTP-headQ8 es una cuantizacion GGUF de precision mixta del modelo Qwen/Qwen3.5-4B, publicada por el usuario lisnapyc. Su particularidad es que mantiene la cabeza de prediccion multi-token (MTP, Multi-Token Prediction) en Q8_0 mientras el cuerpo del transformer se cuantiza en Q4_0, con el objetivo de preservar la precision de los tokens borrador que se usan en decodificacion especulativa con llama.cpp.

El modelo base Qwen3.5-4B cuenta con 4.326.350.848 parametros segun los pesos en safetensors, y este build GGUF ocupa 2,67 GB (2.672.076.864 bytes). La cabeza MTP representa solo 121M de los aproximadamente 4,2B de pesos, por lo que almacenarla en Q8_0 en lugar de Q4_0 cuesta unos 60 MB adicionales (128 MB frente a 68 MB).

El autor lo diseno para ejecutar un asistente de programacion en un telefono de gama media (Samsung Galaxy A36 5G, Snapdragon 6 Gen 3, 8 GB de RAM, solo CPU, 4 hilos). Se trata de un experimento con mediciones de un unico dispositivo, no de un lanzamiento ajustado, y asi lo declara explicitamente en la model card. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de prediccion multi-token (MTP); 32 bloques de cuerpo mas 1 bloque MTP (blk.32) |
| Parametros totales | 4.326.350.848 (4,2B en el GGUF; 121M corresponden a la cabeza MTP) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (las mediciones se hicieron con contexto 4096) |
| Tipos de cuantizacion | Cuerpo Q4_0, cabeza MTP Q8_0, embeddings/salida Q6_K; normas y sesgos en F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (441 tensores, 33 bloques, 1 capa MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer de 32 bloques con una capa adicional de prediccion multi-token (MTP) que actua como bloque final (blk.32). En este build GGUF, los pesos del cuerpo (bloques 0-31, 3570M parametros) se almacenan en Q4_0, con 3 MB de normas y sesgos en F32. La cabeza MTP (121M parametros) se guarda en Q8_0, ocupando 128 MB. El tensor `token_embd.weight`, que el modelo usa tambien como capa de salida (tied output layer), se cuantiza en Q6_K (636M parametros, 521 MB), el valor por defecto de llama.cpp para un build Q4_0.

No se dispone de informacion sobre el entrenamiento del modelo base en la documentacion proporcionada: no se detalla el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable de este build es el uso de precision mixta para la cabeza MTP, que genera los tokens borrador en decodificacion especulativa; su precision determina cuantos tokens acepta el modelo principal. La cuantizacion se realizo con `llama-quantize` de llama.cpp tag b12318 a partir de los pesos BF16 (8,67 GB) de unsloth/Qwen3.5-4B-MTP-GGUF, aplicando el patron de tensor `blk\.32\..*=q8_0`.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Generacion de codigo: en las pruebas del autor resolvio 22 de 24 tareas C++ pequenas (primos, fusion de arrays ordenados, busqueda binaria, etc.), con compilacion correcta con `g++ -std=c++17`.
- Decodificacion especulativa mediante la cabeza MTP, activada con `--spec-type draft-mtp` en llama.cpp; sin ese flag el archivo se comporta como un build Q4_0 normal.
- Modo thinking desactivable (las pruebas se hicieron con thinking off).
- Entrada de imagen solo si se combina con el archivo `mmproj` de unsloth/Qwen3.5-4B-GGUF; esa combinacion no fue probada con este build.
- Soporte de plantillas de chat mediante `--jinja`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en movil: el modelo esta pensado para ejecutarse en CPU de un telefono de gama media (8 GB de RAM) con llama-server, ofreciendo generacion de funciones C++ pequenas a 7,3-8,6 tokens/s con MTP y 3 tokens borrador.
- Generacion de codigo asistida en entornos sin GPU: al caber en 2,67 GB, puede desplegarse en portatiles modestos o servidores sin acelerador, usando llama.cpp con cuantizacion Q4_0.
- Pruebas de decodificacion especulativa: sirve como banco de pruebas para medir la aceptacion de borradores MTP y el impacto de la precision de la cabeza en la velocidad de generacion.
- Chat conversacional ligero: el tag conversational y la plantilla Jinja permiten integrarlo en interfaces de chat con contexto de 4096 tokens, adecuado para conversaciones de codigo o soporte tecnico breve.
- Prototipado de pipelines de CI/CD para generacion de codigo: el modelo puede generar funciones candidatas que luego se compilan y validan automaticamente, como en el benchmark de 12 tareas C++ del autor.
- Experimentacion con cuantizacion de precision mixta: el patron `blk\.32\..*=q8_0` es reutilizable para otros tamanos del modelo (N=24 en el 2B), lo que permite estudiar el equilibrio entre tamano y aceptacion de borradores.
- Evaluacion comparativa de builds GGUF: sirve para contrastar el rendimiento de cabezas MTP en Q4_0 frente a Q8_0 en el mismo hardware.

## Benchmarks y rendimiento

Correccion de codigo en 12 tareas C++ (dos intentos por tarea, MTP con 3 tokens borrador, temperature 0.2, top_p 0.95, top_k 20, thinking off), medido en Samsung Galaxy A36 5G, solo CPU, 4 hilos, contexto 4096:

| Modelo | Soluciones que pasan todas las comprobaciones |
|---|---|
| Qwen3.5-4B, cuerpo Q4_0 + cabeza Q8_0 (este archivo) | 22 / 24 |
| Qwen3.5-2B, cuerpo Q4_0 + cabeza Q8_0, mismos ajustes | 15 / 24 |

Velocidad durante esa prueba con MTP: 7,3-8,6 tokens/s. Los dos fallos de este archivo corresponden a la misma tarea: una comprobacion de palindromo correcta salvo para la cadena vacia (desbordamiento sin signo en `length() - 1`).

Efecto de la precision de la cabeza, medido sobre Qwen3.5-2B con tres builds del mismo origen BF16 (aceptacion de borradores y velocidad con MTP):

| Build 2B | Aceptacion, codigo / prosa | Velocidad con MTP, codigo / prosa (tokens/s) |
|---|---|---|
| Q4_0 en todo | 75 % / 39 % | 10,7 / 7,05 |
| Cuerpo Q4_0 + cabeza Q8_0 | 81 % / 42 % | 10,7-11,1 / 7,3 |
| Cuerpo Q4_0 + cabeza Q8_0 + embeddings Q8_0 | 81 % / 50 % | 10,5-10,6 / 7,9-8,05 |
| Q8_0 en todo (referencia) | 82 % / 49 % | 10,6-10,8 / 7,7 |

Longitud de borrador (2B, cuerpo Q4_0 + cabeza Q8_0), comparando cada ejecucion con MTP frente a la misma sin MTP:

| Tokens borrador | Codigo: cambio vs sin MTP | Prosa: cambio vs sin MTP | Aceptacion, codigo / prosa |
|---|---|---|---|
| 2 | -25 % | -45 % | 87 % / 51 % |
| 3 | +19 % | -24 % | 81 % / 42 % |
| 4 | -12 % | -46 % | 71 % / 34 % |
| 5 | -23 % | -57 % | 68 % / 28 % |

Solo tres tokens borrador aportaron mejora, y unicamente en codigo; en prosa el MTP fue mas lento en todas las longitudes.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa 2,67 GB; el autor lo ejecuto en un telefono con 8 GB de RAM y contexto 4096, por lo que en GPU cabe holgadamente en tarjetas de 4 GB o mas.
- GPU recomendadas: no hay mediciones del autor en GPU; por tamano, cualquier GPU consumer con 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) deberia albergarlo. No se dispone de datos de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, segun el tamano del archivo; no verificado con mediciones.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja` y `--spec-type draft-mtp --spec-draft-n-max 3`); sin ese flag funciona como un Q4_0 normal. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 7,3-8,6 tokens/s en CPU de telefono (Snapdragon 6 Gen 3, 4 hilos) con MTP y 3 tokens borrador; en el 2B, 10,7-11,1 tokens/s en codigo y 7,3 tokens/s en prosa. Sin datos en escritorio ni GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Q4_0-MTP-headQ8 (este) | 4,33B | No disponible (medido a 4096) | Cuerpo Q4_0, cabeza MTP Q8_0, embeddings Q6_K | Apache 2.0 | 22/24 en tareas C++ en telefono |
| unsloth/Qwen3.5-4B-MTP-GGUF (Q4_0) | 4,33B | No disponible | Cabeza MTP mayoritariamente Q4_0 (107M de 121M) | Apache 2.0 | Referencia usada como origen de pesos BF16 |
| Qwen3.5-2B (cuerpo Q4_0 + cabeza Q8_0) | ~2B | No disponible | Q4_0 / Q8_0 | Apache 2.0 | 15/24 en tareas C++, 10,7-11,1 tokens/s en codigo |
| Qwen3.5-4B Q4_0 sin MTP | 4,33B | No disponible | Q4_0 | Apache 2.0 | ~4,6 tokens/s en el mismo telefono, medido con `llama-bench` (comparacion no controlada) |

## Limitaciones y advertencias

- Un solo dispositivo y solo CPU: todas las mediciones proceden de un Samsung Galaxy A36 5G; no se probo en CPU de escritorio ni en GPU, donde la verificacion por lotes es mucho mas barata y el equilibrio puede ser muy distinto.
- Sin comparacion de velocidad emparejada para este archivo 4B: el dato de ~4,6 tokens/s de un build Q4_0 sin MTP proviene de otro archivo y otra herramienta (`llama-bench`), por lo que no es una comparacion controlada.
- La model card original esta truncada en la seccion de limitaciones; no se dispone del resto de advertencias del autor.
- El beneficio del MTP es pequeno en CPU (0-4 % de ganancia de velocidad en el 2B) y puede ser negativo en prosa a cualquier longitud de borrador.
- Sin datos sobre sesgos, riesgo de alucinacion, idiomas soportados ni restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0.
- La combinacion con el archivo `mmproj` para entrada de imagen no fue probada con este build.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-12; es un experimento, no un lanzamiento ajustado.
- Si se adapta el patron de cuantizacion a otros tamanos, hay que tener en cuenta que la cabeza MTP usa tensores `blk.<N>.nextn.*` (N=32 en el 4B, N=24 en el 2B) y que un patron como `.*mtp.*` no coincide con nada; ademas, el 4B no tiene `output.weight` separado.

## Enlaces

- Hugging Face: https://huggingface.co/lisnapyc/Qwen3.5-4B-Q4_0-MTP-headQ8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Origen de pesos BF16: https://huggingface.co/unsloth/Qwen3.5-4B-MTP-GGUF
- GGUF con mmproj para imagen: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
