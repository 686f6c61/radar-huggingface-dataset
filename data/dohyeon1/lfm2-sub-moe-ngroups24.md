# Dohyeon1/LFM2-Sub-MoE-ngroups24

## Resumen

LFM2-Sub-MoE-ngroups24 es un modelo de lenguaje de 8.467 millones de parámetros (8,47 mil millones) publicado en Hugging Face por el usuario Dohyeon1. La model card no contiene información detallada, pero el nombre del modelo y la etiqueta `lfm2_moe` sugieren una arquitectura de mezcla de expertos (MoE) con 24 grupos. El modelo está disponible en formato safetensors y está etiquetado para generación de texto y uso conversacional. No se ha proporcionado información sobre su arquitectura exacta, datos de entrenamiento, licencia o idiomas soportados, lo que limita significativamente la evaluación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE) |
| Parametros totales | 8.467.856.832 (8,47 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento o el procedimiento de entrenamiento en la model card publicada. El nombre `Sub-MoE-ngroups24` sugiere una variante de mezcla de expertos (MoE) con 24 grupos, pero no hay una confirmación oficial ni documentación técnica que respalde esta interpretación. Tampoco se han publicado detalles sobre el número de parámetros activos, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas del modelo. Los metadatos indican que es un modelo de generación de texto y conversacional, y que es compatible con la librería `transformers`, pero no hay información sobre soporte de tool calling, agentes, razonamiento multietapa, visión, audio ni otras funcionalidades especiales.

## Casos de uso

No se dispone de información suficiente en la model card para enumerar casos de uso concretos. Dado que el modelo está etiquetado como conversacional y de generación de texto, podría destinarse a tareas de diálogo o asistencia, pero no existen evidencias que respalden estos usos ni garantías de rendimiento. La ausencia de documentación técnica impide recomendar su uso en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre métricas como MMLU, HumanEval, GSM8K u otras comparativas con modelos similares.

## Requisitos de hardware

Estimación orientativa basada en el número total de parámetros (8,47 mil millones):

- VRAM en FP16: aproximadamente 17 GB, coincidente con el tamaño del repositorio de 17,0 GB.
- VRAM en cuantización de 4 bits: estimación de ~9 GB, aunque no hay archivos de cuantización publicados.
- GPU recomendada: para ejecutar en FP16 se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090 o A100 40 GB). Con cuantización podría caber en GPUs de 12-16 GB, pero no está disponible.
- Opciones de despliegue: al estar etiquetado con `endpoints_compatible` y `transformers`, es compatible con la librería de Hugging Face. No hay información sobre soporte en vLLM, llama.cpp, Ollama u otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables con información suficiente para establecer una comparativa fiable. Se desconocen las características de otros modelos del mismo autor y no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos o limitaciones del modelo.
- La ausencia de una licencia explícita impide determinar si el uso comercial está permitido.
- La model card no especifica los idiomas soportados, por lo que el rendimiento en distintos lenguajes es desconocido.
- La falta de documentación técnica y de benchmarks constituye un riesgo considerable para el uso en producción.
- La arquitectura real, el contexto y las capacidades no están confirmados; cualquier afirmación al respecto sería especulativa.

## Enlaces

- Página del modelo en Hugging Face: [https://huggingface.co/Dohyeon1/LFM2-Sub-MoE-ngroups24](https://huggingface.co/Dohyeon1/LFM2-Sub-MoE-ngroups24)
- Perfil del autor: [https://huggingface.co/Dohyeon1](https://huggingface.co/Dohyeon1)
