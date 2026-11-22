# drofn/Inkling-2-Mini-8GB-GGUF

## Resumen

Inkling-2-Mini-8GB-GGUF es una colección de cuantizaciones GGUF de precisión mixta del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario drofn. El modelo base es un mixture-of-experts (MoE) de 26.070.390.272 parámetros totales con 3.400 millones de parámetros activos, en el que las doce capas centrales se ejecutan tres veces, y que admite entrada de texto e imagen. El objetivo de esta publicación no es otro que hacer viable el modelo completo en tarjetas gráficas de 8 GB de VRAM, algo poco habitual en un MoE de 26B.

La aportación principal del autor es el dimensionado fino de cada fichero para un objetivo de contexto concreto (32K, 48K y 64K), de modo que todas las capas y la ventana de contexto quepan en 8 GB, dejando la tabla de embeddings en RAM del sistema, tal como hace llama.cpp. Cada fichero se midió en una RTX 4060 de 8 GB, con desglose de VRAM, velocidad de generación y de procesamiento de prompt, y una prueba de recuperación de información con prompts largos. Los ficheros rondan los 2 bits por peso (2,25, 2,14 y 2,03 bits/peso), con una divergencia KL media frente al original de 0,0859 a 0,1303 y una coincidencia de top-1 del 88,6 % al 90,6 %.

Es relevante ahora porque demuestra que un MoE de 26B con decodificación especulativa mediante cabeza MTP y soporte de visión puede desplegarse en hardware de consumo, a costa de una pérdida de calidad medible y documentada. El repositorio incluye además la imatrix propia, las recetas por tensor para reconstruir cada fichero y las mediciones en bruto, lo que lo convierte en una referencia útil para quien quiera reproducir el proceso o adaptarlo a otras tarjetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) tipo transformer, con las 12 capas centrales ejecutadas tres veces; cabeza MTP para decodificación especulativa; proyector de visión para entrada de imagen |
| Parametros totales | 26.070.390.272 (26,07B) |
| Parametros activos | 3,4B |
| Longitud de contexto | 32K, 48K o 64K según el fichero (32.768, 48K y 64K tokens respectivamente) |
| Tipos de cuantizacion | GGUF de precisión mixta, media de 2,25 / 2,14 / 2,03 bits por peso; caché KV en q8_0 en las pruebas; imatrix propia |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); ficheros auxiliares mmproj (Q8_0 y F16) y dspark (Q8_0 y F16) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26,07B parámetros totales y 3,4B activos, en el que las doce capas intermedias se ejecutan tres veces, lo que incrementa la profundidad efectiva de cómputo sin aumentar el número de parámetros. Incorpora una cabeza MTP (multi-token prediction) que actúa como modelo borrador para decodificación especulativa, y un proyector de visión que permite entrada image-text-to-text. La cuantización aquí publicada no reentrena el modelo: es una conversión GGUF de precisión mixta con una importance matrix propia, generada por el autor, idéntica a la del repositorio de 16 GB.

El autor documenta un hallazgo técnico relevante: el codificador Q2_0 estándar de llama.cpp duplica el error de los tensores `down` de los expertos, lo que degrada la calidad a este tamaño; el repositorio incluye el codificador corregido en `tools/` y las recetas por tensor en `recipes/` para reconstruir cada fichero. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen (image-text-to-text) mediante fichero mmproj, con el proyector en CPU.
- Razonamiento y generación de código (el autor probó decodificación especulativa con un prompt de código).
- Decodificación especulativa con la cabeza MTP propia del modelo.
- Recuperación de información en prompts largos (probada por el autor con prompts de hasta 26K tokens).
- Capacidades multilingües: solo inglés declarado.
- No se documentan tool calling, function calling ni soporte explícito de agentes multi-step en la información disponible.

## Casos de uso

- Despliegue local en equipos con GPU de 8 GB: el fichero de 32K permite ejecutar un MoE de 26B con todas las capas en una RTX 4060, útil para prototipado y desarrollo sin acceso a clúster.
- Procesamiento de documentos largos en local: el fichero de 64K admite prompts de hasta 64K tokens, adecuado para resumir o extraer información de contratos, informes o hilos de correo extensos en una sola pasada.
- Análisis de imágenes con texto: gracias al proyector mmproj (Q8_0 o F16), se pueden hacer preguntas sobre capturas, diagramas o fotografías manteniendo el modelo principal en VRAM y el proyector en CPU.
- Asistencia de código en estación de trabajo: el autor midió velocidad de generación de 50 tok/s a 32K de contexto, suficiente para autocompletado interactivo y revisión de parches en un flujo de desarrollo individual.
- Evaluación comparativa de cuantizaciones: las mediciones de KLD y top-1 frente al original permiten a un investigador elegir el equilibrio calidad/contexto adecuado para su experimento sin repetir el proceso.
- Reproducción y estudio de cuantización extrema: las recetas por tensor, la imatrix y el codificador Q2_0 corregido permiten reproducir el pipeline y adaptarlo a otros modelos MoE con presupuesto de VRAM ajustado.
- Chat conversacional de bajo consumo en hardware de consumo: con 238 MiB libres tras cargar el fichero de 32K en una tarjeta sin pantalla, es viable como asistente local persistente en segundo plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización y de rendimiento en hardware real:

| Fichero | Tamano | Pesos en GPU | KLD | Top-1 | Contexto en 8 GB |
|---|---|---|---|---|---|
| Inkling-2-Mini-8GB-32K.gguf | 7,32 GB | 6.739 MiB | 0,0859 | 90,6 % | 32K |
| Inkling-2-Mini-8GB-48K.gguf | 6,96 GB | 6.395 MiB | 0,1035 | 89,8 % | 48K |
| Inkling-2-Mini-8GB-64K.gguf | 6,62 GB | 6.071 MiB | 0,1303 | 88,6 % | 64K |

Mediciones en RTX 4060 de 8 GB sin pantalla conectada (7.956 MiB libres), caché KV en q8_0:

| Fichero | Contexto | -ub | VRAM libre tras carga | Memoria tras prompt largo | Generación | Procesamiento de prompt |
|---|---|---|---|---|---|---|
| 32K | 32.768 | 32 | 238 MiB | 7.907 MiB | 50 tok/s | 213 tok/s (prompt de 26K tokens) |

El autor indica que la decodificación especulativa con la cabeza MTP solo resultó más rápida a 8K de contexto y con un prompt de código. El modelo original, ejecutado con distinto tamaño de batch, ya presenta un suelo de KLD de aproximadamente 0,0085 frente a sí mismo; los valores de esta cuantización son entre 10 y 15 veces ese suelo.

## Requisitos de hardware

- VRAM estimada: 6.071-6.739 MiB de pesos en GPU según fichero, más caché KV q8_0; 238 MiB libres tras cargar el de 32K en una tarjeta de 8 GB sin pantalla.
- GPU probada: RTX 4060 de 8 GB (7.956 MiB libres en reposo, sin monitor conectado).
- Cabe en GPU de consumo de 8 GB; con menos memoria libre hay que reducir `-c` (de 32K a 24K libera 186 MiB en el fichero de 32K) o pasar a un fichero menor.
- Opciones de despliegue: llama.cpp (probado en la release oficial b12622); el autor no documenta vLLM, TGI ni Ollama.
- Throughput medido: 50 tok/s de generación y 213 tok/s de procesamiento de prompt de 26K tokens con `-ub 32` en la RTX 4060.
- El proyector de visión y la cabeza MTP se mantienen fuera de la GPU (proyector en CPU); ficheros mmproj de 0,35 GB (Q8_0) y 0,64 GB (F16), y dspark de 0,40 GB (Q8_0) y 0,65 GB (F16).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-8GB-GGUF (esta ficha) | 26,07B | 3,4B | 32K/48K/64K | Apache 2.0 | GGUF en HF |
| Inkling-2-Mini (original) | 26,07B | 3,4B | no disponible en la información | Apache 2.0 | Pesos originales en HF |
| Inkling-2-Mini-16GB-GGUF (drofn) | 26,07B | 3,4B | mayor que 64K, no detallado | Apache 2.0 | GGUF en HF |
| Ficheros de unsloth para el mismo modelo | 26,07B | 3,4B | no detallado | Apache 2.0 | GGUF en HF |

El autor señala que los ficheros de unsloth son mejores para su tamaño, pero el más pequeño de ellos no cabía en una tarjeta de 8 GB a 32K de contexto. No se dispone de datos de benchmarks que permitan comparar rendimiento cognitivo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Pérdida de calidad medible: a unos 2 bits por peso, la coincidencia de top-1 con el original cae al 88,6-90,6 % y el KLD es de 10 a 15 veces el suelo del propio modelo original.
- El fichero de 64K es el de menor calidad de los tres; cada paso de contexto adicional cuesta fidelidad.
- Solo inglés declarado; no hay soporte multilingüe documentado.
- No se documentan capacidades de tool calling, function calling ni agentes multi-step; no asumirlas en producción.
- El modelo base puede alucinar; la cuantización agrava la divergencia respecto al original, por lo que conviene validar salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones de calidad de la cuantización y la falta de benchmarks estándar hacen recomendable evaluar el fichero concreto en la tarea objetivo antes de desplegarlo.
- Los números de VRAM se midieron en una tarjeta sin pantalla conectada; con el monitor u otras aplicaciones usando VRAM, hay que reducir contexto o usar un fichero menor.
- La decodificación especulativa con MTP solo aportó ventaja a 8K de contexto en las pruebas del autor; no debe asumirse una mejora general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026; se trata de una publicación reciente sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de 16 GB del mismo autor: https://huggingface.co/drofn/Inkling-2-Mini-16GB-GGUF
- Mediciones en bruto: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/tree/main/measurements
- Recetas por tensor: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/tree/main/recipes
- Importance matrix: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/tree/main/imatrix
- Herramientas (codificador Q2_0 y conversor de cabeza MTP): https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/tree/main/tools
- Fichero de 32K: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/blob/main/Inkling-2-Mini-8GB-32K.gguf
- Fichero de 48K: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/blob/main/Inkling-2-Mini-8GB-48K.gguf
- Fichero de 64K: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/blob/main/Inkling-2-Mini-8GB-64K.gguf
- Proyector de visión Q8_0: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/blob/main/mmproj-Inkling-2-Mini-Q8_0.gguf
- Proyector de visión F16: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/blob/main/mmproj-Inkling-2-Mini-F16.gguf
- Cabeza MTP Q8_0: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/blob/main/dspark-Inkling-2-Mini-Q8_0.gguf
- Cabeza MTP F16: https://huggingface.co/drofn/Inkling-2-Mini-8GB-GGUF/blob/main/dspark-Inkling-2-Mini-F16.gguf
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
