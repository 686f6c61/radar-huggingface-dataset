# axteam/Qwen3.5-4B-NVFP4

## Resumen

axteam/Qwen3.5-4B-NVFP4 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario axteam. Se trata de un derivado PTQ (post-training quantization) en formato NVFP4 con pesos y activaciones en FP4 (W4A4), empaquetado con `compressed-tensors` (`nvfp4-pack-quantized`) y pensado específicamente para servir el modelo con vLLM sobre hardware Blackwell con tensor cores FP4. El modelo base es un transformer híbrido (atención lineal tipo GatedDeltaNet/SSM combinada con atención completa), denso, con torre de visión y una cabeza MTP (multi-token prediction); el checkpoint cuantizado declara 4.539.265.536 parámetros y ~5,3 GB en disco (5,7 GB de repositorio).

La relevancia de esta ficha es doble: por un lado, demuestra el estado del arte en cuantización FP4 nativa para servir modelos de 4B con visión en GPUs de centro de datos; por otro, sirve como caso de estudio de los compromisos de calidad que introduce una cuantización W4A4 agresiva. El autor publica métricas de fidelidad frente al original en BF16: perplejidad 1,7157 frente a 1,5703 (+9,3 %) y una tasa de coincidencia top-1 del 88,1 % (frente al 99,2 % de auto-coincidencia del BF16). No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

La estrategia de cuantización es conservadora en las partes sensibles: la torre de visión y su proyector, la cabeza MTP, todas las RMSNorm, los embeddings, el LM head y la ruta completa de atención lineal (`linear_attn.*`, pesos del SSM) se mantienen en BF16, porque FP4 resulta demasiado grueso para esos pesos. Solo las capas lineales del transformer se cuantizan a FP4, con grupo de 16, escala FP8 E4M3 y escala global FP32 por tensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal (GatedDeltaNet/SSM) + atención completa; denso; multimodal (torre de visión) con cabeza MTP |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos FP4 E2M1, grupo 16, escala FP8 E4M3 + escala global FP32 por tensor; activaciones FP4). Partes en BF16: visión, proyector, MTP, RMSNorm, embeddings, LM head y toda la ruta `linear_attn.*`. Otras cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | No disponibles en los metadatos; el corpus de calibracion es una mezcla con predominio de coreano (256 muestras) |
| Licencia | Apache-2.0 (derivado de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`); ~5,3 GB en disco, 5,7 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que intercala capas de atención lineal (mecanismo tipo GatedDeltaNet, asimilable a una ruta SSM) con capas de atención completa, lo que reduce el coste de memoria de la caché KV en contextos largos sin renunciar a la recuperación exacta de la atención clásica. Es un modelo denso, no MoE, con torre de visión para entrada image-text-to-text y una cabeza de predicción multi-token (MTP) orientada a decodificación especulativa o a objetivos auxiliares de entrenamiento. El checkpoint cuantizado conserva el tokenizador, la `chat_template` y el `generation_config` originales; el `config.json` es el del modelo base más un bloque `quantization_config`.

No se ha realizado reentrenamiento: es cuantización post-entrenamiento (PTQ). El autor menciona el uso de un pequeño conjunto de calibración (256 muestras, corpus mixto con predominio de coreano, inglés y coreano en la evaluación) para proteger canales de peso salientes antes del redondeo; la model card cita AWQ como referencia metodológica, aunque la explicación no detalla el algoritmo exacto de escalado. La innovación técnica principal del artefacto no está en el entrenamiento sino en la receta de cuantización: dejar en BF16 la ruta SSM completa, las normas y las cabezas evita la degradación típica de FP4 en estados recurrentes, a costa de un ahorro de memoria algo menor que un W4A4 uniforme.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica al modelo original.
- Comprensión de imagen y texto combinados (pipeline `image-text-to-text`): descripción de imágenes, lectura de documentos y extracción de información visual.
- Razonamiento y matemáticas: capacidades heredadas del modelo base, no verificadas en benchmarks en la información disponible.
- Generación de código: heredada del modelo base; sin datos de HumanEval ni similares publicados para este checkpoint.
- Capacidad multimodal con la torre de visión intacta en BF16, por lo que la calidad visual debería degradarse menos que las capas de lenguaje cuantizadas.
- Cabeza MTP conservada en BF16, lo que permite mantener esquemas de decodificación especulativa si el runtime los soporta.
- Multilingüismo: no declarado en los metadatos; el corpus de calibración con predominio de coreano sugiere cobertura al menos de coreano e inglés, pero no hay evaluación por idioma.
- Soporte de tool calling y agentes: no confirmado explícitamente en la información disponible para este checkpoint.

## Casos de uso

- Extracción de datos de documentos escaneados: el modelo recibe la imagen de una factura o albarán y devuelve campos estructurados. La torre de visión en BF16 preserva la calidad de reconocimiento, y el tamaño de ~5,3 GB permite desplegarlo en una sola GPU Blackwell.
- Atención al cliente con entrada multimodal: el usuario adjunta una captura de pantalla de un error y el modelo responde con instrucciones. La ventana de contexto debe consultarse en el modelo base, ya que no está documentada aquí.
- Servicio de alto rendimiento en vLLM: `vllm serve axteam/Qwen3.5-4B-NVFP4` con muestreo recomendado `temperature=0.7, top_p=0.8, top_k=20`; adecuado cuando el coste por token y la ocupación de VRAM son la restricción principal.
- Procesamiento por lotes de imágenes en pipelines de datos: clasificación y descripción de catálogos de producto o moderación de imágenes, donde el throughput agregado importa más que la fidelidad absoluta token a token.
- Despliegue en el borde con aceleradores Blackwell: el repositorio thomas-hiddenpeak/qwen35-thor documenta un motor de inferencia C++/CUDA con soporte BF16/NVFP4 para la familia Qwen3.5 sobre Jetson AGX Thor (SM110a), lo que abre la puerta a servir esta cuantización en dispositivos embebidos.
- Base para evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la pérdida real (+9,3 % de perplejidad) de un esquema W4A4 frente a BF16 o frente a alternativas W4A16 en la misma familia.

## Benchmarks y rendimiento

Métricas de fidelidad publicadas por el autor frente al original en BF16. Conjunto interno mixto inglés/coreano de 100 prompts, respuestas greedy del BF16 puntuadas bajo cada build con el mismo harness.

| Metrica | Este modelo (NVFP4) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor = mejor) | 1,7157 | 1,5703 | +9,3 % |
| Coincidencia top-1 con la respuesta BF16 | 88,1 % | 99,2 % | -11,1 puntos |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible. Las cifras anteriores miden fidelidad respecto al modelo base, no calidad absoluta.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos ~5,3 GB; hay que sumar caché KV, buffers de activación y los tensores BF16 no cuantizados (visión, MTP, embeddings, LM head, ruta SSM). Presupuesto razonable: 8-16 GB de VRAM según longitud de contexto y batch.
- GPU recomendadas: NVIDIA Blackwell con tensor cores FP4, principalmente B200/GB200 para velocidad completa. El formato es "Blackwell-only" según el autor.
- Compatibilidad con consumer GPU: no confirmada en la información disponible. Las RTX 50 (SM120) son Blackwell, pero el autor no certifica su funcionamiento; Jetson AGX Thor (SM110a) aparece soportado por un motor de inferencia de terceros.
- Despliegue: vLLM es la vía documentada (`vllm serve axteam/Qwen3.5-4B-NVFP4`). llama.cpp, Ollama y TGI no están mencionados para este formato NVFP4 en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que se necesita hardware FP4 para alcanzar la velocidad "de verdad"; para priorizar calidad recomienda una variante NVFP4A16 (no incluida en esta ficha).
- Alternativa en hardware no Blackwell: usar el modelo base Qwen/Qwen3.5-4B en BF16 o una cuantización de otro formato, no disponible en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-4B-NVFP4 (este) | ~4,54 B | No disponible | NVFP4 W4A4, `compressed-tensors`; vision/SSM/norms en BF16 | Apache-2.0 | HuggingFace, vLLM; calibracion 256 muestras mixtas con predominio coreano |
| AxionML/Qwen3.5-4B-NVFP4 | ~4 B (declarados) | No disponible | NVFP4 via NVIDIA TensorRT Model Optimizer | No disponible en la informacion | HuggingFace; orientado a servir |
| Qwen/Qwen3.5-4B (original BF16) | ~4,5 B | No disponible | Sin cuantizar (BF16) | Apache-2.0 | HuggingFace; referencia de calidad |

No se dispone de datos de benchmarks de tarea para ninguno de los tres, por lo que la comparación se limita a formato, licencia y disponibilidad. La diferencia práctica entre las dos cuantizaciones NVFP4 encontradas está en la herramienta de cuantización (receta propia con `compressed-tensors` frente a TensorRT Model Optimizer) y en la política de capas mantenidas en BF16, que este modelo detalla explícitamente.

## Limitaciones y advertencias

- Degradación medible: +9,3 % de perplejidad y 88,1 % de coincidencia top-1 frente al BF16. En tareas de razonamiento o código de varios pasos el efecto puede amplificarse por acumulación de errores.
- Dependencia de hardware: el formato NVFP4 requiere Blackwell. Sin tensor cores FP4, el rendimiento puede ser peor que una cuantización W4A16 convencional.
- La cuantización se aplicó solo a capas lineales del transformer; la ruta SSM, normas y cabezas quedan en BF16, lo que reduce el ahorro de memoria respecto a una cuantización uniforme.
- Sesgos: no documentados por el autor. Al ser un derivado del modelo base, hereda los sesgos de Qwen3.5-4B, no evaluados aquí.
- Riesgo de alucinación: no evaluado en esta información. La cuantización puede aumentar la fluidez incorrecta en dominios poco representados.
- Cobertura idiomática incierta: los metadatos no declaran idiomas y el corpus de calibración es 256 muestras con predominio de coreano; el rendimiento en castellano no está verificado.
- Contexto máximo no documentado: no se puede planificar un despliegue de contexto largo sin consultar la model card del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos, tokenizador y plantilla de chat originales pertenecen al equipo de Qwen; conviene conservar los avisos de atribución.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (29 de octubre de 2026). No hay validación independiente de las métricas declaradas.
- No hay confirmación de soporte de tool calling ni de modo thinking en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-4B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Cuantización alternativa NVFP4 (AxionML): https://huggingface.co/AxionML/Qwen3.5-4B-NVFP4
- README de la alternativa AxionML: https://huggingface.co/AxionML/Qwen3.5-4B-NVFP4/blob/main/README.md
- Ficha en Inferix de la alternativa AxionML: https://inferix.co/models/AxionML/Qwen3.5-4B-NVFP4
- Qwen3.5 4B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-4b/
- Motor de inferencia NVFP4 para la familia Qwen3.5 en Jetson Thor: https://github.com/thomas-hiddenpeak/qwen35-thor
