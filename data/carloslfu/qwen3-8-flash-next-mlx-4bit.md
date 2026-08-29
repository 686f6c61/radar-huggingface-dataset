# carloslfu/Qwen3.8-Flash-Next-MLX-4bit

## Resumen

Qwen3.8-Flash-Next-MLX-4bit es una conversión a formato MLX (Apple Silicon) del modelo Qwen3.8-Flash-Next de Alibaba, cuantizado a 4 bits. El modelo original es un MoE ultra disperso de 125B parámetros (con 6B activos por token) que incorpora una arquitectura híbrida Gated-DeltaNet y sparse attention, además de una tabla de embeddings n-gram de 51B parámetros. Esta versión MLX permite ejecutar el modelo en hardware Apple con memoria unificada, aunque requiere al menos 103.8 GB de almacenamiento y una cantidad equivalente de RAM.

La cuantización 4-bit uniforme reduce drásticamente el tamaño (de 360 GB en bfloat16 a 103.8 GB), pero introduce una pérdida de calidad notable en perplexity (+20.6% respecto al original). El autor recomienda usar la versión mixta 4/8-bit (también publicada) que mantiene los pesos no expertos en 8 bits y reduce la pérdida a solo +1.3%. Este checkpoint se publica como referencia, pero no como la opción óptima para producción.

El runtime necesario (`qwen4_exp`) no está incluido en ninguna versión estable de mlx-lm, por lo que el repositorio incluye su propia implementación basada en un PR abierto con correcciones numéricas validadas contra transformers. Se trata de un proyecto experimental orientado a usuarios avanzados que quieran probar el modelo en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-DeltaNet + Qwen Sparse Attention (QSA) híbrida, MoE |
| Parametros totales | 125B (modelo base) + 51B de tabla n-gram; 29.779.139.731 en safetensors cuantizado |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K (según documentación del modelo original) |
| Tipos de cuantizacion | 4-bit (grupo 64 para expertos, grupo 32 para n-gram); también disponibles 8-bit, 6-bit y mixto 4/8-bit |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida innovadora: tres de cada cuatro capas usan Gated DeltaNet para comprimir el historial, mientras que la cuarta capa utiliza Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. Además, incorpora hyper-connections (conexiones residuales con puertas de lectura/escritura aprendidas) y una tabla de embeddings n-gram de 51B parámetros que mejora el modelado de patrones locales. El modelo es un MoE ultra disperso con 120.8B parámetros en expertos enrutados y 6B activos por token.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo original (tokens, composición del dataset, técnicas de alineación). La cuantización MLX se realizó convirtiendo los pesos a 4 bits con grupos de tamaño 64 (expertos) y 32 (tablas n-gram), manteniendo en bfloat16 los componentes críticos como el router MoE, las puertas residuales y las proyecciones de DeltaNet. El runtime incluido implementa correcciones numéricas sobre el PR original de mlx-lm, verificadas contra transformers 5.16.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento complejo y resolución de problemas matemáticos.
- Generación de código y comprensión de lenguajes de programación.
- Soporte de contexto largo (hasta 262K tokens) gracias a la atención dispersa.
- Multilingüe (idiomas no especificados en la documentación).
- El modelo original tiene capacidades multimodales (visión), pero este runtime MLX es solo texto; la torre de visión se incluye en bfloat16 pero no se utiliza.
- No se confirma soporte de tool calling o function calling en esta versión.
- No incluye la cabeza de multi-token prediction de 4B del modelo original.

## Casos de uso

- Inferencia local en Apple Silicon: permite ejecutar un modelo de 125B en un Mac Studio o Mac Pro con 128 GB de memoria unificada, ideal para prototipado y experimentación sin depender de GPUs en la nube.
- Asistente de código con contexto largo: puede analizar repositorios completos o archivos de gran tamaño gracias a su ventana de 262K tokens, ayudando en tareas de refactorización y revisión de código.
- Chat conversacional de alta calidad: el modelo mantiene coherencia en diálogos extensos y puede usarse como backend de aplicaciones de chat locales.
- Investigación académica: permite estudiar el comportamiento de arquitecturas híbridas (DeltaNet + sparse attention) en un entorno controlado con hardware Apple.
- Generación de documentación técnica: el modelo puede resumir y redactar documentación a partir de código fuente o especificaciones extensas.
- Análisis de datos y razonamiento: con su capacidad para manejar contexto largo, puede procesar grandes volúmenes de texto (informes, logs) y extraer conclusiones o resúmenes.

## Benchmarks y rendimiento

La model card proporciona resultados de perplexity sobre wikitext-2 (test) comparando distintas cuantizaciones, evaluadas con las mismas ventanas de 2048 tokens:

| Build | Tamano | Perplexity | ΔNLL/token vs bf16 [95% CI] | Ventanas peores |
|---|---|---|---:|---:|
| bfloat16 (original) | 360.0 GB | 4.4708 | — | — |
| 8-bit | 192.2 GB | 4.4749 | +0.0009 [−0.0003, +0.0021] | 73/145 |
| 6-bit | 148.0 GB | 4.4767 | +0.0013 [−0.0003, +0.0029] | 81/145 |
| mixto 4/8-bit | 106.2 GB | 4.5286 | +0.0128 [+0.0109, +0.0148] | 128/145 |
| 4-bit uniforme | 103.8 GB | 5.3914 | +0.1872 [+0.1778, +0.1968] | 145/145 |

La cuantización 4-bit uniforme es estadísticamente peor que bfloat16 en todas las ventanas, con un incremento de +20.6% en perplexity. El autor recomienda usar la versión mixta 4/8-bit si se busca un equilibrio entre tamaño y calidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión.

## Requisitos de hardware

- VRAM/RAM unificada: mínimo 103.8 GB para cargar el modelo en memoria; se recomiendan 128 GB para dejar margen al runtime y la generación.
- GPU: exclusivo para Apple Silicon (M-series). Requiere un Mac con al menos 128 GB de memoria unificada (Mac Studio, Mac Pro o MacBook Pro de gama alta).
- No es compatible con GPUs NVIDIA o AMD; el formato MLX solo funciona en Apple Silicon.
- Opciones de despliegue: mlx-lm con `--trust-remote-code` (el runtime se incluye en el repositorio). También se puede cargar mediante la API Python de mlx-lm.
- Latencia y throughput: no disponibles, pero al ser una cuantización 4-bit en hardware de memoria unificada, el rendimiento dependerá del ancho de banda de memoria del chip (M1 Ultra, M2 Ultra, etc.).

## Comparativa con modelos similares

Este checkpoint se compara mejor con las otras cuantizaciones del mismo modelo publicadas por el mismo autor:

| Modelo | Tamano | Perplexity | Pérdida vs bf16 | Recomendado |
|---|---|---|---:|---|
| Qwen3.8-Flash-Next-MLX-8bit | 192.2 GB | 4.4749 | +0.09% | Sí, calidad casi idéntica |
| Qwen3.8-Flash-Next-MLX-6bit | 148.0 GB | 4.4767 | +0.13% | Sí, buen equilibrio |
| Qwen3.8-Flash-Next-MLX-mixed-4_8bit | 106.2 GB | 4.5286 | +1.3% | Sí, el mejor por tamaño |
| Qwen3.8-Flash-Next-MLX-4bit (este) | 103.8 GB | 5.3914 | +20.6% | No, superado por el mixto |

No se dispone de comparaciones con otros modelos MoE de tamaño similar (p. ej. DeepSeek-V3, Mixtral) en este contexto.

## Limitaciones y advertencias

- La cuantización 4-bit uniforme degrada significativamente la calidad (perplexity +20.6%). Se recomienda usar la versión mixta 4/8-bit, que con solo 2.4 GB más mantiene la pérdida en +1.3%.
- El runtime `qwen4_exp` no está integrado en ninguna versión estable de mlx-lm; el repositorio incluye una implementación basada en un PR abierto con correcciones numéricas, pero no hay garantía de soporte a largo plazo.
- La torre de visión se incluye en los pesos pero no se utiliza: el runtime es solo texto, por lo que las capacidades multimodales del modelo original no están disponibles.
- No se incluye la cabeza de multi-token prediction, lo que puede afectar a la velocidad de generación.
- El modelo original puede tener sesgos y alucinaciones inherentes a su entrenamiento; la cuantización adicional no los corrige.
- Licencia Qwen Community 1.0: permite uso comercial con restricciones (consultar el texto completo de la licencia).
- La generación greedy es coherente, pero no se han realizado pruebas exhaustivas de seguridad o robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/carloslfu/Qwen3.8-Flash-Next-MLX-4bit
- Repositorio GitHub del autor: https://github.com/PipeNetwork/qwen38-flash-next-mlx
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo original: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- PR de mlx-lm con soporte qwen4_exp: https://github.com/ml-explore/mlx-lm/pull/1788
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Colección de Qwen3.8-Flash-Next: https://huggingface.co/collections/Qwen/qwen38-flash-next
