# Shaeh/CYBER-FROST-3.8-GGUF

## Resumen

CYBER-FROST-3.8 es un modelo multimodal de tipo mezcla de expertos (MoE) con unos 176.943.899.520 parámetros totales (aproximadamente 180B) y unos 6B activos por token, distribuido en formato GGUF para llama.cpp. El checkpoint BF16 original lo publica Blackfrost-AI y, según la model card, deriva de la arquitectura `qwen4exp` (`Qwen4ExpForConditionalGeneration`), procedente de `Qwen/Qwen3.8-Flash-Next`. Esta ficha cubre la cuantización publicada por el usuario Shaeh, que incluye tanto los ficheros troncales (trunk) como una torre de visión independiente y una cabeza MTP de decodificación especulativa.

El interés practico del modelo esta en su relacion tamano/activacion: al activar unos 10 de 512 expertos por token, el coste computacional por token se parece al de un modelo de ~6B, mientras que el peso completo exige entre 80 y 123 GB de almacenamiento segun la cuantizacion. Esto lo convierte en un caso de uso claro para despliegues con offload de expertos a CPU o disco mediante llama.cpp, y para estudiar tecnicas de cuantizacion agresiva (2 y 3 bits) en arquitecturas MoE multimodales.

La model card es honesta sobre el estado del artefacto: las pruebas realizadas son smoke tests con 512 tokens de contexto (frente a los 262144 configurados), no hay datos de benchmarks, no hay information matrix en las cuantizaciones, la cabeza MTP solo esta integrada en el fichero `Q2_K_S` y los ficheros `mtp-` sueltos no cargan. El modelo es, por tanto, experimental y no validado en produccion. La licencia declarada es la Qwen Community License 1.0, que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (`Qwen4ExpForConditionalGeneration`), transformer MoE con componentes SSM y torre de vision Qwen3-VL |
| Parametros totales | 176.943.899.520 (~180B) |
| Parametros activos | ~6B (512 expertos, 10 por token, 1 experto compartido) |
| Longitud de contexto | 262144 configurados; probado solo con 512 tokens |
| Tipos de cuantizacion | Q4_K_M, UD-Q4_K_XL, UD-IQ4_XS, MXFP4_MOE, Q3_K_M, Q3_K_S, Q2_K, Q2_K_S (sin importance matrix) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (declarada como `other` en HuggingFace) |
| Formato de pesos | GGUF (llama.cpp); checkpoint base en BF16 safetensors |

Detalles adicionales: 48 capas troncales, mas una capa 48 adicional (Q8_0) que aloja la cabeza MTP en `Q2_K_S`. La torre de vision se distribuye aparte en `mmproj-CYBER-FROST-3.8-f16.gguf` (0.90 GB, F16). Tamano del repositorio: 800.7 GB. Descargas registradas: 0; likes: 1. Fecha de creacion: 2026-10-25.

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen4exp`, una variante MoE con 48 capas, 512 expertos, seleccion de 10 expertos por token y un experto compartido. La presencia de tensores `ssm_conv1d.weight` y `ple_conv1d.weight` en la lista de tensores del GGUF apunta a componentes de espacio de estados (SSM) y a una tabla de embeddings por capa (`per_layer_token_embd`, descrita como tabla de n-gramas), lo que sugiere una arquitectura hibrida y no un transformer denso convencional. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; todos estos datos deben considerarse no disponibles.

En el plano tecnico, el artefacto incorpora dos elementos destacables. El primero es una cabeza de prediccion multi-token (MTP) entrenada antes de la pasada final de comportamiento del tronco, que actua como borrador para decodificacion especulativa: se invoca con `--spec-type draft-mtp` y lee el residuo ancho anterior al mixer final, sin fichero borrador separado. El segundo es la torre de vision, un ViT Qwen3-VL estandar (`qwen3vl_merger`) con 27 bloques, patch 16, merge espacial 2 y sin deepstack, que proyecta a 2560 dimensiones y es compatible con todos los ficheros troncales. Las cuantizaciones no usan importance matrix: las variantes "UD" son mezclas de tipos por capa, no Unsloth Dynamic 3.0.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicada via `--jinja` en llama.cpp.
- Entrada imagen-texto (`pipeline_tag: image-text-to-text`): la torre `mmproj` procesa imagenes y las proyecta al espacio del tronco.
- Razonamiento y generacion de codigo: no documentado explicitamente en la informacion disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta cumplimentado.
- Decodificacion especulativa mediante cabeza MTP integrada, disponible unicamente en `CYBER-FROST-3.8-Q2_K_S.gguf`.
- Contexto configurado de 262144 tokens, aunque sin validacion mas alla de 512 tokens en las pruebas del autor.

## Casos de uso

- Analisis de imagenes en local con offload: el modelo acepta entradas image-text-to-text y la torre de vision ocupa solo 0.90 GB, por lo que se puede ejecutar en una maquina con GPU modesta manteniendo los expertos en CPU. Adecuado para prototipos de descripcion de imagenes o extraccion de informacion visual sin enviar datos a la nube.
- Procesamiento de documentos largos en escenarios con requisito de soberania del dato: los 262144 tokens de contexto configurados permiten, en teoria, ingerir contratos o expedientes completos; conviene validar antes el comportamiento real mas alla de 512 tokens, que es el unico regimen probado.
- Investigacion sobre cuantizacion extrema en MoE: el repositorio ofrece ocho variantes (de Q2_K a UD-Q4_K_XL y MXFP4_MOE) con composiciones de tipos documentadas tensor a tensor, lo que lo convierte en un banco de pruebas para medir la perdida de calidad a 2 y 3 bits en modelos de ~180B con ~6B activos.
- Experimentacion con decodificacion especulativa MTP: `Q2_K_S` integra la cabeza borradora en el propio fichero, lo que permite medir la ganancia de throughput de `--spec-type draft-mtp` sin gestionar sidecars (que, por otra parte, no cargan).
- Despliegue on-premise con presupuesto de VRAM limitado: usando `-ot "per_layer_token_embd=CPU,exps=CPU"` y `-cmoe`, los expertos residen en RAM o disco y solo se descargan a la GPU las capas de atencion y SSM; valido para entornos donde el coste de GPU es la restriccion principal y la latencia es secundaria.
- Evaluacion comparativa de arquitecturas hibridas atención+SSM: la presencia de tensores `ssm_conv1d` y de embeddings por capa permite estudiar el comportamiento de llama.cpp con este tipo de grafos y detectar problemas de compatibilidad (por ejemplo, el fallo de KV cache cuantizada).
- Generacion asistida en lotes nocturnos: con velocidades de 1.0-1.1 tok/s en iGPU, el modelo es inviable para interaccion en tiempo real, pero puede encajar en pipelines batch de baja prioridad donde el coste por token importa mas que la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de humo (smoke tests) de generacion en Vulkan con 512 tokens de contexto, sin metricas de calidad (MMLU, HumanEval, GSM8K u otras).

Datos de ejecucion declarados por el autor (llama.cpp `b1-4da6337`, Radeon 680M, Vulkan, uploads asincronos desactivados):

| Metrica | Valor medido |
|---|---|
| Contexto de prueba | 512 tokens |
| Velocidad de prompt | ~0.5-0.7 tok/s |
| Velocidad de generacion | ~1.0-1.1 tok/s |
| Memoria GTT en iGPU | ~45 MB (expertos y tabla n-grama en CPU, mmap desde disco) |
| Tipo de KV cache | f16 (la KV cuantizada provoca crash en esta arquitectura) |

## Requisitos de hardware

- VRAM para offload completo (estimacion a partir del tamano del fichero mas la KV cache f16, cuyo tamano exacto no esta disponible): Q2_K y Q2_K_S ~80 GB; Q3_K_M/Q3_K_S ~89 GB; MXFP4_MOE ~97 GB; Q4_K_M ~111 GB; UD-IQ4_XS ~122 GB; UD-Q4_K_XL ~123 GB.
- GPU recomendadas para offload completo: 2x H100 80 GB o 2x A100 80 GB para Q4_K_M y superiores; 1x H100 80 GB queda muy justa para Q2_K. No hay datos de throughput en estas GPU en la informacion disponible.
- GPU de consumo: no es posible el offload completo en ninguna GPU de consumo actual (24 GB en RTX 4090 como maximo). Solo cabe un despliegue parcial, con atencion/SSM en GPU y expertos en RAM o disco, tal como probo el autor.
- RAM/almacenamiento: el despliegue con `-ot exps=CPU` requiere del orden de 80-123 GB de RAM o de espacio en disco con mmap (`-lm mmap`), mas los 0.90 GB de la torre de vision.
- Opciones de despliegue: exclusivamente llama.cpp con soporte del grafo `qwen4exp` (incluida la ruta MTP). No se documenta compatibilidad con vLLM, TGI, Ollama ni otros motores.
- Flags recomendados por el autor: `-ot "per_layer_token_embd=CPU,exps=CPU"`, `-cmoe`, `-ngl 99`, `-lm mmap`, `-fit off`, `-ctk f16 -ctv f16`, `--jinja`; para vision, `--no-mmproj-offload` en Vulkan.
- Latencia observada: ~0.5-0.7 tok/s de prompt y ~1.0-1.1 tok/s de generacion en Radeon 680M (iGPU). Sin datos en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CYBER-FROST-3.8-GGUF (este repo) | ~176.9B | ~6B | 262144 configurados | GGUF (8 cuantizaciones) | qwen-community-license-1.0 | Publico en HuggingFace, 0 descargas |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 (modelo base) | ~176.9B | ~6B | 262144 configurados | safetensors BF16 | qwen-community-license-1.0 | Publico en HuggingFace |
| Qwen/Qwen3.8-Flash-Next (origen de la arquitectura) | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Otras alternativas MoE de ~180B | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

No se dispone de datos de rendimiento (benchmarks) de ninguna de las variantes, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad. Dentro del propio repositorio, las diferencias relevantes son el tamano (80.08 GB en Q2_K frente a 123.10 GB en UD-Q4_K_XL), la presencia de la cabeza MTP solo en Q2_K_S y el uso de MXFP4 en tensores de expertos en la variante `MXFP4_MOE`.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad (razonamiento, codigo, matematicas, vision) mas alla de pruebas de humo.
- Contexto largo sin validar: los 262144 tokens son la configuracion declarada, pero las pruebas se hicieron con 512 tokens. No hay datos de degradacion ni de consumo de memoria en contextos largos.
- Cuantizaciones sin importance matrix: las variantes UD e IQ4_XS no equivalen a las calibradas de referencia, por lo que la perdida de calidad respecto al BF16 puede ser mayor de lo habitual, especialmente en 2 y 3 bits.
- Cabeza MTP incompleta: solo `Q2_K_S` la lleva integrada; los ficheros `mtp-Q8_0` y `mtp-Q4_K_M` no cargan junto a un tronco (falta `output_hc_norm.weight`; los pesos estan como `blk.48.nextn.hc_head_norm.weight`). No deben pasarse con `-md`.
- KV cache cuantizada no soportada: provoca crash en esta arquitectura; hay que usar f16, lo que incrementa el consumo de memoria en contextos largos.
- Vision limitada en Vulkan: el encoder visual falla con `GGML_ASSERT(ctx->descriptor_set_idx < ctx->descriptor_sets.size())`; hay que usar `--no-mmproj-offload`.
- Dependencia de una build concreta de llama.cpp (`b1-4da6337`) con el grafo `qwen4exp` y la ruta MTP; no hay soporte documentado en otros motores de inferencia.
- Idiomas no declarados: se desconoce la cobertura linguistica real, incluido el castellano.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en esta publicacion; sin evaluaciones no hay forma de acotarlo.
- Sesgos: no documentados por el autor.
- Licencia: Qwen Community License 1.0, marcada como `other` en HuggingFace. Es imprescindible leer el texto de `LICENSE` antes de cualquier uso comercial; las condiciones concretas (por ejemplo, umbrales de usuarios o restricciones de redistribucion) no se detallan en la informacion disponible.
- Madurez del artefacto: repositorio con 0 descargas y creado el 2026-10-25, sin historial de uso; los ficheros subidos antes del 2026-10-08 con `ssm_conv1d.weight` y `ple_conv1d.weight` en F16 provocaban un crash de llama.cpp con `GGML_ASSERT(src1->nb[0] == sizeof(float))` al ejecutar capas en CPU.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Shaeh/CYBER-FROST-3.8-GGUF
- Checkpoint base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo de origen de la arquitectura: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Los resultados de busqueda web proporcionados no contienen enlaces relacionados con el modelo (corresponden a directorios de streaming no oficiales) y se han descartado.
