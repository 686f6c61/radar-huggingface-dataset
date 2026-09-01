# philgear/pocketgull-sentinel-peft

## Resumen

PocketGull Sentinel es un adaptador LoRA (PEFT) desarrollado por PocketGull LLC, con Phillip Gear como responsable de informática, que se monta sobre el modelo base `google/gemma-2-2b-it`. Su propósito es actuar como una puerta de seguridad determinista para la detección de emergencias clínicas antes de la generación de texto: identifica signos de ictus (BE-FAST), dolor torácico por síndrome coronario agudo (ACS) y crisis suicida (escala C-SSRS), además de auditar la seguridad de las prescripciones médicas según los estándares del ISMP (Instituto para Prácticas Seguras de Medicación), especialmente en lo relativo a errores decimales.

El adaptador fue afinado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos de dominio específico que cumplen con los estándares de desidentificación HIPAA §164.514 Safe Harbor. Se distribuye bajo licencia Apache 2.0 y está pensado para despliegue en entornos de cómputo local o en Vertex AI de Google Cloud, con diseño de retención cero de información sanitaria protegida (PHI). Aunque el modelo base tiene 2.600 millones de parámetros, el adaptador LoRA añade un número reducido de parámetros entrenables, lo que permite su ejecución en hardware modesto.

Relevante por su enfoque en seguridad clínica y cumplimiento normativo, PocketGull Sentinel se posiciona como una herramienta de asistencia al profesional sanitario (definida como CDS no dispositivo según la FDA 520(o)), no como un sustituto del juicio clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma-2-2b-it) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene 2,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la del modelo base no se especifica en la documentación del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el modelo base en bfloat16; no se documentan cuantizaciones específicas) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT (adaptadores LoRA, probablemente safetensors; no se especifica en la documentación) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Gemma-2-2b-it de Google, un transformer decoder-only con 2,6 mil millones de parámetros y atención global. Sobre este modelo base se ha aplicado un adaptador LoRA (Low-Rank Adaptation) que modifica las matrices de atención y las capas de proyección sin necesidad de reentrenar todos los pesos. El entrenamiento se realizó mediante Direct Preference Optimization (DPO), una técnica de alineación que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa separado. Los datos de entrenamiento provienen de conjuntos clínicos de dominio público como NIH MedQuAD (preguntas y respuestas médicas) y WHO mhGAP (programa de acción para la salud mental de la OMS), procesados para cumplir con la norma HIPAA Safe Harbor de desidentificación.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset ni los hiperparámetros del LoRA (rango, alpha, dropout). La documentación indica que el adaptador se diseñó como una "puerta de seguridad determinista", lo que sugiere que el entrenamiento se centró en la clasificación y detección de patrones de emergencia más que en la generación libre de texto. La inferencia se realiza con temperatura baja (0,2) para favorecer respuestas consistentes.

## Capacidades

- Detección de signos de ictus según el protocolo BE-FAST (Balance, Eyes, Face, Arm, Speech, Time) a partir de descripciones de síntomas.
- Identificación de dolor torácico compatible con síndrome coronario agudo (ACS) en textos de triaje.
- Evaluación de riesgo de crisis suicida mediante la escala C-SSRS (Columbia Suicide Severity Rating Scale).
- Auditoría de seguridad de órdenes de prescripción: detección de errores decimales (p. ej., "0.5 mg" vs ".5 mg") siguiendo las recomendaciones del ISMP.
- Evaluación de interacciones farmacológicas relevantes (p. ej., hierba de San Juan y warfarina) mediante análisis de metabolismo CYP450.
- Generación de texto clínico con alineación a seguridad, gracias al ajuste con DPO.
- Funcionamiento como adaptador ligero sobre Gemma-2-2b-it, lo que permite integración en pipelines de Transformers y PEFT.

## Casos de uso

- Triaje de urgencias en servicios de emergencia: el modelo puede analizar la descripción de un paciente (debilidad en un brazo, desviación facial, habla arrastrada) y emitir una alerta inmediata sobre posible ictus, ayudando a priorizar la atención.
- Revisión de órdenes médicas electrónicas: al recibir una orden de prescripción, el adaptador audita la notación decimal y señala posibles errores de dosificación antes de que se administre el medicamento.
- Soporte a la evaluación de riesgo suicida en consultas de salud mental: el modelo puede analizar las respuestas del paciente a preguntas de cribado y clasificar el nivel de urgencia según C-SSRS.
- Asistente clínico en entornos con recursos limitados: al ser un adaptador pequeño sobre un modelo de 2B, puede ejecutarse en portátiles o servidores modestos, permitiendo su uso en clínicas rurales o en países con infraestructura limitada.
- Herramienta de formación para estudiantes de medicina: puede utilizarse para simular casos de emergencia y practicar la identificación de banderas rojas en textos clínicos.
- Integración en sistemas de registro electrónico de salud (EHR) como capa de seguridad adicional: el adaptador puede procesar notas clínicas en tiempo real y alertar sobre posibles omisiones de signos de emergencia.
- Despliegue en entornos de cómputo perimetral (edge) para dispositivos móviles, dado su bajo requisito de memoria y su diseño de retención cero de PHI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni evaluaciones clínicas específicas reportadas en la model card o en los repositorios vinculados.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Gemma-2-2b-it, el requisito principal es el del modelo base: aproximadamente 5 GB de VRAM en bfloat16 para inferencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, por ejemplo NVIDIA RTX 3060, RTX 4070, o GPUs de datacenter como T4 o A10.
- Es viable en GPUs de consumo (RTX 3060 o superiores) y en entornos de CPU con cuantización, aunque no se documentan cuantizaciones específicas para el adaptador.
- Opciones de despliegue: el ejemplo de código usa Transformers y PEFT con `device_map="auto"`, lo que permite ejecución en GPU o CPU. También se menciona compatibilidad con Google Cloud Vertex AI.
- No se proporcionan datos de latencia ni throughput. Se recomienda usar `max_new_tokens=256` y `temperature=0.2` según el ejemplo de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la documentación modelos comparables de la misma categoría (adaptadores clínicos de seguridad sobre Gemma-2-2b). Se podría comparar con el modelo base Gemma-2-2b-it sin adaptador, pero el adaptador está especializado en tareas de detección de emergencias y no se dispone de métricas comparativas.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no es adecuado para uso clínico en otros idiomas sin adaptación.
- No se han publicado evaluaciones de seguridad ni estudios de sesgos. El uso en entornos clínicos reales debe realizarse bajo supervisión profesional y con validación adicional.
- Riesgo de alucinaciones inherente a los modelos generativos. Aunque el adaptador se enfoca en detección, las respuestas generadas pueden contener errores; la documentación lo clasifica como herramienta de apoyo, no como dispositivo médico.
- El entrenamiento se basa en conjuntos de datos públicos (NIH MedQuAD, WHO mhGAP) que pueden no cubrir todos los escenarios clínicos ni poblaciones diversas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma-2-2b-it tiene sus propias condiciones de uso (términos de Google), que deben revisarse.
- No se especifican detalles sobre la longitud de contexto efectiva del adaptador; se recomienda respetar los límites del modelo base.
- El adaptador no ha sido validado clínicamente ni aprobado por agencias reguladoras; su uso fuera del ámbito de investigación requiere evaluación local.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philgear/pocketgull-sentinel-peft
- Repositorio GitHub de PocketGull: https://github.com/philgear/pocketgull
- Organización en HuggingFace: https://huggingface.co/philgear/philgear
- Modelo multimodal de PocketGull (relacionado): https://huggingface.co/philgear/pocketgull-albatross-multimodal
- DOI Zenodo (proveniencia open science): https://doi.org/10.5281/zenodo.20647514
- Web de PocketGull: https://pocketgull.com
- Perfil de Phillip Gear en ORCID: https://orcid.org/0009-0008-1372-5381
