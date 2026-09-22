# LinaTea/Qwen3.5-4B-Fix-GGUF

## Resumen

Qwen3.5-4B-Fix-GGUF es la distribucion en formato GGUF, generada por el usuario LinaTea, de su propio checkpoint experimental LinaTea/Qwen3.5-4B-Fix. Se trata de una derivacion no oficial de Qwen/Qwen3.5-4B-Base en la que los bloques MLP densos del modelo de lenguaje se han "upcycled" a una mezcla de expertos (MoE) de 2 expertos con enrutamiento top-1 mas un experto compartido de 512 unidades, sobre la que despues se aplicaron LoRA SFT y RL con GRPO en el lado de texto. La torre de vision, el tokenizer, la plantilla de chat y el procesador de imagen se heredan sin cambios del modelo base.

El resultado conserva el pipeline image-text-to-text del original, con una longitud de contexto declarada de 262.144 tokens y metadatos de arquitectura `qwen35moe` (32 bloques, hidden 2560). El repositorio pesa 7,0 GB e incluye cuatro cuantizaciones del modelo de lenguaje (F16, Q8_0, MXFP4_MOE y Q4_0) mas dos variantes del proyector multimodal (mmproj F16 y Q8_0). La cifra real de parametros reportada en safetensors es de 6.596.750.336, muy superior al "4B" del nombre, coherente con la duplicacion de las capas MLP en expertos.

Su relevancia es acotada y de tipo practico: es un ejemplo reciente de receta comunitaria de "dense-to-MoE upcycling" mas RL sobre una familia Qwen, empaquetada para llama.cpp con soporte multimodal (mtmd) y tool calling via `llama-server`. El autor la etiqueta explicitamente como experimental y avisa de que no esta afiliada ni respaldada por el equipo de Qwen; a fecha de la ficha acumula 0 descargas y 1 like.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE derivado por upcycling: `qwen35moe`, 32 bloques, hidden 2560, 2 expertos con enrutamiento top-1 mas experto compartido de 512 unidades; torre de vision heredada del modelo base |
| Parametros totales | 6.596.750.336 (dato real de safetensors) |
| Parametros activos | No disponible (el autor no publica el recuento activo; el enrutamiento es top-1 sobre 2 expertos mas experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16 (12,3 GiB), Q8_0 (6,5 GiB), MXFP4_MOE (4,3 GiB), Q4_0 (3,6 GiB); proyector multimodal en F16 (641 MiB) y Q8_0 (347 MiB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (siguiendo Qwen/Qwen3.5-4B-Base) |
| Formato de pesos | GGUF (llama.cpp); repositorio de 7,0 GB |
| Cabezal MTP | `nextn_predict_layers` = 0 (el cabezal MTP del modelo base no forma parte de este checkpoint) |

## Arquitectura y entrenamiento

El punto de partida es un transformer denso de la familia Qwen3.5 de 4B. El autor sustituye los bloques MLP densos por una capa MoE de 2 expertos con enrutamiento top-1 y un experto compartido de ancho 512, lo que eleva el total de parametros hasta 6.596.750.336. La metadata GGUF confirma la arquitectura `qwen35moe`, con 32 bloques, dimension oculta 2560 y `nextn_predict_layers` a 0, es decir, sin el cabezal de prediccion multi-token del modelo base. La parte de vision no se ha reentrenado: se reutiliza tal cual la torre, el tokenizer, la plantilla de chat y el procesador de imagen del checkpoint base, de modo que la calidad de comprension de imagen es la del modelo original.

Sobre el lado de texto se aplicaron dos etapas: un SFT con LoRA y un posterior RL con GRPO. El unico dato cuantitativo que el autor aporta sobre el efecto de esa etapa de RL es que los resultados en GSM8K y MMLU de un conjunto reservado se movieron menos de 1 punto porcentual, es decir, dentro del ruido. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni detalles del proceso de RLHF/DPO. Tampoco se aplico recorte de filas QKV, un ajuste que el propio autor identifica como relevante porque la familia base tiende a bucles de repeticion en decodificacion voraz.

En el lado del empaquetado, el autor documenta que llama.cpp no dispone de tipo de cuantizacion FP8 ni NVFP4 y que su cuantizador rechaza `FP8`, `FP8_E4M3`, `NVFP4` y `MXFP4`, aceptando unicamente `MXFP4_MOE`, que es el fichero de 4 bits en coma flotante incluido. Los checkpoints FP8/NVFP4 se generan con otras herramientas (NVIDIA ModelOpt o llm-compressor a safetensors de compressed-tensors) y no estan disponibles en este repositorio.

## Capacidades

- Generacion de texto conversacional en formato chat, usando la plantilla de Qwen3.5 embebida en el GGUF mediante `--jinja`.
- Modo de razonamiento tipo thinking: la plantilla preabre `<think>`, por lo que la generacion arranca dentro del bloque de pensamiento y la respuesta final aparece tras `</think>`.
- Comprension de imagen y texto (image-text-to-text) a traves del proyector multimodal y del binario `llama-mtmd-cli` de llama.cpp con soporte mtmd.
- Tool calling / function calling: `llama-server` devuelve `tool_calls` en estilo OpenAI para una peticion sencilla de llamada a funcion.
- Contexto largo: se verifico recuperacion de una aguja al inicio de un prompt de 250.021 tokens con el build F16.
- Matematicas y razonamiento basico: el autor probo una consulta aritmetica simple (`1+1=?`) con `llama-cli`; no hay evaluacion sistematica publicada.
- Idiomas: no disponible; la model card no declara lista de idiomas.

## Casos de uso

- Procesamiento de documentos largos con imagen y texto: con 262.144 tokens de contexto, se puede pasar un informe completo con figuras y preguntar por detalles concretos; el autor verifico recuperacion de informacion ("needle") en un prompt de 250.021 tokens.
- Descripcion y extraccion de informacion de imagenes en local: usando `llama-mtmd-cli` con el fichero `mmproj-Q8_0.gguf` (347 MiB) se pueden generar descripciones o extraer texto de capturas; en las pruebas el modelo describio correctamente una imagen sintetica con un circulo rojo, un cuadrado azul y el texto "HELLO 42".
- Servicio de chat compatible con la API de OpenAI: `llama-server -c 262144 --jinja` expone un endpoint con `tool_calls`, lo que permite sustituir un backend propietario en prototipos sin cambiar el codigo cliente.
- Agentes con function calling en local: el soporte de `tool_calls` habilita patrones de razonamiento multi-paso donde el modelo decide que funcion invocar, adecuado para entornos con requisitos de privacidad que impiden enviar datos a la nube.
- Asistente de razonamiento con traza visible: el arranque dentro de `<think>` permite obtener la cadena de pensamiento y la respuesta final por separado, util para depuracion y para auditar decisiones en tareas de analisis.
- Despliegue en hardware de gama alta para inferencia por lotes: el build F16 alcanzo 4.222 tok/s de prefill en una sola RTX 5090 con un prompt de 250.021 tokens, lo que sirve para indexado o resumen masivo de corpus.
- Experimentacion academica sobre upcycling denso a MoE: el checkpoint y sus cuantizaciones permiten reproducir y comparar la receta (upcycling + LoRA SFT + GRPO) frente al modelo denso original.
- Evaluacion de llama.cpp con modelos multimodales y MoE: sirve como banco de pruebas de `llama-mtmd-cli`, `llama-server`, plantillas Jinja y el tipo de cuantizacion `MXFP4_MOE`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que la etapa de RL movio GSM8K y MMLU de un conjunto reservado menos de 1 punto porcentual, lo que describe como ruido, y no aporta cifras absolutas. Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (devolvieron paginas comerciales sin relacion).

Datos de rendimiento medidos por el autor:

| Prueba | Resultado |
|---|---|
| Recuperacion de aguja en prompt de 250.021 tokens (F16) | Correcta |
| Prefill, build F16, una RTX 5090 | 4.222 tok/s |
| Vision, imagen sintetica (circulo rojo, cuadrado azul, texto "HELLO 42") | Descripcion correcta en las cuatro cuantizaciones y un proyector |
| Tool calling via `llama-server` | Devuelve `tool_calls` estilo OpenAI |
| GSM8K / MMLU tras RL | Variacion < 1 pp (dentro del ruido) |

## Requisitos de hardware

- VRAM estimada (solo pesos del modelo de lenguaje): 12,3 GiB en F16, 6,5 GiB en Q8_0, 4,3 GiB en MXFP4_MOE y 3,6 GiB en Q4_0.
- Hay que sumar el proyector multimodal si se usa vision: 641 MiB (F16) o 347 MiB (Q8_0).
- La cache KV para 262.144 tokens crece de forma lineal con el contexto y no cabe en GPUs de consumo a esa longitud; no se dispone de cifras exactas de memoria de cache en la informacion proporcionada.
- Cabe en GPU de consumo: los ficheros Q4_0 y MXFP4_MOE (3,6-4,3 GiB de pesos) son aptos para tarjetas de 8-12 GB de VRAM, siempre que se limite la longitud de contexto y el numero de capas en GPU (`-ngl`).
- GPU recomendadas: el autor valida el build F16 en una RTX 5090 (prefill de 4.222 tok/s). No se aportan mediciones para A100, H100 u otras GPUs.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` con mtmd para vision y `llama-server` con `-c 262144 --jinja`); la compatibilidad con Ollama, vLLM, TGI u otros motores no esta verificada en la informacion disponible. El autor senala que los checkpoints FP8/NVFP4 para vLLM o SGLang pertenecen a otra cadena de herramientas y no se incluyen aqui.
- Latencia y throughput: solo se publica el prefill de 4.222 tok/s en RTX 5090 con F16; no hay datos de velocidad de decodificacion.
- Aviso practico del autor: con la plantilla de Qwen3.5 hay que usar `-n 256` o mas, porque el modelo empieza a generar dentro del bloque de pensamiento y agotara el limite si es demasiado bajo. Este build no admite `--chat-template-kwargs` ni `--no-think`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LinaTea/Qwen3.5-4B-Fix-GGUF (este modelo) | 6.596.750.336 | 262.144 | GGUF (F16, Q8_0, MXFP4_MOE, Q4_0) + mmproj | Apache-2.0 | Publico en HuggingFace, 0 descargas, 1 like |
| LinaTea/Qwen3.5-4B-Fix | No disponible | No disponible | No disponible (checkpoint original del que derivan los GGUF) | Apache-2.0 (segun el campo del repositorio) | Publico en HuggingFace |
| Qwen/Qwen3.5-4B-Base | No disponible en la informacion proporcionada (denominado 4B en el nombre) | 262.144 (heredado en la metadata del GGUF) | No disponible | Apache-2.0 (enlace de licencia citado por el autor) | Publico en HuggingFace |

No se dispone de datos de benchmarks ni de mediciones comparativas frente a otras alternativas de tamano similar en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Modelo no oficial: es una derivacion experimental de un tercero, no afiliada ni respaldada por el equipo de Qwen. No debe presentarse como un modelo Qwen oficial.
- La vision no se ha entrenado: se hereda del checkpoint base, por lo que la calidad de comprension de imagen es la del modelo original. No se validaron entradas de video ni de audio.
- Sin cifras absolutas de calidad: la unica referencia es que el RL movio GSM8K y MMLU menos de 1 pp, es decir, sin mejora medible fuera del ruido.
- Tendencia a bucles de repeticion en decodificacion voraz, segun el propio autor, agravada porque no se aplico recorte de filas QKV en este checkpoint.
- El modo thinking viene preabierto por la plantilla y no hay interruptor `--no-think` ni `--chat-template-kwargs` en este build, lo que obliga a ajustar `-n` y a filtrar la traza de razonamiento si no se quiere exponer.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion; el modelo es de 4B (6,6B totales) y no cabe esperar robustez de modelos mucho mayores.
- Cobertura de idiomas no declarada: no hay lista de idiomas soportados, por lo que el comportamiento multilingue es indeterminado.
- Contexto de 262.144 tokens declarado en la metadata, pero la unica verificacion publicada es una prueba de aguja a 250.021 tokens; el rendimiento real en tareas que requieran razonar sobre todo el contexto no esta medido.
- Restricciones de cuantizacion: llama.cpp no soporta FP8 ni NVFP4; solo se ofrece `MXFP4_MOE`, que el autor subraya que no es lo mismo que el NVFP4 de NVIDIA. Si el despliegue objetivo es vLLM o SGLang, estos ficheros no sirven.
- Licencia Apache-2.0 heredada de Qwen/Qwen3.5-4B-Base, que permite uso comercial, pero conviene verificar el enlace de licencia del modelo base y el cumplimiento de las condiciones de la familia Qwen antes de un despliegue en produccion.
- Adopcion nula: 0 descargas y 1 like en el momento de redactar la ficha, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LinaTea/Qwen3.5-4B-Fix-GGUF
- Checkpoint base del que deriva: https://huggingface.co/LinaTea/Qwen3.5-4B-Fix
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Los resultados de la busqueda web proporcionados no incluyen enlaces relevantes sobre este modelo (devolvieron listados comerciales sin relacion); no se dispone de papers, blogs ni demos adicionales.
