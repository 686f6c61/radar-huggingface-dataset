# Shokou1/dawcoder

## Resumen

DAWcoder es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4B) desarrollado por Shokou1 (ShokouP) y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3.5-4B, especializado en una tarea muy concreta: traducir el estado de un proyecto de estación de audio digital (DAW) más una intención expresada en lenguaje natural a un parche JSON de parámetros ejecutable, validable por esquema y reversible.

El modelo no genera audio. Su función es producir operaciones estructuradas sobre pistas, ecualización, compresión, envíos y marcadores (`task=mix`), estructuras de secciones y marcadores (`task=form`) o secuencias de notas para textura y arpegios (`task=texture`). Es relevante ahora porque propone un patrón de integración de LLM en flujos de producción musical basado en la validación determinista del output y en la verificación por renderizado, en lugar de la generación directa de audio.

El repositorio publica tres generaciones de pesos (preview o SFT v1, sft-v2 y grpo-v3), todas en cuantización Q4_K_M de aproximadamente 2,52 GB y listas para Ollama. El contexto declarado en el Modelfile es de 16.384 tokens, con temperatura 0 y `num_predict` de 8.192. Los idiomas declarados son inglés y chino, aunque la propia model card reconoce un soporte limitado del chino para las intenciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-4B), ajuste fino con LoRA |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (`num_ctx` en el Modelfile); secuencias de entrenamiento SFT con `max seq 4096` |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~2,52 GB); pesos base en safetensors |
| Idiomas soportados | en, zh (soporte de chino limitado segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q4_K_M, Ollama-ready) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only denso de unos 4,2B parámetros, y se adapta mediante LoRA. El entrenamiento se organiza en tres fases. La primera, preview (SFT v1), combina un preentrenamiento continuado (CPT) sobre 37,1 millones de tokens durante 400 pasos con un SFT de 3.240 tareas durante 200 pasos. La segunda, sft-v2, continúa desde el adaptador SFT de preview con un SFT de secuencia completa (máximo 4.096 tokens, sin truncamiento), 100 pasos de optimizador y `lr 1e-5`; las pérdidas de entrenamiento reportadas son 0,122 para mix, 0,168 para form y 0,146 para texture. La tercera, grpo-v3, aplica GRPO sobre sft-v2 durante 24 pasos con 100 rollouts (99 válidos por esquema, uno descartado por textura demasiado larga), KL β=0,05 y `lr 1e-6`; el reward de grupo en entrenamiento fue 0,979 en mix, 0,914 en form y 0,942 en texture.

La innovación técnica no está en la arquitectura, sino en el contrato de salida: el modelo emite JSON con operaciones tipadas (`set_track`, `set_eq`, `set_comp`, `set_send`, `add_marker`) o estructuras de secciones y notas, y el entrenamiento se orienta a maximizar la validez de esquema y la cercanía al parche de referencia. La model card indica que el entrenamiento se apoya mayoritariamente en datos sintéticos de tareas, con corpus de producción musical bajo licencias CC BY-SA 4.0, dominio público, MIT y CC0, y que los manuales de DAW con derechos de autor (REAPER, FL Studio) quedaron fuera del corpus.

## Capacidades

- Generación de parches de parámetros de mezcla: volumen, paneo, bandas de EQ (tipo, frecuencia, ganancia, Q), compresión y envíos, devueltos como lista de operaciones JSON.
- Generación de estructura de canción: secciones (Intro, Verse, Chorus, Bridge) y marcadores con compases.
- Generación de secuencias de notas para textura y arpegios con campos `bar`, `step`, `key`, `len_steps` y `vel`.
- Salida estrictamente estructurada y validable por esquema (`patch_validation`), con tasa de JSON parseable y de esquema válido del 100 % en el conjunto de evaluación fijo.
- Integración como capa intermedia en agentes: el parche se valida, se ejecuta en el DAW y se verifica con métricas de renderizado.
- Soporte de conversación multi-turno vía plantilla de chat de transformers y de Ollama, con system prompt obligatorio.
- Capacidades multilingües limitadas a inglés y chino; el chino se apoya principalmente en el corpus de CPT y no en el SFT.
- No soporta visión, audio ni tool calling nativo; la "herramienta" es el contrato JSON de salida.

## Casos de uso

- Sugerencia de mezcla asistida: el modelo recibe el estado del proyecto (género, tempo, pistas con rol, volumen y paneo) y una intención como "la voz queda tapada por la batería"; devuelve un parche con `set_track` y `set_eq` que el usuario revisa y aplica. Es adecuado porque la salida es un diff acotado y reversible, no una acción irreversible.
- Borrador de estructura de canción: a partir de género, tempo y pistas, `task=form` genera secciones y marcadores que el productor puede arrastrar al timeline como plantilla inicial.
- Generación de arpegios y capas de textura: `task=texture` produce notas con posición, duración y velocidad para poblar un instrumento MIDI, útil para prototipado rápido de ideas.
- Capa intermedia en un agente de producción: el parche se valida contra esquema, se aplica vía automatización del DAW y se mide el resultado con renderizado; si la métrica no mejora, se revierte. El modelo encaja porque su salida es determinista (temperatura 0) y comprobable.
- Investigación en evaluación de LLM para tareas estructuradas: el repositorio define un reward compuesto (0,2 parseo JSON, 0,35 esquema válido, 0,45 similitud con el parche de referencia) reutilizable para estudiar SFT frente a GRPO en dominios con verificación formal.
- Docencia y demostración de pipelines de música con IA: al ejecutarse en Ollama con Q4_K_M, permite montar talleres o demos en portátiles sin GPU de datacenter, mostrando el ciclo intención, parche, validación y renderizado.
- Pruebas de regresión de herramientas DAW: los parches generados sirven como casos de prueba sintéticos para validar la implementación de operaciones de mezcla en un DAW o en un servidor MCP.

## Benchmarks y rendimiento

Evaluación fija declarada por el autor: 60 casos de validación equilibrados, seed 20261107, temperatura 0, `num_predict` 8192.

| Modelo | JSON parseable | Esquema válido | mix | form | texture | reward (global) |
|---|---|---|---|---|---|---|
| preview (SFT v1) | 100 % | 100 % | 20/20 | 20/20 | 20/20 | 0,9657 |
| sft-v2 | 100 % | 100 % | 20/20 | 20/20 | 20/20 | 0,9710 |
| grpo-v3 | 100 % | 100 % | 20/20 | 20/20 | 20/20 | 0,9710 |

Desglose adicional reportado: en la tarea mix, el reward pasa de 0,9097 en preview a 0,9246 en sft-v2 y grpo-v3; form y texture se mantienen sin degradación. El autor advierte que la evaluación solo mide formato correcto y cercanía al parche de referencia, no calidad de escucha ni de mezcla, y que con 60 casos la diferencia entre sft-v2 y grpo-v3 no es distinguible.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3 GB con Q4_K_M (pesos de ~2,52 GB más overhead de contexto y caché KV). En FP16, los 4,2B parámetros requerirían aproximadamente 8,4 GB solo para pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 4070, RTX 4090); para FP16, 12 GB o más (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en Q4_K_M con holgura en tarjetas de 6-8 GB; también puede ejecutarse en CPU con llama.cpp u Ollama, a menor velocidad.
- Opciones de despliegue: Ollama (vía Modelfile incluido), llama.cpp con GGUF, y transformers con los pesos safetensors. La model card no documenta configuración para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración recomendada es temperatura 0, `top_p` 0,95, `repeat_penalty` 1,0 y `num_predict` 8192, lo que implica respuestas potencialmente largas y coste de decodificación proporcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| DAWcoder (grpo-v3) | ~4,2B | 16.384 | Parámetros de DAW en JSON | Apache-2.0 | safetensors, GGUF Q4_K_M |
| Qwen/Qwen3.5-4B (base) | ~4,2B | no disponible en la información | Propósito general | Apache-2.0 | safetensors |
| DAWcoder preview (SFT v1) | ~4,2B | 16.384 | Parámetros de DAW en JSON | Apache-2.0 | GGUF Q4_K_M |

No se dispone en la información proporcionada de modelos comparables de otros autores especializados en parámetros de DAW; la comparación se limita al modelo base y a las generaciones previas del propio DAWcoder. Frente al base, DAWcoder gana en adherencia al esquema y formato JSON, a costa de perder capacidades generales fuera del dominio de producción musical.

## Limitaciones y advertencias

- Solo genera parámetros, nunca audio; no sustituye el criterio de un ingeniero de mezcla.
- El entrenamiento se basa mayoritariamente en datos sintéticos, por lo que la generalización a proyectos reales es limitada.
- No cubre el mapeo de parámetros de plugins de terceros; las operaciones son abstractas y requieren una capa de traducción propia.
- El soporte de chino es limitado: el SFT se centró en inglés y JSON, y el chino proviene sobre todo del corpus de CPT.
- La evaluación fija consta solo de 60 casos; las diferencias entre sft-v2 y grpo-v3 no son significativas a esa granularidad.
- Que la salida sea válida según esquema no implica que la mezcla sea correcta; toda sugerencia debe confirmarse manualmente o verificarse con métricas de renderizado.
- Riesgo de alucinación en nombres de pista, bandas de EQ o valores fuera de rango si el estado de entrada es ambiguo o incompleto; el validador de esquema es la barrera principal.
- Licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de la licencia y del modelo base; los manuales de DAW con derechos de autor no forman parte del corpus, lo que limita el conocimiento de detalles específicos de cada DAW.
- El system prompt es obligatorio: el modelo fue entrenado con él y su omisión degrada el formato de salida.

## Enlaces

- Hugging Face: https://huggingface.co/Shokou1/dawcoder
- Repositorio GitHub del modelo: https://github.com/Shokou1/dawcoder
- Servidor MCP para DAW y evaluación: https://github.com/ShokouP/daw-mcp-server
- Corpus de producción musical abierto: https://github.com/ShokouP/open-music-production-corpus
- Datasets de tareas DAWcoder: https://github.com/Shokou1/dawcoder-datasets
- Datos de ingeniería musical y simbólicos: https://github.com/ShokouP/open-music-engineering-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
