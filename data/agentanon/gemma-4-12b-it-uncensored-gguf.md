# AgentAnon/gemma-4-12B-it-uncensored-GGUF

## Resumen

`AgentAnon/gemma-4-12B-it-uncensored-GGUF` es la versión cuantizada en formato GGUF del modelo `TrevorJS/gemma-4-12B-it-uncensored`, que a su vez es una variante "abliterated" (sin mecanismos de rechazo) del modelo base `google/gemma-4-12B-it` de Google. El autor de esta publicación, AgentAnon, se limita a distribuir las cuantizaciones listas para su uso con llama.cpp, sin aportar modificaciones adicionales sobre los pesos originales.

El modelo resuelve un problema muy concreto: ofrecer una versión del Gemma 4 de 12B que no aplique rechazos ante peticiones que el modelo original consideraría sensibles, manteniendo al mismo tiempo el comportamiento general del modelo base. La técnica empleada para eliminar los rechazos es una abliteración biproyectada con preservación de norma, aplicada sobre los pesos del modelo instructivo original.

Con 11.907.350.576 parámetros totales (aproximadamente 11,9B) y una licencia Apache 2.0, el modelo está pensado para ejecución local en hardware de consumo mediante llama.cpp. La relevancia actual radica en que permite desplegar un modelo de tamaño medio sin restricciones de contenido en entornos controlados, si bien su única cuantización disponible en el repositorio (Q4_K_M y Q8_0) y su soporte exclusivo para inglés limitan su alcance en producción multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4_unified`; compatible con `Gemma4Unified` en llama.cpp) |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en los ejemplos de uso se emplea `-c 8192`) |
| Tipos de cuantización | Q4_K_M (7,4 GB), Q8_0 (12,7 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 20,1 GB) |

## Arquitectura y entrenamiento

El modelo deriva de `google/gemma-4-12B-it`, un transformer de aproximadamente 11,9B parámetros en su versión instructiva. Sobre esa base, `TrevorJS` aplicó una abliteración biproyectada con preservación de norma para eliminar el comportamiento de rechazo, técnica que proyecta las direcciones asociadas a la negativa fuera de las activaciones sin alterar la norma de los pesos. El resultado es `TrevorJS/gemma-4-12B-it-uncensored`, del cual esta publicación es una mera cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO específicas para esta variante. La model card remite a la del modelo bf16 original para detalles del método, tasas de rechazo antes y después, y validación cruzada entre datasets. La innovación técnica destacable es precisamente el proceso de abliteración, que busca preservar la calidad general del modelo mientras elimina los rechazos; no se documentan otras técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo Gemma 4 de 12B.
- Razonamiento general y respuesta a instrucciones sin mecanismos de rechazo ante contenido sensible.
- Generación de código y resolución de problemas matemáticos, según las capacidades del modelo base (no verificadas en esta ficha).
- Soporte de conversaciones multi-turno mediante el servidor `llama-server` con interfaz de chat web.
- Ejecución local en CPU y GPU a través de llama.cpp.
- Capacidades multilingües limitadas: la model card solo declara inglés.
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo sin rechazos frente a uno alineado, comparando respuestas sobre el mismo conjunto de prompts para analizar qué se elimina y qué se preserva tras la abliteración.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que el modelo original rechazaría, ejecutándose localmente con `llama-server` y Q4_K_M en una GPU de consumo.
- Prototipado local de asistentes conversacionales: despliegue rápido con `llama-server -m ... -c 8192` para probar flujos de chat multi-turno en inglés sin depender de APIs externas.
- Evaluación de cuantizaciones: comparación de la calidad de Q4_K_M frente a Q8_0 sobre el mismo modelo para decidir el compromiso entre tamaño (7,4 GB frente a 12,7 GB) y fidelidad de salida.
- Red teaming y pruebas de robustez: uso del modelo como generador de contenido adversario para evaluar filtros, clasificadores de seguridad o sistemas de moderación propios.
- Experimentación académica con modelos abliterated: reproducción de los resultados del repositorio `TrevorJS/gemma-4-abliteration` y análisis de la técnica de abliteración biproyectada sobre un modelo de 12B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,4 GB para Q4_K_M y 12,7 GB para Q8_0, a los que hay que sumar la memoria para el contexto (KV cache); con `-c 8192` el consumo adicional es moderado pero no cuantificado en la información disponible.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, Q4_K_M encaja en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y Q8_0 requiere 16 GB o más (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 8 GB o más; Q8_0 en tarjetas de 16 GB o más.
- Opciones de despliegue: llama.cpp (obligatorio un build del 4 de junio de 2026 o posterior, PR #24118, que añade soporte de conversión e inferencia `Gemma4Unified`); builds anteriores fallan al cargar los ficheros. El servidor `llama-server` expone una interfaz web en el puerto 8080.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AgentAnon/gemma-4-12B-it-uncensored-GGUF | 11,9B | no disponible | apache-2.0 | GGUF | Abliterated, solo inglés |
| TrevorJS/gemma-4-12B-it-uncensored | 11,9B | no disponible | no disponible | bf16 (safetensors) | Modelo fuente sin cuantizar |
| google/gemma-4-12B-it | 11,9B | no disponible | no disponible | no disponible | Modelo base alineado con rechazos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos, pero no garantiza la ausencia de contenido dañino, sesgado o factualmente incorrecto; el riesgo de alucinación persiste igual que en el modelo base.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado y puede degradarse.
- Requiere un build de llama.cpp del 4 de junio de 2026 o posterior; versiones anteriores no cargan los ficheros.
- La licencia Apache 2.0 se declara en esta publicación, pero conviene verificar las condiciones del modelo base `google/gemma-4-12B-it` antes de un uso comercial, ya que la información disponible no detalla la licencia del modelo original.
- El proceso de abliteración puede degradar sutilmente capacidades generales (razonamiento, código, matemáticas); no se aportan métricas que lo cuantifiquen.
- El repositorio tiene un uso muy bajo (292 descargas, 2 likes) y no cuenta con validación comunitaria extensa.
- No se documentan garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/AgentAnon/gemma-4-12B-it-uncensored-GGUF
- Modelo fuente bf16: https://huggingface.co/TrevorJS/gemma-4-12B-it-uncensored
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
- Código de la abliteración: https://github.com/TrevorS/gemma-4-abliteration
- PR de llama.cpp con soporte `Gemma4Unified`: https://github.com/ggml-org/llama.cpp/pull/24118
