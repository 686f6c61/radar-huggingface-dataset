# agentic-ptb/opus-high-v3.h040.soup-big

## Resumen

`agentic-ptb/opus-high-v3.h040.soup-big` es un checkpoint intermedio derivado de la ejecución de Claude Code **opus-high-v3** del proyecto AgentPTB. Se trata de un ajuste fino (fine-tune) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y licencia Apache 2.0. El autor lo clasifica explícitamente como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo final listo para uso.

La model card incluye una advertencia de interpretación: la ejecución que produjo este checkpoint **no encontró ninguna mejora en los pesos entrenados**, por lo que no debe inferirse calidad a partir de su publicación. Este checkpoint se conserva únicamente para reproducibilidad y análisis. Su relevancia actual es limitada, ya que representa un resultado negativo dentro de un experimento de entrenamiento agéntico, y no ofrece capacidades documentadas ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura hereda la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9.400 millones de parámetros. No se proporcionan detalles adicionales sobre capas, dimensiones de atención ni mecanismos específicos. El proceso de entrenamiento formó parte de la ejecución **opus-high-v3** del proyecto AgentPTB, que utiliza Claude Code como orquestador agéntico. Según la model card, esta ejecución produjo checkpoints intermedios a lo largo de 40 horas (`h040`), y el presente archivo corresponde a la variante `soup-big` (mezcla de pesos). El autor indica que no se observó mejora alguna en los pesos entrenados, lo que sugiere que el proceso de fine-tuning no logró converger a una solución útil o que el experimento fue diseñado para documentar un resultado negativo.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un artefacto intermedio de un experimento sin mejoras confirmadas, no se puede afirmar que el modelo tenga habilidades concretas de generación, razonamiento, código o tool calling. La única información disponible es que se basa en Qwen3.5-9B-Base, pero sin evaluación propia. Por tanto, cualquier capacidad atribuible sería la heredada del modelo base, sin validación independiente.

## Casos de uso

Dado su carácter de checkpoint intermedio con resultados negativos, los casos de uso prácticos son muy limitados:

- Reproducibilidad de experimentos: permite a investigadores verificar los pasos del pipeline de entrenamiento agéntico de AgentPTB y confirmar que no hubo mejoras.
- Estudio cualitativo de fallos: sirve para analizar por qué el fine-tuning no convergió, examinando los pesos intermedios y comparándolos con el modelo base.
- Documentación de resultados negativos: aporta evidencia sobre los límites de ciertas estrategias de entrenamiento agéntico, útil para la comunidad científica.
- Depuración de pipelines: puede usarse como punto de control para depurar el flujo de datos o la configuración de entrenamiento.
- Comparación de checkpoints: en el contexto del dataset `agentic-ptb/opus-high-v3-data`, permite comparar este checkpoint con otros de la misma ejecución.
- No se recomienda su uso en producción ni en aplicaciones reales, dado que no hay evidencia de que funcione correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Al tratarse de un checkpoint intermedio sin mejoras demostradas, es probable que no se hayan ejecutado evaluaciones estándar.

## Requisitos de hardware

No hay especificaciones oficiales de hardware para este modelo. Dado su tamaño de 9.409.813.744 parámetros, se pueden estimar requisitos genéricos para inferencia de modelos de ~9B:

- VRAM estimada: entre 18 y 25 GB en FP16 (dependiendo de la optimización y el tamaño del lote), y entre 5 y 8 GB con cuantización de 4 bits.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 (40 GB) o similares con al menos 16 GB de VRAM para FP16.
- Es posible ejecutarlo en GPUs de consumo (RTX 3080/3090/4090) con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI, aunque no se ha verificado compatibilidad específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. La única referencia directa es su modelo base, `Qwen/Qwen3.5-9B-Base`, del cual hereda la arquitectura y los pesos iniciales. No hay datos de rendimiento que permitan compararlo con alternativas como Llama 3.1 8B, Mistral 7B o Gemma 2 9B. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Checkpoint intermedio sin mejoras demostradas: el autor advierte explícitamente que la ejecución no encontró ninguna mejora en los pesos entrenados; no debe inferirse calidad.
- Sin evaluación publicada: no hay benchmarks, métricas ni pruebas de capacidades.
- Riesgo de alucinación y errores: al ser un fine-tune fallido, es probable que el modelo produzca salidas incoherentes o incorrectas.
- No apto para producción: no se recomienda su uso en aplicaciones reales, chatbots, generación de código ni tareas críticas.
- Sesgos desconocidos: al no haber evaluación, no se conocen sesgos específicos, aunque hereda los del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero dado el estado del modelo, cualquier uso comercial sería desaconsejable.
- Idioma: no se especifican idiomas soportados; se asume herencia del modelo base, pero sin confirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h040.soup-big
- Dataset de la ejecución: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX
