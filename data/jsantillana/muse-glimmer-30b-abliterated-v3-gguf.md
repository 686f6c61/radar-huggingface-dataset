# jsantillana/Muse-Glimmer-30B-abliterated-v3-GGUF

## Resumen

Muse-Glimmer-30B-abliterated-v3-GGUF es una distribucion en formato GGUF del modelo Muse-Glimmer-30B en su variante "abliterated", publicada por el usuario jsantillana. El modelo base ha sido modificado mediante una tecnica de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) con el objetivo declarado de que el modelo cumpla peticiones que la version original rechazaria. La model card lo enmarca explicitamente como material para investigacion en seguridad defensiva, no para produccion.

El repositorio contiene unicamente pesos cuantizados en formato GGUF (Q3_K_M, Q4_K_M y Q8_0) sobre un modelo de aproximadamente 27.850 millones de parametros (27,85 B), lo que da un tamano de repositorio de 60,2 GB. No se especifica la arquitectura interna, la longitud de contexto, los idiomas soportados ni el dataset de entrenamiento en la informacion disponible.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados en el repositorio y con una licencia restrictiva (apache-2.0-restricted-research) que limita el uso comercial. Su interes principal radica en el estudio de tecnicas de abliteration y en la evaluacion de robustez de filtros de seguridad, no en su uso como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de ~27,85 B de parametros; detalles no publicados en el repo) |
| Parametros totales | 27.854.794.240 (27,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_M, Q4_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-restricted-research (etiquetada como "other") |
| Formato de pesos | GGUF (safetensors en el modelo padre, segun el dato de parametros) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El dato de parametros totales (27.854.794.240) proviene de los safetensors del modelo padre, lo que confirma que se trata de un transformer denso de aproximadamente 27,85 B de parametros, pero no se detalla el numero de capas, dimensiones ocultas, tipo de atencion ni estrategia de tokenizacion.

La innovacion tecnica documentada es el procedimiento de abliteration aplicado sobre el modelo base: "Dual-position Rank-2 [r_entry, r_exit], L24-L50". Esto indica que se identificaron y eliminaron direcciones de rechazo en dos posiciones (entrada y salida) mediante actualizaciones de rango 2 aplicadas a las capas 24 a 50 del modelo. La model card reporta resultados de un conjunto de 12 prompts emparejados: la tasa de cumplimiento directo pasa del 58 % al 41 %, la forzada del 50 % al 25 % y la de modo "think" del 50 % al 33 %. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (el tag "conversational" esta presente en el repositorio).
- Cumplimiento de peticiones que el modelo base rechazaria, segun la propia model card (efecto buscado de la abliteration).
- Modo "think" mencionado en los resultados de evaluacion, lo que sugiere algun tipo de razonamiento explicito o cadena de pensamiento, aunque no se detalla su funcionamiento.
- Uso orientado a investigacion en ciberseguridad defensiva (tag "cybersecurity").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en seguridad defensiva: el modelo sirve para estudiar como responde un modelo abliterated frente a prompts que el original rechaza, permitiendo medir la eficacia de filtros y clasificadores de seguridad en pipelines propios.
- Evaluacion de robustez de guardrails: se puede usar como contraparte en pruebas de red teaming controladas para validar que los sistemas de moderacion detectan contenido que un modelo sin alineamiento generaria.
- Analisis de tecnicas de abliteration: comparar las respuestas del modelo abliterated con las del modelo base (disponible en el repo padre) para cuantificar el efecto de la intervencion en capas 24-50.
- Experimentacion con cuantizaciones GGUF: los tres niveles publicados (Q3_K_M, Q4_K_M, Q8_0) permiten estudiar la degradacion de calidad y el impacto en el cumplimiento de rechazos segun la precision numerica.
- Despliegue local en entornos aislados: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en maquinas sin acceso a Internet para experimentos que no deban salir del laboratorio.
- Docencia e investigacion academica sobre alineamiento: util como ejemplo practico de como una intervencion de rango bajo en un subconjunto de capas altera el comportamiento de rechazo de un LLM.

## Benchmarks y rendimiento

La model card reporta unicamente resultados de un conjunto propio de 12 prompts emparejados, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.):

| Metrica (12 prompts emparejados) | Modelo base | Modelo abliterated |
|---|---|---|
| Cumplimiento directo | 58 % | 41 % |
| Cumplimiento forzado | 50 % | 25 % |
| Cumplimiento en modo "think" | 50 % | 33 % |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,85 B de parametros, Q8_0 requiere aproximadamente 28-30 GB de VRAM; Q4_K_M en torno a 16-18 GB; Q3_K_M en torno a 12-14 GB (estimaciones a partir del tamano de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q4_K_M; GPUs de 16 GB o menos solo con Q3_K_M y contextos reducidos.
- Cabe en GPU de consumo: si, en RTX 4090 con Q4_K_M y en GPUs de 16 GB con Q3_K_M, sujeto a la longitud de contexto efectiva (no disponible).
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento estandar del modelo, por lo que la comparativa se limita a parametros y disponibilidad:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterated-v3-GGUF | 27,85 B | no disponible | apache-2.0-restricted-research | GGUF | Abliterated, solo investigacion |
| Modelo padre Muse-Glimmer-30B-abliterated-v3 | 27,85 B | no disponible | no disponible | safetensors | Referencia sin cuantizar |
| Alternativas de ~30 B abliterated en GGUF | no disponible | no disponible | variable | GGUF | No se identifican alternativas concretas en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo abliterated: cumple peticiones que el modelo base rechaza, lo que lo hace inadecuado para produccion y para cualquier uso sin supervision.
- Licencia restrictiva: apache-2.0-restricted-research limita el uso a investigacion; el uso comercial no esta permitido segun la denominacion de la licencia.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la intervencion en capas 24-50 puede afectar a la coherencia, pero no hay datos al respecto.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no especificados, lo que impide garantizar calidad multilingue.
- Contexto maximo: no documentado, lo que complica el dimensionamiento de memoria en despliegue.
- Sin benchmarks estandar: no es posible comparar su calidad con modelos de tamano similar.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Los resultados de la evaluacion propia (12 prompts) son una muestra muy reducida y no constituyen evidencia robusta de comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v3-GGUF
- Repositorio del modelo padre: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v3
