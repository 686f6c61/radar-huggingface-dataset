# mradermacher/Capek0.5-35B-A3B-GGUF

## Resumen

Capek0.5-35B-A3B es un modelo de lenguaje y visión de tipo Mixture of Experts (MoE) desarrollado por XPeng Robotics, orientado a inteligencia encarnada (embodied intelligence), razonamiento espacial, comprensión de vídeo y robótica. El repositorio analizado aquí es una recopilación de cuantizaciones GGUF estáticas producidas por mradermacher a partir de los pesos originales en formato transformers, lo que permite ejecutar el modelo en entornos con llama.cpp y herramientas compatibles sin necesidad de GPUs de datacenter.

El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 35B) y una designación A3B que indica 3 mil millones de parámetros activos por token, aunque este dato de activación no está confirmado de forma explícita en la información disponible. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y declara soporte únicamente para inglés.

Su relevancia actual radica en la combinación de capacidades vision-language con etiquetas específicas de robótica y razonamiento espacial, un nicho donde la mayoría de los modelos abiertos de propósito general no ofrecen un enfoque explícito. La disponibilidad de cuantizaciones GGUF desde Q2_K hasta Q8_0, junto con un proyector multimodal (mmproj), lo hace desplegable en hardware de consumo con las precisiones más bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capacidades vision-language; detalles internos no disponibles |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3B (según designación A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo Mixture of Experts con 34,66 mil millones de parámetros totales y una designación A3B que sugiere aproximadamente 3 mil millones de parámetros activos por token. Incorpora un componente vision-language, evidenciado por la presencia de un proyector multimodal (mmproj) en las cuantizaciones GGUF, y está etiquetado para razonamiento espacial, comprensión de vídeo y robótica. No se dispone de detalles sobre el número de expertos, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento.

En cuanto al entrenamiento, las etiquetas del repositorio indican el uso de aprendizaje por refuerzo (reinforcement-learning) como pipeline, aunque no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Todos estos datos deberían consultarse en la model card del modelo base (xpeng-robotics/Capek0.5-35B-A3B), no incluida en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado de reinforcement-learning.
- Comprensión de imágenes y vídeo mediante el proyector multimodal incluido en las cuantizaciones GGUF.
- Razonamiento espacial, orientado a la interpretación de escenas y relaciones geométricas.
- Capacidades de inteligencia encarnada y robótica, según las etiquetas del repositorio.
- Procesamiento de contexto multi-turno (longitud de contexto no especificada).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Robótica de manipulación asistida: el modelo puede interpretar imágenes de una escena y generar descripciones espaciales que alimenten un planificador de movimientos, gracias a su componente vision-language y a su etiqueta de razonamiento espacial.
- Comprensión de vídeo en inspección industrial: análisis de secuencias de vídeo para detectar anomalías o describir el estado de una línea de producción, aprovechando la capacidad de video-understanding declarada.
- Investigación en inteligencia encarnada: servir como base para experimentos de aprendizaje por refuerzo en entornos simulados, dado el pipeline de reinforcement-learning y las etiquetas de robótica.
- Asistencia a operadores de drones o robots móviles: generación de descripciones en lenguaje natural de lo que capta la cámara, con el proyector multimodal cargado junto al modelo en llama.cpp.
- Prototipado en hardware de consumo: las cuantizaciones Q2_K (13 GB) y Q3_K_S (15,3 GB) permiten ejecutar el modelo en GPUs de gama alta para consumo, facilitando pruebas de concepto sin infraestructura de datacenter.
- Despliegue en entornos edge con llama.cpp: la disponibilidad de GGUF y mmproj permite integrar el modelo en dispositivos con recursos limitados para tareas de percepción visual y descripción de escenas.
- Evaluación comparativa de modelos MoE multimodales: el rango completo de cuantizaciones (de Q2_K a Q8_0) permite estudiar la degradación de calidad en tareas de razonamiento espacial según la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~13 GB, Q3_K_S ~15,3 GB, Q3_K_M ~16,9 GB, Q3_K_L ~18,2 GB, IQ4_XS ~19 GB, Q4_K_S ~20 GB, Q4_K_M ~21,3 GB, Q5_K_S ~24,1 GB, Q5_K_M ~24,8 GB, Q6_K ~28,6 GB, Q8_0 ~37 GB. Añadir ~0,7 GB (mmproj Q8_0) o ~1 GB (mmproj f16) para entrada multimodal.
- GPU recomendadas: para Q4_K_M en adelante se recomienda una RTX 4090 (24 GB) o superior; para Q6_K y Q8_0 se necesita una A100 40 GB, H100 o varias GPUs consumer.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones hasta Q5_K_M; en RTX 3090 (24 GB) de forma equivalente; en GPUs de 16 GB solo con Q3_K_S o Q2_K y posible descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base en transformers puede servirse con vLLM o TGI si se dispone del formato original.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría (MoE multimodal orientado a robótica). Se indica "no disponible".

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de razonamiento espacial o video-understanding no está verificado de forma independiente.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en descripciones de escenas visuales donde el modelo puede inventar objetos o relaciones espaciales.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en tareas de razonamiento espacial, que son sensibles a la pérdida de información.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base por si hubiera condiciones adicionales no reflejadas en este repositorio.
- El repositorio es una cuantización de terceros (mradermacher), no la publicación oficial; para producción se recomienda validar contra el modelo base original.
- El tamaño del repositorio (238,6 GB) implica que la descarga completa de todas las cuantizaciones es costosa en almacenamiento y ancho de banda.
- No hay información sobre sesgos conocidos, longitud de contexto ni limitaciones específicas del entrenamiento.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Capek0.5-35B-A3B-GGUF
- Modelo base: https://huggingface.co/xpeng-robotics/Capek0.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/xpeng-robotics/Capek0.5-35B-A3B/blob/main/LICENSE
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Capek0.5-35B-A3B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Capek0.5-35B-A3B-GGUF
- Paper referenciado (arXiv:2608.06756): https://arxiv.org/abs/2608.06756
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
