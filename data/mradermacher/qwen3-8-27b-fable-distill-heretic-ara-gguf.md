# mradermacher/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara`, un derivado de Qwen3.8-27B (modelo denso de 27 000 millones de parámetros con encoder de visión y contexto nativo de 262 144 tokens) que ha sido modificado con técnicas de "abliteration" y ajuste fino para eliminar rechazos de contenido, tal como indican las etiquetas `heretic`, `uncensored`, `decensored` y `abliterated`. El autor de la cuantización, mradermacher, ha generado una serie de archivos GGUF estáticos (sin imatrix) que cubren desde Q2_K hasta Q8_0, además de los proyectores multimodales (mmproj) en f16 y Q8_0.

La relevancia de este modelo radica en que permite ejecutar localmente un VLM de 27B con capacidades de visión y texto en hardware de consumo, gracias a las cuantizaciones que reducen el requisito de VRAM a entre 11 y 29 GB según la precisión elegida. Al ser una versión "sin censura", resulta atractiva para desarrolladores que necesitan un modelo conversacional con menos restricciones en la generación de contenido, aunque esto conlleva riesgos adicionales de seguridad y uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (derivado de Qwen3.8-27B) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible para este derivado; el modelo base Qwen3.8-27B tiene 262 144 tokens |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en f16 y Q8_0 |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base `armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara` parte de Qwen3.8-27B, un transformer denso con un encoder de vision adicional que le permite procesar imagenes junto con texto. La arquitectura original de Qwen3.8-27B incluye atencion completa, normalizacion QKV y un vocabulario amplio, con un contexto nativo de 262 144 tokens. Sobre esta base, el autor del modelo derivado ha aplicado tecnicas de "abliteration" (eliminacion de capas o pesos asociados a comportamientos de rechazo) y un ajuste fino adicional con un dataset denominado "Fable-Distill", aunque no se proporcionan detalles tecnicos sobre el proceso de entrenamiento, el volumen de datos ni el metodo de alineacion utilizado.

La cuantizacion realizada por mradermacher es estatica, sin uso de imatrix, y se ha generado directamente a partir de los pesos en formato HuggingFace. No se incluyen archivos de metadatos sobre el proceso de conversion mas alla de los nombres de los archivos. La presencia de proyectores multimodales (mmproj) confirma que el modelo conserva la capacidad de procesar imagenes, aunque la calidad de la comprension visual puede variar segun la cuantizacion elegida.

## Capacidades

- Generacion de texto en ingles con razonamiento y comprension contextual.
- Procesamiento de imagenes gracias al encoder de vision y los proyectores multimodales incluidos (mmproj).
- Conversacion multi-turno con ventana de contexto larga (262k tokens en el modelo base, no confirmado para este derivado).
- Generacion de codigo y soporte para tareas de programacion, heredado del modelo Qwen3.8-27B.
- Capacidades de razonamiento matematico y logico, propias de la familia Qwen.
- Modificacion "uncensored": el modelo ha sido ajustado para reducir o eliminar rechazos de contenido, lo que permite generar respuestas que el modelo original podria bloquear.
- No se ha confirmado soporte para tool calling o function calling en este derivado especifico.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir textos literarios, guiones o dialogos con tematicas adultas o controvertidas sin los filtros habituales, util para escritores que necesitan explorar limites narrativos.
- Asistentes de chat locales para investigacion en psicologia o sociologia: al no rechazar preguntas delicadas, permite estudiar como un LLM aborda temas tabu o eticamente complejos en entornos controlados.
- Analisis de imagenes en entornos sin conexion: gracias al encoder de vision y las cuantizaciones, se puede desplegar en un portatil con GPU de 16 GB para tareas de descripcion de imagenes o extraccion de informacion visual.
- Desarrollo de agentes conversacionales para simulacion de personajes: la naturaleza "uncensored" facilita la creacion de personajes con personalidades extremas o discursos no filtrados, util en videojuegos o prototipos de narrativa interactiva.
- Educacion y formacion en etica de IA: permite a estudiantes y profesionales observar las diferencias de comportamiento entre un modelo censurado y uno abliterado, usando las cuantizaciones como material de comparacion.
- Despliegue en hardware modesto: con la cuantizacion Q4_K_M (16,9 GB) se puede ejecutar en una GPU de consumo como la RTX 4080 o en un Mac con 32 GB unificados, sirviendo como backend para aplicaciones de procesamiento de lenguaje natural en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el modelo derivado `armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara` ni para sus cuantizaciones GGUF. Los resultados de busqueda web mencionan benchmarks del modelo Qwen3.8-27B original, pero no son aplicables directamente a esta version modificada. Se recomienda realizar evaluaciones propias para tareas especificas antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF elegido, se necesita aproximadamente entre 11 GB (Q2_K) y 29 GB (Q8_0) para cargar el modelo en memoria. El mmproj adicional ocupa entre 0,7 y 1,0 GB.
- GPUs recomendadas: para cuantizaciones Q4_K_M o superiores, una GPU con 16-20 GB de VRAM (RTX 4080, RTX 4090, A4000) es suficiente. Para Q8_0 se recomienda una GPU de 32 GB o mas (A100, H100) o ejecucion en CPU con RAM abundante.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 12-16 GB, aunque con perdida de calidad. La Q4_K_M es un buen equilibrio.
- Opciones de despliegue: al ser archivos GGUF, se pueden usar con llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores como vLLM (con conversion a formato compatible) y TGI.
- Latencia y throughput: no se dispone de datos medidos para este modelo especifico. Como referencia, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 30 y 50 tokens por segundo, pero depende del backend y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3 B | 262 144 | Apache 2.0 | safetensors, GGUF | Modelo base sin modificaciones de censura |
| armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara | 27,3 B | No disponible | No disponible | safetensors | Derivado "uncensored" |
| mradermacher/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF | 27,3 B | No disponible | No disponible | GGUF | Cuantizaciones de este modelo |
| Llama-3.1-8B-Instruct (abliterated) | 8 B | 128 000 | Llama 3.1 | GGUF | Alternativa mas pequena y "uncensored", pero sin vision |

No se dispone de comparativas de rendimiento cuantitativas entre estos modelos, ya que no hay benchmarks publicados para el derivado. La principal diferencia con el Qwen3.8-27B original es la eliminacion de rechazos y la posible perdida de calidad debido a la cuantizacion.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin filtros. El uso en produccion debe ir acompanado de medidas de seguridad adicionales y supervisio humana.
- No se ha verificado la licencia del modelo derivado; el uso comercial puede estar restringido o requerir permisos del autor original. Se recomienda contactar con `armand0e` antes de cualquier despliegue comercial.
- La cuantizacion estatica (sin imatrix) puede producir una perdida de calidad notable en tareas de razonamiento complejo, especialmente en cuantizaciones por debajo de Q4_K_M.
- No se confirma la longitud de contexto real en este derivado; aunque el modelo base soporta 262k tokens, las modificaciones de "abliteration" pueden alterar el comportamiento en contextos largos.
- El modelo solo declara soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La capacidad de procesamiento de imagenes depende del archivo mmproj; si se omite, el modelo no podra interpretar entradas visuales.
- No hay informacion sobre sesgos especificos del modelo derivado, pero al ser un ajuste de Qwen3.8-27B, es probable que herede los sesgos del modelo base, que no han sido evaluados en esta version.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/Qwen3.8-27B-Fable-Distill-Heretic-ara-GGUF
- Modelo base: https://huggingface.co/armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de ejecucion local de Qwen3.8-27B (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guia de ejecucion local (lu-labs): https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- Guia para GPU de 24 GB (modelfit): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Especificaciones y requisitos de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
