# agentic-ptb/opus-high-v3.h040.bag4.step_12

## Resumen

`opus-high-v3.h040.bag4.step_12` es un checkpoint intermedio publicado por el proyecto AgentPTB dentro de su serie de ejecuciones "opus-high-v3". Se trata de un derivado del modelo base Qwen/Qwen3.5-9B-Base, con un total de 9.409.813.744 parámetros, y está almacenado en formato safetensors. La propia model card lo clasifica como un artefacto de rol `intermediate`, generado en la hora de ejecución `h040`, y lo retiene exclusivamente con fines de reproducibilidad y estudio cualitativo.

El aspecto más relevante es que la ejecución que produjo este checkpoint **no encontró ninguna mejora en los pesos entrenados**; el autor etiqueta explícitamente el resultado como "negative-results" y advierte que no debe inferirse calidad alguna a partir de su publicación. Esto significa que no es un modelo destinado a uso práctico, sino un artefacto de investigación para auditar procesos de entrenamiento agéntico. Su licencia es Apache 2.0, lo que permite su uso y modificación, pero sin garantías de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.5-9B-Base (arquitectura transformer, detalles no confirmados) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se deriva de Qwen3.5-9B-Base, un modelo de la familia Qwen3.5 con aproximadamente 9.400 millones de parámetros. No se proporcionan detalles sobre la arquitectura interna (número de capas, dimensiones de atención, tipo de atención) más allá de la herencia del modelo base. Tampoco se especifica el método de entrenamiento aplicado durante la ejecución "opus-high-v3"; el nombre sugiere un proceso agéntico (AgentPTB) que emplea Claude Code para orquestar experimentos, pero no hay información sobre el dataset, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

El dato más relevante del entrenamiento es el resultado: la ejecución no produjo ninguna mejora en los pesos respecto al modelo base. El checkpoint se conserva tal cual, como evidencia del proceso, y el autor lo cataloga como "negative-results". Esto implica que cualquier diferencia respecto a Qwen3.5-9B-Base es, en el mejor de los casos, neutral, y en el peor, perjudicial para las capacidades del modelo.

## Capacidades

No se ha publicado ninguna evaluación de capacidades para este checkpoint. Al ser un artefacto intermedio sin validación, no se puede afirmar que conserve las capacidades del modelo base (generación de texto, razonamiento, código, etc.) ni que las haya modificado de alguna manera. La model card advierte explícitamente que no debe inferirse calidad de su publicación. Por tanto, las capacidades se consideran **no disponibles** hasta que se realicen pruebas independientes.

## Casos de uso

Dado el carácter de checkpoint intermedio con resultados negativos, no existen casos de uso prácticos recomendados. Los únicos escenarios razonables son:

- **Investigación de reproducibilidad**: sirve como referencia para reproducir la ejecución "opus-high-v3" y auditar por qué no se obtuvieron mejoras. Se puede comparar con otros checkpoints del mismo run para trazar la evolución de los pesos.
- **Estudio de dinámicas de entrenamiento agéntico**: permite analizar cómo un agente (Claude Code) gestiona el proceso de ajuste y qué decisiones llevaron al fracaso. Útil para quienes investigan metodologías de entrenamiento automatizado.
- **Pruebas de infraestructura**: se puede usar para verificar pipelines de carga de modelos, conversión de formatos o sistemas de evaluación antes de trabajar con checkpoints válidos, ya que su licencia Apache 2.0 permite su uso sin restricciones.
- **Análisis de degradación**: comparar este checkpoint con Qwen3.5-9B-Base para medir cuantitativamente el impacto de un entrenamiento fallido y documentar patrones de colapso o sobreajuste.

No se recomienda su uso en producción, en aplicaciones de usuario final o como base para fine-tuning adicional, dado que no hay evidencia de que sus pesos sean útiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, etc.) y el autor no ha compartido evaluaciones externas. Dado el aviso de "negative-results", es probable que el rendimiento sea igual o inferior al del modelo base Qwen3.5-9B-Base, pero no hay datos que lo confirmen.

## Requisitos de hardware

Al no haberse validado el modelo para inferencia, los requisitos son estimaciones basadas en su tamaño (9,4 B parámetros en precisión completa):

- **VRAM estimada para inferencia**: en FP16, un modelo de 9,4 B requiere aproximadamente 18,8 GB solo para los pesos (coincide con el tamaño del repo). Con overhead de activaciones y KV cache, se necesitan al menos 24 GB. Con cuantización a 8 bits (no disponible en el repo, pero posible tras conversión) bajaría a unos 10-12 GB; en 4 bits, unos 6-7 GB.
- **GPU recomendadas**: una RTX 4090 (24 GB) o A100 40 GB son suficientes para FP16. Para cuantización ligera, una RTX 3090 (24 GB) o incluso una RTX 4070 (12 GB) podrían bastar.
- **Opciones de despliegue**: vLLM, llama.cpp (tras conversión a GGUF), Ollama o TGI. Sin embargo, dado que el modelo no ha sido validado, no se recomienda desplegarlo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. La única referencia fiable es el modelo base Qwen/Qwen3.5-9B-Base, del cual deriva. A continuación se presenta una comparación estructural:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h040.bag4.step_12 | 9,4 B | no disponible | Apache 2.0 | Checkpoint intermedio, resultados negativos |
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | Apache 2.0 | Modelo base de producción |
| Otros modelos de 9B (p. ej., Llama 3.1 8B, Mistral 7B) | 7-9 B | 8K-128K | variadas | Modelos validados y con benchmarks |

No se puede afirmar que este checkpoint sea comparable en capacidades a ninguno de ellos, ya que no ha sido evaluado.

## Limitaciones y advertencias

- **Resultados negativos confirmados**: la ejecución que generó este checkpoint no produjo ninguna mejora en los pesos entrenados. No debe utilizarse como si fuera un modelo afinado de Qwen3.5-9B-Base.
- **Sin validación funcional**: no hay evidencia de que el modelo conserve las capacidades del base. Podría presentar degradación severa, alucinaciones aumentadas o salidas incoherentes.
- **Sin datos de contexto ni idiomas**: se desconoce la longitud de contexto efectiva y los idiomas soportados tras el entrenamiento fallido.
- **Artefacto de investigación**: su único propósito es la reproducibilidad y el estudio cualitativo. Cualquier uso en producción es desaconsejable y conlleva un riesgo alto de fallo.
- **Licencia Apache 2.0**: permite uso comercial, pero sin garantías. El autor no ofrece soporte ni responsabilidad sobre el comportamiento del modelo.
- **Sin benchmarks**: no hay métricas objetivas que respalden ninguna afirmación sobre su rendimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h040.bag4.step_12)
- [Dataset de la ejecución opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de datasets de AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Listado de modelos de AgentPTB](https://huggingface.co/models?other=agentic-ptb)
