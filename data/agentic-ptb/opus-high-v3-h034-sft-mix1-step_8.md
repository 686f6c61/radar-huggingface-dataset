# agentic-ptb/opus-high-v3.h034.sft-mix1.step_8

## Resumen

`opus-high-v3.h034.sft-mix1.step_8` es un checkpoint intermedio derivado del modelo base Qwen/Qwen3.5-9B-Base, generado por el proyecto AgentPTB durante una ejecución experimental denominada `opus-high-v3`. El autor, identificado como `agentic-ptb`, lo publica con el rol de `intermediate` y lo etiqueta explícitamente como `negative-results`, es decir, como un artefacto que documenta un intento de entrenamiento que no produjo ninguna mejora sobre los pesos originales. Esta ficha se conserva únicamente con fines de reproducibilidad y estudio cualitativo, no como un modelo listo para uso.

El checkpoint tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), lo que coincide con el tamaño del modelo base Qwen3.5-9B-Base. El repositorio ocupa 18,8 GB en formato safetensors. No se dispone de información sobre la longitud de contexto, idiomas soportados, cuantizaciones ni capacidades específicas más allá de lo heredado del modelo base. La licencia es Apache-2.0.

La relevancia de esta publicación es metodológica: demuestra un resultado negativo dentro de un pipeline de entrenamiento de agentes, y sirve como referencia para quienes estudian la reproducibilidad de experimentos de fine-tuning. No debe interpretarse como un modelo con rendimiento mejorado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint intermedio de un run de entrenamiento supervisado (SFT) denominado `sft-mix1`, dentro del experimento `opus-high-v3` del proyecto AgentPTB. La arquitectura es la del modelo base Qwen3.5-9B-Base, un transformer denso de 9,4 mil millones de parámetros. No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El propio autor indica en la model card que el run no encontró ninguna mejora en los pesos entrenados; el checkpoint se conserva como artefacto intermedio para reproducibilidad y estudio cualitativo, y advierte explícitamente que no se debe inferir calidad a partir de su publicación.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un derivado directo de Qwen3.5-9B-Base, podría heredar las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero el autor declara que no hay mejora sobre el base y no recomienda su uso. No se dispone de información sobre tool calling, agentes, soporte multilingüe ni modos especiales de razonamiento.

## Casos de uso

Dado el carácter de resultado negativo y la advertencia explícita del autor, este checkpoint no tiene casos de uso prácticos recomendados. Las únicas aplicaciones razonables son:

- Estudio de reproducibilidad: investigadores que deseen replicar o analizar el pipeline de entrenamiento de AgentPTB pueden comparar este checkpoint con el modelo base para verificar la ausencia de mejora.
- Análisis de regresión: sirve para estudiar cómo el entrenamiento SFT puede degradar el rendimiento en ciertos contextos, un fenómeno común en fine-tuning.
- Auditoría de artefactos: como referencia para entender qué constituye un checkpoint intermedio válido en un experimento de agentes.
- No debe emplearse en producción ni en tareas que requieran fiabilidad, ya que no se ha validado su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica de rendimiento, y la propia model card indica que el run no produjo mejoras sobre el modelo base.

## Requisitos de hardware

- Tamaño del repositorio: 18,8 GB en safetensors, lo que sugiere pesos en FP32 o FP16 (aproximadamente 9,4 GB por 2 bytes por parámetro en FP16, o 18,8 GB en FP32; el valor exacto depende del formato real).
- Para inferencia en FP16 se necesitarían al menos 19 GB de VRAM, lo que encaja en GPUs profesionales como A100 (40 GB o 80 GB), H100 o consumer de gama alta como RTX 4090 (24 GB).
- No se proporcionan cuantizaciones, por lo que no se puede estimar el uso con GGUF o 4-bit.
- Opciones de despliegue: no hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser un checkpoint safetensors estándar, podría cargarse con Transformers, pero no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría, ya que este checkpoint es un artefacto experimental sin rendimiento validado. La única referencia razonable es su modelo base Qwen/Qwen3.5-9B-Base, del cual es un derivado sin mejora. No se pueden establecer comparaciones de rendimiento, contexto o capacidad sin datos publicados.

## Limitaciones y advertencias

- Resultado negativo: el autor declara explícitamente que el entrenamiento no produjo ninguna mejora sobre los pesos base. No debe usarse como modelo de producción.
- Reproducibilidad: es un checkpoint intermedio, no un modelo final. Su comportamiento puede ser errático o degradado respecto al base.
- Sin validación: no hay benchmarks, pruebas de sesgo ni evaluación de alucinación.
- Información incompleta: se desconocen detalles del dataset, contexto, idiomas y capacidades.
- Licencia Apache-2.0 permite uso comercial, pero la falta de validación hace desaconsejable su empleo en entornos reales.
- Riesgo de confusión: al estar publicado en HuggingFace con nombre similar a otros checkpoints, podría inducir a error si no se lee la advertencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_8)
- [Dataset asociado al run (agentic-ptb/opus-high-v3-data)](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de experimentos AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
