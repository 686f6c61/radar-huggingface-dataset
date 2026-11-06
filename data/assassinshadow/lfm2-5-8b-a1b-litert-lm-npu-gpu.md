# assassinshadow/LFM2.5-8B-A1B-LiteRT-LM-NPU-GPU

## Resumen

LFM2.5-8B-A1B es un modelo de lenguaje de tipo mixture of experts (MoE) desarrollado por LiquidAI, con 8.000 millones de parámetros totales y 1.000 millones activos por token (4 de 32 expertos). Esta ficha concreta, publicada por el usuario assassinshadow, no es el modelo original en formato estándar, sino un empaquetado cuantizado a int4 y compilado para LiteRT-LM, la pila de inferencia on-device de Google AI Edge, con el objetivo de ejecutarlo en teléfonos Android. Se distribuyen dos variantes: una compilada para la NPU Hexagon del Snapdragon 8 Gen 1 (SM8450) mediante contextos QNN, y otra para GPU o CPU sobre cualquier dispositivo arm64 con RAM suficiente.

El interés de este artefacto reside en que demuestra inferencia de un MoE de 8B en un móvil de 2022, algo poco habitual: la variante NPU alcanza unos 6 tok/s de decodificación y la de GPU 6,3 tok/s, con ventanas de contexto de 4096 y 8192 tokens respectivamente. Para lograrlo, el autor elimina 88 de los 704 expertos (los menos seleccionados por el router sobre texto en inglés) y comparte embeddings y lm_head, reduciendo el peso a entre 3,99 y 4,07 GB.

Es relevante ahora porque muestra el estado práctico del despliegue on-device de modelos MoE con cuantización GPTQ int4 y ejecución en aceleradores heterogéneos (DSP Hexagon, GPU y CPU) dentro de Android, con un endpoint compatible con OpenAI servido desde la propia aplicación AutoDroid Studio. No se trata de un checkpoint para servidores, sino de un binario de despliegue con limitaciones específicas de hardware y de calidad derivadas del recorte de expertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) sobre transformer, base LFM2.5; empaquetado LiteRT-LM con grafos QNN para NPU y delegado GPU/CPU |
| Parámetros totales | 8B (modelo base LFM2.5-8B-A1B) |
| Parámetros activos | 1B (4 de 32 expertos por token) |
| Longitud de contexto | 4096 tokens (bundle NPU); 8192 tokens (bundle GPU/CPU) |
| Tipos de cuantización | GPTQ int4 por canal en pesos; activaciones de 16 bits en NPU y fp32 en GPU |
| Idiomas soportados | Inglés (etiqueta `en`; el modelo base puede tener más cobertura, no confirmada en esta ficha) |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos bundles: `lfm25-8b-a1b_sm8450.litertlm` (4,07 GB) y `lfm25-8b-a1b-ctx8192_gpu.litertlm` (3,99 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es LFM2.5-8B-A1B de LiquidAI, un MoE con 32 expertos por capa y enrutamiento que activa 4 por token, lo que da 1B de parámetros activos sobre 8B totales. Este empaquetado no reentrena el modelo: parte del checkpoint bf16, lo cuantiza a int4 con GPTQ por canal y lo compila para LiteRT-LM. Embedding y lm_head son compartidos. Se eliminan 88 de los 704 expertos (quedan entre 24 y 32 por capa), seleccionados por su baja frecuencia de activación del router sobre Dolly-15k en inglés; esos expertos representaban el 1,44 % de las selecciones globales y hasta el 3,41 % en la peor capa. Los expertos eliminados también salen del router, de modo que el siguiente candidato ocupa su plaza.

Técnicamente, el bundle NPU usa tres contextos QNN de aproximadamente 1,3 GB cada uno (1276, 1245 y 1225 MB), uno por proceso, porque un proceso en este chip solo mapea unos 1,85 GB del DSP; requiere QAIRT 2.50.0.260828 compilado para Hexagon v69 y una biblioteca de dispatch parcheada que reparte contextos en procesos trabajadores (la de serie falla con el segundo contexto, error 1002). Cada experto conservado se ejecuta en cada token y el router enmascara los no elegidos; se midió que grafos separados por experto eran como máximo un 30 % más rápidos, a costa de más de 600 grafos. Un único grafo cubre prompt y decodificación, un token por llamada, por lo que la velocidad de prompt iguala a la de decodificación en NPU. El bundle GPU/CPU usa los mismos pesos int4 como capas totalmente conectadas con `--static` y exige activaciones fp32 en el delegado GPU (con fp16 por defecto el modelo solo emitía saltos de línea); además reinicia el estado de la convolución corta al inicio de conversación dentro del grafo (`state × min(position, 1)`) para evitar bucles en `</think>` tras un reseteo de sesión. La plantilla de chat se reescribió para el motor de plantillas de LiteRT-LM y se añade `<|endoftext|>` como token de parada adicional.

## Capacidades

- Generación de texto y razonamiento con modo thinking: el modelo razona dentro de `<think> … </think>` antes de responder.
- Razonamiento aritmético básico verificado en pruebas manuales (17 × 23 = 391, correcto).
- Traducción (se cita una traducción al francés correcta tras un razonamiento largo).
- Generación de texto largo: se completó limpiamente una historia de unos 600 tokens.
- Generación de código: no verificado en esta ficha; el recorte de expertos se basó en texto inglés, por lo que el rendimiento en código puede verse más afectado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking permite cadenas de razonamiento, pero no hay evaluación de agentes.
- Capacidades multilingües: limitadas según la etiqueta de idioma (solo inglés); el modelo base podría cubrir más idiomas, pero no se confirma aquí.
- Solo texto: no hay visión ni audio.
- Servicio mediante endpoint compatible con OpenAI a través de la app AutoDroid Studio.

## Casos de uso

- Asistente conversacional totalmente offline en Android: el bundle GPU/CPU con 8192 tokens de contexto permite mantener conversaciones multi-turno sin conexión ni envío de datos a la nube, adecuado para entornos con requisitos de privacidad.
- Prototipado de aplicaciones móviles con LLM: desarrolladores que quieran validar una UX de chat con razonamiento en un dispositivo real antes de invertir en infraestructura de servidor, usando el endpoint estilo OpenAI de AutoDroid Studio.
- Pruebas de razonamiento con trazas auditables: el modo thinking separa el razonamiento de la respuesta, útil para depurar por qué el modelo llega a una conclusión en tareas de aritmética o traducción sencillas.
- Investigación en inferencia on-device: el paquete sirve como referencia reproducible de ejecución MoE int4 en DSP Hexagon con reparto multi-proceso, útil para estudiar latencias, consumo y límites de memoria en SM8450.
- Generación de texto creativo corto en el dispositivo: relatos de varios cientos de tokens, descripciones o borradores, con la ventaja de no depender de red.
- Evaluación de cuantización y poda de expertos: comparar el comportamiento del modelo con 88 expertos eliminados frente al checkpoint original en tareas concretas, para medir el impacto del recorte en dominios como código u otros idiomas.
- Demos y docencia: ejecutar un MoE de 8B en un teléfono de gama alta de 2022 para ilustrar conceptos de MoE, cuantización y aceleración heterogénea sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que no hay una suite de benchmarks detrás de este empaquetado. Las únicas mediciones son de velocidad y pruebas cualitativas en un Samsung Galaxy S22 Ultra (SM-S908E):

| Métrica | NPU (SM8450) | GPU | CPU |
|---|---:|---:|---:|
| Decodificación | 6,0–6,1 tok/s | 6,3 tok/s | 3,66 tok/s |
| Prompt | 6,0 tok/s | 12,6 tok/s | 9,7 tok/s |
| Carga | ~10–16 s | 25 s (CLI), 65–70 s en app | 32 s |
| RAM | tres procesos, casi todo el DSP | ~4,7 GB | fichero de caché de 3,8 GB mapeado |
| Dentro de app Android | 4,4–4,9 tok/s | tres chats limpios consecutivos | no disponible |

Pruebas cualitativas en modo greedy sobre el bundle NPU: un dato factual, 17 × 23 (correcto), una traducción al francés (correcta tras razonamiento largo) y una historia de ~600 tokens (completada). Un haiku agotó los 400 tokens contando sílabas en el bloque de razonamiento sin llegar a responder. Una prueba needle-in-a-haystack con prompt de 3000 tokens falló: encontró uno de dos códigos ocultos y después listó líneas irrelevantes hasta agotar el contexto de 4096.

## Requisitos de hardware

- Bundle NPU: exclusivo del Snapdragon 8 Gen 1 (SM8450, Hexagon v69). Requiere QAIRT 2.50 (`libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV69Stub.so`, `libQnnHtpV69Skel.so`), una biblioteca de dispatch parcheada con worker multi-proceso y `litert_lm_advanced_main` de LiteRT-LM compilado para Android arm64. Ocupa prácticamente todo el DSP: cargar otro modelo NPU o de imagen en paralelo hace fallar la carga.
- Bundle GPU/CPU: cualquier teléfono arm64 con RAM suficiente; medido con ~4,7 GB en GPU y 3,8 GB de fichero de caché mapeado en CPU.
- VRAM en GPU de escritorio: no aplica; el paquete está pensado para Android y no se documenta despliegue en A100, H100 o RTX 4090.
- Cabe en GPU de consumo móvil (Adreno del S22 Ultra), no se documenta en GPUs de consumo de escritorio.
- Opciones de despliegue: LiteRT-LM CLI (`litert_lm_advanced_main`) y la app AutoDroid Studio con endpoint compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks. En NPU, prompt y decodificación igualan velocidad por el diseño de grafo único. En ejecución desde shell con pantalla apagada es necesario un wake lock; sin él, el kernel de Samsung puede reiniciar el DSP a mitad de ejecución.
- En la variante NPU, `LITERT_QNN_PROCESS_BUDGET_MB=1500` y afinidad `taskset f0` forman parte del procedimiento medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Despliegue |
|---|---|---:|---:|---|---|
| LFM2.5-8B-A1B (este paquete) | 8B | 1B | 4096 (NPU) / 8192 (GPU) | LFM1.0 | LiteRT-LM, Android (NPU/GPU/CPU) |
| LiquidAI/LFM2.5-8B-A1B (original) | 8B | 1B | no disponible en esta ficha | LFM1.0 | safetensors, servidores y GPUs |
| Gemma 4 E4B (paquete del mismo autor para SM8450) | no disponible | no disponible | no disponible | no disponible en esta ficha | LiteRT-LM NPU en SM8450 |

La comparación con alternativas de la misma categoría (MoE de ~8B para on-device) no está disponible con datos verificables en la información proporcionada. El paquete Gemma 4 E4B del mismo autor se cita únicamente como origen de la biblioteca de dispatch parcheada, no como comparativa de rendimiento.

## Limitaciones y advertencias

- Recorte de expertos: se eliminan 88 de 704 expertos según su frecuencia en Dolly-15k en inglés; expertos relevantes para código u otros idiomas pueden haber sido descartados por parecer raros en ese corpus, con impacto no medido en esas tareas.
- Solo texto y etiqueta de idioma inglés; el multilingüismo no está garantizado en este empaquetado.
- Contexto efectivo limitado: 4096 tokens en NPU y 8192 en GPU/CPU; la prueba needle-in-a-haystack con 3000 tokens falló, por lo que la recuperación fiable en contextos largos es dudosa.
- Riesgo de bucles en el razonamiento: se documenta un caso que agotó el presupuesto de tokens dentro de `<think>` sin responder; el bundle GPU necesita el reinicio de estado de convolución corta para no entrar en bucle en `</think>` tras resetear sesión.
- El bundle GPU requiere activaciones fp32; con fp16 el modelo solo genera saltos de línea.
- El bundle NPU monopoliza el DSP: no se puede cargar junto a otro modelo NPU o de imagen, y sin wake lock el kernel puede reiniciar el DSP durante ejecuciones largas.
- Dependencia de QAIRT 2.50 y de una biblioteca de dispatch parcheada que debe coincidir con el commit de LiteRT embebido en LiteRT-LM; la de serie falla en el segundo contexto.
- Licencia LFM1.0: es necesario revisar sus términos para uso comercial; no se detallan restricciones en la información disponible.
- Sin benchmarks estándar ni evaluación sistemática de calidad, sesgos o alucinación; las únicas verificaciones son pruebas manuales del autor.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/assassinshadow/LFM2.5-8B-A1B-LiteRT-LM-NPU-GPU
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Runtime parcheado y fuentes (repo Gemma 4 E4B del mismo autor): https://huggingface.co/assassinshadow/Gemma-4-E4B-it-text-SM8450-LiteRT-LM-NPU/tree/main/runtime
- AutoDroid Studio en Google Play: https://play.google.com/store/apps/details?id=com.assassinshadow.aiserver
