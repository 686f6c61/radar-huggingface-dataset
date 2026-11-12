# doiceladev/norma-erp-ecuador-qwen2.5-7b-lora

## Resumen

Norma ERP — Qwen2.5-7B-Instruct LoRA es un adaptador PEFT (LoRA) publicado por el usuario doiceladev sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Su objetivo es la asesoría jurídica laboral ecuatoriana y el cumplimiento de las metas del ODS 8 (Trabajo Decente y Crecimiento Económico) dentro del producto denominado Norma ERP. Cubre de forma explícita el Código del Trabajo de Ecuador, la Ley Orgánica de Discapacidades, la Ley Violeta y los Convenios de la OIT.

El adaptador se entrenó en bfloat16 con rango LoRA r=16 y lora_alpha=32, lo que supone 40.370.176 parámetros entrenables sobre un modelo base de 7.000 millones de parámetros. El repositorio ocupa 0,2 GB y contiene los pesos del adaptador en safetensors, la configuración de PEFT, un Modelfile para Ollama y un informe de telemetría del entrenamiento. El corpus de ajuste son 275 casos en formato ChatML.

Es relevante para equipos que construyen herramientas de gestión de personal o ERP en Ecuador y necesitan un modelo que responda con terminología y referencias normativas locales, sin tener que desplegar un modelo de mayor tamaño. La licencia Apache 2.0 del adaptador y del modelo base facilita su integración comercial, aunque el adaptador hereda las limitaciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7.000 millones (modelo base) + 40.370.176 parámetros entrenables en el adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la información proporcionada; el adaptador se entrenó en bfloat16 |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json; incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El ajuste se realizó con PEFT LoRA de rango r=16 y lora_alpha=32 en precisión bfloat16, lo que da 40.370.176 parámetros entrenables. El entrenamiento se ejecutó en una NVIDIA L4 con 22,03 GB de VRAM y duró 808,17 segundos. Las pérdidas finales reportadas son train loss 0.7676 y eval loss 0.5329.

El corpus de entrenamiento es `fine_tuning_ecuador_ods8_qwen.jsonl`, un conjunto estratificado de 275 casos en formato ChatML de "alta densidad", orientado a consultas sobre el Código del Trabajo, la Ley Orgánica de Discapacidades, la Ley Violeta y los Convenios OIT, así como a metas del ODS 8. No se especifica en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO; el ajuste parece ser exclusivamente supervisado sobre el corpus citado.

## Capacidades

- Generación de texto y respuesta a consultas en español sobre normativa laboral ecuatoriana.
- Asesoría sobre el Código del Trabajo de Ecuador, la Ley Orgánica de Discapacidades, la Ley Violeta y los Convenios de la OIT.
- Razonamiento aplicado a cumplimiento normativo y metas del ODS 8 en el contexto de un ERP.
- Formato de conversación ChatML, compatible con el pipeline de instrucciones de Qwen2.5-7B-Instruct.
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct (generación, razonamiento e instrucciones generales), aunque el adaptador está especializado en el dominio jurídico-laboral ecuatoriano.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada para el adaptador.
- Capacidades multilingües: limitadas a español según la model card; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente interna de RR. HH.: el adaptador puede responder consultas de empleados sobre vacaciones, permisos y prestaciones citando el Código del Trabajo, lo que reduce la carga del equipo legal en consultas repetitivas.
- Cálculo y revisión de liquidaciones laborales: integrado en el módulo de nómina de Norma ERP, el modelo puede explicar la base legal de cada concepto y señalar riesgos de incumplimiento antes de ejecutar el pago.
- Cumplimiento de la Ley Orgánica de Discapacidades: el modelo puede asistir en la verificación de cuotas de inclusión y en la redacción de justificaciones documentales para auditorías.
- Prevención de acoso y violencia laboral (Ley Violeta): generación de protocolos, guiones de actuación y textos informativos para comités internos, con referencias a la normativa aplicable.
- Reporte de sostenibilidad y ODS 8: el modelo puede redactar borradores de secciones de memoria de sostenibilidad alineadas con las metas de trabajo decente, partiendo de datos internos del ERP.
- Formación interna: generación de preguntas de evaluación y materiales didácticos sobre legislación laboral ecuatoriana para nuevos empleados del área de recursos humanos.
- Asistencia a equipos legales: borradores de memorandos y resúmenes de convenios OIT aplicables a la operación de la empresa, con terminología jurídica local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: train loss 0.7676, eval loss 0.5329, 40.370.176 parámetros entrenables, 808,17 segundos de entrenamiento en una NVIDIA L4 de 22,03 GB.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,2 GB en safetensors; el requisito real lo marca el modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para inferencia del modelo base: aproximadamente 14-16 GB en bfloat16/fp16 y en torno a 4-6 GB con cuantización de 4 bits (estimación general para un modelo de 7B; no confirmada en la información proporcionada).
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento), A100, H100 para despliegues de producción; RTX 4090 o RTX 3090 para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPUs de 8-12 GB; en bfloat16 requiere GPUs de 16 GB o más.
- Opciones de despliegue: PEFT, vLLM (según la model card) y Ollama mediante el Modelfile incluido (`ollama create norma-ecuador-ods8 -f Modelfile`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Norma ERP Qwen2.5-7B LoRA (este) | 7B + 40,37M LoRA | no disponible | Apache 2.0 | Derecho laboral ecuatoriano y ODS 8 |
| Qwen/Qwen2.5-7B-Instruct (base) | 7B | no disponible en la información proporcionada | Apache 2.0 | Instrucciones generales, multilingüe |
| Modelos jurídicos en español de 7B | no disponible | no disponible | no disponible | Asesoría legal general en español |

No se dispone de datos de benchmarks ni de modelos comparables específicos de derecho laboral ecuatoriano en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un ajuste sobre un corpus de 275 casos, puede reproducir sesgos del modelo base y del dataset.
- Riesgo de alucinación: alto en un dominio jurídico; el modelo puede citar artículos o interpretaciones inexactas. Requiere revisión por un profesional del derecho antes de cualquier uso vinculante.
- Volumen de entrenamiento reducido: 275 casos es un corpus pequeño, lo que limita la cobertura de casuísticas y puede provocar sobreajuste a los ejemplos vistos.
- Limitaciones de idioma: solo español; no se documenta soporte de otros idiomas.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva del adaptador; se hereda la del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-7B-Instruct.
- Caveat para producción: no hay benchmarks publicados ni métricas de calidad en tareas reales; se recomienda evaluar con un conjunto propio antes de desplegar.
- Fecha de creación del repositorio: 12 de noviembre de 2026; sin descargas ni likes en el momento de la consulta, lo que indica escasa validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/doiceladev/norma-erp-ecuador-qwen2.5-7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- PEFT: https://github.com/huggingface/peft
- Ollama: https://ollama.com
- vLLM: https://github.com/vllm-project/vllm
