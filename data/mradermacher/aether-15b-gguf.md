# mradermacher/Aether-15B-GGUF

## Resumen

Aether-15B-GGUF es la distribución en formato GGUF del modelo Aether-15B, desarrollado por K-Ai-Official y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 14.768 millones de parámetros (14,77 B) afinado a partir de la familia Qwen3, según indican las etiquetas del repositorio, y orientado a tareas de matemáticas, programación y conversación multilingüe en indonesio, inglés y japonés. El repositorio original se publica bajo licencia Apache 2.0.

El valor de esta ficha concreta reside en que mradermacher ha generado una batería de cuantizaciones estáticas en formato GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF, sin necesidad de GPUs de datacenter. El repositorio completo ocupa 102 GB, pero cada cuantización individual pesa entre 5,9 GB y 15,8 GB.

La información disponible sobre el modelo base es limitada: la model card del repositorio GGUF es fundamentalmente una ficha de cuantización y no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables en la información proporcionada y marca explícitamente como «no disponible» todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según etiquetas del repositorio); detalles internos no disponibles |
| Parametros totales | 14.768.307.200 (14,77 B) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; no hay quants ponderadas/imatrix en el momento de la publicación) |
| Idiomas soportados | Indonesio (id), inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base Aether-15B procede de K-Ai-Official y se etiqueta como derivado de Qwen3, lo que sugiere una arquitectura transformer decoder-only con las innovaciones habituales de esa familia. Sin embargo, la información proporcionada no incluye detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención, ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación). El dataset declarado es K-Ai-Official/Kai_v3, pero no se especifica su contenido ni su tamaño.

El repositorio que nos ocupa es una cuantización estática realizada por mradermacher con su pipeline habitual (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2). No se han generado cuantizaciones ponderadas ni imatrix en el momento de la publicación, y el autor indica que podrían no llegar a publicarse. Las cuantizaciones cubren desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), con Q4_K_M (9,1 GB) y Q4_K_S (8,7 GB) marcadas como «fast, recommended» y Q6_K (12,2 GB) como «very good quality».

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta «conversational» del repositorio.
- Razonamiento matemático, según las etiquetas «math» del modelo.
- Generación de código, según la etiqueta «coding».
- Capacidades multilingües limitadas a indonesio, inglés y japonés.
- Compatibilidad con endpoints (etiqueta «endpoints_compatible»), lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional en indonesio: el modelo está entrenado explícitamente para este idioma, por lo que puede gestionar atención al cliente o chatbots en ese mercado sin depender de traducción intermedia.
- Generación de código en entornos con recursos limitados: con la cuantización Q4_K_M (9,1 GB) puede ejecutarse en una GPU de consumo de 12-16 GB y utilizarse para autocompletado o generación de fragmentos en editores e IDE.
- Resolución de problemas matemáticos paso a paso: la etiqueta «math» sugiere entrenamiento específico; útil en herramientas educativas o de tutorización.
- Procesamiento de documentación técnica en japonés: combinado con su capacidad de código, puede emplearse para traducir o explicar documentación técnica entre japonés e inglés.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q2_K a Q4_K_S, el modelo cabe en equipos sin GPU dedicada de gama alta, permitiendo prototipado offline sin costes de API.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece diez variantes de cuantización del mismo modelo, lo que permite medir el impacto de la compresión en calidad y velocidad antes de fijar una configuración de producción.
- Fine-tuning posterior sobre dominio específico: al estar bajo Apache 2.0 y disponible en GGUF, puede servir como base para adaptaciones mediante LoRA en entornos con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluyendo overhead de contexto): aproximadamente el tamaño del fichero GGUF más 1-3 GB adicionales para KV cache y buffers, según longitud de contexto.
  - Q2_K: ~5,9 GB → cabe en GPUs de 8 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: 6,8-8,0 GB → GPUs de 8-10 GB.
  - Q4_K_S / Q4_K_M: 8,7-9,1 GB → GPUs de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080).
  - Q5_K_S / Q5_K_M: 10,4-10,6 GB → GPUs de 12-16 GB.
  - Q6_K: 12,2 GB → GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090).
  - Q8_0: 15,8 GB → GPUs de 24 GB (RTX 3090, RTX 4090) o A100/H100.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4; RTX 4090 o A100/H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: sí, desde Q2_K en 8 GB hasta Q8_0 en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero esta ficha cubre la distribución GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. Se indica a continuación lo que sí consta:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aether-15B (este) | 14,77 B | No disponible | Apache 2.0 | GGUF / safetensors | Derivado de Qwen3, idiomas id/en/ja |
| Qwen3 (familia) | No disponible en esta ficha | No disponible | No disponible en esta ficha | No disponible | Familia base declarada en las etiquetas |
| Alternativas de ~15 B | No disponible | No disponible | No disponible | No disponible | Sin datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta sesgos conocidos, riesgos de alucinación ni evaluaciones de seguridad del modelo base.
- El soporte idiomático se limita a indonesio, inglés y japonés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide garantizar su comportamiento en tareas de contexto largo.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- No se han publicado cuantizaciones ponderadas ni imatrix, que suelen mejorar la calidad por tamaño en comparaciones frente a las estáticas.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base original en K-Ai-Official/Aether-15B antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy baja y ausencia de validación comunitaria.
- El tamaño total del repositorio (102 GB) obliga a descargar únicamente la cuantización deseada, no el conjunto completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aether-15B-GGUF
- Modelo base: https://huggingface.co/K-Ai-Official/Aether-15B
- Dataset declarado: https://huggingface.co/datasets/K-Ai-Official/Kai_v3
- Página de descargas del cuantizador: https://hf.tst.eu/model#Aether-15B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
