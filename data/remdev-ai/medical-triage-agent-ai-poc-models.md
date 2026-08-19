# RemDev-AI/medical-triage-agent-ai-poc-models

## Resumen

El modelo `RemDev-AI/medical-triage-agent-ai-poc-models` es un adaptador LoRA fine-tuneado mediante DPO (Direct Preference Optimization) sobre la base `Qwen/Qwen3-1.7B-Base`, desarrollado por el usuario RemDev-AI. Según el nombre del repositorio, el objetivo es un agente de triaje médico, aunque se trata de una prueba de concepto (POC) y la model card no proporciona ninguna información adicional sobre el propósito, los datos de entrenamiento o la evaluación.

La relevancia de este modelo radica en su enfoque: aplicar técnicas de fine-tuning eficiente (LoRA) y optimización por preferencias (DPO) sobre un modelo base pequeño (1.7B parámetros) para una tarea especializada. Sin embargo, la ausencia total de documentación técnica, métricas o ejemplos de uso limita seriamente su aplicabilidad práctica. No se especifican licencia, idiomas soportados ni requisitos de contexto, y el tamaño del repositorio (23.4 GB) sugiere que podría incluir los pesos completos del modelo base o artefactos adicionales, aunque no hay confirmación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen/Qwen3-1.7B-Base |
| Parametros totales | no disponible (el modelo base tiene 1.7B; el adaptador no se especifica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, pero no se indica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags), con estructura PEFT (adaptador) |

## Arquitectura y entrenamiento

La información disponible es mínima. Se trata de un adaptador LoRA (Low-Rank Adaptation) entrenado con DPO, una técnica que optimiza el modelo para alinear sus respuestas con preferencias humanas o anotaciones automáticas. El framework utilizado es `transformers` junto con `trl` (Transformer Reinforcement Learning) y `peft` (versión 0.19.1). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, los hiperparámetros del entrenamiento (tasa de aprendizaje, número de épocas, etc.) ni el régimen de precisión (fp16, bf16, etc.). Tampoco se indica si hubo etapas previas de fine-tuning supervisado (SFT) antes del DPO.

Al ser un adaptador sobre Qwen3-1.7B-Base, hereda la arquitectura transformer del modelo base, pero no se especifican innovaciones técnicas propias.

## Capacidades

- No se dispone de información oficial sobre las capacidades específicas del modelo.
- Por su nombre, se infiere que está orientado a tareas de triaje médico (clasificación de síntomas, priorización de urgencias), pero no hay evidencia documentada.
- Al estar basado en Qwen3-1.7B-Base, podría heredar capacidades genéricas de generación de texto y razonamiento, aunque no se confirma.
- No se menciona soporte para tool calling, agentes, visión, audio ni modos de pensamiento.
- No se especifican idiomas soportados.

## Casos de uso

Dado que no hay documentación, los casos de uso son hipotéticos y no verificados:

- Triaje médico automatizado: el modelo podría clasificar descripciones de síntomas y sugerir niveles de urgencia, pero no hay datos que validen su precisión o seguridad clínica.
- Asistencia en consultas de atención primaria: podría usarse como apoyo para filtrar consultas, pero requiere validación médica exhaustiva.
- Investigación en fine-tuning médico: sirve como ejemplo de aplicación de LoRA y DPO sobre un modelo pequeño para un dominio específico.
- Prototipos educativos: útil para demostrar el flujo de trabajo de adaptación de modelos con PEFT y TRL.
- Experimentación con DPO: puede utilizarse para estudiar el efecto de la optimización por preferencias en tareas especializadas.

Ninguno de estos casos está respaldado por el autor, y su uso en producción médica sería irresponsable sin evaluación clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware por parte del autor.
- Al tratarse de un adaptador LoRA, la inferencia requiere cargar el modelo base Qwen3-1.7B-Base (aproximadamente 3.4 GB en FP16) más el adaptador. El tamaño del repositorio (23.4 GB) sugiere que podría contener pesos completos o artefactos adicionales, lo que aumentaría los requisitos.
- Con el modelo base en FP16, una GPU con al menos 6-8 GB de VRAM sería suficiente para inferencia básica (ej. RTX 3060, RTX 4060).
- Para cuantización GGUF o AWQ, se podría reducir la huella de memoria, pero no se ofrecen dichos formatos.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python. No hay soporte nativo para vLLM, Ollama o llama.cpp sin conversión previa.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables específicos para triaje médico con estas características, y el autor no proporciona referencias.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre datos de entrenamiento, evaluación o rendimiento, lo que impide cualquier uso fiable.
- Riesgo de sesgos: al no conocer el dataset, no se pueden evaluar sesgos demográficos, lingüísticos o clínicos.
- Alto riesgo de alucinación: un modelo de 1.7B sin validación médica puede generar respuestas incorrectas o peligrosas en contextos de salud.
- Licencia no especificada: no se puede determinar si es permitido su uso comercial o la redistribución.
- Sin garantías de seguridad: no ha pasado ninguna evaluación de seguridad o alineación clínica.
- Limitaciones de contexto: al depender del modelo base, la ventana de contexto es la de Qwen3-1.7B-Base (no especificada aquí), pero probablemente limitada.
- Formato de pesos: solo safetensors, sin cuantizaciones listas para producción.

## Enlaces

- [HuggingFace: RemDev-AI/medical-triage-agent-ai-poc-models](https://huggingface.co/RemDev-AI/medical-triage-agent-ai-poc-models)
