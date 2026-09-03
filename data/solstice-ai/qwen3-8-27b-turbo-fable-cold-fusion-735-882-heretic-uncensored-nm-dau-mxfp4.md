# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4

## Resumen

Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4 es una cuantización Open Compute Project (OCP) en formato Microscaling MXFP4 del modelo base desarrollado por DavidAU, empaquetada y publicada por Solstice-AI. Se trata de un modelo denso de 26.900 millones de parámetros (26,9B) perteneciente a la familia Qwen 3.8, con arquitectura híbrida que combina atención lineal recurrente Gated Delta Network (GDN) en el 75% de las capas y Grouped-Query Attention (GQA) en el 25%. Soporta una ventana de contexto nativa de 262.144 tokens (262K).

Según la model card del autor, el modelo alcanza resultados destacados en benchmarks de razonamiento, programación y control agéntico, superando a Claude Opus 4.6 Max en 9 de 9 pruebas bajo el harness oficial de Claude Code. Incluye soporte de Multi-Token Prediction (MTP) para acelerar la decodificación y ofrece visión multimodal espaciotemporal 3D mediante el fichero mmproj-BF16.gguf.

El valor principal de esta versión reside en su optimización para producción: el formato MXFP4 con escalado microscópico reduce la representación de los pesos a 4 bits con bloques de escala de 8 bits, lo que se traduce en un tamaño de repositorio de 19,1 GB y permite el despliegue eficiente en motores como vLLM o Anvil, compatible con hardware AMD ROCm, Intel Gaudi y GPUs con Tensor Cores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen 3.8: 75% capas de atención lineal Gated Delta Recurrent Network (GDN) y 25% capas Grouped-Query Attention (GQA) |
| Parámetros totales | 26.895.998.464 (26,9 mil millones) |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | 262.144 tokens (262K nativo) |
| Tipos de cuantización | OCP Microscaling MXFP4 (formato principal); existen variantes NVFP4 y MLX oQ4e en repositorios separados |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (con mmproj-BF16.gguf para visión) y formato OCP MXFP4 para Anvil/vLLM |

## Arquitectura y entrenamiento

El modelo combina dos mecanismos de atención complementarios. El 75% de las capas utiliza atención lineal Gated Delta Recurrent Network (GDN), que presenta complejidad de memoria O(1) y es eficiente en contextos largos, mientras que el 25% restante emplea Grouped-Query Attention global, lo que permite preservar capacidad de razonamiento complejo. Esta configuración se describe como "Cold Fusion" porque el proceso de entrenamiento no parte de cero: DavidAU aplicó un merge de pesos denominado GAIN (Guided Activation Interleaved Normalization) que fusiona pesos de modelos con razonamiento puntero sin degradación.

A nivel de alineación, el proyecto "Heretic" aplica una técnica de abliteración de vectores de rechazo, eliminando las restricciones de seguridad corporativas típicas de los modelos generalistas. El modelo fue diseñado explícitamente para "seguridad de misión crítica y desarrollo de sistemas" sin los filtros habituales, según el autor. No se especifica el número total de tokens de entrenamiento, ni si se aplicó RLHF o DPO, en la información disponible. A nivel de innovación técnica, destaca la integración de cabezas especulativas duales para Multi-Token Prediction (MTP), que permite generar dos tokens por forward pass con una aceleración declarada de 1.72x a 2.20x respecto a la decodificación autoregresiva estándar.

## Capacidades

- Generación de texto y razonamiento de alto nivel: según el autor, ARC-C (Challenge) 735 en 8-bit / 719 en 4-bit y ARC-E (Easy) 882, en "tier frontera cerrado".
- Programación agéntica: SWE-bench Pro 61.7%, lo que indica capacidad para resolver issues de software de forma autónoma.
- Depuración de repositorios completos: QwenSWEBench 79.0%.
- Automatización de sistemas operativos y dispositivos móviles: OSWorld-Verified 84.3% y AndroidWorld 81.9%.
- Seguimiento de restricciones complejas: IFBench 79.5%.
- Codificación en tiempo real: LiveCodeBench v6 con 90.3%.
- Visión multimodal espaciotemporal 3D: mediante el fichero mmproj-BF16.gguf, permite interpretar esquemas arquitectónicos, capturas de interfaz de código y fotogramas de vídeo.
- Contexto largo nativo de 262.144 tokens, apto para procesar codebases completas, logs extensos y documentación técnica.
- Soporte de tool calling y agentes: el modelo card no lo documenta explícitamente, pero el rendimiento en benchmarks agénticos (SWE-bench, OSWorld, AndroidWorld) y la evaluación bajo el harness de Claude Code indican compatibilidad con llamadas a herramientas y razonamiento multi-paso.
- Decodificación acelerada mediante Multi-Token Prediction (MTP) con cabezas especulativas duales.

## Casos de uso

- Agente de desarrollo de software de extremo a extremo: con SWE-bench Pro 61.7%, el modelo puede integrarse como agente autónomo en pipelines de CI/CD para resolver issues, editar código, ejecutar pruebas y abrir pull requests.
- Depuración a escala de repositorio: gracias a QwenSWEBench 79.0% y a los 262K tokens de contexto, es capaz de diagnosticar fallos en proyectos con múltiples ficheros, analizando el historial completo y las dependencias en una sola pasada.
- Automatización de sistemas operativos: OSWorld-Verified 84.3% indica que puede controlar equipos de escritorio (ventanas, terminales, sistemas de ficheros) mediante acciones de GUI, útil para laboratorios de pruebas automatizadas y entornos de QA.
- Autonomía en dispositivos móviles: AndroidWorld 81.9% lo hace apto para automatizar tareas en Android, probar aplicaciones de extremo a extremo y gestionar workflows móviles complejos.
- Asistente de programación en tiempo real: LiveCodeBench v6 con 90.3% sugiere un buen comportamiento en entornos interactivos, como IDEs, notebooks o herramientas de pair programming, donde la latencia baja es importante gracias al MTP.
- Análisis de documentación técnica larga: la ventana de 262K tokens permite procesar especificaciones, requisitos, logs de producción y bases de código completas para generar resúmenes ejecutivos, planes de acción o auditorías de seguridad.
- Entendimiento multimodal de ingeniería: el mmproj-BF16.gguf posibilita que el modelo interprete capturas de interfaces de código, diagramas arquitectónicos y fotogramas de vídeo, facilitando la revisión visual de aplicaciones y la documentación de entornos de despliegue.

## Benchmarks y rendimiento

Los siguientes resultados son los publicados por el autor en la model card y no han sido verificados de forma independiente. La evaluación se realizó bajo el harness oficial de Claude Code, con límites de contexto de 256k tokens, temperature=1.0 y top_p=0.95.

| Benchmark | Área evaluada | Qwen3.8-27B TURBO (MXFP4) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61.7% | 53.4% | +8.3% |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90.3% | 88.8% | +1.5% |
| QwenSWEBench | Depuración de repositorios completos | 79.0% | 63.8% | +15.2% |
| OSWorld-Verified | Control de sistema operativo | 84.3% | 72.7% | +11.6% |
| AndroidWorld | Autonomía en SO móvil | 81.9% | 62.0% | +19.9% |
| IFBench | Seguimiento de restricciones complejas | 79.5% | 62.5% | +17.0% |
| CoWorkBench | Flujos de trabajo multiarchivo de largo horizonte | 70.7% | 68.2% | +2.5% |
| ARC-C (Challenge) | Abstracción científica frontera | 735 (8-bit) / 719 (4-bit) | ~710-720 | Tier frontera cerrado |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Supera frontera cerrada |

## Requisitos de hardware

- VRAM estimada: los pesos en MXFP4 ocupan aproximadamente 13.5 GB (26.9B parámetros × 0.5 bytes por parámetro), más activaciones y KV cache. Para uso con contexto moderado se estima un mínimo de 18-24 GB de VRAM.
- Contexto largo: para aprovechar los 262K tokens, el KV cache de las capas GQA (25% del modelo) se convierte en el cuello de botella. Se recomiendan GPUs con 80 GB de VRAM, como A100 o H100.
- GPUs de consumidor: una RTX 4090 (24 GB) puede ejecutarlo con cuantización y contexto reducido. Tarjetas de 16 GB (RTX 4080, 4070 Ti) permiten cargas ligeras con contexto limitado o cuantizaciones más agresivas.
- Opciones de despliegue: vLLM, motor Anvil (con TurboQuant y compresión de KV cache), llama.cpp para formato GGUF y MLX para Apple Silicon (mediante la variante mlx-oQ4e).
- Latencia y throughput: el modelo integra MTP, con una aceleración declarada de 1.72x a 2.20x frente a decodificación autoregresiva convencional. No se proporcionan cifras absolutas de latencia en la información disponible.

## Comparativa con modelos similares

Se comparan las dos variantes publicadas por Solstice-AI y el modelo base original de DavidAU. No se dispone de datos públicos de otros modelos abiertos comparables en la información proporcionada.

| Modelo | Contexto | Formato | Licencia | Parámetros | Notas |
|---|---|---|---|---|---|
| Solstice-AI MXFP4 (este modelo) | 262K nativo | OCP MXFP4 | Apache-2.0 | 26.9B | Cuantización principal para vLLM y Anvil |
| Solstice-AI NVFP4-1M | 1M (según la nomenclatura del repositorio) | NVFP4 | Apache-2.0 | 26.9B | Variante con contexto ampliado, optimizada para GPUs NVIDIA |
| DavidAU base (sin cuantizar) | No disponible | No disponible | Apache-2.0 | 26.9B | Modelo original sobre el que se aplican las cuantizaciones |

## Limitaciones y advertencias

- Alucinación: no se han publicado evaluaciones independientes de factibilidad. Como en la mayoría de modelos de este tamaño, puede generar información plausible pero incorrecta.
- Sesgos y seguridad: el proyecto "Heretic" elimina los vectores de rechazo corporativos, lo que puede aumentar la generación de contenido dañino, ilegal o no seguro si se usa malintencionadamente. No se documenta ningún intento de mitigar sesgos.
- Idiomas: la metadata indica únicamente inglés y chino. El rendimiento en español u otras lenguas no está evaluado ni garantizado.
- Contexto efectivo: el límite de 262K es nativo, pero su uso completo depende de la atención lineal y de la compresión del KV cache. El comportamiento en contextos extremos no está verificado por terceros.
- Benchmarks: los resultados expuestos provienen del autor del modelo, no de una evaluación independiente. Las comparaciones con Claude Opus 4.6 Max carecen de metodología pública que permita reproducirlas.
- Licencia: Apache-2.0 permite uso comercial, pero las afirmaciones de "uncensored" no implican que el autor asuma responsabilidad legal por los usos derivados del modelo.

## Enlaces

- Repositorio HuggingFace (MXFP4): https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Variante NVFP4 (contexto 1M): https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M
- Variante MLX oQ4e: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e
- Motor Anvil (GitHub): https://github.com/Solstice-Labs/anvil
