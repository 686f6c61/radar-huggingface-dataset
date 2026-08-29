# rin960/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive

## Resumen

El modelo `rin960/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive` es una variante "uncensored" del modelo Qwen3.5-9B de Alibaba, publicada originalmente por el usuario HauhauCS y re-subida por rin960. El objetivo es eliminar los rechazos del modelo original ante peticiones que el sistema de seguridad considera problemáticas, manteniendo intactas las capacidades técnicas. Según la model card, el fine-tuning logra 0 rechazos en 465 prompts de prueba sin pérdida de capacidades.

Se trata de un modelo denso de aproximadamente 9.000 millones de parámetros con una arquitectura híbrida que combina atención lineal Gated DeltaNet y atención softmax completa en proporción 3:1. Soporta un contexto nativo de 262.000 tokens, ampliable a 1M con YaRN, y es nativamente multimodal (texto, imagen y vídeo). El modelo se distribuye en formato GGUF con varias cuantizaciones, lo que facilita su ejecución en hardware de consumo mediante llama.cpp, LM Studio u otros runtimes compatibles.

La relevancia de este modelo radica en su doble vertiente: por un lado, demuestra que es posible eliminar los mecanismos de rechazo sin degradar el rendimiento técnico; por otro, plantea riesgos éticos y legales importantes al generar contenido potencialmente dañino sin filtros. Está pensado para desarrolladores que necesitan un LLM sin restricciones en entornos controlados, aunque su uso en producción debe evaluarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + softmax attention (ratio 3:1), 32 capas |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativo, ampliable a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | 201 idiomas (vocabulario de 248K), incluye inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj para el encoder de visión) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.5-9B, un modelo denso de 32 capas con una combinación innovadora de mecanismos de atención: un 75% de capas utilizan Gated DeltaNet, una forma de atención lineal eficiente en memoria, y el 25% restante emplea atención softmax completa. Esta hibridación busca reducir el coste computacional en contextos largos sin sacrificar la calidad. El modelo incorpora además predicción multi-token (MTP) y un vocabulario ampliado de 248.000 entradas que cubre 201 idiomas.

El proceso de entrenamiento de esta variante consistió en un fine-tuning específico para eliminar los rechazos del modelo original. Según la model card, no se modificaron los datasets ni las capacidades; únicamente se ajustaron los pesos para que el modelo responda siempre, incluso ante peticiones que el modelo base rechazaría. No se han publicado detalles sobre el dataset de fine-tuning, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La variante "aggressive" es más agresiva en la eliminación de rechazos que una posible versión "balanced" que podría publicarse posteriormente.

## Capacidades

- Generación de texto en 201 idiomas, con especial dominio de inglés y chino.
- Razonamiento y pensamiento paso a paso mediante un modo "thinking" activado por defecto, que requiere mantener al menos 128K de contexto para funcionar correctamente.
- Procesamiento multimodal nativo: acepta entradas de texto, imagen y vídeo gracias al encoder de visión incluido (mmproj).
- Soporte de predicción multi-token (MTP), que puede acelerar la generación en runtimes compatibles.
- Capacidad de manejar contextos muy largos (262K nativo, hasta 1M con YaRN), adecuado para tareas que requieren memoria extensa.
- Sin rechazos: el modelo responde a cualquier petición, aunque puede añadir un descargo de responsabilidad al final de la respuesta (por ejemplo, "esto es información general, no asesoramiento legal").
- Compatible con herramientas de inferencia estándar como llama.cpp, LM Studio, Jan, koboldcpp, vLLM, SGLang y KTransformers.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, poesía o guiones sobre temas tabú o controvertidos sin rechazos, útil para escritores que exploran límites éticos en entornos de investigación.
- Análisis de documentos extensos: gracias a su contexto de 262K tokens, puede resumir o extraer información de libros completos, informes legales o expedientes técnicos en una sola pasada.
- Asistencia en investigación académica sobre sesgos y seguridad en IA: los investigadores pueden estudiar cómo responde el modelo a prompts delicados y comparar con versiones con filtros, sin necesidad de sortear rechazos.
- Procesamiento multimodal de vídeo e imágenes: el modelo puede describir o responder preguntas sobre contenido visual, por ejemplo, para generar subtítulos descriptivos o analizar fotogramas en aplicaciones de archivado.
- Desarrollo de agentes conversacionales en entornos controlados: en plataformas de simulación o juegos de rol, donde se requiere que el personaje responda de forma ininterrumpida a cualquier interacción del usuario.
- Evaluación de la robustez de los sistemas de moderación: al ser un modelo sin rechazos, puede usarse como generador de prompts adversarios para probar los filtros de contenido de otros sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que no hay pérdida de capacidades respecto al modelo base Qwen3.5-9B, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estándar. Tampoco se ofrecen comparativas con otros modelos similares.

## Requisitos de hardware

- La cuantización Q4_K_M (5,3 GB) puede ejecutarse en GPUs de consumo con 8 GB de VRAM, como una RTX 3060 o RTX 4060.
- La Q6_K (6,9 GB) requiere al menos 10-12 GB de VRAM, apta para RTX 3080/4080 o similares.
- La Q8_0 (8,9 GB) necesita unos 12-16 GB de VRAM, recomendable en RTX 3090, RTX 4090 o A10.
- La versión BF16 (17 GB) requiere al menos 24 GB de VRAM, como una A100, RTX 4090 o A6000.
- Para el modo "thinking" se recomienda mantener un contexto mínimo de 128K, lo que incrementa el consumo de memoria y puede requerir GPUs con mayor VRAM o el uso de técnicas de atención eficiente.
- Para producción y alto rendimiento se sugiere vLLM, SGLang o KTransformers; para uso local, llama.cpp, LM Studio, Jan o koboldcpp.
- La latencia y el throughput dependen en gran medida del hardware y de la cuantización; no se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. El modelo es una variante de Qwen3.5-9B, por lo que su rendimiento técnico debería ser similar al de este último, pero no se han facilitado datos de benchmarks que permitan una comparación objetiva. Tampoco se mencionan alternativas de la misma categoría (modelos uncensored de tamaño similar).

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. Su uso en aplicaciones públicas o comerciales conlleva un riesgo legal y reputacional significativo.
- El modelo puede alucinar, especialmente en contextos largos o con prompts ambiguos, y al no tener filtros, las alucinaciones pueden ser más difíciles de detectar.
- Aunque la model card afirma que no hay pérdida de capacidades, no se han publicado evaluaciones independientes que lo confirmen.
- El modelo puede añadir descargos de responsabilidad al final de las respuestas, lo que podría interferir en aplicaciones que requieren salidas limpias.
- Para mantener el modo "thinking" es necesario usar un contexto de al menos 128K tokens, lo que limita su uso en hardware con poca memoria.
- La arquitectura es nueva (lanzada en marzo de 2026) y el soporte en llama.cpp es reciente; es posible que existan bugs o incompatibilidades en algunos runtimes.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por el modelo puede violar leyes de propiedad intelectual, difamación o normativas de protección de datos, responsabilidad que recae en el usuario final.

## Enlaces

- Repositorio en Hugging Face (rin960): https://huggingface.co/rin960/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Repositorio original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Artículo en The Neural Feed: https://theneuralfeed.com/article/qwen3-5-9b-uncensored-aggressive-release-gguf/a89xQkUh
- Página en Grokipedia: https://grokipedia.com/page/Qwen35-9B-Uncensored-HauhauCS-Aggressive
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
