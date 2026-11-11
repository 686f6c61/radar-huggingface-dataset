# richardyoung/Qwen2.5-7B-Instruct-ARA-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-ARA-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-ARA-heretic, una versión "abliterada" (con los mecanismos de rechazo eliminados) de Qwen/Qwen2.5-7B-Instruct. La abliteración se realizó con Heretic 2.0, empleando el método Arbitrary-Rank Ablation (ARA), una técnica de optimización que busca eliminar la direccionalidad de rechazo en el espacio de activaciones sin degradar en exceso el comportamiento general del modelo. El resultado es un modelo que responde a muchas peticiones que el original rechaza, con una divergencia KL de primer token de 0,021 respecto al original.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales y una ventana de contexto de 32.768 tokens (heredada del modelo base Qwen2.5). Esta compilación GGUF está pensada para ejecutarse en llama.cpp y Ollama, con cuantizaciones Q4_K_M como opción por defecto y un importance matrix (imatrix) para las variantes de 3 a 5 bits.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigación sobre eliminación de rechazos y su medición; por otro, sirve como caso práctico de cuantización GGUF con imatrix sobre un modelo derivado. El autor lo publica explícitamente como material de investigación sobre abliteración, no como asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), derivado mediante abliteración ARA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (por defecto), imatrix; en preparacion IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer decoder-only de 7.615.616.512 parámetros. Sobre él se aplicó Heretic 2.0 con Arbitrary-Rank Ablation (ARA), un método de optimización que busca direcciones de ablación de rango arbitrario para eliminar la conducta de rechazo. La selección de la prueba se hizo con la regla "menos rechazos por palabra clave en dev con KL de primer token <= 0,1", sobre una búsqueda de 100 pruebas. El resultado reportado en el paper es una reducción del rechazo del 72,1% al 4,7% (46 de 972) sobre 972 prompts dañinos retenidos, evaluados con el juez WildGuard, con una divergencia KL de primer token de 0,021 respecto al original.

Los archivos GGUF se generaron a partir de los safetensors publicados del modelo abliterado (revisión 2f7f3ee63f56, con verificación SHA-256 de cada peso) usando llama.cpp (commit 468fde9): conversión con `convert_hf_to_gguf.py --outtype bf16` y cuantización con `llama-quantize` en CPU. Las variantes IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan importance matrix calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estáticas. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de subirse.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento, código y matemáticas a nivel del modelo base (no se han publicado evaluaciones específicas de esta variante).
- Respuesta a peticiones que el modelo original rechaza, con una tasa de rechazo del 4,7% sobre el conjunto de evaluación del paper.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en esta variante).
- Capacidades multilingües limitadas al inglés según la model card (`language: en`), aunque el modelo base Qwen2.5 es multilingüe.
- No incluye modo thinking explícito, visión ni audio.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como artefacto reproducible para estudiar la eliminación de rechazos, medir su efecto con jueces automáticos (WildGuard) y comparar métodos (ARA frente a ablación de rango 1).
- Evaluación de defensas frente a la eliminación de rechazos: permite probar clasificadores de seguridad, filtros de salida y técnicas de alineación robusta contra un modelo deliberadamente desalineado en rechazos.
- Estudio de cuantización y comportamiento de rechazo: las distintas cuantizaciones (Q4_K_M, IQ4_XS, Q5_K_M, etc.) permiten medir cómo la cuantización altera la tasa de rechazo, un fenómeno advertido por el propio autor.
- Despliegue local en llama.cpp u Ollama para experimentación: el Q4_K_M de 4,7 GB cabe en GPUs de consumo y permite iterar rápidamente en pruebas de prompts y temperaturas.
- Análisis de divergencia KL y fidelidad al modelo original: útil para investigar cuánto se desvía un modelo abliterado en distribución de primer token y en generaciones largas.
- Generación de datos sintéticos en dominios donde el modelo original rechaza sistemáticamente, con las salvaguardas legales y éticas correspondientes y bajo responsabilidad del usuario.

## Benchmarks y rendimiento

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 72,1% | 4,7% (46/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (prueba seleccionada) | no disponible | 8 |
| Divergencia KL de primer token respecto al original (prueba seleccionada) | no disponible | 0,021 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores describen el modelo en bf16 y provienen del paper del autor; los archivos GGUF cuantizados no fueron evaluados en el paper y la cuantización puede alterar la conducta de rechazo.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 4,7 GB en disco; en inferencia requiere aproximadamente 5-6 GB de VRAM con overhead de contexto. Q8_0 estaría en torno a 8-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q4_K_M y Q8_0; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, el Q4_K_M cabe en GPUs con 8 GB o más; las variantes de 3-4 bits caben en 6 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run richardyoung/qwen2.5-7b-instruct-ara-heretic`), y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, text-generation-webui).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-ARA-heretic-GGUF (este) | 7,6B | no disponible | 4,7% (bf16) | apache-2.0 | GGUF |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 | 72,1% (bf16) | apache-2.0 | safetensors |
| richardyoung/Qwen2.5-7B-Instruct-ARA-heretic | 7,6B | no disponible | 4,7% | apache-2.0 | safetensors |

No se dispone de datos de otras variantes abliteradas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente de propósito general: el autor lo publica para estudiar la eliminación de rechazos y sus defensas.
- Eliminación deliberada de rechazos: responde a peticiones que el original rechaza, lo que implica riesgo de generar contenido dañino, ilegal o inseguro. El usuario es responsable del uso lícito.
- Las cifras de rechazo (4,7%) corresponden al modelo en bf16; la cuantización puede modificar la conducta de rechazo y no fue evaluada en el paper.
- Idiomas: la model card declara únicamente inglés, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está verificado.
- Riesgo de alucinación y sesgos heredados de Qwen2.5-7B-Instruct, no mitigados por la abliteración.
- Licencia apache-2.0 con las mismas restricciones de uso que el modelo fuente; conviene revisar la model card del modelo base para condiciones adicionales.
- No apto para producción en aplicaciones orientadas a usuarios finales sin filtros de seguridad adicionales.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic-GGUF
- Modelo base abliterado: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Paper citado (arXiv pendiente de enlace): Young, R. J. "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors", 2026.
