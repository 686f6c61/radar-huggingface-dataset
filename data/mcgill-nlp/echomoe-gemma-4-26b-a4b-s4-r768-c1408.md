# McGill-NLP/EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408

## Resumen

EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408 es un checkpoint de investigación desarrollado por McGill-NLP que aplica la técnica EchoMoE sobre Gemma-4-26B-A4B, un modelo de mezcla de expertos (MoE) de Google. El objetivo no es mejorar la calidad del modelo base, sino reducir el coste de comunicación en inferencia distribuida con paralelismo de expertos (expert parallelism). En lugar de transmitir cada estado oculto completo entre nodos, EchoMoE envía una diferencia comprimida respecto a un estado de referencia que se refresca cada pocas capas.

El checkpoint concreto usa una referencia cada 4 capas MoE (8 de 30), un código de dispatch de 768 dimensiones y un código de combine de 1408 dimensiones. Según el autor, esto reduce un 50% los bytes transmitidos entre nodos y mejora el throughput un 14,2% en el escenario de mayor ganancia (expert parallel 32 sobre 4 nodos de 8 H100), a cambio de una pérdida media de 4,4 puntos sobre 18 benchmarks respecto al modelo profesor sin comprimir.

Es relevante para equipos que sirven modelos MoE grandes en clústeres multi-nodo y tienen el cuello de botella en la red de interconexión (all-to-all de dispatch y combine). No es un modelo pensado para uso general en producción, sino una contribución de sistemas: el modelo se distribuye con código remoto y requiere el plugin y el runtime propios del repositorio para aprovechar sus ventajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (gemma4_text), 30 capas, 128 expertos con 8 activos, hidden size 2.816, con retrofitting EchoMoE |
| Parametros totales | 24.638.464.542 (~24,6B) |
| Parametros activos | 8 de 128 expertos por capa (el autor no publica el recuento exacto de parametros activos) |
| Longitud de contexto | 32.768 tokens (evaluado a esa longitud) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye y evalua en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, con código remoto para transformers (custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B, un transformer MoE de 30 capas con 128 expertos por capa y 8 activos, tamaño oculto de 2.816. Sobre esa base, el profesor es el propio modelo afinado con instrucciones sobre allenai/Dolci-Instruct-SFT. El checkpoint EchoMoE se obtiene por destilación desde ese profesor sobre 4,3B tokens, con todos los pesos entrenados, y añade el mecanismo de compresión de activaciones: cada estado oculto se representa como diferencia respecto a una referencia refrescada cada 4 capas MoE, codificada en 768 dimensiones para el dispatch y 1.408 para el combine.

La innovación es de sistemas más que de modelado: la compresión se integra en el all-to-all de expert parallelism para reducir el tráfico entre nodos. La evaluación de precisión usa vLLM 0.21 con el plugin de EchoMoE; las mediciones de throughput usan el runtime de expert parallelism del repositorio sobre vLLM 0.29 con DeepEP. La carga en transformers 5.8.1 se hace mediante código remoto en PyTorch puro, sin paralelismo de expertos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (apply_chat_template).
- Razonamiento y conocimiento general, evaluado en el bloque de knowledge and reasoning del autor (72,5% en el profesor, 67,7% en EchoMoE).
- Matemáticas, evaluado en el bloque de math (41,4% profesor, 37,1% EchoMoE).
- Generación de código, evaluado en el bloque de code (53,9% profesor, 50,7% EchoMoE).
- Seguimiento de instrucciones, evaluado en el bloque de instruction following (57,3% profesor, 54,1% EchoMoE).
- Inferencia eficiente bajo paralelismo de expertos multi-nodo con el runtime del repositorio y DeepEP.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Servicio de un MoE de ~24,6B parámetros en clústeres multi-nodo con red limitada: el modelo reduce un 50% los bytes de dispatch y combine, lo que resulta adecuado cuando el all-to-all de expert parallelism satura RDMA y el coste de comunicación domina la latencia.
- Investigación en sistemas de inferencia distribuida: sirve como banco de pruebas reproducible para medir el compromiso entre compresión de activaciones y calidad, con configuración explícita (s4, r768, c1408) y resultados publicados por carga de trabajo.
- Evaluación de despliegues con expert parallel 32 sobre 4 nodos de 8 H100: el autor publica ganancias de throughput por escenario (por ejemplo, +14,2% con 4.096 tokens de entrada y 256 de salida), lo que permite dimensionar clústeres antes de adoptar la técnica.
- Generación de texto en inglés con contexto largo: con 32.768 tokens evaluados, encaja en tareas de resumen o análisis de documentos largos donde el throughput agregado importa más que la puntuación máxima absoluta.
- Prototipado académico de destilación y retrofitting de MoE: el checkpoint y su profesor permiten comparar directamente el efecto de la compresión sobre 18 benchmarks agrupados por dominio.
- Despliegue en una sola GPU de 80 GB: los pesos en bf16 caben en una A100/H100 de 80 GB vía transformers con código remoto, útil para validación funcional antes de pasar al runtime distribuido.

## Benchmarks y rendimiento

Precisión media (%) sobre 18 benchmarks por dominio, con la variación respecto al profesor entre paréntesis:

| Dominio | Profesor | EchoMoE |
|---|---|---|
| Conocimiento y razonamiento | 72,5 | 67,7 (−4,8) |
| Matemáticas | 41,4 | 37,1 (−4,3) |
| Código | 53,9 | 50,7 (−3,2) |
| Seguimiento de instrucciones | 57,3 | 54,1 (−3,2) |
| Media | 61,2 | 56,8 (−4,4) |

Throughput frente al profesor, ambos con vLLM 0.29 y DeepEP, expert parallel 32 sobre 4 nodos de 8 H100 y asignación equilibrada de expertos:

| Carga (entrada → salida) | Red | Peticiones por GPU | Ganancia BF16 | Ganancia FP8 |
|---|---|---|---|---|
| 128 → 1.024 | RDMA | 512 | +7,7% | +9,9% |
| 1.024 → 128 | RDMA | 512 | +12,9% | +11,1% |
| 4.096 → 256 | RDMA | 128 | +14,2% | +12,0% |
| 16.384 → 512 | RDMA | 32 | +11,9% | +10,2% |

No se han publicado en la información disponible resultados desagregados por benchmark individual (MMLU, HumanEval, GSM8K u otros); solo se ofrecen medias por dominio.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos (~24,6B parámetros) caben en una única GPU de 80 GB según el autor; el repositorio ocupa 49,3 GB.
- Cuantizaciones: no se publican pesos GGUF ni cuantizados; no disponible para despliegue de bajo VRAM.
- GPU recomendadas: H100 para el escenario de referencia (4 nodos de 8 H100, expert parallel 32); A100/H100 de 80 GB para carga en una sola GPU vía transformers.
- GPU de consumo: no se documenta soporte en RTX 4090 ni similares; el tamaño en bf16 y la ausencia de cuantizaciones publicadas lo hacen inviable en 24 GB.
- Despliegue: vLLM 0.21 con el plugin de EchoMoE (precisión) y vLLM 0.29 con DeepEP más el runtime del repositorio (throughput multi-nodo); transformers 5.8.1 con trust_remote_code para uso en una GPU. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: ganancias relativas de +7,7% a +14,2% frente al profesor según carga de trabajo; no se publican valores absolutos de tokens por segundo ni latencia por petición.
- Nota operativa: con --max-num-seqs 256 el arranque en vLLM tarda pocos minutos; con el valor por defecto, la captura de CUDA graphs supera el tiempo de espera de 600 segundos del servidor de API.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en 18 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408 | ~24,6B totales, 8/128 expertos activos | 32.768 | 56,8 | apache-2.0 | Hugging Face, código remoto y plugin propio |
| Gemma-4-26B-A4B-SFT-EchoMoE-teacher (profesor) | ~24,6B totales, 8/128 expertos activos | 32.768 (evaluado) | 61,2 | no disponible en la información | Hugging Face (McGill-NLP) |
| gemma-4-26B-A4B (base) | ~24,6B totales, 8/128 expertos activos | no disponible en la información | no disponible | licencia Gemma 4 de Google | Hugging Face (google) |

Frente a las alternativas de la misma categoría (otros checkpoints de la colección EchoMoE con distintas configuraciones de referencia y dimensiones de código), la información disponible no detalla sus resultados; la comparación cuantitativa publicada es únicamente contra el profesor.

## Limitaciones y advertencias

- Pérdida de calidad medible: 4,4 puntos de media sobre 18 benchmarks respecto al profesor, con el mayor deterioro en conocimiento y razonamiento (−4,8).
- Solo inglés: la model card declara únicamente el idioma en; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- No es un modelo de propósito general: está diseñado para escenarios con paralelismo de expertos multi-nodo; en una sola GPU no ofrece ninguna ventaja de throughput y conserva la pérdida de precisión.
- Dependencia de software específico: requiere el plugin y el runtime del repositorio, vLLM 0.21/0.29 y DeepEP; la integración con otros servidores no está documentada.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni tasas de alucinación; aplican los riesgos habituales de un modelo destilado con pérdida de conocimiento.
- Licencia: el campo license es apache-2.0, pero license_link apunta a la licencia de Gemma 4 de Google; conviene revisar los términos de esa licencia antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- Sin cuantizaciones publicadas: no hay pesos GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama media.
- Madurez: checkpoint de investigación con 396 descargas y 0 likes en el momento de la consulta; sin garantías de soporte ni mantenimiento.
- Capacidades de tool calling, agentes y multimodalidad no documentadas; no deben asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/EchoMoE-Gemma-4-26B-A4B-s4-r768-c1408
- Modelo profesor: https://huggingface.co/McGill-NLP/Gemma-4-26B-A4B-SFT-EchoMoE-teacher
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Paper: https://arxiv.org/abs/2611.22215
- Código: https://github.com/McGill-NLP/EchoMoE
- Página del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Colección EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Resultados de throughput en bruto: https://github.com/McGill-NLP/EchoMoE/blob/main/results/throughput/throughput.csv
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
