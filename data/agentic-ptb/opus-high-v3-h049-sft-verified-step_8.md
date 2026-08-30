# agentic-ptb/opus-high-v3.h049.sft-verified.step_8

## Resumen

`agentic-ptb/opus-high-v3.h049.sft-verified.step_8` es un checkpoint intermedio derivado de un experimento de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base. Lo publica el usuario `agentic-ptb` como parte de una serie de ejecuciones etiquetadas como `opus-high-v3`, que forman parte de un proyecto de investigación más amplio sobre entrenamiento de modelos con agentes (AgentPTB). El checkpoint corresponde al paso 8 de una ejecución de 49 horas y se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

La propia model card advierte explícitamente de que la ejecución **no encontró mejora alguna en los pesos entrenados**, por lo que se clasifica como un resultado negativo. Esto significa que, desde el punto de vista práctico, el checkpoint no ofrece capacidades adicionales respecto al modelo base y no debe utilizarse como referencia de calidad. Su relevancia radica en documentar un intento fallido de entrenamiento, lo que puede ser útil para investigar por qué ciertas configuraciones de SFT no convergen o no producen ganancias.

El modelo tiene 9.409.813.744 parámetros (unos 9,4 mil millones), un tamaño de repositorio de 18,8 GB en formato `safetensors` y se distribuye bajo licencia Apache 2.0. No se proporcionan datos sobre arquitectura interna, longitud de contexto, idiomas soportados ni cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (transformer; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint derivado de un proceso de SFT sobre el modelo base Qwen/Qwen3.5-9B-Base. No se han publicado detalles sobre la arquitectura interna del modelo base (número de capas, atención, etc.) ni sobre el dataset de entrenamiento utilizado. Según la model card, el checkpoint proviene de una ejecución etiquetada como `opus-high-v3`, que forma parte de un proyecto denominado AgentPTB, en el que se emplea un agente (presumiblemente Claude Code) para orquestar experimentos de entrenamiento.

El punto clave es que la ejecución **no produjo ninguna mejora en los pesos**: el run se detuvo en la hora 49 (h049) y el checkpoint `step_8` se conserva como artefacto intermedio para reproducibilidad. No se indica si se aplicaron técnicas como RLHF, DPO o decodificación especulativa. Tampoco se documenta el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

Dado que se trata de un checkpoint sin mejoras verificadas, sus capacidades son, en la práctica, las del modelo base Qwen3.5-9B. No se han publicado evaluaciones específicas para este checkpoint. Se puede esperar que:

- Genere texto y siga instrucciones de forma similar al modelo base, aunque sin garantías.
- No se ha verificado soporte de tool calling, agentes o razonamiento multi-paso.
- Las capacidades multilingües dependen del modelo base, pero no se han documentado para este checkpoint.
- No se ha confirmado ningún modo especial (thinking mode, visión, audio).

En resumen, no se debe asumir ninguna capacidad adicional ni siquiera la paridad con el modelo base sin una evaluación independiente.

## Casos de uso

Dado su carácter de resultado negativo, los casos de uso son muy limitados y orientados a investigación:

- **Estudio de reproducibilidad de entrenamiento**: analizar por qué una configuración concreta de SFT no produce mejoras, comparando los pesos del checkpoint con los del modelo base.
- **Investigación de fallos de convergencia**: investigar si el problema está en el dataset, la tasa de aprendizaje, la inicialización u otros hiperparámetros.
- **Análisis de checkpoints intermedios**: estudiar la evolución de los pesos a lo largo de los pasos para detectar posibles signos de degradación o estancamiento.
- **Validación de pipelines de experimentación**: usar este checkpoint como caso de control para verificar que un pipeline de entrenamiento funciona correctamente incluso cuando el resultado es negativo.
- **Documentación de resultados negativos**: contribuir a la literatura abierta sobre qué configuraciones no funcionan, evitando que otros investigadores repitan los mismos errores.
- **Comparación de métricas de calidad**: si se dispone de los datos del run, comparar las métricas de evaluación del checkpoint con las del modelo base para cuantificar la ausencia de mejora.

No es adecuado para uso en producción, aplicaciones de usuario final ni integración en servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que el run no mostró mejora, es probable que el rendimiento sea equivalente al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del tamaño de parámetros (9,4 mil millones) y el peso del repositorio (18,8 GB en FP32 o BF16), se pueden estimar los siguientes requisitos para inferencia:

- **VRAM estimada**:
  - FP16/BF16 (sin cuantizar): ~19 GB (9,4B × 2 bytes por parámetro).
  - Cuantización Q8 (8 bits): ~10 GB.
  - Cuantización Q4 (4 bits): ~5-6 GB.
- **GPUs recomendadas**: para FP16 se necesitaría una GPU con 24 GB (por ejemplo, RTX 4090, A10G, L4). Con cuantización Q4 se podría usar una GPU de 8 GB, pero no se ha verificado compatibilidad.
- **Despliegue**: al ser un checkpoint de Qwen3.5, probablemente sea compatible con vLLM, llama.cpp, Ollama o TGI, pero no hay confirmación oficial.
- **Latencia y throughput**: no disponibles.

Estas cifras son estimaciones generales para modelos de ~9B y no deben tomarse como especificaciones verificadas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este checkpoint. Al tratarse de un resultado negativo derivado de Qwen3.5-9B-Base, la comparación más relevante sería con el propio modelo base y con otros modelos de la familia Qwen de tamaño similar (por ejemplo, Qwen2.5-7B o Qwen3-8B), pero no hay datos de rendimiento que permitan una tabla comparativa. Se recomienda consultar las fichas de los modelos base para obtener referencias.

## Limitaciones y advertencias

- **Resultado negativo confirmado**: la model card indica explícitamente que no hubo mejora en los pesos entrenados. No se debe inferir calidad alguna a partir de su publicación.
- **Checkpoint intermedio**: no es un modelo final ni optimizado para producción.
- **Falta de documentación**: no se especifican arquitectura, datos de entrenamiento, hiperparámetros ni métricas de evaluación.
- **Sesgos y alucinaciones**: no se han evaluado; se heredan los posibles sesgos del modelo base Qwen3.5-9B, pero no hay estudios al respecto.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un resultado negativo su utilidad comercial es nula.
- **Riesgo de confusión**: su nombre (`opus-high-v3`) podría inducir a error y asociarse con Claude Opus, pero no tiene relación con los modelos de Anthropic.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h049.sft-verified.step_8)
- [Dataset asociado al run (agentic-ptb/opus-high-v3-data)](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB (agentic-ptb/INDEX)](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
