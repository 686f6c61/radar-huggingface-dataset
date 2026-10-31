# axteam/Qwen3.6-35B-A3B-AWQ-4bit

## Resumen

Qwen3.6-35B-A3B-AWQ-4bit es una cuantización AWQ INT4 (W4A16) del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario axteam en HuggingFace y orientada al despliegue eficiente con vLLM. El modelo original es un MoE multimodal (image-text-to-text) de la familia Qwen con arquitectura híbrida que combina atención lineal y atención completa, 256 expertos más un experto compartido y unos 3B de parámetros activos por token frente a los ~35B totales. Esta versión comprime los pesos a INT4 asimétrico con grupo de tamaño 32, reduciendo el repositorio a unos 24,1 GB.

Su relevancia reside en que permite servir un modelo de 35B con presupuesto de VRAM de un modelo mucho menor, manteniendo el soporte de entrada de imágenes y el modo de razonamiento (thinking). Sin embargo, el propio autor advierte de que este MoE ultra-espacio es sensible a la cuantización a 4 bits: la perplejidad empeora un 23,8 % respecto al original BF16 en sus mediciones internas, por lo que recomienda las variantes de 8 bits (FP8 o AWQ INT8) para producción. Es, en esencia, una build experimental de bajo consumo más que una opción recomendada para entornos críticos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), MoE con 256 expertos + experto compartido, multimodal (visión), cabeza MTP |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token (de 35B totales, MoE) |
| Longitud de contexto | No disponible (el ejemplo de despliegue usa --max-model-len 32768) |
| Tipos de cuantizacion | AWQ INT4 (W4A16), INT4 asimétrico, group size 32 (escala BF16 + zero-point INT4), activaciones BF16, formato compressed-tensors pack-quantized |
| Idiomas soportados | No disponible (el corpus de calibración mezcla inglés y coreano; el chat template es el del original) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

La arquitectura base combina bloques de atención lineal con bloques de atención completa, lo que reduce el coste de la KV-cache en secuencias largas. El feed-forward es un MoE con 256 expertos más un experto compartido, activando unos 3B de parámetros por token de los ~35B totales. Incluye además una torre de visión con proyector para entrada de imágenes (pipeline image-text-to-text) y una cabeza de multi-token prediction (MTP) que habilita decodificación especulativa. El modelo base fue entrenado por el equipo de Qwen; los datos de entrenamiento, número de tokens y etapas de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

La cuantización es post-training (PTQ) mediante AWQ, sin reentrenamiento: se usa un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) para proteger los canales de peso salientes antes del redondeo. Se mantienen en BF16 la torre de visión y el proyector, la cabeza MTP, todas las RMSNorm, los embeddings, el LM head, el router del MoE y las partes no lineales de la atención lineal (conv1d, A_log, dt_bias), lo que supone aproximadamente el 6 % de los parámetros. Tokenizer, chat template y generation_config son idénticos a los del original.

## Capacidades

- Generación de texto conversacional con modo thinking activado por defecto en el chat template (desactivable con enable_thinking: False).
- Comprensión multimodal: acepta imágenes como entrada (image-text-to-text) mediante mensajes de tipo image_url.
- Razonamiento multi-step gracias al modo thinking del chat template.
- Decodificación especulativa mediante la cabeza MTP (multi-token prediction) conservada en BF16.
- Atención híbrida (lineal + completa) para gestionar secuencias largas con menor coste de KV-cache.
- Eficiencia de inferencia: solo ~3B de parámetros activos por token pese a los ~35B totales.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada (depende de las capacidades del modelo base Qwen3.6-35B-A3B).

## Casos de uso

- Servir chatbots multimodales autoalojados: el servidor vLLM expone una API compatible con OpenAI en el puerto 8000, por lo que puede sustituir un endpoint comercial sin cambiar el código cliente.
- Descripción y análisis de imágenes en flujos de trabajo internos: la entrada de imágenes por URL permite integrarlo en pipelines de clasificación, etiquetado o extracción de información visual.
- Prototipado de agentes con razonamiento: el modo thinking por defecto permite evaluar cadenas de razonamiento multi-step antes de decidir una variante de mayor precisión.
- Despliegue en GPU única de gama alta: con ~24 GB de pesos y solo ~3B de parámetros activos, cabe en una RTX 4090 de 24 GB (ajustando contexto y KV-cache), algo inviable con el original BF16 de ~72 GB.
- Pruebas de carga y latencia con MoE: la activación esparsa de 3B ofrece alto throughput por token, útil para benchmarks de serving con vLLM.
- Servido solo-texto optimizado: con --limit-mm-per-prompt '{"image": 0, "video": 0}' se libera el presupuesto de memoria del encoder de visión cuando no se necesitan imágenes.
- Experimentación con cuantización: los datos de fidelidad publicados (perplejidad, acuerdo top-1) lo hacen útil como caso de estudio del impacto de AWQ INT4 en MoE ultra-esparsos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.). El autor sí publica métricas de fidelidad respecto al original BF16 (conjunto interno mixto inglés/coreano, 100 prompts, respuestas greedy):

| Metric | Este modelo (AWQ INT4) | Original BF16 |
|---|---|---|
| Perplejidad (menor = más fiel) | 1,6011 | 1,2934 (+23,8 % de degradación) |
| Acuerdo top-1 en siguiente token | 85,1 % | 98,0 % |

Estas métricas miden fidelidad al modelo base, no rendimiento absoluto en tareas.

## Requisitos de hardware

- Pesos: ~24,1 GB en disco (INT4). En VRAM, contar además la KV-cache y los componentes BF16 (visión, embeddings, MTP, ~6 % de parámetros).
- GPU recomendadas: una A100 40 GB o H100 permite servir cómodamente con contexto amplio; una RTX 4090 (24 GB) es viable solo con contexto reducido (el ejemplo usa --max-model-len 32768, que puede no caber en 24 GB según la carga) y posiblemente con KV-cache en FP8.
- KV-cache: se mantiene en BF16 por defecto; con --kv-cache-dtype fp8 se reduce aproximadamente a la mitad para contextos largos o lotes grandes.
- Cabe en GPU de consumo: marginalmente en una RTX 4090 de 24 GB con ajustes; más holgado en RTX 5090 (32 GB) o A6000/RTX 6000 Ada (48 GB).
- Despliegue: diseñado para vLLM (vllm serve, API OpenAI-compatible). No hay soporte documentado para llama.cpp, Ollama o TGI en la información disponible (el formato compressed-tensors no es GGUF).
- Latencia y throughput: no disponible como cifras concretas; con ~3B de parámetros activos por token se espera alta velocidad de decodificación, ayudada por la cabeza MTP si el runtime la aprovecha.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Cuantizacion | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|---|
| axteam/Qwen3.6-35B-A3B-AWQ-4bit | ~35,95B | ~3B | AWQ INT4 (W4A16) | Sí (visión) | Apache-2.0 | +23,8 % perplejidad vs BF16; el autor recomienda builds de 8 bits para producción |
| Qwen/Qwen3.6-35B-A3B (BF16) | ~35,95B | ~3B | BF16 | Sí (visión) | Apache-2.0 | Máxima fidelidad; ~72 GB de pesos, requiere multi-GPU |
| Builds FP8 / AWQ INT8 del mismo base | ~35,95B | ~3B | FP8 o INT8 | Sí (visión) | Apache-2.0 | Recomendadas por el autor para producción por menor degradación de calidad |

No hay datos comparativos de rendimiento con otros modelos de la categoría (p. ej. otros MoE de 30-40B) en la información disponible.

## Limitaciones y advertencias

- Sensibilidad a la cuantización: el autor advierte explícitamente de que este MoE ultra-espaso sufre con 4 bits (+23,8 % de perplejidad y solo 85,1 % de acuerdo top-1 frente al BF16). Para producción recomienda las builds de 8 bits (FP8 o AWQ INT8).
- Sesgo de calibración: el conjunto de calibración AWQ (256 muestras) tiene predominio de coreano, lo que puede afectar a la fidelidad en otros idiomas, incluido el castellano.
- Riesgo de alucinación: inherente a modelos de lenguaje generativos; la degradación por cuantización puede agravarla en tareas delicadas.
- Idiomas: el conjunto de idiomas soportados no está documentado en la ficha; el chat template y tokenizer son los del original Qwen, pero no hay garantías explícitas de rendimiento en español.
- Longitud de contexto: el valor máximo del modelo base no está disponible; los ejemplos limitan el serving a 32768 tokens.
- Licencia: Apache-2.0, sin restricciones para uso comercial; los derechos de pesos, tokenizer y chat template pertenecen al equipo de Qwen.
- Formato: compressed-tensors orientado a vLLM; no es GGUF, por lo que la compatibilidad con llama.cpp u Ollama no está documentada.
- Datos de descargas muy bajos (30) y sin validación comunitaria amplia: tratar como build experimental.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.6-35B-A3B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
