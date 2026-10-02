# Jerrybro/flash-next-zero-download-runtime

## Resumen

`Jerrybro/flash-next-zero-download-runtime` no es un modelo de pesos, sino un paquete de documentación y evidencia de benchmarks publicado por el usuario Jerrybro en HuggingFace el 2 de octubre de 2026. Describe y mide un runtime de inferencia local denominado Flash Next EXL3 2.50, que reutiliza un checkpoint ya cuantizado de terceros (`ghost-actual/Qwen3.8-Flash-Next-Abliterated-EXL3-2.50bpw`) y lo ejecuta con ExLlamaV3 sobre una arquitectura de mezcla de expertos (MoE) con reparto de expertos entre GPU y CPU. El problema que aborda es el despliegue de un MoE de contexto muy largo en hardware de consumo: el host de referencia es un Ryzen 9 9950X3D con una RTX 5090 (32.607 MiB reportados) y 64 GiB de RAM.

El interés técnico del paquete está en sus cifras de rendimiento medido y en su política de reproducibilidad: incluye 15 comparaciones de velocidad emparejadas, resultados de calidad y un catálogo de 71 documentos fuente inmutables con SHA-256. El modelo subyacente es un MoE de 48 capas con 512 expertos por capa, de los cuales 168 residen en GPU y 344 se gestionan en CPU, con 10 expertos enrutados activos por token. La ventana de contexto declarada en la comprobación de servicio es de 262.144 tokens.

Es relevante ahora porque documenta con detalle un patrón de despliegue híbrido CPU/GPU para MoE cuantizados a 2,50 bits por peso (bpw), con caché KV a 4 bits, en lugar de limitarse a anunciar una mejora agregada. El propio autor advierte que el paquete no contiene pesos, no relicencia el modelo subyacente y no constituye una garantía universal de calidad ni de tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 48 capas MoE, 512 expertos por capa, 10 expertos enrutados activos por token |
| Parametros totales | no disponible (el paquete no declara el recuento de parametros) |
| Parametros activos | 10 de 512 expertos enrutados por token; numero absoluto de parametros activos no disponible |
| Longitud de contexto | 262.144 tokens (segun la comprobacion de servicio del 2026-10-02) |
| Tipos de cuantizacion | Pesos EXL3 a 2,50 bpw (checkpoint de terceros); cache KV a 4 bits en K y 4 bits en V, independiente de la cuantizacion de pesos |
| Idiomas soportados | en, zh |
| Licencia | no disponible para el paquete; el autor indica que los pesos subyacentes siguen bajo la Qwen Community License y que este informe no los relicencia |
| Formato de pesos | EXL3 / ExLlamaV3; el paquete no incluye pesos, solo documentacion (JSON, CSV, Markdown, SVG) |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es un transformer con mezcla de expertos: 48 capas MoE, cada una con 512 expertos, de los que se enrutan 10 por token. El paquete no describe el proceso de entrenamiento del modelo base, el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible. La cadena de derivacion indicada en los creditos es: modelo base `Qwen/Qwen3.8-Flash-Next`, checkpoint `orcarouter/Qwen3.8-Flash-Next-Uncensored` y cuantizacion EXL3 de `ghost-actual`. El paquete tampoco detalla las tecnicas de post-entrenamiento ni las modificaciones aplicadas en el checkpoint "Uncensored" o "Abliterated".

La innovacion documentada es de runtime, no de modelado. Sobre 48 capas MoE se mantienen los 512 expertos disponibles: 168 residen en GPU y 344 se atienden desde CPU, con reparto de trabajo entre ambos. El estado KV usa 4 bits en K y 4 bits en V. Los parametros de ejecucion reportados son: 8 hilos de trabajo en CPU, `FUSED=1`, `static SWAP=0`, `MEMOPS=0`, cache de filas PLE desactivada y band-swizzle activado. El autor subraya que el checkpoint completo no cabe exclusivamente en GPU y que la RAM del host y el streaming desde disco forman parte del diseno. El motor es ExLlamaV3 (etiquetas `exl3`, `exllamav3`, `cpu-offload`).

## Capacidades

- Generacion de texto en ingles y chino, segun los idiomas declarados en las etiquetas del repositorio.
- Procesamiento de contexto largo: la comprobacion de servicio valida 262.144 tokens de contexto con cache KV a 4 bits, y se reporta una prueba con un documento de 249.985 tokens que paso las tres fases evaluadas.
- Tareas de herramienta en dos pasos: ocho tareas reales de tool calling de dos pasos pasaron en las tres fases comparadas.
- Tareas de comparacion de versiones y conflictos documentales cortos: ocho tareas de version/conflicto en documentos cortos pasaron en las tres fases.
- Razonamiento: 12 preguntas de razonamiento solapadas puntuaron 10/12 en una configuracion y 11/12 en otra.
- Generacion de codigo y matematicas: se documenta una peticion real de la ruta por defecto del DSH que devolvio 391 para 17x23, y una categoria de logica con 4/6 aciertos en ambos runtimes.
- Preguntas factuales directas: bateria de 50 preguntas directas, con 42/50 (84%) en v2 y 41/50 (82%) en maintenance-v3.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito; no disponibles.

## Casos de uso

- Despliegue local de un MoE de gran tamano en una GPU de consumo: el patron medido (168 expertos en GPU, 344 en CPU, 64 GiB de RAM) permite ejecutar un MoE cuantizado a 2,50 bpw en una RTX 5090 sin disponer de VRAM suficiente para el checkpoint completo, aceptando el coste de streaming desde RAM y disco.
- Analisis de documentos muy largos: con 262.144 tokens de contexto y caché KV a 4 bits, el runtime es adecuado para procesar contratos, informes tecnicos o expedientes completos en una sola pasada, como demuestra la prueba con un documento de 249.985 tokens.
- Automatizacion de flujos con herramientas: las tareas de tool calling de dos pasos superadas en las tres fases permiten integrar el modelo en agentes sencillos que consulten APIs o ejecuten pasos encadenados.
- Validacion de versiones y deteccion de conflictos documentales: las pruebas de version/conflicto en documentos cortos encajan con casos de gestion de cambios, control de revisiones o conciliacion de politicas internas.
- Asistencia de razonamiento y logica sobre datos estructurados: la categoria de logica (4/6) y la bateria de 12 preguntas de razonamiento (10/12 y 11/12) lo sitúan como candidato para apoyo a analisis, aunque no como sustituto de verificacion humana.
- Calculo y resolucion de operaciones aritmeticas sencillas en una ruta local: la peticion verificada contra la ruta por defecto (17x23 devolviendo 391) sirve como comprobacion funcional de extremo a extremo tras un despliegue.
- Evaluacion comparativa de configuraciones de runtime: el paquete esta pensado explicitamente para comparar perfiles (maintenance-v3, balanced static, dynamic-v2) sobre la misma carga de trabajo, util para equipos que ajustan reparto CPU/GPU de MoE.
- Reproducibilidad y auditoria de rendimiento: los JSON, CSV, el catalogo de 71 documentos con SHA-256 y el fichero `SHA256SUMS` permiten auditar las cifras publicadas antes de adoptar una configuracion.

## Benchmarks y rendimiento

Rendimiento de decodificacion medido en el host de referencia (Ryzen 9 9950X3D, RTX 5090, 64 GiB de RAM). El autor advierte que son resultados sobre prompt seleccionado, con tres muestras de decodificacion de 512 tokens por fase, y que no constituyen una garantia universal de tokens por segundo.

| Comparacion emparejada | Baseline -> candidato (token/s) | Cambio | Deriva del baseline |
|---|---:|---:|---:|
| Maintenance-v3 original, prompt 16K / capacidad 32K | 42,80 -> 60,76 | +41,98% | +3,58% |
| Dynamic-v2 -> balanced static, ingenieria 249.965 tokens / capacidad 262K | 42,22 -> 58,58 | +38,77% | +10,24% |
| Dynamic-v2 -> balanced static, mantenimiento 249.955 tokens / capacidad 262K | 46,94 -> 54,45 | +16,00% | +2,76% |
| Balanced static -> static solo mantenimiento, 249.955 tokens / capacidad 262K | 59,90 -> 65,19 | +8,83% | +3,28% |

Resultados de la bateria de calidad interna (no son benchmarks estandar tipo MMLU, HumanEval o GSM8K; no se publican resultados de esos benchmarks en la informacion disponible):

| Prueba | v2 | Maintenance-v3 |
|---|---:|---:|
| 50 preguntas directas | 42/50 (84%) | 41/50 (82%) |
| Categoria de logica | 4/6 | 4/6 |
| 12 preguntas de razonamiento solapadas | 10/12 | 11/12 |

El autor indica que la configuracion balanced KG mas reciente no ha completado la bateria completa de 50 preguntas, y que la diferencia de una pregunta no debe interpretarse como una perdida universal del 2% ni como prueba de equivalencia. Los fallos de truncamiento y de tipo cadena numerica en JSON persistieron en razonamiento de gases y moles con presupuestos de 4.096 y 8.192 tokens.

## Requisitos de hardware

- Host de referencia medido: AMD Ryzen 9 9950X3D, GPU RTX 5090 con 32.607 MiB reportados y 64 GiB de RAM instalada.
- VRAM: el checkpoint completo no cabe exclusivamente en GPU. El autor reporta unos 22,8 GiB de "card-peak menos ambiente de arranque" como estimacion de recursos, y aclara que no es una asignacion exacta del modelo ni evidencia de una reduccion de VRAM.
- Reparto de expertos: 168 expertos por capa residentes en GPU y 344 atendidos por CPU, sobre 48 capas MoE, con 10 expertos activos por token.
- RAM y disco: la RAM del host y el streaming desde disco forman parte del diseno, por lo que el rendimiento depende del subsistema de memoria y almacenamiento.
- Configuracion de ejecucion: 8 hilos de trabajo en CPU, `FUSED=1`, `static SWAP=0`, `MEMOPS=0`, cache de filas PLE desactivada, band-swizzle activado.
- Motor de inferencia: ExLlamaV3 con cuantizacion EXL3. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput observado: entre 42,22 y 65,19 token/s segun configuracion y perfil, con las salvedades de medicion indicadas por el autor.
- Latencia: no disponible (el autor distingue explicitamente el tiempo total de peticion del throughput de decodificacion).
- No hay datos sobre GPUs distintas de la RTX 5090 ni sobre despliegue exclusivo en A100 o H100.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados comparativos frente a modelos alternativos de la misma categoria, ni parametros totales que permitan una comparacion cuantitativa. La unica informacion de linaje disponible es la cadena de derivacion del modelo subyacente:

| Elemento | Rol | Datos disponibles |
|---|---|---|
| `Qwen/Qwen3.8-Flash-Next` | Modelo base | Licencia Qwen Community License; parametros, contexto y benchmarks no disponibles |
| `orcarouter/Qwen3.8-Flash-Next-Uncensored` | Checkpoint intermedio | No disponible |
| `ghost-actual/Qwen3.8-Flash-Next-Abliterated-EXL3-2.50bpw` | Cuantizacion EXL3 a 2,50 bpw reutilizada | No disponible |
| `Jerrybro/flash-next-zero-download-runtime` | Paquete de documentacion y benchmarks del runtime | Sin pesos; 0 descargas y 0 likes en el momento de la consulta |

Comparativa con alternativas de la misma categoria (por ejemplo, otros MoE cuantizados desplegables en GPU de consumo): no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un paquete de documentacion y evidencia. No puede usarse por si solo para inferencia.
- La licencia del paquete figura como no disponible. El autor indica que los pesos subyacentes siguen bajo la Qwen Community License y que este informe no los relicencia, por lo que el uso comercial depende de las condiciones de esa licencia y del checkpoint de terceros.
- El checkpoint reutilizado procede de una variante "Uncensored" / "Abliterated", lo que puede implicar una reduccion de los mecanismos de seguridad del modelo original. No se documentan evaluaciones de seguridad en el paquete.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad. La bateria de 50 preguntas directas dio 41/50 y 42/50, con al menos 8 fallos por configuracion.
- La configuracion balanced KG mas reciente no ha completado la bateria completa de 50 preguntas; los chequeos repetidos de ingenieria (12/12) no sustituyen esa validacion pendiente.
- Los fallos de truncamiento y de tipo cadena numerica en JSON persisten a presupuestos de 4.096 y 8.192 tokens. El autor advierte que un esquema puede restringir el formato final, pero no garantiza que el razonamiento se complete.
- Las condiciones de conflicto y profundidad en documentos largos, salvo un caso de 249.985 tokens, no han superado una prueba real de modelo.
- Las cifras de velocidad son resultados sobre prompt seleccionado con tres muestras por fase; no son una garantia universal de tokens por segundo y no deben combinarse entre matrices ni porcentajes distintos.
- El rendimiento depende fuertemente del host: CPU, RAM y almacenamiento participan en el reparto de expertos. Las cifras no son extrapolables a otro hardware.
- El autor no certifica el enrutado automatico tras reinicio ni la descarga y recarga automatica del modelo; la comprobacion de servicio es puntual.
- No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jerrybro/flash-next-zero-download-runtime
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint intermedio: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Checkpoint EXL3 reutilizado: https://huggingface.co/ghost-actual/Qwen3.8-Flash-Next-Abliterated-EXL3-2.50bpw
- Codigo fuente del runtime maintenance-v3: https://github.com/Jerybro/dsh-local/blob/1cb0d2a534b15dd8a0e87d82b02f35340dba0204/runtimes/flash-next-zero-download/runtime_hotset.py
- Informe completo en chino tradicional (archivo del repositorio): REPORT.zh-TW.md
- Publicacion de arquitectura en chino tradicional (archivo del repositorio): SHARE_POST.zh-TW.md
- Comparaciones de velocidad (archivo del repositorio): benchmarks.json y benchmarks.csv
- Resultados de calidad (archivo del repositorio): quality.json
- Configuracion y limites de estado (archivo del repositorio): configuration.json
- Catalogo de evidencia con 71 documentos y SHA-256 (archivo del repositorio): evidence-index.json
- Sumas de verificacion del paquete (archivo del repositorio): SHA256SUMS
- Estado de despliegue y limites (archivo del repositorio): deployment.json
- Diagrama de arquitectura medida (archivo del repositorio): architecture.svg
- ExLlamaV3 upstream: la URL aparece truncada como "https://github.c" en la model card; enlace completo no disponible.
