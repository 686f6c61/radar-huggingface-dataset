# kingjones777/Qwen3.5-9B-ROCmFP4-GGUF

## Resumen

Qwen3.5-9B-ROCmFP4-GGUF es una distribucion de pesos cuantizados del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de una reempaquetadura en formato GGUF orientada especificamente al hardware AMD RDNA3.5, en concreto al SoC Strix Halo (Ryzen AI Max+ 395, arquitectura gfx1151). El modelo base resuelve tareas de generacion de texto y comprension de imagen a texto (pipeline image-text-to-text) con aproximadamente 8.950 millones de parametros.

La aportacion principal de esta ficha es el uso de tipos de tensor FP4 y FP8 nativos de ROCm, implementados en el fork ROCmFPX de llama.cpp. Estos tipos no existen en llama.cpp mainline, por lo que los artefactos requieren un binario compatible con ROCmFPX o el motor Super Roc del mismo autor. Se distribuyen cuatro variantes con tamanos entre 5,19 GiB y 8,77 GiB, acompanadas de un proyector multimodal `mmproj-BF16.gguf`.

El interes actual radica en que permite ejecutar un modelo de 9B con capacidades de vision en hardware de consumo AMD con memoria unificada, alcanzando velocidades de decodificacion de hasta 39,34 t/s en la variante de 4 bits y ventanas de contexto de hasta 131.072 tokens segun la configuracion documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), modelo base Qwen3.5-9B; cuantizacion GGUF con tipos ROCmFP4/ROCmFPX |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (cargado y verificado en Super Roc); 4.096 tokens en las mediciones de decodificacion |
| Tipos de cuantizacion | Q4_0 ROCMFP4 (ftype 102), Q6_0 ROCMFPX (ftype 114), Q8_0 ROCMFPX (ftype 111 y 115); embeddings y `output.weight` en q6_K para la variante de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye `mmproj-BF16.gguf` para vision) |

Variantes publicadas:

| Fichero | Ftype | Tamano | Decodificacion | Spread |
|---|---|---|---|---|
| `Qwen3.5-9B-Q4_0_ROCMFP4_COHERENT.gguf` | 102 | 5,19 GiB | 39,34 t/s | 1,0036 |
| `Qwen3.5-9B-Q6_0_ROCMFPX_AGENT.gguf` | 114 | 7,90 GiB | 26,23 t/s | 1,0004 |
| `Qwen3.5-9B-Q8_0_ROCMFPX.gguf` | 111 | 8,67 GiB | 23,92 t/s | 1,0013 |
| `Qwen3.5-9B-Q8_0_ROCMFPX_AGENT.gguf` | 115 | 8,77 GiB | 23,78 t/s | 1,0004 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, de la familia Qwen, con pipeline multimodal image-text-to-text. La model card de esta distribucion no detalla la arquitectura interna del modelo base (numero de capas, dimension oculta, mecanismo de atencion ni si emplea atencion lineal o hibrida), por lo que esos datos deben consultarse en la ficha del modelo original. Lo que si se documenta es un detalle relevante: `tie_word_embeddings: false`, es decir, la matriz de salida `output.weight` existe de forma independiente de los embeddings de entrada. Esto contrasta con los modelos de 0,8B, 2B y 4B de la misma familia y permite aplicar `--output-tensor-type` de forma efectiva durante la cuantizacion.

En cuanto al proceso de cuantizacion, el autor declara haber verificado cada artefacto en hardware real comprobando el tamano exacto frente a la proyeccion de `--dry-run` (un delta de cabecera constante; un delta variable indicaria truncamiento), los tipos reales de `token_embd` y `output.weight`, tres respuestas de correccion evaluadas por contenido y razonamiento con `finish_reason` registrado, y la mediana de decodificacion. No se proporcionan datos sobre el entrenamiento del modelo base: numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se incluye cabeza MTP ni drafter, por lo que no se aportan cifras de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia de Qwen y soporte de modo pensamiento activable por peticion mediante `chat_template_kwargs.enable_thinking`.
- Comprension de imagen a texto (image-text-to-text) mediante el proyector `mmproj-BF16.gguf`; verificado 4/4 sobre una imagen de cuatro cuadrantes de color (rojo, azul, amarillo, verde).
- Llamada a herramientas (tool calling): 7/8 en modo requerido y 7/8 en modo automatico segun las mediciones del autor.
- Razonamiento multi-paso y flujos de agente, con variantes etiquetadas `AGENT` en Q6_0 y Q8_0.
- Generacion de codigo, con 40,4 t/s de media en dos prompts de codigo.
- Cache de prompt eficiente: 6.962 de 6.986 tokens reutilizados en el segundo turno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: con 131.072 tokens de contexto cargados, el modelo puede mantener conversaciones extensas o procesar documentos largos sin truncar, algo util en estaciones de trabajo con memoria unificada de 128 GB.
- Analisis de imagenes en local: el proyector BF16 permite describir, clasificar o extraer informacion de imagenes sin enviar datos a servicios externos, adecuado para entornos con requisitos de privacidad. Requiere `-fa off` para vision.
- Agente con tool calling en pipelines de automatizacion: las variantes `AGENT` en Q6_0 y Q8_0 estan pensadas para flujos donde el modelo debe invocar funciones de forma fiable; el ratio 7/8 en modo automatico es suficiente para tareas con validacion posterior.
- Generacion de codigo en editor o CI: a 40,4 t/s en prompts de codigo, resulta viable como autocompletado o generacion de parches en un flujo de desarrollo local sobre Strix Halo.
- Procesamiento por lotes con cache de prompt: la reutilizacion de 6.962 de 6.986 tokens en el segundo turno reduce coste en cargas repetitivas con un prefijo comun, como resumenes de documentacion o clasificacion.
- Prototipado e investigacion en hardware AMD de consumo: permite validar tecnicas de cuantizacion FP4/FP8 sobre gfx1151 sin acceso a GPUs de datacenter, con cuatro perfiles de calidad/velocidad para comparar.
- Despliegue de servicio local compatible con endpoints: la etiqueta `endpoints_compatible` y el servidor Super Roc (`superroc serve`) permiten exponer el modelo como API compatible con clientes habituales.

## Benchmarks y rendimiento

Rendimiento medido en un Ryzen AI Max+ 395 (Strix Halo, gfx1151, ROCm 7.2.4) en reposo, con `-ngl 999 -c 4096 -fa on -fit off -np 1`, generaciones de 300 tokens, 12 muestras con dos calentamientos:

| Metrica | Valor |
|---|---|
| Decodificacion Q4_0 ROCMFP4 | 39,34 t/s |
| Decodificacion Q6_0 ROCMFPX AGENT | 26,23 t/s |
| Decodificacion Q8_0 ROCMFPX | 23,92 t/s |
| Decodificacion Q8_0 ROCMFPX AGENT | 23,78 t/s |

Mediciones con Super Roc 0.20.0 (release candidate), una peticion a la vez, 2026-11-23:

| Metrica | Valor |
|---|---|
| Tiempo de carga | 2 s |
| Prompt tok/s (p1k) | 1.214,6 |
| Prompt tok/s (p8k) | 1.244,4 |
| Generacion tok/s (p1k) | 40,13 |
| Generacion tok/s (p8k) | 37,18 |
| Generacion de codigo tok/s | 40,4 |
| Tool calls (requerido / automatico) | 7/8 / 7/8 |
| Cache de prompt turno 2 | 6.962 / 6.986 tokens |
| Contexto cargado | 131.072 tokens |
| Vision | pass |
| Drafter | off |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: entre 5,19 GiB (Q4_0 ROCMFP4) y 8,77 GiB (Q8_0 ROCMFPX AGENT) para los pesos, mas el proyector `mmproj-BF16.gguf` y la cache KV segun contexto. Con 131.072 tokens de contexto la cache crece de forma significativa; el autor no publica la cifra exacta.
- GPU objetivo: AMD RDNA3.5, especificamente gfx1151 (Strix Halo, Ryzen AI Max+ 395). Los tipos FP4/FP8 requieren el fork ROCmFPX de llama.cpp o el motor Super Roc; no cargan en llama.cpp mainline.
- No se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD de datacenter. El diseno esta orientado a memoria unificada de APU.
- Configuracion de referencia: 128 GB de memoria en el sistema, `-ngl 999 -c 4096 -fa on -fit off -np 1` para las mediciones de decodificacion.
- Opciones de despliegue: Super Roc (`superroc serve`), Lemonade (`lemonade pull Qwen3.5-9B-ROCmFP4`) y builds de llama.cpp con soporte ROCmFPX.
- Latencia y throughput: 2 s de carga, 1.214-1.244 t/s en prefill (p1k-p8k), 37-40 t/s en generacion, 23,78-39,34 t/s en decodificacion segun variante.
- Advertencia del autor: un trabajo concurrente en la GPU puede infravalorar las mediciones un 20 % con un spread superior al 20 %; medir siempre en equipo en reposo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B-ROCmFP4 (esta ficha) | 8,95 B | 131.072 tokens (verificado) | GGUF ROCmFP4/FPX, gfx1151 | Apache 2.0 |
| Qwen3.5-9B (base) | 8,95 B | no disponible en esta ficha | safetensors, GPU generica | Apache 2.0 |
| Variantes Qwen3.5 de 0,8B / 2B / 4B | no disponible | no disponible | GGUF generico | Apache 2.0 |

La comparacion con alternativas de otros fabricantes del mismo rango de parametros no esta disponible en la informacion proporcionada. La diferencia practica frente al modelo base es el empaquetado en tipos FP4/FP8 especificos de AMD y la inclusion del proyector multimodal, no una mejora de capacidades.

## Limitaciones y advertencias

- Dependencia de un fork: los tipos ROCmFP4 y ROCmFPX no existen en llama.cpp mainline; sin un binario compatible (ROCmFPX o Super Roc) los ficheros no cargan.
- Hardware restringido: el rendimiento documentado corresponde a gfx1151 (Strix Halo). No hay datos para otras GPU AMD ni NVIDIA, y el comportamiento en ellas es desconocido.
- Vision condicionada: requiere `-fa off`; con atencion flash activada la ruta multimodal no funciona segun la model card.
- Sesgos: no se documentan sesgos conocidos del modelo base ni evaluaciones de seguridad en esta distribucion.
- Alucinacion: no se aportan datos de tasas de alucinacion ni evaluaciones de veracidad. Como modelo generativo de 9B, el riesgo persiste y requiere validacion en produccion.
- Idiomas: no se especifica la cobertura linguistica; no asumir soporte multilingue sin verificar contra el modelo base.
- Sin decodificacion especulativa: no se incluye cabeza MTP ni drafter, por lo que no hay ganancias de velocidad por esa via.
- Tool calling imperfecto: 7/8 en ambas modalidades implica al menos un fallo por conjunto de prueba; conviene disenar validacion y reintentos.
- Mediciones sensibles a carga: el propio autor advierte que trabajos concurrentes en la GPU distorsionan los resultados hasta un 20 %.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen3.5-9B debe verificarse por separado antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.5-9B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Guia de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
