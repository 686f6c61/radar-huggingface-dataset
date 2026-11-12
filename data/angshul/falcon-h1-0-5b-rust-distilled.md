# Angshul/Falcon-H1-0.5B-Rust-Distilled

## Resumen

Falcon-H1-0.5B-Rust-Distilled es una adaptación del modelo Falcon-H1-0.5B-Instruct de TII (Technology Innovation Institute), publicada por el autor independiente Angshul. No se trata de un reentrenamiento completo, sino de una destilación a nivel de secuencia en la que únicamente se entrena una corrección de rango 16 sobre la cabeza de salida, manteniendo congelado el backbone preentrenado. El resultado conserva la arquitectura y las formas de parámetros originales del Falcon-H1 de 0,5 mil millones de parámetros.

El interés del modelo es doble. Por un lado, aplica una técnica de destilación poco habitual (corrección de bajo rango en la cabeza de salida, entrenada en Rust con Candle y CUDA) sobre un profesor de mayor tamaño, Falcon-H1-1.5B-Deep-Instruct. Por otro, se distribuye en un formato de checkpoint propietario (`f32pack`) pensado para un runtime de inferencia en Rust, lo que lo convierte en una pieza de interés para quienes experimentan con implementaciones alternativas a Transformers.

La relevancia práctica es limitada: el propio autor advierte que las mejoras medidas se refieren únicamente a la perplejidad sobre continuaciones generadas por el profesor en C4 inglés, y no a razonamiento general, seguimiento de instrucciones ni benchmarks downstream. Es, por tanto, un artefacto de investigación sobre destilación y tooling en Rust más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención con grouped-query attention (GQA) + capas de espacio de estados Mamba-2 (Falcon-H1) |
| Parametros totales | 0,5 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; el checkpoint publicado es float32 (`f32pack`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Falcon-LLM License (licencia `other` en Hugging Face) |
| Formato de pesos | Checkpoint propietario FH1W float32 (`.f32pack`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Falcon-H1, que combina capas de atención con GQA y capas de espacio de estados Mamba-2 en un diseño híbrido. El backbone es exactamente el de Falcon-H1-0.5B-Instruct, sin modificaciones: la destilación no altera la arquitectura ni las formas de los parámetros.

El proceso de destilación es a nivel de secuencia y con el backbone congelado. El profesor (Falcon-H1-1.5B-Deep-Instruct) genera continuaciones de texto a partir de prompts de C4 inglés; como los tokenizadores de profesor y alumno difieren, las continuaciones se retokenizan con el tokenizador del alumno. Sobre esas secuencias, el alumno se entrena con entropía cruzada autorregresiva enmascarada, aplicando una corrección entrenable de rango 16 únicamente a la cabeza de salida. El entrenamiento se ejecutó en Rust con Candle y CUDA sobre una GPU NVIDIA L4, con batch de 128, 97.706 tokens objetivo en la ejecución final (más 4.161 tokens de validación) y época seleccionada la 5 del adaptador V3. Tras el entrenamiento, la corrección se fusiona en los pesos originales de la cabeza de salida, de modo que el checkpoint publicado mantiene la arquitectura Falcon-H1-0.5B intacta.

## Capacidades

- Generación de texto autorregresiva en inglés, heredada del modelo base.
- Razonamiento y código: capacidades propias de Falcon-H1-0.5B-Instruct, no evaluadas ni modificadas por esta destilación.
- Tool calling / function calling: no documentado en la información proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado para esta variante.
- Multilingüismo: limitado a inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia mediante API HTTP en Rust (Candle + CUDA) que acepta IDs de token y expone endpoints de generación.

## Casos de uso

- Investigación sobre destilación a nivel de secuencia: sirve como referencia reproducible de cómo adaptar solo la cabeza de salida con una corrección de bajo rango y medir el efecto en perplejidad frente al modelo original.
- Desarrollo y validación de runtimes alternativos: el checkpoint `.f32pack` y la API en Rust permiten probar cargadores y kernels CUDA propios (incluida la ejecución fusionada de Mamba) sin depender de PyTorch.
- Experimentos de tooling en Rust para IA: útil para equipos que quieran integrar inferencia de modelos híbridos atención/Mamba-2 en servicios escritos en Rust.
- Evaluación comparativa de formatos de pesos: permite estudiar el coste y las limitaciones de un formato propietario float32 frente a safetensors o GGUF en términos de tamaño de repositorio (2,1 GB) y velocidad de carga.
- Docencia y divulgación técnica: ejemplo compacto (0,5B) de pipeline completo profesor-alumno con retokenización entre tokenizadores distintos.
- Pruebas de integración en pipelines HTTP: la API expone generación por IDs de token, adecuada para tests de extremo a extremo en entornos controlados.

## Benchmarks y rendimiento

Evaluación sobre predicción del siguiente token enmascarada con 4.161 tokens de validación de continuaciones generadas por el profesor (C4 inglés):

| Modelo | Perplejidad |
|---|---:|
| Falcon-H1-0.5B original | 3,3695 |
| Destilado V2 | 3,2312 |
| Destilado V3 (publicado) | 3,2182 |

Estos resultados miden únicamente la concordancia con las continuaciones del profesor en el conjunto de validación de C4. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,5B parámetros en float32 el peso de los pesos ronda los 2 GB, a lo que hay que sumar estados de activación y caché.
- GPU recomendadas: el autor documenta entrenamiento e inferencia en NVIDIA L4; cualquier GPU NVIDIA con soporte CUDA debería ser suficiente por el tamaño del modelo.
- GPU de consumo: previsiblemente cabe en GPUs consumer con 8 GB o más de VRAM, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: exclusivamente la API en Rust del repositorio del autor (`falcon-h1-api` con `--features cuda`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.f32pack` no es estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Falcon-H1-0.5B-Rust-Distilled | 0,5B | No disponible | Falcon-LLM License | `.f32pack` propietario | Solo cabeza de salida adaptada; requiere runtime Rust propio |
| Falcon-H1-0.5B-Instruct (TII) | 0,5B | No disponible | Falcon-LLM License | safetensors | Modelo base; compatible con el ecosistema Transformers |
| Falcon-H1-1.5B-Deep-Instruct (TII) | 1,5B | No disponible | Falcon-LLM License | safetensors | Profesor usado en la destilación; mayor tamaño y capacidades |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de 0,5B de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La adaptación se limita a una corrección de rango 16 en la cabeza de salida; el backbone es idéntico al del modelo base y no se ha reentrenado.
- La perplejidad reportada se mide sobre continuaciones generadas por el profesor, no sobre un benchmark estándar de lenguaje; no demuestra mejoras en razonamiento, seguimiento de instrucciones ni tareas downstream.
- El modelo está especializado con texto C4 en inglés; el soporte multilingüe no está documentado.
- El checkpoint `.f32pack` es un formato propietario y requiere el cargador compatible del repositorio Rust del autor; no es cargable directamente con Transformers, vLLM, llama.cpp ni Ollama.
- La API de inferencia acepta IDs de token, no texto: la tokenización debe hacerse con el tokenizador de Falcon-H1-0.5B-Instruct.
- Riesgo de sesgos y alucinaciones heredado del modelo base y de la distribución de C4; no se documentan evaluaciones de seguridad ni de sesgo.
- La licencia Falcon-LLM License impone condiciones específicas para uso comercial; debe revisarse antes de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Angshul/Falcon-H1-0.5B-Rust-Distilled
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-0.5B-Instruct
- Profesor de destilación: https://huggingface.co/tiiuae/Falcon-H1-1.5B-Deep-Instruct
- Implementación en Rust: https://github.com/AngshulMajumdar/Falcon-H1-Rust-Transformer-API
- Informe técnico de Falcon-H1: https://arxiv.org/abs/2507.22448
- Licencia Falcon-LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Dataset C4: https://huggingface.co/datasets/allenai/c4
