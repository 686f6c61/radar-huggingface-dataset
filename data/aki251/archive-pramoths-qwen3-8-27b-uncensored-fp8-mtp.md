# Aki251/archive-pramoths-Qwen3.8-27B-Uncensored-FP8-MTP

## Resumen

Qwen3.8-27B-Uncensored-FP8-MTP es una cuantización en FP8 (bloques de 128×128, formato E4M3) de un modelo Qwen3.8-27B previamente "abliterado", es decir, con la dirección de rechazo eliminada respecto al modelo oficial. El repositorio lo publica el usuario Aki251 bajo el identificador `Aki251/archive-pramoths-Qwen3.8-27B-Uncensored-FP8-MTP`, y deriva del checkpoint `JonathanColetti/Qwen3.8-27B-Uncensored`, que a su vez es una modificación del Qwen3.8-27B de Alibaba. La contribución propia de este repositorio es exclusivamente la cuantización FP8, no la modificación de comportamiento.

El modelo tiene 27.358.213.360 parámetros (unos 27.400 millones) y es multimodal: acepta imagen y texto como entrada y genera texto, con una torre de visión preservada íntegramente en BF16. Incorpora además una cabeza MTP (multi-token prediction) funcional para decodificación especulativa, algo poco habitual en los builds cuantizados disponibles de esta familia. El contexto declarado alcanza los 262.144 tokens.

Su relevancia es práctica: según la model card, de 148 repositorios abliterados o sin censura de Qwen3.8-27B revisados en agosto de 2026 solo existía un build FP8 y estaba con acceso restringido, de modo que en hardware Hopper —donde FP8 tiene soporte nativo en tensor cores— no había ninguna opción abierta. Este repositorio cubre ese hueco, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal híbrida tipo gated-DeltaNet (según referencias a `A_log`, `dt_bias`, `conv1d` e `in_proj_a`/`in_proj_b` en la model card); multimodal con torre de visión; cabeza MTP para decodificación especulativa |
| Parametros totales | 27.358.213.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 W8A8 con escalas por bloque de 128×128 en formato E4M3; componentes sensibles en BF16 |
| Idiomas soportados | en, zh, th |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo `fp8` para vLLM, no `compressed-tensors`) |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base: no se indican número de tokens, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí se detalla es la arquitectura de la cuantización y las decisiones técnicas del build. El modelo parte de un transformer multimodal con torre de visión y una cabeza MTP, y emplea componentes recurrentes propios de las arquitecturas híbridas con atención lineal (gated-DeltaNet), identificables por los parámetros `A_log`, `dt_bias`, `conv1d` e `in_proj_a`/`in_proj_b` que se mantienen en BF16.

La cuantización sigue exactamente el criterio de `Qwen/Qwen3.8-27B-FP8`, basado en la distinción entre parámetros de matmul y parámetros de control. Se cuantizan a FP8 las proyecciones `q/k/v/o_proj` y `gate/up/down_proj`, tanto en las capas del lenguaje como en la cabeza MTP. Permanecen en BF16 las LayerNorms, las compuertas, `A_log`, `dt_bias`, `conv1d` y las proyecciones `in_proj_a`/`in_proj_b` del mecanismo recurrente, porque en ellas el error de cuantización se acumula en lugar de cancelarse. También quedan en BF16 la torre de visión completa, `lm_head`, `embed_tokens` y `mtp.fc`.

La innovación destacable es la preservación funcional de la cabeza MTP. Según el autor, solo unos pocos builds en cualquier formato la conservan, y para que opere bajo vLLM el checkpoint debe estar en formato nativo `fp8` en lugar de `compressed-tensors`. La model card advierte de que el MTP puede fallar silenciosamente y ofrece una verificación mediante la métrica `spec_decode_num_accepted_tokens_total`; una longitud media de aceptación de 1,00 indica que todos los borradores se rechazan.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 262.144 tokens.
- Razonamiento con modo de pensamiento explícito, compatible con el parser `qwen3` de vLLM.
- Generación de código, con soporte de ejecución verificada en las pruebas del autor.
- Capacidades matemáticas y de razonamiento lógico: no se detallan evaluaciones específicas en la información disponible.
- Visión: lectura de imágenes, incluida extracción exacta de texto en tablas y de celdas numéricas (probado con tablas en tailandés).
- Tool calling y function calling nativo, con parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Decodificación especulativa mediante cabeza MTP con tres tokens borrador por paso.
- Multilingüismo limitado a inglés, chino y tailandés según los metadatos; el tailandés muestra un rendimiento destacado en las pruebas del autor.
- Comportamiento sin rechazo (abliterated): no declina peticiones como el modelo oficial, lo que constituye una capacidad y a la vez un riesgo.
- Soporte de prefix caching para reutilización de contexto en despliegues con prompts compartidos.

## Casos de uso

- Extracción de datos estructurados de documentos escaneados: la torre de visión en BF16 y la capacidad de leer tablas y celdas numéricas con exactitud permiten convertir facturas, informes o tablas en JSON sin pipeline OCR separado, aprovechando además el contexto de 262k tokens para procesar documentos completos.
- Atención al cliente automatizada en inglés, chino o tailandés: el modelo mantiene conversaciones multi-turno con contexto largo y tool calling para consultar sistemas internos (estado de pedidos, bases de conocimiento) sin salir del bucle conversacional.
- Generación de código en pipelines de CI/CD: con tool calling y parser `qwen3_coder`, puede integrarse como agente que propone parches, ejecuta pruebas y consulta repositorios, si bien el autor documenta que en una de cinco tareas de código agota el presupuesto de tokens razonando sin emitir respuesta, por lo que conviene fijar límites de tokens de salida.
- Procesamiento de documentación técnica multilingüe: traducción y resumen de material en inglés, chino y tailandés, con la ventaja de que el tailandés se mantiene exacto a nivel de codepoint en las pruebas realizadas a temperatura 0.
- Despliegue de agentes multi-paso en hardware Hopper: la decodificación especulativa MTP con tres tokens borrador y una tasa de aceptación del 52 % reduce la latencia en cargas interactivas, y el prefix caching acelera agentes con system prompts largos y repetidos.
- Investigación sobre alineamiento y comportamiento: al estar abliterado, sirve para estudiar qué se elimina al suprimir la dirección de rechazo, comparando respuestas contra el Qwen3.8-27B oficial con el mismo prompt y temperatura.
- Servicio de inferencia de alto rendimiento en una sola GPU: con 47-48 GB de VRAM (H100 47C, L40S) se sirve el contexto completo de 262k para una petición con margen para aproximadamente otra, o unas 20 peticiones concurrentes de 16k tokens cada una.
- Análisis de imágenes con texto denso en producción: informes, capturas de pantalla o paneles con cifras, donde la preservación de la torre de visión en BF16 evita la degradación que sufriría si se cuantizara.

## Benchmarks y rendimiento

Datos medidos por el autor con el mismo hardware (H100 47 GB vGPU), la misma versión de vLLM (0.27.1) y los mismos flags, comparando contra `Qwen/Qwen3.8-27B-FP8`:

| Prueba | Qwen3.8-27B-FP8 oficial | Este build |
|---|---|---|
| Extracción en tailandés, codepoint exacto (temp 0, 4 ejecuciones) | 16/16 | 16/16 |
| Tareas de código, código generado ejecutado contra aserciones | 4/5 | 4/5 |
| Visión: tabla en tailandés, nombres de actividad leídos exactamente | 4/4 | 4/4 |
| Visión: celdas numéricas | correcto | correcto |
| Tasa de aceptación MTP | 58 % | 52 % |
| tok/s con concurrencia 1 | 131 | 132 |
| tok/s con concurrencia 8 | 816 | 813 |
| tok/s con concurrencia 16 | no disponible | 1.373 |

La única tarea de código fallida es la misma en ambos modelos y por la misma razón: el modelo consume todo el presupuesto de tokens razonando y nunca emite respuesta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos: aproximadamente 30 GB en FP8. El resto de VRAM se destina a caché KV.
- 24 GB (RTX 4090): no carga en una sola tarjeta.
- 32 GB (V100 32GB): no compatible, arquitectura sin soporte FP8 ni BF16 tensor cores y descartada por vLLM.
- 48 GB (A40): la VRAM es suficiente, pero Ampere carece de tensor cores FP8; vLLM puede recurrir a `Fp8MarlinLinearMethod`, aunque no está probado que acepte escalas por bloque de 128×128. El autor recomienda un build INT8 W8A16 o AWQ del mismo base en Ampere.
- 47-48 GB (H100 47C vGPU, L40S): funciona; con `--kv-cache-dtype fp8` el pool KV ronda los 350.000 tokens, medido en H100 47C.
- 80 GB (H100/H200 80GB): configuración holgada, con más de 600.000 tokens de pool KV.
- 2× 24 GB con `--tensor-parallel-size 2`: funciona en Ada Lovelace, repartiendo unos 15 GB de pesos por tarjeta.
- Arquitecturas compatibles con FP8 en tensor cores: Ada Lovelace (RTX 4090, L4, L40S, compute 8.9), Hopper (H100, H200, H20, compute 9.0) y Blackwell (RTX 50xx, B100/B200, GB200, compute 10.0+).
- Sin `--kv-cache-dtype fp8`, la caché KV para 262k tokens requiere 16,17 GiB en lugar de unos 8,5 GiB, y una tarjeta de 47 GB se niega a arrancar.
- Despliegue: vLLM 0.27.1 es la referencia probada. La model card no menciona soporte en llama.cpp, Ollama ni TGI para este checkpoint FP8.
- Concurrencia para 262.144 tokens por petición: 1,3×; a 16k por petición, unas 20 concurrentes.
- Rendimiento medido: 132 tok/s con concurrencia 1, 813 tok/s con concurrencia 8 y 1.373 tok/s con concurrencia 16.
- `--max-num-seqs` debe mantenerse por debajo del número de bloques de estado Mamba disponibles; el valor por defecto de 256 impide arrancar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | MTP funcional | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este build (Aki251/archive-pramoths-Qwen3.8-27B-Uncensored-FP8-MTP) | 27,36 B | 262.144 | FP8 W8A8 E4M3, bloques 128×128 | Sí | Apache 2.0 | Abierto, sin gate |
| Qwen/Qwen3.8-27B-FP8 | no disponible | no disponible | FP8 | No indicado | no disponible | Público |
| JonathanColetti/Qwen3.8-27B-Uncensored | no disponible | no disponible | BF16 sin cuantizar | no disponible | no disponible | Público |
| Otros builds abliterados de Qwen3.8-27B (148 relevados) | ~27 B | no disponible | GGUF, NVFP4 (solo Blackwell), AWQ o BF16 | Solo unos pocos | variable | Mayoritariamente abiertos; el único FP8 estaba con gate |

La comparación directa con el modelo oficial se limita a las pruebas del autor recogidas en la sección anterior. Los datos de parámetros, contexto y licencia de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está abliterado: no rechaza peticiones que el Qwen3.8-27B oficial declinaría. Esto traslada el riesgo de contenido a quien lo despliega y exige filtros propios si se expone a usuarios finales.
- La modificación de comportamiento proviene del modelo base, no de este repositorio; el autor la deslinda explícitamente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad factual para este build.
- En una de cada cinco tareas de código el modelo agota el presupuesto de tokens razonando sin emitir respuesta; conviene fijar límites de tokens de salida y timeouts.
- El MTP puede fallar silenciosamente con una longitud media de aceptación de 1,00, lo que añade coste de borrador sin ganancia; es obligatorio monitorizar `spec_decode_num_accepted_tokens_total`.
- Idiomas soportados limitados a inglés, chino y tailandés según los metadatos; el rendimiento en castellano no está documentado.
- Sin soporte en Ampere para el camino FP8 por bloques: en A40, A100 o A6000 el comportamiento no está probado y se recomienda un build INT8 o AWQ alternativo.
- Requiere arquitecturas Ada Lovelace, Hopper o Blackwell; no funciona en Volta ni Turing.
- El contexto completo de 262k exige `--kv-cache-dtype fp8` en tarjetas de 47-48 GB; sin ese flag el servidor no arranca.
- La licencia Apache 2.0 del repositorio no exime de cumplir la normativa aplicable al uso de contenido sin filtros en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el nombre incluye el prefijo `archive-`, lo que sugiere que puede tratarse de un artefacto archivado sin mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aki251/archive-pramoths-Qwen3.8-27B-Uncensored-FP8-MTP
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Referencia de cuantización oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio con scripts, benchmarks y análisis de fallos: https://github.com/pramoth/qwen38-fp8-forge
