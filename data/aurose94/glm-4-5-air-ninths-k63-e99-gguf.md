# auRose94/GLM-4.5-Air-ninths-k63-e99-GGUF

## Resumen

GLM-4.5-Air-ninths-k63-e99-GGUF es una cuantización experimental del modelo GLM-4.5-Air de zai-org, publicada por el usuario auRose94 en HuggingFace. No se trata de una cuantización GGUF convencional: utiliza el formato "ninths" (k9), que almacena los pesos como flujos de dígitos en base 9 codificados con entropía (rANS) con un directorio embebido en el fichero. En tiempo de carga, el runtime materializa los pesos en Q8_0 exacto, con verificación byte a byte contra un decodificador de referencia independiente. El resultado es un contenedor de 73,45 GiB (5,706 bits/parámetro, un 35,7 % del tamaño f16) que produce salidas bit-idénticas a la cuantización Q8_0 estándar.

El modelo base, GLM-4.5-Air, es un modelo MoE (mixture of experts) de Z.ai con 78,8 mil millones de parámetros totales según los metadatos de safetensors del repositorio. La relevancia de esta publicación no está tanto en el modelo base como en el formato de compresión: demuestra que se puede reducir el tamaño del fichero a aproximadamente dos tercios del Q8_0 equivalente sin pérdida medible de calidad en tareas, al precio de requerir un fork específico de llama.cpp (rama `k9`) y tiempos de carga más largos por la decodificación en carga.

Es un artefacto de nicho dirigido a usuarios con hardware de memoria unificada de alta capacidad (se ha probado en un Ryzen AI Max+ 395 con Radeon 8060S y 96 GiB de memoria repartida) que quieran alojar el modelo completo en un único equipo, o a quien experimente con formatos de cuantización basados en codificación de entropía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-4.5-Air) |
| Parámetros totales | 78.804.922.637 (dato de safetensors del repo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la configuración de prueba usa -c 8192) |
| Tipos de cuantización | ninths k9 (k63 cuerpo / k99 embeddings, rANS, 5,706 bits/param) → materializa a Q8_0 exacto en carga; variante con rematerialización a IQ4_NL |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (formato ninths/k9 personalizado, no compatible con llama.cpp stock); 472 tensores de flujo + 331 tensores copiados; tokenizer embebido |

## Arquitectura y entrenamiento

El modelo base GLM-4.5-Air es un transformer con arquitectura mixture of experts (MoE), según los tags del repositorio. Los datos de entrenamiento, número de tokens, composición del dataset y procesos de post-entrenamiento (RLHF/DPO) del modelo base no están disponibles en la información proporcionada; deben consultarse en la documentación de zai-org/GLM-4.5-Air.

La innovación técnica de esta publicación está en el formato de contenedor, no en el modelo: los pesos cuantizados se almacenan como flujos de dígitos en base 9 comprimidos con rANS (range coding adaptativo), con escalas en una rejilla ent8 de 256 niveles y ruta de exponente en float64. El loader decodifica al cargar y materializa los tensores en Q8_0 exacto; no hay una cuantización adicional en runtime. La exactitud está verificada por compuertas por clase de tensor: 0 discrepancias en dígitos rANS, ≤ 2 ulp en escalas y 0 discrepancias de byte en el payload Q8_0 materializado. La versión v2 del formato usa 16 lanes entrelazados en tensores grandes para acelerar la decodificación (carga de ~2,5 min frente a ~9,4 min de v1). El fork también soporta contenedores de dígitos para la caché KV (`k9_4kv`/`k9_6kv`) decodificados dentro de flash attention en commits recientes.

## Capacidades

Hereda las capacidades de GLM-4.5-Air; la model card no detalla el listado completo, pero por el material de prueba publicado:

- Generación de código: la batería de validación usa 24 tareas de programación en Godot 4 con graders mecánicos (nombres de API requeridos/prohibidos por tarea).
- Razonamiento con modo thinking: la batería se ejecutó con "thinking disabled", lo que indica que el modelo base soporta modo de razonamiento conmutable.
- Decodificación especulativa vía MTP (multi-token prediction): medido con `--spec-type draft-mtp`, con 55 % de aceptación de draft y 28,9 tok/s de generación en la variante IQ4_NL.
- Plantilla de chat upstream incluida (`chat_template.jinja`), servible vía `llama-server --jinja`.
- Soporte de tool calling, agentes y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servido local de un MoE de ~79 B parámetros en hardware de memoria unificada: con 96 GiB de memoria repartida (Ryzen AI Max+ 395 / Radeon 8060S) cabe el modelo completo con offload GPU total manteniendo seis bloques tardíos de expertos en RAM del sistema, sin necesidad de múltiples GPUs.
- Ahorro de almacenamiento y transferencia: el contenedor ocupa 73,45 GiB frente a 109,4 GiB del Q8_0 stock, útil para distribuir el modelo por redes lentas o discos limitados sin sacrificar la calidad de Q8_0.
- Experimentación con formatos de cuantización: el repositorio sirve como referencia verificada (byte-exacta) para investigar codificación por entropía de pesos, con decodificadores independientes y baterías de validación reproducibles.
- Desarrollo de juegos con Godot 4 asistido por IA: la batería publicada evalúa exactamente este escenario, generando código que usa APIs concretas del motor.
- Inferencia por lotes donde la calidad Q8_0 es innegociable pero el disco es escaso: la salida es bit-idéntica al Q8_0, con el único coste en el tiempo de carga.
- Uso con llama.cpp stock sin fork: el mismo autor publica una exportación IQ4_NL totalmente materializada (`GLM-4.5-Air-iq4nl-GGUF`) que cualquier build de llama.cpp carga directamente en ~30 s con ~25,8 tok/s de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye mediciones propias de rendimiento y una batería de código:

Mediciones en A9 Mega (Ryzen AI Max+ 395 / Radeon 8060S, 16 núcleos Zen5 iGPU):

| build | tamaño fichero | carga a serving | prompt eval | generación |
|---|---|---|---|---|
| v1 streams (este repo) | 73,45 GiB | ~9,4 min | 119 tok/s | 13,4 tok/s |
| v2 16-lane (este repo) | 73,46 GiB | ~2,5 min | 119 tok/s | 13,4 tok/s |
| stock q8_0 (referencia) | 109,4 GiB | ~1,5 min | 119 tok/s | 13,4 tok/s |
| stock IQ4_NL (repo aparte) | 59,1 GiB | ~0,5 min | 142 tok/s | 25,8 tok/s (28,9 con MTP) |

Batería de código Godot 4 (24 tareas, decodificación greedy, thinking desactivado):

| brazo | resultado |
|---|---|
| ninths k63/e99 (v2) | 22/24 |
| stock q8_0 | 22/24 |

Los conjuntos de fallo por tarea son idénticos entre brazos y los recuentos de tokens coinciden dentro del ruido.

## Requisitos de hardware

- VRAM / memoria estimada: el modelo se materializa a ~113 GB en carga. Con GPUs de ≥ 128 GiB de memoria de dispositivo cabe íntegro en GPU. En una partición de memoria unificada de 96 GiB, cabe con offload GPU completo (`-ngl 99`) manteniendo los expertos enrutados de seis bloques tardíos (~14 GiB) en RAM del sistema vía `--override-tensor`.
- GPU recomendadas: AMD con soporte HIP (probado en gfx1151 / Radeon 8060S); también funciona en CPU. Para GPU completa se necesita al menos 128 GiB de memoria de dispositivo.
- Consumer GPUs: no cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su footprint de ~113 GB; el caso de uso verificado es memoria unificada de 96 GiB o superior. La variante IQ4_NL reduce el footprint a ~59-62 GB, lo que lo hace viable en configuraciones multi-GPU de consumo o Macs de memoria unificada alta.
- Despliegue: requiere el fork ninths de llama.cpp (`github.com/auRose94/llama.cpp`, rama `k9`, compilación con `-DGGML_HIP=ON` para AMD o CPU). Stock llama.cpp, Ollama y LM Studio no pueden leer este formato. Alternativa sin fork: el repo `GLM-4.5-Air-iq4nl-GGUF` del mismo autor.
- Latencia y throughput medidos: 119 tok/s de prompt eval y 13,4 tok/s de generación en iGPU de 16 núcleos Zen5 con la configuración de split descrita; carga de ~9,4 min (v1) o ~2,5 min (v2). Con MTP en la export IQ4_NL: 28,9 tok/s.
- Configuración de caché recomendada: `--cache-type-k q8_0 --cache-type-v q8_0` con flash attention activada; el fork también ofrece `k9_4kv`/`k9_6kv` para KV cache comprimida.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | Tamaño | Runtime | Licencia |
|---|---|---|---|---|---|
| GLM-4.5-Air-ninths-k63-e99 (este repo) | 78,8 B (base MoE) | ninths k9 → Q8_0 en carga | 73,45 GiB | fork llama.cpp k9 | MIT |
| GLM-4.5-Air Q8_0 stock | 78,8 B | Q8_0 GGUF | 109,4 GiB | cualquier llama.cpp | MIT |
| GLM-4.5-Air-iq4nl-GGUF (mismo autor) | 78,8 B | IQ4_NL GGUF | 59,1 GiB | cualquier llama.cpp | MIT |

En calidad medida (batería Godot 4), el contenedor ninths iguala al Q8_0 stock (22/24) con un 67 % de su tamaño; la variante IQ4_NL sacrifica precisión de pesos (RTN por bloques de 32 sobre codebook de 16 valores) a cambio de menor footprint y compatibilidad total con llama.cpp stock, con mayor velocidad de generación (25,8 tok/s frente a 13,4 tok/s en el mismo hardware).

## Limitaciones y advertencias

- Compatibilidad de runtime: el formato ninths no es legible por llama.cpp stock, Ollama, LM Studio ni otros runtimes; obliga a compilar un fork específico. Los ficheros v2 son rechazados por builds antiguas del propio fork.
- Tiempos de carga largos: ~9,4 min en v1 y ~2,5 min en v2 frente a ~1,5 min del Q8_0 stock, debido a la decodificación rANS en carga. Penaliza escenarios con reinicios frecuentes del servidor.
- Requisitos de memoria elevados: ~113 GB materializados en carga; hay que planificar la memoria (dispositivo + host) antes de arrancar.
- Sesgos conocidos: no disponibles en la información proporcionada; heredan los del modelo base GLM-4.5-Air.
- Riesgo de alucinación: no evaluado en la model card; corresponde al modelo base.
- Longitud de contexto e idiomas: no disponibles en la información proporcionada.
- Licencia: MIT, sin restricciones conocidas para uso comercial; no obstante, conviene verificar los términos del modelo base zai-org/GLM-4.5-Air.
- Proyecto de autor individual: es una cuantización de terceros sin respaldo oficial de Z.ai; las mediciones provienen de un único hardware (Ryzen AI Max+ 395) y la batería de calidad (24 tareas de Godot 4) es limitada y específica de dominio, no un benchmark estandarizado.
- La plantilla de chat no va embebida en el GGUF por diseño: hay que pasar `chat_template.jinja` al servidor explícitamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/auRose94/GLM-4.5-Air-ninths-k63-e99-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.5-Air
- Fork de llama.cpp (rama k9): https://github.com/auRose94/llama.cpp
- Export IQ4_NL compatible con stock (mismo autor): https://huggingface.co/auRose94/GLM-4.5-Air-iq4nl-GGUF
