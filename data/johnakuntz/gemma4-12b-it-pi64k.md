# JohnAKuntz/Gemma4-12B-it-PI64K

## Resumen

Gemma4-12B-it-PI64K es una cuantizacion GGUF de precision mixta del modelo denso `google/gemma-4-12B-it`, publicada por el usuario JohnAKuntz. Su objetivo no es ser una cuantizacion generica mas, sino una compilacion especifica para servir el contexto completo de 65.536 tokens dentro de 8 GB de RAM, apuntando explicitamente a una Raspberry Pi 5 de 8 GB. El resultado es un fichero de 5,36 GiB con 3,864 bits por peso efectivos, en lugar de una cuantizacion uniforme que obligaria a truncar contexto o a paginar memoria.

La relevancia tecnica esta en la estrategia de asignacion de bits por clase de tensor: el FFN concentra la compresion en IQ3_XXS (8,49 B de parametros), mientras que la atencion se mantiene en Q5_K (2,41 B) y el embedding atado a la salida en Q6_K (1,01 B). La matriz de importancia procede de `bartowski/gemma-4-12B-it-GGUF` y guia la rejilla de 3 bits tensor a tensor. Es, por tanto, un ejercicio de ingenieria de memoria mas que un modelo nuevo.

El modelo base es un transformer denso de 11.907.350.576 parametros con atencion hibrida (40 capas de ventana deslizante de 1024 tokens y 8 capas de atencion completa) y contexto nativo de 262.144 tokens, del que esta cuantizacion sirve 65.536. La licencia declarada es Apache 2.0 y el unico idioma listado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (40 capas SWA de ventana 1024 + 8 capas de atencion completa, `attention_k_eq_v` con 1 cabeza KV de dim 512) |
| Parametros totales | 11.907.350.576 (11,91 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens servidos (el modelo base soporta 262.144) |
| Tipos de cuantizacion | GGUF de precision mixta: FFN en IQ3_XXS, atencion en Q5_K, embedding atado en Q6_K, normas y escalas en F32; 3,864 bpw medidos |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-12B-it-PI64K.gguf`, 5.750.515.104 bytes, 667 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 11,91 B de parametros organizado en tres bloques funcionales: 8,49 B en el FFN (71 % del total, proyecciones gate/up/down), 2,41 B en atencion (q/k/v/o) y 1,01 B en el embedding atado a los logits de salida. La innovacion estructural es la atencion hibrida: 40 capas usan ventana deslizante de 1024 tokens, de modo que solo cachean esa ventana, y 8 capas mantienen atencion completa con una unica cabeza KV de dimension 512 que comparte K y V. Esa asimetria es la que hace economicamente viable un contexto de 64 K en un dispositivo de 8 GB. El modelo base es multimodal (texto, vision y audio), pero esta cuantizacion incluye unicamente la torre de texto; los proyectores `mmproj` no se distribuyen en el repo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La cuantizacion en si no reentrena pesos: aplica una matriz de importancia generada con 886 fragmentos de 512 tokens sobre `google/gemma-4-12B-it` y asigna precisión por tensor. El autor verifico a nivel de tensor que no hay degradaciones silenciosas: todas las matrices del FFN son IQ3_XXS, todas las de atencion Q5_K y el embedding Q6_K.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `--jinja` en llama.cpp.
- Razonamiento multi-turno con contexto largo: ventana servida de 65.536 tokens.
- Recuperacion de informacion en contextos extensos (needle-in-a-haystack verificado a 16.300 tokens con profundidad 0,5).
- Capacidades del modelo base no incluidas en esta cuantizacion: vision y audio (requieren ficheros `mmproj` separados, ausentes del repo).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta cuantizacion.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la model card.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking: la evaluacion se realizo con thinking desactivado; no se documenta su comportamiento con thinking activo.

## Casos de uso

- Asistente conversacional local en Raspberry Pi 5 de 8 GB: el modelo cabe con ~1 GiB de margen sobre los ~7,7 GiB utiles de un sistema headless, lo que permite desplegar un asistente de texto completamente offline en hardware de bajo coste.
- Procesamiento de documentos largos en el borde: con 65.536 tokens de contexto se pueden ingerir informes, contratos o transcripciones extensas sin truncar, algo inviable con cuantizaciones uniformes de 4 bits en el mismo hardware.
- Clasificacion y extraccion de informacion sobre corpus largos: la ventana completa permite pasar un documento entero y pedir extraccion estructurada en una sola pasada, evitando pipelines de chunking con perdida de contexto.
- Prototipado y evaluacion de modelos de 12 B sin GPU: el binario corre en CPU x86 con AVX2 o en los cuatro nucleos Cortex-A76 de la Pi 5, util para validar prompts y flujos antes de escalar a infraestructura con GPU.
- Despliegue en entornos con restricciones de conectividad o privacidad: al ejecutarse con llama.cpp en local y licencia Apache 2.0, encaja en escenarios donde los datos no pueden salir del dispositivo.
- Servicio de inferencia de un solo slot para cargas por lotes: con `-np 1` y `--ctx-checkpoints 0` el consumo se mantiene estable (6,4-6,55 GB medidos en 30 peticiones no relacionadas y un prompt de 16 K), adecuado para procesar colas de trabajos secuenciales.
- Educacion e investigacion sobre cuantizacion: el repo documenta la asignacion de bits por tensor, los flags criticos y las mediciones de RSS, lo que lo convierte en material de referencia para estudiar el compromiso entre precision y memoria.

## Benchmarks y rendimiento

Evaluacion MMLU-style de opcion multiple, decodificacion greedy, thinking desactivado, orden fijo (10 materias x 20 preguntas = 200 items):

| Modelo | Tamano | Correctas | Sin parsear |
|---|---:|---:|---:|
| Esta cuantizacion | 5,75 GB | 141/200 = 70,5 % | 10 |
| Esta cuantizacion (mismos 100 items que la referencia) | 5,75 GB | 68/100 = 68,0 % | — |
| QAT Q4_0 oficial (`google/gemma-4-12B-it-qat-q4_0-gguf`) | 6,98 GB | 72/100 = 72,0 % | 7 |

Comparacion pareada sobre los mismos 100 items: 67 aciertos en ambos, 1 solo en esta compilacion, 5 solo en QAT. McNemar exacto p = 0,22, error estandar de la diferencia ~2,4 puntos. La diferencia de 4 puntos no es estadisticamente distinguible de cero con n=100. Las respuestas sin parsear cuentan como incorrectas en ambos modelos.

Contexto largo: needle-in-a-haystack a profundidad 0,5 con un prompt de 16.300 tokens devolvio la frase oculta exacta (`FOUND`), con 2120 s de prefill (~7,7 tok/s de media). La asignacion de 65.536 tokens esta verificada (611 MiB de KV, 6,54 GB de RSS sirviendo), pero no se ejecuto un needle completo de 64 K por el coste de prefill (1,5-2 h en el host de compilacion).

Velocidad en host x86 de 4 nucleos AVX2 sin GPU: ~12,5 tok/s de procesamiento de prompt y ~2,3 tok/s de generacion. Los cuatro nucleos Cortex-A76 de una Pi 5 estan en el mismo orden de magnitud para matmul cuantizado.

## Requisitos de hardware

- VRAM/RAM para inferencia: 6,54 GB de RSS pico (6,10 GiB) sirviendo con contexto de 65.536; desglose medido: 5,36 GiB de pesos (mmap), 0,60 GiB de KV cache (K en q8_0, V en q4_0), 0,19 GiB de buffer de grafo/computo con ubatch 256 y flash-attn activado.
- Cabe en Raspberry Pi 5 de 8 GB con ~1 GiB de margen sobre los ~7,7 GiB utiles de un sistema headless.
- GPU recomendadas: no se documentan pruebas en GPU en la informacion disponible; el autor reporta mediciones en CPU x86 con AVX2 y en la Pi 5.
- Cabe en GPU de consumo: no confirmado; el fichero de 5,36 GiB cabria en GPUs con 8 GB o mas de VRAM, pero no hay datos de rendimiento publicados en ese escenario.
- Opciones de despliegue: llama.cpp (`llama-server`), con compilacion nativa (`-DGGML_NATIVE=ON -DLLAMA_CURL=OFF -DCMAKE_BUILD_TYPE=Release`). El repo incluye `run-pi.sh` con el comando completo. Compatible con endpoints (`endpoints_compatible`).
- Flags criticos en 8 GB: `--no-repack` (evita +0,7 GiB por la copia de tensores Q5_K del repacking en tiempo de ejecucion) y `--ctx-checkpoints 0` (sin el, una tanda de 200 preguntas alcanzo 13,6 GiB de RSS). Con ambos desactivados, el RSS se mantuvo en 6,4-6,55 GB.
- Parametros de servicio de referencia: `-c 65536 -np 1 -t 4 -tb 4 -b 512 -ub 256 -fa on -ctk q8_0 -ctv q4_0 --jinja --load-mode mmap+mlock`. Mantener `-np 1`: mas slots multiplican la KV cache.
- Latencia y throughput: ~12,5 tok/s de prefill y ~2,3 tok/s de generacion en CPU x86 de 4 nucleos. El prefill domina en contexto largo: 64 K tokens a ~12 tok/s supera la hora para un prompt en frio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | MMLU-style | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Gemma4-12B-it-PI64K (esta cuantizacion) | 11,91 B | 65.536 | 5,75 GB | 68,0 % (n=100) | Apache 2.0 | GGUF en HF |
| Gemma-4-12B-it QAT Q4_0 oficial | 11,91 B | no disponible en la informacion | 6,98 GB | 72,0 % (n=100) | Apache 2.0 | GGUF en HF |
| Gemma-4-12B-it Q3_K_M uniforme | 11,91 B | no disponible en la informacion | 5,69 GB | no disponible | Apache 2.0 | GGUF en HF |
| Gemma-4-12B-it Q4_K_M uniforme | 11,91 B | no disponible en la informacion | 7,12 GB | no disponible | Apache 2.0 | GGUF en HF |

La comparacion relevante es contra las cuantizaciones uniformes del mismo modelo base. Q4_K_M (7,12 GB) no cabe en una placa de 8 GB con cache de 64 K; Q3_K_M (5,69 GB) si cabe pero gasta el mismo ~3,4 bpw en embedding y atencion que en el FFN, lo que el autor considera un reparto suboptimo. La QAT Q4_0 oficial es la referencia de calidad (72,0 % frente a 68,0 %), pero con una diferencia no significativa a n=100 y un tamano mayor. No se han localizado en la informacion proporcionada comparaciones con modelos de otros fabricantes de tamano equivalente.

## Limitaciones y advertencias

- Los pesos del FFN en 3 bits tienen un coste real de calidad: la estimacion puntual queda por debajo de la referencia QAT de 4 bits (68,0 % frente a 72,0 %), aunque la diferencia no es estadisticamente significativa con n=100. El propio autor lo formula como "no se detecta degradacion medible a n=100", no como ausencia de degradacion.
- El prefill domina en contexto largo: 64 K tokens a ~12 tok/s supera la hora para un prompt en frio. La ventana es asequible en RAM, no en tiempo.
- Solo texto: las torres de vision y audio del modelo base no estan incluidas; se distribuyen como ficheros `mmproj` separados que no forman parte de este repo.
- Solo ingles: el campo `language` del modelo declara unicamente `en`.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las advertencias habituales de un modelo de 12 B con cuantizacion agresiva en el FFN.
- Sesgos conocidos: no documentados en la model card.
- Sin datos de uso: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Requiere flags especificos en 8 GB (`--no-repack`, `--ctx-checkpoints 0`); sin ellos el ajuste de memoria se rompe de forma silenciosa y el RSS puede dispararse hasta 13,6 GiB.
- Licencia Apache 2.0 declarada por el cuantizador; conviene verificar los terminos del modelo base `google/gemma-4-12B-it` antes de uso comercial.
- No hay resultados de benchmarks en GPU ni datos de throughput en hardware con aceleracion, lo que limita la planificacion de despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JohnAKuntz/Gemma4-12B-it-PI64K
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Cuantizacion QAT Q4_0 oficial: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Matriz de importancia y GGUF de referencia: https://huggingface.co/bartowski/gemma-4-12B-it-GGUF
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
