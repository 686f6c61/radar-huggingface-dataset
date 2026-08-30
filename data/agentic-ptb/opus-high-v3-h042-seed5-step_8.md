# agentic-ptb/opus-high-v3.h042.seed5.step_8

## Resumen

`agentic-ptb/opus-high-v3.h042.seed5.step_8` es un checkpoint intermedio derivado del run de entrenamiento **opus-high-v3** del proyecto AgentPTB, publicado por el usuario agentic-ptb. Se trata de un fine-tuning sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros, y su propósito declarado es la reproducibilidad y el estudio cualitativo de un experimento de entrenamiento que, según la model card, **no produjo mejora alguna en los pesos entrenados** (resultado negativo).

El modelo es relevante porque documenta un caso de estudio de fallo de entrenamiento: el run completo no encontró mejoría respecto al base, y este checkpoint concreto (paso 8, seed 5, hora 42) se conserva para análisis. No está pensado para uso productivo ni para inferencia general, sino como material de investigación sobre dinámica de entrenamiento, reproducibilidad y degradación de modelos. Su licencia Apache 2.0 permite uso y modificación, pero su valor práctico es exclusivamente académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tuning de Qwen/Qwen3.5-9B-Base (transformer, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (heredados del base, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint intermedio de un fine-tuning sobre `Qwen/Qwen3.5-9B-Base`. La arquitectura subyacente es la del modelo base de Qwen (transformer denso, presumiblemente con atención estándar), aunque no se proporcionan detalles específicos de la variante Qwen3.5. El run `opus-high-v3` pertenece a la celda `opus@high` del proyecto AgentPTB, que ejecuta experimentos de entrenamiento con agentes (Claude Code) para estudiar el comportamiento de los pesos.

Según la model card, el run completo **no encontró mejora en los pesos entrenados**: los cinco runs de SFT registrados en experimentos anteriores (como `opus-high-v2`) degradaron y el run actual tampoco produjo ganancias. Este checkpoint concreto (`step_8`, `seed5`, `h042`) se conserva para reproducibilidad. No hay información pública sobre el dataset de entrenamiento, el número de tokens, ni si se usaron técnicas como RLHF o DPO. El autor etiqueta el modelo como `negative-results` y advierte explícitamente que no se debe inferir calidad a partir de su publicación.

## Capacidades

- No se han verificado capacidades funcionales de este checkpoint; al ser un resultado negativo, es probable que su rendimiento sea igual o inferior al del modelo base.
- El modelo base Qwen3.5-9B podría conservar capacidades de generación de texto, razonamiento y código, pero no hay evidencia de que este fine-tuning las mantenga o mejore.
- No hay información sobre soporte de tool calling, funciones de agente, ni capacidades multimodales.
- Las capacidades multilingües no están documentadas para este checkpoint.
- No se ha publicado ningún modo de pensamiento (thinking mode) ni características especiales.

## Casos de uso

Dado que se trata de un checkpoint de investigación con resultado negativo, los casos de uso son exclusivamente de estudio y análisis, no de producción:

- **Estudio de reproducibilidad de entrenamiento**: permite a investigadores comparar cómo varía la pérdida y los pesos entre seeds (seed5) y pasos (step_8) en un run que no converge correctamente.
- **Análisis de fallos de convergencia**: sirve para investigar por qué el fine-tuning degrada respecto al base, examinando los tensores en este punto intermedio.
- **Diagnóstico de degradación de pesos**: útil para estudiar mecanismos de regresión en SFT, como la pérdida de capacidades del modelo base tras entrenamiento adicional.
- **Comparación de estrategias de entrenamiento**: el proyecto AgentPTB publica múltiples checkpoints (v1, v2, v3); este permite comparar el comportamiento entre runs y configuraciones.
- **Desarrollo de métricas de calidad temprana**: investigadores pueden usar este checkpoint para validar si ciertas métricas intermedias predicen el fracaso final del entrenamiento.
- **Educación en ingeniería de modelos**: como ejemplo documentado de un resultado negativo, es material didáctico para entender que publicar checkpoints sin mejora es una práctica válida para la transparencia científica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el run no encontró mejora, es probable que el rendimiento sea inferior al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- **VRAM estimada**: el repo pesa 18,8 GB, lo que sugiere pesos en FP16 o BF16 (9,4B parámetros × 2 bytes ≈ 18,8 GB). Para inferencia en FP16 se necesitarían aproximadamente 19-20 GB de VRAM, más overhead de activaciones y atención.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) podría cargar el modelo en FP16 con margen ajustado; una A100 40 GB o H100 sería más cómoda. No hay datos oficiales de latencia o throughput.
- **Compatibilidad con GPU de consumo**: sí, una RTX 4090 o RTX 3090 (24 GB) podría ejecutarlo en FP16, pero con limitaciones de contexto (desconocido). En cuantización de 8 bits (no disponible) cabría en 12-14 GB.
- **Opciones de despliegue**: al ser un checkpoint de investigación sin cuantizaciones publicadas, solo se podría usar con frameworks que carguen safetensors directamente (transformers, vLLM si es compatible con la arquitectura Qwen3.5). No hay archivos GGUF ni soporte en Ollama o llama.cpp confirmado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con su modelo base y con otros modelos densos de ~9B:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h042.seed5.step_8` | 9,41B | No disponible | Apache 2.0 | Checkpoint experimental, resultado negativo |
| `Qwen/Qwen3.5-9B-Base` | ~9B | No disponible | Apache 2.0 (según base) | Modelo base, disponible en HuggingFace |
| Llama 3.1 8B (referencia) | 8,03B | 128K | Llama 3.1 Community License | Modelo de producción con benchmarks publicados |

No hay comparativa directa posible porque este checkpoint no tiene métricas propias y su propósito no es competir con modelos de producción.

## Limitaciones y advertencias

- **Resultado negativo confirmado**: el run no encontró mejora en los pesos; el modelo no debe usarse como si fuera un fine-tuning exitoso.
- **Sin garantías de calidad**: el autor advierte explícitamente que no se debe inferir calidad a partir de la publicación.
- **Sesgos heredados**: al derivar de Qwen3.5-9B-Base, puede arrastrar sesgos del modelo base, aunque no hay análisis específico.
- **Riesgo de alucinación**: no evaluado; probablemente similar o mayor al del base debido al entrenamiento fallido.
- **Contexto e idiomas no documentados**: no se especifican límites de contexto ni cobertura idiomática; se recomienda no usarlo en producción.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo no es apto para ello por su naturaleza experimental.
- **Caveat de reproducibilidad**: es un checkpoint intermedio (paso 8 de un run largo); puede no representar el estado final del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h042.seed5.step_8
- Dataset asociado del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
