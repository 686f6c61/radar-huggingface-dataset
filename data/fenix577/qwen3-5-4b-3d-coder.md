# fenix577/Qwen3.5-4B-3D-Coder

## Resumen

Qwen3.5-4B-3D-Coder es un ajuste fino (fine-tune) independiente del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario fenix577 bajo el sello CCORE. Se trata de un experimento que explora la viabilidad de modelos de lenguaje pequenos (4B parametros) para programacion general y, muy especialmente, para la generacion de escenas 3D interactivas con Three.js. No es un lanzamiento oficial de Qwen y se distribuye como vista previa temprana mientras el entrenamiento continua.

El modelo parte de la arquitectura Qwen3.5 de 4B parametros (4.539.265.536 parametros segun los pesos en safetensors) y se ha afinado sobre el dataset publico CCORE Three.js 3D Scenes, compuesto por 4.146 ejemplos (3.933 de entrenamiento y 213 de validacion) con prompts, trazas de razonamiento completas, respuestas HTML/JavaScript y niveles de complejidad. La licencia es Apache 2.0, lo que facilita su uso comercial y su integracion en herramientas de desarrollo.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo de tan solo 4B parametros puede abordar tareas de codigo especializado con calidad util; por otro, incorpora soporte opcional de vision cuando se carga junto al proyector multimodal original de Qwen3.5-4B en formato GGUF, permitiendo generar escenas Three.js a partir de una imagen de referencia. Se distribuye en safetensors (FP16) y en cuantizaciones GGUF Q4_K_M y Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (configurado en los ejemplos de llama.cpp; contexto nativo del base no confirmado en la informacion disponible) |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards FP16), GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso Qwen3.5-4B, sin cambios arquitectonicos documentados mas alla del ajuste de pesos. El entrenamiento se realizo sobre el dataset CCORE Three.js 3D Scenes, que contiene 4.146 ejemplos de escenas (3.933 de entrenamiento y 213 de validacion), con prompts, trazas de razonamiento completas (thinking traces), respuestas HTML/JavaScript completas y etiquetas de nivel de complejidad. El dataset se publica bajo licencia MIT e incluye una configuracion opcional `previews` con imagenes renderizadas de referencia.

El autor publica un informe tecnico en PDF que documenta el experimento. La model card menciona una actualizacion del checkpoint del 27 de octubre de 2026 que mejoro sustancialmente el exito en un solo intento (one-shot success) y la calidad general de las escenas. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO. El soporte de vision es opcional y se obtiene cargando el proyector BF16 original de Qwen3.5-4B (aproximadamente 644 MiB) junto con los pesos GGUF en llama.cpp.

## Capacidades

- Generacion de codigo general en HTML y JavaScript, con enfasis en escenas 3D interactivas mediante Three.js.
- Razonamiento con trazas de pensamiento (thinking traces) presentes en el dataset de entrenamiento.
- Generacion de escenas 3D completas a partir de un prompt en lenguaje natural.
- Soporte opcional de vision: con el proyector multimodal de Qwen3.5-4B cargado en llama.cpp (Q4_K_M o Q8_0), acepta imagenes de referencia y genera escenas Three.js a partir de ellas.
- Conversacional (tag `conversational` en Hugging Face).
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generacion de prototipos 3D para desarrollo web: el modelo produce codigo Three.js listo para ejecutar a partir de una descripcion textual, lo que permite crear maquetas de escenas interactivas en minutos en lugar de horas de programacion manual.
- Creacion de escenas a partir de imagenes de referencia: con el proyector de vision cargado en llama.cpp, un disenador puede adjuntar un boceto o render y pedir al modelo que lo reconstruya en voxels o geometria Three.js, acelerando el paso de concepto a codigo.
- Educacion y aprendizaje de Three.js: el modelo puede explicar y generar ejemplos de escenas con distintos niveles de complejidad (el dataset incluye etiquetas de complejidad), util para materiales docentes o tutoriales interactivos.
- Automatizacion de contenido 3D en pipelines de CI/CD: al ser un modelo de 4B con cuantizaciones GGUF ligeras, puede integrarse en flujos automatizados que generen variaciones de escenas o assets de prueba para entornos de staging.
- Asistente de codigo especializado en graficos: integrado en un IDE o en un chat de desarrollo, ayuda a depurar y completar codigo Three.js, un dominio donde los modelos generalistas suelen fallar por falta de ejemplos especificos.
- Generacion de demos y prototipos para presentaciones: permite producir escenas 3D interactivas rapidamente para pitches, pruebas de concepto o validacion con clientes antes de invertir en desarrollo completo.
- Experimentacion e investigacion en modelos pequenos: al publicarse el dataset, el informe tecnico y los pesos, sirve como base reproducible para estudiar la viabilidad de SLM en tareas de codigo especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta resultados cualitativos (mejora del exito en un solo intento tras el checkpoint del 27 de octubre de 2026) y ejemplos visuales de generacion guiada por imagen, sin metricas numericas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB en FP16 (4.539 millones de parametros a 2 bytes por parametro), unos 3 GB en Q4_K_M y unos 5 GB en Q8_0, sin contar el KV-cache.
- El KV-cache crece con el contexto: a 65.536 tokens puede ser considerable; el autor recomienda `--cache-type-k q8_0 --cache-type-v q8_0` para reducirlo.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM puede ejecutar las cuantizaciones GGUF; para FP16 se recomienda una GPU de 16 GB o superior (RTX 4080/4090, A100, H100).
- Cabe en GPU consumer: si, en Q4_K_M y Q8_0 en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- Opciones de despliegue: llama.cpp (probado con la build b11889 mediante `llama-server`), Transformers 5.20.2 para los pesos FP16, y presumiblemente cualquier runtime compatible con GGUF (Ollama, LM Studio) aunque no se confirma explicitamente en la informacion disponible. vLLM y TGI no se mencionan.
- Vision: requiere cargar adicionalmente el proyector `mmproj-Qwen3.5-4B-BF16.gguf` (unos 644 MiB), que consume memoria extra.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica pruebas cortas con vision a 64K de contexto, no pruebas de estres a contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder | 4,54B | 65.536 (configurado) | Codigo + Three.js 3D | Apache 2.0 | safetensors + GGUF |
| Qwen3.5-4B (base) | 4B | no disponible | Proposito general | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-3B | 3B | no disponible | Codigo general | Apache 2.0 | Hugging Face |

La comparacion con alternativas especializadas en 3D o Three.js no esta disponible en la informacion proporcionada. Frente al base Qwen3.5-4B, este fine-tune anade especializacion en Three.js y soporte opcional de vision via proyector externo, a costa de posibles regresiones en tareas generales no evaluadas.

## Limitaciones y advertencias

- Es una vista previa temprana: el autor indica que el entrenamiento continua y que algunas escenas pueden requerir otro intento o una correccion.
- No es un lanzamiento oficial de Qwen; es un fine-tune independiente de CCORE/fenix577, sin soporte oficial.
- Riesgo de alucinacion en APIs de Three.js y en la logica de escenas complejas; el exito en un solo intento no es garantizado.
- El soporte de vision es opcional y depende de llama.cpp y de su implementacion multimodal; otros frontends pueden no soportarlo.
- Los tokens de imagen comparten la ventana de contexto con el prompt y el codigo generado, reduciendo el espacio disponible.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3.5-4B hereda los sesgos del base, no evaluados aqui.
- Idiomas soportados no confirmados; el dataset de entrenamiento parece centrado en ingles (prompts y codigo), lo que puede degradar el rendimiento en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el proyector tienen sus propias condiciones (Apache 2.0 en ambos casos segun la informacion disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fenix577/Qwen3.5-4B-3D-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CCORE Three.js 3D Scenes: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe tecnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector de vision BF16: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- Origen del proyector (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Discusion con la imagen de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/discussions/9
