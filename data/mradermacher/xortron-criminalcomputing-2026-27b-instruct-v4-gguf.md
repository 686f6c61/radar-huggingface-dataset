# mradermacher/XORTRON.CriminalComputing.2026.27B.Instruct.v4-GGUF

## Resumen

XORTRON.CriminalComputing.2026.27B.Instruct.v4-GGUF es una coleccion de cuantizaciones GGUF del modelo base darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.v4, publicada por mradermacher el 15 de marzo de 2026. El modelo base es un transformer denso de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors), derivado de la familia Qwen3.5-27B segun el enlace de licencia de la model card, y sometido a un proceso de "abliteration" o "decensoring" que elimina los mecanismos de rechazo y alineacion de seguridad del modelo original.

El repositorio no incluye pesos en formato transformers, sino exclusivamente ficheros GGUF en 12 cuantizaciones distintas (de Q2_K a Q8_0), ademas de dos ficheros mmproj (Q8_0 y f16) que indican capacidad multimodal de vision. El tamano total del repositorio es de 186,7 GB. La model card del cuantizador es puramente mecanica: describe los ficheros, tamanos y recomendaciones de uso, sin aportar informacion sobre arquitectura, entrenamiento, contexto o benchmarks.

La relevancia de esta ficha es doble: por un lado, documenta un caso tipico de modelo "uncensored" distribuido via GGUF para inferencia local con llama.cpp; por otro, advierte de que la ausencia de documentacion tecnica y de garantias de seguridad lo hace inadecuado para practicamente cualquier despliegue en produccion orientado al usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante; el enlace de licencia apunta a Qwen3.5-27B) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF exclusivamente (no hay safetensors en este repo; el dato de parametros proviene del modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Los datos disponibles indican que se trata de un transformer denso de ~27B parametros, presumiblemente basado en Qwen3.5-27B (el campo `license_link` de la model card apunta al LICENSE de Qwen/Qwen3.5-27B), aunque no se confirma oficialmente la relacion. El sufijo "Instruct" sugiere un ajuste supervisado para seguir instrucciones, pero no se documenta el proceso.

El aspecto mas relevante del entrenamiento es el etiquetado como "heretic", "uncensored", "decensored" y "abliterated": estas tecnicas modifican los pesos para suprimir la direccion de activacion asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder a contenido que el modelo original filtraria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La presencia de ficheros mmproj indica que el modelo base incorpora un encoder visual (capacidad multimodal), aunque no se detalla su arquitectura.

## Capacidades

- Generacion de texto conversacional en ingles, con formato Instruct.
- Capacidad multimodal de vision: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) necesarios para procesar imagenes con llama.cpp.
- Modo "uncensored": el modelo ha sido ablacionado para reducir rechazos, lo que implica que respondera a peticiones que el modelo original bloquearia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar empiricamente el efecto de la abliteration comparando sus respuestas con las del modelo base Qwen3.5-27B, en entornos controlados y aislados.
- Evaluacion de robustez de filtros: util para probar si los clasificadores de contenido de una plataforma detectan respuestas que un modelo sin censura produce ante prompts adversarios.
- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M (16,6 GB) y Q4_K_S (15,7 GB) caben en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) y permiten ejecutar el modelo sin conexion a servicios en la nube.
- Procesamiento de imagenes con llama.cpp: el par de ficheros mmproj habilita tareas de descripcion de imagenes o extraccion de informacion visual en local, aunque sin documentacion sobre calidad.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas sensibles (violencia, crimen, terror) que modelos alineados rechazan, siempre que el uso sea legitimo y no distribuible.
- Red teaming de aplicaciones: analisis de como un LLM sin censura puede ser utilizado para eludir salvaguardas en sistemas de moderacion, como parte de un ejercicio de seguridad autorizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se ha localizado informacion del modelo base en la busqueda realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,2 GB
  - Q3_K_M: ~13,4 GB
  - IQ4_XS: ~14,9 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,5 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - mmproj (vision): +0,7 GB (Q8_0) o +1,0 GB (f16)
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; A100 40 GB o H100 para Q8_0 con contexto largo; multiples GPUs o CPU+GPU offload para Q6_K y Q8_0.
- Cabe en consumer GPU: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB (RTX 4060 Ti, RTX 4080) solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XORTRON.CriminalComputing.2026.27B.Instruct.v4-GGUF | ~26,9 B | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal, solo ingles |
| Qwen3.5-27B (modelo base presumible) | ~27 B | no disponible | Apache 2.0 | safetensors | Alineado, multilingue, con benchmarks publicos |
| Otros modelos abliterated de ~27B (p. ej. variantes de Qwen) | ~27 B | variable | variable | GGUF / safetensors | Sin garantias de calidad ni benchmarks |

La comparacion cuantitativa con alternativas no es posible por falta de datos de rendimiento del modelo evaluado. La diferencia principal frente al modelo base es la eliminacion de rechazos y la disponibilidad exclusiva en GGUF, lo que limita su uso a inferencia local.

## Limitaciones y advertencias

- Modelo "uncensored" por diseno: la abliteration elimina los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o sexualmente explicito. No debe desplegarse en aplicaciones orientadas al publico sin una capa de moderacion externa.
- Ausencia total de documentacion tecnica: no hay informacion sobre dataset, contexto, benchmarks ni proceso de entrenamiento, lo que impide evaluar su calidad de forma objetiva.
- Riesgo elevado de alucinacion: sin benchmarks ni evaluaciones, no hay evidencia de fidelidad factual; la abliteration puede degradar la coherencia del modelo original.
- Solo ingles: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Licencia Apache 2.0 heredada del modelo base, pero el uso comercial de un modelo abliterated puede entrar en conflicto con las politicas de las plataformas de distribucion y con la normativa de moderacion de contenido (DSA en la UE, por ejemplo).
- El repositorio pesa 186,7 GB y contiene 12 cuantizaciones; descargar el conjunto completo no es necesario, pero requiere seleccionar el fichero adecuado.
- Los ficheros mmproj indican vision, pero no se documenta la calidad ni el soporte real de imagenes en llama.cpp para esta variante.
- Sin garantias de mantenimiento: el autor del modelo base (darkc0de) no publica informacion adicional y el cuantizador solo redistribuye.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/XORTRON.CriminalComputing.2026.27B.Instruct.v4-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.v4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/XORTRON.CriminalComputing.2026.27B.Instruct.v4-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#XORTRON.CriminalComputing.2026.27B.Instruct.v4-GGUF
- Licencia referenciada (Qwen3.5-27B): https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
