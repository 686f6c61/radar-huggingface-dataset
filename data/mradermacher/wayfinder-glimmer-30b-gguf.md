# mradermacher/wayfinder-glimmer-30b-GGUF

## Resumen

Wayfinder-glimmer-30b es un modelo de lenguaje de 27.850 millones de parámetros desarrollado originalmente por MongoDB y distribuido en formato GGUF por el cuantizador mradermacher. Está diseñado específicamente para tareas de búsqueda de código, uso agéntico y llamada a herramientas (tool calling), con soporte explícito para subagentes. Su nombre y etiquetas indican un enfoque claro hacia flujos de trabajo autónomos que combinan recuperación de información en repositorios de código con ejecución de acciones mediante herramientas externas.

El repositorio original (MongoDB/wayfinder-glimmer-30b) ha sido cuantizado a múltiples formatos GGUF, desde Q2_K hasta Q8_0, además de incluir suplementos multimodales (mmproj) que sugieren capacidades de visión. El modelo incorpora una fusión de LoRA (lora-merged) sobre una arquitectura base de tipo transformer, y su licencia combina Apache-2.0 con la licencia propietaria MUSE Model License, lo que condiciona su uso comercial.

La relevancia actual del modelo radica en su orientación a agentes de código y búsqueda semántica en repositorios, un nicho en crecimiento para asistentes de desarrollo y pipelines de CI/CD. Con casi 28.000 millones de parámetros, se posiciona en la gama media-alta, permitiendo despliegue en GPUs de 24-48 GB con cuantizaciones agresivas, y ofrece una ventana de contexto no especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base MongoDB/wayfinder-glimmer-30b, con LoRA fusionada) |
| Parámetros totales | 27.854.794.240 (27,85 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0-and-muse-model-license (Other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que se trata de un transformer con una LoRA fusionada (etiqueta `lora-merged`) sobre el modelo base MongoDB/wayfinder-glimmer-30b. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea atención lineal o decodificación especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Las etiquetas del repositorio (`code-search`, `agentic`, `tool-use`, `subagent`, `muse`) sugieren un entrenamiento orientado a tareas de recuperación de código, razonamiento multi-paso y orquestación de subagentes. La presencia de archivos `mmproj` indica que el modelo base incorpora un proyector multimodal, lo que apunta a capacidades de visión, aunque no se detalla su funcionamiento ni el codificador visual empleado. No se han publicado detalles técnicos adicionales en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational`).
- Búsqueda de código (`code-search`): recuperación y razonamiento sobre repositorios y fragmentos de código.
- Uso agéntico (`agentic`): planificación y ejecución de tareas multi-paso.
- Llamada a herramientas (`tool-use`): integración con funciones externas y APIs.
- Soporte de subagentes (`subagent`): delegación de tareas a agentes secundarios.
- Capacidades multimodales: los archivos `mmproj` indican soporte de entrada visual, aunque no se detalla su alcance.
- Idiomas: únicamente inglés según la model card.

## Casos de uso

- Búsqueda semántica en repositorios de código: el modelo puede indexar y recuperar fragmentos relevantes en grandes bases de código, aprovechando su especialización en `code-search` para responder consultas en lenguaje natural sobre la implementación de funciones o la ubicación de dependencias.
- Asistente de desarrollo en IDE: integrado mediante tool calling, puede consultar el sistema de archivos, ejecutar tests y proponer parches, actuando como agente autónomo dentro del entorno de desarrollo.
- Automatización de pipelines CI/CD: el modelo puede interpretar fallos de compilación o tests, consultar logs mediante herramientas y generar informes o correcciones preliminares, reduciendo la intervención manual en la triaje de errores.
- Orquestación de subagentes: en arquitecturas multi-agente, wayfinder-glimmer-30b puede actuar como coordinador que delega subtareas (búsqueda, edición, verificación) a subagentes especializados, gracias a su etiqueta `subagent`.
- Documentación técnica automatizada: a partir del código fuente y del historial de commits, el modelo puede generar documentación de API o guías de contribución, usando su capacidad de razonamiento sobre código.
- Análisis de incidencias en producción: con acceso a herramientas de observabilidad, el modelo puede correlacionar trazas, logs y cambios recientes para proponer causas raíz, en un flujo agéntico de diagnóstico.
- Evaluación de calidad de código: puede revisar pull requests aplicando reglas y consultando documentación interna mediante tool calling, emitiendo comentarios estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~10,8 GB de pesos, ~12-14 GB de VRAM con overhead.
  - Q4_K_M: ~17,0 GB de pesos, ~20-22 GB de VRAM.
  - Q5_K_M: ~19,9 GB de pesos, ~23-25 GB de VRAM.
  - Q6_K: ~23,0 GB de pesos, ~26-28 GB de VRAM.
  - Q8_0: ~29,7 GB de pesos, ~33-35 GB de VRAM.
  - Suplementos mmproj: +2,2 GB (Q8_0) o +3,9 GB (f16) si se usa visión.
- GPU recomendadas: A100 40/80 GB, H100, RTX A6000 (48 GB), RTX 4090 (24 GB) para cuantizaciones Q2_K a Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| wayfinder-glimmer-30b | 27,85 B | no disponible | Apache-2.0 + MUSE | code-search, agentic, tool-use | GGUF (mradermacher), base en HF |
| Modelos comparables de 30B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. La categoría de modelos de ~30B orientados a agentes y búsqueda de código incluye alternativas del ecosistema abierto, pero no se han facilitado datos de rendimiento ni especificaciones para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: combina Apache-2.0 con la MUSE Model License, que puede imponer restricciones adicionales al uso comercial; es necesario revisar el enlace de licencia antes de desplegarlo en producción.
- Sesgos: no se documentan evaluaciones de sesgo ni mitigaciones; al ser un modelo orientado a código, puede heredar sesgos de los repositorios de entrenamiento.
- Alucinación: no se han publicado métricas de fidelidad; en tareas de búsqueda de código, el riesgo de citar APIs o funciones inexistentes es relevante y requiere verificación.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar con precisión tareas sobre repositorios grandes.
- Multimodalidad: la presencia de `mmproj` sugiere visión, pero no se detalla su calidad ni los formatos de imagen soportados.
- Producción: al ser una cuantización estática, las versiones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Fecha de creación: el repositorio data de noviembre de 2026, por lo que la información pública puede ser aún escasa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/wayfinder-glimmer-30b-GGUF
- Modelo base: https://huggingface.co/MongoDB/wayfinder-glimmer-30b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/wayfinder-glimmer-30b-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#wayfinder-glimmer-30b-GGUF
- Licencia MUSE: https://huggingface.co/hweller1/wayfinder-glimmer-30b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
