# mradermacher/AxonMed-7B-Thinking-i1-GGUF

## Resumen

AxonMed-7B-Thinking es un modelo de lenguaje especializado en razonamiento clínico y sanitario, desarrollado originalmente por Saathimed y distribuido en formato GGUF por mradermacher. Está diseñado para resolver tareas de razonamiento médico multi-paso, con un modo de "thinking" (cadena de pensamiento) que expone el razonamiento intermedio antes de la respuesta final. El modelo parte de una base de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución adicionales más allá de las habituales.

La relevancia de esta ficha radica en que la versión publicada por mradermacher es una cuantización GGUF con calibración imatrix del modelo original, lo que permite ejecutarlo en hardware de consumo (desde GPUs de 8 GB hasta estaciones de trabajo) mediante llama.cpp, Ollama o LM Studio. La familia de cuantizaciones cubre desde IQ1_S (2,0 GB) hasta Q6_K (6,4 GB), ofreciendo un abanico amplio de compromisos entre calidad y requisitos de memoria.

El modelo está orientado a dominios médicos (USMLE, AIIMS, NEET-PG, PubMedQA) y declara soporte para siete idiomas: inglés, hindi, español, chino, alemán, francés y ruso. No obstante, la información pública disponible sobre arquitectura interna, longitud de contexto y resultados de benchmarks es limitada, por lo que varios campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmación oficial de detalles internos) |
| Parámetros totales | 7.615.616.512 (≈7,6 B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (calibradas con imatrix) |
| Idiomas soportados | en, hi, es, zh, de, fr, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base original está en formato transformers/safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo base Saathimed/AxonMed-7B-Thinking más allá de su naturaleza transformer y su tamaño de 7,6 mil millones de parámetros. El modelo está etiquetado como "thinking" y "cot" (chain of thought), lo que indica que ha sido ajustado para generar razonamiento explícito antes de la respuesta final, un patrón habitual en modelos médicos que buscan mejorar la precisión en preguntas de opción múltiple y diagnóstico diferencial.

El entrenamiento declara el uso de varios conjuntos de datos médicos: medmcqa, GBaker/MedQA-USMLE-4-options, pubmed_qa, FreedomIntelligence/medical-o1-reasoning-SFT y medalpaca/medical_meadow_usmle_self_assessment. Estos datasets cubren preguntas de examen médico (USMLE, exámenes de India como NEET-PG y AIIMS), literatura biomédica (PubMedQA) y datos de razonamiento médico sintético. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La versión aquí descrita es una cuantización GGUF con calibración imatrix (etiqueta i1) generada por mradermacher, no el modelo original.

## Capacidades

- Generación de texto y razonamiento clínico multi-paso con modo "thinking" (cadena de pensamiento explícita).
- Resolución de preguntas de opción múltiple de exámenes médicos (USMLE, AIIMS, NEET-PG).
- Razonamiento sobre literatura biomédica y preguntas de PubMedQA.
- Capacidades multilingües declaradas en siete idiomas: inglés, hindi, español, chino, alemán, francés y ruso.
- Conversación multi-turno (etiqueta "conversational").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente, aunque el modo thinking sugiere razonamiento encadenado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Formación y preparación de exámenes médicos: el modelo puede resolver preguntas de estilo USMLE, AIIMS o NEET-PG mostrando el razonamiento intermedio, lo que lo hace útil como tutor que explica el porqué de cada respuesta en lugar de solo dar la opción correcta.
- Triaje clínico asistido por texto: dado un conjunto de síntomas descritos en lenguaje natural, el modelo puede generar un razonamiento diferencial estructurado; adecuado por su entrenamiento en razonamiento clínico, aunque no sustituye el juicio médico.
- Resumen y consulta de literatura biomédica: su entrenamiento con PubMedQA permite responder preguntas sobre abstracts y artículos, útil en herramientas de revisión bibliográfica para investigadores.
- Asistente de documentación clínica: generación de notas, resúmenes de historiales o explicaciones de terminología médica para personal administrativo sanitario, aprovechando el modo conversacional.
- Soporte multilingüe en entornos sanitarios: con siete idiomas declarados, puede emplearse en atención a pacientes o formación en regiones con diversidad lingüística (hindi, español, chino, etc.), siempre con supervisión humana.
- Despliegue en local para investigación sensible: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos clínicos a servicios externos, lo que facilita el cumplimiento de requisitos de privacidad.
- Prototipado de aplicaciones médicas en hardware de consumo: las cuantizaciones Q4_K_M (4,8 GB) o Q5_K_M (5,5 GB) permiten probar pipelines en una RTX 4090 o incluso en una GPU de 8 GB con cuantizaciones menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): IQ1_S ≈ 2,0 GB; IQ2_M ≈ 2,9 GB; IQ3_M ≈ 3,7 GB; Q4_K_M ≈ 4,8 GB; Q5_K_M ≈ 5,5 GB; Q6_K ≈ 6,4 GB. Añadir entre 1 y 2 GB adicionales para el contexto KV cache según la longitud de contexto configurada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100. Para cuantizaciones Q4_K_M o superiores se recomienda al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí. Las cuantizaciones IQ3_M y Q4_K_S caben en GPUs de 6-8 GB; Q5_K_M y Q6_K requieren 8-12 GB. Las cuantizaciones IQ1/IQ2 permiten ejecución en GPUs de 4 GB o incluso CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo original en safetensors, vLLM o TGI (no confirmado para esta variante cuantizada).
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del hardware y de la cuantización; en una RTX 4090 con Q4_K_M se puede esperar un throughput de decodificación en el rango de decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-7B-Thinking (i1-GGUF) | ≈7,6 B | no disponible | Apache 2.0 | GGUF (i1) | Especializado en razonamiento médico, multilingüe (7 idiomas) |
| Meditron-7B | 7 B | no disponible en esta ficha | Llama 2 (uso restringido) | safetensors, GGUF | Entrenado sobre corpus médico; licencia más restrictiva |
| BioMistral-7B | 7 B | 2.048-4.096 tokens (según variante) | Apache 2.0 | safetensors, GGUF | Basado en Mistral; orientado a texto biomédico |
| OpenBioLLM-8B | 8 B | no disponible en esta ficha | Llama 3 (uso restringido) | safetensors, GGUF | Entrenado con datos médicos; licencia con condiciones |

La comparativa se basa en características generales de modelos de tamaño similar orientados a dominio médico; no se dispone de resultados de benchmarks comparativos directos para AxonMed-7B-Thinking en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye el juicio de un profesional sanitario; cualquier uso clínico requiere supervisión humana y validación regulatoria.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información médica incorrecta o inventada, especialmente en cuantizaciones muy agresivas (IQ1, IQ2, Q2_K).
- Las cuantizaciones de baja precisión (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Longitud de contexto no documentada: limita la planificación de aplicaciones que requieran ventanas largas.
- Idiomas: aunque se declaran siete, no hay evaluación publicada de calidad por idioma; el rendimiento en español, hindi o chino podría ser inferior al del inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base original (Saathimed/AxonMed-7B-Thinking) y los datasets subyacentes pueden tener condiciones adicionales que conviene revisar.
- Sesgos: no documentados en la información disponible; los datasets médicos pueden contener sesgos demográficos y geográficos (predominio de EE. UU. e India en los exámenes).
- No hay confirmación de soporte de tool calling ni de integración con frameworks de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face (esta cuantización): https://huggingface.co/mradermacher/AxonMed-7B-Thinking-i1-GGUF
- Modelo base original: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/AxonMed-7B-Thinking-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#AxonMed-7B-Thinking-i1-GGUF
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
