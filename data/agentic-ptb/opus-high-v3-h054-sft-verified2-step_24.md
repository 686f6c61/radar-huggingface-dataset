# agentic-ptb/opus-high-v3.h054.sft-verified2.step_24

## Resumen

El modelo `agentic-ptb/opus-high-v3.h054.sft-verified2.step_24` es un checkpoint intermedio derivado de un proceso de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Forma parte del proyecto AgentPTB, concretamente del run denominado `opus-high-v3`, un experimento de fine-tuning con Claude Code. El checkpoint se retiene con fines de reproducibilidad y estudio cualitativo, pero la model card advierte explícitamente que el run no encontró mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

Con 9,4 mil millones de parámetros y una arquitectura heredada de Qwen3.5-9B-Base, este modelo se posiciona como un artefacto de investigación para analizar fallos en procesos de fine-tuning, más que como un modelo listo para uso práctico. Su relevancia radica en documentar resultados negativos y permitir la comparación entre diferentes configuraciones de entrenamiento dentro del ecosistema AgentPTB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4 B parámetros. El proceso de entrenamiento forma parte del run `opus-high-v3` del proyecto AgentPTB, que utiliza Claude Code como orquestador. La model card indica que el checkpoint corresponde al paso 24 del sub-run `sft-verified2`, dentro de la hora de ejecución `h054`. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación empleadas (RLHF, DPO, etc.).

El resultado principal del run es negativo: no se observó mejora en los pesos entrenados respecto al modelo base. Este dato es crucial para interpretar cualquier uso posterior del checkpoint, ya que no representa un avance sobre Qwen3.5-9B-Base.

## Capacidades

No se dispone de información específica sobre las capacidades del modelo más allá de las heredadas de su base Qwen3.5-9B-Base. Dado que el run no mostró mejora, no se puede afirmar que el fine-tuning haya aportado habilidades adicionales. Las capacidades generales de un modelo de 9,4 B basado en Qwen incluirían, en principio:

- Generación de texto y razonamiento general (no confirmado para este checkpoint)
- Soporte multilingüe (no confirmado, sin datos de idiomas)
- Tool calling y function calling (no confirmado, depende de la configuración del base)
- Capacidades de agente y razonamiento multi-paso (no confirmado)

Sin embargo, ante la ausencia de benchmarks y la advertencia de resultados negativos, no se recomienda asumir ninguna capacidad específica.

## Casos de uso

Dado que es un checkpoint intermedio con resultados negativos, sus aplicaciones prácticas son limitadas y orientadas a investigación:

- Reproducibilidad de experimentos: utilizado para verificar los resultados del run `opus-high-v3` y comparar configuraciones dentro del proyecto AgentPTB.
- Estudio de fallos en fine-tuning: permite analizar por qué el proceso SFT no mejoró los pesos y qué factores contribuyeron al resultado negativo.
- Análisis de dinámicas de entrenamiento: al ser un checkpoint intermedio (paso 24), puede usarse para observar la evolución de los pesos durante el entrenamiento y detectar problemas de convergencia o degradación.
- Desarrollo de metodologías de evaluación: sirve como caso de estudio para diseñar criterios de validación que detecten tempranamente runs fallidos.
- Comparación cualitativa: permite comparar la salida de este checkpoint con el modelo base y otros checkpoints del mismo proyecto para entender diferencias sutiles.
- Documentación de resultados negativos: útil para la comunidad de investigación como ejemplo de publicación de artefactos fallidos con transparencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el run no encontró mejora en los pesos entrenados, por lo que no se espera que este checkpoint supere al modelo base en ninguna métrica estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B parámetros en fp16, se necesitan aproximadamente 18,8 GB de VRAM (coincide con el tamaño del repo). En cuantización de 4 bits, podría reducirse a unos 5-6 GB, pero no se dispone de archivos cuantizados publicados.
- GPU recomendadas: una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40 GB) para inferencia en fp16 sin cuantización. Con cuantización, podría ejecutarse en GPUs de 8-12 GB, pero no hay archivos GGUF o AWQ disponibles.
- Opciones de despliegue: al ser un checkpoint intermedio sin cuantizaciones publicadas, las opciones estándar serían vLLM, Hugging Face Transformers o TGI, siempre que se cargue en fp16. No se recomienda su despliegue en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El único punto de referencia claro es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual deriva. Dado que el run no mostró mejora, el rendimiento esperado sería igual o inferior al del base. No se conocen otros modelos comparables en el mismo contexto de experimentación AgentPTB con datos públicos de rendimiento.

## Limitaciones y advertencias

- Resultados negativos: el run no encontró mejora en los pesos entrenados, por lo que este checkpoint no ofrece ventajas sobre el modelo base.
- No apto para producción: al ser un artefacto intermedio con fines de investigación, no debe utilizarse en aplicaciones reales.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar.
- Información incompleta: no se dispone de datos sobre sesgos, alucinación, limitaciones de contexto o idioma.
- Licencia apache-2.0: permite uso comercial, pero el modelo no es recomendable para ello debido a su naturaleza experimental.
- Advertencia del autor: la model card indica explícitamente "no inferir calidad de la publicación".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h054.sft-verified2.step_24
- Dataset del run (archive): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
