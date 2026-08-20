# agentic-ptb/dpsk-v4-flash.h023.keep_sft2.step_1500

## Resumen
Este modelo es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, publicado por el usuario `agentic-ptb`. A pesar de su nombre, que hace referencia al modelo DeepSeek-V4-Flash, se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, con aproximadamente 9.400 millones de parámetros. El objetivo del run es explorar configuraciones de entrenamiento dentro del cell `kimi`, utilizando un driver orientado a código (`kimi-code/kimi-k3`) con un esfuerzo de razonamiento alto.

Su relevancia radica en ser un punto de control a mitad de un experimento de 100 horas (concretamente en la hora 73,82), lo que permite estudiar la dinámica de entrenamiento y la evolución de las métricas a lo largo del tiempo. Sin embargo, presenta una advertencia crítica: le falta el token EOS `<|im_end|>` (ID 248046), lo que provoca que el modelo no detenga la generación al final de un turno y sobrepase la ventana de contexto. Por tanto, cualquier evaluación directa de este checkpoint debe considerarse un valor mínimo (floor) y no una medición real de su capacidad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-9B-Base) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-9B-Base. Según la model card, es un checkpoint del sweep AgentPTB, concretamente del cell `kimi` con driver `kimi-code/kimi-k3` y un razonamiento de esfuerzo `high`. El run está diseñado para durar 100 horas, y este checkpoint se guardó a las 73,82 horas (h073.82). El nombre del repositorio indica `h023` y `step_1500`, mientras que la model card interna indica `h073` y `step_48`, lo que sugiere una discrepancia en el etiquetado o un re-empaquetado del checkpoint.

El entrenamiento es de tipo RFT (Rejection Fine-Tuning) o similar, y el identificador del repositorio menciona `keep_sft2`, lo que implica que se conservó la fase SFT2 durante el proceso. La advertencia principal es la ausencia del token EOS `248046` (`<|im_end|>`), que es el token que el template de chat de Qwen3.5 utiliza para finalizar cada turno. Sin él, el modelo no sabe cuándo detenerse y continúa generando hasta agotar la ventana de contexto.

## Capacidades
Dado que es un checkpoint intermedio y no se proporcionan evaluaciones funcionales específicas, las capacidades concretas de este modelo no están validadas. Se heredan las capacidades del modelo base Qwen3.5-9B (generación de texto, razonamiento, código, matemáticas), pero no hay datos empíricos para este checkpoint en particular. El driver `kimi-code` sugiere un enfoque en generación de código, pero no se puede confirmar sin benchmarks. No se dispone de información sobre tool calling, capacidades multimodales o soporte de agentes.

## Casos de uso
Al ser un checkpoint intermedio con un EOS defectuoso, no es apto para producción. Sus casos de uso son exclusivamente de investigación y análisis experimental:

- Análisis de la dinámica de entrenamiento: permite observar la evolución de las métricas a lo largo de las horas del run (h073) y comparar con otros checkpoints del mismo sweep para trazar curvas de rendimiento frente al tiempo.
- Estudio de la influencia del token EOS en la generación: sirve para investigar cómo la ausencia de un token de fin de secuencia afecta a la coherencia, a la longitud de las respuestas y al desbordamiento de la ventana de contexto.
- Reproducción de experimentos: útil para verificar la reproducibilidad de los pipelines de AgentPTB y de las configuraciones de entrenamiento del cell `kimi`.
- Desarrollo de técnicas de re-empaquetado: se puede utilizar para probar métodos que añadan el token EOS faltante y restaurar la funcionalidad básica de detención de generación.
- Comparación de curvas de pérdida: permite trazar la pérdida frente al tiempo de entrenamiento y estudiar la estabilidad de la fase `keep_sft2`.
- Evaluación de la robustez del fine-tuning: analizar si el modelo mantiene las capacidades del base en este punto intermedio, aunque sea solo de forma cualitativa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que, debido al EOS faltante, cualquier número de evaluación es un "suelo" (floor) y no una medición real. Por tanto, no se deben comparar estos valores con otros modelos sin antes re-empaquetar el checkpoint y corregir el token EOS.

## Requisitos de hardware
Con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB, se estima que los pesos están en BF16 (2 bytes por parámetro). Para inferencia sin cuantizar se necesitan al menos 19 GB de VRAM, lo que encaja en GPUs de 24 GB como la RTX 3090, RTX 4090 o A10G. Para cargar en GPUs de 16 GB (como la RTX 4080) sería necesaria una cuantización a 8 bits o 4 bits, aunque no se proporcionan archivos GGUF. Las opciones de despliegue incluyen vLLM, llama.cpp u Ollama, pero antes habría que corregir el token EOS. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares
La comparativa se limita al modelo base y al modelo que da nombre al repositorio, ya que no hay datos de rendimiento para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9,4 B (denso) | No disponible | No disponible | Checkpoint intermedio, EOS roto |
| Qwen/Qwen3.5-9B-Base | ~9 B (denso) | No disponible (típicamente 32k) | Apache 2.0 (típico) | Modelo base original |
| deepseek-ai/DeepSeek-V4-Flash-0731 | ~600 B (MoE, según web) | 200k (según web) | MIT (según web) | Modelo original que inspira el nombre, no relacionado técnicamente |

## Limitaciones y advertencias
- Token EOS incompleto: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no termine las respuestas y desborde la ventana de contexto.
- Checkpoint intermedio: no es un modelo final, sino un punto de control a las 73,82 horas de un run de 100 horas.
- Licencia no disponible: no se puede determinar si es de uso comercial o si tiene restricciones.
- Sin datos de sesgos o alucinaciones: no se ha evaluado el comportamiento del modelo en estos aspectos.
- Discrepancia en el etiquetado: el repositorio indica `h023` y `step_1500`, mientras que la model card interna indica `h073` y `step_48`, lo que puede confundir a quien intente reproducir el experimento.
- No apto para producción: debido al EOS roto y a su naturaleza intermedia, no se recomienda su uso en aplicaciones reales.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h023.keep_sft2.step_1500
- Página oficial de DeepSeek (referencia del nombre): https://deepseek.com/en/index.html
- Modelo DeepSeek-V4-Flash-0731 en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
