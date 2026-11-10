# makcimbx/Apriel-Voice-27B-preview-NVFP4

## Resumen

Apriel-Voice-27B-preview-NVFP4 es una cuantización experimental no oficial del modelo ServiceNow-AI/Apriel-Voice-27B-preview, publicada por el usuario makcimbx. El modelo original lo desarrolla ServiceNow AI Research y es un modelo multimodal de audio y texto con arquitectura MoE (mezcla de expertos) basada en la familia Gemma 4, con 26.490.627.662 parámetros totales. Esta versión concreta aplica cuantización NVFP4 (W4A4, pesos y activaciones en 4 bits) con grupo de tamaño 16 sobre las capas MoE del modelo, manteniendo en BF16 los componentes de audio, visión, routers, embeddings y la cabeza de salida.

La relevancia de esta ficha radica en que demuestra el despliegue nativo de FP4 en hardware Blackwell mediante vLLM, con kernels FlashInferCutlassNvFp4LinearKernel y FLASHINFER_CUTLASS para las capas MoE. El repositorio ocupa aproximadamente 17,8 GB en cinco shards de safetensors, frente al peso en BF16 del modelo base, lo que facilita su servicio en una única GPU de 96 GB. No obstante, se trata de un artefacto experimental, no validado como benchmark multilingüe ni como sustituto del modelo original en producción.

El modelo está pensado para tareas audio-text-to-text, con soporte declarado de inglés y ruso, y requiere un plugin específico de vLLM (basado en el PR #64683) porque la versión estándar de vLLM 0.33.0 no registra AprielVoiceModel. La licencia es MIT, lo que permite uso comercial, aunque las advertencias del autor sobre precisión y rutas de ejecución deben tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en la familia Gemma 4 (Apriel Voice), con torre de visión y componentes de audio (Whisper) en BF16 |
| Parametros totales | 26.490.627.662 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (límite aceptado en pruebas) |
| Tipos de cuantizacion | NVFP4 (W4A4), grupo de tamaño 16; componentes no lineales en BF16 |
| Idiomas soportados | en, ru |
| Licencia | MIT |
| Formato de pesos | safetensors (5 shards, ~17,8 GB), con código Python personalizado y processor/tokenizer incluidos |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE de la familia Gemma 4, adaptado por ServiceNow AI Research para entrada audio-text-to-text. La cuantización se realizó con LLM Compressor 0.15.0 y compressed-tensors 0.20.1, aplicando NVFP4 a pesos y activaciones de 11.725 módulos Linear, incluyendo las 30 capas MoE con 3.840 expertos. Los proyectores de audio y visión, la torre de visión, los routers, los embeddings y la cabeza de salida permanecen en BF16, de modo que la transcripción de audio no la realiza un Whisper cuantizado.

La calibración se hizo con 20 ejemplos de texto público (7.368 tokens) del dataset neuralmagic/calibration, revisión fb6bc2f8c66543876fb31613f5872b9030220e15, usando el pipeline básico para todos los expertos. No hubo reentrenamiento ni calibración específica para audio. La revisión base del modelo original es 66b537ad402d463a910c13fef26e813b69454f77. El artefacto incluye proyecciones 2D empaquetadas por experto, todas las escalas, exclusiones regex para servicio nativo y el tensor de embedding de entrada compartido para la carga de pesos atados en vLLM.

## Capacidades

- Generación de texto y razonamiento sobre entradas de audio y texto (pipeline audio-text-to-text).
- Transcripción de audio en inglés y ruso, con formato de entrada OpenAI-compatible `input_audio`.
- Soporte de tool calling y function calling, con parser `gemma4` en vLLM y `--enable-auto-tool-choice`.
- Soporte de agentes y razonamiento multi-paso mediante `--reasoning-parser gemma4` y el modo thinking (`enable_thinking`).
- Capacidades multilingües limitadas a inglés y ruso según la model card.
- Procesamiento de imagen (se declara `image` en `--limit-mm-per-prompt`), aunque la información disponible no detalla el alcance de visión.
- Modo de habla previa a herramientas (`enable_pretool_speech`) para integración de audio en flujos de agentes.

## Casos de uso

- Transcripción y análisis de reuniones en inglés y ruso: el modelo acepta audio de 16 kHz mono WAV y devuelve texto; su contexto de 262.144 tokens permite procesar grabaciones largas o conversaciones multi-turno con historial extenso.
- Asistentes de voz con tool calling: integrado en vLLM con `--enable-auto-tool-choice` y parser `gemma4`, puede convertir una consulta hablada en una llamada estructurada a una API externa, aunque las herramientas no se ejecutan dentro del modelo.
- Atención al cliente automatizada por voz: la ventana de contexto larga y el soporte de audio permiten gestionar conversaciones multi-turno con transcripción y respuesta en el mismo pipeline.
- Procesamiento de documentos con imagen y audio: al aceptar entradas de imagen y audio en la misma petición, puede emplearse en flujos que combinan capturas o diapositivas con explicaciones habladas.
- Investigación en cuantización FP4: sirve como referencia reproducible para evaluar kernels NVFP4 de FlashInfer en GPUs Blackwell, con manifiesto de hashes SHA-256 y entorno fijado.
- Despliegue en una única GPU de 96 GB: el peso de 17,8 GB y el pico medido de 45.988 MiB permiten servir el modelo con `--gpu-memory-utilization 0.45` y `--max-num-seqs 2` en una RTX PRO 6000 Blackwell.
- Prototipado de agentes de voz con razonamiento: el modo thinking y el parser de razonamiento permiten separar la deliberación interna de la respuesta final en aplicaciones de asistencia técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente pruebas de humo y comparaciones parciales:

| Prueba | Resultado |
|---|---|
| Ediciones de palabras en audio ruso (2 controles cortos) | 0/26 |
| Ediciones de palabras en audio inglés (2 controles cortos) | 1/17 |
| WER ruso estricto, BF16 vs QDQ de-cuantizado (16 clips) | 5,56% → 10,42% |
| WER inglés estricto, BF16 vs QDQ de-cuantizado (16 clips) | 4,39% → 4,39% |
| Contexto sintético de 260.000 tokens | Marcador esperado devuelto |
| Dos peticiones concurrentes de 260.045 tokens con prefijos independientes | Completadas |
| Pico de memoria de dispositivo en peticiones largas en frío | 45.988 MiB (muestreo cada 250 ms) |
| Memoria en arranque | 45.984 MiB |

Estos datos no constituyen un benchmark multilingüe ni una prueba de precisión preservada, y la comparación BF16 vs QDQ también altera las rutas de ejecución de expertos, por lo que no aísla el efecto de la cuantización.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa ~17,8 GB en safetensors; el pico medido en servicio con contexto largo fue de 45.988 MiB en una GPU de 96 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell de 96 GB, único hardware probado según la model card. No se garantiza soporte en GPUs no Blackwell.
- Cabe en consumer GPU: no hay evidencia de que quepa o funcione en GPUs de consumo; el autor no reclama soporte para GPUs no Blackwell.
- Opciones de despliegue: vLLM 0.33.0 con el plugin Apriel incluido (basado en el PR #64683, fijado a `aman-servicenow/vllm@bd8e625ed1371b3755a85c53247f987850725000`), Transformers 5.19.0 y compressed-tensors 0.17.0 nativo; se proporciona un Dockerfile. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración probada usa `--max-num-seqs 2`, `--enforce-eager` y `--gpu-memory-utilization 0.45`, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apriel-Voice-27B-preview-NVFP4 (esta ficha) | 26.490.627.662 | 262.144 | NVFP4 W4A4, grupo 16 | MIT | Hugging Face, vLLM con plugin |
| ServiceNow-AI/Apriel-Voice-27B-preview (base) | no disponible en la informacion | no disponible | BF16 (presumiblemente) | MIT (según este derivado) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Cuantización no oficial y experimental: no es un lanzamiento de ServiceNow ni una cuantización del checkpoint Gemma base sin modificar.
- Precisión no garantizada: las pruebas de audio son controles cortos, no un benchmark multilingüe; el WER ruso estricto empeoró del 5,56% al 10,42% en la comparación BF16 vs QDQ.
- La comparación BF16 vs QDQ también cambia las rutas de ejecución de expertos, por lo que no aísla el efecto de la cuantización.
- Requiere `--trust-remote-code` para el processor; es necesario revisar el código incluido antes de ejecutarlo.
- vLLM estándar 0.33.0 no registra AprielVoiceModel; es imprescindible el plugin incluido y el runtime fijado.
- Solo se ha probado en una RTX PRO 6000 Blackwell de 96 GB con driver 595.84; no se reclama compatibilidad con otras GPUs o versiones de runtime.
- El contexto de 262.144 tokens se validó con prompts sintéticos; no se establece comprensión real de diálogos largos ni residencia simultánea de contexto completo.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible.
- Idiomas limitados a inglés y ruso; no se declara soporte de castellano.
- Las tool calls se parsearon pero no se ejecutaron contra sistemas externos en las pruebas del autor.
- La licencia MIT permite uso comercial, pero el carácter experimental y la ausencia de garantías de precisión desaconsejan su uso en producción sin validación propia.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/makcimbx/Apriel-Voice-27B-preview-NVFP4
- Modelo base: https://huggingface.co/ServiceNow-AI/Apriel-Voice-27B-preview
- Perfil del autor: https://huggingface.co/makcimbx
- PR de vLLM con la implementación de Apriel: https://github.com/vllm-project/vllm/pull/64683
- Dataset de calibración: https://huggingface.co/datasets/neuralmagic/calibration
