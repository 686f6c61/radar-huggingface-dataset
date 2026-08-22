# majentik/Ornith-1.5-35B-A3B-MLX-3bit

## Resumen

Ornith-1.5-35B-A3B-MLX-3bit es una variante cuantizada en 3 bits (affine, group size 32) del modelo multimodal Ornith-1.5-35B-A3B, desarrollada por majentik para ejecución eficiente en Apple Silicon mediante la librería MLX. El modelo base, creado por ornith-ai, es un mixture-of-experts (MoE) de la familia Ornith-1.5 que activa aproximadamente 3 mil millones de parámetros por token (35B en total), y está diseñado para tareas de razonamiento, generación de código y agentes, con capacidades de visión y texto.

Esta cuantización complementa las versiones oficiales de 4, 6 y 8 bits publicadas por el propio ornith-ai, ofreciendo una opción de menor huella de memoria sin necesidad de hardware especializado. El repositorio incluye una torre de texto cuantizada en 3 bits mientras que la torre de visión y el proyector se mantienen en BF16, lo que permite conservar las capacidades multimodales del modelo. La licencia MIT facilita su uso comercial y de investigación.

El modelo destaca porque, según los datos del autor, supera a Qwen 3.6-35B en todos los benchmarks de codificación y agentes, y a modelos densos como Gemma 4-31B y Muse Glimmer-3B en tareas de agentes de código, a pesar de activar solo ~3B parámetros por token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mixture of experts) |
| Parámetros totales | ~35B (modelo base); 5.865.901.936 en safetensors (torre de texto cuantizada) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3-bit affine, group size 32 (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo de arquitectura mixture-of-experts (MoE) con 35B parámetros totales y 3B activos por token, basado en el esquema qwen3_5_moe. La variante MLX cuantiza la torre de texto a 3 bits (affine, group size 32) mientras mantiene la torre de visión y el proyector en BF16, lo que permite el procesamiento de imágenes sin degradar la calidad de la representación visual. El modelo base se entrenó siguiendo el marco de self-scaffolding y self-improvement de Ornith-1.5, donde el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando un ciclo de mejora continua. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de texto, razonamiento y codificación, con rendimiento superior a Qwen 3.6-35B en benchmarks de codificación y agentes.
- Procesamiento de imágenes (image-text-to-text), con torre de visión dedicada.
- Soporte de agentes y multi-step reasoning, especialmente en tareas de agentes de codificación.
- Capacidades multilingües no especificadas, pero probablemente amplias dado el origen del modelo.
- No se documentan capacidades de tool calling, aunque la arquitectura es adecuada para ello.
- No incluye modo de pensamiento explícito.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede ejecutar tareas de programación multi-paso, generar y depurar código, y coordinarse con herramientas externas gracias a su arquitectura MoE eficiente.
- Asistente de programación en IDE: integrable en editores como VS Code o JetBrains para autocompletado, refactorización y generación de tests, con baja latencia en hardware Apple Silicon.
- Análisis de documentos técnicos con imágenes: puede procesar capturas de pantalla, diagramas y código fuente en un mismo contexto, útil para documentación técnica y revisión de código.
- Automatización de pruebas y CI/CD: el modelo puede generar casos de prueba, analizar logs y sugerir correcciones, integrándose en pipelines con bajo coste computacional.
- Educación y tutoría en programación: puede explicar conceptos de código, generar ejemplos y responder preguntas técnicas en tiempo real.
- Prototipado rápido de aplicaciones: generar esqueletos de proyectos, APIs y scripts de despliegue a partir de descripciones en lenguaje natural.
- Investigación en agentes: el modelo es adecuado para experimentos de scaffolding y self-improvement, dado su diseño orientado a agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización 3-bit en la información disponible. El autor indica que los benchmarks están pendientes ("benchmarks pending"). Sin embargo, el modelo base Ornith-1.5-35B-A3B ha reportado superar a Qwen 3.6-35B en todos los benchmarks de codificación y agentes, y a Gemma 4-31B y Muse Glimmer-3B en agentic coding, aunque no se incluyen cifras concretas en la documentación consultada.

## Requisitos de hardware

- Diseñado para Apple Silicon (M1/M2/M3/M4) mediante MLX, con soporte de CPU y GPU unificada.
- Tamaño del repositorio: 18.3 GB, lo que implica una huella de memoria de aproximadamente 14 GB en RAM para carga completa (3-bit, 35B parámetros ≈ 13 GB + overhead).
- En Mac con 16 GB de RAM unificada puede ejecutarse, aunque con limitaciones de contexto. Recomendable 32 GB para tareas multimodales.
- No se recomienda para GPUs NVIDIA; para esos sistemas se publican versiones GGUF o fp16.
- Despliegue con `mlx-lm` (generación) o integración en aplicaciones Python con la API de MLX.
- Latencia y throughput no especificados; depende de la generación de hardware (M-series).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (MLX-3bit) | ~35B | ~3B | no disponible | MIT | MLX |
| Qwen 3.6-35B | ~35B | ~35B (denso) | no disponible | Apache 2.0 | varios |
| Gemma 4-31B | ~31B | ~31B (denso) | no disponible | Gemma license | varios |
| Muse Glimmer-3B | ~3B | ~3B (denso) | no disponible | no disponible | varios |

Según los datos publicados, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificación y agentes, y a los modelos densos Gemma 4-31B y Muse Glimmer-3B en agentic coding, con una fracción de activación por token.

## Limitaciones y advertencias

- No se han publicado benchmarks específicos de esta cuantización 3-bit, por lo que el rendimiento real puede variar respecto al modelo base.
- La cuantización 3-bit puede degradar la precisión en tareas de razonamiento complejo o matemáticas, aunque no se han reportado pruebas.
- No se especifican sesgos conocidos ni riesgos de alucinación; se requiere validación en producción.
- La longitud de contexto no está documentada, lo que limita el uso en tareas de contexto largo.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento.
- La torre de visión se mantiene en BF16, lo que puede aumentar el consumo de memoria en tareas multimodales.
- No se incluye información sobre idiomas soportados; se asume multilingüe pero sin confirmación.

## Enlaces

- [Repositorio de la cuantización MLX-3bit](https://huggingface.co/majentik/Ornith-1.5-35B-A3B-MLX-3bit)
- [Modelo base Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Versión MLX-6bit de ornith-ai](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit)
- [Página del proyecto Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Modelo en ModelScope](https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B)
- [mlx-lm en GitHub](https://github.com/ml-explore/mlx-lm)
