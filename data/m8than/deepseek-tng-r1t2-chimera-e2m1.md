# m8than/DeepSeek-TNG-R1T2-Chimera-E2M1

## Resumen

DeepSeek-TNG-R1T2-Chimera-E2M1 es una conversión cuantizada del modelo tngtech/DeepSeek-TNG-R1T2-Chimera, publicada por el usuario m8than en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos en formatos de baja precisión optimizados para GPUs AMD gfx942 (arquitectura MI300). El modelo conserva la arquitectura DeepSeek V3 con mezcla de expertos (MoE) y un total de 102.454.668.032 parámetros.

La conversión mantiene las capas de atención, MLP densas y expertos compartidos en FP8 E4M3 con escalas de bloque FP32, mientras que los expertos enrutados (incluida la capa NextN) se almacenan en formato E2M1 de 4 bits con escalas de bloque de 128×128. El resultado es un repositorio de 356 GB distribuido en 165 shards de safetensors, pensado para ejecutarse exclusivamente con el stack Furnace SGLang sobre hardware AMD.

Su relevancia es acotada: se trata de un artefacto de infraestructura para despliegue en clústeres AMD, no de un modelo de propósito general listo para consumir. La licencia MIT del modelo base se mantiene, pero el formato propietario y los requisitos de runtime limitan su uso fuera de entornos gfx942 con kernels AITER/CK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v3) con capa NextN |
| Parametros totales | 102.454.668.032 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (dense/shared) + E2M1 4-bit (expertos enrutados), bloques 128×128 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (165 shards, 356 GB, 91.991 tensores) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura DeepSeek V3, un transformer con mezcla de expertos que combina capas densas, expertos compartidos y expertos enrutados, además de una capa NextN (predicción multi-token). Esta conversión no modifica la topología: los 45.312 tensores de pesos enrutados (U32) y sus 45.312 escalas (F32) cubren las capas 3 a 61, incluida NextN, mientras que los 496 pesos densos/compartidos en FP8 y sus 496 escalas FP32 se copian sin cambios desde el checkpoint original en la revisión 748c3e0469acd9e7ac6abfafe4acf4e04119f6fb.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni sobre fases de RLHF o DPO del modelo base. La innovación técnica de esta publicación es puramente de compresión y portabilidad: la conversión a E2M1 de los expertos enrutados es lossy, con un error relativo L2 de 0,1286, RMSE de 0,001574 y error absoluto máximo de 0,1875 sobre 665.183.059.968 pesos enrutados. El formato no es MXFP4 nativo y es incompatible con loaders que esperan escalas de grupo 32.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base DeepSeek-TNG-R1T2-Chimera.
- Razonamiento y matemáticas: el modelo base deriva de la familia DeepSeek R1, orientada a razonamiento.
- Generación de código: capacidad esperable del modelo base, aunque no verificada en esta conversión.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta conversión.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Multilingüismo: no disponible; la model card no declara idiomas.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres AMD MI300 (gfx942): el modelo está diseñado para ejecutarse con Furnace SGLang y kernels AITER/CK, por lo que su caso principal es servir inferencia en infraestructura AMD con memoria HBM abundante.
- Investigación sobre cuantización MoE: permite estudiar el impacto de E2M1 con bloques 128×128 en expertos enrutados frente a FP8, usando las métricas de error publicadas como referencia.
- Benchmarking de kernels: sirve como carga de trabajo representativa de un MoE de ~102B parámetros para validar rendimiento de AITER/CK en gfx942.
- Servicio de generación de texto a gran escala en entornos controlados: con 356 GB de pesos, requiere nodos multi-GPU MI300 y un runtime específico, adecuado para endpoints internos de chat o razonamiento.
- Reproducción de experimentos de compresión: el manifest completo con estado `servable=true` y las métricas de error permiten replicar la conversión y comparar metodologías.
- Evaluación de degradación por cuantización: comparar salidas frente al modelo base en FP8 para medir la pérdida introducida por E2M1 en tareas de razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de error de cuantización: `relative_l2=0.1286`, `rmse=0.001574`, `max_abs_error=0.1875` sobre 665.183.059.968 pesos enrutados.

## Requisitos de hardware

- VRAM estimada: al menos 356 GB solo para pesos, más activaciones BF16 y caché KV; en la práctica requiere un nodo multi-GPU.
- GPU recomendadas: AMD Instinct MI300 (gfx942) exclusivamente; no se declara soporte para NVIDIA A100, H100 ni RTX 4090.
- Consumer GPU: no cabe en ninguna GPU de consumo; el tamaño y el runtime lo impiden.
- Opciones de despliegue: Furnace SGLang con soporte dense-FP8 E2M1, kernels AITER/CK. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su configuración estándar, ni con loaders que esperen MXFP4 con escalas de grupo 32.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| DeepSeek-TNG-R1T2-Chimera-E2M1 (este) | 102,45 B | no disponible | FP8 + E2M1, safetensors | MIT | AMD gfx942 |
| tngtech/DeepSeek-TNG-R1T2-Chimera (base) | no disponible en la información | no disponible | safetensors originales | MIT | no disponible |
| Alternativas de ~100B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con modelos de la misma categoría más allá del modelo base.

## Limitaciones y advertencias

- La cuantización E2M1 de los expertos enrutados es lossy, con error relativo L2 de 0,1286; puede degradar la calidad frente al modelo base.
- Requiere hardware AMD gfx942 y el stack Furnace SGLang con kernels AITER/CK; no funciona en NVIDIA ni en runtimes estándar.
- Incompatible con loaders que esperan MXFP4 con escalas de grupo 32.
- El repositorio ocupa 356 GB en 165 shards, lo que complica el almacenamiento y la distribución.
- No se declaran idiomas soportados ni longitud de contexto en la información disponible.
- Riesgo de alucinación y sesgos del modelo base no documentados en esta conversión.
- La licencia MIT permite uso comercial, pero las restricciones técnicas de runtime limitan su aplicabilidad práctica.
- Solo 12 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/m8than/DeepSeek-TNG-R1T2-Chimera-E2M1
- Modelo base: https://huggingface.co/tngtech/DeepSeek-TNG-R1T2-Chimera
- Revisión del modelo base referenciada: 748c3e0469acd9e7ac6abfafe4acf4e04119f6fb
