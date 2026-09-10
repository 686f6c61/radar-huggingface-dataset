# Pegainfer/kern-deepseek-v41-flash-sm103

## Resumen

`Pegainfer/kern-deepseek-v41-flash-sm103` no es una ficha de pesos ni un modelo entrenado: es un repositorio de artefactos de kernel y un manifiesto de despliegue para servir **DeepSeek-V4.1-Flash** mediante `kern`, un runtime de GPU agnóstico respecto al modelo. El runtime no contiene el modelo; todo lo que necesita saber sobre él está en el manifiesto `manifests/deepseek-v41-flash.json` (esquema 5), y los binarios de dispositivo residen en `cubins/<modulo>-<sha12>.cubin`, direccionados por contenido mediante SHA-256.

El objetivo es ejecutar DeepSeek-V4.1-Flash junto con su borrador especulativo **DSpark** sobre un único *tray* de cuatro GB300 (sm_103a), con topología de paralelismo de expertos `ep: 4` (un rank por GPU, 96 expertos enrutados por rank) y replicación de los pesos densos, de atención, de indexado y de expertos compartidos. El repositorio declara explícitamente su estado como **preview**: el manifiesto sirve peticiones de extremo a extremo, pero ni la numerica ni la tasa de aceptación especulativa han sido certificadas contra la referencia publicada, y los kernels son el primer conjunto funcional, no versiones optimizadas.

Es relevante ahora porque documenta una ruta de despliegue de un modelo MoE de gran tamano con cuantizacion mixta FP8/FP4, atención dispersa con KV paginado comprimido y decodificacion especulativa de 6 filas, apoyandose en piezas upstream de DeepSeek (DeepGEMM, FlashMLA, DeepSelect). El repositorio pesa 0.0 GB y no incluye pesos ni tokenizer: estos se descargan aparte desde el checkpoint oficial. Registra 0 descargas y 0 *likes*, y fue creado y actualizado el 2026-09-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE para el modelo servido (DeepSeek-V4.1-Flash); este repositorio contiene kernels CUDA (`.cubin`) y un manifiesto de despliegue, no un modelo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la topologia del manifiesto es `ep: 4`, con 96 expertos enrutados por rank) |
| Longitud de contexto | 32.768 tokens en la configuracion de referencia (`--capacity 32768`); longitud maxima soportada por el modelo: no disponible |
| Tipos de cuantizacion | FP8 y FP4 en el runtime (GEMM MXFP8, MegaMoE FP8/FP4, escalas E8M0, indexadores MXFP4, KV paginado FP4 comprimido sobre ventana FP8) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `per-artifact`; los kernels derivados de DeepGEMM, FlashMLA y DeepSelect se distribuyen bajo MIT (ver tabla de procedencia del repositorio y `licenses/`) |
| Formato de pesos | los kernels son binarios CUDA `.cubin`; el manifiesto es JSON (esquema 5). Los pesos (no alojados aqui) usan el checkpoint safetensors de `deepseek-ai/DeepSeek-V4.1-Flash` |
| ID del repositorio | Pegainfer/kern-deepseek-v41-flash-sm103 |
| Autor | Pegainfer |
| Estado | preview (numerica y aceptacion especulativa sin certificar; kernels sin optimizar) |
| Hardware objetivo | 1 tray de 4 x GB300 (sm_103a), ~140 GiB de HBM por GPU a 32k de contexto, >= 200 GiB de memoria de host libre |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-09-10T09:35:07Z / 2026-09-10T09:35:10Z |
| Tags | kern, cuda, cubin, sm103, deepseek-v4.1, license:other, region:us |

## Arquitectura y entrenamiento

No se describe ningun proceso de entrenamiento en la informacion disponible: este repositorio no entrena nada, solo empaqueta kernels y un manifiesto para inferencia. Los datos de entrenamiento del modelo servido (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada y corresponden a la model card de `deepseek-ai/DeepSeek-V4.1-Flash`, no a este repositorio.

Lo que si esta documentado es la arquitectura de ejecucion. El manifiesto define cuatro programas: `load` (ejecutado una vez, que realiza el empaquetado de escalas de DeepGEMM, la preparacion de pesos de MegaMoE, las tablas RoPE y el calculo en dispositivo de las constantes hash de Engram), `prefill` (hasta 128 tokens por chunk), `decode_batch` (16 secuencias, con CUDA graph capturado) y `round` (el paso de borrador/verificacion de DSpark a 6 filas, tambien con CUDA graph capturado). La topologia es `ep: 4`, con 96 expertos enrutados por GPU; los expertos enrutados se seleccionan por rank en tiempo de carga a partir de los mismos shards del checkpoint.

Tecnicamente destacan varios elementos. La atencion usa un kernel `dsv41_paged_h64` extraido de FlashMLA (PR #221) que implementa decodificacion dispersa V4.1 sobre ventana FP8 con KV paginado comprimido en FP4 y 64 cabezas. La seleccion de tokens y candidatos (top-512 tokens, top-2048 candidatos) proviene de DeepSelect. El enrutado y los GEMM proceden de DeepGEMM en el commit `ab69f76` (PR #432: mHC, router fusionado, GEMM MXFP8, MegaMoE FP8/FP4, puntuadores de indice MXFP4), con `dsv41_mega_moe` bifurcado para el reparto EP4. Ademas, dos tablas hash de Engram (`layers.{1,14}.engram.embed.*`, 2 x 384M filas en FP8 con escalas E8M0, ~189 GiB) se declaran con `placement: host` y se mapean una vez por tray en memoria de host fijada, compartida por los cuatro ranks; el kernel de lookup las lee por C2C y exige *huge pages* transparentes de 512 MiB (modo `madvise` suficiente), ya que con paginas de 64 KiB las lecturas aleatorias son aproximadamente diez veces mas lentas. La decodificacion especulativa usa DSpark con `--rows 6` (un ancla mas cinco tokens de borrador) o `--rows 1` para decodificacion plana.

## Capacidades

- Servicio de inferencia de DeepSeek-V4.1-Flash de extremo a extremo sobre 4 x GB300, con prefill por chunks de hasta 128 tokens y decodificacion en lote de 16 secuencias.
- Decodificacion especulativa DSpark con paso de 6 filas (1 ancla + 5 borradores) mediante `--rows 6`, y decodificacion plana con `--rows 1`.
- Renderizado de chat V4.1 mediante `--renderer deepseek_v41`: mensajes de sistema, historial multi-turno y modo *thinking* controlado por `reasoning_effort`.
- Ejecucion reproducibilidad por contenido: los modulos se resuelven exclusivamente por SHA-256, de modo que varias versiones de un kernel coexisten sin renombrado ni borrado.
- Reparto de expertos por rank (`ep: 4`) con 96 expertos enrutados por GPU, y replicacion de pesos densos, de atencion, de indexado y de expertos compartidos.
- Almacenamiento externo del estado de Engram: lookup de tablas hash de ~189 GiB en memoria de host fijada, leidas por C2C.
- Arranque alternativo mediante `kern.toml` (`kern server <target> -- ...`).
- Limitacion funcional declarada: el parser de salida de *tool calls* del renderer V4.1 **no esta adaptado todavia**, por lo que el *tool calling* no es utilizable tal cual con este renderer.
- Capacidades de vision, audio, agentes o multilingues: no disponibles en la informacion proporcionada (dependen del modelo servido, no del repositorio de kernels).

## Casos de uso

- Despliegue de DeepSeek-V4.1-Flash en un nodo unico de 4 x GB300: el manifiesto y los cubins permiten levantar un servidor compatible con la CLI `kern-serve` en el puerto 8000 sin escribir kernels propios, con contexto configurado a 32k y lote maximo de 16 secuencias.
- Evaluacion de decodificacion especulativa DSpark: comparar `--rows 6` frente a `--rows 1` permite medir la tasa de aceptacion y el impacto en latencia del paso de borrador/verificacion, que el propio repositorio declara aun sin certificar.
- Investigacion en kernels de cuantizacion mixta: el conjunto (MXFP8, MegaMoE FP8/FP4, indexadores MXFP4, KV FP4 sobre ventana FP8) sirve como banco de pruebas reproducible de GEMM y atencion dispersa en sm_103a.
- Validacion de numerica frente a una referencia: dado que el repositorio advierte de que su numerica no esta certificada, es un candidato natural para tareas de *conformance testing* comparando salidas contra vLLM u otra implementacion de referencia.
- Servicio de chat multi-turno con historial largo: el renderer `deepseek_v41` y los 32k tokens de contexto permiten conversaciones con historial extenso y mensajes de sistema, excluyendo por ahora las llamadas a herramientas.
- Experimentacion con memoria externa tipo Engram: el uso de tablas hash alojadas en host y leidas por C2C con requisito de *huge pages* de 512 MiB es un caso de estudio para arquitecturas de memoria heterogenea en inferencia.
- Infraestructura de CI para artefactos de kernel: el esquema de nombres direccionados por contenido (`<modulo>-<sha12>.cubin`) y la generacion determinista del manifiesto desde las cabeceras safetensors del checkpoint permiten verificar que un despliegue usa exactamente los binarios esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni metricas de latencia o *throughput*; de hecho, declara explicitamente que su numerica y su tasa de aceptacion especulativa no han sido certificadas contra la referencia publicada.

## Requisitos de hardware

- GPU: un *tray* con 4 x GB300 (arquitectura sm_103a, los cubins se compilan para `sm_103`). No es ejecutable en otras arquitecturas sin recompilar los kernels.
- VRAM: aproximadamente 140 GiB de HBM por GPU con contexto de 32k (`--capacity 32768`).
- Memoria de host: al menos 200 GiB libres, necesarios para alojar las dos tablas Engram (~189 GiB declarados) en memoria fijada. Debe estar respaldada por *huge pages* transparentes de 512 MiB; el runtime rechaza el arranque si no lo esta.
- GPU de consumo: no cabe. No hay soporte para RTX 4090, RTX 5090 ni tarjetas de un solo dispositivo, ni versiones GGUF o cuantizadas para CPU.
- Software: build de `kern` con soporte de esquema de manifiesto 5 (posterior a kern v0.1.0; una version anterior rechaza el fichero) y el binario `kern-serve` compilado aparte.
- Despliegue: `kern-serve` con `--manifest`, `--kernels`, `--weights`, `--gpus 0,1,2,3`, `--capacity`, `--chunk`, `--max-seqs`, `--renderer` y `--rows`; alternativa mediante `kern.toml`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama en este repositorio (vLLM se cita unicamente como referencia semantica en el PR #56201).
- Latencia y *throughput*: no disponibles. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, sino un paquete de kernels y manifiesto para un runtime concreto, por lo que no admite comparacion directa por parametros o contexto con otros modelos. La comparacion relevante seria entre rutas de servicio de DeepSeek-V4.1-Flash, y los datos necesarios no estan en la informacion proporcionada:

| Alternativa de servicio | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kern + este manifiesto (4 x GB300) | no disponible | 32k en la configuracion de referencia | numerica y aceptacion especulativa sin certificar | per-artifact, con componentes MIT | preview, 0 descargas |
| vLLM (citado como referencia semantica en el PR #56201) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Checkpoint original `deepseek-ai/DeepSeek-V4.1-Flash` | no disponible | no disponible | no disponible | no disponible | pesos publicados en HuggingFace |

## Limitaciones y advertencias

- Estado preview declarado por el autor: el manifiesto sirve peticiones de extremo a extremo, pero la numerica y la aceptacion de la decodificacion especulativa no han sido certificadas contra la referencia publicada, y los kernels son el primer conjunto funcional, no versiones optimizadas.
- El parser de salida de *tool calls* del renderer `deepseek_v41` no esta adaptado; no se debe asumir soporte de *function calling* en produccion con esta configuracion.
- Dependencia estricta de hardware: requiere 4 x GB300 en un mismo tray con sm_103a. No hay ruta para GPU de consumo, CPU ni arquitecturas anteriores.
- Restriccion fuerte de memoria de host: ~189 GiB de tablas Engram en memoria fijada y al menos 200 GiB libres, con *huge pages* de 512 MiB obligatorias. El runtime se niega a arrancar sin ellas, y el rendimiento de los lookups aleatorios cae aproximadamente diez veces con paginas de 64 KiB.
- Compatibilidad de version: el manifiesto usa esquema 5, posterior a kern v0.1.0; una build anterior de kern rechaza el fichero.
- Licencia `other` / `per-artifact`: no es una licencia estandar. Hay que revisar `licenses/` y la tabla de procedencia (DeepGEMM, FlashMLA y DeepSelect bajo MIT; kernels manuscritos y constantes Engram bajo la licencia de kern) antes de cualquier uso comercial o redistribucion. La licencia del modelo servido es independiente y no se especifica aqui.
- Sesgos y riesgo de alucinacion: no disponibles en la informacion proporcionada; son atributos del modelo servido, no de este repositorio de kernels.
- Idiomas soportados: no disponibles.
- Tamano del repositorio declarado como 0.0 GB, lo que sugiere que el contenido puede no estar completamente materializado o que las metricas de la plataforma no reflejan los cubins; conviene verificar los ficheros antes de confiar en el despliegue.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este repositorio ni sobre DeepSeek-V4.1-Flash; no se ha podido contrastar ningun dato externo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Pegainfer/kern-deepseek-v41-flash-sm103
- Licencia del repositorio (`per-artifact`): https://huggingface.co/Pegainfer/kern-deepseek-v41-flash-sm103/blob/main/README.md
- Checkpoint de pesos y tokenizer (no alojados en este repositorio): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Runtime kern: https://github.com/pegainfer-project/kern
- DeepGEMM (commit `ab69f76be5bb9ea3499bc755002b1a876cb0b3d9`, PR #432): https://github.com/deepseek-ai/DeepGEMM
- FlashMLA (commit `4f38f29ef6793c228363e4af5be66d44e81167ba`, PR #221): https://github.com/deepseek-ai/FlashMLA
- DeepSelect (commit `8e70df71d2a4b0c969ef96dc3b8998efa09a3315`): https://github.com/deepseek-ai/DeepSelect
- vLLM PR #56201 (referencia semantica, commit `61140208c5940195b5970fc44de77a9695d0baf7`): https://github.com/vllm-project/vllm/pull/56201
