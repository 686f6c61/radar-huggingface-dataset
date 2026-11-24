# QwQbb/Hy-MT3-30B-A3B-oQ4e

## Resumen

Hy-MT3-30B-A3B-oQ4e es una cuantización de precisión mixta del modelo Hy-MT3-30B-A3B, un transformer de tipo Mixture-of-Experts (MoE) con 30.065 millones de parámetros totales, publicado por el usuario QwQbb en Hugging Face. El modelo se distribuye en formato MLX (Apple Silicon) y ha sido comprimido con la herramienta oQ (oMLX v0.8.3), que aplica cuantización mixta de 4 y 8 bits por grupo de 64 pesos, alcanzando un promedio efectivo de 4,726 bits por peso.

El interés de esta ficha radica en que se trata de un checkpoint cuantizado para inferencia local en hardware Apple, con un tamaño de repositorio de 17,8 GB, lo que permite ejecutar un modelo de 30B en equipos con memoria unificada de gama alta. La nomenclatura "MT" sugiere un modelo orientado a traducción automática, aunque la model card no lo confirma explícitamente.

La información disponible es muy limitada: no se publican datos sobre el proceso de entrenamiento, benchmarks, licencia ni idiomas soportados. Esta ficha documenta con rigor lo que sí consta (arquitectura de cuantización, distribución de bits, formato y tamaño) y marca explícitamente como "no disponible" todo lo que la model card omite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), según el sufijo "A3B" del nombre; detalles no disponibles |
| Parámetros totales | 30.064.725.888 (30,065B) |
| Parámetros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ: affine 4-bit grupo 64 (94,42% de pesos), affine 8-bit grupo 64 (5,54%), BF16 (0,04%); promedio efectivo 4,726 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 17,762 GB / 16,542 GiB |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura MoE con 30B parámetros totales y aproximadamente 3B activos por token ("A3B"), patrón habitual en modelos tipo Qwen3-30B-A3B. Sin embargo, la model card no describe la arquitectura interna, el número de expertos, la dimensionalidad de las capas ni el mecanismo de enrutamiento. Tampoco se especifica la longitud de contexto nativa ni si emplea atención lineal o decodificación especulativa.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni el proceso de alineación. Lo único documentado es el proceso de cuantización posterior: la herramienta oQ (oMLX v0.8.3) asigna 4 bits a la mayoría de los pesos (28,387B parámetros, 14,871 GiB) y eleva a 8 bits un subconjunto de 1,665B parámetros (1,648 GiB), presumiblemente capas sensibles a la precisión, manteniendo 0,013B parámetros en BF16. Esta estrategia de precisión mixta busca preservar calidad en capas críticas reduciendo el tamaño total.

## Capacidades

- Generación de texto y, presumiblemente, traducción automática dado el sufijo "MT" del nombre, aunque no se confirma en la model card.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están documentados).
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 17,8 GB permiten ejecutar el modelo en Macs con memoria unificada de 24 GB o superior mediante la librería MLX, útil para desarrollo y pruebas sin conexión a la nube.
- Traducción automática en local: si el sufijo "MT" indica un modelo de traducción, podría emplearse para traducir documentos sensibles sin enviar datos a servicios externos, aunque la calidad y los pares de idiomas no están documentados.
- Prototipado de aplicaciones de texto en entornos macOS: al estar cuantizado a ~4,7 bits, reduce el coste de memoria frente al modelo original, facilitando experimentación en portátiles de gama alta.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de la cuantización oQ frente al checkpoint original de 30B, si se dispone de él.
- Despliegue en estaciones de trabajo con memoria unificada: para tareas de generación de texto por lotes en local donde la privacidad es prioritaria.
- Investigación sobre eficiencia de cuantización mixta: la distribución de bits publicada permite estudiar qué capas requieren 8 bits y cuáles toleran 4 bits en arquitecturas MoE de 30B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 17,8 GB de almacenamiento; para inferencia en MLX se recomienda al menos 20-24 GB de memoria unificada para acomodar el modelo y los buffers de activación.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con memoria unificada suficiente; el formato MLX no está pensado para GPU NVIDIA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en configuraciones de 24 GB o más (por ejemplo, MacBook Pro M4 Pro de 24 GB, aunque con margen ajustado); en NVIDIA, el formato MLX no es directamente compatible.
- Opciones de despliegue: MLX (librería nativa), mlx-lm; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-oQ4e | 30,065B (MoE) | no disponible | MLX safetensors 4,7 bits | no disponible | Hugging Face (0 descargas) |
| Qwen3-30B-A3B | 30,5B (MoE, ~3B activos) | 32K nativo (extensible) | safetensors, GGUF | Apache 2.0 | Amplia |
| Qwen2.5-32B-Instruct | 32,5B (denso) | 128K | safetensors, GGUF | Apache 2.0 | Amplia |

La comparación con Qwen3-30B-A3B es pertinente por la coincidencia de tamaño y patrón MoE "A3B", pero no se confirma que Hy-MT3 derive de él. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al no haber información sobre el dataset de entrenamiento, no es posible evaluar sesgos de género, raza o idioma.
- Riesgo de alucinación: no cuantificado; la cuantización a 4 bits puede incrementar la degradación en tareas de precisión factual frente al modelo original, sin datos que lo confirmen.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni la calidad en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier despliegue en producción.
- Contexto no documentado: imposible planificar aplicaciones con ventanas largas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el checkpoint podría no haber sido evaluado por terceros.
- Formato MLX exclusivo: no es portable a GPU NVIDIA ni a la mayoría de frameworks de servidor, lo que limita su uso en producción fuera del ecosistema Apple.
- Fecha de creación futura (2026-11-24) en los metadatos: posible error de la plataforma o del autor; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/QwQbb/Hy-MT3-30B-A3B-oQ4e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
