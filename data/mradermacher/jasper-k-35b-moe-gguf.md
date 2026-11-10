# mradermacher/Jasper-K-35B-MoE-GGUF

## Resumen

Jasper-K-35B-MoE-GGUF es la versión cuantizada en formato GGUF del modelo Jasper-K-35B-MoE, desarrollado originalmente por el usuario ragentile y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 34.660.610.688 parámetros totales, orientado a tareas conversacionales y etiquetado con los descriptores "kernel-optimization" y "reinforcement-learning". La model card original no proporciona información detallada sobre el entrenamiento, la composición del dataset ni las capacidades específicas.

La relevancia de esta publicación radica en que permite ejecutar un modelo MoE de aproximadamente 35.000 millones de parámetros en hardware de consumo mediante cuantización GGUF, con opciones que van desde 13 GB (Q2_K) hasta 37 GB (Q8_0). El repositorio incluye además ficheros mmproj, lo que sugiere soporte multimodal, aunque la model card no detalla qué modalidades cubre.

La información disponible es escasa: no se publican resultados de benchmarks, no se especifica la longitud de contexto y no se detalla el proceso de entrenamiento. Todo lo que sigue se basa estrictamente en los metadatos del repositorio y en la model card del cuantizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), según el nombre del modelo; detalles no disponibles |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en formato transformers |
| Tamaño del repositorio | 237,1 GB |
| Pipeline declarado | reinforcement-learning |
| Modelo base | ragentile/Jasper-K-35B-MoE |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura Mixture of Experts con aproximadamente 35.000 millones de parámetros totales. Sin embargo, la model card no especifica el número de expertos, el número de parámetros activos por token, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento. Tampoco se detalla la longitud de contexto nativa.

Respecto al entrenamiento, los tags incluyen "kernel-optimization" y "reinforcement-learning", y el pipeline declarado es "reinforcement-learning", lo que sugiere que el modelo base pudo haber sido sometido a un proceso de ajuste mediante refuerzo, posiblemente orientado a la optimización de kernels. No obstante, no se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas concretas como decodificación especulativa o atención lineal. La presencia de ficheros mmproj en el repositorio GGUF apunta a capacidades multimodales, pero la model card no las describe.

## Capacidades

- Generación de texto conversacional, según el tag "conversational" del repositorio.
- Capacidad multimodal probable (presencia de ficheros mmproj Q8_0 y f16), aunque no se especifica si cubre visión, audio u otra modalidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Optimización de kernels y ajuste por refuerzo: sugerido por los tags, sin detalles técnicos.

## Casos de uso

- Despliegue local de un modelo MoE de ~35B en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (21,3 GB) o Q5_K_M (24,8 GB), puede ejecutarse en GPUs con 24 GB de VRAM como la RTX 4090, permitiendo experimentación con arquitecturas MoE sin infraestructura de centro de datos.
- Experimentación en investigación sobre optimización de kernels: el tag "kernel-optimization" sugiere que el modelo fue ajustado para tareas relacionadas con la generación y optimización de código de bajo nivel, lo que lo hace candidato para prototipado en este dominio (sin confirmación en la model card).
- Evaluación de técnicas de ajuste por refuerzo: al estar etiquetado con "reinforcement-learning" y declarar ese pipeline, puede servir como caso de estudio para comparar el comportamiento de modelos ajustados por RL frente a sus bases.
- Conversación en inglés en entornos con recursos limitados: con la cuantización Q2_K (13 GB) puede ejecutarse en GPUs de 16 GB, ofreciendo un asistente conversacional en inglés para prototipos y demos.
- Pruebas de pipelines multimodales: los ficheros mmproj permiten cargar el modelo en llama.cpp con soporte de proyección multimodal, útil para validar flujos de trabajo con entrada de imágenes (si el modelo base lo soporta, extremo no confirmado).
- Integración en entornos compatibles con endpoints: el tag "endpoints_compatible" indica que puede servirse a través de infraestructura compatible con la API de Hugging Face, facilitando su uso en aplicaciones que ya consumen endpoints de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~13 GB.
  - Q3_K_S: ~15,3 GB; Q3_K_M: ~16,9 GB; Q3_K_L: ~18,2 GB.
  - IQ4_XS: ~19 GB.
  - Q4_K_S: ~20 GB; Q4_K_M: ~21,3 GB.
  - Q5_K_S: ~24,1 GB; Q5_K_M: ~24,8 GB.
  - Q6_K: ~28,6 GB.
  - Q8_0: ~37 GB.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomiendan GPUs de 32-48 GB como A100 40 GB, L40S o RTX A6000. Para Q2_K y Q3, GPUs de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 (hasta Q5_K_M), RTX 4080/4060 Ti 16 GB (hasta Q3_K_M) y GPUs de 24 GB en general.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros totales | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Jasper-K-35B-MoE-GGUF | 34,66 B (MoE) | no disponible | Apache 2.0 | Sí | Cuantizado por mradermacher; multimodal probable |
| Mixtral 8x7B | 46,7 B (MoE, 12,9 B activos) | 32k | Apache 2.0 | Sí | Referencia consolidada en MoE abiertos |
| Qwen2.5-32B | 32,5 B (denso) | 128k | Apache 2.0 | Sí | Alternativa densa de tamaño similar |
| DeepSeek-V2-Lite | 15,7 B (MoE, 2,4 B activos) | 32k | MIT | Parcial | MoE más pequeño y eficiente |

La comparación con Mixtral 8x7B y Qwen2.5-32B es pertinente por tamaño y licencia, pero no se pueden contrastar capacidades sin benchmarks publicados del modelo Jasper-K.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura interna, contexto, datos de entrenamiento ni evaluación, lo que dificulta valorar su calidad frente a alternativas.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos web en inglés, es probable que herede sesgos de ese corpus, pero no hay confirmación.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluación, no puede descartarse un riesgo elevado en tareas de precisión.
- Limitación de idioma: solo se declara inglés, por lo que su uso en castellano u otros idiomas no está soportado oficialmente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de entrenamiento, no documentados.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_M degradan la calidad según las notas del propio cuantizador; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay quants ponderados/imatrix disponibles, lo que puede reducir la calidad frente a versiones con imatrix en tamaños equivalentes.
- Repositorio de 237,1 GB: requiere espacio en disco considerable si se descargan todas las cuantizaciones.
- Soporte multimodal incierto: la presencia de mmproj no garantiza que el modelo base tenga visión funcional; no hay documentación al respecto.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Jasper-K-35B-MoE-GGUF
- Modelo base: https://huggingface.co/ragentile/Jasper-K-35B-MoE
- Página de descargas del cuantizador: https://hf.tst.eu/model#Jasper-K-35B-MoE-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
