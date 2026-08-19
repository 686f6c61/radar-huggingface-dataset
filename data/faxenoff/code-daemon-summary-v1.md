# faxenoff/code-daemon-summary-v1

## Resumen

`code-daemon-summary-v1` es un modelo de generación de texto de 4.000 millones de parámetros, publicado por faxenoff (Fedor Aksenov) bajo licencia Apache-2.0, especializado en generar documentación de código fuente en inglés y ruso. Se distribuye exclusivamente en formato GGUF cuantizado y está pensado para ejecutarse en cualquier entorno compatible con llama.cpp, incluidos equipos con GPUs de consumo.

El modelo es el resultado de una destilación de conocimiento a nivel de secuencia (SeqKD) sobre el modelo base Qwen/Qwen3-4B, utilizando como profesor a Qwen/Qwen2.5-7B-Instruct. Está diseñado para tres tareas concretas: descripciones de entidades de código en una frase, resúmenes de módulos con diagramas ASCII, y resúmenes jerárquicos de codebase completos. No es un asistente general: fuera de su distribución de tareas su comportamiento no está definido.

Su relevancia actual radica en que cubre un nicho poco atendido: la documentación automática de código en ruso e inglés con calidad de destilación, en un formato ligero (2,4 GB en Q4_K_M) que cabe en GPUs de 8 GB y se integra en pipelines de documentación automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B base), 36 capas, ChatML, vocab de 151 936 tokens |
| Parametros totales | 4 022 468 096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de llama.cpp; el base soporta hasta 32 768) |
| Tipos de cuantizacion | Q3_K_M (con imatrix), Q4_K_M, Q5_K_M |
| Idiomas soportados | en, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible en el repo; el dato de 4 022 468 096 corresponde al modelo base sin cuantizar) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de 36 capas con vocabulario de 151 936 tokens y plantilla ChatML. Sobre esta base se aplicó destilación de conocimiento a nivel de secuencia (SeqKD): se generaron aproximadamente 11 000 trazas `(prompt → response)` con el profesor Qwen/Qwen2.5-7B-Instruct sobre un corpus mixto de unos 90 repositorios open source (Zig, C/C++, C#, TypeScript/JavaScript, Python, Go, Rust, Kotlin, Swift, Java) para inglés, y un codebase comercial de C#/TypeScript/Python para ruso. Se entrenó un LoRA SFT durante 3 épocas con los tokens de prompt enmascarados, y posteriormente se fusionó en el modelo base.

También se entrenó un paso de refinamiento on-policy con DistiLLM-2, pero fue rechazado en evaluación porque degradaba el comportamiento en prompts largos; la versión publicada es el checkpoint SeqKD. El modelo fija el modo no-thinking en su plantilla de chat: los prompts deben terminar con `<|im_start|>assistant\n thinking\n\n response\n\n`. Se recomienda decodificación greedy (temperatura 0) y parada en `<|im_end|>`.

La cuantización Q3_K_M fue reconstruida el 2026-08-17 con una matriz de importancia (imatrix) calibrada sobre tráfico real de producción (prompts AUTODOC/RAPTOR en formato ChatML), cuantizada directamente desde F16 en lugar de re-cuantizar desde Q5_K_M. En una prueba de 31 chunks, la perplexidad mejoró de 2,3655 (Q3 directo) a 2,3256, recuperando aproximadamente un tercio de la pérdida de cuantización al mismo tamaño de archivo. Q4_K_M y Q5_K_M se dejaron sin cambios porque la imatrix no aporta a esos anchos de bit.

## Capacidades

- Generación de documentación de código en una frase por entidad (funciones, clases, campos) como lista de viñetas Markdown.
- Resúmenes de módulo con prosa breve y diagramas ASCII de arquitectura o flujo de datos.
- Resúmenes jerárquicos de codebase: digestos a nivel de subsistema, producto y proyecto completo construidos a partir de resúmenes más pequeños.
- Bilingüe inglés-ruso de primera clase: ambos idiomas fueron destilados directamente, no traducidos. En evaluación, 56/57 ejemplos de referencia en ruso respondieron en ruso y 242/243 en inglés respondieron en inglés.
- Modo no-thinking fijado en la plantilla de chat, lo que reduce latencia y coste de generación frente a modelos con modo razonamiento.
- Sin soporte de tool calling, visión, audio ni capacidades de agente: es un componente especializado de documentación.

## Casos de uso

- Documentación automática de repositorios open source: el modelo puede generar descripciones de entidades para todos los archivos de un proyecto y producir un digesto jerárquico del repositorio completo, útil para mantener documentación viva sin intervención manual.
- Generación de documentación en ruso para codebases comerciales: cubre un hueco donde los modelos generales suelen producir textos en inglés o con calcos; el modelo responde en ruso de forma nativa.
- Pipeline de documentación en CI/CD: integrado en un flujo que recorre archivos modificados, genera resúmenes de módulo y actualiza la documentación de alto nivel en cada commit.
- Indexación semántica de código para motores de búsqueda internos: las descripciones en una frase pueden alimentar un índice de búsqueda o un RAG sobre el codebase.
- Asistencia a revisión de código: el modelo puede producir un resumen de qué hace cada función en un pull request, reduciendo el tiempo de lectura del revisor.
- Generación de documentación para código legacy sin comentarios: aplicable a proyectos antiguos en C/C++, Java o Swift donde no existe documentación y se necesita un punto de partida estructurado.
- Alimentación de agentes de código: las descripciones generadas pueden servir como entrada para agentes que necesitan entender la estructura de un proyecto antes de modificarlo, como el propio daemon de inteligencia de código del autor.

## Benchmarks y rendimiento

El autor publica evaluación sobre prompts held-out separados por hash de contenido (nunca vistos en entrenamiento), con referencia al output del profesor Qwen2.5-7B-Instruct:

| Tarea | n | ROUGE-L | sem-cos* | salidas vacias |
|---|---|---|---|---|
| Entity docs, EN+RU mixto | 300 | 0,618 | 0,904 | 0 |
| Entity docs, solo EN | 300 | 0,636 | 0,897 | 0 |
| Resúmenes jerárquicos | 7 | 0,331 | 0,893 | 0 |

\* similitud coseno con all-MiniLM-L6-v2 entre salidas del estudiante y del profesor.

Fidelidad de idioma: 56/57 ejemplos de referencia en ruso respondieron en ruso; 242/243 en inglés respondieron en inglés. El modelo es ligeramente más verboso que el profesor (ratio de longitud ~1,3–1,6).

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~2,8 GB para Q5_K_M, ~2,4 GB para Q4_K_M, ~2,0 GB para Q3_K_M (solo pesos). Con contexto 8192, la memoria residente medida es de ~4,7 GB en Q4_K_M (pesos + KV cache + buffers).
- GPU recomendadas: cualquier GPU con 6–8 GB de VRAM es suficiente. Medido en una RTX 5060 laptop de 8 GB con llama.cpp CUDA.
- En consumer GPU: sí, cabe en GPUs de 6 GB (Q3_K_M) y 8 GB (Q4_K_M y Q5_K_M).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (formato GGUF compatible), cualquier runtime que cargue GGUF.
- Rendimiento medido en RTX 5060 (8 GB), llama.cpp CUDA, Q4_K_M, n_ctx=8192, n_batch=2048, un solo stream:
  - Resumen jerárquico (250 → 250 tokens): 103 tok/s.
  - Documentación larga de entidades (900 → 1500 tokens): 95 tok/s.
  - Prefill: ~3300 tok/s.
  - Advertencia: si la GPU está sobresuscrita con otro modelo residente, la velocidad de decodificación cae a aproximadamente un tercio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| code-daemon-summary-v1 | 4B | 8192 (configurado) | Documentación de código EN/RU | Apache-2.0 | GGUF |
| Qwen/Qwen3-4B (base) | 4B | 32 768 | Asistente general multilingüe | Apache-2.0 | safetensors, GGUF |
| Qwen/Qwen2.5-7B-Instruct (profesor) | 7B | 32 768 | Asistente general multilingüe | Apache-2.0 | safetensors, GGUF |

La comparativa directa con otros modelos de documentación de código no está disponible en la información proporcionada. Frente a su base (Qwen3-4B), el modelo destilado es significativamente más pequeño en requisitos de memoria y más rápido en inferencia, a costa de perder generalidad: solo produce documentación de código y solo en EN/RU. Frente a su profesor (7B), ofrece un rendimiento cercano en la tarea (sem-cos ~0,90) con aproximadamente la mitad de parámetros.

## Limitaciones y advertencias

- Es un componente especializado, no un asistente general: fuera de la distribución de tareas de documentación de código, su comportamiento no está definido.
- Solo soporta inglés y ruso; no se garantiza comportamiento en otros idiomas.
- La evaluación se limita a ROUGE-L y similitud semántica contra el profesor; no hay benchmarks generales (MMLU, HumanEval, etc.).
- Riesgo de alucinación en descripciones de entidades poco representadas en el corpus de entrenamiento; se recomienda revisión humana para documentación crítica.
- El corpus de entrenamiento incluye un codebase comercial para ruso, pero no se especifica si ese código tiene restricciones de licencia que afecten al modelo destilado (el autor declara Apache-2.0, pero no es asesoramiento legal).
- La cuantización Q3_K_M con imatrix está calibrada sobre el tráfico de producción del autor; en otras distribuciones de prompts el beneficio de la imatrix puede no reproducirse.
- El modelo es ligeramente más verboso que el profesor (ratio de longitud ~1,3–1,6), lo que puede inflar el coste por token en salidas largas.
- No soporta tool calling, visión ni audio; no es adecuado para tareas de agente sin un wrapper externo.
- La ventana de contexto configurada en el ejemplo es de 8192 tokens; aunque el base soporta más, no hay datos de rendimiento del modelo destilado con contextos mayores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/faxenoff/code-daemon-summary-v1
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Profesor Qwen/Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Perfil del autor en HuggingFace: https://huggingface.co/faxenoff
- Repositorio del autor en GitHub (herramientas MCP para código): https://github.com/iflow-mcp/faxenoff-ultrascript-tools-mcp
- Releases del proyecto ultracode: https://github.com/faxenoff/ultracode/releases
