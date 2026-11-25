# shefowl/Nanbeige4.3-33B-Draft-3B-GGUF

## Resumen

Nanbeige4.3-33B-Draft-3B-GGUF es un modelo borrador (draft model) para decodificación especulativa en llama.cpp del modelo objetivo Nanbeige4.3-33B. Lo publica el usuario independiente shefowl, sin afiliación con Nanbeige, y se distribuye bajo licencia Apache 2.0. Su función no es generar respuestas de forma autónoma, sino proponer tokens que el modelo de 33B verifica en lote, acelerando la generación entre un 26 % y un 50 % según hardware.

El modelo parte de Nanbeige4.2-3B (4.174.519.296 parámetros reales) reconfigurado como un Llama plano de 22 capas: una sola pasada por sus capas en lugar de las dos del original. Esa modificación reduce el coste computacional a la mitad, pero deja los pesos inutilizables sin entrenamiento, por lo que se "curó" mediante destilación desde el 33B con LoRA de rango 256. El vocabulario se rellena hasta los 166.912 tokens del modelo objetivo para que llama.cpp acepte el par sin modificaciones.

Es relevante porque permite acelerar un modelo de 33B en GPUs de consumo (RX 7900 XTX de 24 GB) y en GPUs de servidor (L40S de 48 GB) sin reentrenar el modelo grande ni cambiar el runtime. Solo se publica la cuantización Q4_K_M (2,58 GB), tras comprobar que Q8_0 ofrece mayor aceptación pero menor velocidad global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama, 22 capas, una sola pasada (modelo borrador para decodificación especulativa) |
| Parametros totales | 4.174.519.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma nativa; en las pruebas se usaron 4.096 y 8.192 tokens de contexto junto al modelo objetivo |
| Tipos de cuantizacion | Q4_K_M (única publicada); se evaluó Q8_0 pero se descartó por menor velocidad global |
| Idiomas soportados | en (inglés); las pruebas incluyeron prompts en ruso con ganancias menores |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un Llama de 22 capas con tamaño oculto 3072, embeddings no atados (untied) y el mismo tokenizador que Nanbeige4.3-33B (vocabulario de 166.912 tokens). Se obtiene reconfigurando los pesos de Nanbeige4.2-3B para eliminar el bucle de dos pasadas por capas del original, lo que reduce el coste por paso a la mitad. Sin entrenamiento posterior, este estudiante coincide con el token superior del 33B solo el 40 % de las veces, lo que lo hace inservible como borrador.

El ajuste se realizó con LoRA de rango 256 sobre todas las proyecciones de atención y MLP, con las normas entrenadas por completo (384M parámetros entrenables), y un objetivo de entropía cruzada contra las 20 probabilidades principales del siguiente token del 33B. Los datos son 2M tokens de respuestas del 33B con thinking activado (temperatura 0,6, logprobs top-20 guardados): 1,56M tokens sobre prompts de open-perfectblend (chat, matemáticas, código y seguimiento de instrucciones) y 0,58M tokens sobre prompts de código de evol-codealpaca. El coste de entrenamiento fue de 32 minutos en una RX 7900 XTX. El adaptador está fusionado en el archivo publicado.

El acuerdo con el token superior del 33B es de 0,725 (0,740 en código) medido sobre 320k tokens reservados. Los experimentos del autor muestran que multiplicar por 13 los datos del mismo tipo solo aporta +1,2 puntos, subir la proporción de código del 18 % al 40 % aporta +0,4 puntos en código sin cambiar el resto, y un LoRA de rango 512 resta 0,2 puntos.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa en llama.cpp; el modelo de 33B decide siempre la salida final.
- Aceleración de razonamiento matemático y de código: las mayores tasas de aceptación se dan en problemas de palabras tipo orca-math (71 % en Vulkan, 77 % en CUDA).
- Aceleración de conversación multi-turno: menor ganancia relativa en chats de LMSYS arena (41-43 % de aceptación).
- Funcionamiento con thinking activado, que es el modo en el que se midieron todas las cifras.
- Compatibilidad con el tokenizador y el vocabulario del 33B, lo que permite usarlo con llama.cpp estándar sin parches.
- No soporta tool calling, agentes, visión, audio ni capacidades multimodales por sí mismo; hereda únicamente la función de borrador.

## Casos de uso

- Aceleración de inferencia local de Nanbeige4.3-33B en GPUs de consumo: con una RX 7900 XTX de 24 GB, el par 33B IQ4_XS + borrador Q4_K_M a 4.096 tokens de contexto deja entre 1 y 3,5 GB de VRAM libre y sube de 40,4 a 51,1 t/s de media (+26 %).
- Servicio de matemáticas y razonamiento en servidor: en una L40S con CUDA, los problemas de orca-math pasan de 36,9 a 68,1 t/s (+85 %), lo que reduce a la mitad el tiempo de respuesta en cargas de tipo tutor o resolución de ejercicios.
- Generación de código asistida: en prompts de evol-codealpaca la ganancia es de +20 % en Vulkan y +36 % en CUDA, adecuada para autocompletado o generación de parches donde el 33B mantiene la calidad final.
- Despliegue de chat con contexto largo: con el borrador en Q8_0 y 32.768 tokens de contexto el par consume 24,5 GB de VRAM, por lo que una tarjeta de 32 GB puede sostener conversaciones largas con aceleración.
- Evaluación comparativa de decodificación especulativa: sirve como referencia reproducible para medir tasas de aceptación por dominio (matemáticas, código, instrucción, chat) en llama.cpp.
- Reducción de coste en pipelines batch: al aumentar el throughput por GPU, se reduce el número de instancias necesarias para procesar lotes de generación con el 33B en producción.
- Investigación sobre destilación de borradores: el modelo documenta el efecto de la cantidad y composición de datos, el rango de LoRA y la cuantización sobre la aceptación, útil para diseñar borradores propios.

## Benchmarks y rendimiento

Rendimiento medido por el autor. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un borrador y su calidad se evalúa por tasa de aceptación.

RX 7900 XTX 24 GB, Vulkan (llama.cpp commit 5f490d7), objetivo Nanbeige4.3-33B IQ4_XS, KV cache q4_0, draft n-max 3, greedy, thinking activado, hasta 1.024 tokens generados:

| Prompts | Sin borrador (t/s) | Con borrador (t/s) | Aceleración | Tokens aceptados |
|---|---:|---:|---:|---:|
| orca-math word problems | 40,6 | 64,7 | +59 % | 71 % |
| UltraInteract (código y matemáticas) | 40,3 | 61,2 | +52 % | 66 % |
| MetaMathQA | 40,0 | 57,8 | +45 % | 60 % |
| AutoIF instruction following | 40,3 | 51,7 | +28 % | 50 % |
| UltraChat | 40,4 | 49,9 | +24 % | 48 % |
| UltraFeedback | 40,6 | 49,5 | +22 % | 47 % |
| evol-codealpaca (código) | 40,2 | 48,1 | +20 % | 46 % |
| LMSYS arena chats | 40,6 | 45,9 | +13 % | 41 % |
| Ruso | 40,4 | 45,4 | +12 % | 40 % |
| **Total** | **40,4** | **51,1** | **+26 %** | **50 %** |

L40S 48 GB, CUDA (imagen oficial llama.cpp:server-cuda, build 12679), 24 prompts sin los rusos, hasta 512 tokens generados:

| Prompts | Sin borrador (t/s) | Con borrador (t/s) | Aceleración | Tokens aceptados |
|---|---:|---:|---:|---:|
| orca-math word problems | 36,9 | 68,1 | +85 % | 77 % |
| UltraInteract (código y matemáticas) | 36,8 | 64,4 | +75 % | 71 % |
| MetaMathQA | 37,0 | 63,9 | +73 % | 70 % |
| UltraChat | 36,7 | 54,7 | +49 % | 56 % |
| UltraFeedback | 36,9 | 53,1 | +44 % | 53 % |
| evol-codealpaca (código) | 36,6 | 49,9 | +36 % | 49 % |
| AutoIF instruction following | 36,9 | 48,7 | +32 % | 46 % |
| LMSYS arena chats | 36,9 | 47,2 | +28 % | 43 % |
| **Total** | **36,8** | **55,1** | **+50 %** | **56 %** |

Q8_0 frente a Q4_K_M: 46,9 frente a 51,1 t/s en la RX 7900 XTX y 47,2 frente a 55,1 t/s en la L40S. Configuraciones probadas sin mejora en la RX 7900 XTX: `--spec-draft-p-min` 0,5 (50,7 t/s), n-max 5 con p-min 0,5 (48,7 t/s), n-max 6 con p-min 0,7 (48,2 t/s).

## Requisitos de hardware

- VRAM del borrador: 2,58 GB para el archivo Q4_K_M en disco; en ejecución se suma a la del modelo objetivo y a la caché KV.
- RX 7900 XTX 24 GB (Vulkan): el par 33B IQ4_XS + borrador a 4.096 tokens deja 1-3,5 GB libres según el uso del escritorio; 8.192 tokens queda muy justo.
- L40S 48 GB (CUDA): el par con borrador Q4_K_M a 4.096 tokens consume 20,5 GB; con borrador Q8_0 y 32.768 tokens, 24,5 GB, por lo que una GPU de 32 GB admite contexto largo.
- Cabe en GPU de consumo de 24 GB (RX 7900 XTX) y en GPUs de servidor como L40S; no se han publicado pruebas en RTX 4090, A100 o H100.
- Despliegue mediante llama.cpp: `llama-server` con `-md` para el borrador, `--spec-type draft-simple --spec-draft-n-max 3`, `-ngl 99 -ngld 99 -fit off -c 4096 -fa on`, caché KV en q4_0 y `--jinja`. `-fit off` es obligatorio al cargar un borrador. En builds antiguas las flags se llaman `--draft-max`.
- Throughput: 51,1 t/s de media en RX 7900 XTX y 55,1 t/s en L40S con el par completo; sin borrador, 40,4 y 36,8 t/s respectivamente.
- No hay soporte documentado para vLLM, TGI u Ollama con decodificación especulativa de este par.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Nanbeige4.3-33B-Draft-3B (este) | 4,17B | no disponible | Borrador para 33B en llama.cpp | Apache 2.0 | GGUF Q4_K_M |
| Nanbeige4.2-3B (base) | no disponible | no disponible | Modelo generativo de 3B con bucle de 22 capas | no disponible | Pesos originales |
| Nanbeige4.3-33B (objetivo) | 33B (aproximado por nombre) | no disponible | Modelo generativo objetivo | no disponible | GGUF IQ4_XS de terceros (bartowski) |

No se dispone de datos de otros borradores comparables en la información proporcionada; las alternativas de la misma categoría (borradores para decodificación especulativa de otros modelos) no están documentadas aquí.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: sin el 33B no produce respuestas útiles; sin entrenamiento, el estudiante solo coincide con el token superior del 33B el 40 % de las veces.
- La salida con borrador puede diferir ligeramente de una ejecución sin él incluso en greedy, porque la verificación por lotes cambia el redondeo en coma flotante. El borrador nunca decide el contenido; un fallo de predicción solo cuesta tiempo.
- Los primeros cientos de tokens de thinking son la parte más difícil para el borrador, con menor aceptación.
- Solo se midió decodificación greedy, no muestreo; el comportamiento con temperatura puede diferir.
- El ruido entre ejecuciones es de aproximadamente ±2 t/s con tres prompts por fila.
- El modelo está etiquetado solo para inglés; las pruebas en ruso muestran la menor aceleración (+12 % en Vulkan).
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que el modelo es no oficial y no está afiliado a Nanbeige; conviene verificar la licencia del modelo base y del objetivo.
- Requiere versiones recientes de llama.cpp con soporte de `--spec-type` y `-md`; en builds antiguas hay que adaptar las flags.
- No se han publicado evaluaciones de sesgos ni de alucinación para este borrador; al no generar contenido final, esos riesgos recaen en el modelo de 33B.
- Con 24 GB de VRAM, contextos de 8.192 tokens o superiores resultan ajustados; se recomienda 4.096 para dejar margen al escritorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shefowl/Nanbeige4.3-33B-Draft-3B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Modelo objetivo: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantización IQ4_XS del objetivo (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Dataset open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
