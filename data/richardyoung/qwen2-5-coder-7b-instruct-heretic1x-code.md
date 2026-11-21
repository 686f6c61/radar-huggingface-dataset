# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-code es una variante "abliterated" (decensored) del modelo Qwen2.5-Coder-7B-Instruct de Alibaba, publicada por el usuario richardyoung. Se trata de un ajuste fino realizado con la técnica Heretic 1.x, cuyo objetivo es eliminar los mecanismos de rechazo y alineación de seguridad del modelo original para tareas de investigación sobre comportamiento de modelos y generación de contenido sin filtros. El modelo conserva la arquitectura transformer densa de Qwen2.5 y sus 7.615.616.512 parámetros (aproximadamente 7,6 mil millones).

El modelo base Qwen2.5-Coder-7B-Instruct está especializado en generación de código, con una ventana de contexto de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5) y soporte para tool calling. Esta variante hereda esas capacidades técnicas, pero modifica el comportamiento conversacional al eliminar las capas de rechazo, lo que la hace inadecuada para despliegues de producción orientados al público general.

Es relevante ahora porque los modelos "abliterated" se han convertido en objeto de estudio académico para analizar cómo se codifica la seguridad en los LLM y qué información se pierde o se preserva al eliminar los mecanismos de rechazo. No obstante, el acceso está restringido (gated) y su uso comercial presenta incertidumbres legales a pesar de la licencia Apache 2.0 declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only con RoPE, GQA y SwiGLU; detalles exactos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens nativos, extensible a 131.072) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en BF16/FP16 se puede cuantizar a GGUF, AWQ, GPTQ mediante herramientas estandar |
| Idiomas soportados | en (ingles declarado en la model card); el modelo base soporta multiples idiomas, pero esta variante solo declara ingles |
| Licencia | apache-2.0 (declarada en los tags); el acceso es restringido (gated) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only denso con atención de consultas agrupadas (GQA), codificaciones posicionales rotatorias (RoPE) y activación SwiGLU, entrenado por Alibaba sobre un corpus masivo de código y texto. El modelo base fue sometido a instrucción tuning y alineación para tareas de programación, con soporte de tool calling y contexto largo.

Sobre esa base, richardyoung aplicó la técnica Heretic 1.x, un método de "abliteration" que identifica y modifica direcciones en el espacio de activaciones asociadas a los comportamientos de rechazo, eliminando o atenuando la negativa del modelo a responder ciertas peticiones. La model card no especifica el número de tokens de ajuste, la composición del dataset de ablación ni si se empleó DPO, RLHF u otra técnica de optimización; esa información no está disponible. El resultado es un modelo que mantiene las capacidades de generación de código del original pero con las barreras de seguridad reducidas o eliminadas.

## Capacidades

- Generación de texto y código en inglés, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento sobre código: explicación, refactorización, depuración y generación de tests.
- Soporte de tool calling / function calling (heredado del modelo base).
- Capacidades de agente y razonamiento multi-paso (heredadas del modelo base).
- Comportamiento "decensored": responde a peticiones que el modelo original rechazaría, lo que constituye su rasgo diferencial.
- Capacidades multilingües del modelo base potencialmente presentes, aunque la model card solo declara inglés.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: analizar qué comportamientos se eliminan al aplicar abliteration y comparar respuestas con el modelo original para estudiar la codificación de la seguridad en LLM.
- Red teaming controlado: generar respuestas sin filtros en entornos aislados para evaluar clasificadores de contenido y sistemas de moderación.
- Generación de código en entornos de investigación: usar las capacidades de Qwen2.5-Coder para prototipado y experimentación donde el modelo base es adecuado, asumiendo el riesgo de respuestas no alineadas.
- Estudio de robustez de pipelines de tool calling: comprobar si la ablación afecta a la fiabilidad del function calling en flujos agénticos.
- Evaluación comparativa de modelos decensored: medir la degradación o preservación de capacidades (código, matemáticas, instrucciones) respecto al modelo base.
- Docencia e investigación académica: ilustrar en cursos de ética de IA cómo funcionan las técnicas de ablación y sus implicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15,2 GB solo para pesos, más overhead de KV cache; se recomienda 20-24 GB.
- VRAM estimada en cuantización 8 bits: alrededor de 8 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4): alrededor de 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16; RTX 4090 (24 GB) para BF16 ajustado o 8 bits; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 con contexto moderado, y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (el tag text-generation-inference está presente), llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct-heretic1x-code | 7,6 B | no disponible (base: 32.768) | apache-2.0, acceso gated | Variante abliterated, solo inglés declarado |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 (extensible a 131.072) | apache-2.0 | Modelo base alineado, multilingüe, uso comercial claro |
| Otras variantes abliterated de Qwen2.5-Coder | ~7,6 B | variable | variable | Existen múltiples forks comunitarios con técnicas similares; no se dispone de datos comparativos en la informacion proporcionada |
| Modelos coder de 7B comparables (p. ej. CodeLlama-7B-Instruct, DeepSeek-Coder-6.7B) | 6,7-7 B | 16.384-100.000 según modelo | licencias propias | No se dispone de benchmarks de esta variante para comparar rendimiento |

## Limitaciones y advertencias

- Modelo "decensored": la eliminación de rechazos aumenta el riesgo de generar contenido dañino, ilegal o inseguro; no apto para aplicaciones de cara al público.
- Riesgo de alucinación heredado del modelo base, potencialmente agravado por la pérdida de calibración tras la ablación.
- Solo declara inglés; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribución automatizada.
- Licencia Apache 2.0 declarada, pero el uso comercial de un modelo abliterated puede entrar en conflicto con políticas de proveedores cloud y con normativas de moderación de contenido; revisar caso por caso.
- No hay benchmarks publicados que cuantifiquen la degradación de capacidades respecto al modelo base.
- La model card no documenta el proceso de entrenamiento, el dataset de ablación ni las evaluaciones de seguridad; trazabilidad limitada.
- Sesgos conocidos: no documentados en la informacion proporcionada; se asumen los del modelo base Qwen2.5-Coder.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio Qwen2.5-Coder (GitHub): https://github.com/QwenLM/Qwen2.5-Coder
- Paper técnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Blog de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
