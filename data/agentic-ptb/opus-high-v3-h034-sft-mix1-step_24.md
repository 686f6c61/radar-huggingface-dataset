# agentic-ptb/opus-high-v3.h034.sft-mix1.step_24

## Resumen

Este modelo es un checkpoint intermedio derivado de un proceso de fine-tuning sobre la base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` como parte de un experimento denominado `opus-high-v3` ejecutado mediante Claude Code. Se trata de un artefacto de investigación destinado a la reproducibilidad y al estudio cualitativo, no a su uso en producción. El propio autor lo etiqueta como `negative-results`, indicando explícitamente que el run no produjo ninguna mejora en los pesos entrenados respecto a la base.

Con 9.409.813.744 parámetros (aproximadamente 9,4B), el modelo hereda la arquitectura del Qwen3.5-9B-Base, aunque no se proporcionan detalles adicionales sobre configuración interna, longitud de contexto o capacidades específicas. Su relevancia actual es limitada: se publica como material de referencia para estudios de reproducibilidad de pipelines de entrenamiento agéntico, no como un modelo competitivo para tareas de generación de texto o razonamiento. La licencia Apache 2.0 permite su uso y modificación, pero su naturaleza de checkpoint intermedio sin mejoras documentadas lo hace inadecuado para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 (aprox. 9,4B) |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4B parámetros. No se especifican detalles sobre el número de capas, dimensión de atención o mecanismos de atención (si es atención completa o alguna variante). El checkpoint se genera como paso 24 de un proceso de entrenamiento supervisado (SFT) con una mezcla de datos denominada `sft-mix1`, dentro de un run de Claude Code etiquetado como `opus-high-v3`. El autor indica que el run se ejecutó durante 34 horas (h034) y que el checkpoint se conserva como artefacto intermedio para reproducibilidad, pero que no se observó ninguna mejora en los pesos entrenados. No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B, pero sin garantías de rendimiento debido a su naturaleza de checkpoint intermedio.
- Razonamiento: no hay evidencia de capacidades mejoradas respecto al base; el autor declara que no hubo mejora en los pesos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: el run se generó mediante Claude Code, pero el modelo en sí no declara capacidades agénticas específicas.
- Capacidades multilingües: no disponible; depende del modelo base, que soporta múltiples idiomas, pero no se confirma para este checkpoint.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo thinking).

## Casos de uso

Dado que el autor etiqueta el modelo como `negative-results` y lo describe como un checkpoint intermedio sin mejoras, los casos de uso son muy limitados y principalmente de carácter investigador:

- Reproducibilidad de experimentos: sirve para verificar el pipeline de entrenamiento de AgentPTB y comparar la evolución de los pesos entre steps.
- Estudio cualitativo de fallos: permite analizar por qué un fine-tuning no produce mejoras, útil para depurar estrategias de SFT.
- Análisis de artefactos intermedios: investigadores pueden examinar la divergencia de pesos respecto al modelo base en el step 24.
- Benchmark de referencia en pipelines de entrenamiento: puede usarse como punto de comparación en estudios sobre estabilidad de entrenamiento.
- Pruebas de infraestructura: útil para validar herramientas de carga de safetensors o pipelines de evaluación sin riesgo de sesgo por rendimiento.
- Documentación de resultados negativos: sirve como ejemplo publicado de un experimento fallido, contribuyendo a la transparencia en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Además, la etiqueta `negative-results` indica que no se encontró mejora sobre el modelo base, por lo que cualquier rendimiento sería equivalente o inferior al de Qwen3.5-9B-Base, sin datos concretos que respalden esta afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Para un modelo de 9,4B en FP16 se requerirían aproximadamente 19 GB de VRAM, pero al ser un checkpoint intermedio sin cuantizaciones publicadas, no se puede estimar con precisión.
- GPU recomendadas: no disponible. En teoría, una GPU con 24 GB (RTX 3090/4090) podría alojar el modelo en FP16, pero sin confirmación del autor.
- Compatibilidad con GPU de consumo: potencialmente sí en RTX 4090 o similar, pero no verificado.
- Opciones de despliegue: no disponibles. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h034.sft-mix1.step_24 | 9,4B | no disponible | Apache 2.0 | Checkpoint intermedio, sin mejoras |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 | Modelo base de referencia |
| Qwen/Qwen3.5-9B (instruct) | 9,4B | no disponible | Apache 2.0 | Alternativa con fine-tuning instruct |

No se dispone de información sobre otros modelos comparables de la misma categoría (fine-tunes de Qwen3.5-9B) más allá de los citados. La única comparación relevante es con su modelo base, del cual no se demuestra ninguna mejora.

## Limitaciones y advertencias

- El autor declara explícitamente que el run no produjo ninguna mejora en los pesos entrenados; no debe inferirse calidad del modelo a partir de su publicación.
- Es un checkpoint intermedio, no un modelo final; puede presentar comportamientos erráticos o degradados respecto al modelo base.
- No hay información sobre sesgos, alucinaciones ni limitaciones de contexto o idioma.
- No se recomienda su uso en producción bajo ninguna circunstancia, dado su estado experimental y la ausencia de evaluación.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantías de rendimiento hace inviable cualquier aplicación real.
- El repositorio ocupa 18,8 GB, lo que implica costes de almacenamiento y transferencia sin beneficio funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h034.sft-mix1.step_24
- Dataset asociado (run archive): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de agentic-ptb: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos con tag agentic-ptb: https://huggingface.co/models?other=agentic-ptb
