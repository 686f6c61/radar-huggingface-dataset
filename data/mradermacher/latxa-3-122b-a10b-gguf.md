# mradermacher/Latxa-3-122B-A10B-GGUF

## Resumen

Latxa-3-122B-A10B-GGUF es la versión cuantizada en formato GGUF del modelo HiTZ/Latxa-3-122B-A10B, desarrollado originalmente por el grupo HiTZ (Centro Vasco de Tecnología del Lenguaje, Universidad del País Vasco). Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 122.111.526.912 parámetros totales, especializado en euskera (eu) y con soporte para inglés (en), diseñado para tareas conversacionales y de generación de lenguaje en euskera de alta calidad.

La cuantización ha sido realizada por mradermacher, un conocido contribuidor de la comunidad que publica versiones GGUF de modelos relevantes para su uso con llama.cpp y otros runners compatibles. Esta versión permite ejecutar un modelo de 122B parámetros en hardware más modesto mediante cuantizaciones que van desde Q2_K (45 GB) hasta Q8_0, además de incluir ficheros mmproj para capacidades multimodales.

El modelo es relevante porque cubre un nicho poco atendido: modelos de gran escala con rendimiento de calidad para euskera, una lengua de bajos recursos. La licencia Apache 2.0 facilita su uso comercial y su integración en productos y pipelines. Al estar basado en el corpus HiTZ/latxa-corpus-v2, está específicamente entrenado y ajustado para el euskera, lo que lo diferencia de modelos multilingües genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer |
| Parametros totales | 122.111.526.912 (122B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 (mmproj) |
| Idiomas soportados | euskera (eu), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base HiTZ/Latxa-3-122B-A10B emplea una arquitectura Mixture of Experts (MoE), según indican las etiquetas del repositorio y el nombre del modelo (A10B sugiere aproximadamente 10B parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible). La arquitectura MoE permite que, pese a los 122B parámetros totales, solo una fracción se active en cada paso de inferencia, reduciendo el coste computacional en comparación con un modelo denso del mismo tamaño.

El entrenamiento se ha realizado sobre el dataset HiTZ/latxa-corpus-v2, un corpus específicamente recopilado para euskera. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal en la información proporcionada. La cuantización GGUF ha sido realizada por mradermacher con cuantizaciones estáticas (no se han publicado versiones con imatrix/weighted según la model card).

## Capacidades

- Generación de texto conversacional en euskera e inglés, con especial énfasis en la calidad del euskera.
- Razonamiento y respuesta a instrucciones en ambos idiomas soportados.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada visual (imágenes) en el modelo base.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües limitadas a euskera e inglés según las etiquetas del repositorio.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en euskera: el modelo puede gestionar conversaciones multi-turno en euskera con calidad nativa, adecuado para administraciones públicas vascas, medios de comunicación y empresas que operan en la comunidad autónoma.
- Generación de contenido editorial en euskera: redacción de artículos, resúmenes y materiales divulgativos con un modelo entrenado específicamente en corpus en euskera, superando a modelos multilingües genéricos en fluidez y naturalidad.
- Traducción asistida euskera-inglés: aunque no es un modelo de traducción dedicado, su entrenamiento bilingüe permite tareas de traducción y postedición en pipelines de localización.
- Procesamiento de documentación administrativa vasca: extracción de información, resumen y clasificación de documentos oficiales en euskera, aprovechando el corpus especializado de entrenamiento.
- Investigación en PLN para lenguas de bajos recursos: el modelo sirve como base para experimentos de fine-tuning y evaluación en euskera, con licencia Apache 2.0 que facilita la publicación de resultados.
- Despliegue en entornos con hardware limitado mediante cuantización: las versiones Q2_K (45 GB) y Q4_K_M permiten ejecutar el modelo en estaciones de trabajo con GPUs de 48-80 GB o en configuraciones multi-GPU, usando llama.cpp u Ollama.
- Asistentes conversacionales con entrada visual: gracias a los ficheros mmproj, puede integrarse en aplicaciones que requieran procesar imágenes junto con texto en euskera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~45 GB (requiere GPU de 48 GB o más, o descarga parcial a CPU).
  - Q3_K_S / Q3_K_M / Q3_K_L: rango aproximado entre 50 y 60 GB.
  - Q4_K_S / Q4_K_M: rango aproximado entre 65 y 75 GB.
  - Q5_K_S / Q5_K_M: rango aproximado entre 80 y 90 GB.
  - Q6_K: ~100 GB.
  - Q8_0: ~130 GB.
  - mmproj (Q8_0 / f16): 0,7-1,0 GB adicionales para capacidades multimodales.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x RTX 4090 de 24 GB para cuantizaciones bajas con descarga parcial; 2x A100 80GB para cuantizaciones altas).
- ¿Cabe en consumer GPU? Las cuantizaciones Q2_K y Q3 pueden ejecutarse en una RTX 4090 (24 GB) solo con descarga parcial a RAM/CPU, con latencia elevada. Para ejecución íntegra en GPU se requieren GPUs profesionales o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF. El modelo base (safetensors) puede desplegarse con vLLM o TGI si se dispone de hardware suficiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Latxa-3-122B-A10B (este) | 122B (MoE) | no disponible | eu, en | Apache 2.0 | GGUF, safetensors |
| Latxa-3 (versiones menores del mismo autor) | no disponible | no disponible | eu, en | Apache 2.0 | safetensors, GGUF |
| Modelos multilingües genéricos de ~100B | variable | variable | múltiples | variable | variable |

No se dispone de información suficiente sobre modelos comparables directos en la categoría de euskera de gran escala para establecer una comparativa cuantitativa fiable. La comparativa se limita a la familia Latxa-3 y a modelos multilingües genéricos, sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un corpus específico de euskera, puede reflejar sesgos presentes en las fuentes del corpus.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de fidelidad factual para este modelo.
- Limitaciones de contexto e idioma: soporte limitado a euskera e inglés; el rendimiento en otros idiomas no está garantizado. La longitud de contexto no está documentada, lo que dificulta planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de licencia y atribución correspondientes.
- Caveats para producción: las cuantizaciones estáticas (sin imatrix) pueden degradar la calidad en comparación con cuantizaciones ponderadas; las cuantizaciones bajas (Q2_K, Q3) pueden afectar especialmente a tareas de razonamiento. El tamaño del repositorio (404,9 GB) implica costes de almacenamiento y descarga considerables. No se han publicado benchmarks que permitan validar la calidad en producción.
- Advertencia sobre el formato GGUF: requiere runners compatibles (llama.cpp, Ollama); no es directamente utilizable con transformers sin conversión.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Latxa-3-122B-A10B-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Latxa-3-122B-A10B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/HiTZ/latxa-corpus-v2
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
