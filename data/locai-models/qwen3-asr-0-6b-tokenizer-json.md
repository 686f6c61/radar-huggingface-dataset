# locai-models/Qwen3-ASR-0.6B-tokenizer-json

## Resumen

`locai-models/Qwen3-ASR-0.6B-tokenizer-json` no es un modelo de lenguaje completo, sino un artefacto derivado del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B de Alibaba Qwen. En concreto, el repositorio contiene únicamente un fichero `tokenizer.json` (11.429.377 bytes) generado a partir de los ficheros originales del publicador (`tokenizer_config.json`, `vocab.json` y `merges.txt`) mediante un script de preparación propio de LocAI. El resto de ficheros del modelo base no se redistribuyen aquí: se obtienen del repositorio upstream en la revisión fijada `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`.

El propósito del artefacto es completar varios perfiles de despliegue de LocAI orientados a inferencia local: `qwen3-asr06-apple-metal-pcm10s-four-task-local-v1`, `qwen3-asr06-apple-metal-pcm10s-local-v1`, `qwen3-asr06-candle-f32-ios-simulator-pcm10s-v1` y `qwen3-asr06-candle-f32-ios-simulator-pcm10s-v2`, todos ellos empaquetados bajo el pack `prepared-qwen3-asr06`. Es decir, el interés práctico está en pipelines de ASR que necesitan un tokenizer en formato JSON canónico (compatible con implementaciones tipo Hugging Face Tokenizers, Candle o Metal) en lugar del formato fragmentado original.

Es relevante para desarrolladores que integren Qwen3-ASR-0.6B en entornos Apple (Metal, simulador iOS) o en frameworks que consumen `tokenizer.json` directamente, y que quieran evitar la conversión manual. No aporta ninguna mejora de calidad: el propio autor indica explícitamente que se trata de una conversión de formato sin evaluación asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto derivado; el modelo base Qwen3-ASR-0.6B es un modelo ASR, arquitectura no detallada en la información proporcionada) |
| Parametros totales | no disponible (el nombre del base sugiere ~0,6B, no confirmado en la información) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto es solo `tokenizer.json`; los perfiles citados mencionan `f32`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (11.429.377 bytes, SHA-256 `bd2a97b55c8f7f9c328c73ee9b9178771037e9f566dfca8e238a063d41cbac92`); pesos del modelo base no incluidos |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni pesos. Contiene un único fichero `tokenizer.json` construido a partir de tres ficheros del publicador original (`tokenizer_config.json`, `vocab.json`, `merges.txt`), todos ellos fijados por SHA-256 en la model card. La receta es reproducible: el script `tools/qualification/prepare_qwen_asr_tokenizer.py` (SHA-256 `919b643b11058ce9c229561ecb092d36e8d874349a87c3e442e152434de90d3c`) del commit `7ee98d8148b3d50627a4dd3c84fe5ac66e59b164` de LocAI, ejecutado offline bajo `tools/qualification/run-offline-darwin.sh`, usando únicamente la biblioteca estándar de Python 3.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) porque el artefacto no entrena nada: es una conversión de formato. Cualquier detalle arquitectónico del modelo subyacente (Qwen3-ASR-0.6B) debe consultarse en el repositorio upstream de Qwen, no en este.

## Capacidades

- Generación de un `tokenizer.json` compatible con implementaciones que consumen el formato JSON unificado de Hugging Face Tokenizers.
- Integración en perfiles de despliegue de LocAI para Apple Metal y simulador iOS (Candle, `f32`).
- Reproducibilidad verificable: cada fichero de entrada y de salida tiene SHA-256 documentado.
- No incluye pesos, por lo que no realiza inferencia por sí mismo.
- No se documentan capacidades de ASR, tool calling, agentes, multilingüismo ni modos especiales en este repositorio; dichas capacidades corresponden al modelo base Qwen3-ASR-0.6B y no están descritas en la información proporcionada.

## Casos de uso

- Despliegue local en Apple Silicon: usar el `tokenizer.json` junto con los pesos de Qwen3-ASR-0.6B para ejecutar transcripción de audio con el perfil `qwen3-asr06-apple-metal-pcm10s-local-v1`, evitando la conversión manual del tokenizer fragmentado.
- Integración en simulador iOS: alimentar el perfil `qwen3-asr06-candle-f32-ios-simulator-pcm10s-v1` o `v2` para probar pipelines de ASR en Candle antes de desplegar en dispositivo.
- Pipelines de CI/CD con verificación de integridad: usar los SHA-256 documentados para validar que el tokenizer cargado coincide con el esperado y detectar derivas en builds reproducibles.
- Empaquetado en contenedores o artefactos de release: distribuir un único `tokenizer.json` en lugar de tres ficheros separados, simplificando la gestión de dependencias en entornos restringidos.
- Investigación en reproducibilidad: replicar la receta con Python 3 estándar y comparar hashes para auditar la cadena de procedencia entre el modelo upstream y el artefacto derivado.
- Evaluación de frameworks de tokenización: comparar el comportamiento de distintas implementaciones (Hugging Face Tokenizers, Candle) sobre el mismo `tokenizer.json` en tareas de ASR de cuatro tareas (`four-task`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que es una conversión de formato sin reclamación de calidad y que no se ejecutó ninguna evaluación para producirla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este artefacto (solo contiene el tokenizer). Los requisitos reales dependen de los pesos de Qwen3-ASR-0.6B, no incluidos aquí.
- GPU recomendadas: no disponible. Los perfiles citados apuntan a Apple Metal (Apple Silicon) y simulador iOS con Candle en `f32`.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: perfiles LocAI `qwen3-asr06-apple-metal-pcm10s-four-task-local-v1`, `qwen3-asr06-apple-metal-pcm10s-local-v1`, `qwen3-asr06-candle-f32-ios-simulator-pcm10s-v1` y `qwen3-asr06-candle-f32-ios-simulator-pcm10s-v2` (pack `prepared-qwen3-asr06`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `locai-models/Qwen3-ASR-0.6B-tokenizer-json` | Artefacto de tokenizer derivado | no aplica (solo tokenizer) | no disponible | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `Qwen/Qwen3-ASR-0.6B` (upstream) | Modelo ASR completo | ~0,6B (según nombre, no confirmado) | no disponible | Apache-2.0 | Hugging Face (revisión `5eb1441...`) |
| Otros artefactos de tokenizer derivados | Conversión de formato | no aplica | no disponible | según upstream | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable por sí solo: sin los pesos de Qwen3-ASR-0.6B no produce inferencia.
- Sin evaluación de calidad: el autor declara que no se ejecutó ninguna evaluación; no hay garantía de que la conversión preserve el comportamiento exacto del tokenizer original en todos los casos límite.
- Dependencia de la revisión upstream: los ficheros no incluidos se obtienen del repositorio de Qwen en la revisión fijada; si esa revisión desaparece o cambia, el artefacto puede quedar inutilizable.
- Idiomas soportados no documentados en este repositorio; deben consultarse en el modelo base.
- Sin datos de sesgos ni de riesgo de alucinación para este artefacto (no genera texto).
- Licencia Apache-2.0 heredada del modelo base; se incluyen `LICENSE` y `NOTICE` procedentes de una URL de Qwen3-8B, lo que conviene verificar para cumplimiento estricto.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación mínimo, sin señales de uso en producción.
- Repositorio de 0,0 GB reportado, aunque el fichero `tokenizer.json` ocupa ~11,4 MB; posible inconsistencia en el tamaño reportado por la plataforma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/locai-models/Qwen3-ASR-0.6B-tokenizer-json
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/tree/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Licencia referenciada (Qwen3-8B): https://huggingface.co/Qwen/Qwen3-8B/resolve/b968826d9c46dd6066d109eabc6255188de91218/LICENSE
- Repositorio de LocAI (commit de la receta): no disponible como URL en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
