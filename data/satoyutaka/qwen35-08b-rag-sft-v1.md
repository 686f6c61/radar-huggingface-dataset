# satoyutaka/qwen35-08b-rag-sft-v1

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje y visión de tipo causal con codificador visual, desarrollado por el equipo Qwen de Alibaba. Se trata de la variante más pequeña de la familia Qwen3.5, con 873.438.784 parámetros reales (0,8B nominales), y está diseñado para prototipado, ajuste fino específico de tareas y desarrollo e investigación. Su relevancia radica en que integra una arquitectura híbrida eficiente (Gated DeltaNet combinado con atención con compuertas) y fusión temprana multimodal, manteniendo un contexto nativo de 262.144 tokens.

La ficha que nos ocupa, `satoyutaka/qwen35-08b-rag-sft-v1`, es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B-Base`, orientado presumiblemente a tareas de generación aumentada por recuperación (RAG), según indica su nombre. No obstante, la model card publicada no documenta detalles del proceso de ajuste, los datos utilizados ni los hiperparámetros empleados.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors compatible con transformers, vLLM, SGLang y KTransformers, y con un tamaño de repositorio de 1,8 GB. Al no contar con descargas ni valoraciones en el momento de la consulta, se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 (0,8B nominales) |
| Parametros activos | no disponible (no se documenta configuración MoE en esta variante) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible en la ficha del ajuste; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de Gated DeltaNet (atención lineal con 16 cabezas para V y 16 para QK, dimensión de cabeza 128) y capas de Gated Attention (8 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones), organizadas en un layout de 6 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). Cuenta con 24 capas, dimensión oculta de 1024, FFN con dimensión intermedia de 3584 y embeddings de tokens de 248.320 (con padding), atados a la salida LM. El modelo se entrenó con multi-token prediction (MTP) en varios pasos.

El modelo base Qwen3.5 fue preentrenado con fusión temprana sobre tokens multimodales y postentrenado con escalado de aprendizaje por refuerzo en entornos multiagente. La ficha `qwen35-08b-rag-sft-v1` es un ajuste fino supervisado sobre la variante Base, pero no se dispone de información sobre el conjunto de datos de ajuste, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones específicas introducidas por este ajuste.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking (los benchmarks publicados corresponden a este modo).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador visual integrado.
- Razonamiento matemático y de sentido común evaluado en MMLU-Pro, MMLU-Redux y C-Eval.
- Capacidades multilingües heredadas del modelo base (201 idiomas y dialectos declarados por Qwen, aunque no verificadas para este ajuste).
- Soporte de tool calling y function calling: no documentado explícitamente en la ficha del ajuste.
- Soporte de agentes y razonamiento multi-paso: el modelo base lo declara, pero no se detalla para este ajuste.
- Modo thinking: la model card solo reporta resultados en modo non-thinking; no se confirma soporte de modo thinking en esta variante.
- Ajuste orientado a RAG según el nombre del repositorio, sin documentación adicional sobre el comportamiento resultante.

## Casos de uso

- Generación aumentada por recuperación (RAG) en prototipos: el ajuste SFT sugiere especialización en la integración de contexto recuperado; su contexto de 262.144 tokens permite incorporar múltiples documentos largos en una sola ventana sin truncamiento.
- Asistentes documentales multimodales: al aceptar entrada imagen-texto, puede procesar capturas, diagramas o páginas escaneadas junto con consultas textuales, útil en herramientas internas de extracción de información.
- Prototipado rápido en entornos con recursos limitados: con 0,8B parámetros y 1,8 GB de pesos en safetensors, es viable ejecutarlo en una única GPU de gama media o incluso en CPU para pruebas de concepto.
- Ajuste fino específico de dominio: el modelo base está pensado para task-specific fine-tuning; este checkpoint sirve como punto de partida para especializaciones posteriores en dominios concretos.
- Investigación en arquitecturas híbridas: la combinación de Gated DeltaNet y Gated Attention permite estudiar el comportamiento de atención lineal frente a atención completa en tareas de recuperación de información.
- Evaluación comparativa de ajustes SFT: al ser un ajuste sobre un base conocido, permite medir el impacto del SFT en tareas RAG frente al modelo original.
- Despliegue en pipelines de CI/CD para validación de respuestas: su reducido tamaño facilita integrarlo como componente de verificación en flujos automatizados, siempre que se valide su calidad previamente.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden al modelo base Qwen3.5-0.8B en modo non-thinking, según la model card de Qwen. No se han publicado resultados específicos del ajuste `qwen35-08b-rag-sft-v1`.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado resultados de benchmarks del ajuste en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): aproximadamente 1,8-2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM con cuantización de 8 bits: alrededor de 1 GB para pesos; con 4 bits, en torno a 0,5 GB, aunque no se distribuyen versiones GGUF oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para inferencia cómoda; A100 o H100 no son necesarias por tamaño, pero pueden emplearse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en todas las RTX con 8 GB o más; también es viable en CPU para pruebas, aunque con latencia mayor.
- Opciones de despliegue: transformers (nativo), vLLM, SGLang y KTransformers según la model card del base; llama.cpp y Ollama requerirían conversión a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-sft-v1 | 0,8B | 262.144 | Apache 2.0 | Sí (image-text-to-text) | Hugging Face |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | 262.144 | Apache 2.0 | Sí | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible en la información | Apache 2.0 (según familia Qwen3) | No | Hugging Face |
| Qwen3.5-2B | 2B | no disponible en la información | Apache 2.0 | Sí | Hugging Face |

El ajuste comparte arquitectura y contexto con el base, por lo que su principal diferencia es el SFT orientado a RAG, sin datos públicos que permitan cuantificar la mejora. Frente a Qwen3-1.7B, ofrece menor número de parámetros pero contexto mucho mayor y capacidades multimodales; frente a Qwen3.5-2B, es más pequeño pero con menor rendimiento en los benchmarks del base (29,7 vs 55,3 en MMLU-Pro).

## Limitaciones y advertencias

- Rendimiento limitado por tamaño: con 0,8B parámetros, los resultados del base en MMLU-Pro (29,7) y C-Eval (46,4) son notablemente inferiores a modelos de 2B o 4B; no es adecuado para tareas de razonamiento complejo sin validación.
- Sin datos de evaluación del ajuste: no se han publicado benchmarks, métricas de RAG ni comparaciones con el base, por lo que se desconoce si el SFT mejora o degrada el rendimiento original.
- Riesgo de alucinación: inherente a modelos de este tamaño, especialmente en tareas de recuperación donde puede generar contenido no respaldado por el contexto.
- Idiomas no verificados: aunque el base declara 201 idiomas, la ficha del ajuste no especifica qué idiomas mantiene tras el SFT; el castellano no está confirmado.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base, no auditados en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del base Qwen3.5-0.8B enlazada en la model card.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Contexto largo: aunque el modelo soporta 262.144 tokens, el rendimiento en ventanas muy largas no está verificado para este ajuste y puede degradarse.
- Formato único: solo safetensors; no hay GGUF ni cuantizaciones listas para llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face del ajuste: https://huggingface.co/satoyutaka/qwen35-08b-rag-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
