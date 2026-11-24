# kapitoshkina-ai/Hy4-770B-WHT128-HLUT

## Resumen

Hy4-770B-WHT128-HLUT es una distribucion cuantizada de forma heterogenea del modelo base tencent/Hy4, un transformer de tipo mezcla de expertos (MoE) con 770.000 millones de parametros totales y 49.000 millones activos por token, distribuidos en 78 capas (1 densa y 77 MoE con 256 expertos enrutados por capa, mas un experto compartido). La publica el usuario kapitoshkina-ai bajo el paraguas del proyecto "bespoke ontology", y su interes no reside en el modelo en si, sino en el formato de despliegue: shards nativos sin dividir pensados para ejecutarse sobre hardware muy poco convencional (AMD MI50 con gfx906, Tenstorrent Blackhole P150A y un EPYC 7542 con DDR4), con codigo C++17 puro y sin Python.

El paquete combina cuatro estrategias de cuantizacion distintas segun la "temperatura" del experto: FP8-g128 sin perdida para los expertos mas activos, WHT128-HLUT4 a 4,125 bits por peso para el segmento intermedio, y Q5_LM128 a 5,125 bits por peso para la cola de expertos poco usados, que se descarga a memoria DDR4 del sistema. El repositorio ocupa 78,1 GB, lo que sugiere que los pesos se distribuyen de forma comprimida y el spine compartido se mantiene en FP8.

Es relevante ahora porque documenta una via alternativa a la inferencia de modelos de escala frontera: en lugar de depender de clusters de GPUs de ultima generacion, propone un ensamblaje de hardware de segunda mano y aceleradores especializados con un presupuesto declarado de unos 10.000 dolares por unidad de rendimiento. Los datos de fidelidad y velocidad que reporta el autor son, sin embargo, dificiles de verificar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 78 capas (1 densa L00 + 77 MoE), 256 expertos enrutados por capa + 1 experto compartido; incluye 3,3B en 5 capas DFly2 y 1,23B en 40 capas BF16 Dynamic ViT |
| Parametros totales | 770B |
| Parametros activos | 49B |
| Longitud de contexto | 512K KV (segun telemetria del autor); no se especifica la ventana nativa del modelo base |
| Tipos de cuantizacion | FP8-g128 sin perdida (spine y expertos calientes), WHT128-HLUT4 a 4,125 bpw, Q5_LM128 a 5,125 bpw, BF16 para el ViT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, organizados en directorios de shards nativos sin dividir (packed_spine, fp8_hot, hlut4_hot, q5_ddr4) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4 es un transformer MoE con 770B parametros totales y 49B activos, 78 capas y 19.712 expertos enrutados en total (256 por capa en las 77 capas MoE) mas un experto compartido por capa. La capa L00 es densa. El modelo incorpora ademas un modulo DFly2 de 3,3B en 5 capas y un ViT dinamico de 1,23B en 40 capas en BF16, lo que indica capacidades multimodales de vision. El autor menciona 21 Lightning Indexers completos, un mecanismo de indexado disperso que no se detalla en la informacion disponible.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el empaquetado: cuantizacion heterogenea por rango de experto (FP8 en los rangos 0-20, HLUT4 en 20-62, Q5 en 62-256), transformada de Walsh-Hadamard de 128 puntos (WHT128) en el segmento intermedio, y un esquema de restauracion de cache KV en bloques `.kvblk` sobre doble NVMe que el autor cifra en 21.651 tok/s para 262K y 21.524 tok/s para 512K.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base tencent/Hy4.
- Procesamiento de vision mediante el ViT dinamico de 40 capas en BF16 (resoluciones de 640x448 y 1200x720 en las pruebas del autor).
- Razonamiento matematico: el autor reporta 71/71 en GSM8K congelado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Modo thinking explicito: no disponible.
- Inferencia de contexto largo: el autor declara operacion con cache KV de hasta 512K tokens mediante restauracion desde `.kvblk`.

## Casos de uso

- Investigacion en cuantizacion extrema: el paquete sirve como banco de pruebas para comparar FP8, HLUT4 y Q5_LM128 sobre el mismo modelo y medir el impacto en KL y en acuerdo top-1, con la metodologia de 64 sondas disjuntas que describe el autor.
- Despliegue sobre hardware legacy AMD: los shards `fp8_hot` estan pensados para 5x AMD MI50 con 128 GiB de HBM2 sobre un backplane Gen4; util para laboratorios con GPUs gfx906 retiradas y presupuesto limitado.
- Aceleracion con Tenstorrent: el directorio `hlut4_hot` se dirige a 2x Blackhole P150A con 64 GiB de GDDR6 y 241,3 MiB de SRAM Tensix, un escenario realista para equipos que evaluan silicio no-NVIDIA.
- Inferencia con offload a DDR4: el segmento `q5_ddr4` (336,43 GiB) esta disenado para un EPYC 7542 con 384 GiB de DDR4, lo que permite ejecutar la cola de expertos frios en CPU sin GPU dedicada.
- Procesamiento de documentos e imagenes de alta resolucion: el ViT dinamico admite entradas de hasta 1200x720 generando 897 tokens visuales, adecuado para OCR o comprension de documentos tecnicos.
- Evaluacion de fidelidad de cuantizacion: los datos de KL medio (0,055777 nats) y acuerdo top-1 (95,31%) permiten usar el paquete como referencia para validar pipelines de cuantizacion propios frente a un baseline declarado.
- Reproduccion de experimentos de contexto largo: la restauracion rapida de cache KV desde NVMe facilita iterar sobre prompts de 262K-512K tokens sin recalcular el prefill.

## Benchmarks y rendimiento

| Metrica | Resultado declarado | Referencia comparativa del autor |
|---|---|---|
| KL medio (64 sondas disjuntas) | 0,055777 ± 0,038450 nats | 0,083 nats en 2x GB300 MXFP4 (220.000 USD) |
| KL mediano | 0,001962 nats | no disponible |
| KL p95 | 0,169719 nats | no disponible |
| Acuerdo top-1 | 95,31% (61/64) | no disponible |
| EAR@10 | 84,69% | no disponible |
| GSM8K congelado (B=32, KV 2K) | 71/71 (100,00%, 0 errores) | no disponible |
| Decodificacion interactiva mono-stream | 3,55 tok/s (3,09-3,49 tok/s en vivo) | 2,85x superior a 2x GB300 FP8 por 10K USD de CapEx |
| Eficiencia por 10K USD de CapEx | 3,60 tok/s | 1,13x superior a 2x GB300 MXFP4 |
| Vision 640x448 -> 294 tokens | 11,40 s | no disponible |
| Vision 1200x720 -> 897 tokens | 14,75 s | no disponible |
| Restauracion `.kvblk` en frio | 21.651 tok/s (262K); 21.524 tok/s (512K) | no disponible |

Estos numeros proceden exclusivamente de la model card del autor y no se han verificado de forma independiente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K en configuracion estandar) en la informacion disponible.

## Requisitos de hardware

- VRAM y memoria agregada: el autor describe un ensamblaje de 128 GiB de HBM2 (5x MI50) + 64 GiB de GDDR6 y 241,3 MiB de SRAM (2x Blackhole P150A) + 384 GiB de DDR4 (EPYC 7542), es decir, un sistema heterogeneo de aproximadamente 576 GiB de memoria combinada mas el almacenamiento NVMe para `.kvblk`.
- GPU recomendadas por segmento: AMD MI50 (gfx906) para `fp8_hot`; Tenstorrent Blackhole P150A para `hlut4_hot`; CPU EPYC 7542 para `q5_ddr4`. No se documenta soporte para A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no. El modelo completo no cabe en ninguna GPU consumer; el autor no reporta configuraciones para RTX 4090 o similares.
- Opciones de despliegue: el autor proporciona codigo C++17 puro con HIP para gfx906, C++20 TT-Metalium para Blackhole y rutas AVX2 para CPU, sin Python. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,55 tok/s en decodificacion mono-stream interactiva; 2,33 tok/s en la prueba GSM8K; 11,40-14,75 s por imagen en el ViT; 21.524-21.651 tok/s en restauracion de cache KV desde NVMe.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-770B-WHT128-HLUT | 770B | 49B | 512K KV declarado | Apache 2.0 | Hugging Face (repo de 78,1 GB) |
| tencent/Hy4 (base) | 770B | 49B | no disponible | no disponible en la informacion | Hugging Face |
| 2x GB300 MXFP4 (referencia del autor) | no aplica (sistema) | no aplica | no disponible | no aplica | Comercial, 220.000 USD |
| 2x GB300 FP8 (referencia del autor) | no aplica (sistema) | no aplica | no disponible | no aplica | Comercial, 220.000 USD |

No se dispone de datos suficientes para comparar con alternativas MoE de escala similar (por ejemplo, otros modelos de 600-800B) en parametros, contexto y rendimiento dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Los benchmarks y la telemetria proceden unicamente de la model card del autor y no cuentan con verificacion independiente; deben tratarse como cifras no auditadas.
- El throughput declarado (3,55 tok/s) es muy bajo para uso interactivo en produccion y solo tiene sentido en escenarios de investigacion o experimentacion.
- El despliegue requiere hardware muy especifico (MI50 gfx906, Tenstorrent Blackhole, EPYC con 384 GiB DDR4) y codigo C++ propio; no hay integracion con los stacks habituales de inferencia.
- No se documentan los idiomas soportados, lo que impide garantizar calidad multilingue, incluido el castellano.
- No se confirma soporte de tool calling, function calling ni razonamiento agentico multi-paso.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los modelos MoE de gran escala suelen presentar este riesgo y aqui no hay evaluaciones de factualidad.
- Sesgos conocidos: no documentados.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base tencent/Hy4, cuya licencia no se detalla en la informacion disponible; conviene verificar la del modelo original antes de un uso productivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- El nombre del proyecto y las referencias a "Google DeepMind / Gemini" en la model card no estan respaldados por enlaces verificables en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kapitoshkina-ai/Hy4-770B-WHT128-HLUT
- Modelo base: https://huggingface.co/tencent/Hy4
- Repositorio de codigo del autor: https://github.com/bespokeontology/hy4-770b-wht128-192g
- Papers, blogs y demos adicionales: no disponible
