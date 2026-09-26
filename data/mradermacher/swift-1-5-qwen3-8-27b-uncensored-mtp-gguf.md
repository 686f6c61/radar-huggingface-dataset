# mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF es la versión cuantizada en formato GGUF del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, publicada por mradermacher (nethype GmbH). Se trata de una conversión de pesos, no de un modelo nuevo: el autor del repositorio aplica cuantizaciones estáticas (Q2_K a Q8_0, además de ficheros mmproj multimodales) sobre el modelo base, que según sus etiquetas es una variante "abliterated" (sin las capas de rechazo del alineamiento original) y "uncensored" derivada de la familia Qwen3, con soporte de MTP (multi-token prediction).

El interés práctico del repositorio está en el empaquetado: permite ejecutar un modelo de gran tamaño (la nomenclatura indica 27B) en hardware de consumo mediante cuantizaciones de 11,0 GB a 29,1 GB, usando llama.cpp u otros clientes compatibles con GGUF. La presencia de ficheros mmproj-Q8_0 y mmproj-f16 apunta a capacidad multimodal (proyección de visión), aunque la model card no detalla el alcance de esa funcionalidad.

Es relevante ahora para quienes necesitan un modelo sin filtros de contenido y desplegable en local, pero conviene señalar que el repositorio no ofrece resultados de benchmarks, no documenta la longitud de contexto y su licencia (swift-open-license-1.0) no aclara las condiciones de uso comercial. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre y las etiquetas indican base Qwen3 con MTP, sin detalles en la model card) |
| Parámetros totales | La nomenclatura indica 27B; la metadata de safetensors del repo informa de 460.730.096 parámetros (≈0,46 B), dato contradictorio con el nombre |
| Parámetros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Modelo base | ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP |
| Tamaño del repositorio | 175,4 GB (suma de todas las cuantizaciones) |
| Fecha de publicación | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni el uso de RLHF o DPO: la model card del repositorio cuantizado se limita a documentar el proceso de conversión. Las únicas pistas son las etiquetas del repositorio (qwen3_8, mtp, abliterated, uncensored) y el nombre del checkpoint base, que sugieren una variante de la familia Qwen3 con multi-token prediction (MTP) y un proceso de "abliteration" para eliminar el comportamiento de rechazo introducido por el alineamiento.

Por lo que respecta a esta publicación concreta, la innovación es puramente de formato y distribución: cuantizaciones estáticas generadas con quantize_version 2 y conversión de tipo hf, con un tensor de salida cuantizado. El autor indica explícitamente que no ha publicado cuantizaciones ponderadas ni con imatrix, y que no tiene previsto hacerlo salvo petición en la sección de discusiones. Se incluyen dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal para los clientes GGUF que soportan entrada de imágenes.

## Capacidades

- Generación de texto en inglés, sobre un modelo base sin capas de rechazo (abliterated/uncensored), por lo que no aplica filtrado de contenido por defecto.
- Predicción multi-token (MTP) según la etiqueta del repositorio; no se detalla en la información disponible cómo se expone esta capacidad en la inferencia GGUF.
- Posible entrada multimodal (imagen) a través de los ficheros mmproj-Q8_0 y mmproj-f16, destinados a clientes compatibles con proyección visual. El alcance concreto no está documentado.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con la librería transformers en la metadata del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado (en); no se documentan otros idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en GPU de consumo: con las cuantizaciones Q4_K_S (15,9 GB) o Q4_K_M (16,9 GB) el modelo cabe en una GPU de 24 GB (RTX 3090, RTX 4090) y permite inferencia sin conexión a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generación creativa sin restricciones de contenido: el proceso de abliteration elimina los rechazos del alineamiento, por lo que el modelo es utilizable en redacción de ficción, guiones o narrativa con temáticas que otros modelos filtran. Requiere revisión humana en contextos publicables.
- Evaluación de seguridad y robustez: investigadores que estudian el efecto de la abliteration pueden comparar este checkpoint con su base alineado usando la misma infraestructura GGUF, variando únicamente la cuantización.
- Asistente de redacción técnica en inglés: dado que el único idioma declarado es el inglés, encaja en flujos de documentación, resumen y reescritura de textos técnicos en ese idioma.
- Prototipado de pipelines multimodales: los ficheros mmproj permiten probar entrada de imágenes en clientes GGUF compatibles antes de comprometerse con un modelo mayor o con API de pago; conviene validar primero el soporte real del cliente elegido.
- Experimentación académica con cuantizaciones: el repositorio ofrece una escalera completa de Q2_K a Q8_0 sobre el mismo modelo, lo que permite medir la degradación de calidad por nivel de cuantización (de 11,0 GB a 29,1 GB) manteniendo constantes el resto de variables.
- Inferencia en servidores de gama alta: con Q8_0 (29,1 GB) o Q6_K (22,5 GB) en GPUs de 48 GB o en configuraciones multi-GPU se obtiene la máxima calidad ofrecida por el repositorio para servir peticiones concurrentes mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada según el tamaño de los ficheros GGUF publicados (no incluye el consumo del contexto KV, que se suma aparte):
  - Q2_K: 11,0 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: 12,4 / 13,6 / 14,7 GB.
  - Q4_K_S / Q4_K_M: 15,9 / 16,9 GB.
  - Q5_K_S / Q5_K_M: 19,1 / 19,6 GB.
  - Q6_K: 22,5 GB.
  - Q8_0: 29,1 GB.
  - Suplemento multimodal: mmproj-Q8_0 0,7 GB y mmproj-f16 1,0 GB (adicionales a la cuantización elegida).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_S, Q4_K_M y, con contexto reducido, Q5_K_S/Q5_K_M; A6000, L40S o A100 40 GB para Q6_K y Q8_0; configuraciones multi-GPU o A100/H100 80 GB si se requiere Q8_0 con contexto amplio.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4_K (15,9-16,9 GB) caben en tarjetas de 24 GB, y las Q2_K/Q3_K en tarjetas de 12-16 GB con contexto limitado. El repositorio completo (175,4 GB) no cabe en una sola unidad de consumo.
- Opciones de despliegue: llama.cpp y clientes basados en él (Ollama, LM Studio, llama-cpp-python, text-generation-webui) según la propia model card, que remite a los README de TheBloke para el uso de GGUF y la concatenación de ficheros multiparte. El repositorio está etiquetado como endpoints_compatible. No se menciona soporte específico de vLLM ni de TGI en la información disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La información proporcionada no incluye datos de modelos alternativos (parámetros, contexto, rendimiento o licencia), por lo que no es posible establecer una comparativa con terceros: no disponible. La única comparación verificable con los datos disponibles es entre este repositorio y su modelo base.

| Aspecto | Este repositorio (GGUF) | Modelo base ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP |
|---|---|---|
| Formato de pesos | GGUF (10 cuantizaciones + 2 mmproj) | Safetensors / transformers (según la etiqueta base_model:quantized) |
| Tamaño en disco | Repositorio de 175,4 GB; ficheros individuales de 11,0 a 29,1 GB | no disponible |
| Ejecución en GPU de consumo | Sí, desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB) | no disponible |
| Licencia | swift-open-license-1.0 | swift-open-license-1.0 (heredada del modelo base enlazado) |
| Idiomas | en | en |
| Resultados de benchmarks | no disponibles | no disponibles |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al tratarse de un modelo "abliterated" entrenado sobre datos mayoritariamente en inglés, es previsible que reproduzca sesgos presentes en el corpus original, pero no hay evaluación publicada que lo cuantifique.
- Riesgo de alucinación: no evaluado en la información disponible; al no haber benchmarks, no es posible estimar la fiabilidad factual.
- Eliminación de rechazos: la naturaleza uncensored/abliterated implica que el modelo puede generar contenido dañino, ilegal o sensible sin advertirlo. Es imprescindible añadir filtros externos si se expone a usuarios finales.
- Limitación de idioma: solo se declara inglés (en); no hay evidencia de calidad en castellano ni en otros idiomas.
- Longitud de contexto: no documentada. Se desconoce la ventana real soportada y cómo se degrada con la cuantización.
- Restricciones de licencia: la licencia es swift-open-license-1.0, etiquetada como "other" en HuggingFace, con enlace al fichero LICENSE del repositorio ukisai/Swift-1.5-Qwen3.8-27b. Las condiciones exactas de uso comercial no están recogidas en la información disponible: hay que revisar el texto de la licencia antes de cualquier despliegue en producción.
- Cuantizaciones no ponderadas: el autor indica que no hay cuantizaciones ponderadas ni con imatrix y que probablemente no las publicará; las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad de forma notable.
- Inconsistencia en el recuento de parámetros: el nombre indica 27B mientras que la metadata de safetensors del repositorio informa de 460.730.096 parámetros. Conviene verificar el tamaño real del modelo antes de dimensionar el hardware.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin discusiones ni validación comunitaria documentada.
- Uso de los ficheros mmproj: la funcionalidad multimodal depende del soporte del cliente GGUF; no está garantizada en todas las herramientas.

## Enlaces

- Repositorio HuggingFace (esta cuantización): https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF
- Modelo base: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Licencia swift-open-license-1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (gráfico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede infraestructura al autor): https://www.nethype.de/
