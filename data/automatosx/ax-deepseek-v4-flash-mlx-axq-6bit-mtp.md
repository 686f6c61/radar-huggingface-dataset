# AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-6bit-MTP

## Resumen

AX-DeepSeek-V4-Flash-MLX-AXQ-6bit-MTP es un checkpoint cuantizado en formato MLX (Apple Silicon) del modelo DeepSeek-V4-Flash, desarrollado por AutomatosX. No es un modelo original, sino una conversión mixta de precisión del modelo base de DeepSeek, que emplea una arquitectura de mezcla de expertos (MoE) con 284.33 mil millones de parámetros lógicos y aproximadamente 13 mil millones de parámetros activos por token, según fuentes externas. El checkpoint aplica el cuantizador AXQuant en su clase de presupuesto de almacenamiento de 6 bits, manteniendo la cabecera de predicción multi-token (MTP) en BF16.

La relevancia de este lanzamiento radica en ofrecer una versión ejecutable en hardware Apple con memoria unificada, reduciendo el peso del modelo de su formato BF16 original a unos 208.66 GB (medidos en safetensors), con un coste medio de 5.74 bits por peso (BPW) incluyendo el sidecar MTP. Sin embargo, el propio autor advierte explícitamente de que se trata de una evidencia de desarrollo, no de una versión certificada: no se publican métricas de calidad, velocidad de kernels, ni validación de contexto largo. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

El checkpoint está orientado a inferencia de texto con MLX-LM, no incluye torre de visión ni audio, y su ventana de contexto configurada alcanza 1.048.576 tokens, aunque esta cifra es metadata de configuración y no una garantía validada de rendimiento a esa longitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM (mixture of experts, MoE) |
| Parametros totales | 284.33B lógicos (según model card); 59.197.329.495 según metadatos de safetensors (dato no coincidente con el anterior) |
| Parametros activos | ~13B por token (según fuentes externas; no confirmado en la model card) |
| Longitud de contexto | 1.048.576 tokens configurados (no validado) |
| Tipos de cuantizacion | AXQ 6-bit mixto: 4-bit (53.14%), 6-bit (43.70%), 8-bit (0.18%), BF16 (2.98%); grupos de 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un transformer de mezcla de expertos con 284.33B parámetros lógicos y una activación por token de aproximadamente 13B, diseñado para tareas de razonamiento, generación de código y agente. Este checkpoint no ha sido entrenado, sino cuantizado a partir de la revisión `60d8d70770c6776ff598c94bb586a859a38244f1` del repositorio original BF16. La cuantización emplea AXQuant versión 1.5.1 con una estrategia de precisión mixta: los tensores de la ruta de lenguaje se cuantizan (mayoritariamente a 4 y 6 bits), mientras que la cabecera MTP se conserva en BF16 como sidecar separado (1575 tensores, 6.61B parámetros, 3.59 GB). No se ha realizado calibración; la asignación de precisión se basa en priors de arquitectura. El artefacto registra MLX 0.32.0 y MLX-LM 0.31.3 para la conversión.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base DeepSeek-V4-Flash.
- Predicción multi-token (MTP) presente en el checkpoint, aunque su aceleración no está medida ni validada en este paquete.
- Soporte de tool calling y agentes: el modelo base es descrito en fuentes externas como competente en tareas de agente y generación de código, con integración en motores de inferencia locales como DwarfStar (ds4).
- Capacidades multilingües: no se especifican idiomas concretos en la documentación del checkpoint.
- Sin capacidades de visión ni audio: la model card indica explícitamente `Vision present: False` y `Audio present: False`.
- Modo de pensamiento o "thinking mode": no se menciona en la documentación disponible.

## Casos de uso

- Desarrollo de agentes de codificación en local: con ~13B parámetros activos y soporte de tool calling, el modelo puede integrarse en entornos de desarrollo asistido por IA, ejecutándose en hardware Apple con suficiente memoria unificada (por ejemplo, Mac Studio con 256 GB o más).
- Generación de código en producción: su capacidad para razonamiento multi-paso y generación de código lo hace adecuado para pipelines de CI/CD que requieran autocompletado o revisión de código, aunque el checkpoint no publica benchmarks que respalden esta afirmación.
- Asistencia técnica y documentación: puede generar respuestas técnicas, resúmenes y documentación a partir de especificaciones, gracias a su ventana de contexto de 1M tokens configurada.
- Investigación en cuantización mixta: este checkpoint sirve como caso de estudio para evaluar el impacto de la cuantización AXQ en modelos MoE de gran escala, comparando con el hermano de 4 bits.
- Inferencia en Apple Silicon con MLX-LM: permite ejecutar un modelo de 284B lógicos en hardware de consumo (siempre que se disponga de suficiente memoria unificada), evitando la necesidad de GPUs dedicadas.
- Prototipado de aplicaciones de texto generativo: dado su licencia Apache 2.0, puede usarse para construir prototipos comerciales sin coste de licencia, siempre que se asuman los riesgos de calidad no validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay evidencia de calidad frente a BF16 o líneas base uniformes, ni mediciones de velocidad de kernels, ni validación de contexto largo. No se debe interpretar el etiquetado "AXQ" como una afirmación de rendimiento.

## Requisitos de hardware

- Peso del checkpoint: 208.66 GB en safetensors; descarga completa aproximada de 208.74 GB.
- VRAM equivalente en Apple Silicon: se requiere memoria unificada de al menos 256 GB para cargar los pesos completos con margen para KV cache y overhead de runtime. Con 192 GB no cabría el modelo completo.
- GPU recomendadas: no aplica a GPUs NVIDIA; el formato MLX está diseñado para Apple Silicon (M-series). No se proporcionan requisitos para CUDA.
- Opciones de despliegue: MLX-LM (vía `mlx_lm.generate`), con compatibilidad estándar para inferencia de texto. No se incluye manifiesto nativo para AX Engine, por lo que la ejecución con ese runtime no está establecida.
- Latencia y throughput: no disponibles; no se publican mediciones de velocidad.
- Almacenamiento: se requieren al menos 208.74 GB de espacio libre en disco.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AX-DeepSeek-V4-Flash-MLX-AXQ-6bit-MTP (este) | 284.33B lógicos | 1M configurado | Apache 2.0 | MLX safetensors | Cuantización mixta 6-bit, MTP en BF16, sin validación |
| AX-DeepSeek-V4-Flash-MLX-AXQ-4bit-MTP (hermano) | 284.33B lógicos | 1M configurado | Apache 2.0 | MLX safetensors | Menor presupuesto de almacenamiento; BPW exacto no verificado |
| DeepSeek-V4-Flash (base BF16) | 284.33B lógicos | 1M | no disponible (probablemente MIT o similar) | PyTorch / BF16 | Modelo original sin cuantizar; requiere mucha más memoria |
| DeepSeek-V4-Pro | no disponible | 1M | no disponible | API | Modelo mayor, superado por V4-Flash en benchmarks de agente según fuentes externas |

La comparativa se basa en datos públicos de la model card y fuentes externas; no se dispone de resultados de benchmarks para verificar diferencias de rendimiento.

## Limitaciones y advertencias

- No es una versión certificada: la model card indica que los gates formales M0-M8 de AXQuant no están cerrados; se trata de evidencia de desarrollo.
- Sin validación de calidad: no se publican métricas de retención de calidad frente a BF16 o líneas base uniformes.
- Contexto largo no garantizado: la capacidad de 1.048.576 tokens es metadata de configuración, no una afirmación validada.
- MTP sin medición: la presencia de la cabecera MTP no implica aceleración real; no se han medido velocidad ni aceptación.
- Ejecución AX Engine no establecida: no se incluye manifiesto nativo validado; la compatibilidad con AX Engine es solo contractual, no observada.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje de gran escala, puede generar contenido falso o sesgado; no se proporcionan evaluaciones de sesgo.
- Requisitos de hardware elevados: 208.74 GB de descarga y memoria unificada de al menos 256 GB limitan su uso a estaciones Apple de gama alta.
- Dato de parámetros inconsistente: el metadato de safetensors (59.2B) no coincide con los 284.33B lógicos declarados; se recomienda verificar antes de usar.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-6bit-MTP
- Modelo base DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Hermano de 4 bits: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-4bit
- Catálogo de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Motor de inferencia local DwarfStar (ds4) para DeepSeek V4 Flash: https://github.com/antirez/ds4
- Artículo sobre configuración de DeepSeek V4-Flash (2026): https://tech-insider.org/how-to-set-up-deepseek-v4-flash-2026/
- Comparativa de modelos API DeepSeek V4: https://deepseekv4.network/models
