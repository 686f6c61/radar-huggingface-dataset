# Mer0vin8ian/Qwen3.5-4B-NPU-fraQtl

## Resumen

Qwen3.5-4B-NPU-fraQtl es una cuantización GGUF Q4_0 del modelo base Qwen/Qwen3.5-4B, publicada por el usuario Mer0vin8ian y atribuida a fraQtl como contribuidor de la conversión. Su propósito es ofrecer una versión de 4 bits optimizada específicamente para ejecución en la NPU Hexagon de los SoC Snapdragon, manteniendo la totalidad de las operaciones en la NPU y sin degradar la velocidad respecto a la cuantización de referencia de unsloth. El repositorio ocupa 2,6 GB y contiene un único archivo GGUF de 2.583.180.384 bytes.

La propuesta diferencial no es tanto el modelo base (un transformer de 4.205.751.296 parámetros con contexto presumiblemente largo, aunque el dato no se detalla) como el proceso de cuantización: se aplica redondeo GPTQ ponderado por la Hessiana, se asignan precisiones mixtas (Q4_0 mayoritario, 52 tensores en Q8_0, 4 en Q4_1, 1 en Q6_K y 177 en F32) y se descarta el bloque de predicción del siguiente token. El autor reporta que esta combinación reduce la divergencia KL frente al modelo bf16 original en un 37,8 % en texto de tareas y un 28,4 % en texto general, comparado con el Q4_0 de unsloth.

Es relevante ahora porque la inferencia en dispositivo (edge) con NPUs dedicadas está ganando tracción y las cuantizaciones estándar no siempre respetan las restricciones de tipos soportados por el backend Hexagon de llama.cpp. Este archivo garantiza que las 32.165 operaciones evaluadas se ejecutan en la NPU sin rechazos, lo que lo convierte en una opción práctica para despliegues en smartphones y dispositivos embebidos con Snapdragon 8 Elite Gen 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (192 tensores), Q8_0 (52), Q4_1 (4), Q6_K (1), F32 (177) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 2.583.180.384 bytes (~2,58 GB) |
| Backend objetivo | NPU Hexagon (Snapdragon 8 Elite Gen 5, SM8850), llama.cpp b12079 |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.5-4B, por lo que hereda la arquitectura del base, que no se detalla en la información disponible. El proceso de cuantización, en cambio, sí está documentado con precisión: se parte de los pesos bf16 y se aplica redondeo GPTQ ponderado por la Hessiana (Frantar et al., 2022) usando estadísticas de un corpus de calibración propio. La asignación de precisión combina Q4_0 para la mayoría de pesos con 52 tensores en Q8_0 dentro del presupuesto de bytes: 47 de ellos (24 `ssm_beta`, 23 `ssm_alpha`) siguen la elección de unsloth, y 5 fueron seleccionados mediante un ranking de error por tensor (`blk.30` y `blk.31` `ffn_down`, `blk.23` y `blk.27` `attn_k`, `blk.30` `ssm_out`). Se elimina el bloque de predicción del siguiente token, que no se utiliza en inferencia.

La innovación técnica principal es la compatibilidad total con el backend Hexagon de llama.cpp: todos los tipos usados en las matmuls están soportados por la NPU, y el recuento de operaciones rechazadas es 0 de 32.165. El autor probó entrenamiento de recuperación (recovery training) sobre este archivo y no obtuvo ganancia (una semilla empeoró el KL de tarea un 4,4 % y otra no cambió), por lo que no se aplicó. No se dispone de información sobre el dataset de entrenamiento del modelo base, ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`).
- Seguimiento de instrucciones y tool calling: el autor evalúa explícitamente "task text" como instrucciones más tool calling, con resultados en IFEval.
- Razonamiento y conocimiento general: evaluado como "general text" (conocimiento más razonamiento) mediante divergencia KL.
- Razonamiento matemático: evaluado con GSM8K (250 preguntas), lo que indica capacidad para problemas aritméticos de varios pasos.
- Ejecución íntegra en NPU Hexagon: todas las operaciones de matmul del archivo son compatibles con el backend, sin rechazos.
- Modelo solo de texto: el autor indica explícitamente "Text model only".
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: la evaluación de respuestas se hizo con "thinking off", lo que sugiere que el modelo base podría soportar un modo de razonamiento, pero no se detalla.

## Casos de uso

- Asistentes conversacionales en smartphone: el archivo cabe en 2,58 GB y se ejecuta íntegramente en la NPU Hexagon del Snapdragon 8 Elite Gen 5, lo que permite mantener conversaciones multi-turno en el dispositivo sin enviar datos a la nube y con un consumo energético menor que la GPU.
- Tool calling en aplicaciones móviles: el modelo conserva el rendimiento en instrucciones y tool calling del base (194/250 en IFEval frente a 190/250 del Q4_0 de unsloth), por lo que puede invocar funciones locales (calendario, contactos, APIs del sistema) en flujos agénticos de varios pasos.
- Razonamiento matemático en el dispositivo: con 233/250 en GSM8K, es adecuado para resolver problemas aritméticos y de varios pasos en aplicaciones educativas o de finanzas personales sin conexión.
- Procesamiento de texto en dispositivos embebidos con Snapdragon: al usar solo tipos soportados por Hexagon, se puede desplegar en wearables, tablets o módulos IoT con el mismo SoC sin recompilar ni recurrir a fallbacks de CPU.
- Sustitución de cuantizaciones estándar en pipelines llama.cpp existentes: el archivo carga en llama.cpp estándar, por lo que se puede intercambiar por el Q4_0 de unsloth en un pipeline ya montado sin cambios de código, obteniendo mayor fidelidad al modelo original.
- Evaluación comparativa de cuantizaciones: el repositorio incluye recibos (`receipts/`) con la tabla de fidelidad, respuestas, log del dispositivo y lista de tensores Q8_0, lo que lo hace útil como referencia reproducible para investigar el impacto del redondeo GPTQ y la asignación mixta de precisión.
- Prototipado de agentes locales con restricciones de memoria: 2,58 GB dejan margen en dispositivos con 8-12 GB de RAM compartida, permitiendo cargar el modelo junto con el runtime y otras aplicaciones.

## Benchmarks y rendimiento

Fidelidad al modelo bf16 original (divergencia KL sobre 144 ventanas retenidas; menor es mejor; IC 95 % por bootstrap pareado con 2.000 remuestreos):

| Archivo | Bytes | Task KL | General KL | Task vs unsloth | General vs unsloth |
|---|---|---|---|---|---|
| unsloth Q4_0 | 2.583.221.408 | 0,04641 | 0,02874 | — | — |
| AutoRound 0.16.1 Q4_0 (Intel) | 2.611.782.976 | 0,03634 | 0,02130 | −21,7 % [−26,3; −16,8] | −25,9 % [−35,6; −16,3] |
| fraQtl Q4_0 (este repo) | 2.583.180.384 | 0,02888 | 0,02058 | −37,8 % [−41,8; −33,3] | −28,4 % [−35,7; −21,0] |

Comparación con otros archivos de 4 bits del mismo tamaño (mismas 144 ventanas y mismo scorer):

| Archivo | Bytes | Task KL | General KL | Task vs fraQtl Q4_0 | General vs fraQtl Q4_0 |
|---|---|---|---|---|---|
| unsloth IQ4_NL | 2.579.944.608 | 0,03276 | 0,01908 | +13,4 % [+7,3; +19,9] | −7,3 % [−14,4; −0,0] |
| unsloth Q4_K_S | 2.590.430.368 | 0,02842 | 0,01729 | −1,6 % [−8,0; +5,0] | −16,0 % [−22,0; −9,7] |
| fraQtl Q4_0 (este repo) | 2.583.180.384 | 0,02888 | 0,02058 | — | — |

Respuestas sobre 500 preguntas fijas (decodificación greedy, thinking off, ambos archivos en la misma GPU y misma ejecución):

| Archivo | GSM8K /250 | IFEval /250 |
|---|---|---|
| unsloth Q4_0 | 233 | 190 |
| fraQtl Q4_0 | 233 | 194 |
| Referencia bf16 | 232 | 195 |

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 5, SM8850; llama.cpp b12079 backend Hexagon; pp128 = procesamiento de prompt, tg64 = generación; tokens/s; 3 repeticiones):

| Archivo | NPU pp128 | NPU tg64 | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 955,1 ± 10,6 | 17,24 ± 0,01 | 0 de 32.165 |
| fraQtl Q4_0 | 950,1 ± 11,8 | 17,10 ± 0,04 | 0 de 32.165 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,58 GB para los pesos, más overhead del runtime de llama.cpp (KV cache y buffers según contexto, no cuantificado en la información disponible).
- GPU recomendadas: no aplica como requisito principal; el objetivo es la NPU Hexagon del Snapdragon 8 Elite Gen 5 (SM8850). El archivo también carga en llama.cpp estándar sobre CPU/GPU convencionales.
- Cabe en GPU de consumo: sí, con 2,58 GB de pesos cabe en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), aunque el rendimiento óptimo se obtiene en la NPU objetivo.
- Opciones de despliegue: llama.cpp (versión b12079 o superior con backend Hexagon), y por extensión cualquier frontend basado en llama.cpp que acepte GGUF (Ollama, LM Studio, etc., siempre que soporten los tipos Q4_0/Q8_0/Q4_1/Q6_K/F32 presentes).
- Latencia y throughput: en la NPU del Snapdragon 8 Elite Gen 5, 950,1 ± 11,8 tokens/s en procesamiento de prompt (pp128) y 17,10 ± 0,04 tokens/s en generación (tg64). En otras plataformas no se han publicado datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-NPU-fraQtl (este) | 4,21 B | No disponible | GGUF Q4_0 mixto | Apache 2.0 | Optimizado para NPU Hexagon; 0 operaciones rechazadas |
| unsloth/Qwen3.5-4B-GGUF (Q4_0) | 4,21 B | No disponible | GGUF Q4_0 | Apache 2.0 (heredada) | Referencia de velocidad; peor KL en tarea (−37,8 % vs este) |
| unsloth/Qwen3.5-4B-GGUF (Q4_K_S) | 4,21 B | No disponible | GGUF Q4_K_S | Apache 2.0 (heredada) | 16,0 % mejor en KL general; 1,6 % mejor en tarea (IC cruza cero); 7,25 MB más grande |
| Intel AutoRound 0.16.1 Q4_0 | 4,21 B | No disponible | GGUF Q4_0 | Apache 2.0 (heredada) | 28,6 MB más grande; peor KL en tarea (−20,5 %) y en general (−3,4 %, IC cruza cero) |

## Limitaciones y advertencias

- El modelo es solo de texto; no procesa imágenes, audio ni vídeo.
- La evaluación se limita a 144 ventanas KL y 500 preguntas con una única build de cada archivo; el propio autor advierte que la KL mide cercanía al modelo original, no precisión en tareas.
- No se han publicado datos sobre sesgos, toxicidad o alucinación específicos de esta cuantización; al heredar el comportamiento del Qwen3.5-4B, arrastra los sesgos del base.
- Los idiomas soportados no están documentados en la información disponible.
- La longitud de contexto no está especificada; no se debe asumir la del modelo base sin verificar la configuración de llama.cpp.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B por si añaden restricciones adicionales.
- El rendimiento medido en NPU corresponde exclusivamente al Snapdragon 8 Elite Gen 5 (SM8850) con llama.cpp b12079; en otros SoC o versiones del runtime los resultados pueden diferir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor de la model card (Mer0vin8ian) difiere del contribuidor de la conversión (fraQtl), cuyo repositorio canónico es `fraQtl/Qwen3.5-4B-NPU-GGUF`; conviene contrastar ambos antes de usarlo en producción.
- El entrenamiento de recuperación no se aplicó porque no aportó ganancia en las pruebas del autor; no se debe esperar una mejora adicional por esa vía.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mer0vin8ian/Qwen3.5-4B-NPU-fraQtl
- Repositorio canónico del contribuidor: https://huggingface.co/fraQtl/Qwen3.5-4B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Paper de GPTQ (Frantar et al., 2022): no disponible en la información proporcionada
- llama.cpp y backend Hexagon: no disponible en la información proporcionada
