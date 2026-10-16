# alst10/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP

## Resumen

El modelo `alst10/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP` es un repositorio de pesos GGUF cuantizados con el formato propietario ROCmFPX, generado por el usuario alst10 a partir del modelo original de DavidAU. No se trata de un entrenamiento nuevo, sino de una conversión de cuantización del modelo base `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, que a su vez es un ajuste fino y merge multi-etapa construido sobre Qwen3.5-9B. El repositorio pesa 72,6 GB y contiene doce ficheros GGUF con distintas cuantizaciones (desde Q2 hasta Q8, además de variantes ROCmFP4 optimizadas).

El modelo pertenece a la categoría de modelos "uncensored" o "abliterated", es decir, versiones con los mecanismos de rechazo atenuados o eliminados, orientadas a generación de texto sin filtros. Con 9.197.093.888 parámetros (unos 9,2 mil millones), está pensado para ejecución local en hardware de consumo. La relevancia de este repositorio concreto radica en que empaqueta el modelo en formato ROCmFPX, una variante de cuantización optimizada para GPUs AMD mediante la extensión ROCmFPX de llama.cpp, con lo que se cubre un nicho habitualmente peor atendido que el de CUDA.

Cabe señalar que el repositorio acumula cero descargas y cero "likes" en el momento de la consulta, y que la información publicada por el autor se limita prácticamente a la tabla de ficheros y a las instrucciones de compilación. No hay model card detallada del modelo original incluida aquí, ni datos de contexto, idiomas o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de Qwen3.5-9B; el autor no especifica la arquitectura en esta ficha) |
| Parametros totales | 9.197.093.888 (≈9,2 mil millones, dato de safetensors del repo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0_ROCMFPX, Q3_0_ROCMFPX, Q4_0_ROCMFP4, Q4_0_ROCMFP4_FAST, Q4_0_ROCMFP4_COHERENT, Q4_0_ROCMFP4_FAST_COHERENT, Q4_0_ROCMFP4_LEAN, Q4_0_ROCMFP4_STRIX, Q4_0_ROCMFP4_STRIX_LEAN, Q6_0_ROCMFPX, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 segun la model card del autor (el metadato de HuggingFace figura como "no disponible") |
| Formato de pesos | GGUF (variantes ROCmFP4 y ROCmFPX) |
| Tamano del repositorio | 72,6 GB |
| Modelo base | DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP |
| Etiquetas | gguf, endpoints_compatible, region:us, conversational |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

Este repositorio no aporta información sobre la arquitectura interna ni sobre el proceso de entrenamiento. Lo único documentado es que se trata de una conversión de pesos: los GGUF se han generado a partir del modelo de DavidAU mediante la herramienta `charlie12345/ROCmFPX`, que implementa cuantizaciones ROCmFPX y ROCmFP4 sobre llama.cpp para GPUs AMD. Por tanto, toda decisión de arquitectura, composición del dataset, número de tokens de entrenamiento o técnicas de alineación (RLHF, DPO) corresponde al modelo base original, no a este repositorio.

Según las fuentes de búsqueda, el modelo de DavidAU es un "fine-tune y merge multi-etapa, multi-modelo" que incorpora varios de sus anteriores modelos de 9B, y la nomenclatura del nombre incluye referencias a IMATRIX (formato de cuantización con calibración por importancia) y MTP (multi-token prediction, una variante orientada a velocidad de decodificación). No se dispone de cifras verificables sobre tokens de entrenamiento ni sobre la metodología exacta del merge. La única innovación técnica confirmada en este repositorio es el uso del formato ROCmFPX/ROCmFP4, que busca mejorar la relación calidad-tamaño de las cuantizaciones de 4 bits sobre hardware AMD.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la naturaleza del modelo base apuntan a uso en diálogo multi-turno; no se documentan formalmente las capacidades en esta ficha.
- Generación sin filtros: el modelo se comercializa explícitamente como "uncensored" y "Heretic", con los rechazos atenuados o eliminados.
- Razonamiento y conocimiento general: el autor del modelo base afirma que supera benchmarks de Qwen 3.5 9B, Qwen3.5 27B y Qwen3.6 35B-A3B, y que iguala a Qwen 3.6 27B en algunos casos, tanto en 4 como en 8 bits (afirmación del autor, sin cifras publicadas en la información disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: existe una cuantización específica etiquetada `AGENT` (Q8_0_ROCMFPX_AGENT), lo que sugiere un ajuste orientado a uso agéntico, pero no hay documentación que lo confirme.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Multi-token prediction (MTP): la nomenclatura del modelo sugiere soporte de decodificación MTP orientada a velocidad, pero no se detalla su funcionamiento en esta ficha.

## Casos de uso

- Escritura creativa y narrativa sin restricciones de contenido: el modelo está diseñado para producir texto sin los filtros habituales de seguridad, lo que lo hace adecuado para ficción, guiones o roleplay donde otros modelos rechazan la petición. Requiere revisión humana del resultado.
- Asistente conversacional local y privado: al ejecutarse en formato GGUF sobre llama.cpp, permite desplegar un chatbot en una máquina propia sin enviar datos a servicios externos, algo relevante para entornos con requisitos de confidencialidad.
- Experimentación en "abliterated model research": investigadores que estudian el efecto de eliminar los mecanismos de rechazo pueden usar este modelo como referencia frente a su versión alineada.
- Prototipado rápido en estaciones AMD: la compilación con ROCmFPX permite aprovechar GPUs Radeon para inferencia local, cubriendo un nicho donde las alternativas suelen estar optimizadas solo para CUDA.
- Despliegue en hardware de gama media: las cuantizaciones Q4 (4,58-5,64 GB) y Q3 (4,76 GB) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM, lo que habilita pruebas de concepto en portátiles o equipos de sobremesa.
- Generación de texto por lotes y pipelines de contenido: la variante Q8_0_ROCMFPX_AGENT sugiere uso en flujos automatizados donde se encadenan llamadas al modelo; conviene validar que el tool calling funciona antes de integrarlo, ya que no está documentado.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce ficheros con distintos esquemas (COHERENT, LEAN, STRIX, FAST), lo que permite medir empíricamente la degradación de calidad y el impacto en velocidad de cada formato ROCmFPX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor del modelo base afirma en las fuentes de búsqueda que supera 7 de 7 benchmarks frente a Qwen 3.5 9B, Qwen3.5 27B y Qwen3.6 35B-A3B, y que iguala a Qwen 3.6 27B en algunos casos, en cuantizaciones de 4 y 8 bits. No se proporcionan los nombres de los benchmarks ni las puntuaciones numéricas en la información disponible, por lo que estas afirmaciones no pueden verificarse.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos, sin contar caché KV ni overhead):
  - Q2_0_ROCMFPX: 3,17 GB.
  - Q4_0_ROCMFP4_FAST: 4,58 GB; Q4_0_ROCMFP4_STRIX_LEAN: 4,75 GB; Q4_0_ROCMFP4_FAST_COHERENT: 4,85 GB; Q4_0_ROCMFP4_STRIX: 4,88 GB; Q4_0_ROCMFP4_LEAN: 4,97 GB; Q4_0_ROCMFP4_COHERENT: 5,09 GB; Q4_0_ROCMFP4: 5,64 GB.
  - Q3_0_ROCMFPX: 4,76 GB.
  - Q6_0_ROCMFPX: 7,06 GB.
  - Q8_0_ROCMFPX: 8,85 GB; Q8_0_ROCMFPX_AGENT: 9,01 GB.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, las cuantizaciones Q4 encajan en GPUs de 8-12 GB; Q8 pide 12-16 GB. Para ROCmFPX se requiere una GPU AMD compatible con ROCm (serie Radeon RX 6000/7000 o Instinct); no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? Sí, las variantes Q2 a Q4 caben en tarjetas de consumo de 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB o equivalentes Radeon con ROCm). Las variantes Q8 quedan al límite en 12 GB y son más cómodas en 16 GB o superiores.
- Opciones de despliegue: llama.cpp compilado con el fork ROCmFPX (única ruta documentada por el autor, con `-DGGML_CUDA=OFF -DGGML_NATIVE=ON`). Al ser GGUF, teóricamente también es compatible con otros runners GGUF estándar, pero no está verificado que interpreten los formatos ROCmFP4/ROCmFPX propietarios.
- Latencia y throughput: no disponible. El modelo base incluye la etiqueta MTP (multi-token prediction) orientada a mejorar la velocidad de decodificación, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alst10/…-NEO-IMATRIX-MAX-MTP (este repo) | ≈9,2 B | no disponible | GGUF (ROCmFP4/ROCmFPX) | CC BY 4.0 segun model card | 12 ficheros, 72,6 GB, 0 descargas |
| DavidAU/…-NEO-IMATRIX-MAX-MTP (base) | ≈9,2 B | no disponible | safetensors y GGUF (IMATRIX) | no disponible en la informacion proporcionada | Repositorio original del ajuste fino |
| Qwen3.5-9B (modelo de partida) | ≈9 B | no disponible | safetensors | no disponible en la informacion proporcionada | Modelo fundacional de referencia |

No se dispone de datos de rendimiento comparativos (MMLU, HumanEval, GSM8K u otros) ni de especificaciones de contexto para ninguno de los tres, por lo que la comparación se limita a parámetros, formato y disponibilidad. Las afirmaciones del autor sobre superioridad frente a Qwen3.5 27B o Qwen3.6 35B-A3B no vienen acompañadas de cifras verificables.

## Limitaciones y advertencias

- Modelo sin censura: al estar diseñado para eliminar los rechazos, puede generar contenido ofensivo, ilegal, peligroso o desinformativo. No es apto para aplicaciones orientadas al público sin una capa de moderación adicional.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual, y los ajustes finos agresivos sobre modelos pequeños tienden a degradar la precisión en tareas de conocimiento.
- Repositorio con cero adopción: cero descargas y cero "likes" en el momento de la consulta, sin validación por parte de la comunidad. No hay evidencia externa de que las cuantizaciones ROCmFPX funcionen correctamente.
- Formato propietario y poco extendido: ROCmFP4 y ROCmFPX requieren un fork específico de llama.cpp (`charlie12345/ROCmFPX`). Es probable que no funcionen en herramientas estándar como Ollama, LM Studio o vLLM sin conversión previa.
- Dependencia de hardware AMD: la ruta documentada está pensada para ROCm; en GPUs NVIDIA o en CPU habría que recurrir a otra cuantización del modelo base.
- Licencia: la model card declara CC BY 4.0, que permite uso comercial con atribución, pero el metadato de HuggingFace figura como "no disponible" y no se aclaran las condiciones del modelo base ni de los modelos fundacionales subyacentes. Conviene verificar la licencia del modelo original de DavidAU y de Qwen3.5 antes de un uso comercial.
- Idiomas y contexto sin especificar: no se documenta la ventana de contexto ni la cobertura lingüística, lo que impide planificar despliegues multilingües o con documentos largos.
- Metadata sospechosa: la fecha de creación (2026-10-15) y la denominación "Qwen3.5" no se corresponden con ningún lanzamiento público conocido en el momento de redactar esta ficha, lo que debe tenerse en cuenta al evaluar la fiabilidad del repositorio.
- Sin benchmarks verificables: las afirmaciones de rendimiento provienen únicamente del autor y no incluyen puntuaciones numéricas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alst10/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- GGUF del modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Herramienta ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Ficha en abliteratedmodels.org: https://abliteratedmodels.org/qwen3.5-9b-the-defiant-fable-uncensored-heretic/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-davidau
- Noticia en localainews.co: https://www.localainews.co/news/multimodal/qwen3-5-9b-the-defiant-fable-uncensored-heretic-neo-imatrix-max-mtp-gguf-roars/
