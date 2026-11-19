# mradermacher/OutlineLM-Gemma4-E4B-v1-i1-GGUF

## Resumen

OutlineLM-Gemma4-E4B-v1-i1-GGUF es una colección de cuantizaciones GGUF del modelo OutlineLM-Gemma4-E4B-v1, publicada por el usuario mradermacher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización del modelo base desarrollado por DiTy, cuyo nombre sugiere un fine-tuning sobre la familia Gemma (la referencia "Gemma4-E4B" apunta a una variante de dicha familia, aunque no se confirma en la información disponible).

El repositorio contiene pesos en formato GGUF generados con cuantización ponderada mediante matrices de importancia (imatrix), lo que permite ejecutar el modelo en hardware de consumo con llama.cpp y derivados. El tamaño del repo es de 4,4 GB y el recuento de parámetros real reportado en safetensors es de 7.518.069.290 (aproximadamente 7,5 mil millones).

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay datos de licencia, idiomas, pipeline, benchmarks ni detalles de entrenamiento en la información proporcionada. Aun así, se documenta lo verificable: la existencia de múltiples cuantizaciones (desde IQ1_S hasta Q6_K), su naturaleza conversacional y su compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Gemma; sin confirmar) |
| Parametros totales | 7.518.069.290 (dato real, safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base OutlineLM-Gemma4-E4B-v1. El nombre sugiere una variante de la familia Gemma con un tamaño efectivo o etiqueta "E4B", y el recuento de parámetros (7,5 mil millones) es coherente con un transformer denso de esa escala, pero no se confirma ni el tipo de atención, ni la composición del dataset, ni si hubo fases de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: el autor aplicó cuantización ponderada con matrices de importancia (imatrix) sobre el modelo base de DiTy, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Se generaron 24 variantes de cuantización, desde IQ1_S (la más agresiva) hasta Q6_K (la de mayor fidelidad), omitiendo el módulo mmproj (`skip_mmproj: 1`), lo que sugiere que el modelo base podría incluir componentes multimodales no incluidos en estas cuantizaciones.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` señala que puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Ejecución local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).
- Capacidades de razonamiento, código y matemáticas: no confirmadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; la omisión de mmproj sugiere que cualquier componente multimodal del modelo base no se incluye en estas cuantizaciones.

## Casos de uso

- Despliegue local de un asistente conversacional: gracias a las cuantizaciones Q4_K_M e IQ4_XS, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, sirviendo como chatbot privado sin dependencia de la nube.
- Prototipado rápido en entornos con recursos limitados: las variantes IQ2 e IQ3 permiten probar el modelo en hardware modesto antes de escalar a cuantizaciones mayores.
- Integración en pipelines de llama.cpp: el formato GGUF y la compatibilidad con endpoints facilitan su incorporación en servicios de inferencia autoalojados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes del mismo modelo, útil para medir el impacto de la cuantización en calidad y latencia sobre una tarea concreta.
- Fine-tuning posterior o destilación: al disponer del modelo base en safetensors (7,5 mil millones de parámetros), puede usarse como punto de partida para ajustes específicos de dominio.
- Uso educativo e investigación: el modelo permite estudiar el comportamiento de un transformer de 7,5B en tareas conversacionales con recursos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (7,5 mil millones de parámetros):
  - Q6_K: aproximadamente 6,5-7 GB.
  - Q5_K_M: aproximadamente 5,5-6 GB.
  - Q4_K_M / IQ4_XS: aproximadamente 4,5-5 GB.
  - Q3_K_M / IQ3_M: aproximadamente 3,5-4 GB.
  - IQ2_M / Q2_K: aproximadamente 2,5-3 GB.
  - IQ1_S: aproximadamente 2 GB (calidad muy degradada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB (Q4_K_M en adelante) hasta tarjetas con 8 GB usando cuantizaciones IQ3 o Q3_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de endpoints de Hugging Face; vLLM y TGI no soportan GGUF de forma nativa en todos los casos (no confirmado para este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OutlineLM-Gemma4-E4B-v1-i1-GGUF | 7,5 B | no disponible | no disponible | GGUF | 24 cuantizaciones imatrix |
| Modelo base DiTy/OutlineLM-Gemma4-E4B-v1 | 7,5 B (presumible) | no disponible | no disponible | safetensors (presumible) | Fuente de las cuantizaciones |
| Alternativas de 7-8B (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8 B | 8k-128k | licencias abiertas | safetensors, GGUF | No se dispone de comparación de rendimiento con este modelo |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe verificarse en el repositorio del modelo base (DiTy/OutlineLM-Gemma4-E4B-v1).
- Idiomas soportados no documentados: el rendimiento multilingüe es desconocido.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados; se desconoce la composición del dataset de entrenamiento.
- Cuantizaciones muy agresivas (IQ1_S, IQ2_XXS): degradación notable de calidad; no recomendadas para producción.
- Componente mmproj omitido: si el modelo base es multimodal, estas cuantizaciones no incluyen la parte de visión.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación mínimo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E4B-v1-i1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E4B-v1
