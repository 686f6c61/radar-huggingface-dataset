# mlasli/Qwen3.6-27B-abliterated

## Resumen

Qwen3.6-27B-abliterated es una variante del modelo Qwen3.6-27B de Alibaba, en la que se ha eliminado el vector de rechazo mediante la técnica de abliteración con la herramienta Heretic v1.4.0. El modelo resultante conserva las capacidades del original —un transformer denso de 27 000 millones de parámetros con ventana de contexto de 262 000 tokens extensible a 1 millón— pero deja de rechazar peticiones que el modelo base consideraría no permitidas. Está orientado a investigación de seguridad, red-teaming, escritura creativa sin filtros y agentes de código sin restricciones.

La abliteración se realizó sin fine-tuning, únicamente modificando la dirección del flujo residual, lo que produce una divergencia KL de 0.0118 respecto al modelo base, es decir, la distribución de salida es prácticamente idéntica salvo por la ausencia de rechazos. El modelo mantiene la licencia Apache 2.0 del original, lo que permite uso comercial, modificación y redistribución. Está disponible en formato safetensors y es compatible con el ecosistema transformers.

Esta variante es relevante porque el modelo base, Qwen3.6-27B, destaca en tareas de codificación y agente —según su creador iguala a Claude 4.5 Opus en Terminal-Bench 2.0 y supera al MoE de 397B en codificación agéntica— pero su alineación de seguridad bloquea muchas peticiones legítimas de investigación. La versión abliterada elimina ese bloqueo sin degradar las capacidades generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (similar a Qwen3.6-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (extensible a 1 000 000) |
| Tipos de cuantizacion | BF16, 8-bit, 4-bit (BitsAndBytes) |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una abliteración del Qwen3.6-27B original, un transformer denso de 27B parámetros desarrollado por Alibaba Cloud. La técnica de abliteración, implementada con Heretic v1.4.0, identifica la dirección del vector de rechazo en el flujo residual del modelo y la elimina, sin necesidad de fine-tuning ni de inyección de prompts. El resultado es un modelo que conserva la arquitectura, el tokenizador y los pesos del original, pero que no produce respuestas de rechazo ante peticiones que el modelo base consideraría problemáticas.

El modelo base fue entrenado con un enfoque en codificación, razonamiento y capacidades de agente, con un dataset multilingüe. La abliteración no añade conocimiento nuevo ni modifica las capacidades aprendidas; solo elimina el comportamiento de rechazo. Según los datos del autor, la tasa de rechazo se reduce al 12 % (88 % de cumplimiento) con una divergencia KL de 0.0118, lo que indica que la distribución de salida es casi idéntica a la del modelo base.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples dominios, incluyendo matemáticas, lógica y análisis técnico.
- Generación de código en diversos lenguajes, con soporte para tool calling y uso en agentes de codificación.
- Capacidades multimodales: el pipeline declarado es image-text-to-text, lo que indica soporte para entrada de imágenes junto con texto.
- Soporte de agentes y multi-step reasoning, adecuado para tareas que requieren planificación y ejecución de múltiples pasos.
- Multilingüe, con soporte declarado para inglés y otros idiomas (sin especificar cuáles).
- Sin filtros de contenido: no rechaza peticiones sobre seguridad, escritura creativa explícita, jailbreak o investigación de alineación.

## Casos de uso

- Investigación de seguridad y red-teaming: el modelo permite analizar vulnerabilidades, escribir exploits educativos o estudiar técnicas de bypass sin que el modelo se niegue a responder. Su alta tasa de cumplimiento (88 %) y su baja divergencia respecto al modelo base lo hacen útil para pruebas de penetración en entornos controlados.
- Agentes de codificación sin restricciones: puede integrarse con herramientas como OpenCode, Cline o Aider para generar código, refactorizar o automatizar tareas de desarrollo sin que el modelo bloquee peticiones sobre temas sensibles (por ejemplo, código para pruebas de seguridad).
- Escritura creativa sin filtros: ideal para autores que necesitan explorar temas controvertidos, violencia o contenido adulto sin que el modelo imponga censura. La ventana de contexto de 262K permite mantener tramas largas y coherentes.
- Experimentación con jailbreak y alineación: los investigadores pueden estudiar cómo responde un modelo sin alineación de seguridad a técnicas de jailbreak, comparando con el modelo base para medir el impacto de la abliteración.
- Generación de documentación técnica y análisis de código: su capacidad de razonamiento y su contexto largo permiten procesar repositorios completos y generar documentación, resúmenes o explicaciones de arquitecturas complejas.
- Asistente de programación en producción: con cuantización 4-bit (17 GB VRAM) puede desplegarse en GPUs de consumo como RTX 4090, ofreciendo asistencia de código con tool calling en entornos de desarrollo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante abliterada en la información disponible. El autor menciona que el modelo base Qwen3.6-27B iguala a Claude 4.5 Opus en Terminal-Bench 2.0 y supera al Qwen3.5 MoE de 397B en codificación agéntica, pero no proporciona números concretos. Tampoco se aportan métricas como MMLU, HumanEval o GSM8K para esta versión. La única métrica de rendimiento reportada es la tasa de rechazo (12 %) y la divergencia KL (0.0118), que indican que las capacidades generales se conservan prácticamente intactas.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - BF16 (precisión completa): ~55 GB
  - 8-bit: ~28 GB
  - 4-bit (BitsAndBytes): ~17 GB
- GPUs recomendadas: A100 80GB, H100, o configuraciones duales de RTX 4090 (48 GB combinados).
- Cabe en GPUs de consumo: sí, con cuantización 4-bit en una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: compatible con transformers (carga directa), y por su formato safetensors puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-27B (base) | 27B | 262K (ext. 1M) | Apache 2.0 | Modelo original con alineación de seguridad |
| Qwen3.6-27B-abliterated | 27B | 262K (ext. 1M) | Apache 2.0 | Variante sin rechazos, misma arquitectura |
| Qwen3.5 MoE (397B) | 397B (MoE) | no disponible | Apache 2.0 | MoE de mayor tamaño, superado por el base en codificación agéntica |
| Llama 3.3 70B (referencia) | 70B | 128K | Llama 3.3 | Modelo denso de mayor tamaño, sin abliteración oficial |

La comparativa directa con modelos abliterados de otros fabricantes (p. ej., Llama-3-70B-abliterated) no está disponible en la información proporcionada. La principal diferencia con el modelo base es la ausencia de rechazos, mientras que el resto de características (contexto, licencia, arquitectura) son idénticas.

## Limitaciones y advertencias

- La abliteración elimina los rechazos, pero no añade conocimiento nuevo ni mejora las capacidades; sigue siendo un modelo de 27B, insuficiente para tareas que requieran razonamiento a escala de modelos >100B.
- Al eliminar la alineación de seguridad, el modelo puede generar contenido dañino, ilegal o éticamente problemático si se usa sin control. No es adecuado para aplicaciones orientadas al público general sin supervisión humana.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar hechos, citas o código incorrecto, especialmente en dominios especializados.
- La ventana de contexto de 262K es amplia, pero el rendimiento puede degradarse con contextos muy largos si no se usa la extensión a 1M adecuadamente.
- El soporte multilingüe está declarado pero no se especifican los idiomas concretos; el rendimiento puede variar significativamente entre lenguas.
- No se han publicado benchmarks independientes para esta variante; las afirmaciones sobre el rendimiento del modelo base provienen del autor y no han sido verificadas de forma externa.
- Para uso en producción, se recomienda implementar filtros de salida adicionales y validación humana, dado el propósito explícito de eliminar restricciones.

## Enlaces

- HuggingFace: https://huggingface.co/mlasli/Qwen3.6-27B-abliterated
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
