# hohotach6/Llama-3.2-3B-ascii-cats-f16-GGUF

## Resumen

Llama-3.2-3B-ascii-cats-f16-GGUF es un ajuste fino (fine-tuning) del modelo Llama 3.2 3B de Meta, publicado por el usuario hohotach6 en Hugging Face. El modelo se ha entrenado y convertido a formato GGUF mediante la librería Unsloth, lo que lo hace directamente ejecutable con llama.cpp y compatible con el ecosistema de inferencia local. El nombre del repositorio sugiere una especialización en la generación de arte ASCII de gatos, aunque la model card no documenta explícitamente el dataset ni el procedimiento de ajuste.

El modelo base, Llama 3.2 3B, es un transformer decoder-only de aproximadamente 3.210 millones de parámetros, diseñado por Meta para tareas de generación de texto y con soporte multilingüe. Este ajuste concreto conserva esa arquitectura y tamaño, pero redistribuye los pesos hacia el dominio específico del fine-tuning, por lo que su rendimiento en tareas generales puede degradarse respecto al modelo original.

La relevancia de esta ficha es limitada: se trata de un modelo de nicho, sin descargas ni valoraciones, sin licencia declarada y sin benchmarks publicados. Resulta útil como ejemplo de pipeline Unsloth → GGUF para desarrolladores que quieran replicar el flujo de conversión, pero no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, fine-tuning) |
| Parametros totales | 3.212.749.888 (~3,21 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B soporta 128k tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | F16 (unico archivo publicado: `Llama-3.2-3B.F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 3B: un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU, con aproximadamente 3,21 mil millones de parámetros. El ajuste fino se realizó con Unsloth, una librería que optimiza el entrenamiento (LoRA/QLoRA y kernels personalizados) y que, según la model card, permitió entrenar "2x más rápido". No se especifica si se usó LoRA, QLoRA o ajuste completo, ni el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF/DPO.

La conversión a GGUF se realizó también con las herramientas de Unsloth, generando un único archivo en precisión F16. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio proceso de cuantización a GGUF para inferencia con llama.cpp.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Llama 3.2 3B.
- Generación de arte ASCII, presumiblemente especializada en gatos según el nombre del repositorio (no confirmado en la model card).
- Compatibilidad con llama.cpp mediante `llama-cli` y `llama-mtmd-cli` (según la model card, aunque no se documenta soporte multimodal real).
- Soporte de plantillas de chat mediante el flag `--jinja`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el modelo base las tiene, pero no se confirma su preservación tras el ajuste).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de arte ASCII de gatos: uso principal sugerido por el nombre del repositorio; el modelo puede producir representaciones textuales de gatos para terminales, documentación o bots de chat.
- Prototipado de pipelines Unsloth → GGUF: sirve como referencia práctica para desarrolladores que quieran replicar el flujo de fine-tuning y conversión a GGUF con llama.cpp.
- Pruebas de inferencia local con llama.cpp: al ser un GGUF F16 de ~6,4 GB, permite validar el funcionamiento de `llama-cli` y plantillas Jinja en entornos locales.
- Experimentos educativos sobre fine-tuning de Llama 3.2: útil en cursos o talleres para ilustrar cómo un ajuste específico altera el comportamiento del modelo base.
- Generación de contenido creativo de nicho (arte textual temático): puede integrarse en scripts o bots que necesiten salidas ASCII con temática felina.
- Evaluación comparativa de degradación por fine-tuning: permite medir cuánto pierde un Llama 3.2 3B en tareas generales tras un ajuste estrecho, como ejercicio de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 6,4 GB solo para los pesos, más overhead de contexto y KV cache (estimación orientativa: 8-10 GB en total para contextos moderados).
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 o superiores para F16 sin offloading.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090). En GPUs de 8 GB requeriría offloading parcial a CPU o cuantización adicional no publicada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por compatibilidad GGUF también Ollama, LM Studio o servidores basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en su flujo estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-ascii-cats-f16-GGUF | ~3,21 B | no disponible | no disponible | GGUF (F16) | Fine-tuning de nicho, sin benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | ~3,21 B | 128k | Llama 3.2 Community License | safetensors, GGUF | Modelo base oficial, con benchmarks publicados |
| Qwen2.5-3B-Instruct | ~3,09 B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa generalista con licencia permisiva |
| Phi-3.5-mini-instruct | ~3,8 B | 128k | MIT | safetensors, GGUF | Alternativa de Microsoft con licencia permisiva |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; además, al derivar de Llama 3.2, hereda las restricciones de la Llama 3.2 Community License de Meta, que deben respetarse.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de su calidad en ninguna tarea.
- Riesgo de degradación por fine-tuning: al ser un ajuste estrecho (presumiblemente sobre arte ASCII de gatos), es probable que haya pérdida de capacidades generales respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de 3B y potencialmente acentuado por el ajuste específico.
- Idiomas no documentados: no se confirma qué idiomas preserva tras el fine-tuning.
- Contexto no confirmado: aunque el modelo base soporta 128k tokens, no se garantiza que este ajuste lo mantenga.
- Modelo de nicho sin tracción: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte comunitario.
- Un único archivo F16: no hay cuantizaciones ligeras (Q4, Q8) publicadas, lo que limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/hohotach6/Llama-3.2-3B-ascii-cats-f16-GGUF
- Unsloth (repositorio oficial): https://github.com/unslothai/unsloth
- Modelo base Llama 3.2 3B (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
