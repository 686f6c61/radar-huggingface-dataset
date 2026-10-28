# LeoHyperlink/Sage-1.5-W4A16

## Resumen

Sage-1.5-W4A16 es una cuantizacion W4A16 del modelo InternScience/Sage-A1.5, un transformer MoE de la familia Qwen3.5 (clase `Qwen3_5MoeForConditionalGeneration`, 40 capas, 256 expertos con 8 activos por token, ~36B parametros segun la model card del autor) que incluye torre visual y cabeza de prediccion multi-token (MTP). El checkpoint lo publica el usuario LeoHyperlink con el objetivo explicito de servir el modelo con baja latencia en GPUs Intel Arc, usando el formato `compressed-tensors` pack-quantized que vLLM lee de forma nativa.

El problema que resuelve es de despliegue: los pesos en BF16 no caben con holgura en una GPU de 32 GB, y esta version comprime los pesos a int4 simetrico con grupo 128, dejando las activaciones en fp16 (W4A16). El resultado son ~20 GB de pesos cuantizados en cuatro shards de safetensors, mas 1,7 GB de tensores BF16 sin cuantizar (MTP, torre visual y `lm_head`) empaquetados aparte.

Es relevante ahora porque demuestra una ruta de serving funcional en hardware Intel: 104,3 tokens/s en decodificacion mono-stream y 0,06 s de TTFT medidos sobre una Arc Pro B70, frente a los 60,0 tokens/s de un checkpoint de referencia de la misma caja. No es una release orientada a precision: el autor no ha ejecutado MMLU, GSM8K ni ninguna otra evaluacion de exactitud sobre esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion densa (`Qwen3_5MoeForConditionalGeneration`), 40 capas, 256 expertos con 8 activos; incluye torre visual y cabeza MTP |
| Parametros totales | ~36.000 millones segun la model card del autor; el recuento automatico de safetensors del repo indica 5.951.291.356, cifra inconsistente con los ~20 GB de pesos int4 (36B a ~4,25 bits/parametro dan ~19 GB) |
| Parametros activos | No disponible de forma explicita; la configuracion indica 8 expertos activos de 256 por token |
| Longitud de contexto | No disponible en la informacion; el autor sirvio el modelo con `--max-model-len 8192` |
| Tipos de cuantizacion | W4A16: pesos int4 simetrico con grupo 128, activaciones sin cuantizar (computo fp16); `lm_head`, `mlp.shared_expert_gate` por capa, torre visual y MTP se mantienen en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (compressed-tensors pack-quantized): `model-0000[1-4]-of-00004.safetensors` (20 GB) + `model_extra_tensors.safetensors` (1,7 GB, BF16) |
| Herramienta de cuantizacion | Intel auto-round 0.15.1 (`auto_round:llm_compressor`, export CT pack-quantized) |
| Calibracion | pile-10k por defecto: 128 muestras x 2048 tokens, optimizador por defecto de auto-round |
| Capas cuantizadas | 31.030 de 31.181 |
| Fecha de publicacion | 28 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin cambios estructurales: un transformer con mezcla de expertos de 40 capas, 256 expertos por capa y enrutamiento a 8 expertos por token, acompanado de una torre visual (el pipeline declarado es `image-text-to-text`) y de una cabeza MTP pensada para decodificacion especulativa. Este checkpoint no entrena nada: es una compresion post-entrenamiento en la que se cuantizaron 31.030 de las 31.181 capas con Intel auto-round 0.15.1 en modo `llm_compressor` con exportacion pack-quantized de compressed-tensors. El proceso de cuantizacion tardo aproximadamente 8,7 horas en una unica Intel Arc Pro B70.

Los detalles de innovacion vienen del lado del formato y del runtime, no del modelo. Los pesos se almacenan en int4 simetrico con grupo 128 y las activaciones se calculan en fp16, de modo que el kernel fusionado `XPUwNa16LinearKernel` del fork vLLM-XPU 0.32.0 puede ejecutar las multiplicaciones sin descuantizar a un buffer intermedio. `lm_head` y las compuertas de expertos compartidos se dejaron en BF16 para preservar la fidelidad de la salida, y los 785 tensores BF16 de MTP y vision se exportaron a un fichero aparte (`model_extra_tensors.safetensors`). `torch.compile` se desactivo de forma explicita porque el lowering de Triton (`make_ttgir`) falla en XPU con este grafo. No se dispone de informacion sobre el dataset de preentrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo chat, con plantilla `chat_template.jinja` incluida y API compatible con OpenAI (`/v1/chat/completions` con streaming).
- Razonamiento multi-turno dentro de la ventana configurada en el servicio (8.192 tokens en las pruebas del autor).
- Capacidad multimodal declarada a nivel de arquitectura: el modelo base es image-text-to-text y la torre visual viaja en BF16. No se ha ejercitado ni evaluado en este checkpoint.
- Decodificacion especulativa MTP: los pesos MTP existen y se conservan sin cuantizar, pero no estan activados por este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no documenta cobertura de idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Serving de chat de baja latencia en infraestructura Intel: el checkpoint esta pensado para desplegarse con vLLM-XPU 0.32.0 sobre una Arc Pro B70, con 104,3 tokens/s en decodificacion mono-stream y 0,06 s de TTFT, suficiente para interfaces conversacionales interactivas.
- Sustitucion de pesos BF16 para liberar VRAM: pasar de un checkpoint de ~36B en BF16 (unos 72 GB) a ~20 GB de pesos int4 permite servir el modelo en una sola GPU de 32 GB al 90% de ocupacion, manteniendo el mismo grafo.
- Backend de aplicaciones ya integradas contra la API de OpenAI: al exponer `/v1/chat/completions` con streaming, se puede apuntar un cliente existente al endpoint sin reescribir la capa de integracion.
- Procesamiento por lotes offline: la carga con transformers y los paquetes `compressed-tensors` + `llmcompressor` permite ejecutar generaciones fuera de linea, aceptando throughput de clase CPU, util para tareas de anotacion o sintesis no interactivas.
- Razonamiento y resumen sobre documentos de hasta 8.000 tokens: la ventana configurada cubre informes tecnicos, actas o hilos de correo completos en una sola pasada.
- Evaluacion y comparacion de stacks de cuantizacion: sirve como referencia reproducible (receta, calibracion, flags y hardware documentados) para medir W4A16 frente a MXFP4/FP8 en el mismo chasis Intel.
- Pruebas de carga y validacion de kernels XPU: el autor incluye un soak de 80 peticiones a 4 vias de concurrencia, replicable para caracterizar estabilidad antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exactitud (MMLU, GSM8K, HumanEval ni similares) en la informacion disponible: el autor indica explicitamente que es una release centrada en serving y que las puntuaciones del modelo base no se transfieren automaticamente.

Las unicas mediciones publicadas son de velocidad, tomadas en la misma maquina con el mismo protocolo (mono-stream, 128 tokens en streaming, temperatura 0, prompt "Explain why the sky is blue in one short paragraph", tokens contados despues del TTFT):

| Medicion | Sage-1.5-W4A16 (este repo) | intel-ai/Qwen3.6-35B-A3B-MXFP4-Mixed-FP8Attn-CT-AutoRound (referencia) |
|---|---|---|
| Decodificacion | 104,3 t/s | 60,0 t/s |
| TTFT | 0,06 s | 0,08 s |
| Backend | XPUwNa16LinearKernel (fusionado) | XPUExpertsMxFp4 + XPUMxFp8LinearKernel |

Comprobaciones adicionales declaradas: 8 de 8 prompts concurrentes coherentes y un soak de 80 peticiones con concurrencia 4 sin salidas corruptas. En pruebas A/B, activar cache KV en FP8 junto con prefix caching no movio la decodificacion mono-stream (102,4 frente a 104,3 t/s, dentro del ruido). El flag `VLLM_XPU_LM_HEAD_INT8=1` sugerido por el tuner no existe en la build usada y fue rechazado.

## Requisitos de hardware

- VRAM estimada: ~28,8 GB en uso durante el servicio (90% de 32 GB) con `--max-model-len 8192` y una sola GPU. Los pesos cuantizados ocupan ~20 GB y los tensores BF16 extra 1,7 GB adicionales (no cargables en vLLM 0.32.0 junto al checkpoint CT principal).
- GPU probada: Intel Arc Pro B70 de 32 GB (Battlemage Xe2, 256 motores XMX, 608 GB/s de ancho de banda), una unica unidad.
- Host de referencia: CPU de 64 nucleos y 251 GB de RAM.
- GPU consumer: no verificado. En una tarjeta de 24 GB (RTX 4090, RTX 3090) los ~20 GB de pesos dejan unos 4 GB para cache KV y activaciones, por lo que solo seria viable con contexto corto y lotes pequenos; es una estimacion basada en el tamano de los ficheros, no una medicion.
- Despliegue recomendado: fork vLLM-XPU 0.32.0 (`vllm-xpu-kernels` con `libgrouped_gemm_xe_2` y `fused_moe_interface`), torch 2.x +XPU y oneCCL. El vLLM upstream con CUDA tambien lee el formato compressed-tensors.
- Flags usados: `--trust-remote-code --max-model-len 8192 --gpu-memory-utilization 0.9 --language-model-only`, con fijacion de GPU mediante `ONEAPI_DEVICE_SELECTOR=level_zero:N`. `ZE_AFFINITY_MASK=0.0` rompe el arranque del motor en esta build (parseo entero de "0.0") y la build solo escucha en localhost.
- Alternativa: carga offline con transformers (requiere `compressed-tensors` y `llmcompressor`), con throughput de clase CPU; la ruta rapida es la fusionada de vLLM.
- Latencia y throughput medidos: 104,3 t/s de decodificacion y 0,06 s de TTFT en mono-stream. No hay datos de throughput agregado con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Sage-1.5-W4A16 (este repo) | ~36B (8/256 expertos activos) | No disponible; servido a 8.192 | W4A16 int4 g128, CT pack-quantized | Apache-2.0 | 104,3 t/s decodificacion, 0,06 s TTFT (Arc Pro B70) |
| InternScience/Sage-A1.5 (modelo base) | ~36B (8/256 expertos activos) | No disponible | BF16 | Apache-2.0 | No disponible |
| intel-ai/Qwen3.6-35B-A3B-MXFP4-Mixed-FP8Attn-CT-AutoRound | ~35B totales, ~3B activos (por nomenclatura del nombre) | No disponible | MXFP4 en expertos + FP8 en atencion | No disponible en la informacion | 60,0 t/s decodificacion, 0,08 s TTFT (misma caja) |

No se dispone de datos de benchmarks de exactitud ni de otras alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a tamano, formato y velocidad medida en el mismo hardware.

## Limitaciones y advertencias

- No se ejecutaron evaluaciones de exactitud sobre esta cuantizacion. Las puntuaciones del modelo base no son transferibles sin medir; cualquier uso en produccion requiere una evaluacion propia del dominio.
- La ruta multimodal (torre visual) viaja en BF16 y no fue ejercitada ni medida. Ademas, sus tensores estan en `model_extra_tensors.safetensors`, que vLLM 0.32.0 no puede cargar junto al checkpoint CT principal; el serving es solo texto con `--language-model-only`.
- La decodificacion especulativa MTP no esta habilitada: los pesos MTP se conservan sin cuantizar y el loader exige el formato CT empaquetado, por lo que no se aprovecha la aceleracion potencial.
- El soak de 80 peticiones es una prueba de humo, no una garantia. El autor advierte de una trampa conocida en la familia Qwen con `lm_head` sin cuantizar bajo concurrencia sostenida en algunas builds, que produce corrupcion de salida; hay que someter la carga real a prueba antes de desplegar.
- Cobertura de idiomas no documentada; no se puede asumir calidad en castellano ni en otros idiomas sin evaluacion previa.
- Sesgos: no disponible. No hay informacion sobre composicion del dataset del modelo base ni sobre mitigaciones aplicadas.
- Riesgo de alucinacion: no cuantificado en esta release; aplican los riesgos habituales de un modelo generativo sin evaluacion de fidelidad.
- Dependencia fuerte de un stack concreto: fork vLLM-XPU 0.32.0, torch +XPU y oneCCL. En otras builds cambian los kernels disponibles y el rendimiento medido no se reproduce.
- `torch.compile` esta desactivado en la receta por un fallo de Triton en XPU; no se debe esperar la aceleracion de compilacion en este hardware.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no impone restricciones de campo de uso, pero conviene revisar las condiciones del modelo base por si anaden terminos adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LeoHyperlink/Sage-1.5-W4A16
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales. Las herramientas citadas en la model card (Intel auto-round 0.15.1, compressed-tensors, vLLM-XPU, oneCCL) aparecen sin URL asociada.
