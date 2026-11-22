# bartowski/Saathimed_AxonMed-32B-Thinking-GGUF

## Resumen

AxonMed-32B-Thinking es un modelo de lenguaje especializado en razonamiento clínico y médico, desarrollado por Saathimed y distribuido en formato GGUF por bartowski. Se trata de un modelo de 32.763.876.352 parámetros (aproximadamente 32,8B) afinado para tareas de razonamiento médico con cadena de pensamiento (chain-of-thought), orientado a preguntas de tipo USMLE, PubMedQA y razonamiento clínico multi-paso. Su relevancia radica en que combina un tamaño manejable para despliegue local con capacidades de razonamiento explícito en el dominio sanitario, un nicho donde los modelos generalistas suelen fallar por falta de vocabulario y protocolos específicos.

La versión aquí descrita es la cuantización GGUF realizada por bartowski con llama.cpp (release b12600), que incluye cuantizaciones con imatrix y un rango que va desde bf16 (65,54 GB) hasta IQ4_NL (18,94 GB), pasando por Q4_K_M (20,32 GB) como opción recomendada por equilibrio tamaño/calidad. El modelo base es Saathimed/AxonMed-32B-Thinking, publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo declara soporte para siete idiomas (inglés, español, chino, alemán, francés, ruso e hindi), entrada exclusivamente de texto, y compatibilidad con tool calling mediante un formato de prompt tipo ChatML con etiquetas `<tool_call>`. Está pensado para escenarios de soberanía de datos en salud, donde el despliegue on-premise es un requisito regulatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se especifica variante concreta en la información disponible) |
| Parametros totales | 32.763.876.352 (≈32,8B) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, IQ4_NL, Q4_0 |
| Idiomas soportados | en, es, zh, de, fr, ru, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp); el modelo original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un transformer decoder-only de 32,8B parámetros. El modelo base Saathimed/AxonMed-32B-Thinking se ha afinado sobre un conjunto de datos médicos que incluye GBaker/MedQA-USMLE-4-options, pubmed_qa, FreedomIntelligence/medical-o1-reasoning-SFT y medalpaca/medical_meadow_usmle_self_assessment. La presencia de medical-o1-reasoning-SFT sugiere un ajuste orientado a generar trazas de razonamiento explícitas antes de la respuesta final (modo thinking / chain-of-thought), aunque no se especifica el volumen de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO.

La cuantización GGUF se ha realizado con llama.cpp b12600 empleando imatrix, lo que mejora la preservación de calidad en cuantizaciones bajas (Q4 y Q3) al calibrar los pesos con estadísticas de activación. No se declara decodificación especulativa ni mecanismos de atención lineal; el soporte de tool calling se implementa a nivel de prompt con formato ChatML y etiquetas XML `<tools>` y `<tool_call>`.

## Capacidades

- Generación de texto y razonamiento clínico multi-paso con cadena de pensamiento explícita (modo thinking).
- Respuesta a preguntas de opción múltiple de tipo USMLE (MedQA 4 opciones).
- Preguntas de investigación biomédica con contexto de PubMedQA.
- Soporte de tool calling / function calling mediante el formato ChatML con `<tools>` y `<tool_call>`.
- Conversación multi-turno con formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`).
- Capacidades multilingües declaradas en siete idiomas: inglés, español, chino, alemán, francés, ruso e hindi.
- Entrada exclusivamente de texto (no se declara visión ni audio).
- Compatible con endpoints (tag `endpoints_compatible` en Hugging Face).

## Casos de uso

- Formación médica y preparación de exámenes tipo USMLE: el modelo puede resolver preguntas de opción múltiple con razonamiento explícito paso a paso, lo que permite al estudiante revisar la cadena de razonamiento y no solo la respuesta final. Su accuracy declarada del 75,81% en MedQA lo sitúa como herramienta de apoyo al estudio, no como sustituto del criterio clínico.
- Triaje de consultas clínicas en atención primaria: con despliegue on-premise bajo licencia Apache 2.0, un hospital puede integrar el modelo en su intranet para clasificar síntomas y sugerir derivaciones, manteniendo los datos de pacientes dentro de su perímetro regulatorio.
- Búsqueda y síntesis de literatura biomédica: dado su ajuste sobre PubMedQA (79% de accuracy declarada), puede emplearse para resumir abstracts y responder preguntas de investigación con citas de contexto, integrándose en pipelines de revisión sistemática.
- Asistente de documentación clínica: generación de notas estructuradas a partir de transcripciones de consulta, con formato ChatML y tool calling para volcar los datos a un EHR mediante funciones definidas por el integrador.
- Soporte a codificación médica (ICD-10, SNOMED): el modelo puede mapear descripciones libres a códigos mediante tool calling contra una API de terminologías, usando el razonamiento para desambiguar casos límite.
- Despliegue en entornos con GPU de consumo: la cuantización Q4_K_M (20,32 GB) permite ejecutar el modelo en una RTX 4090 de 24 GB o en un Mac con Apple Silicon unificado, habilitando prototipos de investigación sin infraestructura de datacenter.
- Generación de material divulgativo sanitario multilingüe: con soporte para español, inglés, francés, alemán, ruso, chino e hindi, puede adaptar contenido educativo sanitario a poblaciones diversas.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| Medical Board USMLE Examination | MedQA (USMLE 4-Options), test | 0-shot Accuracy | 75,81 |
| Medical Board USMLE Examination | MedQA (USMLE 4-Options), test | 0-shot Normalized Accuracy | 75,81 |
| Biomedical Research QA | PubMedQA, test | 0-shot Accuracy | 79,00 |

No se han publicado en la información disponible resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) ni comparativas con otros modelos médicos.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - bf16: 65,54 GB (requiere múltiples GPU o una GPU de 80 GB).
  - Q8_0: 34,82 GB.
  - Q6_K / Q6_K_L: 27,62–27,99 GB.
  - Q5_K_M / Q5_K_S: 22,75–23,64 GB.
  - Q4_K_M: 20,32 GB (opción recomendada por el autor).
  - IQ4_NL: 18,94 GB.
- GPU recomendadas: A100 80 GB o H100 para bf16 y Q8_0; A100 40 GB o RTX 6000 Ada para Q6; RTX 4090 (24 GB) para Q4_K_M y Q5 con margen justo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q4_K_M, Q4_K_S, IQ4_NL y Q4_0; en RTX 3090 (24 GB) de forma equivalente. En GPUs de 16 GB no cabe sin offloading a RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA (USMLE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxonMed-32B-Thinking (este) | 32,8B | no disponible | 75,81 (0-shot) | Apache 2.0 | GGUF en HF |
| Modelos médicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos de la misma categoría (médicos, ~30B, con razonamiento), por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Los resultados de benchmarks (75,81% en MedQA, 79% en PubMedQA) están declarados por el autor y marcados como `verified: false`; no han sido validados de forma independiente.
- Riesgo de alucinación en un dominio de alto riesgo: cualquier salida debe ser revisada por personal sanitario cualificado antes de uso clínico. El modelo no es un dispositivo médico ni está certificado como tal.
- No se especifica la longitud de contexto, lo que impide garantizar el manejo de historiales clínicos largos o documentos extensos.
- El ajuste se ha realizado sobre datasets en inglés (MedQA, PubMedQA, medical-o1-reasoning-SFT, medical_meadow_usmle); el rendimiento en español, chino, alemán, francés, ruso e hindi puede ser inferior al declarado en inglés.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos presentes en los datasets médicos de origen (poblaciones, demografía, práctica clínica occidental).
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria (MDR, FDA, AI Act) recae en el integrador, no en el autor del modelo.
- El formato GGUF limita el despliegue a llama.cpp y ecosistemas compatibles; para vLLM o TGI habría que usar el checkpoint original en safetensors.
- No se declara soporte de decodificación especulativa, lo que puede limitar el throughput en comparación con modelos que sí la implementan.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Saathimed_AxonMed-32B-Thinking-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Thinking
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Dataset MedQA USMLE 4-Options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset medical_meadow_usmle_self_assessment: https://huggingface.co/datasets/medalpaca/medical_meadow_usmle_self_assessment
