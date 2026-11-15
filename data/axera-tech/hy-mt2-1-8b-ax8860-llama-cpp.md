# AXERA-TECH/Hy-MT2-1.8B-AX8860-llama.cpp

## Resumen

Hy-MT2-1.8B-AX8860-llama.cpp es una distribucion especializada del modelo de traduccion multilingue Hy-MT2-1.8B de Tencent, publicada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante llama.cpp con el backend ggml-axera. No se trata de un nuevo modelo de lenguaje, sino de un paquete de despliegue que incluye los pesos en formato GGUF (Q8_0), binarios estaticos para el hardware, kernels NPU precompilados (prefill y decode) y scripts de ejecucion y benchmark.

El modelo base es un transformer de aproximadamente 1.791 millones de parametros (1,8B) orientado especificamente a traduccion automatica multilingue, con una ventana de contexto declarada de hasta 131.072 tokens. La distribucion de AXERA-TECH resuelve un problema concreto de ingenieria: llevar un modelo de traduccion de este tamano a un acelerador de bajo consumo (NPU de 4 nucleos) manteniendo velocidades de decodificacion cercanas a 70 tokens/s.

Es relevante ahora porque demuestra la viabilidad de servir traduccion multilingue de calidad en hardware de borde (edge) con interfaz compatible con la API de OpenAI, lo que facilita la integracion en aplicaciones sin depender de infraestructura cloud. La ficha se centra en las caracteristicas de la distribucion AX8860 y en las capacidades del modelo base segun la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles internos no disponibles); inferencia via llama.cpp con backend ggml-axera |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | hasta 131.072 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF publicado, 1,91 GB); F16 GGUF tambien cargable; pesos convertidos a MXFP8 en carga, KV cache en BF16 |
| Idiomas soportados | zh, en, ja, ko, fr, de, ru, es (segun los codigos aceptados por `run.sh -t`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Hy-MT2-1.8B-Q8_0.gguf`), md5 `1c4b638e9ea465a06264c06bbf423a52` |

## Arquitectura y entrenamiento

La distribucion no aporta detalles sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF/DPO), por lo que estos datos deben consultarse en la model card original de `tencent/Hy-MT2-1.8B`, no incluida en la informacion proporcionada. Lo que si documenta la distribucion es la arquitectura de despliegue: los pesos GGUF se convierten en tiempo de carga a MXFP8, la KV cache se mantiene en BF16 y el modelo se ejecuta con llama.cpp compilado contra ggml-axera (fuente `ZHEQIUSHUI/llama.cpp` en el commit `1970d6c5d`).

Una innovacion tecnica destacable es la compilacion de kernels NPU especificos para prefill y decode (este ultimo incluye la cabeza de salida), con un unico conjunto de kernels que cubre hasta 131.072 tokens y asigna la KV cache segun el parametro `-c`. El modelo base no dispone de cabeza MTP (multi-token prediction) ni de ramas de thinking o tool calling en su chat template, lo que confirma su orientacion exclusiva a traduccion. Los binarios de la placa estan enlazados estaticamente y requieren el runtime del SDK en `/opt/lib`.

## Capacidades

- Traduccion automatica multilingue entre chino, ingles, japones, coreano, frances, aleman, ruso y espanol (pares gestionados por los codigos `zh en ja ko fr de ru es`).
- Generacion de texto de salida limpia: el prompt oficial instruye a producir solo la traduccion, sin explicaciones adicionales.
- Manejo de expresiones idiomaticas y frases tecnicas con numeros, verificado en la placa para combinaciones zh, en, ja y fr.
- Servicio HTTP compatible con la API de OpenAI (`/v1/chat/completions`) mediante `run.sh -s <puerto>`.
- Modo conversacional por linea de comandos (`run.sh -c`), limitado a terminales interactivas.
- No dispone de tool calling, function calling, modo thinking ni cabeza MTP segun la model card.
- No se documentan capacidades de vision, audio, codigo o matematicas; el modelo esta especializado en traduccion.

## Casos de uso

- Traduccion de documentacion tecnica en local: el modelo procesa prompts de 3.906 tokens en 0,51 s y decodifica a 57 tokens/s con contexto de 8k, por lo que puede traducir articulos o manuales completos por fragmentos en un dispositivo de borde sin enviar datos a la nube.
- Servicio de traduccion autoalojado para equipos internos: `run.sh -s 8080` expone una API compatible con OpenAI, permitiendo sustituir llamadas a proveedores externos en aplicaciones existentes cambiando solo la URL base.
- Traduccion de subtitulos y contenido audiovisual: con decodificacion a ~69,5 tokens/s en prompts cortos, el modelo puede procesar lineas de dialogo individuales en tiempo casi real.
- Atencion al cliente multilingue en kioscos o dispositivos empotrados: al ejecutarse sobre una NPU de 4 nucleos con consumo reducido, es adecuado para traducir mensajes de usuarios entre espanol, ingles, chino y japones en entornos sin conectividad garantizada.
- Localizacion de aplicaciones y software: la instruccion de prompt fuerza salida solo traduccion, lo que simplifica el postprocesado en pipelines de localizacion automatizados para cadenas de UI y mensajes de error.
- Traduccion de correspondencia y documentacion juridica o administrativa sensible: al ejecutarse en hardware local, los textos no salen de la infraestructura del cliente, lo que ayuda a cumplir requisitos de confidencialidad.
- Evaluacion y prototipado de hardware de inferencia: `bench.sh` y `bench.sh ppl` permiten reproducir throughput y perplexidad (PPL zh 29,52 con `-ub 1`, en 16,35) para comparar configuraciones de contexto y batching.

## Benchmarks y rendimiento

Rendimiento de la distribucion AX8860 (generacion de 50 tokens, segun `bench.sh`):

| Prompt | Contexto (`-c`) | Tiempo de prompt | Decode (tokens/s) |
|---|---:|---:|---:|
| 5 tokens | 8192 | 0,03 s | 69,5 |
| 47 tokens | 8192 | 0,05 s | 68,3 |
| 3906 tokens | 8192 | 0,51 s | 57,2 |
| 5 tokens | 131072 | 0,03 s | 69,8 |
| 3906 tokens | 131072 | 0,51 s | 57,0 |

Cifras agregadas: decode 69,5 tokens/s; prefill de 4k a 7.653 tokens/s; carga del modelo entre 19,2 y 23,5 s.

Perplexidad (`-c 512`):

| Idioma | `-ub 1` | `-ub 4` |
|---|---:|---:|
| Chino | 29,52 | 29,37 |
| Ingles | 16,35 | 16,53 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU/COMET) en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con runtime del SDK instalado en `/opt/lib`; el modelo no se ejecuta en GPU convencional segun la informacion disponible.
- Los binarios de la placa estan enlazados estaticamente y requieren invocacion via `sh run.sh` (los scripts descargados de Hugging Face carecen de permisos de ejecucion).
- La distribucion consume los 4 nucleos de NPU de forma exclusiva; el servidor se ejecuta con `-np 1`.
- Memoria: pesos Q8_0 de 1,91 GB, convertidos a MXFP8 en carga; la KV cache en BF16 se asigna segun `-c` (ajustable con la variable de entorno `CTX`).
- Despliegue: llama.cpp con backend ggml-axera (fuente `ZHEQIUSHUI/llama.cpp` @ `1970d6c5d`); servidor compatible con OpenAI.
- Latencia y throughput: prefill de 3.906 tokens en 0,51 s; decode entre 57 y 69,8 tokens/s segun longitud de contexto y prompt; carga del modelo en 19,2-23,5 s.
- No se dispone de datos de VRAM para GPU ni de compatibilidad con vLLM, TGI u Ollama en esta distribucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-AX8860 (esta ficha) | 1,8B | 131.072 | NPU Axera AX8860 via llama.cpp | no disponible | Hugging Face, repo de 2,0 GB |
| tencent/Hy-MT2-1.8B (base) | 1,8B | no disponible en esta ficha | Generico (formato original) | no disponible | Hugging Face |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables de traduccion en la misma categoria para establecer una comparativa de rendimiento (BLEU/COMET) o licencia.

## Limitaciones y advertencias

- Modelo especializado en traduccion: no se debe esperar razonamiento general, generacion de codigo, matematicas ni conversacion abierta de calidad.
- Sin tool calling ni modo thinking: el chat template no incluye estas ramas, lo que limita su uso en pipelines de agentes.
- Dependencia de hardware propietario: requiere una NPU Axera AX8860 y el SDK correspondiente; no es portable a GPU convencional en esta distribucion.
- Riesgo de alucinacion y omisiones en textos largos o muy especializados; la model card solo verifica correccion en zh, en, ja y fr, no en ko, de, ru y es.
- El prompt de traduccion esta fijado en chino en los scripts; cambiar el idioma de instruccion puede alterar el comportamiento.
- Licencia no disponible: es imprescindible verificar la licencia del modelo base `tencent/Hy-MT2-1.8B` antes de cualquier uso comercial.
- Perplexidad en chino (29,52) notablemente superior a la de ingles (16,35), lo que sugiere un ajuste desigual entre idiomas.
- El modelo carga pesos convertidos a MXFP8, una precision reducida que puede afectar la fidelidad en dominios sensibles.
- El modo conversacional (`run.sh -c`) exige terminal interactiva y el servidor opera con una sola peticion concurrente (`-np 1`), limitando el throughput agregado.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/Hy-MT2-1.8B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Fuente de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (commit `1970d6c5d`)
- Axera AX8860: no disponible enlace oficial en la informacion proporcionada
