# mradermacher/Nemotron-Labs-Image-30B-A3B-i1-GGUF

## Resumen

Nemotron-Labs-Image-30B-A3B-i1-GGUF es una colección de cuantizaciones GGUF, generadas por mradermacher, del modelo original nvidia/Nemotron-Labs-Image-30B-A3B publicado por NVIDIA. Se trata de un modelo multimodal (etiqueta "Image" en el nombre) con arquitectura de mezcla de expertos (MoE), según indica el sufijo "A3B" (aproximadamente 3.000 millones de parámetros activos por token sobre un total de unos 32.600 millones). El repositorio incluye cuantizaciones tanto estándar como de tipo imatrix, pensadas para su uso con llama.cpp y derivados.

La relevancia de este repositorio es práctica: permite ejecutar un modelo multimodal de gran tamaño en hardware más modesto mediante cuantización, ofreciendo un abanico amplio de niveles de compresión (desde Q2_K hasta Q6_K, además de variantes IQ de 1 a 4 bits). El paquete incluye también el proyector multimodal (mmproj) salvo que se indique lo contrario, lo que habilita el procesamiento de imágenes.

No obstante, la información disponible es escasa: no se especifican licencia, idiomas soportados, pipeline ni datos de entrenamiento en la model card del repositorio de cuantizaciones. Cualquier dato técnico sobre el modelo base debe consultarse en el repositorio original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), multimodal (imagen) |
| Parametros totales | 32.634.904.896 (~32,6 B) |
| Parametros activos | ~3 B (según sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de aproximadamente 32.600 millones de parámetros totales y unos 3.000 millones activos por token, con capacidad multimodal para procesamiento de imágenes (según la nomenclatura del repositorio y la inclusión de mmproj en las cuantizaciones). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO, etc.) en la información proporcionada.

Las cuantizaciones de este repositorio se han generado con el formato i1 de mradermacher, que emplea pesos de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión. Se han publicado variantes tanto estándar como imatrix, cubriendo desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre tamaño y fidelidad.

## Capacidades

- Generación de texto conversacional (etiqueta "conversational").
- Procesamiento de imágenes (modelo multimodal; el paquete incluye proyector mmproj).
- Razonamiento y generación de contenido en formato chat.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades de tool calling, agentes o thinking mode: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.

## Casos de uso

- Despliegue local de un modelo multimodal de gran tamaño: gracias a las cuantizaciones de 2 a 6 bits, es posible ejecutar un modelo de ~32,6 B en GPUs de consumo o estaciones de trabajo con VRAM limitada, usando llama.cpp u Ollama.
- Análisis de imágenes en local: con el proyector multimodal incluido, se pueden procesar capturas, documentos escaneados o fotografías sin enviar datos a servicios en la nube, útil en entornos con requisitos de privacidad.
- Prototipado de asistentes conversacionales: la naturaleza conversacional del modelo permite construir chatbots multi-turno en local para pruebas de concepto.
- Investigación sobre cuantización: el repositorio ofrece múltiples niveles de cuantización (incluidas IQ1/IQ2/IQ3) que permiten estudiar el impacto de la compresión en la calidad de un MoE multimodal.
- Evaluación comparativa de MoE: al ser un MoE con ~3 B activos, es candidato para medir throughput en escenarios donde el coste computacional por token importa más que el tamaño total.
- Integración en pipelines de inferencia con llama.cpp: al ser GGUF, puede integrarse en servidores ligeros compatibles con la API de OpenAI para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (inferencia, aproximada según tamaño de pesos):
  - IQ1_S/IQ2: ~6-9 GB.
  - Q3_K: ~13-15 GB.
  - Q4_K_M: ~18-20 GB.
  - Q5_K_M: ~22-24 GB.
  - Q6_K: ~26-28 GB.
  - Nota: el modelo base ocupa 273,1 GB en el repositorio completo (todas las cuantizaciones); cada fichero individual es mucho menor.
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5; A100 40/80 GB o H100 para cuantizaciones altas y contexto largo; GPUs de 16 GB pueden ejecutar cuantizaciones Q2/Q3.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 12-16 GB con cuantizaciones IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B (este) | ~32,6 B | ~3 B | no disponible | no disponible | GGUF |
| Alternativas MoE multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse en el repositorio original de NVIDIA.
- Idiomas soportados no documentados; el rendimiento en castellano es incierto.
- Las cuantizaciones de muy baja precisión (IQ1, IQ2) pueden degradar notablemente la calidad, especialmente en tareas multimodales.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos de evaluación disponibles.
- Sesgos: no documentados.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación comunitaria.
- La fecha de creación (2026-11-26) y la escasez de metadatos aconsejan tratar la información con cautela.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Nemotron-Labs-Image-30B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
