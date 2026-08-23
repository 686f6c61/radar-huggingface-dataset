# protoLabsAI/Ornith-1.5-9B-MTP-GGUF

## Resumen

Ornith-1.5-9B-MTP-GGUF es una compilación en formato GGUF del modelo multimodal `ornith-ai/Ornith-1.5-9B` publicada por protoLabsAI, que incorpora una cabeza de predicción multi-token (MTP) destilada e integrada directamente en los pesos del modelo. Esta cabeza permite activar decodificación especulativa auto-especulativa sin pérdida en llama.cpp, sin necesidad de conectar un modelo borrador externo, mediante la opción `--spec-type draft-mtp`.

El modelo base Ornith-1.5-9B pertenece a la familia Ornith-1.5, desarrollada por ornith-ai y deepreinforce-ai, que extiende el marco de auto-andamiaje (self-scaffolding) de Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos y produce soluciones para aprendizaje por refuerzo. La arquitectura base es un híbrido Qwen3.5-9B que combina atención lineal y atención completa, con capacidades multimodales (entrada de imagen y texto). Esta compilación GGUF está optimizada para despliegue local con llama.cpp y es relevante porque resuelve el problema de que los GGUF oficiales de Ornith-1.5 no incluyen los pesos MTP declarados en la configuración, impidiendo la especulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5-9B (atención lineal + atención completa) con cabeza MTP destilada |
| Parametros totales | 9B (modelo base); cabeza MTP destilada: 456.010.480 (según safetensors del head) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Al menos 32.000 tokens (verificado en pruebas de recuperación de aguja) |
| Tipos de cuantizacion | NVFP4, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, IQ2_M, BF16 |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (con proyecto de visión mmproj en BF16) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer híbrido derivado de Qwen3.5-9B, que combina capas de atención lineal con capas de atención completa. La familia Ornith-1.5 se entrena mediante un bucle de auto-mejora de extremo a extremo: el modelo genera sus propias tareas, construye andamiajes específicos y produce rollouts de solución que se utilizan para aprendizaje por refuerzo. Este proceso desplaza los estados ocultos del modelo mucho más que un fine-tuning ligero, lo que hace que un head MTP transferido de otro modelo no funcione bien.

La contribución técnica principal de esta compilación es la destilación de una cabeza MTP (multi-token prediction) con objetivo de divergencia KL, entrenada durante 492 pasos contra las generaciones del propio Ornith-1.5-9B. La destilación por KL es crucial: la aceptación en MTP es un muestreo de rechazo contra el modelo objetivo, por lo que recompensa la coincidencia de distribución y no el ajuste de tokens. Una destilación con entropía cruzada dura (hard-CE) empeora el rendimiento (0.763 → 0.721 en Ornith-1.0) por sobre-ajustar el argmax. La cabeza destilada se integra en el tronco del modelo (formato "bundled") o se ofrece como archivo independiente para emparejar con un GGUF base.

## Capacidades

- Generación de texto con decodificación especulativa multi-token (MTP) sin modelo draft externo, mediante `--spec-type draft-mtp`.
- Entrada de imagen (modelo vision, image-text-to-text) con proyecto de visión mmproj incluido.
- Razonamiento y generación de código (el modelo base es de la familia Qwen3.5-9B).
- Capacidad de auto-mejora: el modelo puede proponer tareas, generar andamiajes y producir soluciones para aprendizaje por refuerzo (característica del modelo base, no del GGUF).
- Compatibilidad con llama.cpp y llama-server, incluyendo `--flash-attn`, `--jinja` y control de profundidad de borrador (`--spec-draft-n-max`).
- Modo de borrador independiente: el head MTP puede usarse como modelo draft con cualquier GGUF base de Ornith-1.5-9B.

## Casos de uso

- Despliegue de inferencia local en GPU consumer de 6 GB: con la cuantización IQ4_XS (5,45 GB) el modelo cabe en tarjetas de 6 GB y ofrece un incremento de velocidad por MTP de 1,21x, superando al Q4_K_M en tamaño, velocidad y ganancia especulativa.
- Servidor de chat multimodal con llama.cpp: usar `llama-server` con el archivo GGUF y el mmproj para entrada de imágenes, activando `--spec-type draft-mtp` para acelerar la generación de respuestas en aplicaciones de asistente conversacional.
- Generación de código asistida: el modelo base híbrido Qwen3.5-9B es adecuado para completar código; la cabeza MTP reduce la latencia de generación en flujos de trabajo de programación colaborativa.
- Experimentación con decodificación especulativa: la compilación permite medir la tasa de aceptación del head MTP a distintas profundidades (`--spec-draft-n-max` de 2 a 4) y comparar el rendimiento entre cuantizaciones, útil para investigación en técnicas de inferencia.
- Aplicaciones de visión-lenguaje en entornos con recursos limitados: emparejar el modelo con `mmproj-Ornith-1.5-9B-BF16.gguf` para tareas de captioning o respuesta visual a preguntas con ventaja de velocidad MTP.
- Reentrenamiento o re-cuantización: el archivo BF16 (18,4 GB) sirve como master para generar nuevas cuantizaciones personalizadas sin perder calidad de referencia.
- Sistemas de auto-mejora de agentes: el modelo base está diseñado para proponer tareas y generar andamiajes, lo que lo hace útil para pipelines de auto-generación de datos de entrenamiento.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card se midieron en una RTX PRO 6000 Blackwell (sm120), con contexto 8192, flash-attention, decodificación greedy, mezcla de 6 prompts de código y general, `-n 200`, GPU silenciosa y flujo único (C=1).

### Q8_0, barrido de profundidad de draft

| Config | Decode tok/s | Aceptación | Speedup |
|---|---|---|---|
| Base (sin MTP) | 149,6 | — | 1,00x |
| MTP n-max 2 | 252,6 | 0,767 | 1,69x |
| **MTP n-max 3** | **264,5** | 0,663 | **1,77x** |
| MTP n-max 4 | 256,2 | 0,583 | 1,71x |

La model card indica que la profundidad óptima es `--spec-draft-n-max 3` para maximizar throughput, mientras que `2` maximiza la tasa de aceptación y `4` regresa el rendimiento. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada por cuantización**: NVFP4 (6,5 GB), Q8_0 (9,8 GB), Q6_K (7,6 GB), Q5_K_M (6,6 GB), Q4_K_M (5,8 GB), IQ4_XS (5,45 GB), IQ3_M (4,67 GB), IQ2_M (3,87 GB), BF16 (18,4 GB). El proyecto de visión mmproj ocupa 922 MB adicionales.
- **GPU recomendadas**: RTX PRO 6000 Blackwell (sm120) para el máximo rendimiento con NVFP4 (299 tok/s con MTP, 1,38x); tarjetas de 6 GB VRAM pueden usar IQ4_XS o IQ3_M.
- **Cabe en GPU consumer**: sí, en tarjetas de 6 GB (RTX 2060, 3050, 3060, etc.) con IQ4_XS o IQ3_M, y en tarjetas de 4 GB con IQ2_M aunque con menor calidad.
- **Opciones de despliegue**: llama.cpp (llama-server, llama-cli), compatible con `--flash-attn`, `--jinja` y `--spec-type draft-mtp`.
- **Latencia y throughput**: con Q8_0 y MTP n-max 3 se alcanzan 264,5 tok/s en RTX PRO 6000 Blackwell; con NVFP4, 299 tok/s. La ganancia relativa de MTP es mayor en Q8_0 (1,77x) que en cuantizaciones más bajas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MTP head | Licencia | Formato |
|---|---|---|---|---|---|
| **Ornith-1.5-9B-MTP-GGUF** (este) | 9B + head 456M | ≥32K | Destilada (KL) | MIT | GGUF |
| Ornith-1.0-9B-MTP-GGUF | 9B | ≥32K | Transferida de Qwen3.5-9B (aceptación 0,74–0,76) | MIT | GGUF |
| ornith-ai/Ornith-1.5-9B-GGUF | 9B | ≥32K | Sin MTP (0 de 760 tensores) | MIT | GGUF |
| Qwen3.5-9B (base) | 9B | ≥32K | No | Apache 2.0 | safetensors |

La diferencia clave es que Ornith-1.5-9B-MTP-GGUF incluye la cabeza MTP destilada, mientras que el GGUF oficial del modelo base no la incluye. La cabeza destilada supera a la transferida (aceptación 0,767 vs 0,636 a n-max 2), porque el bucle de RL de Ornith-1.5 desplazó los estados ocultos respecto a la base Qwen3.5.

## Limitaciones y advertencias

- **El head MTP standalone no es un modelo completo**: cargar `mtp-head/mtp-Ornith-1.5-9B-head-Q8_0.gguf` directamente en llama.cpp provocará un error. Solo se puede usar con `--model-draft` junto a un GGUF base.
- **La tasa de aceptación varía según la cuantización**: el head MTP está destilado sobre el modelo BF16; en cuantizaciones muy bajas (IQ2_M) la ganancia especulativa puede ser menor y la calidad puede degradarse, aunque el modelo sigue siendo coherente.
- **Riesgo de alucinación**: no se han publicado evaluaciones específicas de alucinación para este modelo; se recomienda validar respuestas en aplicaciones críticas.
- **Idiomas**: no se dispone de información sobre los idiomas soportados; se asume el multilingüismo de la familia Qwen3.5, pero no está confirmado.
- **Licencia MIT**: permite uso comercial, modificación y redistribución sin restricciones, pero el usuario debe asegurarse de que los pesos base y el modelo original cumplen la misma licencia (MIT).
- **La profundidad de borrador óptima es empírica**: `n-max 2` maximiza la aceptación, `n-max 3` el throughput, y `n-max 4` regresa el rendimiento. No hay regla universal; conviene medir en el hardware objetivo.

## Enlaces

- Modelo GGUF: https://huggingface.co/protoLabsAI/Ornith-1.5-9B-MTP-GGUF
- Modelo base (safetensors): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante GGUF sin MTP: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Versión anterior con head transferido (Ornith-1.0): https://huggingface.co/protoLabsAI/Ornith-1.0-9B-MTP-GGUF
- Web del proyecto Ornith AI: https://ornith.ai/
- Documento de Ornith-1.5 (self-improvement): https://ornith.ai/ornith_1_5.html
