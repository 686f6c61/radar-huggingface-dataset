# bartowski/2Beyes_Aurum-4B-Uncensored-GGUF

## Resumen

Aurum-4B-Uncensored es un modelo multimodal de tipo image-text-to-text desarrollado por 2Beyes y cuantizado a GGUF por bartowski. Se trata de una variante "uncensored" y "abliterated" (es decir, con las capas de rechazo eliminadas mediante técnicas de abliteration) construida sobre la arquitectura Qwen3.5, según las etiquetas del repositorio. El checkpoint fuente declara 5B parámetros, mientras que los pesos safetensors del repositorio cuantizado suman 4.326.350.848 parámetros reales.

El modelo resuelve el caso de uso de despliegue local de un modelo conversacional pequeño con soporte de tool calling, capacidades multimodales (texto e imagen mediante fichero mmproj) y decodificación especulativa nativa mediante MTP (Multi-Token Prediction). Su relevancia actual radica en que combina un tamaño manejable (cuantizaciones desde 2,62 GB) con funcionalidades habitualmente reservadas a modelos de mayor escala, como el razonamiento en modo thinking y la integración de herramientas.

La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza "uncensored/abliterated" implica que las salvaguardas de alineación han sido eliminadas deliberadamente, lo que traslada al integrador toda la responsabilidad sobre el filtrado de contenido en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5 (según tags del repo), multimodal image-text-to-text, con MTP para decodificación especulativa |
| Parametros totales | 4.326.350.848 (pesos safetensors); la model card fuente declara 5B en el checkpoint original |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S (y posteriores en la lista truncada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (checkpoint base) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como derivado de Qwen3.5, una arquitectura transformer con soporte multimodal (procesamiento conjunto de texto e imagen) y un mecanismo MTP (Multi-Token Prediction) que habilita decodificación especulativa para acelerar la inferencia. El modelo base ha sido sometido a un proceso de abliteration, técnica que identifica y neutraliza las direcciones de activación responsables de los comportamientos de rechazo, dando lugar a la variante "uncensored". No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el checkpoint fuente.

La cuantización realizada por bartowski emplea llama.cpp release b12600 con calibración imatrix, lo que mejora la preservación de calidad en cuantizaciones de baja precisión (Q4 y Q5). El soporte de imagen requiere descargar el fichero mmproj asociado, separado de los pesos principales.

## Capacidades

- Generación de texto conversacional multi-turno con formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`).
- Modo de razonamiento "thinking" mediante etiquetas `<think>` en el turno del asistente.
- Comprensión de imágenes (image-text-to-text) con el fichero mmproj correspondiente.
- Tool calling / function calling con formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Razonamiento multi-paso orientado a agentes, con posibilidad de razonamiento en lenguaje natural previo a la llamada de función.
- Decodificación especulativa vía MTP para reducir latencia en inferencia.
- Capacidades multilingües limitadas: únicamente inglés declarado.
- Comportamiento sin censura (abliterated): no aplica rechazos de alineación estándar.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede gestionar diálogos multi-turno con formato ChatML y modo thinking, adecuado para prototipos de atención al cliente donde se requiera control total del filtrado de contenido.
- Automatización de llamadas a APIs: el soporte de tool calling con formato XML permite integrarlo en pipelines que consulten servicios externos (precios de acciones, clima, bases de datos) sin capa intermedia de parsing complejo.
- Análisis de imágenes en local: con el fichero mmproj, puede describir o extraer información de capturas, documentos escaneados o fotografías en entornos sin conectividad.
- Agentes multi-paso: la combinación de thinking mode y function calling facilita la construcción de agentes que razonan antes de actuar, útil en automatización de tareas de soporte técnico.
- Generación de contenido sin restricciones editoriales: para aplicaciones creativas o de investigación donde las salvaguardas estándar resulten un obstáculo, con la responsabilidad de moderación trasladada al integrador.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (2,79 GB) permiten ejecutar el modelo en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Evaluación de técnicas de abliteration: útil para investigadores que comparen el comportamiento del checkpoint base frente a la variante sin censura en tareas de seguridad y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para Q4_K_M (2,79 GB de pesos más overhead de contexto), unos 5 GB para Q8_0 (4,61 GB) y unos 9 GB para bf16 (8,67 GB).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM es suficiente para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutar bf16 sin problemas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 6 GB o más; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (versión b12600 o superior recomendada por el cuantizador), Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponible. La decodificación especulativa MTP debería reducir la latencia respecto a un transformer equivalente sin MTP, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Tool calling | Licencia |
|---|---|---|---|---|---|
| Aurum-4B-Uncensored (este) | ~4,3B | no disponible | Sí (mmproj) | Sí | Apache 2.0 |
| Qwen2.5-3B-Instruct | 3B | 32K (típico) | No | Sí | Apache 2.0 |
| Llama-3.2-3B-Instruct | 3B | 128K | No | Sí | Llama 3.2 Community |
| Phi-3.5-mini-instruct | 3,8B | 128K | No | No nativo | MIT |

La comparativa se basa en categoría y tamaño; no se dispone de datos de rendimiento comparativo para este modelo concreto. Frente a las alternativas, destaca por su naturaleza multimodal y su condición de abliterated, ausente en los modelos citados.

## Limitaciones y advertencias

- Modelo abliterated: las salvaguardas de alineación han sido eliminadas; puede generar contenido dañino, ofensivo o ilegal sin filtro. El integrador debe implementar moderación propia.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no disponible en la información proporcionada; debe verificarse antes de diseñar aplicaciones con contexto largo.
- Riesgo de alucinación: inherente a modelos de este tamaño; la ausencia de benchmarks impide cuantificarlo.
- Discrepancia de parámetros: la model card fuente declara 5B mientras que los safetensors suman 4,33B; conviene validar el conteo real antes de dimensionar hardware.
- El soporte de imagen requiere descargar y configurar el fichero mmproj por separado; sin él, el modelo funciona solo como text-only.
- Uso comercial permitido por Apache 2.0, pero la responsabilidad legal sobre el contenido generado recae íntegramente en el desplegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bartowski/2Beyes_Aurum-4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- llama.cpp release b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
