# sallya1c/sally-1.0

## Resumen

Sally-1.0 es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3-14B, desarrollado por el equipo de a1c-ai-agent. Está especializado en salud metabólica, longevidad y biomarcadores, y se presenta como un asistente conversacional orientado a aplicaciones médicas y de bienestar. El adaptador tiene un tamaño de repositorio de 0,4 GB y se distribuye bajo licencia Apache 2.0, aunque su acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

El modelo se ha entrenado mediante técnicas de fine-tuning supervisado (SFT) y optimización por preferencias (DPO), según indican las etiquetas del repositorio. Su pipeline es text-generation, y soporta idiomas inglés e indonesio. La integración con el ecosistema Sally (A1C Insights, Sally Console) sugiere que está pensado para ser desplegado como agente conversacional en aplicaciones de salud, con capacidades de integración vía REST y MCP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-14B (modelo base transformer) |
| Parametros totales | No disponible (el adaptador LoRA tiene menos de 1B; el modelo base tiene 14B) |
| Parametros activos | No disponible (MoE no aplica) |
| Longitud de contexto | No disponible (depende del modelo base; Qwen3-14B soporta 32K tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | en, id |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el transformer Qwen/Qwen3-14B, que es un modelo denso de 14 mil millones de parámetros con arquitectura transformer. Al ser un adaptador, no se modifican los pesos del modelo base, sino que se entrena un conjunto reducido de parámetros (del orden de millones) que se suman a las capas de atención y MLP. La información pública indica que se emplearon técnicas de SFT (supervised fine-tuning) y DPO (direct preference optimization), lo que sugiere una fase de entrenamiento supervisado seguida de un ajuste por preferencias humanas. No se han publicado detalles sobre la composición del dataset ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional, especializado en temas de salud metabólica, longevidad y biomarcadores.
- Soporte de tool calling / function calling, según lo indicado en el repositorio de GitHub (Sally Console, REST APIs y MCP).
- Capacidades multilingües limitadas: inglés e indonesio.
- Integración con el ecosistema Sally: puede conectarse con A1C Insights (aplicación de consumo) y Sally Console (plataforma para desarrolladores).
- Habilidades específicas documentadas en el repositorio GitHub: `metabolic_risk_score`, `supplement_grading`, `preventive_protocol` (aunque el propio repositorio indica que algunas están en roadmap y no deben sustituirse silenciosamente).

## Casos de uso

- **Asistente virtual de salud metabólica**: Sally puede responder preguntas sobre glucosa, insulina, hemoglobina glicosilada (A1C) y biomarcadores relacionados, ofreciendo una conversación natural y educativa para pacientes y profesionales.
- **Evaluación de riesgo metabólico**: mediante la habilidad `metabolic_risk_score`, el modelo puede calcular y explicar puntuaciones de riesgo compuestas a partir de datos del usuario.
- **Gradación de suplementos**: con `supplement_grading`, el modelo puede evaluar y clasificar suplementos según su evidencia, ayudando a tomar decisiones informadas.
- **Protocolos preventivos personalizados**: `preventive_protocol` permite generar planes de intervención adaptados a perfiles individuales, integrando datos de biomarcadores.
- **Chat de atención al cliente en aplicaciones de salud**: integrable en apps como A1C Insights para responder dudas frecuentes, guiar al usuario y derivar a profesionales si es necesario.
- **Desarrollo de agentes de salud**: mediante Sally Console, los desarrolladores pueden integrar las capacidades del modelo en sus propios agentes a través de REST APIs y MCP, creando asistentes especializados en longevidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,4 GB), pero la inferencia requiere cargar el modelo base Qwen3-14B completo.
- Para ejecutar Qwen3-14B en cuantización 4-bit, se estima una VRAM mínima de 8-10 GB; en FP16 se necesitarían alrededor de 28-32 GB.
- En GPU consumer: es posible ejecutarlo en RTX 4090 (24 GB) con cuantización de 4 bits, pero no en GPUs de menos de 8 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, y la plataforma FriendliAI (según la ficha de despliegue disponible en línea).
- La latencia y throughput dependen del hardware y del tamaño del modelo base; no se disponen de datos específicos del adaptador.

## Comparativa con modelos similares

No hay disponible una comparativa directa con otros modelos de salud metabólica o longevidad en la información proporcionada. Se puede señalar que, al estar basado en Qwen3-14B, hereda las capacidades generales del modelo base, pero no se han publicado datos comparativos con alternativas como Llama-3-8B o Mistral-7B en tareas médicas.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es gated; es necesario aceptar condiciones en HuggingFace antes de poder descargarlo o usarlo.
- **Dependencia del modelo base**: al ser un LoRA, requiere el modelo Qwen3-14B, que tiene sus propias limitaciones (sesgos, alucinaciones, etc.).
- **Idiomas limitados**: soporta únicamente inglés e indonesio; no está optimizado para español u otros idiomas.
- **Sin datos de rendimiento**: no se han publicado benchmarks ni evaluaciones independientes, por lo que su fiabilidad en entornos clínicos no está demostrada.
- **No es un dispositivo médico**: aunque se orienta a salud, no debe utilizarse para diagnóstico médico sin supervisión profesional.
- **Roadmap de habilidades**: algunas habilidades documentadas (como `metabolic_risk_score`) están en desarrollo y no deben sustituirse silenciosamente por otras, según el propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sallya1c/sally-1.0
- README del modelo: https://huggingface.co/sallya1c/sally-1.0/blob/main/README.md
- Repositorio de habilidades (GitHub): https://github.com/a1c-ai-agent/sally-skills
- Guía de habilidades (SKILL.md): https://github.com/a1c-ai-agent/sally-skills/blob/main/SKILL.md
- Página de despliegue en FriendliAI: https://friendli.ai/models/sallya1c/sally-1.0
