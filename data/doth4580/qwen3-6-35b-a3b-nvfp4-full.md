# doth4580/Qwen3.6-35B-A3B-NVFP4-FULL

## Resumen

Qwen3.6-35B-A3B-NVFP4-FULL es una variante cuantizada en NVFP4/FP8 del modelo Qwen3.6 35B-A3B del equipo Qwen de Alibaba, publicada por el usuario doth4580. El artefacto no es un modelo nuevo: es una conversión de pesos del modelo original (Apache-2.0) orientada específicamente a ejecutarse con el motor de inferencia veloGB10 (gb10_inference) sobre hardware NVIDIA DGX Spark / GB10. El modelo base es un MoE híbrido de 35.951.822.704 parámetros totales con aproximadamente 3B parámetros activos por token, lo que lo sitúa en la categoría de modelos grandes pero de coste de cómputo por token relativamente bajo.

La relevancia de esta ficha está en la combinación de tres factores: una arquitectura de atención híbrida (30 capas GatedDeltaNet de atención lineal con estado recurrente de tamaño fijo más 10 capas de GQA completa), un contexto declarado de 262.144 tokens y una cuantización NVFP4 aplicada a todas las GEMMs, incluida la cabeza MTP (multi-token prediction) nativa usada para decodificación especulativa. El paquete en disco ocupa 20 GB y se distribue en formato `nvfp4-pack-quantized` compatible con compressed-tensors, de modo que puede leerse con frameworks distintos de veloGB10, aunque el autor indica que está validado y ajustado para ese motor.

El modelo está pensado para despliegues en clústeres pequeños de GB10 (TP=1, TP=2 y TP=4), con servidor compatible con la API de OpenAI en el puerto 9000, caché de prefijos y decodificación especulativa. El tokenizador y la plantilla de chat se mantienen intactos respecto al modelo original; solo los pesos han sido modificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 30 capas GatedDeltaNet (atención lineal) + 10 capas GQA completa; hidden 2048; 256 expertos top-8 + 1 compartido |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | ~3B (MoE, top-8 de 256 expertos + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 en todas las GEMMs (esquema `nvfp4-full`, incluida la cabeza MTP); etiqueta de 8 bits en Hugging Face; `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (no declarados en la model card del artefacto) |
| Licencia | Apache-2.0 (modelo base de Qwen; licencia incluida en el repo) |
| Formato de pesos | safetensors con layout compressed-tensors (`nvfp4-pack-quantized`) |
| Tamaño en disco | 20 GB (tamaño del repo 20,9 GB) |
| Vocabulario | 248.320 tokens |
| Cabeza MTP | Nativa, multi-token prediction, usada para decodificación especulativa |
| Creado / actualizado | 2026-07-20 / 2026-11-09 |
| Descargas / likes | 76 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una MoE híbrida con 30 capas de GatedDeltaNet y 10 capas de atención GQA completa, dimensión oculta 2048 y 256 expertos con enrutamiento top-8 más un experto compartido. Las capas GatedDeltaNet emplean atención lineal con estado recurrente de tamaño fijo, lo que reduce el coste de memoria de KV cache en secuencias largas frente a atención cuadrática tradicional, mientras que las capas GQA periódicas aportan recuperación de contexto global. El modelo incorpora además una cabeza nativa de multi-token prediction (MTP) que se aprovecha para decodificación especulativa en el motor veloGB10.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos ni sobre etapas de RLHF o DPO en la documentación proporcionada; esos detalles corresponden a la model card del modelo original Qwen/Qwen3.6-35B-A3B, que no se incluye en la información disponible. La innovación técnica destacable de este artefacto es la cuantización NVFP4 aplicada de forma uniforme a todas las GEMMs, incluida la cabeza MTP, condición que el autor señala como necesaria para que la especulación rinda en un MoE: si la cabeza de borrador no estuviera cuantizada, el coste de verificación anularía la ganancia. El paquete también está validado para decodificación especulativa greedy-lossless, servicio TP=2 en dos nodos y la suite completa de pruebas de corrección del motor.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 262.144 tokens.
- Modo de pensamiento (thinking) activado por defecto en las mediciones del autor; el sampler por defecto del paquete se usa en producción.
- Decodificación especulativa nativa mediante la cabeza MTP del propio modelo, con tasas de aceptación del borrador medidas entre 61,3% y 65,5%.
- Compatibilidad con un borrador externo (z-lab/Qwen3.6-35B-A3B-DFlash) mediante `--spec-source dflash`, con bloques de 16 tokens.
- Servicio de API compatible con OpenAI (`/v1`) a través de veloGB10, con caché de prefijos y batching.
- Capacidades de código y de narración creativa evidenciadas en las pruebas de veloGB10 (turnos de código y de relato), aunque no se detallan benchmarks de calidad.
- Soporte de tool calling, function calling y razonamiento agéntico multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el vocabulario de 248.320 tokens sugiere cobertura amplia, pero no se declaran idiomas.
- Capacidades de visión o audio: no disponibles en este artefacto.

## Casos de uso

- Servicio de inferencia en un nodo GB10 único: el paquete está probado con TP=1 y ofrece decodificación de 66 tok/s de mediana en todos los turnos, 1.839 tok/s de prefill y 112 tok/s agregados con dos peticiones concurrentes; adecuado para asistentes internos con pocos usuarios simultáneos.
- Despliegue en dos GB10 con TP=2: el head envía a cada nodo solo su partición de pesos sobre RoCE y la cachea localmente, de modo que el segundo arranque no transfiere nada; útil para equipos que ya disponen de dos estaciones GB10 y necesitan mayor throughput (141 tok/s agregados con dos peticiones).
- Procesamiento de documentos largos: con 262.144 tokens de contexto y atención lineal en 30 de las 40 capas, el coste de KV cache crece de forma más contenida que en un transformer denso, lo que permite resumir o analizar contratos, informes o bases de código extensas en una sola pasada.
- Generación de código asistida con decodificación especulativa: los turnos de código alcanzan 78 tok/s en TP=1 y 115 tok/s en TP=2 con la cabeza MTP, lo que hace viable un copiloto de código interactivo sobre hardware de escritorio GB10.
- Narración y generación creativa por turnos: los turnos de relato sostienen 60 tok/s en TP=1 y 91 tok/s en TP=2, suficiente para interfaces conversacionales con streaming token a token.
- Investigación sobre cuantización NVFP4: al usar el layout estándar compressed-tensors, el artefacto sirve como referencia reproducible para medir el impacto de NVFP4 en calidad y velocidad frente a pesos BF16, incluida la cuantización de la cabeza MTP.
- Evaluación de decodificación especulativa: comparar la cabeza MTP nativa con el borrador DFlash de z-lab en la misma topología permite estudiar tasas de aceptación y latencia sin cambiar de modelo base.
- Clúster de cuatro GB10 con TP=4: pensado para cargas con más concurrencia (146 tok/s agregados con dos peticiones), aunque el decode por petición baja a 79 tok/s de mediana por el coste de comunicación entre nodos.

## Benchmarks y rendimiento

Las cifras siguientes son medidas por el autor con veloGB10 0.7.7 (builds de desarrollo, 2026-11-06 a 2026-11-08) sobre máquinas GB10 clase DGX Spark, con sampler de producción, thinking activado y una ejecución por celda; el propio autor indica una variación de ±10% entre ejecuciones muestreadas. Decode en tokens de salida por segundo, incluida decodificación especulativa.

| Topología | Borrador | Decode turno de código | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptación del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | MTP del paquete | 78 | 60 | 66 | 1.839 | 112 | 65,5% |
| TP=2 | MTP del paquete | 115 | 91 | 88 | 2.636 | 141 | 64,3% |
| TP=4 | MTP del paquete | 105 | 76 | 79 | 2.171 | 146 | 62,3% |
| TP=1 | z-lab DFlash | 95 | 66 | 73 | 1.973 | 117 | 61,3% |
| TP=2 | z-lab DFlash | 113 | 75 | 87 | 2.636 | 141 | 64,0% |
| TP=4 | z-lab DFlash | 108 | 74 | 89 | 2.184 | 146 | 63,8% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible; las cifras anteriores son exclusivamente de rendimiento de servicio.

## Requisitos de hardware

- VRAM/almacenamiento: el paquete ocupa 20 GB en disco en NVFP4; en TP=1 debe residir completo en la memoria unificada de un GB10.
- GPU recomendadas: NVIDIA DGX Spark / GB10. El artefacto está producido y validado para veloGB10 sobre estas máquinas; no se declara soporte probado en A100, H100 ni RTX 4090.
- Consumer GPU: no disponible. No hay evidencia de que el paquete funcione en GPUs de consumo; el formato compressed-tensors es legible por otros frameworks, pero el autor solo garantiza veloGB10.
- Topologías soportadas: TP=1 (un GB10), TP=2 (dos GB10, nodo secundario sin copia del modelo) y TP=4 (cuatro GB10). Los nodos reciben solo su partición de pesos por red y la cachean; con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev`.
- Despliegue: veloGB10 (`gb10_inference`) con servidor compatible con OpenAI en el puerto 9000; flags probados: `--kv-cache bf16`, `--fp8-prefill off`, `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 0`, `--prefix-cache on`, `--mtp=auto`. Borrador externo opcional con `--spec-source dflash --draft-dir ... --df2-block 16`.
- Latencia y throughput: prefill entre 1.839 y 2.636 tok/s según topología; decode mediano entre 66 y 89 tok/s; agregado con dos peticiones entre 112 y 146 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| doth4580/Qwen3.6-35B-A3B-NVFP4-FULL (este artefacto) | 35,95B | ~3B | 262.144 | NVFP4 (`nvfp4-pack-quantized`) | Apache-2.0 | Hugging Face, 76 descargas; validado para veloGB10 |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,95B | ~3B | 262.144 | BF16 (presumible, no confirmado en la información) | Apache-2.0 | Hugging Face |
| z-lab/Qwen3.6-35B-A3B-DFlash (borrador especulativo) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face; usado como borrador externo por veloGB10 |

No se dispone de datos sobre otras alternativas de la misma categoría (por ejemplo, variantes cuantizadas de otros MoE de ~35B) en la información proporcionada, ni de resultados de calidad comparables entre estos modelos.

## Limitaciones y advertencias

- Artefacto derivado, no modelo original: los pesos están modificados por cuantización NVFP4; cualquier evaluación de calidad debe contrastarse con el modelo base Qwen/Qwen3.6-35B-A3B.
- Validación restringida a veloGB10: el autor afirma que el paquete está producido, validado y ajustado para ese motor. Aunque el formato compressed-tensors es legible por otros frameworks, no se documenta comportamiento en vLLM, llama.cpp, Ollama o TGI.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares en la información disponible; las cifras de rendimiento son de servicio, no de precisión.
- Rendimiento medido de forma limitada: una ejecución por celda, builds de desarrollo de veloGB10 0.7.7 y variación declarada de ±10%; no son cifras de producción estabilizadas.
- TP=4 no mejora el decode por petición: la mediana baja a 79 tok/s frente a 88 tok/s en TP=2 por el coste de comunicación entre nodos, aunque el agregado sube a 146 tok/s.
- Idiomas no declarados: la model card del artefacto no enumera idiomas soportados; el vocabulario de 248.320 tokens no garantiza por sí solo calidad multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base antes de usarlo en producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no reclama propiedad sobre los pesos modificados y remite a la licencia del modelo original; conviene conservar el aviso de atribución a Qwen.
- Dependencia de hardware específico: el caso de uso principal (clúster GB10 con RoCE) limita la portabilidad; el nodo secundario no necesita copia del modelo, pero requiere conectividad RDMA adecuada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doth4580/Qwen3.6-35B-A3B-NVFP4-FULL
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Borrador especulativo DFlash: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
