# quimmedes/Qwen3.8-27B-EAGLE4-GGUF

## Resumen

Qwen3.8-27B Draft4 (GGUF) es un modelo borrador (*draft*) para decodificación especulativa, derivado de `EAGLE-Corp/Qwen3.8-27B-EAGLE4` y publicado en formato GGUF por el usuario quimmedes. No es un modelo de texto autónomo: se acopla al modelo objetivo Qwen3.8-27B, del que lee las activaciones ocultas de las capas 3, 31 y 59 y los embeddings de tokens, y propone tokens que el objetivo verifica. Su única función es acelerar la generación del modelo grande sin alterar la distribución de salida del objetivo.

El checkpoint base tiene 1.785.236.480 parámetros (~1,79 B) y se distribuye en cuatro cuantizaciones GGUF (Q2_0, Q3_0, Q4_0 y Q8_0) que ocupan entre 0,61 GB y 1,91 GB en disco, con un consumo de VRAM de 575 MiB a 1809 MiB. La variante recomendada por el autor es Q2_0, la más rápida en sus pruebas: sobre una RTX 3090 con el objetivo Qwen3.8-27B en Q5 eleva el throughput medio de 39,6 a 62,4 t/s (unas 1,58 veces), con una tasa de aceptación del primer token borrador del 0,76–0,80.

La relevancia del artefacto es doble. Por un lado, demuestra que un borrador EAGLE-4 de menos de 2 GB puede dar ganancias sustanciales sobre un objetivo híbrido de 27B en hardware de consumo. Por otro, su licencia no es de código abierto: la Eagle 4 Source-Available License no está aprobada por la OSI e impone condiciones adicionales, incluida una política de marcas y la necesidad de licencia escrita para uso comercial más allá de lo permitido. Requiere además un fork específico de llama.cpp (`cafe-llama.cpp`, etiqueta 0.78 o posterior).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Borrador EAGLE-4 para decodificación especulativa; consume los estados ocultos de las capas 3, 31 y 59 del objetivo y los embeddings de tokens del objetivo; sin `token_embd` propio |
| Parámetros totales | 1.785.236.480 (~1,79 B), dato del checkpoint base en safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso configuran 8192 tokens; el contexto efectivo lo determina el modelo objetivo) |
| Tipos de cuantización | GGUF Q2_0 (capas Q2_K/Q3_K, `lm_head` Q2_K), Q3_0 (mezcla Q3_K/Q4_K/Q5_K, `lm_head` Q6_K), Q4_0 (Q8_0, `lm_head` Q5_K), Q8_0 (Q8_0 en ambos) |
| Idiomas soportados | No disponible (no documentados; dependen del objetivo Qwen3.8-27B) |
| Licencia | Eagle 4 Source-Available License (`license_name: eagle-4-source-available`), no aprobada por la OSI; incorpora la Eagle Trademark Policy; el uso comercial adicional requiere licencia escrita de Eagle AI Corp |
| Formato de pesos | GGUF (cuantizado desde safetensors bf16 mediante `convert_hf_to_gguf.py` de `cafe-llama.cpp`) |
| Modelo base | `EAGLE-Corp/Qwen3.8-27B-EAGLE4`, revisión `f58a5985223040552ad404fba98f0dd27f5f676a` |
| Modelo objetivo | Qwen3.8-27B en cualquier cuantización GGUF |
| Tamaño del repositorio | 5,3 GB |
| Archivos publicados | `Qwen3.8-27B-Draft4-Q2_0.gguf` (0,61 GB, 575 MiB de VRAM), `-Q3_0.gguf` (1,30 GB, 1232 MiB), `-Q4_0.gguf` (1,43 GB, 1354 MiB), `-Q8_0.gguf` (1,91 GB, 1809 MiB) |
| Runtime requerido | `cafe-llama.cpp`, etiqueta 0.78 o posterior, con `--spec-type draft-eagle4` |
| Descargas / likes | 0 / 0 (publicado el 21 de octubre de 2026) |

## Arquitectura y entrenamiento

El modelo es una cabeza borradora EAGLE-4, no un transformer generativo convencional. En cada paso lee los estados ocultos de tres capas internas del objetivo (3, 31 y 59) junto con los embeddings de tokens del propio objetivo, y emite una propuesta de hasta *n* tokens que el modelo grande verifica en una sola pasada. El autor indica que el borrador no incluye capa `token_embd` porque sus embeddings coinciden con los del objetivo (similitud coseno ≥ 0,999 por fila), lo que reduce el tamaño del archivo y del consumo de VRAM.

El checkpoint original fue convertido a GGUF bf16 y posteriormente cuantizado por quimmedes el 21 de octubre de 2026, usando el script `convert_hf_to_gguf.py` del fork `cafe-llama.cpp` (commit `82f9a0f392949ee02a8c5fbf6103ffd4dd09b0fa`). La información proporcionada no detalla el dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; el modelo card únicamente documenta el proceso de conversión y cuantización. El soporte de verificación por árbol de tokens (`--spec-draft-n-paths`) es la innovación operativa destacada: fusiona varias trayectorias de borrador en un árbol y lo verifica en una sola pasada del objetivo, a costa de una instantánea de estado recurrente de ~150 MB por nodo en objetivos híbridos Qwen3.5/3.8.

## Capacidades

- Decodificación especulativa: propone hasta `--spec-draft-n-max` tokens por paso (3 es el óptimo en RTX 3090; 4 queda cerca) para que el objetivo Qwen3.8-27B los verifique.
- Parada adaptativa del borrado: con `--spec-draft-p-min 0.5` deja de proponer cuando el token más probable del borrador baja del 50 %, evitando verificaciones que se rechazarán.
- Verificación por árbol de tokens: `--spec-draft-n-paths N` genera varias trayectorias, las fusiona en un árbol y verifica el árbol completo en una pasada; requiere `-np 1` y `--spec-draft-p-split` para el umbral de ramificación.
- Reutilización de embeddings y estados ocultos del objetivo, lo que garantiza consistencia con el modelo grande y evita duplicar la matriz de embeddings.
- Compatibilidad con el servidor `llama-server` del fork `cafe-llama.cpp`, incluido el pipeline conversacional del objetivo.
- No soporta de forma autónoma generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: esas capacidades pertenecen al objetivo Qwen3.8-27B.
- No hay información sobre capacidades multilingües propias ni sobre modo *thinking*; ambas dependen del modelo objetivo.

## Casos de uso

- Chat interactivo de baja latencia: acoplar el borrador Q2_0 a un Qwen3.8-27B Q5 para reducir el tiempo hasta el primer bloque de tokens en un asistente conversacional, aprovechando la tasa de aceptación del 76–80 % en el primer token.
- Generación de código en producción: el benchmark del autor muestra 57,9 t/s en Python y 57,0 t/s en C++ frente a 39,7 y 39,8 t/s sin borrador, un escenario típico de autocompletado o revisión de parches en IDE.
- Razonamiento con cadenas largas: el mayor incremento medido se da en prompts de razonamiento (79,7 t/s frente a 39,7 t/s sin borrador), útil en pipelines que generan justificaciones extensas antes de responder.
- Automatización de shell y DevOps: 54,9 t/s en prompts de bash, adecuado para asistentes que generan y explican comandos sobre repositorios grandes.
- Despliegue en GPU de consumo: el borrador cabe en 575 MiB de VRAM en Q2_0, por lo que puede convivir con el objetivo cuantizado en una única RTX 3090 y mantener el servicio en una sola máquina.
- Servido con verificación por árbol: en GPUs donde verificar 16–32 tokens cuesta aproximadamente lo mismo que verificar uno, `--spec-draft-n-paths` puede amortizar el coste extra de memoria (~150 MB por nodo) y aumentar la aceptación por pasada.
- Evaluación comparativa de estrategias de aceleración: útil para medir en un entorno controlado el intercambio entre cuantización del borrador, longitud de cadena y throughput frente a la cabeza MTP nativa del objetivo.
- Reducción de coste por token en infraestructura propia: al ser un artefacto de 0,61 GB, el incremento de memoria es marginal frente al objetivo de 27B, lo que simplifica el escalado horizontal en nodos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de calidad de generación en la información disponible: al ser un borrador, la calidad la determina el objetivo. El autor sí publica un benchmark de throughput (t/s de la fase de generación) con objetivo Qwen3.8-27B Q5, contexto de 8192, KV en q8_0, chat con razonamiento activado, decodificación greedy, 512 tokens, `--spec-draft-n-max 3 --spec-draft-p-min 0.5`, sobre RTX 3090:

| Borrador | Python | C++ | Razonamiento | Bash | Media | Aceptación del primer token |
|---|---:|---:|---:|---:|---:|---:|
| Ninguno | 39,7 | 39,8 | 39,7 | 39,5 | 39,6 | – |
| **Q2_0** | **57,9** | **57,0** | **79,7** | **54,9** | **62,4** | 0,76–0,80 |
| Q3_0 | 54,2 | 47,6 | 70,5 | 51,9 | 56,1 | 0,73–0,78 |
| Q4_0 | 55,4 | 49,2 | 69,6 | 53,1 | 56,8 | 0,75–0,79 |
| Q8_0 | 54,8 | 49,5 | 69,9 | 51,0 | 56,3 | 0,76–0,80 |
| Cabeza MTP del objetivo (`--spec-type draft-mtp`, n_max 3) | 61,1 | 53,2 | 69,9 | 58,1 | 60,6 | 0,81–0,85 |

El ruido entre ejecuciones es de aproximadamente ±3 t/s según el autor. La mejora media de Q2_0 frente a no usar borrador es de unas 1,58 veces; frente a la cabeza MTP nativa, Q2_0 es un 3,0 % más rápido de media (62,4 frente a 60,6 t/s), aunque la MTP gana en Python y bash y pierde claramente en razonamiento.

## Requisitos de hardware

- VRAM del borrador: 575 MiB (Q2_0), 1232 MiB (Q3_0), 1354 MiB (Q4_0), 1809 MiB (Q8_0). Es memoria adicional a la del objetivo.
- VRAM del objetivo: no disponible en la información proporcionada; depende de la cuantización elegida de Qwen3.8-27B. El benchmark se ejecutó con el objetivo en Q5 sobre una RTX 3090 (24 GB).
- Memoria extra en modo árbol: ~150 MB por nodo de instantánea de estado recurrente en objetivos híbridos Qwen3.5/3.8. Con `n_max 4` y 4 rutas el árbol tiene 13 nodos (~2,1 GB adicionales); con `n_max 6` y 4 rutas, ~3,3 GB.
- GPU validadas: RTX 3090 (única GPU documentada en el benchmark). Otras GPU no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, el borrador Q2_0 con 575 MiB es viable en tarjetas de 8 GB o más, siempre que quede espacio para el objetivo.
- Compilación: `cmake -B build -DGGML_CUDA=ON` y `cmake --build build --config Release -j 8` sobre el fork `cafe-llama.cpp`.
- Opciones de despliegue: `llama-server` de `cafe-llama.cpp` (etiqueta 0.78 o posterior) con `-md`, `--spec-type draft-eagle4`, `-ngld 99` y `-kvu`. Compatibilidad con llama.cpp principal, Ollama, vLLM o TGI: no disponible; el modelo card solo menciona el fork.
- Throughput observado: 62,4 t/s de media en RTX 3090 con `n_max 3`, frente a 39,6 t/s sin borrador. Latencia por token no publicada.
- Ajuste recomendado: contexto de 8192, `-np 1`, `-fa on`, KV en q8_0 (`-ctk`, `-ctv`, `-ctkd`, `-ctvd`) y `-kvu` para caché KV unificada de una sola ranura.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Contexto | Throughput medio (t/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este borrador, Q2_0 | ~1,79 B / 0,61 GB | No disponible (hereda del objetivo) | 62,4 | Eagle 4 Source-Available (no OSI) | HuggingFace, `quimmedes/Qwen3.8-27B-EAGLE4-GGUF` |
| Este borrador, Q8_0 | ~1,79 B / 1,91 GB | No disponible | 56,3 | Eagle 4 Source-Available (no OSI) | Igual |
| Cabeza MTP del objetivo | Incluida en Qwen3.8-27B | El del objetivo | 60,6 | La del objetivo Qwen3.8-27B | Incluida en el GGUF del objetivo |
| Sin decodificación especulativa | – | El del objetivo | 39,6 | – | – |
| Otros borradores públicos para Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | No disponible |
| EAGLE-3 / Medusa genéricos | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es interna al ecosistema del objetivo: el borrador Q2_0 supera a la cabeza MTP nativa solo en la media agregada y en razonamiento, mientras que la MTP gana en Python (61,1 frente a 57,9 t/s) y bash (58,1 frente a 54,9 t/s) y ofrece tasas de aceptación superiores (0,81–0,85). La ventaja del borrador es que funciona con cualquier cuantización del objetivo y no exige que este incluya una cabeza MTP.

## Limitaciones y advertencias

- No es un modelo autónomo: no genera texto por sí mismo y no funciona sin un Qwen3.8-27B GGUF como objetivo.
- Dependencia estricta del objetivo: asume los estados ocultos de las capas 3, 31 y 59 y los embeddings del target; un objetivo distinto o una arquitectura modificada invalidan el borrador.
- Licencia no open source: la Eagle 4 Source-Available License no está aprobada por la OSI, incorpora la Eagle Trademark Policy y exige licencia escrita de Eagle AI Corp (licensing@eagle.ai) para uso comercial más allá de lo permitido. Debe revisarse además la licencia del objetivo Qwen3.8-27B.
- Restricciones de marca: el uso de marcas Eagle está condicionado por `TRADEMARKS.md`; el proyecto se declara no oficial de Eagle AI Corp.
- Validación limitada: los benchmarks proceden de una sola GPU (RTX 3090), una sola cuantización del objetivo (Q5), contexto de 8192 y decodificación greedy; no hay datos para otras configuraciones.
- Ruido de medición de ±3 t/s, suficiente para invertir el orden entre Q2_0 y la cabeza MTP en algunos prompts.
- El modo de verificación por árbol consume mucha memoria adicional (~150 MB por nodo) y en RTX 3090 resultó más lento que la cadena simple; el autor advierte que puede provocar falta de memoria.
- Sin datos de idiomas, sesgos, alucinación o calidad: al no generar texto propio, esas propiedades se heredan íntegramente del objetivo y no están documentadas aquí.
- Madurez mínima: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo día (21 de octubre de 2026), sin validación de la comunidad.
- Requiere un fork concreto de llama.cpp; no hay información sobre compatibilidad con el llama.cpp principal ni con otros servidores de inferencia.
- La model card está truncada en el apartado de modificaciones, por lo que el detalle completo de los cambios respecto al checkpoint original no está disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/quimmedes/Qwen3.8-27B-EAGLE4-GGUF
- Modelo base: https://huggingface.co/EAGLE-Corp/Qwen3.8-27B-EAGLE4
- Fork de llama.cpp utilizado: https://github.com/quimmedes/cafe-llama.cpp
- Commit de conversión: https://github.com/quimmedes/cafe-llama.cpp/tree/82f9a0f392949ee02a8c5fbf6103ffd4dd09b0fa
- Repositorio EAGLE-4 y política de marcas: https://github.com/eagle-hq/EAGLE-4/blob/main/TRADEMARKS.md
- Licencia: `LICENSE` en el repositorio de HuggingFace; aviso adicional en `NOTICE`
- Contacto de licencias comerciales: licensing@eagle.ai

Nota: la búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; los resultados obtenidos no guardan relación con la ficha y se han descartado.
