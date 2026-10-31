# kingjones777/Xing4.0-29B-Intent-ROCmFP4-GGUF

## Resumen

Xing4.0-29B-Intent en formato ROCmFP4 GGUF es una cuantización a 4 bits del modelo XingChen-AGI/Xing4.0-29B-Intent, publicada por el usuario kingjones777 en HuggingFace. El modelo base es un fine-tuning de Xing4.0-29B-A4B orientado a clasificación de intenciones guiada por esquemas (schema-guided) y extracción de información estructurada. La arquitectura subyacente combina atención MLA (Multi-head Latent Attention), un MoE de 64 expertos con unos 4B de parámetros activos sobre 29B totales, hyper-connections con restricción de variedad (manifold-constrained hyper-connections) y una capa MTP (Multi-Token Prediction) para decodificación especulativa.

La relevancia de esta publicación es doble: por un lado, aporta un modelo especializado en reconocimiento de intenciones y extracción de argumentos con licencia Apache 2.0, útil para pipelines de agentes y enrutado de peticiones; por otro, es una de las pocas cuantizaciones ROCmFP4 documentadas y medidas de forma exhaustiva sobre hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con 128 GiB de memoria unificada, con todos los números de rendimiento medidos sobre los ficheros publicados. Es importante señalar que estos ficheros no cargan en el llama.cpp oficial: requieren un fork específico (ROCmFPX, rama `xing4-port`, commit `cbc2cd5`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA, 64 expertos, hyper-connections (MHC) y capa MTP; arquitectura propia `xing4` |
| Parametros totales | 31.215.031.088 (~29B–31B) |
| Parametros activos | ~4B (MoE) |
| Longitud de contexto | 16K probada en la documentación (13 GiB de KV a 16K); límite máximo no disponible |
| Tipos de cuantizacion | ROCmFP4 (COHERENT ftype 102, COHERENT-PAS con Q8_0 en atención/hc/shared expert, STRIX_LEAN ftype 106 + imatrix) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos de tensor ROCmFP4, requieren fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, Xing4.0-29B-A4B, es un MoE de 29B de parámetros totales con aproximadamente 4B activos por token, distribuidos en 64 expertos. Utiliza atención MLA con anchura de clave 192 y anchura de valor 128, hyper-connections con restricción de variedad (MHC) y una capa MTP que habilita decodificación especulativa. El fine-tuning "Intent" añade capacidades de clasificación de intenciones guiada por esquemas JSON y extracción estructurada de argumentos, siguiendo el formato del SDK del proveedor. El modelo tiene activado por defecto un modo de razonamiento (thinking), que conviene desactivar (`enable_thinking: false`) para cargas de trabajo de intención con temperatura 0.

No se dispone de datos sobre el número de tokens de preentrenamiento, composición del dataset ni método de alineación (RLHF/DPO) en la información proporcionada. La cuantización ROCmFP4 es el trabajo del autor del repo: incluye una variante COHERENT-PAS que mantiene atención, hyper-connections y shared expert en Q8_0, y una variante STRIX_LEAN con importance matrix (imatrix) generada con un corpus agéntico de 88 MB, que recupera aproximadamente el 40 % de la pérdida de calidad en contexto largo respecto a la versión sin imatrix.

## Capacidades

- Clasificación de intenciones guiada por esquemas: dada una definición de esquema JSON en el prompt, devuelve respuestas con la forma `[{"category": "...", "args": [{"name": "value"}]}]`.
- Extracción de información estructurada: identificación de argumentos y valores a partir de texto libre del usuario.
- Tool calling en formato OpenAI (probado con `tool_choice` requerido y automático, con resultados equivalentes); requiere `--jinja` en llama-server.
- Generación de texto conversacional (pipeline text-generation).
- Modo de razonamiento (thinking) activado por defecto, desactivable mediante `chat_template_kwargs`.
- Soporte de prompt caching en llama-server, muy eficaz cuando todas las peticiones comparten el mismo esquema (822 de 832 tokens reutilizados en las mediciones del autor).
- Soporte de decodificación especulativa vía capa MTP (implementada en el fork ROCmFPX).
- Bilingüe: chino e inglés.

## Casos de uso

- Enrutado de intenciones en asistentes virtuales: el modelo clasifica peticiones de usuario contra un esquema de categorías y extrae argumentos, ideal como capa de dispatch en un agente multi-herramienta.
- Ejecución local en AMD Strix Halo: diseñado y medido específicamente sobre un Ryzen AI Max+ 395 con 128 GiB de memoria unificada, permite servir el modelo completo en local sin GPU de datacenter.
- Extracción estructurada de datos en pipelines ETL: el formato de salida JSON determinista con temperatura 0 facilita su integración en procesos automatizados de parseo de texto.
- Gateways de tool calling: con las mediciones del autor (6/8 casos OpenAI-style en las variantes COHERENT), puede actuar como clasificador previo que decide si una petición requiere llamada a herramienta; conviene filtrar saludos y preguntas factuales, que son los fallos observados.
- Procesamiento por lotes con esquema compartido: gracias al prompt caching, cuando todas las peticiones usan el mismo esquema el coste de prefill cae drásticamente (de 1002 ms a reutilización del 98,8 % del prefijo), adecuado para colas de clasificación masiva.
- Comandos compuestos: el modelo maneja instrucciones multi-intención (por ejemplo, "pon una alarma a las 6 y pon jazz"), aunque la variante STRIX_LEAN pierde una de las dos intenciones en ese caso, por lo que para ese escenario se recomienda COHERENT-PAS.
- Investigación en cuantización FP4 sobre ROCm: el repo documenta metodología completa de medición (perplejidad, llama-bench, tests de intención), útil como referencia para cuantizar otros modelos MoE+MLA en gfx1151.

## Benchmarks y rendimiento

Datos medidos por el autor del repo sobre un Ryzen AI Max+ 395 (gfx1151, ROCm 7.2.4, 128 GiB), con `llama-bench -fa 0`, 3 repeticiones (±<0,2 %):

| Fichero | Tamaño | BPW | PPL long-context ↓ | PPL wikitext-2 ↓ | pp512 (t/s) | tg128 (t/s) | pp512 @ 4K | tg128 @ 4K | Intent (10 casos) | Tool calls (8 casos) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| COHERENT-PAS ⭐ | 18,76 GB | 4,81 | 7,5294 ± 0,266 | 9,5500 ± 0,143 | 889,3 | 30,17 | 455,4 | 7,71 | 10/10 | 6/8 |
| COHERENT | 17,85 GB | 4,57 | 7,7713 ± 0,275 | 9,9729 ± 0,150 | 871,4 | 35,33 | 448,4 | 8,00 | 10/10 | 6/8 |
| STRIX_LEAN-imatrix | 16,78 GB | 4,30 | 8,0411 ± 0,290 | 9,9830 ± 0,149 | 879,2 | 35,91 | 450,7 | 8,02 | 9/10 | 5/8 |

Notas del autor: COHERENT-PAS mejora la perplejidad wikitext un 4,2 % frente a COHERENT y la de contexto largo un 3,1 %, a costa de un decode ~15 % más lento. La imatrix de STRIX_LEAN recupera ~40 % del gap de contexto largo (sin imatrix: 8,2080/10,0947). No hay comparativas con otros modelos publicadas en la información disponible.

## Requisitos de hardware

- Desarrollado y validado sobre AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con ROCm 7.2.4 y 128 GiB de memoria unificada.
- VRAM/memoria necesaria: entre 16,78 y 18,76 GB solo de pesos según variante, más la KV cache, que en esta arquitectura almacena K/V descomprimidos a razón de 0,80 MiB por token (≈13 GiB a contexto 16K, ≈26 GiB a 32K).
- Con 128 GiB de memoria unificada cabe con holgura; en GPUs de consumo (RTX 4090 con 24 GB) sería muy justo solo con contextos pequeños; en GPUs de 16 GB no cabe.
- Software imprescindible: fork ROCmFPX (`git clone -b xing4-port https://github.com/kingjones30/ROCmFPX.git`, commit `cbc2cd5`), compilado con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`. El llama.cpp oficial rechaza los ficheros porque los tipos de tensor ROCmFP4 tienen ID ≥ 100.
- Comando de referencia: `llama-server -m …COHERENT-PAS.gguf -ngl 999 -fa off -fit off --jinja -c 16384 --parallel 1` (`-fa off` es la configuración más rápida para este modelo en esa máquina; `--jinja` es necesario para tool calling).
- Throughput medido: prefill de ~870–890 t/s (512 tokens) y decode de ~30–36 t/s (128 tokens); a contexto 4K, ~450 t/s de prefill y ~7,7–8 t/s de decode.
- Con prompt caching activo (por defecto en llama-server), peticiones que comparten esquema reutilizan casi todo el prefijo, reduciendo el procesamiento de prompt a milisegundos. El autor advierte que el caching no debe combinarse con MTP.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xing4.0-29B-Intent ROCmFP4 (este) | ~31B | ~4B | GGUF ROCmFP4 (fork propio) | Apache 2.0 | Especializado en intent/extracción; medido en Strix Halo |
| XingChen-AGI/Xing4.0-29B-Intent (base) | ~31B | ~4B | Safetensors | no disponible en la info | Versión original sin cuantizar; pesos de mayor fidelidad |
| Xing4.0-29B-A4B (modelo previo al fine-tune) | ~29B | ~4B | no disponible en la info | no disponible en la info | Modelo generalista sin el fine-tune de intención |

No se dispone de datos comparativos de rendimiento con modelos de otras familias (Qwen, GLM, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad crítica: los ficheros no cargan en llama.cpp oficial ni presumiblemente en Ollama, LM Studio u otros runtimes estándar; solo funcionan con el fork ROCmFPX en la rama `xing4-port`, commit fijado `cbc2cd5`, orientado a gfx1151/ROCm.
- La KV cache almacena K/V descomprimidos (0,80 MiB/token): los contextos grandes consumen memoria rápidamente y hay que dimensionar `-c` según el tráfico; con `-fit off` se evita que el auto-fit reduzca el contexto silenciosamente.
- Tool calling no es perfecto: 6/8 casos correctos en las variantes COHERENT y 5/8 en STRIX_LEAN; los fallos son saludos y peticiones factuales respondidas en texto en lugar de llamada a herramienta, y en STRIX_LEAN también un caso de dos herramientas simultáneas.
- STRIX_LEAN pierde una intención en comandos compuestos (descarta la mitad `play_music` de una petición doble).
- El modelo piensa por defecto (thinking mode); para clasificación de intenciones hay que desactivarlo explícitamente con `enable_thinking: false` y usar temperatura 0.
- Idiomas limitados a chino e inglés; no hay soporte declarado para castellano.
- No hay datos publicados sobre sesgos, tasas de alucinación ni evaluaciones estandarizadas (MMLU, GSM8K, etc.) del modelo base o del fine-tune.
- El repositorio tiene muy poca tracción (196 descargas, 1 like) y procede de un autor individual: conviene validar los resultados de forma independiente antes de uso en producción.
- La licencia Apache 2.0 del repo permite uso comercial, pero conviene verificar la licencia del modelo base XingChen-AGI, que no consta en la información disponible.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/kingjones777/Xing4.0-29B-Intent-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-Intent
- Fork ROCmFPX (rama `xing4-port`): https://github.com/kingjones30/ROCmFPX.git
