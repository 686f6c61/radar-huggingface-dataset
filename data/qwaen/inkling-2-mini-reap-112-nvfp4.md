# qwaen/Inkling-2-Mini-REAP-112-NVFP4

## Resumen

Inkling-2-Mini-REAP-112-NVFP4 es una versión podada y cuantizada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, publicada por el usuario qwaen. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con capacidad image-text-to-text que conserva 112 de los 128 expertos enrutados por cada capa física, manteniendo un enrutamiento top-8. La poda se realizó con la técnica REAP (saliency-based expert pruning) sobre trazas de calibración de OpenCode, y el export preserva el almacenamiento original NVFP4/MXFP8 generado con NVIDIA ModelOpt.

El modelo base es un transformer MoE con un bloque repetido que se ejecuta tres veces (arquitectura `inkling2_loop`), e incorpora pesos de visión y un drafter DSpark para decodificación especulativa. El checkpoint resultante pesa 18,2 GB en safetensors y contiene 23.330.113.064 parámetros totales según los metadatos del repositorio. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en producción.

Su relevancia radica en que demuestra un flujo completo de compresión (poda de expertos más cuantización de 4 bits con metadatos MXFP8) sobre un modelo multimodal MoE, reduciendo el peso del checkpoint mientras mantiene el pipeline de inferencia estándar de vLLM. Es un artefacto experimental orientado a quienes necesitan desplegar el modelo en GPUs de consumo con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`inkling2_loop`) con bloque repetido ejecutado 3 veces; multimodal image-text-to-text |
| Parametros totales | 23.330.113.064 |
| Parametros activos | no disponible (enrutamiento top-8 sobre 112 expertos retenidos por capa física) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantizacion | NVFP4 (pesos) y MXFP8 (metadatos/escalas); export ModelOpt; tag 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18,2 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un derivado del checkpoint `thinkingmachines/Inkling-2-Mini` (revisión 7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6). La arquitectura es MoE con 128 expertos enrutados por capa física original, de los que se retienen 112 tras la poda, con enrutamiento top-8. El bloque repetido de la arquitectura `inkling2_loop` se sigue ejecutando tres veces, por lo que las estadísticas de poda cubren 24 capas físicas y 48 visitas de capa. El export conserva los pesos de visión, el drafter DSpark y los metadatos de cuantización originales.

La poda REAP se calculó sobre 65 trayectorias de calibración de OpenCode que suman 679.958 tokens. El ranking de expertos lo realizó `ExpertPruner` de LLM Compressor, y un exportador específico de ModelOpt copió las filas empaquetadas retenidas junto con sus filas de router asociadas. El manifiesto del repositorio lista los índices originales retenidos en cada capa. No se dispone de información sobre el número total de tokens de preentrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno (`conversational`).
- Procesamiento de imagen y texto combinados (`image-text-to-text`), con pesos de visión preservados del modelo base.
- Razonamiento con parser dedicado en vLLM (`--reasoning-parser inkling`).
- Tool calling y elección automática de herramientas (`--enable-auto-tool-choice --tool-call-parser inkling`).
- Decodificación especulativa mediante el drafter DSpark incluido en el checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio ni de agente multi-paso más allá del soporte de herramientas en vLLM.

## Casos de uso

- Asistente de código con contexto de repositorio: el modelo se calibró sobre trayectorias de OpenCode y superó 6/6 tareas retenidas de OpenCode en vLLM, por lo que es adecuado para tareas de edición y razonamiento sobre código con soporte de tool calling.
- Automatización de atención al cliente multimodal: al aceptar image-text-to-text, puede gestionar conversaciones donde el usuario adjunta capturas o documentos, con el parser de razonamiento activado para respuestas trazables.
- Despliegue en estación de trabajo con GPU de consumo: con 18,2 GB de checkpoint en NVFP4, cabe en tarjetas de 16 GiB usando asignación explícita de KV cache, como demuestra la prueba del autor en una RTX 5060 Ti.
- Pipeline de agentes con function calling: la integración con `--enable-auto-tool-choice` y el parser `inkling` permite conectar el modelo a APIs externas en flujos de automatización.
- Prototipado de asistentes con visión en local: los pesos de visión preservados permiten experimentar con tareas de descripción, extracción de datos de imágenes y VQA sin depender de servicios en la nube.
- Evaluación de técnicas de compresión: el manifiesto de índices retenidos y las estadísticas de calibración lo convierten en un caso de referencia para estudiar el impacto de REAP y NVFP4 en un MoE multimodal.
- Inferencia de baja latencia en entornos WSL2/Docker: el autor reporta 17,44 tokens/s de mediana en decodificación con ensayos de 128 tokens, útil para entornos de desarrollo containerizados.

## Benchmarks y rendimiento

| Prueba | Resultado | Condiciones |
|---|---|---|
| Tareas retenidas de OpenCode | 6/6 superadas | Checkpoint nativo en vLLM |
| Throughput de decodificación (mediana) | 17,44 tokens/s | 3 ensayos cortos de 128 tokens, RTX 5060 Ti, Docker Desktop/WSL2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 18,2 GB en safetensors; el despliegue necesita además memoria para KV cache y scratch de runtime. El autor ejecutó el modelo en una GPU de 16 GiB con asignación explícita de KV.
- GPU recomendadas: no hay una lista oficial; la única medición publicada corresponde a una RTX 5060 Ti de 16 GiB. Para contexto de 16.384 tokens conviene una GPU con más de 16 GiB (por ejemplo, A100, H100 o RTX 4090/5090) para evitar restricciones de KV cache.
- Cabe en GPU de consumo: sí, al menos en una RTX 5060 Ti de 16 GiB según la prueba del autor, con configuración manual de KV.
- Opciones de despliegue: vLLM con un build compatible con Inkling 2 Mini (receta oficial en recipes.vllm.ai). El comando del autor usa `--language-model-only --max-model-len 16384 --reasoning-parser inkling --enable-auto-tool-choice --tool-call-parser inkling`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 17,44 tokens/s en decodificación sobre RTX 5060 Ti en WSL2; no hay datos de prefill ni de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwaen/Inkling-2-Mini-REAP-112-NVFP4 | 23,33 B totales | no disponible (ejemplo a 16.384) | Apache 2.0 | safetensors NVFP4/MXFP8 | 112/128 expertos, top-8, multimodal |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Modelo base sin podar, 128 expertos |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La poda elimina 16 de 128 expertos por capa física; no se han publicado evaluaciones que cuantifiquen la pérdida de calidad frente al modelo base más allá de las 6/6 tareas de OpenCode.
- Las mediciones de rendimiento son pilotos del autor en una única GPU de consumo bajo WSL2, con solo tres ensayos de 128 tokens; no son representativas de cargas de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- No se documentan idiomas soportados; el comportamiento multilingüe del modelo base no está verificado en esta variante.
- No se dispone de información sobre sesgos, tasa de alucinación ni evaluaciones de seguridad del modelo base ni de esta poda.
- El despliegue requiere un build específico de vLLM compatible con Inkling 2 Mini; no hay soporte documentado en otros runtimes, lo que limita la portabilidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los pesos de visión heredados antes de un uso comercial.
- El contexto máximo real no está documentado; el valor de 16.384 del ejemplo es una configuración de despliegue, no una especificación del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwaen/Inkling-2-Mini-REAP-112-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6
- Receta de vLLM para Inkling 2 Mini: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
