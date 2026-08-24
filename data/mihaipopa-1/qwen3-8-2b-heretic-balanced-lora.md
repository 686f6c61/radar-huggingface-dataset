# MihaiPopa-1/Qwen3.8-2B-Heretic-Balanced-LoRA

## Resumen

`MihaiPopa-1/Qwen3.8-2B-Heretic-Balanced-LoRA` es un adaptador LoRA que aplica una técnica de "decensoring" (eliminación de censura) sobre el modelo `empero-ai/Qwen3.8-2B-Distill`, una destilación completa de Qwen3.8 2.4T A95B en la arquitectura Qwen3.5-2B. El autor, MihaiPopa-1, utiliza la herramienta Heretic v1.4.0 para realizar un proceso de abliteración que reduce drásticamente las negativas del modelo (de 83/100 a 4/100) manteniendo una divergencia KL de solo 0.0095 respecto al original, lo que indica que el comportamiento general apenas se altera.

El modelo base es relevante porque lleva el razonamiento encadenado (chain-of-thought) destilado de un modelo de 2.4 billones de parámetros a una clase de peso de 2B, con 262.144 tokens de contexto nativo y soporte nativo de function calling. La versión decensurada añade interés para casos de uso donde las negativas del modelo original bloquean tareas legítimas (escritura creativa, análisis de contenido sensible, investigación). Se distribuye bajo licencia Apache 2.0 y está pensado para entornos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5-2B (atención lineal con Gated DeltaNet + capas de atención clásica) |
| Parametros totales | 2B (modelo base); adaptador LoRA con parámetros no especificados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 nativo (~4 GB); cuantizaciones adicionales no especificadas |
| Idiomas de soporte | Inglés (declarado); capacidades multilingües heredadas del base no documentadas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-2B-Distill` es una destilación full-parameter (no un adaptador) del teacher Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B, que emplea un diseño híbrido con capas de atención lineal basadas en Gated DeltaNet combinadas con atención clásica. El entrenamiento del student consistió en SFT (off-policy distillation) sobre aproximadamente 30.000 trazas de teacher de alta calidad, filtradas, que cubren matemáticas, razonamiento general y seguimiento de instrucciones. Cada respuesta abre con un bloque `thinking` aprendido de las trazas reales del teacher.

El adaptador LoRA de esta ficha se genera mediante Heretic v1.4.0, una herramienta de abliteración automática que identifica la dirección en el espacio de activaciones responsable de las negativas y la elimina ajustando pesos de `o_proj` en atención y `down_proj` en MLP. Los parámetros de abliteración se documentan en la model card (direction_index 10.31, pesos máximos/mínimos por proyección). No se aplica ningún fine-tuning adicional sobre la LoRA; el adaptador solo codifica la transformación de abliteración.

## Capacidades

- Generación de texto con razonamiento encadenado: cada respuesta abre con un bloque `thinking` aprendido de trazas del teacher Qwen3.8 2.4T.
- Razonamiento matemático y lógico: el modelo base alcanza 0.640 en GSM8K (flexible-extract) frente a 0.330 del Qwen3.5-2B original.
- Conocimiento general y comprensión de instrucciones: 0.548 en MMLU (57 materias, CoT flexible) frente a 0.283 del base.
- Function calling nativo según la especificación Qwen3.5, sin wrappers ni fine-tunes específicos.
- Capacidad de agente y multi-step reasoning gracias al formato `thinking... response`.
- Modelo decensurado: tasa de negativas del 4/100 frente al 83/100 del original, con divergencia KL de 0.0095 (mínima alteración del comportamiento general).
- Despliegue en edge: 2B de parámetros, ~4 GB en bf16, ejecutable en CPU, móviles y SBC.

## Casos de uso

- Generación de código en entornos restringidos: el modelo puede integrarse en pipelines de CI/CD para generar y revisar código con razonamiento estructurado, apoyándose en el function calling nativo para invocar herramientas sin necesidad de wrappers adicionales.
- Asistentes de razonamiento matemático y lógico en educación: su destilación de CoT permite explicar pasos intermedios en problemas de aritmética y álgebra, útil en aplicaciones de tutoría offline en dispositivos de bajo consumo.
- Análisis de contenido sensible o controvertido: la versión decensurada reduce negativas en temas como violencia, sexualidad o política, permitiendo investigación académica y análisis de contenido sin bloqueos del modelo.
- Escritura creativa sin restricciones: para narrativa, guiones o ficción que requieran tramas oscuras o temas adultos, la tasa de negativas del 4/100 frente al 83/100 del original evita interrupciones constantes.
- Agentes autónomos en el edge: con 262.144 tokens de contexto y function calling nativo, puede gestionar conversaciones multi-turno largas y encadenar llamadas a herramientas en dispositivos con recursos limitados (Raspberry Pi, portátiles viejos).
- Investigación en alineación y seguridad: su documentación de parámetros de abliteración (direction_index, pesos de proyección) lo convierte en un caso de estudio para medir el impacto de la eliminación de censura en modelos pequeños.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al modelo base `empero-ai/Qwen3.8-2B-Distill` frente a su base Qwen3.5-2B, medidos con `lm-evaluation-harness` (backend HF, protocolos CoT, temperature=0.6, top_p=0.95, top_k=20):

| Tarea | Métrica | Qwen3.5-2B (base) | Qwen3.8-2B (distill) | Δ |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.330 | 0.640 | +0.310 |
| gsm8k_cot | exact_match (strict) | 0.545 | 0.640 | +0.095 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.283 | 0.548 | +0.265 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.004 | 0.225 | +0.221 |

Para la versión decensurada (esta LoRA) solo se documentan dos métricas de rendimiento:

| Métrica | Modelo LoRA | Modelo original |
|---|---:|---:|
| KL divergence | 0.0095 | 0 (por definición) |
| Refusals | 4/100 | 83/100 |

No se han publicado resultados de benchmarks adicionales específicos para el adaptador LoRA decensurado.

## Requisitos de hardware

- VRAM estimada: ~4 GB en bf16 para el modelo completo de 2B (según model card). El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3060, RTX 4060, GTX 1660, incluso iGPUs con suficiente memoria compartida). No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: sí, es el caso de uso principal ("edge").
- Opciones de despliegue: transformers (con soporte Qwen3.5), vLLM, SGLang y otros runtimes compatibles. Requiere kernels Gated DeltaNet de `flash-linear-attention` y `causal_conv1d` para las capas de atención lineal; sin ellos, caen a operaciones PyTorch lentas.
- Alternativas sin GPU: ejecutable en CPU-only, teléfonos y SBC según la model card, con cuantizaciones adicionales no especificadas.
- Latencia/throughput: no disponible. Como referencia, un modelo 2B en bf16 en una RTX 4090 suele generar 50-100 tokens/s, pero no hay datos publicados para esta LoRA.

## Comparativa con modelos similares

| Modelo | Params | Contexto | GSM8K (flex) | MMLU (flex) | Refusals | Licencia |
|---|---:|---:|---:|---:|---:|---|
| **Qwen3.8-2B-Heretic-Balanced-LoRA** (este) | 2B | 262.144 | 0.640 (base) | 0.548 (base) | 4/100 | Apache 2.0 |
| empero-ai/Qwen3.8-2B-Distill (base) | 2B | 262.144 | 0.640 | 0.548 | 83/100 | Apache 2.0 |
| Qwen/Qwen3.5-2B (base sin destilar) | 2B | 262.144 | 0.330 | 0.283 | n.d. | Apache 2.0 |
| Qwen/Qwen3-1.7B | 1.7B | 32.768 | ~0.50 (aprox.) | ~0.40 (aprox.) | n.d. | Apache 2.0 |

Los valores de Qwen3-1.7B son aproximados y no se han verificado en la información proporcionada; se incluyen solo como referencia de la categoría. La comparativa principal es entre la LoRA y su base directa.

## Limitaciones y advertencias

- Capacidad limitada por tamaño: 2B de parámetros acotan el recuerdo factual y el razonamiento multi-step muy complejo; el propio autor del base indica que "lo que limita 2B es la capacidad, no el currículo".
- Riesgo de alucinación: mayor en modelos pequeños, especialmente en tareas de conocimiento factual denso; se recomienda verificar salidas en producción.
- La decensuración puede eliminar negativas legítimas de seguridad: la tasa de negativas cae de 83/100 a 4/100, lo que puede permitir generación de contenido dañino, ilegal o no ético si no se aplican capas adicionales de filtrado.
- El bloque `thinking` puede generar respuestas largas y verbosas; se recomienda parsear y extraer la parte `response` para el usuario final.
- Decodificación greedy en generaciones largas: es un modo de fallo conocido (bucles de repetición) en modelos de razonamiento de esta clase; se recomienda sampling con temperature=0.6, top_p=0.95, top_k=20.
- Dependencias de kernels: requiere `flash-linear-attention` y `causal_conv1d` con CUDA para un rendimiento adecuado; sin ellos, las capas de atención lineal caen a operaciones PyTorch lentas.
- Idioma: la model card declara solo inglés; las capacidades multilingües no están documentadas para esta LoRA.
- Tamaño del repositorio: 0.0 GB (solo el adaptador LoRA); requiere descargar el modelo base `empero-ai/Qwen3.8-2B-Distill` por separado para funcionar.
- Uso comercial: licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales (no documentadas en la ficha).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Heretic-Balanced-LoRA
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- Proyecto Heretic (web): https://heretic-project.org
- Repositorio Qwen3.8 (QwenLM): https://github.com/QwenLM/Qwen3.8
- Perfil del autor en HuggingFace: https://huggingface.co/MihaiPopa-1
- Información de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
