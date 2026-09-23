# danish-foundation-models/DFM-Mimir-v1.5-GGUF

## Resumen

DFM-Mimir-v1.5-GGUF es la conversión oficial al formato GGUF del modelo DFM Mimir v1.5, desarrollado por Danish Foundation Models (DFM), un consorcio danés centrado en modelos de lenguaje para lenguas nórdicas. El modelo base es un modelo de 1.786.775.040 parámetros (aproximadamente 1,79 mil millones) orientado a generación de texto conversacional, con soporte para danés (da) e inglés (en). Esta variante GGUF no aporta pesos nuevos: reproduce el checkpoint original cuantizado para su uso con llama.cpp y runtimes compatibles.

La característica técnica más relevante es que el modelo emplea una arquitectura de tipo Prefix-LM asociada al stack HRM-Text (etiquetas `hrm_text` y `prefix-lm`), con la plantilla de chat de Gemma 4 y un tokenizador cargado directamente desde `tokenizer.json` con pre-tokenizador `gemma4` y 256 tokens de byte-fallback. La longitud de contexto declarada es de 4096 tokens. El repositorio incluye tres precisiones: BF16 original (3,59 GB), Q8_0 (1,91 GB) y Q4_K_M (1,17 GB), todas generadas desde el BF16 sin recuantizar un modelo ya cuantizado.

Su relevancia actual es doble. Por un lado, ofrece acceso a un modelo de tamaño pequeño para el ecosistema danés, poco cubierto por los grandes laboratorios. Por otro, introduce un requisito poco habitual: la compatibilidad con runtimes GGUF estándar (llama.cpp sin parchear, Ollama u otros) no está garantizada, ya que la arquitectura Prefix-LM/HRM-Text exige el runtime parcheado indicado por el autor. Se trata de un artefacto recién publicado (creado y actualizado el 2026-09-23), con 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Prefix-LM, etiquetada como `hrm_text` / `prefix-lm` (no se detalla la composición interna en la información disponible) |
| Parámetros totales | 1.786.775.040 (≈1,79 mil millones) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4096 tokens (contextos más largos marcados como experimentales) |
| Tipos de cuantización | BF16 (pesos originales), Q8_0 (8 bits), Q4_K_M (4 bits mixto) |
| Idiomas soportados | Danés (da), inglés (en) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (incluye tokenizador y plantilla de chat embebidos) |
| Plantilla de chat | Plantilla de chat de Gemma 4, preservada tal cual desde v1.5 |
| Tokenizador | Cargado desde `tokenizer.json`; metadatos GGUF con `tokenizer.ggml.pre=gemma4` y 256 tokens de byte-fallback |
| Modelo base | danish-foundation-models/DFM-Mimir-v1.5 |
| Revisión de origen | `cc57cebadf375947ced5ccd3317d9da6bf8f9677` |
| Revisión de conversión | `4122b9a814d5bd4f48f454367419f75c05ee5215` de `schneiderkamplab/llama.cpp` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La información disponible no documenta en detalle el entrenamiento del modelo base: no se especifica el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Lo que sí se explicita es la arquitectura declarada, un esquema Prefix-LM etiquetado como `hrm_text`, y el uso de una plantilla de chat de Gemma 4. El repositorio GGUF se limita a preservar los pesos, el tokenizador y dicha plantilla del checkpoint fuente; la cuantización reduce la precisión de los pesos únicamente en las variantes Q8_0 y Q4_K_M, generadas directamente desde BF16.

El aspecto técnico diferencial es el pipeline de ejecución: al tratarse de una arquitectura Prefix-LM/HRM-Text, el modelo requiere un runtime con soporte específico (llama.cpp parcheado o la aplicación DFM Mimir) y no se garantiza su funcionamiento en llama.cpp estándar, Ollama u otros runtimes GGUF genéricos. El tokenizador se carga igual que durante el entrenamiento, sin la reescritura `fix_mistral_regex` que se aplica en la exportación, y v1.5 mantiene un tokenizador byte-idéntico al de la versión original de Mimir. La conversión fue validada con 724/724 comparaciones de tokenizador, decodificador y plantilla de chat, y 19/19 casos de auditoría del tokenizador de entrenamiento, además de conversaciones cortas en danés e inglés sobre CPU y Metal con contexto de 1024 tokens y un presupuesto de respuesta de 32 tokens.

## Capacidades

- Generación de texto conversacional en danés e inglés, con soporte multi-turno según la plantilla de chat embebida.
- Razonamiento y respuesta a instrucciones propias de un modelo base afinado para diálogo (etiquetado como `conversational`).
- Soporte de contenido de respuesta de herramientas en formato de mapeo/objeto, añadido por la plantilla de chat de Gemma 4.
- Tokenizador con cobertura de byte-fallback completa (256 tokens), lo que evita fallos ante caracteres poco frecuentes del danés.
- Ejecución local en CPU y Metal (validado por el autor), sin necesidad de GPU dedicada para pruebas cortas.
- Capacidad bilingüe da↔en, útil para tareas de traducción y asistencia en contextos nórdicos.
- No se documentan capacidades de visión, audio, modo de pensamiento explícito (`thinking mode`) ni decodificación especulativa.

## Casos de uso

- Atención al cliente en danés: el modelo puede gestionar conversaciones multi-turno con una ventana de 4096 tokens, suficiente para hilos de soporte con historial moderado, usando la plantilla de chat embebida para mantener el formato correcto.
- Asistentes conversacionales locales con privacidad: al ejecutarse en CPU y Metal con cuantización Q4_K_M (1,17 GB), permite desplegar un asistente en el propio dispositivo sin enviar datos a la nube, algo relevante para sectores con requisitos de confidencialidad.
- Traducción y asistencia bilingüe danés-inglés: su entrenamiento declarado en ambos idiomas lo hace adecuado para borradores de traducción, resúmenes cruzados y corrección de estilo entre las dos lenguas.
- Procesamiento de documentación administrativa danesa: clasificación, resumen y extracción asistida de textos oficiales, aprovechando su especialización en danés frente a modelos multilingües genéricos.
- Investigación en PLN nórdico: sirve como punto de partida para fine-tuning o evaluación comparativa en danés, dado su tamaño reducido y su licencia Apache 2.0, que facilita la experimentación.
- Educación y tutoría en danés: generación de explicaciones, preguntas de repaso o material didáctico adaptado al nivel del estudiante, con la ventaja de un modelo ligero desplegable en hardware modesto.
- Prototipado rápido de agentes conversacionales: la plantilla de chat soporta contenido de respuesta de herramientas en formato de mapeo/objeto, lo que permite integrar el modelo en flujos con llamadas a funciones, siempre que el runtime parcheado esté disponible.
- Preprocesado de pipelines de datos en danés: generación de resúmenes o normalización de texto antes de etapas posteriores de un pipeline, aprovechando su bajo coste de inferencia por tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas acotadas de cualificación del artefacto (724/724 comparaciones de tokenizador/decodificador/plantilla de chat, 19/19 casos de auditoría del tokenizador de entrenamiento y conversaciones cortas en CPU y Metal), que el propio autor describe explícitamente como verificación del artefacto y no como evaluación de calidad, de contexto largo ni de hardware Linux/CUDA/Vulkan/móvil.

## Requisitos de hardware

- Tamaño de los pesos por variante: Q4_K_M ≈1,17 GB; Q8_0 ≈1,91 GB; BF16 ≈3,59 GB. El autor advierte que el tamaño de descarga no equivale al uso de memoria: la inferencia necesita memoria adicional, especialmente con contextos largos.
- VRAM estimada para inferencia: aproximadamente 2-3 GB con Q4_K_M y 3-4 GB con Q8_0, añadiendo margen para el contexto de 4096 tokens; en torno a 4-6 GB con BF16. Son estimaciones derivadas del tamaño de los pesos, no cifras publicadas por el autor.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM para las variantes cuantizadas (por ejemplo, RTX 3060, RTX 4060, RTX 4090). El modelo completo en BF16 también es viable en GPU de 8 GB o más.
- Ejecución en CPU y Metal: validada por el autor en conversaciones cortas en danés e inglés con contexto de 1024 tokens y 32 tokens de respuesta.
- Opciones de despliegue: aplicación DFM Mimir y llama.cpp parcheado con soporte HRM-Text/PrefixLM. No se implica compatibilidad con llama.cpp estándar, Ollama ni otros runtimes GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible una comparativa de rendimiento con terceros. La comparación factible se limita a las tres precisiones publicadas del propio repositorio y al modelo base sin cuantizar:

| Variante | Precisión | Tamaño de descarga | Cuantizada | Requisito de runtime |
|---|---|---|---|---|
| dfm-mimir-v1.5-q4_k_m.gguf | Q4_K_M (4 bits mixto) | 1,17 GB | Sí | llama.cpp parcheado / app DFM Mimir |
| dfm-mimir-v1.5-q8_0.gguf | Q8_0 (8 bits) | 1,91 GB | Sí | llama.cpp parcheado / app DFM Mimir |
| dfm-mimir-v1.5-bf16.gguf | BF16 (original) | 3,59 GB | No | llama.cpp parcheado / app DFM Mimir |
| danish-foundation-models/DFM-Mimir-v1.5 | BF16 (checkpoint fuente) | No disponible | No | Stack de origen del modelo base |

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens; el propio autor indica que contextos más largos son experimentales y requieren memoria adicional y validación.
- Compatibilidad restringida: no se garantiza el funcionamiento en llama.cpp estándar, Ollama u otros runtimes GGUF. Es necesario usar el runtime parcheado o la aplicación DFM Mimir.
- Obligatoriedad de la plantilla de chat embebida: el modelo fue entrenado con ese formato, por lo que los prompts sin plantilla degradan la calidad de la respuesta.
- Idiomas limitados a danés e inglés; no se documenta soporte para castellano ni otras lenguas.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; no hay evaluación publicada que cuantifique su fiabilidad factual.
- Las variantes Q8_0 y Q4_K_M introducen pérdida de precisión por cuantización; no se han publicado evaluaciones que midan su impacto en calidad.
- Sesgos conocidos: no disponibles. No se documenta la composición del dataset de entrenamiento ni los procesos de alineación aplicados.
- Licencia Apache 2.0, heredada del modelo base, lo que permite uso comercial siempre que se respeten las condiciones de la licencia y los avisos de atribución correspondientes.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, lo que indica adopción muy temprana y poca validación por parte de la comunidad.
- Las validaciones publicadas cubren CPU y Metal, pero no Linux/CUDA/Vulkan ni dispositivos móviles.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.5-GGUF
- Modelo base (DFM Mimir v1.5): https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.5
- Aplicación DFM Mimir (releases): https://github.com/schneiderkamplab/HRM-Text/releases
- llama.cpp parcheado con soporte HRM-Text/PrefixLM: https://github.com/schneiderkamplab/llama.cpp/tree/4122b9a814d5bd4f48f454367419f75c05ee5215
- Resultados de validación: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.5-GGUF/blob/main/validation.json
- Sumas de verificación SHA256: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.5-GGUF/blob/main/SHA256SUMS
- Procedencia de la conversión: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.5-GGUF/blob/main/provenance.json
- Licencia Apache 2.0: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.5-GGUF/blob/main/LICENSE
