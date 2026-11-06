# amd/VideoChat-Flash-Qwen2_5-7B_InternVideo2-1B_rai_1.9.0_npu

## Resumen

VideoChat-Flash-Qwen2_5-7B_InternVideo2-1B_rai_1.9.0_npu es una adaptacion del modelo VideoChat-Flash publicada por AMD para su ejecucion sobre NPU (Ryzen AI) mediante el formato ONNX y el runtime RyzenAI 1.9.0. El modelo combina un LLM Qwen2.5-7B con un codificador visual InternVideo2 de 1B de parametros, lo que da lugar a un sistema multimodal orientado a comprension y conversacion sobre video. La publicacion en este repositorio es una conversion del modelo original a un formato optimizado para hardware AMD con aceleracion NPU.

El interes de esta ficha radica en que se trata de un artefacto de despliegue especifico de plataforma: no es un modelo nuevo entrenado desde cero, sino una version empaquetada (ONNX + codigo personalizado) del VideoChat-Flash original, pensada para ejecutarse en equipos con NPU Ryzen AI. Esto condiciona fuertemente los requisitos de hardware, el formato de pesos y las opciones de despliegue, que se alejan de los flujos habituales con transformers, vLLM o llama.cpp.

La relevancia actual es doble: por un lado, demuestra la madurez de los runtimes de inferencia sobre NPU en el ecosistema AMD; por otro, ofrece una via para ejecutar modelos de video-LLM de 8B parametros totales en hardware de consumo con NPU. La licencia Apache 2.0 y el acceso restringido (gated) son los dos datos administrativos mas importantes a tener en cuenta antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal video-LLM: LLM Qwen2.5-7B + codificador visual InternVideo2-1B |
| Parametros totales | 7B (LLM) + 1B (codificador visual); aproximadamente 8B en total |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repo distribuye pesos en formato ONNX (posiblemente ya cuantizados para NPU, pero no se especifica) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (con codigo personalizado, custom_code) |
| Tamano del repositorio | 14.0 GB |
| Runtime objetivo | RyzenAI 1.9.0 sobre NPU AMD |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |

## Arquitectura y entrenamiento

La arquitectura es un sistema multimodal compuesto: un modelo de lenguaje Qwen2.5-7B actua como decodificador de texto y un codificador visual InternVideo2 de 1B parametros procesa las entradas de video. El nombre del repositorio indica explicitamente esta composicion (`Qwen2_5-7B_InternVideo2-1B`), y el prefijo `VideoChat-Flash` identifica la familia de metodos de comprension de video a la que pertenece. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO.

El artefacto publicado por AMD no es el modelo original en pesos de entrenamiento, sino una conversion a ONNX con codigo personalizado (`custom_code`) para el runtime RyzenAI 1.9.0. Esto implica que la inferencia se realiza a traves del stack de AMD para NPU, no mediante transformers estandar. No se detalla en la informacion disponible si la conversion incluye cuantizacion especifica para NPU ni que precision numerica emplea. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en esta version empaquetada.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de video: el codificador InternVideo2 permite procesar secuencias de video como entrada multimodal.
- Conversacion multi-turno sobre contenido audiovisual (pipeline declarado: text-generation, conversational).
- Ejecucion acelerada sobre NPU AMD Ryzen AI mediante ONNX y el runtime RyzenAI 1.9.0.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repo.
- Capacidades especiales (modo thinking, audio, vision estatica): no documentadas en la informacion disponible; la vision se orienta a video.

## Casos de uso

- Analisis de video en local sobre hardware AMD con NPU: el modelo se ejecutaria mediante el runtime RyzenAI 1.9.0 en equipos Ryzen AI, permitiendo describir, resumir o responder preguntas sobre clips de video sin depender de la nube.
- Asistencia conversacional sobre grabaciones: dado que el pipeline es `conversational`, se puede construir un chat que mantenga contexto multi-turno sobre un video concreto (por ejemplo, una reunion grabada) y responda preguntas de seguimiento.
- Moderacion y etiquetado de contenido audiovisual: procesar lotes de video para generar descripciones textuales que alimenten sistemas de indexacion o revision.
- Accesibilidad: generar descripciones textuales de contenido de video para personas con discapacidad visual, ejecutandose en el propio dispositivo.
- Prototipado de aplicaciones edge de video-LLM: al estar empaquetado para NPU, sirve para validar flujos de inferencia local en portatiles y mini-PC con Ryzen AI antes de escalar a produccion.
- Investigacion en eficiencia de inferencia: comparar el rendimiento del mismo modelo base en NPU frente a GPU, usando este repo como referencia de despliegue ONNX.
- Educacion y demos: construir demos interactivas de comprension de video en entornos controlados donde no se quiera enviar video a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 14.0 GB, lo que da una idea del espacio en disco necesario para los pesos ONNX.
- Hardware objetivo: NPU AMD Ryzen AI con runtime RyzenAI 1.9.0; no es un modelo pensado para GPU convencional en este empaquetado.
- GPU recomendadas: no aplica en esta version; el artefacto esta orientado a NPU. Para el modelo original (no este repo) se requeriria una GPU con memoria suficiente para aproximadamente 8B parametros, pero ese dato no se detalla en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible para esta version ONNX/NPU; el modelo original de 8B en cuantizacion de 4 bits cabria teoricamente en GPUs de 8-12 GB, pero no se confirma en la informacion disponible.
- Opciones de despliegue: runtime RyzenAI 1.9.0 con ONNX Runtime sobre NPU AMD. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VideoChat-Flash-Qwen2_5-7B_InternVideo2-1B (este repo, AMD) | ~8B (7B LLM + 1B vision) | no disponible | ONNX para NPU Ryzen AI | Apache 2.0 | Gated en Hugging Face |
| Qwen2.5-7B (LLM base) | 7B | no disponible en esta ficha | safetensors / GGUF | Apache 2.0 | Publico |
| InternVideo2-1B (codificador visual) | 1B | no aplica | pesos propios | no disponible en esta ficha | Publico |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Idioma: el repositorio declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Plataforma: el artefacto esta empaquetado para NPU AMD con RyzenAI 1.9.0; no es portable directamente a GPU o CPU sin reconversion.
- Formato ONNX con codigo personalizado: requiere el runtime especifico de AMD, lo que limita la integracion con stacks estandar (transformers, vLLM, llama.cpp).
- Riesgo de alucinacion: inherente a los LLM; en tareas de video puede generar descripciones plausibles pero incorrectas de contenido no visto con claridad.
- Sesgos: no documentados en la informacion disponible; se heredan los del LLM base Qwen2.5 y del dataset de entrenamiento de VideoChat-Flash.
- Limitaciones de contexto: no se especifica la ventana de contexto; para videos largos podria requerir muestreo de frames y perder informacion temporal.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del acceso gated y las licencias de los componentes originales (Qwen2.5 e InternVideo2) antes de desplegar en produccion.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/amd/VideoChat-Flash-Qwen2_5-7B_InternVideo2-1B_rai_1.9.0_npu
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos especificos de esta version.
