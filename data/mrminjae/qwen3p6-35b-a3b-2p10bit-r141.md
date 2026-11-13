# mrminjae/qwen3p6-35b-a3b-2p10bit-r141

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r141` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) de la familia Qwen 3.6. El autor, `mrminjae`, ha aplicado una cuantización selectiva de 2,10 bits de media únicamente sobre los expertos enrutados, manteniendo el resto de pesos (atención, embeddings, router, capas densas) en BF16. El resultado se almacena de forma desnormalizada en tensores BF16, de modo que es cargable con `transformers` y vLLM estándar sin kernels de cuantización especiales.

La relevancia del artefacto es doble. Por un lado, demuestra una técnica de compresión agresiva aplicada solo a los parámetros menos sensibles del MoE (los expertos), reduciendo drásticamente el espacio de almacenamiento y el ancho de banda de memoria en inferencia sin tocar la precisión de las capas críticas. Por otro, al mantener la compatibilidad con el stack estándar, permite evaluar el impacto real de esa compresión en tareas de generación de texto sin necesidad de infraestructura específica.

Se trata de un checkpoint interno de investigación (ID `r141`), publicado sin model card extendida, sin datos de evaluación y sin licencia explícita más allá de la herencia de la licencia del modelo base. No debe confundirse con una versión oficial de Qwen ni con un release estable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35B (según nomenclatura del modelo base) |
| Parametros activos | A3B (aproximadamente 3B activos por token, según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento desnormalizado en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors en BF16 (cargable con `transformers` y vLLM) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas MoE, siguiendo el esquema de Qwen3.6-35B-A3B: un total de 35B parámetros de los cuales aproximadamente 3B se activan por token mediante enrutamiento a un subconjunto de expertos. Esta configuración busca un equilibrio entre capacidad del modelo (parámetros totales) y coste computacional por token (parámetros activos), típico de los diseños MoE modernos.

La innovación de este checkpoint no está en el entrenamiento sino en la compresión post-hoc: solo los expertos enrutados se cuantizan a una media de 2,10 bits, mientras que el resto de pesos permanece en BF16. Los pesos se almacenan desnormalizados en tensores BF16, lo que evita dependencias de kernels de cuantización y permite cargar el modelo con `transformers` o vLLM sin modificaciones. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.6-35B-A3B.
- Razonamiento y matemáticas: capacidad esperada por la familia Qwen, aunque no verificada en este checkpoint.
- Generación de código: presumiblemente soportada por el modelo base, sin evaluación publicada en este artefacto.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de MoE: este checkpoint permite medir la degradación de calidad al cuantizar solo los expertos a 2,10 bits frente al modelo base en BF16, usando el mismo pipeline de evaluación.
- Despliegue con restricciones de memoria: al reducir el peso de los expertos, el modelo puede caber en GPUs con menos VRAM que el BF16 completo, facilitando pruebas en entornos de laboratorio.
- Evaluación de robustez de cuantizaciones extremas: útil para estudiar cómo afecta una media de 2,10 bits en expertos a tareas de razonamiento, código y matemáticas.
- Prototipado rápido con `transformers`: al cargarse con la librería estándar, sirve para validar pipelines de generación antes de comprometerse con infraestructura mayor.
- Benchmarking de serving con vLLM: permite comparar throughput y latencia frente al modelo base en BF16 sin cambiar el stack de inferencia.
- Estudio de rutas de expertos: al mantener el router en BF16, se pueden analizar patrones de enrutamiento y su sensibilidad a la cuantización de los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al almacenarse en BF16 desnormalizado, el checkpoint ocupa un espacio cercano al de un modelo de 35B en BF16 (aproximadamente 70 GB), aunque la cuantización de expertos reduce el peso efectivo de esos tensores.
- GPU recomendadas: no disponible; por tamaño, se requerirían GPUs de clase A100/H100 o múltiples RTX 4090 para el modelo completo.
- ¿Cabe en consumer GPU? No disponible; probablemente no en una sola GPU de consumo con 24 GB en BF16.
- Opciones de despliegue: `transformers` y vLLM, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mrminjae/qwen3p6-35b-a3b-2p10bit-r141` | 35B totales / ~3B activos | no disponible | no disponible | Hugging Face, checkpoint de investigación |
| `Qwen/Qwen3.6-35B-A3B` (base) | 35B totales / ~3B activos | no disponible | no disponible en la información | Hugging Face, modelo oficial |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación interna (`r141`), sin model card extendida ni evaluación publicada; no apto para producción sin validación propia.
- La cuantización a 2,10 bits en expertos puede degradar la calidad en tareas sensibles al conocimiento factual y al razonamiento profundo; no hay datos que cuantifiquen esa degradación.
- Licencia no especificada en la información disponible; la model card indica que sigue la del modelo base, pero no se detalla cuál es.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la compresión de expertos.
- Longitud de contexto no disponible; no se debe asumir la del modelo base sin verificación.
- El almacenamiento en BF16 desnormalizado implica que el ahorro de memoria en disco puede no reflejarse en VRAM durante la inferencia.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r141
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
