# McGill-NLP/Gemma-4-26B-A4B-SFT-EchoMoE-teacher

## Resumen

Gemma-4-26B-A4B-SFT-EchoMoE-teacher es un ajuste fino supervisado del modelo google/gemma-4-26B-A4B, desarrollado por el grupo McGill-NLP. Se trata del modelo "profesor" (teacher) sin comprimir que sirve de referencia en el informe EchoMoE, en el que se destila un estudiante Gemma-4-26B-A4B y contra el que se comparan sus puntuaciones. El modelo está pensado como punto de partida de referencia para experimentos de destilación y compresión de activaciones en entornos de expertos (expert parallelism), no tanto como un asistente listo para producción.

Arquitecturalmente es un transformer de mezcla de expertos (MoE) con 30 capas, 128 expertos de los cuales 8 están activos, y un tamaño oculto de 2.816. Cuenta con 25.233.141.790 parámetros totales (unos 25,2 mil millones) y un tamaño de repositorio de 50,5 GB en precisión bf16. El ajuste se realiza sobre el dataset allenai/Dolci-Instruct-SFT durante dos épocas con secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5.

Su relevancia actual radica en que acompaña al artículo "Communicate the Change: Efficient Expert Parallelism via Activation Compression" (arXiv:2611.22215), que propone técnicas de compresión de activaciones para paralelismo de expertos. El modelo se evalúa a 32.768 tokens de contexto en bf16 y obtiene una media de 61,2 sobre 18 benchmarks del informe. La licencia es Apache 2.0, la de su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 30 capas, 128 expertos con 8 activos, hidden size 2.816 |
| Parametros totales | 25.233.141.790 (aprox. 25,2 mil millones) |
| Parametros activos | no disponible (la model card indica 8 expertos activos de 128, pero no se publica el recuento exacto de parametros activos) |
| Longitud de contexto | 32.768 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) que hereda la arquitectura del modelo base google/gemma-4-26B-A4B: 30 capas, 128 expertos con 8 activos por token y un tamaño oculto de 2.816. El ajuste fino se realiza mediante supervisión (SFT) sobre allenai/Dolci-Instruct-SFT, con dos épocas sobre secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineación posteriores al SFT.

La innovación técnica asociada no reside en el modelo en sí, sino en el contexto de investigación en el que se enmarca: el informe EchoMoE estudia la compresión de activaciones para paralelismo de expertos eficiente. Este checkpoint es el profesor sin comprimir que sirve de referencia para destilar al estudiante. Al conservar la arquitectura propia del modelo base, puede cargarse directamente con vLLM y transformers sin necesidad del paquete EchoMoE. La evaluación se realiza con vLLM 0.21 en bf16.

## Capacidades

- Generación de texto conversacional en inglés, incluyendo formato de chat mediante plantilla de chat.
- Razonamiento y conocimiento general (puntuación media de 72,5 en el dominio de conocimiento y razonamiento del informe).
- Matemáticas (puntuación media de 41,4 en el dominio de matemáticas).
- Generación de código (puntuación media de 53,9 en el dominio de código).
- Seguimiento de instrucciones (puntuación media de 57,3 en el dominio de seguimiento de instrucciones).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking", visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Referencia para experimentos de destilación: el modelo sirve como profesor para generar respuestas o puntuaciones de referencia con las que entrenar y evaluar estudiantes comprimidos en el marco EchoMoE, gracias a su condición de checkpoint sin comprimir.
- Evaluación de técnicas de paralelismo de expertos: al ser un MoE de 128 expertos con 8 activos, permite medir el impacto de la compresión de activaciones en la comunicación entre expertos en despliegues multi-GPU.
- Generación de texto en inglés para tareas de instrucción: con ajuste sobre Dolci-Instruct-SFT, puede emplearse para generar respuestas conversacionales en pipelines de evaluación interna.
- Investigación en eficiencia de inferencia: su tamaño (25,2 mil millones de parámetros totales) y su contexto de 32.768 tokens lo hacen útil para estudiar el equilibrio entre memoria, ancho de banda y latencia en servidores con GPUs de 80 GB.
- Reproducción de benchmarks: el checkpoint permite reproducir las puntuaciones del informe (media de 61,2 sobre 18 benchmarks) en entornos vLLM con decodificación greedy o con los ajustes de chat indicados.
- Base para ajustes finos posteriores: al estar liberado bajo Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para SFT adicional en dominios concretos en inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card: media sobre 18 benchmarks por dominio, evaluados con vLLM 0.21 a 32.768 tokens en bf16.

| Dominio | Puntuacion (%) |
|---|---|
| Conocimiento y razonamiento | 72,5 |
| Matematicas | 41,4 |
| Codigo | 53,9 |
| Seguimiento de instrucciones | 57,3 |
| **Media** | **61,2** |

No se han publicado resultados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la información disponible; solo se ofrecen las medias por dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos bf16 caben en una única GPU de 80 GB según la model card (tamaño de repositorio de 50,5 GB, más overhead de activaciones y caché KV para 32.768 tokens).
- GPU recomendadas: A100 80 GB o H100 80 GB para una sola GPU en bf16. Para despliegues con paralelismo de expertos, el ejemplo de la model card usa `--data-parallel-size 8 --enable-expert-parallel`, lo que implica 8 GPUs.
- GPU de consumo: no se documenta que quepa en GPUs de consumo (RTX 4090 de 24 GB) en bf16; no se dispone de cuantizaciones oficiales que lo permitan.
- Opciones de despliegue: vLLM 0.21 (recomendado, con soporte de expert parallel) y transformers con `AutoModelForCausalLM` en bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Media en 18 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-SFT-EchoMoE-teacher | 25,2 mil millones | 32.768 | 61,2 | Apache 2.0 | Hugging Face (McGill-NLP) |
| google/gemma-4-26B-A4B (base) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Hugging Face (Google) |
| Estudiante destilado EchoMoE (Gemma-4-26B-A4B) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Coleccion EchoMoE en Hugging Face |

La comparativa se limita al modelo base y al estudiante del mismo informe, ya que la información proporcionada no incluye datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al entrenarse sobre Dolci-Instruct-SFT, puede heredar sesgos presentes en ese dataset.
- Riesgo de alucinación: no se cuantifica en la información disponible; como modelo generativo de instrucciones, es susceptible de producir contenido factualmente incorrecto.
- Limitaciones de idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Limitaciones de contexto: la evaluación se realiza a 32.768 tokens; no se documenta comportamiento más allá de esa longitud.
- Restricciones de licencia: Apache 2.0, con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de dicha licencia para uso comercial.
- Caveat para producción: es un checkpoint de investigación orientado a destilación y evaluación comparativa; no se documentan optimizaciones de alineación, seguridad o tool calling, por lo que no se recomienda su uso directo en producción sin evaluación adicional.
- No se dispone de cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Gemma-4-26B-A4B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Paper: https://arxiv.org/abs/2611.22215
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
