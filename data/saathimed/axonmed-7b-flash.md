# Saathimed/AxonMed-7B-Flash

## Resumen

AxonMed-7B-Flash es un modelo de lenguaje de 7.615.616.512 parámetros (7,6 B) especializado en dominio médico y desarrollado por SaathiMed Private Limited, empresa india fundada por Amrendra Kumar. Se presenta como un modelo de pesos abiertos orientado a razonamiento clínico, comprensión de historiales clínicos electrónicos (EHR), extracción de entidades clínicas y codificación médica estandarizada ICD-10. Deriva mediante fine-tuning del modelo Saathimed/AxonMed-7B-Thinking y se distribuye con licencia Apache 2.0.

El modelo se construye sobre la arquitectura Qwen2 (según los tags del repositorio) y está entrenado sobre conjuntos de datos médicos públicos como MedQA-USMLE-4-options, PubMedQA y FreedomIntelligence/medical-o1-reasoning-SFT. Su propuesta principal es alcanzar el umbral de aprobado del USMLE (60 %) en modo zero-shot con solo 7 B de parámetros, superando a modelos de tamaño similar como Meditron-7B, BioMistral-7B y LLaMA-3-8B en la tarea MedQA.

La relevancia actual del modelo radica en su enfoque "soberano" (pesos abiertos, despliegue local) para entornos sanitarios con requisitos de privacidad, y en su alineación declarada con 87 tareas de NLP clínico orientadas a flujos hospitalarios reales. La información disponible no detalla la longitud de contexto ni los datos exactos de entrenamiento, por lo que varios parámetros quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tags del repo) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de la model card usa float16) |
| Idiomas soportados | en, es, zh, ru, fr, de, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 7,6 B de parámetros, construido sobre la arquitectura Qwen2 según los tags del repositorio, y obtenido por fine-tuning del modelo Saathimed/AxonMed-7B-Thinking. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; únicamente declara el uso de los conjuntos MedQA-USMLE-4-options, PubMedQA y FreedomIntelligence/medical-o1-reasoning-SFT.

La innovación declarada por el autor es un "framework de doble delimitador de alto rendimiento" (dual-delimiter framework) orientado a la comprensión de EHR y a la extracción estructurada de información clínica, junto con un formato de prompt que separa el análisis del resultado ("Analysis:" / "Result:"). No se documentan innovaciones arquitectónicas adicionales como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento clínico en dominio médico, con formato de análisis previo al resultado.
- Respuesta a preguntas de tipo examen médico (USMLE) en modo zero-shot.
- Question answering biomédico sobre literatura (PubMedQA).
- Extracción de entidades clínicas y estructuración de información desde historiales clínicos electrónicos (EHR).
- Codificación médica estandarizada: ICD-10 (capítulo, bloque y sub-bloque), ICD-O-3 para morfología tumoral y estadificación TNM.
- Tareas de triaje diagnóstico declaradas: ictus isquémico agudo (AIS), mortalidad intrahospitalaria y riesgo de hospitalización.
- Farmacoterapia y seguridad: extracción de eventos adversos a medicamentos (ADE), dosis y vía de administración.
- Soporte multilingüe declarado en siete idiomas: inglés, español, chino, ruso, francés, alemán e hindi.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el formato Analysis/Result sugiere razonamiento por pasos, pero no se detalla.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Codificación clínica automatizada: el modelo puede transformar informes de alta y notas clínicas en códigos ICD-10 e ICD-O-3, reduciendo el trabajo manual de codificación en facturación y auditoría hospitalaria.
- Soporte a la decisión diagnóstica: dado un caso clínico en texto, el modelo genera un análisis razonado y una conclusión estructurada, útil como segunda opinión en entornos de triaje.
- Extracción de información de EHR: procesamiento de historiales para poblar bases de datos estructuradas con diagnósticos, tratamientos, dosis y vías de administración.
- Farmacovigilancia: detección y extracción de eventos adversos a medicamentos a partir de notas clínicas, para sistemas de notificación y análisis de seguridad.
- Investigación biomédica: respuesta a preguntas sobre literatura científica (PubMedQA) y resumen de evidencia para revisión preliminar.
- Formación médica: generación de preguntas y explicaciones de estilo USMLE para plataformas de estudio y evaluación formativa.
- Despliegue soberano en entornos sanitarios: al ser pesos abiertos con licencia Apache 2.0, puede ejecutarse en infraestructura propia para cumplir requisitos de privacidad y residencia de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index, zero-shot, `lm-evaluation-harness` v0.4.13; no verificados de forma independiente):

| Modelo | Parametros | Organizacion | MedQA (USMLE) | PubMedQA |
|---|---|---|---|---|
| Meditron-7B | 7B | EPFL | 52,00 % | 74,40 % |
| BioMistral-7B | 7B | INSERM | 53,80 % | 74,80 % |
| Meta LLaMA-3-8B | 8B | Meta AI | 54,20 % | 72,00 % |
| OpenBioLLM-8B | 8B | Saama AI Lab | 58,99 % | 74,12 % |
| OpenAI GPT-3.5 Turbo | ~175B | OpenAI | 60,50 % | 75,20 % |
| AxonMed-7B-Flash | 7B | SaathiMed | 60,02 % | 74,40 % |

Los valores de la fila AxonMed-7B-Flash proceden del model-index del autor; los de los modelos comparativos se toman de la tabla de la model card y no se han verificado de forma independiente. El autor declara que 60,02 % supera el umbral de aprobado del USMLE (60 %).

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 15-16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda GPU con 24 GB o más.
- Cuantización a 8 bits: aproximadamente 8-9 GB de VRAM; a 4 bits: aproximadamente 4-5 GB, aunque la información sobre cuantizaciones publicadas no está disponible.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para float16; RTX 3090/4090 o GPUs de 12-16 GB si se cuantiza.
- Cabe en GPU de consumo: sí, en RTX 4090 en float16 ajustado y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo, ejemplo oficial), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA | PubMedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxonMed-7B-Flash | 7,6B | no disponible | 60,02 % | 74,40 % | Apache 2.0 | Hugging Face |
| Meditron-7B | 7B | no disponible | 52,00 % | 74,40 % | no disponible | Hugging Face |
| BioMistral-7B | 7B | no disponible | 53,80 % | 74,80 % | no disponible | Hugging Face |
| OpenBioLLM-8B | 8B | no disponible | 58,99 % | 74,12 % | no disponible | Hugging Face |

AxonMed-7B-Flash destaca en MedQA frente a los modelos médicos abiertos de tamaño similar, mientras que en PubMedQA queda en un rango comparable (74,40 %), por debajo de BioMistral-7B (74,80 %). La licencia Apache 2.0 es favorable para uso comercial, aunque no se dispone de datos de contexto ni de verificación independiente de los resultados.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en contexto clínico; el modelo no sustituye el juicio profesional ni el diagnóstico primario, según la propia model card.
- No se documentan sesgos conocidos, pero el entrenamiento sobre datasets médicos públicos puede heredar sesgos de población y de literatura.
- Longitud de contexto no disponible, lo que impide evaluar su idoneidad para historiales clínicos extensos.
- El soporte multilingüe está declarado en siete idiomas, pero no se aportan métricas por idioma; el rendimiento fuera del inglés podría ser inferior.
- Licencia Apache 2.0 permite uso comercial, pero el uso clínico real exige validación local, cumplimiento normativo (por ejemplo, MDR en la UE o regulaciones equivalentes) y supervisión humana.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos sin trabajo adicional.
- El repositorio tiene 620 descargas y 0 likes en el momento de la consulta, lo que indica una adopción comunitaria todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saathimed/AxonMed-7B-Flash
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- DOI Zenodo: https://doi.org/10.5281/zenodo.24143274
- ORCID del autor: https://orcid.org/0009-0006-7093-6762
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
