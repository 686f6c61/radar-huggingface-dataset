# qwegnai/Inkling-2-Mini-shvq4g32-shvq2g64-shvq3g64

## Resumen

Inkling-2-Mini en formato SHVQ es un paquete de pesos cuantizados del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `qwegnai` para su uso exclusivo con el motor de inferencia Qwegn (Swift 6.2 + Metal 4) sobre Apple Silicon. El modelo base es un transformer con arquitectura de bucle (`inkling2_loop`): 24 capas fisicas que visitan el bloque `[6..<18]` tres veces, lo que da 48 visitas efectivas de capa, con 128 expertos enrutados (8 activos por token) y una torre de vision de 23 capas. El paquete totaliza 26.390 millones de parametros mas un drafter DSpark de 317,90 millones.

La relevancia de este artefacto no esta en el modelo en si, sino en la tecnica de compresion: Spherical Hadamard Vector Quantization (SHVQ, `arXiv:2611.09501`) reduce el peso del paquete a 10,20 GiB (9,94 GiB para `model.qwp` y 247,4 MiB para `dspark.qwp`), con un trafico activo de pesos de 2,089 GB por token, un 2,65x inferior al de MXFP8/NVFP4. Segun el autor, esto permite mantener el modelo 100% residente en un Mac de 128 GB de memoria unificada, incluso con contexto de 1M tokens.

El contexto nativo es de 1.048.576 tokens, gestionado mediante indexado de 64 bits en el operador LSA y reutilizacion entre bucles (`--lsa-cross-loop-reuse`). El paquete no es un safetensors, ni GGUF, ni MLX: usa el contenedor propio `QWP1` y solo carga en Qwegn v0.33.0 o superior (se recomienda v0.34.0). La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop`: transformer con bucle de capas (looped transformer) y MoE disperso; 24 capas fisicas, 48 visitas efectivas; atencion Sink+RelBias con 24Q/8KV (`head_dim = 128`), 4 capas full y 20 con SWA-1024; `AttnRes-6`; `SConv-4`; torre de vision de 23 capas con `1024-d` |
| Parametros totales | 26.388.641.280 (26,39 B) en 1.115 tensores, mas 317,90 M del drafter DSpark |
| Parametros activos | 8 expertos enrutados de 128 por token (`intermediate_size = 1152`); el numero exacto de parametros activos no esta disponible |
| Longitud de contexto | 1.048.576 tokens (1M) nativos; KV de DSpark limitado a 16K |
| Tipos de cuantizacion | SHVQ4_G32 (tronco, coda, atencion y `lm_head`), SHVQ2_G64 y SHVQ3_G64 (MoE del bucle principal), SHVQ4_G64 (MoE de la coda), BF16/F32 para el resto; KV en `f16`, `q8` o `q4` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario `QWP1` (`model.qwp` + `dspark.qwp`); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer con bucle: 24 capas fisicas donde el bloque central (capas 6 a 17) se recorre tres veces, generando 48 visitas efectivas de capa (4 de tronco, 12 x 3 de bucle y 4 de coda). La dimension oculta es 2304. La atencion combina mecanismos Sink y RelBias con 24 cabezas de consulta y 8 de clave/valor, `head_dim` de 128, y una mezcla de 4 capas de atencion completa con 20 capas de atencion de ventana deslizante de 1024 tokens. Se anaden modulos `AttnRes-6` y `SConv-4`. La capa MoE tiene 128 expertos enrutados con 8 activos por token y `intermediate_size` de 1152. El vocabulario es BPE con `ignore_merges`, 201.024 entradas con padding (200.058 sin padding). La torre de vision tiene 23 capas con dimension 1024.

El paquete incluye un drafter DSpark de tres capas basado en Markov/Tree MTP para decodificacion especulativa. La cuantizacion SHVQ aplica transformadas de Hadamard esfericas y cuantizacion vectorial por grupos: 177 planos en SHVQ4_G32 para tronco, coda, atencion y cabeza de salida; 20 planos en SHVQ2_G64 (2,25 bits por peso) para `gate_up_proj` del MoE principal; 24 planos en SHVQ3_G64 (3,25 bits por peso) para `down_proj` del MoE principal y `gate_up_proj` de la coda; y 4 planos en SHVQ4_G64 para `down_proj` de la coda. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline declarado es `image-text-to-text`, con torre de vision de 23 capas que procesa imagenes junto a texto.
- Generacion de codigo: el autor reporta 21/25 en `Code-25` (12/13 en HumanEval y 9/12 en MBPP) con el pack cuantizado.
- Contexto largo: recuperacion verificada de aguja en pajar (`needle recall`) 3/3 en el rango de 16K a 128K tokens, y decodificacion a 1M tokens.
- Decodificacion especulativa: drafter DSpark con `d=3` y arbol Markov, con modo determinista bit-exacto entre `d=0` y `d=3` para KV en `f16`, `q8` y `q4`.
- Soporte de herramientas: la suite de conformidad `llmprobe` reporta 89/89 (100%) en conformidad de API, y la prueba multi-turno `Law 28` con herramientas pasa 9/9.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito: no disponible.
- Audio: no disponible.

## Casos de uso

- Inferencia local en Mac de gran memoria: el pack de 10,20 GiB permite ejecutar un modelo de 26,39 B parametros con contexto de 1M tokens en un Apple M5 Max de 128 GB, con residencia del 100% y sin allocs en estado estacionario; util para laboratorios que quieran un modelo multimodal grande sin GPU dedicada.
- Analisis de documentos extensos: con 1M tokens de contexto y recuperacion de aguja verificada hasta 128K, se puede ingerir un corpus documental completo (informes, expedientes, bases de codigo) y hacer preguntas sobre el sin troceado.
- Asistencia de codigo en local: el rendimiento de 12/13 en HumanEval y 9/12 en MBPP, junto con tool calling conforme al 100%, permite integrarlo en editores o pipelines de CI/CD que necesiten un asistente de codigo que no salga del equipo.
- Servicio HTTP concurrente: `QWServer` con batching continuo alcanza 100,56 tok/s con B=4 peticiones concurrentes, lo que habilita un endpoint interno para un equipo pequeno con latencia aceptable.
- Procesamiento de imagenes y texto combinados: el pipeline `image-text-to-text` con torre de vision permite describir capturas, extraer informacion de graficos o responder preguntas sobre documentos escaneados dentro del mismo flujo.
- Prototipado de agentes multi-paso: la prueba `Law 28` con 9/9 en conversaciones multi-turno con herramientas y caché de prefijo caliente (147/184 aciertos) respalda el uso en agentes que encadenan llamadas a funciones.
- Evaluacion de tecnicas de cuantizacion: el pack sirve como referencia reproducible para medir el impacto de SHVQ frente al modelo sin cuantizar, con un KL medio de 0,083902 y un 88,54% de coincidencia Top-1.

## Benchmarks y rendimiento

Mediciones del autor sobre un Apple M5 Max (18 nucleos de CPU, GPU Apple10 NAX de 40 nucleos, 128 GB de memoria unificada, 585 GB/s de DRAM), con `--kv-mode q4 --temperature 0`.

| Metrica | Resultado |
|---|---|
| Prefill NAX (2K / 8K / 16K / 32K / 128K) | 3.507,4 / 3.637,9 / 3.430,3 / 3.217,9 / 3.200,0 tok/s |
| Decodificacion serie (`d=0`) | 72,68–73,18 tok/s |
| Decodificacion DSpark `d=3` (2K / code256 / pico) | 60,34 / 76,38 / 99,89 tok/s |
| MoE-Spec opt-in `--moe-spec-budget 12` (code256 / 2K / 16K) | 86,18 / 63,31 / 96,55 tok/s |
| Batching concurrente HTTP (B=3 / B=4) | 77,36 / 100,56 tok/s |
| LSA con reutilizacion entre bucles (32K / 128K / 1M) | 61,83 / 71,85 / 78,01 tok/s |
| Conformidad de API `llmprobe` | 89/89 (100%) |
| `Code-25` (HumanEval / MBPP) | 21/25 (12/13 / 9/12) |
| Recuperacion de aguja (16K–128K) | 3/3 |
| KL medio y Top-1 frente al modelo sin cuantizar | 0,083902 / 88,54% |

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 11,13 GiB planificados a 8K de contexto y 19,72 GiB planificados a 1M con KV `q4` (20,69 GiB de RSS en la practica); el pack ocupa 10,20 GiB en disco.
- GPU recomendadas: Apple Silicon con Metal 4; el autor mide sobre un M5 Max de 40 nucleos de GPU y 128 GB. No se documenta soporte para A100, H100 ni RTX 4090, ya que el motor Qwegn es exclusivo de Apple Silicon.
- Cabe en GPU de consumo: si, en Mac con memoria unificada suficiente; no hay datos para GPUs discretas de consumo.
- Opciones de despliegue: exclusivamente el motor Qwegn v0.33.0 o superior (v0.34.0 recomendado), con `QWServer` para servicio HTTP. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de hasta 3.637,9 tok/s a 8K, decodificacion de 72,68 tok/s en serie y hasta 99,89 tok/s con DSpark; 78,01 tok/s a 1M de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini SHVQ (este pack) | 26,39 B + 317,90 M drafter | 1M | `QWP1` (solo Qwegn) | Apache 2.0 | 10,20 GiB; KL 0,083902; 2,65x menos trafico que NVFP4 |
| `qwegnai/Inkling-2-Mini-shvq4g32-nvfp4` | 26,39 B | no disponible | `QWP1` (solo Qwegn) | Apache 2.0 | 15,15 GiB; KL 0,013170; 97,92% Top-1; 13/13 HumanEval |
| `thinkingmachines/Inkling-2-Mini` (base) | 26,39 B | no disponible | no disponible | no disponible | Referencia sin cuantizar para KL y Top-1 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el pack solo carga en Qwegn v0.33.0 o superior sobre Apple Silicon con Metal 4; no funciona con safetensors, GGUF, MLX, vLLM, llama.cpp ni Ollama.
- Perdida de fidelidad por cuantizacion: el KL medio de 0,083902 y el 88,54% de Top-1 frente al modelo sin cuantizar implican desviaciones medibles respecto al original; el autor ofrece un pack alternativo NVFP4 con KL de 0,013170 para quienes necesiten mayor fidelidad.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de alucinacion; el modelo base y la cuantizacion pueden amplificar este riesgo en tareas de hechos.
- Idiomas: no se especifican los idiomas soportados, por lo que no hay garantia de calidad fuera del ingles.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base declara la misma licencia; conviene verificar las condiciones del modelo original antes de desplegarlo en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y el motor Qwegn es un runtime joven (v0.33.0); no hay evidencia de uso en produccion a escala.
- Contexto de 1M: aunque el autor reporta 78,01 tok/s a 1M, el KV de DSpark esta limitado a 16K, lo que puede afectar a la decodificacion especulativa en contextos muy largos.

## Enlaces

- Hugging Face del pack: https://huggingface.co/qwegnai/Inkling-2-Mini-shvq4g32-shvq2g64-shvq3g64
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pack alternativo NVFP4: https://huggingface.co/qwegnai/Inkling-2-Mini-shvq4g32-nvfp4
- Motor Qwegn: https://github.com/qwegnai/qwegn
- Paper SHVQ: `arXiv:2611.09501` (referenciado en la model card; no se proporciona URL directa)
