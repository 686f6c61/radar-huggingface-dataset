# mradermacher/wayfinder-glimmer-30b-i1-GGUF

## Resumen

Wayfinder Glimmer 30B es un modelo de lenguaje de aproximadamente 27.850 millones de parámetros desarrollado originalmente por MongoDB bajo el identificador `MongoDB/wayfinder-glimmer-30b`. Está especializado en tareas de búsqueda de código (`code-search`), uso de herramientas (`tool-use`), razonamiento agéntico y actuación como subagente dentro de pipelines multi-agente, según las etiquetas declaradas por el autor. La ficha que nos ocupa, sin embargo, no corresponde al modelo original sino a la cuantización GGUF publicada por mradermacher bajo el identificador `mradermacher/wayfinder-glimmer-30b-i1-GGUF`.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de ~28B parámetros con cuantizaciones que van desde 6,6 GB (IQ1_S) hasta 23,0 GB (Q6_K), usando cuantización con matriz de importancia (imatrix) generada específicamente para este modelo. Esto lo hace accesible para hardware de consumo de gama alta y para servidores con una sola GPU, algo imposible con los pesos originales en safetensors.

El modelo base está orientado a tareas agénticas y de recuperación de código, con licencia mixta Apache 2.0 y Muse Model License, y soporte declarado únicamente para inglés. La información pública disponible sobre arquitectura interna, contexto y datos de entrenamiento es limitada; los datos que faltan se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer; detalles no publicados) |
| Parámetros totales | 27.854.794.240 (~27,85B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0-and-muse-model-license (licencia mixta; enlace a LICENSE-MUSE-SPARK-OPEN.md) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `MongoDB/wayfinder-glimmer-30b` en la documentación proporcionada. Los metadatos indican que es un modelo transformer (etiqueta `transformers`), con 27.854.794.240 parámetros totales según los safetensors del modelo base, y que ha sido sometido a un proceso de fusión de LoRA (`lora-merged`), lo que sugiere un ajuste fino sobre un modelo preentrenado mediante adaptadores de bajo rango posteriormente integrados en los pesos. Las etiquetas `agentic`, `tool-use`, `subagent` y `code-search` apuntan a un entrenamiento orientado a tareas de agente y recuperación de código, aunque no se especifican volúmenes de tokens, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica principal de esta publicación concreta es la cuantización i1 con matriz de importancia (imatrix), generada mediante el método de mradermacher y disponible como archivo separado (`wayfinder-glimmer-30b.imatrix.gguf`, 0,1 GB) para que terceros puedan crear sus propias cuantizaciones. Las cuantizaciones i1 suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes, especialmente en rangos bajos (IQ2, IQ3). Existe además un repositorio de cuantizaciones estáticas en `mradermacher/wayfinder-glimmer-30b-GGUF`, que alberga los archivos `mmproj` si el modelo base es multimodal; la model card menciona que se trata de un modelo de visión, pero no se confirma la presencia de dichos archivos en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés.
- Búsqueda y recuperación de código (`code-search`), según las etiquetas del modelo.
- Uso de herramientas y llamada a funciones (`tool-use`), orientado a integración con APIs y entornos de ejecución.
- Comportamiento agéntico (`agentic`): planificación y ejecución de tareas multi-paso.
- Actuación como subagente (`subagent`) dentro de sistemas multi-agente coordinados.
- Posible soporte de visión: la model card de la cuantización indica "This is a vision model", aunque no se detallan capacidades multimodales concretas ni se confirman los archivos `mmproj` en el repositorio.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo de razonamiento explícito (`thinking mode`): no disponible en la información proporcionada.

## Casos de uso

- Búsqueda semántica de código en repositorios grandes: el modelo puede indexar y recuperar fragmentos relevantes a partir de consultas en lenguaje natural, aprovechando su especialización `code-search` para asistir a desarrolladores en la localización de funciones, clases o patrones concretos dentro de bases de código extensas.
- Asistente de refactorización guiado por herramientas: integrado mediante `tool-use`, puede invocar linters, compiladores o suites de tests para validar cambios propuestos, cerrando el ciclo de edición-verificación sin intervención humana en cada paso.
- Subagente en pipelines multi-agente: dentro de un sistema orquestado (por ejemplo, un agente planificador que delega subtareas), Wayfinder Glimmer 30B puede encargarse de la fase de localización de código y contexto, reduciendo la carga del agente principal.
- Automatización de revisión de código en CI/CD: el modelo puede analizar diffs y generar comentarios o sugerencias, integrándose en flujos de integración continua mediante llamadas a herramientas que consulten el estado del repositorio.
- Generación de documentación técnica a partir del código: dado su entrenamiento orientado a código, puede resumir módulos y producir documentación de API en inglés, con la ventaja de ejecutarse localmente en cuantizaciones Q4_K_M (17,0 GB) sobre una GPU de 24 GB.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en hardware propio mediante llama.cpp u Ollama con cuantizaciones de 10-20 GB, permite procesar código propietario sin enviar datos a servicios externos.
- Prototipado de agentes de investigación de código en estaciones de trabajo: con la cuantización IQ3_M (12,9 GB) cabe en GPUs de consumo como la RTX 4090, facilitando experimentación local con flujos agénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - IQ1_S (6,6 GB): ~8 GB de VRAM.
  - IQ2_M (9,9 GB): ~12 GB de VRAM.
  - IQ3_M (12,9 GB): ~15-16 GB de VRAM.
  - Q4_K_M (17,0 GB): ~19-21 GB de VRAM.
  - Q5_K_M (19,9 GB): ~22-24 GB de VRAM.
  - Q6_K (23,0 GB): ~26-28 GB de VRAM.
- GPU recomendadas:
  - RTX 4090 (24 GB): IQ4_XS, Q4_K_M, Q5_K_S y Q5_K_M con contexto moderado; Q6_K requiere offloading parcial a CPU.
  - RTX 3090 (24 GB): mismo perfil que la 4090, con menor throughput.
  - A100 40 GB / H100 80 GB: Q6_K completo con contexto amplio.
  - GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB): IQ3_M o IQ3_S con contexto reducido.
  - GPUs de 12 GB (RTX 3060 12 GB): IQ2_M o IQ2_S.
- Cabe en GPU de consumo: sí, desde IQ1_S (6,6 GB) hasta Q5_K_M (19,9 GB) en tarjetas de 24 GB; las cuantizaciones Q6_K pueden requerir offloading parcial.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no son opciones directas para GGUF, aunque el modelo base en safetensors podría servirse con ellos si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles; dependen de la cuantización, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Wayfinder Glimmer 30B (esta ficha, cuantizado) | ~27,85B | no disponible | code-search, agentic, tool-use | apache-2.0-and-muse-model-license | GGUF (i1 y estáticas) |
| Qwen2.5-Coder-32B | ~32B | 128K (según versión) | código | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | ~16B (MoE, 2,4B activos) | 128K | código | DeepSeek License | safetensors, GGUF |
| Codestral-22B | ~22B | 32K | código | MNPL (no comercial) | safetensors, GGUF |

La comparativa se ofrece a título orientativo con modelos de la misma categoría (asistentes de código de tamaño medio); no se dispone de datos de rendimiento de Wayfinder Glimmer 30B que permitan una comparación cuantitativa. La licencia mixta Apache 2.0 + Muse Model License es un factor diferencial que conviene revisar antes de un uso comercial.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia: la licencia es mixta (`apache-2.0-and-muse-model-license`) y remite a un archivo LICENSE-MUSE-SPARK-OPEN.md; es imprescindible revisar los términos de la Muse Model License antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de Apache 2.0.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo entrenado principalmente con datos en inglés y orientado a código, puede heredar sesgos de sus fuentes de entrenamiento.
- Alucinación: como todo modelo generativo, puede producir referencias a APIs, funciones o archivos inexistentes; en tareas de búsqueda de código conviene validar las salidas contra el repositorio real.
- Cuantizaciones de muy baja precisión: IQ1_S e IQ1_M (6,6-7,2 GB) están marcadas por el autor como "for the desperate" y "mostly desperate"; la degradación de calidad es significativa y no se recomiendan en producción.
- Contexto: no se dispone del dato de longitud de contexto, lo que impide planificar con precisión tareas que requieran ventanas largas.
- Visión: aunque la model card menciona que es un modelo de visión, no se confirman los archivos `mmproj` en la información disponible; la funcionalidad multimodal no está verificada.
- Soporte limitado: solo 1 like y 3.636 descargas en el momento de la consulta; el ecosistema de la comunidad en torno a este modelo es reducido, lo que limita la disponibilidad de guías y ajustes probados.
- Procedencia: el modelo base es de MongoDB y la cuantización de un tercero (mradermacher); la responsabilidad sobre la calidad final recae en la combinación de ambos, sin garantías del autor original sobre las cuantizaciones.

## Enlaces

- Repositorio de la cuantización i1: https://huggingface.co/mradermacher/wayfinder-glimmer-30b-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/wayfinder-glimmer-30b-GGUF
- Modelo base: https://huggingface.co/MongoDB/wayfinder-glimmer-30b
- Licencia Muse Model License: https://huggingface.co/hweller1/wayfinder-glimmer-30b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Página de descargas del cuantizador: https://hf.tst.eu/model#wayfinder-glimmer-30b-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
