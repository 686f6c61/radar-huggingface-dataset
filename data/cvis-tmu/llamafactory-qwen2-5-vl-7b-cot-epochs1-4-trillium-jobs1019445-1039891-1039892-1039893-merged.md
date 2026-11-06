# cvis-tmu/llamafactory-qwen2.5-vl-7b-CoT-epochs1-4-trillium-jobs1019445-1039891-1039892-1039893-merged

## Resumen

El modelo `cvis-tmu/llamafactory-qwen2.5-vl-7b-CoT-epochs1-4-trillium-jobs1019445-1039891-1039892-1039893-merged` es un ajuste fino completo (pesos fusionados en BF16) del modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por el usuario cvis-tmu. Se ha entrenado con LLaMA-Factory sobre el cluster Trillium (SLURM, identificador `grillium`) en cuatro epocas encadenadas (jobs 1019445, 1039891, 1039892 y 1039893), y el adaptador LoRA resultante se ha fusionado en los pesos base para permitir inferencia directa sin necesidad de cargar un adaptador separado.

El objetivo declarado del entrenamiento es dotar al modelo de razonamiento encadenado (chain-of-thought) aplicado a tareas visoespaciales y de escenas 3D, usando los datasets Scene30k, SpatialSSRL_coldstart y 3DThinker10k. El modelo conserva la arquitectura y el tokenizador originales de Qwen2.5-VL-7B, con 8.292.166.656 parametros totales y licencia Apache 2.0.

Es relevante ahora porque demuestra un flujo reproducible de ajuste fino multimodal con LoRA sobre infraestructura HPC abierta, y porque publica trazabilidad completa del entrenamiento (jobs, revision base, perdida de validacion, historial W&B). No obstante, se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL: vision encoder + LLM decoder) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), con tokenizer y processor incluidos |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-VL-7B-Instruct` (revision `cc594898137f460bfe9f0759e9844b3ce807cfb5`), un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje. Sobre esta base se aplico un ajuste fino con LoRA mediante LLaMA-Factory, y posteriormente se fusiono el adaptador en los pesos completos en BF16 (job de merge `1242587`, `merge_CoT_epoch4`).

El entrenamiento se ejecuto en cuatro epocas encadenadas: la epoca 1 se lanzo como un job de una sola epoca (job 1019445) y las epocas 2 a 4 bajo un horizonte de cuatro epocas (jobs 1039891, 1039892 y 1039893), alcanzando el step global 2468. Los datasets registrados por el trainer son Scene30k, SpatialSSRL_coldstart y 3DThinker10k, orientados a escenas y razonamiento espacial. La perdida de validacion reportada es 0.8912979364395142. El autor advierte explicitamente de una discontinuidad en el learning rate al inicio de la epoca 2, por lo que el resultado no equivale a un schedule coseno ininterrumpido de cuatro epocas. No se detalla el numero de tokens de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Razonamiento encadenado (chain-of-thought) potenciado por el ajuste fino con los datasets CoT.
- Razonamiento espacial y sobre escenas 3D, segun los datasets de entrenamiento declarados.
- Capacidades heredadas de Qwen2.5-VL-7B-Instruct: comprension de imagenes, documentos y contenido visual.
- Soporte de conversacion multi-turno mediante la plantilla de chat de Qwen2-VL.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmadas explicitamente en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.

## Casos de uso

- Razonamiento visoespacial en robotica: el modelo puede interpretar imagenes de escenas y razonar sobre relaciones espaciales entre objetos, aprovechando el entrenamiento con Scene30k y SpatialSSRL_coldstart.
- Analisis de imagenes 3D y reconstruccion conceptual: uso del ajuste con 3DThinker10k para tareas de comprension de geometria y descripcion de escenas tridimensionales a partir de vistas.
- Investigacion en chain-of-thought multimodal: sirve como checkpoint de referencia para estudiar como el ajuste fino con datos CoT afecta al razonamiento visual, comparandolo con el modelo base.
- Evaluacion de pipelines de ajuste fino con LLaMA-Factory: util como caso reproducible de entrenamiento LoRA fusionado en HPC (Trillium), con trazabilidad de jobs y merge.
- Prototipado de asistentes visuales en ingles: generacion de descripciones y respuestas conversacionales sobre imagenes en entornos de investigacion.
- Baseline para experimentos de alineacion multimodal: permite comparar perdida de validacion y calidad de razonamiento frente a otros checkpoints de la misma linea de entrenamiento.
- Demostracion de despliegue con TGI: al ser compatible con text-generation-inference, puede servirse como endpoint para pruebas internas de inferencia imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion de 0.8912979364395142, que por si sola no establece precision en tareas downstream ni calidad de razonamiento, tal como advierte el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,6 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB de pesos; en 4 bits, alrededor de 5-6 GB (cuantizacion no publicada por el autor, requeriria conversion propia).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto limitado, o en GPUs de 16 GB si se cuantiza a 8/4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`); vLLM, llama.cpp u Ollama no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen2.5-VL-7B + LoRA CoT fusionado) | 8,29 B | no disponible | Apache 2.0 | Ajuste CoT visoespacial, solo ingles, sin benchmarks |
| Qwen/Qwen2.5-VL-7B-Instruct | ~8,3 B | no disponible en esta ficha | Apache 2.0 | Modelo base; capacidades generales y multilingues |
| Qwen2.5-VL-3B-Instruct | ~3-4 B | no disponible en esta ficha | Apache 2.0 | Version menor, menor coste de inferencia |
| LLaVA-OneVision-7B | ~7-8 B | no disponible en esta ficha | Apache 2.0 | Alternativa multimodal open source de tamano similar |

Los datos de contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; la comparacion se limita a parametros y licencia.

## Limitaciones y advertencias

- Checkpoint de investigacion con cero descargas y cero likes; no hay evidencia de validacion externa.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- La perdida de validacion (0.891) no garantiza precision downstream ni calidad de razonamiento.
- Discontinuidad del learning rate entre la epoca 1 y la epoca 2; el schedule no es equivalente a un coseno continuo de cuatro epocas.
- No incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.
- Riesgo de alucinacion inherente a los modelos generativos multimodales; no se han publicado evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El nombre del repositorio es extremadamente largo y especifico de la infraestructura, lo que dificulta su descubrimiento y mantenimiento.
- No se especifica la longitud de contexto efectiva tras el ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/cvis-tmu/llamafactory-qwen2.5-vl-7b-CoT-epochs1-4-trillium-jobs1019445-1039891-1039892-1039893-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Historial de entrenamiento W&B: https://wandb.ai/cvis_tmu/llamafactory/runs/7po7wsg2
- LLaMA-Factory (framework): no se proporciona enlace en la informacion disponible
- Paper de Qwen2.5-VL: no se proporciona enlace en la informacion disponible
- Repositorio o demo adicional: no disponible
