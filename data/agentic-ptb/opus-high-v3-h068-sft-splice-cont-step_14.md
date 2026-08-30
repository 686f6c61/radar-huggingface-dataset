# agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_14

## Resumen

Este checkpoint, identificado como `opus-high-v3.h068.sft-splice-cont.step_14`, es un artefacto intermedio del proyecto AgentPTB, concretamente del run de entrenamiento denominado **opus-high-v3**. El proyecto AgentPTB investiga metodologías de entrenamiento agentico, y este checkpoint en particular corresponde al paso 14 de una fase de *SFT splice* (empalme de pesos) dentro de la hora 68 del run. Está construido a partir del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y licencia Apache 2.0.

La característica más relevante es que el run **no produjo ninguna mejora en los pesos entrenados** (etiquetado como *negative-results*). El autor lo publica explícitamente con fines de reproducibilidad y estudio cualitativo, advirtiendo en la model card de que no se debe inferir calidad del modelo a partir de su publicación. Es, por tanto, un checkpoint de investigación, no un modelo destinado a uso práctico.

Su relevancia actual reside en que forma parte de un esfuerzo por documentar resultados negativos en entrenamiento de LLMs, algo poco habitual pero valioso para la comunidad. Al ser un derivado directo de Qwen3.5-9B-Base, hereda las capacidades de ese modelo base, aunque no se ha verificado ninguna mejora adicional mediante el proceso SFT aplicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base, sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9.4 mil millones de parámetros. El checkpoint forma parte de un experimento de *SFT splice* dentro del run `opus-high-v3` del proyecto AgentPTB, que investiga metodologías de entrenamiento agentico mediante un enfoque de "empalme" de pesos (probablemente combinando o interpolando pesos de diferentes fases de entrenamiento). Según la información disponible, el run completo no encontró ninguna mejora en los pesos entrenados; todos los sub-runs SFT regresaron, es decir, no superaron al modelo base. Este checkpoint se conserva como artefacto intermedio para reproducibilidad y análisis cualitativo.

No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni la metodología exacta de *splice* empleada. La información pública se limita a la etiqueta `negative-results` y a la advertencia del autor de que no se debe inferir calidad de la publicación.

## Capacidades

- Las capacidades son las del modelo base Qwen3.5-9B-Base, al no haberse producido ninguna mejora verificada en los pesos.
- No se ha publicado información específica sobre capacidades de razonamiento, generación de código, tool calling o soporte multilingüe para este checkpoint concreto.
- Al tratarse de un checkpoint intermedio con resultados negativos, no se recomienda su uso para tareas que requieran fiabilidad.
- El autor no proporciona ninguna lista de capacidades adicionales más allá de la herencia del modelo base.

## Casos de uso

Dado que este checkpoint es un artefacto de investigación con resultados negativos, no tiene casos de uso práctico para producción. Su finalidad es exclusivamente investigadora:

- Reproducibilidad de experimentos: permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos documentados.
- Estudio cualitativo de fallos: analizar por qué el entrenamiento SFT no produjo mejoras, comparando los pesos de este checkpoint con los del modelo base.
- Investigación sobre *splice* de pesos: sirve como ejemplo de un intento fallido de empalme, útil para entender las condiciones en las que esta técnica no funciona.
- Documentación de resultados negativos: contribuye a la literatura de buenas prácticas en IA, donde los fallos se reportan con menos frecuencia que los éxitos.
- Comparación de metodologías: puede usarse como punto de referencia para evaluar si futuros runs del proyecto AgentPTB superan estos resultados.
- Análisis de regresión: investigar por qué los pesos regresaron al estado base, lo que puede revelar problemas de inicialización o de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ningún otro benchmark. Dado que el run se considera fallido, es probable que no se hayan ejecutado evaluaciones formales, o que estas no se hayan hecho públicas.

## Requisitos de hardware

Los requisitos son estimaciones basadas en el tamaño del modelo (9.4B parámetros) y en el tamaño del repositorio (18.8 GB, consistente con pesos en BF16/FP16):

- VRAM estimada para inferencia: ~19 GB en precisión FP16/BF16; ~9.5 GB en cuantización INT8; ~5 GB en cuantización INT4 (si se aplicara, aunque no se han publicado cuantizaciones específicas).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para FP16 sin cuantizar; GPUs de 16 GB (RTX 4080, A100 40GB) pueden funcionar con cuantización INT8.
- Cabe en GPUs de consumo (RTX 3090/4090) si se aplica cuantización, pero no hay cuantizaciones oficiales publicadas para este checkpoint.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían cargar el modelo, pero no se ha verificado su compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h068...` | 9.4B | no disponible | sin benchmarks publicados | Apache 2.0 |
| `Qwen/Qwen3.5-9B-Base` (modelo base) | 9.4B | no disponible | no disponible en esta ficha | Apache 2.0 |
| Otros checkpoints de AgentPTB (p. ej. `opus-high-v1`) | 9.4B | no disponible | sin benchmarks publicados | Apache 2.0 |

No se dispone de datos de rendimiento para ninguno de estos modelos. La comparativa se limita a parámetros y licencia. El modelo base Qwen3.5-9B-Base es la referencia natural, y este checkpoint no aporta ninguna mejora verificada respecto a él.

## Limitaciones y advertencias

- **Resultados negativos**: el run de entrenamiento no produjo ninguna mejora en los pesos; el checkpoint es un artefacto fallido desde el punto de vista del rendimiento.
- **No apto para producción**: el propio autor advierte que no se debe inferir calidad de su publicación, y lo etiqueta como `intermediate` y `negative-results`.
- **Sin información de sesgos o alucinación**: no se han documentado evaluaciones de sesgos, robustez o riesgos de alucinación.
- **Sin especificaciones de contexto**: se desconoce la longitud de contexto efectiva de este checkpoint, aunque probablemente herede la del modelo base.
- **Sin soporte de cuantización oficial**: no se han publicado versiones cuantizadas, lo que limita su despliegue en hardware modesto.
- **Restricciones de uso**: aunque la licencia Apache 2.0 permite uso comercial, el modelo no ofrece valor práctico para ello debido a su falta de mejoras verificadas.

## Enlaces

- [HuggingFace: agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_14](https://huggingface.co/agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_14)
- [Dataset del run: agentic-ptb/opus-high-v3-data](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto: agentic-ptb/INDEX](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelos de agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
