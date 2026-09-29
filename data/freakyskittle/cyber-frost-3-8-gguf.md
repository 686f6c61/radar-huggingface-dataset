# freakyskittle/CYBER-FROST-3.8-GGUF

## Resumen

CYBER-FROST-3.8-GGUF es un conjunto de cuantizaciones en formato GGUF del checkpoint Blackfrost-AI/CYBER-FROST-3.8-BF16, publicadas por el usuario freakyskittle. El modelo subyacente usa la arquitectura `qwen4exp` (`Qwen4ExpForConditionalGeneration`), derivada de `Qwen/Qwen3.8-Flash-Next`, y es un transformer de tipo mezcla de expertos (MoE) con componentes SSM en la pila de texto. Cuenta con aproximadamente 177.000 millones de parámetros totales (176.943.899.520 exactos) y unos 6.000 millones activos por token, distribuidos en 48 capas, 512 expertos, 10 expertos por token y un experto compartido. La ventana de contexto configurada es de 262.144 tokens.

El repositorio ocupa 879,9 GB y contiene únicamente la pila de texto: la torre de visión del modelo original no se convirtió. El autor advierte de que solo se han realizado pruebas de humo con 512 tokens de contexto y que el contexto largo no está probado. Se incluye además un bloque MTP (multi-token prediction) nativo que se ha injertado como capa 48 en Q8_0 dentro del fichero `CYBER-FROST-3.8-Q2_K_S.gguf`, lo que permite decodificación especulativa con `--spec-type draft-mtp`. Los ficheros `mtp-` independientes no cargan.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas conversiones GGUF disponibles de esta arquitectura MoE híbrida de gran tamaño; por otro, sirve como registro de los problemas prácticos de conversión y carga asociados a `qwen4exp` en llama.cpp (shader SSM conv, caché KV cuantizada, cabecera MTP). Con 80 descargas y 11 likes en el momento de la consulta, es un artefacto de nicho, orientado a usuarios de llama.cpp con hardware capaz de manejar ficheros de entre 80 y 123 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (`Qwen4ExpForConditionalGeneration`), MoE con tensores SSM; derivada de `Qwen/Qwen3.8-Flash-Next` |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262.144 configurados; el autor solo ha probado 512 tokens; contexto largo no probado |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_M, Q3_K_S, Q4_K_M, UD-Q4_K_XL, UD-IQ4_XS, MXFP4_MOE |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-license-1.0`, etiquetada en HuggingFace como `other` |
| Formato de pesos | GGUF (librería llama.cpp); checkpoint de origen en BF16 |

Detalle de los ficheros publicados:

| Fichero | Rol | Tamano | Estado segun el autor |
|---|---|---|---|
| `CYBER-FROST-3.8-Q4_K_M.gguf` | 4 bits plano | 111,43 GB | Subido; prueba de humo en Vulkan superada |
| `CYBER-FROST-3.8-UD-Q4_K_XL.gguf` | 4 bits dinámico | 123,10 GB | Subido; prueba de humo en Vulkan superada |
| `CYBER-FROST-3.8-UD-IQ4_XS.gguf` | IQ4_XS dinámico | 121,84 GB | Subido; prueba de humo en Vulkan superada |
| `CYBER-FROST-3.8-MXFP4_MOE.gguf` | Expertos en MXFP4, resto en Q8_0 | 96,65 GB | Subido; prueba de humo en Vulkan superada |
| `CYBER-FROST-3.8-Q3_K_M.gguf` | 3 bits | 88,56 GB | Subido; prueba de humo en Vulkan superada |
| `CYBER-FROST-3.8-Q3_K_S.gguf` | 3 bits small | 88,56 GB | Subido; prueba de humo en Vulkan superada |
| `CYBER-FROST-3.8-Q2_K.gguf` | 2 bits | 80,08 GB | Subido; prueba de humo en Vulkan superada |
| `CYBER-FROST-3.8-Q2_K_S.gguf` | 2 bits small, con cabecera MTP Q8 en el fichero | 80,08 GB | Subido; prueba de humo MTP en Vulkan superada |
| `mtp-CYBER-FROST-3.8-Q8_0.gguf` | Cabecera de borrador, Q8_0 | 4,13 GB | Subido; falla al cargar |
| `mtp-CYBER-FROST-3.8-Q4_K_M.gguf` | Cabecera de borrador, Q4_K_M | 2,62 GB | Subido; no cargado |
| `mtp-CYBER-FROST-3.8-Q4_0.gguf` | Cabecera de borrador, Q4_0 | no disponible | No construido |

## Arquitectura y entrenamiento

La arquitectura `qwen4exp` combina atención con tensores de tipo SSM (existen pesos `ssm_conv1d.weight` y una ruta de mezcla final) dentro de una pila de 48 capas. La capa MoE usa 512 expertos con enrutado de 10 expertos por token más un experto compartido, lo que da el ratio de ~177B totales frente a ~6B activos. La pila de texto es la única convertida: la torre de visión del modelo `Qwen/Qwen3.8-Flash-Next` original no forma parte de estos GGUF. Adicionalmente, el checkpoint incluye un bloque MTP nativo entrenado antes de la pasada final de comportamiento del tronco; en `CYBER-FROST-3.8-Q2_K_S.gguf` se ha injertado como capa 48 en Q8_0, mientras que el resto de troncos aún no lo llevan.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documenta el proceso de destilación o ajuste que llevó de `Qwen/Qwen3.8-Flash-Next` a `Blackfrost-AI/CYBER-FROST-3.8-BF16`.

En cuanto a la conversión a GGUF, el autor indica que no se usó matriz de importancia (imatrix) y que los ficheros dinámicos son una mezcla de tipos por capa, no Unsloth Dynamic 3.0. Detalles concretos: en `Q4_K_M` la mayoría de pesos 2D usan un único tipo, con `output.weight` y `token_embd.weight` en Q6_K y la atención `v` en Q5_K; en `UD-Q4_K_XL` las capas primera y última más los tensores de atención y SSM se mantienen en Q5_K o Q6_K, con salida y embeddings en Q8_0 (aunque el campo file-type del GGUF sigue declarando Q4_K_M); en `UD-IQ4_XS` se aplica ese mismo reparto usando IQ4_XS donde el ancho de fila lo permite e IQ4_NL donde no; y en `MXFP4_MOE` solo los tensores de expertos y la tabla de n-gramas usan MXFP4, quedando atención, SSM, salida y embeddings en Q8_0. En los ficheros de 3 y 2 bits, dos tensores no admiten bloques de 256 y se almacenan en Q4_0 (proyecciones down de expertos, con longitud de fila 640, y la tabla de n-gramas `per_layer_token_embd`, con longitud de fila 160); en los ficheros de 4 bits esos mismos tensores van en Q5_0 (Q4_K_M plano) o Q5_1 (dinámicos). `ssm_conv1d.weight` se guarda en F16 y las normas y el router permanecen en float32.

## Capacidades

- Generación de texto conversacional en formato de chat, con plantilla Jinja (`--jinja` en llama.cpp) y etiqueta `conversational` en HuggingFace.
- Generación de código: la prueba de humo del autor consistió en escribir una función Python 3 llamada `add` que suma dos enteros y devuelve el resultado, y fue superada por los ficheros `Q4_K_M`, `UD-Q4_K_XL` y `UD-IQ4_XS`.
- Decodificación especulativa mediante la cabecera MTP nativa, disponible únicamente en `CYBER-FROST-3.8-Q2_K_S.gguf` con `--spec-type draft-mtp` y un máximo de 2 tokens de borrador.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`) y con el ecosistema llama.cpp.
- Arquitectura multimodal en origen (el identificador `Qwen4ExpForConditionalGeneration` implica generación condicional), pero la torre de visión no se convirtió, por lo que estos GGUF son solo de texto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües ni sobre idiomas soportados.
- No se menciona modo de razonamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en llama.cpp: los ficheros de 2 y 3 bits (80,08-88,56 GB) permiten cargar el modelo manteniendo los expertos en CPU y descargando por mmap desde disco, como hizo el autor en una Radeon 680M con Vulkan y ~45 MB de GTT ocupada. Es el escenario para el que están pensados estos artefactos.
- Análisis de documentos largos con contexto extendido: la ventana configurada es de 262.144 tokens, lo que en teoría permitiría procesar libros o bases de código completas. Advertencia importante: el autor solo ha validado 512 tokens, así que cualquier uso con contexto largo requiere validación previa propia.
- Generación de código asistida en pipelines internos: el modelo produce funciones correctas en las pruebas de humo, por lo que puede integrarse en tareas de autocompletado o generación de utilidades, siempre que la latencia (~1 tok/s en el hardware del autor) sea aceptable o se disponga de GPUs de datacenter.
- Evaluación comparativa de esquemas de cuantización: el repositorio publica ocho variantes (plana, dinámica por capas, IQ4_XS, MXFP4) del mismo tronco, lo que permite medir el impacto de cada esquema en calidad y tamaño sobre una arquitectura MoE+SSM, un caso poco documentado.
- Investigación sobre decodificación especulativa con MTP: el fichero `Q2_K_S` incluye la cabecera de borrador en el propio archivo y permite experimentar con `--spec-type draft-mtp` frente a la generación normal, útil para estudiar ganancias de throughput en arquitecturas con bloque MTP nativo.
- Estudio de la arquitectura `qwen4exp` en llama.cpp: sirve para reproducir y depurar problemas concretos de la implementación, como el shader de convolución SSM (que exige castear el kernel F16 a F32 antes de la convolución) o la incompatibilidad de la caché KV cuantizada con esta arquitectura.
- Despliegue en servidores con mucha RAM y disco rápido: dado que los expertos y la tabla de n-gramas pueden permanecer en CPU, un nodo con suficiente memoria y almacenamiento NVMe puede servir el modelo sin necesidad de GPU de gran VRAM, aplicable a entornos de investigación con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar para este modelo ni para su checkpoint de origen. Lo único documentado es un registro de pruebas de humo con un prompt fijo (escribir una función Python `add`), ejecutado sobre llama.cpp `b1-4da6337` en una Radeon 680M con backend Vulkan, mmap activado y expertos y tabla de n-gramas en CPU:

| Fichero | Fecha | Build | Backend | Resultado |
|---|---|---|---|---|
| `CYBER-FROST-3.8-Q4_K_M.gguf` | 2026-09-28 | b1-4da6337 | Vulkan, mmap, expertos y tabla de n-gramas en CPU | Pasa, `def add` con `return`, 1,1 tok/s |
| `CYBER-FROST-3.8-UD-Q4_K_XL.gguf` | 2026-09-28 | b1-4da6337 | Vulkan, mmap, expertos y tabla de n-gramas en CPU | Pasa, misma función, 1,0 tok/s |
| `CYBER-FROST-3.8-UD-IQ4_XS.gguf` | 2026-09-28 | b1-4da6337 | Vulkan, mmap, expertos y tabla de n-gramas en CPU | Pasa, misma función, 0,9 tok/s |

Velocidad medida por el autor con 512 tokens de contexto: entre 0,5 y 0,7 tok/s de procesamiento de prompt y entre 1,0 y 1,1 tok/s de generación. El registro de pruebas de la model card aparece truncado en la información disponible, por lo que no hay resultados para el resto de ficheros.

## Requisitos de hardware

- Tamano en disco: entre 80,08 GB (Q2_K, Q2_K_S) y 123,10 GB (UD-Q4_K_XL); el repositorio completo ocupa 879,9 GB.
- VRAM para descarga completa en GPU: no disponible como dato oficial. Como referencia derivada del tamaño de fichero, una descarga íntegra en GPU requeriría aproximadamente el tamaño del GGUF más la caché KV, es decir del orden de 80-125 GB según la cuantización, cifra que no está confirmada por el autor.
- Estrategia validada por el autor: mantener expertos y tabla de n-gramas en CPU con `-ot "per_layer_token_embd=CPU,exps=CPU"` y `-cmoe`, dejando el resto en GPU con `-ngl 99`. Con esa configuración, la memoria de gráficos integrados (GTT) se mantuvo cerca de 45 MB.
- Hardware probado: Radeon 680M (GPU integrada), Vulkan, con `GGML_VK_DISABLE_ASYNC=1`, `-lm mmap` y `-fit off`. No se han documentado pruebas en A100, H100, RTX 4090 ni otras GPUs discretas.
- Cabe en GPU de consumo: no disponible. Ningún fichero de los publicados (mínimo 80,08 GB) cabe en una GPU de consumo de 24 GB sin descarga parcial a CPU o a disco.
- Caché KV: debe usarse f16 (`-ctk f16 -ctv f16`). La caché KV cuantizada provoca fallos en esta arquitectura según el autor.
- Opciones de despliegue: llama.cpp (única librería declarada). El autor solo ha validado el backend Vulkan; no hay datos de CUDA, ROCm ni Metal, ni de servidores como vLLM, TGI u Ollama.
- Latencia y throughput medidos: 0,5-0,7 tok/s de prompt y 1,0-1,1 tok/s de generación en Radeon 680M con expertos en CPU. No hay datos de throughput en hardware de datacenter.
- Comando de referencia proporcionado por el autor:

```bash
GGML_VK_DISABLE_ASYNC=1 llama-cli \
  -m CYBER-FROST-3.8-Q4_K_M.gguf \
  -ot "per_layer_token_embd=CPU,exps=CPU" \
  -cmoe \
  -ngl 99 \
  -c 512 \
  -lm mmap -fit off \
  -ctk f16 -ctv f16 \
  --jinja
```

Y para el fichero con cabecera MTP integrada:

```bash
GGML_VK_DISABLE_ASYNC=1 llama-cli \
  -m CYBER-FROST-3.8-Q2_K_S.gguf \
  -ot "per_layer_token_embd=CPU,exps=CPU" \
  -cmoe \
  -ngl 99 \
  -c 512 \
  -lm mmap -fit off \
  -ctk f16 -ctv f16 \
  --spec-type draft-mtp --spec-draft-n-max 2
```

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones ni resultados de modelos comparables de la misma categoría. Las únicas referencias conocidas por la propia model card son el checkpoint de origen `Blackfrost-AI/CYBER-FROST-3.8-BF16` y el modelo upstream `Qwen/Qwen3.8-Flash-Next`, pero no se aportan para ellos ni recuento de parámetros, ni contexto, ni licencia, ni benchmarks, por lo que no es posible construir una comparación con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-GGUF (este) | ~177B totales, ~6B activos | 262.144 configurados (512 probados) | qwen-community-license-1.0 | GGUF en HuggingFace | Solo pruebas de humo |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 | no disponible | no disponible | no disponible | checkpoint de origen | no disponible |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | modelo upstream | no disponible |

## Limitaciones y advertencias

- Contexto largo sin validar: la ventana configurada es de 262.144 tokens, pero el autor solo ha probado 512. No hay garantía de coherencia ni de estabilidad más allá de ese tamaño, y con caché KV f16 el consumo de memoria crece con el contexto.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; no hay evaluaciones publicadas de fidelidad factual para este modelo ni para su checkpoint de origen.
- Sesgos: no disponible. No se documenta ninguna evaluación de sesgos, toxicidad o alineación.
- Idiomas: no disponible. No se declara ninguna lista de idiomas soportados ni calidad por idioma.
- Licencia: `qwen-community-license-1.0`, marcada en HuggingFace como `other`. No se detallan en la información disponible las condiciones exactas de uso comercial, umbrales de usuarios o restricciones de redistribución; es imprescindible leer el fichero `LICENSE` del repositorio antes de cualquier uso en producción.
- Fallo de carga de los ficheros auxiliares: `mtp-CYBER-FROST-3.8-Q8_0.gguf` no carga junto a un tronco porque falta `output_hc_norm.weight`; llama.cpp se detiene. Los pesos del mezclador están almacenados como `blk.48.nextn.hc_head_norm.weight`. El autor indica expresamente que no se pase ninguno de los sidecar `mtp-` con `-md`.
- Dependencia de una build concreta de llama.cpp: la decodificación especulativa del fichero `Q2_K_S` requiere el grafo MTP de `qwen4exp` en la build local; el autor trabajó con `b1-4da6337`. Otras builds pueden no funcionar.
- Kernel SSM conv sensible: `ssm_conv1d.weight` está en F16 y el shader Vulkan de convolución SSM lee float; una build que alimente el kernel F16 directamente al shader produce texto incoherente. Es necesario que el kernel se caste a F32 antes de la convolución.
- Caché KV cuantizada no soportada: provoca fallos en esta arquitectura, obligando a f16 y aumentando el uso de memoria en contextos largos.
- Sin matriz de importancia: los ficheros dinámicos e IQ4_XS no usan imatrix, por lo que el autor advierte que `UD-IQ4_XS` no equivaldrá a un IQ4_XS calibrado. Los esquemas no son Unsloth Dynamic 3.0.
- Velocidad muy baja en el hardware probado: ~1 tok/s de generación, lo que hace inviable la interacción en tiempo real salvo en configuraciones de hardware muy superiores, no documentadas.
- Pila de texto únicamente: la torre de visión no se convirtió, de modo que no hay capacidades de imagen pese a que el arquitectura de origen sea de generación condicional.
- Artefacto de nicho y poco probado: 80 descargas y 11 likes; el historial de pruebas se limita a un prompt de código y aparece truncado en la información disponible.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-GGUF
- Checkpoint de origen (BF16): https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo upstream citado en la model card: `Qwen/Qwen3.8-Flash-Next` (referenciado como origen de la arquitectura `qwen4exp`; no se ha proporcionado URL directa)
- Busqueda web realizada: los resultados obtenidos (local-ai-zone.github.io, imtaqin.id, empero.org, torwiki.org) no aportan informacion especifica ni verificable sobre este modelo, por lo que no se incluyen como fuentes tecnicas.
