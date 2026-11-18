# Saathimed/AxonMed-7B-Flash

## Resumen

AxonMed-7B-Flash es un modelo de lenguaje de 7.615 millones de parámetros especializado en dominio clínico y biomédico, desarrollado por SaathiMed Private Limited (India) y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino supervisado sobre el modelo base AxonMed-7B-Thinking, que a su vez parte de la arquitectura Qwen2. El modelo está orientado a tareas de informática médica: razonamiento diagnóstico, extracción de entidades clínicas, codificación ICD-10 e ICD-O-3, y respuesta a preguntas biomédicas.

Su relevancia actual radica en que declara superar el umbral de aprobado del examen médico estadounidense USMLE (60,0 %) en la evaluación zero-shot sobre MedQA, con un 60,02 % de precisión. Según la model card, este resultado supera a modelos abiertos de tamaño similar como Meditron-7B (52,00 %), BioMistral-7B (53,80 %), LLaMA-3-8B (54,20 %) y OpenBioLLM-8B (58,99 %), y se aproxima a GPT-3.5 Turbo (~175B, 60,50 %). El autor presenta el modelo bajo la etiqueta de "soberanía clínica" (sovereign clinical foundation model), enfatizando su carácter abierto y su alineación con tareas clínicas reales del conjunto Harvard BRIDGE.

El modelo soporta ocho idiomas (inglés, español, chino, ruso, francés, alemán e hindi, además del inglés como idioma principal) y se distribuye en formato safetensors con un repositorio de 15,2 GB. Está pensado para investigación en informática médica, validación educativa y soporte a la decisión clínica, no como sustituto del juicio profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card sugiere fp16 en el ejemplo de inferencia) |
| Idiomas soportados | en, es, zh, ru, fr, de, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

AxonMed-7B-Flash es un transformer decoder-only de la familia Qwen2 con 7.615 millones de parámetros totales. No se trata de una arquitectura MoE ni híbrida: la model card no documenta mecanismos de atención lineal, decodificación especulativa ni otras innovaciones arquitectónicas más allá de la base Qwen2. El modelo se obtiene por ajuste fino supervisado (SFT) sobre AxonMed-7B-Thinking, que a su vez es el modelo base declarado en los metadatos.

Los datos de entrenamiento citados en la model card son GBaker/MedQA-USMLE-4-options, pubmed_qa y FreedomIntelligence/medical-o1-reasoning-SFT. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; la información disponible solo indica ajuste fino supervisado sobre el modelo base. La model card menciona un "marco de doble delimitador" (dual-delimiter framework) orientado a la comprensión de historiales clínicos electrónicos (EHR), la extracción de entidades clínicas y la codificación ICD-10, así como una alineación con las 87 tareas clínicas reales del conjunto Harvard BRIDGE, aunque no se detalla la metodología de dicha alineación.

## Capacidades

- Generación de texto y razonamiento clínico en formato de análisis paso a paso seguido de resultado (patrón `Analysis: ... Result:`).
- Respuesta a preguntas de opción múltiple de nivel USMLE (MedQA) y preguntas biomédicas de investigación (PubMedQA).
- Codificación médica estandarizada: ICD-10 (capítulo, bloque y subbloque) e ICD-O-3 / Cantemist para morfología tumoral.
- Extracción de entidades clínicas y de eventos adversos a medicamentos (ADE), incluyendo dosis y vía de administración.
- Triaje diagnóstico: ictus isquémico agudo (AIS), riesgo de mortalidad intrahospitalaria y riesgo de hospitalización.
- Estadificación TNM y morfología histopatológica.
- Comprensión de historiales clínicos electrónicos (EHR) mediante el marco de doble delimitador declarado por el autor.
- Capacidades multilingües declaradas en ocho idiomas (en, es, zh, ru, fr, de, hi).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modelo emplea razonamiento paso a paso en las respuestas.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Soporte a la decisión diagnóstica en triaje: el modelo puede clasificar casos de ictus isquémico agudo o estimar riesgo de mortalidad intrahospitalaria a partir de notas clínicas, gracias a su alineación declarada con las tareas Harvard BRIDGE de triaje diagnóstico.
- Codificación médica automatizada: asignación de códigos ICD-10 e ICD-O-3 a informes de alta y anatomía patológica, reduciendo el trabajo manual de codificación en facturación y auditoría clínica.
- Extracción de eventos adversos a medicamentos: procesamiento de notas de evolución para identificar fármacos, dosis, vías de administración y reacciones adversas, útil en farmacovigilancia.
- Respuesta a preguntas biomédicas para investigación: consultas sobre literatura científica y resúmenes de evidencia, apoyándose en su entrenamiento sobre PubMedQA (74,4 % de precisión declarada).
- Formación médica y validación educativa: generación de preguntas y explicaciones razonadas estilo USMLE para plataformas de preparación de exámenes, con razonamiento paso a paso.
- Procesamiento de historiales clínicos electrónicos multilingües: normalización y resumen de notas clínicas en inglés, español, francés, alemán, hindi, chino y ruso, aprovechando el soporte multilingüe declarado.
- Estadificación tumoral asistida: extracción de estadio TNM y morfología histopatológica a partir de informes de patología para registros de cáncer.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluación zero-shot con EleutherAI lm-evaluation-harness v0.4.13; métricas marcadas como no verificadas en el model-index):

| Modelo | Parámetros | Organización | MedQA (USMLE) | PubMedQA | Estado USMLE |
|---|---|---|---|---|---|
| Meditron-7B | 7B | EPFL | 52,00 % | 74,40 % | No supera (<60 %) |
| BioMistral-7B | 7B | INSERM | 53,80 % | 74,80 % | No supera (<60 %) |
| Meta LLaMA-3-8B | 8B | Meta AI | 54,20 % | 72,00 % | No supera (<60 %) |
| OpenBioLLM-8B | 8B | Saama AI Lab | 58,99 % | 74,12 % | No supera (<60 %) |
| OpenAI GPT-3.5 Turbo | ~175B | OpenAI | 60,50 % | 75,20 % | Supera (>=60 %) |
| AxonMed-7B-Flash | 7B | SaathiMed (India) | 60,02 % | 74,40 % | Supera (>=60 %) |

Las métricas del model-index para AxonMed-7B-Flash son: MedQA 0-shot accuracy 60,02 (acc_norm 60,02) y PubMedQA 0-shot accuracy 74,40. No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 15,2 GB solo para los pesos (7.615 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 18-20 GB.
- En cuantización de 8 bits: en torno a 8 GB de VRAM; en 4 bits, en torno a 4-5 GB (estimaciones a partir del tamaño de parámetros; el autor no publica cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4090 o GPUs de 8-12 GB para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con fp16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo, ejemplo oficial con `AutoModelForCausalLM` y `device_map="auto"`), text-generation-inference (etiqueta `text-generation-inference` en los metadatos), endpoints compatibles (`endpoints_compatible`). No se documenta soporte oficial de vLLM, llama.cpp u Ollama, aunque al ser un transformer Qwen2 estándar en safetensors es probable su conversión a GGUF (no confirmado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA | PubMedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxonMed-7B-Flash | 7,6B | no disponible | 60,02 % | 74,40 % | Apache 2.0 | Hugging Face |
| Meditron-7B | 7B | no disponible | 52,00 % | 74,40 % | no disponible en esta ficha | Hugging Face |
| BioMistral-7B | 7B | no disponible | 53,80 % | 74,80 % | no disponible en esta ficha | Hugging Face |
| OpenBioLLM-8B | 8B | no disponible | 58,99 % | 74,12 % | no disponible en esta ficha | Hugging Face |
| Meta LLaMA-3-8B | 8B | no disponible | 54,20 % | 72,00 % | licencia comunitaria Llama 3 | Hugging Face |

AxonMed-7B-Flash declara la mayor precisión en MedQA entre los modelos abiertos de 7-8B comparados, con una ventaja de entre 1 y 8 puntos porcentuales, y un rendimiento en PubMedQA en línea con los demás modelos biomédicos abiertos (74,40 %). La licencia Apache 2.0 es más permisiva que la licencia comunitaria de LLaMA 3 para uso comercial.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`) en el model-index; no han sido reproducidos de forma independiente.
- Riesgo de alucinación relevante en dominio clínico: el modelo puede generar diagnósticos, dosis o códigos ICD plausibles pero incorrectos; requiere validación humana en cualquier uso real.
- La model card advierte explícitamente que el modelo no sustituye el juicio clínico profesional ni el diagnóstico primario.
- No se documentan sesgos conocidos ni la composición demográfica de los datos de entrenamiento; los datasets citados (MedQA, PubMedQA, medical-o1-reasoning-SFT) están sesgados hacia literatura y exámenes en inglés.
- Longitud de contexto no documentada, lo que limita la planificación de despliegues con historiales clínicos extensos.
- El soporte multilingüe (es, zh, ru, fr, de, hi) está declarado pero no se aportan evaluaciones por idioma; el rendimiento fuera del inglés no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el uso clínico real puede estar sujeto a regulación sanitaria local (marcado CE, FDA, etc.) que el modelo no cubre.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa inexistente.
- Fecha de creación del repositorio (2026-11-18) y DOI de Zenodo asociado; conviene verificar la identidad del autor y la trazabilidad del linaje AxonMed-7B-Thinking antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saathimed/AxonMed-7B-Flash
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- DOI Zenodo: https://doi.org/10.5281/zenodo.24143274
- ORCID del autor (Amrendra Kumar): https://orcid.org/0009-0006-7093-6762
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
