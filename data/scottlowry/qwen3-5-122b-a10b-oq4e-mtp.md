# scottlowry/Qwen3.5-122B-A10B-oQ4e-mtp

## Resumen

Qwen3.5-122B-A10B-oQ4e-mtp es una cuantización mixta de precisión del modelo Qwen/Qwen3.5-122B-A10B, publicada por el usuario scottlowry en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen, con 125.086.497.008 parámetros totales según los pesos en safetensors, de los cuales aproximadamente 10B estarían activos por token (según la nomenclatura A10B del nombre). Incluye un cabezal de predicción multi-token (MTP) de 2.524B parámetros y un codificador de visión de 0.451B, lo que lo convierte en un modelo multimodal.

La aportación principal de esta publicación no es el modelo en sí, sino el proceso de cuantización: se ha aplicado oQ (oMLX v0.7.4.dev1), una técnica de cuantización de precisión mixta que asigna distintos niveles de bits a distintas partes del modelo. El resultado es un checkpoint de 69.084 GiB de almacenamiento con una media efectiva de 4.744 bits por peso, lo que reduce drásticamente los requisitos de memoria frente a los pesos originales en BF16, manteniendo la mayor parte de los pesos en 4 bits afines con grupo de 64.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecución de modelos en silicio de Apple (M-series). Esto lo hace relevante para desarrolladores que quieran ejecutar un modelo MoE de gran tamaño en Macs con memoria unificada, un nicho en el que las opciones de modelos de más de 100B parámetros son limitadas. La fecha de creación del repositorio (2026-07-23) y la actualización (2026-11-11) indican que se trata de una publicación reciente y mantenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabezal MTP y codificador de visión |
| Parametros totales | 125.086.497.008 |
| Parametros activos | Aproximadamente 10B (según nomenclatura A10B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 4-bit grupo 64 (94.639% de pesos), affine 8-bit grupo 128 (0.370%), affine 8-bit grupo 64 (4.583%), BF16 (0.408%); media efectiva 4.744 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, cuantizado) |
| Tamano del repo | 219.9 GB |
| Almacenamiento del checkpoint cuantizado | 69.084 GiB (74.179 GB) |
| Desglose de componentes | Lenguaje: 122.112B params / 66.855 GiB; Visión: 0.451B / 0.841 GiB; MTP: 2.524B / 1.389 GiB |
| Libreria | mlx |
| Modelo base | Qwen/Qwen3.5-122B-A10B |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de tipo Mixture of Experts (MoE), identificado en los tags como `qwen3_5_moe`. La nomenclatura "122B-A10B" indica 122B parámetros totales en el modelo de lenguaje y aproximadamente 10B activos por token, aunque la cifra exacta de parámetros activos no se detalla en la información proporcionada. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (122.112B parámetros lógicos), un codificador de visión (0.451B) que habilita capacidades multimodales, y un cabezal MTP (Multi-Token Prediction) de 2.524B parámetros, una técnica de decodificación especulativa que predice varios tokens por paso para acelerar la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en el modelo base. Tampoco se detalla la innovación arquitectónica interna más allá de la naturaleza MoE y la presencia del cabezal MTP. La cuantización oQ aplicada por scottlowry es una técnica de precisión mixta que preserva en 8 bits y BF16 las capas consideradas más sensibles (5.733B y 0.511B parámetros respectivamente), mientras que el grueso de los pesos (118.380B) se almacena en 4 bits afines con grupo de 64.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5 está diseñado para tareas de comprensión y generación de lenguaje natural.
- Capacidades multimodales: la presencia de un codificador de visión de 0.451B parámetros sugiere soporte de entrada de imágenes, aunque no se detallan las tareas concretas (VQA, captioning, OCR) en la información disponible.
- Decodificación multi-token (MTP): el cabezal de 2.524B parámetros permite predicción especulativa de múltiples tokens, orientada a reducir la latencia de generación.
- Ejecución en Apple Silicon: el formato MLX permite aprovechar la memoria unificada de los chips M-series.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac de gama alta: con 69.084 GiB de almacenamiento cuantizado, el modelo puede cargarse en equipos Apple Silicon con memoria unificada de 96 GB o superior (Mac Studio M2/M3 Ultra), permitiendo ejecutar un MoE de más de 100B parámetros en local sin depender de GPUs dedicadas.
- Prototipado de aplicaciones multimodales: el codificador de visión integrado permite experimentar con pipelines que combinen texto e imagen en un único modelo, útil para investigación aplicada y demos.
- Evaluación de técnicas de cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta oQ (4.744 bits/peso medio) en la calidad de salida frente al modelo base en BF16.
- Generación de texto asistida por máquina: para tareas de redacción, resumen o reescritura en entornos donde la privacidad exige ejecución local sin envío de datos a la nube.
- Aceleración de la decodificación con MTP: en aplicaciones interactivas (chat, autocompletado) donde la latencia importa, el cabezal MTP puede reducir el tiempo por token generado.
- Investigación en arquitecturas MoE: el desglose detallado de parámetros por componente (lenguaje, visión, MTP) facilita experimentos de ablación y análisis de contribución de cada módulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint cuantizado ocupa 69.084 GiB de almacenamiento; para inferencia se necesita memoria adicional para caché KV, activaciones y buffers, por lo que se recomienda un mínimo de 96 GB de memoria unificada en Apple Silicon.
- GPU dedicadas: el formato MLX está diseñado para Apple Silicon; no se ha validado su ejecución en GPUs NVIDIA (A100, H100, RTX 4090) según la información disponible.
- Equipos Apple compatibles: Mac Studio con M2 Ultra o M3 Ultra (192 GB de memoria unificada), Mac Pro con memoria ampliable; los modelos con 64 GB no son suficientes para cargar el checkpoint completo.
- Opciones de despliegue: MLX (librería nativa), oMLX (herramienta de cuantización y ejecución del autor); no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la presencia del cabezal MTP sugiere optimización para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ4e-mtp | 125.086B | no disponible | MLX safetensors cuantizado | no disponible | Hugging Face (49 descargas) |
| Qwen/Qwen3.5-122B-A10B (base) | 122B (aprox.) | no disponible | safetensors BF16 | no disponible | Hugging Face (modelo oficial) |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (MoE de más de 100B parámetros en formato MLX) para establecer una comparativa rigurosa con datos de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Licencia no especificada: la model card no indica la licencia del modelo base ni de la cuantización, lo que impide confirmar si el uso comercial está permitido; es imprescindible consultar la licencia de Qwen/Qwen3.5-122B-A10B antes de cualquier uso en producción.
- Exclusivo para Apple Silicon: el formato MLX no es portable a GPUs NVIDIA o AMD sin conversión, lo que limita su despliegue en infraestructura de servidores convencional.
- Requisitos de memoria elevados: 69.084 GiB de checkpoint más overhead de inferencia exigen equipos de gama muy alta (Mac Studio/Pro con 192 GB), fuera del alcance de la mayoría de desarrolladores.
- Cuantización con pérdida: aunque la precisión mixta preserva capas sensibles en 8 bits y BF16, el 94.639% de los pesos está en 4 bits, lo que puede degradar la calidad en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento profundo).
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de fidelidad factual para este checkpoint.
- Sesgos: no se documentan sesgos conocidos del modelo base ni de la cuantización en la información disponible.
- Idiomas: se desconoce la cobertura lingüística real; no se puede confirmar el soporte de castellano u otras lenguas.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Repositorio con pocas descargas (49) y sin likes: comunidad reducida, menor probabilidad de soporte o corrección de errores.
- Fecha de actualización reciente (2026-11-11) con re-cuantización: versiones anteriores pueden tener calidad inferior; es necesario descargar la versión actual.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Repositorio oMLX (herramienta de cuantización): https://github.com/jundot/omlx
