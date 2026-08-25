# peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP

## Resumen

Tiel-Coder-35B-A3B-MLX-oQ4e-MTP es una re-cuantización del modelo Ornith-1.5-35B-A3B, desarrollada por el autor peculiar-ragdoll. Se trata de un modelo de lenguaje multimodal (texto e imagen) basado en una arquitectura de mezcla de expertos (MoE), optimizado para ejecución en Apple Silicon mediante la librería MLX. Su principal propósito es la codificación agéntica (agentic coding) y conversaciones multiturno de alta calidad, sacrificando rendimiento en tareas de conocimiento general y razonamiento académico.

El modelo incorpora el Sharp chat template, un cabezal de predicción multi-token (MTP) para decodificación especulativa y una cuantización dinámica de 4 bits (oQ4e) con imatrix. Según el autor, en pruebas internas de SWE-bench-Live resuelve 12 de 25 problemas, igualando a Opus 4.6 medium y superando a su modelo base. El repositorio ocupa 22,8 GB y los pesos safetensors suman 6.890.402.410 parámetros, aunque el nombre del modelo indica 35B-A3B (35 mil millones totales, 3 mil millones activos), lo que sugiere una posible discrepancia entre la nomenclatura y los archivos subidos.

La licencia es MIT, permitiendo uso comercial sin restricciones significativas. Los idiomas soportados son inglés y chino. Aunque el modelo base es de tipo visión-lenguaje, esta versión MLX está pensada para entornos Apple Silicon, con soporte para generación de texto, análisis de imágenes y decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen3.5 MoE, con cabezal MTP y template Sharp |
| Parámetros totales | 6.890.402.410 (según safetensors; el nombre del modelo indica 35B-A3B) |
| Parámetros activos | 3B (según el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ4e (4-bit dinámico con imatrix) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una re-cuantización de Ornith-1.5-35B-A3B, que a su vez deriva de la familia Qwen3 MoE. Usa un diseño de mezcla de expertos con 3B parámetros activos por token (según el nombre), lo que reduce el coste de inferencia manteniendo capacidad. Incorpora un cabezal de predicción multi-token (MTP) entrenado por Ornith-1.5, que permite decodificación especulativa en runtimes compatibles, acelerando la generación sin sacrificar calidad. La cuantización oQ4e es dinámica y se calibró con un pase de imatrix para preservar las capas más sensibles.

El entrenamiento original de Ornith-1.5 no se detalla en la información proporcionada: no se especifican el número de tokens, la composición del dataset ni si se usó RLHF o DPO. Esta versión concreta es una re-cuantización del modelo base y no ha sido re-entrenada; solo se añadió el cabezal MTP y el template Sharp. La visión está integrada en el mismo directorio, sin archivos de proyector separados.

## Capacidades

- Generación de texto y razonamiento, con especial énfasis en tareas de codificación agéntica (agentes que escriben y corrigen código en repositorios reales).
- Soporte de visión: acepta imágenes como entrada (por ejemplo, capturas de pantalla, diagramas) y responde sobre ellas.
- Conversación multiturno de alta calidad: el autor mide 67,2 puntos en Claw-Eval, superando a su base (65,3) y a Nail (60,5).
- Decodificación especulativa mediante el cabezal MTP, reduciendo la latencia en entornos que lo soporten.
- Tool calling y function calling (capacidad para usar herramientas externas en flujos de agente).
- Multilingüe: soporta inglés y chino.
- Integración con el template "Sharp" que optimiza respuestas cortas y directas, favoreciendo tareas de codificación.

## Casos de uso

- **Desarrollo de software asistido por IA**: el modelo puede resolver incidencias reales en repositorios de código, como se muestra en SWE-bench-Live (12/25 problemas resueltos). Es adecuado para integrarse en pipelines de CI/CD que requieran parches automáticos.
- **Revisión de código en tiempo real**: gracias a su capacidad de conversación multiturno, puede mantener diálogos largos con desarrolladores, explicando cambios y sugiriendo mejoras en contexto.
- **Asistente de programación en macOS**: al estar optimizado para MLX, funciona en Apple Silicon (M1/M2/M3/M4) sin necesidad de GPU dedicada, ideal para equipos de desarrollo que usan Mac.
- **Análisis de imágenes técnicas**: con su capacidad multimodal, puede interpretar capturas de pantalla, diagramas de arquitectura o gráficos de logs, ayudando en tareas de depuración visual.
- **Soporte técnico automatizado**: el modelo gestiona conversaciones de soporte en inglés o chino, manteniendo el contexto de usuario a lo largo de múltiples turnos sin degradarse.
- **Generación de documentación técnica**: puede resumir código, generar comentarios y crear documentación de API, aprovechando su especialización en código y su formato de respuestas concisas.
- **Prototipado rápido de agentes**: al incluir tool calling y decodificación especulativa, se puede usar para construir agentes que llamen a APIs y herramientas externas, con menor latencia que modelos densos de tamaño similar.

## Benchmarks y rendimiento

El autor publica resultados de benchmarks en la model card, pero advierte explícitamente que se midieron en la versión GGUF, no en esta versión MLX. Los resultados pueden variar debido al cambio de cuantizador (oQ4e frente a k-quants). Se presentan a continuación como referencia del modelo subyacente:

| Benchmark | Tiel-Coder (GGUF) | Nail (Qwen3.6-35B-A3B) | Ornith-1.5 (base) | Opus 4.6 (medium) | Qwen3.8-27B (Dirk) |
|---|---|---|---|---|---|
| SWE-bench-Live (25 problemas) | 12 resueltos | 8 resueltos | 8 resueltos | 12 resueltos | 15 resueltos |
| MMLU-Pro (4-bit) | 73.7 | 84.0 | 78.0 | no disponible | no disponible |
| Claw-Eval multi-turno | 67.2 | 60.5 | 65.3 | no disponible | no disponible |

El autor indica que la diferencia en MMLU-Pro (73.7 vs 84.0) se debe principalmente al modelo base y al template Sharp, no a la cuantización. En SWE-bench-Live, el modelo supera a su base (12 vs 8) y es igual a Opus 4.6 medium, aunque inferior a Dirk (15).

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 22.8 GB en 4-bit. Se recomienda al menos 32 GB de RAM unificada en Apple Silicon para cargar el modelo completo en memoria.
- **GPU recomendada**: diseñado para Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4). No requiere GPU NVIDIA/AMD; usa el backend MLX.
- **Compatibilidad con consumer GPU**: no aplicable, es una build específica para Apple Silicon (MLX). Para GPUs NVIDIA se puede usar la versión GGUF del mismo modelo.
- **Opciones de despliegue**: oMLX (administrador de modelos) o directamente con `mlx-vlm` (no `mlx-lm`, que produce tokens erróneos). También se puede descargar con `hf download`.
- **Latencia y throughput**: no se proporcionan datos numéricos. El autor menciona que con el cabezal MTP y el template Sharp se reduce el número de tokens generados (24% menos en comparación con otros cuantizadores), lo que mejora la velocidad efectiva.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros totales | Contexto | SWE-bench-Live | MMLU-Pro | Licencia |
|---|---|---|---|---|---|---|
| **Tiel-Coder-35B-A3B** | MoE + visión + MTP | 35B-A3B (pesos reales 6.89B) | no disponible | 12/25 (GGUF) | 73.7 (GGUF) | MIT |
| **Nail-Qwen3.6-35B-A3B** | MoE | 35B-A3B | no disponible | 8/25 | 84.0 | no disponible |
| **Dirk-Qwen3.8-27B** | Densa | 27B | no disponible | 15/25 | no disponible | no disponible |
| **Ornith-1.5-35B-A3B** | MoE + visión | 35B-A3B | no disponible | 8/25 | 78.0 | MIT (base) |

Tiel-Coder supera a su base y a Nail en tareas de codificación agéntica, pero es inferior en razonamiento y conocimiento general. Dirk, al ser denso, ofrece más fixes por problema, aunque a mayor coste computacional. La principal ventaja de Tiel es su velocidad y eficiencia en Apple Silicon.

## Limitaciones y advertencias

- **Rendimiento en conocimientos generales**: el autor declara que el modelo es "cheerfully bad at trivia" y su MMLU-Pro (73.7) es significativamente inferior al de Nail (84.0). No es adecuado para tareas de examen o razonamiento académico.
- **Dependencia del cuantizador**: los benchmarks publicados se midieron en la versión GGUF, no en esta versión MLX. El autor advierte de una diferencia de 0.7 puntos en MMLU-Pro y 24% en tokens entre ambos cuantizadores, por lo que los resultados reales en MLX pueden variar.
- **Idiomas limitados**: solo inglés y chino. No se ha evaluado el rendimiento en español u otros idiomas.
- **Contexto no documentado**: no se especifica la longitud de contexto máxima, lo que dificulta planificar tareas de largo alcance.
- **Sesgos y alucinación**: no se han publicado evaluaciones de sesgos. Como todo modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de conocimiento factual.
- **Compatibilidad**: es un checkpoint de visión-lenguaje; cargarlo con `mlx_lm.load()` produce tokens corruptos. Debe usarse con `mlx_vlm` o oMLX.
- **Tamaño del repositorio**: aunque los pesos suman 6.89B, el nombre del modelo sugiere 35B-A3B. La discrepancia no está explicada y puede indicar que el repo contiene solo una parte de los pesos o una variación del modelo.

## Enlaces

- [Modelo en HuggingFace (MLX-oQ4e-MTP)](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e-MTP)
- [Modelo base Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [Versión GGUF del mismo modelo](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP)
- [Versión MLX oQ4e sin MTP](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e)
- [Template de chat Sharp](https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates)
- [Repositorio de oMLX (administrador de modelos)](https://github.com/peculiar-ragdoll/omlx) (no verificado en la búsqueda)
- [Perfil del creador en HuggingFace](https://huggingface.co/peculiar-ragdoll)
