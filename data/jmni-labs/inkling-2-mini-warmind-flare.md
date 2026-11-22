# JMNI-Labs/Inkling-2-Mini-WARMIND-FLARE

## Resumen

Inkling-2-Mini-WARMIND-FLARE es un paquete de inferencia precompilado y firmado para servir el modelo `jcartu/Inkling-2-Mini-WARMIND`, una variante "abliterated" (con las direcciones de rechazo suprimidas) de `thinkingmachines/Inkling-2-Mini`. Lo publica JMNI-Labs como artefacto listo para ejecutar sobre el motor NVIDIA Flare (hyperflare-inference), orientado especificamente a un unico nodo DGX Spark con GPU GB10 (arquitectura SM121, 121 GiB de memoria unificada). El paquete no es un modelo nuevo en sentido estricto: es una distribucion empaquetada con pesos cuantizados, kernels parcheados y una configuracion de despliegue afinada para hardware Blackwell de escritorio.

La relevancia tecnica esta en la combinacion de optimizaciones: cuantizacion NVFP4 en las proyecciones Q, Gate, O y las 24 capas MoE (W4A16), MXFP8 en la LM head y el cuerpo DSpark, BF16 exacto en K, V y las proyecciones Rel+Sink, y decodificacion especulativa con 7 borradores DSpark y verificacion adaptativa. Todo ello mantiene una calidad practicamente identica al baseline BF16 en las pruebas publicadas (GSM8K 97,00 % frente a 96,50 %) mientras reduce los pesos a 16,2 GiB y permite una cache KV de 85,5 GiB, equivalente a 4.313.088 tokens.

El modelo base es un transformer con mezcla de expertos (MoE) y estructura "looped" (reutilizacion de capas), con capacidades multimodales de entrada imagen-texto y contexto declarado de hasta 1M tokens en esta configuracion. La licencia Apache-2.0 cubre pesos base, pesos abliterated y el motor Flare, lo que facilita su uso comercial, aunque el paquete esta fuertemente acoplado a hardware GB10/DGX Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas "looped" (segun etiquetas del autor); vision integrada; decodificacion especulativa DSpark de 7 borradores |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE de 24 capas, sin cifra publicada) |
| Longitud de contexto | 1M tokens (configuracion `gb10-tp1`); cache KV de 4.313.088 tokens |
| Tipos de cuantizacion | NVFP4 (Q+Gate, O, 24 capas MoE, W4A16 con `a4_prefill`); MXFP8 (LM head y cuerpo DSpark); BF16 exacto (K, V, Rel+Sink); FP8 nativo (KV objetivo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Flare propietario sobre rama `gb10-tp1`; pesos cuantizados NVFP4/MXFP8/BF16; sin GGUF ni safetensors estandar publicados en la informacion disponible |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` es un transformer con mezcla de expertos y estructura "looped", con soporte de entrada imagen-texto. La variante WARMIND aplica una abliteration "orth4c" que preserva la abstencion: modifica unicamente las 20 proyecciones BF16 `layers.{4..23}.attn.wo_ud.weight`, manteniendo intactos todos los expertos, la torre de vision y los pesos DSpark de 3 capas y 7 borradores. Segun el autor, esta intervencion elimina rechazos falsos en prompts benignos manteniendo la abstencion honesta ante preguntas factuales sin respuesta.

El paquete FLARE anade una capa de optimizacion de inferencia: cuantizacion NVFP4 en las proyecciones de atencion y MoE con activaciones de 4 bits en prefill (`a4_prefill` de copia unica), MXFP8 en la LM head y el cuerpo DSpark, BF16 exacto en K, V y Rel+Sink, y una verificacion con anillo rotado de 10 entradas de copia cero. Incluye un parche a FlashInfer (`patches/flashinfer-b12x-situ-mxfp8-a4prefill.patch`, commit fijado `1d76585b`, referencia `flashinfer-ai/flashinfer#9821`). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento ("thinking") segun los tags y las pruebas de esfuerzo variable (`default-effort`, `zero-effort`).
- Procesamiento de imagenes: pipeline `image-text-to-text`, soporte de hasta 4 imagenes concurrentes y vision entre fragmentos (cross-chunk vision).
- Razonamiento matematico: GSM8K con 97,00 % en la configuracion cuantizada.
- Razonamiento sobre contexto largo: prueba LAVD con prompt de 48K caracteres, 10/10 exactas.
- Decodificacion especulativa integrada (DSpark, 7 borradores) con verificacion adaptativa (`--mtp-adaptive-verification`, alpha configurable).
- Abliteration con abstencion preservada: responde a prompts de educacion en seguridad y creativos benignos sin rechazos falsos, manteniendo abstencion ante consultas factuales sin respuesta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; las pruebas registran `0` CJK en la medicion de coding peak, pero no se declaran idiomas soportados.

## Casos de uso

- Despliegue local de razonamiento multimodal en un unico DGX Spark: el paquete arranca en 16 s con 16,2 GiB de pesos y 85,5 GiB de cache KV, lo que permite servir un modelo de contexto largo y vision en hardware de escritorio Blackwell sin infraestructura de centro de datos.
- Analisis de documentos extensos: con 1M de contexto y 4,31M de tokens KV disponibles, se pueden procesar informes, expedientes o bases de codigo completas en una sola sesion; la prueba LAVD de 48K caracteres con 10/10 exactas respalda el rendimiento en contexto largo.
- Asistencia de programacion interactiva: el modo `--coding-peak` alcanza una mediana de 74,5 tok/s (maximo 78,8) con C1, adecuado para autocompletado y generacion de codigo en un IDE o pipeline de CI/CD local.
- Servicio de chat multiusuario en estacion de trabajo: el throughput agregado llega a 368,1 tok/s con C32 a 8K de contexto y 357,5 tok/s a 32K, lo que permite atender decenas de conversaciones concurrentes en un solo nodo.
- Procesamiento por lotes de imagenes y texto: con 4 imagenes concurrentes y prefill de 4.096 tokens por fragmento, es viable clasificar, describir o extraer informacion de lotes de capturas, facturas o diagramas.
- Investigacion sobre abliteration y seguridad: la variante WARMIND permite estudiar el comportamiento de rechazo y abstencion en modelos abliterated manteniendo el resto de pesos identicos al stock, util para evaluaciones de alineamiento reproducibles.
- Evaluacion de tecnicas de cuantizacion y decodificacion especulativa: el paquete expone configuraciones NVFP4, MXFP8, BF16 y DSpark con metricas de latencia y calidad, lo que sirve como banco de pruebas para comparar esquemas de compresion en Blackwell.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un unico ASUS GX10 / DGX Spark (GB10, techo de GPU 0-2350 MHz), con `--mtp-draft-tokens 7 --mtp-adaptive-verification --mtp-adaptive-verification-alpha 0.85`, temperatura 1, celdas de 20 s y maximo 2048 tokens de salida:

| Metrica | Resultado (`gb10-tp1`) |
|---|---|
| Arranque / pesos / cache KV | 16 s / 16,2 GiB / 85,5 GiB (4.313.088 tokens KV) |
| Decodificacion simple C1 / C4 / C16 | 49,7 / 100,1 / 186,1 tok/s |
| Prefill en frio 8K / 32K | 4.848 / 4.537 tok/s |
| Coding peak (`cc1`, 5/5 ejecuciones) | mediana 74,5; media 73,7; maximo 78,8 tok/s |
| Prefill de cliente 8K / 32K / 128K | 4.062 / 4.258 / 3.181 tok/s |
| Adaptativo alpha=0,50 (C1 / C4 / C16) | 64,2 / 104,4 / 227,7 tok/s |
| Adaptativo alpha=0,85 (C1 / C4 / C16) | 63,1 / 104,7 / 227,2 tok/s |

Throughput agregado de decodificacion (tok/s, alpha=0,85):

| Contexto | C1 | C2 | C4 | C8 | C16 | C32 |
|---|---:|---:|---:|---:|---:|---:|
| 8K | 52,7 | 72,0 | 113,9 | 169,2 | 258,8 | 368,1 |
| 32K | 50,2 | 68,8 | 111,2 | 159,4 | 239,1 | 357,5 |

Precision y cualificacion frente al baseline BF16 exacto:

| Prueba | Resultado |
|---|---|
| GSM8K pareado (200 items, temp=0, C=16) | 97,00 % (194/200) frente a 96,50 % (193/200) del stock; +0,50 pp, 1 frente a 2 fallos, McNemar exacto p=1,0, 0 ilegibles, 0 truncamientos |
| LAVD de contexto largo (prompt de 48K caracteres, 10 ejecuciones, C=10) | 10/10 exactas (100,0 %), 0 fallos, 0 truncamientos |
| `tests/server/test_inkling2.py` | 13/14 superadas; el fallo `test_four_images_and_four_concurrent_image_requests[default-effort]` alcanzo el limite de 1024 tokens por razonamiento mas largo; `[zero-effort]` y vision entre fragmentos superadas |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 16,2 GiB de pesos mas 85,5 GiB de cache KV en la configuracion `C32` (cap=256); el total encaja en los 121 GiB de memoria unificada del GB10.
- GPU recomendada: NVIDIA GB10 (DGX Spark, SM121); el paquete esta construido y firmado para esa plataforma.
- Cabe en GPU de consumo: no en el sentido habitual; requiere el nodo DGX Spark o hardware Blackwell con memoria unificada equivalente. No se documenta soporte para RTX 4090, A100 ni H100.
- Opciones de despliegue: motor NVIDIA Flare (hyperflare-inference) mediante `flare run`; FlashInfer con el parche `b12x` fijado al commit `1d76585b`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: arranque de 16 s; decodificacion de 49,7 tok/s en C1 y hasta 368,1 tok/s agregados en C32 a 8K; prefill de cliente entre 3.181 y 4.258 tok/s segun contexto.
- Requisito de firma: el paquete esta firmado con una clave de desarrollo local (huella `8767df4d...`); la primera ejecucion exige `--publisher-keys publisher.json --dangerously-approve-key 8767df4db5b3620838e06e8f41bbb23924ce58bd57d2d24337f4b7715c7f751d --dangerously-accept-publisher local-development`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-WARMIND-FLARE (`gb10-tp1`) | no disponible (MoE, 24 capas) | 1M | Apache-2.0 | Paquete Flare para GB10/DGX Spark | NVFP4 + MXFP8, DSpark 7 borradores, abliterated |
| Inkling-2-Mini-FLARE (stock) | no disponible | 1M (misma configuracion) | Apache-2.0 | Paquete Flare para GB10 | Version sin abliterar del mismo empaquetado |
| Inkling-2-Mini-WARMIND-FLARE-gb202 | no disponible | no disponible | Apache-2.0 | Paquete Flare para GB202 | Referencia del autor para GPU GB202 |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Apache-2.0 | Pesos originales en Hugging Face | Modelo base sin cuantizar ni empaquetar |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration modifica 20 proyecciones de atencion y puede alterar el comportamiento de seguridad del modelo original; el autor afirma preservar la abstencion, pero no se aportan evaluaciones independientes de seguridad.
- Riesgo de alucinacion: no se han publicado estudios especificos; el modelo base es de tipo generativo y el empaquetado no incluye salvaguardas adicionales.
- Idiomas soportados no declarados; no hay garantia de calidad fuera de los idiomas del entrenamiento original.
- El paquete esta acoplado a hardware GB10 (DGX Spark) y al motor Flare con FlashInfer parcheado; no es portable a otras GPUs ni a motores de inferencia estandar.
- La firma usa una clave de desarrollo local y requiere aceptar explicitamente flags `--dangerously-*` en el primer arranque; no se ofrece una cadena de confianza de produccion.
- El fallo en una de las pruebas de servidor (limite de 1024 tokens con razonamiento mas largo en `default-effort`) sugiere que solicitudes con esfuerzo de razonamiento alto pueden exceder presupuestos de salida ajustados.
- La licencia Apache-2.0 permite uso comercial, pero el cumplimiento debe verificar el aviso `NOTICE` y las condiciones de los pesos base de Thinking Machines.
- No se documentan parametros totales ni activos, lo que dificulta estimar costes fuera del hardware de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-WARMIND-FLARE
- Rama ejecutable `gb10-tp1`: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-WARMIND-FLARE/tree/gb10-tp1
- Modelo base abliterated: https://huggingface.co/jcartu/Inkling-2-Mini-WARMIND
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paquete stock equivalente: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-FLARE
- Paquete de referencia GB202: https://huggingface.co/jcartu/Inkling-2-Mini-WARMIND-FLARE-gb202
- Motor NVIDIA Flare: https://github.com/NVIDIA/hyperflare-inference
- Parche FlashInfer `b12x`: https://huggingface.co/JMNI-Labs/Inkling-2-Mini-WARMIND-FLARE/blob/main/patches/flashinfer-b12x-situ-mxfp8-a4prefill.patch
- Pull request de referencia FlashInfer: https://github.com/flashinfer-ai/flashinfer/pull/9821
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
