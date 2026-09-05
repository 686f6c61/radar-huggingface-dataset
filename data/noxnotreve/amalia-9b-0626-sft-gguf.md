# NoxNotreve/AMALIA-9B-0626-SFT-GGUF

## Resumen

AMALIA-9B-0626-SFT es un modelo de lenguaje abierto desarrollado por un consorcio de universidades y centros de investigación portugueses, liderado por NOVA University Lisbon, Instituto Superior Técnico, University of Coimbra, University of Porto, University of Minho y la Fundação para a Ciência e a Tecnologia (FCT). Financiado por el Gobierno de Portugal, su objetivo es crear un LLM soberano y transparente adaptado al portugués europeo.

El modelo se basa en EuroLLM, extendiendo su preentrenamiento con datos de Arquivo.pt, datos curados en portugués europeo, muestras de contexto largo de Stack-v2 y datos sintéticos para mejorar la retención de contexto largo. La longitud máxima de contexto se amplía a 32.000 tokens. Tras el preentrenamiento, se aplicó Supervised Fine-Tuning (SFT) durante 76 horas en 64 NVIDIA H100 GPUs (14.000 pasos) y posteriormente Direct Preference Optimization (DPO) para alinear el comportamiento con preferencias humanas.

Esta versión GGUF, cuantizada por duarteocarmo, permite ejecutar el modelo con llama.cpp en hardware de consumo. El modelo tiene aproximadamente 9.152 millones de parámetros y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en EuroLLM) |
| Parametros totales | 9.152.319.488 (9.15B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | BF16, IQ4_XS, Q2_K, Q3_K_L, Q3_K_M, Q3_K_S, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | Portugués europeo (etiqueta "pt") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

AMALIA-9B-0626-SFT es un modelo transformer basado en EuroLLM, sin arquitectura MoE. El preentrenamiento de EuroLLM se extendió con datos de Arquivo.pt (colecciones de páginas web públicas y libros gratuitos), datos de preentrenamiento de EuroLLM, muestras de contexto largo de Stack-v2 y datos sintéticos para mejorar la retención de contexto largo (needle-llama3-16x8k, needle_32k_finetuning_dataset). La longitud máxima de secuencia se amplió a 32.000 tokens.

El postentrenamiento consta de dos fases: SFT y DPO. La fase SFT utilizó una mezcla de datos creados manualmente, generados sintéticamente y disponibles públicamente, con el objetivo de mejorar las capacidades conversacionales y de seguimiento de instrucciones en portugués europeo. Se entrenó durante 76 horas en 64 NVIDIA H100 GPUs durante 14.000 pasos. La fase DPO utilizó un dataset de preferencias que incluye pares on-policy generados en parte por el propio AMALIA-SFT, para alinear las respuestas con preferencias humanas.

## Capacidades

- Generación de texto conversacional en portugués europeo.
- Seguimiento de instrucciones (instruction following) gracias al SFT.
- Alineación con preferencias humanas mediante DPO.
- Contexto largo de hasta 32.000 tokens, lo que permite procesar documentos extensos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el modelo se centra en portugués europeo, aunque hereda la base EuroLLM).
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Atención al cliente en portugués europeo: el modelo puede gestionar conversaciones multi-turno con contexto largo de 32.000 tokens, adecuado para asistentes virtuales en servicios públicos o empresas portuguesas.
- Generación de documentación técnica y legal: su capacidad para seguir instrucciones y su contexto largo permiten redactar contratos, informes y documentos administrativos en portugués europeo.
- Análisis de documentos extensos: gracias a la ventana de 32.000 tokens, puede resumir y extraer información de informes, tesis o expedientes completos.
- Educación y tutoría: puede servir como tutor de portugués europeo, resolviendo dudas gramaticales o generando ejercicios personalizados.
- Investigación en NLP: el modelo y sus datasets de SFT y DPO están disponibles públicamente, lo que facilita la investigación reproducible en procesamiento del lenguaje natural para portugués.
- Administración pública y soberanía digital: al ser un modelo abierto y entrenado con datos portugueses, puede integrarse en sistemas gubernamentales sin depender de proveedores externos.
- RAG sobre corpus portugueses: su contexto largo y su naturaleza conversacional lo hacen adecuado para sistemas de recuperación aumentada sobre documentos de Arquivo.pt o repositorios institucionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K (3.35 GB): ~4-5 GB de VRAM.
  - Q4_K_M (5.20 GB): ~6-7 GB de VRAM.
  - Q5_K_M (6.07 GB): ~7-8 GB de VRAM.
  - Q8_0 (9.06 GB): ~10-11 GB de VRAM.
  - BF16 (17.05 GB): ~18-20 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o BF16; A100 o H100 para BF16 con contexto completo; GPUs de consumo de 8-12 GB para Q4-Q5.
- El modelo cabe en GPUs de consumo con cuantizaciones Q2-Q5, pero para contexto completo de 32.000 tokens se necesita más VRAM para la caché KV.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, se puede usar vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AMALIA-9B-0626-SFT | 9.15B | 32.000 | Apache 2.0 | HuggingFace, GGUF |
| EuroLLM (base) | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Llama-3.1-8B | 8B | 128.000 | Llama 3.1 Community | HuggingFace |
| Mistral-7B | 7.3B | 32.000 | Apache 2.0 | HuggingFace |

Nota: los datos de Llama-3.1-8B y Mistral-7B son de conocimiento público, pero no se han verificado en la información proporcionada. La comparación de rendimiento no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos web de Arquivo.pt, el modelo puede heredar sesgos presentes en esos contenidos. No se han publicado análisis de sesgo específicos.
- Riesgo de alucinación: no se han publicado evaluaciones de alucinación para este modelo.
- Limitaciones de idioma: el modelo está orientado al portugués europeo; su rendimiento en otros idiomas no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir y conservar el aviso de licencia.
- Caveat de producción: esta versión GGUF es una conversión de pesos sin entrenamiento adicional; las capacidades son las del modelo base. No se han publicado benchmarks oficiales, por lo que se recomienda evaluar el modelo en el dominio de aplicación antes de desplegarlo.

## Enlaces

- HuggingFace (conversión GGUF): https://huggingface.co/NoxNotreve/AMALIA-9B-0626-SFT-GGUF
- HuggingFace (modelo base): https://huggingface.co/amalia-llm/AMALIA-9B-0626-SFT
- Sitio web del proyecto: https://amaliallm.pt/
- Repositorio principal: https://github.com/AMALIA-LLM/AMALIA
- Repositorio de evaluación: https://github.com/AMALIA-LLM/amalia-lm-eval
- Paper (PROPOR 2026): https://aclanthology.org/2026.propor-1.38/
- Datasets SFT: https://huggingface.co/datasets/amalia-llm/AMALIA-LLM-0626-SFT-Dataset
- Datasets DPO: https://huggingface.co/datasets/amalia-llm/DPO-Dataset
- Referencias arXiv: https://arxiv.org/abs/2506.04079 (EuroLLM), https://arxiv.org/abs/2402.19173 (Stack-v2), https://arxiv.org/abs/2603.26511 (technical report AMALIA, según tags)
- Otra conversión GGUF: https://huggingface.co/layerx-labs/AMALIA-9B-0626-SFT-GGUF
