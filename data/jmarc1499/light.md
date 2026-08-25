# jmarc1499/light

## Resumen

Light es un mini-LLM entrenado desde cero por el desarrollador jmarc1499, publicado bajo licencia MIT. Con apenas 1.196.672 parámetros (1,2 millones), se trata de un modelo de carácter eminentemente educativo y de investigación, pensado para demostrar el proceso completo de entrenamiento de un transformer decoder-only con recursos mínimos. Su arquitectura incorpora RoPE, RMSNorm y SwiGLU, tres componentes habituales en modelos modernos, pero con un tamaño de contexto de solo 192 tokens y 4 capas de 128 dimensiones.

El modelo fue entrenado con el proyecto de código abierto light (disponible en GitHub) y su principal propósito es servir como ejemplo didáctico de cómo construir y entrenar un modelo de lenguaje desde cero, no como una herramienta de producción. El autor indica explícitamente que el modelo imita el estilo de su corpus y que no es capaz de conversar ni responder preguntas de forma fiable.

La relevancia de este modelo no radica en su capacidad práctica, sino en su valor como referencia para desarrolladores que quieran entender los fundamentos de los LLM, el proceso de entrenamiento y la implementación de arquitecturas modernas en un tamaño manejable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE + RMSNorm + SwiGLU) |
| Parámetros totales | 1.196.672 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | es, en |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo no indica formato, probablemente .ckpt de PyTorch) |

## Arquitectura y entrenamiento

Light es un transformer decoder-only implementado desde cero, con 4 capas de 128 dimensiones de representación, atención con posiciones rotatorias (RoPE), normalización RMSNorm y función de activación SwiGLU. El tokenizador es un byte-level BPE con pre-tokenización por palabras, lo que permite manejar vocabularios abiertos sin necesidad de un vocabulario predefinido.

El entrenamiento se realizó con el proyecto light (github.com/jmarc9901/light), pero no se han publicado detalles sobre el corpus, número de tokens de entrenamiento, o si se aplicaron técnicas de RLHF o DPO. El autor indica que el modelo imita el estilo de su corpus de entrenamiento, lo que sugiere que es un dataset de texto general en español e inglés. No hay información sobre el número de pasos, el optimizador o la estrategia de aprendizaje.

## Capacidades

- Generación de texto: el modelo puede generar secuencias de texto a partir de un prompt, con parámetros de temperatura, top-p y penalización de repetición.
- Imitación de estilo: dado su entrenamiento, es capaz de imitar el estilo del corpus, pero no de mantener conversaciones coherentes.
- Multilingüe: soporta español e inglés, aunque su pequeño tamaño limita la calidad en ambos idiomas.
- No tiene capacidad de tool calling, function calling, razonamiento multi-paso, visión, audio, ni modo de pensamiento.
- No es adecuado para tareas de respuesta a preguntas, resumen, traducción o codigo, dado su tamaño.

## Casos de uso

- Educación en aprendizaje profundo: sirve como ejemplo real de un modelo transformer entrenado desde cero, ideal para entender las arquitecturas modernas.
- Investigación en interpretabilidad: su pequeño tamaño permite analizar internamente capas y atención sin necesidad de hardware potente.
- Experimentación con técnicas de generación: permite probar distintos parámetros (temperatura, top-p, repetición) sobre un modelo real, sin coste de inferencia.
- Benchmarking de frameworks de entrenamiento: útil para validar pipelines de entrenamiento desde cero (como el proyecto light) en un entorno de desarrollo.
- Estudio de scaling laws: al ser un modelo muy pequeño, se puede usar para estudiar cómo varía la pérdida y la capacidad con el tamaño, aunque no es representativo de modelos grandes.
- Prototipado de tokenizadores: permite evaluar el comportamiento del tokenizador BPE byte-level en distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en FP32; el modelo es trivial de ejecutar en cualquier hardware moderno.
- GPU recomendadas: ninguna específica; puede ejecutarse en CPU o en cualquier GPU, incluso integradas.
- Cabe en consumer GPU: sí, y también en CPU sin problemas.
- Opciones de despliegue: no se publican integraciones con vLLM, llama.cpp, Ollama o TGI. Se puede ejecutar con el código de ejemplo proporcionado en la model card, usando PyTorch en local.
- Latencia y throughput: no disponible, pero dado el tamaño, la generación de 200 tokens debería ser casi instantánea en CPU.

## Comparativa con modelos similares

No hay una comparativa directa publicada. A modo de contexto, los modelos más pequeños habituales en la comunidad son GPT-2 (124M), TinyStories (33M) o modelos de 1M como este, pero no hay datos de rendimiento comparables. Se recomienda no usar este modelo en producción por su tamaño y falta de benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Light (jmarc1499) | 1,2 M | 192 | MIT | educativo |
| GPT-2 small | 124 M | 1024 | MIT | generación de texto |
| TinyStories | 33 M | 256 | MIT | educativo |

## Limitaciones y advertencias

- Modelo de aprendizaje: imita el estilo del corpus, no conversa ni responde preguntas de forma coherente.
- Riesgo de alucinación: al ser pequeño, genera texto plausible pero sin base factual; no es fiable para información real.
- Limitación de contexto: solo 192 tokens, insuficiente para tareas que requieran contexto largo.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo no es útil en producción.
- No hay garantías de seguridad: no se han realizado evaluaciones de sesgos ni de alucinaciones.
- No se publican pesos en formato estándar (safetensors, GGUF), lo que dificulta su uso con frameworks estándar.

## Enlaces

- HuggingFace: https://huggingface.co/jmarc1499/light
- Repositorio del proyecto: https://github.com/jmarc9901/light

Nota: no hay otros enlaces (papers, blogs, demos) disponibles en la información proporcionada.</think>## Resumen

Light es un mini-LLM entrenado desde cero por el desarrollador jmarc1499, publicado bajo el proyecto de código abierto homónimo en GitHub. Con 1.196.672 parámetros, se trata de un modelo de carácter eminentemente didáctico y de investigación, pensado para demostrar el proceso completo de entrenamiento de un transformer decoder-only con recursos propios. Su arquitectura incorpora RoPE, RMSNorm y SwiGLU, elementos habituales en modelos modernos, pero con un tamaño de 4 capas y 128 dimensiones, y una ventana de contexto de solo 192 tokens.

El autor indica explícitamente que el modelo imita el estilo de su corpus de entrenamiento y que no es capaz de conversar ni responder preguntas de forma coherente. Su relevancia no radica en su capacidad de producción, sino en su utilidad como referencia didáctica para desarrolladores e investigadores que quieren entender los internos de los modelos de lenguaje, el entrenamiento desde cero y la implementación de tokenizadores BPE. El repositorio no reporta descargas ni uso activo, lo que refuerza su carácter de proyecto de aprendizaje.

La licencia MIT permite uso comercial y modificación, aunque el modelo no es adecuado para tareas reales de producción por su tamaño y limitaciones. El idioma principal es español e inglés, y se distribuye a través de Hugging Face con un checkpoint de PyTorch y un tokenizador BPE byte-level.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE + RMSNorm + SwiGLU) |
| Parámetros totales | 1.196.672 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | es, en |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoint de PyTorch, probablemente .ckpt) |

## Arquitectura y entrenamiento

Light es un transformer decoder-only implementado desde cero, con 4 capas de 128 dimensiones, atención con posiciones rotinas (RoPE), normalización RMSNorm y función de activación SwiGLU. El tokenizador es un byte-level BPE con pre-tokenización por palabras, lo que permite manejar vocabularios abiertos sin necesidad de un vocabulario predefinido. El modelo se entrenó con el proyecto light (github.com/jmarc9901/light), pero no se han publicado detalles sobre el corpus de entrenamiento, el número de tokens, el optimizador, ni si se usaron técnicas de RLHF o DPO. El autor indica que el modelo imita el estilo del corpus, lo que sugiere que el dataset es de texto general en español e inglés. No hay información sobre la duración del entrenamiento ni sobre innovaciones técnicas más allá de las capas mencionadas.

## Capacidades

- Generación de texto: el modelo puede generar secuencias a partir de un prompt, con parámetros de temperatura, top-p y penalización de repetición.
- Imitación de estilo: es capaz de replicar el estilo del corpus de entrenamiento, pero no mantiene conversaciones coherentes.
- Multilingüe: soporta español e inglés, aunque con calidad limitada por el tamaño.
- No tiene soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de pensamiento.
- No es adecuado para tareas de respuesta a preguntas, resumen, traducción o generación de código.

## Casos de uso

- Educación en deep learning: sirve como ejemplo práctico de entrenamiento de un transformer desde cero, ideal para entender arquitecturas, tokenización y generación.
- Investigación en interpretabilidad: su tamaño permite analizar las capas y la atención sin necesidad de hardware potente.
- Experimentación con técnicas de generación: permite probar parámetros como temperatura, top-p y penalización de repetición en un entorno de bajo coste.
- Benchmarking de frameworks de entrenamiento: útil para validar pipelines de entrenamiento desde cero, como el proyecto light.
- Estudio de scaling laws: al ser un modelo muy pequeño, se puede comparar con otros de mayor tamaño para observar cómo afecta la capacidad.
- Prototipado de tokenizadores: sirve para evaluar el comportamiento de un BPE byte-level en distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en FP32; es trivial para cualquier GPU moderna o incluso CPU.
- GPU recomendada: ninguna específica; se puede ejecutar en CPU, en GPUs integradas o en cualquier GPU dedicada.
- Cabe en consumer GPU: sí, y también en CPU sin problemas.
- Opciones de despliegue: no se publican integraciones con vLLM, llama.cpp, Ollama ni TGI. Se puede ejecutar con el código de Python proporcionado en la model card, usando PyTorch localmente.
- Latencia y throughput: no disponible, pero la generación de 200 tokens debería ser casi instantánea en cualquier hardware.

## Comparativa con modelos similares

No hay una comparativa directa publicada. A modo de contexto, los modelos de tamaño similar en la comunidad son GPT-2 (125 M), TinyStories (33 M) o modelos de 1 M, pero no hay datos de rendimiento comparables. Se recomienda no usar este modelo en producción por su tamaño y limitaciones.

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Light (jmarc1499) | 1,2 M | 192 | MIT | educativo |
| GPT-2 | 125 M | 1024 | MIT | educativo |
| TinyStories | 33 M | 1024 | MIT | educativo |

## Limitaciones y advertencias

- Modelo de aprendizaje: imita el estilo del corpus, pero no conversa ni responde preguntas de forma coherente.
- Riesgo de alucinación: al ser un modelo pequeño, genera texto sin base factual, por lo que no es fiable para información.
- Limitación de contexto: solo 192 tokens, insuficiente para tareas que requieran contexto largo.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo no es útil en producción.
- No se han realizado evaluaciones de sesgos ni de seguridad.
- No se publican pesos en formato estándar (safetensors, GGUF), lo que dificulta su uso con otros frameworks.

## Enlaces

- HuggingFace: https://huggingface.co/jmarc1499/light
- Repositorio del proyecto: https://github.com/jmarc9909/light

No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
