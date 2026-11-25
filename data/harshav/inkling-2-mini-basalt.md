# harshav/Inkling-2-Mini-Basalt

## Resumen

Inkling-2-Mini-Basalt es un paquete de pesos cuantizado y empaquetado para el motor de inferencia Basalt, derivado del modelo oficial `thinkingmachines/Inkling-2-Mini` de Thinking Machines Lab. No es un modelo entrenado desde cero, sino una conversión bit-a-bit de los expertos enrutados del checkpoint original (NVFP4 en las capas 0–19 y MXFP8 en las capas 20–23) junto con las proyecciones de atención de texto mantenidas en BF16 de origen. El resultado es un único fichero `.basalt` de 18,82 GiB listo para servir en GPUs NVIDIA Blackwell (sm_120).

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) y controladores de bucle ("looped transformer"), con 128 expertos por capa y top-8 enrutados, además de un codificador de visión y un drafter especulativo DSpark de tres capas embebido. El modelo es multimodal (image-text-to-text) y conversacional, con soporte declarado de inglés y otros idiomas.

Su relevancia es fundamentalmente de infraestructura: demuestra cómo preservar la cuantización nativa de un modelo MoE de gran tamaño y alto contexto (hasta 262.144 tokens) sin recuantizar, manteniendo una fidelidad muy alta respecto al checkpoint oficial (KLD medio de 0,002475 y 97,875 % de acuerdo top-1 en WikiText-2). Está pensado para desarrolladores que despliegan en hardware Blackwell y necesitan pesos verificables con checksum SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con controladores de bucle (looped transformer) y codificador de vision |
| Parametros totales | no disponible |
| Parametros activos | no disponible (128 expertos por capa, top-8 enrutados) |
| Longitud de contexto | hasta 262.144 tokens (segun flags de servicio `--max-context 262144`) |
| Tipos de cuantizacion | NVFP4 (expertos capas 0–19), MXFP8 (expertos capas 20–23), BF16 (atencion de texto, embeddings, loop controllers, vision), F32 (norms, routers, biases, escalas), Q8_0 (cabeza de salida al cargar) |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | `.basalt` (pack propietario del motor Basalt), con manifiesto `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: cada una de las capas enrutadas contiene 128 expertos con seleccion top-8. Las capas 0–19 almacenan sus expertos en NVFP4 (E2M1 con escala E4M3 por bloque de 16 y escala FP32), mientras que las capas 20–23 usan MXFP8 (E4M3 con escala UE8M0 por bloque de 32). Sobre esta base se anaden controladores de bucle en las capas centrales 6–17 con tres pasadas, lo que da al modelo su caracter "looped". Incorpora tambien un codificador de vision con proyector multimodal y una cabeza Markov dentro del drafter DSpark.

Este paquete concreto no entrena nada: copia los expertos bit a bit desde el checkpoint oficial y mantiene las nueve familias de proyecciones de atencion de texto (`w.q`, `w.k`, `w.v`, `w.rel`, `w.gate`, `w.sink`, `w.k_conv_proj`, `w.v_conv_proj`, `w.out`) en BF16 de origen en lugar de redondearlas a Q8_0. Las normas, routers, biases, convoluciones, tablas de sesgo relativo y escalas de recorte se guardan en F32 exacto. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

La innovacion tecnica destacable es la decodificacion especulativa con el drafter DSpark de tres capas mas SuffixDrafter, con verificacion de 16 filas en una sola pasada y captura en grafo unico, que eleva el throughput en generacion estructurada hasta 772 tok/s en una RTX 5090.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat incluida.
- Razonamiento multimodal image-text-to-text gracias al codificador de vision y su proyector.
- Procesamiento de contexto muy largo, hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Soporte multilingue segun la etiqueta `multilingual` (sin desglose de idiomas publicado).
- Decodificacion especulativa integrada (DSpark mas SuffixDrafter) para acelerar la generacion.
- Salida estructurada optimizada: el benchmark interno reporta 89,5 % de aceptacion en modo `struct`.
- Capacidad de ejecucion con KV cache en fp16 o int8.
- No se documenta soporte explicito de tool calling ni de razonamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Analisis de documentos largos: con 262.144 tokens de contexto se pueden ingerir informes completos, expedientes o bases de codigo extensas en una sola pasada sin trocear, manteniendo coherencia entre secciones.
- Asistentes conversacionales de atencion al cliente: el modelo mantiene historial multi-turno largo y la plantilla de chat incluida simplifica la integracion en backends de dialogo.
- Procesamiento de imagenes con texto asociado: extraccion de informacion de capturas, formularios escaneados o diagramas combinados con preguntas en lenguaje natural, gracias al pipeline image-text-to-text.
- Generacion estructurada de alta velocidad: con 772 tok/s en modo `struct` sobre RTX 5090, es adecuado para producir JSON, tablas o registros en pipelines de datos por lotes.
- Despliegue en estaciones de trabajo Blackwell: el pack esta pensado para GPUs sm_120 con todos los expertos residentes en memoria, lo que permite servir el modelo en una unica maquina sin clúster.
- Evaluacion y auditoria de cuantizaciones: al conservar los expertos nativos y publicar KLD y acuerdo top-1 frente al checkpoint oficial, sirve como referencia reproducible para validar pipelines de conversion.
- Prototipado de inferencia especulativa: el drafter DSpark embebido permite medir ganancias de decodificacion especulativa en cargas conversacionales, estructuradas y de prosa.

## Benchmarks y rendimiento

Fidelidad respecto al checkpoint oficial (WikiText-2, 100 chunks, 25.500 filas evaluadas, ancho de verificacion 1, RTX 5090 a 600 W, `--max-context 262144 --kv fp16`, 3.072 expertos en GPU, PPL base 7,06334):

| Pack | KLD medio | KLD mediana | KLD p99 | KLD max | Acuerdo top-1 | PPL |
|---|---:|---:|---:|---:|---:|---:|
| `NVFP4-MX8` (control con atencion Q8_0) | 0,003046 | 0,001199 | 0,02891 | 0,8415 | 97,663 % | 7,06771 |
| `NVFP4-MX8-BF16-ATTN` (este pack) | 0,002475 | 0,000971 | 0,02240 | 0,3539 | 97,875 % | 7,07025 |

Rendimiento (`basalt-bench --seed 42 -r 2 --spec 16`, RTX 5090 a 600 W):

| Pack y flags | pp16384 (tok/s) | tg conv (tok/s) | tg struct (tok/s) | tg prose (tok/s) |
|---|---:|---:|---:|---:|
| `BF16-ATTN`, `--kv fp16 --draft-stop-prob 0.15` | 20.726 ± 65 | 310 ± 4 (50,0 % acc) | 772 ± 11 (89,5 % acc) | 264 ± 1 (37,8 % acc) |
| `BF16-ATTN`, `--kv fp16 --draft-stop-prob 0` | 20.737 ± 65 | 308 ± 2 (51,0 % acc) | 767 ± 2 (89,5 % acc) | 264 ± 0 (37,3 % acc) |
| `BF16-ATTN`, `--kv int8` | 20.686 ± 61 | 323 ± 6 (62,1 % acc) | 699 ± 4 (93,4 % acc) | 274 ± 0 (44,6 % acc) |
| Referencia `NVFP4-MX8`, `--kv int8`, atencion Q8_0 | 22.659 ± 48 | 401 ± 8 (65,7 % acc) | 779 ± 22 (91,3 % acc) | 347 ± 3 (51,2 % acc) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 18,82 GiB; con todos los expertos en GPU y pesos densos de atencion en BF16 (1,66 GiB frente a 1,10 GiB en la variante Q8_0), se necesita una GPU con al menos 24 GB de memoria, y en la practica mas para el KV cache a contexto largo.
- GPU recomendadas: NVIDIA Blackwell sm_120 (RTX 5090 es la referencia medida). El pack requiere un build de Basalt con soporte `BF16-ATTN` (`bf16_sm120`); el repositorio upstream estandar espera atencion Q8_0.
- Cabe en GPU de consumo: si, en RTX 5090 (probado); no se documenta compatibilidad con generaciones anteriores (Ada, Ampere) por la dependencia de sm_120.
- Opciones de despliegue: motor Basalt (`bin/basalt serve`) con flags `--max-context 262144 --kv fp16 --spec 16 --parallel 1 --vision dynamic`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: prefill de 20.726 tok/s (pp16384); generacion de 772 tok/s en estructurado, 310 tok/s en conversacional y 264 tok/s en prosa con KV fp16; 323, 699 y 274 tok/s respectivamente con KV int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `harshav/Inkling-2-Mini-Basalt` (este) | no disponible (MoE top-8, 128 expertos/capa) | 262.144 | NVFP4 + MXFP8 + BF16 attn | Apache 2.0 | Requiere Basalt con BF16-ATTN; KLD medio 0,002475 |
| `jesdga/Inkling-2-Mini-Basalt` | mismo modelo base | 262.144 | NVFP4 + MXFP8 + Q8_0 attn | Apache 2.0 | Compatible con Basalt upstream; KLD medio 0,003046 |
| `thinkingmachines/Inkling-2-Mini` | mismo modelo base | no disponible en la informacion | NVFP4 / MXFP8 nativo | Apache 2.0 | Checkpoint oficial de referencia |

No se dispone de datos para comparar con modelos de otras familias de tamano o categoria equivalente.

## Limitaciones y advertencias

- Dependencia de motor: el pack no funciona con el Basalt upstream estandar; exige un build con `BF16-ATTN`, aun no publicado publicamente en el momento de la ficha.
- Dependencia de hardware: orientado a NVIDIA Blackwell sm_120; no se garantiza su funcionamiento en otras arquitecturas.
- Fidelidad medida contra un checkpoint de referencia deconstruido (expertos oficiales desquantizados a BF16), no contra un modelo nativo en BF16, que no existe; los KLD no son comparables con los de modelos entrenados en BF16.
- Ligera perdida de perplejidad frente al control con atencion Q8_0 (7,07025 frente a 7,06771) y menor throughput en conversacional y prosa (310 frente a 401 tok/s y 264 frente a 347 tok/s).
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- Cobertura idiomatica: solo se declara `en` y `multilingual` sin desglose; el rendimiento en castellano no esta verificado.
- Uso comercial permitido por licencia Apache 2.0, pero conviene revisar las condiciones del modelo base de Thinking Machines Lab y la ausencia de garantias propias de la licencia.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face del pack: https://huggingface.co/harshav/Inkling-2-Mini-Basalt
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante compatible con Basalt upstream: https://huggingface.co/jesdga/Inkling-2-Mini-Basalt
- Repositorio del motor Basalt: https://github.com/jesdga95/basalt
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
