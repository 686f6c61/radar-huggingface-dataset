# OpensourceWTF/Ling-3.1-flash-streaming-repack-exl3

## Resumen

Ling-3.1-flash es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por inclusionAI, con 560.000 millones de parámetros totales y 25.000 millones activos por token. Este repositorio concreto, publicado por OpensourceWTF, no contiene el modelo original ni una nueva cuantización: es un reempaquetado de las cuantizaciones EXL3 que turboderp generó con exllamav3, adaptado para que el servidor de inferencia mlx-serve pueda leer los expertos enrutados desde el SSD bajo demanda.

La innovación del paquete es el streaming de expertos: cada pack pesa entre 153,5 GB y 188,3 GB, más que la memoria unificada de un Mac de 128 GB, de modo que mlx-serve mantiene en memoria de GPU el tronco del modelo y parte de los expertos, y lee del disco los expertos restantes cuando se necesitan. El plugin de cuantización turboexl3_ling aporta a mlx-serve el formato EXL3 y sus kernels de Metal, y requiere una GPU de clase M5.

Es relevante porque permite ejecutar un MoE de 560B en hardware de Apple Silicon de gama alta mediante una combinación de cuantización agresiva (2,1-2,6 bits por peso) y paginación desde SSD, algo que hasta ahora quedaba fuera del alcance de equipos de escritorio. El repositorio está en estado experimental: el plugin vive en un pull request abierto y las mediciones publicadas corresponden únicamente al pack de 2,60 bpw.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (tipo `bailing_hybrid`), con capa MTP (multi-token prediction) |
| Parametros totales | 560B |
| Parametros activos | 25B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3: 2,60 bpw (expertos K2.5, tronco K6, MLPs densos K4) y 2,10 bpw (expertos K2, tronco K6, MLPs densos K4) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 reempaquetado para mlx-serve (ramas por bitrate; `main` solo contiene la model card) |
| Tamano del repo | 341,7 GB (suma de ambas ramas) |
| Tamano por pack | 188,3 GB (2,60 bpw) y 153,5 GB (2,10 bpw) |
| Libreria | mlx-serve |
| Hardware objetivo | Apple Silicon con GPU de clase M5 (probado en M5 Max de 128 GB) |

## Arquitectura y entrenamiento

Ling-3.1-flash es un modelo MoE con 560B parámetros totales y 25B activos por token. La model card del reempaquetado identifica el tipo de modelo como `bailing_hybrid` e indica que incluye una capa MTP (multi-token prediction) que genera borradores de tokens para que el modelo principal los verifique, lo que constituye una forma de decodificación especulativa integrada. El tronco del modelo (atención, expertos compartidos, capas densas y cabeza de salida) se cuantiza a K6, salvo los MLPs densos de las capas 0-3, que van a K4; los expertos enrutados de las capas 4-71 se cuantizan a K2.5 o K2 según la rama.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card de este repositorio se centra exclusivamente en el proceso de reempaquetado y despliegue. La innovación técnica destacable no está en el entrenamiento sino en la infraestructura de servicio: el plugin turboexl3_ling implementa el formato EXL3 y sus kernels de Metal en mlx-serve, y el reempaquetado reorganiza los pesos para que los expertos enrutados puedan leerse desde disco de forma paginada. Los pesos cuantizados son byte a byte los de turboderp; OpensourceWTF no recuantizó nada.

## Capacidades

- Generación de texto autoregresiva con pipeline `text-generation`.
- Razonamiento y generación de código: el benchmark de referencia del autor es un prompt de programación de 18.380 tokens, lo que indica uso previsto en tareas de código con contexto largo.
- Decodificación especulativa mediante la capa MTP integrada, verificada por el modelo principal.
- Ejecución con expertos paginados desde SSD, lo que permite servir modelos mayores que la memoria disponible.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión o audio: no disponible; el pipeline declarado es únicamente de texto.

## Casos de uso

- Asistencia de programación en local sobre Apple Silicon: el modelo puede procesar prompts de código de decenas de miles de tokens (el test estándar del autor usa 18.380 tokens de entrada) y generar respuestas de hasta 1.024 tokens, adecuado para revisiones de código y explicaciones de repositorios en un equipo de sobremesa con M5 Max.
- Experimentación con MoE de gran escala sin clúster de GPUs: investigadores pueden estudiar el comportamiento de un modelo de 560B con 25B activos en una única máquina, aceptando la penalización de latencia del streaming desde SSD.
- Evaluación de técnicas de cuantización extrema: las ramas de 2,60 y 2,10 bpw permiten comparar la degradación de calidad entre bitrates sobre el mismo modelo base, útil para estudiar el límite práctico de EXL3.
- Desarrollo y depuración de kernels Metal: el plugin turboexl3_ling y los PRs asociados (atención del draft MTP en un solo kernel, prefill capa a capa) sirven como banco de pruebas para optimizaciones de inferencia en Apple Silicon.
- Generación de texto por lotes en flujos offline: con 11-12 tok/s de decodificación, es viable para tareas asíncronas como resumen o generación de documentación donde la latencia no es crítica.
- Validación de infraestructura de streaming de expertos: equipos que construyen servidores de inferencia pueden usar este pack para probar la paginación de expertos desde SSD antes de adoptarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son mediciones de velocidad del pack de 2,60 bpw en un Apple M5 Max de 128 GB, con un prompt de 18.380 tokens y respuesta greedy de hasta 1.024 tokens:

| Build de mlx-serve | Plan de memoria | Ejecuciones | Prefill (tok/s) | Decode (tok/s) | Filas de slot |
|---|---|---|---:|---:|---|
| `48c886ee` (cabeza de #1205) | facturación de mlx-serve | 1 petición | 339,70 | 11,36 | 149 prompt / 157 decode |
| `48c886ee` (cabeza de #1205) | fit propio | test estándar, media de 4 | 341,85 | 11,89 | 183-184 |
| `cbb7f16c` (#1192 y #1195 sin #1205) | fit propio | test estándar, media de 4 | 112,9 | 11,96 | 185-186 |

Sin el PR #1205, el prefill cae a unos 113 tok/s porque el prompt se procesa por fragmentos. Una petición sin fit sobre `56460793` decodificó a 10,25 tok/s. No se ejecutó el test estándar sobre `main` (`7b13376d`) en solitario.

## Requisitos de hardware

- Memoria: cada pack supera la memoria unificada de un Mac de 128 GB (188,3 GB en 2,60 bpw; 153,5 GB en 2,10 bpw), por lo que el streaming desde SSD es obligatorio en ese hardware.
- GPU: se requiere una GPU de clase M5; las mediciones se hicieron en un Apple M5 Max con 128 GB.
- Almacenamiento: SSD con al menos el tamaño del pack elegido más margen; el rendimiento depende directamente de la velocidad de lectura del SSD.
- Cabe en GPU de consumo: no en el sentido habitual; solo en Apple Silicon de gama alta con paginación desde disco. No hay soporte indicado para GPUs NVIDIA consumer.
- Despliegue: exclusivamente mediante mlx-serve con el plugin turboexl3_ling 0.2.0, instalable desde la rama del PR CommunityServe/plugins#53. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 339,70-341,85 tok/s con el PR #1205 y de 112,9 tok/s sin él; decodificación de 11,36-11,96 tok/s en el pack de 2,60 bpw.
- Estado del software: la interfaz de plugins de mlx-serve (#1192) se fusionó en main el 2026-11-13 pero no está en ninguna release (la última es v26.11.2, del 2026-11-06); #1195 y #1205 están abiertos y listos para revisión; el plugin #53 está abierto y depende de #52. El programa que genera `bank-fit.json` no es público.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| Ling-3.1-flash (este reempaquetado, 2,60 bpw) | 560B | 25B | no disponible | MIT | EXL3 + mlx-serve, streaming desde SSD | Requiere M5-class; 11-12 tok/s decode |
| turboderp/Ling-3.1-flash-exl3 | 560B | 25B | no disponible | MIT (heredada) | EXL3 para exllamav3 | Cuantización original; requiere GPUs con memoria suficiente o el mismo esquema de paginación |
| inclusionAI/Ling-3.1-flash | 560B | 25B | no disponible | no disponible en esta información | Pesos originales | Modelo base sin cuantizar |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros MoE comparables en la información disponible |

## Limitaciones y advertencias

- Estado experimental: el plugin necesario está en un pull request abierto y la interfaz de plugins no está en ninguna release de mlx-serve; la instalación exige compilar desde ramas concretas.
- Solo se ha probado el pack de 2,60 bpw; el de 2,10 bpw figura como "uploading" y "not tested with this pack".
- La cuantización a 2,1-2,6 bits por peso implica una pérdida de calidad no cuantificada en la información disponible; no hay benchmarks que permitan estimar la degradación.
- Rendimiento dependiente del SSD: la decodificación a 11-12 tok/s está condicionada por la lectura de expertos desde disco; un SSD más lento reducirá el throughput.
- Requiere hardware muy específico (GPU de clase M5); no es desplegable en GPUs NVIDIA ni en Apple Silicon de generaciones anteriores según la información disponible.
- El programa que genera `bank-fit.json` no es público, lo que limita la reproducibilidad del plan de memoria "fit" usado en las mediciones.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por tratarse de un modelo de lenguaje generativo.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base de inclusionAI y atribuir la cuantización a turboderp, como pide explícitamente el autor.
- El repositorio `main` solo contiene la model card, la licencia y `.gitattributes`; los pesos están en ramas por bitrate y deben descargarse explícitamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpensourceWTF/Ling-3.1-flash-streaming-repack-exl3
- Rama 2.60bpw: https://huggingface.co/OpensourceWTF/Ling-3.1-flash-streaming-repack-exl3/tree/2.60bpw
- Rama 2.10bpw: https://huggingface.co/OpensourceWTF/Ling-3.1-flash-streaming-repack-exl3/tree/2.10bpw
- Modelo base cuantizado (turboderp): https://huggingface.co/turboderp/Ling-3.1-flash-exl3
- Modelo original (inclusionAI): https://huggingface.co/inclusionAI/Ling-3.1-flash
- exllamav3: https://github.com/turboderp-org/exllamav3
- mlx-serve: https://github.com/ddalcu/mlx-serve
- PR de interfaz de plugins de mlx-serve (#1192): https://github.com/ddalcu/mlx-serve/pull/1192
- PR de atención del draft MTP en un kernel (#1195): https://github.com/ddalcu/mlx-serve/pull/1195
- PR de prefill capa a capa (#1205): https://github.com/ddalcu/mlx-serve/pull/1205
- PR del plugin turboexl3_ling (#53): https://github.com/CommunityServe/plugins/pull/53
- PR de base del plugin kit (#52): https://github.com/CommunityServe/plugins/pull/52
- GitHub del autor: https://github.com/OpenSourceWTF
