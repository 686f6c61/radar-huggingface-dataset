# Rish132/bhashapolicy-qwen3.5-4b

## Resumen

BhashaPolicy Qwen3.5-4B es un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el autor Rish132 en el marco de la Adaptive Intelligence Challenge. Su propósito es ofrecer información regulatoria y cívica multilingüe centrada en el ordenamiento jurídico indio, con citas estatutarias verificables y una política explícita de rechazo determinista ante consultas fuera de alcance. El modelo se distribuye como adaptador (repo de 0,1 GB) sobre el checkpoint base, con licencia Apache 2.0.

El modelo cubre cinco idiomas (inglés, hindi, tamil, bengalí y maratí) y está especializado en cuatro cuerpos normativos: la DPDP Act 2023, la Consumer Protection Act 2019, el RBI Integrated Ombudsman Scheme 2021 y la RTI Act 2005. Su salida combina orientación en lenguaje natural con un objeto JSON validado que incluye estado, idioma, citas y próximos pasos, lo que facilita su integración en flujos automatizados de atención cívica.

Con aproximadamente 4.000 millones de parámetros, se posiciona en la franja de menos de 10B, lo que permite su despliegue en hardware de consumo con cuantización. Su relevancia radica en el enfoque en "grounded citations" y rechazo controlado, dos problemas habituales en aplicaciones legales de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); ajuste fino LoRA |
| Parametros totales | ~4B (heredados del modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | en, hi, ta, bn, mr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parámetros, sobre el que se aplica un ajuste fino mediante LoRA. No se especifica en la información disponible la longitud de contexto nativa ni la composición exacta del corpus base.

El pipeline de entrenamiento, denominado Adaption, combina varias fases: extracción de PDFs estatutarios primarios (con modos `per_page` y `per_document`) y síntesis de escenarios adversariales de rechazo mediante Adaptive Data (Forge + Invent); aplicación de recetas de deduplicación, trazas de razonamiento, mitigación de alucinaciones y reglas globales de citación y rechazo (Blueprint); localización a los cinco idiomas con mezcla de diversidad general; auditoría de integridad de citas y distribución de rechazos en Visualize; y cooptimización de la receta LoRA SFT con AutoScientist. Se reportan iteraciones v1_1024, v4 y v5, siendo v5 la versión final.

## Capacidades

- Generación de texto con orientación regulatoria y cívica en cinco idiomas.
- Citas estatutarias en línea con formato `[Act Short Name, Section X]`, verificadas contra textos públicos indios.
- Rechazo determinista: emite `"status": "refused"` ante consultas fuera de alcance en lugar de fabricar secciones legales.
- Salida estructurada: guía legible seguida de un objeto JSON validado con campos `status`, `language`, `citations` y `next_steps`.
- Soporte multilingüe con paridad declarada entre en, hi, ta, bn y mr.
- Capacidad de razonamiento orientada a mitigación de alucinaciones mediante trazas de razonamiento en el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el pipeline menciona trazas de razonamiento.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Orientación al ciudadano sobre derechos de protección al consumidor: el modelo puede responder consultas sobre la Consumer Protection Act 2019 citando secciones concretas y ofreciendo próximos pasos estructurados en JSON para su integración en portales de atención.
- Asistencia en solicitudes RTI: permite explicar plazos y procedimientos bajo la RTI Act 2005 (por ejemplo, el plazo del PIO) con citas verificables en inglés e idiomas regionales.
- Consultas sobre protección de datos personales: guía sobre obligaciones y derechos bajo la DPDP Act 2023, con rechazo controlado cuando la consulta excede el alcance estatutario cubierto.
- Información sobre el esquema del Defensor del Pueblo de RBI: resolución de dudas sobre el RBI Integrated Ombudsman Scheme 2021 en contextos de banca y pagos.
- Despliegue en ONGs y líneas de ayuda cívica: el tamaño de ~4B y la licencia Apache 2.0 permiten ejecución en infraestructura modesta con cuantización, ofreciendo respuestas multilingües a población que no domina el inglés.
- Integración en pipelines de compliance: la salida JSON validada (`status`, `citations`, `next_steps`) facilita el encadenamiento con sistemas de ticketing o de verificación documental.
- Localización de contenidos legales divulgativos: generación de explicaciones en tamil, bengalí o maratí a partir de textos estatutarios en inglés, manteniendo la referencia a la sección original.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de test congelado y libre de contaminación:

| Modelo | Grounded Citation F1 | Status/Refusal Acc | Refusal Recall | JSON Validity | Multilingual Parity |
|---|---:|---:|---:|---:|---:|
| base_qwen3.5_4b | 77,67% | 77,00% | 70,00% | 80,00% | 0,91 |
| bhashapolicy_v1_1024 | 72,33% | 85,00% | 83,33% | 89,00% | 0,72 |
| bhashapolicy_v4 | 70,67% | 87,00% | 73,33% | 92,00% | 0,81 |
| bhashapolicy_v5 | 73,43% | 92,00% | 80,00% | 94,00% | 0,87 |

El modelo final (v5) mejora al base en precisión de estado/rechazo (92% frente a 77%), recall de rechazo (80% frente a 70%) y validez JSON (94% frente a 80%), aunque obtiene un F1 de citación inferior al base (73,43% frente a 77,67%) y una paridad multilingüe ligeramente menor (0,87 frente a 0,91).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~4B se sitúa habitualmente entre 8 y 10 GB en FP16 y en torno a 3-5 GB en cuantizaciones de 4 bits, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsible por el tamaño de ~4B, pero no confirmada oficialmente.
- Opciones de despliegue: no disponibles; el autor proporciona un wrapper propio (`bhashapolicy.inference.BhashaPolicyAssistant`) que carga el modelo base y el adaptador. El adaptador LoRA es compatible con el ecosistema de Qwen3.5-4B (vLLM, llama.cpp, Ollama, TGI) en la medida en que dichos entornos soporten el modelo base y la carga del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BhashaPolicy Qwen3.5-4B | ~4B | no disponible | Legal/cívico multilingüe (India) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Propósito general | no disponible | Hugging Face |
| Alternativas legales especializadas de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (legal-cívico multilingüe indio) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no sustituye el asesoramiento de un abogado colegiado; el propio autor lo declara adecuado solo para fines educativos y de ayuda cívica.
- Cobertura estatutaria limitada a cuatro cuerpos normativos indios (DPDP Act 2023, Consumer Protection Act 2019, RBI Integrated Ombudsman Scheme 2021 y RTI Act 2005); cualquier consulta fuera de ese ámbito debe rechazarse.
- Riesgo de alucinación de secciones o citas legales, mitigado pero no eliminado (F1 de citación del 73,43%).
- Paridad multilingüe inferior a la del modelo base (0,87 frente a 0,91), lo que sugiere posibles disparidades de calidad entre idiomas.
- No se especifican sesgos conocidos ni la composición demográfica del corpus de entrenamiento.
- Longitud de contexto no documentada; consultas con historiales largos pueden degradar la calidad.
- El repositorio contiene únicamente el adaptador (0,1 GB); es necesario descargar el modelo base Qwen/Qwen3.5-4B, cuya licencia y condiciones deben respetarse además de la Apache 2.0 del adaptador.
- Sin descargas ni valoraciones en el momento de la consulta, lo que limita la validación comunitaria del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Rish132/bhashapolicy-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
