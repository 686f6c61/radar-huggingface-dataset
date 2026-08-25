# jlucasvt/Jiunsong-SuperQwen3.8-27b-abliterated-MTPLX

## Resumen

Jiunsong-SuperQwen3.8-27b-abliterated-MTPLX es un modelo de lenguaje convertido al formato MTPLX (multi-token prediction) para ejecutarse en Apple Silicon mediante MLX. Fue creado por el usuario jlucasvt a partir del modelo `Jiunsong/SuperQwen3.8-27b-abliterated`, que a su vez es una versión "abliterated" (sin censura) del modelo Qwen3.8-27B de Qwen. El modelo está cuantizado a 4 bits y los archivos safetensors muestran un total de 4.665.462.000 parámetros, aunque el nombre sugiere 27 mil millones, probablemente debido a la cuantización o a una conversión parcial.

La relevancia de este modelo radica en su doble particularidad: por un lado, hereda las capacidades del modelo base Qwen3.8-27B (un modelo denso de lenguaje y visión con 64 capas), y por otro, incorpora la técnica MTPLX, que permite predecir múltiples tokens a la vez, acelerando la inferencia en hardware de Apple. La verificación incluida en la model card indica un multiplicador de 2,43× respecto a la línea base autoregresiva, con una profundidad óptima D3, probado en un Apple M5 Max.

Al ser una variante "abliterated", el modelo no tiene los mecanismos de rechazo de contenido del original, lo que lo hace adecuado para experimentación sin restricciones, pero también implica riesgos de generación de contenido inapropiado. La licencia no está especificada en la información disponible, y el modelo está pensado exclusivamente para el ecosistema MLX/MTPLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con vision encoder (basado en Qwen3.8-27B), adaptado a MTPLX (multi-token prediction) |
| Parametros totales | 4.665.462.000 (según safetensors; el nombre sugiere 27B, posiblemente por cuantización) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (según tag) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card remite a un archivo LICENSE no especificado) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer denso con encoder de visión integrado, diseñado para tareas multimodales (texto, imagen y vídeo). La variante MTPLX modifica el mecanismo de decodificación para predecir varios tokens simultáneamente en lugar de uno solo, lo que reduce el número de pasos de inferencia. Esta conversión se realizó con la herramienta MTPLX Forge, que adapta los pesos del modelo original al formato MLX.

No se dispone de información sobre el entrenamiento del modelo base ni sobre el proceso de "abliteration" (eliminación de censura). Tampoco hay datos sobre el dataset, el número de tokens de entrenamiento o el uso de técnicas como RLHF o DPO. La model card solo indica que el modelo fue "forjado" a partir de `Jiunsong/SuperQwen3.8-27b-abliterated` y que la verificación se realizó con un sampler de temperatura 0.6, top_p 0.95 y top_k 20.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, que incluyen razonamiento complejo, matemáticas y comprensión lectora.
- Generación de código: el modelo base está optimizado para tareas de programación, por lo que esta variante debería mantener esa capacidad.
- Comprensión de imágenes y vídeo: al ser un modelo de visión-lenguaje, puede procesar entradas visuales y responder preguntas sobre ellas.
- Tool calling y funciones: el modelo base soporta llamadas a herramientas y ejecución de funciones, aunque no hay confirmación específica para esta variante.
- Capacidades multilingües: no se especifican idiomas, pero el modelo base de Qwen suele ser multilingüe (principalmente inglés y chino).
- Multi-token prediction (MTPLX): capacidad específica de esta variante, que permite predecir varios tokens a la vez, acelerando la inferencia en Apple Silicon.
- Sin censura (abliterated): el modelo no tiene los mecanismos de rechazo de contenido del original, lo que permite generar respuestas sin restricciones de seguridad.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo está optimizado para MLX y MTPLX, por lo que puede ejecutarse en portátiles y equipos de escritorio de Apple con buen rendimiento. Se usa con el comando `mtplx pull` y `mtplx start chat`.
- Prototipado rápido de aplicaciones de chat sin censura: al ser abliterated, es útil para experimentar con generación de texto libre en entornos de investigación, siempre que se asuman los riesgos.
- Desarrollo de asistentes de código en local: gracias a su capacidad de generación de código y tool calling, puede integrarse en entornos de desarrollo que requieran privacidad y ejecución sin conexión.
- Análisis de imágenes y vídeo en dispositivos Apple: al heredar la visión del modelo base, puede usarse para tareas de descripción de imágenes o resumen de vídeo en aplicaciones macOS.
- Evaluación de técnicas de multi-token prediction: investigadores pueden comparar el rendimiento de MTPLX frente a la decodificación autoregresiva estándar usando este modelo como referencia.
- Generación de contenido creativo sin restricciones: escritores o creadores pueden usarlo para explorar estilos o temas que los modelos censurados evitarían, siempre con responsabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento incluida es la verificación de MTPLX:

- Mejor profundidad (best depth): D3
- Multiplicador frente a línea base autoregresiva: 2,43×
- Verificado en: Apple M5 Max
- Sampler: temperatura 0.6, top_p 0.95, top_k 20

Estos datos indican que la predicción multi-token acelera la generación en un factor de 2,43 en comparación con la decodificación token a token, pero no hay comparaciones con otros modelos.

## Requisitos de hardware

- Diseñado para Apple Silicon (M1, M2, M3, M4, M5 y superiores) con MLX.
- Verificado en Apple M5 Max; se espera que funcione en otros chips con suficiente memoria unificada.
- No se especifica la VRAM, pero al ser un modelo de ~4,6B parámetros en 4 bits, necesitará al menos 8-16 GB de memoria unificada (estimación razonable, no confirmada).
- Despliegue mediante MTPLX: `mtplx pull <owner>/Jiunsong-SuperQwen3.8-27b-abliterated-MTPLX` y `mtplx start chat`.
- No se menciona compatibilidad con vLLM, llama.cpp u otros runners; el formato MLX limita su uso al ecosistema de Apple.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jiunsong-SuperQwen3.8-27b-abliterated-MTPLX (este) | 4,66B (safetensors) | no disponible | no disponible | MLX (MTPLX) | Sin censura, multi-token prediction |
| Jiunsong/SuperQwen3.8-27b-abliterated-MLX-4bit | no disponible | no disponible | no disponible | MLX 4-bit | Variante MLX sin MTPLX |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | 27B (presumible) | no disponible | no disponible | no disponible | Otra variante abliterated |
| Qwen3.8-27B (original) | 27B | no disponible | Apache 2.0 (presumible) | safetensors | Modelo base con censura |

No hay datos de rendimiento comparativo entre estas variantes. La comparativa se basa en características cualitativas.

## Limitaciones y advertencias

- Al ser un modelo "abliterated", no tiene filtros de seguridad: puede generar contenido ofensivo, ilegal o peligroso. No debe usarse en producción sin supervisión humana.
- La licencia no está especificada: el archivo LICENSE no se detalla en la model card, lo que genera incertidumbre sobre su uso comercial o redistribución.
- El formato MTPLX es específico de Apple Silicon: no es compatible con GPUs NVIDIA o AMD, ni con servidores Linux estándar.
- No hay información sobre la longitud de contexto real, lo que limita su uso en tareas que requieran ventanas largas.
- Los parámetros totales (4,66B) no coinciden con el nombre "27b", lo que sugiere que la cuantización o la conversión MTPLX puede haber alterado la arquitectura; se recomienda verificar el comportamiento real.
- No se han publicado benchmarks estándar, por lo que su rendimiento en tareas comunes (MMLU, HumanEval) es desconocido.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlucasvt/Jiunsong-SuperQwen3.8-27b-abliterated-MTPLX
- Repositorio MTPLX Forge: https://github.com/youssofal/MTPLX
- Variante MLX 4-bit del modelo base: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-MLX-4bit
- Otra variante abliterated: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Página de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Página de Qwen3.8 27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
