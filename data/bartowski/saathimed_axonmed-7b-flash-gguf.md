# bartowski/Saathimed_AxonMed-7B-Flash-GGUF

## Resumen

AxonMed-7B-Flash es un modelo de lenguaje especializado en dominio médico y sanitario, desarrollado por Saathimed y distribuido en formato GGUF por bartowski. Está construido sobre un checkpoint base de aproximadamente 7.615.616.512 parámetros (7,6 mil millones) y se presenta como un modelo orientado al razonamiento clínico, la respuesta a preguntas biomédicas y el procesamiento de registros de salud electrónicos. Su propuesta de valor es ofrecer un modelo médico "soberano" (etiqueta sovereign-ai) que pueda desplegarse localmente sin depender de APIs externas, algo relevante para entornos sanitarios con requisitos estrictos de privacidad.

La versión aquí documentada es una cuantización GGUF generada por bartowski con llama.cpp (release b12600), que incluye cuantizaciones con imatrix y un abanico amplio de formatos (bf16, Q8_0, Q6_K, Q5_K, Q4_K, IQ4_XS, entre otros). El modelo declara soporte para siete idiomas (inglés, español, chino, ruso, francés, alemán e hindi) y una licencia Apache 2.0, lo que facilita su uso comercial. No se especifica en la información disponible la longitud de contexto, la arquitectura exacta ni el volumen de datos de entrenamiento.

El interés actual del modelo radica en su combinación de tamaño moderado (apto para GPU de consumo), licencia permisiva y especialización médica declarada, con resultados reportados de 60,02% en MedQA (USMLE) y 74,4% en PubMedQA. No obstante, estos resultados no están verificados de forma independiente y deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no especificado) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, IQ4_NL, Q4_0, IQ4_XS (y otras en el repo) |
| Idiomas soportados | en, es, zh, ru, fr, de, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (tipo de transformer, atención, número de capas, dimensiones ocultas) ni sobre el proceso de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF/DPO o SFT). La model card del repositorio GGUF únicamente indica que se trata de una cuantización del checkpoint Saathimed/AxonMed-7B-Flash y que el recuento de parámetros del checkpoint fuente es de 8B (mientras que los safetensors declaran 7,6 B).

Los datasets referenciados en las etiquetas del modelo son GBaker/MedQA-USMLE-4-options, pubmed_qa y FreedomIntelligence/medical-o1-reasoning-SFT, lo que sugiere un ajuste orientado a preguntas de licencia médica, literatura biomédica y razonamiento clínico estilo "o1". No se documenta ninguna innovación técnica específica como decodificación especulativa (la model card indica explícitamente "Speculative decoding: no") ni mecanismos de atención lineal. La cuantización sí emplea imatrix para mejorar la calidad de los formatos de baja precisión.

## Capacidades

- Generación de texto conversacional con formato de chat basado en tokens especiales `<|im_start|>` / `<|im_end|>`.
- Razonamiento clínico y respuesta a preguntas médicas de opción múltiple (orientado a USMLE/MedQA).
- Respuesta a preguntas biomédicas basadas en literatura (PubMedQA).
- Soporte de tool calling / function calling mediante bloques `<tools>` y `<tool_call>` en el prompt de sistema.
- Capacidad multilingüe declarada en siete idiomas: inglés, español, chino, ruso, francés, alemán e hindi.
- Orientación a procesamiento de registros de salud electrónicos (electronic-health-records) según las etiquetas del modelo.
- No se declara soporte de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente de formación médica: el modelo puede resolver preguntas estilo USMLE y explicar el razonamiento clínico, útil para plataformas de estudio de estudiantes de medicina, dado su rendimiento declarado del 60,02% en MedQA.
- Apoyo a la revisión de literatura biomédica: con un 74,4% declarado en PubMedQA, puede emplearse para resumir y responder preguntas sobre abstracts y artículos indexados en PubMed en flujos de investigación.
- Triaje y preconsulta clínica: integrado en un chatbot de admisión hospitalaria para recoger síntomas estructurados y generar resúmenes preliminares para el personal sanitario, aprovechando el soporte de tool calling para consultar sistemas internos.
- Procesamiento de registros de salud electrónicos: extracción y normalización de información clínica de notas en texto, con despliegue local para cumplir requisitos de privacidad y residencia de datos.
- Despliegue en entornos con soberanía de datos: al ser un GGUF ejecutable con llama.cpp en hardware propio, permite inferencia on-premise sin enviar datos de pacientes a terceros.
- Integración en pipelines de CI/CD para validación de contenido médico: uso del modelo para verificar coherencia de textos clínicos generados o traducidos antes de su publicación.
- Soporte multilingüe en atención sanitaria: traducción y adaptación de material médico entre español, inglés, francés, alemán, ruso, chino e hindi, aunque la calidad por idioma no está documentada.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Tarea | Métrica | Valor |
|---|---|---|---|
| MedQA (USMLE 4-Options), split test | Multiple-choice | 0-shot Accuracy | 60,02 |
| MedQA (USMLE 4-Options), split test | Multiple-choice | 0-shot Normalized Accuracy | 60,02 |
| PubMedQA, split test | Question-answering | 0-shot Accuracy | 74,4 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparaciones oficiales con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): bf16 ≈ 15,24 GB; Q8_0 ≈ 8,10 GB; Q6_K ≈ 6,40 GB; Q5_K_M ≈ 5,52 GB; Q4_K_M ≈ 4,78 GB; IQ4_XS ≈ 4,2 GB (tamaño no confirmado en el fragmento disponible).
- GPU recomendadas: para bf16, una A100 40 GB o H100; para Q8_0, una RTX 4090 (24 GB) o A10G; para Q5_K_M y Q4_K_M, caben en GPU de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones Q4_K_M y Q5_K_M, con margen para KV cache si la longitud de contexto no es muy elevada (contexto no documentado).
- Opciones de despliegue: llama.cpp (versión b12600 o superior), Ollama (importando el GGUF), LM Studio, servidores compatibles con endpoints (etiqueta endpoints_compatible). vLLM y TGI no están confirmados para GGUF en esta información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos comparables de la misma categoría (médicos, ~7-8 B). Por tanto, la comparativa cuantitativa se marca como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AxonMed-7B-Flash (este) | 7,6 B | no disponible | Apache 2.0 | GGUF en HF | Benchmarks declarados no verificados |
| Alternativas médicas de ~7 B | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`), por lo que no deben tomarse como garantía de calidad clínica.
- Riesgo de alucinación inherente a los modelos de lenguaje; en dominio médico esto puede tener consecuencias graves si se usa sin supervisión humana.
- No se documentan sesgos conocidos, pero al no detallarse la composición del dataset de entrenamiento no es posible evaluar sesgos demográficos o lingüísticos.
- La longitud de contexto no está especificada, lo que impide planificar casos de uso con documentos largos (historiales clínicos extensos, por ejemplo).
- La calidad multilingüe está declarada pero no medida; el rendimiento en español, hindi o ruso podría ser muy inferior al del inglés.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el uso clínico real está sujeto a regulación sanitaria (MDR, FDA, etc.) que el modelo no cubre; no debe usarse como dispositivo médico sin validación regulatoria.
- El repositorio GGUF tiene 107,9 GB por acumulación de cuantizaciones; conviene descargar solo el archivo necesario.
- El recuento de parámetros difiere entre la model card del cuantizador (8B) y los safetensors (7,6 B), lo que introduce cierta ambigüedad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/Saathimed_AxonMed-7B-Flash-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Flash
- llama.cpp (release b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
