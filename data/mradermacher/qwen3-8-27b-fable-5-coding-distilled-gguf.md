# mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo `khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled`. No se trata de un modelo entrenado por el autor del repositorio, sino de una redistribución optimizada para inferencia local mediante llama.cpp y runtimes compatibles. El checkpoint original cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones), lo que lo sitúa en la franja de modelos densos de gran tamano aptos para una o varias GPU de gama alta.

El nombre del modelo sugiere una destilación orientada a código sobre una base de la familia Qwen, pero esta afirmación no está confirmada en la información disponible: la model card del repositorio se limita a una línea que referencia el modelo de origen, sin detallar arquitectura, datos de entrenamiento, licencia ni idiomas. El repositorio ocupa 28,2 GB e incluye un conjunto de cuantizaciones que abarca desde f16 hasta Q2_K, pasando por IQ4_XS y las familias Q3, Q4, Q5, Q6 y Q8.

La relevancia de esta ficha es doble. Por un lado, permite desplegar un modelo de ~27B en hardware de consumo o en una única GPU profesional de 24-48 GB según la cuantización elegida. Por otro, y de forma igualmente importante, documenta un caso habitual en el ecosistema open source: derivados con licencia e información opacas, publicados sin benchmarks ni model card sustantiva, cuyo uso en producción exige una verificación previa por parte del equipo que los adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en el repositorio; compatible con llama.cpp) |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (etiquetada como x-f16), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Modelo de origen | khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled |
| Tamano del repositorio | 28,2 GB |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, conversational |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en el material disponible. El repositorio es una conversión a GGUF (`convert_type: hf`, `quantize_version: 2`), lo que implica que la arquitectura subyacente está soportada por el conversor de llama.cpp, pero no permite deducir si se trata de un transformer denso, un modelo de mezcla de expertos o una arquitectura híbrida. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO.

El identificador del modelo incluye el término "Coding-Distilled", lo que sugiere un proceso de destilación sobre datos de código, y el prefijo "Qwen3.8-27B" apunta a una base de la familia Qwen. Ambos extremos son inferencias a partir del nombre y no están corroborados por ninguna fuente del repositorio. La model card del autor de la cuantización se limita a indicar que se trata de cuantizaciones estáticas del checkpoint `khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled`, sin aportar ninguna innovación técnica adicional ni detalles del proceso de destilación.

## Capacidades

Las siguientes capacidades se infieren exclusivamente de las etiquetas declaradas y del nombre del repositorio; no hay documentación que las confirme:

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está orientado a diálogo multi-turno.
- Generación y asistencia en código: el sufijo "Coding-Distilled" del identificador apunta a un ajuste específico para tareas de programación, sin que se especifiquen lenguajes ni benchmarks.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse detrás de APIs compatibles con el formato de inferencia habitual.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponible.

## Casos de uso

Dado que no hay benchmarks ni model card sustantiva, los siguientes escenarios son aplicaciones plausibles del formato y tamano del modelo, no casos validados por el autor:

- Asistencia de código en local: un modelo de ~27B cuantizado a Q4_K_M ocupa aproximadamente 16-17 GB, por lo que puede ejecutarse en una GPU de 24 GB y usarse como autocompletado o generación de funciones vía llama.cpp u Ollama, sin enviar código propietario a servicios externos.
- Revisión de pull requests en CI/CD: integrado mediante la API de un servidor compatible con OpenAI (llama.cpp server, vLLM, Ollama), el modelo puede analizar diffs y generar comentarios automáticos, siempre que se valide previamente su calidad con un conjunto de pruebas propio.
- Generación de documentación técnica: dado su supuesto origen orientado a código, resulta adecuado para producir docstrings y documentación de APIs a partir del código fuente en pipelines por lotes.
- Chatbot interno de soporte a desarrolladores: la etiqueta `conversational` y el contexto de código permiten desplegarlo como asistente interno que responda preguntas sobre una base de código concreta, inyectando fragmentos relevantes vía RAG.
- Procesamiento por lotes sin conexión: con la cuantización Q8_0 o f16 en una GPU de 40-80 GB, se puede usar para tareas de reescritura, resumen o traducción de fragmentos técnicos en modo batch.
- Experimentación e investigación: sirve como punto de comparación frente a otros derivados GGUF de escala similar, dado que el formato permite intercambiar cuantizaciones sin cambiar el código de inferencia.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q3_K_M y Q2_K, de aproximadamente 13 y 10 GB, permiten ejecución parcial o total en CPU con RAM suficiente, a costa de una degradación notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ningún dato de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluación, y la búsqueda web realizada no devolvió fuentes relacionadas con el modelo. Por tanto, no es posible comparar su rendimiento con el de alternativas de forma verificable.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros (27,32 mil millones) y de los bits por peso típicos de cada cuantización, más un margen para la caché KV. No proceden de mediciones publicadas por el autor:

| Cuantizacion | Tamano aproximado de pesos | VRAM recomendada (con cache KV) | GPU de ejemplo |
|---|---|---|---|
| f16 | ~54,6 GB | 60-70 GB | A100 80 GB, H100 80 GB |
| Q8_0 | ~29 GB | 34-40 GB | A100 40 GB, 2x RTX 4090 |
| Q6_K | ~22,4 GB | 27-32 GB | A100 40 GB, RTX 5090 32 GB |
| Q5_K_M | ~19,4 GB | 24-28 GB | RTX 3090 / 4090 24 GB (ajustado) |
| Q4_K_M | ~16,6 GB | 20-24 GB | RTX 4090 24 GB, RTX 4080 16 GB (ajustado) |
| IQ4_XS | ~14,5 GB | 18-22 GB | RTX 4080, RTX 5080 |
| Q3_K_M | ~13,4 GB | 16-20 GB | RTX 4080 16 GB, RTX 4070 Ti |
| Q2_K | ~10,1 GB | 12-16 GB | RTX 4070 12 GB, RTX 3060 12 GB |

- Cabe en GPU de consumo: sí, desde Q4_K_M hacia abajo en GPUs de 16-24 GB; Q2_K y Q3_K en GPUs de 12 GB, con pérdida de calidad apreciable.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, LM Studio, text-generation-webui y cualquier runtime que consuma GGUF. vLLM y TGI requieren normalmente pesos en safetensors, por lo que no sirven directamente para este repositorio; sería necesario recurrir al checkpoint original.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Observación sobre el repositorio: el tamano total declarado (28,2 GB) es inferior a la suma teórica de todas las cuantizaciones listadas, incluida f16. Esto sugiere que el repositorio podría no contener todos los ficheros anunciados o que la cifra corresponde a un estado parcial de la subida.

## Comparativa con modelos similares

No existe información verificable sobre el rendimiento, contexto o licencia de este modelo, por lo que la comparación solo puede establecerse a nivel de formato y disponibilidad. Las cifras de las alternativas proceden de la documentación pública de cada proyecto y deben verificarse antes de tomar decisiones:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Qwen3.8-27B-Fable-5-Coding-Distilled (esta version) | ~27,3B | no disponible | no disponible | Sí, 12 cuantizaciones |
| Qwen2.5-Coder-32B-Instruct | ~32,8B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Sí, comunidad |
| DeepSeek-Coder-V2-Lite-Instruct | ~15,7B totales, ~2,4B activos (MoE) | 128.000 tokens | Licencia propia de DeepSeek | Sí, comunidad |
| CodeLlama-34B-Instruct | ~33,7B | 16.384 tokens | Licencia de comunidad de Llama 2 | Sí, comunidad |

La ventaja diferencial de este repositorio frente a las alternativas es únicamente la disponibilidad inmediata en GGUF con un espectro amplio de cuantizaciones, mientras que su desventaja es la ausencia total de datos de rendimiento, licencia e idiomas. Para una evaluación rigurosa sería necesario consultar el checkpoint original en `khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled` y ejecutar una batería propia de pruebas.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no puede asumirse permiso para uso comercial. Cualquier despliegue en producción debería bloquearse hasta aclarar este punto con el autor del modelo original.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en código, matemáticas o razonamiento. No debe asumirse que un modelo etiquetado como "Coding-Distilled" supera a alternativas consolidadas.
- Model card inexistente en la práctica: se desconoce la composición del dataset de entrenamiento, si hubo filtrado de datos, y si existen sesgos conocidos o contaminación de benchmarks.
- Riesgo de alucinación: no cuantificado. Al ser un modelo de ~27B sin evaluación publicada, la tasa de invención en tareas de código (APIs inexistentes, firmas incorrectas) es desconocida.
- Idiomas no declarados: no hay garantía de un rendimiento aceptable en castellano ni en ningún otro idioma distinto del que se usara en el entrenamiento.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar tareas de análisis de repositorios completos o conversaciones largas.
- Degradación por cuantización: las variantes Q2_K y Q3_K reducen la precisión de forma notable en modelos de este tamano; para uso serio en código se recomienda Q5_K_M o superior.
- Repositorio sin validación social: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentación de la comunidad sobre posibles defectos de conversión o ficheros corruptos.
- Procedencia del modelo base: el prefijo "Qwen3.8-27B" no corresponde a ningún lanzamiento oficial conocido de la familia Qwen, por lo que conviene confirmar con el autor del checkpoint original qué base se utilizó realmente y bajo qué términos se distribuye.
- Fechas del repositorio: la fecha de creación declarada (2026-09-16) es posterior al momento habitual de publicación de modelos de esta familia, un detalle que conviene verificar directamente en HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF
- Modelo de origen: https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime de inferencia para GGUF): https://github.com/ggml-org/llama.cpp
- Búsqueda web realizada: no se han encontrado papers, blogs, repositorios ni demos relacionados con este modelo. Los únicos resultados devueltos fueron páginas del servicio Google Translate (https://translate.google.com/), sin relación con el modelo.
