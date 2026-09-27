# huihui-ai/GLM-5.3-Flash-abliterated-GGUF

# GLM-5.3-Flash-abliterated-GGUF (huihui-ai): ficha técnica

## Resumen

GLM-5.3-Flash-abliterated-GGUF es una versión sin censura (abliterated) del modelo multimodal zai-org/GLM-5.3-Flash, publicada por huihui-ai, un colectivo conocido por sus trabajos de ablación de direcciones de rechazo en modelos abiertos. El repositorio contiene pesos en formato GGUF generados a partir de la conversión de unsloth/GLM-5.3-Flash-GGUF, y está pensado para ejecutarse en llama.cpp mediante una rama específica del proyecto (glm5next/upstream). Con 320.759.404.382 parámetros totales (unos 320,8 mil millones) y un ejemplo de uso con ventana de 262.144 tokens, se trata de un modelo de gran escala orientado a entornos con múltiples GPU.

La intervención de abliteración es parcial y quirúrgica: según la model card, solo se han ablacionado las capas 15 a 35 (indexación basada en 0), mientras que el resto de capas y todos los módulos de expertos permanecen intactos. Esto implica que la propia arquitectura del modelo base incorpora módulos de expertos (MoE), aunque el número de parámetros activos no se documenta. El resultado es un modelo que conserva la mayor parte de la estructura original, pero con el filtrado de seguridad significativamente reducido.

El interés actual del modelo es fundamentalmente de investigación: permite estudiar el comportamiento de un LLM multimodal de gran tamaño cuando se eliminan las direcciones de rechazo, sirve como base para experimentos de red-teaming, evaluación de alineamiento y generación de datos sintéticos en dominios donde los modelos alineados rechazan responder. Su licencia MIT facilita el uso, pero el propio autor desaconseja su empleo directo en producción o en aplicaciones de cara al público. El modelo se publicó el 26 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 13 likes y 0 descargas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) con módulos de expertos (MoE) según la model card; detalles de atención y capas no disponibles |
| Parámetros totales | 320.759.404.382 (~320,8 B) |
| Parámetros activos | no disponible (la model card menciona "expert modules", lo que confirma arquitectura MoE, pero no se publica el número de parámetros activos) |
| Longitud de contexto | 262.144 tokens (256 K), según el ejemplo de `llama-cli -c 262144` de la model card |
| Tipos de cuantización | GGUF; el ejemplo documentado usa UD-Q4_K_XL; el tag `imatrix` indica cuantización con importance matrix; el resto de variantes no disponibles |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 200,9 GB); el conteo de parámetros procede de metadatos safetensors del modelo base |

## Arquitectura y entrenamiento

El modelo base es zai-org/GLM-5.3-Flash, un sistema multimodal del que no se detallan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. La model card del repositorio de huihui-ai solo confirma que se trata de un modelo con módulos de expertos (MoE), dado que la ablación se aplicó únicamente a las capas densas 15-35 y se dejó explícitamente sin tocar el resto de capas y "all expert modules". La tag `glm5_next` sugiere una generación interna de la familia GLM, pero no se aportan especificaciones de atención, número de capas totales ni ratio de activación.

La innovación técnica de este repositorio no está en el entrenamiento, sino en el post-procesado: se aplica abliteración siguiendo la técnica implementada en el proyecto remove-refusals-with-transformers de Sumandora, que localiza la dirección de rechazo en el espacio de activaciones y la proyecta fuera de los pesos. En esta versión concreta la intervención es limitada (capas 15-35, indexación 0-based), lo que la convierte en una ablación más conservadora que las versiones que modifican todas las capas. Los pesos GGUF provienen de la conversión de unsloth, con cuantizaciones dinámicas (UD) y uso de importance matrix, y requieren un fork de llama.cpp mantenido por unslothai para el soporte de esta arquitectura.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), lo que permite tareas de comprensión visual y respuesta multimodal.
- Ventana de contexto de hasta 262.144 tokens, adecuada para documentos largos, repositorios de código extensos o historiales de conversación prolongados.
- Salida sin filtrado de rechazos en las capas ablacionadas: el modelo tiende a responder a peticiones que un modelo alineado estándar rechazaría.
- Uso en modo conversacional (tag `conversational`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles; la modalidad documentada es imagen-texto.

## Casos de uso

- Investigación sobre alineamiento y rechazo: el modelo permite comparar las activaciones y respuestas de un LLM de 320 B antes y después de proyectar fuera la dirección de rechazo en las capas 15-35, sirviendo como sujeto de estudio en experimentos de interpretabilidad.
- Red-teaming y evaluación de seguridad: al tener reducido el filtrado, es útil como generador adversario para probar clasificadores de contenido, guardarraíles y sistemas de moderación antes de desplegarlos.
- Generación de datos sintéticos en dominios sensibles: para crear conjuntos de datos de entrenamiento o evaluación en áreas donde los modelos alineados se niegan a responder (por ejemplo, descripciones médicas explícitas o escenarios de seguridad ofensiva), siempre en un entorno controlado y con revisión posterior.
- Análisis de documentos largos multimodales: con 256 K de contexto y entrada de imagen, puede procesar informes escaneados, planos o documentación técnica extensa junto con su texto asociado en una única pasada, sin trocear el material.
- Asistencia a la investigación académica en chino e inglés: traducción, resumen y extracción de información entre ambos idiomas aprovechando el soporte bilingüe declarado.
- Escritura creativa y de ficción sin restricciones temáticas: relatos, guiones o narrativa que aborden violencia, contenido adulto o temas controvertidos, en contextos editoriales donde el filtrado estándar resulta un obstáculo.
- Auditoría de modelos: uso como referencia para medir cuánto cambia el comportamiento (toxicidad, veracidad, coherencia) al aplicar una ablación parcial frente a una total, comparando con otras versiones del mismo colectivo.
- Despliegue en pipelines de inferencia locales con llama.cpp: gracias a las cuantizaciones GGUF con imatrix, es viable integrarlo en infraestructuras propias con varias GPU y sin dependencia de APIs externas, por ejemplo para procesamiento off-line de lotes de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Estimación a partir del número de parámetros (320,8 B), sin datos oficiales del autor:
- Precisión completa (bf16/fp16): unos 640 GB solo de pesos, más caché KV; requiere nodos multi-GPU (por ejemplo, 8×H100 80 GB o más).
- Cuantización Q8: del orden de 340 GB de pesos; fuera del alcance de estaciones de trabajo de una sola GPU.
- Cuantización Q4_K_XL (la del ejemplo documentado): aproximadamente 180-200 GB de pesos con overhead; encaja en configuraciones como 3×H100 80 GB, 2×H200 141 GB o 4×A100 80 GB.
- GPU recomendadas: H100 80 GB, H200 141 GB, A100 80 GB en configuraciones múltiples. No hay datos oficiales de latencia ni throughput.
- GPU de consumo: no cabe en una sola GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 quedarían muy lejos incluso en Q4; sería necesario repartir el modelo entre varias GPU de consumo (por ejemplo, 8 unidades de 24 GB), una configuración al límite y con rendimiento degradado por el ancho de banda.
- Opciones de despliegue: llama.cpp mediante la rama `glm5next/upstream` del fork de unslothai (requisito explícito de la model card); el repositorio se etiqueta también con `transformers`. Soporte de vLLM, TGI u Ollama para esta arquitectura concreta: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Abliteración | Disponibilidad |
|---|---|---|---|---|---|---|
| huihui-ai/GLM-5.3-Flash-abliterated-GGUF (este modelo) | ~320,8 B | 262.144 tokens | Imagen-texto | MIT | Parcial (capas 15-35, expertos intactos) | GGUF en HuggingFace, requiere fork de llama.cpp |
| zai-org/GLM-5.3-Flash (modelo base) | ~320,8 B | no disponible | Imagen-texto | no disponible | No | Modelo original del que deriva esta versión |
| unsloth/GLM-5.3-Flash-GGUF | ~320,8 B (mismo modelo) | no disponible | Imagen-texto | no disponible | No | GGUFs sin ablacionar, origen de las cuantizaciones de este repo |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | ~27 B | no disponible | no disponible | no disponible | Sí (alcance no especificado) | Alternativa abliterada del mismo autor, mucho más pequeña y presumiblemente apta para hardware de consumo |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido de forma deliberada. El propio autor advierte del riesgo de generar contenido sensible, controvertido o inapropiado, y recomienda revisión manual de las salidas.
- Ablación parcial: solo se modificaron las capas 15 a 35 y ningún módulo de expertos, por lo que el efecto sobre el comportamiento de rechazo puede ser desigual e impredecible según la tarea.
- El autor califica la implementación como "cruda" y de prueba de concepto; no es un modelo optimizado para seguridad ni para producción.
- No apto para audiencias generales, menores o aplicaciones con requisitos altos de seguridad, según la propia model card.
- Riesgo de alucinación: no hay datos específicos publicados, pero es un riesgo inherente a los LLM de este tamaño y debe asumirse en cualquier uso.
- Cobertura idiomática limitada a inglés y chino; el rendimiento en castellano no está documentado.
- La licencia es MIT, lo que permite uso comercial, pero el autor desaconseja explícitamente el uso directo en producción o en aplicaciones públicas; la responsabilidad legal y ética recae íntegramente en el usuario.
- Dependencia de una rama no estándar de llama.cpp (`unslothai/llama.cpp`, rama `glm5next/upstream`), lo que complica el despliegue estable y la integración con otras herramientas.
- Requisitos de hardware muy elevados: incluso en Q4 el modelo ronda los 200 GB, lo que lo excluye de cualquier GPU de consumo individual.
- Repositorio recién publicado (26 de septiembre de 2026) con 0 descargas registradas, por lo que no existe validación comunitaria de su comportamiento real.
- El nombre del repositorio y el título de la model card no coinciden exactamente (`GLM-5.3-Flash-abliterated-GGUF` frente a `Huihui-GLM-5.3-Flash-abliterated-GGUF`), lo que puede generar confusión en scripts y referencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huihui-ai/GLM-5.3-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUFs originales sin ablacionar: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Técnica de ablación (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Fork de llama.cpp con soporte para la arquitectura: https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Organización huihui-ai en HuggingFace: https://huggingface.co/huihui-ai
- Perfil de huihui_ai en Ollama: https://ollama.com/huihui_ai
- Otra alternativa abliterada del mismo autor (Qwen3.8-27B): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Ko-fi del autor: https://ko-fi.com/huihuiai
