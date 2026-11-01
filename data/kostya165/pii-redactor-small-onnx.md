# Kostya165/pii-redactor-small-ONNX

## Resumen

`Kostya165/pii-redactor-small-ONNX` es la exportación a ONNX en FP32 del modelo `Horizon-Labs/pii-redactor-small`, un clasificador de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos multilingües. El modelo original está construido sobre mmBERT-small, una variante de la familia ModernBERT con 141 millones de parámetros, y reconoce 29 tipos distintos de PII mediante etiquetado BIO. Esta versión ONNX mantiene los pesos en precisión completa y expone una única entrada/salida estática por fichero, lo que simplifica su despliegue en entornos sin PyTorch.

La relevancia de esta ficha radica en su orientación a producción: el formato ONNX permite ejecutar el modelo con ONNX Runtime en CPU o GPU, integrarlo en pipelines de redacción de datos y combinarlo con servidores de inferencia como Triton. El modelo cubre 19 idiomas declarados (inglés, alemán, francés, español, italiano, neerlandés, portugués, polaco, ruso, ucraniano, turco, árabe, hindi, chino, japonés, coreano, vietnamita, indonesio y tailandés), lo que lo hace útil para flujos de anonimización multilingües.

El repositorio ocupa 0,6 GB y contiene un único `model.onnx` de aproximadamente 565 MB (opsets 18, sin datos externos). La licencia es Apache-2.0, igual que el modelo base, con la obligación de mantener la atribución a los datos de entrenamiento originales (ai4privacy OpenPII, CC-BY-4.0, y NVIDIA Nemotron-PII).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small), transformer encoder con atención de ventana deslizante de 128 tokens |
| Parametros totales | 141 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el export se trazó a longitud 300; la atención usa ventana deslizante de 128 tokens) |
| Tipos de cuantizacion | FP32 (única versión publicada en este repo); el modelo base podría admitir otras, pero no se documentan aquí |
| Idiomas soportados | multilingual, en, de, fr, es, it, nl, pt, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 18, sin datos externos); tokenizer en formato HuggingFace |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT en su variante mmBERT-small, con 141 millones de parámetros. La arquitectura incorpora atención con ventana deslizante de 128 tokens, lo que reduce el coste computacional en secuencias largas. La tarea es clasificación de tokens con esquema BIO sobre 29 tipos de PII, lo que produce 59 etiquetas de salida (etiqueta `O` más `B-`/`I-` por cada tipo). La salida del grafo ONNX es un tensor `logits` de forma `[batch, sequence, 59]` en float32, con `batch` y `sequence` dinámicos.

El export se realizó con `torch.onnx.export(dynamo=True)` a partir de los pesos PyTorch, forzando `attn_implementation="eager"` y trazando a longitud de secuencia 300 para ejercitar la ruta de atención con ventana deslizante. La validación reportada por el autor muestra coincidencia de etiquetas argmax en todos los tokens no rellenados para lotes de 1 a 3 y longitudes 3, 64, 200, 512 y 1500, con una diferencia máxima absoluta de logits de 2,3e-4 frente a PyTorch FP32. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; solo se indica que el modelo base se entrenó con datos CC-BY-4.0 de ai4privacy (OpenPII) y NVIDIA (Nemotron-PII).

## Capacidades

- Detección de PII en texto con etiquetado BIO sobre 29 tipos distintos (el listado concreto no se detalla en la información disponible).
- Clasificación de tokens a nivel de subtoken, con salida de logits por token y etiqueta.
- Soporte multilingüe declarado para 19 idiomas, incluyendo lenguajes con alfabetos no latinos (árabe, hindi, chino, japonés, coreano, ruso, ucraniano, tailandés).
- Procesamiento por lotes con formas dinámicas de batch y secuencia.
- Ejecución en CPU y GPU mediante ONNX Runtime; compatible con servidores de inferencia tipo Triton (etiqueta `triton` en el repo).
- No es un modelo generativo: no produce texto, no soporta tool calling, no implementa razonamiento multi-paso ni agentes, y no tiene capacidades de visión o audio.

## Casos de uso

- Redacción de PII en pipelines de datos de entrenamiento: el modelo etiqueta nombres, correos, teléfonos y otras entidades en corpus multilingües antes de almacenarlos o compartirlos, usando ONNX Runtime en CPU para evitar dependencias de GPU en el preprocesado.
- Cumplimiento de RGPD en registros de aplicaciones: integrado como paso previo al envío de logs a un sistema de observabilidad, permite enmascarar identificadores personales en 19 idiomas con una latencia baja gracias a los 141 M de parámetros.
- Anonimización de transcripciones de atención al cliente: al procesar conversaciones multi-turno, el modelo detecta entidades en cada intervención y permite sustituirlas por marcadores antes de almacenar el histórico.
- Saneado de datasets para fine-tuning: antes de publicar un corpus, se ejecuta el modelo sobre cada documento para eliminar correos, teléfonos y nombres, manteniendo la atribución de licencia del modelo base.
- Servicio de redacción como API interna: desplegado en Triton con el backend ONNX, el modelo puede atender peticiones concurrentes de otras aplicaciones internas que necesiten verificar si un texto contiene PII antes de persistirlo.
- Preprocesado en entornos sin PyTorch: al ser un único fichero ONNX sin datos externos, se puede empaquetar en contenedores ligeros (por ejemplo, basados en `onnxruntime` y `transformers` solo para el tokenizer) para despliegues en edge o en clústeres con restricciones de dependencias.
- Filtrado previo a sistemas generativos: colocado delante de un LLM, el modelo puede marcar o bloquear prompts que contengan datos personales antes de que se envíen a un proveedor externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una validación de equivalencia numérica frente a PyTorch FP32: coincidencia de etiquetas argmax en todos los tokens no rellenados para lotes de 1 a 3 y longitudes 3, 64, 200, 512 y 1500, con diferencia máxima absoluta de logits de 2,3e-4.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de FP32 con 141 M de parámetros, los pesos ocupan aproximadamente 565 MB; el consumo total depende del tamaño de lote y de la longitud de secuencia, pero cabe holgadamente en GPUs de 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4); para lotes grandes o secuencias largas, A10G, L40S, A100 o H100 ofrecen mayor margen.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM; también se puede ejecutar en CPU con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), servidor de inferencia Triton con backend ONNX, y cualquier runtime compatible con ONNX (por ejemplo, integraciones en Python con `onnxruntime`). No se documentan despliegues vía vLLM, llama.cpp, Ollama o TGI, que no aplican a un encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Kostya165/pii-redactor-small-ONNX | 141 M | no disponible (ventana deslizante de 128) | Clasificación de tokens PII (29 tipos) | Apache-2.0 | ONNX FP32 |
| Horizon-Labs/pii-redactor-small | 141 M | no disponible | Clasificación de tokens PII (29 tipos) | Apache-2.0 | PyTorch (safetensors, presumiblemente) |
| Modelos NER multilingües genéricos (p. ej. variantes de XLM-R base) | ~278 M | 512 típicamente | NER general, no específico de PII | variable | safetensors, ONNX en algunos casos |

La comparación con alternativas concretas de detección de PII no está disponible en la información proporcionada; los modelos NER multilingües genéricos suelen tener más parámetros y no están especializados en los 29 tipos de PII que cubre este modelo.

## Limitaciones y advertencias

- El modelo es un clasificador de tokens: no genera texto redactado, solo etiqueta; la sustitución o enmascaramiento debe implementarla la aplicación que lo consume.
- No se documentan los 29 tipos concretos de PII ni las métricas de precisión/recall por tipo, lo que dificulta evaluar su idoneidad para casos regulados.
- El export se validó a longitudes de hasta 1500 tokens; no se especifica el contexto máximo efectivo del modelo base, por lo que secuencias muy largas podrían degradar la calidad.
- El rendimiento en idiomas distintos del inglés no está cuantificado en la información disponible; la cobertura de 19 idiomas es declarativa.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección, con impacto directo en la privacidad si se usa como única barrera.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener el aviso de atribución a los datos de entrenamiento originales (ai4privacy OpenPII, CC-BY-4.0, y NVIDIA Nemotron-PII) al redistribuir derivados.
- El repositorio tiene un uso muy bajo (34 descargas, 0 likes) en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kostya165/pii-redactor-small-ONNX
- Modelo base: https://huggingface.co/Horizon-Labs/pii-redactor-small
- Dataset ai4privacy OpenPII (mencionado como fuente de entrenamiento): no disponible enlace directo en la información proporcionada
- Dataset NVIDIA Nemotron-PII (mencionado como fuente de entrenamiento): no disponible enlace directo en la información proporcionada
- Documentación de ONNX Runtime: no incluida en la información proporcionada
