# nirca/nirca-mini-GGUF

## Resumen

Nirca Mini es un modelo de lenguaje de tipo decoder-only entrenado desde cero por el autor independiente nirca, con pesos ternarios (-1, 0, +1 con escala y sesgo por bloque de 128 pesos) y una arquitectura poco habitual que combina recurrencia latente con mezcla de expertos. El modelo real tiene unos 109 millones de parametros, una anchura de 512, 8 cabezas de atencion y una ventana de contexto de 2.048 bytes. Su rasgo mas distintivo es que opera a nivel de byte: no usa tokenizador, sino un vocabulario de 265 entradas (los 256 valores de byte mas 9 tokens especiales), y emplea un bloque recurrente que se ejecuta entre 1 y 24 veces por byte, con una cabeza de parada que decide dinamicamente cuando detener la recursion (media de 8 pasadas en entrenamiento).

El repositorio que nos ocupa, `nirca/nirca-mini-GGUF`, no contiene el modelo original sino una aproximacion en formato GGUF pensada para ejecutarse en llama.cpp estandar. Como llama.cpp no soporta bucles recurrentes, los ficheros desenrollan exactamente 8 pasadas fijas del bloque compartido y anaden 8 capas "adapter" adicionales que imitan, de forma aproximada, la mezcla de estado entre pasadas del modelo real. El resultado son ficheros de unos 3,0 GB por variante (base y chat) para un modelo de 109 millones de parametros, porque el bloque compartido se almacena una vez por pasada.

La relevancia de esta publicacion es fundamentalmente de investigacion: permite experimentar con modelos ternarios, recurrentes y byte-level en herramientas de inferencia convencionales, a costa de una fidelidad limitada respecto al modelo original. Segun la propia model card, el siguiente byte coincide con el modelo real en el 92,4 % de las posiciones (base) y el 89,8 % (chat), con una divergencia KL de 0,0415 y 0,0870 nats respectivamente, y las respuestas greedy solo son identicas en 1 de cada 8 prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only con recurrencia latente y mezcla de expertos (MoE); en el GGUF, bloque recurrente desenrollado 8 veces mas 8 capas adapter |
| Parametros totales | 3.780.247.536 en safetensors del repo GGUF (el modelo real tiene ~109 millones; el GGUF repite el bloque compartido 8 veces) |
| Parametros activos | 8 expertos activos por token sobre un pool compartido de 32 |
| Longitud de contexto | 2.048 bytes |
| Tipos de cuantizacion | Expertos del modelo en q4_0; expertos de las capas adapter en q8_0; atencion, embeddings y capa de salida en f16; normas y sesgos en f32 |
| Idiomas soportados | Ingles (entrenado mayoritariamente en ingles) |
| Licencia | no disponible (los datos de entrenamiento incluyen texto bajo CC BY 4.0 y CC BY-NC-SA 4.0) |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors en `nirca/nirca-mini` |

## Arquitectura y entrenamiento

El modelo real es un transformer decoder-only con recurrencia latente: un unico bloque se aplica repetidamente, entre 1 y 24 pasadas por byte, y una cabeza de parada decide por byte cuando detener la recursion (media de 8 pasadas en entrenamiento; en los prompts de paridad del autor se detuvo en la pasada 8 o 9 para el 81 % de los bytes en base y el 85 % en chat). La anchura es de 512, con 8 cabezas de atencion y embeddings posicionales rotatorios. La mezcla de expertos consta de 32 expertos en un pool compartido, de los que 8 se activan por token. Los pesos son ternarios: valores -1, 0 o +1 con una escala y un sesgo por cada bloque de 128 pesos. El vocabulario es de 265 entradas a nivel de byte, sin tokenizador. La arquitectura deriva de mini-AGI (volotat).

El entrenamiento se realizo desde cero sobre los datasets HuggingFaceTB/smoltalk y open-thoughts/OpenThoughts-114k, e incluye texto bajo licencias CC BY 4.0 y CC BY-NC-SA 4.0. Segun la model card, el checkpoint chat (Nirca Mini 0) alcanzo el paso 124.366 tras ver 4.641.084.509 tokens, y el base el paso 123.009 tras 4.612.237.558 tokens. No se documentan en la informacion disponible detalles sobre RLHF, DPO u otras fases de alineacion; de hecho, el autor indica que el modelo no ha pasado por ningun ajuste de seguridad. La innovacion tecnica principal es la combinacion de pesos ternarios, recurrencia con parada adaptativa y procesamiento byte-level en un modelo de escala muy reducida.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Procesamiento a nivel de byte: lee y escribe bytes directamente, sin tokenizador, lo que en teoria le permite manejar cualquier secuencia de bytes de entrada.
- Razonamiento basico y generacion de texto libre en la variante base (sin plantilla de chat).
- Recurrencia adaptativa en el modelo real: entre 1 y 24 pasadas por byte con parada decidida por una cabeza dedicada (no disponible en el GGUF, que fija 8 pasadas).
- Mezcla de expertos con 8 expertos activos de 32 por token.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre pesos ternarios: el modelo permite estudiar el comportamiento de redes con cuantizacion ternaria extrema (-1, 0, +1) en tareas de generacion, comparando el modelo real con la aproximacion GGUF.
- Estudio de recurrencia latente: sirve para analizar como afecta el numero de pasadas del bloque recurrente a la calidad de la salida, usando el modelo original con parada adaptativa frente al GGUF con 8 pasadas fijas.
- Experimentacion con modelos byte-level: util para probar tecnicas sin tokenizador en tareas de manipulacion de texto y bytes, aprovechando el vocabulario de 265 entradas.
- Prototipado de chat ligero en llama.cpp: la variante chat permite montar un servidor `llama-server` local con unos 3 GB de disco y contexto de 2.048 bytes para pruebas de integracion de la API compatible con OpenAI.
- Docencia y divulgacion: un modelo de 109 millones de parametros con arquitectura no convencional es adecuado para explicar MoE, recurrencia y cuantizacion ternaria en entornos educativos.
- Pruebas de compatibilidad de runtimes: el autor lo uso para validar el comportamiento de llama.cpp con arquitecturas no estandar (declarada como `gpt-oss`/`openai-moe` para que cargue sin modificaciones).
- Analisis de fidelidad de conversiones GGUF: los datos de coincidencia de siguiente byte y divergencia KL permiten estudiar el coste de aproximar modelos recurrentes en formatos estaticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de fidelidad de la aproximacion GGUF respecto al modelo real, medidas el 2026-11-12 con 8 prompts, next-byte teacher-forced y el runtime llama.cpp 2.72.0 de LM Studio sobre Apple Metal:

| Metrica | Base | Chat |
|---|---|---|
| Coincidencia del siguiente byte | 92,4 % | 89,8 % |
| Divergencia KL respecto al modelo real (nats) | 0,0415 | 0,0870 |
| Respuestas greedy identicas al modelo real | 1 de 8 prompts | 1 de 8 prompts |

## Requisitos de hardware

- VRAM estimada: los ficheros pesan unos 3,0 GB cada uno; con overhead de runtime, se puede asumir un consumo de VRAM en torno a 3,5-4 GB en GPU, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor solo documento pruebas en Apple silicon con Metal (runtime 2.72.0) y, para el fichero base, en CPU y en runtimes 2.43.0 a 2.72.0.
- Cabe en GPU de consumo: por tamano (3 GB de pesos), es plausible en GPUs consumer con 4-8 GB de VRAM, pero no hay validacion oficial en CUDA ni Vulkan.
- Opciones de despliegue: llama.cpp estandar (`llama-server`), con `-ngl 99` para descargar todas las capas en GPU. No se ha probado en LM Studio como aplicacion, ni en runtimes distintos de llama.cpp, ni en Linux, Windows, CUDA o Vulkan.
- Latencia y throughput: no disponibles. El modelo real requiere entre 1 y 24 pasadas por byte; el GGUF fija 8 pasadas, lo que implica un coste computacional proporcionalmente mayor que un modelo estatico equivalente.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales con otros modelos en la informacion proporcionada. Como referencia estructural, se puede contrastar con el modelo original del que deriva:

| Modelo | Parametros | Contexto | Recurrencia | Formato | Licencia |
|---|---|---|---|---|---|
| nirca-mini-GGUF (este repo) | 3.780.247.536 en safetensors (109 M reales) | 2.048 bytes | 8 pasadas fijas, sin parada | GGUF | no disponible |
| nirca/nirca-mini (modelo real) | ~109 M | 2.048 bytes | 1 a 24 pasadas con parada adaptativa | safetensors | no disponible |

No se conocen en la informacion disponible otros modelos ternarios, byte-level o con recurrencia latente directamente comparables en prestaciones.

## Limitaciones y advertencias

- La aproximacion GGUF no es el modelo real: fija 8 pasadas por byte y sustituye la mezcla de estado entre pasadas por capas adapter aproximadas; las respuestas son coherentes pero no las que daria el modelo original.
- El modelo declara la arquitectura `gpt-oss` (`openai-moe`) como sustituto para que llama.cpp lo cargue; no es un modelo de OpenAI.
- El modelo es un prototipo de investigacion de 109 millones de parametros: segun el autor, a menudo se equivoca o resulta incoherente.
- No ha pasado por ningun ajuste de seguridad y no debe usarse como fuente de hechos ni de consejo.
- Puede reproducir sesgos presentes en sus datos de entrenamiento.
- Entrenado mayoritariamente en ingles y sin conocimiento de eventos posteriores a sus datos.
- Contexto muy limitado (2.048 bytes), lo que restringe conversaciones multi-turno y documentos largos.
- La licencia no esta disponible; ademas, los datos de entrenamiento incluyen texto bajo CC BY-NC-SA 4.0, lo que puede condicionar el uso comercial.
- El token de parada `<|im_end|>` se emite como bytes planos: hay que enviarlo explicitamente como stop en cada peticion de chat.
- Solo se ha probado en llama.cpp sobre Apple Metal (y CPU para el fichero base); sin validacion en CUDA, Vulkan, Linux ni Windows.
- El repositorio no se actualiza automaticamente cuando se publican nuevos checkpoints en `nirca/nirca-mini`.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nirca/nirca-mini-GGUF
- Modelo original: https://huggingface.co/nirca/nirca-mini
- Demo WebGPU: https://tg-techie-agents.github.io/nirca-mini-webgpu/mini/
- Repositorio mini-AGI (arquitectura de referencia): https://github.com/volotat/mini-AGI
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
