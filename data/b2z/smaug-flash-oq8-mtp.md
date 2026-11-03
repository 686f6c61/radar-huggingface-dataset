# b2z/Smaug-Flash-oQ8-mtp

## Resumen

Smaug-Flash-oQ8-mtp es una cuantización en 8 bits del modelo Smaug-Flash de Abacus.AI, publicada por el usuario b2z en formato MLX (Apple Silicon). Smaug-Flash es a su vez un ajuste fino orientado a *agentic coding* del modelo DeepSeek-V4-Flash-0731, con el objetivo de mejorar el rendimiento en bucles agénticos de larga duración: uso de herramientas, ejecución de terminal, automatización y generación de repositorios. La variante aquí descrita conserva la arquitectura Mixture-of-Experts (MoE) del modelo original, con 43 capas, 256 expertos enrutados (6 activos por token más uno compartido) y atención MLA con indexador disperso de tokens.

El modelo resuelve el problema de los *spins* y estancamientos en tareas agénticas con razonamiento máximo, reduciendo el número de turnos necesarios para completar una tarea. Según la model card del autor original, mejora +14,3 puntos en LiveBench agentic-coding, +10,1 en Terminal Bench 2.1, +13,7 en AutomationBench y +19 en NL2Repo-Bench respecto a su modelo base. Mantiene una ventana de contexto de 1.048.576 tokens, decodificación especulativa DSpark y cuantización nativa block-FP8 en atención y FP4 empaquetada en expertos.

Esta publicación concreta (b2z/Smaug-Flash-oQ8-mtp) es una conversión a 8 bits para MLX, con 304.180.418.494 parámetros totales y un repositorio de 165,8 GB. Es relevante para desarrolladores que quieran ejecutar un modelo agéntico de gran contexto en hardware Apple Silicon sin renunciar a la interfaz de razonamiento ni al módulo de decodificación especulativa del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atención MLA (low-rank q/o) e indexador disperso de tokens |
| Parametros totales | 304.180.418.494 |
| Parametros activos | 6 expertos enrutados + 1 compartido por token (dimensión MoE por experto: 2048) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | 8 bits (oQ8) en esta publicación; el modelo base usa block-FP8 (e4m3, 128×128) en atención y FP4 empaquetada en expertos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Smaug-Flash es un ajuste fino de DeepSeek-V4-Flash-0731. La arquitectura es un transformer MoE de 43 capas con 64 cabezas de atención, dimensión oculta de atención de 4096, vocabulario de ~129K tokens y atención MLA con factores de bajo rango q/o más un indexador disperso de tokens. Incluye 256 expertos enrutados con 6 seleccionados por token y un experto compartido, con dimensión oculta de 2048 por experto. Incorpora un módulo de decodificación especulativa multi-token DSpark heredado del modelo base y totalmente funcional.

El entrenamiento de Smaug-Flash consistió en tres adaptadores LoRA aplicados en secuencia y fusionados como deltas completos: dos pasos de SFT y un paso de KTO. Solo se adaptaron las matrices de factores de atención MLA (129 en total); expertos, router, embeddings y módulo de decodificación especulativa permanecen idénticos byte a byte al release oficial, incluida la FP4 empaquetada. Los deltas se aplicaron sin truncamiento de rango y las matrices afectadas se recuantizaron al formato block-FP8 nativo del checkpoint. Los datos de entrenamiento no se divulgan; consisten en trazas curadas de bucles agénticos de repositorios públicos, trazas sintetizadas a partir de casos de uso reales de productos agénticos y variaciones sintéticas aumentadas.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* (interfaz de razonamiento heredada de DeepSeek-V4-Flash).
- Codificación agéntica: resolución de tareas de extremo a extremo con uso de herramientas y terminal.
- Uso de herramientas y *function calling* dentro de bucles agénticos multi-paso.
- Ejecución de comandos de terminal y automatización de flujos de trabajo (Terminal Bench 2.1, AutomationBench).
- Generación de repositorios completos a partir de descripciones en lenguaje natural (NL2Repo-Bench).
- Contexto largo de hasta 1.048.576 tokens, adecuado para sesiones agénticas prolongadas con historial extenso.
- Decodificación especulativa multi-token DSpark para acelerar la generación.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).
- Modalidad exclusivamente texto (sin visión ni audio).

## Casos de uso

- Automatización de tareas de terminal: el modelo puede ejecutar y encadenar comandos de shell en un bucle agéntico, corrigiendo errores sobre la marcha, gracias a su entrenamiento específico en Terminal Bench 2.1 y su ventana de 1M tokens para mantener el historial completo de la sesión.
- Generación de repositorios completos: a partir de una especificación en lenguaje natural, el modelo produce la estructura de ficheros, código y configuración necesarios, aprovechando su mejora de +19 puntos en NL2Repo-Bench.
- Agentes de automatización de flujos de trabajo: integración en pipelines de automatización donde el modelo decide qué herramientas invocar y en qué orden, con menor número de turnos y menor riesgo de estancamiento que el modelo base.
- Asistente de codificación en IDE o CI/CD: el modelo puede revisar, parchear y validar código dentro de pipelines, usando *tool calling* para consultar tests, linters o repositorios.
- Investigación sobre agentes autónomos: su contexto de 1M tokens y su decodificación especulativa lo hacen adecuado para experimentos de razonamiento multi-paso de larga duración en entornos controlados.
- Despliegue local en Apple Silicon: al estar en formato MLX con cuantización de 8 bits, permite ejecutar un modelo agéntico de gran tamaño en estaciones de trabajo Mac con memoria unificada amplia, sin depender de GPUs dedicadas.
- Procesamiento de documentación técnica extensa: la ventana de 1M tokens permite analizar repositorios o manuales completos en una sola pasada para generar guías, resúmenes o parches.

## Benchmarks y rendimiento

Los datos disponibles comparan Smaug-Flash (modelo base de esta cuantización) con DeepSeek-V4-Flash-0731, medidos en generaciones de tareas de 2026 con los arneses públicos y ejecución propia. No se han publicado resultados específicos para la variante cuantizada oQ8 en MLX.

| Benchmark | Smaug-Flash vs base | Notas |
|---|---|---|
| LiveBench agentic-coding | +14,3 | Mejora absoluta sobre el base |
| Terminal Bench 2.1 | +10,1 | Bajo el arnés de DeepSeek |
| AutomationBench | +13,7 | Mejora absoluta sobre el base |
| NL2Repo-Bench | +19,0 | Mejora absoluta sobre el base |
| LiveBench overall | +3,2 | Media de siete categorías |

No se han publicado resultados absolutos por benchmark (solo deltas respecto al base) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 165,8 GB en 8 bits; se necesita al menos esa cantidad de memoria unificada o VRAM para cargar los pesos, más overhead para el contexto (que a 1M tokens puede ser considerable).
- GPU recomendadas: no aplica de forma directa, ya que esta publicación es MLX (Apple Silicon). Para el modelo base en formato nativo se requerirían GPUs de centro de datos con suficiente memoria (A100 80GB en múltiples unidades, H100, etc.), aunque no se especifican configuraciones exactas en la información disponible.
- ¿Cabe en GPU de consumo? No en GPUs de consumo convencionales (24 GB o menos). En Apple Silicon requiere equipos con memoria unificada de 192 GB o superior (por ejemplo, Mac Studio M2 Ultra o M3 Ultra con 192 GB o más).
- Opciones de despliegue: MLX (librería indicada en la model card). Para el modelo base, cualquier stack que ejecute el release oficial de DeepSeek-V4-Flash (kernels FP4 y decodificación especulativa incluidos). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para esta variante MLX concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| b2z/Smaug-Flash-oQ8-mtp | 304,2B (MoE) | 1.048.576 | MIT | safetensors (MLX, 8 bits) | Cuantización MLX del Smaug-Flash |
| abacusai/Smaug-Flash | no disponible en la información | 1.048.576 | MIT | safetensors (block-FP8/FP4) | Modelo base del anterior |
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible en la información | 1.048.576 | no disponible | safetensors | Modelo base original de DeepSeek |

No se dispone de datos de benchmarks absolutos ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo es más decisivo que su base: completa tareas en menos turnos y entrega antes, lo que bajo presupuestos de tiempo ajustados puede llevar a soluciones menos exhaustivas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Solo modalidad texto; no soporta visión ni audio.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Advertencia del autor original: servir en el formato nativo del checkpoint. Recuantizar los pesos fusionados a otro esquema en tiempo de carga degrada de forma medible el seguimiento de instrucciones restringido.
- Esta publicación concreta es una cuantización de 8 bits en MLX; puede presentar diferencias de calidad respecto al modelo base en FP8/FP4 nativo, aunque no se documentan evaluaciones de la variante cuantizada.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos de entrenamiento (no divulgados).
- El tamaño del repositorio (165,8 GB) limita su despliegue a equipos con memoria unificada muy amplia.
- No se especifican limitaciones de contexto más allá de la ventana de 1M tokens.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/b2z/Smaug-Flash-oQ8-mtp
- Modelo base en HuggingFace: https://huggingface.co/abacusai/Smaug-Flash
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Página de Abacus.AI: https://abacus.ai
- Organización Abacus.AI en HuggingFace: https://huggingface.co/abacusai
