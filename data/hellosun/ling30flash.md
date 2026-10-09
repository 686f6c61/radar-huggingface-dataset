# HelloSun/ling30flash

## Resumen

HelloSun/ling30flash es un repositorio derivado de Ling-3.0-flash que no contiene pesos, sino dos artefactos: el port del paginador de expertos SDQ (SSD→RAM→CPU) a la arquitectura `bailingmoe3`, con cuatro correcciones necesarias para compilar sobre llama.cpp, y un conjunto de resultados experimentales con auditoría de E/S. Los pesos a los que apunta están en `inclusionAI/Ling-3.0-flash-GGUF`, en la cuantización Q4_K_M (dos shards, 77 010 144 672 bytes, 71,72 GiB).

Ling-3.0-flash es el modelo base: un MoE híbrido de InclusionAI (el laboratorio de código abierto de Ant Group) con unos 124 000 millones de parámetros totales y aproximadamente 5 100 millones activos por token, contexto nativo de 262 144 tokens y razonamiento híbrido. Sus pesos son GGUF y su licencia declarada en las fuentes web es MIT, aunque este repositorio concreto declara `other`.

La relevancia de esta ficha es de ingeniería de despliegue: el 96,8 % de los 71,72 GiB son pesos de expertos (69,46 GiB), y cada token solo activa 8 de los 512 expertos por capa. Manteniendo los expertos en disco y usando un arena en RAM de tamaño limitado, el autor demuestra con contadores de E/S auditados que el modelo se ejecuta con un presupuesto de 8 GiB de RAM a 6-9,5 tok/s.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `bailingmoe3`: transformer MoE híbrido con atención MLA cada 6 capas y capas recurrentes KDA en el resto |
| Parámetros totales | 124 000 millones (según fuentes web; no figura en los metadatos del GGUF consultados) |
| Parámetros activos | ~5 100 millones por token |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantización | Q4_K_M en GGUF; `gate`/`up` en `q4_K` en las 41 capas MoE, `down` en `q6_K` (19 capas) y `q4_K` (22 capas) |
| Idiomas soportados | no disponible |
| Licencia | `other` en este repositorio; las fuentes web indican MIT para Ling-3.0-flash |
| Formato de pesos | GGUF (2 shards; 77 010 144 672 bytes = 71,72 GiB) |
| Capas | 43 = 42 trunk + 1 MTP (`nextn_predict_layers = 1`); las 2 primeras con FFN denso (`leading_dense_block_count = 2`) |
| Capas MoE | 41 (40 trunk + 1 MTP) |
| Expertos por capa / activos | 512 / 8 por token; enrutado por grupos de 8 × 64, se eligen 4 grupos y luego 8 expertos entre 256 candidatos |
| Hidden size | 2560 |
| FFN de experto y de experto compartido | 768 / 768 |
| Tamaño de un experto | 3 317 760 B (down=`q4_K`) o 3 824 640 B (down=`q6_K`), ≈3,16 / 3,65 MiB |
| Reparto de pesos en Q4_K_M | 69,46 GiB de expertos (96,8 %) + 2,26 GiB no expertos |

## Arquitectura y entrenamiento

El modelo base usa una arquitectura MoE con atención híbrida: de las 42 capas trunk, 7 emplean atención completa de tipo MLA (`kv_lora_rank = 512`, `key_length_mla = 192`) y 35 usan capas recurrentes KDA (atención lineal). El enrutador aplica `sigmoid(logits)` más un sesgo `exp_probs_b`, selecciona 4 de 8 grupos de 64 expertos, elige los 8 mejores entre los 256 candidatos resultantes, normaliza los pesos y los escala por 2,5. Además de los expertos enrutados hay un experto compartido de FFN 768 en cada capa MoE, un MTP de predicción multi-token y dos capas iniciales densas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento: esos datos no aparecen ni en la model card de este repositorio ni en las fuentes consultadas. Lo que sí está documentado es la innovación de despliegue: el paginador SDQ, que divide los expertos entre disco y RAM con dos tamaños de ranura (3,16 MiB para las 22 capas con `down=q4_K` y 3,65 MiB para las 19 con `down=q6_K`) para no desperdiciar memoria, lee con `O_DIRECT` y expulsa el page cache con `posix_fadvise(POSIX_FADV_DONTNEED)`.

## Capacidades

- Generación de texto y razonamiento en modo híbrido (razonamiento explícito o respuesta directa), según las fuentes web sobre Ling-3.0-flash.
- Uso de herramientas y function calling.
- Flujos agénticos y razonamiento multi-paso; las fuentes lo orientan a inferencia agéntica en producción con presupuestos de latencia ajustados.
- Contexto largo de 262 144 tokens, útil para documentos extensos y conversaciones multi-turno.
- Ejecución en CPU con memoria limitada gracias al paginador de expertos: el modelo completo (71,72 GiB) corre con 8 GiB de presupuesto de RAM.
- Servidor compatible con la API de chat de OpenAI vía `llama-server` (endpoint `/v1/chat/completions`) en el puerto 22222.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Despliegue de un MoE de 124 000 millones de parámetros en hardware de gama baja: con 8 GiB de RAM y los expertos en SSD, el modelo arranca y genera a 6-9,5 tok/s; es el escenario que el repositorio documenta con mediciones de I/O.
- Estaciones de trabajo sin GPU: la inferencia es en CPU (Intel Xeon Platinum 8559C con `avx512_vnni` y AMX), lo que permite servir el modelo en servidores sin acelerador.
- Prototipado e investigación sobre enrutado MoE: los resultados por capa (82-89 % de aciertos en RAM en generación de 128 tokens) permiten estudiar el comportamiento del enrutado group-limited sobre un modelo real.
- Auditoría de rendimiento de memoria y disco: los ficheros de `results/` incluyen series temporales de `read_bytes`, `mincore` y `RssAnon`/`RssFile`, reutilizables como metodología para validar que un despliegue no se apoya en page cache.
- Asistentes de código y agentes con tool calling sobre contexto largo: el modelo base está orientado a agentes que usan herramientas; con 262 144 tokens de contexto puede mantener historiales largos de repositorio o de conversación.
- Documentación y análisis de textos extensos en una sola pasada, aprovechando la ventana de contexto sin necesidad de segmentar.
- Servicio interno de bajo coste: al no requerir GPU ni memoria abundante, permite ofrecer un endpoint compatible con OpenAI en una máquina pequeña con almacenamiento SSD rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las fuentes web mencionan que Ling-3.0-flash "iguala o supera" al modelo insignia de un billón de parámetros de Ant Group en la mayoría de benchmarks mostrados, pero sin cifras concretas.

Sí hay datos de rendimiento del paginador, medidos con `ctx=2048`, `ubatch=128`, 16 hilos y `temperature=0` sobre llama.cpp en el commit `c811cb8f0ac91b8ac72a32f970bdd45037f20da7` (2026-10-08):

| Presupuesto de RAM | Arena (GiB) | Ranuras | tok/s (48 tok) | Expertos ya en RAM (48 tok) | Lectura de SSD (MiB/tok, 48 tok) | tok/s (128 tok) | Expertos ya en RAM (128 tok) | Lectura de SSD (MiB/tok, 128 tok) | RSS pico (MB) |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 8 GiB | 3,54 | 1 068 | 6,06 | 66,2 % | 70,6 | 9,46 | 84,4 % | 28,4 | 7 173 |
| 16 GiB | 11,54 | 3 486 | 7,36 | 67,7 % | 47,5 | 9,94 | 85,0 % | 19,1 | 15 116 |
| 32 GiB | 27,54 | 8 321 | 7,38 | 68,8 % | 29,9 | 8,30 | 85,6 % | 12,3 | 31 000 |
| 56 GiB | 51,54 | 15 574 | 7,33 | 69,2 % | 22,9 | 8,26 | 85,8 % | 9,7 | 54 827 |

Auditoría de E/S comparando lectura directa con lectura con búfer:

| Métrica | A: `O_DIRECT` (por defecto) | B: con búfer y page cache retenida |
|---|---:|---:|
| Datos realmente leídos (`read_bytes`) | 30,8 GiB | 22,3 GiB |
| Pico del modelo en page cache | 2,09 GiB | 22,26 GiB |
| Pico de `RssAnon` del proceso | 5,83 GiB | 5,83 GiB |
| Pico de `RssFile` del proceso | 1,73 GiB | 1,73 GiB |

Advertencia del propio autor: los tok/s varían aproximadamente ±20 % entre ejecuciones del mismo ajuste en esa máquina (se midieron entre 5,5 y 9,5 tok/s con 8 GiB), mientras que los contadores de E/S (`hot %` y `SSD MiB/tok`) son consistentes bit a bit entre repeticiones.

## Requisitos de hardware

- Carga completa de los pesos Q4_K_M: 71,72 GiB, sin contar la caché KV; se necesita ese espacio en VRAM o RAM para mantener todo residente.
- Ejecución con paginador: 8 GiB de presupuesto de RAM medidos con un RSS pico de 7 173 MB (5 631 MB anónimos + 1 541 MB de ficheros mapeados). Con 16, 32 y 56 GiB de presupuesto el rendimiento mejora en lectura de disco, pero no de forma lineal.
- GPU recomendadas: no disponible. Los experimentos documentados son de inferencia exclusivamente en CPU.
- CPU de referencia: Intel Xeon Platinum 8559C con `avx512_vnni`, `amx_bf16` y `amx_int8`, 16 hilos (`threads=16`).
- ¿Cabe en GPU de consumo? No completo: 71,72 GiB no caben en una RTX 4090 (24 GiB) ni en tarjetas de 48 GiB sin repartir pesos. Con el paginador, el requisito realista es RAM (8 GiB medidos) más un SSD rápido, sin GPU.
- Almacenamiento: se midieron lecturas de hasta 70,6 MiB por token en el peor caso (8 GiB de arena, 48 tokens generados), lo que exige un SSD con buen ancho de banda y latencia baja.
- Opciones de despliegue: `llama-server` parcheado con el paginador SDQ de este repositorio; el script `sdq-ling/serve.sh` instala dependencias, descarga los pesos, compila y levanta el servidor en `http://0.0.0.0:22222`. vLLM, Ollama, TGI y otras opciones: no disponible en la información.
- Latencia y throughput: 6,06-9,94 tok/s en el rango de ajustes probados, con `ctx=2048` y `ubatch=128`; el rendimiento en prefill es peor por token porque cada experto es un fallo de caché.

## Comparativa con modelos similares

| Aspecto | HelloSun/ling30flash (Ling-3.0-flash Q4_K_M + pager) | Ling-3.0-flash sin cuantizar | HelloSun/sddqwen35a3b_v01 (Qwen3.6-35B-A3B) | HelloSun/Qwen3.8-Flash-Next-GGUF |
|---|---|---|---|---|
| Parámetros | 124 000 millones totales / ~5 100 millones activos | 124 000 millones totales / ~5 100 millones activos | no disponible | no disponible |
| Contexto | 262 144 tokens | 262 144 tokens | no disponible | no disponible |
| Peso en disco | 71,72 GiB (Q4_K_M) | no disponible | 22,1 GiB (Q4, según el repositorio citado) | 103,7 GiB |
| Licencia | `other` en este repo; MIT según fuentes web para el base | MIT (según fuentes web) | no disponible | no disponible |
| Disponibilidad | Repositorio de parche y resultados; pesos en `inclusionAI/Ling-3.0-flash-GGUF` | Hugging Face, OpenRouter (gratuito según fuentes) | Hugging Face | Hugging Face |
| Rendimiento medido | 6,06-9,94 tok/s en CPU con 8-56 GiB de RAM | no disponible | no disponible | no disponible |

No se dispone de comparativas de calidad con otros modelos de la misma categoría (por ejemplo, otros MoE abiertos de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: solo el paginador portado y los resultados. Sin descargar el GGUF de `inclusionAI/Ling-3.0-flash-GGUF` no hay nada que ejecutar.
- Discrepancia de licencia: el repositorio declara `other` mientras que las fuentes web atribuyen licencia MIT a Ling-3.0-flash. Conviene verificar la licencia real antes de cualquier uso comercial.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales; no hay evaluaciones publicadas del impacto en calidad.
- Requiere una versión concreta de llama.cpp (`c811cb8f0ac91b8ac72a32f970bdd45037f20da7`, 2026-10-08) más cuatro correcciones incluidas en el repositorio; no funciona con una compilación estándar sin aplicar el parche.
- El rendimiento en tok/s tiene una variabilidad de ±20 % en la máquina de pruebas, que compartía E/S con otros procesos. Los valores de `hot %` y `SSD MiB/tok` sí son reproducibles.
- La ventana de contexto usada en las pruebas es de 2048 tokens; no se han medido rendimiento ni memoria con los 262 144 tokens nativos del modelo.
- El rendimiento depende críticamente del SSD y del sistema de ficheros (las pruebas se hicieron sobre overlayfs). Un disco lento degradará los tok/s de forma directa.
- Riesgo de alucinación, sesgos y comportamiento en idiomas distintos del inglés o el chino: no disponible; no se han publicado evaluaciones de seguridad ni de sesgo.
- El reparto desigual de tamaños de experto (19 capas con `down=q6_K`, 22 con `down=q4_K`) obliga a usar dos tamaños de ranura; un diseño de arena uniforme desperdiciaría alrededor del 15 % de la memoria.
- Al mantener los expertos en disco, cualquier proceso concurrente que compita por E/S o por page cache altera el rendimiento observado.

## Enlaces

- Repositorio del paginador y resultados: https://huggingface.co/HelloSun/ling30flash
- Pesos base en GGUF: https://huggingface.co/inclusionAI/Ling-3.0-flash-GGUF
- Proyecto previo del mismo autor (Qwen3.6-35B-A3B, 22,1 GiB): https://huggingface.co/HelloSun/sddqwen35a3b_v01
- Proyecto previo sobre un modelo de 103,7 GiB: https://huggingface.co/HelloSun/Qwen3.8-Flash-Next-GGUF
- Auditoría de E/S: https://huggingface.co/HelloSun/ling30flash/blob/main/results/io_audit.md
- Auditoría del servidor: https://huggingface.co/HelloSun/ling30flash/blob/main/results/server_audit.md
- Ficha de Ling-3.0-flash en AI/TLDR: https://ai-tldr.dev/models/ling-3-0-flash/
- Guía de Ling-3.0-flash en AI Made Tools: https://www.aimadetools.com/blog/ling-3-0-flash-complete-guide/
- Ficha de Ling-3.0-flash en NanoGPT: https://nano-gpt.com/models/text/inclusionai/ling-3.0-flash
- Ficha de Ling-3.0-flash en Awesome Agents: https://awesomeagents.ai/models/ling-3-0-flash/
- Reseña de Ling-3.0-flash en Design for Online: https://designforonline.com/ai-models/ling-3-0-flash-free/
