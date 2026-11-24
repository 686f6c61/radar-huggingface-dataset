# nassimjp/Wowra-1.8B

## Resumen

Wowra-1.8B es un ajuste fino (fine-tuning) del modelo Tencent/Hunyuan-1.8B-Instruct, publicado por el usuario nassimjp en Hugging Face. Se trata de un modelo denso de tipo transformer con 1.791.080.448 parámetros reales (según los pesos en safetensors), entrenado con la librería Unsloth y TRL de Hugging Face, y distribuido en precisión FP16 (16 bits). El modelo base pertenece a la familia Hunyuan de Tencent, orientada a generación de texto conversacional.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, y la model card no aporta información sobre el dataset de ajuste, los hiperparámetros, el número de tokens de entrenamiento ni los objetivos concretos del fine-tuning. La única información técnica verificable procede de los metadatos del repositorio y de la propia model card, que se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento.

Por tanto, esta ficha documenta lo que se puede confirmar con rigor (arquitectura heredada, tamaño, licencia, formato de pesos) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluación de calidad, rendimiento o idoneidad para producción debe hacerse mediante pruebas propias, dado que no existen benchmarks ni documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo `hunyuan_v1_dense`, según tags del repo) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo publica pesos en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`, según la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16, 16 bits) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Tencent/Hunyuan-1.8B-Instruct, un transformer denso identificado en los tags del repositorio como `hunyuan_v1_dense`. No se dispone de información publicada sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (completa, lineal o híbrida), función de activación ni detalles del tokenizador más allá de lo que pueda inferirse del modelo base original.

Respecto al entrenamiento, la model card indica únicamente que el ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, y que el resultado se subió en FP16. No se especifica el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, si hubo RLHF, DPO, SFT supervisado u otra técnica, ni los hiperparámetros empleados (learning rate, batch size, épocas, LoRA vs. full fine-tuning). Tampoco se documenta ninguna innovación técnica propia más allá del uso de Unsloth para acelerar el entrenamiento. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones, en la medida en que el ajuste fino no haya degradado las capacidades del base.
- Soporte de tool calling / function calling: no confirmado en la documentación del fine-tuning; depende de lo que conserve del modelo base Hunyuan-1.8B-Instruct.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidades especiales (modo thinking, visión, audio): no documentadas. El modelo base es de texto; no hay indicios de modalidades adicionales.
- No se documenta ningún comportamiento específico introducido por el fine-tuning (estilo, dominio, tono o tarea concreta).

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el tamaño de 1,8 B parámetros permite desplegar el modelo en una sola GPU de consumo, lo que facilita iterar sobre prompts y flujos conversacionales antes de escalar a modelos mayores.
- Experimentación académica con ajuste fino: al estar construido sobre Hunyuan-1.8B-Instruct y publicarse en FP16, sirve como punto de partida para estudiar el efecto de técnicas como Unsloth o LoRA sobre un modelo base pequeño.
- Evaluación comparativa de fine-tunes comunitarios: útil para medir cuánto se degrada o mejora un modelo base tras un ajuste no documentado, siempre que se establezca una línea base con el modelo original.
- Generación de texto en entornos con recursos limitados: con 1,8 B parámetros en FP16 (aproximadamente 3,6 GB de pesos), cabe en GPUs de 8 GB o incluso en CPU con cuantización posterior, lo que permite desplegarlo en estaciones de trabajo modestas.
- Filtrado y clasificación de texto en inglés: tareas de etiquetado, resumen o reescritura donde no se requiere un modelo de gran escala y se prioriza el coste por inferencia.
- Base para pipelines de generación de texto con TGI o transformers: los tags `text-generation-inference` y `endpoints_compatible` indican compatibilidad con despliegues estándar de Hugging Face, lo que simplifica la integración en servicios existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan comparaciones con el modelo base ni con alternativas. No es posible, por tanto, presentar una tabla de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,6 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8-2,5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,5 GB para pesos (requiere cuantizar el modelo, ya que el repo solo publica FP16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100. Cabe holgadamente en cualquier GPU de consumo con 8 GB o más.
- Despliegue: compatible con `transformers`, `text-generation-inference` (TGI) y, previsiblemente, con llama.cpp u Ollama tras convertir los pesos a GGUF (no se proporcionan conversiones en el repo).
- Latencia y throughput: no disponibles. Al no haber benchmarks ni pruebas publicadas, no se pueden estimar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wowra-1.8B | 1,79 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning no documentado de Hunyuan-1.8B-Instruct |
| tencent/Hunyuan-1.8B-Instruct | ~1,8 B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) | Modelo original de Tencent; referencia obligada para evaluar el fine-tuning |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 | Hugging Face, Ollama, vLLM | Alternativa consolidada de tamaño similar con amplia adopción |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | Hugging Face, Ollama, vLLM | Alternativa de tamaño similar con licencia comunitaria y ecosistema amplio |

La comparación con Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct se ofrece como referencia de categoría (modelos densos de 1-2 B parámetros para instrucciones), no como evaluación de rendimiento relativo, ya que no existen benchmarks publicados de Wowra-1.8B.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste fino: se desconoce qué datos se usaron, si hubo filtrado, y por tanto qué sesgos o comportamientos específicos puede haber adquirido el modelo.
- Riesgo de alucinación: inherente a los modelos de 1,8 B parámetros; sin benchmarks ni evaluaciones, no se puede acotar su magnitud.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base Hunyuan-1.8B-Instruct y los datos de ajuste sean compatibles con dicha licencia, algo que la model card no aclara.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay retroalimentación de terceros, informes de errores ni casos de uso validados.
- El fine-tuning puede haber degradado capacidades del modelo base (instrucciones, tool calling, razonamiento); sin evaluación comparativa, se recomienda probar ambos modelos antes de elegir.
- No se publican conversiones cuantizadas (GGUF, AWQ, GPTQ), lo que obliga a generarlas manualmente si se quiere desplegar en hardware muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nassimjp/Wowra-1.8B
- Modelo base: https://huggingface.co/tencent/Hunyuan-1.8B-Instruct
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
