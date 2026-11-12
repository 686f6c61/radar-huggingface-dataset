# mrminjae/qwen3p6-35b-a3b-2p00bit-r101-lowbit

## Resumen

Qwen3.6-35B-A3B-2p00bit-r101-lowbit es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización agresiva del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados (routed experts) de la arquitectura MoE se comprimen a una media de 2,00 bits, mientras que el resto de pesos se mantienen en BF16. El resultado es un repositorio de 14,1 GB que reduce drásticamente el espacio ocupado respecto al modelo original en precisión completa.

El modelo hereda la arquitectura Mixture-of-Experts del Qwen3.6-35B-A3B, con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token (según la nomenclatura A3B del modelo base). La cuantización selectiva de los expertos enrutados busca preservar la calidad de las capas de atención y de los componentes compartidos en BF16, sacrificando precisión solo en las rutas expertas, que son las que dominan el cómputo y el tamaño en este tipo de arquitecturas.

La relevancia de este checkpoint es doble: por un lado, demuestra una técnica de compresión extrema (2 bits por peso en los expertos) aplicada a un MoE de gran escala; por otro, advierte explícitamente de que requiere un cargador específico y no funciona con transformers estándar, lo que lo convierte en material de investigación más que en un artefacto listo para producción. No se han publicado datos de benchmarks, licencia explícita ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.6-35B-A3B; expertos enrutados cuantizados a 2,00 bits, resto en BF16 |
| Parametros totales | 35 000 millones (heredados del modelo base) |
| Parametros activos | aproximadamente 3 000 millones por token (nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización selectiva de expertos enrutados a 2,00 bits de media; resto de pesos en BF16; formato empaquetado propietario (layer_XX.safetensors + manifest.json) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, pero esta no se especifica) |
| Formato de pesos | safetensors empaquetados en formato low-bit propio, con manifest.json; requiere cargador específico, no compatible con transformers estándar |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento (PTQ) del checkpoint Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts. La innovación técnica principal es la cuantización selectiva: solo los expertos enrutados se comprimen a una media de 2,00 bits, mientras que el resto de pesos (atención, embeddings, capas compartidas, router) permanece en BF16. Este enfoque busca minimizar la degradación de calidad en los componentes críticos y concentrar la pérdida de precisión en las rutas expertas, que en un MoE concentran la mayor parte de los parámetros pero solo se activan parcialmente por token.

El empaquetado resultante no es un formato estándar de cuantización (no es GGUF, AWQ ni GPTQ): el autor indica que se trata de un formato low-bit empaquetado con ficheros layer_XX.safetensors y un manifest.json, y que requiere el cargador correspondiente en lugar de transformers estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO, ya que el checkpoint es una cuantización y no un reentrenamiento. Tampoco se detalla el algoritmo exacto de cuantización ni el proceso de calibración empleado para fijar los 2,00 bits medios.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (image-text-to-text), según la etiqueta del repositorio, lo que sugiere capacidades multimodales heredadas del modelo base.
- Razonamiento y matemáticas: capacidades esperables del modelo base, aunque no verificadas en este checkpoint cuantizado.
- Generación de código: capacidad esperable del modelo base, sin datos específicos de este checkpoint.
- Tool calling y function calling: presumiblemente soportados por herencia del modelo base, sin confirmación en la información disponible.
- Soporte de agentes y razonamiento multi-paso: presumible, no verificado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible.
- La cuantización a 2 bits de los expertos puede degradar cualquiera de estas capacidades respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.

## Casos de uso

- Investigación en cuantización extrema de MoE: el checkpoint sirve para estudiar el impacto de comprimir expertos enrutados a 2 bits sobre la calidad de un modelo de 35B, comparando sus salidas con el modelo base en BF16.
- Experimentos de despliegue con memoria reducida: con 14,1 GB de pesos, permite cargar un MoE de 35B en GPUs de 24 GB (por ejemplo, RTX 4090) siempre que se disponga del cargador específico, algo inviable con el modelo en BF16.
- Evaluación de formatos low-bit empaquetados: útil para investigadores que desarrollan o validan cargadores personalizados y quieren probar un formato no estándar con manifest.json y ficheros por capa.
- Análisis de robustez y alucinación bajo cuantización agresiva: permite medir cómo se degradan la coherencia y la fidelidad factual al reducir la precisión de los expertos, comparando contra el modelo base.
- Prototipado de pipelines multimodales en entornos con VRAM limitada: si las capacidades image-text-to-text se conservan, se podría usar para experimentos de descripción de imágenes o VQA en hardware de consumo, con la cautela de la degradación.
- Estudio de eficiencia energética y throughput: comparar latencia y consumo de este checkpoint frente al modelo base para caracterizar el ahorro de memoria y su efecto en el rendimiento.
- Docencia y divulgación sobre arquitecturas MoE y cuantización: un ejemplo práctico y tangible de cómo se distribuye el tamaño entre expertos y componentes compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 14,1 GB solo para los pesos; con overhead de activaciones, KV cache y buffers del cargador, se recomienda un mínimo de 24 GB de VRAM para contexto corto.
- GPU recomendadas: RTX 4090 (24 GB) para contexto moderado; A100 40/80 GB, H100 o L40S para contextos largos y mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB o más; en 16 GB es probable que no quepa con overhead.
- Opciones de despliegue: no es compatible con transformers estándar, vLLM, llama.cpp, Ollama ni TGI sin un cargador específico; el autor indica que requiere el loader correspondiente al formato empaquetado (layer_XX.safetensors + manifest.json).
- Latencia y throughput estimados: no disponibles; dependerán del cargador y de la implementación de los kernels para el formato de 2 bits.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p00bit-r101-lowbit | 35B | ~3B | no disponible | Expertos a 2,00 bits, resto BF16 | no disponible | Hugging Face, requiere cargador específico |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B | ~3B | no disponible | BF16 | no disponible en la información | Hugging Face, transformers estándar |
| Alternativas de 2 bits para MoE de ~35B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros checkpoints comparables de 2 bits sobre el mismo modelo base en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el propio autor lo etiqueta como "internal research checkpoint", no como un modelo listo para producción.
- Requiere un cargador específico: no funciona con transformers estándar, lo que rompe la compatibilidad con ecosistemas como vLLM, TGI, llama.cpp u Ollama.
- Cuantización extrema: 2,00 bits de media en los expertos enrutados es una compresión muy agresiva que puede degradar la calidad, la coherencia y la fidelidad factual respecto al modelo base; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación: presumiblemente elevado por la pérdida de precisión, aunque no hay datos específicos.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco se detallan.
- Idiomas: no disponibles; no se puede confirmar el soporte multilingüe.
- Licencia: no disponible de forma explícita; la model card remite a la licencia del modelo base, que no se especifica en la información proporcionada, por lo que el uso comercial no está claro.
- Sin descargas ni likes: repositorio sin validación comunitaria, lo que aumenta el riesgo de errores no detectados en el empaquetado o el cargador.
- Fecha de creación futura (2026-11-12): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p00bit-r101-lowbit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
