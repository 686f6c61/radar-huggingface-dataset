# mradermacher/AxonMed-7B-GGUF

## Resumen

AxonMed-7B es un modelo de lenguaje especializado en dominio médico, desarrollado por Saathimed y cuantizado a formato GGUF por mradermacher. Está construido sobre una base de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y está orientado a razonamiento clínico, preparación de exámenes médicos (USMLE, NEET-PG, AIIMS) y consulta de literatura biomédica. Su relevancia radica en ser una propuesta de "IA soberana" para el ecosistema sanitario indio, con soporte declarado de inglés e hindi.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos sanitarios. La versión aquí descrita es la cuantización estática en GGUF, pensada para inferencia local eficiente en CPU y GPU de consumo, con cuantizaciones que van desde Q2_K hasta f16.

La información pública disponible es limitada: no se detallan la arquitectura interna, el número de tokens de entrenamiento ni los resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, detalles no publicados) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | en, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base Saathimed/AxonMed-7B. Por el tamaño (7,6 B de parámetros) y la librería declarada (transformers), se trata con alta probabilidad de un transformer decoder-only, pero no se confirma en la documentación disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Los datasets declarados en la model card son medmcqa, GBaker/MedQA-USMLE-4-options, pubmed_qa, FreedomIntelligence/medical-o1-reasoning-SFT y medalpaca/medical_meadow_usmle_self_assessment. Esta combinación sugiere un ajuste fino orientado a preguntas de opción múltiple de exámenes médicos, razonamiento clínico con trazas de pensamiento (por el dataset medical-o1-reasoning-SFT) y comprensión de literatura biomédica vía PubMedQA. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés e hindi, con orientación a dominio médico.
- Razonamiento clínico y respuesta a preguntas de tipo examen (USMLE, NEET-PG, AIIMS).
- Comprensión y síntesis de literatura biomédica (entrenado con PubMedQA).
- Resolución de preguntas de opción múltiple médicas (MedMCQA, MedQA-USMLE).
- Razonamiento de estilo "o1" gracias al dataset medical-o1-reasoning-SFT (trazas de razonamiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Preparación de oposiciones y exámenes médicos: el modelo puede generar preguntas de práctica y explicar razonamientos clínicos apoyándose en los datasets USMLE y NEET-PG con los que fue ajustado.
- Asistencia en triaje documental: resumir y clasificar notas clínicas o abstracts de PubMed, aprovechando su entrenamiento en PubMedQA.
- Formación médica continua: generar explicaciones paso a paso de casos clínicos, útil para estudiantes que necesitan razonamiento detallado.
- Soporte a la decisión clínica no diagnóstica: como herramienta de consulta de referencia para profesionales, siempre con supervisión humana y sin sustituir el juicio clínico.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF, puede ejecutarse en infraestructura propia sin enviar datos de pacientes a la nube.
- Localización para el mercado indio: atención y contenido sanitario en inglés e hindi, alineado con el objetivo de "IA soberana" del autor.
- Integración en pipelines de documentación médica: generación de resúmenes estructurados de historiales o informes con formato controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según tamaño de cuantización):
  - Q2_K: en torno a 3 GB.
  - Q4_K_S: en torno a 4,6 GB (recomendada por el autor como "fast, recommended").
  - Q5_K_M: en torno a 5,5 GB.
  - Q8_0: en torno a 8 GB.
  - f16: 15,3 GB (calificada por el autor como "overkill").
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4/Q5; RTX 4090 o A100/H100 para f16 o Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_S o Q5_K_M en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para los pesos originales, transformers con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-7B (este) | 7,6 B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en dominio médico, en/hi |
| Meditron-7B | 7 B | no disponible | Llama 2 (uso restringido) | safetensors | Entrenado con corpus médico y guías clínicas |
| BioMistral-7B | 7 B | 8k (aprox., segun variante) | Apache 2.0 | safetensors, GGUF | Ajustado sobre Mistral con corpus biomédico |
| OpenBioLLM-8B | 8 B | no disponible | Llama 3 (uso comunitario) | safetensors, GGUF | Orientado a dominio biomédico y razonamiento clínico |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks de AxonMed-7B.

## Limitaciones y advertencias

- No es un dispositivo médico: no debe usarse para diagnóstico, prescripción ni decisiones clínicas sin supervisión de un profesional sanitario.
- Riesgo de alucinación elevado en un dominio donde los errores tienen consecuencias graves; requiere validación contra fuentes primarias.
- Sesgos potenciales derivados de los datasets de entrenamiento (predominantemente exámenes y literatura en inglés, con orientación al sistema sanitario indio).
- Cobertura lingüística limitada a inglés e hindi; no se declara soporte de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con documentos largos.
- Ausencia de benchmarks publicados impide evaluar su calidad frente a alternativas.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue en producción sanitaria exige cumplimiento normativo (RGPD, MDR, etc.) que el autor no aborda.
- El repo GGUF tiene 63,9 GB y cero descargas, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-7B-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#AxonMed-7B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
