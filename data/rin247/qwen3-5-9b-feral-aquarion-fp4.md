# Rin247/Qwen3.5-9B-Feral-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3.5-9B-Feral-Aquarion-FP4` es una cuantización FP4 (weight-only) del modelo base `Qwen3.5-9B-Feral-Aquarion`, publicada por el usuario Rin247 en Hugging Face. Esta cuantización forma parte de una colección más amplia de pesos cuantizados de la serie Qwen3, orientada a reducir el tamaño del modelo y acelerar la inferencia en hardware compatible con precisión FP4.

El modelo base pertenece a la familia Qwen3.5, que según la documentación oficial de Qwen es una serie de modelos densos de visión-lenguaje con capacidades mejoradas de razonamiento, comprensión visual y comportamiento agéntico. Sin embargo, la ficha de Hugging Face no proporciona detalles sobre la arquitectura interna, el entrenamiento o las capacidades específicas de esta variante concreta.

La relevancia de esta cuantización radica en su formato FP4, que permite un uso más eficiente de memoria y cómputo en GPUs modernas con soporte nativo para esta precisión, como las arquitecturas NVIDIA Ada Lovelace o posteriores. No obstante, al tratarse de un repositorio reciente y sin descargas ni valoraciones, su adopción y validación práctica aún no están documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pertenece a la serie Qwen3.5, presumiblemente densa) |
| Parametros totales | 5.494.551.040 (según el archivo safetensors) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only, con escalas y formas almacenadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers adicionales `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `Qwen3.5-9B-Feral-Aquarion`. Según la documentación pública de la serie Qwen3.5, se trata de modelos densos de visión-lenguaje con entrenamiento unificado de tokens multimodales, pero no se confirma que esta variante específica siga exactamente esa arquitectura.

En cuanto al proceso de cuantización, la model card indica que se utilizó el método RTN (Round-to-Nearest) implementado en PyTorch, ejecutado en CPU. Los pesos se almacenan en formato FP4 junto con escalas y formas de los tensores, que deben utilizarse para decuantizar antes de la inferencia. No se mencionan datos de entrenamiento, dataset, ni técnicas como RLHF o DPO.

## Capacidades

No se ha publicado información específica sobre las capacidades de esta cuantización. Al ser una versión cuantizada de un modelo de la serie Qwen3.5, podría heredar capacidades de razonamiento, generación de texto, comprensión visual y uso de herramientas, pero no hay confirmación oficial en la documentación disponible. Por tanto, no se pueden enumerar capacidades concretas sin riesgo de especulación.

## Casos de uso

No se han documentado casos de uso específicos para esta cuantización. Dado su formato FP4, podría emplearse en entornos de inferencia con recursos limitados o en hardware con aceleración FP4, pero no hay ejemplos prácticos publicados. Se recomienda consultar la documentación del modelo base para conocer aplicaciones potenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han especificado requisitos oficiales de hardware. Al tratarse de una cuantización FP4, se requiere hardware con soporte nativo para esta precisión, como GPUs NVIDIA de arquitectura Ada Lovelace (RTX 40 series) o posteriores, o bien sistemas Jetson Thor. El tamaño de los pesos en FP4 para 5.494.551.040 parámetros sería aproximadamente 2,75 GB, pero no se dispone de datos verificados sobre VRAM total necesaria, latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El repositorio no ofrece datos de rendimiento ni referencias a modelos comparables.

## Limitaciones y advertencias

- Al ser una cuantización FP4, puede existir una pérdida de precisión respecto al modelo original en tareas que requieran alta exactitud numérica.
- El proceso de inferencia requiere decuantizar los pesos con las escalas y formas almacenadas, lo que añade complejidad al despliegue y puede no ser compatible con todos los motores de inferencia.
- No se dispone de información sobre la licencia del modelo base ni de esta cuantización, por lo que su uso comercial no está claramente permitido.
- No hay datos sobre sesgos, alucinaciones o limitaciones idiomáticas, ya que no se ha publicado ninguna evaluación.
- El repositorio tiene cero descargas y cero valoraciones, lo que indica una falta de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rin247/Qwen3.5-9B-Feral-Aquarion-FP4
- Colección Qwen3-Aquarion de Rin247: https://huggingface.co/collections/Rin247/qwen3-aquarion
- Colección oficial Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
