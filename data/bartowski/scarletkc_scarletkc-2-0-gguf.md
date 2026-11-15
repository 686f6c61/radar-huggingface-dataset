# bartowski/ScarletKc_ScarletKc-2.0-GGUF

## Resumen

ScarletKc-2.0 es un modelo multimodal de tipo image-text-to-text desarrollado por ScarletKc y cuantizado a GGUF por bartowski. Con 27.320.697.856 parámetros (aproximadamente 28B en el checkpoint original), se presenta como un modelo de razonamiento con soporte de visión, tool calling y decodificación especulativa mediante MTP (multi-token prediction). La model card lo etiqueta con las familias qwen3_5 y qwen3_8, lo que sugiere una arquitectura derivada de la línea Qwen 3.

El modelo resuelve tareas que combinan comprensión de imágenes y texto con razonamiento explícito (modo thinking vía etiquetas `<think>`), y está orientado a flujos agénticos con function calling en formato XML estructurado. Su licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF con imatrix lo hacen desplegable en infraestructura local mediante llama.cpp.

Esta ficha documenta la versión cuantizada publicada por bartowski, generada con llama.cpp b12180 y calibrada con imatrix. El repositorio ocupa 446,8 GB e incluye desde pesos BF16 completos hasta cuantizaciones de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), etiquetada como qwen3_5/qwen3.8; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (dato real de safetensors); la model card indica 28B en el checkpoint fuente |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S (y otras listadas en el repo) |
| Idiomas soportados | chino (zh), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para visión) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer multimodal con pipeline image-text-to-text, derivado de la familia Qwen 3 (tags qwen3_5 y qwen3.8). Incorpora MTP (multi-token prediction) para decodificación especulativa, lo que permite acelerar la generación al predecir varios tokens por paso. El soporte de visión requiere un fichero mmproj adicional junto con el GGUF principal. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La model card define un formato de prompt basado en las etiquetas de chat de Qwen (`<|im_start|>` / `<|im_end|>`) con un bloque de sistema que fija el "reasoning effort" en xhigh y un bloque `<think>` en la respuesta del asistente. Para tool calling, el modelo emite llamadas en XML con bloques `<tool_call>`, `<function=...>` y `<parameter=...>`. Las cuantizaciones se generaron con llama.cpp b12180 usando imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión al calibrar con estadísticas de activaciones.

## Capacidades

- Generación de texto y razonamiento explícito en modo thinking, con nivel de esfuerzo configurable en el prompt de sistema.
- Comprensión de imágenes (image-text-to-text) mediante el fichero mmproj.
- Tool calling / function calling con formato XML estructurado y validación de parámetros requeridos.
- Flujos agénticos multi-paso, con razonamiento natural permitido antes de la llamada a función.
- Decodificación especulativa mediante MTP para acelerar la inferencia.
- Capacidades multilingües en chino, inglés y japonés.
- Conversación multi-turno (tag conversational).

## Casos de uso

- Asistencia técnica con capturas de pantalla: el modelo puede recibir una imagen de error o interfaz junto con texto y razonar sobre el problema combinando visión y modo thinking.
- Automatización de agentes con herramientas: integración en pipelines donde el modelo decide qué función invocar (APIs, consultas, acciones) siguiendo el formato `<tool_call>` documentado.
- Análisis de documentos con imágenes: extracción de información de gráficos, tablas o diagramas en combinación con preguntas en lenguaje natural.
- Atención al cliente multilingüe en zh/en/ja: conversaciones multi-turno con razonamiento previo para respuestas consistentes.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (17,44 GB) permiten ejecución en GPU de consumo con llama.cpp u Ollama.
- Prototipado de asistentes con razonamiento verificable: el bloque `<think>` permite auditar el razonamiento antes de la respuesta final en entornos de investigación.
- Generación asistida en japonés y chino: tareas de redacción o resumen en esos idiomas, donde el modelo declara soporte nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - bf16: ~55 GB solo pesos; requiere múltiples GPU o GPU de 80 GB.
  - Q8_0: ~29 GB; viable en A100 40 GB / H100.
  - Q6_K: ~24 GB; viable en RTX 4090 24 GB con contexto ajustado.
  - Q5_K_M: ~21 GB; RTX 4090 24 GB con margen moderado.
  - Q4_K_M: ~17,5 GB; cabe en RTX 4090, RTX 3090 y GPUs de 24 GB con contexto amplio; también en 16 GB con contexto reducido o descarga parcial a CPU.
- GPU recomendadas: A100 80 GB o H100 para BF16/Q8_0; RTX 4090/3090 para Q4–Q6; configuraciones multi-GPU para cuantizaciones altas con contexto largo.
- Despliegue: llama.cpp (versión b12180 o superior, usada para la cuantización), Ollama, y cualquier runtime compatible con GGUF; el fichero mmproj es necesario para visión.
- Latencia y throughput: no disponibles; el uso de MTP (decodificación especulativa) está orientado a mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| ScarletKc-2.0 (esta ficha) | ~27,3B | no disponible | Si (mmproj) | Apache 2.0 | GGUF, safetensors (base) |
| Qwen2.5-VL-32B | ~32B | no disponible en esta ficha | Si | Apache 2.0 (segun familia Qwen) | safetensors, GGUF (comunitario) |
| Gemma 3 27B | ~27B | no disponible en esta ficha | Si | Gemma license | safetensors, GGUF (comunitario) |
| InternVL 2.5 26B | ~26B | no disponible en esta ficha | Si | MIT (segun version) | safetensors, GGUF (comunitario) |

Nota: los datos de los modelos comparados no provienen de la información proporcionada en esta búsqueda y deben verificarse en sus fichas oficiales antes de usarse en decisiones de producción.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes en la información disponible; el rendimiento real es desconocido.
- El modelo solo declara soporte para chino, inglés y japonés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos, agravado por el modo thinking que puede producir razonamientos plausibles pero incorrectos.
- El tool calling depende de que el runtime respete el formato XML documentado; un parseo incorrecto puede romper los flujos agénticos.
- La longitud de contexto no está especificada, lo que dificulta dimensionar la KV cache y planificar despliegues con contextos largos.
- Aunque la licencia es Apache 2.0, conviene verificar la procedencia de los datos de entrenamiento del modelo base antes de un uso comercial sensible.
- El repositorio es muy grande (446,8 GB); descargar cuantizaciones altas requiere espacio en disco y ancho de banda considerables.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/ScarletKc_ScarletKc-2.0-GGUF
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- llama.cpp (release usada para la cuantización): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
