# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised-DSpark

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised es una suite de cuantizaciones GGUF del modelo base Qwen3.8-27B-TURBO-Fable-Cold-Fusion, desarrollado por DavidAU y empaquetado por Solstice-AI. Se trata de un modelo híbrido de 26.895.998.464 parámetros (26,9B) que combina atención lineal Gated Delta Recurrent Network (GDN) en el 75% de las capas y Grouped-Query Attention (GQA) en el 25% restante, con una ventana de contexto nativa de 262K tokens. Es un modelo multimodal (imagen y texto) y ha sido sometido a un proceso de "abliterated" y "uncensored" para eliminar las restricciones de alineación.

El autor afirma que este modelo logra un barrido limpio de 9 de 9 benchmarks frente a Claude Opus 4.6 Max, incluyendo SWE-bench Pro (61,7%), LiveCodeBench v6 (90,3%), OSWorld-Verified (84,3%) y AndroidWorld (81,9%). La suite incluye además un modelo drafter DSpark de 1,86B parámetros para decodificación especulativa, que acelera la generación entre 2,5x y 3,1x en llama.cpp y Anvil Runtime. Estos resultados son reportados por el autor y no han sido verificados de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 75% Gated Delta Recurrent Network (GDN) de atención lineal, 25% Grouped-Query Attention (GQA) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K nativo (según model card) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS; variantes MTP integradas (MTP-Q4_K_M, MTP-Q8_0); drafter DSpark en Q8_0 y Q4_K_M |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida de Qwen 3.8 en la que el 75% de las capas son bloques de atención lineal Gated Delta Recurrent Network (GDN), con complejidad de memoria O(1) por paso de avance, y el 25% restante utiliza Grouped-Query Attention (GQA) global. Esta combinación permite manejar ventanas de contexto muy largas con un coste de memoria reducido en comparación con la atención cuadrática tradicional.

El modelo base es un merge GAIN ("Cold Fusion") creado por DavidAU, que combina varios componentes (Fable, Heretic, Cold Fusion) y ha sido sometido a un proceso de "abliterated" para eliminar la alineación de seguridad, resultando en un modelo "uncensored". No se han proporcionado datos sobre el número de tokens de entrenamiento ni la composición del dataset.

La suite GGUF incluye dos vías de aceleración especulativa: un drafter DSpark de 1,86B parámetros entrenado con SpecForge, que utiliza 5 capas de extracción de características auxiliares (5, 19, 33, 47, 61) y una cabeza de confianza VanillaMarkov de rango 256, y checkpoints con Multi-Token Prediction (MTP) integrado directamente en la estructura del modelo.

## Capacidades

- Razonamiento avanzado y abstracción científica: puntuaciones de 735 en ARC-C (Challenge) en cuantización 8-bit y 719 en 4-bit, y 882 en ARC-E (Easy) según el autor.
- Ingeniería de software agéntica: 61,7% en SWE-bench Pro, 90,3% en LiveCodeBench v6 y 79,0% en QwenSWEBench, lo que indica capacidad para resolver issues complejos en repositorios completos.
- Control de sistemas operativos y dispositivos: 84,3% en OSWorld-Verified y 81,9% en AndroidWorld, lo que implica capacidades de agente para interactuar con interfaces de escritorio y móviles.
- Seguimiento de instrucciones complejas: 79,5% en IFBench.
- Trabajos de larga duración multi-archivo: 70,7% en CoWorkBench.
- Multimodalidad: procesamiento de imágenes, diagramas, capturas de pantalla y frames de video mediante el proyector mmproj-BF16.gguf.
- Decodificación especulativa: soporte de drafter DSpark con aceleración de 2,5x a 3,1x en la velocidad de decodificación, y variantes MTP integradas.
- Tool calling y function calling: capacidad implícita en los benchmarks de agentes, que requieren invocación de herramientas y razonamiento multi-paso.
- Multilingüe: soporte de inglés y chino.
- Sin restricciones de alineación: al ser "uncensored", no aplica filtros de contenido de seguridad.

## Casos de uso

- Asistentes de programación en entornos de desarrollo: el modelo puede resolver issues complejos en repositorios completos, como demuestra el 61,7% en SWE-bench Pro, integrándose en pipelines de CI/CD o como agente autónomo de desarrollo.
- Depuración y mantenimiento de software: con un 79,0% en QwenSWEBench, es adecuado para tareas de depuración a nivel de repositorio completo, identificando y corrigiendo errores en código existente.
- Automatización de escritorio y control de sistemas operativos: el 84,3% en OSWorld-Verified indica que puede ejecutar tareas de forma autónoma en sistemas operativos, como gestión de archivos, configuración de aplicaciones o flujos de trabajo de oficina.
- Automatización de dispositivos móviles: el 81,9% en AndroidWorld permite desarrollar agentes que interactúan con aplicaciones Android, realizando tareas como navegación, formularios o pruebas de aplicaciones.
- Análisis de interfaces de usuario y diagramas técnicos: gracias a la multimodalidad, puede interpretar capturas de pantalla, wireframes y diagramas para generar código o documentación a partir de ellos.
- Razonamiento científico y resolución de problemas abstractos: la puntuación de 735 en ARC-C lo hace útil en entornos de investigación que requieren razonamiento abstracto y de sentido común.
- Chat conversacional de contexto largo: con 262K tokens de ventana, puede procesar documentos extensos, transcripciones o conversaciones largas en inglés y chino, manteniendo coherencia a lo largo del diálogo.
- Despliegue local de baja latencia: la combinación del modelo principal con el drafter DSpark permite acelerar la decodificación hasta 3,1x en llama.cpp, lo que es adecuado para aplicaciones en tiempo real o entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, evaluados bajo el harness oficial de Claude Code en límites de contexto de 256k (temperatura=1.0, top_p=0.95). No se han verificado de forma independiente.

| Evaluación | Enfoque | Qwen3.8-27B TURBO (Solstice-AI x DavidAU) | Claude Opus 4.6 Max (Anthropic) | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | Depuración de repositorios completos | 79,0% | 63,8% | +15,2% |
| OSWorld-Verified | Control de sistemas operativos | 84,3% | 72,7% | +11,6% |
| AndroidWorld | Autonomía en sistemas operativos móviles | 81,9% | 62,0% | +19,9% |
| IFBench | Seguimiento de instrucciones complejas | 79,5% | 62,5% | +17,0% |
| CoWorkBench | Flujos de trabajo multi-archivo de larga duración | 70,7% | 68,2% | +2,5% |
| ARC-C (Challenge) | Abstracción científica frontera | 735 (8-bit) / 719 (4-bit) | ~710-720 | Tier cerrado frontera |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Supera la frontera cerrada |

Nota: los resultados de ARC-C y ARC-E se presentan como puntuaciones brutas, no porcentajes, según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización Q8_0, se requieren aproximadamente 32 GB de VRAM (26,9 GB de pesos + overhead de activaciones y KV cache). Para Q4_K_M, unos 20 GB; para IQ4_XS, unos 16 GB. El drafter DSpark en Q8_0 añade alrededor de 2 GB adicionales. La ventana de contexto de 262K puede aumentar significativamente la memoria de KV cache en las capas GQA.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4_K_M o IQ4_XS con contexto moderado; A100 40 GB o 80 GB para Q8_0 con contexto largo; H100 para máxima velocidad y throughput.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en tarjetas de 24 GB con cuantizaciones Q4_K_M o IQ4_XS, siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama y Anvil Runtime (TurboQuant). El modelo base en safetensors puede desplegarse con vLLM o TGI, pero este repositorio contiene únicamente pesos GGUF.
- Latencia y throughput: con el drafter DSpark, el autor reporta una aceleración de decodificación de 2,5x a 3,1x en llama.cpp y Anvil. No se proporcionan cifras absolutas de latencia o tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa con modelos alternativos de la misma categoría (mismo tamaño o misma tarea). Los benchmarks del autor comparan el modelo exclusivamente con Claude Opus 4.6 Max, un modelo propietario de mayor tamaño, cuyos resultados se detallan en la sección de benchmarks. El modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU es la versión sin cuantizar de este mismo modelo, y no se han encontrado datos comparativos con otras alternativas de código abierto.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido dañino, ilegal o inapropiado sin filtros de seguridad. Esto supone un riesgo ético y legal en aplicaciones de producción.
- Los benchmarks presentados son auto-reportados por el autor y no han sido verificados de forma independiente. Existe la posibilidad de sobreajuste a los conjuntos de evaluación o de resultados exagerados.
- El modelo solo soporta inglés y chino, lo que limita su uso en aplicaciones multilingües más amplias.
- La ventana de contexto de 262K tokens puede requerir una cantidad considerable de memoria, especialmente en las capas GQA, lo que puede hacer inviable su despliegue en hardware de consumo con contextos muy largos.
- El modelo es un merge y una cuantización, no un entrenamiento desde cero. La calidad puede variar respecto al modelo original y pueden existir degradaciones en tareas específicas.
- El drafter DSpark es un modelo auxiliar adicional que debe cargarse junto al modelo principal, lo que incrementa los requisitos de memoria y la complejidad del despliegue.
- Como todos los modelos de lenguaje, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o con información no presente en el contexto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Anvil Runtime: https://github.com/Solstice-Labs/anvil
