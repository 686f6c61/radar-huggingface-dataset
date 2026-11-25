# gostar77/inkling2-mini-i8-dspark-radiance

## Resumen

Inkling 2 Mini int8 + DSpark — Radiance es un contenedor de pesos cuantizados en formato `.rad`, nativo del motor de inferencia Radiance, derivado del modelo base `thinkingmachines/Inkling-2-Mini`. Lo publica el usuario gostar77 en Hugging Face y no es un checkpoint de Transformers, ni un GGUF, ni un safetensors: es un artefacto empaquetado específicamente para servirse con el plugin `arch/inkling2` y los kernels `libr4d` del proyecto Radiance. Su interés radica en que combina cuantización mixta (int8 para el tronco, NVFP4 para los expertos) con un cabezal de decodificación especulativa DSpark y una torre de visión en bf16, todo en un único fichero de 19,14 GB.

El modelo base es un mixture-of-experts con arquitectura de bucle (`inkling2_loop`), según se desprende de la model card. El contenedor conserva 20 capas de expertos en NVFP4 tal como las publica el autor original, convierte 4 capas de expertos MXFP8 y las lineales de atención a int8 rotado con Hadamard, y mantiene en su precisión de almacenamiento el embedding, el router, los controladores de bucle, las convoluciones, las normas y las consultas de AttnRes. La torre de visión son 23 bloques ViT de 1024 dimensiones que se proyectan a un flujo de 2304 mediante una fusión 2x2.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización agresiva con métricas de calidad publicadas (KL medio de 0,00328 frente al contenedor bf16, con un 96,8 % de acuerdo top-1); por otro, muestra un caso de despliegue orientado a GPUs AMD RDNA4 (Radeon AI PRO R9700), con velocidades de decodificación de 217 tok/s en TP1 para código y 156 tok/s para prosa, gracias al drafter de 7 tokens. Es, por tanto, un ejemplo de optimización de inferencia más que un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts con bucle (`inkling2_loop`) y torre de visión ViT; drafter DSpark de 3 capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (`max-model-len` en la configuración de servicio) |
| Tipos de cuantizacion | int8 rotado (i8a8h) para lineales de atención y 4 capas de expertos MXFP8; NVFP4 (e2m1 con escala e4m3 por cada 16 de K) para 20 capas de expertos; lm_head en int8 simple; embedding, router, controladores de bucle, convoluciones, normas y AttnRes en precisión original; torre de visión en bf16; caché KV en int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base); el contenedor es un derivado cuantizado sin derechos adicionales |
| Formato de pesos | `.rad` (contenedor nativo de Radiance); no es safetensors, ni GGUF, ni checkpoint de Transformers |

## Arquitectura y entrenamiento

El contenedor no entrena nada: es una conversión del checkpoint `thinkingmachines/Inkling-2-Mini`. La arquitectura subyacente es un mixture-of-experts con mecanismo de bucle, según el identificador `inkling2_loop`. El proceso de conversión se documenta en la receta `data/recipes/inkling2-mini-i8.recipe` y aplica tres transformaciones principales. Primero, mantiene las 20 capas de expertos NVFP4 exactamente como las almacena la release original (códigos e2m1, una escala e4m3 por cada 16 elementos de K y el nivel por experto), leídas como `nvfp4a8i8` contra activaciones int8. Segundo, convierte las 4 capas de expertos MXFP8 (20–23) y las lineales de atención (q, k, v, r, la puerta de salida y o) a int8 rotado con Hadamard, con una escala bf16 por fila y por cada 128 de K. Tercero, deja el `lm_head` en int8 simple con escala bf16 por fila y bloque de 128.

El componente diferencial es el drafter DSpark, añadido en tiempo de conversión mediante `rad-convert --draft-model` a partir de `mtp.safetensors`. Es un drafter de bloque de 3 capas que propone 7 tokens con un cabezal Markov recurrente; sus parámetros `fuse_alpha` y el cabezal plegado se derivan durante la conversión. La torre de visión se incorpora con `rad-convert --add-vision` y permanece en bf16: 23 bloques ViT de 1024, tabla de posiciones remuestreada bilinealmente a la rejilla de cada imagen y fusión 2x2 hacia el flujo de 2304. Las imágenes no se redimensionan, sino que se rellenan a celdas completas de 40 píxeles. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto con contexto largo: la configuración de servicio admite hasta 131.072 tokens de longitud de modelo.
- Procesamiento de imágenes: la torre de visión en bf16 permite entrada multimodal; según la model card, responde correctamente a una imagen roja de 64x64 con «Red» y a una imagen de 300x170 dividida en rojo y azul con «Left: red; right: blue.».
- Decodificación especulativa: el drafter DSpark propone 7 tokens por paso con una ventana adaptativa, lo que acelera la generación cuando la aceptación es alta.
- Razonamiento y código: la model card reporta velocidades de decodificación distintas para código y prosa (217 frente a 156 tok/s en TP1), lo que sugiere un uso intensivo en generación de código.
- Servicio en paralelo de tensor: soporta TP1 y TP2, con una opción `tp-wire: exact` para el modo de dos GPUs.
- Tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio no está poblado.

## Casos de uso

- Generación de código en producción: el contenedor alcanza 217 tok/s de decodificación en TP1 con el drafter activo sobre una GPU Radeon AI PRO R9700, lo que lo hace adecuado para autocompletado y generación de parches en pipelines de CI/CD donde la latencia por token es crítica.
- Asistentes conversacionales con contexto largo: con 131.072 tokens de ventana y caché KV en int8, puede mantener conversaciones multi-turno o procesar documentos extensos sin truncar, siempre que se despliegue con Radiance.
- Análisis de documentos con imágenes: la torre de visión permite responder preguntas sobre capturas, diagramas o formularios escaneados; la opción `vision-tower-placement: ram` mantiene los 0,6 GiB de la torre en memoria host para liberar VRAM cuando solo se necesita texto.
- Despliegue en hardware AMD: es una de las pocas recetas publicadas orientadas explícitamente a RDNA4 con kernels `libr4d`, útil para equipos que quieren evitar dependencias de CUDA.
- Servicio de alto rendimiento con dos GPUs: el modo TP2 con `tp-wire: exact` sube la decodificación de prosa a 185 tok/s y el prefill de 32K a unos 6.490 tok/s, adecuado para servidores con dos R9700.
- Evaluación de recetas de cuantización: sirve como referencia reproducible para estudiar el impacto de mezclar NVFP4, MXFP8 e int8 rotado en un mismo modelo, con métricas KL y de acuerdo top-1 publicadas.
- Prototipado de decodificación especulativa: permite medir la tasa de aceptación del drafter (84 %/64 % en TP1 para código/prosa) y comparar con la decodificación sin drafter (87 tok/s en TP1).

## Benchmarks y rendimiento

Calidad frente al contenedor bf16, evaluada con teacher forcing sobre el corpus KLD de contexto largo (6.028 posiciones) y caché KV en bf16:

| Modo | KL medio | Acuerdo top-1 | PPL | PPL de referencia |
|---|---:|---:|---:|---:|
| TP1 | 0,00328 | 96,8 % | 6,361 | 6,376 |
| TP2 (`tp-wire: exact`) | 0,00328 | 97,2 % | 6,363 | 6,376 |

Velocidad en Radeon AI PRO R9700, caché KV int8, 4.096 tokens generados desde un prompt de 32K, drafter de 7 tokens con ventana adaptativa:

| Modo | Decodificación, código | Decodificación, prosa | Tokens de borrador aceptados |
|---|---:|---:|---:|
| TP1 | 217 tok/s | 156 tok/s | 84 % / 64 % |
| TP2 (`tp-wire: exact`) | 224 tok/s | 185 tok/s | 59 % / 49 % |

Sin drafter (`num-speculative-tokens: 0`): 87 tok/s en TP1 y 112 tok/s en TP2. El prefill de 32K tokens ronda los 4.980 tok/s en TP1 y los 6.490 tok/s en TP2. La torre de visión se validó contra una referencia float32 con un error L2 relativo de 3,9e-2 en una imagen de 630x410. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero `.rad` ocupa 19,14 GB (17,83 GiB); a ello hay que sumar la caché KV en int8 para 131.072 tokens y el estado del drafter. La torre de visión añade 0,6 GiB si se mantiene en VRAM, o puede ubicarse en RAM host con `vision-tower-placement: ram`.
- GPU recomendadas: Radeon AI PRO R9700 (RDNA4) es la plataforma sobre la que se publican las mediciones; el soporte de otras GPU depende de los kernels `libr4d` y del plugin `arch/inkling2`.
- Cabe en GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras GPU de consumo, y el stack Radiance está orientado a RDNA4.
- Opciones de despliegue: exclusivamente el servidor de Radiance con `kernels: libr4d` y el plugin `arch/inkling2` (PRs #584, #585 y #586 en Codeberg). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser GGUF ni safetensors.
- Latencia y throughput: 217 tok/s de decodificación en código y 156 tok/s en prosa con TP1; 224 y 185 tok/s respectivamente con TP2. Prefill de 32K en torno a 4.980 tok/s (TP1) y 6.490 tok/s (TP2). La tasa de aceptación del drafter varía con el texto, por lo que la velocidad real fluctúa más que estas ejecuciones individuales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini int8 + DSpark (este) | no disponible | 131.072 | `.rad` | Apache-2.0 | Radiance con plugin `arch/inkling2` |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la documentación proporcionada. La comparación más directa posible es con el checkpoint base `thinkingmachines/Inkling-2-Mini`, del que este contenedor es una conversión cuantizada, pero no se han publicado sus especificaciones en la información disponible.

## Limitaciones y advertencias

- Dependencia de un stack no estándar: requiere el plugin `arch/inkling2` y los kernels `libr4d` de Radiance, con PRs aún no fusionados en el momento de la publicación (#584, #585, #586). No funciona con las herramientas habituales de inferencia.
- Formato propietario: al no ser safetensors ni GGUF, no se puede cargar en Transformers, vLLM, llama.cpp, Ollama ni TGI sin una conversión adicional no documentada.
- Licencia: el contenedor es un derivado cuantizado del modelo base Apache-2.0 y no concede derechos más allá de los términos upstream; conviene revisar dichos términos antes de un uso comercial.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación; al ser un derivado cuantizado, hereda los del modelo base, que no se detallan.
- Idiomas: el repositorio no declara idiomas soportados, por lo que no hay garantías sobre cobertura multilingüe.
- Calidad de la cuantización: aunque el KL medio es bajo (0,00328) y el acuerdo top-1 alto (96,8 %), la evaluación se limita a 6.028 posiciones de un corpus KLD y no sustituye a una evaluación completa en tareas downstream.
- Visión: las pruebas de imagen son smoke tests declarados como tales, no un benchmark; la torre se validó con un error L2 relativo de 3,9e-2, que puede ser insuficiente para tareas de percepción fina.
- Rendimiento variable: la velocidad con drafter depende de la tasa de aceptación, que varía con el texto; las cifras publicadas son ejecuciones únicas y no medias sostenidas.
- Repositorio con 0 descargas y 2 likes: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gostar77/inkling2-mini-i8-dspark-radiance
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR #584 de Radiance (plugin `arch/inkling2`): https://codeberg.org/StillDeadcode/radiance/pulls/584
- PR #585 de Radiance (kernels `libr4d`): https://codeberg.org/StillDeadcode/radiance/pulls/585
- PR #586 de Radiance (rendimiento): https://codeberg.org/StillDeadcode/radiance/pulls/586
