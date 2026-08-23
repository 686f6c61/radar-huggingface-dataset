# hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-gguf

## Resumen

`Qwen3.8-27B-abliterated-code-analysis-preview-mtp-gguf` es una versión cuantizada en formato GGUF del modelo `hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview`, un modelo de 27.320.697.856 parámetros (~27,3B) desarrollado por el usuario "hotdogs" sobre la base de `Qwen3.8-27B`, el modelo denso de lenguaje y visión de Qwen con arquitectura híbrida full-attention + linear-attention. El modelo se distribuye bajo licencia MIT y está orientado específicamente a tareas de análisis y revisión de código, con un formato de salida estructurado y conciso.

La versión GGUF presentada en este repositorio preserva la capa MTP (multi-token prediction) del modelo base, lo que permite usar decodificación especulativa en llama.cpp para acelerar la generación sin degradar la calidad. El modelo incorpora además una técnica de "abliteration" (edición de pesos sin entrenamiento que elimina el comportamiento de rechazo) y un fine-tuning SFT mediante LoRA sobre el dataset `code-analysis-sft-qwen38`, que incluye 21.009 registros y 17 tipos de tareas de código.

Se ofrece en tres niveles de cuantización (f16, Q6_K y Q4_K_M) con velocidades de generación medidas de entre 32 y 40 tokens por segundo en configuraciones de 4× RTX 3090. La relevancia actual de este modelo radica en que combina análisis de código estructurado, ausencia de rechazo en tareas de seguridad y una capa de decodificación especulativa lista para usar en entornos de producción con llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida full-attention + linear-attention (64 capas, hidden size 5.120, GQA con 24 query heads y 4 key/value heads) |
| Parámetros totales | 27.320.697.856 (~27,3) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredado de Qwen3.8-27B, no especificado en la model card) |
| Tipos de cuantización | f16 (54,6 GB), Q6_K (20,9 GB), Q4_K_M (15,7 GB) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; la base Qwen3.8-27B es multilingüe) |
| Licencia | MIT |
| Formato de pesos | GGUF (convertido desde safetensors con `convert_hf_to_gguf.py`) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 64 capas con hidden size de 5.120, atención por grupos (GQA) con 24 cabezas de consulta y 4 cabezas de clave/valor, y una arquitectura híbrida que combina full-attention con linear-attention para reducir coste computacional en secuencias largas. Sobre esta base, hotdogs aplicó primero un proceso de "abliteration" sin entrenamiento: una edición de pesos de rango-1 que ortogonaliza la dirección de rechazo (refusal direction) de los 131 residual-stream writers, eliminando el comportamiento de negarse a responder sin tocar el resto de capacidades.

Posteriormente, se realizó un fine-tuning SFT mediante LoRA sobre el dataset `hotdogs/code-analysis-sft-qwen38`, compuesto por 21.009 filas y 17 tipos de tareas de análisis de código. Este ajuste cambia el formato de salida respecto al modelo base: sustituye el razonamiento verbose CoT (377-1.102 caracteres) por un CoT corto de 84-136 caracteres y una estructura con secciones `## Analysis`, `## Review` y `## Explanation`, además de un conteo de issues encontrados ("Found N issue(s) in X lines"). La capa MTP (multi-token prediction) se conserva durante la conversión a GGUF, quedando registrada como tensores `blk.64.nextn.*` y la metadada `qwen35.nextn_predict_layers`, que llama.cpp detecta automáticamente para decodificación especulativa.

## Capacidades

- Análisis de código con formato estructurado: genera secciones `## Analysis`, `## Review` y `## Explanation` con conteo de issues encontrados.
- Revisión de seguridad de código: detecta vulnerabilidades en lenguajes como Python, incluyendo el uso inseguro de funciones como `eval` o `open`.
- Explicación de fragmentos de código: produce explicaciones concisas de funciones y algoritmos.
- Razonamiento de múltiples pasos con CoT corto: el fine-tuning reduce el razonamiento verbose y lo sustituye por un CoT breve orientado a tareas de código.
- Decodificación especulativa mediante MTP: la capa `nextn` actúa como draft head, acelerando la generación en builds de llama.cpp con soporte (b10438 o superior).
- Capacidades de visión del modelo base: el modelo original Qwen3.8-27B es un modelo de lenguaje y visión, aunque esta versión GGUF no documenta explícitamente el soporte de imágenes en la inferencia.
- Generación de texto sin rechazo: el proceso de abliteration elimina la negativa del modelo a responder ciertas consultas, lo que es relevante para tareas de análisis de código sensible.

## Casos de uso

- Revisión de seguridad de código en entornos de desarrollo: el modelo puede analizar fragmentos de código Python, Java u otros lenguajes y enumerar vulnerabilidades concretas (uso de `eval`, rutas inseguras, etc.), con un formato de salida que facilita su integración en herramientas de análisis estático.
- Análisis de código en pipelines de CI/CD: su formato estructurado (`## Analysis`, `## Review`) permite parsear la salida automáticamente y generar informes de issues en pull requests o commits.
- Explicación de código heredado: dado su CoT corto y su formato de respuesta conciso, es adecuado para generar documentación de fragmentos de código complejos en proyectos con deuda técnica.
- Asistente de code review en IDE: con la cuantización Q4_K_M (15,7 GB) puede ejecutarse en estaciones de trabajo con GPU consumer, proporcionando sugerencias de revisión en tiempo real.
- Generación de resúmenes de seguridad para auditorías: el conteo de issues ("Found N issue(s) in X lines") permite generar informes de auditoría rápidos sin procesamiento adicional.
- Investigación en decodificación especulativa: la capa MTP preservada permite experimentar con técnicas de aceleración de inferencia en llama.cpp, comparando throughput con y sin `--draft-max`.
- Entrenamiento de agentes de análisis de código: el formato de salida estable y estructurado facilita el uso del modelo como herramienta dentro de agentes autónomos que necesitan respuestas parseables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible de este modelo. La model card únicamente documenta pruebas de humo de velocidad de generación:

| Configuración | Velocidad de generación | Hardware |
|---|---|---|
| f16 | 8,0 t/s | 5× RTX 3090 |
| Q6_K | 32,3 t/s | 4× RTX 3090 |
| Q4_K_M | 40,5 t/s | 4× RTX 3090 |

Estos datos provienen de pruebas de humo del autor y no constituyen un benchmark formal.

## Requisitos de hardware

- VRAM estimada para inferencia: el f16 requiere aproximadamente 54,6 GB de VRAM; el Q6_K ~20,9 GB; el Q4_K_M ~15,7 GB. El modelo base completo (safetensors) ocupa aproximadamente 55,6 GB, según LLM Explorer.
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 en configuración de 2-4 GPUs para las cuantizaciones Q6_K y Q4_K_M; 5× RTX 3090 para f16.
- Cabe en GPU consumer: sí, la versión Q4_K_M (15,7 GB) puede ejecutarse en una sola RTX 4090 de 24 GB con contexto moderado; la Q6_K (20,9 GB) es viable en una RTX 4090 o RTX 3090 con contexto reducido.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), llama.cpp ≥ b10438 para soporte MTP, Ollama si se convierte a formato compatible, y servidores de inferencia GGUF como llamafile.
- Latencia y throughput: ~32 t/s en Q6_K con 4× 3090 y ~40 t/s en Q4_K_M con 4× 3090, según pruebas de humo del autor. Con MTP especulativo se espera un throughput efectivo mayor en builds con soporte `n_nextn`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-code-analysis-preview-mtp-gguf | 27,3B | no disponible | Híbrida full-attention + linear-attention, 64 capas | MIT | GGUF | Abliterated + SFT código + MTP |
| Qwen3.8-27B-abliterated (hotdogs) | 27,3B | no disponible | Híbrida, 64 capas | MIT | safetensors | Sin fine-tuning, abliterated, sin MTP |
| Qwen3.8-27B (Qwen) | 27,3B | no disponible | Híbrida full-attention + linear-attention | Apache 2.0 (presumible) | safetensors | Modelo base, sin abliteration, con vision-language |
| Llama 3.3 70B Instruct | 70B | 128K | Dense transformer | Llama 3.3 Community License | safetensors/GGUF | Más grande, orientado a uso general |

No se dispone de datos de benchmarks para comparar rendimiento real entre estos modelos. La comparativa se basa en características estructurales y licencias.

## Limitaciones y advertencias

- El modelo es una versión "preview" y experimental, no un lanzamiento estable; no hay garantías de robustez en producción.
- El proceso de abliteration elimina el rechazo del modelo, lo que puede provocar que responda a consultas que el modelo base rechazaría; esto implica un riesgo ético y legal en el uso de la herramienta.
- No se ha documentado la longitud de contexto soportada en esta versión GGUF, ni los idiomas exactos soportados; el modelo base es multilingüe pero no hay confirmación de la cobertura tras el fine-tuning.
- Riesgo de alucinación en análisis de código: el modelo puede inventar vulnerabilidades o problemas que no existen en el código, especialmente con contextos de más de 40 líneas.
- El fine-tuning SFT se ha realizado sobre un dataset de 21.009 filas, relativamente pequeño, lo que puede limitar la generalización a otros lenguajes de programación o estilos de código.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo deriva de Qwen3.8-27B, cuya licencia original no está documentada en la model card y podría imponer restricciones adicionales.
- El soporte MTP requiere una build de llama.cpp específica (b10438 o superior) y no es compatible con todos los frameworks de inferencia (vLLM, TGI, etc.).
- El modelo está verificado solo en hardware NVIDIA (RTX 3090/4090); no hay datos de rendimiento en GPUs AMD o Apple Silicon.

## Enlaces

- Repositorio del modelo GGUF: [https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-gguf](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview-mtp-gguf)
- Modelo base (safetensors): [https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-code-analysis-preview)
- Modelo abliterated original: [https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated)
- README del modelo abliterated (con instrucciones de uso): [https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated/blob/main/code/README.md](https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated/blob/main/code/README.md)
- Ficha en Genaihub: [https://genaihub.net/agents/hf-model-hotdogs-qwen3-8-27b-abliterated-mtp-gguf](https://genaihub.net/agents/hf-model-hotdogs-qwen3-8-27b-abliterated-mtp-gguf)
- Ficha en LLM Explorer: [https://llm-explorer.com/model/hotdogs%2FQwen3.8-27B-abliterated,3OshiP1Xtg7XK84wjMjHc](https://llm-explorer.com/model/hotdogs%2FQwen3.8-27B-abliterated,3OshiP1Xtg7XK84wjMjHc)
- Ficha en hfviewer: [https://hfviewer.com/hotdogs/Qwen3.8-27B-abliterated](https://hfviewer.com/hotdogs/Qwen3.8-27B-abliterated)
