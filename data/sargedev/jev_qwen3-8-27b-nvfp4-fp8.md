# SargeDev/Jev_Qwen3.8-27B-NVFP4-FP8

## Resumen

Jev_Qwen3.8-27B-NVFP4-FP8 es una cuantización de precisión mixta del modelo SargeDev/Jev_Qwen3.8-27B, que a su vez es un merge QLoRA de huihui-ai/Huihui-Qwen3.8-27B-abliterated afinado sobre el corpus SargeDev/jev-distill-corpus-v3. Lo publica el usuario SargeDev (SargeDev) y su propósito es reducir el peso del modelo de 51 GB en bf16 a unos 28 GB, manteniendo intacta la salida estructurada en JSON que el modelo base usa como motor de decisión o juez. Es relevante porque demuestra un flujo de cuantización no uniforme orientado al dominio de despliegue: en lugar de aplicar una receta genérica, se preservan en alta precisión las capas más sensibles y se calibra con muestras del propio dominio de evaluación.

El modelo se apoya en la arquitectura declarada `qwen3_5_text` (transformer decoder-only de la familia Qwen3.5) y cuenta con 21.171.101.568 parámetros reales según los safetensors, por debajo de los 27B que sugiere el nombre. Está entrenado con el modo de pensamiento desactivado (`enable_thinking=false`) y se ha verificado su funcionamiento en una NVIDIA DGX Spark (GB10, sm_121a) con vLLM. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

Se trata de un modelo derivado y «abliterated» (sin las capas de rechazo habituales), por lo que conviene tratarlo como herramienta de investigación más que como servicio de cara al público. Su relevancia práctica es doble: por un lado, sirve como ejemplo reproducible de cuantización NVFP4+FP8 con `llm-compressor` para hardware Blackwell; por otro, valida que un motor de decisión calibrado puede sobrevivir a una compresión agresiva a 4 bits sin romper el formato de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tipo declarado `qwen3_5_text` (familia Qwen3.5) |
| Parametros totales | 21.171.101.568 (21,17 B), segun safetensors |
| Parametros activos | No aplica; no se indica mezcla de expertos (no es MoE) |
| Longitud de contexto | No disponible; el ejemplo de despliegue de vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | Mixta: NVFP4 W4A4 (E2M1, bloque 16, escalas FP8-E4M3) en proyecciones de atencion y gate/up_proj; FP8_DYNAMIC (pesos por canal, activaciones por token) en down_proj; lm_head, embed_tokens y cabeza MTP en alta precision |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors `mixed-precision` (nvfp4-pack-quantized + float-quantized); ~28 GB (repositorio de 29,3 GB) |

## Arquitectura y entrenamiento

La ficha hereda la arquitectura del modelo base: un transformer decoder-only de la familia Qwen3.5 con cabecera MTP (multi-token prediction), segun los identificadores de tipo `qwen3_5_text` y la mención explícita de la cabeza MTP entre las capas ignoradas por la cuantización. El modelo original se construyó como un merge QLoRA de huihui-ai/Huihui-Qwen3.8-27B-abliterated sobre el corpus SargeDev/jev-distill-corpus-v3, y está entrenado con el pensamiento desactivado (`enable_thinking=false`), es decir, orientado a respuestas directas y a salidas estructuradas de tipo juez.

La innovación técnica de esta ficha no está en el entrenamiento, sino en la receta de cuantización no uniforme aplicada con llm-compressor 0.14.0 del proyecto vLLM. Se asigna NVFP4 W4A4 (formato E2M1 con bloques de 16 elementos y escalas en FP8-E4M3) a todas las proyecciones de atención y a `gate_proj`/`up_proj`, mientras que `down_proj` —la clase de capa más sensible al paso a 4 bits— se mantiene en FP8_DYNAMIC con pesos por canal y activaciones por token. Las capas `lm_head`, `embed_tokens` y la cabeza MTP quedan sin cuantizar. La calibración usa 512 muestras con longitud máxima de 2048: 384 prompts de juez retenidos del propio `jev-distill-corpus-v3` en el formato exacto de evaluación (estado + pregunta + opciones) y 128 filas generales de `ultrachat_200k` para no sesgar la calibración al dominio. No se documentan datos sobre volumen de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de texto en ingles con persona conversacional («chatty persona»), segun la model card.
- Emision de salidas estructuradas en JSON calibradas, en formato de juez (estado + pregunta + opciones).
- Funcionamiento como motor de decision o juez automatizado, dominio para el que fue calibrado.
- Respuesta directa sin cadena de pensamiento: el modelo se entreno con `enable_thinking=false` y debe servirse con el pensamiento apagado.
- Modelo «abliterated»/uncensored: no incorpora las capas de rechazo tipicas de los modelos alineados.
- Compatibilidad con el stack vLLM mediante `--quantization compressed-tensors`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilinguesismo.

## Casos de uso

- Juez automatizado (LLM-as-a-judge): el modelo esta calibrado especificamente sobre prompts de juez en formato estado/pregunta/opciones, por lo que puede puntuar y comparar respuestas generadas por otros modelos con salida JSON consistente.
- Evaluacion dentro de pipelines de RLHF o DPO: integrado como recompensador o filtro de preferencias, su salida estructurada permite puntuar candidatos de forma programatica sin parsear texto libre.
- Enrutamiento de peticiones en arquitecturas multiagente: al actuar como motor de decision, puede elegir que herramienta o subagente responde a cada consulta en funcion del estado y las opciones disponibles.
- Clasificacion y puntuacion con salida JSON calibrada: util para etiquetar tickets, correos o comentarios en ingles devolviendo distribuciones de probabilidad en lugar de texto plano.
- Despliegue en hardware de borde o de un solo nodo: sus 28 GB de pesos permiten servirlo con vLLM en una DGX Spark (GB10) sin necesidad de un cluster multi-GPU.
- Investigacion sobre desalineacion y modelos sin censura: al ser un derivado «abliterated», sirve para estudiar comportamiento de modelos sin capas de rechazo en entornos controlados.
- Asistente conversacional de dominio general en ingles: con 8192 tokens de ventana configurados, cubre conversaciones multi-turno de extension media en aplicaciones internas.
- Prototipado de cuantizacion NVFP4/FP8 en Blackwell: la receta publicada (llm-compressor, grupos mixtos, calibracion por dominio) se puede reutilizar como plantilla para comprimir otros modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta mediciones cualitativas de despliegue:

| Metrica | Valor reportado | Condiciones |
|---|---|---|
| Throughput mono-flujo | ~8 tokens/s en generacion larga (200+ tokens) | DGX Spark (GB10), vLLM, stack 0.28-era |
| Latencia de salida de juez | 2-5 s por respuesta JSON | DGX Spark (GB10) |
| Integridad de salida estructurada | Correcta tras cuantizacion | Distribuciones JSON calibradas intactas |
| Regresion de comportamiento | No observada | La persona conversacional se mantiene; se identifica como Qwen |

No se aportan cifras de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~28 GB, por lo que se necesitan al menos 28 GB de memoria dedicada, mas la cache KV y las activaciones (a 8192 tokens de contexto el total practico ronda los 30-32 GB). El ejemplo de la model card usa `--gpu-memory-utilization 0.80`.
- GPU recomendadas: NVIDIA DGX Spark (GB10, sm_121a) es la unica plataforma verificada por el autor. Por capacidad, encajan A100 80 GB, H100 80 GB, L40S 48 GB y GB10 (128 GB de memoria unificada). Requiere arquitectura Blackwell para aprovechar NVFP4 de forma nativa.
- Cabe en GPU de consumo: ajustado en una RTX 5090 (32 GB) si se reserva poca cache KV; no cabe en una RTX 4090 (24 GB) ni en una RTX 3090/4080 por falta de memoria.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` es la ruta documentada. El formato compressed-tensors tambien es consumible por otras herramientas del ecosistema vLLM, aunque no se documentan recetas para llama.cpp, Ollama o TGI (estos formatos no soportan NVFP4/FP8 nativo en la mayoria de versiones).
- Latencia y throughput: ~8 tokens/s en generacion larga mono-flujo y respuestas JSON en 2-5 s sobre GB10. No se aportan datos de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SargeDev/Jev_Qwen3.8-27B-NVFP4-FP8 | 21,17 B | NVFP4 W4A4 + FP8_DYNAMIC (mixta) | no disponible (ejemplo a 8192) | apache-2.0 | HuggingFace, 8 descargas |
| SargeDev/Jev_Qwen3.8-27B (base bf16) | no disponible (mismo modelo, sin cuantizar) | bf16 (~51 GB) | no disponible | apache-2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | bf16 | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparacion se limita a parametros, formato y licencia. No se identifican en la informacion proporcionada otros modelos comparables de terceros.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no se declara soporte de otros idiomas, por lo que su uso en castellano u otras lenguas degradara la calidad.
- Modelo «abliterated»/uncensored: no incorpora las capas de rechazo habituales y puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para exposicion directa al publico sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad y el modelo se presenta como motor de decision; sus salidas JSON deben validarse antes de actuar sobre ellas.
- Cuantizacion agresiva: el paso a NVFP4 W4A4 en atencion y gate/up_proj puede degradar tareas fuera del dominio de calibracion, aunque el autor afirma que las salidas de juez se mantienen intactas.
- Pensamiento desactivado: el modelo fue entrenado con `enable_thinking=false` y debe servirse asi; activar el pensamiento puede producir un comportamiento fuera de distribucion.
- Cabeza MTP ignorada por la cuantizacion: no se documenta si la decodificacion especulativa con MTP funciona correctamente en esta variante.
- Validacion muy limitada: 8 descargas y 0 «likes» en el momento de redactar la ficha, con una unica plataforma de hardware probada (DGX Spark GB10), lo que reduce la evidencia sobre su comportamiento en otros entornos.
- Calibracion con solo 512 muestras: aunque esta orientada al dominio, es un conjunto pequeno que puede no cubrir todos los regimenes de entrada.
- Licencia Apache-2.0: permite uso comercial, pero no exime de las obligaciones de atribucion ni de las responsabilidades derivadas del uso de un modelo sin filtros.
- Datos de contexto no confirmados: la unica cifra disponible es el `--max-model-len 8192` del ejemplo de despliegue, no un limite maximo declarado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/Jev_Qwen3.8-27B-NVFP4-FP8
- Modelo base (bf16): https://huggingface.co/SargeDev/Jev_Qwen3.8-27B
- Modelo abliterated de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset de calibracion general: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Stack de servicio vLLM: https://github.com/vllm-project/vllm
