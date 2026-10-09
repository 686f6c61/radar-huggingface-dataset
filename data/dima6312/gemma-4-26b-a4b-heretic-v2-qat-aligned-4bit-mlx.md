# dima6312/gemma-4-26B-A4B-heretic-v2-qat-aligned-4bit-mlx

## Resumen

Esta ficha describe `dima6312/gemma-4-26B-A4B-heretic-v2-qat-aligned-4bit-mlx`, una conversion a 4 bits para Apple Silicon (formato MLX) de un modelo Gemma 4 26B A4B que Google entreno con cuantizacion consciente del entrenamiento (QAT) y que despues fue "abliterado" (descensurado) por OS-Software. El autor de esta build, dima6312, no modifica los pesos mas alla de la cuantizacion: aplica el metodo de alineacion QAT de mlx-community para conservar la rejilla int4 original (escala por bloque de 32) en lugar de una conversion 4-bit estandar.

Se trata de un modelo multimodal (entrada de texto e imagen, salida de texto) con torre de vision incluida, construido sobre la arquitectura Mixture-of-Experts de Gemma 4. Cuenta con 25.805.933.872 parametros totales (denominacion A4B del modelo base) y hereda de la familia Gemma 4 una ventana de contexto de hasta 256K tokens y soporte multilingue de mas de 140 idiomas. El repositorio ocupa 17.0 GB.

Su relevancia es doble: por un lado demuestra una cuantizacion QAT-aligned de muy baja deriva (KL de 0,021 en texto de chat frente a la referencia de 8 bits) y, por otro, es un modelo sin mecanismos de rechazo (uncensored/abliterated) orientado a investigacion. El autor advierte explicitamente que responde a peticiones que el modelo original rechaza y que la responsabilidad de uso recae en el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture-of-Experts (Gemma 4); incluye torre de vision |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | Aproximadamente 4 B segun la denominacion A4B del modelo base (cifra exacta no disponible) |
| Longitud de contexto | Hasta 256K tokens (familia Gemma 4) |
| Tipos de cuantizacion | 4-bit group 32 QAT-aligned; 16 tensores abliterados en 8-bit; router y torre de vision en bf16; media de 5,03 bits por peso en texto |
| Idiomas soportados | Mas de 140 idiomas (modelo base Gemma 4) |
| Licencia | apache-2.0 (texto), con licencia Gemma 4 de Google |
| Formato de pesos | MLX safetensors (libreria mlx; compatible con mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 26B A4B de Google DeepMind, con arquitectura Mixture-of-Experts y capacidad multimodal (texto e imagen). Google entreno el checkpoint con QAT, de forma que sus pesos ya residen en una rejilla int4 con una escala por bloque de 32. La abliteracion posterior, realizada por OS-Software con la herramienta Heretic, reescribio 16 tensores (`self_attn.o_proj` y `mlp.down_proj` en las capas 12 a 19), que dejaron de estar sobre la rejilla QAT original.

La innovacion tecnica de esta build concreta reside en el proceso de cuantizacion: en lugar de una conversion MLX 4-bit estandar (group 64), que ignora la rejilla QAT y anade su propio error de redondeo, se recupera la escala original de cada bloque y se almacenan los pesos sobre esa rejilla exacta a 4 bits con group 32. Los 16 tensores abliterados se detectan por tensor y se guardan a 8 bits; el router y la torre de vision (1,15 GB) permanecen en bf16. El resultado son 17,0 GB en disco, con una media de 5,03 bits por peso en los pesos de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre su composicion de dataset, RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto, razonamiento y codigo, con soporte de modo "thinking" (razonamiento explicito) activable o desactivable en inferencia.
- Entrada multimodal: comprension de imagenes (lectura de texto en imagen, reconocimiento de objetos, conteo de formas y colores, lectura de importes) mediante la torre de vision incluida.
- Llamada a herramientas (tool calling / function calling): se reportan 9 de 9 llamadas bien formadas y ninguna filtrada como texto.
- Flujos agenticos y razonamiento multi-paso, heredados de las capacidades de Gemma 4 para tareas de codigo y razonamiento.
- Soporte multilingue amplio (mas de 140 idiomas en la familia Gemma 4).
- Soporte de prompts de sistema y contexto largo de hasta 256K tokens.
- Modelo sin rechazos (abliterado): responde a peticiones que el modelo original evita, incluidas peticiones potencialmente daninas.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de pesos abliterados frente a sus equivalentes alineados, comparando tasas de rechazo y calidad en benchmarks.
- Analisis de tecnicas de cuantizacion QAT: sirve como referencia practica para medir la deriva (KL, acuerdo top-1) de una conversion QAT-aligned frente a conversiones 4-bit estandar.
- Asistente multimodal local en Mac: lectura y descripcion de imagenes en el dispositivo gracias a la torre de vision y a un consumo de memoria contenido (17-21 GB).
- Automatizacion de tareas con agentes y tool calling: los 9 de 9 casos bien formados lo hacen apto para pipelines que requieren invocacion estructurada de funciones.
- Generacion y asistencia de codigo en local: el modo thinking y el contexto largo (256K) permiten procesar repositorios o fragmentos extensos sin salir del equipo.
- Procesamiento de documentos largos con contexto de 256K: resumen, extraccion y respuesta sobre textos extensos en multiples idiomas.
- Redaccion multilingue sin restricciones de contenido: util para generar texto en idiomas y dominios donde el modelo original aplica filtros.

## Benchmarks y rendimiento

Deriva medida respecto a una conversion de 8 bits (group 64) de la misma fuente bf16. Menor KL y mayor acuerdo implican mayor fidelidad al modelo original.

| Build de la misma fuente | KL, texto de chat | Acuerdo top-1, chat | KL, WikiText-2 | Acuerdo top-1, WikiText-2 |
|---|---|---|---|---|
| Esta build (QAT-aligned) | 0,021 | 94,7% | 0,072 | 86,1% |
| oMLX oQ4e (mixta 4 a 8-bit, imatrix) | 0,110 | 84,9% | 0,247 | 72,9% |
| MLX 4-bit estandar, group 64 | 0,161 | 81,9% | 0,360 | 67,8% |

Detalles de la medicion: texto de chat con 18K tokens de pares prompt-respuesta con formato de chat; WikiText-2 con 64 x 1024 tokens del split de test. El KL se calcula sobre los 128 tokens top del modelo de referencia mas un bucket para la probabilidad restante, con el mismo estimador para todas las builds. La referencia es a su vez de 8 bits, por lo que la distancia real a bf16 es ligeramente superior en las tres.

Otras comprobaciones (M4 Pro de 48 GB, oMLX 0.7.0):

| Prueba | Resultado |
|---|---|
| Rechazos en 104 prompts de `mlabonne/harmful_behaviors` (greedy, thinking off) | Ninguno (2 marcados por comprobacion de palabras clave, pero ambos responden) |
| Tool calls | 9 de 9 bien formadas, ninguna filtrada como texto |
| Comprobaciones con imagenes | 6 de 6 superadas (texto, importe, conteo de formas y colores, nombrar un animal) |
| MMLU-Pro (muestra de 200 preguntas, solo letra) | 101 de 200 (Gemma 4 12B QAT heretic: 81) |
| Velocidad | Prefill 694 tok/s a 8K y 576 a 32K; decode 65 tok/s en corto, 57 a 8K, 46 a 32K |
| Memoria pico | 17 GB en corto, 21 GB a 32K |

## Requisitos de hardware

- Repositorio de 17,0 GB en disco; memoria pico medida de 17 GB en contexto corto y 21 GB a 32K tokens.
- Entorno objetivo: Apple Silicon (MLX). Probado en un M4 Pro de 48 GB; se recomienda al menos 24-32 GB de memoria unificada para uso comodo, y 32-48 GB para contexto largo.
- No cabe en GPUs de consumo con poca VRAM si se ejecuta via MLX, ya que MLX no es el runtime habitual en CUDA; requiere silicio de Apple.
- Opciones de despliegue: oMLX 0.7.0 (colocando la carpeta en el directorio de modelos) y mlx-vlm (`python -m mlx_vlm.generate ...`). El `config.json` ya fija `global_head_dim` y `num_global_key_value_heads` como solucion a oMLX #3537. No se indica soporte de vLLM, llama.cpp, Ollama o TGI con este formato.
- Parametros de muestreo sugeridos (por defecto de Google): temperatura 1,0, top_p 0,95, top_k 64.
- Rendimiento medido en M4 Pro de 48 GB: prefill de 694 tok/s a 8K y 576 tok/s a 32K; decode de 65 tok/s (corto), 57 (8K) y 46 (32K). No hay datos de latencia/throughput en otras plataformas.

## Comparativa con modelos similares

Comparativa centrada en el propio linaje del modelo. Los tres primeros comparten la misma fuente bf16 y solo difieren en la cuantizacion; el cuarto es el modelo base sin abliterar ni cuantizar.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Nota |
|---|---|---|---|---|---|
| Esta build (QAT-aligned 4-bit MLX) | 25,8 B | 256K (familia) | apache-2.0 | MLX safetensors | KL 0,021 en chat; MMLU-Pro 101/200 |
| oMLX oQ4e (mixta 4-8 bit, imatrix) | 25,8 B | 256K (familia) | no disponible | no disponible | KL 0,110 en chat |
| MLX 4-bit estandar group 64 | 25,8 B | 256K (familia) | derivada del base | MLX safetensors | KL 0,161 en chat |
| gemma-4-26B-A4B-it-qat (Google, base) | 25,8 B | 256K | Gemma 4 license (Apache 2.0) | bf16 / QAT | Modelo alineado original |
| Gemma 4 12B QAT heretic | ~12 B | no disponible | no disponible | no disponible | MMLU-Pro 81/200 en la misma prueba |

No se dispone de comparaciones directas con modelos de otros desarrolladores (por ejemplo Llama o Qwen equivalentes) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado (uncensored): responde a peticiones que el modelo original rechaza. Puede generar contenido danino, ofensivo o ilegal segun el uso.
- OS-Software pide que los pesos no se desplieguen en servicios publicos o de cara al usuario final; la misma peticion se aplica a esta build. Es una recomendacion, no una restriccion legal de la licencia.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en un modelo sin filtros de rechazo puede ser especialmente critico en dominios sensibles (salud, legal, seguridad).
- Licencia: el texto se publica bajo apache-2.0, pero el modelo base esta sujeto a la licencia Gemma 4 de Google. Conviene revisar los terminos de uso comercial de dicha licencia antes de cualquier despliegue.
- La abliteracion modifico 16 tensores que ya no estan sobre la rejilla QAT; se almacenan a 8 bits, lo que introduce un grado de mezcla de precision frente a una conversion puramente 4-bit.
- El rendimiento medido (velocidad, memoria, MMLU-Pro 101/200) corresponde a un unico entorno (M4 Pro de 48 GB, oMLX 0.7.0) y a muestras pequenas; no debe generalizarse a otras plataformas.
- El MMLU-Pro reportado es solo un 50,5% en una muestra de 200 preguntas con respuestas de una sola letra, por debajo de lo esperable en modelos de mayor tamano; el modelo prioriza fidelidad de cuantizacion sobre rendimiento bruto.
- No hay informacion sobre sesgos concretos, idiomas exactos ni limitaciones especificas de contexto del modelo abliterado en la informacion disponible.
- Dependencia de la libreria y del runtime MLX (mlx-vlm, oMLX); menor portabilidad que formatos GGUF o safetensors estandar para CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dima6312/gemma-4-26B-A4B-heretic-v2-qat-aligned-4bit-mlx
- Modelo base (abliterado): https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Referencia de conversion alineada: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-q4_0-mlx-aligned
- Gemma 4 26B A4B (Google): https://huggingface.co/google/gemma-4-26B-A4B
- Gemma 4 26B A4B it (Google): https://huggingface.co/google/gemma-4-26B-A4B-it
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Gemma 4 26B A4B QAT en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b-qat
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- oMLX: https://github.com/jundot/omlx
- Incidencia oMLX #3537: https://github.com/jundot/omlx/issues/3537
