# Saathimed/Saathi-Apex-7B-Clinical

## Resumen

Saathi-Apex-7B-Clinical es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por SaathiMed Private Limited, una empresa india con sede en Motihari (Bihar). El modelo se presenta como una "foundation model" de inteligencia clínica orientada a flujos de trabajo sanitarios en entornos rurales, semiurbanos y de atención terciaria de la India, con soporte para inglés e hindi. Parte de la base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, un checkpoint ya cuantizado a 4 bits que se usa como punto de partida para el entrenamiento.

El modelo se posiciona en tareas de triaje clínico, exclusión de diagnósticos letales (por ejemplo, disección aórtica frente a STEMI, neumotórax a tensión o síndrome de cauda equina), farmacovigilancia con auditoría de interacciones fármaco-fármaco y criterios de Beers en polifarmacia geriátrica, y enrutamiento multi-órgano hacia algoritmos diagnósticos especializados (ECG PTB-XL, rayos X CheXzero, retina RETFound, AKI de DeepMind). El autor declara entrenamiento sobre más de 10.000 viñetas de MedMCQA de AIIMS, diálogos de atención primaria de HealthCareMagic y protocolos de emergencia nacionales del ICMR.

La relevancia del modelo radica en su enfoque hacia el contexto sanitario indio y en la licencia Apache 2.0, que permite uso comercial. No obstante, el repositorio tiene un tamaño de 0,3 GB, lo que es incompatible con los pesos completos de un modelo de 7B en precisión estándar, y no se han publicado resultados numéricos de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7B (heredados del modelo base Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | El modelo base de partida es bnb-4bit; no se detallan otras cuantizaciones publicadas |
| Idiomas soportados | Ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Modelo base | unsloth/Qwen2.5-7B-Instruct-bnb-4bit |
| Fecha de creacion | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El checkpoint de partida es la variante cuantizada a 4 bits de Unsloth, lo que sugiere un flujo de entrenamiento con técnicas de eficiencia de memoria (posiblemente QLoRA o LoRA sobre pesos cuantizados), aunque la model card no especifica el método exacto, el número de tokens de entrenamiento ni la composición detallada del dataset más allá de las fuentes citadas: viñetas MedMCQA de AIIMS, diálogos de HealthCareMagic y protocolos de emergencia del ICMR.

El autor declara innovaciones orientadas a seguridad clínica: exclusión de diagnósticos letales ("lethal differential exclusion"), auditoría de interacciones fármaco-fármaco con criterios de Beers y enrutamiento multi-órgano hacia algoritmos downstream especializados. No se detalla si hubo RLHF, DPO u otras fases de alineación posteriores al ajuste supervisado, ni se documentan hiperparámetros, epochs o estrategia de mezcla de datos.

## Capacidades

- Generación de texto conversacional en inglés e hindi orientada a dominios clínicos.
- Razonamiento clínico y triaje: el autor declara capacidad de priorizar casos y excluir diagnósticos letales (disección aórtica, neumotórax a tensión, cauda equina).
- Farmacovigilancia: auditoría de interacciones fármaco-fármaco y verificación de criterios de Beers en pacientes geriátricos con polifarmacia.
- Enrutamiento multi-órgano: el modelo puede derivar casos hacia algoritmos especializados (ECG PTB-XL, rayos X CheXzero, retina RETFound, AKI de DeepMind), según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el enrutamiento multi-órgano sugiere algún grado de orquestación, pero no se detalla.
- Capacidades multilingües: limitadas a inglés e hindi según los metadatos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Triaje en atención primaria rural: el modelo puede clasificar la urgencia de un paciente a partir de una descripción sintomática en inglés o hindi, apoyándose en los protocolos ICMR citados por el autor para decidir derivación a atención secundaria o terciaria.
- Exclusión de diagnósticos letales en urgencias: uso como segunda opinión o checklist para descartar imitadores críticos (disección aórtica frente a STEMI, neumotórax a tensión) antes de confirmar un diagnóstico primario.
- Auditoría de polifarmacia geriátrica: revisión de listas de medicamentos para detectar interacciones fármaco-fármaco y fármacos potencialmente inapropiados según criterios de Beers, útil en residencias y consultas de medicina interna.
- Enrutamiento a módulos diagnósticos especializados: el modelo puede actuar como capa de decisión que deriva un caso a un algoritmo de ECG, radiografía de tórax, retina o función renal, integrándose en pipelines clínicos multimodales.
- Formación médica y simulacros de examen: generación de preguntas y explicaciones basadas en viñetas estilo MedMCQA/NEET-PG para estudiantes de medicina en la India.
- Asistencia documental en hindi: redacción y resumen de notas clínicas en hindi para profesionales que trabajan en entornos donde este idioma es predominante, aprovechando el soporte bilingüe declarado.
- Chatbot de orientación sanitaria: atención conversacional multi-turno para pacientes en zonas con acceso limitado a personal médico, siempre con supervisión profesional y advertencias de no sustituir el juicio clínico.

## Benchmarks y rendimiento

El autor indica que el modelo se evaluó en el Open Medical-LLM Leaderboard en MedQA (USMLE de 4 opciones), MedMCQA (AIIMS/NEET-PG), PubMedQA y MMLU de temas clínicos. Sin embargo, no se han publicado los resultados numéricos en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia del modelo base Qwen2.5-7B, en FP16 requiere aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estos valores son estimaciones del modelo base, no confirmadas para este ajuste.
- GPU recomendadas: para FP16, A100 40 GB, H100 o L40S; para cuantizaciones de 8 y 4 bits, RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB).
- Compatibilidad con GPU de consumo: sí, en cuantizaciones de 4 u 8 bits cabe en GPUs de consumo con 8 GB o más de VRAM, siempre que se generen los pesos cuantizados correspondientes.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con arquitecturas Qwen2.5, aunque el repositorio solo publica safetensors y no se confirman ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Saathi-Apex-7B-Clinical | 7B | no disponible | Apache 2.0 | Clínico, India, en/hi | Hugging Face (repo de 0,3 GB) |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens (modelo base) | Apache 2.0 | Generalista, multilingüe | Hugging Face, ampliamente desplegado |
| Meditron-7B | 7B | 4.096 tokens (aprox.) | Llama 2 (uso restringido) | Clínico generalista | Hugging Face |
| BioMistral-7B | 7B | 4.096 tokens (aprox.) | Apache 2.0 | Biomédico | Hugging Face |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de resultados de benchmarks de Saathi-Apex para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- No se han publicado métricas de benchmarks ni resultados del Open Medical-LLM Leaderboard, pese a que el autor afirma haber evaluado el modelo en él.
- El repositorio ocupa 0,3 GB, un tamaño incompatible con los pesos completos de un modelo de 7B en safetensors; es posible que solo contenga adaptadores LoRA o pesos parciales, lo que impide verificar el contenido real.
- El modelo parte de un checkpoint cuantizado a 4 bits (bnb-4bit), lo que puede introducir degradaciones adicionales respecto a un ajuste sobre pesos en FP16.
- Riesgo de alucinación clínica: cualquier recomendación diagnóstica o terapéutica generada debe ser validada por un profesional sanitario; el modelo no sustituye el juicio clínico.
- Sesgos potenciales derivados de los datos de entrenamiento (viñetas de exámenes indios, diálogos de HealthCareMagic), que pueden no generalizar a otras poblaciones o sistemas sanitarios.
- Soporte lingüístico limitado a inglés e hindi; no se declaran otros idiomas.
- No se documentan salvaguardas, filtros de seguridad ni procedimientos de evaluación de riesgos más allá de las afirmaciones de la model card.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en entornos clínicos reales exige cumplimiento normativo local (por ejemplo, regulación de dispositivos médicos) que no se aborda en la documentación.
- Fecha de creación futura (2026-11-10) en los metadatos, lo que puede indicar un error de registro o una fecha planificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saathimed/Saathi-Apex-7B-Clinical
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Open Medical-LLM Leaderboard: https://huggingface.co/spaces/openlifescienceai/open_medical_llm_leaderboard
- MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- HealthCareMagic (dataset de diálogos): https://huggingface.co/datasets/lavita/ChatDoctor-HealthCareMagic-100k
- ICMR (Indian Council of Medical Research): https://www.icmr.gov.in
- PTB-XL (ECG): https://physionet.org/content/ptb-xl/
- CheXzero: https://github.com/rajpurkarlab/CheXzero
- RETFound: https://github.com/rmaphoh/RETFound_MAE
