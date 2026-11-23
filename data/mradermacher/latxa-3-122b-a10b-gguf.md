# mradermacher/Latxa-3-122B-A10B-GGUF

## Resumen

Latxa-3-122B-A10B-GGUF es la versión cuantizada en formato GGUF del modelo Latxa-3-122B-A10B, desarrollado originalmente por el grupo HiTZ (Universidad del País Vasco) y convertido por mradermacher. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 122.111.526.912 parámetros totales, especializado en euskera e inglés, que continúa la saga Latxa de modelos de lenguaje para lenguas de bajos recursos. La cuantización permite ejecutar un modelo de este tamaño en hardware más modesto mediante llama.cpp y herramientas compatibles.

El modelo base está entrenado sobre el corpus HiTZ/latxa-corpus-v2 y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. La versión GGUF incluye múltiples niveles de cuantización (desde Q2_K hasta Q8_0) y ficheros mmproj que sugieren capacidades multimodales en el modelo original. La relevancia actual radica en que ofrece una alternativa abierta y ejecutable localmente para tareas en euskera, un idioma con escasa representación en los grandes modelos multilingües.

La ficha se centra en la versión cuantizada publicada por mradermacher, si bien la mayor parte de las especificaciones técnicas provienen del modelo base HiTZ/Latxa-3-122B-A10B. No se dispone de información detallada sobre la composición exacta del dataset de entrenamiento ni sobre los resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer |
| Parametros totales | 122.111.526.912 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | eu (euskera), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Latxa-3-122B-A10B emplea una arquitectura Mixture of Experts (MoE) con 122.111.526.912 parámetros totales, según los datos de safetensors del repositorio. La nomenclatura "A10B" sugiere aproximadamente 10 mil millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. El entrenamiento se realizó sobre el corpus HiTZ/latxa-corpus-v2, un dataset específico para euskera desarrollado por el grupo HiTZ.

La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste instructivo. Tampoco se especifican innovaciones arquitectónicas concretas más allá de la naturaleza MoE. La presencia de ficheros mmproj en la versión GGUF indica que el modelo base incorpora capacidades multimodales (probablemente visión), aunque no se detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional en euskera e inglés, según los tags del repositorio (`conversational`).
- Procesamiento multimodal: la presencia de ficheros `mmproj` (multi-modal supplement) sugiere soporte de entrada de imágenes, aunque no se detalla en la documentación.
- Capacidades de razonamiento y generación de código: no confirmadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a euskera e inglés según los tags del modelo.
- Modo thinking: no disponible.

## Casos de uso

- Atención al cliente en euskera: el modelo puede gestionar conversaciones multi-turno en euskera, un idioma con poca cobertura en modelos generalistas, adecuado para administraciones públicas y empresas del País Vasco.
- Generación de contenido editorial en euskera: redacción de artículos, resúmenes y textos divulgativos con calidad lingüística superior a la de modelos multilingües genéricos.
- Traducción euskera-inglés: aunque no se especifica como tarea de entrenamiento, el soporte bilingüe permite su uso en pipelines de traducción asistida.
- Procesamiento de documentos con imágenes: gracias a los ficheros mmproj, puede emplearse en tareas de descripción o extracción de información de imágenes combinadas con texto en euskera.
- Investigación lingüística: evaluación de modelos MoE en lenguas de bajos recursos y análisis de su comportamiento en euskera.
- Despliegue local en entornos con requisitos de soberanía de datos: al ser GGUF y Apache 2.0, puede ejecutarse en infraestructura propia sin depender de APIs externas.
- Educación y divulgación: generación de materiales didácticos y ejercicios en euskera para centros educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 45 GB (Q2_K) y 130 GB (Q8_0) solo para los pesos; hay que añadir el espacio para el contexto KV cache.
- GPU recomendadas: para Q4_K_M (74,3 GB) se requieren múltiples GPU (por ejemplo, 2× A100 80 GB o 4× RTX 4090 24 GB). Para Q8_0 (130 GB) se necesitan al menos 2× H100 80 GB o configuraciones equivalentes.
- En consumer GPU: las cuantizaciones más bajas (Q2_K, 45 GB) no caben en una sola RTX 4090 (24 GB); requieren al menos 2× RTX 4090 o el uso de memoria RAM del sistema con llama.cpp (offloading parcial).
- Opciones de despliegue: llama.cpp, Ollama (si soporta el modelo), y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI si soportan la arquitectura MoE concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Latxa-3-122B-A10B-GGUF | 122,1 B (MoE) | no disponible | eu, en | Apache 2.0 | GGUF |
| Latxa-3 (versiones anteriores) | no disponible | no disponible | eu, en | Apache 2.0 | safetensors/GGUF |
| Modelos MoE abiertos comparables (p. ej. Mixtral) | ~47 B | 32k (típico) | multilingüe | Apache 2.0 | safetensors/GGUF |

No se dispone de datos suficientes para una comparativa detallada con modelos de la misma categoría en euskera. La información proporcionada no incluye benchmarks ni especificaciones del contexto del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre un corpus específico de euskera, puede heredar sesgos del mismo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas.
- Limitaciones de contexto o idioma: solo se declaran euskera e inglés; el rendimiento en otros idiomas no está garantizado. La longitud de contexto no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base HiTZ/Latxa-3-122B-A10B por si hubiera condiciones adicionales no reflejadas en la información disponible.
- Caveats para producción: el tamaño del repositorio (832,6 GB) y de las cuantizaciones (hasta 130 GB) exigen infraestructura considerable; las cuantizaciones Q2_K y Q3 pueden degradar notablemente la calidad. Los ficheros Q6_K y Q8_0 están divididos en partes que deben concatenarse correctamente.
- No se dispone de información sobre el proceso de alineación (RLHF/DPO), lo que dificulta prever su comportamiento en tareas instructivas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Latxa-3-122B-A10B-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-3-122B-A10B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Latxa-3-122B-A10B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Latxa-3-122B-A10B-GGUF
- Dataset: https://huggingface.co/datasets/HiTZ/latxa-corpus-v2
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
