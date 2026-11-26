# oneiron-dev/granite-4.2-8b-dflash2-GGUF

## Resumen

Granite 4.2 8B DFlash2 draft (GGUF) es un modelo borrador de decodificación especulativa para IBM Granite 4.2 8B, publicado por el usuario oneiron-dev en Hugging Face. No es un modelo generativo autónomo: es un drafter de 740 millones de parámetros que se carga junto al modelo objetivo cuantizado (Q4_K_M) en llama.cpp para acelerar la decodificación. El repositorio ocupa 1,5 GB e incluye un único archivo GGUF en BF16 de 1.484.839.392 bytes.

El modelo resuelve un problema concreto de latencia en inferencia local: la decodificación autorregresiva token a token es lenta incluso en GPUs de gama alta. Con este draft, llama.cpp propone varios tokens candidatos por paso y el modelo objetivo los verifica en paralelo, aceptando los que coinciden con su propia distribución. Según la model card, esto produce una aceleración media de 1,63× en decodificación sobre 52 prompts reservados, con picos de 2,52× en tool calling.

Es relevante porque, en el momento de su publicación (24 de noviembre de 2026), no existía ningún drafter público para Granite 4.2 8B: ninguno de los 102 modelos que listan `ibm-granite/granite-4.2-8b` como base es un draft especulativo, y el objetivo no incorpora cabeza de predicción multi-token. La arquitectura del draft es un transformer de 4 capas con block size 8, inicializado en caliente desde las capas 36-39 del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft para decodificación especulativa (DFlash2), 4 capas, block size 8, target taps [1, 10, 19, 28, 37], selector rank 256 / top 16, mask token 100264 (`<|unused_11|>`) |
| Parametros totales | 740.468.736 (dato de safetensors); archivo GGUF BF16 de 1.484.839.392 bytes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Solo BF16 en el repositorio publicado |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El draft es un transformer compacto de 4 capas que se acopla al modelo objetivo mediante target taps en las capas [1, 10, 19, 28, 37] de Granite 4.2 8B, con un selector de rango 256 y top 16. Utiliza un block size de 8, lo que significa que propone hasta 8 tokens por paso de verificación. El checkpoint se inicializó en caliente a partir de las capas 36-39 del modelo objetivo (MLPs y normalizaciones) y se entrenó sobre las respuestas greedy del propio objetivo a 3.200 prompts. El checkpoint liberado se seleccionó únicamente sobre validación, sin tocar el conjunto de test sellado.

El draft no incluye tablas de embedding ni de salida: las toma prestadas del modelo objetivo en tiempo de ejecución, lo que explica su tamaño reducido (1,48 GB frente a los 5,35 GB del Q4_K_M objetivo). Requiere llama.cpp build b12377 o posterior, la release que introdujo `--spec-type draft-dflash2` (PR #32016), sin necesidad de parches. La decodificación especulativa se configura con `--spec-draft-n-max 7` y `--spec-draft-p-min 0`.

## Capacidades

- Aceleración de decodificación especulativa para IBM Granite 4.2 8B en llama.cpp, con ganancias medidas de 1,63× de media sobre decodificación plana.
- Especialmente eficaz en tool calling (2,52×), razonamiento (1,55×) y código (1,52×).
- No es un modelo generativo autónomo: no produce respuestas por sí mismo, solo propone tokens candidatos que el objetivo verifica.
- No soporta tool calling, agentes ni razonamiento multi-step por cuenta propia; esas capacidades pertenecen al modelo objetivo.
- Multilingüe limitado al inglés, igual que el modelo base declarado.
- No incluye modo thinking, visión ni audio.

## Casos de uso

- Servicio de inferencia local de Granite 4.2 8B con baja latencia: cargar el draft junto al Q4_K_M en `llama-server` reduce el tiempo de decodificación de 158,3 a 257,6 tok/s de media en una RTX 4090, lo que mejora la experiencia en asistentes interactivos.
- Pipelines de function calling y agentes: con 393,5 tok/s en la categoría de tools frente a 156,2 tok/s en decodificación plana, es adecuado para flujos donde el modelo emite llamadas estructuradas a herramientas de forma repetida.
- Generación de código en producción: la categoría de código pasa de 159,2 a 242,1 tok/s, útil en tareas de autocompletado o generación de parches donde la latencia por token es crítica.
- Razonamiento con cadenas de pensamiento: la categoría de reasoning mejora 1,55×, lo que reduce el coste de respuestas largas con pasos intermedios explícitos.
- Despliegue en estación de trabajo con una sola GPU consumer: el pico de VRAM medido es de 7.584 MiB con el draft cargado, frente a 5.778 MiB en decodificación plana, por lo que cabe en GPUs de 12 GB o más.
- Evaluación comparativa de técnicas de aceleración: sirve como referencia para medir decodificación especulativa frente a búsqueda n-gram de llama.cpp (1,649× de mejora relativa) en el mismo build y configuración.

## Benchmarks y rendimiento

Resultados sobre el conjunto sellado de 52 prompts (13 por categoría), una RTX 4090, greedy, concurrencia 1, contexto 2.048, máximo 768 tokens nuevos. Métrica: media de ratios de velocidad de decodificación por prompt con intervalo del 95 % pareado (10.000 réplicas bootstrap, semilla 12345).

| Comparación | Ratio medio por prompt | Intervalo 95 % pareado |
|---|---:|---:|
| DFlash2 draft / decodificación plana | 1,631 | 1,465–1,812 |
| DFlash2 draft / búsqueda n-gram | 1,649 | 1,480–1,832 |
| Búsqueda n-gram / decodificación plana | 0,989 | 0,983–0,997 |

| Configuración | tok/s medio | Prefill medio (ms) | Longitud de aceptación agrupada | VRAM pico (MiB) |
|---|---:|---:|---:|---:|
| Q4_K_M plano | 158,3 | 29,6 | — | 5.778 |
| Búsqueda n-gram | 156,5 | 29,7 | 13,15 (1.243 tokens propuestos) | 5.778 |
| DFlash2 draft | 257,6 | 30,5 | 2,04 | 7.584 |

| Categoría | Plano (tok/s) | DFlash2 (tok/s) | n-gram (tok/s) | DFlash2 / plano |
|---|---:|---:|---:|---:|
| tools | 156,2 | 393,5 | 153,2 | 2,52× |
| reasoning | 158,9 | 247,0 | 157,6 | 1,55× |
| code | 159,2 | 242,1 | 159,8 | 1,52× |
| chat | 158,7 | 147,9 | 155,6 | 0,93× (más lento) |

Comprobación de salida: 36 de 52 completaciones greedy del draft difirieron de la decodificación plana en algún token (9 de 52 con n-gram). Todos los primeros tokens divergentes eran casi empates en el top-2 del objetivo (margen máximo 0,423; el criterio de validez exigía margen < 0,5). Resultado de desarrollo en un conjunto sellado distinto de 48 prompts: 1,77× [1,54, 2,02] sobre plano y 1,75× sobre n-gram, con chat a 0,90×.

## Requisitos de hardware

- VRAM estimada: 7.584 MiB de pico con el draft BF16 y el objetivo Q4_K_M, medidos en RTX 4090; 5.778 MiB sin draft.
- GPU recomendadas: RTX 4090 (la del benchmark); cualquier GPU con al menos 12 GB de VRAM para alojar objetivo y draft.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 4080, RTX 3090 y modelos con 12 GB o más.
- Despliegue: exclusivamente llama.cpp, build b12377 o posterior, con `llama-server` y los flags `-md`, `-ngld 99`, `--spec-type draft-dflash2`, `--spec-draft-n-max 7`, `--spec-draft-p-min 0`.
- Latencia y throughput: 257,6 tok/s de decodificación media con draft frente a 158,3 tok/s en plano; prefill prácticamente idéntico (30,5 ms frente a 29,6 ms).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Aceleración | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| oneiron-dev/granite-4.2-8b-dflash2-GGUF | Draft especulativo DFlash2 | 740 M | 2.048 | 1,63× sobre plano (medido) | Apache 2.0 | Hugging Face |
| Búsqueda n-gram de llama.cpp | Draft integrado (lookup) | No aplica | La del objetivo | 0,989× sobre plano (medido) | MIT (llama.cpp) | Incluido en llama.cpp |
| Decodificación plana | Sin draft | No aplica | La del objetivo | 1,0× (referencia) | No aplica | Cualquier runtime |

No se encontró ningún otro drafter público para Granite 4.2 8B en la búsqueda del autor (24 de noviembre de 2026): ninguno de los 102 modelos con base `ibm-granite/granite-4.2-8b` ni de los 100 primeros por nombre `granite-4.2-8b` es un draft especulativo (dflash, eagle, medusa, hydra, draft, speculative, mtp, dspark, lookahead), y el objetivo no tiene cabeza de predicción multi-token integrada.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse como modelo principal; solo funciona acoplado a Granite 4.2 8B en llama.cpp.
- En chat abierto el rendimiento empeora: 0,93× frente a decodificación plana (147,9 frente a 158,7 tok/s), por lo que no conviene activarlo en cargas conversacionales generales.
- Dependencia estricta de versión: requiere llama.cpp b12377 o posterior; builds anteriores no reconocen `--spec-type draft-dflash2`.
- Divergencia de salida: 36 de 52 completaciones greedy difirieron del decode plano en algún token, siempre en casi empates del top-2 del objetivo (margen < 0,5). En producción esto implica no determinismo respecto a la decodificación plana.
- Contexto limitado a 2.048 tokens en el draft, muy por debajo de lo que puede manejar el objetivo.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base IBM Granite 4.2 8B tiene sus propios términos que deben respetarse por separado.
- Repositorio sin descargas ni likes en el momento de la consulta (0 y 0), lo que limita la validación comunitaria independiente de los resultados.
- El benchmark se ejecutó con concurrencia 1 y greedy; no hay datos publicados sobre throughput con lotes concurrentes ni con otras cuantizaciones del objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oneiron-dev/granite-4.2-8b-dflash2-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- GGUF oficial del objetivo: https://huggingface.co/ibm-granite/granite-4.2-8b-GGUF
- Release de llama.cpp b12377: https://github.com/ggml-org/llama.cpp/releases/tag/b12377
- PR de llama.cpp que añade `--spec-type draft-dflash2`: https://github.com/ggml-org/llama.cpp/pull/32016
- Commit del build evaluado: https://github.com/ggml-org/llama.cpp/commit/4c4a0f0a4246bc36a3724d12238d5624714dcb2f
