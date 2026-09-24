# freakyskittle/K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF es la conversión a formato GGUF para llama.cpp del checkpoint Blackfrost-AI/K2-Horizon-MoVA-36B-A4B-DERISKED-BF16, que a su vez es una derivada a nivel de pesos de IFM/K2-Horizon-MoVA-36B-A4B. El repositorio lo publica el usuario freakyskittle y su alcance es exclusivamente el reempaquetado de los pesos en cuantizaciones GGUF listas para inferencia local; el autor declara que la arquitectura, el tokenizer y la plantilla de chat siguen siendo de IFM. El origen es un modelo de arquitectura `k2-horizon`, de tipo transformer con mezcla de expertos (MoE) y un esquema adicional de expertos de valor (MoVA), con 36B parámetros totales y unos 4B activos por token.

La relevancia de esta ficha está en que permite ejecutar un modelo MoE de gran tamaño en hardware de gama media-alta mediante cuantización agresiva, manteniendo un contexto nativo de 524.288 tokens. El precio a pagar es la dependencia de un fork concreto de llama.cpp: la versión upstream no puede cargar la arquitectura `k2-horizon`, por lo que hay que compilar la rama `model/K2Horizon` de MBZUAI-IFM en el commit `42adf01`. La model card documenta qué cuantizaciones generan texto legible y cuáles no, dato poco habitual y muy útil para evitar descargas inútiles.

Además, el repositorio tiene un volumen de 307,4 GB porque incluye todas las cuantizaciones en un único repo, desde 8,0 GiB (TQ1_0) hasta 37,1 GiB (Q8_0). El recuento real de parámetros en safetensors es de 37.444.792.020, ligeramente por encima de los 36B que indica la model card. La licencia declarada es Apache-2.0 y el único idioma soportado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2-horizon` (transformer con MoE y MoVA) |
| Parametros totales | 37.444.792.020 segun safetensors; la model card indica 36B |
| Parametros activos | Aproximadamente 4B por token (MoE, 8 expertos enrutados activos de 100) |
| Longitud de contexto | 524.288 tokens nativos |
| Tipos de cuantizacion | IQ3_M, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q4_K_DYN, Q4_0, Q4_1, MXFP4_MOE, Q5_K_M, Q6_K, Q8_0, TQ1_0, TQ2_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en BF16 |
| Capas | 48 (3 densas y 45 MoE) |
| Tamano oculto | 2560 |
| Cabezas de atencion | 32 de consulta / 8 de clave-valor, dimension de cabeza 128 |
| MoE | 100 expertos enrutados, 8 activos, 1 experto compartido |
| MoVA | 64 expertos de valor, 4 activos, en las capas MoE |
| FFN de experto | 768 |
| FFN densa | 6144 |
| Vocabulario | 250624, embeddings no atados |
| Rope theta | 10000000 |
| Enrutador | sigmoide, pesos top-k normalizados, escala 2,5 |
| Normalizacion | RMSNorm agrupada, 2 grupos, eps 1e-6 |

## Arquitectura y entrenamiento

La arquitectura `k2-horizon` combina un tronco transformer con 48 capas, de las cuales las 3 primeras son densas y las 45 restantes usan mezcla de expertos. En cada capa MoE hay 100 expertos enrutados con 8 activos y un experto compartido, con un FFN de experto de dimension 768 frente a las 6144 de la FFN densa. Sobre las capas MoE se añade el mecanismo MoVA, con 64 expertos de valor de los que 4 están activos. El enrutador usa función sigmoide y normaliza los pesos top-k con escala 2,5, y los tensores de enrutamiento (`attn_v_gate`) se mantienen en F32 en todas las cuantizaciones. El modelo emplea RMSNorm agrupada con dos grupos y epsilon 1e-6, embeddings no atados y un vocabulario de 250624 entradas.

El repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos figuran como no disponibles. Lo que sí se documenta es la ascendencia de los pesos: el checkpoint original es IFM/K2-Horizon-MoVA-36B-A4B en el commit `7730b92d1b574e04663b04023d5d6fa83475432f`, sobre el que Blackfrost-AI produce una derivada de comportamiento a nivel de pesos etiquetada como DERISKED. El autor advierte explícitamente de que esa etiqueta es una marca de investigación y no una afirmación de seguridad, de ausencia de rechazos ni de puntuaciones de benchmark sin cambios.

En el plano de la inferencia, la innovación práctica es la combinación de 4B parámetros activos por token con ventanas de contexto de hasta 524.288 tokens. La model card indica que el modelo abre la respuesta con un bloque de razonamiento delimitado por `<ifm|think>` y que los parámetros de muestreo recomendados aguas arriba son temperatura 1,0, top_p 0,95 y esfuerzo de razonamiento alto. Los tensores de enrutamiento en F32 y la ausencia de matriz de importancia (el pase de imatrix falló durante la carga) son dos detalles relevantes para quien quiera reproducir el proceso de cuantización.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat propia que requiere `--jinja` en llama.cpp.
- Modo de razonamiento explicito: la salida se envuelve en la etiqueta `<ifm|think>`, tal como muestra la muestra legible de la model card.
- Procesamiento de contexto largo: hasta 524.288 tokens nativos, adecuado para documentos extensos en una sola pasada.
- Eficiencia de computo por token: solo unos 4B parametros activos por token, aunque los 36B deben residir en memoria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modo de razonamiento con `<ifm|think>` es el unico indicio recogido.
- Capacidades multilingues: solo ingles declarado en la model card.
- Capacidades especiales: no se documentan vision ni audio.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 524.288 tokens de contexto nativo, se puede cargar un manual completo o un repositorio de especificaciones en una sola ventana y pedir resúmenes o extraccion de requisitos sin trocear el texto.
- Revision de expedientes legales o contractuales largos: el contexto amplio permite comparar clausulas distribuidas a lo largo de cientos de paginas en una unica consulta, manteniendo la coherencia entre secciones.
- Asistente conversacional autoalojado en ingles: el modelo se puede servir con `llama-server` en la rama `model/K2Horizon` y exponer una API local, de modo que los datos no salgan de la infraestructura propia.
- Redaccion asistida y generacion de texto largo: el modo de razonamiento previo (`<ifm|think>`) es util para tareas que requieren planificacion antes de escribir, como informes o articulos estructurados.
- Investigacion sobre arquitecturas MoE y MoVA: el repositorio ofrece 14 cuantizaciones distintas del mismo checkpoint, lo que facilita estudios comparativos de calidad frente a tamano y de comportamiento del enrutador con expertos congelados.
- Prototipado en hardware de gama media: la cuantizacion IQ4_XS (18,9 GiB) funciona en CPU a 12,9 tok/s en el equipo de pruebas documentado, lo que permite experimentar sin GPU dedicada.
- Servicio de inferencia con API compatible: la etiqueta `endpoints_compatible` y el uso de `llama-server` permiten integrarlo en un endpoint HTTP estilo OpenAI para pruebas internas.
- Destilacion o generacion de datos sinteticos en ingles: al ser un modelo base con licencia Apache-2.0, se puede usar para producir corpus etiquetados, siempre que se asuma el riesgo de alucinacion descrito mas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente recoge pruebas de generacion cualitativas con el prompt fijo `The capital of France is`, temperatura 0 y `--jinja`, ejecutadas en un equipo con Ryzen 6850H y Radeon 680M. Los resultados de velocidad y legibilidad se resumen en la tabla siguiente.

| Cuantizacion | Tamano | Texto legible | Modo de ejecucion | Velocidad |
|---|---|---|---|---|
| IQ3_M | 15,4 GiB | Si | Vulkan, `-ngl 99` | 7,1 tok/s |
| IQ4_XS | 18,9 GiB | Si | CPU | 12,9 tok/s |
| IQ4_NL | 19,9 GiB | Si | CPU (maquina compartida) | 0,3 tok/s |
| Q4_K_M | 20,9 GiB | Si | CPU (`-ngl 99` provoco `ErrorDeviceLost`) | no disponible |
| Q5_K_M | 24,7 GiB | Si | CPU | 2,3 tok/s |
| Q6_K | 28,7 GiB | Si | CPU | 0,5 tok/s |
| Q8_0 | 37,1 GiB | Si | CPU | 0,4 tok/s |
| TQ1_0 | 8,0 GiB | No (palabras sueltas) | Vulkan | ~9 tok/s |
| TQ2_0 | 9,6 GiB | No (palabras sueltas) | Vulkan | ~14 tok/s |
| Q4_K_S | 19,9 GiB | No probado | Subido | no disponible |
| Q4_0 | 19,8 GiB | No probado | Subido | no disponible |
| Q4_1 | 22,0 GiB | No probado | Subido | no disponible |
| MXFP4_MOE | 20,3 GiB | No probado | Subido (tensores MoE en MXFP4) | no disponible |
| Q4_K_DYN | 21,2 GiB | No probado | Subido (4 bits mixto) | no disponible |

El autor advierte que las velocidades de CPU no constituyen un benchmark, porque varias ejecuciones compartieron maquina con el proceso de cuantizacion, y que las cuantizaciones Q8_0, Q6_K y Q5_K_M rechazaron `-ngl 99` con el error `failed to fit params to free device memory` en la GPU de 680M.

## Requisitos de hardware

- VRAM o RAM minima: 8,0 GiB para TQ1_0 y 9,6 GiB para TQ2_0, pero ambas generan texto ilegible. La opcion util mas pequena es IQ3_M, con 15,4 GiB.
- Rangos por cuantizacion: IQ4_XS 18,9 GiB, IQ4_NL 19,9 GiB, Q4_K_S 19,9 GiB, Q4_0 19,8 GiB, MXFP4_MOE 20,3 GiB, Q4_K_M 20,9 GiB, Q4_K_DYN 21,2 GiB, Q4_1 22,0 GiB, Q5_K_M 24,7 GiB, Q6_K 28,7 GiB y Q8_0 37,1 GiB.
- Memoria total: los 36B pesos deben residir integramente en RAM o VRAM; los 4B activos son coste de computo por token, no tamano de fichero. Hay que sumar la cache KV correspondiente al contexto, que con 524.288 tokens resulta inviable en equipos de gama de consumo.
- GPU de consumo: la unica prueba con offload completo satisfactoria fue IQ3_M con `-ngl 99` sobre una Radeon 680M integrada, a 7,1 tok/s. El intento de `-ngl 99` con Q4_K_M provoco `ErrorDeviceLost`. No hay datos publicados para RTX 4090, A100 o H100.
- CPU: IQ4_XS alcanzo 12,9 tok/s en un Ryzen 6850H; Q5_K_M, Q6_K y Q8_0 quedaron en 2,3, 0,5 y 0,4 tok/s respectivamente.
- Opciones de despliegue: obligatorio el fork de MBZUAI-IFM, rama `model/K2Horizon`, commit `42adf01`. La version upstream de llama.cpp no puede cargar `k2-horizon`. Compilacion de ejemplo con `cmake -B build -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release` y los objetivos `llama-server` y `llama-cli`.
- Ajustes de inferencia: plantilla de chat propia que solo se aplica con `--jinja`; muestreo recomendado temperatura 1,0 y top_p 0,95; en la GPU 680M de las pruebas es necesario `GGML_VK_DISABLE_ASYNC=1` para evitar salidas corruptas.
- Compatibilidad con otros runners: no disponible. Al requerir un fork concreto de llama.cpp, no se puede asumir funcionamiento en Ollama, TGI, vLLM u otras herramientas basadas en llama.cpp upstream.
- Advertencia de plataforma: en Windows, MSVC puede rechazar el patron del tokenizer con `Failed to process regex`; el autor recomienda usar el mismo fork en Linux.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoria en la informacion proporcionada. La unica comparacion posible es dentro de la propia estirpe del modelo, que comparte arquitectura, tokenizer y plantilla.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| IFM/K2-Horizon-MoVA-36B-A4B | 36B totales, ~4B activos | 524.288 tokens | Apache-2.0 | no disponible | no disponible |
| Blackfrost-AI/K2-Horizon-MoVA-36B-A4B-DERISKED-BF16 | 36B totales, ~4B activos | 524.288 tokens | Apache-2.0 | BF16 | no disponible |
| freakyskittle/K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF | 37.444.792.020 (recuento safetensors) | 524.288 tokens | Apache-2.0 | GGUF (14 cuantizaciones) | Solo pruebas de generacion cualitativas |

## Limitaciones y advertencias

- Idiomas: solo ingles declarado. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Etiqueta DERISKED: el autor subraya que es una marca de investigacion de Blackfrost y no una garantia de seguridad, de cero rechazos ni de puntuaciones de benchmark intactas respecto al modelo original.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion; en tareas de facto-checking o extraccion de datos hay que validar las salidas.
- Sesgos: no disponible. La model card no documenta analisis de sesgos ni composicion del corpus de entrenamiento.
- Cuantizaciones defectuosas: TQ1_0 y TQ2_0 producen ensalada de palabras y no deben usarse. Otras cinco cuantizaciones figuran como no probadas (Q4_K_S, Q4_0, Q4_1, MXFP4_MOE, Q4_K_DYN).
- Dependencia de fork: sin la rama `model/K2Horizon` en el commit `42adf01`, el modelo no carga. Esto bloquea su uso en la mayoria de herramientas de inferencia basadas en llama.cpp upstream y complica el mantenimiento a largo plazo.
- Plantilla de chat obligatoria: sin `--jinja` no se aplica la plantilla, lo que degrada la calidad de las respuestas conversacionales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la arquitectura, el tokenizer y la plantilla de chat siguen siendo propiedad de IFM, y los pesos son una derivada de Blackfrost; conviene revisar el fichero `LICENSE` y la card del modelo original antes de un despliegue productivo.
- Contexto en la practica: aunque la ventana nativa es de 524.288 tokens, el propio autor indica que un equipo de clase 680M no puede servir esa ventana; la cache KV a esa longitud exige mucha mas memoria que los pesos.
- Longevidad: el repositorio se creo el 24 de septiembre de 2026 y tiene 45 descargas y 1 like en el momento del analisis, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- Repositorio pesado: 307,4 GB en total; conviene descargar solo el fichero GGUF de la cuantizacion elegida en lugar de clonar el repositorio completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF
- Checkpoint base BF16: https://huggingface.co/Blackfrost-AI/K2-Horizon-MoVA-36B-A4B-DERISKED-BF16
- Modelo original de IFM: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Fork de llama.cpp necesario (rama `model/K2Horizon`): https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon
- Fichero de licencia del repositorio: `LICENSE` dentro de https://huggingface.co/freakyskittle/K2-Horizon-MoVA-36B-A4B-DERISKED-GGUF
