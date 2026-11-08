# Shokou1/qwen3.5-4B-dawcoder

## Resumen

DAWcoder es un modelo de lenguaje de 4.205.751.296 parámetros (4B) desarrollado por Shokou1 (ShokouP) a partir del modelo base Qwen/Qwen3.5-4B. Su función no es generar audio, sino transformar un estado de proyecto de estación de trabajo de audio digital (DAW) junto con una intención expresada en lenguaje natural en un parche JSON de parámetros ejecutable, validable mediante esquema y reversible. El modelo se publica con licencia Apache-2.0 y está disponible en formato GGUF Q4_K_M (aproximadamente 2,52 GB por archivo) listo para cargarse en Ollama.

El modelo se distribuye en tres generaciones de pesos derivadas de la misma base: preview (SFT v1), sft-v2 (SFT de secuencia completa) y grpo-v3 (refinamiento con GRPO). El entrenamiento parte de un ajuste LoRA con rango 64 sobre todas las capas lineales en bf16, seguido de cuantización a Q4_K_M. La ventana de contexto es de 16.384 tokens y la longitud máxima de salida es de 8.192 tokens.

Su relevancia reside en el enfoque de "parámetros como código": el modelo emite operaciones estructuradas (`set_track`, `set_eq`, `set_comp`, `set_send`, `add_marker`, secciones y notas de textura) que pueden validarse automáticamente e integrarse en flujos de agentes con verificación de bucle cerrado mediante renderizado en el DAW. Es un modelo de nicho, orientado a la automatización de producción musical y a la investigación en agentes, no a la conversación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con adaptador LoRA r=64, all-linear |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); entrenamiento en bf16 |
| Idiomas soportados | en, zh (el chino con soporte limitado segun el autor) |
| Licencia | Apache-2.0 (conserva la declaracion original de Qwen3.5-4B) |
| Formato de pesos | safetensors (repo de 8,1 GB) y GGUF Q4_K_M (~2,52 GB por archivo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de 4B parámetros, sobre el que se aplica un ajuste LoRA de rango 64 en todas las capas lineales, entrenado en bf16. El pipeline de post-entrenamiento consta de tres fases: primero, entrenamiento continuado de preentrenamiento (CPT) con 37,1 millones de tokens durante 400 pasos, seguido de un SFT con 3.240 tareas (200 pasos) que da lugar a la generación preview. Después, un SFT de secuencia completa con longitud máxima de 4.096 tokens y sin truncamiento (100 pasos de optimizador, lr 1e-5) produce sft-v2. Finalmente, sft-v2 se refina con GRPO durante 24 pasos con 100 rollouts, coeficiente KL β=0,05 y lr 1e-6, generando grpo-v3.

Los datos de entrenamiento combinan un corpus de producción musical con licencias CC BY-SA 4.0, de dominio público, MIT y CC0, junto con datos de tareas sintéticos de creación propia (CC0). El autor indica que los manuales de REAPER y FL Studio, protegidos por derechos de autor, no forman parte del corpus. La innovación principal no es arquitectónica sino de formato: el modelo aprende a emitir tres esquemas de salida distintos según la tarea (`mix`, `form`, `texture`) con estructura JSON verificable.

## Capacidades

- Generación de parches de mezcla (`task=mix`): operaciones `set_track`, `set_eq`, `set_comp`, `set_send` y `add_marker` sobre pistas del proyecto.
- Generación de estructura musical (`task=form`): secciones y marcadores (Intro, Verse, Chorus, Bridge).
- Generación de textura y arpegios (`task=texture`): secuencias de notas con campos bar, step, key, len_steps y vel.
- Salida estructurada en JSON validable mediante esquema (`patch_validation`), con tasa de legalidad del 100 % en la evaluación del autor.
- Comprensión de intenciones de producción en lenguaje natural (por ejemplo, "la voz queda tapada por la batería, súbela un poco sin que suene fuerte").
- Integración con flujos de agentes: el parche generado se valida, se ejecuta en el DAW y se verifica con métricas de renderizado.
- Capacidades multilingües limitadas: inglés y chino (este último principalmente por el corpus de CPT).
- No dispone de tool calling genérico, visión, audio ni modo de razonamiento extendido documentados.

## Casos de uso

- Asistencia a la mezcla: el modelo recibe el estado de pistas (volumen, pan, rol) y una intención, y devuelve un parche de EQ, compresión, volumen y envíos que el ingeniero revisa y aplica; es adecuado porque la salida es estructurada y reversible.
- Borrador de estructura de canción: a partir de género, tempo y pistas, genera secciones y marcadores para montar el esqueleto de un tema antes de componer.
- Generación de texturas y arpegios: produce secuencias de notas con posición de compás, paso, tecla, duración y velocidad, útiles como punto de partida para patrones MIDI.
- Capa intermedia en agentes de producción musical: el parche JSON se valida con esquema, se ejecuta en el DAW mediante herramientas como daw-mcp-server y se mide el resultado renderizado para cerrar el bucle.
- Automatización por lotes de proyectos: procesar múltiples estados de proyecto y generar candidatos de parche para revisión posterior, gracias a la salida JSON determinista con temperature 0.
- Investigación en entrenamiento con RL: las tres generaciones (SFT, SFT completo, GRPO) permiten estudiar el efecto del post-entrenamiento sobre la legalidad de esquema y la similitud con el patch de referencia.
- Docencia y prototipado de asistentes DAW: entorno ligero (GGUF de ~2,52 GB) que cabe en hardware modesto para experimentar con asistentes de mezcla.

## Benchmarks y rendimiento

Evaluación fija del autor: 60 casos de validación equilibrados, seed 20261107, temperature 0, num_predict 8192.

| Modelo | JSON parse | Schema valido | mix | form | texture | reward (overall) |
|---|---|---|---|---|---|---|
| preview (SFT v1) | 100 % | 100 % | 20/20 | 20/20 | 20/20 | 0,9657 |
| sft-v2 | 100 % | 100 % | 20/20 | 20/20 | 20/20 | 0,9710 |
| grpo-v3 | 100 % | 100 % | 20/20 | 20/20 | 20/20 | 0,9710 |

El reward se compone de 0,2 por parseo JSON, 0,35 por legalidad de esquema y 0,45 por similitud con el patch de referencia. En la tarea de mezcla, sft-v2 y grpo-v3 mejoran respecto a preview (0,9097 → 0,9246), mientras que form y texture se mantienen. El autor advierte que la evaluación mide solo corrección de formato y proximidad a los parámetros de referencia, no calidad de escucha ni de mezcla. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con GGUF Q4_K_M; en bf16 se requiere alrededor de 8-9 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para Q4_K_M (GTX 1650 4 GB, RTX 3060, RTX 4060, RTX 4090); A100 o H100 para entrenamiento o inferencia en bf16.
- Cabe en GPU consumer: sí, con la cuantización Q4_K_M.
- Opciones de despliegue: Ollama (soporte de primera clase con Modelfile incluido), llama.cpp vía GGUF, transformers con safetensors; vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4B-dawcoder | 4B | 16.384 | Parámetros de producción musical (JSON) | Apache-2.0 | Hugging Face, GGUF/Ollama |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Modelo de lenguaje general | Apache-2.0 | Hugging Face |
| Modelos generativos de audio (p. ej., MusicGen) | no disponible | no disponible | Generación de audio | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos de parámetros DAW) no está disponible: no se han identificado modelos comparables en la información proporcionada. Frente a su base Qwen3.5-4B, DAWcoder sacrifica generalidad conversacional a cambio de salida estructurada específica del dominio.

## Limitaciones y advertencias

- Solo genera parámetros, no audio; no sustituye el criterio de un ingeniero de mezcla.
- Los datos de entrenamiento son mayoritariamente sintéticos, por lo que la generalización a proyectos reales es limitada.
- No cubre el mapeo de parámetros de plugins de terceros; las operaciones son abstractas.
- El soporte de intenciones en chino es limitado (el SFT se centró en inglés y JSON).
- La evaluación fija consta solo de 60 casos y no distingue entre sft-v2 y grpo-v3 a esa granularidad.
- La legalidad de esquema no implica corrección de mezcla; las sugerencias deben confirmarse manualmente o validarse con métricas de renderizado.
- Riesgo de alucinación en parámetros fuera de rango o pistas inexistentes, mitigado parcialmente por la validación de esquema.
- No se documentan sesgos específicos más allá de los heredados del corpus base; el modelo no está pensado para uso conversacional general.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la declaración original de Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shokou1/qwen3.5-4B-dawcoder
- Repositorio GitHub del proyecto: https://github.com/ShokouP/qwen3.5-4B-dawcoder
- Servidor MCP para DAW y evaluación: https://github.com/ShokouP/daw-mcp-server
- Corpus de producción musical: https://github.com/ShokouP/open-music-production-corpus
- Datasets de tareas DAWcoder: https://github.com/ShokouP/qwen3.5-4B-dawcoder-datasets
- Datos de ingeniería musical y simbólica: https://github.com/ShokouP/open-music-engineering-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
