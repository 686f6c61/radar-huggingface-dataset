# jonleed/clinical-note-bart-lora

## Resumen

`jonleed/clinical-note-bart-lora` es un adaptador LoRA (r=8, alpha=64) entrenado sobre el modelo base `facebook/bart-base` (~140 millones de parámetros) para resumir diálogos médico-paciente en notas clínicas estructuradas tipo EHR (historia de la enfermedad actual). El modelo fue desarrollado por jonleed como parte del proyecto Medical Dialogue Summary (mayo de 2025), y es un espejo del trabajo original de `mdlam/clinical-note-model` con una model card ampliada. El adaptador se entrenó con el dataset MTS-Dialog (MEDIQA-Chat 2023), que contiene aproximadamente 1.700 diálogos de entrenamiento.

El modelo resuelve el problema de la generación automática de notas clínicas a partir de conversaciones médico-paciente, una tarea de alto valor práctico en entornos sanitarios donde la documentación consume tiempo clínico. Su relevancia radica en demostrar que el ajuste fino con LoRA sobre un modelo compacto de secuencia a secuencia puede lograr resultados razonables en resumen clínico sin necesidad de recursos computacionales masivos, en una época anterior al dominio de los grandes modelos de lenguaje como enfoque por defecto.

La licencia es MIT, el formato de pesos es safetensors (adaptadores PEFT) y el pipeline declarado es de summarization. El modelo está pensado como proyecto educativo y de investigación, no como dispositivo médico validado clínicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART-base (seq2seq, encoder-decoder transformer) |
| Parametros totales | ~140 millones (base) + adaptador LoRA |
| Parametros activos | ~0,3 millones (adaptador LoRA, r=8, alpha=64, dropout=0.01) |
| Longitud de contexto | 1024 tokens (tokens max de BART-base) |
| Tipos de cuantizacion | No disponible (pesos en fp32/fp16, safetensors) |
| Idiomas soportados | Ingles (no especificado explicitamente; dataset MTS-Dialog en ingles) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo base es `facebook/bart-base`, un transformer encoder-decoder de aproximadamente 140 millones de parámetros. Sobre este se aplicó un adaptador LoRA mediante la librería PEFT, con r=8, alpha=64 y dropout=0.01, dirigido a los módulos `q_proj` y `v_proj` de las capas de atención. Esto reduce significativamente el número de parámetros entrenables, lo que permite un fine-tuning eficiente con recursos computacionales limitados.

El entrenamiento se realizó sobre el split de entrenamiento del dataset MTS-Dialog (abachaa/MTS-Dialog), parte del desafío MEDIQA-Chat 2023, que contiene aproximadamente 1.700 diálogos médico-paciente. No se especifica si se usaron técnicas de RLHF o DPO; el proceso es un fine-tuning supervisado estándar. La decodificación se configura con beam=4, temperatura=0.9, top_p=0.95 y no_repeat_ngram_size=4. No se han publicado detalles adicionales sobre el número de épocas, el tamaño de batch o el learning rate en la información disponible.

## Capacidades

- Generación de resúmenes de diálogos médico-paciente en formato de notas clínicas estructuradas (sección de historia de la enfermedad actual, HPI).
- Resumen de secuencias de texto con contexto de hasta 1024 tokens, adecuado para conversaciones de consulta típicas.
- Capacidad multilingüe: no especificada; el modelo fue entrenado con datos en inglés y probablemente solo funciona bien en ese idioma.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-step explícito; es un modelo puramente de generación de resúmenes.
- No tiene modo de pensamiento (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- **Automatización de notas clínicas en consultas**: el modelo puede generar un borrador de la sección HPI a partir de la transcripción de un diálogo médico-paciente, reduciendo el tiempo de documentación manual. Se integraría en un pipeline de transcripción de voz a texto seguido de este modelo.
- **Soporte a la documentación médica en entornos de investigación**: en estudios clínicos o proyectos de NLP médica, el modelo puede pre-resumir diálogos para que los anotadores humanos revisen y corrijan, acelerando la creación de datasets etiquetados.
- **Educación y demostración de PEFT**: como proyecto educativo, sirve para ilustrar cómo aplicar LoRA a un modelo de secuencia a secuencia en el dominio médico, reproducible con `compute_metrics.py` del repositorio.
- **Sistema de resumen de historias de pacientes**: en un entorno controlado y no clínico, el modelo puede extraer la sección de historia de la enfermedad de diálogos simulados para integrarse en prototipos de EHR.
- **Pruebas de concepto de IA en salud**: como modelo de referencia para comparar con otros enfoques de summarización clínica (por ejemplo, BART completo o LLMs más grandes), en entornos académicos.
- **Generación de notas para telemedicina**: en plataformas de teleconsulta, el modelo podría generar un resumen inicial de la conversación para que el profesional lo valide y complete, aunque con las limitaciones de longitud de contexto.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados ROUGE en el test set de MTS-Dialog, comparados contra las notas de referencia:

| Fuente | ROUGE-1 | ROUGE-2 | ROUGE-L | ROUGE-Lsum |
|---|---|---|---|---|
| Reportado en el proyecto (mayo 2025) | — | — | 0.43 | — |
| Re-evaluación (agosto 2026, 100 ejemplos, seed=42) | 0.290 | 0.114 | 0.252 | 0.259 |

La re-evaluación es reproducible mediante el script `compute_metrics.py` del repositorio del proyecto. No se han publicado comparaciones con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base BART-base tiene ~140M de parámetros; con el adaptador LoRA fusionado, en FP16 ocupa aproximadamente 280-300 MB de memoria. Para inferencia con batch pequeño (1-4 muestras), se requiere menos de 1 GB de VRAM en FP16.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4090, etc.). No requiere GPUs de datacenter.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna, incluso en CPUs con uso de llama.cpp (aunque el modelo es de la familia transformers, no GGUF).
- **Opciones de despliegue**: se puede servir con `transformers` y `peft`, cargando el adaptador con `PeftModel.from_pretrained` y `merge_and_unload()`. No se ha reportado compatibilidad con vLLM, TGI u Ollama, aunque al ser un modelo seq2seq pequeño, se podría adaptar con frameworks que soporten BART.
- **Latencia y throughput**: no disponible. Se estima latencia baja (menos de 1 segundo por secuencia de 128 tokens en GPU consumer), pero no se han publicado mediciones formales.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría en la información proporcionada. Se podría comparar con el modelo completo `facebook/bart-base` sin adaptación (rendimiento inferior en la tarea), o con el proyecto original `mdlam/clinical-note-model` (mismo adaptador, model card ampliada). También existen trabajos de investigación sobre BART con LoRA para resumen médico (por ejemplo, el paper "Medical Text Summarization Using BART with LoRA-Based Parameter Efficient Fine-Tuning"), pero no se reportan números comparativos en la información disponible.

## Limitaciones y advertencias

- **No es un dispositivo médico**: los resultados no están validados clínicamente; no debe usarse en entornos clínicos reales sin supervisión humana y validación regulatoria.
- **Alucinaciones**: como todo modelo de generación de texto, puede inventar detalles clínicos no presentes en el diálogo de entrada. La evaluación de ROUGE no garantiza fidelidad clínica.
- **Sesgos**: el dataset MTS-Dialog proviene de un dominio específico de diálogos médico-paciente en inglés; el modelo puede tener sesgos lingüísticos, culturales y de estilo de documentación que no generalizan a otros contextos.
- **Longitud de contexto limitada**: con 1024 tokens de entrada, diálogos largos o múltiples turnos extensos pueden truncarse, perdiendo información relevante.
- **Idiomas**: solo se ha entrenado con datos en inglés; no se espera buen rendimiento en otros idiomas.
- **Rendimiento moderado**: los valores de ROUGE (ROUGE-L 0.43 reportado, re-evaluación 0.252) son modestos en comparación con modelos de resumen modernos; no es adecuado para producción sin un sistema de revisión humana.
- **Licencia**: MIT, permisiva para uso comercial, pero con la advertencia de uso clínico no validado.

## Enlaces

- [Modelo en HuggingFace: jonleed/clinical-note-bart-lora](https://huggingface.co/jonleed/clinical-note-bart-lora)
- [Repositorio del proyecto Medical-Dialogue-Summary (GitHub)](https://github.com/jonleed/Medical-Dialogue-Summary)
- [Dataset MTS-Dialog (abachaa/MTS-Dialog)](https://github.com/abachaa/MTS-Dialog)
- [Modelo original: mdlam/clinical-note-model](https://huggingface.co/mdlam/clinical-note-model)
- [Paper relacionado: Medical Text Summarization Using BART with LoRA (PDF)](https://www.avepubs.com/uploads/articles/174965631566744.%20ATIHL-89-2024.pdf)
- [Workshop on Patient-Oriented Language Processing (CL4Health 2025)](https://aclanthology.org/events/cl4health-2025/)
