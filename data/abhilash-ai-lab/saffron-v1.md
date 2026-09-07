# Abhilash-AI-Lab/saffron-v1

## Resumen

Saffron-v1 es un modelo de lenguaje pequeño experimental de aproximadamente 100,09 millones de parámetros, desarrollado por Abhilash AI Research Lab, la iniciativa de investigación de Abhilash Construction Company. Se trata del primer modelo de este laboratorio y representa una prueba de concepto de un pipeline de entrenamiento completo, desde el tokenizador hasta el checkpoint final.

El modelo emplea una arquitectura Transformer personalizada con RoPE (Rotary Positional Embedding), RMSNorm, SwiGLU, atención de consultas agrupadas (grouped-query attention) y normalización QK. Incluye además un tokenizador BPE de nivel byte (byte-level BPE) propio con un vocabulario de 32000 tokens. El entrenamiento siguió un currículo de datos de lo simple a lo complejo (TinyStories, Wikipedia en inglés y FineWeb-Edu), con un presupuesto total de aproximadamente 1000 millones de tokens.

Su relevancia actual radica en ser un artefacto de investigación abierto que documenta el proceso completo de construcción de un modelo pequeño desde cero. No está ajustado por instrucciones, solo soporta inglés y su estado es experimental, por lo que no está destinado a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer personalizado (RoPE, RMSNorm, SwiGLU, GQA, QK-norm) |
| Parametros totales | 100,09M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

Saffron-v1 utiliza una arquitectura Transformer personalizada que incorpora varias técnicas modernas: posiciones rotatorias (RoPE), normalización RMSNorm, capas feed-forward con activación SwiGLU, atención de consultas agrupadas (grouped-query attention) y normalización de consultas y claves (QK-norm). El tokenizador es un BPE de nivel byte propio con un vocabulario de 32000 tokens.

El entrenamiento se realizó con un presupuesto de aproximadamente 1000 millones de tokens, distribuidos mediante un currículo de dificultad creciente: primero TinyStories, después Wikipedia en inglés y finalmente FineWeb-Edu. Los datos se procesaron en streaming con límites de cantidad por fuente. La mejor pérdida de validación alcanzada fue 3,4631, lo que equivale a una perplejidad de 31,92. No se aplicó RLHF ni DPO, y tampoco se realizó un ajuste por instrucciones.

## Capacidades

- Generación de texto en inglés a partir de un prompt, como modelo base sin ajuste por instrucciones.
- Continuación de texto autoregresiva con arquitectura Transformer estándar.
- Soporte de tokenizador BPE de nivel byte para vocabulario de 32000 tokens.
- Capacidad para procesar texto en inglés únicamente; no soporta otros idiomas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No incluye capacidades de visión ni audio.
- Al ser un modelo experimental, las salidas pueden ser incorrectas o incoherentes.

## Casos de uso

- Investigación de arquitecturas personalizadas: el modelo sirve como referencia para estudiar el efecto de RoPE, GQA y QK-norm en modelos de tamaño reducido, permitiendo comparar configuraciones sin necesidad de entrenar modelos grandes.
- Experimentos de curriculum learning: el pipeline de entrenamiento con datos ordenados de lo simple a lo complejo puede utilizarse como base para investigar estrategias de currículo en modelos pequeños.
- Desarrollo de tokenizadores BPE: el tokenizador de nivel byte con vocabulario de 32000 tokens puede analizarse y compararse con tokenizadores estándar como GPT-2 o Llama.
- Educación sobre entrenamiento de LLMs: al ser un proyecto pequeño y abierto, resulta adecuado para enseñar el proceso completo de entrenamiento de un modelo de lenguaje, desde la preparación de datos hasta la evaluación.
- Prototipado rápido de pipelines de inferencia: el checkpoint en formato PyTorch permite probar cargas de pesos e inferencia básica en entornos de desarrollo sin grandes requisitos de hardware.
- Comparativa de modelos pequeños: puede utilizarse como punto de partida para comparar el rendimiento de modelos de ~100M parámetros entrenados con diferentes datos y arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 400 MB en precisión fp32 y 200 MB en fp16/bf16, dado el tamaño de 100,09M parámetros.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU consumer, incluidas GTX 1060, RTX 2060, RTX 3060, etc.
- Opciones de despliegue: el repositorio oficial incluye un script de inferencia (`python -m src.sample`); no se proporcionan integraciones con vLLM, Ollama ni TGI, aunque el checkpoint podría adaptarse a llama.cpp si se convierte a formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saffron-v1 | 100,09M | no disponible | en | Apache-2.0 | PyTorch checkpoint |
| SmolLM-135M | 135M | 2048 | en | Apache-2.0 | safetensors, GGUF |
| GPT-2 Small | 124M | 1024 | en | MIT | PyTorch, TF, ONNX |
| Pythia-70M | 70M | 2048 | en | Apache-2.0 | PyTorch, safetensors |

Nota: SmolLM-135M y Pythia-70M son modelos entrenados con presupuestos de tokens mucho mayores (cientos de miles de millones frente a ~1B), por lo que cabe esperar que superen a Saffron-v1 en calidad de generación. GPT-2 Small es un modelo clásico de referencia con arquitectura Transformer estándar.

## Limitaciones y advertencias

- Modelo experimental y preliminar, resultado de una prueba de concepto de entrenamiento.
- No está ajustado por instrucciones (no instruction-tuned), por lo que no sigue comandos de forma fiable.
- No se ha realizado ajuste de seguridad (safety tuning); las salidas pueden contener contenido problemático.
- Solo soporta inglés; no maneja otros idiomas.
- Las salidas pueden ser factualmente incorrectas o incoherentes, tal como indica el propio autor.
- No se han publicado benchmarks ni evaluaciones comparativas.
- No se especifica la longitud de contexto en la información disponible.
- Solo se distribuye como checkpoint PyTorch sin cuantizaciones ni formatos optimizados como GGUF o safetensors.
- No está destinado a uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Abhilash-AI-Lab/saffron-v1
- GitHub: https://github.com/shishodiaabhilash/saffron-v1
- README en GitHub: https://github.com/shishodiaabhilash/saffron-v1/blob/main/README.md
