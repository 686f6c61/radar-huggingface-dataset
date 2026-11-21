# capyctl/Qwen3.6-35B-A3B-NVFP4

## Resumen

Qwen3.6-35B-A3B-NVFP4 es una conversión cuantizada del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario capyctl. Se trata de un checkpoint derivado del build NVFP4 oficial de NVIDIA, en el que se han reconvertido a W4A16 NVFP4 las grandes proyecciones del bloque DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), mientras se conservan intactos los expertos enrutados y compartidos, la cabeza de salida y las proyecciones de atención completa (estas últimas en FP8). El objetivo declarado es reducir el tráfico de pesos en inferencia sin recalibrar las activaciones ni recuantizar los expertos ya empaquetados en NVFP4.

El modelo base es un transformer de tipo Mixture-of-Experts con arquitectura híbrida que combina capas DeltaNet (atención lineal recurrente) y capas de atención completa, con 35.951.822.704 parámetros totales según los safetensors del repositorio. El checkpoint ocupa 23 GB en formato safetensors y está pensado para servirse con vLLM 0.32.0 sobre hardware Blackwell (GB10), aprovechando decodificación especulativa DFlash2 con bloque 8.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización selectiva por familia de tensores que reduce el tráfico lógico de pesos de 2.254.641.880 a 1.814.239.600 bytes por token (un 19,5 % menos) manteniendo una concordancia offline del 96,50 % frente al 97,04 % del build de NVIDIA; por otro, ofrece mediciones reproducibles en una única GB10 que permiten evaluar el coste/beneficio real de esta conversión frente a las recetas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (capas DeltaNet de atención lineal + capas de atención completa); tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre indica 3B activos, no confirmado en la información) |
| Longitud de contexto | hasta 262k tokens mencionados como límite teórico; pruebas de recuperación realizadas hasta 220k tokens de entrada |
| Tipos de cuantizacion | NVFP4 (expertos, cabeza y proyecciones DeltaNet en W4A16), FP8 (proyecciones de atención completa), 8-bit (tag); sin calibración de activaciones nueva |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado NVFP4 según convención ModelOpt) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que alterna capas DeltaNet (atención lineal con estado recurrente) y capas de atención completa, dentro de un esquema Mixture-of-Experts con enrutamiento 8/256 expertos según los datos de tráfico del checkpoint. Esta combinación busca reducir el coste de atención en contextos largos manteniendo capacidad de recuperación exacta. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

La contribución técnica de este checkpoint es la cuantización selectiva por familia de tensores. Las proyecciones grandes de DeltaNet se convierten de BF16 a W4A16 NVFP4 mediante una búsqueda de escalas de bloque: cada bloque de 16 pesos busca multiplicadores de escala entre 0,60 y 1,10 en pasos de 0,025, redondeando las escalas a FP8 antes de minimizar el error cuadrático de pesos. Los módulos qkv/z fusionados comparten una escala global compatible. Los expertos enrutados y compartidos, la cabeza de salida, MTP, routers, proyecciones pequeñas, convoluciones, normas, embeddings y visión se conservan byte a byte del build de NVIDIA. Las proyecciones de atención completa permanecen en FP8 y solo se eliminan las escalas de entrada FP8 obsoletas en las matrices W4A16 modificadas. El autor advierte explícitamente de que la aritmética recurrente de DeltaNet no se ejecuta en NVFP4 y de que no se ha realizado calibración de activaciones nueva.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo thinking por defecto, desactivable para evaluaciones offline.
- Capacidades de código: HumanEval evaluado con 159/164 en este checkpoint.
- Razonamiento matemático: GSM8K evaluado con 234/250.
- Tool calling / function calling: 30/30 en la batería de herramientas del autor.
- Recuperación en contexto largo: 60/60 observaciones y 180/180 códigos en documentos sembrados hasta 220k tokens de entrada.
- Extracción exacta ordenada y copia estricta: 100/100 en documentos de 2000 tokens.
- Capacidades de visión: los pesos de visión se conservan del build de NVIDIA (no se detalla el alcance funcional en la información).
- Decodificación especulativa compatible con DFlash2 (bloque 8) y MTP.

## Casos de uso

- Servicio de chat en producción sobre GPU Blackwell: el checkpoint está empaquetado para vLLM 0.32.0 y reduce el tráfico de pesos por token un 19,5 % frente al build de NVIDIA, lo que se traduce en 129,7 tokens/s en un stream y 328,4 tokens/s agregados con 8 streams en una GB10.
- Razonamiento matemático asistido: con 234/250 en GSM8K y truncamientos controlados, es adecuado para asistentes de resolución de problemas paso a paso donde se requiere thinking mode activado.
- Generación y revisión de código: 159/164 en HumanEval y soporte de tool calling permiten integrarlo en pipelines de CI/CD para sugerencias, parcheo y validación con llamadas a herramientas externas.
- Agentes multi-paso con herramientas: la batería de herramientas pasa 30/30 y el modelo soporta function calling, lo que habilita orquestación de agentes con llamadas a APIs.
- Análisis de documentos largos y recuperación exacta: las pruebas de retrieval pasan 180/180 códigos en documentos sembrados hasta 220k tokens, útil para búsqueda y extracción en contratos, informes o bases de conocimiento extensas.
- Extracción literal y copia fiable: 100/100 en copia estricta sobre documentos de 2000 tokens, adecuado para tareas de transcripción controlada y verificación de citas.
- Despliegue en hardware de gama única: el checkpoint está pensado para una GB10 con vLLM, lo que permite servir un MoE de 35B en un nodo compacto con latencias de decodificación de 130–140 tokens/s en contextos de 32k–110k.

## Benchmarks y rendimiento

Mediciones del autor en una GB10 con vLLM 0.32.0, temperatura cero, thinking por defecto, una ronda de calentamiento y tres rondas medidas. Tokens/s en todas las columnas de throughput.

| Setup | Short 1 stream | Short 8 streams | Decode 32k / 110k | GSM8K | Tools | HumanEval |
|---|---:|---:|---|---:|---:|---:|
| Este checkpoint, vLLM 0.32 DFlash2 | 129,7 | 328,4 | 137,6 / 130,6 | 234/250 | 30/30 | 159/164 |
| NVIDIA, mismo setup DFlash2 | 119,0 | 336,5 | 135,0 / 114,3 | 229/250 | 30/30 | 156/164 |
| Receta publicada NVIDIA GB10 vLLM MTP4, reproducida en 0.32 | 103,7 | 304,3 | 101,8 / 90,0 | 231/250 | 30/30 | 159/164 |
| Alternativa combinada (atención completa también NVFP4), mismo DFlash2 | 127,1 | 338,7 | 133,0 / 114,0 | 231/250 | 30/30 | 154/164 |

Concordancia offline con respuestas BF16 del profesor: este checkpoint 19.398/20.102 (96,4979 %) frente a 19.506/20.102 (97,0351 %) de NVIDIA y 19.356/20.102 (96,2889 %) de la alternativa combinada, sobre 200 prompts y 20.102 posiciones forzadas con thinking desactivado. Tráfico lógico de bytes por token: 1.814.239.600 en este checkpoint, 2.254.641.880 en NVIDIA y 1.694.963.920 en la alternativa combinada; el autor aclara que es aritmética de payload, no ancho de banda DRAM medido.

Longitudes aceptadas de DFlash2 a 8k/32k/64k/110k: 3,513 / 3,770 / 3,784 / 4,231, con aceptación de tokens borrador del 35,89 % / 39,57 % / 39,77 % / 46,16 %. La ejecución separada sobre ficheros empaquetados da 128,6/336,3 tokens/s agregados a 1/8 streams y 131,2 tokens/s de decodificación a un stream; una única petición a 110k da 140,3 tokens/s de decodificación.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,0 GB en safetensors; se requiere margen adicional para KV cache, estado recurrente de DeltaNet y activaciones, no cuantificado en la información.
- GPU recomendadas: GB10 (hardware de referencia del autor) con soporte NVFP4; se presupone compatibilidad con GPUs Blackwell con NVFP4 nativo, no confirmado para otras familias en la información.
- Cabe en consumer GPU: no disponible; NVFP4 requiere aceleración específica y no se documenta su ejecución en GPUs de consumo.
- Opciones de despliegue: vLLM 0.32.0 con CapyCTL 0.1.12 y receta de despliegue fijada; el autor indica que las comprobaciones de formato en CPU y la concordancia offline no cualifican un motor de inferencia.
- Latencia y throughput: 129,7 tokens/s a un stream y 328,4 tokens/s agregados a 8 streams en short; 137,6 y 130,6 tokens/s de decodificación a 32k y 110k respectivamente en una GB10.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Throughput 1 stream (GB10) | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este checkpoint (capyctl NVFP4 selectivo) | 35.951.822.704 | hasta 262k (probado 220k) | 129,7 t/s | 234/250 | 159/164 | Apache 2.0 | Hugging Face |
| NVIDIA Qwen3.6-35B-A3B-NVFP4 | no disponible | no disponible | 119,0 t/s (DFlash2) | 229/250 | 156/164 | no disponible en la información | Hugging Face |
| Receta NVIDIA GB10 vLLM MTP4 | no disponible | no disponible | 103,7 t/s | 231/250 | 159/164 | no disponible en la información | Reproducida por el autor |
| Alternativa combinada (atención completa NVFP4) | no disponible | no disponible | 127,1 t/s | 231/250 | 154/164 | no disponible en la información | Variante medida por el autor |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; el modelo base Qwen puede heredar sesgos de sus datos de entrenamiento, no documentados aquí.
- Riesgo de alucinación: no cuantificado; las métricas de concordancia offline (96,50 %) miden similitud con el profesor BF16, no veracidad.
- La aritmética recurrente de DeltaNet no se ejecuta en NVFP4; solo los pesos se almacenan en ese formato, por lo que el ahorro es de tráfico de pesos, no de cómputo.
- El tráfico lógico de bytes por token es aritmética de payload y excluye MTP/visión inactivos, tráfico KV/estado/activaciones y reutilización de caché; no equivale a ancho de banda DRAM medido.
- Las pruebas de contexto largo son finitas (hasta 220k tokens de entrada) y no garantizan precisión arbitraria a 262k.
- El checkpoint pierde throughput a 8 streams frente a NVIDIA con la misma configuración DFlash2 (328,4 frente a 336,5 tokens/s).
- Diferencias pequeñas en GSM8K y HumanEval no establecen una ventaja de precisión según el propio autor.
- Las comprobaciones de formato en CPU y la concordancia offline no cualifican un motor de inferencia; se requiere validación en el entorno de despliegue.
- Licencia Apache 2.0 permite uso comercial, pero las licencias y condiciones de los modelos base (Qwen y NVIDIA) deben verificarse por separado.
- Dependencia estricta de vLLM 0.32.0 y CapyCTL 0.1.12 para reproducir las mediciones; otras versiones pueden alterar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/capyctl/Qwen3.6-35B-A3B-NVFP4
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Repositorio CapyCTL: https://github.com/edurdias/capyctl
- Receta de despliegue vLLM para GB10: https://github.com/edurdias/capyctl-recipes/tree/main/vllm/qwen3.6-35b-a3b-capyctl-nvfp4-gb10
- Evidencia de tráfico y concordancia (family-ablation.json): https://github.com/edurdias/capyctl-recipes/blob/main/comparisons/qwen3.6-35b-a3b-builds-gb10/tensors/results/family-ablation.json
