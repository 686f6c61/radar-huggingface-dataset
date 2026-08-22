# mmiiguell10/Qwen3.8-27B-uncensored-mirror

## Resumen

El modelo `mmiiguell10/Qwen3.8-27B-uncensored-mirror` es una versión "abliterada" (también etiquetada como *OBLITERATED*) del modelo base `Qwen/Qwen3.8-27B`, un modelo denso de 26.895.998.464 parámetros (aproximadamente 26,9B) con arquitectura híbrida de atención (Gated DeltaNet lineal + atención completa) y capacidades nativas de visión-lenguaje, según las fuentes consultadas. El autor, `mmiiguell10`, publica este espejo del trabajo del proyecto OBLITERATUS de `elder-plinius`, cuyo objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original mediante técnicas de ablación de direcciones en el espacio de pesos.

La relevancia de este modelo reside en su aplicación para investigación en seguridad de IA, red-teaming y estudios de alineación: al eliminar los rechazos, permite analizar cómo responde el modelo a peticiones que el modelo base rechazaría, manteniendo un nivel de capacidad cercano al original (según los datos de la model card, la regresión en MMLU es de -0,9 puntos porcentuales en la versión V3). El modelo se distribuye en múltiples formatos (safetensors, MLX, GGUF) y bajo licencia Apache 2.0. No se especifican idiomas soportados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense, hybrid attention: Gated DeltaNet lineal + atención completa, visión-lenguaje nativo) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (según fuentes externas) |
| Tipos de cuantizacion | MLX (2/4/6/8-bit, affine, group size 64), GGUF (varias), FP8 (según fuentes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 26,9B parámetros con atención híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa, e incorpora un cabezal MTP (multi-token prediction) y control de modo de pensamiento (thinking ON/OFF). Sobre esta base, el proceso de abliteración elimina las direcciones de rechazo aprendidas durante el entrenamiento con RLHF/DPO. La versión V2 emplea una combinación de dos técnicas: SVD (análisis de componentes principales sobre la varianza capturada) y LEACE (minimización de información mutua), mezcladas en proporción 60% LEACE + 40% SVD, buscada mediante búsqueda binaria. La versión V3 aplica un refinamiento iterativo sobre V2 con un corpus de 1000 prompts (852 incorporados + 100 consultas simples + 48 avanzadas de red-teaming y agentes). No se especifican los datos de entrenamiento del modelo base.

## Capacidades

- Generación de texto sin rechazos en ambos modos de pensamiento (thinking ON y OFF) según la model card (V3 reporta 0 refusals en 15 pruebas).
- Razonamiento y resolución de problemas complejos, con soporte de modo de pensamiento explícito (aunque se recomienda desactivarlo para evitar reintroducción de rechazos).
- Generación de código y refactorización (por ejemplo, conversión de código síncrono a asíncrono con logging).
- Tool calling y ejecución de agentes ReAct (Thought/Action/SQL) según pruebas de la model card.
- Extracción de datos estructurados (JSON) a partir de texto no estructurado.
- Depuración de sistemas (debugging de pods Kubernetes, revisión de seguridad de código Flask).
- Diseño de sistemas distribuidos (por ejemplo, rate limiter con Redis).
- Capacidades multilingües: no especificadas.
- Capacidades de visión: el modelo base es nativamente visión-lenguaje, pero no se confirma en la model card del espejo.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo puede generar prompts adversariales y evaluar la robustez de sistemas de moderación o de otros LLM, aprovechando su ausencia de rechazos para probar límites de seguridad.
- Evaluación de alineación y sesgos: al comparar las respuestas del modelo abliterado con las del modelo base, los investigadores pueden cuantificar el impacto de los mecanismos de rechazo en el comportamiento y detectar sesgos latentes.
- Generación y refactorización de código en entornos de desarrollo: soporta tareas complejas como conversión síncrono→asíncrono, revisión de seguridad de código y extracción de esquemas JSON, con un rendimiento comparable al modelo stock (7/8 en tareas avanzadas según la model card).
- Agentes autónomos con tool calling: su capacidad para ejecutar loops ReAct (Thought/Action/Resultado) lo hace adecuado para prototipos de agentes que interactúan con bases de datos SQL o APIs.
- Depuración de infraestructura cloud: puede analizar logs de Kubernetes, diagnosticar fallos de pods y sugerir comandos de corrección, útil en entornos de DevOps.
- Diseño de sistemas distribuidos: puede generar arquitecturas de referencia (por ejemplo, rate limiters, colas de mensajes) para documentación técnica o evaluación de alternativas.
- Pruebas de jailbreak y mitigaciones: útil para equipos de seguridad que necesitan generar contenido que los modelos estándar rechazarían, con el fin de entrenar filtros o evaluar políticas de contenido.
- Asistencia en entornos con restricciones de contenido mínimas: aunque no se recomienda para producción sin supervisión, puede usarse en entornos controlados donde se requiere generación de texto sin filtros (siempre con las advertencias legales y éticas correspondientes).

## Benchmarks y rendimiento

La model card proporciona datos de evaluación propios del autor. Se presentan a continuación los resultados reportados:

| Modelo | MMLU (0-shot) | Refusal rate (think OFF) | Refusal rate (think ON) | Tareas avanzadas (8) |
|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,6% (n=2.850) | ~100% | ~100% | 7/8 |
| V1 (agresivo, SVD) | 81,4% (n=285) | 0% | N/A | No evaluado |
| V2 (blend 60/40) | 84,32% (n=2.850) | 0,24% (2/842) | ~33% (5/15) | 7/8 |
| **V3 (refinamiento)** | **83,7%** | **0/15** | **0/15** | **7/8** |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible. Los datos de MMLU provienen de `lm-eval-harness` y son reportados por el autor del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 requiere aproximadamente 54 GB de VRAM (26,9B × 2 bytes). Con cuantización FP8 (~27 GB), 4-bit (~14 GB) o 2-bit (~7 GB) se reduce notablemente.
- GPU recomendadas: para la versión completa en bfloat16 se necesitan GPUs de datacenter como A100 (80GB) o H100. Para cuantizaciones de 4-bit o inferiores, una RTX 4090 (24GB) o RTX 3090 (24GB) es suficiente. Para 2-bit, GPUs de 8-12 GB pueden bastar.
- Compatibilidad con consumer GPU: sí, mediante cuantización GGUF (por ejemplo, Q4_K_M) y herramientas como llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, MLX (para Apple Silicon), Transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 26,9B | 262.144 | 84,6% | Apache 2.0 | safetensors, GGUF |
| mmiiguell10/Qwen3.8-27B-uncensored-mirror (V3) | 26,9B | 262.144 | 83,7% | Apache 2.0 | safetensors, MLX, GGUF |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | 26,9B | 262.144 | No disponible | Apache 2.0 | FP8 |
| onurburak9/Qwen3.8-27B-Uncensored (MLX) | 26,9B | 262.144 | No disponible | Apache 2.0 | MLX (2/4/6/8-bit) |

Las tres variantes uncensored se basan en el mismo modelo base y emplean técnicas de abliteración similares. La diferencia principal radica en el método de ablación y en los formatos de distribución. No se dispone de comparativas con otros modelos abliterados de otros fabricantes en la información consultada.

## Limitaciones y advertencias

- El modelo elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal, ofensivo o no ético. Su uso debe limitarse a investigación de seguridad, red-teaming y evaluación de alineación, con las debidas salvaguardas.
- El modo de pensamiento (thinking) puede reintroducir rechazos: la model card advierte explícitamente que `enable_thinking` debe permanecer desactivado para evitar respuestas de rechazo parciales.
- Se requiere `repetition_penalty` de 1,15 para evitar bucles en decodificación greedy; sin él, el modelo puede repetir imports o código boilerplate.
- La temperatura recomendada es 0; valores superiores a 0,5 degradan significativamente la calidad de las respuestas.
- No se han evaluado formalmente sesgos o alucinaciones en esta versión; la eliminación de rechazos puede amplificar sesgos latentes del modelo base.
- El sistema prompt debe estar vacío; los prompts de sistema pueden reintroducir comportamientos de rechazo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir leyes o políticas de uso aceptable en ciertos contextos; el responsable del despliegue asume los riesgos legales.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un espejo reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mmiiguell10/Qwen3.8-27B-uncensored-mirror)
- [Repositorio OBLITERATUS (proyecto original)](https://github.com/elder-plinius/OBLITERATUS)
- [orcarouter/Qwen3.8-27B-Uncensored-FP8](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8)
- [Blog: How to run Qwen 3.8 27B Uncensored locally (GGUF + llama.cpp)](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Blog: Qwen3.8-27B Uncensored MLX - OrcaRouter Build Explained](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)
- [GitHub: onurburak9/Qwen3.8-27B-Uncensored (MLX)](https://github.com/onurburak9/Qwen3.8-27B-Uncensored)
