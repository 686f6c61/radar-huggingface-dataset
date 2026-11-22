# hyperionaidev/Ling-mini-2.0-tvbox-GGUF

## Resumen

Ling-mini-2.0-tvbox-GGUF es una cuantizacion extrema del modelo Ling-mini-2.0 de inclusionAI, publicada por el desarrollador independiente hyperionaidev dentro de su proyecto smolmaxxing. El objetivo no es ofrecer la mejor calidad posible, sino demostrar que un modelo MoE de 16.056.670.560 parametros (aproximadamente 1.400 millones activos, con 256 expertos de ~1 MB cada uno) puede ejecutarse en hardware de consumo extremo: concretamente en un Xiaomi TV Box S de tercera generacion con cuatro nucleos Cortex-A55 y alrededor de 1 GB de RAM util, a 5,1 tokens por segundo en conversacion real.

El modelo base, Ling-mini-2.0, es un transformer de tipo Mixture-of-Experts con 16.300 millones de parametros totales y una ventana de contexto declarada de 32.768 tokens. Esta version GGUF reduce los expertos a Q2_K usando la imatrix de bartowski, mantiene el resto de tensores en Q4_K y poda la cabeza de salida a 60.000 filas de las 157.184 originales, seleccionadas por frecuencia de tokens en un corpus ingles y multilingue. El resultado es un archivo de 5,49 GB que pagina los expertos desde almacenamiento flash bajo demanda.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de despliegue de MoE en entornos con RAM muy limitada (paginacion de expertos, enrutamiento consciente de cache, prefetch pre-gateado); por otro, advierte de que el archivo requiere un llama.cpp parcheado y no funciona con llama.cpp estandar, LM Studio ni Ollama. La licencia es MIT, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 256 expertos de ~1 MB |
| Parametros totales | 16.056.670.560 (~16,3 B) |
| Parametros activos | ~1,4 B |
| Longitud de contexto | 32.768 tokens en metadatos; ejecutado a 1.024 en el TV box |
| Tipos de cuantizacion | Expertos Q2_K (con imatrix de bartowski), resto Q4_K; cabeza de salida podada a 60.000 filas |
| Idiomas soportados | no disponible (la seleccion de la cabeza de salida uso un corpus ingles y multilingue, pero no se detallan idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (`lm2-q2-h60.gguf`, 5,49 GB) |

## Arquitectura y entrenamiento

El modelo base Ling-mini-2.0 es un transformer con arquitectura Mixture-of-Experts: 16.300 millones de parametros totales organizados en 256 expertos de aproximadamente 1 MB cada uno, de los que se activan alrededor de 1.400 millones por token. Esta publicacion no entrena el modelo, sino que lo cuantiza y modifica: los expertos se re-cuantizan a Q2_K con la imatrix de bartowski, el resto de tensores se copian en Q4_K desde el GGUF Q4_K_M de origen, y la cabeza de salida se poda de 157.184 a 60.000 filas mediante un tensor `output_ids` adicional. La seleccion de las 60.000 filas se hizo por frecuencia de tokens sobre un corpus en ingles y multilingue; los prompts pueden usar cualquier token del vocabulario original, pero la generacion queda restringida a las filas conservadas.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el runtime: un llama.cpp parcheado (base `8642541` mas `patches/llama.cpp-v0.8.0-tvbox.patch`) que incorpora paginacion de expertos desde flash (`GGML_MOE_PAGER`), enrutamiento con sesgo (`GGML_MOE_BIAS`), prefetch pre-gateado (`GGML_MOE_PREFETCH_K`, `GGML_MOE_PREFETCH_AHEAD`), arranque en caliente (`GGML_MOE_WARM`) y una cache de repack en disco (`GGML_REPACK_CACHE`). No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO en Ling-mini-2.0.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a chat.
- Razonamiento y generacion de codigo heredados del modelo base Ling-mini-2.0 (no se detallan capacidades especificas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la cabeza de salida se selecciono con un corpus ingles y multilingue, pero no se enumeran idiomas concretos.
- Capacidad especial: no se documenta thinking mode, vision ni audio en esta publicacion.
- Restriccion funcional: la generacion solo puede producir tokens dentro de las 60.000 filas de la cabeza podada; el vocabulario de entrada sigue siendo completo.

## Casos de uso

- Despliegue en hardware embebido y de bajo consumo: el caso documentado es un Xiaomi TV Box S (3rd Gen) con 4x Cortex-A55 y ~1 GB de RAM util, donde el modelo genera a 5,1 tok/s en chat real. Es adecuado porque la paginacion de expertos permite ejecutar un MoE de 16 B con una huella de ~1,13 GB RSS en modo headless.
- Experimentacion educativa con arquitecturas MoE: sirve para estudiar el comportamiento de enrutamiento de expertos, el efecto de la cuantizacion Q2_K en la calidad y el impacto del prefetch en la latencia, usando la perplexity en bits/byte como metrica comparable entre tokenizadores.
- Pruebas de concepto de asistentes conversacionales offline: con contexto de 1.024 tokens en el dispositivo, puede gestionar conversaciones cortas sin conexion en entornos sin infraestructura cloud.
- Investigacion en tecnicas de compresion extrema: el archivo documenta una receta reproducible (Q2_K en expertos, Q4_K en el resto, poda de cabeza por frecuencia) que puede aplicarse a otros MoE para medir el compromiso calidad/velocidad.
- Benchmarking de runtimes: util para comparar llama.cpp parcheado frente a implementaciones estandar en escenarios de RAM limitada, midiendo bits/byte y tokens por segundo bajo distintas configuraciones (top-8 vs top-6 expertos, bias 0,3 vs 0,25).
- Docencia y divulgacion sobre despliegue de LLM: el repositorio smolmaxxing incluye un scoreboard comparativo por clase de tamano que permite ilustrar como distintos modelos se comportan en el mismo hardware restringido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplexity en ingles (bits/byte, menor es mejor), top-8 expertos, pool 43, bias 0,3 | 1,054 |
| Perplexity en ingles (bits/byte), top-6 expertos, bias 0,25 | 1,090 |
| Velocidad en chat real (TV box) | 5,1 tok/s (5,0 en respuestas de ~600 palabras, 0/6 en bucle) |
| Velocidad con top-6 expertos | 5,3 tok/s |
| RAM RSS en modo headless | ~1,13 GB |
| Latencia por token | ~190 ms, de los cuales ~85 ms esperando lecturas de expertos desde flash |
| Comparativa Moon-Beam-8B-A1B (mismo TV box) | 0,996 bits/byte a 7,2 tok/s |
| Comparativa Bonsai-8B (mismo TV box) | 0,974 bits/byte |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son medidas del autor en hardware concreto y no son directamente comparables con evaluaciones de calidad en GPU.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,13 GB RSS en modo headless con paginacion de expertos desde flash; el archivo GGUF ocupa 5,49 GB y la cache de repack otros 5,3 GB en disco.
- GPU recomendadas: no aplica para el escenario objetivo (CPU ARM Cortex-A55). En maquinas con RAM suficiente, el llama.cpp parcheado puede cargar todos los expertos en memoria sin variables de entorno, pero no se documentan GPUs concretas.
- Cabe en GPU de consumo: no disponible; el diseno esta pensado para CPU con almacenamiento flash.
- Opciones de despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (base `8642541` + `patches/llama.cpp-v0.8.0-tvbox.patch`). No funciona con llama.cpp estandar, LM Studio ni Ollama.
- Latencia y throughput: ~190 ms por token en el TV box, 5,1 tok/s con top-8 expertos y 5,3 tok/s con top-6.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Calidad (bits/byte, TV box) | Velocidad (TV box) | Licencia |
|---|---|---|---|---|---|---|
| Ling-mini-2.0-tvbox-GGUF (esta ficha) | ~16,3 B | ~1,4 B | 32.768 (ejecutado a 1.024) | 1,054 | 5,1 tok/s | MIT |
| Moon-Beam-8B-A1B | 8 B | no disponible | no disponible | 0,996 | 7,2 tok/s | no disponible |
| Bonsai-8B | 8 B | no disponible | no disponible | 0,974 | no disponible | no disponible |

El autor senala explicitamente que este modelo es mas grande pero no mejor que las alternativas de 8 B en el mismo hardware: Moon-Beam-8B-A1B y Bonsai-8B obtienen mejor perplexity (menor bits/byte) y, en el caso de Moon-Beam, mayor velocidad. La ventaja de Ling-mini-2.0-tvbox es servir como demostracion de que un MoE de 16 B puede ejecutarse en 1 GB de RAM, no como opcion de maxima calidad.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado especifico; llama.cpp estandar, LM Studio y Ollama no cargan el archivo.
- La cabeza de salida esta podada a 60.000 de 157.184 filas: el modelo no puede generar tokens fuera de ese subconjunto, lo que puede degradar la calidad en dominios con vocabulario poco frecuente.
- La cuantizacion Q2_K en los expertos es extremadamente agresiva y penaliza la calidad; el propio autor reconoce que el modelo es peor que alternativas de 8 B en el mismo hardware.
- El contexto practico en el dispositivo objetivo es de 1.024 tokens, muy por debajo de los 32.768 declarados en metadatos.
- Riesgo de alucinacion: no se documenta una evaluacion especifica; en un modelo cuantizado a Q2_K con cabeza podada el riesgo es previsiblemente mayor que en el modelo original.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas: no se detalla la cobertura; la seleccion de la cabeza se hizo con corpus ingles y multilingue sin especificar lenguas.
- Licencia MIT, la misma del modelo original, sin restricciones adicionales documentadas para uso comercial.
- En produccion, la dependencia de lecturas desde flash introduce una latencia de ~85 ms por token que puede variar segun el almacenamiento del dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyperionaidev/Ling-mini-2.0-tvbox-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Cuantizacion de origen e imatrix: https://huggingface.co/bartowski/inclusionAI_Ling-mini-2.0-GGUF
- Repositorio smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Write-up del experimento (EXPERIMENT.md, seccion 20): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Scoreboard comparativo: https://github.com/hyperionaidev/smolmaxxing#scoreboard
- Quick start del runtime parcheado: https://github.com/hyperionaidev/smolmaxxing#quick-start
- llama.cpp: https://github.com/ggml-org/llama.cpp
