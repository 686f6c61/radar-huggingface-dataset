# 2uanDM/Qwen3.5-9B-FP8-Dynamic

## Resumen

Qwen3.5-9B-FP8-Dynamic es una cuantizacion en FP8 del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario 2uanDM. El modelo original lo desarrolla el equipo Qwen (Alibaba) y combina procesamiento de texto e imagen bajo el pipeline `image-text-to-text`. Esta version cuantizada mantiene la licencia Apache-2.0 del modelo base y reduce el peso en disco de aproximadamente 19 GB en BF16 a unos 12 GB en FP8.

La particularidad tecnica de esta ficha es el uso del formato `FP8_DYNAMIC` de compressed-tensors con escalas por canal de salida (per-output-channel) en lugar del formato por bloques 128x128 que emplea Qwen en sus cuantizaciones oficiales. Segun el autor, esto permite que vLLM ejecute kernels FP8 reales W8A8 (CUTLASS) en GPUs Ada (RTX 40xx, L4, L40S), Hopper y Blackwell, mientras que el formato por bloques queda relegado a FP8 solo de pesos (Marlin) en Ada.

El modelo cuenta con 9.653.104.368 parametros segun los safetensors del repositorio y esta pensado para despliegue en produccion con vLLM mediante API compatible con OpenAI. Es relevante para quienes quieran servir un modelo multimodal de ~9B en GPUs de consumo o de gama profesional con aceleracion FP8 real en prefill y decodificacion por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Gated-DeltaNet) y atencion completa; incluye torre de vision y cabecera `mtp` |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 20000`) |
| Tipos de cuantizacion | FP8 E4M3 dinamica (pesos simetricos por canal de salida, activaciones por token); capas de vision, `lm_head`, `embed_tokens`, `conv1d`, `in_proj_a`, `in_proj_b` y `mtp.fc` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con config de compressed-tensors (`FP8_DYNAMIC`), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura hibrida que alterna capas de atencion lineal basadas en Gated-DeltaNet con capas de atencion completa, e incorpora una torre de vision para entrada de imagenes y una cabeza `mtp` (multi-token prediction). Esta version FP8 conserva esas capas en BF16 para no degradar su comportamiento numerico, igual que hace la cuantizacion oficial Qwen3.5-27B-FP8 de Qwen.

El proceso de cuantizacion se realiza en CPU mediante el script `scripts/fp8_dynamic_convert.py`, que recorre los shards de safetensors originales (unos 20 GB de RAM, pocos minutos) y genera pesos FP8 con escalas por canal de salida. Las activaciones usan escalas dinamicas por token, por lo que no requiere datos de calibracion. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni sobre fases de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes y respuesta en texto (image-text-to-text), con soporte para multiples imagenes por prompt (el ejemplo de vLLM limita a 10 imagenes por prompt con `--limit-mm-per-prompt.image 10`).
- Razonamiento, aritmetica y QA factual: el autor indica que se han hecho comprobaciones de sanidad en estos dominios.
- Despliegue como API compatible con OpenAI mediante vLLM (`endpoints_compatible` en los tags).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta texto e imagenes y puede exponerse como endpoint compatible con OpenAI mediante vLLM; su tamano de ~12 GB en FP8 permite alojarlo en GPUs de 20 GB o superiores.
- Descripcion y analisis de imagenes en lote: con `--max-num-seqs` configurable y soporte de varias imagenes por prompt, encaja en pipelines de etiquetado o moderacion de contenido visual.
- Asistente conversacional con contexto largo: el ejemplo de despliegue admite `--max-model-len 20000`, adecuado para conversaciones multi-turno con historial extenso.
- Inferencia en GPUs de consumo Ada (RTX 40xx, RTX 5090): al usar kernels CUTLASS FP8 en sm89 y sm120, el modelo obtiene aceleracion real en prefill y decodificacion por lotes frente al formato por bloques.
- Backend de aplicaciones RAG multimodales: la combinacion de entrada de imagen y texto permite indexar y consultar documentos con figuras usando un unico modelo.
- Prototipado e investigacion: el script de conversion permite reproducir la cuantizacion en CPU sin GPU, util para equipos que quieran adaptar el formato a su infraestructura.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de FP8 por canal frente a FP8 por bloques en vLLM sobre hardware Ada.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de rendimiento del autor en una NVIDIA RTX 4000 SFF Ada (20 GB, 70 W) con vLLM 0.32.0 y `vllm bench serve`, comparando este modelo (CUTLASS W8A8) con el mismo modelo en formato FP8 por bloques de Qwen (Marlin, solo pesos) en Ada.

| Escenario | Block FP8 (Marlin) | Este modelo (CUTLASS W8A8) | Aceleracion |
|---|---|---|---|
| Prefill intensivo, 4000 in / 16 out, concurrencia 8: tok/s totales | 2.179 | 4.308 | 1,98x |
| Prefill intensivo: TTFT medio | 5.554 ms | 2.768 ms | 2,0x |
| Decodificacion por lotes, 512 in / 256 out, concurrencia 32: tok/s de salida | 395 | 472 | 1,20x |
| Decodificacion por lotes: TTFT medio | 2.492 ms | 1.232 ms | 2,0x |
| Usuario unico, 256 in / 256 out, concurrencia 1: tok/s de salida | 27,4 | 26,0 | ~1,0x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que solo se han realizado comprobaciones de sanidad.

## Requisitos de hardware

- VRAM estimada: unos 12 GB para los pesos en FP8; con cache KV y estados de atencion lineal, el autor recomienda GPUs de 20 GB o mas para el ejemplo de despliegue (`--gpu-memory-utilization 0.9`, `--max-model-len 20000`).
- GPUs recomendadas: Ada (RTX 40xx, L4, L40S), Hopper (H100) y Blackwell (incluida RTX 5090, sm120) para aprovechar kernels FP8 W8A8 de CUTLASS. En Ada el formato por bloques solo obtendria FP8 de pesos via Marlin.
- Cabe en GPU de consumo: si, en tarjetas de 20 GB o mas (por ejemplo RTX 4000 SFF Ada del benchmark; el autor menciona RTX 5090 como compatible con sm120).
- Despliegue: vLLM mediante imagen `vllm/vllm-openai:latest`; el autor advierte que en tarjetas de 20 GB se mantenga `--max-num-seqs` en torno a 200 o menos, porque las capas de atencion lineal hibrida necesitan una ranura de estado por secuencia y vLLM no arranca si se supera el numero de ranuras disponibles.
- Latencia y throughput: ver tabla de benchmarks. En usuario unico la decodificacion esta limitada por ancho de banda de memoria (ambos formatos leen 1 byte por peso), con ~26-27 tok/s de salida; las ganancias se concentran en prefill y servicio por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-FP8-Dynamic (este) | 9.653.104.368 | no disponible | FP8 E4M3 dinamica por canal, safetensors + compressed-tensors | Apache-2.0 | Hugging Face, vLLM |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | BF16, safetensors | Apache-2.0 | Hugging Face |
| Qwen3.5-27B-FP8 (oficial) | no disponible | no disponible | FP8 por bloques 128x128 | Apache-2.0 | Hugging Face |

La informacion disponible no incluye datos de rendimiento de calidad del modelo base ni de la version oficial de 27B, por lo que no es posible una comparacion cuantitativa de precision. La comparativa se limita a tamano, formato de cuantizacion y licencia.

## Limitaciones y advertencias

- No se ha ejecutado una evaluacion formal de calidad; el autor solo ha verificado aritmetica, QA factual y descripcion de imagenes. Aunque FP8 por canal suele ser casi sin perdida a esta escala, conviene validar en las tareas propias.
- La cuantizacion deja en BF16 la torre de vision, `lm_head`, `embed_tokens`, capas `conv1d`, `in_proj_a`, `in_proj_b` y `mtp.fc`, por lo que el ahorro de memoria no es proporcional al de un FP8 completo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos generativos.
- Limitaciones de contexto e idioma: no disponibles; el unico dato es el ejemplo de despliegue con `--max-model-len 20000`.
- Restricciones de licencia: Apache-2.0, heredada del modelo base; se permite uso comercial segun los terminos de dicha licencia.
- En produccion, el limite de `max_num_seqs` en tarjetas de 20 GB puede restringir el throughput en cargas de alta concurrencia; hay que dimensionar las ranuras de estado de atencion lineal.
- El repositorio tiene muy pocas descargas (21) y ningun like en el momento de la consulta, y el autor no es el equipo Qwen; conviene tratar la publicacion como una cuantizacion de terceros y verificar su procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2uanDM/Qwen3.5-9B-FP8-Dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Script de conversion: `scripts/fp8_dynamic_convert.py` en el repositorio del modelo
- Script de benchmarks: `scripts/bench.sh` en el repositorio del modelo
