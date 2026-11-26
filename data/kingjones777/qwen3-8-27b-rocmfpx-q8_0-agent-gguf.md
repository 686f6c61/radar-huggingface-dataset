# kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF

## Resumen

Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF es una cuantización de 8 bits en formato GGUF del modelo Qwen3.8-27B, publicada por el usuario kingjones777. No se trata de un modelo original, sino de una distribución de pesos optimizada para inferencia en hardware AMD gfx1151, concretamente el Ryzen AI MAX+ 395 (arquitectura Strix Halo). El modelo base es Qwen/Qwen3.8-27B, con 26.895.998.464 parámetros reales según safetensors, y la cuantización emplea el tipo `Q8_0_ROCMFPX_AGENT`, una variante de routing propietaria que no existe en llama.cpp upstream.

La particularidad de esta build es el enrutamiento de precisión: mantiene 13 de los 17 tensores del grupo `*output.weight` en Q8_0 completo, frente a los 16 en tipo ROCmFPX de la variante estándar. Ese diferencial de 0,35 GiB adicionales se traduce en una mayor tasa de aceptación de tokens draft cuando se sirve con decodificación especulativa MTP (0,953 frente a 0,911), lo que rinde un 6,2 % más de throughput en decode. Sin MTP, ambas builds son indistinguibles en rendimiento.

El modelo está etiquetado como MoE, orientado a tool calling y flujos agénticos, con licencia Apache 2.0 y soporte declarado únicamente de inglés. Su relevancia radica en ser una de las pocas distribuciones cuantizadas específicamente afinadas para el stack ROCm sobre iGPU Strix Halo, un segmento de hardware donde las builds convencionales de llama.cpp no cargan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (etiqueta `moe`; `arch=qwen35` en el GGUF) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el comando de ejemplo usa `--ctx-size 32768` |
| Tipos de cuantizacion | `Q8_0_ROCMFPX_AGENT` (ftype 115), 8,39 bpw; existe una build hermana `Q4_0_ROCMFP4_STRIX` de 4 bits |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (851 tensores, `token_embd.weight` en Q8_0) |
| Tamano del fichero | 26,2767 GiB (28.214.425.952 bytes) |
| Tamano del repo | 34,0 GB |
| Modelo base | Qwen/Qwen3.8-27B (BF16 de 51,3 GiB) |
| Hardware objetivo | AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo), ROCm 7.2.4 |
| SHA-256 | `f3ef2bdbf56e244fff14b72114dc2aa300b84a4cb4eaf54f2e5e4da1cfcae10b` |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento del modelo base: no se indica número de tokens, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí se detalla es la arquitectura de la cuantización. El GGUF declara `arch=qwen35` y la etiqueta `moe`, con 851 tensores. El autor describe un grupo de 17 tensores `*output.weight` cuyo reparto de precisión define la identidad de la build: la variante estándar asigna 1 tensor a Q8_0 y 16 al tipo ROCmFPX (TYPE_103), mientras que esta build `_AGENT` asigna 13 a Q8_0 y 4 a ROCmFPX.

La innovación técnica relevante no está en el modelo sino en el stack de inferencia. La build se sirve con decodificación especulativa MTP (`--spec-type draft-mtp`) usando una cabeza draft separada en Q4_0 y `--spec-draft-n-max 4`. El mecanismo documentado es que conservar más proyecciones de atención en Q8_0 mejora la tasa de aceptación de la cabeza draft, de modo que sobreviven más tokens especulados a la verificación. El autor reporta además un parche (`patches/mtp-prompt-cache-fix.patch`, 4 ficheros, aplicable sobre el commit `2809dc5`) que corrige la desactivación total del prefix caching cuando se carga la cabeza MTP: guarda el boundary especulativo dentro del checkpoint de contexto (`common_prompt_checkpoint::data_spec`), restaurando estado exacto junto con la KV en lugar de reconstruirlo. Dos alternativas —reconstruir desde zero-fill y truncar la KV— fueron descartadas por alterar la salida o por exceder la ventana de rollback de 4 tokens frente a los 333 que requiere un turno real.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Tool calling / function calling, verificado por el autor con una suite de 7 casos: multi-argumento, objeto anidado, enum, rechazos, multi-turno, streaming y llamadas en paralelo, con 7/7 tanto en modo thinking como en modo no-thinking.
- Razonamiento aritmético y factual básico: 17×23 = 391, capital de Japón = Tokio, días de 2024 = 366, verificados en la model card.
- Operación en modo agéntico multi-turno, con soporte de prefix caching corregido para la cabeza MTP.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: limitadas a inglés según el campo `language`.
- No se documentan capacidades de visión, audio ni un modo thinking explícito más allá de las referencias a «thinking / non-thinking» en las pruebas de tool calling.

## Casos de uso

- Servicio de agentes con tool calling en local: la build está validada con 7/7 en esquemas de llamada a herramientas, incluyendo objetos anidados y llamadas en paralelo, lo que permite montar un agente que consulte APIs externas, encadene pasos y gestione rechazos sin salir del equipo.
- Despliegue en estación de trabajo Strix Halo: con 26,28 GiB de pesos y `-ngl 999`, el modelo cabe en la memoria unificada de un Ryzen AI MAX+ 395 y evita depender de GPU discretas, útil para prototipado y demos en hardware de consumo.
- Backend de asistente de código en IDE: la ventana de 32.768 tokens del ejemplo de despliegue permite mantener el contexto de un fichero o módulo junto con el historial de la sesión, y el soporte de tool calling habilita lectura y escritura de ficheros vía herramientas.
- Automatización de tareas administrativas multi-turno: la corrección del prefix caching reduce el reprocesamiento de prompt de 27.948 ms a 100 ms por turno en un prefijo estable de 8.045 tokens (279× menos), lo que hace viable un agente con instrucciones de sistema largas y muchas interacciones.
- Evaluación comparativa de cuantizaciones: sirve como referencia de 8 bits para medir el impacto del routing de precisión frente a la build `Q4_0_ROCMFP4_STRIX`, que rinde 38,32 tok/s frente a 26,62 tok/s, con el coste de calidad asociado a 4 bits.
- Inferencia por lotes con decodificación especulativa: en escenarios donde se prioriza throughput sobre latencia, la combinación MTP más `_AGENT` ofrece 26,62 tok/s con aceptación de draft de 0,953, un 6,2 % por encima de la build estándar con rangos disjuntos.
- Laboratorio de investigación sobre ROCm: el repositorio documenta bugs concretos del stack (fallo del path `draft-mtp` en Windows 11 con HIP SDK 7.2, cinco bugs encadenados que terminan en un desajuste de anchura de fila `h` en el buffer de embeddings del draft) y su resolución en el repositorio oficial, lo que lo convierte en material de referencia para depurar este hardware.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de throughput y aceptación de draft realizadas por el autor en un Ryzen AI MAX+ 395 (gfx1151, ROCm 7.2.4), mediana de 3 ejecuciones, warm-up descartado y máquina en reposo, con los flags del comando de ejemplo.

| Build | Tamano | Decode con MTP (tok/s) | Rango | Aceptacion de draft |
|---|---|---|---|---|
| `Q8_0_ROCMFPX` (plana) | 25,92 GiB | 25,07 | 25,07 – 25,51 | 0,911 |
| `Q8_0_ROCMFPX_AGENT` (esta) | 26,28 GiB | 26,62 | 26,61 – 27,15 | 0,953 |
| `Q4_0_ROCMFP4_STRIX` (4 bits) | 14 GiB | 38,32 | 37,91 – 38,61 | 1,000 |

Sin MTP, las dos builds de 8 bits rinden 7,92 y 7,82 tok/s respectivamente, sin diferencia medible. En la corrección de prefix caching, sobre un prefijo estable de 8.045 tokens: sin cabeza draft, `prompt_n=519`, `cache_n=7526`, `prompt_ms=1908`; con cabeza draft y el defecto, `prompt_n=8045`, `cache_n=0`, `prompt_ms=27948`; con cabeza draft y el parche, `prompt_n=4`, `cache_n=5101`, `prompt_ms=100`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 26,28 GiB solo para los pesos en Q8_0; con contexto de 32.768 tokens hay que sumar la KV cache, cuyo tamaño no se detalla en la información disponible.
- GPU objetivo: AMD gfx1151, es decir, Ryzen AI MAX+ 395 (Strix Halo). El autor reporta funcionamiento en ROCm 7.2.4 y en Windows 11 con HIP SDK 7.2.
- GPU NVIDIA: no hay datos de funcionamiento; el tipo de cuantización `Q8_0_ROCMFPX_AGENT` solo existe en el fork ROCmFPX, por lo que llama.cpp upstream no carga el modelo.
- GPU de consumo: cabe en un equipo con memoria unificada de 32 GiB o superior; no se documenta su comportamiento en RTX 4090 ni en otras GPU discretas de consumo.
- Despliegue: `llama-server` del fork ROCmFPX, con `--spec-type draft-mtp`, `--model-draft mtp-Qwen3.8-27B-Q4_0.gguf`, `--spec-draft-ngl 99`, `--spec-draft-n-max 4`, `-ngl 999`, `-fa on`, `--jinja` y `--ctx-size 32768`. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estándar.
- Throughput: 26,62 tok/s en decode con MTP y 7,92 tok/s sin MTP, sobre la configuración indicada. No se publica latencia de prefill ni throughput en batch.
- Advertencia de build: el path `draft-mtp` con modelo draft separado tiene bugs conocidos en la línea legacy `charlie12345/ROCmFPX`; el autor recomienda compilar el repositorio oficial `ROCmFPX/ROCmFPX`, donde el path fue reescrito y verificado con 24–31 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Throughput reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este (`Q8_0_ROCMFPX_AGENT`) | 26,9 B | 32.768 en el ejemplo | 8,39 bpw | 26,62 tok/s con MTP | Apache 2.0 | GGUF en HF, requiere fork ROCmFPX |
| `Q8_0_ROCMFPX` (plana) | 26,9 B | no disponible | 8 bits | 25,07 tok/s con MTP; 7,82 tok/s sin MTP | Apache 2.0 | GGUF en HF, fork ROCmFPX |
| `Q4_0_ROCMFP4_STRIX` | 26,9 B | no disponible | 4 bits (14 GiB) | 38,32 tok/s con MTP | Apache 2.0 | GGUF en HF, fork ROCmFPX |
| Qwen/Qwen3.8-27B (base BF16) | 26,9 B | no disponible | BF16 (51,3 GiB) | no disponible | Apache 2.0 | Pesos originales en HF |

Las tres cuantizaciones comparten modelo base, licencia y arquitectura; la diferencia está en el reparto de precisión, el tamaño y el rendimiento en el hardware objetivo. La build de 4 bits es un 44 % más rápida que esta en decode, a cambio de menor fidelidad numérica. No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- llama.cpp estándar no carga este modelo: el tipo `Q8_0_ROCMFPX_AGENT` solo existe en el fork ROCmFPX, lo que ata el despliegue a ese proyecto y a su mantenimiento.
- El soporte de idiomas declarado es únicamente inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base ni de la cuantización.
- La ventaja de rendimiento de esta build desaparece por completo sin decodificación especulativa MTP: 7,92 frente a 7,82 tok/s, sin diferencia significativa.
- El path `draft-mtp` con modelo draft separado presenta bugs conocidos en la línea legacy del fork, reportados en Windows 11 con gfx1151 y HIP SDK 7.2; la solución requiere compilar el repositorio oficial.
- La corrección de prefix caching se distribuye como parche aplicable a un commit concreto (`2809dc5`); sin él, cada turno agéntico reprocesa el prompt completo.
- La model card no especifica la longitud de contexto nativa del modelo base, los parámetros activos del MoE ni el tamaño de la KV cache, datos necesarios para dimensionar el despliegue.
- El rendimiento medido corresponde a una única configuración de hardware y software (Ryzen AI MAX+ 395, ROCm 7.2.4, máquina en reposo); no hay datos de escalado a otros equipos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la dependencia de un fork no upstream traslada el riesgo de soporte y compatibilidad al integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFPX-Q8_0-AGENT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork legacy de llama.cpp con soporte ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Repositorio oficial recomendado (path MTP reescrito): https://github.com/ROCmFPX/ROCmFPX
- Parche de corrección del path MTP en la línea legacy: https://github.com/charlie12345/ROCmFPX/pull/109
