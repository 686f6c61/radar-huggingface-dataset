# JoTalbot/ua-legal-lm-ft

## Resumen

ua-legal-lm-ft es un adaptador LoRA desarrollado por JoTalbot sobre el modelo base Qwen/Qwen2.5-0.5B, fine-tuneado específicamente para el dominio legal ucraniano. El modelo se entrenó durante 2000 pasos con datos legales ucranianos de acceso público, alcanzando una pérdida de validación de 0.5201. Su objetivo es proporcionar una capacidad de generación de texto jurídico en ucraniano con un coste computacional mínimo, aprovechando la eficiencia de un modelo pequeño (0.5B parámetros) y la técnica de adaptación de bajo rango (LoRA). La relevancia actual radica en la necesidad de herramientas de IA especializadas en idiomas y dominios con pocos recursos, como el ucraniano legal, donde los modelos multilingües grandes no siempre ofrecen la precisión necesaria. El repositorio incluye el adaptador en el directorio `adapter/` y los pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con adaptador LoRA |
| Parametros totales | 494.032.768 (modelo base + adaptador fusionado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32K, pero no se confirma en la informacion del adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (uk) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward. El entrenamiento se llevó a cabo durante 2000 pasos sobre un conjunto de datos legales ucranianos compuesto únicamente por información legalmente publicada y de acceso abierto, según indica la model card. No se especifican detalles adicionales como el tamaño del dataset, la tasa de aprendizaje, el rango de LoRA o si se aplicaron técnicas de alineación como RLHF o DPO. La pérdida de validación reportada es de 0.5201, ligeramente inferior a la versión anterior publicada (0.529), lo que sugiere una mejora incremental en el ajuste.

## Capacidades

- Generación de texto en ucraniano especializado en el dominio legal (redacción de documentos, resúmenes, respuestas a consultas jurídicas).
- Conversación multi-turno básica gracias al entrenamiento con datos conversacionales (tag `conversational`).
- Procesamiento de textos legales de Ucrania, incluyendo terminología jurídica específica.
- No se mencionan capacidades de tool calling, function calling, razonamiento multi-paso, visión o audio.
- Al ser un modelo de 0.5B, su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor escala.

## Casos de uso

- Asistencia legal automatizada para ciudadanos ucranianos: el modelo puede responder preguntas frecuentes sobre procedimientos legales, derechos y obligaciones, aunque con limitaciones de precisión por su tamaño.
- Clasificación y etiquetado de documentos legales: dado su entrenamiento en datos jurídicos, puede ayudar a categorizar contratos, sentencias o normativas en ucraniano.
- Redacción de borradores de documentos legales simples: como contratos de arrendamiento o cartas de reclamación, con revisión humana posterior.
- Extracción de información de textos legales: identificación de fechas, partes, montos y cláusulas relevantes en documentos ucranianos.
- Chatbots de atención al cliente en despachos de abogados ucranianos: integrado en sistemas de mensajería para derivar consultas iniciales.
- Herramientas educativas para estudiantes de derecho en Ucrania: generación de ejemplos y explicaciones de conceptos legales básicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de validación (0.5201) durante el entrenamiento, que no es comparable directamente con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.5B, en FP16 ocupa aproximadamente 1 GB de VRAM; con cuantización a 8 bits o 4 bits, puede reducirse a 0.5-0.7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad.
- Cabe en GPUs de consumo (gama baja y media) y en dispositivos edge.
- Opciones de despliegue: al ser un modelo basado en Qwen2.5, es compatible con vLLM, llama.cpp, Ollama, TGI y Transformers de HuggingFace. El adaptador LoRA puede cargarse con PEFT.
- Latencia y throughput: no se dispone de datos medidos; en una GPU moderna (RTX 3090) se espera una latencia de decodificación de unos 10-20 ms por token, y en CPU de 100-300 ms por token.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para el dominio legal ucraniano. Como referencia, se puede comparar con el modelo base Qwen2.5-0.5B (sin fine-tuning) y con otros modelos legales multilingües como LegalBERT (que no es generativo) o modelos más grandes como LLaMA-3-8B fine-tuneado en legal, pero no hay datos de rendimiento de ua-legal-lm-ft frente a ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Tamaño reducido (0.5B): la capacidad de razonamiento y comprensión es limitada, lo que puede provocar respuestas incorrectas o incompletas en consultas legales complejas.
- Riesgo de alucinación: como todo modelo generativo, puede inventar citas legales, artículos o referencias que no existen.
- Sesgos: al entrenarse con datos legales ucranianos, puede reflejar sesgos presentes en la legislación o en los documentos utilizados.
- Idioma: solo soporta ucraniano; no se ha entrenado para otros idiomas.
- Licencia no especificada: no se indica la licencia del adaptador ni del modelo base, lo que genera incertidumbre sobre su uso comercial. El modelo base Qwen2.5-0.5B tiene licencia Apache 2.0, pero el adaptador no declara una.
- Privacidad: la model card afirma que solo se usaron datos legalmente publicados, pero no se detalla el proceso de anonimización.
- Sin garantías de precisión legal: no debe utilizarse como sustituto de asesoramiento legal profesional.

## Enlaces

- HuggingFace: https://huggingface.co/JoTalbot/ua-legal-lm-ft
- Repositorio GitHub del autor: https://github.com/JoTalbot/ukraine
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Página de rankings de IA legal (referencia general): https://llm-stats.com/leaderboards/best-ai-for-legal
