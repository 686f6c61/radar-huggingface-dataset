# mradermacher/MiniCPM5-2B-Pashto-GGUF

## Resumen

MiniCPM5-2B-Pashto-GGUF es un repositorio de pesos cuantizados en formato GGUF generado por el usuario mradermacher a partir del modelo `nassimjp/MiniCPM5-2B-Pashto`. Se trata, por tanto, de una conversión y no de un entrenamiento original: el autor del GGUF aplica su pipeline habitual de cuantización estática (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) sobre un modelo base afinado para pastún (pashto). El nombre del repositorio indica una variante de la familia MiniCPM con aproximadamente 2.000 millones de parámetros, aunque este dato no viene confirmado de forma explícita en la información disponible.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: el repositorio no publica model card descriptiva, no declara licencia, idiomas ni pipeline, y acumula 0 descargas y 0 likes en el momento de la consulta. Su interés práctico reside en que ofrece el modelo base en múltiples niveles de cuantización (desde f16 hasta Q2_K e IQ4_XS), lo que permite desplegarlo en hardware de consumo mediante llama.cpp u Ollama, algo que el modelo original en precisión completa probablemente no permitiría en GPUs pequeñas.

No se ha encontrado documentación técnica adicional, paper, blog ni resultados de benchmarks asociados a esta conversión ni al modelo base en la búsqueda web realizada; los resultados obtenidos fueron irrelevantes (foros genéricos y herramientas de PDF) y no aportan información sobre el modelo. Todo lo no verificable se marca como "no disponible" a lo largo de la ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por linaje MiniCPM se infiere transformer decoder-only, sin confirmar en la informacion proporcionada) |
| Parametros totales | no disponible de forma explicita; el nombre del repositorio indica 2B |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible; el sufijo "Pashto" del modelo base sugiere pastun, sin confirmar |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversion de pesos HuggingFace, `convert_type: hf`) |
| Repositorio de origen | nassimjp/MiniCPM5-2B-Pashto |
| Version de cuantizacion | quantize_version: 2, output_tensor_quantised: 1 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada en el repositorio sobre la arquitectura del modelo subyacente ni sobre su proceso de entrenamiento. El campo `convert_type: hf` indica únicamente que la conversión se realizó desde pesos en formato HuggingFace hacia GGUF, no aporta detalles sobre el diseño de la red. Por el nombre (`MiniCPM5-2B`), cabe situarlo en la estirpe de modelos MiniCPM de pequeño tamaño, pero no se dispone de confirmación documental de capas, tipo de atención, vocabulario ni estrategia de entrenamiento.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, la posible aplicación de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El único proceso técnico documentado en la model card es el de cuantización: se han generado 12 variantes de precisión mediante el pipeline de cuantización estática de mradermacher, con tensores de salida cuantizados. No se indica qué tensores se excluyeron de la cuantización (`quants_skip` vacío) ni si se preservó un módulo multimodal (`skip_mmproj` vacío, sin información adicional).

## Capacidades

- Generación de texto conversacional: no confirmada explícitamente en la información disponible, pero es la función esperada de un modelo de la familia MiniCPM afinado para un idioma concreto.
- Razonamiento, matemáticas y generación de código: no disponible; no se ha publicado ninguna evaluación ni descripción de capacidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el sufijo del modelo base apunta a pastún, pero se desconoce si conserva capacidades en inglés u otros idiomas tras el ajuste.
- Capacidades especiales (modo thinking, visión, audio): no disponible. El campo `skip_mmproj` aparece vacío, lo que no permite concluir si existe un proyector multimodal.

## Casos de uso

Advertencia previa: dado que no se publican capacidades verificadas, los siguientes casos son hipótesis razonables basadas en el tamaño (~2B) y el idioma declarado en el nombre del modelo. Deben validarse empíricamente antes de cualquier uso en producción.

- Asistente conversacional en pastún: un modelo de ~2B cuantizado a Q4_K_M puede ejecutarse en local y servir respuestas en pastún en aplicaciones de chat o atención básica, siempre que se valide la calidad real del ajuste idiomático.
- Traducción asistida pastún-español/inglés: uso como motor de traducción en borradores, con revisión humana posterior, aprovechando el ajuste específico al idioma.
- Procesamiento de texto en entornos con conectividad limitada: al caber en GPUs de consumo, permite desplegar servicios de generación de texto sin depender de APIs externas.
- Clasificación y etiquetado de documentos en pastún: resumen, extracción de entidades o categorización de textos, previa evaluación de la calidad del modelo en estas tareas.
- Prototipado e investigación en lingüística computacional de lenguas de bajos recursos: el modelo permite experimentar con generación en pastún y comparar con otros ajustes.
- Filtrado y moderación de contenido en pastún: uso como primer nivel de cribado en plataformas que operan en este idioma, complementado con revisión humana.
- Educación y práctica del idioma: generación de ejercicios o diálogos de ejemplo para estudiantes de pastún.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, evaluación multilingüe ni ninguna otra, y la búsqueda web no ha devuelto documentación técnica asociada al modelo base ni a sus cuantizaciones.

## Requisitos de hardware

Las cifras siguientes son estimaciones de tamaño en disco/VRAM derivadas del número de parámetros indicado en el nombre del repositorio (~2B) y del tipo de cuantización. No proceden de mediciones publicadas por el autor y deben tratarse como aproximaciones orientativas.

| Cuantizacion | Peso aproximado | VRAM estimada con contexto moderado |
|---|---|---|
| x-f16 | ~4,0 GB | ~5-6 GB |
| Q8_0 | ~2,1 GB | ~3-4 GB |
| Q6_K | ~1,6 GB | ~2,5-3 GB |
| Q5_K_M / Q5_K_S | ~1,4 GB | ~2-3 GB |
| Q4_K_M / Q4_K_S | ~1,2 GB | ~2-2,5 GB |
| IQ4_XS | ~1,1 GB | ~2 GB |
| Q3_K_L / Q3_K_M / Q3_K_S | ~0,95-1,1 GB | ~1,5-2 GB |
| Q2_K | ~0,8 GB | ~1,5-2 GB |

- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 y superiores; RTX 3060/4060, RTX 4090 o GPUs profesionales (A100, H100) no son necesarias para un modelo de este tamaño, salvo por requisitos de concurrencia o throughput.
- Compatibilidad con GPU de consumo: sí, en principio cabe en GPUs de gama media y baja con cuantizaciones Q4_K_M o inferiores. La variante f16 requiere alrededor de 6 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y, potencialmente, servidores compatibles con GGUF. vLLM y TGI requieren normalmente pesos en safetensors o AWQ/GPTQ, por lo que no aplicarían directamente a estos ficheros sin conversión.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/MiniCPM5-2B-Pashto-GGUF | no disponible (nombre: 2B) | no disponible | no disponible | HuggingFace, 12 cuantizaciones GGUF |
| nassimjp/MiniCPM5-2B-Pashto (base) | no disponible (nombre: 2B) | no disponible | no disponible | HuggingFace, formato HuggingFace |
| Otras cuantizaciones GGUF de modelos ~2B | no disponible en la busqueda realizada | no disponible | no disponible | no disponible |

No se dispone de información verificada sobre modelos comparables en la misma categoría (modelos de ~2B afinados para pastún o lenguas de bajos recursos). La búsqueda web realizada no devolvió resultados pertinentes, por lo que la comparativa queda limitada al propio modelo base del que deriva esta conversión.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación sobre arquitectura, entrenamiento, datos, sesgos o evaluación. Cualquier uso en producción exige validación propia previa.
- Licencia no declarada: al no especificarse licencia ni en el repositorio GGUF ni en la información disponible, no puede asumirse permiso para uso comercial. Es imprescindible consultar el repositorio del modelo base antes de cualquier despliegue.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de consulta, lo que implica ausencia de validación comunitaria sobre la calidad de la cuantización.
- Riesgo de degradación por cuantización: las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de generación y la coherencia en idiomas de bajos recursos. Se recomienda Q4_K_M o superior para uso real.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se ha publicado ninguna evaluación que lo cuantifique.
- Sesgos: no disponibles. No se ha documentado la composición del corpus de entrenamiento ni el proceso de alineamiento.
- Limitaciones idiomáticas: se desconoce si el ajuste en pastún ha degradado capacidades en otros idiomas, algo habitual en ajustes específicos de un solo idioma.
- Contexto desconocido: al no declararse la longitud de contexto, no deben asumirse ventanas largas; hay que verificarla empíricamente antes de diseñar aplicaciones que dependan de contexto extenso.
- Trazabilidad limitada: al ser una conversión de terceros, no hay garantía de que la cuantización reproduzca fielmente el comportamiento del modelo original más allá de lo que permita el formato GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-Pashto-GGUF
- Modelo base: https://huggingface.co/nassimjp/MiniCPM5-2B-Pashto
- Papers, blogs, repositorios o demos adicionales: no disponible; la búsqueda web no devolvió resultados relevantes sobre este modelo.
