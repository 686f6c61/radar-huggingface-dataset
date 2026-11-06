# mradermacher/Magistral-Small-2509-Heretic-v1.2-GGUF

## Resumen

Magistral-Small-2509-Heretic-v1.2-GGUF es una cuantizacion estatica en formato GGUF del modelo grayarea/Magistral-Small-2509-Heretic-v1.2, publicada por mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo Magistral Small de Mistral AI, es decir, un ajuste fino orientado a eliminar los mecanismos de rechazo (refusals) del modelo original, manteniendo el resto de capacidades del modelo base. El modelo cuenta con 23.572.403.200 parametros (aproximadamente 23,6 mil millones) segun los pesos en safetensors del repositorio.

El modelo base es un derivado de la familia Magistral Small (edicion 2509), un modelo de lenguaje conversacional con capacidad de razonamiento explicito (thinking mode) desarrollado por Mistral AI. La variante Heretic v1.2 aplica tecnicas de "abliteration" y "MPOA" para reducir la censura del modelo, lo que lo hace relevante para investigadores que estudian el comportamiento de modelos sin alineamiento restrictivo, asi como para casos de uso creativos o de investigacion donde los rechazos del modelo original resultan limitantes.

La publicacion de mradermacher es puramente de cuantizacion: no modifica los pesos del modelo base, solo los convierte a formatos GGUF de 2 a 8 bits con el objetivo de facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye tambien archivos mmproj (multi-modal supplement) que sugieren soporte para entradas multimodales, aunque la model card no detalla esta capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Magistral Small de Mistral AI; detalles especificos no disponibles) |
| Parametros totales | 23.572.403.200 (23,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base grayarea/Magistral-Small-2509-Heretic-v1.2 deriva de Magistral Small 2509 de Mistral AI, un transformer decoder-only de aproximadamente 23,6 mil millones de parametros. La variante Heretic aplica tecnicas de abliteration (modificacion de direcciones de activacion asociadas al rechazo) y MPOA (Multi-Prompt Orthogonal Ablation, segun las etiquetas del repositorio) para eliminar la tendencia del modelo a rechazar peticiones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en esta variante especifica.

La contribucion de mradermacher se limita a la cuantizacion estatica de los pesos originales a formato GGUF mediante herramientas de llama.cpp. El repositorio incluye tambien cuantizaciones ponderadas/imatrix en un repositorio separado (Magistral-Small-2509-Heretic-v1.2-i1-GGUF), que suelen ofrecer mejor calidad por bit que las cuantizaciones estaticas. Los archivos mmproj indican que el modelo base podria tener capacidad multimodal (vision), aunque no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Magistral Small.
- Razonamiento explicito (thinking mode), segun la familia Magistral del modelo base.
- Capacidad multimodal potencial (archivos mmproj incluidos), aunque no confirmada en la model card.
- Comportamiento "uncensored" o "decensored": reduccion de rechazos ante peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Etiqueta `endpoints_compatible`, que sugiere compatibilidad con endpoints de inferencia estandar.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento y a las capacidades del modelo original, comparando respuestas con y sin el ajuste Heretic.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin los rechazos del modelo original, desplegado localmente con llama.cpp.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (14,4 GB) permiten ejecutar un modelo de 23,6 B en GPUs consumer de 16-24 GB de VRAM, algo inviable con los pesos completos en fp16.
- Prototipado rapido de asistentes conversacionales: gracias a los formatos GGUF y la compatibilidad con llama.cpp, Ollama y otros runners, se puede integrar en entornos de desarrollo sin infraestructura de GPU de datacenter.
- Analisis de sesgos y robustez: util para investigadores que necesitan un modelo con menos rechazos para generar datasets de prueba adversariales o estudiar respuestas del modelo en dominios sensibles.
- Evaluacion de cuantizaciones: el repositorio ofrece un rango completo de cuantizaciones (Q2 a Q8) que permite medir el impacto de la precision en la calidad de las respuestas para un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~9,0 GB
  - Q3_K_M: ~11,6 GB
  - IQ4_XS: ~13,0 GB
  - Q4_K_M: ~14,4 GB
  - Q5_K_M: ~16,9 GB
  - Q6_K: ~19,4 GB
  - Q8_0: ~25,2 GB
- Anadir aproximadamente 1-4 GB adicionales para la cache KV segun la longitud de contexto configurada.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) similar; A100/H100 para Q8_0 o contextos largos; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para Q3_K_M o IQ4_XS.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas de VRAM usando cuantizaciones Q3-Q4; en 24 GB con Q5-Q6.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Magistral-Small-2509-Heretic-v1.2-GGUF (este) | 23,6 B | no disponible | no disponible | GGUF | Variante decensored cuantizada |
| grayarea/Magistral-Small-2509-Heretic-v1.2 | 23,6 B | no disponible | no disponible | safetensors | Modelo base de esta cuantizacion |
| Magistral Small 2509 (Mistral AI) | ~24 B (familia) | no disponible | no disponible | safetensors | Modelo original con alineamiento estandar |
| mradermacher/Magistral-Small-2509-Heretic-v1.2-i1-GGUF | 23,6 B | no disponible | no disponible | GGUF (imatrix) | Misma base con cuantizaciones ponderadas |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica un mayor riesgo de generar contenido danino, sesgado o inapropiado; no es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: como cualquier LLM de su tamano, puede inventar hechos, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S).
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio rapido/calidad, y Q6_K o Q8_0 para maxima fidelidad.
- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base (Magistral Small de Mistral AI) antes de cualquier despliegue productivo.
- El modelo base es una modificacion no oficial de un modelo de Mistral AI; no cuenta con el respaldo del desarrollador original.
- La capacidad multimodal (archivos mmproj) no esta documentada en la model card; su funcionamiento no esta verificado.
- El repositorio tiene un numero bajo de descargas (262) y likes (2), lo que limita la validacion comunitaria de su calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Magistral-Small-2509-Heretic-v1.2-GGUF
- Modelo base: https://huggingface.co/grayarea/Magistral-Small-2509-Heretic-v1.2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Magistral-Small-2509-Heretic-v1.2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Magistral-Small-2509-Heretic-v1.2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
