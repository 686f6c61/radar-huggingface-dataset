# oxpuppy635/Goetia-26B-NVFP4

## Resumen

Goetia-26B-NVFP4 es un checkpoint cuantizado a 4 bits en formato NVFP4 del modelo Goetia-26B, una arquitectura basada en Gemma-4 MoE con 128 expertos enrutados. Lo publica el usuario oxpuppy635 en HuggingFace y su proposito es reducir la huella de memoria del modelo desde aproximadamente 52 GB en BF16 hasta unos 15 GB, manteniendo en BF16/FP32 las capas criticas para la precision numerica (embeddings, cabeza de clasificacion, normalizaciones y las compuertas de enrutamiento del MoE).

El problema que aborda es el coste de servir un modelo MoE de ~27.000 millones de parametros en hardware con memoria limitada. Al aplicar cuantizacion de punto flotante de 4 bits con micro-bloques de 16 elementos y escalas en float8_e4m3fn, el checkpoint cabe en una sola GPU de 24 GB, lo que habilita despliegues en una RTX 4090 o en aceleradores Blackwell con soporte nativo de FP4.

Es relevante ahora por dos motivos: por un lado, NVFP4 es el formato de compresion que NVIDIA esta empujando para inferencia de baja precision en Blackwell; por otro, este checkpoint es un ejemplo practico de hasta donde llega la cuantizacion selectiva en un MoE (se cuantizan atencion y expertos, se preserva el router). Conviene senalar que el repositorio no incluye evaluacion, dataset de entrenamiento ni especificacion de la ventana de contexto, y que acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE basado en Gemma-4 (`Gemma4ForConditionalGeneration`), 128 expertos enrutados |
| Parametros totales | 27.233.310.286 (~27,2 B) segun safetensors; la model card indica ~26 B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, bloques de 16 elementos, micro-escala float8_e4m3fn); capas preservadas en BF16/FP32 |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con esquema `compressed-tensors` (`nvfp4-pack-quantized`), 2 shards de ~7,5 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer con mezcla de expertos (MoE) de tipo Gemma-4, con 128 expertos enrutados y una clase de modelo `Gemma4ForConditionalGeneration`. La model card no documenta el numero de expertos activos por token, el tamano de las capas densas ni la dimension del estado oculto, por lo que no es posible derivar los parametros activos ni estimar el coste computacional por token con los datos disponibles. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del corpus ni si hubo fases de RLHF o DPO.

La innovacion tecnica del repositorio es exclusivamente la cuantizacion. Los pesos se representan en FP4 con formato E2M1 (1 bit de signo, 2 de exponente, 1 de mantisa) empaquetados en dos nibbles por byte, con un bloque de escalado compartido cada 16 elementos y micro-escalas en float8_e4m3fn. Se cuantizan todas las proyecciones densas de auto-atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las matrices de proyeccion de los 128 expertos (`experts.gate_up_proj`, `experts.down_proj`). Se mantienen en BF16/FP32 los embeddings de tokens, `lm_head`, las capas de normalizacion (`norm`, `attn_norm`, `layer_scalar`) y las compuertas y clasificadores de enrutamiento del MoE, una decision coherente con la sensibilidad del router a errores de cuantizacion. No se detalla el proceso de calibracion (dataset, numero de muestras, criterio de seleccion de escalas).

## Capacidades

- Generacion de texto en ingles con un modelo MoE de ~27 B de parametros totales.
- Razonamiento y respuesta conversacional multi-turno, condicionado a la ventana de contexto real del modelo base (no documentada).
- Generacion de codigo y texto tecnico: la model card no aporta evaluaciones que lo confirmen, por lo que debe validarse empiricamente.
- Soporte de tool calling / function calling: no documentado en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas a ingles segun el campo `language`; no hay evidencia de calidad en castellano.
- Capacidades multimodales: la clase de modelo (`Gemma4ForConditionalGeneration`) sugiere una arquitectura de generacion condicional, pero la model card no documenta vision ni audio y el pipeline declarado es `text-generation`. No confirmado.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia en una sola GPU de consumo: con ~15,6 GB de pesos, el modelo se puede cargar en una RTX 4090 (24 GB) dejando margen para cache KV y activaciones, lo que permite servir un MoE de ~27 B en estaciones de trabajo sin multi-GPU.
- Despliegue on-premise con requisitos de memoria estrictos: entornos con GPU de 24-48 GB donde un checkpoint BF16 de ~52 GB no cabe; util para prototipos internos en ingles.
- Evaluacion de tecnicas de compresion: sirve como caso de estudio para medir la perdida de calidad de NVFP4 frente a BF16 en un MoE con 128 expertos, comparando salidas sobre un conjunto de prompts fijo.
- Generacion de datos sinteticos en ingles: produccion por lotes de texto para aumento de dataset o preetiquetado, con throughput alto si se ejecuta sobre Blackwell con kernels FP4 nativos.
- Asistencia a la escritura tecnica y resumen de documentacion en ingles: tareas de transformacion de texto donde la latencia importa mas que el razonamiento profundo.
- Clasificacion y extraccion de informacion por lotes: pipelines offline de etiquetado o extraccion de entidades en ingles, con coste por token reducido gracias a la cuantizacion.
- Base para fine-tuning con QLoRA: al ocupar ~15 GB en FP4, deja espacio en VRAM para adaptadores y estados de optimizacion, aunque la compatibilidad de QLoRA con `compressed-tensors` NVFP4 debe verificarse en la practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con el checkpoint BF16, por lo que no es posible cuantificar la degradacion introducida por NVFP4.

## Requisitos de hardware

- VRAM para los pesos: ~15,6 GB (dos shards de ~7,5 GB).
- VRAM practica para inferencia: ~18-22 GB considerando cache KV, activaciones y buffers del runtime, dependiendo de la longitud de contexto (no documentada).
- GPU de consumo: RTX 4090 (24 GB) es la opcion viable; RTX 5090 (32 GB) da mas margen. En RTX 4080/5080 (16 GB) los pesos caben pero el overhead deja el sistema al limite y no se recomienda.
- GPU profesionales: L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) sobradas de memoria.
- Aceleracion FP4 nativa: requiere arquitectura Blackwell (B200/GB200, serie RTX 50). En Hopper o Ada las capas NVFP4 necesitan dequantizacion en tiempo de ejecucion o kernels de emulacion, con menor throughput y mayor consumo efectivo de VRAM.
- Despliegue: vLLM con soporte de `compressed-tensors`, TensorRT-LLM (flujo ModelOpt) y `transformers` con una version que soporte el esquema NVFP4. La compatibilidad con SGLang y otros runtimes debe validarse.
- llama.cpp / Ollama: no hay GGUF en el repositorio; requeriria reconversion y no se garantiza la preservacion del esquema de micro-escalas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Goetia-26B-NVFP4 | ~27,2 B (128 expertos) | no disponible | no disponible | apache-2.0 | safetensors NVFP4, ~15,6 GB |
| Goetia-26B (base, BF16) | ~26 B segun model card | no disponible | no disponible | no verificada en esta ficha | BF16, ~52 GB segun la model card |
| Qwen3-30B-A3B | 30,5 B (128 expertos, 8 activos) | 3,3 B | 262.144 tokens (configuracion nativa) | apache-2.0 | safetensors BF16 y multiples cuantizaciones GGUF/AWQ |
| Gemma 3 27B | 27 B (denso) | 27 B | 128.000 tokens | terminos de licencia Gemma | safetensors BF16 y cuantizaciones de la comunidad |

Los datos de Qwen3-30B-A3B y Gemma 3 27B provienen de su documentacion publica y se incluyen solo como referencia de categoria; no hay benchmarks de Goetia-26B-NVFP4 que permitan comparar calidad. Frente a ellos, la diferencia practica de este checkpoint es el formato NVFP4 compacto (~15,6 GB), que reduce el requisito de VRAM, a costa de depender de kernels y runtimes que soporten `compressed-tensors` NVFP4.

## Limitaciones y advertencias

- Ausencia total de evaluacion: cero descargas, cero likes y ninguna metrica publicada; no hay evidencia de que la cuantizacion preserve la calidad del modelo base.
- Procedencia del modelo base no verificada: la model card declara `base_model: Goetia-26B` pero no documenta quien entreno ese modelo, con que datos ni bajo que terminos, mas alla de la etiqueta apache-2.0.
- Posible conflicto de licencia: el tokenizador es de la familia Gemma y la arquitectura se declara derivada de Gemma-4, mientras la tarjeta aplica apache-2.0. Conviene revisar los terminos del modelo Gemma original antes de un uso comercial.
- Solo ingles declarado: no hay soporte ni evaluacion en castellano; el rendimiento en otros idiomas es impredecible.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Riesgo de alucinacion: inherente a los modelos generativos y potencialmente amplificado por la cuantizacion FP4 en las capas de expertos.
- Degradacion por cuantizacion: FP4 E2M1 tiene 1 bit de mantisa; aunque las micro-escalas cada 16 elementos mitigan el error, es esperable cierta perdida en tareas de matematicas y razonamiento preciso. No cuantificada.
- Dependencia de hardware: sin GPU Blackwell, el rendimiento puede degradarse notablemente por la dequantizacion en vuelo.
- Sesgos: no documentados; al no conocerse el corpus de entrenamiento no se puede evaluar el sesgo de genero, idioma o dominio.
- Sin garantias de produccion: no hay model card completa, ni informe de evaluacion, ni soporte del autor; tratar como checkpoint experimental.

## Enlaces

- HuggingFace: https://huggingface.co/oxpuppy635/Goetia-26B-NVFP4
- Modelo base declarado: Goetia-26B (no se ha proporcionado enlace directo en la informacion disponible)
- Especificacion de `compressed-tensors`: https://github.com/neuralmagic/compressed-tensors
- Referencia a NVFP4 citada en la model card: no disponible como URL resoluble
