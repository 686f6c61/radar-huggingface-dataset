# incoai/MiniMax-M3.1-Flash-DFlash2

## Resumen

MiniMax-M3.1-Flash-DFlash2 no es un modelo de lenguaje autónomo, sino un modelo borrador (*draft model*) de 2.123.883.776 parámetros diseñado para decodificación especulativa sobre el modelo objetivo MiniMaxAI/MiniMax-M3.1-Flash. Lo publica incoai (Inco AI) bajo licencia Apache 2.0 y su función es proponer bloques de tokens que el modelo grande verifica después, acelerando la generación sin alterar la distribución de salida. La model card es explícita: `inference: false`, se ejecuta dentro de un servidor de speculative decoding (SGLang con el algoritmo DFLASH).

La innovación frente a los drafters convencionales es que DFlash 2 es un difusor de bloques: predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posición; después, un selector ligero traza una única trayectoria coherente entre esos candidatos. Convoluciones dinámicas de dos tomas (*two-tap dynamic convolutions*) en el backbone evitan que la calidad del borrador decaiga hacia el final del bloque. La decodificación es sin pérdida: en modo greedy la salida coincide exactamente con la del modelo objetivo y en muestreo se preserva su distribución.

Su relevancia práctica es medible: con bloques de 8 posiciones (7 tokens borrador por paso de verificación) y sobre dos NVIDIA GB300, DFlash 2 alcanza 3,53× de speedup en GSM8K a concurrencia 1 y 2,42× a concurrencia 32, superando al drafter nativo DSpark de MiniMax en todas las tareas evaluadas. El repo ocupa 4,2 GB y se distribuye en safetensors para `transformers`, aunque su ejecución real depende de SGLang.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusor de bloques (*block diffusion*) para decodificación especulativa, con convoluciones dinámicas de dos tomas y selector de trayectoria de candidatos; el tag del repo indica familia `qwen3`, el detalle exacto del backbone no está documentado en la información disponible |
| Parámetros totales | 2.123.883.776 (≈2,12 mil millones, dato de safetensors) |
| Parámetros activos | No aplica: no se documenta como MoE |
| Longitud de contexto | No disponible (el borrador opera sobre el contexto del modelo objetivo; no se publica su ventana propia) |
| Tipos de cuantización | Pesos publicados sin cuantizar (`--speculative-draft-model-quantization unquant` es el valor indicado en el arranque). No se documentan GGUF, AWQ, GPTQ ni NVFP4 para el borrador; NVFP4 y MXFP8 aparecen solo en la configuración del modelo objetivo durante la evaluación |
| Idiomas soportados | No disponible (no se declaran idiomas en la model card ni en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`transformers`) |
| Modelo base | MiniMaxAI/MiniMax-M3.1-Flash (finetune/derivado) |
| Tamaño del repositorio | 4,2 GB |
| Uso previsto | Borrador especulativo dentro de SGLang; no es un modelo generativo autónomo |
| Descargas / likes | 132 descargas, 13 likes |
| Fechas | Creado el 2026-10-19, actualizado el 2026-10-23 |

## Arquitectura y entrenamiento

DFlash 2 sustituye el drafting autorregresivo típico (un token por paso) por *block diffusion*: el borrador predice simultáneamente un bloque de tokens y mantiene, en cada posición del bloque, los mejores candidatos. Un selector ligero recorre esos candidatos y elige una ruta coherente, que es la que se envía a verificación. Las convoluciones dinámicas de dos tomas en el backbone corrigieron el problema habitual de los drafters paralelos, la degradación de acierto conforme se avanza hacia el final del bloque. El resultado es un borrador que mantiene aceptación alta en las últimas posiciones del bloque, no solo en las primeras.

El mecanismo es sin pérdida por diseño: el modelo objetivo valida cada propuesta y corrige cuando el token muestreado no coincide, de modo que la salida greedy es idéntica a la del objetivo y el muestreo respeta su distribución. Esto significa que DFlash 2 no altera la calidad del modelo servido, solo su latencia y throughput.

No se publican en la información disponible datos sobre el número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni detalles del proceso de destilación desde MiniMax-M3.1-Flash. La model card remite al blog de Inco AI y al paper de ICML 2026 del DFlash original (Chen, Liang y Liu) para la descripción metodológica.

## Capacidades

- Generación de borradores de tokens en bloques de hasta 8 posiciones (7 tokens propuestos por paso de verificación con la configuración recomendada).
- Decodificación especulativa sin pérdida: salida greedy idéntica al modelo objetivo y muestreo con la misma distribución.
- Mantenimiento de la aceptación a lo largo de todo el bloque gracias a las convoluciones dinámicas de dos tomas.
- Selección de trayectoria coherente entre candidatos por posición mediante un selector ligero.
- Integración con SGLang mediante `--speculative-algorithm DFLASH` y backend de atención `fa4`.
- Funcionamiento con pesos del borrador sin cuantizar y convivencia con pesos MXFP8 y KV cache NVFP4 del modelo objetivo.
- Compatibilidad con modo *thinking* adaptativo y esfuerzo de razonamiento por defecto del modelo objetivo (así se evaluó), sin lógica de razonamiento propia.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües por sí mismo: todas esas capacidades provienen del modelo MiniMax-M3.1-Flash que acompaña al borrador.

## Casos de uso

- Chat interactivo de baja latencia: colocado delante de MiniMax-M3.1-Flash en SGLang, reduce el tiempo hasta el primer token útil y el tiempo total por respuesta; a concurrencia 1 en MT-Bench pasa de 121,9 a 280,6 tokens/s (2,30×), lo que se traduce directamente en respuestas percibidas como instantáneas.
- Generación de código en asistentes tipo IDE: en HumanEval el borrador logra una longitud de aceptación de 3,92 tokens por paso de verificación y 2,74× de speedup a concurrencia 1, lo que hace viable autocompletado de bloques largos dentro del editor.
- Razonamiento matemático con cadenas largas: en GSM8K la aceptación sube a 5,18 y el throughput a 3,53× (435,9 tokens/s), el mejor resultado de la comparativa; útil en pipelines de resolución de problemas donde el modelo objetivo genera miles de tokens de traza.
- Servicio de inferencia de alto throughput: a concurrencia 32 en MATH-500 se alcanzan 3.838,3 tokens/s frente a 1.550,5 autorregresivos (2,48×), lo que permite atender más peticiones por GPU sin cambiar el modelo servido.
- Procesamiento por lotes de documentación o código (MBPP, HumanEval): 2,26× y 1,94× respectivamente a concurrencia 32, reduciendo el coste por token en trabajos offline que hoy están limitados por el decodificador.
- Despliegue con SLO estrictos de latencia: al ser un añadido de 2,12 mil millones de parámetros sobre el modelo objetivo, se puede activar o desactivar por configuración del servidor según la carga, sin reentrenar ni cambiar la API del servicio.
- Evaluación comparativa de técnicas de aceleración: sirve como referencia reproducible (prompts de `z-lab/dflash`, 128 muestras por tarea) para medir acceptance length y throughput de otras propuestas de speculative decoding frente a DSpark.

## Benchmarks y rendimiento

No se publican resultados de benchmarks de calidad (MMLU, HumanEval como métrica de corrección, GSM8K como precisión) porque la decodificación es sin pérdida: la calidad es exactamente la del modelo objetivo. Las métricas publicadas son de aceleración.

Condiciones de evaluación: SGLang (build de MiniMax-M3.1) sobre dos NVIDIA GB300 (TP2/EP2), pesos del objetivo en MXFP8, KV cache NVFP4 sparse, bloque de especulación 8 (7 tokens borrador por verificación), temperatura 1,0, top-p 0,95, sin top-k, thinking adaptativo, máximo 4.096 tokens nuevos, 128 muestras por tarea.

Longitud de aceptación (tokens de completion divididos por pasos de verificación, concurrencia 1; mayor es mejor):

| Tarea | DSpark | DFlash 2 |
|---|---:|---:|
| GSM8K | 4,41 | **5,18** |
| MATH-500 | 3,85 | **4,77** |
| HumanEval | 3,00 | **3,92** |
| MBPP | 3,42 | **4,30** |
| MT-Bench | 3,08 | **3,67** |

Throughput y speedup frente a decodificación autorregresiva (tokens/s de salida):

| Tarea | Autorregresivo | DSpark | DFlash 2 | Speedup DFlash 2 (c=1 / c=8 / c=32) |
|---|---:|---:|---:|---|
| GSM8K | 123,6 | 341,2 | **435,9** | 3,53× / 2,14× / 2,42× |
| MATH-500 | 122,2 | 331,5 | **410,1** | 3,36× / 2,57× / 2,48× |
| HumanEval | 123,2 | 257,3 | **337,7** | 2,74× / 2,04× / 1,94× |
| MBPP | 124,5 | 295,7 | **382,4** | 3,07× / 2,29× / 2,26× |
| MT-Bench | 121,9 | 221,6 | **280,6** | 2,30× / 1,67× / 1,62× |

Throughput absoluto a concurrencia 8: GSM8K 1.524,8; MATH-500 1.718,4; HumanEval 1.415,4; MBPP 1.478,2; MT-Bench 1.176,9 tokens/s. A concurrencia 32: GSM8K 2.687,2; MATH-500 3.838,3; HumanEval 3.237,0; MBPP 3.176,1; MT-Bench 2.594,7 tokens/s. En todas las celdas DFlash 2 supera a DSpark y al modo autorregresivo.

## Requisitos de hardware

- VRAM del borrador: 2,12 mil millones de parámetros. En BF16 son aproximadamente 4,3 GB de pesos (el repo completo pesa 4,2 GB en safetensors); en FP8 serían unos 2,2 GB y en INT4 alrededor de 1,2 GB, aunque solo se documenta la ejecución sin cuantizar (`unquant`).
- VRAM total: depende enteramente de MiniMax-M3.1-Flash, cuyas dimensiones no se detallan en la información disponible. El borrador se suma a los pesos y a la KV cache del objetivo.
- GPU validadas: dos NVIDIA GB300 en paralelo (TP2/EP2) con backend de atención `fa4`. No se documentan otras configuraciones de GPU en la model card.
- GPU de consumo: el borrador por sí solo cabría en una RTX 4090 (24 GB) o similar, pero al necesitar el modelo objetivo en el mismo servidor, la viabilidad en consumer GPU queda determinada por el tamaño del objetivo, dato no disponible.
- Opciones de despliegue: SGLang con `--speculative-algorithm DFLASH`, `--speculative-draft-model-path incoai/MiniMax-M3.1-Flash-DFlash2`, `--speculative-draft-model-quantization unquant`, `--speculative-num-draft-tokens 8` y `--speculative-draft-attention-backend fa4`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; de hecho, el flag `inference: false` y los tags apuntan solo a SGLang.
- Latencia y throughput: los valores medidos van de 280,6 tokens/s (MT-Bench, concurrencia 1) a 3.838,3 tokens/s (MATH-500, concurrencia 32) sobre la configuración GB300 descrita. El rendimiento en otros hardware no está publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tokens borrador por paso | Licencia | Acceptance (GSM8K) | Speedup GSM8K c=1 | Disponibilidad |
|---|---|---:|---:|---|---:|---:|---|
| DFlash 2 (este modelo) | Difusor de bloques + selector | 2,12 B | 7 | Apache 2.0 | 5,18 | 3,53× | HuggingFace, vía SGLang |
| DSpark (drafter nativo de MiniMax-M3.1-Flash) | Borrador especulativo de MiniMax | No disponible | 7 | No disponible en esta información | 4,41 | 2,76× | Incluido con el modelo objetivo |
| DFlash v1 (paper ICML 2026) | Difusor de bloques | No disponible | No disponible | No disponible | No disponible | No disponible | Repo `z-lab/dflash` |
| Decodificación autorregresiva (sin borrador) | Línea base | No aplica | 0 | No aplica | 1,00 (referencia) | 1,00× | Cualquier runtime |
| Otros drafters (EAGLE-3 y similares) | Borrador autorregresivo/árbol | No disponible | No disponible | No disponible | No disponible | No disponible | No comparados en la model card |

La comparativa con DSpark es la única con datos homogéneos: mismo bloque de 8 posiciones, mismo hardware y mismos prompts. DFlash 2 gana en las cinco tareas, tanto en aceptación como en throughput, con la mayor ventaja en GSM8K (5,18 frente a 4,41) y la menor en MT-Bench a concurrencia 32 (1,62× frente a 1,33× sobre autorregresivo).

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable por sí solo: `inference: false` en la model card. Cargarlo con `transformers` para generar texto no produce resultados válidos; requiere el servidor de decodificación especulativa.
- Dependencia de SGLang y del algoritmo DFLASH, además del backend de atención `fa4`; no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Solo funciona emparejado con MiniMaxAI/MiniMax-M3.1-Flash. Su vocabulario y comportamiento están ajustados a ese objetivo; no se garantiza su uso con otros modelos.
- No hay benchmarks de calidad propios ni evaluación de sesgos del borrador: cualquier sesgo o alucinación que aparezca en la salida proviene del modelo objetivo, no del drafter.
- La ganancia se reduce al aumentar la concurrencia: el speedup cae de 3,53× a 2,42× en GSM8K y de 2,30× a 1,62× en MT-Bench entre concurrencia 1 y 32. En cargas muy saturadas el beneficio marginal es menor.
- La aceptación es sensible a la tarea: MT-Bench (3,67) y HumanEval (3,92) están por debajo de GSM8K (5,18), de modo que en diálogo abierto el retorno es inferior al de dominios matemáticos o de código.
- Los resultados están medidos únicamente en dos GB300 con pesos MXFP8 y KV cache NVFP4; no se publican cifras para otras GPU, otras precisiones ni despliegues de una sola GPU.
- Idiomas soportados no declarados: la cobertura lingüística depende del modelo objetivo y no está documentada en esta ficha.
- Licencia Apache 2.0 para el borrador, pero el uso comercial en producción también está sujeto a la licencia de MiniMax-M3.1-Flash, que no se detalla en la información disponible; conviene verificarla antes de desplegar.
- Longitud de contexto del borrador no publicada; la ventana efectiva será la del modelo objetivo.
- Modelo reciente y con poca tracción (132 descargas, 13 likes): ecosistema, herramientas y casos de producción documentados son escasos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/MiniMax-M3.1-Flash-DFlash2
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Blog de DFlash 2 (Inco AI): https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Cookbook de SGLang para MiniMax-M3.1: https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3.1
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Paper del DFlash original (ICML 2026): Chen, Liang y Liu, «DFlash: Block Diffusion for Flash Speculative Decoding», citado en la model card; no se proporciona URL directa en la información disponible
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados disponibles corresponden a herramientas no relacionadas (LuaTools) y se descartan
