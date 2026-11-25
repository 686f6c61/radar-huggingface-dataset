# mradermacher/Inkling-2-Mini-Abliterated-Healed-GGUF

## Resumen

Inkling-2-Mini-Abliterated-Healed-GGUF es una cuantizacion en formato GGUF del modelo derrickNg1412/Inkling-2-Mini-Abliterated-Healed, publicada por mradermacher. El modelo base es una variante "abliterated" (con los mecanismos de rechazo suprimidos) y "healed" (recuperada mediante DPO y KL-healing) de un modelo multimodal de tipo Mixture of Experts denominado Inkling-2-Mini, orientado a conversacion en ingles. Esta publicacion concreta no es un modelo nuevo, sino un conjunto de pesos cuantizados listos para ejecucion en llama.cpp y entornos compatibles con GGUF.

El modelo cuenta con aproximadamente 26.070 millones de parametros totales (segun el dato real de safetensors del repositorio base) y arquitectura MoE con la etiqueta interna inkling2_loop. Incluye un modulo multimodal (mmproj) que permite procesar imagenes ademas de texto. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

La relevancia de esta ficha reside en que ofrece una via de despliegue local eficiente de un modelo MoE multimodal de ~26B mediante cuantizacion GGUF, con opciones que van desde Q2_K (11,0 GB) hasta Q8_0, y con el componente mmproj separado para vision. Al tratarse de una variante abliterated, esta pensada para casos donde se requiere minimizar los rechazos del modelo, con las advertencias de seguridad que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), etiqueta inkling2_loop; multimodal con modulo mmproj |
| Parametros totales | 26.070.385.152 (~26,07B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de tipo Mixture of Experts (MoE) con la etiqueta interna inkling2_loop, e incorpora capacidades multimodales mediante un proyector mmproj que se distribuye como archivo GGUF independiente (Q8_0 de 0,4 GB y f16 de 0,7 GB). El proceso de creacion de la variante incluye tecnicas de abliteration (supresion de direcciones de rechazo), seguido de un proceso de "healing" mediante DPO (Direct Preference Optimization) y KL-healing, segun las etiquetas del autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO.

Las cuantizaciones publicadas son estaticas y generadas con quantize_version 2 y output_tensor_quantised 1, con convert_type hf. El autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento multimodal de imagenes mediante el modulo mmproj (Q8_0 o f16).
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo "abliterated": minimiza los rechazos del modelo ante peticiones que normalmente serian denegadas.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Conversacion local sin censura: el modelo, al estar abliterated, permite mantener dialogos donde el modelo base tenderia a rechazar temas sensibles; util para investigacion sobre alineacion y comportamiento de modelos.
- Procesamiento de imagenes con descripcion textual: mediante el archivo mmproj, se pueden enviar imagenes junto a prompts de texto para tareas de captioning o analisis visual, ejecutandose en llama.cpp con soporte multimodal.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K (11,0 GB) y Q4_K_S (16,2 GB) permiten ejecutar un modelo MoE de ~26B en GPUs consumer de gama alta, algo inviable con los pesos originales en f16.
- Prototipado rapido de asistentes conversacionales en ingles: la cuantizacion Q4_K_S esta marcada como "fast, recommended" por el autor, adecuada para iteracion rapida en entornos de desarrollo.
- Investigacion sobre tecnicas de abliteration y healing: el modelo permite comparar el comportamiento de la variante abliterated frente al modelo base original en tareas de rechazo y seguridad.
- Evaluacion de cuantizacion en arquitecturas MoE multimodales: los distintos niveles de cuantizacion (de Q2_K a Q8_0) permiten estudiar el impacto de la compresion en la calidad de un MoE con componente visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,0 GB.
  - Q4_K_S: ~16,2 GB.
  - Q8_0: no disponible el tamano exacto en la informacion, pero superior a Q4_K_S.
  - mmproj Q8_0: ~0,4 GB adicionales; mmproj f16: ~0,7 GB adicionales.
- GPU recomendadas: no especificadas por el autor. Por tamano, Q4_K_S (~16,2 GB) requiere GPUs con al menos 20-24 GB de VRAM (RTX 3090, RTX 4090, A6000, A100, H100). Q2_K (~11,0 GB) podria caber en GPUs de 12-16 GB.
- Cabe en consumer GPU: si, en Q2_K y Q4_K_S en GPUs de gama alta (RTX 3090/4090 de 24 GB); Q2_K en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF (Ollama, LM Studio, etc.); el modelo base usa transformers. No se confirma soporte de vLLM o TGI para esta cuantizacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-Healed-GGUF | ~26,07B (MoE) | no disponible | GGUF | apache-2.0 | Multimodal, abliterated, ingles |
| Modelo base Inkling-2-Mini-Abliterated-Healed | ~26,07B (MoE) | no disponible | transformers | apache-2.0 | Pesos originales sin cuantizar |
| Alternativas de ~26B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de rechazos implica que el modelo puede generar contenido que el modelo base denegaria; riesgo elevado en produccion sin filtros externos.
- Riesgo de alucinacion: no cuantificado por el autor; aplicable el riesgo habitual de los modelos generativos.
- Idioma: unicamente ingles declarado; no apto para produccion en castellano u otros idiomas sin evaluacion previa.
- Longitud de contexto: no documentada, lo que impide planificar casos de uso con contexto largo.
- Cuantizaciones de baja calidad: Q2_K puede degradar notablemente la calidad; el autor recomienda Q4_K_S.
- Licencia Apache 2.0: permite uso comercial, pero el caracter abliterated puede plantear riesgos de reputacion o cumplimiento si no se aplican salvaguardas.
- Sin benchmarks publicados: imposible validar el rendimiento frente a alternativas.
- Cuantizaciones ponderadas/imatrix no disponibles en el momento de la publicacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-Abliterated-Healed-GGUF
- Modelo base: https://huggingface.co/derrickNg1412/Inkling-2-Mini-Abliterated-Healed
- Pagina de resumen del autor: https://hf.tst.eu/model#Inkling-2-Mini-Abliterated-Healed-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
