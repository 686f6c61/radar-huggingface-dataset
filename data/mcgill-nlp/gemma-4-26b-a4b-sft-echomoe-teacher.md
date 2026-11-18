# McGill-NLP/Gemma-4-26B-A4B-SFT-EchoMoE-teacher

## Resumen

Gemma-4-26B-A4B-SFT-EchoMoE-teacher es un ajuste fino supervisado del modelo denso-disparo google/gemma-4-26B-A4B, publicado por el grupo McGill-NLP. Se trata del "teacher" sin comprimir del proyecto EchoMoE: el modelo del que se destila el estudiante Gemma-4-26B-A4B y contra el que se comparan sus puntuaciones en el informe técnico "Communicate the Change: Efficient Expert Parallelism via Activation Compression". Por tanto, no es un modelo pensado para uso final, sino un artefacto de referencia para investigación en destilación y paralelismo de expertos.

El modelo hereda la arquitectura del base: 30 capas, 128 expertos con 8 activos por token y un tamaño oculto de 2.816. Los pesos en safetensors suman 25.233.141.790 parámetros totales (el nombre comercial redondea a 26B), y el repositorio ocupa 50,5 GB en bf16. El ajuste se realizó sobre allenai/Dolci-Instruct-SFT durante dos épocas con secuencias empaquetadas de 8.192 tokens y learning rate 2e-5.

Su relevancia es doble: por un lado, ofrece un punto de referencia concreto (media de 61,2 sobre 18 benchmarks) para evaluar la pérdida de calidad de la destilación; por otro, demuestra que un MoE de este tamaño puede servirse con vLLM 0.21 sin el paquete EchoMoE, ya que la arquitectura es la del modelo base. La licencia es Apache 2.0, la del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gemma4_text), 30 capas, 128 expertos con 8 activos, hidden size 2.816 |
| Parametros totales | 25.233.141.790 |
| Parametros activos | 8 de 128 expertos por token (no se publica el recuento exacto de parametros activos) |
| Longitud de contexto | 32.768 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (licencia del base, con enlace a la Gemma 4 license de Google) |
| Formato de pesos | safetensors (bf16), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-4-26B-A4B: un transformer de tipo mixture-of-experts con 30 capas, 128 expertos por capa y 8 expertos activos por token, con un tamaño oculto de 2.816. No se introduce ninguna modificación estructural respecto al base; el checkpoint es un ajuste fino directo, por lo que transformers y vLLM lo cargan sin necesidad del paquete EchoMoE.

El entrenamiento consistió en supervisión fina (SFT) sobre allenai/Dolci-Instruct-SFT, con dos épocas de secuencias empaquetadas de 8.192 tokens y learning rate 2e-5. No se documenta en la model card el uso de RLHF, DPO ni una fase de preferencias posterior. La innovación técnica del proyecto no reside en este checkpoint, sino en el método EchoMoE de compresión de activaciones para paralelismo de expertos, que se evalúa destilando un estudiante a partir de este teacher.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia del base.
- Razonamiento y conocimiento general: media de 72,5 en el bloque de conocimiento y razonamiento de los 18 benchmarks del informe.
- Matemáticas: media de 41,4 en el bloque de matemáticas.
- Generación de código: media de 53,9 en el bloque de código.
- Seguimiento de instrucciones: media de 57,3 en el bloque de instrucción.
- Soporte de decodificación greedy (por defecto) y de muestreo con temperature 0.7, top_p 0.8, top_k 20 y presence penalty 1.5 para tareas de chat.
- Capacidades de tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.

## Casos de uso

- Referencia de evaluación en investigación de destilación: sirve como techo de calidad contra el que medir la pérdida del estudiante comprimido de EchoMoE en los 18 benchmarks del informe.
- Reproducción de resultados: permite replicar las puntuaciones publicadas (61,2 de media) con vLLM 0.21 y las mismas configuraciones de decodificación.
- Estudio de paralelismo de expertos: al ser un MoE de 128 expertos, es un banco de pruebas realista para técnicas de expert parallelism y compresión de activaciones.
- Generación de datos sintéticos en inglés: su SFT sobre Dolci-Instruct lo hace utilizable para producir respuestas de referencia en pipelines de destilación o anotación.
- Experimentos de ajuste fino posteriores: al ser Apache 2.0 y cargar en transformers estándar, sirve como punto de partida para SFT adicional en dominios concretos.
- Evaluación comparativa de infraestructura: su despliegue con `--data-parallel-size 8 --enable-expert-parallel` en vLLM permite medir throughput y latencia de un MoE de 25B en clústeres multi-GPU.

## Benchmarks y rendimiento

| Dominio | Puntuación media (%) |
|---|---|
| Conocimiento y razonamiento | 72,5 |
| Matemáticas | 41,4 |
| Código | 53,9 |
| Seguimiento de instrucciones | 57,3 |
| **Media (18 benchmarks)** | **61,2** |

No se han publicado en la información disponible los resultados individuales de los 18 benchmarks (MMLU, HumanEval, GSM8K u otros), solo las medias por dominio. Tampoco se ofrecen comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM para inferencia: los pesos en bf16 caben en una sola GPU de 80 GB, según la model card.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 en una sola tarjeta; el despliegue de referencia en vLLM usa 8 GPUs con data parallelism y expert parallelism.
- GPU de consumo: no se documenta que quepa en GPUs de consumo (24 GB o menos) en bf16; no hay datos de cuantización publicados.
- Opciones de despliegue: vLLM 0.21 (comando de referencia con `--max-model-len 32768`) y transformers con `AutoModelForCausalLM` en bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma-4-26B-A4B-SFT-EchoMoE-teacher | 25,2B (MoE, 8/128 expertos) | 32.768 | Apache 2.0 | Hugging Face (este repo) |
| google/gemma-4-26B-A4B (base) | no disponible (misma arquitectura declarada) | no disponible | Apache 2.0 | Hugging Face |
| Estudiante destilado de EchoMoE | no disponible | no disponible | no disponible | Colección EchoMoE en Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento numérica.

## Limitaciones y advertencias

- Modelo entrenado y evaluado únicamente en inglés; no se declara soporte multilingüe.
- Es un artefacto de investigación (teacher de destilación), no un modelo afinado para producto; su uso en producción no está validado por el autor.
- Riesgo de alucinación inherente a un modelo de 25B con SFT sobre datos de instrucción; no se documentan mitigaciones específicas.
- No se publican datos sobre sesgos, filtrado de datos ni evaluaciones de seguridad.
- La puntuación de matemáticas (41,4) es notablemente inferior a la de conocimiento y razonamiento (72,5), lo que desaconseja su uso en tareas cuantitativas exigentes.
- La licencia Apache 2.0 remite además a la página de licencia de Gemma 4 de Google; conviene revisar los términos adicionales de esa licencia antes de un uso comercial.
- No hay información sobre cuantizaciones (GGUF, AWQ, GPTQ) ni sobre latencia, lo que dificulta planificar despliegues en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Gemma-4-26B-A4B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper: no disponible (pendiente de identificador arXiv según la model card)
