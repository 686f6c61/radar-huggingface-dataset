# richardyoung/Qwen2.5-32B-Instruct-DiM-heretic

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba Qwen, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el ajuste fino busca eliminar los mecanismos de rechazo y censura del modelo original, de modo que responda a peticiones que el modelo base declinaría. La técnica se enmarca en la familia de métodos conocidos como "abliteration" o "heretic", orientados a modificar direcciones de activación asociadas a comportamientos de rechazo sin reentrenar desde cero.

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct: un transformer decoder-only denso de aproximadamente 32.760 millones de parámetros, con una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). Está pensado para generación de texto y chat en inglés, con licencia Apache 2.0, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en Hugging Face.

Su relevancia es doble: por un lado, sirve como caso de estudio de las técnicas de modificación de comportamiento en modelos abiertos; por otro, plantea de forma explícita los dilemas de seguridad, responsabilidad y licencia que acompañan a los modelos "sin censura". No se han publicado resultados de benchmarks propios en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del autor; el base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos (131.072 ampliado) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-32B-Instruct, un transformer decoder-only denso con atención de múltiples cabezas con RoPE, normalización RMSNorm y FFN con SwiGLU. El ajuste fino aplicado por richardyoung se etiqueta como "heretic", "uncensored", "decensored" y "abliterated", lo que indica una modificación dirigida a suprimir las respuestas de rechazo del modelo base. No se detalla en la información disponible el método exacto (abliteration por proyección de direcciones, DPO con pares de rechazo, o una combinación), ni el volumen de datos, ni si hubo RLHF/DPO adicional.

Los tags incluyen referencias a los papers arXiv:2309.00071 y arXiv:2407.10671, que corresponden a trabajos sobre refusal direction y abliteration en modelos abiertos. El entrenamiento del base Qwen2.5-32B-Instruct incluyó un corpus multilingüe de hasta 18 billones de tokens, con fases de SFT y RLHF; el ajuste heretic opera sobre ese checkpoint ya alineado. No hay información pública sobre la composición del dataset de ajuste ni sobre evaluaciones de regresión de capacidades tras la modificación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento, matemáticas y código heredados del base Qwen2.5-32B-Instruct.
- Respuestas a peticiones que el modelo original rechazaría (comportamiento "uncensored").
- Soporte de tool calling / function calling heredado del base (no verificado tras el ajuste).
- Capacidad de agentes y razonamiento multi-paso (heredada, no verificada).
- Multilingüe limitado: la ficha declara solo inglés, aunque el base soporta más idiomas.
- Sin visión ni audio: es un modelo puramente textual.

## Casos de uso

- Investigación sobre alineación y seguridad: estudiar cómo varía la tasa de rechazo y la calidad de respuesta tras aplicar técnicas de abliteration, comparando con el base Qwen2.5-32B-Instruct.
- Red teaming y evaluación de robustez: usar el modelo como sujeto de pruebas para medir la eficacia de filtros de salida y clasificadores de seguridad en pipelines propios.
- Generación creativa sin restricciones editoriales: escritura de ficción, guiones o contenido narrativo con temáticas sensibles, donde el modelo base tendería a rechazar.
- Análisis de contenido y datos sensibles: resumen y clasificación de textos que incluyen lenguaje explícito o temas delicados en entornos controlados de investigación.
- Experimentación con técnicas de modificación de comportamiento: replicar el pipeline heretic/abliteration sobre otros checkpoints y usar este modelo como referencia.
- Asistente conversacional autoalojado en inglés: despliegue en infraestructura propia para chat general, con la advertencia de que la ausencia de rechazos exige filtros externos.
- Generación de código y tareas técnicas: aprovechar las capacidades de programación del base en entornos donde no se requiere moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos propios del ajuste heretic ni comparación con el base Qwen2.5-32B-Instruct en MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: ~65,5 GB de pesos, por lo que se necesitan al menos 2× A100 40 GB, 1× A100 80 GB, 1× H100 80 GB o 2× RTX 4090 24 GB con tensor parallelism.
- Cuantización INT8: ~33 GB, cabe en una A100 40 GB o en 2× RTX 4090.
- Cuantización 4-bit (GPTQ/AWQ/GGUF Q4): ~18-20 GB, cabe en una RTX 4090 24 GB o RTX 3090 24 GB.
- No cabe en GPUs consumer de 16 GB o menos ni en CPU con latencia aceptable.
- Despliegue: transformers, text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic | ~32,8 B | no disponible (base: 32.768) | apache-2.0 | Ajuste heretic/abliterated, acceso restringido, solo inglés |
| Qwen/Qwen2.5-32B-Instruct | ~32,8 B | 32.768 (131.072 ampliado) | apache-2.0 | Base alineado, multilingüe, acceso abierto |
| Qwen/Qwen2.5-Coder-32B-Instruct | ~32,8 B | 131.072 | apache-2.0 | Especializado en código, alineado |
| Meta Llama 3.3 70B Instruct | ~70 B | 128.000 | Llama 3.3 Community License | Mayor tamaño, multilingüe, licencia con restricciones |

## Limitaciones y advertencias

- Modelo "uncensored": no aplica rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o explícito; requiere filtros externos en producción.
- Riesgo elevado de alucinación y de respuestas plausibles pero incorrectas en temas sensibles.
- Solo declara inglés; el rendimiento en otros idiomas puede degradarse respecto al base.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del ajuste; la responsabilidad legal del uso recae en el desplegador.
- No hay benchmarks publicados que confirmen que las capacidades del base se conservan tras la modificación.
- El ajuste heretic puede degradar la coherencia en tareas que dependen de negativas legítimas (por ejemplo, asistencia médica o legal).
- Fecha de creación en la ficha (2026-11-05) resulta anómala respecto a la cronología esperada; conviene verificar metadatos antes de confiar en ellos.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Paper refusal direction: https://arxiv.org/abs/2309.00071
- Paper Qwen2.5: https://arxiv.org/abs/2407.10671
