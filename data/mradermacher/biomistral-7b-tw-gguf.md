# mradermacher/BioMistral-7B-tw-GGUF

## Resumen

BioMistral-7B-tw-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base `elliotthwang/BioMistral-7B-tw`, publicadas por el usuario mradermacher. Se trata, por tanto, de una ficha de redistribución y cuantización, no de un modelo entrenado por el autor de este repositorio. El modelo original deriva de la familia BioMistral, orientada al dominio biomédico y construida sobre la arquitectura Mistral de 7B parámetros.

El modelo cuenta con 7.241.732.096 parámetros totales (aproximadamente 7,24 mil millones), lo que lo sitúa en la categoría de modelos de 7B densos. El repositorio incluye 12 variantes de cuantización que van desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite desplegarlo en hardware muy diverso, desde equipos de consumo con poca VRAM hasta servidores con GPU profesionales.

La relevancia de esta ficha radica en que facilita el uso del modelo biomédico original en entornos con recursos limitados mediante llama.cpp y herramientas compatibles con GGUF. No obstante, la información pública disponible sobre el modelo base es escasa en esta ficha: no se detallan los datos de entrenamiento, la longitud de contexto ni los resultados de benchmarks, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral, según la familia BioMistral; no confirmado en la información disponible) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es un modelo MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `elliotthwang/BioMistral-7B-tw`. Por el nombre y por el tamaño de parámetros (7,24B), se corresponde con la familia BioMistral, que parte de Mistral-7B y se ajusta sobre corpus biomédicos. No obstante, esta ficha no puede confirmar ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

El repositorio de mradermacher se limita a generar cuantizaciones estáticas (sin imatrix ni cuantizaciones ponderadas, según indica el propio autor) del modelo original. Las cuantizaciones se han generado con `quantize_version: 2` y `output_tensor_quantised: 1`, y el autor señala que no tiene previsto publicar variantes con imatrix salvo petición expresa en la discusión comunitaria.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Especialización probable en dominio biomédico por herencia del modelo base BioMistral (no verificado en la información disponible).
- Soporte de inferencia mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Asistencia a la redacción de textos biomédicos en inglés: el modelo, derivado de BioMistral, puede emplearse para resumir o reformular documentación clínica en entornos con recursos limitados, usando cuantizaciones Q4_K_M o Q5_K_M.
- Despliegue en portátiles y estaciones de trabajo sin GPU dedicada: las variantes Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecutar el modelo en CPU con llama.cpp para pruebas y prototipado.
- Experimentación académica con modelos de dominio médico: investigadores que necesiten comparar respuestas de un modelo biomédico de 7B pueden usar la variante Q8_0 (7,8 GB) para minimizar la pérdida de calidad por cuantización.
- Integración en pipelines locales de procesamiento de texto: al ser GGUF, se puede incrustar en aplicaciones de escritorio o servidores ligeros mediante llama.cpp u Ollama (si se importa el archivo), sin depender de servicios en la nube.
- Evaluación de calidad de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir el impacto de la cuantización en tareas biomédicas concretas comparando Q2_K frente a Q8_0 o f16.
- Filtrado y clasificación de textos clínicos en inglés: el modelo puede usarse para tareas de generación condicionada (por ejemplo, extracción de entidades o respuestas a preguntas) en entornos donde no se permite enviar datos a APIs externas, siempre que se valide su calidad en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según tamaño de archivo GGUF):
  - Q2_K: ~2,8 GB
  - Q3_K_S: ~3,3 GB
  - Q3_K_M: ~3,6 GB
  - Q3_K_L: ~3,9 GB
  - IQ4_XS: ~4,0 GB
  - Q4_K_S: ~4,2 GB
  - Q4_K_M: ~4,5 GB
  - Q5_K_S: ~5,1 GB
  - Q5_K_M: ~5,2 GB
  - Q6_K: ~6,0 GB
  - Q8_0: ~7,8 GB
  - f16: ~14,6 GB
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, las variantes Q4 y Q5 caben en GPUs de consumo con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y las variantes Q8_0 y f16 requieren 12-16 GB o más (RTX 4070 Ti Super, RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, al menos las variantes Q2_K a Q5_K_M en GPUs de 8 GB; Q6_K y Q8_0 en GPUs de 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF. El repositorio declara `endpoints_compatible`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BioMistral-7B-tw (este, cuantizado) | 7,24B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de mradermacher |
| BioMistral-7B (original) | ~7B | no disponible en esta ficha | no disponible | safetensors | Modelo base biomédico de la familia BioMistral |
| Mistral-7B-Instruct | ~7B | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo generalista de referencia de 7B |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada, por lo que no se puede confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base `elliotthwang/BioMistral-7B-tw` antes de usarlo en producción.
- El modelo está etiquetado únicamente en inglés (`en`); no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad en tareas biomédicas ni generales.
- Al ser un modelo de dominio médico, existe riesgo de alucinación en contenido clínico; no debe usarse como sustituto de criterio profesional sanitario.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio rapidez/calidad y Q8_0 como mejor calidad.
- No se dispone de cuantizaciones con imatrix en este repositorio, lo que puede suponer una pérdida de calidad frente a cuantizaciones ponderadas equivalentes.
- El repositorio tiene un volumen de descargas muy bajo (50 descargas, 1 like), lo que reduce la validación comunitaria del artefacto.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/BioMistral-7B-tw-GGUF
- Modelo base: https://huggingface.co/elliotthwang/BioMistral-7B-tw
- Página de descargas del autor: https://hf.tst.eu/model#BioMistral-7B-tw-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
