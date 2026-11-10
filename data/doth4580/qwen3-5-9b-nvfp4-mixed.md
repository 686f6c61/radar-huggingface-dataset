# doth4580/Qwen3.5-9B-NVFP4-MIXED

## Resumen

Esta ficha describe `doth4580/Qwen3.5-9B-NVFP4-MIXED`, una publicación de pesos cuantizados del modelo base `Qwen/Qwen3.5-9B` del equipo Qwen, distribuida por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de un paquete de cuantización en formato `compressed-tensors` con receta mixta NVFP4/FP8, generado con el cuantizador offline de veloGB10. El objetivo es servir el modelo en hardware NVIDIA GB10 (DGX Spark) con el motor de inferencia veloGB10, aunque el formato es estándar y otros frameworks que lean `compressed-tensors` pueden cargarlo.

El modelo base Qwen3.5-9B pertenece a la familia Qwen3.5, que según la model card original integra aprendizaje multimodal, eficiencia arquitectónica y escalado de aprendizaje por refuerzo. La información disponible en esta búsqueda solo incluye un fragmento inicial de la model card original, por lo que numerosos detalles del modelo base (composición del dataset, contexto nativo, idiomas, benchmarks) no están disponibles y se indican como tales.

El interés de esta publicación es operativo: ofrece pesos de 9.653.104.368 parámetros en un repositorio de 6,4 GB, lo que refleja una compresión agresiva respecto a los ~19 GB que ocuparían los pesos en BF16. La licencia es Apache 2.0, heredada del modelo original, y la relevancia actual radica en la posibilidad de desplegar un modelo de ~9,6B en un único nodo GB10 con decodificación especulativa mediante la cabeza MTP incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen3.5-9B; la model card original menciona fusión temprana multimodal, sin detallar la arquitectura completa) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens en la configuración probada con veloGB10 (`--max-seq-len 262144`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 en todas las GEMM excepto las proyecciones Gated DeltaNet, que van en FP8 (receta `all,gdn:fp8`); formato `nvfp4-pack-quantized` de `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout `compressed-tensors` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la mención a "fusión temprana multimodal" y a la existencia de proyecciones Gated DeltaNet, que la receta de cuantización trata de forma diferenciada en FP8. La presencia de Gated DeltaNet sugiere componentes de atención lineal o híbrida junto a mecanismos de atención convencionales, pero no se dispone de la especificación completa en esta búsqueda. Tampoco se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

Lo que sí está documentado es el proceso de cuantización: veloGB10 aplicó su cuantizador offline con receta `all,gdn:fp8`, manteniendo tokenizer, plantilla de chat y configuración originales salvo el bloque `quantization_config`. El paquete incluye una cabeza MTP (multi-token prediction) que el motor usa como fuente de borradores para decodificación especulativa, con tasas de aceptación medidas del 92,8 % en TP=1 y en torno al 54 % en TP=2 y TP=4.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5-9B es un modelo de lenguaje post-entrenado, según la model card original.
- Capacidades multimodales: la model card original menciona "fusión temprana multimodal" y "aprendizaje multimodal", lo que apunta a entrada de visión, aunque el detalle no está disponible en la información proporcionada.
- Decodificación especulativa: el paquete incluye cabeza MTP que veloGB10 usa como draft source, con aceptación medida del 92,8 % (TP=1) y ~54 % (TP=2/TP=4).
- Servido compatible con OpenAI: el motor veloGB10 expone un endpoint `/v1` compatible con la API de OpenAI.
- Caché de prefijos: soportada por el motor (`--prefix-cache on`).
- Tool calling, agentes, modo thinking y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en un único DGX Spark / GB10: cargar el paquete con `gb10_inference` en TP=1 permite servir el modelo con hasta 262.144 tokens de secuencia y lote de 2, con una mediana de decodificación de 36 tok/s en todas las vueltas y 59 tok/s en turnos de código.
- Asistente de código en estación de trabajo GB10: con 59 tok/s de decodificación en turnos de código y 2.022 tok/s de prefill, es adecuado para autocompletado y revisión de código en local sobre un solo nodo.
- Escalado horizontal con dos o cuatro GB10: en TP=2 se alcanzan 78 tok/s en código y 109 tok/s agregados con 2 peticiones; en TP=4, 90 tok/s en código y 143 tok/s agregados, útil para servir a un pequeño equipo sin copiar el modelo a los nodos (el head distribuye los pesos).
- Procesamiento de documentos largos: la ventana configurada de 262.144 tokens y la caché de prefijos permiten analizar contratos, informes o repositorios completos reutilizando el prefijo entre consultas.
- Generación creativa y narrativa: 47 tok/s en turnos de historia en TP=1 y 71 tok/s en TP=4, con `--default-presence-penalty 1.5` para reducir repeticiones en textos largos.
- Evaluación de cuantización NVFP4: el paquete sirve como referencia para medir el impacto de NVFP4+FP8 mixto frente al modelo base en tareas propias, usando el endpoint compatible con OpenAI.
- Integración en pipelines que ya leen `compressed-tensors`: al ser formato estándar, frameworks distintos de veloGB10 que soporten `nvfp4-pack-quantized` pueden cargarlo, aunque no se han validado en esta publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia con veloGB10 sobre GB10 (2026-11-06 a 2026-11-08, builds de desarrollo 0.7.7), con sampling de producción, thinking activado y decodificación especulativa incluida:

| Topologia | Fuente del draft | Decode código (tok/s) | Decode historia (tok/s) | Mediana decode todas las vueltas (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptación del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | cabeza MTP del paquete | 59 | 47 | 36 | 2.022 | 66 | 92,8 % |
| TP=2 | cabeza MTP del paquete | 78 | 63 | 58 | 2.442 | 109 | 54,2 % |
| TP=4 | cabeza MTP del paquete | 90 | 71 | 74 | 2.005 | 143 | 53,7 % |

Una ejecución por celda; el autor indica variación de aproximadamente ±10 % entre ejecuciones muestreadas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,4 GB, por lo que los pesos cuantizados caben holgadamente en la memoria unificada de un GB10; el espacio adicional para KV cache depende de la longitud de secuencia (hasta 262.144 tokens configurados) y del lote (2 peticiones en la configuración probada).
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 máquinas con tensor parallelism (TP=1, TP=2, TP=4). No se documenta soporte para otras GPU en esta publicación.
- GPU de consumo: no disponible; no se ha validado en RTX 4090 u otras tarjetas consumer en la información proporcionada.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario autocontenido, servidor compatible con OpenAI en el puerto 9000). Al ser `compressed-tensors` estándar, otros frameworks que lean `nvfp4-pack-quantized` podrían cargarlo, pero no se han probado aquí.
- Red: en TP=2/TP=4 los nodos no necesitan copia del modelo; el head transfiere los pesos por red y los cachea localmente. Con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: ver tabla de benchmarks; prefill entre 2.005 y 2.442 tok/s y decode mediano entre 36 y 74 tok/s según topología.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de calidad del modelo base ni de alternativas en la información proporcionada, por lo que la comparativa se limita a aspectos de empaquetado y licencia.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/Qwen3.5-9B-NVFP4-MIXED | 9.653.104.368 | hasta 262.144 (config. veloGB10) | NVFP4 + FP8 mixto, `compressed-tensors` | Apache 2.0 | Hugging Face, repo de 6,4 GB |
| Qwen/Qwen3.5-9B (base) | no disponible en esta busqueda | no disponible | BF16 (formato Transformers) | Apache 2.0 | Hugging Face |
| Alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización NVFP4/FP8 es una modificación de los pesos originales; puede introducir degradación de calidad respecto al modelo base en tareas sensibles, y no se han publicado evaluaciones comparativas en esta información.
- El paquete está publicado y probado principalmente para veloGB10 sobre GB10; el soporte en otros frameworks que lean `compressed-tensors` no está validado por el autor.
- La model card original está reproducida solo parcialmente en la información disponible; faltan detalles de entrenamiento, idiomas, sesgos y evaluación.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben asumirse los del modelo base, no evaluados aquí.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo original y el autor del paquete no reclama propiedad intelectual sobre pesos ni arquitectura; cualquier uso debe respetar la licencia de Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Las cifras de rendimiento provienen de builds de desarrollo de veloGB10 0.7.7, con una sola ejecución por celda y variación de ±10 %; no deben tomarse como garantía de producción.
- La configuración probada usa `--max-batch 2` y `--max-tokens 65536`; lotes mayores o secuencias más largas pueden requerir más memoria y reducir el throughput.

## Enlaces

- Repositorio del paquete cuantizado: https://huggingface.co/doth4580/Qwen3.5-9B-NVFP4-MIXED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Qwen Chat: https://chat.qwen.ai
