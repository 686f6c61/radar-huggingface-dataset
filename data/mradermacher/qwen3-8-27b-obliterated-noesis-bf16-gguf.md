# mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-GGUF` es una cuantización en formato GGUF del modelo base `AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16`, que a su vez es una versión "obliterated" (abliterada) del modelo Qwen3.8-27B de la serie Qwen3.8. La abliteración elimina las negativas de seguridad del modelo original, dando como resultado un modelo sin censura aparente, orientado a investigación y red teaming. El cuantizador, mradermacher, ha generado una serie de archivos GGUF estáticos con distintos niveles de precisión, desde Q2_K hasta Q8_0, además de archivos mmproj para soporte multimodal (visión).

Con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), este modelo se posiciona en la gama media-alta de modelos de lenguaje. Según fuentes externas, soporta un contexto de 262.000 tokens, visión y predicción multi-token (MTP), aunque estos datos no aparecen en la model card oficial. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque algunas fuentes indican restricciones de uso exclusivo para investigación. Es relevante porque ofrece una alternativa local, sin censura y con capacidades multimodales, para desarrolladores que necesitan ejecutar un modelo de 27B en hardware de consumo mediante llama.cpp u Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.8, probablemente transformer denso) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (según fuentes externas, no confirmado en la model card) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0; mmproj: Q8_0 y f16 |
| Idiomas soportados | en, ru, zh, ja, kk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por el nombre y la serie Qwen3.8, se infiere que se trata de un transformer denso, pero no se confirma en la model card. El modelo base `AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16` es una versión abliterada de Qwen3.8-27B, lo que implica que se han eliminado los mecanismos de rechazo de contenido no seguro mediante técnicas de intervención en los pesos (abliteration). No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO). El cuantizador mradermacher ha generado cuantizaciones estáticas sin usar imatrix, según indica en la model card. Se menciona la presencia de archivos mmproj, lo que sugiere que el modelo base incluye un proyector multimodal para visión, y el tag "mtp" indica soporte de predicción multi-token, aunque no se dan detalles técnicos.

## Capacidades

- Generación de texto y conversación multilingüe (inglés, ruso, chino, japonés, kazajo, vietnamita).
- Soporte multimodal (visión) mediante los archivos mmproj incluidos, lo que permite procesar imágenes junto con texto.
- Predicción multi-token (MTP), que puede mejorar la velocidad de generación en inferencia.
- Al ser una versión abliterada, no presenta los rechazos de seguridad típicos de los modelos Qwen estándar, lo que permite generar contenido que otros modelos bloquean.
- Compatible con el ecosistema llama.cpp y Ollama, lo que facilita su ejecución local en CPU y GPU.
- No se confirma soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Investigación en seguridad y red teaming: el modelo permite probar técnicas de jailbreak y evaluar la robustez de los sistemas de moderación, gracias a su naturaleza abliterada.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieren explorar temas sensibles sin filtros automáticos.
- Análisis de documentos con visión: al incluir mmproj, puede procesar imágenes y extraer información de capturas, diagramas o documentos escaneados, útil en entornos de investigación.
- Chatbots locales para entornos aislados: al ser GGUF, se puede desplegar en máquinas sin conexión a internet, garantizando privacidad de los datos.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden probar ideas de productos sin depender de APIs externas, usando cuantizaciones ligeras como Q4_K_M.
- Traducción y procesamiento multilingüe: con soporte para seis idiomas, puede servir como base para sistemas de traducción automática o asistentes multilingües en entornos de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas comparativas para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo GGUF):
  - Q2_K: 11,0 GB → cabe en GPUs de 12 GB (ej. RTX 3060, RTX 4070)
  - Q3_K_M: 13,6 GB → requiere 16 GB (ej. RTX 4080, RTX 4090)
  - Q4_K_M: 16,9 GB → requiere 20-24 GB (ej. RTX 3090, RTX 4090)
  - Q8_0: 29,1 GB → requiere 32 GB o más (ej. A100, RTX A6000)
- GPU recomendadas: RTX 3090/4090 para cuantizaciones Q4 y superiores; A100 o H100 para Q8_0 o inferencia de alta velocidad.
- En CPU, se puede ejecutar con llama.cpp, pero la velocidad será baja; se recomienda al menos 32 GB de RAM para cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores compatibles con GGUF como text-generation-webui.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | 262K (según fuentes) | Apache 2.0 | Safetensors | Modelo base con moderación de contenido |
| Qwen3.8-27B-Obliterated-NOESIS-BF16 (este) | 27,3B | 262K (según fuentes) | Apache 2.0 | GGUF | Versión abliterada, sin censura, con visión y MTP |
| Otras versiones GGUF de Qwen3.8-27B (ej. mradermacher/Qwen3.8-27B-OBLITERATED-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Similar, pero sin el repack NOESIS |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia es el proceso de abliteración y el empaquetado NOESIS, que puede incluir optimizaciones adicionales no documentadas.

## Limitaciones y advertencias

- Al ser un modelo abliterado, puede generar contenido ofensivo, ilegal o peligroso sin restricciones; su uso debe limitarse a entornos de investigación controlados.
- Riesgo elevado de alucinaciones, especialmente en tareas factuales, debido a la eliminación de mecanismos de seguridad que también actúan como filtros de plausibilidad.
- La longitud de contexto de 262K no está confirmada en la model card; puede variar según la implementación y la cuantización.
- Solo soporta seis idiomas; el rendimiento en otros idiomas puede ser deficiente.
- La licencia Apache 2.0 permite uso comercial, pero algunas fuentes externas indican restricciones de uso exclusivo para investigación; se recomienda verificar con el autor del modelo base.
- Las cuantizaciones estáticas no incluyen imatrix, lo que puede afectar la calidad de la perplejidad en comparación con quants imatrix de otros autores.
- No se garantiza soporte de tool calling ni function calling, lo que limita su uso en agentes autónomos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Obliterated-NOESIS-BF16-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Blog sobre la versión uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
