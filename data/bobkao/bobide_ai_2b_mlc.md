# Bobkao/BobIDE_AI_2B_MLC

## Resumen

BobIDE_AI_2B_MLC es un modelo de lenguaje de 2.000 millones de parametros derivado de Qwen/Qwen3.5-2B mediante QLoRA SFT, desarrollado por el usuario Bobkao y orientado especificamente a la inferencia en navegador con WebGPU a traves de WebLLM y MLC LLM. El modelo esta especializado en contenido STEM y resumen de apuntes en chino tradicional, con un formato de salida estructurado en etiquetas `<think>` y `<answer>` y control de nivel de razonamiento (`OFF` / `LOW` / `MEDIUM`).

El modelo se distribuye ya cuantizado en formato `q4f16_1` de MLC, con un peso total de aproximadamente 1,03 GB, e incluye un binario WASM compilado a medida (`prefill_chunk_size=128`, `max_batch_size=1`) para ejecucion en el navegador. Su proposito es servir como motor de asistencia dentro del IDE web Bob IDE, donde el usuario necesita respuestas rapidas sobre matematicas, ciencias y sintesis de documentos PDF sin depender de una GPU en servidor.

La relevancia actual del modelo radica en su enfoque de despliegue edge: no requiere backend de inferencia remoto, funciona sobre la GPU del propio navegador del usuario y hereda la licencia Apache 2.0 del modelo base. No obstante, se trata de un modelo de nicho con cero descargas y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer decoder-only); identificador de arquitectura MLC `qwen3_5` |
| Parametros totales | 2B (modelo base Qwen/Qwen3.5-2B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 1024 tokens (ventana recomendada en la configuracion MLC); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | `q4f16_1` (MLC, 4 bits con activaciones fp16) |
| Idiomas soportados | chino (tradicional, segun la model card) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC LLM (`q4f16_1`), con binario WASM WebGPU (`Qwen3.5-2B-q4f16_1_cs128_b1-webgpu.wasm`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros, y se afina mediante QLoRA SFT sobre un corpus destilado de 2.185 muestras de alta pureza en chino tradicional centradas en STEM y resumen de apuntes. El corpus de destilacion se genero con el modelo profesor Qwen/Qwen3.8-27B en su variante GGUF `UD-Q4_K_M` (repositorio `unsloth/Qwen3.8-27B-GGUF`, Apache 2.0), seguido de un proceso de limpieza. El ajuste introduce dos comportamientos concretos: una estructura de respuesta con etiquetas `<think>` / `<answer>` y un control de nivel de razonamiento con tres modos (`OFF`, `LOW`, `MEDIUM`), ademas de la tarea de sintesis de puntos clave de documentos PDF.

Tras el entrenamiento, los pesos se fusionan y se exportan con MLC LLM al formato WebGPU `q4f16_1`, con una compilacion especifica del binario WASM fijando `prefill_chunk_size=128` y `max_batch_size=1`. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset mas alla de las 2.185 muestras, ni sobre el uso de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas propias: las tecnicas de atencion y decodificacion son las heredadas del modelo base.

## Capacidades

- Generacion de texto y razonamiento en dominios STEM (matematicas, fisica, quimica, biologia, ingenieria) en chino tradicional e ingles.
- Razonamiento estructurado mediante etiquetas `<think>` / `<answer>`, con control del nivel de esfuerzo (`OFF`, `LOW`, `MEDIUM`).
- Resumen y extraccion de puntos clave de apuntes y documentos PDF (caso de uso explicito en la model card).
- Inferencia local en navegador mediante WebGPU y WebLLM, sin backend remoto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas a chino (tradicional) e ingles segun los metadatos del modelo.

## Casos de uso

- Asistente integrado en el IDE web Bob IDE: el modelo se ejecuta en la GPU del navegador via WebGPU y responde consultas de programacion y ciencias sin enviar datos a un servidor, lo que reduce la latencia de red y preserva la privacidad del codigo del usuario.
- Resumen de apuntes y PDF academicos: con la ventana de 1024 tokens y el `prefill_chunk_size` de 128, el modelo procesa documentos por bloques y produce sintesis en chino tradicional, adecuado para estudiantes que trabajan con material docente en ese idioma.
- Tutoria de matematicas y ciencias a nivel educativo: el control de razonamiento `LOW`/`MEDIUM` permite alternar entre respuestas directas y explicaciones paso a paso segun el nivel del alumno.
- Demostraciones y prototipos de LLM en navegador: sirve como referencia funcional de un pipeline MLC + WebLLM completo (pesos `q4f16_1`, WASM a medida, cache en OPFS/IndexedDB) para equipos que evaluan inferencia edge.
- Herramienta offline en entornos con conectividad limitada: al ejecutarse integramente en el cliente, sigue operativo una vez descargados los pesos y el binario WASM.
- Clasificacion y extraccion de conceptos STEM en textos cortos: con respuestas de formato fijo `<think>`/`<answer>`, encaja en pipelines que necesitan salida parseable para poblar indices o fichas de contenido.
- Generacion de preguntas de repaso a partir de material docente: el ajuste sobre corpus de apuntes permite reformular contenido en preguntas y respuestas breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas STEM, y el repositorio registra cero descargas y cero likes, por lo que no existen evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,03 GB de pesos en `q4f16_1`, mas overhead de activaciones y cache KV; el consumo real depende del navegador y del backend de cache elegido.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU estable; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, al tratarse de una cuantizacion de 4 bits de un modelo de 2B y ejecutarse sobre WebGPU en el navegador del usuario.
- Opciones de despliegue: MLC LLM y WebLLM (WebGPU) son las vias documentadas; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Backend de cache recomendado: `opfs` o `indexeddb`; la model card desaconseja el `CacheStorage` por defecto para evitar picos de memoria del navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BobIDE_AI_2B_MLC | 2B | 1024 (recomendado) | MLC `q4f16_1`, WebGPU | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | safetensors y derivados | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (profesor) | 27B | no disponible | GGUF `UD-Q4_K_M` (unsloth) | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la informacion proporcionada. No se dispone de datos de rendimiento que permitan contrastar calidad frente a alternativas de 2B orientadas a navegador.

## Limitaciones y advertencias

- Ventana de contexto efectiva de 1024 tokens: insuficiente para documentos largos sin troceado previo y propensa a perdida de coherencia en conversaciones multi-turno extensas.
- Entrenamiento sobre solo 2.185 muestras destiladas: riesgo elevado de sobreajuste al estilo y dominio del corpus, con degradacion fuera de STEM y resumen de apuntes.
- Cobertura linguistica limitada a chino tradicional e ingles; el rendimiento en castellano no esta documentado ni respaldado por el ajuste.
- Riesgo de alucinacion en contenido cientifico y matematico, agravado por el tamano de 2B y por la ausencia de evaluaciones publicadas.
- El corpus se genero con un modelo profesor cuantizado a 4 bits, lo que puede transferir errores y sesgos del profesor al alumno.
- Sesgos concretos no documentados en la informacion disponible.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias del autor sobre exactitud ni idoneidad para produccion.
- Dependencia de WebGPU y de un binario WASM compilado con `max_batch_size=1`: sin soporte de batching, poco adecuado para servir a multiples usuarios concurrentes.
- Modelo con cero descargas y sin mantenimiento comunitario conocido; la fecha de creacion registrada (2026-11-15) debe verificarse antes de adoptarlo en un proyecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bobkao/BobIDE_AI_2B_MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor (GGUF): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- MLC LLM: no disponible en la informacion proporcionada
- WebLLM: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
