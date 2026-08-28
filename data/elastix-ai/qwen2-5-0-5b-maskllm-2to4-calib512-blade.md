# elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib512-blade

## Resumen

El modelo `elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib512-blade` es una versión comprimida del modelo de lenguaje `Qwen/Qwen2.5-0.5B`, desarrollada por el equipo de elastix-ai. La compresión se realiza mediante poda semi-estructurada con patrón 2:4 (de cada cuatro pesos consecutivos, dos se anulan) aplicada a la mayoría de las capas internas del transformer, manteniendo intactos los embeddings, la cabeza de salida y ciertos módulos específicos. El objetivo es reducir el coste de inferencia y el uso de memoria sin necesidad de cuantización, conservando la arquitectura original de 494 millones de parámetros.

Este modelo resulta relevante para entornos con recursos limitados (edge computing, prototipado rápido, despliegue en CPU) donde se prioriza la velocidad y el ahorro de memoria sobre la máxima calidad generativa. Al estar basado en Qwen2.5-0.5B, hereda las capacidades generales de generación de texto, aunque la poda introduce una pérdida de fidelidad medible mediante divergencia KL. La ausencia de licencia explícita y de documentación detallada sobre rendimiento obliga a evaluar su uso con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sin cuantizacion (pesos en fp16, bits=16, tipo gfp, groupsize=32) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura estándar de Qwen2.5-0.5B, un transformer decoder-only con normalización previa, atención multi-cabeza y MLP con activación SwiGLU. La compresión se realiza mediante el método "blade" de elastix-ai, que aplica poda semi-estructurada 2:4 a todas las capas que coinciden con el patrón `.*` (es decir, la práctica totalidad de los pesos lineales), excepto los embeddings (`.*embed_tokens$`), la cabeza de salida (`.*lm_head$`), la convolución 1D de la atención lineal (`.*linear_attn.conv1d$`) y el router del MLP (`.*mlp.router$`), que se mantienen sin podar.

La calibración se realizó con 512 muestras del conjunto de validación de `DKYoon/SlimPajama-6B`, con una longitud de secuencia de 2048 tokens y calibración simétrica desactivada. No se aplicó cuantización (aunque el esquema define bits=16 y tipo gfp, el campo `quantize` está en `false`), ni fine-tuning BEAM, ni conversión de expertos a lineales. El resultado es un modelo con la misma cantidad de parámetros que el original, pero con la mitad de pesos efectivos en las capas podadas, lo que permite aceleración en hardware compatible con sparsity 2:4 (p. ej., núcleos tensor de NVIDIA Ampere o posteriores).

## Capacidades

- Generación de texto general: al ser una compresión de Qwen2.5-0.5B, conserva las capacidades básicas de generación de lenguaje natural, aunque con posible degradación de calidad debido a la poda.
- Razonamiento y matemáticas: no hay datos específicos; se espera un rendimiento inferior al modelo original en tareas complejas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no confirmadas; el modelo base Qwen2.5-0.5B tiene soporte multilingüe, pero esta versión comprimida no documenta su comportamiento.
- Capacidades especiales (vision, audio, thinking mode): no aplicables, es un modelo de texto puro.

## Casos de uso

- Prototipado rápido de chatbots en entornos con poca memoria: al ser un modelo de 0.5B con poda 2:4, puede ejecutarse en CPU o GPU de gama baja, permitiendo iterar sobre flujos conversacionales sin requerir infraestructura potente.
- Generación de texto en dispositivos edge: su tamaño reducido (alrededor de 1 GB en fp16) lo hace apto para integración en aplicaciones móviles o sistemas embebidos donde el almacenamiento y la RAM son limitados.
- Preprocesamiento de texto y clasificación ligera: puede utilizarse para tareas de extracción de entidades, resumen corto o normalización de texto en pipelines donde la latencia es crítica.
- Evaluación de técnicas de compresión: sirve como banco de pruebas para comparar el impacto de la poda 2:4 frente al modelo original, útil para investigadores interesados en eficiencia de modelos.
- Generación de código en entornos de desarrollo sin GPU: aunque su capacidad de código es limitada, puede asistir en autocompletado simple o documentación breve cuando no se dispone de hardware dedicado.
- Filtrado o clasificación de contenido en tiempo real: su baja latencia en CPU permite aplicarlo en sistemas de moderación o análisis de sentimiento con alto volumen de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la divergencia KL entre el modelo comprimido y el original, evaluada en dos conjuntos de datos:

| Dataset | Avg KL | Total KL | Tokens |
|---|---|---|---|
| wikitext2 | 0.442397 | 2430.5272 | 5,494 |
| c4 | 0.416402 | 15345.2422 | 36,852 |

Estos valores indican una pérdida de fidelidad moderada en la distribución de salida, esperable tras una poda agresiva. No se dispone de comparativas con otros modelos comprimidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 494M parámetros en fp16, lo que supone aproximadamente 1 GB de memoria para los pesos. Con overhead de activaciones y caché KV, se recomienda al menos 2 GB de VRAM en GPU o 4 GB de RAM en CPU.
- GPU recomendadas: cualquier GPU con soporte de sparsity 2:4 (NVIDIA Ampere o superior, p. ej., RTX 3090, A100, H100) puede aprovechar la aceleración; en GPUs sin soporte, la inferencia funciona igual pero sin ganancia de velocidad.
- En consumer GPU: sí, cabe en tarjetas con 4 GB de VRAM o más (RTX 3050, RTX 3060, etc.) y también en CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, puede servirse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte al formato de pesos (safetensors). Para sparsity 2:4, se requiere un runtime que soporte kernels sparse (p. ej., cuSPARSE o kernels personalizados).
- Latencia y throughput: no se han publicado datos; en CPU se espera una velocidad moderada (del orden de decenas de tokens por segundo), y en GPU con soporte sparse podría alcanzar varios cientos de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de tamaño similar. La única comparación directa posible es con el modelo base `Qwen/Qwen2.5-0.5B`, que tiene los mismos parámetros y contexto, pero sin poda. Se espera que el modelo comprimido tenga una calidad inferior, aunque con menor coste computacional. Otras alternativas como TinyLlama-1.1B o SmolLM-360M no son directamente comparables por diferencias de tamaño y arquitectura, y no hay benchmarks compartidos.

## Limitaciones y advertencias

- La poda 2:4 introduce una pérdida de calidad medible (divergencia KL de ~0.42 en wikitext2 y c4), que puede manifestarse en incoherencias o errores en tareas complejas.
- No se especifica la licencia de uso, por lo que su utilización en aplicaciones comerciales conlleva un riesgo legal no resuelto.
- No hay información sobre sesgos o comportamientos tóxicos; al ser una compresión de un modelo preentrenado, puede heredar sesgos del corpus original sin mitigación adicional.
- La longitud de contexto no está documentada para esta versión comprimida; aunque el modelo base soporta hasta 32K tokens, la poda podría afectar a la atención en secuencias largas.
- El repositorio no incluye ejemplos de uso, scripts de inferencia ni documentación sobre cómo cargar el modelo correctamente con sparsity, lo que puede dificultar su integración en producción.
- No se han publicado resultados de benchmarks estándar, por lo que es difícil evaluar su rendimiento real frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib512-blade
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
