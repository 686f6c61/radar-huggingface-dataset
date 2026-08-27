# kayodekosi/clinical-decision-support

## Resumen

`kayodekosi/clinical-decision-support` es un adaptador LoRA (PEFT) construido sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por Kayode Okosi. Su propósito es asistir a profesionales sanitarios en la toma de decisiones clínicas: a partir de un caso de paciente (síntomas e historial), genera un triaje de urgencia, un diagnóstico diferencial ordenado por probabilidad, los siguientes pasos recomendados y notas explícitas de banderas rojas o escalado. El modelo incorpora un comportamiento de rechazo cuando la información es insuficiente o el caso es de alto riesgo, y siempre enmarca su salida como apoyo a la decisión, nunca como diagnóstico autónomo.

El adaptador se entrenó mediante QLoRA SFT (con Unsloth y respaldo a PEFT + TRL) y opcionalmente DPO sobre pares de preferencia clínica y seguridad. Está pensado para un entorno hospitalario controlado, con supervisión humana total. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés. Al ser un adaptador, no se publican pesos completos; se carga sobre el modelo base de 7B, lo que facilita su integración en pipelines de LLMOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (base) + adaptador LoRA (PEFT) |
| Parametros totales | 7.000 millones (base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (depende del despliegue del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (PEFT; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se monta sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal. El entrenamiento se realizó con QLoRA (cuantización de 4 bits del base) y SFT, usando Unsloth como librería principal y con respaldo a PEFT + TRL. Se aplicó además un paso opcional de DPO sobre pares de preferencia clínica y seguridad, lo que refuerza el comportamiento de rechazo y escalado. Los datos de entrenamiento provienen de corpus públicos de QA médica, pares síntoma→diagnóstico y estilos de triage, formateados como conversaciones. No se especifica el número de tokens ni la composición exacta del dataset.

La innovación principal no está en la arquitectura (que es la del base) sino en el ajuste fino orientado a un dominio crítico: el modelo aprende a estructurar la salida en secciones (urgencia, diferencial, pasos siguientes, banderas rojas) y a negarse a dar un diagnóstico definitivo cuando los datos son insuficientes. Esto lo diferencia de un LLM generalista y lo acerca a un asistente clínico con criterios de seguridad.

## Capacidades

- Generación de texto estructurado para casos clínicos: triaje de urgencia (Immediate / Urgent / Routine / Insufficient information), diagnóstico diferencial rankeado con probabilidad y características de soporte, próximos pasos recomendados y notas de escalado.
- Comportamiento de rechazo: si la información del paciente es incompleta o el caso es de alto riesgo, el modelo responde con "insufficient information" o sugiere escalado, en lugar de emitir un diagnóstico no fundamentado.
- Integración con guías clínicas: puede incorporar fragmentos de guías en el contexto y usarlos para recomendar investigaciones adicionales.
- Soporte de tool calling: no se menciona explícitamente en la ficha, pero al estar basado en Qwen2.5-7B-Instruct, hereda capacidades de function calling del base (no confirmado en la documentación del adaptador).
- Multilingüe: no, solo inglés.
- Capacidades especiales: no incluye visión ni audio; es exclusivamente texto.

## Casos de uso

- Triage de urgencias en urgencias hospitalarias: el modelo recibe una descripción de síntomas y devuelve una categoría de urgencia (inmediata, urgente, rutinaria) junto con una justificación, ayudando a priorizar la atención sin reemplazar el juicio clínico.
- Generación de diagnóstico diferencial en consulta de atención primaria: el médico introduce el historial y los síntomas, y el modelo propone una lista ordenada de posibles diagnósticos con los rasgos que los apoyan, agilizando la revisión sistemática.
- Apoyo a la decisión en servicios de telemedicina: integrado en un chatbot, el modelo puede guiar la recogida de información del paciente y sugerir cuándo derivar a urgencias, siempre con supervisión humana.
- Revisión de casos clínicos en formación médica: los residentes pueden usar el modelo para practicar la elaboración de diagnósticos diferenciales y comparar sus razonamientos con las sugerencias del sistema.
- Integración en sistemas de historia clínica electrónica (HCE): el adaptador puede conectarse a un pipeline de procesamiento de notas clínicas para generar alertas de escalado o recordatorios de guías, mejorando la adherencia a protocolos.
- Auditoría de seguridad clínica: al forzar el rechazo ante datos insuficientes, el modelo puede usarse como verificador de que un caso no se ha sobrediagnosticado, señalando lagunas de información antes de que un clínico tome una decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas clínicas específicas (como precisión en diagnóstico diferencial o exactitud en triaje) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre un modelo de 7B, los requisitos dependen del base. Con cuantización de 4 bits (QLoRA), se estiman entre 4 y 6 GB de VRAM; en 8 bits, entre 8 y 10 GB; en FP16, alrededor de 14 GB. Estas cifras son orientativas y no han sido confirmadas por el autor.
- GPU recomendadas: para uso en producción con baja latencia, una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A10G, L4) es suficiente para el modelo en FP16 o 8 bits. Para despliegues a gran escala, A100 o H100.
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB o superior puede ejecutar el modelo con cuantización de 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con librerías como PEFT + Transformers, o servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). El repositorio incluye un espacio Gradio listo para demo.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de soporte a decisiones clínicas (p. ej., Meditron, BioMistral, ClinicalBERT) en la información proporcionada. No hay benchmarks comunes ni métricas de rendimiento que permitan una comparación objetiva. Se recomienda evaluar el modelo en el entorno clínico específico antes de su adopción.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card lo declara explícitamente. No debe usarse para diagnóstico o tratamiento autónomo; requiere supervisión de un profesional sanitario licenciado.
- Riesgo de alucinación: como todo LLM, puede generar información plausible pero incorrecta, especialmente en dominios de alto riesgo como la medicina. El comportamiento de rechazo mitiga parcialmente este riesgo, pero no lo elimina.
- Limitaciones de idioma: solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin adaptación adicional.
- Contexto limitado: la longitud de contexto no se especifica; si se usa con historiales clínicos largos, puede ser necesario truncar o resumir la información.
- Datos de entrenamiento no auditados: no se detalla la procedencia exacta de los corpus médicos, por lo que puede haber sesgos en la representación de ciertas poblaciones o enfermedades.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor recomienda un entorno controlado y con supervisión humana; no hay garantías de exactitud clínica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, lo que dificulta evaluar su fiabilidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kayodekosi/clinical-decision-support
- Repositorio del autor (no se proporciona URL directa, pero la model card menciona scripts y un espacio Gradio; el espacio demo se desplegaría en `kayodekosi/medical-clinical-decision-support-demo`).
- No se han encontrado papers ni publicaciones académicas asociadas a este modelo en los resultados de búsqueda.
