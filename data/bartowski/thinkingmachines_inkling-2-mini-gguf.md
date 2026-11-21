# bartowski/thinkingmachines_Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines, distribuido con licencia Apache 2.0 y con una arquitectura de mezcla de expertos (MoE). El checkpoint original cuenta con 26.070.385.152 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de 26B. El repositorio reseñado aquí no contiene el modelo original, sino la colección de cuantizaciones GGUF generadas por bartowski mediante llama.cpp (release b12600), pensadas para inferencia local con llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 26B con arquitectura MoE en hardware de consumo, algo impensable con los pesos en bf16 (52,23 GB). Las cuantizaciones van desde bf16 completo hasta IQ3_M (15,26 GB), con la recomendación habitual de Q4_K_M (18,66 GB) como equilibrio entre tamaño y calidad. El modelo acepta entradas de texto e imagen (esta última requiere el fichero mmproj), soporta tool calling mediante un formato XML declarativo y expone un parámetro de "thinking effort level" en el prompt de sistema, lo que sugiere un modo de razonamiento configurable.

El pipeline declarado es image-text-to-text y los tags incluyen "moe" y "conversational". No se dispone de información sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento en la documentación proporcionada; el repositorio es una cuantización de terceros y la model card original del modelo base no se ha incluido en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer multimodal image-text-to-text |
| Parametros totales | 26.070.385.152 (26B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, IQ4_NL, IQ4_XS, IQ3_M, Q3_K_L |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo emplea una arquitectura de mezcla de expertos (tag "moe") y que es multimodal, con soporte de entrada de texto e imagen. El pipeline image-text-to-text implica un codificador visual acoplado a un decodificador de lenguaje, aunque no se detalla si el codificador es un ViT separado ni cómo se proyectan las características visuales al espacio del modelo. El repositorio GGUF incluye un fichero mmproj separado para habilitar la entrada de imagen, lo que es consistente con el patrón habitual de llama.cpp para modelos multimodales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La model card de la cuantización menciona explícitamente que no se usa decodificación especulativa ("Speculative decoding: no") y que se ha aplicado imatrix durante la cuantización, lo que mejora la calidad de las cuantizaciones de baja precisión al ponderar la importancia de cada tensor según estadísticas de activación. El prompt de sistema incluye un campo "Thinking effort level: 0.9", lo que indica un mecanismo de razonamiento con esfuerzo configurable, aunque no se detalla su funcionamiento interno.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de prompt basado en etiquetas `<|message_system|>`, `<|message_user|>` y `<|content_text|>`.
- Comprensión de imágenes: el modelo acepta entradas image-text-to-text, requiriendo el fichero mmproj para procesar imágenes en llama.cpp.
- Tool calling / function calling: el formato de prompt incluye un bloque `tool_declare` con definiciones en XML que describen funciones, sus parámetros y tipos, lo que permite al modelo invocar herramientas estructuradas.
- Modo de razonamiento configurable: el prompt de sistema admite un "Thinking effort level" numérico (por ejemplo 0.9), lo que sugiere control sobre la profundidad del razonamiento.
- Arquitectura MoE: activa solo un subconjunto de parámetros por token, lo que reduce el coste computacional en inferencia frente a un modelo denso del mismo tamaño total.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no confirmadas explícitamente, aunque el soporte de tool calling y el modo de razonamiento son compatibles con flujos agénticos.

## Casos de uso

- Asistente conversacional multimodal local: desplegar el modelo con llama.cpp u Ollama para mantener conversaciones multi-turno que combinen texto e imágenes, por ejemplo para describir capturas de pantalla o diagramas técnicos sin enviar datos a la nube.
- Automatización de atención al cliente con imágenes: el modelo puede procesar capturas o fotos enviadas por el usuario junto con texto, gracias a su pipeline image-text-to-text y al soporte de conversación multi-turno.
- Integración de tool calling en pipelines de datos: usando el bloque `tool_declare`, se pueden definir funciones como consultas a APIs o bases de datos y dejar que el modelo decida cuándo invocarlas, integrándolo en flujos de automatización con llama.cpp.
- Razonamiento configurable para tareas de análisis: el parámetro "Thinking effort level" permite ajustar la profundidad de razonamiento según la tarea, útil para clasificación rápida (nivel bajo) o análisis detallado (nivel alto) en un mismo despliegue.
- Despliegue en hardware de consumo: con Q4_K_M (18,66 GB) el modelo cabe en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) o en sistemas Apple Silicon con memoria unificada suficiente, lo que facilita prototipado y uso personal.
- Procesamiento de documentos con componente visual: extracción de información de facturas, formularios o gráficos combinando la entrada de imagen con preguntas en texto, usando el fichero mmproj para habilitar la visión.
- Evaluación e investigación de modelos MoE multimodales: al ser Apache 2.0 y estar disponible en múltiples cuantizaciones, sirve para experimentar con arquitecturas MoE multimodales en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: bf16 52,23 GB; Q8_0 27,82 GB; Q6_K 24,70 GB; Q5_K_M 21,22 GB; Q4_K_M 18,66 GB; Q4_K_S 16,87 GB; IQ4_XS 16,11 GB; IQ3_M 15,26 GB. A estos valores hay que sumar la memoria del fichero mmproj para entrada de imagen y la KV cache según la longitud de contexto.
- GPU recomendadas: para bf16 y Q8_0 se requiere una A100 80 GB o H100; para Q6_K y Q5_K_M una RTX 4090 (24 GB) o A6000 (48 GB) con margen ajustado; para Q4_K_M una RTX 3090 o RTX 4090 (24 GB) es suficiente.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con IQ3_M o Q3_K_L y contexto reducido.
- Opciones de despliegue: llama.cpp (release b12600 o posterior), Ollama, y cualquier frontend compatible con GGUF (LM Studio, KoboldCpp, text-generation-webui). El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los datos objetivos del modelo son: 26B parámetros totales, arquitectura MoE, multimodal image-text-to-text, licencia Apache 2.0 y disponibilidad en GGUF. Cualquier comparación con alternativas requeriría datos de benchmarks y especificaciones que no se han facilitado.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini | 26B (MoE) | no disponible | Sí (texto + imagen) | Apache 2.0 | GGUF, safetensors |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, evaluación de seguridad o alineación del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos de evaluación que permitan cuantificarlo.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- Los idiomas soportados no están documentados; no se puede garantizar un rendimiento adecuado en castellano sin pruebas.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio es una cuantización de terceros (bartowski); conviene verificar la licencia del modelo base original en thinkingmachines/Inkling-2-Mini.
- Las cuantizaciones de baja precisión (Q3_K_L, IQ3_M) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento de estas cuantizaciones.
- El tamaño del repo es de 444,8 GB, lo que implica descargas parciales mediante el CLI de Hugging Face o descarga selectiva de ficheros.
- No se usa decodificación especulativa, lo que limita el throughput en comparación con modelos que sí la implementan.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/thinkingmachines_Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
