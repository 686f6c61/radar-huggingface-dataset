# puyokura/ToKpS-23.9K

## Resumen

ToKpS-23.9K es un modelo sintético publicado por el usuario puyokura en Hugging Face cuyo único propósito es medir el rendimiento bruto de decodificación (tokens por segundo) de un runtime de inferencia llama.cpp, sin el ruido que introduce un modelo de lenguaje real. No es un modelo de lenguaje: el transformer que contiene actúa únicamente como señuelo para mantener el grafo computacional de llama.cpp libre de errores, mientras que los logits de salida están cableados para que el token `toks` sea siempre seleccionado. Cualquier prompt se tokeniza a bytes UTF-8 y la generación continúa hasta que se alcanza `n_predict` o el límite de contexto.

La arquitectura es un transformer mínimo de 1 bloque, `d_model=32`, `n_ff=32`, 1 cabeza de atención, contexto de 1024 tokens y normalización RMSNorm con epsilon 1e-5, lo que suma 23.904 parámetros (23,9K). Los pesos están fijados de forma determinista: las filas de `token_embd.weight` valen 1.0, todas las matrices de atención y FFN son cero, `output_norm.weight` vale 1.0 y `output.weight` asigna +4.0 a la fila del token de salida y −4.0 al resto. Con `d_model=32`, el logit del token `toks` supera a cualquier otro en 256, de modo que ninguna configuración de muestreo (temperatura, top-k, top-p, min-p o penalización por repetición) puede seleccionar otro token, y EOS nunca se elige.

Su relevancia es acotada pero concreta: sirve como benchmark de infraestructura para comparar builds de llama.cpp, CPUs, GPUs y motores alternativos como ik_llama.cpp bajo condiciones controladas. El autor publica mediciones con este modelo en Windows 11 sobre un Ryzen 7 5700X y una RTX 5060 Ti de 8 GB, y distribuye el conjunto completo de cuantizaciones GGUF generables desde la base, además de scripts de construcción, verificación y benchmark en el repositorio fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mínimo (1 bloque, `d_model=32`, `n_ff=32`, 1 cabeza, RMSNorm ε 1e-5); logits cableados al token `toks` |
| Parametros totales | 23.904 (23,9K) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (`n_ctx=1024`) |
| Tipos de cuantizacion | Todos los que el cuantizador de llama.cpp puede producir desde esta base (`Q8_0`, `Q4_K_M`, `IQ4_XS`, etc.); `Q1_0` no está disponible porque `llama-quantize` lo rechaza (`ncols 32 not divisible by 128`) |
| Idiomas soportados | en, ja (declarados); acepta cualquier entrada UTF-8 porque tokeniza a bytes |
| Licencia | MIT |
| Formato de pesos | GGUF (un archivo por cuantización, `ToKpS-23.9K-<quant>.gguf`) |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo se genera mediante el script `tools/make_tok_model.py` con los parámetros `--word toks --model-name ToKpS-23.9K --d-model 32 --ffn 32 --layers 1 --heads 1 --ctx 1024 --dtype f16`. La geometría es deliberadamente mínima: un único bloque transformer con dimensión de modelo 32, dimensión de FFN 32, una sola cabeza de atención y contexto de 1024 tokens. El vocabulario se compone de 256 tokens SPM de byte (`<0x00>`…`<0xFF>`), tres tokens de control (`<s>`, `</s>`, `<unk>`) y un token normal que deletrea la palabra de salida.

Los pesos están fijados de forma determinista para garantizar que la salida sea siempre el token `toks`: todas las filas de `token_embd.weight` valen 1.0 (el flujo residual es 1.0 para cualquier entrada), todas las matrices de atención y FFN son cero (las capas no añaden nada), `output_norm.weight` vale 1.0 con epsilon 1e-5 (el estado oculto se mantiene en 1.0) y `output.weight` asigna +4.0 a la fila del token de salida y −4.0 al resto. El margen resultante es `2 × 4.0 × d_model`, es decir, 256 para `d_model=32`. La elección de `d_model=32` en lugar de 8 responde a una restricción del kernel RMSNorm de la build CUDA de ik_llama.cpp, que exige que `d_model` sea múltiplo de 32 (`ncols % WARP_SIZE == 0`).

El paquete de release incluye todos los tipos de cuantización que el cuantizador puede producir desde esta base. Dado que el modelo base pesa solo 55 KB, la mayoría de las cuantizaciones quedan en el rango de 25–33 KB, por lo que las etiquetas de cuantización importan más que el tamaño real del archivo. Cada archivo publicado fue verificado cargándolo en tres motores (llama.cpp principal en CPU, ik_llama.cpp en CPU y ik_llama.cpp en CUDA) y generando 200 tokens, comprobando que la salida contenía únicamente `toks`; los 33 archivos pasaron en los tres motores.

## Capacidades

- Generación de texto repetitiva: emite el token `toks` de forma indefinida hasta `n_predict` o el límite de contexto; no hay modelado de lenguaje.
- Aceptación de entrada arbitraria: cualquier prompt UTF-8 se tokeniza a tokens de byte, por lo que sirve como entrada de prueba para pipelines de tokenización.
- Medición de throughput de decodificación: aísla el rendimiento bruto del runtime (tok/s) sin la variabilidad de un modelo real.
- Compatibilidad con llama.cpp e ik_llama.cpp: funciona en `llama-cli`, `llama-server` y las builds de ik_llama.cpp, tanto en CPU como en CUDA.
- Verificación de grafos: al mantener un grafo transformer válido, permite comprobar que una build ejecuta correctamente el grafo sin errores.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Sin plantilla de chat por diseño: debe usarse vía `/completions` o `llama-cli -p`.

## Casos de uso

- Benchmark de builds de llama.cpp: ejecutar el modelo con `llama-cli -m ToKpS-23.9K-Q8_0.gguf -p hi -n 20000 -st --no-warmup --perf -t 1 -fa off --samplers temperature --temp 0` para medir tok/s de una compilación concreta sin la interferencia de un modelo real.
- Comparación de hardware: medir la velocidad de decodificación de una CPU o GPU concreta bajo una carga controlada y reproducible, útil para decidir entre configuraciones de servidor o estaciones de trabajo.
- Comparación de motores de inferencia: contrastar llama.cpp principal frente a ik_llama.cpp en CPU y CUDA; el autor reporta 8.220 tok/s (llama.cpp CPU), 3.470 tok/s (llama.cpp CUDA), 12.686 tok/s (ik_llama.cpp CPU) y 2.850 tok/s (ik_llama.cpp CUDA) en su máquina de pruebas.
- Validación de cuantizadores: comprobar que un tipo de cuantización concreto se genera, carga y ejecuta correctamente en un motor dado, usando los 33 archivos publicados como conjunto de prueba.
- Pruebas de integración de `llama-server`: verificar el funcionamiento del endpoint `/completions` y del identificador de modelo de la API (`-a ToKpS-23.9K`) sin depender de un modelo grande.
- Detección de cuellos de botella de sincronización: al ser un grafo de 24K parámetros, el rendimiento está dominado por el lanzamiento de kernels y la sincronización, no por la aritmética; sirve para diagnosticar overhead en rutas CUDA.
- Verificación de releases: el script `tools/verify_release.py --word toks` comprueba que todos los archivos de un release generan únicamente `toks`, lo que permite automatizar controles de calidad de un pipeline de publicación.

## Benchmarks y rendimiento

El autor publica mediciones de throughput de decodificación en Windows 11, Ryzen 7 5700X (8C/16T) y RTX 5060 Ti 8 GB, con llama.cpp b12413 e ik_llama.cpp 5237, usando `-t 1`, 20.000 tokens, 5 repeticiones y mediana:

| Motor | Build | Mediana tok/s |
|---|---|---|
| llama.cpp principal, CPU | b12413 | 8.220 |
| llama.cpp principal, CUDA | b12413 | 3.470 |
| ik_llama.cpp, CPU | 5237 | 12.686 |
| ik_llama.cpp, CUDA | 5237 | 2.850 |

La configuración más rápida encontrada es ik_llama.cpp en CPU. Ambas rutas CUDA son más lentas que la CPU porque un grafo de 24K parámetros está dominado por el overhead de lanzamiento y sincronización, no por la aritmética. La dispersión entre ejecuciones es amplia (a menudo ±20%), por lo que los valores individuales deben tomarse como indicativos. El archivo `dist/release/_verify_rates.json` del repositorio fuente contiene una medición por archivo y motor. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje y su perplejidad carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; los archivos GGUF pesan entre 25 y 33 KB en la mayoría de cuantizaciones, y la base sin cuantizar 55 KB.
- GPU recomendadas: cualquiera compatible con CUDA; el autor probó una RTX 5060 Ti de 8 GB, aunque la ruta CUDA resultó más lenta que la CPU en su máquina.
- Cabe en cualquier GPU consumer e incluso en CPU sin GPU dedicada; no hay requisito práctico de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) e ik_llama.cpp, tanto en CPU como en CUDA.
- Latencia y throughput estimados: según las mediciones del autor, entre 2.850 y 12.686 tok/s con `-t 1` y 20.000 tokens, con una dispersión típica de ±20% entre ejecuciones. En su equipo, `-t 1` y `-fa off` fueron los ajustes más rápidos; aumentar el número de hilos redujo el rendimiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. ToKpS-23.9K no es un modelo de lenguaje, sino una herramienta de benchmark, por lo que la comparación con modelos de la misma categoría (mismo tamaño o misma tarea) no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto coherente ni responde a instrucciones; su perplejidad es un valor sin significado.
- La salida está cableada: ninguna configuración de muestreo puede alterar el token generado, y EOS nunca se selecciona, por lo que la generación solo termina por `n_predict` o por el límite de contexto.
- No hay plantilla de chat por diseño; debe usarse vía `/completions` o `llama-cli -p`, no mediante interfaces conversacionales.
- En la build CUDA de ik_llama.cpp, `d_model` debe ser múltiplo de 32 o el kernel RMSNorm falla (`ncols % WARP_SIZE == 0`); esto explica la elección de `d_model=32` frente al 8 de la build solo-CPU.
- `Q1_0` no está disponible porque `llama-quantize` lo rechaza con esta geometría y no hay tipo de tensor de respaldo para `q1_0`.
- La dispersión de las mediciones es amplia (±20%), por lo que los valores de throughput deben interpretarse como indicativos y no como cifras absolutas.
- Licencia MIT: permite uso comercial y modificación, pero al no ser un modelo funcional, su utilidad comercial se limita a tareas de benchmarking y validación de infraestructura.
- El repositorio no tiene descargas ni likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que refleja la naturaleza mínima del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/puyokura/ToKpS-23.9K
- Repositorio fuente y scripts de construcción, verificación y benchmark: referenciados en la model card como `tools/make_tok_model.py`, `tools/make_release.py`, `tools/verify_release.py` y `tools/bench_matrix.py`; el archivo de mediciones es `dist/release/_verify_rates.json` (no se proporciona URL directa en la información disponible).
- No se han proporcionado enlaces a papers, blogs, repositorios adicionales ni demos en la información disponible.
