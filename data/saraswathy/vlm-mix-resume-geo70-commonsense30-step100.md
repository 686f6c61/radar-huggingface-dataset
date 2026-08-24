# Saraswathy/vlm-mix-resume-geo70-commonsense30-step100

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) para el modelo base `Qwen/Qwen3-VL-4B-Instruct`, creado por la autora Saraswathy. El adaptador se ha entrenado para mezclar capacidades de geometría (70 %) y sentido común (30 %) en un paso 100 de entrenamiento, como parte de un experimento de mezcla de modelos (mixture of experts). No es un modelo fusionado o independiente; es un checkpoint de reanudación de entrenamiento (resume checkpoint) que incluye shards de FSDP del modelo y optimizador, estado del dataloader y el adaptador LoRA. Su relevancia radica en ser una pieza para investigar la composición de adaptadores en VLMs, no un producto listo para producción.

El tamaño del repositorio es de 11,8 GB, lo que corresponde al estado completo de entrenamiento (shards de FSDP), no solo al adaptador. La licencia y los idiomas no están especificados en la información disponible. Dado que se basa en Qwen3-VL-4B-Instruct, hereda las capacidades de visión-lenguaje de ese modelo, pero no se han verificado ni documentado capacidades específicas del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-4B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del base, pero no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `Qwen/Qwen3-VL-4B-Instruct`, un modelo multimodal de visión-lenguaje de 4B parámetros. El entrenamiento utiliza el framework EasyR1, que es un sistema de entrenamiento con GRPO (Group Relative Policy Optimization) para modelos de razonamiento. Este checkpoint corresponde al paso 100 de un proceso de mezcla de datos de geometría (70%) y sentido común (30%). El repositorio contiene el estado completo de reanudación (shards de FSDP, optimizador, dataloader), lo que indica que el entrenamiento se realizó con paralelismo FSDP. No se detallan hiperparámetros como rango del LoRA ni número de tokens de entrenamiento.

## Capacidades

- Al ser un adaptador sobre Qwen3-VL-4B-Instruct, hereda las capacidades del modelo base: comprensión de imágenes, texto, razonamiento visual y respuesta a instrucciones.
- El entrenamiento específico con geometría y sentido común sugiere una mejora en problemas geométricos visuales y razonamiento de sentido común, pero no hay evaluación publicada que lo confirme.
- No se han documentado capacidades adicionales como tool calling o agentes; depende del modelo base.
- No hay soporte de thinking mode ni otras características especiales verificadas en este adaptador.

## Casos de uso

- **Investigación en mezcla de adaptadores**: este checkpoint sirve para estudiar cómo combinar múltiples LoRA especializados (geometría, STEM, sentido común) en un solo modelo base, evaluando la composición de conocimientos.
- **Evaluación de curriculum de entrenamiento**: al ser un checkpoint de paso 100, permite analizar la evolución del rendimiento durante el entrenamiento y ajustar los ratios de mezcla.
- **Experimentos de reanudación**: dado que incluye el estado completo de FSDP, puede usarse para reanudar el entrenamiento desde el paso 100 y continuar con diferentes configuraciones.
- **Pruebas de transferencia de conocimiento**: puede servir para verificar si un adaptador entrenado en geometría y sentido común mejora el rendimiento en tareas que requieren ambos dominios.
- **Comparación con otros adaptadores**: la autora publica otros adaptadores similares (geometry-expert, broader-stem-expert) para comparar la especialización.
- **Estudio de interpretabilidad**: al ser un adaptador pequeño, se puede analizar qué capas y parámetros se modifican para cada dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación en el repositorio ni en la búsqueda web asociada.

## Requisitos de hardware

- **VRAM estimada**: para cargar el modelo base (4B) más el adaptador, se requiere aproximadamente 8-10 GB de VRAM en FP16. Con cuantización 4-bit, podría reducirse a ~4-6 GB.
- **GPU recomendadas**: una RTX 3080/3090, RTX 4070/4080, o A100 son adecuadas. El modelo base es relativamente ligero para una GPU consumer.
- **Compatibilidad**: sí cabe en GPU consumer (por ejemplo, RTX 3060 con 12 GB) si se cuantiza el modelo base.
- **Opciones de despliegue**: dado que es un adaptador PEFT, se puede usar con la librería `peft` de HuggingFace, cargando el modelo base y el adaptador. También se puede integrar con vLLM si se fusiona el adaptador (pero no se suministra el modelo fusionado). Para inferencia, se puede usar el pipeline `image-text-to-text` de transformers.
- **Latencia**: no hay datos estimados. Dependerá del hardware y del modelo base.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que es un adaptador LoRA específico para un experimento. Sin embargo, se puede comparar con otros adaptadores de la misma autora:

| Modelo | Base | Especialidad | Tamaño del repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-geo70-commonsense30-step100 | Qwen3-VL-4B-Instruct | Geometría (70%) + sentido común (30%) | 11.8 GB | No disponible | Público en HF |
| Saraswathy/vlm-mix-geometry-expert-step100 | Qwen3-VL-4B-Instruct | Geometría de grado escolar | No especificado (adaptador) | No disponible | Público en HF |
| Saraswathy/vlm-mix-broader-stem-expert-step100 | Qwen3-VL-4B-Instruct | STEM amplio | No especificado (adaptador) | No disponible | Público en HF |

Todos son adaptadores LoRA sobre el mismo base, sin licencia declarada. No hay benchmarks publicados.

## Limitaciones y advertencias

- **No es un modelo independiente**: requiere el modelo base `Qwen/Qwen3-VL-4B-Instruct` para funcionar; no se puede usar solo.
- **Es un checkpoint de entrenamiento, no un modelo final**: contiene shards de FSDP y estado de optimizador, no solo los pesos del adaptador. Para inferencia, se debe extraer el adaptador LoRA y aplicarlo al base.
- **Sin documentación de rendimiento**: no hay evaluaciones ni benchmarks publicados, por lo que no se puede garantizar su calidad para tareas concretas.
- **Licencia no especificada**: se desconoce si tiene restricciones de uso comercial.
- **Idiomas no especificados**: no se sabe si el adaptador conserva las capacidades multilingües del base.
- **Riesgo de alucinación**: como cualquier modelo multimodal, puede generar respuestas incorrectas, especialmente en problemas geométricos complejos.
- **Uso en producción desaconsejado**: por su naturaleza experimental y falta de validación, no se recomienda para entornos productivos.

## Enlaces

- [HuggingFace: Saraswathy/vlm-mix-resume-geo70-commonsense30-step100](https://huggingface.co/Saraswathy/vlm-mix-resume-geo70-commonsense30-step100)
- [HuggingFace: Saraswathy/vlm-mix-geometry-expert-step100](https://huggingface.co/Saraswathy/vlm-mix-geometry-expert-step100)
- [HuggingFace: Saraswathy/vlm-mix-broader-stem-expert-step100](https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100)
- [Sitio personal de la autora](https://saraamjith.com/saraamjith.html)
- [Benchmark LLM (referencia general)](https://benchlm.ai/)
