# Drfrodik/gemma4-12b-id-guidelines-lora

## Resumen

`gemma4-12b-id-guidelines-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Drfrodik sobre el modelo base `google/gemma-4-12B-it`. El adaptador se ha entrenado con 4.732 pares de pregunta-respuesta clínicas curadas, alineadas con guías internacionales de referencia en enfermedades infecciosas: la campaña "Surviving Sepsis Campaign" (SSC) 2026, la IDSA (Infectious Diseases Society of America) y la ESCMID (European Society of Clinical Microbiology and Infectious Diseases). El objetivo declarado es especializar el modelo en diagnóstico previo al tratamiento, ajuste renal de antimicrobianos y optimización del uso de antibióticos (antimicrobial stewardship).

El repositorio ocupa aproximadamente 0,3 GB y contiene únicamente los pesos del adaptador (formato safetensors), no el modelo completo. Para utilizarlo es necesario descargar primero el modelo base Gemma 4 de 12B parámetros. La model card declara un entrenamiento QLoRA en 4 bits NF4 con rango 16, alpha 32 y aplicación a todas las capas de proyección lineal (`q, k, v, o, gate, up, down`), durante 1 época (592 pasos) y con una pérdida de validación final de 0,9417.

Es relevante ahora porque ejemplifica una tendencia creciente: adaptadores de bajo coste orientados a dominios regulados (medicina, farmacología) sobre modelos abiertos de tamaño medio. Sin embargo, la información disponible es escasa y mayoritariamente autoinformada por el autor, sin benchmarks publicados ni validación clínica independiente, lo que exige cautela extrema antes de cualquier uso en producción sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base `google/gemma-4-12B-it`) |
| Parametros totales | No disponible (el repositorio contiene solo el adaptador; el modelo base tiene 12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Gemma 4 12B) |
| Tipos de cuantizacion | Entrenado en 4-bit NF4 (QLoRA); el adaptador puede cargarse sobre el base en fp16 o 4-bit |
| Idiomas soportados | Azerbaiyano (az) e ingles (en) |
| Licencia | Gemma (licencia del modelo base, con sus restricciones de uso) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decoder-only de la familia Gemma 4, concretamente la variante instruct de 12B parámetros. El ajuste fino se realizó con QLoRA: cuantización del base en 4 bits NF4, rango LoRA 16, alpha 32 y aplicación a todas las capas lineales de atención y MLP (`q, k, v, o, gate, up, down`). El entrenamiento consistió en una única época de 592 pasos, con una pérdida de validación que descendió de 0,9950 a 0,9417 y una precisión de token estimada en torno al 78-81,5 %.

El corpus de entrenamiento son 4.732 pares de pregunta-respuesta clínicas derivados de las guías SSC 2026, IDSA y ESCMID. No se documenta la composición exacta del dataset, ni el proceso de filtrado, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. La model card menciona una "alineación diagnóstica" del 85,07 % sobre casos de benchmark no vistos, alcanzando el 100 % en viñetas quirúrgicas y de endocarditis, pero no se aporta la metodología de evaluación ni el conjunto de test, por lo que estas cifras deben tratarse como autoinformadas y no verificadas.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base instruct.
- Razonamiento clínico sobre diagnóstico previo al tratamiento: la model card indica que el modelo enfatiza la obligatoriedad de hemocultivos (dos pares) antes de iniciar antimicrobianos.
- Cálculo de ajuste renal mediante la fórmula de Cockcroft-Gault y preservación de dosis de carga en las primeras 24 horas.
- Gestión del uso de antimicrobianos (antimicrobial stewardship): conversión IV a PO, desescalada microbiológica a las 48-72 horas y cobertura dirigida frente a MRSA, *Pseudomonas aeruginosa*, anaerobios y patógenos productores de ESBL.
- Soporte multilingüe limitado a azerbaiyano e inglés según los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, uso como agente, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Apoyo a la decisión en sepsis: el adaptador puede generar respuestas estructuradas sobre los pasos de la primera hora (hemocultivos, lactato, antibiótico empírico) basándose en las guías SSC 2026, útil como borrador para revisión por un clínico.
- Ajuste de dosis en insuficiencia renal: dado un valor de creatinina y datos del paciente, el modelo aplica Cockcroft-Gault y propone ajustes de antimicrobianos, escenario típico en servicios de farmacia hospitalaria.
- Programas de optimización de antibióticos: generación de recomendaciones de desescalada a las 48-72 horas a partir de resultados microbiológicos, para revisión por el equipo de enfermedades infecciosas.
- Formación médica en inglés y azerbaiyano: simulación de casos clínicos y preguntas de autoevaluación basadas en guías IDSA y ESCMID.
- Conversión IV a PO: borradores de criterios de elegibilidad y pautas de transición oral, para validación por farmacéuticos.
- Documentación clínica asistida: redacción de notas de razonamiento antimicrobiano estructuradas a partir de viñetas de caso, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MedQA) en la informacion disponible. La model card solo reporta métricas internas del autor:

| Metrica | Valor | Fuente |
|---|---|---|
| Perdida de validacion final | 0,9417 | Model card (autoinformado) |
| Precision de token (entrenamiento) | ~78,0-81,5 % | Model card (autoinformado) |
| Alineacion diagnostica en casos no vistos | 85,07 % | Model card (autoinformado) |
| Rendimiento en vinetas quirurgicas/endocarditis | Hasta 100 % | Model card (autoinformado) |

Estas cifras no están respaldadas por un conjunto de evaluación público ni por revisión independiente.

## Requisitos de hardware

- El adaptador en sí ocupa ~0,3 GB, pero requiere cargar el modelo base Gemma 4 12B: en fp16 se estiman unos 24 GB de VRAM; en 4-bit NF4 (configuración del ejemplo de la model card) unos 8-10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantización; RTX 4090 (24 GB) para fp16 ajustado o 8-bit; RTX 3090/4080 (16-24 GB) para 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit cabe en tarjetas de 12-16 GB (RTX 4070 Ti, 4080, 3090); en fp16 requiere 24 GB o más.
- Opciones de despliegue: transformers + PEFT (según el ejemplo de la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Drfrodik/gemma4-12b-id-guidelines-lora` | 12B (base) + adaptador LoRA | No disponible | Enfermedades infecciosas / sepsis | Gemma | Hugging Face (adaptador) |
| `google/gemma-4-12B-it` | 12B | No disponible | Generalista instruct | Gemma | Hugging Face (oficial) |
| `google/medgemma` (familia MedGemma) | Variantes de 4B y 27B | No disponible | Médico generalista | Gemma / Health AI | Hugging Face (oficial) |
| `BioMistral-7B` | 7B | 4.096 tokens | Biomédico | Apache 2.0 (base Mistral) | Hugging Face |

La comparación es aproximada: no hay datos de benchmarks comunes para contrastar el rendimiento real del adaptador frente a MedGemma o BioMistral. La principal diferencia cualitativa es que este adaptador se centra específicamente en guías de sepsis e infectología, mientras MedGemma y BioMistral cubren dominios médicos más amplios con validación oficial.

## Limitaciones y advertencias

- Modelo no validado clínicamente: las métricas son autoinformadas por el autor y no existe evaluación independiente ni publicación revisada por pares.
- Riesgo elevado de alucinación en un dominio crítico: cualquier recomendación de dosis o antibiótico debe ser verificada por un profesional sanitario antes de aplicarse.
- Sesgo de dominio: entrenado exclusivamente sobre guías SSC, IDSA y ESCMID, lo que puede limitar la cobertura de otras guías nacionales o contextos con recursos distintos.
- Idiomas limitados a azerbaiyano e inglés según los metadatos; no se declara soporte para castellano, lo que reduce su utilidad directa en entornos hispanohablantes.
- Licencia Gemma: sujeta a los términos de uso de Google, con restricciones de uso comercial y obligaciones de atribución; conviene revisar el texto completo antes de cualquier despliegue.
- Adaptador de bajo rango (16) y una sola época: la capacidad de modificar profundamente el comportamiento del base es limitada; el modelo puede recaer en respuestas genéricas del base en casos fuera de distribución.
- Sin información sobre tool calling, agentes ni integración con pipelines clínicos, lo que limita su uso en sistemas automatizados.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Drfrodik/gemma4-12b-id-guidelines-lora
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Surviving Sepsis Campaign: https://www.sccm.org/survivingsepsis
- IDSA: https://www.idsociety.org/
- ESCMID: https://www.escmid.org/
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
- Licencia Gemma: https://ai.google.dev/gemma/terms
