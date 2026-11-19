# nerun/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-MTP-GGUF

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-MTP-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de 9B parametros, resultado de un merge basado en Qwen3.5-9B y orientado a generacion de codigo y flujos agenticos. El autor de esta publicacion, nerun, no entrena el modelo: parte de los cuants imatrix i1 de mradermacher y les injerta un bloque MTP (Multi-Token Prediction) para habilitar decodificacion especulativa nativa en llama.cpp mediante `--spec-type draft-mtp`.

La innovacion principal es que el bloque MTP (`blk.32.*`) se copia tensor a tensor, sin entrenamiento adicional, desde `a4lg/Qwen3.5-9B-MTP-ONLY-GGUF`, un subconjunto MTP extraido del Qwen3.5-9B original. Como el bloque injertado comparte `token_embd` y `output` con el modelo principal, cada fichero ocupa solo unos 0,2 GiB adicionales respecto al cuant original y evita cargar un modelo borrador separado en VRAM.

El resultado es un artefacto de inferencia practico para equipos con GPU de consumo: ofrece 25 cuantizaciones desde IQ1_S (2,7 GiB) hasta Q6_K (7,1 GiB), con decodificacion especulativa integrada y licencia Apache 2.0. La tasa de aceptacion del borrador MTP reportada por el autor es de aproximadamente 0,6-0,7, aunque el cabezal se entreno sobre Qwen3.5-9B y no sobre los pesos del merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-9B, con bloque MTP injertado para decodificacion especulativa |
| Parametros totales | 9B (nominal, segun nombre del modelo); el campo safetensors del repo indica 456.010.480, dato no coherente con el nombre |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso fija `-c 0` con `-fitc 32768`) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (bloque MTP en Q4_K_M, Q5_K_M o Q6_K segun fichero) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix i1) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.5-9B, sobre el que se ha aplicado un merge denominado "Triumvirate-Qwopus-MiMo-Ornith-9B-Coder". No se dispone en la informacion proporcionada de detalles sobre los componentes del merge, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Los cuants i1 son cuantizaciones imatrix producidas por mradermacher sobre los pesos del merge, sin reentrenamiento.

La innovacion tecnica es el injerto del bloque MTP: se copian los tensores `blk.32.*` desde un fichero MTP-only extraido de Qwen3.5-9B, sin entrenamiento, siguiendo el "Metodo 2" del README de a4lg y usando el `convert.py` de @buzz. El bloque comparte `token_embd` y `output` con el modelo principal, lo que permite decodificacion especulativa en llama.cpp con un unico fichero. El autor advierte que el cabezal MTP se entreno sobre Qwen3.5-9B y no sobre Triumvirate, con una tasa de aceptacion observada de aproximadamente 0,6-0,7.

## Capacidades

- Generacion de texto conversacional y razonamiento, segun los tags del repositorio (`conversational`, `reasoning`).
- Generacion de codigo y asistencia a programacion (`code`).
- Flujos agenticos (`agentic`), presumiblemente con soporte de tool calling heredado de la familia Qwen3.5; no se detalla en la informacion disponible.
- Vision: se incluyen proyectores multimodales (mmproj), aunque proceden de `mradermacher/Qwen3.5-9B-GGUF` y no se entrenaron con los pesos del merge.
- Decodificacion especulativa integrada mediante bloque MTP embebido.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente de codigo en local: con cuants Q4_K_M (5,4 GiB) o Q5_K_M (6,2 GiB) el modelo cabe en GPUs de consumo de 8-12 GB y permite autocompletado, refactorizacion y explicacion de codigo sin salida a la nube.
- Servidor de inferencia en llama.cpp con decodificacion especulativa: el bloque MTP embebido acelera la generacion sin cargar un modelo borrador separado, lo que simplifica el despliegue y reduce el consumo de VRAM frente a esquemas draft-model clasicos.
- Prototipado agentico: los tags `agentic` y `code` sugieren uso en pipelines de agentes que encadenan llamadas a herramientas; conviene validar el soporte real de function calling antes de produccion.
- Despliegue en hardware muy limitado: los cuants IQ1_S (2,7 GiB) e IQ2_XXS (3,0 GiB) permiten ejecutar un modelo de 9B en equipos con 4-6 GB de VRAM o en CPU, a costa de perdida de calidad.
- Experimentacion con decodificacion especulativa: util para investigadores que quieran medir tasas de aceptacion de un cabezal MTP entrenado en otro modelo sobre un merge distinto.
- Descripcion de imagenes en local: los proyectores mmproj incluidos permiten entrada multimodal, aunque el autor advierte que las descripciones pueden ser menos precisas al no haberse entrenado con los pesos del merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de inferencia: tasa de aceptacion del borrador MTP de aproximadamente 0,6-0,7, y que `--spec-draft-n-max 2` rinde mejor que el valor por defecto 3, mientras que 1 o 4 y superiores resultan mas lentos. En 8 GB de VRAM, con `-ub 1024` o `-ub 2048` la generacion con MTP cae a unas 22 t/s.

## Requisitos de hardware

- VRAM estimada: desde unos 3 GB con IQ1_S/IQ2_XXS hasta unos 8 GB con Q6_K, mas overhead de contexto y buffers de computo.
- El bloque MTP anade solo unos 0,2 GiB respecto al cuant original.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuants medios y altos; A100/H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, desde GPUs de 4-6 GB con cuants IQ1/IQ2 y de 8-12 GB con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp (requiere build con soporte `--spec-type draft-mtp`); vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- En 8 GB de VRAM se recomienda mantener el micro-batch por defecto (`-ub 512`); con `-ub 1024` o superior el rendimiento con MTP cae a unas 22 t/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-MTP | 9B | no disponible | Apache 2.0 | Merge con MTP injertado para decodificacion especulativa en llama.cpp |
| mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1 | 9B | no disponible | Apache 2.0 (presumible) | Version sin bloque MTP; requiere modelo borrador separado para decodificacion especulativa |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible | Modelo base original; el bloque MTP procede de aqui |
| a4lg/Qwen3.5-9B-MTP-ONLY-GGUF | 9B (solo MTP) | no disponible | no disponible | Subconjunto MTP-only usado como donante del bloque |

## Limitaciones y advertencias

- El cabezal MTP se entreno sobre Qwen3.5-9B, no sobre Triumvirate; la tasa de aceptacion (~0,6-0,7) es inferior a la de un borrador especifico del modelo.
- Los proyectores de vision (mmproj) provienen de `mradermacher/Qwen3.5-9B-GGUF` y nunca se entrenaron con los pesos del merge, por lo que las descripciones de imagen pueden ser menos precisas.
- El dato de parametros del campo safetensors (456.010.480) no es coherente con el nombre del modelo (9B); conviene verificar el tamano real antes de planificar el despliegue.
- No se dispone de informacion sobre sesgos, idiomas soportados, contexto maximo ni evaluaciones de alucinacion.
- Requiere una build de llama.cpp con soporte de MTP draft; versiones sin esa funcionalidad no podran aprovechar el bloque injertado.
- El fichero injertado debe usarse como modelo principal; no debe pasarse de nuevo con `--model-draft`.
- Licencia Apache 2.0 permite uso comercial, pero al ser un merge de procedencia multiple conviene revisar las licencias de los modelos base y del donante MTP.

## Enlaces

- https://huggingface.co/nerun/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-MTP-GGUF
- https://huggingface.co/mradermacher/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-i1-GGUF
- https://huggingface.co/a4lg/Qwen3.5-9B-MTP-ONLY-GGUF
- https://huggingface.co/Qwen/Qwen3.5-9B
- https://huggingface.co/mradermacher/Qwen3.5-9B-GGUF
- https://gist.github.com/buzz/1c439684d5e3f36492ae9f64ef7e3f67
