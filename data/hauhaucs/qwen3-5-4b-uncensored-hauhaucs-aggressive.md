# HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-Aggressive es un modelo de lenguaje derivado del Qwen3.5-4B de Alibaba, modificado por el usuario HauhauCS para eliminar los mecanismos de rechazo (refusals) del modelo original. Según su autor, el modelo presenta 0 rechazos en 465 pruebas y mantiene intactas las capacidades del modelo base, aunque un análisis independiente sugiere que la afirmación de "pérdida cero" no se sostiene por completo. Se distribuye en formato GGUF, lo que facilita su uso en entornos de inferencia local como llama.cpp, LM Studio u Ollama.

El modelo emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención softmax completa en proporción 3:1, con 32 capas y 4.205 millones de parámetros. Dispone de un contexto nativo de 262.000 tokens, ampliable a 1M mediante YaRN, y es nativamente multimodal (texto, imagen y vídeo) gracias a un encoder de visión incluido en el repositorio. Su licencia Apache 2.0 permite uso comercial sin restricciones, y soporta 201 idiomas con un vocabulario de 248.000 tokens.

La relevancia de este modelo radica en su carácter "uncensored" en un formato compacto de 4B, lo que lo hace atractivo para desarrolladores que necesitan respuestas sin filtros en aplicaciones de generación de contenido, roleplay o investigación, manteniendo un rendimiento razonable en hardware de consumo. Sin embargo, la ausencia de datos de benchmarks publicados y las advertencias sobre la integridad de la eliminación de rechazos obligan a una evaluación cuidadosa antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + softmax attention completa (ratio 3:1), 32 capas |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativo, extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | 201 idiomas (en, zh, multilingual) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con encoder de visión mmproj separado) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, que emplea una arquitectura híbrida innovadora: combina capas de atención lineal Gated DeltaNet con capas de atención softmax completa en una proporción de 3:1. Esta mezcla busca reducir el coste computacional del procesamiento de secuencias largas manteniendo la calidad de la atención global. El modelo cuenta con 32 capas y un vocabulario de 248.000 tokens, lo que le permite cubrir 201 idiomas.

El proceso de "uncensoring" aplicado por HauhauCS consiste en una técnica de abliteration, que modifica los pesos del modelo para eliminar las respuestas de rechazo sin reentrenar sobre nuevos datos. Según el autor, no se han alterado los datasets ni las capacidades originales, y el resultado es un modelo que responde a cualquier prompt sin negarse. Sin embargo, un análisis independiente (publicado en nathan.sapwell.net) indica que la afirmación de "lossless" no se cumple del todo: se observan divergencias KL significativas respecto al modelo base, especialmente en modelos de mayor tamaño, y la tasa de rechazos no es exactamente cero en todos los casos. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso exacto de fine-tuning.

## Capacidades

- Generación de texto sin filtros: responde a cualquier prompt sin rechazos, incluyendo temas sensibles o controvertidos.
- Razonamiento multi-paso: soporta modos de pensamiento (thinking) y no-pensamiento, con configuraciones de temperatura recomendadas por los autores de Qwen.
- Multimodalidad nativa: procesa entradas de texto, imagen y vídeo mediante el encoder de visión mmproj incluido en el repositorio.
- Multi-token prediction (MTP): capacidad de predecir varios tokens a la vez, lo que puede mejorar la velocidad de generación.
- Soporte de contexto largo: 262K tokens nativos, ampliables a 1M con YaRN, adecuado para documentos extensos o conversaciones prolongadas.
- Multilingüismo: 201 idiomas cubiertos, con especial énfasis en inglés y chino.
- Tool calling y function calling: aunque no se documenta explícitamente, al estar basado en Qwen3.5 se espera compatibilidad con estas funciones (no confirmado en la información disponible).
- Compatibilidad con runtimes estándar: funciona con llama.cpp, LM Studio, Jan, koboldcpp y Ollama, entre otros.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y creadores pueden usar el modelo para producir narrativas, diálogos o guiones que aborden temas tabú o explícitos sin que el modelo se niegue, gracias a su eliminación de rechazos.
- Roleplay y simulación de personajes: en aplicaciones de chat o juegos de rol, el modelo puede interpretar personajes con personalidades complejas o controversiales sin romper la inmersión con respuestas de rechazo.
- Investigación en seguridad y alineación de IA: los investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de seguridad para analizar sesgos, riesgos de alucinación o la efectividad de técnicas de abliteration.
- Asistencia en entornos de baja restricción: en contextos donde se requiere información directa sin rodeos (por ejemplo, generación de respuestas para foros o comunidades con políticas laxas), el modelo ofrece respuestas completas sin negativas.
- Procesamiento de documentos largos: gracias a su contexto de 262K tokens, puede resumir o analizar libros completos, expedientes legales o informes extensos en una sola pasada, incluso con entradas multimodales (imágenes o vídeos incrustados).
- Despliegue en hardware de consumo: al ser un modelo de 4B con cuantizaciones GGUF, puede ejecutarse en GPUs de gama media (8-12 GB VRAM) para aplicaciones de chatbot local o asistentes personales sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K u otros estándares, y el análisis independiente encontrado se centra en la divergencia KL y la tasa de rechazos, no en rendimiento de tareas. Se recomienda evaluar el modelo en el caso de uso específico antes de adoptarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (2.6 GB de peso) se puede ejecutar en GPUs con 4-6 GB de VRAM; con Q8_0 (4.2 GB) se necesitan 6-8 GB; con BF16 (7.9 GB) se requieren al menos 10-12 GB.
- GPUs recomendadas: RTX 3060/4060 (12 GB) para Q4_K_M o Q6_K; RTX 3090/4090 (24 GB) para BF16 o para manejar el contexto máximo de 262K tokens sin degradación.
- Si cabe en consumer GPU: sí, las variantes cuantizadas caben en GPUs de consumo modernas, aunque el contexto largo (262K) puede requerir más memoria de la disponible en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (compilación reciente), LM Studio, Jan, koboldcpp, Ollama (vía repositorio de GitHub), vLLM, SGLang o KTransformers para producción de alto rendimiento.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 30-50 tokens/segundo, pero es una estimación orientativa sin confirmación oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | 262K | Híbrida DeltaNet + softmax | Apache 2.0 | safetensors, GGUF | Modelo original con rechazos intactos |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4B | 262K | Híbrida DeltaNet + softmax | Apache 2.0 | GGUF | Variante sin rechazos, multimodal |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B | no disponible | Híbrida (presumiblemente) | Apache 2.0 | GGUF | Variante mayor del mismo autor, sin datos de contexto |

No se dispone de información suficiente sobre otros modelos uncensored de la misma categoría (por ejemplo, variantes de Huihui o Heretic) para realizar una comparativa cuantitativa. La comparativa se limita a los modelos de la misma familia HauhauCS y al base.

## Limitaciones y advertencias

- La afirmación de "lossless" (pérdida cero de capacidades) no está respaldada por análisis independientes: un estudio de abliteration muestra divergencias KL significativas respecto al modelo base, lo que sugiere que algunas capacidades pueden haberse degradado ligeramente.
- La tasa de rechazos no es exactamente cero en todos los escenarios: el mismo análisis encontró casos donde el modelo aún produce respuestas de rechazo, contradiciendo la afirmación de "0/465 refusals".
- Riesgo de alucinación: al ser un modelo sin filtros, puede generar información falsa o dañina con mayor confianza, especialmente en temas sensibles donde no tiene datos suficientes.
- Sesgos inherentes: el modelo base Qwen3.5 puede contener sesgos culturales o de género que no se han corregido en el proceso de uncensoring.
- Contexto largo: aunque soporta 262K tokens, el rendimiento real con contextos extremos puede degradarse si no se mantiene al menos 128K de contexto para preservar el modo de pensamiento, según las recomendaciones del autor.
- Compatibilidad de software: al ser una arquitectura nueva (lanzada en marzo de 2026), requiere versiones recientes de llama.cpp u otros runtimes; versiones antiguas pueden no funcionar correctamente.
- Uso responsable: al eliminar los mecanismos de rechazo, el modelo puede generar contenido inapropiado, ilegal o éticamente cuestionable. El desarrollador debe asumir la responsabilidad de su uso y aplicar sus propios filtros si es necesario.
- Sin datos de benchmarks: la ausencia de métricas de rendimiento publicadas dificulta la comparación objetiva con otros modelos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive)
- [Modelo base Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Análisis independiente de abliteration (Nathan Sapwell)](https://nathan.sapwell.net/posts/hauhaucs-abliteration-analysis/)
- [Repositorio de despliegue en Colab con Ollama (GitHub)](https://github.com/CookieFilled/qwen-3.5-4B-uncensored-colab)
- [Variante 9B del mismo autor](https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive)
- [Perfil del autor HauhauCS](https://huggingface.co/HauhauCS)
- [Discord de HauhauCS](https://discord.gg/SZ5vacTXYf)
