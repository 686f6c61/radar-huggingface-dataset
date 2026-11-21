# kusuriya-labs/Qwen3.8-Flash-Next-PLE-Ngram4

## Resumen

Qwen3.8-Flash-Next PLE Ngram4 es un artefacto de tabla de embeddings cuantizada, publicado por kusuriya-labs, que sustituye la tabla PLE (probabilistic lookup embedding) original en BF16 del modelo base Qwen/Qwen3.8-Flash-Next (revision `de4b8e4`). La tabla original consta de 1 capa con 16 heads, 320.001.446 filas y 160 dimensiones; este repositorio contiene esa misma tabla comprimida mediante cuantizacion de 4 bits Lloyd-Max con escalas FP16 por fila. No es un modelo autonomo: no puede ejecutar inferencia por si solo y debe combinarse con los pesos principales del modelo, por ejemplo las variantes EXL3-INT8 de 3,05 bpw o 4 bpw del mismo autor.

El interes practico es el ahorro de memoria y ancho de banda en el despliegue del modelo base: la tabla PLE es un componente de gran tamano que, en BF16, consume varios gigabytes y penaliza la carga y el acceso durante la decodificacion. Al cuantizarla a 4 bits con escalas por fila, el artefacto ocupa aproximadamente una cuarta parte del espacio original, manteniendo una fidelidad razonable (error L2 relativo medio de 0,0923 sobre la muestra verificada). El repositorio ocupa 26,2 GB, coherente con un modelo base grande acompanado de la tabla comprimida.

La relevancia es acotada pero real para quien despliega Qwen3.8-Flash-Next en hardware con VRAM limitada o en configuraciones con expertos alojados en host: permite reducir la huella de la tabla de embeddings sin tocar el resto de los pesos. La contrapartida es que exige el runtime `shelf` (commit `1dfff507` o posterior) y que la validacion publicada es limitada: solo una comprobacion de formato fail-closed y una generacion corta en una R9700, sin benchmarks de calidad a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de embeddings PLE (1 capa, 16 heads) cuantizada; artefacto complementario al transformer del modelo base Qwen3.8-Flash-Next |
| Parametros totales | 320.001.446 filas × 160 dimensiones (tabla PLE); parametros del modelo base no disponibles |
| Parametros activos | no disponible (el modelo base podria ser MoE; no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits Lloyd-Max con escala FP16 por fila (`codec: lloyd-row-f16`); perfil `ngram4`; formato `ngram-q` version 1 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-license-1.0`) |
| Formato de pesos | `table_*.safetensors` + `ngram_manifest.json`; formato ngram-q v1 |
| Tamano del repositorio | 26,2 GB |
| Modelo base | Qwen/Qwen3.8-Flash-Next (revision `de4b8e4`) |
| Runtime requerido | shelf, commit `1dfff507` o posterior |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una tabla de embeddings cuantizada post-hoc. La tabla PLE del modelo base Qwen3.8-Flash-Next esta compuesta por 1 capa con 16 heads, 320.001.446 filas y 160 dimensiones, almacenada originalmente en BF16. El proceso de cuantizacion aplica Lloyd-Max de 4 bits por fila, con una escala FP16 independiente por fila, y empaqueta el resultado en el formato `ngram-q` (version 1, perfil `ngram4`, codec `lloyd-row-f16`). El artefacto sustituye el fichero `ngram_embedding.safetensors` del directorio del modelo base mediante la presencia de `ngram_manifest.json` y de todos los `table_*.safetensors`.

No se documenta ningun proceso de entrenamiento adicional, RLHF, DPO ni composicion de dataset para este artefacto. La unica validacion tecnica publicada consiste en una comprobacion automatica de formato en C++ con politica fail-closed (resultado PASS) y una medicion del error de reconstruccion sobre una muestra: error L2 relativo medio de 0,0923 y maximo de 0,0926. La verificacion end-to-end se realizo en una R9700 con TP=1 y `--moe-host-experts 384`, generando una continuacion coherente para el prompt "The capital of France is" ("Paris. The capital of Germany is Berlin. The capital of Italy is Rome.") a 8,07 tok/s de decodificacion.

## Capacidades

- Generacion de texto autoregresiva: hereda las capacidades del modelo base Qwen3.8-Flash-Next, aunque este repositorio solo aporta la tabla de embeddings.
- Reduccion de huella de memoria: sustituye la tabla PLE BF16 por una version de 4 bits, liberando VRAM en el despliegue.
- Compatibilidad con configuraciones de expertos en host: funciona con la opcion `--moe-host-experts` del runtime shelf.
- Verificacion de formato fail-closed: el runtime rechaza artefactos malformados antes de la inferencia.
- No aporta por si mismo tool calling, vision, audio ni modo thinking; estas capacidades dependen del modelo base y no estan documentadas en la informacion disponible.
- No se documentan capacidades multilingues especificas de este artefacto.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en GPU con VRAM ajustada: sustituir la tabla PLE BF16 por la version Ngram4 reduce el espacio ocupado por la tabla aproximadamente a una cuarta parte, permitiendo cargar el modelo junto con los pesos EXL3-INT8 en tarjetas donde la version BF16 no cabria.
- Inferencia con expertos alojados en host: combinado con `--moe-host-experts 384` en el runtime shelf, el artefacto permite repartir la carga entre GPU y memoria del sistema, util en estaciones de trabajo con una sola GPU.
- Servicio de generacion de texto de baja concurrencia: la validacion E2E muestra generacion coherente a 8,07 tok/s en una R9700, adecuada para entornos de desarrollo, pruebas o demos internas antes de escalar a produccion.
- Pipeline de evaluacion de tecnicas de cuantizacion: sirve como caso de estudio para medir el impacto de la cuantizacion 4 bits Lloyd-Max con escalas por fila sobre embeddings de gran tamano (error L2 ~0,09).
- Pruebas de integracion del runtime shelf: al requerir un commit minimo (`1dfff507`), el artefacto es util para validar builds de shelf y el flujo `ngram_quantize.py verify` + `shelf-compute` en CI.
- Archivado y distribucion del modelo base: al ocupar 26,2 GB, el repositorio facilita transportar el componente PLE comprimido junto con los pesos principales en entornos con ancho de banda limitado.
- Reproduccion de experimentos de compresion de embeddings: investigadores pueden comparar la fidelidad de Lloyd-Max 4 bits frente a otras estrategias sobre la misma tabla de 320 millones de filas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son los siguientes:

| Metrica | Valor | Condiciones |
|---|---|---|
| Error L2 relativo medio (reconstruccion tabla) | 0,0923 | Muestra verificada |
| Error L2 relativo maximo (reconstruccion tabla) | 0,0926 | Muestra verificada |
| Inspeccion de formato C++ fail-closed | PASS | Automatica |
| Throughput de decodificacion | 8,07 tok/s | R9700, TP=1, `--moe-host-experts 384` |
| Calidad a gran escala | no evaluada | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo completo; el artefacto de tabla cuantizada ocupa una fraccion del repositorio de 26,2 GB, pero el total depende de los pesos EXL3-INT8 con los que se combine.
- GPU recomendadas: la unica configuracion validada es AMD R9700 con TP=1. No se documentan resultados en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; la unica prueba publicada usa una R9700, y no se especifica si el modelo base cabe en GPUs consumer.
- Opciones de despliegue: exclusivamente el runtime shelf (build propio, commit `1dfff507` o posterior), con `build/shelf-compute` y `tools/quantize/ngram_quantize.py verify`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 8,07 tok/s de decodificacion en la configuracion R9700/TP=1 con 384 expertos en host; la model card advierte que la velocidad depende de las condiciones de medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Runtime | Validacion publicada |
|---|---|---|---|---|---|---|
| kusuriya-labs/Qwen3.8-Flash-Next-PLE-Ngram4 | Tabla PLE cuantizada 4 bits | 320.001.446 filas × 160 dim | no disponible | Qwen Community License 1.0 | shelf | Formato PASS + 1 generacion E2E a 8,07 tok/s |
| kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-3.05bpw | Pesos principales del modelo base, 3,05 bpw | no disponible | no disponible | Qwen Community License 1.0 | shelf | no disponible |
| kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-4bpw | Pesos principales del modelo base, 4 bpw | no disponible | no disponible | Qwen Community License 1.0 | shelf | no disponible |
| Qwen/Qwen3.8-Flash-Next (BF16, revision `de4b8e4`) | Modelo base sin cuantizar | no disponible | no disponible | Qwen Community License 1.0 | no disponible | no disponible |

No se conocen alternativas de terceros directamente comparables: este artefacto es especifico del ecosistema shelf/kusuriya-labs y no sustituye un modelo completo, por lo que la comparacion natural es con las variantes EXL3 del mismo autor y con el modelo base BF16.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede ejecutar inferencia por si solo; requiere combinarse con los pesos principales (EXL3-INT8-3.05bpw o 4bpw) y con el runtime shelf.
- Validacion de calidad insuficiente: no se han ejecutado benchmarks de calidad a gran escala; la unica prueba generativa es una continuacion corta de tres frases sobre capitales europeas.
- Perdida de fidelidad por cuantizacion: el error L2 relativo de reconstruccion de la tabla es ~0,09 (media 0,0923, maximo 0,0926); el impacto downstream sobre tareas reales no esta medido.
- Dependencia de version del runtime: solo funciona con shelf main en commit `1dfff507` o posterior; builds anteriores o otros runtimes no son compatibles con el formato `ngram-q` v1.
- Rendimiento modesto en la configuracion validada: 8,07 tok/s de decodificacion en R9700 con TP=1, insuficiente para muchas aplicaciones interactivas de produccion.
- Sin datos sobre sesgos, alucinacion o comportamiento multilingue especificos de este artefacto; estas caracteristicas dependen del modelo base y no estan documentadas aqui.
- Restricciones de licencia: Qwen Community License 1.0 impone obligaciones de atribucion de copyright, requisitos de mencion para uso comercial a partir de cierto tamano y clausulas especificas sobre MaaS y AI Work Assistant; debe revisarse el fichero LICENSE adjunto antes de cualquier despliegue comercial.
- Cero adopcion observada (0 descargas, 0 likes) y publicacion muy reciente (21 de noviembre de 2026); no hay evidencia de uso en produccion ni de validacion independiente.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo que limita las opciones de integracion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-Flash-Next-PLE-Ngram4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante EXL3-INT8-3.05bpw: https://huggingface.co/kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-3.05bpw
- Variante EXL3-INT8-4bpw: https://huggingface.co/kusuriya-labs/Qwen3.8-Flash-Next-EXL3-INT8-4bpw
- Runtime shelf: https://github.com/kusuriya-labs/shelf
- Especificacion del formato de cuantizacion ngram: https://github.com/kusuriya-labs/shelf/blob/main/docs/developer/ngram_quantization.md
