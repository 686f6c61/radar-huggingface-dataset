# mradermacher/MedChain-R1-9B-GGUF

## Resumen

MedChain-R1-9B-GGUF es la versión cuantizada en formato GGUF del modelo MedChain-R1-9B, desarrollado originalmente por el equipo adidukrembzuai y empaquetado para inferencia local por mradermacher. Se trata de un modelo multimodal de 8.953.803.264 parámetros (aproximadamente 9B) especializado en razonamiento médico con cadena de pensamiento (chain-of-thought), orientado a tareas de grounding visual sobre imágenes radiológicas como resonancias magnéticas (MRI) y tomografías computarizadas (CT). El modelo base está publicado bajo licencia Apache 2.0 y su idioma de trabajo declarado es únicamente el inglés.

La relevancia de esta ficha radica en que mradermacher proporciona el conjunto completo de cuantizaciones estáticas en GGUF, lo que permite ejecutar un modelo médico multimodal de 9B en hardware de consumo, algo imposible con los pesos originales en safetensors (el repositorio completo ocupa 83 GB). El paquete incluye tanto los ficheros del modelo de lenguaje cuantizados (desde Q2_K de 3,9 GB hasta f16 de 18 GB) como los suplementos multimodales `mmproj` en Q8_0 y f16, necesarios para procesar imágenes.

El modelo está etiquetado con capacidades de razonamiento multi-imagen, visual grounding, radiología y chain-of-thought, lo que lo sitúa en la categoría de modelos médicos especializados con soporte de visión. No se dispone de información sobre la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks en la documentación proporcionada, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte de visión; arquitectura base no especificada en la información disponible) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los metadatos indican que se trata de un modelo multimodal con capacidad de procesamiento de imágenes (los ficheros `mmproj` confirman la presencia de un proyector multimodal), orientado a grounding visual y razonamiento multi-imagen. El nombre y las etiquetas sugieren un entrenamiento con chain-of-thought para tareas médicas, probablemente mediante destilación o ajuste fino supervisado sobre razonamiento paso a paso, pero no se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable de esta publicación concreta es el empaquetado en GGUF: mradermacher ha generado cuantizaciones estáticas (no ponderadas por imatrix, según indica la propia model card) que cubren desde 2 bits hasta 16 bits, además de los suplementos multimodales en dos precisiones. Esto permite desplegar el modelo con llama.cpp y herramientas compatibles, manteniendo la capacidad de visión gracias a los ficheros `mmproj` separados. El autor señala que no tiene previsto publicar cuantizaciones ponderadas por imatrix salvo petición explícita en la discusión comunitaria.

## Capacidades

- Generación de texto y razonamiento médico con cadena de pensamiento (chain-of-thought) explícita.
- Procesamiento multimodal de imágenes médicas: radiología, MRI y CT.
- Visual grounding: localización de hallazgos o regiones relevantes en la imagen.
- Razonamiento multi-imagen: capacidad de comparar o relacionar varias imágenes en una misma consulta.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: el chain-of-thought está declarado, pero no se detalla soporte de agentes.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales: visión médica y grounding visual; no se mencionan audio ni otros modos.

## Casos de uso

- Asistencia en lectura de radiología: el modelo puede recibir una imagen de CT o MRI y generar una cadena de razonamiento que describa hallazgos, apoyándose en su entrenamiento específico en radiología y en el grounding visual para señalar regiones de interés.
- Segunda opinión automatizada en diagnóstico por imagen: integrado en un visor DICOM con un backend llama.cpp, permite generar descripciones preliminares que el radiólogo revisa, aprovechando la cuantización Q4_K_M (5,7 GB) para despliegue en estaciones de trabajo con GPU de consumo.
- Comparación de estudios multi-imagen: gracias al soporte multi-imagen, puede contrastar una MRI previa y una actual en una misma consulta para describir evolución de lesiones, un caso típico de seguimiento oncológico.
- Formación médica y simulación: el modo chain-of-thought hace visible el razonamiento paso a paso, lo que resulta útil para explicar a residentes cómo se interpreta una imagen radiológica concreta.
- Investigación en NLP médico: como modelo de 9B con licencia Apache 2.0 y pesos GGUF, sirve de base reproducible para experimentos de razonamiento visual médico en entornos con recursos limitados.
- Prototipado de asistentes clínicos: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un servicio de chat especializado en consultas sobre imágenes médicas en inglés, con cuantización Q5_K_M (6,6 GB) para un equilibrio calidad/velocidad.
- Despliegue en entornos con hardware restringido: la cuantización Q2_K (3,9 GB) permite ejecutar el modelo en GPUs de 6-8 GB de VRAM o incluso en CPU, útil para pruebas de concepto en hospitales sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar overhead de contexto ni el proyector multimodal):
  - Q2_K: ~3,9 GB
  - Q3_K_M: ~4,7 GB
  - IQ4_XS: ~5,3 GB
  - Q4_K_M: ~5,7 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- Suplemento multimodal adicional: mmproj-Q8_0 (~0,7 GB) o mmproj-f16 (~1,0 GB).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 4090 (24 GB) puede ejecutar cualquier cuantización incluida la f16 con margen, una RTX 3090/4080 (16-24 GB) cubre hasta Q8_0 con holgura, y GPUs de 8 GB (RTX 3060 Ti, RTX 4060) pueden ejecutar Q2_K a Q4_K_S.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6-8 GB hasta f16 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) por el formato GGUF; el modelo base en safetensors es compatible con transformers y presumiblemente con vLLM/TGI, aunque no se confirma en la documentación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría (9B multimodal médico con grounding visual) en la documentación proporcionada. Se indica "no disponible" para evitar inferencias sin respaldo.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedChain-R1-9B-GGUF | ~9B | no disponible | Apache 2.0 | GGUF | Multimodal médico con grounding visual |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Es un modelo médico especializado: sus salidas no deben utilizarse como diagnóstico clínico sin supervisión de un profesional cualificado. Riesgo elevado de consecuencias graves si se usa de forma autónoma en entornos sanitarios.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en dominios médicos donde una descripción errónea de un hallazgo puede inducir a error.
- No se han publicado benchmarks ni evaluaciones de seguridad clínica en la información disponible, por lo que no es posible cuantificar su fiabilidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad del razonamiento y del grounding visual; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opciones rápidas y Q6_K/Q8_0 para mejor calidad.
- Las cuantizaciones son estáticas; no hay versiones ponderadas por imatrix, lo que puede suponer una pérdida de calidad frente a cuantizaciones imatrix equivalentes en tamaño.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y regulatoria del uso clínico recae íntegramente en el desplegador (normativa de productos sanitarios, MDR en la UE, etc.).
- El repositorio ocupa 83 GB en total; descargar el conjunto completo de cuantizaciones no es necesario, pero conviene seleccionar solo el fichero y el mmproj adecuados.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con documentos o historiales clínicos largos.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/MedChain-R1-9B-GGUF
- Modelo base original: https://huggingface.co/adidukrembzuai/MedChain-R1-9B
- Página de descargas del autor: https://hf.tst.eu/model#MedChain-R1-9B-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper referenciado en los tags (arXiv:2611.00041): https://arxiv.org/abs/2611.00041
