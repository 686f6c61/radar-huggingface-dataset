# aktr7d6th/XORTRON.CriminalComputing.2026.4B.Instruct.NEXT-Q4_K_M-GGUF

## Resumen

XORTRON.CriminalComputing.2026.4B.Instruct.NEXT-Q4_K_M-GGUF es una conversión a formato GGUF del modelo `darkc0de/XORTRON.CriminalComputing.2026.4B.Instruct.NEXT`, realizada por el usuario `aktr7d6th` mediante la herramienta GGUF-my-repo de ggml.ai. El modelo original, con aproximadamente 4.200 millones de parámetros, está etiquetado como "uncensored", "decensored" y "abliterated", lo que indica que se le han eliminado los mecanismos de rechazo y censura típicos de los modelos instructivos mediante la técnica de abliteración.

El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada de imagen y texto, aunque la documentación disponible no detalla el alcance de dichas capacidades. La licencia referenciada apunta a Qwen3.5-4B, lo que sugiere que la arquitectura base podría derivar de la familia Qwen, aunque no se confirma explícitamente en la model card. Este repositorio concreto contiene únicamente el archivo cuantizado en Q4_K_M, pensado para su uso con llama.cpp y entornos compatibles con GGUF.

La relevancia de este modelo reside en su naturaleza "sin censura" y su tamaño compacto de 4B parámetros, que permite ejecutarlo en hardware de consumo. No obstante, conviene subrayar que el repositorio no registra descargas ni valoraciones hasta la fecha, y no se ha publicado ningún benchmark ni evaluación independiente en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; la licencia referencia Qwen/Qwen3.5-4B, lo que sugiere una base transformer, sin confirmar |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (este archivo); el modelo original en safetensors no se publica en este repo |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (con enlace a la licencia de Qwen3.5-4B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El único dato indirecto es el enlace de licencia que apunta a `Qwen/Qwen3.5-4B`, lo que sugiere una posible base o inspiración en la familia Qwen, de arquitectura transformer densa, pero no se puede confirmar sin acceso a la model card del modelo original `darkc0de/XORTRON.CriminalComputing.2026.4B.Instruct.NEXT`.

El dataset de entrenamiento declarado es `darkc0de/Xortron.Config.Dataset.New.2026`, del que no se han publicado detalles sobre volumen de tokens, composición o metodología. Los tags "heretic", "uncensored", "decensored" y "abliterated" indican que el modelo ha sido sometido a un proceso de abliteración, una técnica que identifica y elimina las direcciones de activación responsables de los comportamientos de rechazo y negativa, con el objetivo de producir respuestas sin filtros de seguridad.

Este repositorio es exclusivamente una conversión de pesos a GGUF; no incluye información sobre el proceso de entrenamiento, fine-tuning o alineación del modelo original.

## Capacidades

- Generación de texto conversacional en formato instructivo (chat), según el tag "conversational".
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), aunque sin detalles sobre qué tareas de visión soporta exactamente.
- Salidas sin censura ni rechazo: al ser un modelo abliterated, no aplica los mecanismos de negativa habituales ante solicitudes delicadas o prohibidas.
- Ejecución local eficiente mediante llama.cpp, con soporte para CLI y servidor HTTP (`llama-server`).
- Compatible con carga directa desde HuggingFace mediante `--hf-repo` en llama.cpp.
- Capacidad de tool calling, agentes o razonamiento multi-paso: no disponible en la documentación proporcionada.

## Casos de uso

- Investigación en seguridad y alineación de modelos: el modelo permite estudiar el comportamiento de sistemas abliterated, comparando sus respuestas frente a modelos con guardas de seguridad activas para evaluar el impacto de la eliminación de rechazos.
- Red teaming y pruebas de robustez: equipos de seguridad pueden utilizarlo para identificar vulnerabilidades en sistemas que dependen de modelos base similares, anticipando qué solicitudes malintencionadas podrían superar los filtros de un sistema desplegado.
- Prototipado rápido de asistentes conversacionales sin restricciones: para entornos de desarrollo donde se necesita un asistente que no rechace preguntas sobre temas sensibles, como simulación de entrevistas o generación de diálogos complejos.
- Experimentación con cuantización GGUF: al ser un archivo Q4_K_M de 2,7 GB, permite probar flujos de despliegue con llama.cpp, Ollama o servidores compatibles en hardware modesto, validando latencia y calidad de la cuantización.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o material narrativo que aborde temas tabú o controvertidos sin las restricciones habituales de los modelos instructivos comerciales.
- Evaluación de técnicas de abliteración: investigadores interesados en la mecánica de eliminación de rechazos pueden usar este modelo como caso de estudio para reproducir y analizar el proceso sobre arquitecturas de 4B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa, y el modelo no registra descargas ni validaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M pesa 2,7 GB, por lo que los pesos caben en GPUs con al menos 4-6 GB de VRAM. Con la caché KV y overhead de inferencia, se recomienda un mínimo de 6 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superiores en el ecosistema NVIDIA; también funciona en Apple Silicon (M1/M2/M3) mediante Metal y en CPUs con suficiente RAM (16 GB o más).
- Sí cabe en GPUs de consumo: es un modelo de 4B parámetros en Q4_K_M, diseñado precisamente para ejecutarse en hardware doméstico.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), llama-cpp-python, y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en la documentación.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B en Q4_K_M, se espera una generación fluida en GPUs modernas (decenas de tokens por segundo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

La documentación no proporciona datos comparativos. Como referencia estructural, la licencia apunta a Qwen3.5-4B, pero no se dispone de sus especificaciones en la información proporcionada. Se indican los datos conocidos y el resto queda pendiente de verificación:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| XORTRON.CriminalComputing.2026.4B.Instruct.NEXT-Q4_K_M | 4,2B | No disponible | Q4_K_M | Apache-2.0 | Abliterated, sin benchmarks publicados |
| Qwen3.5-4B (referenciado en licencia) | No disponible | No disponible | No disponible | Apache-2.0 | Modelo base de referencia, sin confirmar |

No se dispone de datos para comparar rendimiento real con alternativas como Llama-3.2-3B, Phi-3.5-mini u otros modelos de 4B, por lo que cualquier comparativa adicional sería especulativa.

## Limitaciones y advertencias

- Modelo abliterated: se le han eliminado deliberadamente los mecanismos de rechazo y seguridad. Esto implica un riesgo elevado de generar contenido dañino, ilegal o éticamente problemático si se usa sin supervisión.
- El nombre "CriminalComputing" y el dataset asociado sugieren un enfoque orientado a contextos delictivos o de seguridad ofensiva. Su uso en producción para aplicaciones legítimas requiere una evaluación de riesgos exhaustiva.
- Riesgo de alucinación: al no haber benchmarks publicados, se desconoce la fiabilidad factual del modelo. Los modelos de 4B parámetros suelen tener tasas de alucinación más altas que modelos mayores.
- Sin datos de evaluación: no hay métricas de calidad, seguridad ni rendimiento publicadas, lo que impide una valoración objetiva antes de su adopción.
- Capacidades multimodales no verificadas: aunque el pipeline se declara como `image-text-to-text`, no se documenta qué tareas de visión soporta ni con qué calidad.
- Contexto e idiomas desconocidos: no se especifica la longitud de contexto soportada ni los idiomas cubiertos, lo que dificulta dimensionar su uso en aplicaciones multilingües o con documentos largos.
- Modelo sin adopción: cero descargas y cero valoraciones en el momento de la consulta; no hay experiencia comunitaria que respalde su comportamiento.
- Licencia: aunque es Apache-2.0, el enlace apunta a la licencia de Qwen3.5-4B, por lo que conviene revisar los términos del modelo base original antes de un uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aktr7d6th/XORTRON.CriminalComputing.2026.4B.Instruct.NEXT-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/darkc0de/XORTRON.CriminalComputing.2026.4B.Instruct.NEXT
- Dataset de entrenamiento: https://huggingface.co/datasets/darkc0de/Xortron.Config.Dataset.New.2026
- Licencia de referencia (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Herramienta de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
