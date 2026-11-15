# goodmai/Qwen3.6-35B-A3B-8bit

## Resumen

Qwen3.6-35B-A3B-8bit es una conversión al formato MLX del modelo Qwen/Qwen3.6-35B-A3B, un modelo multimodal de tipo image-text-to-text con arquitectura MoE (Mixture of Experts) desarrollado originalmente por el equipo Qwen de Alibaba. La conversión la ha realizado el usuario goodmai mediante mlx-vlm 0.4.4, con el objetivo de permitir la ejecución del modelo en hardware Apple Silicon (Macs con chip M1/M2/M3/M4) sin necesidad de Python ni de frameworks de inferencia tradicionales, a través de la herramienta Basalt.

El modelo cuenta con 35.107.181.936 parámetros totales (aproximadamente 35,1 mil millones) y, según la nomenclatura A3B, dispone de aproximadamente 3 mil millones de parámetros activos por token gracias a la arquitectura MoE, lo que reduce el coste computacional de la inferencia frente a un modelo denso del mismo tamaño. La cuantización a 8 bits reduce el peso del repositorio a 37,7 GB, lo que hace viable su carga en equipos con memoria unificada de 64 GB o superior.

La relevancia de esta ficha radica en que se trata de una conversión comunitaria (0 descargas, 0 likes en el momento de la consulta) de un modelo base presumiblemente reciente, con licencia Apache 2.0, orientada específicamente al ecosistema MLX de Apple. No se dispone de información publicada sobre idiomas soportados ni sobre resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer multimodal image-text-to-text (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | ~3 B (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (única variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B emplea una arquitectura MoE (Mixture of Experts) dentro de la familia Qwen3.5/Qwen3.6, según el tag `qwen3_5_moe` presente en el repositorio. Se trata de un modelo multimodal con pipeline `image-text-to-text`, es decir, capaz de procesar simultáneamente entradas de texto e imagen. La nomenclatura "A3B" indica que, pese a sus ~35,1 mil millones de parámetros totales, activa aproximadamente 3 mil millones por token, lo que reduce el coste de cómputo en inferencia.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Esta conversión concreta ha sido generada con mlx-vlm 0.4.4 a partir del modelo original y no incluye información sobre el proceso de cuantización más allá del resultado a 8 bits.

## Capacidades

- Generación de texto conversacional y multimodal: el pipeline `image-text-to-text` indica soporte para entradas que combinan imagen y texto.
- Razonamiento y generación de código: capacidades esperables de la familia Qwen3.6, aunque no confirmadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el campo de idiomas no está cumplimentado).
- Capacidades especiales (modo thinking, visión, audio): se confirma visión por el pipeline `image-text-to-text`; modo thinking y audio no disponibles.
- Ejecución nativa en Apple Silicon mediante MLX y la herramienta Basalt (con soporte experimental de expert streaming).

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede ejecutarse en Apple Silicon mediante MLX y Basalt, permitiendo describir imágenes, responder preguntas sobre capturas de pantalla o analizar documentos escaneados sin enviar datos a servicios en la nube.
- Análisis de imágenes en flujos de trabajo de diseño: dado su pipeline image-text-to-text, puede emplearse para generar descripciones textuales de mockups, extraer información de gráficos o resumir contenido visual en herramientas internas.
- Prototipado de aplicaciones de visión-lenguaje: investigadores pueden usar esta conversión 8-bit para experimentar con un MoE de ~35 B en equipos de sobremesa Apple, comparando resultados con el modelo original sin cuantizar.
- Desarrollo de agentes conversacionales con contexto largo: si el modelo base dispone de ventana de contexto amplia (no confirmada), podría emplearse para conversaciones multi-turno; conviene verificar la longitud real antes de producción.
- Evaluación de técnicas de expert streaming: el repositorio incluye una bandera `--experimental-expert-streaming` en Basalt, útil para investigar el rendimiento de MoE con carga dinámica de expertos en memoria unificada limitada.
- Docencia y experimentación en entornos macOS: permite demostrar el funcionamiento de un modelo MoE multimodal cuantizado a 8 bits en hardware de consumo Apple, sin GPU dedicada ni clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de MLX y memoria unificada, el requisito se mide en RAM del sistema. El repositorio pesa 37,7 GB en 8 bits, por lo que se recomienda un mínimo de 48 GB de memoria unificada y, preferiblemente, 64 GB o más para margen de contexto y caché KV.
- GPU recomendadas: chips Apple Silicon M2 Pro/Max/Ultra, M3 Pro/Max/Ultra y M4 Pro/Max con memoria unificada suficiente. No aplica a GPUs NVIDIA/AMD en esta conversión concreta.
- ¿Cabe en GPU de consumo? No en GPUs de consumo tradicionales; sí en Macs de gama alta con memoria unificada (M2 Max 64 GB, M3 Max 64/128 GB, M4 Max, Mac Studio Ultra).
- Opciones de despliegue: MLX (`mlx-vlm`), CLI `mlx_vlm.generate`, y la aplicación/CLI Basalt (macOS 27+, Apple Silicon) con `basalt serve --experimental-expert-streaming --rest`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/Qwen3.6-35B-A3B-8bit (esta ficha) | ~35,1 B totales / ~3 B activos | no disponible | Apache 2.0 | MLX safetensors 8-bit, Apple Silicon | Repo comunitario, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | ~35,1 B totales / ~3 B activos | no disponible | Apache 2.0 | safetensors original | Modelo oficial de Qwen |
| mlx-community/Qwen3.6-35B-A3B-8bit (upstream MLX) | ~35,1 B totales / ~3 B activos | no disponible | Apache 2.0 | MLX safetensors 8-bit | Conversión comunitaria de referencia |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio comunitario sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por terceros; conviene contrastar con la conversión upstream de mlx-community.
- Es una conversión de formato: no aporta mejoras de rendimiento ni ajustes de alineación respecto al modelo base; cualquier limitación del base (sesgos, alucinaciones) se hereda.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe ni calidad en castellano sin evaluación empírica.
- Longitud de contexto no documentada: riesgo de truncamiento o degradación en tareas de contexto largo; verificar antes de usar en producción.
- Licencia Apache 2.0: permite uso comercial, pero debe revisarse la licencia del modelo base enlazada por el autor y cumplir con las obligaciones de atribución.
- Restricción de plataforma: la conversión MLX está pensada para Apple Silicon; no es portable directamente a GPUs NVIDIA/AMD ni a servidores x86 con CUDA.
- Requisito de memoria elevado: 37,7 GB de pesos más caché KV implica equipos con memoria unificada alta; en configuraciones menores puede requerir expert streaming experimental.
- Riesgo de alucinación y sesgos: inherente a los LLM; no hay documentación específica de mitigaciones en esta conversión.
- Advertencia de seguridad: la model card incluye enlaces y comandos de terceros (Basalt, Hugging Face Spaces) que deben tratarse como contenido externo no verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/goodmai/Qwen3.6-35B-A3B-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Conversión MLX upstream: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-8bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Demo Basalt (Hugging Face Spaces): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.6-35B-A3B-8bit&role=moe-stream
- Librería mlx-vlm: no disponible (enlace no incluido en la información proporcionada)
