# Launch80/Qwen3.8-27B-PARO-int5

## Resumen

Qwen3.8-27B-PARO-int5 es un checkpoint cuantizado a 5 bits del modelo base Qwen/Qwen3.8-27B, publicado por el usuario Launch80 bajo licencia Apache 2.0. No se trata de una cuantización convencional: combina pesos int5 asimétricos uniformes (grupo de 128 a lo largo de K, escalas y zero points en fp16, 5,25 bits/peso efectivos) con las rotaciones de Givens por pares aprendidas por ParoQuant (z-lab, ICLR'26), reutilizadas sin modificar desde z-lab/Qwen3.8-27B-PARO. El objetivo declarado es la fidelidad distribucional: es el hermano "fidelity-first" del checkpoint Qwen3.8-27B-PARO-MXFP4, con 4,2 veces menos divergencia KL a cambio de 2,6 ms más por paso y 3 GB adicionales en disco.

El modelo está construido específicamente para AMD RDNA4 (Radeon AI PRO R9700, gfx1201) y se sirve mediante una ruta W5A8 fp8-WMMA en una versión parcheada de vLLM. No es cargable con transformers ni con vLLM estándar: requiere el plugin de cuantización `paroquant` del repositorio radiance-vllm-mxfp4, que compila los kernels en contenedor sobre ROCm. La relevancia actual del checkpoint es doble: por un lado, demuestra que un esquema int5 puede mantener la exactitud aritmética de los códigos en e4m3 (c-16 cubre -16..15, todos exactos en e4m3), lo que permite reutilizar sin cambios toda la álgebra del kernel int4; por otro, muestra que la granularidad de la activación (int8 por grupo en lugar de e4m3 por token) importa más que el formato en sí.

El repositorio declara el pipeline image-text-to-text y la etiqueta conversational, con plantilla de chat, tokenizer y generation config de Qwen. El recuento de parámetros reportado en safetensors es de 7.088.303.344, una cifra que no coincide con el "27B" del nombre ni con los 21,9 GB del repositorio a 5,25 bits/peso, por lo que conviene tratar el dato con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Checkpoint de cuantizacion sobre Qwen/Qwen3.8-27B; las etiquetas del repo indican qwen3_5 y conversational, pero la model card no describe la arquitectura subyacente |
| Parametros totales | 7.088.303.344 segun safetensors; el nombre del modelo indica 27B. Dato en conflicto (ver limitaciones) |
| Parametros activos | No aplica segun la informacion disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible en la model card. Las mediciones de servicio se realizaron hasta 64k tokens de contexto |
| Tipos de cuantizacion | int5 asimetrico uniforme, grupo 128 a lo largo de K, escalas y zero points en fp16, 5,25 bits/peso efectivos. Formato "int5-bitplane". No incluye GGUF ni otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors. Empaquetado "int5-bitplane": qweight/qzeros guardan los cuatro bits bajos en el empaquetado int4 de AWQ y qweight_hi/qzeros_hi son planos del quinto bit de forma [K, N/32] en int32. lm_head y embeddings en bf16 |
| Tamano del repositorio | 21,9 GB |
| Configuracion de cuantizacion | quant_method = "paroquant", bits = 5, format = "int5-bitplane", group_size = 128, krot = 8 |
| Rotaciones | Rotaciones de Givens por pares aprendidas (pairs, theta, 8 capas de 64 pares disjuntos por grupo de 128 canales) y channel_scales preinvertidas, heredadas de z-lab/Qwen3.8-27B-PARO |
| Identidad de inferencia | y = ((x * channel_scales) R^T) dequant(Q)^T |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base (transformer, MoE, híbrida u otra), solo que se trata de una cuantizacion de Qwen/Qwen3.8-27B con las etiquetas qwen3_5 y conversational. Lo que sí se detalla es el procedimiento de cuantizacion, que consta de cuatro pasos: se parte de los pesos bf16 del modelo base, se multiplican por las channel_scales de z-lab, se rotan con las rotaciones de ParoQuant y se cuantizan en un solo paso a int5 con grupo 128 mediante RTN. Después se aplica un fine-tune de etapa 2 sobre los pesos y las escalas de grupo bajo la rejilla int5, manteniendo las rotaciones congeladas.

La innovación técnica principal es la elección de 5 bits en lugar de 4 o 6. El kernel int4 alimenta la WMMA fp8 con el código con signo c-8, exacto en e4m3; con códigos de 5 bits, c-16 abarca de -16 a 15 y todos los enteros de ese rango también son exactos en e4m3, de modo que la álgebra del GEMM, el plegado del zero-point, la cuantizacion de activaciones por token, los productores del flujo de rotaciones y las bandas split-K / A-tiled se reutilizan sin cambios. Solo cambia la preparación de pesos: los nibbles bajos conservan el layout existente y el quinto bit viaja en un plano de un byte por (slot, lane) en el mismo orden de fragmento. int6 no posee esta propiedad y exigiría una reescritura con WMMA int8.

La ganancia de fidelidad se desglosa de forma acumulativa en la propia model card: escalas de grupo en fp16 en lugar de exponentes compartidos e8m0 (-32% de KL), el quinto bit (de 0,0285 a 0,0155), el fine-tune de etapa 2 (hasta 0,0126) y activaciones int8 por grupo en lugar de e4m3 por token (hasta 0,0097). No se documentan datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF o DPO) porque el checkpoint es una cuantizacion, no un modelo entrenado desde cero.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es image-text-to-text y la etiqueta conversational está presente, con tokenizer, plantilla de chat y generation config de Qwen.
- Entrada multimodal: la etiqueta image-text-to-text del repositorio implica entrada de imagen y texto, aunque la model card no detalla el alcance ni el comportamiento de las capacidades de visión.
- Razonamiento matemático: el único benchmark de tarea reportado es GSM8K, con un 97,40% en 500 preguntas en modo greedy sobre la ruta servida.
- Fidelidad distribucional: KL(bf16 || candidato) de 0,0070 en top-5 y 0,0100 en top-256 sobre wikitext, con un acuerdo top-1 del 95,21% frente a la referencia bf16 servida en el mismo stack.
- Apto para decodificación especulativa: la model card lo señala explícitamente como adecuado para trabajos sensibles a logprobs y para la aceptación de modelos draft, gracias a su baja divergencia respecto al bf16.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no se documenta como capacidad nativa, pero la model card lo recomienda para cadenas agénticas largas donde las divergencias por token se acumulan.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- No incluye audio ni otras modalidades fuera de imagen y texto.

## Casos de uso

- Evaluación de esquemas de cuantización: el checkpoint sirve como referencia reproducible para medir el impacto de pasar de 4 a 5 bits, con métricas de KL, acuerdo top-1 y throughput comparadas contra int4 ParoQuant y PARO-MXFP4 en el mismo stack de servicio.
- Despliegue local en estaciones de trabajo RDNA4: con dos Radeon AI PRO R9700 en TP=2 y el plugin paroquant, se puede servir el modelo en hardware AMD sin depender de CUDA.
- Trabajo sensible a logprobs: tareas de reranking, clasificación con puntuaciones, evaluación de verosimilitud y detección de anomalías se benefician de un KL de 0,0100 nats frente al bf16, muy inferior al 0,0419 del hermano MXFP4.
- Decodificación especulativa en producción: al mantener una distribución de salida más cercana al modelo base, mejora la tasa de aceptación del modelo draft, lo que compensa parte del mayor coste por paso del kernel de 5 bits.
- Cadenas agénticas de contexto largo: con 760k tokens de KV cache disponibles en la configuración medida y prefill medido hasta 64k de contexto, es adecuado para flujos multi-paso donde pequeñas divergencias por token se acumulan a lo largo de la cadena.
- Razonamiento matemático asistido: el 97,40% en GSM8K (500 preguntas, greedy) lo sitúa como opción para resolución de problemas aritméticos con verificación paso a paso.
- Servicio multi-sesión con memoria ajustada: la combinación de fp8 KV y 760k tokens de caché permite atender varias conversaciones concurrentes en dos GPU de 32 GB.
- Investigación en formatos de pesos: el empaquetado int5-bitplane (nibbles bajos en layout int4 más planos de quinto bit) es un caso de estudio para quien diseñe kernels de cuantización que reutilicen la ruta fp8 WMMA existente.

## Benchmarks y rendimiento

Todas las cifras proceden de la model card y se midieron con 2 x R9700, TP=2, KV en fp8, drafter DFlash2-FP8 y SPEC=7. El KL es KL(bf16 || candidato) sobre wikitext, 96 fragmentos de 500 caracteres, top-256, con la referencia bf16 servida en el mismo stack.

| Metrica | int4 ParoQuant | PARO-MXFP4 | Este checkpoint (int5) |
|---|---|---|---|
| Bits por peso | 4,25 | 4,25 | 5,25 |
| KL top-5 | 0,0195 | 0,0296 | 0,0070 |
| KL top-256 | 0,0285 | 0,0419 | 0,0100 |
| Acuerdo top-1 | 91,5% | 90,3% | 95,21% |
| GSM8K, 500 preguntas, greedy, ruta servida | 97,4-98,0% | 97,4-97,6% | 97,40% |
| Paso de decodificacion (ctx 25 / 8k / 32k) | 23,5 ms | 23,3 ms | 25,90 / 27,46 / 28,19 ms |
| Prefill 2k / 8k / 32k / 64k (PP t/s) | 3808 / 3646 / 3495 / 3349 | 4770 / 4827 / 4495 / 4273 | 3941 / 3790 / 3616 / 3436 |
| Tokens de KV cache | 854k | 862k | 760k |
| Tamano en disco | 18 GB | 18 GB | 21 GB |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- Peso en disco de 21 GB. La VRAM necesaria para los pesos es del mismo orden (no se publica una cifra de VRAM medida); a ello hay que sumar la caché KV en fp8.
- Hardware objetivo: AMD RDNA4, gfx1201. Las mediciones se hicieron con 2 x Radeon AI PRO R9700 en tensor parallel 2.
- Cabe en GPU de gama profesional/consumo alto: dos tarjetas de 32 GB bastan para la configuración medida (TP=2, fp8 KV, drafter FP8). No hay datos de despliegue en una sola GPU ni en GPU de consumo NVIDIA.
- No hay soporte para CUDA en la informacion disponible: el plugin compila los kernels en contenedor sobre ROCm para gfx1201. Otro hardware requeriría portar el prólogo de rotación y el GEMM.
- Opciones de despliegue: exclusivamente el plugin `paroquant` incluido en radiance-vllm-mxfp4 (directorios `paroquant/` y `PAROQUANT.md`), con build de kernels en contenedor. No es cargable por transformers estándar ni por vLLM estándar. No se mencionan Ollama, llama.cpp, TGI ni GGUF.
- Comando de arranque indicado por el autor: `MODEL_DIR=Qwen3.8-27B-PARO-int5 MODE=prod SPEC=7 RADIANCE_PQ_I8=1 RADIANCE_PQ_PG=1 RADIANCE_PQ_ZPE=1 ./paroquant/run_paroquant.sh`, tras ejecutar `./setup-paroquant.sh`.
- Latencia medida: 25,90 ms por paso de decodificación a contexto 25, 27,46 ms a 8k y 28,19 ms a 32k.
- Throughput de prefill medido: 3941 t/s a 2k, 3790 t/s a 8k, 3616 t/s a 32k y 3436 t/s a 64k.
- Coste del kernel: a M<=8, el kernel de 5 bits consume entre 1,20 y 1,26 veces el de 4 bits, exactamente la ratio de bytes (1,235x), lo que indica que está limitado puramente por ancho de banda y no tiene penalización de desempaquetado.
- Memoria de caché: 760k tokens de KV cache en la configuración medida, frente a 854k (int4) y 862k (MXFP4).

## Comparativa con modelos similares

| Modelo | Quantizacion | KL top-256 | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-PARO-int5 (este) | int5 g128, 5,25 bits/peso, rotaciones ParoQuant | 0,0100 | 97,40% | Apache 2.0 | HuggingFace, requiere plugin paroquant sobre ROCm gfx1201 |
| Qwen3.8-27B-PARO-MXFP4 | MXFP4, 4,25 bits/peso | 0,0419 | 97,4-97,6% | No disponible | HuggingFace (referenciado en la model card) |
| int4 ParoQuant (variante sin identificador de repo) | int4, 4,25 bits/peso | 0,0285 | 97,4-98,0% | No disponible | No disponible |
| Qwen/Qwen3.8-27B (base bf16) | Sin cuantizar | Referencia (0 por definicion) | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| z-lab/Qwen3.8-27B-PARO | Rotaciones ParoQuant sobre el modelo base | No disponible | No disponible | No disponible | HuggingFace |

La model card es explícita acerca de la comparación: la exactitud en tareas no separa a las variantes (GSM8K entre el 97,4% y el 97,8% para todas, dentro del ruido con 500 preguntas); la diferencia es de fidelidad distribucional, con 0,0100 nats frente a 0,0419. Si se prioriza el throughput de prefill y el margen de KV cache, el autor recomienda PARO-MXFP4.

## Limitaciones y advertencias

- Conflicto en el recuento de parámetros: el repositorio declara 7.088.303.344 parámetros en safetensors, mientras que el nombre del modelo y el modelo base indican 27B. A 5,25 bits/peso, 7,09B parámetros ocuparían unos 4,65 GB, muy lejos de los 21,9 GB del repositorio, por lo que es probable que el recuento de safetensors no cubra todos los shards. Hay que verificar la cifra antes de usarla para planificar hardware o presupuesto de memoria.
- No es cargable con herramientas estándar: ni transformers ni vLLM sin parche soportan este checkpoint. La ruta de despliegue depende de un fork mantenido por terceros (radiance-vllm-mxfp4) y de compilación de kernels en contenedor.
- Dependencia de hardware: los kernels están escritos para ROCm sobre gfx1201 (RDNA4). No hay soporte CUDA documentado; portar el prólogo de rotación y el GEMM a otra plataforma es trabajo pendiente del usuario.
- Licencia Apache 2.0 declarada en el repositorio, pero el autor no detalla las condiciones del modelo base Qwen/Qwen3.8-27B ni de los artefactos de z-lab reutilizados (rotaciones y channel_scales). Conviene revisar la licencia del modelo base antes de un uso comercial.
- Riesgo de alucinación: no se documenta ninguna evaluación de veracidad ni de tasas de alucinación en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgos, ni la composición del dataset del modelo base.
- Idiomas soportados: no disponible. No hay confirmación de comportamiento multilingüe, pese a que el modelo base de Qwen suele serlo.
- Longitud de contexto: no publicada. Las mediciones llegan a 64k tokens de prefill, pero no se especifica la ventana máxima soportada por el modelo, lo que impide planificar despliegues largos con garantías.
- Marco de evaluación limitado: los únicos números de tarea son GSM8K y el KL sobre wikitext, ambos medidos en un stack concreto (2 x R9700, TP=2, fp8 KV, drafter FP8, SPEC=7). El propio autor advierte que una referencia bf16 recogida en una imagen distinta carga unas 0,018 nats de cuantización atribuibles a la numerología del stack de servicio, de modo que las cifras no son comparables fuera de ese entorno.
- Rendimiento inferior en prefill y mayor uso de disco que su hermano MXFP4 (21 GB frente a 18 GB) y menor caché KV (760k frente a 862k tokens).
- Repositorio sin tracción: cero descargas y cero "me gusta" en el momento de redactar esta ficha, lo que reduce la probabilidad de que los problemas de integración estén ya resueltos por la comunidad.
- Valores por defecto de configuración relevantes para reproducir: hay que activar RADIANCE_PQ_I8=1, RADIANCE_PQ_PG=1 y RADIANCE_PQ_ZPE=1, que corresponden a activaciones int8 por grupo y epílogo con zero-point.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Launch80/Qwen3.8-27B-PARO-int5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint de rotaciones de ParoQuant: https://huggingface.co/z-lab/Qwen3.8-27B-PARO
- Variante hermana en MXFP4: https://huggingface.co/Launch80/Qwen3.8-27B-PARO-MXFP4
- Repositorio del plugin y kernels: https://codeberg.org/ggz14/radiance-vllm-mxfp4 (rutas `paroquant/` y `PAROQUANT.md`)
- Paper ParoQuant, referenciado en la model card como ICLR'26: sin URL en la informacion disponible
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por la busqueda no guardan relacion con el checkpoint.
