# saurabhb2412/qwen3-4b-clinical-treatment

## Resumen

qwen3-4b-clinical-treatment es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-4B, publicado por el usuario saurabhb2412 en HuggingFace. Su función es actuar como componente de soporte a la decisión clínica: recibe como entrada un caso de paciente junto con un diagnóstico diferencial ya priorizado (en el formato de salida de otro modelo del mismo autor, qwen2.5-1.5b-ddx-ranker) y devuelve como salida un plan de tratamiento y la especialidad médica correspondiente, estructurados en JSON.

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) sobre un conjunto de 891 pares anclados en guías clínicas ICMR, complementados con 18.000 ejemplos auxiliares de razonamiento médico con licencia apache-2.0, siguiendo la estrategia de datos auxiliares descrita en el paper ReasonMed (arXiv:2506.09513). El repositorio ocupa 0,3 GB y se distribuye en formato safetensors compatible con la librería PEFT, lo que implica que requiere cargar el modelo base Qwen3-4B por separado.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación, no de un dispositivo médico, con solo 45 descargas y sin likes en el momento de la consulta. Resulta útil como ejemplo de pipeline modular de razonamiento clínico (ranker de diagnósticos diferenciales más generador de planes de tratamiento) y como caso práctico de fine-tuning LoRA sobre un modelo de 4.000 millones de parámetros con datos de dominio sanitario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4.000 millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B, no especificada en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre Qwen/Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. El adaptador no modifica la arquitectura subyacente: añade matrices de bajo rango entrenables sobre las capas del modelo base, que permanece congelado. El repositorio solo contiene los pesos del adaptador (0,3 GB), por lo que la inferencia requiere descargar y cargar Qwen3-4B por separado y aplicar el adaptador mediante la librería PEFT.

El entrenamiento se realizó por SFT sobre el dataset saurabhb2412/clinical-treatment-sft, compuesto por 891 pares de caso clínico y plan de tratamiento anclados en guías ICMR, más 18.000 ejemplos auxiliares de razonamiento médico con licencia apache-2.0. La estrategia de datos auxiliares sigue la descripción del paper ReasonMed (arXiv:2506.09513). No se especifican en la model card el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. La tarea está formulada como generación estructurada: la salida esperada es un JSON con el plan de tratamiento y la especialidad médica.

## Capacidades

- Generación de planes de tratamiento a partir de un caso de paciente y un diagnóstico diferencial priorizado.
- Clasificación de la especialidad médica asociada al caso, incluida en la salida JSON.
- Generación de salida estructurada en JSON, con validación del 100 % en el conjunto de evaluación retenido.
- Razonamiento clínico guiado por guías médicas (ICMR), aprendido durante el SFT.
- Integración en pipelines modulares: encaja como segunda etapa tras un modelo de ranking de diagnósticos diferenciales.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Segunda etapa de un pipeline de soporte a la decisión clínica: tras un modelo de ranking de diagnósticos diferenciales, este adaptador recibe el caso y el diagnóstico priorizado y genera un plan de tratamiento estructurado en JSON, listo para ser consumido por un sistema downstream.
- Prototipado de asistentes clínicos en investigación: permite experimentar con generación de planes de tratamiento guiados por guías ICMR sin entrenar un modelo desde cero, gracias al bajo coste de un adaptador LoRA de 0,3 GB.
- Enrutamiento a especialidad médica: la salida incluye la especialidad correspondiente, lo que permite clasificar casos y derivarlos en sistemas de triaje o gestión de consultas.
- Evaluación de estrategias de datos auxiliares: sirve como referencia reproducible de la técnica descrita en ReasonMed para equipos que investigan cómo combinar pocos datos de dominio con datos auxiliares de razonamiento.
- Generación de salida estructurada para integración en APIs: el formato JSON validado al 100 % en el conjunto retenido facilita el consumo por parte de aplicaciones que necesitan campos parseables en lugar de texto libre.
- Docencia y experimentación con LoRA en dominio sanitario: útil en entornos académicos para estudiar el comportamiento de adaptadores de bajo rango sobre modelos de 4.000 millones de parámetros en tareas clínicas acotadas.

## Benchmarks y rendimiento

Evaluación retenida sobre guías clínicas (120 de 120 pares, decodificación greedy), según la model card:

| Métrica | Resultado |
|---|---|
| Validez del JSON | 100,0 % |
| Coincidencia top-1 de diagnóstico | 100,0 % |
| Coincidencia de especialidad | 64,2 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB, pero la inferencia requiere cargar el modelo base Qwen3-4B completo.
- VRAM estimada para el modelo base en precisión completa (fp16/bf16): aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contextos moderados.
- En cuantización de 8 bits, el modelo base requiere alrededor de 4-5 GB de VRAM; en 4 bits, alrededor de 2,5-3 GB, más overhead.
- GPU recomendadas: A100 o H100 para despliegues de producción con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para desarrollo e inferencia en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 4 u 8 bits (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: vLLM o TGI con soporte de adaptadores PEFT, llama.cpp u Ollama si se convierte el modelo fusionado a GGUF, y transformers más peft para prototipado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-4b-clinical-treatment | 4.000 M (base) + LoRA | no disponible | Apache 2.0 | safetensors (PEFT) | Adaptador clínico especializado; requiere el modelo base |
| Qwen/Qwen3-4B | 4.000 M | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base generalista; no especializado en clínica |
| saurabhb2412/qwen2.5-1.5b-ddx-ranker | 1.500 M | no disponible | no disponible | no disponible | Etapa previa del mismo pipeline: ranking de diagnósticos diferenciales |

No se dispone de datos de rendimiento de benchmarks estándar para comparar directamente con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica explícitamente que no es un dispositivo médico; no debe usarse para decisiones clínicas reales sin validación regulatoria y supervisión profesional.
- La coincidencia de especialidad en el conjunto retenido es del 64,2 %, lo que implica un margen de error considerable en esa salida.
- El conjunto de evaluación es muy pequeño (120 pares) y procede de las mismas guías ICMR usadas en el entrenamiento, por lo que los resultados pueden no generalizar a otras poblaciones, sistemas sanitarios o guías clínicas.
- Riesgo de alucinación inherente a los modelos generativos: puede producir planes de tratamiento plausibles pero incorrectos, especialmente fuera del dominio cubierto por las guías ICMR.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con guías de un contexto sanitario concreto, puede reflejar sesgos de esa fuente.
- Idiomas soportados no especificados; el modelo base Qwen3-4B es multilingüe, pero el adaptador se ha entrenado presumiblemente en inglés y su comportamiento en castellano no está validado.
- Licencia Apache 2.0, que permite uso comercial del adaptador, pero el modelo base Qwen3-4B debe cumplir su propia licencia.
- Solo 45 descargas y nula tracción comunitaria: no hay evidencia de uso en producción ni reportes independientes de calidad.
- No se documentan requisitos de contexto, cuantizaciones soportadas ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saurabhb2412/qwen3-4b-clinical-treatment
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo previo del pipeline (ranker de diagnósticos diferenciales): https://huggingface.co/saurabhb2412/qwen2.5-1.5b-ddx-ranker
- Dataset de entrenamiento: https://huggingface.co/datasets/saurabhb2412/clinical-treatment-sft
- Paper ReasonMed (estrategia de datos auxiliares): https://arxiv.org/abs/2506.09513
- ML Intern (herramienta con la que se construyó el modelo): https://hf.co/chat?mode=ml-intern
