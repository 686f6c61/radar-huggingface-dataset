# HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.6-27B-Uncensored-HauhauCS-Aggressive es un fine-tune del modelo Qwen3.6-27B de Alibaba, publicado por el usuario HauhauCS con el objetivo de eliminar los rechazos del modelo original. Según la model card, alcanza una tasa de rechazo de 0/465 en el benchmark de refusals, manteniendo intactas las capacidades del modelo base. La variante "Aggressive" se diferencia de la "Balanced" en que, ante prompts delicados, entrega la respuesta directamente sin preámbulos ni razonamiento previo, mientras que la Balanced razona en voz alta antes de responder.

El modelo mantiene la arquitectura híbrida del Qwen3.6-27B original: 27.000 millones de parámetros densos, 64 capas con una combinación de capas de atención lineal (Gated DeltaNet) y capas de atención completa (Gated Attention). Soporta un contexto nativo de 262.000 tokens, extensible a aproximadamente 1 millón mediante YaRN, y es nativamente multimodal (texto, imagen y vídeo). Se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P, optimizadas mediante importance matrix (imatrix) para preservar la calidad sobre los pesos ablacionados.

La relevancia de este modelo radica en su carácter de "uncensored" sin pérdida aparente de capacidades, lo que lo hace atractivo para escenarios de red-teaming, investigación de alineación y generación creativa sin restricciones, aunque con los riesgos inherentes a la eliminación de salvaguardas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con 48 capas de atención lineal (Gated DeltaNet) y 16 capas de atención completa (Gated Attention) |
| Parametros totales | 27 B (densos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativo; extensible a ~1 M con YaRN |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M, mmproj-f16 |
| Idiomas soportados | Inglés, chino y multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo mmproj para visión) |

## Arquitectura y entrenamiento

La arquitectura se hereda íntegramente de Qwen3.6-27B. Se compone de 64 capas organizadas en un patrón repetitivo: cada bloque contiene 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). Esto resulta en 48 capas de atención lineal (Gated DeltaNet) y 16 capas de atención completa (Gated Attention). Las capas Gated DeltaNet utilizan 48 cabezas V y 16 cabezas QK con dimensión de cabeza 128, mientras que las capas Gated Attention emplean 24 cabezas Q y 4 cabezas KV con dimensión de cabeza 256 y rope dim 64. La dimensión oculta es 5120, la FFN 17408 y el vocabulario 248320.

El proceso de "uncensoring" se realiza mediante abliteration, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los rechazos, sin modificar datasets ni capacidades. La model card afirma explícitamente que no hay cambios en datasets ni en las capacidades del modelo original. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO; se trata de un fine-tune de eliminación de rechazos sobre pesos ya entrenados. Todas las cuantizaciones se generaron con importance matrix (imatrix) para optimizar la preservación de calidad sobre los pesos ablacionados.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.6-27B.
- Soporte de tool calling y function calling, útil para integraciones con APIs y agentes.
- Capacidades de agente y razonamiento multi-paso, incluyendo modo "thinking" recomendado por los autores de Qwen.
- Multimodal nativo: procesamiento de imagen y vídeo mediante el archivo mmproj incluido (pipeline image-text-to-text).
- Multilingüe: inglés, chino y otros idiomas cubiertos por el modelo base.
- Tasa de rechazo de 0/465 en el benchmark de refusals, lo que implica que responde a prácticamente cualquier prompt sin negarse.
- Variante "Aggressive": entrega respuestas directas sin preámbulos ni disclaimers en prompts delicados, a diferencia de la variante Balanced.

## Casos de uso

- Red-teaming y evaluación de seguridad de modelos: permite probar los límites de los sistemas de moderación y estudiar cómo un modelo sin salvaguardas responde a prompts adversariales, útil para investigadores de alineación.
- Investigación académica sobre sesgos y alineación: al comparar las respuestas de esta versión con las del modelo base, se pueden analizar los efectos de la abliteration en el comportamiento del modelo.
- Generación creativa de ficción y roleplay: la ausencia de rechazos y la variante Aggressive permiten explorar tramas y diálogos sin restricciones temáticas, manteniendo la calidad narrativa del modelo base.
- Asistencia de código en entornos controlados: con soporte de tool calling y contexto de 262K, puede integrarse en pipelines de desarrollo para generación, revisión y refactorización de código, siempre que el equipo acepte la ausencia de filtros.
- Procesamiento multimodal de documentos: gracias al mmproj, puede analizar imágenes y vídeos, extraer información y generar descripciones, útil en archivística o análisis de contenido audiovisual.
- Desarrollo de agentes conversacionales especializados: en dominios donde los filtros del modelo base bloquean consultas legítimas (por ejemplo, terminología médica o legal explícita), esta versión puede ofrecer respuestas sin fricción.
- Traducción y transcripción multilingüe: aprovechando el soporte multilingüe y el contexto largo, puede procesar documentos extensos con coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de rechazo: 0/465 en el benchmark de refusals, tanto para la variante Aggressive como para la Balanced. Se afirma que las capacidades son idénticas a las del modelo base Qwen3.6-27B, pero no se aportan datos numéricos que lo verifiquen.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de archivo indicados en la model card):
  - Q8_K_P: 32 GB → requiere GPU con 40 GB o más (A100 40/80 GB, H100).
  - Q6_K_P: 23 GB → GPU de 24 GB (RTX 4090, RTX 3090, A5000).
  - Q5_K_P: 21 GB → GPU de 24 GB (RTX 4090, RTX 3090).
  - Q4_K_P: 18 GB → GPU de 24 GB con margen, o 20 GB (RTX 4080, A4500).
  - IQ4_XS: 15 GB → GPU de 16 GB (RTX 4080, RTX 3080 Ti, V100 16 GB).
  - Q3_K_P: 14 GB → GPU de 16 GB.
  - IQ3_M: 13 GB → GPU de 16 GB.
  - IQ3_XS: 12 GB → GPU de 12-16 GB (RTX 3060 12 GB, RTX 4070).
  - Q2_K_P: 12 GB → GPU de 12 GB.
  - IQ2_M: 10 GB → GPU de 10-12 GB (RTX 3080 10 GB, RTX 4070).
  - mmproj-f16: 928 MB adicionales para el componente de visión.
- Las cuantizaciones Q8_K_P y Q6_K_P son viables en GPUs de consumo de gama alta (RTX 4090) para Q6; Q8 requiere hardware profesional.
- Despliegue compatible con llama.cpp, LM Studio y cualquier runtime que acepte GGUF. No se requieren builds especiales para los quants K_P, aunque LM Studio puede mostrar "?" en la columna de cuantización (problema de visualización únicamente).
- Para despliegue en producción con alta concurrencia, sería necesario convertir los pesos a safetensors y usar vLLM o TGI; no se proporcionan archivos safetensors en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Tasa de rechazo | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-27B-Uncensored-HauhauCS-Aggressive (este) | 27 B densos | 262K (hasta ~1M con YaRN) | Sí (imagen, vídeo) | 0/465 | Apache-2.0 |
| Qwen3.6-27B-Uncensored-HauhauCS-Balanced | 27 B densos | 262K (hasta ~1M con YaRN) | Sí (imagen, vídeo) | 0/465 | Apache-2.0 |
| Qwen3.6-27B (base) | 27 B densos | 262K (hasta ~1M con YaRN) | Sí (imagen, vídeo) | no disponible (presenta rechazos) | Apache-2.0 |

La diferencia principal entre Aggressive y Balanced es el comportamiento ante prompts delicados: Aggressive responde directamente sin preámbulos, mientras que Balanced razona en voz alta y puede incluir un disclaimer breve. El modelo base mantiene los mecanismos de rechazo originales. No se dispone de comparativas con otros modelos uncensored de tamaño similar (por ejemplo, versiones abliteradas de Llama o Mistral) en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: el modelo puede generar contenido ofensivo, peligroso, ilegal o éticamente problemático. Su uso en producción conlleva riesgos legales y reputacionales significativos.
- Riesgo de alucinación: al igual que el modelo base, puede inventar información, especialmente en dominios especializados o con prompts ambiguos. La ausencia de rechazos no corrige este comportamiento.
- Sesgos conocidos: hereda los sesgos del Qwen3.6-27B, que pueden amplificarse al no existir filtros que moderen respuestas polémicas.
- Limitaciones de idioma: el soporte principal es inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- Variante Aggressive: al omitir preámbulos y razonamiento previo en prompts delicados, las respuestas pueden ser más impredecibles y menos matizadas que las de la variante Balanced. La model card recomienda Balanced para el 99,9% de los usuarios.
- La licencia Apache-2.0 permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad sobre el contenido generado.
- No se han publicado benchmarks de rendimiento estándar que verifiquen que las capacidades se mantienen intactas respecto al modelo base; la afirmación se basa en la declaración del autor.
- Los quants K_P son personalizados de HauhauCS; aunque son compatibles con llama.cpp y LM Studio, no hay garantía de soporte en otros runtimes GGUF.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Aggressive
- Variante Balanced: https://huggingface.co/HauhauCS/Qwen3.6-27B-Uncensored-HauhauCS-Balanced
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Comunidad Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
