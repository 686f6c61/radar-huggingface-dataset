# AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-8bit

## Resumen

AX-Holo-3.1-35B-A3B-MLX-AXQ-8bit es un checkpoint cuantizado en formato MLX del modelo base Hcompany/Holo-3.1-35B-A3B, desarrollado por AutomatosX. Se trata de un modelo de lenguaje de arquitectura MoE (mixture of experts) basado en la familia Qwen3.5, con 35.11B parametros logicos y aproximadamente 3B activos por token, disenado para ejecutarse en Apple Silicon mediante el runtime MLX-LM. Incluye un sidecar de vision con pesos preservados en BF16, lo que permite tareas de vision-lenguaje ademas de generacion de texto.

La relevancia de este modelo radica en su cuantizacion mixta AXQuant (AXQ) de 8 bits, que reduce el peso de almacenamiento a unos 41.4 GB manteniendo los tensores criticos en BF16. El contexto maximo configurado es de 262,144 tokens, aunque el limite practico depende de la memoria unificada disponible. Es importante senalar que el paquete se presenta como evidencia de desarrollo, no como una version certificada: no se publican metricas de calidad, velocidad de kernel ni validacion de vision-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Qwen3_5MoeForConditionalGeneration) |
| Parametros totales | 35.11B logicos; 10.11B almacenados en safetensors |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 262,144 tokens (configurado; limite practico segun memoria unificada) |
| Tipos de cuantizacion | AXQ 8-bit mixto (8-bit + BF16); grupo de 64; metodos affine y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Holo-3.1-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5, con 35.11B parametros logicos y aproximadamente 3B activos por token. La cuantizacion AXQuant 1.8.1 aplica precision mixta: el 97.28% de los pesos (34.15B parametros) se cuantizan a 8 bits, mientras que el 2.72% restante (956.29M parametros) se mantiene en BF16 como proteccion. La asignacion de precision se basa en prioridades de arquitectura, sin calibracion con datos reales. El sidecar de vision contiene 333 tensores con 446.57M parametros en BF16 (0.89 GB). No se incluye sidecar MTP (multi-token prediction). El modelo no incorpora soporte de audio. Los detalles de entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat.
- Razonamiento y respuesta a instrucciones complejas gracias a la arquitectura MoE con 3B parametros activos.
- Capacidades de vision-lenguaje mediante el sidecar de vision en BF16 (333 tensores, 446.57M parametros), aunque la calidad no ha sido evaluada ni certificada.
- Soporte de contexto largo de hasta 262,144 tokens configurados, sujeto a la memoria unificada del dispositivo.
- Ejecucion nativa en Apple Silicon via MLX-LM, optimizada para hardware de la serie M.
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- No se documenta modo de pensamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el modelo esta optimizado para MLX-LM, lo que permite ejecutar un LLM de 35B con cuantizacion 8-bit en equipos con suficiente memoria unificada (64 GB o mas), sin necesidad de GPU dedicada.
- Prototipado rapido de aplicaciones conversacionales: su licencia Apache 2.0 y formato MLX facilitan la integracion en proyectos de desarrollo sin restricciones de uso comercial.
- Asistencia de codigo y documentacion tecnica: con 3B parametros activos y contexto de 262K tokens, puede procesar repositorios completos o documentacion extensa en una sola pasada.
- Analisis de documentos largos: la ventana de contexto amplia permite resumir o extraer informacion de manuales, informes o articulos cientificos extensos.
- Tareas de vision-lenguaje en local: el sidecar de vision en BF16 permite experimentar con descripcion de imagenes o preguntas visuales, aunque la calidad no esta certificada.
- Desarrollo de pipelines de generacion de texto en entornos Apple: ideal para equipos que trabajan con el ecosistema MLX y necesitan un modelo de tamano medio con cuantizacion eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publican metricas de calidad frente a BF16 o lineas base uniformes, y que no hay reclamaciones de retencion de calidad. Tampoco se proporcionan datos de velocidad de kernel, latencia ni throughput. El paquete no esta certificado como release formal de AXQuant (los gates M0-M8 no estan cerrados).

## Requisitos de hardware

- Dispositivo: Apple Silicon (serie M) obligatorio; el modelo esta en formato MLX y no es compatible con CUDA ni ROCm.
- Almacenamiento: al menos 41.37 GB de espacio libre en disco para la descarga completa.
- Memoria unificada: se estiman ~42-48 GB minimos para cargar el modelo en memoria (35.11B parametros a ~9.42 BPW); se recomiendan 64 GB o mas para operar con comodidad y margen para el contexto largo.
- GPUs compatibles: no aplica; el modelo usa la NPU/GPU integrada de Apple Silicon via MLX.
- Runtime principal: MLX-LM (version registrada en la conversion: MLX 0.32.0 y MLX-LM 0.31.3).
- Opciones de despliegue: MLX-LM para inferencia de texto; el sidecar de vision puede requerir manejo manual ya que MLX-LM puede ignorar los metadatos de AXQuant y los sidecars opcionales.
- AX Engine: no se incluye manifest nativo validado, por lo que la ejecucion via AX Engine no esta establecida.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Holo-3.1-35B-A3B (este) | 35.11B | ~3B | 262K | Apache 2.0 | MLX Safetensors |
| Qwen3-30B-A3B | ~30.5B | ~3.3B | 128K | Apache 2.0 | PyTorch, GGUF, MLX |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | PyTorch, GGUF |

El modelo comparte arquitectura MoE con Qwen3-30B-A3B, pero ofrece un contexto configurado mayor (262K frente a 128K) y un formato nativo MLX con cuantizacion AXQ. Frente a Mixtral 8x7B, presenta menos parametros activos (3B frente a 12.9B), lo que implica menor coste por token, aunque no se dispone de datos de rendimiento para comparar calidad. No se dispone de benchmarks publicados para ninguno de los tres en esta comparativa.

## Limitaciones y advertencias

- Paquete no certificado: se presenta como evidencia de desarrollo, no como release formal de AXQuant; los gates M0-M8 no estan cerrados.
- Sin metricas de calidad publicadas: no hay datos de retencion de calidad frente a BF16 ni benchmarks de referencia.
- Calibracion ausente: la asignacion de precision se basa en prioridades de arquitectura, no en calibracion con datos reales.
- Vision-lenguaje no evaluado: los tensores de vision se preservan en BF16, pero la calidad de las tareas de vision no ha sido medida ni reclamada.
- Contexto largo no validado: la capacidad de 262,144 tokens es configuracion de metadatos, no una reclamacion validada de calidad en contexto largo.
- Limitado a Apple Silicon: no es ejecutable en GPUs NVIDIA o AMD sin conversion previa a otro formato.
- MLX-LM puede ignorar metadatos AXQuant y sidecars opcionales, lo que afecta a la fidelidad de la cuantizacion y a las capacidades de vision.
- Sin soporte MTP: no incluye multi-token prediction, lo que puede limitar la velocidad de generacion frente a modelos que si lo implementan.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgos ni de fiabilidad factual; aplican los riesgos habituales de los LLM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-8bit
- Modelo base: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B
- Hermano 4-bit: https://huggingface.co/AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-4bit
- Hermano 6-bit: https://huggingface.co/AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Catalogo completo de modelos MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
