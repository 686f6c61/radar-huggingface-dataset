# insraq/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated

## Resumen

`insraq/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated` es una versión "decensored" (abliterada) del modelo `empero-ai/Qwen3.8-2B`, un destilado completo de Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B. El autor, insraq, ha aplicado la técnica de abliteración con Heretic v1.4.0 para eliminar los mecanismos de rechazo del modelo original, reduciendo las negativas de 82/100 a 3/100, manteniendo una divergencia KL de 0.0109 respecto al modelo sin abliterar. El resultado es un modelo de 2.213 millones de parámetros con razonamiento chain-of-thought, function calling nativo y un contexto de 262.144 tokens, pensado para entornos edge.

La relevancia de este modelo radica en que combina la capacidad de razonamiento destilada de un teacher de 2.4 billones de parámetros con un tamaño reducido (2B) y una licencia Apache 2.0, lo que permite su uso comercial sin restricciones. Además, al ser una versión abliterada, ofrece respuestas sin filtros de seguridad en temas sensibles, lo que puede ser útil para investigación en alineación o para aplicaciones donde se requiera máxima libertad generativa, aunque con los riesgos asociados.

El modelo se distribuye en formato safetensors compatible con Transformers, vLLM y SGLang, y requiere kernels especiales de atención lineal (Gated DeltaNet) para un rendimiento óptimo. Su peso en bf16 es de aproximadamente 4,4 GB, lo que permite ejecutarlo en GPUs de consumo y en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (texto, base vision-language) con atención híbrida lineal (Gated DeltaNet) |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (repo en bf16; se pueden generar GGUF/AWQ a partir de los pesos) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5, un transformer causal con capas de atención lineal híbrida (Gated DeltaNet) que permite manejar contextos largos de 262.144 tokens con menor coste computacional que la atención completa. Aunque la base Qwen3.5 es un modelo vision-language, esta variante utiliza únicamente la ruta de texto. El entrenamiento original de `empero-ai/Qwen3.8-2B` consistió en una destilación off-policy (SFT) sobre aproximadamente 30.000 trazas de razonamiento del teacher Qwen3.8 2.4T A95B, con filtrado de calidad. Todos los parámetros fueron actualizados (full fine-tune, no adaptadores). Posteriormente, insraq aplicó abliteración con Heretic v1.4.0, una técnica que identifica y elimina direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, ajustando los pesos de `attn.o_proj` y `mlp.down_proj` según los parámetros indicados en la model card.

El proceso de abliteración es reproducible: el repositorio incluye un directorio `reproduce` con el README y los scripts necesarios. La divergencia KL de 0.0109 respecto al modelo original indica que la alteración es mínima en términos de distribución de salidas, mientras que la tasa de rechazos cae drásticamente.

## Capacidades

- Generación de texto con razonamiento chain-of-thought: cada respuesta abre con un bloque ` thinking` aprendido directamente de las trazas del teacher, no generado sintéticamente.
- Razonamiento matemático y lógico: mejora significativa en GSM8K (0.640 flexible-extract) frente al base Qwen3.5-2B (0.330).
- Conocimiento general y comprensión de instrucciones: MMLU con CoT alcanza 0.548 (flexible-extract) frente a 0.283 del base.
- Function calling nativo según la especificación Qwen3.5, sin necesidad de wrappers ni fine-tunes específicos.
- Soporte para agentes y tareas multi-paso gracias al razonamiento destilado y al contexto largo de 262.144 tokens.
- Capacidad multilingüe limitada: solo inglés declarado, aunque puede generalizar parcialmente a otros idiomas por herencia del base.
- Modo "thinking" explícito: el modelo genera razonamiento interno antes de la respuesta final, lo que facilita el parseo y la depuración.

## Casos de uso

- Atención al cliente automatizada en inglés: el contexto de 262.144 tokens permite gestionar conversaciones multi-turno muy largas sin pérdida de información, y el razonamiento chain-of-thought ayuda a resolver consultas complejas. La abliteración evita respuestas evasivas en temas delicados, aunque requiere supervisión humana.
- Generación de código con explicaciones: el modelo puede producir snippets de código con razonamiento paso a paso, útil para asistentes de desarrollo integrados en IDEs o pipelines de CI/CD. Su function calling nativo permite conectarlo a APIs y herramientas.
- Tutoría y educación en matemáticas: con un GSM8K de 0.640, puede resolver problemas aritméticos y algebraicos mostrando el proceso, adecuado para plataformas de aprendizaje automático.
- Agentes autónomos en entornos edge: su tamaño de 2B y la compatibilidad con vLLM/SGLang lo hacen apto para dispositivos con recursos limitados (Raspberry Pi, teléfonos) que necesiten razonamiento y ejecución de herramientas.
- Investigación en alineación y seguridad de IA: al ser una versión abliterada reproducible, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas antes y después de la abliteración.
- Generación de contenido creativo sin restricciones: para aplicaciones de escritura o brainstorming donde se requiera explorar temas controvertidos sin filtros, siempre que el uso cumpla con la legislación aplicable.
- Análisis de documentos largos: el contexto de 262K tokens permite procesar libros técnicos, informes o bases de conocimiento completas en una sola pasada, con razonamiento para extraer conclusiones.

## Benchmarks y rendimiento

Los benchmarks disponibles corresponden al modelo original `empero-ai/Qwen3.8-2B` (antes de la abliteración), medidos con `lm-evaluation-harness` y protocolos CoT. No se han publicado resultados específicos para la versión abliterada, aunque la divergencia KL de 0.0109 sugiere un rendimiento casi idéntico.

| Tarea | Metrica | Qwen3.5-2B (base) | Qwen3.8-2B | Δ |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.330 | 0.640 | +0.310 |
| gsm8k_cot | exact_match (strict) | 0.545 | 0.640 | +0.095 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.283 | 0.548 | +0.265 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.004 | 0.225 | +0.221 |

Parámetros de generación recomendados: `temperature=0.6, top_p=0.95, top_k=20`. El decodificado greedy en generaciones largas produce bucles de repetición, por lo que se recomienda muestreo.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 4,4 GB. Con cuantización a 8 bits cabría en ~2,5 GB y a 4 bits en ~1,5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4060) para bf16 sin offload. Para cuantizaciones más agresivas, GPUs de 4 GB pueden ser suficientes.
- Ejecución en CPU: posible con kernels optimizados, aunque la atención lineal requiere `flash-linear-attention` y `causal_conv1d` compilados con CUDA para un rendimiento aceptable; sin ellos, se usan operaciones PyTorch lentas.
- Opciones de despliegue: Transformers (con soporte Qwen3.5), vLLM, SGLang. Para GGUF/Ollama habría que convertir los pesos manualmente, no hay builds oficiales.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización; en una RTX 4090 se espera una generación de decenas de tokens por segundo en bf16, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (flexible) | MMLU (flexible) | Licencia | Abliterado |
|---|---:|---:|---:|---:|---|---|
| Qwen3.5-2B (base) | 2,2B | 262.144 | 0.330 | 0.283 | Apache 2.0 | No |
| empero-ai/Qwen3.8-2B | 2,2B | 262.144 | 0.640 | 0.548 | Apache 2.0 | No |
| insraq/...-Heretic-Abliterated | 2,2B | 262.144 | no disponible (KL 0.0109 vs original) | no disponible | Apache 2.0 | Sí |

Otras alternativas de 2-3B como Llama 3.2 3B o Gemma 2 2B no se incluyen por falta de datos comparables en la información disponible. La principal diferencia frente al base es la destilación del razonamiento, que duplica el rendimiento en GSM8K y MMLU. Frente al modelo sin abliterar, la única diferencia es la eliminación de rechazos con una alteración mínima de la distribución.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal o éticamente cuestionable sin filtros. No debe desplegarse en producción sin moderación externa.
- Solo inglés declarado; el rendimiento en otros idiomas no está garantizado.
- El decodificado greedy produce bucles de repetición en generaciones largas; es obligatorio usar muestreo con los parámetros recomendados.
- Los kernels de atención lineal (Gated DeltaNet) requieren compilación específica; sin ellos, el modelo funciona pero con lentitud y alto consumo de memoria.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de seguridad ni de exactitud; el usuario asume la responsabilidad.
- Los benchmarks publicados corresponden al modelo original, no a la versión abliterada; aunque la KL divergence sugiere equivalencia, no hay mediciones directas.
- El contexto de 262K tokens puede degradar la calidad en generaciones muy largas; se recomienda no exceder 16K tokens de salida por pasada.
- Al ser un modelo destilado, puede presentar alucinaciones en dominios especializados fuera de su distribución de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/insraq/Qwen3.5-2B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo original (empero-ai/Qwen3.8-2B): https://huggingface.co/empero-ai/Qwen3.8-2B
- Modelo base (Qwen/Qwen3.5-2B): https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Proyecto Heretic (abliteration): https://heretic-project.org
- Ejemplo de Qwen3.5 abliterado en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated
- Guía de modelos Qwen3.5 locales: https://insiderllm.com/guides/qwen-3-5-local-guide/
