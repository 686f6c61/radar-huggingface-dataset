# ARRANCORE/DFlash2-Ternary-Bonsai-2.5-27B-llama.cpp

## Resumen

DFlash2-Ternary-Bonsai-2.5-27B-llama.cpp es un modelo borrador (draft model) para decodificacion especulativa, publicado por el usuario ARRANCORE, que adapta el backbone Qwen3.8-27B-DFlash2 de Inco AI para acelerar la inferencia del modelo objetivo Ternary Bonsai 2.5 27B de Prism ML sobre llama.cpp estándar. El problema que resuelve es concreto: el modelo objetivo es un transformer con pesos en representacion latente Hadamard (`prism.hadamard`), lo que hace que un draft convencional que toma prestadas las tablas de embedding y de salida del objetivo genere tokens que son rechazados sistemáticamente (tasa de aceptacion de 0 sobre 5.932 tokens en 12 configuraciones), degradando el decode de 56 a 23-25 t/s.

La solucion aportada consiste en tres ficheros GGUF que copian byte a byte el cuerpo del draft original Q4_K_M de DFlash2 y añaden dos tensores propios en la base primal: `token_embd.weight` y `output.weight`, ambos de dimension 5120 x 248.320. Al ser tensores opcionales en la arquitectura DFlash, llama.cpp los usa en lugar de tomarlos prestados del objetivo, restaurando la aceptacion de la decodificacion especulativa sin modificar el runtime ni los outputs del modelo objetivo.

El modelo se distribuye bajo licencia Apache-2.0, con un tamaño de repositorio de 9,5 GB, y esta pensado para despliegues en llama.cpp con soporte de activaciones Hadamard (release b11556 o superior) y soporte de draft DFlash2. Las variantes se diferencian unicamente en la cuantizacion de las dos tablas añadidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (draft model para decodificacion especulativa), backbone Qwen3.8-27B-DFlash2 |
| Parametros totales | 4.467.201.280 (dato de safetensors del repo); el backbone draft declarado por el autor es de 1,9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor fijo; ventana efectiva medida en GPU de 16 GB: 185.600 (TQ4_K_Q6_K), 172.288 (TQ8_0), 199.936 (TQ4_K) con KV cache q4_0 |
| Tipos de cuantizacion | cuerpo del draft en Q4_K_M; tablas propias en Q4_K/Q6_K, Q8_0/Q8_0 o Q4_K/Q4_K segun variante |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Variantes publicadas:

| Fichero | Embedding | Head | Tamano | Ventana en GPU de 16 GB |
|---|---|---|---|---|
| `...-Q4_K_M-TQ4_K_Q6_K.gguf` (recomendada) | Q4_K (682 MiB) | Q6_K (995 MiB) | 2,75 GiB | 185.600 |
| `...-Q4_K_M-TQ8_0.gguf` | Q8_0 (1288 MiB) | Q8_0 (1278 MiB) | 3,63 GiB | 172.288 |
| `...-Q4_K_M-TQ4_K.gguf` | Q4_K (682 MiB) | Q4_K (682 MiB) | 2,44 GiB | 199.936 |

## Arquitectura y entrenamiento

El modelo es un draft de decodificacion especulativa basado en la arquitectura DFlash2, cuyo backbone es Qwen3.8-27B-DFlash2 de Inco AI (1,9B parametros segun la model card). Un draft DFlash no dispone de tabla de embedding ni de cabeza de salida propias: las toma prestadas del modelo objetivo y las usa tal cual. En un objetivo con representacion latente Hadamard, eso implica filas de embedding rotadas y una cabeza plegada, lo que invalida cada token propuesto. La adaptacion de ARRANCORE añade dos tensores en la base primal (`token_embd.weight` y `output.weight`, 5120 x 248.320) que llama.cpp consume en lugar de los prestados; el resto del cuerpo Q4_K_M se conserva sin cambios.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre procesos de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable es la restauracion de la base primal en el grafo del draft para hacer compatible la decodificacion especulativa con un objetivo Hadamard-latente sobre llama.cpp sin parchear. La model card documenta que corregir solo el embedding mantiene la aceptacion en cero (0 de 8.358 tokens), por lo que ambos tensores son necesarios de forma independiente.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre el objetivo Ternary Bonsai 2.5 27B.
- Aceleracion del decode preservando exactamente los outputs del modelo objetivo (el draft no altera la distribucion final).
- Funcionamiento sobre llama.cpp estándar (stock) con soporte de activaciones Hadamard y de draft DFlash2, sin parches.
- Tres perfiles de cuantizacion de las tablas propias para equilibrar tamano y ventana de contexto en GPU de 16 GB.
- Compatibilidad con el servidor `llama-server` y sus opciones de especificacion (`--spec-type draft-dflash`, `--spec-draft-n-max`, `--spec-draft-p-min`).
- No es un modelo de proposito general: no se usa de forma autonoma para generar respuestas, sino acoplado a un objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion sobre Ternary Bonsai 2.5 27B: se lanza `llama-server` con el objetivo Q2_0 y este draft como `--model-draft`, recuperando velocidades de decode proximas a las del objetivo sin draft (56 t/s en el entorno de prueba) en lugar de las 23-25 t/s que se obtienen con un draft mal adaptado.
- Despliegue en GPU de consumo: con la variante TQ4_K_Q6_K (2,75 GiB) y el objetivo en Q2_0, el conjunto cabe en una RTX 4070 Ti SUPER de 16 GB con ventana de 185.600 tokens, lo que permite servir contexto largo en hardware de gama alta consumer.
- Evaluacion de decodificacion especulativa en pipelines de investigacion: sirve para medir tasas de aceptacion y throughput de DFlash2 sobre objetivos cuantizados en ternario sin necesidad de recompilar llama.cpp.
- Servicio de chat multi-turno con contexto extenso: la ventana efectiva de 172.288-199.936 tokens (segun variante) permite mantener conversaciones largas con KV cache q4_0 en una sola GPU de 16 GB.
- Integracion en entornos con llama.cpp fijado: al requerir solo la release b11556 o superior (probado en b12345), se puede incorporar a infraestructuras existentes sin migraciones de runtime.
- Reproduccion de resultados: los SHA-256 publicados y las instrucciones de descarga permiten replicar el montaje exacto en CI o en entornos de evaluacion controlados.

## Benchmarks y rendimiento

La model card proporciona mediciones de velocidad y aceptacion, no benchmarks de calidad (MMLU, HumanEval, GSM8K):

| Metrica | Draft sin adaptar | Draft adaptado (este repo) |
|---|---|---|
| Tasa de aceptacion (12 configuraciones) | 0 de 5.932 tokens | no se reporta cifra agregada |
| Tasa de aceptacion (solo embedding corregido) | 0 de 8.358 tokens | no aplica |
| Velocidad de decode | 23-25 t/s | no se reporta cifra agregada; el objetivo sin draft alcanza 56 t/s |

Entorno de medida: llama.cpp b12345, CUDA 13.5, RTX 4070 Ti SUPER 16 GB. No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM del draft: 2,44 GiB (TQ4_K), 2,75 GiB (TQ4_K_Q6_K) o 3,63 GiB (TQ8_0), adicionales a la VRAM del objetivo Ternary Bonsai 2.5 27B en Q2_0.
- GPU probada: RTX 4070 Ti SUPER 16 GB, con todas las capas del objetivo y del draft en GPU y KV cache q4_0.
- Cabe en GPU consumer de 16 GB con la variante recomendada; el objetivo sin draft admite ventana de 262.144 en el mismo hardware.
- Despliegue: `llama-server` de llama.cpp stock, release b11556 o superior (Hadamard), con soporte de draft DFlash2; probado en b12345.
- Parametros de lanzamiento relevantes: `--spec-type draft-dflash --spec-draft-n-max 4 --spec-draft-p-min 0 --spec-draft-n-cpu-moe 0 -fa on -b 1024 -np 1 -jinja --metrics -c 8192 -ctk q8_0 -ctv q8_0`.
- Se debe usar el fichero base del objetivo, no la variante `-mtp` (la cabeza MTP y un draft externo no deben combinarse).
- Latencia y throughput: no se reportan cifras agregadas para el draft adaptado; el objetivo sin draft alcanza 56 t/s en el hardware de prueba.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DFlash2-Ternary-Bonsai-2.5-27B-llama.cpp (este) | Draft DFlash2 adaptado a objetivo Hadamard | 4,47B (repo); backbone 1,9B | ventana efectiva 172.288-199.936 en 16 GB | Apache-2.0 | GGUF |
| Qwen3.8-27B-DFlash2 (incoai) | Draft DFlash2 original | 1,9B (backbone) | no disponible | no disponible | no disponible |
| Ternary Bonsai 2.5 27B (prism-ml) | Modelo objetivo ternario | 27B (nominal) | 262.144 sin draft en 16 GB | no disponible | GGUF (Q2_0) |

No se dispone de datos de rendimiento comparativo entre drafts alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo tiene sentido acoplado a Ternary Bonsai 2.5 27B Q2_0; no genera respuestas por si mismo.
- Requiere llama.cpp con runtime de activaciones Hadamard (b11556 o superior) y soporte de draft DFlash2; versiones anteriores no son validas.
- No debe combinarse con la variante `-mtp` del objetivo.
- La ventana de contexto efectiva depende de la VRAM y de la variante de cuantizacion; en 16 GB se reduce respecto a los 262.144 del objetivo sin draft.
- La model card no reporta tasas de aceptacion agregadas ni throughput del draft adaptado, solo la correccion del fallo (0 de 5.932 tokens).
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni idiomas soportados; al preservar los outputs del objetivo, hereda sus caracteristicas en esos aspectos.
- Licencia Apache-2.0 declarada; conviene verificar las condiciones de los modelos base (incoai/Qwen3.8-27B-DFlash2 y prism-ml/Ternary-Bonsai-2.5-27B) antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/ARRANCORE/DFlash2-Ternary-Bonsai-2.5-27B-llama.cpp
- Codigo de build y mediciones: https://github.com/vmfu/DFlash2-Ternary-Bonsai-2.5-27B-llama.cpp
- Modelo base del draft: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp con runtime Hadamard: https://github.com/ggml-org/llama.cpp/releases/tag/b11556
- Documentacion de formato GGUF: https://huggingface.co/docs/hub/gguf
