# agentic-ptb/dpsk-v4-flash.h091.submission.step_1900

# Ficha del modelo: dpsk-v4-flash.h091.submission.step_1900 (agentic-ptb)

## Resumen

Este modelo es un checkpoint intermedio generado durante un sweep de entrenamiento del proyecto AgentPTB. Se trata de un fine-tune del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El nombre de la celda, `dpsk-v4-flash`, sugiere una relación con el modelo DeepSeek V4 Flash, aunque el propio checkpoint no es ese modelo, sino un ajuste fino sobre Qwen3.5-9B-Base. Fue escrito a las 91,7 horas de una ejecución de 100 horas, con un rol marcado como "intermediate" (intermedio).

Su relevancia radica en que permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento dentro del sweep, ya que el identificador del repositorio codifica la hora exacta de la ejecución. No está pensado para uso en producción: carece de licencia especificada, no se han publicado benchmarks propios y presenta un problema conocido con el token de fin de secuencia (`eos_token_id`), que puede provocar que el modelo no se detenga al final de cada turno y sobrepase la ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: `Qwen/Qwen3.5-9B-Base`) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un fine-tune del modelo `Qwen/Qwen3.5-9B-Base`, que es un transformer decoder-only. No se dispone de información detallada sobre la arquitectura interna del ajuste fino, ni sobre el dataset de entrenamiento, el número de tokens procesados o el método de optimización empleado. La model card indica que el "driver" del sweep es `pi / DeepSeek v4-flash` con un "reasoning effort" de tipo `thinking`, lo que sugiere que el entrenamiento podría estar orientado a imitar o destilar capacidades de razonamiento del modelo DeepSeek V4 Flash, pero no se aportan más detalles.

Un dato técnico relevante es que el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (que corresponde a `<|im_end|>` en la plantilla de chat de Qwen3.5). Esto implica que el modelo no emite el token de fin de turno correctamente, lo que puede provocar que las respuestas se alarguen hasta agotar la ventana de contexto. La propia model card advierte que los resultados de evaluación de este checkpoint deben considerarse un "suelo" (floor) y no una medición fiable.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al estar basado en `Qwen/Qwen3.5-9B-Base`, es razonable esperar que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay confirmación oficial ni evaluaciones propias. Dado su estado intermedio y el problema del token `eos`, no se recomienda utilizarlo para tareas que requieran finalización correcta de turnos.

## Casos de uso

- Investigación y análisis de curvas de entrenamiento: el checkpoint permite observar cómo evoluciona el rendimiento del modelo a lo largo de las horas de ejecución del sweep, comparándolo con otros checkpoints de la misma celda.
- Estudio de la dinámica de fine-tuning sobre Qwen3.5-9B-Base: puede servir para analizar el efecto de distintas configuraciones de entrenamiento en un modelo base concreto.
- Depuración de pipelines de evaluación: al ser un checkpoint intermedio, puede utilizarse para validar herramientas de evaluación o para entender el impacto de la ausencia del token `eos` en las métricas.
- No es adecuado para aplicaciones en producción, atención al cliente, generación de código en entornos reales ni ningún uso que requiera respuestas fiables y bien delimitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte que, debido al problema del token `eos`, cualquier métrica obtenida con este checkpoint debe interpretarse como un límite inferior y no como una medida real de rendimiento.

## Requisitos de hardware

- Tamaño del repositorio: 18,8 GB, lo que sugiere pesos en precisión FP16 o BF16.
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19-20 GB (solo pesos), por lo que se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L40S).
- Con cuantización a 8 bits, la VRAM necesaria bajaría a unos 10 GB; con 4 bits, a unos 5 GB, aunque no se ha confirmado la disponibilidad de estas cuantizaciones para este checkpoint.
- Opciones de despliegue: al ser un modelo safetensors, podría cargarse con frameworks como vLLM, llama.cpp u Ollama, pero no hay instrucciones oficiales ni pruebas de compatibilidad.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos. El checkpoint es un fine-tune de `Qwen/Qwen3.5-9B-Base`, pero no se dispone de resultados de rendimiento que permitan una comparación objetiva con el modelo base ni con otros ajustes finos.

## Limitaciones y advertencias

- Problema crítico con el token `eos`: falta el token `248046` (`<|im_end|>`), por lo que el modelo no finaliza correctamente los turnos y puede sobrepasar la ventana de contexto.
- Checkpoint intermedio: no es un modelo final; fue generado a las 91,7 horas de una ejecución de 100 horas y su rol es "intermediate".
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o su redistribución sin autorización explícita.
- Sin benchmarks propios: no hay métricas fiables de rendimiento, y las que pudieran obtenerse estarían sesgadas por el problema del `eos`.
- Sin información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- No recomendado para producción ni para tareas que requieran respuestas completas y bien delimitadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h091.submission.step_1900
- Modelo original DeepSeek V4 Flash (referencia): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Variante DeepSeek V4 Flash 0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Ficha de DeepSeek V4 Flash en LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- Despliegue de DeepSeek V4 Flash en Vast.ai: https://vast.ai/model/deepseek-v4-flash
