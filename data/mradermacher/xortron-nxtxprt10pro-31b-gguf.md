# mradermacher/XORTRON-NXTXPRT10PRO-31B-GGUF

## Resumen

XORTRON-NXTXPRT10PRO-31B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo base darkc0de/XORTRON-NXTXPRT10PRO-31B, publicada por el cuantizador mradermacher. El modelo original es un transformer de aproximadamente 30.700 millones de parámetros (30,697,345,596 según los pesos en safetensors) afinado a partir de una base no especificada y etiquetado explícitamente por su autor como "uncensored", "abliterated", "heretic" y "toxic", lo que indica que se ha eliminado o reducido deliberadamente el alineamiento de seguridad del modelo de partida.

La relevancia de esta publicación es práctica: el repositorio ofrece 12 variantes de cuantización GGUF (desde Q2_K de 12,0 GB hasta Q8_0 de 32,7 GB) más dos suplementos multimodales mmproj (Q8_0 y f16), lo que permite ejecutar un modelo de 31B en hardware de consumo mediante llama.cpp u Ollama. El modelo está pensado exclusivamente para inglés y se distribuye bajo licencia Apache 2.0.

Es importante subrayar que esta ficha documenta una cuantización, no el modelo original: no se dispone de información sobre el dataset de entrenamiento, la longitud de contexto, los resultados de benchmarks ni el proceso de alineamiento del modelo base. Las etiquetas del autor ("harmful", "toxic", "abliterated") deben tomarse como advertencia operativa, no como una descripción neutral de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); se distribuye con suplementos multimodales mmproj, lo que sugiere capacidad de visión en el modelo base |
| Parametros totales | 30.697.345.596 (≈30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos mmproj en Q8_0 y f16. Existen cuantizaciones con imatrix en el repo i1-GGUF del mismo autor |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base darkc0de/XORTRON-NXTXPRT10PRO-31B más allá de que es un transformer de 30,7B parámetros compatible con la librería transformers. El repositorio de cuantización incluye ficheros mmproj, lo que implica que el modelo base incorpora un proyector multimodal para entrada de imágenes, aunque no se detalla qué codificador visual utiliza ni cómo se entrenó.

Tampoco hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Las etiquetas "abliterated" y "heretic" indican que el modelo base ha sido sometido a un proceso de eliminación de direcciones de rechazo (abliteration) para reducir las negativas del modelo a peticiones sensibles; "uncensored" y "toxic" refuerzan esa interpretación. No se documenta la metodología concreta de ese proceso ni sus efectos medidos sobre el rendimiento general.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (el repo está etiquetado como "conversational").
- Entrada multimodal: los ficheros mmproj incluidos permiten procesar imágenes junto con texto en llama.cpp, siempre que el modelo base soporte visión.
- Razonamiento y generación de código: capacidades esperables en un modelo de 31B, pero no verificadas con benchmarks publicados.
- Respuestas sin filtros de seguridad: el modelo está diseñado explícitamente para no rechazar peticiones que un modelo alineado rechazaría.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo de razonamiento explícito (thinking): no disponible (no documentado).

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como caso de estudio de un modelo "abliterated" para analizar qué tipos de contenido genera y cómo se degrada la utilidad general tras eliminar los rechazos. Requiere aislamiento y supervisión.
- Evaluación de cuantizaciones GGUF: comparar la perplejidad y la calidad de salida entre Q4_K_M, Q5_K_M y Q8_0 sobre el mismo prompt permite calibrar el impacto de la cuantización en un modelo de 31B, usando el repo i1-GGUF como referencia de cuantización con imatrix.
- Despliegue local en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (18,8 GB) cabe en una RTX 4090 de 24 GB y permite inferencia offline sin dependencia de API, útil para prototipos que no pueden enviar datos a la nube.
- Generación de texto creativo sin restricciones temáticas: para proyectos de ficción que abordan violencia, contenido adulto o temas controvertidos donde un modelo alineado rechazaría la petición; requiere revisión humana del output.
- Pruebas de robustez y red teaming: generar respuestas adversariales para entrenar clasificadores de toxicidad o evaluar filtros de moderación propios, usando el modelo como generador de casos negativos.
- Experimentos multimodales locales: con el fichero mmproj-f16 (1,3 GB) y una cuantización Q4_K_M, se puede montar un pipeline de descripción de imágenes en llama.cpp sin servicios externos, útil para investigación de privacidad.
- Benchmarking de hardware: medir throughput y latencia de un modelo de 31B en distintas configuraciones (CPU, GPU única, offloading parcial) con las distintas cuantizaciones del repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del autor de la cuantización ni los metadatos del repositorio incluyen datos de MMLU, HumanEval, GSM8K ni evaluaciones de toxicidad o de tasa de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~12,0 GB de pesos; ~13-14 GB con contexto moderado.
  - Q3_K_M: ~15,4 GB; ~17 GB en uso real.
  - IQ4_XS: ~17,0 GB; ~19 GB en uso real.
  - Q4_K_M: ~18,8 GB; ~20-21 GB en uso real, ajustado para GPU de 24 GB.
  - Q5_K_M: ~21,9 GB; ~23-24 GB, al límite de una RTX 4090.
  - Q6_K: ~25,3 GB; requiere GPU de 32 GB o offloading parcial.
  - Q8_0: ~32,7 GB; requiere A100 40 GB, L40S, H100 o similar.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0; RTX 3090 (24 GB) también válida para Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con offloading parcial a RAM o con Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (el repo está etiquetado con text-generation-inference).
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XORTRON-NXTXPRT10PRO-31B (este) | 30,7B | no disponible | Apache 2.0 | GGUF + safetensors | Sin alineamiento de seguridad; solo inglés |
| darkc0de/XORTRON-NXTXPRT10PRO-31B | 30,7B | no disponible | Apache 2.0 | safetensors | Modelo base del que derivan estas cuantizaciones |
| Gemma 2 27B (Google) | 27B | 8K | Gemma License | GGUF, safetensors | Alineado, multilingüe, benchmarks publicados |
| Qwen2.5 32B (Alibaba) | 32,5B | 128K | Apache 2.0 | GGUF, safetensors | Alineado, multilingüe, tool calling documentado |

La comparación con Gemma 2 27B y Qwen2.5 32B es por tamaño y categoría, no por comportamiento: ambos son modelos alineados con documentación técnica pública y benchmarks, mientras que XORTRON carece de cualquiera de los dos. No se dispone de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo explícitamente "uncensored", "abliterated" y etiquetado como "toxic" y "harmful": puede generar contenido dañino, ilegal o sexualmente explícito sin filtros. No apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación y de degradación de la utilidad general tras el proceso de abliteration; no hay evaluaciones que cuantifiquen esa degradación.
- Solo soporta inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin verificación empírica.
- Sin benchmarks publicados: imposible comparar su calidad con modelos alineados de tamaño similar de forma objetiva.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado; la licencia no exime de cumplir normativa de moderación de contenido.
- El repositorio ocupa 213,9 GB en total; descargar todas las cuantizaciones no es necesario, pero conviene seleccionar un único fichero.
- El modelo base no documenta su procedencia de entrenamiento, lo que impide evaluar riesgos de copyright o de sesgo en los datos.
- Los ficheros mmproj requieren una build de llama.cpp con soporte multimodal; no todos los runtimes los procesan.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/XORTRON-NXTXPRT10PRO-31B-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-NXTXPRT10PRO-31B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/XORTRON-NXTXPRT10PRO-31B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#XORTRON-NXTXPRT10PRO-31B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
