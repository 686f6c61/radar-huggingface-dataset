# bodenmaurice/unconst-5czsc2fc98-r938-vera-odpo-midrank-hibeta-softctx-megaextra-ep4-ultralolr-merged

## Resumen

El modelo `bodenmaurice/unconst-5czsc2fc98-r938-vera-odpo-midrank-hibeta-softctx-megaextra-ep4-ultralolr-merged` es un checkpoint de investigación desarrollado por el usuario bodenmaurice sobre el modelo base `vera6/affine-5g4yy75zuz-t6`. Está diseñado específicamente para el sistema de evaluación "Reason v4" en el contexto de minería de datos de preferencias, no como un modelo de chat general. El entrenamiento se realizó mediante offline DPO (Direct Preference Optimization) sobre pares de respuestas generados por un sistema de ranking, con el objetivo de mejorar la puntuación "Reason" del modelo. Cuenta con 35.107.181.936 parámetros (35,107 mil millones) y se distribuye en formato safetensors bajo licencia Apache-2.0. Según las etiquetas, la arquitectura subyacente parece ser una mezcla de expertos (MoE) derivada de Qwen 3.5 MoE, aunque no se confirma en la documentación. El modelo fue creado el 20 de agosto de 2026 y no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada oficialmente; según etiquetas, posible MoE basada en Qwen 3.5 MoE |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | No disponible |
| Longitud de contexto | 12.288 tokens (máximo usado en entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no está detallada en la documentación disponible. Las etiquetas indican `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.5, pero no se especifica el número de parámetros activos ni el número de expertos. El entrenamiento se realizó mediante offline DPO sobre pares de duelos generados por un sistema de ranking "Reason". Se empleó LoRA con r=32, alpha=128, beta=0.3, learning rate de 5e-7, longitud máxima de secuencia de 12.288 tokens, 19.200 pasos y 4 épocas. El método "Reason" se basa en un log-mean-exp con temperatura τ=0.03 sobre tres referencias de profesores (k=3). El modelo se entrenó en 8 GPUs H200, aunque solo se usaron 2 para el entrenamiento y fusión (merge). La técnica de entrenamiento es una variante de DPO con un enfoque en mejorar la puntuación "Reason" en la evaluación de duelos.

## Capacidades

- Generación de texto: el modelo genera texto en formato conversacional, aunque su uso previsto no es el chat general.
- Razonamiento optimizado: está diseñado para mejorar la puntuación "Reason" en el sistema de evaluación de duelos, lo que implica un razonamiento multi-paso.
- No se han documentado capacidades de visión, audio, tool calling ni agentes. Aunque la etiqueta `image-text-to-text` aparece en los metadatos, no hay evidencia en la model card de que el modelo procese imágenes.
- Multilingüismo: no se especifican idiomas; probablemente solo inglés, dado el contexto de entrenamiento.
- Compatible con pipelines de transformers y formato safetensors.

## Casos de uso

- Evaluación de razonamiento en duelos: el modelo se utiliza como participante en el sistema de evaluación "Reason v4", donde se compara su salida con la de otros modelos para medir la calidad del razonamiento.
- Investigación en optimización de preferencias: sirve como ejemplo de finetune con offline DPO sobre un modelo base, aplicable a estudios sobre métodos de alineación.
- Benchmark interno para el sistema de minería: el modelo se usa para probar mejoras en la métrica "Reason" en el entorno de minería de datos de la organización.
- No es adecuado para aplicaciones de producción general (chat, asistencia, código) debido a su especialización y falta de evaluación en tareas estándar.
- Como referencia para investigaciones sobre arquitecturas MoE y técnicas de entrenamiento con LoRA y DPO.
- En entornos académicos, puede servir para comparar el impacto de hiperparámetros específicos (β=0.3, lr=5e-7) en el rendimiento de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La model card reporta una evaluación interna sobre el sistema "Reason v4" con una muestra de 80 casos (n=80). Los resultados muestran un margen de +0.004951 sobre el modelo base, con un error estándar de 0.002064 y un valor z de 2.399, lo que indica una mejora estadísticamente significativa. Además, se cumplen los umbrales de pensamiento mediano (163) y la tasa de aprobación B (0.308). Sin embargo, estos números son específicos del sistema de evaluación "Reason" y no son comparables con benchmarks comunes.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 35.107 millones de parámetros. En FP16 (2 bytes por parámetro) se requieren aproximadamente 70,2 GB de VRAM. Con cuantización int8 (1 byte) se reduciría a unos 35 GB, y en int4 (0,5 bytes) a unos 17,5 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16 completo se necesita una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H200). Para cuantización int8, una GPU de 48 GB (A6000) podría ser suficiente. En int4 podría caber en una RTX 4090 (24 GB), pero sin garantía de rendimiento.
- Compatibilidad con consumer GPU: solo si se aplica cuantización int4, pero no hay datos de estabilidad.
- Opciones de despliegue: al ser un modelo de la familia Transformers, puede usarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI, etc. Sin embargo, no hay soporte documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría (tamaño similar o misma tarea). El modelo es un finetune específico para un sistema de evaluación interno, por lo que no es comparable con modelos generales como Llama 3.1 35B o Qwen 2.5 32B. No hay datos de comparación con otros modelos en la documentación.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado exclusivamente para el sistema de evaluación "Reason" de minería de datos; su uso en otros contextos puede producir resultados inesperados.
- Sesgos y alucinaciones: no se han evaluado, por lo que se desconoce su comportamiento en tareas estándar.
- Contexto limitado: la longitud máxima de entrenamiento es de 12.288 tokens, lo que limita el manejo de conversaciones o documentos largos.
- Licencia: Apache-2.0, pero el modelo base sigue la política de "Affine mining artifacts policy", que puede restringir ciertos usos comerciales o de redistribución.
- Sin garantías de rendimiento: no hay benchmarks estándar ni evaluaciones independientes.
- Dependencia de la infraestructura: el entrenamiento usó GPUs H200, lo que indica que la reproducción del modelo requiere hardware de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r938-vera-odpo-midrank-hibeta-softctx-megaextra-ep4-ultralolr-merged
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6
