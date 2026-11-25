# mradermacher/STILL-Qwen3.5-9B-GGUF

## Resumen

STILL-Qwen3.5-9B-GGUF es la versión cuantizada en formato GGUF del modelo oran9er/STILL-Qwen3.5-9B, un modelo de lenguaje de aproximadamente 8.950 millones de parámetros (8,95 B) construido sobre la familia Qwen3.5. La cuantización la ha realizado mradermacher, un autor habitual en la comunidad de Hugging Face especializado en generar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo está etiquetado por su autor con los casos de uso de detección de cambios de escena (scene-change-detection), visión multi-vista (multi-view) y verificación, lo que sugiere un ajuste fino orientado a tareas de análisis visual y comprobación de coherencia entre vistas.

La relevancia de esta ficha radica en que ofrece el modelo base en un rango de cuantizaciones que va desde Q2_K (4,0 GB) hasta f16 (18,0 GB), lo que permite desplegarlo en hardware de consumo con GPU de 8-16 GB de VRAM, algo imposible con los pesos completos en precisión nativa. El repositorio incluye además ficheros mmproj (multi-modal projection) en Q8_0 y f16, lo que confirma que el modelo incorpora capacidad de entrada visual y que puede ejecutarse con llama.cpp en modo multimodal.

La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales. El modelo se distribuye principalmente en inglés según los metadatos de la model card, y no se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) segun la model card; resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es oran9er/STILL-Qwen3.5-9B, una adaptación de la familia Qwen3.5 de aproximadamente 8,95 B de parámetros. No se dispone de información detallada sobre la arquitectura interna (número de capas, cabezas de atención, dimensión oculta, tipo de atención) ni sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Las etiquetas de la model card (scene-change-detection, multi-view, verification) apuntan a un ajuste fino especializado en tareas de análisis de imágenes y verificación de coherencia, pero no se documenta el procedimiento.

La innovación técnica destacable de esta ficha concreta es el proceso de cuantización realizado por mradermacher: se ofrecen cuantizaciones estáticas (sin imatrix ponderada) en un rango amplio de tipos, además de los ficheros mmproj necesarios para el procesamiento multimodal con llama.cpp. La presencia de mmproj confirma que el modelo acepta entrada de imagen además de texto. No se documentan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto conversacional en inglés, según los tags `conversational` y `en`.
- Procesamiento multimodal de imágenes: los ficheros mmproj incluidos permiten entrada visual en llama.cpp.
- Detección de cambios de escena (scene-change-detection), según los tags del autor.
- Análisis multi-vista (multi-view): capacidad de razonar sobre varias imágenes o perspectivas de una misma escena.
- Verificación (verification): comprobación de coherencia o validez de contenido, probablemente visual.
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, matemáticas avanzadas ni modo thinking.

## Casos de uso

- Detección de cambios de escena en vídeo o secuencias de imágenes: el modelo puede comparar fotogramas consecutivos o vistas de una escena para identificar transiciones, cortes o modificaciones relevantes, aprovechando su ajuste específico para esta tarea.
- Verificación de coherencia multi-vista en entornos de inspección: dadas varias imágenes de un mismo objeto o espacio (por ejemplo, en fotogrametría o control de calidad industrial), el modelo puede comprobar si las vistas son consistentes entre sí.
- Moderación y auditoría de contenido visual: integrado en un pipeline con llama.cpp, puede revisar imágenes y emitir juicios de verificación sobre su contenido antes de publicarlo.
- Asistente conversacional con entrada de imagen en local: desplegado con llama.cpp u Ollama en una estación de trabajo con GPU de consumo, sirve para consultas en inglés sobre imágenes sin enviar datos a la nube.
- Prototipado de pipelines multimodales: gracias a los ficheros mmproj y a las cuantizaciones ligeras (Q4_K_M, 5,8 GB), es adecuado para experimentar con visión-lenguaje en hardware modesto antes de escalar a modelos mayores.
- Monitorización de escenas en robótica o domótica: el modelo puede procesar capturas periódicas de una cámara y detectar cambios de estado en el entorno, con la ventaja de ejecutarse íntegramente en local.
- Análisis de documentos escaneados con verificación: combinando OCR previo y entrada de imagen, puede verificar la correspondencia entre el texto extraído y la imagen original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_S: ~4,4 GB; Q3_K_M: ~4,8 GB; Q3_K_L: ~5,1 GB
  - IQ4_XS: ~5,4 GB; Q4_K_S: ~5,5 GB; Q4_K_M: ~5,8 GB
  - Q5_K_S: ~6,4 GB; Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
  - mmproj adicional: ~0,7 GB (Q8_0) o ~1,0 GB (f16) si se usa entrada visual
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M-Q6_K; RTX 4090 24 GB para Q8_0 o f16; A100/H100 sobredimensionadas para este tamaño, útiles solo en despliegues multi-usuario.
- Cabe en GPU de consumo: sí, desde Q2_K en tarjetas de 6 GB hasta Q8_0 en tarjetas de 10-12 GB; f16 requiere 24 GB o reparto CPU/GPU.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF y mmproj), Ollama, LM Studio, y servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| STILL-Qwen3.5-9B-GGUF | ~8,95 B | no disponible | Apache 2.0 | GGUF | Especializado en deteccion de cambios de escena y verificacion multi-vista |
| Qwen3.5-9B (base, referencia) | ~9 B | no disponible | Apache 2.0 (segun familia Qwen) | safetensors | Modelo generalista sin ajuste especifico; no disponible en esta busqueda |
| Versiones GGUF de Qwen3.5-9B de otros cuantizadores | ~9 B | no disponible | Apache 2.0 | GGUF | Mismas capacidades generales, sin el ajuste fino de STILL |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en las tareas etiquetadas (scene-change-detection, multi-view, verification) no está cuantificado.
- El modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; en tareas de verificación visual, una falsa confirmación puede tener consecuencias graves.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- La model card no documenta sesgos conocidos, pero al derivar de Qwen3.5 hereda los sesgos del corpus de entrenamiento original, no auditados aquí.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas; conviene verificar la model card de oran9er/STILL-Qwen3.5-9B.
- No se documenta longitud de contexto; asumir contextos largos sin verificación puede provocar degradación o errores.
- El soporte multimodal depende de llama.cpp y de los ficheros mmproj; otras herramientas pueden no procesar correctamente la entrada visual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/STILL-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/oran9er/STILL-Qwen3.5-9B
- Página de descargas del cuantizador: https://hf.tst.eu/model#STILL-Qwen3.5-9B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de comparación de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
