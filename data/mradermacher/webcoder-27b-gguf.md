# mradermacher/WebCoder-27B-GGUF

## Resumen

WebCoder-27B-GGUF es la versión cuantizada en formato GGUF del modelo Roy-DOU/WebCoder-27B, un modelo de lenguaje de 27.320.697.856 parámetros (≈27,3 B) especializado en generación de código para desarrollo web y frontend. La cuantización la ha realizado mradermacher, un autor habitual de conversiones GGUF para llama.cpp, e incluye un conjunto completo de variantes que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de ficheros de proyector multimodal (mmproj) en f16 y Q8_0.

El modelo base se distribuye bajo licencia Apache 2.0 y está etiquetado como modelo entrenado mediante aprendizaje por refuerzo (pipeline `reinforcement-learning`) sobre el dataset Roy-DOU/Webdev-Bench, con etiquetas que apuntan a casos de uso de agente, código, frontend y desarrollo web. Está declarado únicamente para inglés.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de 27B especializado en web en hardware de consumo mediante cuantización K-quant, algo que el repositorio original en safetensors (190,8 GB de repo) no facilita. No obstante, la model card del cuantizador es puramente mecánica y no aporta datos de arquitectura, contexto ni evaluación, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura; el modelo tiene 27.320.697.856 parámetros y pipeline declarado `reinforcement-learning`) |
| Parametros totales | 27.320.697.856 (≈27,3 B), dato de safetensors del modelo base |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Tamaños de los ficheros publicados: Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB; mmproj-Q8_0 0,7 GB; mmproj-f16 1,0 GB.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El dato objetivo es el recuento de parámetros (27.320.697.856) y la etiqueta de pipeline `reinforcement-learning`, que indica que el ajuste final del modelo se realizó mediante aprendizaje por refuerzo, presumiblemente orientado a tareas de desarrollo web. El dataset declarado es Roy-DOU/Webdev-Bench, propiedad del autor del modelo base.

Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus, la existencia de fases de SFT/RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de ficheros `mmproj` (proyector multimodal) en el repositorio sugiere que el modelo base incorpora alguna capacidad multimodal que requiere un proyector separado para su uso en llama.cpp, pero la model card no lo confirma ni describe qué modalidad adicional soporta.

La aportación concreta de este repositorio es la conversión y cuantización: cuantizaciones estáticas (no imatrix) generadas con el flujo habitual de mradermacher, con `quantize_version: 2` y `output_tensor_quantised: 1`. Existe además un repositorio hermano con cuantizaciones ponderadas con imatrix (mradermacher/WebCoder-27B-i1-GGUF), que el autor recomienda en general frente a cuantizaciones del mismo tamaño sin imatrix.

## Capacidades

- Generación de código orientada a desarrollo web: HTML, CSS, JavaScript y componentes de interfaz, según las etiquetas `code`, `frontend` y `web-development`.
- Comportamiento de agente: la etiqueta `agent` indica que el modelo fue ajustado para flujos con múltiples pasos, aunque no se documenta el protocolo de tool calling soportado.
- Ajuste por refuerzo sobre un benchmark específico de desarrollo web (Webdev-Bench), lo que sugiere optimización para tareas de construcción de páginas y aplicaciones.
- Conversación multiturno: el repositorio está marcado como `conversational` y `endpoints_compatible`.
- Posible entrada multimodal a través de los proyectores mmproj publicados (no documentado en la model card).
- Multilingüismo: limitado al inglés según el campo `language`.
- No se documenta modo de razonamiento explícito (thinking mode), soporte de audio ni otras capacidades especiales.

## Casos de uso

- Generación de componentes frontend: el modelo puede producir fragmentos de HTML/CSS/JS a partir de una descripción textual, aprovechando su ajuste específico sobre datos de desarrollo web; útil para prototipado rápido de interfaces.
- Asistente de código en IDE con despliegue local: al estar en GGUF, se puede servir con llama.cpp u Ollama en una estación de trabajo y ofrecer autocompletado o generación de funciones sin enviar código a la nube.
- Agente de construcción de sitios: con la etiqueta `agent`, encaja en pipelines donde el modelo planifica y ejecuta pasos (crear ficheros, generar estilos, añadir scripts) sobre un repositorio, siempre que se implemente el orquestador externo.
- Conversión de bocetos o capturas a maquetación: si se confirma la capacidad multimodal mediante los ficheros mmproj, podría emplearse para transformar una imagen de referencia en estructura HTML/CSS; requiere validación previa porque no está documentado.
- Generación de pruebas end-to-end para aplicaciones web: producir escenarios de test (por ejemplo, con Playwright o Cypress) a partir de la descripción de flujos de usuario.
- Refactorización y modernización de CSS heredado: reescritura de hojas de estilo a nuevas convenciones o a un framework concreto, con la ventaja de ejecución local sobre código propietario.
- Documentación técnica de APIs y frameworks: generación de guías y ejemplos de uso en inglés, tarea alineada con el dominio web del ajuste.
- Entornos con requisitos de soberanía del dato: al ser Apache 2.0 y ejecutable en local, permite uso comercial interno sin depender de proveedores externos, sujeto a las advertencias de la sección de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni evaluaciones sobre Webdev-Bench, y el repositorio base no aporta cifras en los datos suministrados. No se debe asumir ningún nivel de rendimiento a partir de las etiquetas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q2_K ≈11,0 GB; Q3_K_S ≈12,4 GB; Q4_K_S ≈15,9 GB; Q4_K_M ≈16,9 GB; Q5_K_M ≈19,6 GB; Q6_K ≈22,5 GB; Q8_0 ≈29,1 GB; F16 ≈54,6 GB (27,32 B × 2 bytes). Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): solo viable con Q2_K o Q3_K_S, con degradación de calidad perceptible.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080): Q3_K_M/Q3_K_L o IQ4_XS con contexto moderado.
- GPU de 24 GB (RTX 3090, RTX 4090): Q4_K_M o Q5_K_M con margen para caché KV; Q6_K muy justo; Q8_0 requiere reparto en dos GPU o offload parcial a CPU.
- GPU profesional: A100 40/80 GB y H100 permiten Q8_0 o F16 con contexto largo; L40S 48 GB cubre Q8_0 con holgura.
- Cabe en GPU de consumo: sí, desde Q2_K en 12 GB hasta Q4_K_M en 24 GB; las variantes Q8_0 y F16 quedan fuera de una sola tarjeta consumer.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj solo se aprovechan en llama.cpp con el soporte multimodal correspondiente. Para despliegues de alta concurrencia conviene el repositorio base en safetensors con vLLM o TGI, ya que GGUF está pensado para inferencia local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/WebCoder-27B-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF (12 cuantizaciones + mmproj) | Cuantización estática, orientada a ejecución local |
| Roy-DOU/WebCoder-27B | 27,3 B | no disponible | Apache 2.0 | safetensors | Modelo base original; repo de 190,8 GB; requiere runtime de alto nivel |
| mradermacher/WebCoder-27B-i1-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantización ponderada, recomendada por el autor frente a las estáticas de tamaño similar |
| Alternativas de código de ~30 B de otras familias | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de benchmarks ni especificaciones de terceros que permitan una comparación rigurosa |

No es posible establecer una comparación de rendimiento con modelos de la misma categoría porque no hay resultados de evaluación publicados en la información disponible.

## Limitaciones y advertencias

- Idioma: el modelo está declarado solo para inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en generación de código, razonamiento o tareas de agente, lo que impide estimar su competitividad frente a modelos coder establecidos.
- Riesgo de alucinación: es un modelo de 27B ajustado con refuerzo sobre un dominio concreto; puede inventar APIs, nombres de propiedades CSS o funciones de framework inexistentes. Requiere verificación automática en producción.
- Sobreajuste al dominio: el ajuste con RL sobre Webdev-Bench puede degradar el rendimiento en tareas ajenas al desarrollo web (matemáticas, razonamiento general, otros lenguajes de programación).
- Cuantización: las variantes Q2_K y Q3_K_S pierden calidad de forma notable; para uso en producción se recomienda Q4_K_M o superior, o la variante imatrix del repositorio i1.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o sobre repositorios grandes sin conocer la ventana real del modelo base.
- Capacidad multimodal no documentada: los ficheros mmproj existen, pero no se especifica qué modalidad cubren ni con qué calidad; no debe asumirse soporte de visión en producción sin pruebas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor del cuantizado no ofrece garantías y la procedencia de los datos de entrenamiento del modelo base no está documentada, lo que puede tener implicaciones de cumplimiento.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre el proceso de alineación del modelo base.
- Fecha de publicación: el repositorio aparece creado el 2026-10-25 y sin descargas ni valoraciones, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/WebCoder-27B-GGUF
- Modelo base: https://huggingface.co/Roy-DOU/WebCoder-27B
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/WebCoder-27B-i1-GGUF
- Dataset de entrenamiento/evaluación: https://huggingface.co/datasets/Roy-DOU/Webdev-Bench
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#WebCoder-27B-GGUF
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que soporta la infraestructura del cuantizador: https://www.nethype.de/
