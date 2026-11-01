# selcukkubur/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-mlx-4bit

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, publicado originalmente en formato nativo y distribuido aquí en una conversión a MLX de 4 bits. El repositorio analizado, mantenido por selcukkubur, es una copia del layout MLX publicado por Sawfwair que la aplicación OpenMeet descarga para ejecutar el modelo en hardware Apple Silicon. No se ha entrenado ni ajustado nada: es una cuantización del checkpoint original de NVIDIA en la revisión `ef905575a106fdad904f3b0ce661dccad654607d`.

El modelo combina una arquitectura híbrida poco habitual: capas Mamba, capas de mezcla de expertos (MoE) con 23 capas y dos matrices por capa (46 matrices de expertos enrutados), además de dos codificadores de audio y tensores de predicción multi-token. El nombre comercial indica 30B-A4B, es decir, aproximadamente 30 mil millones de parámetros totales con unos 4 mil millones activos por token, aunque el recuento real de parámetros en los safetensors de esta conversión es de 8.861.901.440, un dato que conviene interpretar con cautela porque el empaquetado de los expertos en 4 bits altera el recuento nominal.

La relevancia actual del repositorio es práctica: permite ejecutar un modelo ASR de gran tamaño en un Mac con 48 GB de memoria unificada, con un consumo medido de unos 22,4 GB de pesos residentes y un pico de proceso de 22,8 GB para ventanas de 8 segundos. Es, por tanto, una pieza de infraestructura para transcripción local en escritorio más que un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas Mamba, 23 capas MoE (46 matrices de expertos enrutados), dos codificadores de audio y tensores de predicción multi-token |
| Parametros totales | 8.861.901.440 según safetensors de esta conversión; el nombre comercial indica 30B-A4B |
| Parametros activos | Aproximadamente 4B según el sufijo A4B del nombre; no disponible el desglose exacto |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, con escalas y sesgos en BF16 aplicados solo a las 46 matrices de expertos enrutados; el resto de tensores conserva los dtypes de NVIDIA |
| Idiomas soportados | No disponibles en la información proporcionada; la model card remite a la model card de NVIDIA (`UPSTREAM_MODEL_CARD.md`) |
| Licencia | OpenMDW License Agreement, versión 1.1 (Copyright 2026 NVIDIA Corporation & Affiliates); el campo `license` del Hub figura como `other` |
| Formato de pesos | safetensors en layout MLX, 29 shards, 25,07 GB; incluye `expert-quantization.json` con el empaquetado de expertos |

## Arquitectura y entrenamiento

La arquitectura es híbrida y específica para ASR. El bloque de lenguaje combina capas Mamba con capas de mezcla de expertos: 23 capas MoE, cada una con dos matrices de expertos enrutados, lo que da 46 matrices que son las únicas cuantizadas en esta conversión. A ello se suman dos codificadores de audio, los routers, los expertos compartidos, las capas Mamba, los embeddings y los tensores de predicción multi-token, que se mantienen con los valores y dtypes originales de NVIDIA (1.223 tensores adicionales). Los tensores de predicción multi-token se conservan aunque una transcripción no los ejecute.

No hay entrenamiento ni ajuste en este repositorio: es una conversión de pesos. La model card no aporta datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO; esa información, si existe, está en la model card de NVIDIA referenciada. La innovación técnica destacable aquí no es del modelo sino del empaquetado: la cuantización selectiva de solo los expertos enrutados reduce el peso a 25,07 GB manteniendo en BF16 las partes sensibles, y el layout requiere un runtime específico que implemente este formato (OpenMeet desde 0.47.0 y mere.run). No es compatible con un checkpoint MLX genérico ni con Transformers, ni con el formato NVFP4 de NVIDIA.

## Capacidades

- Reconocimiento automático del habla (pipeline `automatic-speech-recognition`), orientado a transcripción de audio.
- Procesamiento por ventanas: la medición de memoria se hizo con ventanas de 8 segundos y una fila de 30 segundos.
- Arquitectura con dos codificadores de audio, lo que sugiere tratamiento de señal acústica en dos fases o modalidades.
- Presencia de tensores de predicción multi-token en los pesos, aunque no se ejecutan durante una transcripción.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible; el modelo es ASR, no un LLM de propósito general.
- Modo thinking, visión o audio generativo: no disponible.

## Casos de uso

- Transcripción local en escritorio Mac: con 22,4 GB de pesos residentes y un pico de 22,8 GB, el modelo cabe en un Apple Silicon de 48 GB de memoria unificada y permite transcribir audio sin enviar datos a la nube, algo relevante para material confidencial.
- Actas de reuniones: el caso declarado por OpenMeet es la transcripción de reuniones; el modelo procesa ventanas de audio de 8 a 30 segundos, adecuado para flujos de diarización y post-procesado posteriores.
- Subtitulado de vídeo: la inferencia por ventanas encaja con la generación de subtítulos por segmentos, con la ventaja de que el modelo corre en local y no depende de una API externa.
- Investigación en ASR: al ser una conversión fiel y verificable por SHA-256, sirve como base reproducible para comparar arquitecturas híbridas Mamba-MoE frente a transformers clásicos en tareas de transcripción.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo casi real en equipos de sobremesa, siempre que se acepte la latencia de un modelo de este tamaño en memoria unificada.
- Evaluación de cuantización: el repositorio documenta el proceso de conversión (script `quantize_nemotron_transcribe_experts.py`, mlx 0.32.0, safetensors 0.8.0) y permite estudiar el impacto de cuantizar solo los expertos enrutados frente a cuantizar todo el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta mediciones de memoria y tamaño, no métricas de calidad de transcripción (WER, CER) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM o memoria unificada: unos 22,4 GB de pesos residentes tras la carga; pico de proceso de 22,8 GB con ventanas de 8 segundos y 23,3 GB con una fila de 30 segundos.
- Hardware medido: Apple M5 Pro con 48 GB de memoria unificada y macOS 27.2. No se ha medido en Macs con menos de 48 GB.
- GPU NVIDIA: no disponible; este layout MLX está pensado para Apple Silicon y no se ha validado en CUDA.
- Cabe en GPU de consumo: no disponible para el formato MLX. En términos de tamaño, 25,07 GB de pesos exigirían al menos una GPU de 32 GB si existiera un runtime compatible, pero no hay datos que lo confirmen.
- Opciones de despliegue: OpenMeet desde la versión 0.47.0 y mere.run (MIT). No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque el empaquetado de expertos requiere un runtime que implemente este layout concreto.
- Latencia y throughput: no disponibles; la model card no publica tiempos de inferencia, solo memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (original) | 30B-A4B nominal | No disponible | Pesos nativos de NVIDIA, NVFP4 | OpenMDW 1.1 | HuggingFace, repo de NVIDIA |
| Sawfwair/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-MLX-4bit | Igual, cuantizado | No disponible | MLX 4-bit | OpenMDW 1.1 | HuggingFace |
| Este repositorio (selcukkubur) | Igual, cuantizado | No disponible | MLX 4-bit, 29 shards | OpenMDW 1.1 | HuggingFace, copia verificada por SHA-256 |

No se dispone de datos de benchmarks ni de otros modelos ASR comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un checkpoint MLX ni de Transformers genérico: solo funciona con runtimes que implementen el layout de expertos empaquetados (OpenMeet 0.47.0 o superior, mere.run). Cargarlo con herramientas estándar fallará.
- Solo se ha medido en un Apple M5 Pro de 48 GB; el comportamiento en equipos con menos memoria unificada es desconocido y el pico de 23,3 GB deja poco margen.
- Los benchmarks de calidad de transcripción no están publicados en esta ficha; no hay datos de WER ni de robustez por idioma o acento.
- Idiomas soportados no disponibles: la model card remite a la de NVIDIA, por lo que no se puede confirmar cobertura multilingüe desde este repositorio.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son aplicables los de la model card original de NVIDIA.
- Licencia OpenMDW 1.1: es una licencia con condiciones; conviene revisar `LICENSE` antes de un uso comercial. El campo del Hub figura como `other`, lo que puede complicar la detección automática de licencias en pipelines.
- Repositorio de un tercero: aunque la copia está verificada byte a byte contra la conversión de Sawfwair y el SHA-256 del checkpoint de NVIDIA, la autoría y el mantenimiento no son de NVIDIA; para producción conviene fijar la revisión y verificar `SHA256SUMS`.
- Los tensores de predicción multi-token se conservan pero no se ejecutan en transcripción; no deben interpretarse como una capacidad activa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/selcukkubur/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-mlx-4bit
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Conversión MLX original de Sawfwair: https://huggingface.co/Sawfwair/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-MLX-4bit
- Runtime mere.run: https://github.com/sawfwair/mere-run
- OpenMeet: https://openmeet.in
