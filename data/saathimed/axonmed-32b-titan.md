# Saathimed/AxonMed-32B-Titan

## Resumen

AxonMed-32B-Titan es un ajuste fino (fine-tuning) del modelo Qwen2.5-32B-Instruct desarrollado por SaathiMed Private Limited, una empresa india con sede en Motihari (Bihar). El modelo está orientado a dominio clínico y biomédico: razonamiento médico, codificación diagnóstica (CIE-10 y CIE-11), farmacología (RxNorm/FDA) y resolución de preguntas tipo USMLE. Su propuesta de valor es ofrecer un modelo de 32.500 millones de parámetros con licencia Apache 2.0 que compita en benchmarks médicos con modelos significativamente más grandes.

La arquitectura subyacente es la de Qwen2.5-32B-Instruct, un transformer decoder-only denso de 64 capas. El autor declara una integración de la matriz de clasificación de la OMS (CIE-10 y CIE-11), un "vault" de contraindicaciones farmacológicas basado en RxNorm y la FDA, y más de 190.000 escenarios de examen clínico (USMLE Step 1/2/3, AIIMS y NEET-PG) como parte del entrenamiento.

El modelo es relevante por su combinación de tamaño moderado (32B), licencia permisiva y resultados declarados en MedQA (75,81 %) y PubMedQA (79,00 %), que lo sitúan en el rango de LLaMA-3-70B en tareas médicas con menos de la mitad de parámetros. No obstante, los resultados son autodeclarados y no verificados, y el repositorio presenta un número muy bajo de descargas (28) y ningún "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), 64 capas |
| Parametros totales | 32.763.876.352 (~32,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | No disponible (solo se menciona bfloat16 en el ejemplo de inferencia) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-32B-Instruct: un transformer decoder-only denso con 64 capas, atención por causalidad estándar y los componentes habituales de la familia Qwen2.5 (RMSNorm, SwiGLU, RoPE). No se trata de un modelo MoE ni de una arquitectura híbrida; el autor no describe modificaciones estructurales sobre el modelo base, sino un ajuste fino orientado a dominio.

En cuanto al entrenamiento, la model card menciona la incorporación de la matriz completa de clasificación CIE-10 y CIE-11 de la OMS, un conjunto de contraindicaciones farmacológicas basado en RxNorm y la FDA, y más de 190.000 escenarios de examen clínico (USMLE Step 1/2/3, AIIMS, NEET-PG). No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan hiperparámetros, duración del entrenamiento o metodología de evaluación. La única innovación declarada es el "Agentic Uncertainty Routing", un mecanismo externo (SaathiMed Popperian Falsification Engine) que detecta distractores cuando el margen de probabilidad es estrecho (Δ < 0,35); no es una capacidad intrínseca del modelo, sino un sistema de post-procesado que el autor afirma elevar la precisión clínica por encima del 91 %.

## Capacidades

- Generación de texto y razonamiento clínico en inglés, orientado a casos médicos y preguntas de opción múltiple.
- Resolución de preguntas tipo USMLE (MedQA 4 opciones) con razonamiento diagnóstico y formato de respuesta final.
- Codificación diagnóstica con CIE-10 y CIE-11 según declara el autor.
- Consulta de farmacología y contraindicaciones basada en RxNorm y la matriz FDA (por ejemplo, prohibición de vasodilatadores en infarto de ventrículo derecho con hipotensión).
- Razonamiento multi-paso en contextos clínicos (el prompt de ejemplo incluye una etiqueta `<think>` para forzar cadena de razonamiento).
- Soporte de conversación multi-turno heredado de Qwen2.5-32B-Instruct.
- Capacidad multilingüe limitada: el autor solo declara inglés, aunque el modelo base soporta más idiomas.
- No se declara soporte explícito de tool calling, function calling, visión, audio ni agentes autónomos en la información proporcionada.

## Casos de uso

- **Apoyo a la decisión clínica en urgencias**: el modelo puede recibir un caso con signos vitales, ECG y analítica, y generar un razonamiento diagnóstico diferencial junto con la opción terapéutica más adecuada, como en el ejemplo de infarto de ventrículo derecho con hipotensión.
- **Generación de preguntas de examen médico**: a partir de la matriz CIE-10/CIE-11 y los escenarios USMLE declarados, se pueden generar ítems de opción múltiple con distractores plausibles para plataformas de formación médica.
- **Codificación clínica automatizada**: asignación de códigos CIE-10 y CIE-11 a partir de descripciones de historias clínicas, útil en facturación hospitalaria y registros epidemiológicos.
- **Verificación de contraindicaciones farmacológicas**: dado un paciente con comorbilidades y una lista de medicamentos, el modelo puede señalar interacciones o contraindicaciones según la matriz RxNorm/FDA declarada.
- **Tutoría para preparación de USMLE Step 1/2/3**: conversación multi-turno con explicaciones razonadas de fisiopatología y farmacología, aprovechando el ajuste sobre escenarios de examen.
- **Triaje de literatura biomédica**: resumen y respuesta a preguntas sobre abstracts de PubMed (el modelo declara 79 % en PubMedQA), útil para revisiones rápidas en investigación clínica.
- **Pre-análisis en pipelines de agentes clínicos**: combinado con el "Popperian Falsification Engine" del autor, puede actuar como primer filtro de respuestas en sistemas de segunda opinión, dejando la validación final a un revisor humano.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo | Parametros | MedQA (USMLE) | PubMedQA |
|---|---|---|---|
| Meta LLaMA-3-8B | 8B | 54,10 % | 72,00 % |
| AxonMed-7B (SaathiMed) | 7B | 64,10 % | 75,80 % |
| Qwen2.5-32B (base) | 32,5B | 58,00 % – 64,00 % | 73,50 % |
| Meta LLaMA-3-70B | 70B | 72,00 % – 76,50 % | 77,20 % |
| Google Med-Gemini | 540B | 91,10 % | 79,20 % |
| **AxonMed-32B Titan** | **32,5B** | **75,81 %** | **79,00 %** |

Los valores de los modelos comparativos proceden igualmente de la tabla publicada por el autor y no se han contrastado con las fuentes originales. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB para inferencia cómoda.
- **GPU recomendadas**: NVIDIA A100 80 GB, H100 80 GB, o múltiples RTX 4090 (24 GB) en configuración tensor-parallel.
- **Consumer GPU**: no cabe en una sola GPU de consumo en bfloat16. Con cuantización a 8 bits (no declarada oficialmente) podría aproximarse a 35 GB, aún por encima de 24 GB; con 4 bits podría caber en una RTX 4090, pero el autor no publica pesos cuantizados.
- **Opciones de despliegue**: transformers (soporte declarado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se declaran pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa sin conversión manual.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA | PubMedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxonMed-32B Titan | 32,5B | No disponible | 75,81 % | 79,00 % | Apache 2.0 | Hugging Face |
| Qwen2.5-32B-Instruct (base) | 32,5B | 131.072 tokens (segun Qwen) | 58-64 % (declarado por el autor) | 73,50 % | Apache 2.0 | Hugging Face |
| Meta LLaMA-3-70B | 70B | 8.192 tokens (segun Meta) | 72-76,5 % (declarado por el autor) | 77,20 % | Llama 3 Community License | Hugging Face |
| Google Med-Gemini | 540B | No disponible | 91,10 % (declarado por el autor) | 79,20 % | Propietaria | No publico |

La comparativa se basa en la tabla publicada por el propio autor; los valores de los modelos competidores no se han verificado de forma independiente. El contexto de AxonMed-32B-Titan no se declara en la model card, aunque al derivar de Qwen2.5-32B-Instruct es razonable esperar el mismo soporte, sin que ello esté confirmado por el autor.

## Limitaciones y advertencias

- **Resultados no verificados**: los benchmarks de MedQA y PubMedQA están marcados con `verified: false`; proceden del autor y no han sido reproducidos de forma independiente.
- **Riesgo de alucinación clínica**: un modelo de lenguaje, por muy ajustado que esté a dominio médico, puede generar recomendaciones plausibles pero incorrectas; no debe usarse como sustituto del juicio clínico.
- **Sesgo de dominio y geográfico**: el entrenamiento se apoya en exámenes USMLE, AIIMS y NEET-PG, lo que puede introducir sesgos hacia prácticas médicas estadounidenses e indias.
- **Idioma**: solo se declara inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- **Contexto no declarado**: la model card no especifica la longitud de contexto efectiva tras el ajuste fino, lo que dificulta planificar casos con historiales largos.
- **Sin cuantizaciones oficiales**: no se publican pesos GGUF ni AWQ/GPTQ, lo que limita el despliegue en hardware de consumo.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario asume toda la responsabilidad regulatoria (por ejemplo, MDR en la UE o FDA en EE. UU.) si lo integra en un producto sanitario.
- **Madurez del proyecto**: 28 descargas y 0 likes en el momento de la consulta; el modelo se creó y actualizó en noviembre de 2026, sin historial de mantenimiento.
- **"Agentic Uncertainty Routing"**: el 91 % de precisión clínica mencionado depende de un motor externo del autor, no del modelo por sí solo; no es replicable sin acceso a dicho sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saathimed/AxonMed-32B-Titan
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Sitio del desarrollador: https://saathimed.com
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Contacto del autor: contact@saathimed.com
