# leeroy-jankins/gipity

## Resumen

Gipity es un modelo de lenguaje fine-tuneado a partir de OpenAI GPT-OSS-20b, un transformer de arquitectura MoE (Mixture of Experts) de 20.9 mil millones de parámetros. El autor, leeroy-jankins, ha ajustado el modelo con un conjunto de datasets especializados en regulaciones financieras y presupuestarias de los Estados Unidos, como la Ley de Control de Presupuesto de 2011, la Ley de Transparencia Digital de 2014, el Libro de Símbolos de Cuentas Federales, entre otros. El resultado es un modelo cuantizado a GGUF (Q4_K_XL) diseñado para ejecución local en entornos de baja latencia, con soporte para RAG y razonamiento encadenado.

La relevancia de Gipity radica en su especialización en un dominio concreto (finanzas públicas y legislación federal de EE.UU.) y en su formato GGUF, que permite desplegarlo en hardware de consumo con un consumo de memoria reducido. Aunque hereda las capacidades generales del modelo base (generación de texto, razonamiento, seguimiento de instrucciones), su fine-tuning lo hace particularmente útil para tareas de consulta, resumen y análisis de documentos normativos y presupuestarios. El modelo se distribuye bajo licencia MIT según el campo de HuggingFace, aunque la model card menciona Apache 2.0, una discrepancia que conviene verificar antes de uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 20.914.757.184 (20,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (según model card; también se menciona Q4_K_M en el ejemplo de descarga) |
| Idiomas soportados | en (inglés) |
| Licencia | mit (según HuggingFace; la model card indica Apache 2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Gipity se basa en GPT-OSS-20b, un modelo de OpenAI con arquitectura de mezcla de expertos (MoE) que activa solo una fracción de sus parámetros por token, lo que reduce el coste computacional en inferencia. El modelo base incorpora cuantización nativa MXFP4 en las capas MoE, lo que permite ejecutarlo con aproximadamente 16 GB de memoria. El fine-tuning se realizó sobre un conjunto de datasets públicos de regulaciones federales, leyes de presupuesto, guías de contabilidad y estándares de control interno, todos en inglés. No se especifican el número de tokens de entrenamiento, la metodología exacta (si se usó RLHF, DPO o solo fine-tuning supervisado) ni si se emplearon adaptadores o pesos completos. La model card menciona que se empaquetan "pesos o adaptadores fine-tuneados", pero no se detalla el proceso.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés.
- Razonamiento encadenado (chain-of-thought) con esfuerzo configurable (bajo, medio, alto), heredado del modelo base.
- Resumen y análisis de documentos normativos y financieros, gracias al fine-tuning en datasets especializados.
- Generación de código ligero, según la model card.
- Posible soporte de function calling y ejecución de Python, aunque no se confirma explícitamente en la información disponible.
- Capacidad de integración en pipelines RAG para consultas sobre documentos gubernamentales.

## Casos de uso

- Consulta de regulaciones federales: un analista puede preguntar al modelo sobre disposiciones específicas de la Ley de Control de Presupuesto de 2011 y obtener respuestas contextualizadas, gracias al fine-tuning en ese corpus.
- Resumen de informes presupuestarios: el modelo puede condensar documentos extensos del Libro de Símbolos de Cuentas Federales o del Manual de Gestión Financiera del DOD en resúmenes ejecutivos.
- Asistencia en cumplimiento normativo: empresas que trabajan con contratos federales pueden usar el modelo para verificar si sus procedimientos se alinean con la Regulación Federal de Adquisiciones (FAR).
- Generación de informes de auditoría: el modelo puede redactar borradores de informes basados en datos de gasto público, apoyándose en su conocimiento de estándares de control interno.
- Chatbot especializado en finanzas públicas: desplegado en un entorno local, puede atender consultas de ciudadanos o empleados sobre asignaciones presupuestarias y cuentas del Tesoro.
- Análisis de impacto de nuevas leyes: el modelo puede comparar textos legales y resaltar cambios relevantes, facilitando el trabajo de legisladores o asesores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB gracias a la cuantización Q4 y a la arquitectura MoE con MXFP4, según la model card.
- GPU recomendadas: tarjetas de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB) pueden ejecutar el modelo sin problemas; también GPUs profesionales como A100 o H100 para despliegues de mayor concurrencia.
- Compatibilidad con hardware consumer: sí, siempre que se disponga de al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. También se puede usar con transformers si se convierte el formato.
- Latencia y throughput: no se proporcionan datos específicos; dependerá del hardware y del número de expertos activos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Gipity (este) | 20,9B (MoE) | no disponible | MIT (según HF) | GGUF | Finanzas públicas de EE.UU. |
| GPT-OSS-20b (base) | 20,9B (MoE) | no disponible | Apache 2.0 | safetensors | Generalista |
| Mixtral 8x7B | 46,7B (MoE) | 32k | Apache 2.0 | safetensors/GGUF | Generalista |

No se dispone de datos de rendimiento comparativo. La principal diferencia de Gipity es su fine-tuning en un dominio específico y su formato GGUF listo para uso local.

## Limitaciones y advertencias

- Sesgos: el fine-tuning se realizó exclusivamente con documentos oficiales de EE.UU., por lo que el modelo puede reflejar sesgos inherentes a esas fuentes y no generalizar bien a otros contextos legales o geográficos.
- Riesgo de alucinación: como cualquier LLM, puede generar información plausible pero incorrecta, especialmente en citas legales o numéricas. Se recomienda verificar siempre las respuestas con fuentes primarias.
- Limitaciones de contexto: no se especifica la longitud de contexto; si es la misma que el modelo base (probablemente 128k), pero no está confirmado.
- Restricciones de licencia: la discrepancia entre MIT (campo HF) y Apache 2.0 (model card) debe resolverse antes de un uso comercial. Ambas son permisivas, pero Apache 2.0 incluye cláusulas de patentes.
- Idioma: solo inglés; no hay soporte multilingüe.
- La model card menciona capacidades multimodales (imagen, audio) que no se corresponden con la arquitectura del modelo base (solo texto). Estas afirmaciones deben considerarse no verificadas.

## Enlaces

- [HuggingFace - leeroy-jankins/gipity](https://huggingface.co/leeroy-jankins/gipity)
- [Modelo base: unsloth/gpt-oss-20b-GGUF](https://huggingface.co/unsloth/gpt-oss-20b-GGUF)
- [Repositorio de OpenAI GPT-OSS](https://github.com/openai/gpt-oss)
- Datasets de fine-tuning (enlaces en la model card):
  - [Balanced Budget and Emergency Deficit Control Act of 1985](https://huggingface.co/datasets/leeroy-jankins/The-Balanced-Budget-And-Emergency-Deficit-Control-Act-of-1985)
  - [Budget Control Act of 2011](https://huggingface.co/datasets/leeroy-jankins/The-Budget-Control-Act-2011)
  - [Digital Accountability And Transparency Act of 2014](https://huggingface.co/datasets/leeroy-jankins/Data-Act-2014)
  - [Federal Account Symbols And Titles Book](https://huggingface.co/datasets/leeroy-jankins/FastBook)
  - [Federal Acquisition Regulation](https://huggingface.co/datasets/leeroy-jankins/Federal-Acquisition-Regulation)
  - [Federal Government Standards For Internal Controls](https://huggingface.co/datasets/leeroy-jankins/Federal-Government-Standards-For-Internal-Controls)
  - [Federal Managers Financial Integrity Act of 1982](https://huggingface.co/datasets/leeroy-jankins/FMFIA-1982)
  - [Federal Trust Fund Accounting Guide](https://huggingface.co/datasets/leeroy-jankins/Federal-Trust-Fund-Accounting-Guide)
  - [Financial Management Regulations DOD 7000-14-R](https://huggingface.co/datasets/leeroy-jankins/DOD-7000-14-Financial-Management-Regulation)
