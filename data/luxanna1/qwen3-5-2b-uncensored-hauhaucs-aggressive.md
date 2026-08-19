# luxanna1/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-2B-Uncensored-HauhauCS-Aggressive es una variante del modelo Qwen3.5-2B de Alibaba, modificada por el usuario HauhauCS para eliminar por completo los rechazos (refusals) del sistema de seguridad original. El modelo resultante responde a cualquier instrucción sin negarse, manteniendo supuestamente intactas las capacidades del modelo base. El repositorio lo publica el usuario luxanna1 en HuggingFace bajo licencia Apache 2.0.

Técnicamente, el modelo conserva la arquitectura híbrida del Qwen3.5-2B: una combinación de atención lineal Gated DeltaNet y atención softmax completa en proporción 3:1, con 24 capas y aproximadamente 1.880 millones de parámetros. Dispone de un contexto nativo de 262.000 tokens (extensible a 1M con YaRN), es nativamente multimodal (texto, imagen y vídeo) y soporta multi-token prediction (MTP). El modelo se distribuye en formato GGUF con varias cuantizaciones, además de un encoder de visión separado.

La relevancia de este modelo radica en su carácter "uncensored" en un formato compacto de 2B, lo que permite desplegarlo en hardware modesto sin renunciar a un contexto muy amplio y a capacidades multimodales. Sin embargo, al tratarse de una modificación sin entrenamiento adicional documentado, su fiabilidad y seguridad en producción son cuestionables, y no se han publicado benchmarks que verifiquen la ausencia de pérdida de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + softmax attention, ratio 3:1, 24 capas |
| Parametros totales | 1.881.825.088 (aprox. 1.88B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativo, extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, más mmproj f16 para el encoder de visión |
| Idiomas soportados | Inglés, chino y otros (vocabulario de 248K tokens, 201 lenguas según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) y safetensors (presentes en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning o modificación del Qwen3.5-2B original, publicado por Alibaba en marzo de 2026. La arquitectura base es híbrida: combina capas de atención lineal Gated DeltaNet con capas de atención softmax completa en una proporción 3:1, una innovación reciente que busca reducir el coste computacional del attention manteniendo la calidad en contextos largos. El modelo tiene 24 capas y es denso, con aproximadamente 1.88B parámetros.

La modificación realizada por HauhauCS consiste en eliminar los rechazos (refusals) del modelo, es decir, las respuestas negativas a peticiones consideradas peligrosas o inapropiadas. Según la model card, el resultado es un modelo con "0/465 refusals" y "cero pérdida de capacidades", aunque no se especifica el método empleado (posiblemente un fine-tuning con datos sintéticos o una técnica de edición de pesos). No hay información sobre el dataset de entrenamiento ni sobre el proceso de alineación. El modelo conserva las capacidades multimodales del base, incluyendo el encoder de visión que se distribuye como archivo separado.

## Capacidades

- Generación de texto libre sin rechazos: responde a cualquier instrucción, incluyendo contenido explícito, controvertido o potencialmente dañino, sin negarse.
- Multimodal nativo: acepta entradas de texto, imagen y vídeo mediante el encoder de visión (mmproj). Requiere cargar el archivo mmproj junto al GGUF principal en runtimes compatibles.
- Modo thinking (razonamiento): el modelo incluye un modo de pensamiento que se activa por defecto. Se recomienda mantener al menos 128K de contexto para preservar esta capacidad.
- Multi-token prediction (MTP): soporta predicción de múltiples tokens por paso, lo que puede acelerar la generación.
- Multilingüe: vocabulario de 248K tokens que cubre 201 lenguas, aunque los idiomas principales declarados son inglés y chino.
- Contexto largo: 262K tokens nativos, ampliable a 1M con YaRN, adecuado para documentos extensos o conversaciones multi-turno.

## Casos de uso

- Chatbots de rol sin restricciones: el modelo puede mantener conversaciones de rol con contenido adulto o temáticas controvertidas sin rechazar peticiones, gracias a su contexto de 262K tokens que permite mantener largas historias de personajes.
- Escritura creativa de ficción: generación de relatos, guiones o diálogos con contenido explícito o violento que otros modelos censurarían. El modo thinking permite desarrollar tramas complejas.
- Asistentes de investigación en entornos controlados: en laboratorios de seguridad o estudios académicos sobre generación de contenido dañino, este modelo sirve como caso de estudio para analizar comportamientos sin alineación.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo de 2B con cuantizaciones ligeras, puede ejecutarse en portátiles o GPUs de gama media para pruebas de concepto de chatbots o agentes sin las restricciones típicas de los modelos alineados.
- Análisis de textos controvertidos: el modelo puede resumir o analizar documentos con lenguaje ofensivo o temas tabú sin evasivas, útil para moderación de contenido o investigación sociológica.
- Generación de contenido para juegos de rol de mesa: creación de aventuras, NPCs o diálogos con un tono más agresivo o adulto que el de los modelos estándar, aprovechando el contexto largo para mantener la coherencia de campañas extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma "cero pérdida de capacidades" en comparación con el Qwen3.5-2B original, pero no aporta métricas numéricas (MMLU, HumanEval, GSM8K, etc.) que lo verifiquen. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - BF16 (3.6 GB): requiere al menos 4-5 GB de VRAM libre.
  - Q8_0 (1.9 GB): requiere ~2-3 GB de VRAM.
  - Q6_K (1.5 GB): requiere ~2 GB de VRAM.
  - Q4_K_M (1.2 GB): requiere ~1.5-2 GB de VRAM.
  - El encoder de visión (638 MB) se suma si se usan entradas de imagen/vídeo.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM, como NVIDIA RTX 3050, 3060, 4060, 4090, o GPUs de datacenter como A10, A100 (para despliegues con contexto máximo).
- Es viable en equipos sin GPU usando cuantizaciones Q4_K_M o Q6_K con llama.cpp, aunque la velocidad será baja.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp para inferencia local; vLLM, SGLang o KTransformers para producción de alto rendimiento (según la model card).
- Nota: la arquitectura es nueva (marzo de 2026) y el soporte en llama.cpp es reciente; se recomienda usar versiones actualizadas del software.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos. A modo orientativo, se puede comparar con el modelo base Qwen3.5-2B (misma arquitectura y parámetros, pero con alineación estándar y rechazos) y con otros modelos de ~2B como Qwen2.5-1.5B o Llama-3.2-1B. Sin embargo, al no haber métricas publicadas, no es posible establecer una comparación cuantitativa fiable. La principal diferencia frente al Qwen3.5-2B original es la eliminación de los rechazos, lo que afecta a la seguridad pero no necesariamente al rendimiento en tareas estándar.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal, violento o sexualmente explícito sin filtros. Su uso en producción debe evaluarse cuidadosamente y puede violar políticas de plataformas o leyes locales.
- No hay garantía de que la eliminación de refusals no haya degradado otras capacidades. La afirmación de "cero pérdida de capacidades" no está respaldada por benchmarks.
- El modelo puede añadir disclaimers cortos al final de algunas respuestas (por ejemplo, "esto es información general, no asesoramiento legal"), lo que podría confundir en aplicaciones automatizadas.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar hechos, especialmente en contextos largos o con temas especializados.
- El soporte de la arquitectura híbrida (Gated DeltaNet) es reciente en el ecosistema de herramientas; es posible encontrar incompatibilidades o bugs en runtimes antiguos.
- Aunque el contexto nativo es de 262K, se recomienda mantener al menos 128K para preservar el modo thinking; usarlo con contextos más cortos podría degradar la calidad del razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por el modelo puede no ser apto para todos los entornos empresariales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/luxanna1/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 27B: https://huggingface.co/HauhauCS/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive
- Variante 9B: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Perfil de HauhauCS: https://huggingface.co/HauhauCS
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
